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
| 1.5, 1.12 | released in kitap 0.9.0, and 0.9.1 is installed: a page with `when: -0335-03` passes the check, the linter and a strict build | |
| 1.4, 1.6, 1.10 | not done: harita or kitap | |
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

## The first benchmark run, 24 Nov 2026

Section 020 was built once on a laptop by one `section-lead` and its team, in three sessions, since two faults of
the harness stopped the first two. It reached the recheck of its fact check and ended with the status `faults`:
4 weak faults wait for a ruling, 3 for the names agent and 4 taste faults for the cartographer. The run took 18
agents and 9.2 million weighted tokens, 2.3 million a page, of which about a third was work the harness lost. No
context passed 195,000 tokens. It is one run of an easy section and is no proof yet that the process is cheaper:
the same section has still to be built once by the old definitions, on `main`, to compare with.

What it found, and what was done:

- **A repo cannot be its own plugin.** With `claude --plugin-dir .` every file of the repo is sensitive, and each
  `Write` and `Edit` of an agent is refused. Fixed: the hooks are in `.claude/settings.json`, and they run inside
  nested agents, three layers down, as a probe showed.
- **A session started with `-p` stops its agents** ten minutes after its own last turn. Fixed in the command
  `scripts/benchmark.mjs setup` prints, with `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`.
- **A dispatch block in a code fence was refused,** 4 times in 19 dispatches. Fixed: the fence is taken off.
- **The `build` setup took out the battle card,** which is written at `plans`. Fixed: it stays. The setup now
  also links the packages and the sources, copies the cache and commits the start.
## The second run, and what was changed after it

The second run, on 24 Nov 2026, ran clean in one session of 59 minutes: 21 agents, 7.4 million weighted tokens,
1.86 million a page, both checkers at `pass`, no dispatch refused and no write refused. The maps took 40% of it:
three rulings and three rounds of fixes parted one crowded group of markers on the Danube page.

About nine turns in ten of the first run held one tool call, and the most common call was one small lookup. An
agent's whole context is sent again on each turn, so the turns are the cost that is left. Changed for it:

- **`scripts/brief.mjs`** lists by path what a role reads first, to read in one turn. Every definition names it.
- **"Turns" in `agents/report.md`:** calls that do not wait on each other go in one turn.
- **The linter reports two markers that stand on each other** at a page's opening view. On the Alexander story
  as it was built it finds 4 pairs, the Danube's among them.
- **"Image placeholders" in `agents/report.md`, and `scripts/placeholders.mjs`,** which runs the check and sets
  the waiting placeholders apart. A map auditor had taken one out as a failed check.
- **The benchmark:** `compare` orders a run's reports in time, so a section that passed counts as accepted, and
  a `build` setup takes out the page generator of the earlier build.

## The third run, and what was changed after it

The third run took 53 minutes: 15 agents, 282 turns where the second took 510, and 5.4 million weighted tokens,
1.35 million a page. Every agent read its start-up list in one turn. After that about eight turns in ten still
held one call. Changed after it:

- **A placeholder is a labelled box.** kitap's branch `image-placeholders` draws an image id that no folder holds
  as a hatched box with its name, lists it as `waiting` in a check and stops a strict build on it.
  `patches/kitap-0.9.1-image-placeholders.patch` carries it here until kitap ships it. harita has two tests that
  expect a plain build to fail on an unknown image, to change when it takes that kitap.
- **`scripts/patches.mjs` applied nothing.** It called every patch "in place". It applies them now, so the
  zone cache patch of harita is in use on a laptop for the first time.
- **The plan check reports crowded markers,** from the points a plan's `map.yaml` gives, so the plan changes
  before anything is drawn. It reports the Danube pair in the benchmark's own frozen plan, which is left as it
  is so the runs stay comparable.
- **`scripts/passages.mjs`** writes each claim of a section with the passage of each quote. The start-up list of
  a fact checker and of a writer names the file. For section 020 it places 52 of 52 quotes in about 1,050 lines.

- **Two icons that meet show one at a time (6.11).** harita's branch `marker-clashes` measures the icons on the
  screen: the higher `rank` leads with a count, and the other comes forward from its name in the text, a tap
  or a zoom. `patches/harita-0.12.2-marker-clashes.patch` carries it here. So a clash is no fault any more: the
  plan check notes each pair and which leads, and the linter reports only a marker that waits and that the text
  does not link. The benchmark's Danube page needs no fix. `agents/pages.md` and item 6.11 say so, and
  `SHOT_POINT=<marker id>` captures a marker that waits.

Open from the third run: a fix log names a commit as its base, and nobody commits during a section, so a
recheck cannot diff a text against it.

## Open after the first two runs

- **Open, a rule to decide:** the section-reviewer applied 8 weak faults with no ruling, and two of its fixes
  brought in new faults.
- **Open, a rule to decide:** nobody of a section's team may add a row to `names.md`, so a name a text needs
  goes up as unresolved.
- **Open:** the edit hook hands a writer the names of its text that have no row, which it cannot fix.
- **Open:** a hook passes input it cannot parse.

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
- The hooks load from `.claude/settings.json`. The plugin itself has to be copied to a folder of its own before
  it is loaded anywhere, and its notes still name this repo's paths.
- Whether a workflow can name the plugin's own agent types is not in the docs. `workflows/section.js` takes an
  `agents` prefix for that case.
- The rulings of `decisions.md` are not counted by kind (2.14): a line there carries no kind.
- A cold build of Alexander did not finish in the cloud container. `patches/harita-0.12.2-zone-cache.patch`
  cuts the zone comparison to about three minutes. The step after it, the story's own map, was still running
  when the session ended and is not timed.
- `rules-lint` reports all 71 pages of Alexander for a missing `when`, which waits for kitap's dates before our
  era (1.12).

## What to do next

`roadmap.md` holds it: the steps still to run with agents, the known defects, and the work on hold.
