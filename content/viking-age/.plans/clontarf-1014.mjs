// Clontarf, Good Friday, 23 April 1014. The plan follows the Cogad Gáedel re Gallaib as Duffy (2013) reads it: the
// army of Dublin and Leinster marches out of the town over the Liffey and the Tolka and meets the fleet that comes
// in to Clontarf on the morning tide. The Cogad names the battalions and who fought whom: the Dál gCais against the
// Vikings from overseas, the Connachta against the Dubliners. The plan sets the pairs side by side along the shore,
// the Vikings with the sea behind them. Brian's tent, the wood and the weir have no known place.
// Water is the shore of 1014: north of the Liffey it runs along Amiens Street, North Strand and Fairview Strand
// (the land east of them is reclaimed), then along Clontarf Road. Shores and rivers follow OpenStreetMap. The town of
// Dublin lies 4 km south-west of the field, outside the frame.
// Frame: origin on the field at Clontarf, u east-south-east along the shore, w south-south-west towards the sea.
import { frame, writePlan } from './lib.mjs';

const f = frame([-6.2155, 53.3637], 105), P = f.p, NORSE = f.face(270), IRISH = f.face(90);
const G = 'pages/060-ireland/060-clontarf';
const bbox = [-6.258, 53.35, -6.188, 53.38];

const liffey = { id: 'liffey', name: 'The Liffey', width: 150, path: [
  [-6.2900, 53.3470], [-6.2837, 53.3467], [-6.2780, 53.3460], [-6.2723, 53.3453], [-6.2680, 53.3456], [-6.2638, 53.3462],
  [-6.2600, 53.3470], [-6.2560, 53.3476], [-6.2530, 53.3478]] };
const tolka = { id: 'tolka', name: 'The Tolka', width: 50, path: [
  [-6.2720, 53.3730], [-6.2658, 53.3725], [-6.2628, 53.3713], [-6.2577, 53.3687], [-6.2533, 53.3681], [-6.2509, 53.3667],
  [-6.2474, 53.3642], [-6.2426, 53.3621], [-6.2395, 53.3608]] };
// Dublin Bay and the mouth of the Liffey at the shore line of 1014
const bay = { id: 'bay', name: 'Dublin Bay and the mouth of the Liffey, with the shore of 1014', area: [
  [-6.2560, 53.3488], [-6.2535, 53.3492], [-6.2505, 53.3500], [-6.2488, 53.3522], [-6.2460, 53.3546], [-6.2440, 53.3565],
  [-6.2412, 53.3585], [-6.2392, 53.3602], [-6.2405, 53.3614], [-6.2425, 53.3618], [-6.2420, 53.3622], [-6.2365, 53.3625],
  [-6.2330, 53.3630], [-6.2298, 53.3638], [-6.2236, 53.3629], [-6.2190, 53.3620], [-6.2125, 53.3598], [-6.2029, 53.3594],
  [-6.1978, 53.3585], [-6.1939, 53.3573], [-6.1850, 53.3592], [-6.1800, 53.3612], [-6.1760, 53.3636], [-6.1700, 53.3640],
  [-6.1700, 53.3300], [-6.2087, 53.3300], [-6.2103, 53.3328], [-6.2126, 53.3343], [-6.2190, 53.3378], [-6.2250, 53.3410],
  [-6.2314, 53.3417], [-6.2370, 53.3424], [-6.2440, 53.3440], [-6.2480, 53.3452], [-6.2530, 53.3459], [-6.2575, 53.3462],
  [-6.2590, 53.3472]] };
// the evening flood tide over the strand at the mouth of the Tolka, between the field and the wood
const flood = { id: 'flood', name: 'The evening flood tide fills the mouth of the Tolka', area: [
  [-6.2485, 53.3648], [-6.2450, 53.3645], [-6.2410, 53.3640], [-6.2370, 53.3640], [-6.2330, 53.3644], [-6.2298, 53.3638],
  [-6.2365, 53.3625], [-6.2392, 53.3602], [-6.2440, 53.3616], [-6.2480, 53.3635]] };

