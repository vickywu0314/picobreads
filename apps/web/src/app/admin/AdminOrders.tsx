'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Loader2, LogOut, PackageCheck, RefreshCw, Undo2 } from 'lucide-react'
import { countColors, getPalette, pickPacks, withAllowance, type Pattern } from '@picobreads/pattern-engine'
import { Ironed } from '@/components/Ironed'
import { Modal } from '@/components/ui'
import { PICKING } from '@/config/site'
import { API_BASE } from '@/lib/api'
import { css } from '@/lib/pattern'
import { V11Page } from '@/v11/Chrome'

// Order admin for the shop owner: paid orders, what to pack, mark as shipped, refund.
// The password (ADMIN_TOKEN on the server) is kept in this browser only.

type Status = 'pending' | 'paid' | 'shipped' | 'refunded' | 'closed'
interface Address {
  name: string
  phone: string
  province: string
  city: string
  county: string
  detail: string
}
interface Order {
  id: string
  form: 'kit' | 'finished'
  tier: string
  name: string
  amountFen: number
  status: Status
  createdAt: number
  paidAt: number | null
  shippedAt: number | null
  carrier: string | null
  trackingNo: string | null
  address: Address
  note: string | null
  shareUrl: string | null
  transactionId: string | null
}
interface OrderDetail extends Order {
  pattern: Omit<Pattern, 'id'>
  beadSize: '2.6mm' | '5mm'
}

const TOKEN_KEY = 'bs-admin-token'
const FORM: Record<string, string> = { kit: '材料包', finished: '成品' }
const STATUS: Record<Status, string> = { pending: '待付款', paid: '待发货', shipped: '已发货', refunded: '已退款', closed: '已取消' }
const TABS: { id: string; label: string }[] = [
  { id: 'paid', label: '待发货' },
  { id: 'shipped', label: '已发货' },
  { id: 'refunded', label: '已退款' },
  { id: 'pending', label: '待付款' },
]
const CARRIERS = ['顺丰速运', '中通快递', '圆通速递', '韵达快递', '申通快递', '极兔速递', '邮政 EMS', '京东物流']
const yuan = (fen: number) => `¥${(fen / 100).toFixed(2)}`
const time = (ms: number | null) => (ms ? new Date(ms).toLocaleString('zh-CN', { hour12: false }) : '—')
const fullAddress = (a: Address) => `${a.province}${a.city}${a.county}${a.detail}`

async function call<T>(token: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'x-admin-token': token, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `http_${res.status}`)
  return data as T
}

const ERRORS: Record<string, string> = {
  bad_admin_token: '口令不对',
  bad_tracking: '快递公司和运单号都要填',
  not_shippable: '这个订单现在不能发货（没付款或已退款）',
  not_refundable: '这个订单不能退款',
  refund_failed: '微信退款没成功，请到商户平台看一下原因',
  not_found: '找不到这个订单',
}
const message = (e: unknown) => ERRORS[(e as Error).message] ?? `出错了：${(e as Error).message}`

