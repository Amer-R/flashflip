import { MAX_CARDS, MAX_PASTE_CHARS, SKIPPED_LINE_DISPLAY_LENGTH } from "@/lib/core/limits";
import { removeListMarker } from "@/lib/core/list-markers";
import type { Result } from "@/lib/core/result";
import { splitAtSeparator } from "@/lib/core/separators";
import {
  collapseWhitespace,
  isBlank,
  trimKeepingTabs,
  trimText,
  truncateGraphemes,
} from "@/lib/core/text-units";
import type { Card, SkippedLine } from "@/lib/core/types";

// AD-1: bump with any change to FR-2 to FR-4 behavior. 2: Story 1.3 (full separator rules,
// list markers, Unicode whitespace, whitespace collapse).
export const PARSER_VERSION = 2;

export type ParsedDeck = { cards: Card[]; skippedLines: SkippedLine[] };
// FR-6: why "Make cards" cannot make a Deck.
export type MakeCardsRefusal =
  | { reason: "too-much-text" }
  | { reason: "too-many-cards" }
  | { reason: "no-cards"; skippedLines: SkippedLine[] };

// FR-2: CRLF is one break; LF, CR, U+2028 and U+2029 each end a Line.
const LINE_BREAK = /\r\n|[\n\r\u2028\u2029]/;

export function parseLines(pasteText: string): Result<ParsedDeck, MakeCardsRefusal> {
  // AD-3: the length limit counts UTF-16 code units and is checked before any splitting.
  if (pasteText.length > MAX_PASTE_CHARS) return { ok: false, reason: "too-much-text" };

  const cards: Card[] = [];
  const skippedLines: SkippedLine[] = [];
  const lines = pasteText.split(LINE_BREAK);

  for (let index = 0; index < lines.length; index++) {
    // A tab at either end is kept for Separator detection; everything else is trimmed.
    const line = trimKeepingTabs(lines[index]);
    if (isBlank(line)) continue; // blank: no Card, not a Skipped line (FR-2)

    const skip = (reason: SkippedLine["reason"]) =>
      skippedLines.push({
        lineNumber: index + 1,
        text: truncateGraphemes(line, SKIPPED_LINE_DISPLAY_LENGTH),
        reason,
      });

    const parts = splitAtSeparator(removeListMarker(line));
    if (!parts) {
      skip("no-separator");
      continue;
    }
    const term = collapseWhitespace(trimText(parts[0]));
    const definition = collapseWhitespace(trimText(parts[1]));
    if (term === "") skip("missing-term");
    else if (definition === "") skip("missing-definition");
    else {
      cards.push({ term, definition });
      if (cards.length > MAX_CARDS) return { ok: false, reason: "too-many-cards" };
    }
  }

  if (cards.length === 0) return { ok: false, reason: "no-cards", skippedLines };
  return { ok: true, value: { cards, skippedLines } };
}
