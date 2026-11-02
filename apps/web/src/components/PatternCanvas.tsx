'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import type { Palette, Pattern, Section } from '@picobreads/pattern-engine'
import { luminance } from '@/lib/pattern'

export interface PatternCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  fit: () => void
  /** Cell index under a viewport point, or -1. */
  cellAt: (clientX: number, clientY: number) => number
  /** Viewport geometry of a cell (center + edge length). */
  cellRect: (index: number) => { x: number; y: number; size: number }
}

export interface ToolPointerEvent {
  type: 'down' | 'move' | 'up' | 'hover' | 'leave' | 'cancel'
  clientX: number
  clientY: number
  pointerType: string
}

interface Props {
  pattern: Pattern
  palette: Palette
  /** palette index → legend number */
  numbers: Map<number, number>
  placed: string
  /** Highlight only this palette color (color-by-color mode). */
  selected: number | null
  /** Focus / dim outside this section. */
  section: Section | null
  boardCells: number
  /** Show the "fix colors" cursor style. */
  editMode?: boolean
  onCellTap?: (index: number) => void
  /**
   * Tool mode: one-finger / left-mouse gestures go to `onTool` instead of panning.
   * Two fingers still pinch-zoom and pan; mouse wheel zooms, middle / right drag pans.
   */
  toolMode?: boolean
  onTool?: (e: ToolPointerEvent) => void
  label: string
}

const MAX_SCALE = 64

/**
 * Canvas pattern view with pan (drag), zoom (pinch / wheel / buttons) and tap.
 * Only visible cells are drawn, so 78×78+ stays smooth on phones.
 */
