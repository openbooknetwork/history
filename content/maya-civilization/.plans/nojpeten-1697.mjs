// Nojpetén, 13 March 1697. Ursúa's galeota is rowed from his camp at Ch'ich' through an arc of Itza canoes to the
// island, and the Itza abandon their capital under musket and gun fire (Jones 1998, pp. 295 to 299).
// The lake is not on the base map: lake-peten-itza.json holds its shore, simplified from OpenStreetMap.
// Ch'ich' is the point of the Nixtun-Ch'ich' peninsula; the arc of canoes spans the 600 m channel west of the island.
import fs from 'fs';
import { frame, writePlan } from './lib.mjs';

const G = 'pages/100-peten/040-nojpeten';
const lake = JSON.parse(fs.readFileSync(new URL('./lake-peten-itza.json', import.meta.url)));
const unitIn = f => (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: f.p(u, w), width, depth, facing, id, name, ...extra });
const arrowIn = f => (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const markIn = f => (u, w, label, note, color, icon = 'user') => ({ lnglat: f.p(u, w), icon, color, label, note });

// u north, w east, origin on the summit of Nojpetén
const f = frame([-89.8913, 16.93], 0), unit = unitIn(f), arrow = arrowIn(f), mark = markIn(f);
const SPAIN = 100, ITZA = 280;
const water = rings => rings.map(area => ({ area, id: 'lake', name: 'Lake Petén Itzá' }));
// the phases frame the channel west of the island and the island, 1.7 by 1.65 km; Ch'ich' lies 3.7 km off to the west.
// Boats and the landing party are drawn larger than life so they show at that scale (README, Drawn size).
const box = f.box([[-800, -1250], [850, 450]], 0);
// --- overview: the lake, Ursúa's march down the road and his camp ---
writePlan(`${G}/010-nojpeten`, {
  bbox: [-89.99, 16.9, -89.83, 16.995],
  emblem: { water: water(lake.whole) },
  routes: {
    'ursua-1697': {
      name: 'Ursúa’s march from Campeche to Ch\'ich\', 23 January to 26 February 1697',
      path: [[-90.53, 19.85], [-90.36, 19.66], [-90.13, 19.47], [-90.08, 19.0], [-90.08, 18.27], [-90.04, 17.86], [-90.03, 17.48],
        [-90.0, 17.25], [-89.94, 17.1], [-89.905, 17.035], [-89.918, 16.99], [-89.925, 16.972], [-89.938, 16.962], [-89.941, 16.955], [-89.937, 16.9495], [-89.925, 16.9487]],
    },
  },
  markers: {
    'nojpeten-1697': { lnglat: f.p(0, 0), icon: 'crown', color: 'itza', label: 'Nojpetén', note: 'Capital of Kan Ek\'' },
    'chich-1697': { lnglat: f.p(2060, -3590), icon: 'flag', color: 'spain', label: 'Ch\'ich\'', note: 'Ursúa’s camp from 26 February' },
    'chakan-1697': { lnglat: [-89.9103, 16.9675], icon: 'landmark', color: 'itza', label: 'Chak\'an', note: 'Chak\'an Itza, against the Spanish' },
  },
});

// --- the morning of 13 March: the galeota rows through the arc of canoes and is surrounded ---
writePlan(`${G}/020-nojpeten-galley`, {
  bbox: box,
  emblem: {
    water: water(lake.near),
    units: [
      unit('spain', 'ships', 390, -580, 36, 60, 115, 'galeota', 'Ursúa’s galeota: 108 soldiers, two priests, AjChan and at least five guns', { count: 1 }),
      unit('itza', 'ships', 490, -890, 620, 40, 90, 'arc', 'Itza war canoes in an arc across the approach, about 600 m from shore to shore', { count: 12, bow: -90 }),
      unit('itza', 'ships', 250, -360, 140, 40, 300, 'shore-canoes', 'Canoes putting out from the island to surround the galeota', { count: 5 }),
      unit('itza', 'archers', -40, -180, 160, 35, 275, 'shore', 'Itza archers crowding the shore of the island'),
      unit('itza', 'irregular', 10, 0, 260, 200, ITZA, 'town', 'Warriors on the roofs of Nojpetén'),
    ],
    arrows: [
      arrow('spain', [[900, -1500], [670, -1220], [430, -660]], 40, 'row', 'The galeota is rowed east from Ch\'ich\' and through the arc'),
      arrow('itza', [[60, -200], [210, -320]], 30, 'put-out', 'More canoes put out from the shore'),
    ],
    clashes: [{ at: f.p(320, -470), size: 50 }],
  },
  markers: {
    'nojpeten-galley-ursua': mark(510, -560, 'Ursúa', '108 soldiers on the galeota', 'spain'),
    'nojpeten-galley-arc': mark(300, -1120, 'Itza canoes', 'An arc about 600 m long', 'itza', 'ship'),
    'nojpeten-galley-town': mark(-200, 40, 'Nojpetén', 'Defenders on shore and roofs', 'itza', 'landmark'),
  },
});

// --- the same morning: the defenders flee, the soldiers land and the survivors swim for the mainland ---
writePlan(`${G}/030-nojpeten-landing`, {
  bbox: box,
  emblem: {
    water: water(lake.near),
    units: [
      unit('spain', 'ships', 30, -255, 36, 60, SPAIN, 'galeota', 'The galeota at the shore of Nojpetén, its guns firing on the town', { count: 1 }),
      unit('spain', 'infantry', 0, -40, 85, 35, SPAIN, 'soldiers', 'Ursúa’s soldiers take the town'),
      unit('itza', 'irregular', -760, 120, 180, 50, 180, 'survivors', 'Itza survivors making for the forest'),
      unit('itza', 'irregular', 760, 190, 180, 50, 0, 'survivors', 'Itza survivors making for the forest'),
    ],
    arrows: [
      arrow('spain', [[20, -220], [5, -95]], 25, 'land', 'The soldiers go ashore and storm the town'),
      arrow('itza', [[-180, 10], [-450, 40], [-700, 80]], 40, 'swim', 'The Itza swim for the mainland, and many drown', 'dashed'),
      arrow('itza', [[190, 0], [400, 50], [700, 150]], 40, 'swim', 'The Itza swim for the mainland, and many drown', 'dashed'),
      arrow('itza', [[490, -820], [210, -1020], [-60, -1180]], 40, 'canoes-flee', 'The canoes flee from the gunfire', 'dashed'),
    ],
    clashes: [{ at: f.p(-75, -195), size: 50 }],
  },
  markers: {
    'nojpeten-landing-standard': mark(0, 30, 'Ursúa’s standard', 'Raised on the highest point', 'spain', 'flag'),
    'nojpeten-landing-dead': mark(-480, 300, 'Itza dead', 'Many killed or drowned', 'itza', 'skull'),
  },
});

console.log('nojpeten-1697: phase bbox', JSON.stringify(box), 'battle at', JSON.stringify(f.p(1060, -1780)));
