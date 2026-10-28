import { describe, expect, it } from 'vitest'
import { shuffle } from './shuffle'

/** Small deterministic PRNG so the shuffle can be tested with a fixed seed. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('shuffle', () => {
  it('gives the same permutation for the same seed and leaves the input unchanged', () => {
    const input = ['a', 'b', 'c', 'd'] as const
    const first = shuffle(input, mulberry32(42))
    const second = shuffle(input, mulberry32(42))
    expect(first).toEqual(second)
    expect([...first].sort()).toEqual(['a', 'b', 'c', 'd'])
    expect(input).toEqual(['a', 'b', 'c', 'd'])
    expect(first).not.toBe(input)
  })

  it('implements Fisher–Yates: j = floor(rng * (i + 1)) from the end', () => {
    // rng always 0 -> each position i swaps with 0: [a,b,c,d] -> [b,c,d,a]
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0)).toEqual(['b', 'c', 'd', 'a'])
    // rng just below 1 -> each position swaps with itself: identity
    expect(shuffle(['a', 'b', 'c', 'd'], () => 0.999999)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('returns a permutation with Math.random', () => {
    const ids = Array.from({ length: 50 }, (_, i) => `c${i}`)
    const out = shuffle(ids)
    expect(out).toHaveLength(ids.length)
    expect([...out].sort()).toEqual([...ids].sort())
  })

  it('handles empty and single-item inputs', () => {
    expect(shuffle([])).toEqual([])
    expect(shuffle(['only'])).toEqual(['only'])
  })

  it('is unbiased over all permutations of three items', () => {
    const rng = mulberry32(7)
    const counts = new Map<string, number>()
    const runs = 60000
    for (let n = 0; n < runs; n++) {
      const key = shuffle(['a', 'b', 'c'], rng).join('')
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    expect(counts.size).toBe(6)
    for (const count of counts.values()) {
      expect(Math.abs(count - runs / 6)).toBeLessThan(runs / 6 * 0.05)
    }
  })
})
