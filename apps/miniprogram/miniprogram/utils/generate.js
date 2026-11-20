"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var generate_exports = {};
__export(generate_exports, {
  beadCount: () => beadCount,
  generate: () => generate,
  legendOf: () => legendOf,
  optionKeys: () => optionKeys,
  palette: () => palette,
  recommend: () => recommend,
  yieldUI: () => yieldUI
});
module.exports = __toCommonJS(generate_exports);
var E = __toESM(require("../lib/engine"));
var import_config = require("./config");
const yieldUI = () => new Promise((r) => setTimeout(r, 16));
let canvas = null;
const offscreen = () => {
  if (!canvas) canvas = wx.createOffscreenCanvas({ type: "2d", width: 16, height: 16 });
  return canvas;
};
const imageCache = /* @__PURE__ */ new Map();
const pixelCache = /* @__PURE__ */ new Map();
function loadPhoto(src, trim) {
  const key = `${src}|${trim}`;
  let p = imageCache.get(key);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const c = offscreen();
      const img = c.createImage();
      img.onload = () => {
        const full = { x: 0, y: 0, w: img.width, h: img.height };
        if (!trim) return resolve({ img, box: full });
        const s = Math.min(1, 256 / Math.max(img.width, img.height));
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const b = E.subjectBox(ctx.getImageData(0, 0, c.width, c.height));
        resolve({ img, box: b ? { x: b.x / s, y: b.y / s, w: b.w / s, h: b.h / s } : full });
      };
      img.onerror = () => reject(new Error("image load failed"));
      img.src = src;
    });
    if (imageCache.size > 6) imageCache.clear();
    imageCache.set(key, p);
  }
  return p;
}
async function pixels(src, long, trim) {
  const key = `${src}|${long}|${trim}`;
  const hit = pixelCache.get(key);
  if (hit) return hit;
  const { img, box } = await loadPhoto(src, trim);
  const s = Math.min(1, long / Math.max(box.w, box.h));
  const c = offscreen();
  c.width = Math.max(1, Math.round(box.w * s));
  c.height = Math.max(1, Math.round(box.h * s));
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const px = { data: d.data, width: d.width, height: d.height };
  if (pixelCache.size > 8) pixelCache.clear();
  pixelCache.set(key, px);
  return px;
}
const samplesPerBead = (long) => long <= 60 ? 6 : long <= 120 ? 4 : 3;
async function generate(w, tier, look) {
  if (!w.photo) throw new Error("no photo");
  const { width, height } = (0, import_config.gridSize)((0, import_config.perSideOf)(tier), w.beadSize, w.aspect);
  const long = Math.max(width, height);
  const img = await pixels(w.photo, long * samplesPerBead(long), w.trim);
  const r = E.generatePattern(img, {
    palette: E.getPalette(import_config.PALETTE_ID),
    width,
    height,
    maxColors: 999,
    detail: 5,
    dithering: false,
    removeBackground: w.removeBg,
    pixelArt: look === "pixel"
  });
  return { id: `p_${Date.now().toString(36)}_${tier}_${look}`, paletteId: import_config.PALETTE_ID, width, height, cells: r.cells };
}
const optionKeys = () => [
  ...import_config.TIERS.map((t) => ({ key: `${t.id}-classic`, tier: t.id, look: "classic" })),
  { key: "pixel", tier: import_config.PIXEL_TIER, look: "pixel" }
];
async function recommend(w, plain) {
  if (!w.photo) return { perSide: 1, subjectShare: 1 };
  const pegs = import_config.BOARD_PEGS[w.beadSize];
  const img = await pixels(w.photo, pegs * import_config.TIERS.length * 2, w.trim);
  const { losses, subjectShare } = E.recommendBoards(img, pegs, w.aspect, import_config.TIERS.length, 0);
  const labs = E.getPalette(import_config.PALETTE_ID).colors.map((c) => E.rgbToLab(c.rgb));
  const gridLosses = plain.slice(1).map((fine, i) => E.gridLoss(plain[i], fine, labs));
  return { perSide: E.chooseBoards(losses, gridLosses, import_config.TIERS.length), subjectShare };
}
function legendOf(p) {
  return E.countColors(p.cells).map((c, i) => ({ ...c, number: i + 1 }));
}
const beadCount = (p) => E.beadCount(p);
const palette = () => E.getPalette(import_config.PALETTE_ID);
