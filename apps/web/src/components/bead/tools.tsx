'use client'

import type { Rgb } from '@picobreads/pattern-engine'

export type ToolId = 'pen' | 'tweezers' | 'hand' | 'fix'

/** How many beads fit on the bead pen. */
export const PEN_CAPACITY = 20

const rgb = ([r, g, b]: Rgb, k = 1) => `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`

/**
 * The tool drawn under the user's hand. The tip is at the given viewport point;
 * the body leans down-right like a pen held in the right hand.
 */
export function ToolSprite({
  tool,
  x,
  y,
  color,
  count,
  pressed,
}: {
  tool: 'pen' | 'tweezers'
  x: number
  y: number
  color: Rgb | null
  count: number
  pressed: boolean
}) {
  return (
    <svg
      aria-hidden
      width="1"
      height="1"
      overflow="visible"
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{ transform: `translate(${x}px, ${y}px)`, filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.35))' }}
    >
      <g transform={`rotate(-38) ${pressed ? 'translate(0 2)' : ''}`}>
        {tool === 'pen' ? <Pen color={color} count={count} /> : <Tweezers color={color} holding={count > 0} />}
      </g>
    </svg>
  )
}

function Pen({ color, count }: { color: Rgb | null; count: number }) {
  // Local coords: tip at (0,0), shaft runs down +y.
  const beadH = 7
  const shaftLen = 26 + PEN_CAPACITY * beadH
  return (
    <g>
      {/* thin metal tip */}
      <rect x={-1.6} y={-2} width={3.2} height={shaftLen} rx={1.6} fill="#c9ced6" />
      {/* beads strung on the shaft, nearest the tip first */}
      {color &&
        Array.from({ length: count }, (_, i) => (
          <g key={i} transform={`translate(0 ${6 + i * beadH})`}>
            <rect x={-7} y={0} width={14} height={beadH - 0.8} rx={2.6} fill={rgb(color)} stroke={rgb(color, 0.72)} strokeWidth={0.8} />
            <rect x={-5} y={1} width={4} height={beadH - 3} rx={1.5} fill="rgba(255,255,255,0.35)" />
          </g>
        ))}
      {/* handle */}
      <rect x={-8} y={shaftLen - 6} width={16} height={74} rx={8} fill="#ff8a5c" />
      <rect x={-8} y={shaftLen + 40} width={16} height={6} fill="#e4572e" />
      <rect x={-4.5} y={shaftLen + 2} width={4} height={36} rx={2} fill="rgba(255,255,255,0.4)" />
    </g>
  )
}

function Tweezers({ color, holding }: { color: Rgb | null; holding: boolean }) {
  // Two arms meeting at the tip; open a little when empty.
  const spread = holding ? 3.5 : 9
  const arm = (side: 1 | -1) =>
    `M ${side * 1.2} 0 L ${side * (spread + 1.5)} 34 L ${side * 9} 150 L ${side * 4} 150 L ${side * (spread - 1.5)} 34 Z`
  return (
    <g>
      <path d={arm(-1)} fill="#b8c0cc" stroke="#7d8794" strokeWidth={0.8} />
      <path d={arm(1)} fill="#d3d9e1" stroke="#7d8794" strokeWidth={0.8} />
      <rect x={-9} y={140} width={18} height={14} rx={4} fill="#7d8794" />
      {holding && color && (
        <g>
          <circle cx={0} cy={0} r={6.5} fill={rgb(color)} stroke={rgb(color, 0.7)} strokeWidth={1} />
          <circle cx={0} cy={0} r={2} fill="rgba(0,0,0,0.35)" />
          <circle cx={-2.2} cy={-2.2} r={1.6} fill="rgba(255,255,255,0.5)" />
        </g>
      )}
    </g>
  )
}

/** Small icons for the tool picker. */
export function ToolIcon({ tool, className = 'h-5 w-5' }: { tool: ToolId; className?: string }) {
  const common = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (tool === 'pen')
    return (
      <svg {...common}>
        <path d="M4 20 15 9" />
        <rect x="14" y="2.5" width="5" height="9" rx="2.5" transform="rotate(45 16.5 7)" fill="currentColor" stroke="none" />
        <circle cx="8" cy="16" r="1.6" fill="currentColor" />
        <circle cx="10.5" cy="13.5" r="1.6" fill="currentColor" />
      </svg>
    )
  if (tool === 'tweezers')
    return (
      <svg {...common}>
        <path d="M4 20 17 4" />
        <path d="M4 20 20 7" />
        <circle cx="4.5" cy="19.5" r="1.8" fill="currentColor" />
      </svg>
    )
  if (tool === 'hand')
    return (
      <svg {...common}>
        <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    )
  return (
    <svg {...common}>
      <path d="m14.6 3.4 6 6L10 20H4v-6z" />
      <path d="m12 6 6 6" />
    </svg>
  )
}
