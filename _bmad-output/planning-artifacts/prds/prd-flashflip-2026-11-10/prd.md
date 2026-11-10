---
title: "PRD: FlashFlip"
status: final
created: 2026-11-10
updated: 2026-11-10
---

# PRD: FlashFlip
*Working title — confirm.*

## 0. Document Purpose

This PRD is for the builder (a person or a coding agent), whoever tests the build, and any reviewer. It turns the final product brief (`_bmad-output/planning-artifacts/briefs/brief-flashflip-2026-11-10/brief.md`, with its `addendum.md`) into requirements for a quick MVP: paste Cards, flip-card quiz, Score and Shuffle. It builds on the brief and does not repeat it. Where the two disagree, this PRD wins: Shuffle is in the MVP here and a stretch item in the brief, and FR-2 to FR-6 replace "Parser rule v1" in the brief's addendum.

Features are grouped, with Functional Requirements (FRs) nested under them and numbered globally. Every FR lists testable consequences, and the messy-paste rules have an acceptance table in §4.1. Assumptions are tagged inline with an ASSUMPTION label and indexed in §10.

## 1. Vision

A first-year Student has a test coming and Notes in a messy mix of formats. FlashFlip turns those Notes into Cards in one tap: paste, flip, Mark each Card "Knew it" or "Missed it", see a Score. It runs on a phone, needs no login, and keeps its data in the browser.

The thesis is that Students will test themselves only if getting their own Notes into the tool takes seconds. FlashFlip therefore wins or loses on reading messy pasted text, in any language, without drama, and on being honest about every Line it could not read and about where the Deck is saved. There is no moat: the brief's research found that paste import is not a gap, so the bet is friction, not novelty.

## 2. Target User

### 2.1 Jobs To Be Done
- **Functional:** when I have Notes and a test coming, I want to test myself on them without retyping anything.
- **Emotional:** I want to find out what I actually know, not feel prepared because I reread.
- **Contextual:** I want to do it on my phone between classes, in whatever language my Notes are in.

### 2.2 Non-Users (v1)
Students who need the same Deck on several devices, shared Decks, review schedules or an account.

### 2.3 Key User Journeys
- **UJ-1. Sam quizzes the morning's lecture on the bus.** Sam, a first-year biology Student, has 12 entries of Notes in a note-taking app and a test tomorrow. Sam copies them, pastes them into FlashFlip on a phone, taps "Make cards", sees "12 cards", taps "Start", flips and Marks all 12 Cards, and sees "9 of 12 (75%)". [ASSUMPTION: Sam and Lina are illustrative personas; the brief names no specific Student]
- **UJ-2. Lina pastes a classmate's messy document.** Lina's Notes come from a shared word-processor file: numbered entries, mixed dash types, some Arabic Terms with English Definitions, and three Definitions that wrap onto a second Line once pasted. The Ready screen says "31 cards, 3 skipped" and lists the three wrapped Lines by number. Lina taps "Edit text", joins each wrapped Line onto the Line above it, taps "Make cards" and sees "31 cards, 0 skipped".

## 3. Glossary
*These terms are used exactly as written throughout this PRD.*

- **Student** — a first-year university student using FlashFlip.
- **Notes** — the Student's own revision text outside FlashFlip: lecture notes, a shared document, a chat message.
- **Paste screen, Ready screen, Study screen, Result screen** — the four screens of the one-page app (§4).
- **Paste box** — the text field on the Paste screen.
- **Paste text** — the text in the Paste box: what the Student pasted or typed.
- **Line** — a stretch of Paste text ended by a line break. A blank Line contains only whitespace.
- **Separator** — the characters in a Line that divide the Term from the Definition (FR-4).
- **Card** — one Term and one Definition made from one Line.
- **Term** — the first part of a Card, shown first.
- **Definition** — the second part of a Card, shown after a flip.
- **Deck** — the Cards made from one Paste text, in the order of their Lines (Deck order). There is one Deck at a time.
- **Skipped line** — a non-blank Line that did not become a Card, listed with its line number and a reason.
- **Pass** — one run through every Card of the Deck in Pass order (Deck order, or a random order when Shuffle is on): the flip-card quiz.
- **Mark** — the Student's verdict on one Card in a Pass: "Knew it" or "Missed it".
- **Score** — the number of "Knew it" Marks in a finished Pass, shown against the Deck size with a percentage.
- **Shuffle** — a setting that makes a Pass visit the Cards in a random order instead of Deck order.
- **Saved state** — everything the app keeps in the browser: Paste text, Deck, Shuffle setting, Pass order, position and Marks.

