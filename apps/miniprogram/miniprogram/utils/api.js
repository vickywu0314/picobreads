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
var api_exports = {};
__export(api_exports, {
  ApiError: () => ApiError,
  api: () => api,
  clearSession: () => clearSession,
  ensureLogin: () => ensureLogin,
  errorText: () => errorText,
  getToken: () => getToken,
  getUser: () => getUser,
  login: () => login,
  updateProfile: () => updateProfile
});
module.exports = __toCommonJS(api_exports);
var import_config = require("./config");
const TOKEN_KEY = "bs-token";
const USER_KEY = "bs-user";
class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
const getToken = () => wx.getStorageSync(TOKEN_KEY) || "";
const getUser = () => wx.getStorageSync(USER_KEY) || null;
function saveSession(token, user) {
  wx.setStorageSync(TOKEN_KEY, token);
  wx.setStorageSync(USER_KEY, user);
}
function clearSession() {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_KEY);
}
function api(path, opts = {}) {
  const token = getToken();
  return new Promise((resolve, reject) => {
    var _a;
    wx.request({
      url: `${import_config.API_BASE}/api${path}`,
      method: (_a = opts.method) != null ? _a : opts.data !== void 0 ? "POST" : "GET",
      data: opts.data,
      header: { "content-type": "application/json", ...token ? { authorization: `Bearer ${token}` } : {} },
      timeout: 2e4,
      success: (res) => {
        var _a2;
        const body = (_a2 = res.data) != null ? _a2 : {};
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(body);
        else {
          if (res.statusCode === 401) clearSession();
          reject(new ApiError(typeof body.error === "string" ? body.error : "server_error", res.statusCode));
        }
      },
      fail: () => reject(new ApiError("network", 0))
    });
  });
}
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async ({ code }) => {
        try {
          const r = await api("/auth/wxmp/login", { data: { code } });
          saveSession(r.token, r.user);
          resolve(r.user);
        } catch (e) {
          reject(e);
        }
      },
      fail: () => reject(new ApiError("wx_login_failed", 0))
    });
  });
}
async function ensureLogin() {
  const u = getUser();
  if (u && getToken()) return u;
  wx.showLoading({ title: "\u767B\u5F55\u4E2D\u2026", mask: true });
  try {
    return await login();
  } finally {
    wx.hideLoading();
  }
}
async function updateProfile(name) {
  const r = await api("/auth/profile", { data: { name } });
  wx.setStorageSync(USER_KEY, r.user);
  return r.user;
}
const MESSAGES = {
  network: "\u8FDE\u4E0D\u4E0A\u670D\u52A1\u5668\uFF08\u5F00\u53D1\u7248\u8981\u5148\u6253\u5F00\u8C03\u8BD5\uFF09",
  wx_login_failed: "\u5FAE\u4FE1\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21",
  provider_not_configured: "\u670D\u52A1\u5668\u8FD8\u6CA1\u914D\u7F6E\u5C0F\u7A0B\u5E8F\u767B\u5F55",
  not_signed_in: "\u8BF7\u5148\u767B\u5F55",
  too_many_shares: "\u4ECA\u5929\u5206\u4EAB\u592A\u591A\u6B21\u4E86\uFF0C\u660E\u5929\u518D\u8BD5",
  too_many_designs: "\u8349\u7A3F\u592A\u591A\u4E86\uFF0C\u5148\u5220\u6389\u4E00\u4E9B",
  not_on_sale: "\u8FD9\u4E2A\u8FD8\u6CA1\u5F00\u653E\u8D2D\u4E70",
  bad_address: "\u6536\u8D27\u5730\u5740\u4E0D\u5B8C\u6574\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9",
  pay_failed: "\u6CA1\u80FD\u53D1\u8D77\u652F\u4ED8\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5",
  no_openid: "\u8BF7\u91CD\u65B0\u767B\u5F55\u540E\u518D\u8BD5"
};
const errorText = (e) => {
  var _a;
  return (_a = MESSAGES[e instanceof ApiError ? e.code : ""]) != null ? _a : "\u51FA\u9519\u4E86\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5";
};
