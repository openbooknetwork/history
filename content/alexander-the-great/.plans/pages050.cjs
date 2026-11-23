// Writes the page files and routes of section 050 (not the phase pages). Run from the repo root.
const fs = require('fs');
const path = require('path');
const { fix } = require('./router.cjs');
const SEC = 'content/alexander-the-great/pages/050-gaugamela-and-persia';
for (const g of ['010-gaugamela', '030-persian-gate']) fs.mkdirSync(path.join(SEC, g), { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "331 – 330 BC: Gaugamela and Persia"\n');
fs.writeFileSync(path.join(SEC, '010-gaugamela', 'group.yaml'), 'title: "Battle of Gaugamela, 331 BC"\n');
fs.writeFileSync(path.join(SEC, '030-persian-gate', 'group.yaml'), 'title: "Battle of the Persian Gate, 330 BC"\n');
const SEA = new Set(['agis-crete-331']);

const q = s => JSON.stringify(s);
const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra }, geometry: { type: 'LineString', coordinates: coords } });

const MEMPHIS = [31.255, 29.849], PELUSIUM = [32.55, 31.04], TYRE = [35.2, 33.27], THAPSACUS = [38.3, 36.0];
const GAUGAMELA = [43.44, 36.56], ARBELA = [44.01, 36.19], BABYLON = [44.421, 32.536], SUSA = [48.26, 32.19];
const ECBATANA = [48.52, 34.8], GATE = [51.8, 30.45], PERSEPOLIS = [52.89, 29.93], PASARGADAE = [53.17, 30.19];
const RHAGAE = [51.43, 35.59], CASPIAN_GATES = [52.0, 35.4], HECATOMPYLUS = [54.0, 35.9], SULTANABAD = [49.69, 34.09];
const MEGALOPOLIS = [22.13, 37.4];
const ARRIAN = b => `Arrian, Anabasis of Alexander, ${b}.`;
const BOS = 'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988).';
const DIOD = b => `Diodorus, Library of History, ${b}.`;
const UXIAN_ROAD = [SUSA, [48.8, 31.95], [49.3, 31.75], [49.9, 31.8], [50.3, 31.3], [50.8, 30.7], [51.3, 30.25],
  [51.6, 30.3], [51.75, 30.42]];

