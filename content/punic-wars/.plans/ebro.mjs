// The Scipios in Spain, 218 to 211 BC, and the battle of Ibera (Dertosa), spring 215 BC. The field is placed on
// the plain south of Ibera (Tortosa) on the right bank of the Ebro; the exact site is not known.
// Frame: origin on the plain, u east towards the river, w south from the Romans towards Hasdrubal.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/040-second-war/020-attrition/010-ebro';
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const ll = (lnglat, label, note, color, icon = 'swords') => ({ lnglat, icon, color, label, note });

// --- overview: Emporion and Cissa, the Ebro river battle, Hasdrubal's march north ---
writePlan(`${G}/010-ebro`, {
  routes: {
    'gnaeus-scipio-218': { name: 'Gnaeus Scipio sails from Massalia to Emporion and marches to Cissa, autumn 218 BC',
      path: [[5.37, 43.29], [4.6, 43.0], [3.6, 42.6], [3.13, 42.14], [2.85, 41.95], [2.2, 41.47], [1.6, 41.25], [1.27, 41.13]] },
    'hasdrubal-fleet-217': { name: 'Hasdrubal’s fleet sails to the mouth of the Ebro, spring 217 BC',
      path: [[-0.98, 37.57], [-0.3, 38.35], [0.25, 39.3], [0.65, 40.25], [0.9, 40.68]] },
    'hasdrubal-215': { name: 'Hasdrubal marches north towards Italy, spring 215 BC',
      path: [[-0.99, 37.63], [-1.05, 38.3], [-0.65, 39.3], [-0.15, 40.1], [0.33, 40.6], [0.52, 40.75]] },
  },
  markers: { 'ebro-217': ll([0.88, 40.72], 'Mouth of the Ebro', '29 of 40 Carthaginian ships lost, 217 BC', 'rome', 'ship') },
  show: ['emporion-218', 'tarraco-218', 'new-carthage-218'],
});

// --- Ibera ---
const f = frame([0.522, 40.768], 90), P = f.p;
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 110, style) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'swords') => ({ lnglat: P(u, w), icon, color, label, note });
const bbox = f.box([[-3000, -5300], [2700, 3900]], 0);
const ebro = { path: [[0.49, 40.93], [0.505, 40.87], [0.52, 40.83], [0.528, 40.8], [0.545, 40.77], [0.56, 40.74], [0.578, 40.71], [0.62, 40.7]], width: 130, id: 'ebro', name: 'The river Ebro' };
const N = 0, S = 180;
const ibera = mark(-84, -4864, 'Ibera', 'Allied to Carthage, besieged by the Scipios', 'carthage', 'castle');

writePlan(`${G}/020-ebro-deployment`, {
  bbox,
  emblem: {
    water: [ebro],
    units: [
      n(unit('rome', 'cavalry', -2050, -650, 600, 220, S), 'roman-cavalry', 'Roman and allied Iberian cavalry'),
      n(unit('rome', 'infantry', -1250, -700, 560, 300, S), 'allies', 'Italian allied infantry'),
      n(unit('rome', 'infantry', -650, -700, 560, 300, S), 'legions', 'Two Roman legions under Gnaeus and Publius Scipio'),
      n(unit('rome', 'infantry', -50, -700, 560, 300, S), 'legions', 'Two Roman legions under Gnaeus and Publius Scipio'),
      n(unit('rome', 'infantry', 550, -700, 560, 300, S), 'allies', 'Italian allied infantry'),
      n(unit('rome', 'cavalry', 1300, -650, 600, 220, S), 'allied-cavalry', 'Italian allied cavalry'),
      n(unit('rome', 'light', -350, -470, 2400, 60, S), 'velites', 'Velites'),
      n(unit('carthage', 'cavalry', -2050, 650, 600, 240, N), 'carthage-cavalry', 'Libyan and Iberian cavalry'),
      n(unit('carthage', 'infantry', -1150, 700, 650, 330, N), 'africans', 'African infantry'),
      n(unit('carthage', 'infantry', -300, 650, 900, 260, N), 'iberians', 'Iberian infantry in the centre'),
      n(unit('carthage', 'infantry', 550, 700, 650, 330, N), 'poeni', 'Punic infantry, the Poeni'),
      n(unit('carthage', 'cavalry', 1300, 650, 600, 240, N), 'numidians', 'Numidian light cavalry'),
      n(unit('carthage', 'elephants', -300, 390, 2100, 140, N, { count: 7 }), 'elephants', 'About 20 elephants before the centre'),
      n(unit('carthage', 'light', -300, 230, 2700, 60, N), 'skirmishers', 'Light infantry'),
    ],
  },
  markers: {
    'ebro-deploy-ibera': ibera,
    'ebro-deploy-scipios': mark(-350, -1850, 'Gnaeus and Publius Scipio', 'Two legions in the centre, allies on the sides', 'rome', 'user'),
    'ebro-deploy-hasdrubal': mark(-300, 1450, 'Hasdrubal Barca', 'Iberians in the centre, about 20 elephants', 'carthage', 'user'),
    'ebro-deploy-numidians': mark(1500, 2350, 'Numidians', 'Right wing', 'carthage'),
  },
});

