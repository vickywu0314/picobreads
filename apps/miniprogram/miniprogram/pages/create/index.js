"use strict";
var import_config = require("../../utils/config");
var import_draw = require("../../utils/draw");
var import_generate = require("../../utils/generate");
var import_store = require("../../utils/store");
const autoPicked = /* @__PURE__ */ new Set();
Page({
  data: {
    beadSizes: import_config.BEAD_SIZES,
    bead: "2.6mm",
    beadHint: "",
    removeBg: true,
    trim: true,
    options: [],
    view: "final",
    photo: "",
    previewInfo: "",
    loose: false,
    subjectPct: 100,
    canGo: false
  },
  // Not in data (not rendered): generated patterns and canvases.
  patterns: {},
  canvases: {},
  run: 0,
  perSide: 0,
  onLoad() {
    const w = (0, import_store.getWork)();
    if (!w.photo) {
      wx.showToast({ title: "\u5148\u9009\u4E00\u5F20\u7167\u7247", icon: "none" });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }
    this.setData({ bead: w.beadSize, beadHint: import_config.BEAD_SIZES.find((b) => b.id === w.beadSize).hint, removeBg: w.removeBg, trim: w.trim, photo: w.photo });
    void this.generateAll();
  },
  onUnload() {
    this.run++;
  },
  /** Optimistic labels first, then generate the four results one by one (main thread, so with pauses). */
  async generateAll() {
    const run = ++this.run;
    const w = (0, import_store.getWork)();
    this.patterns = {};
    this.perSide = 0;
    this.setData({ options: this.optionViews(), canGo: false, previewInfo: "\u751F\u6210\u4E2D\u2026" });
    const keys = (0, import_generate.optionKeys)();
    const order = [...keys].sort((a, b) => Number(this.isSelected(b.key)) - Number(this.isSelected(a.key)));
    for (const o of order) {
      await (0, import_generate.yieldUI)();
      if (run !== this.run) return;
      try {
        this.patterns[o.key] = await (0, import_generate.generate)(w, o.tier, o.look);
      } catch (e) {
        console.error(e);
        this.patterns[o.key] = null;
      }
      if (run !== this.run) return;
      await this.drawOption(o.key);
      this.setData({ options: this.optionViews() });
      if (this.isSelected(o.key)) await this.refreshPreview();
    }
    await (0, import_generate.yieldUI)();
    const plain = ["small", "standard", "large"].map((t) => this.patterns[`${t}-classic`]).filter(Boolean);
    if (run !== this.run || plain.length < 3) return;
    const advice = await (0, import_generate.recommend)(w, plain);
    this.perSide = advice.perSide;
    const key = `${w.photo}|${w.beadSize}|${w.trim}|${w.removeBg}`;
    if (!autoPicked.has(key)) {
      autoPicked.add(key);
      const tier = ["small", "standard", "large"][advice.perSide - 1];
      (0, import_store.setWork)({ tier, look: "classic" });
    }
    this.setData({ options: this.optionViews(), loose: !w.trim && advice.subjectShare < 0.45, subjectPct: Math.round(advice.subjectShare * 100) });
    await this.refreshPreview();
  },
  isSelected(key) {
    const w = (0, import_store.getWork)();
    return w.look === "pixel" ? key === "pixel" : key === `${w.tier}-classic`;
  },
  optionViews() {
    const w = (0, import_store.getWork)();
    return (0, import_generate.optionKeys)().map((o) => {
      const p = this.patterns[o.key];
      const per = (0, import_config.perSideOf)(o.tier);
      const n = p ? (0, import_config.boardCount)(p.width, p.height, w.beadSize) : 0;
      const isPixel = o.look === "pixel";
      const note = isPixel ? "\u5927\u8272\u5757\u3001\u5C11\u788E\u8272\u3001\u4FDD\u7559\u4E3B\u4F53\u7279\u5F81" : !this.perSide || per === this.perSide ? "" : per > this.perSide ? "\u66F4\u5927\uFF0C\u4F46\u4E0D\u4F1A\u66F4\u6E05\u695A" : "\u4F1A\u4E22\u6389\u4E00\u4E9B\u7EC6\u8282";
      return {
        ...o,
        title: `${isPixel ? "\u50CF\u7D20\u98CE \xB7 " : ""}${p ? `${n} \u5757\u5E95\u677F \xB7 ${p.width}\xD7${p.height}` : `${per * per} \u4E2A\u5206\u533A`}`,
        sub: p ? `\u2248 ${(0, import_config.sizeCm)(p.width, p.height, w.beadSize)} cm \xB7 ${(0, import_generate.legendOf)(p).length} \u8272` : "",
        note,
        recommended: !isPixel && this.perSide === per,
        selected: this.isSelected(o.key),
        ready: !!p
      };
    });
  },
  async canvasFor(id) {
    if (!this.canvases[id]) this.canvases[id] = await (0, import_draw.getCanvas)(this, `#${id}`);
    return this.canvases[id];
  },
  async drawOption(key) {
    const idx = (0, import_generate.optionKeys)().findIndex((o) => o.key === key);
    const p = this.patterns[key];
    const c = await this.canvasFor(`opt-${idx}`);
    if (p) (0, import_draw.drawFinished)(c.ctx, c.width, c.height, p, (0, import_generate.palette)());
    else c.ctx.clearRect(0, 0, c.width, c.height);
  },
  selectedPattern() {
    var _a;
    const w = (0, import_store.getWork)();
    return (_a = this.patterns[w.look === "pixel" ? "pixel" : `${w.tier}-classic`]) != null ? _a : null;
  },
  async refreshPreview() {
    const p = this.selectedPattern();
    const w = (0, import_store.getWork)();
    const c = await this.canvasFor("preview");
    if (!p) return c.ctx.clearRect(0, 0, c.width, c.height);
    (0, import_draw.drawFinished)(c.ctx, c.width, c.height, p, (0, import_generate.palette)());
    this.setData({
      canGo: true,
      previewInfo: `${(0, import_config.boardCount)(p.width, p.height, w.beadSize)} \u5757\u5E95\u677F \xB7 ${p.width} \xD7 ${p.height} \xB7 \u2248 ${(0, import_config.sizeCm)(p.width, p.height, w.beadSize)} cm \xB7 ${(0, import_generate.legendOf)(p).length} \u8272 \xB7 \u5171 ${(0, import_generate.beadCount)(p)} \u9897`
    });
  },
  pick(e) {
    const key = e.currentTarget.dataset.key;
    const o = (0, import_generate.optionKeys)().find((x) => x.key === key);
    (0, import_store.setWork)({ tier: o.look === "pixel" ? import_config.PIXEL_TIER : o.tier, look: o.look });
    this.setData({ options: this.optionViews() });
    void this.refreshPreview();
  },
  setBead(e) {
    const bead = e.currentTarget.dataset.id;
    if (bead === (0, import_store.getWork)().beadSize) return;
    (0, import_store.setWork)({ beadSize: bead });
    this.setData({ bead, beadHint: import_config.BEAD_SIZES.find((b) => b.id === bead).hint });
    void this.generateAll();
  },
  setRemoveBg(e) {
    (0, import_store.setWork)({ removeBg: e.detail.value });
    this.setData({ removeBg: e.detail.value });
    void this.generateAll();
  },
  setTrim(e) {
    (0, import_store.setWork)({ trim: e.detail.value });
    this.setData({ trim: e.detail.value });
    void this.generateAll();
  },
  setView(e) {
    this.setData({ view: e.currentTarget.dataset.v });
  },
  /** Make the picked result the pattern to bead. */
  useSelected() {
    const p = this.selectedPattern();
    if (!p) return false;
    (0, import_store.applyPattern)(p);
    return true;
  },
  startBead() {
    if (this.useSelected()) wx.navigateTo({ url: "/pages/bead/index" });
  },
  next() {
    if (this.useSelected()) wx.navigateTo({ url: "/pages/product/index" });
  }
});
