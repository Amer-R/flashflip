import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Card } from '@/lib/flashflip/types'
import { clearDeck, loadDeck, saveDeck } from './deck-store'

const KEY = 'flashflip:deck:v1'
const cards: Card[] = [
  { id: 'c0', term: 'a', definition: 'b' },
  { id: 'c1', term: 'c', definition: 'd - e' },
]

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('deck-store', () => {
  it('returns null when nothing is stored', () => {
    expect(loadDeck()).toBeNull()
  })

  it('round-trips a saved deck', () => {
    saveDeck(cards)
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ version: 1, cards })
    expect(loadDeck()).toEqual(cards)
  })

  it('treats saveDeck([]) as a no-op', () => {
    saveDeck(cards)
    saveDeck([])
    expect(loadDeck()).toEqual(cards)
  })

  it('clearDeck removes the key', () => {
    saveDeck(cards)
    clearDeck()
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(loadDeck()).toBeNull()
  })

  it.each([
    ['invalid JSON', '{not json'],
    ['JSON null', 'null'],
    ['a bare array', JSON.stringify(cards)],
    ['version 2', JSON.stringify({ version: 2, cards })],
    ['missing version', JSON.stringify({ cards })],
    ['empty cards', JSON.stringify({ version: 1, cards: [] })],
    ['cards not an array', JSON.stringify({ version: 1, cards: 'x' })],
    ['duplicate ids', JSON.stringify({ version: 1, cards: [cards[0], { ...cards[1], id: 'c0' }] })],
    ['empty term', JSON.stringify({ version: 1, cards: [{ id: 'c0', term: '', definition: 'b' }] })],
    ['non-string definition', JSON.stringify({ version: 1, cards: [{ id: 'c0', term: 'a', definition: 3 }] })],
    ['null card', JSON.stringify({ version: 1, cards: [null] })],
  ])('returns null for corrupt storage: %s', (_name, raw) => {
    localStorage.setItem(KEY, raw)
    expect(loadDeck()).toBeNull()
  })

  it('never throws when storage is unavailable', () => {
    const fail = () => {
      throw new Error('SecurityError')
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(fail)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(fail)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(fail)
    expect(loadDeck()).toBeNull()
    expect(() => saveDeck(cards)).not.toThrow()
    expect(() => clearDeck()).not.toThrow()
  })
})
