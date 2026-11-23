# Overseeing a story

For whoever is asked to plan and build a story. You hold the story's strategy and hand the work to the agents of
`.claude/agents/`. A story is built section by section. A section is one chapter: three to eight pages in one
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
| `<number>-<section id>.md` | `section-coordinator` | one section's pages, their sources and Contract |
| `battles/<battle id>.md` | `battle-coordinator` | one battle's ground, order of battle and phases |
| `rules.md` | you alone | every standing rule of this story, beyond `agents/` |
| `decisions.md` | you | the state of each step, and each decision with its reason |
| `reports/` | every agent | the block each report opens with |
| `faults/<section number>.yaml`, `faults/story.yaml` | the checkers | each fault, with its state |
| `fixes/<section number>.yaml` | whoever fixes a fault | each change that fixed one |
| `handoff/<role>.md` | an agent | one page for the next agent of its role |

`content/<story>/wikipedia.urls` and `references.urls` list the addresses the research read.
`./node_modules/.bin/harita sources <story>` fetches them again into `.wikipedia/` and `.references/`, which git
leaves out.

Write to `decisions.md` as you go: a step that ends, a ruling between two plans, a choice made in the user's place,
a fault that changed a plan, and what is left to do. One line each, with the reason.

Keep `rules.md` current from step 4 on. A ruling that every later agent has to follow becomes a rule there the
moment you make it, and `decisions.md` keeps its reason. Every agent reads `rules.md`. Only you and the reviewer
read `decisions.md`, so no rule stands there alone, and no dispatch restates one.

## Channels

Agents pass work to each other through the eight channels of `agents/report.md` and through nothing else: the
work products, the rules, the dispatch, the report, the fault list, the fix log, the handoff and the decision
log. You write the rules, each dispatch and `decisions.md`, and you read the reports.

- You rule on a fault and do not relay it. The checker writes it to the fault list, the fixer reads it there, and
  your dispatch names the list.
- No fix without its fault. Where you correct a file yourself, even one word of a caption, write the fault to the
  fault list first, then make the change, then add its entry to the fix log.
- A run's own notes, such as what failed and what the run cost, are a record of the run and no channel. They go
  in `content/<story>/.plan/run/`, and not at the repo's root. The saved run stays at `.plan/run.json`.

## Whose work it is

The work belongs to the roles: a researcher researches, a checker checks, a fixer fixes. You dispatch, rule and
merge. Change a file or act on your own judgement only where the agents missed something, and record it each
time: a change is a fault you wrote, with its fix in the fix log, and a ruling is a line of `decisions.md` with
its reason.

One such step is a repair. The same kind of step a second time is a fault of the process: a rule that is not
written, a check no script makes, or a job no role holds. A kind of change or ruling that comes up more than once
in a run is work for the process, to be closed with a rule, a script or a role and not with a third repair.

## Dispatches

Every dispatch, and every message that resumes an agent, opens with the block of "The dispatch" in
`agents/report.md`. Nothing follows the block.

- It points and does not paste. It holds no rule, which is in `rules.md`, no fault, which is in the fault list,
  and no list of files to read, which the role's definition gives for a story and a section.
- `battle`, `pages` and `lang` stand only where the work is one battle, named pages or one language. The story,
  the section, and these three where they stand, are all the block says of what to work on.
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
6. **Section plans.** Dispatch one `section-coordinator` per section, with the story id and the section id. They
   run at once. A family or a shared zone a plan marks `new` beyond the "Map" part goes into that part under one
   name before the pages are built.
7. **Order.** Dispatch the `editor` with the story id and the word `plans`. A fault goes back to its section's
   coordinator, or changes the brief. Show the user the Headers in order with the page count. The work goes on
   when the user agrees them.
8. **Maps and texts.** Start the story's dev server in the background, as "Checking a story" in `agents/pages.md`
   says, and note its process id. Name its port in every dispatch from here to step 14, so no agent builds the
   story a second time, and stop it after step 14. The port is the `serve` of each dispatch. Dispatch the `cartographer` with the sections in order, one
   section at a time. The same cartographer takes every section, so each zone, route and family exists once. When
   it reports on a section, dispatch the `map-auditor` with that section. It writes its faults to the section's
   fault list. The same cartographer fixes them from the list before it takes the next section, and the last
   section is audited until it reports `pass`. Dispatch
   one `section-writer` per section, and they run at once.
9. **Battle plans.** Dispatch one `battle-coordinator` per battle a section's plan gives phase pages. They run
   at once. Where one reports that no source gives the positions, take the phase pages out of the section's plan.
