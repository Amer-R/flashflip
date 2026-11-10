import { parseLines, type ParsedDeck } from "@/lib/core/parse-lines";
import { knewCount, scorePercent } from "@/lib/core/score";
import type { SessionState } from "@/lib/core/session";
import type { Card } from "@/lib/core/types";

// PAT-10: derived, never stored. Callers memoize on pasteText (PAT-12).
export function deckOf(state: Pick<SessionState, "pasteText">): ParsedDeck | null {
  const result = parseLines(state.pasteText);
  return result.ok ? result.value : null;
}

// FR-8: the Card's place in the Pass, starting at 1.
export function position(state: Pick<SessionState, "marks">): number {
  return state.marks.length + 1;
}

export function currentCard(
  deck: ParsedDeck,
  state: Pick<SessionState, "order" | "marks">,
): Card | undefined {
  return deck.cards[state.order[state.marks.length]];
}

// FR-10: derived, never stored (PAT-10).
export function score(
  deck: ParsedDeck,
  state: Pick<SessionState, "marks">,
): { knew: number; total: number; percent: number } {
  const knew = knewCount(state.marks);
  const total = deck.cards.length;
  return { knew, total, percent: scorePercent(knew, total) };
}
