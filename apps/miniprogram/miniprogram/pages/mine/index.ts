import type { Pattern } from '../../lib/engine'
import { api, clearSession, errorText, getUser, login, updateProfile, type User } from '../../utils/api'
import { sizeCm, type BeadSize, type Look, type TierId } from '../../utils/config'
import { patternImage } from '../../utils/png'
import { palette } from '../../utils/generate'
import { setWork } from '../../utils/store'
import { sharePiece } from '../../utils/actions'
import { FORM_NAME, STATUS_NAME, yuan, type Order } from '../../utils/shop'

interface ServerDraft {
  id: string
  name: string
  updatedAt: number
  data: { pattern: Pattern; placed?: string; settings?: { beadSize?: BeadSize; tier?: TierId; look?: Look; removeBg?: boolean; trim?: boolean } }
}

interface DraftRow {
  id: string
  name: string
  size: string
  updated: string
  pct: number
  thumb: string
  /** Index into the raw list (rows are shown in two groups). */
  i: number
}

Page({
  data: { user: null as User | null, initial: '', drafts: [] as DraftRow[], groups: [] as { title: string; items: DraftRow[] }[], loading: false, orders: [] as { id: string; title: string; name: string; size: string; date: string; amount: string; status: string; paid: boolean; thumb: string }[] },
  raw: [] as ServerDraft[],

  onShow() {
    const user = getUser()
    this.setData({ user, initial: user ? [...(user.name || '?').trim()][0] ?? '?' : '' })
    if (user) {
      void this.loadDrafts()
      void this.loadOrders()
    } else this.setData({ drafts: [], groups: [], orders: [] })
  },

  async login() {
    try {
      wx.showLoading({ title: '登录中…', mask: true })
      await login()
      wx.hideLoading()
      this.onShow()
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: errorText(e), icon: 'none' })
    }
  },

  logout() {
    wx.showModal({
      title: '退出登录？',
      content: '草稿都保存在账号里，下次登录还在。',
      success: (r) => {
        if (!r.confirm) return
        api('/auth/logout', { data: {} }).catch(() => {})
        clearSession()
        this.onShow()
      },
    })
  },

  async setName(e: WechatMiniprogram.Input) {
    const name = String(e.detail.value || '').trim()
    if (!name || name === this.data.user?.name) return
    try {
      const user = await updateProfile(name)
      this.setData({ user, initial: [...name][0] })
      wx.showToast({ title: '昵称已更新', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: errorText(err), icon: 'none' })
    }
  },

  async loadDrafts() {
    this.setData({ loading: !this.raw.length })
    try {
      const { designs } = await api<{ designs: ServerDraft[] }>('/designs')
      this.raw = designs.filter((d) => d.data?.pattern?.cells)
      const rows = this.raw.map((d, i) => {
          const p = d.data.pattern
          const total = p.cells.filter((c) => c >= 0).length
          const done = [...(d.data.placed ?? '')].filter((c, i) => c === '1' && p.cells[i] >= 0).length
          return {
            id: d.id,
            name: d.name,
            size: `${p.width}×${p.height} · ≈ ${sizeCm(p.width, p.height, d.data.settings?.beadSize ?? '2.6mm')} cm`,
            updated: new Date(d.updatedAt).toLocaleDateString('zh-CN'),
            // 100 only when every bead is placed (99.6 % must not count as finished).
            pct: !total ? 0 : done >= total ? 100 : Math.min(99, Math.round((done / total) * 100)),
            thumb: patternImage(`draft-${i}`, p, palette(), 220),
            i,
          }
        })
      this.setData({
        loading: false,
        drafts: rows,
        groups: [
          { title: '拼好的', items: rows.filter((r) => r.pct === 100) },
          { title: '拼到一半的', items: rows.filter((r) => r.pct < 100) },
        ],
      })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: errorText(e), icon: 'none' })
    }
  },

  async loadOrders() {
    try {
      const { orders } = await api<{ orders: Order[] }>('/orders')
      this.setData({
        orders: orders.map((o, i) => ({
          id: o.id,
          title: FORM_NAME[o.form],
          name: o.name,
          size: `${o.pattern.width}×${o.pattern.height}`,
          date: new Date(o.createdAt).toLocaleDateString('zh-CN'),
          amount: yuan(o.amountFen),
          status: STATUS_NAME[o.status] ?? o.status,
          paid: o.status === 'paid' || o.status === 'shipped',
          thumb: patternImage(`order-${i}`, { ...o.pattern, id: o.id } as Pattern, palette(), 160),
        })),
      })
    } catch {}
  },

  /** Load a draft as the current work (without leaving the page). */
  useDraft(d: ServerDraft) {
    const s = d.data.settings ?? {}
    setWork({
      pattern: d.data.pattern,
      placed: d.data.placed && d.data.placed.length === d.data.pattern.cells.length ? d.data.placed : '0'.repeat(d.data.pattern.cells.length),
      beadSize: s.beadSize ?? '2.6mm',
      tier: s.tier ?? 'small',
      look: s.look ?? 'classic',
      draftId: d.id,
      name: d.name,
    })
  },

  open(e: WechatMiniprogram.TouchEvent) {
    this.useDraft(this.raw[Number(e.currentTarget.dataset.i)])
    wx.navigateTo({ url: '/pages/bead/index' })
  },

  /** Buy the kit / the finished piece for a saved work (half done or finished). */
  buy(e: WechatMiniprogram.TouchEvent) {
    this.useDraft(this.raw[Number(e.currentTarget.dataset.i)])
    wx.navigateTo({ url: `/pages/product/index?form=${e.currentTarget.dataset.form === 'kit' ? 'kit' : 'finished'}` })
  },

  share(e: WechatMiniprogram.TouchEvent) {
    const d = this.raw[Number(e.currentTarget.dataset.i)]
    void sharePiece({ name: d.name, pattern: d.data.pattern, placed: d.data.placed, beadSize: d.data.settings?.beadSize ?? '2.6mm' })
  },

  remove(e: WechatMiniprogram.TouchEvent) {
    const d = this.raw[Number(e.currentTarget.dataset.i)]
    wx.showModal({
      title: '删除这个草稿？',
      content: d.name,
      confirmColor: '#d93d72',
      success: async (r) => {
        if (!r.confirm) return
        try {
          await api(`/designs/${d.id}`, { method: 'DELETE', data: {} })
          void this.loadDrafts()
        } catch (err) {
          wx.showToast({ title: errorText(err), icon: 'none' })
        }
      },
    })
  },

  newOne() {
    wx.switchTab({ url: '/pages/index/index' })
  },
})
