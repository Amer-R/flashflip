import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScoreScreen } from './score-screen'

afterEach(cleanup)

function setup(knew: number, total: number, canRetry: boolean) {
  const props = { onRetry: vi.fn(), onNewRound: vi.fn(), onEditDeck: vi.fn() }
  render(<ScoreScreen knew={knew} total={total} canRetry={canRetry} {...props} />)
  return props
}

describe('ScoreScreen', () => {
  it('shows the band message, the score as known / total and a caption inside the heading', () => {
    setup(7, 10, true)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.textContent).toBe('Nice work7 / 10cards known')
    const score = heading.querySelector('[data-score]')
    expect(score?.textContent).toBe('7 / 10')
    expect(score?.firstElementChild?.textContent).toBe('7')
    expect(score?.firstElementChild?.className).toContain('text-knew')
    expect(screen.getByText('cards known')).toBeTruthy()
  })

  it.each([
    [10, 10, false, 'Perfect round!'],
    [3, 3, false, 'Perfect round!'],
    [7, 10, true, 'Nice work'],
    [6, 10, true, 'Keep going — retry the ones you missed'],
    [0, 3, true, 'Keep going — retry the ones you missed'],
  ])('shows the band for %i / %i', (knew, total, canRetry, band) => {
    setup(knew, total, canRetry)
    expect(screen.getByRole('heading', { level: 2 }).firstElementChild?.textContent).toBe(band)
  })

  it('renders aria-hidden, non-blocking confetti only on full marks', () => {
    setup(10, 10, false)
    const confetti = document.querySelector('[data-confetti]')
    expect(confetti).not.toBeNull()
    expect(confetti?.getAttribute('aria-hidden')).toBe('true')
    expect(confetti?.className).toContain('pointer-events-none')
    expect(confetti?.className).toContain('motion-reduce:hidden')
    cleanup()
    setup(9, 10, true)
    expect(document.querySelector('[data-confetti]')).toBeNull()
  })

  it('makes Retry missed primary when cards were missed, and New round primary on full marks', () => {
    setup(7, 10, true)
    expect(screen.getByRole('button', { name: 'Retry missed' }).className).toContain('bg-grape')
    expect(screen.getByRole('button', { name: 'New round' }).className).not.toContain('bg-grape')
    cleanup()
    setup(10, 10, false)
    expect(screen.getByRole('button', { name: 'New round' }).className).toContain('bg-grape')
  })

  it('focuses the score heading on mount', () => {
    setup(7, 10, true)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(heading)
  })

  it('offers Retry missed, New round and Edit deck when cards were missed', () => {
    setup(7, 10, true)
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Retry missed', 'New round', 'Edit deck'])
  })

  it('hides Retry missed when nothing was missed', () => {
    setup(10, 10, false)
    expect(screen.queryByRole('button', { name: 'Retry missed' })).toBeNull()
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['New round', 'Edit deck'])
  })

  it('calls each prop from its button', () => {
    const props = setup(0, 3, true)
    fireEvent.click(screen.getByRole('button', { name: 'Retry missed' }))
    expect(props.onRetry).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'New round' }))
    expect(props.onNewRound).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Edit deck' }))
    expect(props.onEditDeck).toHaveBeenCalledTimes(1)
    expect(props.onRetry).toHaveBeenCalledTimes(1)
    expect(props.onNewRound).toHaveBeenCalledTimes(1)
  })

  it('buttons are real buttons with the 48px tap-target class', () => {
    setup(1, 2, true)
    for (const b of screen.getAllByRole('button') as HTMLButtonElement[]) {
      expect(b.type).toBe('button')
      expect(b.className).toContain('min-h-12')
    }
  })
})
