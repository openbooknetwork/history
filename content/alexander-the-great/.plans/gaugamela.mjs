// Gaugamela, 1 October 331 BC (.plan/battles/gaugamela.md), in the order of Bosworth's reconstruction of Arrian.
// Frame: origin at Wikipedia's point for the site (36.56 N, 43.44 E), in the plain north of the Jabal Maqlub where
// Bosworth places the field. u runs north-west along the lines (towards the Macedonian left and the Persian right);
// w runs north-east, from the Macedonians towards the Persians. The compass facing, the widths of the fronts and the
// distances are drawn for legibility; no text gives them. Every unit of Alexander's side is drawn as `macedon`.
// The section plan names only Simmias, Aretes, Polyperchon, Attalus (the Agrianians) and Philip, son of Menelaus
// among the minor commanders, so the unit names leave the others out.
import fs from 'fs';
import { frame, writePlan } from './lib.mjs';

// writePlan leaves `date` alone, so a page whose date this script owns sets it here
const setDate = (page, date) => { const file = new URL(`../${page}/page.yaml`, import.meta.url);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^date:.*$/m, `date: ${JSON.stringify(date)}`)); };

const f = frame([43.44, 36.56], 315), P = f.p, MAC = f.face(90), PER = f.face(270);
const G = 'pages/050-gaugamela-and-persia/010-gaugamela';
// The box fits the drawn pieces: the camp 30 stades behind the line, and the flight and pursuit pulled in to u -4,600.
// f.box boxes the corners of the local rectangle, which a frame turned 45° doubles; this boxes the points themselves.
const pointBox = (pts, pad) => { const ll = pts.map(([a, b]) => P(a, b)), dx = pad / (111320 * Math.cos(36.56 * Math.PI / 180)), dy = pad / 110540, r = x => Math.round(x * 1e5) / 1e5;
  return [Math.min(...ll.map(q => q[0])) - dx, Math.min(...ll.map(q => q[1])) - dy, Math.max(...ll.map(q => q[0])) + dx, Math.max(...ll.map(q => q[1])) + dy].map(r); };
const bbox = pointBox([[-4700, 2700], [-4700, 950], [3300, -3400], [700, -5050], [100, -5000], [2700, -800], [-1450, 1750], [-1800, 2350], [1700, -1450], [2300, 950], [2200, 950], [-2100, 2500], [-4700, 1025], [-4030, -480], [2900, -1500], [-3150, -1100], [-200, -1650]], 500);

