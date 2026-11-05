/**
 * BeadSpark logo mark: a fuse bead (seen from the top, with its hole and a little side wall) on a
 * pink tile, with a sparkle at the upper right. Same drawing as app/icon.svg and public/logo.svg.
 */
export function BeadSparkMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="#d93d72" />
      {/* bead: side wall, top face, hole */}
      <ellipse cx="22" cy="28.5" rx="12.5" ry="10.5" fill="#f3c6d3" />
      <ellipse cx="22" cy="25.5" rx="12.5" ry="10.5" fill="#ffffff" />
      <ellipse cx="22" cy="25.5" rx="4.6" ry="3.9" fill="#d93d72" />
      <path d="M14.5 20.5 A9 7.5 0 0 1 20 17.6" stroke="#fde3ea" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* sparkle */}
      <path d="M37 4.5 C37.8 9.6 39.4 11.2 44.5 12 C39.4 12.8 37.8 14.4 37 19.5 C36.2 14.4 34.6 12.8 29.5 12 C34.6 11.2 36.2 9.6 37 4.5 Z" fill="#ffd76e" stroke="#d93d72" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="30.5" cy="5.5" r="1.6" fill="#ffd76e" />
    </svg>
  )
}

/** Wordmark: "Bead" in cocoa, "Spark" in pink. */
export function BeadSparkWord({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display whitespace-nowrap tracking-tight ${className}`}>
      Bead<span className="text-[var(--accent)]">Spark</span>
    </span>
  )
}
