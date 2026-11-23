# Spec: a cheaper story pipeline

Changes to the agents' process, drawn from `feedback.md`, `evaluation.md` and `lean.md` after the Alexander the
Great cloud run. Each item says what changes, where, and when it is done. Bracketed references point at the note
that argues for it: `[F12.1]` is `feedback.md` item 12 point 1, `[E4.1]` is `evaluation.md` section 4.1, `[L6]` is
`lean.md` rule 6.

## Where this ends

The end goal is a Claude Code plugin (6.7): the agents, their notes, the channels of 2.0 and the checks of layer
3 in one package, with hooks that enforce what the notes only ask for today. Each layer below is built so that
it moves into the plugin unchanged: a script becomes a hook, a form becomes a schema the hook checks, and a rule
an agent could forget becomes one it cannot break.

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

**1.1 `screenshot.mjs` on Linux.** *history.* **Built.** The browser is `CHROME_PATH`, else the first found of
Chrome on macOS, `google-chrome` and `chromium` on Linux, and Playwright's Chromium under `/opt/pw-browsers`. It
runs with `--no-sandbox` as root. Tested on macOS only: a cloud container has still to run it. `[F2]`

**1.2 `SHOT_TEXT=1`.** *history.* **Built.** Opens each page's Text view before its capture. It is still to be
documented in `agents/pages.md`, with the layer 2 edits. `[F2]`

**1.3 Chrome cleaned up on every exit.** *history.* **Built.** `screenshot.mjs` ends its Chrome and removes its
profile folder on a finished run, an error, a timeout and a signal. `[F6]`

**1.4 Captures that wait for the map.** *harita and history.* The engine skips the route draw-in animation under
a test flag, or reports when it has ended, and `screenshot.mjs` waits for that. Done when stepping from Miletus
to Halicarnassus draws the routes in 8 of 8 captures. `[F6]`

**1.5 The dev server watches only the story.** *kitap.* **Built, not released.** `dev --story <id>` watches that
story's folder and `content/shared/` in place of all of `content/`, with `i18n/`, `plugins/` and the source as
before. On kitap's `pipeline-efficiency` branch, with a test. Still to see: five servers at once in a cloud
container without `ENOSPC`. `[F8]`

**1.6 An unknown battle is a warning in dev.** *harita and kitap.* `harita/src/engine.mjs` fails the build on a
page's unknown battle and on an unknown marker. `kitap dev` hands its builds a flag, and under it the engine warns
and builds the rest of the story; `harita check` and the strict build keep both an error. Done when a
half-finished edit across two files does not fail the shared build. `[F1, F6]`

**1.7 A static build for auditors.** *history.* `agents/pages.md` tells agents that change no files to build once
into their own `--out` folder and serve it without watching. Done when an auditor's captures cannot catch
another agent's rebuild. `[F6, F8]`

**1.8 A strict build of one story.** *history.* The build has it already: `harita build --strict --story <id>`
took 14 seconds for the Alexander story, against more than ten minutes for every story. `agents/pages.md` and
step 14 of `agents/overseer.md` still name `npm run build -- --strict`, which builds them all. They change with
the layer 2 edits. `[F17.9]`

**1.9 The strict build without the store.** *kitap.* **Built, not released.** `build --strict --no-store` runs
every strict check and leaves the store unasked, and says so in its last line. On kitap's `pipeline-efficiency`
branch, with a test. `agents/cloud.md` names it for a new story's step 14, with the layer 2 edits. `[F18]`

**1.10 `image --strip-location`.** *kitap.* The check that refuses a file with a position in its metadata is
kitap's, in `src/image.mjs`. The option removes the EXIF and XMP blocks without encoding the picture again, and
records both hashes and the `url:` line. Done when an image with GPS data is added without a hand-made
`image.yaml`. `[F6]`

**1.11 Phone-size captures.** *history and harita.* Find why 390x780 crashes headless Chrome on Linux, and why
the 070 Ocean page crashes it at any size. Done when a phone capture works in a cloud container, or the cause is
written down with a workaround. `[F6]`

