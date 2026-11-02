import type { BeadSize } from '@picobreads/pattern-engine'

// All business knobs for the prototype live here. In milestone 5 most of these
// move to the admin "Settings" page / database.

export const SITE = {
  name: 'Cordelia Morrow',
  tagline: 'Your moments, made personal.',
}

/** Bead brand we recommend (most consistent quality, best known in North America). */
export const RECOMMENDED_PALETTE_ID = 'perler'

/**
 * Brands we stock and sell kits for. Other palettes can still be used for free
 * patterns and online beading ("pattern only").
 */
export const KIT_PALETTE_IDS = ['perler', 'artkal-s']

export const isKitBrand = (paletteId: string) => KIT_PALETTE_IDS.includes(paletteId)

export type TierId = 'small' | 'standard' | 'large'

export interface Tier {
  id: TierId
  name: string
  /** Cells on the long side. Short side follows the crop aspect ratio. */
  longSide: number
  /** TODO: placeholder DIY kit price in USD, not decided yet. */
  priceUsd: number
  /** TODO: placeholder price for the finished (we bead & iron it) piece. */
  finishedPriceUsd: number
}

export const TIERS: Tier[] = [
  { id: 'small', name: 'Small', longSide: 29, priceUsd: 24, finishedPriceUsd: 69 },
  { id: 'standard', name: 'Standard', longSide: 52, priceUsd: 39, finishedPriceUsd: 119 },
  { id: 'large', name: 'Large', longSide: 78, priceUsd: 59, finishedPriceUsd: 179 },
]

export const getTier = (id: TierId) => TIERS.find((t) => t.id === id) ?? TIERS[1]

/** Cells per pegboard edge, used to split patterns into sections. */
export const BOARD_CELLS = 29

/** v1.1 bead set (MARD 264-color box) uses 64 × 64-peg boards. */
export const V11_PALETTE_ID = 'mard-264'
export const V11_BOARD_PEGS = 64

/** Pegs per board edge for a pattern's bead set. */
export const boardCellsFor = (paletteId?: string) => (paletteId === V11_PALETTE_ID ? V11_BOARD_PEGS : BOARD_CELLS)

/** Pegboard hole pitch in millimetres. */
export const BEAD_PITCH_MM: Record<BeadSize, number> = { '5mm': 5, '2.6mm': 2.6 }

/**
 * Max-colors slider: from `min` up to every regular color of the chosen bead brand
 * (see maxColorsFor). The more colors, the closer to the photo — and the harder to bead.
 */
export const COLOR_LIMITS = { min: 8, default: 28 }

export const PICKING = {
  allowance: 0.1,
  packSizes: [500, 100, 50],
  // TODO: placeholder grams per bead until we weigh real supplier beads.
  estWeightG: { '5mm': 0.06, '2.6mm': 0.012 } as Record<BeadSize, number>,
}

export const FREE_PREVIEWS_PER_DAY = 10
export const PHOTO_RETENTION_DAYS = 90
export const ASSEMBLED_VARIANT_ENABLED = true

/** Crop aspect presets (width / height). */
export const ASPECTS = [
  { id: '1:1', label: 'Square', value: 1 },
  { id: '4:3', label: 'Landscape 4:3', value: 4 / 3 },
  { id: '3:4', label: 'Portrait 3:4', value: 3 / 4 },
  { id: '3:2', label: 'Landscape 3:2', value: 3 / 2 },
  { id: '2:3', label: 'Portrait 2:3', value: 2 / 3 },
] as const

export type AspectId = (typeof ASPECTS)[number]['id']

/** Grid for a tier (or an explicit long side in beads) at a width / height ratio. */
export function gridSize(tier: TierId | number, aspect: number): { width: number; height: number } {
  const long = typeof tier === 'number' ? tier : getTier(tier).longSide
  if (aspect >= 1) return { width: long, height: Math.max(1, Math.round(long / aspect)) }
  return { width: Math.max(1, Math.round(long * aspect)), height: long }
}
