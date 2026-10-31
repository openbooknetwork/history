// Nicopolis, 25 September 1396: the crusaders north on the plateau above the town, the Ottomans south on the higher
// ground. The ground comes from elevation data, the order of the lines from the modern reconstructions (README.md).
// Frame: origin at the middle of the Ottoman stakes, u east along the lines, w south from the crusaders to the Ottomans.
import { frame, writePlan } from './lib.mjs';

const f = frame([24.899, 43.6625], 90), P = f.p, CHR = f.face(90), OTT = f.face(270);
const G = 'pages/030-nicopolis-1396/030-nicopolis';
// from the Danube to Bayezid's hill, about 8.7 km by 8.6 km: the same on every phase page
const bbox = [24.845, 43.6355, 24.953, 43.7125];
// the Danube's middle and the Osam's valley floor, traced from the elevation data
const DANUBE = [[24.62, 43.746], [24.67, 43.735], [24.71, 43.729], [24.74, 43.726], [24.77, 43.719], [24.8, 43.7135], [24.83, 43.7135], [24.86, 43.708], [24.89, 43.709], [24.92, 43.7155],
  [24.95, 43.7185], [24.98, 43.7235], [25.02, 43.728], [25.06, 43.73], [25.1, 43.731], [25.16, 43.728]];
const OSAM = [[24.842, 43.713], [24.845, 43.706], [24.846, 43.7], [24.842, 43.693], [24.84, 43.685], [24.84, 43.678], [24.843, 43.67],
  [24.848, 43.663], [24.853, 43.655], [24.851, 43.647], [24.849, 43.64], [24.846, 43.632], [24.845, 43.624], [24.846, 43.616],
  [24.85, 43.608], [24.855, 43.598]];
const rivers = (danube, osam) => [
  { path: DANUBE, width: danube, id: 'danube', name: 'The Danube' },
  { path: OSAM, width: osam, id: 'osam', name: 'The Osam, which flows into the Danube west of the town' },
];
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: ['ottomans', 'serbia'].includes(side) ? OTT : CHR, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
// a marker beside the block at (u, w), moved dE metres east and dN north, so its label below the icon clears the blocks
const mark = (u, w, dE, dN, label, note, color, icon = 'user') => ({ lnglat: P(u + dE, w - dN), icon, color, label, note });
const toward = ([u0, w0], [u1, w1]) => f.face(Math.round(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI));

const RECON = 'The accounts give no position for them in the line';
const STAKES = { side: 'ottomans', path: f.path([[-900, 70], [900, 70]]), width: 40, style: 'trench', id: 'stakes', name: 'Rows of sharpened stakes in front of the Ottoman foot' };
const SERBS = unit('serbia', 'knights', -1900, 1350, 700, 250, 'serbs', `Stefan Lazarević with about 1,500 Serbian heavy horsemen, held back out of sight. ${RECON}`);
const BAYEZID = unit('ottomans', 'infantry', 1000, 2250, 800, 300, 'bayezid', 'Bayezid with the janissaries and the horsemen of his household on the hill behind his army');
const AZAPS_BACK = unit('ottomans', 'infantry', -500, 2250, 1200, 250, 'azaps', 'The azaps, who have fled behind the sipahis');

// --- overview: the town, the camps and the field between them ---
writePlan(`${G}/010-nicopolis`, {
  bbox: [24.78, 43.6, 25.0, 43.76],
  emblem: { water: rivers(700, 100) },
  markers: {
    'nicopolis-camp': { lnglat: P(-2000, -2700), icon: 'flag', color: 'hungary', label: 'Crusader camp', note: '12–25 September 1396' },
    'nicopolis-bayezid-camp': { lnglat: P(1000, 2250), icon: 'flag', color: 'ottomans', label: 'Bayezid’s camp', note: 'On the heights south of the town' },
    'nicopolis-turnu': { lnglat: [24.876, 43.727], icon: 'castle', color: 'hungary', label: 'Little Nicopolis (Turnu)', note: 'Hungarian garrison from 1395' },
    'nicopolis-ships': { lnglat: [24.935, 43.716], icon: 'ship', color: 'venice', label: 'Venetian ships', note: 'Close the river to the town' },
  },
  show: ['nicopolis-1396'],
});

