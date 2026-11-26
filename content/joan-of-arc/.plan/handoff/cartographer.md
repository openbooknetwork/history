# Cartographer's handoff: joan-of-arc

- Section 020 keeps its page files in a generator, `content/joan-of-arc/.plans/pages020.mjs`, the model for the
  other sections: it writes `group.yaml`, each `page.yaml`, a `markers.yaml` in each page folder (no
  `shared/markers.yaml`, so sections drawn side by side never write one file) and each page's `routes/`. Section
  010's generator, `pages010.cjs`, writes its markers as a block of `shared/markers.yaml` instead; both work, and
  marker ids are global to the story either way, so check a new id against both. Run
  `node content/joan-of-arc/.plans/pages020.mjs && node scripts/audit-pack.mjs joan-of-arc 020 --no-shots`.
- The story has no tally: write none.
- Coordinates: take the points of `content/joan-of-arc/.plans/zones.mjs` (its `pick` table, about line 195) where it
  has the place, so a marker and a zone test agree. Orléans 020 stands at [1.90, 47.90], the Tourelles at
  [1.907, 47.896], Rouvray under the Herrings card at [1.946, 48.267].
- names-check reads each marker's label and note as one sentence. A lowercase "the" before a common noun ("the
  abbey", "the altar", "the middle of April") is taken for a bare title and fails; "the Marne", "the English",
  "the faith" pass. Write round it.
- An english route on an english zone, such as Vergy's march across Champagne, shows faint or not at all: the line
  takes the zone's colour. Nothing in the plan changes that; say so to the map auditor rather than recolour.
- Every zone list is the plan's, and the map keeper's handoff says why each france id goes with one english id.
- The audit pack takes captures from its own build when run without `--no-shots`; serve its `site/` folder with
  `python3 -m http.server` and `SHOT_WAIT=12000` for a page whose routes were still drawing.
- Section 030 is `content/joan-of-arc/.plans/pages030.mjs`, built on 020's; it reads each page's `sources` from the
  plan's `text.yaml` (`import { load } from 'js-yaml'`: the module has no default export). Its head comment gives
  the Loire at Orléans it draws by (north bank by the bridge about 47.8975 N, south bank about 47.8942 N), since
  Natural Earth's Loire cuts across the city and Overpass does not answer. Reuse those points for any later page at
  Orléans (040's Loire towns, 070's feast), so the forts and the river agree.
- names-check also fails a rank or title the row does not write whole: "Marshal de Boussac" (write "Boussac"),
  "Lord Scales" (write "Thomas, Lord Scales"), and "the bridge" / "the townsmen" in a note.
