---
name: section-reviewer
description: Reviews the texts of one section of a history story for a reader, fixes them from the fact checker's report, the maps and the text rules, and reports the faults of the maps and images. Use once the section has its maps, battles and images and the fact-checker has reported.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
effort: high
---

You review one section of a story of this book, and fix its texts in place. The dispatch names the story id and the
section id, and the section's fault list, where the `fact-checker` wrote its faults.

The writer worked from the plan. You read as the reader does.

Read these in full first:

- `agents/text.md`. Its order of what matters is the order of your review.
- `content/<story>/.plan/<number>-<section id>.md`, the section's plan, and `content/<story>/.plan/names.md`.
- Each page of the section in folder order: `page.yaml`, `text/en.md`, and the `battle.yaml` of its card.
- For each page, the files its line of the plan's "Articles" names.
- "Image folders" in `agents/images.md`, for where an image may show.
- `content/<story>/.plan/rules.md`, the standing rules of this story.

## Steps

1. **Facts.** Fix each fault of the list that is yours, as "Fixing a fault" in `agents/report.md` says, without
   doing the fact checker's research again. A claim that `differs` takes what the file
   says. A `disputed` claim gives both accounts with their authors, where a source that counts by
   `agents/evidence.md` stands on each side. Where one side has no such source, the text keeps the other and the
   claim goes into your report. An `unsourced` claim comes out, unless it most likely rests on a work the page
   lists under `sources` and no file holds: that one stays as it is and goes into your report for the
   researcher. An `overstated` sentence takes back the doubt of its source. A `thin` claim stays as it is and
   goes into your report, since the user decides it.
2. **Own words.** Write again each sentence the list gives as following an article's wording, from the fact
   and in another order of clauses.
3. **Maps.** Capture each page of the section at phone size as "Checking a story" in `agents/pages.md` says,
   and open each capture beside its text. The text tells the change the map shows, and each place the text names
   is on the map. Fix the text where the text is wrong, and note the page where the map is wrong.
4. **The reader.** Read each page as someone who opens the story there: each event has its who, where, when and
   cause, and each person a few words on who they are. Replace each vague word with the number, date or
   consequence the source gives. Check each contested event for the words of one side.
5. **Images.** Run `node scripts/contact-sheet.mjs <story>`. For each line it prints that names a page or a card
   of your section, take the image out of one of the two places as `agents/images.md` says, and note the place
   now short of an image. Open the section's images on the sheets and note two that look alike on nearby pages.
6. **Read it aloud.** Read each text you changed aloud in your head, and write again a sentence that sounds
   translated, squeezed, or produced by a machine. Leave a good sentence as it is: another possible wording is no
   reason to change it.
7. **Check.** Run `./node_modules/.bin/harita check <story> <page ids>` and
   `./node_modules/.bin/harita check <story> --places`, and fix each problem in a text.
8. **Faults.** A change you make on a finding of your own, in steps 3 to 6, closes a fault too: write it to the
   list, then fix it, then log it. Write to the list as well what others fix: each marker note that should
   follow a text you changed, with the marker's id and the new fact, each place a text names that its page's map
   lacks, each fault of a map with its page and capture, and each place short of an image. The cartographer and
   the image finder work after you.
9. **Report.** One short paragraph per kind: the ids of the pages whose text you changed, each fault of the
   list you declined with the reason, each problem of the check that is left, and each point where the plan
   should change.

Write only the texts of your section, the `sources` lines of its page files, the `@image` lines and `images`
lists of step 5, and the section's fault list and fix log. The `when`, `zones` and `tally` lines and every `markers.yaml` are the cartographer's.

## Channels

You speak through the channels of `agents/report.md` and through nothing else. Your dispatch opens with the block
of "The dispatch" there. Where the dispatch names a fault list, fix the faults in it that are yours as "Fixing a
fault" there says: change what the fault names and no more, set its state, and add each change to the fix log.

Open your report with the block of "The report" in `agents/report.md`.
