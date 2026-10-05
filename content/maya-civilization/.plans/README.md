# Battle plans

The battles of the Spanish conquest are a header in the nav with an overview page and two to four phase pages.
The conventions are those of the Punic Wars story, `content/punic-wars/.plans/README.md`; read it, and Cannae
there (`pages/040-second-war/010-invasion/050-cannae/`, `.plans/cannae.mjs`) as the model generator. This file
records what differs here.

## Which battles get phase pages

The wars of the Classic period are known from inscriptions, which give the date, the kings and the result but
not the movements on the field. Those battles keep a card on their page and have no phases. The battles of the
conquest are described by Spanish witnesses such as Bernal Díaz and Pedro de Alvarado, and by Maya chronicles
such as the Annals of the Kaqchikels. Those with positions and movements in the sources get phase pages:
Champotón 1517, Centla 1519, Xelajú 1524, Zaculeu 1525 and Nojpetén 1697. Draw only what the sources describe.
Where the ground is known by tradition only, say so in the text ("by local tradition").

## Folders and ids

A battle group `NNN-<id>/` holds `group.yaml` (`title: "Battle of Centla, 1519"`) and `010-<id>/`, the overview,
with the battle id, the battle card and the routes of the campaign. Phase pages are `020-<id>-<phase>/`,
`030-<id>-<phase>/` and so on, with no `battle` key and the same bbox on every phase.

## Sides

Sides are the story's families: `spain`, `nahua` (the Tlaxcalan and other Mexican allies of the Spanish, when the
plan is about them), `chontal` (Champotón, Potonchán, Campeche), `kiche`, `kaqchikel`, `highland` (Mam,
Tz'utujil and the other highland peoples), `itza`, `xiu`, `cocom`, `eastern`. Allies under one commander take
his colour unless the plan is about them. Rivers, lakes and lagoons take the `water` family.

## Unit types and sizes

- Spanish foot (sword and buckler, pikes): `infantry`. A company of 100 men in five ranks is about 25 m wide and
  5 m deep; Cortés's 400 foot at Centla in one body about 80 m by 20 m.
- Crossbowmen: `archers`. Arquebusiers: `light`. Falconets and lombards: `artillery` with `count`. Horsemen:
  `cavalry`; a dozen riders abreast about 20 to 30 m.
- Ships, brigantines, Ursúa's galley and Maya canoes: `ships` with `count`. A caravel is about 20 m long, a
  war canoe 10 to 15 m.
- Maya warriors with spears, clubs and obsidian swords: `infantry`. Archers and slingers: `archers`. Loose
  hosts and levies: `irregular`. Several thousand warriors as one block 300 to 600 m wide and 60 to 150 m deep.
  The Spanish figures for Maya armies are high (Bernal Díaz gives 40,000 at Centla); write the source's number
  with its author in the name ("the Chontal army, 40,000 by Bernal Díaz") and draw the block for the field.
- Walls, palisades, ravines cut as defences: `works`. Zaculeu and Nojpetén can be a `fort` or walls along the
  real edge of the site.

Twelve units on a phase page at most, as in the Punic Wars rules, and fewer is better.

## Drawn size

The sizes above are real. A conquest battle is small, and at real size 400 Spaniards are a sliver of a few pixels,
so the plans draw small forces larger.

- The phase bbox frames the fighting: about 1.5 km, wider only where the movement needs it (the Xelajú valley 6 to
  10 km). Every phase of a battle keeps the same bbox. Xelajú is two fights six days apart, so the pass and
  Urbina share one view and Olintepeque has its own.
- Each unit's front is at least 5% of the bbox's shorter side and its depth at least 2%, so 75 m by 30 m in a
  1.5 km view. Forces above that keep their real size, so the Maya hosts stay larger than the Spanish companies.
- `ships`: width and depth large enough that each hull is at least 2% of the bbox's shorter side long.
- A clash star's `size` is about 3% of the bbox's shorter side. It sits on the line where the two sides meet,
  beside the units.
- Marker labels stand clear of the unit blocks.

## Real ground

Put the frame on the real site. Rivers, lakes and the shore are drawn as `water` from their real course.
`npx harita coast Mexico w s e n` prints the coast the map draws. Lake Petén Itzá, the Grijalva and Champotón
rivers and the ravines of Zaculeu are not on the base map: draw them from the best coordinates you have, and
keep the island of Nojpetén at its real size, about 500 by 350 m.

## Texts, images, zones

Same as the Punic Wars rules. Candidates are in `.candidates/<page-id>/` with `.candidates/index.yaml`.
Phase pages pick from their battle's candidates. Zones come from `.plans/zones.mjs` and `.plans/zones.yaml`;
battle and phase pages show none.
