// Writes the page files, routes and markers of section 060, rouen. Run from the repo root:
//   node content/joan-of-arc/.plans/pages060.mjs
// Each page file it writes opens with a comment naming this script: change a page here and run it again, never by
// hand. The plan is content/joan-of-arc/.plan/060-rouen/{pages,map}.yaml. Every route is a reconstruction: the
// sources give the stations and no road, so each line joins its stations, as the comment over it says. No route runs
// from Le Crotoy to Rouen: rules.md leaves that road out, and the map marks the two places.
import fs from 'node:fs';
import path from 'node:path';

const SEC = 'content/joan-of-arc/pages/060-rouen';
const HEAD = '# Written by content/joan-of-arc/.plans/pages060.mjs. Change it there and run it again.\n';
const q = s => JSON.stringify(s);

// Places, as the plan's markers give them, and the zone generator's points (zones.mjs, T) where it has the place.
const P = {
  clairoix: [2.846, 49.443], compiegne: [2.83, 49.42], beaulieu: [2.91, 49.66], beaurevoir: [3.31, 50.0],
  arras: [2.78, 50.29],
  // Le Crotoy stands at about [1.625, 50.217], which the base map's coarse coast leaves in the bay: the point is set
  // on that map's land, about 1.5 km north-east, so the marker sits in a zone and the route stays on land
  le_crotoy: [1.645, 50.23], rouen: [1.099, 49.443], beauvais: [2.08, 49.43],
  paris: [2.352, 48.857], noyon: [3.0, 49.58], saint_quentin: [3.29, 49.85],
  // the Somme on the base map's line at Picquigny, below Amiens
  somme: [2.144, 49.944],
  // the castle of Drugy, today in the commune of Saint-Riquier (names.md), just south of the town
  drugy: [1.947, 50.125],
  // Rouen, for the three pages inside the city: the castle's ward on the Bouvreuil hill (no source places the chapel,
  // the hall or her cell inside it, so one point in the middle of the ward), the keep at its northern point, the
  // cemetery beside the south side of the abbey church of Saint-Ouen (Lowell), and the Old Market
  castle: [1.0932, 49.4452], keep: [1.0938, 49.4461], saintOuen: [1.0995, 49.4425], oldMarket: [1.0878, 49.4430],
  // no source read places these three: the archbishop's palace by the east end of the cathedral, the church of
  // Saint-Sauveur on the north-west of the Old Market, where its foundations lie, and the Seine in mid-stream below it
  archbishop: [1.0957, 49.4402], saintSauveur: [1.0874, 49.4435], seine: [1.0885, 49.4368],
};

