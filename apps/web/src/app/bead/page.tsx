'use client'

import { BeadEditor } from '@/components/bead/BeadEditor'

/** v1.1 online beading: the shared editor in the v1.1 look, wired into the v1.1 flow. */
export default function V11BeadPage() {
  return (
    <div className="v11 v11-bead">
      <BeadEditor v11 />
    </div>
  )
}
