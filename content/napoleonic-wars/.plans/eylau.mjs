// Eylau, 7 and 8 February 1807. The Russians stand on a ridge north-east of Preussisch Eylau, from Schloditten in
// the north to Serpallen in the south-east, facing the French in and around the town. Davout comes up from the south
// against the Russian left, L'Estocq marches behind the Russian line to meet him, Ney arrives from the north-west.
// Positions after the Battle of Eylau article and its maps. Frame: origin at the town, u along the Russian line
// towards Schloditten (bearing 328), w from the French towards the Russians.
import { frame, writePlan } from './lib.mjs';

const f = frame([20.642, 54.387], 328), P = f.p, FR = f.face(90), RU = f.face(270), NORTH = f.face(0), SOUTH = f.face(180);
const G = 'pages/060-fourth-coalition/040-eylau';
// a north-up bbox around the points of the plan, so the rotated frame does not inflate it
const around = (pts, pad) => { const ll = pts.map(([u, w]) => P(u, w)), kx = 111320 * Math.cos(54.39 * Math.PI / 180), dx = pad / kx, dy = pad / 110540;
  return [Math.min(...ll.map(q => q[0])) - dx, Math.min(...ll.map(q => q[1])) - dy, Math.max(...ll.map(q => q[0])) + dx, Math.max(...ll.map(q => q[1])) + dy].map(x => Math.round(x * 1e5) / 1e5); };
const bbox = around([[4600, -1800], [3900, -300], [1000, 4300], [-1500, 4500], [-5300, 300], [-3500, 1300], [-500, -3300]], 400);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : RU, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, ...(note ? { note } : {}) });
const russianLine = name => [
  unit('russia', 'infantry', 1700, 1250, 1800, 300, 'russian-right', name.right),
  unit('russia', 'infantry', -100, 1350, 1600, 300, 'russian-centre', name.centre),
  unit('russia', 'infantry', -2000, 1300, 1500, 300, 'russian-left', name.left),
];

// --- overview: Warsaw, the winter battles, Bennigsen's offensive and the march to Eylau ---
writePlan(`${G}/010-eylau`, {
  bbox: [16.6, 51.95, 22.4, 54.85],
  routes: {
    'murat-warsaw-1806': { name: 'The French advance from Posen to Warsaw, November 1806', path: [[16.93, 52.41], [17.9, 52.3], [19.0, 52.25], [19.94, 52.11], [21.0, 52.23]] },
    'bennigsen-1807': { name: 'Bennigsen marches north into East Prussia, January 1807', path: [[21.88, 53.23], [21.81, 53.63], [21.4, 53.95], [20.8, 54.02], [20.09, 54.02], [19.95, 53.93]] },
    'bennigsen-eylau-1807': { name: 'Bennigsen falls back by Jonkowo and Landsberg to Eylau, 1 – 7 February 1807', style: 'dashed',
      path: [[20.09, 54.0], [20.33, 53.84], [20.4, 54.0], [20.49, 54.28], [20.63, 54.385]] },
    'napoleon-eylau-1807': { name: 'Napoleon marches north by Allenstein to Eylau, February 1807', offset: 6,
      path: [[21.0, 52.24], [21.05, 52.7], [20.94, 53.4], [20.79, 53.65], [20.48, 53.78], [20.42, 54.0], [20.49, 54.28], [20.62, 54.38]] },
  },
  markers: {
    'eylau-warsaw': { lnglat: [21.01, 52.23], icon: 'flag', color: 'france', label: 'Warsaw', note: 'Murat enters, 28 November 1806' },
    'eylau-pultusk': { lnglat: [21.1, 52.72], icon: 'swords', color: 'france', label: 'Pułtusk', note: 'Pułtusk and Gołymin, 26 December' },
    'eylau-mohrungen': { lnglat: [19.93, 53.92], icon: 'swords', color: 'russia', label: 'Mohrungen', note: '25 January 1807' },
    'eylau-allenstein': { lnglat: [20.48, 53.78], icon: 'swords', color: 'france', label: 'Allenstein', note: '3 February' },
  },
});

