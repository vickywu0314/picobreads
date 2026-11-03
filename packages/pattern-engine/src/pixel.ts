import { deltaE2000, type Lab } from './color'

/**
 * "Pixel art" look (v1.1 fourth option): the same grid as the plain pattern, but simplified on
 * purpose — few colors, big flat blocks, few stray beads, while keeping the subject's features
 * (eyes, outlines, highlights).
 */
export const PIXEL_ART = {
  /** Upper bound on colors. */
  maxColors: 12,
  /** Detail level used for the base pattern (1 = smoothest). */
  detail: 2,
  /** Colors used by fewer than this share of cells are merged (stricter than the plain pattern). */
  minShare: 0.006,
  /** Regions (4-connected, same color) smaller than this are merged into their surroundings… */
  minRegion: 3,
  /** …but only when the surrounding color is this close (CIEDE2000): high-contrast details stay. */
  mergeDeltaE: 20,
}

/**
 * Merge small same-color regions (fewer than `minSize` cells, 4-connected) into the color that
 * borders them most, when that color is within `maxDeltaE` of theirs. Low-contrast fragments
 * ("碎色") disappear; small high-contrast features such as an eye or a highlight are kept.
 * Negative cells (empty) are left alone and never used as a replacement.
 */
export function mergeSmallRegions(cells: number[], width: number, height: number, paletteLabs: Lab[], minSize = PIXEL_ART.minRegion, maxDeltaE = PIXEL_ART.mergeDeltaE): number[] {
  const out = cells.slice()
  const n = width * height
  const region = new Int32Array(n)
  for (let pass = 0; pass < 3; pass++) {
    region.fill(-1)
    let changed = false
    for (let start = 0; start < n; start++) {
      if (region[start] !== -1) continue
      const color = out[start]
      // Flood the region.
      const cellsOf = [start]
      region[start] = start
      for (let k = 0; k < cellsOf.length; k++) {
        const i = cellsOf[k]
        const x = i % width
        const nb = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i >= width ? i - width : -1, i < n - width ? i + width : -1]
        for (const j of nb) {
          if (j >= 0 && region[j] === -1 && out[j] === color) {
            region[j] = start
            cellsOf.push(j)
          }
        }
      }
      if (color < 0 || cellsOf.length >= minSize) continue
      // Which colors border it, and how often.
      const border = new Map<number, number>()
      for (const i of cellsOf) {
        const x = i % width
        for (const j of [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i >= width ? i - width : -1, i < n - width ? i + width : -1]) {
          if (j < 0) continue
          const c = out[j]
          if (c >= 0 && c !== color) border.set(c, (border.get(c) ?? 0) + 1)
        }
      }
      let best = -1
      let bestCount = 0
      let bestD = Infinity
      for (const [c, count] of border) {
        const d = deltaE2000(paletteLabs[color], paletteLabs[c])
        if (count > bestCount || (count === bestCount && d < bestD)) {
          best = c
          bestCount = count
          bestD = d
        }
      }
      if (best < 0 || bestD > maxDeltaE) continue
      for (const i of cellsOf) out[i] = best
      changed = true
    }
    if (!changed) break
  }
  return out
}
