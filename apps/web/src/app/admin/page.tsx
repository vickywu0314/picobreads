'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { getTier } from '@/config/site'
import { useT } from '@/i18n'
import { STATUS_STYLE, mockOrders, type OrderStatus } from '@/mock/orders'

export default function AdminOrdersPage() {
  const t = useT()
  const orders = useMemo(() => mockOrders(), [])
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const list = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
  const filters: (OrderStatus | 'all')[] = ['all', 'review', 'picking', 'picked', 'shipped']

  return (
    <>
      <h1 className="text-2xl font-bold">{t.admin.orders}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`h-9 rounded-full border px-3 text-sm font-semibold ${
              filter === f ? 'border-accent bg-accent-soft' : 'border-border text-muted'
            }`}
          >
            {f === 'all' ? t.admin.all : t.admin.status[f]} ({f === 'all' ? orders.length : orders.filter((o) => o.status === f).length})
          </button>
        ))}
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              {Object.values(t.admin.cols).map((c) => (
                <th key={c} className="px-4 py-3 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-surface-2">
                <td className="px-4 py-3 font-mono font-semibold">
                  <Link href={`/admin/order/?id=${encodeURIComponent(o.id)}`} className="text-accent hover:underline">
                    {o.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{new Date(o.date).toLocaleDateString('en-US')}</td>
                <td className="px-4 py-3">{o.customer}</td>
                <td className="px-4 py-3">
                  {getTier(o.tier).name} · {o.pattern.width}×{o.pattern.height} · {o.beadSize}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[o.status]}`}>{t.admin.status[o.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
