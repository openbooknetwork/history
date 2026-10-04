// Brandywine, 11 September 1777. From the Battle of Brandywine article: Washington along the east bank from Pyle's
// Ford to the fords above the forks, Knyphausen on the Great Road to Chadds Ford, Howe and Cornwallis round by
// Trimble's and Jefferis fords to Osborne's Hill, the fight at the Birmingham meeting house, the stand at Dilworth.
import { writePlan } from './lib.mjs';

const G = 'pages/020-war/030-1777';
const LOY = '#5b8c3a';   // the Queen's Rangers, Loyalists in green coats
const U = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const A = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const M = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, ...(color ? { color } : {}), label, note });

const water = [
  { path: [[-75.633, 39.926], [-75.618, 39.915], [-75.606, 39.903], [-75.598, 39.89], [-75.594, 39.879], [-75.5915, 39.8718], [-75.588, 39.858], [-75.583, 39.84], [-75.578, 39.82], [-75.575, 39.802], [-75.572, 39.79]], width: 45, id: 'brandywine', name: 'Brandywine Creek' },
  { path: [[-75.703, 39.931], [-75.687, 39.923], [-75.665, 39.9215], [-75.645, 39.9235], [-75.633, 39.926]], width: 32, id: 'west-branch', name: 'The West Branch, crossed at Trimble’s Ford' },
  { path: [[-75.642, 39.962], [-75.636, 39.939], [-75.633, 39.926]], width: 32, id: 'east-branch', name: 'The East Branch, crossed at Jefferis Ford' },
];
const greatRoad = { path: [[-75.7106, 39.8445], [-75.665, 39.857], [-75.64, 39.863], [-75.5915, 39.8718], [-75.565, 39.873], [-75.552, 39.871]], width: 18, id: 'great-road', name: 'The Great Road from Kennett Square to Chester' };
const bbox = [-75.725, 39.795, -75.548, 39.95];

writePlan(`${G}/021-brandywine-flank`, {
  bbox,
  emblem: {
    water, works: [greatRoad],
    units: [
      U('usa', 'infantry', [-75.5845, 39.873], 900, 220, 270, 'greene', 'Greene’s division at Chadds Ford, with Washington'),
      U('usa', 'infantry', [-75.5875, 39.8652], 700, 200, 270, 'wayne', 'Wayne’s division and the artillery at the ford'),
      U('usa', 'light', [-75.633, 39.861], 700, 80, 260, 'maxwell', 'Maxwell’s light infantry, skirmishing on the Great Road'),
      U('usa', 'infantry', [-75.5695, 39.8035], 800, 160, 270, 'armstrong', 'Armstrong’s 1,000 Pennsylvania militia at Pyle’s Ford'),
      U('usa', 'infantry', [-75.5925, 39.8885], 650, 180, 270, 'sullivan', 'Sullivan’s division above Chadds Ford'),
      U('usa', 'infantry', [-75.5805, 39.8835], 1000, 200, 270, 'stirling-stephen', 'Stirling’s and Stephen’s divisions on the high ground'),
      U('usa', 'infantry', [-75.6095, 39.9125], 450, 140, 270, 'hazen', 'Hazen’s brigade at Buffington’s and Wistar’s fords'),
      U('held', 'infantry', [-75.6545, 39.8592], 900, 300, 75, 'knyphausen', 'Knyphausen’s column, about 6,800 British and Germans'),
      U(LOY, 'light', [-75.6425, 39.8622], 350, 60, 75, 'rangers', 'The Queen’s Rangers in the vanguard'),
    ],
    arrows: [
      A('held', [[-75.7045, 39.8465], [-75.68, 39.853], [-75.663, 39.8575]], 220, 'knyphausen-march', 'Knyphausen marches east along the Great Road from 5:30 am'),
      A('held', [[-75.704, 39.8495], [-75.701, 39.875], [-75.692, 39.905], [-75.687, 39.9225], [-75.662, 39.934], [-75.637, 39.939], [-75.616, 39.932], [-75.603, 39.922]], 260, 'flank-march', 'Howe and Cornwallis, about 9,000 men, march 17 miles round the fords'),
    ],
    clashes: [{ at: [-75.6362, 39.8628], size: 200 }],
  },
  markers: {
    'brandywine-flank-washington': M([-75.5745, 39.8765], 'Washington', 'Expects the attack at the ford', 'usa'),
    'brandywine-flank-howe': M([-75.6815, 39.9095], 'Howe and Cornwallis', 'Flank march from 5 am', 'held'),
    'brandywine-flank-knyphausen': M([-75.6645, 39.8478], 'Knyphausen', 'Pushes along the Great Road', 'held'),
    'brandywine-flank-meeting-house': M([-75.642, 39.8647], 'Old Kennett meeting house', 'Quakers at worship', null, 'church'),
  },
});

