// Capua, 212 to 211 BC. Two rings of Roman siege works around the city, the camps between them, Hannibal's attack
// from the slopes of Tifata with a sortie from the city, then his march on Rome. Ring sizes are estimates.
// Frame: origin at the centre of ancient Capua (Santa Maria Capua Vetere), u north, w east.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/040-second-war/020-attrition/020-capua';
const f = frame([14.255, 41.083], 0), P = f.p;
const polar = (r, b) => [r * Math.cos(b * Math.PI / 180), r * Math.sin(b * Math.PI / 180)]; // bearing b from north
const at = (r, b) => P(...polar(r, b));
const ring = r => [...Array(49)].map((_, i) => at(r, i * 7.5));
const unit = (side, type, r, b, width, depth, facing, extra = {}) => ({ side, type, at: at(r, b), width, depth, facing, ...extra });
const arrow = (side, pts, width = 110, style) => ({ side, path: pts.map(([r, b]) => at(r, b)), width, ...(style ? { style } : {}) });
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const mark = (r, b, label, note, color, icon = 'swords') => ({ lnglat: at(r, b), icon, color, label, note });
const ll = (lnglat, label, note, color, icon = 'swords') => ({ lnglat, icon, color, label, note });

const bbox = f.box([[-3400, -4300], [4300, 3900]], 0);
const volturnus = { path: [[14.33, 41.17], [14.28, 41.135], [14.24, 41.115], [14.213, 41.104], [14.18, 41.095], [14.14, 41.08], [14.1, 41.07]], width: 110, id: 'volturnus', name: 'The river Volturnus' };
const works = [{ side: 'carthage', path: ring(800), width: 60, id: 'walls', name: 'The walls of Capua' },
  { side: 'rome', path: ring(1700), width: 45, id: 'inner-line', name: 'Roman inner line, a ditch and wall facing the city' },
  { side: 'rome', path: ring(2400), width: 45, id: 'outer-line', name: 'Roman outer line, facing a relieving army' }];
const camps = [n(unit('rome', 'camp', 2050, 45, 450, 450, 45), 'camp-fulvius', 'Camp of Quintus Fulvius Flaccus'),
  n(unit('rome', 'camp', 2050, 200, 450, 450, 200), 'camp-appius', 'Camp of Appius Claudius Pulcher'),
  n(unit('rome', 'camp', 2050, 300, 450, 450, 300), 'camp-nero', 'Camp of Gaius Claudius Nero')];

// --- overview: Capua joins Hannibal; the relief of 212 and the march towards Brundisium ---
writePlan(`${G}/010-capua`, {
  routes: {
    'hannibal-capua-212': { name: 'Hannibal marches to relieve Capua, 212 BC', path: [[17.2, 40.5], [16.5, 40.72], [15.8, 40.9], [15.0, 41.05], [14.3, 41.09]] },
    'hannibal-brundisium-212': { name: 'Hannibal marches towards Brundisium', style: 'dashed', offset: 6, path: [[14.3, 41.1], [15.3, 41.02], [16.5, 40.78], [17.4, 40.62], [17.94, 40.64]] },
  },
  markers: { 'capua-216': ll([14.255, 41.083], 'Capua', 'Joins Hannibal, 216 BC', 'carthage', 'castle') },
  show: ['nola-216', 'tarentum-212'],
});

// --- the siege lines ---
writePlan(`${G}/020-capua-siege-lines`, {
  bbox,
  emblem: {
    water: [volturnus], works,
    units: [...camps, n(unit('rome', 'light', 1500, 250, 600, 70, 70), 'velites', 'Velites, carried into action behind the cavalrymen'),
      n(unit('rome', 'cavalry', 1950, 250, 500, 160, 70), 'cavalry', 'Roman cavalry')],
    arrows: [n(arrow('carthage', [[900, 250], [1300, 252]], 100), 'capuan-sortie', 'Capuan horsemen ride out against the lines')],
    clashes: [{ at: at(1380, 250), size: 130 }],
  },
  markers: {
    'capua-lines-city': ll([14.255, 41.083], 'Capua', 'Blockaded, 212 to 211 BC', 'carthage', 'castle'),
    'capua-lines-fulvius': mark(3150, 40, 'Fulvius Flaccus', 'Camp between the lines', 'rome', 'user'),
    'capua-lines-appius': mark(3200, 185, 'Appius Claudius', 'Camp between the lines', 'rome', 'user'),
    'capua-lines-nero': mark(2900, 268, 'Claudius Nero', 'A third army', 'rome', 'user'),
    'capua-lines-casilinum': ll([14.213, 41.106], 'Casilinum', 'Roman supply depot on the Volturnus', 'rome', 'wheat'),
  },
});

