# The pipeline as data: a table, a log and views

A design for the story pipeline, third draft, reviewed, 27 Nov 2026. It replaces the second draft, which is kept outside
the repo. That draft answered each finding of `pipeline-improvements.md` with its own command, state or hook,
and its second review showed that it could not be built. This draft goes to the cause behind the findings.

## The gist

The pipeline keeps its state in prose and in files that agents write by hand, in several places. So agents
read too much to find out where things stand, write the same thing three times, and disagree with each other.

Three things replace that:

1. **A table** says what each piece of work reads, makes and checks. It is the only place that says so.
2. **A log** records what happened, one line an event. Hooks write most of it. Nobody edits a line.
3. **Views** are computed from the two: what an agent reads, what is open, what runs next, whether the story
   is done. Nobody writes a view by hand, so no view can be wrong about the files.

An agent does its work. It writes down only what no program can see: why it changed something, what it needs
from somebody else, and that it is stuck.

## Each problem and its cause

| Problem of the Joan run | Cause | What ends it |
|---|---|---|
| Agents load 100k to 180k before they work | what a role reads is fixed by role, in prose | the table, by task (1) |
| A recheck reads whole lists of old faults | history and open work are one file | a view of what is open (3) |
| A fix is written three times, by hand | the record of a change is typed | a hook takes it from the edit (2) |
| Status and faults can disagree | both are typed | both are computed (3) |
| The overseer reads 257 reports | a manager learns the state from messages | it asks one command (4) |
| Captions and late markers went unchecked | "check again" is remembered | a changed file reopens its checker (4) |
| A stash and mid-run commits broke work | every agent may use git | one program saves (5) |
| Faults found late, in three rounds | the fact is in prose or in an id | the fact becomes a field (6) |

## 1. The table

One module, `scripts/pipeline.mjs`, holds one entry a role:

```js
'fact-checker': {
  check:   { kind: 'checker', step: 'facts', scope: 'section',
             settles: ['texts', 'captions', 'cards'],
             reads: ['rules', 'names', 'passages:600', 'pages', 'plan'], budget: 120 },
  recheck: { kind: 'checker', step: 'facts', scope: 'section',
             settles: ['texts', 'captions', 'cards'],
             reads: ['rules', 'since'], budget: 30 },
},
cartographer: {
  draw: { kind: 'maker', step: 'maps', scope: 'section', after: ['map-auditor.audit@all'],
          makes: ['pages', 'markers', 'routes', 'generator'],
          reads: ['rules', 'brief', 'names', 'plan:pages', 'plan:map'], budget: 80 },
  fix:  { kind: 'maker', step: 'maps', scope: 'section', reads: ['rules', 'asks'], budget: 25 },
},
```

An entry is a role and a task, since what a role is varies by task: `inputs.mjs` already tells a checker's
files apart by step, and a battle coordinator manages at one task and not at another. `scope` is `section`,
`all` or `battle`.

- It takes the place of what is spread out today: `INPUTS` in `role-inputs.mjs`; `CHECKERS`, `OPEN_TASKS` and
  `manages` in `inputs.mjs`; `STEPS`, `MANAGERS`, `FIRST_CHECK` and `taskWords` in `transcripts.mjs`, the last
  of which reads a role's tasks out of a sentence of its definition; the lists `brief.mjs` builds from regular
  expressions over the definitions; and the order written as code in `workflows/section.js`.
- **`reads`** names views (3). `brief.mjs <story> <role> <section> --task <task>` only makes those views and
  prints their paths.
- **`budget`** is the most the list may hold, in thousands of tokens, with the role's definition and notes
  counted in. A test fails where a list passes its budget, for each role and task, on the Joan story. The
  views `asks` and `since` grow during a run, so they also stop at a cap when they are made.
- **`makes`** says whose files are whose. **`settles`** names the one checker that has the last word on each
  kind of file: texts and captions the fact checker, markers and routes the map auditor. Each kind has one.
  `inputs.mjs` hashes these, as it does today from its own code.
