// Writes the page files, routes and markers of section 020, the-road-to-chinon. Run from the repo root:
//   node content/joan-of-arc/.plans/pages020.mjs
// Each page file it writes opens with a comment naming this script: change a page here and run it again, never by
// hand. The plan is content/joan-of-arc/.plan/020-the-road-to-chinon/{pages,map}.yaml. Every route is a
// reconstruction: the sources give the stations and no road, and the comment over each says what the line follows.
import fs from 'node:fs';
import path from 'node:path';

const SEC = 'content/joan-of-arc/pages/020-the-road-to-chinon';
const HEAD = '# Written by content/joan-of-arc/.plans/pages020.mjs. Change it there and run it again.\n';
const q = s => JSON.stringify(s);

// Places, as the plan's markers give them, and the zone generator's points where it has the same place.
const P = {
  domremy: [5.674, 48.443], vaucouleurs: [5.667, 48.602], neufchateau: [5.696, 48.356], burey: [5.666, 48.562],
  saintUrbain: [5.19, 48.40], nancy: [6.18, 48.69], saintNicolas: [6.30, 48.63],
  paris: [2.352, 48.857], chartres: [1.489, 48.447], etampes: [2.16, 48.43], janville: [1.88, 48.20],
  meung: [1.70, 47.83], beaugency: [1.633, 47.776], jargeau: [2.13, 47.86], sully: [2.38, 47.77],
  orleans: [1.90, 47.90], tourelles: [1.907, 47.896], portereau: [1.905, 47.892], rouvray: [1.946, 48.267],
  blois: [1.335, 47.586], auxerre: [3.57, 47.80], gien: [2.63, 47.69], fierbois: [0.656, 47.157],
  chinon: [0.242, 47.167], poitiers: [0.34, 46.58], tours: [0.69, 47.392],
};

