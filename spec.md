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

The items are in layers by kind, and a layer is built mostly on the ones before it.

| Layer | What it holds | Built mostly on |
|---|---|---|
| 0. Measurement | the ledgers and the benchmark: a number for every later change | nothing |
| 1. Tools | builds, captures and dates that work in every environment | nothing |
| 2. Conventions | the channels, the forms, the plans, the hashes and the hierarchy of managers | layers 0 and 1 |
| 3. Scripts | mechanical checks without an agent | layer 2, which fixes what they check |
| 4. Agent rights and size | smaller contexts, fewer round trips | layers 2 and 3 |
| 5. Step order | the steps by name and their order | layers 1 to 4 |
| 6. Structure | new roles, a new form for a story's map, the workflow and the plugin | all of the above |

The layers are an order to read in more than a strict order to build in. An item names the items it rests on, and
some rest on a later layer: the form of a dispatch (2.0) is enforced by the plugin's hook (6.7) and only counted
before that, the hierarchy (2.17) takes its limit from 4.2, the order of pages (2.13) needs the dates of 1.12,
and the research gates (4.7) are held by the reviewer of 6.10. Such an item is written first as a rule the notes
ask for, and held by a script or a hook once the later item exists.

Where the work lives:

- **history**: this repo, `agents/`, `.claude/agents/` and `scripts/`.
- **harita**: `/Users/can/code/openbooknetwork/harita`, the map engine and its commands.
- **kitap**: `/Users/can/code/openbooknetwork/kitap`, the book, its renderer and its build.

## Layer 0. Measurement

**0.1 Token ledger with tags.** *history.* **Built.** `scripts/token-ledger.mjs` replaces the Python script. It
tags each agent with its role, step and section from the transcripts alone, counts a resumed agent under each
section it worked on, and prints turns, peak context and a weighted total by any of those keys, with tokens per
page. `--json` saves the run to `content/<story>/.plan/run.json`, which `agents/overseer.md` now asks for at `story`.
That file is what agents and scripts read. `scripts/run-viewer.html` is one page for every story: it opens a
saved run in a browser, and several runs side by side. `[E2, E4.9]`

**0.2 A fixed benchmark.** *history.* Section 020 of Alexander (four pages, one card). What is frozen as its
input depends on what a variant changes, since a variant cannot be measured on an input it would itself make. A
variant of the maps, texts, images or checks starts from the frozen digest, plan and rulings. A variant of the
plans (2.15, 5.7) starts from the frozen digest and brief. A variant of the research (4.7, 6.10) starts from the
frozen brief and source files, and is judged on the digest it writes and on the faults later steps find in it.
Done when a variant of each kind can be run two or three times and compared on tokens per accepted page, leaked
defects, rework rounds and wall time. `[E3]`

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
took 14 seconds for the Alexander story, against more than ten minutes for every story. `agents/pages.md`
still names `npm run build -- --strict`, which builds them all. It changes with the layer 2 edits. `[F17.9]`

**1.9 The strict build without the store.** *kitap.* **Built, in kitap 0.9.0.** `build --strict --no-store` runs
every strict check and leaves the store unasked, and says so in its last line. `agents/cloud.md` names it for a
new story's check at `story`, with the layer 2 edits. `[F18]`

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

**2.0 The channels agents speak through.** *history.* Agents pass work to each other through eight channels and
through nothing else. Each has one kind of writer, a known reader, one place in the story's `.plan/` folder and,
where a script reads it, a form a script can check.

| Channel | Writer | Reader | Place and form |
|---|---|---|---|
| Work products | the agent of each step | the later steps | `brief.md`, the source map and `research.md` (6.10), `names.md`, the plans (2.15), `.plan/images/<section>.yaml` (6.3) |
| Rules | the overseer alone | every agent | `agents/*.md` for every story, `.plan/rules.md` for this one |
| Dispatch | a manager (2.17) | one agent of its team | a fixed form: story, section, step, task |
| Report | an agent | the manager that dispatched it | the block of `agents/report.md`, saved to `.plan/reports/` |
| Fault list | a checker | the fixer | `.plan/faults/<section>.yaml`, and `faults/story.yaml` for a fault of no one section, each fault a clause edit with a state |
| Fix log | whoever changes a file to fix it | the reviewer and the user | `.plan/fixes/<section>.yaml`, one entry a change |
| Handoff | an agent | the next agent of its role | `.plan/handoff/<role>.md`, one page |
| Decision log | a manager | the user and the reviewer | `.plan/decisions.md` by the overseer for the story, `.plan/<number>-<section id>/decisions.md` by a section lead for its section |

- What the next agent needs is in a channel. Nothing that matters stays only in a scratchpad or a message.
- Agents do not write to each other. A checker writes a fault, the fixer sets its state, and the checker reads
  the list again. The manager of the two rules on a fault and does not relay it.
- A fault in the list carries its `id`, `severity`, `file`, the field, the `old` and `new` text, its `source`,
  `introduced` and a `state` of `open`, `fixed` or `declined`. `scripts/fault-ledger.mjs` then counts from these
  files, and from the transcripts only for a run that has none.
- **No fix without its fault.** Every change that fixes something closes a fault that was written to the fault
  list first, however small the change and whoever makes it. An overseer that corrects one word of a caption
  writes the fault, then the fix. There is one fault list and one fix log, and no fix of another kind.
- **The fix log is the audit of every fix.** An entry names who made the change, the file and field, the `old`
  and `new` text, the commit, and the id of the fault it closes. A checker that applies its own fault (4.3) and
  an auditor or the overseer that makes a small fix (4.4) write here, since no second agent saw the change. A
  fix with no entry, or an entry that names no fault, is a fault of the run, and the hook of 6.7 that checks an
  agent as it ends compares its changed files with its entries. A fault's author shows who found it: one written
  by the overseer or a coordinator is a step of the kind 2.14 counts.
- The loose files of the Alexander run each have a channel: `cartography-notes.md` and `IMPLEMENTOR-NOTES.md`
  are handoffs, the fact-checker's files and the overseer's queued fixes are fault lists, and the rules inside
  `decisions.md` and the dispatches are `rules.md`.
- A run's own notes, as `feedback.md`, `evaluation.md` and `lean.md` were for Alexander, are a record of the
  run and no channel. They go in `.plan/run/`, and not at the repo's root. The saved run stays at `.plan/run.json`.

**The dispatch form.** Every dispatch, and every message that resumes an agent, opens with this block:

