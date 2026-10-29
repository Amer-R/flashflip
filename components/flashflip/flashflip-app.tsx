'use client'

import { use, useEffect, useReducer, useRef, useState } from 'react'
import { browser } from 'react-dom'
import { flashflipReducer, initialState } from '@/lib/flashflip/reducer'
import { canRetry, missedIds, scoreOf } from '@/lib/flashflip/round'
import { shuffle } from '@/lib/flashflip/shuffle'
import type { Card } from '@/lib/flashflip/types'
import * as deckStore from '@/lib/storage/deck-store'
import { PasteScreen, plural } from './paste-screen'
import { QuizScreen } from './quiz-screen'
import { ScoreScreen } from './score-screen'

export function FlashFlipApp() {
  use(browser('Deck is stored in localStorage.'))

  const [state, dispatch] = useReducer(flashflipReducer, null, () => initialState(deckStore.loadDeck()))
  const [deckRevision, setDeckRevision] = useState(0)
  const [notice, setNotice] = useState('')
  // Bumped on Edit deck: the paste screen remounts under the same deckRevision, so this re-runs the focus effect.
  const [backCount, setBackCount] = useState(0)
  const pasteRef = useRef<HTMLDivElement>(null)
  const { round } = state
  const currentId = round?.order[round.index]
  const currentCard = state.deck?.find((c) => c.id === currentId)

  // After Clear deck or Edit deck the paste screen remounts; put focus back on its textarea.
  // (After Start the quiz is showing, so there is no textarea and the quiz screen takes focus.)
  useEffect(() => {
    if (deckRevision === 0 && backCount === 0) return
    pasteRef.current?.querySelector('textarea')?.focus()
  }, [deckRevision, backCount])

  function handleStart(cards: Card[], skipped: number) {
    if (cards.length === 0) return
    dispatch({ type: 'replaceDeck', cards })
    // AD-7: the round is built from the cards just passed in, never from state.deck.
    dispatch({ type: 'startRound', order: shuffle(cards.map((c) => c.id)) })
    deckStore.saveDeck(cards)
    setNotice(`Saved ${plural(cards.length, 'card')}` + (skipped ? ` · ${plural(skipped, 'skipped line')} removed` : ''))
    setDeckRevision((r) => r + 1)
  }

  function handleMark(result: 'knew' | 'missed') {
    // The Start notice stays up for the first card only.
    if (round?.index === 0) setNotice('')
    dispatch({ type: 'mark', result })
  }

  // AD-7: Retry missed and New round build their round here from current state; neither touches storage.
  function handleRetry() {
    if (!round) return
    dispatch({ type: 'startRound', order: shuffle(missedIds(round)) })
  }

  function handleNewRound() {
    if (!state.deck) return
    dispatch({ type: 'startRound', order: shuffle(state.deck.map((c) => c.id)) })
  }

  function handleEditDeck() {
    dispatch({ type: 'goToPaste' })
    setBackCount((n) => n + 1)
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
      {state.view === 'quiz' && round && currentCard && (
        <QuizScreen
          key={currentCard.id}
          card={currentCard}
          position={round.index + 1}
          total={round.order.length}
          onMark={handleMark}
        />
      )}
      {state.view === 'score' && round && (
        <ScoreScreen
          {...scoreOf(round)}
          canRetry={canRetry(round)}
          onRetry={handleRetry}
          onNewRound={handleNewRound}
          onEditDeck={handleEditDeck}
        />
      )}
      {/* Lives outside the keyed screen so it stays mounted and its text change is announced. */}
      <p role="status" className="min-h-5 text-sm text-zinc-600 dark:text-zinc-400">
        {/* Keyed so a repeated identical notice still replaces the text node and is re-announced. */}
        <span key={deckRevision}>{notice}</span>
      </p>
    </div>
  )
}
