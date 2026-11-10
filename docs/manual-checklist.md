# Manual checklist (production build)

Run on a production build: `npm run build && npm run start`. Tick a box only for something you actually ran. **OPEN** means it has not been run yet.

Last run here: 2026-11-10, desktop Chrome via browser automation (1920 px viewport), Story 1.3 build, `next start` on port 3123. These ticks are evidence from one desktop browser, not release sign-off.

## NFR-1 Performance

- [ ] **OPEN: needs a real device.** "Make cards" on 1,000 Lines within 500 ms on a mid-range phone (2022-era Android or iPhone SE class). Paste the 1,000-line sample from the README example repeated, tap "Make cards", record the time here: ______ ms.
- [x] Desktop Chrome: "Make cards" with 3 Cards and 150 Skipped lines plus a 1,000-character Definition showed the Ready screen. (The timing run included a fixed 300 ms wait, so it is not an NFR-1 figure; use the phone measurement above.)
- [x] Node sanity test: 1,000 Lines parse well under 250 ms (`lib/core/parse-lines.test.ts`, "NFR-1").
- [ ] **OPEN: needs a real device.** Study taps (flip, Mark) show their result within 200 ms.

## NFR-2 Privacy

- [x] `curl -I http://localhost:3123/` shows `Content-Security-Policy` (with `connect-src 'none'`, `default-src 'self'`, `frame-ancestors 'none'`), `Referrer-Policy: no-referrer` and `Permissions-Policy: camera=(), microphone=(), geolocation=()`. No `Set-Cookie` header.
- [x] In Chrome on the production build, after load: every resource came from `http://localhost:3123` (no third-party origin), no `securitypolicyviolation` events while pasting, making Cards, studying and flipping, and an empty console after a reload. Fonts are self-hosted by `next/font`.
- [ ] **OPEN.** Full "finish a Pass" run with the Network panel open on a real browser profile, confirming no requests and no cookies in Application > Cookies. (Cookie access is blocked in the automation browser, so only the missing `Set-Cookie` header was checked.)
- [x] `next dev` does not send these headers (production only, by design).

## NFR-3 Accessibility and touch

- [ ] **OPEN.** axe-core run (browser extension or `npx @axe-core/cli` against the production build) on Paste, Ready, Study and Result: no serious or critical issues.
- [x] Keyboard: focus the Card, flip with Enter or Space; with a Definition taller than the face, ArrowDown scrolled the visible face (3 presses scrolled it 144 px).
- [ ] **OPEN.** Full keyboard-only pass across the four screens (visible focus ring on every control, dialog traps focus).
- [ ] **OPEN.** Contrast and 44 x 44 px targets re-check on the final build (checked in Story 1.2 for the earlier screens; re-check "Show all N").
- [ ] **OPEN.** Reduced motion (`prefers-reduced-motion`): flip is instant, no confetti, still accent on the Result headline.

## NFR-4 Devices and layout

- [ ] **OPEN: needs a real device.** Safari on iOS and Chrome on Android at 320 px: no horizontal scroll with a 1,000-character Definition and with 150 Skipped lines; a tall Card scrolls inside its face by touch.
- [x] Desktop Chrome (viewport 1920 px wide): no horizontal scroll with a 1,000-character Definition and 150 Skipped lines. With the page width forced to 320 px by CSS no element overflowed, but that is only a proxy: the automation window could not be narrowed, so a real 320 px viewport is still OPEN.
- [ ] **OPEN.** Current and previous major versions of desktop Chrome, Edge, Firefox and Safari.
- [ ] **OPEN: needs a real device.** iOS 3D flip: both faces show correctly, no mirrored text, no flicker. If it misbehaves, fall back to a 2D flip.
- [ ] **OPEN: needs a real device.** Swipe a flipped Card right ("Knew it") and left ("Missed it"); a plain tap still flips back. Confirm the direction mapping is what you want.
- [x] The build output lists `/` as `○ (Static)` (prerendered).
- [ ] **OPEN.** With JavaScript disabled the page shows only the skeleton (a known limitation, there is no `<noscript>` message). Decide whether that is acceptable.

## FR-17 Scripts (no replacement boxes)

Paste this block, tap "Make cards", flip through the Cards on Safari for iOS and Chrome for Android:

```
cell - basic unit of life
клетка - основная единица жизни
κύτταρο - βασική μονάδα της ζωής
خلية - الوحدة الأساسية للحياة
תא - יחידת החיים הבסיסית
कोशिका - जीवन की मूल इकाई
細胞——生命的基本單位
細胞：生命の基本単位
세포 - 생명의 기본 단위
เซลล์ - หน่วยพื้นฐานของสิ่งมีชีวิต
👨‍👩‍👧 - family
```

- [ ] **OPEN: needs a real device.** Latin, Cyrillic, Greek, Arabic, Hebrew, Devanagari, Chinese, Japanese, Korean, Thai and emoji all render without replacement boxes.
- [ ] **OPEN.** Arabic and Hebrew Terms lay out right to left, and the Latin Definition left to right.

## Other

- [x] `<b>x</b>` and `<img src=x onerror=alert(1)>` are shown as characters; no `<b>` or `<img>` element is created (checked in Chrome and in a jsdom test).
- [ ] **OPEN.** Device-only notice is visible and readable on Ready, Study and Result at 320 px.
- [ ] **OPEN.** Reload on each screen restores the state (Story 1.2 tests cover this in jsdom; repeat 50 reload and tab-discard cycles on iOS and Android for SM-3).
