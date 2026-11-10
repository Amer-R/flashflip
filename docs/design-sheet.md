# FlashFlip design sheet (approved)

Status: **approved 2026-11-10**. Gate for the UI tasks of Story 1.1 (AD-10, Gap A). Tokens in `app/globals.css` take their values from this sheet.

Direction: Gen Z, phone-first from 320 px. Dark-first, light follows the system setting. Bold, soft-edged, a little playful, never noisy. Streaks, sharing and leaderboards stay Non-Goals.

## 1. Palette (semantic tokens, PAT-14)

All ratios computed from the hex values (WCAG 2.x relative luminance). Text needs 4.5:1, UI borders and focus rings need 3:1 (NFR-3).

| Token | Dark (default) | Light | Used for |
|---|---|---|---|
| `--color-bg` | `#0f0b1e` | `#faf8ff` | page background |
| `--color-surface` | `#1b1533` | `#ffffff` | cards, panels |
| `--color-surface-raised` | `#251d45` | `#f0ebff` | reserved for pressed/hover (Story 1.2) |
| `--color-text` | `#f5f3ff` | `#1a1033` | body and headings |
| `--color-text-muted` | `#b9b2d9` | `#554b7a` | hints, counters |
| `--color-accent` | `#c4b5fd` | `#5b21b6` | primary buttons, links |
| `--color-on-accent` | `#1a1033` | `#ffffff` | text on accent |
| `--color-knew` | `#86efac` | `#166534` | "Knew it" |
| `--color-missed` | `#fda4af` | `#9f1239` | "Missed it" |
| `--color-border` | `#6d62a8` | `#7c6fb0` | outlines |
| `--color-focus` | `#fde047` | `#7c2d12` | focus ring |

Contrast checks (ratio : 1):

| Pair | Dark | Light |
|---|---|---|
| text on bg | 17.62 | 17.10 |
| text on surface | 15.93 | 18.01 |
| text on surface-raised | 14.28 | 15.47 |
| text-muted on bg | 9.60 | 7.46 |
| text-muted on surface | 8.68 | 7.85 |
| accent on bg | 10.47 | 8.53 |
| accent on surface | 9.47 | 8.98 |
| on-accent on accent | 9.76 | 8.98 |
| knew on surface | 12.45 | 7.13 |
| missed on surface | 9.24 | 8.02 |
| focus ring on bg | 14.66 | 8.90 |
| border on bg (UI, needs 3) | 3.65 | 4.19 |
| border on surface (UI, needs 3; text box) | 3.30 | 4.41 |

"Knew it" and "Missed it" are never told apart by color alone: they are labelled buttons.

## 2. Type scale

Geist (already self-hosted by `next/font`, NFR-2). Base 16 px; nothing below 16 px for body text.

| Token | Size / line height | Weight | Used for |
|---|---|---|---|
| `--text-display` | 2rem / 1.15 | 700 | screen headings |
| `--text-card` | 1.5rem / 1.3 | 600 | Term and Definition on the card |
| `--text-body` | 1rem / 1.5 | 400 | body, Skipped lines, notices |
| `--text-small` | 0.875rem / 1.4 | 500 | "n of N" counter only |

## 3. Shape and spacing

| Token | Value |
|---|---|
| `--radius-card` | 1.5rem |
| `--radius-control` | 999px (pill buttons) |
| `--radius-input` | 1rem |
| `--spacing-gutter` | 1rem (16 px side gutter at 320 px; `px-gutter`) |
| min tap target | 44 × 44 px (NFR-3) |

## 4. Motion (Story 1.2 uses these; Story 1.1 only defines them)

| Token | Value |
|---|---|
| `--duration-flip` | 350 ms |
| `--duration-screen` | 200 ms |
| `--duration-tap` | 120 ms |
| `--ease-pop` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

Every animation has a `motion-reduce` fallback (instant swap, no confetti burst). Taps always show a result within 200 ms (NFR-1).

## 5. Tone for unspecified text

PRD-fixed labels stay exactly as written: "Make cards", "Start", "Edit text", "New deck", "Knew it", "Missed it", "No cards could be made", "n of N", "N cards, M skipped". Casual tone applies only to the rest.

| Where | Proposed text |
|---|---|
| Paste heading | "Paste your notes" |
| Paste box label | "Paste your notes here" |
| Paste box hint | "One card per line: term – definition" |
| Ready heading | "Ready to study" |
| Study heading (visually hidden) | "Study" |
| Flip hint | "Tap the card to flip it" |
| Result headline (Story 1.1, bare) | "Pass complete" |
| Result headline (Story 1.2) | "Pass complete!" (same for any Score) |
