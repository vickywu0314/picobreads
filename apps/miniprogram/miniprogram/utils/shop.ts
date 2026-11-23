import type { Pattern } from '../lib/engine'
import { api, ensureLogin, login } from './api'
import { BOARD_PEGS, type BeadSize } from './config'

export type Form = 'digital' | 'kit' | 'finished'
export type Tier = 'small' | 'standard' | 'large'

export interface Shop {
  forms: Record<'kit' | 'finished', { open: boolean; prices: Record<Tier, number> }>
  shippingFen: number
}

export interface Address {
  name: string
  phone: string
  province: string
  city: string
  county: string
  detail: string
}

export interface Order {
  id: string
  form: 'kit' | 'finished'
  tier: Tier
  name: string
  amountFen: number
  status: 'pending' | 'paid' | 'shipped' | 'refunded' | 'closed'
  createdAt: number
  paidAt: number | null
  shippedAt: number | null
  /** Until when an unpaid order can still be paid (ms). */
  payUntil: number | null
  carrier: string | null
  trackingNo: string | null
  address: Address
  pattern: Omit<Pattern, 'id'>
  beadSize: BeadSize
}

/** What is on sale. When the server can't be reached, nothing is. */
export async function loadShop(): Promise<Shop> {
  const closed = { open: false, prices: { small: 0, standard: 0, large: 0 } }
  try {
    return await api<Shop>('/shop')
  } catch {
    return { forms: { kit: closed, finished: closed }, shippingFen: 0 }
  }
}

/** Size class the price goes by (same rule as the server). */
export function tierOf(p: { width: number; height: number }, bead: BeadSize): Tier {
  const n = Math.ceil(p.width / BOARD_PEGS[bead]) * Math.ceil(p.height / BOARD_PEGS[bead])
  return n <= 1 ? 'small' : n <= 4 ? 'standard' : 'large'
}

export const yuan = (fen: number) => `¥${(fen / 100).toFixed(fen % 100 ? 2 : 0)}`

export const FORM_NAME: Record<Form, string> = { digital: '免费图纸', kit: '材料包', finished: '拼好的成品' }
export const STATUS_NAME: Record<Order['status'], string> = { pending: '待付款', paid: '已付款，制作中', shipped: '已发货', refunded: '已退款', closed: '已取消' }

/** Pick a delivery address with WeChat's address book. Null when cancelled. */
export function chooseAddress(): Promise<Address | null> {
  return new Promise((resolve) =>
    wx.chooseAddress({
      success: (r) => resolve({ name: r.userName, phone: r.telNumber, province: r.provinceName, city: r.cityName, county: r.countyName, detail: r.detailInfo }),
      fail: () => resolve(null),
    }),
  )
}

type PayParams = { timeStamp: string; nonceStr: string; package: string; signType: 'RSA'; paySign: string }
export type PayOutcome = 'paid' | 'pending' | 'cancelled'

/** Open WeChat Pay, then ask the server whether the money arrived. Never throws for a cancelled payment. */
async function payAndConfirm(order: Order, pay: PayParams): Promise<{ order: Order; outcome: PayOutcome }> {
  const done = await new Promise<boolean>((resolve, reject) =>
    wx.requestPayment({
      ...pay,
      success: () => resolve(true),
      fail: (err) => (/cancel/i.test(err.errMsg) ? resolve(false) : reject(new Error(err.errMsg))),
    }),
  )
  if (!done) return { order, outcome: 'cancelled' }
  // The payment screen said OK; the server confirms with WeChat (retry briefly while it settles).
  for (let i = 0; i < 4; i++) {
    const r = await api<{ order: Order }>(`/orders/${order.id}`)
    if (r.order.status !== 'pending') return { order: r.order, outcome: 'paid' }
    await new Promise((x) => setTimeout(x, 1200))
  }
  return { order, outcome: 'pending' }
}

/** Create the order and pay for it. The order exists even when the payment is cancelled (it can be paid later). */
export async function buy(o: { form: 'kit' | 'finished'; name: string; pattern: Pattern; placed?: string; beadSize: BeadSize; address: Address }) {
  await ensureLogin()
  const body = { form: o.form, name: o.name, beadSize: o.beadSize, placed: o.placed, address: o.address, pattern: { width: o.pattern.width, height: o.pattern.height, paletteId: o.pattern.paletteId, cells: o.pattern.cells } }
  let r: { order: Order; pay: PayParams }
  try {
    r = await api('/orders', { data: body })
  } catch (e) {
    // The server needs this user's openid from a fresh WeChat sign-in.
    if ((e as { code?: string }).code !== 'no_openid') throw e
    await login()
    r = await api('/orders', { data: body })
  }
  return payAndConfirm(r.order, r.pay)
}

/** Pay an unpaid order (again). */
export async function payOrder(id: string): Promise<{ order: Order; outcome: PayOutcome }> {
  await ensureLogin()
  let r: { order: Order; pay: PayParams | null }
  try {
    r = await api(`/orders/${id}/pay`, { data: {} })
  } catch (e) {
    if ((e as { code?: string }).code !== 'no_openid') throw e
    await login()
    r = await api(`/orders/${id}/pay`, { data: {} })
  }
  // No pay parameters: it was paid meanwhile, or it is closed.
  if (!r.pay) return { order: r.order, outcome: r.order.status === 'pending' ? 'pending' : 'paid' }
  return payAndConfirm(r.order, r.pay)
}

export async function cancelOrder(id: string): Promise<Order> {
  return (await api<{ order: Order }>(`/orders/${id}/cancel`, { data: {} })).order
}

export async function getOrder(id: string): Promise<Order> {
  return (await api<{ order: Order }>(`/orders/${id}`)).order
}
