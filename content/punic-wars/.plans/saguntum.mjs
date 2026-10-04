// Saguntum, 219 BC. The Iberian town on the long castle ridge of Sagunto, the Palancia to the north. Livy's
// account: attacks from three sides, the main one against a corner of the wall facing level ground (put at the
// west end here), Hannibal wounded, then the breach, the inner wall, and the storm after eight months.
// Frame: origin on the ridge, u east, w south.
import { frame, writePlan } from './lib.mjs';

const f = frame([-0.2745, 39.6785], 90), P = f.p;
const G = 'pages/030-interwar/050-saguntum';
const bbox = f.box([[-2200, -1500], [2300, 2400]], 0);
const EAST = f.face(0), WEST = f.face(180), NORTH = f.face(270);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 110, style) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}) });
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, note });
// the town wall: an ellipse round the ridge, with a gap at the west end once the towers have fallen
const ring = (from, to, n = 36) => [...Array(n + 1)].map((_, i) => { const t = (from + (to - from) * i / n) * Math.PI / 180; return [650 * Math.cos(t), 230 * Math.sin(t)]; });
const river = { path: f.path([[-3000, -1650], [-1500, -1250], [0, -1080], [1500, -920], [3000, -720], [4600, -600]]), width: 60, id: 'palancia', name: 'The river Palancia' };
const lines = { side: 'carthage', path: f.path([[-1300, -750], [-1500, 0], [-1200, 720], [0, 900], [1200, 720], [1500, 0], [1300, -750]]), width: 50, id: 'siege-lines', name: 'Carthaginian siege lines' };
const camp = n(unit('carthage', 'camp', -1250, 1750, 700, 600, 0), 'camp', 'Carthaginian camp on the plain');

// --- overview: the march from New Carthage ---
writePlan(`${G}/010-saguntum`, {
  routes: { 'hannibal-219': { name: 'Hannibal marches from New Carthage to Saguntum, spring 219 BC', path: [[-0.98, 37.6], [-0.7, 37.95], [-0.5, 38.35], [-0.35, 38.8], [-0.38, 39.2], [-0.3, 39.55], P(-1200, 1400)] } },
  show: ['new-carthage-219', 'ebro-219'],
});

// --- the first assaults ---
writePlan(`${G}/020-saguntum-assault`, {
  bbox,
  emblem: {
    water: [river],
    works: [{ side: 'neutral', path: f.path(ring(0, 360)), width: 45, id: 'walls', name: 'The walls of Saguntum' }, lines],
    units: [
      n(unit('neutral', 'infantry', 0, 0, 800, 150, f.face(90)), 'saguntines', 'The Saguntines defending their walls'), camp,
      n(unit('carthage', 'infantry', -1150, 0, 500, 220, EAST), 'west-assault', 'Hannibal’s main assault on the western corner'),
      n(unit('carthage', 'infantry', 0, 1050, 600, 200, NORTH), 'south-assault', 'Carthaginian attack from the south'),
      n(unit('carthage', 'infantry', 1150, 0, 500, 220, WEST), 'east-assault', 'Carthaginian attack from the east'),
    ],
    arrows: [n(arrow('carthage', [[-1030, 0], [-640, 0]], 150), 'west-attack', 'Rams and siege works against the western corner'),
      n(arrow('carthage', [[0, 940], [0, 250]], 110), 'south-attack', 'Attack on the southern wall'),
      n(arrow('carthage', [[1030, 0], [640, 0]], 110), 'east-attack', 'Attack on the eastern wall')],
    clashes: [P(-660, 0)],
  },
  markers: {
    'saguntum-assault-hannibal': mark(-1300, 480, 'Hannibal', 'Wounded in the thigh', 'carthage'),
    'saguntum-assault-town': mark(300, -650, 'Saguntum', 'The town on its ridge', null, 'landmark'),
    'saguntum-assault-camp': mark(-1250, 2200, 'Carthaginian camp', 'On the plain below', 'carthage', 'flag'),
  },
});

// --- the breach, the inner wall and the fall ---
writePlan(`${G}/030-saguntum-fall`, {
  bbox,
  emblem: {
    water: [river],
    works: [{ side: 'neutral', path: f.path(ring(-155, 155)), width: 45, id: 'walls', name: 'The walls of Saguntum, breached at the west' },
      { side: 'neutral', path: f.path([[-430, -200], [-370, 0], [-430, 200]]), width: 40, id: 'inner-wall', name: 'The inner wall built behind the breach' }, lines],
    units: [
      n(unit('neutral', 'infantry', 120, 0, 650, 150, f.face(90)), 'saguntines', 'The Saguntines behind the inner wall'), camp,
      n(unit('carthage', 'infantry', -560, 0, 280, 150, EAST), 'breach', 'Carthaginians in the breach'),
      n(unit('carthage', 'infantry', -1150, 0, 500, 220, EAST), 'west-assault', 'Carthaginian assault force at the western corner'),
      n(unit('carthage', 'infantry', 0, 1050, 600, 200, NORTH), 'south-assault', 'Troops under Maharbal on the south side'),
    ],
    arrows: [n(arrow('carthage', [[-1030, 0], [-700, 0]], 150), 'breach-attack', 'Through the breach towards the inner wall'),
      n(arrow('carthage', [[0, 940], [0, 250]], 110), 'south-attack', 'Attack on the southern wall')],
    clashes: [P(-400, 0), P(0, 230)],
  },
  markers: {
    'saguntum-fall-maharbal': mark(0, 1450, 'Maharbal', 'Presses the siege', 'carthage'),
    'saguntum-fall-tower': mark(-1050, -650, 'Siege tower', 'Higher than the walls', 'carthage', 'castle'),
    'saguntum-fall-sappers': mark(-500, 650, 'Libyan sappers', 'Undermine the wall', 'carthage', 'pickaxe'),
    'saguntum-fall-fire': mark(500, -700, 'Fire of the leading citizens', 'Their gold and silver, then themselves, by Livy', null, 'flame'),
  },
});

console.log('saguntum: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 0)));
