// Xelajú, 12 and 18 February 1524. Alvarado climbs the Samalá gorge from Zunil to Cantel, meets the K'iche' on the
// Llanos de Urbina east of the river and crosses the valley to Xelajú. Six days later a second K'iche' army is
// beaten near Olintepeque. The fighting grounds follow local tradition (Cornejo Sam: the Llanos de Urbina near
// Cantel) and the common view (Olintepeque); the Samalá and the Xekik'el are traced from the elevation tiles.
// Rivers, walls and towns are [lon, lat]; units, arrows and other markers are metres in a frame per fight, drawn larger
// than real as the README's "Drawn size" asks. Olintepeque lies 5 km north of the 12 February fields, so it has its own view.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/080-guatemala/020-xelaju';

const samala = { path: [[-91.4568, 14.8851], [-91.4572, 14.8793], [-91.4624, 14.8706], [-91.4691, 14.8623], [-91.4747, 14.8536], [-91.4769, 14.8478], [-91.4785, 14.8431], [-91.4762, 14.8413], [-91.4702, 14.8409], [-91.4643, 14.8409], [-91.4617, 14.8352], [-91.4591, 14.8294], [-91.4557, 14.8236], [-91.4535, 14.8178], [-91.4539, 14.8149], [-91.4501, 14.8091], [-91.4542, 14.8033], [-91.4576, 14.7979], [-91.4635, 14.7975], [-91.4687, 14.7946], [-91.4728, 14.7903], [-91.4784, 14.7878], [-91.4843, 14.7859], [-91.4903, 14.7834], [-91.4925, 14.7783], [-91.4935, 14.7765]], width: 30, id: 'samala', name: 'The Samalá River' };
const xekikel = { path: [[-91.533, 14.8862], [-91.5244, 14.8851], [-91.5148, 14.8851], [-91.5059, 14.8847], [-91.4996, 14.8826], [-91.494, 14.8833], [-91.4929, 14.8757], [-91.4869, 14.8703], [-91.4884, 14.8616], [-91.4921, 14.8532], [-91.4951, 14.8507], [-91.4988, 14.8471], [-91.4996, 14.8442], [-91.497, 14.8424], [-91.494, 14.8438], [-91.4881, 14.8453], [-91.4851, 14.8471], [-91.4791, 14.8431], [-91.4762, 14.8413]], width: 18, id: 'xekikel', name: "The Xekik'el River, named for the blood of the battle" };
const water = [samala, xekikel];

// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
const UP_GORGE = 60; // the Samalá gorge climbs from Zunil north-east to Cantel
const XELAJU = [-91.518, 14.835];
const clash = (at, size) => ({ at, size });
// g.p(s, t): s up the gorge, t to its south-east side, from the Spanish cavalry in the pass
const g = frame([-91.4712, 14.7918], UP_GORGE), G1 = g.p, G1P = g.path;
// u.p(a, b) and o.p(a, b): a along the battle line to the west-north-west, b towards the K'iche'
const u = frame([-91.4424, 14.8314], 290), U = u.p, UP = u.path;
const o = frame([-91.5058, 14.8645], 290), O = o.p, OP = o.path;
const day1Box = [-91.5261, 14.7648, -91.4309, 14.8575];
const day2Box = [-91.5346, 14.8276, -91.4728, 14.8878];

