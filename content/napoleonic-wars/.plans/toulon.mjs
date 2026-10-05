// Toulon, 1793. The Republicans besiege the port from the west (Ollioules, La Seyne) and the east (La Valette); the
// key is the hill of Le Caire, where the Allies build Fort Mulgrave above the forts of l'Éguillette and Balaguier
// that command the passage between the inner and outer roadsteads.
// Positions are [lon, lat] fitted to the Natural Earth coast the map draws (node scripts/coast.mjs France 5.82 43.03 6.0
// 43.17), which runs the north shore of the inner roadstead along 43.13; forts and batteries keep their places
// relative to that shore.
import { frame, writePlan } from './lib.mjs';

const MULGRAVE = [5.893, 43.094], EGUILLETTE = [5.902, 43.101], BALAGUIER = [5.906, 43.095], MALBOUSQUET = [5.905, 43.137];
const CONVENTION = [5.895, 43.143], FARON = [5.94, 43.15];
const f = frame(MULGRAVE, 0);
const G = 'pages/020-first-coalition/040-toulon';
const bbox = f.box([[-2000, -3000], [6900, 8200]], 0);
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
// a fort as a closed rampart of `size` metres around its centre
const fort = (side, [lon, lat], size, id, name) => {
  const dx = size / 2 / 81276, dy = size / 2 / 110540;
  return { side, path: [[lon - dx, lat - dy], [lon + dx, lat - dy], [lon + dx, lat + dy], [lon - dx, lat + dy], [lon - dx, lat - dy]], width: 45, id, name };
};
const forts = (side = 'britain') => [
  fort(side, MULGRAVE, 320, 'fort-mulgrave', side === 'britain' ? 'Fort Mulgrave, “Little Gibraltar”' : 'Fort Mulgrave, taken by the Republicans'),
  fort(side, EGUILLETTE, 160, 'eguillette', side === 'britain' ? 'Fort de l’Éguillette' : 'Fort de l’Éguillette, taken by the Republicans'),
  fort(side, BALAGUIER, 160, 'balaguier', side === 'britain' ? 'Fort de Balaguier' : 'Fort de Balaguier, taken by the Republicans'),
];
const malbousquet = fort('britain', MALBOUSQUET, 220, 'malbousquet', 'Fort Malbousquet');
const faron = fort('britain', FARON, 260, 'faron', 'Allied forts on Mont Faron');
const fleet = [
  unit('britain', 'ships', [5.921, 43.121], 1300, 500, 0, 'hood-fleet', 'British ships under Hood in the inner roadstead', { count: 8, rows: 2 }),
  unit('spain', 'ships', [5.966, 43.092], 1300, 450, 0, 'langara-fleet', 'Spanish ships under Lángara in the outer roadstead', { count: 7, rows: 2 }),
];
const west = unit('france', 'infantry', [5.869, 43.106], 1300, 260, 110, 'french-west', 'Republican western division, 17,000 by the end of September');
const lapoype = unit('france', 'infantry', [5.982, 43.143], 1100, 260, 270, 'lapoype', 'La Poype’s eastern division, detached from the Army of Italy');

// --- overview: Carteaux from Marseille, La Poype from the east, the Allied fleet arrives ---
writePlan(`${G}/010-toulon`, {
  routes: {
    'hood-1793': { name: 'The Anglo-Spanish fleet under Hood and Lángara enters Toulon, 28 August 1793',
      path: [[6.2, 43.0], [6.05, 43.04], [5.97, 43.08], [5.93, 43.112]] },
    'carteaux-1793': { name: 'Carteaux’s army from Marseille to Ollioules and La Seyne, August to September 1793',
      path: [[5.37, 43.3], [5.57, 43.29], [5.72, 43.2], [5.79, 43.16], [5.847, 43.14], [5.87, 43.11]] },
    'lapoype-1793': { name: 'La Poype’s division from the Army of Italy to La Valette, September 1793',
      path: [[6.25, 43.2], [6.13, 43.18], [6.03, 43.16], [5.98, 43.14]] },
  },
  markers: {
    'toulon-marseille': { lnglat: [5.37, 43.3], icon: 'flag', color: 'france', label: 'Marseille', note: 'Retaken by the Republic, August' },
    'toulon-ollioules': { lnglat: [5.847, 43.14], icon: 'flag', color: 'france', label: 'Ollioules', note: 'Carteaux’s western force' },
    'toulon-la-valette': { lnglat: [5.983, 43.138], icon: 'flag', color: 'france', label: 'La Valette', note: 'La Poype’s eastern force' },
  },
});

