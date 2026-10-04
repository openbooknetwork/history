// Messana, 264 BC. Appius Claudius crosses the strait, beats Hiero's Syracusans outside the city, then the
// Carthaginians to the north. Camp sites follow Polybius loosely: the Carthaginian army north of the city with
// its fleet at Cape Pelorus, Hiero on a hill outside the city, here to the south-west on the road to Syracuse.
// Frame: origin in Messana, u north, w east.
import { frame, writePlan } from './lib.mjs';

const f = frame([15.555, 38.193], 0), P = f.p;
const G = 'pages/020-first-war/010-messana';
const bbox = f.box([[-5200, -4700], [5000, 7600]], 0);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 130, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
// the landward side of the city, open towards the harbour
const walls = { side: 'neutral', path: f.path([[1300, 650], [1250, -650], [300, -1200], [-900, -1050], [-1550, -350], [-1550, 300]]), width: 70, ...nm('walls', 'The walls of Messana') };
const camp = unit('carthage', 'camp', 3700, -300, 600, 600, 0, nm('carthaginian-camp', 'Carthaginian camp north of the city'));

// --- overview: Hiero's march on Messana and the Roman crossing ---
writePlan(`${G}/010-messana`, {
  routes: {
    'hiero-264': { name: 'Hiero’s army marches on Messana, 264 BC', path: [[15.29, 37.07], [15.2, 37.45], [15.3, 37.82], [15.44, 38.05], [15.53, 38.165]] },
    'claudius-264': { name: 'Appius Claudius crosses the strait with two legions, 264 BC', path: [[15.65, 38.115], [15.62, 38.16], [15.567, 38.197]] },
  },
  markers: { 'messana-fleet-264': { lnglat: [15.66, 38.275], icon: 'ship', color: 'carthage', label: 'Carthaginian fleet', note: 'At Cape Pelorus' } },
  show: ['syracuse-264', 'rhegium-264'],
});

// --- the crossing, and the defeat of the Syracusans ---
const toHiero = 225, d = 290, r = [-1900, -1700], s = [r[0] - d * 0.707, r[1] - d * 0.707];
writePlan(`${G}/020-messana-hiero`, {
  bbox,
  emblem: {
    works: [walls],
    units: [
      unit('rome', 'infantry', r[0], r[1], 1000, 200, toHiero, nm('roman-legions', 'Two Roman legions under Appius Claudius')),
      unit('syracuse', 'infantry', s[0], s[1], 1100, 220, 45, nm('syracusan-infantry', 'Syracusan infantry under Hiero II')),
      unit('syracuse', 'cavalry', s[0] - 300, s[1] + 500, 300, 150, 45, nm('syracusan-cavalry', 'Syracusan cavalry')),
      unit('syracuse', 'camp', -3500, -3300, 500, 500, 0, nm('hiero-camp', 'Hiero’s camp on a hill outside the city')),
      unit('carthage', 'infantry', 3000, -300, 1000, 220, 180, nm('carthaginian-army', 'Carthaginian army under Hanno, camped north of the city')), camp,
    ],
    arrows: [
      arrow('rome', [[-1800, 6900], [-600, 3800], [300, 1500]], 150, undefined, nm('crossing', 'Appius Claudius crosses the strait by night')),
      arrow('rome', [[-600, -900], [-1300, -1300], [-1700, -1500]], 110, undefined, nm('roman-attack', 'The Romans march out against the Syracusans')),
      arrow('syracuse', [[-3700, -3000], [-5300, -3300], [-7200, -3200]], 120, 'dashed', nm('syracusan-retreat', 'Hiero withdraws to Syracuse')),
    ],
    clashes: [P(r[0] - 100 * 0.707 - 40, r[1] - 100 * 0.707 - 40)],
  },
  markers: {
    'messana-hiero-claudius': mark(-2500, -350, 'Appius Claudius', 'Two legions, crossed by night', 'rome'),
    'messana-hiero-hiero': mark(-3600, -4300, 'Hiero II', 'Withdraws to Syracuse', 'syracuse', 'crown'),
    'messana-hiero-carthaginians': mark(3500, -1500, 'Carthaginian army', 'Camped north of the city', 'carthage', 'flag'),
    'messana-hiero-city': mark(500, -500, 'Messana', 'Held by the Mamertines', undefined, 'landmark'),
  },
});

// --- the next fight: the Carthaginians north of the city ---
const rf = 2100, cu = rf + 70 + 110;
writePlan(`${G}/030-messana-hanno`, {
  bbox,
  emblem: {
    works: [walls],
    units: [
      unit('rome', 'infantry', 2000, -800, 1000, 200, 0, nm('roman-legions', 'Roman legions under Appius Claudius')),
      unit('rome', 'cavalry', 2000, -1500, 300, 150, 0, nm('roman-cavalry', 'Roman cavalry')), unit('rome', 'cavalry', 2000, -120, 260, 150, 0, nm('roman-cavalry', 'Roman cavalry')),
      unit('carthage', 'infantry', cu, -800, 1100, 220, 180, nm('carthaginian-infantry', 'Carthaginian infantry and mercenaries under Hanno')),
      unit('carthage', 'cavalry', cu, -1550, 320, 160, 180, nm('carthaginian-cavalry', 'Carthaginian cavalry')), unit('carthage', 'cavalry', cu, -40, 300, 160, 180, nm('carthaginian-cavalry', 'Carthaginian cavalry')),
      camp,
    ],
    arrows: [
      arrow('carthage', [[2650, -900], [3700, -2100], [4500, -3700]], 140, 'dashed', nm('carthaginian-retreat', 'The Carthaginians fall back to nearby towns')),
      arrow('carthage', [[2600, -1700], [3100, -2800], [3300, -4200]], 110, 'dashed', nm('carthaginian-retreat', 'The Carthaginians fall back to nearby towns')),
    ],
    clashes: [P(2170, -800), P(2170, -1520), P(2170, -80)],
  },
  markers: {
    'messana-hanno-claudius': mark(1250, -2200, 'Appius Claudius', 'Attacks the next day', 'rome'),
    'messana-hanno-carthaginians': mark(4300, -1900, 'Carthaginian army', 'Retreats to nearby towns', 'carthage', 'flag'),
    'messana-hanno-city': mark(500, -500, 'Messana', 'Held by the Romans', undefined, 'landmark'),
  },
});

console.log('messana: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(2170, -800)));
