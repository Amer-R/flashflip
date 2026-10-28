import type { AppState, Card } from './types'

export type Action =
  | { type: 'replaceDeck'; cards: Card[] }
  | { type: 'clearDeck' }
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
    case 'goToPaste':
      return { ...state, round: null, view: 'paste' }
    default:
      return state
  }
}
