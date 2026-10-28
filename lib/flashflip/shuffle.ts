/** Unbiased Fisher–Yates shuffle. Returns a new array; the input is never mutated (AD-7). */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = result[i]
    result[i] = result[j]
    result[j] = tmp
  }
  return result
}
