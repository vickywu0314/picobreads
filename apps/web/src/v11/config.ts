import { V11_BOARD_PEGS, V11_PALETTE_ID, type TierId } from '@/config/site'
import type { LibraryPattern } from '@/config/catalog'

// v1.1 ("Pipixel" redesign). Everything new goes into v1.1; v1.0 stays as it was.

export const V11 = {
  name: 'Pipixel',
  /** Route prefix of the v1.1 site. */
  base: '/v1-1',
}

/** Builds a v1.1 URL (keeps the static-export trailing slash). */
export const v11Href = (path = '/') => `${V11.base}${path.startsWith('/') ? path : `/${path}`}`

/**
 * v1.1 bead set and pegboard (industry standard for MARD mini beads): 2.6 mm beads on a
 * 52 × 52-peg board → 52 × 2.6 mm ≈ 13.5 cm of picture per board (the plastic board itself is ≈ 14 cm).
 */
export const V11_BEAD_SIZE = '2.6mm' as const
export const V11_PITCH_MM = 2.6
export const V11_BOARD = { pegs: V11_BOARD_PEGS }

/**
 * v1.1 sizes = how many boards per side: 1 board, 2 × 2, 3 × 3. More boards only when the
 * picture has detail one board would lose (see recommendBoards); a simple picture stays on one.
 * Prices are placeholders.
 */
export const V11_TIERS: { id: TierId; perSide: number; longSide: number; priceUsd: number; finishedPriceUsd: number }[] = [
  { id: 'small', perSide: 1, longSide: V11_BOARD_PEGS, priceUsd: 24, finishedPriceUsd: 69 },
  { id: 'standard', perSide: 2, longSide: V11_BOARD_PEGS * 2, priceUsd: 49, finishedPriceUsd: 159 },
  { id: 'large', perSide: 3, longSide: V11_BOARD_PEGS * 3, priceUsd: 89, finishedPriceUsd: 299 },
]

/**
 * v1.1 defaults when a design starts: the full 264-color set, full detail; the bead count
 * comes from the boards, never from trading away clarity.
 * (maxColors above the set's count is clamped to "all colors".)
 */
export const V11_DEFAULTS = { paletteId: V11_PALETTE_ID, beadSize: V11_BEAD_SIZE, maxColors: 999, detail: 5, dithering: false }

export const v11Tier = (id: TierId) => V11_TIERS.find((t) => t.id === id) ?? V11_TIERS[0]

export const v11TierByBoards = (perSide: number) => V11_TIERS.find((t) => t.perSide === perSide) ?? V11_TIERS[V11_TIERS.length - 1]

/** Long side in beads (pegs) for a tier. */
export const v11Beads = (id: TierId) => v11Tier(id).longSide

/** Pegboards needed for a grid. */
export const v11Boards = (width: number, height: number) => Math.ceil(width / V11_BOARD.pegs) * Math.ceil(height / V11_BOARD.pegs)

/** Finished size of a grid on v1.1 boards. */
export function v11Size(width: number, height: number) {
  const cm = (n: number) => ((n * V11_PITCH_MM) / 10).toFixed(n * V11_PITCH_MM >= 1000 ? 0 : 1)
  const inch = (n: number) => ((n * V11_PITCH_MM) / 25.4).toFixed(1)
  return { cm: `${cm(width)} × ${cm(height)}`, inch: `${inch(width)} × ${inch(height)}` }
}

/** Prices are not decided yet: v1.1 shows this placeholder everywhere a price would go. */
export const V11_PRICE_PLACEHOLDER = '$xxxx'

export const v11Price = (form: 'digital' | 'kit' | 'finished', tier: TierId) =>
  form === 'digital' ? 0 : form === 'finished' ? v11Tier(tier).finishedPriceUsd : v11Tier(tier).priceUsd

const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`

/**
 * "No idea? Pick one" — shown exactly as in the v1.1 design (images cropped from the design file,
 * numbers as designed). Picking one starts the flow with that image as the source.
 * TODO: replace the crops with the original PNG exports from the design.
 */
export const V11_PICKS: (LibraryPattern & { stats: { w: number; h: number; colors: number; beads: number }; tint: string })[] = [
  { id: 'tabby-cat', image: asset('/v11/pick-cat.png'), themes: ['pets'], tier: 'standard', difficulty: 'medium', maxColors: 22, stats: { w: 48, h: 48, colors: 22, beads: 1103 }, tint: '#fdf3ea' },
  { id: 'caishen', image: asset('/v11/pick-caishen.png'), themes: ['family'], tier: 'standard', difficulty: 'medium', maxColors: 24, stats: { w: 48, h: 48, colors: 24, beads: 1231 }, tint: '#fdf1c9' },
  { id: 'coffee', image: asset('/v11/pick-coffee.png'), themes: ['friends'], tier: 'standard', difficulty: 'easy', maxColors: 25, stats: { w: 48, h: 48, colors: 25, beads: 1140 }, tint: '#e7f2e9' },
]

/** Hero "your photo → your pattern", exactly as designed (static images + bead list). */
export const V11_HERO = {
  photo: asset('/v11/hero-photo.png'),
  pattern: asset('/v11/hero-pattern.png'),
  size: '44×44',
  colors: 34,
  beads: 1936,
  list: [
    { code: 'C30', color: '#82ceff', count: 788 },
    { code: 'A21', color: '#4c2c15', count: 111 },
    { code: 'G1', color: '#f5e5d7', count: 97 },
    { code: 'A17', color: '#e49151', count: 84 },
  ],
}
