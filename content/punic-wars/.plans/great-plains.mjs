// Scipio in Africa, 204 to 203 BC: the night attack on the camps near Utica, then the battle on the Great Plains of
// the Bagradas near Souk el Khemis. Neither site is known in detail. The ancient gulf reached Utica, since filled
// by the Bagradas.
// Frame for the battle: origin in the plain north of the river, u north along the lines, w east from the
// Carthaginians towards the Romans, who came up from Utica.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/040-second-war/030-scipio/020-great-plains';
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: the landing at Cape Farina, the siege of Utica, the camps of Hasdrubal and Syphax ---
writePlan(`${G}/010-great-plains`, {
  bbox: [8.6, 35.8, 13.0, 38.4],
  routes: {
    'scipio-204': { name: 'Scipio’s fleet of 400 transports and 40 galleys crosses from Lilybaeum, 204 BC', path: [[12.44, 37.8], [11.8, 37.62], [11.0, 37.42], [10.5, 37.27], [10.28, 37.18]] },
  },
  markers: {
    'great-plains-castra': { lnglat: [10.1, 37.105], icon: 'flag', color: 'rome', label: 'Castra Cornelia', note: 'Scipio’s fortified camp' },
    'great-plains-hasdrubal-camp': { lnglat: [10.04, 36.99], icon: 'flag', color: 'carthage', label: 'Hasdrubal Gisco', note: 'Camp of a reported 33,000' },
    'great-plains-syphax-camp': { lnglat: [9.995, 36.975], icon: 'crown', color: 'carthage', label: 'Syphax', note: 'Camp of a reported 60,000' },
  },
  show: ['utica-204'],
});

// --- the night attack on the two camps ---
const gulf = { area: [[10.07, 37.05], [10.085, 37.075], [10.11, 37.09], [10.12, 37.1], [10.135, 37.12], [10.17, 37.15], [10.22, 37.165], [10.26, 37.15], [10.26, 37.06], [10.22, 36.99], [10.16, 36.96], [10.11, 36.96], [10.085, 36.985], [10.07, 37.02]], id: 'gulf', name: 'The ancient gulf of Utica' };
const bagradasLower = { path: [[9.9, 36.84], [9.95, 36.88], [10.0, 36.92], [10.05, 36.955], [10.09, 36.97]], width: 120, id: 'bagradas', name: 'The river Bagradas' };
writePlan(`${G}/020-great-plains-camps`, {
  bbox: [9.93, 36.92, 10.2, 37.14],
  emblem: {
    water: [gulf, bagradasLower],
    units: [
      { side: 'rome', type: 'camp', at: [10.1, 37.105], width: 900, depth: 700, facing: 225, id: 'castra-cornelia', name: 'Castra Cornelia, Scipio’s camp' },
      { side: 'carthage', type: 'camp', at: [10.04, 36.99], width: 900, depth: 700, facing: 45, id: 'hasdrubal-camp', name: 'Hasdrubal’s camp, timber huts behind earth ramparts' },
      { side: 'carthage', type: 'camp', at: [9.995, 36.975], width: 1300, depth: 900, facing: 45, id: 'syphax-camp', name: 'Syphax’s camp, huts of reed and thatch' },
    ],
    arrows: [
      { side: 'rome', path: [[10.095, 37.095], [10.065, 37.035], [10.04, 37.0]], width: 220, id: 'scipio-attack', name: 'Scipio storms the Carthaginian camp' },
      { side: 'numidia', path: [[10.09, 37.1], [10.045, 37.065], [10.01, 37.02], [9.998, 36.985]], width: 220, id: 'laelius-masinissa', name: 'Laelius and Masinissa fire the Numidian camp' },
      { side: 'carthage', path: [[10.05, 36.985], [10.1, 36.95], [10.16, 36.93], [10.22, 36.92]], width: 180, style: 'dashed', id: 'hasdrubal-flight', name: 'Hasdrubal escapes to Carthage with 2,500 men' },
      { side: 'carthage', path: [[9.985, 36.968], [9.96, 36.955], [9.94, 36.94]], width: 160, style: 'dashed', id: 'syphax-flight', name: 'Syphax escapes with a few horsemen' },
    ],
    clashes: [{ at: [10.04, 36.99], size: 350 }, { at: [9.995, 36.975], size: 350 }],
  },
  markers: {
    'great-plains-camps-numidian': mark([9.985, 36.99], 'Numidian camp', 'Reed huts set on fire', 'carthage', 'flame'),
    'great-plains-camps-carthaginian': mark([10.045, 37.003], 'Carthaginian camp', 'Stormed in the dark', 'carthage', 'flame'),
    'great-plains-camps-laelius': mark([10.03, 37.065], 'Laelius and Masinissa', 'Against Syphax', 'numidia'),
    'great-plains-camps-scipio': mark([10.085, 37.04], 'Scipio', 'Against Hasdrubal', 'rome'),
  },
  show: ['utica-204'],
});

