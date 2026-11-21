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
    wx.showModal({
      title: "\u6210\u54C1\u8D2D\u4E70\u5373\u5C06\u5F00\u653E",
      content: "\u8FD9\u4E2A\u4F5C\u54C1\u5DF2\u7ECF\u5B58\u5728\u300C\u6211\u7684 \u2192 \u62FC\u597D\u7684\u300D\u91CC\uFF0C\u5F00\u653E\u540E\u53EF\u4EE5\u76F4\u63A5\u4ECE\u90A3\u91CC\u4E0B\u5355\u3002",
      confirmText: "\u53BB\u770B\u770B",
      cancelText: "\u77E5\u9053\u4E86",
      success: (r) => r.confirm && wx.switchTab({ url: "/pages/mine/index" })
    });
  },
  share() {
    void (0, import_actions.shareCurrent)();
  },
  later() {
    wx.switchTab({ url: "/pages/mine/index" });
  }
});
