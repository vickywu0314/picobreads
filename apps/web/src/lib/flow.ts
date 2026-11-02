'use client'

// Which site version the visitor is using, so shared tool pages (/bead, /lightbox, /lab) can
// link back to the right place and match its wording. Set by every v1.1 page.
const KEY = 'pb-flow'

export function markV11Flow() {
  try {
    sessionStorage.setItem(KEY, 'v11')
  } catch {}
}

export function markV10Flow() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {}
}

export function isV11Flow(): boolean {
  if (typeof window === 'undefined') return false
  if (window.location.pathname.startsWith('/v1-1')) return true
  try {
    return sessionStorage.getItem(KEY) === 'v11'
  } catch {
    return false
  }
}