## 4. Features

The app is one page with four screens. "Make cards" on the Paste screen leads to the Ready screen; "Start" leads to the Study screen; the last Mark leads to the Result screen; "Start again" returns to the Study screen and "New deck" to the Paste screen. "Edit text" on the Ready screen returns to the Paste screen.

### 4.1 Paste and make Cards
**Description:** The Student pastes Paste text and taps "Make cards". The app turns every readable Line into a Card and lists every other non-blank Line as a Skipped line. The rules favour precision over recall: a Line the app cannot read with confidence is listed, never guessed at. That gives up forgiving sloppy Separators (such as `term- definition`) in exchange for never making a wrongly split Card without telling the Student. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-1: Paste and make Cards
The Student can paste or type Paste text in the Paste box and tap "Make cards".

**Consequences (testable):**
- "Make cards" is disabled while the Paste text is empty or only whitespace.
- Pressing Enter in the Paste box inserts a line break and never triggers "Make cards".
- A successful "Make cards" replaces any existing Deck and shows the Ready screen.

#### FR-2: Split into Lines and trim
The app splits Paste text into Lines at CRLF, LF, CR, U+2028 and U+2029, and trims whitespace from both ends of each Line. Whitespace means the Unicode White_Space characters (including no-break space U+00A0 and ideographic space U+3000) plus U+FEFF (byte order mark) and U+200B (zero-width space).

**Consequences (testable):**
- Paste text with CRLF, CR or U+2028 line breaks makes the same Cards as the same text with LF line breaks (P-22).
- A blank Line is ignored: it makes no Card and is not a Skipped line (P-21).
- No Term or Definition begins or ends with whitespace, and none begins or ends with U+FEFF or U+200B (P-20, P-23, P-24).

#### FR-3: Remove one leading list marker
If a trimmed Line starts with a bullet (•, ◦, ▪, ●, *, -, –, —) or a number marker (one to three digits followed by "." or ")") and then whitespace, the app removes that marker before looking for a Separator. [ASSUMPTION: this marker set covers the lists Notes arrive in; letter markers such as "a)" are deliberately not removed]

**Consequences (testable):**
- Numbered and bulleted Lines make Cards without the marker (P-19).
- A number or dash that is not followed by whitespace stays in the Term: `3.14 - pi` has the Term "3.14" (P-13).
- A letter followed by "." stays in the Term: `A. Smith - economist` has the Term "A. Smith" (P-14).

#### FR-4: Find the Separator and split
For each remaining Line the app tries these rules in order and splits at the first match of the first rule that matches: (1) a tab; (2) a run of one or more dash characters (any character with the Unicode Dash property, such as - – — ―; a run such as "--" is one Separator) with whitespace on both sides; (3) a colon followed by whitespace, or a fullwidth colon (：) anywhere; (4) a run of two or more em dashes (——) anywhere. The Term is the text before the Separator and the Definition the text after it, each trimmed, with runs of whitespace inside either collapsed to one space. [ASSUMPTION: this precedence and these whitespace requirements match how Notes are written; rules 3 and 4 exist for Chinese and Japanese Notes, which do not put spaces around punctuation]