**1.12 `when` for years before our era.** *kitap.* **Built, not released.** A page's `when` takes a minus before
a year BC, counted as historians count it: `-0335-03` is March 335 BC. The order check counts such years
backwards and their months forwards, and a story's span reads "335 BC – 334 BC". On kitap's
`pipeline-efficiency` branch, with tests. kitap serves books without dates too, so it does not ask every page
for a `when`: the linter of 3.1 does, for a history story. `[2.13]`

## Layer 2. Conventions

These are edits to the notes and definitions. They fix forms that layer 3 checks and layer 4 relies on.

**2.0 The channels agents speak through.** *history.* Agents pass work to each other through seven channels and
through nothing else. Each has one kind of writer, a known reader, one place in the story's `.plan/` folder and,
where a script reads it, a form a script can check.

| Channel | Writer | Reader | Place and form |
|---|---|---|---|
| Work products | the agent of each step | the later steps | `brief.md`, `research.md`, `names.md`, the plans, as today |
| Rules | the overseer alone | every agent | `agents/*.md` for every story, `.plan/rules.md` for this one |
| Dispatch | the overseer | one agent | a fixed form: story, section, step, task, the files to read |
| Report | an agent | the overseer | the block of `agents/report.md`, saved to `.plan/reports/` |
| Fault list | a checker | the fixer | `.plan/faults/<section>.yaml`, each fault a clause edit with a state |
| Handoff | an agent | the next agent of its role | `.plan/handoff/<role>.md`, one page |
| Decision log | the overseer | the user and the reviewer | `.plan/decisions.md`, the history alone |

- What the next agent needs is in a channel. Nothing that matters stays only in a scratchpad or a message.
- Agents do not write to each other. A checker writes a fault, the fixer sets its state, and the checker reads
  the list again. The overseer rules on a fault and no longer relays it.
- A fault in the list carries its `id`, `severity`, `file`, the field, the `old` and `new` text, its `source`,
  `introduced` and a `state` of `open`, `fixed` or `declined`. `scripts/fault-ledger.mjs` then counts from these
  files, and from the transcripts only for a run that has none.
- The loose files of the Alexander run each have a channel: `cartography-notes.md` and `IMPLEMENTOR-NOTES.md`
  are handoffs, the fact-checker's files and the overseer's queued fixes are fault lists, and the rules inside
  `decisions.md` and the dispatches are `rules.md`.
- A run's own notes, as `feedback.md`, `evaluation.md` and `lean.md` were for Alexander, are a record of the
  run and no channel. They go beside `run.json`, in `.plan/run/`, and not at the repo's root.

**The dispatch form.** Every dispatch, and every message that resumes an agent, opens with this block:

```yaml
story: alexander-the-great
section: "020"            # all, for an agent that works on the whole story
step: 8
task: draw                # one word from the list in the role's definition
faults: .plan/faults/020.yaml    # only where the task is a fix or a recheck
scratchpad: <the agent's own folder>
serve: static             # a static build of its own, or the port of a shared server
note: Thessaly's border is row 12 of the brief's Map part.    # optional
```

- It points and does not paste. It holds no rule, which is in `rules.md`, no fault, which is in the fault list,
  and no list of files to read, which the role's definition gives for a story and a section.
- Each role's definition lists its task words: `draw` and `fix` for the cartographer, `check`, `recheck` and
  `plan-check` for the fact-checker, `plans` and `texts` for the editor.
- The tool's short description takes one form too, `8 020 cartographer draw`, so the list of agents reads as
  the run.
- **`note` gives context and never instructs.** It states a fact about this one dispatch that no channel holds:
  where something is, what changed since the plan. It is one sentence of at most 200 characters, it tells the
  agent nothing to do, and it is empty in most dispatches. A note that tells the agent how to work is a prompt
  inside the dispatch, which is the thing the form replaces. A fact given in a second note belongs in `rules.md`.
- **The form is enforced, not advised.** A dispatch with no block, an unknown field, a task word its role does
  not list, a note over its length, or text after the block is refused before the agent starts. That takes a
  hook on the dispatch, which is the plugin of 6.7. Until the plugin exists, `scripts/token-ledger.mjs` lists
  every dispatch that breaks the form, and the count is part of a run's result.
- Dispatches are not saved to files. The transcript holds them, and the ledger copies them into `run.json`.

