import { enUS, type Messages } from './en-US'

// Single locale for now; later choose by user preference / URL prefix.
const locales: Record<string, Messages> = { 'en-US': enUS }
export const DEFAULT_LOCALE = 'en-US'

export function useT(): Messages {
  return locales[DEFAULT_LOCALE]
}
