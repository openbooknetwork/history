# Battle plans

The siege of Constantinople in 1453 is a header in the nav with an overview page, six phase pages and an aftermath.
The conventions are those of the Punic Wars story, `content/punic-wars/.plans/README.md`. Read it, and story 3’s
`content/ottoman/ottoman-murad-ii/.plans/README.md` with `varna-1444.mjs`, the closest model. This file records what
differs here.

Each battle has `.plans/<battle id>.mjs`, run with `node .plans/<battle id>.mjs` from the story folder. Rerun it after
every edit.

## Constantinople

### Sides

`ottomans` (Mehmed’s army and fleet), `byzantium` (Constantine’s Greeks, Orhan’s Turks, Isidore’s archers, the Catalans,
the walls and the chain), `venice` (Minotto, the two Contarini, Trevisano, Diedo’s ships and the ships that break out
on 29 May), `genoa` (Giustiniani, the Bocchiardi, Cataneo, Manuel, the four ships of 20 April and the walls of Galata).
The Horn, the Bosporus, the Marmara, the moat and the Lycus take `water`. The battle’s `battle.yaml` lists the families
of its sides with the story’s colours.

### Sources

The accounts agree on the posts along the walls, the batteries, the chain, the four ships, the haul over the hill, the
mines at the Kaligaria gate and the order of the three waves on 29 May. The hover names say where a position or an
event comes from one account only.

- Eyewitnesses: Nicolò Barbaro’s diary, Leonard of Chios, Isidore of Kiev, Sphrantzes. Later Greek: Doukas (the
  Kerkoporta), Kritovoulos, Chalkokondyles. Ottoman: Tursun Beg.
- Modern: Steven Runciman (1965) for the posts and the course of the siege, Franz Babinger (1978), Donald Nicol (1992),
  David Nicolle (2000), Anthony Kaldellis (2026). The Fall of Constantinople articles in English and Turkish, in
  `.wikipedia/` of this story and of `rise-of-the-ottomans`.
- The posts follow the Fall of Constantinople article and the outline. Theophilos Palaiologos stands with Johannes
  Grant at the Kaligaria gate with Kaldellis, cited by the Johannes Grant article. Runciman, in the English Fall of
  Constantinople article, puts him with Cataneo at the Pege gate, and the text gives both. Notaras stands on the Horn
  walls at the Petrion, and his hover name gives the other version, a reserve in the Petra quarter.
- The batteries are those of the Turkish article for 11 April: three at Blachernae, two at the Charisian gate, four at
  St Romanos, three at Pege, Orban’s gun moved from the Kaligaria gate to the Mesoteichion.
- The four ships of 20 April are drawn off the Acropolis point, where Runciman puts the calm. The Turkish article puts
  the calm off Yeşilköy, outside the plan, and the text gives both.
- The siege tower of 18 May stands at St Romanos with Runciman. The Turkish article puts it at the Charisian gate on 19
  May, and the hover name and the text give both.
- The breach of 29 May is drawn at the Fifth Military Gate, north of the Lycus, as the outline has it. The older view
  puts it at the gate of St Romanos, 500 m to the south.

### Drawn size

The phase pages share one bbox, about 9.7 km by 7.6 km, from the Ottoman camp at Maltepe to the Double Columns and from
the Golden Gate to Eyüp at the head of the Horn. At this scale a 600 m block is 50 pixels across, so:

- The posts on the walls are drawn 90 m deep and 160 to 650 m along the wall, inside the wall line. The Ottoman bodies
  stand 160 to 560 m out from the wall, the length of the stretch each held.
- Ships are drawn as hulls 150 to 250 m long, about five times a galley’s length, so that a hull reads on the map. The
  fleets inside the Horn take 150 to 160 m, so that they fit the Horn of 1453. A fleet unit of 8 to 10 hulls stands for
  its 26 to 150 ships.
- The chain is drawn 100 m wide, about three times the width of the boom and its floats, so that its links show.
- Commanders’ markers stand 450 to 1,000 m inside the city, so that their labels clear the troops before the walls.
  Gate markers stand on the wall line.

### Real ground

Positions are written as `[lon, lat]`. The plan has no rotated frame: `before`, `post` and `seaPost` in the generator
take the point of the wall line nearest a given point and place a unit a set distance across the wall there, facing out
or in.

