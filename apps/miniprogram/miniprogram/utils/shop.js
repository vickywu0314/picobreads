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
var shop_exports = {};
__export(shop_exports, {
  FORM_NAME: () => FORM_NAME,
  STATUS_NAME: () => STATUS_NAME,
  buy: () => buy,
  cancelOrder: () => cancelOrder,
  chooseAddress: () => chooseAddress,
  getOrder: () => getOrder,
  loadShop: () => loadShop,
  payOrder: () => payOrder,
  tierOf: () => tierOf,
  yuan: () => yuan
});
module.exports = __toCommonJS(shop_exports);
var import_api = require("./api");
var import_config = require("./config");
async function loadShop() {
  const closed = { open: false, prices: { small: 0, standard: 0, large: 0 } };
  try {
    return await (0, import_api.api)("/shop");
  } catch (e) {
    return { forms: { kit: closed, finished: closed }, shippingFen: 0, error: e.code || "network" };
  }
}
function tierOf(p, bead) {
  const n = Math.ceil(p.width / import_config.BOARD_PEGS[bead]) * Math.ceil(p.height / import_config.BOARD_PEGS[bead]);
  return n <= 1 ? "small" : n <= 4 ? "standard" : "large";
}
const yuan = (fen) => `\xA5${(fen / 100).toFixed(fen % 100 ? 2 : 0)}`;
const FORM_NAME = { digital: "\u514D\u8D39\u56FE\u7EB8", kit: "\u6750\u6599\u5305", finished: "\u62FC\u597D\u7684\u6210\u54C1" };
const STATUS_NAME = { pending: "\u5F85\u4ED8\u6B3E", paid: "\u5DF2\u4ED8\u6B3E\uFF0C\u5236\u4F5C\u4E2D", shipped: "\u5DF2\u53D1\u8D27", refunded: "\u5DF2\u9000\u6B3E", closed: "\u5DF2\u53D6\u6D88" };
function chooseAddress() {
  return new Promise(
    (resolve) => wx.chooseAddress({
      success: (r) => resolve({ name: r.userName, phone: r.telNumber, province: r.provinceName, city: r.cityName, county: r.countyName, detail: r.detailInfo }),
      fail: () => resolve(null)
    })
  );
}
async function payAndConfirm(order, pay) {
  const done = await new Promise(
    (resolve, reject) => wx.requestPayment({
      ...pay,
      success: () => resolve(true),
      fail: (err) => /cancel/i.test(err.errMsg) ? resolve(false) : reject(new Error(err.errMsg))
    })
  );
  if (!done) return { order, outcome: "cancelled" };
  for (let i = 0; i < 4; i++) {
    const r = await (0, import_api.api)(`/orders/${order.id}`);
    if (r.order.status !== "pending") return { order: r.order, outcome: "paid" };
    await new Promise((x) => setTimeout(x, 1200));
  }
  return { order, outcome: "pending" };
}
async function buy(o) {
  await (0, import_api.ensureLogin)();
  const body = { form: o.form, name: o.name, beadSize: o.beadSize, placed: o.placed, address: o.address, pattern: { width: o.pattern.width, height: o.pattern.height, paletteId: o.pattern.paletteId, cells: o.pattern.cells } };
  let r;
  try {
    r = await (0, import_api.api)("/orders", { data: body });
  } catch (e) {
    if (e.code !== "no_openid") throw e;
    await (0, import_api.login)();
    r = await (0, import_api.api)("/orders", { data: body });
  }
  return payAndConfirm(r.order, r.pay);
}
async function payOrder(id) {
  await (0, import_api.ensureLogin)();
  let r;
  try {
    r = await (0, import_api.api)(`/orders/${id}/pay`, { data: {} });
  } catch (e) {
    if (e.code !== "no_openid") throw e;
    await (0, import_api.login)();
    r = await (0, import_api.api)(`/orders/${id}/pay`, { data: {} });
  }
  if (!r.pay) return { order: r.order, outcome: r.order.status === "pending" ? "pending" : "paid" };
  return payAndConfirm(r.order, r.pay);
}
async function cancelOrder(id) {
  return (await (0, import_api.api)(`/orders/${id}/cancel`, { data: {} })).order;
}
async function getOrder(id) {
  return (await (0, import_api.api)(`/orders/${id}`)).order;
}
