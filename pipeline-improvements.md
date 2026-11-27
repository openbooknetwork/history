# Pipeline improvements, from the Joan of Arc cloud run

A report on what to change in the story pipeline, drawn from the transcripts of the run that built `joan-of-arc`
(session `b2454564`, 26 November 2026) and from the run's own `feedback.md` and `notes.md`. It is a draft for
review. Nothing in it is done yet.

## How it was made

- The 17 packs of `transcripts-pack/` were unpacked to `.cache/transcripts/`: one overseer and 146 subagents.
- Numbers come from `scripts/token-ledger.mjs` and from small scripts over the raw transcripts (turns, context per
  turn, tool calls, errors, what woke each turn).
- The overseer's transcript was read as a timeline. Four reader agents read the subagents' transcripts by group
  (research; fact checks and reviews; maps and battles; plans, texts, images, edit and audit).
- "Weighted" is the ledger's scale: input x1, cache write x1.25, cache read x0.1, output x5.
- Limits. No reader read every transcript in full: each read some runs whole and the rest by counts. Thinking text
  is not stored, so claims about thinking rest on output-token counts. Savings are estimates, they overlap, and
  they must not be added up. Items marked **measured** come from a count; the rest are **estimated**.

## The run in numbers

| | |
|---|---|
| Agents, turns | 147 agents, 4,030 turns |
| Weighted tokens | 131.1M, or 3.0M a page (44 pages) |
| Cache read | 705M tokens = 70.5M weighted, 54% of the run |
| Cache write | 28.4M tokens = 35.5M weighted, 27% |
| Output | 5.0M tokens = 25.0M weighted, 19% |
| Wall clock to the pull request | 489 minutes; in 273 of them one agent or none was running |
| Models | overseer on Fable 5.2 (18.4M), every subagent on Opus 5.5 (112.5M), all at effort high or medium |

Costliest role and task pairs (**measured**):

| Role, task | Agents | Weighted | Each | Turns each | Context at turn 6 | Peak |
|---|---|---|---|---|---|---|
| overseer | 1 | 18.4M | 18.4M | 390 | 114k | 722k |
| researcher, claims | 7 | 15.6M | 2.23M | 66 | 70k | 345k |
| fact-checker, check | 8 | 11.5M | 1.44M | 41 | 134k | 278k |
| section-writer, write | 7 | 8.3M | 1.18M | 35 | 145k | 252k |
| research-reviewer, review | 7 | 7.8M | 1.12M | 30 | 81k | 283k |
| section-coordinator, plan | 8 | 7.7M | 0.96M | 22 | 160k | 237k |
| map-auditor, audit | 8 | 7.6M | 0.95M | 25 | 161k | 221k |
| fact-checker, plan-check | 8 | 6.7M | 0.84M | 30 | 114k | 188k |
| section-reviewer, review | 8 | 6.0M | 0.75M | 21 | 153k | 211k |
| fact-checker, recheck | 14 | 5.2M | 0.37M | 18 | 99k | 124k |
| every recheck and fix task together | 48 | 17.3M | 0.36M | | | |

Three facts explain most of the bill:

1. **Cost is mostly context times turns.** An agent pays 0.1 for what it holds on every turn it takes, and 1.25
   once for each token it loads. So the levers are a smaller start-up load and fewer turns at full size. For a
   short agent the load itself is a large part of the cost. Caching mostly works: a count after the review found
   about seven turns that wrote a whole context again (about 1.6M weighted), see G.
2. **Agents load 100k to 180k tokens before they start work**, from a reading list that is the same for a first
   run, a recheck and a one-line fix.
3. **Then they take many small turns at that size**: one `grep` or `sed` a turn, one file written a turn, one
   check a turn.

## A. Start-up load

### A1. `brief.mjs` does not know the task (new, measured)

- `node scripts/brief.mjs <story> <role> <section>` prints one reading list a role. A map recheck was told "21
  files, 3557 lines" and held 163k tokens before its first check (agent `ad7e1a8a`, 12 turns). A fact recheck
  gets the same 26 files as a full check, the passages included.
- Small jobs pay full price: the Patay re-plan loaded 166k to change three lines; five research `add`, `fix` and
  `recheck` runs peaked at 106k to 187k for 2 to 5 lines.
