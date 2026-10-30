'use client'

import { useEffect, useRef } from 'react'
import { getPalette, type Pattern } from '@picobreads/pattern-engine'

/** Static, non-interactive render of a pattern (beads drawn as rounded dots). */
export function PatternThumb({
  pattern,
  className = '',
  beads = true,
  label,
}: {
  pattern: Pattern
  className?: string
  beads?: boolean
  label?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      const ctx = canvas.getContext('2d')!
      const { width: W, height: H, cells } = pattern
      const cell = Math.min(canvas.width / W, canvas.height / H)
      const ox = (canvas.width - cell * W) / 2
      const oy = (canvas.height - cell * H) / 2
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const palette = getPalette(pattern.paletteId)
      const styles = palette.colors.map((c) => `rgb(${c.rgb[0]} ${c.rgb[1]} ${c.rgb[2]})`)
      const round = beads && cell >= 4
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          ctx.fillStyle = styles[cells[y * W + x]]
          const px = ox + x * cell
          const py = oy + y * cell
          if (round) {
            ctx.beginPath()
            ctx.arc(px + cell / 2, py + cell / 2, cell * 0.47, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.fillRect(px, py, Math.ceil(cell), Math.ceil(cell))
          }
        }
      }
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [pattern, beads])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label ?? `Bead pattern, ${pattern.width} by ${pattern.height}`}
      className={`block h-full w-full ${className}`}
      style={{ aspectRatio: `${pattern.width} / ${pattern.height}` }}
    />
  )
}
