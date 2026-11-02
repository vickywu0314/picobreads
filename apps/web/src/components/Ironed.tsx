'use client'

import { useEffect, useRef } from 'react'
import { getPalette, type Pattern } from '@picobreads/pattern-engine'
import { drawWork, type IronStyle, type PreviewView } from './bead/ProgressPreview'

/** A pattern rendered as the finished piece (ironed) or as beads on a pegboard. */
export function Ironed({
  pattern,
  view = 'final',
  iron = 'normal',
  className = '',
  label,
}: {
  pattern: Pattern
  view?: PreviewView
  iron?: IronStyle
  className?: string
  label?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const paint = () => {
      const r = c.getBoundingClientRect()
      if (!r.width) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
      const ctx = c.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawWork(ctx, r.width, r.height, pattern, getPalette(pattern.paletteId), view === 'board' ? '1'.repeat(pattern.cells.length) : '', view, iron)
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(c)
    return () => ro.disconnect()
  }, [pattern, view, iron])
  return (
    <canvas
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`block w-full ${className}`}
      style={{ aspectRatio: `${pattern.width} / ${pattern.height}` }}
    />
  )
}
