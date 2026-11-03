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
  cell = 14,
}: {
  tool: 'pen' | 'tweezers'
  x: number
  y: number
  color: Rgb | null
  count: number
  pressed: boolean
  /** On-screen size of one board cell (px): the beads on the tool are drawn this big. */
  cell?: number
}) {
  // Beads on the tool match the beads on the board (within limits); the tool grows a little with
  // them, but not so much that it hides the board.
  const bead = Math.min(72, Math.max(14, cell * 0.94))
  const k = Math.min(2, Math.max(1, bead / 14))
  const w = bead / k
  return (
    <svg
      aria-hidden
      width="1"
      height="1"
      overflow="visible"
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{ transform: `translate(${x}px, ${y}px)`, filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.35))' }}
    >
      <g transform={`rotate(-38) scale(${k}) ${pressed ? 'translate(0 2)' : ''}`}>
        {tool === 'pen' ? <Pen color={color} count={count} w={w} /> : <Tweezers color={color} holding={count > 0} w={w} />}
      </g>
    </svg>
  )
}

function Pen({ color, count, w }: { color: Rgb | null; count: number; w: number }) {
  // Local coords: tip at (0,0), shaft runs down +y. Beads are strung on the shaft (seen from the
  // side: as wide as a bead, about half as tall); only as many as fit are drawn, plus a count.
  const beadH = w * 0.55
  const room = 150
  const shown = Math.min(count, Math.max(1, Math.floor(room / beadH)))
  const shaftLen = 26 + room
  const half = w / 2
  return (
    <g>
      <defs>
        <linearGradient id="pb-pen-bead" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="0.3" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="0.6" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.4)" />
        </linearGradient>
      </defs>
      {/* thin metal tip */}
      <rect x={-1.6} y={-2} width={3.2} height={shaftLen} rx={1.6} fill="#c9ced6" />
      {/* beads strung on the shaft, nearest the tip first */}
      {color &&
        count > 0 &&
        Array.from({ length: shown }, (_, i) => (
          <g key={i} transform={`translate(0 ${6 + i * beadH})`}>
            <rect x={-half} y={0} width={w} height={beadH - 0.8} rx={Math.min(beadH, w) * 0.3} fill={rgb(color)} stroke={rgb(color, 0.6)} strokeWidth={0.8} />
            <rect x={-half} y={0} width={w} height={beadH - 0.8} rx={Math.min(beadH, w) * 0.3} fill="url(#pb-pen-bead)" />
          </g>
        ))}
      {color && count > shown && (
        <g transform={`translate(${half + 9} ${6 + shown * beadH * 0.5}) rotate(38)`}>
          <rect x={-12} y={-8} width={24} height={16} rx={8} fill="#3b2a30" />
          <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
            ×{count}
          </text>
        </g>
      )}
      {/* handle */}
      <rect x={-8} y={shaftLen - 6} width={16} height={74} rx={8} fill="#ff8a5c" />
      <rect x={-8} y={shaftLen + 40} width={16} height={6} fill="#e4572e" />
      <rect x={-4.5} y={shaftLen + 2} width={4} height={36} rx={2} fill="rgba(255,255,255,0.4)" />
    </g>
  )
}

/** A bead seen from the side, standing up: a short cylinder (local coords, centred on 0,0). */
function UprightBead({ color, w = 13, h = 10 }: { color: Rgb; w?: number; h?: number }) {
  const rx = w / 2
  const ry = w * 0.22
  const top = -h / 2
  return (
    <g>
      <defs>
        <linearGradient id="pb-bead-side" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={rgb(color, 0.5)} />
          <stop offset="0.3" stopColor={rgb(color, 1)} />
          <stop offset="0.6" stopColor={rgb(color, 0.85)} />
          <stop offset="1" stopColor={rgb(color, 0.45)} />
        </linearGradient>
      </defs>
      <path d={`M ${-rx} ${top} L ${-rx} ${-top} A ${rx} ${ry} 0 0 0 ${rx} ${-top} L ${rx} ${top} Z`} fill="url(#pb-bead-side)" />
      <ellipse cx={0} cy={top} rx={rx} ry={ry} fill={rgb(color, 1.0)} stroke={rgb(color, 0.75)} strokeWidth={0.5} />
      <ellipse cx={0} cy={top} rx={rx * 0.36} ry={ry * 0.36} fill={rgb(color, 0.3)} />
      <rect x={-rx * 0.55} y={top + 1.5} width={2.2} height={h - 3} rx={1.1} fill="rgba(255,255,255,0.45)" />
    </g>
  )
}

/**
 * Steel tweezers: two long slender arms joined at the far end, tips pinching the bead.
 * The held bead stands upright on screen (it is counter-rotated against the tool's lean).
 */
function Tweezers({ color, holding, w }: { color: Rgb | null; holding: boolean; w: number }) {
  // Half the gap between the tips: wraps the bead when holding, a little open when empty.
  const gap = holding ? w / 2 + 0.3 : Math.max(8, w / 2 + 2)
  const len = 175
  const arm = (side: 1 | -1) => {
    const tip = side * gap
    return `M ${tip} 0 L ${tip + side * 2.2} 1 L ${side * (gap * 0.75 + 6)} 70 L ${side * 6.5} ${len} L ${side * 2} ${len} L ${side * (gap * 0.75 + 1.5)} 70 Z`
  }
  return (
    <g>
      <defs>
        <linearGradient id="pb-steel" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8e99a8" />
          <stop offset="0.45" stopColor="#f4f7fa" />
          <stop offset="1" stopColor="#a7b1be" />
        </linearGradient>
      </defs>
      {holding && color && (
        <g transform={`translate(0 ${-w * 0.1}) rotate(38)`}>
          <UprightBead color={color} w={w} h={w * 0.75} />
        </g>
      )}
      <path d={arm(-1)} fill="url(#pb-steel)" stroke="#7b8594" strokeWidth={0.7} strokeLinejoin="round" />
      <path d={arm(1)} fill="url(#pb-steel)" stroke="#7b8594" strokeWidth={0.7} strokeLinejoin="round" />
      {/* grip ridges and the joined end */}
      {[96, 104, 112].map((y) => (
        <g key={y}>
          <line x1={-(gap * 0.75 + 5.2) + (y - 70) * 0.012} y1={y} x2={-(gap * 0.75 + 2.5)} y2={y} stroke="#8e99a8" strokeWidth={0.8} />
          <line x1={gap * 0.75 + 2.5} y1={y} x2={gap * 0.75 + 5.2 - (y - 70) * 0.012} y2={y} stroke="#8e99a8" strokeWidth={0.8} />
        </g>
      ))}
      <rect x={-7.5} y={len - 4} width={15} height={12} rx={5} fill="url(#pb-steel)" stroke="#7b8594" strokeWidth={0.7} />
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
