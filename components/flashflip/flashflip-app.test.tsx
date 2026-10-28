import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseDeck } from '@/lib/flashflip/parse'
import * as deckStore from '@/lib/storage/deck-store'
import { FlashFlipApp } from './flashflip-app'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  deckStore.clearDeck()
})

async function mount() {
  await act(async () => {
    render(
      <Suspense fallback="Loading your deck…">
        <FlashFlipApp />
      </Suspense>,
    )
  })
  return {
    textarea: () => screen.getByLabelText('Your cards') as HTMLTextAreaElement,
    save: () => screen.getByRole('button', { name: 'Start' }) as HTMLButtonElement,
    clear: () => screen.getByRole('button', { name: 'Clear deck' }),
    status: () => screen.getByRole('status').textContent,
  }
}

const fiveLines = 'a - 1\nb - 2\nnope\nc - 3\nd - 4'
const tenLines = Array.from({ length: 10 }, (_, i) => `term${i} - def${i}`).join('\n')

/** The current card's flip control: the button inside the quiz section. */
function flipControl() {
  return screen.getByRole('region', { name: 'Quiz' }).querySelector('button') as HTMLButtonElement
}

/** Flip the current card, mark it, and return the term that was shown. */
function flipAndMark(result: 'Knew it' | 'Missed it') {
  const term = flipControl().textContent
  fireEvent.click(flipControl())
  fireEvent.click(screen.getByRole('button', { name: result }))
  return term
}

