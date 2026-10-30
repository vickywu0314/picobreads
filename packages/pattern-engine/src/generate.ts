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
   * illustration: flat colors + outlines (cartoons, logos) → per-bead majority vote.
   * photo: smooth gradients → per-bead average. auto (default) picks by looking at the image.
   */
  style?: 'auto' | 'illustration' | 'photo'
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
// Illustration mode: extra vote weight for pixels darker than the bead's median (outlines, eyes).
const LINE_BOOST = [0, 0.8, 1.6, 2.6, 4]
// Remove isolated single beads at these detail levels.
const DESPECKLE_MAX_DETAIL = 3

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

/** Source pixels → Lab (alpha composited on white). */
function imageLab(img: ImageInput): Float32Array {
  const lut = new Float32Array(256)
  for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i)
  const n = img.width * img.height
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const a = img.data[i * 4 + 3] / 255
    const lab = linearRgbToLab(
      lut[img.data[i * 4]] * a + (1 - a),
      lut[img.data[i * 4 + 1]] * a + (1 - a),
      lut[img.data[i * 4 + 2]] * a + (1 - a),
    )
    out[i * 3] = lab[0]
    out[i * 3 + 1] = lab[1]
    out[i * 3 + 2] = lab[2]
  }
  return out
}

/**
 * Heuristic for "auto" style. Illustrations (cartoons, drawings, logos) have thin
 * dark outlines, or very few distinct colors. Photos — including smooth skies and
 * sunsets, which are also "flat" pixel to pixel — have neither.
 */
export function looksLikeIllustration(img: ImageInput): boolean {
  // Work on a ~200px nearest-neighbour sample; plenty for these statistics.
  const step = Math.max(1, Math.floor(Math.max(img.width, img.height) / 200))
  const w = Math.floor(img.width / step)
  const h = Math.floor(img.height / step)
  const lab = imageLab(img)
  const L = new Float32Array(w * h)
  const bins = new Map<number, number>()
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * step * img.width + x * step) * 3
      L[y * w + x] = lab[p]
      const key = (Math.floor(lab[p] / 6) * 64 + Math.floor(lab[p + 1] / 6) + 32) * 64 + Math.floor(lab[p + 2] / 6) + 32
      bins.set(key, (bins.get(key) ?? 0) + 1)
    }
  }
  // 1. Thin dark lines: darker by 20+ than the pixels 3 steps away on both sides.
  const D = 3
  let lines = 0
  let total = 0
  for (let y = D; y < h - D; y++) {
    for (let x = D; x < w - D; x++) {
      const v = L[y * w + x]
      const horiz = v < L[y * w + x - D] - 20 && v < L[y * w + x + D] - 20
      const vert = v < L[(y - D) * w + x] - 20 && v < L[(y + D) * w + x] - 20
      if (horiz || vert) lines++
      total++
    }
  }
  if (lines / Math.max(1, total) >= 0.015) return true
  // 2. Few colors: a handful of color bins cover most of the image.
  const counts = [...bins.values()].sort((a, b) => b - a)
  let covered = 0
  for (let k = 0; k < Math.min(12, counts.length); k++) covered += counts[k]
  return covered / (w * h) >= 0.8
}

/** Replace beads that match none of their 4 neighbours when ≥3 neighbours agree. */
export function despeckle(cells: number[], width: number, height: number): number[] {
  const out = cells.slice()
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const nb: number[] = []
      if (x > 0) nb.push(cells[i - 1])
      if (x < width - 1) nb.push(cells[i + 1])
      if (y > 0) nb.push(cells[i - width])
      if (y < height - 1) nb.push(cells[i + width])
      if (nb.includes(cells[i])) continue
      const counts = new Map<number, number>()
      for (const c of nb) counts.set(c, (counts.get(c) ?? 0) + 1)
      for (const [c, n] of counts) if (n >= 3 || (n >= 2 && nb.length === 2)) out[i] = c
    }
  }
  return out
}

