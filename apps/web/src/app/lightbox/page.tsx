'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Expand, Ruler, SkipForward, X } from 'lucide-react'
import type { Section } from '@picobreads/pattern-engine'
import { NoPattern } from '@/components/NoPattern'
import { Segmented, Swatch } from '@/components/ui'
import { BEAD_PITCH_MM } from '@/config/site'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { usePatternData } from '@/lib/usePattern'
import type { BeadSize } from '@picobreads/pattern-engine'

const CARD_MM = { w: 85.6, h: 53.98 }
// CSS spec reference pixel: 96 px per inch. Real phones differ, hence calibration.
const DEFAULT_PX_PER_MM = 96 / 25.4

function Calibrate({ onDone }: { onDone: () => void }) {
  const t = useT()
  const stored = useStore((s) => s.pxPerMm)
  const setPxPerMm = useStore((s) => s.setPxPerMm)
  const beadSize = useStore((s) => s.settings.beadSize)
  const setSettings = useStore((s) => s.setSettings)
  const [v, setV] = useState(stored ?? DEFAULT_PX_PER_MM)
  const pitch = BEAD_PITCH_MM[beadSize] * v
  const holes = 10

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col gap-5 p-5 text-white">
      <h1 className="text-2xl font-bold">{t.lightbox.calibrateTitle}</h1>
      <p className="text-white/70">{t.lightbox.calibrateBody}</p>
      <Segmented
        label={t.settings.beadSize}
        value={beadSize}
        onChange={(b: BeadSize) => setSettings({ beadSize: b })}
        options={(['5mm', '2.6mm'] as const).map((b) => ({ value: b, label: b }))}
      />
      <div className="overflow-hidden">
        <div className="flex" style={{ gap: 0 }} aria-label={t.lightbox.holesHint(holes)}>
          {Array.from({ length: holes }, (_, i) => (
            <span key={i} className="grid shrink-0 place-items-center" style={{ width: pitch, height: pitch }}>
              <span className="rounded-full bg-white" style={{ width: pitch * 0.55, height: pitch * 0.55 }} />
            </span>
          ))}
        </div>
        <p className="mt-1 text-xs text-white/60">{t.lightbox.holesHint(holes)}</p>
      </div>
      <div>
        <div
          className="rounded-[10px] border-2 border-dashed border-amber-300"
          style={{ width: CARD_MM.w * v, height: CARD_MM.h * v, maxWidth: '100%' }}
        />
        <p className="mt-1 text-xs text-white/60">{t.lightbox.cardOutline}</p>
      </div>
      <label className="block">
        <span className="text-sm font-semibold">
          {t.lightbox.scale}: {v.toFixed(2)} px/mm
        </span>
        <input
          type="range"
          min={2}
          max={12}
          step={0.01}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          className="mt-3 w-full accent-amber-400"
        />
      </label>
      <button
        type="button"
        className="btn h-14 bg-amber-400 text-lg text-black hover:bg-amber-300"
        onClick={() => {
          setPxPerMm(v)
          onDone()
        }}
      >
        {t.lightbox.start}
      </button>
    </div>
  )
}

function LightCanvas({
  section,
  cellPx,
  draw,
  onTap,
}: {
  section: Section
  cellPx: number
  draw: (ctx: CanvasRenderingContext2D, cellPx: number) => void
  onTap: (x: number, y: number) => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const offset = useRef({ x: 0, y: 0 })
  const drawRef = useRef(draw)
  drawRef.current = draw
  const [, force] = useState(0)
  const t = useT()

  const paint = () => {
    const c = ref.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.translate(offset.current.x, offset.current.y)
    drawRef.current(ctx, cellPx)
  }

  // Center the board whenever section or scale changes.
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const rect = c.getBoundingClientRect()
    offset.current = { x: (rect.width - section.w * cellPx) / 2, y: (rect.height - section.h * cellPx) / 2 }
    force((n) => n + 1)
  }, [section, cellPx])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ro = new ResizeObserver(() => {
      const r = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      paint()
    })
    ro.observe(c)
    return () => ro.disconnect()
  })

  useEffect(paint)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    let start: { x: number; y: number; ox: number; oy: number; moved: boolean } | null = null
    const down = (e: PointerEvent) => {
      c.setPointerCapture(e.pointerId)
      start = { x: e.clientX, y: e.clientY, ox: offset.current.x, oy: offset.current.y, moved: false }
    }
    const move = (e: PointerEvent) => {
      if (!start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.hypot(dx, dy) > 6) start.moved = true
      if (start.moved) {
        offset.current = { x: start.ox + dx, y: start.oy + dy }
        paint()
      }
    }
    const up = (e: PointerEvent) => {
      if (start && !start.moved) {
        const r = c.getBoundingClientRect()
        const x = Math.floor((e.clientX - r.left - offset.current.x) / cellPx)
        const y = Math.floor((e.clientY - r.top - offset.current.y) / cellPx)
        if (x >= 0 && y >= 0 && x < section.w && y < section.h) onTap(x, y)
      }
      start = null
    }
    c.addEventListener('pointerdown', down)
    c.addEventListener('pointermove', move)
    c.addEventListener('pointerup', up)
    c.addEventListener('pointercancel', up)
    return () => {
      c.removeEventListener('pointerdown', down)
      c.removeEventListener('pointermove', move)
      c.removeEventListener('pointerup', up)
      c.removeEventListener('pointercancel', up)
    }
  })

  return <canvas ref={ref} className="absolute inset-0 h-full w-full touch-none" aria-label={t.lightbox.boardAria} />
}

