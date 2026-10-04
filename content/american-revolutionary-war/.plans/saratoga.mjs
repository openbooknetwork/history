// Saratoga: Freeman's Farm (19 September 1777), Bemis Heights (7 October) and the surrender at Saratoga (17 October).
// From the Battles of Saratoga article. The American works ran west from the Hudson bluff over Bemis Heights;
// Freeman's Farm lies about a mile to the north-west, the two redoubts on the right of the British camp beyond it.
import { writePlan } from './lib.mjs';

const GER = '#9c6b30';   // German troops in British service
const G = 'pages/020-war/030-1777';
const U = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const A = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const M = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, ...(color ? { color } : {}), label, note });

const hudson = { path: [[-73.572, 43.125], [-73.577, 43.1], [-73.585, 43.075], [-73.595, 43.05], [-73.607, 43.025], [-73.6145, 43.005], [-73.62, 42.985], [-73.625, 42.965]], width: 200, id: 'hudson', name: 'The Hudson River' };
const millCreek = { path: [[-73.662, 43.0067], [-73.648, 43.0054], [-73.635, 43.007], [-73.624, 43.008], [-73.6165, 43.0086]], width: 25, id: 'mill-creek', name: 'Mill Creek' };
const works = { side: 'usa', path: [[-73.6195, 43.0003], [-73.627, 43.0022], [-73.6335, 43.0038], [-73.6405, 43.0018], [-73.6445, 42.9975]], width: 45, id: 'american-works', name: 'The American fortifications on Bemis Heights' };
const redoubts = [
  { side: GER, path: [[-73.6522, 43.0188], [-73.6488, 43.0188], [-73.6488, 43.0212], [-73.6522, 43.0212], [-73.6522, 43.0188]], width: 35, id: 'breymann-redoubt', name: 'The Breymann redoubt' },
  { side: 'held', path: [[-73.6465, 43.0148], [-73.6418, 43.0148], [-73.6418, 43.0176], [-73.6465, 43.0176], [-73.6465, 43.0148]], width: 35, id: 'balcarres-redoubt', name: 'The Balcarres redoubt at Freeman’s Farm' },
];
const field = [-73.672, 42.992, -73.605, 43.04];

writePlan(`${G}/011-saratoga-advance`, {
  bbox: field,
  emblem: {
    water: [hudson, millCreek],
    works: [works],
    units: [
      U('held', 'infantry', [-73.6565, 43.0245], 500, 160, 200, 'fraser', 'Fraser’s right column: light infantry, grenadiers and the 24th Foot'),
      U('held', 'infantry', [-73.6405, 43.0215], 450, 160, 205, 'hamilton', 'Hamilton’s centre column: the 9th, 20th, 21st and 62nd Foot, with Burgoyne'),
      U(GER, 'infantry', [-73.6195, 43.0245], 300, 200, 190, 'riedesel', 'Riedesel’s left column: the Germans and the 47th Foot, with the guns and the boats'),
      U('usa', 'infantry', [-73.6245, 42.9995], 700, 160, 0, 'gates', 'Gates’s right wing behind the works'),
      U('usa', 'infantry', [-73.637, 43.0018], 700, 160, 0, 'arnold', 'Arnold’s left wing: Poor’s and Learned’s brigades'),
      U('usa', 'light', [-73.6438, 43.0128], 350, 60, 345, 'morgan', 'Morgan’s riflemen and Dearborn’s light infantry'),
    ],
    arrows: [
      A('held', [[-73.641, 43.0345], [-73.6545, 43.0305], [-73.6585, 43.0185]], 110, 'fraser-march', 'Fraser swings west to turn the American left'),
      A('held', [[-73.6285, 43.0305], [-73.6385, 43.0255], [-73.6425, 43.0175]], 110, 'hamilton-march', 'Hamilton’s column crosses a ravine towards the clearing'),
      A(GER, [[-73.6175, 43.0345], [-73.6185, 43.0295]], 100, 'riedesel-march', 'Riedesel on the river road, held up by obstacles'),
      A('usa', [[-73.6405, 43.004], [-73.6425, 43.0075], [-73.6436, 43.0112]], 90, 'morgan-advance', 'Morgan goes north to the clearing'),
    ],
    clashes: [[-73.6442, 43.0145]],
  },
  markers: {
    'saratoga-advance-burgoyne': M([-73.6325, 43.0265], 'Burgoyne', 'Three columns at 10 am', 'held'),
    'saratoga-advance-gates': M([-73.6245, 42.9955], 'Gates', 'Waits behind the works', 'usa'),
    'saratoga-advance-freeman': M([-73.6492, 43.0128], 'Freeman’s Farm', 'A Loyalist’s clearing', null, 'flag'),
  },
});

