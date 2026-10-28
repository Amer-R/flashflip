import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { parseDeck } from '@/lib/flashflip/parse'
import * as deckStore from '@/lib/storage/deck-store'
import { FlashFlipApp } from './flashflip-app'

afterEach(() => {
  cleanup()
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
    save: () => screen.getByRole('button', { name: 'Save deck' }) as HTMLButtonElement,
    clear: () => screen.getByRole('button', { name: 'Clear deck' }),
    status: () => screen.getByRole('status').textContent,
  }
}

const fiveLines = 'a - 1\nb - 2\nnope\nc - 3\nd - 4'

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

  it('announces the save with the skipped count and returns focus to the textarea', async () => {
    const ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: fiveLines } })
    ui.save().focus()
    fireEvent.click(ui.save())
    expect(ui.status()).toBe('Saved 4 cards · 1 skipped line removed')
    expect(document.activeElement).toBe(ui.textarea())
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

  it('keeps the status region mounted across Save deck', async () => {
    const ui = await mount()
    const region = screen.getByRole('status')
    fireEvent.change(ui.textarea(), { target: { value: 'a - b' } })
    fireEvent.click(ui.save())
    expect(screen.getByRole('status')).toBe(region)
  })

  it('replaces the status text node when the same deck is saved twice', async () => {
    const ui = await mount()
    fireEvent.change(ui.textarea(), { target: { value: 'a - b' } })
    fireEvent.click(ui.save())
    const first = screen.getByRole('status').firstElementChild
    expect(first?.textContent).toBe('Saved 1 card')
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
})