// --- overview: Alvarado up the Samalá from Xetulul, the K'iche' army out of Q'umarkaj ---
writePlan(`${G}/010-xelaju`, {
  routes: {
    'alvarado-xelaju-1524': {
      name: 'Alvarado’s march from Xetulul up the Samalá to Xelajú, 9 – 12 February 1524',
      path: [[-91.52, 14.588], [-91.55, 14.61], [-91.578, 14.635], [-91.59, 14.647], [-91.57, 14.6505], [-91.552, 14.668], [-91.538, 14.676], [-91.53, 14.69], [-91.529, 14.708], [-91.522, 14.721], [-91.516, 14.734], [-91.507, 14.747], [-91.5, 14.762], [-91.4935, 14.776], [-91.4885, 14.7845], [-91.478, 14.788], [-91.467, 14.795], [-91.457, 14.799], [-91.451, 14.809], [-91.447, 14.822], [-91.452, 14.835], [-91.475, 14.842], [-91.5, 14.84], [-91.518, 14.835]],
    },
    'kiche-1524': {
      name: "The K'iche' army marches from Q'umarkaj by way of Tzijbachaj, February 1524",
      offset: 6,
      path: [[-91.172, 15.0235], [-91.21, 15.0], [-91.26, 14.97], [-91.31, 14.94], [-91.361, 14.911], [-91.4, 14.917], [-91.44, 14.918], [-91.465, 14.897], [-91.49, 14.88]],
    },
  },
  markers: {
    'zapotitlan-1524': mark([-91.52, 14.588], 'Xetulul', 'Taken on 8 February 1524', 'spain', 'flag'),
    'tzijbachaj-1524': mark([-91.361, 14.911], 'Tzijbachaj', 'Now Totonicapán', 'kiche', 'flag'),
    'qumarkaj-1524': mark([-91.172, 15.0235], "Q'umarkaj", "Capital of the K'iche' kingdom", 'kiche', 'landmark'),
  },
});

// --- 12 February: the ambush in the Samalá gorge between Zunil and Cantel ---
writePlan(`${G}/020-xelaju-pass`, {
  bbox: day1Box,
  emblem: {
    water,
    works: [{ side: 'kiche', path: [[-91.4664, 14.7975], [-91.4682, 14.7955], [-91.4697, 14.7938]], width: 110, style: 'trench', id: 'barricade', name: "K'iche' walls of stone slabs and ditches set with stakes, by the Título K'oyoi" }],
    units: [
      unit('kiche', 'archers', G1(150, -950), 510, 204, 140, 'kiche-ambush', "K'iche' warriors in ambush above the pass"),
      unit('kiche', 'infantry', G1(150, 950), 510, 204, 320, 'kiche-ambush', "K'iche' warriors in ambush above the pass"),
      unit('nahua', 'infantry', G1(-1250, -450), 510, 204, UP_GORGE, 'allies', 'Tlaxcalan, Cholulan and other Mexican allies, driven back down the road'),
      unit('spain', 'cavalry', G1(0, 0), 510, 204, UP_GORGE, 'cavalry', 'Spanish cavalry under Alvarado'),
      unit('spain', 'infantry', G1(-2200, 100), 510, 204, UP_GORGE, 'infantry', 'Spanish infantry, crossbowmen and musketeers'),
    ],
    arrows: [
      arrow('nahua', G1P([[-250, -450], [-700, -450], [-1130, -450]]), 120, 'allies-back', 'The Mexican allies are driven back down the road', 'dashed'),
      arrow('spain', G1P([[-2050, 150], [-1200, 200], [-130, 80]]), 130, 'charge', 'The Spanish cavalry charges up the pass'),
      arrow('kiche', G1P([[100, -1070], [0, -1400], [-50, -1700]]), 120, 'kiche-scatter', "The K'iche' scatter before the horses", 'dashed'),
      arrow('kiche', G1P([[200, 1070], [330, 1400], [450, 1700]]), 120, 'kiche-scatter', "The K'iche' scatter before the horses", 'dashed'),
    ],
    clashes: [clash(G1(100, -540), 280), clash(G1(100, 540), 280)],
  },
  markers: {
    'xelaju-pass-allies': mark(G1(-1900, -1840), 'Mexican allies', 'Ambushed and driven back', 'nahua', 'swords'),
    'xelaju-pass-alvarado': mark(G1(-1380, 860), 'Alvarado', 'Charges with the horsemen', 'spain'),
    'xelaju-pass-kiche': mark(G1(1700, -1000), "K'iche' warriors", 'Scattered by the cavalry', 'kiche', 'swords'),
    'xelaju-pass-xelaju': mark(XELAJU, 'Xelajú', "K'iche' town", 'kiche', 'landmark'),
  },
});

