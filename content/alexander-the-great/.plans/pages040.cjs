// Writes the page files and routes of section 040 (not the Issus phase pages). Run from the repo root.
const fs = require('fs');
const path = require('path');
const { fix } = require('./router.cjs');
const SEC = 'content/alexander-the-great/pages/040-issus-and-the-coast';
fs.mkdirSync(path.join(SEC, '020-issus'), { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "333 – 331 BC: Issus and the coast"\n');
fs.writeFileSync(path.join(SEC, '020-issus', 'group.yaml'), 'title: "Battle of Issus, 333 BC"\n');
const SEA = new Set(['phoenician-fleet-332', 'cypriot-fleet-332', 'fleet-332', 'siege-train-332', 'fleet-332b']);

const q = s => JSON.stringify(s);
const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra }, geometry: { type: 'LineString', coordinates: coords } });

const GORDIUM = [31.99, 39.65], TARSUS = [34.895, 36.918], BABYLON = [44.421, 32.536], SOCHI = [36.45, 36.45];
const THAPSACUS = [38.25, 36.0], ISSUS = [36.21, 36.86], MYRIANDRUS = [36.15, 36.55], PINARUS_S = [36.205, 36.772];
const PINARUS_N = [36.21, 36.787], DAMASCUS = [36.29, 33.51], MARATHUS = [35.905, 34.84], SIDON = [35.37, 33.56];
const TYRE = [35.2, 33.27], GAZA = [34.466, 31.504], PELUSIUM = [32.55, 31.04], MEMPHIS = [31.255, 29.849];
const ALEXANDRIA = [29.92, 31.2], PARAETONIUM = [27.24, 31.35], SIWA = [25.55, 29.21];
const ARRIAN = b => `Arrian, Anabasis of Alexander, ${b}.`;
const BOS = 'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988).';

