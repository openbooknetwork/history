// The Hydaspes, May 326 BC (.plan/battles/hydaspes.md), in Arrian's sequence (5.12–18) with Bosworth's Commentary
// where Arrian is silent. The site is disputed (070.9): by the cloud ruling the battle stands on Stein's ground, the
// crossing at Jalalpur, 150 stades upstream of the base camp at Haranpur. Every place here is a reconstruction on
// that ground; the order of the units and the moves are Arrian's.
// Frame: the plan's frame turned from 155 to 165, because the drawn river (Natural Earth's modern Jhelum, rivers.json)
// runs at about 255° below Jalalpur; u stays square to it. u runs from the river (Indian left, Macedonian right,
// u < 0) inland; w runs downstream, from the Macedonians towards the Indians. Origin: the centre of the sandy field,
// 2.5 km in from the left bank and about 5.5 km downstream of the landing, the point of the `hydaspes-326` card.
// The river is drawn 1.55 km wide; the islands' sizes and places, the widths of the units and the Indian front of
// about 1,000 m (Bosworth's reading against Arrian's 200 elephants) are picked for legibility and appear in no text.
// Each phase has its own frame, tight on its fighting, so the units read on a phone.
import { frame, writePlan } from './lib.mjs';

const f = frame([73.353, 32.6032], 165), P = f.p, MAC = f.face(90), IND = f.face(270), INLAND = f.face(0), RIVERWARD = f.face(180);
const G = 'pages/070-india/040-hydaspes';
// Each frame boxes the drawn points of its phase (not the corners of a local rectangle), padded by `pad` metres.
const pointBox = (pts, pad) => { const ll = pts.map(([a, b]) => P(a, b)), dx = pad / (111320 * Math.cos(32.6 * Math.PI / 180)), dy = pad / 110540, r = x => Math.round(x * 1e5) / 1e5;
  return [Math.min(...ll.map(q => q[0])) - dx, Math.min(...ll.map(q => q[1])) - dy, Math.max(...ll.map(q => q[0])) + dx, Math.max(...ll.map(q => q[1])) + dy].map(r); };
const bboxCrossing = pointBox([[-4450, -5750], [-4250, -5850], [-3325, -6400], [-2250, -6350], [-4500, -4300], [-1550, -1250], [-800, -1450], [-1150, -2950], [-2150, -1750], [-1300, -2000]], 250);
const bboxCavalry = pointBox([[-1800, 0], [-1800, 750], [1900, 250], [1500, 1300], [-200, 1340], [-850, 1400], [-80, -900], [-700, -600], [660, -600], [1500, 450], [1250, -150], [1000, -450]], 250);
const bboxElephants = pointBox([[-2150, 1700], [-2150, 2200], [-2450, 1500], [-700, 2850], [600, 2750], [800, 2300], [1650, 1700], [1300, 1300], [-80, -450], [-1150, 470], [850, 900]], 250);

