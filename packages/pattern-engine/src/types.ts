export type BeadSize = '5mm' | '2.6mm'

export type Rgb = [number, number, number]

export type Specialty = 'glow' | 'glitter' | 'neon' | 'pearl' | 'transparent' | 'metallic'

export interface PaletteColor {
  code: string
  name: string
  hex: string
  rgb: Rgb
  /** Special finishes are skipped by automatic generation. */
  specialty?: Specialty
  /** Grams per bead. Unknown until measured with real supplier beads. */
  weightG?: number
}

export interface Palette {
  id: string
  brand: string
  product: string
  beadSize: BeadSize
  status: 'community' | 'measured' | 'official'
  license: string
  attribution: string
  /** Default grams per bead for the whole palette; null = not measured yet. */
  weightG: number | null
  colors: PaletteColor[]
}

/** A generated pattern. `cells[y * width + x]` is an index into `palette.colors`. */
export interface Pattern {
  id: string
  paletteId: string
  width: number
  height: number
  cells: number[]
}

export interface ColorCount {
  /** Index into palette.colors */
  color: number
  count: number
}

/** One pegboard-sized block of a pattern. */
export interface Section {
  id: string
  /** Human label, e.g. "A1" (row letter + column number). */
  label: string
  x: number
  y: number
  w: number
  h: number
}