- The fix runs that ignored the list show the floor: cartographer fixes that only grepped their own faults peaked
  at 25k to 54k and cost 0.19M each.
- **Change.** `brief.mjs <story> <role> <section> <task>`. For `fix` and `recheck`: the agent's own open faults
  with their fix entries, the files those faults name, and nothing else by default. No research slice, no brief
  slice, no passages.
- **Estimated saving:** a large share of the 17.3M spent on rechecks and fixes; the readers' sums give 4M to 6M.

### A2. The fault list and the fix log are read whole by everyone (new, measured)

- `faults/<n>.yaml` and `fixes/<n>.yaml` grow all run: 55k to 102k and 37k to 70k characters a section at the
  end. Nearly all of it is closed history of other roles.
- Every role's list names both. An image finder loads 54k to 70k characters of them and needs none. All eight
  reviews load 107k and then report "no open fault of mine". A cartographer's first draw loads them too.
- A fact recheck reads 119k characters of the two, about 45k tokens of a 100k to 150k peak.
- Each fault carries the whole old line and the whole new line, in the fault list and again in the fix log.
- **Change.** A script, say `faults.mjs open <story> <section> --owner <role>`, is the only way a role reads
  faults. The dispatch names fault ids. `old` and `new` hold the clause, not the line.
- **Estimated saving:** 4.5M in fact checks and reviews, 1.4M in plans, texts and images, 1.2M in maps.

### A3. The passages pack cannot be read as told, and is too big (new, measured)

- `passages-<n>.md` is 200k to 370k characters (about 100k to 170k tokens). The notes say "read it once, whole".
  The Read tool stops at 25k tokens, so the first Read fails (8 failed Reads over four research reviewers, 6 over
  the writers, 4 over the fact checkers) and the agent reads 5 to 9 slices, one a turn.
- Two fact checks went from about 155k to 310k tokens on this one file. Two others skipped it and searched by
  hand instead (see B1).
- Writers split: four read the pack (peak 248k to 332k), three read the research slice and cut passages with
  `sed` (peak 205k to 215k).
- The pack repeats the research slice, which the same agents also read.
- **Change.** `passages.mjs` writes one file a page, under the Read cap, with line numbers. The writer and the
  fact checker call it a page at a time. The research slice leaves the list of any role that gets the passages.
  `brief.mjs` lists no file over the cap, ever: `research.md` (about 460 KB) is on the lists of `names` and
  `story-auditor`, and the Read failed in all four of their runs.

### A4. Other whole files where a slice would do (new, measured)

| File | Who reads it whole | What they need |
|---|---|---|
| `sources.md` (58k chars, two Reads) | 16 of 22 research agents, the seven pre-plans | their section's 30 to 50 lines |
| `ground.yaml` (39k) | every section map audit and recheck | their section's zones |
| all seven `map.yaml` (147k) | map keeper (three runs), shared-map auditor | a table: page, date, frame, zones |
| `text.yaml` (31k to 43k) | image finder | the `images` lines, about 1.5k |
| seven `text.yaml` and `names.md` (about 326k) | editor at `texts` | each `section` part |
| `passages-040-part.md` (247k), `overseer.md` (28k) | battle coordinator | the battle's claims |
| `agents/report.md` (16.6k) | all 146 agents | the dispatch and report forms |

- **Change.** A slice for each, made by `brief.mjs` or `slice.mjs`. `report.md` is small on its own but is on
  every turn of every agent: a one-page card for workers would do.

### A5. Agents hunt for examples (new, measured)

- 6 of 7 researchers opened Alexander's `research.md` for the layout. 13 of 22 research agents read script headers
  though their card says "all you need". 20 of 22 read other agents' reports for the form. 5 of 8 reviewers ran
  `find /` for the map auditor's captures. 12 agents hunted for `.candidates/<section id>/`, a path the
  definition gives wrongly.
- **Change.** Each definition holds two real lines of its output and one filled fault. The dispatch names the
  captures folder. Fix the `.candidates` path.

## B. Turns at full context

### B1. One source lookup a turn (new, measured; the largest item among the subagents)

