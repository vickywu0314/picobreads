import { deltaE2000, linearRgbToLab, type Lab } from './color'
import { downsampleLinear, type ImageInput } from './generate'

/** A cell with no bead (removed backdrop). Renderers draw the bare board, counts skip it. */
export const EMPTY = -1

/**
 * The plain backdrop color of a Lab grid, if it has one: at least 60 % of the outer edge within
 * `tol` (CIE76) of the edge's median color. Null for pictures that fill the frame.
 */
export function backdropOf(lab: Float32Array, w: number, h: number, tol = 10): Lab | null {
  const edge: number[] = []
  for (let x = 0; x < w; x++) edge.push(x, (h - 1) * w + x)
  for (let y = 1; y < h - 1; y++) edge.push(y * w, y * w + w - 1)
  const median = (k: number) => {
    const v = edge.map((i) => lab[i * 3 + k]).sort((a, b) => a - b)
    return v[v.length >> 1]
  }
  const bg: Lab = [median(0), median(1), median(2)]
  const near = edge.filter((i) => Math.hypot(lab[i * 3] - bg[0], lab[i * 3 + 1] - bg[1], lab[i * 3 + 2] - bg[2]) <= tol).length
  return near >= edge.length * 0.6 ? bg : null
}

/** Area-averaged Lab grid of the image. */
export function labGrid(img: ImageInput, width: number, height: number): Float32Array {
  const rgb = downsampleLinear(img, width, height)
  const out = new Float32Array(rgb.length)
  for (let i = 0; i < rgb.length; i += 3) {
    const [L, a, b] = linearRgbToLab(rgb[i], rgb[i + 1], rgb[i + 2])
    out[i] = L
    out[i + 1] = a
    out[i + 2] = b
  }
  return out
}

/** Flood fill from the edge over cells that pass `isBg`; 1 = backdrop. */
function floodFromEdge(width: number, height: number, isBg: (i: number) => boolean): Uint8Array {
  const mask = new Uint8Array(width * height)
  const queue: number[] = []
  const push = (i: number) => {
    if (!mask[i] && isBg(i)) {
      mask[i] = 1
      queue.push(i)
    }
  }
  for (let x = 0; x < width; x++) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    push(y * width)
    push(y * width + width - 1)
  }
  while (queue.length) {
    const i = queue.pop()!
    const x = i % width
    if (x > 0) push(i - 1)
    if (x < width - 1) push(i + 1)
    if (i >= width) push(i - width)
    if (i < (height - 1) * width) push(i + width)
  }
  return mask
}

/**
 * Remove the plain backdrop from a finished bead grid: the most common bead color on the edge
 * (if it covers most of the edge) and every bead of (almost) that color connected to the edge
 * become EMPTY. Same-colored areas inside the subject (white eyes, a white belly) are kept,
 * because they don't touch the edge. Returns the cells unchanged when there is no plain backdrop.
 */
export function removeBackdrop(cells: number[], width: number, height: number, paletteLabs: Lab[], tol = 6): number[] {
  const edge: number[] = []
  for (let x = 0; x < width; x++) edge.push(cells[x], cells[(height - 1) * width + x])
  for (let y = 1; y < height - 1; y++) edge.push(cells[y * width], cells[y * width + width - 1])
  const freq = new Map<number, number>()
  for (const c of edge) if (c >= 0) freq.set(c, (freq.get(c) ?? 0) + 1)
  let bg = -1
  let best = 0
  for (const [c, n] of freq) if (n > best) [bg, best] = [c, n]
  if (bg < 0) return cells
  const memo = new Map<number, boolean>()
  const near = (c: number) => {
    if (c === bg) return true
    if (c < 0) return false
    let v = memo.get(c)
    if (v === undefined) {
      v = deltaE2000(paletteLabs[c], paletteLabs[bg]) <= tol
      memo.set(c, v)
    }
    return v
  }
  if (edge.filter(near).length < edge.length * 0.6) return cells
  const mask = floodFromEdge(width, height, (i) => near(cells[i]))
  return cells.map((c, i) => (mask[i] ? EMPTY : c))
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Where the subject is, for trimming empty margins: the bounding box of everything that isn't
 * plain backdrop, padded by `pad` (share of the box's long side), then grown to the image's own
 * aspect ratio so the pattern size stays the same. Null when there is no plain backdrop or the
 * subject already fills (almost) the whole frame.
 */
export function subjectBox(img: ImageInput, pad = 0.05): Box | null {
  const long = 128
  const gw = img.width >= img.height ? long : Math.max(1, Math.round((long * img.width) / img.height))
  const gh = img.width >= img.height ? Math.max(1, Math.round((long * img.height) / img.width)) : long
  const lab = labGrid(img, gw, gh)
  const bg = backdropOf(lab, gw, gh)
  if (!bg) return null
  const mask = floodFromEdge(gw, gh, (i) => Math.hypot(lab[i * 3] - bg[0], lab[i * 3 + 1] - bg[1], lab[i * 3 + 2] - bg[2]) <= 10)
  let x0 = gw
  let y0 = gh
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++)
      if (!mask[y * gw + x]) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  if (x1 < 0) return null
  // Grid cells → image pixels.
  const sx = img.width / gw
  const sy = img.height / gh
  let bx = x0 * sx
  let by = y0 * sy
  let bw = (x1 + 1) * sx - bx
  let bh = (y1 + 1) * sy - by
  const p = pad * Math.max(bw, bh)
  bx -= p
  by -= p
  bw += 2 * p
  bh += 2 * p
  // Grow to the image's aspect ratio around the subject's center.
  const aspect = img.width / img.height
  if (bw / bh < aspect) {
    const nw = bh * aspect
    bx -= (nw - bw) / 2
    bw = nw
  } else {
    const nh = bw / aspect
    by -= (nh - bh) / 2
    bh = nh
  }
  if (bw >= img.width * 0.92 || bh >= img.height * 0.92) return null
  // Keep inside the image (shift, never shrink).
  bx = Math.min(Math.max(0, bx), img.width - bw)
  by = Math.min(Math.max(0, by), img.height - bh)
  return { x: Math.round(bx), y: Math.round(by), w: Math.round(bw), h: Math.round(bh) }
}
