'use client'

import { useId, useState } from 'react'
import { formatDeck, parseDeck } from '@/lib/flashflip/parse'
import type { Card } from '@/lib/flashflip/types'

export type PasteScreenProps = {
  deck: Card[] | null
  onStart(cards: Card[], skipped: number): void
  onClear(): void
}

export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

export function PasteScreen({ deck, onStart, onClear }: PasteScreenProps) {
  const [text, setText] = useState(() => formatDeck(deck ?? []))
  const { cards, skipped } = parseDeck(text)
  const textareaId = useId()
  const hintId = useId()

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={textareaId} className="text-base font-semibold">
          Your cards
        </label>
        <p id={hintId} className="text-sm text-zinc-600 dark:text-zinc-400">
          One card per line, written as <code className="font-mono">term - definition</code>.
        </p>
        <textarea
          id={textareaId}
          aria-describedby={hintId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={'photosynthesis - how plants turn light into food\nmitosis - cell division'}
          className="min-h-48 w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 font-mono text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:outline-zinc-100"
        />
      </div>

      <p aria-live="polite" className="text-sm font-medium">
        {plural(cards.length, 'card')} · {skipped} skipped
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={cards.length === 0}
          onClick={() => onStart(cards, skipped)}
          className="min-h-11 rounded-full bg-zinc-900 px-6 text-base font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-400"
        >
          Save deck
        </button>
        <button
          type="button"
          disabled={deck === null && text === ''}
          onClick={onClear}
          className="min-h-11 rounded-full border border-zinc-300 px-6 text-base font-semibold transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Clear deck
        </button>
      </div>
    </section>
  )
}
