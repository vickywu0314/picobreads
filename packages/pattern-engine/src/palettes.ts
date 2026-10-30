import type { Palette } from './types'
import perler from '../palettes/perler.json'
import artkalS from '../palettes/artkal-s.json'
import mard221 from '../palettes/mard-221.json'

// TODO: community-measured approximations, not official manufacturer colors.
// See palettes/README.md before relying on them for production kits.
export const PALETTES: Palette[] = [perler, artkalS, mard221] as unknown as Palette[]

export const DEFAULT_PALETTE_ID = 'perler'

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}

/** Indices of colors that automatic generation may use (no glow / glitter / etc.). */
export function regularColorIndices(palette: Palette): number[] {
  const out: number[] = []
  palette.colors.forEach((c, i) => {
    if (!c.specialty) out.push(i)
  })
  return out
}
