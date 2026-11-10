"use client";

import { useRef, useState, type PointerEvent } from "react";

// AD-10, FR-9: Pointer Events swipe. Enabled only after the Card has been flipped once,
// like the Mark buttons. The buttons and keyboard stay available (NFR-3).
export const SWIPE_THRESHOLD_PX = 80; // distance that counts as a Mark
const TAP_SLOP_PX = 10; // movement below this is still a tap (flip)

export type SwipeDirection = "left" | "right";

export function useSwipe({
  enabled,
  onSwipe,
}: {
  enabled: boolean;
  onSwipe: (direction: SwipeDirection) => void;
}) {
  const start = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const dragged = useRef(false);
  const [offset, setOffset] = useState(0);

  function reset() {
    start.current = null;
    dragged.current = false;
    setOffset(0);
  }

  const handlers = {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (!enabled) return;
      // One gesture at a time (a second finger is ignored), main button only.
      if (event.button > 0 || start.current) return;
      start.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
      dragged.current = false;
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      const origin = start.current;
      if (!origin || event.pointerId !== origin.pointerId) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.abs(dx) > TAP_SLOP_PX && Math.abs(dx) > Math.abs(dy)) {
        // Capture only once the movement is a drag, so a plain tap still reaches the
        // flip button with its own click.
        if (!dragged.current) event.currentTarget.setPointerCapture?.(event.pointerId);
        dragged.current = true;
        setOffset(dx);
      }
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      const origin = start.current;
      if (!origin || event.pointerId !== origin.pointerId) return;
      const dx = event.clientX - origin.x;
      const swiped = dragged.current && Math.abs(dx) >= SWIPE_THRESHOLD_PX;
      const wasDrag = dragged.current;
      start.current = null;
      setOffset(0);
      // A drag's click (if any) is swallowed by onClickCapture right after this; clear the
      // flag on the next task so it can never outlive the gesture.
      if (wasDrag) setTimeout(() => (dragged.current = false), 0);
      else dragged.current = false;
      if (swiped) onSwipe(dx > 0 ? "right" : "left");
    },
    onPointerCancel() {
      reset();
    },
    // A drag must not also fire the flip click that follows the pointer release.
    onClickCapture(event: React.MouseEvent<HTMLElement>) {
      if (dragged.current) {
        event.stopPropagation();
        event.preventDefault();
        dragged.current = false;
      }
    },
  };

  return { handlers, offset };
}
