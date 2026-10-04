// Mylae, 260 BC, off the peninsula of Mylae (Milazzo). The exact place is unknown: drawn north-west of the cape,
// the Carthaginians coming from Panormus in the west, Duilius from Messana around the cape in the east.
// Frame: origin at sea west of the cape, u north, w east.
import { frame, writePlan } from './lib.mjs';

const f = frame([15.17, 38.29], 0), P = f.p, EAST = 90, WEST = 270;
const G = 'pages/020-first-war/030-mylae';
const bbox = f.box([[-3800, -3600], [4000, 6400]], 0);
const ships = (side, u, w, width, depth, facing, count, rows = 1, extra = {}) => ({ side, type: 'ships', at: P(u, w), width, depth, facing, count, rows, ...extra });
const arrow = (side, pts, width = 130, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'ship') => ({ lnglat: P(u, w), icon, color, label, note });
const roman = ships('rome', 0, 1800, 3200, 500, WEST, 18, 2, nm('roman-fleet', 'Roman fleet under Duilius, with a corvus on every ship'));
const cape = mark(-2300, 5600, 'Cape of Mylae', 'Mylae lies at its base', undefined, 'landmark');

// --- overview: the two fleets' approach, and Scipio's loss at Lipara ---
writePlan(`${G}/010-mylae`, {
  routes: {
    'scipio-260': { name: 'Scipio sails to Lipara with 17 ships and is captured, 260 BC', style: 'dashed', path: [[15.57, 38.2], [15.64, 38.28], [15.4, 38.4], [15.15, 38.45], [14.98, 38.47]] },
    'hannibal-gisco-260': { name: 'Hannibal Gisco’s fleet from Panormus, 260 BC', path: [[13.37, 38.15], [13.8, 38.12], [14.3, 38.08], [14.75, 38.2], [15.0, 38.26], [15.155, 38.29]] },
    'duilius-260': { name: 'Duilius’s fleet from Messana, 260 BC', path: [[15.57, 38.2], [15.65, 38.285], [15.5, 38.31], [15.32, 38.31], [15.2, 38.29]] },
  },
  show: ['lipara-260', 'panormus-260'],
});

// --- the onrush: the Carthaginian vanguard is caught by the corvi ---
const vw = 1800 - 250 - 60 - 125;
writePlan(`${G}/020-mylae-corvus`, {
  bbox,
  emblem: {
    units: [roman, ships('carthage', 0, vw, 2000, 250, EAST, 10, 1, nm('vanguard', 'Carthaginian vanguard under Hannibal Gisco, the fastest ships')),
      ships('carthage', 0, -800, 3600, 500, EAST, 18, 2, nm('main-fleet', 'The rest of the Carthaginian fleet, 130 ships in all'))],
    arrows: [arrow('carthage', [[-700, -400], [-700, 1150]], 120, undefined, nm('onrush', 'The Carthaginians race at the Roman fleet without forming a line')),
      arrow('carthage', [[700, -400], [700, 1150]], 120, undefined, nm('onrush', 'The Carthaginians race at the Roman fleet without forming a line'))],
    clashes: [P(-800, 1490), P(0, 1490), P(800, 1490)],
  },
  markers: {
    'mylae-corvus-duilius': mark(0, 3100, 'Duilius', 'Corvi raised at the bows', 'rome', 'user'),
    'mylae-corvus-hannibal': mark(-1700, 600, 'Hannibal Gisco', 'The fastest ships race ahead', 'carthage', 'user'),
    'mylae-corvus-main': mark(2500, -800, 'Carthaginian fleet', '130 ships by Polybius', 'carthage'),
    'mylae-corvus-cape': cape,
  },
});

// --- the flanks: the rest swing wide, more ships are grappled, the survivors flee ---
writePlan(`${G}/030-mylae-flanks`, {
  bbox,
  emblem: {
    units: [roman, ships('neutral', 0, vw, 2000, 250, EAST, 10, 1, nm('captured', 'The first 30 Carthaginian ships, taken with the flagship')),
      ships('carthage', 2000, 1700, 1400, 300, 180, 7, 1, nm('flank-squadron', 'Carthaginian ships attacking the flank')),
      ships('carthage', -1000, 2350, 1400, 300, WEST, 7, 1, nm('rear-squadron', 'Carthaginian ships going round to the rear'))],
    arrows: [
      arrow('carthage', [[900, -900], [2200, -400], [2300, 1000]], 120, undefined, nm('flank-attack', 'Carthaginian ships swing wide to the flank')),
      arrow('carthage', [[-900, -900], [-2600, -200], [-2700, 1800], [-1900, 2450]], 120, undefined, nm('rear-attack', 'Carthaginian ships go round to the rear')),
      arrow('carthage', [[2400, 1300], [2700, -800], [2400, -3000]], 120, 'dashed', nm('escape', 'The surviving Carthaginian ships break off and escape')),
      arrow('carthage', [[-1800, 2650], [-3100, 1600], [-3100, -1000], [-2500, -3000]], 120, 'dashed', nm('escape', 'The surviving Carthaginian ships break off and escape')),
    ],
    clashes: [P(1720, 1800), P(-1000, 2120)],
  },
  markers: {
    'mylae-flanks-captured': mark(-600, -300, 'Captured ships', 'The first 30, with the flagship', undefined, 'skull'),
    'mylae-flanks-north': mark(3200, 1700, 'Carthaginian squadron', 'Attacks the flank', 'carthage'),
    'mylae-flanks-south': mark(-2900, 2500, 'Carthaginian squadron', 'Goes round to the rear', 'carthage'),
    'mylae-flanks-duilius': mark(0, 3100, 'Duilius', 'Corvi turned to the flanks', 'rome', 'user'),
    'mylae-flanks-cape': cape,
  },
});

console.log('mylae: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 1490)));
