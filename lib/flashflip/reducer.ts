import { isComplete } from './round'
import type { AppState, Card } from './types'

export type Action =
  | { type: 'replaceDeck'; cards: Card[] }
  | { type: 'clearDeck' }
  | { type: 'startRound'; order: string[] }
  | { type: 'mark'; result: 'knew' | 'missed' }
  | { type: 'goToPaste' }

export function initialState(deck: Card[] | null): AppState {
  return { deck, round: null, view: 'paste' }
}

export function flashflipReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'replaceDeck':
      return { deck: action.cards, round: null, view: 'paste' }
    case 'clearDeck':
      return { deck: null, round: null, view: 'paste' }
    case 'startRound': {
      const { deck } = state
      if (deck === null || action.order.length === 0) return state
      const ids = new Set(deck.map((c) => c.id))
      if (!action.order.every((id) => ids.has(id))) return state
      return { ...state, round: { order: action.order, index: 0, results: {} }, view: 'quiz' }
    }
    case 'mark': {
      const { round } = state
      if (round === null || isComplete(round)) return state
      const next = {
        order: round.order,
        index: round.index + 1,
        results: { ...round.results, [round.order[round.index]]: action.result },
      }
      return { ...state, round: next, view: isComplete(next) ? 'score' : state.view }
    }
    case 'goToPaste':
      return { ...state, round: null, view: 'paste' }
    default:
      return state
  }
}
