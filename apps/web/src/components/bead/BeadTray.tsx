'use client'

import type { Palette } from '@picobreads/pattern-engine'
import { css, onColor } from '@/lib/pattern'

export interface TrayWell {
  color: number
  number: number
  left: number
}

// Fixed scatter so each well looks like a little heap of beads.
const HEAP = [
  [22, 30], [34, 28], [46, 31], [16, 40], [28, 41], [40, 40], [52, 41],
  [22, 51], [34, 52], [46, 51], [28, 22], [40, 21], [10, 30], [58, 30],
]

/**
 * Bead tray: one well per color. Press a well to pick beads up with the current
 * tool; keep the finger down and drag onto the board. Sideways swipes still
 * scroll the tray (touch-action: pan-x).
 */
export function BeadTray({
  wells,
  palette,
  active,
  label,
  wellLabel,
  onWellPointer,
  compact = false,
}: {
  /** Phone strip: smaller wells, always one swipeable row. */
  compact?: boolean
  wells: TrayWell[]
  palette: Palette
  active: number | null
  label: string
  wellLabel: (w: TrayWell) => string
  onWellPointer: (type: 'down' | 'move' | 'up' | 'cancel', color: number, e: React.PointerEvent) => void
}) {
  return (
    <div
      role="listbox"
      aria-label={label}
      className={`bead-tray -mx-1 flex gap-2 overflow-x-auto rounded-2xl bg-[#e9dfd2] [touch-action:pan-x] dark:bg-[#2b241e] ${compact ? 'p-1.5' : 'p-2 md:flex-wrap md:overflow-visible'}`}
    >
      {wells.map((w) => {
        const c = palette.colors[w.color]
        const on = active === w.color
        const heap = HEAP.slice(0, Math.max(3, Math.min(HEAP.length, Math.ceil(w.left / 8))))
        return (
          <button
            key={w.color}
            type="button"
            role="option"
            aria-selected={on}
            aria-label={wellLabel(w)}
            data-well={w.color}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              onWellPointer('down', w.color, e)
            }}
            onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && onWellPointer('move', w.color, e)}
            onPointerUp={(e) => onWellPointer('up', w.color, e)}
            onPointerCancel={(e) => onWellPointer('cancel', w.color, e)}
            onContextMenu={(e) => e.preventDefault()}
            className={`relative ${compact ? 'h-[58px] w-[58px]' : 'h-[68px] w-[68px]'} shrink-0 select-none rounded-[18px] bg-[#f7f1e8] shadow-[inset_0_3px_6px_rgba(0,0,0,0.18)] transition-transform active:scale-95 dark:bg-[#3a3129] ${
              on ? 'ring-3 ring-accent' : ''
            } ${w.left === 0 ? 'opacity-45' : ''}`}
            style={{ WebkitTouchCallout: 'none' }}
          >
            <svg viewBox="0 0 68 68" className="absolute inset-0 h-full w-full" aria-hidden>
              {heap.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y + 4} r={6.2} fill={css(c.rgb)} stroke="rgba(0,0,0,0.22)" strokeWidth={0.8} />
                  <circle cx={x} cy={y + 4} r={2} fill="rgba(0,0,0,0.25)" />
                  <circle cx={x - 2} cy={y + 2} r={1.4} fill="rgba(255,255,255,0.55)" />
                </g>
              ))}
            </svg>
            <span
              className="absolute left-1 top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ring-1 ring-black/10"
              style={{ background: css(c.rgb), color: onColor(c.rgb) }}
            >
              {w.left === 0 ? '✓' : w.number}
            </span>
            {compact ? (
              <>
                <span className="absolute right-1 top-1 rounded-full bg-white/85 px-1 font-mono text-[9px] font-bold leading-4 text-fg/75">{w.left}</span>
                <span className="absolute inset-x-0 bottom-0.5 whitespace-nowrap text-center font-mono text-[10px] font-bold text-fg/75">{c.code}</span>
              </>
            ) : (
              <span className="absolute inset-x-0 bottom-0.5 text-center font-mono text-[10px] font-bold text-fg/70">
                {c.code} · {w.left}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
