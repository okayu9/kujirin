import { randInt } from '../crypto'

export type RandomInt = (max: number) => number

export function fisherYatesShuffle<T>(
  array: T[],
  randomInt: RandomInt = randInt
): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generatePermutation(
  n: number,
  randomInt: RandomInt = randInt
): number[] {
  const indices = Array.from({ length: n }, (_, i) => i)
  return fisherYatesShuffle(indices, randomInt)
}
