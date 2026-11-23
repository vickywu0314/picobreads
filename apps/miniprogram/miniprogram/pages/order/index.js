"use strict";
var import_api = require("../../utils/api");
var import_config = require("../../utils/config");
var import_generate = require("../../utils/generate");
var import_png = require("../../utils/png");
var import_shop = require("../../utils/shop");
const time = (ms) => ms ? new Date(ms).toLocaleString("zh-CN", { hour12: false }) : "";
const TITLE = { pending: "\u7B49\u5F85\u4ED8\u6B3E", paid: "\u5DF2\u4ED8\u6B3E\uFF0C\u5236\u4F5C\u4E2D", shipped: "\u5DF2\u53D1\u8D27", refunded: "\u5DF2\u9000\u6B3E", closed: "\u8BA2\u5355\u5DF2\u53D6\u6D88" };
Page({
  data: {
    state: "loading",
    order: null,
    statusTitle: "",
    statusHint: "",
    formName: "",
    size: "",
    amount: "",
    thumb: "",
    created: "",
    paid: "",
    shipped: "",
    busy: false,
    track: null
  },
  id: "",
  onLoad(q) {
    var _a;
    this.id = (_a = q.id) != null ? _a : "";
    void this.load();
  },
  onPullDownRefresh() {
    void this.load().then(() => wx.stopPullDownRefresh());
  },
  async load() {
    try {
      this.show(await (0, import_shop.getOrder)(this.id));
    } catch (e) {
      this.setData({ state: "missing" });
    }
  },
  show(o) {
    var _a, _b;
    const p = o.pattern;
    const minutes = o.payUntil ? Math.max(0, Math.round((o.payUntil - Date.now()) / 6e4)) : 0;
    const hint = {
      pending: minutes > 0 ? `\u8BF7\u5728 ${minutes} \u5206\u949F\u5185\u5B8C\u6210\u4ED8\u6B3E\uFF0C\u8D85\u65F6\u8BA2\u5355\u4F1A\u81EA\u52A8\u53D6\u6D88\u3002` : "\u8BA2\u5355\u5373\u5C06\u8D85\u65F6\u53D6\u6D88\u3002",
      paid: o.form === "kit" ? "\u6211\u4EEC\u6B63\u5728\u6309\u56FE\u7EB8\u914D\u8C46\u5B50\uFF0C\u914D\u597D\u5C31\u53D1\u8D27\u3002" : "\u6211\u4EEC\u6B63\u5728\u6309\u56FE\u7EB8\u62FC\u548C\u71A8\u70EB\uFF0C\u505A\u597D\u5C31\u53D1\u8D27\u3002",
      shipped: "\u5305\u88F9\u5728\u8DEF\u4E0A\u4E86\uFF0C\u53EF\u4EE5\u7528\u8FD0\u5355\u53F7\u67E5\u7269\u6D41\u3002",
      refunded: "\u6B3E\u9879\u5DF2\u539F\u8DEF\u9000\u56DE\uFF0C\u5230\u8D26\u65F6\u95F4\u4EE5\u5FAE\u4FE1\u652F\u4ED8\u4E3A\u51C6\u3002",
      closed: "\u8FD9\u4E2A\u8BA2\u5355\u6CA1\u6709\u4ED8\u6B3E\uFF0C\u5DF2\u7ECF\u53D6\u6D88\u3002\u9700\u8981\u7684\u8BDD\u53EF\u4EE5\u91CD\u65B0\u4E0B\u5355\u3002"
    };
    this.setData({
      state: "ok",
      order: o,
      statusTitle: (_a = TITLE[o.status]) != null ? _a : o.status,
      statusHint: (_b = hint[o.status]) != null ? _b : "",
      formName: import_shop.FORM_NAME[o.form],
      size: `${p.width}\xD7${p.height} \u683C \xB7 \u2248 ${(0, import_config.sizeCm)(p.width, p.height, o.beadSize)} cm \xB7 ${o.beadSize === "5mm" ? "\u6807\u51C6\u8C46" : "\u8FF7\u4F60\u8C46"}`,
      amount: (0, import_shop.yuan)(o.amountFen),
      thumb: this.data.thumb || (0, import_png.patternImage)("order-detail", { ...p, id: o.id }, (0, import_generate.palette)(), 260),
      created: time(o.createdAt),
      paid: time(o.paidAt),
      shipped: time(o.shippedAt)
    });
    if (o.status === "shipped") void (0, import_shop.getTracking)(o.id).then((track) => this.setData({ track: track.available ? track : null }));
  },
  async pay() {
    this.setData({ busy: true });
    wx.showLoading({ title: "\u6B63\u5728\u53D1\u8D77\u652F\u4ED8\u2026", mask: true });
    try {
      const { order, outcome } = await (0, import_shop.payOrder)(this.id);
      wx.hideLoading();
      this.show(order);
      if (outcome === "paid" && order.status === "paid") wx.showToast({ title: "\u652F\u4ED8\u6210\u529F", icon: "success" });
      else if (outcome === "pending") wx.showToast({ title: "\u4ED8\u6B3E\u7ED3\u679C\u786E\u8BA4\u4E2D\uFF0C\u4E0B\u62C9\u5237\u65B0\u770B\u770B", icon: "none" });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: (0, import_api.errorText)(e), icon: "none" });
    } finally {
      this.setData({ busy: false });
    }
  },
  cancel() {
    wx.showModal({
      title: "\u53D6\u6D88\u8FD9\u4E2A\u8BA2\u5355\uFF1F",
      content: "\u53D6\u6D88\u540E\u9700\u8981\u91CD\u65B0\u4E0B\u5355\u3002",
      confirmText: "\u53D6\u6D88\u8BA2\u5355",
      cancelText: "\u518D\u60F3\u60F3",
      confirmColor: "#d93d72",
      success: async (r) => {
        if (!r.confirm) return;
        this.setData({ busy: true });
        try {
          this.show(await (0, import_shop.cancelOrder)(this.id));
        } catch (e) {
          wx.showToast({ title: (0, import_api.errorText)(e), icon: "none" });
        } finally {
          this.setData({ busy: false });
        }
      }
    });
  },
  copyTracking() {
    const o = this.data.order;
    if (o == null ? void 0 : o.trackingNo) wx.setClipboardData({ data: o.trackingNo });
  },
  copyId() {
    wx.setClipboardData({ data: this.id });
  },
  toMine() {
    wx.switchTab({ url: "/pages/mine/index" });
  }
});
