# Overseeing a story

For whoever is asked to plan and build a story. You hold the story's strategy: the brief, the rules, the rulings
and the user. You hand the work to the agents of `.claude/agents/`, and each section to a lead of its own. A story is built section by section. A section is one chapter: three to eight pages in one
folder of `content/<story>/pages/`.

`story-ideas.md` names the story and its years. Its plan in `content/<story>/.plan/` is the source from the moment
it is written, and it is committed with the story.

## What the plan folder holds

Whoever takes the story over, on another machine or in another session, starts from these files alone.

| File | Written by | Holds |
|---|---|---|
| `brief.md` | you, and its "Map" part by the `map-architect` | the strategy, the sections, the families and zones |
| `sources.md` | `research-coordinator` | the source map: each source read, and what covers each section |
| `research.md` | the researchers, merged by the `research-coordinator` | what the sources say per section, each line with its quote and file |
| `names.md` | `names` | the form of each person's and place's name, per year where it changes |
| `<number>-<section id>/pages.yaml` | `section-coordinator` | the core of each page: its id, title, dates, what it tells, its claims, markers and battles |
| `<number>-<section id>/map.yaml` | `section-coordinator` | each page's frame, zones, routes and markers, each with its basis |
| `<number>-<section id>/text.yaml` | `section-coordinator` | the section's frame, and each page's account, files, disputes and images |
| `<number>-<section id>/battles.yaml` | `section-coordinator` | each battle's id and page, and the card of a battle without phases |
| `<number>-<section id>/battles/<battle id>.yaml` | `battle-coordinator` | one battle with phases: its ground, order of battle, phases and card |
| `rules.md` | you alone | every standing rule of this story, beyond `agents/` |
| `decisions.md` | you | the state of each step, and each decision with its reason |
| `<number>-<section id>/decisions.md` | the section's `section-lead` | each ruling the lead made for its section, with its reason |
| `research/<section number>.md`, `research/<battle id>.md` | a `researcher` | its lines, before they are reviewed and merged |
| `images/<section number>.yaml` | `image-finder` | which image each placeholder of the section took |
| `reports/<section>-<role>.yaml` | every agent | the block of each of its reports, one entry per run |
| `reports/<section>-<role>.inputs.yaml` | `scripts/inputs.mjs`, by the hooks | what each run built from, made and checked, and how it ended |
| `faults/<section number>.yaml`, `faults/story.yaml` | the checkers | each fault, with its state |
| `fixes/<section number>.yaml`, `fixes/story.yaml` | whoever fixes a fault | each change that fixed one |
| `handoff/<role>.md` | an agent | one page for the next agent of its role |

`content/<story>/wikipedia.urls` and `references.urls` list the addresses the research read.
`./node_modules/.bin/harita sources <story>` fetches them again into `.wikipedia/` and `.references/`, which git
leaves out.

Each role reads `pages.yaml` and the one file of the plan that is its own, and one fact stands in one file.
`scripts/plan-schemas/` holds the schema of each, and `node scripts/plan-check.mjs <story>` checks the plan
folder against them and against each other: run it before a plan is built from.

Write to `decisions.md` as you go: a step that ends, a ruling between two plans, a choice made in the user's place,
a fault that changed a plan, and what is left to do. One line each, with the reason. A step that ends has the
line `step <name>: done`, with the date and what it made, and a wave of sections `wave <sections>: done`. Those
lines alone say what is done: after a break, a restart or a compaction, read them before anything is dispatched.

Keep `rules.md` current from `final-brief` on. A ruling that every later agent has to follow becomes a rule there the
moment you make it, and `decisions.md` keeps its reason. Every agent reads `rules.md`. Only you, the user and whoever reviews
the run read `decisions.md`, so no rule stands there alone, and no dispatch restates one.

## Channels

Agents pass work to each other through the eight channels of `agents/report.md` and through nothing else: the
work products, the rules, the dispatch, the report, the fault list, the fix log, the handoff and the decision
log. You write the rules, each dispatch and `decisions.md`, and you read the reports.

- You rule on a fault and do not relay it. The checker writes it to the fault list, the fixer reads it there, and
  your dispatch names the list.
- No fix without its record. Where you correct a file yourself, even one word of a caption, write the fault to
  the fault list and the change to the fix log. "Who finds it fixes it" in `agents/report.md` says what anyone
  fixes on finding it, which is nearly everything, and the two things that go to somebody else.
- A run's own notes, such as what failed and what the run cost, are a record of the run and no channel. They go
  in `content/<story>/.plan/run/`, and not at the repo's root. The saved run stays at `.plan/run.json`.

