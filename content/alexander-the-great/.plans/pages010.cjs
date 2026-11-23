// Writes the page files and routes of section 010. Run from the repo root.
const fs = require('fs');
const path = require('path');
const SEC = 'content/alexander-the-great/pages/010-macedon-rising';
fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "Macedon rising, 360–336 BC"\n');

const { fix } = require('./router.cjs');
const q = s => JSON.stringify(s);
const ELLIS14 = 'J. R. Ellis, "Macedon and North-West Greece", The Cambridge Ancient History VI (2nd ed., 1994), ch. 14.';
const ELLIS15 = 'J. R. Ellis, "Macedonian Hegemony Created", The Cambridge Ancient History VI (2nd ed., 1994), ch. 15.';
const BOS1 = 'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 1.';

const route = (name, color, coords) => ({ type: 'Feature', properties: { name, style: 'solid', arrows: true, color },
  geometry: { type: 'LineString', coordinates: coords } });

const PELLA = [22.5225, 40.7557];
const PHILIPPI = [24.2864, 41.0131];
const PHILIPPOPOLIS = [24.749, 42.147];
const PERINTHUS = [27.956, 40.975];
// Pella to Amphipolis: by Therme and north of Lakes Koroneia and Bolbe.
const PELLA_AMPHIPOLIS = [PELLA, [22.75, 40.7], [22.98, 40.7], [23.2, 40.74], [23.45, 40.74], [23.65, 40.76],
  [23.845, 40.822]];