const pages = [
  { dir: '010-gaugamela/010-gaugamela', title: "Darius's last offer and the road to Gaugamela",
    date: 'Spring – 1 October 331 BC', bbox: [30.5, 29.3, 46, 38.2], zones: ['macedon-331', 'persia-331'],
    routes: ['alexander-mesopotamia-331', 'darius-gaugamela-331'],
    markers: ['memphis-331b', 'tyre-331', 'thapsacus-331', 'babylon-331'],
    battle: 'gaugamela-331',
    sources: [ARRIAN('book 2, 25, and book 3, 6 to 9'), DIOD('book 17, 53 to 55'), BOS],
    routeFiles: {
      // the coast road to Tyre, inland to Thapsacus, then Harran, Rhesaena, Nisibis, the Tigris north of Mosul
      'alexander-mesopotamia-331': route('Alexander marches from Egypt by Tyre and Thapsacus to Gaugamela', 'macedon',
        [MEMPHIS, [31.31, 30.13], [31.7, 30.35], [32.2, 30.7], PELUSIUM, [32.9, 31.05], [33.4, 31.1], [34.0, 31.2],
          [34.47, 31.5], [34.75, 32.0], [34.95, 32.5], [35.1, 32.85], TYRE, [35.6, 33.6], [36.2, 34.2], [36.72, 34.73],
          [37.16, 36.2], THAPSACUS, [39.03, 36.87], [40.07, 36.85], [41.22, 37.07], [42.3, 36.85], [43.05, 36.5],
          GAUGAMELA]),
      // up the plain with the Tigris on his right, across the Tigris to Arbela
      'darius-gaugamela-331': route('Darius leads the army of the empire from Babylon to Gaugamela', 'persia',
        [BABYLON, [44.3, 33.4], [43.9, 34.2], [43.6, 35.0], [43.7, 35.5], [44.0, 35.9], ARBELA, GAUGAMELA]),
    } },
  { dir: '020-babylon-and-susa', title: 'Babylon and Susa open their gates', date: 'October – December 331 BC',
    bbox: [38.0, 31.3, 49.5, 37.4], zones: ['macedon-331b', 'persia-331b'],
    routes: ['darius-flight-331', 'mazaeus-babylon-331', 'alexander-babylon-331'],
    markers: ['gaugamela-331b', 'arbela-331b', 'babylon-331b', 'susa-331', 'ecbatana-331'],
    sources: [ARRIAN('book 3, 15 to 16'), DIOD('book 17, 64 to 66'), BOS,
      'Astronomical diary for 331 BC, after Sachs and Hunger, in the translation of Jona Lendering (Livius.org).'],
    routeFiles: {
      // by Arbela, the Spilik pass and Ruwandiz into Media
      'darius-flight-331': route('Darius flees over the Zagros to Ecbatana', 'persia',
        [GAUGAMELA, ARBELA, [44.4, 36.6], [44.52, 36.61], [45.3, 36.3], [46.3, 35.6], [47.4, 35.1], ECBATANA]),
      'mazaeus-babylon-331': route('Mazaeus goes round behind the Macedonians to Babylon', 'persia',
        [GAUGAMELA, [43.2, 36.3], [43.1, 35.8], [43.25, 35.2], [43.8, 34.0], [44.3, 33.0], BABYLON], { offset: 5 }),
      // over the Lycus to Arbela, south to Babylon, by Sittacene east of the Tigris to Susa
      'alexander-babylon-331': route('Alexander pursues to Arbela, then takes Babylon and Susa', 'macedon',
        [GAUGAMELA, [43.6, 36.35], ARBELA, [44.39, 35.47], [44.6, 34.4], [44.6, 33.3], BABYLON, [45.1, 32.6],
          [46.5, 32.4], [47.6, 32.3], SUSA]),
    } },
  { dir: '030-persian-gate/010-persian-gate', title: 'The Uxian defile and the Persian Gate',
    date: 'December 331 – January 330 BC', bbox: [47.8, 28.8, 53.6, 32.8], zones: ['macedon-331b', 'persia-331b'],
    routes: ['alexander-uxians-331', 'parmenion-persis-330'],
    markers: ['susa-331b', 'uxian-defile-331', 'persepolis-330'], battle: 'persian-gate-330',
    sources: [ARRIAN('book 3, 17 to 18'), 'Curtius, History of Alexander, book 5, 3.',
      'A. B. Bosworth, A Historical Commentary on Arrian’s History of Alexander, volume 1 (1980).', BOS],
    routeFiles: {
      // across the Pasitigris, the Uxian lowlands and defile, the plain of Fahlian, up to Mullah Susan
      'alexander-uxians-331': route('Alexander forces the Uxian defile and marches to the Persian Gate', 'macedon',
        UXIAN_ROAD),
      // by the carriage road towards Kazerun and the Shiraz plain (Stein's route)
      'parmenion-persis-330': route('Parmenion takes the carriage road into Persis', 'macedon',
        [[51.3, 30.25], [51.5, 30.0], [51.65, 29.62], [52.1, 29.55], [52.53, 29.6], [52.75, 29.8], PERSEPOLIS]),
    } },
  { dir: '040-persepolis', title: 'Persepolis taken and burned', date: 'January – May 330 BC',
    bbox: [47.8, 28.8, 54, 32.8], zones: ['macedon-330a', 'persia-330a'],
    routes: ['alexander-persepolis-330', 'treasure-susa-330'],
    markers: ['persian-gate-330b', 'persepolis-330b', 'pasargadae-330', 'susa-330'],
    sources: [ARRIAN('book 3, 18'), DIOD('book 17, 69 to 72'), BOS,
      'Christian San José Campos, Alexander the Great in Persepolis, Karanos 4 (2021).'],
    routeFiles: {
      // down to the bridged river, the plain of 'Aliabad and the Pulvar, Persepolis, Pasargadae
      'alexander-persepolis-330': route('Alexander crosses the river to Persepolis and goes on to Pasargadae', 'macedon',
        [GATE, [52.05, 30.3], [52.4, 30.1], [52.7, 29.95], PERSEPOLIS, [53.0, 30.05], PASARGADAE]),
      'treasure-susa-330': route('Bullion from Persepolis goes back to Susa', 'macedon',
        [PERSEPOLIS, [52.4, 30.1], [52.05, 30.3], ...UXIAN_ROAD.slice().reverse()], { offset: 5 }),
    } },
  { dir: '050-megalopolis', title: 'Agis III and the war for Megalopolis', date: 'Early 330 BC',
    bbox: [20.5, 34.8, 25.5, 41.2],
    zones: ['macedon-330a', 'thessaly-352', 'league-331', 'sparta-331'],
    routes: ['agis-crete-331', 'agis-331', 'antipater-330'],
    markers: ['sparta-330', 'corinth-330'], battle: 'megalopolis-330',
    sources: [DIOD('book 17, 48, 62 to 63 and 73'), 'Curtius, History of Alexander, book 6, 1.', BOS,
      'Ernst Badian, Darius III, Encyclopaedia Iranica.'],
    routeFiles: {
      'agis-crete-331': route("Agis III brings his mercenary army back from Crete", 'sparta',
        [[23.7, 35.7], [23.3, 36.0], [22.9, 36.4], [22.6, 36.72]]),
      'agis-331': route('Agis III marches on Megalopolis', 'sparta',
        [[22.565, 36.765], [22.48, 36.95], [22.43, 37.07], [22.3, 37.25], MEGALOPOLIS]),
      // through Thessaly, past Thermopylae and Boeotia, over the Isthmus into Arcadia
      'antipater-330': route('Antipater marches down into the Peloponnese', 'macedon',
        [[22.5225, 40.7557], [22.5, 40.1], [22.67, 39.92], [22.62, 39.8], [22.42, 39.64], [22.38, 39.3], [22.4, 39.05],
          [22.43, 38.9], [22.54, 38.8], [22.8, 38.62], [23.1, 38.4], [23.32, 38.32], [23.35, 38.02], [23.2, 37.98],
          [23.0, 37.93], [22.88, 37.85], [22.7, 37.62], [22.42, 37.45], MEGALOPOLIS]),
    } },
  { dir: '060-death-of-darius', title: 'The pursuit and death of Darius', date: 'May – July or August 330 BC',
    bbox: [47.5, 29.3, 55.5, 37.2], zones: ['macedon-330', 'persia-330'],
    routes: ['darius-caspian-330', 'parmenion-ecbatana-330', 'alexander-pursuit-330'],
    markers: ['persepolis-330c', 'ecbatana-330', 'rhagae-330', 'caspian-gates-330', 'hecatompylus-330'],
    sources: [ARRIAN('book 3, 19 to 22'), DIOD('book 17, 73 to 74'), 'Plutarch, Life of Alexander, 42 to 43.', BOS],
    routeFiles: {
      'darius-caspian-330': route('Darius retreats from Ecbatana by the Caspian Gates', 'persia',
        [ECBATANA, [49.7, 35.3], [50.9, 35.5], RHAGAE, CASPIAN_GATES, [53.0, 35.6], [53.6, 35.85], HECATOMPYLUS],
        { offset: 5 }),
      'parmenion-ecbatana-330': route('Parmenion takes the treasure to Ecbatana', 'macedon',
        [SULTANABAD, [49.0, 34.5], ECBATANA]),
      // Paraetacene, the turn short of Ecbatana near Sultanabad, Rhagae, the Gates, Choarene, the desert
      'alexander-pursuit-330': route('Alexander pursues Darius from Persepolis to Hecatompylus', 'macedon',
        [PERSEPOLIS, [52.6, 30.5], [52.2, 31.4], [51.67, 32.65], [50.8, 33.4], SULTANABAD, [50.3, 34.8], [51.0, 35.3],
          RHAGAE, CASPIAN_GATES, [52.7, 35.3], [53.5, 35.55], HECATOMPYLUS]),
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
    f.geometry.coordinates = fix(SEA.has(id) ? 'sea' : 'land', f.geometry.coordinates);
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
