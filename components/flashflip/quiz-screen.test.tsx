import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Card } from '@/lib/flashflip/types'
import { QuizScreen } from './quiz-screen'

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
})
