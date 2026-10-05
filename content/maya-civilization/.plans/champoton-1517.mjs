// Champotón, 1517. Hernández de Córdoba's watering party, camped at wells by the shore near the mouth of the
// Champotón River, is surrounded at dawn and fights its way back to the boats (Clendinnen, Bernal Díaz).
// The exact landing place is not recorded: the plan puts the wells on the shore 1.2 km south-west of the river mouth.
// Frame: origin on the shore at the wells, u north-east along the coast the map draws, w inland towards the town.
// Units and gaps are drawn larger than real, as the README's "Drawn size" asks.
import { frame, writePlan } from './lib.mjs';

const f = frame([-90.7482, 19.3346], 39), P = f.p, LAND = f.face(90), SEA = f.face(270);
const G = 'pages/070-first-contact/030-champoton';
const river = { path: f.path([[1200, -80], [1230, 250], [1330, 600], [1420, 1000], [1600, 1400]]), width: 60, id: 'river', name: 'The Champotón River' };
// north-up and square, so the rotated frame does not widen the view
const bbox = frame(P(63, 78), 0).box([[-750, -750], [750, 750]], 0);
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const clash = (u, w) => ({ at: P(u, w), size: 40 });
const ships = unit('spain', 'ships', -100, -600, 200, 60, SEA, 'ships', 'Two ships and the brigantine at anchor, kept off by the shallows', { count: 3 });
const shipsMark = note => mark(-200, -510, 'The fleet', note, 'spain', 'ship');

// --- overview: from Campeche to Champotón ---
writePlan(`${G}/010-champoton`, {
  routes: {
    'cordoba-champoton-1517': { name: 'Hernández de Córdoba sails on from Campeche to Champotón, 1517', path: [[-90.62, 19.88], [-90.76, 19.72], [-90.8, 19.52], [-90.79, 19.38], [-90.765, 19.345]] },
  },
  markers: {},
  show: ['campeche-1517'],
});

// --- dawn: the watering party surrounded on the landward side ---
writePlan(`${G}/020-champoton-dawn`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      unit('spain', 'infantry', 0, 100, 80, 36, LAND, 'party', 'Hernández de Córdoba’s landing party at the wells'),
      unit('spain', 'ships', 0, -45, 90, 50, SEA, 'boats', 'The ships’ boats on the beach', { count: 3 }),
      ships,
      unit('chontal', 'infantry', 0, 300, 420, 90, SEA, 'warriors', 'Warriors of Champotón under Moch Couoh, with spears and clubs'),
      unit('chontal', 'archers', 0, 390, 480, 30, SEA, 'archers', 'Archers and slingers'),
      unit('chontal', 'infantry', -165, 105, 200, 60, f.face(0), 'wings', 'Warriors of Champotón closing on the flank'),
      unit('chontal', 'infantry', 165, 105, 200, 60, f.face(180), 'wings', 'Warriors of Champotón closing on the flank'),
    ],
    arrows: [
      arrow('chontal', [[0, 255], [0, 112]], 24, 'attack', 'The Maya close in with spears and clubs'),
      arrow('chontal', [[560, 360], [400, 320], [240, 300]], 28, 'reinforcements', 'Fresh squadrons from the town'),
    ],
    clashes: [clash(0, 210), clash(-87, 100), clash(87, 100)],
  },
  markers: {
    'champoton-dawn-cordoba': mark(-140, -170, 'Hernández de Córdoba', 'Hit by many arrows', 'spain'),
    'champoton-dawn-moch-couoh': mark(0, 470, 'Moch Couoh', 'Lord of Champotón', 'chontal'),
    'champoton-dawn-town': mark(560, 420, 'Champotón', 'Chakán Putum', 'chontal', 'landmark'),
    'champoton-dawn-captives': mark(390, 0, 'Two Spaniards', 'Taken alive', 'spain', 'skull'),
    'champoton-dawn-ships': shipsMark('Two ships and a brigantine'),
  },
});

// --- the breakout to the boats: the warriors wade into the sea after them ---
writePlan(`${G}/030-champoton-boats`, {
  bbox,
  emblem: {
    water: [river],
    units: [
      unit('spain', 'ships', -150, -275, 90, 50, SEA, 'boats', 'The overloaded boats, survivors clinging to the gunwales', { count: 3 }),
      ships,
      unit('chontal', 'irregular', 100, -130, 260, 50, SEA, 'waders', 'Warriors wading into the sea after the boats'),
      unit('chontal', 'infantry', 0, 120, 420, 90, SEA, 'warriors', 'Warriors of Champotón on the beach'),
      unit('chontal', 'archers', 0, 220, 480, 30, SEA, 'archers', 'Archers and slingers'),
    ],
    arrows: [
      arrow('spain', [[0, 110], [-80, 20], [-140, -225]], 26, 'breakout', 'The Spaniards cut their way to the boats', 'dashed'),
      arrow('spain', [[-150, -310], [-140, -420], [-110, -560]], 26, 'escape', 'The boats make for the ships', 'dashed'),
      arrow('chontal', [[0, -160], [-60, -225], [-100, -265]], 26, 'pursuit', 'The warriors wade in after the boats'),
    ],
    clashes: [clash(-20, 25)],
  },
  markers: {
    'champoton-boats-losses': mark(-330, -260, 'Spanish losses', '57 lost, by Bernal Díaz', 'spain', 'skull'),
    'champoton-boats-casks': mark(300, 30, 'Water casks', 'Left on the beach', 'spain', 'flag'),
    'champoton-boats-ships': shipsMark('Brigantine burned after the battle'),
  },
});

console.log('champoton-1517: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 200)));
