# Feedback from the Joan of Arc cloud run

Notes on the agents' process, gathered during the unattended build of `joan-of-arc`, for review with the pull
request. Each note says what happened, what it cost, and a proposed change. None of the script changes is made
yet. `run/notes.md` holds the one-line record of each thing as it happened.

## 1. `find-in-sources` writes every search to one file

**What happens.** `scripts/find-in-sources.mjs` writes its whole result to `.cache/find/<story>.txt`. Seven
researchers ran at once at `research`, and one agent's result was overwritten by another's before it was read
(the researcher of 060 reported it).

**What it costs.** The agent searches again, or falls back to one `grep` a turn. A researcher holds some 300,000
tokens of sources by then, and each extra turn reads all of it again.

**Proposed change**, either one. The file is a cache and no work product, so nothing needs merging:
- An `--out <file>` flag, and each agent gives a path in its own scratchpad, which every dispatch already names.
- A file per run, such as `.cache/find/<story>-<pid>.txt`, with the path printed.

## 2. `find-in-sources` shows too little for a long source

**What happens.** It shows the first 5 hits of a file, the 8 files with the most hits for a term, and 400 lines
in all. A name such as Talbot in a chronicle of 30,000 lines has far more than five hits, and the one wanted is
seldom among the first. The researchers of 010 and 070 reported it and used `awk` and `grep -n` over line ranges.

**What it costs.** Turns, as above: `research` was 24.2 million of the run's first 44.3 million weighted tokens,
and its researchers took about 59 turns each.

**Proposed change:**
- Flags `--hits <n>` and `--from <line> --to <line>`, so one call sweeps a chapter.
- The full result, uncut, always goes to the file, and the printed part is the summary. The card of the commands
  says so, and names `--around`.

## 3. `quotes-check` cannot read a file name that holds `)` or a comma

**What happens.** The parser of a citation stops at the first `)` and splits at a comma. So
`Siege_of_Paris_(1429).wiki`, `Siege_of_Orléans_(1428–1429).wiki` and `Louis_I,_Duke_of_Orléans.wiki` cannot be
cited. The researchers of 010, 030 and 050 named those articles in the claim's own words and gave no quote, and
010.2 became `single` for want of the second source.

**What it costs.** Rounds of trial and error at the quote check, and a claim whose standing is lower than its
sources give it.

**Proposed change**, either one:
- `quotes-check` reads a citation's file name against the list of files on disk, the longest match first, and
  not by a pattern.
- `harita sources` writes file names without those characters. That is in the kitap engine and is the larger
  change.

## 4. `research-gates` reads only the merged digest

**What happens.** A research reviewer is to check that its section has as many scholarly sources as the others,
but `scripts/research-gates.mjs` reads `research.md`, which is written only after every review. All seven
reviewers counted by hand and said so.

**Proposed change.** A `--part <file>` flag, as `research-pack.mjs` has, and a line in the reviewer's card.

## 5. A manager cannot dispatch in a cloud session

**What happens.** The session runs with `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`, where the documented default is
three layers. At that depth no subagent is given the `Agent` tool, whatever its definition lists. The
`research-coordinator` reported `blocked` at `claims`, and a probe agent with every tool allowed held no `Agent`
tool. The overseer dispatched every researcher, reviewer, section coordinator and fact checker itself, and made
the managers' merges.

**What it costs.** Every worker's report lands in the overseer's context, where the design gives it one report a
section. The overseer also holds the turn for each agent, since most `Agent` calls started in the background
though they carried `run_in_background: false`.

**Proposed change:**
- `.claude/settings.json` now sets the variable to 3 (commit `ce68d5d0`). It is not tested: the setting cannot
  reach the session that made it, and the cloud environment's own value may win. Start one cloud session and
  have a `section-lead` report its tools.
- If the platform holds the value at 1, `agents/cloud.md` says that the overseer dispatches each team, and the
  section builds run by the workflow `/story-pipeline:section`.