- A script that changes files and is run by no agent, such as `images-place.mjs`, has an entry too.
- **`after`** says what must be done before a piece of work, for `next` to test. The order itself is the
  workflow's code.
- **`model`, `effort` and `maxTurns`** stay in each agent's definition, where the platform reads them. The
  table does not repeat them: one fact, one place. An entry gets one only as an override, where a task must
  differ from its role, and none does until a run measures the need. Managers keep the strong model.

## 2. The log

One file a section, `content/<story>/.plan/log/<section>.jsonl`, and `story.jsonl` for the rest. One event a
line, as JSON, added at the end. A line is never changed, so two writers cannot damage each other, no lock is
needed, and git merges it.

| Event | Written by | Holds |
|---|---|---|
| `start` | the hook as an agent starts | the agent's id and role; the dispatch joins it at `end` |
| `edit` | the hook after each tool call that changed a file | run, file, old text, new text |
| `end` | the hook as an agent stops | run, the files it changed |
| `why` | the agent | the edits it explains, severity, kind, source line, claim |
| `ask` | the agent | for whom, the file or page, what must change, the source line |
| `reply` | an agent or a manager | the ask, and `done`, `declined`, `agreed` or `again` |
| `block` | the agent | why the work could not be done |
| `note` | the agent | a question the sources leave open and how the work answers it |

- **A fault is an edit and its `why`.** The agent changes the file as it would anyway. The agent adds one
  `why` for the edits of a page, in one call. A `why` may hold several edits, in several files.
- **There is one capture, and it sees every change.** At least a quarter of the run's fixes never passed the
  `Edit` tool: generators write every map file, and one role has no `Edit` tool at all. So the hook after each
  `Edit`, `Write` and `Bash` call compares the story's folder with a snapshot and writes an `edit` event for
  each file that differs. It knows the agent, so each change has its author. A file that a generator writes is
  marked as made by it, and the edit of the generator explains it.
- `fault.mjs why` with no input prints the run's edits that have none, each with a number to name it by.
- A `why` is owed for an edit by a checker or a manager, and for an edit by a maker to a file its own entry
  does not `make`. A maker's work on its own files needs none. On the Joan run that is 709 edits: 14 to 18
  for a first check, one for a recheck.
- **An `ask` is work for somebody else.** It is what an `open` fault is today. One addressed to a manager or to
  the user is a question that waits for a ruling.
- The agent's five events go through `scripts/fault.mjs`, the only door, which checks each line.
- `block` and `note` are kinds of `ask` in the file, with nobody to answer them. `why` holds `introduced` too.

## 3. Views

Each is a command that reads the table and the log and prints, or writes a file under the Read tool's limit.

| View | Says | Replaces |
|---|---|---|
| `asks` | the open asks for one role and section | reading the fault list |
| `since` | others' edits to what a checker checks, since its last run | the fix log, `git diff`, `fixed`, `closed` |
| the line | `ok 2 0`: result, open asks, asks that wait for a ruling | the typed status |
| the report | a run's changed files, asks, notes and stale inputs | the report an agent writes |
| `next` | what can run now, and for whom | the order in prose and in the workflow's code |
| done | `next` lists nothing | a manager's judgement |
| the ledger | faults by step, kind and where they began | counts over hand-written lists |

The hook writes the report into `reports/`, in today's form, so what reads that file still does.

The views of sources stay as they are and gain parts: the section's part of `sources.md`, `ground.yaml` by
section, each page's passages in a file of its own, a table of the map's frames, the claims without quotes.

## 4. What a manager does

**A script drives, and `next` is the gate.** The order of a section is code in `workflows/section.js`, and it
stays there. A workflow script decides what runs next and keeps the agents' results out of any model's context,
which is the platform's own way to do this. So no manager loops, waits or wakes. The script asks each agent
for its line as checked fields (`schema`), and it may not end while `next` lists anything for its section.

A manager is left with what needs judgement: it starts the script, rules on the asks addressed to it, and
reads `next` before it reports. The overseer does the same for the story, and starts each step in a fresh
session where it can: it holds no state, so nothing is lost.

`next` lists, from the table and the log:

