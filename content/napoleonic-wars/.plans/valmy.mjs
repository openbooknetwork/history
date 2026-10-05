// Valmy, 20 September 1792. Kellermann holds the heights west of Valmy around the windmill, his left towards the
// Châlons road and his right on Mont Yvron; the Prussians stand on the heights of La Lune to the west, facing east.
// Frame: origin on the windmill (the article's coordinates), u to the north, w to the east.
import { frame, writePlan } from './lib.mjs';

const f = frame([4.7672, 49.0803], 0), P = f.p, WEST = 265, EAST = 85;
const G = 'pages/020-first-coalition/010-valmy';
const bbox = f.box([[-2900, -3900], [2700, 2000]], 0);
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: Brunswick's march from Koblenz, Dumouriez and Kellermann converge on Sainte-Menehould ---
writePlan(`${G}/010-valmy`, {
  routes: {
    'brunswick-1792': { name: 'Brunswick’s army from Koblenz by Longwy, Verdun and the Argonne to La Lune, August to September 1792',
      path: [[7.59, 50.36], [7.0, 50.0], [6.64, 49.75], [6.13, 49.6], [5.76, 49.52], [5.55, 49.33], [5.38, 49.16], [5.15, 49.27], [4.92, 49.33], [4.8, 49.25], [4.75, 49.15], [4.725, 49.07]] },
    'dumouriez-1792': { name: 'Dumouriez’s army moves from Sedan into the Argonne and to Sainte-Menehould, September 1792', offset: 6,
      path: [[4.94, 49.7], [4.9, 49.5], [4.87, 49.34], [4.9, 49.2], [4.9, 49.09]] },
    'kellermann-1792': { name: 'Kellermann’s Army of the Centre marches from Metz to join Dumouriez, September 1792',
      path: [[6.18, 49.12], [5.75, 48.95], [5.35, 48.83], [5.16, 48.77], [4.95, 48.9], [4.8, 49.06]] },
  },
  markers: {
    'valmy-longwy': { lnglat: [5.76, 49.52], icon: 'castle', color: 'prussia', label: 'Longwy', note: 'Taken by Brunswick, 23 August' },
    'valmy-verdun': { lnglat: [5.38, 49.16], icon: 'castle', color: 'prussia', label: 'Verdun', note: 'Taken by Brunswick, 2 September' },
  },
});

// --- the cannonade: the two lines on their heights, the French battery at La Lune stops the Prussian cavalry ---
const prussians = (w1, w2) => [
  unit('prussia', 'artillery', -300, -2500, 1100, 70, EAST, 'prussian-guns', 'Prussian artillery, 54 guns', { count: 12 }),
  unit('prussia', 'infantry', -300, w1, 2600, 160, EAST, 'prussian-first-line', 'Prussian infantry, first line'),
  unit('prussia', 'infantry', -300, w2, 2400, 160, EAST, 'prussian-second-line', 'Prussian infantry, second line'),
  unit('prussia', 'cavalry', -2250, -3000, 700, 220, 70, 'prussian-cavalry', 'Prussian cavalry by the inn of La Lune'),
  unit('prussia', 'cavalry', 1650, -3050, 600, 220, 95, 'prussian-cavalry-north', 'Prussian cavalry on the northern wing'),
];
const french = [
  unit('france', 'artillery', 0, -200, 600, 70, WEST, 'french-guns', 'French batteries on the windmill hill', { count: 10 }),
  unit('france', 'infantry', 200, 150, 1400, 260, WEST, 'kellermann-centre', 'Kellermann’s infantry on the windmill hill, in two lines'),
  unit('france', 'infantry', -1350, -150, 1100, 220, 250, 'french-left', 'French left wing towards the Châlons road'),
  unit('france', 'infantry', 1900, 1050, 900, 220, 285, 'french-right', 'French right wing on Mont Yvron'),
  unit('france', 'infantry', -250, 1500, 1300, 240, WEST, 'beurnonville', 'Troops of Beurnonville behind Kellermann'),
];

writePlan(`${G}/020-valmy-cannonade`, {
  bbox,
  emblem: {
    units: [
      ...french,
      unit('france', 'artillery', -2000, -1650, 220, 60, 255, 'la-lune-battery', 'French battery near the inn of La Lune', { count: 4 }),
      ...prussians(-2850, -3250),
    ],
    arrows: [
      arrow('prussia', [[-2150, -2700], [-2050, -2250]], 120, 'cavalry-stopped', 'The Prussian cavalry advance is stopped'),
    ],
  },
  markers: {
    'valmy-cannon-kellermann': mark(500, 600, 'Kellermann', 'About 36,000 men, 40 guns', 'france'),
    'valmy-cannon-brunswick': mark(-300, -3700, 'Brunswick', 'About 34,000 men, 54 guns', 'prussia'),
    'valmy-cannon-mill': mark(-200, -650, 'Windmill of Valmy', 'Pulled down by Kellermann', 'france', 'flag'),
    'valmy-cannon-yvron': mark(2350, 1500, 'Mont Yvron', 'French right wing', 'france', 'mountain'),
    'valmy-cannon-lalune': mark(-2450, -1650, 'Inn of La Lune', 'French battery halts the cavalry', 'france', 'house'),
  },
});

// --- the attack: the Prussian infantry advances about 200 yards and halts, Kellermann brings up more guns ---
writePlan(`${G}/030-valmy-attack`, {
  bbox,
  emblem: {
    units: [
      ...french.map(u => u.id === 'kellermann-centre' ? { ...u, at: P(200, 80) } : u),
      unit('france', 'artillery', 900, -250, 350, 70, WEST, 'french-reserve-guns', 'Guns brought up by Kellermann', { count: 6 }),
      ...prussians(-2670, -3250),
    ],
    arrows: [
      arrow('prussia', [[-1100, -3020], [-1100, -2570]], 150, 'prussian-advance', 'The Prussian infantry advances about 200 yards and halts'),
      arrow('prussia', [[500, -3020], [500, -2570]], 150, 'prussian-advance', 'The Prussian infantry advances about 200 yards and halts'),
      arrow('france', [[1100, 1100], [1050, 450], [900, -100]], 110, 'guns-forward', 'Kellermann brings up more guns'),
    ],
  },
  markers: {
    'valmy-attack-kellermann': mark(500, 600, 'Kellermann', '“Vive la Nation”', 'france'),
    'valmy-attack-wagons': mark(-500, 300, 'Ammunition wagons', 'Blown up by Prussian fire', 'france', 'flame'),
    'valmy-attack-brunswick': mark(-300, -3700, 'Brunswick', 'Breaks off the action', 'prussia'),
    'valmy-attack-lalune': mark(-2450, -2300, 'Inn of La Lune', 'Brunswick meets the king, evening', 'prussia', 'house'),
  },
});

console.log('valmy: bbox', JSON.stringify(bbox));
