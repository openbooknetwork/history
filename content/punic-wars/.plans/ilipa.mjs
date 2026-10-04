// Ilipa, spring 206 BC. The two camps stand on low hills on either side of a plain south of the Baetis
// (Guadalquivir), near Ilipa (Alcalá del Río). The site in detail is not known. Here the Carthaginians are on the
// west towards Ilipa, the Romans on the east, the river beyond the northern flank.
// Frame: origin in the middle of the plain, u north along the lines, w east from the Carthaginians to the Romans.
import { frame, writePlan } from './lib.mjs';

const f = frame([-5.94, 37.5165], 0), P = f.p, CARTH = f.face(90), ROME = f.face(270);
const G = 'pages/040-second-war/030-scipio/010-ilipa';
const river = { path: [[-5.82, 37.61], [-5.84, 37.598], [-5.87, 37.581], [-5.9, 37.564], [-5.93, 37.549], [-5.96, 37.533], [-5.985, 37.517], [-6.0, 37.495]], width: 110, id: 'baetis', name: 'The river Baetis' };
const bbox = f.box([[-2600, -2900], [2600, 2900]], 0);
const unit = (side, type, u, w, width, depth, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'rome' ? ROME : CARTH, ...extra });
const arrow = (side, pts, width = 90, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const camps = [unit('carthage', 'camp', 0, -2300, 1200, 900, { id: 'carth-camp', name: 'Hasdrubal Gisco’s camp' }), unit('rome', 'camp', 0, 2300, 1100, 900, { id: 'roman-camp', name: 'Scipio’s camp' })];
// the Carthaginian order, the same every day: Africans in the centre, Iberians on the wings, cavalry and elephants beyond
const carth = (dw = 0) => [
  unit('carthage', 'cavalry', -1900, -650 + dw, 500, 200, { id: 'carth-cavalry', name: 'Carthaginian cavalry on the wings' }), unit('carthage', 'elephants', -1900, -430 + dw, 500, 70, { count: 6, id: 'elephants', name: 'Elephants beside the cavalry' }),
  unit('carthage', 'infantry', -1150, -700 + dw, 900, 250, { id: 'carth-iberians', name: 'Iberians on the Carthaginian wings' }), unit('carthage', 'infantry', 0, -700 + dw, 1300, 300, { id: 'africans', name: 'African infantry, Hasdrubal’s best troops' }),
  unit('carthage', 'infantry', 1150, -700 + dw, 900, 250, { id: 'carth-iberians', name: 'Iberians on the Carthaginian wings' }),
  unit('carthage', 'cavalry', 1900, -650 + dw, 500, 200, { id: 'carth-cavalry', name: 'Carthaginian cavalry on the wings' }), unit('carthage', 'elephants', 1900, -430 + dw, 500, 70, { count: 6, id: 'elephants', name: 'Elephants beside the cavalry' }),
];

// --- overview: Scipio's march to Ilipa, Hasdrubal Gisco from Gades ---
writePlan(`${G}/010-ilipa`, {
  bbox: [-7.6, 36.2, 1.9, 41.6],
  routes: {
    'scipio-206': { name: 'Scipio marches from Tarraco by Castulo to Ilipa, spring 206 BC', path: [[1.25, 41.12], [0.4, 40.5], [-0.6, 39.5], [-2.0, 38.6], [-3.6, 38.07], [-4.8, 37.8], [-5.88, 37.53]] },
    'hasdrubal-gisco-206': { name: 'Hasdrubal Gisco brings his army from Gades', path: [[-6.29, 36.53], [-6.12, 37.0], [-5.99, 37.5]] },
  },
  show: ['tarraco-210'],
});

// --- the days of waiting: the same order each day ---
writePlan(`${G}/020-ilipa-days`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...camps, ...carth(), unit('carthage', 'light', 0, -480, 1200, 60, { id: 'carth-light', name: 'Carthaginian light troops' }),
      unit('rome', 'infantry', -1150, 700, 1000, 200, { id: 'roman-iberians', name: 'Scipio’s Iberian allies on the wings' }), unit('rome', 'infantry', 0, 700, 1300, 350, { id: 'legions', name: 'The legions in the centre' }), unit('rome', 'infantry', 1150, 700, 1000, 200, { id: 'roman-iberians', name: 'Scipio’s Iberian allies on the wings' }),
      unit('rome', 'cavalry', -1150, 1050, 600, 150, { id: 'roman-cavalry', name: 'Roman cavalry behind the wings' }), unit('rome', 'cavalry', 1150, 1050, 600, 150, { id: 'roman-cavalry', name: 'Roman cavalry behind the wings' }), unit('rome', 'light', 0, 450, 1200, 60, { id: 'velites', name: 'The velites in front' }),
    ],
  },
  markers: {
    'ilipa-days-africans': mark(0, -1150, 'Africans', 'Hasdrubal’s best troops, centre', 'carthage', 'swords'),
    'ilipa-days-iberians': mark(1150, -1150, 'Iberians', 'On both wings', 'carthage', 'swords'),
    'ilipa-days-legions': mark(0, 1150, 'Legions', 'Roman centre, facing the Africans', 'rome', 'swords'),
    'ilipa-days-allies': mark(-1150, 1350, 'Iberian allies', 'Roman wings', 'rome', 'swords'),
  },
});

