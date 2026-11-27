// Writes the page files, routes and markers of section 040, the-loire-and-reims. Run from the repo root:
//   node content/joan-of-arc/.plans/pages040.mjs
// Each page file it writes opens with a comment naming this script: change a page here and run it again, never by
// hand. The plan is content/joan-of-arc/.plan/040-the-loire-and-reims/{pages,map}.yaml. Every route is a
// reconstruction: the sources give the stations and no road, and the comment over each says what the line follows.
import fs from 'node:fs';
import path from 'node:path';

const SEC = 'content/joan-of-arc/pages/040-the-loire-and-reims';
const HEAD = '# Written by content/joan-of-arc/.plans/pages040.mjs. Change it there and run it again.\n';
const q = s => JSON.stringify(s);

// Places, as the plan's markers give them, and the zone generator's points (zones.mjs, T) where it has the place.
const P = {
  selles: [1.553, 47.276], romorantin: [1.744, 47.358], orleans: [1.909, 47.902], jargeau: [2.12, 47.86],
  meung: [1.70, 47.83], beaugency: [1.633, 47.776], janville: [1.88, 48.20], etampes: [2.16, 48.43],
  paris: [2.352, 48.857], patay: [1.70, 48.05], montpipeau: [1.70, 47.89], saintSigismond: [1.67, 47.98],
  corbeil: [2.48, 48.61], gien: [2.63, 47.69], auxerre: [3.57, 47.80], saintFlorentin: [3.73, 48.0],
  troyes: [4.074, 48.297], chalons: [4.37, 48.96], septSaulx: [4.26, 49.15], reims: [4.034, 49.254],
  corbeny: [3.82, 49.46], laon: [3.62, 49.56], vailly: [3.517, 49.408], soissons: [3.32, 49.38],
  chateauThierry: [3.40, 49.05], montmirail: [3.54, 48.87], crecy: [2.91, 48.86], coulommiers: [3.08, 48.81], provins: [3.30, 48.56],
  chartres: [1.489, 48.447], sens: [3.28, 48.20],
  // the hill of 17 June: no source places it; about a league from Meung and from Beaugency, north of their road
  hill: [1.655, 47.815],
};

