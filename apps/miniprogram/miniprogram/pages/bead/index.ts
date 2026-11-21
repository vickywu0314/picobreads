import type { Pattern } from '../../lib/engine'
import { BOARD_PEGS } from '../../utils/config'
import { cellAt, cellCenter, drawBoard, fitView, getCanvas, onColor, queryNode, rgb, type BoardView, type CanvasHandle } from '../../utils/draw'
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
/** The simulator shows vibration by shaking the whole phone picture, which looks like a glitch. */
const CAN_VIBRATE = wx.getDeviceInfo ? wx.getDeviceInfo().platform !== 'devtools' : true

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
    boardW: 300,
    boardH: 300,
  },

  // Working state (not rendered by the template).
  pattern: null as Pattern | null,
  placed: [] as string[],
  bv: { scale: 8, ox: 0, oy: 0 } as BoardView,
  fitScale: 8,
  handle: null as CanvasHandle | null,
  numbers: null as unknown as Map<number, number>,
  totals: null as unknown as Map<number, number>,
  undoStack: [] as number[][],
  batch: [] as number[],
  touch: null as null | { last: Pt; start: Pt; moved: boolean; pinch?: { dist: number; mid: Pt } },
  frame: 0,
  saveTimer: 0 as number,
  lastBuzz: 0,
  finishedShown: false,
  failed: false,
  drawn: false,

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
    this.refreshPanel()
  },

  onReady() {
    void this.initCanvas(0)
  },

  /** Back from another page (share, …): set the canvas up again and repaint, keeping the zoom. */
  onShow() {
    if (!this.handle) return
    getCanvas(this, '#board')
      .then((h) => {
        this.handle = h
        this.draw()
      })
      .catch(() => {})
  },

  /** Size the canvas to its box once the layout is known (retries while the box has no size yet). */
  async initCanvas(attempt: number) {
    if (!this.pattern) return
    const box = await queryNode<{ width: number; height: number }>(this, '#board-box', { size: true })
    if (!box || box.width < 10 || box.height < 10) {
      if (attempt < 20) setTimeout(() => void this.initCanvas(attempt + 1), 100)
      else this.fail(box ? `钉板区域大小不对：${box.width}×${box.height}` : '查询钉板区域没有回应')
      return
    }
    await new Promise<void>((resolve) => this.setData({ boardW: Math.floor(box.width), boardH: Math.floor(box.height) }, resolve))
    try {
      this.handle = await getCanvas(this, '#board')
      this.fit()
    } catch (e) {
      this.fail(String((e as Error)?.message ?? e))
    }
  },

  /** Show what went wrong (once), so it can be reported. */
  fail(msg: string) {
    console.error('[bead]', msg)
    if (this.failed) return
    this.failed = true
    wx.showModal({ title: '钉板没画出来', content: msg.slice(0, 200), showCancel: false })
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
    const paint = () => {
      this.frame = 0
      try {
        if (!this.drawn) {
          this.drawn = true
          console.log('[bead] first draw', { canvas: `${c.width}x${c.height}`, view: this.bv, pattern: `${this.pattern!.width}x${this.pattern!.height}` })
        }
        drawBoard(c.ctx, c.width, c.height, this.bv, { pattern: this.pattern!, placed: this.placed.join(''), selected: this.data.selected, numbers: this.numbers }, palette(), BOARD_PEGS[getWork().beadSize])
      } catch (e) {
        this.fail(String((e as Error)?.stack ?? e))
      }
    }
    // A plain timer, not canvas.requestAnimationFrame: in some environments its callback never
    // fires, which left the board blank forever (every later draw was skipped as "already pending").
    this.frame = 1
    setTimeout(paint, 16)
  },

  fit() {
    if (!this.handle || !this.pattern) return
    this.bv = fitView(this.pattern, this.handle.width, this.handle.height)
    this.fitScale = this.bv.scale
    this.draw()
  },
  zoomAt(cx: number, cy: number, k: number) {
    const v = this.bv
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

  /** One finger places beads only in "place" mode with a color picked; otherwise it moves the board. */
  placing() {
    return this.data.mode === 'place' && this.data.selected !== null
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
    if (this.bv.scale < 14 && this.handle) this.zoomAt(this.handle.width / 2, this.handle.height / 2, 14 / this.bv.scale)
  },

  showHint(text: string) {
    this.setData({ hint: text })
    setTimeout(() => this.data.hint === text && this.setData({ hint: '' }), 1600)
  },

  /** Put a bead in the cell under the finger, if it's the selected color's spot. */
  placeAt(pt: Pt) {
    const p = this.pattern!
    const i = cellAt(this.bv, p, pt.x, pt.y)
    if (i < 0 || this.placed[i] === '1' || p.cells[i] < 0) return
    const sel = this.data.selected
    if (sel === null) return
    if (p.cells[i] !== sel) return
    const c = cellCenter(this.bv, p, i)
    if (Math.hypot(pt.x - c.x, pt.y - c.y) > this.bv.scale * HIT_RADIUS) return
    this.placed[i] = '1'
    this.batch.push(i)
    const now = Date.now()
    if (now - this.lastBuzz > 60) {
      this.lastBuzz = now
      if (CAN_VIBRATE) wx.vibrateShort?.({ type: 'light' })
    }
    this.draw()
  },

  onTouchStart(e: WechatMiniprogram.TouchCanvas) {
    const t = e.touches
    if (t.length >= 2) {
      this.commitBatch()
      const a = { x: t[0].x, y: t[0].y }
      const b = { x: t[1].x, y: t[1].y }
      this.touch = { last: a, start: a, moved: true, pinch: { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } } }
      return
    }
    const pt = { x: t[0].x, y: t[0].y }
    this.touch = { last: pt, start: pt, moved: false }
    if (this.placing()) this.placeAt(pt)
  },

  onTouchMove(e: WechatMiniprogram.TouchCanvas) {
    const t = e.touches
    if (!this.touch) return
    if (t.length >= 2 && this.touch.pinch) {
      const a = { x: t[0].x, y: t[0].y }
      const b = { x: t[1].x, y: t[1].y }
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      this.bv.ox += mid.x - this.touch.pinch.mid.x
      this.bv.oy += mid.y - this.touch.pinch.mid.y
      this.zoomAt(mid.x, mid.y, dist / Math.max(1, this.touch.pinch.dist))
      this.touch.pinch = { dist, mid }
      return
    }
    if (this.touch.pinch) return // lifted one finger of a pinch: wait for the other
    const pt = { x: t[0].x, y: t[0].y }
    const last = this.touch.last
    if (Math.hypot(pt.x - this.touch.start.x, pt.y - this.touch.start.y) > 6) this.touch.moved = true
    if (!this.placing()) {
      this.bv.ox += pt.x - last.x
      this.bv.oy += pt.y - last.y
      this.draw()
    } else {
      // Sample along the stroke so fast swipes don't skip cells.
      const step = Math.max(2, this.bv.scale * 0.35)
      const n = Math.max(1, Math.ceil(Math.hypot(pt.x - last.x, pt.y - last.y) / step))
      for (let k = 1; k <= n; k++) this.placeAt({ x: last.x + ((pt.x - last.x) * k) / n, y: last.y + ((pt.y - last.y) * k) / n })
    }
    this.touch.last = pt
  },

  onTouchEnd(e: WechatMiniprogram.TouchCanvas) {
    if (e.touches.length === 0) {
      // A tap on the board with no color picked: say what to do.
      if (this.touch && !this.touch.moved && this.data.mode === 'place' && this.data.selected === null) this.showHint('先在下面选一个颜色')
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
