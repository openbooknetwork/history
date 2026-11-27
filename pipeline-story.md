# Tuning a pipeline of agents: where it started and where it stands

Notes for a possible blog post, written on 26 Nov 2026. Every number here comes from a run saved in
`content/alexander-the-great/.plan/run/benchmark/`, and `roadmap.md` holds the detail. Where a number is a guess
or was never measured, this file says so.

## What the pipeline makes

Open History Book is a set of illustrated history stories. A story is some 50 to 70 pages. Each page has a map
with borders, routes and markers, a text of 150 to 350 words that cites its sources, and images. A battle may get
its own pages that show the armies step by step.

A story is built by Claude Code agents, each with one job: research the sources, decide the names, design the
map, plan each section, draw the maps, write the texts, find the images, check the facts, review. One story,
Alexander the Great, has 71 pages, 88 map zones and about 640 quoted passages from its sources.

## Where it started

**The first setup**, on the `main` branch, built ten stories. It had 18 agent definitions, 10 helper scripts and
about 5,000 words of working notes. One main session, the overseer, dispatched every agent by hand, read each
report and decided what came next. It worked, and it was expensive and hard to see into: nothing recorded what
an agent had read, which fault came from where, or what a page cost. It was never measured, so this file has no
figure for it.

**The redesign** was written as a spec and built in one cloud session: managers between the overseer and the
workers (a section lead for each section), one report form for every agent, fault lists and fix logs as files,
hooks that check a dispatch, and scripts that count tokens from the transcripts. At that point it had 22 agent
definitions and had never dispatched a single agent. `spec-status.md` said so in its first lines: "Nothing here
has built a story."

So the starting point of this work was a design that looked complete and had never run.

## How it was tuned

One loop, repeated about twenty times:

1. Run one step of the pipeline on a frozen input, with real agents, headless.
2. Count what it cost from the transcripts: agents, turns, tokens, minutes, faults found and left open.
3. Read the transcripts call by call to see where the turns went.
4. Change one or two things: a rule, a tool, a start-up list.
5. Run it again.

The benchmark is one section of Alexander: four pages, "Greece secured". Later runs took other steps one at a
time: a section's plan, its research, a battle, the shared map.

The cost measure is "weighted tokens": input counts 1, a cache write 1.25, a cache read 0.1, output 5. The fact
behind every saving is simple: **an agent's whole context is sent again on each turn**. A file read once is paid
for on every turn after it. So the cost of an agent is roughly its context size times its number of turns, and
the two levers are fewer turns and a smaller context.

## The numbers

### Building one section, four pages

| Run | Agents | Turns | Weighted tokens a page | Cost | Minutes | Faults found | Left open |
|---|---|---|---|---|---|---|---|
| 1 | 18 | - | 2,300,000 | - | three sessions | - | 11 |
| 2 | 21 | 510 | 1,860,000 | $23 | 59 | 38 | 6 |
| 3 | 15 | 282 | 1,350,000 | $18 | 53 | 33 | 8 |
| 4 | 13 | 227 | 1,200,000 | $17 | 67 | 20 | 3 |
| 5 | 17 | 298 | 1,240,000 | $17 | 62 | 29 | 0 |
| 6 | 9 | 137 | 690,000 | $10 | 28 | 26 | 0 |

From the first run that finished cleanly to the sixth: 57% cheaper, half the time, less than half the agents,
and no fault left open where six had been. The first run did not finish in one session at all.

### A battle: a section's plan, then three step-by-step pages

| Run | Agents | Turns | Weighted tokens | Cost | Minutes |
|---|---|---|---|---|---|
| 1 | 19 | 356 | 7,160,000 | $24 | 64 |
| 2 | 15 | 361 | 7,470,000 | $24 | 83 |
| 3 | 10 | 172 | 4,580,000 | $15 | 55 |

### The shared map: twelve zones drawn again

| Run | Agents | Turns | Weighted tokens | Cost | Minutes |
|---|---|---|---|---|---|
| 1 | 7 | 124 | 3,330,000 | $11 | 45 |
| 2 | 5 | 102 | 2,820,000 | $10 | 48 |

### The other steps, each run once

| Step | Agents | Turns | Cost | Minutes | Result |
|---|---|---|---|---|---|
| Page lists of three sections, and their check | 8 | 82 | $6 | 10 | three page lists, 11 faults listed |
| Names of the whole story | 2 | 26 | $6 | 13 | 604 names; 15 lines from the name check, where the old file gave 135 |
| Map design | 2 | 40 | $4 | 12 | 27 families and the table of zones, from nothing |
| A section's plan | 7 | 123 | $8 | 22 | a plan that passes every check |
| A section's research | 4 | 88 | $8 | 18 | 50 lines with 169 quotes, where the old digest had 21 with 47 |

All the runs together cost about $200.

### What was built along the way

- 43 scripts, where the first setup had 10. About 7,700 lines added to scripts, notes, definitions and hooks, in
  118 commits.
- Two engine changes: a page shows a labelled placeholder for a missing image or text and still builds, and two
  map icons that would overlap show one at a time.