// --- the dawn attack: the Carthaginians in their usual order, the Romans reversed ---
writePlan(`${G}/030-ilipa-dawn`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...camps, ...carth(),
      unit('rome', 'infantry', -1150, 380, 1000, 300, { id: 'legions', name: 'The legions, now on the wings' }), unit('rome', 'infantry', 1150, 380, 1000, 300, { id: 'legions', name: 'The legions, now on the wings' }), unit('rome', 'infantry', 0, 950, 1300, 200, { id: 'roman-iberians', name: 'Scipio’s Iberians, now in the centre and held back' }),
      unit('rome', 'cavalry', -1950, 520, 450, 160, { id: 'roman-cavalry', name: 'Roman cavalry at the ends of the line' }), unit('rome', 'cavalry', 1950, 520, 450, 160, { id: 'roman-cavalry', name: 'Roman cavalry at the ends of the line' }),
      unit('rome', 'light', -1950, 280, 450, 60, { id: 'velites', name: 'Velites at the ends of the line' }), unit('rome', 'light', 1950, 280, 450, 60, { id: 'velites', name: 'Velites at the ends of the line' }),
    ],
    arrows: [
      arrow('carthage', [[0, -1800], [0, -1150]], 110, undefined, { id: 'carth-out', name: 'The Carthaginians rush out without breakfast' }),
      arrow('rome', [[-1150, 160], [-1150, -250]], 110, undefined, { id: 'wings-advance', name: 'The Roman wings advance quickly' }), arrow('rome', [[1150, 160], [1150, -250]], 110, undefined, { id: 'wings-advance', name: 'The Roman wings advance quickly' }),
    ],
  },
  markers: {
    'ilipa-dawn-scipio': mark(1150, 820, 'Scipio', 'Legions on the right wing', 'rome'),
    'ilipa-dawn-silanus': mark(-1150, 820, 'Silanus and Marcius', 'Legions on the left wing', 'rome'),
    'ilipa-dawn-allies': mark(0, 1350, 'Iberian allies', 'Centre, held back', 'rome', 'swords'),
    'ilipa-dawn-carthaginians': mark(0, -1150, 'Hasdrubal Gisco', 'Out of camp without breakfast', 'carthage'),
  },
});

