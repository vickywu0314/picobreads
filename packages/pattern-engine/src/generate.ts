import { deltaE2000, linearRgbToLab, rgbToLab, srgbToLinear, type Lab } from './color'
import { regularColorIndices } from './palettes'
import type { Palette } from './types'

/** RGBA pixels, e.g. from canvas getImageData. */
export interface ImageInput {
  data: ArrayLike<number>
  width: number
  height: number
}

export interface GenerateOptions {
  palette: Palette
  /** Output grid size in beads. */
  width: number
  height: number
  /** Upper bound on distinct colors in the result (8–28 in the UI). */
  maxColors: number
  /** 1 (simple, smooth) … 5 (keeps fine detail). */
  detail: number
  /** Floyd–Steinberg error diffusion in Lab space. Off by default. */
  dithering: boolean
  /**
   * Colors used by fewer than this share of cells are merged into their nearest
   * neighbour. Defaults depend on `detail`.
   */
  minShare?: number
}

export interface GenerateResult {
  width: number
  height: number
  paletteId: string
  /** Palette index per cell, row-major. */
  cells: number[]
}

// Per detail level 1..5: smoothing (<0) / sharpening (>0), and the small-color merge threshold.
const SHARPEN = [-0.7, -0.35, 0, 0.45, 0.9]
const MIN_SHARE = [0.012, 0.007, 0.004, 0.002, 0.001]

/** Area-average the image into a width × height grid, in linear RGB (transparent → white). */
export function downsampleLinear(img: ImageInput, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height * 3)
  const lut = new Float32Array(256)
  for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i)
  const sx = img.width / width
  const sy = img.height / height
  for (let gy = 0; gy < height; gy++) {
    const y0 = Math.floor(gy * sy)
    const y1 = Math.max(y0 + 1, Math.floor((gy + 1) * sy))
    for (let gx = 0; gx < width; gx++) {
      const x0 = Math.floor(gx * sx)
      const x1 = Math.max(x0 + 1, Math.floor((gx + 1) * sx))
      let r = 0
      let g = 0
      let b = 0
      let n = 0
      for (let y = y0; y < y1 && y < img.height; y++) {
        for (let x = x0; x < x1 && x < img.width; x++) {
          const p = (y * img.width + x) * 4
          const a = img.data[p + 3] / 255
          r += lut[img.data[p]] * a + (1 - a)
          g += lut[img.data[p + 1]] * a + (1 - a)
          b += lut[img.data[p + 2]] * a + (1 - a)
          n++
        }
      }
      const o = (gy * width + gx) * 3
      out[o] = r / Math.max(1, n)
      out[o + 1] = g / Math.max(1, n)
      out[o + 2] = b / Math.max(1, n)
    }
  }
  return out
}

/** Blend with a 3×3 box blur: amount < 0 softens, amount > 0 sharpens (unsharp mask). */
export function adjustDetail(rgb: Float32Array, width: number, height: number, amount: number): Float32Array {
  if (amount === 0) return rgb
  const out = new Float32Array(rgb.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let n = 0
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= height) continue
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            if (xx < 0 || xx >= width) continue
            sum += rgb[(yy * width + xx) * 3 + c]
            n++
          }
        }
        const i = (y * width + x) * 3 + c
        const blur = sum / n
        const v = amount < 0 ? rgb[i] + (blur - rgb[i]) * -amount : rgb[i] + (rgb[i] - blur) * amount
        out[i] = Math.min(1, Math.max(0, v))
      }
    }
  }
  return out
}

/** Small deterministic PRNG so the same photo always gives the same pattern. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const dist2 = (a: Lab, b: Lab) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2

/** k-means in Lab (k-means++ init, Euclidean distance). Returns cluster centers. */
export function kmeansLab(points: Lab[], k: number, iterations = 12, seed = 1): Lab[] {
  if (points.length === 0) return []
  const rand = mulberry32(seed)
  k = Math.min(k, points.length)
  const centers: Lab[] = [points[Math.floor(rand() * points.length)].slice() as Lab]
  const d = new Float64Array(points.length).fill(Infinity)
  while (centers.length < k) {
    const last = centers[centers.length - 1]
    let total = 0
    for (let i = 0; i < points.length; i++) {
      d[i] = Math.min(d[i], dist2(points[i], last))
      total += d[i]
    }
    if (total === 0) break
    let r = rand() * total
    let pick = 0
    for (; pick < points.length - 1; pick++) {
      r -= d[pick]
      if (r <= 0) break
    }
    centers.push(points[pick].slice() as Lab)
  }
  const assign = new Int32Array(points.length)
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < points.length; i++) {
      let best = 0
      let bd = Infinity
      for (let c = 0; c < centers.length; c++) {
        const dd = dist2(points[i], centers[c])
        if (dd < bd) {
          bd = dd
          best = c
        }
      }
      assign[i] = best
    }
    const sums = centers.map(() => [0, 0, 0, 0])
    for (let i = 0; i < points.length; i++) {
      const s = sums[assign[i]]
      s[0] += points[i][0]
      s[1] += points[i][1]
      s[2] += points[i][2]
      s[3]++
    }
    sums.forEach((s, c) => {
      if (s[3]) centers[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]
    })
  }
  return centers
}