- 23 automated tests of the tools the agents call.

## What made the difference

### 1. Turns, not tokens, are the cost

In the first runs about nine turns in ten held a single tool call, and the most common call was one small
lookup. Telling agents to batch their calls changed the first turns only. What changed the rest was **giving
them a tool that does a whole job in one command**:

| Tool | Replaced |
|---|---|
| a start-up list | reading ten to fifteen files, one a turn |
| a passages file | one search of a source book for each quote |
| an audit pack | eight checks, a build, a web server and four captures, one a turn |
| a contact sheet | opening each of about 200 candidate images |
| a ground tool | 17 calls to find the line of one river |

A rule in the notes asks an agent to behave. A tool removes the need.

### 2. Most faults were born before the step that found them

Of 71 faults in two runs, read one by one, 37 began in the plan. Each run found them again, because each run
started from the same plan. The fix was not a better checker at the end. It was a check of the plan before
anything is drawn from it, and scripts that find the mechanical ones (a marker too close to another, a zone
missing from a page) from the plan's own coordinates.

### 3. Who finds it fixes it

The first design had checkers that wrote a fault down and waited for a manager to rule on it. In one run a fact
checker wrote the exact new wording of eight plan faults and changed no file, because its notes said so. Two
fixers then pasted its wording in and two rechecks confirmed it: four agents for work already done.

The rule now is one sentence: whoever finds a fault fixes it there and then, and records the fault with its fix.
Only two things go to somebody else: work the finder cannot do from where it stands, and a decision that is the
user's. That one rule took the planning half of the battle run from nine agents to four.

### 4. An agent reads what it is given, and then goes looking

Every agent that lacked something read code to find it: the engine's source, a checking script's 320 lines, a
whole 17,000-token manual for one chapter of it. The answer was a start-up list made for each role, with long
files cut to the parts that role uses, and "cards" made from the code: what each command is for, how to call it
and one example that the tests run. The map keeper's start-up read went from 41,000 words to 16,000.

### 5. Agents draw blind

A border is typed as numbers and seen only after a full build and a capture, two and a half minutes later. The
same holds for units on a battlefield. Two things helped: checks that need no build (do two blocks overlap? is a
town on the right side of a border?), which run in a second, and a library that makes every border line say
whether a source gives it or the agent estimated it. A guessed line and a sourced one used to look the same.

### 6. The harness has rules of its own

Three were learned the hard way:

- A headless session stops its agents ten minutes after its own last turn, unless told not to.
- A repo cannot be loaded as its own plugin: every file becomes protected and every write is refused.
- A manager that starts its helpers in the background and then ends its turn is made to report at once. Its
  helpers finish later and their reports reach nobody. Managers now dispatch in the foreground only.

## What did not work

- **A formal state machine.** A design with schemas for every payload, a manifest for each run and hard gates
  was drafted twice and reviewed twice by fresh agents that replayed a real run against it. Both reviews found
  it would have refused work that was fine and deadlocked between two steps. It is on hold. What survived is
  small: a check at each dispatch.
- **A surveyor agent**, to derive where each border runs before another agent draws it. A review against the
  story's real zones showed that zones are not simple rings (of 62, 22 have several parts and 31 have holes) and
  that for an ancient story most lines would be estimates whoever typed them. A library replaced the agent.
- **The shared map** got only 15% cheaper and no faster. Drawing borders is the work itself, and the waste
  around it was already small.
- **My own estimates.** I guessed the second shared-map run at $6 to $7 and it cost $10. I guessed that a fix
  to how managers dispatch would make the battle step cheaper, and the next run cost the same. The runs were
  right and the guesses were not, which is the case for measuring.
- **Public map servers.** In one run an agent spent 23 of its 42 minutes waiting for three downloads.

## What independent review was worth

Three times a fresh agent was asked to review a design or new code with no knowledge of the reasoning behind
it, and told to show each defect by running something. The last review found 18 real defects in tools written
the same day, among them a figure that read 1,851 km where the truth was 86, and a test that passed when the
program crashed. None had been caught by the author's own tests.

## Where it stands

- Every step from the page lists to a finished section has run with real agents at least once, and the three
  costliest have been tuned over several runs.
- A section of four pages costs about $10 and half an hour. A battle with three step pages costs about $15.
- Never run: the first brief and the source survey of a new story, the editor's check of finished texts, and the
  audit of a whole story. A whole new story, start to finish, is the test that is left.
- Not measured: the first setup, on `main`. The comparison with it is still owed.
- Not tried: a cheaper model for the mechanical roles, which may be the largest saving left.

## If this becomes a post, the points worth making

1. A pipeline of agents that has never run is a hypothesis. Ours looked finished and stopped in its first hour.
2. Count from the transcripts. Agents, turns and tokens for each role showed where the money went, and it was
   never where the design said it would be.
3. Read the transcripts call by call. Every large saving came from seeing an agent do something dull twelve
   times in a row.
4. Give a tool, not a rule.
5. Let the finder fix. Hand-offs between agents are where both cost and faults pile up.
6. Have someone else check the work, and have them prove each finding.