writePlan(`${G}/022-brandywine-birmingham`, {
  bbox: [-75.628, 39.866, -75.565, 39.928],
  emblem: {
    water, works: [greatRoad],
    units: [
      U('held', 'infantry', [-75.6022, 39.9112], 500, 120, 175, 'guards', 'The Brigade of Guards'),
      U('held', 'infantry', [-75.5958, 39.9122], 550, 120, 180, 'grenadiers', 'British grenadiers in the centre'),
      U('held', 'light', [-75.5882, 39.9112], 500, 70, 190, 'light-infantry', 'British light infantry and the jägers'),
      U('held', 'infantry', [-75.5985, 39.9188], 600, 140, 180, 'reserve', 'Hessian grenadiers and the 4th Brigade in reserve'),
      U('usa', 'infantry', [-75.6012, 39.9035], 500, 110, 0, 'sullivan', 'Sullivan’s division with de Borre’s brigade, caught forming'),
      U('usa', 'infantry', [-75.5945, 39.9025], 500, 110, 0, 'stirling', 'Stirling’s division'),
      U('usa', 'light', [-75.5913, 39.9032], 140, 40, 0, 'battery', 'American battery on the knoll'),
      U('usa', 'infantry', [-75.5878, 39.903], 500, 110, 10, 'stephen', 'Stephen’s division'),
      U('held', 'infantry', [-75.6195, 39.8708], 800, 260, 90, 'knyphausen', 'Knyphausen waiting across the ford'),
      U('usa', 'infantry', [-75.5845, 39.873], 700, 200, 270, 'greene', 'Greene’s division, still at Chadds Ford'),
    ],
    arrows: [
      A('held', [[-75.6025, 39.9095], [-75.6016, 39.905]], 90, 'guards-attack', 'The Guards rout de Borre’s brigade'),
      A('held', [[-75.5958, 39.9105], [-75.5947, 39.9043]], 90, 'grenadier-charge', 'The grenadiers’ bayonet charge'),
      A('held', [[-75.5882, 39.9098], [-75.5879, 39.9047]], 80, 'light-attack', 'Light infantry and jägers drive Stephen back'),
      A('usa', [[-75.6015, 39.9015], [-75.5985, 39.8935]], 80, 'sullivan-rout', 'Sullivan’s division breaks', 'dashed'),
    ],
    clashes: [[-75.5946, 39.9056], [-75.5881, 39.9056]],
  },
  markers: {
    'brandywine-birmingham-lafayette': M([-75.5905, 39.8975], 'Lafayette', 'Wounded in the leg', 'usa'),
    'brandywine-birmingham-howe': M([-75.6075, 39.9225], 'Howe', 'On Osborne’s Hill', 'held'),
  },
});

writePlan(`${G}/023-brandywine-chadds-ford`, {
  bbox: [-75.62, 39.85, -75.545, 39.912],
  emblem: {
    water, works: [greatRoad],
    units: [
      U('held', 'infantry', [-75.5862, 39.8708], 700, 220, 90, 'knyphausen', 'Knyphausen’s column, across Chadds Ford'),
      U('usa', 'infantry', [-75.5655, 39.8925], 650, 140, 330, 'greene', 'Greene’s division and the remains of three divisions, south of Dilworth'),
      U('usa', 'light', [-75.5705, 39.8975], 220, 50, 330, 'weedon', 'Weedon’s brigade on the road outside Dilworth'),
      U('held', 'infantry', [-75.5805, 39.9015], 700, 160, 150, 'pursuit', 'British grenadiers and the 4th Brigade pressing from Birmingham'),
    ],
    arrows: [
      A('held', [[-75.6015, 39.8712], [-75.5895, 39.8712]], 140, 'knyphausen-crossing', 'Knyphausen crosses at Chadds Ford'),
      A('usa', [[-75.5845, 39.8665], [-75.5715, 39.865], [-75.5565, 39.866]], 110, 'wayne-retreat', 'Wayne and Maxwell break and lose most of their guns', 'dashed'),
      A('usa', [[-75.571, 39.8065], [-75.5585, 39.818]], 90, 'armstrong-retreat', 'Armstrong’s militia leave Pyle’s Ford', 'dashed'),
      A('held', [[-75.5815, 39.9], [-75.5728, 39.896]], 100, 'british-pursuit', 'The pursuit, held for nearly an hour'),
      A('usa', [[-75.5625, 39.888], [-75.5555, 39.8775], [-75.5505, 39.8745]], 120, 'retreat-chester', 'At dark the army retreats to Chester', 'dashed'),
    ],
    clashes: [[-75.5895, 39.8705], [-75.5698, 39.8952]],
  },
  markers: {
    'brandywine-chadds-ford-greene': M([-75.5582, 39.8868], 'Greene', 'Holds the road for an hour', 'usa'),
    'brandywine-chadds-ford-wayne': M([-75.5725, 39.8608], 'Wayne', 'Loses most of his guns', 'usa'),
    'brandywine-chadds-ford-dilworth': M([-75.5592, 39.9058], 'Dilworth', 'Knox places guns here', null, 'flag'),
  },
});
console.log('brandywine: 3 pages');
