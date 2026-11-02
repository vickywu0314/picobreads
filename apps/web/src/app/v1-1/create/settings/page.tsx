'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Loader2, Lock, Wand2 } from 'lucide-react'
import { getPalette, type Pattern } from '@picobreads/pattern-engine'
import { V11Page } from '@/v11/Chrome'
import { Ironed } from '@/components/Ironed'
import { IRON_STYLES, type IronStyle } from '@/components/bead/ProgressPreview'
import { Segmented, Stepper, Toggle } from '@/components/ui'
import { BrandPicker } from '@/components/BrandPicker'
import { COLOR_LIMITS, gridSize, type TierId } from '@/config/site'
import { V11_TIERS } from '@/v11/config'
import { useT } from '@/i18n'
import { aspectValue, useHydrated, useStore } from '@/lib/store'
import { generateFromPhoto } from '@/lib/generate'
import { useGeneratedPattern } from '@/lib/useGenerated'
import { boardCount, finishedSize, legendOf, maxColorsFor } from '@/lib/pattern'

/** Small swatch showing an ironing finish on a 4 × 4 checker of beads. */
const SWATCH: Pattern = { id: 'swatch', paletteId: 'perler', width: 4, height: 4, cells: [4, 4, 6, 6, 4, 4, 6, 6, 8, 8, 2, 2, 8, 8, 2, 2] }

