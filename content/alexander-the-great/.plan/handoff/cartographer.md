# Cartography notes

Notes for the next cartographer, beyond `rules.md` and the scripts in `.plans/`.

## router.cjs
- `fix(mode, coords)` with `mode` `'sea'` or `'land'`. It keeps every straight leg that stays on its surface. Where
  a leg leaves the surface, it searches a 0.01° grid (A*, with a 0.005° margin from the coast) and pulls the path
  straight again. It drops waypoints that lie on the wrong surface, and it leaves the first and last few points
  free, so a route can start or end on a coastal town. It rounds coordinates to 4 decimals.
- CLI: `node .plans/router.cjs <sea|land> <route.geojson>...` rewrites the files in place.
- Don't run it on a route that crosses water on purpose: the Hellespont crossing in `advance-force-336`, or a river
  voyage like `fleet-332b` up the Nile. Both page scripts skip those ids by name.

## pages0X0.cjs
- Each page script writes `group.yaml` files, `page.yaml` files (with `battle:` when the page has a card) and the
  routes in each page's `routes/` folder. It never touches `text/en.md`.
- A route's family colour, its `offset` for the return leg, and `arrows: false` for roads all go in the
  `route(name, color, coords, extra)` call.
- Sea routes are listed in a `SEA` set. Every other route is routed as land.
- Pages get rewritten whole, so a card-site marker the battle-implementor removed must also come out of the
  script's `markers` list. Otherwise the next run puts it back.
- Check routes with `node scripts/route-surface.mjs <sea|land> <file>`. A few hundred metres off at a port is
  normal.
- Reviewers edit `sources` in page.yaml. Every page script now keeps the `sources` block already in page.yaml and
  writes its own list only for a new page. It does not keep anything else: `markers`, `zones`, `bbox` and `battle:`
  come from the script, so bring its lists in line with page.yaml (marker removals under cards, reviewers'
  `battle:` lines) before a rerun, and `git diff` the page.yaml files after it: only the intended changes may show.
- `pages060.cjs` takes `NO_BATTLE=1` to write the `battle:` lines commented out, for captures before the cards exist.

## zones.cjs
- `poly`, `union` and `diff` wrap turf. `town(c, km)` is a circle, for a town left out of a zone.
- `noIslands(f, points)` cuts out the Natural Earth island holding each point, buffered by 1.5 km. The points are
  named in `ISL`. Some 10m islands have no polygon at their name point, so check with `--check`, which lists each
  zone's land pieces.
- Each conquest zone is the union of the one before plus the region added. A `*full` variant is kept where a
  later stage needs land that an earlier one cut out (for example `macedon-333full`, which still holds Myndus and
  Caunus).
- Persia's base polygon follows the middle of the Hellespont, the Propontis and the Bosporus, and its `clip` leaves
  out Greece, Bulgaria, Libya and India. Every Persian stage entry in `zones.yaml` must repeat that `clip`.

## Traps
- The build subtracts a zone before it clips it. A zone whose edge should be a river, such as `triballi-335` on the
  Danube, has to be cut to the country border inside the script.
- Two neighbouring outlines must share their vertices exactly. Otherwise the rounding leaves Persian slivers
  between them; this happened at İskenderun and along 29.1 E.
- On a desktop the docked battle card covers the east of the frame. Lean a card page's bbox west, or check the
  capture with the card open.
- `harita check` does not catch a marker under a card's swords, a zone over the sea, or a missing rule-C zone.
  Only a capture shows those.

## 060 on
- Bessus's kingdom is `persia-330b` (its own outline, Bactria and Sogdiana); `persia-329` is its stage entry, cut by
  macedon-329 to Sogdiana. `persia-330` stays 050's stage entry on persia-336.
- Each rebel stage (`sogdians-329` on 030, `sogdians-329b` on 040, `sogdians-328` on 050) cuts macedon-329b on every
  page, so 030 shows macedon-329b and 040, 050 and the 327 page show their own zones.yaml entries on its outline
  (`macedon-329c`, `macedon-328`, `macedon-327`). 070's first page uses macedon-327.
- The Oxus is the Afghan border from 66.52 E to Khorog (`OXUS` in zones.cjs), hand-drawn west of it; the Jaxartes
  line is `JAXARTES`. Margiana, Carmania, Gedrosia and the Pamirs east of the Panj stay blank in 060.
- persia-336 leaves out the hills of the mountain Uxians (`UXIAN_HILLS`, Arrian 3.17.1), so every Persian stage does.

## 070 on
- `rivers.cjs` writes `rivers.json`, the Indus, Jhelum, Chenab, Ravi, Beas and Sutlej from Natural Earth's 10m river
  centrelines (public domain), in downstream order. zones.cjs (`seg`) and pages070.cjs (`river`) take stretches of
  them between the vertices nearest two points, so neighbouring zones share the river's vertices exactly. The
  Kabul river is not in the 10m file; the Cophen road is drawn by hand.
- `indians-327` is whole on 010-cophen; `indians-326` (with macedon-326), `indians-326b` (with porus-326b too) and
  `indians-325` (with macedon-325a) are its stage entries. Taxila and Porus are their own outlines, left out of it.
- macedon-325a is macedon-326 plus `MALLI_INDUS`: it keeps off Taxila and Porus by construction, since macedon
  would cut them. Carmania, Gedrosia and Ora stay blank in 070.
- The 070 route of Alexander from Bactra is `alexander-327b`: `alexander-327` is 060's.

## 080 on
- `macedon-325` is macedon-325a plus `GEDROSIA` and `CARMANIA` (zones.cjs); `macedon-324` is its zones.yaml entry. `CARMANIA` is in it
  too (cloud ruling, Arrian 6.27–28); Gedrosia's west edge is the east side of the Jaz Murian. macedon-325a also holds `THAL` (the Derajat and the
  Sind Sagar doab, Philip's satrapy, Arrian 6.15), so the Indus delta joins the main outline.
- `pages080.cjs` builds each route from parts, `[['land', coords], ['sea', coords]]`, each kept on its own surface;
  a river voyage is a `land` part. A part that starts on another point than the last one ended keeps both points.
  Check a mixed route with route-surface in both modes: each wrong stretch must be exactly the other part.
- 020 lists 070's `craterus-325`; it already ends in the upper Halil Rud valley, so it is not redrawn.
- pages070.cjs takes `seaTail` on a land route for a stretch out past a river mouth (fleet-325).
- Headless Chrome on Linux crashes at phone size (390x780) and on 070-ocean at any size; desktop captures of the
  080 pages work. Some captures show route badges without their lines: an old frame, not a missing route.

## 090
- `macedon-323` (010) and `macedon-320` (030) are two entries on macedon-325: seleucid-320 would cut Babylonia out of
  macedon-323 on 010 too. `macedon-322` is the Lamian War entry on macedon-348.
- The 090 outlines are built from the conquest regions (PHRYGIA, CAPPADOCIA, SYRIA_N, MESO, EGYPT...), with `LINE_N`
  the Antigonus–Seleucus line across the two rivers above Babylon. antigonus-316 and seleucid-306 start from
  persia336raw (Uxian hills inside), so their east edge is persia-336's.
- pages090.cjs routes take parts like pages080.cjs; a strait crossing is the jump between two land parts
  (lysimachus-302 over the Hellespont).
