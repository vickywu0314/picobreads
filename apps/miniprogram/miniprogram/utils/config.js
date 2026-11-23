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
var config_exports = {};
__export(config_exports, {
  API_BASE: () => API_BASE,
  BEAD_SIZES: () => BEAD_SIZES,
  BOARD_CM: () => BOARD_CM,
  BOARD_PEGS: () => BOARD_PEGS,
  PALETTE_ID: () => PALETTE_ID,
  PITCH_MM: () => PITCH_MM,
  PIXEL_TIER: () => PIXEL_TIER,
  SITE_URL: () => SITE_URL,
  TIERS: () => TIERS,
  boardCount: () => boardCount,
  gridSize: () => gridSize,
  perSideOf: () => perSideOf,
  sizeCm: () => sizeCm
});
module.exports = __toCommonJS(config_exports);
const API_BASE = "https://beadspark.top";
const SITE_URL = "https://beadspark.top";
const PALETTE_ID = "mard-264";
const BOARD_PEGS = { "2.6mm": 52, "5mm": 29 };
const PITCH_MM = { "2.6mm": 2.6, "5mm": 5 };
const TIERS = [
  { id: "small", perSide: 1 },
  { id: "standard", perSide: 2 },
  { id: "large", perSide: 3 }
];
const PIXEL_TIER = "standard";
const BOARD_CM = 27;
const perSideOf = (tier) => {
  var _a, _b;
  return (_b = (_a = TIERS.find((t) => t.id === tier)) == null ? void 0 : _a.perSide) != null ? _b : 1;
};
function gridSize(perSide, bead, aspect) {
  const long = perSide * BOARD_PEGS[bead];
  return aspect >= 1 ? { width: long, height: Math.max(1, Math.round(long / aspect)) } : { width: Math.max(1, Math.round(long * aspect)), height: long };
}
function sizeCm(width, height, bead) {
  const cm = (n) => (n * PITCH_MM[bead] / 10).toFixed(n * PITCH_MM[bead] >= 1e3 ? 0 : 1);
  return `${cm(width)} \xD7 ${cm(height)}`;
}
function boardCount(width, height, bead) {
  const pegs = Math.round(BOARD_CM * 10 / PITCH_MM[bead]);
  return Math.ceil(width / pegs) * Math.ceil(height / pegs);
}
const BEAD_SIZES = [
  { id: "2.6mm", label: "\u8FF7\u4F60\u8C46 2.6 mm", hint: "\u540C\u6837\u5927\u5C0F\u80FD\u653E\u7684\u8C46\u5B50\u7EA6\u662F\u6807\u51C6\u8C46\u7684 3 \u500D\uFF0C\u7EC6\u8282\u66F4\u6E05\u695A\uFF0C\u6210\u54C1\u66F4\u7CBE\u81F4\u3002" },
  { id: "5mm", label: "\u6807\u51C6\u8C46 5 mm", hint: "\u8C46\u5B50\u5927\u3001\u597D\u62FF\u597D\u62FC\uFF0C\u9002\u5408\u5C0F\u670B\u53CB\u548C\u65B0\u624B\uFF1B\u540C\u6837\u5927\u5C0F\u7EC6\u8282\u5C11\u4E00\u4E9B\u3002" }
];
