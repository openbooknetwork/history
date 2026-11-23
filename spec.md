# Spec: a cheaper story pipeline

Changes to the agents' process, drawn from `feedback.md`, `evaluation.md` and `lean.md` after the Alexander the
Great cloud run. Each item says what changes, where, and when it is done. Bracketed references point at the note
that argues for it: `[F12.1]` is `feedback.md` item 12 point 1, `[E4.1]` is `evaluation.md` section 4.1, `[L6]` is
`lean.md` rule 6.

## The cost this spec targets

The baseline run took 73 agents, 1.12 billion cache-read tokens, 43 million cache-write tokens and 5.2 million
output tokens `[E7]`. Cache reads are context size times number of turns, summed over agents. Two things drive
them:

- **Large contexts.** Long-lived agents reread their whole history on every turn. The researcher passed 650,000
  tokens and the cartographer and battle-implementor about 500,000.
- **Extra turns.** Rework loops (draw, audit, redraw), mechanical faults found by agents, fixes relayed through the
  overseer, and failed builds and retaken captures.

Every item below cuts one of the two.

## Order of work

The items are in layers. A layer rests on the ones before it, so they are built in this order.

| Layer | What it gives | Rests on |
|---|---|---|
| 0. Measurement | a number for every later change | nothing |
| 1. Tools | builds and captures that work in every environment | nothing |
| 2. Conventions | one fixed form for rules, fixes, reports and ids | nothing |
| 3. Scripts | mechanical checks without an agent | layer 2, which fixes what they check |
| 4. Agent rights and size | smaller contexts, fewer round trips | layers 2 and 3 |
| 5. Step order | less rework | layers 1 to 4 |
| 6. Structure | parallel maps, a scripted pipeline | all of the above |

Layers 0, 1 and 2 do not depend on each other and can be built at the same time.

Where the work lives:

- **history**: this repo, `agents/`, `.claude/agents/` and `scripts/`.
- **harita**: `/Users/can/code/openbooknetwork/harita`, the map engine and its commands.
- **kitap**: `/Users/can/code/openbooknetwork/kitap`, the book, its renderer and its build.

## Layer 0. Measurement

**0.1 Token ledger with tags.** *history.* **Built.** `scripts/token-ledger.mjs` replaces the Python script. It
tags each agent with its role, step and section from the transcripts alone, counts a resumed agent under each
section it worked on, and prints turns, peak context and a weighted total by any of those keys, with tokens per
page. `--json` saves the run to `content/<story>/.plan/run.json`, which step 14 of `agents/overseer.md` now asks for.
That file is what agents and scripts read. `scripts/run-viewer.html` is one page for every story: it opens a
saved run in a browser, and several runs side by side. `[E2, E4.9]`

**0.2 A fixed benchmark.** *history.* Section 020 of Alexander (four pages, one card) with its digest, plan and
rulings frozen as inputs. Done when a variant of the process can be run on it two or three times and compared on
tokens per accepted page, leaked defects, rework rounds and wall time. `[E3]`

**0.3 Fault counts from reports.** *history.* **Built.** `scripts/fault-ledger.mjs` reads the report blocks out
of the same transcripts and counts faults by severity and kind, by the step that caught them, and the reports a
role needed per section. The block of `agents/report.md` gains an `introduced` line, and a wrong fault caught
after the step meant to catch it is listed as a leak, as in `[E4.1]`. `[E2]`

## Layer 1. Tools

**1.1 `screenshot.mjs` on Linux.** *history.* Pick the browser from `CHROME_PATH`, then the macOS path, then
`/usr/bin/google-chrome`, `chromium`, and Playwright's Chromium under `/opt/pw-browsers`. Add `--no-sandbox` when
running as root. Done when the script captures in a cloud container unchanged. `[F2]`

**1.2 `SHOT_TEXT=1`.** *history.* Switch to the page's Text view before the capture, and document it in
`agents/pages.md`. Done when a battle card can be captured as a phone reader sees it. `[F2]`

**1.3 Chrome cleaned up on every exit.** *history.* `screenshot.mjs` kills its Chrome on success, error and
timeout. Done when a failed capture leaves no process behind. `[F6]`

