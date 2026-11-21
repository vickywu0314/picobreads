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
    // Ordering finished pieces isn't open yet (price and WeChat Pay to come).
    wx.showModal({
      title: '成品购买即将开放',
      content: '这个作品已经存在「我的 → 拼好的」里，开放后可以直接从那里下单。',
      confirmText: '去看看',
      cancelText: '知道了',
      success: (r) => r.confirm && wx.switchTab({ url: '/pages/mine/index' }),
    })
  },

  share() {
    void shareCurrent()
  },

  later() {
    wx.switchTab({ url: '/pages/mine/index' })
  },
})
