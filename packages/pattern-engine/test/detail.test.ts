import { describe, expect, it } from 'vitest'
import { detailLoss, recommendBoards, type ImageInput } from '../src'

function image(w: number, h: number, paint: (x: number, y: number) => [number, number, number]): ImageInput {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, b] = paint(x, y)
      data.set([r, g, b, 255], (y * w + x) * 4)
    }
  return { data, width: w, height: h }
}

describe('recommendBoards', () => {
  it('keeps a simple flat picture on one board', () => {
    // A big yellow disc on white: only edges, nothing that a 64-peg board would lose.
    const img = image(512, 512, (x, y) => ((x - 256) ** 2 + (y - 256) ** 2 < 180 ** 2 ? [255, 214, 64] : [255, 255, 255]))
    expect(recommendBoards(img, 64, 1).perSide).toBe(1)
  })

  it('keeps small pixel art on one board even when the upload is large', () => {
    // 16 × 16 pixel art scaled up 32× — there is no more detail than 16 × 16.
    const img = image(512, 512, (x, y) => (((x >> 5) + (y >> 5)) % 3 === 0 ? [200, 30, 60] : [250, 250, 240]))
    expect(recommendBoards(img, 64, 1).perSide).toBe(1)
  })

  it('asks for more boards when small features would vanish on one', () => {
    // Small dark dots (like eyes, freckles, whiskers) smaller than one bead of a single board.
    const img = image(512, 512, (x, y) => (x % 16 < 5 && y % 16 < 5 ? [30, 30, 30] : [240, 200, 160]))
    const advice = recommendBoards(img, 64, 1)
    expect(advice.perSide).toBeGreaterThan(1)
    expect(advice.losses[0]).toBeGreaterThan(0.04)
  })

  it('reports zero loss for a uniform image', () => {
    expect(detailLoss(image(100, 100, () => [10, 120, 200]), 20, 20)).toBe(0)
  })
})
