import type { Section } from './types'

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Split a width × height grid into pegboard-sized sections (default 29 × 29).
 * Edge sections are smaller when the size is not a multiple of the board.
 * Order: row by row, left to right. Labels: row letter + column number ("A1", "A2", "B1"…).
 */
export function splitSections(width: number, height: number, board = 29): Section[] {
  if (width <= 0 || height <= 0 || board <= 0) return []
  const out: Section[] = []
  const rows = Math.ceil(height / board)
  const cols = Math.ceil(width / board)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * board
      const y = r * board
      const label = `${ROW_LETTERS[r % 26]}${c + 1}`
      out.push({ id: label, label, x, y, w: Math.min(board, width - x), h: Math.min(board, height - y) })
    }
  }
  return out
}

export function sectionCellIndices(section: Section, width: number): number[] {
  const out: number[] = []
  for (let y = section.y; y < section.y + section.h; y++) {
    for (let x = section.x; x < section.x + section.w; x++) out.push(y * width + x)
  }
  return out
}

export function sectionAt(sections: Section[], x: number, y: number): Section | undefined {
  return sections.find((s) => x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h)
}
