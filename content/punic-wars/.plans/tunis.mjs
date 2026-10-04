// Tunis (the Bagradas), spring 255 BC. The site is unknown, "close to Tunis" on open ground; the plan sits on the
// plain west of Tunis. Golitsyn's plan of 1874 has Xanthippus to the north-west and Regulus to the south-east.
// Frame: u along the lines (south-west), w from the Romans towards Xanthippus (north-west).
import { frame, writePlan } from './lib.mjs';

const f = frame([10.03, 36.85], 225), P = f.p, ROME = f.face(90), CARTH = f.face(270);
const G = 'pages/020-first-war/050-regulus';
const bbox = f.box([[-2200, -2000], [1500, 1900]], 0);
const unit = (side, type, u, w, width, depth, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'rome' ? ROME : CARTH, ...extra });
const arrow = (side, pts, width = 80, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const camps = [unit('rome', 'camp', 0, -1350, 450, 450, nm('roman-camp', 'Roman camp')), unit('carthage', 'camp', 0, 1500, 500, 500, nm('carthaginian-camp', 'Carthaginian camp'))];

// --- overview: from Aspis to Adys and Tunis, and Xanthippus marching out ---
writePlan(`${G}/010-regulus`, {
  routes: {
    'regulus-256': { name: 'Regulus marches inland from Aspis to Adys and Tunis, 256 BC', path: [[11.09, 36.85], [10.8, 36.72], [10.45, 36.63], [10.19, 36.6], [10.15, 36.7], [10.17, 36.79]] },
    'xanthippus-255': { name: 'Xanthippus leads the Carthaginian army out, spring 255 BC', path: [[10.32, 36.86], [10.25, 36.9], [10.14, 36.9], [10.06, 36.87]] },
  },
  show: ['aspis-256', 'adys-256', 'carthage-255'],
});

// --- deployment ---
writePlan(`${G}/020-regulus-deployment`, {
  bbox,
  emblem: {
    units: [
      ...camps,
      unit('rome', 'infantry', 0, -500, 1100, 400, nm('legions', 'Roman legions under Regulus, drawn up deep, 15,000 infantry')),
      unit('rome', 'light', 0, -250, 1100, 50, nm('skirmishers', 'Roman skirmishers')),
      unit('rome', 'cavalry', 720, -480, 170, 90, nm('roman-cavalry', 'Roman cavalry, 500 split between the wings')),
      unit('rome', 'cavalry', -720, -480, 170, 90, nm('roman-cavalry', 'Roman cavalry, 500 split between the wings')),
      unit('carthage', 'infantry', 0, 650, 600, 200, nm('phalanx', 'Carthaginian citizen phalanx under Xanthippus')),
      unit('carthage', 'infantry', 560, 650, 480, 200, nm('mercenaries', 'Veterans from Sicily and new mercenaries')),
      unit('carthage', 'infantry', -560, 650, 480, 200, nm('mercenaries', 'Veterans from Sicily and new mercenaries')),
      unit('carthage', 'cavalry', 1150, 600, 520, 220, nm('carthaginian-cavalry', 'Carthaginian cavalry, 4,000 on both wings')),
      unit('carthage', 'cavalry', -1150, 600, 520, 220, nm('carthaginian-cavalry', 'Carthaginian cavalry, 4,000 on both wings')),
      unit('carthage', 'elephants', 0, 380, 1500, 90, { count: 18, ...nm('elephants', '100 elephants in a single line') }),
    ],
  },
  markers: {
    'regulus-deployment-regulus': mark(0, -880, 'Regulus', '15,000 infantry, 500 cavalry', 'rome'),
    'regulus-deployment-xanthippus': mark(0, 960, 'Xanthippus', 'Citizen phalanx in the centre', 'carthage'),
    'regulus-deployment-elephants': mark(1050, 330, 'Elephants', '100 in a single line', 'carthage', 'swords'),
    'regulus-deployment-cavalry': mark(-1150, 920, 'Carthaginian cavalry', '4,000 on both wings', 'carthage', 'swords'),
  },
});

// --- the elephants charge, the Roman horse is swept away, the Roman left breaks the Carthaginian right ---
writePlan(`${G}/030-regulus-elephants`, {
  bbox,
  emblem: {
    units: [
      ...camps,
      unit('rome', 'infantry', -150, -260, 900, 450, nm('legions', 'Roman legions, thrown into confusion by the elephants')),
      unit('rome', 'infantry', 880, 330, 330, 250, nm('roman-left', 'The Roman left, probably Latin allies, past the end of the elephant line')),
      unit('carthage', 'elephants', -150, 40, 1100, 90, { count: 13, ...nm('elephants', 'The elephants charge into the legions') }),
      unit('carthage', 'infantry', 0, 650, 600, 200, nm('phalanx', 'Carthaginian citizen phalanx under Xanthippus')),
      unit('carthage', 'infantry', -560, 650, 480, 200, nm('mercenaries', 'Veterans and mercenaries on the Carthaginian left')),
      unit('carthage', 'cavalry', 1150, -950, 420, 200, { facing: f.face(180), ...nm('carthaginian-cavalry', 'Carthaginian cavalry, turning on the Roman rear') }),
      unit('carthage', 'cavalry', -1150, -950, 420, 200, { facing: f.face(0), ...nm('carthaginian-cavalry', 'Carthaginian cavalry, turning on the Roman rear') }),
    ],
    arrows: [
      arrow('rome', [[720, -560], [820, -1200], [900, -1900]], 70, 'dashed', nm('roman-horse-flees', 'The Roman horsemen are swept from the field')),
      arrow('rome', [[-720, -560], [-820, -1200], [-900, -1900]], 70, 'dashed', nm('roman-horse-flees', 'The Roman horsemen are swept from the field')),
      arrow('carthage', [[560, 760], [480, 1050], [380, 1300]], 80, 'dashed', nm('right-breaks', 'The mercenaries of the Carthaginian right break and flee to their camp')),
      arrow('rome', [[880, 480], [700, 900], [520, 1230]], 80, undefined, nm('roman-left-pursues', 'The Roman left pursues them to the camp')),
      arrow('carthage', [[950, -880], [600, -620], [370, -480]], 80, undefined, nm('cavalry-returns', 'Carthaginian cavalry return to attack the Roman flank')),
    ],
    clashes: [P(-450, 0), P(150, 0)],
  },
  markers: {
    'regulus-elephants-left': mark(1250, 360, 'Roman left', 'Breaks the Carthaginian right', 'rome', 'swords'),
    'regulus-elephants-elephants': mark(-950, 120, 'Elephants', 'Charge into the legions', 'carthage', 'swords'),
    'regulus-elephants-horse': mark(1000, -1750, 'Roman cavalry', 'Swept from the field', 'rome', 'skull'),
  },
});

// --- the phalanx attacks; Regulus breaks out and is taken, 2,000 escape to Aspis ---
writePlan(`${G}/040-regulus-defeat`, {
  bbox,
  emblem: {
    units: [
      ...camps,
      unit('rome', 'infantry', 0, -260, 800, 500, nm('legions', 'Roman infantry, packed together and surrounded')),
      unit('carthage', 'elephants', 0, -110, 600, 90, { count: 7, ...nm('elephants', 'The elephants trample through the Roman ranks') }),
      unit('carthage', 'infantry', 0, 300, 1100, 200, nm('phalanx', 'The Carthaginian phalanx, sent forward by Xanthippus')),
      unit('carthage', 'cavalry', 680, -330, 320, 200, { facing: f.face(180), ...nm('carthaginian-cavalry', 'Carthaginian cavalry on the Roman flanks and rear') }),
      unit('carthage', 'cavalry', -680, -330, 320, 200, { facing: f.face(0), ...nm('carthaginian-cavalry', 'Carthaginian cavalry on the Roman flanks and rear') }),
      unit('carthage', 'cavalry', 0, -870, 600, 150, { facing: ROME, ...nm('carthaginian-cavalry', 'Carthaginian cavalry on the Roman flanks and rear') }),
    ],
    arrows: [
      arrow('carthage', [[-300, 430], [-300, 40]], 80, undefined, nm('phalanx-advance', 'The phalanx attacks')),
      arrow('carthage', [[300, 430], [300, 40]], 80, undefined, nm('phalanx-advance', 'The phalanx attacks')),
      arrow('rome', [[-300, -520], [-800, -1250], [-1250, -1850]], 70, 'dashed', nm('regulus-breakout', 'Regulus fights his way out and is caught with 500 men')),
      arrow('rome', [[350, 1450], [-800, 1850], [-2100, 1300]], 70, 'dashed', nm('escape', 'The 2,000 men of the Roman left escape towards Aspis')),
    ],
    clashes: [P(0, 40), P(470, -300), P(-470, -300), P(0, -560)],
  },
  markers: {
    'regulus-defeat-xanthippus': mark(0, 650, 'Xanthippus', 'The phalanx attacks', 'carthage'),
    'regulus-defeat-romans': mark(560, -700, 'Roman infantry', 'About 13,000 killed', 'rome', 'skull'),
    'regulus-defeat-regulus': mark(-1300, -1950, 'Regulus', 'Captured with 500 men', 'rome', 'skull'),
    'regulus-defeat-escape': mark(-2000, 1650, '2,000 Romans', 'Escape to Aspis', 'rome', 'swords'),
  },
});

// --- the survivors, Cape Hermaeum and the storm off Camarina ---
writePlan(`${G}/050-regulus-aftermath`, {
  routes: {
    'survivors-255': { name: 'The 2,000 survivors fall back to Aspis', style: 'dashed', path: [[10.03, 36.85], [10.12, 36.76], [10.4, 36.7], [10.75, 36.72], [11.09, 36.85]] },
    'fleet-255': { name: 'A Roman fleet comes to take off the survivors and wins off Cape Hermaeum', path: [[12.4, 37.72], [11.7, 37.3], [11.12, 37.13], [11.13, 36.9]] },
    'storm-255': { name: 'The fleet sails home and is wrecked off Camarina', path: [[11.16, 36.88], [11.8, 37.05], [12.6, 37.3], [13.4, 37.02], [14.1, 36.84], [14.4, 36.83]] },
  },
  markers: {
    'regulus-aftermath-hermaeum': { lnglat: [11.15, 37.25], icon: 'ship', color: 'rome', label: 'Cape Hermaeum', note: '114 Carthaginian ships captured' },
    'regulus-aftermath-camarina': { lnglat: [14.45, 36.87], icon: 'skull', color: 'rome', label: 'Camarina', note: '384 of 464 ships sunk' },
  },
  show: ['aspis-256'],
});

console.log('tunis: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 100)));