- A fact check spends 15.6 of its 41 turns on single `grep` or `sed -n` calls at 200k to 300k context. A plan
  check spends 12.5 of 30.
- The spread shows the gain. Check 030: 65 turns, 2.17M. Check 060 sent its searches together into files: 21
  turns, 0.85M, and it still found 21 faults.
- Researchers do the same. Researcher 070 took 95 turns with 84 Bash calls; 060 batched and cost 6.5M fewer
  context tokens.
- "Send those searches together" is already in the fact checker's definition. Six of eight checks did not do it.
  The fact checker's tool card names no search command, and nobody used `find-in-sources`.
- **Change.** A batch lookup script on every card: a short alias for each source, many `--lines a-b` and
  `--grep` in one call, the whole answer to a file in the agent's scratchpad (this also settles feedback 1 and
  2). Step 2 of the definitions: list every lookup of a page first, then one call.
- **Estimated saving:** up to about 4.6M in fact checks if every lookup turn went, which they cannot all do, and
  1M to 1.5M in research. The pair of checks compared above are different sections, so it is weak proof.

### B2. Every fix is written three times, by hand (new, measured)

- The edit, the fault and the fix-log entry each carry the same old and new text. 31 agents appended YAML with
  `cat >>` (60 calls), 29 wrote their own Python (85 calls), 35 checked the YAML themselves. Eight errors,
  and the overseer twice wrote an invalid list that the commit hook refused.
- The research reviewer must fix lines and has no Edit tool: all seven wrote one-off patch scripts (one call of
  20k characters).
- **Change.** One script, `fault.mjs add|fix|close`, that takes a fault with old and new, applies it, marks it,
  logs it with the commit and checks the YAML. Give the research reviewer Edit.
- **Estimated saving:** about 2M and 100 turns in fact checks alone.

### B3. Researchers write their part twice (new, estimated from output counts)

- The turn before each researcher's one big Write has 17k to 46k output tokens on a tiny command, then the Write
  of 20k to 29k. The part seems to be drafted in thinking and then written again. About 245k output tokens over
  seven agents.
- **Change.** `researcher.md`: append each page's lines as soon as that page is read.

### B4. Smaller turn costs (new)

- Plan files written one a turn at 200k (4 to 7 turns a plan): write them in one turn.
- Word counts by hand: 21 agents, 35 calls, and four writers wrote a counter. `rules-lint.mjs --words`.
- Git forensics: 112 of the map agents' 1,691 calls, and 3.4 git turns in each recheck, find what changed.
  The task-aware brief should hand the diff over.

## C. The overseer

### C1. The overseer's context is never cut (new, measured)

- It starts at 82k and ends at 722k, with no compaction. Its 390 turns read 407k on average: 15.9M of its 18.4M
  is cache read. Reports and notices from agents are about 300k tokens of it, its own Bash calls about 100k.
- One return of the user after 90 minutes rewrote the whole cache: 597k tokens in one turn.
- **Change, to be chosen by the reviewer.** Either one overseer session a step, started from `run.json`,
  `decisions.md` and the reports on disk; or a compaction at each step's end with a written handover. The
  pipeline's state is already on disk, which is what makes this possible.

### C2. The cloud's Stop hook drives a quarter of the overseer's turns (feedback 6, now sized)

- **Measured:** 93 of 390 turns answer "There are untracked files, please commit and push", at 384k average
  context: 3.7M. 53 of the branch's 132 commits are named "in progress".
- The hook is not in this repository's `.claude/settings.json`. It belongs to the cloud environment, so the fix in
  feedback 6 ("the hook leaves `.plan/` alone") may not be ours to make.
- It also causes C4 and E1: a mid-run commit sweeps in other agents' half-made edits.
- **Change.** Find where the hook is set and whether a project can turn it off or narrow it. If not, agents write
  work in progress outside the tree, or to ignored paths, and move it in when the step ends.

### C3. Managers cannot dispatch in the cloud (feedback 5, confirmed)

- `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` in the cloud session. The setting of 3 in `.claude/settings.json` is
  untested. With section leads working, each section's reports stay out of the overseer's context: this is the
  designed answer to C1 and it did not run.
- **Change.** Test it first, with one cheap session. Everything in C1 depends on the answer.