// --- 7 February: Bagration's rearguard falls back, the French take the town in the evening ---
writePlan(`${G}/020-eylau-town`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', 600, -1100, 1400, 300, 'soult', 'Soult’s IV Corps'),
      unit('france', 'cavalry', 2300, -1400, 1000, 250, 'murat', 'Murat’s cavalry'),
      unit('france', 'infantry', -1300, -1500, 1300, 300, 'augereau', 'Augereau’s VII Corps coming up'),
      unit('france', 'infantry', 200, -2500, 900, 350, 'guard', 'The Imperial Guard'),
      unit('russia', 'infantry', 0, 100, 700, 300, 'barclay', 'Barclay de Tolly’s rearguard holding the town'),
      ...russianLine({ right: 'Bennigsen’s right wing', centre: 'Bennigsen’s centre', left: 'Bennigsen’s left wing' }),
    ],
    arrows: [
      arrow('russia', [[-500, -1900], [-1000, -700], [-1000, 700]], 120, 'bagration-retreat', 'Bagration’s rearguard falls back to the main army', 'dashed'),
      arrow('france', [[500, -900], [250, -250]], 130, 'french-assault', 'The French storm the town in the evening'),
      arrow('france', [[-200, -3400], [100, -2700]], 120, 'french-approach', 'The French reach the plateau about 2 p.m.'),
    ],
    clashes: [P(250, -400), { at: P(-250, -250), size: 200 }],
  },
  markers: {
    'eylau-town-barclay': mark(-1100, 1300, 'Barclay de Tolly', 'Shot in the arm', 'russia'),
    'eylau-town-bagration': mark(-1300, -300, 'Bagration', 'Rearguard', 'russia'),
    'eylau-town-soult': mark(1500, -1900, 'Soult', 'IV Corps', 'france'),
    'eylau-town-eylau': mark(0, 0, 'Preussisch Eylau', 'Taken by 10 p.m.', 'france', 'house'),
  },
});

// --- 8 February, morning: Augereau loses his way in the snowstorm and is shot down before the Russian centre ---
writePlan(`${G}/030-eylau-augereau`, {
  bbox,
  emblem: {
    units: [
      ...russianLine({ right: 'The Russian right', centre: 'The Russian centre', left: 'The Russian left' }),
      unit('russia', 'artillery', 400, 850, 1300, 300, 'battery', 'The Russian centre battery of 70 guns', { count: 12 }),
      unit('russia', 'infantry', 200, 2400, 1400, 300, 'russian-reserve', 'The Russian reserve'),
      unit('france', 'infantry', 1500, -500, 900, 300, 'leval', 'Leval’s division of Soult’s corps at the windmill knoll'),
      unit('france', 'infantry', -400, -1100, 900, 250, 'augereau', 'The survivors of Augereau’s VII Corps'),
      unit('france', 'square', 1150, 300, 240, 240, 'fourteenth', 'The 14th Line, fighting where it stands'),
      unit('france', 'infantry', -900, -1500, 700, 300, 'guard', 'Battalions of the Imperial Guard'),
      unit('france', 'infantry', -2000, 200, 1000, 300, 'st-hilaire', 'Saint-Hilaire’s division of Soult’s corps'),
      unit('france', 'infantry', -4200, 800, 1300, 300, 'davout', 'Davout’s III Corps arriving from the south', { facing: NORTH }),
    ],
    arrows: [
      arrow('france', [[-1500, -900], [-600, -150], [350, 500]], 130, 'augereau-attack', 'Augereau’s corps loses its way in the blizzard'),
      arrow('france', [[150, 350], [-300, -800]], 110, 'augereau-retreat', 'Augereau falls back on Eylau', 'dashed'),
      arrow('russia', [[-1000, 700], [-750, -300]], 110, 'column-attack', 'A Russian column of about 5,000 reaches the edge of Eylau'),
      arrow('france', [[-900, -1300], [-800, -550]], 110, 'guard-counterattack', 'The Guard stops the column'),
      arrow('france', [[-5400, 500], [-4400, 750]], 120, 'davout-approach', 'Davout comes up against the Russian left'),
    ],
    clashes: [P(450, 640), P(-780, -420)],
  },
  markers: {
    'eylau-augereau-augereau': mark(-700, -2300, 'Augereau', '929 killed, 4,271 wounded', 'france'),
    'eylau-augereau-napoleon': mark(300, -750, 'Napoleon', 'In the church tower', 'france'),
    'eylau-augereau-battery': mark(1500, 1700, '70 guns', 'Russian centre battery', 'russia', 'swords'),
    'eylau-augereau-davout': mark(-4800, 1700, 'Davout', 'III Corps', 'france'),
  },
});

