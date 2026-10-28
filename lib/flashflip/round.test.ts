import { describe, expect, it } from 'vitest'
import { isComplete } from './round'

describe('isComplete', () => {
  it('is false while cards remain', () => {
    expect(isComplete({ order: ['c0', 'c1'], index: 0, results: {} })).toBe(false)
    expect(isComplete({ order: ['c0', 'c1'], index: 1, results: { c0: 'knew' } })).toBe(false)
  })

  it('is true when index reaches the end of the order', () => {
    expect(isComplete({ order: ['c0', 'c1'], index: 2, results: { c0: 'knew', c1: 'missed' } })).toBe(true)
  })
})
