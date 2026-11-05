'use client'

import { useEffect } from 'react'
import { api, ApiError } from './api'
import { useStore, type AccountUser, type SavedDesign } from './store'

type MeResponse = { user: AccountUser | null }

/** Ask the API who is signed in and update the store. Network problems leave the store as it is. */
export async function refreshMe() {
  try {
    const { user } = await api<MeResponse>('/auth/me')
    useStore.getState().setUser(user)
    return user
  } catch (e) {
    // No API on this host (e.g. the static preview): nobody can be signed in.
    if (e instanceof ApiError && e.code === 'no_api') useStore.getState().setUser(null)
    return useStore.getState().user
  }
}

/** Mounted once in the root layout: syncs the signed-in state when a page loads. */
export function AuthSync() {
  useEffect(() => {
    const run = () => {
      // Wait for the persisted store, so the server answer isn't overwritten by the local copy.
      if (useStore.persist.hasHydrated()) void refreshMe().then((u) => u && void pullDesigns())
      else useStore.persist.onFinishHydration(() => void refreshMe().then((u) => u && void pullDesigns()))
    }
    run()
  }, [])
  return null
}

export async function signOut() {
  try {
    await api('/auth/logout', { body: {} })
  } catch {}
  useStore.getState().setUser(null)
}

// --- drafts on the server ---------------------------------------------------------

type ServerDesign = { id: string; name: string; updatedAt: number; data: Omit<SavedDesign, 'id' | 'name' | 'updatedAt'> }

/** Photos bigger than this stay on this device only (the pattern itself is always synced). */
const MAX_PHOTO_CHARS = 1_500_000

/** Upload one draft (create or update). */
export async function pushDesign(d: SavedDesign) {
  const { id, name, updatedAt: _u, ...rest } = d
  const data = { ...rest, photo: d.photo && d.photo.length <= MAX_PHOTO_CHARS ? d.photo : null }
  await api(`/designs/${encodeURIComponent(id)}`, { method: 'PUT', body: { name, data } })
}

export async function removeDesignRemote(id: string) {
  await api(`/designs/${encodeURIComponent(id)}`, { method: 'DELETE', body: {} })
}

/**
 * Merge the account's drafts into this device: newer copy wins, server-only drafts are added,
 * drafts of this account that were only saved locally are uploaded.
 */
export async function pullDesigns() {
  const s = useStore.getState()
  const me = s.user
  if (!me) return
  let remote: ServerDesign[]
  try {
    remote = (await api<{ designs: ServerDesign[] }>('/designs')).designs
  } catch {
    return
  }
  const local = new Map(s.designs.map((d) => [d.id, d]))
  const merged: SavedDesign[] = []
  for (const r of remote) {
    const mine = local.get(r.id)
    const fromServer: SavedDesign = { ...(r.data as SavedDesign), id: r.id, name: r.name, updatedAt: new Date(r.updatedAt).toISOString(), owner: me.id }
    if (mine && new Date(mine.updatedAt).getTime() > r.updatedAt) merged.push({ ...mine, photo: mine.photo ?? fromServer.photo })
    else merged.push({ ...fromServer, photo: fromServer.photo ?? mine?.photo ?? null })
    local.delete(r.id)
  }
  for (const d of local.values()) {
    merged.push(d)
    // Saved on this device while signed in (or before accounts existed): upload it.
    if (!d.owner || d.owner === me.id) void pushDesign({ ...d, owner: me.id }).catch(() => {})
  }
  merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  useStore.setState({ designs: merged.map((d) => (!d.owner ? { ...d, owner: me.id } : d)) })
}

/** Save the current work as a draft (locally right away, then to the account). */
export async function saveDraft(name: string) {
  const s = useStore.getState()
  const id = s.saveDesign(name)
  if (!id || !s.user) return id
  const d = useStore.getState().designs.find((x) => x.id === id)
  if (d) await pushDesign(d)
  return id
}

export async function deleteDraft(id: string) {
  useStore.getState().deleteDesign(id)
  try {
    await removeDesignRemote(id)
  } catch {}
}
