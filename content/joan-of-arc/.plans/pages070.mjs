// Writes the page files, routes and markers of section 070, after-her. Run from the repo root:
//   node content/joan-of-arc/.plans/pages070.mjs
// Each page file it writes opens with a comment naming this script: change a page here and run it again, never by
// hand. The plan is content/joan-of-arc/.plan/070-after-her/{pages,map}.yaml. Every route is a reconstruction: the
// sources give the stations and no road, so each line joins its stations, as the comment over it says.
import fs from 'node:fs';
import path from 'node:path';

const SEC = 'content/joan-of-arc/pages/070-after-her';
const HEAD = '# Written by content/joan-of-arc/.plans/pages070.mjs. Change it there and run it again.\n';
const q = s => JSON.stringify(s);

// Image ids are the placed images' ids (the image-finder's), not the placeholders of the first draw.
// Places: the zone generator's points (zones.mjs, T) where it has the place, else the plan's coordinates.
const P = {
  paris: [2.352, 48.857], arras: [2.78, 50.29], rouen: [1.099, 49.443], caen: [-0.37, 49.183],
  cherbourg: [-1.62, 49.64], valognes: [-1.47, 49.51], carentan: [-1.25, 49.30], saint_lo: [-1.09, 49.12],
  formigny: [-0.90, 49.33], fougeres: [-1.20, 48.35], bordeaux: [-0.58, 44.84], bayonne: [-1.47, 43.49],
  castillon: [-0.04, 44.855], orleans: [1.909, 47.902], lyon: [4.83, 45.76],
  saint_denis: [2.36, 48.936], pontoise: [2.10, 49.05], dieppe: [1.08, 49.92],
  // Paris: Notre-Dame, the Porte Saint-Jacques and the Bastille Saint-Antoine, as the plan gives them
  notreDame: [2.350, 48.853], porteSaintJacques: [2.342, 48.846], bastille: [2.369, 48.853],
  // Domrémy as 010 and 020 mark it, on the edge of Bar that runs through the village
  domremy: [5.674, 48.443],
  // Rouen of 1456, the archbishop's palace by the cathedral, as the plan gives it
  rouen1456: [1.095, 49.440],
  // Isigny and Trévières, today's villages
  isigny: [-1.10, 49.317], trevieres: [-0.906, 49.309],
  // the Fords of Saint-Clément across the mouths of the Vire and the Douve below Carentan (the Baie des Veys):
  // no source places the passage closer than "below Carentan", so the point stands at the head of the bay, between
  // Carentan and Isigny, on the base map's land
  fords: [-1.17, 49.315],
  // the Médoc landing: Ramsay's cove is unplaced, Oman has the mouth of the Garonne, so the line starts on the Médoc
  // shore near the mouth of the Gironde (Soulac), and runs down the Médoc west of the estuary
  medoc: [-1.11, 45.49], medocMid: [-0.93, 45.25],
  // Branne on the south bank of the Dordogne
  branne: [-0.186, 44.829],
};

