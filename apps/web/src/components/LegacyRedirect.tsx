'use client'

import { useEffect } from 'react'

/**
 * Old v1.1 addresses (/v1-1/...) from before v1.1 moved to the site root: send the visitor to the
 * same page without the prefix, keeping the query and hash.
 */
export function LegacyRedirect() {
  useEffect(() => {
    const { pathname, search, hash } = window.location
    const to = pathname.replace(/\/v1-1(?=\/|$)/, '') || '/'
    window.location.replace(`${to.endsWith('/') ? to : `${to}/`}${search}${hash}`)
  }, [])
  return null
}
