// Writes the page files and routes of section 030 (not the Granicus phase pages). Run from the repo root.
const fs = require('fs');
const path = require('path');
const SEC = 'content/alexander-the-great/pages/030-asia-minor';
fs.mkdirSync(path.join(SEC, '030-granicus'), { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "334 – 333 BC: Asia Minor"\n');
fs.writeFileSync(path.join(SEC, '030-granicus', 'group.yaml'), 'title: "Battle of the Granicus, 334 BC"\n');

const { fix } = require('./router.cjs');
const SEA = new Set(['crossing-parmenion-334', 'crossing-alexander-334', 'fleet-lade-334', 'persian-fleet-334',
  'withdrawal-cos-334', 'memnon-fleet-333']);
const q = s => JSON.stringify(s);
const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra }, geometry: { type: 'LineString', coordinates: coords } });

const SARDIS = [28.04, 38.49], CELAENAE = [30.16, 38.07], SUSA = [48.25, 32.19];
const AMPHIPOLIS = [23.845, 40.822], SESTOS = [26.42, 40.235], ELAEUS = [26.215, 40.065];
const HARBOUR = [26.21, 40.0], TROY = [26.2389, 39.9575], ARISBE = [26.47, 40.12];
const GRANICUS_W = [27.22, 40.26], GRANICUS_E = [27.27, 40.255], ZELEIA = [27.6, 40.3];
const DASCYLIUM = [28.03, 40.13], EPHESUS = [27.34, 37.94], MILETUS = [27.278, 37.53];
const HALICARNASSUS_CAMP = [27.44, 37.05], PHASELIS = [30.55, 36.53], PERGE = [30.85, 36.96];
const PLATEAU = [29.4, 38.75], GORDIUM = [31.99, 39.65];

