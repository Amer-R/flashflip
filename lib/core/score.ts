import type { Mark } from "@/lib/core/types";

export function knewCount(marks: readonly Mark[]): number {
  return marks.filter((mark) => mark === "knew").length;
}

// FR-10: 100 × X ÷ N rounded to a whole number, halves up. Integer arithmetic
// avoids floating-point surprises (1 of 8 → 13, 3 of 8 → 38).
export function scorePercent(knew: number, total: number): number {
  if (total <= 0) return 0;
  return Math.floor((200 * knew + total) / (2 * total));
}
