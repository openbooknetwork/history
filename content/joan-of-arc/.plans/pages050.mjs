// Writes the page files, routes and markers of section 050, paris-and-compiegne. Run from the repo root:
//   node content/joan-of-arc/.plans/pages050.mjs
// Each page file it writes opens with a comment naming this script: change a page here and run it again, never by
// hand. The plan is content/joan-of-arc/.plan/050-paris-and-compiegne/{pages,map}.yaml. Every route but the sortie
// at Compiègne is a reconstruction: the sources give the stations and no road, and the comment over each says what
// the line follows. Marker places are the plan's, and the zone generator's (zones.mjs, T) where it has the place.
import fs from 'node:fs';
import path from 'node:path';

const SEC = 'content/joan-of-arc/pages/050-paris-and-compiegne';
const HEAD = '# Written by content/joan-of-arc/.plans/pages050.mjs. Change it there and run it again.\n';
const q = s => JSON.stringify(s);

const P = {
  // the road of August 1429, from Provins where 040 ends
  provins: [3.30, 48.56], nangis: [3.015, 48.555], bray: [3.24, 48.41], coulommiers: [3.08, 48.81],
  laFerteMilon: [3.13, 49.175], crepy: [2.89, 49.23], lagnyLeSec: [2.745, 49.075], dammartin: [2.68, 49.055],
  baron: [2.73, 49.165], montepilloy: [2.70, 49.21], mitry: [2.62, 48.98], thieux: [2.665, 49.01],
  louvres: [2.505, 49.04], victoire: [2.62, 49.19], senlis: [2.59, 49.21], compiegne: [2.83, 49.42],
  paris: [2.352, 48.857], beauvais: [2.08, 49.43], creil: [2.47, 49.26], pontSainteMaxence: [2.60, 49.30],
  choisy: [2.88, 49.44], gournay: [2.70, 49.49], aumale: [1.75, 49.77], blangy: [1.63, 49.93], lagny: [2.71, 48.87],
  // Paris, 7-8 September: the gates on the line of the wall of Charles V, as the plan places them
  saintDenisTown: [2.355, 48.936], saintDenisAbbey: [2.36, 48.936], laChapelle: [2.36, 48.89],
  porteSaintDenis: [2.352, 48.867], porteSaintHonore: [2.337, 48.863],
  // the pig market: outside the wall before the Porte Saint-Honoré, a few hundred metres north-west of the card
  pigMarket: [2.3325, 48.8662],
  // the road south, September 1429
  sens: [3.28, 48.20], yonneFord: [3.255, 48.226], courtenay: [3.06, 48.04], chateauRenard: [2.93, 47.93],
  montargis: [2.73, 48.00], gien: [2.63, 47.69],
  // the upper Loire, autumn 1429
  bourges: [2.399, 47.081], mehun: [2.21, 47.15], saintPierre: [3.12, 46.80], moulins: [3.33, 46.57],
  laCharite: [3.02, 47.18], cosne: [2.93, 47.41],
  // spring 1430
  sully: [2.38, 47.77], melun: [2.66, 48.54],
  // Compiègne, May 1430: the town on the left bank of the Oise, the bridge by the card, the posts on the right bank
  bridge: [2.8275, 49.4195], coudun: [2.81, 49.47], clairoix: [2.85, 49.44], margny: [2.82, 49.43], venette: [2.80, 49.42],
};

