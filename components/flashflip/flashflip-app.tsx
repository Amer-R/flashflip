'use client'

import { use, useEffect, useReducer, useRef, useState } from 'react'
import { browser } from 'react-dom'
import { flashflipReducer, initialState } from '@/lib/flashflip/reducer'
import type { Card } from '@/lib/flashflip/types'
import * as deckStore from '@/lib/storage/deck-store'
import { PasteScreen, plural } from './paste-screen'

export function FlashFlipApp() {
  use(browser('Deck is stored in localStorage.'))

  const [state, dispatch] = useReducer(flashflipReducer, null, () => initialState(deckStore.loadDeck()))
  const [deckRevision, setDeckRevision] = useState(0)
  const [notice, setNotice] = useState('')
  const pasteRef = useRef<HTMLDivElement>(null)

  // After Save deck / Clear deck the keyed screen remounts; put focus back on its textarea.
  useEffect(() => {
    if (deckRevision === 0) return
    pasteRef.current?.querySelector('textarea')?.focus()
  }, [deckRevision])

  function handleStart(cards: Card[], skipped: number) {
    if (cards.length === 0) return
    dispatch({ type: 'replaceDeck', cards })
    deckStore.saveDeck(cards)
    setNotice(`Saved ${plural(cards.length, 'card')}` + (skipped ? ` · ${plural(skipped, 'skipped line')} removed` : ''))
    setDeckRevision((r) => r + 1)
  }

  function handleClear() {
    dispatch({ type: 'clearDeck' })
    deckStore.clearDeck()
    setNotice('Deck cleared')
    setDeckRevision((r) => r + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      {state.view === 'paste' && (
        <div ref={pasteRef}>
          <PasteScreen key={deckRevision} deck={state.deck} onStart={handleStart} onClear={handleClear} />
        </div>
      )}
      {/* Lives outside the keyed screen so it stays mounted and its text change is announced. */}
      <p role="status" className="min-h-5 text-sm text-zinc-600 dark:text-zinc-400">
        {/* Keyed so a repeated identical notice still replaces the text node and is re-announced. */}
        <span key={deckRevision}>{notice}</span>
      </p>
    </div>
  )
}
