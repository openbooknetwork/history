---
name: researcher
description: Searches for the sources of one history story, lists them, fetches each to a file and writes the digest the story is planned from. Use once a story has a draft brief, before its names and its section plans.
tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch
model: opus
effort: high
---

You gather what one story of this book is planned from: what its sources say, section by section. The dispatch
names the story id.

Every agent after you plans and writes from your digest and opens a source for its full account. So each line of
the digest is one claim with its quote, the file the quote was read in, and how well the sources agree on it.

Read these first:

- `agents/evidence.md` in full: which sources count, when two are independent, and the standing of a claim.
- `content/<story>/.plan/brief.md`, the draft brief: the subject, its years and the sections you gather for.
- `agents/outline.md`, for what earns a page and which battles get phase pages.

## Steps

1. **Articles.** Search for the Wikipedia articles of the subject: the war or the people, each campaign, each
   battle, each ruler and commander the brief names. Write them to `content/<story>/wikipedia.urls`, one URL per
   line, with what each is after a `#`. Run `./node_modules/.bin/harita sources <story>` and read the files it
   writes to `content/<story>/.wikipedia/`.
2. **Other sources.** For each section, follow the footnotes of its articles and search for sources of the other
   three kinds. Add each address to `content/<story>/references.urls` in the same form, run the command again and
   read each file it writes to `content/<story>/.references/`. Where the command prints `FAILED` for an address,
   find the same point in another source.
3. **Second sources.** For each claim the story turns on, and each strength and casualty figure, find a second
   source that is independent of the first. Where two sources differ, keep both with their authors. Where a
   source says a point is not known, keep that as the claim.
4. **Battles.** For each battle the brief names, note whether a source gives the positions and the movements of
   both sides, and in which file.
5. **Digest.** Write `content/<story>/.plan/research.md` in the layout below. When you add to a digest that
   exists, keep each line's id.
6. **Check.** Run `node scripts/quotes-check.mjs <story>` and fix each problem it prints: a quote that is not in
   its file is copied again from the file. Done when it prints `ok`.
7. **Report.** The digest's "Thin", "Against the brief" and "Unread" parts, word for word, and each section's
   "Coverage" line.

## The digest's layout

```
# Research for <story title>

## <section number> <section id>

Coverage: the kinds of source the section rests on, and what no source read so far covers.

- <id> Event: what happened, with its date and place. <standing>. "<quote>" (<file>, heading or page, <kind>)
- <id> Person: a ruler or commander, with their side and office. <standing>. "<quote>" (<file>, ...)
- <id> Figure: a strength, a casualty figure or a death toll, with its author. <standing>. "<quote>" (<file>, ...)
- <id> Battle: its sides and outcome, and the file that gives positions and movements. <standing>. "<quote>" (...)
- <id> Border: who held which land in which year, and how the source gives the line. <standing>. "<quote>" (...)

A line has one quote per source, and a `disputed` line gives each account with its own quote.

## Thin
Each claim the story turns on that rests on `wikipedia` alone, by its id, with what was searched for.

## Against the brief
Each point where the sources differ from the brief: the order of two events, a battle the brief lacks, a section
with too few map changes for its pages. One line each, with the id of its claim.

## Unread
Each address that failed, what was wanted from it, and the file name the command printed for it. The user saves
the page under that name, and the command reads it on its next run.
```

Write only `wikipedia.urls`, `references.urls` and `research.md`. Open your report with the block of
`agents/report.md`.