const unit = (side, type, u, w, width, depth, id, name, extra = {}) =>
  ({ side, type, at: P(u, w), width, depth, facing: side === 'persia' ? PER : MAC, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const clash = (u, w, size) => (size ? { at: P(u, w), size } : P(u, w));

const N = {
  rightGuard: 'Right flank guard: mercenary horse, the lancers under Aretes, the Paeonians, half the Agrianians, the archers and the old mercenaries',
  screen: 'Javelin men, half the Agrianians and archers, facing the scythed chariots',
  companions: 'Companion cavalry, with Alexander',
  phalanxRight: 'Hypaspists under Nicanor, son of Parmenion, and the battalions of Coenus, Perdiccas, Meleager and Polyperchon',
  phalanxLeft: 'The battalions of Simmias and Craterus, Craterus leading the infantry of the left',
  leftCavalry: 'Parmenion with the Thessalian horse under Philip, son of Menelaus, and the allied Greek horse',
  leftGuard: 'Left flank guard: mercenary, Odrysian and allied horse, with Thracian infantry',
  reserve: 'Second line of Greek allied and mercenary infantry, ready to face about',
  saka: 'Saka and Bactrian horse, the Saka in mail, under Bessus',
  chariots: '100 scythed chariots of the Persian left',
  persianLeft: 'Persian left under Bessus: Bactrians, Dahae, Arachosians, Persians and Susians',
  persianCentre: 'Darius’s centre: the Kinsmen, the apple-bearing guard, Greek mercenaries, Indians, Carians, Mardian archers and the levies behind',
  persianRight: 'Persian right under Mazaeus: Syrians, Mesopotamians, Medes, Parthians, Saka, Tapurians, Hyrcanians and Albanians',
  armenians: 'Armenian and Cappadocian horse, with 50 scythed chariots',
};

// --- phase 1: the armies deploy (blocks as drawn up; arrows show the march that begins) ---
writePlan(`${G}/020-gaugamela-deployment`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    units: [
      unit('macedon', 'cavalry', -2000, -1100, 700, 350, 'right-flank-guard', N.rightGuard, { facing: f.face(180) }),
      unit('macedon', 'light', -1450, -380, 560, 100, 'screen', N.screen),
      unit('macedon', 'cavalry', -1450, -700, 560, 350, 'companions', N.companions),
      unit('macedon', 'pikes', -505, -700, 1150, 350, 'phalanx-right', N.phalanxRight),
      unit('macedon', 'pikes', 365, -700, 400, 350, 'phalanx-left', N.phalanxLeft),
      unit('macedon', 'cavalry', 1010, -700, 700, 350, 'left-cavalry', N.leftCavalry),
      unit('macedon', 'cavalry', 1620, -1100, 700, 350, 'left-flank-guard', N.leftGuard, { facing: f.face(0) }),
      unit('macedon', 'infantry', -200, -1500, 2400, 300, 'reserve', N.reserve),
      unit('persia', 'knights', -2500, 300, 700, 300, 'saka-bactrians', N.saka),
      unit('persia', 'chariots', -1600, 150, 700, 100, 'chariots-left', N.chariots),
      unit('persia', 'cavalry', -3500, 800, 2400, 450, 'persian-left', N.persianLeft),
      unit('persia', 'infantry', -1450, 1050, 1500, 1000, 'persian-centre', N.persianCentre),
      unit('persia', 'cavalry', 750, 800, 2700, 450, 'persian-right', N.persianRight),
      unit('persia', 'cavalry', 1500, 350, 700, 300, 'armenians', N.armenians),
    ],
    arrows: [
      arrow('macedon', [[-1450, -900], [-2100, -950], [-2700, -900]], 120, 'march-right', 'Alexander leads his army to the right, towards the edge of the levelled ground'),
      arrow('persia', [[-3500, 1050], [-4100, 1100], [-4600, 1050]], 120, 'persian-parallel', 'The Persian left keeps pace, far outflanking him'),
      arrow('persia', [[-2500, 150], [-2450, -350], [-2250, -900]], 100, 'saka-ride', 'The Saka horse ride along the line and engage Alexander’s leading troops'),
    ],
    clashes: [clash(-2250, -900, 200)],
  },
  markers: {
    'gaugamela-deploy-alexander': mark(-1450, -1050, 'Alexander', 'Companions; leads the march right', 'macedon'),
    'gaugamela-deploy-darius': mark(-1450, 1750, 'Darius III', 'Centre, opposite Alexander', 'persia'),
    'gaugamela-deploy-parmenion': mark(1010, -1050, 'Parmenion', 'Commands the left', 'macedon'),
    'gaugamela-deploy-bessus': mark(-3500, 1250, 'Bessus', 'Bactrians and the Persian left', 'persia'),
    'gaugamela-deploy-mazaeus': mark(750, 1250, 'Mazaeus', 'Commands the Persian right', 'persia'),
    'gaugamela-deploy-camp': mark(500, -4850, 'Macedonian camp', 'Baggage and prisoners, Thracian guard', 'macedon', 'flag'),
  },
});

