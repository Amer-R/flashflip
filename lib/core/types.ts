// PAT-7: PRD glossary terms verbatim.
export type Card = { term: string; definition: string };

export type Mark = "knew" | "missed";

export type Screen = "paste" | "ready" | "study" | "result";

export type SkippedLineReason =
  | "no-separator"
  | "missing-term"
  | "missing-definition";

export type SkippedLine = {
  lineNumber: number;
  text: string;
  reason: SkippedLineReason;
};
