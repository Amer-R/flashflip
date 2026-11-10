import { ACCEPTANCE_TABLE } from "@/lib/core/acceptance-table";
import { MAX_CARDS, MAX_PASTE_CHARS } from "@/lib/core/limits";
import { PARSER_VERSION, parseLines } from "@/lib/core/parse-lines";
import { seededRandom } from "@/lib/core/seeded-random";
import { isBlank } from "@/lib/core/text-units";
import { describe, expect, it } from "vitest";

function skippedOf(r: ReturnType<typeof parseLines>) {
  if (r.ok) return r.value.skippedLines;
  return r.reason === "no-cards" ? r.skippedLines : [];
}

function cardsOf(r: ReturnType<typeof parseLines>) {
  return r.ok ? r.value.cards : [];
}

const show = (text: string) =>
  text.replace(/\t/g, "<TAB>").replace(/\r/g, "<CR>").replace(/\n/g, "<LF>").slice(0, 60);

describe("P-01 to P-31 the PRD acceptance table (AD-11)", () => {
  for (const row of ACCEPTANCE_TABLE) {
    row.inputs.forEach((input, i) => {
      it(`${row.id} ${show(input)}${row.inputs.length > 1 ? ` (input ${i + 1})` : ""}`, () => {
        const result = parseLines(input);
        expect(cardsOf(result).map((c) => [c.term, c.definition])).toEqual(row.cards);
        expect(skippedOf(result).map((s) => [s.lineNumber, s.reason])).toEqual(row.skipped);
        expect(result.ok).toBe(row.cards.length > 0);
      });
    });
  }

  it("P-01 to P-31 every row is present exactly once, in order", () => {
    expect(ACCEPTANCE_TABLE.map((r) => r.id)).toEqual(
      Array.from({ length: 31 }, (_, i) => `P-${String(i + 1).padStart(2, "0")}`),
    );
  });
});

describe("FR-4 parser rules", () => {
  it("FR-4 a tab outranks a dash and a dash outranks a colon", () => {
    const tab = parseLines("a - b\tc");
    expect(tab.ok && tab.value.cards[0]).toEqual({ term: "a - b", definition: "c" });
    const dash = parseLines("a: b - c");
    expect(dash.ok && dash.value.cards[0]).toEqual({ term: "a: b", definition: "c" });
  });

  it("FR-4 a leading or trailing tab is a Separator, so the reason is missing term or definition", () => {
    const result = parseLines("\tonly definition\nonly term\t");
    expect(result).toMatchObject({ ok: false, reason: "no-cards" });
    expect(skippedOf(result).map((l) => l.reason)).toEqual(["missing-term", "missing-definition"]);
  });

  it("FR-4 runs of whitespace inside a Term or Definition collapse to one space", () => {
    const result = parseLines("a   b - c    d");
    expect(result).toEqual({ ok: true, value: { cards: [{ term: "a b", definition: "c d" }], skippedLines: [] } });
  });

  it("FR-3 a bulleted Line with a colon or dash after the marker is not mis-split (Story 1.1 deferred quirks)", () => {
    const r = parseLines("- a: b\n- c - d\n- - -");
    expect(cardsOf(r).map((c) => [c.term, c.definition])).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
    expect(skippedOf(r).map((s) => [s.lineNumber, s.reason])).toEqual([[3, "missing-term"]]);
  });

  it("FR-4 an ASCII colon with nothing after it has no whitespace after it, so it is no separator", () => {
    expect(skippedOf(parseLines("term:\nok - fine"))).toEqual([{ lineNumber: 1, text: "term:", reason: "no-separator" }]);
  });

  it("FR-4 U+2015 and U+2212 have the Unicode Dash property, so both are Separators", () => {
    expect(cardsOf(parseLines("a ― b"))).toEqual([{ term: "a", definition: "b" }]);
    expect(cardsOf(parseLines("a − b"))).toEqual([{ term: "a", definition: "b" }]);
  });
});

describe("FR-2 Lines", () => {
  it("FR-2 CRLF is one break, and \\n\\r is two (the second makes a blank Line)", () => {
    const crlf = parseLines("a - b\r\nbad");
    expect(skippedOf(crlf).map((s) => s.lineNumber)).toEqual([2]);
    const lfcr = parseLines("a - b\n\rbad");
    expect(skippedOf(lfcr).map((s) => s.lineNumber)).toEqual([3]);
  });

  it("FR-2 U+2029 and U+2028 end a Line; NEL (U+0085) does not, it is trimmed", () => {
    const r = parseLines("a - b\u2029c - d\u2028\u0085e - f\u0085");
    expect(cardsOf(r).map((c) => c.term)).toEqual(["a", "c", "e"]);
  });

  it("FR-2 a Line of only zero-width characters is blank, not a Skipped line", () => {
    const r = parseLines("a - b\n​﻿​\nc - d");
    expect(cardsOf(r)).toHaveLength(2);
    expect(skippedOf(r)).toEqual([]);
  });
});

