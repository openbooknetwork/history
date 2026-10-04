// Lake Trasimene, 21 June 217 BC. The Roman column marches east along the north shore, between the lake and
// the hills, and is attacked from the slopes. The lake is drawn with a shore further north than today's.
// Frame: origin west of Tuoro at the foot of the hills, u east along the shore, w south towards the lake.
import { frame, writePlan } from './lib.mjs';

const f = frame([12.03, 43.205], 90), P = f.p;
const G = 'pages/040-second-war/010-invasion/030-trasimene';
// the lake, its north shore a little north of the modern one, the rest close to today's outline
const lake = { area: [[12.022, 43.168], [12.025, 43.18], [12.045, 43.19], [12.07, 43.195], [12.095, 43.196], [12.118, 43.193], [12.135, 43.187],
  [12.155, 43.176], [12.178, 43.16], [12.195, 43.14], [12.2, 43.115], [12.19, 43.09], [12.165, 43.072], [12.13, 43.063], [12.09, 43.065],
  [12.06, 43.078], [12.045, 43.1], [12.04, 43.125], [12.03, 43.15]], id: 'lake', name: 'Lake Trasimene, its north shore further north than today' };
const bbox = f.box([[-2300, -2600], [10600, 2700]], 0);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 120, style) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}) });
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const mark = (u, w, label, note, color, icon = 'swords') => ({ lnglat: P(u, w), icon, color, label, note });
const S = 180, E = 90, W = 270;

// the Roman column: three parallel columns about 4 km long on the shore road, heading east-north-east
const colDir = 82, along = [Math.sin(colDir * Math.PI / 180), -Math.cos(colDir * Math.PI / 180)]; // (u, w) unit vector along the march
const columns = (cu, cw, length) => [-170, 0, 170].map(o => n(unit('rome', 'infantry', cu - along[1] * o, cw + along[0] * o, 110, length, colDir), 'roman-column', 'The Roman army on the shore road, about 25,000, in three columns'));

// --- overview: over the Apennines and through the Arno marshes, Flaminius in pursuit ---
writePlan(`${G}/010-trasimene`, {
  routes: {
    'hannibal-217': { name: 'Hannibal crosses the Apennines and the Arno marshes, spring 217 BC',
      path: [[11.34, 44.49], [11.15, 44.25], [11.02, 44.03], [10.95, 43.9], [11.05, 43.8], [11.22, 43.77], [11.45, 43.62], [11.7, 43.43], [11.85, 43.33], [11.99, 43.27], [12.04, 43.2]] },
    'flaminius-217': { name: 'Flaminius follows from Arretium, June 217 BC', offset: 6, path: [[11.88, 43.46], [11.92, 43.37], [11.98, 43.29], [12.0, 43.22], [12.03, 43.2]] },
  },
  markers: { 'arno-217': { lnglat: [10.95, 43.78], icon: 'waves', color: 'carthage', label: 'Arno marshes', note: 'Four days and three nights in water' } },
  show: ['arretium-217', 'ariminum-217'],
});

// --- the night: Hannibal's camp in view, the army hidden behind the hills ---
writePlan(`${G}/020-trasimene-ambush`, {
  bbox,
  emblem: {
    water: [lake],
    units: [
      n(unit('rome', 'camp', -1500, 1500, 650, 650, 0), 'roman-camp', 'Flaminius’s camp by the lake'),
      n(unit('carthage', 'camp', 7400, 400, 700, 600, 0), 'camp', 'Hannibal’s camp, in view of the Romans'),
      n(unit('carthage', 'cavalry', 300, -700, 1000, 300, S), 'cavalry', 'Carthaginian cavalry, hidden near the entrance'),
      n(unit('carthage', 'infantry', 3600, -1300, 2200, 300, S), 'gauls', 'Gauls, hidden behind the hills'),
      n(unit('carthage', 'infantry', 6300, -700, 1500, 350, 200), 'africans-iberians', 'African and Iberian infantry near the camp'),
      n(unit('carthage', 'light', 8000, 900, 1000, 80, 250), 'light', 'Light infantry beyond the camp'),
    ],
    arrows: [n(arrow('carthage', [[7000, 50], [5600, -1850], [3100, -2250], [1400, -1550]], 150), 'night-march', 'The army moves by night into hiding behind the hills')],
  },
  markers: {
    'trasimene-ambush-camp': mark(7700, -650, 'Hannibal’s camp', 'In full view of the Romans', 'carthage', 'flag'),
    'trasimene-ambush-cavalry': mark(300, -1850, 'Cavalry', 'Hidden near the entrance', 'carthage'),
    'trasimene-ambush-gauls': mark(3600, -2450, 'Gauls', 'Behind the hills', 'carthage'),
    'trasimene-ambush-africans': mark(5900, -1900, 'Africans and Iberians', 'Close to the camp', 'carthage'),
    'trasimene-ambush-flaminius': mark(-1500, 2000, 'Flaminius', 'Camps by the lake', 'rome', 'user'),
  },
});

