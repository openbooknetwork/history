---
description: Build a story with the pipeline, as its overseer. Local by default, with the user at the terminal; "cloud" runs unattended to a pull request
argument-hint: <story id> [local|cloud] [first step] [last step]
arguments: [story, mode, first, last]
disable-model-invocation: true
---

Build the story `$story` with this repo's pipeline. The arguments as typed: $ARGUMENTS

- `local` or `cloud` says where this runs. With neither word it is **local**, and a step's name in that place
  is the first step.
- The first step is a name of "Steps" in agents/overseer.md. With none, read
  `content/$story/.plan/decisions.md` and start at the first step of that list with no line `step <name>: done`.
  With no such file: `brief` where `content/$story/.plan/brief.md` is missing, and `survey` where it is there.
- The last step: stop after it and report. With none it is `story`.

You are the overseer. Read agents/overseer.md whole, and "The dispatch", "The report" and "Turns" in
agents/report.md, and follow them. In both modes:

- **Foreground.** Every Agent call carries `run_in_background: false`. Without it the agent starts in the
  background, your turn ends and its record is never closed. Agents that do not wait on each other go in one
  turn, as several such calls. Never end a turn while an agent of yours runs.
- **State on disk.** As a step ends, add the line `step <name>: done` to `decisions.md`, with the date and what
  it made. That line alone says a step is done. `node scripts/inputs.mjs stands $story` lists only workers and
  checkers that have run: read its lines for the step you are about to start and no others. It never lists a
  `research-coordinator` or a `section-lead`, which always start. So never dispatch `survey` or `claims` again
  once its step has its line, and send a lead again only where its section's line is missing.
- **After a compaction or a restart.** Before the next dispatch read again "Steps" and "Reports" in
  agents/overseer.md, `decisions.md` and `rules.md`.
- **Waves.** At `plans` and at the sections' `build`, run three sections at once locally and two in the cloud.
  A wave is one turn. Write `wave <sections>: done` to `decisions.md` as each ends.
- **Long output.** A command that prints more than a screen goes to a file in your scratchpad.
- **Bounds.** The faults of `edit` get one round. The `story-auditor` runs at most twice: its audit, and one
  recheck. Where faults are still open after that, stop and list them. There is no limit on tokens: the run is
  not stopped for its cost. As each step ends, run `node scripts/token-ledger.mjs` on this session's transcripts
  and write the weighted total to `decisions.md`, so the cost so far can be read at any time.
- **"Passes `story`"** means: `harita check $story` prints no problem, the strict build ends well,
  `scripts/rules-lint.mjs` prints none, the `story-auditor`'s last report is `pass`, and no fault list holds an
  open `wrong` or `weak` fault. What `inputs.mjs stale` and `names-check.mjs` print goes into the last report as
  it is.
- Do not run `name-forms` or `translation`.
- Write each thing of the process itself that broke or had to be worked around to
  `content/$story/.plan/run/notes.md`, one line each, as it happens.
- End with the story's page count, the ledger's weighted tokens and those lines.

## Local

The user is at the terminal. Stop for the user at these points and no others:

- the brief, written with the user where it is missing;
- at `survey`: an address the coordinator could not read that a section rests on, and each section's coverage;
- at `final-brief`: the brief with its page count;
- at `pre-plan-check`: the page titles in order;
- at `research`: the `thin` claims;
- as any later step ends: every `unresolved` line of that step's reports together, each with the answer its
  agent proposed. A report that ends `blocked` stops the step at once.

At a stop, say in a few lines what is decided, show what the user has to read, and wait. Between stops do not
ask: run the steps.

Commits are the user's. As each step ends, stage its files by their paths. At each stop, and as each wave ends,
give the user one commit command for what is staged, and wait for it before a step that rechecks a fix. Do not
push and open no pull request. When the story passes `story`, save the run's ledger as agents/overseer.md says
and tell the user how to read the story with `npm run dev`.

## Cloud

Nobody is at the terminal. Read agents/cloud.md too and follow both.

- Where `content/$story/.plan/brief.md` or `content/$story/story.yaml` is missing, stop and say so: write no
  brief yourself.
- First, in every session: `./node_modules/.bin/harita sources $story` where `wikipedia.urls` exists, then one
  build of the story, so no agent starts cold.
- Rule on every point where the notes wait for the user, as agents/cloud.md says, and write each ruling into
  `decisions.md` as a cloud ruling. Take the careful side.
- As each step ends: save the ledger to `content/$story/.plan/run/<session id>.json`, run
  `node scripts/transcripts-pack.mjs pack`, from `images` on run `node scripts/images-pack.mjs pack` too, commit by paths with the step's name in the message, and push this
  session's branch. A session that ends early has then lost one step at the most. Never commit on `main` or on
  the branch the session started from, and never push to either.
- When the story passes `story`, or the bound on the audit's rounds stops the run: open the pull request yourself, into the branch
  this session started from, with the built-in GitHub tools or `gh api repos/{owner}/{repo}/pulls`
  (`gh pr create` is refused here). Its text holds every cloud ruling, what was left out and every open fault.
  Open it as a draft where the story did not pass. Give its link in your last lines.
