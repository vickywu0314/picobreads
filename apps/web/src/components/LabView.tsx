'use client'

// TEMPORARY TOOL: preview the ironed result of a photo in every size / style
// without beading it. Remove (or hide) before launch.

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { getPalette, looksLikeIllustration, type Pattern } from '@picobreads/pattern-engine'
import { SiteHeader } from '@/components/SiteHeader'
import { V11Page } from '@/v11/Chrome'
import { ProtoTag } from '@/components/PrototypeBanner'
import { BrandPicker } from '@/components/BrandPicker'
import { Toggle } from '@/components/ui'
import { drawWork } from '@/components/bead/ProgressPreview'
import { COLOR_LIMITS, TIERS, type TierId } from '@/config/site'
import { useT } from '@/i18n'
import { generateFromPhoto, photoPixels } from '@/lib/generate'
import { legendOf, maxColorsFor } from '@/lib/pattern'
import { defaultSettings, useStore, type Settings } from '@/lib/store'

type Style = 'illustration' | 'photo'
const STYLES: Style[] = ['illustration', 'photo']

function Ironed({ pattern, className = '' }: { pattern: Pattern; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const paint = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      const ctx = c.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawWork(ctx, r.width, r.height, pattern, getPalette(pattern.paletteId), '', 'final')
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(c)
    return () => ro.disconnect()
  }, [pattern])
  return <canvas ref={ref} aria-hidden className={`block w-full ${className}`} style={{ aspectRatio: `${pattern.width} / ${pattern.height}` }} />
}