**Consequences (testable):**
- Hyphen, en dash, em dash, "--", colon, tab, fullwidth colon and "——" each make the same Card from the same Term and Definition (P-01 to P-08).
- A hyphen inside a word is not a Separator: `well-known - widely recognised` has the Term "well-known", `pre- and post-test - exam stages` has the Term "pre- and post-test", and `well-known` alone is a Skipped line (P-09, P-10, P-11).
- The first match wins within the winning rule: `a - b - c` has the Term "a" and the Definition "b - c" (P-15).
- A tab outranks a dash, and a dash outranks a colon (P-16, P-17).
- A colon with no whitespace after it is not a Separator: `Ratio 3:1` is a Skipped line (P-12).
- A Line with several tabs puts everything after the first tab in the Definition, with the tabs shown as single spaces (P-18).

#### FR-5: List every Skipped line
A non-blank Line that has no Separator, or whose Term or Definition is empty, is a Skipped line. The app never drops a non-blank Line without listing it.

**Consequences (testable):**
- For every Paste text, the number of Cards plus the number of Skipped lines plus the number of blank Lines equals the number of Lines.
- The Ready screen lists each Skipped line with its 1-based line number (blank Lines count), its first 80 characters, and a reason: "no separator", "missing term" or "missing definition" (P-10, P-12, P-25, P-26, P-28).
- A Definition wrapped onto a second Line makes one Card from the first Line and one Skipped line for the second; the Lines are not joined (P-27).
- Duplicate Lines make duplicate Cards (P-31). [ASSUMPTION: duplicate Lines are not removed, so the counts always reconcile]

