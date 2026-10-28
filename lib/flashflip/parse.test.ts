import { describe, expect, it } from 'vitest'
import { formatDeck, parseDeck } from './parse'

describe('parseDeck', () => {
  it('parses valid lines and splits at the first separator', () => {
    expect(parseDeck('a - b\nc - d - e')).toEqual({
      cards: [
        { id: 'c0', term: 'a', definition: 'b' },
        { id: 'c1', term: 'c', definition: 'd - e' },
      ],
      skipped: 0,
    })
  })

  it('skips and counts malformed lines', () => {
    expect(parseDeck('a-b\nx - \n - y\nplain')).toEqual({ cards: [], skipped: 4 })
  })

  it('ignores blank lines and handles CRLF', () => {
    expect(parseDeck('a - b\r\n\r\nc - d')).toEqual({
      cards: [
        { id: 'c0', term: 'a', definition: 'b' },
        { id: 'c1', term: 'c', definition: 'd' },
      ],
      skipped: 0,
    })
  })

  it('does not count whitespace-only lines', () => {
    expect(parseDeck('   \n\t\n')).toEqual({ cards: [], skipped: 0 })
  })

  it('trims both sides', () => {
    expect(parseDeck('  term   -   def  ').cards).toEqual([{ id: 'c0', term: 'term', definition: 'def' }])
  })

  it('numbers ids by position among valid cards and keeps duplicates', () => {
    const { cards, skipped } = parseDeck('bad\na - b\na - b')
    expect(skipped).toBe(1)
    expect(cards.map((c) => c.id)).toEqual(['c0', 'c1'])
    expect(cards[0]).toMatchObject({ term: 'a', definition: 'b' })
    expect(cards[1]).toMatchObject({ term: 'a', definition: 'b' })
  })

  it('counts 4 cards and 1 skipped for 5 lines with 1 malformed', () => {
    const result = parseDeck('a - 1\nb - 2\nnope\nc - 3\nd - 4')
    expect(result.cards).toHaveLength(4)
    expect(result.skipped).toBe(1)
  })

  it('returns no cards for empty text', () => {
    expect(parseDeck('')).toEqual({ cards: [], skipped: 0 })
  })
})

describe('formatDeck', () => {
  it('joins cards with newlines and no trailing newline', () => {
    expect(
      formatDeck([
        { id: 'c0', term: 'a', definition: 'b' },
        { id: 'c1', term: 'c', definition: 'd - e' },
      ]),
    ).toBe('a - b\nc - d - e')
  })

  it('formats an empty deck as an empty string', () => {
    expect(formatDeck([])).toBe('')
  })

  it('round-trips through parseDeck', () => {
    const cards = parseDeck('a - b\nc - d - e\nx - y\nx - y\nlong term - a longer definition').cards
    expect(parseDeck(formatDeck(cards)).cards).toEqual(cards)
  })
})
