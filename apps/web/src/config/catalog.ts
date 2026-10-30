import type { TierId } from './site'

// PROTOTYPE CONTENT: sample pattern library and community posts.
// In production the library comes from Shopify (products / metaobjects) and
// community posts from our own backend after manual review.

export type Theme = 'couples' | 'family' | 'friends' | 'pets' | 'kids' | 'nature'
export const THEMES: Theme[] = ['couples', 'family', 'friends', 'pets', 'kids', 'nature']

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface LibraryPattern {
  id: string
  /** Source illustration in /public/patterns. */
  image: string
  themes: Theme[]
  tier: TierId
  difficulty: Difficulty
  maxColors: number
}

const img = (id: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/patterns/${id}.jpg`

export const LIBRARY: LibraryPattern[] = [
  { id: 'tabby-cat', image: img('tabby-cat'), themes: ['pets', 'kids'], tier: 'standard', difficulty: 'medium', maxColors: 14 },
  { id: 'corgi', image: img('corgi'), themes: ['pets'], tier: 'standard', difficulty: 'medium', maxColors: 12 },
  { id: 'hearts', image: img('hearts'), themes: ['couples'], tier: 'small', difficulty: 'easy', maxColors: 8 },
  { id: 'house', image: img('house'), themes: ['family'], tier: 'standard', difficulty: 'medium', maxColors: 14 },
  { id: 'sunflower', image: img('sunflower'), themes: ['friends', 'nature'], tier: 'standard', difficulty: 'easy', maxColors: 10 },
  { id: 'sunset', image: img('sunset'), themes: ['couples', 'nature'], tier: 'large', difficulty: 'hard', maxColors: 18 },
  { id: 'cupcake', image: img('cupcake'), themes: ['friends', 'kids'], tier: 'small', difficulty: 'easy', maxColors: 10 },
  { id: 'panda', image: img('panda'), themes: ['kids'], tier: 'standard', difficulty: 'easy', maxColors: 8 },
]

export const getLibraryPattern = (id: string | null) => LIBRARY.find((p) => p.id === id)

export interface CommunityPost {
  id: string
  patternId: string
  author: string
  /** The author allows others to make the same design. */
  allowRemix: boolean
  date: string
}

export const COMMUNITY: CommunityPost[] = [
  { id: 'c1', patternId: 'corgi', author: 'Maya L.', allowRemix: true, date: '2026-10-12' },
  { id: 'c2', patternId: 'hearts', author: 'Jordan & Sam', allowRemix: true, date: '2026-10-08' },
  { id: 'c3', patternId: 'house', author: 'The Nguyen family', allowRemix: false, date: '2026-09-30' },
  { id: 'c4', patternId: 'tabby-cat', author: 'Priya R.', allowRemix: true, date: '2026-09-21' },
  { id: 'c5', patternId: 'sunset', author: 'Leo M.', allowRemix: false, date: '2026-09-15' },
  { id: 'c6', patternId: 'panda', author: 'Ava (age 9)', allowRemix: true, date: '2026-09-02' },
]

export const getCommunityPost = (id: string | null) => COMMUNITY.find((p) => p.id === id)

/**
 * Purchase forms offered at step 5.
 * digital: free printable pattern, emailed (collects the email for marketing opt-in).
 * kit / finished: paid, priced per size tier (see TIERS in site.ts).
 */
export type ProductForm = 'digital' | 'kit' | 'finished'
export const PRODUCT_FORMS: ProductForm[] = ['digital', 'kit', 'finished']