- a maker that does not stand (`skip-spec.md`), once what is `after` it is done;
- a checker that does not stand: its first task, or `recheck` where it has passed before;
- an owner with open asks, for a `fix`;
- an ask that was answered and whose asker has no `recheck`, for the manager to agree to;
- an ask addressed to the manager.

- **Nothing changed goes unchecked.** An edit to a file reopens the one checker that `settles` that kind of
  file, unless that checker made the edit. So a caption the image finder writes lists the fact checker, and a
  marker added after an audit lists the map auditor. No rule has to remember either.
- **It ends.** An edit reopens one checker and never its author. An edit with a `why` never reopens the maker
  of the file: `inputs.mjs` settles that today with `agree`, and the rule stays. A checker has three rounds a
  step. What is still open then becomes an ask to the manager.
- **A finder's own fix is not rechecked,** unless the file is another checker's to settle.
- The first draft of this rule reopened every checker of a file. Replayed on the Joan run it listed 41
  rechecks against the 23 that were made, and left 18 of 21 checkers open at the end.
- A manager that holds no `Agent` tool writes a `block`, and the overseer stops the run.

## 5. Saving

- `scripts/save.mjs` is the only program that runs `git add`, `commit` and `push`. A hook refuses every `git`
  command that writes, in every agent.
- In a cloud session one hook ends a run, in this order: it writes `end`, closes the run's record, and saves,
  with a retry where another save holds git. So what a lost container costs is only work that had not ended,
  and that work would run again in any case. In the Joan run 108 of 147 records were never closed, because
  they were closed from the manager's side. Closing at the agent's own stop ends that.
- The stop hook refuses a last message longer than one line: the platform hands it to the manager whole.
- The overseer calls it with a message as a step ends. On a laptop nothing saves by itself.

## 6. Facts as fields

A check by script needs its fact as data. Each line is a field to add and the check it allows:

- a zone's `from` and `to` dates, in place of a date inside its id: a page dated outside a zone it shows;
- a story rule as a `forbid` pattern with its message, in `rules.md`: the rule on every built page at once;
- a page's `points`, each one sentence with its claim ids, in place of an `account` longer than the page: a
  limit on a plan, and a body that is written once;
- a generated file's generator: the file on disk equals what its generator writes, which finds a placeholder
  left in a generator and a generated file patched by hand;
- an image once on a page; a place the body names with a marker or a zone on the page; each body's words.

## 7. Lookups

Each definition gains the documented sentence that asks for independent tool calls in one turn. A lookup tool
takes a list and writes to a file of the caller's own. `find-in-sources.mjs` takes many terms and
many line ranges in one call. This is the one cost of the run that a data structure does not end: it is a habit,
so the tool makes the cheap way the easy one.

## What this removes

- From the second draft: the states `fixed`, `closed` and `held`; the archive and its rules for closing; the
  lock; edits made by a script that searches for the old text; the timer that saved; the setting that turns
  background tasks off.
- From the pipeline: the report an agent writes; the fault list and the fix log as files agents write; the
  `commit` line; the hook that tests a report's form; the tasks and inputs read out of prose.
- The lists of the Joan story stay as they are. They are its history, and nothing converts them.

## The nine decisions

| # | Decision | Here |
|---|---|---|
| 1 | a return of three parts | kept: the line, computed from the log |
| 2 | nested agents assumed; a manager without `Agent` stops the run | kept |
| 3 | lists by task; closed faults archived | lists: kept. Archive: **not needed**, no agent reads history |
| 4 | `fault.mjs` is the only door, YAML with a lock | door: kept. Storage: **lines added at the end**, no lock |
| 5 | no replay set | kept |
| 6 | a finder's own fix is not rechecked | kept, and now follows from the data |
| 7 | wide window for the checker, narrow for the writer | kept: `passages:600` and `passages:300` |
| 8 | no agent commits; a cloud run is saved | kept: saved as each run ends, not by a timer |
| 9 | `unresolved` is only what waits | kept: an ask addressed to a manager or the user |

