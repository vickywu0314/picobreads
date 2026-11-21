"use strict";
var import_config = require("../../utils/config");
var import_draw = require("../../utils/draw");
var import_generate = require("../../utils/generate");
var import_store = require("../../utils/store");
var import_actions = require("../../utils/actions");
const MAX_SCALE = 60;
const HIT_RADIUS = 0.45;
const CAN_VIBRATE = wx.getDeviceInfo ? wx.getDeviceInfo().platform !== "devtools" : true;
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
    hint: "",
    boardW: 300,
    boardH: 300,
    /** Development / trial versions only: shows the "finish everything" test button. */
    testMode: false
  },
  // Working state (not rendered by the template).
  pattern: null,
  placed: [],
  bv: { scale: 8, ox: 0, oy: 0 },
  fitScale: 8,
  handle: null,
  numbers: null,
  totals: null,
  undoStack: [],
  batch: [],
  touch: null,
  frame: 0,
  saveTimer: 0,
  lastBuzz: 0,
  finishedShown: false,
  failed: false,
  drawn: false,
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
    this.refreshPanel();
    try {
      this.setData({ testMode: wx.getAccountInfoSync().miniProgram.envVersion !== "release" });
    } catch (e) {
    }
  },
  /** Test helper (not in the released version): place every remaining bead, as one undoable step. */
  testFinish() {
    const p = this.pattern;
    const filled = [];
    for (let i = 0; i < p.cells.length; i++) {
      if (p.cells[i] >= 0 && this.placed[i] !== "1") {
        this.placed[i] = "1";
        filled.push(i);
      }
    }
    if (!filled.length) {
      this.finishedShown = false;
      this.refreshPanel();
      return;
    }
    this.undoStack.push(filled);
    this.draw();
    this.refreshPanel();
    this.schedulePersist();
  },
  onReady() {
    void this.initCanvas(0);
  },
  /** Back from another page (share, …): set the canvas up again and repaint, keeping the zoom. */
  onShow() {
    if (!this.handle) return;
    (0, import_draw.getCanvas)(this, "#board").then((h) => {
      this.handle = h;
      this.draw();
    }).catch(() => {
    });
  },
  /** Size the canvas to its box once the layout is known (retries while the box has no size yet). */
  async initCanvas(attempt) {
    var _a;
    if (!this.pattern) return;
    const box = await (0, import_draw.queryNode)(this, "#board-box", { size: true });
    if (!box || box.width < 10 || box.height < 10) {
      if (attempt < 20) setTimeout(() => void this.initCanvas(attempt + 1), 100);
      else this.fail(box ? `\u9489\u677F\u533A\u57DF\u5927\u5C0F\u4E0D\u5BF9\uFF1A${box.width}\xD7${box.height}` : "\u67E5\u8BE2\u9489\u677F\u533A\u57DF\u6CA1\u6709\u56DE\u5E94");
      return;
    }
    await new Promise((resolve) => this.setData({ boardW: Math.floor(box.width), boardH: Math.floor(box.height) }, resolve));
    try {
      this.handle = await (0, import_draw.getCanvas)(this, "#board");
      this.fit();
    } catch (e) {
      this.fail(String((_a = e == null ? void 0 : e.message) != null ? _a : e));
    }
  },
  /** Show what went wrong (once), so it can be reported. */
  fail(msg) {
    console.error("[bead]", msg);
    if (this.failed) return;
    this.failed = true;
    wx.showModal({ title: "\u9489\u677F\u6CA1\u753B\u51FA\u6765", content: msg.slice(0, 200), showCancel: false });
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
    const paint = () => {
      var _a;
      this.frame = 0;
      try {
        if (!this.drawn) {
          this.drawn = true;
          console.log("[bead] first draw", { canvas: `${c.width}x${c.height}`, view: this.bv, pattern: `${this.pattern.width}x${this.pattern.height}` });
        }
        (0, import_draw.drawBoard)(c.ctx, c.width, c.height, this.bv, { pattern: this.pattern, placed: this.placed.join(""), selected: this.data.selected, numbers: this.numbers }, (0, import_generate.palette)(), import_config.BOARD_PEGS[(0, import_store.getWork)().beadSize]);
      } catch (e) {
        this.fail(String((_a = e == null ? void 0 : e.stack) != null ? _a : e));
      }
    };
    this.frame = 1;
    setTimeout(paint, 16);
  },
  fit() {
    if (!this.handle || !this.pattern) return;
    this.bv = (0, import_draw.fitView)(this.pattern, this.handle.width, this.handle.height);
    this.fitScale = this.bv.scale;
    this.draw();
  },
  zoomAt(cx, cy, k) {
    const v = this.bv;
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
  /** One finger places beads only in "place" mode with a color picked; otherwise it moves the board. */
  placing() {
    return this.data.mode === "place" && this.data.selected !== null;
  },
  setMode(e) {
    this.setData({ mode: e.currentTarget.dataset.m });
  },
  selectColor(e) {
    const color = Number(e.currentTarget.dataset.color);
    this.setData({ selected: this.data.selected === color ? null : color });
    this.refreshPanel();
    this.draw();
    if (this.bv.scale < 14 && this.handle) this.zoomAt(this.handle.width / 2, this.handle.height / 2, 14 / this.bv.scale);
  },
  showHint(text) {
    this.setData({ hint: text });
    setTimeout(() => this.data.hint === text && this.setData({ hint: "" }), 1600);
  },
  /** Put a bead in the cell under the finger, if it's the selected color's spot. */
  placeAt(pt) {
    var _a;
    const p = this.pattern;
    const i = (0, import_draw.cellAt)(this.bv, p, pt.x, pt.y);
    if (i < 0 || this.placed[i] === "1" || p.cells[i] < 0) return;
    const sel = this.data.selected;
    if (sel === null) return;
    if (p.cells[i] !== sel) return;
    const c = (0, import_draw.cellCenter)(this.bv, p, i);
    if (Math.hypot(pt.x - c.x, pt.y - c.y) > this.bv.scale * HIT_RADIUS) return;
    this.placed[i] = "1";
    this.batch.push(i);
    const now = Date.now();
    if (now - this.lastBuzz > 60) {
      this.lastBuzz = now;
      if (CAN_VIBRATE) (_a = wx.vibrateShort) == null ? void 0 : _a.call(wx, { type: "light" });
    }
    this.draw();
  },
  onTouchStart(e) {
    const t = e.touches;
    if (t.length >= 2) {
      this.commitBatch();
      const a = { x: t[0].x, y: t[0].y };
      const b = { x: t[1].x, y: t[1].y };
      this.touch = { last: a, start: a, moved: true, pinch: { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } } };
      return;
    }
    const pt = { x: t[0].x, y: t[0].y };
    this.touch = { last: pt, start: pt, moved: false };
    if (this.placing()) this.placeAt(pt);
  },
  onTouchMove(e) {
    const t = e.touches;
    if (!this.touch) return;
    if (t.length >= 2 && this.touch.pinch) {
      const a = { x: t[0].x, y: t[0].y };
      const b = { x: t[1].x, y: t[1].y };
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      this.bv.ox += mid.x - this.touch.pinch.mid.x;
      this.bv.oy += mid.y - this.touch.pinch.mid.y;
      this.zoomAt(mid.x, mid.y, dist / Math.max(1, this.touch.pinch.dist));
      this.touch.pinch = { dist, mid };
      return;
    }
    if (this.touch.pinch) return;
    const pt = { x: t[0].x, y: t[0].y };
    const last = this.touch.last;
    if (Math.hypot(pt.x - this.touch.start.x, pt.y - this.touch.start.y) > 6) this.touch.moved = true;
    if (!this.placing()) {
      this.bv.ox += pt.x - last.x;
      this.bv.oy += pt.y - last.y;
      this.draw();
    } else {
      const step = Math.max(2, this.bv.scale * 0.35);
      const n = Math.max(1, Math.ceil(Math.hypot(pt.x - last.x, pt.y - last.y) / step));
      for (let k = 1; k <= n; k++) this.placeAt({ x: last.x + (pt.x - last.x) * k / n, y: last.y + (pt.y - last.y) * k / n });
    }
    this.touch.last = pt;
  },
  onTouchEnd(e) {
    if (e.touches.length === 0) {
      if (this.touch && !this.touch.moved && this.data.mode === "place" && this.data.selected === null) this.showHint("\u5148\u5728\u4E0B\u9762\u9009\u4E00\u4E2A\u989C\u8272");
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
