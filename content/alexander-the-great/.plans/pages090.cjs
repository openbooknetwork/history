// Writes the page files and routes of section 090 (cards only, no phase pages). Run from the repo root:
//   node content/alexander-the-great/.plans/pages090.cjs
// NO_BATTLE=1 writes each `battle:` line commented out, for captures taken before the cards exist.
// A page.yaml that exists keeps its `sources` (the reviewers edit them); everything else comes from here.
// A route is one or more parts, each kept on its own surface by the router (see pages080.cjs). A part that starts on
// another point than the last one ended keeps both, so a strait crossing is the jump between two land parts.
const fs = require('fs');
const path = require('path');
const { fix } = require('./router.cjs');
const SEC = 'content/alexander-the-great/pages/090-legacy';
fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), 'title: "323–301 BC: Legacy"\n');

const q = s => JSON.stringify(s);
const route = (name, color, parts, extra = {}) => ({ properties: { name, style: 'solid', arrows: true, color, ...extra }, parts });

const PELLA = [22.5225, 40.7557], LAMIA = [22.43, 38.9], THERMOPYLAE = [22.54, 38.8], ATHENS = [23.727, 37.97];
const PELUSIUM = [32.55, 31.04], MEMPHIS_EAST = [31.3, 29.86], BABYLON = [44.421, 32.536], SUSA = [48.26, 32.19];
const PERSEPOLIS = [52.89, 29.93], ECBATANA = [48.52, 34.8], GAZA = [34.45, 31.5], CARRHAE = [39.03, 36.87];
const ANTIGONIA = [36.25, 36.25], SALAMIS = [33.93, 35.18], IPSUS = [31.0, 38.75];
// Paraetacene and Gabiene are districts whose sites are not known: drawn between Persis and Media as Diodorus's
// marches lead (three days from Paraetacene to Gabiene, 19.34.7).
const PARAETACENE = [51.6, 32.4], GABIENE = [51.4, 33.2], GAMARGA = [50.2, 34.2];
// 050's road from Susa by the Uxian lowlands to the Persian Gate and Persepolis (pages050.cjs)
const SUSA_PERSEPOLIS = [SUSA, [48.8, 31.95], [49.3, 31.75], [49.9, 31.8], [50.3, 31.3], [50.8, 30.7], [51.3, 30.25],
  [51.6, 30.3], [51.75, 30.42], [52.05, 30.3], [52.4, 30.1], PERSEPOLIS];
const TIGRIS_SUSA = [[44.55, 33.0], [45.1, 32.6], [46.5, 32.4], [47.6, 32.3], SUSA];
const EUPHRATES_DOWN = [[39.0, 35.95], [39.6, 35.75], [40.14, 35.33], [40.6, 34.85], [40.92, 34.45], [41.45, 34.42],
  [41.98, 34.47], [42.37, 34.13], [42.82, 33.64], [43.3, 33.42], [43.78, 33.35], [44.1, 33.0], [44.23, 32.78], BABYLON];

const DIOD = (b, tr) => `Diodorus Siculus, Library of History, ${b}, tr. ${tr}.`;
const HW = c => `N. G. L. Hammond and F. W. Walbank, A History of Macedonia, vol. III: 336–167 B.C. (1988), ${c}.`;
const BOSL = c => `A. B. Bosworth, The Legacy of Alexander: Politics, Warfare and Propaganda under the Successors (2002), ${c}.`;

