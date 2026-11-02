'use client'

import { countColors, sectionCellIndices, splitSections, type Palette, type Pattern, type Section } from '@picobreads/pattern-engine'
import { luminance } from './pattern'

/** Text shown on the sheets (passed in so this file stays free of i18n). */
export interface SheetText {
  title: string
  /** One line under the title, e.g. "104 × 104 · mini 2.6 mm · ≈ 27 cm · 4 boards · 34 colors · 2,345 beads". */
  summary: string
  overview: string
  board: (n: number, total: number, row: number, col: number) => string
  range: (x0: number, x1: number, y0: number, y1: number) => string
  legend: string
  beads: (n: number) => string
  empty: string
}

export interface SheetPage {
  id: string
  /** File name without extension. */
  name: string
  label: string
  render: () => HTMLCanvasElement
}

const INK = '#2b2024'
const MUTED = '#7a6a70'
const FONT = 'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Noto Sans SC", sans-serif'
const css = (rgb: [number, number, number]) => `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`
const textOn = (rgb: [number, number, number]) => (luminance(rgb) > 0.6 ? '#1b1b1b' : '#ffffff')

/** Sheets for printing / beading: an overview page plus one page per pegboard with a color code in every cell. */
export function sheetPages(pattern: Pattern, palette: Palette, boardPegs: number, text: SheetText): SheetPage[] {
  const sections = splitSections(pattern.width, pattern.height, boardPegs).filter((s) =>
    sectionCellIndices(s, pattern.width).some((i) => pattern.cells[i] >= 0),
  )
  const pages: SheetPage[] = [
    { id: 'overview', name: 'pattern-overview', label: text.overview, render: () => drawOverview(pattern, palette, boardPegs, sections, text) },
  ]
  sections.forEach((s, k) => {
    const row = Math.floor(s.y / boardPegs) + 1
    const col = Math.floor(s.x / boardPegs) + 1
    const label = text.board(k + 1, sections.length, row, col)
    pages.push({ id: s.id, name: `pattern-board-${k + 1}`, label, render: () => drawBoard(pattern, palette, s, label, text) })
  })
  return pages
}

function legendRows(cells: number[], palette: Palette) {
  return countColors(cells).map(({ color, count }) => ({ color: palette.colors[color], count }))
}