describe("FR-5 Skipped lines", () => {
  it("FR-5 a missing term or definition is a Skipped line with a reason", () => {
    const r = parseLines("ok - fine\n: no term\nno def -");
    expect(r.ok).toBe(true);
    expect(skippedOf(r).map((s) => [s.lineNumber, s.reason])).toEqual([
      [2, "missing-term"],
      [3, "missing-definition"],
    ]);
  });

  it("FR-3 a bare bullet Line loses its marker and then has no separator", () => {
    const r = parseLines("ok - fine\n- no term");
    expect(skippedOf(r).map((s) => [s.lineNumber, s.reason])).toEqual([[2, "no-separator"]]);
  });

  it("FR-5 line numbers count blank Lines and blank Lines are not Skipped lines", () => {
    const r = parseLines("a - b\n\n   \nbad line");
    expect(skippedOf(r)).toEqual([{ lineNumber: 4, text: "bad line", reason: "no-separator" }]);
  });

  it("FR-5 a Skipped line shows its first 80 characters", () => {
    expect(skippedOf(parseLines("x".repeat(100)))[0].text).toBe("x".repeat(80));
  });

  it("FR-5 the 80-character cut never splits an emoji or combining sequence", () => {
    const family = "\u{1F468}‍\u{1F469}‍\u{1F467}";
    const emoji = skippedOf(parseLines("x".repeat(79) + family + "tail"))[0].text;
    expect(emoji).toBe("x".repeat(79) + family);
    const combining = skippedOf(parseLines("x".repeat(79) + "é" + "tail"))[0].text;
    expect(combining).toBe("x".repeat(79) + "é");
  });

  it("FR-5 the Skipped text is the trimmed Line, marker included", () => {
    expect(skippedOf(parseLines("  1. nothing here  "))[0].text).toBe("1. nothing here");
  });
});

describe("FR-6 refusals and limits", () => {
  it("FR-6 no Cards is a no-cards refusal that carries the Skipped lines", () => {
    const r = parseLines("nothing here\nnor here");
    expect(r).toMatchObject({ ok: false, reason: "no-cards" });
    expect(skippedOf(r)).toHaveLength(2);
  });

  it("FR-6 exactly 200,000 characters still make a Deck; one more is refused", () => {
    const atLimit = "a - b".padEnd(MAX_PASTE_CHARS, " "); // trailing spaces are trimmed
    expect(atLimit).toHaveLength(MAX_PASTE_CHARS);
    expect(parseLines(atLimit).ok).toBe(true);
    expect(parseLines(atLimit + " ")).toEqual({ ok: false, reason: "too-much-text" });
  });

  it("FR-6 the length limit counts UTF-16 code units, not code points", () => {
    const emoji = "\u{1F600}".repeat(MAX_PASTE_CHARS / 2 + 1); // 100,001 emoji = 200,002 units
    expect(parseLines(emoji)).toEqual({ ok: false, reason: "too-much-text" });
  });

  it("FR-6 exactly 1,000 Cards make a Deck; 1,001 are refused", () => {
    const make = (n: number) => Array.from({ length: n }, (_, i) => `t${i} - d${i}`).join("\n");
    const ok = parseLines(make(MAX_CARDS));
    expect(ok.ok && ok.value.cards).toHaveLength(MAX_CARDS);
    expect(parseLines(make(MAX_CARDS + 1))).toEqual({ ok: false, reason: "too-many-cards" });
  });

  it("FR-6 more than 1,000 Cards is too-many-cards even when there are also many Skipped lines", () => {
    const cards = Array.from({ length: 1001 }, (_, i) => `t${i} - d${i}`);
    const text = [...cards, ...Array.from({ length: 200 }, () => "bad")].join("\n");
    expect(parseLines(text)).toEqual({ ok: false, reason: "too-many-cards" });
  });
});

const PIECES = [
  "a", "term", "x y", "é", "\u{1F600}", "細胞", "خلية", "3.14", "A.", "well-known",
  " - ", " -- ", " – ", " — ", ": ", "：", "——", "\t", ":", "-", " ", "​", "﻿", "  ",
  "- ", "• ", "1. ", "2) ", "* ",
];
const BREAKS = ["\n", "\r\n", "\r", "\u2028", "\u2029"];

function randomPaste(random: () => number): string {
  const pick = <T,>(xs: T[]) => xs[Math.floor(random() * xs.length)];
  const lines = Array.from({ length: 1 + Math.floor(random() * 8) }, () =>
    Array.from({ length: Math.floor(random() * 6) }, () => pick(PIECES)).join(""),
  );
  return lines.reduce((acc, line, i) => (i === 0 ? line : acc + pick(BREAKS) + line), "");
}

describe("FR-5 invariant: Cards + Skipped lines + blank Lines = Lines", () => {
  const countLines = (text: string) => text.split(/\r\n|[\n\r\u2028\u2029]/);

  function check(text: string) {
    const lines = countLines(text);
    const blank = lines.filter(isBlank).length;
    const r = parseLines(text);
    const cards = cardsOf(r);
    expect(cards.length + skippedOf(r).length + blank).toBe(lines.length);
    const edge = /^[\s​﻿]|[\s​﻿]$/;
    for (const c of cards) {
      expect(edge.test(c.term)).toBe(false);
      expect(edge.test(c.definition)).toBe(false);
    }
  }

  it("FR-5 holds for every row of the acceptance table", () => {
    for (const row of ACCEPTANCE_TABLE) row.inputs.forEach(check);
  });

  it("FR-5 holds for 500 seeded random Pastes with every break type and invisible character", () => {
    const random = seededRandom(20261110);
    for (let i = 0; i < 500; i++) check(randomPaste(random));
  });

  it("FR-5 an empty Paste text is one blank Line", () => {
    check("");
  });
});

describe("NFR-1 speed", () => {
  it("NFR-1 1,000 Lines parse well inside the 500 ms budget in Node (the phone figure is a manual check)", () => {
    const text = Array.from({ length: 1000 }, (_, i) => `1. term ${i} -  definition   ${i} with   some words`).join("\n");
    const start = performance.now();
    const r = parseLines(text);
    const elapsed = performance.now() - start;
    expect(r.ok && r.value.cards).toHaveLength(1000);
    expect(elapsed).toBeLessThan(250);
  });
});

describe("AD-1 parser version", () => {
  it("AD-1 is 2 after the Story 1.3 rules", () => {
    expect(PARSER_VERSION).toBe(2);
  });
});