Decisions 3 and 4 are the user's own. The user's word on the two changes marked above, on 27 Nov 2026: "do
whatever you think is best". So both stand as this draft has them.

## What must be true of the platform

Read in the Claude Code documentation on 27 Nov 2026. "Test" marks what the documentation leaves open.

| The design needs | The documentation says |
|---|---|
| a hook in an agent knows which agent | yes: `agent_id` and `agent_type`, before and after a tool call |
| the hook after an `Edit` gets the old and new text | yes: `old_string` and `new_string`; a `Write` gives the content |
| a hook as an agent stops | yes: `SubagentStop`, with the agent's transcript and its last message |
| which dispatch an agent belongs to | the stop hook reads it from the agent's transcript, as it does today |
| hooks of the repo run in the cloud | yes, in a session of one repository; `CLAUDE_CODE_REMOTE` is `true` there |
| a hook may take seconds | yes: 600 seconds by default; hooks of one event run side by side |
| a wait in one call | at most ten minutes, then the call moves to the background |
| a waiting agent keeps its cache | a subagent's cache lives 5 minutes; `experimental.cacheTtl: 1h` in a definition |
| nested agents | depth 3 by default; a project's value "applies in most sessions". **Test** in the cloud |

**Tested on a laptop, 27 Nov 2026,** with a hook that wrote down what it received, in one session with one
foreground and one background subagent (Claude Code 2.1.332):

- Every hook inside a subagent carries `agent_id` and `agent_type`, before and after a tool call.
- After an `Edit` the hook gets `old_string` and `new_string`, and also the file as it was (`originalFile`)
  and the patch (`structuredPatch`). After a `Write` it gets the same two.
- `SubagentStop` fired for the background agent as for the foreground one, with its transcript's path.
- A `Bash` call that changed a file told the hook nothing of the change. So the capture by comparing the
  folder is needed, as 2 says.
- The hook after an `Agent` call gets the agent's id: at once for a background agent, at the end for a
  foreground one. A `SubagentStart` hook gets the id and the type and nothing of the dispatch.

So every `edit` event carries the agent's id, and the `start` event is written by the stop hook's side of the
same run: nothing depends on the agent's first command. Still open, and only testable in the cloud: nested
agents, and a push from a hook.

One setting, `subagentPromptCacheTtl`, gives every subagent the longer cache, in place of a line in each
definition. **Test** also that a hook can push from a cloud session.

## What data does not reach

- The overseer's 18M came mostly from having no leads. Decision 2 assumes that is over.
- Research, the largest step, gains only the lookup tool and the smaller lists.
- One lookup a turn is a habit. A cache is lost on a wait of over five minutes.

## Order of work

The first slice proves the model on one section, 050, which also closes two gaps of the story:

1. **The test of the platform:** done, see "What must be true of the platform".
2. **The table** for the roles of a section, with reads by task, and the test of budgets.
3. **The log:** `start`, `end` and the capture; `ask`, `reply` and `why`; the views `asks`, `since` and the line.
4. **The proof:** the caption check and the map recheck that section 050 never had, run this way. It should
   show a recheck under 0.2M, no hand-made YAML, and a gate that lists both gaps.

Then: the table for every role; `next` as the gate of each section and of the story; `save.mjs`; the fields
of part 6 and the lookup tool, one at a time.

## How the next run tests it

- No agent writes a report, a fault list or a commit. No transcript holds a hand-made YAML entry.
- The overseer costs under 6M and stays under 250k.
- A recheck costs under 0.2M on average. No list passes its budget, and no Read fails.
- Each file changed after its settling checker passed has a later recheck in the log, and no more than that.
- A fact check takes 25 turns or fewer on average.

## The review of this draft

A fresh agent, 27 Nov 2026, replayed the model on the Joan run's 661 faults and 826 fix entries. It read no
transcript.

- **The model holds.** Every fault replays as an event: 597 as an edit with its `why`, 64 as an ask with its
  reply.
