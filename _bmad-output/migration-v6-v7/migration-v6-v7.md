---
type: migration
title: "Migration v6 to v7: flashflip planning store"
status: draft
created: 2026-11-10
---

# Migration v6 to v7: flashflip planning store

Module `method`, `migration-1.toml` (6 to 7): "Move v6 planning and implementation artifacts into the v7 initiative layout".
Project `C:\AI in Action\flashflip`, branch `engineered`, a git repository before the migration (one commit, `47b9c25`). Store (output folder): `_bmad-output`.

**Backup:** `.v6-v7-migration-backup-20261110-0325/` holds a copy of `_bmad/` and `_bmad-output/` (26 files, checked identical with `diff -r`). Its `.gitignore` holds `*`. It is never committed, moved or edited.

**Status of this file:** draft. Nothing outside the backup and this file has changed. Moves start only after the user approves.

## Why this migration applies

- `detect` matched: dated artifact folders `briefs/brief-flashflip-2026-11-10/brief.md` and `prds/prd-flashflip-2026-11-10/prd.md` under the planning folder.
- Not present: `epics.md`, `sprint-status.yaml`, v6 story files, `specs/`, 6.13 pre-release spec folders.
- Preconditions hold: no `active_initiative` (`_bmad/custom/config.user.toml` does not exist) and no `initiative-*/` folder in the store.
- Baseline: `bmad status` reports the project installation current (v6.13.0-next, all modules current, no problems). `migrate_v6.py` (report mode) finds no v6 traces in `_bmad`: `legacy_leftovers`, `stale_config_keys` and `unused_customizations` are all empty, so `--clean` is not needed.

## Source folders

| Folder | Value | Where it came from |
|---|---|---|
| output folder | `_bmad-output` | `core.output_folder` in `_bmad/config.toml` |
| planning folder | `_bmad-output/planning-artifacts` | `modules.bmm.planning_artifacts` is set nowhere; the v6 default is in use, and both decision logs record that fallback |
| implementation folder | none | `modules.bmm.implementation_artifacts` is set nowhere and `_bmad-output/implementation-artifacts` does not exist |

## Inventory and destinations (6 files)

| v6 file | Bytes | v7 destination under `_bmad-output/initiative-flashflip/` |
|---|---|---|
| `briefs/brief-flashflip-2026-11-10/brief.md` | 4,854 | `brief-flashflip-2026-11-10/brief-flashflip-2026-11-10.md`, gains `type: brief` |
| `briefs/brief-flashflip-2026-11-10/addendum.md` | 4,911 | `brief-flashflip-2026-11-10/addendum.md` |
| `briefs/brief-flashflip-2026-11-10/.decision-log.md` | 8,083 | `brief-flashflip-2026-11-10/.decision-log.md` |
| `prds/prd-flashflip-2026-11-10/prd.md` | 28,192 | `prd-flashflip-2026-11-10/prd-flashflip-2026-11-10.md`, gains `type: prd` |
| `prds/prd-flashflip-2026-11-10/.decision-log.md` | 6,703 | `prd-flashflip-2026-11-10/.decision-log.md` |
| `architecture.md` (flat, a bare type, so it takes the project name) | 53,941 | `architecture-flashflip/architecture-flashflip.md`, gains `type: architecture`, `title`, `created` |

## Questions, answers, reasons

| # | Question | Answer | Reason |
|---|---|---|---|
| 1 | Your planning content is `_bmad-output/planning-artifacts` (brief, addendum, PRD, architecture, two decision logs) and your implementation content is none. Right, and is there any elsewhere? | Yes; none elsewhere (default, awaiting approval) | The inventory found nothing else, and nothing outside the store refers to the old paths |
| 2 | Will this work touch other repositories, or should the planning files keep their own git history apart from the code? | No (default, awaiting approval) | One repository. The `workspace` step is skipped |
| - | Stories in progress or in review: finish them in v6 first? | Not asked | There are no stories |
| - | Several PRDs, briefs or architectures to group, or dated versions to archive? | Not asked | One of each; no versions share a name |

