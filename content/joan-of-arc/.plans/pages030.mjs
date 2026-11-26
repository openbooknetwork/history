// Writes the page files, routes and markers of section 030, orleans. Run from the repo root:
//   node content/joan-of-arc/.plans/pages030.mjs
// Each page file it writes opens with a comment naming this script: change a page here and run it again, never by
// hand. The plan is content/joan-of-arc/.plan/030-orleans/{pages,map}.yaml, and each page's sources are those of
// text.yaml. Every route is a reconstruction: the sources give the stations and no road, and the comment over each
// says what the line follows. The forts are reconstructions too, placed at the sites the chronicles name.
// The Loire at Orléans is drawn from these readings of the river, since Natural Earth's line cuts across the city:
// its north bank by the bridge at about 47.8975 N and its south bank at about 47.8942 N, the river at Saint-Loup about
// 47.894 N, at Chécy about 47.885 N, as the map keeper's ORLW in zones.mjs has it below the city.
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlLoad } from 'js-yaml';

const SEC = 'content/joan-of-arc/pages/030-orleans';
const HEAD = '# Written by content/joan-of-arc/.plans/pages030.mjs. Change it there and run it again.\n';
const q = s => JSON.stringify(s);
const text = yamlLoad(fs.readFileSync('content/joan-of-arc/.plan/030-orleans/text.yaml', 'utf8'));

// Places, as the plan's markers give them, and zones.mjs's points where it has the same place.
const P = {
  blois: [1.335, 47.586], olivet: [1.900, 47.863], checy: [2.024, 47.894], orleans: [1.909, 47.902],
  checySouth: [2.02, 47.877],                 // the south bank before Chécy, where the supplies went into boats
  port: [1.912, 47.8972],                     // the city's waterfront by the Tour Neuve
  saintLaurent: [1.892, 47.900], london: [1.891, 47.906], rouen: [1.896, 47.908], paris: [1.901, 47.909],
  charlemagne: [1.882, 47.892], belleCroix: [1.9068, 47.8964], boucher: [1.903, 47.902],
  saintLoup: [1.948, 47.899], tourNeuve: [1.9165, 47.8977], ileSaintAignan: [1.918, 47.8961],
  saintJean: [1.919, 47.8928], augustins: [1.9068, 47.8933], saintPrive: [1.874, 47.888],
  tourelles: [1.9068, 47.8952], boulevard: [1.9068, 47.8943], ileSaintAntoine: [1.9085, 47.8962],
  bridgeNorth: [1.9068, 47.8985],             // the Châtelet, the bridge's north end in the city
  array: [1.89, 47.905], meung: [1.70, 47.83], beaugency: [1.633, 47.776], jargeau: [2.125, 47.862],
};