export default function LightboxPage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const data = usePatternData()
  const pxPerMm = useStore((s) => s.pxPerMm)
  const beadSize = useStore((s) => s.settings.beadSize)
  const placed = useStore((s) => s.placed)
  const activeColor = useStore((s) => s.activeColor)
  const activeSection = useStore((s) => s.activeSection)
  const { setActiveColor, setActiveSection, setPlaced } = useStore.getState()
  const [calibrating, setCalibrating] = useState(false)

  // Keep the screen awake while guiding.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    ;(navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<typeof lock> } }).wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => {})
    return () => {
      lock?.release().catch(() => {})
    }
  }, [])

  const section = data ? (data.sections.find((s) => s.id === activeSection) ?? data.sections[0]) : null

  const sectionColors = useMemo(() => {
    if (!data || !section) return []
    const left = new Map<number, number>()
    const present = new Set<number>()
    for (let y = section.y; y < section.y + section.h; y++) {
      for (let x = section.x; x < section.x + section.w; x++) {
        const i = y * data.pattern.width + x
        const c = data.pattern.cells[i]
        present.add(c)
        if (placed[i] !== '1') left.set(c, (left.get(c) ?? 0) + 1)
      }
    }
    return data.legend.filter((l) => present.has(l.color)).map((l) => ({ ...l, left: left.get(l.color) ?? 0 }))
  }, [data, section, placed])

  if (!hydrated) return null
  if (!data || !section) return <NoPattern />

  const needsCalibration = calibrating || pxPerMm === null
  const current = sectionColors.find((c) => c.color === activeColor) ?? sectionColors[0]
  const color = data.palette.colors[current.color]
  const cellPx = (pxPerMm ?? DEFAULT_PX_PER_MM) * BEAD_PITCH_MM[beadSize]
  const idx = sectionColors.indexOf(current)
  const stepColor = (d: number) => setActiveColor(sectionColors[(idx + d + sectionColors.length) % sectionColors.length].color)
  const nextSection = () => {
    const i = data.sections.indexOf(section)
    setActiveSection(data.sections[(i + 1) % data.sections.length].id)
  }

  const W = data.pattern.width
  const draw = (ctx: CanvasRenderingContext2D, px: number) => {
    const [r, g, b] = color.rgb
    for (let y = 0; y < section.h; y++) {
      for (let x = 0; x < section.w; x++) {
        const i = (section.y + y) * W + section.x + x
        const cx = x * px + px / 2
        const cy = y * px + px / 2
        const isCurrent = data.pattern.cells[i] === current.color
        const done = placed[i] === '1'
        ctx.beginPath()
        if (isCurrent && !done) {
          ctx.fillStyle = `rgb(${r} ${g} ${b})`
          ctx.arc(cx, cy, px * 0.45, 0, Math.PI * 2)
          ctx.fill()
          ctx.lineWidth = Math.max(1, px * 0.08)
          ctx.strokeStyle = '#fff'
          ctx.stroke()
        } else {
          ctx.fillStyle = done ? '#2a2a2a' : '#141414'
          ctx.arc(cx, cy, px * (done ? 0.3 : 0.12), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, section.w * px, section.h * px)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {needsCalibration ? (
        <div className="flex-1 overflow-y-auto">
          <button
            type="button"
            className="icon-btn absolute right-2 top-2 text-white hover:bg-white/10"
            onClick={() => (pxPerMm === null ? router.back() : setCalibrating(false))}
            aria-label={t.lightbox.exit}
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
          <Calibrate onDone={() => setCalibrating(false)} />
        </div>
      ) : (
        <>
          <div role="alert" className="flex items-center justify-center gap-2 bg-amber-400 px-3 py-2 text-center text-sm font-bold text-black">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden /> {t.lightbox.warning}
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <button type="button" className="icon-btn text-white hover:bg-white/10" onClick={() => router.back()} aria-label={t.lightbox.exit}>
              <X className="h-6 w-6" aria-hidden />
            </button>
            <Swatch rgb={color.rgb} number={current.number} size={40} done={current.left === 0} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-lg font-bold">
                {color.name} <span className="font-mono text-sm text-white/60">{color.code}</span>
              </p>
              <p className="text-sm text-white/70">
                {section.label} · {t.lightbox.remaining(current.left)}
              </p>
            </div>
            <button
              type="button"
              className="icon-btn text-white hover:bg-white/10"
              onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
              aria-label={t.lightbox.fullscreen}
            >
              <Expand className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="icon-btn text-white hover:bg-white/10" onClick={() => setCalibrating(true)} aria-label={t.lightbox.recalibrate}>
              <Ruler className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <LightCanvas
              section={section}
              cellPx={cellPx}
              draw={draw}
              onTap={(x, y) => {
                const i = (section.y + y) * W + section.x + x
                if (data.pattern.cells[i] === current.color) setPlaced([i], placed[i] !== '1')
              }}
            />
            <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-white/40">{t.lightbox.tapHint}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button type="button" className="btn h-16 bg-white/10 text-white hover:bg-white/20" onClick={() => stepColor(-1)}>
              <ChevronLeft className="h-6 w-6" aria-hidden />
              <span className="sr-only sm:not-sr-only">{t.lightbox.prevColor}</span>
            </button>
            <button type="button" className="btn h-16 bg-white text-black hover:bg-white/90" onClick={() => stepColor(1)}>
              <span className="whitespace-nowrap sm:hidden">{t.lightbox.nextShort}</span>
              <span className="hidden sm:inline">{t.lightbox.nextColor}</span>
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
            <button type="button" className="btn h-16 bg-white/10 text-white hover:bg-white/20" onClick={nextSection} disabled={data.sections.length < 2}>
              <SkipForward className="h-6 w-6" aria-hidden />
              <span className="sr-only sm:not-sr-only">{t.lightbox.nextSection}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
