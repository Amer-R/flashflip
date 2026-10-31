import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Card } from '@/lib/flashflip/types'
import { EXIT_MS, QuizScreen } from './quiz-screen'

afterEach(cleanup)

const card: Card = { id: 'c3', term: 'mitosis', definition: 'cell division' }

function setup() {
  const onMark = vi.fn()
  render(<QuizScreen card={card} position={4} total={10} onMark={onMark} />)
  return { onMark, flip: () => screen.getByRole('button', { name: /mitosis|cell division/ }) as HTMLButtonElement }
}

describe('QuizScreen', () => {
  it('opens on the term, focused, with no mark buttons', () => {
    const { flip } = setup()
    expect(flip().tagName).toBe('BUTTON')
    expect(flip().type).toBe('button')
    expect(screen.getByRole('button', { name: 'mitosis' })).toBe(flip())
    expect(document.activeElement).toBe(flip())
    expect(screen.queryByText('cell division')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Knew it' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Missed it' })).toBeNull()
  })

  it('shows its position', () => {
    setup()
    expect(screen.getByText('Card 4 of 10')).toBeTruthy()
  })

  it('flips on click, and only the visible face is rendered', () => {
    const { flip } = setup()
    fireEvent.click(flip())
    expect(screen.getByRole('button', { name: 'cell division' })).toBeTruthy()
    expect(screen.queryByText('mitosis')).toBeNull()
    fireEvent.click(flip())
    expect(screen.getByRole('button', { name: 'mitosis' })).toBeTruthy()
    expect(screen.queryByText('cell division')).toBeNull()
  })

  it('is a native button whose keydown is never cancelled, so Enter and Space activate it natively', () => {
    const { flip } = setup()
    const button = flip()
    expect(button).toBeInstanceOf(HTMLButtonElement)
    expect(button.type).toBe('button')
    expect(button.disabled).toBe(false)
    // fireEvent returns false when a handler calls preventDefault, which would block native activation.
    expect(fireEvent.keyDown(button, { key: 'Enter' })).toBe(true)
    expect(fireEvent.keyDown(button, { key: ' ' })).toBe(true)
    expect(fireEvent.keyUp(button, { key: ' ' })).toBe(true)
  })

  it('keeps focus on the flip control after flipping', () => {
    const { flip } = setup()
    fireEvent.click(flip())
    expect(document.activeElement).toBe(flip())
  })

  it('shows Knew it / Missed it after the flip and reports the right result', () => {
    const { flip, onMark } = setup()
    fireEvent.click(flip())
    fireEvent.click(screen.getByRole('button', { name: 'Knew it' }))
    expect(onMark).toHaveBeenLastCalledWith('knew')
    fireEvent.click(screen.getByRole('button', { name: 'Missed it' }))
    expect(onMark).toHaveBeenLastCalledWith('missed')
    expect(onMark).toHaveBeenCalledTimes(2)
  })

  it('shows a "Tap to flip" hint on the term face only', () => {
    const { flip } = setup()
    expect(screen.getByText('Tap to flip')).toBeTruthy()
    fireEvent.click(flip())
    expect(screen.queryByText('Tap to flip')).toBeNull()
  })

  it('gives the mark buttons aria-hidden icons, the text labels as names, and 56px height', () => {
    const { flip } = setup()
    fireEvent.click(flip())
    const buttons = [screen.getByRole('button', { name: 'Missed it' }), screen.getByRole('button', { name: 'Knew it' })]
    for (const b of buttons) {
      expect(b.className).toContain('min-h-14')
      expect(b.querySelector('[aria-hidden="true"]')).not.toBeNull()
    }
  })

  it('uses the sun-soft back on the definition face', () => {
    const { flip } = setup()
    expect(flip().className).toContain('bg-card')
    fireEvent.click(flip())
    expect(flip().className).toContain('bg-sun-soft')
  })

  it('fills the aria-hidden progress bar to (position - 1) / total', () => {
    const { flip } = setup()
    const bar = document.querySelector('[data-progress]') as HTMLElement
    expect(bar.parentElement?.getAttribute('aria-hidden')).toBe('true')
    expect(bar.style.width).toBe('30%')
    fireEvent.click(flip())
    expect(bar.style.width).toBe('30%')
  })

  describe('mark motion', () => {
    const original = window.matchMedia

    function stubMotion(reduce: boolean) {
      window.matchMedia = vi.fn((query: string) => ({
        matches: reduce && query.includes('reduce'),
        media: query,
      })) as unknown as typeof window.matchMedia
    }

    afterEach(() => {
      window.matchMedia = original
      vi.useRealTimers()
    })

    it('plays the exit right, ignores a second press, then calls onMark once', () => {
      stubMotion(false)
      vi.useFakeTimers()
      const { flip, onMark } = setup()
      fireEvent.click(flip())
      fireEvent.click(screen.getByRole('button', { name: 'Knew it' }))
      expect(onMark).not.toHaveBeenCalled()
      expect(flip().className).toContain('motion-safe:animate-exit-right')
      fireEvent.click(screen.getByRole('button', { name: 'Knew it' }))
      fireEvent.click(screen.getByRole('button', { name: 'Missed it' }))
      act(() => vi.advanceTimersByTime(EXIT_MS))
      expect(onMark).toHaveBeenCalledTimes(1)
      expect(onMark).toHaveBeenCalledWith('knew')
    })

    it('exits left on Missed it', () => {
      stubMotion(false)
      vi.useFakeTimers()
      const { flip, onMark } = setup()
      fireEvent.click(flip())
      fireEvent.click(screen.getByRole('button', { name: 'Missed it' }))
      expect(flip().className).toContain('motion-safe:animate-exit-left')
      act(() => vi.advanceTimersByTime(EXIT_MS))
      expect(onMark).toHaveBeenCalledWith('missed')
    })

    it('grows the progress fill to position / total while the card exits', () => {
      stubMotion(false)
      vi.useFakeTimers()
      render(<QuizScreen card={card} position={3} total={10} onMark={vi.fn()} />)
      const bar = document.querySelector('[data-progress]') as HTMLElement
      expect(bar.style.width).toBe('20%')
      fireEvent.click(screen.getByRole('button', { name: 'mitosis' }))
      fireEvent.click(screen.getByRole('button', { name: 'Knew it' }))
      expect(bar.style.width).toBe('30%')
    })

    it('calls onMark at once with reduced motion, with no exit motion', () => {
      stubMotion(true)
      const { flip, onMark } = setup()
      fireEvent.click(flip())
      fireEvent.click(screen.getByRole('button', { name: 'Missed it' }))
      expect(onMark).toHaveBeenCalledTimes(1)
      expect(onMark).toHaveBeenCalledWith('missed')
      expect(flip().className).not.toContain('animate-exit')
    })
  })
})