const route = (name, color, coords, extra = {}) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color, ...extra },
  geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-the-voices', id: 'the-voices',
    title: 'The Voices and Vaucouleurs', date: '1424 or 1425 to July 1428', when: '1424',
    bbox: [3.9, 47.8, 6.6, 49.3],
    zones: ['france-1428', 'english-1428', 'burgundy-1420', 'brittany-1407', 'lorraine-1412', 'bar-1412'],
    routes: ['joan-1428-vaucouleurs', 'joan-1428-neufchateau', 'vergy-1428'],
    routeFiles: {
      // down the Meuse valley, by Maxey and Burey, on the west bank (Poulengy's visit, Lowell's doubt)
      'joan-1428-vaucouleurs': route('Joan goes to Robert de Baudricourt at Vaucouleurs, May 1428', 'joan',
        [P.domremy, [5.664, 48.48], [5.662, 48.53], P.burey, P.vaucouleurs]),
      // up the Meuse valley, by Coussey, to the Duke of Lorraine's walled town
      'joan-1428-neufchateau': route("Joan's family flees from Domrémy to Neufchâteau, July 1428", 'joan',
        [P.domremy, [5.685, 48.405], [5.70, 48.38], P.neufchateau], { offset: 4 }),
      // no road given: straight from the Marne to the Meuse
      'vergy-1428': route("Antoine de Vergy's force marches on Vaucouleurs, July 1428", 'english',
        [P.saintUrbain, P.vaucouleurs]),
    },
    markers: {
      'domremy-voices': { lnglat: P.domremy, icon: 'church', color: 'france', label: 'Domrémy',
        note: 'Joan first hears the voice in her father\'s garden' },
      'vaucouleurs-1428': { lnglat: P.vaucouleurs, icon: 'castle', color: 'france', label: 'Vaucouleurs',
        image: 'vaucouleurs-castle-hill-fabfe6', rank: 2,
        note: 'Robert de Baudricourt sends Joan home, May 1428' },
      neufchateau: { lnglat: P.neufchateau, icon: 'house', color: 'lorraine', label: 'Neufchâteau',
        note: 'The people of Domrémy flee here with their cattle' },
      'vergy-review-1428': { lnglat: P.saintUrbain, icon: 'flag', color: 'english', label: 'Saint-Urbain',
        note: 'Antoine de Vergy reviews his force, 16–17 July 1428' },
    },
    sources: [
      "The Trial of Jeanne d'Arc, tr. W. P. Barrett (1932), the public examination of 22 February 1431, with P. Champion's sketch of Robert de Baudricourt.",
      "T. Douglas Murray (ed. and tr.), Jeanne d'Arc, Maid of Orleans (1902), the depositions of Durand Laxart and Bertrand de Poulengy.",
      'F. C. Lowell, Joan of Arc (1896), ch. 3 and 4.',
      'A. Lang, The Maid of France (1908), ch. 2, 4 and 5.',
      'H. Thurston, "St. Joan of Arc", Catholic Encyclopedia (1910).',
    ] },
  { dir: '020-salisbury-on-the-loire', id: 'salisbury-on-the-loire',
    title: 'Salisbury on the Loire', date: 'July 1428 to February 1429', when: '1428-07',
    bbox: [1.0, 47.45, 2.9, 48.95], battle: 'herrings-1429',
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: ['salisbury-1428', 'fastolf-1429', ['clermont-1429', 'orleans-van-1429']],
    routeFiles: {
      // Paris to Chartres by the Beauce road, south-east to Janville, down to the Loire at Meung and Beaugency; over
      // Beaugency's bridge and up the south bank to the Portereau. Only the order of the towns is the sources'.
      'salisbury-1428': route("The Earl of Salisbury's campaign to Orléans, August – October 1428", 'english',
        [P.paris, [2.10, 48.75], [1.80, 48.60], P.chartres, [1.65, 48.33], P.janville, [1.78, 48.02], P.meung,
          P.beaugency, [1.63, 47.765], [1.70, 47.815], [1.78, 47.848], [1.85, 47.876], P.portereau]),
      // Ramsay: the first day to Étampes, the second night at Rouvray, by Angerville
      'fastolf-1429': route("Sir John Fastolf's convoy of herrings, February 1429", 'english',
        [P.paris, [2.30, 48.70], [2.22, 48.55], P.etampes, [2.06, 48.35], [2.00, 48.31], P.rouvray]),
      // no road given: straight across the Beauce from Blois
      'clermont-1429': route("Charles, Count of Clermont's relief force, February 1429", 'france',
        [P.blois, P.rouvray]),
      // no road given: straight from the city to the field
      'orleans-van-1429': route('The men of Orléans ride out to the Count of Clermont, February 1429', 'france',
        [P.orleans, P.rouvray]),
    },
    markers: {
      'meung-1428': { lnglat: P.meung, icon: 'castle', color: 'english', label: 'Meung', rank: 2,
        note: 'Entered by the English about 8 September 1428' },
      'beaugency-1428': { lnglat: P.beaugency, icon: 'castle', color: 'english', label: 'Beaugency', rank: 1,
        note: 'Its bridge and castle taken by Salisbury, 25 September 1428' },
      'jargeau-1428': { lnglat: P.jargeau, icon: 'castle', color: 'english', label: 'Jargeau',
        note: 'Taken by Sir John de la Pole, 5 October 1428' },
      'sully-1428': { lnglat: P.sully, icon: 'castle', color: 'burgundy', label: 'Sully',
        note: 'Georges de La Trémoille\'s town, surrendered in autumn 1428' },
      'orleans-besieged': { lnglat: P.orleans, icon: 'shield', color: 'france', label: 'Orléans', rank: 2,
        note: 'Besieged by the English from 12 October 1428' },
      'tourelles-1428': { lnglat: P.tourelles, icon: 'castle', color: 'english', label: 'The Tourelles', rank: 1,
        note: 'Taken by the English, 24 October 1428; Salisbury is struck' },
    },
    sources: [
      "Journal du siège d'Orléans, in J. Quicherat (ed.), Procès de condamnation et de réhabilitation de Jeanne d'Arc, vol. 4 (1847).",
      'E. de Monstrelet, Chronicles, tr. T. Johnes (1849), book 2, ch. 52 and 56.',
      "Journal d'un bourgeois de Paris 1405-1449, ed. A. Tuetey (1881), 1429.",
      'J. H. Ramsay, Lancaster and York, vol. 1 (1892), ch. 26.',
      'C. Oman, A History of the Art of War in the Middle Ages, vol. 2 (1924), book 14, ch. 2.',
      'F. C. Lowell, Joan of Arc (1896), ch. 7.',
    ] },
  { dir: '030-vaucouleurs-again', id: 'vaucouleurs-again',
    title: 'Vaucouleurs Again', date: 'January and February 1429', when: '1429-01',
    bbox: [5.2, 48.25, 6.6, 48.95],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407', 'lorraine-1412', 'bar-1412'],
    routes: ['joan-1429-burey', 'joan-1429-nancy'],
    routeFiles: {
      // down the Meuse valley, as in May 1428, stopping at Laxart's village
      'joan-1429-burey': route('Durand Laxart brings Joan back by Burey to Vaucouleurs, January 1429', 'joan',
        [P.domremy, [5.664, 48.48], [5.662, 48.53], P.burey, P.vaucouleurs]),
      // no road given: out to the shrine south of the return, on to Nancy, and straight back
      'joan-1429-nancy': route('Joan goes to the shrine of Saint-Nicolas-de-Port and to the Duke of Lorraine at Nancy, February 1429', 'joan',
        [P.vaucouleurs, [5.95, 48.58], P.saintNicolas, P.nancy, [5.92, 48.67], P.vaucouleurs]),
    },
    markers: {
      'vaucouleurs-1429': { lnglat: P.vaucouleurs, icon: 'castle', color: 'france', label: 'Vaucouleurs',
        note: 'Robert de Baudricourt at last sends Joan to Charles VII' },
      // the start of joan-1429-burey's last leg; no rank, so Vaucouleurs, 4 km north, leads
      'burey-1429': { lnglat: P.burey, icon: 'house', color: 'france', label: 'Burey',
        note: "Durand Laxart's village, where Joan stays" },
      'nancy-1429': { lnglat: P.nancy, icon: 'landmark', color: 'lorraine', label: 'Nancy', rank: 2,
        image: 'nancy-ducal-palace-54c40d',
        note: 'The Duke of Lorraine asks Joan about his health' },
      'saint-nicolas-de-port': { lnglat: P.saintNicolas, icon: 'church', color: 'lorraine', label: 'Saint-Nicolas-de-Port',
        rank: 1, image: 'saint-nicolas-de-port-church-38d98d',
        note: 'Joan comes on pilgrimage to the shrine' },
    },
    sources: [
      "T. Douglas Murray (ed. and tr.), Jeanne d'Arc, Maid of Orleans (1902), the depositions of Jean de Metz, Durand Laxart, Catherine and Henri Le Royer and Bertrand de Poulengy.",
      "The Trial of Jeanne d'Arc, tr. W. P. Barrett (1932), the public examination of 22 February 1431, with P. Champion's sketches.",
      "Journal du siège d'Orléans, in J. Quicherat (ed.), Procès, vol. 4 (1847).",
      'F. C. Lowell, Joan of Arc (1896), ch. 4.',
      'A. Lang, The Maid of France (1908), ch. 7.',
    ] },
  { dir: '040-eleven-days', id: 'eleven-days',
    title: 'Eleven Days to Chinon', date: 'February or March 1429', when: '1429-02',
    bbox: [-0.2, 46.8, 6.2, 49.0],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407', 'lorraine-1412', 'bar-1412'],
    routes: ['joan-1429-chinon'],
    routeFiles: {
      // from the Meuse west to the Marne at Saint-Urbain, south-west across Champagne to Auxerre, west to Gien on the
      // Loire, then across the Sologne south of the river (Lowell) to Fierbois and Chinon. No crossing is named.
      'joan-1429-chinon': route('Joan rides with six men from Vaucouleurs to Chinon, February or March 1429', 'joan',
        [P.vaucouleurs, [5.42, 48.50], P.saintUrbain, [4.70, 48.18], [4.15, 47.98], P.auxerre, [3.15, 47.74], P.gien,
          [2.30, 47.50], [1.80, 47.35], [1.20, 47.22], P.fierbois, [0.45, 47.16], P.chinon]),
    },
    markers: {
      'vaucouleurs-departure': { lnglat: P.vaucouleurs, icon: 'flag', color: 'france', label: 'Vaucouleurs',
        image: 'vaucouleurs-porte-de-france-1521c9',
        note: 'Joan rides out in men\'s clothes, with six men' },
      'saint-urbain': { lnglat: P.saintUrbain, icon: 'church', color: 'english', label: 'Saint-Urbain',
        note: 'Joan sleeps her first night at this abbey on the Marne' },
      'auxerre-1429': { lnglat: P.auxerre, icon: 'church', color: 'burgundy', label: 'Auxerre',
        image: 'auxerre-cathedral-32875a',
        note: 'The Burgundian city where Joan hears mass' },
      'gien-1429': { lnglat: P.gien, icon: 'castle', color: 'france', label: 'Gien',
        note: 'Holds for Charles VII; word of Joan goes on to Orléans' },
      'fierbois-letter': { lnglat: P.fierbois, icon: 'mail', color: 'france', label: 'Sainte-Catherine-de-Fierbois',
        rank: 1, note: 'Joan hears three masses and writes to Charles VII' },
      'chinon-arrival': { lnglat: P.chinon, icon: 'castle', color: 'france', label: 'Chinon', rank: 2,
        note: 'Joan arrives towards noon, 23 February or 6 March' },
    },
    sources: [
      "The Trial of Jeanne d'Arc, tr. W. P. Barrett (1932), the public examinations of 22 and 27 February 1431.",
      "T. Douglas Murray (ed. and tr.), Jeanne d'Arc, Maid of Orleans (1902), the depositions of Jean de Metz, Henri Le Royer, Bertrand de Poulengy and Dunois.",
      'The French Continuator of Guillaume de Nangis, in J. Quicherat (ed.), Procès, vol. 4 (1847).',
      'F. C. Lowell, Joan of Arc (1896), ch. 4 and 5.',
      'A. Lang, The Maid of France (1908), ch. 7 and 8.',
    ] },
  { dir: '050-chinon-and-poitiers', id: 'chinon-and-poitiers',
    title: 'Chinon and Poitiers', date: 'Late February or March to April 1429', when: '1429-03',
    bbox: [-0.4, 46.3, 2.2, 48.0],
    zones: ['france-siege-1428', 'english-siege-1428', 'burgundy-1420', 'brittany-1407'],
    routes: ['joan-1429-blois'],
    routeFiles: {
      // no roads given: south to Poitiers and back with the court a little to the east, so the two ways stand apart,
      // then up the Loire by Tours to Blois
      'joan-1429-blois': route('Joan goes to Poitiers, back to Chinon, and by Tours to Blois, March – April 1429', 'joan',
        [P.chinon, [0.20, 46.88], P.poitiers, [0.42, 46.88], [0.33, 47.12], P.chinon, [0.45, 47.28], P.tours,
          [0.92, 47.43], [1.12, 47.51], P.blois]),
    },
    markers: {
      'chinon-audience': { lnglat: P.chinon, icon: 'crown', color: 'france', label: 'Chinon', image: 'chinon-castle-3d41a9',
        note: 'Joan knows Charles VII among many' },
      'poitiers-examination': { lnglat: P.poitiers, icon: 'book-open', color: 'france', label: 'Poitiers',
        note: 'Churchmen examine Joan and find nothing against the faith' },
      'tours-armour': { lnglat: P.tours, icon: 'shield', color: 'france', label: 'Tours',
        note: 'Joan gets armour, a household and a banner, mid-April 1429' },
      'fierbois-sword': { lnglat: P.fierbois, icon: 'sword', color: 'france', label: 'Sainte-Catherine-de-Fierbois',
        image: 'fierbois-church-25956f',
        note: 'Joan\'s sword is found behind the altar, as she asked' },
      'blois-gathering': { lnglat: P.blois, icon: 'flag', color: 'france', label: 'Blois',
        note: 'The convoy for Orléans gathers, late April 1429' },
    },
    sources: [
      "The Trial of Jeanne d'Arc, tr. W. P. Barrett (1932), the public examinations of 22 and 27 February 1431.",
      "T. Douglas Murray (ed. and tr.), Jeanne d'Arc, Maid of Orleans (1902), the depositions of Dunois, Gaucourt, Pasquerel and Seguin.",
      'Joan of Arc, letter to the English, 22 March 1429, Fordham Medieval Sourcebook.',
      'F. C. Lowell, Joan of Arc (1896), ch. 5 and 6.',
      'A. Lang, The Maid of France (1908), ch. 8 to 10.',
      'G. du Fresne de Beaucourt, Histoire de Charles VII, vol. 2 (1882), book 2, ch. 5.',
    ] },
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
fs.writeFileSync(path.join(SEC, 'group.yaml'), HEAD + 'title: "The Road to Chinon"\n');
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
console.log('section 020: wrote', pages.length, 'pages');
