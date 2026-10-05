// Rivoli, 14 January 1797. Joubert holds the plateau north of Rivoli, from the Trambasore heights to the chapel of San
// Marco above the Adige; Alvinczi's columns come down from Monte Baldo, Quosdanovich up the Adige valley to Osteria and
// the defile onto the plateau, Lusignan round the west into the French rear.
// The Adige and the plateau's edges are read from the elevation tiles: the river runs at about 100 m, the plateau at
// 180 to 200 m, the Trambasore ridge and the San Marco ridge rise to 300 m and more.
import { frame, writePlan } from './lib.mjs';

const RIVOLI = [10.8133, 45.5717];
const f = frame(RIVOLI, 0);
const G = 'pages/020-first-coalition/090-rivoli';
const bbox = f.box([[-4400, -5300], [4500, 4100]], 0);
const adige = { path: [[10.872, 45.63], [10.862, 45.62], [10.858, 45.61], [10.851, 45.6], [10.845, 45.592], [10.836, 45.585], [10.828, 45.578], [10.823, 45.571], [10.8265, 45.563], [10.831, 45.557], [10.826, 45.55], [10.817, 45.543], [10.81, 45.537], [10.803, 45.53]], width: 80, id: 'adige', name: 'The river Adige in its gorge' };
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
const vukassovich = unit('austria', 'artillery', [10.8355, 45.5785], 260, 60, 255, 'vukassovich-guns', 'Vukassovich’s batteries on the east bank, opposite Osteria', { count: 5 });

// --- overview: the converging Austrian columns, Bonaparte's night march ---
writePlan(`${G}/010-rivoli`, {
  routes: {
    'alvinczi-1797': { name: 'Alvinczi’s main army comes down the Adige and over Monte Baldo, 12 to 14 January 1797',
      path: [[11.12, 46.07], [11.04, 45.89], [11.0, 45.76], [10.94, 45.72], [10.88, 45.66], [10.84, 45.61]] },
    'bajalics-1797': { name: 'Bajalics advances from Bassano towards Verona, January 1797',
      path: [[11.73, 45.77], [11.55, 45.55], [11.38, 45.47], [11.2, 45.43], [11.06, 45.43]] },
    'provera-1797': { name: 'Provera marches from Padua and crosses the Adige at Angiari, 7 to 13 January 1797',
      path: [[11.88, 45.41], [11.75, 45.28], [11.6, 45.23], [11.45, 45.23], [11.29, 45.22]] },
    'bonaparte-rivoli-1797': { name: 'Bonaparte rides from Verona to Rivoli in the night of 13 to 14 January 1797',
      path: [[10.99, 45.44], [10.91, 45.45], [10.84, 45.48], [10.82, 45.53], [10.813, 45.565]] },
  },
  markers: {
    'rivoli-mantua': { lnglat: [10.79, 45.16], icon: 'castle', color: 'austria', label: 'Mantua', note: 'Blockaded by Sérurier' },
    'rivoli-verona': { lnglat: [10.99, 45.44], icon: 'flag', color: 'france', label: 'Verona', note: 'Masséna’s division' },
    'rivoli-legnago': { lnglat: [11.31, 45.19], icon: 'flag', color: 'france', label: 'Legnago', note: 'Augereau’s division' },
    'rivoli-angiari': { lnglat: [11.29, 45.225], icon: 'swords', color: 'austria', label: 'Angiari', note: 'Provera crosses, night of 13 January' },
  },
});

