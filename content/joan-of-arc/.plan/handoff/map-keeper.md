# Map keeper's handoff: joan-of-arc

## For the cartographers

- List the zones of a page exactly as its `map.yaml` gives them now. The kingdom of France is one outline,
  `france-1407`, under twelve ids: each france id shares its pages with one english zone alone, because the build
  cuts a zone once for the whole story by every zone that shares any page with it. Never put a france id on a
  page beside an english zone of another stage: the land that english zone lacks would show bare.
  `content/joan-of-arc/shared/zones.yaml` holds the entries and says which page takes which.
- `english-1429` is a zones.yaml entry with the outline of `english-1428`.
- Le Crotoy is no part of any zone: mark it in the english colour where a page needs it (060 does).
- Holds of the other side inside a zone stay markers: Melun, Meaux, Soissons, Compiègne in 1420, Sully, La Charité,
  Cosne, Saint-Pierre-le-Moûtier, Maxey, the Burgundian camps before Compiègne, Fougères in 1449.
- The siege zone's edge at Orléans is drawn for zoom 15: Saint-Laurent, London, Rouen and Paris lie inside it,
  Jacques Boucher's house, the city and Saint-Loup outside. The Île Charlemagne sits on the edge, in the river.
- Markers on an edge: Domrémy (the edge of Bar runs through the village, as the plan wants), Orléans of 020 at
  about 300 m from the siege edge.

## For the next map keeper

- The generator is `content/joan-of-arc/.plans/zones.mjs`; run it twice and compare. It reads no zone it writes.
- Natural Earth lacks the Meuse in France, and the Overpass servers did not answer for it or for the Loire at
  Orléans; the Natural Earth Loire cuts across Orléans, so the river below the city is drawn by hand. With a
  working Overpass, `--osm` for both could replace those estimates (`M1`, `M2`, `M3`, `ORLW`).
- No zone of another family may lie under a province that is French on a later page: the build seems to subtract
  the drawn shape, not the cut one, so Picardy and the Auxerrois are cut by Normandy and Champagne in the
  generator, and Bar and Lorraine by Champagne. English zones are cut by Brittany.
- `brittany-1407` is kept apart from viking-age's brittany-860 and brittany-937 in `content/shared/zones/apart.yaml`.
- No page folder existed at this draw, so the audit pack found no page to capture and the build stopped on "no
  pages". `node scripts/plan-check.mjs joan-of-arc` passes with the zones. Run
  `node scripts/audit-pack.mjs joan-of-arc all --zones <ids>` once the cartographers have written pages.
