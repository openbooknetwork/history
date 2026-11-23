// Writes the page files and routes of section 060. Run from the repo root:
//   node content/alexander-the-great/.plans/pages060.cjs
// NO_BATTLE=1 writes each `battle:` line commented out, for captures taken before the cards exist.
const fs = require('fs');
const path = require('path');
const { fix } = require('./router.cjs');
const SEC = 'content/alexander-the-great/pages/060-bactria-sogdiana';
fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "Bactria and Sogdiana"\n');
const SEA = new Set([]);
// Straight on purpose: no source gives the couriers' track.
const STRAIGHT = new Set(['couriers-330']);

const q = s => JSON.stringify(s);
const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra }, geometry: { type: 'LineString', coordinates: coords } });

const ECBATANA = [48.52, 34.8], HECATOMPYLUS = [54.05, 35.95], ZADRACARTA = [53.06, 36.56], SUSIA = [59.51, 36.48];
const ARTACOANA = [62.2, 34.35], PHRADA = [62.11, 32.37], ARIASPIANS = [61.9, 31.0], KANDAHAR = [65.7, 31.6];
const ALEX_CAUCASUS = [69.27, 34.97], KHAWAK = [69.83, 35.67], DRAPSACA = [68.86, 36.73], BACTRA = [66.9, 36.76];
const OXUS_X = [66.9, 37.37], NAUTACA = [66.83, 39.05], MARACANDA = [66.97, 39.65], ESCHATE = [69.62, 40.28];
const POLYTIMETUS = [65.6, 40.0], COENUS = [64.8, 39.8], ROCK = [67.0, 38.25], TERMEZ = [67.25, 37.23];
const ARRIAN = b => `Arrian, Anabasis of Alexander, ${b}.`;
const CURTIUS = b => `Quintus Curtius Rufus, History of Alexander, ${b}.`;
const BOS = 'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.';
const BOS2 = b => `A. B. Bosworth, A Historical Commentary on Arrian's History of Alexander II (1995), ${b}.`;
// Samarkand to Khujand by Jizzakh and Istaravshan; and the Zeravshan below Samarkand.
const ROAD_NE = [MARACANDA, [67.4, 39.9], [67.84, 40.12], [68.4, 40.05], [68.85, 39.95], [69.0, 39.91], [69.35, 40.1], ESCHATE];
const ROAD_SW = ROAD_NE.slice().reverse();
const ZERAVSHAN = [MARACANDA, [66.6, 39.75], [66.26, 39.9], [65.9, 39.95], POLYTIMETUS];
// Shakhrisabz, the Iron Gate by Derbent and Termez on the Oxus.
const ROAD_S = [MARACANDA, [66.9, 39.3], NAUTACA, [66.95, 38.6], ROCK, [67.15, 37.7], TERMEZ, [67.0, 36.95], BACTRA];