const pages = [
  { dir: '010-cilician-gates', title: 'Through the Cilician Gates', date: 'Summer 333 BC', bbox: [31.5, 32.0, 45.0, 40.4],
    zones: ['macedon-333b', 'persia-333b'], routes: ['alexander-333', 'darius-333'],
    markers: ['gordium-333b', 'cilician-gates-333', 'tarsus-333', 'thapsacus-333', 'babylon-333', 'sochi-333'],
    sources: [ARRIAN('book 2, 4 to 5'), BOS, 'Quintus Curtius Rufus, History of Alexander, book 3, 1 to 7.',
      'Plutarch, Life of Alexander, 18 to 19.'],
    routeFiles: {
      // Ancyra, Cappadocia across the Halys, the Camp of Cyrus, the Gates, Tarsus
      'alexander-333': route('Alexander marches from Gordium by Lake Tatta and Tyana through the Cilician Gates to Tarsus', 'macedon',
        [GORDIUM, [32.86, 39.94], [33.45, 39.3], [33.65, 38.8], [34.0, 38.3], [34.62, 37.83], [34.75, 37.45], [34.79, 37.28],
          TARSUS]),
      // up the Euphrates to the crossing at Thapsacus, then west to Sochi (Bosworth's "conjectural" route)
      'darius-333': route('Darius brings the royal army from Babylon to the Amik plain', 'persia',
        [BABYLON, [44.0, 33.0], [43.78, 33.35], [42.82, 33.64], [41.98, 34.47], [40.92, 34.45], [40.14, 35.33],
          [39.01, 35.95], THAPSACUS, [37.4, 36.2], [36.8, 36.35], SOCHI]),
    } },
  { dir: '020-issus/010-issus', title: 'Darius behind the lines', date: 'Autumn 333 BC', bbox: [35.35, 36.38, 36.65, 37.15],
    zones: ['macedon-333b', 'persia-333b'], routes: ['alexander-333b', 'darius-333b', 'alexander-333c'],
    markers: ['issus-333', 'amanian-gates-333', 'myriandrus-333', 'sochi-333b', 'mallus-333'], battle: 'issus-333',
    sources: [ARRIAN('book 2, 5 to 8'), 'Polybius, Histories, book 12, 17 to 22.', BOS,
      "A. B. Bosworth, A Historical Commentary on Arrian's History of Alexander, vol. I (1980)."],
    routeFiles: {
      // Mallus, Castabulum at the head of the gulf, Issus, the Pillar of Jonah, Myriandrus
      'alexander-333b': route('Alexander marches round the gulf to Myriandrus', 'macedon',
        [TARSUS, [35.2, 36.85], [35.5, 36.76], [35.85, 36.85], [36.1, 36.95], ISSUS, PINARUS_S, [36.18, 36.67],
          MYRIANDRUS]),
      // the Bahce Pass, the narrows of Toprakkale, Issus, the Pinarus
      'darius-333b': route('Darius crosses the Amanus and comes down behind Alexander', 'persia',
        [SOCHI, [36.5, 36.8], [36.58, 37.15], [36.35, 37.12], [36.145, 37.06], ISSUS, PINARUS_N]),
      'alexander-333c': route('Alexander turns back by night to the Pinarus', 'macedon',
        [MYRIANDRUS, [36.18, 36.67], PINARUS_S], { offset: 5 }),
    } },
  { dir: '030-darius-letter', title: "Damascus and Darius's letter", date: 'Winter 333–332 BC', bbox: [34.3, 33.2, 38.6, 37.0],
    zones: ['macedon-333c', 'persia-333c'], routes: ['parmenion-333', 'darius-333c', 'alexander-333d'],
    markers: ['darius-camp-333', 'thapsacus-333b', 'damascus-333', 'marathus-333', 'byblus-333', 'sidon-333'],
    sources: [ARRIAN('book 2, 11 to 15'), 'Diodorus Siculus, Library of History, book 17, 35 to 39.', BOS,
      'Plutarch, Life of Alexander, 21 and 24.'],
    routeFiles: {
      // by the coast road to Antioch, then up the Orontes by Apamea and Emesa
      'parmenion-333': route('Parmenion marches to Damascus', 'macedon',
        [PINARUS_S, [36.18, 36.67], [36.2, 36.5], [36.16, 36.2], [36.4, 35.42], [36.72, 34.73], [36.73, 34.3], [36.73, 34.02],
          [36.6, 33.74], DAMASCUS]),
      'darius-333c': route('Darius flees over the Amanus to Thapsacus', 'persia',
        [PINARUS_N, [36.45, 36.9], [37.0, 36.7], [37.6, 36.35], THAPSACUS]),
      // down the Syrian coast by Marathus and Byblus to Sidon
      'alexander-333d': route('Alexander marches down the Syrian coast to Sidon', 'macedon',
        [ISSUS, [36.18, 36.67], [36.2, 36.5], [36.16, 36.2], [36.1, 35.9], [35.95, 35.65], [35.78, 35.52], [35.93, 35.1], MARATHUS, [35.95, 34.5],
          [35.8, 34.3], [35.65, 34.12], [35.5, 33.85], SIDON]),
    } },
  { dir: '040-siege-of-tyre', title: 'The siege of Tyre', date: 'Winter to summer 332 BC', bbox: [32.3, 33.0, 36.5, 35.7],
    zones: ['macedon-332a', 'persia-332a'], routes: ['phoenician-fleet-332', 'cypriot-fleet-332', 'fleet-332'],
    markers: ['sidon-332', 'old-tyre-332'], battle: 'tyre-332',
    sources: [ARRIAN('book 2, 15 to 24'), 'Diodorus Siculus, Library of History, book 17, 40 to 46.', BOS,
      'Quintus Curtius Rufus, History of Alexander, book 4, 2 to 4.'],
    routeFiles: {
      'phoenician-fleet-332': route('The kings of Aradus and Byblus bring their ships to Sidon', 'macedon',
        [[35.8, 34.87], [35.75, 34.6], [35.6, 34.2], [35.45, 33.9], [35.33, 33.58]]),
      'cypriot-fleet-332': route('The kings of Cyprus bring their ships to Sidon', 'macedon',
        [[34.0, 35.15], [34.6, 34.6], [35.33, 33.58]]),
      'fleet-332': route('Alexander sails with the fleet from Sidon to Tyre', 'macedon',
        [[35.33, 33.58], [35.22, 33.4], [35.17, 33.28]]),
    } },
  { dir: '050-gaza', title: 'Gaza', date: 'Autumn 332 BC', bbox: [33.6, 31.1, 36.0, 33.5],
    zones: ['macedon-332', 'persia-332'], routes: ['alexander-332', 'siege-train-332'],
    markers: ['tyre-332b'], battle: 'gaza-332',
    sources: [ARRIAN('book 2, 25 to 27'), 'Quintus Curtius Rufus, History of Alexander, book 4, 6.', BOS,
      'Plutarch, Life of Alexander, 25.'],
    routeFiles: {
      'alexander-332': route('Alexander marches down the coast to Gaza', 'macedon',
        [TYRE, [35.15, 33.0], [35.1, 32.85], [34.98, 32.6], [34.9, 32.3], [34.75, 32.0], [34.6, 31.75], GAZA]),
      'siege-train-332': route('The siege engines come by sea from Tyre', 'macedon',
        [[35.17, 33.27], [34.95, 32.9], [34.7, 32.3], [34.4, 31.55]]),
    } },
  { dir: '060-egypt-submits', title: 'Egypt opens its gates', date: 'Winter 332–331 BC', bbox: [29.6, 29.6, 34.8, 31.8],
    zones: ['macedon-331', 'persia-331'], routes: ['fleet-332b', 'alexander-332b'],
    markers: ['gaza-332b', 'pelusium-332', 'heliopolis-332', 'memphis-332'],
    sources: [ARRIAN('book 3, 1'), 'Diodorus Siculus, Library of History, book 17, 48 to 49.', BOS,
      'Quintus Curtius Rufus, History of Alexander, book 4, 7.'],
    routeFiles: {
      // by sea to Pelusium; the voyage up the Nile is told, not drawn, because a route keeps to one surface
      'fleet-332b': route('The fleet sails to Pelusium and up the Pelusiac branch to Memphis', 'macedon',
        [[34.85, 32.6], [34.4, 31.9], [33.5, 31.4], [32.6, 31.12], [32.55, 31.04], [32.3, 30.95], [31.95, 30.8], [31.51, 30.57],
          [31.25, 30.2], [31.22, 30.0], [31.255, 29.849]]),
      // Pelusium, then through the desert to Heliopolis with the Nile on his right, across to Memphis
      'alexander-332b': route('Alexander marches by Pelusium and Heliopolis to Memphis', 'macedon',
        [GAZA, [34.0, 31.2], [33.4, 31.1], [32.9, 31.05], PELUSIUM, [32.2, 30.7], [31.7, 30.35], [31.31, 30.13], MEMPHIS]),
    } },
  { dir: '070-alexandria-and-siwa', title: 'Alexandria and Siwa', date: 'Early 331 BC', bbox: [25.0, 28.9, 31.6, 31.7],
    zones: ['macedon-331'], routes: ['alexander-331', 'alexander-331b', 'alexander-331c'],
    markers: ['alexandria-331', 'pharos-331', 'mareotis-331', 'canopus-331', 'paraetonium-331', 'siwa-331', 'memphis-331'],
    sources: [ARRIAN('book 3, 1 to 5'), 'Diodorus Siculus, Library of History, book 17, 49 to 52.', BOS,
      'Plutarch, Life of Alexander, 26 to 27.'],
    routeFiles: {
      // down the western branch to Canopus and round Lake Mareotis
      'alexander-331': route('Alexander goes down the Nile to Canopus and founds Alexandria', 'macedon',
        [MEMPHIS, [31.05, 30.25], [30.75, 30.6], [30.45, 31.0], [30.2, 31.2], [30.07, 31.3], [30.1, 31.15], [30.0, 31.05],
          [29.85, 31.07], [29.88, 31.15], ALEXANDRIA]),
      // along the coast to Paraetonium, then inland to the oasis
      'alexander-331b': route('Alexander goes by Paraetonium to the oracle at Siwa', 'macedon',
        [ALEXANDRIA, [29.5, 30.95], [28.9, 30.85], [28.0, 31.05], PARAETONIUM, [26.8, 30.5], [26.0, 29.6], SIWA]),
      // back by the same road, after Aristobulus, and along the coast and the Delta to Memphis
      'alexander-331c': route('Alexander returns by the same road to Memphis (Aristobulus)', 'macedon',
        [SIWA, [26.0, 29.6], [26.8, 30.5], PARAETONIUM, [28.0, 31.05], [28.9, 30.85], [29.5, 30.95], [29.95, 31.05],
          [30.5, 30.55], [31.0, 30.05], MEMPHIS], { offset: 5 }),
    } },
];

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  let y = `date: ${q(p.date)}\ntitle: ${q(p.title)}\nbbox: [${p.bbox.join(', ')}]\nzones: ${list(p.zones)}\n` +
    `routes: ${list(p.routes)}\nmarkers: ${list(p.markers)}\n`;
  if (p.battle) y += `battle: ${p.battle}\n`;
  // The reviewers edit the sources in page.yaml: a rerun keeps the lines already there.
  const old = fs.existsSync(path.join(dir, 'page.yaml')) ? fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + p.sources.map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(path.join(dir, 'page.yaml'), y);
  fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  for (const [id, f] of Object.entries(p.routeFiles)) {
    if (id !== 'fleet-332b') f.geometry.coordinates = fix(SEA.has(id) ? 'sea' : 'land', f.geometry.coordinates);
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
