import { linearRgbToLab } from './color'
import { downsampleLinear, type ImageInput } from './generate'

/**
 * How much of the picture is lost when it is beaded at `width × height` instead of twice
 * that resolution: the share of fine (2×) cells whose color is more than `deltaE` (CIE76 in Lab)
 * away from every coarse bead around it. Near 0 → the coarse grid already keeps everything the
 * image has (flat cartoons, small pixel art); larger → small features would vanish.
 */
export function detailLoss(img: ImageInput, width: number, height: number, deltaE = 10): number {
  const fw = width * 2
  const fh = height * 2
  const fine = toLab(downsampleLinear(img, fw, fh))
  const coarse = toLab(downsampleLinear(img, width, height))
  let lost = 0
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const f = (y * fw + x) * 3
      // An edge only moves by half a bead, so its color still exists in a neighbouring bead.
      // Lost detail (an eye, a thin line, a highlight) matches none of the 3 × 3 coarse beads around it.
      const cx = x >> 1
      const cy = y >> 1
      let best = Infinity
      for (let dy = -1; dy <= 1 && best > deltaE; dy++) {
        const yy = cy + dy
        if (yy < 0 || yy >= height) continue
        for (let dx = -1; dx <= 1; dx++) {
          const xx = cx + dx
          if (xx < 0 || xx >= width) continue
          const c = (yy * width + xx) * 3
          const d = Math.hypot(fine[f] - coarse[c], fine[f + 1] - coarse[c + 1], fine[f + 2] - coarse[c + 2])
          if (d < best) best = d
        }
      }
      if (best > deltaE) lost++
    }
  }
  return lost / (fw * fh)
}

function toLab(rgb: Float32Array): Float32Array {
  const out = new Float32Array(rgb.length)
  for (let i = 0; i < rgb.length; i += 3) {
    const [L, a, b] = linearRgbToLab(rgb[i], rgb[i + 1], rgb[i + 2])
    out[i] = L
    out[i + 1] = a
    out[i + 2] = b
  }
  return out
}

export interface BoardAdvice {
  /** Boards per side (1 → 1 board, 2 → 2×2, 3 → 3×3). */
  perSide: number
  /** detailLoss at each candidate, same order as the candidates. */
  losses: number[]
}

/**
 * Fewest pegboards that keep the picture clear. `board` is pegs per board side, `aspect` the
 * crop's width / height. Tries 1, 2, 3 … boards per side and stops at the first whose grid loses
 * less than `maxLoss` of the detail a grid twice as fine would show. A small simple picture stays
 * on one board; a detailed photo goes up to `maxPerSide`.
 */
export function recommendBoards(img: ImageInput, board: number, aspect: number, maxPerSide = 3, maxLoss = 0.04): BoardAdvice {
  const losses: number[] = []
  for (let n = 1; n <= maxPerSide; n++) {
    const long = board * n
    const w = aspect >= 1 ? long : Math.max(1, Math.round(long * aspect))
    const h = aspect >= 1 ? Math.max(1, Math.round(long / aspect)) : long
    const loss = detailLoss(img, w, h)
    losses.push(loss)
    if (loss < maxLoss) return { perSide: n, losses }
  }
  return { perSide: maxPerSide, losses }
}