// --- midday: Murat's charge through the Russian centre ---
writePlan(`${G}/040-eylau-murat`, {
  bbox,
  emblem: {
    units: [
      ...russianLine({ right: 'The Russian right', centre: 'The Russian centre, broken by the charge', left: 'The Russian left' }),
      unit('russia', 'infantry', 300, 2300, 1400, 250, 'russian-second', 'The second Russian line'),
      unit('russia', 'infantry', 300, 3600, 1400, 300, 'russian-reserve', 'The Russian reserves'),
      unit('france', 'cavalry', 300, 3000, 900, 250, 'dhautpoul', 'D’Hautpoul’s cuirassiers, stopped before the Russian reserves'),
      unit('france', 'cavalry', -1100, 900, 800, 250, 'grouchy', 'Grouchy’s dragoons'),
      unit('france', 'cavalry', 900, 1800, 700, 250, 'guard-cavalry', 'The Guard cavalry in the second wave'),
      unit('france', 'infantry', -400, -1200, 900, 300, 'guard', 'The Imperial Guard'),
      unit('france', 'infantry', -200, -700, 900, 250, 'augereau', 'The survivors of Augereau’s corps'),
      unit('france', 'infantry', -2000, 200, 1000, 300, 'st-hilaire', 'Saint-Hilaire’s division'),
      unit('france', 'infantry', -3200, 1100, 1300, 300, 'davout', 'Davout’s III Corps deploying', { facing: NORTH }),
    ],
    arrows: [
      arrow('france', [[-100, -900], [0, 1000], [300, 2800]], 140, 'dhautpoul-charge', 'D’Hautpoul’s cuirassiers ride through both Russian lines'),
      arrow('france', [[-600, -900], [-1500, 200], [-1150, 750]], 130, 'grouchy-charge', 'Grouchy’s dragoons scatter the Russian cavalry'),
      arrow('france', [[700, -900], [900, 1650]], 120, 'guard-cavalry-charge', 'The Guard cavalry charges in the second wave'),
    ],
    clashes: [P(0, 1200), P(300, 2150), P(-1100, 1100)],
  },
  markers: {
    'eylau-murat-murat': mark(-1300, -2300, 'Murat', 'About 11,000 horsemen', 'france'),
    'eylau-murat-dhautpoul': mark(1300, 3300, 'D’Hautpoul', 'Cuirassiers', 'france'),
    'eylau-murat-grouchy': mark(-1100, 2500, 'Grouchy', 'Dragoons', 'france'),
  },
});

// --- afternoon and evening: Davout bends back the Russian left, L'Estocq strikes his right, Ney arrives ---
writePlan(`${G}/050-eylau-lestocq`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', -1700, 1700, 1300, 300, 'davout', 'Davout’s III Corps, about 15,000', { facing: NORTH }),
      unit('france', 'infantry', -1700, 3100, 1300, 300, 'davout', 'Davout’s III Corps, about 15,000', { facing: NORTH }),
      unit('france', 'artillery', -3100, 1700, 700, 300, 'davout-guns', 'Davout’s battery on the heights of Klein Sausgarten', { facing: NORTH, count: 8 }),
      unit('france', 'infantry', -900, 450, 1000, 300, 'st-hilaire', 'Saint-Hilaire’s division', { facing: f.face(40) }),
      unit('france', 'infantry', -400, -1200, 900, 300, 'guard', 'The Imperial Guard, kept in reserve'),
      unit('france', 'infantry', 3000, -200, 1000, 300, 'ney', 'Ney’s leading division, arriving about 7 p.m.', { facing: f.face(130) }),
      unit('russia', 'infantry', -1050, 2400, 1800, 300, 'russian-left', 'The Russian left, bent back', { facing: SOUTH }),
      unit('russia', 'infantry', -100, 1350, 1600, 300, 'russian-centre', 'The Russian centre'),
      unit('russia', 'infantry', 1800, 1200, 1800, 300, 'russian-right', 'The Russian right'),
      unit('prussia', 'infantry', -1700, 4250, 700, 250, 'lestocq', 'L’Estocq’s Prussians, about 6,000'),
      unit('russia', 'artillery', -300, 3350, 600, 300, 'yermolov', 'Yermolov’s 36 guns', { facing: SOUTH, count: 8 }),
    ],
    arrows: [
      arrow('france', [[-3600, 2600], [-2000, 2500]], 130, 'davout-attack', 'Davout drives in the Russian left'),
      arrow('prussia', [[3900, -300], [3200, 2600], [1100, 4300], [-1450, 4300]], 130, 'lestocq-march', 'L’Estocq marches behind the Russian army and falls on Davout’s right'),
      arrow('france', [[4600, -1800], [3300, -400]], 120, 'ney-arrival', 'Ney arrives on the French left'),
    ],
    clashes: [P(-1700, 3900), P(-1300, 1900), P(2500, 500)],
  },
  markers: {
    'eylau-lestocq-davout': mark(-2700, 3400, 'Davout', 'Forced back towards Klein Sausgarten', 'france'),
    'eylau-lestocq-lestocq': mark(-500, 4300, 'L’Estocq', 'Strikes at 4 p.m.', 'prussia'),
    'eylau-lestocq-ney': mark(3900, -1000, 'Ney', 'Arrives about 7 p.m.', 'france'),
    'eylau-lestocq-bennigsen': mark(1000, 2900, 'Bennigsen', 'Retreats at 11 p.m.', 'russia'),
  },
});

console.log('eylau: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 700)));
