import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Config } from './config'
import { hashPassword, randomId, sha256, shortId, sixDigits, verifyPassword } from './crypto'
import type { DB } from './db'
import { codeEmail, type Mailer } from './mail'
import { timingSafeEqual } from 'node:crypto'
import { closeOrder, decryptNotify, prepay, queryOrder, refundOrder, wxPayReady } from './wxpay'
import type { ShopForm, ShopTier } from './config'
import { PROVIDERS, providers as makeProviders, type Profile, type Provider, type ProviderId } from './oauth'

export interface Deps {
  cfg: Config
  db: DB
  mailer: Mailer
  /** Third-party providers (tests pass fakes). */
  providers?: Record<ProviderId, Provider>
  /** HTTP client for WeChat server APIs (tests pass a fake). */
  fetch?: typeof fetch
  now?: () => number
}

interface UserRow {
  id: string
  email: string | null
  email_verified: number
  password_hash: string | null
  name: string
  avatar_url: string | null
  created_at: number
}

const COOKIE = 'bs_session'
const SESSION_DAYS = 60
const CODE_TTL = 10 * 60_000
const CODE_MAX_ATTEMPTS = 5
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

const fail = (c: Context, status: 400 | 401 | 403 | 404 | 409 | 429 | 500 | 502, error: string) => c.json({ error }, status)

