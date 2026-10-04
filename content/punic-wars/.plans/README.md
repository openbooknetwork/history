# Battle plans

Every battle in this story is a header in the nav with an overview page and two to four phase pages. The
overview page keeps the battle id, the battle card and the routes of the campaign. The phase pages show
the armies on the field at one moment each, drawn by the `battle-plan` emblem
(`plugins/emblems/battle-plan.mjs`, its header lists every parameter).

Cannae is the model: `pages/040-second-war/010-invasion/050-cannae/` and `.plans/cannae.mjs`. Read both
before writing a battle.

## Folders and ids

A battle page `NNN-<id>/` becomes a group folder of the same name with a `group.yaml`
(`title: "Battle of Cannae, 216 BC"`, or "Siege of ..."), holding:

- `010-<id>/`: the overview, the old page moved down one level. It keeps the id, the battle card, the images
  of the whole battle and the routes of the approach. Its text covers the campaign, the armies and the
  ground, up to the morning of the battle.
- `020-<id>-<phase>/`, `030-<id>-<phase>/`, ...: one page per moment, ids like `cannae-deployment`,
  `mylae-corvus`, `zama-elephants`. No `battle` key, so no card covers the plan. Same bbox on every phase
  of one battle, so the camera holds still while the troops move.
- Optional last phase `<id>-aftermath` at a regional bbox with routes of the flight or pursuit, when the
  aftermath has its own movements and numbers.

Two phases for a skirmish or a short siege, three or four for a major battle.

The American and Atatürk stories keep their battle pages where they are, since most of those pages also tell
other events. Their phase pages are siblings right after the page that carries the battle, numbered between it
and the next page, with a `when` that keeps the order or none where the nav runs against the calendar.

## Generators

Each battle has `.plans/<id>.mjs`, run with `node .plans/<id>.mjs` from the story folder. It lays the field
out in a local frame and calls `writePlan` per page (`lib.mjs` binds the shared `scripts/plans.mjs` to this
story), which writes the emblem and bbox into `page.yaml`, the page's own markers into `markers.yaml`, routes
into `routes/`, and the page's `markers` and `routes` lists. The generator owns those keys: change the
generator and rerun it.

- `frame(origin, bearing)`: u runs along `bearing`, w 90° clockwise from it. Put u along the battle line
  and w from one army towards the other, as in Cannae. `f.face(90)` and `f.face(270)` are the two armies'
  facings.
- Real geography: put the frame on the real site, from the article's coordinates. Rivers, lakes,
  lagoons and harbours that matter are drawn as `water` from their real course. The map shows coasts and
  relief only. `node scripts/coast.mjs <country> w s e n` prints the coast the map draws, to fit water and
  walls to it.
- Sizes are real: a legion's front is about 500 to 600 m, a consular army's infantry 1.5 to 2.5 km,
  ships a few hundred metres per squadron row. This story's `max_zoom` is 14, so a phase bbox of 4 to 12 km
  fills the map. A field under 2 km across wants `max_zoom: 16`, as in the American story.

## Drawing rules

- Every unit, arrow, work and water has an `id` and a `name`. The name shows when the reader points at it:
  who it is, the commander and the strength where known ("Roman cavalry under Paullus, 2,400"). Pieces that
  share an id highlight together, such as two wings of one body. Turkish goes under `emblems.<page id>.<id>`.
- Sides take one colour each: a family of the story (`rome`, `carthage`, ... in the story's own colours for
  each theme), or `iberians`, `rebels`, `neutral` from the plugin, or a hex colour. Allies take their side's
  colour. Numidians fighting for Rome are `numidia`, so Masinissa stands out at Zama.
- At most about 12 units, 6 markers, 5 arrows and 4 clashes on one phase page. Fewer is better.
- Units of one side must not overlap. Leave 50 to 100 m between two lines in contact and mark the contact
  with a clash.
- Movement during the phase is an arrow. An attack ends on or over the target. A retreat or rout is
  `style: dashed`. A unit's position at the end of the phase is its block.
- Markers name the commanders and units: `icon: user` for a commander, `swords` for a unit, `skull` for a
  unit destroyed or a commander killed, `flag` for a camp, `ship` for a squadron. Label short, note at most
  six words. Place markers beside a block. Marker ids are `<page-id>-<name>`.
- Routes (overview and aftermath pages only) carry names that show in the legend:
  "Hannibal’s march from Geronium to Cannae, spring 216 BC". Ids `<who>-<year>`, unique in the story.
  `offset: 6` separates two routes along the same road.

## Texts

Same register as every page in the story (see the memory note on text style): present tense, plain,
factual, two or three paragraphs of two to four sentences, no drama, no reference to the map. A phase
page describes what happens in that phase, with the numbers and the names. The overview page loses the
details the phases now carry. Turkish says the same in natural Turkish.

## Images

Candidates are in `.candidates/<page-id>/`, described in `.candidates/index.yaml` (title, author, licence,
size, description). Copy a chosen file into the page's `images/` as `<image-id>.<ext>` and delete the
placeholder SVG. Credit: `Wikimedia Commons, <author>, <licence> (<Commons file title>)`. Caption: what it
shows, who made it, when. Prefer ancient objects, coins, sites and well known paintings. Skip Wikipedia
diagram maps, modern photos unrelated to the event, and repeats. Look at an image before choosing it if the
title leaves doubt. Two or three on an overview page, one or two on a phase page.

## Zones

`.plans/zones.mjs` draws every territory zone into `shared/zones/` and lists which page shows which zones in
`.plans/zones.yaml`. Zone names there are English, and their Turkish lives in `i18n/tr.yaml`, where
`harita i18n tr --story punic-wars` adds an empty key for a new zone. Rerun the script after a change, then
`node scripts/merge-parts.mjs punic-wars zones` from the repo root writes each page's `zones:` line. Close
battle views and phase pages show no zones.

## Checking and parallel work

See `AGENTS.md` at the repo root.
