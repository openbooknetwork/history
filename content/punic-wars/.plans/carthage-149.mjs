// Siege of Carthage, 149 to 146 BC. The city fills a peninsula between the Sebkha of Ariana to the north, the
// Lake of Tunis to the south and the sea. The triple land wall crosses the isthmus, the ports lie on the coast
// below the Byrsa. The map's coast runs about 600 m inland of the real one here, so the ports, walls and Byrsa
// are placed against the map's coast, in their real relation to each other.
// Frame: origin at the circular naval harbour, u north, w east, in metres.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/060-third-war/010-siege-of-carthage';
const f = frame([10.313, 36.8475], 0), P = f.p, path = f.path;
const city = [10.23, 36.8, 10.37, 36.9], ports = [10.294, 36.83, 10.334, 36.862];
const circle = (u, w, r, n = 24) => [...Array(n + 1)].map((_, k) => [u + r * Math.cos(2 * Math.PI * k / n), w + r * Math.sin(2 * Math.PI * k / n)]);

const wall = (pts, id, name) => ({ side: 'neutral', width: 45, path: path(pts), id, name });
const landWall = { side: 'neutral', width: 70, path: path([[-430, -2900], [3700, -2900]]), id: 'land-wall', name: 'The triple wall across the isthmus' };
const walls = [
  landWall,
  wall([[3700, -2900], [4050, -2250], [4600, -1600], [4900, -200], [4950, 1300], [4900, 2050]], 'megara-wall', 'The wall round Megara'),
  wall([[4900, 2050], [4300, 2620], [3620, 3060], [3000, 2850], [2350, 2420], [1400, 1530], [700, 870], [321, 515], [0, 385], [-400, 210], [-700, 80]], 'sea-wall', 'The sea wall'),
  wall([[-700, 80], [-760, -700], [-680, -1700], [-430, -2900]], 'lake-wall', 'The wall along the Lake of Tunis'),
];
const byrsa = { side: 'neutral', width: 40, path: path(circle(700, -250, 220)), id: 'byrsa', name: 'The Byrsa, the citadel' };
const sebkha = { area: path([[3700, -5800], [3650, -4500], [3750, -3200], [4050, -2350], [4600, -1750], [5500, -1700], [6200, -2400], [6200, -5800]]), id: 'sebkha', name: 'The Sebkha of Ariana' };
const harbours = [
  { path: path(circle(0, 0, 110)), width: 110, id: 'naval-harbour', name: 'The circular naval harbour' },                                          // the circular naval harbour round its island
  { area: path([[-600, -190], [-600, 70], [-200, 70], [-200, -190]]), id: 'merchant-harbour', name: 'The merchant harbour' },                  // the rectangular merchant harbour
  { path: path([[-200, -40], [-110, -15]]), width: 50, id: 'passage', name: 'The passage between the harbours' },                                   // the passage between them
  { path: path([[-600, -40], [-700, 50], [-800, 170]]), width: 60, id: 'old-entrance', name: 'The old harbour entrance' },                      // the old entrance, closed by the mole
];
const newChannel = { path: path([[60, 150], [40, 300], [30, 520]]), width: 55, id: 'new-channel', name: 'The new channel cut to the open sea' };
const choma = { side: 'neutral', width: 90, path: path([[-650, 235], [-350, 380], [-100, 500]]), id: 'quay', name: 'The broad quay in front of the harbour wall' };
const mole = { side: 'rome', width: 80, path: path([[-1650, -170], [-1300, 100], [-1000, 300], [-820, 400]]), id: 'mole', name: 'Scipio’s mole across the harbour entrance' };
const brickWall = { side: 'rome', width: 50, path: path([[-560, 340], [-300, 465]]), id: 'brick-wall', name: 'The Roman brick wall on the quay' };
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 90, style, extra = {}) => ({ side, path: path(pts), width, ...(style ? { style } : {}), ...extra });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: the crossing to Utica, the weapons handed over, the march on Carthage ---
writePlan(`${G}/010-siege-of-carthage`, {
  routes: {
    'consuls-149': { name: 'The consuls cross from Lilybaeum to Utica, 149 BC', path: [[12.44, 37.8], [11.8, 37.6], [11.0, 37.35], [10.4, 37.18], [10.1, 37.07]] },
    'weapons-149': { name: 'Carthage’s weapons and warships go to Utica', style: 'dashed', path: [[10.315, 36.86], [10.3, 36.95], [10.2, 37.03], [10.08, 37.06]] },
    'manilius-149': { name: 'The Roman army marches on Carthage, 149 BC', offset: 6, path: [[10.06, 37.05], [10.12, 36.97], [10.2, 36.9], [10.262, 36.87]] },
  },
  show: ['utica-149', 'nepheris-149'],
});

