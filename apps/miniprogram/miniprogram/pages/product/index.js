"use strict";
var import_config = require("../../utils/config");
var import_draw = require("../../utils/draw");
var import_png = require("../../utils/png");
var import_generate = require("../../utils/generate");
var import_store = require("../../utils/store");
Page({
  data: {
    stats: [],
    legend: [],
    listOpen: false,
    thumb: "",
    rendering: false
  },
  onLoad() {
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
  toggleList() {
    this.setData({ listOpen: !this.data.listOpen });
  },
  soon() {
    wx.showToast({ title: "\u5373\u5C06\u5F00\u653E\uFF0C\u656C\u8BF7\u671F\u5F85", icon: "none" });
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
