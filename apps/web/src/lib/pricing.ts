import { DIGITAL_PRICE_USD, FINISHED_EXTRA_USD, type ProductForm } from '@/config/catalog'
import { TIERS, type TierId } from '@/config/site'

/** Placeholder pricing until real prices live in Shopify. */
export function priceOf(form: ProductForm, tier: TierId) {
  const base = TIERS.find((x) => x.id === tier)!.priceUsd
  return form === 'digital' ? DIGITAL_PRICE_USD : form === 'finished' ? base + FINISHED_EXTRA_USD : base
}