```yaml
story: alexander-the-great
section: "020"            # all, for an agent that works on the whole story
step: maps                # the step's name, from the list of 5.0
task: draw                # one word from the list in the role's definition
faults: .plan/faults/020.yaml    # only where the task is a fix or a recheck
scratchpad: <the agent's own folder>
serve: static             # a static build of its own, or the port of a shared server
note: Thessaly's border is row 12 of the brief's Map part.    # optional
```

- It points and does not paste. It holds no rule, which is in `rules.md`, no fault, which is in the fault list,
  and no list of files to read, which the role's definition gives for a story and a section.
- Each role's definition lists its task words: `draw` and `fix` for the cartographer, `check`, `recheck` and
  `plan-check` for the fact-checker, `pre-plans` and `texts` for the editor.
- The tool's short description takes one form too, `maps 020 cartographer draw`, so the list of agents reads as
  the run.
- **`note` gives context and never instructs.** It states a fact about this one dispatch that no channel holds:
  where something is, what changed since the plan. It is one sentence of at most 200 characters, it tells the
  agent nothing to do, and it is empty in most dispatches. A note that tells the agent how to work is a prompt
  inside the dispatch, which is the thing the form replaces. A fact given in a second note belongs in `rules.md`.
- **The form is enforced, not advised.** A dispatch with no block, an unknown field, a task word its role does
  not list, a note over its length, or text after the block is refused before the agent starts. That takes a
  hook on the dispatch, which is the plugin of 6.7. Until the plugin exists, `scripts/token-ledger.mjs` is to list
  every dispatch that breaks the form, and the count is part of a run's result. Today it reads only the story,
  section, step and task of a dispatch's block, to tag its agent.
- Dispatches are not saved to files. The transcript holds them, and the ledger is to copy them into `run.json`.

Items 2.1, 2.6, 2.7 and 2.8 each set out one channel, 4.2 the handoff, and the workflow script of 6.5 runs on
them. Done when `agents/overseer.md` and `agents/report.md` name the eight, each definition names the ones its
agent reads and writes, and a story builds with no other file passed between agents. `[F11, F12.5, F13, L2, L6]`

**2.1 The rules channel: `rules.md` at `final-brief`.** *history.* `agents/overseer.md` has the overseer write
`content/<story>/.plan/rules.md` with the final brief: every standing rule of the story, kept current. Only the
overseer writes it. Every agent reads it, and only the overseer and the reviewer read `decisions.md`. Done when
no dispatch has to restate a rule. `[F11, L2]`

**2.2 The lasting rules move into `agents/`.** *history.* Into `agents/pages.md`, for every story: a card stands
on its battle's site and never moves for layout. For a story in today's form, with zones listed on each page,
which 6.9 replaces for a new story: a zone's legend name carries no date, since the page's own date tells the
reader the year, and a dated name is kept only where the zone shows a border of another year than its page's; a
page shows every zone its neighbours show for its frame; a zone is cut once for the story, so a zone cut back in
stages takes one `zones.yaml` entry per stage, until 6.2 cuts by page. Until 6.8 gives a marker a note per page:
a marker's note tells the event of its own page. Until 6.11 merges the two icons: a town marker that overlaps a
card comes off that page. Into `agents/text.md`: disputed claims go into Notes, with the marker escaping, and
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
with its source line. A fault that belongs to no one section, as the editor's and the story-auditor's often do,
goes to `.plan/faults/story.yaml`. The fixer applies the list without doing the research again. `[L6, F17]`

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
section-coordinator's definition and the editor's, which checks the order at `pre-plan-check`. Two pages of the
Alexander story broke it and were put right before its release: "The Persian Empire of Darius III", dated 336 BC,
opened section 030 after the fall of Thebes in September 335 BC and now ends section 010, and "Megalopolis",
which began in summer 331 BC after a page of January 330 BC, now stands at its battle in early 330 BC. Rests on
1.12 for stories of years BC.

**2.14 A coordinator or an overseer steps in only for what was missed.** *history.* The work belongs to the
roles: a researcher researches, a checker checks, a fixer fixes. The overseer and the coordinators dispatch,
rule and merge. They change a file or act on their own judgement only where the pipeline missed something, and
each time they do it is a fault they wrote with its fix in the fix log of 2.0, or a ruling in their decision log
(2.0) with its reason.

One such step is a repair. The same kind of step a second time is a fault of the pipeline: a rule that is not
written, a check no script makes, or a job no role holds. So `scripts/fault-ledger.mjs` counts the changes and
rulings an overseer or a coordinator made, by kind, and a kind that comes up more than once in a run is listed
as work for the pipeline, to be closed with a rule, a script or a role and not with a third repair. The small
fixes of 4.4 count here: they save a round trip, and each one still says something no role caught. Done when a
run's report lists these steps by kind and the count falls from one run to the next. `[F11, L5]`

**2.15 Plans per role, in YAML, with a schema.** *history.* **Agreed; written here before any definition
changes.** A section's plan is one Markdown file of 400 to 650 lines today, mostly prose, that the writer, the
cartographer and the overseer each read whole. It becomes four files per section, in
`.plan/<number>-<section id>/`, each checked against a schema as it is written.

| File | Read by | Holds |
|---|---|---|
| `pages.yaml` | every role | the core of each page: id, title, `date`, `when`, what it tells, `rests_on`, markers, battles |
| `map.yaml` | cartographer, map-auditor, map keeper, the fact-checker at `plan-check` | each page's frame and routes, each with its basis, and its zones until 6.9 |
| `text.yaml` | section-writer, fact-checker, section-reviewer, image-finder | each page's account, its files and passages, its disputes, the images it wants (6.3) |
| `battles.yaml` | the battle roles, the fact-checker | each battle's id, its page, whether it has phases, and for a battle with a card alone its sides, figures and card fields |

```yaml
# pages.yaml
- id: the-danube
  title: "To the Danube"
  date: "Spring 335 BC"
  when: -0335-03
  tells: Alexander beats the Triballi, crosses the Danube by night and scatters the Getae.
  rests_on: [020.3, 020.4, 020.5, 020.15]
  markers: [danube, getic-town, peuce]
  battles: []                  # a battle is { id: thebes-335, phases: false }
```