Items 2.1, 2.6, 2.7 and 2.8 each set out one channel, 4.2 the handoff, and the workflow script of 6.5 runs on
them. Done when `agents/overseer.md` and `agents/report.md` name the seven, each definition names the ones its
agent reads and writes, and a story builds with no other file passed between agents. `[F11, F12.5, F13, L2, L6]`

**2.1 The rules channel: `rules.md` at step 4.** *history.* `agents/overseer.md` has the overseer write
`content/<story>/.plan/rules.md` with the final brief: every standing rule of the story, kept current. Only the
overseer writes it. Every agent reads it, and only the overseer and the reviewer read `decisions.md`. Done when
no dispatch has to restate a rule. `[F11, L2]`

**2.2 The lasting rules move into `agents/`.** *history.* Into `agents/pages.md`: a card stands on its battle's
site and never moves for layout; a town marker on a card's point comes off that page; a zone's legend name carries
no date, since the page's own date tells the reader the year, and a dated name is kept only where the zone shows
a border of another year than its page's; a marker's note tells the event of its own page; a page shows every zone its
neighbours show for its frame; a zone is cut once for the story, so a zone cut back in stages takes one
`zones.yaml` entry per stage. Into `agents/text.md`: disputed claims go into Notes, with the marker escaping, and
the body's word limit. Done when `rules.md` of a new story holds only what is particular to that story.
`[F4, F7, F10]`

**2.3 Battle ids carry the year.** *history.* The section-coordinator's definition gives the form
`<name>-<year>`. `[F9]`

**2.4 `Rests on:` holds digest ids only.** *history.* Passage references go on a `How:` line. `[F3]`

**2.5 A route line cites its passage.** *history.* Every route in a plan names the passage that gives its
stations. `[F9, E1]`

**2.6 The fault list: a fix is a clause edit.** *history.* A fault names its file and field, says whether it
replaces the whole value or one clause, and quotes the old text. The fixer sets the fault's state, reports the
diff of each changed field, and keeps every author's figure unless told to remove it. A checker rechecks a fix
against the previous commit. The form is 2.0's, in `agents/report.md` and each fixer's definition. `[F13, L6]`

**2.7 Every checker writes the fault list.** *history.* The fact-checker, the map-auditor, the battle-auditor,
the editor and the story-auditor write their faults to `.plan/faults/<section>.yaml` in the form of 2.6, each
with its source line. The fixer applies the list without doing the research again. `[L6, F17]`

**2.8 The report channel: short, and saved.** *history.* An agent returns the block of `agents/report.md` and at
most ten lines, and saves the block to `.plan/reports/`. Its faults are in the fault list, so the block names
their ids and does not repeat them. `agents/report.md` also gains an owner value for the brief and for the
overseer. `[F12.5, F11, L7]`

**2.9 Commits name their paths.** *history.* No `git commit -a` and no `git add -A` while agents run in parallel.
Goes into `agents/overseer.md` and every definition that commits. `[F17.8, L9]`

**2.10 Caption facts have a source.** *history.* `agents/images.md` requires each fact of a caption to be on the
Commons file page or a digest line. `[F9, E4.6]`

**2.11 Zone, route and phase generators are committed.** *history.* `agents/pages.md` requires the scripts that
draw a story's zones, routes and battle phases in `content/<story>/.plans/`, so the maps can be rebuilt from the
repo. Nobody edits those shapes by hand, and the script records why a border runs where it does. A script that
writes page files is not required. Where a cartographer keeps one, its first line says so, and a page is then
changed in the script and written again, never by hand: a rerun undoes every hand edit, as it did to `sources`
lists and removed markers in the Alexander run. `[F11, E4.7]`

**2.12 Cloud run rules.** *history.* `agents/cloud.md` says: a background command stops after two hours, so
agents serve their own static builds (1.7); the strict build of a new story fails only on the store until 1.9
lands; the run packs the images, pushes and opens the pull request itself; the pull request is merged by squash
after the pack is removed. `[F8, F18, F19, F20]`

