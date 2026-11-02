'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { MailCheck } from 'lucide-react'
import { V11Page } from '@/v11/Chrome'
import { useT } from '@/i18n'
import { useStore } from '@/lib/store'

/**
 * Passwordless sign-in, mirroring Shopify's new customer accounts:
 * email → 6-digit code → signed in (account created on first sign-in).
 */
function Login() {
  const t = useT()
  const router = useRouter()
  const next = useSearchParams().get('next') || '/v1-1/'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12">
      <form
        className="card flex flex-col gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (!sent) return setSent(true)
          useStore.getState().signIn(email)
          router.push(next)
        }}
      >
        <h1 className="font-serif text-3xl">{t.auth.signInTitle}</h1>
        {next.startsWith('/create') && <p className="rounded-xl bg-accent-soft p-3 text-sm">{t.auth.saveNeedsAccount}</p>}
        {!sent ? (
          <>
            <p className="text-sm text-muted">{t.auth.body}</p>
            <label className="block">
              <span className="label">{t.auth.email}</span>
              <input type="email" required autoFocus className="input mt-1.5" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button type="submit" className="btn-primary">
              {t.auth.sendCode}
            </button>
          </>
        ) : (
          <>
            <p className="flex items-start gap-2 text-sm">
              <MailCheck className="h-5 w-5 shrink-0 text-ok" aria-hidden /> {t.auth.codeSent(email)}
            </p>
            <label className="block">
              <span className="label">{t.auth.code}</span>
              <input
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                className="input mt-1.5 text-center font-mono text-2xl tracking-[0.5em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button type="submit" className="btn-primary">
              {t.auth.verify}
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" className="font-semibold text-accent hover:underline" onClick={() => setCode('')}>
                {t.auth.resend}
              </button>
              <button
                type="button"
                className="font-semibold text-accent hover:underline"
                onClick={() => {
                  setSent(false)
                  setCode('')
                }}
              >
                {t.auth.changeEmail}
              </button>
            </div>
          </>
        )}
        <p className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted">
          {t.v11.auth.codeNote}
        </p>
      </form>
    </main>
  )
}

export default function LoginPage() {
  return (
    <V11Page>
      <Suspense>
        <Login />
      </Suspense>
    </V11Page>
  )
}
