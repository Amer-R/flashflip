import { PARSER_VERSION, parseLines } from "@/lib/core/parse-lines";
import type { Result } from "@/lib/core/result";
import type { SessionState } from "@/lib/core/session";
import type { Mark } from "@/lib/core/types";

// AD-1, AD-2, PAT-9: one versioned shape. The Deck, Skipped lines and position are not
// stored; they are re-derived from `pasteText` (PAT-10).
export const SAVED_STATE_VERSION = 1;

export type SavedState = {
  version: number;
  parserVersion: number;
  pasteText: string;
  screen: "ready" | "study" | "result";
  shuffle: boolean;
  order: number[];
  marks: Mark[];
};

export type SavedStateFailure = { reason: "invalid-data" | "unknown-version" };

// A Deck shown on the Paste screen (after "Edit text") is saved as ready; with no Deck
// there is nothing to save and the caller removes the key (PAT-9).
export function toSavedState(state: SessionState): SavedState | null {
  if (state.pasteText === "") return null;
  return {
    version: SAVED_STATE_VERSION,
    parserVersion: PARSER_VERSION,
    pasteText: state.pasteText,
    screen: state.screen === "paste" ? "ready" : state.screen,
    shuffle: state.shuffle,
    order: state.order,
    marks: state.marks,
  };
}

export function serializeSavedState(state: SessionState): string | null {
  const saved = toSavedState(state);
  return saved === null ? null : JSON.stringify(saved);
}

const SCREENS = ["ready", "study", "result"] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isMark = (value: unknown): value is Mark => value === "knew" || value === "missed";
const isIndex = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;

// AD-2: stage 1 checks the structure (types, enums); stage 2 checks consistency against
// the Deck re-derived from the Paste text. Anything else is "invalid-data" (FR-16).
export function parseSavedState(json: string): Result<SessionState, SavedStateFailure> {
  const invalid = { ok: false, reason: "invalid-data" } as const;

  let data: unknown;
  try {
    // JSON.parse is the one throwing call here; the failure becomes a typed result.
    data = JSON.parse(json);
  } catch {
    return invalid;
  }

  // Stage 1: structure.
  if (!isRecord(data)) return invalid;
  if (typeof data.version !== "number") return invalid;
  if (data.version !== SAVED_STATE_VERSION) return { ok: false, reason: "unknown-version" };
  const { parserVersion, pasteText, screen, shuffle, order, marks } = data;
  if (!Number.isInteger(parserVersion)) return invalid;
  if (typeof pasteText !== "string" || typeof shuffle !== "boolean") return invalid;
  if (!SCREENS.includes(screen as (typeof SCREENS)[number])) return invalid;
  if (!Array.isArray(order) || !order.every(isIndex)) return invalid;
  if (!Array.isArray(marks) || !marks.every(isMark)) return invalid;

  // Stage 2: consistency with the re-derived Deck.
  const parsed = parseLines(pasteText);
  if (!parsed.ok) return invalid;
  const total = parsed.value.cards.length;

  if (parserVersion !== PARSER_VERSION) {
    // The parsing rules changed: keep the text, drop the progress, open Ready (AD-1).
    return { ok: true, value: { screen: "ready", pasteText, shuffle, order: [], marks: [] } };
  }

  if (screen === "ready") {
    if (order.length !== 0 || marks.length !== 0) return invalid;
  } else {
    const isPermutation =
      order.length === total && new Set(order).size === total && order.every((index) => index < total);
    if (!isPermutation) return invalid;
    if (screen === "study" && marks.length >= total) return invalid;
    if (screen === "result" && marks.length !== total) return invalid;
  }

  return {
    ok: true,
    value: { screen: screen as SessionState["screen"], pasteText, shuffle, order, marks },
  };
}
