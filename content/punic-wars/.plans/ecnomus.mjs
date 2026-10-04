// Cape Ecnomus, 256 BC, at the conventional site off Phintias (the infobox coordinates). The coast runs
// west-north-west here, so the frame follows it: u along the Roman course (bearing 290), w towards the land,
// which lies about 6.4 km off the origin.
import { frame, writePlan } from './lib.mjs';

const f = frame([13.9, 37.05], 290), P = f.p, AHEAD = f.face(0), BACK = f.face(180), LAND = f.face(90), SEA = f.face(270);
const G = 'pages/020-first-war/040-ecnomus';
const bbox = f.box([[-6200, -3600], [7200, 6800]], 0);
const ships = (side, u, w, width, depth, facing, count, rows = 1, extra = {}) => ({ side, type: 'ships', at: P(u, w), width, depth, facing, count, rows, ...extra });
const arrow = (side, pts, width = 140, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'ship') => ({ lnglat: P(u, w), icon, color, label, note });
// one wing of the wedge: pairs of ships stepped back from the point, so the line runs diagonally
const echelon = (side, dir, extra) => [1, 2, 3, 4, 5, 6].map(k => ships(side, -330 * k, 2000 + dir * 230 * k, 320, 400, AHEAD, 2, 1, extra));

// --- overview: the two fleets' routes to the meeting ---
writePlan(`${G}/010-ecnomus`, {
  routes: {
    'roman-fleet-256': { name: 'The Roman fleet from Messana by Phintias, 256 BC', path: [[15.57, 38.18], [15.35, 37.6], [15.25, 37.0], [15.05, 36.68], [14.6, 36.8], [14.25, 36.98], [13.94, 37.07]] },
    'carthaginian-fleet-256': { name: 'The Carthaginian fleet from Carthage by Lilybaeum and Heraclea Minoa, 256 BC', path: [[10.35, 36.85], [10.9, 37.2], [11.7, 37.55], [12.4, 37.78], [12.75, 37.55], [13.27, 37.36], [13.6, 37.18], [13.86, 37.06]] },
  },
  show: ['heraclea-minoa-256', 'lilybaeum-256'],
});

// --- the approach: the Roman wedge, the third squadron with the transports, the fourth in line; the Carthaginian line ---
const romanIII = ships('rome', -3300, 2000, 2600, 450, AHEAD, 12, 1, nm('third-squadron', 'Third Roman squadron, towing the horse transports'));
const transports = ships('neutral', -4050, 2000, 2600, 600, AHEAD, 14, 2, nm('transports', 'Transports carrying the horses'));
const romanIV = ships('rome', -4950, 2000, 3000, 450, AHEAD, 14, 1, nm('fourth-squadron', 'Fourth Roman squadron in line abreast, guarding the rear'));
writePlan(`${G}/020-ecnomus-approach`, {
  bbox,
  emblem: {
    units: [
      ships('rome', 0, 2000, 220, 400, AHEAD, 2, 1, nm('sixes', 'The consuls’ two sixes at the point of the wedge')),
      ...echelon('rome', 1, nm('first-squadron', 'First Roman squadron under Vulso, in echelon')),
      ...echelon('rome', -1, nm('second-squadron', 'Second Roman squadron under Regulus, in echelon')),
      romanIII, transports, romanIV,
      ships('carthage', 1500, 3700, 3000, 450, BACK, 12, 1, nm('carthaginian-left', 'Carthaginian left, the landward wing, advanced')),
      ships('carthage', 3800, 700, 3000, 450, BACK, 12, 1, nm('carthaginian-centre', 'Carthaginian centre under Hamilcar')),
      ships('carthage', 3800, -2600, 3400, 450, BACK, 14, 1, nm('hanno', 'Carthaginian right under Hanno, the fastest ships')),
    ],
    arrows: [arrow('rome', [[300, 2000], [1500, 2000]], 140, undefined, nm('wedge-advance', 'The Roman wedge drives at the Carthaginian centre')),
      arrow('carthage', [[3400, 700], [2400, 700]], 140, undefined, nm('carthaginian-advance', 'The Carthaginian line advances'))],
  },
  markers: {
    'ecnomus-approach-consuls': mark(500, 2900, 'Regulus and Vulso', 'Two sixes at the point', 'rome', 'user'),
    'ecnomus-approach-transports': mark(-4050, 200, 'Transports', 'Towed by the third squadron', undefined),
    'ecnomus-approach-left': mark(1500, 5300, 'Carthaginian left', 'The landward wing, advanced', 'carthage'),
    'ecnomus-approach-hamilcar': mark(5000, 700, 'Hamilcar', 'The centre', 'carthage', 'user'),
    'ecnomus-approach-hanno': mark(5000, -2600, 'Hanno', 'The fastest ships, to seaward', 'carthage', 'user'),
  },
});

