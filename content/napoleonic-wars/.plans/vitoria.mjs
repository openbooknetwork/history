// Vitoria, 21 June 1813 (Battle of Vitoria article). The French stand in the Zadorra valley west of Vitoria, the
// Heights of La Puebla to the south, Monte Arrato to the north-west; Wellington attacks in four columns, Hill from
// the La Puebla defile, the two centre columns across the river, Graham down the Bilbao road behind the French.
// Frame: origin on Vitoria, u north, w east, so the allies face east and the French west.
import { frame, writePlan } from './lib.mjs';

const f = frame([-2.672, 42.847], 0), P = f.p, AL = f.face(90), FR = f.face(270);
const G = 'pages/070-peninsula/080-vitoria';
const zadorra = { path: [[-2.59, 42.89], [-2.62, 42.886], [-2.645, 42.879], [-2.664, 42.874], [-2.69, 42.871], [-2.715, 42.866], [-2.737, 42.86], [-2.75, 42.856],
  [-2.756, 42.846], [-2.752, 42.837], [-2.745, 42.832], [-2.752, 42.828], [-2.765, 42.83], [-2.775, 42.826], [-2.79, 42.822], [-2.805, 42.818], [-2.815, 42.81],
  [-2.82, 42.795], [-2.826, 42.78], [-2.832, 42.765], [-2.838, 42.75]], width: 50, id: 'zadorra', name: 'The river Zadorra' };
const road = (id, name, path) => ({ side: 'neutral', path, width: 25, id, name });
const roads = [
  road('burgos-road', 'The road from Burgos through the La Puebla defile to Vitoria', [[-2.84, 42.755], [-2.829, 42.766], [-2.81, 42.785], [-2.79, 42.8], [-2.765, 42.812], [-2.752, 42.82], [-2.735, 42.826], [-2.722, 42.83], [-2.7, 42.838], [-2.672, 42.847]]),
  road('bilbao-road', 'The road to Bilbao', [[-2.672, 42.847], [-2.68, 42.86], [-2.69, 42.872], [-2.705, 42.89], [-2.72, 42.91]]),
  road('bayonne-road', 'The road to Bayonne and France', [[-2.672, 42.847], [-2.655, 42.862], [-2.636, 42.886], [-2.615, 42.905]]),
  road('salvatierra-road', 'The road to Salvatierra and Pamplona', [[-2.672, 42.847], [-2.64, 42.848], [-2.6, 42.85], [-2.56, 42.853]]),
];
const bbox = [-2.84, 42.755, -2.59, 42.905];
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' || side === 'client' ? FR : AL, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, ...(note ? { note } : {}) });
const town = id => ({ [`${id}-town`]: mark(-500, 700, 'Vitoria', null, null, 'house') });
const emblem = (units, arrows, clashes = []) => ({ water: [zadorra], works: roads, units, arrows, clashes });

// --- overview: Burgos, the retreat of 1812, the march of 1813 round the French right ---
writePlan(`${G}/010-vitoria`, {
  routes: {
    'wellington-burgos-1812': { name: 'Wellington retreats from Burgos, autumn 1812', style: 'dashed',
      path: [[-3.7, 42.34], [-4.2, 42.0], [-4.72, 41.65], [-5.0, 41.5], [-5.66, 40.96], [-6.53, 40.6]] },
    'graham-1813': { name: 'Graham’s march round the French right, May to June 1813',
      path: [[-6.76, 41.8], [-6.2, 41.85], [-5.85, 41.88], [-5.3, 42.05], [-4.6, 42.3], [-4.1, 42.55], [-3.75, 42.78], [-3.25, 42.88], [-2.85, 42.85]] },
    'wellington-1813': { name: 'Wellington’s central column by Salamanca, May to June 1813', offset: 6,
      path: [[-6.53, 40.6], [-5.66, 40.96], [-5.39, 41.52], [-5.0, 41.85], [-4.6, 42.3], [-4.1, 42.55], [-3.75, 42.78], [-3.25, 42.88], [-2.85, 42.83]] },
    'joseph-1813': { name: 'Joseph and Jourdan fall back to Vitoria, June 1813', style: 'dashed',
      path: [[-4.72, 41.65], [-4.2, 41.95], [-3.7, 42.34], [-3.25, 42.55], [-2.95, 42.69], [-2.75, 42.82]] },
  },
  markers: {
    'vitoria-burgos': { lnglat: [-3.7, 42.34], icon: 'castle', color: 'france', label: 'Burgos', note: 'Besieged in vain, 19 September to 21 October 1812' },
  },
});

