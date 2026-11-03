import { describe, expect, it } from 'vitest'
import { EMPTY, PIXEL_ART, countColors, generatePattern, getPalette, mergeSmallRegions, rgbToLab, type ImageInput } from '../src'

const palette = getPalette('mard-264')
const labs = palette.colors.map((c) => rgbToLab(c.rgb))
/** Palette index closest to an RGB color. */
const idx = (rgb: [number, number, number]) => {
  const l = rgbToLab(rgb)
  let best = 0
  let bd = Infinity
  labs.forEach((c, i) => {
    const d = (c[0] - l[0]) ** 2 + (c[1] - l[1]) ** 2 + (c[2] - l[2]) ** 2
    if (d < bd) {
      bd = d
      best = i
    }
  })
  return best
}

const RED = idx([200, 30, 40])
const RED2 = idx([215, 50, 55]) // a slightly different red: a "碎色"
const BLACK = idx([20, 20, 20])

function grid(w: number, h: number, fill: number) {
  return Array.from({ length: w * h }, () => fill)
}

describe('mergeSmallRegions', () => {
  it('merges low-contrast fragments into their surroundings', () => {
    expect(RED2).not.toBe(RED)
    const cells = grid(8, 8, RED)
    cells[3 * 8 + 3] = RED2
    cells[3 * 8 + 4] = RED2
    expect(mergeSmallRegions(cells, 8, 8, labs)).toEqual(grid(8, 8, RED))
  })

  it('keeps small high-contrast features (an eye) and thin lines', () => {
    const cells = grid(10, 10, RED)
    cells[2 * 10 + 2] = BLACK // one-bead eye
    for (let x = 0; x < 10; x++) cells[7 * 10 + x] = BLACK // one-bead-wide outline
    expect(mergeSmallRegions(cells, 10, 10, labs)).toEqual(cells)
  })

  it('leaves empty cells alone and never fills with them', () => {
    const cells = grid(6, 6, EMPTY)
    cells[14] = RED2
    for (const i of [8, 9, 10, 13, 15, 19, 20, 21]) cells[i] = RED
    const out = mergeSmallRegions(cells, 6, 6, labs)
    expect(out[14]).toBe(RED)
    expect(out.filter((c) => c === EMPTY).length).toBe(cells.filter((c) => c === EMPTY).length)
  })
})

describe('generatePattern pixelArt', () => {
  // A smooth photo-like gradient with noise: lots of colors in the plain pattern.
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const w = 208
  const data = new Uint8ClampedArray(w * w * 4)
  for (let y = 0; y < w; y++)
    for (let x = 0; x < w; x++) {
      const n = (rand() - 0.5) * 40
      data.set([(x / w) * 255 + n, (y / w) * 200 + n, 120 + n, 255], (y * w + x) * 4)
    }
  const img: ImageInput = { data, width: w, height: w }

  it('uses the same grid, far fewer colors and fewer stray beads', () => {
    const base = { palette, width: 52, height: 52, maxColors: 999, detail: 5, dithering: false }
    const plain = generatePattern(img, base)
    const pixel = generatePattern(img, { ...base, pixelArt: true })
    expect(pixel.width).toBe(52)
    expect(pixel.height).toBe(52)
    const colors = countColors(pixel.cells).length
    expect(colors).toBeLessThanOrEqual(PIXEL_ART.maxColors)
    expect(colors).toBeLessThan(countColors(plain.cells).length)
    // Stray beads: cells that differ from all 4 neighbours.
    const strays = (cells: number[]) =>
      cells.filter((c, i) => {
        const x = i % 52
        const nb = [x > 0 ? cells[i - 1] : c, x < 51 ? cells[i + 1] : c, cells[i - 52] ?? c, cells[i + 52] ?? c]
        return nb.every((v) => v !== c)
      }).length
    expect(strays(pixel.cells)).toBeLessThan(strays(plain.cells))
  })
})