**1.4 Captures that wait for the map.** *harita and history.* The engine skips the route draw-in animation under
a test flag, or reports when it has ended, and `screenshot.mjs` waits for that. Done when stepping from Miletus
to Halicarnassus draws the routes in 8 of 8 captures. `[F6]`

**1.5 `harita dev` watches only the story.** *harita.* Watch `content/<story>/`, `content/shared/`, `i18n/` and
`site.yaml`, and skip the dot folders and `node_modules/`. Done when five servers run at once in a cloud container
without `ENOSPC`. `[F8]`

**1.6 An unknown battle is a warning in dev.** *harita.* `harita dev` builds the rest of the story and warns;
`harita check` and the strict build keep it an error. The same for a text link to a marker that is not yet in
`page.yaml`. Done when a half-finished edit across two files does not fail the shared build. `[F1, F6]`

**1.7 A static build for auditors.** *history.* `agents/pages.md` tells agents that change no files to build once
into their own `--out` folder and serve it without watching. Done when an auditor's captures cannot catch
another agent's rebuild. `[F6, F8]`

**1.8 A strict build of one story.** *kitap.* `npm run build -- --strict --story <id>`. Done when step 14's
check takes about a minute and its log holds only that story. `[F17.9]`

**1.9 The strict build without the store.** *kitap.* `--no-store`, or a warning instead of an error when
`images-pack/` holds the story's originals. Done when a new story's strict build passes in a cloud run. `[F18]`

**1.10 `harita image --strip-location`.** *harita.* Strip the location data and record both hashes and the `url:`
line. Done when an image with GPS data is added without a hand-made `image.yaml`. `[F6]`

**1.11 Phone-size captures.** *history and harita.* Find why 390x780 crashes headless Chrome on Linux, and why
the 070 Ocean page crashes it at any size. Done when a phone capture works in a cloud container, or the cause is
written down with a workaround. `[F6]`

## Layer 2. Conventions

These are edits to the notes and definitions. They fix forms that layer 3 checks and layer 4 relies on.

**2.1 `rules.md` at step 4.** *history.* `agents/overseer.md` has the overseer write
`content/<story>/.plan/rules.md` with the final brief: every standing rule of the story, kept current. Every agent
reads it, and only the overseer and the reviewer read `decisions.md`. Done when no dispatch has to restate a rule.
`[F11, L2]`

**2.2 The lasting rules move into `agents/`.** *history.* Into `agents/pages.md`: a card stands on its battle's
site and never moves for layout; a town marker on a card's point comes off that page; a zone's legend name does
not end before the page's date; a marker's note tells the event of its own page; a page shows every zone its
neighbours show for its frame; a zone is cut once for the story, so a zone cut back in stages takes one
`zones.yaml` entry per stage. Into `agents/text.md`: disputed claims go into Notes, with the marker escaping, and
the body's word limit. Done when `rules.md` of a new story holds only what is particular to that story.
`[F4, F7, F10]`

**2.3 Battle ids carry the year.** *history.* The section-coordinator's definition gives the form
`<name>-<year>`. `[F9]`

**2.4 `Rests on:` holds digest ids only.** *history.* Passage references go on a `How:` line. `[F3]`

**2.5 A route line cites its passage.** *history.* Every route in a plan names the passage that gives its
stations. `[F9, E1]`

**2.6 Fixes are clause edits.** *history.* A fix instruction names the file and field, says whether it replaces
the whole value or one clause, and quotes the old text. The fixer reports the diff of each changed field and
keeps every author's figure unless told to remove it. Auditors recheck a fix against the previous commit. Goes
into `agents/report.md` and each fixer's definition. `[F13, L6]`

**2.7 The fact-checker's fault file.** *history.* The fact-checker writes each fault to a file with the quoted
words, the source line and the fix as a clause edit in the form of 2.6. `[L6, F17]`

**2.8 Short reports.** *history.* An agent returns the YAML block and at most ten lines, and writes the detail to
a file it names. `agents/report.md` also gains an owner value for the brief and for the overseer. `[F12.5, F11,
L7]`

