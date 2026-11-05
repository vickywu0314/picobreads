import { createPrivateKey, sign } from 'node:crypto'
import type { Config } from './config'

/** What we keep from a third-party profile. */
export interface Profile {
  id: string
  email?: string
  emailVerified?: boolean
  name?: string
  avatarUrl?: string
}

export type ProviderId = 'google' | 'facebook' | 'wechat' | 'apple'
export const PROVIDERS: ProviderId[] = ['google', 'wechat', 'apple', 'facebook']

export interface Provider {
  configured: boolean
  /** Where to send the browser to sign in. */
  authUrl(state: string, redirectUri: string): string
  /** Code → profile (server to server). `extra` = other callback fields (Apple's first-login user JSON). */
  profile(code: string, redirectUri: string, extra: Record<string, string>): Promise<Profile>
}

type Fetch = typeof fetch

async function json(res: Response) {
  const text = await res.text()
  let body: Record<string, unknown>
  try {
    body = JSON.parse(text)
  } catch {
    throw new Error(`bad response ${res.status}: ${text.slice(0, 200)}`)
  }
  if (!res.ok || body.error || body.errcode) throw new Error(`provider error ${res.status}: ${text.slice(0, 300)}`)
  return body as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

const form = (o: Record<string, string>) => new URLSearchParams(o)
const qs = (o: Record<string, string>) => new URLSearchParams(o).toString()

/** JWT payload without verifying the signature (only for tokens we fetched from the issuer ourselves). */
function jwtPayload(token: string): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const part = token.split('.')[1] ?? ''
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

/** Sign in with Apple client secret: an ES256 JWT signed with the .p8 key (valid 5 minutes). */
export function appleClientSecret(cfg: Config['apple'], now = Math.floor(Date.now() / 1000)) {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const head = b64({ alg: 'ES256', kid: cfg.keyId })
  const body = b64({ iss: cfg.teamId, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: cfg.clientId })
  const sig = sign('sha256', Buffer.from(`${head}.${body}`), { key: createPrivateKey(cfg.privateKey), dsaEncoding: 'ieee-p1363' })
  return `${head}.${body}.${sig.toString('base64url')}`
}

export function providers(cfg: Config, f: Fetch = fetch): Record<ProviderId, Provider> {
  return {
    google: {
      configured: !!(cfg.google.id && cfg.google.secret),
      authUrl: (state, redirect_uri) =>
        `https://accounts.google.com/o/oauth2/v2/auth?${qs({ client_id: cfg.google.id, redirect_uri, response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' })}`,
      async profile(code, redirect_uri) {
        const tok = await json(await f('https://oauth2.googleapis.com/token', { method: 'POST', body: form({ code, client_id: cfg.google.id, client_secret: cfg.google.secret, redirect_uri, grant_type: 'authorization_code' }) }))
        const u = await json(await f('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${tok.access_token}` } }))
        return { id: String(u.sub), email: u.email, emailVerified: !!u.email_verified, name: u.name, avatarUrl: u.picture }
      },
    },
    facebook: {
      configured: !!(cfg.facebook.id && cfg.facebook.secret),
      authUrl: (state, redirect_uri) => `https://www.facebook.com/v19.0/dialog/oauth?${qs({ client_id: cfg.facebook.id, redirect_uri, state, scope: 'email,public_profile' })}`,
      async profile(code, redirect_uri) {
        const tok = await json(await f(`https://graph.facebook.com/v19.0/oauth/access_token?${qs({ client_id: cfg.facebook.id, client_secret: cfg.facebook.secret, redirect_uri, code })}`))
        const u = await json(await f(`https://graph.facebook.com/me?${qs({ fields: 'id,name,email,picture.type(large)', access_token: tok.access_token })}`))
        return { id: String(u.id), email: u.email, emailVerified: !!u.email, name: u.name, avatarUrl: u.picture?.data?.url }
      },
    },
    wechat: {
      configured: !!(cfg.wechat.id && cfg.wechat.secret),
      // Website application: the user scans a QR code with WeChat.
      authUrl: (state, redirect_uri) => `https://open.weixin.qq.com/connect/qrconnect?${qs({ appid: cfg.wechat.id, redirect_uri, response_type: 'code', scope: 'snsapi_login', state })}#wechat_redirect`,
      async profile(code) {
        const tok = await json(await f(`https://api.weixin.qq.com/sns/oauth2/access_token?${qs({ appid: cfg.wechat.id, secret: cfg.wechat.secret, code, grant_type: 'authorization_code' })}`))
        const u = await json(await f(`https://api.weixin.qq.com/sns/userinfo?${qs({ access_token: tok.access_token, openid: tok.openid, lang: 'zh_CN' })}`))
        // unionid is the same across the mini program / official account later, so prefer it.
        return { id: String(u.unionid || tok.unionid || u.openid || tok.openid), name: u.nickname, avatarUrl: u.headimgurl }
      },
    },
    apple: {
      configured: !!(cfg.apple.clientId && cfg.apple.teamId && cfg.apple.keyId && cfg.apple.privateKey),
      authUrl: (state, redirect_uri) =>
        `https://appleid.apple.com/auth/authorize?${qs({ client_id: cfg.apple.clientId, redirect_uri, response_type: 'code', scope: 'name email', response_mode: 'form_post', state })}`,
      async profile(code, redirect_uri, extra) {
        const tok = await json(
          await f('https://appleid.apple.com/auth/token', { method: 'POST', body: form({ client_id: cfg.apple.clientId, client_secret: appleClientSecret(cfg.apple), code, grant_type: 'authorization_code', redirect_uri }) }),
        )
        const p = jwtPayload(String(tok.id_token))
        // Apple sends the name only on the very first sign-in, in the callback form.
        let name: string | undefined
        try {
          const u = extra.user ? JSON.parse(extra.user) : null
          name = [u?.name?.firstName, u?.name?.lastName].filter(Boolean).join(' ') || undefined
        } catch {}
        return { id: String(p.sub), email: p.email, emailVerified: p.email_verified === true || p.email_verified === 'true', name }
      },
    },
  }
}
