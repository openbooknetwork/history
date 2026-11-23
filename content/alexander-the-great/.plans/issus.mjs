// Issus, November 333 BC, in Arrian's sequence with Bosworth's reading where Arrian is silent (.plan/battles/issus.md).
// The Pinarus is not located (040.5). By the cloud ruling the field is drawn at the Kuru Çay, Bosworth's suggestion,
// 4 km from the sea to the foothills of the Amanus; every place here is a reconstruction relative to the river, the
// sea and the hills, which the sources do give.
// Frame: origin at the river mouth on the coast harita draws; u inland along the river (bearing 80), w from the river
// towards the Macedonians (bearing 170, south). The Persians stand on the north bank and face south.
// Darius stands left of centre (Bosworth after Curtius), a reconstruction; Arrian's centre goes in the text's note.
// Darius's flight is drawn only as far as both accounts agree: his guard breaks and he flees.
import { frame, writePlan } from './lib.mjs';

const f = frame([36.2015, 36.7795], 80), P = f.p, NORTH = f.face(270), SOUTH = f.face(90);
const G = 'pages/040-issus-and-the-coast/020-issus';
const river = { path: f.path([[0, 0], [1000, 30], [2000, -20], [3000, 40], [4000, 0], [4800, -150]]), width: 40, id: 'pinarus', name: 'The Pinarus, drawn at the Kuru Çay; its site is not known' };
const bbox = f.box([[-300, -3100], [5300, 1900]], 0);

const persian = side => side === 'persia';
const unit = (side, type, u, w, width, depth, id, name, extra = {}) =>
  ({ side, type, at: P(u, w), width, depth, facing: persian(side) ? SOUTH : NORTH, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

const N = {
  m1: 'Thessalian cavalry, sent behind the phalanx to the left',
  m2: 'Allied Greek cavalry, the Peloponnesians and the rest',
  m3: 'Phalanx, left half: the battalions of Amyntas, son of Andromenes, Ptolemy, son of Seleucus, and Meleager, under Craterus',
  m4: 'Phalanx, right half: the battalions of Perdiccas and Coenus, and the hypaspists under Nicanor, son of Parmenion',
  m5: 'Companion cavalry under Alexander',
  m6: 'Lancers, Paeonians, archers and Agrianians, with Greek mercenaries',
  m8: 'Greek mercenaries in Alexander’s pay, the reserve line',
  p1: 'Persian cavalry of the right under Nabarzanes, most of 30,000 horse (Arrian)',
  p2: 'Cardaces, Persian heavy infantry, part of 60,000 (Arrian)',
  p3: 'Greek mercenaries in Persian pay, 30,000 (Arrian, Callisthenes, Curtius)',
  p4: 'Darius III with his guard',
  p5: 'Persian infantry of the left, 20,000 (Arrian, Curtius)',
  p6: 'Persian troops on the hill behind Alexander’s right',
  p7: 'The rest of Darius’s army, massed by peoples behind the line',
  p8: 'Darius’s camp',
};

// Persian blocks that stand through phases 1 and 2
const levy = unit('persia', 'infantry', 2000, -1150, 2600, 600, 'levy', N.p7);
const reserve = (w, width) => unit('macedon', 'infantry', 1900, w, width, 200, 'reserve', N.m8);

// --- phase 1: the lines on the Pinarus ---
writePlan(`${G}/020-issus-lines`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    water: [river],
    units: [
      unit('thessaly', 'cavalry', 280, 750, 460, 250, 'thessalians', N.m1),
      unit('macedon', 'cavalry', 790, 750, 360, 200, 'allied-cavalry', N.m2),
      unit('macedon', 'pikes', 1540, 700, 900, 200, 'phalanx-left', N.m3),
      unit('macedon', 'pikes', 2550, 700, 900, 200, 'phalanx-right', N.m4),
      unit('macedon', 'cavalry', 3400, 750, 600, 250, 'companions', N.m5),
      unit('macedon', 'light', 4100, 650, 600, 100, 'light-troops', N.m6),
      reserve(1200, 1400),
      unit('persia', 'knights', 650, -450, 1300, 500, 'persian-cavalry', N.p1),
      unit('persia', 'pikes', 2150, -250, 1000, 250, 'persian-mercenaries', N.p3),
      unit('persia', 'infantry', 3100, -250, 700, 250, 'cardaces', N.p2),
      unit('persia', 'cavalry', 2950, -650, 500, 200, 'darius-guard', N.p4),
      unit('persia', 'infantry', 4000, -250, 900, 250, 'persian-left', N.p5, { bow: -200 }),
      unit('persia', 'light', 5100, 1700, 500, 150, 'hill-force', N.p6, { facing: f.face(180) }),
      levy,
    ],
    arrows: [
      arrow('persia', [[1900, 400], [1500, 150], [900, -280]], 140, 'persian-cavalry-recall', 'The Persian cavalry is recalled across the river and massed by the sea'),
      arrow('persia', [[3950, -480], [2500, -800], [1350, -650]], 120, 'persian-cavalry-recall', 'The Persian cavalry is recalled across the river and massed by the sea'),
      arrow('thessaly', [[3400, 1300], [2000, 1500], [600, 1250], [320, 900]], 130, 'thessalians-shift', 'The Thessalians ride behind the phalanx to the left'),
      arrow('macedon', [[2600, 1250], [3700, 1000], [4100, 720]], 110, 'right-extended', 'Archers, Agrianians and mercenaries extend the right'),
      arrow('macedon', [[4150, 850], [4600, 1300], [5000, 1640]], 110, 'hill-attack', 'Agrianians and archers drive the troops on the hill up the slope'),
    ],
  },
  markers: {
    'issus-lines-alexander': mark(3400, 1050, 'Alexander', 'The Companions, on the right', 'macedon'),
    'issus-lines-parmenion': mark(550, 1100, 'Parmenion', 'Commands the left, by the sea', 'macedon'),
    'issus-lines-craterus': mark(1540, 950, 'Craterus', 'The infantry of the left', 'macedon'),
    'issus-lines-darius': mark(2950, -900, 'Darius III', 'With his guard', 'persia'),
    'issus-lines-nabarzanes': mark(650, -900, 'Nabarzanes', 'The cavalry by the sea', 'persia'),
    'issus-lines-flank-guard': mark(4500, 1250, '300 horsemen', 'Watch the hill', 'macedon', 'swords'),
  },
});

