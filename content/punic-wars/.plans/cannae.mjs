// Cannae, 2 August 216 BC. The armies face each other across the plain on the left bank of the Aufidus, both
// resting one flank on the river (Wikipedia's reading: the Romans face roughly east).
// Frame: origin on the river, u along the lines away from it (north-west), w from the Romans towards Hannibal.
import { frame, writePlan } from './lib.mjs';

const f = frame([16.133, 41.297], 330), P = f.p, ROME = f.face(90), CARTH = f.face(270);
const G = 'pages/040-second-war/010-invasion/050-cannae';
const river = { path: f.path([[-1000, -3200], [-560, -1900], [-120, -600], [120, 400], [420, 1500], [980, 3200]]), width: 70, id: 'aufidus', name: 'The river Aufidus' };
const bbox = f.box([[-500, -2500], [4600, 1400]], 0);
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'rome' ? ROME : CARTH, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: the march from Geronium, the battle card at the middle of the field ---
writePlan(`${G}/010-cannae`, {
  routes: {
    'hannibal-216': { name: 'Hannibal’s march from Geronium to Cannae, spring 216 BC', path: [[14.86, 41.72], [15.12, 41.6], [15.4, 41.48], [15.75, 41.37], [16.02, 41.31], [16.14, 41.315]] },
    'consuls-216': { name: 'The Roman army follows, summer 216 BC', offset: 6, path: [[14.93, 41.79], [15.2, 41.63], [15.5, 41.48], [15.84, 41.35], [16.05, 41.29]] },
  },
  markers: {},
  show: ['geronium-217'],
});

// --- deployment ---
writePlan(`${G}/020-cannae-deployment`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      unit('rome', 'cavalry', 150, -650, 500, 220, 'roman-cavalry', 'Roman cavalry under Paullus, 2,400'),
      unit('rome', 'infantry', 1650, -800, 2100, 500, 'roman-infantry', 'Legions and allied infantry under Servilius Geminus'),
      unit('rome', 'light', 1650, -430, 2000, 70, 'velites', 'Roman light infantry, the velites'),
      unit('rome', 'cavalry', 3150, -680, 800, 240, 'allied-cavalry', 'Allied cavalry under Varro, 4,800'),
      unit('carthage', 'cavalry', 460, 650, 480, 260, 'hasdrubal', 'Iberian and Gallic cavalry under Hasdrubal, 6,000 to 7,000'),
      unit('carthage', 'infantry', 920, 760, 420, 320, 'libyans', 'Libyan infantry with captured Roman arms'),
      unit('carthage', 'infantry', 1800, 600, 1300, 220, 'centre', 'Gauls and Iberians under Hannibal and Mago', { bow: 280 }),
      unit('carthage', 'infantry', 2680, 760, 420, 320, 'libyans', 'Libyan infantry with captured Roman arms'),
      unit('carthage', 'cavalry', 3300, 650, 800, 260, 'numidians', 'Numidian cavalry under Hanno, 3,000 to 4,000'),
      unit('carthage', 'light', 1800, 230, 2600, 70, 'skirmishers', 'Balearic slingers and javelinmen'),
    ],
  },
  markers: {
    'cannae-deploy-paullus': mark(150, -980, 'Paullus', 'Roman cavalry, 2,400', 'rome'),
    'cannae-deploy-servilius': mark(1650, -1280, 'Servilius Geminus', 'Legions and allied infantry', 'rome'),
    'cannae-deploy-varro': mark(3150, -1020, 'Varro', 'Allied cavalry, 4,800', 'rome'),
    'cannae-deploy-hasdrubal': mark(460, 1000, 'Hasdrubal', 'Iberian and Gallic cavalry', 'carthage'),
    'cannae-deploy-hannibal': mark(1800, 960, 'Hannibal and Mago', 'Gauls and Iberians, Libyans on both ends', 'carthage'),
    'cannae-deploy-hanno': mark(3300, 1000, 'Hanno', 'Numidian cavalry', 'carthage'),
  },
});

