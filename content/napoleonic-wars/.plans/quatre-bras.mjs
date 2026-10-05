// Quatre Bras, 16 June 1815. The crossroads of the Charleroi–Brussels and Nivelles–Namur roads, held by the
// allies against Ney coming up the Brussels road from Frasnes. Gemioncourt lies on the road south of the
// crossroads, Pierrepont and the Bossu wood to the west, Piraumont to the east. Overview: the approaches and
// d'Erlon's march towards Ligny and back.
// Frame: origin at the crossroads, u north and w east, so E(x, y) places a point x metres east and y metres north.
// Farm and wood positions are approximate, to a hundred metres or two.
import { frame, writePlan } from './lib.mjs';

const f = frame([4.4533, 50.5714], 0), E = (x, y) => f.p(y, x);
const G = 'pages/110-hundred-days/020-ligny';
const bbox = f.box([[-3500, -2400], [1500, 2400]], 0);
const ring = (x, y, r) => [[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r], [x - r, y - r]].map(([a, b]) => E(a, b));
const works = [
  { side: 'neutral', path: [[-800, -3500], [-450, -2200], [-90, -1040], [0, 0], [150, 1200], [300, 2400]].map(([x, y]) => E(x, y)), width: 25, id: 'brussels-road', name: 'The road from Charleroi to Brussels' },
  { side: 'neutral', path: [[-2400, 900], [-1200, 400], [0, 0], [1200, -250], [2400, -450]].map(([x, y]) => E(x, y)), width: 25, id: 'namur-road', name: 'The road from Nivelles to Namur' },
  { side: 'neutral', path: ring(-90, -1040, 45), width: 20, id: 'gemioncourt', name: 'Gemioncourt farm' },
  { side: 'neutral', path: ring(-1150, -1480, 45), width: 20, id: 'pierrepont', name: 'Pierrepont farm' },
  { side: 'neutral', path: ring(1390, -600, 45), width: 20, id: 'piraumont', name: 'Piraumont' },
];
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const unit = (side, type, x, y, width, depth, facing, id, name, extra = {}) => ({ side, type, at: E(x, y), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts.map(([x, y]) => E(x, y)), width, id, name, ...(style ? { style } : {}) });
const mark = (x, y, label, note, color, icon = 'user') => ({ lnglat: E(x, y), icon, color, label, note });

// --- overview: the approaches on 15 and 16 June ---
writePlan(`${G}/040-quatre-bras`, {
  routes: {
    'ney-quatre-bras-1815': { name: 'Ney with Reille’s II Corps advances from Gosselies by Frasnes, 15 – 16 June 1815',
      path: [[4.43, 50.47], [4.44, 50.51], [4.442, 50.543], [4.451, 50.56]] },
    'derlon-ligny-1815': { name: 'd’Erlon’s I Corps turns east towards Ligny, 16 June 1815',
      path: [[4.43, 50.49], [4.47, 50.5], [4.505, 50.51], [4.53, 50.512]] },
    'derlon-return-1815': { name: 'd’Erlon’s I Corps is called back towards Quatre Bras, 16 June 1815', style: 'dashed',
      path: [[4.53, 50.517], [4.5, 50.527], [4.47, 50.535], [4.446, 50.546]] },
    'picton-quatre-bras-1815': { name: 'Picton’s division and the Brunswickers come down the Brussels road, 16 June 1815',
      path: [[4.43, 50.66], [4.45, 50.61], [4.454, 50.578]] },
    'alten-quatre-bras-1815': { name: 'Alten’s and Cooke’s divisions come from Nivelles, 16 June 1815',
      path: [[4.33, 50.6], [4.38, 50.59], [4.42, 50.58], [4.448, 50.574]] },
  },
  markers: {
    'quatre-bras-frasnes': { lnglat: [4.442, 50.543], icon: 'flag', color: 'france', label: 'Frasnes', note: 'The lancers turned back, 15 June' },
    'quatre-bras-nivelles': { lnglat: [4.33, 50.6], icon: 'flag', color: 'britain', label: 'Nivelles' },
    'quatre-bras-ligny': { lnglat: [4.5814, 50.5203], icon: 'swords', color: 'france', label: 'Ligny', note: 'Napoleon against Blücher' },
  },
});

