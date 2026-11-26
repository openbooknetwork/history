# Map keeper's handoff: joan-of-arc

## For the cartographers

- List the zones of a page exactly as its `map.yaml` gives them now. The kingdom of France is one outline,
  `france-1407`, under thirteen ids: each france id shares its pages with one english zone alone, because the build
  cuts a zone once for the whole story by every zone that shares any page with it. Never put a france id on a
  page beside an english zone of another stage: the land that english zone lacks would show bare.
  `content/joan-of-arc/shared/zones.yaml` holds the entries and says which page takes which.
- `english-1429` is a zones.yaml entry with the outline of `english-1428`.
- From beaulieu-and-beaurevoir on (May 1430), the pages take `burgundy-1430` (burgundy-1420 with a circle round
  Soissons), and beaulieu-and-beaurevoir, sold-to-the-english, the-court and burgundy-changes-sides take `english-1430`
  (english-sep-1429 less circles round Melun and Sens; Montereau and Chartres English) with `france-1430`.
  burgundy-changes-sides shows December 1431, by the cloud ruling. The three Rouen pages keep `english-sep-1429` alone;
  compiegne and melun-and-lagny keep burgundy-1420, and their markers soissons-1430 and melun-1430 carry the change.
- montepilloy takes `english-compiegne-1429` with `france-compiegne-1429`: Bray on the Seine is English in it, and
  it is gone in `english-sep-1429` from back-to-the-loire on.
- Aumale and Blangy (the Norman bank of the Bresle) stay English in every zone from 1420 to 1449: their change of
  hands in August 1429 is carried by the markers aumale-1429 and blangy-1429 of montepilloy, in the france colour.
- `english-1436` holds Meaux, Creil, Beaumont-sur-Oise, Crépy, Montereau and Mantes as circles of 5 km outside
  Normandy; Chartres, Étampes, Sens, Clermont, Pont-Sainte-Maxence and Meulan are outside it.
- Le Crotoy is no part of any zone: mark it in the english colour where a page needs it (060 does).
- Holds of the other side inside a zone stay markers: Melun, Meaux, Soissons, Compiègne in 1420, Sully, La Charité,
  Cosne, Saint-Pierre-le-Moûtier, Maxey, the Burgundian camps before Compiègne, Fougères in 1449.
- The land east of the Meuse from Mézières to Stenay (Sedan, Mouzon, Carignan), the Givet salient, and Roussillon
  with the Cerdagne stand in no zone, by the rulings on story-overseer-4 and -5. Mark nothing there in a zone's colour.
- The siege zone's edge at Orléans is drawn for zoom 15: Saint-Laurent, London, Rouen and Paris lie inside it,
  Jacques Boucher's house, the city and Saint-Loup outside. The Île Charlemagne sits on the edge, in the river.
- Markers on an edge: Domrémy (the edge of Bar runs through the village, as the plan wants), Orléans of 020 at
  about 300 m from the siege edge.

## For the next map keeper

- The generator is `content/joan-of-arc/.plans/zones.mjs`; run it twice and compare. It reads no zone it writes.
- `france-sep-1429` must stay off every page with burgundy-1430, or Soissons shows bare there: each france id meets one
  english and one burgundy stage.
- Natural Earth lacks the Meuse in France, and the Overpass servers did not answer for it or for the Loire at
  Orléans; the Natural Earth Loire cuts across Orléans, so the river below the city is drawn by hand. With a
  working Overpass, `--osm` for both could replace those estimates (`M1`, `M2`, `M3`, `ORLW`); the mask that cuts
  Champagne at the Meuse reuses `KBc` and the first points of `M1`.
- No zone of another family may lie under a province that is French on a later page: the build seems to subtract
  the drawn shape, not the cut one, so Picardy and the Auxerrois are cut by Normandy and Champagne in the
  generator, and Bar and Lorraine by Champagne (the whole province, not `CHAMPAGNE_K`). English zones are cut by
  Brittany, and the cut of September 1429 by Normandy.
- `brittany-1407` is kept apart from viking-age's brittany-860 and brittany-937 in `content/shared/zones/apart.yaml`.
- No page folder exists yet, so `node scripts/audit-pack.mjs joan-of-arc all --zones <ids>` finds no page and
  captures nothing. `node scripts/plan-check.mjs joan-of-arc` passes. Run the pack once the cartographers have
  written pages, for the zones of this fix too: france-1407, the english zones of 1420 to 1436 and
  english-compiegne-1429.
