# Evaluating the agent workflow

A proposal for measuring whether a change to the agents' process makes a story cheaper without making it worse,
with the numbers from the Alexander the Great cloud run as a first baseline. `feedback.md` lists the problems and
the changes worth testing; this file is about how to test them.

## The idea

Every change to the workflow, such as fresh agents per section, a rules linter, or cards written by the
battle-coordinator, is a bet that it saves tokens or rework without losing quality. To know, a change is run against
a fixed benchmark and compared on three things: whether the result passes, how many faults leaked past the step
that should have caught them, and what it cost in tokens and time.

## 1. What "succeeded" means, step by step

Most of the acceptance list can be checked by a script or by an agent's report block.

| Step | Passes when |
|---|---|
| Research | `node scripts/quotes-check.mjs <story>` prints ok; every section has scholarly or primary coverage; no claim the story turns on is `thin` without a ruling |
| Names | every name a plan uses has a row in `names.md` |
| Plans | the editor (plans) reports no `wrong` fault; every route line in a plan cites the passages that give its stations |
| Maps | `harita check` ok; a rules linter passes (cards on their sites, no marker under a card, rules A–C, stage entries); the map-auditor reports no `wrong` fault |
| Battles | the battle-auditor reports no `wrong` fault; rerunning each generator leaves the page files unchanged |
| Texts | the fact-checker reports no `wrong` fault; disputed claims sit in Notes; each body runs 150–300 words; no five-word run copied from a source outside quotation marks |
| Images | every caption fact is on its Commons file page or a digest line; no image placed twice |
| Story | `npm run build -- --strict` passes; the story-auditor reports `pass` |

## 2. What is measured

- **Tokens per agent.** `scripts/token-ledger.mjs` sums every agent's input, cache writes, cache reads and output
  from its transcript, counting each message once. Each agent is tagged with its step, section and variant.
- **Wall time** per step and in all.
- **Rework.** The number of faults by severity at each step, and the number of round trips a fault takes before it
  closes.
- **Defect leakage.** A `wrong` fault found by a later step that an earlier step should have caught. In this run:
  the plan routes west of Philippi and through Tempe (plan → map audit), the misnamed Persian Gate gorge
  (research → battle plan), Pindar spared by the allies' vote (writer → fact-check), and the Issus card fix that
  erased figures (fix → battle audit). Leakage is what makes rework expensive, because each leak costs a draw, an
  audit and a redraw.
- **Quality, beyond fault counts.** A fixed auditor, the same model and prompt for every variant, reads the result
  blind against the sources, and a person spot-checks a sample of pages.

## 3. How a change is tested

1. **Pick a small, fixed benchmark.** One section such as 020 (four pages, one card) or one battle with phase
   pages. It is small enough to run several times, and it touches research, plans, maps, texts, images and checks.
2. **Run each variant on the same inputs:** the same digest, plans and rulings, so only the process differs. A
   Workflow script runs each pipeline the same way every time.
3. **Repeat each variant two or three times.** Agents do not behave the same on every run, and the spread shows
   how much of a difference is noise.
4. **Compare** tokens per accepted page (weighted the way the usage limit weights cache reads against fresh
   tokens), defect leakage, rework rounds, wall time, and the blind quality score.

Variants worth testing first, from `feedback.md`:
- fresh agents with a one-page handoff note instead of long resumes;
- a rules linter that replaces the mechanical part of the map and text audits;
- texts written after a section's page files exist, not before;
- battle cards written by the battle-coordinator at step 9;
- smaller models for the mechanical agents (image search, plan-sync edits, card figure checks);
- auditors allowed to fix taste-level faults themselves and report the diff.

## 4. What to evaluate, with examples from this run

Each item below is a thing to count or check in every evaluated run, with real cases from the Alexander run as
the examples a test should catch. "Introduced" is the step that made the fault, "caught" is the step that found
it, and the gap between them is the leak.

### 4.1 Leaked defects (wrong faults that passed a step meant to catch them)