```yaml
# map.yaml
the-danube:
  bbox: [21.5, 40.4, 29.5, 45.3]
  zones: [macedon, thracians, triballi, getae, illyrians, persia]   # until 6.9, where a page lists none
  routes:
    - id: alexander-335-danube
      family: macedon
      stations: [Amphipolis, Nessus plain, Philippopolis, Trojan pass, Lyginus, Danube]
      passage: "Arrian 1.1.5 to 1.2.1"
      basis: reconstruction
      why: Bosworth takes the Trojan pass and Hammond the Shipka. The route follows Bosworth.
```

- **One fact stands in one file.** A page's title, date and markers are in `pages.yaml` alone. The role files
  name a page by its id and repeat nothing of its core, and the check fails a reference that names no page.
- **One writer.** The section-coordinator writes all four for its section. For a battle with phases the
  battle-coordinator writes `battles/<battle id>.yaml` beside them, which alone holds that battle's sides,
  figures, card fields, order of battle and phases: `battles.yaml` then gives its id, its page and
  `phases: true`, and nothing more.
- **A battle is named early.** The pre-plan gives each page's battles and which of them have phases, as the
  brief proposes them, so the research of 6.10 knows which battles get a researcher.
- **The pre-plan of 5.7 is `pages.yaml`** with the fields that need no research: no `rests_on` yet.
- **Rules become the format.** A battle id without its year (2.3), a `rests_on` that is no digest id (2.4), a
  route without its passage (2.5) and a page without a `when` (2.13) no longer build, where a linter reported
  them before.
- **The reasoning keeps a place.** Why one scholar's route is taken is a `why` field on that route. The
  "Choices" part of today's plans goes into the section-coordinator's report, and its section lead writes the
  ones that are rulings to the section's decision log (2.0).
- **Scripts read the plan.** `scripts/points.mjs` takes its places from the markers of `pages.yaml` and its
  frames from `map.yaml`, and a cartographer's page files can start from the two.
- **Existing stories keep their Markdown plans.** The new form is for a story begun after it.

The definitions that change with it, none of them changed yet: `section-coordinator`, which writes the files;
`section-writer`, `cartographer`, `map-auditor`, `fact-checker`, `section-reviewer`, `editor`,
`battle-coordinator`, `battle-implementor`, `battle-auditor`, `image-finder` and `story-auditor`, which read
them; the new roles, which are written to it from the start: the section lead, the research-coordinator, the
researcher as 6.10 has it, the research-reviewer and the map keeper; and the table of the plan folder in
`agents/overseer.md`. Done when a schema for each file is in the repo,
a script checks a plan folder against them, and each of those definitions names the one or two files its agent
reads. `[F12.4, F9]`

**2.16 What an agent built from is hashed.** *history.* **Agreed.** Every agent works from files another wrote:
its role's plan, `rules.md`, its slice of the digest, the names. When it is dispatched, the hash of each is
recorded, and when it ends they are compared: a file that changed under it makes its work stale, and its report
says so. The hashes are saved with its report, so a script lists at any moment each page, text and battle built
from a version of a file that has since changed. That list takes the place of the table "When something changes
upstream" in `agents/overseer.md`, which the overseer keeps from memory today.

- A hash is computed from a file's content and is not written into the file.
- A plan is hashed by page: one page's entry in one role's file. A changed route flags that page's map and not
  its text, nor the other pages of its section.
- The agent does not do this itself. A script does, and in the plugin of 6.7 the hook on a dispatch and the hook
  on an agent's end.
- A hash proves that what an agent built from did not change. It does not prove that a plan still matches the
  pages made from it: a fix to a text leaves its plan's hash as it was. 5.5 says what happens then.

Done when a run's stale list names the files to build again after a plan changes, with no file missed and none
listed that did not rest on the change. `[F17.5]`

**2.17 A hierarchy of managers, so none is overloaded.** *history.* **Agreed.** In the Alexander run one overseer
dispatched all 72 agents, read every report and relayed every fault, and its context carried the whole run: 221
million cache-read tokens, a fifth of the run's. Claude Code lets an agent start agents of its own, three
layers below the main session (6.7). The work is ordered on that, so each manager holds a team it can read.

```
overseer                                   the story: the brief, the rules, the rulings, the user
 ├─ research-coordinator                   the digest
 │   ├─ researcher, per section and per battle with phases
 │   └─ research-reviewer, per section and per battle with phases
 ├─ names, map-architect                   work on the whole story, each one agent
 ├─ map keeper, with a map-auditor         the shared map, checked before a section draws on it
 ├─ editor                                 the pre-plan check, and the edit
 ├─ section lead, one per section          the section, from its pre-plan to its reviewed pages
 │   ├─ section-coordinator                its pre-plan, then its plans
 │   ├─ fact-checker                       its plan check, and its facts
 │   ├─ cartographer, map-auditor
 │   ├─ section-writer, section-reviewer
 │   ├─ image-finder
 │   ├─ researcher, for a gap
 │   └─ battle-coordinator, per battle with phases     the battle
 │       ├─ researcher, for a gap
 │       ├─ battle-implementor
 │       └─ battle-auditor
 └─ story-auditor
```

- **Three kinds of role.** A manager dispatches, rules and merges: the overseer, the research-coordinator, a
  section lead and a battle-coordinator. A worker makes a thing. A checker tests what a worker made. The
  overseer is the main session and has the `Agent` tool as such. Of the definitions only a manager's has it, so
  a worker or a checker cannot start anyone.
- **A section's team works at more than one step.** A section lead is dispatched at `pre-plans`, where its
  section-coordinator writes the pre-plan, and again from `plans` on. A lead that ended in between starts again
  from its handoff. The research between the two is the research-coordinator's.
- **The research of a battle comes first, and its gaps later.** At `research` the research-coordinator's team
  holds a researcher and a reviewer for each battle the pre-plans give phases. The battle-coordinator, at
  `plans`, reads their lines. A fact it still lacks, or a writer lacks, is a gap: the battle-coordinator or the
  section lead dispatches a researcher for it, which is why each has one in its team.
- **The map keeper is new.** The map-architect designs the map at `map-design`: its extent, its families and the
  list of its states. The keeper then draws what every section rests on, at the start of `maps`: today the
  shared zones, and in the form of 6.9 the states' outlines, the starting map and the changes of land. It reads
  the brief's Map part, the digest and each section's `map.yaml`, and writes the story's `shared/` map files. A
  map-auditor checks them against the digest before any section draws.
- **The section lead is new.** It takes one section from its pre-plan to its reviewed pages in the fixed order of
  5.0, reads its team's reports, rules on what its section can settle, and reports to the overseer once: the
  block, the counts, and what it could not settle. The overseer then reads about one report a section for a
  step, where it read every agent's.
