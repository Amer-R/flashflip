import { WHITESPACE } from "@/lib/core/text-units";

// FR-3: one leading bullet or one-to-three-digit number marker, only when whitespace
// follows. `3.14 - pi`, `A. Smith`, `a)` and `1234. x` keep their leading text.
const MARKER = new RegExp(String.raw`^(?:[•◦▪●*\-–—]|\d{1,3}[.)])${WHITESPACE}+`, "u");

export function removeListMarker(line: string): string {
  return line.replace(MARKER, "");
}
