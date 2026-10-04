// The Trebia, 22 or 23 December 218 BC, on the flood plain west of the lower Trebia (the article's coordinates
// 44.9885 N, 9.5674 E). Roman camp on a low hill east of the river, Carthaginian camp on high ground to the west,
// about 8 km apart. Mago hides in an old watercourse to the south and hits the Roman left rear.
// Frame: origin on the river, u south (upstream), w west (from the Romans towards Hannibal).
import { frame, writePlan } from './lib.mjs';

const f = frame([9.6, 44.988], 180), P = f.p;
const G = 'pages/040-second-war/010-invasion/020-trebia';
const bbox = f.box([[-6000, -3600], [5200, 6200]], 0);
const WEST = f.face(90), EAST = f.face(270), NORTH = f.face(180), SOUTH = f.face(0);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 130, style) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}) });
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, note });
const river = { path: f.path([[-10000, -1500], [-6000, -900], [-3000, -450], [0, 0], [3000, 150], [6000, 250], [9000, 250]]), width: 110, id: 'trebia', name: 'The river Trebia' };
const camps = [n(unit('rome', 'camp', 1200, -2800, 800, 800, 0), 'roman-camp', 'Roman camp on the low hill east of the river'),
  n(unit('carthage', 'camp', 800, 5300, 900, 900, 0), 'carthage-camp', 'Carthaginian camp on high ground west of the river')];
// Hannibal's line: Gauls in the centre, Africans and Iberians either side, elephants beyond them, cavalry on the wings
const carthageLine = (w, withCavalry = true) => [
  n(unit('carthage', 'infantry', 0, w, 1300, 250, EAST), 'gauls', 'Gauls in the centre, about 8,000'),
  ...[-1250, 1250].map(u => n(unit('carthage', 'infantry', u, w, 1100, 300, EAST), 'africans-iberians', 'African and Iberian infantry')),
  ...[-2000, 2000].map(u => n(unit('carthage', 'elephants', u, w - 50, 350, 110, EAST, { count: 4 }), 'elephants', 'Elephants at both ends of the infantry')),
  ...(withCavalry ? [-2750, 2750].map(u => n(unit('carthage', 'cavalry', u, w, 900, 300, EAST), 'cavalry', 'Carthaginian cavalry, about 10,000 on the two wings')) : []),
];
const romanLine = w => [n(unit('rome', 'infantry', 0, w, 1600, 450, WEST), 'legions', 'Four Roman legions'),
  ...[-1700, 1700].map(u => n(unit('rome', 'infantry', u, w, 1700, 400, WEST), 'allies', 'Allied infantry'))];
const camp = { lnglat: P(1200, -2800) }, hcamp = { lnglat: P(800, 5300) };

// --- overview: Ticinus, the retreat behind the Po, Sempronius, the two camps ---
writePlan(`${G}/010-trebia`, {
  bbox: [8.6, 44.6, 10.1, 45.5],
  routes: {
    'scipio-218-ticinus': { name: 'Scipio crosses the Ticinus to find Hannibal, November 218 BC', path: [[9.69, 45.05], [9.45, 45.12], [9.25, 45.17], [9.1, 45.19], [8.98, 45.22]] },
    'scipio-218-trebia': { name: 'After the defeat Scipio falls back to Placentia, then to the hills by the Trebia', style: 'dashed', offset: 6,
      path: [[8.98, 45.22], [9.1, 45.19], [9.25, 45.16], [9.45, 45.11], [9.69, 45.05], [9.67, 45.0], camp.lnglat] },
    'hannibal-218-po': { name: 'Hannibal crosses the Po and follows to Placentia', path: [[8.98, 45.2], [8.95, 45.12], [9.15, 45.07], [9.4, 45.03], [9.5, 45.0], hcamp.lnglat] },
    'sempronius-218': { name: 'Sempronius brings his army from Ariminum to join Scipio, December 218 BC',
      path: [[12.57, 44.06], [11.9, 44.3], [11.34, 44.49], [10.9, 44.65], [10.3, 44.85], [9.85, 44.98], camp.lnglat] },
  },
  markers: { 'trebia-clastidium': { lnglat: [9.13, 45.02], icon: 'wheat', color: 'carthage', label: 'Clastidium', note: 'Its grain depot betrayed to Hannibal' } },
  show: ['ticinus-218', 'placentia-218'],
});

