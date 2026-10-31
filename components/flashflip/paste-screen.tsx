'use client'

import { useId, useState } from 'react'
import { formatDeck, parseDeck } from '@/lib/flashflip/parse'
import type { Card } from '@/lib/flashflip/types'
import { buttonPrimary, buttonSecondary } from './ui'

export type PasteScreenProps = {
  deck: Card[] | null
  onStart(cards: Card[], skipped: number): void
  onClear(): void
}

export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

const chip = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-[1.4] text-ink'

export function PasteScreen({ deck, onStart, onClear }: PasteScreenProps) {
  const [text, setText] = useState(() => formatDeck(deck ?? []))
  const { cards, skipped } = parseDeck(text)
  const textareaId = useId()
  const hintId = useId()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label htmlFor={textareaId} className="text-base font-semibold">
          Your cards
        </label>
        <p id={hintId} className="text-sm font-medium text-ink-soft">
          One card per line, like <code className="font-mono">mitosis - cell division</code>
        </p>
        <textarea
          id={textareaId}
          aria-describedby={hintId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={'photosynthesis - how plants turn light into food\nmitosis - cell division'}
          className="min-h-48 w-full resize-y rounded-[20px] border-2 border-line bg-card p-4 font-mono text-base text-ink shadow-sticker placeholder:text-ink-soft focus:border-grape"
        />
      </div>

      {/* The chips live inside the existing live counts line, so both counts are announced. */}
      <p aria-live="polite" className="flex flex-wrap gap-2">
        <span className={`${chip} bg-mint-soft`}>{plural(cards.length, 'card')}</span>
        {skipped > 0 && (
          <>
            {' '}
            <span className={`${chip} bg-sun-soft`}>{skipped} skipped</span>
          </>
        )}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={cards.length === 0}
          onClick={() => onStart(cards, skipped)}
          className={`${buttonPrimary} w-full sm:flex-1`}
        >
          Start
        </button>
        <button
          type="button"
          disabled={deck === null && text === ''}
          onClick={onClear}
          className={buttonSecondary}
        >
          Clear deck
        </button>
      </div>
    </section>
  )
}
