// Stamford Bridge, 25 September 1066. Harold comes down the road from York onto the west bank of the Derwent and is
// held at the bridge while Harald forms a shield wall on Battle Flats, the traditional site on the rising ground east
// of the river. The Derwent is traced from OpenStreetMap. The wooden bridge stood about 150 yards upstream of the
// bridge of 1727, as the Geograph note on that bridge says. The ring, Harald's arrow and the riders follow Snorri.
// Positions are metres north and east of the old bridge, drawn larger than real as the README asks.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/120-1066/030-stamford-bridge';
const f = frame([-0.9145, 53.99203], 0), P = f.p, PP = f.path;

const derwent = {
  path: [[-0.89311, 54.00008], [-0.89426, 53.99933], [-0.89668, 53.99859], [-0.89783, 53.99852], [-0.89895, 53.99883], [-0.89921, 53.99912], [-0.89919, 53.99953],
    [-0.89947, 53.99969], [-0.89984, 53.99972], [-0.90082, 53.9993], [-0.90134, 53.99879], [-0.90369, 53.99869], [-0.9051, 53.99812], [-0.90748, 53.99753],
    [-0.90955, 53.99631], [-0.91134, 53.99576], [-0.91189, 53.99543], [-0.91211, 53.99484], [-0.91175, 53.9937], [-0.91185, 53.99311], [-0.91206, 53.99266],
    [-0.91252, 53.99225], [-0.91324, 53.99203], [-0.91448, 53.99205], [-0.91515, 53.99188], [-0.91596, 53.99145], [-0.91718, 53.99102], [-0.92031, 53.99007],
    [-0.92308, 53.98874], [-0.92363, 53.98837], [-0.92442, 53.9875], [-0.92497, 53.98624], [-0.92615, 53.9851], [-0.9275, 53.98433], [-0.92791, 53.98383],
    [-0.92782, 53.98301], [-0.92712, 53.9812], [-0.92705, 53.98039], [-0.92822, 53.97852], [-0.92882, 53.97599]],
  width: 30, id: 'derwent', name: 'The river Derwent',
};
// the river runs west at the bridge, so the bridge runs north to south
const bridge = { side: 'neutral', path: PP([[36, -3], [-36, 3]]), width: 18, id: 'bridge', name: 'The wooden bridge over the Derwent, upstream of the present bridge' };
const ground = { water: [derwent], works: [bridge] };
const bbox = f.box([[-1150, -1050], [450, 1250]], 0);

// local [north, east] arithmetic: a point moved along a compass bearing, and a point on a unit's front
const rad = b => b * Math.PI / 180;
const go = ([n, e], bearing, d) => [n + Math.cos(rad(bearing)) * d, e + Math.sin(rad(bearing)) * d];
const mid = ([a, b], [c, d]) => [(a + c) / 2, (b + d) / 2];
// s runs from -1 at the unit's left end to 1 at its right end, and bow pushes the centre forward as the emblem draws it
const front = (u, s = 0) => go(go(u.ne, u.facing + 90, s * u.width / 2), u.facing, u.depth / 2 + (u.bow ?? 0) * (1 - s * s));
const back = (u, s = 0) => go(front(u, s), u.facing + 180, u.depth);

