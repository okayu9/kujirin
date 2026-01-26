/**
 * Generate a random integer in range [0, max)
 */
export function randInt(max: number): number {
  if (max <= 0) return 0
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}
