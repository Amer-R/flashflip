import { collapseWhitespace, isBlank, trimKeepingTabs, trimText, truncateGraphemes } from "@/lib/core/text-units";
import { describe, expect, it } from "vitest";

describe("FR-2 trimText", () => {
  it("FR-2 trims White_Space, NBSP, U+3000, U+FEFF and U+200B at both ends", () => {
    expect(trimText(" 　﻿​ x ​﻿　 ")).toBe("x");
  });
  it("FR-2 leaves inner whitespace alone", () => {
    expect(trimText("  a  b  ")).toBe("a  b");
  });
  it("FR-2 a Line of only invisible characters is blank", () => {
    expect(isBlank("​﻿ \t ")).toBe(true);
    expect(isBlank("​.")).toBe(false);
  });
  it("FR-4 trimKeepingTabs keeps a tab at either end but trims everything else", () => {
    expect(trimKeepingTabs("  \tx\t  ")).toBe("\tx\t");
    expect(trimKeepingTabs("  x ​")).toBe("x");
  });
});

describe("FR-4 collapseWhitespace", () => {
  it("FR-4 turns every run of whitespace into one space", () => {
    expect(collapseWhitespace("a \t  b　　c")).toBe("a b c");
  });
});

describe("FR-5 truncateGraphemes (AD-3)", () => {
  const family = "\u{1F468}‍\u{1F469}‍\u{1F467}";
  it("FR-5 keeps a string of exactly 80 clusters whole", () => {
    expect(truncateGraphemes("x".repeat(80), 80)).toBe("x".repeat(80));
  });
  it("FR-5 cuts at 80 clusters", () => {
    expect(truncateGraphemes("x".repeat(100), 80)).toBe("x".repeat(80));
  });
  it("FR-5 never splits an emoji sequence at the boundary", () => {
    expect(truncateGraphemes("x".repeat(79) + family + "tail", 80)).toBe("x".repeat(79) + family);
  });
  it("FR-5 never splits a combining sequence at the boundary", () => {
    expect(truncateGraphemes("x".repeat(79) + "é" + "tail", 80)).toBe("x".repeat(79) + "é");
  });
  it("FR-5 never leaves a lone surrogate", () => {
    expect(Array.from(truncateGraphemes("\u{1F600}".repeat(100), 80))).toHaveLength(80);
  });
});