- The modern shore is the 0.5 m contour of the elevation tiles at zoom 15, the Terrarium tiles of the terrain tiles on
  AWS at about 4 m a pixel, simplified to 5 m. The heights read 0 m on the sea and on the whole Horn up to Eyüp, so the
  contour traces the Horn and the Bosporus. `constantinople-1453-shore.json` holds it: the European shore from the
  Bosporus round the Horn to the Marmara, and the Asian shore, inside the box 28.839 to 29.081 E, 40.947 to 41.096 N.
  The plan draws `land` over that box and the water of 1453 inside it.
- The land walls are OpenStreetMap’s ways of the Theodosian walls, the wall of Manuel Komnenos and the walls of
  Blachernae, from the Marble Tower to the Anemas, simplified to 20 m. The Theodosian walls run 5.6 km from the Marble
  Tower to the Palace of the Porphyrogenitus (Tekfur Sarayı), and the walls article gives 5.7 km. The Golden Gate, the
  Xylokerkos gate (Belgradkapı), the Pege gate (Silivrikapı), the Rhegion gate (Mevlanakapı), the gate of St Romanos
  (Topkapı) and the Kaligaria gate (Eğrikapı) stand where OpenStreetMap maps them. The Charisian gate (Edirnekapı) is
  the gap in the mapped walls at Fevzi Paşa Caddesi.
- The Lycus passes the walls where Vatan Caddesi does, the lowest point of the walls on the heights, 40 m between the
  gate of St Romanos at 68 m and the Charisian gate. The Fifth Military Gate stands 100 m north of it. The stream comes
  down the valley the heights show from Bayrampaşa and runs through the city to the silted harbour of Eleutherios at
  Yenikapı. The moat is a `water` ribbon 18 m wide, 40 m in front of the Theodosian walls.
- Landfill since the 19th century has moved the shore out, so the sea walls stand inland of the modern shore: 100 to
  145 m at Yedikule and the Bukoleon, 75 to 90 m at Davutpaşa and east of the Bukoleon, 45 to 80 m round the Acropolis
  point, 115 m at Eminönü and 56 to 60 m from Cibali to Ayvansaray. These widths are measured on the stretches of sea
  wall that OpenStreetMap maps and interpolated along the shore between them. At Yenikapı and Kumkapı (110 m) and at
  Sirkeci (100 m) they are estimates.
- The water of 1453 comes up to the sea walls with a strip of shore 25 m wide on the Marmara and 40 m on the Horn, where
  the quays stood. Away from the walls the shore moves inland 70 m on the Bosporus, 40 m along the Horn and 50 m on the
  Marmara, estimates of the landfill there.
- The sea wall of Galata stands 60 to 90 m inland of the modern shore from the Horn west of Karaköy to Tophane, an
  estimate. The land wall from the Horn up to the Galata Tower follows the stretches OpenStreetMap maps. The wall from
  the tower down to Tophane follows general maps.
- The chain runs 800 m from the tower of Eugenius on the Horn wall at Sirkeci to the Kastellion of Galata on the sea
  wall of Galata at Karaköy.
- The haul of 22 April follows the valley from the Bosporus shore at Dolmabahçe up to the ridge at Taksim, at 80 m on
  the heights, and down the valley to Kasımpaşa, 3.4 km in all. The Turkish article gives 2 to 4 km, the track is a fit
  of the accounts to the ground.
- The bridge of barrels of 19 May crosses the upper Horn from the north shore below Hasköy to the south shore just
  outside the walls at Ayvansaray. The Turkish article says it stops short of the Kynegos gate, the plan ends it at
  the shore.
- Mehmed’s tent stands on the hill of Maltepe, 1.4 km west of the gate of St Romanos. Zaganos Pasha’s troops stand on
  the hills above Kasımpaşa, behind Galata.

## Belgrade

The siege of Belgrade in 1456 is a header in the nav with an overview page and three phase pages: the battle on the
Danube of 14 July, the assault of 21 July and the sortie of 22 July. `belgrade-1456.mjs` draws them.

### Sides

`ottomans` (Mehmed’s army and the river fleet), `hungary` (Szilágyi’s garrison, Hunyadi’s troops and boats, the walls of
the fortress and the guns the Christians take on 22 July), `crusaders` (Capistrano’s crusaders). The Danube, the Sava and
the ditch before the upper town take `water`. The battle’s `battle.yaml` lists the families of its sides with the
story’s colours.

### Sources

The accounts agree on the order of the Ottoman lines, the river fleet above the city, the battle on the river, the
general assault of 21 July with the fire in the breaches, and the sortie of 22 July with Capistrano’s crossing of the
Sava. They give no distances. The hover names say where an event comes from one account only.

