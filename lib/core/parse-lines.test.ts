import { describe, expect, it } from "vitest";
import { parseLines } from "@/lib/core/parse-lines";

function skippedOf(r: ReturnType<typeof parseLines>) {
  return r.ok ? r.value.skippedLines : r.skippedLines;
}

type Row = { id: string; input: string; cards: [string, string][]; skipped: [number, string][] };

// Story 1.1 subset of the PRD acceptance table (PRD 4.1). Full table: Story 1.3.
const ROWS: Row[] = [
  { id: "P-01", input: "mitosis - cell division", cards: [["mitosis", "cell division"]], skipped: [] },
  { id: "P-02", input: "mitosis – cell division", cards: [["mitosis", "cell division"]], skipped: [] },
  { id: "P-03", input: "mitosis — cell division", cards: [["mitosis", "cell division"]], skipped: [] },
  { id: "P-04", input: "mitosis -- cell division", cards: [["mitosis", "cell division"]], skipped: [] },
  { id: "P-05", input: "mitosis: cell division", cards: [["mitosis", "cell division"]], skipped: [] },
  { id: "P-06", input: "mitosis\tcell division", cards: [["mitosis", "cell division"]], skipped: [] },
  { id: "P-09", input: "well-known - widely recognised", cards: [["well-known", "widely recognised"]], skipped: [] },
  { id: "P-10", input: "well-known", cards: [], skipped: [[1, "no-separator"]] },
  { id: "P-11", input: "pre- and post-test - exam stages", cards: [["pre- and post-test", "exam stages"]], skipped: [] },
  { id: "P-12", input: "Ratio 3:1", cards: [], skipped: [[1, "no-separator"]] },
];

describe("parseLines", () => {
  for (const row of ROWS) {
    it(`${row.id} ${row.input.replace("\t", "<TAB>")}`, () => {
      const result = parseLines(row.input);
      const cards = result.ok ? result.value.cards : [];
      const skipped = skippedOf(result);
      expect(cards.map((c) => [c.term, c.definition])).toEqual(row.cards);
      expect(skipped.map((s) => [s.lineNumber, s.reason])).toEqual(row.skipped);
      expect(result.ok).toBe(row.cards.length > 0);
    });
  }

  it("FR-4 a tab outranks a dash and a dash outranks a colon", () => {
    const tab = parseLines("a - b\tc");
    expect(tab.ok && tab.value.cards[0]).toEqual({ term: "a - b", definition: "c" });
    const dash = parseLines("a: b - c");
    expect(dash.ok && dash.value.cards[0]).toEqual({ term: "a: b", definition: "c" });
  });

  it("FR-4 a leading or trailing tab is a Separator, so the reason is missing term or definition", () => {
    const result = parseLines("\tonly definition\nonly term\t");
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) {
      expect(result.skippedLines.map((l) => l.reason)).toEqual(["missing-term", "missing-definition"]);
    }
  });

  it("FR-4 a Card keeps the Term and Definition text as pasted, only trimmed", () => {
    const result = parseLines("a   b - c    d");
    expect(result).toEqual({ ok: true, value: { cards: [{ term: "a   b", definition: "c    d" }], skippedLines: [] } });
  });

  it("FR-4 the first match wins within the winning rule", () => {
    const r = parseLines("a - b - c");
    expect(r.ok && r.value.cards[0]).toEqual({ term: "a", definition: "b - c" });
  });

  it("FR-2 splits at CRLF, LF and CR and trims each Line", () => {
    const r = parseLines("  a - b  \r\nc - d\re - f\n");
    expect(r.ok && r.value.cards.map((c) => c.term)).toEqual(["a", "c", "e"]);
  });

  it("FR-5 a missing term or definition is a Skipped line with a reason", () => {
    const r = parseLines("ok - fine\n- no term\nno def -");
    expect(r.ok).toBe(true);
    expect(skippedOf(r).map((s) => [s.lineNumber, s.reason])).toEqual([
      [2, "missing-term"],
      [3, "missing-definition"],
    ]);
  });

  it("FR-5 line numbers count blank Lines and blank Lines are not Skipped lines", () => {
    const r = parseLines("a - b\n\n   \nbad line");
    expect(skippedOf(r)).toEqual([
      { lineNumber: 4, text: "bad line", reason: "no-separator" },
    ]);
  });

  it("FR-5 a Skipped line shows its first 80 characters", () => {
    const long = "x".repeat(100);
    const r = parseLines(long);
    expect(skippedOf(r)[0].text).toBe("x".repeat(80));
  });

  it("FR-6 no Cards is a no-cards refusal that carries the Skipped lines", () => {
    const r = parseLines("nothing here\nnor here");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe("no-cards");
      expect(skippedOf(r)).toHaveLength(2);
    }
  });

  it("FR-5 invariant: Cards + Skipped lines + blank Lines = Lines", () => {
    const text = "a - b\n\nbad\nc: d\n  \n- x\ne\tf\nno def -";
    const lines = text.split(/\r\n|\n|\r/);
    const blank = lines.filter((l) => l.trim() === "").length;
    const r = parseLines(text);
    const cards = r.ok ? r.value.cards.length : 0;
    expect(cards + skippedOf(r).length + blank).toBe(lines.length);
  });
});
