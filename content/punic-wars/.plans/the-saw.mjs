// The Saw, 238 BC. The site is unknown; the plan stands at the foot of the hills south of Tunis, as the battle
// card always has. Rebels pinned against the hills to the south, Hamilcar's three divisions fortified around them.
// Frame: origin on the plain, u east, w south.
import { frame, writePlan } from './lib.mjs';

const f = frame([10.1, 36.42], 90), P = f.p;
const G = 'pages/030-interwar/010-mercenary-war';
// the rebels have no family in this story, so their blocks take a colour of their own
const REBELS = '#9a7a50';
const bbox = f.box([[-4600, -2000], [4600, 3000]], 0);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 120, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, note });
const lines = { side: 'carthage', path: f.path([[-3300, 2300], [-3200, 400], [-2300, -500], [0, -700], [2300, -500], [3200, 400], [3300, 2300]]), width: 40, ...nm('carthaginian-lines', 'Carthaginian fortified positions closing the way out') };

// --- overview: the mutiny, Hamilcar at the Bagradas ---
writePlan(`${G}/010-mercenary-war`, {
  routes: {
    'rebels-241': { name: 'The army marches from Sicca and seizes Tunis, 241 BC', path: [[8.71, 36.18], [9.2, 36.4], [9.75, 36.62], [10.16, 36.79]] },
    'hamilcar-240': { name: 'Hamilcar forces the Bagradas and routs the rebels, 240 BC', path: [[10.32, 36.86], [10.2, 36.95], [10.05, 37.0], [9.92, 36.95], [9.78, 36.86]] },
  },
  show: ['carthage-241', 'sicca-241', 'utica-240', 'hippo-240'],
});

// --- the trap: the rebels against the hills, the Carthaginian lines closing the way out ---
writePlan(`${G}/020-mercenary-war-trap`, {
  bbox,
  emblem: {
    works: [lines],
    units: [
      unit(REBELS, 'infantry', -1600, 1300, 1300, 500, 0, nm('rebels', 'The rebel army under Spendius, Autaritus and Zarzas, more than 40,000 men')),
      unit(REBELS, 'infantry', 0, 1150, 1600, 600, 0, nm('rebels', 'The rebel army under Spendius, Autaritus and Zarzas, more than 40,000 men')),
      unit(REBELS, 'infantry', 1600, 1300, 1300, 500, 0, nm('rebels', 'The rebel army under Spendius, Autaritus and Zarzas, more than 40,000 men')),
      unit(REBELS, 'cavalry', -2600, 1650, 450, 200, 0, nm('rebel-cavalry', 'Rebel cavalry')),
      unit('carthage', 'infantry', 0, -1050, 1600, 300, 180, nm('hamilcar', 'Hamilcar’s division')),
      unit('carthage', 'elephants', 0, -820, 1300, 80, 180, { count: 14, ...nm('elephants', 'Carthaginian elephants') }),
      unit('carthage', 'infantry', -3700, 900, 1100, 300, 90, nm('hannibal', 'Second division under Hannibal, Hamilcar’s deputy')),
      unit('carthage', 'cavalry', 3750, 900, 1000, 300, 270, nm('naravas', 'Numidian cavalry under Naravas')),
    ],
    arrows: [arrow(REBELS, [[-4300, -1900], [-2700, -400], [-1300, 500]], 120, undefined, nm('rebels-march', 'The rebels move against the hills of the Saw'))],
  },
  markers: {
    'mercenary-war-trap-saw': mark(0, 2750, 'The Saw', 'Hills named for their jagged outline', null, 'mountain'),
    'mercenary-war-trap-spendius': mark(0, 1750, 'Spendius', '40,000 rebels, no food', 'gauls'),
    'mercenary-war-trap-hamilcar': mark(0, -1800, 'Hamilcar', 'Fortifies the way out', 'carthage'),
    'mercenary-war-trap-hannibal': mark(-3700, 1800, 'Hannibal', 'Second division', 'carthage'),
    'mercenary-war-trap-naravas': mark(3750, 1800, 'Naravas', 'Numidian cavalry', 'carthage'),
  },
});

// --- the end: the leaders seized at the parley, the whole army led by the elephants attacks ---
writePlan(`${G}/030-mercenary-war-saw`, {
  bbox,
  emblem: {
    works: [lines],
    units: [
      unit(REBELS, 'infantry', -1200, 1750, 1000, 500, 0, nm('rebels', 'The starving rebels, without their leaders')),
      unit(REBELS, 'infantry', 0, 1650, 1300, 500, 0, nm('rebels', 'The starving rebels, without their leaders')),
      unit(REBELS, 'infantry', 1200, 1750, 1000, 500, 0, nm('rebels', 'The starving rebels, without their leaders')),
      unit('carthage', 'elephants', 0, 950, 1500, 80, 180, { count: 15, ...nm('elephants', 'The elephants, in front of the Carthaginian army') }),
      unit('carthage', 'infantry', 0, 550, 1700, 300, 180, nm('hamilcar', 'Hamilcar’s division')),
      unit('carthage', 'infantry', -2600, 1350, 900, 300, 90, nm('hannibal', 'Hannibal’s division')),
      unit('carthage', 'cavalry', 2700, 1350, 900, 300, 270, nm('naravas', 'Numidian cavalry under Naravas')),
    ],
    arrows: [
      arrow('carthage', [[-1000, 750], [-1100, 1400]], 110, undefined, nm('attack', 'The whole Carthaginian army attacks, the elephants in front')),
      arrow('carthage', [[0, 700], [0, 1300]], 110, undefined, nm('attack', 'The whole Carthaginian army attacks, the elephants in front')),
      arrow('carthage', [[1000, 750], [1100, 1400]], 110, undefined, nm('attack', 'The whole Carthaginian army attacks, the elephants in front')),
      arrow('carthage', [[-2100, 1350], [-1750, 1600]], 100, undefined, nm('flank-attack', 'The other divisions close in from the sides')),
      arrow('carthage', [[2200, 1350], [1750, 1600]], 100, undefined, nm('flank-attack', 'The other divisions close in from the sides')),
    ],
    clashes: [P(-1100, 1420), P(0, 1330), P(1100, 1420)],
  },
  markers: {
    'mercenary-war-saw-leaders': mark(-2000, -900, 'Spendius, Autaritus, Zarzas', 'Seized at the parley', 'gauls'),
    'mercenary-war-saw-rebels': mark(2300, 2300, 'Rebel army', 'All killed', 'gauls', 'skull'),
    'mercenary-war-saw-hamilcar': mark(0, -50, 'Hamilcar', 'The elephants lead the attack', 'carthage'),
  },
  show: ['mercenary-war-trap-saw'],
});

// --- Tunis and Leptis Parva ---
writePlan(`${G}/040-mercenary-war-end`, {
  routes: {
    'hamilcar-238': { name: 'Hamilcar marches on Tunis, late 238 BC', path: [P(0, -700), [10.13, 36.6], [10.15, 36.72], [10.165, 36.775]] },
    'mathos-238': { name: 'Matho leads the rebel army south to Leptis Parva', path: [[10.18, 36.79], [10.35, 36.55], [10.5, 36.25], [10.63, 35.95], [10.85, 35.7]] },
    'carthaginians-238': { name: 'Hanno and Hamilcar follow with more than 25,000 men', offset: 6, path: [[10.32, 36.85], [10.4, 36.55], [10.54, 36.25], [10.66, 35.95], [10.86, 35.72]] },
  },
  show: ['tunis-238', 'leptis-parva-238', 'utica-240', 'hippo-240'],
});

console.log('the-saw: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 1300)));