// --- morning: Morillo and Cadogan on the Heights of La Puebla, Stewart at Subijana, Kempt across the bend ---
writePlan(`${G}/020-vitoria-puebla`, {
  bbox,
  emblem: emblem([
    unit('france', 'infantry', -6800, -9700, 600, 150, 'maransin', 'Maransin’s brigade, sent up the heights', { facing: 225 }),
    unit('france', 'infantry', -6100, -8600, 900, 200, 'villatte', 'Villatte’s reserve division, committed on the heights', { facing: 225 }),
    unit('france', 'infantry', -3800, -7600, 2500, 250, 'gazan', 'Gazan’s Army of the South: Leval, Daricau and Conroux'),
    unit('france', 'infantry', -2300, -4600, 2000, 220, 'derlon', 'D’Erlon’s Army of the Centre in second line: Darmagnac and Cassagne'),
    unit('france', 'infantry', 2400, 600, 1600, 220, 'reille', 'Reille’s Army of Portugal holding the river north of Vitoria', { facing: 0 }),
    unit('france', 'infantry', 3800, -1700, 800, 200, 'sarrut', 'Sarrut’s division guarding the Bilbao road', { facing: 330 }),
    unit('britain', 'infantry', -7500, -10500, 900, 200, 'heights', 'Morillo’s Spanish division and Cadogan’s brigade on the heights', { facing: 45 }),
    unit('britain', 'infantry', -5000, -9500, 900, 220, 'stewart', 'Stewart’s 2nd Division, taking Subijana', { facing: 70 }),
    unit('britain', 'infantry', -900, -9300, 1500, 250, 'right-centre', 'Wellington’s right centre: the Light and 4th Divisions on the north bank'),
    unit('britain', 'infantry', -1300, -6600, 400, 150, 'kempt', 'Kempt’s brigade of the Light Division, across the river', { facing: 135 }),
    unit('britain', 'infantry', 1900, -9000, 1300, 250, 'dalhousie', 'Dalhousie’s left centre, the 3rd and 7th Divisions, crossing Monte Arrato', { facing: 110 }),
    unit('britain', 'infantry', 6000, -3700, 600, 1400, 'graham', 'Graham’s column, 20,000, coming round Monte Arrato', { facing: 150 }),
  ], [
    arrow('britain', [[-8800, -12200], [-8200, -11400], [-7700, -10800]], 130, 'morillo-climb', 'Morillo’s Spaniards climb the Heights of La Puebla'),
    arrow('france', [[-5400, -8600], [-6100, -9200], [-6650, -9750]], 110, 'maransin-attack', 'Maransin tries to drive Morillo off the heights'),
    arrow('britain', [[-7000, -11800], [-5900, -10600], [-5200, -9800]], 130, 'stewart-advance', 'Stewart’s 2nd Division advances up the plain'),
    arrow('britain', [[-900, -8400], [-1100, -7500], [-1300, -6850]], 100, 'kempt-crossing', 'Kempt crosses the Zadorra at the bend'),
    arrow('britain', [[7300, -5800], [6800, -4800], [6400, -4100]], 150, 'graham-march', 'Graham marches round the north of Monte Arrato'),
  ], [P(-7100, -10200), P(-4800, -9150)]),
  markers: {
    'vitoria-puebla-hill': mark(-9300, -11300, 'Hill', 'Forces the La Puebla defile', 'britain'),
    'vitoria-puebla-cadogan': mark(-7900, -9300, 'Cadogan', 'Killed on the heights', 'britain', 'skull'),
    'vitoria-puebla-wellington': mark(300, -10900, 'Wellington', 'With the right centre', 'britain'),
    'vitoria-puebla-jourdan': mark(-700, -1900, 'Joseph and Jourdan', 'Send troops to the Logroño road', 'france'),
    'vitoria-puebla-subijana': mark(-5700, -8700, 'Subijana', null, null, 'house'),
    ...town('vitoria-puebla'),
  },
});

