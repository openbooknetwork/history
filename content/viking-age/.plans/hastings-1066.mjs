// Hastings, 14 October 1066. The English hold the ridge where Battle Abbey stands, with Harold's standards where the
// high altar was later built. William's three divisions stand at the foot of the slope, on the side of Telham Hill:
// Bretons on the left beyond the wet ground, Normans in the centre, French and Flemings on the right. The stream is
// traced from OpenStreetMap and the wet ground drawn from the elevation tiles. The hillock's site is unknown, so the
// plan puts it on the spur below the English right. Frame: u along the ridge, w from the English towards the Normans.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/120-1066/040-hastings';
const f = frame([0.488, 50.9143], 80), P = f.p, PP = f.path, ENG = f.face(90), NOR = f.face(270);
const bbox = f.box([[-1000, -600], [800, 800]], 0);

const stream = {
  path: [[0.48708, 50.91084], [0.486, 50.91058], [0.48513, 50.9104], [0.4842, 50.91], [0.48323, 50.90984], [0.4825, 50.90961], [0.4819, 50.9095], [0.48175, 50.9091],
    [0.48154, 50.90873], [0.48105, 50.9085], [0.4803, 50.9082], [0.4794, 50.90807], [0.4783, 50.90813], [0.4777, 50.90811], [0.47699, 50.9074]],
  width: 18, id: 'stream', name: 'The stream across the field, perhaps the Sandlacu, “sandy water”, that gave Orderic Vitalis the name Senlac',
};
const marsh = {
  area: [[0.487, 50.9112], [0.4852, 50.9108], [0.4835, 50.9105], [0.4818, 50.91], [0.481, 50.909], [0.4795, 50.9085], [0.4776, 50.9086], [0.4766, 50.9078],
    [0.477, 50.9068], [0.4785, 50.9075], [0.48, 50.9077], [0.4818, 50.908], [0.4826, 50.909], [0.484, 50.9093], [0.4855, 50.9099], [0.4872, 50.9103]],
  id: 'marsh', name: 'Wet ground along the stream at the foot of the slope',
};
const ground = { water: [marsh, stream] };

// local [u, w] arithmetic: the compass bearing of a local direction, a point moved along a bearing, a unit's front
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const toward = ([u0, w0], [u1, w1]) => ((80 + deg(Math.atan2(w1 - w0, u1 - u0))) % 360 + 360) % 360;
const go = ([u, w], bearing, d) => [u + Math.cos(rad(bearing - 80)) * d, w + Math.sin(rad(bearing - 80)) * d];
const front = (x, d = 0) => go(x.uw, x.facing, x.depth / 2 + d);
const back = (x, d = 0) => go(x.uw, x.facing + 180, x.depth / 2 + d);

const unit = (side, type, uw, width, depth, facing, id, name) => ({ side, type, uw, width, depth, facing, id, name });
const draw = ({ uw, ...x }) => ({ ...x, at: P(...uw) });
const arrow = (side, pts, id, name, style) => ({ side, path: PP(pts), width: 38, id, name, ...(style ? { style } : {}) });
const mark = (uw, label, note, color, icon = 'user') => ({ lnglat: P(...uw), icon, color, label, note });
const clash = uw => ({ at: P(...uw), size: 55 });

const ENGLISH = 'English shield wall under Harold, housecarls and fyrd on foot: 7,000 to 8,000 by Gravett and Marren, '
  + '5,000 to 13,000 in the modern estimates Lawson surveys, 400,000 by Wace';
const ARMY = 'William’s army: 7,000 to 8,000 by Bennett, 7,500 by Gravett, 10,000 by Marren, 10,000 to 12,000 by Lawson, '
  + '14,000 to 150,000 by writers of the time';
const HORSE = 'William’s horsemen, 1,000 to 2,000 by Bennett, 3,000 by Marren';

