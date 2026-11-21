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
  status: 'pending' | 'paid' | 'shipped' | 'closed'
  createdAt: number
  address: Address
  pattern: Omit<Pattern, 'id'>
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
export const STATUS_NAME: Record<Order['status'], string> = { pending: '待付款', paid: '已付款，备货中', shipped: '已发货', closed: '已关闭' }

/** Pick a delivery address with WeChat's address book. Null when cancelled. */
export function chooseAddress(): Promise<Address | null> {
  return new Promise((resolve) =>
    wx.chooseAddress({
      success: (r) => resolve({ name: r.userName, phone: r.telNumber, province: r.provinceName, city: r.cityName, county: r.countyName, detail: r.detailInfo }),
      fail: () => resolve(null),
    }),
  )
}

/**
 * Create the order, pay with WeChat Pay, then ask the server whether the money arrived.
 * Returns the order (status paid when everything went through), or throws ApiError / 'cancelled'.
 */
export async function buy(o: { form: 'kit' | 'finished'; name: string; pattern: Pattern; placed?: string; beadSize: BeadSize; address: Address }): Promise<Order> {
  await ensureLogin()
  const body = { form: o.form, name: o.name, beadSize: o.beadSize, placed: o.placed, address: o.address, pattern: { width: o.pattern.width, height: o.pattern.height, paletteId: o.pattern.paletteId, cells: o.pattern.cells } }
  let r: { order: Order; pay: { timeStamp: string; nonceStr: string; package: string; signType: 'RSA'; paySign: string } }
  try {
    r = await api('/orders', { data: body })
  } catch (e) {
    // The server needs this user's openid from a fresh WeChat sign-in.
    if ((e as { code?: string }).code !== 'no_openid') throw e
    await login()
    r = await api('/orders', { data: body })
  }
  await new Promise<void>((resolve, reject) =>
    wx.requestPayment({
      ...r.pay,
      success: () => resolve(),
      fail: (err) => reject(new Error(/cancel/i.test(err.errMsg) ? 'cancelled' : err.errMsg)),
    }),
  )
  // The payment screen said OK; the server confirms with WeChat (retry briefly while it settles).
  for (let i = 0; i < 4; i++) {
    const { order } = await api<{ order: Order }>(`/orders/${r.order.id}`)
    if (order.status !== 'pending') return order
    await new Promise((x) => setTimeout(x, 1200))
  }
  return r.order
}
