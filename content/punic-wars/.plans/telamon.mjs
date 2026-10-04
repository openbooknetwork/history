// Telamon, 225 BC. The Gauls withdraw north-west along the Etruscan coast with their plunder, Papus behind them,
// and run into Regulus coming south from Pisae, on the plain inland from Talamone (Campo Regio).
// Frame: origin at the Gallic army, u along the road to the north-west (towards Regulus), w inland (north-east).
import { frame, writePlan } from './lib.mjs';

const f = frame([11.165, 42.6], 320), P = f.p;
const G = 'pages/030-interwar/040-telamon';
const bbox = f.box([[-4300, -1800], [4100, 3300]], 0);
const TO_PAPUS = f.face(180), TO_REGULUS = f.face(0);
const unit = (side, type, u, w, width, depth, facing, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, ...extra });
const arrow = (side, pts, width = 110, style) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}) });
// id and name: what the reader sees on pointing at a block; pieces that share an id highlight together
const n = (o, id, name) => ({ ...o, id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, note });
// wagons and chariots on both flanks of the Gallic square
const wagons = [[1350], [-1350]].map(([w]) => ({ side: 'gauls', path: f.path([[-600, w], [600, w]]), width: 70, id: 'wagons', name: 'Gallic wagons and chariots on the flanks' }));
const gauls = (width = 2400) => [n(unit('gauls', 'infantry', 320, 0, width, 400, TO_REGULUS), 'boii-taurisci', 'Boii and Taurisci, facing Regulus'),
  n(unit('gauls', 'infantry', -320, 0, width, 400, TO_PAPUS), 'gaesatae-insubres', 'Gaesatae and Insubres, facing Papus')];

// --- overview: the invasion and the two consular armies closing in ---
writePlan(`${G}/010-telamon`, {
  bbox: [9.9, 41.7, 12.8, 44.75],
  routes: {
    'gauls-225': { name: 'The Boii, Insubres and Gaesatae cross the Apennines into Etruria, 225 BC', path: [[11.0, 44.75], [11.2, 44.4], [11.25, 44.05], [11.45, 43.7], [11.75, 43.35], [11.95, 43.03]] },
    'gauls-225-coast': { name: 'The Gauls turn back along the coast with their plunder', path: [[11.95, 43.03], [11.62, 42.8], [11.32, 42.56], [11.2, 42.54], P(-400, 0)] },
    'papus-225': { name: 'The consul Aemilius Papus follows from Ariminum', offset: 6, path: [[12.57, 44.06], [12.45, 43.7], [12.25, 43.35], [12.0, 43.05], [11.65, 42.8], [11.35, 42.56], P(-2900, 0)] },
    'regulus-225': { name: 'The consul Atilius Regulus crosses from Sardinia to Pisae and marches south', path: [[9.55, 41.25], [10.0, 42.5], [10.3, 43.4], [10.38, 43.7], [10.52, 43.4], [10.65, 43.05], [10.85, 42.85], [11.03, 42.7], P(2800, 0)] },
  },
  markers: { 'telamon-clusium': { lnglat: [11.95, 43.02], icon: 'castle', label: 'Clusium', note: 'The Gauls meet the border army' } },
  show: ['ariminum-225', 'pisae-225', 'rome-225'],
});

// --- the fight for the hill ---
writePlan(`${G}/020-telamon-hill`, {
  bbox,
  emblem: {
    works: wagons,
    units: [
      ...gauls(), n(unit('gauls', 'cavalry', 950, 1500, 600, 200, TO_REGULUS), 'gallic-cavalry', 'Gallic cavalry, sent to take the hill'),
      n(unit('gauls', 'infantry', -700, 2050, 320, 120, TO_PAPUS), 'plunder', 'Guard over the plunder on a second hill'),
      n(unit('rome', 'infantry', 2700, 0, 2600, 350, TO_PAPUS), 'regulus-legions', 'Legions of Regulus’s army'),
      n(unit('rome', 'light', 2350, 0, 2400, 70, TO_PAPUS), 'regulus-velites', 'Velites of Regulus’s army'),
      n(unit('rome', 'cavalry', 1650, 1900, 550, 200, f.face(200)), 'regulus-cavalry', 'Regulus with his cavalry on the hill'),
      n(unit('rome', 'infantry', -2800, 0, 2600, 350, TO_REGULUS), 'papus-legions', 'Legions of Papus’s army'),
      n(unit('rome', 'light', -2450, 0, 2400, 70, TO_REGULUS), 'papus-velites', 'Velites of Papus’s army'),
    ],
    arrows: [n(arrow('rome', [[2500, 1100], [2100, 1600], [1800, 1850]], 120), 'regulus-ride', 'Regulus leads his cavalry to the hill'),
      n(arrow('rome', [[-2600, 1300], [-1500, 2900], [500, 2950], [1150, 2150]], 120), 'papus-cavalry', 'Papus sends his cavalry to help on the hill')],
    clashes: [{ at: P(1300, 1720), size: 200 }],
  },
  markers: {
    'telamon-hill-regulus': mark(2300, 2500, 'Regulus', 'Killed in the fight for the hill', 'rome', 'skull'),
    'telamon-hill-papus': mark(-2800, -900, 'Papus', 'Sends his cavalry to the hill', 'rome'),
    'telamon-hill-boii': mark(900, -950, 'Boii and Taurisci', 'Face Regulus', 'gauls', 'swords'),
    'telamon-hill-gaesatae': mark(-950, -950, 'Gaesatae and Insubres', 'Face Papus', 'gauls', 'swords'),
    'telamon-hill-booty': mark(-700, 2450, 'The Gauls’ booty', 'Under a small guard on a nearby hill', 'gauls', 'coins'),
  },
});

