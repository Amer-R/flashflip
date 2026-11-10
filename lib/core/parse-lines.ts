import { SKIPPED_LINE_DISPLAY_LENGTH } from "@/lib/core/limits";
import type { Result } from "@/lib/core/result";
import type { Card, SkippedLine } from "@/lib/core/types";

// AD-1: bump with any change to FR-2 to FR-4 behavior (Story 1.3 bumps it).
export const PARSER_VERSION = 1;

export type ParsedDeck = { cards: Card[]; skippedLines: SkippedLine[] };
export type MakeCardsRefusal = { reason: "no-cards"; skippedLines: SkippedLine[] };

// FR-2 (basic): CRLF, LF, CR. Unicode line separators and whitespace: Story 1.3.
const LINE_BREAK = /\r\n|\n|\r/;
// FR-4 (first pass), in precedence order: tab; spaced dash run; colon then whitespace.
const TAB = /\t/;
const SPACED_DASH = /\s[-–—]+\s/;
const COLON = /:\s/;
const LEADING_DASH = /^[-–—]+\s+/;
const TRAILING_DASH = /\s+[-–—]+$/;

function splitAtSeparator(line: string): [string, string] | null {
  for (const rule of [TAB, SPACED_DASH, COLON]) {
    const match = rule.exec(line);
    if (match) {
      return [line.slice(0, match.index), line.slice(match.index + match[0].length)];
    }
  }
  // A dash run at the very start or end has whitespace on one side only: the other
  // side is empty, so the Line is a Skipped line with a missing Term or Definition.
  if (LEADING_DASH.test(line)) return ["", line.replace(LEADING_DASH, "")];
  if (TRAILING_DASH.test(line)) return [line.replace(TRAILING_DASH, ""), ""];
  return null;
}

export function parseLines(pasteText: string): Result<ParsedDeck, MakeCardsRefusal> {
  const cards: Card[] = [];
  const skippedLines: SkippedLine[] = [];

  pasteText.split(LINE_BREAK).forEach((raw, index) => {
    // Trim everything but tabs: a leading or trailing tab is still a Separator (FR-4).
    const line = raw.replace(/^[^\S\t]+|[^\S\t]+$/g, "");
    if (line.trim() === "") return; // blank: no Card, not a Skipped line (FR-2)

    const lineNumber = index + 1;
    const skip = (reason: SkippedLine["reason"]) =>
      skippedLines.push({
        lineNumber,
        text: line.slice(0, SKIPPED_LINE_DISPLAY_LENGTH),
        reason,
      });

    const parts = splitAtSeparator(line);
    if (!parts) return skip("no-separator");

    const term = parts[0].trim();
    const definition = parts[1].trim();
    if (term === "") return skip("missing-term");
    if (definition === "") return skip("missing-definition");
    cards.push({ term, definition });
  });

  if (cards.length === 0) return { ok: false, reason: "no-cards", skippedLines };
  return { ok: true, value: { cards, skippedLines } };
}
