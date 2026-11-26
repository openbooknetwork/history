// Writes the page files, routes and markers of section 010 france-divided. Run from the repo root:
//   node content/joan-of-arc/.plans/pages010.cjs
// A page of 010 is changed here and written again, never by hand. The sources lines of a page.yaml that already
// exists are kept, so a reviewer's edit to them survives a rerun. The markers of 010 are the block of
// content/joan-of-arc/shared/markers.yaml between "# --- 010" and "# --- end 010": only that block is rewritten.
// Every zone is the map keeper's (.plans/zones.mjs); this script lists them as map.yaml of 010 gives them.
const fs = require('fs');
const path = require('path');
const { fix } = require('./router.cjs');

const STORY = 'content/joan-of-arc';
const SEC = path.join(STORY, 'pages/010-france-divided');
const SCRIPT = 'content/joan-of-arc/.plans/pages010.cjs';
fs.mkdirSync(SEC, { recursive: true });
fs.writeFileSync(path.join(SEC, 'group.yaml'), `# Written by ${SCRIPT}.\ntitle: "France divided, 1407–1424"\n`);

const q = s => JSON.stringify(s);

// The works, as sources.md names them.
const MON = ch => `Enguerrand de Monstrelet, Chronicles, tr. T. Johnes (1849), ${ch}.`;
const BEAU1 = ch => `G. du Fresne de Beaucourt, Histoire de Charles VII, vol. 1 (1881), ${ch}.`;
const BEAU2 = ch => `G. du Fresne de Beaucourt, Histoire de Charles VII, vol. 2 (1882), ${ch}.`;
const LANG = ch => `Andrew Lang, The Maid of France (1909), ${ch}.`;
const LOWELL = ch => `Francis C. Lowell, Joan of Arc (1896), ${ch}.`;
const RAMSAY = ch => `J. H. Ramsay, Lancaster and York, vol. 1 (1892), ${ch}.`;
const WYLIE2 = ch => `J. H. Wylie, The Reign of Henry the Fifth, vol. 2 (1919), ${ch}.`;
const WYLIE3 = ch => `J. H. Wylie and W. T. Waugh, The Reign of Henry the Fifth, vol. 3 (1929), ${ch}.`;
const OMAN = ch => `Charles Oman, A History of the Art of War in the Middle Ages, vol. 2 (1924), ${ch}.`;
const BOURG = s => `Journal d'un bourgeois de Paris 1405–1449, ed. A. Tuetey (1881), ${s}.`;
const PUCELLE = ch => `Chronique de la Pucelle, ed. A. Vallet de Viriville (1859), ${ch}.`;
const CAGNY = ch => `Perceval de Cagny, Chroniques, ed. H. Moranvillé (1902), ${ch}.`;
const WIKI = t => `Wikipedia, "${t}".`;

// Places, [longitude, latitude], from the notes of map.yaml and today's maps.
const P = {
  paris: [2.360, 48.858], lille: [3.063, 50.637],
  domremy: [5.674, 48.442], vaucouleurs: [5.667, 48.602], maxey: [5.697, 48.448],
  harfleur: [0.198, 49.507], montivilliers: [0.190, 49.545], fecamp: [0.375, 49.757], arques: [1.125, 49.880],
  eu: [1.420, 50.047], blancheTaque: [1.742, 50.139], bethencourt: [2.957, 49.795], peronne: [2.934, 49.930],
  albert: [2.652, 50.002], frevent: [2.287, 50.276], blangyTernoise: [2.170, 50.418],
  maisoncelles: [2.148, 50.447], agincourt: [2.128, 50.463], calais: [1.858, 50.951],
  touques: [0.103, 49.345], caen: [-0.370, 49.183],
  leLude: [0.157, 47.646], bauge: [-0.103, 47.541], beaufort: [-0.218, 47.440],
  couasnonBridge: [-0.119, 47.528], vieilBauge: [-0.116, 47.533],
  auxerre: [3.567, 47.798], champs: [3.600, 47.737], cravantBridge: [3.684, 47.684],
  ivry: [1.461, 48.885], verneuil: [0.928, 48.739], tours: [0.689, 47.394], nonancourt: [1.197, 48.771],
};

const route = (name, color, coords) => ({ type: 'Feature',
  properties: { name, style: 'solid', arrows: true, color }, geometry: { type: 'LineString', coordinates: coords } });

