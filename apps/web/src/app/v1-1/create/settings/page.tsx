'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Lock, Wand2 } from 'lucide-react'
import { getPalette } from '@picobreads/pattern-engine'
import { V11Page } from '@/v11/Chrome'
import { PatternThumb } from '@/components/PatternThumb'
import { Segmented, Stepper, Toggle } from '@/components/ui'
import { BrandPicker } from '@/components/BrandPicker'
import { COLOR_LIMITS, gridSize } from '@/config/site'
import { V11_TIERS, v11Tier } from '@/v11/config'
import { useT } from '@/i18n'
import { aspectValue, useHydrated, useStore } from '@/lib/store'
import { generateFromPhoto } from '@/lib/generate'
import { useGeneratedPattern } from '@/lib/useGenerated'
import { boardCount, finishedSize, maxColorsFor } from '@/lib/pattern'

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

  const { pattern: preview, busy: previewBusy } = useGeneratedPattern(photo, settings, aspectId, v11Tier(settings.tier).longSide, hydrated)
  const aspect = aspectValue(aspectId)

  if (!hydrated) return <V11Page footer={false}>{null}</V11Page>

  return (
    <V11Page>
      <main className="container-page py-6">
        <Stepper step={2} />
        <h1 className="mt-6 font-serif text-4xl">{t.flow.sizeTitle}</h1>
        <p className="mt-2 text-muted">{t.flow.relation}</p>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.05fr]">
          {/* Live preview */}
          <section className="md:sticky md:top-20 md:self-start" aria-label={t.settings.livePreview}>
            <div className="card overflow-hidden p-3">
              <div className="flex items-center justify-between px-1 pb-2 text-sm font-semibold">
                <span>{t.settings.livePreview}</span>
                {previewBusy && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-label={t.settings.generating} />}
              </div>
              <div className="relative grid min-h-48 place-items-center rounded-2xl bg-[var(--board)] p-2">
                {preview ? (
                  <PatternThumb pattern={preview} className={previewBusy ? 'opacity-70 transition-opacity' : 'transition-opacity'} />
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin text-muted" aria-hidden />
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={t.common.yourPhoto} className="h-14 w-14 rounded-xl object-cover" />
                )}
                <p className="flex-1 text-xs text-muted">{t.settings.sampleNote}</p>
                <Link href="/lab/" className="shrink-0 text-xs font-semibold text-accent underline">
                  {t.lab.nav}
                </Link>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="flex flex-col gap-6">
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

            <div>
              <h2 className="label mb-1">{t.settings.palette}</h2>
              <p className="mb-2 text-sm text-muted">{t.settings.paletteHint}</p>
              <BrandPicker value={settings.paletteId} onChange={(paletteId) => setSettings({ paletteId })} />
            </div>

            <div>
              <h2 className="label mb-2">{t.settings.size}</h2>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t.settings.size}>
                {V11_TIERS.map((tier) => {
                  const { width, height } = gridSize(tier.longSide, aspect)
                  const fin = finishedSize(width, height, settings.beadSize)
                  const active = settings.tier === tier.id
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSettings({ tier: tier.id })}
                      className={`rounded-2xl border p-3 text-left transition-colors ${
                        active ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-2'
                      }`}
                    >
                      <span className="block font-bold">{t.tiers[tier.id]}</span>
                      <span className="block text-xs text-muted">{t.settings.sizeCells(width, height)}</span>
                      <span className="mt-1 block text-xs text-muted">{fin.cm} cm</span>
                      <span className="block text-xs text-muted">{t.settings.boards(boardCount(width, height))}</span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-sm text-muted">{t.settings.sizeTip}</p>
            </div>

            <div>
              <h2 className="label mb-2">{t.settings.style}</h2>
              <Segmented
                label={t.settings.style}
                value={settings.style ?? 'auto'}
                onChange={(style) => setSettings({ style })}
                options={(['auto', 'illustration', 'photo'] as const).map((v) => ({ value: v, label: t.settings.styles[v] }))}
              />
              <p className="mt-2 text-sm text-muted">{t.settings.styleHints[settings.style ?? 'auto']}</p>
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
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-bold">
                  {t.settings.detailLevels[settings.detail - 1]}
                </span>
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
              <Toggle
                label={t.settings.dithering}
                checked={settings.dithering}
                onChange={(dithering) => setSettings({ dithering })}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
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
                    applyPattern(await generateFromPhoto(photo, settings, aspectId, v11Tier(settings.tier).longSide))
                    router.push('/v1-1/create/preview/')
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {t.settings.generating}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" aria-hidden /> {t.flow.toPreview}
                  </>
                )}
              </button>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" aria-hidden /> {t.common.privacyLine}
            </p>
          </section>
        </div>
      </main>
    </V11Page>
  )
}
