import type { Pattern } from '../../lib/engine'
import { BOARD_PEGS } from '../../utils/config'
import { cellAt, cellCenter, drawBoard, fitView, getCanvas, onColor, rgb, type BoardView, type CanvasHandle } from '../../utils/draw'
import { legendOf, palette } from '../../utils/generate'
import { getWork, setWork } from '../../utils/store'
import { saveCurrentDraft, shareCurrent } from '../../utils/actions'

interface Well {
  color: number
  number: number
  code: string
  hex: string
  text: string
  left: number
}

type Pt = { x: number; y: number }

const MAX_SCALE = 60
/** A bead only goes in when the finger is this close to the cell's middle (share of the cell), so strokes don't spill into the next row. */
const HIT_RADIUS = 0.45

Page({
  data: {
    pct: 0,
    done: 0,
    total: 0,
    wells: [] as Well[],
    selected: null as number | null,
    selectedLabel: '先在下面选一个颜色',
    mode: 'place' as 'place' | 'move',
    canUndo: false,
    hint: '',
  },

  // Working state (not rendered by the template).
  pattern: null as Pattern | null,
  placed: [] as string[],
  view: { scale: 8, ox: 0, oy: 0 } as BoardView,
  fitScale: 8,
  handle: null as CanvasHandle | null,
  numbers: new Map<number, number>(),
  totals: new Map<number, number>(),
  undoStack: [] as number[][],
  batch: [] as number[],
  touch: null as null | { last: Pt; pinch?: { dist: number; mid: Pt } },
  frame: 0,
  saveTimer: 0 as number,
  lastBuzz: 0,
  finishedShown: false,

  async onLoad() {
    const w = getWork()
    if (!w.pattern) {
      wx.showToast({ title: '先生成一张图纸', icon: 'none' })
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800)
      return
    }
    this.pattern = w.pattern
    this.placed = (w.placed && w.placed.length === w.pattern.cells.length ? w.placed : '0'.repeat(w.pattern.cells.length)).split('')
    const legend = legendOf(w.pattern)
    this.numbers = new Map(legend.map((l) => [l.color, l.number]))
    this.totals = new Map(legend.map((l) => [l.color, l.count]))
    this.finishedShown = this.countDone() === this.countTotal()
    this.handle = await getCanvas(this, '#board')
    this.fit()
    this.refreshPanel()
  },

  onUnload() {
    this.persist()
  },
  onHide() {
    this.persist()
  },

  countTotal() {
    let n = 0
    this.totals.forEach((v) => (n += v))
    return n
  },
  countDone() {
    const p = this.pattern!
    let n = 0
    for (let i = 0; i < p.cells.length; i++) if (p.cells[i] >= 0 && this.placed[i] === '1') n++
    return n
  },

  /** Progress, color wells (with beads left), labels. */
  refreshPanel() {
    const p = this.pattern!
    const pal = palette()
    const left = new Map(this.totals)
    for (let i = 0; i < p.cells.length; i++) if (p.cells[i] >= 0 && this.placed[i] === '1') left.set(p.cells[i], (left.get(p.cells[i]) ?? 1) - 1)
    const wells: Well[] = [...this.numbers.entries()].map(([color, number]) => {
      const c = pal.colors[color]
      return { color, number, code: c.code, hex: rgb(c.rgb as [number, number, number]), text: onColor(c.rgb as [number, number, number]), left: left.get(color) ?? 0 }
    })
    const total = this.countTotal()
    const done = this.countDone()
    const sel = this.data.selected
    this.setData({
      wells,
      total,
      done,
      pct: total ? Math.floor((done / total) * 100) : 0,
      canUndo: this.undoStack.length > 0,
      selectedLabel: sel === null ? '先在下面选一个颜色' : `${pal.colors[sel].code} · 还差 ${left.get(sel) ?? 0} 颗`,
    })
    if (total && done === total && !this.finishedShown) {
      this.finishedShown = true
      this.persist()
      wx.showModal({
        title: '拼完啦 🎉',
        content: '整张图都拼好了！分享给朋友看看？',
        confirmText: '去分享',
        cancelText: '先不了',
        success: (r) => r.confirm && this.share(),
      })
    }
  },

  draw() {
    if (this.frame || !this.handle) return
    const c = this.handle
    this.frame = c.canvas.requestAnimationFrame(() => {
      this.frame = 0
      drawBoard(c.ctx, c.width, c.height, this.view, { pattern: this.pattern!, placed: this.placed.join(''), selected: this.data.selected, numbers: this.numbers }, palette(), BOARD_PEGS[getWork().beadSize])
    })
  },

  fit() {
    if (!this.handle || !this.pattern) return
    this.view = fitView(this.pattern, this.handle.width, this.handle.height)
    this.fitScale = this.view.scale
    this.draw()
  },
  zoomAt(cx: number, cy: number, k: number) {
    const v = this.view
    const next = Math.min(MAX_SCALE, Math.max(this.fitScale * 0.6, v.scale * k))
    const f = next / v.scale
    v.ox = cx - (cx - v.ox) * f
    v.oy = cy - (cy - v.oy) * f
    v.scale = next
    this.draw()
  },
  zoomIn() {
    this.zoomAt(this.handle!.width / 2, this.handle!.height / 2, 1.6)
  },
  zoomOut() {
    this.zoomAt(this.handle!.width / 2, this.handle!.height / 2, 1 / 1.6)
  },

  setMode(e: WechatMiniprogram.TouchEvent) {
    this.setData({ mode: e.currentTarget.dataset.m })
  },

  selectColor(e: WechatMiniprogram.TouchEvent) {
    const color = Number(e.currentTarget.dataset.color)
    this.setData({ selected: this.data.selected === color ? null : color })
    this.refreshPanel()
    this.draw()
    // Zoom in so beads can be placed one by one.
    if (this.view.scale < 14 && this.handle) this.zoomAt(this.handle.width / 2, this.handle.height / 2, 14 / this.view.scale)
  },

  showHint(text: string) {
    this.setData({ hint: text })
    setTimeout(() => this.data.hint === text && this.setData({ hint: '' }), 1600)
  },

  /** Put a bead in the cell under the finger, if it's the selected color's spot. */
  placeAt(pt: Pt) {
    const p = this.pattern!
    const i = cellAt(this.view, p, pt.x, pt.y)
    if (i < 0 || this.placed[i] === '1' || p.cells[i] < 0) return
    const sel = this.data.selected
    if (sel === null) {
      this.showHint('先在下面选一个颜色')
      return
    }
    if (p.cells[i] !== sel) return
    const c = cellCenter(this.view, p, i)
    if (Math.hypot(pt.x - c.x, pt.y - c.y) > this.view.scale * HIT_RADIUS) return
    this.placed[i] = '1'
    this.batch.push(i)
    const now = Date.now()
    if (now - this.lastBuzz > 60) {
      this.lastBuzz = now
      wx.vibrateShort?.({ type: 'light' })
    }
    this.draw()
  },

  onTouchStart(e: WechatMiniprogram.TouchCanvas) {
    const t = e.touches
    if (t.length >= 2) {
      this.commitBatch()
      const a = { x: t[0].x, y: t[0].y }
      const b = { x: t[1].x, y: t[1].y }
      this.touch = { last: a, pinch: { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } } }
      return
    }
    const pt = { x: t[0].x, y: t[0].y }
    this.touch = { last: pt }
    if (this.data.mode === 'place') this.placeAt(pt)
  },

  onTouchMove(e: WechatMiniprogram.TouchCanvas) {
    const t = e.touches
    if (!this.touch) return
    if (t.length >= 2 && this.touch.pinch) {
      const a = { x: t[0].x, y: t[0].y }
      const b = { x: t[1].x, y: t[1].y }
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      this.view.ox += mid.x - this.touch.pinch.mid.x
      this.view.oy += mid.y - this.touch.pinch.mid.y
      this.zoomAt(mid.x, mid.y, dist / Math.max(1, this.touch.pinch.dist))
      this.touch.pinch = { dist, mid }
      return
    }
    if (this.touch.pinch) return // lifted one finger of a pinch: wait for the other
    const pt = { x: t[0].x, y: t[0].y }
    const last = this.touch.last
    if (this.data.mode === 'move') {
      this.view.ox += pt.x - last.x
      this.view.oy += pt.y - last.y
      this.draw()
    } else {
      // Sample along the stroke so fast swipes don't skip cells.
      const step = Math.max(2, this.view.scale * 0.35)
      const n = Math.max(1, Math.ceil(Math.hypot(pt.x - last.x, pt.y - last.y) / step))
      for (let k = 1; k <= n; k++) this.placeAt({ x: last.x + ((pt.x - last.x) * k) / n, y: last.y + ((pt.y - last.y) * k) / n })
    }
    this.touch.last = pt
  },

  onTouchEnd(e: WechatMiniprogram.TouchCanvas) {
    if (e.touches.length === 0) {
      this.touch = null
      this.commitBatch()
    }
  },

  commitBatch() {
    if (!this.batch.length) return
    this.undoStack.push(this.batch)
    if (this.undoStack.length > 200) this.undoStack.shift()
    this.batch = []
    this.refreshPanel()
    this.schedulePersist()
  },

  undo() {
    const last = this.undoStack.pop()
    if (!last) return
    for (const i of last) this.placed[i] = '0'
    this.finishedShown = false
    this.refreshPanel()
    this.draw()
    this.schedulePersist()
  },

  schedulePersist() {
    clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => this.persist(), 800) as unknown as number
  },
  persist() {
    if (this.pattern) setWork({ placed: this.placed.join('') })
  },

  async saveDraft() {
    this.persist()
    await saveCurrentDraft()
  },

  async share() {
    this.persist()
    await shareCurrent()
  },
})
