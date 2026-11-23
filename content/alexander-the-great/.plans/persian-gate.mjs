// The Persian Gate, January 330 BC (.plan/battles/persian-gate.md). The site is disputed (050.19): by the cloud
// ruling the field is drawn at Bosworth's site after Stein, the gorge above Mullah Susan that Bosworth names the
// Tang-i Mohammad Reza (C&E n. 191; Stein's "Tang-i Khas" lies some 10 km further west). The whole drawing is a
// reconstruction on that ground; no file gives coordinates for Mullah Susan, the gorge or the Bolsoru pass.
// Frame: origin at the wall, the point of the `persian-gate-330` marker and the card. u runs across the gorge
// (bearing 10, towards the Kuh-i Rudian side); w runs up the gorge from Mullah Susan towards the Persian camp.
// The widths of the gorge and the wall are unknown and drawn for legibility; no text gives them.
import { frame, writePlan } from './lib.mjs';

const f = frame([51.8, 30.45], 10), P = f.p, UP = f.face(90), DOWN = f.face(270);
const G = 'pages/050-gaugamela-and-persia/030-persian-gate';
// The night march needs the whole turning path; the assault and the dawn attack get frames on the fighting, so that
// the units read on a phone. Mullah Susan and the far end of the path sit past their edges.
const bbox = f.box([[-1100, -5800], [5400, 4050]], 0);
const bboxAssault = f.box([[-1000, -2700], [1300, 2000]], 0);
const bboxDawn = f.box([[-1200, -2000], [3700, 4050]], 0);

