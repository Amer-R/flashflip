import { assertNever } from "@/lib/core/assert-never";
import type { Mark, Screen } from "@/lib/core/types";

// PAT-10: only these fields. Deck, Skipped lines, position and the current Card are
// derived by selectors; the flip state is local to the Study screen.
export type SessionState = {
  screen: Screen;
  pasteText: string; // the text of the current Deck; "" when there is no Deck
  shuffle: boolean; // FR-12: the Shuffle setting, off by default
  order: number[]; // Card indexes in Pass order, fixed when the Pass starts
  marks: Mark[]; // one per Card visited, in Pass order
};

// PAT-3: past-tense kebab-case events. Randomness never enters the reducer (AD-6, PAT-18).
export type Action =
  | { type: "deck-made"; pasteText: string }
  | { type: "pass-started"; order: number[] }
  | { type: "shuffle-set"; shuffle: boolean }
  | { type: "card-marked"; mark: Mark }
  | { type: "text-editing-started" }
  | { type: "text-editing-cancelled" }
  | { type: "deck-discarded" };

export const initialState: SessionState = {
  screen: "paste",
  pasteText: "",
  shuffle: false,
  order: [],
  marks: [],
};

export function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "deck-made":
      // FR-1: replaces any Deck and Pass; the Shuffle setting is kept.
      return { screen: "ready", pasteText: action.pasteText, shuffle: state.shuffle, order: [], marks: [] };
    case "pass-started":
      // FR-7, FR-11: from Ready ("Start") or Result ("Start again"), with at least one Card.
      if ((state.screen !== "ready" && state.screen !== "result") || action.order.length === 0) return state;
      return { ...state, screen: "study", order: action.order, marks: [] };
    case "shuffle-set":
      // FR-12: changeable only between Passes, never on Paste or Study.
      if (state.screen !== "ready" && state.screen !== "result") return state;
      return { ...state, shuffle: action.shuffle };
    case "card-marked": {
      // FR-9: one Mark per Card per Pass, none outside the Study screen, no undo.
      // The Pass order is authoritative for the Pass length.
      if (state.screen !== "study" || state.marks.length >= state.order.length) return state;
      const marks = [...state.marks, action.mark];
      return {
        ...state,
        marks,
        screen: marks.length === state.order.length ? "result" : "study",
      };
    }
    case "text-editing-started":
      // FR-7: the Deck is kept until a later "Make cards" succeeds.
      return { ...state, screen: "paste" };
    case "text-editing-cancelled":
      // FR-7: Back from Paste returns to Ready, only while a Deck exists.
      return state.pasteText === "" ? state : { ...state, screen: "ready" };
    case "deck-discarded":
      return initialState;
    default:
      return assertNever(action);
  }
}
