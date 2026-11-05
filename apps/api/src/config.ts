/** Settings from environment variables (see .env.example). */
export interface Config {
  siteUrl: string
  port: number
  dbPath: string
  smtp: { host: string; port: number; user: string; pass: string; fromName: string }
  google: { id: string; secret: string }
  facebook: { id: string; secret: string }
  wechat: { id: string; secret: string }
  apple: { clientId: string; teamId: string; keyId: string; privateKey: string }
  /** Secure cookies (https). Off only for local http testing. */
  secureCookies: boolean
}

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const s = (k: string, d = '') => (env[k] ?? d).trim()
  const siteUrl = s('SITE_URL', 'http://localhost:3000').replace(/\/+$/, '')
  return {
    siteUrl,
    port: Number(s('PORT', '8787')),
    dbPath: s('DB_PATH', './beadspark.db'),
    smtp: { host: s('SMTP_HOST', 'smtp.qq.com'), port: Number(s('SMTP_PORT', '465')), user: s('SMTP_USER'), pass: s('SMTP_PASS'), fromName: s('MAIL_FROM_NAME', 'BeadSpark') },
    google: { id: s('GOOGLE_CLIENT_ID'), secret: s('GOOGLE_CLIENT_SECRET') },
    facebook: { id: s('FACEBOOK_APP_ID'), secret: s('FACEBOOK_APP_SECRET') },
    wechat: { id: s('WECHAT_APP_ID'), secret: s('WECHAT_APP_SECRET') },
    apple: { clientId: s('APPLE_CLIENT_ID'), teamId: s('APPLE_TEAM_ID'), keyId: s('APPLE_KEY_ID'), privateKey: s('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n') },
    secureCookies: siteUrl.startsWith('https://'),
  }
}
