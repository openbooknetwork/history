// Siege of Paris, 885–886. Paris is the walled Île de la Cité, joined to the right bank by the Grand Pont and to the
// left bank by the Petit Pont, each with a tower at its bank end (the right bank tower stood where the Grand Châtelet
// later stood). Abbo of Saint-Germain, inside the city, is the source for the three phases.
// paris-885-seine.json holds the Seine from the OpenStreetMap banks, with the Cité cut to its 9th-century extent
// (from about the rue de Harlay to the apse of Notre-Dame) and the islets to the west and the two islets of today's
// Île Saint-Louis left separate, plus the bridge ends and the line of the wall.
// Units, arrows and markers are metres north and east of the middle of the Cité, drawn larger than real as the
// README's "Drawn size" asks. Facings are compass bearings.
import fs from 'fs';
import { frame, writePlan } from './lib.mjs';

const G = 'pages/050-francia/020-paris';
const seine = JSON.parse(fs.readFileSync(new URL('./paris-885-seine.json', import.meta.url)));
const c = frame([2.3475, 48.8548], 0), P = c.p, PP = c.path;
const bbox = c.box([[-450, -840], [700, 480]], 0);

const water = name => seine.water.map(area => ({ area, id: 'seine', name }));
const [gpCite, gpBank] = seine.bridges.grand, [ppCite, ppBank] = seine.bridges.petit;
const wall = { side: 'franks', path: [...seine.wall, [...seine.wall[0]]], width: 9, id: 'wall', name: 'The wall of the Cité, from the late Roman town' };
const grandPont = { side: 'franks', path: [gpCite, gpBank], width: 14, id: 'grand-pont', name: 'The Grand Pont to the right bank' };
const tower = name => ({ side: 'franks', path: PP([[248, -28], [284, -27]]), width: 36, id: 'tower', name });
const petitPont = { side: 'franks', path: [ppCite, ppBank], width: 14, id: 'petit-pont', name: 'The Petit Pont to the left bank' };
const smallTower = name => ({ side: 'franks', path: PP([[-205, -7], [-238, -7]]), width: 32, id: 'small-tower', name });

