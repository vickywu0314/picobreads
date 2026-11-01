'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

interface ToastState {
  message: string | null
  show: (message: string) => void
}

export const useToast = create<ToastState>()((set) => ({
  message: null,
  show: (message) => set({ message }),
}))

/** Centered, semi-transparent toast ("Coming soon"). Auto-hides. */
export function Toast() {
  const message = useToast((s) => s.message)
  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => useToast.setState({ message: null }), 1600)
    return () => clearTimeout(id)
  }, [message])
  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center p-6" role="status" aria-live="polite">
      <div className="animate-[v11-pop_160ms_ease-out] rounded-2xl bg-black/70 px-7 py-4 text-base font-semibold text-white shadow-2xl backdrop-blur-sm">
        {message}
      </div>
    </div>
  )
}