| Defect | Introduced | Should have been caught | Caught | Cost of the leak |
|---|---|---|---|---|
| Plan route "west of Philippi" (Arrian 1.1.5 has Philippi on the army's left) | plan (020) | plan check, step 7 | map audit 020 | the route was drawn, audited and redrawn |
| Plan route "through the vale of Tempe" (Bosworth: round it by the coast) | plan (020) | plan check | map audit 020 | the same |
| Pydna inside Macedon in 358 BC (a Greek city Philip took in 357) | brief and plan (010) | map design, step 5 | map audit 010 | zone redrawn, brief and plan changed |
| Myndus and Caunus shown as Alexander's in 334 BC (held for Persia until 333) | cartographer (030) | none earlier | map audit 030 | zones redrawn |
| Persian Gate gorge called "Tang-i Khas" (Bosworth's later book: Stein's mistake) | research digest (050.19) | research or names | battle plan, Persian Gate | the name was already in names.md, the plan and a written text |
| Gaugamela's Persian cavalry at 400,000 (a misprint; Arrian has 40,000) | source (Bosworth C&E) | research | writer 050 | a check across three files before the card was written |
| Persian dead at Issus given as the same in Arrian, Diodorus and Curtius | research digest (040.9) | research | battle audit, Issus | card and text rewritten, digest corrected |
| Twenty days' march "from Amphipolis" (Arrian counts from home) | research digest (030.4) | research | fact-check 030 | text, plan and route name changed |
| Pindar spared by the allies' vote (Arrian: by Alexander himself) | writer (020) | none before fact-check | fact-check 020 | one sentence; caught where it should be |
| The Issus card fix that dropped every other author's figures | overseer's fix instruction | the fixer's own diff | battle audit, recheck | card restored from git |
| Diodorus's crossing army ruled "30,000 by total, 32,000 by list" | overseer's ruling | the ruling's own check of the file | fact-check 030, recheck | ruling corrected, two sections' notes rewritten |
| "Bosworth's site" for the Persian Gate placed with no file supporting the coordinates | battle plan | none | battle audit (noted, accepted) | none; accepted as a reconstruction |
| Seven names used in texts missing from `names.md`, three "First named in" entries wrong (two Memnons, four Nicanors) | writers and reviewers (010–090) | a names check after each section | editor (texts), step 13 | ten rows fixed by hand; ambiguous names could have reached readers |
| Hydaspes date told as fact ("May 326 BC"; Diodorus gives about July) | writer (070) | review against the plan, which marks 070.6 disputed | fact-check 070 | two texts rewritten with a note |
| Bosworth said to date the invasion of Egypt to 320 BC (his appendix says 321) | research digest (090.6) | research | fact-check 090 | digest, plan and text corrected |
| Lamia inside the Greek zone; Cyrenaica left out of Ptolemy's zones; Tyre and Sidon given to Seleucus | cartographer and brief (090) | map design, step 5 | map audit 090 | five zones redrawn, brief rows and a digest line added |

To count: every `wrong` fault in every report, tagged with the step that introduced it, from git blame or the
report's evidence. A leak is a fault whose introducing step is two or more steps before the step that caught it.

### 4.2 Claims marked with the wrong standing

The digest marked nine claims `agreed` that the sources dispute, and each had already shaped a plan or a text:
020.7 (two or three days at Pelium), 030.18 (who took Mytilene), 050.23 (where the allies were discharged), 060.5
(how Bessus died), 060.9 (how the column died at the Polytimetus), 070.3 (the end at Aornos), 070.6 (the date of
the Hydaspes), 070.13 (Bucephala and the horse's age), 080.7 (the 9,000 guests at Opis). Later: 030.1 (who made
Darius king) and 050.24 (the date of Darius's death).
To count: claims whose standing changed after step 2, and the plans and texts that cited them before the change.

### 4.3 Sources and coverage

- **Coverage lines that said "no source gives X" when a read file did:** Darius's route to Issus (040), the sites of
  Aornos and Massaga (070), Engels's Gedrosian route (080), the site of Pelium (020).
- **Facts used from read files with no digest line:** about 60 at step 6, added in one researcher batch.
- **An author's later work withdrawing his earlier one:** Bosworth's Persian Gate name.
- **Sources never read that the story needed:** Polyaenus, Hammond and Griffith II, Arrian's Indica, the Diadochi
  Chronicle, Strabo, Depuydt.
To count: digest lines added or changed after step 2, by section, and the reason for each.

### 4.4 Map rules broken

- **Marker under a battle card:** Chaeronea, Thebes, Alexandria Eschate on the Jaxartes, the Tigris crossing and
  Arbela at Gaugamela.
- **Card moved off its site for layout:** every card 11–27 km off its town, which put Tyre 27 km inland.
- **Rule A (a zone name that ends before its page's date):** "Macedon and Thrace, 340–336 BC" on pages of 335 BC.
- **Rule B (a marker note that tells another page's event):** six ids at step 7; later Taxila, Nicaea, Bucephala,
  Sochi, Sidon, Ecbatana, Nautaca and Alexandria Eschate.
- **Rule C (bare land that the neighbouring pages show held):** Thessaly, Epirus and the League on the Danube page;
  the Greek and Thracian zones on the Hellespont page.
- **Careful side broken:** Pisidia, Lycaonia, Sillyum, Myndus and Caunus drawn as conquered; Hecatompylus inside
  Macedon before Darius died there; the mountain Uxians inside the Persian Empire.
- **Zone cut-back that the build cannot do:** the Persian Empire planned as "drawn once and cut back".
To count: each such fault in a map audit, by rule. A linter should catch all but the careful-side ones.

### 4.5 Text rules broken

- **Disputed claims in the body:** most texts written before the notes rule. Count the disputed claims argued in
  the body per page, after the rule.
- **Bodies over 300 words:** nearly every first draft (310–427).
- **Wording too close to a source:** a dozen sentences per section copied Bosworth, Ellis, Chinnock or Welles.
- **Hedges dropped:** Bosworth's "probably", "apparently" and "inclined to" turned into plain fact (Pisidia's
  garrisons, Darius's death in August, the Haemus pass).
- **A single author's figure told without his name:** the 25 Companions at the Granicus (Arrian), Arrian's 600
  stades, the eleven days to Rhagae.
To count: each in a fact-check, per page and per kind.

### 4.6 Captions beyond their Commons pages

The Lion of Chaeronea "over the Theban dead", dates supplied from general knowledge (4th century BC on objects
whose pages give none), an artist named from a signature (the Davis drawing, later removed for having no shown
public-domain basis), the unfinished tomb "of Darius III" (the uploader's naming, against Badian and Bosworth).
To count: caption facts not on the file page or a digest line, per section.

### 4.7 Fix quality

- **Fixes that broke something else:** the Issus card fix; the cards moved off their sites.
- **Fixes that a rerun would undo:** page scripts that rewrote `sources` lists or put removed markers back.
- **Rulings that were wrong:** the Diodorus crossing figure.
To count: fixes that needed a second fix, and the tokens the second round cost.

### 4.8 Process and tool failures

- **Failed builds from a missing battle card:** 113 of the first 185 builds.
- **Captures taken mid-rebuild or showing an old frame:** auditors' retakes, and the Halicarnassus routes judged
  missing when they were not.
- **Infrastructure:** the shared server stopped at two hours; file watchers ran out; the screenshot script
  failed on Linux; hover labels never drew.
- **Generators kept only in a scratchpad:** the cartographer's scripts, committed later by the overseer.
To count: failed builds, retaken captures, and agent time spent on workarounds.

### 4.9 Cost

- **Tokens per role and per accepted page:** from `scripts/token-ledger.mjs`, with cache reads weighted as the
  usage limit weights them.
- **Context size at each resume:** the researcher passed 650,000 tokens, and every resume reread it.
- **Round trips per fault:** auditor to overseer to owner and back, for faults as small as one word.
- **Overseer tokens spent relaying reports.**

## 5. Caveats

- **The judges are agents too.** If the auditor's model or prompt changes between variants, the comparison means
  nothing. Keep the judges fixed.
- **Quality is more than fault counts.** A cheap variant can pass every check and still read worse; the blind read
  and the human sample are there for that.
- **Experiments cost tokens.** A small benchmark keeps a round of experiments to perhaps a tenth of one story.
- **Some failures only show at full scale.** The two-hour limit on the shared dev server and the file-watcher
  limit (`feedback.md` items 6 and 8) never appear on a small benchmark, so a full run is still needed now and then.

## 6. Packaging the workflow as a Claude Code plugin

The agents, rules and checks of this repo could be shipped as a Claude Code plugin, so that they run the same way
in every repo and session, and so that the evaluation above is built in rather than reconstructed. What follows is
from general knowledge of the plugin format; check it against the current Claude Code docs before building.

**What a plugin holds.** A folder or Git repo with a manifest, `.claude-plugin/plugin.json` (name, version,
description), and any of:
- `agents/`: subagent definitions. This repo's `.claude/agents/*.md` (researcher, cartographer, fact-checker and
  the rest) move here largely as they are.
- `commands/`: slash commands, for example `/build-story <id>` to start the overseer flow,
  `/audit-section <story> <section>` to rerun one check, `/fix <file> <field> <old> <new>` for clause edits, and
  `/token-ledger` to print the cost table.
- `skills/`: instructions loaded when a task matches: the overseer playbook (`agents/overseer.md` with
  `agents/cloud.md`), a story's `rules.md`, and this evaluation method.
- `hooks/hooks.json`: commands run on events, such as after a file edit or when an agent stops.
- `.mcp.json`: optional tool servers, for example harita's checks exposed as tools.

It is published through a marketplace (a repo with `.claude-plugin/marketplace.json`) and installed with
`/plugin install <name>@<marketplace>`; an organisation can keep a private one.

**What it would change, with the cases from this run:**
- **Rules enforced by hooks, not memory.** A rules linter run after every page, marker, zone or text edit would
  catch the faults of section 4.4 and most of 4.5 as they are made: markers under cards, rule A–C breaks, disputed
  claims in a body, bodies over 300 words, a figure without its author. That removes most mechanical audit rounds.
- **Checks that cannot be skipped.** `quotes-check` after every digest edit, and `harita check` after every page
  edit, run by hook.
- **Fixes in a fixed form.** A `/fix` command that takes the field, the old text and the new text, and shows the
  diff, would have made the Issus card mistake (section 4.1) impossible.
- **Token logging built in.** A hook when each agent stops appends its usage, tagged with step, section and variant,
  to a ledger. Every run then produces the numbers of section 2 and the baseline below without anyone rebuilding
  them from transcripts.
- **Portability.** Other repos built on harita and kitap install the same agents and rules instead of copying
  `agents/*.md`, and a fix to an agent definition reaches every repo at once.

**What it would not change.** The tool limits sit in harita, kitap and the environment, not in the agents: the
screenshot script's Chrome path, the file-watcher limit, the two-hour server limit, headless Chrome crashing at
phone size, and the build cutting a zone once for the whole story (`feedback.md` items 2, 6, 7 and 8).

**A first version.** The existing agents and the overseer skill as they are, plus hooks for `harita check` and
`quotes-check`. Then add the rules linter and the token hook, and measure each addition on the benchmark of
section 3.

## 7. Baseline: the Alexander the Great run

Final figures, measured when step 14 passed. The first column of the interim table, measured after sections
010–060, is kept for comparison: the stretch from there to the end ran in lean mode (`lean.md`).

| | Agents | Input | Cache write | Cache read | Output |
|---|---|---|---|---|---|
| All subagents, final | 72 | 10,646 | 42,090,514 | 901,688,155 | 4,898,947 |
| Overseer (main session), final | 1 | 1,344 | 1,061,355 | 221,664,078 | 346,272 |
| **Whole run** | 73 | 11,990 | 43,151,869 | 1,123,352,233 | 5,245,219 |
| All subagents, interim (after 060) | 58 | 9,146 | 38,323,945 | 793,780,778 | 4,215,811 |
| Overseer, interim | 1 | 1,066 | 886,305 | 194,563,733 | 277,958 |

The lean stretch covered sections 070–090 (maps, battles, images, facts and review), the editor on all texts and
the story audit: 14 more agents, and about 14% more cache reads and 17% more output than the interim figures (overseer included).
Sections 010–060, before lean mode, took the other 88%. The comparison is rough: the two stretches did different
work, and the first included research, names, map design and all the plans.

Almost all of the volume is cache reads: each turn of a long-lived agent rereads its whole context. The roles that
cost most were the researcher (one agent resumed about fifteen times, past 650,000 tokens of context), the
cartographers (three, one section after another), the fact-checkers, the first battle-implementor, and the
reviewers and map-auditors. That is why fresh agents with handoff notes and a linter that removes mechanical audit
rounds are the first variants to test.

To reproduce the table for a run:

```
node scripts/token-ledger.mjs <the session's transcript, or the folder of its agents' transcripts>
node scripts/fault-ledger.mjs <the same>
```

Each agent's role comes from its transcript's meta file or from the overseer's dispatch of it. Where a run has
neither, `--roles <file>` takes any file with "<role> <agent id>" pairs, as the overseer of this run kept in its
scratchpad. The table above was made that way, with the Python script this one replaces.