// --- the French charge through the akıncıs and the azaps behind their stakes ---
writePlan(`${G}/020-nicopolis-charge`, {
  bbox,
  emblem: {
    water: rivers(700, 60),
    works: [STAKES],
    units: [
      unit('crusaders', 'knights', 0, -250, 750, 200, 'french-vanguard', 'The French vanguard under the Count of Eu, with mounted archers, among the stakes'),
      unit('crusaders', 'knights', -150, -700, 900, 220, 'french-main', 'The French main body under John of Nevers and Enguerrand de Coucy'),
      unit('hungary', 'knights', 700, -2700, 1600, 350, 'sigismund', 'Sigismund with the Hungarians, the Germans and the Knights Hospitaller, still drawn up behind the French'),
      unit('hungary', 'cavalry', -1900, -2700, 800, 300, 'transylvanians', `The Transylvanians. ${RECON}`),
      unit('wallachia', 'cavalry', 2200, -2600, 900, 300, 'wallachians', `Mircea’s Wallachians. ${RECON}`),
      unit('ottomans', 'light', -2300, -450, 700, 200, 'akinci', 'Akıncı light horsemen. Their screen in front of the Ottoman line breaks before the French charge'),
      unit('ottomans', 'light', 2300, -450, 700, 200, 'akinci', 'Akıncı light horsemen. Their screen in front of the Ottoman line breaks before the French charge'),
      AZAPS_BACK,
      unit('ottomans', 'cavalry', -750, 1550, 1200, 350, 'sipahis', 'Sipahis, the horsemen of the provinces, kept in reserve behind the crest out of sight'),
      unit('ottomans', 'cavalry', 950, 1550, 1200, 350, 'sipahis', 'Sipahis, the horsemen of the provinces, kept in reserve behind the crest out of sight'),
      BAYEZID,
      SERBS,
    ],
    arrows: [
      arrow('crusaders', [[-350, -2400], [-450, -1750], [-200, -1100], [0, -420]], 160, 'french-charge', 'The French charge south across the head of the ravine and up the slope, without waiting for Sigismund'),
      arrow('ottomans', [[-500, -1100], [-1400, -1100], [-1950, -600]], 90, 'akinci-off', 'The akıncıs ride off to the flanks', 'dashed'),
      arrow('ottomans', [[500, -1100], [1400, -1100], [1950, -600]], 90, 'akinci-off', 'The akıncıs ride off to the flanks', 'dashed'),
      arrow('ottomans', [[0, 120], [0, -350], [0, -800]], 70, 'azap-fire', 'The azaps shoot into the French as they come up the slope', 'fire'),
      arrow('ottomans', [[0, 250], [-100, 1100], [-300, 2050]], 110, 'azaps-flee', 'The azaps leave their stakes and flee behind the sipahis', 'dashed'),
    ],
    clashes: [{ at: P(-300, -60), size: 200 }],
  },
  markers: {
    'nicopolis-charge-eu': mark(0, -250, 1550, 0, 'Count of Eu', 'Leads the French vanguard', 'crusaders'),
    'nicopolis-charge-nevers': mark(-150, -700, -1100, -250, 'John of Nevers', 'The main body, with Coucy', 'crusaders'),
    'nicopolis-charge-sigismund': mark(700, -2700, -1500, 1100, 'Sigismund', 'Asks the French to wait', 'hungary'),
    'nicopolis-charge-azaps': mark(-500, 2250, -1200, 100, 'Azaps', 'Flee from the stakes', 'ottomans', 'swords'),
    'nicopolis-charge-bayezid': mark(1000, 2250, 1050, 100, 'Bayezid', 'On the hill with his household', 'ottomans'),
  },
  show: ['nicopolis-1396'],
});

// --- the French reach the top of the slope, the sipahis break them, Nevers and the French lords are taken ---
writePlan(`${G}/030-nicopolis-sipahis`, {
  bbox,
  emblem: {
    water: rivers(700, 60),
    works: [STAKES],
    units: [
      unit('crusaders', 'infantry', 0, 700, 1000, 250, 'french', 'The French knights, more than half of them on foot, on the top of the slope'),
      unit('hungary', 'knights', 700, -2000, 1600, 350, 'sigismund', 'Sigismund’s main body advances to support the French'),
      unit('hungary', 'cavalry', -1900, -2000, 800, 300, 'transylvanians', `The Transylvanians. ${RECON}`),
      unit('wallachia', 'cavalry', 2200, -1900, 900, 300, 'wallachians', `Mircea’s Wallachians. ${RECON}`),
      unit('ottomans', 'cavalry', 0, 1080, 1400, 300, 'sipahis', 'The sipahis charge from behind the crest with trumpets, kettle drums and the tekbir'),
      unit('ottomans', 'cavalry', -2350, -650, 800, 300, 'sipahi-flanks', 'Sipahis and akıncıs ride down along the flanks of the crusader army'),
      unit('ottomans', 'cavalry', 2750, -550, 800, 300, 'sipahi-flanks', 'Sipahis and akıncıs ride down along the flanks of the crusader army'),
      AZAPS_BACK,
      BAYEZID,
      SERBS,
    ],
    arrows: [
      arrow('crusaders', [[0, -150], [0, 250], [0, 520]], 140, 'french-climb', 'The French climb on after the fleeing azaps, believing they have beaten Bayezid’s whole army'),
      arrow('ottomans', [[0, 1500], [0, 1200], [0, 860]], 140, 'sipahi-charge', 'The sipahis come over the crest and charge the French'),
      arrow('crusaders', [[-400, 560], [-450, -300], [-350, -1300]], 100, 'french-flee', 'Some of the French flee back down the slope', 'dashed'),
      arrow('ottomans', [[-1500, 1500], [-2350, 700], [-2350, -400]], 110, 'sipahi-flank', 'Sipahis ride down along the flanks of the crusader army'),
      arrow('ottomans', [[1600, 1500], [2750, 700], [2750, -300]], 110, 'sipahi-flank', 'Sipahis ride down along the flanks of the crusader army'),
    ],
    clashes: [{ at: P(0, 875), size: 220 }],
  },
  markers: {
    'nicopolis-sipahis-vienne': mark(0, 700, -1400, 850, 'Jean de Vienne', 'Killed with the French banner', 'crusaders', 'skull'),
    'nicopolis-sipahis-nevers': mark(0, 700, 1650, 850, 'John of Nevers', 'Taken with Coucy, Eu and Boucicaut', 'crusaders'),
    'nicopolis-sipahis-sigismund': mark(700, -2000, -1500, 1150, 'Sigismund', 'Advances with the main body', 'hungary'),
  },
  show: ['nicopolis-1396'],
});

