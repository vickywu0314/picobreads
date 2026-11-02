import { backdropOf, labGrid } from './background'
import { deltaE2000, type Lab } from './color'
import type { ImageInput } from './generate'

/**
 * How much of the picture is lost when it is beaded at `width × height` instead of twice
 * that resolution: the share of fine (2×) cells whose color is more than `deltaE` (CIE76 in Lab)
 * away from every coarse bead around it. Near 0 → the coarse grid already keeps everything the
 * image has (flat cartoons, small pixel art); larger → small features would vanish.
 * The share is taken over the subject only when the picture sits on a plain backdrop.
 */
export function detailLoss(img: ImageInput, width: number, height: number, deltaE = 10): number {
  return measure(img, width, height, deltaE).loss
}

function measure(img: ImageInput, width: number, height: number, deltaE: number): { loss: number; subject: number } {
  const fw = width * 2
  const fh = height * 2
  const fine = labGrid(img, fw, fh)
  const coarse = labGrid(img, width, height)
  const bg = backdropOf(fine, fw, fh, deltaE)
  let lost = 0
  let subject = 0
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const f = (y * fw + x) * 3
      if (!bg || Math.hypot(fine[f] - bg[0], fine[f + 1] - bg[1], fine[f + 2] - bg[2]) > deltaE) subject++
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
  // Measure against the subject, not the whole frame: a small toy on a big white backdrop
  // must not look "simple" just because most of the frame is empty.
  return { loss: lost / Math.max(subject, fw * fh * 0.15), subject: subject / (fw * fh) }
}

export interface BoardAdvice {
  /** Boards per side (1 → 1 board, 2 → 2×2, 3 → 3×3). */
  perSide: number
  /** detailLoss at each candidate, same order as the candidates. */
  losses: number[]
  /** Share of the frame taken by the subject (1 when there is no plain backdrop). */
  subjectShare: number
}

/**
 * Fewest pegboards that keep the picture clear. `board` is pegs per board side, `aspect` the
 * crop's width / height. Tries 1, 2, 3 … boards per side and stops at the first whose grid loses
 * less than `maxLoss` of the detail a grid twice as fine would show. A small simple picture stays
 * on one board; a detailed photo goes up to `maxPerSide`.
 */
export function recommendBoards(img: ImageInput, board: number, aspect: number, maxPerSide = 3, maxLoss = 0.05): BoardAdvice {
  const losses: number[] = []
  let subjectShare = 1
  for (let n = 1; n <= maxPerSide; n++) {
    const long = board * n
    const w = aspect >= 1 ? long : Math.max(1, Math.round(long * aspect))
    const h = aspect >= 1 ? Math.max(1, Math.round(long / aspect)) : long
    const m = measure(img, w, h, 10)
    if (n === 1) subjectShare = m.subject
    losses.push(m.loss)
    if (m.loss < maxLoss) return { perSide: n, losses, subjectShare }
  }
  return { perSide: maxPerSide, losses, subjectShare }
}

/** A bead grid: palette index per cell, row-major. */
export interface Grid {
  width: number
  height: number
  cells: ArrayLike<number>
}

/**
 * What a finished pattern loses against a finer pattern of the same picture: the share of the
 * fine pattern's subject beads whose color (within `deltaE`, CIEDE2000 — how different two beads look) appears nowhere in the 2 × 2
 * coarse beads nearest to the same spot. Both patterns come from the real generator, so outlines and
 * eyes it keeps on the small grid count as kept, and so do blends of two nearby coarse colors
 * (anti-aliased edges). The plain backdrop is left out of the share.
 */