### C4. Waiting costs turns (new, measured)

- 258 turns answer an agent's report, one report at a time, each with a status line for the user and often a
  commit. 42 "the user has not heard from you" reminders add more.
- `Agent` calls with `run_in_background: false` still started in the background.
- **Change.** For the reviewer: is there a way to wait for a whole wave in one turn?

## D. Rework that an earlier step or a script would prevent

### D1. The plan's `account` is a first draft, longer than the page (new, measured)

- An `account` runs 2.0k to 3.1k characters a page, about 450 words. The page's hard cap is 350 words. So the
  text is written twice, and the writer's job becomes cutting.
- Every writer overshot. Writer 030's first drafts: 360, 429, 353, 386, 342 words. Writer 050 wrote all six pages
  twice. 10 to 14 trim turns a writer at 200k.
- 40 of the 44 final bodies are over the soft limit of 300 words (mean 324).
- **Change.** Cap `account` in `text.schema.json` (about 900 characters, or a list of facts with claim ids).
  `plan-check` enforces it. A page that needs more is split at the outline.

### D2. One kind of map fault, found in three rounds (new)

- A zone stage shown on a page dated after a town changed hands: found at the first audit (Bray), at the recheck
  (Melun, Sens, Soissons) and at the 040 audit (Jargeau, Orléans). The digest held every date from the start.
  This is two of the map keeper's four fix rounds.
- **Change.** A `stage-check.mjs`: each page's date against each stage, with every dated claim between them.

### D3. The shared map is drawn and audited blind (new)

- `audit-pack --zones` stops with "no pages" until a section is drawn. The keeper wrote its own SVG renderer
  (about 12 turns at 305k to 342k). The shared-map audit and its recheck read no image at all.
- A third keeper round fixed bare land that only showed on section 020's captures.
- **Change.** With no page folders, `audit-pack.mjs` builds stub pages from each `map.yaml`.

### D4. Layout faults a script can see (new)

- At least 13 faults over four sections: the legend covers a corner, a long note pushes a label away. Each one
  found at a recheck costs a new pack at about 200k.
- **Change.** `plan-check.mjs` already measures pixels: add the legend box, the attribution box and note length.
  `units-check.mjs` tests label boxes for battles (one label fault there took three rounds).

### D5. Rules made mid-run are not swept back (new)

- 20 of the editor's 27 faults are two rules written after the sections they broke were built: an image shown
  twice on a page (12), and "at the retrial" with a year (8).
- **Change.** `rules-lint.mjs` checks both, and the overseer runs it over built sections when it adds a rule.

### D6. The edit recheck finds nothing in the edits (new, measured)

- Six fact-checker runs after the editor (0.37M each) found no fault in about 25 editor fixes. They found caption
  faults and wrong commit ids, which are other jobs (see F1).
- **Change.** A script compares each fix-log entry with the file. A fact checker reads only edits that add or
  change a fact.

### D7. Faults found late that a check could find early (new)

- 4 of the story auditor's 18 faults are places a text names with no marker on the map.
- **Change.** A scripted check at `facts`: every place named in a body has a marker or a zone on its page.

### D8. `names-check` (feedback 10, sized)

- 16 agents ran it; 8 reports carry its false alarms; about 10 turns of writer 030; then a `names` fix run of 32
  turns. The proposed change of feedback 10 stands.

## E. Many agents in one working tree

### E1. Stash and sweeping commits (partly new)

- Two agents ran `git stash` in the shared tree while others wrote (`a55006b2` at 16:53, and reviewer `ac83a5c9`
  around `names-check`). One fixer lost 7 of 22 turns to it.
- Five fact runs had edits swept into another agent's commit and repaired commit ids in the fix log.
- Two research reviewers rewrote the shared `sources.md` by script in the same minutes. A lost update is possible
  and was not checked.
- Two cartographers of one wave both wrote `handoff/cartographer.md`.
- **Change.** `agents/report.md` forbids `stash`, `reset` and `checkout`, and a PreToolUse hook denies them.
  Only the manager commits. One writer a file: handoffs become `handoff/<role>-<section>.md`. The fix log stops
  naming commits, or a script fills them in at the step's commit.
