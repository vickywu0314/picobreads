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
var store_exports = {};
__export(store_exports, {
  applyPattern: () => applyPattern,
  draftData: () => draftData,
  getWork: () => getWork,
  newDraftId: () => newDraftId,
  setWork: () => setWork,
  startWork: () => startWork
});
module.exports = __toCommonJS(store_exports);
var import_config = require("./config");
const KEY = "bs-work";
const blank = () => ({
  photo: null,
  aspect: 1,
  beadSize: "2.6mm",
  removeBg: true,
  trim: true,
  tier: "small",
  look: "classic",
  pattern: null,
  placed: "",
  draftId: null,
  name: ""
});
let work = null;
function getWork() {
  if (!work) work = { ...blank(), ...wx.getStorageSync(KEY) || {} };
  return work;
}
function setWork(patch) {
  work = { ...getWork(), ...patch };
  try {
    wx.setStorageSync(KEY, work);
  } catch (e) {
  }
  return work;
}
function startWork(photo, aspect) {
  const prev = getWork();
  return setWork({ ...blank(), beadSize: prev.beadSize, removeBg: prev.removeBg, trim: prev.trim, photo, aspect });
}
function applyPattern(pattern) {
  const w = getWork();
  const same = w.pattern && w.pattern.cells.length === pattern.cells.length && w.pattern.cells.every((c, i) => c === pattern.cells[i]);
  return setWork({ pattern, placed: same ? w.placed : "0".repeat(pattern.cells.length), ...same ? {} : { draftId: null } });
}
function draftData(w) {
  return {
    photo: null,
    aspectId: "1:1",
    pattern: w.pattern,
    placed: w.placed,
    settings: { paletteId: import_config.PALETTE_ID, beadSize: w.beadSize, tier: w.tier, maxColors: 999, detail: 5, dithering: false, style: "auto", removeBg: w.removeBg, trim: w.trim, look: w.look, iron: "normal" }
  };
}
const newDraftId = () => `mp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
