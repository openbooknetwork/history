// Zaculeu, 1525. Gonzalo de Alvarado beats a Mam army near Malacatán, then besieges Kayb'il B'alam in Zaculeu, a
// plateau with the Selegua below it on the west, ravines on the south and east and a neck of land on the north.
// The site is placed from the Zaculeu article's coordinates; the river is traced from the elevation tiles, which are
// too coarse for the ravines, so these are drawn on the sides the article names. The Malacatán field is the valley
// below the town, where the sources say only "the plain"; the plan puts it 0.8 km east of the town.
// The river and ravines are [lon, lat]; units, arrows and markers are metres north and east of a frame origin, drawn
// larger than real as the README's "Drawn size" asks. Facings are compass bearings.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/080-guatemala/060-zaculeu';
const SITE = [-91.4927, 15.3338];

const selegua = { path: [[-91.4967, 15.3574], [-91.4952, 15.3538], [-91.4929, 15.3502], [-91.4914, 15.3465], [-91.4885, 15.3429], [-91.4899, 15.3393], [-91.4937, 15.3364], [-91.4974, 15.3342], [-91.4998, 15.3322], [-91.5022, 15.3312], [-91.5045, 15.3306]], width: 30, id: 'selegua', name: 'The Selegua River' };
const ground = [
  { side: 'neutral', path: [[-91.4972, 15.3337], [-91.4952, 15.3326], [-91.4925, 15.3317], [-91.4897, 15.3323]], width: 45, style: 'trench', id: 'ravines', name: 'Deep ravines on the south and east of Zaculeu' },
  { side: 'neutral', path: [[-91.4897, 15.3323], [-91.4893, 15.3343], [-91.4903, 15.3362]], width: 45, style: 'trench', id: 'ravines', name: 'Deep ravines on the south and east of Zaculeu' },
  { side: 'highland', path: [[-91.4939, 15.3356], [-91.4917, 15.3357]], width: 25, style: 'wall', id: 'north-wall', name: 'Fortified structure across three quarters of the northern neck' },
  { side: 'highland', path: [[-91.4943, 15.3361], [-91.4912, 15.3362]], width: 20, style: 'trench', id: 'north-ditch', name: 'Walls and ditches on the northern approach' },
];

const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
// z.p(north, east) in metres from the centre of Zaculeu, m.p from Malacatán
const z = frame(SITE, 0), Z = z.p, ZP = z.path;
const m = frame([-91.5, 15.233], 0), M = m.p, MP = m.path;
const siegeBox = z.box([[-250, -950], [1850, 1150]], 0);

// --- overview: the march from Tecpán by Totonicapán and Momostenango ---
writePlan(`${G}/010-zaculeu`, {
  routes: {
    'gonzalo-alvarado-1525': {
      name: 'Gonzalo de Alvarado’s march from Tecpán to Zaculeu, July 1525',
      path: [[-90.994, 14.763], [-91.06, 14.78], [-91.12, 14.8], [-91.19, 14.83], [-91.25, 14.86], [-91.31, 14.89], [-91.361, 14.911], [-91.385, 14.96], [-91.4, 15.0], [-91.408, 15.044], [-91.43, 15.1], [-91.46, 15.16], [-91.475, 15.205], [-91.478, 15.234], [-91.49, 15.27], [-91.48, 15.3], [-91.471, 15.3197], [-91.4927, 15.3338]],
    },
  },
  markers: {
    'tecpan-1525': mark([-90.994, 14.763], 'Tecpán', 'Gonzalo de Alvarado sets out, July 1525', 'spain', 'flag'),
    'totonicapan-1525': mark([-91.361, 14.911], 'Totonicapán', 'Supply base', 'spain', 'flag'),
    'momostenango-1525': mark([-91.408, 15.044], 'Momostenango', 'Taken after a four-hour battle', 'spain', 'swords'),
    'malacatan-1525': mark([-91.5, 15.233], 'Malacatán', 'Mam army of 5,000 beaten', 'highland', 'swords'),
    'huehuetenango-1525': mark([-91.4709, 15.3197], 'Huehuetenango', 'Mam town of Xinabahul, found deserted', 'highland', 'landmark'),
  },
});

// --- the Mam army from Malacatán meets the Spanish in the valley below the town ---
writePlan(`${G}/020-zaculeu-malacatan`, {
  bbox: m.box([[-650, -200], [1150, 1600]], 0),
  emblem: {
    units: [
      unit('highland', 'infantry', M(55, 752), 600, 120, 75, 'mam', 'Mam army from Malacatán, 5,000 warriors in battle formation'),
      unit('spain', 'cavalry', M(155, 1122), 120, 40, 255, 'cavalry', 'Spanish cavalry, 40 horsemen under Gonzalo de Alvarado'),
      unit('spain', 'infantry', M(245, 1342), 90, 36, 255, 'infantry', 'Spanish infantry, 80 men'),
      unit('nahua', 'infantry', M(-35, 1422), 300, 80, 255, 'allies', "Mexican and K'iche' allies, about 2,000"),
    ],
    arrows: [
      arrow('highland', MP([[-10, 210], [10, 420], [15, 642]]), 34, 'mam-advance', 'The Mam advance across the plain'),
      arrow('spain', MP([[147, 1092], [73, 817]]), 30, 'charge', 'The Spanish cavalry charges and throws the Mam into disorder'),
      arrow('highland', MP([[355, 652], [705, 502], [905, 402]]), 34, 'mam-flight', 'The survivors flee to the hills', 'dashed'),
      arrow('spain', MP([[-300, 560], [-220, 330], [-70, 115]]), 30, 'to-town', 'Gonzalo de Alvarado enters Malacatán unopposed'),
    ],
    clashes: [{ at: M(110, 957), size: 52 }],
  },
  markers: {
    'zaculeu-malacatan-gonzalo': mark(M(440, 1060), 'Gonzalo de Alvarado', 'Kills Canil Acab with his lance', 'spain'),
    'zaculeu-malacatan-canil': mark(M(-380, 860), 'Canil Acab', 'Mam leader, killed', 'highland', 'skull'),
    'zaculeu-malacatan-town': mark(M(0, 0), 'Malacatán', 'Only the sick and elderly remain', 'highland', 'landmark'),
  },
});