export default function SettingsPage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const photo = useStore((s) => s.photo)
  const aspectId = useStore((s) => s.aspectId)
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const applyPattern = useStore((s) => s.applyPattern)
  const [busy, setBusy] = useState(false)

  // The engine picks illustration vs photo by itself in v1.1.
  const gen = { ...settings, style: 'auto' as const }
  const iron: IronStyle = settings.iron ?? 'normal'
  const variants: Record<TierId, ReturnType<typeof useGeneratedPattern>> = {
    small: useGeneratedPattern(photo, gen, aspectId, V11_TIERS[0].longSide, hydrated),
    standard: useGeneratedPattern(photo, gen, aspectId, V11_TIERS[1].longSide, hydrated),
    large: useGeneratedPattern(photo, gen, aspectId, V11_TIERS[2].longSide, hydrated),
  }
  const aspect = aspectValue(aspectId)
  const anyBusy = Object.values(variants).some((v) => v.busy)

  if (!hydrated) return <V11Page footer={false}>{null}</V11Page>

  return (
    <V11Page>
      <main className="container-page py-6">
        <Stepper step={2} />
        <h1 className="mt-6 font-serif text-4xl">{t.flow.sizeTitle}</h1>

        {/* Three ironed results to choose from — the chosen one becomes the pattern. */}
        <section className="mt-6" aria-label={t.v11.settings.pickTitle}>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl">{t.v11.settings.pickTitle}</h2>
            {anyBusy && <Loader2 className="h-5 w-5 animate-spin text-muted" aria-label={t.settings.generating} />}
          </div>
          <p className="mt-1 text-sm text-muted">{t.v11.settings.pickHint}</p>
          <div role="radiogroup" aria-label={t.settings.size} className="mt-4 grid gap-4 sm:grid-cols-3">
            {V11_TIERS.map((tier) => {
              const v = variants[tier.id].pattern
              const { width, height } = gridSize(tier.longSide, aspect)
              const fin = finishedSize(width, height, settings.beadSize)
              const on = settings.tier === tier.id
              return (
                <button
                  key={tier.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSettings({ tier: tier.id })}
                  className={`card relative p-3 text-left transition-transform ${on ? '-translate-y-1 !border-[var(--accent)] ring-4 ring-[var(--accent)]/30' : 'hover:-translate-y-0.5'}`}
                >
                  {on && (
                    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-bold text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden /> {t.v11.settings.selected}
                    </span>
                  )}
                  <div className="grid aspect-square place-items-center rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,0.10)_0_25%,transparent_0_50%)] bg-[length:18px_18px] p-2">
                    {v ? <Ironed pattern={v} iron={iron} className={variants[tier.id].busy ? 'opacity-70' : ''} /> : <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />}
                  </div>
                  <p className="mt-2 font-bold">
                    {t.tiers[tier.id]} · {width}×{height}
                  </p>
                  <p className="text-xs text-muted">
                    ≈ {fin.cm} cm · {t.settings.boards(boardCount(width, height))}
                    {v && ` · ${t.common.colors(legendOf(v).length)}`}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="label mb-2">{t.v11.settings.iron}</h2>
              <div role="radiogroup" aria-label={t.v11.settings.iron} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {IRON_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={iron === s}
                    onClick={() => setSettings({ iron: s })}
                    className={`rounded-2xl border-2 p-2 text-left ${iron === s ? 'border-[var(--accent)] bg-accent-soft' : 'border-[var(--border)] bg-white hover:border-[var(--ink)]'}`}
                  >
                    <span className="block overflow-hidden rounded-xl">
                      <Ironed pattern={SWATCH} iron={s} />
                    </span>
                    <span className="mt-1.5 block text-sm font-bold">{t.v11.settings.irons[s].title}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted">
                {t.v11.settings.irons[iron].hint} · {t.v11.settings.ironNote}
              </p>
            </div>

            <div>
              <h2 className="label mb-2">{t.settings.beadSize}</h2>
              <Segmented
                label={t.settings.beadSize}
                value={settings.beadSize}
                onChange={(beadSize) => setSettings({ beadSize })}
                options={(['5mm', '2.6mm'] as const).map((v) => ({ value: v, label: t.settings.beadSizes[v].label }))}
              />
              <p className="mt-2 text-sm text-muted">{t.settings.beadSizes[settings.beadSize].hint}</p>
            </div>

            <label className="block">
              <span className="flex items-center justify-between">
                <span className="label">{t.settings.maxColors}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-bold">{Math.min(settings.maxColors, maxColorsFor(settings.paletteId))}</span>
              </span>
              <input
                type="range"
                min={COLOR_LIMITS.min}
                max={maxColorsFor(settings.paletteId)}
                value={Math.min(settings.maxColors, maxColorsFor(settings.paletteId))}
                onChange={(e) => setSettings({ maxColors: Number(e.target.value) })}
                className="mt-3 w-full accent-[var(--accent)]"
              />
              <span className="mt-1 block text-xs text-muted">{t.settings.maxColorsHint(maxColorsFor(settings.paletteId), getPalette(settings.paletteId).brand)}</span>
            </label>

            <label className="block">
              <span className="flex items-center justify-between">
                <span className="label">{t.settings.detail}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-bold">{t.settings.detailLevels[settings.detail - 1]}</span>
              </span>
              <input
                type="range"
                min={1}
                max={5}
                value={settings.detail}
                onChange={(e) => setSettings({ detail: Number(e.target.value) })}
                className="mt-3 w-full accent-[var(--accent)]"
              />
            </label>

            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="label">{t.settings.dithering}</span>
                <p className="text-sm text-muted">{t.settings.ditheringHint}</p>
              </div>
              <Toggle label={t.settings.dithering} checked={settings.dithering} onChange={(dithering) => setSettings({ dithering })} />
            </div>
          </section>

          <section>
            <h2 className="label mb-1">{t.settings.palette}</h2>
            <p className="mb-2 text-sm text-muted">{t.settings.paletteHint}</p>
            <BrandPicker value={settings.paletteId} onChange={(paletteId) => setSettings({ paletteId })} />
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Link href="/v1-1/create/" className="btn-secondary">
            {t.common.back}
          </Link>
          <button
            type="button"
            className="btn-primary min-w-48"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                // Use exactly the result the user picked; generate only if it isn't ready yet.
                const tier = V11_TIERS.find((x) => x.id === settings.tier) ?? V11_TIERS[1]
                const picked = variants[tier.id].pattern ?? (await generateFromPhoto(photo, gen, aspectId, tier.longSide))
                applyPattern(picked)
                router.push('/v1-1/create/preview/')
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Wand2 className="h-5 w-5" aria-hidden />} {t.flow.toPreview}
          </button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden /> {t.common.privacyLine}
        </p>
      </main>
    </V11Page>
  )
}
