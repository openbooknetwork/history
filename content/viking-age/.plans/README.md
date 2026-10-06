# Battle plans

Six battles are a header in the nav with an overview page and two or three phase pages. The conventions are those
of the Punic Wars story, `content/punic-wars/.plans/README.md`; read it, and Cannae there
(`pages/040-second-war/010-invasion/050-cannae/`, `.plans/cannae.mjs`) as the model generator. This file records
what differs here.

## Which battles get phase pages

Most battles of the Viking Age are known from a line in a chronicle: the place, the year, the winner. They keep a
card on their page and have no phases. Six have sources that give positions and movements:

- Edington 878: Asser's Life of King Alfred and the Anglo-Saxon Chronicle.
- Paris 885–886: Abbo of Saint-Germain, who was in the city.
- Dorostolon 971: Leo the Deacon and John Skylitzes.
- Maldon 991: the Old English poem The Battle of Maldon.
- Clontarf 1014: the Annals of Ulster and Cogad Gáedel re Gallaib.
- Stamford Bridge 1066: the Anglo-Saxon Chronicle and Snorri Sturluson's Heimskringla.

Draw only what the sources describe. The sagas and the Cogad were written down one to two centuries after the
events: where a plan follows one of them, say so in the text ("by Snorri's account"). Where the field is known by
tradition only, say so too.

## Folders and ids

A battle group `NNN-<id>/` holds `group.yaml` (`title: "Battle of Maldon, 991"`, or "Siege of ...") and
`010-<id>/`, the overview, with the battle id, the battle card and the routes of the campaign. Phase pages are
`020-<id>-<phase>/`, `030-<id>-<phase>/` and so on, with no `battle` key and the same bbox on every phase. Battle
ids are `<place>-<year>`, such as `maldon-991`.

## Sides

Sides are the story's families: `danes`, `norway`, `swedes`, `rus`, `norse` (Dublin, York, Orkney, the Isles),
`normans`, `english`, `anglo`, `celts` (Irish, Scots, Picts, Welsh), `franks`, `byzantium`, `islam`, `bulgaria`,
`steppe`. A Viking army takes the family of its leader's people: the Great Army and Sigfrid's army at Paris
`danes`, Olaf Tryggvason's fleet at Maldon and Harald Hardrada's army in 1066 `norway`, Sviatoslav's army `rus`.
At Clontarf Brian's army is `celts` and Dublin with Leinster, Orkney and Man is `norse`. Allies under one
commander take his colour. Rivers, marshes and the sea take the `water` family.

## Unit types and sizes

- Foot in a shield wall, Viking or English: `infantry`. A man takes about 0.8 to 1 m of front, so 1,000 men four
  or five deep make a wall about 200 to 250 m wide and 5 m deep.
- Archers: `archers`. Throwers of spears and stones: `light`. Levies and loose bands: `irregular`.
- Horsemen: `cavalry`. Byzantine kataphraktoi at Dorostolon: `knights`.
- Ships: `ships` with `count` and `rows`. A longship is 20 to 30 m long, a Byzantine dromon 30 to 40 m.
- Rams, mantlets and stone throwers at Paris and Dorostolon: `siege`. A camp: `camp`.
- Walls, ramparts, bridges and bridge towers: `works` along the real line. A small fortress: `fort`.

The chronicles give large numbers: Abbo writes of 700 ships and 40,000 men at Paris, Leo the Deacon of 60,000
Rus'. Write the source's number with its author in the name ("Sigfrid's army, 40,000 by Abbo") and draw the
block at the size modern estimates allow.

Twelve units on a phase page at most, as in the Punic Wars rules, and fewer is better.

## Drawn size

The armies are small, a few hundred to a few thousand men, and at real size a band of 300 is a sliver of a few
pixels. The plans draw small forces larger, as in the Maya story.

- The phase bbox frames the fighting: about 1.5 to 3 km, wider only where the movement needs it. Every phase of
  a battle keeps the same bbox.
- Each unit's front is at least 5% of the bbox's shorter side and its depth at least 2%. Forces above that keep
  their real size.
- `ships`: width and depth large enough that each hull is at least 2% of the bbox's shorter side long.
- A clash star's `size` is about 3% of the bbox's shorter side. It sits on the line where the two sides meet.
- Marker labels stand clear of the unit blocks.

## Real ground

Put the frame on the real site, from the article's coordinates. Rivers, marshes and shores that matter are drawn
as `water` from their real course: the Seine round the Île de la Cité at Paris, the Blackwater and the causeway
to Northey Island at Maldon, the Derwent at Stamford Bridge, the Liffey, the Tolka and the shore of Dublin Bay at
Clontarf, the Danube at Dorostolon (Silistra). The base map's coast is rough at this scale:
`./node_modules/.bin/harita coast <country> w s e n` prints it. The 9th-century Île de la Cité was smaller than
today's, with one bridge to each bank.

## Texts, images, zones

Same as the Punic Wars rules. Candidates are in `.candidates/<page-id>/` with `.candidates/index.yaml`. Phase
pages pick from their battle's candidates. Zones come from `.plans/zones.mjs` and `.plans/zones.yaml`; phase
pages show none.