// --- Hannibal's attack: the outer line from Tifata, the sortie against the inner line ---
writePlan(`${G}/030-capua-attack`, {
  bbox,
  emblem: {
    water: [volturnus], works,
    units: [
      ...camps,
      n(unit('carthage', 'camp', 3600, 40, 700, 700, 40), 'hannibal-camp', 'Hannibal’s camp on the slopes of Tifata'),
      n(unit('carthage', 'infantry', 2950, 42, 1500, 300, 222), 'hannibal-army', 'Hannibal’s army attacking the outer line'),
      n(unit('carthage', 'elephants', 2230, 55, 260, 90, 235, { count: 3 }), 'elephants', 'Three elephants that break into a Roman camp'),
      n(unit('rome', 'infantry', 2150, 72, 900, 160, 72), 'fulvius-troops', 'Fulvius Flaccus’s troops holding the outer line'),
      n(unit('carthage', 'infantry', 1150, 215, 700, 200, 215), 'sortie', 'Sortie from the city under Bostar and Hanno'),
      n(unit('rome', 'infantry', 1880, 215, 800, 180, 35), 'appius-troops', 'Appius Claudius’s troops facing the sortie'),
    ],
    arrows: [
      n(arrow('carthage', [[2800, 33], [2300, 33]], 110), 'hannibal-attack', 'Hannibal attacks the outer line'),
      n(arrow('carthage', [[2800, 50], [2300, 47]], 110), 'hannibal-attack', 'Hannibal attacks the outer line'),
      n(arrow('carthage', [[2900, 60], [2400, 58], [2150, 52]], 90), 'cohort-attack', 'An Iberian cohort with the elephants breaks into a camp'),
      n(arrow('carthage', [[1250, 208], [1680, 208]], 100), 'sortie-attack', 'The sortie attacks the inner line'),
      n(arrow('carthage', [[1250, 223], [1680, 223]], 100), 'sortie-attack', 'The sortie attacks the inner line'),
    ],
    clashes: [at(2400, 40), at(2150, 48), at(1700, 215)],
  },
  markers: {
    'capua-attack-hannibal': mark(4300, 28, 'Hannibal', 'Attacks the outer line', 'carthage', 'user'),
    'capua-attack-cohort': mark(2900, 78, 'Iberian cohort', 'Three elephants reach a Roman camp', 'carthage'),
    'capua-attack-sortie': ll([14.255, 41.083], 'Bostar and Hanno', 'Sortie from the city', 'carthage', 'user'),
    'capua-attack-appius': mark(2900, 210, 'Appius Claudius', 'Wounded driving back the sortie', 'rome', 'user'),
    'capua-attack-fulvius': mark(3200, 352, 'Fulvius Flaccus', 'Holds off Hannibal', 'rome', 'user'),
  },
});

// --- the march on Rome ---
writePlan(`${G}/040-capua-rome`, {
  routes: {
    'hannibal-rome-211': { name: 'Hannibal marches on Rome, 211 BC',
      path: [[14.3, 41.11], [14.14, 41.21], [14.06, 41.26], [13.83, 41.49], [13.53, 41.55], [13.16, 41.73], [12.77, 41.8], [12.6, 41.92]] },
    'fulvius-rome-211': { name: 'Fulvius Flaccus brings a picked force to Rome',
      path: [[14.2, 41.06], [13.95, 41.17], [13.76, 41.26], [13.6, 41.28], [13.43, 41.36], [13.26, 41.31], [13.05, 41.45], [12.95, 41.56], [12.65, 41.73], [12.5, 41.88]] },
    'hannibal-south-211': { name: 'Hannibal withdraws to the south', style: 'dashed',
      path: [[12.62, 41.95], [13.1, 42.05], [13.7, 41.95], [14.3, 41.7], [14.9, 41.35], [15.35, 41.1]] },
  },
  markers: { 'capua-211': ll([14.255, 41.083], 'Capua', 'Surrenders, 211 BC', 'rome', 'castle') },
  show: ['rome-211'],
});

console.log('capua: bbox', JSON.stringify(bbox));
