import type { Rgb } from './types'

export type Lab = [number, number, number]

/** sRGB channel 0–255 → linear 0–1. */
export function srgbToLinear(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** Linear 0–1 → sRGB channel 0–255. */
export function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055
  return Math.max(0, Math.min(255, Math.round(c * 255)))
}

const XN = 0.95047
const YN = 1.0
const ZN = 1.08883
const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)

/** Linear RGB (0–1, D65) → CIE Lab. */
export function linearRgbToLab(r: number, g: number, b: number): Lab {
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / XN
  const y = (0.2126729 * r + 0.7151522 * g + 0.072175 * b) / YN
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / ZN
  const fx = f(x)
  const fy = f(y)
  const fz = f(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export function rgbToLab([r, g, b]: Rgb): Lab {
  return linearRgbToLab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b))
}

const RAD = Math.PI / 180
const POW25_7 = 25 ** 7

/** CIEDE2000 color difference (Sharma, Wu & Dalal 2005), kL = kC = kH = 1. */
export function deltaE2000(l1: Lab, l2: Lab): number {
  const [L1, a1, b1] = l1
  const [L2, a2, b2] = l2
  const C1 = Math.hypot(a1, b1)
  const C2 = Math.hypot(a2, b2)
  const Cbar7 = ((C1 + C2) / 2) ** 7
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + POW25_7)))
  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2
  const C1p = Math.hypot(a1p, b1)
  const C2p = Math.hypot(a2p, b2)
  const h1p = C1p === 0 ? 0 : (Math.atan2(b1, a1p) / RAD + 360) % 360
  const h2p = C2p === 0 ? 0 : (Math.atan2(b2, a2p) / RAD + 360) % 360

  const dLp = L2 - L1
  const dCp = C2p - C1p
  let dhp = 0
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p
    if (dhp > 180) dhp -= 360
    else if (dhp < -180) dhp += 360
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * RAD)

  const Lbarp = (L1 + L2) / 2
  const Cbarp = (C1p + C2p) / 2
  let hbarp = h1p + h2p
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbarp /= 2
    else hbarp = h1p + h2p < 360 ? (hbarp + 360) / 2 : (hbarp - 360) / 2
  }
  const T =
    1 -
    0.17 * Math.cos((hbarp - 30) * RAD) +
    0.24 * Math.cos(2 * hbarp * RAD) +
    0.32 * Math.cos((3 * hbarp + 6) * RAD) -
    0.2 * Math.cos((4 * hbarp - 63) * RAD)
  const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2))
  const Cbarp7 = Cbarp ** 7
  const Rc = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + POW25_7))
  const Sl = 1 + (0.015 * (Lbarp - 50) ** 2) / Math.sqrt(20 + (Lbarp - 50) ** 2)
  const Sc = 1 + 0.045 * Cbarp
  const Sh = 1 + 0.015 * Cbarp * T
  const Rt = -Math.sin(2 * dTheta * RAD) * Rc

  const l = dLp / Sl
  const c = dCp / Sc
  const h = dHp / Sh
  return Math.sqrt(l * l + c * c + h * h + Rt * c * h)
}