// --- the velites against the Gaesatae ---
writePlan(`${G}/030-telamon-velites`, {
  bbox,
  emblem: {
    works: wagons,
    units: [
      ...gauls(), n(unit('gauls', 'infantry', -700, 2050, 320, 120, TO_PAPUS), 'plunder', 'Guard over the plunder on a second hill'),
      n(unit('rome', 'infantry', 2150, 0, 2600, 350, TO_PAPUS), 'regulus-legions', 'Legions of Regulus’s army'),
      n(unit('rome', 'light', 1450, 0, 2400, 70, TO_PAPUS), 'regulus-velites', 'Velites of Regulus’s army'),
      n(unit('rome', 'infantry', -2250, 0, 2600, 350, TO_REGULUS), 'papus-legions', 'Legions of Papus’s army'),
      n(unit('rome', 'light', -1550, 0, 2400, 70, TO_REGULUS), 'papus-velites', 'Velites of Papus’s army'),
      n(unit('rome', 'cavalry', 1350, 1850, 750, 220, f.face(205)), 'roman-cavalry', 'Roman cavalry holding the hill'),
    ],
    arrows: [
      n(arrow('rome', [[1400, -650], [700, -650]], 90), 'javelins', 'The velites throw their javelins'),
      n(arrow('rome', [[1400, 650], [700, 650]], 90), 'javelins', 'The velites throw their javelins'),
      n(arrow('rome', [[-1500, 650], [-800, 650]], 90), 'javelins', 'The velites throw their javelins'),
      n(arrow('gauls', [[-560, -650], [-1250, -650]], 110), 'gaesatae-charge', 'The Gaesatae rush out at the velites'),
      n(arrow('gauls', [[950, 1550], [500, 2400], [100, 3100]], 100, 'dashed'), 'gallic-cavalry-flight', 'The Gallic cavalry is driven from the hill'),
    ],
    clashes: [{ at: P(-1380, -650), size: 160 }],
  },
  markers: {
    'telamon-velites-velites': mark(1500, -1500, 'Velites', 'Javelins on both fronts', 'rome', 'swords'),
    'telamon-velites-gaesatae': mark(-1000, -1250, 'Gaesatae', 'Rush out and are cut down', 'gauls', 'skull'),
    'telamon-velites-cavalry': mark(2400, 2350, 'Roman cavalry', 'Hold the hill', 'rome', 'swords'),
    'telamon-velites-gallic-horse': mark(100, 3150, 'Gallic cavalry', 'Driven off', 'gauls', 'skull'),
  },
});

// --- the infantry fight and the cavalry charge down from the hill ---
writePlan(`${G}/040-telamon-charge`, {
  bbox,
  emblem: {
    works: wagons,
    units: [
      ...gauls(2200),
      n(unit('rome', 'infantry', 765, 0, 2600, 350, TO_PAPUS), 'regulus-legions', 'Legions of Regulus’s army, hastati relieved by the principes'),
      n(unit('rome', 'infantry', -765, 0, 2600, 350, TO_REGULUS), 'papus-legions', 'Legions of Papus’s army'),
      n(unit('rome', 'cavalry', 450, 2250, 900, 220, f.face(270)), 'roman-cavalry', 'Roman cavalry, charging down from the hill'),
    ],
    arrows: [n(arrow('rome', [[150, 2120], [100, 1270]], 150), 'cavalry-charge', 'The cavalry charges into the Gallic flank'),
      n(arrow('rome', [[750, 2120], [550, 1270]], 150), 'cavalry-charge', 'The cavalry charges into the Gallic flank')],
    clashes: [P(560, -600), P(-560, 600), { at: P(300, 1200), size: 190 }],
  },
  markers: {
    'telamon-charge-principes': mark(1300, -1700, 'Principes', 'Relieve the hastati', 'rome', 'swords'),
    'telamon-charge-cavalry': mark(1500, 2650, 'Roman cavalry', 'Charge from the hill', 'rome', 'swords'),
    'telamon-charge-gauls': mark(0, -1900, 'Gauls', '40,000 killed, 10,000 captured', 'gauls', 'skull'),
    'telamon-charge-concolitanus': mark(-1300, 1500, 'Concolitanus', 'Taken prisoner', 'gauls'),
  },
});

console.log('telamon: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 0)));
