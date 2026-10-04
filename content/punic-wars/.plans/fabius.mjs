// Ager Falernus, 217 BC. Fabius closes the exits of the Falernian plain; Hannibal escapes through the Callicula
// pass at night behind 2,000 oxen with burning wood on their horns. The pass is placed at the article's
// coordinate; its real site is debated.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/040-second-war/010-invasion/040-fabius';
const at = (side, type, lnglat, width, depth, facing = 0, extra = {}) => ({ side, type, at: lnglat, width, depth, facing, ...extra });
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const ll = (lnglat, label, note, color, icon = 'swords') => ({ lnglat, icon, color, label, note });

// --- overview: from Apulia into the Falernian plain, Fabius along the hills ---
writePlan(`${G}/010-fabius`, {
  routes: {
    'hannibal-falernus-217': { name: 'Hannibal marches from Arpi into the Ager Falernus, summer 217 BC',
      path: [[15.55, 41.55], [15.2, 41.35], [14.78, 41.13], [14.53, 41.23], [14.33, 41.33], [14.14, 41.21], [14.06, 41.13]] },
    'fabius-shadow-217': { name: 'Fabius follows along the high ground', offset: 6,
      path: [[15.33, 41.37], [15.05, 41.3], [14.75, 41.22], [14.45, 41.32], [14.2, 41.3], [13.99, 41.22]] },
  },
  markers: { 'aecae-217': ll([15.33, 41.37], 'Aecae', 'Fabius camps six miles from Hannibal', 'rome', 'flag') },
});

// --- the plain closed: garrisons, Minucius, the main army, the detachment at the pass ---
const volturnus = { path: [[14.47, 41.21], [14.4, 41.18], [14.33, 41.15], [14.27, 41.13], [14.213, 41.106], [14.15, 41.08], [14.06, 41.05], [13.98, 41.04], [13.94, 41.03]], width: 260, id: 'volturnus', name: 'The river Volturnus' };
writePlan(`${G}/020-fabius-trap`, {
  emblem: {
    water: [volturnus],
    units: [
      n(at('rome', 'camp', [13.985, 41.218], 2600, 2600), 'fabius-camp', 'Fabius’s main army near Mount Massicus'),
      n(at('rome', 'camp', [14.075, 41.262], 1900, 1900), 'minucius-camp', 'Minucius’s camp, watching the roads north'),
      n(at('rome', 'camp', [14.14, 41.21], 1200, 1200), 'garrisons', 'Roman garrisons closing the exits of the plain'),
      n(at('rome', 'camp', [14.213, 41.112], 1200, 1200), 'garrisons', 'Roman garrisons closing the exits of the plain'),
      n(at('rome', 'infantry', [14.545, 41.19], 2200, 700, 270), 'pass-detachment', '4,000 Romans holding the Callicula pass'),
      n(at('carthage', 'camp', [14.08, 41.13], 2600, 2600), 'camp', 'Hannibal’s camp in the plain'),
      n(at('carthage', 'light', [14.0, 41.085], 5000, 450, 200), 'foragers', 'Foraging parties plundering the plain'),
      n(at('carthage', 'light', [14.175, 41.165], 4200, 450, 30), 'foragers', 'Foraging parties plundering the plain'),
      n(at('carthage', 'cavalry', [14.035, 41.16], 2600, 700, 330), 'carthalo', 'Carthaginian cavalry under Carthalo'),
    ],
    arrows: [{ side: 'carthage', path: [[14.64, 41.18], [14.53, 41.225], [14.33, 41.31], [14.2, 41.245], [14.1, 41.155]], width: 700, id: 'entry', name: 'Hannibal enters the Falernian plain through the Callicula pass' }],
    clashes: [{ at: [14.01, 41.182], size: 900 }],
  },
  markers: {
    'fabius-trap-fabius': ll([13.92, 41.248], 'Fabius', 'Main army near Mount Massicus', 'rome', 'user'),
    'fabius-trap-minucius': ll([14.075, 41.325], 'Minucius', 'Watches the Via Latina and Via Appia', 'rome', 'user'),
    'fabius-trap-pass': ll([14.6, 41.245], 'Roman detachment', '4,000 hold the Callicula pass', 'rome'),
    'fabius-trap-hannibal': ll([13.985, 41.128], 'Hannibal', 'Plunders the plain all summer', 'carthage', 'user'),
    'fabius-trap-mancinus': ll([13.93, 41.175], 'Mancinus', '400 horsemen destroyed by Carthalo', 'rome', 'skull'),
  },
  show: ['casilinum-217'],
});

