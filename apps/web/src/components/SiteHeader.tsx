'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { SITE } from '@/config/site'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span aria-hidden className="grid grid-cols-2 gap-0.5">
        {['#e4572e', '#f2b134', '#3fa7d6', '#59cd90'].map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
        ))}
      </span>
      <span className="text-lg">{SITE.name}</span>
    </Link>
  )
}

export function SiteHeader() {
  const t = useT()
  const hydrated = useHydrated()
  const count = useStore((s) => s.cart.reduce((n, c) => n + c.qty, 0))
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/85 backdrop-blur">
      <div className="container-page flex h-14 items-center justify-between gap-2">
        <Logo />
        <nav className="flex items-center gap-0.5 text-sm font-medium">
          <Link href="/create/" className="hidden rounded-full px-3 py-2 hover:bg-surface-2 sm:block">
            {t.nav.create}
          </Link>
          <Link href="/progress/" className="hidden rounded-full px-3 py-2 hover:bg-surface-2 sm:block">
            {t.nav.progress}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/cart/" className="icon-btn relative" aria-label={`${t.nav.cart} (${hydrated ? count : 0})`}>
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {hydrated && count > 0 && (
              <span className="absolute right-1 top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const t = useT()
  return (
    <footer className="mt-16 border-t border-border py-8 text-sm text-muted">
      <div className="container-page flex flex-wrap items-center justify-between gap-4">
        <span>
          © {new Date().getFullYear()} {SITE.name}
        </span>
        <nav className="flex flex-wrap gap-4">
          <Link href="/privacy/" className="hover:text-fg">
            {t.nav.privacy}
          </Link>
          <Link href="/progress/" className="hover:text-fg">
            {t.nav.progress}
          </Link>
          <Link href="/admin/" className="hover:text-fg">
            {t.nav.admin}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
