'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { V11Page } from '@/v11/Chrome'

/** The preview step was merged into "Customize" (settings); old links land there. */
export default function PreviewMoved() {
  const router = useRouter()
  useEffect(() => router.replace('/create/settings/'), [router])
  return <V11Page footer={false}>{null}</V11Page>
}
