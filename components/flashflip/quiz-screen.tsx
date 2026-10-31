'use client'

import { useEffect, useRef, useState } from 'react'
import type { Card } from '@/lib/flashflip/types'
import { buttonKnew, buttonMissed } from './ui'

export type QuizScreenProps = {
  card: Card
  position: number
  total: number
  onMark(result: 'knew' | 'missed'): void
}

/** Length of the mark exit motion; matches `--animate-exit-*` in app/globals.css. */
export const EXIT_MS = 250

function prefersReducedMotion() {
  return typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * One card. The root keys this screen by card id (AD-11), so `flipped` resets to the term on every
 * new card without an effect. Only the visible face is rendered, so only it is in the accessibility tree.
 */
export function QuizScreen({ card, position, total, onMark }: QuizScreenProps) {
  const [flipped, setFlipped] = useState(false)
  // False until the first flip, so a new card pops in rather than playing a flip.
  const [hasFlipped, setHasFlipped] = useState(false)
  const [exiting, setExiting] = useState<'knew' | 'missed' | null>(null)
  const flipRef = useRef<HTMLButtonElement>(null)
  const exitTimer = useRef<number | undefined>(undefined)

  // Each new card mounts a new screen; move focus to its flip control.
  useEffect(() => {
    flipRef.current?.focus()
  }, [])

  useEffect(() => () => window.clearTimeout(exitTimer.current), [])

  function flip() {
    if (exiting) return
    setFlipped((f) => !f)
    setHasFlipped(true)
  }

  // The exit plays first, then the root mounts the next card, which takes focus on mount.
  function mark(result: 'knew' | 'missed') {
    if (exiting) return
    if (prefersReducedMotion()) return onMark(result)
    setExiting(result)
    exitTimer.current = window.setTimeout(() => onMark(result), EXIT_MS)
  }

  const cardMotion = exiting
    ? exiting === 'knew'
      ? 'motion-safe:animate-exit-right'
      : 'motion-safe:animate-exit-left'
    : !hasFlipped
      ? 'motion-safe:animate-pop-in'
      : flipped
        ? 'motion-safe:animate-flip-to-back'
        : 'motion-safe:animate-flip-to-front'

  // (position - 1) / total while the card shows; the next step once it is marked.
  const progress = ((exiting ? position : position - 1) / total) * 100

  return (
    <section aria-label="Quiz" className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-[1.4] font-medium text-ink-soft">
          Card {position} of {total}
        </p>
        <div aria-hidden="true" className="h-3 overflow-hidden rounded-full border-2 border-line bg-card">
          <div
            data-progress
            className="h-full bg-grape ease-out motion-safe:transition-[width] motion-safe:duration-250"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <button
          ref={flipRef}
          type="button"
          onClick={flip}
          className={`flex min-h-64 w-full flex-1 cursor-pointer items-center justify-center rounded-[28px] border-2 border-line p-6 text-center text-ink shadow-sticker sm:max-h-[28rem] ${
            flipped ? 'bg-sun-soft' : 'bg-card'
          } ${cardMotion}`}
        >
          <span
            key={flipped ? 'definition' : 'term'}
            className={`block w-full min-w-0 wrap-anywhere ${
              flipped ? 'text-xl leading-normal' : 'font-display text-[2rem] leading-[1.15] font-semibold'
            } ${hasFlipped ? 'motion-safe:animate-face-in' : ''}`}
          >
            {flipped ? card.definition : card.term}
          </span>
        </button>
        {!flipped && <p className="text-center text-sm leading-[1.4] font-medium text-ink-soft">Tap to flip</p>}
      </div>

      {flipped && (
        <div className="grid grid-cols-2 gap-3 motion-safe:animate-slide-up">
          <button type="button" onClick={() => mark('missed')} className={buttonMissed}>
            <span aria-hidden="true">↺</span>
            Missed it
          </button>
          <button type="button" onClick={() => mark('knew')} className={buttonKnew}>
            <span aria-hidden="true">✓</span>
            Knew it
          </button>
        </div>
      )}
    </section>
  )
}
