# Addendum: Research Extract and Build Notes

Depth that does not fit the brief but the build will want. The research comes from one desk-research pass by a subagent on 2026-11-10, using generic search terms only. I have not independently verified it, and the confidence tags are the researcher's. Some pages could not be fetched and were read through search excerpts.

## Landscape

- **Quizlet:** paste import is on the website only, not in the apps. Term and definition split by tab, comma or dash; cards by newline or semicolon. Flip cards and Match are free, Learn and Test are capped (the cap numbers conflict across sources). [medium] https://help.quizlet.com/hc/en-us/articles/360029977151
- **Anki:** imports files; no paste box documented. It guesses tab, comma or semicolon, expects UTF-8, and uses quotes for multi-line fields. Its developer described the delimiter detection as guesswork in a May 2025 forum thread. Free except on iOS, at $24.99 once. [high] https://docs.ankiweb.net/importing/text-files.html
- **Brainscape:** paste or upload into two columns, with an AI "analyze" step. Account required; free-versus-Pro import limits are unclear. [medium] https://www.brainscape.com/academy/excel-to-flashcards/
- **Cram:** custom separators and 25 MB uploads. [low; page could not be fetched] https://www.cram.com/flashcards/create
- **TotallyNotQuizlet:** no accounts, browser-local, share links carried in the URL. It warns that clearing site data deletes progress. [medium] https://totallynotquizlet.codeberg.page/study
- **Evidence gap:** student-voiced complaints about import are thin, mostly Anki delimiter clashes. Phone-first, no login, and forgiving of messy and multilingual text remain unvalidated.

## Browser storage

- Safari deletes localStorage and IndexedDB after 7 days of Safari use without the user interacting with the site. Home Screen web apps are exempt. Eviction is all-or-nothing per origin, so IndexedDB adds size, not durability. [high for the policy, medium for real-world behavior] https://webkit.org/tracking-prevention/
- `navigator.storage.persist()` is best effort: Chrome grants or denies silently, Firefox prompts, Safari 17+ uses heuristics such as Home Screen installs, and an open WebKit bug reports it returning false (2024). [medium] https://web.dev/articles/persistent-storage , https://bugs.webkit.org/show_bug.cgi?id=271401
- A Home Screen app gets storage separate from Safari, and iOS 26 (September 2025) opens any site added to the Home Screen as a web app by default. In-app browsers do not share localStorage with Safari. [medium] https://web.dev/articles/storage-for-the-web , https://www.macrumors.com/2025/06/18/safari-changes-on-ios-26/
- localStorage holds about 5 MiB. Private mode wipes it on close, and "Remove All Website Data" or a new device loses everything. [high] https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Messengers may truncate long share-link URLs. [medium] https://nuqs.dev/docs/limits

## Messy text and languages

- Word turns " - " into an en dash, "--" into an em dash, and straight quotes into curly ones. Unicode has 31 dash characters, which JavaScript exposes as `\p{Dash}`. Chinese notes use the fullwidth colon "：" and the double em dash "——". [high]
- Text pasted from PDFs has a hard line break at every visual line and split hyphenated words. Arabic copied from the Chrome and Edge PDF viewers can paste character-reversed (August 2025). [medium]
- A neutral separator between runs of opposite direction takes the paragraph direction and can land on the wrong side. Render each field separately with `dir="auto"` or `<bdi>`. Anki users hit this in 2025. [high]
- Pressing Enter to confirm a CJK candidate (IME) can submit a form. Check `isComposing` and `keyCode` 229; Safari fires `compositionend` first. [high]
- Fonts fall back per character, so avoid `system-ui` for body text. [high]
- Not found: reliable sources on Notion, Google Docs or chat-app clipboard formats. Test with real samples. [low]

## Parser rule v1 (my working assumption, unconfirmed)

1. Trim each line, strip a leading bullet or number ("•", "-", "*", "1.", "1)"), collapse repeated whitespace, and drop empty lines.
2. Split once. Prefer a tab; otherwise the first spaced dash (ASCII hyphen or any Unicode dash); otherwise the first colon (":" or "：") or "——".
3. An ASCII hyphen without spaces never splits ("well-known").
4. If either half is empty, skip the line and list it back to the student with its line number.
5. Keep text exactly as pasted: no language detection and no translation. Show term and definition as separate elements with `dir="auto"`.

## Build context

- The repo is an untouched `create-next-app` scaffold: Next.js 16.4.5, React 19.3, Tailwind 4, TypeScript, one commit, no FlashFlip code yet. Nothing in the brief depends on this stack.