- **A manager and its team.** A manager dispatches its own team and nobody else's, by the dispatch form of 2.0,
  which holds at every level: the plugin's hook on a dispatch runs inside agents too. A report goes up one
  level, to the manager that dispatched its agent, and no further as it is.
- **What goes up is small.** A manager passes up a status, the counts of its team's faults, each question it
  could not settle and each file made stale. The detail stays in the channels, the fault list, the fix log and
  the reports, where the level above reads it only when it must.
- **Who rules on what.** A maker and its checker are siblings under one manager, and neither is over the other.
  Their manager rules on a `taste` fault and on a `wrong` fault whose fix is plain, and writes each ruling on
  the fault and in its decision log (2.0). A `weak` fault, an open question and anything that changes the brief
  or another section go up, to the overseer and through it to the user. A manager never checks its own team's
  work in a checker's place.
- **No manager is overloaded.** A manager holds at most about ten agents at once, and no manager's context
  passes the 300,000 tokens of 4.2: a section lead that would is given a fresh one with a handoff. 2.14 holds at
  every level: a manager that changes a file or acts on its own judgement more than once for one kind of thing
  has found a fault of the pipeline.
- **The limits of the tool.** Three layers is the deepest the order goes, at a battle's agents, and it is
  Claude Code's default limit. Twenty agents run at once by default: nine section leads with their teams pass
  that, so the sections run in waves, or the limit is raised for the run.
- **The ledgers show the tree.** A saved run names each agent's parent, and the viewer shows cost by manager
  with its team's inside it, so an overloaded manager is seen in the numbers.

The workflow of 6.5 is a section lead's fixed order written as a script. Where a workflow can call the plugin's
agents, the lead keeps the rulings and the script the order. Done when the overseer of a full run dispatches
fewer than thirty agents itself, no manager passes 300,000 tokens, and a run's ledger shows the tree.
`[F11, F12.5, E4.9]`

## Layer 3. Scripts in place of agent checks

Each script here does a check an agent does today, in seconds and for no tokens. They are built in this order:
3.3, since it is a few lines and ends false errors; 3.1, since most of the rules of layer 2 rest on it; 3.2. Those
three save whole rounds of fixing. Then 3.4 and 3.6, which save tokens in every agent's context. Each says below
what it cannot judge, so that an auditor knows what is still its own.

**3.1 A rules linter.** *history first, then harita.* `scripts/rules-lint.mjs <story>`, run beside
`harita check`. It reports:

- a marker within about 20 pixels of a battle card at the page's opening view, until 6.11 merges the two
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

Done when, on the commits where the map audits found them, it catches these faults of `[E4.4]`: a marker under
a card, rule A and rule B. The others are not its own: bare land (rule C) is 3.10's, a zone cut away is 3.8's
and 3.10's, a card moved off its site needs the site its plan gives and is checked against `battles.yaml` once
2.15 exists, and the careful side stays with the map-auditor. The checks that need no plan folder move into `harita check` later. `[F12.1, F17.7, E4.4]`

**3.2 `names-check`.** *history.* `scripts/names-check.mjs <story>` lists names in the texts with no row in
`names.md`, compares each name's first page with its "First named in" entry, and flags a name shared by two or
more people when a text uses it without its description: the Alexander story has two Memnons and four Nicanors.
It runs after each section's texts and again at `story`. It leaves out quotations and source lines, and keeps a
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

**3.10 Bare land between pages.** *history.* **Built.** `scripts/zone-gaps.mjs <story>` finds land that a zone
colours on the pages before and after a page and that is bare on it. It reads the shapes the build drew, so it
tests what the reader sees and not the ids a page lists: land another state colours is not bare, and a zone the
build cut away on a page is. It looks two pages each way, across section borders, over the frame a screen shows,
and costs no tokens. It prints a list to confirm, since a land lost on one page and retaken on the next is bare by
right. It does not find a zone missing on a story's first or last pages, one dropped for good too early, or one
of the wrong year: those stay with the map-auditor. The frame is an estimate, the page's bbox grown to a wide
screen and a phone, and is not yet checked against captures. `[F4, E4.4]`

## Layer 4. Agent rights and size

**4.1 Lean mode is the default.** *history.* `agents/overseer.md` takes the rules of `lean.md`: every pass
runs, with one desktop capture per page and geometry scripts first, only wrong and weak faults acted on, and a
pass skipped only where another covers it and the ruling is logged. A taste fault that touches a shared file such
as `names.md` is fixed. `[L]`

**4.2 Fresh agents with a handoff.** *history.* One agent per section, started from `rules.md`, the section's
slices and the handoff of its role, `.plan/handoff/<role>.md`: one page the agent before it leaves, with what the
next one must know and nothing else. An agent is resumed only for a small follow-up on its own generator. Done
when no agent's context passes 300,000 tokens. `[F12.6, L1]`

**4.3 The fact-checker applies its own edits.** *history.* **Agreed.** It gains `Edit` and applies its `wrong`
clause edits. A `weak` fault it writes with the edit it proposes and leaves open: by 2.17 that one goes up for
a ruling, and the fact-checker applies it once it is ruled. It writes each fault to the fault list as before
and each change to the fix log of 2.0, so the change can be audited though no second agent applied it. The reviewer keeps readability, Notes and length,
does not reread the sources, and reads the fix log of its section. Measured on the benchmark against 2.7 alone.
`[F17.1]`

**4.4 Small fixes without a round trip.** *history.* **Agreed.** An auditor fixes a mechanical fault itself, and
a manager makes one-line fixes itself. It writes the fault to the fault list first and the fix to the fix log,
as every fix does (2.0): what it saves is the round trip to the file's owner, not the record. The map-auditor
and the battle-auditor gain `Edit` for this, since they read only today. `agents/report.md` lists what counts
as small: a marker note, a card date, a caption word, an icon, a date line. Anything else goes to its owner. By
2.14 a kind of small fix that recurs is a fault of the pipeline, to be closed at its cause. `[F12.9, L5]`

**4.5 A card without phases has no battle audit.** *history.* **Agreed.** The section's fact-checker checks its
figures, commanders, dates and site, and fixes what is `wrong` under 4.3. `[F17, L8]`

