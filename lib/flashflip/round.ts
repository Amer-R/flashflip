import type { Round } from './types'

/** A round is complete once every card in its order has been marked (AD-8). */
export function isComplete(round: Round): boolean {
  return round.index === round.order.length
}
