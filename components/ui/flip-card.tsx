import { copy } from "@/lib/copy";
import type { Card } from "@/lib/core/types";
import type { KeyboardEvent, Ref } from "react";

const LINE_PX = 48;

// FR-17: a Card taller than the screen scrolls inside its visible face. The face is not
// focusable (it sits inside the button), so the arrow and page keys scroll it instead.
function scrollVisibleFace(event: KeyboardEvent<HTMLButtonElement>) {
  const delta =
    event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : event.key === "PageDown" ? 2 : event.key === "PageUp" ? -2 : 0;
  if (delta === 0) return;
  const scroller = event.currentTarget.querySelector<HTMLElement>("[data-face]:not([inert]) [data-scroll]");
  if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return; // nothing to scroll
  event.preventDefault();
  const step = Math.abs(delta) === 2 ? scroller.clientHeight * 0.9 : LINE_PX;
  scroller.scrollBy?.({ top: Math.sign(delta) * step });
}

// FR-8, FR-17, AD-10: Term and Definition are plain React text in separate elements with
// automatic direction. A native <button> gives click, Enter and Space for free. Both faces
// sit in one grid cell and the inner box rotates in 3D (styles in globals.css); the hidden
// face is aria-hidden and inert, so only the visible face is read. Under reduced motion the
// faces swap instantly. Each face has its own scroll container (FR-17), so a tall Card scrolls
// inside the face and the flip is unchanged.
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
        if (event.repeat && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          return;
        }
        scrollVisibleFace(event);
      }}
      className="flip-scene block w-full rounded-card text-left"
    >
      <span className="flip-inner" data-flipped={flipped}>
        <span className={faceClass} data-face="term" aria-hidden={flipped} inert={flipped}>
          <span className="face-scroll block" data-scroll>
            <span className="block text-text-muted">{copy.termLabel}</span>
            <span className="mt-2 block text-card font-semibold wrap-anywhere">
              <span dir="auto" className="block" data-testid="term">
                {card.term}
              </span>
            </span>
          </span>
        </span>
        <span className={faceClass} data-face="definition" aria-hidden={!flipped} inert={!flipped}>
          <span className="face-scroll block" data-scroll>
            <span className="block text-text-muted">{copy.definitionLabel}</span>
            <span className="mt-2 block text-card font-semibold wrap-anywhere">
              <span dir="auto" className="block" data-testid="definition">
                {card.definition}
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