writePlan(`${G}/030-ebro-centre`, {
  bbox,
  emblem: {
    water: [ebro],
    units: [
      n(unit('rome', 'cavalry', -2050, -230, 600, 220, S), 'roman-cavalry', 'Roman and allied Iberian cavalry'),
      n(unit('rome', 'infantry', -1250, 330, 560, 300, S), 'allies', 'Italian allied infantry'),
      n(unit('rome', 'infantry', -600, 230, 520, 320, S), 'legions', 'The Roman legions, pushing into the gap'),
      n(unit('rome', 'infantry', 0, 230, 520, 320, S), 'legions', 'The Roman legions, pushing into the gap'),
      n(unit('rome', 'infantry', 550, 330, 560, 300, S), 'allies', 'Italian allied infantry'),
      n(unit('rome', 'cavalry', 1300, -230, 600, 220, S), 'allied-cavalry', 'Italian allied cavalry'),
      n(unit('carthage', 'cavalry', -2050, 230, 600, 240, N), 'carthage-cavalry', 'Libyan and Iberian cavalry'),
      n(unit('carthage', 'infantry', -1150, 700, 650, 330, N), 'africans', 'African infantry'),
      n(unit('carthage', 'infantry', 550, 700, 650, 330, N), 'poeni', 'Punic infantry, the Poeni'),
      n(unit('carthage', 'cavalry', 1300, 230, 600, 240, N), 'numidians', 'Numidian light cavalry'),
    ],
    arrows: [
      n(arrow('carthage', [[-450, 700], [-500, 1500], [-650, 2350]], 120, 'dashed'), 'iberian-flight', 'The Iberian centre gives way and flees'),
      n(arrow('carthage', [[-100, 700], [-50, 1500], [100, 2350]], 120, 'dashed'), 'iberian-flight', 'The Iberian centre gives way and flees'),
      n(arrow('rome', [[-300, -150], [-300, 650]], 130), 'legions-advance', 'The legions push into the gap'),
      n(arrow('carthage', [[-830, 620], [-560, 430]], 90), 'flank-attack', 'The Africans and Poeni turn on the Roman flanks'),
      n(arrow('carthage', [[230, 620], [-40, 430]], 90), 'flank-attack', 'The Africans and Poeni turn on the Roman flanks'),
    ],
    clashes: [P(-2050, 0), P(1300, 0), P(-1200, 510), P(550, 510)],
  },
  markers: {
    'ebro-centre-iberians': mark(-350, 2650, 'Iberian infantry', 'Flee almost without fighting', 'carthage', 'skull'),
    'ebro-centre-legions': mark(-300, -850, 'Roman legions', 'Push into the gap', 'rome'),
    'ebro-centre-africans': mark(-1700, 1450, 'Africans', 'Turn on the Roman flank', 'carthage'),
    'ebro-centre-poeni': mark(1000, 1450, 'Poeni', 'Turn on the Roman flank', 'carthage'),
  },
});

writePlan(`${G}/040-ebro-envelopment`, {
  bbox,
  emblem: {
    water: [ebro],
    units: [
      n(unit('rome', 'infantry', -1150, 330, 600, 300, S), 'allies', 'Italian allied infantry'),
      n(unit('rome', 'infantry', 550, 330, 600, 300, S), 'allies', 'Italian allied infantry'),
      n(unit('rome', 'infantry', -1150, 1150, 600, 260, N), 'legions', 'The legions, turned back from the pursuit'),
      n(unit('rome', 'infantry', 550, 1150, 600, 260, N), 'legions', 'The legions, turned back from the pursuit'),
      n(unit('carthage', 'infantry', -1150, 740, 600, 320, N), 'africans-poeni', 'Africans and Poeni, caught between two Roman lines'),
      n(unit('carthage', 'infantry', 550, 740, 600, 320, N), 'africans-poeni', 'Africans and Poeni, caught between two Roman lines'),
      n(unit('carthage', 'camp', -300, 3300, 700, 700, 0), 'camp', 'Carthaginian camp with its treasury'),
    ],
    arrows: [
      n(arrow('rome', [[-600, 450], [-700, 900], [-1000, 1100]], 110), 'legions-wheel', 'The legions wheel onto the Africans and Poeni'),
      n(arrow('rome', [[0, 450], [100, 900], [400, 1100]], 110), 'legions-wheel', 'The legions wheel onto the Africans and Poeni'),
      n(arrow('carthage', [[-2050, 300], [-2250, 1300], [-2450, 2400]], 130, 'dashed'), 'cavalry-flight', 'Hasdrubal’s cavalry and elephants leave the field'),
      n(arrow('carthage', [[1300, 300], [1400, 1300], [1550, 2400]], 130, 'dashed'), 'cavalry-flight', 'Hasdrubal’s cavalry and elephants leave the field'),
      n(arrow('rome', [[-300, 1450], [-300, 2900]], 110), 'camp-attack', 'The Romans take the Carthaginian camp'),
    ],
    clashes: [P(-1150, 520), P(-1150, 960), P(550, 520), P(550, 960)],
  },
  markers: {
    'ebro-env-hasdrubal': mark(-2550, 2750, 'Hasdrubal Barca', 'Escapes with cavalry and elephants', 'carthage', 'user'),
    'ebro-env-camp': mark(450, 3350, 'Carthaginian camp', 'Taken with its treasury', 'rome', 'flag'),
    'ebro-env-libyans': mark(-1150, -700, 'Africans and Poeni', 'Enveloped and cut down', 'carthage', 'skull'),
  },
});

// --- 211 BC: the two Scipios killed ---
writePlan(`${G}/050-ebro-upper-baetis`, {
  routes: {
    'gnaeus-211': { name: 'Gnaeus Scipio withdraws and is caught near Ilorca, 211 BC', path: [[-3.3, 37.95], [-2.6, 37.84], [-2.05, 37.74], [-1.72, 37.68]] },
    'survivors-211': { name: 'The survivors fall back north of the Ebro', style: 'dashed', path: [[-1.6, 37.8], [-1.2, 38.6], [-0.6, 39.4], [0.15, 40.3], [0.6, 40.78]] },
  },
  show: ['saguntum-212', 'castulo-211', 'ilorca-211'],
});

console.log('ebro: field', JSON.stringify(P(-300, 0)), 'bbox', JSON.stringify(bbox));