const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra },
  geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-montepilloy', id: 'montepilloy',
    title: 'Montépilloy', date: 'August 1429', when: '1429-08-14',
    bbox: [1.45, 48.3, 3.6, 50.0],
    zones: ['france-compiegne-1429', 'english-compiegne-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-bray', 'france-1429-montepilloy', 'english-1429-montepilloy', 'english-1429-paris', 'france-1429-compiegne'],
    routeFiles: {
      // Provins west to Nangis, south-east to Bray on the Seine, where the army turned back, and north past Provins
      // to Coulommiers, La Ferté-Milon and Crépy; the towns are Cagny's, Ramsay's and the Journal's, the roads no source's
      'france-1429-bray': route("Charles VII's army marches from Provins by Nangis towards Bray, and turns north by Coulommiers and La Ferté-Milon to Crépy, 5–11 August 1429", 'france',
        [P.provins, [3.16, 48.565], P.nangis, [3.13, 48.48], P.bray, [3.20, 48.50], [3.17, 48.62], [3.12, 48.72], P.coulommiers,
          [3.11, 48.95], [3.14, 49.08], P.laFerteMilon, [3.01, 49.21], P.crepy]),
      // south-west from Crépy to Lagny-le-Sec and Dammartin, then north by Baron to Montépilloy (Cagny, Ramsay)
      'france-1429-montepilloy': route("Charles VII's army goes from Crépy by Lagny-le-Sec and Dammartin, and from Baron to Montépilloy, 12–14 August 1429", 'france',
        [P.crepy, [2.82, 49.15], P.lagnyLeSec, P.dammartin, [2.71, 49.11], P.baron, P.montepilloy]),
      // Mitry north-east to Thieux, west to Louvres on the road from Paris to Senlis, and north up it to the camp on
      // the Nonette (Ramsay)
      'english-1429-montepilloy': route("John, Duke of Bedford's army goes from Mitry by Thieux and Louvres to Notre-Dame-de-la-Victoire, 13–14 August 1429", 'english',
        [P.mitry, P.thieux, [2.58, 49.03], P.louvres, [2.53, 49.10], [2.58, 49.16], P.victoire]),
      // back by Senlis and down the road to Paris, east of the way out so the two stand apart
      'english-1429-paris': route("John, Duke of Bedford's army falls back by Senlis to Paris, 16 August 1429", 'english',
        [P.victoire, P.senlis, [2.56, 49.12], [2.47, 49.02], [2.40, 48.93], P.paris], { offset: 4 }),
      // back to Crépy, then north to Compiègne (Cagny)
      'france-1429-compiegne': route('Charles VII goes from Montépilloy by Crépy to Compiègne, 16–18 August 1429', 'france',
        [P.montepilloy, [2.80, 49.225], P.crepy, [2.88, 49.32], [2.85, 49.38], P.compiegne]),
    },
    markers: {
      'bray-held-1429': { lnglat: P.bray, icon: 'shield-x', color: 'english', label: 'Bray',
        note: "English troops come in before Charles VII's army can cross" },
      'crepy-1429': { lnglat: P.crepy, icon: 'flag', color: 'france', label: 'Crépy',
        note: "The Duke of Bedford's challenge comes, 11 August 1429" },
      'montepilloy': { lnglat: P.montepilloy, icon: 'swords', color: 'france', label: 'Montépilloy', rank: 2,
        image: 'montepilloy-castle-ruins-cc0fc5',
        note: "The two armies face each other, 14 and 15 August 1429" },
      'victoire-1429': { lnglat: P.victoire, icon: 'tent', color: 'english', label: 'Notre-Dame-de-la-Victoire', rank: 1,
        note: "The Duke of Bedford's fortified camp, 14–16 August 1429" },
      'senlis-1429': { lnglat: P.senlis, icon: 'key', color: 'france', label: 'Senlis', rank: 1,
        image: 'senlis-cathedral-abd174',
        note: "Yields by treaty to the Count of Vendôme, August 1429" },
      'compiegne-1429': { lnglat: P.compiegne, icon: 'key', color: 'france', label: 'Compiègne', rank: 2,
        note: 'Charles VII enters on 18 August 1429' },
      'beauvais-1429': { lnglat: P.beauvais, icon: 'flag', color: 'france', label: 'Beauvais',
        note: 'Comes over and drives out Pierre Cauchon, August 1429' },
    } },
  { dir: '020-paris', id: 'paris',
    title: 'The Porte Saint-Honoré', date: 'September 1429', when: '1429-09-08',
    bbox: [2.27, 48.84, 2.42, 48.95], battle: 'paris-1429',
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-paris'],
    routeFiles: {
      // south down the road from Saint-Denis to La Chapelle (the Journal: midway on that road), then west outside
      // the line of the wall of Charles V to the pig market before the gate, which no source draws
      'france-1429-paris': route("Charles VII's army goes from Saint-Denis by La Chapelle to the pig market before the Porte Saint-Honoré, 7–8 September 1429", 'france',
        [P.saintDenisTown, [2.357, 48.92], [2.359, 48.905], P.laChapelle, [2.358, 48.881], [2.350, 48.877], [2.342, 48.873],
          [2.336, 48.870], P.pigMarket]),
    },
    markers: {
      'saint-denis-1429': { lnglat: P.saintDenisTown, icon: 'flag', color: 'france', label: 'Saint-Denis',
        note: 'Taken by Joan and the Duke of Alençon, 25 August 1429' },
      'la-chapelle-1429': { lnglat: P.laChapelle, icon: 'tent', color: 'france', label: 'La Chapelle',
        note: 'Joan lodges here on 7 September 1429' },
      'porte-saint-denis-1429': { lnglat: P.porteSaintDenis, icon: 'door-closed', color: 'english', label: 'Porte Saint-Denis', rank: 1,
        note: "Its defenders threaten a sally, 8 September 1429" },
      'porte-saint-honore': { lnglat: P.porteSaintHonore, icon: 'door-closed', color: 'english', label: 'Porte Saint-Honoré', rank: 2,
        image: 'paris-charles-v-wall-plan-4c7248',
        note: 'Joan attacks it and is wounded, 8 September 1429' },
    } },
  { dir: '030-back-to-the-loire', id: 'back-to-the-loire',
    title: 'Back to the Loire', date: 'September 1429', when: '1429-09-13',
    bbox: [2.0, 47.55, 3.55, 49.0],
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-back-to-gien'],
    routeFiles: {
      // east to Lagny on the Marne, south-east to Provins, south to Bray on the Seine, on past Sens to a ford of the
      // Yonne a little below it, and south-west by Courtenay, Château-Renard and Montargis to Gien; the towns are the
      // Journal's, in its order, the ford's place and the roads no source's
      'france-1429-back-to-gien': route("Charles VII leads his army from Saint-Denis by Lagny, Provins, Bray, Courtenay and Montargis to Gien, 13–21 September 1429", 'france',
        [P.saintDenisAbbey, [2.50, 48.92], P.lagny, [2.90, 48.76], [3.12, 48.65], P.provins, [3.28, 48.48], P.bray, [3.27, 48.31],
          P.yonneFord, [3.17, 48.13], P.courtenay, P.chateauRenard, P.montargis, [2.68, 47.85], P.gien]),
    },
    markers: {
      'saint-denis-abbey': { lnglat: P.saintDenisAbbey, icon: 'church', color: 'france', label: 'Saint-Denis',
        image: 'saint-denis-basilica-04b381',
        note: "Joan offers her white armour to the abbey, September 1429" },
      'lagny-sep-1429': { lnglat: P.lagny, icon: 'flag', color: 'france', label: 'Lagny',
        note: "Charles VII crosses the Marne here, September 1429" },
      'provins-sep-1429': { lnglat: P.provins, icon: 'flag', color: 'france', label: 'Provins',
        note: "Charles VII's army comes here a day after Lagny" },
      'bray-1429': { lnglat: P.bray, icon: 'key', color: 'france', label: 'Bray',
        note: "Opens to Charles VII, and his army crosses, September 1429" },
      'sens-sep-1429': { lnglat: P.sens, icon: 'shield-x', color: 'english', label: 'Sens',
        note: "Shut to Charles VII; his army fords the Yonne below it" },
      'montargis-1429': { lnglat: P.montargis, icon: 'flag', color: 'france', label: 'Montargis',
        note: "On Charles VII's way from Courtenay to Gien, September 1429" },
      'gien-disbanded': { lnglat: P.gien, icon: 'flag-off', color: 'france', label: 'Gien',
        note: 'Charles VII\'s army is disbanded, 21 September 1429' },
    } },
  { dir: '040-saint-pierre-and-la-charite', id: 'saint-pierre-and-la-charite',
    title: 'Saint-Pierre-le-Moûtier and La Charité', date: 'October – December 1429', when: '1429-10',
    bbox: [1.9, 46.45, 3.65, 47.55],
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['france-1429-saint-pierre', 'france-1429-la-charite'],
    routeFiles: {
      // only the two ends are given: east across the Berry to the Allier and Saint-Pierre
      'france-1429-saint-pierre': route('Joan and Charles d\'Albret lead their force from Bourges to Saint-Pierre-le-Moûtier, October – November 1429', 'france',
        [P.bourges, [2.65, 47.00], [2.92, 46.88], P.saintPierre]),
      // south up the Allier to Moulins, where the letters of 9 November were written, and back north down the Allier
      // and the Loire to La Charité, east of the way out so the two legs stand apart
      'france-1429-la-charite': route('Joan and Charles d\'Albret go from Saint-Pierre-le-Moûtier by Moulins to besiege La Charité, November 1429', 'france',
        [P.saintPierre, [3.20, 46.67], P.moulins, [3.30, 46.72], [3.22, 46.90], [3.12, 47.06], P.laCharite]),
    },
    markers: {
      'mehun-1429': { lnglat: P.mehun, icon: 'crown', color: 'france', label: 'Mehun-sur-Yèvre',
        note: "Charles VII ennobles Joan and her family, December 1429" },
      'bourges-1429': { lnglat: P.bourges, icon: 'flag', color: 'france', label: 'Bourges',
        note: "Joan stays about three weeks and gathers her force" },
      'saint-pierre-le-moutier': { lnglat: P.saintPierre, icon: 'castle', color: 'france', label: 'Saint-Pierre-le-Moûtier',
        image: 'saint-pierre-le-moutier-church-c4ab4e',
        note: 'Taken by assault by 9 November 1429' },
      'moulins-1429': { lnglat: P.moulins, icon: 'scroll-text', color: 'france', label: 'Moulins',
        note: "Joan writes to Riom for powder and arrows, 9 November 1429" },
      'la-charite': { lnglat: P.laCharite, icon: 'castle', color: 'burgundy', label: 'La Charité',
        image: 'la-charite-priory-0f0654',
        note: "Besieged for about a month from November 1429; it holds" },
      'cosne-1429': { lnglat: P.cosne, icon: 'flag', color: 'burgundy', label: 'Cosne',
        note: "A town on the Loire held against Charles VII, autumn 1429" },
    } },
  { dir: '050-melun-and-lagny', id: 'melun-and-lagny',
    title: 'Melun and Lagny', date: 'March – May 1430', when: '1430-03',
    bbox: [2.0, 47.6, 3.1, 49.0],
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['joan-1430-lagny'],
    routeFiles: {
      // north from Sully across the Gâtinais to Melun on the Seine, and north to Lagny on the Marne; the towns are
      // Cagny's, her own answer's and Lowell's, the roads no source's
      'joan-1430-lagny': route('Joan rides with her company from Sully by Melun to Lagny, spring 1430', 'joan',
        [P.sully, [2.44, 47.98], [2.55, 48.28], P.melun, [2.70, 48.70], P.lagny]),
    },
    markers: {
      'sully-1430': { lnglat: P.sully, icon: 'flag', color: 'france', label: 'Sully',
        note: "Joan leaves the court here without leave, March 1430" },
      'melun-1430': { lnglat: P.melun, icon: 'key', color: 'france', label: 'Melun',
        image: 'melun-notre-dame-38fba4',
        note: "Drives out its garrison and comes over, about Easter 1430" },
      'lagny-1430': { lnglat: P.lagny, icon: 'shield', color: 'france', label: 'Lagny',
        note: "Joan defeats Franquet d'Arras near here, April or May 1430" },
    } },
  { dir: '060-compiegne', id: 'compiegne',
    title: 'Compiègne', date: 'May 1430', when: '1430-05',
    bbox: [2.65, 49.05, 3.4, 49.52], battle: 'compiegne-1430',
    zones: ['france-sep-1429', 'english-sep-1429', 'burgundy-1420', 'brittany-1407'],
    routes: ['joan-1430-compiegne', 'joan-1430-sortie', 'burgundy-1430-clairoix', 'english-1430-venette'],
    routeFiles: {
      // only the two ends are given: north from Crépy through the forest to the town on the left bank
      'joan-1430-compiegne': route('Joan rides by night from Crépy into Compiègne, May 1430', 'joan',
        [P.crepy, [2.88, 49.32], [2.85, 49.39], [2.832, 49.414]]),
      // over the bridge and along the causeway to Margny (her own answer, Monstrelet)
      'joan-1430-sortie': route('Joan sorties over the bridge of Compiègne against the Burgundian post at Margny, 23 May 1430', 'joan',
        [P.bridge, [2.824, 49.425], P.margny]),
      // only the two ends are given
      'burgundy-1430-clairoix': route('John of Luxembourg rides from Clairoix to Margny against the sortie, 23 May 1430', 'burgundy',
        [P.clairoix, [2.835, 49.435], P.margny]),
      // from Venette across the meadows to the end of the bridge, which no source places further
      'english-1430-venette': route('The English from Venette cut Joan off from the bridge of Compiègne, 23 May 1430', 'english',
        [P.venette, [2.815, 49.421], [2.826, 49.4205]]),
    },
    markers: {
      'choisy-1430': { lnglat: P.choisy, icon: 'flame', color: 'burgundy', label: 'Choisy', rank: 1,
        note: "Philip the Good takes and razes it, May 1430" },
      'compiegne-1430': { lnglat: P.compiegne, icon: 'castle', color: 'france', label: 'Compiègne', rank: 1,
        note: 'Joan rides in at sunrise and sorties that afternoon' },
      'coudun-1430': { lnglat: P.coudun, icon: 'tent', color: 'burgundy', label: 'Coudun', rank: 1,
        note: "The Duke of Burgundy's quarters, a league from Compiègne" },
      'clairoix-1430': { lnglat: P.clairoix, icon: 'tent', color: 'burgundy', label: 'Clairoix', rank: 2,
        note: "John of Luxembourg's quarters; Joan is kept here some days" },
      'margny-1430': { lnglat: P.margny, icon: 'tent', color: 'burgundy', label: 'Margny', rank: 3,
        note: "Joan drives the post back twice and is taken near it" },
      'venette-1430': { lnglat: P.venette, icon: 'tent', color: 'english', label: 'Venette', rank: 1,
        note: "English troops from here cut Joan off from the bridge" },
    } },
];

// The sources of each page are the plan's (text.yaml, each page's `sources`).
const plan = fs.readFileSync('content/joan-of-arc/.plan/050-paris-and-compiegne/text.yaml', 'utf8');
const planSources = id => {
  const at = plan.indexOf(`\n  ${id}:\n`);
  if (at < 0) throw new Error('no page ' + id + ' in text.yaml');
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
fs.writeFileSync(path.join(SEC, 'group.yaml'), HEAD + 'title: "Paris and Compiègne"\n');
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
console.log('section 050: wrote', pages.length, 'pages');
