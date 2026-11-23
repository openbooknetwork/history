// The Granicus, May 334 BC, in Arrian's sequence (.plan/battles/granicus.md; decisions.md, the Granicus ruling).
// Diodorus's dawn crossing is the other account: the overview's text tells it, and no phase draws it.
// Frame: origin at the ford, Wikipedia's point for the site (40.3167 N, 27.2811 E), which lies on the plain of
// Adrasteia north of Biga. u runs north along the river, downstream, so the Macedonian right is at negative u;
// w runs east, from the Macedonians on the west bank towards the Persians on the east bank.
// The river's line follows the valley floor of the terrain tiles; no source gives its course point by point.
// The width of the front is unknown: about 3.6 km is drawn for legibility and no text gives it.
import { frame, writePlan } from './lib.mjs';

const f = frame([27.2811, 40.3167], 10), P = f.p, EAST = f.face(90), WEST = f.face(270);
const G = 'pages/030-asia-minor/030-granicus';
const river = { path: f.path([[-2600, -60], [-1300, 20], [0, 0], [1300, -30], [2600, 40], [3900, 80]]), width: 60, id: 'granicus', name: 'The river Granicus' };
const bbox = f.box([[-1100, -900], [3300, 2200]], 0);

const unit = (side, type, u, w, width, depth, id, name, extra = {}) =>
  ({ side, type, at: P(u, w), width, depth, facing: side === 'macedon' ? EAST : WEST, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// Unit names, shared by the three phases
const N = {
  m1: 'Companion cavalry under Philotas, with Alexander',
  m2: 'Archers and Agrianian javelin men',
  m3: 'Vanguard under Amyntas, son of Arrhabaeus: the lancers, the Paeonians and the squadron of Socrates, son of Sathon',
  m4: 'Hypaspists under Nicanor, son of Parmenion',
  m5: 'Phalanx, right of the centre: the battalions of Perdiccas, Coenus, Craterus and Amyntas, son of Andromenes',
  m6: 'Phalanx, left of the centre, with the battalion of Meleager',
  m7: 'Thracian cavalry and allied Greek cavalry under Philip, son of Menelaus',
  m8: 'Thessalian cavalry under Calas',
  p1: 'Persian left: the best of the horse, with Memnon of Rhodes and Arsames',
  p2: 'Paphlagonian horse under Arsites and Hyrcanian horse under Spithridates',
  p3: 'Persian centre: horse of other peoples',
  p4: 'Persian right wing: Medes, Bactrians and other horse, 5,000 (Diodorus)',
  p5: 'Greek mercenaries in Persian pay, a little under 20,000 (Arrian)',
};

// The Persian line, as it stands at the opening (phase 1); P1 comes down to the water during the phase.
const persianLine = [
  unit('persia', 'cavalry', 710, 205, 840, 250, 'persian-left-centre', N.p2),
  unit('persia', 'cavalry', 1620, 205, 800, 250, 'persian-centre', N.p3),
  unit('persia', 'cavalry', 2500, 205, 800, 250, 'persian-right', N.p4),
];
const mercenaries = unit('persia', 'pikes', 1350, 1500, 1500, 300, 'mercenaries', N.p5);

// --- phase 1: the vanguard in the river ---
writePlan(`${G}/020-granicus-vanguard`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    water: [river],
    units: [
      unit('macedon', 'cavalry', -250, -110, 550, 250, 'companions', N.m1),
      unit('macedon', 'light', -250, 45, 500, 40, 'light-infantry', N.m2),
      unit('macedon', 'cavalry', 150, -120, 220, 60, 'vanguard', `${N.m3}, thrown back`),
      unit('macedon', 'pikes', 375, -400, 340, 200, 'hypaspists', N.m4),
      unit('macedon', 'pikes', 1025, -400, 760, 200, 'phalanx-right', N.m5),
      unit('macedon', 'pikes', 1700, -400, 400, 200, 'phalanx-left', N.m6),
      unit('macedon', 'cavalry', 2175, -425, 340, 250, 'allied-cavalry', N.m7),
      unit('macedon', 'cavalry', 2650, -425, 440, 250, 'thessalians', N.m8),
      unit('persia', 'cavalry', -280, 280, 940, 320, 'persian-left', N.p1),
      ...persianLine,
      mercenaries,
    ],
    arrows: [
      arrow('macedon', [[0, -300], [0, -60], [20, 110]], 110, 'vanguard-attack', 'The vanguard rides into the river and up the far bank'),
      arrow('persia', [[-60, 330], [0, 60]], 220, 'persian-javelins', 'The Persian horse throw javelins from the bank', 'fire'),
      arrow('macedon', [[140, 120], [170, -10], [160, -70]], 90, 'vanguard-retreat', 'The vanguard, cut down, falls back to Alexander', 'dashed'),
      arrow('macedon', [[-600, -430], [-450, -260], [-250, 10]], 130, 'alexander-crossing', 'Alexander leads the right wing into the river in an oblique line downstream'),
    ],
    clashes: [P(10, 100), { at: P(-300, 95), size: 150 }],
  },
  markers: {
    'granicus-vanguard-alexander': mark(-700, -120, 'Alexander', 'Leads the right wing in', 'macedon'),
    'granicus-vanguard-amyntas': mark(100, -250, 'Amyntas, son of Arrhabaeus', 'The vanguard, mauled', 'macedon'),
    'granicus-vanguard-parmenion': mark(2400, -700, 'Parmenion', 'Commands the left wing', 'macedon'),
    'granicus-vanguard-memnon': mark(-250, 560, 'Memnon of Rhodes', 'With the best Persian horse', 'persia'),
    'granicus-vanguard-arsites': mark(700, 450, 'Arsites', 'Paphlagonian horse', 'persia'),
  },
});