// --- the batteries and the sortie of 30 November ---
writePlan(`${G}/020-toulon-batteries`, {
  bbox,
  emblem: {
    works: [...forts(), malbousquet, faron],
    units: [
      unit('france', 'artillery', CONVENTION, 220, 60, 115, 'convention-battery', 'The Convention battery on the heights of Arènes', { count: 6 }),
      unit('france', 'artillery', [5.8845, 43.0985], 170, 50, 125, 'jacobin-battery', 'The Jacobin battery on the ridge of l’Evescat', { count: 4 }),
      unit('france', 'artillery', [5.8855, 43.0895], 170, 50, 55, 'men-without-fear', 'The battery of the Men Without Fear', { count: 4 }),
      west, lapoype,
      unit('britain', 'infantry', [5.8935, 43.0943], 160, 110, 260, 'mulgrave-garrison', 'British, Spanish and Neapolitan garrison of Fort Mulgrave'),
      unit('britain', 'infantry', [5.9015, 43.1408], 380, 140, 300, 'ohara', 'Allied sortie under O’Hara, driven back'),
      ...fleet,
    ],
    arrows: [
      arrow('britain', [[5.9035, 43.1418], [5.8995, 43.1432], [5.8965, 43.1438]], 110, 'sortie', 'O’Hara’s sortie overruns the Convention battery'),
      arrow('britain', [[5.896, 43.142], [5.8985, 43.1405], [5.9005, 43.140]], 100, 'sortie-back', 'The Allies are driven back', 'dashed'),
      arrow('france', [[5.876, 43.15], [5.886, 43.147], [5.8935, 43.1445]], 110, 'counterattack', 'Counterattack led by Dugommier and Bonaparte'),
    ],
    clashes: [{ at: [5.896, 43.1435], size: 170 }],
  },
  markers: {
    'toulon-bat-bonaparte': mark([5.879, 43.1535], 'Bonaparte', 'Commands the siege artillery', 'france'),
    'toulon-bat-ohara': mark([5.9145, 43.1445], 'O’Hara', 'Wounded and captured', 'britain'),
    'toulon-bat-mulgrave': mark([5.893, 43.0905], 'Fort Mulgrave', '“Little Gibraltar”', 'britain', 'castle'),
    'toulon-bat-dugommier': mark([5.862, 43.1105], 'Dugommier', 'In command from 17 November', 'france'),
    'toulon-bat-hood': mark([5.921, 43.1155], 'Hood', 'Allied fleet in the roadsteads', 'britain', 'ship'),
    'toulon-bat-faron': mark([5.94, 43.154], 'Mont Faron', 'Allied forts above the city', 'britain', 'castle'),
  },
});

