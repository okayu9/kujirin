import {
  fisherYatesShuffle,
  generatePermutation,
  permutationToSwaps,
  generateLadder,
  getEndColumn,
  generateAmida,
  tracePath,
  validateLadder,
  assertValidLadder,
} from './index'

function createSeededRandomInt(seed: number) {
  let state = seed >>> 0
  return (max: number): number => {
    if (max <= 0) return 0
    state = (state * 1664525 + 1013904223) >>> 0
    return state % max
  }
}

describe('fisherYatesShuffle', () => {
  it('produces permutation of original array', () => {
    const array = [1, 2, 3, 4, 5]
    const result = fisherYatesShuffle(array)

    expect(result.length).toBe(array.length)
    expect([...result].sort()).toEqual([...array].sort())
  })

  it('does not modify original array', () => {
    const array = [1, 2, 3, 4, 5]
    const original = [...array]
    fisherYatesShuffle(array)

    expect(array).toEqual(original)
  })

  it('accepts an injected random source for deterministic shuffles', () => {
    const array = [1, 2, 3, 4, 5]
    const result = fisherYatesShuffle(array, createSeededRandomInt(123))

    expect(result).toEqual([3, 5, 1, 2, 4])
  })
})

describe('generatePermutation', () => {
  it('produces valid permutation', () => {
    const perm = generatePermutation(5, createSeededRandomInt(1))

    expect(perm.length).toBe(5)
    expect([...perm].sort()).toEqual([0, 1, 2, 3, 4])
  })

  it('handles edge case of 1 element', () => {
    const perm = generatePermutation(1)

    expect(perm).toEqual([0])
  })
})

describe('permutationToSwaps', () => {
  it('converts identity permutation to empty swaps', () => {
    const swaps = permutationToSwaps([0, 1, 2, 3])
    expect(swaps).toEqual([])
  })

  it('converts simple swap', () => {
    const swaps = permutationToSwaps([1, 0])
    expect(swaps.length).toBeGreaterThan(0)
  })

  it('correctly decomposes permutation', () => {
    const perm = [2, 0, 1]
    const ladder = generateLadder(perm)

    // Verify by tracing paths
    for (let i = 0; i < perm.length; i++) {
      expect(getEndColumn(ladder, i)).toBe(perm[i])
    }
  })
})

