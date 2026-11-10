import { describe, expect, it } from "vitest";
import { copy } from "@/lib/copy";
import { MAX_CARDS, MAX_PASTE_CHARS } from "@/lib/core/limits";

// Guards the exact PRD wording (PAT-4).
describe("copy", () => {
  it("FR-1 Make cards label", () => {
    expect(copy.makeCards).toBe("Make cards");
  });
  it("FR-6 refusal message", () => {
    expect(copy.noCardsMade).toBe("No cards could be made");
  });
  it("FR-6 the other two refusal messages use the PRD wording and the limits", () => {
    expect(copy.tooMuchText).toBe("Too much text (max 200,000 characters)");
    expect(copy.tooManyCards(MAX_CARDS)).toBe("Too many cards (max 1,000)");
    expect(MAX_PASTE_CHARS.toLocaleString("en-US")).toBe("200,000");
  });
  it("AD-9 Show all N", () => {
    expect(copy.showAllSkipped(150)).toBe("Show all 150");
  });
  it("FR-7 Ready screen labels and counts", () => {
    expect(copy.start).toBe("Start");
    expect(copy.editText).toBe("Edit text");
    expect(copy.newDeck).toBe("New deck");
    expect(copy.cardsMade(5, 2)).toBe("5 cards, 2 skipped");
    expect(copy.cardsMade(1, 0)).toBe("1 cards, 0 skipped");
  });
  it("FR-8 position", () => {
    expect(copy.position(1, 10)).toBe("1 of 10");
  });
  it("FR-9 Mark labels", () => {
    expect(copy.knewIt).toBe("Knew it");
    expect(copy.missedIt).toBe("Missed it");
  });
  it("FR-5 reason labels", () => {
    expect(copy.skipReason["no-separator"]).toBe("no separator");
    expect(copy.skipReason["missing-term"]).toBe("missing term");
    expect(copy.skipReason["missing-definition"]).toBe("missing definition");
  });
  it("FR-10 Score text", () => {
    expect(copy.score(5, 7, 71)).toBe("5 of 7 (71%)");
    expect(copy.score(0, 1, 0)).toBe("0 of 1 (0%)");
  });
  it("FR-11 restart labels and the discard question", () => {
    expect(copy.startAgain).toBe("Start again");
    expect(copy.newDeck).toBe("New deck");
    expect(copy.discardConfirm).toBe("Discard this deck and your progress?");
  });
  it("FR-12 Shuffle label", () => {
    expect(copy.shuffle).toBe("Shuffle");
  });
  it("FR-15 device-only notice covers the three facts", () => {
    expect(copy.deviceOnlyNotice).toMatch(/this device only/);
    expect(copy.deviceOnlyNotice).toMatch(/site data/);
    expect(copy.deviceOnlyNotice).toMatch(/iPhone Safari/);
    expect(copy.deviceOnlyNotice).toMatch(/Home Screen/);
  });
  it("FR-16 save-failed notice", () => {
    expect(copy.saveFailed).toBe("Can't save here: your deck will be lost when you close this tab");
  });
});
