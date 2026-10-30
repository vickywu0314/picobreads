'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Check, ShoppingBag } from 'lucide-react'
import { getPalette, type BeadSize } from '@picobreads/pattern-engine'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { PatternThumb } from '@/components/PatternThumb'
import { NoPattern } from '@/components/NoPattern'
import { Segmented, Toggle } from '@/components/ui'
import { ASSEMBLED_VARIANT_ENABLED, TIERS, type TierId } from '@/config/site'
import { useT } from '@/i18n'
import { buildPattern, useHydrated, useStore } from '@/lib/store'
import { boardCount, finishedSize, legendOf } from '@/lib/pattern'

export default function KitPage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const pattern = useStore((s) => s.pattern)
  const settings = useStore((s) => s.settings)
  const aspectId = useStore((s) => s.aspectId)
  const addToCart = useStore((s) => s.addToCart)
  const [tier, setTier] = useState<TierId>(settings.tier)
  const [beadSize, setBeadSize] = useState<BeadSize>(settings.beadSize)

  // Same pattern at every tier; the user's current one (with any fixes) for its own tier.
  const variants = useMemo(() => {
    if (!pattern) return []
    return TIERS.map((tr) => {
      const p = tr.id === settings.tier ? pattern : buildPattern(settings, aspectId, tr.id)
      return { tier: tr, pattern: p, colors: legendOf(p).length }
    })
  }, [pattern, settings, aspectId])

  if (!hydrated) return <SiteHeader />
  if (!pattern)
    return (
      <>
        <SiteHeader />
        <NoPattern />
      </>
    )

  const chosen = variants.find((v) => v.tier.id === tier)!

  return (
    <>
      <SiteHeader />
      <main className="container-page py-6">
        <h1 className="text-3xl font-extrabold tracking-tight">{t.kit.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.kit.subtitle}</p>

        <div className="mt-6 max-w-sm">
          <p className="label mb-2">{t.kit.beadSize}</p>
          <Segmented
            label={t.kit.beadSize}
            value={beadSize}
            onChange={setBeadSize}
            options={(['5mm', '2.6mm'] as const).map((b) => ({ value: b, label: b }))}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3" role="radiogroup" aria-label={t.kit.sizeAria}>
          {variants.map(({ tier: tr, pattern: p, colors }) => {
            const active = tr.id === tier
            const fin = finishedSize(p.width, p.height, beadSize)
            return (
              <button
                key={tr.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTier(tr.id)}
                className={`card relative flex flex-col p-4 text-left transition-shadow ${
                  active ? 'border-accent ring-2 ring-accent' : 'hover:shadow-md'
                }`}
              >
                {tr.id === settings.tier && (
                  <span className="absolute right-3 top-3 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
                    {t.kit.sameAsPattern}
                  </span>
                )}
                <div className="mx-auto w-40 rounded-xl bg-[var(--board)] p-1.5">
                  <PatternThumb pattern={p} />
                </div>
                <h2 className="mt-4 text-xl font-bold">{t.tiers[tr.id]}</h2>
                <p className="text-sm text-muted">
                  {p.width} × {p.height} · {fin.inch} in
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>{t.common.beads(p.width * p.height)}</li>
                  <li>{t.common.colors(colors)}</li>
                  <li>{t.settings.boards(boardCount(p.width, p.height))}</li>
                </ul>
                <p className="mt-4 text-2xl font-extrabold">
                  ${tr.priceUsd}
                  <span className="ml-2 align-middle text-xs font-medium text-muted">{t.kit.priceNote}</span>
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ul className="card space-y-2 p-5">
            {t.kit.includes.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-ok" aria-hidden /> {s}
              </li>
            ))}
          </ul>
          <div className="card flex items-center justify-between gap-4 p-5 opacity-70">
            <div>
              <p className="font-bold">{t.kit.assembled}</p>
              <p className="text-sm text-muted">{t.kit.assembledNote}</p>
            </div>
            <Toggle label={t.kit.assembled} checked={ASSEMBLED_VARIANT_ENABLED} onChange={() => {}} />
          </div>
        </div>

        <div className="sticky bottom-0 -mx-4 mt-8 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold">
                {t.tiers[tier]} · {beadSize}
              </p>
              <p className="text-sm text-muted">
                ${chosen.tier.priceUsd} · {t.kit.brand(getPalette(chosen.pattern.paletteId).brand)}
              </p>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                addToCart({ tier, beadSize, priceUsd: chosen.tier.priceUsd, pattern: chosen.pattern })
                router.push('/cart/')
              }}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden /> {t.kit.addToCart}
            </button>
          </div>
          <div className="mt-2 text-right">
            <ProtoTag />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
