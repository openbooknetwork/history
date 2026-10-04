// Yorktown, September and October 1781: the battle off the Capes, then the siege.
// The Capes frame has its origin at Cape Henry, u east, w south; the lines follow the article: both fleets sail
// east, the British line to windward, the vans close and the rears apart.
// The siege frame has its origin south of the town, u east, w south. The map's York River bank lies about
// 550 m south of the real one, so the whole siege is drawn 550 m south of its real place and Gloucester Point
// sits on the map's north shore, keeping the works in their places relative to each other.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/020-war/050-1780-1781';
const FR = '#17a2a2'; // the French army and fleet
const mk = f => ({
  unit: (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: f.p(u, w), width, depth, facing, id, name, ...extra }),
  arrow: (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) }),
  work: (side, pts, width, id, name) => ({ side, path: f.path(pts), width, id, name }),
  mark: (u, w, label, note, color, icon = 'user') => ({ lnglat: f.p(u, w), icon, color, label, note }),
});

// --- the battle off the Capes, 5 September ---
{
  const f = frame([-76.007, 36.926], 90), { unit, arrow, mark } = mk(f), P = f.p;
  const ships = (side, u, w, facing, id, name) => unit(side, 'ships', u, w, 260, 2100, facing, id, name, { count: 8, rows: 8 });
  writePlan(`${G}/031-yorktown-chesapeake`, {
    bbox: f.box([[7200, -5200], [18300, 3200]], 0),
    emblem: {
      units: [
        ships(FR, 14420, 590, 80, 'french-van', 'French van under Bougainville'),
        ships(FR, 12250, 970, 80, 'french-centre', 'French centre under de Grasse in the Ville de Paris'),
        ships(FR, 10080, 1360, 80, 'french-rear', 'French rear, the last ships out of the bay'),
        ships('held', 14560, -940, 110, 'british-van', 'British van under Drake, now leading after the fleet wears'),
        ships('held', 12590, -1660, 110, 'british-centre', 'British centre under Graves in the London'),
        ships('held', 10610, -2380, 110, 'british-rear', 'British rear under Hood, too far off to engage'),
      ],
      arrows: [
        arrow(FR, [[-5000, 300], [-1500, -1300], [3500, -300], [8200, 1500]], 220, 'french-sortie', 'The French cut their cables and sail out of Lynnhaven Bay with the noon tide'),
        arrow('held', [[17000, -11000], [11500, -7000], [8200, -4300], [9200, -3000]], 220, 'british-wear', 'The British come down from the north-east and wear to sail east, about 2 pm'),
      ],
      clashes: [{ at: P(15200, -150), size: 300 }, { at: P(12800, -350), size: 220 }],
    },
    markers: {
      'yorktown-chesapeake-degrasse': mark(11600, 2350, 'De Grasse', '24 ships of the line', 'territory'),
      'yorktown-chesapeake-bougainville': mark(15700, 1700, 'Bougainville', 'French van, at close range', 'territory'),
      'yorktown-chesapeake-graves': mark(12900, -2900, 'Graves', '19 ships of the line', 'held'),
      'yorktown-chesapeake-drake': mark(15900, -2000, 'Drake', 'British van, badly damaged', 'held'),
      'yorktown-chesapeake-hood': mark(9200, -3900, 'Hood', 'Rear, a few shots fired', 'held'),
    },
  });
}

