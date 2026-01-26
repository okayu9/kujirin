import { CHARS_PER_LINE, MAX_LINES } from './layout'

/**
 * Split text into lines for SVG display.
 * Each line has at most CHARS_PER_LINE characters.
 * If text exceeds MAX_LINES, the last line ends with ellipsis.
 */
export function splitTextToLines(text: string): string[] {
  if (text.length <= CHARS_PER_LINE) {
    return [text]
  }

  const lines: string[] = []
  for (let i = 0; i < text.length && lines.length < MAX_LINES; i += CHARS_PER_LINE) {
    if (lines.length === MAX_LINES - 1 && i + CHARS_PER_LINE < text.length) {
      // Last line and there's more text - add ellipsis
      lines.push(text.slice(i, i + CHARS_PER_LINE - 1) + '…')
    } else {
      lines.push(text.slice(i, i + CHARS_PER_LINE))
    }
  }

  return lines
}
