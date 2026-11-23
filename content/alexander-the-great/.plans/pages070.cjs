// Writes the page files and routes of section 070 (not the Hydaspes phase pages). Run from the repo root:
//   node content/alexander-the-great/.plans/pages070.cjs
// NO_BATTLE=1 writes each `battle:` line commented out, for captures taken before the cards exist.
// A page.yaml that exists keeps its `sources` (the reviewers edit them); everything else comes from here.
const fs = require('fs');
const path = require('path');
const { fix } = require('./router.cjs');
const RIV = require('./rivers.json');
const SEC = 'content/alexander-the-great/pages/070-india';
fs.mkdirSync(path.join(SEC, '040-hydaspes'), { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "India"\n');
fs.writeFileSync(path.join(SEC, '040-hydaspes', 'group.yaml'), 'title: "Battle of the Hydaspes, 326 BC"\n');
const SEA = new Set([]);

const q = s => JSON.stringify(s);
const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra }, geometry: { type: 'LineString', coordinates: coords } });
const nearest = (r, p) => RIV[r].reduce((bi, q, i) => (Math.hypot(q[0] - p[0], q[1] - p[1]) <
  Math.hypot(RIV[r][bi][0] - p[0], RIV[r][bi][1] - p[1]) ? i : bi), 0);
const river = (r, a, b) => { const i = nearest(r, a), j = nearest(r, b);
  return i <= j ? RIV[r].slice(i, j + 1) : RIV[r].slice(j, i + 1).reverse(); };

const BACTRA = [66.9, 36.76], DRAPSACA = [68.86, 36.73], KHAWAK = [69.83, 35.67], ALEX_CAUCASUS = [69.27, 34.97];
const JALALABAD = [70.45, 34.43], PESHAWAR = [71.57, 34.01], OHIND = [72.42, 34.0], MASSAGA = [71.88, 34.68];
const AORNOS = [72.72, 34.74], TAXILA = [72.82, 33.75], CAMP = [73.12, 32.61], PORUS_CAMP = [73.12, 32.55];
const BUCEPHALA = [73.41, 32.68], NICAEA = [73.3, 32.57], ACESINES_X = [73.92, 32.42], HYDRAOTES_X = [74.31, 31.62];
const HYPHASIS = [75.13, 31.32], MALLIAN_TOWN = [71.8, 30.42], PATALA = [68.75, 25.88];
const ARRIAN = b => `Arrian, Anabasis of Alexander, ${b}.`;
const DIOD = b => `Diodorus Siculus, Library of History, ${b}.`;
const BOS = c => `A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ${c}.`;
const BOS2 = b => `A. B. Bosworth, A Historical Commentary on Arrian’s History of Alexander, vol. 2 (1995), ${b}.`;
const COPHEN_ROAD = [[69.6, 34.6], [70.1, 34.45], JALALABAD];
const EAST = [NICAEA, [73.6, 32.5], ACESINES_X, [74.2, 32.1], [74.4, 31.85], HYDRAOTES_X, [74.87, 31.63], HYPHASIS];