// --- the sipahis close round Sigismund, the Serbs charge, the rout to the Danube ---
writePlan(`${G}/040-nicopolis-serbs`, {
  bbox,
  emblem: {
    water: rivers(700, 60),
    works: [STAKES],
    units: [
      unit('hungary', 'knights', 500, -1700, 1600, 350, 'sigismund', 'Sigismund’s main body: the Hungarians, the Germans and the Knights Hospitaller fight against the encircling sipahis and are overwhelmed'),
      unit('hungary', 'cavalry', -3000, -3700, 800, 250, 'transylvanians', 'The Transylvanians leave the field'),
      unit('wallachia', 'cavalry', 2300, -3700, 900, 250, 'wallachians', 'Mircea’s Wallachians leave the field'),
      unit('venice', 'ships', -1500, -4980, 1400, 300, 'ships', 'Venetian and Hospitaller galleys on the Danube', { facing: 150, count: 5 }),
      unit('ottomans', 'cavalry', 500, -1300, 1400, 300, 'sipahis', 'The sipahis press Sigismund’s main body from the front'),
      unit('ottomans', 'cavalry', 1800, -2600, 900, 300, 'sipahi-flanks', 'Sipahis close round the crusaders from the flank and the rear', { facing: toward([1800, -2600], [600, -1700]) }),
      unit('serbia', 'knights', -500, -1700, 700, 250, 'serbs', 'Stefan Lazarević’s Serbian heavy horsemen strike the Hungarian centre, where Nicholas Garai’s troops hold the royal banner', { facing: f.face(0) }),
      AZAPS_BACK,
      BAYEZID,
    ],
    arrows: [
      arrow('serbia', [[-1900, 1100], [-2150, 200], [-1800, -900], [-1100, -1550], [-650, -1700]], 150, 'serbs-charge', 'The Serbs charge into the Hungarian centre. Schiltberger, who fought on the Hungarian side, writes that they brought down the king’s banner'),
      arrow('hungary', [[-1900, -2200], [-2500, -2900], [-2950, -3450]], 100, 'transylvanians-leave', 'Seeing riderless horses run back through the lines, the Transylvanians leave the field', 'dashed'),
      arrow('wallachia', [[2200, -2100], [2350, -2900], [2300, -3450]], 100, 'wallachians-leave', 'Mircea’s Wallachians leave the field', 'dashed'),
      arrow('hungary', [[200, -1950], [-500, -3000], [-1500, -3900], [-2400, -4500], [-2700, -4800]], 130, 'rout', 'The crusaders flee to the Danube, where many drown trying to reach the boats', 'dashed'),
      arrow('hungary', [[1000, -1950], [900, -3200], [200, -4300], [-700, -4800], [-1100, -4950]], 100, 'sigismund-escape', 'Sigismund and the Master of the Hospitallers escape in a fishing boat to the Venetian ships', 'dashed'),
    ],
    clashes: [{ at: P(500, -1490), size: 220 }, { at: P(-400, -1700), size: 200 }, { at: P(1300, -2250), size: 200 }],
  },
  markers: {
    'nicopolis-serbs-lazarevic': mark(-500, -1700, -1100, 650, 'Stefan Lazarević', 'Brings down the king’s banner', 'serbia'),
    'nicopolis-serbs-sigismund': mark(500, -1700, 1500, -200, 'Sigismund', 'Escapes to the Venetian ships', 'hungary'),
    'nicopolis-serbs-mircea': mark(2300, -3700, 1150, 0, 'Mircea', 'The Wallachians leave the field', 'wallachia'),
  },
  show: ['nicopolis-1396'],
});

console.log('nicopolis: bbox', JSON.stringify(bbox), 'stakes at', JSON.stringify(P(0, 70)), 'card at', JSON.stringify(P(0, -1000)));
