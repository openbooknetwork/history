// Friedland, 14 June 1807. Bennigsen crosses the Alle at Friedland and forms up west of the town, his left in the
// tongue of land between the river bends and the Posthenen millstream, his right towards Heinrichsdorf. Lannes holds
// at Posthenen and the Sortlack Wood until Napoleon arrives, then Ney attacks the Russian left. Positions after the
// Battle of Friedland article; the Alle and the millstream from the elevation tiles.
// Frame: origin at the town, u north, w east, so the French face 90 and the Russians 270.
import { frame, writePlan } from './lib.mjs';

const f = frame([21.012, 54.4455], 0), P = f.p, FR = f.face(90), RU = f.face(270);
const G = 'pages/060-fourth-coalition/050-friedland';
const water = [
  { path: [[21.008, 54.415], [21.014, 54.42], [21.016, 54.4225], [21.013, 54.4275], [21.014, 54.432], [21.011, 54.4345], [21.006, 54.4355], [21.002, 54.4385],
    [21.003, 54.441], [21.007, 54.4425], [21.012, 54.4432], [21.018, 54.4442], [21.024, 54.4455], [21.029, 54.448], [21.026, 54.4505], [21.022, 54.4535],
    [21.0205, 54.457], [21.02, 54.461], [21.0205, 54.4645], [21.025, 54.469], [21.03, 54.4725]], width: 70, id: 'alle', name: 'The Alle' },
  { path: [[20.95, 54.4415], [20.965, 54.4435], [20.978, 54.4448], [20.99, 54.4458], [21.0, 54.4468], [21.01, 54.448], [21.02, 54.449], [21.026, 54.4495]], width: 30, id: 'millstream', name: 'The Posthenen millstream' },
];
const bridges = [
  { side: 'russia', path: [[21.0165, 54.4425], [21.0158, 54.4448]], width: 30, id: 'bridges', name: 'Russian pontoon bridges at Friedland' },
  { side: 'russia', path: [[21.0255, 54.4465], [21.0305, 54.4462]], width: 30, id: 'bridges', name: 'Russian pontoon bridges at Friedland' },
];
const bbox = f.box([[-2900, -4600], [3700, 1800]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : RU, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, ...(note ? { note } : {}) });

// --- overview: Danzig, Guttstadt, Heilsberg and the marches to Friedland ---
writePlan(`${G}/010-friedland`, {
  bbox: [18.2, 53.75, 21.6, 54.9],
  routes: {
    'ney-guttstadt-1807': { name: 'Ney falls back from Guttstadt over the Passarge, 5 – 6 June 1807', style: 'dashed', path: [[20.4, 53.99], [20.3, 53.96], [20.21, 53.93]] },
    'bennigsen-friedland-1807': { name: 'Bennigsen withdraws down the Alle from Heilsberg to Friedland, 11 – 13 June 1807',
      path: [[20.58, 54.12], [20.7, 54.2], [20.81, 54.255], [20.98, 54.27], [21.02, 54.36], [21.02, 54.44]] },
    'lannes-friedland-1807': { name: 'Lannes leads the advance by Eylau to Friedland, 12 – 13 June 1807',
      path: [[20.58, 54.12], [20.49, 54.28], [20.63, 54.385], [20.83, 54.43], [20.965, 54.443]] },
    'murat-konigsberg-1807': { name: 'Murat, Soult and Davout march on Königsberg, June 1807', path: [[20.64, 54.39], [20.6, 54.55], [20.51, 54.69]] },
  },
  markers: {
    'friedland-danzig': { lnglat: [18.65, 54.35], icon: 'castle', color: 'prussia', label: 'Danzig', note: 'Besieged 19 March, surrenders 24 May' },
    'friedland-heilsberg': { lnglat: [20.58, 54.12], icon: 'swords', color: 'russia', label: 'Heilsberg', note: '10 June' },
    'friedland-konigsberg': { lnglat: [20.51, 54.71], icon: 'flag', color: 'prussia', label: 'Königsberg', note: null },
  },
});

