---
title: "Product Brief: FlashFlip"
status: final
created: 2026-10-28
updated: 2026-10-28
---

# Product Brief: FlashFlip

## Summary

FlashFlip is a single web page that turns a student's own `term - definition` lines into flashcards. Students paste their terms, flip through the cards, mark each one **Knew it** or **Missed it**, and see their score. They can then retry only the cards they missed. There is no login and no server. Everything stays in the browser.

It is built for a 20-minute classroom demo, so the goal is the smallest version that shows the whole loop: paste, flip and mark, score, retry.

## The Problem

Students revising for exams have long lists of terms to learn. Rereading those lists is dull, and students lose track of which terms they actually know and which they only recognise. Self-testing works better than rereading (Dunlosky et al., 2013), but the familiar tools add friction for a quick session: Quizlet requires an account to save sets and limits its quiz modes on the free plan, Anki is hard to learn, and newer tools push AI-generated cards or cap free use.

## Who This Serves

First-year university students revising for exams, mostly on their phones. They copy terms from lecture notes or a notes app and paste them on the same device.

## The Solution

One page, three steps:

1. **Paste.** The student pastes lines in the form `term - definition`, one per line, into a text box. Each line containing ` - ` becomes a card. The line is split at the first ` - `, so definitions can contain dashes. Lines without it are skipped, and the page says how many were skipped.
2. **Flip and mark.** Cards are shuffled at the start of every round, so students can't memorise answers from card order. They appear one at a time showing the term. Tapping reveals the definition. The student marks the card **Knew it** or **Missed it** and moves to the next one.
3. **Score and retry.** At the end the student sees a score (e.g. 7 / 10) and can start a round with only the missed cards. This retry round addresses the problem of losing track of which terms they know.

The pasted deck is saved in the browser's local storage, so reloading the page doesn't lose it. Knew-it / missed-it results last only for the current visit. Clearing browser data loses the deck, and that is accepted for an MVP.

The page is designed phone-first (large tap targets, one card per screen) and also works on a laptop.

## Success Criteria

- A student can paste 10 terms and finish a quiz with a score in **under 3 minutes**.
- The full loop (paste, flip and mark, score, retry) runs live in the classroom demo with no setup, account or install.

## Scope

**In:** paste box, line parsing with a skipped-line count, card flip, knew-it / missed-it marking, shuffle each round, end-of-round score, retry missed cards, deck saved in local storage, phone-first responsive layout.

**Out:** login or accounts, deck sharing, AI-generated cards, images, a native mobile app, any database or server, spaced repetition, multiple decks, import/export, and saving card results between visits.
