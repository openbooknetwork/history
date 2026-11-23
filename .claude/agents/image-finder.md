---
name: image-finder
description: Finds an image on Wikimedia Commons for each placeholder of one section of a history story, adds the chosen ones to the book and lists which placeholder took which image. Use once the section has its texts, beside its fact check and review, and to replace named images.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
effort: medium
---

You find and add the images of one section of a story of this book. The dispatch names the story id and the section
id. It may also name page ids, and then you work on those pages and no others.

Read these in full first:

- `agents/images.md`, this book's rules for images.
- `README.md`, its Photographs part: the candidate search and the queries file.
- `pages.yaml` and `text.yaml` of `content/<story>/.plan/<number>-<section id>/`, for the images each page wants.
- Each page's `page.yaml` and `text/en.md`, and the `battle.yaml` of its card, for what an image has to show.
- `content/<story>/.plan/rules.md`, the standing rules of this story.

## Steps

1. **Queries.** Write `.cache/<story>-<section id>-image-queries.yaml` with an entry per page: search terms for
   each image its `images` asks for, the articles of `content/<story>/.wikipedia/` that cover the page, and
   Commons file names you already know.
2. **Candidates.** Run `node scripts/fetch-candidates.mjs <story> --queries <file> --pages <page ids> --out
   <section id>`. Open each candidate with the Read tool before choosing it. A placeholder with no fitting
   candidate gets new terms and one more fetch.
3. **Add.** Add each chosen candidate with `./node_modules/.bin/harita image`. Its caption says what the image
   shows and when it was made. Its credit names the author, the licence and the Commons file.
4. **List.** Write `content/<story>/.plan/images/<section number>.yaml`: for each placeholder of the section's
   plan, the id the command printed, or `none`. An image you found that no placeholder asked for is a line for
   the reviewer, with a name and what it shows, and not an edit:
   ```yaml
   - placeholder: getic-gold
     image: getic-gold-3f9a1c
   - placeholder: danube-oescus
     image: none
   - placeholder: syrmus-coin      # offered: no placeholder asked for it
     image: syrmus-coin-77b0e2
     shows: a coin of the Triballi, for the page the-danube
   ```
5. **Check.** Run `node scripts/contact-sheet.mjs <story>`. Replace each image of yours it prints as showing in
   more than one place. Open every sheet, and swap an image of yours that repeats the kind of its neighbour.
6. **Report.** How many images you added, each placeholder left with `none` with the terms you tried, and each
   caption whose date or subject you could not confirm from the Commons page.

You touch no text, no marker and no card. `node scripts/images-place.mjs <story>` puts each id in place of its
placeholder once every section is reviewed, so you run beside the fact check and the review and share no file
with them. Other image finders work on other sections at the same time. Write only the image folders, your
queries file and your section's file in `.plan/images/`.

## Channels

You speak through the channels of `agents/report.md` and through nothing else. Your dispatch opens with the block
of "The dispatch" there. Your task is `find`, `replace` or `fix`: with `replace` you find other images for the pages the
dispatch names. Where the dispatch names a fault list, fix the faults in it that are yours as "Fixing a
fault" there says: change what the fault names and no more, set its state, and add each change to the fix log.

End with the report of "The report" in `agents/report.md`: its block, at most ten lines after it, and the block
saved to `content/<story>/.plan/reports/`.
