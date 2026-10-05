# Battle plans

The major battles of this story are a header in the nav with an overview page and two to five phase pages.
The conventions are those of the Punic Wars story, `content/punic-wars/.plans/README.md`; read it, and Cannae
there (`pages/040-second-war/010-invasion/050-cannae/`, `.plans/cannae.mjs`) as the model generator. This file
records what differs here.

## Folders and ids

A battle group `NNN-<id>/` holds `group.yaml` and `010-<id>/`, the overview, with the battle id, the battle
card and the routes of the campaign. Phase pages are `020-<id>-<phase>/`, `030-<id>-<phase>/` and so on, with
no `battle` key and the same bbox on every phase. A group that holds two battles on one day, Jena with
Auerstedt or Ligny with Quatre Bras, gives the second battle its own overview page inside the group, for
example `050-auerstedt/` with `battle: auerstedt`, followed by its phases.

Single page battles (Lodi, Bussaco, Smolensk ...) keep their card on a campaign page and have no phases.

## Sides

Sides are the story's families: `france`, `britain`, `austria`, `prussia`, `russia`, `spain`, `portugal`,
`sweden`, `ottoman`, `rhine` (German and Polish allies of France), `client` (troops of the Bonaparte kingdoms,
the Italians of Eugène), `other`. Allies under one commander take his colour unless the plan is about them:
Wellington's Dutch-Belgians and Brunswickers are `britain`, the Prussians at Waterloo are `prussia`. The Mamluks
at the Pyramids are `ottoman`. Rivers and lakes take the `water` family, darker in the dark theme so that they stand
apart from the French blue.

## Unit types and sizes

`infantry`, `cavalry`, `light` (skirmishers, a loose row), `artillery` (a row of guns, `count`), `square` (an
infantry square), `camp`, `ships` (`count`, `rows`). Sizes are real:

- a battalion in line is about 150 to 200 m wide and 20 m deep; in column about 50 m wide and 60 to 80 m
  deep. Draw a division, 6,000 to 8,000 men in two lines or in columns, as one block about 800 to 1,500 m
  wide and 150 to 300 m deep, or split it into brigades when the plan needs them.
- a cavalry regiment, 400 to 600 horse in two ranks, is about 250 to 350 m wide.
- a battery of 6 to 8 guns is about 100 to 150 m wide. A grand battery of 80 to 100 guns runs 1.2 to 2 km.
- a ship of the line is about 60 m long; a line of battle keeps a cable, about 185 m, between ships.
- a phase bbox of 4 to 15 km fills the map at `max_zoom: 14`. Leipzig and Wagram need 20 km or more.

Draw corps and divisions as blocks named after their commander and strength ("IV Corps under Soult,
about 23,000"). Twelve units on a phase page at most, as in the Punic Wars rules, and fewer is better.

## Texts, images, zones

Same as the Punic Wars rules. Candidates are in `.candidates/<page-id>/` with `.candidates/index.yaml`.
Phase pages pick from their battle's candidates. Zones come from `.plans/zones.mjs` and
`.plans/zones.yaml`; battle and phase pages show none.
