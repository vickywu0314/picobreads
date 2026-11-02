import { BEAD_PITCH_MM, type TierId } from '@/config/site'
import type { BeadSize } from '@picobreads/pattern-engine'
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
 * v1.1 size tiers. A tier is a finished size: `longSide` is the long side in beads with
 * 5 mm beads (29 / 44 / 58 per the design ≈ 14.5 / 22 / 29 cm). Smaller beads fit more
 * beads into the same finished size — see v11Beads. Prices are placeholders.
 */
export const V11_TIERS: { id: TierId; longSide: number; priceUsd: number; finishedPriceUsd: number }[] = [
  { id: 'small', longSide: 29, priceUsd: 24, finishedPriceUsd: 69 },
  { id: 'standard', longSide: 44, priceUsd: 36, finishedPriceUsd: 109 },
  { id: 'large', longSide: 58, priceUsd: 49, finishedPriceUsd: 149 },
]

/**
 * v1.1 defaults when a design starts: keep every color the brand has and full detail;
 * the bead count comes from the size, never from trading away clarity. Users can still lower them.
 * (maxColors above the brand's count is clamped to "all colors".)
 */
export const V11_DEFAULTS = { maxColors: 999, detail: 5, dithering: false }

export const v11Tier = (id: TierId) => V11_TIERS.find((t) => t.id === id) ?? V11_TIERS[1]

/** Long side in beads for a tier with the given bead size (same finished size, more beads when smaller). */
export const v11Beads = (id: TierId, beadSize: BeadSize) =>
  Math.round((v11Tier(id).longSide * BEAD_PITCH_MM['5mm']) / BEAD_PITCH_MM[beadSize])

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
