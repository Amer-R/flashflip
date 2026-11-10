"use client";

import { PasteScreen } from "@/components/screens/paste-screen";
import { ReadyScreen } from "@/components/screens/ready-screen";
import { ResultScreen } from "@/components/screens/result-screen";
import { StudyScreen } from "@/components/screens/study-screen";
import { LiveRegion } from "@/components/ui/live-region";
import { SaveFailedNotice } from "@/components/ui/notices";
import { Skeleton } from "@/components/ui/skeleton";
import { copy } from "@/lib/copy";
import { PREVIEW_CARD_COUNT } from "@/lib/core/limits";
import { parseLines } from "@/lib/core/parse-lines";
import { parseSavedState } from "@/lib/core/saved-state";
import { currentCard, deckOf, position, score } from "@/lib/core/selectors";
import { initialState, reducer, type SessionState } from "@/lib/core/session";
import { identityOrder, shuffleOrder } from "@/lib/core/shuffle";
import type { Mark, SkippedLine } from "@/lib/core/types";
import { useSavedState } from "@/lib/hooks/use-saved-state";
import { readSavedState } from "@/lib/storage/local-storage";
import { useEffect, useMemo, useReducer, useState } from "react";

// AD-6, AD-7, AD-8, PAT-13: the single Client boundary. The outer component has one
// "restoring" phase: the server and the first client render show a neutral skeleton, then
// the Saved state is read once after mount and the session (the reducer) starts from it.
export function FlashFlipApp() {
  const [restored, setRestored] = useState<SessionState | null>(null);

  useEffect(() => {
    // FR-14, FR-16: restore valid Saved state; anything unreadable or invalid is ignored.
    let initial = initialState;
    const read = readSavedState();
    if (read.ok && read.value !== null) {
      const parsed = parseSavedState(read.value);
      if (parsed.ok) initial = parsed.value;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the one-time restore after mount (AD-8)
    setRestored(initial);
  }, []);

  if (restored === null) return <Skeleton />;
  return <Session initialSession={restored} />;
}

// Owns the reducer, parses only on "Make cards" (PAT-12), saves after state changes and
// hands derived data and callbacks to the screens as props.
function Session({ initialSession }: { initialSession: SessionState }) {
  const [state, dispatch] = useReducer(reducer, initialSession);
  const { saveFailed } = useSavedState(state);
  const [refusal, setRefusal] = useState<SkippedLine[] | null>(null);
  // PAT-15: one live region. `seq` makes identical consecutive messages announce again.
  const [announcement, setAnnouncement] = useState({ message: "", seq: 0 });
  // Session-only UI flags, not part of the reducer state or the Saved state (PAT-10):
  // the confetti plays only for a Pass finished in this session, and focus returns to the
  // Card only after a Mark made in this session (never on a restore).
  const [celebrate, setCelebrate] = useState(false);
  const [refocusCard, setRefocusCard] = useState(false);
  const { pasteText } = state;
  const deck = useMemo(() => deckOf({ pasteText }), [pasteText]);

  function announce(message: string) {
    setAnnouncement((previous) => ({ message, seq: previous.seq + 1 }));
  }

  function makeCards(text: string) {
    const result = parseLines(text);
    if (result.ok) {
      setRefusal(null);
      announce("");
      setCelebrate(false);
      setRefocusCard(false);
      dispatch({ type: "deck-made", pasteText: text });
    } else {
      // FR-6: stay on Paste, keep the text and any existing Deck.
      setRefusal(result.skippedLines);
      announce(copy.noCardsMade);
    }
  }

  function newDeck() {
    setRefusal(null);
    announce("");
    setCelebrate(false);
    setRefocusCard(false);
    dispatch({ type: "deck-discarded" });
  }

  function back() {
    setRefusal(null);
    announce("");
    dispatch({ type: "text-editing-cancelled" });
  }

  // FR-7, FR-11, FR-12, PAT-18: the caller picks the order ("Start" and "Start again") and
  // injects Math.random; the reducer only receives the finished order.
  function startPass(cardCount: number) {
    announce("");
    setCelebrate(false);
    setRefocusCard(false);
    const order = state.shuffle ? shuffleOrder(cardCount, Math.random) : identityOrder(cardCount);
    dispatch({ type: "pass-started", order });
  }

  const card = deck ? currentCard(deck, state) : undefined;
  let screen;
  if (state.screen === "paste" || !deck) {
    screen = (
      <PasteScreen
        key={state.pasteText}
        initialText={state.pasteText}
        refusedSkippedLines={refusal}
        onMakeCards={makeCards}
        onEdit={() => setRefusal(null)}
        onBack={deck ? back : undefined}
      />
    );
  } else if (state.screen === "study" && card) {
    screen = (
      <StudyScreen
        card={card}
        position={position(state)}
        total={deck.cards.length}
        refocus={refocusCard}
        onMark={(mark: Mark) => {
          // Mirror the reducer: a Mark past the end of the Pass is ignored there, so it must
          // not announce or celebrate here either (a double tap or a swipe plus a tap).
          if (state.screen !== "study" || state.marks.length >= state.order.length) return;
          const finished = state.marks.length + 1 === state.order.length;
          if (finished) {
            // FR-10, AD-10: the Score is announced once, when the Pass ends; the focused heading carries the headline.
            const { knew, total, percent } = score(deck, { marks: [...state.marks, mark] });
            announce(copy.score(knew, total, percent));
          } else {
            announce("");
          }
          setCelebrate(finished);
          setRefocusCard(true);
          dispatch({ type: "card-marked", mark });
        }}
        onNewDeck={newDeck}
        announce={announce}
      />
    );
  } else if (state.screen === "result") {
    const { knew, total, percent } = score(deck, state);
    screen = (
      <ResultScreen
        knew={knew}
        total={total}
        percent={percent}
        shuffle={state.shuffle}
        celebrate={celebrate}
        onShuffleChange={(shuffle) => dispatch({ type: "shuffle-set", shuffle })}
        onStartAgain={() => startPass(deck.cards.length)}
        onNewDeck={newDeck}
      />
    );
  } else {
    // "ready", or a "study" state with no current Card (never the Result screen).
    screen = (
      <ReadyScreen
        cardCount={deck.cards.length}
        previewCards={deck.cards.slice(0, PREVIEW_CARD_COUNT)}
        skippedLines={deck.skippedLines}
        shuffle={state.shuffle}
        onShuffleChange={(shuffle) => dispatch({ type: "shuffle-set", shuffle })}
        onStart={() => startPass(deck.cards.length)}
        onEditText={() => dispatch({ type: "text-editing-started" })}
        onNewDeck={newDeck}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-gutter py-8">
      {saveFailed && <SaveFailedNotice />}
      {screen}
      <LiveRegion message={announcement.message} seq={announcement.seq} />
    </main>
  );
}
