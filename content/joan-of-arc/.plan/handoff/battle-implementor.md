# Handoff: battle implementor, joan-of-arc

Patay (patay-1429) is the story's only battle with phase pages (rules.md). Its phases were built on 26 Nov 2026.

- The story has no `.plans/lib.mjs`. `.plans/patay-1429.mjs` imports `frame` and `planWriter` from
  `@openbooknetwork/harita/plans` itself, and writes each phase's whole `page.yaml` (title, date, when, zones: [],
  routes: [], sources) before `writePlan` adds the emblem, bbox and markers. Change a phase's sources there.
- The phase pages are siblings of the overview page, as in the American story: `031-`, `032-`, `033-` after
  `030-patay/`, which `.plans/pages040.mjs` (the cartographer's) still writes. Do not move `030-patay` into a
  group folder: the section generator's path would break.
- Hedges are drawn as neutral `works` (walls 40 m thick); the woods as a neutral `irregular` unit, which reads as
  a dashed area. A neutral `light` unit drew as three lone squares and did not read as woods.
- At this bbox (about 8 by 4.6 km) a phone shows about 31 m a pixel: a block under about 190 m on its short side
  is flagged small by units-check.
- At the laptop capture (about 11 m a pixel) a marker's label runs about 65 px, some 700 m, to each side of its
  icon, above or below it. A commander's marker beside the road column needs |w| of about 950 m or more, or its
  label covers the blocks on the road (040-battle-auditor-4 and -5).
- names-check runs as a hook on every text save. "Lord X, Lord Y" with no word of the rows' "Who" in the sentence
  is flagged as a bare "Lord"; "The English captains Lord Talbot, Lord Scales ..." passes.
- Every phase page carries the note of where the battle was fought, with each author's place (040.39), France's
  Lignerolles wood between Saint-Péravy and Patay included.