// --- phase 2: the wedge and Darius's flight ---
writePlan(`${G}/030-gaugamela-breakthrough`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    units: [
      unit('macedon', 'cavalry', -3820, -180, 600, 300, 'right-flank-cavalry', 'Mercenary horse, the lancers under Aretes and the Paeonians', { facing: f.face(135) }),
      unit('macedon', 'light', -3150, -800, 600, 200, 'right-flank-infantry', 'Half the Agrianians, the archers and the old mercenaries', { facing: f.face(180) }),
      unit('macedon', 'cavalry', -3000, 700, 450, 400, 'companions', 'Alexander and the Companions in a wedge, with half the Agrianians and archers on their right', { facing: f.face(60), bow: 150 }),
      unit('macedon', 'pikes', -1800, 450, 1250, 350, 'phalanx-right', N.phalanxRight),
      unit('macedon', 'pikes', -950, -150, 450, 350, 'phalanx-left', N.phalanxLeft),
      unit('macedon', 'cavalry', 0, -550, 800, 300, 'left-cavalry', N.leftCavalry),
      unit('macedon', 'cavalry', 650, -1000, 700, 350, 'left-flank-guard', N.leftGuard, { facing: f.face(0) }),
      unit('macedon', 'infantry', -1200, -1500, 2400, 300, 'reserve', N.reserve),
      unit('persia', 'knights', -4030, 30, 900, 300, 'saka-bactrians', 'Saka and Bactrian horse under Bessus, riding round Alexander’s right', { facing: f.face(315) }),
      unit('persia', 'cavalry', -3900, 750, 1100, 350, 'persian-left', 'Persian horse of the left, drawn off to help the encirclement', { facing: f.face(225) }),
      unit('persia', 'infantry', -1900, 1250, 1500, 1000, 'persian-centre', `${N.persianCentre}; breaking`),
      unit('persia', 'cavalry', 600, 700, 3200, 450, 'persian-right', N.persianRight),
      unit('persia', 'cavalry', 200, -200, 700, 300, 'armenians', 'Armenian and Cappadocian horse with 50 chariots, pressing Parmenion’s wing'),
    ],
    arrows: [
      arrow('persia', [[-2500, 300], [-3400, 250], [-3900, -150]], 120, 'saka-encircle', 'The Saka and Bactrians ride round Alexander’s right; Bessus sends in the rest of the Bactrians'),
      arrow('persia', [[-2300, 150], [-2450, -150], [-2550, -450]], 100, 'chariots', 'The scythed chariots charge Alexander; speared, pulled down or let through'),
      arrow('persia', [[-2900, 1050], [-3400, 1000], [-3800, 880]], 110, 'gap', 'Persian horse leave the line to join the encirclement, opening a gap'),
      arrow('macedon', [[-2450, -650], [-2800, -100], [-2900, 600]], 140, 'wedge', 'Alexander leads the Companions and the nearest battalions into the gap, straight at Darius'),
      arrow('persia', [[-1900, 1400], [-3000, 1850], [-3900, 2100], [-4600, 2200]], 100, 'darius-flight', 'Darius flees towards Arbela', 'dashed'),
    ],
    clashes: [clash(-3925, -75), clash(-2750, 880), clash(-1800, 690), clash(150, -375)],
  },
  markers: {
    'gaugamela-break-alexander': mark(-3250, 350, 'Alexander', 'Leads the wedge at Darius', 'macedon'),
    'gaugamela-break-darius': mark(-2200, 1950, 'Darius III', 'Flees towards Arbela', 'persia'),
    'gaugamela-break-bessus': mark(-4400, 350, 'Bessus', 'Bactrians ride round the right', 'persia'),
    'gaugamela-break-aretes': mark(-3800, -550, 'Aretes', 'Lancers and mercenary horse hold', 'macedon', 'swords'),
    'gaugamela-break-chariots': mark(-2700, -350, 'Scythed chariots', 'Speared or let through', 'persia', 'skull'),
    'gaugamela-break-parmenion': mark(0, -900, 'Parmenion', 'Left under pressure', 'macedon'),
  },
});

