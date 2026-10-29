'use client'

import { useEffect, useRef } from 'react'

export type ScoreScreenProps = {
  knew: number
  total: number
  canRetry: boolean
  onRetry(): void
  onNewRound(): void
  onEditDeck(): void
}

const primary =
  'min-h-11 rounded-full bg-zinc-900 px-6 text-base font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
const secondary =
  'min-h-11 rounded-full border border-zinc-300 px-6 text-base font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'

/** End of a round: the score of the round just completed (AD-8) and the ways to go on (AD-7). */
export function ScoreScreen({ knew, total, canRetry, onRetry, onNewRound, onEditDeck }: ScoreScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Focus the score heading on mount so screen readers read the score.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section aria-label="Score" className="flex flex-col gap-6">
      <h2 ref={headingRef} tabIndex={-1} className="flex flex-col items-center gap-1 text-center focus:outline-none">
        <span className="text-5xl font-bold tabular-nums">
          {knew} / {total}
        </span>
        <span className="text-base font-medium text-zinc-600 dark:text-zinc-400">cards known</span>
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {canRetry && (
          <button type="button" onClick={onRetry} className={primary}>
            Retry missed
          </button>
        )}
        <button type="button" onClick={onNewRound} className={canRetry ? secondary : primary}>
          New round
        </button>
        <button type="button" onClick={onEditDeck} className={secondary}>
          Edit deck
        </button>
      </div>
    </section>
  )
}
