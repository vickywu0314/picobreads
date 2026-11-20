import * as E from '../lib/engine'
import type { Pattern } from '../lib/engine'
import { BOARD_PEGS, PALETTE_ID, PIXEL_TIER, TIERS, gridSize, perSideOf, type Look, type TierId } from './config'
import type { Work } from './store'

interface Pixels {
  data: Uint8ClampedArray
  width: number
  height: number
}

/** Let the UI breathe between heavy steps (the engine runs on the main thread). */
export const yieldUI = () => new Promise<void>((r) => setTimeout(r, 16))

let canvas: WechatMiniprogram.OffscreenCanvas | null = null
const offscreen = () => {
  if (!canvas) canvas = wx.createOffscreenCanvas({ type: '2d', width: 16, height: 16 }) as WechatMiniprogram.OffscreenCanvas
  return canvas
}

const imageCache = new Map<string, Promise<{ img: any; box: { x: number; y: number; w: number; h: number } }>>() // eslint-disable-line @typescript-eslint/no-explicit-any
const pixelCache = new Map<string, Pixels>()

/**
 * Decode the photo once. `crop` (width / height): cut that shape from the middle first. With `trim`,
 * find where the subject is inside it (empty plain margins cut, same aspect).
 */
function loadPhoto(src: string, trim: boolean, crop: number | null) {
  const key = `${src}|${trim}|${crop}`
  let p = imageCache.get(key)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const c = offscreen()
      const img = c.createImage()
      img.onload = () => {
        let full = { x: 0, y: 0, w: img.width, h: img.height }
        if (crop) {
          // Largest centered rectangle of the chosen shape.
          const w = Math.min(img.width, img.height * crop)
          const h = w / crop
          full = { x: (img.width - w) / 2, y: (img.height - h) / 2, w, h }
        }
        if (!trim) return resolve({ img, box: full })
        const s = Math.min(1, 256 / Math.max(full.w, full.h))
        c.width = Math.max(1, Math.round(full.w * s))
        c.height = Math.max(1, Math.round(full.h * s))
        const ctx = c.getContext('2d') as any // eslint-disable-line @typescript-eslint/no-explicit-any
        ctx.clearRect(0, 0, c.width, c.height)
        ctx.drawImage(img, full.x, full.y, full.w, full.h, 0, 0, c.width, c.height)
        const b = E.subjectBox(ctx.getImageData(0, 0, c.width, c.height))
        resolve({ img, box: b ? { x: full.x + b.x / s, y: full.y + b.y / s, w: b.w / s, h: b.h / s } : full })
      }
      img.onerror = () => reject(new Error('image load failed'))
      img.src = src
    })
    if (imageCache.size > 6) imageCache.clear()
    imageCache.set(key, p)
  }
  return p
}

/** The photo scaled so its long side is about `long` pixels (never upscaled). */
async function pixels(src: string, long: number, trim: boolean, crop: number | null): Promise<Pixels> {
  const key = `${src}|${long}|${trim}|${crop}`
  const hit = pixelCache.get(key)
  if (hit) return hit
  const { img, box } = await loadPhoto(src, trim, crop)
  const s = Math.min(1, long / Math.max(box.w, box.h))
  const c = offscreen()
  c.width = Math.max(1, Math.round(box.w * s))
  c.height = Math.max(1, Math.round(box.h * s))
  const ctx = c.getContext('2d') as any // eslint-disable-line @typescript-eslint/no-explicit-any
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, c.width, c.height)
  const d = ctx.getImageData(0, 0, c.width, c.height)
  const px = { data: d.data, width: d.width, height: d.height }
  if (pixelCache.size > 8) pixelCache.clear()
  pixelCache.set(key, px)
  return px
}

/** Source pixels per bead: fewer for big grids so phones stay quick. */
const samplesPerBead = (long: number) => (long <= 60 ? 6 : long <= 120 ? 4 : 3)

/** Generate one pattern for the work's photo. */
export async function generate(w: Work, tier: TierId, look: Look): Promise<Pattern> {
  if (!w.photo) throw new Error('no photo')
  const { width, height } = gridSize(perSideOf(tier), w.beadSize, w.aspect)
  const long = Math.max(width, height)
  const img = await pixels(w.photo, long * samplesPerBead(long), w.trim, w.crop ?? null)
  const r = E.generatePattern(img, {
    palette: E.getPalette(PALETTE_ID),
    width,
    height,
    maxColors: 999,
    detail: 5,
    dithering: false,
    removeBackground: w.removeBg,
    pixelArt: look === 'pixel',
  })
  return { id: `p_${Date.now().toString(36)}_${tier}_${look}`, paletteId: PALETTE_ID, width, height, cells: r.cells }
}

export interface Option {
  key: string
  tier: TierId
  look: Look
  pattern: Pattern | null
}

/** The four results the customize page shows: 1 / 4 / 9 boards and the pixel-art one. */
export const optionKeys = (): { key: string; tier: TierId; look: Look }[] => [
  ...TIERS.map((t) => ({ key: `${t.id}-classic`, tier: t.id, look: 'classic' as Look })),
  { key: 'pixel', tier: PIXEL_TIER, look: 'pixel' as Look },
]

/** Fewest boards that keep the picture clear (same rule as the website: picture AND patterns must agree). */
export async function recommend(w: Work, plain: Pattern[]): Promise<{ perSide: number; subjectShare: number }> {
  if (!w.photo) return { perSide: 1, subjectShare: 1 }
  const pegs = BOARD_PEGS[w.beadSize]
  const img = await pixels(w.photo, pegs * TIERS.length * 2, w.trim, w.crop ?? null)
  const { losses, subjectShare } = E.recommendBoards(img, pegs, w.aspect, TIERS.length, 0)
  const labs = E.getPalette(PALETTE_ID).colors.map((c) => E.rgbToLab(c.rgb))
  const gridLosses = plain.slice(1).map((fine, i) => E.gridLoss(plain[i], fine, labs))
  return { perSide: E.chooseBoards(losses, gridLosses, TIERS.length), subjectShare }
}

/** Legend: colors used, most beads first, numbered from 1. */
export function legendOf(p: Pattern) {
  return E.countColors(p.cells).map((c, i) => ({ ...c, number: i + 1 }))
}

export const beadCount = (p: Pattern) => E.beadCount(p)
export const palette = () => E.getPalette(PALETTE_ID)
