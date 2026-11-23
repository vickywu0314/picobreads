"use strict";
var import_api = require("../../utils/api");
var import_config = require("../../utils/config");
var import_png = require("../../utils/png");
var import_generate = require("../../utils/generate");
var import_store = require("../../utils/store");
var import_actions = require("../../utils/actions");
var import_shop = require("../../utils/shop");
Page({
  data: { user: null, initial: "", drafts: [], groups: [], loading: false, orders: [] },
  raw: [],
  onShow() {
    var _a;
    const user = (0, import_api.getUser)();
    this.setData({ user, initial: user ? (_a = [...(user.name || "?").trim()][0]) != null ? _a : "?" : "" });
    if (user) {
      void this.loadDrafts();
      void this.loadOrders();
    } else this.setData({ drafts: [], groups: [], orders: [] });
  },
  async login() {
    try {
      wx.showLoading({ title: "\u767B\u5F55\u4E2D\u2026", mask: true });
      await (0, import_api.login)();
      wx.hideLoading();
      this.onShow();
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: (0, import_api.errorText)(e), icon: "none" });
    }
  },
  logout() {
    wx.showModal({
      title: "\u9000\u51FA\u767B\u5F55\uFF1F",
      content: "\u8349\u7A3F\u90FD\u4FDD\u5B58\u5728\u8D26\u53F7\u91CC\uFF0C\u4E0B\u6B21\u767B\u5F55\u8FD8\u5728\u3002",
      success: (r) => {
        if (!r.confirm) return;
        (0, import_api.api)("/auth/logout", { data: {} }).catch(() => {
        });
        (0, import_api.clearSession)();
        this.onShow();
      }
    });
  },
  async setName(e) {
    var _a;
    const name = String(e.detail.value || "").trim();
    if (!name || name === ((_a = this.data.user) == null ? void 0 : _a.name)) return;
    try {
      const user = await (0, import_api.updateProfile)(name);
      this.setData({ user, initial: [...name][0] });
      wx.showToast({ title: "\u6635\u79F0\u5DF2\u66F4\u65B0", icon: "success" });
    } catch (err) {
      wx.showToast({ title: (0, import_api.errorText)(err), icon: "none" });
    }
  },
  async loadDrafts() {
    this.setData({ loading: !this.raw.length });
    try {
      const { designs } = await (0, import_api.api)("/designs");
      this.raw = designs.filter((d) => {
        var _a, _b;
        return (_b = (_a = d.data) == null ? void 0 : _a.pattern) == null ? void 0 : _b.cells;
      });
      const rows = this.raw.map((d, i) => {
        var _a, _b, _c;
        const p = d.data.pattern;
        const total = p.cells.filter((c) => c >= 0).length;
        const done = [...(_a = d.data.placed) != null ? _a : ""].filter((c, i2) => c === "1" && p.cells[i2] >= 0).length;
        return {
          id: d.id,
          name: d.name,
          size: `${p.width}\xD7${p.height} \xB7 \u2248 ${(0, import_config.sizeCm)(p.width, p.height, (_c = (_b = d.data.settings) == null ? void 0 : _b.beadSize) != null ? _c : "2.6mm")} cm`,
          updated: new Date(d.updatedAt).toLocaleDateString("zh-CN"),
          // 100 only when every bead is placed (99.6 % must not count as finished).
          pct: !total ? 0 : done >= total ? 100 : Math.min(99, Math.round(done / total * 100)),
          thumb: (0, import_png.patternImage)(`draft-${i}`, p, (0, import_generate.palette)(), 220),
          i
        };
      });
      this.setData({
        loading: false,
        drafts: rows,
        groups: [
          { title: "\u62FC\u597D\u7684", items: rows.filter((r) => r.pct === 100) },
          { title: "\u62FC\u5230\u4E00\u534A\u7684", items: rows.filter((r) => r.pct < 100) }
        ]
      });
    } catch (e) {
      this.setData({ loading: false });
      wx.showToast({ title: (0, import_api.errorText)(e), icon: "none" });
    }
  },
  async loadOrders() {
    try {
      const { orders } = await (0, import_api.api)("/orders");
      this.setData({
        orders: orders.map((o, i) => {
          var _a;
          return {
            id: o.id,
            title: import_shop.FORM_NAME[o.form],
            name: o.name,
            size: `${o.pattern.width}\xD7${o.pattern.height}`,
            date: new Date(o.createdAt).toLocaleDateString("zh-CN"),
            amount: (0, import_shop.yuan)(o.amountFen),
            status: (_a = import_shop.STATUS_NAME[o.status]) != null ? _a : o.status,
            paid: o.status === "paid" || o.status === "shipped",
            pending: o.status === "pending",
            thumb: (0, import_png.patternImage)(`order-${i}`, { ...o.pattern, id: o.id }, (0, import_generate.palette)(), 160)
          };
        })
      });
    } catch (e) {
    }
  },
  openOrder(e) {
    wx.navigateTo({ url: `/pages/order/index?id=${e.currentTarget.dataset.id}` });
  },
  /** Load a draft as the current work (without leaving the page). */
  useDraft(d) {
    var _a, _b, _c, _d;
    const s = (_a = d.data.settings) != null ? _a : {};
    (0, import_store.setWork)({
      pattern: d.data.pattern,
      placed: d.data.placed && d.data.placed.length === d.data.pattern.cells.length ? d.data.placed : "0".repeat(d.data.pattern.cells.length),
      beadSize: (_b = s.beadSize) != null ? _b : "2.6mm",
      tier: (_c = s.tier) != null ? _c : "small",
      look: (_d = s.look) != null ? _d : "classic",
      draftId: d.id,
      name: d.name
    });
  },
  open(e) {
    this.useDraft(this.raw[Number(e.currentTarget.dataset.i)]);
    wx.navigateTo({ url: "/pages/bead/index" });
  },
  /** Buy the kit / the finished piece for a saved work (half done or finished). */
  buy(e) {
    this.useDraft(this.raw[Number(e.currentTarget.dataset.i)]);
    wx.navigateTo({ url: `/pages/product/index?form=${e.currentTarget.dataset.form === "kit" ? "kit" : "finished"}` });
  },
  share(e) {
    var _a, _b;
    const d = this.raw[Number(e.currentTarget.dataset.i)];
    void (0, import_actions.sharePiece)({ name: d.name, pattern: d.data.pattern, placed: d.data.placed, beadSize: (_b = (_a = d.data.settings) == null ? void 0 : _a.beadSize) != null ? _b : "2.6mm" });
  },
  remove(e) {
    const d = this.raw[Number(e.currentTarget.dataset.i)];
    wx.showModal({
      title: "\u5220\u9664\u8FD9\u4E2A\u8349\u7A3F\uFF1F",
      content: d.name,
      confirmColor: "#d93d72",
      success: async (r) => {
        if (!r.confirm) return;
        try {
          await (0, import_api.api)(`/designs/${d.id}`, { method: "DELETE", data: {} });
          void this.loadDrafts();
        } catch (err) {
          wx.showToast({ title: (0, import_api.errorText)(err), icon: "none" });
        }
      }
    });
  },
  newOne() {
    wx.switchTab({ url: "/pages/index/index" });
  }
});
