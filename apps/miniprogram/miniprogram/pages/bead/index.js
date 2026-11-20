"use strict";
var import_config = require("../../utils/config");
var import_draw = require("../../utils/draw");
var import_generate = require("../../utils/generate");
var import_store = require("../../utils/store");
var import_actions = require("../../utils/actions");
const MAX_SCALE = 60;
const HIT_RADIUS = 0.45;
Page({
  data: {
    pct: 0,
    done: 0,
    total: 0,
    wells: [],
    selected: null,
    selectedLabel: "\u5148\u5728\u4E0B\u9762\u9009\u4E00\u4E2A\u989C\u8272",
    mode: "place",
    canUndo: false,
    hint: ""
  },
  // Working state (not rendered by the template).
  pattern: null,
  placed: [],
  view: { scale: 8, ox: 0, oy: 0 },
  fitScale: 8,
  handle: null,
  numbers: /* @__PURE__ */ new Map(),
  totals: /* @__PURE__ */ new Map(),
  undoStack: [],
  batch: [],
  touch: null,
  frame: 0,
  saveTimer: 0,
  lastBuzz: 0,
  finishedShown: false,
  async onLoad() {
    const w = (0, import_store.getWork)();
    if (!w.pattern) {
      wx.showToast({ title: "\u5148\u751F\u6210\u4E00\u5F20\u56FE\u7EB8", icon: "none" });
      setTimeout(() => wx.switchTab({ url: "/pages/index/index" }), 800);
      return;
    }
    this.pattern = w.pattern;
    this.placed = (w.placed && w.placed.length === w.pattern.cells.length ? w.placed : "0".repeat(w.pattern.cells.length)).split("");
    const legend = (0, import_generate.legendOf)(w.pattern);
    this.numbers = new Map(legend.map((l) => [l.color, l.number]));
    this.totals = new Map(legend.map((l) => [l.color, l.count]));
    this.finishedShown = this.countDone() === this.countTotal();
    this.handle = await (0, import_draw.getCanvas)(this, "#board");
    this.fit();
    this.refreshPanel();
  },
  onUnload() {
    this.persist();
  },
  onHide() {
    this.persist();
  },
  countTotal() {
    let n = 0;
    this.totals.forEach((v) => n += v);
    return n;
  },
  countDone() {
    const p = this.pattern;
    let n = 0;
    for (let i = 0; i < p.cells.length; i++) if (p.cells[i] >= 0 && this.placed[i] === "1") n++;
    return n;
  },
  /** Progress, color wells (with beads left), labels. */
  refreshPanel() {
    var _a, _b;
    const p = this.pattern;
    const pal = (0, import_generate.palette)();
    const left = new Map(this.totals);
    for (let i = 0; i < p.cells.length; i++) if (p.cells[i] >= 0 && this.placed[i] === "1") left.set(p.cells[i], ((_a = left.get(p.cells[i])) != null ? _a : 1) - 1);
    const wells = [...this.numbers.entries()].map(([color, number]) => {
      var _a2;
      const c = pal.colors[color];
      return { color, number, code: c.code, hex: (0, import_draw.rgb)(c.rgb), text: (0, import_draw.onColor)(c.rgb), left: (_a2 = left.get(color)) != null ? _a2 : 0 };
    });
    const total = this.countTotal();
    const done = this.countDone();
    const sel = this.data.selected;
    this.setData({
      wells,
      total,
      done,
      pct: total ? Math.floor(done / total * 100) : 0,
      canUndo: this.undoStack.length > 0,
      selectedLabel: sel === null ? "\u5148\u5728\u4E0B\u9762\u9009\u4E00\u4E2A\u989C\u8272" : `${pal.colors[sel].code} \xB7 \u8FD8\u5DEE ${(_b = left.get(sel)) != null ? _b : 0} \u9897`
    });
    if (total && done === total && !this.finishedShown) {
      this.finishedShown = true;
      this.persist();
      wx.showModal({
        title: "\u62FC\u5B8C\u5566 \u{1F389}",
        content: "\u6574\u5F20\u56FE\u90FD\u62FC\u597D\u4E86\uFF01\u5206\u4EAB\u7ED9\u670B\u53CB\u770B\u770B\uFF1F",
        confirmText: "\u53BB\u5206\u4EAB",
        cancelText: "\u5148\u4E0D\u4E86",
        success: (r) => r.confirm && this.share()
      });
    }
  },
  draw() {
    if (this.frame || !this.handle) return;
    const c = this.handle;
    this.frame = c.canvas.requestAnimationFrame(() => {
      this.frame = 0;
      (0, import_draw.drawBoard)(c.ctx, c.width, c.height, this.view, { pattern: this.pattern, placed: this.placed.join(""), selected: this.data.selected, numbers: this.numbers }, (0, import_generate.palette)(), import_config.BOARD_PEGS[(0, import_store.getWork)().beadSize]);
    });
  },
  fit() {
    if (!this.handle || !this.pattern) return;
    this.view = (0, import_draw.fitView)(this.pattern, this.handle.width, this.handle.height);
    this.fitScale = this.view.scale;
    this.draw();
  },
  zoomAt(cx, cy, k) {
    const v = this.view;
    const next = Math.min(MAX_SCALE, Math.max(this.fitScale * 0.6, v.scale * k));
    const f = next / v.scale;
    v.ox = cx - (cx - v.ox) * f;
    v.oy = cy - (cy - v.oy) * f;
    v.scale = next;
    this.draw();
  },
  zoomIn() {
    this.zoomAt(this.handle.width / 2, this.handle.height / 2, 1.6);
  },
  zoomOut() {
    this.zoomAt(this.handle.width / 2, this.handle.height / 2, 1 / 1.6);
  },
  setMode(e) {
    this.setData({ mode: e.currentTarget.dataset.m });
  },
  selectColor(e) {
    const color = Number(e.currentTarget.dataset.color);
    this.setData({ selected: this.data.selected === color ? null : color });
    this.refreshPanel();
    this.draw();
    if (this.view.scale < 14 && this.handle) this.zoomAt(this.handle.width / 2, this.handle.height / 2, 14 / this.view.scale);
  },
  showHint(text) {
    this.setData({ hint: text });
    setTimeout(() => this.data.hint === text && this.setData({ hint: "" }), 1600);
  },
  /** Put a bead in the cell under the finger, if it's the selected color's spot. */
  placeAt(pt) {
    var _a;
    const p = this.pattern;
    const i = (0, import_draw.cellAt)(this.view, p, pt.x, pt.y);
    if (i < 0 || this.placed[i] === "1" || p.cells[i] < 0) return;
    const sel = this.data.selected;
    if (sel === null) {
      this.showHint("\u5148\u5728\u4E0B\u9762\u9009\u4E00\u4E2A\u989C\u8272");
      return;
    }
    if (p.cells[i] !== sel) return;
    const c = (0, import_draw.cellCenter)(this.view, p, i);
    if (Math.hypot(pt.x - c.x, pt.y - c.y) > this.view.scale * HIT_RADIUS) return;
    this.placed[i] = "1";
    this.batch.push(i);
    const now = Date.now();
    if (now - this.lastBuzz > 60) {
      this.lastBuzz = now;
      (_a = wx.vibrateShort) == null ? void 0 : _a.call(wx, { type: "light" });
    }
    this.draw();
  },
  onTouchStart(e) {
    const t = e.touches;
    if (t.length >= 2) {
      this.commitBatch();
      const a = { x: t[0].x, y: t[0].y };
      const b = { x: t[1].x, y: t[1].y };
      this.touch = { last: a, pinch: { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } } };
      return;
    }
    const pt = { x: t[0].x, y: t[0].y };
    this.touch = { last: pt };
    if (this.data.mode === "place") this.placeAt(pt);
  },
  onTouchMove(e) {
    const t = e.touches;
    if (!this.touch) return;
    if (t.length >= 2 && this.touch.pinch) {
      const a = { x: t[0].x, y: t[0].y };
      const b = { x: t[1].x, y: t[1].y };
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      this.view.ox += mid.x - this.touch.pinch.mid.x;
      this.view.oy += mid.y - this.touch.pinch.mid.y;
      this.zoomAt(mid.x, mid.y, dist / Math.max(1, this.touch.pinch.dist));
      this.touch.pinch = { dist, mid };
      return;
    }
    if (this.touch.pinch) return;
    const pt = { x: t[0].x, y: t[0].y };
    const last = this.touch.last;
    if (this.data.mode === "move") {
      this.view.ox += pt.x - last.x;
      this.view.oy += pt.y - last.y;
      this.draw();
    } else {
      const step = Math.max(2, this.view.scale * 0.35);
      const n = Math.max(1, Math.ceil(Math.hypot(pt.x - last.x, pt.y - last.y) / step));
      for (let k = 1; k <= n; k++) this.placeAt({ x: last.x + (pt.x - last.x) * k / n, y: last.y + (pt.y - last.y) * k / n });
    }
    this.touch.last = pt;
  },
  onTouchEnd(e) {
    if (e.touches.length === 0) {
      this.touch = null;
      this.commitBatch();
    }
  },
  commitBatch() {
    if (!this.batch.length) return;
    this.undoStack.push(this.batch);
    if (this.undoStack.length > 200) this.undoStack.shift();
    this.batch = [];
    this.refreshPanel();
    this.schedulePersist();
  },
  undo() {
    const last = this.undoStack.pop();
    if (!last) return;
    for (const i of last) this.placed[i] = "0";
    this.finishedShown = false;
    this.refreshPanel();
    this.draw();
    this.schedulePersist();
  },
  schedulePersist() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.persist(), 800);
  },
  persist() {
    if (this.pattern) (0, import_store.setWork)({ placed: this.placed.join("") });
  },
  async saveDraft() {
    this.persist();
    await (0, import_actions.saveCurrentDraft)();
  },
  async share() {
    this.persist();
    await (0, import_actions.shareCurrent)();
  }
});
