'use client'

/**
 * BeadSpark API client. The API runs on the same domain under /api (Nginx → Node service, see
 * apps/api). NEXT_PUBLIC_API_BASE can point elsewhere for local development.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code)
  }
}

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
      credentials: 'include',
      headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError('network', 0)
  }
  let data: Record<string, unknown> = {}
  try {
    data = await res.json()
  } catch {
    // Static hosting without the API answers /api/... with an HTML 404 page.
    if (!res.ok) throw new ApiError(res.status === 404 ? 'no_api' : 'server_error', res.status)
  }
  if (!res.ok) throw new ApiError(typeof data.error === 'string' ? data.error : 'server_error', res.status)
  return data as T
}

/** Where to send the browser to sign in with a third-party account. */
export const oauthStartUrl = (provider: string, next: string) => `${API_BASE}/api/auth/${provider}/start?next=${encodeURIComponent(next)}`
