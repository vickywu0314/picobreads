import type { Palette, Pattern } from '../lib/engine'

// Pattern → PNG file, without a <canvas>. Canvases in a mini program page can end up drawn in the
// wrong place after navigating back, so every static picture (result cards, previews, thumbnails)
// is a plain <image> of a PNG we encode here: palette-indexed, empty cells transparent.

let crcTable: Uint32Array | null = null
function crc32(bytes: Uint8Array, start: number, end: number) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (let i = start; i < end; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** PNG bytes of a pattern, each cell `scale` × `scale` pixels. */
export function patternPng(p: Pattern, pal: Palette, scale: number): Uint8Array {
  const W = p.width * scale
  const H = p.height * scale
  // Local palette: index 0 = transparent (empty cells), then the colors used.
  const local = new Map<number, number>()
  const colors: number[][] = [[0, 0, 0]]
  for (const c of p.cells) {
    if (c >= 0 && !local.has(c)) {
      local.set(c, colors.length)
      colors.push(pal.colors[c].rgb as number[])
    }
  }
  const indexed = colors.length <= 256
  const bpp = indexed ? 1 : 4
  // Raw image data: every row starts with filter byte 0.
  const rowLen = 1 + W * bpp
  const raw = new Uint8Array(rowLen * H)
  for (let y = 0; y < p.height; y++) {
    const first = y * scale * rowLen
    let o = first + 1
    for (let x = 0; x < p.width; x++) {
      const c = p.cells[y * p.width + x]
      if (indexed) {
        const v = c < 0 ? 0 : local.get(c)!
        for (let k = 0; k < scale; k++) raw[o++] = v
      } else {
        const rgb = c < 0 ? [0, 0, 0] : (pal.colors[c].rgb as number[])
        for (let k = 0; k < scale; k++) {
          raw[o++] = rgb[0]
          raw[o++] = rgb[1]
          raw[o++] = rgb[2]
          raw[o++] = c < 0 ? 0 : 255
        }
      }
    }
    // The other rows of this cell row are copies.
    for (let k = 1; k < scale; k++) raw.copyWithin(first + k * rowLen, first, first + rowLen)
  }

  // zlib stream with stored (uncompressed) blocks.
  const blocks = Math.ceil(raw.length / 65535) || 1
  const z = new Uint8Array(2 + raw.length + blocks * 5 + 4)
  let zo = 0
  z[zo++] = 0x78
  z[zo++] = 0x01
  let a = 1
  let b = 0
  for (let i = 0; i < raw.length; ) {
    const n = Math.min(65535, raw.length - i)
    z[zo++] = i + n >= raw.length ? 1 : 0
    z[zo++] = n & 0xff
    z[zo++] = n >>> 8
    z[zo++] = ~n & 0xff
    z[zo++] = (~n >>> 8) & 0xff
    z.set(raw.subarray(i, i + n), zo)
    zo += n
    // adler32, in chunks small enough not to overflow
    for (let j = i; j < i + n; ) {
      const end = Math.min(i + n, j + 3800)
      for (; j < end; j++) {
        a += raw[j]
        b += a
      }
      a %= 65521
      b %= 65521
    }
    i += n
  }
  z[zo++] = b >>> 8
  z[zo++] = b & 0xff
  z[zo++] = a >>> 8
  z[zo++] = a & 0xff

  const chunks: { type: string; data: Uint8Array }[] = []
  const ihdr = new Uint8Array(13)
  const dv = new DataView(ihdr.buffer)
  dv.setUint32(0, W)
  dv.setUint32(4, H)
  ihdr[8] = 8 // bit depth
  ihdr[9] = indexed ? 3 : 6 // palette / RGBA
  chunks.push({ type: 'IHDR', data: ihdr })
  if (indexed) {
    const plte = new Uint8Array(colors.length * 3)
    colors.forEach((c, i) => plte.set(c, i * 3))
    chunks.push({ type: 'PLTE', data: plte })
    chunks.push({ type: 'tRNS', data: new Uint8Array([0]) }) // index 0 fully transparent
  }
  chunks.push({ type: 'IDAT', data: z.subarray(0, zo) })
  chunks.push({ type: 'IEND', data: new Uint8Array(0) })

  const total = 8 + chunks.reduce((n, c) => n + 12 + c.data.length, 0)
  const out = new Uint8Array(total)
  out.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0)
  const odv = new DataView(out.buffer)
  let o = 8
  for (const c of chunks) {
    odv.setUint32(o, c.data.length)
    for (let i = 0; i < 4; i++) out[o + 4 + i] = c.type.charCodeAt(i)
    out.set(c.data, o + 8)
    odv.setUint32(o + 8 + c.data.length, crc32(out, o + 4, o + 8 + c.data.length))
    o += 12 + c.data.length
  }
  return out
}

const slots = new Map<string, string>()
let seq = 0

/**
 * Write the pattern's picture to a file and return its path (for `<image src>`). `slot` names where
 * it is shown: the slot's previous file is removed. `target` = wanted pixels on the long side.
 */
export function patternImage(slot: string, p: Pattern, pal: Palette, target: number): string {
  const long = Math.max(p.width, p.height)
  const scale = Math.max(1, Math.min(10, Math.round(target / long)))
  const bytes = patternPng(p, pal, scale)
  const fs = wx.getFileSystemManager()
  const prev = slots.get(slot)
  if (prev) {
    try {
      fs.unlinkSync(prev)
    } catch {}
  }
  const path = `${wx.env.USER_DATA_PATH}/bs_${slot}_${Date.now().toString(36)}${seq++}.png`
  fs.writeFileSync(path, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer)
  slots.set(slot, path)
  return path
}

/** Remove leftover picture files from earlier runs (called once at launch). */
export function cleanPictures() {
  const fs = wx.getFileSystemManager()
  try {
    for (const f of fs.readdirSync(wx.env.USER_DATA_PATH)) if (/^bs_.*\.png$/.test(f)) fs.unlinkSync(`${wx.env.USER_DATA_PATH}/${f}`)
  } catch {}
}
