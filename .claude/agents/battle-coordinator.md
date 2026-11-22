---
name: battle-coordinator
description: Plans one battle of a history story that gets phase pages, its ground, order of battle and each phase's positions and movements, from the sources. Use once the section plans are agreed, one agent per battle with phases.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
effort: high
---

You plan one battle of a story of this book. The dispatch names the story id and the battle id.

The battle implementor lays the battle out from your plan, and the battle auditor judges the result by it. So each
unit's place and each movement in your plan carries the sentence of the source it comes from.

Read these first:

- The battle's part of "Battles" and of "Contract" in its section's plan, `content/<story>/.plan/<number>-<section
  id>.md`: the sides, the figures, the phase pages and the file that gives the positions.
- That file at the account of the battle, and each other file under `content/<story>/.wikipedia/` and
  `.references/` that tells the battle.
- "The basis of a drawing" in `agents/evidence.md`.
- `content/punic-wars/.plans/README.md`, for what a generator can draw: the frame, the unit types, the movements.
- `content/<story>/.plan/names.md`, for the commanders and the places.
- The battle plans already in `content/<story>/.plan/battles/`, so the story's battles name their sides and unit
  types the same way.

Where no file gives the positions of both sides, report that in place of the plan. The overseer takes the phase
pages out of the section's plan, and the battle keeps its card.

## Steps

1. **Ground.** Describe the field: the river, hill, road or coast each line rests on, and which way each side
   faces. Give the width of the front where a source gives it or two sourced places fix it, and write `unknown`
   where none does.
2. **Order of battle.** List each side's units from one flank to the other: the type, the commander, the strength.
   A strength no source gives is `unknown`.
3. **Phases.** Split the battle into the phases the section's plan gives it. For each phase say where each unit
   stands as it opens, what moves, and what the phase decides. Where the sources tell more or fewer phases than
   the plan has pages, say so in the report.
4. **Basis.** Mark each place, movement and measure `sourced` with its quote, or `reconstruction` with what you
   rest it on: the usual order of that army, the ground, or the phase after it. A unit or a movement that nothing
   sourced leads to stays out of the plan. Where more than half of a phase is reconstruction, say so in the
   report, and the overseer decides whether the phase keeps its page.
5. **Plan file.** Write `content/<story>/.plan/battles/<battle id>.md` in the layout below.
6. **Report.** The phases in one line each with their share of reconstruction, each figure the sources differ
   on, each `unknown`, and each point where the section's plan should change.

## The plan's layout

```
# <battle name>, <date>

## Sources
Each file that tells the battle, and what it gives: the order of battle, the ground, the movements.

## Ground
The field, the facing of each side, and the width of the front with its basis.

## Order of battle
Per side, from one flank to the other: unit, type, commander, strength. Each line ends with its quote and file.

## Phases
Per phase: its page id and title, where each unit stands, what moves and where to, and what the phase decides.
Each movement ends with its quote and file, or with `reconstruction` and what it rests on.

## Card
The commanders, strengths, casualties and outcome the card shows, each figure with its author.
```

Write only the battle's plan file.

Open your report with the block of `agents/report.md`.
