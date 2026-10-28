import type { Card } from '@/lib/flashflip/types'

const KEY = 'flashflip:deck:v1'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value !== ''
}

function isCard(value: unknown): value is Card {
  if (typeof value !== 'object' || value === null) return false
  const c = value as Record<string, unknown>
  return isNonEmptyString(c.id) && isNonEmptyString(c.term) && isNonEmptyString(c.definition)
}

export function loadDeck(): Card[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return null
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return null
    const { version, cards } = data as Record<string, unknown>
    if (version !== 1) return null
    if (!Array.isArray(cards) || cards.length === 0) return null
    if (!cards.every(isCard)) return null
    const ids = new Set(cards.map((c) => c.id))
    if (ids.size !== cards.length) return null
    return cards.map(({ id, term, definition }) => ({ id, term, definition }))
  } catch {
    return null
  }
}

export function saveDeck(cards: Card[]): void {
  if (cards.length === 0) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, cards }))
  } catch {
    // Storage unavailable or full: the app keeps working for this visit.
  }
}

export function clearDeck(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