export const PatternCanvas = forwardRef<PatternCanvasHandle, Props>(function PatternCanvas(props, ref) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const view = useRef({ scale: 8, ox: 0, oy: 0, fitScale: 8 })
  const size = useRef({ w: 0, h: 0, dpr: 1 })
  const propsRef = useRef(props)
  propsRef.current = props
  const raf = useRef(0)

  const colorStyles = useMemo(() => {
    return props.palette.colors.map((c) => {
      const [r, g, b] = c.rgb
      const mix = (v: number) => Math.round(v * 0.25 + 160 * 0.75)
      return {
        solid: `rgb(${r} ${g} ${b})`,
        dim: `rgb(${mix(r)} ${mix(g)} ${mix(b)} / 0.55)`,
        text: luminance(c.rgb) > 0.6 ? '#1b1b1b' : '#ffffff',
        ring: luminance(c.rgb) > 0.6 ? '#1b1b1b' : '#ffffff',
      }
    })
  }, [props.palette])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { pattern, placed, selected, section, numbers, boardCells } = propsRef.current
    const { w, h, dpr } = size.current
    const { scale, ox, oy } = view.current
    const W = pattern.width
    const H = pattern.height
    const styles = getComputedStyle(canvas)
    const bg = styles.getPropertyValue('--canvas-bg').trim() || '#eee'
    const board = styles.getPropertyValue('--board').trim() || '#ddd'

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = board
    ctx.fillRect(ox, oy, W * scale, H * scale)

    const x0 = Math.max(0, Math.floor(-ox / scale))
    const y0 = Math.max(0, Math.floor(-oy / scale))
    const x1 = Math.min(W, Math.ceil((w - ox) / scale))
    const y1 = Math.min(H, Math.ceil((h - oy) / scale))
    const showBeads = scale >= 7
    const showNumbers = scale >= 18
    const fontPx = Math.max(8, Math.floor(scale * 0.42))
    if (showNumbers) {
      ctx.font = `600 ${fontPx}px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
    }

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = y * W + x
        const c = pattern.cells[i]
        if (c < 0) continue // empty cell (removed backdrop): bare board
        const s = colorStyles[c]
        const inSection = !section || (x >= section.x && x < section.x + section.w && y >= section.y && y < section.y + section.h)
        const isPlaced = placed[i] === '1'
        const focus = inSection && (selected === null || c === selected)
        const px = ox + x * scale
        const py = oy + y * scale

        if (isPlaced && showBeads) {
          // Placed bead: round bead with a hole and a soft highlight.
          const cx = px + scale / 2
          const cy = py + scale / 2
          ctx.fillStyle = focus ? s.solid : s.dim
          ctx.beginPath()
          ctx.arc(cx, cy, scale * 0.47, 0, Math.PI * 2)
          ctx.fill()
          if (scale >= 12) {
            ctx.strokeStyle = 'rgba(255,255,255,0.45)'
            ctx.lineWidth = Math.max(1, scale * 0.07)
            ctx.beginPath()
            ctx.arc(cx, cy, scale * 0.33, Math.PI * 1.05, Math.PI * 1.55)
            ctx.stroke()
            ctx.strokeStyle = 'rgba(0,0,0,0.18)'
            ctx.beginPath()
            ctx.arc(cx, cy, scale * 0.44, Math.PI * 0.1, Math.PI * 0.8)
            ctx.stroke()
          }
          ctx.fillStyle = board
          ctx.beginPath()
          ctx.arc(cx, cy, scale * 0.15, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Not placed yet: flat square (the "map" of what goes here).
          ctx.fillStyle = focus ? s.solid : s.dim
          const inset = showBeads ? Math.max(0.5, scale * 0.06) : 0
          ctx.fillRect(px + inset, py + inset, scale - inset * 2, scale - inset * 2)
          if (focus && selected !== null && scale >= 9) {
            // Target cell: high-contrast ring so it never relies on color alone.
            ctx.strokeStyle = s.ring
            ctx.lineWidth = Math.max(1.5, scale * 0.08)
            const r = ctx.lineWidth
            ctx.strokeRect(px + r, py + r, scale - r * 2, scale - r * 2)
          }
        }
        if (showNumbers && focus && !isPlaced) {
          ctx.fillStyle = s.text
          ctx.fillText(String(numbers.get(c) ?? ''), px + scale / 2, py + scale / 2 + 0.5)
        }
      }
    }

    // Board lines every `boardCells`, thin grid when zoomed in.
    if (scale >= 10) {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = x0; x <= x1; x++) {
        ctx.moveTo(Math.round(ox + x * scale) + 0.5, oy + y0 * scale)
        ctx.lineTo(Math.round(ox + x * scale) + 0.5, oy + y1 * scale)
      }
      for (let y = y0; y <= y1; y++) {
        ctx.moveTo(ox + x0 * scale, Math.round(oy + y * scale) + 0.5)
        ctx.lineTo(ox + x1 * scale, Math.round(oy + y * scale) + 0.5)
      }
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(120,90,70,0.65)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 0; x <= W; x += boardCells) {
      ctx.moveTo(ox + x * scale, oy)
      ctx.lineTo(ox + x * scale, oy + H * scale)
    }
    for (let y = 0; y <= H; y += boardCells) {
      ctx.moveTo(ox, oy + y * scale)
      ctx.lineTo(ox + W * scale, oy + y * scale)
    }
    ctx.moveTo(ox + W * scale, oy)
    ctx.lineTo(ox + W * scale, oy + H * scale)
    ctx.moveTo(ox, oy + H * scale)
    ctx.lineTo(ox + W * scale, oy + H * scale)
    ctx.stroke()

    if (section) {
      ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#e4572e'
      ctx.lineWidth = 3
      ctx.strokeRect(ox + section.x * scale, oy + section.y * scale, section.w * scale, section.h * scale)
    }
  }, [colorStyles])

  const requestDraw = useCallback(() => {
    if (raf.current) return
    raf.current = requestAnimationFrame(() => {
      raf.current = 0
      draw()
    })
  }, [draw])

  const fit = useCallback(() => {
    const { pattern, section } = propsRef.current
    const { w, h } = size.current
    if (!w || !h) return
    const r = section ?? { x: 0, y: 0, w: pattern.width, h: pattern.height }
    const scale = Math.min(w / r.w, h / r.h) * 0.94
    const whole = Math.min(w / pattern.width, h / pattern.height) * 0.94
    view.current = {
      scale,
      fitScale: Math.min(scale, whole),
      ox: (w - r.w * scale) / 2 - r.x * scale,
      oy: (h - r.h * scale) / 2 - r.y * scale,
    }
    requestDraw()
  }, [requestDraw])

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const v = view.current
      const next = Math.min(MAX_SCALE, Math.max(v.fitScale * 0.6, v.scale * factor))
      const k = next / v.scale
      v.ox = cx - (cx - v.ox) * k
      v.oy = cy - (cy - v.oy) * k
      v.scale = next
      requestDraw()
    },
    [requestDraw],
  )

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomAt(size.current.w / 2, size.current.h / 2, 1.5),
      zoomOut: () => zoomAt(size.current.w / 2, size.current.h / 2, 1 / 1.5),
      fit,
      cellAt: (clientX, clientY) => {
        const canvas = canvasRef.current
        if (!canvas) return -1
        const r = canvas.getBoundingClientRect()
        if (clientX < r.left || clientY < r.top || clientX > r.right || clientY > r.bottom) return -1
        const { pattern } = propsRef.current
        const v = view.current
        const x = Math.floor((clientX - r.left - v.ox) / v.scale)
        const y = Math.floor((clientY - r.top - v.oy) / v.scale)
        return x >= 0 && y >= 0 && x < pattern.width && y < pattern.height ? y * pattern.width + x : -1
      },
      cellRect: (index) => {
        const r = canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 }
        const { pattern } = propsRef.current
        const v = view.current
        const x = index % pattern.width
        const y = Math.floor(index / pattern.width)
        return { x: r.left + v.ox + (x + 0.5) * v.scale, y: r.top + v.oy + (y + 0.5) * v.scale, size: v.scale }
      },
    }),
    [zoomAt, fit],
  )

  // Size canvas to its container.
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    let first = true
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      size.current = { w: rect.width, h: rect.height, dpr }
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      if (first) {
        first = false
        fit()
      } else requestDraw()
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [fit, requestDraw])

  // Re-fit when switching pattern or section.
  const sectionId = props.section?.id ?? ''
  useEffect(() => {
    fit()
  }, [props.pattern.id, props.pattern.width, props.pattern.height, sectionId, fit])

  // Redraw on any prop change.
  useEffect(() => {
    requestDraw()
  })

  // Pointer gestures: drag = pan, pinch = zoom, short tap = cell tap.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pts = new Map<number, { x: number; y: number }>()
    let tap: { x: number; y: number; moved: boolean } | null = null
    let pinch: { dist: number; mx: number; my: number } | null = null
    // Pointer currently driving the tool (one finger / left mouse) in tool mode.
    let toolPointer: number | null = null
    let mousePan = false
    const tool = (type: ToolPointerEvent['type'], e: PointerEvent) =>
      propsRef.current.onTool?.({ type, clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType })

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const pinchState = () => {
      const [a, b] = [...pts.values()]
      return { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }
    }

    const down = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId)
      const p = local(e)
      pts.set(e.pointerId, p)
      const toolMode = propsRef.current.toolMode
      mousePan = e.pointerType === 'mouse' && e.button !== 0
      if (toolMode && pts.size === 1 && !mousePan) {
        toolPointer = e.pointerId
        tool('down', e)
        return
      }
      if (pts.size === 1) tap = { ...p, moved: !!toolMode }
      if (pts.size === 2) {
        if (toolPointer !== null) {
          tool('cancel', e)
          toolPointer = null
        }
        pinch = pinchState()
        if (tap) tap.moved = true
      }
    }
    const move = (e: PointerEvent) => {
      const prev = pts.get(e.pointerId)
      if (!prev) {
        if (propsRef.current.toolMode && e.pointerType === 'mouse') tool('hover', e)
        return
      }
      if (toolPointer === e.pointerId) {
        pts.set(e.pointerId, local(e))
        tool('move', e)
        return
      }
      const p = local(e)
      pts.set(e.pointerId, p)
      const v = view.current
      if (pts.size === 1) {
        if (tap && !tap.moved && Math.hypot(p.x - tap.x, p.y - tap.y) > 6) tap.moved = true
        if (tap?.moved) {
          v.ox += p.x - prev.x
          v.oy += p.y - prev.y
          requestDraw()
        }
      } else if (pts.size === 2 && pinch) {
        const now = pinchState()
        v.ox += now.mx - pinch.mx
        v.oy += now.my - pinch.my
        zoomAt(now.mx, now.my, now.dist / Math.max(1, pinch.dist))
        pinch = now
      }
    }
    const up = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return
      pts.delete(e.pointerId)
      if (toolPointer === e.pointerId) {
        toolPointer = null
        tool(e.type === 'pointercancel' ? 'cancel' : 'up', e)
        return
      }
      if (pts.size < 2) pinch = null
      if (pts.size === 0 && tap && !tap.moved) {
        const { pattern, onCellTap } = propsRef.current
        const v = view.current
        const x = Math.floor((tap.x - v.ox) / v.scale)
        const y = Math.floor((tap.y - v.oy) / v.scale)
        if (x >= 0 && y >= 0 && x < pattern.width && y < pattern.height) onCellTap?.(y * pattern.width + x)
      }
      if (pts.size === 0) tap = null
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = canvas.getBoundingClientRect()
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015))
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('wheel', wheel, { passive: false })
    const leave = (e: PointerEvent) => {
      if (propsRef.current.toolMode && e.pointerType === 'mouse' && !pts.size) tool('leave', e)
    }
    const noMenu = (e: Event) => propsRef.current.toolMode && e.preventDefault()
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('contextmenu', noMenu)
    return () => {
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('contextmenu', noMenu)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('wheel', wheel)
    }
  }, [requestDraw, zoomAt])

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={props.label}
        className={`absolute inset-0 touch-none ${props.toolMode ? 'cursor-none' : props.editMode ? 'cursor-crosshair' : 'cursor-grab'}`}
      />
    </div>
  )
})
