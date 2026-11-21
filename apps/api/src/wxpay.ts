import { createDecipheriv, createSign, randomBytes } from 'node:crypto'

/** WeChat Pay (API v3, JSAPI / mini program). All values come from the merchant platform. */
export interface WxPayConfig {
  /** Mini program AppID the payment is made in. */
  appId: string
  mchId: string
  /** APIv3 key (32 chars) — decrypts payment notifications. */
  apiV3Key: string
  /** Serial number of the merchant API certificate. */
  serialNo: string
  /** Merchant API private key (apiclient_key.pem contents). */
  privateKey: string
  /** https URL WeChat calls when a payment succeeds. */
  notifyUrl: string
}

export const wxPayReady = (c: WxPayConfig) => !!(c.appId && c.mchId && c.apiV3Key && c.serialNo && c.privateKey && c.notifyUrl)

const rsaSign = (cfg: WxPayConfig, message: string) => createSign('RSA-SHA256').update(message).sign(cfg.privateKey, 'base64')

async function call(cfg: WxPayConfig, f: typeof fetch, method: 'GET' | 'POST', path: string, body?: object) {
  const ts = Math.floor(Date.now() / 1000)
  const nonce = randomBytes(16).toString('hex')
  const payload = body ? JSON.stringify(body) : ''
  const signature = rsaSign(cfg, `${method}\n${path}\n${ts}\n${nonce}\n${payload}\n`)
  const res = await f(`https://api.mch.weixin.qq.com${path}`, {
    method,
    headers: {
      authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${cfg.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${ts}",serial_no="${cfg.serialNo}"`,
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': 'beadspark-api',
    },
    body: body ? payload : undefined,
  })
  const text = await res.text()
  let json: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    json = text ? JSON.parse(text) : {}
  } catch {}
  if (!res.ok) throw new Error(`wxpay ${res.status} ${json.code ?? ''} ${json.message ?? text.slice(0, 200)}`)
  return json
}

/** Create the payment and return what wx.requestPayment needs. */
export async function prepay(cfg: WxPayConfig, f: typeof fetch, o: { outTradeNo: string; description: string; amountFen: number; openid: string }) {
  const r = await call(cfg, f, 'POST', '/v3/pay/transactions/jsapi', {
    appid: cfg.appId,
    mchid: cfg.mchId,
    description: o.description.slice(0, 120),
    out_trade_no: o.outTradeNo,
    notify_url: cfg.notifyUrl,
    amount: { total: o.amountFen, currency: 'CNY' },
    payer: { openid: o.openid },
  })
  if (!r.prepay_id) throw new Error('wxpay: no prepay_id')
  const timeStamp = String(Math.floor(Date.now() / 1000))
  const nonceStr = randomBytes(16).toString('hex')
  const pkg = `prepay_id=${r.prepay_id}`
  return { timeStamp, nonceStr, package: pkg, signType: 'RSA' as const, paySign: rsaSign(cfg, `${cfg.appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`) }
}

export interface PayState {
  /** SUCCESS, NOTPAY, CLOSED, REFUND, USERPAYING, PAYERROR … */
  state: string
  transactionId?: string
  totalFen?: number
}

/** Ask WeChat for the state of an order (our signed request, so the answer can be trusted). */
export async function queryOrder(cfg: WxPayConfig, f: typeof fetch, outTradeNo: string): Promise<PayState> {
  const r = await call(cfg, f, 'GET', `/v3/pay/transactions/out-trade-no/${encodeURIComponent(outTradeNo)}?mchid=${cfg.mchId}`)
  return { state: String(r.trade_state ?? ''), transactionId: r.transaction_id, totalFen: r.amount?.total }
}

/** Decrypt a payment notification's `resource` (AES-256-GCM with the APIv3 key). Throws when it isn't genuine. */
export function decryptNotify(cfg: WxPayConfig, resource: { ciphertext: string; nonce: string; associated_data?: string }): Record<string, any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const data = Buffer.from(resource.ciphertext, 'base64')
  const tag = data.subarray(data.length - 16)
  const d = createDecipheriv('aes-256-gcm', Buffer.from(cfg.apiV3Key, 'utf8'), Buffer.from(resource.nonce, 'utf8'))
  d.setAuthTag(tag)
  d.setAAD(Buffer.from(resource.associated_data ?? '', 'utf8'))
  return JSON.parse(Buffer.concat([d.update(data.subarray(0, data.length - 16)), d.final()]).toString('utf8'))
}
