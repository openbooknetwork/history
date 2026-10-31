# Battle plans

Two battles are a header in the nav with an overview page and phase pages: Nicopolis 1396 and Ankara 1402, three
phases each. The other battles of the story are cards only. The conventions are those of the Punic Wars story,
`content/punic-wars/.plans/README.md`. Read it, and Cannae there (`pages/040-second-war/010-invasion/050-cannae/`,
`.plans/cannae.mjs`) as the model generator. Story 1's `.plans/kosovo-1389.mjs` is the closest model. This file records
what differs here.

Each battle has `.plans/<battle id>.mjs`, run with `node .plans/<battle id>.mjs` from the story folder. Rerun it
after every edit.

The sections from Sides to Real ground describe Nicopolis. The Ankara section below records Ankara.

## Sides

Sides are the story's families: `ottomans` (Bayezid's army), `serbia` (Stefan Lazarević's Serbs on the Ottoman side),
`crusaders` (the French and Burgundians), `hungary` (Sigismund's army, with the Germans, the Knights Hospitaller and the
Transylvanians, as the sources group them), `wallachia` (Mircea), `venice` (the Venetian and Hospitaller ships on the
Danube). Rivers take `water`. The battle's `battle.yaml` lists the families of its sides with the story's colours.

## Sources

The accounts of Nicopolis agree on the course of the battle and give almost nothing on the ground or the order of
the lines. The plans draw what they say, and the hover names say where a position is a reconstruction.

- Contemporary: Johann Schiltberger's Reisebuch (about 1427), by a squire who fought in Sigismund's army at 16 and was
  taken prisoner. He gives the crusaders 16,000 men and the Ottomans 200,000, and has the Serbs bring down
  Sigismund's banner. Jean Froissart's Chronicles, book IV, and the Chronicle of the Monk of Saint-Denis tell the
  French side: the councils, Eu's claim to the vanguard, the stakes, the deaths and the captures. Konstantin the
  Philosopher's Life of Stefan Lazarević (1431) tells the Serbian charge.
- Ottoman: Şükrullah's Behcetü't-Tevârih (1460s) gives 130,000 crusaders and 60,000 Ottomans.
- Modern: Aziz S. Atiya, The Crusade of Nicopolis (1934), Barbara W. Tuchman, A Distant Mirror (1978), David
  Nicolle, Nicopolis 1396 (1999), who gives 16,000 crusaders and 15,000 Ottomans. The only number in the hover
  names is the Battle of Nicopolis article's figure of about 1,500 Serbian horsemen.
- The Ottoman order, akıncı light horse in front, azaps behind the stakes, the sipahis out of sight behind the crest
  and Bayezid with the janissaries and his household behind them, follows the course of the fight as every account
  tells it. The accounts give no place in the line for the Serbs or for the Transylvanians and Wallachians. The plans
  put the Serbs on the Ottoman left, from where they strike the Hungarian centre, and the Transylvanians and
  Wallachians on Sigismund's wings, and their hover names say that the accounts give no position.

## Drawn size

The armies are 15,000 to 20,000 men each, so the blocks are about real size: the Ottoman front about 3 km, the
French vanguard 750 m, Sigismund's main body 1.6 km. The phase pages share one bbox, about 8.7 km by 8.6 km, from
the Danube to Bayezid's hill.

- Each unit's front is at least 5% of the bbox's shorter side and its depth at least 2%. A clash star is about 2%.
- Marker labels hang below their icon, so `mark` in `nicopolis-1396.mjs` places each marker by an east and north
  offset from its block, beside it or below it.

## Real ground

The frame's origin is the middle of the Ottoman stakes, about 4.8 km south of the town, with u east along the lines
and w south. The ground comes from the elevation tiles the map shades, read at zoom 14:

- Nicopolis (Nikopol) stands at the foot of the cliff on the Danube at 24.896, 43.705. A ravine runs from the town
  south and south-east up to the plateau, 50 m at its mouth and 180 m at its head 3.5 km south of the town.
- The plateau south of the town lies at 175 to 195 m. The French charge across the head of the ravine and up the
  rise to a crest at about 217 m, 1 km behind the stakes. Behind the crest the ground dips to about 190 m, where the
  sipahis wait out of sight, and rises again to the high ground at 24.911, 43.642, about 224 m, where Bayezid stands.
- The Osam valley floor, 20 to 30 m, lies 4 km west of the field below a 150 m escarpment. The Danube and the Osam
  are drawn as `water` from the flat water surface in the elevation data, good to about 200 m.
- The accounts place the crusader camp around the town and the Ottoman army on the heights to the south. The exact
  site is not known. The plans put the lines on this rise because it is the first slope south of the town with a
  crest and dead ground behind it.

## Ankara

### Sides

`ottomans` (Bayezid's army), `serbia` (Stefan Lazarević's Serbs and the Brankovićs on the Ottoman right), `beyliks` (the
troops of Aydın, Saruhan, Menteşe and Germiyan as one block, since no account places them apart), `tatars` (the Black
Tatars, a family only this plan uses) and `timurids` (Timur's army). The Çubuk stream takes `water`. The `timurids`
colour is a teal, so that the Serbs and Timur's troops, who fight face to face, read apart.

### Sources

The accounts agree on the outcome and differ on the order of the lines, the hour of the desertions and the date. The
hover names say whose account a position comes from where they differ.

- Timurid: Nizam ad-Din Shami's Zafarnama (1404), Sharaf ad-Din Ali Yazdi's Zafarnama (1425) and Timur's letter of
  victory, edited by İsmail Aka (1981). Yazdi dates the battle to 20 July. Ibn Arabshah (1435) dates it to 28 July and
  gives Timur 800,000 men.
- Byzantine and Serbian: Doukas, who gives the Serbs 5,000 men, Laonikos Chalkokondyles, who praises their fight, and
  Konstantin the Philosopher's Life of Stefan Lazarević (1431).
- Ottoman: Âşıkpaşazâde, Oruç Bey and Neşri. Kemalpaşazâde is the first to name the Çubuk plain and has Yakub of
  Germiyan recognise Bayezid.
- Modern: Ömer Halis Bıyıktay (1934) placed the fighting on the Çubuk plain along the Kızılcaköy stream and the last
  stand on Çataltepe. Marie-Mathilde Alexandrescu-Dersca (1942) has Bayezid leave troops on Çataltepe about 4 km behind
  his line. İsmail Hakkı Uzunçarşılı, after Shami, puts the Rumelian troops with Süleyman on the left and the Anatolian
  troops on the right beside the Serbs. Halil Çetin (2012) argues for Culuk near Haymana. David Nicolle gives 140,000
  against at most 85,000.
- The plans follow the order Spencer Tucker gives (Battles that Changed History, 2010): the Serbs on the right,
  Süleyman on the left with the troops of the beyliks, Bayezid in the centre with the janissaries, Mehmed with the
  reserve behind, and the Tatars behind the left. Timur holds the centre with the elephants in front, Miran Shah the
  right, Shah Rukh the left, and Abu Bakr's vanguard stands in front of the right. The left wing's hover name gives
  Shami's and Uzunçarşılı's order.
- The desertion page shows the Tatars and the troops of the beyliks going over together. Its hover names say that the
  Turkish accounts have the Anatolian sipahis of the right go over in the afternoon. The hill page (the ring, the
  breakout at sunset, Sultan Mahmud's pursuit) follows the Turkish accounts.
- The numbers in the hover names are Doukas's 5,000 Serbs, the 10,000 janissaries, the 32 elephants, the 300 horsemen
  of Bayezid's breakout and the 16 km of his flight.

### Drawn size

The armies are tens of thousands, so the blocks are about real size: the Ottoman front about 7.2 km, Timur's about
7.8 km, a block 1.2 to 2.2 km wide and 500 to 900 m deep. The phase pages share one bbox, about 10.4 km by 10.9 km,
from the ridge behind the Ottoman line to Timur's main body. At this scale a label hangs about 850 m below its icon, so
the commanders' icons sit about 1,400 m north of their blocks.

### Real ground

The frame's origin is the front of the Ottoman centre at 32.925, 40.14, with u east along the lines and w south. The
ground comes from the elevation tiles at zoom 13 and 14:

- The Çubuk stream runs south from Çubuk (33.03, 40.24) through a plain 930 to 970 m high and 6 to 7 km wide, past the
  west side of today's Esenboğa airport, to the reservoir above Ankara. It is drawn as `water` along the lowest line of
  the valley floor, good to about 200 m.
- West of the stream the ground rises to low hills of 1,000 to 1,060 m at 32.92 to 32.94, 40.14 to 40.16, where the
  plans put the Ottoman centre. Behind them a ridge runs north from 32.920, 40.177 (about 1,270 m) toward the hills of
  1,400 to 1,600 m around 32.87, 40.21.
- The accounts name the places of the battle (Melikşah, the Kızılcaköy stream, Mire Dağı, Çataltepe), and the texts at
  hand give no coordinates for them. The Battle of Ankara article gives 40°09′ N, 32°57′ E, which falls on the Ottoman
  left of the plan. The plans put the Ottomans on the low hills at the west edge of the plain, facing south, and Timur
  on the plain with his camp by the stream. Çataltepe is drawn on the ridge about 3.8 km behind the Ottoman centre,
  which fits Alexandrescu-Dersca's 4 km. This is a fit of the accounts to the ground, and the hover names of the hill
  say so.
- Ravlı, Bayezid's first camp, is today's Akyurt, at 33.087, 40.134.

## Texts, images, zones

Same as the Punic Wars rules. Phase pages show no zones.