**4.6 A model per agent.** *history.* **Not yet.** Every definition is `model: opus`. Moving the mechanical
agents to a smaller model waits until the workflow itself is settled and measured: a change of model on top of
a change of process cannot be told apart in the numbers. The candidates then are `image-finder`, `names`,
`name-finder` and plan-sync edits, each tested on the benchmark. `[F12.10]`

**4.7 Research gates.** *history.* Four rules for every line of the digest, held by the research-reviewer of
6.10 and until then by the researcher: a second account before a date, place or figure is marked `agreed`; the
same minimum of scholarly sources for every section; a check, for each author used twice, whether the later work
withdraws the earlier; and no Coverage line "no source gives X" without a search of the read files. A script
counts the sources on each `agreed` line and in each section and lists the authors used with two works. Whether
two sources are independent, and the comparison of two works, stay with the reviewer.
`[F9, F17.6, E4.2, E4.3]`

## Layer 5. Step order

**5.0 The steps, by name.** *history.* **Agreed; the ledgers already use the names.** A step is known by its name
in a dispatch, a saved run, a report and the notes. Only one list says which comes first, so a later change of
order changes that list and no file that names a step. `agents/overseer.md` is written again around it.

| Step | What happens | Who |
|---|---|---|
| `brief` | the draft brief | overseer, with the user |
| `survey` | research round 1: the sources and what covers each section | research-coordinator |
| `final-brief` | the brief settled, and `rules.md` written | overseer |
| `pre-plans` | each section's page list | section leads, with their section-coordinators |
| `pre-plan-check` | overlaps, order and gaps across the sections | editor |
| `research` | round 2: the claims, per section and per battle, each reviewed | researchers, research-reviewers |
| `names` | the form of each name | names |
| `map-design` | the map's extent, its families and the list of its states | map-architect |
| `plans` | the full section plans, the battle plans and the cards | section leads, with their section- and battle-coordinators |
| `plan-check` | each plan's routes and borders against the sources | fact-checker |
| `maps` | the shared map first, audited, then each section's maps, audited | map keeper, cartographers, map-auditors |
| `texts` | each section's texts, once its page files exist | section-writers |
| `phases` | the phase pages of each battle, audited | battle-implementor, battle-auditor |
| `images` | each section's images | image-finders |
| `facts` | the fact-check with its fixes, then the review | fact-checkers, section-reviewers |
| `edit` | the cohesion of the whole | editor |
| `story` | the whole story checked and audited | overseer, story-auditor |
| `name-forms`, `translation` | each language's names, then its texts | name-finders, translators |

What moved from the order the Alexander run followed: the research is in two rounds with the page lists
between them; the names come after round 2, where most minor names first stand; the map design comes after
round 2, since it needs the borders that round finds; the battle plans and cards come before the maps (5.1); and
the texts come after their section's maps (5.4). `scripts/transcripts.mjs` holds the list as `ORDER`, with the
step each role works at and the step meant to catch each kind of fault.

**5.1 Cards are written with the plans.** *history.* Every card is written at `plans`, before the cartographer
reaches its section. The battle-coordinator writes the card of a battle with phases, from the plan it has just
made. The section-coordinator writes the card of a battle with a card alone, from the fields its `battles.yaml`
holds (2.15). The battle-implementor builds only phase pages. Done when no build
fails on an unknown battle. `[F1, F11]`

**5.2 A plan check before drawing.** *history.* At `plan-check` a fact-checker checks each plan's routes and zone
edges against the passages of 2.5, section by section as each plan is ready, so a wrong plan is caught before
the next one rests on it. Done when the benchmark's two plan-route leaks are caught there. `[F11, E4.1]`

**5.3 Planned gap batches.** *history.* For a run in today's order, until the research team of 6.10 exists: one
researcher batch and one names batch once the section plans are written, and again once the battle plans are,
in place of single resumes. Round 2 of 6.10 then takes their
place. `[F9, F11, F15]`

**5.4 Texts after page files.** *history.* **Agreed.** A section's writer starts once the cartographer has
written that section's page files, without waiting for its map audit: a writer needs the marker ids and not the
final borders. Writers still run at once across sections. A writer runs `harita check` and the word count before
it reports, and marker ids are frozen from the moment it starts. The run ends later by about one writer's run
and not nine, since the fact-check and the review of a section waited for its maps already. Splitting the
cartographer (6.1) takes that time back. `[F12.8, F17.3, F17.4]`

**5.5 A plan may change, and the change shows.** *history.* **Agreed.** A plan is not frozen, and is not kept in
step by hand either. A small change to a page, a corrected date, a dispute moved to its notes, a marker renamed,
leaves the plan as it is and goes into the fix log of 2.0. A change to the story's shape, a page added, removed
or split, a battle that loses its phase pages, goes back to `plans`: the plan is written again, its hash changes
(2.16), and each thing built from the old version is listed to build again. The line of today's notes that sends
every point where a plan should change back to step 7 goes. `[F17.5]`

**5.6 What runs side by side.** *history.* `agents/overseer.md` writes down, beside the order of 5.0, what the
run found can overlap: a battle's phase pages one section behind the maps, a section's images as soon as it has
its texts and cards, and the map audit of one section beside the drawing of the next. The battle plans and
cards no longer run beside the maps, since 5.1 puts them before. `[F14, L9]`

**5.7 Pre-plans, checked before the research.** *history.* A full plan cites the lines of the digest, and the
research of round 2 needs the pages first: each waited on the other. A pre-plan breaks the loop. It is a
section's `pages.yaml` (2.15) without its `rests_on`: each page's id, title, `date`, `when`, one line of what
it tells, its battles and the places it marks. At `pre-plan-check` the editor reads all of them together for an
event told in two sections, a place two sections mark, a page out of time order (2.13) and an event of the brief
that no section tells. The research then runs on a settled list of pages, and the full plans are written from
it. The Alexander run found six marker ids planned in two sections, after the full plans were written.
`[F4, F9]`

## Layer 6. Structure

**6.1 Split the cartographer.** *history.* **Agreed.** One cartographer drew every section in turn, 1.5 to 2.5
hours each with its fixes, so that each zone exists once. A map keeper owns what every section rests on, the
states, the starting map and the changes of land of 6.9, and writes them first. Page cartographers, one per
section, then write page files, routes and markers at once. With 6.8 a cartographer adds a place to the common
markers file once and writes its notes in its own pages, and the pre-plan check of 5.7 has already caught a
place two sections claim. Done when nine sections of maps take under three hours. `[F5, F11]`