const pages = [
  { dir: '010-murder-in-paris', title: 'Murder in Paris', date: 'November 1407', when: '1407-11',
    bbox: [-5.0, 42.3, 8.0, 51.3], zones: ['france-1407', 'english-1407', 'burgundy-1407', 'brittany-1407'],
    routes: [], markers: ['paris-1407', 'lille-1407'],
    sources: [MON('book 1, the murder of the Duke of Orléans'), BEAU1('ch. 5'), LANG('ch. 1'), LOWELL('ch. 1')] },
  { dir: '020-domremy', title: 'Domrémy on the Meuse', date: 'About 1412', when: '1412',
    bbox: [4.9, 47.95, 6.5, 48.95],
    zones: ['france-1412', 'english-1407', 'burgundy-1407', 'brittany-1407', 'lorraine-1412', 'bar-1412'],
    routes: [], markers: ['domremy', 'vaucouleurs-1412', 'maxey-1412'],
    sources: [
      "W. P. Barrett (tr.), The Trial of Jeanne d'Arc (1932), the public sessions of 21, 22 and 24 February 1431.",
      "T. Douglas Murray (ed. and tr.), Jeanne d'Arc, Maid of Orleans (1902), part 2, the depositions at Domrémy, 1455.",
      'J. Quicherat (ed.), Procès de condamnation et de réhabilitation de Jeanne d\'Arc, vol. 5 (1849), the letter of Perceval de Boulainvilliers to the Duke of Milan.',
      LOWELL('ch. 2'), LANG('ch. 2'),
      'Herbert Thurston, "Saint Joan of Arc", The Catholic Encyclopedia, vol. 8 (1910).',
      WIKI('Domrémy-la-Pucelle')] },
  { dir: '030-harfleur-and-agincourt', title: 'Harfleur and Agincourt', date: 'August – October 1415', when: '1415-08',
    bbox: [-0.6, 48.95, 3.5, 51.2], zones: ['france-1412', 'english-1407', 'burgundy-1407', 'brittany-1407'],
    routes: ['henry-v-1415-calais'], markers: ['harfleur-1415', 'blanche-taque-1415', 'bethencourt-1415', 'calais-1415'],
    battle: 'agincourt-1415',
    sources: [RAMSAY('ch. 15'), WYLIE2('ch. 30 and 34'), OMAN('book 14 ch. 1'),
      'Henrici Quinti Angliae regis gesta, ed. B. Williams (1850).',
      MON('book 1, the siege of Harfleur and the battle of Azincourt'), BOURG('§129–130'), LOWELL('ch. 1'), LANG('ch. 1'),
      WIKI('Battle of Agincourt')],
    routeFiles: {
      // Ramsay's stations; between the ford near Blanche-Taque and Béthencourt the line keeps to the south bank of
      // the Somme, up past Amiens and round the bend below Péronne, as Oman has the army mount the river.
      'henry-v-1415-calais': route('Henry V marches from Harfleur to Calais, October 1415', 'english',
        [P.harfleur, P.montivilliers, P.fecamp, [0.75, 49.84], P.arques, P.eu, [1.62, 50.10], [1.70, 50.115],
          [1.80, 50.095], [1.91, 50.045], [2.06, 49.975], [2.14, 49.935], [2.30, 49.880], [2.50, 49.895],
          [2.72, 49.925], [2.90, 49.905], [2.935, 49.85], P.bethencourt, [2.975, 49.85], P.peronne, P.albert,
          [2.48, 50.14], P.frevent, P.blangyTernoise, P.maisoncelles, P.agincourt, [2.05, 50.65], [1.93, 50.82], P.calais]),
    } },
  { dir: '040-normandy-and-troyes', title: 'Normandy, Montereau and Troyes', date: 'August 1417 – June 1420',
    when: '1417-08', bbox: [-5.0, 42.3, 8.0, 51.3],
    zones: ['france-1420', 'english-1420', 'burgundy-1420', 'brittany-1407', 'lorraine-1412', 'bar-1412'],
    routes: ['henry-v-1417-caen'],
    markers: ['caen-1417', 'paris-1418', 'bourges-1418', 'rouen-1419', 'mont-saint-michel-1419', 'montereau-1419',
      'troyes-1420', 'melun-1420', 'meaux-1420', 'soissons-1420', 'compiegne-1420'],
    sources: [RAMSAY('ch. 17–19'), WYLIE3('ch. 51, 62 and 63'), BEAU1('ch. 2 and 5'), OMAN('book 14 ch. 1'),
      LOWELL('ch. 1–2'), LANG('ch. 1')],
    routeFiles: {
      // Touques to Caen along the coast, as Wylie and Waugh give it; the villages between are not named.
      'henry-v-1417-caen': route('Henry V lands at Touques and marches on Caen, August 1417', 'english',
        [P.touques, [0.00, 49.315], [-0.10, 49.280], [-0.20, 49.250], [-0.27, 49.220], P.caen]),
    } },
  { dir: '050-two-kings', title: 'Baugé and the Two Kings', date: 'March 1421 – November 1422', when: '1421-03',
    bbox: [-1.2, 46.5, 3.6, 49.4], zones: ['france-1420', 'english-1420', 'burgundy-1420', 'brittany-1407'],
    routes: ['dauphin-1421-bauge', 'clarence-1421-bauge'],
    markers: ['meaux-1422', 'vincennes-1422', 'paris-1422', 'saint-denis-1422', 'mehun-1422', 'bourges-1422'],
    battle: 'bauge-1421',
    sources: [WYLIE3('ch. 69'), RAMSAY('ch. 20–22'), OMAN('book 14 ch. 1–2'), BEAU1('ch. 7'), BEAU2('book 2 ch. 2'),
      PUCELLE('ch. 182'), CAGNY('Baugé'), BOURG('§361 and 369, 1422'), LOWELL('ch. 1'), LANG('ch. 1'),
      'Anatole France, The Life of Joan of Arc, tr. W. Stephens (1909), vol. 2 ch. 3.', WIKI('Battle of Baugé')],
    routeFiles: {
      'dauphin-1421-bauge': route('The army of the Dauphin Charles, with its Scots, from Le Lude to Baugé, March 1421',
        'france', [P.leLude, [0.03, 47.60], P.bauge]),
      'clarence-1421-bauge': route('Thomas, Duke of Clarence, rides from Beaufort-en-Vallée to Baugé, March 1421',
        'english', [P.beaufort, [-0.17, 47.49], P.couasnonBridge, P.vieilBauge]),
    } },
  { dir: '060-cravant-and-verneuil', title: 'Cravant and Verneuil', date: 'June 1423 – August 1424', when: '1423-07',
    bbox: [0.0, 47.0, 4.4, 49.3], zones: ['france-1422', 'english-1420', 'burgundy-1420', 'brittany-1407'],
    routes: ['salisbury-1423-cravant', 'france-1424-verneuil', 'bedford-1424-verneuil'],
    markers: ['auxerre-1423', 'cravant-1423', 'ivry-1424', 'verneuil-1424'],
    battle: 'verneuil-1424',
    sources: [RAMSAY('ch. 22–23'), OMAN('book 14 ch. 2'), BEAU2('book 2 ch. 1'), MON('book 2, the battle of Crevant'),
      BOURG('§404–405 and note 757, 1423–1424'), PUCELLE('ch. 4 and the battle of Verneuil'),
      CAGNY('the battle of Verneuil'), LANG('ch. 1'), LOWELL('ch. 1'), WIKI('Battle of Cravant'),
      WIKI('Battle of Verneuil')],
    routeFiles: {
      // Ramsay: up the right bank of the Yonne from Auxerre, over to the left bank probably at Champs, and up to
      // the bridge of Cravant; the route ends on the left bank, across the water from the French.
      'salisbury-1423-cravant': route("The Earl of Salisbury's English and the Burgundians march on Cravant, July 1423",
        'english', [P.auxerre, [3.576, 47.796], [3.590, 47.775], [3.603, 47.752], [3.609, 47.739], P.champs,
          [3.618, 47.725], [3.640, 47.712], [3.660, 47.698], [3.675, 47.688], P.cravantBridge]),
      // Cagny's and Beaucourt's stations; the road from Tours to Nonancourt is not given and runs direct.
      'france-1424-verneuil': route('The army of Charles VII from Tours by Nonancourt to Verneuil, August 1424',
        'france', [P.tours, P.nonancourt, P.verneuil]),
      // Both ends are sourced; the road between is not, and runs direct.
      'bedford-1424-verneuil': route('John, Duke of Bedford, marches from Ivry to Verneuil, August 1424', 'english',
        [P.ivry, P.verneuil]),
    } },
];

