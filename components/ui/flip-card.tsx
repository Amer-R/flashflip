import { copy } from "@/lib/copy";
import type { Card } from "@/lib/core/types";
import type { Ref } from "react";

// FR-8, FR-17, AD-10: Term and Definition are plain React text in separate elements with
// automatic direction. A native <button> gives click, Enter and Space for free. Both faces
// sit in one grid cell and the inner box rotates in 3D (styles in globals.css); the hidden
// face is aria-hidden and inert, so only the visible face is read. Under reduced motion the
// faces swap instantly. Each face is its own box, so Story 1.3 can add a scroll container
// inside a face (FR-17) without reworking the flip.
export function FlipCard({
  card,
  flipped,
  onFlip,
  buttonRef,
}: {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  const faceClass =
    "flip-face block min-h-48 w-full rounded-card border-2 border-border bg-surface p-6 text-left";
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onFlip}
      onKeyDown={(event) => {
        // A held Enter must not auto-repeat onto a Card that just took focus.
        if (event.repeat) event.preventDefault();
      }}
      className="flip-scene block w-full rounded-card text-left"
    >
      <span className="flip-inner" data-flipped={flipped}>
        <span className={faceClass} data-face="term" aria-hidden={flipped} inert={flipped}>
          <span className="block text-text-muted">{copy.termLabel}</span>
          <span className="mt-2 block text-card font-semibold wrap-anywhere">
            <span dir="auto" className="block" data-testid="term">
              {card.term}
            </span>
          </span>
        </span>
        <span className={faceClass} data-face="definition" aria-hidden={!flipped} inert={!flipped}>
          <span className="block text-text-muted">{copy.definitionLabel}</span>
          <span className="mt-2 block text-card font-semibold wrap-anywhere">
            <span dir="auto" className="block" data-testid="definition">
              {card.definition}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
