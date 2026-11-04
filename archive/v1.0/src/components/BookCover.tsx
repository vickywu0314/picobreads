'use client'

/** Illustrated sample storybook cover (CSS only, clearly a sample). */
export function BookCover({ title, className = 'w-36' }: { title: string; className?: string }) {
  return (
    <div className={`relative aspect-[3/4] ${className} overflow-hidden rounded-r-lg rounded-l-sm bg-gradient-to-b from-[#3b3a7a] to-[#6c4f9e] shadow-xl`}>
      <div className="absolute inset-y-0 left-0 w-2 bg-black/25" />
      <div className="absolute right-4 top-4 h-10 w-10 rounded-full bg-[#ffe9a8] shadow-[0_0_24px_#ffe9a8]" />
      {[...Array(7)].map((_, i) => (
        <span key={i} className="absolute h-1 w-1 rounded-full bg-white/80" style={{ left: `${15 + ((i * 37) % 70)}%`, top: `${10 + ((i * 23) % 40)}%` }} />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-t-[50%] bg-[#4f8a5b]" />
      <p className="absolute inset-x-2 bottom-3 text-center font-serif text-[13px] leading-tight text-white">{title}</p>
    </div>
  )
}