// --- the battle on the Great Plains ---
const f = frame([8.944, 36.627], 0), P = f.p, CARTH = f.face(90), ROME = f.face(270);
const bagradas = { path: [[8.84, 36.57], [8.88, 36.585], [8.915, 36.598], [8.944, 36.607], [8.975, 36.613], [9.01, 36.618], [9.05, 36.622]], width: 90, id: 'bagradas', name: 'The river Bagradas' };
const bbox = f.box([[-2600, -2600], [2600, 2600]], 0);
const unit = (side, type, u, w, width, depth, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'carthage' ? CARTH : ROME, ...extra });
const arrow = (side, pts, width = 90, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
const m = (u, w, label, note, color, icon) => mark(P(u, w), label, note, color, icon);

writePlan(`${G}/030-great-plains-wings`, {
  bbox,
  emblem: {
    water: [bagradas],
    units: [
      unit('carthage', 'infantry', 0, -420, 520, 200, { id: 'iberians', name: 'Iberians, 4,000 newly arrived from Carthage' }), unit('carthage', 'infantry', -750, -1050, 600, 150, { id: 'carth-infantry', name: 'Carthaginian infantry on the right' }), unit('carthage', 'infantry', 750, -1050, 600, 150, { id: 'numidian-infantry', name: 'Syphax’s Numidian infantry on the left' }),
      unit('rome', 'infantry', 0, 120, 700, 90, { id: 'hastati', name: 'Hastati of the two Roman legions' }), unit('rome', 'infantry', 0, 270, 700, 90, { id: 'principes', name: 'Principes' }), unit('rome', 'infantry', 0, 420, 700, 90, { id: 'triarii', name: 'Triarii' }),
      unit('rome', 'infantry', -900, -500, 700, 260, { id: 'allied-legions', name: 'An allied legion on each wing' }), unit('rome', 'infantry', 900, -500, 700, 260, { id: 'allied-legions', name: 'An allied legion on each wing' }),
      unit('numidia', 'cavalry', -1450, -900, 500, 150, { id: 'masinissa', name: 'Masinissa’s Numidian cavalry' }), unit('rome', 'cavalry', 1450, -900, 500, 150, { id: 'laelius', name: 'Roman cavalry under Laelius' }),
    ],
    arrows: [
      arrow('carthage', [[-750, -1180], [-850, -1600], [-950, -2100]], 100, 'dashed', { id: 'infantry-flight', name: 'The Carthaginian and Numidian infantry flee' }), arrow('carthage', [[750, -1180], [850, -1600], [950, -2100]], 100, 'dashed', { id: 'infantry-flight', name: 'The Carthaginian and Numidian infantry flee' }),
      arrow('carthage', [[-1350, -1150], [-1500, -1800], [-1600, -2400]], 90, 'dashed', { id: 'cavalry-flight', name: 'The cavalry on both Carthaginian wings breaks' }), arrow('carthage', [[1350, -1150], [1500, -1800], [1600, -2400]], 90, 'dashed', { id: 'cavalry-flight', name: 'The cavalry on both Carthaginian wings breaks' }),
    ],
    clashes: [P(0, -260)],
  },
  markers: {
    'great-plains-wings-iberians': m(0, -800, 'Iberians', '4,000 newly arrived, stand firm', 'carthage', 'swords'),
    'great-plains-wings-hastati': m(0, 700, 'Hastati', 'Two Roman legions', 'rome', 'swords'),
    'great-plains-wings-laelius': m(1500, -500, 'Laelius', 'Roman cavalry, the right', 'rome'),
    'great-plains-wings-masinissa': m(-1500, -500, 'Masinissa', 'Numidian cavalry, the left', 'numidia'),
    'great-plains-wings-hasdrubal': m(1150, -2300, 'Hasdrubal and Syphax', 'Their wings flee', 'carthage', 'skull'),
  },
});

writePlan(`${G}/040-great-plains-iberians`, {
  bbox,
  emblem: {
    water: [bagradas],
    units: [
      unit('carthage', 'infantry', 0, -420, 520, 200, { id: 'iberians', name: 'The Iberians, surrounded' }),
      unit('rome', 'infantry', 0, -220, 700, 90, { id: 'hastati', name: 'The hastati hold the front' }),
      unit('rome', 'infantry', 520, -560, 600, 120, { facing: 200, id: 'columns', name: 'Principes and triarii on the flanks' }), unit('rome', 'infantry', -520, -560, 600, 120, { facing: 340, id: 'columns', name: 'Principes and triarii on the flanks' }),
    ],
    arrows: [
      arrow('rome', [[300, 270], [650, 150], [800, -250], [620, -520]], 100, undefined, { id: 'columns-march', name: 'The principes and triarii march round both flanks' }), arrow('rome', [[-300, 270], [-650, 150], [-800, -250], [-620, -520]], 100, undefined, { id: 'columns-march', name: 'The principes and triarii march round both flanks' }),
    ],
    clashes: [P(0, -300), P(330, -460), P(-330, -460)],
  },
  markers: {
    'great-plains-iberians-iberians': m(0, -900, 'Iberians', 'Fight to the last man', 'carthage', 'skull'),
    'great-plains-iberians-columns': m(1150, -150, 'Principes and triarii', 'March round both flanks', 'rome', 'swords'),
    'great-plains-iberians-scipio': m(0, 350, 'Scipio', 'Hastati hold the front', 'rome'),
  },
});

// --- after the battle: the pursuit of Syphax to Cirta, Scipio at Tunis ---
writePlan(`${G}/050-great-plains-cirta`, {
  bbox: [6.2, 35.6, 10.7, 37.4],
  routes: {
    'laelius-masinissa-203': { name: 'Laelius and Masinissa pursue Syphax to Cirta', path: [[8.9, 36.6], [8.3, 36.45], [7.6, 36.4], [7.0, 36.35], [6.65, 36.36]] },
    'scipio-tunis-203': { name: 'Scipio takes Tunis, in sight of Carthage', path: [[8.98, 36.62], [9.4, 36.68], [9.8, 36.75], [10.15, 36.8]] },
    'hasdrubal-carthage-203': { name: 'Hasdrubal Gisco flees to Carthage', style: 'dashed', offset: 6, path: [[8.98, 36.63], [9.4, 36.72], [9.85, 36.8], [10.3, 36.85]] },
  },
  show: ['cirta-203', 'tunis-203', 'carthage-203'],
});

console.log('great-plains written, battle at', JSON.stringify(P(0, 0)), 'bbox', JSON.stringify(bbox));