// the base map's coast cuts across Clontarf and shows sea east of it; this is the ground between that coast and the
// shore of 1014
const ground = [{ area: [[-6.2112, 53.3598], [-6.2029, 53.3594], [-6.1978, 53.3585], [-6.1939, 53.3573], [-6.1850, 53.3592],
  [-6.1800, 53.3612], [-6.1760, 53.3636], [-6.1650, 53.3680], [-6.1500, 53.3780], [-6.1400, 53.3850], [-6.1330, 53.3920],
  [-6.1510, 53.3870], [-6.1580, 53.3850]] }];

const bridge = { side: 'neutral', path: [[-6.2458, 53.36244], [-6.2442, 53.36376]], width: 30, id: 'dubgall-bridge', name: 'Dubgall’s Bridge, which Seán Duffy places on the Tolka' };
const weir = { side: 'neutral', path: [[-6.2385, 53.3598], [-6.2330, 53.3606], [-6.2270, 53.3612]], width: 25, style: 'trench', id: 'weir', name: 'The fishing weir of Clontarf, where Toirdelbach drowns, at an approximate place' };

const unit = (side, type, at, width, depth, id, name, extra = {}) => ({ side, type, at, width, depth, facing: side === 'celts' ? IRISH : NORSE, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
// shared points would come out as YAML anchors, so each page gets its own copy
const copy = x => JSON.parse(JSON.stringify(x));

const tent = unit('celts', 'camp', P(-500, -1300), 240, 200, 'tent', 'Brian’s tent behind the lines, guarded by a few men', { facing: IRISH });
const meath = unit('celts', 'infantry', P(-1250, -700), 450, 120, 'meath', 'Máel Sechnaill, king of Tara, and the men of Meath, standing apart by the Cogad’s account');
// the road from the town: over the Liffey, along the north bank and over the Tolka at Dubgall's Bridge
const fromTown = [[-6.2600, 53.3545], [-6.2530, 53.3580], [-6.2450, 53.3631], [-6.2380, 53.3652]];

// the sea road west of Scotland between Orkney and Dublin: the Pentland Firth, the Minch, the North Channel
const west = [
  [-3.05, 58.9], [-3.05, 58.83], [-3.1, 58.75], [-3.4, 58.7], [-4.0, 58.7], [-5.0, 58.72], [-5.6, 58.4], [-6.0, 58.1], [-6.6, 57.85],
  [-6.95, 57.5], [-7.0, 57.0], [-7.1, 56.6], [-6.75, 56.2], [-6.65, 55.75], [-6.3, 55.45], [-5.85, 55.15], [-5.38, 54.8], [-5.38, 54.35],
  [-5.75, 53.85], [-5.95, 53.42], [-6.1, 53.345], [-6.2, 53.355]];

// --- overview: the fleets from Orkney and Man, Brian's march, the burning of Fine Gall; the battle card at Clontarf ---
writePlan(`${G}/010-clontarf`, {
  routes: {
    'sigtrygg-1013': { name: 'Sigtrygg sails to Orkney to win Earl Sigurd, by Njáls saga, winter 1013–1014', style: 'dashed', path: [...west].reverse() },
    'sigurd-1014': { name: 'Sigurd, earl of Orkney, sails to Dublin, Holy Week 1014', offset: 6, path: west },
    'brodir-1014': { name: 'Brodir’s fleet from the Isle of Man to Dublin, Holy Week 1014', path: [
      [-4.48, 54.15], [-4.45, 54.1], [-4.65, 54.0], [-4.9, 53.93], [-5.5, 53.6], [-5.9, 53.42], [-6.1, 53.345], [-6.2, 53.352]] },
    'brian-1014': { name: 'Brian’s march from Kincora to Dublin, April 1014', path: [
      [-8.441, 52.806], [-8.15, 52.86], [-7.75, 52.95], [-7.35, 53.05], [-6.911, 53.158], [-6.7, 53.24], [-6.5, 53.3], [-6.3215, 53.3431]] },
    'meath-1014': { name: 'Máel Sechnaill and the men of Meath join Brian, April 1014', path: [
      [-6.612, 53.578], [-6.55, 53.47], [-6.43, 53.39], [-6.3215, 53.3431]] },
    'fine-gall-1014': { name: 'Brian’s men burn the country north of Dublin as far as Howth, by the Cogad, April 1014', path: [
      [-6.3215, 53.3431], [-6.33, 53.36], [-6.3, 53.39], [-6.22, 53.41], [-6.13, 53.4], [-6.066, 53.386]] },
  },
  markers: {
    'orkney-1014': mark([-3.05, 58.93], 'Orkney', 'Earl Sigurd sets out', 'norse', 'flag'),
    'man-1014': mark([-4.48, 54.15], 'Isle of Man', 'Brodir’s fleet sets out', 'norse', 'ship'),
    'kincora-1014': mark([-8.441, 52.806], 'Kincora', 'Brian sets out', 'celts', 'flag'),
    'kilmainham-1014': mark([-6.3215, 53.3431], 'Kilmainham', 'Brian’s camp', 'celts', 'flag'),
    'howth-1014': mark([-6.066, 53.386], 'Howth', 'Burned by Brian’s men', 'celts', 'flame'),
    'dublin-1014': mark([-6.27, 53.343], 'Dublin', 'Sigtrygg Silkbeard’s town', 'norse', 'flag'),
  },
});

// --- the lines: three battalions a side along the shore, the fleet on the strand, fighting all day ---
writePlan(`${G}/020-clontarf-lines`, {
  bbox,
  emblem: copy({
    land: ground,
    water: [bay, liffey, tolka],
    works: [bridge],
    units: [
      tent, meath,
      unit('norse', 'infantry', P(-700, 150), 520, 150, 'dubliners', 'The men of Dublin under Dubgall, brother of King Sigtrygg, and Gilla Ciaráin'),
      unit('norse', 'infantry', P(-120, 150), 560, 150, 'leinster', 'The Leinstermen under Máel Mórda, king of Leinster'),
      unit('norse', 'infantry', P(430, 150), 520, 150, 'foreigners', 'The Vikings from overseas under Sigurd, earl of Orkney, Brodir of Man and the champion Plait, in mail'),
      unit('norse', 'ships', P(520, 560), 800, 400, 'fleet', 'The fleets of Orkney and Man on the strand at Clontarf', { count: 8, rows: 2 }),
      unit('celts', 'infantry', P(-700, -80), 520, 150, 'connacht', 'The men of Connacht under Mael Ruanaid Ua hEidhin, king of Uí Fiachrach Aidhne, and Tadhg Ua Cellaigh, king of Uí Maine'),
      unit('celts', 'infantry', P(-120, -80), 560, 150, 'munster', 'The men of Munster under Mothla, king of the Déisi, and Magnus, king of Uí Liatháin'),
      unit('celts', 'infantry', P(430, -80), 520, 150, 'dal-gcais', 'The Dál gCais, Brian’s own people, under his son Murchad, with Murchad’s son Toirdelbach, fifteen'),
    ],
    arrows: [
      arrow('norse', [...fromTown, P(-1050, 150)], 60, 'march-out', 'The army of Dublin and Leinster marches out of the town at dawn, over the Liffey and the Tolka'),
      arrow('norse', [[-6.1880, 53.3470], [-6.1950, 53.3500], P(560, 800)], 60, 'fleet-in', 'The fleet in Dublin Bay comes in to Clontarf on the morning high tide'),
    ],
    clashes: [-700, -120, 430].map(u => ({ at: P(u, 35), size: 100 })),
  }),
  markers: {
    'clontarf-lines-murchad': mark(P(800, -260), 'Murchad', 'Leads the Dál gCais', 'celts'),
    'clontarf-lines-sigurd': mark(P(980, 330), 'Sigurd and Brodir', 'Orkney and Man, in front', 'norse'),
    'clontarf-lines-mael-morda': mark(P(-120, 320), 'Máel Mórda', 'King of Leinster', 'norse'),
    'clontarf-lines-mael-sechnaill': mark(P(-1650, -700), 'Máel Sechnaill', 'King of Tara, stands apart', 'celts'),
    'clontarf-lines-brian': mark(P(-150, -1300), 'Brian', 'Prays in his tent', 'celts'),
  },
});

// --- the rout: the tide comes in, the Vikings are driven into the sea, Brodir kills Brian in his tent ---
writePlan(`${G}/030-clontarf-rout`, {
  bbox,
  emblem: copy({
    land: ground,
    water: [bay, flood, liffey, tolka],
    works: [bridge, weir],
    units: [
      { ...tent, name: 'Brian’s tent, where Brodir kills him' },
      { ...meath, name: 'Máel Sechnaill and the men of Meath. The Annals of the Four Masters say that he completes the rout' },
      unit('norse', 'irregular', P(-1000, 190), 420, 110, 'dubliners', 'The men of Dublin, cut down by the men of Connacht. By the Cogad 20 of them survive'),
      unit('norse', 'irregular', P(-300, 230), 520, 110, 'leinster', 'The Leinstermen break. Máel Mórda, king of Leinster, is killed'),
      unit('norse', 'irregular', P(430, 250), 520, 110, 'foreigners', 'The Vikings from overseas break and make for their ships'),
      unit('norse', 'ships', P(700, 1050), 800, 400, 'fleet', 'The rising tide carries the ships away from the shore', { count: 8, rows: 2, facing: 150 }),
      unit('celts', 'infantry', P(-850, 30), 450, 150, 'connacht', 'The men of Connacht. By the Cogad 100 of them survive'),
      unit('celts', 'infantry', P(-250, 60), 560, 150, 'munster', 'The men of Munster'),
      unit('celts', 'infantry', P(430, 90), 520, 150, 'dal-gcais', 'The Dál gCais under Murchad drive the Vikings into the sea'),
    ],
    arrows: [
      arrow('norse', [P(430, 310), P(420, 450), P(400, 620)], 60, 'foreigners-flight', 'The Vikings flee into the sea towards their ships, and many drown', 'dashed'),
      arrow('norse', [P(-300, 290), P(-800, 340), P(-1300, 340), P(-1850, 270)], 60, 'leinster-flight', 'The Leinstermen make for the wood, and the tide cuts them off at the mouth of the Tolka', 'dashed'),
      arrow('norse', [P(-1050, 150), ...fromTown.slice().reverse()], 60, 'dublin-flight', 'The last men of Dublin flee by Dubgall’s Bridge towards the town, and few reach it', 'dashed'),
      arrow('celts', [P(430, 170), P(420, 360)], 60, 'pursuit', 'Murchad’s men follow the Vikings into the water'),
      arrow('norse', [P(750, 220), P(950, -250), P(700, -900), P(0, -1280), P(-370, -1300)], 50, 'brodir', 'Brodir and a few followers slip away from the fight and come on Brian’s tent'),
    ],
    clashes: [{ at: P(430, 185), size: 100 }, { at: P(-340, -1300), size: 90 }, { at: [-6.2450, 53.3631], size: 90 }],
  }),
  markers: {
    'clontarf-rout-brian': mark(P(-900, -1350), 'Brian', 'Killed in his tent by Brodir', 'celts', 'skull'),
    'clontarf-rout-brodir': mark(P(-200, -1000), 'Brodir', 'Killed beside Brian’s tent', 'norse', 'skull'),
    'clontarf-rout-murchad': mark(P(430, -470), 'Murchad', 'Kills Sigurd, then is killed', 'celts', 'skull'),
    'clontarf-rout-sigurd': mark(P(900, 250), 'Sigurd', 'Earl of Orkney, killed', 'norse', 'skull'),
    'clontarf-rout-toirdelbach': mark([-6.2330, 53.3590], 'Toirdelbach', 'Drowned at the weir', 'celts', 'skull'),
    'clontarf-rout-wood': mark([-6.2535, 53.3592], 'Tomar’s Wood', 'Place uncertain', 'celts', 'trees'),
  },
});

console.log('clontarf-1014: bbox', JSON.stringify(bbox), 'field at', JSON.stringify(P(0, 35)));
