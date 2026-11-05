import type { BeadSize } from '@picobreads/pattern-engine'
import { BEAD_PITCH_MM, BOARD_PEGS, V11_PALETTE_ID, type TierId } from '@/config/site'
import type { LibraryPattern } from '@/config/catalog'

// BeadSpark site (formerly the v1.1 "Pipixel" redesign). Everything new goes into v1.1; v1.0 stays as it was.

export const V11 = {
  name: 'BeadSpark',
  /** Route prefix of the v1.1 site. */
  base: '',
}

/** Builds a v1.1 URL (keeps the static-export trailing slash). */
export const v11Href = (path = '/') => `${V11.base}${path.startsWith('/') ? path : `/${path}`}`

/**
 * v1.1 beads: the user picks mini (2.6 mm) or standard (5 mm). Each uses its industry-standard
 * board — 52 × 52 pegs ≈ 13.5 cm for mini, 29 × 29 pegs ≈ 14.5 cm for standard (boards ≈ 14–15 cm).
 */
export const V11_BEAD_SIZES: BeadSize[] = ['2.6mm', '5mm']
export const V11_BEAD_SIZE: BeadSize = '2.6mm'

/**
 * v1.1 sizes = how many boards per side: 1 board, 2 × 2, 3 × 3. More boards only when the
 * picture has detail one board would lose (see recommendBoards); a simple picture stays on one.
 * Prices are placeholders.
 */
export const V11_TIERS: { id: TierId; perSide: number; priceUsd: number; finishedPriceUsd: number }[] = [
  { id: 'small', perSide: 1, priceUsd: 24, finishedPriceUsd: 69 },
  { id: 'standard', perSide: 2, priceUsd: 49, finishedPriceUsd: 159 },
  { id: 'large', perSide: 3, priceUsd: 89, finishedPriceUsd: 299 },
]

/**
 * v1.1 defaults when a design starts: the full 264-color set, full detail; the bead count
 * comes from the boards, never from trading away clarity.
 * (maxColors above the set's count is clamped to "all colors".)
 */
export const V11_DEFAULTS = { paletteId: V11_PALETTE_ID, beadSize: V11_BEAD_SIZE, maxColors: 999, detail: 5, dithering: false, removeBg: true, trim: true }

export const v11Tier = (id: TierId) => V11_TIERS.find((t) => t.id === id) ?? V11_TIERS[0]

export const v11TierByBoards = (perSide: number) => V11_TIERS.find((t) => t.perSide === perSide) ?? V11_TIERS[V11_TIERS.length - 1]

/** Long side in beads (pegs) for a tier with the given beads. */
export const v11Beads = (id: TierId, bead: BeadSize) => v11Tier(id).perSide * BOARD_PEGS[bead]

/**
 * What we tell the customer: the standard board we ship is 27 × 27 cm (≈ 104 × 104 pegs for mini
 * beads, 54 × 54 for standard), so a pattern needs as few joins as possible. Display only — the
 * size recommendation still works in BOARD_PEGS units (52 / 29), and sheets / online beading are
 * split into those smaller sections.
 */
export const V11_BOARD_CM = 27
export const v11BoardPegs = (bead: BeadSize) => Math.round((V11_BOARD_CM * 10) / BEAD_PITCH_MM[bead])

/** Standard boards a grid needs, as columns × rows. */
export function v11BoardGrid(width: number, height: number, bead: BeadSize) {
  const pegs = v11BoardPegs(bead)
  const cols = Math.ceil(width / pegs)
  const rows = Math.ceil(height / pegs)
  return { cols, rows, n: cols * rows }
}

/** Number of standard boards a grid needs. */
export const v11Boards = (width: number, height: number, bead: BeadSize) => v11BoardGrid(width, height, bead).n

/** Finished size of a grid. */
export function v11Size(width: number, height: number, bead: BeadSize) {
  const mm = BEAD_PITCH_MM[bead]
  const cm = (n: number) => ((n * mm) / 10).toFixed(n * mm >= 1000 ? 0 : 1)
  const inch = (n: number) => ((n * mm) / 25.4).toFixed(1)
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

/** Hero "your photo → your pattern" and its bead list, as in the v1.1 home design (images cropped from it). */
export const V11_HERO = {
  photo: asset('/v11/home-photo.jpg'),
  pattern: asset('/v11/home-pattern.jpg'),
  list: [
    { color: '#6b3a26', count: 310 },
    { color: '#f0963c', count: 492 },
    { color: '#e9bf8f', count: 268 },
    { color: '#ffffff', count: 324 },
    { color: '#f4a7b9', count: 86 },
    { color: '#3a3a3e', count: 54 },
  ],
}

/** "A little inspiration" — finished bead crafts (photos cropped from the home design). */
export const V11_INSPO = [
  { id: 'coffee', image: asset('/v11/inspo-coffee.jpg') },
  { id: 'flower', image: asset('/v11/inspo-flower.jpg') },
  { id: 'cat', image: asset('/v11/inspo-cat.jpg') },
] as const
