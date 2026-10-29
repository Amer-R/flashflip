import { describe, expect, it } from 'vitest'
import { canRetry, isComplete, missedIds, scoreOf } from './round'
import type { Round } from './types'

const ten = Array.from({ length: 10 }, (_, i) => `c${i}`)

function completed(result: (id: string, i: number) => 'knew' | 'missed', order = ten): Round {
  return { order, index: order.length, results: Object.fromEntries(order.map((id, i) => [id, result(id, i)])) }
}

describe('isComplete', () => {
  it('is false while cards remain', () => {
    expect(isComplete({ order: ['c0', 'c1'], index: 0, results: {} })).toBe(false)
    expect(isComplete({ order: ['c0', 'c1'], index: 1, results: { c0: 'knew' } })).toBe(false)
  })

  it('is true when index reaches the end of the order', () => {
    expect(isComplete({ order: ['c0', 'c1'], index: 2, results: { c0: 'knew', c1: 'missed' } })).toBe(true)
  })
})

describe('scoreOf, missedIds, canRetry', () => {
  it('mixed round: 7 knew, 3 missed', () => {
    const round = completed((_, i) => (i < 7 ? 'knew' : 'missed'))
    expect(scoreOf(round)).toEqual({ knew: 7, total: 10 })
    expect(missedIds(round)).toEqual(['c7', 'c8', 'c9'])
    expect(canRetry(round)).toBe(true)
  })

  it('all known: 10 of 10, no retry', () => {
    const round = completed(() => 'knew')
    expect(scoreOf(round)).toEqual({ knew: 10, total: 10 })
    expect(missedIds(round)).toEqual([])
    expect(canRetry(round)).toBe(false)
  })

  it('all missed: 0 of 10, retry offers all 10', () => {
    const round = completed(() => 'missed')
    expect(scoreOf(round)).toEqual({ knew: 0, total: 10 })
    expect(missedIds(round)).toEqual(ten)
    expect(canRetry(round)).toBe(true)
  })

  it('total is the round size, not the deck size', () => {
    const round = completed((_, i) => (i === 0 ? 'knew' : 'missed'), ['c7', 'c2', 'c9'])
    expect(scoreOf(round)).toEqual({ knew: 1, total: 3 })
  })

  it('missedIds follows order order, not results order', () => {
    const round: Round = {
      order: ['c3', 'c0', 'c2', 'c1'],
      index: 4,
      results: { c1: 'missed', c2: 'knew', c0: 'missed', c3: 'missed' },
    }
    expect(missedIds(round)).toEqual(['c3', 'c0', 'c1'])
  })

  it('ignores a result keyed by an id outside order', () => {
    const round: Round = { order: ['c0', 'c1'], index: 2, results: { c0: 'knew', c1: 'knew', c5: 'missed' } }
    expect(missedIds(round)).toEqual([])
    expect(canRetry(round)).toBe(false)
    expect(scoreOf(round)).toEqual({ knew: 2, total: 2 })

    const stray: Round = { order: ['c0'], index: 1, results: { c0: 'missed', c9: 'knew' } }
    expect(scoreOf(stray)).toEqual({ knew: 0, total: 1 })
    expect(missedIds(stray)).toEqual(['c0'])
  })
})
