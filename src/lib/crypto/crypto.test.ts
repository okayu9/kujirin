import { randInt } from './index'

describe('randInt', () => {
  it('returns 0 for max <= 0', () => {
    expect(randInt(0)).toBe(0)
    expect(randInt(-1)).toBe(0)
    expect(randInt(-100)).toBe(0)
  })

  it('returns 0 for max = 1', () => {
    // randInt(1) should always return 0 (range is [0, 1))
    for (let i = 0; i < 100; i++) {
      expect(randInt(1)).toBe(0)
    }
  })

  it('returns values in range [0, max)', () => {
    const max = 10
    const results = new Set<number>()

    for (let i = 0; i < 1000; i++) {
      const value = randInt(max)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(max)
      results.add(value)
    }

    // Should eventually hit all values (with high probability)
    expect(results.size).toBe(max)
  })

  it('produces reasonably uniform distribution', () => {
    const max = 5
    const counts = new Map<number, number>()

    const iterations = 5000
    for (let i = 0; i < iterations; i++) {
      const value = randInt(max)
      counts.set(value, (counts.get(value) || 0) + 1)
    }

    const expected = iterations / max
    const tolerance = expected * 0.3 // 30% tolerance

    for (let i = 0; i < max; i++) {
      const count = counts.get(i) || 0
      expect(count).toBeGreaterThan(expected - tolerance)
      expect(count).toBeLessThan(expected + tolerance)
    }
  })
})
