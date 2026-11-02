'use client'

import { useMemo } from 'react'
import { estimate, getPalette, sectionCellIndices, splitSections } from '@picobreads/pattern-engine'
import { boardCellsFor } from '@/config/site'
import { legendOf } from './pattern'
import { useStore } from './store'

/** Current pattern plus everything derived from it. */
export function usePatternData() {
  const pattern = useStore((s) => s.pattern)
  const beadSize = useStore((s) => s.settings.beadSize)
  return useMemo(() => {
    if (!pattern) return null
    const palette = getPalette(pattern.paletteId)
    const legend = legendOf(pattern)
    const numbers = new Map(legend.map((l) => [l.color, l.number]))
    // Boards that would hold no bead at all (only removed backdrop) are left out.
    const sections = splitSections(pattern.width, pattern.height, boardCellsFor(pattern.paletteId, beadSize)).filter((s) =>
      sectionCellIndices(s, pattern.width).some((i) => pattern.cells[i] >= 0),
    )
    const est = estimate(pattern, legend.length)
    return { pattern, palette, legend, numbers, sections, est }
  }, [pattern, beadSize])
}