/** Legend grid: swatch with code, name, count. Returns the height used. */
function drawLegend(ctx: CanvasRenderingContext2D, rows: ReturnType<typeof legendRows>, x: number, y: number, width: number, text: SheetText, draw = true) {
  const colW = 250
  const perRow = Math.max(1, Math.floor(width / colW))
  const rowH = 34
  if (draw) {
    ctx.fillStyle = INK
    ctx.font = `700 20px ${FONT}`
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillText(text.legend, x, y + 20)
  }
  const top = y + 34
  if (draw)
    rows.forEach((r, i) => {
      const cx = x + (i % perRow) * colW
      const cy = top + Math.floor(i / perRow) * rowH
      ctx.fillStyle = css(r.color.rgb)
      ctx.beginPath()
      ctx.roundRect(cx, cy, 56, 26, 6)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = textOn(r.color.rgb)
      ctx.font = `700 14px ${FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(r.color.code, cx + 28, cy + 13.5)
      ctx.textAlign = 'left'
      ctx.fillStyle = INK
      ctx.font = `600 14px ${FONT}`
      ctx.fillText(text.beads(r.count), cx + 64, cy + 8)
      ctx.fillStyle = MUTED
      ctx.font = `12px ${FONT}`
      ctx.fillText(r.color.name, cx + 64, cy + 22, colW - 72)
    })
  return 34 + Math.ceil(rows.length / perRow) * rowH
}

function header(ctx: CanvasRenderingContext2D, title: string, sub: string, w: number) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `800 28px ${FONT}`
  ctx.fillText(title, 32, 50, w - 64)
  ctx.fillStyle = MUTED
  ctx.font = `16px ${FONT}`
  ctx.fillText(sub, 32, 78, w - 64)
}

function drawOverview(pattern: Pattern, palette: Palette, boardPegs: number, sections: Section[], text: SheetText) {
  const W = pattern.width
  const H = pattern.height
  const cell = Math.max(6, Math.floor(1100 / Math.max(W, H)))
  const width = Math.max(1180, W * cell + 64)
  const rows = legendRows(pattern.cells, palette)
  const probe = document.createElement('canvas').getContext('2d')!
  const legendH = drawLegend(probe, rows, 32, 0, width - 64, text, false)
  const top = 104
  const height = top + H * cell + 40 + legendH + 32
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  header(ctx, text.title, text.summary, width)
  const ox = Math.round((width - W * cell) / 2)
  // Cells.
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const c = pattern.cells[y * W + x]
      if (c < 0) {
        ctx.fillStyle = '#f4f1f2'
        ctx.fillRect(ox + x * cell, top + y * cell, cell, cell)
        continue
      }
      ctx.fillStyle = css(palette.colors[c].rgb)
      ctx.fillRect(ox + x * cell, top + y * cell, cell, cell)
    }
  // Board outlines + numbers.
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.font = `800 ${Math.max(16, Math.min(48, boardPegs * cell * 0.25))}px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  sections.forEach((s, k) => {
    ctx.strokeRect(ox + s.x * cell, top + s.y * cell, s.w * cell, s.h * cell)
    if (sections.length > 1) {
      const cx = ox + (s.x + s.w / 2) * cell
      const cy = top + (s.y + s.h / 2) * cell
      ctx.lineWidth = 6
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.strokeText(String(k + 1), cx, cy)
      ctx.fillStyle = INK
      ctx.fillText(String(k + 1), cx, cy)
      ctx.strokeStyle = INK
      ctx.lineWidth = 3
    }
  })
  drawLegend(ctx, rows, 32, top + H * cell + 40, width - 64, text)
  return canvas
}

function drawBoard(pattern: Pattern, palette: Palette, s: Section, label: string, text: SheetText) {
  const cell = 30
  const left = 52
  const top = 140
  const gridW = s.w * cell
  const gridH = s.h * cell
  const width = Math.max(1180, left + gridW + 40)
  const idx = sectionCellIndices(s, pattern.width)
  const rows = legendRows(idx.map((i) => pattern.cells[i]), palette)
  const probe = document.createElement('canvas').getContext('2d')!
  const legendH = drawLegend(probe, rows, 32, 0, width - 64, text, false)
  const height = top + gridH + 48 + legendH + 32
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  header(ctx, `${text.title} · ${label}`, `${text.summary}`, width)
  ctx.fillStyle = MUTED
  ctx.font = `600 15px ${FONT}`
  ctx.fillText(text.range(s.x + 1, s.x + s.w, s.y + 1, s.y + s.h), 32, 104)
  const ox = left + Math.round((width - left - 40 - gridW) / 2)

  // Column / row numbers (whole-pattern coordinates, matching the overview).
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let x = 0; x < s.w; x++) {
    const n = s.x + x + 1
    ctx.fillStyle = n % 5 === 0 ? INK : MUTED
    ctx.font = `${n % 5 === 0 ? 700 : 400} ${n >= 100 ? 9 : 11}px ${FONT}`
    ctx.fillText(String(n), ox + x * cell + cell / 2, top - 12)
  }
  for (let y = 0; y < s.h; y++) {
    const n = s.y + y + 1
    ctx.fillStyle = n % 5 === 0 ? INK : MUTED
    ctx.font = `${n % 5 === 0 ? 700 : 400} 11px ${FONT}`
    ctx.textAlign = 'right'
    ctx.fillText(String(n), ox - 6, top + y * cell + cell / 2)
  }

  // Cells with the bead code.
  ctx.textAlign = 'center'
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const c = pattern.cells[(s.y + y) * pattern.width + s.x + x]
      const px = ox + x * cell
      const py = top + y * cell
      if (c < 0) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(px, py, cell, cell)
        ctx.fillStyle = '#d9d0d4'
        ctx.beginPath()
        ctx.arc(px + cell / 2, py + cell / 2, 2, 0, Math.PI * 2)
        ctx.fill()
        continue
      }
      const color = palette.colors[c]
      ctx.fillStyle = css(color.rgb)
      ctx.fillRect(px, py, cell, cell)
      ctx.fillStyle = textOn(color.rgb)
      ctx.font = `700 ${color.code.length > 3 ? 9 : 11}px ${FONT}`
      ctx.fillText(color.code, px + cell / 2, py + cell / 2 + 0.5)
    }

  // Grid: thin every cell, darker every 5, bold every 10 and on the board edge.
  for (let i = 0; i <= s.w; i++) {
    const g = s.x + i
    ctx.strokeStyle = i === 0 || i === s.w ? INK : g % 10 === 0 ? 'rgba(0,0,0,0.75)' : g % 5 === 0 ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.15)'
    ctx.lineWidth = i === 0 || i === s.w || g % 10 === 0 ? 2 : 1
    ctx.beginPath()
    ctx.moveTo(ox + i * cell + 0.5, top)
    ctx.lineTo(ox + i * cell + 0.5, top + gridH)
    ctx.stroke()
  }
  for (let i = 0; i <= s.h; i++) {
    const g = s.y + i
    ctx.strokeStyle = i === 0 || i === s.h ? INK : g % 10 === 0 ? 'rgba(0,0,0,0.75)' : g % 5 === 0 ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.15)'
    ctx.lineWidth = i === 0 || i === s.h || g % 10 === 0 ? 2 : 1
    ctx.beginPath()
    ctx.moveTo(ox, top + i * cell + 0.5)
    ctx.lineTo(ox + gridW, top + i * cell + 0.5)
    ctx.stroke()
  }
  if (rows.length === 0) {
    ctx.fillStyle = MUTED
    ctx.fillText(text.empty, width / 2, top + gridH + 30)
  }
  drawLegend(ctx, rows, 32, top + gridH + 48, width - 64, text)
  return canvas
}

/** Save a canvas as a PNG file. */
export function downloadCanvas(canvas: HTMLCanvasElement, name: string): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      resolve()
    }, 'image/png')
  })
}
