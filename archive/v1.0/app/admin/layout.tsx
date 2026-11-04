'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Logo } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useT } from '@/i18n'

const KEY = 'pb-admin'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useT()
  const path = usePathname()
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setAuthed(sessionStorage.getItem(KEY) === '1')
    } catch {
      setAuthed(false)
    }
  }, [])

  if (authed === null) return null

  if (!authed)
    return (
      <main className="grid min-h-[80vh] place-items-center p-4">
        <form
          className="card w-full max-w-sm p-6"
          onSubmit={(e) => {
            e.preventDefault()
            try {
              sessionStorage.setItem(KEY, '1')
            } catch {}
            setAuthed(true)
          }}
        >
          <Lock className="h-8 w-8 text-accent" aria-hidden />
          <h1 className="mt-3 text-xl font-bold">{t.admin.loginTitle}</h1>
          <label className="mt-4 block">
            <span className="label">{t.admin.password}</span>
            <input type="password" required className="input mt-1.5" autoComplete="current-password" />
          </label>
          <button type="submit" className="btn-primary mt-5 w-full">
            {t.admin.signIn}
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
            <ProtoTag /> {t.admin.loginNote}
          </p>
        </form>
      </main>
    )

  const tabs = [
    { href: '/admin/', label: t.admin.orders, active: !path.includes('/settings') },
    { href: '/admin/settings/', label: t.admin.settings, active: path.includes('/settings') },
  ]

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="whitespace-nowrap rounded-full bg-fg px-2 py-0.5 text-xs font-bold text-bg">{t.admin.title}</span>
            <ProtoTag />
          </div>
          <div className="flex items-center">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-3 py-2 text-sm font-semibold ${
                tab.active ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  )
}
