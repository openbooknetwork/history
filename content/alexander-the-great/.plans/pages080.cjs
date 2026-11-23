// Writes the page files and routes of section 080 (no battles). Run from the repo root:
//   node content/alexander-the-great/.plans/pages080.cjs
// A page.yaml that exists keeps its `sources` (the reviewers edit them); everything else comes from here.
// A route is one or more parts, each kept on its own surface by the router: a river voyage is a 'land' part (the
// rivers lie inside Natural Earth's land), the Gulf a 'sea' part. craterus-325 on 020 is 070's route, not redrawn.
const fs = require('fs');
const path = require('path');
const { fix } = require('./router.cjs');
const SEC = 'content/alexander-the-great/pages/080-the-long-road-home';
fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "325 – 323 BC: The long road home"\n');

const q = s => JSON.stringify(s);
// parts: [[mode, coords], ...]; a part that starts where the last ended drops the repeated point
const route = (name, color, parts, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra }, parts });

const PATALA = [68.75, 25.88], ORA = [66.32, 26.1], PASNI = [63.48, 25.29], GWATAR = [61.6, 25.2], PURA = [60.69, 27.2];
const INDUS_MOUTH = [67.1, 24.45], HARMOZEIA = [56.98, 27.08], ANCHORAGE = [56.85, 27.0], SALMUS = [57.62, 27.95];
const PASARGADAE = [53.17, 30.19], PERSEPOLIS = [52.89, 29.93], SUSA = [48.26, 32.19];
const OPIS = [44.55, 33.15], BAGISTANE = [47.44, 34.39], ECBATANA = [48.52, 34.8], BABYLON = [44.421, 32.536];
const THAPSACUS = [38.3, 36.0];
const SHATT_MOUTH = [48.55, 29.93], QURNA = [47.43, 31.0], KARUN_MOUTH = [48.85, 30.12], KARUN_SEA = [48.95, 30.05], SHATT_LAND = [48.5, 29.98];
// 050's line from Susa to Persepolis by the Uxian lowlands and the Persian Gate (pages050.cjs), reversed
const UXIAN_ROAD = [SUSA, [48.8, 31.95], [49.3, 31.75], [49.9, 31.8], [50.3, 31.3], [50.8, 30.7], [51.3, 30.25],
  [51.6, 30.3], [51.75, 30.42]];
const ROYAL_ROAD = [PERSEPOLIS, [52.4, 30.1], [52.05, 30.3], ...UXIAN_ROAD.slice().reverse()];
// Susa down the Dez and the Karun by Ahvaz, then the Bahmanshir arm to the sea
const KARUN_DOWN = [SUSA, [48.42, 32.05], [48.55, 31.75], [48.68, 31.32], [48.55, 30.9], [48.3, 30.5], [48.55, 30.25],
  [48.8, 30.08], KARUN_MOUTH];
// the Shatt al-Arab and the Tigris from its mouth to Opis
const TIGRIS_UP = [SHATT_LAND, [48.2, 30.25], [47.85, 30.5], [47.6, 30.75], QURNA, [47.35, 31.4], [47.15, 31.84],
  [46.8, 32.1], [46.3, 32.3], [45.82, 32.5], [45.5, 32.75], [45.15, 32.95], [44.9, 33.1], OPIS];
// Opis by the Diyala, Khanaqin and Kermanshah to Bagistane, up the Gamasiab by Kangavar to Ecbatana
const ZAGROS_ROAD = [OPIS, [44.65, 33.75], [45.38, 34.35], [45.86, 34.46], [46.24, 34.28], [46.53, 34.11], [47.06, 34.32],
  BAGISTANE, [47.75, 34.38], [47.97, 34.5], [48.2, 34.62], ECBATANA];
// the road back down to the Diyala, then south across the Tigris to Babylon
const DOWN_TO_BABYLON = [...ZAGROS_ROAD.slice(1).reverse(), [44.4, 33.0], [44.4, 32.8], BABYLON];
const EUPHRATES_UP = [[48.3, 30.12], [47.85, 30.5], QURNA, [47.0, 30.97], [46.6, 31.0], [46.26, 31.05], [45.8, 31.15],
  [45.28, 31.31], [44.95, 31.6], [44.6, 31.9], [44.4, 32.2], BABYLON];