export function createApp(deps: Deps) {
  const { cfg, db, mailer } = deps
  const now = deps.now ?? (() => Date.now())
  const oauth = deps.providers ?? makeProviders(cfg)
  const siteOrigin = new URL(cfg.siteUrl).origin
  const app = new Hono().basePath('/api')

  // --- helpers ---------------------------------------------------------------
  const ipOf = (c: Context) => c.req.header('x-real-ip') || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const normEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '')
  const validPassword = (p: unknown): p is string => typeof p === 'string' && p.length >= 8 && p.length <= 128
  const getUser = (id: string) => db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined
  const userByEmail = (email: string) => db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined
  const publicUser = (u: UserRow) => {
    const ids = db.prepare('SELECT provider FROM identities WHERE user_id = ?').all(u.id) as { provider: string }[]
    return { id: u.id, email: u.email, name: u.name || u.email?.split('@')[0] || 'BeadSpark', avatarUrl: u.avatar_url, hasPassword: !!u.password_hash, providers: ids.map((i) => i.provider) }
  }

  /** New session: a cookie for the website; the token is also returned for the mini program. */
  const startSession = (c: Context, userId: string) => {
    const token = randomId(32)
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(sha256(token), userId, now() + SESSION_DAYS * DAY, now())
    setCookie(c, COOKIE, token, { httpOnly: true, secure: cfg.secureCookies, sameSite: 'Lax', path: '/', maxAge: SESSION_DAYS * 86400 })
    return token
  }
  /** Session token: website cookie, or `Authorization: Bearer …` from the mini program (no cookies there). */
  const tokenOf = (c: Context) => {
    const auth = c.req.header('authorization') ?? ''
    return auth.startsWith('Bearer ') ? auth.slice(7).trim() : getCookie(c, COOKIE)
  }
  const sessionUser = (c: Context): UserRow | undefined => {
    const token = tokenOf(c)
    if (!token) return undefined
    const s = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?').get(sha256(token)) as { user_id: string; expires_at: number } | undefined
    if (!s || s.expires_at < now()) return undefined
    return getUser(s.user_id)
  }
  const createUser = (fields: { email?: string | null; emailVerified?: boolean; passwordHash?: string | null; name?: string; avatarUrl?: string | null }) => {
    const id = randomId(12)
    db.prepare('INSERT INTO users (id, email, email_verified, password_hash, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id,
      fields.email ?? null,
      fields.emailVerified ? 1 : 0,
      fields.passwordHash ?? null,
      fields.name ?? '',
      fields.avatarUrl ?? null,
      now(),
    )
    return getUser(id)!
  }

  /** Check a code; counts the attempt. Returns true and marks it used when it matches. */
  const useCode = (email: string, purpose: string, code: unknown) => {
    const row = db
      .prepare('SELECT id, code_hash, expires_at, attempts FROM email_codes WHERE email = ? AND purpose = ? AND used = 0 ORDER BY created_at DESC LIMIT 1')
      .get(email, purpose) as { id: number; code_hash: string; expires_at: number; attempts: number } | undefined
    if (!row || row.expires_at < now() || row.attempts >= CODE_MAX_ATTEMPTS) return 'expired'
    db.prepare('UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?').run(row.id)
    if (typeof code !== 'string' || sha256(`${email}:${code.trim()}`) !== row.code_hash) return 'wrong'
    db.prepare('UPDATE email_codes SET used = 1 WHERE id = ?').run(row.id)
    return 'ok'
  }

  const tooMany = (key: string, limit: number, windowMs: number) => {
    const n = (db.prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE key = ? AND at > ?').get(key, now() - windowMs) as { n: number }).n
    return n >= limit
  }
  const noteAttempt = (key: string) => db.prepare('INSERT INTO login_attempts (key, at) VALUES (?, ?)').run(key, now())

  // --- protection: JSON bodies only from our own site --------------------------------
  app.use('*', async (c, next) => {
    const m = c.req.method
    const isCallback = /\/auth\/[a-z]+\/callback$/.test(c.req.path)
    // The origin check protects cookie sessions from other websites; the mini program (bearer token,
    // or its login call) isn't a website and its dev tools send their own Origin.
    const fromApp = (c.req.header('authorization') ?? '').startsWith('Bearer ') || c.req.path.endsWith('/auth/wxmp/login')
    if (m !== 'GET' && m !== 'HEAD' && !isCallback) {
      const origin = c.req.header('origin')
      if (origin && origin !== siteOrigin && !fromApp) return fail(c, 403, 'bad_origin')
      if (!(c.req.header('content-type') ?? '').includes('application/json')) return fail(c, 400, 'json_only')
    }
    c.header('Cache-Control', 'no-store')
    await next()
  })
  app.use('/designs/*', bodyLimit({ maxSize: 6 * 1024 * 1024, onError: (c) => fail(c, 400, 'too_large') }))
  app.use('/shares', bodyLimit({ maxSize: 2 * 1024 * 1024, onError: (c) => fail(c, 400, 'too_large') }))
  app.use('/auth/*', bodyLimit({ maxSize: 64 * 1024, onError: (c) => fail(c, 400, 'too_large') }))

  app.get('/health', (c) => c.json({ ok: true }))

  // --- email: codes, register, login, reset ----------------------------------
  app.post('/auth/email/send-code', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const email = normEmail(body.email)
    const purpose = body.purpose === 'reset' ? 'reset' : 'register'
    if (!EMAIL_RE.test(email) || email.length > 200) return fail(c, 400, 'bad_email')
    const user = userByEmail(email)
    if (purpose === 'register' && user?.password_hash) return fail(c, 409, 'email_taken')
    const ip = ipOf(c)
    const recent = db.prepare('SELECT created_at FROM email_codes WHERE email = ? ORDER BY created_at DESC LIMIT 1').get(email) as { created_at: number } | undefined
    if (recent && now() - recent.created_at < MINUTE) return fail(c, 429, 'wait_a_minute')
    const today = (db.prepare('SELECT COUNT(*) AS n FROM email_codes WHERE email = ? AND created_at > ?').get(email, now() - DAY) as { n: number }).n
    const fromIp = (db.prepare('SELECT COUNT(*) AS n FROM email_codes WHERE ip = ? AND created_at > ?').get(ip, now() - 60 * MINUTE) as { n: number }).n
    if (today >= 10 || fromIp >= 20) return fail(c, 429, 'too_many_codes')
    // Reset for an unknown address: answer the same as for a known one (don't reveal who has an account).
    if (purpose === 'reset' && !user) return c.json({ ok: true })
    const code = sixDigits()
    db.prepare('INSERT INTO email_codes (email, purpose, code_hash, expires_at, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(email, purpose, sha256(`${email}:${code}`), now() + CODE_TTL, ip, now())
    const m = codeEmail(code, purpose)
    try {
      await mailer.send(email, m.subject, m.text, m.html)
    } catch (err) {
      console.error('[mail] send failed', err)
      return fail(c, 502, 'mail_failed')
    }
    return c.json({ ok: true })
  })

  app.post('/auth/email/register', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const email = normEmail(body.email)
    if (!EMAIL_RE.test(email)) return fail(c, 400, 'bad_email')
    if (!validPassword(body.password)) return fail(c, 400, 'weak_password')
    const existing = userByEmail(email)
    if (existing?.password_hash) return fail(c, 409, 'email_taken')
    const r = useCode(email, 'register', body.code)
    if (r !== 'ok') return fail(c, 400, r === 'wrong' ? 'wrong_code' : 'code_expired')
    const passwordHash = await hashPassword(body.password)
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 40) : ''
    let user: UserRow
    if (existing) {
      // Signed up with Google / Facebook / Apple using this address before: add a password to that account.
      db.prepare('UPDATE users SET password_hash = ?, email_verified = 1, name = CASE WHEN name = "" THEN ? ELSE name END WHERE id = ?').run(passwordHash, name, existing.id)
      user = getUser(existing.id)!
    } else user = createUser({ email, emailVerified: true, passwordHash, name })
    startSession(c, user.id)
    return c.json({ user: publicUser(user) })
  })

  app.post('/auth/email/login', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const email = normEmail(body.email)
    const key = `login:${email}`
    const ipKey = `login-ip:${ipOf(c)}`
    if (tooMany(key, 10, 15 * MINUTE) || tooMany(ipKey, 50, 15 * MINUTE)) return fail(c, 429, 'too_many_attempts')
    const user = userByEmail(email)
    if (!user || typeof body.password !== 'string' || !(await verifyPassword(body.password, user.password_hash))) {
      noteAttempt(key)
      noteAttempt(ipKey)
      return fail(c, 401, 'invalid_credentials')
    }
    startSession(c, user.id)
    return c.json({ user: publicUser(user) })
  })

  app.post('/auth/email/reset', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const email = normEmail(body.email)
    if (!validPassword(body.password)) return fail(c, 400, 'weak_password')
    const user = userByEmail(email)
    if (!user) return fail(c, 400, 'code_expired')
    const r = useCode(email, 'reset', body.code)
    if (r !== 'ok') return fail(c, 400, r === 'wrong' ? 'wrong_code' : 'code_expired')
    db.prepare('UPDATE users SET password_hash = ?, email_verified = 1 WHERE id = ?').run(await hashPassword(body.password), user.id)
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id) // sign out everywhere else
    startSession(c, user.id)
    return c.json({ user: publicUser(getUser(user.id)!) })
  })

  app.get('/auth/me', (c) => {
    const u = sessionUser(c)
    return c.json({ user: u ? publicUser(u) : null })
  })

  app.post('/auth/logout', (c) => {
    const token = tokenOf(c)
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token))
    deleteCookie(c, COOKIE, { path: '/' })
    return c.json({ ok: true })
  })

  app.post('/auth/profile', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    const body = await c.req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 40) : ''
    if (!name) return fail(c, 400, 'bad_name')
    // Nicknames show on shared pieces: WeChat requires such text to pass its content check.
    if (await textIsRisky(u.id, name)) return fail(c, 400, 'risky_text')
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, u.id)
    return c.json({ user: publicUser(getUser(u.id)!) })
  })

  // --- third-party sign-in -----------------------------------------------------
  app.get('/auth/providers', (c) => c.json({ providers: PROVIDERS.filter((p) => oauth[p].configured) }))

  const redirectUri = (p: ProviderId) => `${cfg.siteUrl}/api/auth/${p}/callback`
  const safeNext = (n: unknown) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') && !n.includes('\\') ? n.slice(0, 300) : '/')

  app.get('/auth/:provider/start', (c) => {
    const p = c.req.param('provider') as ProviderId
    if (!PROVIDERS.includes(p) || !oauth[p].configured) return fail(c, 404, 'provider_not_configured')
    const state = randomId(24)
    db.prepare('DELETE FROM oauth_states WHERE expires_at < ?').run(now())
    db.prepare('INSERT INTO oauth_states (state, provider, next, expires_at) VALUES (?, ?, ?, ?)').run(state, p, safeNext(c.req.query('next')), now() + 15 * MINUTE)
    return c.redirect(oauth[p].authUrl(state, redirectUri(p)))
  })

  /** Find or create the user for a third-party profile, then sign in. */
  const signInWith = (c: Context, p: ProviderId, prof: Profile) => {
    const link = db.prepare('SELECT user_id FROM identities WHERE provider = ? AND provider_user_id = ?').get(p, prof.id) as { user_id: string } | undefined
    let user = link ? getUser(link.user_id) : undefined
    if (!user) {
      const email = prof.email ? normEmail(prof.email) : ''
      // Same verified email as an existing account → same person, link it.
      const byEmail = email && prof.emailVerified ? userByEmail(email) : undefined
      user = byEmail ?? createUser({ email: email && prof.emailVerified && !userByEmail(email) ? email : null, emailVerified: !!prof.emailVerified, name: prof.name?.slice(0, 40), avatarUrl: prof.avatarUrl })
      db.prepare('INSERT OR IGNORE INTO identities (provider, provider_user_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(p, prof.id, user.id, now())
    }
    if (!user.avatar_url && prof.avatarUrl) db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(prof.avatarUrl, user.id)
    startSession(c, user.id)
  }

  const callback = async (c: Context) => {
    const p = c.req.param('provider') as ProviderId
    const fields: Record<string, string> = { ...c.req.query() }
    if (c.req.method === 'POST') {
      const f = await c.req.parseBody().catch(() => ({}))
      for (const [k, v] of Object.entries(f)) if (typeof v === 'string') fields[k] = v
    }
    const back = (err: string) => c.redirect(`${cfg.siteUrl}/login/?error=${err}`)
    if (!PROVIDERS.includes(p) || !oauth[p].configured) return back('provider')
    const st = db.prepare('SELECT next, provider, expires_at FROM oauth_states WHERE state = ?').get(fields.state ?? '') as { next: string; provider: string; expires_at: number } | undefined
    if (st) db.prepare('DELETE FROM oauth_states WHERE state = ?').run(fields.state)
    if (!st || st.provider !== p || st.expires_at < now()) return back('state')
    if (!fields.code) return back('cancelled')
    try {
      const prof = await oauth[p].profile(fields.code, redirectUri(p), fields)
      signInWith(c, p, prof)
    } catch (err) {
      console.error(`[oauth:${p}]`, err)
      return back('provider_failed')
    }
    return c.redirect(`${cfg.siteUrl}${st.next}`)
  }
  app.get('/auth/:provider/callback', callback)
  app.post('/auth/:provider/callback', callback)

  // --- WeChat mini program ------------------------------------------------------
  const wx = deps.fetch ?? fetch
  const wxmpReady = () => !!(cfg.wxmp.appId && cfg.wxmp.secret)

  /** wx.login() code → session. Same person across the mini program and website WeChat login via unionid. */
  app.post('/auth/wxmp/login', async (c) => {
    if (!wxmpReady()) return fail(c, 404, 'provider_not_configured')
    const body = await c.req.json().catch(() => ({}))
    if (typeof body.code !== 'string' || !body.code) return fail(c, 400, 'bad_code')
    let r: { openid?: string; unionid?: string; errcode?: number; errmsg?: string }
    try {
      const q = new URLSearchParams({ appid: cfg.wxmp.appId, secret: cfg.wxmp.secret, js_code: body.code, grant_type: 'authorization_code' })
      r = await (await wx(`https://api.weixin.qq.com/sns/jscode2session?${q}`)).json()
    } catch (err) {
      console.error('[wxmp] jscode2session', err)
      return fail(c, 502, 'provider_failed')
    }
    if (!r.openid) {
      console.error('[wxmp] jscode2session', r.errcode, r.errmsg)
      return fail(c, 400, 'bad_code')
    }
    const pid = r.unionid || r.openid
    const link = db.prepare("SELECT user_id FROM identities WHERE provider IN ('wxmp', 'wechat') AND provider_user_id = ?").get(pid) as { user_id: string } | undefined
    let user = link ? getUser(link.user_id) : undefined
    if (!user) {
      user = createUser({ name: '微信用户' })
      db.prepare('INSERT OR IGNORE INTO identities (provider, provider_user_id, user_id, created_at) VALUES (?, ?, ?, ?)').run('wxmp', pid, user.id, now())
    }
    // The openid is needed to pay inside the mini program.
    db.prepare('INSERT INTO wx_openids (user_id, openid) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET openid = excluded.openid').run(user.id, r.openid)
    const token = startSession(c, user.id)
    return c.json({ token, user: publicUser(user) })
  })

  // Mini program code (小程序码) that opens a share — for share posters. Cached in memory.
  let wxToken: { value: string; expires: number } | null = null
  const qrCache = new Map<string, Uint8Array>()
  const accessToken = async () => {
    if (wxToken && wxToken.expires > now()) return wxToken.value
    const q = new URLSearchParams({ grant_type: 'client_credential', appid: cfg.wxmp.appId, secret: cfg.wxmp.secret })
    const r = (await (await wx(`https://api.weixin.qq.com/cgi-bin/token?${q}`)).json()) as { access_token?: string; expires_in?: number; errcode?: number; errmsg?: string }
    if (!r.access_token) throw new Error(`token ${r.errcode} ${r.errmsg}`)
    wxToken = { value: r.access_token, expires: now() + ((r.expires_in ?? 7200) - 300) * 1000 }
    return wxToken.value
  }
  /**
   * WeChat's text check (msgSecCheck) for words users type that others will see. True only when
   * WeChat says "risky"; when the check can't run (not a mini program user, WeChat unreachable)
   * the text is let through rather than blocking everyone.
   */
  const textIsRisky = async (userId: string, text: string): Promise<boolean> => {
    if (!wxmpReady()) return false
    const openid = (db.prepare('SELECT openid FROM wx_openids WHERE user_id = ?').get(userId) as { openid: string } | undefined)?.openid
    if (!openid) return false
    try {
      const res = await wx(`https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${await accessToken()}`, {
        method: 'POST',
        body: JSON.stringify({ content: text, version: 2, scene: 1, openid }),
      })
      const r = (await res.json()) as { errcode?: number; result?: { suggest?: string } }
      if (r.errcode) {
        console.warn('[wxmp] msg_sec_check', r.errcode)
        if (r.errcode === 40001 || r.errcode === 42001) wxToken = null
        return false
      }
      return r.result?.suggest === 'risky'
    } catch (e) {
      console.warn('[wxmp] msg_sec_check', (e as Error).message)
      return false
    }
  }

  app.get('/wxmp/qrcode/:id', async (c) => {
    if (!wxmpReady()) return fail(c, 404, 'provider_not_configured')
    const id = c.req.param('id')
    if (!/^[A-Za-z0-9]{6,32}$/.test(id) || !db.prepare('SELECT 1 FROM shares WHERE id = ?').get(id)) return fail(c, 404, 'not_found')
    let img = qrCache.get(id)
    if (!img) {
      try {
        const res = await wx(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${await accessToken()}`, {
          method: 'POST',
          body: JSON.stringify({ scene: id, page: 'pages/share/index', check_path: false, env_version: cfg.wxmp.envVersion, width: 430 }),
        })
        if ((res.headers.get('content-type') ?? '').includes('json')) throw new Error(await res.text())
        img = new Uint8Array(await res.arrayBuffer())
      } catch (err) {
        console.error('[wxmp] qrcode', err)
        wxToken = null
        return fail(c, 502, 'provider_failed')
      }
      if (qrCache.size > 500) qrCache.clear()
      qrCache.set(id, img)
    }
    return c.body(img as unknown as ArrayBuffer, 200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' })
  })

  // --- drafts ------------------------------------------------------------------
  app.get('/designs', (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    const rows = db.prepare('SELECT id, name, data, updated_at FROM designs WHERE user_id = ? ORDER BY updated_at DESC').all(u.id) as { id: string; name: string; data: string; updated_at: number }[]
    return c.json({ designs: rows.map((r) => ({ id: r.id, name: r.name, updatedAt: r.updated_at, data: JSON.parse(r.data) })) })
  })

  app.put('/designs/:id', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    const id = c.req.param('id')
    if (!/^[\w-]{1,40}$/.test(id)) return fail(c, 400, 'bad_id')
    const body = await c.req.json().catch(() => null)
    if (!body || typeof body.name !== 'string' || typeof body.data !== 'object' || !validPattern(body.data?.pattern)) return fail(c, 400, 'bad_design')
    const count = (db.prepare('SELECT COUNT(*) AS n FROM designs WHERE user_id = ?').get(u.id) as { n: number }).n
    const exists = db.prepare('SELECT 1 FROM designs WHERE user_id = ? AND id = ?').get(u.id, id)
    if (!exists && count >= 200) return fail(c, 409, 'too_many_designs')
    db.prepare('INSERT INTO designs (id, user_id, name, data, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, id) DO UPDATE SET name = excluded.name, data = excluded.data, updated_at = excluded.updated_at').run(
      id,
      u.id,
      body.name.slice(0, 60),
      JSON.stringify(body.data),
      now(),
    )
    return c.json({ ok: true })
  })

  app.delete('/designs/:id', (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    db.prepare('DELETE FROM designs WHERE user_id = ? AND id = ?').run(u.id, c.req.param('id'))
    return c.json({ ok: true })
  })

  // --- share links -------------------------------------------------------------
  app.post('/shares', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    const body = await c.req.json().catch(() => null)
    if (!body || !validPattern(body.pattern)) return fail(c, 400, 'bad_pattern')
    const today = (db.prepare('SELECT COUNT(*) AS n FROM shares WHERE user_id = ? AND created_at > ?').get(u.id, now() - DAY) as { n: number }).n
    if (today >= 100) return fail(c, 429, 'too_many_shares')
    const data = {
      pattern: { width: body.pattern.width, height: body.pattern.height, paletteId: body.pattern.paletteId, cells: body.pattern.cells },
      placed: typeof body.placed === 'string' && body.placed.length === body.pattern.cells.length ? body.placed : undefined,
      beadSize: body.beadSize === '5mm' ? '5mm' : '2.6mm',
      iron: typeof body.iron === 'string' ? body.iron.slice(0, 20) : undefined,
    }
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 60) : 'BeadSpark'
    let id = shortId()
    while (db.prepare('SELECT 1 FROM shares WHERE id = ?').get(id)) id = shortId()
    db.prepare('INSERT INTO shares (id, user_id, name, data, created_at) VALUES (?, ?, ?, ?, ?)').run(id, u.id, name, JSON.stringify(data), now())
    return c.json({ id, url: `${cfg.siteUrl}/s/?id=${id}` })
  })

  app.get('/shares/:id', (c) => {
    const row = db.prepare('SELECT s.id, s.name, s.data, s.views, s.created_at, u.name AS author FROM shares s JOIN users u ON u.id = s.user_id WHERE s.id = ?').get(c.req.param('id')) as
      | { id: string; name: string; data: string; views: number; created_at: number; author: string }
      | undefined
    if (!row) return fail(c, 404, 'not_found')
    db.prepare('UPDATE shares SET views = views + 1 WHERE id = ?').run(row.id)
    c.header('Cache-Control', 'public, max-age=60')
    return c.json({ id: row.id, name: row.name, author: row.author || 'BeadSpark', createdAt: row.created_at, views: row.views + 1, ...JSON.parse(row.data) })
  })

  // --- shop: bead kits and finished pieces (mini program, WeChat Pay) --------------
  const FORMS: ShopForm[] = ['kit', 'finished']
  const FORM_NAME: Record<ShopForm, string> = { kit: '拼豆材料包', finished: '拼好的成品' }
  const formOpen = (f: ShopForm) => wxPayReady(cfg.wxpay) && cfg.prices[f].small > 0 && cfg.prices[f].standard > 0 && cfg.prices[f].large > 0
  /** Size class by how many standard sections (52 or 29 pegs a side) the pattern covers. */
  const tierOf = (p: { width: number; height: number }, beadSize: string): ShopTier => {
    const pegs = beadSize === '5mm' ? 29 : 52
    const n = Math.ceil(p.width / pegs) * Math.ceil(p.height / pegs)
    return n <= 1 ? 'small' : n <= 4 ? 'standard' : 'large'
  }
  interface OrderRow {
    id: string
    user_id: string
    form: ShopForm
    tier: ShopTier
    name: string
    amount_fen: number
    status: string
    data: string
    address: string
    share_id: string | null
    transaction_id: string | null
    created_at: number
    paid_at: number | null
    carrier: string | null
    tracking_no: string | null
    shipped_at: number | null
    refunded_at: number | null
    note: string | null
  }
  /** An unpaid order can be paid for this long (WeChat's prepay lasts 2 hours). */
  const PAY_WINDOW = 110 * MINUTE
  const orderSummary = (o: OrderRow) => ({
    id: o.id,
    form: o.form,
    tier: o.tier,
    name: o.name,
    amountFen: o.amount_fen,
    status: o.status,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    shippedAt: o.shipped_at,
    refundedAt: o.refunded_at,
    carrier: o.carrier,
    trackingNo: o.tracking_no,
    payUntil: o.status === 'pending' ? o.created_at + PAY_WINDOW : null,
    address: JSON.parse(o.address),
  })
  const publicOrder = (o: OrderRow) => {
    const d = JSON.parse(o.data)
    return { ...orderSummary(o), pattern: d.pattern, beadSize: d.beadSize }
  }

  /** Mark an order paid (once) and tell the shop owner by email. */
  const markPaid = (o: OrderRow, transactionId?: string) => {
    const done = db.prepare("UPDATE orders SET status = 'paid', paid_at = ?, transaction_id = ? WHERE id = ? AND status = 'pending'").run(now(), transactionId ?? null, o.id)
    if (!done.changes) return
    if (!cfg.adminEmail) return
    const a = JSON.parse(o.address) as Record<string, string>
    const p = JSON.parse(o.data).pattern as { width: number; height: number }
    const lines = [
      `新订单 ${o.id}（已付款 ¥${(o.amount_fen / 100).toFixed(2)}）`,
      `商品：${FORM_NAME[o.form]} · ${o.name} · ${p.width}×${p.height} 格 · ${JSON.parse(o.data).beadSize}`,
      `收货：${a.name} ${a.phone}`,
      `地址：${a.province ?? ''}${a.city ?? ''}${a.county ?? ''}${a.detail ?? ''}`,
      o.share_id ? `图纸：${cfg.siteUrl}/s/?id=${o.share_id}` : '',
    ].filter(Boolean)
    mailer.send(cfg.adminEmail, `BeadSpark 新订单 ${o.id} · ${FORM_NAME[o.form]}`, lines.join('\n'), `<pre style="font-size:14px">${lines.join('\n').replace(/</g, '&lt;')}</pre>`).catch((e) => console.error('[order mail]', e))
  }

  /** Ask WeChat whether a pending order has been paid. */
  const refreshOrder = async (o: OrderRow) => {
    if (o.status !== 'pending' || !wxPayReady(cfg.wxpay)) return
    try {
      const st = await queryOrder(cfg.wxpay, wx, o.id)
      if (st.state === 'SUCCESS' && st.totalFen === o.amount_fen) return markPaid(o, st.transactionId)
      if (st.state === 'CLOSED') return void db.prepare("UPDATE orders SET status = 'closed' WHERE id = ? AND status = 'pending'").run(o.id)
    } catch (e) {
      console.warn('[wxpay] query', o.id, (e as Error).message)
    }
    // Not paid in time: the order is over.
    if (now() - o.created_at > PAY_WINDOW) db.prepare("UPDATE orders SET status = 'closed' WHERE id = ? AND status = 'pending'").run(o.id)
  }
  const getOrder = (id: string) => db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow | undefined

  /** What is on sale and for how much (fen). Forms without prices / payment set up are closed. */
  app.get('/shop', (c) => {
    c.header('Cache-Control', 'public, max-age=60')
    return c.json({ forms: Object.fromEntries(FORMS.map((f) => [f, { open: formOpen(f), prices: cfg.prices[f] }])), shippingFen: cfg.shippingFen })
  })
  app.use('/orders', bodyLimit({ maxSize: 2 * 1024 * 1024, onError: (c) => fail(c, 400, 'too_large') }))

  app.post('/orders', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    const body = await c.req.json().catch(() => null)
    const form = body?.form as ShopForm
    if (!body || !FORMS.includes(form) || !validPattern(body.pattern)) return fail(c, 400, 'bad_order')
    if (!formOpen(form)) return fail(c, 409, 'not_on_sale')
    const a = body.address ?? {}
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
    const address = { name: str(a.name, 40), phone: str(a.phone, 30), province: str(a.province, 30), city: str(a.city, 30), county: str(a.county, 30), detail: str(a.detail, 200) }
    if (!address.name || !/^[0-9+\- ]{6,30}$/.test(address.phone) || !address.detail) return fail(c, 400, 'bad_address')
    const openid = (db.prepare('SELECT openid FROM wx_openids WHERE user_id = ?').get(u.id) as { openid: string } | undefined)?.openid
    if (!openid) return fail(c, 409, 'no_openid')
    const beadSize = body.beadSize === '5mm' ? '5mm' : '2.6mm'
    const tier = tierOf(body.pattern, beadSize)
    const amount = cfg.prices[form][tier] + cfg.shippingFen
    const name = str(body.name, 60) || 'BeadSpark'
    const pattern = { width: body.pattern.width, height: body.pattern.height, paletteId: body.pattern.paletteId, cells: body.pattern.cells }
    // A share of the pattern, so whoever packs the order can open the exact pattern.
    let shareId = shortId()
    while (db.prepare('SELECT 1 FROM shares WHERE id = ?').get(shareId)) shareId = shortId()
    db.prepare('INSERT INTO shares (id, user_id, name, data, created_at) VALUES (?, ?, ?, ?, ?)').run(shareId, u.id, name, JSON.stringify({ pattern, beadSize }), now())
    const id = `BS${new Date(now()).toISOString().slice(2, 10).replace(/-/g, '')}${shortId(8).toUpperCase()}`
    db.prepare('INSERT INTO orders (id, user_id, form, tier, name, amount_fen, status, data, address, share_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id,
      u.id,
      form,
      tier,
      name,
      amount,
      'pending',
      JSON.stringify({ pattern, beadSize, placed: typeof body.placed === 'string' ? body.placed : undefined }),
      JSON.stringify(address),
      shareId,
      now(),
    )
    try {
      const pay = await prepay(cfg.wxpay, wx, { outTradeNo: id, description: `BeadSpark ${FORM_NAME[form]} · ${name}`, amountFen: amount, openid })
      return c.json({ order: publicOrder(getOrder(id)!), pay })
    } catch (e) {
      console.error('[wxpay] prepay', e)
      db.prepare("UPDATE orders SET status = 'closed' WHERE id = ?").run(id)
      return fail(c, 502, 'pay_failed')
    }
  })

  app.get('/orders', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    const mine = () => db.prepare("SELECT * FROM orders WHERE user_id = ? AND status != 'closed' ORDER BY created_at DESC LIMIT 50").all(u.id) as unknown as OrderRow[]
    // Settle unpaid ones first (paid meanwhile, or out of time).
    for (const o of mine().filter((x) => x.status === 'pending').slice(0, 5)) await refreshOrder(o)
    return c.json({ orders: mine().map(publicOrder) })
  })

  app.get('/orders/:id', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    let o = getOrder(c.req.param('id'))
    if (!o || o.user_id !== u.id) return fail(c, 404, 'not_found')
    await refreshOrder(o)
    o = getOrder(o.id)!
    return c.json({ order: publicOrder(o) })
  })

  /** Pay an unpaid order again (the first attempt was cancelled or failed). */
  app.post('/orders/:id/pay', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    let o = getOrder(c.req.param('id'))
    if (!o || o.user_id !== u.id) return fail(c, 404, 'not_found')
    await refreshOrder(o)
    o = getOrder(o.id)!
    if (o.status !== 'pending') return c.json({ order: publicOrder(o), pay: null }) // paid meanwhile, or closed
    const openid = (db.prepare('SELECT openid FROM wx_openids WHERE user_id = ?').get(u.id) as { openid: string } | undefined)?.openid
    if (!openid) return fail(c, 409, 'no_openid')
    try {
      const pay = await prepay(cfg.wxpay, wx, { outTradeNo: o.id, description: `BeadSpark ${FORM_NAME[o.form]} · ${o.name}`, amountFen: o.amount_fen, openid })
      return c.json({ order: publicOrder(o), pay })
    } catch (e) {
      console.error('[wxpay] prepay again', e)
      return fail(c, 502, 'pay_failed')
    }
  })

  /** Cancel an unpaid order. */
  app.post('/orders/:id/cancel', async (c) => {
    const u = sessionUser(c)
    if (!u) return fail(c, 401, 'not_signed_in')
    let o = getOrder(c.req.param('id'))
    if (!o || o.user_id !== u.id) return fail(c, 404, 'not_found')
    await refreshOrder(o) // it may have been paid a moment ago
    o = getOrder(o.id)!
    if (o.status === 'pending') {
      try {
        await closeOrder(cfg.wxpay, wx, o.id)
      } catch (e) {
        console.warn('[wxpay] close', o.id, (e as Error).message)
      }
      db.prepare("UPDATE orders SET status = 'closed' WHERE id = ? AND status = 'pending'").run(o.id)
      o = getOrder(o.id)!
    }
    return c.json({ order: publicOrder(o) })
  })

  // --- order admin (the shop owner's page at /admin/) ------------------------------
  const isAdmin = (c: Context) => {
    const given = Buffer.from(c.req.header('x-admin-token') ?? '')
    const want = Buffer.from(cfg.adminToken)
    return want.length >= 12 && given.length === want.length && timingSafeEqual(given, want)
  }
  const adminOrder = (o: OrderRow) => ({ ...orderSummary(o), transactionId: o.transaction_id, note: o.note, shareUrl: o.share_id ? `${cfg.siteUrl}/s/?id=${o.share_id}` : null })

  app.get('/admin/orders', (c) => {
    if (!isAdmin(c)) return fail(c, 401, 'bad_admin_token')
    const status = c.req.query('status') ?? ''
    const rows = (
      ['paid', 'shipped', 'refunded', 'pending', 'closed'].includes(status)
        ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT 200').all(status)
        : db.prepare("SELECT * FROM orders WHERE status IN ('paid', 'shipped', 'refunded') ORDER BY created_at DESC LIMIT 200").all()
    ) as unknown as OrderRow[]
    const counts = Object.fromEntries((db.prepare('SELECT status, COUNT(*) AS n FROM orders GROUP BY status').all() as { status: string; n: number }[]).map((r) => [r.status, r.n]))
    return c.json({ orders: rows.map(adminOrder), counts })
  })

  app.get('/admin/orders/:id', (c) => {
    if (!isAdmin(c)) return fail(c, 401, 'bad_admin_token')
    const o = getOrder(c.req.param('id'))
    if (!o) return fail(c, 404, 'not_found')
    const d = JSON.parse(o.data)
    return c.json({ order: { ...adminOrder(o), pattern: d.pattern, beadSize: d.beadSize, placed: d.placed } })
  })

  /** Mark a paid order as shipped (or correct the tracking number of a shipped one). */
  app.post('/admin/orders/:id/ship', async (c) => {
    if (!isAdmin(c)) return fail(c, 401, 'bad_admin_token')
    const o = getOrder(c.req.param('id'))
    if (!o) return fail(c, 404, 'not_found')
    if (o.status !== 'paid' && o.status !== 'shipped') return fail(c, 409, 'not_shippable')
    const body = await c.req.json().catch(() => ({}))
    const carrier = typeof body.carrier === 'string' ? body.carrier.trim().slice(0, 30) : ''
    const trackingNo = typeof body.trackingNo === 'string' ? body.trackingNo.trim().slice(0, 40) : ''
    if (!carrier || !trackingNo) return fail(c, 400, 'bad_tracking')
    db.prepare("UPDATE orders SET status = 'shipped', carrier = ?, tracking_no = ?, shipped_at = COALESCE(shipped_at, ?), note = ? WHERE id = ?").run(carrier, trackingNo, now(), typeof body.note === 'string' ? body.note.slice(0, 200) : o.note, o.id)
    return c.json({ order: adminOrder(getOrder(o.id)!) })
  })

  /** Refund a paid / shipped order in full through WeChat Pay. */
  app.post('/admin/orders/:id/refund', async (c) => {
    if (!isAdmin(c)) return fail(c, 401, 'bad_admin_token')
    const o = getOrder(c.req.param('id'))
    if (!o) return fail(c, 404, 'not_found')
    if (o.status !== 'paid' && o.status !== 'shipped') return fail(c, 409, 'not_refundable')
    const body = await c.req.json().catch(() => ({}))
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    try {
      const st = await refundOrder(cfg.wxpay, wx, { outTradeNo: o.id, outRefundNo: `R${o.id}`, amountFen: o.amount_fen, reason })
      if (st !== 'SUCCESS' && st !== 'PROCESSING') return fail(c, 502, 'refund_failed')
    } catch (e) {
      console.error('[wxpay] refund', o.id, e)
      return fail(c, 502, 'refund_failed')
    }
    db.prepare("UPDATE orders SET status = 'refunded', refunded_at = ?, note = ? WHERE id = ?").run(now(), reason.slice(0, 200) || o.note, o.id)
    return c.json({ order: adminOrder(getOrder(o.id)!) })
  })

  // WeChat calls this when a payment succeeds. Only a holder of the APIv3 key can produce a
  // resource that decrypts; the state is confirmed with WeChat again before marking the order paid.
  app.post('/pay/wechat/notify', async (c) => {
    const body = await c.req.json().catch(() => null)
    try {
      const data = decryptNotify(cfg.wxpay, body.resource)
      const o = getOrder(String(data.out_trade_no ?? ''))
      if (o) await refreshOrder(o)
      return c.json({ code: 'SUCCESS', message: 'OK' })
    } catch (e) {
      console.warn('[wxpay] bad notify', (e as Error).message)
      return c.json({ code: 'FAIL', message: 'invalid' }, 400)
    }
  })

  app.notFound((c) => fail(c, 404, 'not_found'))
  app.onError((err, c) => {
    console.error(err)
    return fail(c, 500, 'server_error')
  })
  return app
}

/** A bead pattern: integer cells, -1 = empty, at most 320 × 320. */
export function validPattern(p: unknown): p is { width: number; height: number; paletteId: string; cells: number[] } {
  if (!p || typeof p !== 'object') return false
  const { width, height, paletteId, cells } = p as Record<string, unknown>
  if (!Number.isInteger(width) || !Number.isInteger(height) || (width as number) < 1 || (height as number) < 1 || (width as number) > 320 || (height as number) > 320) return false
  if (typeof paletteId !== 'string' || paletteId.length > 40) return false
  if (!Array.isArray(cells) || cells.length !== (width as number) * (height as number)) return false
  return cells.every((v) => Number.isInteger(v) && v >= -1 && v < 1000)
}
