import { describe, expect, it } from 'vitest'
import { countColors, pickPacks, packTotal, PALETTES, regularColorIndices, splitSections, withAllowance } from '../src'

describe('splitSections', () => {
  it('splits 52×52 into 2×2 boards with smaller edges', () => {
    const s = splitSections(52, 52, 29)
    expect(s.map((x) => x.label)).toEqual(['A1', 'A2', 'B1', 'B2'])
    expect(s[3]).toMatchObject({ x: 29, y: 29, w: 23, h: 23 })
  })
  it('handles rectangles and exact multiples', () => {
    expect(splitSections(58, 29, 29).map((x) => [x.label, x.w, x.h])).toEqual([
      ['A1', 29, 29],
      ['A2', 29, 29],
    ])
    const tall = splitSections(29, 78, 29)
    expect(tall).toHaveLength(3)
    expect(tall[2]).toMatchObject({ label: 'C1', h: 20 })
  })
  it('covers every cell exactly once', () => {
    const s = splitSections(78, 52, 29)
    expect(s.reduce((n, x) => n + x.w * x.h, 0)).toBe(78 * 52)
  })
})

describe('countColors', () => {
  it('counts and sorts by usage', () => {
    expect(countColors([2, 1, 2, 3, 2, 1])).toEqual([
      { color: 2, count: 3 },
      { color: 1, count: 2 },
      { color: 3, count: 1 },
    ])
  })
})

describe('packs', () => {
  it('adds allowance rounding up', () => {
    expect(withAllowance(100, 0.1)).toBe(110)
    expect(withAllowance(7, 0.1)).toBe(8)
  })
  it('covers the need with least waste', () => {
    expect(pickPacks(640, [500, 100, 50])).toEqual([
      { size: 500, qty: 1 },
      { size: 100, qty: 1 },
      { size: 50, qty: 1 },
    ])
    expect(packTotal(pickPacks(640, [500, 100, 50]))).toBe(650)
    expect(pickPacks(20, [500, 100, 50])).toEqual([{ size: 50, qty: 1 }])
    expect(pickPacks(0, [500, 100, 50])).toEqual([])
  })
  it('prefers fewer bags when waste ties', () => {
    expect(pickPacks(200, [500, 100, 50])).toEqual([{ size: 100, qty: 2 }])
  })
})

describe('palettes', () => {
  it('have unique codes and valid rgb', () => {
    for (const p of PALETTES) {
      const codes = new Set(p.colors.map((c) => c.code))
      expect(codes.size).toBe(p.colors.length)
      for (const c of p.colors) expect(c.rgb.every((v) => v >= 0 && v <= 255)).toBe(true)
    }
  })
  it('exclude specialty finishes from regular colors', () => {
    const artkal = PALETTES.find((p) => p.id === 'artkal-s')!
    const regular = regularColorIndices(artkal).map((i) => artkal.colors[i].name)
    expect(regular.some((n) => /glow|glitter|transparent/i.test(n))).toBe(false)
  })
})