// --- 149 to 148 BC: the assaults on the land wall and the breach by the lake ---
writePlan(`${G}/020-siege-of-carthage-assaults`, {
  bbox: city,
  emblem: {
    water: [sebkha, ...harbours],
    works: [...walls, byrsa],
    units: [
      unit('rome', 'camp', 1800, -4350, 550, 450, 90, { id: 'manilius-camp', name: 'Manilius’s camp' }),
      unit('rome', 'infantry', 1800, -3600, 1200, 300, 90, { id: 'manilius', name: 'Manilius’s army before the land wall' }),
      unit('rome', 'camp', 330, -3700, 450, 350, 90, { id: 'censorinus-camp', name: 'Censorinus’s camp by the lake' }),
      unit('rome', 'infantry', 120, -3250, 600, 250, 60, { id: 'censorinus', name: 'Censorinus’s men at the breach by the lake' }),
      unit('rome', 'ships', -2350, -150, 1400, 500, 45, { count: 8, rows: 2, id: 'roman-fleet', name: 'The Roman fleet' }),
      unit('carthage', 'infantry', 1600, -2550, 2200, 220, 270, { id: 'defenders', name: 'Defenders on the land wall' }),
      unit('carthage', 'infantry', -150, -2600, 500, 200, 250, { id: 'breach-defenders', name: 'Defenders at the breach' }),
    ],
    arrows: [
      arrow('rome', [[1800, -3420], [1750, -3050]], 110, undefined, { id: 'land-assault', name: 'Manilius assaults the land wall' }),
      arrow('rome', [[150, -3110], [-150, -2950]], 110, undefined, { id: 'breach-assault', name: 'Censorinus storms the breach' }),
      arrow('carthage', [[-300, -2700], [-120, -2980]], 90, undefined, { id: 'counterattack', name: 'The Carthaginians throw the Romans back' }),
      arrow('carthage', [[-820, 260], [-1450, 120], [-2050, -40]], 80, undefined, { id: 'fireships', name: 'Fireships sent against the Roman fleet' }),
    ],
    clashes: [[1760, -2960], [-170, -2950], { at: P(-2120, -60), size: 180 }].map(c => Array.isArray(c) ? P(...c) : c),
  },
  markers: {
    'carthage-149-manilius': mark(2300, -4850, 'Manilius', 'Assaults the land wall', 'rome'),
    'carthage-149-censorinus': mark(650, -4250, 'Censorinus', 'Rams breach the wall by the lake', 'rome'),
    'carthage-149-scipio': mark(-450, -3700, 'Scipio Aemilianus', 'Covers the retreat from the breach', 'rome'),
    'carthage-149-fireships': mark(-1500, 700, 'Fireships', 'Sent against the Roman fleet', 'carthage', 'flame'),
  },
});