- A copy of the tree for each agent would end the whole class. Git worktrees are ruled out for this project, so
  it would be a plain copy or clone. This is a larger design choice and is left open.

## F. Quality gaps left in the finished story

These matter for the pull request now, not only for the next run.

### F1. Captions were checked by accident (new)

- The fact check runs before images are placed: 5 of 8 checks say "no images are placed yet". The edit rechecks
  then found 5 caption faults. Section 050 had no edit recheck, and its fact checker's reports do not name a
  caption or an image, so **050's captions were very likely never fact-checked**. Each of 050's runs should be
  read to settle it.
- **Change.** A `captions` task after `images-place`. For this story: one run on 050.

### F2. Map changes after the last audit were never seen (new)

- Four story fixes added 13 markers and report "I took no captures". One fix added markers on 010, 020 and 030
  and moved 020's frame. No map auditor ran after it. Sections 010, 030 and 070 had no map recheck.
- **Change.** A new marker or a moved frame gets a recheck of those pages.

### F3. The page generators still hold image placeholders (new, checked in the repository)

- `content/joan-of-arc/.plans/pages040.mjs` and `pages060.mjs` name 6 and 5 placeholders, not image ids. The
  pages are right today because `images-place` patched them. Running a generator again puts the placeholders
  back and the strict build fails.
- **Change.** `images-place.mjs` patches the generators, or the generators read `images/<n>.yaml`.

### F4. Close-in maps were judged from coordinates (feedback 8, widened)

- The Orléans auditor: "captures in this sandbox show no base map, so the Loire cannot be seen". A Rouen fixer
  says the base map draws no river at city scale, which is a different cause from the proxy of feedback 8. The
  Paris auditor judged river sides from `points.txt`.
- Also: the 6 second wait misses routes (two audits raised it by hand to 12 to 16 seconds), and hover captures
  run 390 px wide, so no tooltip showed in three battle rounds.
- **Change.** Test the cause before fixing. `screenshot.mjs` waits for the routes, not a fixed time, prints each
  failed request, and takes hovers at laptop width.

### F5. The reviewer adds facts with no source (new)

- Steps 1 and 2 of `section-reviewer.md` never apply: the checker has fixed everything by then. What the
  reviewer does is add "who is this" clauses. Rechecks found 9 faults in those.
- **Change.** Delete the two steps. An added fact carries its claim id, and the recheck reads only those.

### F6. Nobody checks the checker (new)

- A recheck confirms that fixes were "applied as written". Faults a recheck fixes itself get no second reader.
  One recheck saw its own rewrite flagged by `close-wording` at 67% and left it.
- No researcher checks that a quote carries its claim; researcher 060 said so and drew 28 faults.
- "Sample the rest, one line in three" is dead: 5 of 7 research reviewers report `sampled: 0`.

### F7. Open at the end

- 4 placeholders with no image, `story-editor-7` (Sens) open, two auditor faults declined, three name faults
  carried late, caption dates that rest on Commons alone.

## G. Wall clock

- 273 of 489 minutes had one agent or none running. The plans ran in waves of two sections (73 minutes for
  seven). The shared map was one serial chain of 100 minutes: draw 51, audit 16, a research addition, fix,
  recheck, fix.
