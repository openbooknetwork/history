// The Aegates Islands, 10 March 241 BC. Hanno sails east from Hiera (Marettimo) before a west wind; the Romans row
// out from their anchorage off Aegusa (Favignana) and meet him west of Phorbantia (Levanzo, too small for the map).
// Frame: origin at the article's coordinates, u south, w west.
import { frame, writePlan } from './lib.mjs';

const f = frame([12.2, 37.97], 180), P = f.p, WEST = f.face(90), EAST = f.face(270);
const G = 'pages/020-first-war/080-aegates';
const ships = (side, u, w, width, depth, count, facing, rows = 1, extra = {}) => ({ side, type: 'ships', at: P(u, w), width, depth, count, rows, facing, ...extra });
const arrow = (side, pts, width = 160, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: Hamilcar at Eryx, the blockade ---
writePlan(`${G}/010-aegates`, { show: ['eryx-244', 'drepana-241', 'lilybaeum-241', 'aegusa-241'] });

// --- 9 and 10 March: the Carthaginian fleet runs east, the Romans row out to meet it ---
writePlan(`${G}/020-aegates-interception`, {
  bbox: f.box([[-7500, -15000], [3500, 13000]], 0),
  emblem: {
    units: [
      ships('carthage', -3500, 3200, 1800, 900, 12, 75, 2, nm('carthaginian-fleet', 'Hanno’s fleet under sail, about 250 ships laden with grain')), ships('carthage', -1300, 3600, 1800, 900, 12, 75, 2, nm('carthaginian-fleet', 'Hanno’s fleet under sail, about 250 ships laden with grain')),
      ships('carthage', 900, 3200, 1500, 900, 10, 75, 2, nm('carthaginian-fleet', 'Hanno’s fleet under sail, about 250 ships laden with grain')),
      ships('rome', -5000, -6500, 1500, 450, 6, WEST, 1, nm('roman-fleet', 'The Roman fleet under Falto in a single line, masts left ashore')), ships('rome', -3500, -6600, 1500, 450, 6, WEST, 1, nm('roman-fleet', 'The Roman fleet under Falto in a single line, masts left ashore')),
      ships('rome', -2000, -6500, 1500, 450, 6, WEST, 1, nm('roman-fleet', 'The Roman fleet under Falto in a single line, masts left ashore')),
    ],
    arrows: [arrow('carthage', [[-200, 9300], [-1300, 6500], [-2400, 4400]], 220, undefined, nm('hanno-sails', 'Hanno sails east before the west wind')),
      arrow('rome', [[1700, -10000], [-300, -8500], [-2500, -7100]], 220, undefined, nm('romans-row-out', 'The Romans row out from Aegusa into the wind'))],
  },
  markers: {
    'aegates-interception-hiera': { lnglat: [12.075, 37.985], icon: 'anchor', color: 'carthage', label: 'Hiera', note: 'The Carthaginian fleet gathers' },
    'aegates-interception-phorbantia': { lnglat: [12.335, 38.005], icon: 'anchor', label: 'Phorbantia', note: 'Lead anchors on the sea floor' },
    'aegates-interception-hanno': mark(-1300, 5600, 'Hanno', '250 warships laden with grain', 'carthage'),
    'aegates-interception-falto': mark(-600, -7300, 'Falto', 'One line, masts left ashore', 'rome'),
  },
  show: ['aegusa-241'],
});

// --- the battle: the Romans ram the laden ships; the wind turns and the rest escape west ---
writePlan(`${G}/030-aegates-battle`, {
  bbox: f.box([[-7000, -8500], [1500, 4500]], 0),
  emblem: {
    units: [
      ships('rome', -5000, -4800, 1500, 450, 6, WEST, 1, nm('roman-fleet', 'The Roman line under Falto, about 200 quinqueremes')), ships('rome', -3500, -4900, 1500, 450, 6, WEST, 1, nm('roman-fleet', 'The Roman line under Falto, about 200 quinqueremes')),
      ships('rome', -2000, -4800, 1500, 450, 6, WEST, 1, nm('roman-fleet', 'The Roman line under Falto, about 200 quinqueremes')),
      ships('carthage', -4900, -3300, 1500, 900, 10, EAST, 2, nm('carthaginian-fleet', 'Hanno’s ships, laden with grain and short of marines')), ships('carthage', -3400, -3200, 1500, 900, 10, EAST, 2, nm('carthaginian-fleet', 'Hanno’s ships, laden with grain and short of marines')),
      ships('carthage', -1900, -3300, 1400, 900, 9, EAST, 2, nm('carthaginian-fleet', 'Hanno’s ships, laden with grain and short of marines')),
    ],
    arrows: [
      arrow('rome', [[-4500, -4600], [-4450, -3450]], 150, undefined, nm('rams', 'The Romans ram the laden ships')),
      arrow('rome', [[-2800, -4700], [-2750, -3350]], 150, undefined, nm('rams', 'The Romans ram the laden ships')),
      arrow('carthage', [[-4200, -3050], [-3700, 0], [-2900, 3300]], 150, 'dashed', nm('escape', 'The wind turns and the rest of the Carthaginian fleet escapes under sail')),
      arrow('carthage', [[-1800, -3100], [-1300, 0], [-600, 3300]], 150, 'dashed', nm('escape', 'The wind turns and the rest of the Carthaginian fleet escapes under sail')),
    ],
    clashes: [P(-4700, -4100), P(-3300, -4150), P(-2000, -4100)],
  },
  markers: {
    'aegates-battle-falto': mark(-3500, -5700, 'Falto', 'Rams the laden ships', 'rome'),
    'aegates-battle-losses': mark(-6100, -3300, 'Carthaginian fleet', '50 sunk, 70 captured', 'carthage', 'skull'),
    'aegates-battle-hanno': mark(-1800, 2500, 'Hanno', 'Escapes when the wind turns', 'carthage'),
  },
});

// --- the peace: the fleet's remains and the army of Sicily go home to Carthage ---
writePlan(`${G}/040-aegates-peace`, {
  routes: {
    'hanno-241': { name: 'The rest of Hanno’s fleet returns to Carthage', style: 'dashed', path: [P(-2500, -3000), [12.0, 37.85], [11.4, 37.45], [10.75, 37.05], [10.34, 36.86]] },
    'gisco-241': { name: 'The army of Sicily is shipped from Lilybaeum to Carthage', offset: 6, path: [[12.42, 37.79], [11.9, 37.55], [11.2, 37.2], [10.65, 36.96], [10.35, 36.85]] },
  },
  markers: { 'aegates-peace-carthage': { lnglat: [10.32, 36.85], icon: 'scroll-text', color: 'carthage', label: 'Carthage', note: 'Orders Hamilcar to make peace' } },
  show: ['lilybaeum-241'],
});

console.log('aegates: battle at', JSON.stringify(P(-3400, -4100)));