// --- 147 BC: Mancinus at the sally port, the night attack on Megara, Scipio's line across the isthmus ---
writePlan(`${G}/030-siege-of-carthage-scipio`, {
  bbox: city,
  emblem: {
    water: [sebkha, ...harbours],
    works: [...walls, byrsa, { side: 'rome', width: 55, path: path([[60, -3350], [3700, -3350]]), id: 'isthmus-line', name: 'Scipio’s fortified line across the isthmus' }],
    units: [
      unit('rome', 'camp', 1900, -3850, 600, 450, 90, { id: 'scipio-camp', name: 'Scipio’s camp on the isthmus' }),
      unit('rome', 'ships', 3300, 4200, 1200, 450, 225, { count: 6, rows: 2, id: 'mancinus-fleet', name: 'The fleet of Mancinus' }),
      unit('carthage', 'infantry', 2600, -2550, 1600, 220, 270, { id: 'defenders', name: 'Defenders on the land wall' }),
      unit('carthage', 'infantry', 2650, 2350, 700, 200, 45, { id: 'sally-port', name: 'Carthaginians counterattacking at the sally port' }),
    ],
    arrows: [
      arrow('rome', [[3500, 3600], [3200, 3150], [2900, 2750]], 100, undefined, { id: 'mancinus-attack', name: 'Mancinus forces a sally port with 3,500 men' }),
      arrow('rome', [[2750, 2950], [3050, 3350], [3300, 3800]], 90, 'dashed', { id: 'mancinus-rescue', name: 'Scipio takes Mancinus’s men off by sea' }),
      arrow('rome', [[2700, -3750], [2800, -3000], [2950, -2200], [3100, -1500]], 110, undefined, { id: 'megara-attack', name: 'The night assault on Megara with 4,000 men' }),
      arrow('rome', [[3350, -1550], [3250, -2300], [3150, -3050]], 90, 'dashed', { id: 'megara-withdrawal', name: 'Scipio withdraws from Megara before daylight' }),
    ],
    clashes: [P(2820, 2700), P(2880, -2900)],
  },
  markers: {
    'carthage-147-mancinus': mark(3750, 4100, 'Mancinus', 'Breaks in, then taken off', 'rome', 'ship'),
    'carthage-147-scipio': mark(2350, -4700, 'Scipio', 'Attacks Megara, closes the isthmus', 'rome'),
    'carthage-147-megara': mark(3400, -400, 'Megara', 'Gardens and villas inside the walls', 'carthage', 'landmark'),
    'carthage-147-hasdrubal': mark(700, -1300, 'Hasdrubal', 'Kills Roman prisoners on the walls', 'carthage'),
  },
});

// --- 147 BC: the mole, the new channel and the battle at the harbour mouth ---
writePlan(`${G}/040-siege-of-carthage-mole`, {
  bbox: ports,
  emblem: {
    water: [...harbours, newChannel],
    works: [...walls.slice(2), byrsa, choma, mole, brickWall],
    units: [
      unit('carthage', 'ships', 120, 1050, 900, 520, 90, { count: 10, rows: 2, id: 'new-fleet', name: 'The new Carthaginian fleet, 50 triremes and small craft' }),
      unit('rome', 'ships', -150, 1720, 1300, 520, 270, { count: 12, rows: 2, id: 'roman-fleet', name: 'The Roman fleet' }),
      unit('carthage', 'ships', -280, 640, 500, 230, 90, { count: 4, id: 'trapped-ships', name: 'Carthaginian ships caught against the sea wall' }),
      unit('rome', 'ships', -1150, 520, 600, 260, 300, { count: 4, id: 'mole-ships', name: 'Roman ships by the mole' }),
    ],
    arrows: [
      arrow('carthage', [[40, 520], [80, 700], [110, 820]], 70, undefined, { id: 'sortie', name: 'The new fleet sails out through the channel' }),
      arrow('rome', [[-250, 1380], [-260, 950], [-275, 780]], 80, undefined, { id: 'roman-attack', name: 'The Romans fall on the ships at the sea wall' }),
    ],
    clashes: [P(0, 1390), P(-275, 760)],
  },
  markers: {
    'carthage-mole-mole': mark(-1450, 300, 'Scipio’s mole', 'Closes the harbour entrance', 'rome'),
    'carthage-mole-channel': mark(250, 250, 'New channel', 'Cut to the open sea', 'carthage', 'waves'),
    'carthage-mole-fleet': mark(720, 1120, 'Carthaginian fleet', '50 triremes and small craft', 'carthage', 'ship'),
    'carthage-mole-quay': mark(-700, 520, 'The quay', 'Taken, a brick wall built on it', 'rome', 'castle'),
    'carthage-mole-byrsa': mark(700, -250, 'Byrsa', 'The citadel', 'carthage', 'castle'),
  },
});

