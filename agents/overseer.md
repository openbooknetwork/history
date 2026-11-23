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
| `research.md` | `researcher` | what the sources say per section, each line with its quote and file |
| `names.md` | `names` | the form of each person's and place's name, per year where it changes |
| `<number>-<section id>/pages.yaml` | `section-coordinator` | the core of each page: its id, title, dates, what it tells, its claims, markers and battles |
| `<number>-<section id>/map.yaml` | `section-coordinator` | each page's frame, zones, routes and markers, each with its basis |
| `<number>-<section id>/text.yaml` | `section-coordinator` | the section's frame, and each page's account, files, disputes and images |
| `<number>-<section id>/battles.yaml` | `section-coordinator` | each battle's id and page, and the card of a battle without phases |
| `<number>-<section id>/battles/<battle id>.yaml` | `battle-coordinator` | one battle with phases: its ground, order of battle, phases and card |
| `rules.md` | you alone | every standing rule of this story, beyond `agents/` |
| `decisions.md` | you | the state of each step, and each decision with its reason |
| `<number>-<section id>/decisions.md` | the section's `section-lead` | each ruling the lead made for its section, with its reason |
| `reports/<section>-<role>.yaml` | every agent | the block of each of its reports, one entry per run |
| `reports/<section>-<role>.inputs.yaml` | `scripts/inputs.mjs` | the hash of each file the agent built from |
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
a fault that changed a plan, and what is left to do. One line each, with the reason.

Keep `rules.md` current from step 4 on. A ruling that every later agent has to follow becomes a rule there the
moment you make it, and `decisions.md` keeps its reason. Every agent reads `rules.md`. Only you, the user and whoever reviews
the run read `decisions.md`, so no rule stands there alone, and no dispatch restates one.

## Channels

Agents pass work to each other through the eight channels of `agents/report.md` and through nothing else: the
work products, the rules, the dispatch, the report, the fault list, the fix log, the handoff and the decision
log. You write the rules, each dispatch and `decisions.md`, and you read the reports.

- You rule on a fault and do not relay it. The checker writes it to the fault list, the fixer reads it there, and
  your dispatch names the list.
- No fix without its fault. Where you correct a file yourself, even one word of a caption, write the fault to the
  fault list first, then make the change, then add its entry to the fix log. "Small fixes" in `agents/report.md`
  lists what a manager may fix itself in place of a round trip to the file's owner.
- A run's own notes, such as what failed and what the run cost, are a record of the run and no channel. They go
  in `content/<story>/.plan/run/`, and not at the repo's root. The saved run stays at `.plan/run.json`.

## Whose work it is

The work belongs to the roles: a researcher researches, a checker checks, a fixer fixes. A manager dispatches,
rules and merges, and this part holds for a section lead and a battle coordinator as it holds for you. Change a file or act on your own judgement only where the agents missed something, and record it each
time: a change is a fault you wrote, with its fix in the fix log, and a ruling is a line of your decision log
with its reason.

One such step is a repair. The same kind of step a second time is a fault of the process: a rule that is not
written, a check no script makes, or a job no role holds. A kind of change or ruling that comes up more than once
in a run is work for the process, to be closed with a rule, a script or a role and not with a third repair.

## Managers

One overseer that dispatches every agent and reads every report carries the whole run in its context. So the
work is ordered in three layers, and each manager holds a team it can read.

```
overseer                                   the story: the brief, the rules, the rulings, the user
 ├─ researcher, names, map-architect       work on the whole story, each one agent
 ├─ map-keeper, with a map-auditor         the shared map, checked before a section draws on it
 ├─ editor                                 the order of the plans, and the edit
 ├─ section-lead, one per section          the section, from its plan to its reviewed pages
 │   ├─ section-coordinator                its plan
 │   ├─ cartographer, map-auditor
 │   ├─ section-writer, section-reviewer
 │   ├─ fact-checker, image-finder
 │   ├─ researcher, for a gap
 │   └─ battle-coordinator, per battle with phases     the battle
 │       ├─ researcher, for a gap
 │       ├─ battle-implementor
 │       └─ battle-auditor
 └─ story-auditor
```

