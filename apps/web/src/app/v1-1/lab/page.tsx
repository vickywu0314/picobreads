'use client'

import { useEffect } from 'react'
import { LabView } from '@/components/LabView'
import { markV11Flow } from '@/lib/flow'

export default function Page() {
  useEffect(() => markV11Flow(), [])
  return <LabView v11 />
}
