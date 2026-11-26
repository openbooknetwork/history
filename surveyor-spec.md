# The surveyor: a draft

A design for one new role of the story pipeline, written on 25 Nov 2026 for review. Nothing here is built.
`spec.md` is the pipeline's design, `agents/overseer.md` its steps, and `roadmap.md` what the runs found.

## The problem

The map keeper does two jobs at once. It derives where a border runs, and it draws shapes that meet. For the
first job it has no data for anything inland: it types coordinates from the model's memory. In the second run of
the shared map (`roadmap.md`) it typed 167 points for 12 zones, and spent 11 of its 22 minutes reading the
zones that stand, to check that memory against them. The map auditor found the same fault in both runs:
Dardania missing from `illyrians-335`, a line guessed too far south.

A guessed point and a sourced point look the same in a generator. Nobody can audit the deriving alone.

## The split

| Role | Job | Writes |
|---|---|---|
| `map-architect` | designs the map in words: extent, families, the table of zones with the land of each | the brief's "Map" part, `story.yaml` |
| `surveyor`, new | derives where each edge of each zone runs, from the sources and from reference data | the ground file |
| `map-keeper` | draws shapes from the ground file, so that they meet with no gap and no overlap | the zone generator, `shared/zones/` |
| `map-auditor` | holds the ground file against the sources, and the drawing against the ground file | faults, small fixes |

The keeper types no coordinate of its own.

## Where it runs

A new step, `ground`, in `maps`, before the keeper: after every section's plan is agreed, since `map.yaml` of each
section says which zones its pages list and gives the coordinates of its markers. The overseer dispatches one
surveyor for the story with `section: all`, then the keeper, then the auditor.

The step is not named `survey`: that is the research coordinator's step, the survey of the sources.

Tasks: `survey`, the whole map; `add`, the zones a later dispatch names, such as one a section's plan adds; `fix`,
the faults of `faults/story.yaml` that are its own.

## Inputs

`scripts/brief.mjs <story> surveyor all` lists them, as for every role:

| Input | What it takes from it |
|---|---|
| The "Map" part of `brief.md` | the zones to survey: id, family, land in words, basis, the claims each rests on |
| The digest's Border lines and each line the Map part cites, with the passage of each quote (`scripts/passages.mjs --part`) | what a source says of each edge: a river, a range, a list of towns, a treaty line |
| The states and peoples of `names.md` | the name of a land in the story's own form |
| `map.yaml` of every section's plan | the zones each page lists, the page's frame, and each marker with its `lnglat` |
| `rules.md`, and `handoff/surveyor.md` where it exists | standing rules, and what the surveyor before it left |
| "The basis of a drawing" in `agents/evidence.md` | `sourced`, `reconstruction`, `unknown` |

It does not read `pages.md`, the engine's README or any generator: it writes no shape.

## Its tool

`scripts/ground.mjs`, which is `scripts/water.mjs` grown by three kinds. One command for a box gives every named
feature in it, and `--name` with `--out` keeps one:

| Kind | From | As |
|---|---|---|
| river, stream, lake | OpenStreetMap by Overpass, as `water.mjs` does now | a line, an area |
| range, ridge, peak, pass | OpenStreetMap: `natural=mountain_range`, `ridge`, `peak`, `mountain_pass` | a line, a point |
| region | OpenStreetMap: a `boundary=administrative` relation by name, such as the region of Thessaly | an area |
| coast, country | Natural Earth, which the build clips to, already in `node_modules/world-atlas` | an area |
| place | the story's markers, and an OpenStreetMap `place` by name | a point |

A feature it fetched is saved in the story and committed, so the keeper, the auditor and a later run ask no
server.

## Output: the ground file

`content/<story>/.plan/ground.yaml`, and one GeoJSON file for each fetched feature in
`content/<story>/.plan/ground/`.

