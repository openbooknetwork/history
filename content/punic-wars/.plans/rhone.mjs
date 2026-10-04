// Hannibal's march to Italy, 218 BC, and the battle of the Rhône Crossing, placed between Avignon and Orange,
// four days' march from the sea (Lancel's reading of Polybius, followed by the Wikipedia article).
// Frame: origin on the river at Roquemaure, u north (upstream), w east (from Hannibal towards the Volcae).
import { frame, writePlan } from './lib.mjs';

const f = frame([4.785, 44.05], 0), P = f.p;
const G = 'pages/040-second-war/010-invasion/010-alps';
const bbox = f.box([[-6500, -5200], [8600, 5400]], 0);
const EAST = f.face(90), WEST = f.face(270);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 130, style) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}) });
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, note });
const river = { path: f.path([[-11000, 1100], [-5000, 600], [0, 0], [4000, -1300], [8000, -2900], [11000, -3800]]), width: 500, id: 'rhone', name: 'The Rhône' };

// --- overview: the whole march, and the Scipios ---
writePlan(`${G}/010-alps`, {
  bbox: [-2.0, 37.0, 11.0, 46.3],
  routes: {
    'hannibal-218-iberia': { name: 'Hannibal marches from New Carthage over the Ebro and the Pyrenees, June to August 218 BC',
      path: [[-0.98, 37.6], [-0.6, 38.3], [-0.35, 38.9], [-0.28, 39.67], [-0.05, 40.05], [0.35, 40.5], [0.52, 40.81], [0.9, 41.0], [1.25, 41.12], [2.17, 41.38], [2.82, 41.98], [2.86, 42.46], [2.97, 42.6]] },
    'hannibal-218-gaul': { name: 'Through the land of the Volcae to the Rhône, September 218 BC',
      path: [[2.97, 42.6], [2.9, 42.7], [3.0, 43.18], [3.22, 43.34], [3.88, 43.61], [4.36, 43.84], [4.6, 43.98], P(0, -2600)] },
    'hannibal-218-alps': { name: 'Up the Rhône and over the Alps by a debated pass, October 218 BC', style: 'dashed',
      path: [P(1000, 1500), [4.82, 44.45], [4.85, 44.75], [4.88, 44.95], [5.2, 44.75], [5.65, 44.62], [6.08, 44.56], [6.5, 44.57], [6.85, 44.74], [7.07, 44.7], [7.35, 44.66], [7.49, 44.75], [7.6, 44.92], [7.68, 45.07]] },
    'scipio-218': { name: 'Publius Scipio sails from Pisae to the Rhône and marches up to Hannibal’s empty camp, September 218 BC',
      path: [[10.38, 43.7], [9.5, 43.55], [8.0, 43.3], [6.5, 42.95], [5.37, 43.22], [4.82, 43.43], [4.76, 43.75], P(-1500, 2200)] },
    'scipio-218-back': { name: 'Publius Scipio returns by sea to Pisae and goes north to the Po', offset: 6,
      path: [P(-1600, 2300), [4.77, 43.75], [4.84, 43.43], [5.37, 43.24], [6.5, 43.0], [8.0, 43.48], [8.93, 44.38], [9.6, 44.05], [10.38, 43.72], [10.5, 44.2], [9.95, 44.85], [9.69, 45.05]] },
    'gnaeus-218': { name: 'Gnaeus Scipio takes the consular army on to Emporion, autumn 218 BC',
      path: [[5.37, 43.24], [4.5, 42.9], [3.6, 42.45], [3.12, 42.13]] },
  },
  markers: { 'alps-island': { lnglat: [4.88, 44.97], icon: 'mountain', color: 'carthage', label: 'The Island', note: 'Where the Isère meets the Rhône' } },
  show: ['new-carthage-219', 'emporion-218', 'massalia-218', 'traversette-218', 'taurini-218'],
});

// --- Hanno's night march upstream ---
const westBank = [n(unit('carthage', 'camp', -300, -3300, 1200, 900, 0), 'camp', 'Hannibal’s camp on the west bank'),
  n(unit('carthage', 'infantry', -300, -1900, 3000, 400, EAST), 'infantry', 'Carthaginian infantry, about 38,000, waiting to cross'),
  n(unit('carthage', 'cavalry', 2300, -2200, 800, 250, EAST), 'cavalry', 'Carthaginian cavalry, about 8,000')];
writePlan(`${G}/020-rhone-hanno`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...westBank, n(unit('carthage', 'elephants', -2400, -2600, 700, 140, EAST), 'elephants', 'The 37 elephants'),
      n(unit('carthage', 'ships', 0, -900, 3000, 360, EAST, { count: 12, rows: 2 }), 'boats', 'Boats and rafts bought and built for the crossing'),
      n(unit('gauls', 'infantry', 0, 1100, 3500, 400, WEST), 'volcae', 'The Volcae, lining the east bank'),
      n(unit('gauls', 'cavalry', 2600, 1300, 700, 220, WEST), 'volcae-cavalry', 'Gallic horsemen of the Volcae'),
      n(unit('gauls', 'camp', -300, 3200, 900, 700, 0), 'volcae-camp', 'Camp of the Volcae'),
      n(unit('carthage', 'infantry', 800, 4600, 600, 250, WEST), 'hanno', 'Hanno’s detachment, in position at dawn'),
    ],
    arrows: [n(arrow('carthage', [[2300, -3000], [5000, -3500], [8600, -4400]], 140), 'hanno-march', 'Hanno’s night march: upstream, across, and back down the east bank'),
      n(arrow('carthage', [[8600, -1700], [6200, 1600], [3200, 3800], [1200, 4500]], 140), 'hanno-march', 'Hanno’s night march: upstream, across, and back down the east bank')],
  },
  markers: {
    'rhone-hanno-hannibal': mark(-300, -4200, 'Hannibal', 'Camp on the west bank', 'carthage'),
    'rhone-hanno-boats': mark(-1700, -900, 'Boats and rafts', 'Bought and built in two days', 'carthage', 'ship'),
    'rhone-hanno-hanno': mark(5600, -4400, 'Hanno, son of Bomilcar', 'Crosses about 40 km upstream', 'carthage'),
    'rhone-hanno-volcae': mark(-1500, 3300, 'Volcae', 'Fortified camp on the east bank', 'gauls', 'flag'),
    'rhone-hanno-signal': mark(900, 5150, 'Smoke signal', 'Hanno in position at dawn', 'carthage', 'flame'),
  },
});

