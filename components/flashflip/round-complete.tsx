'use client'

import { useEffect, useRef } from 'react'

export type RoundCompleteProps = { onBack(): void }

/** Placeholder end-of-round screen; story 1.3 replaces it with the score screen. */
export function RoundComplete({ onBack }: RoundCompleteProps) {
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    backRef.current?.focus()
  }, [])

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Round complete</h2>
      <button
        ref={backRef}
        type="button"
        onClick={onBack}
        className="min-h-11 rounded-full bg-zinc-900 px-6 text-base font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Back to deck
      </button>
    </section>
  )
}