// --- the assault on the northern entrance ---
writePlan(`${G}/030-zaculeu-assault`, {
  bbox: siegeBox,
  emblem: {
    water: [selegua],
    works: ground,
    units: [
      unit('highland', 'fort', SITE, 300, 300, 0, 'zaculeu', "Zaculeu, the fortress of Kayb'il B'alam"),
      unit('highland', 'infantry', Z(608, -54), 500, 100, 350, 'mam', 'Mam warriors holding the northern approaches, part of an army of about 6,000 from Huehuetenango, Zaculeu, Cuilco and Ixtahuacán'),
      unit('spain', 'infantry', Z(820, 0), 105, 42, 170, 'infantry', 'Spanish infantry, 80 men'),
      unit('spain', 'cavalry', Z(900, 420), 105, 42, 195, 'cavalry', 'Spanish cavalry, 40 horsemen'),
      unit('spain', 'cavalry', Z(900, -440), 105, 42, 160, 'cavalry', 'Spanish cavalry, 40 horsemen'),
      unit('nahua', 'infantry', Z(1105, 0), 420, 90, 175, 'allies', "Mexican and K'iche' allies, about 2,000"),
    ],
    arrows: [
      arrow('spain', ZP([[860, 400], [715, 200]]), 40, 'charges', 'Repeated charges of the Spanish cavalry'),
      arrow('spain', ZP([[860, -425], [640, -300]]), 40, 'charges', 'Repeated charges of the Spanish cavalry'),
      arrow('highland', ZP([[155, 54], [376, 97], [520, 64]]), 40, 'sortie', 'About 2,000 warriors come out of Zaculeu to reinforce them'),
      arrow('highland', ZP([[531, -193], [332, -268], [177, -161]]), 40, 'withdraw', "Kayb'il B'alam withdraws his army behind the walls", 'dashed'),
    ],
    clashes: [[733, 0], [640, 275], [600, -380]].map(([n, e]) => ({ at: Z(n, e), size: 60 })),
  },
  markers: {
    'zaculeu-assault-gonzalo': mark(Z(1150, 430), 'Gonzalo de Alvarado', 'Attacks the northern entrance', 'spain'),
    'zaculeu-assault-mam': mark(Z(560, -650), 'Mam warriors', 'Hold, then fall back', 'highland', 'swords'),
    'zaculeu-assault-kaybil': mark(Z(-133, 0), "Kayb'il B'alam", 'Withdraws behind the walls', 'highland'),
  },
});

// --- the siege, the relief army from the Cuchumatanes and the surrender ---
writePlan(`${G}/040-zaculeu-siege`, {
  bbox: siegeBox,
  emblem: {
    water: [selegua],
    works: ground,
    units: [
      unit('highland', 'fort', SITE, 300, 300, 0, 'zaculeu', 'Zaculeu under siege, its defenders starving'),
      unit('spain', 'camp', Z(741, 0), 220, 120, 180, 'siege', 'Spanish siege lines under Antonio de Salazar'),
      unit('nahua', 'infantry', Z(464, 451), 260, 70, 225, 'allies-siege', "Mexican and K'iche' allies on the siege lines"),
      unit('highland', 'irregular', Z(1549, 698), 900, 200, 205, 'relief', 'Mam relief army from the Cuchumatanes, about 8,000'),
      unit('spain', 'cavalry', Z(1151, 483), 120, 42, 25, 'cavalry', 'Spanish cavalry under Gonzalo de Alvarado'),
      unit('spain', 'infantry', Z(1180, 300), 160, 50, 25, 'foot', 'Spanish and allied foot soldiers'),
    ],
    arrows: [
      arrow('spain', ZP([[810, 50], [960, 150], [1140, 280]]), 40, 'march', 'Gonzalo de Alvarado marches north to meet the relief army'),
      arrow('spain', ZP([[1195, 505], [1465, 640]]), 40, 'charges', 'Repeated charges of the Spanish cavalry'),
      arrow('highland', ZP([[1660, 760], [1760, 840], [1830, 920]]), 50, 'relief-flight', 'The relief army breaks and is destroyed', 'dashed'),
    ],
    clashes: [[1321, 568], [1375, 391]].map(([n, e]) => ({ at: Z(n, e), size: 60 })),
  },
  markers: {
    'zaculeu-siege-salazar': mark(Z(818, -376), 'Antonio de Salazar', 'Holds the siege', 'spain'),
    'zaculeu-siege-gonzalo': mark(Z(1330, 30), 'Gonzalo de Alvarado', 'Breaks the relief army', 'spain'),
    'zaculeu-siege-kaybil': mark(Z(-133, 0), "Kayb'il B'alam", 'Surrenders in mid-October 1525', 'highland'),
  },
});

console.log('zaculeu-1525: siege bbox', JSON.stringify(siegeBox));
