"use strict";
var import_store = require("../../utils/store");
var import_config = require("../../utils/config");
const RATIOS = [
  { label: "\u6B63\u65B9\u5F62 1:1", scale: "1:1" },
  { label: "\u7AD6\u7248 3:4", scale: "3:4" },
  { label: "\u6A2A\u7248 4:3", scale: "4:3" }
];
function savePhoto(temp) {
  const fs = wx.getFileSystemManager();
  const prev = (0, import_store.getWork)().photo;
  return new Promise((resolve) => {
    fs.saveFile({
      tempFilePath: temp,
      success: (r) => {
        if (prev && prev !== r.savedFilePath) fs.removeSavedFile({ filePath: prev, fail: () => {
        } });
        resolve(r.savedFilePath);
      },
      fail: () => resolve(temp)
    });
  });
}
Page({
  data: { hasWork: false, workInfo: "" },
  onShow() {
    const w = (0, import_store.getWork)();
    if (w.pattern) {
      const done = [...w.placed].filter((c) => c === "1").length;
      const total = w.pattern.cells.filter((c) => c >= 0).length;
      this.setData({ hasWork: true, workInfo: `${w.pattern.width}\xD7${w.pattern.height} \xB7 \u2248 ${(0, import_config.sizeCm)(w.pattern.width, w.pattern.height, w.beadSize)} cm \xB7 \u5DF2\u62FC ${total ? Math.round(done / total * 100) : 0}%` });
    } else this.setData({ hasWork: false });
  },
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      sizeType: ["compressed"],
      success: (res) => {
        const src = res.tempFiles[0].tempFilePath;
        wx.showActionSheet({
          itemList: RATIOS.map((r) => r.label),
          success: ({ tapIndex }) => this.crop(src, RATIOS[tapIndex].scale)
        });
      }
    });
  },
  crop(src, scale) {
    const go = async (path) => {
      wx.getImageInfo({
        src: path,
        success: async (info) => {
          (0, import_store.startWork)(await savePhoto(path), info.width / info.height);
          wx.navigateTo({ url: "/pages/create/index" });
        },
        fail: () => wx.showToast({ title: "\u8BFB\u4E0D\u51FA\u8FD9\u5F20\u7167\u7247", icon: "none" })
      });
    };
    if (!wx.cropImage) return go(src);
    wx.cropImage({ src, cropScale: scale, success: (r) => go(r.tempFilePath), fail: () => {
    } });
  },
  resume() {
    wx.navigateTo({ url: "/pages/bead/index" });
  }
});