const unit = (side, type, u, w, width, depth, id, name, extra = {}) =>
  ({ side, type, at: P(u, w), width, depth, facing: side === 'persia' ? DOWN : UP, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const clash = (u, w, size) => (size ? { at: P(u, w), size } : P(u, w));
// the facing towards a local point from another, for units that do not face straight up or down the gorge
const towards = ([u0, w0], [u1, w1]) => f.face(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI);

// Works and the camp ring, the same on every phase: the wall across the narrows and the trench round the Persian camp
const wall = { side: 'persia', path: f.path([[-150, 0], [150, 0]]), width: 30, id: 'wall', name: 'Ariobarzanes’s wall across the narrows' };
const trench = { side: 'persia', path: f.path([[-700, 550], [700, 550], [700, 1750], [-700, 1750], [-700, 550]]), width: 25, style: 'trench', id: 'persian-camp', name: 'The Persian camp and its trench, at the head of the pass' };
const macCamp = unit('macedon', 'camp', 0, -5550, 400, 400, 'macedonian-camp', 'The Macedonian camp at Mullah Susan');

const N = {
  column: 'Macedonian infantry under Alexander, halted in the narrows',
  heights: 'Persian troops on the heights over the gorge',
  garrison: 'Persian troops at the wall',
  engines: 'Persian engines of war on the higher ground',
  guard: 'Persian advance guard on the crest',
  main: 'Ariobarzanes’s main body in the camp',
  horse: 'Ariobarzanes’s cavalry, 700 (Arrian) or 300 (Diodorus)',
  posts: 'Persian guard posts behind the camp',
  craterus: 'The battalions of Craterus and Meleager, under Craterus',
  craterusHorse: 'Craterus’s archers and cavalry',
  alexander: 'Alexander with the hypaspists, the battalion of Perdiccas, the Agrianians and the archers',
  royal: 'The royal squadron of the Companions and one more cavalry unit',
  philotas: 'Philotas’s column: the battalions of Coenus, Amyntas, son of Andromenes, and Polyperchon',
  philotasHorse: 'Philotas’s cavalry: the rest of the Companions and the scouts',
  ptolemy: 'Ptolemy’s detachment, 3,000 foot (Arrian)',
};

const heights = [
  unit('persia', 'light', -380, -1100, 1800, 100, 'heights', N.heights, { facing: f.face(0) }),
  unit('persia', 'light', 380, -1100, 1800, 100, 'heights', N.heights, { facing: f.face(180) }),
];
const garrison = unit('persia', 'infantry', 0, 90, 280, 100, 'garrison', N.garrison);
const mainBody = unit('persia', 'infantry', -100, 1050, 900, 300, 'main-body', N.main);
const cavalry = unit('persia', 'cavalry', 50, 1450, 500, 200, 'persian-cavalry', N.horse);
const posts = [[2900, 2700], [2300, 2300], [1700, 1900]].map(([u, w]) => unit('persia', 'light', u, w, 220, 70, 'guard-posts', N.posts, { facing: towards([u, w], [3400, 3000]) }));

// --- phase 1: the assault in the defile (the column drawn halted in the narrows, at the moment of the check) ---
writePlan(`${G}/020-persian-gate-assault`, {
  bbox: bboxAssault,
  emblem: {
    kind: 'battle-plan',
    works: [wall, trench],
    units: [
      macCamp,
      unit('macedon', 'pikes', 0, -1050, 200, 1800, 'column', N.column),
      ...heights,
      garrison,
      unit('persia', 'siege', -150, 300, 200, 70, 'engines', N.engines),
      unit('persia', 'infantry', 180, 320, 220, 90, 'advance-guard', N.guard),
      mainBody,
      cavalry,
    ],
    arrows: [
      arrow('macedon', [[0, -5300], [0, -3000], [0, -180]], 120, 'advance', 'Alexander leads the army up the gorge to the wall'),
      arrow('persia', [[-380, -700], [-80, -700]], 220, 'missiles-left', 'Boulders, sling stones and arrows from the heights', 'fire'),
      arrow('persia', [[380, -1500], [80, -1500]], 220, 'missiles-right', 'Boulders, sling stones and arrows from the heights', 'fire'),
      arrow('macedon', [[160, -300], [200, -3000], [120, -5300]], 100, 'retreat', 'The army falls back 30 stades to its camp, leaving its dead', 'dashed'),
    ],
    clashes: [clash(0, -90, 180)],
  },
  markers: {
    'persian-gate-assault-alexander': mark(-320, -2500, 'Alexander', 'The assault fails', 'macedon'),
    'persian-gate-assault-ariobarzanes': mark(950, 1150, 'Ariobarzanes', 'Camp behind the wall', 'persia'),
    'persian-gate-assault-camp': mark(-500, -5550, 'Macedonian camp', 'Mullah Susan, 30 stades below', 'macedon', 'flag'),
    'persian-gate-assault-wall': mark(450, 60, 'Ariobarzanes’s wall', 'Blocks the narrows', 'persia', 'swords'),
  },
});

// --- phase 2: the night march over the mountain ---
writePlan(`${G}/030-persian-gate-night-march`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    works: [wall, trench],
    units: [
      macCamp,
      unit('macedon', 'pikes', 0, -5000, 320, 200, 'craterus', N.craterus),
      unit('macedon', 'cavalry', -420, -5000, 240, 150, 'craterus-horse', N.craterusHorse),
      unit('macedon', 'pikes', 3400, 3000, 320, 160, 'alexander-force', N.alexander, { facing: towards([3400, 3000], [0, 1150]) }),
      unit('macedon', 'cavalry', 3700, 3250, 260, 150, 'royal-squadron', N.royal, { facing: towards([3700, 3250], [0, 1150]) }),
      unit('macedon', 'pikes', 2600, 900, 320, 160, 'philotas-column', N.philotas, { facing: towards([2600, 900], [0, 1150]) }),
      unit('macedon', 'cavalry', 2900, 1050, 260, 150, 'philotas-horse', N.philotasHorse, { facing: towards([2900, 1050], [0, 1150]) }),
      ...heights,
      garrison,
      mainBody,
      cavalry,
      ...posts,
    ],
    arrows: [
      arrow('macedon', [[300, -5350], [2800, -3000], [5100, 400]], 140, 'night-climb', 'The turning force climbs to the Bolsoru pass by night, in snow'),
      arrow('macedon', [[5000, 700], [3900, 800], [2780, 880]], 120, 'philotas-road', 'Philotas’s column takes the right-hand road towards the Persian camp'),
      arrow('macedon', [[5200, 800], [4600, 2200], [3550, 2900]], 120, 'alexander-path', 'Alexander goes on by the steeper path, farther from the Persian posts'),
    ],
  },
  markers: {
    'persian-gate-night-march-craterus': mark(0, -4650, 'Craterus', 'Keeps the camp fires burning', 'macedon'),
    'persian-gate-night-march-alexander': mark(3900, 3600, 'Alexander', 'Above the Persian posts', 'macedon'),
    'persian-gate-night-march-philotas': mark(2450, 1450, 'Philotas', 'The right-hand road', 'macedon'),
    'persian-gate-night-march-bolsoru': mark(5250, 550, 'Bolsoru pass', 'The force divides here', 'macedon', 'swords'),
    'persian-gate-night-march-ariobarzanes': mark(950, 1150, 'Ariobarzanes', 'Unaware in his camp', 'persia'),
  },
});

