import type { Pattern } from '../../lib/engine'
import { BOARD_PEGS, boardCount, sizeCm } from '../../utils/config'
import { getCanvas, onColor, rgb } from '../../utils/draw'
import { patternImage } from '../../utils/png'
import { beadCount, legendOf, palette } from '../../utils/generate'
import { getWork } from '../../utils/store'
import { errorText } from '../../utils/api'
import { FORM_NAME, buy, chooseAddress, loadShop, tierOf, yuan, type Address, type Form, type Shop } from '../../utils/shop'

type Rgb = [number, number, number]

Page({
  data: {
    stats: [] as { k: string; v: string }[],
    legend: [] as { code: string; hex: string; count: number }[],
    listOpen: false,
    thumb: '',
    rendering: false,
    form: 'digital' as Form,
    forms: [] as { id: Form; icon: string; title: string; body: string; open: boolean; price: string }[],
    address: null as Address | null,
    formName: '',
    itemPrice: '',
    shipping: '',
    total: '',
    paying: false,
    started: false,
  },
  shop: null as Shop | null,
  wanted: 'digital' as Form,


  onLoad(q: Record<string, string | undefined>) {
    // ?form=kit / finished: came here to buy (from 我的 or the finished page).
    this.wanted = q.form === 'kit' || q.form === 'finished' ? q.form : 'digital'
    const w = getWork()
    const p = w.pattern
    if (!p) {
      wx.showToast({ title: '先生成一张图纸', icon: 'none' })
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800)
      return
    }
    const pal = palette()
    const legend = legendOf(p)
    this.setData({
      thumb: patternImage('product', p, pal, 300),
      stats: [
        { k: '尺寸', v: `${p.width} × ${p.height} 格` },
        { k: '成品大小', v: `≈ ${sizeCm(p.width, p.height, w.beadSize)} cm` },
        { k: '底板', v: `${boardCount(p.width, p.height, w.beadSize)} 块（27 × 27 cm）` },
        { k: '豆子', v: `MARD · ${w.beadSize === '5mm' ? '标准豆 5 mm' : '迷你豆 2.6 mm'}` },
        { k: '颜色 / 颗数', v: `${legend.length} 色 · ${beadCount(p)} 颗` },
      ],
      legend: legend.map((l) => ({ code: pal.colors[l.color].code, hex: rgb(pal.colors[l.color].rgb as Rgb), count: l.count })),
    })
  },

  onShow() {
    this.setData({ started: getWork().placed.includes('1') })
    void this.refreshShop()
  },

  /** Which forms are open and their prices for this pattern's size. */
  async refreshShop() {
    const w = getWork()
    if (!w.pattern) return
    const shop = (this.shop = await loadShop())
    const tier = tierOf(w.pattern, w.beadSize)
    const price = (f: 'kit' | 'finished') => (shop.forms[f].open ? yuan(shop.forms[f].prices[tier]) : '')
    this.setData({
      forms: [
        { id: 'digital', icon: '⬇', title: '免费下载图纸', body: '图纸总览 + 材料清单，保存到相册，用你自己的豆子拼。', open: true, price: '免费' },
        { id: 'kit', icon: '📦', title: '购买材料包', body: '按图纸数好的豆子（多 10% 备用）、底板、熨烫纸和打印好的图纸。', open: shop.forms.kit.open, price: price('kit') },
        { id: 'finished', icon: '✨', title: '直接购买成品', body: '我们帮你拼好、熨烫好，收到就能直接送人。', open: shop.forms.finished.open, price: price('finished') },
      ],
    })
    // Preselect what the visitor came for, if it's on sale.
    const want = this.wanted
    this.wanted = 'digital'
    if (want !== 'digital') {
      if (shop.forms[want].open) this.select(want)
      else wx.showToast({ title: `${FORM_NAME[want]}即将开放`, icon: 'none' })
    } else if (this.data.form !== 'digital') this.select(this.data.form)
  },

  select(form: Form) {
    const w = getWork()
    const shop = this.shop
    if (form === 'digital' || !shop || !w.pattern) return this.setData({ form: 'digital' })
    const item = shop.forms[form].prices[tierOf(w.pattern, w.beadSize)]
    this.setData({ form, formName: FORM_NAME[form], itemPrice: yuan(item), shipping: shop.shippingFen ? yuan(shop.shippingFen) : '包邮', total: yuan(item + shop.shippingFen) })
  },

  pick(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as Form
    const f = this.data.forms.find((x) => x.id === id)
    if (!f?.open) return wx.showToast({ title: '即将开放，敬请期待', icon: 'none' })
    this.select(id)
  },

  async chooseAddress() {
    const a = await chooseAddress()
    if (a) this.setData({ address: a })
  },

  async pay() {
    const w = getWork()
    const form = this.data.form
    if (form === 'digital' || !w.pattern) return
    let address = this.data.address
    if (!address) {
      address = await chooseAddress()
      if (!address) return wx.showToast({ title: '请先选择收货地址', icon: 'none' })
      this.setData({ address })
    }
    this.setData({ paying: true })
    wx.showLoading({ title: '正在下单…', mask: true })
    try {
      const { order } = await buy({ form, name: w.name || '我的拼豆', pattern: w.pattern, placed: w.placed, beadSize: w.beadSize, address })
      wx.hideLoading()
      // Paid, still confirming, or cancelled: the order page shows where it stands (and lets them pay later).
      wx.redirectTo({ url: `/pages/order/index?id=${order.id}` })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: errorText(e), icon: 'none' })
    } finally {
      this.setData({ paying: false })
    }
  },

  toggleList() {
    this.setData({ listOpen: !this.data.listOpen })
  },
  edit() {
    wx.navigateBack()
  },
  bead() {
    wx.navigateTo({ url: '/pages/bead/index' })
  },

  /** One picture with the whole pattern (color numbers in the cells when they fit) and the materials list. */
  async saveSheet() {
    const w = getWork()
    const p = w.pattern as Pattern
    wx.showLoading({ title: '生成图纸…', mask: true })
    try {
      // The canvas only exists while the sheet is being made.
      await new Promise<void>((resolve) => this.setData({ rendering: true }, resolve))
      const h = await getCanvas(this, '#sheet')
      const pal = palette()
      const legend = legendOf(p)
      const numbers = new Map(legend.map((l) => [l.color, l.number]))
      // Layout (pixels): margin, grid, legend in 3 columns.
      const M = 60
      const cell = Math.max(6, Math.min(34, Math.floor(1800 / Math.max(p.width, p.height))))
      const gw = p.width * cell
      const gh = p.height * cell
      const W = Math.max(gw + M * 2, 1000)
      const cols = 3
      const rowH = 54
      const rows = Math.ceil(legend.length / cols)
      const top = 150
      const H = top + gh + 110 + rows * rowH + M
      const c = h.canvas
      c.width = W
      c.height = H
      const g = h.ctx
      g.setTransform(1, 0, 0, 1, 0, 0)
      g.fillStyle = '#ffffff'
      g.fillRect(0, 0, W, H)
      g.textBaseline = 'alphabetic'
      g.textAlign = 'left'
      g.fillStyle = '#4a2620'
      g.font = 'bold 44px sans-serif'
      g.fillText('BeadSpark 拼豆图纸', M, 70)
      g.fillStyle = '#7d5f58'
      g.font = '26px sans-serif'
      g.fillText(`${p.width} × ${p.height} 格 · ≈ ${sizeCm(p.width, p.height, w.beadSize)} cm · ${legend.length} 色 · ${beadCount(p)} 颗 · MARD ${w.beadSize}`, M, 112)

      const ox = Math.round((W - gw) / 2)
      const oy = top
      // Cells.
      const showNum = cell >= 16
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.font = `bold ${Math.floor(cell * 0.46)}px sans-serif`
      for (let y = 0; y < p.height; y++) {
        for (let x = 0; x < p.width; x++) {
          const ci = p.cells[y * p.width + x]
          const px = ox + x * cell
          const py = oy + y * cell
          if (ci < 0) {
            // Empty (removed backdrop): a small hollow dot.
            g.strokeStyle = '#d9cfc9'
            g.lineWidth = 1
            g.beginPath()
            g.arc(px + cell / 2, py + cell / 2, Math.max(1, cell * 0.12), 0, Math.PI * 2)
            g.stroke()
            continue
          }
          const col = pal.colors[ci].rgb as Rgb
          g.fillStyle = rgb(col)
          g.fillRect(px, py, cell, cell)
          if (showNum) {
            g.fillStyle = onColor(col)
            g.fillText(String(numbers.get(ci) ?? ''), px + cell / 2, py + cell / 2 + 1)
          }
        }
      }
      // Grid: thin every cell (when big enough), medium every 5, bold every 10, sections in pink.
      const line = (every: number, color: string, width: number) => {
        g.strokeStyle = color
        g.lineWidth = width
        g.beginPath()
        for (let x = 0; x <= p.width; x += every) {
          g.moveTo(ox + x * cell + 0.5, oy)
          g.lineTo(ox + x * cell + 0.5, oy + gh)
        }
        for (let y = 0; y <= p.height; y += every) {
          g.moveTo(ox, oy + y * cell + 0.5)
          g.lineTo(ox + gw, oy + y * cell + 0.5)
        }
        g.stroke()
      }
      if (cell >= 10) line(1, 'rgba(0,0,0,0.12)', 1)
      line(5, 'rgba(0,0,0,0.28)', 1)
      line(10, 'rgba(0,0,0,0.55)', 2)
      line(BOARD_PEGS[w.beadSize], '#d93d72', 3)
      g.strokeStyle = '#4a2620'
      g.lineWidth = 3
      g.strokeRect(ox, oy, gw, gh)
      // Coordinates every 10 cells.
      g.fillStyle = '#7d5f58'
      g.font = '20px sans-serif'
      for (let x = 10; x <= p.width; x += 10) g.fillText(String(x), ox + x * cell, oy - 14)
      g.textAlign = 'right'
      for (let y = 10; y <= p.height; y += 10) g.fillText(String(y), ox - 10, oy + y * cell)

      // Materials list.
      const ly = oy + gh + 70
      g.textAlign = 'left'
      g.fillStyle = '#4a2620'
      g.font = 'bold 32px sans-serif'
      g.fillText('材料清单（编号 · 色号 · 颗数）', M, ly)
      const colW = (W - M * 2) / cols
      legend.forEach((l, i) => {
        const x = M + (i % cols) * colW
        const y = ly + 30 + Math.floor(i / cols) * rowH
        const col = pal.colors[l.color].rgb as Rgb
        g.fillStyle = rgb(col)
        g.fillRect(x, y, 40, 40)
        g.strokeStyle = 'rgba(0,0,0,0.3)'
        g.lineWidth = 1
        g.strokeRect(x + 0.5, y + 0.5, 40, 40)
        g.fillStyle = onColor(col)
        g.font = 'bold 20px sans-serif'
        g.textAlign = 'center'
        g.fillText(String(l.number), x + 20, y + 21)
        g.textAlign = 'left'
        g.fillStyle = '#4a2620'
        g.font = 'bold 26px sans-serif'
        g.fillText(pal.colors[l.color].code, x + 54, y + 21)
        g.fillStyle = '#7d5f58'
        g.font = '26px sans-serif'
        g.fillText(`× ${l.count}`, x + 150, y + 21)
      })

      const file = await new Promise<string>((resolve, reject) =>
        wx.canvasToTempFilePath({ canvas: c, fileType: 'png', success: (r) => resolve(r.tempFilePath), fail: reject } as WechatMiniprogram.CanvasToTempFilePathOption),
      )
      wx.hideLoading()
      this.setData({ rendering: false })
      wx.saveImageToPhotosAlbum({
        filePath: file,
        success: () => wx.showToast({ title: '图纸已保存到相册', icon: 'success' }),
        fail: (err) => {
          if (/auth|deny/i.test(err.errMsg))
            wx.showModal({ title: '需要相册权限', content: '允许保存到相册后才能存图纸', confirmText: '去设置', success: (r) => r.confirm && wx.openSetting({}) })
          else wx.previewImage({ urls: [file] }) // long-press to save
        },
      })
    } catch (e) {
      console.error(e)
      wx.hideLoading()
      this.setData({ rendering: false })
      wx.showModal({ title: '图纸没生成成功', content: String((e as Error)?.message ?? e).slice(0, 200), showCancel: false })
    }
  },
})