- **The rule for rechecks was wrong:** it reopened every checker of a file. Now one checker settles each kind.
- **Capture by the `Edit` hook alone missed a quarter of the changes.** Now one capture sees every change.
- **The table was keyed by role.** It is keyed by role and task. **The order was wrong:** the table comes first.
- **Cut for now:** `next` as the driver, `block` and `note` as events of their own.
- **Not verified:** the share of changes by tool, the size of any view, a stop hook for a background agent, a
  push from a hook, `experimental.cacheTtl`.

## Against the published practice

A search on 27 Nov 2026 read Anthropic's posts on agents, harnesses, context and tools, and the Claude Code
pages on workflows, subagents, hooks, costs and caching.

- **It agrees with them on:** start-up lists cut to the task; work in files with a light reference returned;
  state as data behind one door; hooks for what needs no model; a checker apart from a maker, with capped
  rounds; state computed from a log.
- **Taken from them into this draft:** a script drives and no manager loops; the return as checked fields;
  `model`, `effort` and `maxTurns` in the table; one cache setting; the sentence for parallel tool calls; a
  fresh overseer session a step.
- **Not taken:** an evaluation set of about twenty real cases with a judge. The sources call it the first
  thing to build. Decision 5 is the user's and stands until the user says otherwise.
- **Their warning that fits this design:** "the simplest solution possible", and that each part of a harness
  "encodes an assumption about what the model can't do". So the first slice is one section, and a part that
  the slice does not prove is not built.

## What is built, and the proof

On the branch `pipeline-table-log-views`, 27 Nov 2026. Nothing is committed. `node --test scripts/` passes, 64
tests, 28 of them new.

| Piece | File | State |
|---|---|---|
| the table, for all 18 roles of the pipeline | `scripts/pipeline.mjs` | built, tested |
| start-up lists by task, and the budget test | `scripts/brief.mjs`, `scripts/pipeline.test.mjs` | built, tested |
| the log, `why`, `ask`, `reply`, and the views | `scripts/fault.mjs` | built, tested |
| the capture of every change | `hooks/capture.mjs` | built, tested, on in the settings |
| the end of a run, and the report made from the log | `hooks/agent-end.mjs` | built, tested |
| the gate | `scripts/next.mjs` | built, tested |
| the one program that saves, and no git in an agent | `scripts/save.mjs`, `hooks/commit.mjs` | built, tested |
| passages a file a page, and the writer's window | `scripts/passages.mjs` | built, tried on 050 |
| lookups of many terms and ranges in one call | `scripts/find-in-sources.mjs` | built, tried by hand |
| the notes | `agents/log.md`, and lines in four other notes and 19 definitions | written |

A story is on the log once it has the folder `.plan/log/`. Any other story runs as before.

**The six roles of a section have lists cut to each task.** The other twelve read what they read before, less
the fault list and the fix log. Seven views are still over what one Read gives, and the budget test names them:
the whole digest, `names.md`, `sources.md`, a section's digest slice, the planners' passages, and the map
keeper's border lines.

### The two proofs, on section 050 of the real story

Both are checks that the Joan run never made. Each was one agent, task `recheck`.

| | A recheck of the Joan run | The caption check | The map recheck |
|---|---|---|---|
| start-up list | 102k to 118k tokens | 19k | 25k |
| peak context | 100k to 200k | 47k | 85k |
| turns | 14 to 18 | 10 | 25 |
| weighted tokens | 0.37M to 0.56M | 0.13M | 0.31M |
| faults found and fixed | | 3 | 4 |

- **The caption check** read its whole list in one turn and fetched the ten Commons pages in one command. It
  found a date the source does not give, a church called a priory church, and an illustration called a drawing.
- **The map recheck** took captures of the section and found that the notes of four markers added after the
  last audit were long enough to push their labels away. It shortened them in the generator and ran it again.
- In both, each fix is in the log once, with its old and new text, its reason and its source. No agent wrote a
  fault, a fix-log entry or a report. Each ended with `ok 0 0`, and the gate then listed nothing for 050.
- The map recheck is over the aim of 0.2M. It spent turns finding by `git` what had changed, since the changes
  it was sent to look at were made before there was a log. On a story built on the log the view `since` holds
  them.

