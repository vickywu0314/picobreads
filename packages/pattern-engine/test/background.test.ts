import { describe, expect, it } from 'vitest'
import { EMPTY, beadCount, countColors, generatePattern, getPalette, removeBackdrop, rgbToLab, subjectBox, type ImageInput } from '../src'

function image(w: number, h: number, paint: (x: number, y: number) => [number, number, number]): ImageInput {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) data.set([...paint(x, y), 255], (y * w + x) * 4)
  return { data, width: w, height: h }
}

const palette = getPalette('mard-264')
const labs = palette.colors.map((c) => rgbToLab(c.rgb))

// A red ring with a white hole, on white: the hole touches no edge, so it must stay beads.
const ring = image(200, 200, (x, y) => {
  const r = Math.hypot(x - 100, y - 100)
  return r < 50 && r > 20 ? [210, 30, 40] : [255, 255, 255]
})

describe('removeBackdrop', () => {
  it('empties the backdrop but keeps same-colored areas inside the subject', () => {
    const p = generatePattern(ring, { palette, width: 40, height: 40, maxColors: 999, detail: 5, dithering: false, removeBackground: true })
    expect(p.cells[0]).toBe(EMPTY)
    expect(p.cells[20 * 40 + 20]).not.toBe(EMPTY) // white hole in the middle
    expect(p.cells[20 * 40 + 13]).not.toBe(EMPTY) // red ring
    expect(beadCount({ id: 'x', ...p })).toBeLessThan(40 * 40 / 2)
    expect(countColors(p.cells).every((c) => c.color >= 0)).toBe(true)
  })

  it('leaves full-frame pictures alone', () => {
    const cells = Array.from({ length: 100 }, (_, i) => (i % 3) + 5)
    expect(removeBackdrop(cells, 10, 10, labs)).toEqual(cells)
  })
})

describe('subjectBox', () => {
  it('finds a small subject on a plain backdrop, keeping the aspect ratio', () => {
    const img = image(400, 300, (x, y) => (x > 250 && x < 330 && y > 60 && y < 140 ? [40, 90, 200] : [250, 250, 250]))
    const box = subjectBox(img)!
    expect(box).not.toBeNull()
    expect(box.x).toBeLessThanOrEqual(251)
    expect(box.x + box.w).toBeGreaterThanOrEqual(329)
    expect(box.w / box.h).toBeCloseTo(400 / 300, 1)
    expect(box.w).toBeLessThan(200)
  })

  it('returns null when the subject fills the frame', () => {
    expect(subjectBox(image(200, 200, (x) => [x, 255 - x, 120]))).toBeNull()
  })
})
