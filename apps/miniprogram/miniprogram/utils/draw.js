"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var draw_exports = {};
__export(draw_exports, {
  cellAt: () => cellAt,
  cellCenter: () => cellCenter,
  drawBoard: () => drawBoard,
  drawFinished: () => drawFinished,
  fitView: () => fitView,
  getCanvas: () => getCanvas,
  onColor: () => onColor,
  rgb: () => rgb,
  shade: () => shade
});
module.exports = __toCommonJS(draw_exports);
function getCanvas(page, selector) {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery().in(page).select(selector).fields({ node: true, size: true }).exec((res) => {
      const r = res == null ? void 0 : res[0];
      if (!(r == null ? void 0 : r.node)) return reject(new Error(`canvas ${selector} not found`));
      const dpr = Math.min(3, wx.getWindowInfo().pixelRatio || 2);
      const canvas = r.node;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      resolve({ canvas, ctx, width: r.width, height: r.height });
    });
  });
}
const rgb = ([r, g, b]) => `rgb(${r},${g},${b})`;
function shade([r, g, b], k) {
  const f = (v) => Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const luminance = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function drawFinished(ctx, w, h, p, pal, bg) {
  ctx.clearRect(0, 0, w, h);
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }
  const pad = Math.round(Math.min(w, h) * 0.04);
  const cell = Math.min((w - pad * 2) / p.width, (h - pad * 2) / p.height);
  const ox = (w - cell * p.width) / 2;
  const oy = (h - cell * p.height) / 2;
  const fills = pal.colors.map((c) => rgb(c.rgb));
  const r = cell * 0.22;
  for (let y = 0; y < p.height; y++) {
    for (let x = 0; x < p.width; x++) {
      const c = p.cells[y * p.width + x];
      if (c < 0) continue;
      ctx.fillStyle = fills[c];
      if (cell >= 5) {
        roundRect(ctx, ox + x * cell, oy + y * cell, cell + 0.3, cell + 0.3, r);
        ctx.fill();
      } else ctx.fillRect(ox + x * cell, oy + y * cell, cell + 0.3, cell + 0.3);
    }
  }
  if (cell >= 6) {
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    for (let y = 0; y < p.height; y++)
      for (let x = 0; x < p.width; x++) {
        if (p.cells[y * p.width + x] < 0) continue;
        ctx.beginPath();
        ctx.arc(ox + (x + 0.5) * cell, oy + (y + 0.5) * cell, cell * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
  }
}
const BOARD = "#fdf3c4";
const PEG_HI = "#fffbe6";
const PEG_LO = "#f1dc98";
function fitView(p, w, h) {
  const scale = Math.min(w / p.width, h / p.height) * 0.94;
  return { scale, ox: (w - p.width * scale) / 2, oy: (h - p.height * scale) / 2 };
}
function cellAt(v, p, x, y) {
  const cx = Math.floor((x - v.ox) / v.scale);
  const cy = Math.floor((y - v.oy) / v.scale);
  return cx >= 0 && cy >= 0 && cx < p.width && cy < p.height ? cy * p.width + cx : -1;
}
function cellCenter(v, p, i) {
  return { x: v.ox + (i % p.width + 0.5) * v.scale, y: v.oy + (Math.floor(i / p.width) + 0.5) * v.scale };
}
function drawBoard(ctx, w, h, v, s, pal, sectionPegs) {
  var _a;
  const { pattern: p, placed, selected } = s;
  const { scale, ox, oy } = v;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fbeee9";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = BOARD;
  ctx.fillRect(ox, oy, p.width * scale, p.height * scale);
  const x0 = Math.max(0, Math.floor(-ox / scale));
  const y0 = Math.max(0, Math.floor(-oy / scale));
  const x1 = Math.min(p.width, Math.ceil((w - ox) / scale));
  const y1 = Math.min(p.height, Math.ceil((h - oy) / scale));
  const detail = scale >= 9;
  const fills = pal.colors.map((c) => rgb(c.rgb));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * p.width + x;
      const c = p.cells[i];
      if (c >= 0 && placed[i] === "1") continue;
      const px = ox + x * scale;
      const py = oy + y * scale;
      if (detail) {
        const r = scale * 0.12;
        ctx.fillStyle = "rgba(190,150,60,0.28)";
        ctx.beginPath();
        ctx.arc(px + scale / 2 + scale * 0.02, py + scale / 2 + scale * 0.045, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PEG_LO;
        ctx.beginPath();
        ctx.arc(px + scale / 2, py + scale / 2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PEG_HI;
        ctx.beginPath();
        ctx.arc(px + scale / 2 - r * 0.3, py + scale / 2 - r * 0.3, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      if (c < 0) continue;
      const target = selected !== null && c === selected;
      ctx.globalAlpha = target ? 0.45 : selected === null ? 0.2 : 0.06;
      ctx.fillStyle = fills[c];
      const m = scale * 0.08;
      if (detail) {
        roundRect(ctx, px + m, py + m, scale - m * 2, scale - m * 2, scale * 0.18);
        ctx.fill();
      } else ctx.fillRect(px, py, scale, scale);
      ctx.globalAlpha = 1;
      if (target && detail) {
        ctx.strokeStyle = shade(pal.colors[c].rgb, 0.6);
        ctx.lineWidth = Math.max(1, scale * 0.05);
        roundRect(ctx, px + m, py + m, scale - m * 2, scale - m * 2, scale * 0.18);
        ctx.stroke();
        if (scale >= 18) {
          ctx.font = `bold ${Math.floor(scale * 0.4)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#5a4630";
          ctx.fillText(String((_a = s.numbers.get(c)) != null ? _a : ""), px + scale / 2, py + scale / 2);
        }
      }
    }
  }
  for (let y = Math.max(0, y0 - 1); y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * p.width + x;
      const c = p.cells[i];
      if (c < 0 || placed[i] !== "1") continue;
      const col = pal.colors[c].rgb;
      ctx.globalAlpha = selected === null || c === selected ? 1 : 0.55;
      const px = ox + x * scale;
      const py = oy + y * scale;
      if (!detail) {
        ctx.fillStyle = fills[c];
        ctx.fillRect(px, py, scale, scale);
      } else drawBead(ctx, px, py, scale, col);
      ctx.globalAlpha = 1;
    }
  }
  ctx.strokeStyle = "rgba(150,110,60,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = sectionPegs; x < p.width; x += sectionPegs) {
    ctx.moveTo(ox + x * scale, oy);
    ctx.lineTo(ox + x * scale, oy + p.height * scale);
  }
  for (let y = sectionPegs; y < p.height; y += sectionPegs) {
    ctx.moveTo(ox, oy + y * scale);
    ctx.lineTo(ox + p.width * scale, oy + y * scale);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(150,110,60,0.7)";
  ctx.strokeRect(ox, oy, p.width * scale, p.height * scale);
}
function drawBead(ctx, px, py, s, col) {
  const rx = s * 0.47;
  const ry = rx * 0.8;
  const height = s * 0.3;
  const cx = px + s / 2;
  const cy = py + s / 2 - height * 0.45;
  const bottom = cy + height;
  ctx.fillStyle = "rgba(110,70,20,0.22)";
  ctx.beginPath();
  ctx.ellipse(cx + s * 0.04, bottom + s * 0.06, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(col, 0.62);
  ctx.beginPath();
  ctx.moveTo(cx - rx, cy);
  ctx.lineTo(cx - rx, bottom);
  ctx.ellipse(cx, bottom, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rx, cy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgb(col);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.3, cy - ry * 0.35, rx * 0.45, ry * 0.3, -0.4, 0, Math.PI * 2);
  ctx.fill();
  const hx = s * 0.17;
  const hy = hx * 0.8;
  ctx.fillStyle = shade(col, 0.35);
  ctx.beginPath();
  ctx.ellipse(cx, cy, hx, hy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PEG_HI;
  ctx.beginPath();
  ctx.ellipse(cx, cy + hy * 0.35, hx * 0.8, hy * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
}
const onColor = (c) => luminance(c) > 0.6 ? "#3b2a30" : "#ffffff";