// --- the crossing ---
writePlan(`${G}/030-rhone-crossing`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...westBank,
      n(unit('carthage', 'ships', 1500, -480, 1600, 450, EAST, { count: 6 }), 'cavalry-boats', 'Large boats upstream, horses swimming behind'),
      n(unit('carthage', 'ships', -700, 60, 2600, 900, EAST, { count: 12, rows: 2 }), 'boats', 'Canoes and boats carrying the infantry'),
      n(unit('gauls', 'infantry', 0, 1050, 3200, 400, WEST), 'volcae', 'The Volcae at the river bank'),
      n(unit('gauls', 'camp', -300, 3200, 900, 700, 0), 'volcae-camp', 'Camp of the Volcae, set on fire'),
      n(unit('carthage', 'infantry', 900, 3700, 600, 250, WEST), 'hanno', 'Hanno’s detachment'),
    ],
    arrows: [n(arrow('carthage', [[700, 3500], [400, 1420]], 150), 'hanno-attack', 'Hanno attacks the Volcae from behind'),
      n(arrow('carthage', [[1100, 3900], [300, 3500]], 110), 'camp-fire', 'Hanno’s men set fire to the Gallic camp'),
      n(arrow('gauls', [[-1000, 1300], [-2600, 2400], [-4300, 4200]], 130, 'dashed'), 'volcae-flight', 'The Volcae scatter')],
    clashes: [P(1100, 680), { at: P(400, 1330), size: 180 }],
  },
  markers: {
    'rhone-crossing-hannibal': mark(2300, 1700, 'Hannibal', 'Among the first across', 'carthage'),
    'rhone-crossing-cavalry': mark(2900, -2300, 'Cavalry boats', 'Upstream, horses swimming behind', 'carthage', 'ship'),
    'rhone-crossing-hanno': mark(1700, 4400, 'Hanno', 'Falls on the Gauls from behind', 'carthage'),
    'rhone-crossing-camp': mark(-1300, 3800, 'Gallic camp', 'Set on fire', 'gauls', 'flame'),
    'rhone-crossing-gauls': mark(-3800, 3000, 'Volcae', 'Scatter after a short fight', 'gauls', 'skull'),
  },
});

// --- the elephants, the scouts and the march north ---
writePlan(`${G}/040-rhone-elephants`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      n(unit('carthage', 'camp', 300, 2300, 1200, 900, 0), 'camp', 'Carthaginian camp on the east bank'),
      n(unit('carthage', 'infantry', 2300, 2500, 1800, 300, f.face(0)), 'army', 'The infantry, marching north'),
      n(unit('carthage', 'cavalry', -2300, 1700, 1200, 250, f.face(180)), 'cavalry', 'Cavalry covering the crossing to the south'),
      n(unit('carthage', 'elephants', -300, 60, 450, 150, EAST, { count: 4 }), 'elephants-rafts', 'Elephants ferried on earth-covered rafts'),
      n(unit('carthage', 'elephants', -300, -1300, 1000, 150, EAST, { count: 8 }), 'elephants-waiting', 'Elephants waiting on the west bank'),
    ],
    arrows: [
      n(arrow('carthage', [[-2700, 1600], [-4500, 1800], [-5800, 1900]], 110), 'numidian-scouts', '500 Numidian horsemen ride south to scout'),
      n(arrow('rome', [[-6500, 2700], [-5900, 2300]], 110), 'roman-scouts', '300 of Scipio’s cavalry, scouting north'),
      n(arrow('rome', [[-5600, 2700], [-3500, 3400], [-1200, 3300]], 90, 'dashed'), 'roman-pursuit', 'The Roman horsemen chase the Numidians to the camp and turn back'),
      n(arrow('carthage', [[3400, 2300], [5600, 900], [8500, -800]], 160), 'march-north', 'Hannibal marches north up the Rhône'),
    ],
    clashes: [{ at: P(-6000, 2050), size: 170 }],
  },
  markers: {
    'rhone-elephants-rafts': mark(-1200, -300, 'Elephants', 'Ferried on earth-covered rafts', 'carthage', 'ship'),
    'rhone-elephants-numidians': mark(-4500, 1000, 'Numidian scouts', '500 sent south, 240 lost', 'carthage', 'swords'),
    'rhone-elephants-romans': mark(-5300, 3600, 'Roman scouts', '300 of Scipio’s cavalry', 'rome', 'swords'),
    'rhone-elephants-march': mark(5600, 2200, 'Hannibal', 'Marches north for the Alps', 'carthage'),
  },
});

console.log('rhone: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(300, 1100)));
