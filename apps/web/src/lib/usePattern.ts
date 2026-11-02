'use client'

import { useMemo } from 'react'
import { estimate, getPalette, splitSections } from '@picobreads/pattern-engine'
import { boardCellsFor } from '@/config/site'
import { legendOf } from './pattern'
import { useStore } from './store'

/** Current pattern plus everything derived from it. */
export function usePatternData() {
  const pattern = useStore((s) => s.pattern)
  return useMemo(() => {
    if (!pattern) return null
    const palette = getPalette(pattern.paletteId)
    const legend = legendOf(pattern)
    const numbers = new Map(legend.map((l) => [l.color, l.number]))
    const sections = splitSections(pattern.width, pattern.height, boardCellsFor(pattern.paletteId))
    const est = estimate(pattern, legend.length)
    return { pattern, palette, legend, numbers, sections, est }
  }, [pattern])
}