const unit = (side, type, ne, width, depth, facing, id, name, extra = {}) => ({ side, type, ne, width, depth, facing, id, name, ...extra });
const draw = ({ ne, ...u }) => ({ ...u, at: P(...ne) });
const arrow = (side, pts, width, id, name, style) => ({ side, path: PP(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (ne, label, note, color, icon = 'user') => ({ lnglat: P(...ne), icon, color, label, note });
const clash = ne => ({ at: P(...ne), size: 50 });

// --- overview: Harold's march from London by Tadcaster and York, and Harald's march from the ships at Riccall ---
writePlan(`${G}/010-stamford-bridge`, {
  routes: {
    'harold-1066': {
      name: 'Harold Godwinson’s march from London to Tadcaster, about four days, September 1066',
      path: [[-0.09, 51.51], [-0.03, 51.81], [-0.02, 52.05], [-0.18, 52.32], [-0.36, 52.56], [-0.48, 52.65], [-0.54, 52.98], [-0.54, 53.23], [-0.77, 53.34],
        [-1.13, 53.52], [-1.35, 53.725], [-1.262, 53.884]],
    },
    'harold-1066-york': {
      name: 'Harold marches through York to Stamford Bridge, 25 September 1066',
      path: [[-1.262, 53.884], [-1.17, 53.93], [-1.0815, 53.9583], [-1.01, 53.975], [-0.948, 53.99], [-0.918, 53.993]],
    },
    'harald-1066-riccall': {
      name: 'Harald and Tostig march from Riccall to Stamford Bridge, 25 September 1066',
      path: [[-1.0594, 53.8333], [-1.043, 53.88], [-1.02, 53.925], [-0.985, 53.962], [-0.95, 53.982], [-0.916, 53.992]],
    },
  },
  markers: {
    'tadcaster-1066': { lnglat: [-1.262, 53.884], icon: 'flag', color: 'english', label: 'Tadcaster', note: 'Harold arrives, 24 September' },
    'york-1066': { lnglat: [-1.0815, 53.9583], icon: 'flag', color: 'english', label: 'York', note: 'Surrenders to Harald, 24 September' },
    'riccall-1066': { lnglat: [-1.0594, 53.8333], icon: 'ship', color: 'norway', label: 'Riccall', note: 'Harald’s ships and camp' },
  },
  bbox: [-1.6, 53.62, -0.55, 54.12],
});

// --- the English fall on the Norwegians on the west bank, a lone Norwegian holds the bridge ---
const westNorse = unit('norway', 'irregular', [130, -90], 200, 60, 270, 'west-bank', 'Norwegians on the west bank, many without their mail');
const van = unit('english', 'infantry', [150, -245], 350, 100, 90, 'english', 'The English army under Harold Godwinson, housecarls and thegns');
const column = unit('english', 'infantry', [215, -660], 120, 420, 95, 'english-column', 'The rest of the English army, coming down the road from York');
const wall1 = unit('norway', 'infantry', [-400, 640], 750, 70, 302, 'shield-wall', 'The Norwegian army forms a shield wall on the rising ground east of the river', { bow: 60 });
writePlan(`${G}/020-stamford-bridge-crossing`, {
  bbox,
  emblem: {
    ...ground,
    units: [westNorse, van, column, wall1].map(draw),
    arrows: [
      arrow('english', [[240, -1050], [228, -950], [220, -880]], 40, 'english-advance', 'The English army comes down the road from York'),
      arrow('norway', [[90, -60], [30, -15], [-30, 15], [-140, 170], [-210, 300]], 35, 'west-bank-flight', 'Survivors flee over the bridge to the east bank', 'dashed'),
      arrow('norway', [go(back(wall1, 0.3), 122, 20), [-800, 800], [-1150, 760]], 30, 'messengers', 'By Snorri’s account, riders go to the ships at Riccall for help'),
    ],
    clashes: [clash(mid(front(van), front(westNorse)))],
  },
  markers: {
    'stamford-bridge-crossing-harold': mark([600, -700], 'Harold Godwinson', 'Comes through York from Tadcaster', 'english'),
    'stamford-bridge-crossing-west': mark([380, 60], 'Norwegians on the west bank', 'Many without mail, cut down', 'norway', 'swords'),
    'stamford-bridge-crossing-bridge': mark([-110, -40], 'Norwegian on the bridge', 'Holds it alone, speared from below', 'norway', 'skull'),
    'stamford-bridge-crossing-harald': mark([-470, 1000], 'Harald and Tostig', 'Form a shield wall on the rise', 'norway'),
  },
});

// --- the English cross and attack the shield wall, Harald and Tostig fall ---
// equal widths and opposite bows keep the two curved lines 50 m apart along their whole length
const ring = unit('norway', 'infantry', [-400, 640], 750, 70, 302, 'shield-wall', 'Norwegian shield wall under Harald Hardrada and Tostig, many without mail. By Snorri’s account its wings bend back into a ring', { bow: 200 });
const line2 = unit('english', 'infantry', go(ring.ne, 302, 70 / 2 + 50 + 100 / 2), 750, 100, 122, 'english', 'English army under Harold Godwinson, 10,500 to 15,000', { bow: -200 });
writePlan(`${G}/030-stamford-bridge-shield-wall`, {
  bbox,
  emblem: {
    ...ground,
    units: [ring, line2].map(draw),
    arrows: [
      arrow('english', [[70, -45], [0, 0], [-100, 110], go(back(line2), 302, 25)], 40, 'english-crossing', 'The English cross the bridge and form a line'),
    ],
    clashes: [-0.6, 0, 0.6].map(s => clash(mid(front(ring, s), front(line2, -s)))),
  },
  markers: {
    'stamford-bridge-shield-wall-harold': mark([-560, 0], 'Harold Godwinson', 'Housecarls and thegns, on foot', 'english'),
    'stamford-bridge-shield-wall-harald': mark([-600, 820], 'Harald Hardrada', 'Arrow in the throat, by Snorri', 'norway', 'skull'),
    'stamford-bridge-shield-wall-tostig': mark([-230, 1080], 'Tostig', 'Takes the banner, then falls', 'norway', 'skull'),
  },
});

// --- Eystein Orri comes up from Riccall and strikes the south end of the English line, the Norwegians break ---
const remnant = unit('norway', 'infantry', go(ring.ne, 122, 80), 450, 70, 302, 'shield-wall', 'What remains of the shield wall, round Harald’s banner Land-waster', { bow: 80 });
const line3 = unit('english', 'infantry', go(remnant.ne, 302, 70 / 2 + 50 + 100 / 2), 900, 100, 122, 'english', 'English army under Harold Godwinson');
const orri = unit('norway', 'infantry', go(go(line3.ne, 212, 450), 212, 50 + 70 / 2), 300, 70, 32, 'orri', 'Eystein Orri’s men from the ships at Riccall, in mail, a third of the army');
writePlan(`${G}/040-stamford-bridge-orre`, {
  bbox,
  emblem: {
    ...ground,
    units: [remnant, line3, orri].map(draw),
    arrows: [
      arrow('norway', [go(back(orri), 212, 320), go(back(orri), 212, 160), go(back(orri), 212, 15)], 40, 'orri-run', 'Eystein Orri’s men come up at a run from Riccall, about 26 km away'),
      arrow('norway', [orri.ne, go(front(orri), 32, 110)], 40, 'orri-storm', 'Orri’s storm: the counter-attack nearly breaks the English line'),
      arrow('norway', [go(back(remnant, 0.3), 122, 10), [-760, 1000], [-1100, 1080]], 40, 'flight', 'The Norwegians break and flee towards the ships, some drown crossing rivers', 'dashed'),
    ],
    clashes: [clash(mid(front(remnant), front(line3))), clash(go(front(orri), 32, 25))],
  },
  markers: {
    'stamford-bridge-orre-orri': mark(go(orri.ne, 122, 300), 'Eystein Orri', 'Takes up the banner, killed', 'norway', 'skull'),
    'stamford-bridge-orre-harold': mark(go(line3.ne, 302, 350), 'Harold Godwinson', 'Pursues the fleeing Norwegians', 'english'),
  },
});

console.log('stamford-bridge-1066: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 0)));