**2.9 Commits name their paths.** *history.* No `git commit -a` and no `git add -A` while agents run in parallel.
Goes into `agents/overseer.md` and every definition that commits. `[F17.8, L9]`

**2.10 Caption facts have a source.** *history.* `agents/images.md` requires each fact of a caption to be on the
Commons file page or a digest line. `[F9, E4.6]`

**2.11 Generators are committed.** *history.* `agents/pages.md` requires the zone, page and route generators in
`content/<story>/.plans/`, so a story's maps can be rebuilt from the repo. `[F11]`

**2.12 Cloud run rules.** *history.* `agents/cloud.md` says: a background command stops after two hours, so
agents serve their own static builds (1.7); the strict build of a new story fails only on the store until 1.9
lands; the run packs the images, pushes and opens the pull request itself; the pull request is merged by squash
after the pack is removed. `[F8, F18, F19, F20]`

## Layer 3. Scripts in place of agent checks

**3.1 A rules linter.** *history first, then harita.* `scripts/rules-lint.mjs <story>`, run beside
`harita check`. It reports:

- a marker on a battle card's point
- a zone whose legend name ends before its page's date
- a marker id used on pages of different events
- a battle id without its year
- a text body outside 150 to 300 words
- a disputed digest claim cited in a body and not in Notes
- a passage number on a `Rests on:` line
- a card page whose opening frame hides the map behind the docked card
- a page that lacks a zone both its neighbours show

Done when it catches every fault of `[E4.4]` except the careful-side ones, on the commits where the map audits
found them. The checks that need no plan folder move into `harita check` later. `[F12.1, F17.7, E4.4]`

**3.2 `names-check`.** *history.* `scripts/names-check.mjs <story>` lists names in the texts with no row in
`names.md`, compares each name's first page with its "First named in" entry, and flags a name shared by two or
more people when a text uses it without its description. Done when it reports the ten faults of `[F16]` on the
commit before the editor's fix.

**3.3 `quotes-check` reads only claim ids.** *history.* Match `<section number>.<n>` for the story's sections.
`[F3]`

**3.4 Shared audit scripts.** *history.* `scripts/points.mjs <story> <section>` prints, for each place of a
plan, which zone holds it on each page and how far it is from the edge. `scripts/route-surface.mjs` takes a
section. Done when a map-auditor writes no script of its own. `[F12.2]`

**3.5 A card-figure guard.** *history.* A check flags a card whose `strength` or `casualties` no longer names an
author the plan's card section names. `[F13]`

**3.6 Section slices.** *history.* `scripts/slice.mjs <story> <section>` writes `research-<section>.md` and
`names-<section>.md` from the full files. Done when a section agent's first read is under a fifth of the digest.
`[F12.4]`

**3.7 `contact-sheet.mjs` counts marker images.** *history.* An image shown by a marker on two pages is flagged
as placed twice. `[F6]`

**3.8 A zone-loss warning.** *harita.* `harita check` warns when a zone loses more than a set share of its area
to a zone it shares only some of its pages with. `[F7]`

**3.9 Checks at each agent's end.** *history.* Each definition lists the checks its agent runs before it
reports: `harita check`, 3.1, 3.2 and 3.3 as they apply. Later these can run as hooks. `[E6]`

## Layer 4. Agent rights and size

**4.1 Lean mode is the default.** *history.* `agents/overseer.md` takes the rules of `lean.md`: every pass
runs, with one desktop capture per page and geometry scripts first, only wrong and weak faults acted on, and a
pass skipped only where another covers it and the ruling is logged. A taste fault that touches a shared file such
as `names.md` is fixed. `[L]`

**4.2 Fresh agents with a handoff note.** *history.* One agent per section, started from `rules.md`, the
section's slices and a one-page note from the agent before it. An agent is resumed only for a small follow-up on
its own generator. Done when no agent's context passes 300,000 tokens. `[F12.6, L1]`

**4.3 The fact-checker applies its own edits.** *history.* It gains `Edit` and applies its wrong and weak clause
edits. The reviewer keeps readability, Notes and length, and does not reread the sources. Tested on the benchmark
against 2.7 alone. `[F17.1]`