// --- phase 2: the charge across the river ---
writePlan(`${G}/030-issus-river`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    water: [river],
    units: [
      unit('thessaly', 'cavalry', 280, 720, 460, 250, 'thessalians', `${N.m1}, forced back across the river`),
      unit('macedon', 'cavalry', 790, 720, 360, 200, 'allied-cavalry', N.m2),
      unit('macedon', 'pikes', 1450, 120, 900, 200, 'phalanx-left', `${N.m3}, held in the stream bed`),
      unit('macedon', 'pikes', 2550, 80, 900, 200, 'phalanx-right', N.m4, { facing: f.face(260) }),
      unit('macedon', 'cavalry', 3500, -500, 600, 250, 'companions', N.m5, { facing: f.face(240) }),
      unit('macedon', 'light', 4250, -350, 600, 100, 'light-troops', N.m6, { facing: f.face(220) }),
      reserve(1200, 1200),
      unit('persia', 'knights', 500, 350, 1100, 400, 'persian-cavalry', `${N.p1}, charging across the river`),
      unit('persia', 'pikes', 2000, -200, 1100, 250, 'persian-mercenaries', N.p3),
      unit('persia', 'infantry', 2950, -350, 500, 250, 'cardaces', N.p2, { facing: f.face(70) }),
      unit('persia', 'cavalry', 2950, -700, 500, 200, 'darius-guard', N.p4, { facing: f.face(70) }),
      unit('persia', 'infantry', 4500, -1200, 600, 300, 'persian-left', `${N.p5}, routed`, { facing: f.face(310) }),
      levy,
    ],
    arrows: [
      arrow('macedon', [[3400, 620], [3400, 0], [3480, -350]], 150, 'alexander-charge', 'Alexander charges across the river at the Persian left'),
      arrow('macedon', [[1450, 650], [1450, 260]], 200, 'phalanx-advance', 'The phalanx advances into the steep stream bed'),
      arrow('persia', [[2050, -300], [2000, 60]], 130, 'mercenaries-attack', 'The Greek mercenaries strike the gap in the phalanx'),
      arrow('persia', [[650, -450], [500, 0], [400, 580]], 160, 'cavalry-crossing', 'The Persian cavalry crosses against the Thessalians'),
      arrow('persia', [[4000, -250], [4350, -700], [4450, -1050]], 110, 'persian-left-flight', 'The Persian left breaks and flees', 'dashed'),
    ],
    clashes: [P(3180, -400), P(2000, 20), P(450, 585)],
  },
  markers: {
    'issus-river-alexander': mark(3900, -800, 'Alexander', 'Across the river, pushing left', 'macedon'),
    'issus-river-parmenion': mark(550, 1050, 'Parmenion', 'The left, hard pressed', 'macedon'),
    'issus-river-darius': mark(2450, -700, 'Darius III', 'With his guard', 'persia'),
    'issus-river-ptolemy': mark(2000, 380, 'Ptolemy, son of Seleucus', 'Falls with about 120 others', 'macedon', 'skull'),
  },
});

