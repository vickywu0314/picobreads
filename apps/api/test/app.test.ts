import { generateKeyPairSync } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp, validPattern } from '../src/app'
import { loadConfig } from '../src/config'
import { verifyPassword, hashPassword } from '../src/crypto'
import { openDb } from '../src/db'
import type { Mailer } from '../src/mail'
import { appleClientSecret, type Provider, type ProviderId } from '../src/oauth'

const SITE = 'https://bead.test'

function setup(extra: Record<string, string> = {}, fetchImpl?: typeof fetch) {
  const cfg = loadConfig({ SITE_URL: SITE, ...extra })
  const db = openDb(':memory:')
  const sent: { to: string; text: string }[] = []
  const mailer: Mailer = { send: async (to, _s, text) => void sent.push({ to, text }) }
  let t = 1_700_000_000_000
  const fake = (id: string, email?: string): Provider => ({
    configured: true,
    authUrl: (state, r) => `https://idp.test/auth?state=${state}&redirect_uri=${encodeURIComponent(r)}`,
    profile: async (code) => ({ id: `${id}-${code}`, email, emailVerified: !!email, name: 'Fake User' }),
  })
  const providers = { google: fake('g', 'amy@example.com'), facebook: fake('f'), wechat: fake('w'), apple: { ...fake('a'), configured: false } } as Record<ProviderId, Provider>
  const app = createApp({ cfg, db, mailer, providers, now: () => t, fetch: fetchImpl })
  let cookie = ''
  const call = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const res = await app.request(`/api${path}`, {
      method,
      headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const set = res.headers.get('set-cookie')
    if (set) cookie = set.split(';')[0]
    const text = await res.text()
    let json: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      json = JSON.parse(text)
    } catch {}
    return { status: res.status, json, headers: res.headers }
  }
  const lastCode = () => sent.at(-1)!.text.match(/(\d{6})/)![1]
  return { call, sent, lastCode, tick: (ms: number) => (t += ms), resetCookie: () => (cookie = ''), db }
}

const pattern = { width: 2, height: 2, paletteId: 'mard-264', cells: [1, 2, -1, 3] }