export function gridLoss(coarse: Grid, fine: Grid, paletteLabs: Lab[], deltaE = 10): number {
  const memo = new Map<number, boolean>()
  const near = (a: number, b: number) => {
    if (a === b) return true
    const key = a < b ? a * 65536 + b : b * 65536 + a
    let v = memo.get(key)
    if (v === undefined) {
      v = deltaE2000(paletteLabs[a], paletteLabs[b]) <= deltaE
      memo.set(key, v)
    }
    return v
  }
  // Backdrop: the most common color on the fine grid's edge, if it covers most of the edge.
  const edge: number[] = []
  for (let x = 0; x < fine.width; x++) edge.push(fine.cells[x], fine.cells[(fine.height - 1) * fine.width + x])
  for (let y = 1; y < fine.height - 1; y++) edge.push(fine.cells[y * fine.width], fine.cells[y * fine.width + fine.width - 1])
  const freq = new Map<number, number>()
  for (const c of edge) if (c >= 0) freq.set(c, (freq.get(c) ?? 0) + 1)
  let bg = -1
  let best = 0
  for (const [c, n] of freq) if (n > best) [bg, best] = [c, n]
  const nearBg = bg < 0 ? 0 : edge.filter((c) => c >= 0 && near(c, bg)).length
  if (nearBg < edge.length * 0.6) bg = -1

  const sx = coarse.width / fine.width
  const sy = coarse.height / fine.height
  const lostAt = new Uint8Array(fine.width * fine.height)
  let subject = 0
  for (let y = 0; y < fine.height; y++) {
    // The 2 × 2 coarse beads nearest to this fine bead's center (an edge moves by at most half a bead).
    const cy0 = Math.max(0, Math.min(coarse.height - 2, Math.floor((y + 0.5) * sy - 0.5)))
    for (let x = 0; x < fine.width; x++) {
      const c = fine.cells[y * fine.width + x]
      if (c < 0 || (bg >= 0 && near(c, bg))) continue
      subject++
      const cx0 = Math.max(0, Math.min(coarse.width - 2, Math.floor((x + 0.5) * sx - 0.5)))
      const around: number[] = []
      for (let yy = cy0; yy <= Math.min(coarse.height - 1, cy0 + 1); yy++)
        for (let xx = cx0; xx <= Math.min(coarse.width - 1, cx0 + 1); xx++) {
          const k = coarse.cells[yy * coarse.width + xx]
          if (k >= 0 && !around.includes(k)) around.push(k)
        }
      let kept = around.some((k) => near(k, c))
      // A blend of two neighbouring colors (anti-aliased edge) is not new detail either.
      for (let i = 0; i < around.length && !kept; i++)
        for (let j = i + 1; j < around.length && !kept; j++) kept = segmentDistance(paletteLabs[c], paletteLabs[around[i]], paletteLabs[around[j]]) <= deltaE
      if (!kept) lostAt[y * fine.width + x] = 1
    }
  }
  // A lone lost bead counts half: an eye or a line usually spans several beads, while lone odd
  // beads are often compression / color noise.
  let lost = 0
  for (let i = 0; i < lostAt.length; i++) {
    if (!lostAt[i]) continue
    const x = i % fine.width
    if ((x > 0 && lostAt[i - 1]) || (x < fine.width - 1 && lostAt[i + 1]) || lostAt[i - fine.width] || lostAt[i + fine.width]) lost++
    else lost += 0.5
  }
  return lost / Math.max(subject, fine.width * fine.height * 0.15)
}

function segmentDistance(p: Lab, a: Lab, b: Lab): number {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const len2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / len2))
  return Math.hypot(p[0] - a[0] - t * ab[0], p[1] - a[1] - t * ab[1], p[2] - a[2] - t * ab[2])
}

/** Loss allowed before going from n to n + 1 boards per side (index n − 1). Bigger steps need more evidence. */
export const BOARD_STEP_LOSS = [0.05, 0.1]

/**
 * Fewest boards per side, preferring fewer: add boards only while BOTH the picture
 * (`imageLosses`, from recommendBoards / detailLoss) and the generated patterns (`gridLosses[i]`
 * = gridLoss of pattern i + 1 against pattern i + 2) say the smaller one loses detail.
 */
export function chooseBoards(imageLosses: number[], gridLosses: number[], maxPerSide: number, steps = BOARD_STEP_LOSS): number {
  let n = 1
  while (n < maxPerSide) {
    const limit = steps[Math.min(n - 1, steps.length - 1)]
    if (!(imageLosses[n - 1] > limit && gridLosses[n - 1] > limit)) break
    n++
  }
  return n
}