/** Temporary ironing lab. Shared by v1.0 (/lab) and v1.1 (/lab, `v11`: v1.1 look, no prototype tag). */
export function LabView({ v11 = false }: { v11?: boolean }) {
  const t = useT()
  const router = useRouter()
  const applyPattern = useStore((s) => s.applyPattern)
  const setPhoto = useStore((s) => s.setPhoto)
  const setSettingsStore = useStore((s) => s.setSettings)
  const [photo, setPhotoUrl] = useState<string | null>(null)
  const [ratio, setRatio] = useState(1)
  const [auto, setAuto] = useState<Style | null>(null)
  const [opts, setOpts] = useState<Settings>({ ...defaultSettings })
  const [results, setResults] = useState<Partial<Record<`${Style}-${TierId}`, Pattern>>>({})
  const [busy, setBusy] = useState(false)
  const [zoom, setZoom] = useState<Pattern | null>(null)

  const load = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      const img = new Image()
      img.onload = () => {
        setRatio(img.naturalWidth / img.naturalHeight)
        setResults({})
        setPhotoUrl(url)
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  // Which style "auto" would choose for this photo.
  useEffect(() => {
    if (!photo) return
    photoPixels(photo, 64, 64).then((px) => setAuto(looksLikeIllustration(px) ? 'illustration' : 'photo'))
  }, [photo])

  // Regenerate all six variants (debounced) whenever the photo or options change.
  useEffect(() => {
    if (!photo) return
    let cancelled = false
    setBusy(true)
    const timer = setTimeout(async () => {
      for (const style of STYLES)
        for (const tier of TIERS) {
          const p = await generateFromPhoto(photo, { ...opts, style }, ratio, tier.id)
          if (cancelled) return
          setResults((r) => ({ ...r, [`${style}-${tier.id}`]: p }))
        }
      if (!cancelled) setBusy(false)
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [photo, ratio, opts])

  return (
    <Shell v11={v11}>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl font-extrabold tracking-tight">{t.lab.title}</h1>
          {!v11 && <ProtoTag label={t.lab.badge} />}
          {busy && <Loader2 className="h-5 w-5 animate-spin text-muted" aria-label={t.settings.generating} />}
        </div>
        <p className="mt-2 max-w-2xl text-muted">{t.lab.intro}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_1fr]">
          {/* Controls */}
          <section className="flex flex-col gap-5">
            <label className="btn-primary cursor-pointer self-start">
              <ImagePlus className="h-5 w-5" aria-hidden /> {photo ? t.lab.change : t.lab.upload}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => load(e.target.files?.[0])} />
            </label>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={t.lab.original} className="max-h-64 w-full rounded-2xl object-contain" />
            )}
            {auto && <p className="text-sm font-semibold">{t.lab.autoSays(t.settings.styles[auto])}</p>}

            <label className="block">
              <span className="flex items-center justify-between">
                <span className="label">{t.settings.maxColors}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-bold">{Math.min(opts.maxColors, maxColorsFor(opts.paletteId))}</span>
              </span>
              <input
                type="range"
                min={COLOR_LIMITS.min}
                max={maxColorsFor(opts.paletteId)}
                value={Math.min(opts.maxColors, maxColorsFor(opts.paletteId))}
                onChange={(e) => setOpts({ ...opts, maxColors: Number(e.target.value) })}
                className="mt-3 w-full accent-[var(--accent)]"
              />
              <span className="mt-1 block text-xs text-muted">{t.settings.maxColorsHint(maxColorsFor(opts.paletteId), getPalette(opts.paletteId).brand)}</span>
            </label>
            <label className="block">
              <span className="flex items-center justify-between">
                <span className="label">{t.settings.detail}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-bold">{t.settings.detailLevels[opts.detail - 1]}</span>
              </span>
              <input
                type="range"
                min={1}
                max={5}
                value={opts.detail}
                onChange={(e) => setOpts({ ...opts, detail: Number(e.target.value) })}
                className="mt-3 w-full accent-[var(--accent)]"
              />
            </label>
            <div className="flex items-center justify-between gap-4">
              <span className="label">{t.settings.dithering}</span>
              <Toggle label={t.settings.dithering} checked={opts.dithering} onChange={(dithering) => setOpts({ ...opts, dithering })} />
            </div>
            <div>
              <p className="label mb-2">{t.settings.palette}</p>
              <BrandPicker value={opts.paletteId} onChange={(paletteId) => setOpts({ ...opts, paletteId })} />
            </div>
          </section>

          {/* Results */}
          <section>
            {!photo ? (
              <div className="card grid min-h-64 place-items-center p-8 text-muted">{t.lab.intro}</div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted">{t.lab.tapToZoom}</p>
                {STYLES.map((style) => (
                  <div key={style} className="mb-6">
                    <h2 className="mb-2 font-bold">
                      {t.settings.styles[style]}
                      {auto === style && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">{t.settings.styles.auto}</span>}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {TIERS.map((tier) => {
                        const p = results[`${style}-${tier.id}`]
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            disabled={!p}
                            onClick={() => p && setZoom(p)}
                            className="card overflow-hidden p-2 text-left transition-shadow hover:shadow-md"
                          >
                            <div className="grid min-h-40 place-items-center rounded-xl bg-[repeating-conic-gradient(rgba(128,128,128,0.12)_0_25%,transparent_0_50%)] bg-[length:20px_20px]">
                              {p ? <Ironed pattern={p} /> : <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />}
                            </div>
                            <p className="mt-2 text-xs font-semibold text-muted">
                              {p ? t.lab.tile(t.tiers[tier.id], p.width, p.height, legendOf(p).length) : t.tiers[tier.id]}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
      </main>

      {zoom && photo && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col bg-[#f4efe7] dark:bg-[#15120f]">
          <div className="flex items-center gap-2 p-3">
            <button type="button" className="icon-btn" onClick={() => setZoom(null)} aria-label={t.common.close}>
              <X className="h-6 w-6" aria-hidden />
            </button>
            <p className="flex-1 truncate text-sm font-bold">
              {t.lab.tile('', zoom.width, zoom.height, legendOf(zoom).length).replace(/^ · /, '')} · {getPalette(zoom.paletteId).brand}
            </p>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => {
                setPhoto(photo)
                setSettingsStore({ ...opts })
                applyPattern(zoom)
                router.push(v11 ? '/bead/' : '/bead/')
              }}
            >
              {t.lab.useThis}
            </button>
          </div>
          <div className="grid min-h-0 flex-1 gap-3 overflow-auto p-3 md:grid-cols-2">
            <div className="grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={t.lab.original} className="max-h-full max-w-full rounded-xl object-contain" />
            </div>
            <div className="grid place-items-center">
              <div className="w-full max-w-[min(100%,80vh)]">
                <Ironed pattern={zoom} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}

function Shell({ v11, children }: { v11: boolean; children: React.ReactNode }) {
  if (v11) return <V11Page>{children}</V11Page>
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}

