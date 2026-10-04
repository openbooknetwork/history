// Fallen Timbers, 20 August 1794. Wayne's Legion advances north-east down the north bank of the Maumee towards
// Fort Miami. Frame on the battlefield: u along the lines (north-west, away from the river, the Legion's left),
// w the direction of the advance (north-east). The fallen timber, the swamp on the left and the ravine follow
// the article's account; their extent is a reconstruction.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/040-epilogue';
const NATIVE = '#8d6e63';
const f = frame([-83.6975, 41.5442], 315), P = f.p, LEGION = f.face(90), CONF = f.face(270);
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

const maumee = { path: [[-83.735, 41.495], [-83.712, 41.515], [-83.692, 41.533], [-83.672, 41.549], [-83.652, 41.562], [-83.634, 41.5735], [-83.61, 41.588], [-83.585, 41.605]], width: 260, id: 'maumee', name: 'The Maumee River' };
const timber = [100, 260, 420].map(w => unit('neutral', 'light', 0, w, 1900, 60, LEGION, 'timber', 'The fallen timber, trees blown down by a storm'));
const swamp = { area: f.path([[1300, -450], [1780, -380], [1820, 120], [1350, 220]]), id: 'swamp', name: 'The swamp on the Legion’s left' };
const bbox = f.box([[-1700, -1300], [1900, 2100]], 0);

writePlan(`${G}/021-fallen-timbers-ambush`, {
  bbox,
  emblem: {
    water: [maumee, swamp],
    units: [...timber,
      unit(NATIVE, 'infantry', -450, 260, 700, 110, CONF, 'odawa', 'Odawa and Potawatomi under Little Otter and Egushawa'),
      unit(NATIVE, 'infantry', 520, 260, 700, 110, CONF, 'wyandot', 'Wyandot, Lenape and Canadian militia'),
      unit('usa', 'infantry', -650, -650, 730, 70, LEGION, 'wilkinson', 'Wilkinson’s right wing, the 1st and 3rd sub-legions, 800 yards long'),
      unit('usa', 'infantry', 350, -650, 650, 90, LEGION, 'hamtramck', 'Hamtramck’s left wing, the 2nd and 4th sub-legions, in two ranks'),
      unit('usa', 'cavalry', -150, -950, 220, 70, LEGION, 'centre', 'Dragoons and artillery in the centre of the column'),
      unit('usa', 'light', -650, -470, 520, 50, LEGION, 'light-infantry', 'Light infantry sent ahead of each wing'),
      unit('usa', 'light', 350, -470, 480, 50, LEGION, 'light-infantry', 'Light infantry sent ahead of each wing'),
      unit('usa', 'cavalry', 1300, -900, 400, 80, LEGION, 'kentucky', 'Kentucky mounted militia under Charles Scott and Robert Todd'),
    ],
    arrows: [
      arrow('usa', [[-150, 80], [250, -350], [420, -620]], 70, 'kentucky-flee', 'The mounted Kentucky vanguard scatters under the first volley', 'dashed'),
      arrow(NATIVE, [[-300, 180], [0, -220], [200, -470]], 70, 'warriors-pursue', 'Warriors pursue into the Legion’s left in hand to hand fighting'),
      arrow('usa', [[-150, -880], [-220, -150]], 60, 'grapeshot', 'The artillery comes up and fires grapeshot'),
    ],
    clashes: [{ at: P(-150, 120), size: 90 }, { at: P(250, -480), size: 80 }],
  },
  markers: {
    'fallen-timbers-ambush-wayne': mark(-150, -1200, 'Wayne', 'Brings up the artillery', 'usa'),
    'fallen-timbers-ambush-blue-jacket': mark(0, 700, 'Blue Jacket', 'About 1,500 warriors in the timber', 'pending'),
    'fallen-timbers-ambush-hamtramck': mark(800, -850, 'Hamtramck', 'Forms two ranks', 'usa'),
    'fallen-timbers-ambush-wilkinson': mark(-1100, -850, 'Wilkinson', 'Right wing by the river', 'usa'),
  },
});