const pages = [
  { dir: '010-phrada', title: 'Hyrcania, Areia and the fall of Parmenion', date: 'Summer–autumn 330 BC',
    bbox: [47.0, 29.0, 71.0, 41.5], zones: ['macedon-330b', 'persia-330b', 'scythians-329'],
    routes: ['alexander-330-hyrcania', 'alexander-330-areia', 'alexander-330-phrada', 'couriers-330'],
    markers: ['zadracarta-330', 'susia-330', 'artacoana-330', 'phrada-330', 'ecbatana-330b', 'bactra-330'],
    sources: [ARRIAN('book 3, 23 to 27'), 'Diodorus Siculus, Library of History, book 17, 75 to 80.',
      'Plutarch, Life of Alexander, 44 to 49.', BOS],
    routeFiles: {
      // north over the Elburz by the Shamshirbun pass, down to the Caspian plain and west to Sari
      'alexander-330-hyrcania': route('Alexander crosses the Elburz into Hyrcania', 'macedon',
        [HECATOMPYLUS, [54.1, 36.2], [53.8, 36.4], [53.4, 36.5], ZADRACARTA]),
      // east by Gorgan, back over the mountains to Shahrud, Sabzevar and Nishapur to Tus; on towards Bactria
      // along the Kopet Dag foothills, then back by forced march to the Areian capital
      'alexander-330-areia': route('Alexander marches through Parthia to Susia and turns back on Areia', 'macedon',
        [ZADRACARTA, [53.6, 36.68], [54.3, 36.8], [54.7, 36.7], [54.98, 36.42], [55.8, 36.4], [56.7, 36.3], [57.68, 36.21],
          [58.3, 36.2], [58.8, 36.21], [59.2, 36.3], SUSIA, [60.0, 36.55], [60.5, 36.5], [60.6, 35.8], [61.2, 35.2],
          [61.7, 34.75], ARTACOANA]),
      'alexander-330-phrada': route('Alexander marches into Drangiana to Phrada', 'macedon',
        [ARTACOANA, [62.0, 33.6], [62.1, 32.9], PHRADA]),
      'couriers-330': route('Riders on racing camels carry the order to kill Parmenion', 'macedon',
        [PHRADA, ECBATANA], { style: 'dashed' }),
    } },
  { dir: '020-hindu-kush', title: 'Over the Hindu Kush', date: 'Winter 330–329 to summer 329 BC',
    bbox: [59.0, 30.0, 72.0, 41.0], zones: ['macedon-329', 'persia-329', 'scythians-329'],
    routes: ['alexander-329-arachosia', 'alexander-329-bactria', 'bessus-329'],
    markers: ['alexandria-caucasus-329', 'drapsaca-329', 'bactra-329', 'oxus-329', 'nautaca-329'],
    sources: [ARRIAN('book 3, 27 to 30'), 'Diodorus Siculus, Library of History, book 17, 81 to 83.', BOS,
      'Donald W. Engels, Alexander the Great and the Logistics of the Macedonian Army (1978), ch. 4.'],
    routeFiles: {
      // to the Ariaspians on the Helmand lakes, up the Helmand to Kandahar, by Qalat and Ghazni to Kabul and Begram
      'alexander-329-arachosia': route('Alexander marches through Arachosia to the foot of the Hindu Kush', 'macedon',
        [PHRADA, [61.85, 31.6], ARIASPIANS, [62.2, 30.4], [63.0, 30.35], [63.8, 30.9], [64.37, 31.59], [65.0, 31.6],
          KANDAHAR, [66.9, 32.1], [67.7, 32.8], [68.42, 33.55], [68.9, 34.2], [69.17, 34.53], ALEX_CAUCASUS]),
      // up the Panjshir to the Khawak pass, down the Andarab to Kunduz, west to Balkh, north to the river
      'alexander-329-bactria': route('Alexander crosses the Hindu Kush, takes Bactra and crosses the Oxus', 'macedon',
        [ALEX_CAUCASUS, [69.5, 35.25], [69.75, 35.5], KHAWAK, [69.3, 35.95], [69.0, 36.3], DRAPSACA, [68.3, 36.75],
          [67.69, 36.7], BACTRA, OXUS_X, [66.9, 37.75], [66.88, 38.1]]),
      'bessus-329': route('Bessus burns the land, crosses the Oxus and withdraws to Nautaca', 'persia',
        [[67.2, 36.4], [67.25, 36.9], [67.2, 37.4], [67.05, 38.0], [66.9, 38.6], NAUTACA]),
    } },
  { dir: '030-jaxartes', title: 'Sogdiana rises', date: 'Summer 329 BC',
    bbox: [63.0, 36.3, 71.5, 42.3], zones: ['macedon-329b', 'sogdians-329', 'scythians-329'],
    routes: ['alexander-329-jaxartes'],
    markers: ['maracanda-329', 'cyropolis-329'],
    battle: 'jaxartes-329',
    sources: [ARRIAN('book 3, 30, and book 4, 1 to 5'), CURTIUS('book 7, 6 to 9'), BOS, BOS2('on book 4, 1 to 4')],
    routeFiles: {
      'alexander-329-jaxartes': route('Alexander marches by Maracanda to the Jaxartes', 'macedon',
        [OXUS_X, [66.9, 37.75], [66.88, 38.1], [66.95, 38.6], NAUTACA, [66.9, 39.3], ...ROAD_NE]),
    } },
  { dir: '040-polytimetus', title: 'The Polytimetus', date: '329 to winter 329–328 BC',
    bbox: [63.0, 33.8, 71.0, 41.2], zones: ['macedon-329c', 'sogdians-329b', 'scythians-329'],
    routes: ['column-329', 'spitamenes-329', 'spitamenes-329b', 'alexander-329-maracanda', 'alexander-329-bactra'],
    markers: ['maracanda-329b', 'alexandria-eschate-329b', 'bactra-329b'],
    battle: 'polytimetus-329',
    sources: [ARRIAN('book 4, 3 to 7'), CURTIUS('book 7, 6 to 10'), BOS, BOS2('on book 4, 5 to 7')],
    routeFiles: {
      'spitamenes-329': route('Spitamenes lifts the siege and draws back down the Zeravshan', 'sogdians',
        [...ZERAVSHAN, [65.3, 40.1]], { offset: 6 }),
      'column-329': route('The relief column marches to Maracanda and follows Spitamenes', 'macedon',
        [...ROAD_SW, ...ZERAVSHAN.slice(1)], { offset: -6 }),
      // back up the valley to the citadel, then away into the western desert
      'spitamenes-329b': route('Spitamenes returns to Maracanda and escapes into the desert', 'sogdians',
        [...ZERAVSHAN.slice().reverse(), [66.5, 40.2], [65.6, 40.6], [64.8, 40.9]], { offset: 12 }),
      // 1,500 stades in three days to Maracanda, down the valley to the battlefield and the edge of the desert
      'alexander-329-maracanda': route('Alexander marches to Maracanda and down the Zeravshan to the battlefield', 'macedon',
        [...ROAD_SW, ...ZERAVSHAN.slice(1), [65.25, 40.15]]),
      // laying waste the valley, then over the hills to Bactra for the winter
      'alexander-329-bactra': route('Alexander lays waste the valley and goes into winter quarters at Bactra', 'macedon',
        [[65.25, 40.15], [65.8, 39.85], [66.3, 39.6], [66.6, 39.2], ...ROAD_S.slice(2)], { offset: 5 }),
    } },
  { dir: '050-maracanda', title: 'The death of Cleitus', date: '328 to winter 328–327 BC',
    bbox: [62.5, 36.3, 70.5, 41.3], zones: ['macedon-328', 'sogdians-328', 'scythians-329'],
    routes: ['alexander-328', 'spitamenes-328', 'alexander-328b', 'spitamenes-328b'],
    markers: ['maracanda-328', 'bactra-328', 'coenus-328', 'nautaca-328'],
    sources: [ARRIAN('book 4, 8 to 9 and 15 to 18'), 'Plutarch, Life of Alexander, 50 to 52.',
      CURTIUS('book 8, 1 to 3'), BOS],
    routeFiles: {
      'alexander-328': route('Alexander crosses the Oxus and the columns meet at Maracanda', 'macedon',
        // east up the Oxus, across it near Ai-Khanum, over the Hissar by the Anzob pass and down the Zeravshan
        // (Bosworth XIII; Commentary II on 4.15.7 and 4.16.3, "guesswork")
        [BACTRA, [67.7, 36.75], [68.3, 37.0], [68.9, 37.1], [69.42, 37.17], [69.3, 37.6], [69.0, 38.2], [68.78, 38.56],
          [68.85, 39.08], [68.5, 39.4], [68.0, 39.45], [67.6, 39.5], MARACANDA]),
      // from the desert of the Massagetae across the Oxus to a fort in western Bactria, up to Bactra and back
      'spitamenes-328': route('Spitamenes and the Massagetae raid Bactria', 'sogdians',
        [[63.4, 40.1], [64.3, 39.3], [65.1, 38.2], [65.45, 37.72], [65.8, 37.2], [66.4, 36.85], [66.82, 36.8],
          [66.4, 37.0], [66.2, 37.37], [65.8, 38.3], [64.8, 39.45], [63.9, 40.3]]),
      'alexander-328b': route('Alexander goes into winter quarters at Nautaca', 'macedon',
        [MARACANDA, [66.9, 39.3], NAUTACA], { offset: 5 }),
      // from Gabae on the edge of the desert into the western Zeravshan valley, and back
      'spitamenes-328b': route('Spitamenes invades from Gabae and is beaten by Coenus', 'sogdians',
        [[63.7, 40.45], [64.3, 40.0], COENUS, [64.4, 40.25], [63.9, 40.65]]),
    } },
  { dir: '060-sogdian-rock', title: 'The Sogdian Rock and Roxana', date: 'Spring 327 BC',
    bbox: [63.5, 35.5, 70.5, 40.8], zones: ['macedon-327', 'scythians-329'],
    routes: ['alexander-327'],
    markers: ['nautaca-327', 'bactra-327'],
    battle: 'sogdian-rock-327',
    sources: [ARRIAN('book 4, 10 to 14 and 18 to 22'), 'Plutarch, Life of Alexander, 47 and 53 to 55.',
      CURTIUS('book 7, 11, and book 8, 4 to 8'),
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2 and part II, D.',
      BOS2('on book 4, 18 to 19')],
    routeFiles: {
      'alexander-327': route('Alexander takes the Sogdian Rock and gathers the army at Bactra', 'macedon',
        ROAD_S.slice(2)),
    } },
];

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  let y = `date: ${q(p.date)}\ntitle: ${q(p.title)}\nbbox: [${p.bbox.join(', ')}]\nzones: ${list(p.zones)}\n` +
    `routes: ${list(p.routes)}\nmarkers: ${list(p.markers)}\n`;
  if (p.battle) y += `${process.env.NO_BATTLE ? '# ' : ''}battle: ${p.battle}\n`;
  // The reviewers edit the sources in page.yaml: a rerun keeps the lines already there.
  const old = fs.existsSync(path.join(dir, 'page.yaml')) ? fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + p.sources.map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(path.join(dir, 'page.yaml'), y);
  fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  for (const [id, f] of Object.entries(p.routeFiles)) {
    if (!STRAIGHT.has(id)) f.geometry.coordinates = fix(SEA.has(id) ? 'sea' : 'land', f.geometry.coordinates);
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
