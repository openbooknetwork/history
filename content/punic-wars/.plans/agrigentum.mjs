// Agrigentum, 262 to 261 BC. Walls and rivers follow Koldewey's site plan: the Hypsas (Drago) west of the city,
// the Akragas (San Biagio) east, meeting south of it; the Asklepieion in the plain to the south. Toros, Hanno's
// hill, is unidentified: placed west, beyond the western Roman camp, on the side Hanno came from.
// Frame: origin in the middle of the city, u north, w east.
import { frame, writePlan } from './lib.mjs';

const f = frame([13.585, 37.303], 0), P = f.p, EAST = 90, WEST = 270;
const G = 'pages/020-first-war/020-agrigentum';
const bbox = f.box([[-4500, -6900], [3200, 3200]], 0);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 120, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

const ring = pts => f.path([...pts, pts[0]]);
const walls = { side: 'carthage', width: 70, path: ring([[1100, -1300], [1350, -500], [1450, 400], [700, 1300], [100, 1500], [-700, 1450], [-1500, 900], [-1500, 100], [-1450, -700], [-1250, -1300], [-400, -1650], [400, -1500]]), ...nm('walls', 'The walls of Agrigentum') };
const lines = { side: 'rome', width: 45, path: ring([[2600, -2300], [2750, -200], [2400, 1700], [1200, 2750], [-600, 2800], [-2000, 2250], [-2950, 900], [-3050, -700], [-2600, -2000], [-1200, -3050], [500, -3250], [1800, -2900]]), ...nm('siege-lines', 'Roman siege lines, a ring of ditches round the city') };
const water = [
  { path: f.path([[2600, -3000], [1200, -2350], [0, -2050], [-1000, -1850], [-1900, -1350], [-2800, -550], [-3300, -200]]), width: 60, ...nm('hypsas', 'The river Hypsas') },
  { path: f.path([[2200, 2900], [800, 2450], [-300, 2300], [-1500, 1750], [-2500, 700], [-3300, -200]]), width: 60, ...nm('akragas', 'The river Akragas') },
  { path: f.path([[-3300, -200], [-3800, -500], [-4400, -900]]), width: 80, ...nm('rivers-to-sea', 'The joined rivers, flowing to the sea') },
];
const romanCamps = [unit('rome', 'camp', -2450, -550, 500, 500, 0, nm('south-camp', 'Roman camp south of the city, by the temple of Asklepios')),
  unit('rome', 'camp', 300, -3500, 550, 550, 0, nm('west-camp', 'Roman camp west of the city'))];
const forts = [[2750, -200], [1200, 2750], [-2950, 900], [-1200, -3050]].map(([u, w]) => unit('rome', 'camp', u, w, 160, 160, 0, nm('forts', 'Small Roman forts on the siege lines')));
const toros = unit('carthage', 'camp', 1700, -5900, 600, 600, 0, nm('toros', 'Hanno’s camp on the hill of Toros'));

// --- overview: Hanno's march from Heraclea Minoa ---
writePlan(`${G}/010-agrigentum`, {
  routes: { 'hanno-262': { name: 'Hanno’s relief army from Heraclea Minoa, winter 262 – 261 BC', path: [[13.28, 37.39], [13.38, 37.37], [13.47, 37.33], [13.526, 37.308]] } },
  show: ['syracuse-262', 'lilybaeum-262'],
});

// --- the siege: the sortie at harvest time, then the ring of ditches and forts ---
writePlan(`${G}/020-agrigentum-siege`, {
  bbox,
  emblem: {
    water, works: [walls, lines],
    units: [...romanCamps, ...forts, unit('rome', 'light', 400, -2750, 1200, 90, WEST, nm('foragers', 'Roman foragers in the fields at harvest time'))],
    arrows: [arrow('carthage', [[-300, -1700], [100, -2300], [350, -2650]], 130, undefined, nm('sortie', 'Hannibal Gisco’s sortie against the foragers')),
      arrow('carthage', [[600, -1550], [700, -2600], [450, -3150]], 110, undefined, nm('sortie', 'Hannibal Gisco’s sortie against the foragers'))],
    clashes: [P(400, -2950)],
  },
  markers: {
    'agrigentum-siege-garrison': mark(150, 0, 'Hannibal Gisco', 'Garrison and 50,000 people', 'carthage'),
    'agrigentum-siege-south': mark(-2950, -1300, 'Roman camp', 'By the temple of Asklepios', 'rome', 'flag'),
    'agrigentum-siege-west': mark(-200, -4100, 'Roman camp', 'West of the city', 'rome', 'flag'),
    'agrigentum-siege-lines': mark(2100, 2600, 'Siege lines', 'Ditches and small forts', 'rome', 'fence'),
  },
});