// --- morning to noon: the Russians cross the Alle, Lannes holds at Posthenen and in the Sortlack Wood ---
writePlan(`${G}/020-friedland-lannes`, {
  bbox,
  emblem: {
    water,
    works: bridges,
    units: [
      unit('russia', 'infantry', -800, -1500, 1400, 300, 'russian-left', 'The Russian left under Bagration'),
      unit('russia', 'infantry', 1000, -1300, 1500, 300, 'russian-centre', 'The Russian centre, two lines of infantry'),
      unit('russia', 'cavalry', 2400, -1500, 1300, 250, 'russian-right', 'Russian cavalry and Cossacks towards Heinrichsdorf'),
      unit('russia', 'artillery', -1400, 650, 700, 300, 'russian-batteries', 'Russian batteries beyond the river', { facing: 250, count: 8 }),
      unit('france', 'infantry', -100, -3100, 1800, 300, 'lannes', 'Lannes’s corps at Posthenen, never more than 26,000'),
      unit('france', 'light', -1400, -2150, 1100, 100, 'skirmishers', 'Lannes’s skirmishers in the Sortlack Wood', { facing: 60 }),
      unit('france', 'cavalry', 2400, -3000, 1000, 250, 'grouchy', 'Grouchy’s and Nansouty’s cavalry at Heinrichsdorf'),
      unit('france', 'infantry', 3000, -4100, 900, 300, 'mortier', 'The head of Mortier’s French and Polish corps'),
    ],
    arrows: [
      arrow('russia', [[-700, 1000], [-250, 300], [-500, -1000]], 130, 'russian-crossing', 'Bennigsen’s army crosses the Alle at Friedland'),
      arrow('france', [[1500, -4500], [2300, -3600]], 120, 'heinrichsdorf-race', 'Grouchy and Nansouty win the race for Heinrichsdorf'),
      arrow('france', [[-200, -4600], [-150, -3400]], 130, 'napoleon-arrives', 'Napoleon arrives with 40,000 more men by noon'),
    ],
    clashes: [P(-1200, -1850), { at: P(-100, -2700), size: 200 }, { at: P(2400, -2350), size: 180 }],
  },
  markers: {
    'friedland-lannes-lannes': mark(-1000, -3700, 'Lannes', 'Holds until noon', 'france'),
    'friedland-lannes-bennigsen': mark(-500, 1300, 'Bennigsen', '50,000 across by 6 a.m.', 'russia'),
    'friedland-lannes-town': mark(-100, -150, 'Friedland', null, 'russia', 'house'),
    'friedland-lannes-grouchy': mark(3100, -2500, 'Grouchy', 'Takes Heinrichsdorf', 'france'),
  },
});

// --- 5 p.m.: Ney carries the Sortlack Wood and drives the Russian left towards the river ---
writePlan(`${G}/030-friedland-ney`, {
  bbox,
  emblem: {
    water,
    works: bridges,
    units: [
      unit('france', 'infantry', -1250, -1650, 1000, 300, 'marchand', 'Marchand’s division of Ney’s corps', { facing: 50 }),
      unit('france', 'infantry', -550, -2250, 900, 300, 'bisson', 'Bisson’s division of Ney’s corps', { facing: 80 }),
      unit('france', 'cavalry', -950, -2650, 600, 250, 'latour-maubourg', 'Latour-Maubourg’s dragoons', { facing: 60 }),
      unit('france', 'infantry', 900, -2700, 1600, 300, 'lannes', 'Lannes’s corps in the centre'),
      unit('france', 'infantry', 2500, -2900, 1300, 300, 'mortier', 'Mortier’s corps at Heinrichsdorf'),
      unit('france', 'infantry', -700, -3900, 1200, 400, 'reserve', 'Victor’s I Corps and the Imperial Guard in reserve'),
      unit('russia', 'infantry', -650, -1150, 1000, 300, 'russian-left', 'The Russian left, pressed towards the river', { facing: 240 }),
      unit('russia', 'infantry', 1000, -1400, 1500, 300, 'russian-centre', 'The Russian centre'),
      unit('russia', 'cavalry', 2500, -1600, 1300, 250, 'russian-right', 'The Russian right'),
      unit('russia', 'artillery', -1400, 650, 700, 300, 'russian-batteries', 'Russian batteries beyond the river', { facing: 250, count: 8 }),
    ],
    arrows: [
      arrow('france', [[-2500, -2300], [-1900, -1900], [-1450, -1500]], 130, 'ney-attack', 'Ney carries the Sortlack Wood'),
      arrow('france', [[-1400, -3000], [-750, -2450]], 130, 'ney-attack', 'Ney carries the Sortlack Wood'),
      arrow('france', [[-1150, -1250], [-1250, -700], [-1300, -300]], 110, 'sortlack', 'Marchand drives part of the Russian left into the Alle at Sortlack'),
      arrow('russia', [[-150, -1450], [-500, -1700], [-800, -1950]], 110, 'russian-charge', 'Russian cavalry charges into the gap between Ney’s divisions'),
      arrow('france', [[-150, -2550], [-500, -3100]], 110, 'ney-thrown-back', 'Bennigsen’s reserve cavalry drives Ney back in disorder', 'dashed'),
    ],
    clashes: [P(-1000, -1450), P(-850, -2050), { at: P(900, -2050), size: 180 }],
  },
  markers: {
    'friedland-ney-ney': mark(-2100, -1500, 'Ney', 'Carries the Sortlack Wood', 'france'),
    'friedland-ney-sortlack': mark(-1500, -150, 'Sortlack', 'Russians driven into the Alle', 'russia', 'skull'),
    'friedland-ney-napoleon': mark(-1500, -4100, 'Napoleon', 'Victor and the Guard in reserve', 'france'),
  },
});