// --- the siege ---
const f = frame([-76.507, 37.2295], 90), { unit, arrow, work, mark } = mk(f), P = f.p;
const bbox = f.box([[-1800, -3300], [2000, 1950]], 0);
const SOUTH = 180, NORTH = 0;
const inner = work('held', [[-1500, -1700], [-1300, -1250], [-1050, -700], [-700, -250], [-350, 30], [0, 120], [300, -60], [360, -260]], 45, 'inner-works', 'The British inner works round the town');
const fusiliers = unit('held', 'camp', -1350, -1350, 130, 130, 0, 'fusiliers', 'The Fusiliers’ Redoubt');
const r9 = (side, name) => unit(side, 'camp', 505, 320, 80, 80, 0, 'redoubt-9', name);
const r10 = (side, name) => unit(side, 'camp', 650, 40, 70, 70, 0, 'redoubt-10', name);
const gloucester = unit('held', 'camp', 1000, -2350, 280, 200, 0, 'gloucester', 'The British post at Gloucester Point');
const choisy = unit(FR, 'infantry', 900, -3100, 600, 90, SOUTH, 'choisy', 'Lauzun’s Legion and Virginia militia under Choisy, blocking Gloucester');
const garrison = unit('held', 'infantry', -650, -700, 900, 160, f.face(135), 'garrison', 'Cornwallis’s army inside the inner works');
const first = [
  work(FR, [[-1550, -500], [-1150, 300], [-600, 650], [-150, 800]], 40, 'first-parallel-french', 'The first parallel, French half, opened on the night of 6 October'),
  work('usa', [[-150, 800], [450, 880], [950, 620], [1150, 470]], 40, 'first-parallel-american', 'The first parallel, American half, reaching the York River'),
];
const second = [
  work(FR, [[-1100, 100], [-650, 420], [-150, 560]], 40, 'second-parallel-french', 'The second parallel, dug on the night of 11 October'),
  work('usa', [[-150, 560], [330, 600]], 40, 'second-parallel-american', 'The second parallel, stopped short by Redoubts 9 and 10'),
];
const frenchArmy = unit(FR, 'infantry', -1000, 1450, 1000, 200, NORTH, 'french-army', 'Rochambeau’s French army, about 7,800');
const americanArmy = unit('usa', 'infantry', 650, 1550, 900, 200, NORTH, 'american-army', 'Continentals and militia under Washington, about 11,000');

writePlan(`${G}/032-yorktown-parallel`, {
  bbox,
  emblem: {
    works: [inner, ...first],
    units: [fusiliers, r9('held', 'Redoubt 9, held by British and Germans'), r10('held', 'Redoubt 10, near the river'), garrison,
      unit('held', 'ships', -600, -1750, 700, 200, 90, 'british-ships', 'British ships in the river, among them Guadeloupe and Charon', { count: 6 }),
      gloucester, choisy, frenchArmy, americanArmy],
    arrows: [
      arrow(FR, [[-900, 600], [-600, -100]], 70, 'allied-batteries', 'The allied batteries open fire on 9 October'),
      arrow('usa', [[300, 820], [100, 250]], 70, 'allied-batteries', 'The allied batteries open fire on 9 October'),
      arrow(FR, [[-1450, -450], [-900, -1550]], 60, 'fire-on-ships', 'French guns drive the Guadeloupe across the river and set the Charon on fire'),
      arrow('held', [[1000, -2500], [950, -2850]], 50, 'tarleton-gloucester', 'Tarleton’s foragers run into Lauzun’s Legion, 3 October'),
    ],
    clashes: [{ at: P(950, -2900), size: 110 }],
  },
  markers: {
    'yorktown-parallel-town': mark(-240, -470, 'Yorktown', 'Cornwallis’s headquarters', 'held', 'landmark'),
    'yorktown-parallel-rochambeau': mark(-1000, 1750, 'Rochambeau', 'French army on the left', 'territory'),
    'yorktown-parallel-washington': mark(650, 1850, 'Washington', 'Americans on the right', 'usa'),
    'yorktown-parallel-gloucester': mark(1450, -2400, 'Gloucester Point', 'Tarleton and the Legion', 'held', 'flag'),
  },
});

