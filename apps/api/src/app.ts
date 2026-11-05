import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Config } from './config'
import { hashPassword, randomId, sha256, shortId, sixDigits, verifyPassword } from './crypto'
import type { DB } from './db'
import { codeEmail, type Mailer } from './mail'
import { PROVIDERS, providers as makeProviders, type Profile, type Provider, type ProviderId } from './oauth'

export interface Deps {
  cfg: Config
  db: DB
  mailer: Mailer
  /** Third-party providers (tests pass fakes). */
  providers?: Record<ProviderId, Provider>
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

  const startSession = (c: Context, userId: string) => {
    const token = randomId(32)
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(sha256(token), userId, now() + SESSION_DAYS * DAY, now())
    setCookie(c, COOKIE, token, { httpOnly: true, secure: cfg.secureCookies, sameSite: 'Lax', path: '/', maxAge: SESSION_DAYS * 86400 })
  }
  const sessionUser = (c: Context): UserRow | undefined => {
    const token = getCookie(c, COOKIE)
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
    if (m !== 'GET' && m !== 'HEAD' && !isCallback) {
      const origin = c.req.header('origin')
      if (origin && origin !== siteOrigin) return fail(c, 403, 'bad_origin')
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
    const token = getCookie(c, COOKIE)
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
