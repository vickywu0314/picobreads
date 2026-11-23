// BeadSpark mini program settings. Same rules as the website (apps/web/src/config/site.ts, v11/config.ts).

/**
 * The BeadSpark API (same server as the website). An https domain with ICP filing, registered as
 * request / downloadFile 合法域名 in the mini program admin — the same address for the dev tools,
 * trial and release versions.
 */
export const API_BASE = 'https://beadspark.top'

/** Website address, for share links shown as text. */
export const SITE_URL = 'https://beadspark.top'

export const PALETTE_ID = 'mard-264'

export type BeadSize = '2.6mm' | '5mm'
export type TierId = 'small' | 'standard' | 'large'
export type Look = 'classic' | 'pixel'

/** Pegs per side of one standard board of each bead size. */
export const BOARD_PEGS: Record<BeadSize, number> = { '2.6mm': 52, '5mm': 29 }
export const PITCH_MM: Record<BeadSize, number> = { '2.6mm': 2.6, '5mm': 5 }

/** Sizes: 1, 2 × 2 or 3 × 3 boards. */
export const TIERS: { id: TierId; perSide: number }[] = [
  { id: 'small', perSide: 1 },
  { id: 'standard', perSide: 2 },
  { id: 'large', perSide: 3 },
]
/** The pixel-art option uses the 2 × 2 grid. */
export const PIXEL_TIER: TierId = 'standard'

/** The board we tell customers about: 27 × 27 cm. Display only. */
export const BOARD_CM = 27

export const perSideOf = (tier: TierId) => TIERS.find((t) => t.id === tier)?.perSide ?? 1

/** Grid size for `perSide` boards at the photo's width / height ratio. */
export function gridSize(perSide: number, bead: BeadSize, aspect: number) {
  const long = perSide * BOARD_PEGS[bead]
  return aspect >= 1 ? { width: long, height: Math.max(1, Math.round(long / aspect)) } : { width: Math.max(1, Math.round(long * aspect)), height: long }
}

/** Finished size in cm, e.g. "13.5 × 13.5". */
export function sizeCm(width: number, height: number, bead: BeadSize) {
  const cm = (n: number) => ((n * PITCH_MM[bead]) / 10).toFixed(n * PITCH_MM[bead] >= 1000 ? 0 : 1)
  return `${cm(width)} × ${cm(height)}`
}

/** Standard (27 cm) boards a grid needs. */
export function boardCount(width: number, height: number, bead: BeadSize) {
  const pegs = Math.round((BOARD_CM * 10) / PITCH_MM[bead])
  return Math.ceil(width / pegs) * Math.ceil(height / pegs)
}

export const BEAD_SIZES: { id: BeadSize; label: string; hint: string }[] = [
  { id: '2.6mm', label: '迷你豆 2.6 mm', hint: '同样大小能放的豆子约是标准豆的 3 倍，细节更清楚，成品更精致。' },
  { id: '5mm', label: '标准豆 5 mm', hint: '豆子大、好拿好拼，适合小朋友和新手；同样大小细节少一些。' },
]