### A correction: the start-up load of a first run

The first measurements of this work were made on a machine without the story's sources, where the passages
files hold no text. With the sources fetched, a first run reads far more than was first written here:

| Task | Measured without sources | With sources |
|---|---|---|
| fact-checker, check | 85k | 153k |
| section-writer, write | 79k | 112k |
| fact-checker, recheck | 19k | 19k |
| map-auditor, recheck | 25k | 25k |

So what the table saves a first run is the fault list and the fix log, about 35k tokens, and no more. The
passages are most of what a writer and a fact checker read, and cutting them is the next gain: the window, or
only the pages a run works on. A recheck and a fix read no passages, and their numbers stand. The budgets in
the table are set with the sources fetched.

### The check for placeholders and generated files

The review named two page generators that still held image placeholders. A third, `pages010.cjs`, held five,
in a form the search had missed. So there is a script now, `scripts/generated-check.mjs`. It finds a
placeholder left anywhere in a story, and it runs each page generator and reports a file that differs from
what the generator writes, putting every file back. `images-place.mjs` now switches the placeholders in the
generators too. On the Joan story both print `ok`.

### What the proofs showed and what was fixed for it

- The stop hook wrote the whole report file again to add its entry. It adds the entry at the end now.
- A generator writes every file of its section again, and each one was taken as a change: 60 events for four
  real ones, and the agent was asked for a reason for each. The capture compares what a file holds now, and a
  generated file owes no reason.
- `since` counted from the checker's last event of any kind. It counts from the end of its last run.

### A whole section built by the workflow

`workflows/section.js` runs on the log. It reads each agent's line, and after the first runs it asks the gate
and dispatches each fix and recheck the gate lists, until it lists none. A workflow runs no command, so a small
agent runs `scripts/next.mjs` and hands back what it printed. `scripts/section-workflow.test.mjs` holds its order
and its settling with agents that are not real.

Section 050 of the Joan story was unbuilt in a copy of the repo and built again by the workflow, in a session
with no person in it:

| | |
|---|---|
| Time | 45 minutes |
| Runs | 11 of the six roles, and 6 calls of the gate |
| Weighted tokens | 5.7M, 0.95M a page |
| Left at its end | 3 lines `agree`, which are the lead's to answer |
| After `images-place` | `harita check`, `generated-check` and `rules-lint` print ok |

The gate found the two rounds of fixes by itself: one fix by the cartographer after the map audit, and one after
the review, each with the rechecks of the checkers whose files it touched.

The first try failed, and showed what no test with made-up agents could. A workflow hands an agent its task
under a line of its own, with every line moved in. The hooks could not read that as a dispatch, so no end was
written to the log and the agent fell back to the old report. `unframe` in `scripts/transcripts.mjs` reads it
now. Two smaller things came with it: a section's generator belongs to its section's log, and `group.yaml` is a
generated file.

A session started with `claude -p` ends when its first turn ends, and takes the workflow with it. One that
drives a workflow has to wait on it.

### The order as data: `needs`

The order of the work was code in the workflow and prose in the notes. It is one block of the table now:
`NEEDS` in `scripts/pipeline.mjs` says, for each first run, the tasks its work is made from.

- `graph` makes the nodes of a section's build from it, a battle's task once for each battle with phases, and
  `waves` puts them in order. Needs that go round in a circle are an error that names the circle.
- `node scripts/order.mjs <story> <section>` prints the order, and with `--all` the order of the whole pipeline
  from the survey to the story audit, in 19 waves.
- `workflows/section.js` has no order of its own. It is handed the graph, and starts each task once the tasks
  it needs have ended. A blocked task stops the tasks that need it, and they are returned as not started.
- A fix and a recheck have no needs. They are reactions, and the gate lists them from the log.

So there are two sources of what runs next, and both are data: the needs for a first run, the log for what
follows it. The first use of it: the fact check needs the image finder, since a caption is text it checks. In
the section build above the two ran side by side, and two images changed under the check.

Only the section's build is driven by the graph so far. The steps before it, from the survey to the shared map,
have their needs in the table, and the overseer still dispatches them by its notes.

