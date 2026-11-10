import { Button } from "@/components/ui/button";
import { DeviceOnlyNotice } from "@/components/ui/notices";
import { ScreenHeading } from "@/components/ui/screen-heading";
import { ShuffleToggle } from "@/components/ui/shuffle-toggle";
import { SkippedLines } from "@/components/ui/skipped-lines";
import { copy } from "@/lib/copy";
import type { Card, SkippedLine } from "@/lib/core/types";

// FR-7, FR-12, FR-15.
export function ReadyScreen({
  cardCount,
  previewCards,
  skippedLines,
  shuffle,
  onShuffleChange,
  onStart,
  onEditText,
  onNewDeck,
}: {
  cardCount: number;
  previewCards: Card[];
  skippedLines: SkippedLine[];
  shuffle: boolean;
  onShuffleChange: (shuffle: boolean) => void;
  onStart: () => void;
  onEditText: () => void;
  onNewDeck: () => void;
}) {
  return (
    <section className="screen-enter">
      <ScreenHeading>{copy.readyHeading}</ScreenHeading>
      <p className="mt-2 text-text-muted">{copy.cardsMade(cardCount, skippedLines.length)}</p>
      <h2 className="mt-6 font-semibold">{copy.previewHeading}</h2>
      <ul className="mt-2 space-y-2">
        {previewCards.map((card, index) => (
          <li key={index} className="rounded-input bg-surface p-3 wrap-anywhere">
            <span dir="auto">{card.term}</span>{" "}
            <span aria-hidden="true">{copy.arrow}</span>{" "}
            <span dir="auto">{card.definition}</span>
          </li>
        ))}
      </ul>
      <SkippedLines lines={skippedLines} />
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="primary" onClick={onStart}>
          {copy.start}
        </Button>
        <Button onClick={onEditText}>{copy.editText}</Button>
        <Button onClick={onNewDeck}>{copy.newDeck}</Button>
        <ShuffleToggle shuffle={shuffle} onChange={onShuffleChange} />
      </div>
      <DeviceOnlyNotice />
    </section>
  );
}
