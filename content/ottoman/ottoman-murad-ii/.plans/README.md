# Battle plans

Two battles are a header in the nav with an overview page and phase pages: Varna 1444 and Kosovo 1448, three phases
each. The other battles of the story are cards only. The conventions are those of the Punic Wars story,
`content/punic-wars/.plans/README.md`. Read it, and Cannae there (`pages/040-second-war/010-invasion/050-cannae/`,
`.plans/cannae.mjs`) as the model generator. Story 2’s `.plans/nicopolis-1396.mjs` is the closest model. This file
records what differs here.

Each battle has `.plans/<battle id>.mjs`, run with `node .plans/<battle id>.mjs` from the story folder. Rerun it
after every edit.

## Varna

### Sides

`ottomans` (Murad’s army), `hungary` (the Hungarian, Transylvanian, Croatian and Bulgarian banners, the bishops’
banners and the wagon fort), `poland` (Władysław’s Polish guard), `crusaders` (Cardinal Cesarini’s German mercenaries
and Bosnians), `wallachia` (Mircea’s horsemen). Lake Varna takes `water`. The battle’s `battle.yaml` lists the families
of its sides with the story’s colours.

### Sources

The accounts agree on the ground, the council of the night, the arc of the crusader line, the flight of the crusader
right and the king’s charge. They differ on the order of the Ottoman wings. The hover names say where a position comes
from one account only.

- Contemporary and near contemporary: Andreas de Palatio’s report, Laonikos Chalkokondyles’ Histories (c. 1464), Filippo
  Buonaccorsi (Callimachus), whose account comes from Gregory of Sanok, and Jan Długosz. Aeneas Silvius Piccolomini’s
  letters tell Cesarini’s death.
- Ottoman: Neşri, Sadeddin and the anonymous Tevârîh-i Âl-i Osmân name Koca Hızır as the janissary who beheads the king,
  and the anonymous chronicle has the broken treaty hung from a lance by Murad’s position. Murad’s own memorandum says
  that the king was taken alive and put to death later.
- Modern: Oskar Halecki (1943), Kenneth Setton (1978), who gives 16,000 crusaders and 4,000 Wallachians, Colin Imber
  (2006), John Jefferson (2012), Halil İnalcık (1954), who gives 37,000 to 40,000 Ottomans, and Feridun Emecen, who
  gives 7,000 to 8,000 Ottoman dead.
- The crusader order follows the Battle of Varna article: the king’s two banners, 3,500 men, in the centre with the
  Wallachians in reserve behind, the right wing of 6,500 in five banners on the slope (John de Dominis, Cesarini’s
  Germans and Bosnians, Simon Rozgonyi, Franko Talovac’s Croats), the left wing of 5,000 under Michael Szilágyi, and the
  wagon fort behind, nearer the lake and the town. The article names five banners on the right and gives no order
  within the wing. The plans put Talovac at the end on the slope, because the akıncıs from the plateau strike his Croats
  first.
- The Ottoman order is a choice between accounts. The plans put the Anatolian sipahis under Karaca Bey on the right,
  towards the lake, and the Rumelian sipahis under Şehabeddin Pasha on the left, below the plateau: Hunyadi rides to
  the crusader left and routs the Anatolians, and Karaca Bey falls there. The Battle of Varna article puts the
  Rumelian sipahis on the Ottoman right and the Anatolians with the akıncıs on the left. The Turkish article puts the
  Rumelians under Turahan on the right and the Anatolians under Karaca in the centre. The wings’ hover names say that
  some accounts swap them.
- Hunyadi’s road off the field is not in the accounts. The plan sends him north towards the Danube, and the arrow’s
  hover name says that the accounts give no road.

### Drawn size

The crusaders are about 20,000 and the Ottomans 40,000 to 60,000, so the blocks are about real size: the crusader arc
about 3.5 km from the lake to the slope, the Ottoman arc about 3.4 km, a wing 1 to 1.1 km wide and 250 to 300 m deep,
a banner 420 to 450 m. The wagon fort is drawn 600 m by 380 m, larger than a ring of 40 to 80 wagons, so that it reads
at the scale of the field. The phase pages share one bbox, about 5 km by 5.6 km, from Murad’s household to the wagon
fort and from the lake shore to the edge of the plateau.

- Marker labels hang below their icon, about 350 m at this scale. The Ottoman commanders stand west of their line,
  the crusader commanders in the open ground between their line and the Wallachian reserve.

### Real ground

The frame’s origin is Murad’s burial mound, taken as the mound of the park museum of Władysław Warneńczyk at
27.865, 43.2245, with u north along the lines and w east. The ground comes from the elevation tiles at zoom 13 and 14:

- Lake Varna is drawn as `water` from the 0 m line of the elevation data, from 27.70 to 27.906 east, its north shore
  at 43.207 to 43.2095 north between 27.85 and 27.88. The modern port fills the east end of the lake, so the outflow to
  Varna Bay south of the town is drawn as a channel from 27.904 to 27.918. The base map does not draw the lake.
- North of the lake the ground rises from 20 to 60 m by the shore to 100 m about 3.2 km north of it and to the Franga
  plateau at 300 to 340 m, about 5 km north of the shore. The crusader right ends at about 140 m on the slope, and the
  akıncıs stand at about 200 to 250 m on the edge of the plateau.
