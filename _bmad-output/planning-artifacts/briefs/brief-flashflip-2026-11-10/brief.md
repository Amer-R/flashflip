---
title: "Product Brief: FlashFlip"
status: final
created: 2026-11-10
updated: 2026-11-10
---

# Product Brief: FlashFlip

## Executive Summary

FlashFlip is a one-page web app that turns a first-year student's own notes into flashcards in seconds. They paste lines like "term - definition", flip through the cards on their phone, mark each one "knew it" or "missed it", and see their score. There is no login; the deck is saved in the browser.

It is deliberately an MVP: the smallest loop from "my notes" to "what I actually know". It has to cope with how notes really arrive (messy, pasted, in any language) and how students really study (on a phone).

## The Problem

Working belief, not yet checked with students: first-year students revise from their own notes, but notes are not a way to test yourself. Turning them into flashcards usually means retyping them into another tool, often behind an account, so many students just re-read, which feels like revising but does not show what they do not know.

## The Solution

Paste, flip, mark, score. The student pastes notes and gets cards immediately, taps to flip, taps "knew it" or "missed it", and ends on a score. Everything stays on the device, and the app says so.

## What Makes This Different

No moat, and the brief should not pretend otherwise. The difference is friction: no account, no setup, forgiving of messy paste, and usable one-handed on a phone.

A desk-research pass (medium confidence; details in `addendum.md`) shows that paste import is not a gap. Quizlet imports pasted text on its website but not in its apps, Anki imports files rather than pasted text, Brainscape needs an account, and at least one no-account, browser-only flashcard tool already exists. The pass did not find a tool that combines phone-first, no login, and forgiving of messy, multilingual text, but it was a desk search, so that combination is a bet, not a proven gap.

## Who This Serves

First-year university students revising from their own notes, mostly on phones, in whatever language their notes are in. Success for them: from notes to first card in under a minute, and an honest score.

## Success Criteria

1. A first-time student completes a full pass on a phone (paste, flip, mark, score) with no instructions.
2. Paste to first card in under 30 seconds, with no sign-up (a target, not yet tested).
3. A realistic ~20-line messy paste (mixed dashes, colons, tabs, bullets, blank lines) yields the right cards, and unreadable lines are listed, never silently dropped.
4. Latin, CJK and right-to-left text all display correctly on a card.
5. Closing and reopening the tab restores the deck and progress.

## Scope

**In**
- A paste box and a "make cards" action.
- A forgiving parser that splits each line at its first tab, dash or colon (Word's en and em dashes and Chinese "：" included), strips bullets, numbers and extra spaces, ignores blank lines, and lists lines it cannot read instead of dropping them. Exact rules are in `addendum.md`.
- Tap-to-flip cards with "Knew it" and "Missed it" buttons and an "n of N" counter.
- An end screen with the score and "Start again".
- One deck at a time, saved with its progress in the browser (a new paste replaces it), with a visible "saved on this device only" note.
- English interface; card text in any language; phone-first layout.

**Out.** Accounts, sync, multiple decks, editing cards, spaced repetition, file import and export, sharing, a translated interface, images and audio, history and stats, offline install.

**Stretch, once the core loop works.** Retry just the missed cards; shuffle.

## Risks and Unknowns

- **"Messy" has no ceiling.** Multi-line definitions, tables and text pasted from PDFs will defeat a simple parser. The MVP handles one card per line only.
- **"Saved in the browser" can vanish.** Clearing site data, private browsing or a new phone loses the deck. On iPhone, Safari deletes a site's saved data after 7 days of Safari use without the site being visited, unless it is added to the Home Screen (WebKit's documented policy; real-world frequency is less certain). The "saved on this device only" note should say this in plain words. Export or sharing would be the real fix, and both are out of scope.
- **Hyphens in real words.** "well-known" must not split a card, so an ASCII hyphen counts as a separator only when it has spaces around it. Word turns a spaced hyphen into an en dash, and Chinese notes use "：" and "——", so the parser has to accept those too.
- **Right-to-left and mixed-script text** can render in the wrong order, and a separator between opposite-direction text can land on the wrong side. Test with real samples, not just Latin.
- **What "missed it" is for.** In this MVP it only counts toward the score. Whether students want to re-study their misses is the first thing to learn.