describe('generateLadder', () => {
  it('produces ladder matching permutation', () => {
    const perm = [2, 0, 3, 1]
    const ladder = generateLadder(perm)

    expect(ladder.columns).toBe(4)
    expect(ladder.permutation).toEqual(perm)

    // Verify each path leads to correct end
    for (let i = 0; i < 4; i++) {
      const end = getEndColumn(ladder, i)
      expect(end).toBe(perm[i])
    }
  })

  it('handles identity permutation', () => {
    const perm = [0, 1, 2]
    const ladder = generateLadder(perm)

    expect(ladder.rungs.length).toBe(0)

    for (let i = 0; i < 3; i++) {
      expect(getEndColumn(ladder, i)).toBe(i)
    }
  })

  it('validates generated ladder invariants', () => {
    const ladder = generateLadder([2, 0, 3, 1])

    expect(validateLadder(ladder)).toEqual({ valid: true, errors: [] })
    expect(() => assertValidLadder(ladder)).not.toThrow()
  })

  it('reports invalid ladder invariants', () => {
    const result = validateLadder({
      columns: 3,
      rows: 1,
      rungs: [
        { column: 0, row: 0 },
        { column: 1, row: 0 },
      ],
      permutation: [0, 0, 2],
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('permutation must contain each column index exactly once')
    expect(result.errors).toContain('row 0 has colliding adjacent rungs')
  })
})

describe('generateAmida', () => {
  it('produces valid ladder structure', () => {
    const ladder = generateAmida(5, { randomInt: createSeededRandomInt(10) })

    expect(ladder.columns).toBe(5)
    expect(ladder.permutation.length).toBe(5)
    expect([...ladder.permutation].sort()).toEqual([0, 1, 2, 3, 4])
    expect(ladder.rungs.length).toBeGreaterThan(0)
  })

  it('path endpoints match permutation', () => {
    const ladder = generateAmida(6, { randomInt: createSeededRandomInt(20) })

    for (let i = 0; i < 6; i++) {
      const end = getEndColumn(ladder, i)
      expect(end).toBe(ladder.permutation[i])
    }
  })

  it('handles 10 columns (max limit)', () => {
    const start = performance.now()
    const ladder = generateAmida(10, { randomInt: createSeededRandomInt(30) })
    const elapsed = performance.now() - start

    // Should complete quickly
    expect(elapsed).toBeLessThan(500)
    expect(ladder.columns).toBe(10)
    expect(ladder.permutation.length).toBe(10)

    // Verify all paths are valid
    for (let i = 0; i < 10; i++) {
      const end = getEndColumn(ladder, i)
      expect(end).toBe(ladder.permutation[i])
    }
  })

  it('handles small cases', () => {
    const ladder2 = generateAmida(2, { randomInt: createSeededRandomInt(40) })
    expect(ladder2.columns).toBe(2)
    expect(getEndColumn(ladder2, 0)).toBe(ladder2.permutation[0])
    expect(getEndColumn(ladder2, 1)).toBe(ladder2.permutation[1])

    const ladder3 = generateAmida(3, { randomInt: createSeededRandomInt(50) })
    expect(ladder3.columns).toBe(3)
    for (let i = 0; i < 3; i++) {
      expect(getEndColumn(ladder3, i)).toBe(ladder3.permutation[i])
    }
  })

  it('produces different results with different random seeds', () => {
    const permutations = new Set<string>()

    for (let i = 0; i < 20; i++) {
      const ladder = generateAmida(4, { randomInt: createSeededRandomInt(i + 1) })
      permutations.add(ladder.permutation.join(','))
    }

    // With 4! = 24 possible permutations, we should see variety
    expect(permutations.size).toBeGreaterThan(1)
  })

  it('handles edge case of n=1', () => {
    const ladder = generateAmida(1)
    expect(ladder.columns).toBe(1)
    expect(ladder.permutation).toEqual([0])
    expect(ladder.rungs.length).toBe(0)
  })

  it('rungs do not have adjacent columns at the same row', () => {
    const ladder = generateAmida(6, { randomInt: createSeededRandomInt(60) })

    // Group rungs by row
    const rungsByRow = new Map<number, number[]>()
    for (const rung of ladder.rungs) {
      const rowRungs = rungsByRow.get(rung.row)
      if (rowRungs) {
        rowRungs.push(rung.column)
      } else {
        rungsByRow.set(rung.row, [rung.column])
      }
    }

    // Check each row for adjacent rungs
    for (const columns of rungsByRow.values()) {
      const sortedColumns = [...columns].sort((a, b) => a - b)
      for (let i = 1; i < sortedColumns.length; i++) {
        // Adjacent columns should have at least 2 difference
        expect(sortedColumns[i] - sortedColumns[i - 1]).toBeGreaterThan(1)
      }
    }
  })

  it('all rungs have valid column indices', () => {
    const ladder = generateAmida(5, { randomInt: createSeededRandomInt(70) })

    for (const rung of ladder.rungs) {
      expect(rung.column).toBeGreaterThanOrEqual(0)
      expect(rung.column).toBeLessThan(ladder.columns - 1) // column connects column and column+1
      expect(rung.row).toBeGreaterThanOrEqual(0)
      expect(rung.row).toBeLessThan(ladder.rows)
    }
  })
})

describe('tracePath', () => {
  it('returns correct path segments', () => {
    const ladder = generateAmida(4, { randomInt: createSeededRandomInt(80) })
    const path = tracePath(ladder, 0)

    // Path should have entries for each row
    expect(path.length).toBe(ladder.rows)

    // Each segment should have valid directions
    for (const segment of path) {
      expect(['down', 'left', 'right']).toContain(segment.direction)
    }
  })

  it('path ends at correct column', () => {
    const ladder = generateAmida(5, { randomInt: createSeededRandomInt(90) })

    for (let start = 0; start < 5; start++) {
      const path = tracePath(ladder, start)
      const lastSegment = path[path.length - 1]
      expect(lastSegment.endColumn).toBe(ladder.permutation[start])
    }
  })

  it('path is continuous', () => {
    const ladder = generateAmida(4, { randomInt: createSeededRandomInt(100) })
    const path = tracePath(ladder, 0)

    for (let i = 1; i < path.length; i++) {
      // Each segment should start where the previous ended
      expect(path[i].startColumn).toBe(path[i - 1].endColumn)
    }
  })
})
