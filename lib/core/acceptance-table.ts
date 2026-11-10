import type { SkippedLineReason } from "@/lib/core/types";

// PRD §4.1 acceptance table P-01 to P-31 as typed data (PAT-2, AD-11). Invisible characters
// are written as escapes so editors cannot change them. `inputs` holds several Paste texts
// when a row lists several (P-22, P-24); each must give the same expected result.
export type AcceptanceRow = {
  id: string;
  inputs: string[];
  cards: [term: string, definition: string][];
  skipped: [lineNumber: number, reason: SkippedLineReason][];
};

const MITOSIS: [string, string][] = [["mitosis", "cell division"]];
const CELL: [string, string][] = [["細胞", "生命的基本單位"]];
const FAMILY = "\u{1F468}‍\u{1F469}‍\u{1F467}";

export const ACCEPTANCE_TABLE: AcceptanceRow[] = [
  { id: "P-01", inputs: ["mitosis - cell division"], cards: MITOSIS, skipped: [] },
  { id: "P-02", inputs: ["mitosis – cell division"], cards: MITOSIS, skipped: [] },
  { id: "P-03", inputs: ["mitosis — cell division"], cards: MITOSIS, skipped: [] },
  { id: "P-04", inputs: ["mitosis -- cell division"], cards: MITOSIS, skipped: [] },
  { id: "P-05", inputs: ["mitosis: cell division"], cards: MITOSIS, skipped: [] },
  { id: "P-06", inputs: ["mitosis\tcell division"], cards: MITOSIS, skipped: [] },
  { id: "P-07", inputs: ["細胞：生命的基本單位"], cards: CELL, skipped: [] },
  { id: "P-08", inputs: ["細胞——生命的基本單位"], cards: CELL, skipped: [] },
  { id: "P-09", inputs: ["well-known - widely recognised"], cards: [["well-known", "widely recognised"]], skipped: [] },
  { id: "P-10", inputs: ["well-known"], cards: [], skipped: [[1, "no-separator"]] },
  { id: "P-11", inputs: ["pre- and post-test - exam stages"], cards: [["pre- and post-test", "exam stages"]], skipped: [] },
  { id: "P-12", inputs: ["Ratio 3:1"], cards: [], skipped: [[1, "no-separator"]] },
  { id: "P-13", inputs: ["3.14 - pi"], cards: [["3.14", "pi"]], skipped: [] },
  { id: "P-14", inputs: ["A. Smith - economist"], cards: [["A. Smith", "economist"]], skipped: [] },
  { id: "P-15", inputs: ["a - b - c"], cards: [["a", "b - c"]], skipped: [] },
  { id: "P-16", inputs: ["a\tb - c"], cards: [["a", "b - c"]], skipped: [] },
  { id: "P-17", inputs: ["Note: mitosis - cell division"], cards: [["Note: mitosis", "cell division"]], skipped: [] },
  { id: "P-18", inputs: ["a\tb\tc"], cards: [["a", "b c"]], skipped: [] },
  {
    id: "P-19",
    inputs: [
      [
        "1. mitosis - cell division",
        "2) meiosis - sex cell division",
        "• osmosis - water diffusion",
        "- diffusion - random movement",
        "* enzyme - catalyst",
      ].join("\n"),
    ],
    cards: [
      ["mitosis", "cell division"],
      ["meiosis", "sex cell division"],
      ["osmosis", "water diffusion"],
      ["diffusion", "random movement"],
      ["enzyme", "catalyst"],
    ],
    skipped: [],
  },
  { id: "P-20", inputs: ["  mitosis   -   cell    division  "], cards: MITOSIS, skipped: [] },
  {
    id: "P-21",
    inputs: ["mitosis - cell division\n  \n\nosmosis - water movement"],
    cards: [
      ["mitosis", "cell division"],
      ["osmosis", "water movement"],
    ],
    skipped: [],
  },
  {
    id: "P-22",
    inputs: ["a - b\r\nc - d", "a - b\rc - d", "a - b\u2028c - d"],
    cards: [
      ["a", "b"],
      ["c", "d"],
    ],
    skipped: [],
  },
  { id: "P-23", inputs: ["mitosis - cell division"], cards: MITOSIS, skipped: [] },
  {
    id: "P-24",
    inputs: ["﻿mitosis - cell division", "​mitosis - cell division"],
    cards: MITOSIS,
    skipped: [],
  },
  { id: "P-25", inputs: [": cell division"], cards: [], skipped: [[1, "missing-term"]] },
  { id: "P-26", inputs: ["細胞："], cards: [], skipped: [[1, "missing-definition"]] },
  {
    id: "P-27",
    inputs: ["mitosis - cell division that results in two\nidentical daughter cells"],
    cards: [["mitosis", "cell division that results in two"]],
    skipped: [[2, "no-separator"]],
  },
  { id: "P-28", inputs: ["\n\nfoo\nbar - baz"], cards: [["bar", "baz"]], skipped: [[3, "no-separator"]] },
  {
    id: "P-29",
    inputs: ["خلية - الوحدة الأساسية للحياة\ncell - خلية"],
    cards: [
      ["خلية", "الوحدة الأساسية للحياة"],
      ["cell", "خلية"],
    ],
    skipped: [],
  },
  {
    id: "P-30",
    inputs: [`${FAMILY} - family\né - e with acute`],
    cards: [
      [FAMILY, "family"],
      ["é", "e with acute"],
    ],
    skipped: [],
  },
  {
    id: "P-31",
    inputs: ["a - b\na - b"],
    cards: [
      ["a", "b"],
      ["a", "b"],
    ],
    skipped: [],
  },
];
