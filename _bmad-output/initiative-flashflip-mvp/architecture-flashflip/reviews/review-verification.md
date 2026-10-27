# Verification Review — Architecture Spine, FlashFlip MVP

- **Spine:** `architecture-flashflip.md` (draft, 2026-10-28)
- **Lens:** Was each committed decision checked against reality (registry, bundled docs, the scaffold, a real build) or only asserted from training data?
- **Reviewed:** 2026-10-28
- **Method:**
  - Read the bundled Next 16.4.3 docs in `node_modules/next/dist/docs/`.
  - Checked `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `app/globals.css`, `app/layout.tsx` and the installed package versions.
  - Ran `npm view` for latest versions, peer dependencies and engines.
  - Built a scratch copy of the scaffold (with `npm ci` from the project lockfile) that has the spine's `app/page.tsx` and `FlashFlipApp` pattern, then installed the spine's test stack into it and ran it. The scratch copy is outside the repo. The spine and the project were not modified.

## Verdict

**Mostly verified. Needs a small amendment before build.**

- The riskiest claims, the ones that depend on this new Next/React version, hold up against the docs and a real `next build`: `ensureStatic = 'navigation'`, `use(browser())` from `react-dom`, the `cacheComponents` prerequisite, and Tailwind v4 through `@tailwindcss/turbopack`.
- The **test toolchain** row of the Stack was not checked against the project as it stands:
  - Installing it as written fails with an npm `ERESOLVE` error.
  - The spine's own `@/` import convention does not resolve under Vitest unless the config adds something the spine doesn't mention.
  - The Node floor is wrong for the pinned test tooling.

## Answers to the specific questions

### Q1. Does `ensureStatic = 'navigation'` on a page with a `<Suspense>`-wrapped client component that calls `use(browser())` build correctly?

**Yes. Confirmed by both the docs and a real build.**

- **Docs:** `03-api-reference/03-file-conventions/02-route-segment-config/ensureStatic.md`, section "Client Components", says: "Inside `<Suspense>`, `use(browser())` and `use(io())` are allowed. The prerender includes the fallback for the deferred content."
  - `'navigation'` "works with Cache Components alone and does not require Partial Prefetching".
  - `ensureStatic` fails the build unless `cacheComponents` is enabled. It is enabled in `next.config.ts`, so the spine's parenthetical in AD-2 is accurate.
  - `keeping-pages-static.md` recommends `use(browser(...))` as the client-side fix for static-route errors.
- **Build:** I made a scratch copy of the scaffold with the spine's `app/page.tsx` (`export const ensureStatic = 'navigation'` plus `<Suspense fallback>` around a `'use client'` `FlashFlipApp`). `FlashFlipApp` calls `use(browser('Deck is stored in localStorage.'))` and then `useReducer(..., () => loadDeck())`. The result:
  - `next build` (16.4.3, Turbopack, Cache Components plus Partial Prefetching enabled) succeeded and reported `○ /` as Static.
  - The prerendered `index.html` contains only the Suspense fallback text. No storage-derived content was rendered, as AD-4 intends.
- **Negative control:** adding an `await cookies()` subtree under the same page made the build fail ("data that is not available during a static prerender"). AD-2's claim that "the build must fail rather than ship a dynamic route" therefore holds.

### Q2. Is Vitest 5 + jsdom + `@vitejs/plugin-react` the documented setup for this Next version?

**Partly. Those three packages are the documented core, but the documented setup has more to it, and the spine leaves out the parts it depends on.**

- **What the guide installs:** `02-guides/testing/vitest.md` (bundled with 16.4.3) installs `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`. Its TypeScript config is `plugins: [tsconfigPaths(), react()]` with `test.environment: 'jsdom'`. The guide pins no versions.
- **Registry check:** `vitest@5.0.5`, `@vitejs/plugin-react@6.1.2` and `jsdom@30.1.3` are all the current `latest`.
- **What the spine omits:** `vite` (the peer of plugin-react 6 is `vite ^8`, and npm auto-installs 8.3.5), `@testing-library/react` and `@testing-library/dom`, and a way to resolve tsconfig paths. See F2 and F3 for the consequences.

### Q3. Does `browser` really come from `react-dom` in the installed React?

**Yes.**

- In the installed `react-dom@19.3.0`, `typeof require('react-dom').browser === 'function'`.
- `@types/react-dom@19.3.0` declares `export function browser(reason?: string | (() => unknown)): BrowserUsable`.
- The bundled SPA guide imports it with `import { browser } from 'react-dom'` and states "React 19.3 includes the `browser` API".
- I also ran it under Vitest 5 + jsdom. A component that calls `use(browser())` inside `<Suspense>` rendered the localStorage-seeded content, so the pattern can be tested in the spine's test stack.

## Findings

### F1 — HIGH: The Vitest stack can't be installed into the scaffold as specified (`@types/node` conflict)

- **Where:** Stack table (Vitest 5.0.5); scaffold `package.json` (`"@types/node": "^20"`).
- **Evidence:**
  - `vitest@5.0.5` declares an optional peer `@types/node: "^22.0.0 || >=24.0.0"`.
  - The scaffold has `@types/node@20.19.43` installed.
  - `npm i -D vitest@5.0.5 jsdom@30.1.3 @vitejs/plugin-react@6.1.2 ...` failed with `ERESOLVE ... Conflicting peer dependency: @types/node@26.6.5`. Optional peers are still range-checked when the package is present.
  - The same install with `@types/node@^24` succeeded.
- **Why it matters:** The first story that adds tests will fail at `npm install`. Builders will then improvise, typically with `--legacy-peer-deps` or `--force`, and two builders may not improvise the same way.
- **Fix:** In the Stack, add `@types/node` `^24` (matching local Node 24). Alternatively, state that the scaffold's `@types/node` is bumped when the test stack is added.

### F2 — HIGH: The `@/` import convention doesn't work under Vitest as specified

- **Where:** Consistency Conventions ("Imports: `@/` path alias", "Tests: Vitest + jsdom"); Stack.
- **Evidence:** I ran Vitest with `plugins: [react()]` and `environment: 'jsdom'` only. A test importing `@/lib/flashflip/x` failed with `Failed to resolve import "@/lib/flashflip/x"`. It passed with either of these:
  - `vite-tsconfig-paths@6.1.1` (the bundled guide's approach), or
  - Vite 8's built-in `resolve: { tsconfigPaths: true }`.
- **Why it matters:** Following both conventions together breaks the test suite. The spine has to pick one resolution mechanism, or builders will choose differently (relative imports in tests, a hand-written `alias`, or either option above).
- **Fix:** Name the mechanism in the Tests convention. Either add `vite-tsconfig-paths` 6.1.1 to the Stack (this matches the bundled Next guide), or specify `resolve.tsconfigPaths: true` (this works with the Vite 8 that plugin-react 6 requires, and needs one fewer dependency). Also list `vite` 8.3.5 and `@testing-library/react` 16.3.3 / `@testing-library/dom` 10.4.2, or state explicitly that component tests are out of scope.

### F3 — MEDIUM: The Node floor `≥ 20.9` is wrong for the pinned test tooling

- **Where:** Stack row "Node.js (Vercel runtime and local) ≥ 20.9 (local 24.22.1)".
- **Evidence:** `≥ 20.9` is `next@16.4.3`'s `engines`, so it is correct for `next build`. However:
  - `vitest@5.0.5` requires `node ^22.12.0 || ^24.0.0 || >=26.0.0`.
  - `jsdom@30.1.3` requires `^22.22.2 || ^24.15.0 || >=26.0.0`.
  - `@vitejs/plugin-react@6.1.2` requires `^20.19.0 || >=22.12.0`.
- **Why it matters:** A contributor or CI job on Node 20 or early Node 22 meets the documented floor but cannot run the tests. Local 24.22.1 satisfies all of them, which is why the gap is invisible today.
- **Unverified:** The spine asserts the Vercel runtime version but doesn't confirm it. I did not check Vercel's current default Node version, so it remains unconfirmed.
- **Fix:** Split the row. Keep the runtime floor for Vercel and `next build` at `≥ 20.9`, and set the dev/test floor at `^22.22.2 || ≥ 24.15` (or simply 24.x LTS). Optionally pin it with `engines` or `.nvmrc`.

### F4 — LOW: React is one patch behind latest

- **Evidence:** The Stack and installed version are `react`/`react-dom` 19.3.0. npm `latest` is 19.3.1, released 2026-10-14.
- **Assessment:** `next@16.4.3` peers on `^19.0.0`, so 19.3.1 is compatible. I did not establish whether 19.3.1 contains fixes that matter here, such as security fixes. The spine records 19.3.0 because the scaffold pinned it, and it doesn't say whether 19.3.1 was considered.
- **Fix:** Either bump to 19.3.1 or note that 19.3.0 is held deliberately to match the scaffold.

### F5 — LOW: A live starter default isn't acknowledged (`partialPrefetching: true`)

- **Evidence:** `next.config.ts` enables `partialPrefetching: true` as well as `cacheComponents`. The spine mentions only `cacheComponents`.
- **Assessment:** This makes no difference for `'navigation'`, which the docs say does not require Partial Prefetching, and the build passed with it on. But the spine claims to reflect the starter's live defaults, and a future AD that touches `<Link>` or `'shell'`/`'prefetch'` behavior would depend on this flag.
- **Fix:** Add a single clause to AD-2, for example "(`cacheComponents` and `partialPrefetching` are both enabled in the scaffold)".

## Claims verified as accurate (no action)

| Claim | Evidence |
| --- | --- |
| Next.js 16.4.3 (App Router, Turbopack) | Installed and in the lockfile; npm `latest` = 16.4.3 (2026-10-23); build output shows Turbopack |
| `ensureStatic` exists and `'navigation'` is valid | Bundled reference doc; introduced in v16.4.0 |
| `ensureStatic` needs `cacheComponents`, which is already enabled | Doc "Good to know"; `next.config.ts` |
| `use(browser(reason))` from `react-dom`; Suspense fallback is the prerendered HTML | SPA guide; runtime check; build HTML |
| TypeScript 5.9.3, with 7.x deliberately deferred | Lockfile pins 5.9.3; npm `latest` = 7.0.2, so the deferral is a conscious, checked choice; `eslint-config-next@16.4.3` peers `typescript >=3.3.1` |
| Tailwind 4.3.3 + `@tailwindcss/turbopack` 4.3.3; `globals.css` with `@theme` | Installed versions = npm `latest`; `next.config.ts` turbopack CSS rule; `globals.css` uses `@import "tailwindcss"` + `@theme inline` |
| `@/` alias from the scaffold's tsconfig | `tsconfig.json` `paths: { "@/*": ["./*"] }` (works for Next; for Vitest see F2) |
| Vitest 5.0.5 / plugin-react 6.1.2 / jsdom 30.1.3 are current | npm `latest` matches all three |
| A Server Component page exporting `ensureStatic` | Doc: exporting it from a Client Component throws, and the spine keeps the page a Server Component |
| `tsc --noEmit` with colocated tests | Passed in the scratch project once Vitest was installed |

## Not verified (outside what I could check locally)

- Vercel's current default Node.js version and its build image. See F3.
- Whether Vercel's "default settings" deployment of a fully static Cache Components route produces no Vercel Functions at all. The spine asserts "No Vercel Functions". The build shows `/` as Static, but whether Vercel's adapter still emits a function for `_not-found` or for the RSC/segment payloads was not checked.
