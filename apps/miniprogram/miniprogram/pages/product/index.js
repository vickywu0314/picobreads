"use strict";
var import_config = require("../../utils/config");
var import_draw = require("../../utils/draw");
var import_png = require("../../utils/png");
var import_generate = require("../../utils/generate");
var import_store = require("../../utils/store");
var import_api = require("../../utils/api");
var import_shop = require("../../utils/shop");
Page({
  data: {
    stats: [],
    legend: [],
    listOpen: false,
    thumb: "",
    rendering: false,
    form: "digital",
    forms: [],
    address: null,
    formName: "",
    itemPrice: "",
    shipping: "",
    total: "",
    paying: false,
    started: false
  },
  shop: null,
  wanted: "digital",
  onLoad(q) {
    this.wanted = q.form === "kit" || q.form === "finished" ? q.form : "digital";
    const w = (0, import_store.getWork)();
    const p = w.pattern;
    if (!p) {
      wx.showToast({ title: "\u5148\u751F\u6210\u4E00\u5F20\u56FE\u7EB8", icon: "none" });
      setTimeout(() => wx.switchTab({ url: "/pages/index/index" }), 800);
      return;
    }
    const pal = (0, import_generate.palette)();
    const legend = (0, import_generate.legendOf)(p);
    this.setData({
      thumb: (0, import_png.patternImage)("product", p, pal, 300),
      stats: [
        { k: "\u5C3A\u5BF8", v: `${p.width} \xD7 ${p.height} \u683C` },
        { k: "\u6210\u54C1\u5927\u5C0F", v: `\u2248 ${(0, import_config.sizeCm)(p.width, p.height, w.beadSize)} cm` },
        { k: "\u5E95\u677F", v: `${(0, import_config.boardCount)(p.width, p.height, w.beadSize)} \u5757\uFF0827 \xD7 27 cm\uFF09` },
        { k: "\u8C46\u5B50", v: `MARD \xB7 ${w.beadSize === "5mm" ? "\u6807\u51C6\u8C46 5 mm" : "\u8FF7\u4F60\u8C46 2.6 mm"}` },
        { k: "\u989C\u8272 / \u9897\u6570", v: `${legend.length} \u8272 \xB7 ${(0, import_generate.beadCount)(p)} \u9897` }
      ],
      legend: legend.map((l) => ({ code: pal.colors[l.color].code, hex: (0, import_draw.rgb)(pal.colors[l.color].rgb), count: l.count }))
    });
  },
  onShow() {
    this.setData({ started: (0, import_store.getWork)().placed.includes("1") });
    void this.refreshShop();
  },
  /** Which forms are open and their prices for this pattern's size. */
  async refreshShop() {
    const w = (0, import_store.getWork)();
    if (!w.pattern) return;
    const shop = this.shop = await (0, import_shop.loadShop)();
    const tier = (0, import_shop.tierOf)(w.pattern, w.beadSize);
    const price = (f) => shop.forms[f].open ? (0, import_shop.yuan)(shop.forms[f].prices[tier]) : "";
    this.setData({
      forms: [
        { id: "digital", icon: "\u2B07", title: "\u514D\u8D39\u4E0B\u8F7D\u56FE\u7EB8", body: "\u56FE\u7EB8\u603B\u89C8 + \u6750\u6599\u6E05\u5355\uFF0C\u4FDD\u5B58\u5230\u76F8\u518C\uFF0C\u7528\u4F60\u81EA\u5DF1\u7684\u8C46\u5B50\u62FC\u3002", open: true, price: "\u514D\u8D39" },
        { id: "kit", icon: "\u{1F4E6}", title: "\u8D2D\u4E70\u6750\u6599\u5305", body: "\u6309\u56FE\u7EB8\u6570\u597D\u7684\u8C46\u5B50\uFF08\u591A 10% \u5907\u7528\uFF09\u3001\u5E95\u677F\u3001\u71A8\u70EB\u7EB8\u548C\u6253\u5370\u597D\u7684\u56FE\u7EB8\u3002", open: shop.forms.kit.open, price: price("kit") },
        { id: "finished", icon: "\u2728", title: "\u76F4\u63A5\u8D2D\u4E70\u6210\u54C1", body: "\u6211\u4EEC\u5E2E\u4F60\u62FC\u597D\u3001\u71A8\u70EB\u597D\uFF0C\u6536\u5230\u5C31\u80FD\u76F4\u63A5\u9001\u4EBA\u3002", open: shop.forms.finished.open, price: price("finished") }
      ]
    });
    const want = this.wanted;
    this.wanted = "digital";
    if (want !== "digital") {
      if (shop.forms[want].open) this.select(want);
      else wx.showToast({ title: `${import_shop.FORM_NAME[want]}\u5373\u5C06\u5F00\u653E`, icon: "none" });
    } else if (this.data.form !== "digital") this.select(this.data.form);
  },
  select(form) {
    const w = (0, import_store.getWork)();
    const shop = this.shop;
    if (form === "digital" || !shop || !w.pattern) return this.setData({ form: "digital" });
    const item = shop.forms[form].prices[(0, import_shop.tierOf)(w.pattern, w.beadSize)];
    this.setData({ form, formName: import_shop.FORM_NAME[form], itemPrice: (0, import_shop.yuan)(item), shipping: shop.shippingFen ? (0, import_shop.yuan)(shop.shippingFen) : "\u5305\u90AE", total: (0, import_shop.yuan)(item + shop.shippingFen) });
  },
  pick(e) {
    const id = e.currentTarget.dataset.id;
    const f = this.data.forms.find((x) => x.id === id);
    if (!(f == null ? void 0 : f.open)) return wx.showToast({ title: "\u5373\u5C06\u5F00\u653E\uFF0C\u656C\u8BF7\u671F\u5F85", icon: "none" });
    this.select(id);
  },
  async chooseAddress() {
    const a = await (0, import_shop.chooseAddress)();
    if (a) this.setData({ address: a });
  },
  async pay() {
    const w = (0, import_store.getWork)();
    const form = this.data.form;
    if (form === "digital" || !w.pattern) return;
    let address = this.data.address;
    if (!address) {
      address = await (0, import_shop.chooseAddress)();
      if (!address) return wx.showToast({ title: "\u8BF7\u5148\u9009\u62E9\u6536\u8D27\u5730\u5740", icon: "none" });
      this.setData({ address });
    }
    this.setData({ paying: true });
    wx.showLoading({ title: "\u6B63\u5728\u4E0B\u5355\u2026", mask: true });
    try {
      const order = await (0, import_shop.buy)({ form, name: w.name || "\u6211\u7684\u62FC\u8C46", pattern: w.pattern, placed: w.placed, beadSize: w.beadSize, address });
      wx.hideLoading();
      wx.showModal({
        title: order.status === "paid" ? "\u652F\u4ED8\u6210\u529F \u{1F389}" : "\u5DF2\u63D0\u4EA4",
        content: order.status === "paid" ? "\u6211\u4EEC\u5F00\u59CB\u51C6\u5907\u4E86\uFF0C\u8BA2\u5355\u5728\u300C\u6211\u7684 \u2192 \u6211\u7684\u8BA2\u5355\u300D\u91CC\u53EF\u4EE5\u770B\u5230\u3002" : "\u4ED8\u6B3E\u7ED3\u679C\u8FD8\u5728\u786E\u8BA4\uFF0C\u7A0D\u540E\u5728\u300C\u6211\u7684 \u2192 \u6211\u7684\u8BA2\u5355\u300D\u91CC\u67E5\u770B\u3002",
        showCancel: false,
        confirmText: "\u770B\u8BA2\u5355",
        success: () => wx.switchTab({ url: "/pages/mine/index" })
      });
    } catch (e) {
      wx.hideLoading();
      if (e.message !== "cancelled") wx.showToast({ title: (0, import_api.errorText)(e), icon: "none" });
    } finally {
      this.setData({ paying: false });
    }
  },
  toggleList() {
    this.setData({ listOpen: !this.data.listOpen });
  },
  edit() {
    wx.navigateBack();
  },
  bead() {
    wx.navigateTo({ url: "/pages/bead/index" });
  },
  /** One picture with the whole pattern (color numbers in the cells when they fit) and the materials list. */
  async saveSheet() {
    var _a, _b;
    const w = (0, import_store.getWork)();
    const p = w.pattern;
    wx.showLoading({ title: "\u751F\u6210\u56FE\u7EB8\u2026", mask: true });
    try {
      await new Promise((resolve) => this.setData({ rendering: true }, resolve));
      const h = await (0, import_draw.getCanvas)(this, "#sheet");
      const pal = (0, import_generate.palette)();
      const legend = (0, import_generate.legendOf)(p);
      const numbers = new Map(legend.map((l) => [l.color, l.number]));
      const M = 60;
      const cell = Math.max(6, Math.min(34, Math.floor(1800 / Math.max(p.width, p.height))));
      const gw = p.width * cell;
      const gh = p.height * cell;
      const W = Math.max(gw + M * 2, 1e3);
      const cols = 3;
      const rowH = 54;
      const rows = Math.ceil(legend.length / cols);
      const top = 150;
      const H = top + gh + 110 + rows * rowH + M;
      const c = h.canvas;
      c.width = W;
      c.height = H;
      const g = h.ctx;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, W, H);
      g.textBaseline = "alphabetic";
      g.textAlign = "left";
      g.fillStyle = "#4a2620";
      g.font = "bold 44px sans-serif";
      g.fillText("BeadSpark \u62FC\u8C46\u56FE\u7EB8", M, 70);
      g.fillStyle = "#7d5f58";
      g.font = "26px sans-serif";
      g.fillText(`${p.width} \xD7 ${p.height} \u683C \xB7 \u2248 ${(0, import_config.sizeCm)(p.width, p.height, w.beadSize)} cm \xB7 ${legend.length} \u8272 \xB7 ${(0, import_generate.beadCount)(p)} \u9897 \xB7 MARD ${w.beadSize}`, M, 112);
      const ox = Math.round((W - gw) / 2);
      const oy = top;
      const showNum = cell >= 16;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `bold ${Math.floor(cell * 0.46)}px sans-serif`;
      for (let y = 0; y < p.height; y++) {
        for (let x = 0; x < p.width; x++) {
          const ci = p.cells[y * p.width + x];
          const px = ox + x * cell;
          const py = oy + y * cell;
          if (ci < 0) {
            g.strokeStyle = "#d9cfc9";
            g.lineWidth = 1;
            g.beginPath();
            g.arc(px + cell / 2, py + cell / 2, Math.max(1, cell * 0.12), 0, Math.PI * 2);
            g.stroke();
            continue;
          }
          const col = pal.colors[ci].rgb;
          g.fillStyle = (0, import_draw.rgb)(col);
          g.fillRect(px, py, cell, cell);
          if (showNum) {
            g.fillStyle = (0, import_draw.onColor)(col);
            g.fillText(String((_a = numbers.get(ci)) != null ? _a : ""), px + cell / 2, py + cell / 2 + 1);
          }
        }
      }
      const line = (every, color, width) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.beginPath();
        for (let x = 0; x <= p.width; x += every) {
          g.moveTo(ox + x * cell + 0.5, oy);
          g.lineTo(ox + x * cell + 0.5, oy + gh);
        }
        for (let y = 0; y <= p.height; y += every) {
          g.moveTo(ox, oy + y * cell + 0.5);
          g.lineTo(ox + gw, oy + y * cell + 0.5);
        }
        g.stroke();
      };
      if (cell >= 10) line(1, "rgba(0,0,0,0.12)", 1);
      line(5, "rgba(0,0,0,0.28)", 1);
      line(10, "rgba(0,0,0,0.55)", 2);
      line(import_config.BOARD_PEGS[w.beadSize], "#d93d72", 3);
      g.strokeStyle = "#4a2620";
      g.lineWidth = 3;
      g.strokeRect(ox, oy, gw, gh);
      g.fillStyle = "#7d5f58";
      g.font = "20px sans-serif";
      for (let x = 10; x <= p.width; x += 10) g.fillText(String(x), ox + x * cell, oy - 14);
      g.textAlign = "right";
      for (let y = 10; y <= p.height; y += 10) g.fillText(String(y), ox - 10, oy + y * cell);
      const ly = oy + gh + 70;
      g.textAlign = "left";
      g.fillStyle = "#4a2620";
      g.font = "bold 32px sans-serif";
      g.fillText("\u6750\u6599\u6E05\u5355\uFF08\u7F16\u53F7 \xB7 \u8272\u53F7 \xB7 \u9897\u6570\uFF09", M, ly);
      const colW = (W - M * 2) / cols;
      legend.forEach((l, i) => {
        const x = M + i % cols * colW;
        const y = ly + 30 + Math.floor(i / cols) * rowH;
        const col = pal.colors[l.color].rgb;
        g.fillStyle = (0, import_draw.rgb)(col);
        g.fillRect(x, y, 40, 40);
        g.strokeStyle = "rgba(0,0,0,0.3)";
        g.lineWidth = 1;
        g.strokeRect(x + 0.5, y + 0.5, 40, 40);
        g.fillStyle = (0, import_draw.onColor)(col);
        g.font = "bold 20px sans-serif";
        g.textAlign = "center";
        g.fillText(String(l.number), x + 20, y + 21);
        g.textAlign = "left";
        g.fillStyle = "#4a2620";
        g.font = "bold 26px sans-serif";
        g.fillText(pal.colors[l.color].code, x + 54, y + 21);
        g.fillStyle = "#7d5f58";
        g.font = "26px sans-serif";
        g.fillText(`\xD7 ${l.count}`, x + 150, y + 21);
      });
      const file = await new Promise(
        (resolve, reject) => wx.canvasToTempFilePath({ canvas: c, fileType: "png", success: (r) => resolve(r.tempFilePath), fail: reject })
      );
      wx.hideLoading();
      this.setData({ rendering: false });
      wx.saveImageToPhotosAlbum({
        filePath: file,
        success: () => wx.showToast({ title: "\u56FE\u7EB8\u5DF2\u4FDD\u5B58\u5230\u76F8\u518C", icon: "success" }),
        fail: (err) => {
          if (/auth|deny/i.test(err.errMsg))
            wx.showModal({ title: "\u9700\u8981\u76F8\u518C\u6743\u9650", content: "\u5141\u8BB8\u4FDD\u5B58\u5230\u76F8\u518C\u540E\u624D\u80FD\u5B58\u56FE\u7EB8", confirmText: "\u53BB\u8BBE\u7F6E", success: (r) => r.confirm && wx.openSetting({}) });
          else wx.previewImage({ urls: [file] });
        }
      });
    } catch (e) {
      console.error(e);
      wx.hideLoading();
      this.setData({ rendering: false });
      wx.showModal({ title: "\u56FE\u7EB8\u6CA1\u751F\u6210\u6210\u529F", content: String((_b = e == null ? void 0 : e.message) != null ? _b : e).slice(0, 200), showCancel: false });
    }
  }
});