// --- about 9 in the morning: archers, then foot, then horsemen attack up the slope and are thrown back ---
const wall1 = unit('english', 'infantry', [0, 0], 700, 70, ENG, 'english', ENGLISH);
const archers1 = unit('normans', 'archers', [-40, 250], 860, 40, NOR, 'archers', 'Norman archers with a few crossbowmen and slingers, about a quarter of the army by Gravett');
const bretons1 = unit('normans', 'infantry', [-360, 560], 260, 60, NOR, 'bretons', 'Breton division under Alan the Red, with men of Anjou, Poitou and Maine: spearmen on foot');
const normans1 = unit('normans', 'infantry', [0, 380], 320, 60, NOR, 'normans', `Norman division under Duke William: spearmen on foot. ${ARMY}`);
const french1 = unit('normans', 'infantry', [340, 380], 260, 60, NOR, 'french', 'French division under William fitzOsbern and Eustace of Boulogne, with men of Picardy, Boulogne and Flanders: spearmen on foot');
const bretonHorse1 = unit('normans', 'cavalry', [-360, 670], 200, 70, NOR, 'breton-horse', 'Breton horsemen');
const normanHorse1 = unit('normans', 'cavalry', [0, 500], 260, 70, NOR, 'norman-horse', `Norman horsemen round the duke. ${HORSE}`);
const frenchHorse1 = unit('normans', 'cavalry', [340, 500], 200, 70, NOR, 'french-horse', 'French and Flemish horsemen');
const hit = u => [u, 25];
writePlan(`${G}/020-hastings-lines`, {
  bbox,
  emblem: {
    ...ground,
    units: [wall1, archers1, bretons1, normans1, french1, bretonHorse1, normanHorse1, frenchHorse1].map(draw),
    arrows: [
      arrow('normans', [front(archers1), hit(0)], 'archers-volley', 'The archers shoot uphill, and their arrows strike the shields or fly over the ridge'),
      arrow('normans', [front(bretons1), [-330, 330], hit(-280)], 'foot-attack', 'The foot attack the shield wall and are met by spears, axes and stones'),
      arrow('normans', [front(normans1, 30), hit(-60)], 'foot-attack', 'The foot attack the shield wall and are met by spears, axes and stones'),
      arrow('normans', [front(french1, 30), hit(300)], 'foot-attack', 'The foot attack the shield wall and are met by spears, axes and stones'),
      arrow('normans', [front(normanHorse1), [170, 420], [170, 250], hit(150)], 'horse-attack', 'The horsemen ride up in support and are thrown back'),
    ],
    clashes: [-280, -60, 150, 300].map(u => clash([u, 50])),
  },
  markers: {
    'hastings-lines-harold': mark([0, -200], 'Harold', 'His standards at the centre', 'english'),
    'hastings-lines-william': mark([-60, 610], 'William', 'Commands the Norman centre', 'normans'),
    'hastings-lines-alan': mark([-500, 760], 'Alan the Red', 'Bretons on the left', 'normans'),
    'hastings-lines-fitzosbern': mark([560, 610], 'William fitzOsbern', 'With Eustace, French on the right', 'normans'),
  },
});

