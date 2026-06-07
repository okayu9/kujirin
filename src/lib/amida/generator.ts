import { randInt } from '../crypto'
import { assertValidLadder, type LadderData, type Rung } from './ladder'
import { generatePermutation, type RandomInt } from './shuffle'

// Generation parameters
const EXTRA_PAIRS_MULTIPLIER = 3 // extraPairs = n * this
const REWRITE_STEPS_MULTIPLIER = 1000 // rewriteSteps = n * this
const MIN_SAME_COLUMN_GAP_ROWS = 2 // minimum rows between same-column rungs
const ROW_STEP_CHOICES = [1, 1, 2, 2, 3] // random step sizes for visual variety

// MCMC rewrite probabilities (out of 100)
const COMMUTATION_PROBABILITY = 65 // probability of trying commutation vs braid

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
  extraPairs: number,
  randomInt: RandomInt
): number[] {
  if (extraPairs <= 0) return [...swaps]

  const out = [...swaps]

  for (let p = 0; p < extraPairs; p++) {
    const i = randomInt(n - 1)
    const pos = randomInt(out.length + 1)
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
function randomRewriteMcmc(
  swaps: number[],
  steps: number,
  randomInt: RandomInt
): number[] {
  if (swaps.length < 2) return [...swaps]

  const out = [...swaps]

  for (let step = 0; step < steps; step++) {
    const r = randomInt(100)
    const L = out.length

    if (r < COMMUTATION_PROBABILITY && L >= 2) {
      // Try commutation on a random adjacent pair
      const k = randomInt(L - 1)
      const a = out[k]
      const b = out[k + 1]
      if (Math.abs(a - b) > 1) {
        out[k] = b
        out[k + 1] = a
      }
    } else if (L >= 3) {
      // Try braid on a random triple
      const k = randomInt(L - 2)
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
  minSameIGapRows: number = MIN_SAME_COLUMN_GAP_ROWS,
  rowStepChoices: number[] = ROW_STEP_CHOICES,
  randomInt: RandomInt = randInt
): Rung[] {
  const rungs: Rung[] = []
  const lastRowForI: Map<number, number> = new Map()
  const rowUsed: Map<number, Set<number>> = new Map()

  let curRow = 0

  for (const i of swapIndices) {
    // Base progression with jitter
    curRow += rowStepChoices[randomInt(rowStepChoices.length)]

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
 * Generate a fair and natural-looking amidakuji.
 *
 * Unlike generateLadder, this creates a visually fuller ladder by adding
 * identity-preserving swap pairs and random rewrites after choosing the fair
 * target permutation.
 */
export interface GenerateAmidaOptions {
  randomInt?: RandomInt
  extraPairs?: number
  rewriteSteps?: number
}

export function generateAmida(
  n: number,
  options: GenerateAmidaOptions = {}
): LadderData {
  const randomInt = options.randomInt ?? randInt

  if (n < 2) {
    return {
      columns: n,
      rows: 1,
      rungs: [],
      permutation: n === 1 ? [0] : [],
    }
  }

  // Parameters scaled by n for balance
  const extraPairs = options.extraPairs ?? n * EXTRA_PAIRS_MULTIPLIER
  const rewriteSteps = options.rewriteSteps ?? n * REWRITE_STEPS_MULTIPLIER

  // 1) Fairness core: uniform random permutation
  const targetPerm = generatePermutation(n, randomInt)

  // 2) Minimal swap list realizing exactly the mapping
  let swaps = permToSwapList(targetPerm)

  // 3) Add adjacent canceling pairs (these are identity, so they don't change permutation)
  swaps = insertAdjacentCancelPairs(swaps, n, extraPairs, randomInt)

  // 4) Random local rewrites to "mix" and spread out the cancel pairs
  swaps = randomRewriteMcmc(swaps, rewriteSteps, randomInt)

  // 5) Assign rows for drawing
  const sparseRungs = assignRows(swaps, MIN_SAME_COLUMN_GAP_ROWS, ROW_STEP_CHOICES, randomInt)

  // Normalize row numbers to be consecutive (0, 1, 2, ...)
  // This is important because getEndColumn iterates through rows sequentially
  const usedRows = [...new Set(sparseRungs.map((r) => r.row))].sort((a, b) => a - b)
  const rowMap = new Map<number, number>()
  usedRows.forEach((oldRow, newRow) => rowMap.set(oldRow, newRow))

  const rungs: Rung[] = sparseRungs.map((r) => ({
    column: r.column,
    row: rowMap.get(r.row) ?? r.row,
  }))

  const ladder = {
    columns: n,
    rows: usedRows.length,
    rungs,
    permutation: targetPerm,
  }

  assertValidLadder(ladder)
  return ladder
}
