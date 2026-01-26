import { getParticipantColor, getParticipantColorMap, shouldUseColors } from './colors'

describe('getParticipantColor', () => {
  it('returns distinct colors for small groups', () => {
    const colors = []
    for (let i = 0; i < 6; i++) {
      colors.push(getParticipantColor(i, 6))
    }

    // All colors should be unique
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(6)
  })

  it('returns unified color for 7+ participants', () => {
    const colors = []
    for (let i = 0; i < 10; i++) {
      colors.push(getParticipantColor(i, 10))
    }

    // All colors should be the same
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(1)
  })

  it('cycles colors for exactly 6 participants', () => {
    const color0 = getParticipantColor(0, 6)
    const color6 = getParticipantColor(6, 6) // Would wrap around

    expect(color0).toBe(color6)
  })
})

describe('getParticipantColorMap', () => {
  it('creates map with distinct colors for small groups', () => {
    const participants = ['Alice', 'Bob', 'Charlie']
    const colorMap = getParticipantColorMap(participants)

    expect(colorMap.size).toBe(3)
    expect(colorMap.has('Alice')).toBe(true)
    expect(colorMap.has('Bob')).toBe(true)
    expect(colorMap.has('Charlie')).toBe(true)

    // All colors should be distinct
    const colors = [...colorMap.values()]
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(3)
  })

  it('creates map with unified color for 7+ participants', () => {
    const participants = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const colorMap = getParticipantColorMap(participants)

    expect(colorMap.size).toBe(7)

    // All colors should be the same
    const colors = [...colorMap.values()]
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(1)
  })

  it('handles empty participants', () => {
    const colorMap = getParticipantColorMap([])
    expect(colorMap.size).toBe(0)
  })
})

describe('shouldUseColors', () => {
  it('returns true for 1-6 participants', () => {
    expect(shouldUseColors(1)).toBe(true)
    expect(shouldUseColors(2)).toBe(true)
    expect(shouldUseColors(6)).toBe(true)
  })

  it('returns false for 7+ participants', () => {
    expect(shouldUseColors(7)).toBe(false)
    expect(shouldUseColors(10)).toBe(false)
  })
})
