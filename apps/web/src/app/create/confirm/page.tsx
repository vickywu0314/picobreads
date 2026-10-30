'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { getPalette } from '@picobreads/pattern-engine'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Ironed } from '@/components/Ironed'
import { NoPattern } from '@/components/NoPattern'
import { Stepper } from '@/components/ui'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { finishedSize, legendOf } from '@/lib/pattern'

export default function ConfirmStep() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const draft = useStore((s) => s.draft)

  if (!hydrated) return <SiteHeader />
  if (!draft)
    return (
      <>
        <SiteHeader />
        <NoPattern />
      </>
    )

  const { pattern, form, tier, beadSize, priceUsd } = draft
  const fin = finishedSize(pattern.width, pattern.height, beadSize)
  const rows: [string, string, string?][] = [
    [t.flow.product, t.flow.forms[form].title, '/create/product/'],
    [
      t.flow.specs,
      `${t.tiers[tier]} · ${pattern.width} × ${pattern.height} · ${form === 'digital' ? '' : `${beadSize} · ≈ ${fin.cm} cm · `}${t.common.colors(legendOf(pattern).length)} · ${getPalette(pattern.paletteId).brand}`,
      '/create/settings/',
    ],
    [t.flow.price, `$${priceUsd}`],
    [t.flow.timing, t.flow.delivery[form]],
  ]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <Stepper step={5} />
        <h1 className="mt-6 font-serif text-4xl">{t.flow.confirmTitle}</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="card p-4">
            <div className="rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,0.12)_0_25%,transparent_0_50%)] bg-[length:20px_20px] p-4">
              <Ironed pattern={pattern} />
            </div>
          </div>
          <div>
            <dl className="card divide-y divide-border">
              {rows.map(([k, v, edit]) => (
                <div key={k} className="flex items-start gap-4 p-4">
                  <dt className="w-32 shrink-0 text-sm text-muted">{k}</dt>
                  <dd className="flex-1 font-semibold">{v}</dd>
                  {edit && (
                    <Link href={edit} className="text-sm font-semibold text-accent hover:underline">
                      {t.flow.edit}
                    </Link>
                  )}
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-muted">{t.flow.placeholderPrices}</p>
            <button
              type="button"
              className="btn-primary mt-6 h-14 w-full text-lg"
              onClick={() => {
                useStore.getState().addToCart({ form, tier, beadSize, priceUsd, pattern })
                router.push('/cart/')
              }}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden /> {t.flow.addToBag}
            </button>
            <p className="mt-3 flex justify-center">
              <ProtoTag />
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
