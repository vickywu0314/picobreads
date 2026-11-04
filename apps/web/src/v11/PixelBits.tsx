/** Little cluster of pink "pixels", the decoration used across the v1.1 design. */
export function PixelBits({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  // 4 × 4 grid; which cells are filled and how dark.
  const cells: [number, number, string][] = [
    [0, 0, '#f4a7bd'],
    [2, 0, '#e8799b'],
    [1, 1, '#f9c6d4'],
    [2, 1, '#f4a7bd'],
    [0, 2, '#e8799b'],
    [1, 2, '#f4a7bd'],
    [3, 2, '#f9c6d4'],
    [2, 3, '#f4a7bd'],
  ]
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      {cells.map(([x, y, c]) => (
        <rect key={`${x}-${y}`} x={x * 10} y={y * 10} width={10} height={10} fill={c} />
      ))}
    </svg>
  )
}