const pages = [
  { dir: '010-philip-takes-the-throne', title: 'Philip takes a kingdom in danger', date: '360–358 BC',
    bbox: [19.5, 39.6, 25.2, 42.4], zones: ['macedon-359', 'illyrians-359', 'thracians-359'], routes: [],
    markers: ['pella-359', 'lychnitis-358'],
    sources: [ELLIS14, BOS1, 'Diodorus Siculus, Library of History, 16.1–8, tr. C. L. Sherman (1952).'] },
  { dir: '020-amphipolis-and-philippi', title: 'Amphipolis, Philippi and the gold of Pangaeum', date: '357–356 BC',
    bbox: [19.5, 39.6, 25.4, 42.4], zones: ['macedon-356', 'olynthus-356', 'illyrians-359', 'thracians-359'],
    routes: [], markers: ['pella-359', 'amphipolis-357', 'philippi-356', 'pangaeum-356', 'olynthus-356'],
    sources: ['Diodorus Siculus, Library of History, 16.8, tr. C. L. Sherman (1952).', ELLIS14,
      'Plutarch, Life of Alexander, 2–3, tr. B. Perrin (1919).'] },
  { dir: '030-thessaly-and-olynthus', title: 'Thessaly and Olynthus', date: '352–348 BC',
    bbox: [19.5, 38.4, 25.4, 42.4],
    zones: ['macedon-348', 'thessaly-352', 'epirus-350', 'illyrians-359', 'thracians-359'], routes: [],
    markers: ['pella-359', 'crocus-field-352', 'olynthus-348', 'philippi-348'],
    sources: ['Diodorus Siculus, Library of History, 16.35 and 16.52–53, tr. C. L. Sherman (1952).', ELLIS14, BOS1] },
  { dir: '040-thrace-and-the-young-alexander', title: 'Thrace, and the young Alexander', date: '342–339 BC',
    bbox: [20.5, 39.4, 29.6, 43.6],
    zones: ['macedon-340', 'thessaly-352', 'epirus-350', 'illyrians-359', 'thracians-340', 'persia-336'],
    routes: ['philip-thrace-342', 'philip-perinthus-340', ['philip-byzantium-340', 'alexander-maedi-340']],
    markers: ['mieza-342', 'pella-359', 'philippopolis-342', 'perinthus-340', 'byzantium-340', 'maedi-340'],
    sources: [ELLIS15, 'Diodorus Siculus, Library of History, 16.74–77, tr. C. Bradford Welles (1963).',
      'Plutarch, Life of Alexander, 6–9, tr. B. Perrin (1919).', BOS1],
    routeFiles: {
      'philip-thrace-342': route("Philip's Thracian campaign, 342–341 BC", 'macedon',
        [...PELLA_AMPHIPOLIS, [24.05, 40.97], PHILIPPI, [24.5, 41.3], [24.65, 41.65], [24.72, 41.95], PHILIPPOPOLIS]),
      'philip-perinthus-340': route('To Perinthus, spring 340 BC', 'macedon',
        [PHILIPPOPOLIS, [25.3, 42.05], [25.95, 41.9], [26.55, 41.68], [27.2, 41.3], [27.65, 41.08], PERINTHUS]),
      'philip-byzantium-340': route('To Byzantium, autumn 340 BC', 'macedon',
        [PERINTHUS, [27.95, 41.0], [27.98, 41.03], [28.1, 41.08], [28.247, 41.074], [28.45, 41.12], [28.7, 41.08], [28.9, 41.04], [28.977, 41.011]]),
      'alexander-maedi-340': route('Alexander against the Maedi, 340 BC', 'macedon',
        [PELLA, [22.6, 41.0], [22.48, 41.2], [22.3, 41.38], [22.7, 41.55], [22.95, 41.72], [23.12, 41.83]]),
    } },
  { dir: '050-chaeronea', title: 'Chaeronea', date: '339–338 BC', bbox: [21.0, 37.7, 24.0, 40.9],
    zones: ['macedon-340', 'thessaly-352', 'epirus-350', 'illyrians-359', 'athens-338', 'thebes-338', 'greeks-338'],
    routes: ['philip-elatea-339', 'philip-chaeronea-338', 'allies-chaeronea-338'],
    markers: ['thermopylae-339', 'elatea-339', 'amphissa-338', 'thebes-city-338', 'athens-city-338'], battle: 'chaeronea-338',
    sources: ['Diodorus Siculus, Library of History, 16.84–88, tr. C. Bradford Welles (1963).', ELLIS15,
      'Plutarch, Life of Alexander, 9, tr. B. Perrin (1919).', BOS1],
    routeFiles: {
      // by Tempe, Larissa and Pharsalus, over Othrys to Heraclea in Trachis, past Thermopylae to Cytinium
      'philip-elatea-339': route('Philip marches south, autumn 339 BC', 'macedon',
        [PELLA, [22.55, 40.45], [22.5, 40.2], [22.58, 39.89], [22.42, 39.64], [22.38, 39.3], [22.4, 39.05],
          [22.42, 38.9], [22.43, 38.79], [22.38, 38.66], [22.55, 38.62], [22.79, 38.64]]),
      'philip-chaeronea-338': route('To Chaeronea, August 338 BC', 'macedon',
        [[22.79, 38.64], [22.82, 38.57], [22.8475, 38.495]]),
      'allies-chaeronea-338': route('The Athenians march to Chaeronea', 'athens',
        [[23.7265, 37.9715], [23.65, 38.03], [23.6, 38.06], [23.54, 38.055], [23.42, 38.15], [23.319, 38.321], [23.1, 38.37],
          [22.87, 38.43], [22.8475, 38.495]]),
    } },
  { dir: '060-hegemon-and-aegae', title: 'Hegemon of Greece, and death at Aegae', date: '338–336 BC',
    bbox: [19.5, 36.0, 28.6, 43.2],
    zones: ['macedon-340', 'thessaly-352', 'epirus-350', 'illyrians-359', 'thracians-340', 'league-337',
      'sparta-337', 'persia-336'],
    routes: ['advance-force-336'], markers: ['corinth-337', 'abydus-336', 'aegae-336'],
    sources: ['Diodorus Siculus, Library of History, 16.89–95, tr. C. Bradford Welles (1963).', ELLIS15,
      'Justin, Epitome of Pompeius Trogus, 9.5–7, tr. J. S. Watson (1853).',
      'Arrian, Anabasis of Alexander, 1.1, tr. E. J. Chinnock (1884).'],
    routeFiles: {
      // along the Thracian coast to the Chersonese, over the narrows by Sestus to Abydus, a short way south
      'advance-force-336': route('The advance force crosses into Asia, spring 336 BC', 'macedon',
        [...PELLA_AMPHIPOLIS, [24.1, 40.95], [24.45, 41.0], [24.75, 41.02], [25.05, 41.1], [25.4, 41.08],
          [25.85, 40.95], [26.12, 40.86], [26.45, 40.75], [26.6, 40.72], [26.85, 40.7], [26.88, 40.6],
          [26.78, 40.53], [26.68, 40.48], [26.58, 40.4], [26.46, 40.28], [26.42, 40.235], [26.41, 40.188],
          [26.425, 40.15], [26.41, 40.09], [26.37, 40.04], [26.28, 39.93]]),
    } },
];

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  let y = `date: ${q(p.date)}\n` +
    `title: ${q(p.title)}\n` +
    `bbox: [${p.bbox.join(', ')}]\n` +
    `zones: ${list(p.zones)}\n` +
    `routes: ${list(p.routes)}\n` +
    `markers: ${list(p.markers)}\n`;
  if (p.battle) y += `battle: ${p.battle}\n`;
  // The reviewers edit the sources in page.yaml: a rerun keeps the lines already there.
  const old = fs.existsSync(path.join(dir, 'page.yaml')) ? fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + p.sources.map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(path.join(dir, 'page.yaml'), y);
  if (p.routeFiles) {
    fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
    for (const [id, f] of Object.entries(p.routeFiles))
      { f.geometry.coordinates = (id === 'advance-force-336' ? f.geometry.coordinates : fix('land', f.geometry.coordinates)); fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n'); }
  }
}
