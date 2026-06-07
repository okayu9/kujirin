import { CHARS_PER_LINE, MAX_LINES } from './layout'

type SegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity?: 'grapheme' | 'word' | 'sentence' }
) => {
  segment(input: string): Iterable<{ segment: string }>
}

function splitGraphemes(text: string): string[] {
  const IntlWithSegmenter = Intl as typeof Intl & {
    Segmenter?: SegmenterConstructor
  }

  if (IntlWithSegmenter.Segmenter) {
    return Array.from(
      new IntlWithSegmenter.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
      (part) => part.segment
    )
  }

  return Array.from(text)
}

export function countGraphemes(text: string): number {
  return splitGraphemes(text).length
}

/**
 * Split text into lines for SVG display.
 * Each line has at most CHARS_PER_LINE characters.
 * If text exceeds MAX_LINES, the last line ends with ellipsis.
 */
export function splitTextToLines(text: string): string[] {
  const graphemes = splitGraphemes(text)

  if (graphemes.length <= CHARS_PER_LINE) {
    return [text]
  }

  const lines: string[] = []
  for (let i = 0; i < graphemes.length && lines.length < MAX_LINES; i += CHARS_PER_LINE) {
    if (lines.length === MAX_LINES - 1 && i + CHARS_PER_LINE < graphemes.length) {
      // Last line and there's more text - add ellipsis
      lines.push(graphemes.slice(i, i + CHARS_PER_LINE - 1).join('') + '…')
    } else {
      lines.push(graphemes.slice(i, i + CHARS_PER_LINE).join(''))
    }
  }

  return lines
}