**2.13 Pages run in time order.** *history.* A story has no flashback: no page starts before the page ahead of it,
across sections too. Where a later section needs an earlier state of the map, such as an empire before a
campaign into it, that page goes where its date puts it, or the later page shows the state at its own date.
Every page sets `when`, and the build's order check then holds the rule. Goes into `agents/outline.md`, the
section-coordinator's definition and the plans editor's, which checks the order at step 7. One page of the
Alexander story breaks it: "The Persian Empire of Darius III", dated 336 BC, opens section 030 after the fall of
Thebes in September 335 BC. Rests on 1.12 for stories of years BC.

## Layer 3. Scripts in place of agent checks

Each script here does a check an agent does today, in seconds and for no tokens. They are built in this order:
3.3, since it is a few lines and ends false errors; 3.1, since most of the rules of layer 2 rest on it; 3.2. Those
three save whole rounds of fixing. Then 3.4 and 3.6, which save tokens in every agent's context. Each says below
what it cannot judge, so that an auditor knows what is still its own.

**3.1 A rules linter.** *history first, then harita.* `scripts/rules-lint.mjs <story>`, run beside
`harita check`. It reports:

- a marker on a battle card's point
- a zone whose legend name carries a date, where that date is not the page's or ends before it
- a marker id used on pages of different events
- a battle id without its year
- a page without a `when`
- a text body outside 150 to 350 words
- a disputed digest claim cited in a body and not in Notes
- a passage number on a `Rests on:` line
- a card page whose opening frame hides the map behind the docked card

It prints each fault in the form of 2.0's fault list, so a fixer applies it as it stands. `harita check` tests
that the files are valid, and the linter that they follow the rules.

What it cannot judge:
- whether a body is fair to both sides of a dispute. It sees that a text cites a claim the digest marks disputed
  and has no Notes heading, and no more. The fact-checker judges the wording.
- whether two pages tell different events. It takes pages of different dates or sections as different.
- the careful side, land that no source says was taken. That needs the sources and stays with the map-auditor.

Done when it catches every fault of `[E4.4]` except the careful-side ones, on the commits where the map audits
found them. The checks that need no plan folder move into `harita check` later. `[F12.1, F17.7, E4.4]`

**3.10 Bare land between pages.** *history.* **Built.** `scripts/zone-gaps.mjs <story>` finds land that a zone
colours on the pages before and after a page and that is bare on it. It reads the shapes the build drew, so it
tests what the reader sees and not the ids a page lists: land another state colours is not bare, and a zone the
build cut away on a page is. It looks two pages each way, across section borders, over the frame a screen shows,
and costs no tokens. It prints a list to confirm, since a land lost on one page and retaken on the next is bare by
right. It does not find a zone missing on a story's first or last pages, one dropped for good too early, or one
of the wrong year: those stay with the map-auditor. The frame is an estimate, the page's bbox grown to a wide
screen and a phone, and is not yet checked against captures. `[F4, E4.4]`

**3.2 `names-check`.** *history.* `scripts/names-check.mjs <story>` lists names in the texts with no row in
`names.md`, compares each name's first page with its "First named in" entry, and flags a name shared by two or
more people when a text uses it without its description: the Alexander story has two Memnons and four Nicanors.
It runs after each section's texts and again at step 14. It leaves out quotations and source lines, and keeps a
list of capitalised words that are no names, such as months and the words that open a sentence. It cannot tell
which Memnon a text means, only that the description is missing. Done when it reports the ten faults of `[F16]`
on the commit before the editor's fix.

**3.3 `quotes-check` reads only claim ids.** *history.* It takes anything shaped like `16.8` on a `Rests on:` line
for a claim id, so "Diodorus 16.8.2" gave "claim 16.8 is not in the digest". It matches only an id whose first
part is one of the story's section numbers, such as `020.7`. With 2.4 the false errors end. `[F3]`

**3.4 Shared audit scripts.** *history.* Each map-auditor wrote its own throwaway scripts for two questions:
which zone holds each place, and whether each route keeps to its surface. `scripts/points.mjs <story> <section>`
prints, for each place a plan names, which zone holds it on each page and how far it is from the zone's edge, so
the auditor looks only at the places near a border. `scripts/route-surface.mjs` takes a section and tests every
route of it. With `scripts/zone-gaps.mjs` of 3.10 they are one family. Done when a map-auditor writes no script
of its own. `[F12.2]`