describe('email sign-up / sign-in', () => {
  let s: ReturnType<typeof setup>
  beforeEach(() => (s = setup()))

  it('registers with a code from the email, then signs in with the password', async () => {
    expect((await s.call('POST', '/auth/email/send-code', { email: ' Amy@Example.com ', purpose: 'register' })).status).toBe(200)
    expect(s.sent[0].to).toBe('amy@example.com')
    const r = await s.call('POST', '/auth/email/register', { email: 'amy@example.com', code: s.lastCode(), password: 'beads-1234', name: 'Amy' })
    expect(r.status).toBe(200)
    expect(r.json.user).toMatchObject({ email: 'amy@example.com', name: 'Amy', hasPassword: true })
    expect((await s.call('GET', '/auth/me')).json.user.email).toBe('amy@example.com')

    await s.call('POST', '/auth/logout', {})
    expect((await s.call('GET', '/auth/me')).json.user).toBeNull()
    expect((await s.call('POST', '/auth/email/login', { email: 'amy@example.com', password: 'wrong-pass' })).status).toBe(401)
    expect((await s.call('POST', '/auth/email/login', { email: 'AMY@example.com', password: 'beads-1234' })).status).toBe(200)
    expect((await s.call('GET', '/auth/me')).json.user.name).toBe('Amy')
  })

  it('rejects wrong / reused / expired codes and weak passwords', async () => {
    await s.call('POST', '/auth/email/send-code', { email: 'bo@example.com' })
    const code = s.lastCode()
    expect((await s.call('POST', '/auth/email/register', { email: 'bo@example.com', code, password: 'short' })).json.error).toBe('weak_password')
    expect((await s.call('POST', '/auth/email/register', { email: 'bo@example.com', code: '000000' === code ? '111111' : '000000', password: 'long-enough' })).json.error).toBe('wrong_code')
    expect((await s.call('POST', '/auth/email/register', { email: 'bo@example.com', code, password: 'long-enough' })).status).toBe(200)
    s.resetCookie()
    // Already registered
    expect((await s.call('POST', '/auth/email/send-code', { email: 'bo@example.com' })).json.error).toBe('email_taken')

    s.tick(61_000)
    await s.call('POST', '/auth/email/send-code', { email: 'cy@example.com' })
    const c2 = s.lastCode()
    s.tick(11 * 60_000)
    expect((await s.call('POST', '/auth/email/register', { email: 'cy@example.com', code: c2, password: 'long-enough' })).json.error).toBe('code_expired')
  })

  it('locks a code after 5 wrong tries', async () => {
    await s.call('POST', '/auth/email/send-code', { email: 'di@example.com' })
    const code = s.lastCode()
    const wrong = code === '123456' ? '654321' : '123456'
    for (let i = 0; i < 5; i++) await s.call('POST', '/auth/email/register', { email: 'di@example.com', code: wrong, password: 'long-enough' })
    expect((await s.call('POST', '/auth/email/register', { email: 'di@example.com', code, password: 'long-enough' })).json.error).toBe('code_expired')
  })

  it('limits how often codes are sent', async () => {
    await s.call('POST', '/auth/email/send-code', { email: 'ed@example.com' })
    expect((await s.call('POST', '/auth/email/send-code', { email: 'ed@example.com' })).json.error).toBe('wait_a_minute')
    expect((await s.call('POST', '/auth/email/send-code', { email: 'not-an-email' })).json.error).toBe('bad_email')
  })

  it('resets a forgotten password and signs out other sessions', async () => {
    await s.call('POST', '/auth/email/send-code', { email: 'fa@example.com' })
    await s.call('POST', '/auth/email/register', { email: 'fa@example.com', code: s.lastCode(), password: 'first-pass' })
    s.resetCookie()
    s.tick(61_000)
    // Unknown address: same answer, no mail.
    const before = s.sent.length
    expect((await s.call('POST', '/auth/email/send-code', { email: 'nobody@example.com', purpose: 'reset' })).status).toBe(200)
    expect(s.sent.length).toBe(before)
    await s.call('POST', '/auth/email/send-code', { email: 'fa@example.com', purpose: 'reset' })
    expect((await s.call('POST', '/auth/email/reset', { email: 'fa@example.com', code: s.lastCode(), password: 'second-pass' })).status).toBe(200)
    s.resetCookie()
    expect((await s.call('POST', '/auth/email/login', { email: 'fa@example.com', password: 'first-pass' })).status).toBe(401)
    expect((await s.call('POST', '/auth/email/login', { email: 'fa@example.com', password: 'second-pass' })).status).toBe(200)
  })

  it('slows down password guessing', async () => {
    for (let i = 0; i < 10; i++) await s.call('POST', '/auth/email/login', { email: 'x@example.com', password: 'nope-nope' })
    expect((await s.call('POST', '/auth/email/login', { email: 'x@example.com', password: 'nope-nope' })).json.error).toBe('too_many_attempts')
  })

  it('refuses requests from other sites and non-JSON posts', async () => {
    expect((await s.call('POST', '/auth/email/login', { email: 'a@b.co', password: 'x' }, { origin: 'https://evil.test' })).json.error).toBe('bad_origin')
    expect((await s.call('POST', '/auth/logout', undefined)).json.error).toBe('json_only')
  })
})

