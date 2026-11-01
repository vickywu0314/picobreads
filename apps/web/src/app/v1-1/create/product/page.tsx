'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Check, Download, Info, Loader2, Package, Sparkles } from 'lucide-react'
import { getPalette, type BeadSize } from '@picobreads/pattern-engine'
import { V11Page } from '@/v11/Chrome'
import { Ironed } from '@/components/Ironed'
import { NoPattern } from '@/components/NoPattern'
import { Segmented, Stepper } from '@/components/ui'
import { ASSEMBLED_VARIANT_ENABLED, KIT_PALETTE_IDS, gridSize, isKitBrand, type TierId } from '@/config/site'
import { V11_TIERS, v11Price as priceOf, v11Tier } from '@/v11/config'
import { PRODUCT_FORMS, type ProductForm } from '@/config/catalog'
import { useT } from '@/i18n'
import { aspectValue, useHydrated, useStore } from '@/lib/store'
import { generateFromPhoto } from '@/lib/generate'
import { useGeneratedPattern } from '@/lib/useGenerated'
import { finishedSize, legendOf } from '@/lib/pattern'

const ICONS = { digital: Download, kit: Package, finished: Sparkles }

export default function ProductStep() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const pattern = useStore((s) => s.pattern)
  const settings = useStore((s) => s.settings)
  const aspectId = useStore((s) => s.aspectId)
  const photo = useStore((s) => s.photo)
  const draft = useStore((s) => s.draft)
  const [form, setForm] = useState<ProductForm>(draft?.form ?? 'kit')
  const [tier, setTier] = useState<TierId>(settings.tier)
  const [beadSize, setBeadSize] = useState<BeadSize>(settings.beadSize)

  // Same design at every size; the current pattern (with any edits) for its own size.
  const same = { ...settings, paletteId: pattern?.paletteId ?? settings.paletteId }
  const others = {
    small: useGeneratedPattern(photo, same, aspectId, v11Tier('small').longSide, hydrated && !!pattern && settings.tier !== 'small'),
    standard: useGeneratedPattern(photo, same, aspectId, v11Tier('standard').longSide, hydrated && !!pattern && settings.tier !== 'standard'),
    large: useGeneratedPattern(photo, same, aspectId, v11Tier('large').longSide, hydrated && !!pattern && settings.tier !== 'large'),
  }

  if (!hydrated) return <V11Page footer={false}>{null}</V11Page>
  if (!pattern)
    return (
      <V11Page>
        <NoPattern href="/v1-1/create/" />
      </V11Page>
    )

  const variant = (id: TierId) => (id === settings.tier ? pattern : others[id].pattern)
  const chosen = variant(tier)
  const brand = getPalette(pattern.paletteId).brand
  const physical = form !== 'digital'
  const sellable = !physical || isKitBrand(pattern.paletteId)
  const available = (f: ProductForm) => f !== 'finished' || ASSEMBLED_VARIANT_ENABLED

  return (
    <V11Page>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Stepper step={4} />
        <h1 className="mt-6 font-serif text-4xl">{t.flow.productTitle}</h1>

        {/* Purchase form */}
        <div role="radiogroup" aria-label={t.flow.product} className="mt-6 grid gap-3 md:grid-cols-3">
          {PRODUCT_FORMS.map((f) => {
            const Icon = ICONS[f]
            const on = form === f
            const ok = available(f)
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={!ok}
                onClick={() => setForm(f)}
                className={`card relative flex flex-col p-5 text-left transition-shadow disabled:opacity-55 ${on ? 'border-accent ring-2 ring-accent' : 'hover:shadow-md'}`}
              >
                {!ok && <span className="absolute right-3 top-3 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-muted">{t.flow.unavailable}</span>}
                <Icon className="h-7 w-7 text-accent" aria-hidden />
                <span className="mt-3 font-serif text-xl">{t.flow.forms[f].title}</span>
                <span className="mt-1 flex-1 text-sm text-muted">{t.flow.forms[f].body}</span>
                <span className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-bold">{f === 'digital' ? t.flow.free : t.flow.from(priceOf(f, 'small'))}</span>
                  <span className="text-xs text-muted">{t.flow.forms[f].time}</span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-muted">{t.flow.placeholderPrices}</p>

        {physical && !sellable && (
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
                    const s = useStore.getState()
                    s.setSettings({ paletteId: id })
                    s.applyPattern(await generateFromPhoto(photo, { ...settings, paletteId: id }, aspectId, v11Tier(settings.tier).longSide))
                  }}
                >
                  {t.kit.switchTo(getPalette(id).brand)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size */}
        <h2 className="mt-10 label">{t.settings.size}</h2>
        <div role="radiogroup" aria-label={t.settings.size} className="mt-2 grid gap-3 md:grid-cols-3">
          {V11_TIERS.map((tr) => {
            const p = variant(tr.id)
            const size = gridSize(tr.longSide, aspectValue(aspectId))
            const fin = finishedSize(size.width, size.height, beadSize)
            const on = tr.id === tier
            return (
              <button
                key={tr.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTier(tr.id)}
                className={`card flex items-center gap-4 p-3 text-left ${on ? 'border-accent ring-2 ring-accent' : 'hover:shadow-md'}`}
              >
                <div className="grid w-24 shrink-0 place-items-center rounded-xl bg-surface-2 p-1.5">
                  {p ? <Ironed pattern={p} /> : <Loader2 className="my-8 h-5 w-5 animate-spin text-muted" aria-hidden />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-bold">
                    {t.tiers[tr.id]} {on && <Check className="h-4 w-4 text-accent" aria-hidden />}
                  </p>
                  <p className="text-xs text-muted">
                    {size.width} × {size.height} · ≈ {fin.cm} cm
                  </p>
                  <p className="text-xs text-muted">{p ? t.common.colors(legendOf(p).length) : '…'}</p>
                  <p className="mt-1 font-bold">{form === 'digital' ? t.flow.free : `$${priceOf(form, tr.id)}`}</p>
                </div>
              </button>
            )
          })}
        </div>

        {physical && (
          <div className="mt-6 max-w-sm">
            <p className="label mb-2">{t.kit.beadSize}</p>
            <Segmented label={t.kit.beadSize} value={beadSize} onChange={setBeadSize} options={(['5mm', '2.6mm'] as const).map((b) => ({ value: b, label: b }))} />
          </div>
        )}

        <div className="sticky bottom-0 -mx-4 mt-8 flex items-center justify-between gap-4 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
          <div>
            <p className="font-bold">
              {t.flow.forms[form].title} · {t.tiers[tier]}
            </p>
            <p className="text-sm text-muted">
              {form === 'digital' ? t.flow.free : `$${priceOf(form, tier)}`} · {brand}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={!chosen || !sellable || !available(form)}
            onClick={() => {
              useStore.getState().setDraft({ form, tier, beadSize, priceUsd: priceOf(form, tier), pattern: chosen! })
              router.push('/v1-1/create/confirm/')
            }}
          >
            {t.flow.continue} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </main>
    </V11Page>
  )
}