// --- the night at the pass: frame on the pass, u east along the road out, w south ---
const f = frame([14.55, 41.183], 90), P = f.p;
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 120, style) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'swords') => ({ lnglat: P(u, w), icon, color, label, note });
writePlan(`${G}/030-fabius-oxen`, {
  bbox: f.box([[-4600, -2500], [3300, 1900]], 0),
  emblem: {
    units: [
      n(unit('rome', 'camp', -2300, -1000, 900, 900, 0), 'fabius-camp', 'Fabius’s camp above the pass'),
      n(unit('rome', 'infantry', -2300, -280, 1400, 220, 180), 'fabius-army', 'Fabius’s army, standing at arms in the dark'),
      n(unit('carthage', 'camp', -3800, 1100, 800, 800, 0), 'camp', 'Hannibal’s camp'),
      n(unit('carthage', 'light', -1150, -760, 900, 130, 300), 'oxen', '2,000 oxen with burning wood tied to their horns'),
      n(unit('carthage', 'light', -1550, -480, 700, 130, 300), 'oxen', '2,000 oxen with burning wood tied to their horns'),
      n(unit('carthage', 'infantry', 1650, 0, 230, 2300, 90), 'army', 'Hannibal’s army, through the pass'),
      n(unit('carthage', 'infantry', -720, -300, 500, 160, 320), 'escort', 'Light infantry driving the oxen'),
    ],
    arrows: [
      n(arrow('carthage', [[-3450, 800], [-2450, 300], [-1700, -230]], 130), 'oxen-drive', 'The oxen are driven up the ridge'),
      n(arrow('rome', [[150, -180], [-450, -470], [-1000, -700]], 130), 'detachment', 'The Roman detachment leaves the pass to chase the lights'),
      n(arrow('carthage', [[-3300, 1350], [-1800, 720], [-250, 180], [2950, 0]], 210), 'army-march', 'The army marches through the unguarded pass'),
      n(arrow('carthage', [[-330, 120], [-830, -470]], 100), 'escort-attack', 'The light infantry attacks the Roman detachment'),
    ],
    clashes: [{ at: P(-1150, -700), size: 200 }],
  },
  markers: {
    'fabius-oxen-fabius': mark(-3400, -1350, 'Fabius', 'Stands at arms in camp', 'rome', 'user'),
    'fabius-oxen-cattle': mark(-1000, -2050, '2,000 oxen', 'Burning wood on their horns', 'carthage', 'flame'),
    'fabius-oxen-detachment': mark(800, -1250, 'Roman detachment', 'Leaves the pass for the lights', 'rome'),
    'fabius-oxen-hannibal': mark(1650, 520, 'Hannibal', 'The army slips through the pass', 'carthage', 'user'),
  },
});

// --- after the escape: to Geronium for the winter, Fabius to Larinum ---
writePlan(`${G}/040-fabius-geronium`, {
  routes: {
    'hannibal-geronium-217': { name: 'Hannibal marches to Geronium, autumn 217 BC',
      path: [[14.55, 41.19], [14.33, 41.31], [14.06, 41.48], [13.95, 41.7], [13.93, 42.02], [14.25, 41.98], [14.55, 41.85], [14.733, 41.762]] },
    'fabius-larinum-217': { name: 'Fabius follows and camps at Larinum', offset: 6,
      path: [[14.45, 41.26], [14.25, 41.4], [14.05, 41.55], [14.0, 41.75], [14.0, 41.98], [14.35, 41.92], [14.65, 41.82], [14.92, 41.8]] },
  },
  markers: { 'larinum-217': ll([14.92, 41.8], 'Larinum', 'Fabius’s camp', 'rome', 'flag') },
  show: ['geronium-217'],
});

console.log('fabius: pass', JSON.stringify(P(0, 0)));
