// Amida SVG layout constants
export const COLUMN_WIDTH = 80
export const PADDING_X = 40
export const LABEL_HEIGHT = 55
export const ROW_HEIGHT = 30
export const MIN_AMIDA_ROWS = 6
export const LINE_HEIGHT_PADDING = 40
export const SVG_HEIGHT_PADDING = 40
export const VERTICAL_LINE_START_Y = LABEL_HEIGHT + 10
export const RUNG_START_Y = LABEL_HEIGHT + 30
export const REWARD_LABEL_OFFSET_Y = 18

// Text display constants
export const CHARS_PER_LINE = 4
export const MAX_LINES = 3
export const LINE_SPACING = 12

export function getColumnX(index: number): number {
  return PADDING_X + index * COLUMN_WIDTH + COLUMN_WIDTH / 2
}

export function getRungY(row: number): number {
  return RUNG_START_Y + row * ROW_HEIGHT
}

export function getAmidaRowCount(rows: number): number {
  return Math.max(rows, MIN_AMIDA_ROWS)
}

export function getAmidaSvgWidth(columnCount: number): number {
  return columnCount * COLUMN_WIDTH + PADDING_X * 2
}

export function getAmidaLineHeight(rowCount: number): number {
  return rowCount * ROW_HEIGHT + LINE_HEIGHT_PADDING
}

export function getAmidaSvgHeight(lineHeight: number): number {
  return lineHeight + LABEL_HEIGHT * 2 + SVG_HEIGHT_PADDING
}

export function getRewardLabelY(lineHeight: number): number {
  return LABEL_HEIGHT + lineHeight + REWARD_LABEL_OFFSET_Y
}
