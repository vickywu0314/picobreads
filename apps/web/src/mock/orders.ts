import type { BeadSize, Pattern } from '@picobreads/pattern-engine'
import type { TierId } from '@/config/site'
import { gridSize } from '@/config/site'
import { defaultSettings } from '@/lib/store'
import { generateSamplePattern } from './samplePattern'

// PROTOTYPE ONLY: fake orders for the admin screens.

export type OrderStatus = 'review' | 'picking' | 'picked' | 'shipped'

export interface MockOrder {
  id: string
  date: string
  customer: string
  email: string
  tier: TierId
  beadSize: BeadSize
  status: OrderStatus
  pattern: Pattern
}

const rows: [string, string, TierId, BeadSize, OrderStatus, number, string][] = [
  ['#PB1048', 'Emma R.', 'standard', '5mm', 'review', 1, 'perler'],
  ['#PB1047', 'Liam K.', 'large', '5mm', 'picking', 4 / 3, 'perler'],
  ['#PB1046', 'Olivia M.', 'small', '5mm', 'picking', 1, 'artkal-s'],
  ['#PB1045', 'Noah P.', 'standard', '2.6mm', 'picked', 3 / 4, 'perler'],
  ['#PB1044', 'Ava T.', 'standard', '5mm', 'shipped', 1, 'mard-221'],
  ['#PB1043', 'Lucas W.', 'small', '5mm', 'shipped', 1, 'perler'],
]

export const STATUS_STYLE: Record<OrderStatus, string> = {
  review: 'bg-warn/15 text-warn',
  picking: 'bg-accent-soft text-accent',
  picked: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  shipped: 'bg-ok/15 text-ok',
}

let cache: MockOrder[] | null = null

export function mockOrders(): MockOrder[] {
  if (cache) return cache
  cache = rows.map(([id, customer, tier, beadSize, status, aspect, paletteId], i) => {
    const { width, height } = gridSize(tier, aspect)
    const pattern = generateSamplePattern({ ...defaultSettings, paletteId, width, height, maxColors: 10 + i * 3, detail: 2 + (i % 4) })
    pattern.id = `pat_demo${i}`
    return {
      id,
      date: new Date(Date.UTC(2026, 9, 29 - i, 15 - i)).toISOString(),
      customer,
      email: `${customer.split(' ')[0].toLowerCase()}@example.com`,
      tier,
      beadSize,
      status,
      pattern,
    }
  })
  return cache
}
