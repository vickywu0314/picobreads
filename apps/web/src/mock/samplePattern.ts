import { getPalette, regularColorIndices, type Pattern, type Rgb } from '@picobreads/pattern-engine'

// PROTOTYPE ONLY: draws a procedural cat portrait instead of converting the
// user's photo. Replaced by the real Web Worker engine in milestone 1.

export interface SampleOptions {
  paletteId: string
  width: number
  height: number
  maxColors: number
  /** 1–5 */
  detail: number
  dithering: boolean
}

const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

const SKY = ['#BFE3F5', '#93C8EC', '#C7B6E6', '#F5C3D3', '#FBE4C0'].map(hex)
const INK = {
  orange: hex('#EE8A3A'),
  outline: hex('#3E2A20'),
  black: hex('#1E1E1E'),
  white: hex('#F7F7F2'),
  pink: hex('#E9849F'),
  lightOrange: hex('#F6B77A'),
  stripe: hex('#B5562B'),
  cheek: hex('#F4A9A0'),
}

function nearest(palette: ReturnType<typeof getPalette>, allowed: number[], rgb: Rgb): number {
  let best = allowed[0]
  let bestD = Infinity
  for (const i of allowed) {
    const c = palette.colors[i].rgb
    const d = (c[0] - rgb[0]) ** 2 * 0.3 + (c[1] - rgb[1]) ** 2 * 0.59 + (c[2] - rgb[2]) ** 2 * 0.11
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

const inEllipse = (u: number, v: number, cx: number, cy: number, rx: number, ry: number) =>
  ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1

function inTriangle(px: number, py: number, a: number[], b: number[], c: number[]) {
  const s = (p1: number[], p2: number[], p3: number[]) => (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
  const p = [px, py]
  const d1 = s(p, a, b)
  const d2 = s(p, b, c)
  const d3 = s(p, c, a)
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

export function generateSamplePattern(o: SampleOptions): Pattern {
  const palette = getPalette(o.paletteId)
  const allowed = regularColorIndices(palette)
  const { width: W, height: H } = o

  // Spend the color budget: a couple of sky bands first, then shading features, then more sky.
  let budget = Math.max(0, o.maxColors - 6)
  let bands = 1
  const take = () => (budget > 0 ? (budget--, true) : false)
  if (take()) bands++
  const useShade = take()
  const useStripes = take()
  const useCheeks = take()
  while (bands < SKY.length && take()) bands++

  // Cat lives in a centered square; background fills the rest.
  const S = Math.min(W, H)
  const offX = (W - S) / 2
  const offY = (H - S) / 2
  const line = Math.max(0.6 / S, 0.012)

  const kind = new Array<string>(W * H)
  const isCat = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const u = (x - offX + 0.5) / S
      const v = (y - offY + 0.5) / S
      const vy = (y + 0.5) / H

      // Sky bands, optionally dithered near boundaries.
      const f = vy * bands
      let band = Math.min(bands - 1, Math.floor(f))
      const frac = f - Math.floor(f)
      if (o.dithering && bands > 1) {
        if (frac > 0.8 && band < bands - 1 && (x + y) % 2 === 0) band++
        else if (frac < 0.2 && band > 0 && (x + y) % 2 === 1) band--
      }
      let k = `sky${band}`
      if (o.detail >= 4) {
        const sparkle = [
          [0.12, 0.12],
          [0.86, 0.2],
          [0.9, 0.85],
          [0.08, 0.78],
        ]
        if (sparkle.some(([sx, sy]) => Math.abs((x + 0.5) / W - sx) < 0.6 / W && Math.abs(vy - sy) < 0.6 / H)) k = 'white'
      }

      const earL = inTriangle(u, v, [0.2, 0.48], [0.25, 0.14], [0.45, 0.36])
      const earR = inTriangle(u, v, [0.8, 0.48], [0.75, 0.14], [0.55, 0.36])
      const head = inEllipse(u, v, 0.5, 0.6, 0.33, 0.28)
      if (earL || earR || head) {
        isCat[i] = 1
        k = 'orange'
        if (inTriangle(u, v, [0.26, 0.43], [0.28, 0.23], [0.4, 0.37]) || inTriangle(u, v, [0.74, 0.43], [0.72, 0.23], [0.6, 0.37]))
          k = 'pink'
        if (head && useShade && v > 0.74) k = 'lightOrange'
        if (head && useStripes && v > 0.33 && v < 0.45 && [0.44, 0.5, 0.56].some((sx) => Math.abs(u - sx) < line)) k = 'stripe'
        if (inEllipse(u, v, 0.5, 0.71, 0.12, 0.08)) k = 'white'
        if (useCheeks && (inEllipse(u, v, 0.31, 0.68, 0.055, 0.035) || inEllipse(u, v, 0.69, 0.68, 0.055, 0.035))) k = 'cheek'
        for (const ex of [0.38, 0.62]) {
          if (inEllipse(u, v, ex, 0.57, 0.05, 0.06)) k = 'black'
          if (o.detail >= 3 && S >= 40 && inEllipse(u, v, ex - 0.015, 0.55, 0.016, 0.018)) k = 'white'
        }
        if (inEllipse(u, v, 0.5, 0.665, 0.035, 0.022)) k = 'pink'
        for (const mx of [0.47, 0.53]) {
          const d = Math.hypot(u - mx, v - 0.69)
          if (v > 0.69 && Math.abs(d - 0.03) < line) k = 'outline'
        }
      }
      if (o.detail >= 3) {
        const whiskers = [
          [0.3, 0.7, 0.08, 0.66],
          [0.3, 0.73, 0.09, 0.76],
          [0.7, 0.7, 0.92, 0.66],
          [0.7, 0.73, 0.91, 0.76],
        ]
        if (whiskers.some(([ax, ay, bx, by]) => distToSegment(u, v, ax, ay, bx, by) < line * 0.9)) k = 'outline'
      }
      kind[i] = k
    }
  }

  // Outline the cat silhouette.
  if (o.detail >= 2) {
    const edge: number[] = []
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (!isCat[i]) continue
        const nb = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ]
        if (nb.some(([nx, ny]) => nx < 0 || ny < 0 || nx >= W || ny >= H || !isCat[ny * W + nx])) edge.push(i)
      }
    }
    for (const i of edge) kind[i] = 'outline'
  }

  const map = new Map<string, number>()
  const resolve = (k: string): number => {
    let idx = map.get(k)
    if (idx === undefined) {
      const rgb = k.startsWith('sky') ? SKY[Number(k.slice(3))] : INK[k as keyof typeof INK]
      idx = nearest(palette, allowed, rgb)
      map.set(k, idx)
    }
    return idx
  }

  return {
    id: `pat_${Math.random().toString(36).slice(2, 10)}`,
    paletteId: palette.id,
    width: W,
    height: H,
    cells: kind.map(resolve),
  }
}

