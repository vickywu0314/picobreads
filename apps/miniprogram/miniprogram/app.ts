// BeadSpark mini program: photo → bead pattern → bead online → share.
import { getToken, login } from './utils/api'
import { cleanPictures } from './utils/png'

App({
  onLaunch() {
    cleanPictures()
    // WeChat sign-in needs no tap from the user: do it quietly when the mini program opens.
    if (!getToken()) login().catch((e) => console.warn('[login] silent sign-in failed:', e && e.code))
    // Keep the mini program up to date: apply a downloaded new version on next launch.
    const m = wx.getUpdateManager?.()
    m?.onUpdateReady(() => {
      wx.showModal({ title: '有新版本', content: '新版本已经准备好，重启一下就能用', showCancel: false, success: () => m.applyUpdate() })
    })
  },
})
