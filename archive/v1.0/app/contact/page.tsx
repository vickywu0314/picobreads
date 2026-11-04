'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { ContentPage } from '@/components/ContentPage'
import { useT } from '@/i18n'

export default function ContactPage() {
  const t = useT()
  const [sent, setSent] = useState(false)
  const c = t.pages.contact
  return (
    <ContentPage title={c.title}>
      <p className="text-muted">{c.body}</p>
      {sent ? (
        <p role="status" className="flex items-center gap-2 font-semibold text-ok">
          <CheckCircle2 className="h-5 w-5" aria-hidden /> {c.sent}
        </p>
      ) : (
        <form
          className="card flex flex-col gap-4 p-6 text-base"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <label className="block">
            <span className="label">{c.name}</span>
            <input required className="input mt-1.5" autoComplete="name" />
          </label>
          <label className="block">
            <span className="label">{c.email}</span>
            <input type="email" required className="input mt-1.5" autoComplete="email" />
          </label>
          <label className="block">
            <span className="label">{c.message}</span>
            <textarea required rows={5} className="input mt-1.5 h-auto py-3" />
          </label>
          <button type="submit" className="btn-primary self-start">
            {c.send}
          </button>
        </form>
      )}
    </ContentPage>
  )
}