## Decisions beyond the migration's questions

The request was "migrate to v7 and make everything clean". These are the choices that request leaves open. Each has a default.

| # | Decision | Default (awaiting approval) |
|---|---|---|
| A | Commits. The migration commits the current state first and after each step that changes files, in an existing repository. Never pushed. | Yes: local commits on `engineered`, listed under "Repository changes" |
| B | The BMad install (`.agents/` 498 files, `_bmad/` 20 files, `skills-lock.json`) is untracked. Commit it in its own first commit so the working tree ends clean? | Yes. `_bmad/custom/config.user.toml` stays untracked: `_bmad/custom/.gitignore` ignores `*.user.toml`, and the active initiative is personal |
| C | Backup `.v6-v7-migration-backup-20261110-0325/` | Keep. After the commits, git holds the old state, so it can be deleted once the user is satisfied. It is deleted only when the user says so |
| D | `~/.claude/skills` (global) holds 13 duplicate copies of skills the project also has and 18 retired v6 skills (including `bmad-help`, `bmad-create-epics-and-stories`, `bmad-sprint-planning`, `bmad-check-implementation-readiness`, `bmad-correct-course`, `bmad-spec`). Remove them? | No. Deleting them affects every project on this machine, and they are the only BMad skills Claude Code can see until the v7 skills are registered for it |

## What moves where

All moves are `git mv`, after the snapshot commit makes the store tracked, so history follows the files.

1. Rename `planning-artifacts/` to `initiative-flashflip/` (named after `core.project_name`).
2. Move `briefs/brief-flashflip-2026-11-10/` and `prds/prd-flashflip-2026-11-10/` up to the initiative's top level, folder names kept. Remove the emptied `briefs/` and `prds/`.
3. Rename each main file to match its folder, and add the missing `type`, `title` and `created` keys (table above). Nothing else in those files changes except the path rewrites below.
4. Put the flat `architecture.md` in `architecture-flashflip/` and rename it to match.
5. Create `backlog/` and `archive/` at the store root, each with a `.gitkeep`. `archive-v6/` is not created: there are no v6 tracking sources.

## The initiative envelope (new file)

`initiative-flashflip/initiative-flashflip.md`, written from `bmad-agent-po/assets/ticket-template.md`. No epics exist, so no `tickets/` folder is created: `tickets.py status` exits 0 on an unsliced initiative (tested on a scratch copy). Slicing is Sofia's next job.

| Part | Derived from |
|---|---|
| Frontmatter: `type: initiative`, `title: "FlashFlip"`, `parent: none`, `risk: low` | project name; architecture rates complexity low overall |
| `sources:` the PRD main file. `companions:` the architecture main file | migration rule; there is no UX document |
| Description, Outcome | PRD summary (§1 Vision) |
| Requirements `R1` to `R17` | One line per PRD requirement, `R<n> (FR-m): <the PRD's line>`, in the PRD's words, no `covers` |
| Constraints | NFR-1 to NFR-5, plus the precision-over-recall rule (PRD §4.1, SM-C1) |
| Done when (5 checks) | all FRs and NFRs hold (§7.1); SM-1, SM-2, SM-3 (§8); deployed as a static Vercel site with the manual NFR checklist done (AD-12) |
| Boundaries | PRD §6 non-goals and §7.2; one tracer path; the six architecture components as touch points with no owner yet |
| References | pointers into the PRD, brief, addendum, architecture and both decision logs |
| Notes | PRD §9 open questions 1 to 3; the design-sheet approval gate from the architecture's gap analysis; one line saying the 13 assumptions in PRD §10 are unconfirmed |

## Path rewrites

Live references to rewrite:

1. `architecture-flashflip.md` frontmatter `inputDocuments:` (3 paths: the PRD, the brief, the addendum).
2. `prd-flashflip-2026-11-10.md` §0, line 13: the path to the brief.

Checked: no relative markdown links or HTML references exist in the moved files. The only `src=` match is the literal `<img src=x ...>` example in FR-17.

Mentions left unchanged, because they are audit trail and not references: PRD decision log lines 7, 9, 10 and 16, and brief decision log lines 9 and 10 (old folder paths as they were when each run happened), and the PRD log's mention of `prd.md` by its old name. Generic mentions of `_bmad-output/` in the architecture (lines 241 and 421) stay valid.

Outside the store and `_bmad/`: no file refers to `planning-artifacts`, `planning_artifacts`, `implementation-artifacts` or `_bmad-output`. Nothing for the user to update.

## Left in place

Nothing. The store root holds only the planning folder. There is no `party-mode/`, `project-context.md`, `brainstorming/`, `specs/`, `forge/`, or unrecognized file.

## Configuration

- Create `_bmad/custom/config.user.toml` with `[core]` and `active_initiative = "initiative-flashflip"` (personal, git-ignored).
- `_bmad/config.toml` is installer-managed and stays untouched. It holds no `modules.bmm.*` keys. No `_bmad/custom/` override and no module config key names a moved path.

## Repository changes (local only, never pushed, backup never staged)

| # | When | Message starts with | Holds |
|---|---|---|---|
| 0 | first (decision B) | `chore: add the BMad v7 install` | `.agents/`, `_bmad/`, `skills-lock.json` |
| 1 | before step 6 | `migrate v6->v7: snapshot of the store before the move` | `_bmad-output/` in its v6 layout, with this draft plan |
| 2 | after step 7 | `migrate v6->v7 step 7: ...` | folder rename, moves, main-file renames, frontmatter keys |
| 3 | after step 8 | `migrate v6->v7 step 8: ...` | the initiative envelope |
| 4 | after step 13 | `migrate v6->v7 step 13: ...` | the path rewrites |
| 5 | after step 14 | `migrate v6->v7 step 14: ...` | `backlog/.gitkeep`, `archive/.gitkeep` |
| 6 | after steps 15 and 16 | `migrate v6->v7: verification record` | this file with every result filled in and `status: done` |

Steps 9 to 12 (spec folders, pre-release specs, loose implementation files, what stays in place) change no files here, so they make no commits.

## Not touched

- The app: `app/`, `package.json`, configs. The architecture's first implementation step (housekeeping, then the pure core) is a build task, not part of this migration.
- `~/.claude/skills` (decision D).

## Verification (filled in at step 15)

| # | Checklist item | Result |
|---|---|---|
| 1 | Every v6 source file is under an initiative, `backlog/` or `archive/`, or listed as left in place | pending |
| 2 | Moved folders kept their names and every file; main files match their folders; `initiative-flashflip/`, `backlog/`, `archive/` exist, with `.gitkeep` where empty | pending |
| 3 | Dated versions of one document are all present | pending |
| 4 | `tickets.py status` exits 0 for the initiative | pending |
| 5 | Stories, plans and epic files | not applicable: there are no stories |
| 6 | Plan build types and statuses | not applicable: there are no plans |
| 7 | `covers` ids resolve to Requirements lines | not applicable: there are no epics or entries |
| 8 | No pre-release spec folder or `CAP-` id remains | not applicable: none existed |
| 9 | Every live path in `inputDocuments:`, `sources:`, `companions:`, References and prose links resolves from where its file now sits | pending |
| 10 | `_bmad/custom/config.user.toml` names the active initiative and `core.output_folder` resolves to the store | pending |
| 11 | Module config keys whose folder moved name the new location | not applicable: none exist |
| 12 | The store is under git as answered, no file is tracked twice | pending |
| 13 | The backup holds every original file and no commit includes it | pending |
| 14 | This plan records every question, answer, reason, the backup path and each result | pending |