describe('FlashFlipApp', () => {
  it('saves a deck that survives a remount (reload)', async () => {
    let ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: fiveLines } })
    expect(screen.getByText('4 cards · 1 skipped')).toBeTruthy()
    fireEvent.click(ui.save())
    expect(deckStore.loadDeck()).toEqual(parseDeck('a - 1\nb - 2\nc - 3\nd - 4').cards)

    cleanup()
    ui = await mount()
    expect(ui.textarea().value).toBe('a - 1\nb - 2\nc - 3\nd - 4')
    expect(screen.getByText('4 cards · 0 skipped')).toBeTruthy()
  })

  it('replaces the saved deck with the new one', async () => {
    deckStore.saveDeck(parseDeck('old - deck').cards)
    let ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: 'new - deck\nsecond - card' } })
    fireEvent.click(ui.save())

    cleanup()
    ui = await mount()
    expect(ui.textarea().value).toBe('new - deck\nsecond - card')
    expect(deckStore.loadDeck()).toEqual(parseDeck('new - deck\nsecond - card').cards)
  })

  it('clears the deck, the textarea and storage', async () => {
    deckStore.saveDeck(parseDeck('a - b').cards)
    let ui = await mount()
    expect(ui.textarea().value).toBe('a - b')
    fireEvent.click(ui.clear())
    expect(ui.textarea().value).toBe('')
    expect(ui.save().disabled).toBe(true)
    expect(deckStore.loadDeck()).toBeNull()

    cleanup()
    ui = await mount()
    expect(ui.textarea().value).toBe('')
  })

  it('announces the save with the skipped count and focuses the first card', async () => {
    const ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: fiveLines } })
    ui.save().focus()
    fireEvent.click(ui.save())
    expect(ui.status()).toBe('Saved 4 cards · 1 skipped line removed')
    expect(document.activeElement).toBe(flipControl())
  })

  it('announces a save without skipped lines', async () => {
    const ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: 'a - b' } })
    fireEvent.click(ui.save())
    expect(ui.status()).toBe('Saved 1 card')
  })

  it('pluralises several skipped lines', async () => {
    const ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: 'a - b\nx\ny' } })
    fireEvent.click(ui.save())
    expect(ui.status()).toBe('Saved 1 card · 2 skipped lines removed')
  })

  it('announces Deck cleared and returns focus to the textarea', async () => {
    deckStore.saveDeck(parseDeck('a - b').cards)
    const ui = await mount()
    ui.clear().focus()
    fireEvent.click(ui.clear())
    expect(ui.status()).toBe('Deck cleared')
    expect(document.activeElement).toBe(ui.textarea())
  })

  it('keeps the status region mounted across Start', async () => {
    const ui = await mount()
    const region = screen.getByRole('status')
    fireEvent.change(ui.textarea(), { target: { value: 'a - b' } })
    fireEvent.click(ui.save())
    expect(screen.getByRole('status')).toBe(region)
  })

  it('replaces the status text node when the same deck is started twice', async () => {
    const ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: 'a - b' } })
    fireEvent.click(ui.save())
    const first = screen.getByRole('status').firstElementChild
    expect(first?.textContent).toBe('Saved 1 card')
    flipAndMark('Knew it')
    fireEvent.click(screen.getByRole('button', { name: 'Back to deck' }))
    fireEvent.click(ui.save())
    const second = screen.getByRole('status').firstElementChild
    expect(second?.textContent).toBe('Saved 1 card')
    expect(second).not.toBe(first)
  })

  it('has an empty status on a fresh mount with a saved deck', async () => {
    deckStore.saveDeck(parseDeck('a - b\nc - d').cards)
    const ui = await mount()
    expect(ui.textarea().value).toBe('a - b\nc - d')
    expect(ui.status()).toBe('')
    expect(document.activeElement).not.toBe(ui.textarea())
  })

  describe('quiz round', () => {
    it('starts a shuffled round in which each of the 10 cards is shown once', async () => {
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: tenLines } })
      fireEvent.click(ui.save())
      expect(screen.queryByLabelText('Your cards')).toBeNull()

      const seen: (string | null)[] = []
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(`Card ${i} of 10`)).toBeTruthy()
        expect(document.activeElement).toBe(flipControl())
        seen.push(flipAndMark(i % 2 ? 'Knew it' : 'Missed it'))
      }
      expect([...seen].sort()).toEqual(Array.from({ length: 10 }, (_, i) => `term${i}`).sort())
      expect(screen.getByRole('heading', { name: 'Round complete' })).toBeTruthy()
    })

    it('builds the round order by shuffling the started cards', async () => {
      // Math.random -> 0 turns [c0, c1, c2, c3] into [c1, c2, c3, c0] (see shuffle.test.ts).
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2\nc - 3\nd - 4' } })
      fireEvent.click(ui.save())
      const shown = [1, 2, 3, 4].map(() => flipAndMark('Knew it'))
      expect(shown).toEqual(['b', 'c', 'd', 'a'])
    })

    it('opens every card on its term with no mark buttons', async () => {
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2' } })
      fireEvent.click(ui.save())
      expect(['a', 'b']).toContain(flipControl().textContent)
      expect(screen.queryByRole('button', { name: 'Knew it' })).toBeNull()
      flipAndMark('Knew it')
      expect(screen.getByText('Card 2 of 2')).toBeTruthy()
      expect(['a', 'b']).toContain(flipControl().textContent)
      expect(screen.queryByRole('button', { name: 'Knew it' })).toBeNull()
      expect(document.activeElement).toBe(flipControl())
    })

    it('shows the Start notice until the first mark, then clears it', async () => {
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2\nc - 3\nnope' } })
      fireEvent.click(ui.save())
      expect(ui.status()).toBe('Saved 3 cards · 1 skipped line removed')
      flipAndMark('Missed it')
      expect(ui.status()).toBe('')
      expect(screen.getByText('Card 2 of 3')).toBeTruthy()
    })

    it('ends with Round complete, Back to deck focused, and returns to the filled paste screen', async () => {
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2' } })
      fireEvent.click(ui.save())
      flipAndMark('Knew it')
      flipAndMark('Missed it')
      const back = screen.getByRole('button', { name: 'Back to deck' })
      expect(screen.getByRole('heading', { name: 'Round complete' })).toBeTruthy()
      expect(document.activeElement).toBe(back)
      fireEvent.click(back)
      expect(ui.textarea().value).toBe('a - 1\nb - 2')
      expect(document.activeElement).toBe(ui.textarea())
      expect(screen.getByText('2 cards · 0 skipped')).toBeTruthy()
    })

    it('shows the paste screen with the saved deck after a reload mid-round', async () => {
      let ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2\nc - 3' } })
      fireEvent.click(ui.save())
      flipAndMark('Knew it')
      expect(screen.getByText('Card 2 of 3')).toBeTruthy()

      cleanup()
      ui = await mount()
      expect(ui.textarea().value).toBe('a - 1\nb - 2\nc - 3')
      expect(screen.queryByRole('region', { name: 'Quiz' })).toBeNull()
    })

    it('writes the deck on Start and nothing while marking', async () => {
      const save = vi.spyOn(deckStore, 'saveDeck')
      const clear = vi.spyOn(deckStore, 'clearDeck')
      const setItem = vi.spyOn(Storage.prototype, 'setItem')
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2' } })
      fireEvent.click(ui.save())
      expect(save).toHaveBeenCalledTimes(1)
      expect(save).toHaveBeenCalledWith(parseDeck('a - 1\nb - 2').cards)
      expect(setItem).toHaveBeenCalledTimes(1)

      flipAndMark('Knew it')
      flipAndMark('Missed it')
      fireEvent.click(screen.getByRole('button', { name: 'Back to deck' }))
      expect(save).toHaveBeenCalledTimes(1)
      expect(clear).not.toHaveBeenCalled()
      expect(setItem).toHaveBeenCalledTimes(1)
      expect(removeItem).not.toHaveBeenCalled()
      expect(deckStore.loadDeck()).toEqual(parseDeck('a - 1\nb - 2').cards)
    })
  })
})
