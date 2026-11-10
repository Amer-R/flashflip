"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FlipCard } from "@/components/ui/flip-card";
import { DeviceOnlyNotice } from "@/components/ui/notices";
import { ScreenHeading } from "@/components/ui/screen-heading";
import { copy } from "@/lib/copy";
import type { Card, Mark } from "@/lib/core/types";
import { useSwipe } from "@/lib/hooks/use-swipe";
import { useEffect, useRef, useState } from "react";

// FR-8, FR-9. The flip state is local to the current Card (PAT-10): the parent keys
// <StudyCard> by position, so each Card starts Term first and is never persisted.
function StudyCard({
  card,
  refocus,
  onMark,
  announce,
}: {
  card: Card;
  refocus: boolean;
  onMark: (mark: Mark) => void;
  announce: (message: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [everFlipped, setEverFlipped] = useState(false);
  const cardButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // After a Mark the previous Card's controls are gone; keep keyboard users in flow.
    if (refocus) cardButton.current?.focus();
  }, [refocus]);

  // AD-10: swiping a flipped Card right Marks "Knew it", left "Missed it".
  const swipe = useSwipe({
    enabled: everFlipped,
    onSwipe: (direction) => onMark(direction === "right" ? "knew" : "missed"),
  });

  function flip() {
    const next = !flipped;
    setFlipped(next);
    setEverFlipped(true);
    announce(next ? copy.announceDefinition(card.definition) : copy.announceTerm(card.term));
  }

  return (
    <>
      <div
        {...swipe.handlers}
        className="touch-pan-y"
        style={
          swipe.offset === 0
            ? undefined
            : { transform: `translateX(${swipe.offset}px) rotate(${swipe.offset / 20}deg)` }
        }
      >
        <FlipCard card={card} flipped={flipped} onFlip={flip} buttonRef={cardButton} />
      </div>
      <p className="mt-2 text-text-muted">{copy.flipHint}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="knew" disabled={!everFlipped} onClick={() => onMark("knew")}>
          {copy.knewIt}
        </Button>
        <Button variant="missed" disabled={!everFlipped} onClick={() => onMark("missed")}>
          {copy.missedIt}
        </Button>
      </div>
    </>
  );
}

export function StudyScreen({
  card,
  position,
  total,
  refocus,
  onMark,
  onNewDeck,
  announce,
}: {
  card: Card;
  position: number;
  total: number;
  refocus: boolean; // true only after a Mark made in this session, never on a restore
  onMark: (mark: Mark) => void;
  onNewDeck: () => void;
  announce: (message: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const hasMarks = position > 1;

  return (
    <section className="screen-enter">
      <ScreenHeading visuallyHidden>{copy.studyHeading}</ScreenHeading>
      <p className="mt-2 text-small text-text-muted">{copy.position(position, total)}</p>
      <div className="mt-4">
        <StudyCard
          key={position}
          card={card}
          refocus={refocus}
          onMark={onMark}
          announce={announce}
        />
      </div>
      <div className="mt-6">
        {/* FR-11: no confirmation until at least one Mark exists. */}
        <Button onClick={() => (hasMarks ? setConfirming(true) : onNewDeck())}>
          {copy.newDeck}
        </Button>
      </div>
      <DeviceOnlyNotice />
      <ConfirmDialog
        open={confirming}
        message={copy.discardConfirm}
        confirmLabel={copy.discardYes}
        cancelLabel={copy.discardNo}
        onConfirm={() => {
          setConfirming(false);
          onNewDeck();
        }}
        onCancel={() => setConfirming(false)}
      />
    </section>
  );
}