writePlan(`${G}/022-fallen-timbers-charge`, {
  bbox,
  emblem: {
    water: [maumee, swamp],
    works: [{ side: 'neutral', path: f.path([[-1100, 1650], [-500, 1720], [100, 1680], [500, 1600]]), width: 60, id: 'ravine', name: 'The ravine on the road to Fort Miami' }],
    units: [...timber,
      unit(NATIVE, 'infantry', -550, 650, 600, 110, CONF, 'odawa', 'Odawa and Potawatomi, falling back'),
      unit(NATIVE, 'infantry', 450, 500, 650, 110, CONF, 'wyandot', 'Wyandot, Lenape and Canadians, in a heavy exchange of fire'),
      unit('usa', 'infantry', -650, -150, 730, 70, LEGION, 'wilkinson', 'Wilkinson’s infantry advancing in support of the dragoons'),
      unit('usa', 'infantry', 350, -120, 650, 90, LEGION, 'hamtramck', 'Hamtramck’s left wing advancing at trail arms'),
      unit('usa', 'cavalry', -900, 250, 200, 80, LEGION, 'dragoons', 'Captain Robert Campbell’s dragoons'),
      unit('usa', 'cavalry', 1250, 450, 350, 80, f.face(150), 'kentucky', 'Robert Todd’s brigade of Kentucky militia'),
    ],
    arrows: [
      arrow('usa', [[-950, -600], [-920, 150]], 70, 'dragoon-charge', 'Campbell’s dragoons charge first, sabres drawn, and Campbell is killed'),
      arrow('usa', [[1300, -750], [1600, -100], [1300, 380]], 70, 'todd-flank', 'Todd’s Kentuckians cross the swamp and turn the Canadians’ flank'),
      arrow(NATIVE, [[-550, 750], [-700, 1250], [-800, 1600]], 70, 'odawa-back', 'The Odawa and Potawatomi fall back to the ravine', 'dashed'),
      arrow(NATIVE, [[450, 600], [200, 1150], [-200, 1550]], 70, 'wyandot-back', 'The confederacy cannot re-form in the broken ground', 'dashed'),
    ],
    clashes: [{ at: P(-650, 530), size: 90 }, { at: P(450, 380), size: 90 }, { at: P(1000, 480), size: 80 }],
  },
  markers: {
    'fallen-timbers-charge-turkey-foot': mark(-850, 1800, 'Turkey Foot', 'Shot dead on the rock', 'pending', 'skull'),
    'fallen-timbers-charge-campbell': mark(-1250, 150, 'Robert Campbell', 'Killed in the charge', 'usa', 'skull'),
    'fallen-timbers-charge-todd': mark(1650, 650, 'Todd', 'Through the swamp', 'usa'),
    'fallen-timbers-charge-wayne': mark(-150, -700, 'Wayne', 'Charge with the bayonet', 'usa'),
  },
});

writePlan(`${G}/023-fallen-timbers-miami`, {
  bbox: f.box([[-2600, -1000], [1600, 8200]], 0),
  emblem: {
    water: [maumee],
    units: [
      unit('held', 'camp', -1300, 6290, 230, 230, 0, 'fort-miami', 'Fort Miami, its gates shut against the warriors'),
      unit('usa', 'camp', -700, 5100, 500, 380, 0, 'wayne-camp', 'Wayne’s camp in sight of the fort, 20 to 23 August'),
      unit('usa', 'cavalry', -500, 2800, 300, 90, LEGION, 'dragoons', 'The dragoons riding down the fleeing warriors'),
    ],
    arrows: [
      arrow(NATIVE, [[-200, 1700], [-700, 3500], [-1000, 5300], [-1150, 6050]], 110, 'run-for-fort', 'The warriors run for Fort Miami and find the gates shut', 'dashed'),
      arrow(NATIVE, [[-900, 6500], [-300, 7400], [300, 8200]], 110, 'swan-creek', 'The survivors go on north to Swan Creek', 'dashed'),
      arrow('usa', [[-400, 1300], [-500, 2600]], 90, 'pursuit', 'The dragoons pursue across the open ground beyond the ravine'),
    ],
  },
  markers: {
    'fallen-timbers-miami-campbell': mark(-500, 5950, 'William Campbell', 'Keeps the gates shut', 'held', 'castle'),
    'fallen-timbers-miami-wayne': mark(-150, 5150, 'Wayne', 'Rides alone along the walls', 'usa'),
    'fallen-timbers-miami-mckee': mark(-800, 7300, 'McKee’s trading post', 'Burned by Wayne’s men', 'held', 'flame'),
    'fallen-timbers-miami-battlefield': mark(0, 0, 'Fallen Timbers', 'An hour and ten minutes', 'usa', 'swords'),
  },
});
console.log('fallen timbers: field at', JSON.stringify(P(0, 0)), 'fort at', JSON.stringify(P(-1300, 6290)));