const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra },
  geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-beaulieu-and-beaurevoir', id: 'beaulieu-and-beaurevoir',
    title: 'The prisoner of John of Luxembourg', date: 'May – October 1430', when: '1430-05-25',
    bbox: [2.45, 49.25, 3.65, 50.15],
    zones: ['france-1430', 'english-1430', 'burgundy-1430', 'brittany-1407'],
    routes: ['joan-1430-beaulieu', 'joan-1430-beaurevoir'],
    routeFiles: {
      // only the two places are given (Lang, Ramsay, Lowell): the line joins them
      'joan-1430-beaulieu': route('Joan is taken as a prisoner from Clairoix to Beaulieu, May 1430', 'joan',
        [P.clairoix, P.beaulieu]),
      // only the two places are given, and the date of the move is disputed: the line joins them
      'joan-1430-beaurevoir': route('Joan is moved as a prisoner from Beaulieu to Beaurevoir, 1430', 'joan',
        [P.beaulieu, P.beaurevoir]),
    },
    markers: {
      'beaulieu-1430': { lnglat: P.beaulieu, icon: 'castle', color: 'burgundy', label: 'Beaulieu', rank: 1,
        note: "Joan is held here from the end of May 1430" },
      'beaurevoir-1430': { lnglat: P.beaurevoir, icon: 'castle', color: 'burgundy', label: 'Beaurevoir', rank: 2,
        image: 'beaurevoir-tower-cc03c4',
        note: "Joan is held some four months and leaps from the tower" },
      'clairoix-beaulieu-1430': { lnglat: P.clairoix, icon: 'tent', color: 'burgundy', label: 'Clairoix',
        note: "Joan is kept three or four days here, May 1430" },
      'compiegne-summons-1430': { lnglat: P.compiegne, icon: 'shield', color: 'france', label: 'Compiègne',
        note: "Pierre Cauchon demands Joan for trial, 14 July 1430" },
      'noyon-1430': { lnglat: P.noyon, icon: 'map-pin', color: 'burgundy', label: 'Noyon',
        note: 'A Burgundian town, near which stands Beaulieu' },
      'saint-quentin-1430': { lnglat: P.saint_quentin, icon: 'map-pin', color: 'burgundy', label: 'Saint-Quentin',
        note: 'A Burgundian town near Beaurevoir' },
    } },
  { dir: '020-sold-to-the-english', id: 'sold-to-the-english',
    title: 'Sold to the English', date: 'October – December 1430', when: '1430-10',
    bbox: [0.85, 48.7, 3.6, 50.55],
    zones: ['france-1430', 'english-1430', 'burgundy-1430', 'brittany-1407'],
    routes: ['joan-1430-le-crotoy'],
    routeFiles: {
      // the stations are Ramsay's and Lowell's (Beaurevoir, Arras, Le Crotoy) and Lang's (Drugy); no road is given,
      // so the line joins them, and it ends at Le Crotoy, coming in north of the bay of the Somme so as to keep to land
      'joan-1430-le-crotoy': route('Joan is taken from Beaurevoir by Arras and Drugy to Le Crotoy, October – November 1430', 'joan',
        [P.beaurevoir, P.arras, P.drugy, [1.75, 50.21], P.le_crotoy]),
    },
    markers: {
      'arras-1430': { lnglat: P.arras, icon: 'castle', color: 'burgundy', label: 'Arras', rank: 1,
        note: "Joan is brought here from Beaurevoir, late October 1430" },
      'le-crotoy-1430': { lnglat: P.le_crotoy, icon: 'castle', color: 'english', label: 'Le Crotoy', rank: 1,
        image: 'le-crotoy-bay-7e7c58',
        note: 'An English fortress; Joan is here by November 1430' },
      'rouen-1430': { lnglat: P.rouen, icon: 'castle', color: 'english', label: 'Rouen', rank: 2,
        note: 'Joan is shut in a tower of the castle, late 1430' },
      'compiegne-relief-1430': { lnglat: P.compiegne, icon: 'shield', color: 'france', label: 'Compiègne', rank: 1,
        note: 'Holds for Charles VII and is relieved, 25–26 October 1430' },
      'beaurevoir-october-1430': { lnglat: P.beaurevoir, icon: 'castle', color: 'burgundy', label: 'Beaurevoir',
        note: "Joan is taken from here to Arras, late October 1430" },
      'drugy-1430': { lnglat: P.drugy, icon: 'castle', color: 'burgundy', label: 'Drugy',
        note: 'Joan passes a night here on her road to Le Crotoy' },
      'paris-university-1430': { lnglat: P.paris, icon: 'graduation-cap', color: 'english', label: 'Paris', rank: 1,
        note: 'The University asks to try Joan here, 21 November 1430' },
    } },
  { dir: '030-the-court', id: 'the-court',
    title: 'The court of Pierre Cauchon', date: 'January – April 1431', when: '1431-01-03',
    bbox: [0.75, 48.7, 3.0, 49.75],
    zones: ['france-1430', 'english-1430', 'burgundy-1430', 'brittany-1407'],
    routes: [], routeFiles: {},
    markers: {
      'rouen-castle-1431': { lnglat: P.castle, icon: 'castle', color: 'english', label: 'the castle of Rouen', rank: 2,
        note: "English soldiers guard Joan; the court sits here in 1431" },
      'beauvais-1431': { lnglat: P.beauvais, icon: 'shield', color: 'france', label: 'Beauvais', rank: 1,
        note: "Pierre Cauchon's see, which drove him out in August 1429" },
      'university-of-paris-1431': { lnglat: P.paris, icon: 'graduation-cap', color: 'english', label: 'Paris', rank: 1,
        note: 'The University presses for her trial, November 1430' },
      'compiegne-diocese-1431': { lnglat: P.compiegne, icon: 'map-pin', color: 'france', label: 'Compiègne',
        note: "Joan is taken here, May 1430, in Pierre Cauchon's diocese" },
    } },
  { dir: '040-the-questioning', id: 'the-questioning',
    title: 'The questioning', date: '21 February – 12 May 1431', when: '1431-02-21',
    bbox: [1.087, 49.4425, 1.0995, 49.4485],
    zones: ['english-sep-1429'],
    routes: [], routeFiles: {},
    markers: {
      'castle-sessions-1431': { lnglat: P.castle, icon: 'scroll', color: 'english', label: 'the castle of Rouen', rank: 2,
        note: 'The court questions Joan here from 21 February 1431' },
      'great-tower-1431': { lnglat: P.keep, icon: 'castle', color: 'english', label: 'the great tower', rank: 1,
        image: 'rouen-castle-keep-370a86',
        note: "Joan is shown the instruments of torture, 9 May 1431" },
    } },
  { dir: '050-saint-ouen', id: 'saint-ouen',
    title: 'The cemetery of Saint-Ouen', date: '24 – 29 May 1431', when: '1431-05-24',
    bbox: [1.082, 49.438, 1.104, 49.4485],
    zones: ['english-sep-1429'],
    routes: ['joan-1431-saint-ouen'],
    routeFiles: {
      // no source gives the streets: the line joins the castle and the cemetery, and stands for the way there and back
      'joan-1431-saint-ouen': route('Joan is taken from the castle of Rouen to the cemetery of Saint-Ouen and back, 24 May 1431', 'joan',
        [P.castle, P.saintOuen]),
    },
    markers: {
      'saint-ouen-1431': { lnglat: P.saintOuen, icon: 'scroll', color: 'english', label: 'the cemetery of Saint-Ouen', rank: 2,
        image: 'saint-ouen-abbey-church-6d9f2b',
        note: 'Joan abjures on a scaffold here, 24 May 1431' },
      'castle-relapse-1431': { lnglat: P.castle, icon: 'castle', color: 'english', label: 'the castle of Rouen', rank: 1,
        note: "Joan is found in man's dress again, 28 May 1431" },
      'archbishops-palace-1431': { lnglat: P.archbishop, icon: 'church', color: 'english', label: "the archbishop's palace",
        note: 'The judges find Joan relapsed, 29 May 1431' },
      'old-market-summons-1431': { lnglat: P.oldMarket, icon: 'flame', color: 'english', label: 'the Old Market',
        note: 'Joan is summoned here for eight o\'clock, 30 May 1431' },
    } },
  { dir: '060-the-old-market', id: 'the-old-market',
    title: 'The Old Market', date: '30 May 1431', when: '1431-05-30',
    bbox: [1.083, 49.433, 1.0985, 49.4485],
    zones: ['english-sep-1429'],
    routes: ['joan-1431-old-market'],
    routeFiles: {
      // no source gives the streets: the line joins the castle and the Old Market
      'joan-1431-old-market': route('Joan is led from the castle of Rouen to the Old Market, 30 May 1431', 'joan',
        [P.castle, P.oldMarket]),
    },
    markers: {
      'castle-last-morning-1431': { lnglat: P.castle, icon: 'castle', color: 'english', label: 'the castle of Rouen', rank: 1,
        note: "Joan confesses and receives communion, 30 May 1431" },
      'old-market-1431': { lnglat: P.oldMarket, icon: 'flame', color: 'english', label: 'the Old Market', rank: 2,
        image: 'vieux-marche-pyre-97466c',
        note: 'Joan is burned here on 30 May 1431' },
      'saint-sauveur-1431': { lnglat: P.saintSauveur, icon: 'church', color: 'english', label: 'the church of Saint-Sauveur', rank: 1,
        note: 'Its cross is brought for Joan to look at, 30 May 1431' },
      'seine-1431': { lnglat: P.seine, icon: 'waves', label: 'the Seine',
        note: "Joan's ashes are thrown into this river on 30 May 1431" },
    } },
];

// The sources of each page are the plan's (text.yaml, each page's `sources`).
const plan = fs.readFileSync('content/joan-of-arc/.plan/060-rouen/text.yaml', 'utf8');
const planSources = id => {
  const at = plan.indexOf(`\n  ${id}:\n`);
  if (at < 0) throw new Error('no page ' + id);
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
fs.writeFileSync(path.join(SEC, 'group.yaml'), HEAD + 'title: "Rouen"\n');
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(dir, { recursive: true });
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
  if (Object.keys(p.routeFiles).length) fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
  for (const [id, f] of Object.entries(p.routeFiles)) {
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
console.log('section 060: wrote', pages.length, 'pages');
