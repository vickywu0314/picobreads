import { inflateSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { patternPng } from '../miniprogram/utils/png'

const pal = { colors: [{ rgb: [255, 0, 0] }, { rgb: [0, 128, 255] }, { rgb: [10, 20, 30] }] } as any

function chunks(png: Uint8Array) {
  expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const dv = new DataView(png.buffer, png.byteOffset)
  const out: Record<string, Uint8Array> = {}
  for (let o = 8; o < png.length; ) {
    const len = dv.getUint32(o)
    out[String.fromCharCode(...png.subarray(o + 4, o + 8))] = png.subarray(o + 8, o + 8 + len)
    o += 12 + len
  }
  return out
}

describe('patternPng', () => {
  it('encodes a valid indexed PNG with transparent empty cells', () => {
    const p = { id: 'x', paletteId: 'p', width: 3, height: 2, cells: [0, 1, -1, 2, 2, 0] }
    const c = chunks(patternPng(p, pal, 4))
    const dv = new DataView(c.IHDR.buffer, c.IHDR.byteOffset)
    expect([dv.getUint32(0), dv.getUint32(4), c.IHDR[8], c.IHDR[9]]).toEqual([12, 8, 8, 3])
    expect([...c.PLTE.subarray(3, 12)]).toEqual([255, 0, 0, 0, 128, 255, 10, 20, 30])
    expect([...c.tRNS]).toEqual([0])
    const raw = inflateSync(Buffer.from(c.IDAT)) // also checks the adler32
    expect(raw.length).toBe(8 * 13)
    expect([...raw.subarray(0, 13)]).toEqual([0, 1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0])
    expect([...raw.subarray(13 * 4, 13 * 5)]).toEqual([0, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1])
  })

  it('handles big pictures (several stored blocks)', () => {
    const w = 156
    const p = { id: 'x', paletteId: 'p', width: w, height: w, cells: Array.from({ length: w * w }, (_, i) => i % 3) }
    const c = chunks(patternPng(p, pal, 4))
    expect(inflateSync(Buffer.from(c.IDAT)).length).toBe(w * 4 * (w * 4 + 1))
  })
})