const unit = (side, type, u, w, width, depth, id, name, extra = {}) =>
  ({ side, type, at: P(u, w), width, depth, facing: side === 'porus' ? IND : MAC, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const clash = (u, w, size) => (size ? { at: P(u, w), size } : P(u, w));
const towards = ([u0, w0], [u1, w1]) => f.face(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI);

// --- the river: its centre on the modern course (u -3,225 down to below the field, then bending north), 1.55 km
// wide, with the two islands of the crossing left as land. Two areas meet on a cut across both islands.
const centre = [[-3225, -9500], [-3225, -4000], [-3230, 0], [-3300, 1300], [-3600, 2600], [-4100, 3900], [-4700, 5300]];
const HALF = 775;
const cAt = w => { for (let i = 1; i < centre.length; i++) { const [u0, w0] = centre[i - 1], [u1, w1] = centre[i];
  if (w <= w1) return u0 + (u1 - u0) * (w - w0) / (w1 - w0); } return centre.at(-1)[0]; };
const isl1 = { u: -3325, w: -5650, a: 750, b: 175 }, isl2 = { u: -2750, w: -5500, a: 500, b: 150 };
const CUT = -5600;
// the arc of an island's outline on one side of the cut, from its river side to its inland side
const arc = (is, upstream) => { const s = (CUT - is.w) / is.a, t0 = Math.asin(s), pts = [];
  const from = Math.PI - t0, to = upstream ? 2 * Math.PI + t0 : t0;
  for (let k = 0; k <= 12; k++) { const t = from + (to - from) * k / 12; pts.push([is.u + is.b * Math.cos(t), is.w + is.a * Math.sin(t)]); }
  return pts; };
const bankLine = (side, w0, w1) => { const out = []; for (let w = w0; w1 > w0 ? w <= w1 : w >= w1; w += w1 > w0 ? 500 : -500) out.push([cAt(w) + side * HALF, w]); return out; };
const up = [...bankLine(-1, -9500, CUT), [cAt(CUT) - HALF, CUT], ...arc(isl1, true), ...arc(isl2, true), [cAt(CUT) + HALF, CUT], ...bankLine(1, CUT + 100, -9500).filter(p => p[1] < CUT)];
const down = [[cAt(CUT) - HALF, CUT], ...arc(isl1, false), ...arc(isl2, false), [cAt(CUT) + HALF, CUT], ...bankLine(1, -5500, 5500), ...bankLine(-1, 5500, -5500)];
const riverName = 'The Hydaspes, drawn on its modern course at Stein’s crossing; the islands are drawn where none can be found today';
const water = [
  { area: f.path(up), id: 'hydaspes', name: riverName },
  { area: f.path(down), id: 'hydaspes', name: riverName },
];

const N = {
  horseArchers: 'Saka horse archers, 1,000 (Arrian)',
  cavalryAll: 'Macedonian cavalry under Alexander, 5,000 (Arrian)',
  companions: 'Companion cavalry under Alexander: the royal squadron and the regiments of Hephaestion and Perdiccas',
  archers: 'Archers under Tauron, hurrying after the cavalry',
  light: 'Archers, Agrianians and javelin men under Tauron, on both ends of the foot',
  footColumn: 'Macedonian foot, not much under 6,000 (Arrian), following slowly',
  hypaspists: 'Hypaspists, the royal hypaspists under Seleucus at their head',
  phalanx: 'Phalanx battalions, Coenus’s among them, led by Antigenes',
  coenus: 'Coenus with his own cavalry regiment and that of Demetrius, son of Althaemenes',
  ring: 'Alexander’s cavalry, now one body, round the Indian line',
  mercenaries: 'Greek mercenary horse and foot under Meleager, Attalus, son of Andromenes, and Gorgias, strung along the bank',
  craterus: 'Craterus’s force from the base camp: his cavalry, the Arachosian and Parapamisadan horse, two phalanx battalions and Taxiles’s 5,000 Indians',
  chariots: 'Indian chariots in front of the cavalry',
  indianCavalry: 'Indian cavalry',
  infantry: 'Indian infantry: the centre behind the elephants, and bodies beyond them on the wings',
  elephants: 'Porus’s elephants, in one line in front of the infantry',
  cooped: 'Indian foot and the last horsemen, hemmed in round the elephants',
};

// --- phase 1: the crossing in the storm (end blocks: the army across, Porus's son routed) ---
writePlan(`${G}/020-hydaspes-crossing`, {
  bbox: bboxCrossing,
  emblem: {
    kind: 'battle-plan',
    water,
    units: [
      unit('macedon', 'cavalry', -1800, -2350, 500, 120, 'horse-archers', N.horseArchers),
      unit('macedon', 'cavalry', -1900, -2850, 700, 300, 'cavalry', N.cavalryAll),
      unit('macedon', 'archers', -1950, -3600, 300, 120, 'light', N.archers),
      unit('macedon', 'pikes', -2150, -4850, 300, 500, 'foot', N.footColumn),
      unit('macedon', 'infantry', -4500, -3700, 500, 150, 'mercenaries', N.mercenaries, { facing: INLAND }),
    ],
    arrows: [
      arrow('macedon', [[-4250, -5800], [-3900, -4900], [-3500, -4700], [-2850, -5350]], 150, 'crossing', 'The army crosses on boats and stuffed hides, round the first island, and lands on the second'),
      arrow('macedon', [[-2700, -5450], [-2400, -5300], [-1750, -4600], [-1800, -3600], [-1900, -3000]], 140, 'ford', 'The cavalry fords the last channel and rides ahead of the foot'),
      arrow('macedon', [[-2700, -5750], [-2450, -5650], [-2200, -5150]], 120, 'foot-follows', 'The foot fords after it and follows slowly'),
      arrow('porus', [[-1550, -1250], [-1720, -1600], [-1780, -1950]], 140, 'son-advance', 'Porus’s son comes up with horse and chariots'),
      arrow('porus', [[-1500, -1950], [-1150, -1750], [-800, -1450]], 120, 'son-rout', 'His horse is routed and flees back to Porus', 'dashed'),
    ],
    clashes: [clash(-1800, -2080, 250)],
  },
  markers: {
    'hydaspes-crossing-alexander': mark(-1150, -2950, 'Alexander', 'First ashore; leads the cavalry', 'macedon'),
    'hydaspes-crossing-son': mark(-2150, -1750, 'Porus’s son', 'Killed, with 400 horse (Arrian)', 'porus', 'skull'),
    'hydaspes-crossing-chariots': mark(-1300, -2000, 'Chariots', 'Taken, stuck in the clay', 'porus', 'skull'),
    'hydaspes-crossing-headland': mark(-4450, -5750, 'Wooded headland', 'Fleet hidden; Stein’s Jalalpur', 'macedon', 'flag'),
    'hydaspes-crossing-scouts': mark(-2250, -6350, 'Porus’s scouts', 'Ride off to warn Porus', 'porus', 'swords'),
    'hydaspes-crossing-mercenaries': mark(-4500, -4250, 'Meleager, Attalus and Gorgias', 'Cross once battle is joined', 'macedon'),
  },
});

// --- Porus's line on the sand, as drawn up at the opening of phase 2 (front of the elephants at w 285) ---
const chariots = s => unit('porus', 'chariots', s * 1250, 230, 500, 80, 'chariots', N.chariots);
const wingInfantry = s => unit('porus', 'infantry', s * 700, 450, 300, 250, 'indian-infantry', N.infantry);
const centreInfantry = unit('porus', 'infantry', 0, 500, 1000, 250, 'indian-infantry', N.infantry);

// --- phase 2: the cavalry on the Indian left (end blocks: the Indian horse thrown back on its own line) ---
writePlan(`${G}/030-hydaspes-cavalry`, {
  bbox: bboxCavalry,
  emblem: {
    kind: 'battle-plan',
    water,
    units: [
      chariots(-1), chariots(1),
      unit('porus', 'cavalry', -850, 760, 450, 250, 'indian-cavalry', `${N.indianCavalry}, driven back onto the elephants`),
      wingInfantry(-1), centreInfantry, wingInfantry(1),
      unit('porus', 'elephants', 0, 300, 1000, 60, 'elephants', N.elephants, { count: 16 }),
      unit('macedon', 'cavalry', -1300, -100, 500, 120, 'horse-archers', N.horseArchers),
      unit('macedon', 'cavalry', -1280, 720, 400, 300, 'companions', N.companions, { facing: INLAND }),
      unit('macedon', 'light', -600, -500, 200, 150, 'light', N.light),
      unit('macedon', 'pikes', -310, -500, 230, 200, 'hypaspists', N.hypaspists),
      unit('macedon', 'pikes', 150, -500, 470, 200, 'phalanx', N.phalanx),
      unit('macedon', 'light', 560, -500, 200, 150, 'light', N.light),
      unit('macedon', 'cavalry', -850, 1080, 400, 200, 'coenus', N.coenus, { facing: IND }),
    ],
    arrows: [
      arrow('macedon', [[-1300, -60], [-1250, 170]], 220, 'volleys', 'The horse archers shoot into the Indian left', 'fire'),
      arrow('macedon', [[-200, -250], [-1000, -380], [-1750, 0], [-1750, 500], [-1450, 720]], 150, 'companions-charge', 'Alexander leads the Companions across the front and onto the flank of the Indian left'),
      arrow('porus', [[1250, 560], [600, 960], [-300, 990], [-660, 860]], 130, 'indian-cavalry-shift', 'The Indian cavalry of the right rides behind the line to meet Alexander'),
      arrow('macedon', [[1000, -450], [1900, 250], [1450, 1300], [-200, 1340], [-780, 1190]], 130, 'coenus-ride', 'Coenus rides round in a wider arc and falls on their rear'),
      arrow('porus', [[-1250, 450], [-950, 700]], 110, 'indian-cavalry-back', 'Caught both ways, the Indian horse falls back on the elephants', 'dashed'),
    ],
    clashes: [clash(-1250, 160, 200), clash(-1100, 760, 250), clash(-850, 930, 220)],
  },
  markers: {
    'hydaspes-cavalry-porus': mark(-400, 130, 'Porus', 'On the largest elephant', 'porus'),
    'hydaspes-cavalry-alexander': mark(-1850, 800, 'Alexander', 'Charges the Indian left', 'macedon'),
    'hydaspes-cavalry-coenus': mark(-850, 1450, 'Coenus', 'Rides round behind the Indians', 'macedon'),
    'hydaspes-cavalry-chariots': mark(1250, -150, 'Chariots', 'Put out of action (Diodorus)', 'porus', 'skull'),
    'hydaspes-cavalry-foot': mark(-80, -950, 'Seleucus, Antigenes, Tauron', 'Wait for the Indian line to break', 'macedon'),
  },
});

// --- phase 3: the elephants (end blocks: the Indians ringed and broken, the pursuit taken up) ---
writePlan(`${G}/040-hydaspes-elephants`, {
  bbox: bboxElephants,
  emblem: {
    kind: 'battle-plan',
    water,
    units: [
      unit('porus', 'elephants', 0, 520, 800, 60, 'elephants', `${N.elephants}, backing into their own ranks`, { count: 10 }),
      unit('porus', 'infantry', 0, 800, 900, 300, 'cooped', N.cooped),
      unit('macedon', 'light', -640, 380, 200, 150, 'light', N.light),
      unit('macedon', 'pikes', -310, 330, 230, 200, 'hypaspists', `${N.hypaspists}, with locked shields`),
      unit('macedon', 'pikes', 150, 330, 470, 200, 'phalanx', `${N.phalanx}, with locked shields`),
      unit('macedon', 'light', 590, 380, 200, 150, 'light', N.light),
      unit('macedon', 'cavalry', -750, 750, 400, 200, 'ring', N.ring, { facing: INLAND }),
      unit('macedon', 'cavalry', 0, 1300, 900, 200, 'ring', N.ring, { facing: IND }),
      unit('macedon', 'cavalry', 750, 750, 400, 200, 'ring', N.ring, { facing: RIVERWARD }),
      unit('macedon', 'cavalry', 300, 2350, 400, 200, 'craterus', N.craterus, { facing: towards([300, 2350], [800, 2350]) }),
      unit('macedon', 'infantry', -2150, 1700, 500, 150, 'mercenaries', `${N.mercenaries}, across the river`, { facing: INLAND }),
    ],
    arrows: [
      arrow('macedon', [[-80, -450], [-80, 0], [-80, 270]], 160, 'phalanx-advance', 'The phalanx advances on the elephants'),
      arrow('macedon', [[-1200, 750], [-700, 1450], [450, 1480], [900, 950]], 130, 'cavalry-ring', 'The cavalry, now one body, closes round the Indian line'),
      arrow('porus', [[450, 1000], [600, 1300], [850, 1850], [820, 2250]], 130, 'flight', 'The Indians break out through gaps in the cavalry and flee', 'dashed'),
      arrow('macedon', [[-700, 2850], [-200, 2550], [170, 2370]], 130, 'craterus-crossing', 'Craterus crosses from the base camp and takes up the pursuit'),
      arrow('macedon', [[-3400, 1100], [-2750, 1350], [-2250, 1650]], 120, 'mercenaries-crossing', 'The mercenaries cross from the right bank to join the pursuit'),
    ],
    clashes: [clash(0, 460, 300), clash(0, 1100, 250), clash(780, 2350, 250)],
  },
  markers: {
    'hydaspes-elephants-alexander': mark(0, 1700, 'Alexander', 'His cavalry rings the Indians', 'macedon'),
    'hydaspes-elephants-porus': mark(1300, 1300, 'Porus', 'Wounded; surrenders', 'porus'),
    'hydaspes-elephants-taxiles': mark(1650, 1700, 'Taxiles', 'Sent to Porus; driven off', 'taxila'),
    'hydaspes-elephants-beasts': mark(-1150, 470, 'Elephants', 'Riders killed; beasts run wild', 'porus', 'skull'),
    'hydaspes-elephants-craterus': mark(600, 2750, 'Craterus', 'Crosses; takes up the pursuit', 'macedon'),
    'hydaspes-elephants-mercenaries': mark(-2150, 2200, 'Meleager, Attalus and Gorgias', 'Cross to join the pursuit', 'macedon'),
  },
});

console.log('hydaspes: card', JSON.stringify(P(0, 0)), 'landing', JSON.stringify(P(-2450, -5400)),
  'bboxes', JSON.stringify([bboxCrossing, bboxCavalry, bboxElephants]));