const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra },
  geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-burgundy-changes-sides', id: 'burgundy-changes-sides',
    title: 'Burgundy Changes Sides', date: 'December 1431 – October 1435', when: '1431-12',
    bbox: [0.6, 48.3, 4.2, 50.8],
    zones: ['france-1430', 'english-1430', 'burgundy-1430', 'brittany-1407'],
    routes: [], routeFiles: {},
    markers: {
      'notre-dame-1431': { lnglat: P.notreDame, icon: 'crown', color: 'english', label: 'Notre-Dame', rank: 2,
        image: 'henry-vi-paris-coronation-miniature-4faf00',
        note: 'Cardinal Beaufort crowns Henry VI King of France in this cathedral of Paris on Sunday 16 December 1431 (the Bourgeois of Paris and Ramsay; Monstrelet has the 17th), in a Paris that holds for him' },
      'arras-1435': { lnglat: P.arras, icon: 'scroll', color: 'burgundy', label: 'Arras', rank: 2,
        image: 'arras-peace-1435-miniature-fb0b58',
        note: "The congress sits in this town of the Duke of Burgundy in the summer of 1435; the English envoys leave on 6 September, and on 21 September Philip the Good seals his separate peace with Charles VII in its abbey of Saint-Vaast" },
      'saint-denis-1435': { lnglat: P.saint_denis, icon: 'shield', color: 'english', label: 'Saint-Denis', rank: 1,
        note: "Taken by Charles VII's French on 1 June 1435 and besieged by the English and the Burgundians; its garrison marches out with the honours of war on 4 October 1435 (Ramsay), and the town ends the year English again" },
      'rouen-1435': { lnglat: P.rouen, icon: 'map-pin', color: 'english', label: 'Rouen', rank: 1,
        note: "John, Duke of Bedford, regent of France for Henry VI, dies here in the night of 14 to 15 September 1435, while the congress sits at Arras; the news reaches Arras on the 16th" },
    } },
  { dir: '020-paris-opens', id: 'paris-opens',
    title: 'Paris Opens Its Gates', date: 'April 1436', when: '1436-04',
    bbox: [0.7, 48.4, 3.6, 50.1],
    zones: ['france-1436', 'english-1436', 'burgundy-1430', 'brittany-1407'],
    routes: ['richemont-1436-saint-denis'],
    routeFiles: {
      // Monstrelet has the force march from Pontoise toward Paris and storm Saint-Denis, Ramsay has it reported from
      // the quarter of Pontoise; no road is given, so the line joins the two places and stops at Saint-Denis
      'richemont-1436-saint-denis': route('Richemont, the Bastard of Orléans and L\'Isle-Adam march from Pontoise to Saint-Denis, April 1436', 'france',
        [P.pontoise, P.saint_denis]),
    },
    markers: {
      'paris-1436': { lnglat: P.paris, icon: 'flag', color: 'france', label: 'Paris', rank: 3,
        note: "Henry VI's capital since 1422 opens to Charles VII's men on Friday 13 April 1436: L'Isle-Adam climbs its wall by ladders the citizens let down, with the banner of Charles VII and a proclamation of amnesty, and Richemont enters" },
      'porte-saint-jacques-1436': { lnglat: P.porteSaintJacques, icon: 'door-open', color: 'france', label: 'the Porte Saint-Jacques', rank: 1,
        note: 'The gate of the left bank, toward Montlhéry, which the citizens open to Richemont, the Bastard of Orléans and L\'Isle-Adam on 13 April 1436' },
      'bastille-1436': { lnglat: P.bastille, icon: 'castle', color: 'english', label: 'the Bastille Saint-Antoine', rank: 1,
        image: 'bastille-saint-antoine-view-8a49b8',
        note: 'The English garrison under Lord Willoughby and Louis of Luxembourg shuts itself in here on 13 April 1436, treats with Richemont and marches out under his safe-conduct on 17 April, hooted by the Parisians' },
      'saint-denis-1436': { lnglat: P.saint_denis, icon: 'shield', color: 'france', label: 'Saint-Denis', rank: 2,
        note: "Stormed by Richemont's French and Burgundians in April 1436; near Épinay, a little beyond it, Sir Thomas Beaumont's sortie from Paris is routed and he is taken, and English survivors who held its Tour du Velin are put to death" },
      'pontoise-1436': { lnglat: P.pontoise, icon: 'map-pin', color: 'france', label: 'Pontoise', rank: 1,
        note: 'Lost by the English early in 1436 (Ramsay), with Charenton, Brie-Comte-Robert, Saint-Germain-en-Laye, Corbeil and Vincennes round Paris; the force that takes Paris marches from it (Monstrelet)' },
      'dieppe-1435': { lnglat: P.dieppe, icon: 'anchor', color: 'france', label: 'Dieppe', rank: 1,
        note: 'French from 29 October 1435, with all the Caux but Caudebec' },
    } },
  { dir: '030-normandy-won-back', id: 'normandy-won-back',
    title: 'Normandy Won Back', date: '1449 – 1450', when: '1449',
    bbox: [-2.3, 47.9, 1.9, 50.0],
    zones: ['france-1449', 'english-1449', 'burgundy-1430', 'brittany-1407'],
    battle: 'formigny-1450',
    routes: ['kyriell-1450-formigny', ['clermont-1450-formigny', 'richemont-1450-formigny']],
    routeFiles: {
      // Ramsay's stations: Cherbourg, Valognes, the sands of Saint-Clément, Formigny; Carentan, held by Clermont, is
      // no station, since the English passed it by the fords below it. No road is given, so the line joins them
      'kyriell-1450-formigny': route('Sir Thomas Kyriell marches from Cherbourg by Valognes and the Fords of Saint-Clément to Formigny, March – April 1450', 'english',
        [P.cherbourg, P.valognes, P.fords, P.formigny]),
      // Ramsay has the Count of Clermont follow the highway through Isigny, Beaucourt the road from Carentan to
      // Bayeux; the line joins the stations, and runs a little to the south of Kyriell's line (offset) where the two
      // share the last stretch to Formigny
      'clermont-1450-formigny': route('John, Count of Clermont, marches from Carentan by Isigny to Formigny, 15 April 1450', 'france',
        [P.carentan, P.isigny, P.formigny], { offset: 5 }),
      // Ramsay alone has Richemont march from Saint-Lô by Trévières; the line ends at the village and takes no side on
      // where he came on the field (070.19)
      'richemont-1450-formigny': route('Richemont marches from Saint-Lô by Trévières to Formigny, 15 April 1450', 'france',
        [P.saint_lo, P.trevieres, P.formigny]),
    },
    markers: {
      'fougeres-1449': { lnglat: P.fougeres, icon: 'flame', color: 'english', label: 'Fougères', rank: 1,
        image: 'fougeres-castle-2070d6',
        note: 'A force from the English garrisons of Normandy under François de Surienne seizes and sacks this rich town of Brittany on 24 March 1449, breaking the truce; French captains take Pont-de-l\'Arche, Conches and Gerberoy in reprisal' },
      'rouen-1449': { lnglat: P.rouen, icon: 'castle', color: 'france', label: 'Rouen', rank: 1,
        image: 'rouen-1449-entry-miniature-35d59e',
        note: 'The capital of English Normandy rises on 19 October 1449; Somerset signs a capitulation on 29 October and marches out on 4 November, and Charles VII makes his entry on 10 November 1449' },
      'caen-1450': { lnglat: P.caen, icon: 'castle', color: 'france', label: 'Caen', rank: 1,
        note: "Somerset's last town, besieged from early June 1450 and given up by articles of 24 June; on 1 July Richemont escorts Somerset out and Dunois takes possession, and Charles VII enters on 6 July" },
      'cherbourg-1450': { lnglat: P.cherbourg, icon: 'anchor', color: 'france', label: 'Cherbourg', rank: 1,
        note: 'The last English hold in Normandy, given up on 12 August 1450' },
    } },
  { dir: '040-castillon', id: 'castillon',
    title: 'Castillon', date: '1451 – October 1453', when: '1451',
    bbox: [-2.2, 42.6, 1.0, 45.9],
    zones: ['france-1452', 'english-1452', 'burgundy-1430', 'brittany-1407'],
    battle: 'castillon-1453',
    routes: ['talbot-1452-bordeaux', 'talbot-1453-castillon'],
    routeFiles: {
      // Ramsay has the landing in an unplaced cove of the Médoc, Oman at the mouth of the Garonne: the line starts on
      // the Médoc shore by the mouth of the Gironde and joins Bordeaux down the Médoc, with no road given
      'talbot-1452-bordeaux': route('John Talbot, Earl of Shrewsbury, lands in the Médoc and comes to Bordeaux, October 1452', 'english',
        [P.medoc, P.medocMid, P.bordeaux]),
      // the crossing at Branne is Ramsay's inference ("having doubtless crossed"); Beaucourt has Talbot march straight
      // on Castillon; the line joins the three places
      'talbot-1453-castillon': route('John Talbot, Earl of Shrewsbury, marches from Bordeaux by Branne to Castillon, 17 July 1453', 'english',
        [P.bordeaux, P.branne, P.castillon]),
    },
    markers: {
      'bayonne-1451': { lnglat: P.bayonne, icon: 'castle', color: 'france', label: 'Bayonne', rank: 1,
        note: 'The last English town of Gascony in 1451, besieged by the Counts of Foix and Dunois from 6 or 7 August and entered on 20 August (Ramsay; Beaucourt has the capitulation signed on the 20th and Dunois entering on the 21st)' },
      'bordeaux-1453': { lnglat: P.bordeaux, icon: 'castle', color: 'france', label: 'Bordeaux', rank: 2,
        note: "The capital of English Gascony: delivered to Dunois on 30 June 1451, it calls John Talbot back and opens to him in October 1452, taking the French seneschal Coëtivy; blockaded from 1 August 1453, it treats in early October, and Charles VII's officers take possession on 19 October 1453, which ends the war" },
    } },
  { dir: '050-the-retrial', id: 'the-retrial',
    title: 'The Sentence Annulled', date: 'November 1455 – 7 July 1456', when: '1455-11',
    bbox: [-0.2, 45.1, 6.4, 51.1],
    zones: ['france-1451', 'english-1451', 'burgundy-1430', 'brittany-1407', 'bar-1412', 'lorraine-1412'],
    routes: [], routeFiles: {},
    markers: {
      'notre-dame-1455': { lnglat: P.notreDame, icon: 'church', color: 'france', label: 'Notre-Dame', rank: 2,
        note: 'In this cathedral of Paris on 7 November 1455 Isabelle Romée, in mourning, with her sons Jean d\'Arc and Pierre d\'Arc, presents the papal rescript and her petition to the judges; a second public sitting follows on 17 November, and witnesses are heard at Paris in April and May 1456' },
      'domremy-1456': { lnglat: P.domremy, icon: 'house', color: 'france', label: 'Domrémy', rank: 1,
        note: 'Witnesses of Domrémy and Vaucouleurs are heard in January and February 1456' },
      'orleans-1456': { lnglat: P.orleans, icon: 'scroll', color: 'france', label: 'Orléans', rank: 1,
        note: 'Witnesses are heard here in February and March 1456; Isabelle Romée had lived here for fifteen years by 1455 (Lowell)' },
      'rouen-1456': { lnglat: P.rouen1456, icon: 'scale', color: 'france', label: 'Rouen', rank: 2,
        image: 'rouen-archbishop-palace-8a7b6b',
        note: "Guillaume Bouillé hears seven witnesses here on 4 and 5 March 1450, Guillaume d'Estouteville and Jean Bréhal open a second enquiry in late April and May 1452, and witnesses are heard in December 1455 and May 1456; on 7 July 1456, at eight o'clock, in its archbishop's palace, the judges declare the trial of 1431, the abjuration and the execution null" },
      'lyon-1456': { lnglat: P.lyon, icon: 'scroll', color: 'france', label: 'Lyon', rank: 1,
        note: "On 28 May 1456 a vice-inquisitor takes here the deposition of Jean d'Aulon, her squire" },
    } },
  { dir: '060-afterwards', id: 'afterwards',
    title: 'Afterwards', date: '1456 – 1920', when: '1456-08',
    bbox: [-2.0, 44.0, 7.0, 50.8],
    zones: [], routes: [], routeFiles: {},
    markers: {
      'orleans-8-may': { lnglat: P.orleans, icon: 'flag', color: 'france', label: 'Orléans', rank: 1,
        image: 'orleans-8-may-procession-8a3262',
        note: 'Each 8 May the city keeps the procession ordered after the relief of 1429, with candles, to the Augustins; its accounts pay for it, and for a play at its bridge, in 1435; a procession follows a fortnight after the sentence of 1456, and Félix Dupanloup preaches here on 8 May 1869' },
    } },
];

// The sources of each page are the plan's (text.yaml, each page's `sources`).
const plan = fs.readFileSync('content/joan-of-arc/.plan/070-after-her/text.yaml', 'utf8');
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
fs.writeFileSync(path.join(SEC, 'group.yaml'), HEAD + 'title: "After Her"\n');
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
console.log('section 070: wrote', pages.length, 'pages');