writePlan(`${G}/033-yorktown-redoubts`, {
  bbox,
  emblem: {
    works: [inner, ...first, ...second],
    units: [fusiliers, r9('held', 'Redoubt 9, held by 120 British and Germans'), r10('held', 'Redoubt 10, held by about 70 men'), garrison,
      unit('usa', 'infantry', 430, 640, 140, 50, NORTH, 'hamilton', 'American light infantry under Alexander Hamilton, 400'),
      unit(FR, 'infantry', 200, 680, 140, 50, NORTH, 'deux-ponts', 'French troops of the Royal Deux-Ponts Regiment, 400'),
      gloucester, choisy],
    arrows: [
      arrow('usa', [[460, 600], [640, 100]], 55, 'storm-10', 'Hamilton’s light infantry storm Redoubt 10 with the bayonet'),
      arrow('usa', [[520, 600], [860, 300], [740, 20]], 40, 'laurens', 'John Laurens goes round to the rear of Redoubt 10'),
      arrow(FR, [[220, 640], [480, 370]], 55, 'storm-9', 'The French hack through the abatis and take Redoubt 9'),
      arrow(FR, [[-1500, -500], [-1390, -1220]], 50, 'feint', 'A French feint against the Fusiliers’ Redoubt at 6:30 pm'),
    ],
    clashes: [{ at: P(505, 320), size: 90 }, { at: P(650, 40), size: 90 }, { at: P(-1360, -1250), size: 70 }],
  },
  markers: {
    'yorktown-redoubts-hamilton': mark(870, 650, 'Hamilton', 'Redoubt 10', 'usa'),
    'yorktown-redoubts-deux-ponts': mark(-60, 900, 'Deux-Ponts', 'Redoubt 9', 'territory'),
    'yorktown-redoubts-town': mark(-240, -470, 'Yorktown', 'Shelled from three sides after the 14th', 'held', 'landmark'),
  },
});

writePlan(`${G}/034-yorktown-surrender`, {
  bbox,
  emblem: {
    works: [inner, ...first, ...second,
      work('usa', [[330, 600], [560, 380], [700, 120], [760, 60]], 40, 'second-parallel-river', 'The second parallel, carried to the river through the taken redoubts')],
    units: [fusiliers, r9('usa', 'Redoubt 9, in allied hands'), r10('usa', 'Redoubt 10, in allied hands'), gloucester, choisy,
      unit('held', 'infantry', 60, 1000, 70, 1100, SOUTH, 'march-out', 'The British army marching out to lay down its arms, 19 October'),
      unit(FR, 'infantry', -230, 1150, 1100, 45, 90, 'french-line', 'The French army lining the road'),
      unit('usa', 'infantry', 340, 1150, 1100, 45, 270, 'american-line', 'The American army lining the road')],
    arrows: [
      arrow('held', [[120, 60], [260, 540]], 45, 'abercromby', 'Abercromby’s 350 spike six guns in the allied lines, night of 15 October'),
      arrow(FR, [[60, 760], [200, 590]], 40, 'french-drive-back', 'French troops drive the sortie back'),
      arrow('held', [[-300, -700], [400, -1500], [950, -2150]], 50, 'boats', 'One wave of boats crosses to Gloucester Point on the night of 16 October'),
      arrow('held', [[60, 250], [60, 1750]], 50, 'to-surrender-field', 'The British march out between the allied lines to Surrender Field'),
    ],
  },
  markers: {
    'yorktown-surrender-moore-house': mark(1770, 1150, 'Moore House', 'Terms settled, 18 October', 'usa', 'house'),
    'yorktown-surrender-field': mark(60, 1850, 'Surrender Field', 'Arms laid down, 19 October', 'usa', 'flag'),
    'yorktown-surrender-squall': mark(500, -1550, 'York River', 'A squall stops the crossing, 16 October', 'held', 'wind'),
    'yorktown-surrender-ohara': mark(-300, 300, 'O’Hara', 'Leads the British out for Cornwallis', 'held'),
  },
});
console.log('yorktown: done, field at', JSON.stringify(P(0, 300)));
