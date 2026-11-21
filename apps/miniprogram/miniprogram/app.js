"use strict";
var import_api = require("./utils/api");
var import_png = require("./utils/png");
App({
  onLaunch() {
    var _a;
    (0, import_png.cleanPictures)();
    if (!(0, import_api.getToken)()) (0, import_api.login)().catch((e) => console.warn("[login] silent sign-in failed:", e && e.code));
    const m = (_a = wx.getUpdateManager) == null ? void 0 : _a.call(wx);
    m == null ? void 0 : m.onUpdateReady(() => {
      wx.showModal({ title: "\u6709\u65B0\u7248\u672C", content: "\u65B0\u7248\u672C\u5DF2\u7ECF\u51C6\u5907\u597D\uFF0C\u91CD\u542F\u4E00\u4E0B\u5C31\u80FD\u7528", showCancel: false, success: () => m.applyUpdate() });
    });
  }
});