// --- the cavalry battle: the Roman horse broken by the river, Hasdrubal rides behind the Roman army ---
writePlan(`${G}/030-cannae-cavalry`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      unit('rome', 'infantry', 1650, -200, 2100, 500, 'roman-infantry', 'Roman and allied infantry, pressing forward'),
      unit('rome', 'cavalry', 3150, -430, 800, 220, 'allied-cavalry', 'Allied cavalry under Varro'),
      unit('carthage', 'cavalry', 400, -330, 480, 240, 'hasdrubal', 'Hasdrubal’s cavalry after breaking the Roman horse', { facing: f.face(0) }),
      unit('carthage', 'infantry', 920, 760, 420, 320, 'libyans', 'Libyan infantry, still waiting'),
      unit('carthage', 'infantry', 1800, 220, 1300, 220, 'centre', 'Gauls and Iberians, giving ground step by step'),
      unit('carthage', 'infantry', 2680, 760, 420, 320, 'libyans', 'Libyan infantry, still waiting'),
      unit('carthage', 'cavalry', 3300, -130, 800, 240, 'numidians', 'Numidian cavalry, holding the allied horse'),
    ],
    arrows: [
      arrow('rome', [[250, -620], [120, -1500], [-20, -2400]], 110, 'roman-cavalry-flight', 'The Roman cavalry flees along the river', 'dashed'),
      arrow('carthage', [[480, -600], [1000, -1450], [1800, -1750], [2700, -1550], [3150, -880]], 120, 'hasdrubal-ride', 'Hasdrubal rides behind the Roman army'),
      arrow('rome', [[3450, -700], [3900, -1500], [4300, -2350]], 110, 'allied-flight', 'The allied cavalry breaks and flees', 'dashed'),
    ],
    clashes: [P(1350, 80), P(2150, 80), { at: P(3220, -290), size: 200 }],
  },
  markers: {
    'cannae-cav-paullus': mark(-60, -1500, 'Roman cavalry', 'Broken along the river', 'rome', 'skull'),
    'cannae-cav-hasdrubal': mark(1800, -1950, 'Hasdrubal', 'Rides behind the Roman army', 'carthage'),
    'cannae-cav-varro': mark(4150, -1500, 'Allied cavalry', 'Break and flee', 'rome', 'skull'),
    'cannae-cav-hannibal': mark(1800, 520, 'Hannibal', 'The centre gives ground', 'carthage'),
  },
});

// --- the encirclement ---
writePlan(`${G}/040-cannae-encirclement`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      unit('rome', 'infantry', 1800, 380, 1500, 750, 'roman-infantry', 'Roman and allied infantry, enclosed', { bow: 300 }),
      unit('carthage', 'infantry', 1800, 900, 1500, 200, 'centre', 'Gauls and Iberians, bent back into a pocket', { bow: -300 }),
      unit('carthage', 'infantry', 760, 470, 650, 280, 'libyans', 'Libyan infantry, turned inwards on the flanks', { facing: f.face(0) }),
      unit('carthage', 'infantry', 2840, 470, 650, 280, 'libyans', 'Libyan infantry, turned inwards on the flanks', { facing: f.face(180) }),
      unit('carthage', 'cavalry', 1800, -420, 1300, 220, 'hasdrubal', 'Hasdrubal’s cavalry, closing the rear', { facing: ROME }),
    ],
    arrows: [
      arrow('carthage', [[880, 470], [1260, 470]], 110, 'libyan-attack', 'The Libyans attack both flanks'),
      arrow('carthage', [[2720, 470], [2340, 470]], 110, 'libyan-attack', 'The Libyans attack both flanks'),
      arrow('carthage', [[1300, -300], [1350, 60]], 100, 'rear-attack', 'Hasdrubal’s cavalry charges the Roman rear'),
      arrow('carthage', [[2300, -300], [2250, 60]], 100, 'rear-attack', 'Hasdrubal’s cavalry charges the Roman rear'),
      arrow('carthage', [[3700, -1300], [4200, -2000], [4600, -2500]], 90, 'numidian-pursuit', 'The Numidians pursue the allied cavalry'),
    ],
    clashes: [[1800, 1080], [975, 470], [2625, 470], [1800, -150]].map(([u, w]) => P(u, w)),
  },
  markers: {
    'cannae-enc-libyans-left': mark(560, 820, 'Libyan infantry', 'Turn inwards', 'carthage', 'swords'),
    'cannae-enc-libyans-right': mark(3040, 820, 'Libyan infantry', 'Turn inwards', 'carthage', 'swords'),
    'cannae-enc-hasdrubal': mark(1800, -720, 'Hasdrubal', 'Attacks the Roman rear', 'carthage'),
    'cannae-enc-romans': mark(1800, 380, 'Roman infantry', 'Enclosed on all sides', 'rome', 'skull'),
    'cannae-enc-numidians': mark(4500, -2200, 'Numidians', 'Pursue the allied cavalry', 'carthage'),
  },
});

// --- after the battle ---
writePlan(`${G}/050-cannae-aftermath`, {
  routes: {
    'varro-216': { name: 'Varro escapes to Venusia with 70 horsemen', path: [P(3300, -900), [16.02, 41.18], [15.9, 41.05], [15.815, 40.965]] },
    'survivors-216': { name: 'Survivors make for Canusium', style: 'dashed', path: [P(800, -1600), [16.09, 41.25], [16.066, 41.225]] },
  },
  markers: { 'cannae-after-field': { lnglat: P(1800, 300), icon: 'skull', color: 'rome', label: 'Battlefield', note: 'Polybius: 70,000 dead. Livy: 48,200' } },
  show: ['canusium-216', 'venusia-216'],
});

console.log('cannae: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(1800, 0)));