describe('third-party sign-in', () => {
  it('lists configured providers, runs the redirect round trip and links by verified email', async () => {
    const s = setup()
    expect((await s.call('GET', '/auth/providers')).json.providers).toEqual(['google', 'wechat', 'facebook'])
    const start = await s.call('GET', '/auth/google/start?next=/workbench/')
    expect(start.status).toBe(302)
    const loc = new URL(start.headers.get('location')!)
    expect(loc.searchParams.get('redirect_uri')).toBe(`${SITE}/api/auth/google/callback`)
    const state = loc.searchParams.get('state')!
    const cb = await s.call('GET', `/auth/google/callback?code=c1&state=${state}`)
    expect(cb.headers.get('location')).toBe(`${SITE}/workbench/`)
    const me = (await s.call('GET', '/auth/me')).json.user
    expect(me).toMatchObject({ email: 'amy@example.com', name: 'Fake User', providers: ['google'] })
    // The same state can't be used twice.
    expect((await s.call('GET', `/auth/google/callback?code=c1&state=${state}`)).headers.get('location')).toContain('/login/?error=state')
    // Unconfigured provider
    expect((await s.call('GET', '/auth/apple/start')).status).toBe(404)
  })

  it('never redirects off-site after sign-in', async () => {
    const s = setup()
    const loc = new URL((await s.call('GET', '/auth/wechat/start?next=//evil.test')).headers.get('location')!)
    const cb = await s.call('GET', `/auth/wechat/callback?code=z&state=${loc.searchParams.get('state')}`)
    expect(cb.headers.get('location')).toBe(`${SITE}/`)
  })

  it('signs the Apple client secret with ES256', () => {
    const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
    const jwt = appleClientSecret({ clientId: 'com.bs.web', teamId: 'TEAM', keyId: 'KEY', privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() }, 1000)
    const [h, p, sig] = jwt.split('.')
    expect(JSON.parse(Buffer.from(h, 'base64url').toString())).toEqual({ alg: 'ES256', kid: 'KEY' })
    expect(JSON.parse(Buffer.from(p, 'base64url').toString())).toMatchObject({ iss: 'TEAM', sub: 'com.bs.web', aud: 'https://appleid.apple.com', exp: 1300 })
    expect(Buffer.from(sig, 'base64url').length).toBe(64)
  })
})

describe('drafts and shares', () => {
  async function signedIn() {
    const s = setup()
    await s.call('POST', '/auth/email/send-code', { email: 'gi@example.com' })
    await s.call('POST', '/auth/email/register', { email: 'gi@example.com', code: s.lastCode(), password: 'long-enough', name: 'Gigi' })
    return s
  }

  it('saves, lists and deletes drafts per user', async () => {
    const s = await signedIn()
    expect((await s.call('PUT', '/designs/d_1', { name: 'Corgi', data: { pattern, placed: '1000' } })).status).toBe(200)
    expect((await s.call('PUT', '/designs/d_1', { name: 'Corgi 2', data: { pattern, placed: '1100' } })).status).toBe(200)
    const list = (await s.call('GET', '/designs')).json.designs
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ id: 'd_1', name: 'Corgi 2', data: { placed: '1100' } })
    expect((await s.call('PUT', '/designs/d_2', { name: 'x', data: { pattern: { ...pattern, cells: [1] } } })).json.error).toBe('bad_design')
    await s.call('DELETE', '/designs/d_1', {})
    expect((await s.call('GET', '/designs')).json.designs).toHaveLength(0)
    s.resetCookie()
    expect((await s.call('GET', '/designs')).status).toBe(401)
  })

  it('creates a share link anyone can open', async () => {
    const s = await signedIn()
    const r = await s.call('POST', '/shares', { name: 'My corgi', pattern, placed: '1111', beadSize: '2.6mm', iron: 'normal' })
    expect(r.status).toBe(200)
    expect(r.json.url).toBe(`${SITE}/s/?id=${r.json.id}`)
    s.resetCookie()
    const v = await s.call('GET', `/shares/${r.json.id}`)
    expect(v.json).toMatchObject({ name: 'My corgi', author: 'Gigi', views: 1, pattern, placed: '1111', beadSize: '2.6mm' })
    expect((await s.call('GET', `/shares/${r.json.id}`)).json.views).toBe(2)
    expect((await s.call('GET', '/shares/nope')).status).toBe(404)
    expect((await s.call('POST', '/shares', { pattern })).status).toBe(401)
  })
})