// --- morning: Joubert takes San Marco, the Austrians counterattack the Trambasore heights ---
writePlan(`${G}/020-rivoli-plateau`, {
  bbox,
  emblem: {
    water: [adige],
    units: [
      unit('france', 'infantry', [10.7915, 45.5905], 1100, 220, 10, 'joubert-west', 'Joubert’s left on the Trambasore heights'),
      unit('france', 'infantry', [10.8065, 45.5895], 900, 220, 15, 'vial', 'Vial’s brigade in the centre'),
      unit('france', 'infantry', [10.8235, 45.5895], 420, 200, 25, 'san-marco', 'Joubert’s troops at the chapel of San Marco'),
      unit('france', 'infantry', [10.8145, 45.5815], 300, 160, 80, 'osteria-french', 'French troops driven up from Osteria onto the plateau'),
      unit('france', 'infantry', [10.8125, 45.5655], 200, 600, 0, 'massena', 'Masséna’s division coming up from Verona'),
      unit('austria', 'infantry', [10.7935, 45.5995], 1100, 260, 190, 'koblos-lipthay', 'The brigades of Koblos and Lipthay'),
      unit('austria', 'infantry', [10.8155, 45.5995], 700, 260, 200, 'ocskay', 'Ocskay’s column, driven from San Marco'),
      unit('austria', 'infantry', [10.7655, 45.5865], 180, 900, 185, 'lusignan', 'Lusignan’s brigade marching round to the west'),
      unit('austria', 'infantry', [10.8415, 45.5945], 140, 900, 215, 'quosdanovich', 'Quosdanovich’s column on the road along the Adige, with Reuss'),
      vukassovich,
    ],
    arrows: [
      arrow('france', [[10.8195, 45.5845], [10.8215, 45.5875]], 110, 'san-marco-attack', 'Before daybreak Joubert drives the Austrians from San Marco'),
      arrow('austria', [[10.7895, 45.5975], [10.7895, 45.5925]], 120, 'counterattack', 'Koblos and Lipthay counterattack at 9 am'),
      arrow('austria', [[10.7985, 45.5975], [10.7985, 45.5925]], 120, 'counterattack', 'Koblos and Lipthay counterattack at 9 am'),
      arrow('france', [[10.8285, 45.5822], [10.8225, 45.5818], [10.8172, 45.5815]], 100, 'osteria-retreat', 'The French are driven out of Osteria', 'dashed'),
      arrow('austria', [[10.767, 45.5795], [10.7695, 45.5715], [10.7795, 45.5635]], 110, 'lusignan-march', 'Lusignan heads for the French rear'),
    ],
    clashes: [[10.7895, 45.5925], [10.7985, 45.5925], { at: [10.8215, 45.5915], size: 130 }],
  },
  markers: {
    'rivoli-plat-joubert': mark([10.8015, 45.5845], 'Joubert', 'About 10,000 on the heights', 'france'),
    'rivoli-plat-alvinczi': mark([10.8015, 45.6095], 'Alvinczi', 'Three columns from Caprino to San Marco', 'austria'),
    'rivoli-plat-san-marco': mark([10.8305, 45.5965], 'San Marco', 'Chapel taken before dawn', 'france', 'church'),
    'rivoli-plat-osteria': mark([10.8245, 45.5772], 'Osteria', 'French driven out', 'austria', 'house'),
    'rivoli-plat-lusignan': mark([10.7585, 45.5795], 'Lusignan', 'Marches round to the west', 'austria'),
    'rivoli-plat-rivoli': mark([10.8035, 45.57], 'Rivoli', 'Bonaparte arrives at 2 am', 'france', 'flag'),
  },
});