/** An SVG "photo" for the "use a sample photo" button. */
export const SAMPLE_PHOTO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3f5"/><stop offset=".55" stop-color="#c7b6e6"/><stop offset="1" stop-color="#fbe4c0"/></linearGradient>
<radialGradient id="f" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#f6a24f"/><stop offset="1" stop-color="#d9702a"/></radialGradient></defs>
<rect width="800" height="800" fill="url(#s)"/>
<path d="M170 380 L200 110 L360 290Z M630 380 L600 110 L440 290Z" fill="url(#f)" stroke="#3e2a20" stroke-width="10"/>
<path d="M215 340 L225 180 L320 290Z M585 340 L575 180 L480 290Z" fill="#e9849f"/>
<ellipse cx="400" cy="480" rx="265" ry="225" fill="url(#f)" stroke="#3e2a20" stroke-width="10"/>
<ellipse cx="400" cy="570" rx="95" ry="65" fill="#f7f7f2"/>
<ellipse cx="305" cy="455" rx="40" ry="48" fill="#1e1e1e"/><ellipse cx="495" cy="455" rx="40" ry="48" fill="#1e1e1e"/>
<circle cx="292" cy="440" r="13" fill="#fff"/><circle cx="482" cy="440" r="13" fill="#fff"/>
<ellipse cx="400" cy="532" rx="28" ry="18" fill="#e9849f"/>
<path d="M376 552 q24 30 24 0 q0 30 24 0" fill="none" stroke="#3e2a20" stroke-width="7"/>
<ellipse cx="250" cy="545" rx="44" ry="28" fill="#f4a9a0" opacity=".8"/><ellipse cx="550" cy="545" rx="44" ry="28" fill="#f4a9a0" opacity=".8"/>
</svg>`)}`
