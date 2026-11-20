import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { boardCount, gridSize, sizeCm } from '../miniprogram/utils/config'

// The mini program loads the engine from this bundle (built by `pnpm --filter miniprogram build`).
const E = createRequire(import.meta.url)('../miniprogram/lib/engine.js')

describe('bundled engine', () => {
  it('generates a pattern, a pixel-art one and a board recommendation like the website', () => {
    const w = 120
    const data = new Uint8ClampedArray(w * w * 4)
    for (let y = 0; y < w; y++)
      for (let x = 0; x < w; x++) {
        const inside = Math.hypot(x - 60, y - 60) < 40
        data.set(inside ? [220, 120 + (x % 7), 40, 255] : [255, 255, 255, 255], (y * w + x) * 4)
      }
    const img = { data, width: w, height: w }
    const palette = E.getPalette('mard-264')
    const opts = { palette, width: 52, height: 52, maxColors: 999, detail: 5, dithering: false, removeBackground: true }
    const plain = E.generatePattern(img, opts)
    const pixel = E.generatePattern(img, { ...opts, pixelArt: true })
    expect(plain.cells).toHaveLength(52 * 52)
    expect(plain.cells[0]).toBe(-1) // white backdrop removed
    expect(new Set(pixel.cells).size).toBeLessThanOrEqual(new Set(plain.cells).size)
    const advice = E.recommendBoards(img, 52, 1, 3, 0)
    expect(advice.losses.length).toBeGreaterThan(0)
    expect(E.chooseBoards(advice.losses, [0, 0], 3)).toBe(1)
  })
})

describe('sizes', () => {
  it('matches the website rules', () => {
    expect(gridSize(1, '2.6mm', 1)).toEqual({ width: 52, height: 52 })
    expect(gridSize(2, '2.6mm', 0.75)).toEqual({ width: 78, height: 104 })
    expect(gridSize(1, '5mm', 4 / 3)).toEqual({ width: 29, height: 22 })
    expect(sizeCm(52, 52, '2.6mm')).toBe('13.5 × 13.5')
    expect(boardCount(104, 104, '2.6mm')).toBe(1) // 27 cm board ≈ 104 pegs
    expect(boardCount(156, 156, '2.6mm')).toBe(4)
  })
})