## 6. The Stop hook asks for a commit while agents run

**What happens.** Each time the overseer waits for a background agent, the session's Stop hook finds the agents'
half-made files and asks for a commit and a push. The branch carries many commits named "in progress" between
the commits of the steps.

**What it costs.** A fix log names the commit a fix was made on. A commit made mid-run takes in a running agent's
first edits, so the fact checker of 050 had to name two commits for one run's fixes.

**Proposed change**, either one:
- The hook leaves `content/<story>/.plan/` alone while a record of `reports/*.inputs.yaml` is open, which is how
  the pipeline already knows that an agent runs.
- The agents' calls run in the foreground as asked, so the overseer's turn does not end while they work.

## 7. `harita sources` takes a bot wall for the page

**What happens.** Seven addresses (OpenEdition and the Heidelberg journals) answered a script with an Anubis
challenge page. `harita sources` wrote some 550 characters of it as the text and printed no `FAILED`. The
research coordinator found them by their size and commented the lines out of `references.urls`.

**Proposed change.** `harita sources` knows the challenge page by its markers, or by a text far shorter than the
page's size, and prints `FAILED`, so the address goes to the "Unread" part of the source map as the notes say.

## 8. A capture of a close-in page shows no base map in a cloud session

**What happens.** The map auditor of 030 reported that its captures of the pages of Orléans show no base map: no
river, no relief. The terrain tiles (`s3.amazonaws.com/elevation-tiles-prod`) answer `curl` through the session's
proxy, which re-signs TLS with its own CA. `scripts/screenshot.mjs` starts Chrome with no proxy flag and no trust
for that CA, so the browser's own tile requests may fail. The cause is not tested. Wide pages show the engine's
own land and rivers, so the audits of 010 and 020 met nothing of it.

**What it costs.** On the city pages (Orléans, Paris, Rouen) a marker's side of the river and a route on the water
are checked from coordinates and never seen. The reader's first look is the first look.

**Proposed change.** `screenshot.mjs` passes the session's proxy to Chrome and trusts its CA where `HTTPS_PROXY`
is set, and prints each failed request, so a capture without its base map says so in the run and not only to the
eye.

## 9. `images-place` leaves a card's placeholder where the list is written on one line

**What happens.** `scripts/images-place.mjs` switches a card's image where `battle.yaml` writes its list one
`- name` a line. Every card of this story, and of alexander-the-great, writes `images: [name, name]` on one line.
So the 72 images of texts and markers were placed, the eleven cards kept their placeholder names, `harita check`
went on printing three of them as `waiting`, and the strict build stopped on `unknown image`.

**What it costs.** The overseer switched the eleven lines itself, from `images/<section>.yaml`, as fault
story-overseer-7.

**Proposed change.** `images-place.mjs` reads a card's `images` as YAML, in either form, and the test of the
script holds a card written on one line.

## 10. `names-check` reads a row's first cell alone, and groups rows by a lower-case first word

**What happens.** Through every section the writers, fact checkers and reviewers met the same failures of
`names-check`: a short form that `names.md` itself asks for ("Lord Talbot", "the Marshal de Boussac") counted as
no naming of its row, so the row was "first named" sections late; and the 33 rows that open with "the" were taken
for one shared name, so a bare "the" failed a page. Each agent wrote round it, or reported it and left it.

**What it costs.** A paragraph of each of some twenty reports, several rewordings of sound sentences, and three
faults left open to the end.

**What was changed, at the end.** The names agent lists the short forms after a semicolon in the Name cell,
which the script already read, and changed one line of `names-check.mjs` (a group's key must be capitalised) and
one of `slice.mjs` (a Name cell is split at `;`). The output for alexander-the-great is the same before and after.

**Proposed change.** `agents/` tells the names agent to write the short forms into the Name cell from the start,
and the cells "First named in" are settled once, after the texts, and not guessed before any text exists.