/** Pick ≤ maxColors bead colors: k-means centers → nearest bead colors → merge rare ones. */
function chooseColors(
  points: Lab[],
  weights: (chosen: number[]) => Map<number, number>,
  regular: number[],
  paletteLabs: Lab[],
  maxColors: number,
  minCount: number,
): number[] {
  const k = Math.min(256, Math.max(maxColors + 4, Math.round(maxColors * 1.6)))
  let chosen = [...new Set(kmeansLab(points, k).map((c) => nearestColor(c, regular, paletteLabs)))]
  for (;;) {
    if (chosen.length <= 1) return chosen
    const counts = weights(chosen)
    const used = chosen.filter((c) => (counts.get(c) ?? 0) > 0).sort((a, b) => counts.get(a)! - counts.get(b)!)
    const rare = used.filter((c) => counts.get(c)! < minCount)
    const over = used.length - maxColors
    if (over <= 0 && rare.length === 0 && used.length === chosen.length) return chosen
    // Remove the rarest colors; when far over the limit, a third of the excess per round
    // (their pixels move to the nearest remaining color on the next pass).
    const drop = Math.max(rare.length ? 1 : 0, over > 0 ? Math.max(1, Math.ceil(over / 3)) : 0)
    chosen = used.slice(Math.min(drop, used.length - 1))
  }
}

/**
 * Photo → bead pattern.
 *
 * Photo style: area-average each bead (linear RGB), soften / sharpen by `detail`,
 * then nearest bead color, optionally dithered.
 *
 * Illustration style: quantize the full-resolution pixels to bead colors first,
 * then each bead takes the majority color of its pixels (dark line pixels get
 * extra votes), so outlines stay crisp and no muddy in-between colors appear.
 *
 * Both: Lab k-means → nearest real bead colors (CIEDE2000) → merge rarely used
 * colors until ≤ maxColors → (detail ≤ 3) remove isolated specks.
 */
