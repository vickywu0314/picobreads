'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Minus, Plus, Trash2 } from 'lucide-react'
import { V11Page } from '@/v11/Chrome'
import { V11_PRICE_PLACEHOLDER, v11Tier } from '@/v11/config'
import { Ironed } from '@/components/Ironed'
import { getPalette } from '@picobreads/pattern-engine'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'

export default function CartPage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const cart = useStore((s) => s.cart)
  const { setQty, removeFromCart } = useStore.getState()

  return (
    <V11Page>
      <main className="container-page py-6">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-4xl">{t.bag.title}</h1>
         
        </div>
        {!hydrated ? null : cart.length === 0 ? (
          <div className="card mt-6 p-10 text-center">
            <p className="text-muted">{t.cart.empty}</p>
            <Link href="/v1-1/create/" className="btn-primary mt-4">
              {t.home.heroCta}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_20rem]">
            <ul className="flex flex-col gap-3">
              {cart.map((item) => (
                <li key={item.id} className="card flex gap-4 p-3">
                  <div className="w-24 shrink-0 rounded-xl bg-surface-2 p-1.5">
                    <Ironed pattern={item.pattern} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold">{t.bag.itemTitle(t.v11.product.forms[item.form ?? 'kit'].title, t.v11.settings.tierTitle(v11Tier(item.tier).perSide))}</p>
                        <p className="text-sm text-muted">
                          {item.pattern.width} × {item.pattern.height} · {t.v11.settings.beads[item.beadSize].title} · {getPalette(item.pattern.paletteId).brand}
                        </p>
                      </div>
                      <p className="font-bold">{V11_PRICE_PLACEHOLDER}</p>
                    </div>
                    <details className="mt-1 text-xs text-muted">
                      <summary className="cursor-pointer">{t.cart.attrs}</summary>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-surface-2 p-2 font-mono">
                        {JSON.stringify(
                          { pattern_id: item.pattern.id, product: item.form ?? 'kit', tier: item.tier, bead_size: item.beadSize, palette: item.pattern.paletteId },
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
                <span>{V11_PRICE_PLACEHOLDER}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{t.cart.shippingNote}</p>
              <button type="button" className="btn-primary mt-5 w-full" onClick={() => {
                  useStore.getState().placeOrder()
                  router.push('/v1-1/checkout/success/')
                }}>
                <Lock className="h-4 w-4" aria-hidden /> {t.cart.checkout}
              </button>
              <p className="mt-3 text-center text-xs text-muted">{t.cart.checkoutNote}</p>
              <p className="mt-1 text-center text-xs text-muted">{t.bag.guestNote}</p>
            </aside>
          </div>
        )}
      </main>
    </V11Page>
  )
}
