# Lean mode

These are the rules the overseer followed for the second half of the Alexander the Great run. Partway through, the
user noted that the run had used about 20% of a weekly token allowance. From the section 050 review on, the overseer
finished the story in "lean mode". This is not a feature of Claude Code or of `agents/`. It is a set of operating
rules the overseer set for itself and logged in `content/alexander-the-great/.plan/decisions.md` (section "Lean
mode"). This file records them as a reference for later runs.

## The rule in one line

Every pass of the process still runs: map audit, fact-check, review, editor and story audit. Lean mode cuts what
each pass carries and how often work goes round the loop.

## The rules

1. **Fresh agents, not long resumes.** A long-lived agent reprocesses its whole history on every resume. The
   researcher reached about 650,000 tokens and the cartographer and battle-implementor about 500,000. Lean mode
   starts a fresh agent per section from `rules.md` and a short handoff note. Exception: the cartographer and the
   battle-implementor were still resumed for small follow-ups on their own generator scripts, which they knew.
2. **Story rules in one file.** `content/alexander-the-great/.plan/rules.md` holds every standing rule: zone rules
   A–C, cards on their sites, battle ids, the careful side, the Notes format, word limits, and how to run servers and
   captures. A fresh agent reads it instead of the whole `decisions.md`.
3. **Minimal captures.** Map-auditors take one desktop capture per page. Phone-size captures are skipped, since they
   crash headless Chrome (see `feedback.md`). Reviewers take none. Geometry (which zone holds a place, whether a
   route stays on its surface) is checked with scripts before any capture.
4. **Act only on wrong and weak faults.** Taste faults are logged in the overseer's scratchpad (`step8-faults.md`)
   and left unfixed, unless the fix costs one clause.
5. **The overseer makes one-line fixes itself.** Examples: a marker note, a card date, a caption word, a brief row,
   a digest line, a plan line. Each would otherwise cost an agent resume.
6. **Exact fix lists.** The fact-checker writes each fault to a file (`scratchpad/overseer/fc/fc-0X0.md`) with the
   quoted words, the source line and the fix as a clause edit. The reviewer applies the list without redoing the
   research. Fix instructions always say whether they replace a whole field or one clause, and quote the old text
   (see `feedback.md` item 13).
7. **Short reports.** Agents return the YAML block of `agents/report.md` and a few lines, and put the detail in a
   scratchpad file. The overseer's context carries every report for the whole run, so a long report costs on every
   later turn.
8. **Skip a pass only where another pass covers it, and log the ruling.** The three 090 battle cards had no phase
   pages, so the 090 fact-checker checked their figures, commanders, dates and sites line by line instead of a
   separate battle audit. The map audit covered their sites.
9. **Pipeline across sections; serialise within a file.** Agents on different files run at once: a section's map
   audit beside the next section's drawing, fact-checks beside image searches. Two agents that edit the same files
   do not. A section's reviewer waits for its image-finder, since both edit `text/en.md`. Every agent commits only
   the paths it changed, never `git commit -a`.

## What it did not cut

- Every section still had a map audit, a fact-check and a review.
- Step 13 (the editor on all texts) and step 14 (`harita check`, `quotes-check`, `npm run build -- --strict` and the
  story-auditor) ran in full.
- Wrong and weak faults were all fixed, and every cloud ruling was logged in `decisions.md`.

## What it showed

- **Exact fault lists make reviews cheap.** The 070, 080 and 090 reviewers each finished at about 85,000–127,000
  tokens. They applied every point as given; the 080 reviewer applied 24 of 24.
- **Overseer one-line fixes save whole runs.** About twenty fixes in the lean stretch took one command each:
  - the Crannon card date
  - the Lamia and Mallian town notes
  - the Opis and Xerxes captions
  - the Carmania and Cyrenaica brief rows
  - digest line 090.34 and the correction to 090.6
  - the 080 borders clause
  - the Hydaspes unit name
  - names.md
- **A combined fact-check and card audit works for cards without phases.** The 090 fact-checker found the one real
  card fault, the Crannon date, in the same pass.
- Lean-stretch agent sizes, as each agent reported its tokens at the end of its run:

  | Agent | Tokens |
  |---|---|
  | fact-checker, per section | 240,000–260,000 |
  | map-auditor | 133,000–243,000 |
  | image-finder | 100,000–195,000 |
  | reviewer | 85,000–127,000 |
  | editor (all texts) | 184,000 |
  | cartographer (090 with queued fixes, then the audit fixes) | 316,000, then 341,000 |

  The final token table in the run's report compares the whole run with these figures.

## What it cost

- **Logged taste faults can hide a real gap.** The 070 reviewer flagged the missing Nicanor in `names.md` as taste,
  and it was logged, not fixed. The editor later found ten `names.md` faults (`feedback.md` item 16). A taste fault
  that touches a shared reference file should be fixed, or checked by a script.
- **Fewer captures leave less evidence of layout.** Desktop-only captures leave phone layout unchecked. Hover labels
  were not tested. Step 15, the read on a phone, has to cover this.
- **Skipped passes rest on the overseer's judgement.** Each one is logged as a cloud ruling so a reviewer can
  question it.

## Using it in another run

- Start in lean mode, not halfway. Write `rules.md` at step 4 and the fact-checker's clause-edit format at step 7.
- Keep the passes; cut the payload: captures, report length, resumes, taste fixes.
- Turn the mechanical checks into scripts: the rules linter, `names-check`, word counts and the card-frame check
  (`feedback.md` items 12, 16 and 17). Then lean mode needs no judgement to save tokens.
- Measure with `scripts/token-ledger.mjs` and compare runs as `evaluation.md` describes.