const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(...at), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: PP(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (at, label, note, color, icon = 'user') => ({ lnglat: P(...at), icon, color, label, note });
// the moored fleet lies along the right bank below the city, bows upstream
const fleet = unit('danes', 'ships', [405, -690], 64, 300, 103, 'fleet', 'Sigfrid’s fleet, 700 ships by Abbo, about 300 by modern estimates', { count: 12, rows: 6 });
const camp = unit('danes', 'camp', [540, -470], 220, 160, 180, 'camp', 'The Danish camp round the church of Saint-Germain-le-Rond, walled with stone');

// --- overview: Sigfrid's fleet from Rouen, Charles the Fat's march from Metz, the Danes' way to Burgundy ---
writePlan(`${G}/010-paris-885`, {
  routes: {
    'sigfrid-885': { name: 'Sigfrid’s fleet from Rouen up the Seine to Paris, autumn 885', path: [[1.099, 49.443], [1.06, 49.38], [1.03, 49.3], [1.1, 49.3], [1.155, 49.305], [1.24, 49.28], [1.33, 49.25], [1.41, 49.235], [1.45, 49.17], [1.485, 49.09], [1.58, 49.02], [1.72, 48.995], [1.86, 48.995], [1.95, 48.99], [2.03, 48.93], [2.1, 48.9], [2.17, 48.93], [2.22, 48.915], [2.235, 48.86], [2.26, 48.835], [2.3, 48.858], [2.335, 48.858]] },
    'charles-fat-886': { name: 'Charles the Fat’s army from Metz to Paris, August – October 886', path: [[6.176, 49.119], [5.6, 49.3], [5.0, 49.45], [4.58, 49.48], [4.0, 49.55], [3.62, 49.564], [3.36, 49.62], [3.14, 49.57], [2.85, 49.3], [2.6, 49.05], [2.343, 48.886]] },
    'paris-danes-886': { name: 'The Danes haul their ships to the Marne and sail up the Seine and the Yonne to Sens, November 886', path: [[2.335, 48.858], [2.37, 48.845], [2.41, 48.817], [2.45, 48.77], [2.47, 48.68], [2.48, 48.61], [2.655, 48.54], [2.8, 48.43], [2.955, 48.385], [3.1, 48.32], [3.283, 48.197]] },
  },
  markers: {
    'rouen-885': { lnglat: [1.099, 49.443], icon: 'flag', color: 'danes', label: 'Rouen', note: 'The Danish bands gather, 885' },
    'metz-886': { lnglat: [6.176, 49.119], icon: 'flag', color: 'franks', label: 'Metz', note: 'Charles the Fat sets out, July 886' },
    'sens-886': { lnglat: [3.283, 48.197], icon: 'swords', color: 'danes', label: 'Sens', note: 'Besieged by the Danes, winter 886' },
  },
});

// --- 26 and 27 November 885: the assaults on the unfinished tower at the right bank end of the Grand Pont ---
writePlan(`${G}/020-paris-tower`, {
  bbox,
  emblem: {
    water: water('The Seine'),
    works: [wall, grandPont, tower('The tower at the right bank end of the Grand Pont, unfinished, raised by a storey in the night'), petitPont, smallTower('The tower at the left bank end of the Petit Pont')],
    units: [
      fleet,
      unit('danes', 'infantry', [350, -30], 190, 45, 180, 'assault', 'Danish warriors attack the tower with arrows, stones and fire'),
      unit('danes', 'siege', [372, -215], 90, 40, 117, 'rams', 'Rams and miners against the tower, 27 November'),
      unit('franks', 'infantry', [112, -40], 90, 28, 0, 'defenders', 'Odo’s men-at-arms, about 200 by Abbo'),
    ],
    arrows: [
      arrow('danes', [[322, -30], [290, -28]], 30, 'assault-arrow', 'The Danes storm the tower'),
      arrow('danes', [[352, -175], [300, -72]], 26, 'rams-arrow', 'The rams and miners go against the foot of the tower'),
      arrow('franks', [[128, -40], [190, -36], [236, -30]], 24, 'reinforce', 'Defenders cross the bridge to the tower'),
    ],
    clashes: [{ at: P(298, -28), size: 45 }],
  },
  markers: {
    'paris-tower-odo': mark([40, -210], 'Odo', 'Count of Paris, holds the city', 'franks'),
    'paris-tower-gozlin': mark([250, 230], 'Gozlin', 'Bishop of Paris, fights with bow and axe', 'franks'),
    'paris-tower-sigfrid': mark([520, 150], 'Sigfrid', 'Leads the assaults', 'danes'),
    'paris-tower-fleet': mark([640, -700], 'Danish fleet', 'Arrives on 24 November', 'danes', 'ship'),
  },
});

// --- 31 January to 2 February 886: three groups, the rams and the three fire ships ---
writePlan(`${G}/030-paris-fireships`, {
  bbox,
  emblem: {
    water: water('The Seine'),
    works: [wall, grandPont, tower('The tower at the right bank end of the Grand Pont'), petitPont, smallTower('The tower at the left bank end of the Petit Pont'),
      { side: 'neutral', path: PP([[246, -78], [308, -72], [312, 22], [250, 26]]), width: 10, style: 'trench', id: 'ditch', name: 'The ditch round the tower, filled with brushwood, dead animals and the bodies of prisoners' }],
    units: [
      fleet, camp,
      unit('danes', 'infantry', [380, -170], 110, 34, 150, 'groups', 'The Danes attack in three groups, by land and from the river'),
      unit('danes', 'infantry', [410, -20], 110, 34, 180, 'groups', 'The Danes attack in three groups, by land and from the river'),
      unit('danes', 'infantry', [345, 125], 110, 34, 225, 'groups', 'The Danes attack in three groups, by land and from the river'),
      unit('danes', 'siege', [345, -40], 100, 36, 180, 'rams', 'Three rams on sixteen wheels under a high roof, each holding sixty men by Abbo', { count: 3 }),
      unit('danes', 'ships', [238, -200], 66, 44, 100, 'fire-ships', 'Three ships set on fire and sent against the bridge', { count: 3 }),
      unit('franks', 'infantry', [112, -40], 90, 28, 0, 'defenders', 'Odo’s men-at-arms'),
      unit('franks', 'siege', [58, 70], 80, 32, 10, 'mangonels', 'Frankish mangonels, whose stones keep the rams off', { count: 2 }),
    ],
    arrows: [
      arrow('danes', [[360, -140], [312, -80]], 26, 'groups-attack', 'The three groups go against the tower and the bridge'),
      arrow('danes', [[392, -20], [318, -24]], 26, 'groups-attack', 'The three groups go against the tower and the bridge'),
      arrow('danes', [[330, 100], [300, 40]], 26, 'groups-attack', 'The three groups go against the tower and the bridge'),
      arrow('danes', [[236, -168], [222, -110], [212, -48]], 26, 'fire-ships-arrow', 'The burning ships sink at the stone piers before the fire reaches the bridge'),
    ],
    clashes: [{ at: P(312, -50), size: 45 }, { at: P(290, 40), size: 40 }],
  },
  markers: {
    'paris-fire-camp': mark([600, -230], 'Saint-Germain-le-Rond', 'Danish camp since late 885', 'danes', 'flag'),
    'paris-fire-ships': mark([150, -430], 'Fire ships', 'Three, sent against the bridge', 'danes', 'ship'),
    'paris-fire-rams': mark([480, 150], 'Three rams', 'Left behind on 3 February', 'danes', 'swords'),
    'paris-fire-odo': mark([40, -210], 'Odo', 'Holds the tower and the bridge', 'franks'),
  },
});

// --- 6 February 886: the flood breaks the Petit Pont and the small tower falls ---
writePlan(`${G}/040-paris-flood`, {
  bbox,
  emblem: {
    water: water('The Seine in flood, 6 February 886'),
    works: [wall, grandPont, tower('The tower at the right bank end of the Grand Pont'),
      { ...petitPont, path: [ppCite, P(-180, -7)], name: 'The Petit Pont, broken by the flood' },
      { ...petitPont, path: [P(-193, -7), ppBank], name: 'The Petit Pont, broken by the flood' },
      smallTower('The tower at the left bank end of the Petit Pont, cut off with twelve men inside')],
    units: [
      fleet, camp,
      unit('danes', 'infantry', [-300, -20], 170, 42, 5, 'attackers', 'Danish warriors attack and burn the small tower'),
      unit('franks', 'infantry', [-112, -10], 90, 28, 180, 'island', 'Odo’s men on the island, cut off from the tower'),
    ],
    arrows: [
      arrow('danes', [[-276, -20], [-246, -10]], 30, 'attack', 'The Danes set fire to the tower'),
    ],
    clashes: [{ at: P(-250, -8), size: 45 }],
  },
  markers: {
    'paris-flood-twelve': mark([-250, 180], 'Twelve defenders', 'Killed, 6 February 886', 'franks', 'skull'),
    'paris-flood-bridge': mark([0, -250], 'Petit Pont', 'Broken by the flood', 'franks', 'waves'),
    'paris-flood-odo': mark([60, 150], 'Odo', 'On the island', 'franks'),
    'paris-flood-camp': mark([600, -230], 'Saint-Germain-le-Rond', 'Danish camp', 'danes', 'flag'),
  },
});

console.log('paris-885: bbox', JSON.stringify(bbox));
