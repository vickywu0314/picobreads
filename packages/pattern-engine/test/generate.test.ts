import { describe, expect, it } from 'vitest'
import { countColors, deltaE2000, despeckle, generatePattern, getPalette, looksLikeIllustration, rgbToLab, type ImageInput, type Lab } from '../src'

describe('deltaE2000', () => {
  // Reference pairs from Sharma, Wu & Dalal (2005).
  const pairs: [Lab, Lab, number][] = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[50, 2.5, 0], [61, -5, 29], 22.8977],
  ]
  it.each(pairs)('%j vs %j', (a, b, expected) => {
    expect(deltaE2000(a, b)).toBeCloseTo(expected, 3)
    expect(deltaE2000(b, a)).toBeCloseTo(expected, 3)
  })
  it('is zero for identical colors', () => {
    expect(deltaE2000([40, 10, -5], [40, 10, -5])).toBe(0)
  })
})

describe('rgbToLab', () => {
  it('maps white and black', () => {
    const w = rgbToLab([255, 255, 255])
    expect(w[0]).toBeCloseTo(100, 1)
    expect(Math.abs(w[1])).toBeLessThan(0.1)
    expect(rgbToLab([0, 0, 0])[0]).toBeCloseTo(0, 5)
  })
})

/** Synthetic RGBA image from a per-pixel color function. */
function image(width: number, height: number, fn: (x: number, y: number) => [number, number, number]): ImageInput {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fn(x, y)
      data.set([r, g, b, 255], (y * width + x) * 4)
    }
  return { data, width, height }
}

const perler = getPalette('perler')
const base = { palette: perler, width: 20, height: 20, maxColors: 16, detail: 3, dithering: false }

describe('generatePattern', () => {
  it('returns the requested grid size with valid palette indices', () => {
    const r = generatePattern(image(100, 60, () => [200, 50, 50]), { ...base, width: 29, height: 17 })
    expect(r.width).toBe(29)
    expect(r.height).toBe(17)
    expect(r.cells).toHaveLength(29 * 17)
    expect(r.cells.every((c) => c >= 0 && c < perler.colors.length)).toBe(true)
  })

  it('maps a solid color to its nearest bead color', () => {
    const r = generatePattern(image(40, 40, () => [235, 123, 49]), base) // Perler P04 Orange
    expect(new Set(r.cells).size).toBe(1)
    expect(perler.colors[r.cells[0]].code).toBe('P04')
  })

  it('keeps two distinct halves as two colors', () => {
    const r = generatePattern(image(40, 40, (x) => (x < 20 ? [20, 20, 20] : [250, 250, 250])), base)
    const used = countColors(r.cells)
    expect(used).toHaveLength(2)
    expect(r.cells[0]).not.toBe(r.cells[19])
  })

  it('never exceeds maxColors', () => {
    const rainbow = image(120, 120, (x, y) => [(x * 2) % 256, (y * 2) % 256, ((x + y) * 3) % 256])
    for (const maxColors of [8, 12, 20]) {
      const r = generatePattern(rainbow, { ...base, width: 40, height: 40, maxColors })
      expect(new Set(r.cells).size).toBeLessThanOrEqual(maxColors)
    }
  })

  it('merges a tiny speck of color into its surroundings', () => {
    const speck = image(40, 40, (x, y) => (x === 20 && y === 20 ? [0, 0, 255] : [240, 240, 240]))
    const r = generatePattern(speck, { ...base, detail: 1 })
    expect(new Set(r.cells).size).toBe(1)
  })

  it('never uses specialty beads', () => {
    const artkal = getPalette('artkal-s')
    const r = generatePattern(image(60, 60, (x, y) => [x * 4, y * 4, 128]), { ...base, palette: artkal })
    expect(r.cells.every((c) => !artkal.colors[c].specialty)).toBe(true)
  })

  it('is deterministic and supports dithering', () => {
    const grad = image(80, 80, (x) => [x * 3, x * 3, x * 3])
    const a = generatePattern(grad, { ...base, maxColors: 8, dithering: true })
    const b = generatePattern(grad, { ...base, maxColors: 8, dithering: true })
    expect(a.cells).toEqual(b.cells)
    expect(new Set(a.cells).size).toBeLessThanOrEqual(8)
  })
})

describe('illustration style', () => {
  // Flat background with a 3px dark outline: much thinner than one bead (each bead = 8px here).
  const lineArt = image(160, 160, (x, y) => (Math.abs(x - 80) <= 1 || Math.abs(y - 80) <= 1 ? [30, 25, 25] : [240, 225, 200]))

  it('is detected automatically for flat artwork, not for noisy photos', () => {
    expect(looksLikeIllustration(lineArt)).toBe(true)
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 60
    const photo = image(160, 160, (x, y) => [100 + x / 2 + rnd(), 120 + y / 3 + rnd(), 90 + rnd()])
    expect(looksLikeIllustration(photo)).toBe(false)
  })

  it('keeps thin dark outlines that averaging would wash out', () => {
    const opts = { ...base, maxColors: 8, detail: 4 }
    const illus = generatePattern(lineArt, { ...opts, style: 'illustration' })
    const dark = (cells: number[]) => cells.filter((c) => rgbToLab(perler.colors[c].rgb)[0] < 35).length
    expect(dark(illus.cells)).toBeGreaterThanOrEqual(36) // the cross is ~39 beads long
    const photo = generatePattern(lineArt, { ...opts, style: 'photo' })
    expect(dark(photo.cells)).toBeLessThan(dark(illus.cells))
  })
})

describe('despeckle', () => {
  it('removes isolated single beads but keeps lines', () => {
    const cells = [1, 1, 1, 1, 2, 1, 1, 1, 1]
    expect(despeckle(cells, 3, 3)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1])
    const line = [1, 2, 1, 1, 2, 1, 1, 2, 1]
    expect(despeckle(line, 3, 3)).toEqual(line)
  })
})

describe('auto style', () => {
  it('treats a smooth sunset with a dark silhouette as a photo', () => {
    const sunset = image(200, 150, (x, y) => {
      const t = y / 150
      const sky: [number, number, number] = [Math.round(60 + 190 * t), Math.round(90 + 60 * t), Math.round(200 - 150 * t)]
      // silhouette: a solid dark figure, no thin outlines
      return (x - 100) ** 2 / 400 + (y - 110) ** 2 / 1600 < 1 ? [15, 12, 12] : sky
    })
    expect(looksLikeIllustration(sunset)).toBe(false)
  })
})

describe('many colors', () => {
  it('can use far more than 28 colors when asked', () => {
    const rainbow = image(240, 240, (x, y) => [(x * 3) % 256, (y * 3) % 256, ((x + y) * 2) % 256])
    const r = generatePattern(rainbow, { ...base, palette: getPalette('mard-221'), width: 60, height: 60, maxColors: 120, detail: 5, style: 'photo' })
    const n = new Set(r.cells).size
    expect(n).toBeGreaterThan(40)
    expect(n).toBeLessThanOrEqual(120)
  })
})
