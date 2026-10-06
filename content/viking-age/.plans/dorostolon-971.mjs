// Dorostolon, 971. Tzimiskes beats the Rus' before the town on 23 April, camps on a rise and closes the Danube with his
// fleet, and wins the last battle in July. Leo the Deacon and John Skylitzes give no distances, so the field is the
// plain south of the walls and the camp a rise beyond it. The Danube banks are traced from OpenStreetMap at Silistra,
// and the wall from the plan of the medieval fortress of Drastar, fitted to the wall remains mapped in the town.
// Units, arrows and markers are metres in a frame on the battle line, drawn larger than real as the README's
// "Drawn size" asks. Facings are compass bearings.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/070-rus/070-dorostolon';
const SITE = [27.2618, 44.1212];

// The Danube: the right bank west to east, the Ostrov arm, the island between the arms, the left bank back west.
const danube = {
  id: 'danube', name: 'The Danube',
  area: [[27.235, 44.1131], [27.2419, 44.1136], [27.2467, 44.1152], [27.2517, 44.117], [27.2537, 44.1177], [27.2581, 44.1203], [27.2591, 44.1216],
    [27.26, 44.122], [27.2622, 44.1229], [27.2632, 44.1237], [27.2649, 44.1242], [27.2671, 44.1246], [27.2688, 44.1249], [27.2723, 44.1248],
    [27.2738, 44.1244], [27.2761, 44.1234], [27.2776, 44.1224], [27.2787, 44.1216], [27.2794, 44.1208], [27.28, 44.1196], [27.2806, 44.1184],
    [27.2817, 44.1168], [27.2836, 44.1139], [27.2861, 44.112], [27.2886, 44.1107], [27.2914, 44.1097], [27.2977, 44.1101], [27.2994, 44.113],
    [27.2934, 44.1122], [27.2892, 44.1133], [27.2873, 44.1148], [27.2855, 44.1175], [27.2848, 44.1193], [27.2845, 44.1207], [27.284, 44.1217],
    [27.2834, 44.1228], [27.2825, 44.1242], [27.2818, 44.125], [27.2805, 44.126], [27.2803, 44.1264], [27.2807, 44.1267], [27.2856, 44.1283],
    [27.2879, 44.1277], [27.291, 44.1293], [27.2945, 44.1295], [27.2985, 44.1431], [27.2941, 44.142], [27.2908, 44.1406], [27.2877, 44.1394],
    [27.2834, 44.1375], [27.2806, 44.1365], [27.2771, 44.1345], [27.2734, 44.133], [27.2725, 44.1326], [27.2695, 44.1313], [27.2675, 44.1306],
    [27.2647, 44.1295], [27.2633, 44.1289], [27.2618, 44.1283], [27.2597, 44.1281], [27.2556, 44.1264], [27.2511, 44.1242], [27.2484, 44.1232],
    [27.2397, 44.1202], [27.235, 44.119], [27.235, 44.1131]],
};

// The wall: corners read off the fortress plan (pixels, about 0.8 m each), turned 10° to lie along the bank.
const wallPlan = [[230, 240], [450, 180], [700, 95], [815, 170], [815, 320], [810, 445], [760, 490], [575, 545], [360, 580], [240, 560], [150, 500],
  [100, 425], [230, 240]];
const fromPlan = ([x, y]) => {
  const e = (x - 230) * 0.8, n = -(y - 240) * 0.8, a = 10 * Math.PI / 180;
  const e2 = e * Math.cos(a) - n * Math.sin(a), n2 = e * Math.sin(a) + n * Math.cos(a);
  return [+(27.2595 + e2 / 79900).toFixed(5), +(44.1219 + n2 / 111200).toFixed(5)];
};
const wall = { side: 'neutral', path: wallPlan.map(fromPlan), width: 18, style: 'wall', id: 'wall', name: 'The walls of Dorostolon on the bank of the Danube' };
const southGate = fromPlan([575, 545]);

// f.p(north, east) in metres from the town. b.p(along, across) on the battle line, along runs east-north-east
// parallel to the south wall, across towards the Byzantines.
const f = frame(SITE, 0), P = f.p;
const b = frame(P(-560, 60), 67), B = b.p, BP = b.path, RUS = b.face(90), BYZ = b.face(270);
const box = f.box([[-1900, -850], [1450, 1750]], 0);

