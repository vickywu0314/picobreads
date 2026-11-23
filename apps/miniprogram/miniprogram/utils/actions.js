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
var actions_exports = {};
__export(actions_exports, {
  saveCurrentDraft: () => saveCurrentDraft,
  shareCurrent: () => shareCurrent,
  sharePiece: () => sharePiece,
  syncDraft: () => syncDraft
});
module.exports = __toCommonJS(actions_exports);
var import_api = require("./api");
var import_store = require("./store");
async function saveCurrentDraft() {
  var _a;
  const w = (0, import_store.getWork)();
  if (!w.pattern) return false;
  try {
    await (0, import_api.ensureLogin)();
    wx.showLoading({ title: "\u4FDD\u5B58\u4E2D\u2026", mask: true });
    const id = (_a = w.draftId) != null ? _a : (0, import_store.newDraftId)();
    const name = w.name || `\u8349\u7A3F ${(/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}`;
    await (0, import_api.api)(`/designs/${id}`, { method: "PUT", data: { name, data: (0, import_store.draftData)(w) } });
    (0, import_store.setWork)({ draftId: id, name });
    wx.hideLoading();
    wx.showToast({ title: "\u5DF2\u5B58\u5230\u8349\u7A3F", icon: "success" });
    return true;
  } catch (e) {
    wx.hideLoading();
    wx.showToast({ title: (0, import_api.errorText)(e), icon: "none" });
    return false;
  }
}
async function sharePiece(piece) {
  try {
    await (0, import_api.ensureLogin)();
    wx.showLoading({ title: "\u751F\u6210\u5206\u4EAB\u2026", mask: true });
    const r = await (0, import_api.api)("/shares", {
      data: { name: piece.name, pattern: { width: piece.pattern.width, height: piece.pattern.height, paletteId: piece.pattern.paletteId, cells: piece.pattern.cells }, placed: piece.placed, beadSize: piece.beadSize, iron: "normal" }
    });
    wx.hideLoading();
    wx.navigateTo({ url: `/pages/share/index?id=${r.id}&mine=1` });
  } catch (e) {
    wx.hideLoading();
    wx.showToast({ title: (0, import_api.errorText)(e), icon: "none" });
  }
}
function shareCurrent() {
  const w = (0, import_store.getWork)();
  if (!w.pattern) return;
  return sharePiece({ name: w.name || "\u6211\u7684\u62FC\u8C46", pattern: w.pattern, placed: w.placed, beadSize: w.beadSize });
}
async function syncDraft(force = false) {
  var _a;
  const w = (0, import_store.getWork)();
  if (!w.pattern || !force && !w.placed.includes("1")) return false;
  try {
    if (!(0, import_api.getToken)()) await (0, import_api.login)();
    const id = (_a = w.draftId) != null ? _a : (0, import_store.newDraftId)();
    const name = w.name || `\u4F5C\u54C1 ${(/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}`;
    if (!w.draftId || !w.name) (0, import_store.setWork)({ draftId: id, name });
    await (0, import_api.api)(`/designs/${id}`, { method: "PUT", data: { name, data: (0, import_store.draftData)((0, import_store.getWork)()) } });
    return true;
  } catch (e) {
    console.warn("[sync] draft not saved:", e);
    return false;
  }
}