const ARRIAN = (b) => `Arrian, Anabasis of Alexander, ${b} (tr. E. J. Chinnock).`;
const pages = [
  // dated 336 BC, so it stands at the end of section 010: a page never starts before the page ahead of it
  { dir: '../010-macedon-rising/070-achaemenid-empire', title: 'The Persian Empire of Darius III', date: '336 BC', bbox: [20, 23.5, 75, 45],
    zones: ['persia-336', 'macedon-340', 'thessaly-352', 'league-337', 'sparta-337', 'epirus-350', 'illyrians-359',
      'thracians-340', 'triballi-335', 'getae-335'], routes: ['royal-road'],
    markers: ['sardis-336', 'susa-336', 'hellespontine-phrygia-336', 'egypt-336', 'babylonia-336', 'persis-336',
      'media-336', 'bactria-336'],
    sources: ['Pierre Briant, From Cyrus to Alexander: A History of the Persian Empire (2002), ch. 9 and 17.',
      'Bruno Jacobs, "Achaemenid Satrapies", Encyclopaedia Iranica (2006).',
      'Ernst Badian, "Darius III", Encyclopaedia Iranica (1994).',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.II.'],
    routeFiles: {
      // after Herodotus: Lydia and Phrygia, the Halys, Cappadocia, the Euphrates, Armenia, the Tigris, Arbela, Cissia
      'royal-road': route('The Royal Road from Sardis to Susa, after Herodotus: about 2,500 km, ninety days\' march',
        'persia', [SARDIS, [28.9, 38.0], [29.5, 37.9], CELAENAE, [31.5, 38.6], [32.6, 39.0], [33.6, 39.2],
          [34.6, 39.0], [35.5, 38.7], [37.2, 38.6], [38.6, 38.45], [40.2, 38.3], [41.5, 37.6], [42.8, 36.9],
          [44.01, 36.19], [45.2, 35.0], [46.6, 33.6], SUSA], { arrows: false }),
    } },
  { dir: '020-hellespont', title: 'The crossing of the Hellespont', date: 'Spring 334 BC',
    bbox: [23.5, 39.4, 27.6, 41.6],
    zones: ['macedon-334s', 'persia-336', 'thessaly-352', 'league-337', 'thracians-340', 'triballi-335'],
    routes: ['march-sestos-334', 'crossing-parmenion-334', 'crossing-alexander-334', 'troy-arisbe-334'],
    markers: ['amphipolis-334', 'sestos-334', 'hellespont-334', 'abydus-334', 'troy-334'],
    sources: [ARRIAN('book 1, 11 to 12'), 'Diodorus Siculus, Library of History, book 17, 17 (tr. C. B. Welles).',
      'Plutarch, Life of Alexander, 15 (tr. B. Perrin).',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.II, 2.III and C.I.'],
    routeFiles: {
      // south of Pangaeum, Abdera, Maronea, the Hebrus and the Melas to Sestos, then down the Chersonese to Elaeus
      'march-sestos-334': route("Alexander's army marches by Amphipolis to Sestos, twenty days from home, spring 334 BC",
        'macedon', [AMPHIPOLIS, [24.0, 40.8], [24.2, 40.88], [24.45, 41.0], [24.75, 41.02], [24.98, 41.0],
          [25.05, 41.1], [25.4, 41.08], [25.52, 40.92], [25.85, 40.95], [26.12, 40.86], [26.45, 40.75],
          [26.6, 40.72], [26.85, 40.7], [26.88, 40.6], [26.78, 40.53], [26.68, 40.48], [26.58, 40.4],
          [26.46, 40.28], SESTOS, [26.34, 40.17], [26.27, 40.11], ELAEUS]),
      'crossing-parmenion-334': route('Parmenion ferries the cavalry and most of the infantry across in 160 triremes and many cargo ships',
        'macedon', [[26.418, 40.226], [26.413, 40.21], [26.411, 40.196]]),
      'crossing-alexander-334': route('Alexander crosses to the Troad and casts his spear into the shore', 'macedon',
        [[26.205, 40.055], [26.2, 40.03], HARBOUR]),
      'troy-arisbe-334': route('Alexander visits Troy and rejoins the army', 'macedon',
        [HARBOUR, TROY, [26.33, 40.0], [26.4, 40.06], ARISBE]),
    } },
  { dir: '030-granicus/010-granicus', title: 'The march to the Granicus', date: 'May 334 BC',
    bbox: [25.9, 39.6, 28.2, 40.7], zones: ['macedon-334s', 'persia-336'],
    routes: ['march-granicus-334', 'satraps-granicus-334'],
    markers: ['troy-granicus-334', 'hellespontine-phrygia-334', 'zeleia-334'], battle: 'granicus-334',
    sources: [ARRIAN('book 1, 12 to 16'), 'Diodorus Siculus, Library of History, book 17, 18 to 21 (tr. C. B. Welles).',
      'Plutarch, Life of Alexander, 16 (tr. B. Perrin).',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.III.',
      "A. B. Bosworth, A Historical Commentary on Arrian's History of Alexander, vol. I (1980), on 1.13 to 16."],
    routeFiles: {
      // Percote, past Lampsacus, inland south of Parium to the west bank
      'march-granicus-334': route('Alexander marches east along the Hellespont to the Granicus', 'macedon',
        [ARISBE, [26.6, 40.24], [26.69, 40.32], [26.85, 40.33], [27.05, 40.32],
          GRANICUS_W]),
      'satraps-granicus-334': route("The satraps' army moves west to hold the Granicus", 'persia',
        [ZELEIA, [27.45, 40.2], GRANICUS_E]),
    } },
  { dir: '040-miletus', title: 'Sardis, Ephesus and the siege of Miletus', date: 'Summer 334 BC',
    bbox: [26.1, 36.8, 29.1, 40.6], zones: ['macedon-334a', 'persia-334a'],
    routes: ['parmenion-dascylium-334', 'march-miletus-334', 'fleet-lade-334', 'persian-fleet-334'],
    markers: ['dascylium-334', 'sardis-334', 'ephesus-334', 'lade-334'], battle: 'miletus-334',
    sources: [ARRIAN('book 1, 17 to 20'), 'Diodorus Siculus, Library of History, book 17, 21 to 23 (tr. C. B. Welles).',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.IV and B.IV.'],
    routeFiles: {
      'parmenion-dascylium-334': route('Parmenion occupies Dascylium', 'macedon',
        [GRANICUS_E, [27.6, 40.2], [27.85, 40.1], DASCYLIUM]),
      // the Macestus valley, the plains of Balikesir and Kirkagac, Thyateira, the Hermus, Sardis, the Cayster
      'march-miletus-334': route('Alexander marches by Sardis and Ephesus to Miletus', 'macedon',
        [GRANICUS_E, [27.45, 40.05], [27.75, 39.85], [27.88, 39.65], [27.67, 39.1], [27.84, 38.92], [27.95, 38.65],
          SARDIS, [27.97, 38.23], [27.73, 38.09], [27.5, 37.98], EPHESUS, [27.36, 37.8], [27.33, 37.65], MILETUS]),
      // from the Hellespont down the coast, inside Lesbos and Chios, through the strait of Mycale
      'fleet-lade-334': route('The fleet of Nicanor, the fleet commander, 160 ships (Arrian), seizes the anchorage at Lade',
        'macedon', [[26.3, 40.08], [26.15, 39.98], [26.0, 39.75], [26.05, 39.55], [26.4, 39.45], [26.7, 39.25],
          [26.75, 39.0], [26.6, 38.75], [26.3, 38.62], [26.25, 38.45], [26.3, 38.2], [26.6, 38.0], [26.9, 37.85],
          [27.0, 37.7], [27.05, 37.6], [27.17, 37.52], [27.225, 37.515]]),
      'persian-fleet-334': route('The Persian fleet, about 400 ships (Arrian), arrives too late and cannot enter the harbour',
        'persia', [[26.85, 37.3], [27.1, 37.45], [27.12, 37.6], [27.0, 37.69]]),
    } },
  { dir: '050-halicarnassus', title: 'The siege of Halicarnassus', date: 'Autumn 334 BC',
    bbox: [26.9, 36.7, 29.2, 37.65], zones: ['macedon-334', 'persia-334'],
    routes: ['march-halicarnassus-334', 'withdrawal-cos-334'], markers: ['cos-334', 'caria-334'],
    battle: 'halicarnassus-334',
    sources: [ARRIAN('book 1, 20 to 23'), 'Diodorus Siculus, Library of History, book 17, 23 to 27 (tr. C. B. Welles).',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.IV.'],
    routeFiles: {
      // by Iasus and Bargylia to the camp before the Mylasa gate
      'march-halicarnassus-334': route('Alexander marches into Caria and lays siege to Halicarnassus', 'macedon',
        [MILETUS, [27.4, 37.45], [27.55, 37.35], [27.62, 37.28], [27.66, 37.2], [27.57, 37.12], [27.5, 37.08], HALICARNASSUS_CAMP]),
      'withdrawal-cos-334': route("Memnon's men leave the burning city for the citadels and Cos", 'persia',
        [[27.425, 37.028], [27.38, 36.98], [27.31, 36.91]]),
    } },
  { dir: '060-lycia-pamphylia', title: 'The winter march through Lycia and Pamphylia', date: 'Winter 334 – spring 333 BC',
    bbox: [27.0, 35.4, 31.8, 38.8], zones: ['macedon-333', 'persia-333'],
    routes: ['parmenion-phrygia-334', 'march-lycia-334', ['climax-road-333', 'climax-beach-333'], 'march-celaenae-333'],
    markers: ['lycia-333', 'mount-climax-333', 'pamphylia-333', 'pisidia-333', 'celaenae-333'],
    sources: [ARRIAN('book 1, 24 to 29'),
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.V.',
      "A. B. Bosworth, A Historical Commentary on Arrian's History of Alexander, vol. I (1980), on 1.24 to 29."],
    routeFiles: {
      'parmenion-phrygia-334': route('Parmenion takes the allies and the baggage by Sardis into Phrygia', 'macedon',
        [[27.78, 37.32], [27.85, 37.7], [28.0, 38.0], SARDIS, [28.5, 38.55], [29.0, 38.65], PLATEAU]),
      // Telmissus, the Xanthus valley and Milyas to Phaselis
      'march-lycia-334': route('Alexander marches through Lycia', 'macedon',
        [HALICARNASSUS_CAMP, [27.78, 37.25], [28.2, 37.15], [28.6, 36.95], [28.9, 36.75], [29.12, 36.63],
          [29.35, 36.45], [29.5, 36.6], [29.9, 36.75], [30.3, 36.7], PHASELIS]),
      'climax-road-333': route('The army crosses Mount Climax by a road the Thracians cut', 'macedon',
        [PHASELIS, [30.45, 36.7], [30.55, 36.85], PERGE]),
      'climax-beach-333': route("Alexander's column takes the beach when the north wind holds back the sea", 'macedon',
        [PHASELIS, [30.555, 36.6], [30.56, 36.75], [30.65, 36.86], [30.75, 36.9], PERGE]),
      // Aspendus and Side and back, past Termessus and Sagalassus and Lake Ascania to Celaenae
      'march-celaenae-333': route('Alexander crosses Pisidia to Celaenae, leaving no garrison', 'macedon',
        [PERGE, [31.17, 36.94], [31.39, 36.77], [31.2, 36.98], [30.9, 37.0], [30.47, 36.98], [30.52, 37.68],
          [30.33, 37.8], CELAENAE]),
    } },
  { dir: '070-gordium', title: "Gordium, and Memnon's war at sea", date: 'Spring to summer 333 BC',
    bbox: [25.6, 35.9, 32.6, 40.6], zones: ['macedon-333', 'persia-333'],
    routes: ['parmenion-gordium-333', 'march-gordium-333', 'memnon-fleet-333'],
    markers: ['celaenae-gordium-333', 'gordium-333', 'cos-333', 'chios-333', 'lesbos-333', 'mytilene-333'],
    sources: [ARRIAN('book 1, 29, and book 2, 1 to 3'), 'Diodorus Siculus, Library of History, book 17, 29 (tr. C. B. Welles).',
      'Plutarch, Life of Alexander, 18 (tr. B. Perrin).',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.V.'],
    routeFiles: {
      'parmenion-gordium-333': route('Parmenion joins the king at Gordium', 'macedon',
        [PLATEAU, [30.2, 39.1], [31.0, 39.4], GORDIUM]),
      'march-gordium-333': route('Alexander marches from Celaenae to Gordium', 'macedon',
        [CELAENAE, [30.6, 38.6], [31.2, 39.0], [31.7, 39.4], GORDIUM]),
      // from Cos through the strait of Mycale to Chios, round the west coast of Lesbos to Mytilene
      'memnon-fleet-333': route("Memnon's fleet takes Chios and Lesbos and blockades Mytilene", 'persia',
        [[27.31, 36.91], [27.2, 37.1], [27.1, 37.45], [27.05, 37.6], [27.0, 37.7], [26.9, 37.85], [26.6, 38.1],
          [26.22, 38.36], [26.25, 38.6], [26.1, 38.75], [25.85, 39.05], [25.8, 39.25], [26.05, 39.45],
          [26.3, 39.47], [26.65, 39.25], [26.6, 39.1]]),
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
