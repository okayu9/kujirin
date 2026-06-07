import {
  COLUMN_WIDTH,
  LABEL_HEIGHT,
  PADDING_X,
  ROW_HEIGHT,
  getAmidaLineHeight,
  getAmidaRowCount,
  getAmidaSvgHeight,
  getAmidaSvgWidth,
  getColumnX,
  getRewardLabelY,
  getRungY,
} from './layout'

describe('layout helpers', () => {
  it('calculates column center positions', () => {
    expect(getColumnX(0)).toBe(PADDING_X + COLUMN_WIDTH / 2)
    expect(getColumnX(2)).toBe(PADDING_X + COLUMN_WIDTH * 2 + COLUMN_WIDTH / 2)
  })

  it('calculates rung y positions', () => {
    expect(getRungY(0)).toBe(LABEL_HEIGHT + 30)
    expect(getRungY(3)).toBe(LABEL_HEIGHT + 30 + ROW_HEIGHT * 3)
  })

  it('calculates SVG dimensions', () => {
    const rowCount = getAmidaRowCount(2)
    const lineHeight = getAmidaLineHeight(rowCount)

    expect(rowCount).toBe(6)
    expect(getAmidaSvgWidth(3)).toBe(COLUMN_WIDTH * 3 + PADDING_X * 2)
    expect(lineHeight).toBe(ROW_HEIGHT * 6 + 40)
    expect(getAmidaSvgHeight(lineHeight)).toBe(lineHeight + LABEL_HEIGHT * 2 + 40)
  })

  it('calculates reward label y positions', () => {
    expect(getRewardLabelY(220)).toBe(LABEL_HEIGHT + 220 + 18)
  })
})
