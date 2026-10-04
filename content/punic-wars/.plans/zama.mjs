// Zama, October 202 BC, on a plain near Zama in the interior. The exact site is disputed.
// Frame: origin at the article's coordinates, u north along the lines, w east from Scipio towards Hannibal.
// Each Roman line is drawn as six blocks with the principes straight behind the hastati, leaving lanes.
import { frame, writePlan } from './lib.mjs';

const f = frame([9.4492, 36.2989], 0), P = f.p, ROME = f.face(90), CARTH = f.face(270);
const G = 'pages/040-second-war/030-scipio/030-zama';
const bbox = f.box([[-2900, -2600], [2900, 2400]], 0);
const unit = (side, type, u, w, width, depth, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'carthage' ? CARTH : ROME, ...extra });
const arrow = (side, pts, width = 90, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
// six blocks across a front of 2,000 m, with lanes of about 125 m between them
const lanes = [-875, -525, -175, 175, 525, 875];
const line = (w, id, name) => lanes.map(u => unit('rome', 'infantry', u, w, 230, 90, { id, name }));

// --- overview: Hannibal's return, the march inland, Masinissa's arrival ---
writePlan(`${G}/010-zama`, {
  bbox: [6.3, 35.0, 17.6, 39.9],
  routes: {
    'hannibal-203': { name: 'Hannibal sails from Croton to Leptis Minor, 203 BC', path: [[17.13, 39.08], [16.2, 38.4], [14.8, 37.3], [13.0, 36.55], [11.6, 35.95], [10.86, 35.68]] },
    'hannibal-202': { name: 'Hannibal marches inland from Hadrumetum, 202 BC', path: [[10.64, 35.83], [10.25, 35.95], [9.85, 36.12], [9.47, 36.31]] },
    'masinissa-202': { name: 'Masinissa joins Scipio with 10,000 Numidians', path: [[6.61, 36.36], [7.4, 36.38], [8.3, 36.34], [9.0, 36.3], [9.41, 36.29]] },
  },
  show: ['hadrumetum-203'],
});

// --- the armies deploy ---
const carthLines = (w1, w2, w3, l3 = 2600) => [
  unit('carthage', 'infantry', 0, w1, 2200, 150, { id: 'first-line', name: 'First line: 12,000 mercenaries, Ligurians, Gauls, Balearic slingers and Moors' }),
  unit('carthage', 'infantry', 0, w2, 2200, 150, { id: 'second-line', name: 'Second line: Carthaginian and African levies' }),
  unit('carthage', 'infantry', 0, w3, l3, 200, { id: 'veterans', name: 'Third line: Hannibal’s veterans from Italy' }),
];
writePlan(`${G}/020-zama-deployment`, {
  bbox,
  emblem: {
    units: [
      ...line(-560, 'hastati', 'Hastati, maniples in columns with open lanes'), ...line(-700, 'principes', 'Principes straight behind the hastati'), unit('rome', 'infantry', 0, -860, 2000, 110, { id: 'triarii', name: 'Triarii' }), unit('rome', 'light', 0, -440, 2000, 60, { id: 'velites', name: 'Velites in the lanes' }),
      unit('numidia', 'cavalry', -1650, -620, 700, 200, { id: 'masinissa', name: 'Masinissa’s 4,000 Numidian horsemen' }), unit('rome', 'cavalry', 1600, -620, 450, 180, { id: 'laelius', name: 'Laelius with 1,500 Roman and Italian cavalry' }),
      unit('carthage', 'elephants', 0, 330, 2200, 80, { count: 20, id: 'elephants', name: '80 elephants, about 30 m apart' }), unit('carthage', 'light', 0, 430, 2200, 60, { id: 'skirmishers', name: 'Carthaginian skirmishers' }),
      ...carthLines(560, 760, 1060), unit('carthage', 'cavalry', -1650, 600, 650, 200, { id: 'numidian-cavalry', name: 'Hannibal’s Numidian cavalry, facing Masinissa' }), unit('carthage', 'cavalry', 1650, 600, 500, 180, { id: 'carth-cavalry', name: 'Carthaginian cavalry, facing Laelius' }),
    ],
  },
  markers: {
    'zama-deploy-scipio': mark(0, -1150, 'Scipio', 'Maniples in columns, open lanes', 'rome'),
    'zama-deploy-masinissa': mark(-1650, -950, 'Masinissa', '4,000 Numidian horse', 'numidia'),
    'zama-deploy-laelius': mark(1600, -950, 'Laelius', '1,500 Roman and Italian horse', 'rome'),
    'zama-deploy-elephants': mark(-1250, 120, 'Elephants', '80, about 30 m apart', 'carthage', 'swords'),
    'zama-deploy-lines': mark(1450, 950, 'First and second lines', 'Mercenaries, then Carthaginians', 'carthage', 'swords'),
    'zama-deploy-hannibal': mark(0, 1350, 'Hannibal', 'Veterans of Italy, third line', 'carthage'),
  },
});

// --- the elephants and the cavalry ---
writePlan(`${G}/030-zama-elephants`, {
  bbox,
  emblem: {
    units: [
      ...line(-560, 'hastati', 'Hastati, maniples in columns with open lanes'), ...line(-700, 'principes', 'Principes straight behind the hastati'), unit('rome', 'infantry', 0, -860, 2000, 110, { id: 'triarii', name: 'Triarii' }),
      unit('carthage', 'elephants', 350, -150, 900, 80, { count: 7, id: 'elephants', name: 'Elephants charging the Roman infantry' }),
      ...carthLines(300, 500, 1060),
      unit('numidia', 'cavalry', -1900, -100, 600, 200, { facing: 135, id: 'masinissa', name: 'Masinissa charges the disordered Numidians' }), unit('rome', 'cavalry', 1850, -100, 450, 180, { facing: 45, id: 'laelius', name: 'Laelius charges the Carthaginian cavalry' }),
    ],
    arrows: [
      arrow('carthage', [[-350, -100], [-350, -620], [-350, -1150]], 70, undefined, { id: 'lanes', name: 'Elephants run down the lanes' }), arrow('carthage', [[700, -100], [700, -620], [700, -1150]], 70, undefined, { id: 'lanes', name: 'Elephants run down the lanes' }),
      arrow('carthage', [[-800, 100], [-1250, 350], [-1700, 700]], 80, 'dashed', { id: 'elephants-turn', name: 'Elephants turn back through their own cavalry' }),
      arrow('numidia', [[-1850, 150], [-1950, 800], [-2200, 1800]], 110, undefined, { id: 'masinissa-pursuit', name: 'Masinissa drives the Numidian horse from the field' }), arrow('rome', [[1800, 150], [1950, 800], [2200, 1800]], 100, undefined, { id: 'laelius-pursuit', name: 'Laelius sweeps the Carthaginian cavalry away' }),
    ],
    clashes: [P(-875, -480), P(1650, -350)],
  },
  markers: {
    'zama-elephants-lanes': mark(350, -1350, 'Elephants', 'Run down the lanes', 'carthage', 'swords'),
    'zama-elephants-masinissa': mark(-2300, 1250, 'Masinissa', 'Routs the Carthaginian Numidians', 'numidia'),
    'zama-elephants-laelius': mark(2300, 1250, 'Laelius', 'Sweeps the cavalry from the field', 'rome'),
    'zama-elephants-velites': mark(-1300, -1050, 'Velites', 'Javelins at the flanks', 'rome', 'swords'),
  },
});

// --- the first two lines ---
writePlan(`${G}/040-zama-lines`, {
  bbox,
  emblem: {
    units: [
      unit('rome', 'infantry', 0, -80, 2000, 100, { id: 'hastati', name: 'Hastati against the Carthaginian lines' }), unit('rome', 'infantry', 0, -240, 2000, 100, { id: 'principes', name: 'Principes, sent in behind the hastati' }), unit('rome', 'infantry', 0, -560, 2000, 110, { id: 'triarii', name: 'Triarii' }),
      unit('carthage', 'infantry', 0, 90, 2100, 150, { id: 'second-line', name: 'Second line: Carthaginian and African levies' }), unit('carthage', 'infantry', 0, 1060, 2600, 200, { id: 'veterans', name: 'Hannibal’s veterans, waiting fresh' }),
    ],
    arrows: [
      arrow('carthage', [[-900, -40], [-1250, 150], [-1450, 750]], 90, 'dashed', { id: 'first-line-flight', name: 'The broken first line escapes round the second' }), arrow('carthage', [[900, -40], [1250, 150], [1450, 750]], 90, 'dashed', { id: 'first-line-flight', name: 'The broken first line escapes round the second' }),
    ],
    clashes: [P(-600, 5), P(0, 5), P(600, 5)],
  },
  markers: {
    'zama-lines-first': mark(-1700, 900, 'First line', 'Barred by the second, flees round it', 'carthage', 'skull'),
    'zama-lines-second': mark(1050, 380, 'Second line', 'Fights hard, then breaks', 'carthage', 'swords'),
    'zama-lines-principes': mark(-1350, -420, 'Principes', 'Sent in behind the hastati', 'rome', 'swords'),
    'zama-lines-hannibal': mark(0, 1350, 'Hannibal', 'Veterans wait in the third line', 'carthage'),
  },
});

// --- the last line and the return of the cavalry ---
writePlan(`${G}/050-zama-final`, {
  bbox,
  emblem: {
    units: [
      unit('rome', 'infantry', -1350, 380, 1000, 160, { id: 'wings', name: 'Principes and triarii on the wings' }), unit('rome', 'infantry', 0, 380, 1600, 160, { id: 'hastati', name: 'Hastati in the centre' }), unit('rome', 'infantry', 1350, 380, 1000, 160, { id: 'wings', name: 'Principes and triarii on the wings' }),
      unit('carthage', 'infantry', 0, 640, 3600, 200, { id: 'veterans', name: 'Hannibal’s veterans and the men rallied from the first two lines' }),
    ],
    arrows: [
      arrow('numidia', [[-2600, 2300], [-1700, 1500], [-900, 800]], 120, undefined, { id: 'masinissa-return', name: 'Masinissa returns and charges the rear' }), arrow('rome', [[2600, 2300], [1700, 1500], [900, 800]], 120, undefined, { id: 'laelius-return', name: 'Laelius returns and charges the rear' }),
      arrow('carthage', [[200, 1000], [700, 1600], [1300, 2300]], 70, 'dashed', { id: 'hannibal-escape', name: 'Hannibal escapes with a few horsemen' }),
    ],
    clashes: [P(-1100, 500), P(500, 500), P(-800, 760), P(800, 760)],
  },
  markers: {
    'zama-final-romans': mark(0, -100, 'Scipio', 'One long line, hastati in the centre', 'rome'),
    'zama-final-masinissa': mark(-2350, 1700, 'Masinissa', 'Returns and charges the rear', 'numidia'),
    'zama-final-laelius': mark(2350, 1700, 'Laelius', 'Returns and charges the rear', 'rome'),
    'zama-final-hannibal': mark(1500, 2050, 'Hannibal', 'Escapes with a few horsemen', 'carthage'),
  },
});

// --- the peace of 201 BC ---
writePlan(`${G}/060-zama-peace`, {
  bbox: [8.6, 35.4, 11.0, 37.2],
  routes: {
    'hannibal-escape-202': { name: 'Hannibal escapes to Hadrumetum', style: 'dashed', path: [[9.47, 36.3], [9.85, 36.12], [10.25, 35.95], [10.62, 35.84]] },
    'scipio-tunis-202': { name: 'Scipio returns to Tunis', path: [[9.43, 36.31], [9.65, 36.5], [9.95, 36.68], [10.17, 36.79]] },
  },
  markers: {
    'zama-peace-field': { lnglat: P(0, 600), icon: 'skull', color: 'carthage', label: 'Zama', note: 'Polybius: 20,000 dead, 20,000 captured' },
  },
  show: ['hadrumetum-203', 'carthage-201', 'tunis-203'],
});

console.log('zama written, battle at', JSON.stringify(P(0, 0)), 'bbox', JSON.stringify(bbox));
