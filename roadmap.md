# Roadmap

What is planned for the story pipeline, what is on hold and why. `spec.md` is the design, `spec-status.md` says
what is built and what each benchmark run found, and this file says what comes next.

## Now: evaluate the pipeline step by step

Run each step of `spec.md` 5.0 with real agents, one at a time, and fix what breaks as it is found. Three runs of
the `build` steps of section 020 are done (`spec-status.md`). No step before `maps` has been run by agents under
the new definitions.

| Step | Roles | Run by agents | How to run it |
|---|---|---|---|
| `brief`, `final-brief` | overseer, with the user | no | needs a new story |
| `survey` | research-coordinator | no | needs a new story, or Alexander's brief with its source map taken out |
| `pre-plans` | section-lead, section-coordinator | no | no benchmark variant yet |
| `pre-plan-check` | editor | no | no benchmark variant yet: needs every section's pre-plan |
| `research` | research-coordinator, researchers, research-reviewers | no | `benchmark.mjs setup research` |
| `names` | names | no | no benchmark variant yet |
| `map-design` | map-architect | no | no benchmark variant yet |
| `plans`, `plan-check` | section-lead, section-coordinator, fact-checker | no | `benchmark.mjs setup plans` |
| `maps`, the shared map | map-keeper, map-auditor | no | no benchmark variant yet |
| `maps` to `facts`, one section | the section's team | three times | `benchmark.mjs setup build` |
| `phases` | battle-coordinator, battle-implementor, battle-auditor | no | section 020 has no battle with phases |
| `edit` | editor | no | needs every section's texts |
| `story` | story-auditor | no | needs a whole story |
| `name-forms`, `translation` | name-finder, translator, translation-reviewer | no | shelved in `spec.md` |

## Next, in order

1. The `plans` variant of the benchmark. It is the first run of a section-coordinator and of the fact checker's
   plan check, and it answers the question the on-hold work rests on: how many of the faults that the build runs
   found in the frozen plan does a plan check catch.
2. The `research` variant.
3. A benchmark variant for `pre-plans` and `pre-plan-check`.
4. One run of section 020 by the old definitions, on `main`, for a figure to compare with.
6. Releases of kitap (`image-placeholders`) and harita (`marker-clashes`, the zone cache), so `patches/` empties.
7. The list of `cloud-integration.md`.

## Where the faults of the build runs came from

The 71 faults of the second and third runs, each read by hand, 24 Nov 2026.

| Source | Faults | What was done |
|---|---|---|
| The plan: a zone missing from a page that the pages beside it show | 9 | `scripts/plan-check.mjs` now finds this from the plan, and the frozen plan's lists are put right |
| The plan: markers too close, and the chain of fixes that followed | 19 | two icons that meet show one at a time (`spec.md` 6.11). Not yet seen in a run |
| The plan: other, such as a frame that cuts a route off | 7 | none yet |
| A plan fix carried into pages already drawn | 2 | the section lead now checks the plan before it has anything drawn |
| Other frozen inputs: the old battle card, missing names, a misread source | 8 | the card and the digest line are put right. The names wait for a rule |
| Made in the run: words on the map (a route's name, a marker's note) | 8 | `scripts/names-check.mjs` reads the words on the map |
| Made in the run: the texts | 18 | `scripts/close-wording.mjs` lists a sentence that follows its source closely, 7 of the 18 |

Half of the faults, 37 of 71, began in the plan and were found again in each run, since each run starts from the
same plan. 26 were made in the run, and all but four of those were caught at their own check. The four were all
words on the map, passed by the map auditor and found by a text checker.

## The build runs of section 020

Each run's numbers are in `content/alexander-the-great/.plan/run/benchmark/`.

| Run | Agents | Turns | Weighted tokens a page | Cost | Minutes | Faults | Left open |
|---|---|---|---|---|---|---|---|
| 2 | 21 | 510 | 1,860,000 | $23 | 59 | 38 | 6 |
| 3 | 15 | 282 | 1,350,000 | $18 | 53 | 33 | 8 |
| 4 | 13 | 227 | 1,200,000 | $17 | 67 | 20 | 3 |
| 5 | 17 | 298 | 1,240,000 | $17 | 62 | 29 | 0 |
| 6 | 9 | 137 | 690,000 | $10 | 28 | 26 | 0 |

The sixth run is the first with one agent a role and one round a step: no map fix round, and no return to the
maps after their audit. Still to compare with: the same section built by the old definitions, on `main`.

## The other steps, each run once on section 020

