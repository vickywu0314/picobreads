import type { ProductForm } from '@/config/catalog'
import { getTier, type TierId } from '@/config/site'

/** Price in USD (placeholders until real prices live in Shopify). The printable pattern is free. */
export function priceOf(form: ProductForm, tier: TierId) {
  const t = getTier(tier)
  return form === 'digital' ? 0 : form === 'finished' ? t.finishedPriceUsd : t.priceUsd
}
