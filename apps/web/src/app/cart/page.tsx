'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Minus, Plus, Trash2 } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { PatternThumb } from '@/components/PatternThumb'
import { getPalette } from '@picobreads/pattern-engine'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'

export default function CartPage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const cart = useStore((s) => s.cart)
  const { setQty, removeFromCart } = useStore.getState()
  const subtotal = cart.reduce((n, c) => n + c.priceUsd * c.qty, 0)

  return (
    <>
      <SiteHeader />
      <main className="container-page py-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{t.cart.title}</h1>
          <ProtoTag />
        </div>
        {!hydrated ? null : cart.length === 0 ? (
          <div className="card mt-6 p-10 text-center">
            <p className="text-muted">{t.cart.empty}</p>
            <Link href="/create/" className="btn-primary mt-4">
              {t.home.cta}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_20rem]">
            <ul className="flex flex-col gap-3">
              {cart.map((item) => (
                <li key={item.id} className="card flex gap-4 p-3">
                  <div className="w-24 shrink-0 rounded-xl bg-[var(--board)] p-1">
                    <PatternThumb pattern={item.pattern} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold">{t.cart.itemTitle(t.tiers[item.tier])}</p>
                        <p className="text-sm text-muted">
                          {item.pattern.width} × {item.pattern.height} · {item.beadSize} · {getPalette(item.pattern.paletteId).brand}
                        </p>
                      </div>
                      <p className="font-bold">${item.priceUsd * item.qty}</p>
                    </div>
                    <details className="mt-1 text-xs text-muted">
                      <summary className="cursor-pointer">{t.cart.attrs}</summary>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-surface-2 p-2 font-mono">
                        {JSON.stringify(
                          { pattern_id: item.pattern.id, tier: item.tier, bead_size: item.beadSize, palette: item.pattern.paletteId },
                          null,
                          1,
                        )}
                      </pre>
                    </details>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button type="button" className="icon-btn h-9 w-9" onClick={() => setQty(item.id, item.qty - 1)} aria-label={t.common.decrease}>
                          <Minus className="h-4 w-4" aria-hidden />
                        </button>
                        <span className="w-6 text-center font-semibold tabular-nums">{item.qty}</span>
                        <button type="button" className="icon-btn h-9 w-9" onClick={() => setQty(item.id, item.qty + 1)} aria-label={t.common.increase}>
                          <Plus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <button type="button" className="btn-ghost btn-sm text-muted" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden /> {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="card h-fit p-5">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>{t.cart.subtotal}</span>
                <span>${subtotal}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{t.cart.shippingNote}</p>
              <button type="button" className="btn-primary mt-5 w-full" onClick={() => router.push('/checkout/success/')}>
                <Lock className="h-4 w-4" aria-hidden /> {t.cart.checkout}
              </button>
              <p className="mt-3 text-center text-xs text-muted">{t.cart.checkoutNote}</p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