**3.5 A card-figure guard.** *history.* A check flags a card whose `strength` or `casualties` no longer names an
author the plan's card section names. `[F13]`

**3.6 Section slices.** *history.* Every agent reads the whole digest, of more than 560 quotes, and the whole of
`names.md`, and reads them again on every turn. `scripts/slice.mjs <story> <section>` writes
`research-<section>.md` and `names-<section>.md`. A slice follows the claim ids its section's plan cites, not
the section number alone, since a text of 050 may rest on a claim filed under 030. The slices are made by the
script and not committed, and made again when the full files change: a stale slice gives an agent old lines, so
the dispatch hook of 6.7 makes it afresh. Done when a section agent's first read is under a fifth of the digest.
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

**4.2 Fresh agents with a handoff.** *history.* One agent per section, started from `rules.md`, the section's
slices and the handoff of its role, `.plan/handoff/<role>.md`: one page the agent before it leaves, with what the
next one must know and nothing else. An agent is resumed only for a small follow-up on its own generator. Done
when no agent's context passes 300,000 tokens. `[F12.6, L1]`

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

**4.7 Research gates.** *history.* Four rules for every line of the digest, held by the research-coordinator of
6.10 and until then by the researcher: a second account before a date, place or figure is marked `agreed`; the
same minimum of scholarly sources for every section; a check, for each author used twice, whether the later work
withdraws the earlier; and no Coverage line "no source gives X" without a search of the read files.
`[F9, F17.6, E4.2, E4.3]`

## Layer 5. Step order

**5.1 The battle-coordinator writes the card.** *history.* Cards are written at step 9, before the cartographer
reaches the section. The battle-implementor builds only phase pages. Done when no build fails on an unknown
battle. `[F1, F11]`

**5.2 A plan check before drawing.** *history.* At step 7 a fact-checker checks each plan's routes and zone
edges against the passages of 2.5. Done when the benchmark's two plan-route leaks are caught at step 7. `[F11,
E4.1]`

**5.3 Planned gap batches.** *history.* Until the research team of 6.10 exists: one researcher batch and one
names batch after step 6, and again after step 9, in place of single resumes. Round 2 of 6.10 then takes their
place. `[F9, F11, F15]`

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
"Map" part. Page cartographers, one per section, write page files, routes and markers in parallel. With 6.8 a
cartographer adds a place to the common markers file once and writes its notes in its own pages. Done when nine
sections of maps take under three hours. `[F5, F11]`

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

**6.7 The plugin, the end goal.** *history.* The agents of `.claude/agents/`, the notes of `agents/`, the
channels of 2.0 and the scripts of layers 0 and 3 packaged as a Claude Code plugin, so every repo built on harita
and kitap runs the same pipeline. Its hooks enforce what the notes ask for:

- **On a dispatch:** the form of 2.0 is checked, and a dispatch that breaks it does not start.
- **After an edit:** `harita check` and the linter of 3.1 run on a page, zone, marker or text file,
  `quotes-check` on the digest and `names-check` on a text.
- **When an agent ends:** its report block is checked and saved, its fault list is checked against the form of
  2.6, and its tokens go into the run's ledger.
- **On a commit:** a commit that names no paths is refused while agents run in parallel.

A first version carries the agents and notes as they are with the dispatch and edit hooks, and each later hook
is measured on the benchmark of 0.2. The plugin format is to be checked against the current Claude Code docs
before it is built. `[E6]`

**6.8 Markers with page overrides.** *harita.* A story's `shared/markers.yaml` holds each place once: its
`lnglat`, its label and a default icon and colour. A page's `markers` list takes an id, or an id with the fields
that page changes: `note`, `icon`, `color`, `image` or `label`.

```yaml
markers:
  - pelium
  - sidon: {note: "Invites Alexander in"}
  - olynthus: {note: "Philip razes the city", icon: flame, color: macedon}