- route-surface cannot judge a boat route on a river (030's boats-1429-checy): it reads as land and passes. Judge
  it on a capture.
- Section 040 is `content/joan-of-arc/.plans/pages040.mjs`, built on 020's; it reads each page's `sources` from
  `text.yaml` by text match, without js-yaml. Its points are the zone generator's `T` where it has the place
  (Orléans [1.909, 47.902], Janville, Meung, Beaugency, Patay, Troyes, Reims cathedral). The places of the march to
  Reims and back to Provins end there: Provins [3.30, 48.56] on 2 August 1429, for 050 to go on from.
- names-check fails "Lord Talbot" in a note or a route name: write "John Talbot" (the row's name).
- On meung-and-beaugency two english routes, Talbot's and the march of 17 June, run nearly the same way across the
  Beauce: keep the march east of Talbot's line, or the two lie on each other on the green zone.
- A marker's note follows its page's text: where the text gives a detail to one author (030's island crossing,
  d'Aulon's), the note names that author too, or tells only what all agree on.
- The section reviewer holds "each place the text names is on the map" above the plan's `unmarked`: a station or end
  of a route the text names (040's Orléans, Paris, Étampes, Corbeil, Troyes, Vailly) wants a marker on that page,
  even when another page marks the place. Give it a new dated id (`orleans-19-june-1429`), add it to `pages.yaml`
  and `map.yaml` (out of `unmarked`), and link the name in the text, or it waits unseen under a planned marker.
- names-check fails "the Marshal de Boussac" though names.md's row asks for it at the first mention: a conflict
  for the names agent, not a map fault.
- Section 050 is `content/joan-of-arc/.plans/pages050.mjs`, built on 040's. A route id is the story's, like a marker
  id: 050's plan reused 040's `france-1429-gien`, and the build failed "defined twice" (050-cartographer-1, now
  `france-1429-back-to-gien`). Grep a planned route id against every page's `routes/` before drawing.
- names-check passes notes written round bare titles: "Charles VII" for "the king", "John, Duke of Bedford" in full,
  "late in March" for "the end of March", "its bridge"/"its captain" for "the bridge"/"the captain".
- 050 ends at Compiègne: the town [2.83, 49.42], the bridge [2.8275, 49.4195] by the card, Margny [2.82, 49.43],
  Venette [2.80, 49.42], Clairoix [2.85, 49.44], Coudun [2.81, 49.47]; 060 goes on from Margny.
- Section 060 is `content/joan-of-arc/.plans/pages060.mjs`, built on 040's. Natural Earth's coast leaves the town of
  Le Crotoy in the bay of the Somme: its point is [1.645, 50.23], on the base map's land, and a route to it comes in
  north of the bay by [1.75, 50.21]. Rouen's castle ward is [1.0932, 49.4452], the keep [1.0938, 49.4461], for 070.
- names-check fails "the church of Saint-Sauveur" though names.md's rule asks for it: write "its church of
  Saint-Sauveur". It also fails "Jean de Pressy" (no row): leave him out of a note or add his row.
- A marker near a page's south-west corner falls under the legend on a laptop (bottom-left about 220 by 330 px):
  050's compiegne put Crépy 5 km inside its south edge and lost it; the south edge went from 49.18 to 49.05. Leave
  some 0.1 to 0.15 degrees below such a place in a frame of this size.
- At the scale of a city (060's Rouen pages) the base map draws no river at all: widening a frame does not show
  the Seine. A river the text names gets a label marker, icon `waves` and no colour (060's `seine-1431`,
  `somme-1430`), and the base map shows nothing else of it.
- names-check fails "the morning" and "the church is gone" in a note: write "eight o'clock on 30 May", "it is gone".
- A town marker added on top of a route's start (060's Compiègne over Clairoix) takes no rank, so the start leads.
- Section 070 is `content/joan-of-arc/.plans/pages070.mjs`, built on 060's. Its new points: Isigny [-1.10, 49.317],
  Trévières [-0.906, 49.309], the Fords of Saint-Clément at the head of the Baie des Veys [-1.17, 49.315] (on the
  base map's land; route-surface passes it), the Médoc landing [-1.11, 45.49] with [-0.93, 45.25] to keep west of
  the Gironde, Branne [-0.186, 44.829]. Clermont's and Kyriell's lines share the stretch to Formigny, so Clermont's
  route carries `offset: 5`. names-check fails "the witnesses of ..." in a note: write "witnesses of ...".
- Since the images were placed, a page's markers.yaml holds image ids (`nancy-ducal-palace-54c40d`) where a
  section's generator may still name the placeholder. Before you run a generator on a fix, run it once and `git diff`
  the section: bring the generator up to the files (020's now is), or a run puts the placeholders back.
- Once the images are placed, a generator's `image:` must hold the placed id (`blois-loire-bridge-f8aa18`), not the
  placeholder, or a rerun undoes the placing. 030's generator holds the ids now; check the others before a rerun.
- A page whose text lists places of a later page (030's the-army-of-blois and the whole ring of bastilles) marks each
  with a dated id of its own (`saint-loup-april-1429`) at the later page's point, and the text links it.
- 070's generator holds the placed image ids now; a marker whose placed file has no `image:` line (070's paris-1436,
  "Image: none") must have none in the generator either, or the placeholders check lists it again.
- Once images are placed, a generator's `image:` must hold the placed id (`.plan/images/<section>.yaml`), or a rerun
  puts the placeholder back; 050's generator now does. The story auditor holds every town a route's text names to a
  marker (050's back-to-the-loire now marks Lagny, Provins, Sens, Courtenay, Montargis with `-sep-1429`/`-1429` ids).