const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra },
  geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-jargeau', id: 'jargeau',
    title: 'Jargeau', date: '11 to 12 June 1429', when: '1429-06-11',
    bbox: [1.2, 47.1, 2.5, 48.1], battle: 'jargeau-1429',
    zones: ['france-may-1429', 'english-may-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-jargeau'],
    routeFiles: {
      // from the Cher by Romorantin north across the Sologne to Orléans, then up the north bank of the Loire to
      // Jargeau; the places are Laval's, the town's accounts' and the Journal's, the roads no source's
      'france-1429-jargeau': route("The Duke of Alençon's army marches from Selles by Orléans to Jargeau, June 1429", 'france',
        [P.selles, P.romorantin, [1.80, 47.55], [1.87, 47.75], P.orleans, [2.00, 47.892], [2.07, 47.878], P.jargeau]),
    },
    markers: {
      'selles-rendezvous': { lnglat: P.selles, icon: 'flag', color: 'france', label: 'Selles',
        note: 'Guy de Laval sees Joan ride out in white armour, 6 June 1429' },
      'orleans-june-1429': { lnglat: P.orleans, icon: 'shield', color: 'france', label: 'Orléans',
        note: 'Joan comes back, 9 June 1429; the army marches on 11 June' },
      'jargeau-stormed': { lnglat: P.jargeau, icon: 'castle', color: 'france', label: 'Jargeau',
        image: 'jargeau-saint-etienne-da8622',
        note: 'Stormed on 12 June 1429; Suffolk is taken' },
    } },
  { dir: '020-meung-and-beaugency', id: 'meung-and-beaugency',
    title: 'The bridge at Meung and Beaugency', date: '15 to 17 June 1429', when: '1429-06-15',
    bbox: [1.1, 47.55, 2.7, 48.95],
    zones: ['france-june-1429', 'english-june-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['fastolf-1429-janville', 'talbot-1429-janville', 'france-1429-beaugency', 'english-1429-meung'],
    routeFiles: {
      // Paris south by the Orléans road to Étampes, where the relief left its supplies, and on across the Beauce to
      // Janville; only the towns are the sources'
      'fastolf-1429-janville': route("Sir John Fastolf's relief marches from Paris by Étampes to Janville, June 1429", 'english',
        [P.paris, [2.30, 48.70], [2.22, 48.55], P.etampes, [2.06, 48.35], [1.97, 48.27], P.janville]),
      // only the two ends are given: straight across the Beauce
      'talbot-1429-janville': route('John Talbot rides from Beaugency to Janville, June 1429', 'english',
        [P.beaugency, P.janville], { offset: 4 }),
      // the three towns lie on the north bank, so the line follows the river down from Orléans
      'france-1429-beaugency': route("The French army takes Meung's bridge and comes before Beaugency, 15–16 June 1429", 'france',
        [P.orleans, [1.85, 47.888], [1.78, 47.858], P.meung, [1.665, 47.80], P.beaugency]),
      // from Janville down the Beauce, east of Talbot's line so the two stand apart, to the unplaced hill about a league
      // from each town, and back east to Meung
      'english-1429-meung': route('The English march towards Beaugency and turn back to Meung, 17 June 1429', 'english',
        [P.janville, [1.84, 48.03], [1.76, 47.885], [1.70, 47.845], P.hill, P.meung]),
    },
    markers: {
      'meung-bridge-1429': { lnglat: P.meung, icon: 'shield', color: 'france', label: 'Meung', rank: 1,
        image: 'meung-castle-3600e2',
        note: 'The French take its bridge, 15 June 1429' },
      'beaugency-1429': { lnglat: P.beaugency, icon: 'castle', color: 'france', label: 'Beaugency', rank: 2,
        image: 'beaugency-keep-e81cd6',
        note: 'Entered on 16 June 1429; its castle yields on 17–18 June' },
      'janville-1429': { lnglat: P.janville, icon: 'flag', color: 'english', label: 'Janville',
        note: "Sir John Fastolf's relief halts here; John Talbot joins it" },
      'orleans-15-june-1429': { lnglat: P.orleans, icon: 'shield', color: 'france', label: 'Orléans',
        note: 'The French army marches out, 15 June 1429' },
      'paris-fastolf-1429': { lnglat: P.paris, icon: 'flag', color: 'english', label: 'Paris',
        note: "Sir John Fastolf's relief sets out, early June 1429" },
    } },
  { dir: '030-patay', id: 'patay',
    title: 'Patay', date: '18 June 1429', when: '1429-06-18',
    bbox: [1.2, 47.7, 2.7, 48.75], battle: 'patay-1429',
    zones: ['france-1428', 'english-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['english-1429-patay', 'france-1429-patay', 'fastolf-1429-flight', 'france-1429-orleans'],
    routeFiles: {
      // north from Meung towards Janville, stopping at the field where the card stands
      'english-1429-patay': route('The English leave Meung for Janville and are caught near Patay, 18 June 1429', 'english',
        [P.meung, [1.71, 47.95], P.patay]),
      // north from Beaugency after them, west of the English line so the two stand apart
      'france-1429-patay': route('The French ride from Beaugency after the English, 18 June 1429', 'france',
        [P.beaugency, [1.64, 47.92], [1.67, 48.01], P.patay]),
      // north-east past Janville, which shut its gates on the fugitives, to Étampes and on to Corbeil
      'fastolf-1429-flight': route('Sir John Fastolf flees from Patay by Étampes to Corbeil, 18 June 1429', 'english',
        [P.patay, [1.98, 48.28], P.etampes, [2.32, 48.53], P.corbeil]),
      // only the two ends are given: straight back to the city
      'france-1429-orleans': route('Joan and the Duke of Alençon go back to Orléans with their prisoners, 19 June 1429', 'france',
        [P.patay, [1.80, 47.98], P.orleans]),
    },
    markers: {
      'janville-shut': { lnglat: P.janville, icon: 'castle', color: 'france', label: 'Janville',
        note: 'Shuts its gates on English fugitives, 18 June 1429' },
      'meung-18-june-1429': { lnglat: P.meung, icon: 'castle', color: 'france', label: 'Meung',
        note: 'The English give it up on the morning of 18 June 1429' },
      'beaugency-18-june-1429': { lnglat: P.beaugency, icon: 'castle', color: 'france', label: 'Beaugency',
        note: 'Its English garrison rides off, 18 June 1429' },
      'orleans-19-june-1429': { lnglat: P.orleans, icon: 'shield', color: 'france', label: 'Orléans',
        note: 'Joan and the Duke of Alençon bring back their prisoners' },
      'etampes-1429': { lnglat: P.etampes, icon: 'flag', color: 'english', label: 'Étampes',
        note: 'Sir John Fastolf reaches it about midnight, 18 June 1429' },
      'chartres-1429': { lnglat: P.chartres, icon: 'flag', color: 'english', label: 'Chartres',
        note: 'Stays English after Patay, June 1429' },
    } },
  { dir: '040-auxerre-and-troyes', id: 'auxerre-and-troyes',
    title: 'Auxerre and Troyes', date: '29 June to 10 July 1429', when: '1429-06-29',
    bbox: [1.7, 47.35, 4.6, 48.6],
    zones: ['france-1428', 'english-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-gien', 'france-1429-troyes'],
    routeFiles: {
      // up the north bank of the Loire from Orléans to Gien
      'france-1429-gien': route('Joan and the Duke of Alençon lead their company from Orléans to Charles VII at Gien, 24 June 1429', 'france',
        [P.orleans, [2.05, 47.875], [2.25, 47.81], [2.45, 47.74], P.gien]),
      // east from Gien to Auxerre, north-east up the Armançon to Saint-Florentin and on to Troyes; the towns are the
      // Journal's and Ramsay's, in their order
      'france-1429-troyes': route("Charles VII's army marches from Gien by Auxerre and Saint-Florentin to Troyes, 29 June – 8 July 1429", 'france',
        [P.gien, [3.00, 47.72], [3.30, 47.76], P.auxerre, [3.66, 47.90], P.saintFlorentin, [3.90, 48.15], P.troyes]),
    },
    markers: {
      'gien-rendezvous': { lnglat: P.gien, icon: 'flag', color: 'france', label: 'Gien', image: 'gien-castle-loire-58de8e',
        note: 'Joan joins Charles VII; his army sets out on 29 June 1429' },
      'auxerre-truce': { lnglat: P.auxerre, icon: 'castle', color: 'burgundy', label: 'Auxerre',
        note: "Keeps its gates shut and sells food to the army" },
      'saint-florentin-1429': { lnglat: P.saintFlorentin, icon: 'flag', color: 'france', label: 'Saint-Florentin',
        note: 'Submits to Charles VII, early July 1429' },
      'troyes-1429': { lnglat: P.troyes, icon: 'castle', color: 'france', label: 'Troyes',
        note: 'Yields before an assault; Charles VII enters, 10 July 1429' },
      'orleans-24-june-1429': { lnglat: P.orleans, icon: 'shield', color: 'france', label: 'Orléans',
        note: 'Joan and the Duke of Alençon leave for Gien, 24 June 1429' },
    } },
  { dir: '050-reims', id: 'reims',
    title: 'The coronation at Reims', date: '14 to 17 July 1429', when: '1429-07-14',
    bbox: [3.6, 48.05, 4.8, 49.45],
    zones: ['france-reims-1429', 'english-reims-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-reims'],
    routeFiles: {
      // north from Troyes across the Champagne plain to Châlons on the Marne, north to Sept-Saulx on the Vesle and
      // down it to Reims; the towns are Cagny's and the Journal's
      'france-1429-reims': route('Charles VII marches from Troyes by Châlons and Sept-Saulx to Reims, July 1429', 'france',
        [P.troyes, [4.20, 48.55], [4.30, 48.80], P.chalons, [4.32, 49.06], P.septSaulx, [4.15, 49.21], P.reims]),
    },
    markers: {
      'chalons-1429': { lnglat: P.chalons, icon: 'flag', color: 'france', label: 'Châlons',
        note: 'Gives Charles VII full obedience, 14 July 1429' },
      'sept-saulx-1429': { lnglat: P.septSaulx, icon: 'key', color: 'france', label: 'Sept-Saulx', rank: 1,
        note: "Burgesses of Reims bring Charles VII its keys, 16 July 1429" },
      'reims-cathedral': { lnglat: P.reims, icon: 'crown', color: 'france', label: 'Reims', rank: 2,
        image: 'reims-cathedral-west-front-949e0c',
        note: 'Charles VII is anointed and crowned, 17 July 1429' },
      'troyes-july-1429': { lnglat: P.troyes, icon: 'flag', color: 'france', label: 'Troyes',
        note: 'Charles VII marches from it for Reims' },
    } },
  { dir: '060-the-towns-come-over', id: 'the-towns-come-over',
    title: 'The towns come over', date: '18 July to 2 August 1429', when: '1429-07-18',
    bbox: [2.4, 48.1, 4.3, 49.7],
    zones: ['france-aug-1429', 'english-aug-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-provins'],
    routeFiles: {
      // north-west to Corbeny, south-west to Vailly on the Aisne and down it to Soissons, south to Château-Thierry
      // on the Marne, south-east to Montmirail, where Cagny has the king lie on 1 August, and south-west to Provins;
      // the places are Cagny's and the Journal's
      'france-1429-provins': route('Charles VII marches from Reims by Corbeny, Soissons and Château-Thierry to Provins, 21 July – 2 August 1429', 'france',
        [P.reims, [3.92, 49.36], P.corbeny, [3.66, 49.43], P.vailly, P.soissons, [3.36, 49.22], P.chateauThierry,
          [3.47, 48.96], P.montmirail, [3.45, 48.72], P.provins]),
    },
    markers: {
      'corbeny-1429': { lnglat: P.corbeny, icon: 'church', color: 'france', label: 'Corbeny', rank: 2,
        note: "Charles VII touches for the King's Evil, July 1429" },
      'laon-1429': { lnglat: P.laon, icon: 'key', color: 'france', label: 'Laon', rank: 1,
        note: 'Submits to Charles VII, July 1429' },
      'soissons-1429': { lnglat: P.soissons, icon: 'flag', color: 'france', label: 'Soissons',
        note: 'Sends Charles VII its keys, and he enters on 23 July 1429' },
      'chateau-thierry-1429': { lnglat: P.chateauThierry, icon: 'castle', color: 'france', label: 'Château-Thierry',
        image: 'chateau-thierry-castle-gate-eeb358',
        note: 'Yields; Charles VII stays 29 July – 1 August 1429' },
      'coulommiers-1429': { lnglat: P.coulommiers, icon: 'flag', color: 'france', label: 'Coulommiers', rank: 2,
        note: 'Declares for Charles VII after his coronation' },
      'provins-1429': { lnglat: P.provins, icon: 'flag', color: 'france', label: 'Provins',
        note: 'Charles VII stays from 2 to 5 August 1429' },
      'sens-1429': { lnglat: P.sens, icon: 'flag', color: 'english', label: 'Sens',
        note: "Among the cities lost to the English after Orléans" },
    } },
];

// The sources of each page are the plan's (text.yaml, each page's `sources`).
const plan = fs.readFileSync('content/joan-of-arc/.plan/040-the-loire-and-reims/text.yaml', 'utf8');
const planSources = id => {
  const at = plan.indexOf(`\n  ${id}:\n`);
  const rest = plan.slice(at + 1);
  const next = rest.slice(1).search(/\n  [a-z][a-z-]*:\n/);
  const block = next < 0 ? rest : rest.slice(0, next + 1);
  const m = block.match(/\n    sources:\n((?:      - .*\n)+)/);
  if (!m) throw new Error('no sources for ' + id);
  return m[1].split('\n').filter(Boolean).map(l => JSON.parse(l.replace(/^ {6}- /, '')));
};

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
const yamlMarker = (id, m) => {
  let s = `${id}:\n  lnglat: [${m.lnglat.join(', ')}]\n  icon: ${m.icon}\n`;
  if (m.color) s += `  color: ${m.color}\n`;
  if (m.image) s += `  image: ${m.image}\n`;
  s += `  label: ${q(m.label)}\n  note: ${q(m.note)}\n`;
  if (m.rank) s += `  rank: ${m.rank}\n`;
  return s;
};

fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), HEAD + 'title: "The Loire and Reims"\n');
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  let y = HEAD + `title: ${q(p.title)}\ndate: ${q(p.date)}\nwhen: ${p.when}\nbbox: [${p.bbox.join(', ')}]\n` +
    `zones: ${list(p.zones)}\nroutes: ${list(p.routes)}\nmarkers: ${list(Object.keys(p.markers))}\n`;
  if (p.battle) y += `battle: ${p.battle}\n`;
  // A reviewer may fill the sources in page.yaml: a rerun keeps the lines already there.
  const file = path.join(dir, 'page.yaml');
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + planSources(p.id).map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(file, y);
  fs.writeFileSync(path.join(dir, 'markers.yaml'),
    HEAD + Object.entries(p.markers).map(([id, m]) => yamlMarker(id, m)).join(''));
  for (const [id, f] of Object.entries(p.routeFiles)) {
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
console.log('section 040: wrote', pages.length, 'pages');