// --- phase 3: the dawn attack from behind ---
writePlan(`${G}/040-persian-gate-dawn`, {
  bbox: bboxDawn,
  emblem: {
    kind: 'battle-plan',
    works: [wall, trench],
    units: [
      macCamp,
      unit('macedon', 'pikes', 0, -360, 280, 250, 'craterus', `${N.craterus}, storming the wall`),
      unit('macedon', 'cavalry', 0, -780, 240, 150, 'craterus-horse', N.craterusHorse),
      unit('macedon', 'pikes', 950, 1700, 320, 160, 'alexander-force', N.alexander, { facing: towards([950, 1700], [0, 1150]) }),
      unit('macedon', 'cavalry', 1300, 2000, 260, 150, 'royal-squadron', N.royal, { facing: towards([1300, 2000], [0, 1150]) }),
      unit('macedon', 'pikes', 950, 650, 320, 160, 'philotas-column', N.philotas, { facing: f.face(180) }),
      unit('macedon', 'cavalry', 1300, 800, 260, 150, 'philotas-horse', N.philotasHorse, { facing: f.face(180) }),
      unit('macedon', 'infantry', 1000, -900, 300, 150, 'ptolemy', N.ptolemy, { facing: towards([1000, -900], [0, 1150]) }),
      heights[1],
      garrison,
      unit('persia', 'infantry', -100, 1150, 700, 300, 'main-body', `${N.main}, broken`),
    ],
    arrows: [
      arrow('macedon', [[3400, 3000], [2900, 2700], [2300, 2300], [1700, 1900], [1080, 1760]], 140, 'alexander-attack', 'Alexander takes the guard posts and falls on the camp at dawn'),
      arrow('macedon', [[0, -5300], [0, -2500], [0, -500]], 130, 'craterus-assault', 'At the trumpet signal Craterus storms the wall'),
      arrow('macedon', [[2600, 900], [1800, 760], [1120, 680]], 130, 'philotas-attack', 'Philotas’s column strikes the camp by its own road'),
      arrow('persia', [[-100, 950], [300, -150], [880, -780]], 110, 'persian-flight', 'The Persians flee towards the fortifications and are cut down', 'dashed'),
      arrow('persia', [[-300, 1650], [-650, 2800], [-900, 3900]], 100, 'ariobarzanes-escape', 'Ariobarzanes breaks out of the camp', 'dashed'),
    ],
    clashes: [clash(0, -150), clash(850, 1650), clash(850, 640), clash(900, -760)],
  },
  // each commander's marker stands 300–400 m off his blocks, away from the camp, so the units show on a phone
  markers: {
    'persian-gate-dawn-alexander': mark(1550, 1450, 'Alexander', 'Falls on the camp at dawn', 'macedon'),
    'persian-gate-dawn-craterus': mark(-480, -620, 'Craterus', 'Storms the wall', 'macedon'),
    'persian-gate-dawn-philotas': mark(1050, 150, 'Philotas', 'The third attack', 'macedon'),
    'persian-gate-dawn-ptolemy': mark(1500, -1150, 'Ptolemy', 'Cuts down the fugitives', 'macedon'),
    'persian-gate-dawn-posts': mark(2300, 2550, 'Guard posts', 'Two destroyed, one flees', 'persia', 'skull'),
    'persian-gate-dawn-ariobarzanes': mark(-900, 3900, 'Ariobarzanes', 'Breaks out of the camp', 'persia'),
    'persian-gate-dawn-cliffs': mark(600, -650, 'Over the cliffs', 'Persians fall to their deaths', 'persia', 'skull'),
  },
});

console.log('persian-gate: bbox', JSON.stringify(bbox), 'wall', JSON.stringify(P(0, 0)), 'mullah susan', JSON.stringify(P(0, -5550)));
