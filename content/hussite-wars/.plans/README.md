# Battle plans

Six battles are a header in the nav with an overview page and three or four phase pages. The conventions are those
of the Punic Wars story, `content/punic-wars/.plans/README.md`. Read it, and Cannae there
(`pages/040-second-war/010-invasion/050-cannae/`, `.plans/cannae.mjs`) as the model generator. This file records
what differs here.

## Which battles get phase pages

- Sudoměř 1420, Vítkov 1420, Kutná Hora and Německý Brod 1421–1422, Malešov 1424: Žižka's battles.
- Ústí nad Labem 1426: his methods used by Prokop's field armies after his death.
- Lipany 1434: Hussite against Hussite, the field army beaten by its own methods.

The main sources are Laurence of Březová's Hussite Chronicle (an eyewitness in Prague to 1421), the Old Czech
Annals, Eberhard Windecke for Sigismund's side and Aeneas Silvius Piccolomini's Historia Bohemica. Modern accounts:
Frederick G. Heymann, John Žižka and the Hussite Revolution (1955), František Šmahel, Die Hussitische Revolution
(2002), Stephen Turnbull, The Hussite Wars 1419–36 (2004), Petr Čornej, Velké dějiny zemí Koruny české V (2000).
The chronicles give large numbers for the crusade armies. Write the source's number with its author in the name
("the crusaders, 100,000 by Laurence of Březová") and draw the block at the size modern estimates allow. Where the
field is known by tradition only, say so in the text.

## Tactics are the subject

The battle pages show how a smaller army of townsmen and peasants beat mounted knights. Each battle has one phase
page more than the Punic Wars guide gives, and that page shows the device the battle turned on: the narrow front
on the dike at Sudoměř, the works on the ridge at Vítkov, the wagon fort that moves and fires at Kutná Hora, the
wagons of stones at Malešov. The text stays two or three short paragraphs per page. The plan carries the rest:

- Tactic markers: up to three per phase page, `icon: lightbulb`, `color` of the side that uses the device, label
  naming the device ("Wagon fort", "Narrow front", "Guns on the move"), note of at most six words ("Ponds cover both
  flanks"). With the commanders and units, at most eight markers on a page. Marker ids `<page-id>-<name>`.
- Hover names say what each piece does: "Wagon fort of 180 wagons, chained wheel to wheel. Handguns and light guns
  fire through the gaps, flails and halberds hold the gaps against men on foot." Name the strength on both sides,
  so the odds show on every phase.
- The first paragraph of the overview page gives the odds and the device the battle turned on.

## Sides

Sides are the story's families: `taborites` (Tábor, Žižka, the Orebites and Orphans, the field armies), `prague`
(Prague and the Hussite towns and lords allied with it, and the lords' league at Lipany), `royalists` (Sigismund's
Catholic lords and towns in Bohemia and Moravia), `empire` (German crusaders and princes: Meissen, Saxony,
Thuringia, Bavaria, Brandenburg), `austria`, `hungary` (Sigismund's Hungarian army), `poland`, `teutonic`. Rivers,
fishponds and marshes take `water`. A battle's `battle.yaml` lists the families it uses with the story's colours,
as in the Viking Age battles.

## Unit types and sizes

- War wagons in a line or on the march: `wagons`, `count` wagons, `rows` parallel columns on the march (Žižka marched
  in four). A wagon is about 5 to 6 m long, so a line of 12 is about 80 m with the chains.
- A wagon fort: `wagon-fort`, `width` along the front, `depth` (0.6 of the width unless set). Give `count` the real
  number of wagons up to about 40. Above that draw 30 to 40 and write the real number in the name. 180 wagons make
  a ring of about 1.1 km, an oval of about 450 by 270 m.
- Handgunners (píšťaly): `handguns`. Field guns and howitzers (houfnice): `artillery`. Crossbowmen: `archers`.
  Pavise bearers holding a gap or a line: `pavises`. Hussite foot with flails, halberds and spears: `infantry`.
  Hussite horse, a few hundred at most: `cavalry`. Mounted knights and men at arms: `knights`. Knights who dismount
  and attack on foot: `infantry` in the knights' colour, named as dismounted knights.
- Walls, ramparts, ditches and the timber works on Vítkov: `works`. A castle or a walled town: `fort`.

## Drawn size

Hussite armies of a few hundred to a few thousand, and wagons 5 m long, are slivers at real size. The plans draw
small forces larger, as in the Viking Age story.

- The phase bbox frames the fighting: about 1.5 to 3 km, wider only where the movement needs it. Every phase of a
  battle keeps the same bbox.
- Each unit's front is at least 5% of the bbox's shorter side and its depth at least 2%. A wagon fort is at least
  12% of the bbox's shorter side across. Forces above that keep their real size.
- A clash star's `size` is about 3% of the bbox's shorter side. It sits on the line where the two sides meet.
- Marker labels stand clear of the unit blocks.

## Real ground

Put the frame on the real site, from the article's coordinates. The ground decided these battles, so draw it:
the Škaredý and Markovec fishponds and the dike between them at Sudoměř, the Vltava below Vítkov, the Sázava at
Německý Brod, the valley of the brook below Malešov, the Elbe and the Bílina at Ústí. Fishponds of the time that
are gone today come from the sources and the historical maps the modern accounts print: draw them, and say in the
hover name that the pond is drawn after the account that places it. `./node_modules/.bin/harita coast <country> w s
e n` prints the base map's coast, which inland battles do not need.

## Texts, images, zones

Same as the Punic Wars rules. Candidates come from `node scripts/fetch-candidates.mjs hussite-wars --queries
<file> --out <agent> --limit 6` into `.candidates/<agent>/`. The Jena Codex, the Göttingen Hussite manuscript,
Konrad Kyeser's Bellifortis, Mikoláš Aleš, Alfons Mucha's Slav Epic and photographs of the fields and towns are
good sources. Close battle views and phase pages show no zones.