- The keeper's draw had one thinking turn of 63k output tokens (10 minutes), 6 minutes waiting on `ground.mjs
  --osm` for no answer, and 6 minutes of `zones --like` one zone at a time.
- `fetch-candidates` takes 3 to 7 minutes: about half of the image finders' time. `audit-pack --battle` takes 3
  to 5 minutes, and five `sleep` calls to wait for it were blocked.
- **A wait of over five minutes costs the whole cache** (found after the review, measured). A subagent's cache
  lives five minutes. Three image finders waited 324 to 427 seconds on `fetch-candidates` and wrote 77k to 85k
  again; the map keeper waited 408 seconds and wrote 300k again.
- **Change.** Plan all seven sections at once if nothing orders them. `--osm` fails fast, `--like` takes many
  files. Long scripts print a ready line that an agent can wait on. No script an agent waits on runs over four
  minutes: split `fetch-candidates`, or run it before the agent starts.

## H. Model and effort

- Every subagent ran on Opus at effort high or medium. In a plan run about two thirds of the output is thinking
  (67.8k output tokens for about 20k tokens of files).
- **Not advised without a test.** One section at medium effort for the plan would size it. Mechanical tasks
  (a cartographer fix, an image fix, applying a fault list) are candidates for a cheaper model. Managers keep the
  strong model.

## I. The ten notes of `feedback.md`

| # | Note | Standing after the transcripts |
|---|---|---|
| 1 | `find-in-sources` writes to one file | confirmed; only 2 agents read the shared file; folded into B1 |
| 2 | `find-in-sources` shows too little | confirmed; folded into B1 |
| 3 | `quotes-check` and `)` or a comma | confirmed; first run failed for 5 agents |
| 4 | `research-gates` reads the merged digest | confirmed; 15 agents, about 20 failed calls |
| 5 | managers cannot dispatch in the cloud | confirmed, untested fix; see C3 |
| 6 | the Stop hook | sized at 3.7M and 53 commits; the hook is not the project's; see C2 |
| 7 | `harita sources` and bot walls | not looked at again |
| 8 | captures without a base map | a second cause is likely; see F4 |
| 9 | `images-place` and one-line lists | confirmed, and the generators are a second gap; see F3 |
| 10 | `names-check` | sized; see D8 |

## Suggested order

1. **Before the merge of this story:** F1 (050's captions), F2 (maps changed after their audit), F3 (generators).
2. **Cheap and large:** A1 and A2 (task-aware brief, open faults only), B1 (batch lookup), B2 (fault script).
3. **Test, then decide:** C3 (spawn depth), then C1 and C2 (the overseer and the Stop hook).
4. **Less rework:** D1 (cap the account), D2 to D5 (scripted checks), D6 (drop the edit recheck).
5. **Safety of the shared tree:** E1.
6. **Then measure again** on the next story before touching effort or models (H).

## Questions for the reviewer

1. C1: a session a step, or compaction with a handover? What does each cost and risk on this platform?
2. C2: where does the cloud's Stop hook come from, and can a project narrow or silence it?
3. C3: does a project's `env` setting beat the cloud's spawn-depth value? What else limits nested agents?
4. C4: can an overseer wait for a wave of agents in one turn, and why did foreground calls go to the background?
5. A and B: is "context times turns" the right model of cost here, and what does it miss (cache lifetime, the
   Read cap, parallel tool calls)?
6. H: which roles can drop to medium effort or a smaller model with the least risk?
7. E1: is a copy of the tree for each agent worth its cost, against rules and a deny hook?
8. What is missing from this report?

## The review

A second agent reviewed this report from the report, both `feedback.md` files and `notes.md` alone. It did not
read the transcripts. It read the pipeline's code and the public Claude Code documentation. Its points, in short;
the three it disproved or weakened are already corrected above.

### Verdict

- The cost model is half right. It explains the 54% of cache read and leaves out the 27% of cache write and the
  19% of output.
- **The overseer is ranked too low.** Its 258 turns that answer a report, at about 407k, are near 10.5M: the
  largest single item of the run, larger than B1.
- Most of the overseer's fix needs no answer from the platform, so "test, then decide" delays it for no reason.
- The report has no way to tell whether the next run is as good, and not only cheaper. This is its largest gap.

### Where it disagrees

| Item | Its view |
|---|---|
| A1 | Agree, but "no passages" for a recheck goes too far: keep the source lines each fault names |
| A3 | A page at a time adds turns. Cut the passages narrower and read all slices in one turn |
| B3 | Doubt. The cause is a guess from output counts, and appending a page at a time adds turns at 300k |
| C2 | Agree, but 3.7M is under 3% of the run. Its real harm is the swept commits |
| C3 | Test it, but C1 does not wait on it |
| D1 | Use a list of facts with claim ids, not a cap in characters. Alexander's run ran long too |
| D6 | Drop the edit recheck only together with F1: it found the only caption faults |
| E1 | Rules and a deny hook, yes. A copy of the tree for each agent, no: it breaks paths, hooks and merges |
| F4 | Doubt on hovers: Alexander's run says headless Chrome drew no hover label at any width |
| F6 | Needs a change: a second reader for a recheck's own fixes, and a script that picks the sample |
| H | Not last. Output is 25M. Test effort and models during the next run |

### Platform points

- **The overseer.** The model cannot call `/compact`. Auto-compaction can be made to fire earlier, and it loses
  detail nobody chose. A session a step loses nothing, but an unattended session cannot restart itself. Best
  first step: **agents return one line and a path.** That removes most of the 300k of reports.
- **A trap.** Fewer overseer turns with gaps longer than the cache's life cost more: one wake at 400k is 0.5M
  as a write and 0.04M as a read. Shrink the context first, then cut turns.
- **The Stop hook.** Not documented, likely managed by the cloud, and a project cannot turn a managed hook off.
  Do not plan to silence it. Give it nothing to find: no turn ends while agents run.
- **Spawn depth.** A project's `env` beats the shell's value in most sessions; a managed `env` beats the
  project's. So the setting may work. Test it.
- **Foreground agents.** `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` makes Claude wait. If that fails, start the
  wave in one message and make one blocking wait on "all report files exist".
- **One lookup a turn.** Many calls in one message cost one turn. The rule is already in `report.md` and six of
  eight ignored it, so a script is right and more rule text is not.
- **The Read cap** is 25,000 tokens and can be raised. Do not raise it: slice the file.
- **The deny hook.** `hooks/commit.mjs` already refuses `commit -a` in agents; adding `stash` is small. Also give
  agents what they wanted from the stash: a diff of their own paths.

### What it says is missing

- **An evaluation.** Replay a few finished tasks with planted faults and score how many each role finds. Without
  it A1, D6 and H cannot be judged.
- **A workflow script** in place of an overseer that waits: code that waits costs no tokens.
- **The dispatch hook can put the reading list into the agent's prompt**, which saves each agent its first turn.
- **Model by task, not by role:** a recheck needs its own definition or a model named in the dispatch.
- **`maxTurns`** as a cap: one researcher took 95 turns.
- **Research** is the largest step and gets thin remedies here. **Images in context** are not sized.
- **Old feedback is not tracked:** hovers, long texts and "no pages" appear in both runs' feedback.

### Its first ten

F1 to F3 come before all of these, since they concern this pull request.

| # | Change | Effect | Risk to quality | Proof on the next run |
|---|---|---|---|---|
| 1 | One-line returns; one wait a wave; no status line a report | large | low | overseer under 6M, peak under 250k |
| 2 | One probe session: depth, foreground, the Stop hook's source, cache life | unlocks | none | four answers |
| 3 | A1 with A2, keeping each fault's source lines | large | medium | recheck mean under 0.2M, recall not lower |
| 4 | B2 with B1 | large | low | a fact check in 25 turns or fewer, no hand YAML |
| 5 | A replay set with planted faults | none direct | lowers it | a recall number for each role |
| 6 | The scripts of D2 to D5, D7, D8 | medium | lowers it | fewer faults found after the first audit |
| 7 | A3: narrower passages, no file over the cap | medium | low | no failed Read, writer peak under 200k |
| 8 | D1 as a list of claims | medium | medium | first drafts under 350 words |
| 9 | Tree rules: the manager commits, a file per agent, deny stash | small | lowers it | no "in progress" commit |
| 10 | A cheaper model on fix and recheck, judged by 5 | medium | medium | same recall, lower cost |

### My view of the review

- I accept its ranking: the overseer's report turns go first, and the evaluation set must exist before any change
  that removes a check (A1, D6, H).
- Its doubt about the cache was right in part, and the count is now in G.
- Still unproven on both sides: B3, and what leads would save (C3). The probe session of its item 2 settles C3.

## Decisions taken while going through the items

### 1. An agent's return is a tuple of three (27 November 2026)

```
(result, open_faults, unresolved)
```

- `result` is `ok` or `blocked`. `blocked` means the work could not be done and there is nothing to build on.
- `open_faults` is the count of faults this run leaves open for another agent. A fault the run fixed itself does
  not count, so "all fixed" is 0.
- `unresolved` is the count of questions the sources leave open and of choices that wait for the user, whether or
  not the agent proposed an answer.
- The tuple replaces `status` and the pasted report in the hand-back. The full report stays in `reports/`.
- The two counts are computed from the fault list and the report file by a script when the agent ends, not typed
  by the agent, so they cannot disagree with the files.
- The overseer's rule: `(ok, 0, 0)` goes on without reading. Faults go to the fixer. Unresolved items are ruled
  on together at the wave's end. `blocked` stops the chain at once.

### 2. Nested agents are assumed to work (27 November 2026)

- The spawn depth of 3 in `.claude/settings.json` is taken as working. No probe session and no preflight.
- So the design is the one with section leads: a lead runs its section's agents and hands the overseer one tuple
  for the section.
- **If a manager cannot start agents, the run aborts.** The first manager that finds itself without the `Agent`
  tool reports `blocked`, and the overseer stops the whole run and tells the user. It does not take over the
  manager's dispatching, as it did in the last run.
- The other three platform questions (foreground wait, the Stop hook's source, cache life) stay open and block
  nothing.

### 3. The brief knows the task, and closed faults are archived (27 November 2026)

- `brief.mjs` takes the task. For a `fix` or a `recheck` the list is the agent's own open faults with their fix
  entries, the files those faults name, and the source lines each fault cites.
- Nobody reads the fault list or the fix log directly. A script prints the open entries for one role and section.
- **At the end of each step the section lead archives closed entries**, to `faults/closed/<n>.yaml` and
  `fixes/closed/<n>.yaml`. The live files hold only what is open, so a wrong read is cheap.
- Archive, not delete: the reviewer, the user, the editor and the story auditor read the history.
- "Closed" means fixed and rechecked. The order is: fix, the recheck passes, then archive.
- A script does the move. No reading list names the archive; the script reads it for one fault by id.

### 4. `fault.mjs` is the only door to faults and fixes (27 November 2026)

- One command, `fault.mjs add | fix | close`, with a way to list the open entries of one role and section. Given a
  fault with its old and new text, it applies the edit, marks the fault, writes the fix log and checks the YAML.
- No agent reads or writes the fault list or the fix log by any other means. The research reviewer fixes lines
  through it, so it needs no Edit tool for this.
- It also computes the counts of decision 1 and does the archive of decision 3.
- Storage: the YAML files as now, written only by the script, with a lock file for agents that write side by
  side. SQLite was considered and left open: a binary file gives no diff in a pull request and cannot be merged,
  and the storage can change later without any agent noticing.
- With it goes the batched lookup of item B1: one call that takes many lookups, a short alias for each source,
  and the whole answer written to a file in the agent's scratchpad.

### 5. No replay set (27 November 2026)

- The reviewer's planted-fault replay is not built.
- Consequence: a change that removes or weakens a check cannot be measured for quality. So those changes (dropping
  the edit recheck, a cheaper model for rechecks) need another reason to be trusted, or stay out.

### 6 to 9. Four questions of the spec's review, settled by judgement (27 November 2026)

The user's word was "use your best judgement". The reasons are in `improvements-spec.md`, "Settled by judgement".

- **6.** A fault its finder fixed is closed by the script when its step ends, after a test that the fix is still
  in its file. A fix that is gone with no later fault to explain it is reopened. Only a fault that another agent
  fixed waits for a recheck. This narrows decision 3's "closed means fixed and rechecked" to that second kind.
- **7.** The fact checker keeps its wide passage window of 600 characters. The writer's is narrowed to 300. A
  count after the next run can settle the checker's window with numbers.
- **8.** No agent commits. The overseer commits at each step's end. In a cloud run a hook saves the story's
  folder and pushes every ten minutes, at no cost in tokens.
- **9.** `unresolved` counts only what waits for a ruling. A question an agent answered itself goes under a new
  key, `answered`, and is not counted. This narrows decision 1, which counted an answered question too.

### 10. The design is a table, a log and views (27 November 2026)

`improvements-spec.md`, third draft, replaces the earlier drafts. Two earlier decisions change with it, at the
user's word ("do whatever you think is best"):

- **Decision 3, the archive:** not needed. No agent reads history: a view shows what is open.
- **Decision 4, YAML with a lock:** the storage is a log of lines added at the end, with no lock. `fault.mjs`
  stays the only door.