const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

const camp = unit('byzantium', 'camp', B(-650, 950), 300, 300, BYZ, 'camp', 'Byzantine camp on a low rise, with a ditch and a rampart set with spears hung with shields');
const fleet = unit('byzantium', 'ships', P(880, 1060), 520, 300, 240, 'fleet', 'Byzantine fleet of fire-bearing warships and grain transports, 300 ships in all', { count: 6, rows: 2 });
const boats = unit('rus', 'ships', P(330, 430), 300, 90, 330, 'boats', 'Rus\' boats drawn up on the bank under the walls, out of reach of the Greek fire', { count: 5 });

// --- overview: Tzimiskes marches by Adrianople and the Balkan passes to Preslav and Dorostolon, the fleet sails up the Danube ---
writePlan(`${G}/010-dorostolon`, {
  routes: {
    'tzimiskes-971': {
      name: 'John Tzimiskes marches from Constantinople to Preslav and Dorostolon, April 971',
      path: [[28.97, 41.02], [28.6, 41.06], [28.2, 41.1], [27.7, 41.28], [27.35, 41.4], [26.95, 41.55], [26.56, 41.68], [26.5, 42.2], [26.4, 42.65], [26.55, 42.9],
        [26.82, 43.16], [26.93, 43.27], [27.05, 43.55], [27.15, 43.85], [27.22, 44.05], [27.26, 44.11]],
    },
    'fleet-971': {
      name: 'The Byzantine fleet sails into the Danube and up to Dorostolon, April 971',
      path: [[28.98, 41.03], [29.03, 41.07], [29.07, 41.17], [29.12, 41.24], [28.6, 41.65], [28.35, 42.3], [28.65, 42.9], [28.95, 43.6], [29.3, 44.3], [29.75, 44.92],
        [29.6, 44.88], [29.3, 45.0], [29.08, 45.08], [28.8, 45.18], [28.46, 45.27], [28.2, 45.36], [28.05, 45.43], [27.97, 45.27], [27.95, 45.0], [27.95, 44.69],
        [28.03, 44.34], [27.85, 44.24], [27.6, 44.18], [27.42, 44.15], [27.29, 44.13]],
    },
  },
  markers: {
    'constantinople-971': mark([28.975, 41.012], 'Constantinople', 'Tzimiskes sets out, spring 971', 'byzantium', 'flag'),
    'adrianople-971': mark([26.56, 41.68], 'Adrianople', 'On the road to the passes', 'byzantium', 'flag'),
    'preslav-971': mark([26.82, 43.16], 'Preslav', 'Stormed, 13 April 971', 'byzantium', 'swords'),
  },
});

// --- 23 April: the shield wall before the town, the cavalry charge at evening, the camp and the fleet of the next days ---
writePlan(`${G}/020-dorostolon-walls`, {
  bbox: box,
  emblem: {
    water: [danube],
    works: [wall],
    units: [
      unit('rus', 'infantry', B(0, 0), 1500, 70, RUS, 'rus', 'Sviatoslav’s Rus\' and Bulgarians in a wall of shields, 60,000 in the army by Leo the Deacon'),
      unit('byzantium', 'infantry', B(0, 160), 1000, 90, BYZ, 'infantry', 'Byzantine heavy infantry, 15,000 in the army by Leo the Deacon'),
      unit('byzantium', 'knights', B(-760, 170), 380, 110, BYZ, 'cavalry', 'Byzantine armoured cavalry on both wings, 13,000 horsemen in the army by Leo the Deacon'),
      unit('byzantium', 'knights', B(760, 170), 380, 110, BYZ, 'cavalry', 'Byzantine armoured cavalry on both wings, 13,000 horsemen in the army by Leo the Deacon'),
      unit('byzantium', 'archers', B(0, 255), 1100, 60, BYZ, 'archers', 'Byzantine archers and slingers shooting over the front line'),
      camp, fleet, boats,
    ],
    arrows: [
      arrow('byzantium', BP([[-860, 110], [-820, 30], [-700, 0]]), 120, 'charge', 'Towards evening Tzimiskes sends in all his cavalry'),
      arrow('byzantium', BP([[860, 110], [820, 30], [700, 0]]), 120, 'charge', 'Towards evening Tzimiskes sends in all his cavalry'),
      arrow('rus', [B(0, -50), B(-60, -220), southGate], 110, 'flight', 'The Rus\' break and flee into the town', 'dashed'),
      arrow('byzantium', f.path([[1300, 1650], [1120, 1350], [930, 1140]]), 110, 'fleet-arrival', 'The fleet comes up the Danube and closes the river, 25 April'),
    ],
    clashes: [[-400, 80], [0, 80], [400, 80]].map(([u, w]) => ({ at: B(u, w), size: 90 })),
  },
  markers: {
    'dorostolon-walls-sviatoslav': mark(B(-450, -260), 'Sviatoslav', undefined, 'rus'),
    'dorostolon-walls-tzimiskes': mark(B(300, 420), 'John Tzimiskes', 'Sends in the cavalry at evening', 'byzantium'),
    'dorostolon-walls-camp': mark(B(-200, 1000), 'Byzantine camp', 'Built the next day, 24 April', 'byzantium', 'flag'),
    'dorostolon-walls-fleet': mark(P(1250, 640), 'Byzantine fleet', 'Greek fire closes the river', 'byzantium', 'ship'),
    'dorostolon-walls-town': mark(P(20, -40), 'Dorostolon', 'Modern Silistra', 'rus', 'landmark'),
  },
});