export function AdminOrders() {
  const [token, setToken] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [tab, setTab] = useState('paid')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<OrderDetail | null>(null)
  const [busy, setBusy] = useState(false)
  const [carrier, setCarrier] = useState(CARRIERS[0])
  const [trackingNo, setTrackingNo] = useState('')

  useEffect(() => {
    try {
      setToken(localStorage.getItem(TOKEN_KEY) || '')
    } catch {
      setToken('')
    }
  }, [])

  const load = useCallback(
    async (t: string, status: string) => {
      setError(null)
      try {
        const r = await call<{ orders: Order[]; counts: Record<string, number> }>(t, `/orders?status=${status}`)
        setOrders(r.orders)
        setCounts(r.counts)
      } catch (e) {
        if ((e as Error).message === 'bad_admin_token') {
          try {
            localStorage.removeItem(TOKEN_KEY)
          } catch {}
          setToken('')
        }
        setError(message(e))
      }
    },
    [],
  )
  useEffect(() => {
    if (token) void load(token, tab)
  }, [token, tab, load])

  const signIn = (e: React.FormEvent) => {
    e.preventDefault()
    const t = input.trim()
    if (!t) return
    try {
      localStorage.setItem(TOKEN_KEY, t)
    } catch {}
    setToken(t)
  }
  const signOut = () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {}
    setToken('')
    setOrders(null)
  }

  const show = async (id: string) => {
    if (!token) return
    try {
      const { order } = await call<{ order: OrderDetail }>(token, `/orders/${id}`)
      setOpen(order)
      setCarrier(order.carrier || CARRIERS[0])
      setTrackingNo(order.trackingNo || '')
    } catch (e) {
      setError(message(e))
    }
  }

  const act = async (path: string, body: unknown, confirmText?: string) => {
    if (!token || !open) return
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(true)
    setError(null)
    try {
      const r = await call<{ wechat?: { ok: boolean; error?: string } }>(token, `/orders/${open.id}/${path}`, body)
      setOpen(null)
      await load(token, tab)
      // Shipping is saved either way; say so when WeChat didn't take the shipping notice.
      if (r.wechat && !r.wechat.ok) setError(`已标记发货，但通知微信没成功（买家不会收到微信的发货通知）：${r.wechat.error ?? ''}`)
    } catch (e) {
      setError(message(e))
    } finally {
      setBusy(false)
    }
  }

  if (token === null) return <V11Page footer={false}>{null}</V11Page>

  if (!token)
    return (
      <V11Page footer={false}>
        <main className="mx-auto w-full max-w-sm px-4 py-16">
          <form className="card flex flex-col gap-4 p-6" onSubmit={signIn}>
            <h1 className="font-display text-2xl">订单管理</h1>
            <label className="block">
              <span className="label">管理口令</span>
              <input type="password" autoFocus className="input mt-1.5" value={input} onChange={(e) => setInput(e.target.value)} />
            </label>
            {error && <p className="text-sm font-semibold text-[var(--accent-hover)]">{error}</p>}
            <button type="submit" className="btn-primary">
              进入
            </button>
            <p className="text-xs text-muted">口令是服务器配置里的 ADMIN_TOKEN，只保存在这台设备的浏览器里。</p>
          </form>
        </main>
      </V11Page>
    )

  return (
    <V11Page footer={false}>
      <main className="container-page py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl">订单管理</h1>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary btn-sm" onClick={() => void load(token, tab)}>
              <RefreshCw className="h-4 w-4" aria-hidden /> 刷新
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden /> 退出
            </button>
          </div>
        </div>

        <div role="tablist" className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-bold ${tab === t.id ? 'border-[var(--accent-hover)] bg-[var(--accent)] text-white' : 'border-[var(--ink)] bg-[var(--surface)]'}`}
            >
              {t.label} {counts[t.id] ? `(${counts[t.id]})` : ''}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent-hover)]">{error}</p>}

        {orders === null ? (
          <p className="mt-8 flex items-center gap-2 text-muted">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> 加载中…
          </p>
        ) : orders.length === 0 ? (
          <p className="card mt-6 p-6 text-sm text-muted">这里还没有订单。</p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {orders.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => void show(o.id)} className="card flex w-full flex-wrap items-center gap-x-6 gap-y-1 p-4 text-left hover:-translate-y-0.5">
                  <span className="font-bold">
                    {FORM[o.form]} · {o.name}
                  </span>
                  <span className="text-sm text-muted">{o.id}</span>
                  <span className="text-sm">
                    {o.address.name} {o.address.phone}
                  </span>
                  <span className="text-sm text-muted">{time(o.paidAt ?? o.createdAt)}</span>
                  {o.trackingNo && (
                    <span className="text-sm">
                      {o.carrier} {o.trackingNo}
                    </span>
                  )}
                  <span className="ml-auto font-bold text-[var(--accent)]">{yuan(o.amountFen)}</span>
                  <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-xs font-bold">{STATUS[o.status]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `${FORM[open.form]} · ${open.name}` : ''}>
        {open && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <div className="rounded-2xl bg-[var(--blush)] p-2">
                <Ironed pattern={{ ...open.pattern, id: open.id }} />
              </div>
              <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5">
                <dt className="text-muted">订单号</dt>
                <dd className="break-all font-mono">{open.id}</dd>
                <dt className="text-muted">状态</dt>
                <dd className="font-bold">
                  {STATUS[open.status]} · {yuan(open.amountFen)}
                </dd>
                <dt className="text-muted">付款时间</dt>
                <dd>{time(open.paidAt)}</dd>
                <dt className="text-muted">规格</dt>
                <dd>
                  {open.pattern.width}×{open.pattern.height} 格 · {open.beadSize === '5mm' ? '标准豆 5 mm' : '迷你豆 2.6 mm'}
                </dd>
                <dt className="text-muted">收货人</dt>
                <dd>
                  {open.address.name} {open.address.phone}
                </dd>
                <dt className="text-muted">地址</dt>
                <dd>{fullAddress(open.address)}</dd>
              </dl>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => void navigator.clipboard.writeText(`${open.address.name} ${open.address.phone} ${fullAddress(open.address)}`)}
              >
                <Copy className="h-4 w-4" aria-hidden /> 复制收货信息
              </button>
              {open.shareUrl && (
                <a href={open.shareUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                  打开图纸页
                </a>
              )}
            </div>

            <PickingList order={open} />

            {(open.status === 'paid' || open.status === 'shipped') && (
              <div className="rounded-2xl border-[1.5px] border-[var(--border)] p-3">
                <p className="font-bold">{open.status === 'shipped' ? '改运单号' : '发货'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <select className="input w-auto" value={CARRIERS.includes(carrier) ? carrier : ''} onChange={(e) => setCarrier(e.target.value)} aria-label="快递公司">
                    {CARRIERS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input className="input min-w-0 flex-1" placeholder="运单号" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} />
                  <button type="button" className="btn-primary" disabled={busy || !trackingNo.trim()} onClick={() => void act('ship', { carrier, trackingNo })}>
                    <PackageCheck className="h-4 w-4" aria-hidden /> {open.status === 'shipped' ? '保存' : '标记已发货'}
                  </button>
                </div>
              </div>
            )}
            {(open.status === 'paid' || open.status === 'shipped') && (
              <button
                type="button"
                className="self-start text-sm font-bold text-[var(--accent-hover)] underline"
                disabled={busy}
                onClick={() => {
                  const reason = window.prompt(`全额退款 ${yuan(open.amountFen)} 给顾客（原路退回，不能撤销）。\n退款原因：`)
                  if (reason !== null) void act('refund', { reason })
                }}
              >
                <Undo2 className="mr-1 inline h-4 w-4" aria-hidden />
                全额退款
              </button>
            )}
          </div>
        )}
      </Modal>
    </V11Page>
  )
}

/** What to pack: beads per color (kits get the spare allowance), and which bags to take. */
function PickingList({ order }: { order: OrderDetail }) {
  const rows = useMemo(() => {
    const palette = getPalette(order.pattern.paletteId)
    const allowance = order.form === 'kit' ? PICKING.allowance : 0
    return countColors(order.pattern.cells).map((c) => {
      const need = withAllowance(c.count, allowance)
      const packs = pickPacks(need, PICKING.packSizes)
      return { ...c, color: palette.colors[c.color], need, packs: packs.map((p) => `${p.size}×${p.qty}`).join(' + ') }
    })
  }, [order])
  const total = rows.reduce((n, r) => n + r.need, 0)
  return (
    <details className="rounded-2xl border-[1.5px] border-[var(--border)] p-3" open={order.status === 'paid'}>
      <summary className="cursor-pointer font-bold">
        拣货清单 · {rows.length} 色 · {total.toLocaleString()} 颗{order.form === 'kit' ? `（含 ${PICKING.allowance * 100}% 备用）` : '（成品，按实际颗数）'}
      </summary>
      <table className="mt-2 w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-muted">
            <th className="py-1">色号</th>
            <th>图纸颗数</th>
            <th>要备</th>
            <th>取袋（颗×袋）</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.color.code} className="border-t border-[var(--border)]">
              <td className="py-1">
                <span className="mr-2 inline-block h-4 w-4 rounded-full align-[-3px] ring-1 ring-black/15" style={{ background: css(r.color.rgb) }} />
                <span className="font-bold">{r.color.code}</span>
              </td>
              <td>{r.count}</td>
              <td className="font-bold">{r.need}</td>
              <td className="text-muted">{r.packs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
