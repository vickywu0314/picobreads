import type { Pattern } from '../../lib/engine'
import { errorText } from '../../utils/api'
import { sizeCm } from '../../utils/config'
import { palette } from '../../utils/generate'
import { patternImage } from '../../utils/png'
import { FORM_NAME, cancelOrder, getOrder, payOrder, yuan, type Order } from '../../utils/shop'

const time = (ms: number | null) => (ms ? new Date(ms).toLocaleString('zh-CN', { hour12: false }) : '')

const TITLE: Record<Order['status'], string> = { pending: '等待付款', paid: '已付款，制作中', shipped: '已发货', refunded: '已退款', closed: '订单已取消' }

/** One order: where it stands, what was bought, where it goes; pay later / cancel while unpaid. */
Page({
  data: {
    state: 'loading' as 'loading' | 'missing' | 'ok',
    order: null as Order | null,
    statusTitle: '',
    statusHint: '',
    formName: '',
    size: '',
    amount: '',
    thumb: '',
    created: '',
    paid: '',
    shipped: '',
    busy: false,
  },
  id: '',

  onLoad(q: Record<string, string | undefined>) {
    this.id = q.id ?? ''
    void this.load()
  },
  onPullDownRefresh() {
    void this.load().then(() => wx.stopPullDownRefresh())
  },

  async load() {
    try {
      this.show(await getOrder(this.id))
    } catch {
      this.setData({ state: 'missing' })
    }
  },

  show(o: Order) {
    const p = o.pattern
    const minutes = o.payUntil ? Math.max(0, Math.round((o.payUntil - Date.now()) / 60000)) : 0
    const hint: Record<Order['status'], string> = {
      pending: minutes > 0 ? `请在 ${minutes} 分钟内完成付款，超时订单会自动取消。` : '订单即将超时取消。',
      paid: o.form === 'kit' ? '我们正在按图纸配豆子，配好就发货。' : '我们正在按图纸拼和熨烫，做好就发货。',
      shipped: '包裹在路上了，可以用运单号查物流。',
      refunded: '款项已原路退回，到账时间以微信支付为准。',
      closed: '这个订单没有付款，已经取消。需要的话可以重新下单。',
    }
    this.setData({
      state: 'ok',
      order: o,
      statusTitle: TITLE[o.status] ?? o.status,
      statusHint: hint[o.status] ?? '',
      formName: FORM_NAME[o.form],
      size: `${p.width}×${p.height} 格 · ≈ ${sizeCm(p.width, p.height, o.beadSize)} cm · ${o.beadSize === '5mm' ? '标准豆' : '迷你豆'}`,
      amount: yuan(o.amountFen),
      thumb: this.data.thumb || patternImage('order-detail', { ...p, id: o.id } as Pattern, palette(), 260),
      created: time(o.createdAt),
      paid: time(o.paidAt),
      shipped: time(o.shippedAt),
    })
  },

  async pay() {
    this.setData({ busy: true })
    wx.showLoading({ title: '正在发起支付…', mask: true })
    try {
      const { order, outcome } = await payOrder(this.id)
      wx.hideLoading()
      this.show(order)
      if (outcome === 'paid' && order.status === 'paid') wx.showToast({ title: '支付成功', icon: 'success' })
      else if (outcome === 'pending') wx.showToast({ title: '付款结果确认中，下拉刷新看看', icon: 'none' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: errorText(e), icon: 'none' })
    } finally {
      this.setData({ busy: false })
    }
  },

  cancel() {
    wx.showModal({
      title: '取消这个订单？',
      content: '取消后需要重新下单。',
      confirmText: '取消订单',
      cancelText: '再想想',
      confirmColor: '#d93d72',
      success: async (r) => {
        if (!r.confirm) return
        this.setData({ busy: true })
        try {
          this.show(await cancelOrder(this.id))
        } catch (e) {
          wx.showToast({ title: errorText(e), icon: 'none' })
        } finally {
          this.setData({ busy: false })
        }
      },
    })
  },

  copyTracking() {
    const o = this.data.order
    if (o?.trackingNo) wx.setClipboardData({ data: o.trackingNo })
  },
  copyId() {
    wx.setClipboardData({ data: this.id })
  },
  toMine() {
    wx.switchTab({ url: '/pages/mine/index' })
  },
})
