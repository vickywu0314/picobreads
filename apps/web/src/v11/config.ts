import type { TierId } from '@/config/site'
import type { LibraryPattern } from '@/config/catalog'

// v1.1 ("Pipixel" redesign). Everything new goes into v1.1; v1.0 stays as it was.

export const V11 = {
  name: 'Pipixel',
  /** Route prefix of the v1.1 site. */
  base: '/v1-1',
}

/** Builds a v1.1 URL (keeps the static-export trailing slash). */
export const v11Href = (path = '/') => `${V11.base}${path.startsWith('/') ? path : `/${path}`}`

/** v1.1 size tiers (long side in beads), per the v1.1 design. Prices are placeholders. */
export const V11_TIERS: { id: TierId; longSide: number; priceUsd: number; finishedPriceUsd: number }[] = [
  { id: 'small', longSide: 29, priceUsd: 24, finishedPriceUsd: 69 },
  { id: 'standard', longSide: 44, priceUsd: 36, finishedPriceUsd: 109 },
  { id: 'large', longSide: 58, priceUsd: 49, finishedPriceUsd: 149 },
]

export const v11Tier = (id: TierId) => V11_TIERS.find((t) => t.id === id) ?? V11_TIERS[1]

export const v11Price = (form: 'digital' | 'kit' | 'finished', tier: TierId) =>
  form === 'digital' ? 0 : form === 'finished' ? v11Tier(tier).finishedPriceUsd : v11Tier(tier).priceUsd

const img = (id: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/patterns/${id}.jpg`

/** "No idea? Pick one" — sample picks on the home page (48 × 48 as in the design). */
export const V11_PICKS: (LibraryPattern & { longSide: number })[] = [
  { id: 'tabby-cat', image: img('tabby-cat'), themes: ['pets'], tier: 'standard', difficulty: 'medium', maxColors: 22, longSide: 48 },
  { id: 'caishen', image: img('caishen'), themes: ['family'], tier: 'standard', difficulty: 'medium', maxColors: 24, longSide: 48 },
  { id: 'coffee', image: img('coffee'), themes: ['friends'], tier: 'standard', difficulty: 'easy', maxColors: 25, longSide: 48 },
]

/** Hero demo: "your photo → your pattern". */
export const V11_HERO = { image: img('corgi'), longSide: 44, maxColors: 34 }