```

A place then keeps one id for the whole story, so a text's link is never renamed, a site is corrected in one
place, and a note belongs to the page that shows it. In the Alexander story 43 places have two or more markers,
120 in all: their notes differ in all 43, their colour in 20, their icon in 15, their image in 7 and their label
in 3. The change is in the page schema, in the engine where it builds a page's markers, and in the translation
keys: a page's own note takes a key of its page, such as `pages.<page>.markers.<id>.note`, and a common entry's
note becomes optional. Done when the Alexander story builds with about 164 marker entries in place of 238 and no
id with a letter suffix. Until it lands, a page that needs another note takes a marker id of its own, and 3.1
checks it. `[F4, F17.3]`

**6.9 Zones with dates, and pages that take their zones by date.** *harita.* A zone carries the date it begins,
and a page no longer lists its zones: the build shows on each page the zones that stand on the page's date.

- **The date format.** One normalized form for zones and for a page's `when` (1.12): a year, a year and month, or
  a full date, with a year before our era written as historians count it, so March 335 BC is `-0335-03`. It is
  never shown to the reader. The shown `date` stays free text, such as "Spring 326 BC", since a normalized date
  claims more than the sources know.
- **Falling back.** A beginning with a year alone is 1 January of it, and with a month the first day of the
  month. The writer turns a season into its first month: spring March, summer June, autumn September, winter
  December of the earlier year. An end falls the other way, to the last day of its year or month.
- **Endings.** A zone ends when the next zone of its line begins, the line being the id without its year:
  `macedon-340`, then `macedon-335`. A zone takes an end date of its own only where its state ends with no
  successor. Fewer dates then need a source.
- **Which moment a page shows.** The end of the page's span: a page of 336 to 335 BC shows the zones that stand
  at the end of 335 BC, since a map shows the outcome of its page's events.
- **Overrides.** A page can still name a zone to add or to leave out, for a claim or a plan the text tells.

With 6.2 this ends three rules at once. No page can forget a zone its neighbours show, so 3.10 becomes a check
of the dates and no longer of each page's list. A legend name cannot outlast its zone. One Persian zone serves
from 336 to 330 BC, with no copy per stage. The cost is a date for every zone, each a claim with a source, and
pages that all set `when`. Rests on 1.12, 2.13 and 6.2. How a line is told, by the id or by a field, is settled
when it is built. `[F4, F7]`

**6.10 A research team.** *history.* One researcher did all of a story's research at step 2, before any page
was decided, was resumed about fifteen times and passed 650,000 tokens. A `research-coordinator` and fresh
researchers under it take its place, in two rounds.

- **Round 1, the survey, at step 2.** The coordinator finds the sources, fetches them and writes what covers
  each section: the source map the brief and the plans are made from. It reads for coverage and writes no claim.
- **Round 2, the claims, after the section plans of step 6.** The pages now exist. The coordinator dispatches one
  researcher per section, which writes the digest lines its section's pages need, each with its quote. A heavy
  page gets a researcher of its own: a battle with phase pages, and any page its plan marks heavy for its many
  sources or disputed figures. A battle's researcher writes before the battle-coordinator plans from its lines.
- **The coordinator owns the digest.** It hands out the claim ids, merges the researchers' lines into
  `research.md`, removes a claim two of them wrote, and rules where two of them give one claim a different
  standing. It holds the gates of 4.7 for every line before it merges it.
- **Why per section and not per page.** A section's pages draw on the same chapters of the same sources, so one
  agent opens them once, and a dispute that touches three pages gets one ruling. The Alexander story would take
  9 section researchers and about 5 for its battles, against 71 per page.

Round 2 takes the place of the gap batches of 5.3: the research no longer comes before its questions. The names
agent runs after round 2, since most minor names first appear in its lines. Each researcher starts from
`rules.md`, the source map and its section's plan, by the dispatch form of 2.0, and leaves no handoff: the digest
is its work product. Done when no research agent passes 300,000 tokens and the leaks that begin in research,
8 of the 16 of `[E4.1]`, fall on the benchmark. `[F9, F15, F17.6, E4.2, E4.3]`

## Not in this spec

- Sources the run could not read (Polyaenus, Hammond and Griffith II, Arrian's *Indica*, the Diadochi Chronicle,
  Strabo, Depuydt) and sites that refused fetches. These are the story's gaps, listed in `decisions.md`.
- Unit hover labels and the phase page that drew the previous phase's armies. They need one check in a real
  browser before they are tool work.
