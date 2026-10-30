'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Palette, Pattern } from '@picobreads/pattern-engine'
import { Segmented } from '@/components/ui'
import { useT } from '@/i18n'

export type PreviewView = 'board' | 'ironed' | 'final'

/**
 * Draws the work as it really looks: only placed beads (no color guide).
 * board  = beads sitting on the pegboard, empty pegs where nothing is placed yet
 * ironed = placed beads fused together
 * final  = the whole pattern ironed, i.e. the finished piece
 */
export function drawWork(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pattern: Pattern,
  palette: Palette,
  placed: string,
  view: PreviewView,
) {
  const W = pattern.width
  const H = pattern.height
  const pad = Math.round(Math.min(w, h) * 0.03)
  const cell = Math.min((w - pad * 2) / W, (h - pad * 2) / H)
  const ox = (w - cell * W) / 2
  const oy = (h - cell * H) / 2
  const fill = palette.colors.map((c) => `rgb(${c.rgb[0]} ${c.rgb[1]} ${c.rgb[2]})`)

  ctx.clearRect(0, 0, w, h)
  if (view === 'board') {
    // Translucent pegboard.
    ctx.fillStyle = '#e8eef2'
    ctx.beginPath()
    ctx.roundRect(ox - pad / 2, oy - pad / 2, cell * W + pad, cell * H + pad, pad)
    ctx.fill()
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const on = view === 'final' || placed[i] === '1'
      const cx = ox + (x + 0.5) * cell
      const cy = oy + (y + 0.5) * cell
      if (view === 'board') {
        if (on) {
          ctx.fillStyle = fill[pattern.cells[i]]
          ctx.beginPath()
          ctx.arc(cx, cy, cell * 0.47, 0, Math.PI * 2)
          ctx.fill()
          if (cell >= 6) {
            ctx.strokeStyle = 'rgba(255,255,255,0.45)'
            ctx.lineWidth = Math.max(0.6, cell * 0.07)
            ctx.beginPath()
            ctx.arc(cx, cy, cell * 0.32, Math.PI * 1.05, Math.PI * 1.55)
            ctx.stroke()
            ctx.fillStyle = 'rgba(0,0,0,0.3)'
            ctx.beginPath()
            ctx.arc(cx, cy, cell * 0.15, 0, Math.PI * 2)
            ctx.fill()
          }
        } else {
          ctx.fillStyle = '#c9d3da'
          ctx.beginPath()
          ctx.arc(cx, cy, cell * 0.14, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (on) {
        // Ironed: beads flatten into rounded squares that touch their neighbours.
        ctx.fillStyle = fill[pattern.cells[i]]
        ctx.beginPath()
        ctx.roundRect(cx - cell * 0.53, cy - cell * 0.53, cell * 1.06, cell * 1.06, cell * 0.28)
        ctx.fill()
        if (cell >= 8) {
          ctx.fillStyle = 'rgba(0,0,0,0.14)'
          ctx.beginPath()
          ctx.arc(cx, cy, cell * 0.1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }
}

export function ProgressPreview({
  open,
  onClose,
  pattern,
  palette,
  placed,
}: {
  open: boolean
  onClose: () => void
  pattern: Pattern
  palette: Palette
  placed: string
}) {
  const t = useT()
  const [view, setView] = useState<PreviewView>('board')
  const ref = useRef<HTMLCanvasElement>(null)
  const done = placed ? [...placed].filter((c) => c === '1').length : 0
  const pct = Math.round((done / pattern.cells.length) * 100)

  useEffect(() => {
    if (!open) return
    const canvas = ref.current
    if (!canvas) return
    const paint = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawWork(ctx, r.width, r.height, pattern, palette, placed, view)
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [open, pattern, palette, placed, view])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-label={t.editor.preview.title} className="fixed inset-0 z-50 flex flex-col bg-[#f4efe7] dark:bg-[#15120f]">
      <div className="flex items-center gap-2 p-3">
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t.common.close}>
          <X className="h-6 w-6" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{t.editor.preview.title}</p>
          <p className="text-xs text-muted">{t.editor.preview.progress(done, pattern.cells.length, pct)}</p>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 px-3">
        <canvas
          ref={ref}
          role="img"
          aria-label={t.editor.preview.views[view]}
          className="h-full w-full"
          style={
            view === 'board'
              ? undefined
              : { backgroundImage: 'repeating-conic-gradient(rgba(128,128,128,0.12) 0 25%, transparent 0 50%)', backgroundSize: '24px 24px' }
          }
        />
      </div>
      <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Segmented
          label={t.editor.preview.title}
          value={view}
          onChange={setView}
          options={(['board', 'ironed', 'final'] as const).map((v) => ({ value: v, label: t.editor.preview.views[v] }))}
        />
        <p className="mt-2 text-center text-xs text-muted">{t.editor.preview.hints[view]}</p>
      </div>
    </div>
  )
}

/** Live mini preview of the work so far (placed beads only). Tap to open the full preview. */
export function MiniPreview({
  pattern,
  palette,
  placed,
  onOpen,
  className = '',
}: {
  pattern: Pattern
  palette: Palette
  placed: string
  onOpen: () => void
  className?: string
}) {
  const t = useT()
  const ref = useRef<HTMLCanvasElement>(null)
  const done = placed ? [...placed].filter((c) => c === '1').length : 0
  const pct = Math.round((done / pattern.cells.length) * 100)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const id = requestAnimationFrame(() => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawWork(ctx, r.width, r.height, pattern, palette, placed, 'board')
    })
    return () => cancelAnimationFrame(id)
  }, [pattern, palette, placed])

  const long = 96
  const w = pattern.width >= pattern.height ? long : Math.round((long * pattern.width) / pattern.height)
  const h = pattern.width >= pattern.height ? Math.round((long * pattern.height) / pattern.width) : long

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${t.editor.preview.open} · ${pct}%`}
      className={`overflow-hidden rounded-xl border-2 border-white bg-white/90 shadow-lg backdrop-blur dark:border-[#3a322b] dark:bg-[#1f1b17]/90 ${className}`}
    >
      <canvas ref={ref} aria-hidden className="block" style={{ width: w, height: h }} />
      <span className="block bg-black/55 py-0.5 text-center text-[10px] font-bold text-white">
        {t.editor.preview.open} · {pct}%
      </span>
    </button>
  )
}