// --- the Numidian lure and the crossing ---
writePlan(`${G}/020-trebia-lure`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...camps, ...carthageLine(3000), n(unit('carthage', 'light', 0, 2500, 4600, 70, EAST), 'skirmishers', 'Balearic slingers and spearmen'),
      n(unit('carthage', 'cavalry', -700, 1950, 900, 200, EAST), 'numidians', 'Numidian cavalry, drawing the Romans on'),
      n(unit('rome', 'infantry', 0, 1550, 3800, 450, WEST), 'roman-army', 'The Roman army after wading the river, wet and unfed'),
      n(unit('rome', 'cavalry', 600, 950, 1500, 220, WEST), 'roman-cavalry', 'Roman cavalry'),
      n(unit('carthage', 'cavalry', 3900, 1500, 500, 200, NORTH), 'mago', 'Mago with 2,000 men hidden in a watercourse'),
    ],
    arrows: [
      n(arrow('carthage', [[-400, -1700], [-650, 300], [-700, 1700]], 120), 'numidian-withdrawal', 'The Numidians fall back across the river'),
      ...[-1500, 0, 1500].map(u => n(arrow('rome', [[u, -2300], [u, 1300]], 160), 'roman-crossing', 'The Romans wade the icy river')),
    ],
  },
  markers: {
    'trebia-lure-numidians': mark(-2300, 1000, 'Numidians', 'Draw the Romans across', 'carthage', 'swords'),
    'trebia-lure-sempronius': mark(2600, -1100, 'Sempronius', 'Sends the army across unfed', 'rome'),
    'trebia-lure-mago': mark(4300, 2200, 'Mago', '2,000 men in a watercourse', 'carthage'),
    'trebia-lure-hannibal': mark(0, 4300, 'Hannibal', 'Forms up after breakfast', 'carthage'),
  },
});

// --- the cavalry battle on the wings ---
writePlan(`${G}/030-trebia-wings`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...camps, ...carthageLine(2800, false),
      ...[-3300, 3300].map(u => n(unit('carthage', 'cavalry', u, 1200, 900, 300, EAST), 'cavalry', 'Carthaginian cavalry, routing the Roman horse')),
      n(unit('carthage', 'light', -2950, 2550, 700, 70, f.face(135)), 'skirmishers', 'Light troops attacking the Roman flanks'),
      n(unit('carthage', 'light', 2950, 2550, 700, 70, f.face(45)), 'skirmishers', 'Light troops attacking the Roman flanks'),
      ...romanLine(2350), n(unit('rome', 'light', 0, 1800, 3600, 70, WEST), 'velites', 'Velites, withdrawn behind the line'),
    ],
    arrows: [
      ...[-1, 1].map(s => n(arrow('rome', [[s * 2900, 2200], [s * 3000, 400], [s * 3300, -1500]], 120, 'dashed'), 'roman-cavalry-flight', 'The Roman cavalry is driven off')),
      ...[-1, 1].map(s => n(arrow('carthage', [[s * 2950, 2450], [s * 2650, 2250]], 90), 'flank-attack', 'Light troops attack the Roman flanks')),
    ],
    clashes: [P(-850, 2610), P(850, 2610)],
  },
  markers: {
    'trebia-wings-roman-cavalry': mark(-3700, -300, 'Roman cavalry', 'Broken on both wings', 'rome', 'skull'),
    'trebia-wings-cavalry': mark(3900, 1900, 'Carthaginian cavalry', '5,000 on each wing', 'carthage', 'swords'),
    'trebia-wings-elephants': mark(2300, 3500, 'Elephants', 'On both ends of the line', 'carthage', 'swords'),
    'trebia-wings-gauls': mark(0, 3450, 'Gauls', '8,000 in the centre', 'carthage', 'swords'),
  },
});

