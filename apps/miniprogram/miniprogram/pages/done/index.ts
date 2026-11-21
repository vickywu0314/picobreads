import { sizeCm } from '../../utils/config'
import { beadCount, legendOf, palette } from '../../utils/generate'
import { patternImage } from '../../utils/png'
import { getWork } from '../../utils/store'
import { shareCurrent, syncDraft } from '../../utils/actions'

/** After the last bead: buy the finished piece first, share second, "not now" last. */
Page({
  data: { name: '', stats: '', art: '' },

  onLoad() {
    const w = getWork()
    const p = w.pattern
    if (!p) return void wx.switchTab({ url: '/pages/index/index' })
    this.setData({
      name: w.name || '我的拼豆',
      stats: `${p.width}×${p.height} · ${legendOf(p).length} 色 · ${beadCount(p)} 颗 · ≈ ${sizeCm(p.width, p.height, w.beadSize)} cm`,
      art: patternImage('done', p, palette(), 600),
    })
    void syncDraft() // make sure the finished piece is under "我的"
  },

  buy() {
    // The product page shows the price and takes the order (or says "coming soon" until it's on sale).
    wx.navigateTo({ url: '/pages/product/index?form=finished' })
  },

  share() {
    void shareCurrent()
  },

  later() {
    wx.switchTab({ url: '/pages/mine/index' })
  },
})