// The markers of 010, in the order of the pages.
const M = (lnglat, icon, color, label, note, rank, image) => ({ lnglat, icon, color, label, note, rank, image });
const markers = {
  'paris-1407': M(P.paris, 'skull', 'france', 'Paris',
    'Louis, Duke of Orléans, is murdered by the Porte Barbette, 23 November 1407', 5, 'louis-of-orleans-murder-miniature'),
  'lille-1407': M(P.lille, 'castle', 'burgundy', 'Lille', 'John the Fearless withdraws here after owning to the murder of Louis, Duke of Orléans (Lang)', 3),
  'domremy': M(P.domremy, 'house', 'france', 'Domrémy',
    "Joan's village, one parish with Greux, of the king's party; she is born here about 1412", 5, 'domremy-birthplace-house'),
  'vaucouleurs-1412': M(P.vaucouleurs, 'castle', 'france', 'Vaucouleurs',
    "The walled town and castle down the Meuse, held for the king's party", 4),
  'maxey-1412': M(P.maxey, 'house', 'burgundy', 'Maxey',
    'The Burgundian village across the Meuse, whose boys fought the boys of Domrémy', 3),
  'harfleur-1415': M(P.harfleur, 'anchor', 'english', 'Harfleur',
    'Henry V lands by the Chef de Caux from 14 August 1415 and takes the town on 22 September', 5),
  'blanche-taque-1415': M(P.blancheTaque, 'waves', 'france', 'Blanche-Taque',
    "The ford of the Somme, found held against Henry V's army, 13 October 1415", 2),
  'bethencourt-1415': M(P.bethencourt, 'footprints', 'france', 'Béthencourt',
    "Henry V's army crosses the Somme, 19 October 1415 (Oman)", 3),
  'calais-1415': M(P.calais, 'castle', 'english', 'Calais', "The English town Henry V's army reaches, 29 October 1415 (Ramsay)", 4),
  'caen-1417': M(P.caen, 'castle', 'english', 'Caen',
    'Taken by assault on 4 September 1417, its castle on 20 September', 4),
  'paris-1418': M([2.352, 48.857], 'flame', 'burgundy', 'Paris',
    'The Burgundians take the city, May – June 1418, and massacre the Armagnacs, Bernard, Count of Armagnac, among them', 4),
  'bourges-1418': M([2.399, 47.081], 'crown', 'france', 'Bourges', 'Where the Dauphin Charles flees in 1418 (Lang)', 4),
  'rouen-1419': M([1.099, 49.443], 'castle', 'english', 'Rouen',
    'Besieged by Henry V from 29 July 1418, starved, surrenders on 19 January 1419', 5),
  'mont-saint-michel-1419': M([-1.511, 48.636], 'church', 'france', 'Mont-Saint-Michel',
    'The one place in Normandy left to the French at the end of 1419', 3),
  'montereau-1419': M([2.952, 48.385], 'skull', 'france', 'Montereau',
    'John the Fearless is killed at his meeting with the Dauphin Charles on the bridge, 10 September 1419', 5,
    'montereau-bridge-murder-miniature'),
  'troyes-1420': M([4.074, 48.297], 'scroll-text', 'english', 'Troyes',
    'Treaty of Troyes, sealed in its cathedral on 21 May 1420; Henry V marries Catherine of Valois here on 2 June (Ramsay)', 5,
    'troyes-cathedral'),
  'melun-1420': M([2.660, 48.540], 'shield', 'france', 'Melun',
    'Held for the Dauphin Charles inside the land that obeys Henry V, 1420 (Ramsay)', 2),
  'meaux-1420': M([2.878, 48.960], 'shield', 'france', 'Meaux',
    'Held for the Dauphin Charles inside the land that obeys Henry V, 1420 (Ramsay)', 2),
  'soissons-1420': M([3.323, 49.381], 'shield', 'france', 'Soissons',
    'Held for the Dauphin Charles inside the land that obeys Henry V, 1420 (Ramsay)', 2),
  'compiegne-1420': M([2.826, 49.418], 'shield', 'france', 'Compiègne',
    'Held for the Dauphin Charles inside the land that obeys Henry V, 1420 (Ramsay)', 2),
  'meaux-1422': M([2.878, 48.960], 'castle', 'english', 'Meaux',
    'Henry V besieges the town, October 1421 – May 1422, and takes there the dysentery that kills him (Oman)', 3),
  'vincennes-1422': M([2.435, 48.843], 'cross', 'english', 'Vincennes', 'Henry V dies in its castle, 31 August 1422', 3),
  'paris-1422': M([2.362, 48.853], 'crown', 'english', 'Paris',
    'Charles VI dies in his hôtel of Saint-Pol, 21 October 1422; John, Duke of Bedford, rides back into the city as regent', 3),
  'saint-denis-1422': M([2.360, 48.935], 'church', 'english', 'Saint-Denis',
    'Charles VI is buried in the abbey, 11 November 1422, and a herald cries Henry VI King of France and England', 4),
  'mehun-1422': M([2.215, 47.144], 'crown', 'france', 'Mehun-sur-Yèvre',
    'The Dauphin Charles takes the title of King, as Charles VII, 30 October 1422 (Beaucourt)', 4, 'mehun-sur-yevre-castle'),
  'bourges-1422': M([2.399, 47.081], 'castle', 'france', 'Bourges',
    'Charles VII\'s long stays here give his enemies their nickname for him, the "King of Bourges" (Beaucourt)', 3),
  'auxerre-1423': M(P.auxerre, 'castle', 'burgundy', 'Auxerre',
    "The Burgundian town where the Earl of Salisbury's English join the Burgundians, July 1423", 3),
  'cravant-1423': M([3.689, 47.683], 'swords', 'burgundy', 'Cravant',
    'The English and Burgundians wade the Yonne and carry the bridge, and the army of Charles VII breaks, 31 July 1423', 5),
  'ivry-1424': M(P.ivry, 'castle', 'english', 'Ivry', 'The castle John, Duke of Bedford, besieges in summer 1424', 3),
  'verneuil-1424': M(P.verneuil, 'castle', 'france', 'Verneuil',
    "Taken by the French, August 1424: by a ruse (the Bourgeois, Beaucourt), or opened by its townsmen to the Duke of Alençon (Cagny)", 3),
};