// --- the wings: the legions wheel in on the Carthaginian Iberians, cavalry and light troops go round ---
writePlan(`${G}/040-ilipa-wings`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...camps,
      unit('carthage', 'cavalry', -1850, -720, 450, 200, { id: 'carth-cavalry', name: 'Carthaginian cavalry, trampled by their own elephants' }), unit('carthage', 'infantry', -1150, -640, 900, 250, { id: 'carth-iberians', name: 'Carthaginian Iberians, struck at an angle' }), unit('carthage', 'infantry', 0, -700, 1300, 300, { id: 'africans', name: 'The Africans, unable to move' }),
      unit('carthage', 'infantry', 1150, -640, 900, 250, { id: 'carth-iberians', name: 'Carthaginian Iberians, struck at an angle' }), unit('carthage', 'cavalry', 1850, -720, 450, 200, { id: 'carth-cavalry', name: 'Carthaginian cavalry, trampled by their own elephants' }),
      unit('rome', 'infantry', -1300, -200, 850, 220, { facing: 285, id: 'left-legions', name: 'Legions under Silanus and Marcius' }), unit('rome', 'infantry', 1300, -200, 850, 220, { facing: 255, id: 'right-legions', name: 'Legions under Scipio' }),
      unit('rome', 'infantry', 0, 650, 1300, 200, { id: 'roman-iberians', name: 'Scipio’s Iberians, holding back' }),
    ],
    arrows: [
      arrow('rome', [[1150, 380], [1700, 250], [1650, -150]], 100, undefined, { id: 'wheel', name: 'The legions turn outwards and wheel back into line' }), arrow('rome', [[-1150, 380], [-1700, 250], [-1650, -150]], 100, undefined, { id: 'wheel', name: 'The legions turn outwards and wheel back into line' }),
      arrow('rome', [[2050, 300], [2350, -400], [2050, -1000]], 90, undefined, { id: 'outflank', name: 'Cavalry and velites go round against the elephants' }), arrow('rome', [[-2050, 300], [-2350, -400], [-2050, -1000]], 90, undefined, { id: 'outflank', name: 'Cavalry and velites go round against the elephants' }),
      arrow('carthage', [[0, -900], [0, -1750]], 110, 'dashed', { id: 'retreat', name: 'The army falls back towards its camp' }),
    ],
    clashes: [P(1250, -440), P(-1250, -440), P(1850, -880), P(-1850, -880)],
  },
  markers: {
    'ilipa-wings-scipio': mark(1300, 120, 'Scipio', 'Wheels in on the flank', 'rome'),
    'ilipa-wings-silanus': mark(-1300, 120, 'Silanus and Marcius', 'The same on the left', 'rome'),
    'ilipa-wings-africans': mark(0, -1150, 'Africans', 'Cannot move to help the wings', 'carthage', 'swords'),
    'ilipa-wings-elephants': mark(2250, -1300, 'Elephants', 'Trample their own cavalry', 'carthage', 'swords'),
  },
});

// --- the pursuit: Hasdrubal's flight towards the ocean, the surrender on the hill ---
writePlan(`${G}/050-ilipa-pursuit`, {
  bbox: [-7.0, 36.25, -5.2, 37.9],
  routes: {
    'hasdrubal-ilipa-206': { name: 'Hasdrubal slips away at night towards the ocean', style: 'dashed', path: [[-5.97, 37.51], [-6.08, 37.33], [-6.15, 37.12], [-6.22, 36.85], [-6.29, 36.55]] },
    'romans-ilipa-206': { name: 'The Roman pursuit, led by the cavalry', offset: 6, path: [[-5.93, 37.51], [-6.05, 37.32], [-6.12, 37.14]] },
  },
  markers: {
    'ilipa-pursuit-hill': { lnglat: [-6.1, 37.12], icon: 'skull', color: 'carthage', label: 'A waterless hill', note: '6,000 men surrender' },
  },
  show: ['italica-206', 'gades-206'],
});

console.log('ilipa written, battle at', JSON.stringify(P(0, 0)), 'bbox', JSON.stringify(bbox));