// --- late July: the Rus' come out, Romanos and Peter fall back, Skleros gets behind them, Tzimiskes charges, the way back ---
writePlan(`${G}/030-dorostolon-last`, {
  bbox: box,
  emblem: {
    water: [danube],
    works: [wall],
    units: [
      unit('rus', 'infantry', B(100, 600), 1200, 70, RUS, 'rus', 'Sviatoslav’s army, out of the town with the gates shut behind it'),
      unit('byzantium', 'infantry', B(100, 780), 900, 90, BYZ, 'romanos-peter', 'Byzantine troops under the patrikios Romanos and the stratopedarch Peter, who fall back and draw the Rus\' onto the open plain'),
      unit('byzantium', 'cavalry', B(0, 420), 800, 100, RUS, 'skleros', 'Bardas Skleros’s division, sent round to cut the Rus\' off from the town'),
      unit('byzantium', 'knights', B(830, 600), 300, 110, b.face(180), 'tzimiskes', 'John Tzimiskes with a fresh unit of horsemen'),
      camp, fleet, boats,
    ],
    arrows: [
      arrow('byzantium', BP([[-300, 850], [-650, 680], [-600, 460], [-420, 420]]), 110, 'skleros-ride', 'Bardas Skleros rides round the Rus\' flank to cut them off from the town'),
      arrow('byzantium', BP([[1150, 680], [1010, 620], [905, 600]]), 100, 'tzimiskes-charge', 'Tzimiskes leads a fresh charge of horsemen'),
      arrow('rus', [B(-100, 560), B(-60, 300), B(80, -120), southGate], 110, 'return', 'The Rus\' fight their way back into the town', 'dashed'),
    ],
    clashes: [[100, 685], [0, 518], [737, 600]].map(([u, w]) => ({ at: B(u, w), size: 90 })),
  },
  markers: {
    'dorostolon-last-sviatoslav': mark(B(-500, -120), 'Sviatoslav', 'Wounded by Anemas, who is killed', 'rus'),
    'dorostolon-last-skleros': mark(B(420, 140), 'Bardas Skleros', 'Cuts the Rus\' off from the town', 'byzantium'),
    'dorostolon-last-tzimiskes': mark(B(1150, 820), 'John Tzimiskes', 'Leads a fresh cavalry charge', 'byzantium'),
    'dorostolon-last-romanos': mark(B(100, 950), 'Romanos and Peter', 'Feign a retreat', 'byzantium'),
    'dorostolon-last-peace': mark(P(410, 700), 'Peace on the bank', 'Sviatoslav meets Tzimiskes', 'rus', 'scroll'),
  },
});

console.log('dorostolon-971: bbox', JSON.stringify(box), 'wall', JSON.stringify(wall.path), 'south gate', JSON.stringify(southGate));
