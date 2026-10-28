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
  const save = screen.getByRole('button', { name: 'Save deck' }) as HTMLButtonElement
  const clear = screen.getByRole('button', { name: 'Clear deck' }) as HTMLButtonElement
  return { onStart, onClear, textarea, save, clear }
}

const fiveLines = 'a - 1\nb - 2\nnope\nc - 3\nd - 4'

describe('PasteScreen', () => {
  it('starts empty with Save deck disabled when there is no deck', () => {
    const { textarea, save } = setup()
    expect(textarea.value).toBe('')
    expect(save.disabled).toBe(true)
    expect(screen.getByText('0 cards · 0 skipped')).toBeTruthy()
  })

  it('shows live counts and enables Save deck', () => {
    const { textarea, save } = setup()
    fireEvent.change(textarea, { target: { value: fiveLines } })
    expect(screen.getByText('4 cards · 1 skipped')).toBeTruthy()
    expect(save.disabled).toBe(false)
  })

  it('keeps Save deck disabled when every line is malformed', () => {
    const { textarea, save } = setup()
    fireEvent.change(textarea, { target: { value: 'a-b\nx - \n - y\nplain' } })
    expect(screen.getByText('0 cards · 4 skipped')).toBeTruthy()
    expect(save.disabled).toBe(true)
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
    expect(screen.getByText('2 cards · 0 skipped')).toBeTruthy()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('calls onClear from Clear deck', () => {
    const { clear, onClear } = setup(parseDeck('a - b').cards)
    fireEvent.click(clear)
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
