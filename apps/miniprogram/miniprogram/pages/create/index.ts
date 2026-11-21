import type { Pattern } from '../../lib/engine'
import { BEAD_SIZES, PIXEL_TIER, boardCount, perSideOf, sizeCm, type BeadSize, type Look, type TierId } from '../../utils/config'
import { drawFinished, getCanvas, type CanvasHandle } from '../../utils/draw'
import { beadCount, generate, legendOf, optionKeys, palette, recommend, yieldUI } from '../../utils/generate'
import { applyPattern, getWork, setWork } from '../../utils/store'

interface OptionView {
  key: string
  tier: TierId
  look: Look
  title: string
  sub: string
  note: string
  recommended: boolean
  selected: boolean
  ready: boolean
}

/** Pictures whose recommendation was already applied (a later manual pick is kept). */
const autoPicked = new Set<string>()

Page({
  data: {
    beadSizes: BEAD_SIZES,
    bead: '2.6mm' as BeadSize,
    beadHint: '',
    removeBg: true,
    trim: true,
    options: [] as OptionView[],
    view: 'final' as 'final' | 'photo',
    photo: '',
    previewInfo: '',
    loose: false,
    subjectPct: 100,
    canGo: false,
  },

  // Not in data (not rendered): generated patterns and canvases.
  patterns: {} as Record<string, Pattern | null>,
  canvases: {} as Record<string, CanvasHandle>,
  run: 0,
  perSide: 0,

  onLoad() {
    const w = getWork()
    if (!w.photo) {
      wx.showToast({ title: '先选一张照片', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ bead: w.beadSize, beadHint: BEAD_SIZES.find((b) => b.id === w.beadSize)!.hint, removeBg: w.removeBg, trim: w.trim, photo: w.photo })
    void this.generateAll()
  },

  onUnload() {
    this.run++ // stop a running generation
  },

  /** Optimistic labels first, then generate the four results one by one (main thread, so with pauses). */
  async generateAll() {
    const run = ++this.run
    const w = getWork()
    this.patterns = {}
    this.perSide = 0
    this.setData({ options: this.optionViews(), canGo: false, previewInfo: '生成中…' })
    const keys = optionKeys()
    // The selected one first, so the preview shows up quickly.
    const order = [...keys].sort((a, b) => Number(this.isSelected(b.key)) - Number(this.isSelected(a.key)))
    for (const o of order) {
      await yieldUI()
      if (run !== this.run) return
      try {
        this.patterns[o.key] = await generate(w, o.tier, o.look)
      } catch (e) {
        console.error(e)
        this.patterns[o.key] = null
      }
      if (run !== this.run) return
      await this.drawOption(o.key)
      this.setData({ options: this.optionViews() })
      if (this.isSelected(o.key)) await this.refreshPreview()
    }
    // Recommendation (same rule as the website).
    await yieldUI()
    const plain = ['small', 'standard', 'large'].map((t) => this.patterns[`${t}-classic`]).filter(Boolean) as Pattern[]
    if (run !== this.run || plain.length < 3) return
    const advice = await recommend(w, plain)
    this.perSide = advice.perSide
    const key = `${w.photo}|${w.beadSize}|${w.trim}|${w.removeBg}`
    if (!autoPicked.has(key)) {
      autoPicked.add(key)
      const tier = (['small', 'standard', 'large'] as TierId[])[advice.perSide - 1]
      setWork({ tier, look: 'classic' })
    }
    this.setData({ options: this.optionViews(), loose: !w.trim && advice.subjectShare < 0.45, subjectPct: Math.round(advice.subjectShare * 100) })
    await this.refreshPreview()
  },

  isSelected(key: string) {
    const w = getWork()
    return w.look === 'pixel' ? key === 'pixel' : key === `${w.tier}-classic`
  },

  optionViews(): OptionView[] {
    const w = getWork()
    return optionKeys().map((o) => {
      const p = this.patterns[o.key]
      const per = perSideOf(o.tier)
      const n = p ? boardCount(p.width, p.height, w.beadSize) : 0
      const isPixel = o.look === 'pixel'
      const note =
        isPixel ? '大色块、少碎色、保留主体特征' : !this.perSide || per === this.perSide ? '' : per > this.perSide ? '更大，但不会更清楚' : '会丢掉一些细节'
      return {
        ...o,
        title: `${isPixel ? '像素风 · ' : ''}${p ? `${n} 块底板 · ${p.width}×${p.height}` : `${per * per} 个分区`}`,
        sub: p ? `≈ ${sizeCm(p.width, p.height, w.beadSize)} cm · ${legendOf(p).length} 色` : '',
        note,
        recommended: !isPixel && this.perSide === per,
        selected: this.isSelected(o.key),
        ready: !!p,
      }
    })
  },

  async canvasFor(id: string) {
    if (!this.canvases[id]) this.canvases[id] = await getCanvas(this, `#${id}`)
    return this.canvases[id]
  },

  async drawOption(key: string) {
    const idx = optionKeys().findIndex((o) => o.key === key)
    const p = this.patterns[key]
    const c = await this.canvasFor(`opt-${idx}`)
    if (p) drawFinished(c.ctx, c.width, c.height, p, palette())
    else c.ctx.clearRect(0, 0, c.width, c.height)
  },

  selectedPattern(): Pattern | null {
    const w = getWork()
    return this.patterns[w.look === 'pixel' ? 'pixel' : `${w.tier}-classic`] ?? null
  },

  async refreshPreview() {
    const p = this.selectedPattern()
    const w = getWork()
    const c = await this.canvasFor('preview')
    if (!p) return c.ctx.clearRect(0, 0, c.width, c.height)
    drawFinished(c.ctx, c.width, c.height, p, palette())
    this.setData({
      canGo: true,
      previewInfo: `${boardCount(p.width, p.height, w.beadSize)} 块底板 · ${p.width} × ${p.height} · ≈ ${sizeCm(p.width, p.height, w.beadSize)} cm · ${legendOf(p).length} 色 · 共 ${beadCount(p)} 颗`,
    })
  },

  pick(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as string
    const o = optionKeys().find((x) => x.key === key)!
    setWork({ tier: o.look === 'pixel' ? PIXEL_TIER : o.tier, look: o.look })
    this.setData({ options: this.optionViews() })
    void this.refreshPreview()
  },

  setBead(e: WechatMiniprogram.TouchEvent) {
    const bead = e.currentTarget.dataset.id as BeadSize
    if (bead === getWork().beadSize) return
    setWork({ beadSize: bead })
    this.setData({ bead, beadHint: BEAD_SIZES.find((b) => b.id === bead)!.hint })
    void this.generateAll()
  },
  setRemoveBg(e: WechatMiniprogram.SwitchChange) {
    setWork({ removeBg: e.detail.value })
    this.setData({ removeBg: e.detail.value })
    void this.generateAll()
  },
  setTrim(e: WechatMiniprogram.SwitchChange) {
    setWork({ trim: e.detail.value })
    this.setData({ trim: e.detail.value })
    void this.generateAll()
  },
  setView(e: WechatMiniprogram.TouchEvent) {
    this.setData({ view: e.currentTarget.dataset.v })
  },

  /** Make the picked result the pattern to bead. */
  useSelected(): boolean {
    const p = this.selectedPattern()
    if (!p) return false
    applyPattern(p)
    return true
  },

  startBead() {
    if (this.useSelected()) wx.navigateTo({ url: '/pages/bead/index' })
  },

  next() {
    if (this.useSelected()) wx.navigateTo({ url: '/pages/product/index' })
  },
})

