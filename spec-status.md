# Where the spec stands

A status of `spec.md` on the `pipeline` branch, written on 23 Nov 2026 at the end of the session that built it.
Read this before `spec.md`: the spec still words most items as work to do. `cloud-integration.md` holds what a
cloud session needs, and `git log f26cf182..HEAD` has one commit per item, named by its number.

Nothing here has built a story. Every script and hook was run on small made-up input or on the Alexander
story's content. No agent has been dispatched under the new definitions.

## Status by item

| Item | Status | Where |
|---|---|---|
| 0.1, 0.3 | built before this session, now reading the new forms | `scripts/token-ledger.mjs`, `fault-ledger.mjs`, `transcripts.mjs` |
| 0.2 | built, not yet run | `scripts/benchmark.mjs`, `content/alexander-the-great/.plan/020-greece-secured/` |
| 1.1, 1.2, 1.3 | built before; `SHOT_TEXT` now in the notes | `agents/pages.md` |
| 1.7, 1.8, 1.9 | in the notes | `agents/pages.md`, `agents/cloud.md` |
| 1.11 | open: no build finished in the cloud container | |
| 1.4, 1.5, 1.6, 1.10, 1.12 | not done: harita or kitap | |
| 2.0 to 2.17 | done | `agents/report.md`, `agents/overseer.md`, every definition |
| 3.1 | built | `scripts/rules-lint.mjs` |
| 3.2 | built | `scripts/names-check.mjs` |
| 3.3 | done another way: `quotes-check` reads claim ids from the YAML plans alone | `scripts/quotes-check.mjs` |
| 3.4 | built; `points.mjs` ran on raw drawings only, never on built shapes | `scripts/points.mjs`, `route-surface.mjs` |
| 3.5 | built | `scripts/card-guard.mjs` |
| 3.6 | built; its YAML-plan path ran only on section 020 | `scripts/slice.mjs` |
| 3.7 | built; not run to the end, since the image originals are missing | `scripts/contact-sheet.mjs` |
| 3.9 | done | the Check steps of the definitions |
| 3.8 | not done: harita | |
| 3.10 | built before | `scripts/zone-gaps.mjs` |
| 4.1 to 4.5, 4.7 | done | notes, definitions, `scripts/research-gates.mjs` |
| 4.6 | left, as the spec says "not yet" | |
| 5.0 to 5.7 | done; 5.3 is replaced by 6.10 | `agents/overseer.md`, definitions |
| 6.1 | done with 2.17: a map keeper and one cartographer per section | |
| 6.3 | done here; `harita check` does not yet know a placeholder | `scripts/images-place.mjs`, definitions |
| 6.5 | written, parses, never run | `workflows/section.js` |
| 6.7 | first version, `claude plugin validate .` passes | `.claude-plugin/plugin.json`, `hooks/` |
| 6.10 | done | `research-coordinator`, `researcher`, `research-reviewer` |
| 6.6 | left, as the spec says "not yet" | |
| 6.2, 6.4, 6.8, 6.9, 6.11 | not done: harita or kitap | |

## Choices the spec did not make

These were made to get the forms written. Each is a place to change if it reads wrong.

- **Fault entry.** Keys `id`, `severity`, `file`, `field`, `replaces` (value or clause), `old`, `new`, `source`,
  `kind`, `claim`, `introduced`, `owner`, `state`, `ruling`. An id is `<list>-<role>-<n>`, such as
  `020-fact-checker-3`. A fault that is no text change leaves out `replaces` and `old`.
- **Fix log entry.** Keys `fault`, `by`, `file`, `field`, `old`, `new`, `commit`. `commit` is the commit the change
  was made on, read before the change, so a recheck is `git diff <commit> -- <file>`.
- **Report file.** `reports/<section>-<role>[-<battle or lang>].yaml`, a YAML list with one entry per run. The
  entry opens with the `step` and `task` of its dispatch.
- **Dispatch block.** Four fields beyond the spec's: `battle`, `pages`, `lang`, `names`.
- **Task words.** Every definition lists its own, in a sentence "Your task is ...", which
  `scripts/transcripts.mjs` reads to check a dispatch.
- **The section's header** (years, opens, introduces, hands on, left out) is the `section` part of `text.yaml`,
  since the spec's four plan files had no place for it.
- **A phase page** is an entry of `pages.yaml` with `phase_of: <battle id>`.
- **An image a page wants** is `{ name, shows, on }` in `text.yaml`. `on` gives it to a marker or a card.
- **The source map** of the survey is `.plan/sources.md`. A researcher's lines are in `.plan/research/<section
  number>.md` or `research/<battle id>.md` until they are reviewed and merged.
- **A gap researcher** adds its lines to `research.md` itself, and the section's fact checker checks them. The
  spec left that merge open.
- **The checkers have `Write`**, and the fact-checker and the two auditors `Edit`, for fault lists, reports and
  the fixes 4.3 and 4.4 give them.
- **The body of a text** runs 150 to 300 words, 350 is tolerated, and notes do not count.
- **The translation agents** got one sentence each, their task words, though the spec says it changes nothing
  of theirs.
- **Existing stories.** Only section 020 of Alexander has a YAML plan. The other sections keep their Markdown
  plans, which no script reads any more.

## Known to be unfinished

- The plugin's notes use paths of this repo, such as `agents/report.md`, so the plugin works here and in no
  other repo yet.
- The hooks load only with `claude --plugin-dir .`. They are not in `.claude/settings.json`, so a plain session
  and a cloud session run without them.
- Whether a workflow can name the plugin's own agent types is not in the docs. `workflows/section.js` takes an
  `agents` prefix for that case.
- The rulings of `decisions.md` are not counted by kind (2.14): a line there carries no kind.
- A cold build of Alexander did not finish in the cloud container. `patches/harita-0.12.2-zone-cache.patch`
  cuts the zone comparison to about three minutes. The step after it, the story's own map, was still running
  when the session ended and is not timed.
- `rules-lint` reports all 71 pages of Alexander for a missing `when`, which waits for kitap's dates before our
  era (1.12).

## What to do next

1. On a machine where the story builds, run the benchmark: `node scripts/benchmark.mjs setup build <folder>`,
   then build section 020 there with a `section-lead` and the task `build`, with the plugin loaded
   (`claude --plugin-dir .`). Save the run with `scripts/token-ledger.mjs --json` and compare.
2. Fix what that run breaks. Expect a definition that contradicts another, and a hook that refuses something
   valid.
3. Send `patches/harita-0.12.2-zone-cache.patch` to harita, and time the rest of a cold build.
4. Then the harita and kitap items, and the list of `cloud-integration.md`.