// --- 14:00 to 16:30: Ney attacks ---
writePlan(`${G}/050-quatre-bras-ney`, {
  bbox,
  emblem: {
    works,
    units: [
      unit('france', 'artillery', 100, -1950, 350, 100, 0, 'battery', 'Ney’s battery of 22 guns', { count: 6 }),
      unit('france', 'infantry', 950, -1350, 900, 300, 350, 'bachelu', 'Bachelu’s division, east of the road'),
      unit('france', 'infantry', -50, -1350, 800, 300, 0, 'foy', 'Foy’s division at Gemioncourt'),
      unit('france', 'infantry', -1450, -1850, 900, 300, 20, 'jerome', 'Prince Jérôme’s 6th Division'),
      unit('france', 'cavalry', 650, -2500, 600, 250, 0, 'pire', 'Piré’s light cavalry'),
      unit('britain', 'infantry', -800, -750, 700, 300, 190, 'nassau', 'Saxe-Weimar’s Nassauers in the Bossu wood'),
      unit('britain', 'infantry', -50, -700, 600, 250, 180, 'bylandt', 'Bylandt’s Dutch-Belgian brigade'),
      unit('britain', 'infantry', 950, -550, 1300, 250, 180, 'picton', 'Picton’s British 5th Division, with Pack’s 42nd and 44th'),
      unit('britain', 'infantry', -250, 200, 600, 250, 190, 'brunswick', 'The Brunswick corps'),
      unit('britain', 'cavalry', 450, 250, 450, 200, 180, 'merlen', 'Van Merlen’s Dutch light cavalry'),
    ],
    arrows: [
      arrow('france', [[-50, -1180], [-50, -1000], [-50, -850]], 140, 'foy-attack', 'Foy attacks Gemioncourt'),
      arrow('france', [[-1400, -1680], [-1200, -1300], [-1000, -950]], 140, 'jerome-attack', 'Jérôme drives the Nassauers into the wood'),
      arrow('france', [[950, -1180], [950, -950], [950, -700]], 140, 'bachelu-attack', 'Bachelu attacks Picton'),
      arrow('britain', [[400, 120], [300, -400], [150, -1100]], 130, 'merlen-charge', 'The Prince of Orange leads van Merlen’s charge, thrown back'),
      arrow('britain', [[-300, 50], [-350, -250], [-400, -500]], 110, 'brunswick-charge', 'The Duke of Brunswick’s charge, which fails', 'dashed'),
    ],
    clashes: [E(-50, -925), E(-1050, -950), E(950, -800)],
  },
  markers: {
    'quatre-bras-16-ney': mark(-500, -2900, 'Ney', 'Commands the French left wing', 'france'),
    'quatre-bras-16-wellington': mark(700, 1100, 'Wellington', 'Takes command at 15:00', 'britain'),
    'quatre-bras-16-brunswick': mark(-1100, 900, 'Duke of Brunswick', 'Mortally wounded', 'britain', 'skull'),
    'quatre-bras-16-bossu': mark(-1700, -300, 'Bossu wood', 'Held by the Nassauers', 'britain', 'trees'),
  },
});

// --- 17:00 to 21:00: Kellermann's charge and Wellington's counter-attack ---
writePlan(`${G}/060-quatre-bras-wellington`, {
  bbox,
  emblem: {
    works,
    units: [
      unit('france', 'cavalry', -300, -2000, 500, 250, 10, 'kellermann', 'Kellermann’s cuirassiers, driven back from the crossroads'),
      unit('france', 'infantry', 700, -1350, 1300, 300, 0, 'reille', 'Foy’s and Bachelu’s divisions'),
      unit('france', 'infantry', -1400, -1800, 900, 300, 20, 'jerome', 'Jérôme’s division, driven from the Bossu wood'),
      unit('france', 'cavalry', -2400, -1400, 500, 250, 60, 'pire', 'Piré’s lancers'),
      unit('britain', 'infantry', -1000, -1100, 900, 250, 190, 'guards', 'Cooke’s Guards Division clears the Bossu wood'),
      unit('britain', 'infantry', -350, -350, 700, 200, 190, 'halkett', 'Halkett’s brigade of Alten’s 3rd Division'),
      unit('britain', 'infantry', -900, 600, 900, 250, 160, 'alten', 'Alten’s 3rd Division, arrived from Nivelles at 17:00'),
      unit('britain', 'infantry', 950, -550, 1300, 250, 180, 'picton', 'Picton’s division'),
      unit('britain', 'infantry', 300, 250, 500, 200, 190, 'brunswick', 'Brunswickers at the crossroads'),
      unit('britain', 'artillery', 100, -150, 220, 80, 180, 'allied-guns', 'Allied guns at the crossroads', { count: 4 }),
    ],
    arrows: [
      arrow('france', [[-250, -1800], [-150, -1000], [-200, -500]], 160, 'kellermann-charge', 'Kellermann’s cuirassiers charge to the crossroads'),
      arrow('france', [[-2250, -1350], [-1800, -1250], [-1450, -1150]], 140, 'pire-charge', 'Piré’s lancers catch the Guards as they leave the wood'),
      arrow('britain', [[-800, 450], [-850, -300], [-950, -900]], 160, 'guards-advance', 'The Guards advance through the Bossu wood'),
      arrow('britain', [[950, -700], [900, -950], [850, -1150]], 140, 'allied-advance', 'The allies push the French back'),
    ],
    clashes: [E(-230, -440), E(-1450, -1150)],
  },
  markers: {
    'quatre-bras-17-ney': mark(-500, -2900, 'Ney', 'Recalls d’Erlon, too late', 'france'),
    'quatre-bras-17-kellermann': mark(-1300, -2500, 'Kellermann', 'Leads one cuirassier brigade', 'france'),
    'quatre-bras-17-69th': mark(-1700, -150, '69th Foot', 'Loses its King’s colour', 'britain', 'flag'),
    'quatre-bras-17-wellington': mark(700, 1100, 'Wellington', 'Counter-attacks with the Guards', 'britain'),
  },
});

console.log('quatre-bras: bbox', JSON.stringify(bbox));