```yaml
features:                       # each real line or area the edges use, fetched once
  danube: { file: ground/danube.geojson, kind: river, names: [Danube, Dunărea, Istros], source: OpenStreetMap }
  thessaly-region: { file: ground/thessaly-region.geojson, kind: region, names: [Θεσσαλία], source: OpenStreetMap }
places:                         # each point the edges and the tests use
  larissa: { lnglat: [22.42, 39.64], from: "marker larissa-352, 010 map.yaml" }
  scupi: { lnglat: [21.43, 42.0], from: "OpenStreetMap, Skopje" }
zones:
  triballi-335:
    basis: reconstruction       # as the brief's row has it
    claims: ["020.3", "020.4"]
    edges:                      # in order, clockwise, each ending where the next begins
      - { kind: feature, feature: danube, from: [22.67, 44.2], to: [25.9, 43.7], claim: "020.4" }
      - { kind: estimate, points: [[25.9, 43.7], [25.6, 43.1]], why: "no source gives an east end; drawn at the Yantra" }
      - { kind: feature, feature: haemus-ridge, from: [25.6, 42.75], to: [22.4, 43.2], claim: "020.3" }
      - { kind: neighbour, zone: illyrians-335 }
    inside: [lyginus-335]       # places and markers the zone must hold
    outside: [pelium, philippopolis]
```

An edge is one of five kinds:

| `kind` | Means | Needs |
|---|---|---|
| `feature` | along a fetched line or the outline of a fetched area, between two points on it | `feature`, `from`, `to`, and the `claim` that names the feature |
| `coast` | along the coast between two points | `from`, `to` |
| `neighbour` | along the edge of another zone, which is surveyed once and shared | `zone` |
| `points` | through places a source lists, such as the towns of a treaty | `places`, `claim` |
| `estimate` | the surveyor's own line, where no source and no feature gives one | `points`, `why` |

A zone the brief calls `sourced` has no `estimate` edge. Each `estimate` is a line of the surveyor's report, so the
user can read every guessed line of a story in one list.

## Checks

`scripts/ground-check.mjs <story>`, run by the surveyor before it reports and by the dispatch of the keeper:

- the file holds its schema, and each zone a page lists and the Map part designs has an entry;
- each feature file exists, and each `from` and `to` lies on its feature, within 2 km;
- the edges of a zone close: each ends within 2 km of where the next begins;
- each `inside` place lies inside the ring the edges make, and each `outside` place outside;
- a `neighbour` edge names a zone that names this one back;
- each `estimate` has a `why`, and each `feature` and `points` edge a claim of the digest.

`scripts/ground-check.mjs <story> --drawn`, run by the keeper and the auditor after a draw:

- each drawn zone holds its `inside` places and none of its `outside` ones;
- each vertex of a drawn zone lies within 3 km of an edge of its entry, of the coast or of a neighbour;
- the generator holds no coordinate that `ground.yaml` does not: the keeper typed none.

## Handoffs

| From | To | What | How |
|---|---|---|---|
| `map-architect` | `surveyor` | the zones to survey | the Map part of the brief |
| section coordinators | `surveyor` | the zones in use, the frames, the markers | each `map.yaml` |
| `surveyor` | `map-keeper` | where each edge runs | `ground.yaml` and `ground/`, first in the keeper's start-up list |
| `surveyor` | `map-auditor` | the basis of each edge | the same file, with the passages file |
| `surveyor` | the user | every estimated line | its report: `estimates`, one line each |
| `map-auditor` | `surveyor` | an edge the sources put elsewhere | a fault with the owner `surveyor` |
| `map-auditor` | `map-keeper` | a gap, an overlap, a shape that leaves its edges | a fault with the owner `map-keeper` |
| a section lead | `surveyor` | a zone a plan adds after the survey | a dispatch with the task `add` |

## What changes for the others

- **`map-keeper`.** Its generator reads `ground.yaml`: it joins the edges of a zone into a ring, clips to the
  land and cuts neighbours so they share vertices. It reads no digest and no names. A place its drawing cannot
  honour, such as two `inside` tests that no ring meets, is a fault for the surveyor, not a point it moves.
