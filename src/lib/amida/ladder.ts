export interface Rung {
  column: number // left column index (0-based)
  row: number // row index (0-based)
}

export interface LadderData {
  columns: number
  rows: number
  rungs: Rung[]
  permutation: number[] // permutation[startColumn] = endColumn
}

export interface LadderValidationResult {
  valid: boolean
  errors: string[]
}

function isValidPermutation(permutation: number[], columns: number): boolean {
  if (permutation.length !== columns) return false

  const seen = new Set<number>()
  for (const value of permutation) {
    if (!Number.isInteger(value) || value < 0 || value >= columns || seen.has(value)) {
      return false
    }
    seen.add(value)
  }

  return true
}

export function permutationToSwaps(permutation: number[]): [number, number][] {
  const n = permutation.length
  const current = [...permutation]
  const swaps: [number, number][] = []

  for (let i = 0; i < n - 1; i++) {
    let j = i
    while (current[j] !== i) {
      j++
    }
    while (j > i) {
      ;[current[j], current[j - 1]] = [current[j - 1], current[j]]
      swaps.push([j - 1, j])
      j--
    }
  }

  return swaps
}

export function generateLadder(permutation: number[]): LadderData {
  const n = permutation.length
  const swaps = permutationToSwaps(permutation)

  if (swaps.length === 0) {
    return {
      columns: n,
      rows: 1,
      rungs: [],
      permutation,
    }
  }

  const rungs: Rung[] = []
  const rows: Set<number>[] = []
  let minRow = 0

  for (const [left] of swaps) {
    let rowIndex = minRow
    while (rowIndex < rows.length) {
      const row = rows[rowIndex]
      if (!row.has(left) && !row.has(left + 1) && !row.has(left - 1)) {
        break
      }
      rowIndex++
    }

    if (rowIndex === rows.length) {
      rows.push(new Set())
    }

    rows[rowIndex].add(left)
    rungs.push({ column: left, row: rowIndex })

    // Update minRow to ensure subsequent swaps that could affect
    // the same trace are placed in equal or later rows
    minRow = rowIndex
  }

  return {
    columns: n,
    rows: rows.length,
    rungs,
    permutation,
  }
}

function buildRungsByRow(rungs: Rung[]): Map<number, Rung[]> {
  const rungsByRow = new Map<number, Rung[]>()
  for (const rung of rungs) {
    const rowRungs = rungsByRow.get(rung.row)
    if (rowRungs) {
      rowRungs.push(rung)
    } else {
      rungsByRow.set(rung.row, [rung])
    }
  }
  return rungsByRow
}

export interface PathSegment {
  startColumn: number
  endColumn: number
  row: number
  direction: 'down' | 'left' | 'right'
}

export function tracePath(ladder: LadderData, startColumn: number): PathSegment[] {
  const segments: PathSegment[] = []
  let currentColumn = startColumn
  const rungsByRow = buildRungsByRow(ladder.rungs)

  for (let row = 0; row < ladder.rows; row++) {
    const rowRungs = rungsByRow.get(row) || []
    const rung = rowRungs.find(
      (r) => r.column === currentColumn || r.column === currentColumn - 1
    )

    if (rung) {
      if (rung.column === currentColumn) {
        segments.push({
          startColumn: currentColumn,
          endColumn: currentColumn + 1,
          row,
          direction: 'right',
        })
        currentColumn = currentColumn + 1
      } else {
        segments.push({
          startColumn: currentColumn,
          endColumn: currentColumn - 1,
          row,
          direction: 'left',
        })
        currentColumn = currentColumn - 1
      }
    } else {
      segments.push({
        startColumn: currentColumn,
        endColumn: currentColumn,
        row,
        direction: 'down',
      })
    }
  }

  return segments
}

export function getEndColumn(ladder: LadderData, startColumn: number): number {
  let currentColumn = startColumn
  const rungsByRow = buildRungsByRow(ladder.rungs)

  for (let row = 0; row < ladder.rows; row++) {
    const rowRungs = rungsByRow.get(row) || []
    const rung = rowRungs.find(
      (r) => r.column === currentColumn || r.column === currentColumn - 1
    )

    if (rung) {
      if (rung.column === currentColumn) {
        currentColumn = currentColumn + 1
      } else {
        currentColumn = currentColumn - 1
      }
    }
  }

  return currentColumn
}

export function validateLadder(ladder: LadderData): LadderValidationResult {
  const errors: string[] = []

  if (!Number.isInteger(ladder.columns) || ladder.columns < 0) {
    errors.push('columns must be a non-negative integer')
  }

  if (!Number.isInteger(ladder.rows) || ladder.rows < 0) {
    errors.push('rows must be a non-negative integer')
  }

  if (!isValidPermutation(ladder.permutation, ladder.columns)) {
    errors.push('permutation must contain each column index exactly once')
  }

  for (const rung of ladder.rungs) {
    if (!Number.isInteger(rung.column) || rung.column < 0 || rung.column >= ladder.columns - 1) {
      errors.push(`rung column ${rung.column} is out of range`)
    }
    if (!Number.isInteger(rung.row) || rung.row < 0 || rung.row >= ladder.rows) {
      errors.push(`rung row ${rung.row} is out of range`)
    }
  }

  const rungsByRow = buildRungsByRow(ladder.rungs)
  for (const [row, rungs] of rungsByRow) {
    const columns = rungs.map((rung) => rung.column).sort((a, b) => a - b)
    for (let i = 1; i < columns.length; i++) {
      if (columns[i] - columns[i - 1] <= 1) {
        errors.push(`row ${row} has colliding adjacent rungs`)
      }
    }
  }

  if (isValidPermutation(ladder.permutation, ladder.columns)) {
    for (let startColumn = 0; startColumn < ladder.columns; startColumn++) {
      const endColumn = getEndColumn(ladder, startColumn)
      if (endColumn !== ladder.permutation[startColumn]) {
        errors.push(
          `path from column ${startColumn} ends at ${endColumn}, expected ${ladder.permutation[startColumn]}`
        )
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function assertValidLadder(ladder: LadderData): void {
  const result = validateLadder(ladder)
  if (!result.valid) {
    throw new Error(`Invalid ladder data: ${result.errors.join('; ')}`)
  }
}
