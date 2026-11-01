'use client'

import Link from 'next/link'
import { useT } from '@/i18n'

export function NoPattern({ href = '/create/' }: { href?: string }) {
  const t = useT()
  return (
    <div className="container-page grid min-h-[50vh] place-items-center text-center">
      <div>
        <p className="text-lg text-muted">{t.editor.noPattern}</p>
        <Link href={href} className="btn-primary mt-4">
          {t.editor.makeOne}
        </Link>
      </div>
    </div>
  )
}
