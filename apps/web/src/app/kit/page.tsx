'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Info, Loader2, ShoppingBag } from 'lucide-react'
import { getPalette, type BeadSize } from '@picobreads/pattern-engine'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { PatternThumb } from '@/components/PatternThumb'
import { NoPattern } from '@/components/NoPattern'
import { Segmented, Toggle } from '@/components/ui'
import { ASSEMBLED_VARIANT_ENABLED, KIT_PALETTE_IDS, TIERS, gridSize, isKitBrand, type TierId } from '@/config/site'
import { useT } from '@/i18n'
import { aspectValue, useHydrated, useStore } from '@/lib/store'
import { generateFromPhoto } from '@/lib/generate'
import { useGeneratedPattern } from '@/lib/useGenerated'
import { boardCount, finishedSize, legendOf } from '@/lib/pattern'

export default function KitPage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const pattern = useStore((s) => s.pattern)
  const settings = useStore((s) => s.settings)
  const aspectId = useStore((s) => s.aspectId)
  const addToCart = useStore((s) => s.addToCart)
  const setSettings = useStore((s) => s.setSettings)
  const applyPattern = useStore((s) => s.applyPattern)
  const photo = useStore((s) => s.photo)
  const [tier, setTier] = useState<TierId>(settings.tier)
  const [beadSize, setBeadSize] = useState<BeadSize>(settings.beadSize)

  // Same photo at every tier; the user's current pattern (with any fixes) for its own tier.
  const same = { ...settings, paletteId: pattern?.paletteId ?? settings.paletteId }
  const others = {
    small: useGeneratedPattern(photo, same, aspectId, 'small', hydrated && !!pattern && settings.tier !== 'small'),
    standard: useGeneratedPattern(photo, same, aspectId, 'standard', hydrated && !!pattern && settings.tier !== 'standard'),
    large: useGeneratedPattern(photo, same, aspectId, 'large', hydrated && !!pattern && settings.tier !== 'large'),
  }
  const variants = TIERS.map((tr) => {
    const p = tr.id === settings.tier ? pattern : others[tr.id].pattern
    return { tier: tr, pattern: p, colors: p ? legendOf(p).length : null, size: gridSize(tr.id, aspectValue(aspectId)) }
  })

  if (!hydrated) return <SiteHeader />
  if (!pattern)
    return (
      <>
        <SiteHeader />
        <NoPattern />
      </>
    )

  const chosen = variants.find((v) => v.tier.id === tier)!
  const brand = getPalette(pattern.paletteId).brand
  const sellable = isKitBrand(pattern.paletteId)

  return (
    <>
      <SiteHeader />
      <main className="container-page py-6">
        <h1 className="text-3xl font-extrabold tracking-tight">{t.kit.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.kit.subtitle}</p>

        {!sellable && (
          <div role="alert" className="mt-6 rounded-2xl border border-warn/40 bg-warn/10 p-4">
            <p className="flex items-center gap-2 font-bold">
              <Info className="h-5 w-5 text-warn" aria-hidden /> {t.kit.unavailableTitle(brand)}
            </p>
            <p className="mt-1 text-sm text-muted">{t.kit.unavailableBody}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {KIT_PALETTE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    setSettings({ paletteId: id })
                    applyPattern(await generateFromPhoto(photo, { ...settings, paletteId: id }, aspectId))
                  }}
                >
                  {t.kit.switchTo(getPalette(id).brand)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{t.kit.switchNote}</p>
          </div>
        )}

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
          {variants.map(({ tier: tr, pattern: p, colors, size }) => {
            const active = tr.id === tier
            const fin = finishedSize(size.width, size.height, beadSize)
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
                <div className="mx-auto grid aspect-square w-40 place-items-center rounded-xl bg-[var(--board)] p-1.5">
                  {p ? <PatternThumb pattern={p} /> : <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />}
                </div>
                <h2 className="mt-4 text-xl font-bold">{t.tiers[tr.id]}</h2>
                <p className="text-sm text-muted">
                  {size.width} × {size.height} · {fin.inch} in
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>{t.common.beads(size.width * size.height)}</li>
                  <li>{colors === null ? '…' : t.common.colors(colors)}</li>
                  <li>{t.settings.boards(boardCount(size.width, size.height))}</li>
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
                ${chosen.tier.priceUsd} · {t.kit.brand(brand)}
              </p>
            </div>
            <button
              type="button"
              className="btn-primary"
              disabled={!sellable || !chosen.pattern}
              onClick={() => {
                addToCart({ tier, beadSize, priceUsd: chosen.tier.priceUsd, pattern: chosen.pattern! })
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
