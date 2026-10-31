import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseDeck } from '@/lib/flashflip/parse'
import { PasteScreen } from './paste-screen'

afterEach(cleanup)

function setup(deck: Parameters<typeof PasteScreen>[0]['deck'] = null) {
  const onStart = vi.fn()
  const onClear = vi.fn()
  render(<PasteScreen deck={deck} onStart={onStart} onClear={onClear} />)
  const textarea = screen.getByLabelText('Your cards') as HTMLTextAreaElement
  const save = screen.getByRole('button', { name: 'Start' }) as HTMLButtonElement
  const clear = screen.getByRole('button', { name: 'Clear deck' }) as HTMLButtonElement
  return { onStart, onClear, textarea, save, clear }
}

const fiveLines = 'a - 1\nb - 2\nnope\nc - 3\nd - 4'

describe('PasteScreen', () => {
  it('starts empty with Start disabled when there is no deck', () => {
    const { textarea, save } = setup()
    expect(textarea.value).toBe('')
    expect(save.disabled).toBe(true)
    expect(screen.getByText('0 cards')).toBeTruthy()
    expect(screen.queryByText(/skipped/)).toBeNull()
  })

  it('shows live count chips, with the skipped chip, inside the live line, and enables Start', () => {
    const { textarea, save } = setup()
    fireEvent.change(textarea, { target: { value: fiveLines } })
    const cardsChip = screen.getByText('4 cards')
    const skippedChip = screen.getByText('1 skipped')
    const live = cardsChip.closest('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(live?.contains(skippedChip)).toBe(true)
    expect(live?.textContent).toBe('4 cards 1 skipped')
    expect(save.disabled).toBe(false)
  })

  it('shows only the cards chip when nothing is skipped', () => {
    const { textarea } = setup()
    fireEvent.change(textarea, { target: { value: 'a - 1\nb - 2\nc - 3\nd - 4' } })
    expect(screen.getByText('4 cards')).toBeTruthy()
    expect(screen.queryByText(/skipped/)).toBeNull()
    expect(screen.getByText('4 cards').closest('[aria-live="polite"]')?.textContent).toBe('4 cards')
  })

  it('keeps Start disabled when every line is malformed', () => {
    const { textarea, save } = setup()
    fireEvent.change(textarea, { target: { value: 'a-b\nx - \n - y\nplain' } })
    expect(screen.getByText('0 cards')).toBeTruthy()
    expect(screen.getByText('4 skipped')).toBeTruthy()
    expect(save.disabled).toBe(true)
  })

  it('has 48px buttons', () => {
    const { save, clear } = setup()
    expect(save.className).toContain('min-h-12')
    expect(clear.className).toContain('min-h-12')
  })

  it('calls onStart with exactly the previewed cards and skipped count', () => {
    const { textarea, save, onStart } = setup()
    fireEvent.change(textarea, { target: { value: fiveLines } })
    fireEvent.click(save)
    const { cards, skipped } = parseDeck(fiveLines)
    expect(skipped).toBe(1)
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onStart).toHaveBeenCalledWith(cards, skipped)
  })

  it('seeds the textarea from the saved deck and renders no save/clear status of its own', () => {
    const deck = parseDeck('a - b\nc - d - e').cards
    const { textarea } = setup(deck)
    expect(textarea.value).toBe('a - b\nc - d - e')
    expect(screen.getByText('2 cards')).toBeTruthy()
    expect(screen.queryByText(/skipped/)).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('calls onClear from Clear deck', () => {
    const { clear, onClear } = setup(parseDeck('a - b').cards)
    fireEvent.click(clear)
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