**6.2 Zones cut page by page.** *harita.* For the stories that stay in today's form: `cleanZones` cuts a zone by
the outranking zones of each page, with one cached shape per distinct set, so a stage entry per zone is not
needed. Until it lands, a `zones.yaml` entry inherits its base zone's `clip`. A story in the form of 6.9 needs
neither. `[F7]`

**6.3 Image placeholders in the text.** *history, with a small change in kitap.* **Agreed, in place of moving
placements out of the text, which is ruled out.** The image-finder and the reviewer both edited `text/en.md`, so
a section's review waited for its image search. A text keeps its image lines, and the writer writes them:

- **The plan names the images a page wants.** The section-coordinator gives each one a name and a line on what
  it should show, in the section's `text.yaml` (2.15). The name, such as `hydaspes-coin`, is unique in the story.
- **The writer places a placeholder** where the image belongs in the text, `@image hydaspes-coin`, by the names
  its plan gives. It can leave one out where the text has no place for it, and reports that. It invents none.
- **The image-finder does not touch a text.** It finds an image for each placeholder, adds its folder, and
  writes which placeholder took which image, or `none`, to `.plan/images/<section>.yaml`. It runs beside the
  fact-check and the review, since it shares no file with them. An image it finds that no placeholder asked for
  is a line in that file for the reviewer, not an edit.
- **At the end the placeholders are switched** for the images' ids, `hydaspes-coin` for
  `hydaspes-coin-3f9a1c`, and a placeholder with no image is taken out with its line. This is a replacement
  with no judgement in it, so a script does it and not an agent: `scripts/images-place.mjs <story>`, run once
  every section is reviewed. It changes no sentence, so no text is checked again for it.
- **Markers and battle cards** take a placeholder in their `image` field the same way, by the names the plan
  gives: the cartographer writes a marker's, and whoever writes the card (5.1) writes the card's.
- **The build knows a placeholder.** `harita check` and `harita dev` report an image id that has no folder as
  waiting and build the page without it. A strict build fails on one, so none reaches the site.

Done when no image-finder edits a text, and a section's image search and its review run at once. `[F17.2]`

**6.4 Notes as a feature of the book.** *kitap.* **Agreed.** A disputed claim leaves the body of a text and goes
into a note at its end. kitap does not know a note today: each text ends with a `### Notes` heading typed by
hand and marks its claims with `\*`, `\*\*` and `\*\*\*`, which need the backslash or Markdown makes them
italics. The word "Notes" is typed into every text and translated by hand, and nothing checks that a mark has
its note.

A text marks a claim and writes its note by Markdown's footnote form, with a name in place of a typed mark:

```
The phalanx crossed the Haemus at a pass the sources do not agree on.[^pass]

[^pass]: Bosworth takes the Trojan pass, on the later Roman road. Hammond takes the Shipka.
```

- **kitap gives the marks.** It marks the notes in the order the body names them, as `*`, `**`, `***` as the
  texts do now, and draws them at the end of the text above its Sources.
- **The heading comes from the interface's catalogue,** as "Sources" does, so it is translated once for a
  language and typed into no text.
- **The build checks the pairs.** A mark with no note and a note with no mark each fail it.
- **A note is a thing a script can see.** The linter of 3.1 then tests that a claim the digest marks disputed
  has a note on the page that tells it, and the word count leaves the notes out without guessing where they
  start.
- **The texts written by hand are turned once.** A script rewrites the `### Notes` part and the typed marks of
  the Alexander story's texts into this form, and the build shows the same page before and after.

Done when no text of a story types a note's mark or its heading, and a text whose mark has no note does not
build. `[F10]`

**6.5 The fixed order as a workflow, inside the plugin.** *history.* **Agreed.** In the Alexander run the overseer
started every other agent, read every report and carried all of it for the whole run. By 2.17 a section lead
now runs its section. The parts of that whose order never changes become a workflow script that the plugin of
6.7 ships: for one section, draw, check, fix, write, find images, fact-check and review. The section lead keeps
what needs a ruling, and the overseer what the lead passes up, which is 2.14 made into the way the run works.

What the Claude Code docs say, read on 23 Nov 2026:
- A plugin ships workflows in a `workflows/` folder at its root, run as `/<plugin>:<name>`.
- A workflow script has `agent()`, `parallel()`, `pipeline()` and `phase()`, and a `schema` on `agent()` for an
  answer of a fixed shape. It runs 16 agents at once by default and 1,000 in a run.
- A workflow script cannot read files or import a module. So it does not read a plan: it is handed the
  sections as its arguments, and its agents and the plugin's hooks read the channels of 2.0.
- Not said in the docs, and to be tried before anything is built on it: whether `agent()` can name one of the
  plugin's own agent types, and whether a skill can start a workflow.

Done when one section builds from its plans to its reviewed pages with no dispatch written by hand, and the
overseer's tokens for that section fall on the benchmark. Rests on all of layer 2. `[F12.11]`

**6.6 Images uploaded by a workflow.** *history.* **Not yet.** The upload stays a step the maintainer does on
their own machine, `node scripts/images-pack.mjs unpack` and `harita upload --story <id>`, until the pipeline
itself is settled. `agents/cloud.md` keeps the pack on the branch and says the merge is a squash (2.12). Later a
GitHub workflow could hold the store token and, on a pull request, unpack, upload and remove the pack. `[F20]`

**6.7 The plugin, the end goal.** *history.* The agents of `.claude/agents/`, the notes of `agents/`, the
channels of 2.0, the scripts of layers 0 and 3 and the workflow of 6.5 packaged as a Claude Code plugin, so every
repo built on harita and kitap runs the same pipeline. Its hooks enforce what the notes ask for.

What the Claude Code docs say, read on 23 Nov 2026:
- **What a plugin holds:** `agents/`, `skills/`, `workflows/`, `hooks/hooks.json`, `bin/` for commands on the
  path, and scripts of its own that a hook names by `${CLAUDE_PLUGIN_ROOT}`. The scripts of this repo move in
  as they are.
- **A hook can refuse a dispatch.** A `PreToolUse` hook on the `Agent` tool reads the dispatch's agent type,
  description and prompt, and denies it with a reason the overseer sees. This is the check of the form of 2.0.
- **A hook runs when an agent ends.** `SubagentStop` is handed the agent's id and type, its transcript and its
  last message, and can keep the agent working with a reason. This is where a report block, a fix log, the
  hashes of 2.16 and the ledger are checked and saved.
