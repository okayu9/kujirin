import { countGraphemes, splitTextToLines } from './text'

describe('countGraphemes', () => {
  it('counts emoji sequences as one visible character', () => {
    expect(countGraphemes('👨‍👩‍👧‍👦')).toBe(1)
  })
})

describe('splitTextToLines', () => {
  it('does not split emoji sequences', () => {
    const lines = splitTextToLines('ABCD👨‍👩‍👧‍👦EFGH')

    expect(lines).toEqual(['ABCD', '👨‍👩‍👧‍👦EFG', 'H'])
  })

  it('adds an ellipsis without splitting graphemes', () => {
    const lines = splitTextToLines('ABCD👨‍👩‍👧‍👦EFGHIJKL')

    expect(lines).toEqual(['ABCD', '👨‍👩‍👧‍👦EFG', 'HIJ…'])
  })
})