writePlan(`${G}/012-saratoga-freemans-farm`, {
  bbox: [-73.662, 43.002, -73.62, 43.026],
  emblem: {
    water: [hudson, millCreek],
    works: [works],
    units: [
      U('held', 'infantry', [-73.6463, 43.0152], 220, 60, 180, '21st', 'The 21st Foot, right of Hamilton’s line'),
      U('held', 'infantry', [-73.6436, 43.0155], 220, 60, 180, '62nd', 'The 62nd Foot, cut down to the size of a company'),
      U('held', 'infantry', [-73.6409, 43.0152], 220, 60, 180, '20th', 'The 20th Foot, brought in by Phillips'),
      U('held', 'infantry', [-73.6436, 43.0182], 220, 60, 180, '9th', 'The 9th Foot in reserve'),
      U('held', 'infantry', [-73.6545, 43.0172], 350, 90, 150, 'fraser', 'Fraser’s light infantry and grenadiers on the American left'),
      U('usa', 'light', [-73.6468, 43.0112], 300, 60, 0, 'morgan', 'Morgan’s riflemen, shooting down officers and gunners'),
      U('usa', 'infantry', [-73.6428, 43.0108], 280, 70, 0, 'new-hampshire', 'The 1st and 3rd New Hampshire'),
      U('usa', 'infantry', [-73.6385, 43.0112], 320, 70, 345, 'poor', 'Poor’s brigade: New York, the 1st Canadian and Connecticut militia'),
      U('usa', 'infantry', [-73.6525, 43.0118], 320, 70, 30, 'learned', 'Learned’s brigade, sent against Fraser'),
      U(GER, 'infantry', [-73.6358, 43.0142], 280, 80, 235, 'riedesel', 'Riedesel’s Germans strike the American right'),
    ],
    arrows: [
      A(GER, [[-73.6205, 43.0235], [-73.6295, 43.0185], [-73.6345, 43.0152]], 90, 'riedesel-march', 'Riedesel comes up from the river late in the afternoon'),
      A('usa', [[-73.6402, 43.0045], [-73.6418, 43.0085]], 70, 'reinforcements', 'Reinforcements from the works'),
    ],
    clashes: [[-73.6436, 43.0132], [-73.6372, 43.0128], [-73.6532, 43.0146]],
  },
  markers: {
    'saratoga-freemans-farm-phillips': M([-73.6385, 43.0172], 'Phillips', 'Rallies the 62nd', 'held'),
    'saratoga-freemans-farm-morgan': M([-73.6495, 43.0092], 'Morgan', 'Riflemen in the woods', 'usa'),
    'saratoga-freemans-farm-riedesel': M([-73.6312, 43.0128], 'Riedesel', 'Arrives from the river', 'held'),
  },
});

const bemis = [-73.67, 42.999, -73.635, 43.025];
writePlan(`${G}/013-saratoga-bemis-heights`, {
  bbox: bemis,
  emblem: {
    water: [millCreek],
    works: [works, ...redoubts],
    units: [
      U('held', 'infantry', [-73.6478, 43.0094], 320, 80, 180, 'grenadiers', 'British grenadiers under Acland, the left of the line'),
      U(GER, 'infantry', [-73.6518, 43.0098], 320, 80, 180, 'germans', 'German detachments in the centre'),
      U('held', 'infantry', [-73.6562, 43.0104], 360, 80, 190, 'fraser', 'Fraser’s light troops and the 24th Foot, the right'),
      U('held', 'light', [-73.6612, 43.0112], 260, 50, 210, 'canadians', 'Canadians and native warriors on the right flank'),
      U('usa', 'infantry', [-73.6468, 43.0042], 380, 90, 350, 'poor', 'Poor’s brigade holds its fire'),
      U('usa', 'infantry', [-73.6525, 43.0038], 420, 90, 0, 'learned', 'Learned’s brigade in the centre'),
      U('usa', 'light', [-73.6628, 43.0062], 320, 60, 40, 'morgan', 'Morgan’s riflemen on the far left'),
      U('usa', 'infantry', [-73.6525, 43.0008], 500, 90, 0, 'ten-broeck', 'Ten Broeck’s 1,200 New York militia in reserve'),
    ],
    arrows: [
      A('held', [[-73.6476, 43.0084], [-73.6472, 43.0058]], 45, 'acland-charge', 'Acland’s bayonet charge'),
      A('usa', [[-73.6462, 43.0051], [-73.6466, 43.0083]], 60, 'poor-attack', 'Poor’s men fire at close range and rout the grenadiers'),
      A('usa', [[-73.6618, 43.0078], [-73.6596, 43.0098], [-73.6575, 43.0103]], 60, 'morgan-attack', 'Morgan sweeps aside the Canadians and engages Fraser'),
    ],
    clashes: [[-73.6472, 43.0066], [-73.659, 43.0101]],
  },
  markers: {
    'saratoga-bemis-heights-acland': M([-73.6418, 43.0098], 'Acland', 'Shot in both legs, taken', 'held', 'skull'),
    'saratoga-bemis-heights-fraser': M([-73.6612, 43.0138], 'Fraser', 'Mortally wounded', 'held', 'skull'),
    'saratoga-bemis-heights-wheatfield': M([-73.6505, 43.0135], 'Barber’s wheat field', 'Burgoyne halts here', null, 'wheat'),
  },
});

