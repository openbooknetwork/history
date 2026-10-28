# Battle plans

Two battles are a header in the nav with an overview page and phase pages: Pelekanon 1329 (two phases) and Kosovo
1389 (three). The other battles of the story are cards only. The conventions are those of the Punic Wars story,
`content/punic-wars/.plans/README.md`. Read it, and Cannae there (`pages/040-second-war/010-invasion/050-cannae/`,
`.plans/cannae.mjs`) as the model generator. This file records what differs here.

Each battle has `.plans/<battle id>.mjs`, run with `node .plans/<battle id>.mjs` from the story folder. Rerun it
after every edit.

## Sides

Sides are the story's families: `ottomans` (Osman's beylik and the Ottoman state, with its vassal and allied
contingents), `byzantium`, `serbia` (Lazar, Vuk Branković and the other Serbian lords), `bosnia` (Tvrtko's troops
under Vlatko Vuković). Rivers and marshes take `water`. A battle's `battle.yaml` lists the families it uses with the
story's colours, as `shared/battles/pelekanon-1329/battle.yaml` does.

## Sources

The battles rest on few accounts, and the plans draw what they say and no more.

- Pelekanon: John Kantakouzenos, who fought there, in book 2 of his Histories, and Nikephoros Gregoras. Modern
  accounts: Donald M. Nicol, The Reluctant Emperor (1996), Mark C. Bartusis, The Late Byzantine Army (1992), Savvas
  Kyriakidis, Warfare in Late Byzantium (2011). The numbers are Bartusis's: about 4,000 Byzantines, 2,000 of them
  from Constantinople, against about 8,000 under Orhan. The accounts give no split of either army into horse and
  foot. The plan draws the Byzantines as one block of horse and one of foot and names the strength of the whole army.
- Kosovo: the Serbian and Ottoman traditions and the few contemporary letters disagree on the deployment and on the
  moment of Murad's death. Name the account a position comes from in the hover name. The deployment is Noel
  Malcolm's reconstruction, Kosovo: A Short History (1998), 64, as the Battle of Kosovo article gives it: Lazar in
  the centre with the heavy horse in front, Branković on the right, Vuković and the foreign contingents on the left,
  light horse with bows on the flanks. Murad holds the centre with the janissaries in front of him and his guard,
  Bayezid and Evrenos on the right, Yakub on the left, about 1,000 archers in front of each wing. The Murad I article
  puts Bayezid on the left, and Bayezid's hover name says so. The strengths are ranges, 27,000 to 40,000 Ottomans and
  12,000 to 30,000 for Lazar's coalition. Of the blocks, only the janissaries carry a number, no more than 2,000.

## Drawn size

The armies are a few thousand men, so the plans draw them larger than life, as in the Hussite and Viking Age
stories. Every phase of a battle keeps the same bbox.

- The Pelekanon phases frame the coast from the bay west of Philokrene to the hills above Eskihisar, about 7 km by
  6 km. The battle sits in the north-east of the frame and the retreat runs west along the coast.
- The Kosovo phases frame the field from the Sitnica and the mouth of the Lab to Murad's tomb, about 6.4 km by 6 km.
  The armies are tens of thousands, so the blocks are about real size: each army's front is about 5 km, a wing 1 to
  1.4 km. The lines run south-west to north-east, the Serbs facing south-south-east.
- Each unit's front is at least 5% of the bbox's shorter side and its depth at least 2%. A clash star is about 3%.
- Marker labels stand clear of the unit blocks. The map panel is about as tall as it is wide, so a bbox of about the
  same width and height in kilometres fills it best.

## Real ground

Put the frame on the site as the text identifies it, and say in the text and the hover names where the site rests
on an identification.

- Pelekanon is placed on the coast between Darıca and Eskihisar, and Philokrene between Darıca and Tuzla, after
  İsmail Hakkı Uzunçarşılı. Other historians put Pelekanon at Maltepe. Orhan's army is drawn on the hills above
  Darıca and Eskihisar, the Byzantines on the narrow ground between those hills and the sea.
- The sea is the base map's. `./node_modules/.bin/harita coast Turkey w s e n` prints its coast, which near Darıca is
  a few hundred metres coarse. Keep land units and routes at least 300 m inland of it.
- Kosovo field: the frame's origin is the article's coordinate for the battle, about 5 km north-west of Priština, and
  Murad's tomb (Meşhed-i Hüdavendigâr) stands at its own coordinate south-east of the Ottoman centre. The Serbs stand
  north-west with the Lab behind them, the Ottomans south-east on the side of Priština, from where Murad came. The
  Lab and the Sitnica are drawn as `water` from general maps and are good to about a kilometre. Gazimestan, a
  monument of 1953, stays off the plans.
- Marker labels hang below their icon, so `mark` in `kosovo-1389.mjs` places each marker by an east and north offset
  from its block: Serbian markers above their blocks, Ottoman markers below.

## Texts, images, zones

Same as the Punic Wars rules. Phase pages show no zones.