| Step | Agents | Turns | Weighted tokens | Cost | Minutes | Result |
|---|---|---|---|---|---|---|
| `plans` | 7 | 123 | 2,490,000 | $8 | 22 | a plan that passes every check, 10 faults found and fixed at the plan check |
| `research` | 4 | 88 | 2,210,000 | $8 | 18 | 50 lines with 169 quotes, where the old digest had 21 with 47 |

| `pre-plans`, its check | 8 | 82 | 1,590,000 | $6 | 10 | page lists of 010 to 030, and 11 faults the editor listed and left open |
| `names` | 2 | 26 | 1,520,000 | $6 | 13 | 604 names, and 15 lines of `names-check` on the built story where the old file gives 135 |
| `map-design` | 2 | 40 | 1,080,000 | $4 | 12 | the Map part and `story.yaml` from nothing, 27 families |
| the shared map | 7 | 124 | 3,330,000 | $11 | 45 | 12 zones drawn again, 11 faults, 10 fixed, in two fix rounds |
| `plans` of 030, a battle | 9 | 201 | 3,830,000 | - | 20 | a plan that passes, after the first lead ended early and was sent again |
| `phases`, the Granicus | 7 | 139 | 3,190,000 | - | 43 | a card and 3 phase pages, 7 faults fixed, in two fix rounds |

The last two rows are one run of $24. Found in these runs, and changed after them: a lead that dispatched in the
background was made to report while its agents ran (`agents/report.md`, "Turns"); the names agent had no shell;
the editor listed the faults of a page list and fixed none; the map roles left a row of the brief for its owner.
Still open: the names agent read all 71 built texts, which a new story does not have; a phase page costs about
1,000,000 weighted tokens where a section page costs 690,000; the shared map and the phases each took two fix
rounds; a section lead at `pre-plans` only passes one dispatch on.

The battle was run a second time after the foreground rule: one lead and one fix round for the phases, and the
same cost, $24 and 7,470,000 weighted tokens in 83 minutes. The builder alone took 2,560,000. The two battle tools
of "Fewer turns" were built after it and have not been through a run.

The planning half of that run, read call by call, 25 Nov 2026. Three causes, each changed and none yet run:
the fact checker wrote the new wording of all eight plan faults and changed no file, so two fixers and two
rechecks applied its text (it fixes the plan itself now, and one check reads the plan and the battle plans); the
two planners found each passage with a search of their own, about 12 calls each (`scripts/brief.mjs` gives them
the digest's lines with their passages, the index of the section's source files and the plan schemas); and the
old digest of 030 had no line on the Granicus field, so a gap researcher took 63 turns (its lines are now in the
frozen digest, as the `research` step would have left them).

The third battle run, with those changes and the two battle tools: $15, 4,580,000 weighted tokens, 55 minutes,
10 agents and 172 turns, where the second took $24, 7,470,000, 83 minutes, 15 agents and 361 turns. The plan check
ended the planning half with no fix round. The phases still took one fix round, and the section coordinator's
context reached 243,000 tokens with the passages file.

The shared map's run, read call by call. Each of its six agents read the brief, the names and the digest
whole, some 41,000 words, the two short fixes too: `scripts/brief.mjs` now gives the keeper and its auditor the
parts they use, some 16,000 words. The keeper wrote six scripts to learn the base shapes, and built, served and
captured by hand: it now starts from the engine's parts on zones and a model generator, and
`scripts/audit-pack.mjs <story> all --pages` is its check. The second fix round came from one `taste` fault its
own first fix made, a generator that read the file it wrote: the keeper runs its generator twice now, and a
`taste` fault found at a recheck holds nothing up. None of this has been through a run.

The shared map's second run: $10, 2,820,000 weighted tokens, 48 minutes, 5 agents and 102 turns, where the first
took $11, 3,330,000, 45 minutes, 7 agents and 124 turns. One fix round, the short start-up read and the pack were
all used. The keeper still spent eleven minutes reading the shapes of the zones that stand, to share their edges,
and the auditor captured and read 25 pages, every page one of the twelve zones lies under. Drawing borders is
the cost that is left, and a benchmark that draws 12 zones among 76 that stand is not how a story is drawn.

A surveyor, a role that derives where a border runs before the keeper draws, was drafted and reviewed
(`surveyor-spec.md`) and not built. In its place: `scripts/zones-lib.mjs`, the library a story's zone generator
draws with, where each line is `src` with its claim or `est` with its reason and a shape of bare points is
refused, and which writes `ground.yaml`, the list of both; and `scripts/ground.mjs`, the water tool with the
regions of today and a search by name. Tried on one zone, the Triballi along the fetched Danube. Not yet through
a run. Alexander's own `zones.cjs`, 540 lines for 62 zones, is not written with the library: a story is moved to
it when its map is next drawn. `scripts/inputs.mjs` does not yet know `ground.yaml` as an input.