- **`map-auditor`.** Two questions in place of one. Does each edge of `ground.yaml` say what its claim says?
  Does the drawing follow `ground.yaml`? The second is `ground-check --drawn` and the captures. A fault of the
  first kind it fixes in `ground.yaml` itself, as "Who finds it fixes it" says, and runs the generator again:
  since the generator reads the file, a moved edge needs no keeper.
- **`map-architect`.** Unchanged. Its table of zones is the surveyor's work list.
- **`cartographer`.** Unchanged: it lists the keeper's zones and draws none.
- **`battle-coordinator`.** Unchanged in its role. It keeps the ground of its own field, and uses `ground.mjs`
  in place of `water.mjs`.
- **`scripts/role-inputs.mjs`.** A row for `surveyor`: `rules`, `brief`, `names`, `digest`, `map`. A new kind,
  `ground`, on the rows of `map-keeper` and `map-auditor`, so a changed ground file marks their work stale.

## Channels

As every role: the dispatch block of `agents/report.md`, the report block saved to `reports/all-surveyor.yaml`,
`faults/story.yaml`, `fixes/story.yaml`, `handoff/surveyor.md`. Its report adds two fields: `estimates`, each
estimated edge with its `why`, and `unfetched`, each feature a claim names that no server gave.

## What it should cost

One more agent a story. In the second shared-map run the keeper took 1,570,000 weighted tokens and the auditor
1,140,000, for 12 zones. The surveyor's guess is 800,000 to 1,200,000 for the same 12, and the keeper's study of
the standing zones, about half its draw, should go. No saving is promised: the aim is borders that can be
audited.

## Open questions

1. **How good is OpenStreetMap for mountains?** Ranges are tagged unevenly. A ridge the tool cannot give falls
   back to `estimate` through named peaks and passes. Not measured.
2. **A whole story.** Alexander has 88 zones. One surveyor for all of them may pass a context's size. Split by
   region, or by section, with `neighbour` edges across the split?
3. **Zones cut back in stages.** `persia-336` is one outline, and each later `macedon-*` zone sits over it. Is a
   stage one entry of `ground.yaml`, or an entry that names its base and the edge that moved?
4. **The cloud.** The Overpass servers failed one call in three on 25 Nov 2026 and may be closed to a cloud
   session. Fetched features are committed, which covers a rerun and not a first run.
5. **Is one audit enough?** The auditor reads the ground file only after the draw. A wrong edge found then costs
   a second run of the generator, and no agent. A separate audit of the ground file before the draw would cost
   an agent each story.
6. **Shared zones of the book.** `content/shared/zones/` holds zones several stories use. Does such a zone get a
   ground entry in each story, or one of its own?

## The review, and what was decided

A fresh agent reviewed this draft on 25 Nov 2026 against the story's real zones and the last shared-map run. Its
verdict: not as written.

- **A zone is not one ring.** Of Alexander's 62 drawn zones 22 have several parts and 31 have holes, and 26 more
  are entries of `zones.yaml` on another zone's outline. Most are built as one region joined to or cut by
  others, as `league-337` is southern Greece without Sparta. The five kinds of edge have no form for a part, a
  hole, a stage or an entry.
- **`neighbour` contradicts itself**: both sides name each other and neither holds the line.
- **Two checks fail on real files.** A drawn zone overruns the coast on purpose and the build clips it, so a
  vertex is not near an edge. A generator is free code, so "no coordinate of its own" cannot be tested.
- **For this story most edges would be `estimate`.** The brief says no source draws a line on the ground. The
  guessing would move one role up and get no better. The Dardania fault began in the architect's row.
- **`map.yaml` holds no coordinates** of its markers, where this draft says it does.
- **One agent cannot survey 88 zones**, and OpenStreetMap gives rivers by name and regions, and no usable ridges.

Decided by the user, 25 Nov 2026: no new role. The aim is kept by another route: a shared library that every
story's zone generator draws with, where a line is made as sourced, with its claim and its feature, or as
estimated, with its reason, and the library writes the list of both. The generator stays code, so a zone is still
one region cut by another. The keeper gets the ground tool. A surveyor may be taken up again for a story whose
borders are well documented.
