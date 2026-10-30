import { countColors, getPalette, regularColorIndices, type BeadSize, type Palette, type Pattern, type Rgb } from '@picobreads/pattern-engine'
import { BEAD_PITCH_MM, BOARD_CELLS } from '@/config/site'

export interface LegendEntry {
  color: number
  count: number
  /** 1-based number printed on cells and in the legend. */
  number: number
}

export function legendOf(pattern: Pattern): LegendEntry[] {
  return countColors(pattern.cells).map((c, i) => ({ ...c, number: i + 1 }))
}

export const css = ([r, g, b]: Rgb) => `rgb(${r} ${g} ${b})`

export function luminance([r, g, b]: Rgb) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** Text color readable on top of `rgb`. */
export const onColor = (rgb: Rgb) => (luminance(rgb) > 0.6 ? '#1b1b1b' : '#ffffff')

export function finishedSize(width: number, height: number, bead: BeadSize) {
  const mm = BEAD_PITCH_MM[bead]
  const cm = (n: number) => ((n * mm) / 10).toFixed(n * mm >= 1000 ? 0 : 1)
  const inch = (n: number) => ((n * mm) / 25.4).toFixed(1)
  return { cm: `${cm(width)} × ${cm(height)}`, inch: `${inch(width)} × ${inch(height)}` }
}

export const boardCount = (width: number, height: number) => Math.ceil(width / BOARD_CELLS) * Math.ceil(height / BOARD_CELLS)

export const colorLabel = (palette: Palette, i: number) => `${palette.colors[i].name} · ${palette.colors[i].code}`

/** Upper bound for the max-colors slider: all regular (non-specialty) colors of the brand. */
export const maxColorsFor = (paletteId: string) => regularColorIndices(getPalette(paletteId)).length