### One fact checker a page

In the section build the fact checker's first check reached 343k tokens of context and cost 2.0M of the
section's 5.7M. The table marks that task `per: 'page'` now. The graph has a node for each page, the review
waits for them all, and `scripts/brief.mjs --pages <id>` cuts the start-up list to the page: its passages, its
built files with its markers and its card, its captions, and its part of the text plan.

Six fact checkers on the finished section 050, side by side:

| | One checker | Six, a page each |
|---|---|---|
| Weighted tokens | 2.0M | 2.3M |
| Time | 13 minutes | 5 minutes |
| Largest context | 343k | 89k to 143k |
| Turns | 45 | 15 to 19 each |
| Faults fixed | 14 | 25, in a text checked twice before |

It is not cheaper, and the guess that it would be was wrong: a checker with room looks up more, so the tokens
went from sending a large context again to reading more sources. It is faster, no checker ends with a full
context, and it found more. About 10 of the 25 come from a rule on naming witnesses that was added to the
definition between the two runs, so the fair count is about 15 against 14, on a text with its easy faults gone.

What came with it:

- `node scripts/fault.mjs why ... --from <file>` takes every reason of a run in one call. It writes nothing
  unless every entry is right, and names each problem. In the build above the checker spent ten turns on its
  reasons. Here each gave them in one.
- The end hook asks an agent for the reasons of its own edits, by the id of its run, since two agents of one
  role now work in one section.
- The fact checker's list holds each page's `markers.yaml` and battle card. Its definition tells it to check
  both, and the list did not give them.
- Agents that work side by side change a shared file with `Edit` alone, which refuses a file that changed since
  it was read. `agents/log.md` says so. A change a command makes has no such guard.

### Not built

- **Zone dates as fields, story rules as patterns, a plan's `points`** (part 6). Each changes a schema and the
  work of a role, and none was needed for the proofs.
- **The definitions' own steps** still tell an agent to write a fault list and a report. On a logged story
  `agents/log.md` overrules them. They are to be cut down once a whole section has run on the log.
- **Attribution of a change made by a command** where two agents run commands in the same second.
- **Not tested, and only testable in the cloud:** nested agents, and the save from the stop hook.

## The full scan of the Joan story

27 Nov 2026, on the log, after the two proofs. Every section's texts had been changed since its last fact check
(the rule "Only the story"), and six sections' maps since their last audit. Nobody had rechecked either.

| Wave | Agents | Weighted | Each | Faults found and fixed |
|---|---|---|---|---|
| fact checkers, the texts and the captions of all seven sections at once | 7 | 2.56M | 0.37M | 26 |
| map auditors, all seven sections, four and then three at once | 7 | 1.27M | 0.18M | 2 |

- **The fact checks** found one fault marked `wrong`, the title of a judge in section 060, and 25 marked
  `weak` or `taste`: captions that say more than their Commons page, sentences that overstate their source,
  and a name's first mention that had moved when the texts were cut.
- These were no plain rechecks: each also read its section's captions for the first time, and looked into
  the sources, which one of them fetched. A plain recheck is the caption check of 050: 0.13M.
- **The map rechecks** came in under the aim of 0.2M on average. They found a label pushed off its marker in
  030 and a marker of the wrong colour in 040.
- **Fourteen agents ran side by side in one tree** with no collision, no commit and no hand-written record.
- **The gate** then printed: `nothing: joan-of-arc is done, as far as the log says`. `generated-check`,
  `harita check` and `rules-lint` print `ok`.

What the scan showed in the build, each fixed:

- The reports the stop hook writes were taken by the capture for changes, and three agents spent a reason on
  them. Reports are left out of the capture now.
- A change made in a session with no capture hook is put down to the next session that runs a command. So the
  main session's own changes owe no reason: they are recorded, and they are the user's or the overseer's hand.
- A file that commands changed and changed back counted as two changes for its checker. The capture now keeps
  what a file held, and such a file counts as unchanged.
- One reason in the log is wrong in its words and has its correction after it: a line is never changed.