// --- Mago's attack on the Roman rear ---
writePlan(`${G}/040-trebia-mago`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...camps, ...carthageLine(2800, false),
      n(unit('carthage', 'light', -2850, 2350, 600, 70, f.face(135)), 'skirmishers', 'Light troops attacking the Roman flanks'),
      n(unit('carthage', 'light', 2850, 2350, 600, 70, f.face(45)), 'skirmishers', 'Light troops attacking the Roman flanks'),
      ...romanLine(2350), n(unit('rome', 'light', 0, 1800, 3600, 70, WEST), 'velites', 'Velites behind the line'),
      n(unit('rome', 'infantry', 1450, 1980, 450, 110, SOUTH), 'triarii', 'Triarii turning to face Mago'),
      n(unit('carthage', 'cavalry', 2400, 1500, 500, 200, NORTH), 'mago', 'Mago’s 2,000 men'),
    ],
    arrows: [
      n(arrow('carthage', [[3900, 1450], [3000, 1500], [2550, 1500]], 140), 'mago-attack', 'Mago charges the Roman rear'),
      n(arrow('carthage', [[-3300, 700], [-2300, 1100], [-1300, 1550]], 130), 'cavalry-return', 'The Carthaginian cavalry returns against the Roman flanks and rear'),
      n(arrow('carthage', [[3300, 500], [2000, 900], [700, 1550]], 130), 'cavalry-return', 'The Carthaginian cavalry returns against the Roman flanks and rear'),
    ],
    clashes: [P(1950, 1700), P(-2600, 2350), P(2600, 2350), P(-1250, 1700)],
  },
  markers: {
    'trebia-mago-mago': mark(3500, 2300, 'Mago', 'Charges the Roman rear', 'carthage'),
    'trebia-mago-triarii': mark(1200, 1050, 'Triarii', 'Turn to help the velites', 'rome', 'swords'),
    'trebia-mago-allies': mark(-3000, 1450, 'Roman allies', 'Turn to face the flanks', 'rome', 'swords'),
    'trebia-mago-cavalry': mark(-3600, 300, 'Carthaginian cavalry', 'Return from the pursuit', 'carthage', 'swords'),
  },
});

// --- the Roman centre breaks through ---
writePlan(`${G}/050-trebia-breakthrough`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      ...camps, ...[-1250, 1250].map(u => n(unit('carthage', 'infantry', u, 2800, 1100, 300, EAST), 'africans-iberians', 'African and Iberian infantry')),
      n(unit('rome', 'infantry', 0, 3350, 1200, 450, WEST), 'legions', 'About 10,000 legionaries, through the Gallic centre'),
      ...[-1750, 1750].map(u => n(unit('rome', 'infantry', u, 2200, 1100, 350, WEST), 'allies', 'Allied infantry, attacked on the flanks')),
      ...[-1000, 1000].map(u => n(unit('carthage', 'cavalry', u, 1450, 900, 220, WEST), 'cavalry', 'Carthaginian cavalry in the Roman rear')),
    ],
    arrows: [
      n(arrow('carthage', [[300, 3700], [700, 4400], [1000, 5000]], 110, 'dashed'), 'gauls-flight', 'The Gauls of the centre break'),
      n(arrow('rome', [[-2200, 2100], [-2600, 900], [-2800, -900]], 110, 'dashed'), 'flank-flight', 'The Roman flanks break towards the river'),
      n(arrow('rome', [[2200, 2100], [2600, 900], [2700, -700]], 110, 'dashed'), 'flank-flight', 'The Roman flanks break towards the river'),
      n(arrow('rome', [[-700, 3700], [-2700, 3000], [-4300, 1000], [-5800, -1700]], 160), 'march-placentia', 'Sempronius leads 10,000 men to Placentia'),
    ],
    clashes: [P(-1750, 1950), P(1750, 1950), P(-1250, 2590), P(1250, 2590)],
  },
  markers: {
    'trebia-breakthrough-sempronius': mark(-4700, 2200, 'Sempronius', 'Leads 10,000 to Placentia', 'rome'),
    'trebia-breakthrough-gauls': mark(1500, 4500, 'Gauls', 'Routed by the legions', 'carthage', 'skull'),
    'trebia-breakthrough-flanks': mark(3200, 500, 'Roman flanks', 'Cut down near the river', 'rome', 'skull'),
  },
  show: ['placentia-218'],
});

console.log('trebia: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 2550)));
