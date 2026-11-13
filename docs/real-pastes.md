# Real pastes (PRD §9 question 1)

FR-2 to FR-4 are **not frozen** until at least 10 real pastes from different sources (Notion, Google Docs, chat apps, and so on) have been checked here. The acceptance table (P-01 to P-31) uses synthetic examples only.

Status: **0 of 10 real pastes checked.** None were available when Story 1.3 was built, and none were invented.

## How to check one

1. Paste your notes into FlashFlip and tap "Make cards".
2. Count the Cards you meant to make (your intended Cards).
3. Compare with what the Ready screen shows. Every other non-blank Line should be listed as a Skipped line.
4. Fill in one row below. Do not paste private notes into this file: describe the shape of the text instead (for example "Notion table copied as tab-separated rows").

Success bar (SM-1): on 5 real Notes from different sources, at least 90% of the intended Cards are made correctly and every other non-blank Line is listed.

| # | Source app | Shape of the paste | Intended Cards | Cards made | Skipped lines | Verdict (OK / wrong split / rule to review) |
|---|------------|--------------------|----------------|------------|---------------|---------------------------------------------|
| 1 |            |                    |                |            |               |                                             |
| 2 |            |                    |                |            |               |                                             |
| 3 |            |                    |                |            |               |                                             |
| 4 |            |                    |                |            |               |                                             |
| 5 |            |                    |                |            |               |                                             |
| 6 |            |                    |                |            |               |                                             |
| 7 |            |                    |                |            |               |                                             |
| 8 |            |                    |                |            |               |                                             |
| 9 |            |                    |                |            |               |                                             |
| 10 |           |                    |                |            |               |                                             |

## Things to look for

- A Line split at the wrong dash or colon (precision over recall: a wrong Card is worse than a listed Skipped line).
- Zero-width characters from a chat app or Notion (U+200B, U+FEFF) between words. FR-2 treats them as whitespace, so an inner U+200B becomes a space; if this breaks a script that uses it between words (for example Thai), raise it as a PRD question instead of changing the rule.
- List markers other than the ones FR-3 removes (letter markers such as `a)` stay in the Term on purpose).
- Wrapped Definitions (a Definition continued on a second Line makes one Card and one Skipped line; Lines are never joined).
