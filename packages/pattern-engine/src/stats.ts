import type { ColorCount, Pattern } from './types'

// EMPTY (-1) cells hold no bead; they are skipped everywhere below.

/** Bead count per color, most used first (empty cells skipped). */
export function countColors(cells: ArrayLike<number>): ColorCount[] {
  const map = new Map<number, number>()
  for (let i = 0; i < cells.length; i++) if (cells[i] >= 0) map.set(cells[i], (map.get(cells[i]) ?? 0) + 1)
  return [...map.entries()]
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count || a.color - b.color)
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Estimate {
  difficulty: Difficulty
  /** Rough hands-on time in minutes. */
  minutes: number
}

/**
 * Rough difficulty / time estimate.
 * TODO(milestone 1): calibrate with real build times; current constants are guesses.
 */
export function estimate(pattern: Pattern, colorCount: number): Estimate {
  const beads = beadCount(pattern)
  // Fragmentation: share of horizontally adjacent pairs that change color.
  let changes = 0
  for (let y = 0; y < pattern.height; y++) {
    for (let x = 1; x < pattern.width; x++) {
      const i = y * pattern.width + x
      if (pattern.cells[i] >= 0 && pattern.cells[i - 1] >= 0 && pattern.cells[i] !== pattern.cells[i - 1]) changes++
    }
  }
  const pairs = Math.max(1, pattern.height * (pattern.width - 1))
  const frag = changes / pairs
  const secondsPerBead = 2.5 + frag * 4 + colorCount * 0.05
  const minutes = Math.round((beads * secondsPerBead) / 60 / 5) * 5
  const score = beads / 1000 + colorCount / 8 + frag * 4
  const difficulty: Difficulty = score < 3 ? 'easy' : score < 7 ? 'medium' : 'hard'
  return { difficulty, minutes: Math.max(5, minutes) }
}

/** Beads actually placed (cells that aren't EMPTY). */
export function beadCount(pattern: Pattern): number {
  let n = 0
  for (const c of pattern.cells) if (c >= 0) n++
  return n
}