The shared map's third run, the first with the library: $11, 3,280,000 weighted tokens, 63 minutes, 5 agents and
110 turns. No cheaper, and slower: the keeper spent 23 of its 42 minutes waiting for three downloads from the
Overpass servers. It drew every line as `src` or `est`, 5 sourced and 20 estimated, and took the Danube and the
regions of Thessaly and Laconia from fetched files. Counted again with the library as the review left it: of the
5,400 km of edge that a line gives, 2,400 are sourced and 3,000 estimated, and 21,000 km more are coast or the
edge of a zone that stands. It also added Cyprus to Persia as a box of four bare points joined to the zone, which
the library now refuses. After it: `scripts/ground.mjs` reads Natural Earth from disk first, rivers, lakes,
first-level regions and named ranges, takes several names in one call, and asks a server only for a name that
lacks, twice at the most. Not yet through a run.

The shared map's fourth run, with Natural Earth on disk: $11, 3,620,000 weighted tokens, 53 minutes, 132 turns.
No better. The keeper asked for seven names in one call, four of them small rivers Natural Earth lacks, and the
tool asked the servers for each in turn, two tries a name: eight minutes, until the keeper stopped it and fetched
the Danube alone. So 2 lines came out sourced and 46 estimated, 950 km against 10,400. After it: the names that
lack go to the servers in one question with one wait of a minute and a half at the most, and a name is looked for
among the regions too. Four runs of this step have cost between $10 and $11 each: the tools around the drawing
no longer move its cost.

Work that still stands is skipped (`skip-spec.md`), built on 26 Nov 2026 and not yet through a run. A first
draft, a dispatch skipped where its last run passed and nothing changed, was replayed by a reviewer on a clean
build and skipped 1 dispatch of 7: every role edits what it builds from and what others made, and a first check
rarely ends `pass`. As built: a maker stands when what it builds from is as it was and what it made is there, and
a checker when its last run ended `pass` and what it checks is as it left it. `scripts/inputs.mjs` keeps the
record, `hooks/dispatch.mjs` stops a dispatch that stands and `hooks/dispatch-end.mjs` closes the record as an
agent ends. Replayed on the seventh build: all 6 roles stand, a changed route sends the cartographer alone, an
edited text the two text checkers alone. Left out: narrowing a dispatch to the pages that changed.

The research run's lines take new ids, so every file that cites the section's old ids is stale: the brief's map
table, `names.md`, and the plans of the sections beside it. A section researched again in a real story needs its
ids kept, or the citing files rewritten.

## Fewer turns

An agent's whole context is sent again on each turn, and in the fourth run 184 of 224 turns held one call. A rule
in the notes changed the first turns alone. A tool that does a job in one command changes the rest. Built:

| Tool | For | In place of |
|---|---|---|
| `scripts/brief.mjs` | every role | reading its first files one a turn |
| `scripts/passages.mjs` | writer, fact checker | a search for each quote |
| `scripts/audit-pack.mjs` | map auditor, cartographer | eight checks, a build and four captures, one a turn |
| `scripts/candidates-sheet.mjs` | image finder | opening each of some 200 candidates |
| `scripts/audit-pack.mjs --battle` | battle builder, battle auditor | a generator run, the checks, a build, a server and twelve captures by hand |
| `scripts/ground.mjs` | battle coordinator | a search for the shape of a river or a lake, 17 calls in the second battle run |

The section lead no longer records hashes by hand, ten times a section: the dispatch hook does. None of the last
three has been through a run. Still to do: a smaller model for a leaf role whose work is fully checked, such as
the cartographer (`spec.md` 4.6; never for a manager, which is the one that steps in when a run breaks, and the
four roles that could take one are 14% of the cost), a run
skipped where the hashes of its inputs have not changed, and a shorter first read for the section lead.

## To look at

- **A large story on a phone.** Alexander has 71 pages and 88 zones, and its bundle, `story.js`, is 2.5 MB. Its map
  was slow on a laptop. Not measured on a phone. `spec.md` 6.9, states and changes of land, would bring the 88
  zones to about 24 states, and is the item that most cuts what a phone has to draw.
