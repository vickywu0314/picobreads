'use client'

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import type { Rgb } from '@picobreads/pattern-engine'
import { ToolSprite } from './tools'

export interface Flight {
  id: number
  cell: number
  from: { x: number; y: number }
  to: { x: number; y: number; size: number }
  color: Rgb
}

interface ToolLayerState {
  /** Tool tip position in viewport px. */
  tip: { x: number; y: number } | null
  visible: boolean
  pressed: boolean
  /** Ring around the cell under the tip: ok = a bead can go here. */
  ring: { x: number; y: number; size: number; ok: boolean } | null
  /** On-screen cell size (px), so the beads on the tool match the board. */
  cell: number
  flights: Flight[]
}

/** High-frequency pointer state lives here so the page doesn't re-render on every move. */
export const useToolLayer = create<ToolLayerState>()(() => ({ tip: null, visible: false, pressed: false, ring: null, cell: 14, flights: [] }))

function FlyingBead({ f, onLand, tube }: { f: Flight; onLand: (f: Flight) => void; tube: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const size = Math.max(8, f.to.size * 0.94)
    const dx = f.to.x - f.from.x
    const dy = f.to.y - f.from.y
    // Slide off the tip, drop with a little arc, settle with a squash.
    const anim = el.animate(
      [
        { transform: `translate(${f.from.x}px, ${f.from.y}px) translate(-50%, -50%) scale(0.55)`, offset: 0 },
        { transform: `translate(${f.from.x + dx * 0.55}px, ${f.from.y + dy * 0.55 - 10}px) translate(-50%, -50%) scale(0.9)`, offset: 0.55 },
        { transform: `translate(${f.to.x}px, ${f.to.y}px) translate(-50%, -50%) scale(1.12, 0.9)`, offset: 0.85 },
        { transform: `translate(${f.to.x}px, ${f.to.y}px) translate(-50%, -50%) scale(1)`, offset: 1 },
      ],
      { duration: 170, easing: 'cubic-bezier(.35,.6,.4,1)', fill: 'forwards' },
    )
    el.style.width = `${size}px`
    el.style.height = `${tube ? size * 0.8 : size}px` // tube: top face seen at an angle
    anim.onfinish = () => onLand(f)
    return () => anim.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [r, g, b] = f.color
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-40 rounded-full"
      style={
        tube
          ? {
              // 3D tube like the beads on the v1.1 pegboard: dark hole, glossy top, darker side wall.
              background: `radial-gradient(circle at 50% 50%, rgb(${r * 0.3} ${g * 0.3} ${b * 0.3}) 0 17%, transparent 18%), radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), transparent 50%), rgb(${r} ${g} ${b})`,
              boxShadow: `0 ${Math.max(3, f.to.size * 0.3)}px 0 rgb(${r * 0.6} ${g * 0.6} ${b * 0.6}), 0 ${Math.max(5, f.to.size * 0.4)}px 8px rgba(0,0,0,0.3)`,
            }
          : {
              background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.35) 0 16%, transparent 17%), radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), transparent 45%), rgb(${r} ${g} ${b})`,
              boxShadow: '0 2px 3px rgba(0,0,0,0.3)',
            }
      }
    />
  )
}

/** Renders the held tool, the target ring and beads in flight above everything. */
export function ToolLayer({
  tool,
  color,
  count,
  onLand,
  tube = false,
}: {
  tube?: boolean
  tool: 'pen' | 'tweezers' | null
  color: Rgb | null
  count: number
  onLand: (f: Flight) => void
}) {
  const { tip, visible, pressed, ring, cell, flights } = useToolLayer()
  return (
    <>
      {ring && visible && tool && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-40 rounded-full border-2"
          style={{
            width: ring.size + 6,
            height: ring.size + 6,
            transform: `translate(${ring.x}px, ${ring.y}px) translate(-50%, -50%)`,
            borderColor: ring.ok ? '#22c55e' : 'rgba(239,68,68,0.8)',
            boxShadow: ring.ok ? '0 0 0 2px rgba(34,197,94,0.25)' : 'none',
          }}
        />
      )}
      {flights.map((f) => (
        <FlyingBead key={f.id} f={f} onLand={onLand} tube={tube} />
      ))}
      {tool && tip && visible && <ToolSprite tool={tool} x={tip.x} y={tip.y} color={color} count={count} pressed={pressed} cell={cell} />}
    </>
  )
}
