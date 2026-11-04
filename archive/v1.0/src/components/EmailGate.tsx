'use client'

import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { useT } from '@/i18n'
import { ProtoTag } from './PrototypeBanner'
import { Modal } from './ui'

export function EmailGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [sent, setSent] = useState(false)

  const close = () => {
    onClose()
    setTimeout(() => setSent(false), 200)
  }

  return (
    <Modal open={open} onClose={close} title={sent ? t.emailGate.sentTitle : t.emailGate.title}>
      {sent ? (
        <div className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-ok" aria-hidden />
          <p className="mt-3 text-muted">{t.emailGate.sentBody(email)}</p>
          <div className="mt-3">
            <ProtoTag />
          </div>
          <button type="button" className="btn-primary mt-6 w-full" onClick={close}>
            {t.common.done}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <p className="text-muted">{t.emailGate.body}</p>
          <label className="mt-5 block">
            <span className="label">{t.emailGate.email}</span>
            <input
              type="email"
              required
              autoComplete="email"
              className="input mt-1.5"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="mt-4 flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-[var(--accent)]"
            />
            {t.emailGate.consent}
          </label>
          <button type="submit" className="btn-primary mt-6 w-full">
            {t.emailGate.submit}
          </button>
          <div className="mt-3 text-center">
            <ProtoTag />
          </div>
        </form>
      )}
    </Modal>
  )
}