- **A page's zones are the same on every screen.** Decided on 25 Nov 2026: a page has one list of zones and one
  legend, whatever the screen. A zone a phone shows and a laptop does not keeps its row in the laptop's legend.
  The legend is not made to follow the view.

## Known defects, not yet fixed

- **The agent-end hook checks nothing.** A stop hook is handed no last message, and `hooks/agent-end.mjs` reads
  one. An agent ends with a handback, a tool call whose `message` holds its report. So the hook refuses each
  agent, and no transcript shows the refusal reaching anyone. No report, fault or fix is checked as an agent
  ends. Agents still save their own reports, as the definitions ask, so nothing is lost by it.
- **The edit hook sees a minority of writes.** Most writes to the fault and fix lists go through the shell, and
  pages come from a generator script.
- **A recheck cannot diff.** A fix log names a commit as its base, and nobody commits during a section.
- **The leak counts of `scripts/fault-ledger.mjs` say little for a build run.** Most faults it counts began in
  the frozen plan and were due at a plan check the build benchmark never runs.
- **`names-check` can give a name to the wrong row.** In the fifth run a lead reports that "Cleitus, son of
  Bardylis" was matched to the row of Cleitus the Black, and a writer reworded to get past it. Not reproduced on
  two plain sentences, so the wording that sets it off is still to find.
- **A fault found late on the map costs a round.** In the fifth run the text checkers found places the texts name
  and the maps lack, and the map auditor left two markers 5 km off for the cartographer. Each cost a fix and a
  recheck after the maps had passed.
- **A hook passes input it cannot parse**, and a hook that fails lets everything through.

## On hold: the pipeline as a state machine with gates

**What it is.** Formal contracts for what each role is given and gives back: one file of role contracts, a
schema for each payload (dispatch, report, fault, fix), a folder and a manifest for each run, and the work set
out as a state machine. An artifact (a section's plan, its maps, its texts) has a state. A run of an agent moves
it. Hard gates are scripts that validate a run's inputs at its dispatch and its outputs as it ends. Soft gates
are checker agents. Small records go through one payload program.

**Why it was started.** A fault caught late could not be traced: nothing recorded what a checker looked at, and
where a fault began was an agent's guess. A role's contract stood in five places.

**Where it is.** On the branch `payload-machine`, one commit ahead of `pipeline`:

- `payload-spec.md`, the second draft of the design.
- `agents/roles.yaml`, `scripts/roles.mjs`, `scripts/channel-schemas/`, `scripts/schema.mjs`: built, and the
  third run's faults, fixes and reports pass the schemas.
- `hooks/agent-end.mjs` and `hooks/edit.mjs` rewritten, and `scripts/leaks.mjs`: built on the first draft, and
  wrong in the ways below. Do not run agents on that branch.

**Why it is on hold.** Two reviews, each by a fresh agent that read the code and replayed the third run:

- The first draft's stop hook read text where agents hand back through a tool call, its write rule saw 5 of 24
  writes, and its leak script named the wrong maker and the wrong page.
- The second draft, replayed on the third run, refuses the first draw, deadlocks between maps and texts, and
  can never mark a section's texts as passed. Its seven states mix three separate facts: valid by script, the
  checker's verdict, and freshness. A section is blocked by faults its own team cannot fix. "Stale means make
  again" would mark a whole story stale for one new name. A disk diff cannot say who changed a file when agents
  overlap.
- On cost the second review's replay comes out as a net cost as drafted, about neutral with the state model
  fixed, and a saving only if a plan check really catches plan faults. That is not measured.

**What is sound, by both reviews.** A gate at a dispatch, which holds at every depth. State worked out from disk
and not stored. A manifest written by a hook. Payloads through one program. A folder a run, with faults and
fixes kept as shared lists.

**Before it is taken up again, in this order.**

1. Measure the plan check on the frozen plan (item 1 of "Next"). If it finds few of the plan's faults, gates
   save little.
2. Split the state into three fields, kept per page and not per section, and write the rule for what blocks: by
   the owner of a finding and its severity.
3. Make each validator know its step and judge its own artifact's files alone. Replay the third run's 14
   dispatches on paper until none is wrongly refused.
4. Probe four facts of Claude Code: whether a hook before the handback call can send an agent back to work,
   whether a dispatch hook can add a run id to the prompt, whether parallel dispatches run their hooks at once
   and what a hook's timeout does, and whether a workflow's agents pass these hooks at all.
5. Decide where a run's snapshot is kept, and how a changed file is given to a run when agents overlap.

Worth building whatever that shows: the payload program for faults and fixes, with a lock and an id it gives,
and the validators that know their step.
