import { removeListMarker } from "@/lib/core/list-markers";
import { describe, expect, it } from "vitest";

describe("FR-3 removeListMarker", () => {
  it.each(["•", "◦", "▪", "●", "*", "-", "–", "—"])("FR-3 removes the bullet %s when whitespace follows", (bullet) => {
    expect(removeListMarker(`${bullet} a - b`)).toBe("a - b");
  });
  it.each(["1. a", "12) a", "123. a"])("FR-3 removes the number marker in %s", (line) => {
    expect(removeListMarker(line)).toBe("a");
  });
  it("FR-3 removes only one marker", () => {
    expect(removeListMarker("- 1. a")).toBe("1. a");
  });
  it.each(["3.14 - pi", "A. Smith - economist", "a) x - y", "1234. x - y", "-x - y", "1.x - y", "-"])(
    "FR-3 keeps %s",
    (line) => {
      expect(removeListMarker(line)).toBe(line);
    },
  );
});
