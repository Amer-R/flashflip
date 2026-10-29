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
  it('shows the score as known / total with a caption', () => {
    setup(7, 10, true)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.textContent).toBe('7 / 10cards known')
    expect(screen.getByText('7 / 10')).toBeTruthy()
    expect(screen.getByText('cards known')).toBeTruthy()
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

  it('buttons are real buttons with the 44px tap-target class', () => {
    setup(1, 2, true)
    for (const b of screen.getAllByRole('button') as HTMLButtonElement[]) {
      expect(b.type).toBe('button')
      expect(b.className).toContain('min-h-11')
    }
  })
})
