'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useMemo, useState } from 'react'
import { Loader2, Lock, Wand2 } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { PatternThumb } from '@/components/PatternThumb'
import { Segmented, Stepper, Toggle } from '@/components/ui'
import { BrandPicker } from '@/components/BrandPicker'
import { COLOR_LIMITS, TIERS, gridSize } from '@/config/site'
import { useT } from '@/i18n'
import { aspectValue, buildPattern, useHydrated, useStore } from '@/lib/store'
import { boardCount, finishedSize } from '@/lib/pattern'

export default function SettingsPage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const photo = useStore((s) => s.photo)
  const aspectId = useStore((s) => s.aspectId)
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const generate = useStore((s) => s.generate)
  const [busy, setBusy] = useState(false)

  const deferred = useDeferredValue(settings)
  const preview = useMemo(() => buildPattern(deferred, aspectId), [deferred, aspectId])
  const aspect = aspectValue(aspectId)

  if (!hydrated) return <SiteHeader />

  return (
    <>
      <SiteHeader />
      <main className="container-page py-6">
        <Stepper step={1} />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{t.settings.title}</h1>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.05fr]">
          {/* Live preview */}
          <section className="md:sticky md:top-20 md:self-start" aria-label={t.settings.livePreview}>
            <div className="card overflow-hidden p-3">
              <div className="flex items-center justify-between px-1 pb-2 text-sm font-semibold">
                <span>{t.settings.livePreview}</span>
                <ProtoTag label={t.common.sample} />
              </div>
              <div className="rounded-2xl bg-[var(--board)] p-2">
                <PatternThumb pattern={preview} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={t.common.yourPhoto} className="h-14 w-14 rounded-xl object-cover" />
                )}
                <p className="text-xs text-muted">{t.settings.sampleNote}</p>
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
                {TIERS.map((tier) => {
                  const { width, height } = gridSize(tier.id, aspect)
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
            </div>

            <label className="block">
              <span className="flex items-center justify-between">
                <span className="label">{t.settings.maxColors}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-bold">{settings.maxColors}</span>
              </span>
              <input
                type="range"
                min={COLOR_LIMITS.min}
                max={COLOR_LIMITS.max}
                value={settings.maxColors}
                onChange={(e) => setSettings({ maxColors: Number(e.target.value) })}
                className="mt-3 w-full accent-[var(--accent)]"
              />
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
              <Link href="/create/" className="btn-secondary">
                {t.common.back}
              </Link>
              <button
                type="button"
                className="btn-primary min-w-48"
                disabled={busy}
                onClick={() => {
                  setBusy(true)
                  // Fake latency so the flow feels like the real in-browser engine.
                  setTimeout(() => {
                    generate()
                    router.push('/pattern/')
                  }, 900)
                }}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {t.settings.generating}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" aria-hidden /> {t.settings.generate}
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
    </>
  )
}
