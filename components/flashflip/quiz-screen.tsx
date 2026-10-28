'use client'

import { useEffect, useRef, useState } from 'react'
import type { Card } from '@/lib/flashflip/types'

export type QuizScreenProps = {
  card: Card
  position: number
  total: number
  onMark(result: 'knew' | 'missed'): void
}

/**
 * One card. The root keys this screen by card id (AD-11), so `flipped` resets to the term on every
 * new card without an effect. Only the visible face is rendered, so only it is in the accessibility tree.
 */
export function QuizScreen({ card, position, total, onMark }: QuizScreenProps) {
  const [flipped, setFlipped] = useState(false)
  const flipRef = useRef<HTMLButtonElement>(null)

  // Each new card mounts a new screen; move focus to its flip control.
  useEffect(() => {
    flipRef.current?.focus()
  }, [])

  return (
    <section aria-label="Quiz" className="flex flex-col gap-4">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Card {position} of {total}
      </p>

      <button
        ref={flipRef}
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[50vh] w-full items-center justify-center rounded-2xl border border-zinc-300 bg-white p-6 text-center text-zinc-900 shadow-sm focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:outline-zinc-100"
      >
        <span
          key={flipped ? 'definition' : 'term'}
          className={
            flipped
              ? 'block w-full min-w-0 wrap-anywhere text-xl leading-relaxed motion-safe:animate-[flashflip-flip_200ms_ease-out]'
              : 'block w-full min-w-0 wrap-anywhere text-3xl font-bold motion-safe:animate-[flashflip-flip_200ms_ease-out]'
          }
        >
          {flipped ? card.definition : card.term}
        </span>
      </button>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onMark('missed')}
            className="min-h-11 rounded-full border border-zinc-300 px-4 text-base font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Missed it
          </button>
          <button
            type="button"
            onClick={() => onMark('knew')}
            className="min-h-11 rounded-full bg-zinc-900 px-4 text-base font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Knew it
          </button>
        </div>
      ) : (
        <p className="flex min-h-11 items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
          Tap the card to see the definition.
        </p>
      )}
    </section>
  )
}
