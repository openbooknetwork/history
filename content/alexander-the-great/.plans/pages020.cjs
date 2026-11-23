// Writes the page files and routes of section 020. Run from the repo root.
const fs = require('fs');
const path = require('path');
const SEC = 'content/alexander-the-great/pages/020-greece-secured';
fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "Greece secured"\n');

const { fix } = require('./router.cjs');
const q = s => JSON.stringify(s);
const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra }, geometry: { type: 'LineString', coordinates: coords } });

const AEGAE = [22.3248, 40.4793], CORINTH = [22.878, 37.906], THEBES = [23.3178, 38.3208];
const AMPHIPOLIS = [23.845, 40.822], PELIUM = [20.95, 40.66], AGRIANIANS = [22.9, 42.35];
const TAULANTIANS = [19.85, 41.3];

const pages = [
  { dir: '010-league-renewed', title: 'Rivals removed, the League renewed', date: '336–335 BC',
    bbox: [19.5, 36.3, 28.5, 42.6],
    zones: ['macedon-340', 'thessaly-352', 'league-337', 'sparta-337', 'epirus-350', 'illyrians-359', 'thracians-340',
      'triballi-335', 'getae-335', 'persia-336'],
    routes: ['alexander-336-greece'], markers: ['aegae-336b', 'thermopylae-336', 'corinth-336', 'sparta-336'],
    sources: ['Arrian, Anabasis of Alexander, book 1, 1.', 'Diodorus Siculus, Library of History, book 17, 2 to 5.',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2 and part II, A.I.',
      'N. G. L. Hammond and F. W. Walbank, A History of Macedonia III (1988), part one, ch. I.'],
    routeFiles: {
      // by Dium and Tempe below Ossa, Larissa and Pharsalus to Thermopylae, through Phocis and Boeotia past
      // Thebes, over Cithaeron to Megara and along the shore to the Isthmus
      'alexander-336-greece': route('Alexander in Greece, winter 336–335 BC', 'macedon',
        [AEGAE, [22.45, 40.3], [22.5, 40.1], [22.67, 39.92], [22.62, 39.8], [22.42, 39.64], [22.38, 39.3], [22.4, 39.05],
          [22.43, 38.9], [22.5, 38.81], [22.54, 38.8], [22.65, 38.72], [22.8, 38.62], [22.86, 38.5], [23.1, 38.4],
          THEBES, [23.33, 38.17], [23.35, 38.02], [23.2, 37.98], [23.0, 37.93], CORINTH]),
    } },
  { dir: '020-the-danube', title: 'To the Danube', date: 'Spring 335 BC', bbox: [21.5, 40.4, 29.5, 45.3],
    zones: ['macedon-335', 'thracians-340', 'triballi-335', 'getae-335', 'illyrians-359', 'persia-336', 'thessaly-352',
      'epirus-350', 'league-337'],
    routes: ['alexander-335-danube', 'fleet-335-danube'],
    markers: ['amphipolis-335', 'haemus-335', 'lyginus-335', 'danube-335', 'getic-town-335', 'byzantium-335'],
    sources: ['Arrian, Anabasis of Alexander, book 1, 1 to 4.',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.',
      "A. B. Bosworth, A Historical Commentary on Arrian's History of Alexander I (1980), on book 1, 1 to 4.",
      'N. G. L. Hammond and F. W. Walbank, A History of Macedonia III (1988), part one, ch. II.'],
    routeFiles: {
      // Philippi on the right, over the Nessus, through Rhodope to the plain of Philippopolis, the Trojan pass,
      // past the Lyginus near Pleven to the Danube by the mouth of the Oescus (Bosworth)
      'alexander-335-danube': route('Alexander marches to the Danube, spring 335 BC', 'macedon',
        [AMPHIPOLIS, [24.0, 40.85], [24.25, 40.95], [24.5, 40.96], [24.75, 40.95], [24.88, 41.14], [24.78, 41.35],
          [24.7, 41.58], [24.87, 42.02], [24.75, 42.15], [24.66, 42.4], [24.62, 42.78], [24.63, 43.1], [24.62, 43.42],
          [24.52, 43.62], [24.47, 43.77]]),
      // out of the Bosporus and up the coast to the southern mouth of the Danube
      'fleet-335-danube': route('The warships from Byzantium, spring 335 BC', 'macedon',
        [[29.0, 41.03], [29.033, 41.05], [29.058, 41.08], [29.073, 41.12], [29.075, 41.14], [29.06, 41.155],
          [29.09, 41.19], [29.14, 41.24], [29.25, 41.5], [28.8, 42.2], [28.3, 42.75], [28.5, 43.2], [28.9, 43.6],
          [29.1, 44.2], [29.5, 44.7], [29.65, 44.85]]),
    } },
  { dir: '030-pelium', title: 'Pelium', date: 'Summer 335 BC', bbox: [19.3, 39.8, 24.0, 42.8],
    zones: ['macedon-335', 'illyrians-335', 'epirus-350', 'thessaly-352'],
    routes: ['alexander-335-pelium', 'glaucias-335', 'cleitus-335'], markers: ['agrianians-335', 'pelium-335'],
    sources: ['Arrian, Anabasis of Alexander, book 1, 5 to 6.',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.',
      "A. B. Bosworth, A Historical Commentary on Arrian's History of Alexander I (1980), on book 1, 5 to 6.",
      'N. G. L. Hammond and F. W. Walbank, A History of Macedonia III (1988), part one, ch. II.'],
    routeFiles: {
      // by Astibus to the Axius at Stobi, Prilep, along the Erigon to the plain of Florina, by Little Prespa
      'alexander-335-pelium': route('Alexander marches on Pelium, summer 335 BC', 'macedon',
        [AGRIANIANS, [22.6, 42.1], [22.19, 41.74], [21.97, 41.55], [21.55, 41.35], [21.45, 41.05], [21.41, 40.78],
          [21.15, 40.68], PELIUM]),
      'glaucias-335': route('Glaucias comes to Pelium', 'illyrians',
        [TAULANTIANS, [20.08, 41.11], [20.4, 40.95], [20.72, 40.66], PELIUM]),
      'cleitus-335': route('Cleitus withdraws to Glaucias', 'illyrians',
        [PELIUM, [20.72, 40.66], [20.4, 40.95], [20.08, 41.11], TAULANTIANS], { offset: 5 }),
    } },
  { dir: '040-fall-of-thebes', title: 'The fall of Thebes', date: 'September 335 BC', bbox: [20.6, 37.8, 23.9, 41.0],
    zones: ['macedon-335', 'thessaly-352', 'league-335', 'thebes-335', 'epirus-350', 'illyrians-335'],
    routes: ['alexander-335-thebes'],
    markers: ['pelium-335b', 'pelinna-335', 'thermopylae-335', 'orchomenus-335', 'plataea-335'],
    battle: 'thebes-335',
    sources: ['Arrian, Anabasis of Alexander, book 1, 7 to 10.', 'Diodorus Siculus, Library of History, book 17, 8 to 16.',
      'Plutarch, Life of Alexander, 11 to 13.',
      'A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), ch. 2.'],
    routeFiles: {
      // into Eordaea, down the Haliacmon through Elimiotis, Tricca and Pelinna, then by Heraclea, Doris and the
      // Cephisus valley west of Thermopylae to Onchestus and Thebes (Bosworth)
      'alexander-335-thebes': route('Alexander marches on Thebes, 335 BC', 'macedon',
        [PELIUM, [21.3, 40.6], [21.65, 40.45], [21.6, 40.2], [21.65, 39.85], [21.77, 39.56], [21.93, 39.57],
          [22.1, 39.25], [22.33, 38.95], [22.43, 38.79], [22.38, 38.66], [22.6, 38.6], [22.82, 38.53],
          [23.15, 38.37], THEBES]),
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
    f.geometry.coordinates = fix(id === 'fleet-335-danube' ? 'sea' : 'land', f.geometry.coordinates);
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