## Whose work it is

The work belongs to the roles: a researcher researches, a checker checks, a maker makes. A manager dispatches
and merges, and this part holds for a section lead and a battle coordinator as it holds for you. Nobody passes
on a fault it can fix: "Who finds it fixes it" in `agents/report.md` holds for every agent and for you. Record
what you change: a change is a fault you wrote, with its fix in the fix log, and a decision is a line of your
decision log with its reason.

One such step is a repair. The same kind of step a second time is a fault of the process: a rule that is not
written, a check no script makes, or a job no role holds. A kind of change or ruling that comes up more than once
in a run is work for the process, to be closed with a rule, a script or a role and not with a third repair.

## Managers

One overseer that dispatches every agent and reads every report carries the whole run in its context. So the
work is ordered in three layers, and each manager holds a team it can read.

```
overseer                                   the story: the brief, the rules, the rulings, the user
 ├─ research-coordinator                   the digest
 │   ├─ researcher, per section and per battle with phases
 │   └─ research-reviewer, per section and per battle with phases
 ├─ names, map-architect                   work on the whole story, each one agent
 ├─ map-keeper, with a map-auditor         the shared map, checked before a section draws on it
 ├─ editor                                 the pre-plan check, and the edit
 ├─ section-lead, one per section          the section, from its plan to its reviewed pages
 │   ├─ section-coordinator                its plan (its pre-plan it writes for you, before a lead is there)
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

- A manager dispatches, rules and merges: you, the research coordinator, a section lead, and a battle coordinator
  for its battle. A worker
  makes a thing, and a checker tests what a worker made. Of the definitions only a manager's has the `Agent`
  tool, so a worker or a checker starts nobody.
- A manager dispatches its own team and nobody else's, by the dispatch form, which holds at every level. A
  report goes up one level, to the manager that dispatched its agent, and no further as it is.
- What goes up is small: a status, the counts of the team's faults, each question the manager could not settle
  and each file made stale. The detail stays in the fault list, the fix log and the reports, where you read it
  only when you must. You read about one report a section for a step.
- A maker and its checker are siblings under one manager, and neither is over the other. Whoever of them finds a fault fixes
  it, and no fault waits for a ruling. Their manager dispatches an owner for work the finder could not do, and
  writes in its decision log what it decides. A question the sources leave open and anything that changes the
  brief come up to you, and through you to the user. A manager never checks its own team's work in a checker's place.
- No manager is overloaded. A manager holds at most about ten agents at once, and no manager's context passes
  300,000 tokens: a section lead that would is given a fresh one, which starts from its handoff.
- Three layers is the deepest the order goes, at a battle's agents, and it is Claude Code's default limit.
  Twenty agents run at once by default. Every section's lead with its team passes that, so the sections run in
  waves of two or three, or the limit is raised for the run.

## The plugin

The repo holds the parts of a Claude Code plugin, `story-pipeline`: `.claude-plugin/plugin.json` names the
definitions of `.claude/agents/`, the hooks of `hooks/` and the workflows of `workflows/`. Check it with
`claude plugin validate .`. Do not start a session with `claude --plugin-dir .`: Claude Code holds every file of
a folder loaded as a plugin for sensitive, and refuses each write and edit an agent makes there. In this repo
the same hooks load from `.claude/settings.json`, in a plain session and in a cloud session, and the plugin is
for a copy of these parts in a folder of its own. The hooks hold what these notes ask for, inside the agents
too:

- **On a dispatch.** A dispatch of one of these roles that breaks the dispatch form does not start. One that
  passes has its section's slices made afresh and its inputs hashed, so with the plugin you run neither
  `scripts/slice.mjs` nor `scripts/inputs.mjs` to record yourself.
- **After an edit.** A plan file is checked against its schema, a text by the linter and `names-check`, a page
  file by the linter, the digest by `quotes-check`, and the agent is handed what they print.
- **As an agent ends.** It keeps working until its report has its block, each fault the block names is in a
  fault list, each of its fixes names a fault, its block is saved, and what changed under it stands under
  `stale`.
- **On a commit.** Inside an agent, `git commit -a` and `git add -A` are refused.

`/story-pipeline:section` is the fixed order of one section as a workflow: draw, audit and fix, write, build
and audit the phase pages, find images, fact check and review. Run it with the story, the section and the
section's battles with phases in place of the dispatches a lead makes by hand at `build`. It rules on nothing:
it returns each agent's status with what was left unresolved or stale, and the section's lead rules on that.

## Lean by default

Every pass of the process runs: the map audit, the fact check, the review, the edit and the story audit. What is
cut is what each pass carries and how often work goes round the loop.

- Geometry comes before any capture. Which zone holds a place and whether a route keeps to its surface are
  questions for `scripts/points.mjs` and `scripts/route-surface.mjs`, and the rules a script can test for
  `scripts/rules-lint.mjs`. An auditor takes one desktop capture a page, and a reviewer takes none of its own.
- A fault is fixed by whoever finds it, `taste` too where the fix is a clause. A `taste` fault that would take
  an owner's run, such as a marker the plan does not ask for, is not written at all.
- A pass is skipped only where another pass covers it, and the ruling is in the decision log of whoever made it.

## Dispatches

Every dispatch, and every message that resumes an agent, opens with the block of "The dispatch" in
`agents/report.md`. Nothing follows the block.

- It points and does not paste. It holds no rule, which is in `rules.md`, no fault, which is in the fault list,
  and no list of files to read, which the role's definition gives for a story and a section.
- `battle`, `pages`, `lang` and `names` stand only where the work is one battle, named pages, one language or
  named names. The story, the section, and these four where they stand, are all the block says of what to work
  on.
- `task` is one word from the list in the role's definition.
- `scratchpad` names a folder of the agent's own, since agents that run at once share the scratchpad.
- `note` gives context and never instructs. It states a fact about this one dispatch that no channel holds. It is
  one sentence of at most 200 characters, and it is empty in most dispatches. A note that tells the agent how to
  work is a prompt inside the dispatch, which is the thing the form replaces. A fact given in a second note
  belongs in `rules.md`.
- The tool's short description takes one form too, the step, the section, the role and the task, as
  `maps 020 cartographer draw`, so the list of agents reads as the run.
- Dispatches are not saved to files. The transcript holds them.

## Steps

A step is known by its name, in a dispatch, a saved run, a report and these notes. This list alone says which
comes first, and `ORDER` of `scripts/transcripts.mjs` holds it for the scripts.

| Step | What happens | Who |
|---|---|---|
| `brief` | the draft brief | you, with the user |
| `survey` | research round 1: the sources, and what covers each section | `research-coordinator` |
| `final-brief` | the brief settled, and `rules.md` written | you |
| `pre-plans` | each section's page list | section coordinators, dispatched by you |
| `pre-plan-check` | overlaps, order and gaps across the sections | `editor` |
| `research` | round 2: the claims, per section and per battle, each reviewed | `research-coordinator`, with researchers and research reviewers |
| `names` | the form of each name | `names` |
| `map-design` | the map's extent, its families and its zones | `map-architect` |
| `plans` | the full section plans, the battle plans and the cards | section leads, with their section and battle coordinators |
| `plan-check` | each plan's routes and borders against the sources | fact checkers, under the section leads |
| `maps` | the shared map first, audited, then each section's maps, audited | `map-keeper`, cartographers, map auditors |
| `texts` | each section's texts, once its page files exist | section writers |
| `phases` | the phase pages of each battle, audited | battle implementors, battle auditors |
| `images` | each section's images | image finders |
| `facts` | the fact check with its fixes, then the review | fact checkers, section reviewers |
| `edit` | the cohesion of the whole | `editor` |
| `story` | the whole story checked and audited | you, `story-auditor` |
| `name-forms`, `translation` | each language's names, then its texts | name finders, translators |

- **`brief`.** With the user, write `content/<story>/.plan/brief.md`: the subject, its years, whether it tells
  a war or a people, and what the reader knows at the end. Then the sections in order, each with:
  - its number, in tens, its id and its years
  - **Tells:** the events of the section, one line each
  - **Battles:** each battle with a card, and the ones that may get phase pages
  - **Pages:** the count you expect

  Size the story as `agents/outline.md` says. Write `content/<story>/story.yaml` with the book's fields of
  `content/black-death/story.yaml`.
- **`survey`.** Dispatch the `research-coordinator` with the task `survey`. It finds the sources, fetches them
  and writes the source map: what covers each section. Where its report lists an address as unread and a section
  rests on it, the story holds: the user saves the page under the name given, and the coordinator is resumed.
  Read each section's coverage with the user: a section that rests on `wikipedia` alone goes on only when the
  user agrees it, and `decisions.md` keeps the ruling.
- **`final-brief`.** Settle each point where the source map differs from the brief: change the brief, or keep it
  and write the reason in `decisions.md`. Show the user the brief with its page count. The work goes on when the
  user agrees it. Then write `content/<story>/.plan/rules.md`: every standing rule of this story, each in a line
  or two. A rule that holds for every story belongs in `agents/` and not there.
- **`pre-plans`.** Dispatch one `section-coordinator` per section yourself, all in one turn, with the task
  `pre-plan`. Each writes its section's `pages.yaml` without `rests_on`: the pages, their dates, what each
  tells, its battles and the places it marks, and runs the plan check on it. No section lead stands between:
  at this step a lead has one dispatch to pass on and nothing to rule on. A lead takes its section from `plans`.
- **`pre-plan-check`.** Dispatch the `editor` with the task `pre-plans`. It reads every pre-plan together. A
  fault goes to the lead of its section, or changes the brief. Show the user each section's page titles in order
  with the page count. The work goes on when the user agrees them.
- **`research`.** Dispatch the `research-coordinator` with the task `claims`. It dispatches one `researcher` for
  each section and one for each battle the pre-plans give phases, has a `research-reviewer` check each one's
  lines, and merges them into `research.md`. `node scripts/quotes-check.mjs <story>` proves that each quote of
  the digest is in the file it names: run it yourself before the next step. Read the digest's "Thin" part with
  the user: each `thin` claim goes on only when the user agrees it.
- **`names`.** Dispatch the `names` agent with the task `decide`. It runs after the research, where most minor
  names first stand.
- **`map-design`.** Dispatch the `map-architect`. It writes the brief's "Map" part and the `harita` fields of
  `story.yaml`.
- **`plans`.** Dispatch each section's lead again, with the task `plan`. Each has its `section-coordinator`
  write the full plan with the section's cards, and a `battle-coordinator` plan each battle with phases and
  write its card. A family or a zone a lead reports the "Map" part lacks goes into that part under one name
  before the pages are built. Then run `node scripts/plan-check.mjs <story>`.
- **`plan-check`.** Each lead has a `fact-checker` check its plan's routes and borders against the passages
  they name, as its plan is ready, so a wrong plan is caught before the next one rests on it.
- **`maps`.** Dispatch the `map-keeper`, which draws the zones every section rests on, and then the
  `map-auditor` with `section: all`. The keeper fixes from `faults/story.yaml` once and the auditor rechecks once. A
  fault the recheck finds anew the auditor fixes itself where it can. One it cannot fix sends the keeper back
  only where it is `wrong` or `weak`: a `taste` fault goes into the keeper's handoff and holds no section up.
  No section draws before the recheck.
- **`maps` to `facts`, by section.** Dispatch each section's lead again, with the task `build`. A lead takes its
  section through its maps, texts, phase pages, images, fact check and review in that order, rules on what the
  section can settle, and reports once. Every agent that takes captures serves a static build of its own, so
  its dispatch says `serve: static`. Run the sections in waves, as "Managers" below says.
- **`images`, at its end.** Once every section is reviewed, run `node scripts/images-place.mjs <story>`, which
  puts each image's id in place of its placeholder.
- **`edit`.** Dispatch the `editor` with the task `texts`. A fault of its lists goes to the lead of its section,
  for its reviewer, or for its cartographer where the map is at fault. The pages the editor changed go to the
  `fact-checker` of their section, through the same lead.
- **`story`.** Check the story as "Checking a story" in `agents/pages.md` says, and run
  `node scripts/inputs.mjs stale <story>`, `node scripts/rules-lint.mjs <story>` and
  `node scripts/names-check.mjs <story>`. Dispatch the `story-auditor`. For each fault it writes to the fault
  lists, decide the file that changes, a plan, a text, a map file or a battle, and dispatch the lead of its
  section with the list. The auditor runs again until it reports `pass`.
  Then save the run's ledger beside the plan, since the transcripts end with the session:
  `node scripts/token-ledger.mjs <transcripts> --story <story> --json > content/<story>/.plan/run.json`.
  `<transcripts>` is this session's transcript, `~/.claude/projects/<project>/<session id>.jsonl`, with the
  session id as it stands in your scratchpad's path, or the folder that holds the agents' transcripts.
  `node scripts/token-ledger.mjs` and `node scripts/fault-ledger.mjs` print the run's tokens and faults from
  that file, and `scripts/run-viewer.html` shows it to the user in a browser. The user then reads the story on
  a phone.
- **`name-forms`.** For each language of `languages` in `site.yaml` after `en`, dispatch one `name-finder` with
  the story id and the language. They run at once, since each language has its own files. A name it leaves
  `unsourced` is the user's decision.
- **`translation`.** For each language, once its name finder reports, dispatch one `translator` with the story
  id and the language. When a translator reports, dispatch the `translation-reviewer` with the same story and
  language. A change to an English text after this step goes to the translator of each language again, with
  the page ids.

### What runs side by side

- The sections run at once within a step, in waves.
- Within a section: its writer starts once the cartographer has written the page files, beside the map audit.
  Its image finder starts once it has its texts and cards, beside the fact check and the review, since it edits
  no text. A battle's phase pages are built once its section has its page files.
- Across sections: the map audit of one section beside the drawing of the next.
- The battle plans and the cards do not run beside the maps: they are written at `plans`, before any map.
- Two agents that write the same file never run at once.

### When a plan changes

A plan is not frozen, and it is not kept in step by hand either. A small change to a page, such as a corrected
date, a dispute moved to its note or a marker renamed, leaves the plan as it is and goes into the fix log. A
change to the story's shape, a page added, removed or split, or a battle that loses its phase pages, goes back to
`plans`: the plan is written again, its hash changes, and `node scripts/inputs.mjs stale <story>` lists each
thing built from the old version to build again.

An agent is fresh for each section: it starts from `rules.md`, its section's slices of the digest and the names,
its files of the plan and the handoff of its role, and it reads its whole history again on every turn, so a long
life is what costs. Run `node scripts/slice.mjs <story> <section number>` before you dispatch a section's
agents: it writes `research-<section number>.md` and `names-<section number>.md` into the plan folder, afresh
each time, and they are not committed. Resume an agent with `SendMessage` only for a fix or a recheck of the
work it has just done, or a small follow-up on its own generator. The message opens with the block too, and the
fault it is resumed for is in the fault list. No agent's context passes 300,000 tokens: one that nears it writes
its handoff and ends, and a fresh one takes over.

## Reports

Every agent's report is the block of `agents/report.md` and at most ten lines, and the agent saves the block to
`content/<story>/.plan/reports/`. Its faults are in the fault list, and the block names their ids. Act on the
block before the prose:

- `blocked` stops the step. Clear what blocks it, or take the question to the user.
- A fault left `open` is work its finder could not do: dispatch its `owner`. A line under `unresolved` is a
  decision for the user.
- Copy each `unresolved` line into `decisions.md`. An agent's answer to an open question is a proposal until the
  user rules on it.
- Each file under `stale` is built or checked again. "When something changes upstream" has the script that lists them.

## When something changes upstream

Every agent works from files another wrote: the rules, the names, the brief, its section's part of the digest and
its role's files of the plan. `scripts/inputs.mjs` hashes them, so nobody keeps from memory what rests on what.
No agent runs it for itself. The hooks do, round each dispatch, and a manager reads what they leave:

- As an agent is dispatched, the hook opens an entry in `reports/<section>-<role>.inputs.yaml`: the hash of each
  thing the role builds from. A plan is hashed by page, and of `names.md` the rows the role's own inputs mention.
- As the agent ends, the hook closes the entry: how its report says it ended, the inputs it changed itself, what
  it made, and for a checker what it checks, as it left it. An entry never closed is a run that broke.
- `node scripts/inputs.mjs stands <story> <section number>` lists each role of the section at each step: `stands`,
  or `RUNS` with why. **Run it as you start a step again**, after a run that broke or a change upstream, and
  dispatch only what does not stand. A maker stands when what it builds from is as it was and what it made is
  there. A checker stands when its last run ended `pass` and what it checks is as that run left it.
- A dispatch of a role that stands does not start. The hook answers in the agent's place, with the words `STILL
  STANDS, NO AGENT WAS STARTED AND NONE IS NEEDED` and the role's last report. It reaches you marked as a hook
  error, and it is none: take the report as the answer and go on. Send `again: true` in the block only where you
  know what no file shows, such as a ruling of the user that changed.
- A `fix`, a `recheck`, an `add`, a `rewrite` and a `replace` always start, and so does every manager. A lead sent
  again after a break walks its order, and its team does what is left.
- `node scripts/inputs.mjs stale <story>` at any moment lists each record with what changed under it since, by
  page: a changed route flags that page's map and not its text. `skip-spec.md` has the design.

A hash proves that what an agent built from did not change. It does not prove that a plan still matches the
pages made from it: a fix to a text leaves its plan's hash as it was.

Find what a commit changed with `git log --stat -- content/<story>`. After each step, stage the plan folder with
`git add` and give the user the commit command, so the next change shows as a diff. The user makes every commit.
A commit names its paths, as `git add <paths>` and `git commit <paths>`. While agents run in parallel, nobody
runs `git commit -a` or `git add -A`, which take another agent's half-written files into the commit.