// --- evening: Sénarmont's guns, the Russians driven through the burning town into the Alle ---
writePlan(`${G}/040-friedland-alle`, {
  bbox,
  emblem: {
    water,
    works: bridges,
    units: [
      unit('france', 'artillery', -900, -1750, 1000, 300, 'senarmont', 'Sénarmont’s guns at case-shot range', { facing: 70, count: 12 }),
      unit('france', 'infantry', 600, -1400, 900, 300, 'dupont', 'Dupont’s division, over the millstream', { facing: 60 }),
      unit('france', 'infantry', -1400, -1000, 700, 250, 'ney', 'Ney’s infantry, following the fugitives into the town', { facing: 30 }),
      unit('france', 'infantry', 1100, -2200, 1500, 300, 'lannes', 'Lannes’s corps attacking'),
      unit('france', 'infantry', 2500, -2300, 1300, 300, 'mortier', 'Mortier’s corps attacking'),
      unit('france', 'cavalry', -2000, -1700, 800, 250, 'french-cavalry', 'French cavalry', { facing: 60 }),
      unit('russia', 'infantry', -600, -1050, 600, 250, 'russian-left', 'The broken Russian left on the riverbank', { facing: 250 }),
      unit('russia', 'infantry', 1200, -1000, 1300, 300, 'russian-centre', 'The Russian centre, forced back', { facing: 250 }),
      unit('russia', 'cavalry', 2600, -1100, 1200, 250, 'russian-right', 'The Russian right, escaping north'),
    ],
    arrows: [
      arrow('france', [[-1700, -2500], [-1050, -2000]], 130, 'senarmont-advance', 'Sénarmont brings his guns forward'),
      arrow('france', [[-300, -2500], [100, -1900], [450, -1600]], 120, 'dupont-attack', 'Dupont fords the millstream and attacks the Russian centre'),
      arrow('france', [[-1150, -900], [-650, -600], [-250, -250]], 120, 'ney-pursuit', 'Ney’s infantry follow the fugitives into Friedland'),
      arrow('russia', [[-150, -100], [-450, 200], [-700, 450]], 120, 'russian-flight', 'The Russians flee over the Alle, many drowning', 'dashed'),
      arrow('russia', [[2900, -1000], [3400, -750], [3800, -550]], 120, 'russian-right-escape', 'The Russian right escapes by the Allenburg road', 'dashed'),
    ],
    clashes: [P(-700, -1350), P(900, -1200), { at: P(1200, -1850), size: 180 }],
  },
  markers: {
    'friedland-alle-senarmont': mark(-1600, -2700, 'Sénarmont', 'Canister at close range', 'france'),
    'friedland-alle-town': mark(-50, 100, 'Friedland', 'The town burns', 'russia', 'flame'),
    'friedland-alle-drowned': mark(-1000, 250, 'The Alle', 'Many Russians drown', 'russia', 'skull'),
    'friedland-alle-dupont': mark(800, -2900, 'Dupont', 'Over the millstream', 'france'),
  },
});

console.log('friedland: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, -1500)));
