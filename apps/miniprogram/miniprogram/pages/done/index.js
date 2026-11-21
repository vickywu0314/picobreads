"use strict";
var import_config = require("../../utils/config");
var import_generate = require("../../utils/generate");
var import_png = require("../../utils/png");
var import_store = require("../../utils/store");
var import_actions = require("../../utils/actions");
Page({
  data: { name: "", stats: "", art: "" },
  onLoad() {
    const w = (0, import_store.getWork)();
    const p = w.pattern;
    if (!p) return void wx.switchTab({ url: "/pages/index/index" });
    this.setData({
      name: w.name || "\u6211\u7684\u62FC\u8C46",
      stats: `${p.width}\xD7${p.height} \xB7 ${(0, import_generate.legendOf)(p).length} \u8272 \xB7 ${(0, import_generate.beadCount)(p)} \u9897 \xB7 \u2248 ${(0, import_config.sizeCm)(p.width, p.height, w.beadSize)} cm`,
      art: (0, import_png.patternImage)("done", p, (0, import_generate.palette)(), 600)
    });
    void (0, import_actions.syncDraft)();
  },
  buy() {
    wx.navigateTo({ url: "/pages/product/index?form=finished" });
  },
  share() {
    void (0, import_actions.shareCurrent)();
  },
  later() {
    wx.switchTab({ url: "/pages/mine/index" });
  }
});
