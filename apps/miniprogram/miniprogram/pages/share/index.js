"use strict";
var import_api = require("../../utils/api");
var import_config = require("../../utils/config");
var import_draw = require("../../utils/draw");
var import_png = require("../../utils/png");
var import_generate = require("../../utils/generate");
var import_store = require("../../utils/store");
Page({
  data: {
    state: "loading",
    mine: false,
    name: "",
    author: "",
    views: 0,
    stats: "",
    colorCount: 0,
    legend: [],
    art: "",
    rendering: false
  },
  share: null,
  id: "",
  /** Share card picture (5:4), made from the art canvas. */
  cardImage: "",
  onLoad(q) {
    this.id = q.id || decodeURIComponent(q.scene || "");
    this.setData({ mine: q.mine === "1" });
    wx.showShareMenu({ withShareTicket: false, menus: ["shareAppMessage", "shareTimeline"] });
    void this.load();
  },
  async load() {
    if (!/^[A-Za-z0-9]{6,32}$/.test(this.id)) return this.setData({ state: "missing" });
    try {
      const s = await (0, import_api.api)(`/shares/${this.id}`);
      this.share = s;
      const p = { ...s.pattern, id: s.id };
      const pal = (0, import_generate.palette)();
      const legend = (0, import_generate.legendOf)(p);
      this.setData({
        state: "ok",
        name: s.name,
        author: s.author,
        views: s.views,
        colorCount: legend.length,
        stats: `${p.width}\xD7${p.height} \xB7 ${legend.length} \u8272 \xB7 ${(0, import_generate.beadCount)(p)} \u9897 \xB7 \u2248 ${(0, import_config.sizeCm)(p.width, p.height, s.beadSize)} cm`,
        legend: legend.map((l) => ({ code: pal.colors[l.color].code, hex: (0, import_draw.rgb)(pal.colors[l.color].rgb), count: l.count }))
      });
      wx.setNavigationBarTitle({ title: s.name });
      this.cardImage = (0, import_png.patternImage)("share", p, pal, 600);
      this.setData({ art: this.cardImage });
    } catch (e) {
      this.setData({ state: "missing" });
    }
  },
  onShareAppMessage() {
    return {
      title: this.share ? `\u6211\u7528 BeadSpark \u62FC\u4E86\u300C${this.share.name}\u300D\uFF0C\u6765\u770B\u770B\uFF01` : "BeadSpark \u62FC\u8C46\uFF1A\u7167\u7247\u4E00\u952E\u53D8\u62FC\u8C46\u56FE\u7EB8",
      path: this.id ? `/pages/share/index?id=${this.id}` : "/pages/index/index",
      imageUrl: this.cardImage || void 0
    };
  },
  onShareTimeline() {
    return {
      title: this.share ? `\u300C${this.share.name}\u300D\xB7 BeadSpark \u62FC\u8C46` : "BeadSpark \u62FC\u8C46",
      query: this.id ? `id=${this.id}` : "",
      imageUrl: this.cardImage || void 0
    };
  },
  beadThis() {
    const s = this.share;
    if (!s) return;
    (0, import_store.setWork)({ beadSize: s.beadSize, name: s.name, photo: null });
    (0, import_store.applyPattern)({ ...s.pattern, id: `share_${s.id}` });
    wx.navigateTo({ url: "/pages/bead/index" });
  },
  makeMine() {
    wx.switchTab({ url: "/pages/index/index" });
  },
  /** 1080 × 1350 poster: the piece, its name and stats, and the mini program code that opens this share. */
  async savePoster() {
    const s = this.share;
    if (!s) return;
    wx.showLoading({ title: "\u751F\u6210\u6D77\u62A5\u2026", mask: true });
    try {
      await new Promise((resolve) => this.setData({ rendering: true }, resolve));
      const h = await (0, import_draw.getCanvas)(this, "#poster");
      const c = h.canvas;
      c.width = 1080;
      c.height = 1350;
      const g = h.ctx;
      g.setTransform(1, 0, 0, 1, 0, 0);
      const W = 1080;
      g.fillStyle = "#fdf7f4";
      g.fillRect(0, 0, W, 1350);
      g.fillStyle = "#f9dfe4";
      g.beginPath();
      g.moveTo(108, 60);
      g.arcTo(W - 60, 60, W - 60, 940, 48);
      g.arcTo(W - 60, 940, 60, 940, 48);
      g.arcTo(60, 940, 60, 60, 48);
      g.arcTo(60, 60, W - 60, 60, 48);
      g.fill();
      g.save();
      g.translate(120, 100);
      (0, import_draw.drawFinished)(g, 840, 800, { ...s.pattern, id: s.id }, (0, import_generate.palette)(), "#f9dfe4");
      g.restore();
      [
        [W - 140, 90, "#f4a7bd"],
        [W - 116, 90, "#e8799b"],
        [W - 116, 114, "#f9c6d4"],
        [W - 92, 114, "#f4a7bd"]
      ].forEach(([x, y, col]) => {
        g.fillStyle = col;
        g.fillRect(x, y, 22, 22);
      });
      g.textBaseline = "alphabetic";
      g.textAlign = "left";
      g.fillStyle = "#4a2620";
      g.font = "bold 60px sans-serif";
      g.fillText(s.name.length > 14 ? `${s.name.slice(0, 13)}\u2026` : s.name, 80, 1040);
      g.fillStyle = "#7d5f58";
      g.font = "32px sans-serif";
      g.fillText(this.data.stats.split(" \xB7 ").slice(0, 3).join(" \xB7 "), 80, 1095);
      g.font = "bold 46px sans-serif";
      g.fillStyle = "#4a2620";
      g.fillText("Bead", 80, 1250);
      const bw = g.measureText("Bead").width;
      g.fillStyle = "#d93d72";
      g.fillText("Spark", 80 + bw, 1250);
      g.fillStyle = "#7d5f58";
      g.font = "26px sans-serif";
      g.fillText("\u957F\u6309\u8BC6\u522B\u5C0F\u7A0B\u5E8F\u7801\uFF0C\u770B\u4F5C\u54C1\uFF0C\u4E5F\u505A\u4E00\u4E2A\u4F60\u7684", 80, 1295);
      const qr = await new Promise(
        (resolve) => wx.downloadFile({ url: `${import_config.API_BASE}/api/wxmp/qrcode/${s.id}`, success: (r) => resolve(r.statusCode === 200 ? r.tempFilePath : null), fail: () => resolve(null) })
      );
      if (qr) {
        const img = c.createImage();
        await new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = qr;
        });
        g.fillStyle = "#ffffff";
        g.beginPath();
        g.arc(W - 205, 1125, 125, 0, Math.PI * 2);
        g.fill();
        g.drawImage(img, W - 315, 1015, 220, 220);
      }
      const file = await new Promise(
        (resolve, reject) => wx.canvasToTempFilePath({ canvas: c, fileType: "jpg", quality: 0.92, success: (r) => resolve(r.tempFilePath), fail: reject })
      );
      wx.hideLoading();
      this.setData({ rendering: false });
      wx.saveImageToPhotosAlbum({
        filePath: file,
        success: () => wx.showToast({ title: "\u5DF2\u4FDD\u5B58\u5230\u76F8\u518C", icon: "success" }),
        fail: (err) => {
          if (/auth|deny/i.test(err.errMsg))
            wx.showModal({
              title: "\u9700\u8981\u76F8\u518C\u6743\u9650",
              content: "\u5141\u8BB8\u4FDD\u5B58\u5230\u76F8\u518C\u540E\u624D\u80FD\u5B58\u6D77\u62A5",
              confirmText: "\u53BB\u8BBE\u7F6E",
              success: (r) => r.confirm && wx.openSetting({})
            });
          else wx.previewImage({ urls: [file] });
        }
      });
    } catch (e) {
      console.error(e);
      wx.hideLoading();
      this.setData({ rendering: false });
      wx.showToast({ title: "\u6D77\u62A5\u751F\u6210\u5931\u8D25", icon: "none" });
    }
  }
});