// --- phase 2: the fight on the bank ---
writePlan(`${G}/030-granicus-bank`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    water: [river],
    units: [
      unit('macedon', 'cavalry', -250, 470, 600, 250, 'companions', `${N.m1}, and the archers and Agrianians`),
      unit('macedon', 'cavalry', -250, 230, 250, 60, 'vanguard', `${N.m3}, what is left of it`),
      unit('macedon', 'pikes', 400, 450, 340, 200, 'hypaspists', N.m4),
      unit('macedon', 'pikes', 1050, 450, 760, 200, 'phalanx-right', N.m5),
      unit('macedon', 'pikes', 1725, 450, 400, 200, 'phalanx-left', N.m6),
      unit('macedon', 'cavalry', 2175, 470, 340, 250, 'allied-cavalry', N.m7),
      unit('macedon', 'cavalry', 2650, 470, 440, 250, 'thessalians', N.m8),
      mercenaries,
    ],
    arrows: [
      arrow('macedon', [[-250, 20], [-250, 330]], 150, 'companions-push', 'Alexander’s horse drive the Persians off the bank'),
      arrow('macedon', [[1050, -350], [1050, 0], [1050, 340]], 220, 'phalanx-crossing', 'The phalanx crosses the river'),
      arrow('macedon', [[2420, -360], [2420, 0], [2420, 330]], 140, 'left-crossing', 'Parmenion’s cavalry cross on the left (from Diodorus’s account)'),
      arrow('persia', [[-150, 660], [150, 1250], [280, 2150]], 140, 'persian-flight', 'The Persian left and centre break and flee', 'dashed'),
      arrow('persia', [[2650, 650], [2750, 1300], [2950, 2150]], 120, 'persian-flight-right', 'The Persian right wing flees', 'dashed'),
    ],
    clashes: [{ at: P(-250, 660), size: 240 }],
  },
  markers: {
    'granicus-bank-alexander': mark(-750, 450, 'Alexander', 'Fights at the head of the Companions', 'macedon'),
    'granicus-bank-cleitus': mark(-520, 780, 'Cleitus the Black', 'Saves Alexander', 'macedon'),
    'granicus-bank-spithridates': mark(-20, 820, 'Spithridates', 'Killed in the fight round Alexander', 'persia', 'skull'),
    'granicus-bank-memnon': mark(-500, 1300, 'Memnon of Rhodes', 'Escapes the rout', 'persia'),
    'granicus-bank-parmenion': mark(3100, 440, 'Parmenion', 'The left wing crosses', 'macedon'),
  },
});

// --- phase 3: the mercenaries cut down ---
writePlan(`${G}/040-granicus-mercenaries`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    water: [river],
    units: [
      unit('macedon', 'cavalry', 620, 1600, 400, 150, 'companions', N.m1, { facing: f.face(0) }),
      unit('macedon', 'cavalry', 400, 1600, 300, 80, 'vanguard', N.m3, { facing: f.face(0) }),
      unit('macedon', 'pikes', 600, 1200, 260, 200, 'hypaspists', N.m4),
      unit('macedon', 'pikes', 1250, 1200, 800, 200, 'phalanx-right', N.m5),
      unit('macedon', 'pikes', 1950, 1200, 400, 200, 'phalanx-left', N.m6),
      unit('macedon', 'cavalry', 2080, 1550, 400, 150, 'thessalians', N.m8, { facing: f.face(180) }),
      unit('macedon', 'cavalry', 2290, 1550, 300, 100, 'allied-cavalry', N.m7, { facing: f.face(180) }),
      unit('persia', 'pikes', 1350, 1500, 1200, 300, 'mercenaries', `${N.p5}, surrounded`),
    ],
    arrows: [
      arrow('macedon', [[1250, 500], [1250, 1110]], 220, 'phalanx-advance', 'The phalanx advances on the mercenaries'),
      arrow('macedon', [[-250, 600], [100, 1450], [560, 1600]], 130, 'companions-envelop', 'Alexander’s cavalry fall on the southern flank'),
      arrow('macedon', [[2650, 600], [2500, 1300], [2140, 1550]], 130, 'thessalians-envelop', 'Parmenion’s cavalry fall on the northern flank'),
    ],
    clashes: [P(1250, 1320), P(720, 1600), P(1980, 1550)],
  },
  markers: {
    'granicus-mercenaries-alexander': mark(300, 1950, 'Alexander', 'Charges first, loses his horse', 'macedon'),
    'granicus-mercenaries-parmenion': mark(2500, 1950, 'Parmenion', 'Cavalry of the left wing', 'macedon'),
    'granicus-mercenaries-mercenaries': mark(1350, 1850, 'Greek mercenaries', 'Cut down; about 2,000 taken (Arrian)', 'persia', 'skull'),
  },
});

console.log('granicus: bbox', JSON.stringify(bbox), 'ford', JSON.stringify(P(0, 0)));
