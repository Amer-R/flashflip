"use client";

import { serializeSavedState } from "@/lib/core/saved-state";
import type { SessionState } from "@/lib/core/session";
import { removeSavedState, writeSavedState } from "@/lib/storage/local-storage";
import { useEffect, useRef, useState } from "react";

// FR-14, AD-8, PAT-11: one effect writes the Saved state after every state change, so
// saving is never on the tap's critical path (NFR-1). When a Deck is discarded the key is
// removed, but only after this session has had a Deck. Starting with no Deck touches
// nothing: whatever is stored was either ignored as unreadable (FR-16, AC 8) or is simply
// absent, and an empty Paste screen has nothing to lose, so it must not delete the data or
// raise the save-failed notice.
// Returns `saveFailed` for the FR-16 notice; a later successful write clears it.
export function useSavedState(state: SessionState): { saveFailed: boolean } {
  const [saveFailed, setSaveFailed] = useState(false);
  const hadDeck = useRef(false); // survives Strict Mode's repeated effect run

  useEffect(() => {
    const json = serializeSavedState(state);
    if (json !== null) hadDeck.current = true;
    else if (!hadDeck.current) return;
    const result = json === null ? removeSavedState() : writeSavedState(json);
    setSaveFailed(!result.ok);
  }, [state]);

  return { saveFailed };
}
