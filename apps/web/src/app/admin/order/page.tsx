'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import { ArrowLeft, Download, FileDown } from 'lucide-react'
import { getPalette, packTotal, pickPacks, withAllowance } from '@picobreads/pattern-engine'
import { PatternThumb } from '@/components/PatternThumb'
import { Swatch } from '@/components/ui'
import { PICKING, getTier } from '@/config/site'
import { useT } from '@/i18n'
import { legendOf } from '@/lib/pattern'
import { STATUS_STYLE, mockOrders, type OrderStatus } from '@/mock/orders'
import { SAMPLE_PHOTO_SVG } from '@/mock/samplePattern'

function OrderDetail() {
  const t = useT()
  const id = useSearchParams().get('id')
  const order = useMemo(() => mockOrders().find((o) => o.id === id) ?? mockOrders()[0], [id])
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const palette = getPalette(order.pattern.paletteId)
  const weight = palette.weightG ?? PICKING.estWeightG[order.beadSize]

  const pick = legendOf(order.pattern).map((l) => {
    const need = withAllowance(l.count, PICKING.allowance)
    const bags = pickPacks(need, PICKING.packSizes)
    return { ...l, need, bags, grams: packTotal(bags) * weight }
  })

  return (
    <>
      <Link href="/admin/" className="btn-ghost btn-sm -ml-3">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t.admin.orders}
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-mono text-2xl font-bold">{order.id}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_STYLE[status]}`}>{t.admin.status[status]}</span>
      </div>
      <p className="mt-1 text-muted">
        {order.customer} · {order.email} · {getTier(order.tier).name} {order.pattern.width}×{order.pattern.height} · {order.beadSize} ·{' '}
        {palette.brand}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {status === 'review' && (
          <button type="button" className="btn-primary btn-sm" onClick={() => setStatus('picking')}>
            {t.admin.approve}
          </button>
        )}
        {status === 'picking' && (
          <button type="button" className="btn-primary btn-sm" onClick={() => setStatus('picked')}>
            {t.admin.markPicked}
          </button>
        )}
        {status === 'picked' && (
          <button type="button" className="btn-primary btn-sm" onClick={() => setStatus('shipped')}>
            {t.admin.markShipped}
          </button>
        )}
        <button type="button" className="btn-secondary btn-sm" onClick={() => alert('Prototype: PDF export arrives in milestone 3.')}>
          <Download className="h-4 w-4" aria-hidden /> {t.admin.downloadPick}
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={() => alert('Prototype: PDF export arrives in milestone 3.')}>
          <FileDown className="h-4 w-4" aria-hidden /> {t.admin.downloadPattern}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-4">
          <div className="card p-3">
            <div className="rounded-xl bg-[var(--board)] p-1.5">
              <PatternThumb pattern={order.pattern} />
            </div>
          </div>
          <div className="card p-3">
            <p className="mb-2 text-sm font-semibold">{t.admin.photo}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SAMPLE_PHOTO_SVG} alt="Customer photo (sample)" className="w-full rounded-xl" />
          </div>
        </div>

        <section className="card overflow-x-auto">
          <h2 className="px-4 pt-4 font-bold">{t.admin.pickList}</h2>
          <p className="px-4 text-xs text-muted">
            +{Math.round(PICKING.allowance * 100)}% spare · bags {PICKING.packSizes.join(' / ')} · {weight} g/bead (estimate)
          </p>
          <table className="mt-3 w-full min-w-[36rem] text-left text-sm">
            <thead className="border-y border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                {Object.values(t.admin.pickCols).map((c) => (
                  <th key={c} className="px-4 py-2 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pick.map((p) => {
                const c = palette.colors[p.color]
                return (
                  <tr key={p.color}>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2">
                        <Swatch rgb={c.rgb} number={p.number} size={24} />
                        <span>
                          {c.name} <span className="font-mono text-xs text-muted">{c.code}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono tabular-nums">{p.count}</td>
                    <td className="px-4 py-2 font-mono tabular-nums">{p.need}</td>
                    <td className="px-4 py-2 font-mono">{p.bags.map((b) => `${b.qty}×${b.size}`).join(' + ')}</td>
                    <td className="px-4 py-2 font-mono tabular-nums">{p.grams.toFixed(1)}</td>
                    <td className="px-4 py-2 text-muted">—</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      </div>
    </>
  )
}

export default function AdminOrderPage() {
  return (
    <Suspense>
      <OrderDetail />
    </Suspense>
  )
}