// --- 12 February: the K'iche' army on the Llanos de Urbina, by local tradition ---
writePlan(`${G}/030-xelaju-urbina`, {
  bbox: day1Box,
  emblem: {
    water,
    units: [
      unit('kiche', 'infantry', U(-70, 400), 1000, 220, 200, 'kiche-army', "K'iche' army under one of the four lords of Q'umarkaj"),
      unit('kiche', 'archers', U(0, 60), 900, 204, 200, 'kiche-archers', "K'iche' archers"),
      unit('spain', 'cavalry', U(0, -720), 510, 204, 20, 'cavalry', 'Spanish cavalry under Alvarado'),
      unit('spain', 'infantry', U(150, -1150), 510, 204, 20, 'infantry', 'Spanish infantry'),
      unit('nahua', 'infantry', U(750, -950), 510, 204, 20, 'allies', 'Mexican allies'),
    ],
    arrows: [
      arrow('spain', UP([[150, -610], [150, -50]]), 140, 'charge', "The Spanish wait until the K'iche' are within bowshot, then charge"),
      arrow('kiche', UP([[-300, 560], [-340, 1400], [-360, 2200]]), 150, 'kiche-flight', "The K'iche' army breaks and flees", 'dashed'),
      arrow('spain', [[-91.4542, 14.8278], [-91.4628, 14.8392], [-91.482, 14.8415], [-91.4985, 14.8395], [-91.5125, 14.8365]], 130, 'to-xelaju', 'The army crosses the valley to Xelajú and finds it deserted'),
    ],
    clashes: [clash(U(-250, -330), 280)],
  },
  markers: {
    'xelaju-urbina-alvarado': mark(U(-800, -1300), 'Alvarado', 'Charges at bowshot', 'spain'),
    'xelaju-urbina-tecun': mark(U(1100, 1390), 'Tecun Uman', 'Killed here, by local tradition', 'kiche', 'skull'),
    'xelaju-urbina-xelaju': mark(XELAJU, 'Xelajú', 'Found deserted', 'kiche', 'landmark'),
  },
});

// --- 18 February: the second K'iche' army is beaten near Olintepeque ---
writePlan(`${G}/040-xelaju-olintepeque`, {
  bbox: day2Box,
  emblem: {
    water,
    units: [
      unit('kiche', 'infantry', O(94, 1142), 1500, 260, 200, 'kiche-army', "K'iche' army from Q'umarkaj, 30,000 by a K'iche' account"),
      unit('spain', 'cavalry', O(0, 0), 335, 135, 20, 'cavalry', 'Spanish cavalry under Alvarado'),
      unit('spain', 'infantry', O(144, -500), 335, 135, 20, 'infantry', 'Spanish infantry'),
      unit('nahua', 'infantry', O(1300, -500), 420, 135, 20, 'allies', 'Mexican allies'),
      unit('nahua', 'infantry', O(-1150, 6), 420, 135, 20, 'allies', 'Mexican allies'),
    ],
    arrows: [
      arrow('spain', OP([[34, 100], [100, 1010]]), 150, 'charge', 'The Spanish cavalry charges'),
      arrow('nahua', OP([[1300, -400], [1200, 400], [880, 1100]]), 120, 'allies-advance', 'The Mexican allies attack the flank'),
      arrow('kiche', OP([[-210, 1310], [-600, 2200], [-1100, 2800]]), 180, 'kiche-flight', "The K'iche' break and flee, with many nobles among the dead", 'dashed'),
    ],
    clashes: [clash(O(-320, 810), 200), clash(O(1300, 1000), 200)],
  },
  markers: {
    'xelaju-olintepeque-alvarado': mark(O(-46, -1020), 'Alvarado', 'Spanish horse and foot', 'spain'),
    'xelaju-olintepeque-kiche': mark(O(-1547, 1227), "K'iche' army", 'Many nobles among the dead', 'kiche', 'skull'),
    'xelaju-olintepeque-town': mark([-91.514, 14.8862], 'Olintepeque', 'Renamed Xequiquel, "bathed in blood"', 'kiche', 'landmark'),
    'xelaju-olintepeque-xelaju': mark(XELAJU, 'Xelajú', "K'iche' town", 'kiche', 'landmark'),
  },
});

console.log('xelaju-1524: boxes', JSON.stringify(day1Box), JSON.stringify(day2Box));
