// Edington, May 878. Asser names the field Ethandun. Most historians put it at Edington in Wiltshire, below the
// northern scarp of Salisbury Plain, and local tradition makes Bratton Camp, the Iron Age hillfort on the scarp above
// Bratton, the stronghold the Danes fled to. The plan follows that reading: the Danes stand on the down south-east of
// the camp, on its highest ground, and Alfred comes up across the plain from Iley Oak to the south-west. Edington
// village stands in the frame's north-east corner, below the scarp.
// The camp is placed from the Bratton Castle article's coordinates, the down from the elevation tiles.
// Frame: origin at the middle of the Danish line, u east along the lines, w south towards Alfred.
import { frame, writePlan } from './lib.mjs';

const f = frame([-2.128, 51.2552], 90), P = f.p, DANES = f.face(90), ENGLISH = f.face(270);
const G = 'pages/030-great-army/050-edington';
const bbox = f.box([[-1450, -2750], [1800, 1000]], 0);
const CAMP = [-1080, -940]; // Bratton Camp, [-2.1435, 51.2637]
const VILLAGE = [1623, -2576]; // Edington, [-2.1047, 51.2785]

const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'english' ? ENGLISH : DANES, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
// each page gets its own objects, so the YAML holds no anchors
const fort = name => unit('danes', 'fort', ...CAMP, 330, 330, 'bratton-camp', name, { facing: 0 });

// --- overview: Alfred's march from Athelney by Egbert's Stone and Iley Oak, the battle card on the field ---
writePlan(`${G}/010-edington`, {
  routes: {
    'alfred-878': {
      name: 'Alfred’s march from Athelney to Egbert’s Stone, Iley Oak and Ethandun, May 878',
      path: [[-2.94, 51.059], [-2.78, 51.07], [-2.6, 51.088], [-2.45, 51.1], [-2.352, 51.115], [-2.25, 51.15], [-2.142, 51.183], [-2.136, 51.22], P(-300, 300)],
    },
  },
  markers: {
    'egberts-stone-878': mark([-2.352, 51.115], 'Egbert’s Stone', 'Muster of three shires, site uncertain', 'english', 'flag'),
    'iley-oak-878': mark([-2.142, 51.183], 'Iley Oak', 'Alfred’s camp before the battle', 'english', 'flag'),
  },
  show: ['athelney-878', 'chippenham-878'],
});

// --- the shield walls meet on the down in front of Bratton Camp ---
writePlan(`${G}/020-edington-shield-wall`, {
  bbox,
  emblem: {
    units: [
      fort('Bratton Camp, an Iron Age hillfort, the Danish stronghold by tradition'),
      unit('danes', 'infantry', 0, 0, 800, 70, 'danes', 'Guthrum’s army, the whole Viking army by Asser, about 4,000 by modern estimates'),
      unit('english', 'infantry', 0, 140, 820, 85, 'west-saxons', 'Alfred’s army in the dense shield wall of Asser’s account, the men of Somerset, Wiltshire and western Hampshire, 2,000 to 6,000 by modern estimates'),
    ],
    arrows: [
      arrow('english', [[-650, 950], [-480, 600], [-320, 250]], 60, 'advance', 'Alfred’s army comes up from Iley Oak at dawn'),
    ],
    clashes: [[-260, 66], [0, 66], [260, 66]].map(([u, w]) => ({ at: P(u, w), size: 100 })),
  },
  markers: {
    'edington-shield-wall-guthrum': mark(P(0, -450), 'Guthrum', 'The whole Viking army', 'danes'),
    'edington-shield-wall-alfred': mark(P(150, 380), 'Alfred', 'Fights long in a dense shield wall', 'english'),
    'edington-shield-wall-village': mark(P(...VILLAGE), 'Edington', 'Village below the scarp', 'english', 'landmark'),
    'edington-shield-wall-camp': mark(P(-1080, -1380), 'Bratton Camp', 'Danish stronghold, by tradition', 'danes', 'flag'),
  },
});

// --- the Danes break and flee into the stronghold, Alfred camps before its gates for fourteen days ---
writePlan(`${G}/030-edington-siege`, {
  bbox,
  emblem: {
    units: [
      fort('Bratton Camp, held by the surviving Danes for fourteen days'),
      unit('english', 'camp', -620, -760, 300, 200, 'alfred-camp', 'Alfred’s army camped before the gates of the stronghold', { facing: 291 }),
    ],
    arrows: [
      arrow('danes', [[-180, -80], [-500, -420], [-880, -790]], 50, 'flight', 'The Danes break and flee to their stronghold', 'dashed'),
      arrow('english', [[250, 0], [-150, -350], [-470, -640]], 50, 'pursuit', 'Alfred pursues them to the gates, killing those he finds outside'),
    ],
  },
  markers: {
    'edington-siege-field': mark(P(150, 250), 'Battlefield', 'Great slaughter, by Asser', 'danes', 'skull'),
    'edington-siege-guthrum': mark(P(-1080, -1380), 'Guthrum', 'Sues for peace after 14 days', 'danes'),
    'edington-siege-alfred': mark(P(80, -880), 'Alfred', 'Camps before the gates', 'english'),
    'edington-siege-village': mark(P(...VILLAGE), 'Edington', 'Village below the scarp', 'english', 'landmark'),
  },
});

console.log('edington-878: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 60)));