writePlan(`${G}/014-saratoga-redoubts`, {
  bbox: bemis,
  emblem: {
    water: [millCreek],
    works: [works, ...redoubts],
    units: [
      U(GER, 'infantry', [-73.6505, 43.02], 220, 90, 225, 'breymann', 'Breymann’s 300 Germans'),
      U('held', 'infantry', [-73.6441, 43.0162], 300, 90, 200, 'balcarres', 'Balcarres’s light infantry, who hold their redoubt'),
      U('held', 'light', [-73.6472, 43.0182], 160, 40, 220, 'canadians', 'Canadians between the redoubts'),
      U('usa', 'infantry', [-73.6448, 43.0115], 380, 90, 10, 'poor', 'Poor’s brigade, led by Arnold against the Balcarres redoubt'),
      U('usa', 'infantry', [-73.6495, 43.0135], 380, 90, 340, 'learned', 'Learned’s brigade'),
      U('usa', 'light', [-73.6575, 43.0168], 300, 60, 40, 'morgan', 'Morgan’s riflemen'),
    ],
    arrows: [
      A('usa', [[-73.6448, 43.0124], [-73.6443, 43.0146]], 60, 'balcarres-attack', 'The attack on the Balcarres redoubt, beaten back'),
      A('usa', [[-73.6492, 43.0145], [-73.6478, 43.0185], [-73.6492, 43.0205]], 70, 'arnold-charge', 'Arnold leads Learned’s men through the gap into the rear of the Breymann redoubt'),
      A('usa', [[-73.6572, 43.0178], [-73.6552, 43.0215], [-73.6526, 43.0208]], 60, 'morgan-flank', 'Morgan’s riflemen come round the far side'),
    ],
    clashes: [[-73.6443, 43.0152], [-73.6503, 43.0199]],
  },
  markers: {
    'saratoga-redoubts-arnold': M([-73.6455, 43.0212], 'Arnold', 'Leg broken in the redoubt', 'usa', 'skull'),
    'saratoga-redoubts-breymann': M([-73.6548, 43.0238], 'Breymann', 'Killed', 'held', 'skull'),
    'saratoga-redoubts-balcarres': M([-73.6392, 43.0178], 'Balcarres', 'Holds his redoubt', 'held'),
  },
});

writePlan(`${G}/015-saratoga-surrender`, {
  bbox: [-73.68, 42.985, -73.555, 43.125],
  emblem: {
    water: [hudson, { path: [[-73.645, 43.114], [-73.625, 43.108], [-73.605, 43.102], [-73.59, 43.0995], [-73.5785, 43.0995]], width: 50, id: 'fish-creek', name: 'Fish Creek' }],
    works: [works],
    units: [
      U('held', 'camp', [-73.5885, 43.1055], 1300, 900, 180, 'burgoyne-camp', 'Burgoyne’s camp on the heights at Saratoga, about 6,000 men'),
      U('usa', 'infantry', [-73.5925, 43.0915], 1600, 220, 0, 'gates', 'Gates’s army south of Fish Creek'),
      U('usa', 'light', [-73.612, 43.111], 900, 80, 80, 'morgan', 'Morgan’s riflemen to the west'),
      U('usa', 'infantry', [-73.5675, 43.0995], 1100, 160, 290, 'east-bank', 'American troops on the east bank of the Hudson'),
    ],
    arrows: [
      A('held', [[-73.629, 43.022], [-73.612, 43.045], [-73.6, 43.072], [-73.591, 43.094]], 160, 'retreat', 'Burgoyne’s retreat by night, 8 to 9 October', 'dashed'),
      A('usa', [[-73.637, 43.012], [-73.626, 43.04], [-73.613, 43.068], [-73.6005, 43.0858]], 180, 'pursuit', 'Gates follows'),
    ],
  },
  markers: {
    'saratoga-surrender-convention': M([-73.579, 43.119], 'The convention', 'Arms laid down, 17 October', 'held', 'scroll-text'),
    'saratoga-surrender-gates': M([-73.6015, 43.083], 'Gates', 'Accepts Burgoyne’s sword', 'usa'),
  },
});
console.log('saratoga: 5 pages');
