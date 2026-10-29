import type { Round } from './types'

/** A round is complete once every card in its order has been marked (AD-8). */
export function isComplete(round: Round): boolean {
  return round.index === round.order.length
}

/** The score of a round: cards marked known, out of the round's size (never the deck's, AD-8). */
export function scoreOf(round: Round): { knew: number; total: number } {
  const knew = round.order.filter((id) => round.results[id] === 'knew').length
  return { knew, total: round.order.length }
}

/** The ids in `order` whose result is `'missed'`, in `order` order (AD-8). */
export function missedIds(round: Round): string[] {
  return round.order.filter((id) => round.results[id] === 'missed')
}

/** Retry missed is offered only when the round missed at least one card (AD-8). */
export function canRetry(round: Round): boolean {
  return missedIds(round).length > 0
}
