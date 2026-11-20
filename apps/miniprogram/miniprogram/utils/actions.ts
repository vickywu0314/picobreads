import type { Pattern } from '../lib/engine'
import { api, ensureLogin, errorText } from './api'
import type { BeadSize } from './config'
import { draftData, getWork, newDraftId, setWork } from './store'

/** Save the current work as a draft on the account (signs in with WeChat if needed). */
export async function saveCurrentDraft(): Promise<boolean> {
  const w = getWork()
  if (!w.pattern) return false
  try {
    await ensureLogin()
    wx.showLoading({ title: '保存中…', mask: true })
    const id = w.draftId ?? newDraftId()
    const name = w.name || `草稿 ${new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}`
    await api(`/designs/${id}`, { method: 'PUT', data: { name, data: draftData(w) } })
    setWork({ draftId: id, name })
    wx.hideLoading()
    wx.showToast({ title: '已存到草稿', icon: 'success' })
    return true
  } catch (e) {
    wx.hideLoading()
    wx.showToast({ title: errorText(e), icon: 'none' })
    return false
  }
}

/** Make a share link for a piece and open its share page (where it can be sent to friends / Moments). */
export async function sharePiece(piece: { name: string; pattern: Pattern; placed?: string; beadSize: BeadSize }) {
  try {
    await ensureLogin()
    wx.showLoading({ title: '生成分享…', mask: true })
    const r = await api<{ id: string }>('/shares', {
      data: { name: piece.name, pattern: { width: piece.pattern.width, height: piece.pattern.height, paletteId: piece.pattern.paletteId, cells: piece.pattern.cells }, placed: piece.placed, beadSize: piece.beadSize, iron: 'normal' },
    })
    wx.hideLoading()
    wx.navigateTo({ url: `/pages/share/index?id=${r.id}&mine=1` })
  } catch (e) {
    wx.hideLoading()
    wx.showToast({ title: errorText(e), icon: 'none' })
  }
}

export function shareCurrent() {
  const w = getWork()
  if (!w.pattern) return
  return sharePiece({ name: w.name || '我的拼豆', pattern: w.pattern, placed: w.placed, beadSize: w.beadSize })
}
