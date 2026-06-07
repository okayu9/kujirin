import {
  LABEL_BOX_MIN_HEIGHT,
  getLabelBoxHeight,
  getLabelLines,
  getLabelTextOffsetY,
} from './amidaLabel'

describe('amida label helpers', () => {
  it('splits label text using shared text rules', () => {
    expect(getLabelLines('ABCDE')).toEqual(['ABCD', 'E'])
  })

  it('calculates participant and reward label heights', () => {
    expect(getLabelBoxHeight('Alice', 'participant')).toBe(36)
    expect(getLabelBoxHeight('賞品A', 'reward')).toBe(20)
  })

  it('can enforce a minimum label height', () => {
    expect(getLabelBoxHeight('A', 'reward', { minHeight: LABEL_BOX_MIN_HEIGHT })).toBe(
      LABEL_BOX_MIN_HEIGHT
    )
  })

  it('returns text offsets for SVG labels', () => {
    expect(getLabelTextOffsetY('participant')).toBe(13)
    expect(getLabelTextOffsetY('reward')).toBe(12)
  })
})