const pages = [
  { dir: '010-cophen', title: 'Down the Cophen valley', date: '327 BC',
    bbox: [66.0, 33.0, 74.0, 37.3], zones: ['macedon-327', 'indians-327', 'taxila-327', 'porus-326'],
    routes: ['hephaestion-327', 'alexander-327b'],
    markers: ['bactra-327b', 'hindu-kush-327', 'cophen-327', 'bajaur-327', 'swat-327', 'massaga-327', 'indus-bridge-327'],
    sources: [ARRIAN('book 4, 22 to 27'), DIOD('book 17, 84'), 'Plutarch, Life of Alexander, 59.', BOS('ch. 2.XIV')],
    routeFiles: {
      // the main road down the Cophen by the Khyber and Peshawar to the Indus near Ohind
      'hephaestion-327': route('Hephaestion and Perdiccas take the main road down the Cophen to the Indus', 'macedon',
        [...COPHEN_ROAD, [70.95, 34.17], [71.25, 34.05], PESHAWAR, [72.0, 34.03], OHIND]),
      // over the Hindu Kush, down the Cophen, then up the Choes (Kunar) into Bajaur and over the Guraeus to Massaga
      'alexander-327b': route('Alexander crosses the Hindu Kush and marches through the hills to Massaga', 'macedon',
        [BACTRA, [67.69, 36.7], [68.3, 36.75], DRAPSACA, [69.0, 36.3], [69.3, 35.95], KHAWAK, [69.75, 35.5],
          [69.5, 35.25], ALEX_CAUCASUS, ...COPHEN_ROAD, [70.9, 34.85], [71.5, 34.75], [71.75, 34.75], MASSAGA],
        { offset: 5 }),
    } },
  { dir: '020-aornos', title: 'The rock of Aornos', date: 'Winter 327–326 BC',
    bbox: [70.5, 33.4, 73.6, 35.4], zones: ['macedon-326', 'indians-326', 'taxila-327', 'porus-326'],
    routes: ['alexander-aornos-327'],
    markers: ['indus-bridge-327', 'taxila-327'],
    battle: 'aornos-327',
    sources: [ARRIAN('book 4, 28 to 30'), DIOD('book 17, 85 to 86'), BOS('ch. 2.XIV'), BOS2('on 4.28 to 30')],
    routeFiles: {
      'alexander-aornos-327': route('Alexander marches across Swat to the Indus and up to the rock', 'macedon',
        [MASSAGA, [72.15, 34.62], [72.45, 34.5], [72.75, 34.45], [72.8, 34.6], AORNOS]),
    } },
  { dir: '030-taxila', title: 'Taxila, an ally beyond the Indus', date: 'Spring 326 BC',
    bbox: [71.6, 32.4, 74.4, 34.5], zones: ['macedon-326', 'indians-326', 'taxila-327', 'porus-326'],
    routes: ['alexander-indus-326'],
    markers: ['indus-bridge-326', 'taxila-326', 'hydaspes-326'],
    sources: [ARRIAN('book 5, 3 and 8'), DIOD('book 17, 86 to 87'), 'Quintus Curtius Rufus, History of Alexander, book 8, 12.',
      BOS('ch. 2.XV')],
    routeFiles: {
      // down the road built along the Indus to the bridge, across it and on to Taxila
      'alexander-indus-326': route('Alexander crosses the Indus and is received at Taxila', 'macedon',
        [AORNOS, [72.8, 34.55], [72.75, 34.3], [72.6, 34.1], OHIND, [72.6, 33.85], TAXILA]),
    } },
  { dir: '040-hydaspes/010-hydaspes', title: 'Porus at the Hydaspes', date: 'May 326 BC',
    bbox: [72.4, 31.95, 74.2, 33.85], zones: ['macedon-326', 'indians-326', 'taxila-327', 'porus-326'],
    routes: ['alexander-hydaspes-326', 'alexander-crossing-326', 'porus-march-326'],
    markers: ['taxila-326b', 'hydaspes-camp-326', 'porus-camp-326', 'bucephala-326', 'nicaea-326'],
    battle: 'hydaspes-326',
    sources: [ARRIAN('book 5, 9 to 19'), DIOD('book 17, 87 to 89'), 'Plutarch, Life of Alexander, 60 to 61.',
      BOS2('on 5.8 to 19')],
    routeFiles: {
      // over the Salt Range by the Nandana pass to Haranpur (Stein)
      'alexander-hydaspes-326': route('Alexander marches from Taxila to the Hydaspes', 'macedon',
        [TAXILA, [72.9, 33.4], [73.0, 33.0], [73.1, 32.72], CAMP]),
      // upstream away from the bank to the headland 150 stades above the camp, across, and on to the field
      'alexander-crossing-326': route('Alexander crosses upstream in the storm and marches on Porus', 'macedon',
        [CAMP, [73.25, 32.67], [73.36, 32.71], BUCEPHALA, [73.42, 32.62], [73.33, 32.565]]),
      'porus-march-326': route('Porus leaves his camp and draws up on the sandy plain', 'porus',
        [PORUS_CAMP, [73.2, 32.54], [73.27, 32.555]]),
    } },
  { dir: '050-hyphasis', title: 'The army refuses at the Hyphasis', date: 'Summer 326 BC',
    bbox: [72.6, 30.6, 76.4, 33.6], zones: ['macedon-326', 'indians-326b', 'taxila-327', 'porus-326b'],
    routes: ['alexander-hyphasis-326', 'alexander-return-326'],
    markers: ['nicaea-326b', 'bucephala-326b', 'acesines-326', 'hydraotes-326', 'hyphasis-326'],
    sources: [ARRIAN('book 5, 20 to 29'), DIOD('book 17, 89 to 95'), 'Plutarch, Life of Alexander, 62.', BOS('ch. 2.XVI')],
    routeFiles: {
      'alexander-hyphasis-326': route('Alexander marches east across the Acesines and the Hydraotes to the Hyphasis',
        'macedon', EAST),
      'alexander-return-326': route('The army turns back by the same road to the Hydaspes', 'macedon',
        EAST.slice().reverse(), { offset: 5 }),
    } },
  { dir: '060-malli', title: 'Down the rivers to the Malli', date: 'November 326 to winter 326–325 BC',
    bbox: [70.6, 29.6, 74.0, 33.0], zones: ['macedon-326', 'indians-326b', 'taxila-327', 'porus-326b'],
    routes: ['fleet-326', 'alexander-malli-326'],
    markers: ['nicaea-326c', 'bucephala-326c', 'acesines-326', 'hydraotes-325'],
    battle: 'malli-325',
    sources: [ARRIAN('book 6, 1 to 13'), DIOD('book 17, 95 to 99'), 'Plutarch, Life of Alexander, 63.', BOS('ch. 2.XVI')],
    routeFiles: {
      // down the Hydaspes to the Acesines, and down the Acesines to the borderlands of the Malli
      'fleet-326': route('The fleet sails down the Hydaspes and the Acesines', 'macedon',
        [...river('jhelum', BUCEPHALA, [72.14, 31.18]), ...river('chenab', [72.14, 31.18], [71.94, 30.86]).slice(1)]),
      // across the desert to the Hydraotes, over it, and on to the Mallian town
      'alexander-malli-326': route('Alexander crosses the desert to the Hydraotes and storms the Mallian town', 'macedon',
        [[72.09, 31.05], [72.6, 30.85], [72.89, 30.76], [72.6, 30.45], [72.1, 30.4], MALLIAN_TOWN]),
    } },
  { dir: '070-ocean', title: 'Patala and the Ocean', date: 'Summer 325 BC',
    bbox: [56.5, 23.5, 72.5, 31.8], zones: ['macedon-325a', 'indians-325', 'taxila-327', 'porus-326b'],
    routes: ['craterus-325', 'fleet-325'],
    markers: ['arachosia-325', 'drangiana-325', 'carmania-325', 'indus-325', 'patala-325', 'indian-ocean-325'],
    sources: [ARRIAN('book 6, 14 to 20'), DIOD('book 17, 102 to 104'), 'Plutarch, Life of Alexander, 66.',
      BOS('ch. 2.XVI and 2.XVII')],
    routeFiles: {
      // from the Indus near Alor by the Bolan pass and Kandahar to the Helmand, through Sistan to Carmania
      'craterus-325': route('Craterus marches by Arachosia and Drangiana towards Carmania', 'macedon',
        [[68.9, 27.68], [68.3, 28.5], [67.9, 29.55], [67.6, 29.75], [67.0, 30.2], [66.4, 30.9], [65.7, 31.6], [64.9, 31.6],
          [64.36, 31.6], [63.8, 30.9], [63.0, 30.35], [62.2, 30.4], [61.9, 31.0], [61.2, 30.2], [60.86, 29.5], [59.6, 29.2],
          [58.36, 29.1], [57.74, 28.67], [57.72, 28.2]]),
      // down the Acesines into the Indus, down the Indus to Patala, and down the western arm into the Ocean
      'fleet-325': route('The fleet sails down the Indus to Patala and out into the Ocean', 'macedon',
        [...river('chenab', [71.65, 30.57], [70.64, 29.04]), ...river('indus', [70.55, 29.0], [68.27, 26.3]), [68.6, 26.0],
          PATALA, [68.45, 25.5], [68.1, 25.0], [67.7, 24.75], [67.35, 24.62]], { seaTail: [[67.25, 24.4], [67.1, 24.3]] }),
    } },
];

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  let y = `date: ${q(p.date)}\ntitle: ${q(p.title)}\nbbox: [${p.bbox.join(', ')}]\nzones: ${list(p.zones)}\n` +
    `routes: ${list(p.routes)}\nmarkers: ${list(p.markers)}\n`;
  if (p.battle) y += `${process.env.NO_BATTLE ? '# ' : ''}battle: ${p.battle}\n`;
  const old = fs.existsSync(path.join(dir, 'page.yaml')) ? fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + p.sources.map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(path.join(dir, 'page.yaml'), y);
  fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  for (const [id, f] of Object.entries(p.routeFiles)) {
    f.geometry.coordinates = fix(SEA.has(id) ? 'sea' : 'land', f.geometry.coordinates);
    // a river route that ends out at sea: the tail past the mouth is kept on the water
    const tail = f.properties.seaTail; delete f.properties.seaTail;
    if (tail) f.geometry.coordinates = f.geometry.coordinates.concat(fix('sea', tail));
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
