// The Metaurus, June 207 BC. Hasdrubal, lost in the night on the south bank of the river, turns to fight with his
// right on the river and his left on broken hills behind a ravine. The Romans come up from Sena to the south-east.
// Frame: origin 250 m beyond the river bank, u along Hasdrubal's line from the river (west-south-west) to the
// hills (east-north-east), w from his line towards the Romans (south-south-east).
import { frame, writePlan } from './lib.mjs';

const f = frame([12.9742, 43.78718], 75), P = f.p, CARTH = f.face(90), ROME = f.face(270);
const G = 'pages/040-second-war/020-attrition/050-metaurus';
// the lower Metaurus from the hills to its mouth south of Fanum
const river = { path: [[12.87, 43.735], [12.9, 43.748], [12.93, 43.76], [12.955, 43.772], [12.975, 43.785], [12.995, 43.795], [13.02, 43.812], [13.045, 43.829], [13.068, 43.842]], width: 60, id: 'metaurus', name: 'The river Metaurus' };
const ravine = { side: 'neutral', path: f.path([[1980, 760], [2250, 730], [2500, 760], [2800, 720]]), width: 45, id: 'ravine', name: 'The ravine in front of the Gauls' };
const bbox = f.box([[-700, -400], [3300, 2200]], 0);
const unit = (side, type, u, w, width, depth, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'rome' ? ROME : CARTH, ...extra });
const arrow = (side, pts, width = 70, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: Hasdrubal over the Alps and down the Adriatic, Nero's march north ---
writePlan(`${G}/010-metaurus`, {
  bbox: [4.4, 40.6, 17.2, 46.4],
  routes: {
    'hasdrubal-207': { name: 'Hasdrubal crosses the Alps and marches down the Adriatic coast, spring 207 BC', path: [[4.9, 45.2], [6.0, 45.0], [6.75, 44.93], [7.6, 45.05], [8.6, 45.02], [9.69, 45.05], [10.8, 44.72], [11.8, 44.32], [12.57, 44.06], [13.02, 43.84], [13.19, 43.72]] },
    'nero-207': { name: 'Nero marches north with 7,000 picked men', path: [[16.07, 41.22], [15.95, 41.55], [15.4, 41.92], [14.65, 42.2], [14.2, 42.48], [13.85, 42.92], [13.62, 43.3], [13.21, 43.7]] },
  },
  markers: {
    'metaurus-placentia': { lnglat: [9.69, 45.05], icon: 'castle', color: 'rome', label: 'Placentia', note: 'Hasdrubal besieges it in vain' },
  },
  show: ['sena-207', 'grumentum-207'],
});

// --- the night retreat from Sena and the morning on the river ---
writePlan(`${G}/020-metaurus-retreat`, {
  bbox: [12.9, 43.68, 13.27, 43.86],
  emblem: {
    water: [river],
    units: [
      { side: 'rome', type: 'camp', at: [13.207, 43.705], width: 900, depth: 700, facing: 345, id: 'roman-camp', name: 'The Roman camp near Sena' },
      { side: 'carthage', type: 'camp', at: [13.196, 43.714], width: 600, depth: 500, facing: 165, id: 'hasdrubal-camp', name: 'Hasdrubal’s camp' },
    ],
    arrows: [
      { side: 'carthage', path: [[13.19, 43.72], [13.14, 43.755], [13.08, 43.79], [13.045, 43.805], [13.01, 43.795], [12.99, 43.786]], width: 260, id: 'night-march', name: 'Hasdrubal’s night march towards a ford' },
      { side: 'rome', path: [[13.2, 43.7], [13.14, 43.73], [13.07, 43.765], [13.02, 43.772]], width: 260, id: 'pursuit', name: 'The Romans follow at first light' },
    ],
  },
  markers: {
    'metaurus-retreat-hasdrubal': { lnglat: [13.1, 43.815], icon: 'user', color: 'carthage', label: 'Hasdrubal', note: 'Lost by night, his guides gone' },
    'metaurus-retreat-romans': { lnglat: [13.13, 43.71], icon: 'user', color: 'rome', label: 'Livius, Nero and Porcius', note: 'Follow at first light' },
  },
  show: ['sena-207'],
});

// --- the armies deploy ---
const carthLine = [
  unit('carthage', 'cavalry', 220, 520, 320, 120, { id: 'carth-cavalry', name: 'Hasdrubal’s few cavalry' }), unit('carthage', 'infantry', 760, 550, 600, 260, { id: 'iberians', name: 'Iberian veterans in deep ranks' }),
  unit('carthage', 'infantry', 1450, 560, 620, 240, { id: 'ligurians', name: 'Ligurians in deep ranks' }), unit('carthage', 'infantry', 2380, 470, 720, 150, { id: 'gauls', name: 'Gauls on the hill behind the ravine' }),
];
writePlan(`${G}/030-metaurus-deployment`, {
  bbox,
  emblem: {
    water: [river], works: [ravine],
    units: [
      ...carthLine, unit('carthage', 'elephants', 1100, 790, 1100, 70, { count: 10, id: 'elephants', name: 'Ten elephants in front of the line' }),
      unit('rome', 'cavalry', 220, 1380, 420, 140, { id: 'roman-cavalry', name: 'Roman cavalry on the left' }), unit('rome', 'infantry', 820, 1420, 820, 220, { id: 'livius', name: 'Livius with the Roman left' }),
      unit('rome', 'infantry', 1620, 1420, 720, 200, { id: 'porcius', name: 'Porcius with the centre' }), unit('rome', 'infantry', 2420, 1420, 820, 220, { id: 'nero', name: 'Nero with the Roman right' }),
    ],
  },
  markers: {
    'metaurus-deploy-iberians': mark(760, 220, 'Iberians', 'Hasdrubal’s veterans, deep ranks', 'carthage', 'swords'),
    'metaurus-deploy-ligurians': mark(1450, 230, 'Ligurians', 'Centre, also deep', 'carthage', 'swords'),
    'metaurus-deploy-gauls': mark(2400, 220, 'Gauls', 'On a hill behind a ravine', 'carthage', 'swords'),
    'metaurus-deploy-livius': mark(820, 1720, 'Livius', 'Roman left and cavalry', 'rome'),
    'metaurus-deploy-porcius': mark(1620, 1710, 'Porcius', 'Centre', 'rome'),
    'metaurus-deploy-nero': mark(2420, 1720, 'Nero', 'Roman right', 'rome'),
  },
});

// --- Nero's march behind the Roman line and the collapse of the Carthaginian right ---
writePlan(`${G}/040-metaurus-nero`, {
  bbox,
  emblem: {
    water: [river], works: [ravine],
    units: [
      unit('carthage', 'infantry', 760, 600, 560, 260, { id: 'iberians', name: 'Iberians, attacked in front and flank' }), unit('carthage', 'infantry', 1450, 600, 620, 240, { id: 'ligurians', name: 'Ligurians in the centre' }),
      unit('carthage', 'infantry', 2380, 470, 720, 150, { id: 'gauls', name: 'Gauls on the hill behind the ravine' }), unit('carthage', 'elephants', 1150, 900, 700, 70, { count: 6, id: 'elephants', name: 'Elephants loose among both armies' }),
      unit('rome', 'infantry', 820, 960, 820, 220, { id: 'livius', name: 'Livius with the Roman left' }), unit('rome', 'infantry', 1620, 960, 720, 200, { id: 'porcius', name: 'Porcius with the centre' }),
      unit('rome', 'infantry', 2420, 1350, 420, 200, { id: 'nero-rest', name: 'The rest of Nero’s wing, facing the ravine' }), unit('rome', 'infantry', 260, 620, 300, 180, { facing: f.face(0), id: 'nero-flank', name: 'Nero with half his men, on the Iberian flank' }),
    ],
    arrows: [
      arrow('rome', [[2250, 1650], [1700, 1900], [900, 1950], [150, 1700], [-150, 1150], [-40, 760], [80, 640]], 110, undefined, { id: 'nero-march', name: 'Nero leads half his men behind the Roman line' }),
      arrow('carthage', [[150, 420], [-100, 300], [-330, 230]], 90, 'dashed', { id: 'cavalry-flight', name: 'The Carthaginian cavalry is driven off' }),
      arrow('rome', [[120, 900], [-80, 620], [-260, 420]], 90, undefined, { id: 'cavalry-pursuit', name: 'The Roman cavalry pursues' }),
      arrow('carthage', [[900, 430], [820, 250], [700, 80]], 80, 'dashed', { id: 'iberians-break', name: 'The Iberians give way' }),
    ],
    clashes: [P(760, 790), P(1450, 800), P(420, 620), { at: P(1150, 960), size: 120 }],
  },
  markers: {
    'metaurus-nero-nero': mark(-420, 1250, 'Nero', 'Leads half his men round the line', 'rome'),
    'metaurus-nero-elephants': mark(1150, 1150, 'Elephants', 'Run amok in both armies', 'carthage', 'swords'),
    'metaurus-nero-hasdrubal': mark(1890, 420, 'Hasdrubal', 'Killed charging a Roman cohort', 'carthage', 'skull'),
    'metaurus-nero-gauls': mark(2400, 220, 'Gauls', 'Attacked from three sides', 'carthage', 'swords'),
  },
});

// --- after the battle: Nero's return and the head of Hasdrubal, Hannibal's withdrawal to Bruttium ---
writePlan(`${G}/050-metaurus-aftermath`, {
  bbox: [12.4, 38.7, 17.6, 44.1],
  routes: {
    'nero-return-207': { name: 'Nero returns to his camp in Apulia', path: [[13.05, 43.77], [13.6, 43.25], [13.85, 42.88], [14.2, 42.45], [14.65, 42.17], [15.4, 41.88], [15.95, 41.5], [16.07, 41.23]] },
    'hannibal-207': { name: 'Hannibal withdraws to Bruttium', style: 'dashed', path: [[16.0, 41.05], [16.45, 40.6], [16.75, 40.2], [16.85, 39.75], [16.95, 39.35]] },
  },
  markers: {
    'metaurus-aftermath-field': { lnglat: P(1300, 800), icon: 'skull', color: 'carthage', label: 'The Metaurus', note: 'Polybius: 10,000 dead. Livy: 56,000' },
  },
});

console.log('metaurus written, battle at', JSON.stringify(P(1300, 950)), 'bbox', JSON.stringify(bbox));