10. **Battles.** Dispatch the `battle-implementor` with each battle of the plans, one battle at a time, and the
    same implementor takes every battle. It writes the battle's card, and the phase pages of a battle with
    phases. When it reports, dispatch the `battle-auditor`, which writes its faults to the fault list of the
    battle's section. The same implementor fixes them from the list before it takes the next battle. The last
    battle is audited until it reports `pass`.
11. **Images.** Dispatch one `image-finder` per section once the section has its texts and its battle cards.
12. **Facts and review.** For each section, once its maps, battles and images are in, dispatch the `fact-checker`,
    and then the `section-reviewer`, which fixes from the section's fault list. Dispatch the fact checker again
    to recheck the list, until it reports `pass`. The marker notes and the faults of a map that the reviewer
    wrote to the list go to the cartographer once every reviewer of the story has finished, and a place short of
    an image to the section's image finder. A point where a plan should change goes back to step 7.
13. **Edit.** Dispatch the `editor` with the story id and the word `texts`. A fault of its lists goes to the
    reviewer of its section, or to the cartographer where the map is at fault. The pages the editor changed go to the
    `fact-checker` of their section.
14. **Whole story.** Check the story as "Checking a story" in `agents/pages.md` says. Dispatch the `story-auditor`
    with the story id. For each fault it writes to the fault lists, decide the file that changes, a plan, a
    text, a map file or a battle, and dispatch the step that owns the file with the list. The auditor runs again until it reports `pass`.
    Then save the run's ledger beside the plan, since the transcripts end with the session:
    `node scripts/token-ledger.mjs <transcripts> --story <story> --json > content/<story>/.plan/run.json`.
    `<transcripts>` is this session's transcript, `~/.claude/projects/<project>/<session id>.jsonl`, with the
    session id as it stands in your scratchpad's path, or the folder that holds the agents' transcripts.
    `node scripts/token-ledger.mjs` and `node scripts/fault-ledger.mjs` print the run's tokens and faults from
    that file, and `scripts/run-viewer.html` shows it to the user in a browser.
15. **The user reads the story on a phone.**
16. **Names per language.** For each language of `languages` in `site.yaml` after `en`, dispatch one
    `name-finder` with the story id and the language. They run at once, since each language has its own files. A
    name it leaves `unsourced` is the user's decision.
17. **Translations.** For each language, once its name finder reports, dispatch one `translator` with the story
    id and the language. When a translator reports, dispatch the `translation-reviewer` with the same story and
    language. A change to an English text after this step goes to the translator of each language again, with
    the page ids.

An agent that is resumed keeps what it read: resume it with `SendMessage` in place of a new dispatch. The message
opens with the block too, and the fault it is resumed for is in the fault list.

## Reports

Every agent's report is the block of `agents/report.md` and at most ten lines, and the agent saves the block to
`content/<story>/.plan/reports/`. Its faults are in the fault list, and the block names their ids. Act on the
block before the prose:

- `blocked` stops the step. Clear what blocks it, or take the question to the user.
- A `wrong` fault goes to its `owner`. A `weak` fault is the user's decision. A `taste` fault is yours.
- Copy each `unresolved` line into `decisions.md`. An agent's answer to an open question is a proposal until the
  user rules on it.
- Each file under `stale` is rebuilt or checked again, as the next part says.

## When something changes upstream

A file is built from the files to its left. When one changes after a later step used it, the files to its right
are stale, from the nearest column on:

| Changed | Stale | Who looks again |
|---|---|---|
| a line of `research.md` | each plan that names its id under `Rests on:` | that section's coordinator, then as a plan change |
| `names.md` | each text and marker that writes the name | the section's reviewer, the cartographer, each name finder |
| the brief's "Map" part | each plan and zone that uses the family or zone | the coordinators, then the cartographer |
| a section plan | the section's page files, texts, battles and images | cartographer, writer, then the checks of step 12 |
| a battle plan | the battle's card, generator and phase pages | the battle implementor and auditor |
| a page file, zone or route | the page's text, where it tells the map | the section's reviewer, then the fact checker |
| an English text | the page's translations | the translator of each language, with the page id |

Find what rests on a claim with `grep -rn "<id>" content/<story>/.plan`, and what a commit changed with
`git log --stat -- content/<story>`. After each step, stage the plan folder with `git add` and give the user the
commit command, so the next change shows as a diff. The user makes every commit.
A commit names its paths, as `git add <paths>` and `git commit <paths>`. While agents run in parallel, nobody
runs `git commit -a` or `git add -A`, which take another agent's half-written files into the commit.
Send an agent the changed lines and the page ids they touch, and leave the other pages as they are. Write each
stale file into `decisions.md` when it goes stale and strike it when it is checked again, so no agent builds
from a plan that has moved on.
