/**
 * Generate a random integer in range [0, max) using rejection sampling
 * to avoid modulo bias.
 */
export function randInt(max: number): number {
  if (max <= 0) return 0
  if (max === 1) return 0

  const array = new Uint32Array(1)
  // Calculate the largest multiple of max that fits in uint32
  // Values >= limit would cause modulo bias
  const limit = 0x100000000 - (0x100000000 % max)

  let value: number
  do {
    crypto.getRandomValues(array)
    value = array[0]
  } while (value >= limit)

  return value % max
}