const EUPHRATES_DOWN = [THAPSACUS, [39.0, 35.95], [39.6, 35.75], [40.14, 35.33], [40.6, 34.85], [40.92, 34.45],
  [41.45, 34.42], [41.98, 34.47], [42.37, 34.13], [42.82, 33.64], [43.3, 33.42], [43.78, 33.35], [44.1, 33.0],
  [44.23, 32.78], BABYLON];

const ARR = b => `Arrian, Anabasis of Alexander, ${b}, tr. E. J. Chinnock.`;
const PLUT = c => `Plutarch, Life of Alexander, ${c}, tr. Bernadotte Perrin (Loeb, 1919).`;
const DIOD = b => `Diodorus of Sicily, Library of History, ${b}, tr. C. Bradford Welles (Loeb, 1963).`;
const BOS = c => `A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2, ${c}.`;

const pages = [
  { dir: '010-gedrosian-desert', title: 'The march through the Gedrosian desert', date: 'Late summer and autumn 325 BC',
    bbox: [58.5, 23.8, 70, 30], zones: ['macedon-325'],
    routes: ['alexander-ora-325', 'alexander-gedrosia-325'],
    markers: ['patala-325b', 'ora-325', 'gedrosia-coast-325', 'pura-325'],
    sources: [ARR('book 6, 21 to 26'), PLUT('66'), BOS('XVII'),
      'Donald W. Engels, Alexander the Great and the Logistics of the Macedonian Army (1978), ch. 5 and appendix 3.'],
    routeFiles: {
      // across the Indus, by the foothills of the Kirthar range to the mouth of the Hab, the night march across the
      // coastal desert, to the plain of Las Bela (Arrian 6.21; Bosworth XVII)
      'alexander-ora-325': route('Alexander, Patala to Ora, 325 BC', 'macedon', [['land',
        [PATALA, [68.35, 25.42], [67.9, 25.2], [67.45, 25.05], [67.0, 24.98], [66.75, 24.97], [66.55, 25.3],
          [66.42, 25.7], ORA]]]),
      // the Jau Lak pass, the Kolwa and Kech valleys to Turbat, down to Pasni, seven days along the shore to about
      // Gwatar, north by the Dashtiari plain to the Bampur river and Pura (080.15)
      'alexander-gedrosia-325': route('Alexander through the Gedrosian desert, 325 BC', 'macedon', [['land',
        [ORA, [65.9, 26.25], [65.68, 26.3], [65.23, 26.45], [64.8, 26.4], [64.4, 26.25], [63.9, 26.05], [63.05, 26.0],
          [63.3, 25.6], PASNI, [63.0, 25.3], [62.6, 25.27], [62.2, 25.22], [61.85, 25.15], GWATAR, [61.25, 25.5],
          [61.05, 26.1], [60.85, 26.75], PURA]]]),
    } },
  { dir: '020-nearchus-carmania', title: "Nearchus's voyage and the reckoning in Carmania",
    date: 'Autumn 325 to winter 325–324 BC',
    bbox: [55.5, 23.5, 69, 33], zones: ['macedon-325'],
    routes: [['nearchus-325', 'alexander-carmania-325', 'craterus-325']],
    markers: ['patala-325c', 'pura-325b', 'harmozeia-325', 'salmus-325'],
    sources: [ARR('book 6, 27 to 28'), DIOD('book 17, 104 to 106'), PLUT('67 to 68'), BOS('XVIII')],
    routeFiles: {
      // one line along the coast, approximate: no station of the voyage was read (Arrian's Indica)
      'nearchus-325': route("Nearchus's fleet, the Indus to Carmania, 325 BC", 'macedon', [['sea',
        [INDUS_MOUTH, [66.95, 24.62], [66.6, 24.75], [66.2, 25.1], [65.6, 25.2], [64.6, 25.1], [63.5, 25.1],
          [62.3, 25.0], [61.6, 25.0], [60.5, 25.25], [59.5, 25.3], [58.5, 25.45], [57.75, 25.55], [57.4, 25.7], [57.0, 26.3],
          [56.9, 26.8], ANCHORAGE]]]),
      // across the Jaz Murian into the valley of the Halil Rud (080.20)
      'alexander-carmania-325': route('Alexander, Pura into Carmania, 325 BC', 'macedon', [['land',
        [PURA, [60.0, 27.45], [59.4, 27.65], [58.7, 27.75], [58.1, 27.8], SALMUS]]]),
    } },
  { dir: '030-susa-weddings', title: 'From Carmania to Susa: the purges and the Susa weddings',
    date: 'Winter 325–324 to spring 324 BC',
    bbox: [46.5, 25.5, 59, 33.5], zones: ['macedon-324'],
    routes: [['alexander-persis-324', 'hephaestion-persis-324'], ['army-susa-324', 'nearchus-324']],
    markers: ['salmus-325b', 'harmozeia-325b', 'persepolis-324', 'susa-324'],
    sources: [ARR('book 6, 28 to 30, and book 7, 4 to 6'), DIOD('book 17, 107 to 108'), BOS('XVIII'),
      'Pierre Briant, Alexander the Great, Encyclopaedia Iranica (1985).'],
    routeFiles: {
      // up the Halil Rud, west by Sirjan and Shahr-i Babak, north of Lake Neyriz, to Pasargadae (080.16)
      'alexander-persis-324': route('Alexander, Carmania to Persepolis, winter 325–324 BC', 'macedon', [['land',
        [SALMUS, [57.72, 28.3], [57.74, 28.67], [57.3, 29.1], [56.5, 29.4], [55.68, 29.45], [55.12, 30.12], [54.4, 30.15],
          [53.7, 30.15], PASARGADAE, [53.0, 30.05], PERSEPOLIS]]]),
      // nearer the coast, by Lar, Fasa and Shiraz (080.16)
      'hephaestion-persis-324': route('Hephaestion with the main army, Carmania to Persepolis, winter 325–324 BC',
        'macedon', [['land', [SALMUS, [57.0, 27.75], [56.3, 27.55], [55.5, 27.4], [54.9, 27.5], [54.34, 27.68],
          [54.0, 28.3], [53.65, 28.94], [53.1, 29.3], [52.53, 29.61], [52.75, 29.8], PERSEPOLIS]]], { offset: 5 }),
      'army-susa-324': route('The army, Persepolis to Susa, early 324 BC', 'macedon', [['land', ROYAL_ROAD]]),
      // along the north shore of the Gulf to the mouth of the Euphrates, back east to the Pasitigris (the Karun)
      // and up it to the bridge near Susa (080.17)
      'nearchus-324': route("Nearchus's fleet, Carmania to Susiana, 324 BC", 'macedon', [
        ['sea', [ANCHORAGE, [56.75, 26.85], [56.5, 26.6], [55.8, 26.45], [55.0, 26.45], [54.0, 26.6], [53.0, 27.0],
          [52.0, 27.5], [51.2, 28.3], [50.7, 29.0], [50.2, 29.6], [49.5, 29.85], [48.9, 29.8], [48.4, 29.82],
          [48.75, 29.88], KARUN_SEA]],
        ['land', KARUN_DOWN.slice().reverse().slice(0, -1).concat([[48.35, 32.12]])]]),
    } },
  { dir: '040-opis-mutiny', title: 'The Opis mutiny', date: 'Spring to summer 324 BC',
    bbox: [34, 29, 50.5, 38], zones: ['macedon-324'],
    routes: [['alexander-tigris-324', 'hephaestion-gulf-324'], 'army-opis-324', 'craterus-324'],
    markers: ['susa-324b', 'opis-324'],
    sources: [ARR('book 7, 7 to 12'), PLUT('71'), DIOD('book 17, 108 to 109'), BOS('XIX')],
    routeFiles: {
      // down the Eulaeus (the Karun) to the sea and along the coast to the mouth of the Tigris (Arrian 7.7)
      'alexander-tigris-324': route('Alexander by water, Susa to the Tigris, spring 324 BC', 'macedon', [
        ['land', KARUN_DOWN], ['sea', [KARUN_SEA, [48.85, 29.85], [48.6, 29.85], SHATT_MOUTH]]]),
      // overland west to the Tigris near its estuary (Arrian 7.7; Bosworth XIX)
      'hephaestion-gulf-324': route('Hephaestion with the infantry, Susa to the Gulf, spring 324 BC', 'macedon',
        [['land', [SUSA, [48.0, 31.75], [47.75, 31.3], [47.6, 30.75]]]]),
      'army-opis-324': route('The army up the Tigris to Opis, 324 BC', 'macedon', [['land', TIGRIS_UP]]),
      // a plain line: no source gives its way (080.8, 080.19); it stops in Cilicia
      'craterus-324': route('Craterus and the veterans, towards Macedon, 324 BC', 'macedon',
        [['land', [OPIS, [41.5, 35.4], [38.5, 36.6], [35.4, 37.0]]]], { style: 'dashed' }),
    } },
  { dir: '050-death-of-hephaestion', title: 'Hephaestion dies at Ecbatana', date: 'Summer to autumn 324 BC',
    bbox: [43, 31.5, 50, 36], zones: ['macedon-324'],
    routes: ['alexander-ecbatana-324', 'perdiccas-324'],
    markers: ['opis-324b', 'ecbatana-324', 'babylon-324'],
    sources: [ARR('book 7, 13 to 14'), DIOD('book 17, 110'), PLUT('72'), BOS('XIX')],
    routeFiles: {
      'alexander-ecbatana-324': route('Alexander, Opis to Ecbatana, summer to autumn 324 BC', 'macedon',
        [['land', ZAGROS_ROAD]]),
      // no source gives the way: the road the court came up by
      'perdiccas-324': route("Perdiccas with Hephaestion's body, Ecbatana to Babylon, 324 BC", 'macedon',
        [['land', DOWN_TO_BABYLON]], { offset: 5 }),
    } },
  { dir: '060-death-in-babylon', title: 'Babylon: the last plans and the death of Alexander',
    date: 'Winter 324–323 to June 323 BC',
    bbox: [34, 25, 53, 37.5], zones: ['macedon-324'],
    routes: [['alexander-babylon-323', 'nearchus-323', 'levant-ships-323']],
    markers: ['ecbatana-323', 'babylon-323', 'thapsacus-323', 'arabia-323'],
    sources: [ARR('book 7, 15 to 28'), PLUT('73 to 77'),
      'Diodorus of Sicily, Library of History, book 17, 112 to 118, tr. C. Bradford Welles (Loeb, 1963), and book 18, 4, tr. Russel M. Geer (Loeb, 1947).',
      'The Babylonian astronomical diary for 323 BC, after Sachs and Hunger, with Jona Lendering\'s notes (Livius.org).'],
    routeFiles: {
      'alexander-babylon-323': route('Alexander, Ecbatana to Babylon, 323 BC', 'macedon', [['land', DOWN_TO_BABYLON]]),
      'nearchus-323': route("Nearchus's fleet, the Gulf to Babylon, 323 BC", 'macedon', [['land', EUPHRATES_UP]]),
      // overland in sections from the coast between Sidon and Aradus, by the Homs gap, to Thapsacus; down the river
      'levant-ships-323': route('Warships from Phoenicia, 323 BC', 'macedon', [['land',
        [[35.86, 34.43], [36.35, 34.72], [36.72, 35.13], [37.15, 35.6], [37.6, 35.95], THAPSACUS,
          ...EUPHRATES_DOWN.slice(1)]]]),
    } },
];

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  let y = `date: ${q(p.date)}\ntitle: ${q(p.title)}\nbbox: [${p.bbox.join(', ')}]\nzones: ${list(p.zones)}\n` +
    `routes: ${list(p.routes)}\nmarkers: ${list(p.markers)}\n`;
  const old = fs.existsSync(path.join(dir, 'page.yaml')) ? fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + p.sources.map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(path.join(dir, 'page.yaml'), y);
  fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  for (const [id, r] of Object.entries(p.routeFiles)) {
    let coords = [];
    for (const [mode, c] of r.parts) {
      const f = fix(mode, c);
      const same = coords.length && coords[coords.length - 1].join() === f[0].join();
      coords = coords.concat(same ? f.slice(1) : f);
    }
    const f = { type: 'Feature', properties: { id, ...r.properties }, geometry: { type: 'LineString', coordinates: coords } };
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
