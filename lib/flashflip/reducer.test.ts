import { describe, expect, it } from 'vitest'
import { flashflipReducer, initialState } from './reducer'
import { isComplete } from './round'
import type { AppState, Card } from './types'

const deck: Card[] = [
  { id: 'c0', term: 'a', definition: 'b' },
  { id: 'c1', term: 'c', definition: 'd' },
]

const inQuiz: AppState = {
  deck,
  round: { order: ['c0', 'c1'], index: 1, results: { c0: 'knew' } },
  view: 'quiz',
}

const tenCards: Card[] = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, term: `t${i}`, definition: `d${i}` }))
const tenOrder = ['c3', 'c7', 'c0', 'c9', 'c1', 'c5', 'c2', 'c8', 'c4', 'c6']

function roundAt(index: number): AppState {
  const results: Record<string, 'knew' | 'missed'> = {}
  for (const id of tenOrder.slice(0, index)) results[id] = 'missed'
  return { deck: tenCards, round: { order: tenOrder, index, results }, view: 'quiz' }
}

describe('initialState', () => {
  it('starts on paste with no round', () => {
    expect(initialState(deck)).toEqual({ deck, round: null, view: 'paste' })
    expect(initialState(null)).toEqual({ deck: null, round: null, view: 'paste' })
  })
})

describe('flashflipReducer', () => {
  it('replaceDeck stores the cards unchanged and resets round and view', () => {
    const cards: Card[] = [{ id: 'c0', term: 'x', definition: 'y' }]
    const next = flashflipReducer(inQuiz, { type: 'replaceDeck', cards })
    expect(next).toEqual({ deck: cards, round: null, view: 'paste' })
    expect(next.deck).toBe(cards)
  })

  it('clearDeck sets deck to null', () => {
    expect(flashflipReducer(inQuiz, { type: 'clearDeck' })).toEqual({ deck: null, round: null, view: 'paste' })
  })

  it('goToPaste keeps the deck and drops the round', () => {
    expect(flashflipReducer(inQuiz, { type: 'goToPaste' })).toEqual({ deck, round: null, view: 'paste' })
  })

  describe('startRound', () => {
    it('starts a round at index 0 in quiz view with the given order', () => {
      const state = initialState(tenCards)
      const next = flashflipReducer(state, { type: 'startRound', order: tenOrder })
      expect(next).toEqual({ deck: tenCards, round: { order: tenOrder, index: 0, results: {} }, view: 'quiz' })
      expect(next.round?.order).toBe(tenOrder)
    })

    it('replaces a finished round', () => {
      const done = flashflipReducer(roundAt(9), { type: 'mark', result: 'knew' })
      const next = flashflipReducer(done, { type: 'startRound', order: ['c1', 'c0'] })
      expect(next.round).toEqual({ order: ['c1', 'c0'], index: 0, results: {} })
      expect(next.view).toBe('quiz')
    })

    it('is refused when there is no deck', () => {
      const state = initialState(null)
      expect(flashflipReducer(state, { type: 'startRound', order: ['c0'] })).toBe(state)
    })

    it('is refused for an empty order', () => {
      const state = initialState(deck)
      expect(flashflipReducer(state, { type: 'startRound', order: [] })).toBe(state)
    })

    it('is refused when an id is not in the deck', () => {
      const state = initialState(deck)
      expect(flashflipReducer(state, { type: 'startRound', order: ['c0', 'c9'] })).toBe(state)
    })
  })

  describe('mark', () => {
    it('records the current card and advances mid-round', () => {
      const next = flashflipReducer(roundAt(3), { type: 'mark', result: 'knew' })
      expect(next.round?.results[tenOrder[3]]).toBe('knew')
      expect(next.round?.index).toBe(4)
      expect(next.round?.order).toBe(tenOrder)
      expect(next.view).toBe('quiz')
      expect(next.deck).toBe(tenCards)
    })

    it('records missed', () => {
      const next = flashflipReducer(roundAt(0), { type: 'mark', result: 'missed' })
      expect(next.round?.results).toEqual({ [tenOrder[0]]: 'missed' })
    })

    it('does not mutate the previous round', () => {
      const before = roundAt(3)
      const snapshot = structuredClone(before)
      flashflipReducer(before, { type: 'mark', result: 'knew' })
      expect(before).toEqual(snapshot)
    })

    it('completes the round on the last card and moves to score', () => {
      const next = flashflipReducer(roundAt(9), { type: 'mark', result: 'knew' })
      expect(next.round?.index).toBe(10)
      expect(next.view).toBe('score')
      expect(next.round && isComplete(next.round)).toBe(true)
      expect(Object.keys(next.round?.results ?? {}).sort()).toEqual([...tenOrder].sort())
    })

    it('does nothing when there is no round', () => {
      const state = initialState(deck)
      expect(flashflipReducer(state, { type: 'mark', result: 'knew' })).toBe(state)
    })

    it('does nothing when the round is already complete', () => {
      const done = flashflipReducer(roundAt(9), { type: 'mark', result: 'knew' })
      expect(flashflipReducer(done, { type: 'mark', result: 'missed' })).toBe(done)
    })
  })
})