- The low ground north of the lake runs west towards Devnya at 15 to 60 m, the road by which the Ottomans come in on
  9 November.
- The accounts place the crusader line between the lake and the plateau and the Ottoman centre round two Thracian
  mounds, and the memorial stands on a mound of the park. The plans put the crusader line about 1.2 to 1.5 km east of
  it and the crusader camp about 3 km east, 1.2 km from the town. These distances are a fit of the accounts to the
  ground.

## Kosovo

### Sides

`ottomans` (Murad’s army, with the Thessalian sipahis), `hungary` (Hunyadi’s Hungarian and Croatian horse, the German
and Bohemian foot, the wagons and the wagon fort), `wallachia` (the Wallachian horse of the crusader left, with the
Moldavians, and the Wallachians who go over on 20 October). The Sitnica and the Lab take `water`. The battle’s
`battle.yaml` lists the families of its sides with the story’s colours.

### Sources

The accounts agree on the three days, the attacks on the Ottoman wings, the night attack with wagons and guns, the
Thessalian sipahis on the crusader left, the knights’ charge to the Ottoman camp and the Wallachian desertion. They
give the order of the wings and no positions. The hover names say where a position or an event comes from one account
only.

- Contemporary and near contemporary: Laonikos Chalkokondyles’ Histories (c. 1464), who gives 17,000 crusaders and
  4,000 Ottomans killed, Johannes de Thurocz (1488), Antonio Bonfini (about 1497), who gives 8,000 against 30,000, and
  Aşıkpaşazade and Neşri on the Ottoman side.
- Modern: Franz Babinger (1978), who gives 40,000 to 60,000 Ottomans and 17,000 crusaders against 34,000 Ottomans
  dead, Emanuel Constantin Antoche (2017), who doubts the Wallachian desertion, Tamás Pálosfalvi (2018), and Bryan
  Cartledge (2011), who gives Hunyadi 16,000 men and 8,000 Wallachians.
- The order of the lines follows the Battle of Kosovo (1448) article: Murad with the janissaries and the guns in the
  centre, Mehmed with the Anatolian troops on the right, the Rumelian troops on the left, Hunyadi in the crusader
  centre and the Wallachians on the crusader left. The Turkish article adds the shield bearers and spearmen round
  the ditch, the camels and the guns, Murad resting the Anatolian wing on the first day, the night attack on the
  evening of the first day and a feigned retreat on the second. The texts give these as the Turkish accounts.
- The crusader right has no commander in the accounts read, and the plans name none. The Thessalian sipahis have no
  position before 19 October, so they first show on the night page, coming round the Ottoman right.

### Drawn size

The crusaders are 22,000 to 30,000 and the Ottomans 40,000 to 60,000, so the blocks are about real size: the crusader
front about 4.6 km, the Ottoman front about 5.7 km, a wing 1.1 to 1.5 km wide and 260 to 320 m deep. The armies stand
about 2 km apart. The wagon fort is drawn 900 m by 500 m with 40 wagons, a ring that reads at the scale of the
field, against the 800 to 2,000 war wagons of the sources. The phase pages share one bbox, about 6.7 km by 6.5 km,
from the hills behind the wagon fort to the Ottoman camp and from the light horse on the Ottoman left to the
Thessalians’ ride round the crusader left. `boxOf` draws it round the pieces of the three phases, because the lines
run at 60° to the bbox and the corners of the frame’s rectangle would add empty ground.

- Marker labels hang below their icon, about 400 m at this scale, so `mark` in `kosovo-1448.mjs` places each marker
  by an east and north offset from its block.

### Real ground

The frame’s origin is on the Lab at 21.078, 42.744, below the hills north of the river, with u along the lines to
the east-north-east (bearing 60, the course of the Lab) and w south-south-east from the crusaders to the Ottomans. The
ground comes from the elevation tiles at zoom 13 and 14:

- The Sitnica and the Lab are drawn as `water` with story 1’s courses from general maps, good to about a kilometre.
  The Sitnica valley floor lies at 518 to 525 m, and the Lab runs along the foot of the hills at about 530 m.
- North of the Lab the ground rises within 500 m to a crest of 600 to 625 m between 21.06 and 21.09 east, and behind
  it to broken hills of 600 to 790 m towards Vučitrn. South of the Lab the plain lies at 530 to 545 m for 4 km towards
  Priština, the ground of the Ottoman lines and camp.
- The accounts place the wagon fort on the hill of Plemetina, which the plans take as that first crest north of the
  Lab, east of the village at the mouth of the Lab. The crusader line stands south of the Lab in front of it, the
  Ottoman line 2 km further south and the Ottoman camp 3.5 km south of the Lab, about 2 km north of Murad I’s tomb.
  These positions are a fit of the accounts to the ground.
- The overview’s routes, Hunyadi down the Lab valley from Podujevo and Murad from the south-east by Priština, and the
  roads on the march page, Hunyadi up the Morava by Kruševac and Kuršumlija, Murad from Sofia by Kyustendil, Kumanovo
  and Gjilan, and Skanderbeg up the Drin by Kukës and Prizren, are reconstructions: the accounts read name only
  Kovin, the Morava valley, Sofia and Kosovo field. Hunyadi’s road off the field is not in them either.

## Texts, images, zones

Same as the Punic Wars rules. Phase pages show no zones.
