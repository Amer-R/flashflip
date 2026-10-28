import type { Card } from './types'

const SEPARATOR = ' - '

export function parseDeck(text: string): { cards: Card[]; skipped: number } {
  const cards: Card[] = []
  let skipped = 0
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === '') continue
    const at = line.indexOf(SEPARATOR)
    if (at === -1) {
      skipped++
      continue
    }
    const term = line.slice(0, at).trim()
    const definition = line.slice(at + SEPARATOR.length).trim()
    if (term === '' || definition === '') {
      skipped++
      continue
    }
    cards.push({ id: `c${cards.length}`, term, definition })
  }
  return { cards, skipped }
}

export function formatDeck(cards: Card[]): string {
  return cards.map((c) => c.term + SEPARATOR + c.definition).join('\n')
}