const pages = [
  { dir: '010-babylon-settlement', title: 'Two kings and a regent', date: 'June 323 BC',
    bbox: [18, 23.5, 77, 46],
    zones: ['macedon-323', 'ptolemaic-323', 'antigonus-323', 'eumenes-323', 'lysimachus-323', 'taxila-327', 'porus-326b',
      'thessaly-352', 'league-337', 'sparta-337'],
    routes: [],
    markers: ['babylon-323b', 'hellespontine-phrygia-323', 'cilicia-323', 'syria-323', 'media-323'],
    sources: [DIOD('book 18, 1–3', 'R. M. Geer (Loeb, 1947)'),
      'Justin, Epitome of the Philippic History of Pompeius Trogus, book 13, 2–4, tr. J. S. Watson (1853).',
      BOSL('ch. 2'), HW('ch. V')],
    routeFiles: {} },
  { dir: '020-lamian-war', title: 'The Lamian War', date: '323–322 BC',
    bbox: [20.8, 37.7, 24.3, 40.9], zones: ['greeks-323', 'macedon-322', 'lysimachus-323', 'sparta-337'],
    routes: ['antipater-323', 'leosthenes-323', 'antipater-322'],
    markers: ['lamia-323', 'thermopylae-323', 'athens-322'],
    battle: 'crannon-322',
    sources: [DIOD('book 18, 8–18', 'R. M. Geer (Loeb, 1947)'), 'Plutarch, Life of Phocion, 23–28, tr. B. Perrin (Loeb, 1919).',
      HW('ch. V, 3')],
    routeFiles: {
      // the coast road by Pieria and Tempe, Larisa and Pharsalus (Diodorus 18.12.2-4); as antipater-330 of 050
      'antipater-323': route('Antipater marches south', 'macedon', [['land', [PELLA, [22.5, 40.1], [22.67, 39.92],
        [22.62, 39.8], [22.42, 39.64], [22.38, 39.3], [22.4, 39.05], LAMIA]]]),
      // by Eleusis and Plataea to Thermopylae and Lamia (Diodorus 18.11.5, 18.13.1)
      'leosthenes-323': route('Leosthenes marches north', 'greeks', [['land', [ATHENS, [23.55, 38.05], [23.4, 38.15],
        [23.27, 38.22], [23.0, 38.45], [22.75, 38.65], THERMOPYLAE, [22.47, 38.86]]]], { offset: 5 }),
      // through the hills to the camp beside the Peneius (Diodorus 18.15.5-6, 18.16.4-5)
      'antipater-322': route('Antipater and Craterus join at the Peneius', 'macedon', [['land', [LAMIA, [22.3, 39.1],
        [22.18, 39.3], [22.2, 39.5], [22.35, 39.62]]]]),
    } },
  { dir: '030-triparadisus', title: 'Perdiccas in Egypt and the settlement of Triparadisus', date: '321–320 BC',
    bbox: [20, 26, 50, 43],
    zones: ['macedon-320', 'ptolemaic-322', 'antigonus-323', 'eumenes-323', 'seleucid-320', 'lysimachus-323', 'thessaly-352'],
    routes: ['perdiccas-320'],
    markers: ['pelusium-320', 'memphis-320'],
    sources: [DIOD('book 18, 25–39', 'R. M. Geer (Loeb, 1947)'),
      'Justin, Epitome of the Philippic History of Pompeius Trogus, book 13, 6–8, tr. J. S. Watson (1853).',
      'Plutarch, Life of Eumenes, 5–8, tr. B. Perrin (Loeb, 1919).', HW('chs. V, 4 and VI')],
    routeFiles: {
      // from Pelusium up the eastern Delta to the river opposite Memphis (Diodorus 18.33.1, 18.33.6, 18.34.6)
      'perdiccas-320': route('Perdiccas marches on Egypt', 'macedon', [['land', [PELUSIUM, [32.2, 30.85], [31.75, 30.55],
        [31.4, 30.2], [31.32, 29.95], MEMPHIS_EAST]]]),
    } },
  { dir: '040-gabiene', title: 'Eumenes and Antigonus: the war for Asia', date: '317–315 BC',
    bbox: [21, 25, 54, 43], zones: ['antigonus-316', 'ptolemaic-319', 'macedon-316', 'lysimachus-323'],
    routes: ['eumenes-317', 'antigonus-317', 'antigonus-317b', 'seleucus-315'],
    markers: ['persepolis-316', 'babylon-315'],
    battle: 'gabiene-316',
    sources: [DIOD('book 19, 12–48', 'R. M. Geer (Loeb, 1947)'), 'Plutarch, Life of Eumenes, 13–19, tr. B. Perrin (Loeb, 1919).',
      BOSL('ch. 4'), HW('ch. VI')],
    routeFiles: {
      // the Tigris, Susa, the Pasitigris, Persepolis, Paraetacene, Gabiene (Diodorus 19.12-21, 19.26, 19.34)
      'eumenes-317': route('Eumenes marches east', 'eumenes', [['land', [...TIGRIS_SUSA, ...SUSA_PERSEPOLIS.slice(1),
        [52.6, 30.5], [52.2, 31.4], [51.8, 32.0], PARAETACENE, GABIENE]]]),
      // Mesopotamia, Susa, the road to Ecbatana, Paraetacene (Diodorus 19.17-20, 19.26)
      'antigonus-317': route('Antigonus follows', 'antigonus', [['land', [[44.3, 33.4], ...TIGRIS_SUSA.slice(1),
        [48.3, 32.9], [48.4, 33.6], [48.5, 34.3], ECBATANA, [49.6, 34.1], [50.5, 33.4], [51.1, 32.7], PARAETACENE]]],
        { offset: 5 }),
      // back to winter at Gamarga in Media, site unknown, then across the desert to Gabiene (Diodorus 19.32.2,
      // 19.34.8, 19.37); a reconstruction
      'antigonus-317b': route('Antigonus winters in Media and crosses the desert to Gabiene', 'antigonus', [['land',
        [PARAETACENE, [51.0, 33.0], [50.3, 33.7], GAMARGA, [50.9, 34.0], [51.3, 33.6], GABIENE]]]),
      // up the Euphrates, across the desert by Palmyra and Damascus, down the coast to Egypt (090.9; the path a
      // reconstruction)
      'seleucus-315': route('Seleucus flees to Ptolemy', 'seleucid', [['land', [...EUPHRATES_DOWN.slice(6).reverse(),
        [38.27, 34.55], [36.3, 33.5], [35.6, 32.3], [34.8, 31.6], GAZA, [33.8, 31.15], [33.2, 31.1], PELUSIUM]]]),
    } },
  { dir: '050-the-kings', title: 'The Successors take the title of king', date: '312–305 BC',
    bbox: [21, 24, 72, 44],
    zones: ['antigonus-306', 'seleucid-306', 'ptolemaic-322', 'macedon-316', 'lysimachus-323'],
    routes: ['ptolemy-312', 'seleucus-312', 'demetrius-306'],
    markers: ['gaza-312', 'babylon-312', 'antigonia-306', 'salamis-306'],
    sources: [DIOD('book 19, 80–105, and book 20, 45–53', 'R. M. Geer (Loeb, 1954)'),
      'Plutarch, Life of Demetrius, 5–7 and 15–18, tr. B. Perrin (Loeb, 1920).', HW('ch. VII'), BOSL('chs. 4 and 6')],
    routeFiles: {
      'ptolemy-312': route('Ptolemy marches on Gaza', 'ptolemaic', [['land', [PELUSIUM, [33.2, 31.1], [33.8, 31.15],
        [34.3, 31.35], GAZA]]]),
      // Gaza, Damascus, the Orontes valley, Carrhae, down the Balikh and the Euphrates to Babylon (Diodorus 19.90.1,
      // 19.91.1); the path a reconstruction
      'seleucus-312': route('Seleucus returns to Babylon', 'seleucid', [['land', [GAZA, [35.0, 32.5], [36.3, 33.5],
        [36.75, 34.75], [37.16, 36.2], [38.0, 36.6], CARRHAE, [39.05, 36.3], ...EUPHRATES_DOWN]]]),
      // from Athens along the coasts to Cilicia, over to the Carpasia coast of Cyprus, and round to Salamis
      // (Diodorus 20.46.5, 20.47.1-2); the sea path a reconstruction
      'demetrius-306': route('Demetrius sails for Cyprus', 'antigonus', [['sea', [[23.62, 37.9], [24.2, 37.55],
        [25.2, 37.15], [26.4, 36.75], [27.6, 36.55], [28.6, 36.45], [29.6, 36.1], [30.6, 36.05], [32.0, 36.05],
        [33.3, 36.05], [34.2, 36.4], [34.7, 36.1], [34.5, 35.75], [34.65, 35.6], [34.3, 35.35], [34.0, 35.2]]]]),
    } },
  { dir: '060-ipsus', title: 'Ipsus and the partition', date: '302–301 BC',
    bbox: [19.5, 29, 49, 43], zones: ['lysimachus-301', 'seleucid-301', 'ptolemaic-301', 'macedon-316'],
    routes: ['lysimachus-302', 'antigonus-302', 'seleucus-302', 'demetrius-302'],
    markers: ['tyre-301', 'sidon-301'],
    battle: 'ipsus-301',
    sources: ['Plutarch, Life of Demetrius, 28–30, tr. B. Perrin (Loeb, 1920).',
      DIOD('book 21, 1 and 5', 'F. R. Walton (Loeb, 1957)'), HW('chs. VII and IX'),
      'W. W. Tarn, "The New Hellenistic Kingdoms", in The Cambridge Ancient History, vol. VII (1928), ch. III, 1.',
      BOSL('ch. 7')],
    routeFiles: {
      // from Thrace over the Hellespont near Lampsacus to Phrygia (090.32); the path a reconstruction
      'lysimachus-302': route('Lysimachus crosses into Asia', 'lysimachus', [['land', [[26.75, 40.9], [26.75, 40.6],
        [26.62, 40.4]]], ['land', [[26.7, 40.33], [27.3, 40.0], [28.5, 39.6], [29.5, 39.2], [30.4, 38.9], IPSUS]]]),
      // from Antigonia by the Amanus, Cilicia and the Cilician Gates to Phrygia (090.32)
      'antigonus-302': route('Antigonus comes up from Syria', 'antigonus', [['land', [ANTIGONIA, [36.17, 36.6],
        [36.2, 36.85], [35.3, 36.95], [34.9, 36.92], [34.77, 37.3], [34.5, 37.6], [33.4, 37.9], [32.5, 38.4], [31.6, 38.6],
        IPSUS]]]),
      // Media stands for "the upper satrapies"; by Assyria and Melitene into Cappadocia (090.32)
      'seleucus-302': route('Seleucus comes from the upper satrapies', 'seleucid', [['land', [ECBATANA, [47.0, 34.3],
        [45.5, 35.3], [44.0, 36.2], [42.0, 37.0], [40.2, 37.9], [38.3, 38.4], [36.5, 38.7], [35.5, 38.7], [33.6, 38.8],
        [32.3, 38.8], IPSUS]]], { offset: -5 }),
      // from Thessaly by sea to Ephesus, then inland to Ipsus (090.32)
      'demetrius-302': route('Demetrius brings his army from Greece', 'antigonus', [
        ['sea', [[22.97, 39.3], [23.0, 39.18], [23.5, 39.1], [24.0, 39.0], [25.0, 38.7], [26.3, 38.0], [26.65, 38.1], [27.0, 37.85],
          [27.15, 37.95]]],
        ['land', [[27.35, 37.94], [28.0, 38.0], [29.1, 38.3], [30.2, 38.6], IPSUS]]], { offset: 5 }),
    } },
  { dir: '070-alexandrias', title: 'The Alexandrias, the koine and the legend', date: 'After 301 BC',
    bbox: [18, 23.5, 77, 46], zones: ['lysimachus-301', 'seleucid-301', 'ptolemaic-301', 'macedon-316'],
    routes: [],
    markers: ['alexandria-301', 'alexandria-areia-301', 'alexandria-arachosia-301', 'alexandria-caucasus-301',
      'alexandria-eschate-301', 'alexandria-troas-301'],
    sources: ['A. B. Bosworth, Conquest and Empire: The Reign of Alexander the Great (1988), part II, B, III.',
      'W. S. Ferguson, "The Leading Ideas of the New Period", in The Cambridge Ancient History, vol. VII (1928), ch. I, 5.',
      'Wikipedia, "Alexander Romance".'],
    routeFiles: {} },
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
  if (!Object.keys(p.routeFiles).length) continue;
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
