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

/** The score screen's `known / total` text. */
function scoreText() {
  return screen.getByRole('region', { name: 'Score' }).querySelector('h2 > span')?.textContent
}

/** Mark every remaining card, Knew it when `knew(term, i)` is true; returns the terms shown, by result. */
function markRound(knew: (term: string, i: number) => boolean) {
  const knewTerms: string[] = []
  const missedTerms: string[] = []
  for (let i = 0; screen.queryByRole('region', { name: 'Quiz' }); i++) {
    const term = flipControl().textContent ?? ''
    const k = knew(term, i)
    flipAndMark(k ? 'Knew it' : 'Missed it')
    if (k) knewTerms.push(term)
    else missedTerms.push(term)
  }
  return { knewTerms, missedTerms }
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
    fireEvent.click(screen.getByRole('button', { name: 'Edit deck' }))
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
      expect(scoreText()).toBe('5 / 10')
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
      fireEvent.click(screen.getByRole('button', { name: 'Edit deck' }))
      expect(save).toHaveBeenCalledTimes(1)
      expect(clear).not.toHaveBeenCalled()
      expect(setItem).toHaveBeenCalledTimes(1)
      expect(removeItem).not.toHaveBeenCalled()
      expect(deckStore.loadDeck()).toEqual(parseDeck('a - 1\nb - 2').cards)
    })
  })

  describe('score screen', () => {
    async function startTen() {
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: tenLines } })
      fireEvent.click(ui.save())
      return ui
    }

    it('shows 7 / 10 after marking 7 of 10 Knew it, with focus on the score heading', async () => {
      await startTen()
      markRound((_, i) => i < 7)
      expect(scoreText()).toBe('7 / 10')
      expect(screen.getByText('cards known')).toBeTruthy()
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2 }))
      expect(screen.getByRole('button', { name: 'Retry missed' })).toBeTruthy()
    })

    it('Retry missed gives a round of only the missed cards, scored out of 3, until none are missed', async () => {
      await startTen()
      const { missedTerms } = markRound((_, i) => i < 7)
      fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
      expect(screen.getByText('Card 1 of 3')).toBeTruthy()

      const missedOnce = missedTerms[0]
      const retry = markRound((term) => term !== missedOnce)
      expect([...retry.knewTerms, ...retry.missedTerms].sort()).toEqual([...missedTerms].sort())
      expect(scoreText()).toBe('2 / 3')

      fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
      expect(screen.getByText('Card 1 of 1')).toBeTruthy()
      expect(flipControl().textContent).toBe(missedOnce)
      markRound(() => true)
      expect(scoreText()).toBe('1 / 1')
      expect(screen.queryByRole('button', { name: 'Retry missed' })).toBeNull()
    })

    it('reshuffles the missed ids for a retry', async () => {
      // Math.random -> 0 rotates left: [c0, c1, c2, c3] -> [c1, c2, c3, c0] (see shuffle.test.ts).
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2\nc - 3\nd - 4' } })
      fireEvent.click(ui.save())
      // Shown b, c, d, a; miss all but c.
      markRound((term) => term === 'c')
      fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
      // Missed ids in order order are [c1, c3, c0], shuffled to [c3, c0, c1].
      expect(markRound(() => true).knewTerms).toEqual(['d', 'a', 'b'])
    })

    it('offers no Retry missed after 10 / 10', async () => {
      await startTen()
      markRound(() => true)
      expect(scoreText()).toBe('10 / 10')
      expect(screen.queryByRole('button', { name: 'Retry missed' })).toBeNull()
      expect(screen.getByRole('button', { name: 'New round' })).toBeTruthy()
    })

    it('offers Retry missed with all 10 after 0 / 10', async () => {
      await startTen()
      markRound(() => false)
      expect(scoreText()).toBe('0 / 10')
      fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
      expect(screen.getByText('Card 1 of 10')).toBeTruthy()
    })

    it('New round gives every deck card, reshuffled, scored out of 10', async () => {
      await startTen()
      markRound((_, i) => i < 7)
      fireEvent.click(screen.getByRole('button', { name: 'New round' }))
      expect(screen.getByText('Card 1 of 10')).toBeTruthy()
      const { knewTerms } = markRound(() => true)
      expect(knewTerms.sort()).toEqual(Array.from({ length: 10 }, (_, i) => `term${i}`).sort())
      expect(scoreText()).toBe('10 / 10')
    })

    it('New round after a retry is still the whole deck', async () => {
      await startTen()
      markRound((_, i) => i < 7)
      fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
      markRound(() => true)
      expect(scoreText()).toBe('3 / 3')
      fireEvent.click(screen.getByRole('button', { name: 'New round' }))
      expect(screen.getByText('Card 1 of 10')).toBeTruthy()
    })

    it('Edit deck shows the filled paste screen with the textarea focused', async () => {
      const ui = await mount()
      fireEvent.change(ui.textarea(), { target: { value: 'a - 1\nb - 2' } })
      fireEvent.click(ui.save())
      markRound((_, i) => i === 0)
      expect(scoreText()).toBe('1 / 2')
      fireEvent.click(screen.getByRole('button', { name: 'Edit deck' }))
      expect(screen.queryByRole('region', { name: 'Score' })).toBeNull()
      expect(screen.queryByRole('region', { name: 'Quiz' })).toBeNull()
      expect(ui.textarea().value).toBe('a - 1\nb - 2')
      expect(document.activeElement).toBe(ui.textarea())
      expect(screen.getByText('2 cards · 0 skipped')).toBeTruthy()
    })

    it('shows the paste screen with the saved deck and no score after a remount', async () => {
      await startTen()
      markRound((_, i) => i < 7)
      expect(scoreText()).toBe('7 / 10')

      cleanup()
      const ui = await mount()
      expect(ui.textarea().value).toBe(tenLines)
      expect(screen.queryByRole('region', { name: 'Score' })).toBeNull()
      expect(screen.queryByText('7 / 10')).toBeNull()
    })

    it('writes nothing to storage on Retry missed or New round', async () => {
      await startTen()
      const save = vi.spyOn(deckStore, 'saveDeck')
      const clear = vi.spyOn(deckStore, 'clearDeck')
      const setItem = vi.spyOn(Storage.prototype, 'setItem')
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
      markRound((_, i) => i < 7)
      fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
      markRound(() => false)
      fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
      markRound(() => true)
      fireEvent.click(screen.getByRole('button', { name: 'New round' }))
      markRound(() => true)
      expect(save).not.toHaveBeenCalled()
      expect(clear).not.toHaveBeenCalled()
      expect(setItem).not.toHaveBeenCalled()
      expect(removeItem).not.toHaveBeenCalled()
    })
  })
})
