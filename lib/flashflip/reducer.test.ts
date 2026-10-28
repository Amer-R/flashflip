import { describe, expect, it } from 'vitest'
import { flashflipReducer, initialState } from './reducer'
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
})
