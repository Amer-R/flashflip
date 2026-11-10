// FR-2, AD-3: what counts as whitespace, and how text is trimmed, collapsed and cut.
// FR-2 defines whitespace as the Unicode White_Space characters plus U+FEFF and U+200B.
// JavaScript's `\s` and `trim()` miss U+200B, so every parser step uses this one source.
// (String.raw keeps the backslashes, so the patterns below read exactly as the regex.)
export const WHITESPACE = String.raw`[\p{White_Space}​﻿]`;

const EDGES = new RegExp(String.raw`^${WHITESPACE}+|${WHITESPACE}+$`, "gu");
const RUNS = new RegExp(String.raw`${WHITESPACE}+`, "gu");
// Like EDGES, but a tab at either end stays: it can still be a Separator (FR-4).
const EDGES_KEEP_TABS = new RegExp(
  String.raw`^(?:(?!\t)${WHITESPACE})+|(?:(?!\t)${WHITESPACE})+$`,
  "gu",
);
const ANY_NON_WHITESPACE = new RegExp(String.raw`(?!${WHITESPACE})[\s\S]`, "u");

export function trimText(text: string): string {
  return text.replace(EDGES, "");
}

export function trimKeepingTabs(text: string): string {
  return text.replace(EDGES_KEEP_TABS, "");
}

export function isBlank(text: string): boolean {
  return !ANY_NON_WHITESPACE.test(text);
}

// FR-4: runs of whitespace inside a Term or Definition become one space.
export function collapseWhitespace(text: string): string {
  return text.replace(RUNS, " ");
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// AD-3, FR-5: the first `max` grapheme clusters, so an emoji or combining sequence is
// never split. A string with at most `max` UTF-16 units cannot have more clusters.
export function truncateGraphemes(text: string, max: number): string {
  if (text.length <= max) return text;
  let out = "";
  let count = 0;
  for (const { segment } of segmenter.segment(text)) {
    if (count === max) break;
    out += segment;
    count += 1;
  }
  return out;
}
