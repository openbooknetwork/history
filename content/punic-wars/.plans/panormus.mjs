// Panormus, late summer 250 BC. Hasdrubal comes down the Oreto valley and crosses the river near its mouth, south
// of the city; the ground up to the south wall is cut by earthworks; Metellus waits by a gate upstream (west).
// Frame: origin on the Oreto, u east, w south. The ancient walls are drawn roughly round the old town.
import { frame, writePlan } from './lib.mjs';

const f = frame([13.362, 38.099], 90), P = f.p;
const G = 'pages/020-first-war/060-panormus';
const bbox = f.box([[-1800, -2700], [2600, 1900]], 0);
const oreto = { path: [[13.31, 38.06], [13.325, 38.072], [13.34, 38.083], [13.352, 38.092], [13.362, 38.099], [13.372, 38.103], [13.382, 38.105], [13.391, 38.105]], width: 60, id: 'oreto', name: 'The river Oreto' };
const walls = { side: 'rome', path: f.path([[-1050, -1216], [650, -1300], [700, -2400], [-1000, -2540], [-1050, -1216]]), width: 45, id: 'walls', name: 'The walls of Panormus' };
const earthworks = [[[-450, -1020], [150, -980]], [[300, -1010], [950, -1090]], [[1100, -1000], [1450, -920]]].map(p => ({ side: 'rome', path: f.path(p), width: 25, id: 'earthworks', name: 'Earthworks between the river and the walls' }));
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 70, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: Hasdrubal's march from Lilybaeum ---
writePlan(`${G}/010-panormus`, {
  routes: { 'hasdrubal-250': { name: 'Hasdrubal marches from Lilybaeum to Panormus, late summer 250 BC', path: [[12.44, 37.8], [12.66, 37.9], [12.95, 37.97], [13.2, 38.02], [13.31, 38.06], [13.37, 38.1]] } },
  show: ['lilybaeum-250', 'thermae-252'],
});

// --- the elephants cross the Oreto and meet the skirmishers in the earthworks ---
writePlan(`${G}/020-panormus-elephants`, {
  bbox,
  emblem: {
    water: [oreto],
    works: [walls, ...earthworks],
    units: [
      unit('carthage', 'infantry', 750, 300, 1600, 300, 335, nm('carthaginian-army', 'Hasdrubal’s army, 30,000 men')),
      unit('carthage', 'infantry', 750, -720, 900, 200, 330, nm('vanguard', 'Carthaginian infantry across the river')),
      unit('carthage', 'elephants', 450, -930, 900, 80, 330, { count: 12, ...nm('elephants', 'Elephants driven into the earthworks') }),
      unit('rome', 'light', 250, -1120, 1100, 50, 150, nm('skirmishers', 'Roman light infantry, aiming at the elephants')),
      unit('rome', 'infantry', -850, -1110, 600, 260, 120, nm('legions', 'Metellus with his legions, out of sight by a gate')),
    ],
    arrows: [arrow('carthage', [[950, 120], [900, -250], [820, -560]], 90, undefined, nm('crossing', 'Part of the Carthaginian army crosses the Oreto')),
      arrow('rome', [[0, -1850], [0, -1320]], 40, undefined, nm('javelins', 'Townspeople carry javelins from the city’s stores to the walls')),
      arrow('rome', [[400, -1900], [400, -1360]], 40, undefined, nm('javelins', 'Townspeople carry javelins from the city’s stores to the walls'))],
    clashes: [P(300, -1040)],
  },
  markers: {
    'panormus-elephants-city': mark(-250, -1950, 'Panormus', 'Javelins carried to the walls', 'rome', 'castle'),
    'panormus-elephants-metellus': mark(-1000, -800, 'Metellus', 'Two legions, hidden by a gate', 'rome'),
    'panormus-elephants-skirmishers': mark(1150, -1300, 'Roman skirmishers', 'Javelins at the elephants', 'rome', 'swords'),
    'panormus-elephants-hasdrubal': mark(750, 650, 'Hasdrubal', '30,000 men, 60 to 142 elephants', 'carthage'),
  },
});

// --- the elephants panic, Metellus attacks the Carthaginian left, the army flees up the valley ---
writePlan(`${G}/030-panormus-rout`, {
  bbox,
  emblem: {
    water: [oreto],
    works: [walls, ...earthworks],
    units: [
      unit('carthage', 'infantry', 950, -620, 800, 250, 330, nm('vanguard', 'Carthaginian infantry, thrown into disorder by the elephants')),
      unit('carthage', 'elephants', 850, -60, 700, 80, 150, { count: 9, ...nm('elephants', 'The elephants panic and turn back through their own infantry') }),
      unit('carthage', 'infantry', 700, 420, 1300, 300, 335, nm('carthaginian-army', 'The rest of Hasdrubal’s army')),
      unit('rome', 'light', 250, -1120, 1100, 50, 150, nm('skirmishers', 'Roman light infantry')),
      unit('rome', 'infantry', -650, -900, 500, 260, 100, nm('legions', 'Metellus’s legions, out of the gate')),
    ],
    arrows: [
      arrow('carthage', [[550, -860], [700, -450], [900, 150]], 70, 'dashed', nm('elephants-turn', 'The elephants stampede back')),
      arrow('rome', [[-350, -880], [100, -760], [520, -660]], 100, undefined, nm('metellus-attacks', 'Metellus attacks the Carthaginian left flank')),
      arrow('carthage', [[500, 300], [-300, 900], [-1400, 1650]], 90, 'dashed', nm('flight', 'The Carthaginian army flees up the valley')),
    ],
    clashes: [P(560, -640)],
  },
  markers: {
    'panormus-rout-elephants': mark(1350, 50, 'Elephants', 'Panic and turn back', 'carthage', 'swords'),
    'panormus-rout-metellus': mark(-650, -650, 'Metellus', 'Attacks the Carthaginian left', 'rome'),
    'panormus-rout-flight': mark(-1300, 1350, 'Carthaginians', 'Flee up the valley', 'carthage', 'skull'),
  },
});

console.log('panormus: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(400, -800)));