// --- phase 3: Parmenion's wing and the pursuit ---
// Both attacks on the camp are drawn: Arrian's break-in through the gap and Diodorus's raid sent round the flank,
// which Diodorus and Bosworth put early in the battle.
writePlan(`${G}/040-gaugamela-left-wing`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    units: [
      unit('macedon', 'cavalry', -1800, 2050, 600, 300, 'companions', 'Alexander and the Companions bar the fugitives’ retreat; about 60 Companions fall', { facing: f.face(0) }),
      unit('macedon', 'pikes', -1700, 1200, 1250, 350, 'phalanx-right', 'Hypaspists and four battalions, sweeping through the Persian centre'),
      unit('macedon', 'pikes', -500, -350, 450, 350, 'phalanx-left', 'Simmias and Craterus halt to cover the left'),
      unit('macedon', 'cavalry', 600, -400, 900, 350, 'left-cavalry', 'Parmenion with the Thessalians, the allied horse and the left flank guard', { facing: f.face(45) }),
      unit('macedon', 'infantry', 100, -4450, 1000, 300, 'reserve', 'The reserve phalanx, turned back to the baggage', { facing: f.face(270) }),
      unit('macedon', 'cavalry', -3600, 300, 600, 300, 'right-flank-cavalry', 'Mercenary horse, lancers and Paeonians after the Bactrian fight'),
      unit('persia', 'cavalry', -1350, 2050, 600, 400, 'persian-fugitives', 'Persian, Parthian and Indian horse in flight', { facing: f.face(180) }),
      unit('persia', 'cavalry', 100, -4850, 500, 300, 'raiders', 'Persian horse at the baggage, cut down from behind', { facing: f.face(270) }),
      unit('persia', 'cavalry', 1900, -600, 1600, 450, 'persian-right', 'Mazaeus’s wing, thrown back by the Thessalians', { facing: f.face(180) }),
    ],
    arrows: [
      arrow('persia', [[-1100, 900], [-1000, -300], [-500, -2500], [50, -4700]], 110, 'break-in', 'Persian and Indian horse break through the gap to the baggage (Arrian)'),
      arrow('macedon', [[-1200, -1500], [-600, -3200], [100, -4350]], 120, 'reserve-turns', 'The reserve phalanx turns back and falls on them'),
      arrow('persia', [[2300, 700], [2700, -800], [2200, -2600], [800, -4750]], 120, 'mazaeus-round', 'Mazaeus’s horse ride round Parmenion’s flank; a detachment rides on to the camp (Diodorus)'),
      arrow('macedon', [[-4600, 2400], [-3400, 2250], [-1970, 2050]], 140, 'companions-return', 'The Companions, back from the pursuit, meet the fleeing horse'),
      arrow('persia', [[2000, -400], [3000, -1500], [3300, -3400]], 110, 'mazaeus-withdraws', 'Mazaeus’s wing gives way before the Thessalians', 'dashed'),
    ],
    clashes: [clash(-1600, 2050), clash(100, -4650), clash(1350, -450)],
  },
  markers: {
    'gaugamela-left-alexander': mark(-2100, 2500, 'Alexander', 'Returns; about 60 Companions fall', 'macedon'),
    'gaugamela-left-parmenion': mark(600, -850, 'Parmenion', 'Holds; Thessalians drive off Mazaeus', 'macedon'),
    'gaugamela-left-mazaeus': mark(2400, -150, 'Mazaeus', 'Encircles the left, then withdraws', 'persia'),
    'gaugamela-left-simmias': mark(-450, -750, 'Simmias', 'Halts; a gap opens', 'macedon', 'swords'),
    'gaugamela-left-camp': mark(700, -5050, 'Macedonian camp', 'Raided; relieved by the reserve', 'macedon', 'flag'),
    'gaugamela-left-lycus': mark(-4400, 2700, 'To the Lycus', 'Pursuit, about 32 km', 'macedon', 'swords'),
  },
});

// the halt in sight of the Persians is on the day before; the battle opens at dawn on 1 October
setDate(`${G}/020-gaugamela-deployment`, '30 September – 1 October 331 BC');

console.log('gaugamela: bbox', JSON.stringify(bbox), 'site', JSON.stringify(P(0, 0)));