export function generatePattern(img: ImageInput, opts: GenerateOptions): GenerateResult {
  const { palette, width: W, height: H } = opts
  const detail = Math.min(5, Math.max(1, Math.round(opts.detail)))
  const maxColors = Math.max(1, Math.floor(opts.maxColors))
  // Asking for many colors means "keep subtle shades": relax the rare-color threshold accordingly.
  const share = opts.minShare ?? MIN_SHARE[detail - 1] * Math.min(1, 28 / maxColors)
  const minCount = Math.max(1, Math.round(W * H * share))
  const style = opts.style && opts.style !== 'auto' ? opts.style : looksLikeIllustration(img) ? 'illustration' : 'photo'

  const paletteLabs = palette.colors.map((c) => rgbToLab(c.rgb))
  const regular = regularColorIndices(palette)
  const cache = new Map<string, number>()
  const nearestCached = (lab: Lab, set: number[], tag: string) => {
    const key = `${tag}|${Math.round(lab[0] * 2)},${Math.round(lab[1] * 2)},${Math.round(lab[2] * 2)}`
    let v = cache.get(key)
    if (v === undefined) {
      v = nearestColor(lab, set, paletteLabs)
      cache.set(key, v)
    }
    return v
  }

  let cells: number[]

  if (style === 'illustration') {
    const src = imageLab(img)
    const n = img.width * img.height
    const px = (i: number): Lab => [src[i * 3], src[i * 3 + 1], src[i * 3 + 2]]
    // Which bead each source pixel belongs to.
    const owner = new Int32Array(n)
    const sx = W / img.width
    const sy = H / img.height
    for (let y = 0; y < img.height; y++) {
      const gy = Math.min(H - 1, Math.floor(y * sy))
      for (let x = 0; x < img.width; x++) owner[y * img.width + x] = gy * W + Math.min(W - 1, Math.floor(x * sx))
    }
    // Vote weight: darker than the bead's median lightness → likely a line / eye.
    const boost = LINE_BOOST[detail - 1]
    const lightness: number[][] = Array.from({ length: W * H }, () => [])
    for (let i = 0; i < n; i++) lightness[owner[i]].push(src[i * 3])
    const median = lightness.map((ls) => {
      ls.sort((a, b) => a - b)
      return ls.length ? ls[ls.length >> 1] : 50
    })
    const weight = new Float32Array(n)
    for (let i = 0; i < n; i++) weight[i] = 1 + boost * Math.max(0, Math.min(1.5, (median[owner[i]] - src[i * 3]) / 25))

    // Pixels with (almost) the same color share one nearest-color lookup.
    const keyIndex = new Map<number, number>()
    const uniq: Lab[] = []
    const pixU = new Int32Array(n)
    for (let i = 0; i < n; i++) {
      const key = (Math.round(src[i * 3] * 2) * 513 + Math.round(src[i * 3 + 1] * 2) + 256) * 513 + Math.round(src[i * 3 + 2] * 2) + 256
      let u = keyIndex.get(key)
      if (u === undefined) {
        u = uniq.length
        keyIndex.set(key, u)
        uniq.push(px(i))
      }
      pixU[i] = u
    }

    const vote = (set: number[]) => {
      const nearestU = new Int32Array(uniq.length)
      for (let u = 0; u < uniq.length; u++) {
        let best = 0
        let bd = Infinity
        for (let j = 0; j < set.length; j++) {
          const d = dist2(uniq[u], paletteLabs[set[j]])
          if (d < bd) {
            bd = d
            best = j
          }
        }
        nearestU[u] = best
      }
      const k = set.length
      const tally = new Float32Array(W * H * k)
      for (let i = 0; i < n; i++) tally[owner[i] * k + nearestU[pixU[i]]] += weight[i]
      const out = new Array<number>(W * H)
      for (let c = 0; c < W * H; c++) {
        let best = 0
        for (let j = 1; j < k; j++) if (tally[c * k + j] > tally[c * k + best]) best = j
        out[c] = set[best]
      }
      return out
    }

    // k-means on a sample of pixels.
    const sample: Lab[] = []
    const stride = Math.max(1, Math.floor(n / 8000))
    for (let i = 0; i < n; i += stride) sample.push(px(i))
    const chosen = chooseColors(
      sample,
      (set) => {
        const counts = new Map<number, number>()
        for (const c of vote(set)) counts.set(c, (counts.get(c) ?? 0) + 1)
        return counts
      },
      regular,
      paletteLabs,
      maxColors,
      minCount,
    )
    cells = vote(chosen)
  } else {
    const rgb = adjustDetail(downsampleLinear(img, W, H), W, H, SHARPEN[detail - 1])
    const labs: Lab[] = new Array(W * H)
    for (let i = 0; i < W * H; i++) labs[i] = linearRgbToLab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2])
    let version = 0
    const chosen = chooseColors(
      labs,
      (set) => {
        const tag = `p${version++}`
        const counts = new Map<number, number>()
        for (const l of labs) {
          const c = nearestCached(l, set, tag)
          counts.set(c, (counts.get(c) ?? 0) + 1)
        }
        return counts
      },
      regular,
      paletteLabs,
      maxColors,
      minCount,
    )
    if (opts.dithering && chosen.length > 1) cells = ditherLab(labs, W, H, chosen, paletteLabs)
    else cells = labs.map((l) => nearestCached(l, chosen, 'final'))
  }

  if (detail <= DESPECKLE_MAX_DETAIL && !opts.dithering) cells = despeckle(cells, W, H)
  return { width: W, height: H, paletteId: palette.id, cells }
}

/** Serpentine Floyd–Steinberg in Lab, error clamped so saturated areas don't streak. */
function ditherLab(labs: Lab[], W: number, H: number, chosen: number[], paletteLabs: Lab[]): number[] {
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
  return out
}
