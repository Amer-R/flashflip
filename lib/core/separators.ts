import { WHITESPACE } from "@/lib/core/text-units";

// FR-4: the Separator rules, in precedence order. The first match of the first rule wins.
const TAB = /\t/;
// A run of dashes is one Separator, with whitespace on both sides.
const SPACED_DASH = new RegExp(String.raw`${WHITESPACE}\p{Dash}+${WHITESPACE}`, "u");
// A colon followed by whitespace, or a fullwidth colon anywhere.
const COLON = new RegExp(String.raw`:${WHITESPACE}|：`, "u");
const EM_DASH_RUN = /—{2,}/;
// A dash run at the very start or end has whitespace on one side only, so the other side
// is empty: a Skipped line with a missing Term or Definition (a Story 1.1 choice).
const LEADING_DASH = new RegExp(String.raw`^\p{Dash}+${WHITESPACE}+`, "u");
const TRAILING_DASH = new RegExp(String.raw`${WHITESPACE}+\p{Dash}+$`, "u");

export function splitAtSeparator(line: string): [string, string] | null {
  for (const rule of [TAB, SPACED_DASH, COLON, EM_DASH_RUN]) {
    const match = rule.exec(line);
    if (match) {
      return [line.slice(0, match.index), line.slice(match.index + match[0].length)];
    }
  }
  if (LEADING_DASH.test(line)) return ["", line.replace(LEADING_DASH, "")];
  if (TRAILING_DASH.test(line)) return [line.replace(TRAILING_DASH, ""), ""];
  return null;
}