// --- the Bretons give way, part of the English right follows them down and is cut down on a hillock ---
const hillock = [-715, 220];
const wall2 = unit('english', 'infantry', [90, 0], 520, 70, ENG, 'english', 'The English shield wall holds the ridge');
const pursuers = unit('english', 'irregular', hillock, 170, 70, toward(hillock, [-560, 340]), 'pursuers', 'Men of the English right who follow the Bretons down the slope and rally on a hillock');
const bretons2 = unit('normans', 'infantry', [-430, 690], 260, 60, NOR, 'bretons', 'The Breton division, fallen back beyond the wet ground');
const normans2 = unit('normans', 'infantry', [0, 380], 320, 60, NOR, 'normans', 'Norman division');
const french2 = unit('normans', 'infantry', [340, 380], 260, 60, NOR, 'french', 'French division');
const horse2At = go(hillock, toward(hillock, [-545, 340]), 35 + 50 + 35);
const horse2 = unit('normans', 'cavalry', horse2At, 220, 70, toward(horse2At, hillock), 'norman-horse', 'Norman horsemen under William, turned on the pursuers');
const frenchHorse2 = unit('normans', 'cavalry', [340, 500], 200, 70, NOR, 'french-horse', 'French and Flemish horsemen');
writePlan(`${G}/030-hastings-flight`, {
  bbox,
  emblem: {
    ...ground,
    units: [wall2, pursuers, bretons2, normans2, french2, horse2, frenchHorse2].map(draw),
    arrows: [
      arrow('normans', [[-360, 500], [-390, 590], front(bretons2, 10)], 'breton-flight', 'The Breton division gives way and falls back across the wet ground', 'dashed'),
      arrow('english', [[-300, 60], [-420, 300], [-600, 300], go(pursuers.uw, 0, 0)], 'pursuit', 'Part of the English right follows them down the slope'),
      arrow('normans', [[-60, 470], [-300, 450], back(horse2, -5)], 'william-charge', 'William shows that he is alive and leads the horsemen against the pursuers'),
    ],
    clashes: [clash(front(horse2, 25))],
  },
  markers: {
    'hastings-flight-william': mark([-60, 560], 'William', 'Lifts his helmet to show his face', 'normans'),
    'hastings-flight-hillock': mark([-860, 90], 'English on a hillock', 'Overwhelmed by the horsemen', 'english', 'skull'),
    'hastings-flight-harold': mark([90, -200], 'Harold', 'Holds the ridge', 'english'),
  },
});

// --- the afternoon: feigned flights thin the wall, Harold falls, the English break at dusk ---
const wall3 = unit('english', 'infantry', [40, 0], 480, 90, ENG, 'english', 'The English shield wall, shrunk by the afternoon’s losses, the fyrd filling the places of fallen housecarls');
const foot3 = [[-230, 'bretons', 'Breton foot'], [30, 'normans', 'Norman foot'], [260, 'french', 'French foot']]
  .map(([u, id, name]) => unit('normans', 'infantry', [u, 45 + 50 + 30], 230, 60, NOR, id, `${name} in the last assault`));
const archers3 = unit('normans', 'archers', [60, 260], 520, 40, NOR, 'archers', 'Norman archers shoot again before and during the last assault');
const horse3 = [[[-330, 260], 'breton-horse', 'Breton horsemen'], [[40, 380], 'norman-horse', 'Norman horsemen under William'], [[540, 380], 'french-horse', 'French and Flemish horsemen']]
  .map(([uw, id, name]) => unit('normans', 'cavalry', uw, 200, 70, NOR, id, name));
writePlan(`${G}/040-hastings-harold`, {
  bbox,
  emblem: {
    ...ground,
    units: [wall3, ...foot3, archers3, ...horse3].map(draw),
    arrows: [
      arrow('normans', [[340, 70], [470, 120], [530, 290], front(horse3[2], 10)], 'feigned-flight', 'Feigned flight: the horsemen turn away, draw the English down after them and cut them off, twice by William of Poitiers', 'dashed'),
      arrow('normans', [front(horse3[1]), front(foot3[1], -10)], 'last-assault', 'The last assault of horse, foot and archers under William'),
      arrow('english', [[-150, -55], [-250, -330], [-230, -560]], 'english-flight', 'At dusk the English break and flee north', 'dashed'),
    ],
    clashes: foot3.map(u => clash(front(u, 25))),
  },
  markers: {
    'hastings-harold-harold': mark([-10, -290], 'Harold', 'Killed late in the day', 'english', 'skull'),
    'hastings-harold-brothers': mark([300, -270], 'Gyrth and Leofwine', 'Harold’s brothers, killed', 'english', 'skull'),
    'hastings-harold-william': mark([40, 470], 'William', 'Leads the last assault', 'normans'),
  },
});

console.log('hastings-1066: bbox', JSON.stringify(bbox), 'standard at', JSON.stringify(P(0, 0)));