// --- noon to afternoon: Graham at Gamarra, Longa on the Bayonne road, Picton across the river, Arinez taken ---
writePlan(`${G}/030-vitoria-arinez`, {
  bbox,
  emblem: emblem([
    unit('france', 'infantry', -3200, -5900, 2000, 250, 'gazan', 'Gazan’s army, falling back on Arinez'),
    unit('france', 'infantry', -1300, -5000, 1500, 220, 'derlon', 'D’Erlon’s army, facing Picton', { facing: 315 }),
    unit('france', 'infantry', -5300, -6900, 900, 200, 'villatte', 'Villatte and Maransin, drawing back from the heights', { facing: 225 }),
    unit('france', 'infantry', 2500, 500, 1400, 220, 'reille', 'Reille holding the bridges north of Vitoria against Graham', { facing: 0 }),
    unit('france', 'infantry', 2200, -1700, 800, 200, 'sarrut', 'Sarrut’s division, driven back across the river', { facing: 0 }),
    unit('client', 'infantry', 4000, 2700, 700, 180, 'royal-guard', 'Joseph’s Spanish Royal Guard', { facing: 0 }),
    unit('britain', 'infantry', 4100, -400, 600, 1300, 'graham', 'Graham’s column above the Zadorra', { facing: 180 }),
    unit('spain', 'infantry', 5100, 3100, 700, 200, 'longa', 'Longa’s Spanish division', { facing: 200 }),
    unit('britain', 'infantry', 300, -5800, 1300, 250, 'picton', 'Picton’s 3rd and Dalhousie’s 7th Divisions, south of the river', { facing: 150 }),
    unit('britain', 'infantry', -2300, -7300, 1500, 250, 'cole-light', 'Cole’s 4th and the Light Division'),
    unit('britain', 'infantry', -4900, -8700, 1400, 250, 'hill', 'Hill’s column: the 2nd Division and Morillo’s Spaniards', { facing: 60 }),
  ], [
    arrow('britain', [[5000, -2000], [3800, -1500], [3000, -1150]], 130, 'graham-attack', 'Graham drives Sarrut back across the river and attacks the bridges'),
    arrow('spain', [[6200, 3900], [5200, 3300], [4300, 2850]], 110, 'longa-attack', 'Longa defeats the Royal Guard and cuts the Bayonne road'),
    arrow('britain', [[1700, -6600], [1000, -6100], [-300, -5400]], 130, 'picton-crossing', 'Picton crosses the Zadorra and loses 1,800 men'),
    arrow('britain', [[-900, -8700], [-1700, -8000], [-2200, -7500]], 110, 'cole-crossing', 'Cole’s 4th Division crosses further west'),
    arrow('britain', [[-2300, -7100], [-2600, -6600], [-2900, -6200]], 130, 'arinez-attack', 'The 4th, Light, 3rd and 7th Divisions take Arinez'),
  ], [P(2900, -1000), P(4200, 2800), P(-600, -5300), P(-3000, -6150)]),
  markers: {
    'vitoria-arinez-graham': mark(5900, -2300, 'Graham', 'Appears at noon on the Bilbao road', 'britain'),
    'vitoria-arinez-picton': mark(1300, -4300, 'Picton', 'The 3rd Division loses 1,800 men', 'britain'),
    'vitoria-arinez-longa': mark(5600, 4300, 'Longa', 'Cuts the road to Bayonne', 'spain'),
    'vitoria-arinez-arinez': mark(-3500, -6900, 'Arinez', null, null, 'house'),
    ...town('vitoria-arinez'),
  },
});

// --- evening: the Zuazo ridge falls, the French flee by the Salvatierra road and leave the wagon train ---
writePlan(`${G}/040-vitoria-rout`, {
  bbox,
  emblem: emblem([
    unit('france', 'infantry', -1800, -3700, 2500, 250, 'zuazo', 'Gazan and d’Erlon on the ridge of Zuazo, breaking'),
    unit('france', 'artillery', -1800, -4150, 1500, 120, 'zuazo-guns', 'The French field artillery, abandoned on the ridge', { count: 10 }),
    unit('france', 'camp', 300, 1600, 1100, 700, 'convoy', 'Joseph’s wagon train, “the loot of a kingdom”'),
    unit('france', 'infantry', 2500, 500, 1400, 220, 'reille', 'Reille’s two divisions, holding off Graham', { facing: 0 }),
    unit('france', 'cavalry', -500, 4300, 800, 160, 'rearguard', 'The 3rd Hussars and 15th Dragoons covering the retreat'),
    unit('britain', 'infantry', -2200, -5100, 3000, 250, 'allied-line', 'The 4th, Light, 3rd and 7th Divisions in one line'),
    unit('britain', 'infantry', -4000, -6200, 1200, 250, 'hill', 'Hill’s column', { facing: 60 }),
    unit('britain', 'infantry', 4100, -400, 600, 1300, 'graham', 'Graham’s column above the Zadorra', { facing: 180 }),
    unit('spain', 'infantry', 4600, 2900, 700, 200, 'longa', 'Longa’s Spaniards astride the Bayonne road', { facing: 200 }),
  ], [
    arrow('britain', [[-2200, -4950], [-2050, -4500], [-1900, -3950]], 140, 'zuazo-attack', 'The allied line takes the Zuazo ridge'),
    arrow('france', [[-1500, -3300], [-1200, -1200], [-700, 1200], [-300, 3800], [100, 6400]], 170, 'french-flight', 'Gazan’s and d’Erlon’s men flee by the Salvatierra road', 'dashed'),
    arrow('france', [[2300, 900], [1500, 2600], [600, 5000]], 120, 'reille-retreat', 'Reille falls back last', 'dashed'),
  ], [P(-1950, -4050)]),
  markers: {
    'vitoria-rout-guns': mark(-3300, -3100, '151 guns', 'Left behind by their gunners', 'france', 'skull'),
    'vitoria-rout-wagons': mark(1400, 2600, 'The wagon train', 'Plundered by the allies', 'france', 'flag'),
    ...town('vitoria-rout'),
  },
});

console.log('vitoria: battle at', JSON.stringify(P(-2900, -6300)));
