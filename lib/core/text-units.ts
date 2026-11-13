// FR-2, AD-3: what counts as whitespace, and how text is trimmed, collapsed and cut.
// FR-2 defines whitespace as the Unicode White_Space characters plus U+FEFF and U+200B.
// JavaScript's `\s` and `trim()` miss U+200B, so every parser step uses this one source.
// (String.raw keeps the backslashes, so the patterns below read exactly as the regex.)
export const WHITESPACE = String.raw`[\p{White_Space}\u200B\uFEFF]`;

const WHITESPACE_CHAR = new RegExp(WHITESPACE, "u");
const RUNS = new RegExp(String.raw`${WHITESPACE}+`, "gu");
const ANY_NON_WHITESPACE = new RegExp(String.raw`(?!${WHITESPACE})[\s\S]`, "u");

// Every whitespace character is in the Basic Multilingual Plane, so UTF-16 units are enough.
const isSpace = (text: string, index: number) => WHITESPACE_CHAR.test(text[index]);

// Trimming scans from both ends instead of using `^WS+|WS+$`: that regex retries from every
// start inside a long whitespace run and takes quadratic time (a 50,000-space Line took 3 s).
function trimBy(text: string, keepTabs: boolean): string {
  const trims = (index: number) => isSpace(text, index) && !(keepTabs && text[index] === "\t");
  let start = 0;
  let end = text.length;
  while (start < end && trims(start)) start += 1;
  while (end > start && trims(end - 1)) end -= 1;
  return text.slice(start, end);
}

export function trimText(text: string): string {
  return trimBy(text, false);
}

// A tab at either end stays: it can still be a Separator (FR-4).
export function trimKeepingTabs(text: string): string {
  return trimBy(text, true);
}

export function isBlank(text: string): boolean {
  return !ANY_NON_WHITESPACE.test(text);
}

// FR-4: runs of whitespace inside a Term or Definition become one space.
export function collapseWhitespace(text: string): string {
  return text.replace(RUNS, " ");
}

// Created on first use, so an engine without Intl.Segmenter (older Safari and Firefox) still
// loads the app; there the cut falls back to code points, which still never splits a surrogate pair.
let segmenter: Intl.Segmenter | null | undefined;
function graphemeSegmenter(): Intl.Segmenter | null {
  if (segmenter === undefined) {
    segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  }
  return segmenter;
}

// AD-3, FR-5: the first `max` grapheme clusters, so an emoji or combining sequence is
// never split. A string with at most `max` UTF-16 units cannot have more clusters.
export function truncateGraphemes(text: string, max: number): string {
  if (text.length <= max) return text;
  const units = graphemeSegmenter();
  const pieces: Iterable<string> = units
    ? (function* () {
        for (const { segment } of units.segment(text)) yield segment;
      })()
    : text; // iterating a string yields code points
  let out = "";
  let count = 0;
  for (const piece of pieces) {
    if (count === max) break;
    out += piece;
    count += 1;
  }
  return out;
}