const list = a => '[' + a.map(x => Array.isArray(x) ? list(x) : x).join(', ') + ']';
for (const p of pages) {
  const dir = path.join(SEC, p.dir);
  fs.mkdirSync(dir, { recursive: true });
  let y = `# Written by ${SCRIPT}: change the page there and run it again.\n` +
    `title: ${q(p.title)}\n` +
    `date: ${q(p.date)}\n` +
    `when: ${p.when}\n` +
    `bbox: [${p.bbox.join(', ')}]\n` +
    `zones: ${list(p.zones)}\n` +
    `routes: ${list(p.routes)}\n` +
    `markers: ${list(p.markers)}\n`;
  if (p.battle) y += `battle: ${p.battle}\n`;
  const old = fs.existsSync(path.join(dir, 'page.yaml')) ? fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8') : '';
  const kept = old.match(/^sources:\n(?:  - .*\n)+/m);
  y += kept ? kept[0] : 'sources:\n' + p.sources.map(s => `  - ${q(s)}\n`).join('');
  fs.writeFileSync(path.join(dir, 'page.yaml'), y);
  if (p.routeFiles) {
    fs.mkdirSync(path.join(dir, 'routes'), { recursive: true });
    for (const [id, f] of Object.entries(p.routeFiles)) {
      f.properties = { id, ...f.properties };
      f.geometry.coordinates = fix('land', f.geometry.coordinates);
      fs.writeFileSync(path.join(dir, 'routes', id + '.geojson'), JSON.stringify(f) + '\n');
    }
  }
}

// The block of 010 in shared/markers.yaml.
const FILE = path.join(STORY, 'shared/markers.yaml');
const START = '# --- 010 france-divided, 1407–1424: written by ' + SCRIPT + ' ---';
const END = '# --- end 010 ---';
let block = START + '\n';
for (const [id, m] of Object.entries(markers)) {
  block += `${id}:\n  lnglat: [${m.lnglat.join(', ')}]\n  icon: ${m.icon}\n  color: ${m.color}\n` +
    `  label: ${q(m.label)}\n  note: ${q(m.note)}\n  rank: ${m.rank}\n` + (m.image ? `  image: ${m.image}\n` : '');
}
block += END + '\n';
const HEAD = '# Markers that pages switch on by id. lnglat is [longitude, latitude].\n' +
  '# One id has one note: a place marked again on another page takes an id of its own. Each section\'s block is\n' +
  '# written by its generator in .plans/ and is changed there.\n';
let text = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : HEAD;
const re = /^# --- 010 [^\n]*\n[\s\S]*?^# --- end 010 ---\n/m;
text = re.test(text) ? text.replace(re, block) : text.replace(/\n*$/, '\n') + block;
fs.writeFileSync(FILE, text);