- Contemporary and near contemporary: János Thuróczy (1488), Antonio Bonfini (about 1497),
  Laonikos Chalkokondyles and Tursun Beg, who give Mehmed’s part in the fight at the camp, Konstantin Mihailović, who was
  there as a new recruit, and Doukas, who gives the fleet 60 boats.
- Modern: Franz Babinger (1978), Kenneth Setton (1978), Pál Engel (2001), Tamás Pálosfalvi (2018), who gives 40,000
  to 50,000 Ottomans. The Siege of Belgrade (1456) articles in English and Turkish, in `.wikipedia/` of this story and of
  `rise-of-the-ottomans`.
- The order of the lines follows the English article: the Rumelian troops with most of the guns on the right towards the
  Danube, the Anatolian troops on the left towards the Sava, the janissaries and the sultan’s post in the centre, the
  sipahis from the Danube eastwards, the fleet north-west of the city and boats on the Sava.
- The Turkish article puts the double wall and the water ditch on the south side of the fortress and says that Hunyadi
  brings 4,000 more men in before 21 July. The English article puts the breach of 21 July in the weaker eastern walls,
  which the Zindan gate and the Nebojša tower later strengthen. The plan draws the janissaries through the eastern wall
  of the upper town and the Rumelian troops into the lower town.
- The articles put Hunyadi’s camp across the Danube and the crusaders across the Sava. The plan draws the crusaders’
  camp at Zemun (Zimony) on the Syrmian bank, where they cross the Sava on 22 July and where Hunyadi dies in August.

### Drawn size

The phase pages share one bbox, about 6.6 km by 5.5 km, from Zemun and the river fleet in the north-west to the Ottoman
camp in the south-east. The blocks are about real size: the Ottoman line 2.7 km from the Sava to the Danube, a wing
900 m wide and 180 m deep, the janissaries 600 m.

- Boats are drawn as hulls 110 to 150 m long, about five times a river galley’s length, so that a hull reads on the map.
  A fleet unit of 9 to 16 hulls stands for its 40 to 200 boats.
- The water ditch is drawn 30 m wide.

### Real ground

The frame’s origin is the middle of the Ottoman line at 20.462, 44.8176, with u north-east along the line (bearing 42)
from the Sava to the Danube and w south-east, away from the fortress.

- The Danube, the Zemun arm and the Sava are traced from the flattened water surface of the elevation tiles at zoom 14
  (65 m), cut into three areas that hold no island, so the Great War Island stays land. A modern marina on the bank east
  of the fortress is left out. The base map draws no rivers.
- The overview draws the Danube and the Sava as lines 700 m and 300 m wide, from the flattened water of the tiles at
  zoom 11 and 12, good to about 500 m. Hunyadi’s boats start the overview above Slankamen, a reconstruction: the articles
  say only that he gathers 200 boats on the Danube.
- The upper town stands on the end of the ridge at about 115 m, the lower town on the slope to the rivers at 70 to 80 m.
  The walls follow general plans of Kalemegdan, good to about 50 m: the upper town about 600 m across with the inner
  castle at its north-west corner, the lower town between it and the Danube and Sava banks.
- The Ottoman line runs across the neck of the headland from the Sava at 20.4505, 44.8085 to the Danube at 20.4735,
  44.8267, about 800 m from the walls, with the trenches 300 to 350 m in front of it and the camp 1.1 km behind its centre
  on the ridge. These distances are a fit of the accounts to the ground.
- The retreat of 22 to 23 July heads south-east, as the English article says. The articles name no road.

## Otlukbeli

The battle of Otlukbeli in 1473 is a header in the nav with an overview page and two phase pages: the ambush on the
Euphrates of 4 August and the battle of 11 August. `otlukbeli-1473.mjs` draws them.

### Sides

`ottomans` (Mehmed’s army, the troops of his sons Mustafa and Bayezid, Davud Pasha’s Anatolian troops, Has Murad’s
Rumelian troops and the two camps), `aq-qoyunlu` (Uzun Hasan’s army with Uğurlu Mehmed’s horsemen and the men of the
Karaman princes). The Euphrates (Karasu), the sandbanks and the stream take `water`. The battle’s `battle.yaml` lists
the families of its sides with the story’s colours.

### Sources

The accounts agree on the ambush on the river, the death of Has Murad, the halt at Üç Ağız, Gavur İshak on the hill of
Otlukbeli, the order of the Ottoman wings and the death of Zeynel. They give few places and no distances. The hover
names say where a fact comes from one account only.