// --- the storming of Fort Mulgrave, night of 17 to 18 December ---
writePlan(`${G}/030-toulon-mulgrave`, {
  bbox,
  emblem: {
    works: [...forts('france'), malbousquet, faron],
    units: [
      unit('france', 'artillery', [5.8845, 43.0985], 170, 50, 125, 'jacobin-battery', 'The Jacobin battery on the ridge of l’Evescat', { count: 4 }),
      unit('france', 'artillery', [5.8855, 43.0895], 170, 50, 55, 'men-without-fear', 'The battery of the Men Without Fear', { count: 4 }),
      unit('france', 'infantry', [5.8875, 43.0965], 260, 160, 115, 'assault-column', 'Dugommier’s main column, taking Fort Mulgrave'),
      unit('france', 'artillery', [5.9045, 43.0985], 180, 50, 45, 'caire-guns', 'Republican guns on the heights of Le Caire', { count: 4 }),
      unit('france', 'infantry', [5.952, 43.1495], 600, 180, 270, 'lapoype', 'La Poype’s troops on Mont Faron'),
      unit('britain', 'infantry', [5.92, 43.142], 700, 200, 300, 'allied-garrison', 'Allied troops holding the city and its forts'),
      ...fleet,
    ],
    arrows: [
      arrow('france', [[5.876, 43.1005], [5.884, 43.0975], [5.8915, 43.0948]], 120, 'assault', 'The assault on Fort Mulgrave'),
      arrow('france', [[5.877, 43.0875], [5.885, 43.0905], [5.8915, 43.0935]], 110, 'assault', 'The assault on Fort Mulgrave'),
      arrow('france', [[5.896, 43.0955], [5.9005, 43.098], [5.9035, 43.0995]], 90, 'to-eguillette', 'The French occupy l’Éguillette and Balaguier'),
      arrow('france', [[5.985, 43.152], [5.97, 43.153], [5.958, 43.1505]], 110, 'faron-attack', 'La Poype attacks Mont Faron'),
      arrow('britain', [[5.896, 43.093], [5.9025, 43.0935], [5.907, 43.0925]], 90, 'mulgrave-flight', 'The garrison of Fort Mulgrave escapes to the boats', 'dashed'),
    ],
    clashes: [{ at: [5.892, 43.0945], size: 180 }, { at: [5.946, 43.1505], size: 160 }],
  },
  markers: {
    'toulon-mul-dugommier': mark([5.865, 43.1005], 'Dugommier', 'Leads the main column', 'france'),
    'toulon-mul-bonaparte': mark([5.879, 43.0845], 'Bonaparte', 'Bayonet wound in the thigh', 'france'),
    'toulon-mul-guns': mark([5.92, 43.0985], 'L’Éguillette and Balaguier', 'French guns reach both roadsteads', 'france', 'castle'),
    'toulon-mul-lapoype': mark([5.968, 43.1565], 'La Poype', 'Takes positions on Mont Faron', 'france'),
    'toulon-mul-victory': mark([5.94, 43.104], 'Victory', 'Allied council of war, 18 December', 'britain', 'ship'),
  },
});

// --- the burning of the fleet and the evacuation, 18 to 19 December ---
writePlan(`${G}/040-toulon-evacuation`, {
  bbox,
  emblem: {
    works: [...forts('france')],
    units: [
      unit('france', 'ships', [5.9145, 43.1295], 1000, 260, 0, 'burning-fleet', 'French ships of the line set on fire in the New Arsenal', { count: 8 }),
      unit('britain', 'ships', [5.9205, 43.125], 420, 160, 300, 'smith', 'Sidney Smith’s boats and the fire ship Vulcan', { count: 4 }),
      unit('britain', 'ships', [5.932, 43.1225], 520, 220, 160, 'elphinstone', 'Robust, Leviathan and Courageux take the troops off the waterfront', { count: 3 }),
      unit('france', 'artillery', [5.9045, 43.0985], 180, 50, 45, 'caire-guns', 'Republican guns on the heights of Le Caire', { count: 4 }),
      unit('france', 'infantry', [5.928, 43.141], 900, 200, 180, 'republicans', 'Republican troops reach the city and the Old Arsenal'),
      unit('britain', 'ships', [5.975, 43.088], 1300, 450, 120, 'allied-fleet', 'The Allied fleet with the troops and 14,877 refugees', { count: 8, rows: 2 }),
    ],
    arrows: [
      arrow('britain', [[5.94, 43.118], [5.95, 43.105], [5.965, 43.095]], 110, 'withdrawal', 'The last ships leave the inner roadstead', 'dashed'),
      arrow('britain', [[5.982, 43.087], [6.0, 43.08], [6.02, 43.073]], 120, 'departure', 'The Allied fleet sails away', 'dashed'),
    ],
  },
  markers: {
    'toulon-evac-smith': mark([5.9115, 43.1235], 'Sidney Smith', 'Burns the arsenal and the fleet', 'britain'),
    'toulon-evac-iris': mark([5.944, 43.108], 'Iris', 'Powder ship explodes', 'britain', 'flame'),
    'toulon-evac-montreal': mark([5.955, 43.1], 'Montréal', 'Second powder hulk explodes', 'britain', 'flame'),
    'toulon-evac-city': mark([5.9355, 43.1535], 'Toulon', 'Republicans enter, 19 December', 'france', 'flag'),
    'toulon-evac-refugees': mark([5.975, 43.0815], 'Refugees', '14,877 carried away', 'britain', 'ship'),
  },
});

console.log('toulon: bbox', JSON.stringify(bbox));