// --- the morning: the column on the shore road, the attack from the slopes ---
writePlan(`${G}/030-trasimene-trap`, {
  bbox,
  emblem: {
    water: [lake],
    units: [
      ...columns(3450, 950, 4100),
      n(unit('carthage', 'cavalry', 450, 1000, 650, 250, E), 'cavalry', 'Carthaginian cavalry, closing the road behind'),
      n(unit('carthage', 'infantry', 3500, 230, 2400, 250, 190), 'gauls', 'Gauls charging down the slopes'),
      n(unit('carthage', 'infantry', 6250, 520, 1000, 300, 255), 'africans-iberians', 'African and Iberian infantry, blocking the road'),
      n(unit('carthage', 'light', 7300, 1000, 700, 80, W), 'light', 'Light infantry'),
    ],
    arrows: [
      n(arrow('carthage', [[200, -600], [250, 500], [1250, 1150]], 140), 'cavalry-attack', 'The cavalry closes the road behind the column'),
      n(arrow('carthage', [[2900, 380], [2900, 870]], 120), 'gauls-attack', 'The Gauls fall on the middle of the column'),
      n(arrow('carthage', [[4100, 380], [4100, 800]], 120), 'gauls-attack', 'The Gauls fall on the middle of the column'),
      n(arrow('carthage', [[6000, 580], [5560, 680]], 120), 'africans-attack', 'The Africans and Iberians stop the head of the column'),
    ],
    clashes: [P(1400, 1200), P(2900, 840), P(4100, 790), P(5520, 700)],
  },
  markers: {
    'trasimene-trap-column': mark(2300, 1650, 'Roman column', 'About 25,000, in three columns', 'rome'),
    'trasimene-trap-cavalry': mark(250, 1500, 'Cavalry', 'Closes the road behind', 'carthage'),
    'trasimene-trap-gauls': mark(3500, -850, 'Gauls', 'Charge down the slopes', 'carthage'),
    'trasimene-trap-africans': mark(6500, -600, 'Africans and Iberians', 'Stop the head of the column', 'carthage'),
  },
});

// --- the destruction: groups cut down, men driven into the lake, the vanguard breaks out east ---
writePlan(`${G}/040-trasimene-destruction`, {
  bbox,
  emblem: {
    water: [lake],
    units: [
      ...[[1700, 1150, 320, 200, S], [2600, 1000, 360, 220, 10], [3450, 900, 420, 240, 0], [4300, 820, 320, 200, 20]].map(([u, w, wd, d, fc]) =>
        n(unit('rome', 'infantry', u, w, wd, d, fc), 'roman-groups', 'Roman groups cut off and cut down along the shore')),
      n(unit('rome', 'infantry', 10050, 2150, 450, 250, 60), 'vanguard', 'The Roman vanguard of 6,000, broken out to the east'),
      n(unit('carthage', 'cavalry', 950, 1250, 550, 250, E), 'cavalry', 'Carthaginian cavalry'),
      n(unit('carthage', 'infantry', 3300, 420, 2600, 250, 185), 'gauls', 'Gauls'),
      n(unit('carthage', 'infantry', 5450, 470, 900, 300, 230), 'africans-iberians', 'African and Iberian infantry'),
    ],
    arrows: [
      n(arrow('rome', [[5650, 700], [7000, 1080], [8400, 1500], [9750, 2000]], 150), 'vanguard-breakout', 'The vanguard breaks out to the east'),
      n(arrow('rome', [[2200, 1180], [1750, 2150]], 100, 'dashed'), 'into-lake', 'Fugitives driven into the lake'),
      n(arrow('rome', [[3900, 980], [4000, 1650]], 100, 'dashed'), 'into-lake', 'Fugitives driven into the lake'),
      n(arrow('carthage', [[1250, 1350], [1850, 1780]], 110), 'cavalry-drive', 'The cavalry drives men into the lake'),
    ],
    clashes: [P(2600, 830), P(3450, 720), P(4300, 650)],
  },
  markers: {
    'trasimene-end-flaminius': mark(3700, 1450, 'Flaminius', 'Killed by the Gaul Ducarius', 'rome', 'skull'),
    'trasimene-end-vanguard': mark(9600, 2550, 'Roman vanguard', '6,000 break out, surrender later', 'rome'),
    'trasimene-end-lake': mark(1500, 2700, 'In the lake', 'Fugitives drown', 'rome', 'skull'),
    'trasimene-end-gauls': mark(3300, -720, 'Gauls', 'Three hours of hard fighting', 'carthage'),
  },
});

console.log('trasimene: bbox', JSON.stringify(bbox), 'field', JSON.stringify(P(3450, 900)));
