// The Pyramids, 21 July 1798, fought on the west bank of the Nile at Embabeh, opposite Cairo. The French come south
// along the river in five divisional squares, Murad Bey holds the line from Embabeh west to Biktil.
// Frame: origin on Embabeh, u west along Murad's line, w north from Murad towards the French.
import { frame, writePlan } from './lib.mjs';

const f = frame([31.2145, 30.0785], 270), P = f.p, OTT = f.face(90), FR = f.face(270);
const G = 'pages/030-egypt/020-pyramids';
const nile = { path: [[31.233, 30.035], [31.228, 30.05], [31.222, 30.065], [31.219, 30.08], [31.218, 30.095], [31.213, 30.11], [31.203, 30.125], [31.19, 30.14]], width: 350, id: 'nile', name: 'The Nile' };
const works = [{ side: 'ottoman', path: f.path([[-180, 420], [250, 520], [560, 260], [620, -150], [450, -460], [80, -560], [-260, -470]]), width: 35, id: 'embabeh-works', name: 'Entrenchments around Embabeh' }];
const bbox = f.box([[-2000, -1300], [4000, 3200]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : OTT, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
// the five divisional squares, about 275 m across, in echelon with the right leading
const squares = (dw = 0) => [
  unit('france', 'square', 2850, 1100 + dw, 275, 90, 'desaix', 'Desaix’s division in square'),
  unit('france', 'square', 2250, 1450 + dw, 275, 90, 'reynier', 'Reynier’s division in square'),
  unit('france', 'square', 1650, 1800 + dw, 275, 90, 'dugua', 'Dugua’s division in square, with Bonaparte'),
  unit('france', 'square', 1050, 2150 + dw, 275, 90, 'vial', 'Vial’s division in square'),
];

// --- overview: the march from Alexandria by Damanhur and the Nile ---
writePlan(`${G}/010-pyramids`, {
  routes: {
    'bonaparte-cairo-1798': { name: 'Bonaparte’s march from Alexandria to Embabeh, 6 to 21 July 1798',
      path: [[29.92, 31.19], [30.15, 31.12], [30.47, 31.04], [30.64, 31.1], [30.71, 31.03], [30.8, 30.85], [30.86, 30.68], [30.94, 30.5], [31.03, 30.33], [31.11, 30.22], [31.17, 30.13], [31.205, 30.09]] },
    'dugua-rosetta-1798': { name: 'Dugua’s division by Rosetta, and Perrée’s flotilla up the Nile, July 1798', offset: 6,
      path: [[29.93, 31.21], [30.07, 31.3], [30.25, 31.33], [30.42, 31.4], [30.47, 31.3], [30.55, 31.19], [30.64, 31.11]] },
  },
  markers: {
    'pyramids-rosetta': { lnglat: [30.42, 31.4], icon: 'flag', color: 'france', label: 'Rosetta', note: 'Taken by Dugua' },
    'pyramids-damanhur': { lnglat: [30.47, 31.04], icon: 'flag', color: 'france', label: 'Damanhur', note: 'Reached 7 July' },
    'pyramids-shubra-khit': { lnglat: [30.713, 31.028], icon: 'swords', color: 'france', label: 'Shubra Khit', note: 'Murad Bey repulsed, 13 July' },
  },
  show: ['egypt-1798-alexandria'],
});

// --- the squares and the Mamluk charge, about 15:30 ---
writePlan(`${G}/020-pyramids-squares`, {
  bbox,
  emblem: {
    water: [nile],
    works,
    units: [
      ...squares(),
      unit('france', 'square', 450, 2500, 275, 90, 'bon', 'Bon’s division in square, by the Nile'),
      unit('france', 'infantry', 3350, 450, 250, 120, 'biktil', 'Desaix’s detachment at Biktil'),
      unit('ottoman', 'cavalry', 1800, 100, 1600, 250, 'mamluks', 'Mamluk cavalry under Murad Bey, about 6,000'),
      unit('ottoman', 'infantry', 120, 20, 520, 380, 'embabeh', 'Infantry in Embabeh, fellahin levies and Ottoman troops'),
      unit('ottoman', 'artillery', 220, 430, 420, 60, 'embabeh-guns', 'Murad’s guns in Embabeh', { count: 8 }),
      unit('ottoman', 'infantry', -1350, -300, 1500, 400, 'ibrahim', 'Ibrahim Bey’s army on the east bank', { facing: 270 }),
    ],
    arrows: [
      arrow('ottoman', [[1450, 280], [1550, 1000], [1600, 1650]], 110, 'charge', 'Ayyub Bey leads the Mamluk charge against the squares'),
      arrow('ottoman', [[2050, 280], [2150, 800], [2200, 1300]], 110, 'charge', 'Ayyub Bey leads the Mamluk charge against the squares'),
      arrow('ottoman', [[2550, 260], [2700, 600], [2800, 950]], 110, 'charge', 'Ayyub Bey leads the Mamluk charge against the squares'),
      arrow('ottoman', [[2600, 120], [2950, 250], [3200, 400]], 90, 'biktil-charge', 'Mamluks charge the detachment at Biktil'),
    ],
    clashes: [{ at: P(1630, 1720), size: 110 }, { at: P(2230, 1370), size: 110 }, { at: P(2830, 1020), size: 110 }, { at: P(3230, 430), size: 90 }],
  },
  markers: {
    'pyramids-squares-bonaparte': mark(1650, 2120, 'Bonaparte', 'In Dugua’s square', 'france'),
    'pyramids-squares-desaix': mark(3150, 1300, 'Desaix', 'Leads on the right', 'france'),
    'pyramids-squares-murad': mark(1800, -320, 'Murad Bey', 'Mamluk cavalry, about 6,000', 'ottoman'),
    'pyramids-squares-embabeh': mark(250, -820, 'Embabeh', 'Entrenched, with guns', 'ottoman', 'flag'),
    'pyramids-squares-ibrahim': mark(-1350, -1150, 'Ibrahim Bey', 'Watches from the east bank', 'ottoman'),
  },
});

// --- the storming of Embabeh and the rout ---
writePlan(`${G}/030-pyramids-embabeh`, {
  bbox,
  emblem: {
    water: [nile],
    works,
    units: [
      ...squares(),
      unit('france', 'infantry', 30, 640, 90, 220, 'bon', 'Bon’s division in attack columns'),
      unit('france', 'infantry', 260, 700, 90, 220, 'bon', 'Bon’s division in attack columns'),
      unit('france', 'infantry', 490, 640, 90, 220, 'bon', 'Bon’s division in attack columns'),
      unit('france', 'infantry', 3350, 450, 250, 120, 'biktil', 'Desaix’s detachment, holding Biktil'),
      unit('ottoman', 'infantry', 150, -150, 520, 300, 'embabeh', 'The garrison of Embabeh, breaking'),
      unit('ottoman', 'cavalry', 2300, -500, 900, 200, 'mamluks', 'Murad Bey’s remaining cavalry, falling back'),
    ],
    arrows: [
      arrow('france', [[260, 2200], [260, 1500], [260, 860]], 100, 'bon-attack', 'Bon’s division forms columns and storms Embabeh'),
      arrow('ottoman', [[-60, -200], [-330, -280], [-560, -330]], 100, 'garrison-flight', 'The garrison flees into the Nile, where hundreds drown', 'dashed'),
      arrow('ottoman', [[2400, -650], [2700, -950], [3000, -1250]], 110, 'murad-flight', 'Murad Bey escapes south towards Upper Egypt', 'dashed'),
      arrow('ottoman', [[-1350, -300], [-1700, -150], [-1980, 0]], 100, 'ibrahim-withdraws', 'Ibrahim Bey’s army breaks up and makes for Syria', 'dashed'),
    ],
    clashes: [{ at: P(260, 520), size: 100 }, { at: P(10, 470), size: 100 }, { at: P(520, 440), size: 100 }],
  },
  markers: {
    'pyramids-embabeh-bon': mark(850, 820, 'Bon', 'Storms Embabeh', 'france'),
    'pyramids-embabeh-garrison': mark(-350, -750, 'Embabeh garrison', 'Hundreds drown in the Nile', 'ottoman', 'skull'),
    'pyramids-embabeh-ayyub': mark(1800, 150, 'Ayyub Bey', 'Killed in the charge', 'ottoman', 'skull'),
    'pyramids-embabeh-murad': mark(3000, -1000, 'Murad Bey', 'Escapes, wounded', 'ottoman'),
    'pyramids-embabeh-ibrahim': mark(-1500, -950, 'Ibrahim Bey', 'Withdraws towards Syria', 'ottoman'),
  },
});

console.log('pyramids: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(1500, 300)));
