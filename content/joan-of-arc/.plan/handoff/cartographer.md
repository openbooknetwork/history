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
