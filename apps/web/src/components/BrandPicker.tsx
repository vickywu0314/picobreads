'use client'

import { Check } from 'lucide-react'
import { PALETTES, regularColorIndices } from '@picobreads/pattern-engine'
import { RECOMMENDED_PALETTE_ID } from '@/config/site'
import { useT } from '@/i18n'
import { css } from '@/lib/pattern'

/** Radio cards for choosing the bead brand (= color chart the pattern is matched to). */
export function BrandPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const t = useT()
  return (
    <div role="radiogroup" aria-label={t.settings.palette} className="grid gap-2 sm:grid-cols-2">
      {PALETTES.map((p) => {
        const regular = regularColorIndices(p)
        // A spread of the chart's colors as a visual hint.
        const strip = Array.from({ length: 12 }, (_, i) => p.colors[regular[Math.floor((i * regular.length) / 12)]])
        const active = p.id === value
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p.id)}
            className={`relative rounded-2xl border p-3 text-left transition-colors ${
              active ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-2'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="font-bold">{p.brand}</span>
              {p.id === RECOMMENDED_PALETTE_ID && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-fg">
                  {t.brands.recommended}
                </span>
              )}
              <span className="ml-auto text-xs text-muted">{t.brands.colorCount(regular.length)}</span>
              {active && <Check className="h-4 w-4 text-accent" aria-hidden />}
            </span>
            <span className="mt-2 flex gap-0.5" aria-hidden>
              {strip.map((c, i) => (
                <span key={i} className="h-3 flex-1 first:rounded-l-full last:rounded-r-full" style={{ background: css(c.rgb) }} />
              ))}
            </span>
            <span className="mt-2 block text-xs text-muted">{t.brands.blurbs[p.id]}</span>
          </button>
        )
      })}
    </div>
  )
}
