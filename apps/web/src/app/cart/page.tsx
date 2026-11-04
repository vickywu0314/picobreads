'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { V11Page } from '@/v11/Chrome'

/** Ordering isn't open yet, so there is no bag. */
export default function Moved() {
  const router = useRouter()
  useEffect(() => router.replace('/'), [router])
  return <V11Page footer={false}>{null}</V11Page>
}
