import { splitAtSeparator } from "@/lib/core/separators";
import { describe, expect, it } from "vitest";

describe("FR-4 splitAtSeparator", () => {
  it("FR-4 splits at a tab", () => expect(splitAtSeparator("a\tb")).toEqual(["a", "b"]));
  it.each(["-", "–", "—", "―", "--", "---"])(
    "FR-4 a dash run %s with whitespace on both sides is one Separator",
    (dash) => {
      const parts = splitAtSeparator(`a ${dash} b`);
      expect(parts?.map((p) => p.trim())).toEqual(["a", "b"]);
    },
  );
  it("FR-4 splits at a colon followed by whitespace", () => expect(splitAtSeparator("a: b")).toEqual(["a", "b"]));
  it("FR-4 splits at a fullwidth colon anywhere", () => expect(splitAtSeparator("細胞：x")).toEqual(["細胞", "x"]));
  it("FR-4 splits at a run of two or more em dashes anywhere", () =>
    expect(splitAtSeparator("細胞——x")).toEqual(["細胞", "x"]));
  it("FR-4 a single em dash with no whitespace is not a Separator", () =>
    expect(splitAtSeparator("a—b")).toBeNull());
  it("FR-4 a hyphen inside a word and a colon with no whitespace are not Separators", () => {
    expect(splitAtSeparator("well-known")).toBeNull();
    expect(splitAtSeparator("Ratio 3:1")).toBeNull();
  });
  it("FR-4 U+2212 MINUS SIGN has the Unicode Dash property, so it is a Separator", () => {
    expect(splitAtSeparator("a − b")).toEqual(["a", "b"]);
  });
  it("FR-4 the first match wins within the winning rule", () => {
    expect(splitAtSeparator("a - b - c")).toEqual(["a", "b - c"]);
  });
  it("FR-4 precedence: tab, then dash, then colon, then em-dash run", () => {
    expect(splitAtSeparator("a - b\tc")).toEqual(["a - b", "c"]);
    expect(splitAtSeparator("a: b - c")).toEqual(["a: b", "c"]);
    expect(splitAtSeparator("a: b——c")).toEqual(["a", "b——c"]);
    expect(splitAtSeparator("a——b - c")).toEqual(["a——b", "c"]);
  });
  it("FR-4 several tabs put everything after the first in the Definition", () => {
    expect(splitAtSeparator("a\tb\tc")).toEqual(["a", "b\tc"]);
  });
  it("FR-5 a dash run at the very start or end leaves an empty side", () => {
    expect(splitAtSeparator("― x")).toEqual(["", "x"]);
    expect(splitAtSeparator("x ―")).toEqual(["x", ""]);
  });
});
