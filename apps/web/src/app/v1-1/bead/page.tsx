'use client'

import { useEffect } from 'react'
import { BeadEditor } from '@/components/bead/BeadEditor'
import { markV11Flow } from '@/lib/flow'

/** v1.1 online beading: the shared editor in the v1.1 look, wired into the v1.1 flow. */
export default function V11BeadPage() {
  useEffect(() => markV11Flow(), [])
  return (
    <div className="v11 v11-bead">
      <BeadEditor v11 />
    </div>
  )
}