// --- phase 3: Darius flees ---
writePlan(`${G}/040-issus-rout`, {
  bbox,
  emblem: {
    kind: 'battle-plan',
    water: [river],
    units: [
      unit('thessaly', 'cavalry', 550, -2400, 500, 250, 'thessalians', `${N.m1}, in pursuit`),
      unit('macedon', 'cavalry', 1000, -1300, 400, 200, 'allied-cavalry', N.m2),
      unit('macedon', 'pikes', 1500, -250, 1000, 200, 'phalanx-left', N.m3),
      unit('macedon', 'pikes', 2250, -1600, 500, 200, 'phalanx-right', `${N.m4}, on the mercenaries’ flank`, { facing: f.face(180) }),
      unit('macedon', 'cavalry', 3600, -2200, 500, 250, 'companions', `${N.m5}, in pursuit of Darius`),
      unit('macedon', 'light', 3800, -900, 600, 100, 'light-troops', N.m6),
      reserve(900, 1200),
      unit('persia', 'knights', 500, -2900, 1000, 400, 'persian-cavalry', `${N.p1}, in flight`, { facing: NORTH }),
      unit('persia', 'pikes', 1700, -1600, 700, 250, 'persian-mercenaries', `${N.p3}, withdrawing`, { facing: NORTH }),
      unit('persia', 'infantry', 2300, -2700, 2400, 500, 'levy', `${N.p7}, in flight`, { facing: NORTH }),
      unit('persia', 'camp', 2700, -1800, 500, 400, 'camp', N.p8),
    ],
    arrows: [
      arrow('persia', [[2950, -700], [3150, -1800], [3500, -3100]], 120, 'darius-flight', 'Darius flees', 'dashed'),
      arrow('macedon', [[3200, -400], [2700, -800], [2380, -1450]], 150, 'right-wheel', 'The right wheels onto the flank of the Greek mercenaries and drives them from the river'),
      arrow('persia', [[550, 300], [800, -1500], [600, -2650]], 150, 'persian-cavalry-rout', 'The Persian cavalry breaks and flees', 'dashed'),
      arrow('thessaly', [[250, 650], [350, -1000], [500, -2250]], 130, 'thessalian-pursuit', 'The Thessalians pursue the Persian cavalry'),
      arrow('macedon', [[3250, -650], [3450, -1500], [3600, -2050]], 130, 'alexander-pursuit', 'Alexander pursues Darius until nightfall'),
    ],
    clashes: [P(2100, -1600), P(550, -2600)],
  },
  markers: {
    'issus-rout-alexander': mark(4100, -2200, 'Alexander', 'Pursues Darius until nightfall', 'macedon'),
    'issus-rout-darius': mark(3500, -3100, 'Darius III', 'Flees on horseback', 'persia'),
    'issus-rout-guard': mark(2950, -700, 'Darius’s guard', 'Falls about the king', 'persia', 'skull'),
    'issus-rout-camp': mark(2700, -1400, 'Darius’s camp', 'Taken at the first assault', 'persia', 'flag'),
    'issus-rout-parmenion': mark(100, -2400, 'Parmenion', 'The Thessalians pursue', 'macedon'),
  },
});

console.log('issus: bbox', JSON.stringify(bbox), 'mouth', JSON.stringify(P(0, 0)), 'camp', JSON.stringify(P(2600, -1800)));
