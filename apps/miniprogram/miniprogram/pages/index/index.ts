import { getWork, startWork } from '../../utils/store'
import { sizeCm } from '../../utils/config'

const RATIOS = [
  { label: '正方形 1:1', scale: '1:1' },
  { label: '竖版 3:4', scale: '3:4' },
  { label: '横版 4:3', scale: '4:3' },
] as const

/** Keep one saved photo at a time (the user folder is limited). */
function savePhoto(temp: string): Promise<string> {
  const fs = wx.getFileSystemManager()
  const prev = getWork().photo
  return new Promise((resolve) => {
    fs.saveFile({
      tempFilePath: temp,
      success: (r) => {
        if (prev && prev !== r.savedFilePath) fs.removeSavedFile({ filePath: prev, fail: () => {} })
        resolve(r.savedFilePath)
      },
      fail: () => resolve(temp),
    })
  })
}

Page({
  data: { hasWork: false, workInfo: '' },

  onShow() {
    const w = getWork()
    if (w.pattern) {
      const done = [...w.placed].filter((c) => c === '1').length
      const total = w.pattern.cells.filter((c) => c >= 0).length
      this.setData({ hasWork: true, workInfo: `${w.pattern.width}×${w.pattern.height} · ≈ ${sizeCm(w.pattern.width, w.pattern.height, w.beadSize)} cm · 已拼 ${total ? Math.round((done / total) * 100) : 0}%` })
    } else this.setData({ hasWork: false })
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const src = res.tempFiles[0].tempFilePath
        wx.showActionSheet({
          itemList: RATIOS.map((r) => r.label),
          success: ({ tapIndex }) => this.crop(src, RATIOS[tapIndex].scale),
        })
      },
    })
  },

  crop(src: string, scale: '1:1' | '3:4' | '4:3') {
    const go = async (path: string) => {
      wx.getImageInfo({
        src: path,
        success: async (info) => {
          startWork(await savePhoto(path), info.width / info.height)
          wx.navigateTo({ url: '/pages/create/index' })
        },
        fail: () => wx.showToast({ title: '读不出这张照片', icon: 'none' }),
      })
    }
    if (!wx.cropImage) return go(src) // very old WeChat: use the photo as is
    wx.cropImage({ src, cropScale: scale, success: (r) => go(r.tempFilePath), fail: () => {} })
  },

  resume() {
    wx.navigateTo({ url: '/pages/bead/index' })
  },
})
