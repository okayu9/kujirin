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