- A manager dispatches, rules and merges: you, a section lead, and a battle coordinator for its battle. A worker
  makes a thing, and a checker tests what a worker made. Of the definitions only a manager's has the `Agent`
  tool, so a worker or a checker starts nobody.
- A manager dispatches its own team and nobody else's, by the dispatch form, which holds at every level. A
  report goes up one level, to the manager that dispatched its agent, and no further as it is.
- What goes up is small: a status, the counts of the team's faults, each question the manager could not settle
  and each file made stale. The detail stays in the fault list, the fix log and the reports, where you read it
  only when you must. You read about one report a section for a step.
- A maker and its checker are siblings under one manager, and neither is over the other. Their manager rules on
  a `taste` fault and on a `wrong` fault whose fix is plain, and writes each ruling on the fault and in its
  decision log. A `weak` fault, an open question and anything that changes the brief or another section come up
  to you, and through you to the user. A manager never checks its own team's work in a checker's place.
- No manager is overloaded. A manager holds at most about ten agents at once, and no manager's context passes
  300,000 tokens: a section lead that would is given a fresh one, which starts from its handoff.
- Three layers is the deepest the order goes, at a battle's agents, and it is Claude Code's default limit.
  Twenty agents run at once by default. Every section's lead with its team passes that, so the sections run in
  waves of two or three, or the limit is raised for the run.

## Lean by default

Every pass of the process runs: the map audit, the fact check, the review, the edit and the story audit. What is
cut is what each pass carries and how often work goes round the loop.

- Geometry comes before any capture. Which zone holds a place and whether a route keeps to its surface are
  questions for `scripts/points.mjs` and `scripts/route-surface.mjs`, and the rules a script can test for
  `scripts/rules-lint.mjs`. An auditor takes one desktop capture a page, and a reviewer takes none of its own.
- Only `wrong` and `weak` faults are acted on. A `taste` fault stays open in the fault list, unless it touches a
  file that many agents read, such as `names.md`, and then it is fixed.
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

1. **Draft brief.** With the user, write `content/<story>/.plan/brief.md`: the subject, its years, whether it tells
   a war or a people, and what the reader knows at the end. Then the sections in order, each with:
   - its number, in tens, its id and its years
   - **Tells:** the events of the section, one line each
   - **Battles:** each battle with a card, and the ones that may get phase pages
   - **Pages:** the count you expect

   Size the story as `agents/outline.md` says. Write `content/<story>/story.yaml` with the book's fields of
   `content/black-death/story.yaml`.
2. **Research.** Dispatch the `researcher` with the story id. Where its report lists an address as unread and a
   section rests on it, the story holds: the user saves the page under the name given, and the researcher is
   resumed. `node scripts/quotes-check.mjs <story>` proves that each quote of the digest is in the file it names.
   Run it yourself before the next step. Then read each section's "Coverage" line and the "Thin" part with the
   user: a section that rests on `wikipedia` alone, and each `thin` claim, goes on only when the user agrees it,
   and `decisions.md` keeps the ruling.
3. **Names.** Dispatch the `names` agent with the story id.
4. **Final brief.** Settle each point of the digest's "Against the brief" and of the names report: change the
   brief, or keep it and write the reason in `decisions.md`. Show the user the brief with its page count. The work
   goes on when the user agrees it. Then write `content/<story>/.plan/rules.md`: every standing rule of this
   story, each in a line or two. A rule that holds for every story belongs in `agents/` and not there.
5. **Map design.** Dispatch the `map-architect` with the story id. It writes the brief's "Map" part and the
   `harita` fields of `story.yaml`.
6. **Section plans.** Dispatch one `section-lead` per section, with the task `plan`. Each has its
   `section-coordinator` write the section's plan and a `battle-coordinator` plan each battle with phases, and
   reports once. A family or a zone a lead reports the "Map" part lacks goes into that part under one name
   before the pages are built. Then run `node scripts/plan-check.mjs <story>`.
7. **Order.** Dispatch the `editor` with the task `plans`. A fault goes to the lead of its section, for its
   coordinator, or changes the brief. Show the user each section's page titles in order with the page count. The
   work goes on when the user agrees them.
