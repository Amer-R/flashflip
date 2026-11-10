import type { SkippedLineReason } from "@/lib/core/types";

// PAT-4: every Student-facing string lives here. PRD-fixed wording stays as written.
export const copy = {
  appName: "FlashFlip",
  pasteHeading: "Paste your notes",
  pasteLabel: "Paste your notes here",
  makeCards: "Make cards", // FR-1
  noCardsMade: "No cards could be made", // FR-6
  readyHeading: "Ready to study",
  start: "Start", // FR-7
  editText: "Edit text", // FR-7
  newDeck: "New deck", // FR-7, FR-11
  back: "Back",
  previewHeading: "Preview",
  skippedHeading: "Skipped lines",
  studyHeading: "Study",
  resultHeading: "Pass complete!", // design sheet: same headline for any Score
  startAgain: "Start again", // FR-11
  shuffle: "Shuffle", // FR-12
  shuffleOn: "On",
  shuffleOff: "Off",
  discardConfirm: "Discard this deck and your progress?", // FR-11
  discardYes: "Discard",
  discardNo: "Keep studying",
  deviceOnlyNotice:
    "Your deck is saved on this device only. It lives in this browser, so clearing the browser's site data deletes it. On iPhone Safari it can also be deleted after about a week without opening the site, unless you add the site to your Home Screen.", // FR-15
  saveFailed: "Can't save here: your deck will be lost when you close this tab", // FR-16
  knewIt: "Knew it", // FR-9
  missedIt: "Missed it", // FR-9
  pasteHint: "One card per line: term – definition",
  arrow: "→",
  flipHint: "Tap the card to flip it",
  termLabel: "Term",
  definitionLabel: "Definition",
  announceTerm: (text: string) => `Term: ${text}`,
  announceDefinition: (text: string) => `Definition: ${text}`,
  cardsMade: (cards: number, skipped: number) =>
    `${cards} cards, ${skipped} skipped`, // FR-7
  position: (n: number, total: number) => `${n} of ${total}`, // FR-8
  score: (knew: number, total: number, percent: number) =>
    `${knew} of ${total} (${percent}%)`, // FR-10
  lineLabel: (lineNumber: number) => `Line ${lineNumber}:`,
  skipReason: {
    "no-separator": "no separator",
    "missing-term": "missing term",
    "missing-definition": "missing definition",
  } satisfies Record<SkippedLineReason, string>, // FR-5
} as const;
