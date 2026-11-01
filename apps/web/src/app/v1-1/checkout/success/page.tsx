'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CheckCircle2, Grid3x3, Mail } from 'lucide-react'
import { V11Page } from '@/v11/Chrome'
import { ProtoTag } from '@/components/PrototypeBanner'
import { useT } from '@/i18n'
import { useStore } from '@/lib/store'

export default function SuccessPage() {
  const t = useT()
  const [order, setOrder] = useState('')

  // The bag placed the (fake) order just before navigating here.
  useEffect(() => {
    setOrder(`#${useStore.getState().orders[0]?.id ?? 'CM1000'}`)
  }, [])

  return (
    <V11Page>
      <main className="container-page max-w-2xl py-12 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-ok" aria-hidden />
        <h1 className="mt-4 font-serif text-4xl">{t.success.title}</h1>
        <p className="mt-2 text-muted">{t.success.body}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 font-mono text-sm">
          {t.success.order} {order} <ProtoTag />
        </p>
        <div className="card mt-10 p-6 text-left">
          <h2 className="font-bold">{t.success.next}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href="/bead/" className="btn-secondary">
              <Grid3x3 className="h-5 w-5" aria-hidden /> {t.success.keepBeading}
            </Link>
            <Link href="/v1-1/" className="btn-secondary">
              <Mail className="h-5 w-5" aria-hidden /> {t.v11.nav.home}
            </Link>
          </div>
        </div>
      </main>
    </V11Page>
  )
}