// --- spring 146 BC: the assault from the quay, the naval harbour taken, the main square reached ---
const final = f.box([[-800, -900], [1300, 950]], 0);
writePlan(`${G}/050-fall-of-carthage`, {
  bbox: final,
  emblem: {
    water: harbours.concat(newChannel),
    works: [...walls.slice(2), byrsa, choma, brickWall],
    units: [
      unit('rome', 'infantry', -470, 440, 300, 120, 300, { id: 'quay-force', name: 'Roman troops on the quay' }),
      unit('rome', 'infantry', 70, 190, 160, 90, 270, { id: 'laelius', name: 'Laelius’s party in the naval harbour' }),
      unit('rome', 'infantry', 380, 260, 260, 120, 225, { id: 'main-force', name: 'The main force at the main square' }),
      unit('carthage', 'infantry', 700, -250, 220, 100, 45, { id: 'byrsa-defenders', name: 'Carthaginians falling back to the Byrsa' }),
    ],
    arrows: [
      arrow('rome', [[-320, 470], [-180, 330], [-30, 210]], 45, undefined, { id: 'harbour-wall', name: 'Laelius climbs the wall of the naval harbour' }),
      arrow('rome', [[-200, 540], [80, 450], [300, 330]], 55, undefined, { id: 'to-square', name: 'The main force reaches the main square' }),
      arrow('carthage', [[520, 120], [590, 20], [640, -60]], 45, 'dashed', { id: 'fall-back', name: 'The Carthaginians fall back below the citadel' }),
    ],
    clashes: [{ at: P(-90, 250), size: 70 }],
  },
  markers: {
    'carthage-146-laelius': mark(-280, 820, 'Laelius', 'Takes the naval harbour', 'rome'),
    'carthage-146-square': mark(520, 620, 'Main square', 'The legions camp for the night', 'rome', 'flag'),
    'carthage-146-fire': mark(-460, -430, 'Merchant harbour', 'Set on fire by Hasdrubal', 'carthage', 'flame'),
    'carthage-146-byrsa': mark(980, -560, 'Byrsa', 'The Carthaginians fall back', 'carthage', 'castle'),
  },
});

// --- spring 146 BC: six days up the three streets to the Byrsa ---
writePlan(`${G}/060-fall-of-carthage-byrsa`, {
  bbox: final,
  emblem: {
    water: harbours.concat(newChannel),
    works: [...walls.slice(2), byrsa, choma, brickWall],
    units: [
      unit('rome', 'infantry', 300, 270, 240, 110, 225, { id: 'square-force', name: 'Romans moving up from the main square' }),
      unit('rome', 'infantry', 960, 60, 220, 100, 220, { id: 'east-force', name: 'Romans closing in from the east' }),
      unit('rome', 'infantry', 430, -580, 220, 100, 40, { id: 'south-force', name: 'Romans closing in from the south' }),
      unit('carthage', 'infantry', 700, -250, 200, 100, 45, { id: 'byrsa-defenders', name: 'The last defenders on the Byrsa' }),
    ],
    arrows: [
      arrow('rome', [[330, 180], [430, 60], [520, -50]], 40, undefined, { id: 'streets', name: 'Up the three streets, house by house' }),
      arrow('rome', [[240, 120], [330, -10], [450, -120]], 40, undefined, { id: 'streets', name: 'Up the three streets, house by house' }),
      arrow('rome', [[430, 260], [560, 150], [640, 20]], 40, undefined, { id: 'streets', name: 'Up the three streets, house by house' }),
      arrow('carthage', [[930, -230], [1060, -160], [1180, -90]], 40, 'dashed', { id: 'prisoners', name: '50,000 people come down from the citadel' }),
    ],
    clashes: [{ at: P(530, -60), size: 60 }, { at: P(645, 0), size: 60 }],
  },
  markers: {
    'carthage-byrsa-eshmoun': mark(1060, -580, 'Temple of Eshmoun', '900 deserters burn it around themselves', 'carthage', 'flame'),
    'carthage-byrsa-hasdrubal': mark(330, -820, 'Hasdrubal', 'Surrenders to Scipio', 'carthage'),
    'carthage-byrsa-prisoners': mark(1300, 60, '50,000 prisoners', 'Come down from the citadel', 'carthage', 'users'),
    'carthage-byrsa-streets': mark(230, -400, 'Three streets', 'Fought through house by house', 'rome', 'swords'),
  },
});

console.log('carthage-149: Byrsa at', JSON.stringify(P(700, -250)));