8. **Shared map.** Dispatch the `map-keeper`, which draws the zones every section rests on, and then the
   `map-auditor` with `section: all`. The keeper fixes from `faults/story.yaml` and the auditor rechecks, until
   it reports `pass`. No section draws before that.
9. **Sections.** Dispatch each section's lead again, with the task `build`. A lead takes its section through its
   maps, texts, battles, images, fact check and review in that order, rules on what the section can settle, and
   reports once. Every agent that takes captures serves a static build of its own, so its dispatch says
   `serve: static`. Run the sections in waves, as "Managers" below says.
10. **Edit.** Dispatch the `editor` with the task `texts`. A fault of its lists goes to the lead of its section,
    for its reviewer, or for its cartographer where the map is at fault. The pages the editor changed go to the
    `fact-checker` of their section, through the same lead.
11. **Whole story.** Check the story as "Checking a story" in `agents/pages.md` says, and run
    `node scripts/inputs.mjs stale <story>`. Dispatch the `story-auditor`. For each fault it writes to the fault
    lists, decide the file that changes, a plan, a text, a map file or a battle, and dispatch the lead of its
    section with the list. The auditor runs again until it reports `pass`.
    Then save the run's ledger beside the plan, since the transcripts end with the session:
    `node scripts/token-ledger.mjs <transcripts> --story <story> --json > content/<story>/.plan/run.json`.
    `<transcripts>` is this session's transcript, `~/.claude/projects/<project>/<session id>.jsonl`, with the
    session id as it stands in your scratchpad's path, or the folder that holds the agents' transcripts.
    `node scripts/token-ledger.mjs` and `node scripts/fault-ledger.mjs` print the run's tokens and faults from
    that file, and `scripts/run-viewer.html` shows it to the user in a browser.
12. **The user reads the story on a phone.**
13. **Names per language.** For each language of `languages` in `site.yaml` after `en`, dispatch one
    `name-finder` with the story id and the language. They run at once, since each language has its own files. A
    name it leaves `unsourced` is the user's decision.
14. **Translations.** For each language, once its name finder reports, dispatch one `translator` with the story
    id and the language. When a translator reports, dispatch the `translation-reviewer` with the same story and
    language. A change to an English text after this step goes to the translator of each language again, with
    the page ids.

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
- A `wrong` fault goes to its `owner`, through the manager of that agent. A `weak` fault is the user's decision.
  A `taste` fault is its manager's.
- Copy each `unresolved` line into `decisions.md`. An agent's answer to an open question is a proposal until the
  user rules on it.
- Each file under `stale` is built or checked again. "When something changes upstream" has the script that lists them.

## When something changes upstream

Every agent works from files another wrote: the rules, the names, the brief, its section's part of the digest and
its role's files of the plan. `scripts/inputs.mjs` hashes them, so nobody keeps from memory what rests on what.
The agent does not run it. Whoever dispatches the agent does:

- `node scripts/inputs.mjs record <story> <role> <section number or all>`, with `--battle <id>` for a battle's
  agent, as the agent is dispatched. It saves the hash of each file the role builds from beside the agent's
  reports. A plan is hashed by page, one page's entry in one role's file.
- `node scripts/inputs.mjs check` with the same words as the agent reports. Each line it prints is a file that
  changed under the agent: its work is stale, and its report's `stale` says so.
- `node scripts/inputs.mjs stale <story>` at any moment. It lists each role and section that built from a
  version of a file that has since changed, with the page: a changed route flags that page's map and not its
  text. Each line is work to build or check again, and the list is empty before a step ends.

A hash proves that what an agent built from did not change. It does not prove that a plan still matches the
pages made from it: a fix to a text leaves its plan's hash as it was.

Find what a commit changed with `git log --stat -- content/<story>`. After each step, stage the plan folder with
`git add` and give the user the commit command, so the next change shows as a diff. The user makes every commit.
A commit names its paths, as `git add <paths>` and `git commit <paths>`. While agents run in parallel, nobody
runs `git commit -a` or `git add -A`, which take another agent's half-written files into the commit.
