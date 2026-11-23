import { readFileSync } from 'node:fs'
import type { WxPayConfig } from './wxpay'

export type ShopForm = 'kit' | 'finished'
export type ShopTier = 'small' | 'standard' | 'large'

/** Settings from environment variables (see .env.example). */
export interface Config {
  siteUrl: string
  port: number
  dbPath: string
  smtp: { host: string; port: number; user: string; pass: string; fromName: string }
  google: { id: string; secret: string }
  facebook: { id: string; secret: string }
  wechat: { id: string; secret: string }
  /** WeChat mini program (微信小程序): AppID / AppSecret, and which version its share codes open. */
  wxmp: { appId: string; secret: string; envVersion: 'release' | 'trial' | 'develop' }
  apple: { clientId: string; teamId: string; keyId: string; privateKey: string }
  /** WeChat Pay for the mini program. */
  wxpay: WxPayConfig
  /** Prices in fen (分) per form and size; a form is on sale only when all three sizes have a price. */
  prices: Record<ShopForm, Record<ShopTier, number>>
  shippingFen: number
  /** Where new paid orders are emailed. */
  adminEmail: string
  /** Password of the order admin page (/admin/). Empty = admin is off. */
  adminToken: string
  /** Secure cookies (https). Off only for local http testing. */
  secureCookies: boolean
}

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const s = (k: string, d = '') => (env[k] ?? d).trim()
  const siteUrl = s('SITE_URL', 'http://localhost:3000').replace(/\/+$/, '')
  /** Yuan (e.g. "39.9") → fen; 0 when missing or invalid. */
  const fen = (k: string) => {
    const v = Number(s(k))
    return Number.isFinite(v) && v > 0 ? Math.round(v * 100) : 0
  }
  const tiers = (form: string) => ({ small: fen(`PRICE_${form}_SMALL`), standard: fen(`PRICE_${form}_STANDARD`), large: fen(`PRICE_${form}_LARGE`) })
  // The merchant private key: a file path (WXPAY_PRIVATE_KEY_FILE) or the PEM itself with \n for newlines.
  let payKey = s('WXPAY_PRIVATE_KEY').replace(/\\n/g, '\n')
  const keyFile = s('WXPAY_PRIVATE_KEY_FILE')
  if (!payKey && keyFile) {
    try {
      payKey = readFileSync(keyFile, 'utf8')
    } catch (e) {
      console.error(`[config] cannot read WXPAY_PRIVATE_KEY_FILE ${keyFile}:`, (e as Error).message)
    }
  }
  return {
    siteUrl,
    port: Number(s('PORT', '8787')),
    dbPath: s('DB_PATH', './beadspark.db'),
    smtp: { host: s('SMTP_HOST', 'smtp.qq.com'), port: Number(s('SMTP_PORT', '465')), user: s('SMTP_USER'), pass: s('SMTP_PASS'), fromName: s('MAIL_FROM_NAME', 'BeadSpark') },
    google: { id: s('GOOGLE_CLIENT_ID'), secret: s('GOOGLE_CLIENT_SECRET') },
    facebook: { id: s('FACEBOOK_APP_ID'), secret: s('FACEBOOK_APP_SECRET') },
    wechat: { id: s('WECHAT_APP_ID'), secret: s('WECHAT_APP_SECRET') },
    wxmp: { appId: s('WXMP_APP_ID'), secret: s('WXMP_APP_SECRET'), envVersion: (['trial', 'develop'].includes(s('WXMP_ENV')) ? s('WXMP_ENV') : 'release') as Config['wxmp']['envVersion'] },
    apple: { clientId: s('APPLE_CLIENT_ID'), teamId: s('APPLE_TEAM_ID'), keyId: s('APPLE_KEY_ID'), privateKey: s('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n') },
    wxpay: {
      appId: s('WXMP_APP_ID'),
      mchId: s('WXPAY_MCH_ID'),
      apiV3Key: s('WXPAY_API_V3_KEY'),
      serialNo: s('WXPAY_SERIAL_NO'),
      privateKey: payKey,
      notifyUrl: s('WXPAY_NOTIFY_URL', siteUrl.startsWith('https://') ? `${siteUrl}/api/pay/wechat/notify` : ''),
    },
    prices: { kit: tiers('KIT'), finished: tiers('FINISHED') },
    shippingFen: fen('PRICE_SHIPPING'),
    adminEmail: s('ADMIN_EMAIL'),
    adminToken: s('ADMIN_TOKEN'),
    secureCookies: siteUrl.startsWith('https://'),
  }
}
