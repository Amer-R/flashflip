import { describe, expect, it } from "vitest";
import { knewCount, scorePercent } from "@/lib/core/score";

describe("FR-10 Score", () => {
  it.each([
    [5, 7, 71],
    [1, 8, 13],
    [3, 8, 38],
    [0, 4, 0],
    [4, 4, 100],
    [1, 1, 100],
    [0, 1, 0],
  ])("FR-10 %i of %i is %i%%", (knew, total, percent) => {
    expect(scorePercent(knew, total)).toBe(percent);
  });

  it("FR-10 an empty Deck scores 0%", () => {
    expect(scorePercent(0, 0)).toBe(0);
  });

  it("FR-10 knewCount counts only Knew it Marks", () => {
    expect(knewCount(["knew", "missed", "knew"])).toBe(2);
    expect(knewCount([])).toBe(0);
  });
});