- **A hook runs after an edit.** `PostToolUse` on a file edit runs a check and hands its errors back.
- **A plugin's hooks run inside its agents too.** An agent's own `hooks` field is not read in a plugin, so
  every rule is in the plugin's one hooks file.
- **An agent can start agents of its own,** three layers below the main session by default, unless `Agent` is
  left out of its tools, and 20 agents run at once by default. The hierarchy of 2.17 is built on this: a
  manager's definition has `Agent`, and a worker's and a checker's leave it out.
- **A definition sets its agent's tools and model,** which is what 4.6 needs later.
- **It is tried from a folder** with `--plugin-dir`, checked with `claude plugin validate`, and installed from
  a marketplace, which can be a private repo.

The hooks, in the order they are built:
- **On a dispatch:** the form of 2.0 is checked, and a dispatch that breaks it does not start.
- **After an edit:** `harita check` and the linter of 3.1 run on a page, zone, marker or text file,
  `quotes-check` on the digest, `names-check` on a text, and a plan file is checked against its schema (2.15).
- **When an agent ends:** its report block is checked and saved, each fix is matched to its fault (2.0), its
  inputs' hashes are compared (2.16), and its tokens go into the run's ledger.
- **On a commit:** a commit that names no paths is refused while agents run in parallel.

A first version carries the agents and notes as they are with the dispatch hook and the edit hook, and each
later hook is measured on the benchmark of 0.2. `[E6]`

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
note becomes optional. Done when the Alexander story builds with about 160 marker entries in place of 238 and no
id with a letter suffix. Until it lands, a page that needs another note takes a marker id of its own, and 3.1
checks it. `[F4, F17.3]`

**6.9 States and changes of land, in place of zones per page.** *harita.* **Agreed.** Today a cartographer says
what to draw on each page: a list of zones, each a state at one stage. A story of this form says what is true,
once, and the build works out each page's map from the page's date.

Three files hold a story's map.

```yaml
# shared/states.yaml: who exists
macedon: { name: "Macedon", family: macedon }
persia:  { name: "Persian Empire", family: persia }
```

```yaml
# shared/start.yaml: who holds what as the story opens
when: -0360
holds:
  macedon: lands/macedon-360.geojson
  persia:  lands/persia-360.geojson
```

```yaml
# shared/changes.yaml: each time land changes hands
- when: -0334-05
  from: persia
  to: macedon
  land: lands/hellespontine-phrygia.geojson
  rests_on: [030.7]
  basis: sourced
- when: -0333-11
  from: persia
  to: macedon
  land: lands/cilicia.geojson
  rests_on: [040.3]
  basis: reconstruction
  why: Tarsus is taken. The mountain border follows the Taurus watershed.
```

- **A state has one id, with no year in it.** Its legend name can take dates, where the name itself changes.
- **A change is one fact:** a date, the state that gives the land up, the state that takes it, the land, the
  lines of the digest it rests on, and its basis. A fact-checker checks it as it checks a sentence.
- **A page lists no zones.** It has a `when` (1.12), which is one date or a span with a `from` and a `to`, and
  the build shows what each state holds on that date, or at the `to` of a span. A page can still `hide` a state, or show a claim its text tells.
- **Dates** take one normalized form, a year, a year and month, or a full date, with a year BC written as
  historians count it: March 335 BC is `-0335-03`. A year alone is 1 January and a month its first day. The
  section-coordinator, who writes a page's `when`, turns a season into its first month: spring March, summer June, autumn September, winter December of
  the earlier year. The date is never shown: the page's shown `date` stays free text.
- **The awkward cases.** A new state takes its first land by a change out of another's, as the successors do
  out of Macedon in 323 BC. A state that ends gives up `land: all`. `from: none` takes land nobody held, and
  `to: none` leaves it bare. A conquest that left land untaken draws its piece with that land left out, which
  is the careful side with nothing to remember. A change that is undone between two pages never shows.
- **A piece is drawn generously.** A change moves only what the giver holds inside the piece, so the
  cartographer draws the new frontier with care and overshoots the coast and the outer border.
- **Contested land.** A conquest that took years, or one the sources give no order for, is a change with a span
  in place of a date:

  ```yaml
  - when: { from: -0329, to: -0327 }
    from: persia
    to: macedon
    land: lands/sogdiana.geojson
    basis: reconstruction
  ```

  A page before the span shows the land as the giver's, a page after it as the taker's, and a page inside it
  shows the land hatched in both colours, with a legend line such as "contested, 329–327 BC". No border is drawn
  that no source gives. Where the sources tell the order, the towns that fell first and those that fell last,
  the conquest is several changes and no span. A land whose ruler submitted and was never occupied is contested
  until an army holds it. The word is "contested": "disputed" stays the standing of a claim the sources differ
  on. The build never works out a border between two known ones for a date in between: a line halfway between
  two borders is a border nobody attests, shown as sure as a sourced one.
- **A page turn glides.** When the reader steps to the next page, the cells that changed hands pass from one
  colour to the other and a border moves to its new place, where today it snaps. This is how two true maps are
  shown one after the other and adds nothing to either: the cells make it a change of colour, with no shape to
  work out.

**The build cuts the map once, into cells.** It lays every outline and every piece over each other one time,
which cuts the land into cells that each change hands whole. A date is then a table of which state owns each
cell, a change relabels cells, and a page's map is the cells of each owner merged. harita holds zones this way
already, as a TopoJSON coverage whose neighbours share one line. So two neighbours cannot leave a sliver, a
border that does not move is the same line on every page, and no shape is worked out per page.

**The build checks** that a span's end is after its start, that the giver holds land inside each piece and warns where a change moves nothing, that
the changes are in the order of their dates and name states that exist, that each has its `rests_on` or a
`reconstruction` with its `why`, and that no cell has two owners.

**What it ends.** A page cannot forget a zone its neighbours show (3.10), a legend name cannot outlast its zone,
a zone is never cut by a stage it should not meet (6.2, 3.8), and one Persia serves the whole story with no copy
per stage. The Alexander story has 88 zones, most of them a state at another stage, and would have about 24
states, a starting map and one change per conquest. The rules of 2.2 on zone names, neighbours' zones and the
single cut stay for the stories built in today's form, which keep it.