const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra },
  geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-from-blois', id: 'from-blois',
    title: 'From Blois into the City', date: '27 to 29 April 1429', when: '1429-04-27',
    bbox: [1.25, 47.25, 2.15, 48.05],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: ['convoy-1429-sologne', 'boats-1429-checy', 'joan-1429-entry'],
    routeFiles: {
      // over the bridge of Blois to the south bank, then up the Loire through the Sologne, a few kilometres south
      // of the river and clear of Beaugency and Meung, by Olivet, to the south bank before Chécy
      'convoy-1429-sologne': route('The convoy for Orléans goes up the south bank of the Loire through the Sologne, 27 – 29 April 1429', 'france',
        [P.blois, [1.338, 47.578], [1.42, 47.615], [1.50, 47.655], [1.58, 47.70], [1.63, 47.755], [1.70, 47.795],
          [1.78, 47.838], [1.85, 47.862], P.olivet, [1.95, 47.876], [1.99, 47.879], P.checySouth]),
      // down the Loire from the loading place, past Saint-Loup, to the city's waterfront
      'boats-1429-checy': route('Boats from Orléans bring the supplies down the Loire past the English, 29 April 1429', 'france',
        [P.checySouth, [2.012, 47.883], [2.00, 47.8875], [1.975, 47.8915], [1.948, 47.8940], [1.925, 47.8958], P.port]),
      // no road given: from Chécy down the north bank to the city; no gate is drawn (rules.md)
      'joan-1429-entry': route('Joan rides from Chécy into Orléans, evening of 29 April 1429', 'france',
        [P.checy, [2.00, 47.8975], [1.97, 47.900], [1.948, 47.9025], [1.93, 47.903], P.orleans]),
    },
    markers: {
      blois: { lnglat: P.blois, icon: 'flag', color: 'france', label: 'Blois', image: 'blois-loire-bridge',
        note: 'The convoy for Orléans leaves under Boussac and Gilles de Rais, 27 or 28 April 1429, a day the authors give differently, with priests singing the Veni Creator before it' },
      checy: { lnglat: P.checy, icon: 'tent', color: 'france', label: 'Chécy', rank: 1,
        note: 'The Journal of the Siege has the force lie here and the Bastard of Orléans meet Joan; Lang has her sleep at Reuilly near by, Lowell reads Cléry' },
      'orleans-entry': { lnglat: P.orleans, icon: 'shield', color: 'france', label: 'Orléans', rank: 2,
        note: 'Joan rides in on a white horse at about eight in the evening of 29 April 1429, by torchlight, and lodges with Jacques Boucher' },
    },
    sources: text.pages['from-blois'].sources },
  { dir: '020-the-army-of-blois', id: 'the-army-of-blois',
    title: 'The Army Comes by the Beauce', date: '30 April to 4 May 1429', when: '1429-04-30',
    bbox: [1.84, 47.875, 1.97, 47.93],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: ['army-1429-beauce'],
    routeFiles: {
      // no road given: up the north bank through the Beauce, well north of Beaugency and Meung, round the north of
      // the city to the forest of Orléans, then in from the north-east past the bastille of Paris, on the side of the
      // English edge that the city's open land lies on (zones.mjs ORLN)
      'army-1429-beauce': route('The army from Blois comes to Orléans through the Beauce, 3 – 4 May 1429', 'france',
        [P.blois, [1.40, 47.66], [1.50, 47.74], [1.58, 47.82], [1.68, 47.90], [1.78, 47.95], [1.88, 47.975],
          [1.94, 47.955], [1.928, 47.935], [1.918, 47.915], [1.912, 47.9065], P.orleans]),
    },
    markers: {
      'bastille-saint-laurent': { lnglat: P.saintLaurent, icon: 'castle', color: 'english', label: 'The bastille of Saint-Laurent',
        rank: 3, image: 'saint-laurent-orleans-church',
        note: 'The largest English work, outside the west gate, where the chief captains and most of the English strength lay' },
      'bastille-london': { lnglat: P.london, icon: 'castle', color: 'english', label: 'The bastille of London', rank: 1,
        note: 'An English bastille at the Douze-Pairs, north-west of the city, near the bastille of Paris (Girault)' },
      'bastille-rouen': { lnglat: P.rouen, icon: 'castle', color: 'english', label: 'The bastille of Rouen', rank: 1,
        note: 'An English bastille at the Pressoir-Ars, between the bastilles of London and of Paris' },
      'bastille-paris': { lnglat: P.paris, icon: 'castle', color: 'english', label: 'The bastille of Paris', rank: 2,
        note: 'An English bastille at Saint-Pouair; La Hire and Florent d\'Illiers drive the English back to it on 30 April, and the army from Blois passes close by on 4 May' },
      'ile-charlemagne': { lnglat: P.charlemagne, icon: 'castle', color: 'english', label: 'The Île Charlemagne', rank: 1,
        note: 'An English outpost on an island just below the city, with a bridge; Saint-Privé guards the ferry from it' },
      'belle-croix': { lnglat: P.belleCroix, icon: 'shield', color: 'france', label: 'The Belle-Croix', rank: 2,
        note: 'The French boulevard on the bridge, facing the Tourelles; from here Joan calls on Glasdale to go and is called a cowherd' },
      'boucher-house': { lnglat: P.boucher, icon: 'house', color: 'france', label: 'Jacques Boucher\'s house', rank: 1,
        image: 'maison-jeanne-d-arc-orleans',
        note: 'Joan lodges with the Duke of Orléans\'s treasurer by the Porte Regnart, from where she could see the whole siege' },
    },
    sources: text.pages['the-army-of-blois'].sources },
  { dir: '030-storming-saint-loup', id: 'storming-saint-loup',
    title: 'Saint-Loup', date: '4 May 1429', when: '1429-05-04',
    bbox: [1.885, 47.885, 1.965, 47.92],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: ['french-1429-saint-loup'],
    routeFiles: {
      // no gate or road given: east along the north bank from the city to the bastille
      'french-1429-saint-loup': route('The French go out of Orléans against the bastille of Saint-Loup, 4 May 1429', 'france',
        [P.orleans, [1.915, 47.9015], [1.925, 47.9005], [1.938, 47.8995], P.saintLoup]),
    },
    markers: {
      'saint-loup': { lnglat: P.saintLoup, icon: 'castle', color: 'english', label: 'The bastille of Saint-Loup', rank: 2,
        note: 'Stormed from about noon on 4 May 1429 and taken by vespers, burned and pulled down: the first English fort to fall' },
      'saint-pouair-sortie': { lnglat: P.paris, icon: 'castle', color: 'english', label: 'The bastille of Paris', rank: 1,
        note: 'The Journal of the Siege has English come out from here to help Saint-Loup; they go back when the French draw up against them' },
    },
    sources: text.pages['storming-saint-loup'].sources },
  { dir: '040-the-augustins', id: 'the-augustins',
    title: 'Saint-Jean-le-Blanc and the Augustins', date: '6 May 1429', when: '1429-05-06',
    bbox: [1.86, 47.885, 1.96, 47.912],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: ['french-1429-crossing', 'english-1429-augustins'],
    routeFiles: {
      // from the bank just above the Tour Neuve over to the island, across the narrow arm to Saint-Jean-le-Blanc, and
      // west a little inland along the south bank to the Augustins
      'french-1429-crossing': route('The French cross the Loire by the Île Saint-Aignan and go against the Augustins, 6 May 1429', 'france',
        [P.tourNeuve, [1.918, 47.8970], P.ileSaintAignan, [1.9188, 47.8945], P.saintJean, [1.914, 47.8918],
          [1.910, 47.8922], P.augustins]),
      // the two ends are given: from Saint-Jean-le-Blanc along the shore to the Augustins
      'english-1429-augustins': route('The English leave Saint-Jean-le-Blanc for the Augustins, 6 May 1429', 'english',
        [P.saintJean, [1.915, 47.8934], [1.911, 47.8936], P.augustins]),
    },
    markers: {
      'ile-saint-aignan': { lnglat: P.ileSaintAignan, icon: 'map-pin', color: 'france', label: 'The Île Saint-Aignan', rank: 1,
        image: 'loire-at-orleans-islands',
        note: 'The French land on this island facing Saint-Aignan on 6 May and cross the narrow arm on two boats' },
      'saint-jean-le-blanc': { lnglat: P.saintJean, icon: 'castle', color: 'english', label: 'The bastille of Saint-Jean-le-Blanc', rank: 1,
        note: 'Glasdale empties and burns it as the French cross on 6 May 1429' },
      augustins: { lnglat: P.augustins, icon: 'castle', color: 'english', label: 'The Augustins', rank: 2,
        note: 'An English bastille in a ruined convent by the bridge, taken by assault before night on 6 May 1429 and burned' },
      'saint-prive': { lnglat: P.saintPrive, icon: 'castle', color: 'english', label: 'The bastille of Saint-Privé', rank: 1,
        note: 'In the night of 6 May its garrison fires it and crosses to Saint-Laurent (the Chronique), or English drown crossing here (the chronicle of the feast)' },
    },
    sources: text.pages['the-augustins'].sources },
  { dir: '050-the-tourelles', id: 'the-tourelles',
    title: 'The Tourelles', date: '7 May 1429', when: '1429-05-07',
    bbox: [1.885, 47.888, 1.93, 47.906],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: ['townsmen-1429-bridge'],
    routeFiles: {
      // the medieval bridge, gone: from its north end at the Châtelet by the Belle-Croix to the broken arches before
      // the Tourelles
      'townsmen-1429-bridge': route('Men of Orléans bridge the broken arches and attack the Tourelles from the city, 7 May 1429', 'france',
        [P.bridgeNorth, P.belleCroix, [1.9068, 47.8957]]),
    },
    markers: {
      tourelles: { lnglat: P.tourelles, icon: 'castle', color: 'english', label: 'The Tourelles', rank: 3,
        image: 'tourelles-site-monument',
        note: 'Held by Glasdale and attacked from both sides all day on 7 May 1429; it falls at evening, and Glasdale drowns when the drawbridge gives way' },
      'tourelles-boulevard': { lnglat: P.boulevard, icon: 'swords', color: 'english', label: 'The boulevard of the Tourelles', rank: 2,
        note: 'Joan is struck between the neck and the shoulder here as she raises a ladder; towards evening the French take it' },
      'ile-saint-antoine': { lnglat: P.ileSaintAntoine, icon: 'flame', color: 'france', label: 'The Île Saint-Antoine', rank: 1,
        note: 'Ramsay has guns of Orléans fire on the Tourelles all day from this island under its bridge' },
    },
    sources: text.pages['the-tourelles'].sources },
  { dir: '060-the-english-march-away', id: 'the-english-march-away',
    title: 'The English March Away', date: '8 May 1429', when: '1429-05-08',
    bbox: [1.55, 47.72, 2.25, 48.02], battle: 'orleans-1429',
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: [['talbot-1429-meung', 'suffolk-1429-jargeau']],
    routeFiles: {
      // no road given: down the north bank from the array west of the city to Meung, and on to Beaugency
      'talbot-1429-meung': route('Talbot and Lord Scales march from Orléans to Meung and Beaugency, 8 May 1429', 'english',
        [P.array, [1.85, 47.895], [1.80, 47.882], [1.75, 47.866], P.meung, [1.665, 47.805], P.beaugency]),
      // no road given: east along the north bank and over the bridge of Jargeau
      'suffolk-1429-jargeau': route('Suffolk marches from Orléans to Jargeau, 8 May 1429', 'english',
        [[1.905, 47.911], [1.95, 47.906], [2.00, 47.900], [2.05, 47.892], [2.10, 47.882], [2.122, 47.871], P.jargeau]),
    },
    markers: {
      'english-array': { lnglat: P.array, icon: 'swords', color: 'english', label: 'The English array', rank: 1,
        note: 'On Sunday 8 May 1429 the English draw up for battle before the city for an hour; Joan forbids an attack on a Sunday, and they march away' },
      'meung-may-1429': { lnglat: P.meung, icon: 'castle', color: 'english', label: 'Meung', rank: 2,
        note: 'The English march in here in good order on 8 May 1429, and Talbot goes on to Beaugency' },
      'beaugency-may-1429': { lnglat: P.beaugency, icon: 'castle', color: 'english', label: 'Beaugency', rank: 1,
        note: 'Talbot and Thomas, Lord Scales, come here from Meung once the siege is raised (the Chronique, Champion)' },
      'jargeau-may-1429': { lnglat: P.jargeau, icon: 'castle', color: 'english', label: 'Jargeau',
        note: 'Suffolk goes here with his men when the siege is raised, 8 May 1429' },
    },
    sources: text.pages['the-english-march-away'].sources },
];

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
fs.writeFileSync(path.join(SEC, 'group.yaml'), HEAD + 'title: "Orléans"\n');
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
  y += kept ? kept[0] : 'sources:\n' + p.sources.map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(file, y);
  fs.writeFileSync(path.join(dir, 'markers.yaml'),
    HEAD + Object.entries(p.markers).map(([id, m]) => yamlMarker(id, m)).join(''));
  for (const [id, f] of Object.entries(p.routeFiles)) {
    fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
  }
}
console.log('section 030: wrote', pages.length, 'pages');
