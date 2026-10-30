'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { MailCheck } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { useT } from '@/i18n'
import { useStore } from '@/lib/store'

type Mode = 'signIn' | 'register' | 'reset'

function Login() {
  const t = useT()
  const router = useRouter()
  const next = useSearchParams().get('next') || '/account/'
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const title = mode === 'signIn' ? t.auth.signInTitle : mode === 'register' ? t.auth.registerTitle : t.auth.resetTitle

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <form
        className="card flex flex-col gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (mode === 'reset') return setResetSent(true)
          useStore.getState().signIn(email, name)
          router.push(next)
        }}
      >
        <h1 className="font-serif text-3xl">{title}</h1>
        {next.startsWith('/create') && <p className="rounded-xl bg-accent-soft p-3 text-sm">{t.auth.saveNeedsAccount}</p>}
        {mode === 'reset' && resetSent ? (
          <p role="status" className="flex items-start gap-2 text-sm">
            <MailCheck className="h-5 w-5 shrink-0 text-ok" aria-hidden /> {t.auth.resetSent(email)}
          </p>
        ) : (
          <>
            {mode === 'register' && (
              <label className="block">
                <span className="label">{t.auth.name}</span>
                <input required className="input mt-1.5" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            )}
            <label className="block">
              <span className="label">{t.auth.email}</span>
              <input type="email" required className="input mt-1.5" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {mode !== 'reset' && (
              <label className="block">
                <span className="label">{t.auth.password}</span>
                <input type="password" required className="input mt-1.5" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
              </label>
            )}
            {mode === 'signIn' && (
              <button type="button" className="self-start text-sm font-semibold text-accent hover:underline" onClick={() => setMode('reset')}>
                {t.auth.forgot}
              </button>
            )}
            <button type="submit" className="btn-primary">
              {mode === 'signIn' ? t.auth.submitSignIn : mode === 'register' ? t.auth.submitRegister : t.auth.submitReset}
            </button>
          </>
        )}
        <button
          type="button"
          className="text-sm font-semibold text-accent hover:underline"
          onClick={() => {
            setResetSent(false)
            setMode(mode === 'signIn' ? 'register' : 'signIn')
          }}
        >
          {mode === 'signIn' ? t.auth.toRegister : t.auth.toSignIn}
        </button>
        <p className="border-t border-border pt-4 text-xs text-muted">{t.auth.guest}</p>
        <p className="flex items-center gap-2 text-xs text-muted">
          <ProtoTag /> {t.auth.prototypeNote}
        </p>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/cart/" className="text-muted hover:text-fg">
          {t.nav.bag} →
        </Link>
      </p>
    </main>
  )
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <Login />
      </Suspense>
      <SiteFooter />
    </>
  )
}
