/** Beads needed including spare allowance (e.g. 0.1 = +10%), rounded up. */
export function withAllowance(count: number, allowance: number): number {
  // Round first so float noise (100 * 1.1 = 110.00000000000001) doesn't add a bead.
  return Math.ceil(Math.round(count * (1 + allowance) * 1e6) / 1e6)
}

export interface PackPick {
  size: number
  qty: number
}

/**
 * Choose bags (e.g. 500 / 100 / 50 beads) covering `need` with the least
 * leftover beads; ties prefer fewer bags.
 */
export function pickPacks(need: number, packSizes: number[]): PackPick[] {
  const sizes = [...new Set(packSizes)].filter((s) => s > 0).sort((a, b) => b - a)
  if (need <= 0 || sizes.length === 0) return []
  const smallest = sizes[sizes.length - 1]
  const limit = need + smallest
  // best[t] = fewest bags whose total is exactly t (unbounded knapsack).
  const best = new Array<number>(limit + 1).fill(Infinity)
  const from = new Array<number>(limit + 1).fill(-1)
  best[0] = 0
  for (let t = 1; t <= limit; t++) {
    for (const s of sizes) {
      if (s <= t && best[t - s] + 1 < best[t]) {
        best[t] = best[t - s] + 1
        from[t] = s
      }
    }
  }
  let total = need
  while (total <= limit && best[total] === Infinity) total++
  const counts = new Map<number, number>()
  for (let t = total; t > 0; t -= from[t]) counts.set(from[t], (counts.get(from[t]) ?? 0) + 1)
  return sizes.filter((s) => counts.has(s)).map((s) => ({ size: s, qty: counts.get(s)! }))
}

export function packTotal(picks: PackPick[]): number {
  return picks.reduce((sum, p) => sum + p.size * p.qty, 0)
}
