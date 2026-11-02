'use client'

import { useEffect } from 'react'
import { LightboxView } from '@/components/LightboxView'
import { markV11Flow } from '@/lib/flow'

export default function Page() {
  useEffect(() => markV11Flow(), [])
  return <LightboxView v11 />
}