// --- three fights: Hamilcar draws the consuls on, the wings fall on the third and fourth squadrons ---
const carthLeft = ships('carthage', -2500, 5150, 2600, 350, LAND, 11, 1, nm('carthaginian-left', 'Carthaginian landward squadron'));
const romanIIIshore = ships('rome', -2500, 5700, 2600, 350, SEA, 12, 1, nm('third-squadron', 'Third Roman squadron, in shallow water facing out to sea'));
const hanno = ships('carthage', -4950, 200, 2000, 350, LAND, 9, 1, nm('hanno', 'Hanno’s seaward squadron'));
const driftIV = ships('rome', -4950, 2000, 3000, 450, AHEAD, 14, 1, nm('fourth-squadron', 'Fourth Roman squadron, hampered by the transports'));
const drift = ships('neutral', -3700, 2600, 2600, 700, AHEAD, 12, 2, nm('transports', 'Transports, cast off and drifting'));
writePlan(`${G}/030-ecnomus-three-fights`, {
  bbox,
  emblem: {
    units: [
      ships('rome', 5000, 2300, 1600, 400, AHEAD, 7, 1, nm('first-squadron', 'First Roman squadron under Vulso')),
      ships('rome', 5000, 900, 1600, 400, AHEAD, 7, 1, nm('second-squadron', 'Second Roman squadron under Regulus')),
      ships('carthage', 5460, 1600, 3000, 400, BACK, 12, 1, nm('carthaginian-centre', 'Carthaginian centre under Hamilcar, turned about to fight')),
      carthLeft, romanIIIshore, drift, driftIV, hanno,
    ],
    arrows: [
      arrow('carthage', [[3000, 1100], [4400, 1300], [5600, 1500]], 130, undefined, nm('hamilcar-falls-back', 'Hamilcar’s centre falls back, drawing the consuls on')),
      arrow('rome', [[600, 1600], [2600, 1600], [4600, 1600]], 140, undefined, nm('consuls-pursue', 'The consuls follow the Carthaginian centre')),
      arrow('rome', [[-3300, 2400], [-2900, 4300], [-2550, 5450]], 120, 'dashed', nm('third-to-shore', 'The third squadron casts off the transports and retreats to the shore')),
      arrow('carthage', [[1500, 3700], [-200, 4400], [-1600, 4950]], 120, undefined, nm('left-attacks', 'The Carthaginian landward wing falls on the third squadron')),
      arrow('carthage', [[3800, -2600], [0, -2300], [-3500, -1100], [-4500, 0]], 130, undefined, nm('hanno-attacks', 'Hanno attacks the fourth squadron at the rear')),
    ],
    clashes: [P(5230, 2300), P(5230, 900), P(-2500, 5450), P(-4950, 470)],
  },
  markers: {
    'ecnomus-fights-hamilcar': mark(6400, 1600, 'Hamilcar', 'Feigned retreat, then turns', 'carthage', 'user'),
    'ecnomus-fights-consuls': mark(4300, 3300, 'Regulus and Vulso', 'Pursue the centre', 'rome', 'user'),
    'ecnomus-fights-third': mark(-4600, 6300, 'Third squadron', 'Shelters in shallow water', 'rome'),
    'ecnomus-fights-transports': mark(-2600, 3300, 'Transports', 'Cast off and drifting', undefined),
    'ecnomus-fights-hanno': mark(-5200, -1100, 'Hanno', 'Attacks the rear squadron', 'carthage', 'user'),
  },
});

// --- victory: the centre flees, the consuls return, Hanno escapes, the landward squadron surrenders ---
writePlan(`${G}/040-ecnomus-victory`, {
  bbox,
  emblem: {
    units: [
      carthLeft, romanIIIshore, ships('rome', -2500, 4720, 2400, 350, LAND, 10, 1, nm('vulso', 'Vulso’s squadron, attacking from the sea')),
      hanno, ships('rome', -4950, -230, 2000, 350, LAND, 9, 1, nm('regulus', 'Regulus’s squadron, attacking Hanno from his open side')), driftIV, drift,
    ],
    arrows: [
      arrow('carthage', [[5500, 1500], [6400, 1200], [7100, 900]], 130, 'dashed', nm('centre-flees', 'Hamilcar’s centre breaks and flees')),
      arrow('rome', [[4800, 2300], [2000, 3400], [-1300, 4600]], 140, undefined, nm('vulso-returns', 'Vulso rows back to the landward fight')),
      arrow('rome', [[4800, 900], [1000, -300], [-3800, -400]], 140, undefined, nm('regulus-returns', 'Regulus rows back against Hanno')),
      arrow('rome', [[-5600, -350], [-6000, 2500], [-3800, 4700]], 110, undefined, nm('regulus-on', 'Regulus moves on against the landward squadron')),
      arrow('carthage', [[-3800, 100], [-1500, -2200], [2500, -3200]], 120, 'dashed', nm('hanno-withdraws', 'Hanno withdraws with the ships that can get away')),
    ],
    clashes: [P(-2500, 4930), P(-2500, 5460), P(-4950, -20)],
  },
  markers: {
    'ecnomus-victory-left': mark(-4200, 6300, 'Carthaginian left', '50 ships surrender', 'carthage', 'skull'),
    'ecnomus-victory-vulso': mark(-1000, 3800, 'Vulso', 'Attacks from the sea', 'rome', 'user'),
    'ecnomus-victory-regulus': mark(-5600, -1300, 'Regulus', 'Takes Hanno in the flank', 'rome', 'user'),
    'ecnomus-victory-hanno': mark(1500, -3100, 'Hanno', 'Withdraws', 'carthage', 'user'),
    'ecnomus-victory-hamilcar': mark(6300, 700, 'Hamilcar', 'The centre breaks and flees', 'carthage', 'user'),
  },
});

console.log('ecnomus: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 2000)));