describe('helpers', () => {
  it('hashes passwords with a salt', async () => {
    const a = await hashPassword('secret-pass')
    expect(a).not.toBe(await hashPassword('secret-pass'))
    expect(await verifyPassword('secret-pass', a)).toBe(true)
    expect(await verifyPassword('secret-pasS', a)).toBe(false)
  })
  it('validates patterns', () => {
    expect(validPattern(pattern)).toBe(true)
    expect(validPattern({ ...pattern, cells: [1, 2, 3, 1.5] })).toBe(false)
    expect(validPattern({ ...pattern, width: 400, height: 1, cells: Array(400).fill(0) })).toBe(false)
  })
})

describe('WeChat mini program', () => {
  const env = { WXMP_APP_ID: 'wx123', WXMP_APP_SECRET: 'sec' }
  const calls: string[] = []
  const fakeWx = (async (url: string | URL, init?: RequestInit) => {
    const u = String(url)
    calls.push(u)
    const json = (o: object) => new Response(JSON.stringify(o), { headers: { 'content-type': 'application/json' } })
    if (u.includes('jscode2session')) {
      const code = new URL(u).searchParams.get('js_code')
      if (code === 'bad') return json({ errcode: 40029, errmsg: 'invalid code' })
      return json({ openid: `open-${code}`, unionid: code === 'u1' ? 'union-1' : undefined, session_key: 'k' })
    }
    if (u.includes('/cgi-bin/token')) return json({ access_token: 'AT', expires_in: 7200 })
    if (u.includes('getwxacodeunlimit')) {
      expect(JSON.parse(String(init?.body))).toMatchObject({ page: 'pages/share/index', check_path: false })
      return new Response(new Uint8Array([0xff, 0xd8, 0xff]), { headers: { 'content-type': 'image/jpeg' } })
    }
    return new Response('?', { status: 404 })
  }) as typeof fetch

  it('signs in with wx.login code and a bearer token, same user next time', async () => {
    const s = setup(env, fakeWx)
    const r = await s.call('POST', '/auth/wxmp/login', { code: 'abc' })
    expect(r.status).toBe(200)
    expect(r.json.user).toMatchObject({ name: '微信用户', providers: ['wxmp'] })
    s.resetCookie()
    const me = await s.call('GET', '/auth/me', undefined, { authorization: `Bearer ${r.json.token}` })
    expect(me.json.user.id).toBe(r.json.user.id)
    // Drafts work with the token too.
    expect((await s.call('PUT', '/designs/d1', { name: 'x', data: { pattern } }, { authorization: `Bearer ${r.json.token}` })).status).toBe(200)
    s.resetCookie()
    const again = await s.call('POST', '/auth/wxmp/login', { code: 'abc' })
    expect(again.json.user.id).toBe(r.json.user.id)
    expect((await s.call('POST', '/auth/wxmp/login', { code: 'bad' })).json.error).toBe('bad_code')
  })

  it('links to the website WeChat login through unionid', async () => {
    const s = setup(env, fakeWx)
    s.db.prepare("INSERT INTO users (id, name, created_at) VALUES ('web1', 'Web', 0)").run()
    s.db.prepare("INSERT INTO identities (provider, provider_user_id, user_id, created_at) VALUES ('wechat', 'union-1', 'web1', 0)").run()
    expect((await s.call('POST', '/auth/wxmp/login', { code: 'u1' })).json.user.id).toBe('web1')
  })

  it('serves a mini program code for a share', async () => {
    const s = setup(env, fakeWx)
    const { token } = (await s.call('POST', '/auth/wxmp/login', { code: 'q' })).json
    const share = await s.call('POST', '/shares', { name: 'p', pattern }, { authorization: `Bearer ${token}` })
    const res = await s.call('GET', `/wxmp/qrcode/${share.json.id}`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/jpeg')
    expect((await s.call('GET', '/wxmp/qrcode/nope12345')).status).toBe(404)
  })

  it('is off without an AppID', async () => {
    expect((await setup().call('POST', '/auth/wxmp/login', { code: 'x' })).status).toBe(404)
  })
})
