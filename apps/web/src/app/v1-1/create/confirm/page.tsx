'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { V11Page } from '@/v11/Chrome'

/** The confirm step was removed (free patterns download on the previous step; ordering isn't open yet). */
export default function Moved() {
  const router = useRouter()
  useEffect(() => router.replace('/v1-1/create/product/'), [router])
  return <V11Page footer={false}>{null}</V11Page>
}