**First, a trial that redraws nothing.** The Alexander story has every stage drawn. A script takes each piece as
the later stage less the earlier, writes the changes of one section, builds its maps from them and compares
them with today's. It shows whether the overlay gives clean cells, or scraps where two hand-drawn lines nearly
meet, which is the one way this goes wrong. Done when a new story is built in this form with no zone listed on
any page. Rests on 1.12 and 2.13. `[F4, F7]`

**6.10 A research team.** *history.* One researcher did all of a story's research in one early step, before any page
was decided, was resumed about fifteen times and passed 650,000 tokens. A `research-coordinator` and fresh
researchers under it take its place, in two rounds.

- **What a researcher is for.** It finds the correct sources and marks where each claim stands in them. A digest
  line is a pointer: the claim, its quote, the file, the heading or the passage, and how well the sources agree.
  The agents after it still open the source for its full account, as the researcher's definition says today. The
  rule is that nobody searches twice: a line precise enough that the next agent reads four chapters and not the
  book.
- **Round 1, the survey, at `survey`.** The coordinator finds the sources, fetches them and writes what covers
  each section: the source map the brief and the plans are made from. It reads for coverage and writes no claim.
- **Round 2, the claims, at `research`, after `pre-plan-check`.** The pages are now listed, in each section's
  pre-plan (5.7), and the full plans are written after it from its lines. The coordinator dispatches one
  researcher per section, which writes the digest lines its section's pages need.
- **A battle with phase pages has a researcher of its own.** It finds which sources tell the battle, which of
  them give the positions and the movements and where, the figures, and where the authors differ, by one list
  of questions for every battle: the ground, each side's order of battle, each phase, the strengths and the
  losses. The `battle-coordinator` then reads the passages those lines mark and plans the ground, the order of
  battle and the phases. Its plan cites the claim ids and no longer carries the quotes. The section's researcher
  writes no claim on that battle. A battle with a card alone stays with the section's researcher.
- **A gap is researched, not searched for.** A writer that lacks a fact does not search for it: it reports the
  question to its section lead, which dispatches a researcher for it (2.17). A battle-coordinator, itself a
  manager, dispatches a researcher for a gap in its battle the same way. The lines go to the research-coordinator's merge like any
  others, so the digest keeps one owner. How a gap's lines are merged once round 2 has ended is settled when it
  is built.
- **A plan can mark any other page heavy,** for its many sources or its disputed figures, and that page gets a
  researcher of its own. It is the exception.
- **A `research-reviewer` checks each section's lines before they are merged.** Research was the one step that
  made work with no agent to check it: the cartographer has the map-auditor, the writer the fact-checker, and the
  researcher had `quotes-check` alone, which proves a quote stands in its file and not that it carries its claim.
  One reviewer per section, and one per battle with phases, holds the gates of 4.7, tests that each quote
  carries its claim, and that each pointer is precise enough to find its passage. It checks in full the dates,
  places and figures, every `agreed` line, every "no source gives X" and the claims the story turns on, and
  samples the rest. It writes its faults to the fault list, and the researcher fixes them.
- **The coordinator coordinates.** It hands out the work and the claim ids, merges the reviewed lines into
  `research.md`, removes a claim two researchers wrote, and rules where two of them give one claim a different
  standing. It does not review: an agent that judged its own team's work would hold two jobs, and the ledger
  could not show what checking research costs or finds.
- **Who reads the sources, and for what.** The researcher, to find and to mark. The writer, the marked passages
  for the full account it tells. The battle-coordinator, the marked passages for where the units stood. The
  fact-checker and the auditors, the same passages to check the work against them. Whether a writer can work
  from the digest alone is a variant to measure on the benchmark, and not this item's rule.
- **Why per section and not per page.** A section's pages draw on the same chapters of the same sources, so one
  agent opens them once, and a dispute that touches three pages gets one ruling. The Alexander story would take
  9 section researchers and 5 for its battles with phases, against 71 per page.

The roles stay apart so that a run can be read: the ledger gives the cost of research and of planning for each
battle, and a fault is the research's where a figure is wrong and the battle plan's where a right figure is
drawn in the wrong place. In the Alexander run the two ran together: the battle-coordinators searched for
themselves, after the plans and texts had used the first researcher's thinner lines, and found the Persian
Gate's name and the dead at Issus wrong.

Round 2 takes the place of the gap batches of 5.3: the research no longer comes before its questions. The names
agent runs after round 2, since most minor names first appear in its lines. Each researcher starts from
`rules.md`, the source map and its section's pre-plan, by the dispatch form of 2.0, and leaves no handoff: the digest
is its work product. Done when no research agent passes 300,000 tokens and the leaks that begin in research,
5 of the 16 of `[E4.1]`, fall on the benchmark. `[F9, F15, F17.6, E4.2, E4.3]`

**6.11 A card and a marker that meet are one icon.** *harita.* **Agreed.** A battle card's crossed swords stand
on the battle's site, and a siege is fought at a town, so the swords cover the town's marker and the text's link
to the town points at nothing the reader can see. The Alexander run first moved every card 11 to 27 km off its
town, which put the siege of Tyre inland, and then took the town's marker off the page and its link out of the
text. Both were ways round a fault of the display.

The viewer merges the two. Where a card and a marker of its page stand within about 20 pixels of each other at
the page's opening view, they draw as one icon on the card's point: the swords with the marker's label. A tap
opens the card. The text's link to the marker rings the merged icon, and the marker's note shows with it. Away
from the opening view, when the reader zooms in far enough for the two to stand apart, they draw as two.

- The card's `lnglat` is the battle's site and never moves for layout. That rule of 2.2 stays: it is about what
  is true and not about how it draws.
- The rule of 2.2 that takes a town's marker off a card's page goes once this is built. Until then the linter
  of 3.1 tests the distance on screen and not the same point: four pages of the Alexander story have a marker 4
  to 9 km from their card, which overlaps it at their zoom.

Done when a siege's page keeps its town's marker and its link, and no capture shows a marker under a card.
`[F4, E4.4]`

## Not in this spec

- Translation: the steps `name-forms` and `translation`, with the name-finder, the translator and the
  translation-reviewer. They are shelved for a session of their own. The list of 5.0 names them so the order is
  whole, and nothing else here changes them.

- Sources the run could not read (Polyaenus, Hammond and Griffith II, Arrian's *Indica*, the Diadochi Chronicle,
  Strabo, Depuydt) and sites that refused fetches. These are the story's gaps, listed in `decisions.md`.
- Unit hover labels and the phase page that drew the previous phase's armies. They need one check in a real
  browser before they are tool work.
