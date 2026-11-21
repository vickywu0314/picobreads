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
var png_exports = {};
__export(png_exports, {
  cleanPictures: () => cleanPictures,
  patternImage: () => patternImage,
  patternPng: () => patternPng
});
module.exports = __toCommonJS(png_exports);
let crcTable = null;
function crc32(bytes, start, end) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c2 = n;
      for (let k = 0; k < 8; k++) c2 = c2 & 1 ? 3988292384 ^ c2 >>> 1 : c2 >>> 1;
      crcTable[n] = c2 >>> 0;
    }
  }
  let c = 4294967295;
  for (let i = start; i < end; i++) c = crcTable[(c ^ bytes[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
function patternPng(p, pal, scale) {
  const W = p.width * scale;
  const H = p.height * scale;
  const local = /* @__PURE__ */ new Map();
  const colors = [[0, 0, 0]];
  for (const c of p.cells) {
    if (c >= 0 && !local.has(c)) {
      local.set(c, colors.length);
      colors.push(pal.colors[c].rgb);
    }
  }
  const indexed = colors.length <= 256;
  const bpp = indexed ? 1 : 4;
  const rowLen = 1 + W * bpp;
  const raw = new Uint8Array(rowLen * H);
  for (let y = 0; y < p.height; y++) {
    const first = y * scale * rowLen;
    let o2 = first + 1;
    for (let x = 0; x < p.width; x++) {
      const c = p.cells[y * p.width + x];
      if (indexed) {
        const v = c < 0 ? 0 : local.get(c);
        for (let k = 0; k < scale; k++) raw[o2++] = v;
      } else {
        const rgb = c < 0 ? [0, 0, 0] : pal.colors[c].rgb;
        for (let k = 0; k < scale; k++) {
          raw[o2++] = rgb[0];
          raw[o2++] = rgb[1];
          raw[o2++] = rgb[2];
          raw[o2++] = c < 0 ? 0 : 255;
        }
      }
    }
    for (let k = 1; k < scale; k++) raw.copyWithin(first + k * rowLen, first, first + rowLen);
  }
  const blocks = Math.ceil(raw.length / 65535) || 1;
  const z = new Uint8Array(2 + raw.length + blocks * 5 + 4);
  let zo = 0;
  z[zo++] = 120;
  z[zo++] = 1;
  let a = 1;
  let b = 0;
  for (let i = 0; i < raw.length; ) {
    const n = Math.min(65535, raw.length - i);
    z[zo++] = i + n >= raw.length ? 1 : 0;
    z[zo++] = n & 255;
    z[zo++] = n >>> 8;
    z[zo++] = ~n & 255;
    z[zo++] = ~n >>> 8 & 255;
    z.set(raw.subarray(i, i + n), zo);
    zo += n;
    for (let j = i; j < i + n; ) {
      const end = Math.min(i + n, j + 3800);
      for (; j < end; j++) {
        a += raw[j];
        b += a;
      }
      a %= 65521;
      b %= 65521;
    }
    i += n;
  }
  z[zo++] = b >>> 8;
  z[zo++] = b & 255;
  z[zo++] = a >>> 8;
  z[zo++] = a & 255;
  const chunks = [];
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W);
  dv.setUint32(4, H);
  ihdr[8] = 8;
  ihdr[9] = indexed ? 3 : 6;
  chunks.push({ type: "IHDR", data: ihdr });
  if (indexed) {
    const plte = new Uint8Array(colors.length * 3);
    colors.forEach((c, i) => plte.set(c, i * 3));
    chunks.push({ type: "PLTE", data: plte });
    chunks.push({ type: "tRNS", data: new Uint8Array([0]) });
  }
  chunks.push({ type: "IDAT", data: z.subarray(0, zo) });
  chunks.push({ type: "IEND", data: new Uint8Array(0) });
  const total = 8 + chunks.reduce((n, c) => n + 12 + c.data.length, 0);
  const out = new Uint8Array(total);
  out.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  const odv = new DataView(out.buffer);
  let o = 8;
  for (const c of chunks) {
    odv.setUint32(o, c.data.length);
    for (let i = 0; i < 4; i++) out[o + 4 + i] = c.type.charCodeAt(i);
    out.set(c.data, o + 8);
    odv.setUint32(o + 8 + c.data.length, crc32(out, o + 4, o + 8 + c.data.length));
    o += 12 + c.data.length;
  }
  return out;
}
const slots = /* @__PURE__ */ new Map();
let seq = 0;
function patternImage(slot, p, pal, target) {
  const long = Math.max(p.width, p.height);
  const scale = Math.max(1, Math.min(10, Math.round(target / long)));
  const bytes = patternPng(p, pal, scale);
  const fs = wx.getFileSystemManager();
  const prev = slots.get(slot);
  if (prev) {
    try {
      fs.unlinkSync(prev);
    } catch (e) {
    }
  }
  const path = `${wx.env.USER_DATA_PATH}/bs_${slot}_${Date.now().toString(36)}${seq++}.png`;
  fs.writeFileSync(path, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  slots.set(slot, path);
  return path;
}
function cleanPictures() {
  const fs = wx.getFileSystemManager();
  try {
    for (const f of fs.readdirSync(wx.env.USER_DATA_PATH)) if (/^bs_.*\.png$/.test(f)) fs.unlinkSync(`${wx.env.USER_DATA_PATH}/${f}`);
  } catch (e) {
  }
}
