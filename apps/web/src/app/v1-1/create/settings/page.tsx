'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Check, Crop, Loader2, Lock, Sparkles, Wand2 } from 'lucide-react'
import { chooseBoards, getPalette, gridLoss, rgbToLab, type Pattern } from '@picobreads/pattern-engine'
import { V11Page } from '@/v11/Chrome'
import { Ironed } from '@/components/Ironed'
import { IRON_STYLES, type IronStyle } from '@/components/bead/ProgressPreview'
import { Segmented, Stepper, Toggle } from '@/components/ui'
import { BOARD_PEGS, V11_PALETTE_ID, gridSize, type TierId } from '@/config/site'
import { V11_BEAD_SIZES, V11_DEFAULTS, V11_TIERS, v11Beads, v11Boards, v11Size, v11TierByBoards } from '@/v11/config'
import { useT } from '@/i18n'
import { aspectValue, useHydrated, useStore } from '@/lib/store'
import { generateFromPhoto } from '@/lib/generate'
import { useGeneratedPattern } from '@/lib/useGenerated'
import { legendOf, maxColorsFor } from '@/lib/pattern'
import { useBoardAdvice } from '@/lib/useBoardAdvice'

/** Pictures whose recommended size was already applied (so a later manual pick is not overridden). */
const autoPicked = new Set<string>()

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

  // v1.1 always uses the full MARD 264 set; the engine picks illustration vs photo by itself.
  // (tier / iron are left out so picking a tile or a finish doesn't regenerate all three.)
  const gen = { ...settings, tier: 'small' as const, iron: undefined, paletteId: V11_PALETTE_ID, maxColors: V11_DEFAULTS.maxColors, style: 'auto' as const }
  const iron: IronStyle = settings.iron ?? 'normal'
  const bead = settings.beadSize
  const variants: Record<TierId, ReturnType<typeof useGeneratedPattern>> = {
    small: useGeneratedPattern(photo, gen, aspectId, v11Beads('small', bead), hydrated),
    standard: useGeneratedPattern(photo, gen, aspectId, v11Beads('standard', bead), hydrated),
    large: useGeneratedPattern(photo, gen, aspectId, v11Beads('large', bead), hydrated),
  }
  const aspect = aspectValue(aspectId)
  const anyBusy = Object.values(variants).some((v) => v.busy)
  const colorCount = maxColorsFor(V11_PALETTE_ID)

  // Fewest boards that keep the picture clear; pre-select it once per picture and bead size.
  // Two measures, both must agree before adding boards: the picture itself, and the real
  // generated patterns (does the bigger pattern show anything the smaller one can't?).
  const advice = useBoardAdvice(photo, aspect, BOARD_PEGS[bead], V11_TIERS.length, hydrated)
  const patterns = V11_TIERS.map((tier) => {
    const v = variants[tier.id].pattern
    const want = gridSize(v11Beads(tier.id, bead), aspect)
    return v && v.width === want.width && v.height === want.height && v.paletteId === V11_PALETTE_ID ? v : null
  })
  const ready = patterns.every(Boolean) && advice != null
  const perSide = useMemo(() => {
    if (!ready || !advice) return null
    const labs = getPalette(V11_PALETTE_ID).colors.map((c) => rgbToLab(c.rgb))
    const gridLosses = patterns.slice(1).map((fine, i) => gridLoss(patterns[i]!, fine!, labs))
    return chooseBoards(advice.imageLosses, gridLosses, V11_TIERS.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, advice, ...patterns])
  const adviceKey = `${photo?.length}:${photo?.slice(-48)}:${aspectId}:${bead}`
  useEffect(() => {
    if (perSide == null || autoPicked.has(adviceKey)) return
    autoPicked.add(adviceKey)
    setSettings({ tier: v11TierByBoards(perSide).id, paletteId: V11_PALETTE_ID, maxColors: V11_DEFAULTS.maxColors })
  }, [perSide, adviceKey, setSettings])
  // A small subject on a wide plain backdrop wastes beads on the backdrop.
  const loose = advice != null && advice.subjectShare < 0.45

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
            {(anyBusy || perSide == null) && <Loader2 className="h-5 w-5 animate-spin text-muted" aria-label={perSide == null ? t.v11.settings.analyzing : t.settings.generating} />}
          </div>
          <p className="mt-1 text-sm text-muted">{t.v11.settings.pickHint}</p>
          <p className="mt-1 text-xs font-bold text-[var(--accent)]">{t.v11.settings.beadSet(colorCount)}</p>

          <div className="mt-4">
            <h3 className="label mb-2">{t.settings.beadSize}</h3>
            <Segmented
              label={t.settings.beadSize}
              value={bead}
              onChange={(beadSize) => setSettings({ beadSize })}
              options={V11_BEAD_SIZES.map((v) => ({ value: v, label: t.v11.settings.beads[v].title }))}
            />
            <p className="mt-2 text-sm text-muted">{t.v11.settings.beads[bead].hint}</p>
          </div>

          {loose && (
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border-2 border-dashed border-[var(--accent)] bg-white/70 px-4 py-2.5 text-sm">
              <Crop className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
              <span>{t.v11.settings.cropTighter(Math.round(advice.subjectShare * 100))}</span>
              <Link href="/v1-1/create/" className="font-bold text-[var(--accent)] underline">
                {t.v11.settings.recrop}
              </Link>
            </p>
          )}
          <div role="radiogroup" aria-label={t.settings.size} className="mt-4 grid gap-4 sm:grid-cols-3">
            {V11_TIERS.map((tier) => {
              const v = variants[tier.id].pattern
              const { width, height } = gridSize(v11Beads(tier.id, bead), aspect)
              const fin = v11Size(width, height, bead)
              const on = settings.tier === tier.id
              const advised = perSide === tier.perSide
              const note = perSide == null || advised ? null : tier.perSide > perSide ? t.v11.settings.bigger : t.v11.settings.smaller
              return (
                <button
                  key={tier.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSettings({ tier: tier.id })}
                  className={`card relative p-3 text-left transition-transform ${on ? '-translate-y-1 !border-[var(--accent)] ring-4 ring-[var(--accent)]/30' : 'hover:-translate-y-0.5'}`}
                >
                  {advised && (
                    <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border-2 border-[var(--ink)] bg-[var(--sun)] px-2.5 py-0.5 text-xs font-bold text-[var(--ink)]">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t.v11.settings.recommended}
                    </span>
                  )}
                  {on && (
                    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-bold text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden /> {t.v11.settings.selected}
                    </span>
                  )}
                  <div className="grid aspect-square place-items-center rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,0.10)_0_25%,transparent_0_50%)] bg-[length:18px_18px] p-2">
                    {v ? <Ironed pattern={v} iron={iron} className={variants[tier.id].busy ? 'opacity-70' : ''} /> : <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />}
                  </div>
                  <p className="mt-2 font-bold">
                    {t.v11.settings.tierTitle(tier.perSide)} · {width}×{height}
                  </p>
                  <p className="text-xs text-muted">
                    ≈ {fin.cm} cm{v11Boards(width, height, bead) !== tier.perSide ** 2 && ` · ${t.settings.boards(v11Boards(width, height, bead))}`}
                    {v && ` · ${t.common.colors(legendOf(v).length)}`}
                  </p>
                  {note && <p className="mt-1 text-xs font-bold text-muted">{note}</p>}
                </button>
              )
            })}
          </div>
        </section>

        <div className="mt-8 max-w-2xl">
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
                const tier = V11_TIERS.find((x) => x.id === settings.tier) ?? V11_TIERS[0]
                const picked = variants[tier.id].pattern ?? (await generateFromPhoto(photo, gen, aspectId, v11Beads(tier.id, bead)))
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
