import { describe, expect, it } from "vitest";
import { currentCard, deckOf, position, score } from "@/lib/core/selectors";
import type { SessionState } from "@/lib/core/session";

const state = (over: Partial<SessionState>): SessionState => ({
  screen: "study",
  pasteText: "a - b\nbad\nc - d\ne - f",
  shuffle: false,
  order: [0, 1, 2],
  marks: [],
  ...over,
});

describe("selectors", () => {
  it("FR-7 deckOf derives Cards and Skipped lines from the Paste text", () => {
    const deck = deckOf(state({}));
    expect(deck?.cards).toHaveLength(3);
    expect(deck?.skippedLines).toHaveLength(1);
  });

  it("FR-1 deckOf is null when the Paste text makes no Deck", () => {
    expect(deckOf(state({ pasteText: "" }))).toBeNull();
    expect(deckOf(state({ pasteText: "nothing" }))).toBeNull();
  });

  it("FR-8 position is the Card's place in the Pass, starting at 1", () => {
    expect(position(state({}))).toBe(1);
    expect(position(state({ marks: ["knew", "missed"] }))).toBe(3);
  });

  it("FR-8 currentCard follows the Pass order", () => {
    const deck = deckOf(state({}))!;
    expect(currentCard(deck, state({ order: [2, 0, 1] }))).toEqual({ term: "e", definition: "f" });
    expect(currentCard(deck, state({ order: [2, 0, 1], marks: ["knew"] }))).toEqual({ term: "a", definition: "b" });
  });

  it("FR-10 score derives the Score from the Marks and the Deck size", () => {
    const deck = deckOf(state({}))!;
    expect(score(deck, state({ marks: ["knew", "missed", "knew"] }))).toEqual({ knew: 2, total: 3, percent: 67 });
  });
});
