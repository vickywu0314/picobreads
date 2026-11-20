// BeadSpark mini program: photo → bead pattern → bead online → share.
App({
  onLaunch() {
    // Keep the mini program up to date: apply a downloaded new version on next launch.
    const m = wx.getUpdateManager?.()
    m?.onUpdateReady(() => {
      wx.showModal({ title: '有新版本', content: '新版本已经准备好，重启一下就能用', showCancel: false, success: () => m.applyUpdate() })
    })
  },
})
