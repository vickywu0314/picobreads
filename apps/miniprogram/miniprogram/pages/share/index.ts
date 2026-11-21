import type { Pattern } from '../../lib/engine'
import { api } from '../../utils/api'
import { API_BASE, sizeCm, type BeadSize } from '../../utils/config'
import { drawFinished, getCanvas, rgb } from '../../utils/draw'
import { patternImage } from '../../utils/png'
import { beadCount, legendOf, palette } from '../../utils/generate'
import { applyPattern, setWork } from '../../utils/store'

interface Shared {
  id: string
  name: string
  author: string
  views: number
  pattern: Omit<Pattern, 'id'>
  placed?: string
  beadSize: BeadSize
}

Page({
  data: {
    state: 'loading' as 'loading' | 'missing' | 'ok',
    mine: false,
    name: '',
    author: '',
    views: 0,
    stats: '',
    colorCount: 0,
    legend: [] as { code: string; hex: string; count: number }[],
    art: '',
    rendering: false,
  },
  share: null as Shared | null,
  id: '',
  /** Share card picture (5:4), made from the art canvas. */
  cardImage: '',

  onLoad(q: Record<string, string | undefined>) {
    // From a link (?id=…) or from scanning the mini program code (scene=…).
    this.id = q.id || decodeURIComponent(q.scene || '')
    this.setData({ mine: q.mine === '1' })
    wx.showShareMenu({ withShareTicket: false, menus: ['shareAppMessage', 'shareTimeline'] })
    void this.load()
  },

  async load() {
    if (!/^[A-Za-z0-9]{6,32}$/.test(this.id)) return this.setData({ state: 'missing' })
    try {
      const s = await api<Shared>(`/shares/${this.id}`)
      this.share = s
      const p = { ...s.pattern, id: s.id } as Pattern
      const pal = palette()
      const legend = legendOf(p)
      this.setData({
        state: 'ok',
        name: s.name,
        author: s.author,
        views: s.views,
        colorCount: legend.length,
        stats: `${p.width}×${p.height} · ${legend.length} 色 · ${beadCount(p)} 颗 · ≈ ${sizeCm(p.width, p.height, s.beadSize)} cm`,
        legend: legend.map((l) => ({ code: pal.colors[l.color].code, hex: rgb(pal.colors[l.color].rgb as [number, number, number]), count: l.count })),
      })
      wx.setNavigationBarTitle({ title: s.name })
      // Also used as the picture on the share card.
      this.cardImage = patternImage('share', p, pal, 600)
      this.setData({ art: this.cardImage })
    } catch {
      this.setData({ state: 'missing' })
    }
  },

  onShareAppMessage() {
    return {
      title: this.share ? `我用 BeadSpark 拼了「${this.share.name}」，来看看！` : 'BeadSpark 拼豆：照片一键变拼豆图纸',
      path: this.id ? `/pages/share/index?id=${this.id}` : '/pages/index/index',
      imageUrl: this.cardImage || undefined,
    }
  },

  onShareTimeline() {
    return {
      title: this.share ? `「${this.share.name}」· BeadSpark 拼豆` : 'BeadSpark 拼豆',
      query: this.id ? `id=${this.id}` : '',
      imageUrl: this.cardImage || undefined,
    }
  },

  beadThis() {
    const s = this.share
    if (!s) return
    setWork({ beadSize: s.beadSize, name: s.name, photo: null })
    applyPattern({ ...s.pattern, id: `share_${s.id}` } as Pattern)
    wx.navigateTo({ url: '/pages/bead/index' })
  },

  makeMine() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  /** 1080 × 1350 poster: the piece, its name and stats, and the mini program code that opens this share. */
  async savePoster() {
    const s = this.share
    if (!s) return
    wx.showLoading({ title: '生成海报…', mask: true })
    try {
      await new Promise<void>((resolve) => this.setData({ rendering: true }, resolve))
      const h = await getCanvas(this, '#poster')
      const c = h.canvas
      c.width = 1080
      c.height = 1350
      const g = h.ctx
      g.setTransform(1, 0, 0, 1, 0, 0)
      const W = 1080
      g.fillStyle = '#fdf7f4'
      g.fillRect(0, 0, W, 1350)
      g.fillStyle = '#f9dfe4'
      g.beginPath()
      g.moveTo(108, 60)
      g.arcTo(W - 60, 60, W - 60, 940, 48)
      g.arcTo(W - 60, 940, 60, 940, 48)
      g.arcTo(60, 940, 60, 60, 48)
      g.arcTo(60, 60, W - 60, 60, 48)
      g.fill()
      g.save()
      g.translate(120, 100)
      drawFinished(g, 840, 800, { ...s.pattern, id: s.id } as Pattern, palette(), '#f9dfe4')
      g.restore()
      // pixel decoration
      ;[
        [W - 140, 90, '#f4a7bd'],
        [W - 116, 90, '#e8799b'],
        [W - 116, 114, '#f9c6d4'],
        [W - 92, 114, '#f4a7bd'],
      ].forEach(([x, y, col]) => {
        g.fillStyle = col
        g.fillRect(x, y, 22, 22)
      })
      g.textBaseline = 'alphabetic'
      g.textAlign = 'left'
      g.fillStyle = '#4a2620'
      g.font = 'bold 60px sans-serif'
      g.fillText(s.name.length > 14 ? `${s.name.slice(0, 13)}…` : s.name, 80, 1040)
      g.fillStyle = '#7d5f58'
      g.font = '32px sans-serif'
      g.fillText(this.data.stats.split(' · ').slice(0, 3).join(' · '), 80, 1095)
      g.font = 'bold 46px sans-serif'
      g.fillStyle = '#4a2620'
      g.fillText('Bead', 80, 1250)
      const bw = g.measureText('Bead').width
      g.fillStyle = '#d93d72'
      g.fillText('Spark', 80 + bw, 1250)
      g.fillStyle = '#7d5f58'
      g.font = '26px sans-serif'
      g.fillText('长按识别小程序码，看作品，也做一个你的', 80, 1295)
      // Mini program code from our server (cached there).
      const qr = await new Promise<string | null>((resolve) =>
        wx.downloadFile({ url: `${API_BASE}/api/wxmp/qrcode/${s.id}`, success: (r) => resolve(r.statusCode === 200 ? r.tempFilePath : null), fail: () => resolve(null) }),
      )
      if (qr) {
        const img = c.createImage()
        await new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = qr
        })
        g.fillStyle = '#ffffff'
        g.beginPath()
        g.arc(W - 205, 1125, 125, 0, Math.PI * 2)
        g.fill()
        g.drawImage(img, W - 315, 1015, 220, 220)
      }
      const file = await new Promise<string>((resolve, reject) =>
        wx.canvasToTempFilePath({ canvas: c, fileType: 'jpg', quality: 0.92, success: (r) => resolve(r.tempFilePath), fail: reject } as WechatMiniprogram.CanvasToTempFilePathOption),
      )
      wx.hideLoading()
      this.setData({ rendering: false })
      wx.saveImageToPhotosAlbum({
        filePath: file,
        success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: (err) => {
          if (/auth|deny/i.test(err.errMsg))
            wx.showModal({
              title: '需要相册权限',
              content: '允许保存到相册后才能存海报',
              confirmText: '去设置',
              success: (r) => r.confirm && wx.openSetting({}),
            })
          else wx.previewImage({ urls: [file] }) // let them long-press to save
        },
      })
    } catch (e) {
      console.error(e)
      wx.hideLoading()
      this.setData({ rendering: false })
      wx.showToast({ title: '海报生成失败', icon: 'none' })
    }
  },
})