// --- late morning and midday: the guns at the head of the defile, Murat against Ocskay ---
writePlan(`${G}/030-rivoli-gorge`, {
  bbox,
  emblem: {
    water: [adige],
    units: [
      unit('france', 'artillery', [10.8128, 45.5812], 340, 60, 85, 'french-guns', '15 French guns at the head of the defile', { count: 8 }),
      unit('france', 'infantry', [10.8158, 45.5788], 320, 160, 60, 'leclerc', 'Leclerc’s brigade'),
      unit('france', 'infantry', [10.8235, 45.5895], 420, 200, 190, 'san-marco', 'Joubert’s men firing into the column from San Marco'),
      unit('france', 'infantry', [10.8045, 45.5865], 700, 200, 15, 'vial', 'Vial’s brigade, driven back'),
      unit('france', 'infantry', [10.7915, 45.5905], 800, 160, 10, 'joubert-west', 'Joubert’s thinned line on the Trambasore heights'),
      unit('france', 'infantry', [10.8105, 45.5625], 300, 220, 180, 'eighteenth', 'Masséna’s 18th demi-brigade, sent against Lusignan'),
      unit('austria', 'infantry', [10.8222, 45.5818], 130, 600, 275, 'quosdanovich', 'Quosdanovich’s column in the defile, dragoons at its head'),
      vukassovich,
      unit('austria', 'infantry', [10.8125, 45.5945], 700, 260, 200, 'ocskay', 'Ocskay’s column, attacking from San Marco'),
      unit('austria', 'infantry', [10.7935, 45.5975], 1100, 260, 190, 'koblos-lipthay', 'Alvinczi’s battalions on the Trambasore heights'),
      unit('austria', 'infantry', [10.8125, 45.5565], 900, 240, 0, 'lusignan', 'Lusignan’s column south of Rivoli, across the French retreat'),
    ],
    arrows: [
      arrow('france', [[10.8165, 45.5795], [10.8195, 45.5808]], 110, 'leclerc-attack', 'Leclerc attacks the column from the front'),
      arrow('austria', [[10.8255, 45.582], [10.8295, 45.5825], [10.834, 45.5855]], 100, 'dragoons-flight', 'The Austrian dragoons stampede back through their own infantry', 'dashed'),
      arrow('austria', [[10.8105, 45.5925], [10.8075, 45.5895]], 120, 'ocskay-attack', 'Ocskay drives back Vial'),
      arrow('france', [[10.7965, 45.5855], [10.8005, 45.5915], [10.8055, 45.5945]], 100, 'murat', 'Murat’s cavalry charges Ocskay’s flank at midday'),
      arrow('france', [[10.8115, 45.5735], [10.8107, 45.5645]], 110, 'eighteenth-march', 'The 18th demi-brigade marches against Lusignan'),
    ],
    clashes: [{ at: [10.8195, 45.5814], size: 140 }, { at: [10.8075, 45.5895], size: 140 }],
  },
  markers: {
    'rivoli-gorge-lasalle': mark([10.8235, 45.5745], 'Lasalle', '26 chasseurs take a battalion', 'france', 'swords'),
    'rivoli-gorge-murat': mark([10.7905, 45.5835], 'Murat', 'Charges Ocskay’s flanks', 'france'),
    'rivoli-gorge-quosdanovich': mark([10.8445, 45.5895], 'Quosdanovich', 'Falls back out of range', 'austria'),
  },
});

