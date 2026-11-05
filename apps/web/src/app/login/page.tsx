'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { V11Page } from '@/v11/Chrome'
import { useT } from '@/i18n'
import { api, ApiError, oauthStartUrl } from '@/lib/api'
import { pullDesigns } from '@/lib/account'
import { useStore, type AccountUser } from '@/lib/store'

type Mode = 'login' | 'register' | 'reset'
const PROVIDERS = ['wechat', 'google', 'apple', 'facebook'] as const

/** Brand marks for the sign-in buttons (simplified, single color where the brand allows). */
function ProviderIcon({ id }: { id: (typeof PROVIDERS)[number] }) {
  const c = 'h-5 w-5 shrink-0'
  if (id === 'google')
    return (
      <svg viewBox="0 0 24 24" className={c} aria-hidden>
        <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
        <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z" />
        <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
      </svg>
    )
  if (id === 'wechat')
    return (
      <svg viewBox="0 0 24 24" className={c} aria-hidden>
        <path fill="#07C160" d="M9 3.5C4.9 3.5 1.6 6.3 1.6 9.7c0 2 1.1 3.7 2.8 4.8l-.7 2.1 2.5-1.3c.9.3 1.8.4 2.8.4h.6a5.6 5.6 0 0 1-.2-1.6c0-3.4 3.2-6.1 7.2-6.1h.6C16.6 5.6 13.2 3.5 9 3.5zM6.6 8.6a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8zm4.9 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z" />
        <path fill="#07C160" d="M22.4 14c0-2.9-2.8-5.2-6.3-5.2S9.8 11.1 9.8 14s2.8 5.2 6.3 5.2c.8 0 1.5-.1 2.2-.3l2 1.1-.6-1.8c1.6-.9 2.7-2.5 2.7-4.2zm-8.4-.8a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6zm4.2 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z" />
      </svg>
    )
  if (id === 'apple')
    return (
      <svg viewBox="0 0 24 24" className={c} aria-hidden>
        <path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2.1-.9-3.4-.9a5.1 5.1 0 0 0-4.3 2.6c-1.8 3.2-.5 7.9 1.3 10.5.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.2-2.6a11 11 0 0 0 1.4-3c-.1 0-2.8-1-2.8-4.2zM13.8 5c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" className={c} aria-hidden>
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
    </svg>
  )
}

function Login() {
  const t = useT()
  const l = t.v11.login
  const router = useRouter()
  const params = useSearchParams()
  const raw = params.get('next') || '/'
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState<'code' | 'submit' | null>(null)
  const [error, setError] = useState<string | null>(params.get('error'))
  const [providers, setProviders] = useState<string[] | null>(null)

  useEffect(() => {
    api<{ providers: string[] }>('/auth/providers')
      .then((r) => setProviders(r.providers))
      .catch(() => setProviders([]))
  }, [])
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
    setCode('')
    setSentTo(null)
  }
  const message = (e: unknown) => l.errors[e instanceof ApiError ? e.code : 'server_error'] ?? l.errors.server_error

  const sendCode = async () => {
    setError(null)
    setBusy('code')
    try {
      await api('/auth/email/send-code', { body: { email, purpose: mode === 'reset' ? 'reset' : 'register' } })
      setSentTo(email.trim())
      setCooldown(60)
    } catch (e) {
      setError(message(e))
    } finally {
      setBusy(null)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy('submit')
    try {
      const path = mode === 'login' ? '/auth/email/login' : mode === 'register' ? '/auth/email/register' : '/auth/email/reset'
      const { user } = await api<{ user: AccountUser }>(path, { body: { email, password, code, name } })
      useStore.getState().setUser(user)
      void pullDesigns()
      router.replace(next)
    } catch (err) {
      setError(message(err))
    } finally {
      setBusy(null)
    }
  }

  const needsCode = mode !== 'login'
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <div className="card p-6 sm:p-7">
        {mode !== 'reset' && (
          <div role="tablist" className="mb-5 grid grid-cols-2 rounded-full bg-[var(--surface-2)] p-1 text-sm font-bold">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-full py-2 transition-colors ${mode === m ? 'bg-[var(--surface)] text-[var(--fg)] shadow-sm' : 'text-[var(--muted)]'}`}
              >
                {m === 'login' ? l.signIn : l.register}
              </button>
            ))}
          </div>
        )}
        <h1 className="font-display text-2xl">{l.title[mode]}</h1>
        <p className="mt-1 text-sm text-muted">{l.welcome}</p>

        <form className="mt-5 flex flex-col gap-3.5" onSubmit={submit}>
          <label className="block">
            <span className="label">{l.email}</span>
            <input type="email" required autoComplete="email" className="input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          {needsCode && (
            <label className="block">
              <span className="label">{l.code}</span>
              <span className="mt-1.5 flex gap-2">
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="······"
                  className="input min-w-0 flex-1 text-center font-mono text-lg tracking-[0.4em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
                <button type="button" className="btn-secondary btn-motion shrink-0 px-4 text-sm" disabled={!email || cooldown > 0 || busy !== null} onClick={sendCode}>
                  {busy === 'code' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : sentTo ? l.resend(cooldown) : l.sendCode}
                </button>
              </span>
              {sentTo && (
                <span className="mt-2 flex items-start gap-1.5 text-xs text-[var(--ok)]">
                  <MailCheck className="h-4 w-4 shrink-0" aria-hidden /> {mode === 'reset' ? l.resetSent(sentTo) : l.codeSent(sentTo)}
                </span>
              )}
            </label>
          )}

          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="label">{mode === 'reset' ? l.newPassword : l.password}</span>
              {mode === 'login' ? (
                <button type="button" className="text-xs font-bold text-[var(--accent)] hover:underline" onClick={() => switchMode('reset')}>
                  {l.forgot}
                </button>
              ) : (
                <span className="text-xs text-muted">{l.passwordHint}</span>
              )}
            </span>
            <span className="relative mt-1.5 block">
              <input
                type={show ? 'text' : 'password'}
                required
                minLength={mode === 'login' ? undefined : 8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="input pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </span>
          </label>

          {mode === 'register' && (
            <label className="block">
              <span className="label">{l.name}</span>
              <input autoComplete="nickname" maxLength={40} className="input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent-hover)]">
              {l.errors[error] ?? error}
            </p>
          )}

          <button type="submit" className="btn-primary btn-motion mt-1 h-12" disabled={busy !== null}>
            {busy === 'submit' && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />} {l.submit[mode]}
          </button>
          {mode === 'reset' && (
            <button type="button" className="text-sm font-bold text-[var(--accent)] hover:underline" onClick={() => switchMode('login')}>
              {l.toLogin}
            </button>
          )}
        </form>

        <div className="mt-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-[var(--border)]" /> {l.or} <span className="h-px flex-1 bg-[var(--border)]" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {PROVIDERS.map((p) => {
            const on = !!providers?.includes(p)
            return (
              <a
                key={p}
                href={on ? oauthStartUrl(p, next) : undefined}
                aria-disabled={!on}
                title={on ? undefined : t.v11.comingSoon}
                onClick={(e) => !on && e.preventDefault()}
                className={`btn-secondary btn-motion h-11 justify-center gap-2 text-sm ${on ? '' : 'cursor-not-allowed opacity-50'}`}
              >
                <ProviderIcon id={p} /> {l.providers[p]}
              </a>
            )
          })}
        </div>
        {providers !== null && providers.length === 0 && <p className="mt-2 text-center text-xs text-muted">{l.noProviders}</p>}
        <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs text-muted">{l.terms}</p>
      </div>
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
