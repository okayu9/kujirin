import { randInt } from '../crypto'
import type { LadderData, Rung } from './ladder'
import { generatePermutation } from './shuffle'

/**
 * Invert permutation: given perm[start]=goal, return inv where inv[goal]=start
 */
function invertPerm(perm: number[]): number[] {
  const n = perm.length
  const inv = new Array(n)
  for (let s = 0; s < n; s++) {
    inv[perm[s]] = s
  }
  return inv
}

/**
 * Convert end_array to a list of adjacent swap indices.
 * Starting from [0,1,2,...], produce swaps that transform it into end_array.
 */
function adjacentSwapsToReachEndArray(endArray: number[]): number[] {
  const n = endArray.length
  const cur = Array.from({ length: n }, (_, i) => i)
  const pos = Array.from({ length: n }, (_, i) => i) // pos[label] = current index

  const swaps: number[] = []
  for (let targetIdx = 0; targetIdx < n; targetIdx++) {
    const wantLabel = endArray[targetIdx]
    let i = pos[wantLabel]
    while (i > targetIdx) {
      // swap positions i-1 and i
      const leftLabel = cur[i - 1]
      ;[cur[i - 1], cur[i]] = [cur[i], cur[i - 1]]
      pos[wantLabel]--
      pos[leftLabel]++
      swaps.push(i - 1)
      i--
    }
  }
  return swaps
}

/**
 * Convert perm[start]=goal to a swap list to apply top->bottom
 */
function permToSwapList(permStartToGoal: number[]): number[] {
  const endArray = invertPerm(permStartToGoal)
  return adjacentSwapsToReachEndArray(endArray)
}

/**
 * Insert adjacent canceling pairs (i, i) into the swap list.
 * Adjacent pairs are identity (s_i * s_i = e), so they don't change the permutation.
 * The MCMC step will spread them out naturally.
 */
function insertAdjacentCancelPairs(
  swaps: number[],
  n: number,
  extraPairs: number
): number[] {
  if (extraPairs <= 0) return [...swaps]

  const out = [...swaps]

  for (let p = 0; p < extraPairs; p++) {
    const i = randInt(n - 1)
    const pos = randInt(out.length + 1)
    // Insert adjacent pair (i, i) which is identity
    out.splice(pos, 0, i, i)
  }

  return out
}

/**
 * Apply random local rewrites (MCMC) that preserve the permutation:
 * - Commutation: s_i s_j <-> s_j s_i when |i-j| > 1
 * - Braid: s_i s_{i+1} s_i <-> s_{i+1} s_i s_{i+1}
 */
function randomRewriteMcmc(swaps: number[], steps: number = 50000): number[] {
  if (swaps.length < 2) return [...swaps]

  const out = [...swaps]

  for (let step = 0; step < steps; step++) {
    const r = randInt(100)
    const L = out.length

    if (r < 65 && L >= 2) {
      // Try commutation on a random adjacent pair
      const k = randInt(L - 1)
      const a = out[k]
      const b = out[k + 1]
      if (Math.abs(a - b) > 1) {
        out[k] = b
        out[k + 1] = a
      }
    } else if (L >= 3) {
      // Try braid on a random triple
      const k = randInt(L - 2)
      const x = out[k]
      const y = out[k + 1]
      const z = out[k + 2]

      // Pattern: i, i+1, i <-> i+1, i, i+1
      if (x === z && Math.abs(x - y) === 1) {
        out[k] = y
        out[k + 1] = x
        out[k + 2] = y
      }
    }
  }

  return out
}

/**
 * Assign row numbers to swap indices with constraints:
 * - Same column pair must be separated by minSameIGapRows
 * - No visual collisions at the same row
 */
function assignRows(
  swapIndices: number[],
  minSameIGapRows: number = 2,
  rowStepChoices: number[] = [1, 1, 2, 2, 3]
): Rung[] {
  const rungs: Rung[] = []
  const lastRowForI: Map<number, number> = new Map()
  const rowUsed: Map<number, Set<number>> = new Map()

  let curRow = 0

  for (const i of swapIndices) {
    // Base progression with jitter
    curRow += rowStepChoices[randInt(rowStepChoices.length)]

    let row = curRow

    // Push down until constraints satisfied
    while (true) {
      // Same-i vertical spacing
      const lastRow = lastRowForI.get(i)
      if (lastRow !== undefined && row < lastRow + minSameIGapRows) {
        row = lastRow + minSameIGapRows
      }

      // At the same row, avoid i-1, i, i+1 already used
      const used = rowUsed.get(row) ?? new Set()
      if (used.has(i) || used.has(i - 1) || used.has(i + 1)) {
        row++
        continue
      }

      break
    }

    rungs.push({ column: i, row })
    lastRowForI.set(i, row)

    const usedColumns = rowUsed.get(row)
    if (usedColumns) {
      usedColumns.add(i)
    } else {
      rowUsed.set(row, new Set([i]))
    }

    // Keep curRow in sync
    curRow = Math.max(curRow, row)
  }

  return rungs
}

/**
 * Generate a fair and natural-looking amidakuji
 */
export function generateAmida(n: number): LadderData {
  if (n < 2) {
    return {
      columns: n,
      rows: 1,
      rungs: [],
      permutation: n === 1 ? [0] : [],
    }
  }

  // Parameters (scaled by n for balance)
  // extraPairs: adds visual complexity without changing the result
  // Keep it proportional to n so small groups don't get overly long ladders
  const extraPairs = n * 3
  const rewriteSteps = n * 5000
  const minSameIGapRows = 2

  // 1) Fairness core: uniform random permutation
  const targetPerm = generatePermutation(n)

  // 2) Minimal swap list realizing exactly the mapping
  let swaps = permToSwapList(targetPerm)

  // 3) Add adjacent canceling pairs (these are identity, so they don't change permutation)
  swaps = insertAdjacentCancelPairs(swaps, n, extraPairs)

  // 4) Random local rewrites to "mix" and spread out the cancel pairs
  swaps = randomRewriteMcmc(swaps, rewriteSteps)

  // 5) Assign rows for drawing
  const sparseRungs = assignRows(swaps, minSameIGapRows)

  // Normalize row numbers to be consecutive (0, 1, 2, ...)
  // This is important because getEndColumn iterates through rows sequentially
  const usedRows = [...new Set(sparseRungs.map((r) => r.row))].sort((a, b) => a - b)
  const rowMap = new Map<number, number>()
  usedRows.forEach((oldRow, newRow) => rowMap.set(oldRow, newRow))

  const rungs: Rung[] = sparseRungs.map((r) => ({
    column: r.column,
    row: rowMap.get(r.row) ?? r.row,
  }))

  return {
    columns: n,
    rows: usedRows.length,
    rungs,
    permutation: targetPerm,
  }
}
