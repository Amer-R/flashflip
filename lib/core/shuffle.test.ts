import { describe, expect, it } from "vitest";
import { seededRandom } from "@/lib/core/seeded-random";
import { identityOrder, shuffleOrder } from "@/lib/core/shuffle";

const isPermutation = (order: number[], length: number) =>
  order.length === length && [...order].sort((a, b) => a - b).every((v, i) => v === i);

describe("FR-12 identityOrder", () => {
  it("FR-12 is Deck order", () => {
    expect(identityOrder(4)).toEqual([0, 1, 2, 3]);
    expect(identityOrder(0)).toEqual([]);
  });
});

describe("FR-12 shuffleOrder", () => {
  it.each([1, 2, 10, 1000])("FR-12 visits every Card of a %i-Card Deck exactly once", (n) => {
    expect(isPermutation(shuffleOrder(n, seededRandom(n)), n)).toBe(true);
  });

  it("FR-12 does not call Math.random", () => {
    const original = Math.random;
    Math.random = () => {
      throw new Error("Math.random called");
    };
    try {
      expect(isPermutation(shuffleOrder(5, () => 0.5), 5)).toBe(true);
    } finally {
      Math.random = original;
    }
  });

  it("FR-12 same random source gives the same order", () => {
    expect(shuffleOrder(10, seededRandom(7))).toEqual(shuffleOrder(10, seededRandom(7)));
  });
});

describe("FR-13 unbiased permutation", () => {
  it("FR-13 every draw sequence of a 3-Card Deck gives each of the six orders exactly once", () => {
    const seen = new Map<string, number>();
    for (let first = 0; first < 3; first++) {
      for (let second = 0; second < 2; second++) {
        const draws = [(first + 0.5) / 3, (second + 0.5) / 2];
        let i = 0;
        const order = shuffleOrder(3, () => draws[i++]);
        seen.set(order.join(","), (seen.get(order.join(",")) ?? 0) + 1);
      }
    }
    expect(seen.size).toBe(6);
    expect([...seen.values()].every((count) => count === 1)).toBe(true);
  });

  it("FR-13 10,000 seeded Passes put each of the six orders in 14.7% to 18.7%", () => {
    const random = seededRandom(20261110);
    const counts = new Map<string, number>();
    for (let run = 0; run < 10_000; run++) {
      const key = shuffleOrder(3, random).join(",");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    for (const count of counts.values()) {
      expect(count / 10_000).toBeGreaterThanOrEqual(0.147);
      expect(count / 10_000).toBeLessThanOrEqual(0.187);
    }
  });
});