**4.4 Small fixes without a round trip.** *history.* An auditor fixes a mechanical fault itself and reports the
diff. The overseer makes one-line fixes itself. `agents/report.md` lists what counts: a marker note, a card date,
a caption word, an icon, a date line. `[F12.9, L5]`

**4.5 A card without phases has no battle audit.** *history.* The section's fact-checker checks its figures,
commanders, dates and site. `[F17, L8]`

**4.6 A model per agent.** *history.* Every definition is `model: opus` now. Move the mechanical agents to a
smaller model: `image-finder`, `names`, `name-finder`, and plan-sync edits. Research, writing, map design and
the audits keep the strongest. Each move is tested on the benchmark first. `[F12.10]`

**4.7 Researcher gates.** *history.* The researcher's definition asks for a second account before a date, place
or figure is marked `agreed`; the same minimum of scholarly sources for every section; a check, for each author
used twice, whether the later work withdraws the earlier; and no Coverage line "no source gives X" without a
search of the read files. `[F9, F17.6, E4.2, E4.3]`

## Layer 5. Step order

**5.1 The battle-coordinator writes the card.** *history.* Cards are written at step 9, before the cartographer
reaches the section. The battle-implementor builds only phase pages. Done when no build fails on an unknown
battle. `[F1, F11]`

**5.2 A plan check before drawing.** *history.* At step 7 a fact-checker checks each plan's routes and zone
edges against the passages of 2.5. Done when the benchmark's two plan-route leaks are caught at step 7. `[F11,
E4.1]`

**5.3 Planned gap batches.** *history.* One researcher batch and one names batch after step 6, and again after
step 9, in place of single resumes. `[F9, F11, F15]`

**5.4 Texts after page files.** *history.* A section's writer starts once its page files exist, still in
parallel across sections, and runs `harita check` and the word count before it reports. Marker ids are frozen
from then on. `[F12.8, F17.3, F17.4]`

**5.5 Plans end at step 7.** *history.* A plan is not synced after its texts are reviewed, and
`agents/overseer.md` says so. `[F17.5]`

**5.6 The run's order.** *history.* `agents/overseer.md` writes down the order the run found: battle plans
beside the maps, battles one section behind the maps, images as soon as a section has texts and cards, the map
audit of a section beside the drawing of the next. `[F14, L9]`

## Layer 6. Structure

**6.1 Split the cartographer.** *history.* A zone keeper drafts the shared zones and stage entries from the
"Map" part. Page cartographers, one per section, write page files, routes and markers in parallel, with markers
in each page's own `markers.yaml`. Done when nine sections of maps take under three hours. `[F5, F11]`

**6.2 Zones cut page by page.** *harita.* `cleanZones` cuts a zone by the outranking zones of each page, with
one cached shape per distinct set. Stage entries are then not needed. Until it lands, a `zones.yaml` entry
inherits its base zone's `clip`. `[F7]`

**6.3 Image placements out of the text.** *kitap.* `@image` placements live in `page.yaml`, so the image-finder
and the reviewer do not edit the same file. `[F17.2]`

**6.4 Notes as a feature.** *kitap.* A `notes:` field or footnote syntax, with the "Notes" label from the UI
catalogue. `[F10]`

**6.5 A workflow script for a section.** *history.* Draw, lint, audit, fix, battles, images, fact-check and
review as one script, so the overseer rules and does not relay. `[F12.11]`

**6.6 Images uploaded by a workflow.** *history.* A GitHub workflow holds the store token, and on a pull request
unpacks and uploads the images and removes the pack. `[F20]`

**6.7 A plugin.** *history.* The agents, the overseer notes and the checks packaged as a Claude Code plugin,
with the checks of 3.9 and the ledger of 0.1 as hooks. `[E6]`

## Not in this spec

- Sources the run could not read (Polyaenus, Hammond and Griffith II, Arrian's *Indica*, the Diadochi Chronicle,
  Strabo, Depuydt) and sites that refused fetches. These are the story's gaps, listed in `decisions.md`.
- Unit hover labels and the phase page that drew the previous phase's armies. They need one check in a real
  browser before they are tool work.