- Contemporary and near contemporary: Tursun Beg, Giovanni Maria Angiolello, who served Şehzade Mustafa, Aşıkpaşazade,
  Neşri and Ibn Kemal, who tells the surrender of Şebinkarahisar. On the Aq Qoyunlu side Abu Bakr Tihrani’s Kitab-i
  Diyarbakriyya gives the ambush, the order of the Aq Qoyunlu wings and Seljukshah’s advice to Uzun Hasan.
- Modern: Franz Babinger (1978), John Woods (1999) and Theoharis Stavrides (2001). The Battle of Otlukbeli, Otlukbeli
  Muharebesi, Ughurlu Muhammad and Turahanoğlu Ömer Bey articles, in `.wikipedia/` of this story.
- The ambush is dated 4 August by the Ughurlu Muhammad article and 1 August by the Ömer Bey article, after Stavrides.
  The text gives both.
- The Ottoman order follows the Turkish article: Mustafa, the governor of Karaman, on the left, Bayezid, the governor
  of Amasya, on the right, the janissaries with the guns and the new light mortars in the centre. The English article
  puts Davud Pasha’s Anatolian troops on the plain against Zeynel before Mustafa joins them, so the plan draws both on
  the left.
- The Aq Qoyunlu order follows the Ughurlu Muhammad article, after Tihrani: Zeynel with Sufi Khalil Mawsillu and
  Sulayman Bijan on the right, the nephews Murad and Alikhan on the left, and Uğurlu Mehmed with a swift force behind
  the left. The English article adds Mehmed Bakır on the left.

### Drawn size

The two phases share one bbox, about 23 km by 23 km, from the heights of Otlukbeli in the north-west to the bend of
the Euphrates in the plain of Tercan in the south-east. The two fields lie 18 km apart, so a block of real depth draws
as a thin line:

- The blocks keep their real width, the Ottoman wings 1.3 to 2.4 km, the Aq Qoyunlu wings 2.4 to 2.8 km and the
  janissaries 1.4 km, and are drawn 450 to 800 m deep, about twice the depth of a line of horsemen.
- The camp at the river is drawn 1.7 km by 1.2 km, the camp at Üç Ağız 1.5 km by 1.1 km.
- The river is drawn 70 m wide, the sandbanks as a reach 240 m wide, the stream 30 m wide.

### Real ground

Positions are written as `[lon, lat]`. The battle of 11 August is laid out in a frame with its origin on the floor of
the hollow at 40.035, 39.976, u east along the lines and w south from the Aq Qoyunlu to the Ottomans.

- The Karasu, the western Euphrates, is traced from the elevation tiles at zoom 13. It comes from Aşkale along the
  foot of the hills at about 39.93 north, turns south-west into the plain of Tercan, bends at 40.134, 39.86 and runs
  south past the mouth of the Tuzla stream at 40.23, 39.74. Its bed lies at 1,380 to 1,470 m. The base map draws no
  rivers.
- The stream is traced downhill on the same tiles: from the heights at 40.113, 40.02 south to 39.975, south-west to a
  junction of three valleys at 40.057, 39.93, then south and east across the plain to the river at 40.133, 39.856. The
  trace is good to about 200 m.
- The English article puts the battle at 40.0222, 39.9736, on the floor of a hollow at 1,700 to 1,790 m that runs west
  to east below a ridge of 1,900 to 2,100 m. The plan puts the Aq Qoyunlu on the slope of the ridge, the Ottoman lines
  in the hollow 1.5 to 2 km south of them, and the Ottoman camp of Üç Ağız at the junction of three valleys 4.5 km to
  the south-east, where the valley of the stream narrows. The articles name only Otlukbeli, Üç Ağız and Tercan, so
  these positions are a fit of the accounts to the ground.
- Uğurlu Mehmed’s stream is the stream east of the hollow at 40.11 east, the one stream on the ground between the Aq
  Qoyunlu left and the Ottoman right.
- The ambush of 4 August is placed at the bend in the plain of Tercan, the stretch near Tercan where the river runs
  through open plain with low banks. The Ottoman camp stands on the west bank at the mouth of the stream, Uzun Hasan’s
  army on the plain east of the river. The accounts say only that the river widens over sand near Tercan.
- The overview’s march names the places of the accounts: Constantinople, Yenişehir, Sivas, Koyulhisar, Şebinkarahisar,
  Erzincan and Tercan. The road from Yenişehir by Eskişehir, Ankara and Yozgat to Sivas, the road from Şebinkarahisar
  by Refahiye to Erzincan and the way up the Karasu gorge from Erzincan to the plain of Tercan are reconstructions.

## Texts, images, zones

Same as the Punic Wars rules. The eight pages of the siege and the phase pages of Belgrade and Otlukbeli are close
plan pages and show no zones.