#### FR-6: Refuse unusable Paste text
If "Make cards" cannot make a Deck, the Student stays on the Paste screen with the Paste text intact and any existing Deck is kept. It cannot make a Deck when the Paste text is longer than 200,000 characters, when no Line becomes a Card, or when more than 1,000 Cards would be made. [ASSUMPTION: limits of 200,000 characters and 1,000 Cards fit real Notes and the browser's storage quota]

**Consequences (testable):**
- Paste text of 200,000 characters makes a Deck; Paste text of 200,001 characters is refused with the message "Too much text (max 200,000 characters)".
- Paste text in which every non-blank Line is a Skipped line is refused with the message "No cards could be made", and the Skipped lines are listed below the Paste box.
- Paste text that would make 1,000 Cards makes a Deck; Paste text that would make 1,001 Cards is refused with the message "Too many cards (max 1,000)".
- After any refusal, reloading the page shows the same Deck as before, or the Paste screen if there was none.

**Messy-paste acceptance table.** Each row is a Paste text and the exact result of "Make cards". Notation: `<TAB>` is a tab, `⏎` a line break, `<CRLF>`, `<CR>` and `<LS>` (U+2028) other line breaks, `<NBSP>` U+00A0, `<BOM>` U+FEFF, `<ZWSP>` U+200B, `·` a space, `→` joins a Term and its Definition.

| ID | Paste text | Result |
|---|---|---|
| P-01 | `mitosis - cell division` | 1 Card: "mitosis" → "cell division" |
| P-02 | `mitosis – cell division` (en dash) | 1 Card: "mitosis" → "cell division" |
| P-03 | `mitosis — cell division` (em dash) | 1 Card: "mitosis" → "cell division" |
| P-04 | `mitosis -- cell division` | 1 Card: "mitosis" → "cell division" |
| P-05 | `mitosis: cell division` | 1 Card: "mitosis" → "cell division" |
| P-06 | `mitosis<TAB>cell division` | 1 Card: "mitosis" → "cell division" |
| P-07 | `細胞：生命的基本單位` (fullwidth colon) | 1 Card: "細胞" → "生命的基本單位" |
| P-08 | `細胞——生命的基本單位` (two em dashes) | 1 Card: "細胞" → "生命的基本單位" |
| P-09 | `well-known - widely recognised` | 1 Card: "well-known" → "widely recognised" |
| P-10 | `well-known` | 0 Cards; Skipped line 1: no separator |
| P-11 | `pre- and post-test - exam stages` | 1 Card: "pre- and post-test" → "exam stages" |
| P-12 | `Ratio 3:1` | 0 Cards; Skipped line 1: no separator |
| P-13 | `3.14 - pi` | 1 Card: "3.14" → "pi" |
| P-14 | `A. Smith - economist` | 1 Card: "A. Smith" → "economist" |
| P-15 | `a - b - c` | 1 Card: "a" → "b - c" |
| P-16 | `a<TAB>b - c` | 1 Card: "a" → "b - c" |
| P-17 | `Note: mitosis - cell division` | 1 Card: "Note: mitosis" → "cell division" |
| P-18 | `a<TAB>b<TAB>c` | 1 Card: "a" → "b c" |
| P-19 | `1. mitosis - cell division⏎2) meiosis - sex cell division⏎• osmosis - water diffusion⏎- diffusion - random movement⏎* enzyme - catalyst` | 5 Cards: "mitosis" → "cell division"; "meiosis" → "sex cell division"; "osmosis" → "water diffusion"; "diffusion" → "random movement"; "enzyme" → "catalyst" |
| P-20 | `··mitosis···-···cell····division··` | 1 Card: "mitosis" → "cell division" |
| P-21 | `mitosis - cell division⏎··⏎⏎osmosis - water movement` | 2 Cards: "mitosis" → "cell division"; "osmosis" → "water movement"; 0 Skipped lines |
| P-22 | `a - b<CRLF>c - d`, `a - b<CR>c - d` and `a - b<LS>c - d` | each: 2 Cards: "a" → "b"; "c" → "d" |
| P-23 | `mitosis<NBSP>-<NBSP>cell division` | 1 Card: "mitosis" → "cell division" |
| P-24 | `<BOM>mitosis - cell division` and `<ZWSP>mitosis - cell division` | each: 1 Card: "mitosis" → "cell division" |
| P-25 | `: cell division` | 0 Cards; Skipped line 1: missing term |
| P-26 | `細胞：` | 0 Cards; Skipped line 1: missing definition |
| P-27 | `mitosis - cell division that results in two⏎identical daughter cells` | 1 Card: "mitosis" → "cell division that results in two"; Skipped line 2: no separator |
| P-28 | `⏎⏎foo⏎bar - baz` | 1 Card: "bar" → "baz"; Skipped line 3: no separator |
| P-29 | `خلية - الوحدة الأساسية للحياة⏎cell - خلية` | 2 Cards: "خلية" → "الوحدة الأساسية للحياة"; "cell" → "خلية" |
| P-30 | `👨‍👩‍👧 - family⏎é - e with acute` (é as e plus U+0301) | 2 Cards; each Term is identical to the pasted characters |
| P-31 | `a - b⏎a - b` | 2 Cards: "a" → "b"; "a" → "b" |

### 4.2 Flip-card quiz
**Description:** After "Make cards" the Student sees the Ready screen, starts a Pass, flips each Card to check the Definition, and Marks it. Realizes UJ-1.

**Functional Requirements:**

#### FR-7: Ready screen
The Ready screen shows what "Make cards" made and lets the Student start a Pass.

**Consequences (testable):**
- It shows "N cards, M skipped" (FR-5), the Skipped lines, a preview of the first 3 Cards as Term → Definition (fewer if the Deck is smaller), the Shuffle setting (FR-12), "Start", "Edit text" and "New deck". [ASSUMPTION: a preview of the first 3 Cards helps the Student catch a systematic mis-split before studying]
- "Start" opens the Study screen at Card 1 of N with all Marks cleared.
- "Edit text" opens the Paste screen with the same Paste text and keeps the Deck until a later "Make cards" succeeds.

#### FR-8: Flip a Card
On the Study screen the Student sees one Card at a time, Term first, and can flip it to the Definition and back.

**Consequences (testable):**
- The Study screen shows "n of N", where n is the Card's position in the Pass (starting at 1) and N is the Deck size.
- A tap or click on the Card, or Enter or Space while it has focus, flips it; a second flip shows the Term again.
- Every Card is shown Term first when it appears.

#### FR-9: Mark and advance
After flipping a Card at least once, the Student can Mark it "Knew it" or "Missed it". [ASSUMPTION: a flip is required before Marking, and Marks cannot be undone in the MVP]

**Consequences (testable):**
- "Knew it" and "Missed it" are disabled until the Card has been flipped at least once.
- Marking a Card records the Mark and shows the next Card, Term first, with n up by 1; Marking the last Card opens the Result screen.
- Each Card gets exactly one Mark per Pass, and a Mark cannot be changed (§6).

### 4.3 Score
**Description:** When the Pass ends, the Student sees how many Cards they knew. Realizes UJ-1.

**Functional Requirements:**

#### FR-10: Show the Score
The Result screen shows the Score as "X of N (P%)", where X is the number of "Knew it" Marks in the Pass, N is the Deck size, and P is 100 × X ÷ N rounded to a whole number with halves rounded up.

**Consequences (testable):**
- 5 "Knew it" Marks in a Deck of 7 show "5 of 7 (71%)"; 0 of 4 shows "0 of 4 (0%)"; 4 of 4 shows "4 of 4 (100%)"; 1 of 8 shows "1 of 8 (13%)"; 3 of 8 shows "3 of 8 (38%)".
- A Deck of 1 Card shows "1 of 1 (100%)" or "0 of 1 (0%)".
- X equals the number of "Knew it" Marks recorded in this Pass, including Marks restored after a reload (FR-14).

#### FR-11: Start again or New deck
From the Result screen the Student can run the same Deck again or make a new one.

**Consequences (testable):**
- "Start again" clears all Marks and starts a new Pass at Card 1 of N on the Study screen, in Deck order if Shuffle is off or in a new random order if it is on.
- "New deck" discards the Deck and the Pass and opens the Paste screen with an empty Paste box. It is also offered on the Ready and Study screens; on the Study screen, once at least one Mark exists, it first asks "Discard this deck and your progress?", and declining changes nothing.

### 4.4 Shuffle
**Description:** Shuffle lets the Student study the Cards in a random order, so that a Card's position is not a clue to its Definition. Realizes UJ-1.

**Functional Requirements:**

#### FR-12: Shuffle setting and Pass order
The Student can turn Shuffle on or off on the Ready screen and the Result screen. [ASSUMPTION: Shuffle is off by default and changeable only between Passes]

**Consequences (testable):**
- With Shuffle off, a Pass visits the Cards in Deck order.
- With Shuffle on, a Pass visits every Card exactly once in a random order: for Decks of 1, 2, 10 and 1,000 Cards, each Card appears once and none is missing or repeated.
- The Pass order is fixed when the Pass starts and does not change during the Pass or after a reload (FR-14).
- The Shuffle setting is not offered on the Study screen.

#### FR-13: Unbiased random order
The random order is an unbiased permutation: every possible order of the Deck is equally likely.

**Consequences (testable):**
- Over 10,000 Passes of a 3-Card Deck started with Shuffle on, each of the six possible orders occurs in 14.7% to 18.7% of the Passes (one sixth, plus or minus two percentage points).

### 4.5 Saved state
**Description:** The Deck and progress are kept in the browser, so a reload, a closed tab or a phone's discarded tab does not lose them. The Student is told plainly that the data lives on this device only. Realizes UJ-1. [ASSUMPTION: persistence stays in the MVP: the brief requires it, the instruction for this PRD did not list it]

**Functional Requirements:**

#### FR-14: Save and restore
The app writes the Saved state when a Deck is made and after every Mark, "Start", "Start again" and Shuffle change, and restores it when the page is opened.

**Consequences (testable):**
- Given a Deck of 10 Cards with 4 Marked, when the page is reloaded, then the Study screen shows Card 5 of 10, Term first, with the same Pass order and the same 4 Marks.
- Given the Result screen, when the page is reloaded, then the Result screen shows the same Score.
- Given the Ready screen, when the page is reloaded, then it shows the same Cards, Skipped lines and Shuffle setting, and "Edit text" opens the same Paste text.
- Given no Saved state, the app opens on the Paste screen with an empty Paste box.

#### FR-15: Device-only notice
The Ready, Study and Result screens show a notice that the Deck is saved on this device only.

**Consequences (testable):**
- The notice says that the Deck lives only in this browser on this device, that clearing the browser's site data deletes it, and that on iPhone Safari it can also be deleted after about a week without opening the site unless the site is added to the Home Screen.
- It is present on all three screens, in text at least as large as body text, and not inside a collapsed or hidden element.

#### FR-16: Keep working when saving fails
If the browser refuses to read or write the Saved state, the app still works for the current session.

**Consequences (testable):**
- When writing fails (storage blocked, unavailable or full), every screen keeps working and the app shows the notice "Can't save here: your deck will be lost when you close this tab".
- When the stored data cannot be read, is not valid, or has an unknown version, the app ignores it and opens on the Paste screen without crashing.

### 4.6 Any language, any script
**Description:** Students write Notes in many languages and scripts, sometimes mixed in one Line. The app keeps text exactly as made and shows each Term and Definition in its own natural direction. Realizes UJ-2.

**Functional Requirements:**

#### FR-17: Show text exactly, in any script
The app shows each Term and Definition exactly as made, in any script, and never interprets Paste text as markup.

**Consequences (testable):**
- The text of every Term and Definition shown equals the text made from the Paste text (after the trimming and whitespace collapsing of FR-2 and FR-4), character for character, including emoji sequences and combining marks (P-29, P-30).
- Term and Definition are shown in separate elements with automatic text direction: for a Card with the Term `خلية` and the Definition `cell`, the Term is laid out right-to-left and the Definition left-to-right.
- A Term or Definition containing markup is shown as characters: a Term of `<b>x</b>` displays `<b>x</b>`, and a Term of `<img src=x onerror=alert(1)>` does not run any script.
- A Definition of 1,000 characters wraps inside the Card with no horizontal scrolling at 320 px width, and the Card's content scrolls vertically when it is taller than the screen.
- Sample Cards in Latin, Cyrillic, Greek, Arabic, Hebrew, Devanagari, Chinese, Japanese, Korean, Thai and emoji show no replacement boxes on Safari for iOS and Chrome for Android (manual check).

## 5. Cross-Cutting NFRs
- **NFR-1 Performance.** "Make cards" on 1,000 Lines completes within 500 ms on a mid-range phone, and any tap on the Study screen shows its result within 200 ms. [ASSUMPTION: a mid-range phone means a 2022-era Android or iPhone SE class device]
- **NFR-2 Privacy.** Paste text, Cards and Marks never leave the device: after the page has loaded, pasting, making Cards, studying and finishing a Pass cause no network requests; the app sets no cookies and loads no third-party scripts, fonts or analytics.
- **NFR-3 Accessibility and touch.** Every control works by keyboard with a visible focus indicator; text meets WCAG 2.2 AA contrast (4.5:1); every tap target is at least 44 × 44 CSS px; an automated axe-core run reports no serious or critical issues on the four screens.
- **NFR-4 Devices.** The app works from 320 px width on the current and previous major versions of Safari on iOS, Chrome on Android, and desktop Chrome, Edge, Firefox and Safari. [ASSUMPTION: this browser list]
- **NFR-5 Interface language.** Interface text is English only; only Card text is multilingual.

## 6. Non-Goals (Explicit)
- Not an account-based service: no login, sync, sharing or Deck library.
- Not a spaced-repetition or study-planning system: no schedules, streaks, history or statistics.
- Not an editor: the Student cannot edit a Card inside a Deck. The fix for a bad Line is "Edit text" and "Make cards" again.
- Not a translation or dictionary tool, and no language detection.
- Not an analytics product: no tracking of any kind (NFR-2).
- [NON-GOAL for MVP] Undo of a Mark: a mis-tap stands (FR-9).
- [NON-GOAL for MVP] Joining wrapped Lines or reading multi-line Definitions (FR-5).

## 7. MVP Scope

### 7.1 In Scope
- Paste text to Cards with a parser that lists what it cannot read instead of guessing (FR-1 to FR-6).
- Ready screen with Skipped lines and a 3-Card preview (FR-7).
- Flip-card quiz: flip, Mark, advance (FR-8, FR-9).
- Score and restart (FR-10, FR-11).
- Shuffle (FR-12, FR-13).
- Saved state, device-only notice, fail-safe saving (FR-14 to FR-16).
- Any script, shown exactly (FR-17).
- Phone-first layout and English interface (NFR-3 to NFR-5).

### 7.2 Out of Scope for MVP
- Retrying only the missed Cards. [NOTE FOR PM] This is the brief's top stretch item and the only thing that makes "Missed it" mean more than a tally. Revisit it first if testers ask "now what?" (§9, question 2).
- Undo of a Mark; a Definition-first mode; editing Cards; more than one Deck; file import and export; sharing; a translated interface; images and audio; offline install; saving Paste text before "Make cards".

## 8. Success Metrics
*Measured by scripted tests and a small phone test; the app has no analytics (NFR-2).*

**Primary**
- **SM-1: Parse fidelity.** Every row of the acceptance table passes, and on 5 real Notes pasted from different sources (word processor, note-taking app, chat message, PDF, spreadsheet) at least 90% of the intended Cards are made correctly with no manual edit, and every other non-blank Line is listed as a Skipped line. Validates FR-2 to FR-6. [ASSUMPTION: 90% and five sources]
- **SM-2: Unaided first Pass.** In a phone test with 5 Students, all 5 go from the Paste screen to a Score without help, and at least 4 reach the Study screen within 60 seconds of pasting. Validates FR-1 and FR-7 to FR-11. [ASSUMPTION: 5 Students and 60 seconds]

**Secondary**
- **SM-3: Saved state holds.** Across 50 reload and tab-discard cycles on Safari for iOS and Chrome for Android, no Deck, position or Mark is lost. Validates FR-14.

**Counter-metrics (do not optimize)**
- **SM-C1: Skipped line count.** Do not drive it to zero by loosening Separator rules: a looser rule makes wrongly split Cards without telling the Student, which is worse than a listed Skipped line. Counterbalances SM-1.
- **SM-C2: Time to the Study screen.** Do not shorten it by removing the Ready screen's Skipped line list or Card preview. Counterbalances SM-2.

## 9. Open Questions
1. How do Notes copied from Notion, Google Docs and chat apps actually arrive (Separators, bullets, invisible characters)? The brief's research found no reliable source, so the acceptance table uses synthetic examples. Collect at least 10 real pastes before FR-2 to FR-4 are frozen.
2. What does a Student do with "Missed it"? In the MVP it only counts toward the Score. Whether the Score alone motivates revision, or Students need a retry-missed Pass, is the first thing to learn.
3. Do Students mis-tap "Knew it" and "Missed it" often enough to need undo? Decide from the SM-2 phone test.

## 10. Assumptions Index
*Every [ASSUMPTION] from the document, surfaced for explicit confirmation:*
- §2.3 UJ-1 — Sam and Lina are illustrative personas; the brief names no specific Student.
- §4.1 FR-3 — this marker set covers the lists Notes arrive in; letter markers such as "a)" are deliberately not removed.
- §4.1 FR-4 — this precedence and these whitespace requirements match how Notes are written; rules 3 and 4 exist for Chinese and Japanese Notes, which do not put spaces around punctuation.
- §4.1 FR-5 — duplicate Lines are not removed, so the counts always reconcile.
- §4.1 FR-6 — limits of 200,000 characters and 1,000 Cards fit real Notes and the browser's storage quota.
- §4.2 FR-7 — a preview of the first 3 Cards helps the Student catch a systematic mis-split before studying.
- §4.2 FR-9 — a flip is required before Marking, and Marks cannot be undone in the MVP.
- §4.4 FR-12 — Shuffle is off by default and changeable only between Passes.
- §4.5 — persistence stays in the MVP: the brief requires it, the instruction for this PRD did not list it.
- §5 NFR-1 — a mid-range phone means a 2022-era Android or iPhone SE class device.
- §5 NFR-4 — this browser list.
- §8 SM-1 — 90% and five sources.
- §8 SM-2 — 5 Students and 60 seconds.