/** Nearest palette color (by CIEDE2000) among `candidates`. */
export function nearestColor(lab: Lab, candidates: number[], paletteLabs: Lab[]): number {
  let best = candidates[0]
  let bd = Infinity
  for (const c of candidates) {
    const d = deltaE2000(lab, paletteLabs[c])
    if (d < bd) {
      bd = d
      best = c
    }
  }
  return best
}

/**
 * Photo → bead pattern.
 * 1. Area-average into the grid (linear RGB), soften / sharpen by `detail`.
 * 2. Quantize in Lab with k-means, map each center to the nearest real bead color (CIEDE2000).
 * 3. Merge rarely used colors into their nearest neighbour until ≤ maxColors remain.
 * 4. Assign every cell to the nearest remaining bead color (optionally dithered).
 */
export function generatePattern(img: ImageInput, opts: GenerateOptions): GenerateResult {
  const { palette, width: W, height: H } = opts
  const detail = Math.min(5, Math.max(1, Math.round(opts.detail)))
  const maxColors = Math.max(1, Math.floor(opts.maxColors))
  const minShare = opts.minShare ?? MIN_SHARE[detail - 1]

  const rgb = adjustDetail(downsampleLinear(img, W, H), W, H, SHARPEN[detail - 1])
  const labs: Lab[] = new Array(W * H)
  for (let i = 0; i < W * H; i++) labs[i] = linearRgbToLab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2])

  const paletteLabs = palette.colors.map((c) => rgbToLab(c.rgb))
  const regular = regularColorIndices(palette)

  // Cache nearest lookups: many cells share (almost) the same color.
  const cache = new Map<string, number>()
  const nearestIn = (lab: Lab, set: number[], tag: string) => {
    const key = `${tag}|${Math.round(lab[0] * 2)},${Math.round(lab[1] * 2)},${Math.round(lab[2] * 2)}`
    let v = cache.get(key)
    if (v === undefined) {
      v = nearestColor(lab, set, paletteLabs)
      cache.set(key, v)
    }
    return v
  }

  // 2. Lab quantization → candidate bead colors.
  const k = Math.min(48, Math.max(maxColors + 4, Math.round(maxColors * 1.6)))
  const centers = kmeansLab(labs, k)
  let chosen = [...new Set(centers.map((c) => nearestColor(c, regular, paletteLabs)))]

  // 3. Merge: drop the least used color (its cells move to their nearest remaining color)
  //    while over the limit or while a color is used by too few cells.
  const minCount = Math.max(1, Math.round(W * H * minShare))
  let assign: number[] = []
  let version = 0
  for (;;) {
    const tag = `s${version}`
    assign = labs.map((l) => nearestIn(l, chosen, tag))
    if (chosen.length <= 1) break
    const counts = new Map<number, number>(chosen.map((c) => [c, 0]))
    for (const a of assign) counts.set(a, (counts.get(a) ?? 0) + 1)
    const used = chosen.filter((c) => (counts.get(c) ?? 0) > 0)
    let rarest = used[0]
    for (const c of used) if (counts.get(c)! < counts.get(rarest)!) rarest = c
    const overLimit = used.length > maxColors
    if (!overLimit && counts.get(rarest)! >= minCount && used.length === chosen.length) break
    chosen = overLimit || counts.get(rarest)! < minCount ? used.filter((c) => c !== rarest) : used
    version++
  }

  // 4. Final assignment (optionally dithered).
  if (opts.dithering && chosen.length > 1) {
    const err = labs.map((l) => l.slice() as Lab)
    const out = new Array<number>(W * H)
    for (let y = 0; y < H; y++) {
      const ltr = y % 2 === 0
      for (let s = 0; s < W; s++) {
        const x = ltr ? s : W - 1 - s
        const i = y * W + x
        const target = err[i]
        const c = nearestColor(target, chosen, paletteLabs)
        out[i] = c
        const p = paletteLabs[c]
        // Clamp error so saturated areas don't streak.
        const e = [0, 1, 2].map((j) => Math.max(-20, Math.min(20, target[j] - p[j])))
        const dir = ltr ? 1 : -1
        const spread = (dx: number, dy: number, w: number) => {
          const xx = x + dx * dir
          const yy = y + dy
          if (xx < 0 || xx >= W || yy >= H) return
          const t = err[yy * W + xx]
          t[0] += e[0] * w
          t[1] += e[1] * w
          t[2] += e[2] * w
        }
        spread(1, 0, 7 / 16)
        spread(-1, 1, 3 / 16)
        spread(0, 1, 5 / 16)
        spread(1, 1, 1 / 16)
      }
    }
    assign = out
  }

  return { width: W, height: H, paletteId: palette.id, cells: assign }
}
