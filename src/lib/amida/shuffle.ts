import { randInt } from '../crypto'

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generatePermutation(n: number): number[] {
  const indices = Array.from({ length: n }, (_, i) => i)
  return fisherYatesShuffle(indices)
}