// --- the relief army: the Numidian feint and the camp on Toros ---
writePlan(`${G}/030-agrigentum-relief`, {
  bbox,
  emblem: {
    water, works: [walls, lines],
    units: [...romanCamps, ...forts, toros, unit('carthage', 'infantry', -600, -6050, 1500, 300, EAST, nm('relief-army', 'Hanno’s relief army with mercenaries and elephants')),
      unit('carthage', 'cavalry', 500, -4350, 400, 150, EAST, nm('numidians', 'Numidian cavalry')), unit('rome', 'cavalry', -200, -4650, 450, 160, WEST, nm('roman-cavalry', 'Roman cavalry'))],
    arrows: [
      arrow('carthage', [[700, -5800], [900, -5000], [650, -4500]], 110, undefined, nm('numidian-charge', 'The Numidians ride at the Roman cavalry')),
      arrow('carthage', [[350, -4450], [250, -5100], [-100, -5750]], 110, undefined, nm('numidian-feint', 'The Numidians turn back in a feigned retreat')),
      arrow('rome', [[-150, -3950], [-350, -4900], [-550, -5800]], 110, undefined, nm('roman-pursuit', 'The Roman cavalry pursues onto the Carthaginian column')),
    ],
    clashes: [P(-450, -5860)],
  },
  markers: {
    'agrigentum-relief-hanno': mark(2950, -5900, 'Hanno', 'Camps on the hill of Toros', 'carthage', 'flag'),
    'agrigentum-relief-numidians': mark(1350, -4600, 'Numidian cavalry', 'Feigned retreat', 'carthage', 'swords'),
    'agrigentum-relief-romans': mark(-1500, -4600, 'Roman cavalry', 'Drawn onto the column', 'rome', 'skull'),
    'agrigentum-relief-garrison': mark(150, 0, 'Hannibal Gisco', 'Signals with smoke and fire', 'carthage'),
  },
});

// --- the battle west of the city, and the garrison's escape that night ---
const rf = -4400, c1 = rf - 50 - 110;
writePlan(`${G}/040-agrigentum-battle`, {
  bbox,
  emblem: {
    water, works: [walls, lines],
    units: [
      ...romanCamps, toros,
      unit('rome', 'infantry', 500, rf + 40, 2400, 80, WEST, nm('first-line', 'Roman infantry, first line')),
      unit('rome', 'infantry', 500, rf + 180, 2400, 80, WEST, nm('second-line', 'Roman infantry, second line')),
      unit('rome', 'infantry', 500, rf + 320, 2400, 80, WEST, nm('third-line', 'Roman infantry, third line')),
      unit('rome', 'cavalry', 2050, rf + 85, 500, 170, WEST, nm('roman-cavalry', 'Roman cavalry')), unit('rome', 'cavalry', -1050, rf + 85, 500, 170, WEST, nm('roman-cavalry', 'Roman cavalry')),
      unit('carthage', 'infantry', 500, c1, 2400, 220, EAST, nm('carthaginian-front', 'Hanno’s infantry, first line')),
      unit('carthage', 'elephants', 500, c1 - 400, 1800, 160, EAST, nm('elephants', 'Elephants and reserves, second line')),
      unit('carthage', 'cavalry', 2050, c1, 500, 180, EAST, nm('carthaginian-cavalry', 'Carthaginian cavalry')), unit('carthage', 'cavalry', -1050, c1, 500, 180, EAST, nm('carthaginian-cavalry', 'Carthaginian cavalry')),
    ],
    arrows: [
      arrow('rome', [[600, -4150], [600, -4800]], 170, undefined, nm('roman-advance', 'The Romans break the Carthaginian front')),
      arrow('carthage', [[400, -5150], [250, -5900], [-300, -6700]], 150, 'dashed', nm('reserves-flee', 'The reserves panic and flee')),
      arrow('rome', [[2050, -4550], [2150, -5150], [1950, -5550]], 120, undefined, nm('camp-taken', 'The Roman cavalry takes the Carthaginian camp')),
      arrow('carthage', [[1100, -1350], [1800, -2350], [2400, -3300], [2900, -4300]], 120, 'dashed', nm('breakout', 'Hannibal Gisco breaks out at night with his mercenaries')),
    ],
    clashes: [P(0, rf - 25), P(1000, rf - 25), P(2050, rf - 30)],
  },
  markers: {
    'agrigentum-battle-consuls': mark(-1300, -3700, 'Postumius and Mamilius', 'Break the Carthaginian front', 'rome'),
    'agrigentum-battle-hanno': mark(-1400, -5700, 'Hanno', 'Elephants and reserves flee', 'carthage'),
    'agrigentum-battle-camp': mark(2950, -5900, 'Carthaginian camp', 'Taken by the Roman cavalry', 'carthage', 'skull'),
    'agrigentum-battle-escape': mark(2600, -2900, 'Hannibal Gisco', 'Breaks out at night', 'carthage'),
  },
});

console.log('agrigentum: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(500, rf)));