// --- afternoon: Lusignan crushed between Brune, Rey and Victor ---
writePlan(`${G}/040-rivoli-lusignan`, {
  bbox,
  emblem: {
    water: [adige],
    units: [
      unit('france', 'artillery', [10.8128, 45.5812], 340, 60, 85, 'french-guns', 'French guns at the head of the defile', { count: 8 }),
      unit('france', 'infantry', [10.8015, 45.5915], 1500, 220, 15, 'joubert', 'Joubert’s division on the heights'),
      unit('france', 'infantry', [10.8115, 45.5625], 700, 200, 180, 'brune', 'Brune’s brigade and the 18th demi-brigade'),
      unit('france', 'infantry', [10.8005, 45.5445], 900, 240, 20, 'rey', 'Rey’s division, coming up from Castelnuovo'),
      unit('france', 'infantry', [10.8132, 45.5452], 450, 200, 0, 'victor', 'Victor’s reserve brigade'),
      unit('austria', 'infantry', [10.8095, 45.5545], 700, 260, 0, 'lusignan', 'Lusignan’s column, crushed'),
      unit('austria', 'infantry', [10.7965, 45.6055], 1100, 260, 190, 'koblos-lipthay', 'Alvinczi’s columns, back on the slopes of Monte Baldo'),
      unit('austria', 'infantry', [10.8455, 45.5985], 140, 700, 215, 'quosdanovich', 'Quosdanovich’s column, back in the Adige valley'),
    ],
    arrows: [
      arrow('france', [[10.8015, 45.5475], [10.8055, 45.5515]], 120, 'rey-attack', 'Rey falls on Lusignan’s rear'),
      arrow('france', [[10.8132, 45.5475], [10.8115, 45.5518]], 110, 'victor-attack', 'Victor attacks'),
      arrow('austria', [[10.8035, 45.5555], [10.7855, 45.5575], [10.7655, 45.5565], [10.7505, 45.5535]], 110, 'lusignan-flight', 'Lusignan flees west with fewer than 2,000 men', 'dashed'),
      arrow('austria', [[10.7945, 45.5965], [10.7962, 45.6035]], 110, 'alvinczi-retreat', 'Alvinczi’s battalions fall back', 'dashed'),
    ],
    clashes: [{ at: [10.8105, 45.5585], size: 150 }, { at: [10.8075, 45.5515], size: 150 }],
  },
  markers: {
    'rivoli-lus-lusignan': mark([10.7735, 45.5615], 'Lusignan', 'Flees with fewer than 2,000', 'austria', 'skull'),
    'rivoli-lus-brune': mark([10.8195, 45.5645], 'Brune', 'Engages the column from the front', 'france'),
    'rivoli-lus-rey': mark([10.7905, 45.5395], 'Rey', 'Arrives from Castelnuovo', 'france'),
    'rivoli-lus-victor': mark([10.8095, 45.5385], 'Victor', 'Reserve brigade', 'france'),
    'rivoli-lus-alvinczi': mark([10.8065, 45.6085], 'Alvinczi', 'Withdraws up the valley next day', 'austria'),
  },
});

// --- 15 to 16 January: Masséna marches to Mantua, Provera surrenders at La Favorita ---
writePlan(`${G}/050-rivoli-aftermath`, {
  routes: {
    'massena-mantua-1797': { name: 'Masséna marches from Rivoli to La Favorita, 15 to 16 January 1797',
      path: [[10.813, 45.565], [10.79, 45.5], [10.8, 45.42], [10.84, 45.35], [10.83, 45.27], [10.82, 45.195]] },
    'provera-favorita-1797': { name: 'Provera marches from Angiari towards Mantua, 14 to 16 January 1797',
      path: [[11.29, 45.22], [11.15, 45.2], [11.0, 45.19], [10.9, 45.19], [10.835, 45.19]] },
    'augereau-1797': { name: 'Augereau follows Provera, 15 to 16 January 1797', offset: 6,
      path: [[11.3, 45.205], [11.15, 45.2], [11.0, 45.19], [10.9, 45.19], [10.84, 45.19]] },
    'alvinczi-flight-1797': { name: 'The remnants of Alvinczi’s army flee up the Adige valley, 15 January 1797', style: 'dashed',
      path: [[10.83, 45.6], [10.88, 45.67], [10.95, 45.74], [11.0, 45.8], [11.04, 45.89]] },
  },
  markers: {
    'rivoli-after-favorita': { lnglat: [10.82, 45.19], icon: 'flag', color: 'france', label: 'La Favorita', note: 'Provera surrenders with 6,000, 16 January' },
    'rivoli-after-angiari': { lnglat: [11.29, 45.225], icon: 'swords', color: 'france', label: 'Angiari', note: 'Augereau takes Provera’s bridge guard' },
    'rivoli-after-rivoli': { lnglat: [10.813, 45.572], icon: 'swords', color: 'france', label: 'Rivoli', note: 'Joubert and Rey pursue Alvinczi' },
  },
});

console.log('rivoli: bbox', JSON.stringify(bbox));
