// Otlukbeli, August 1473: Mehmed's march from Istanbul to the Euphrates, the ambush on the river near Tercan on
// 4 August and the battle below the heights of Otlukbeli on 11 August. The river, the stream and the ground come
// from the elevation tiles, the lines from the accounts (README.md).
// Frame of the battle: origin on the floor of the hollow below Otlukbeli at 40.035, 39.976, u east along the lines,
// w south from the Aq Qoyunlu on the slope of the ridge to the Ottomans who come up from the stream valley.
import { frame, writePlan as write } from './lib.mjs';

// shared points would come out as YAML anchors, so each page gets its own copy of the emblem
const writePlan = (dir, plan) => write(dir, { ...plan, emblem: plan.emblem && JSON.parse(JSON.stringify(plan.emblem)) });

const G = 'pages/100-uzun-hasan/030-otlukbeli';
const f = frame([40.035, 39.976], 90), P = f.p, OTT = f.face(270), AQ = f.face(90);
// one bbox for both phases, about 23 km by 23 km: the heights of Otlukbeli in the north-west, the bend of the
// Euphrates in the Tercan plain in the south-east
const bbox = [39.97, 39.81, 40.245, 40.02];

// --- the ground ---
// The Karasu, the western Euphrates, from the elevation tiles at zoom 13: it comes from Aşkale along the foot of the
// hills at 39.93 north, bends south-west into the plain of Tercan and leaves it to the south. Its bed lies at 1,380
// to 1,470 m, the plain beside it 10 to 30 m higher.
const KARASU = [[40.34, 39.935], [40.3, 39.931], [40.275, 39.93], [40.255, 39.929], [40.24, 39.925], [40.222, 39.921], [40.205, 39.918],
  [40.19, 39.915], [40.18, 39.91], [40.172, 39.903], [40.166, 39.897], [40.16, 39.891], [40.152, 39.888], [40.145, 39.881], [40.138, 39.874],
  [40.134, 39.866], [40.134, 39.858], [40.138, 39.851], [40.144, 39.843], [40.151, 39.836], [40.158, 39.828], [40.164, 39.819], [40.169, 39.811],
  [40.175, 39.804], [40.184, 39.797], [40.195, 39.791], [40.206, 39.785], [40.217, 39.779], [40.228, 39.774], [40.236, 39.768], [40.232, 39.76]];
// the stream from the heights east of Otlukbeli down to the Euphrates: north to south along 40.11 east, south-west
// past the junction of three valleys at 40.057, 39.93, then south and east across the plain to the river
const STREAM = [[40.1131, 40.03], [40.1131, 40.01], [40.1131, 39.99], [40.1146, 39.9767], [40.1103, 39.9706], [40.1016, 39.9667],
  [40.0923, 39.9638], [40.0846, 39.9578], [40.0743, 39.95], [40.0665, 39.944], [40.0626, 39.9369], [40.057, 39.93], [40.0522, 39.9241],
  [40.0483, 39.9171], [40.0466, 39.9112], [40.0442, 39.9061], [40.0428, 39.9], [40.038, 39.8909], [40.0424, 39.879], [40.0461, 39.8758],
  [40.0594, 39.8705], [40.0728, 39.864], [40.0867, 39.8633], [40.0994, 39.8651], [40.1068, 39.8628], [40.1152, 39.861], [40.1235, 39.8581],
  [40.1334, 39.8562]];
const water = [
  { path: KARASU, width: 70, id: 'euphrates', name: 'The Euphrates (Karasu), which runs through the plain of Tercan' },
  { path: [[40.1355, 39.8705], [40.134, 39.862], [40.1355, 39.8545], [40.1405, 39.8465]], width: 240, id: 'shallows',
    name: 'Here the river spreads over banks of sand, where an army can cross' },
  { path: STREAM, width: 30, id: 'stream', name: 'A stream that runs from the heights east of Otlukbeli down to the Euphrates' },
];

// --- the units ---
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mk = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- 010 overview: the march from Istanbul to the Euphrates, April to August 1473 ---
writePlan(`${G}/010-otlukbeli`, {
  bbox: [28.3, 36.9, 41.3, 41.75],
  markers: {
    'yenisehir-1473': mk([29.65, 40.26], 'Yenişehir', 'The army gathers, April 1473', 'ottomans', 'tent'),
    'amasya-1473': mk([35.83, 40.65], 'Amasya', 'Seat of Şehzade Bayezid', 'ottomans', 'castle'),
    'sivas-1473': mk([37.016, 39.75], 'Sivas', 'The army passes, summer 1473', 'ottomans', 'tent'),
    'sebinkarahisar-1473': mk([38.42, 40.29], 'Şebinkarahisar', 'Its people flee to the mountains', 'aq-qoyunlu', 'castle'),
    'erzincan-1473': mk([39.49, 39.75], 'Erzincan', 'Ömer Bey beats 5,000 horsemen', 'aq-qoyunlu', 'swords'),
    'tercan-1473': mk([40.39, 39.78], 'Tercan', 'Its people surrender to Mehmed', 'aq-qoyunlu', 'castle'),
  },
  routes: {
    'mehmed-otlukbeli-1473': { name: 'Mehmed’s army marches from Constantinople by Yenişehir, Sivas, Koyulhisar and Şebinkarahisar to Erzincan and up the Euphrates, April – August 1473', color: 'ottomans',
      path: [[28.98, 41.015], [29.03, 41.02], [29.3, 40.88], [29.6, 40.78], [29.9, 40.76], [29.75, 40.55], [29.72, 40.43], [29.65, 40.26],
        [29.85, 40.08], [30.04, 39.91], [30.52, 39.78], [31.0, 39.6], [31.54, 39.45], [32.2, 39.75], [32.86, 39.93], [33.52, 39.85],
        [34.2, 39.8], [34.81, 39.82], [35.19, 39.81], [35.9, 39.85], [36.6, 39.86], [37.016, 39.75], [37.3, 39.9], [37.55, 40.1],
        [37.83, 40.3], [38.1, 40.3], [38.42, 40.29], [38.6, 40.1], [38.77, 39.9], [39.0, 39.82], [39.25, 39.77], [39.49, 39.75],
        [39.62, 39.69], [39.72, 39.635], [39.85, 39.6], [39.94, 39.578], [40.07, 39.556], [40.16, 39.58], [40.19, 39.63], [40.215, 39.68],
        [40.225, 39.73], [40.21, 39.78], [40.18, 39.8], [40.14, 39.83], [40.11, 39.846]] },
  },
  show: ['istanbul-1453', 'konya-1472'],
});

// --- 020 the ambush on the Euphrates, 4 August ---
// Has Murad and Mahmud Pasha cross at the sandbanks east of the camp, Uğurlu Mehmed's horsemen draw Has Murad out
// into the plain, the men in ambush close behind him and drive his troops into the river.
writePlan(`${G}/020-otlukbeli-euphrates`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('ottomans', 'camp', [40.11, 39.8455], 1700, 1200, 90, 'camp', 'The Ottoman camp with Mehmed and the main army, pitched on the west bank at the edge of the sandbanks, where the Ottomans expect Uzun Hasan to cross'),
      unit('ottomans', 'cavalry', [40.1215, 39.8595], 900, 450, 90, 'mahmud', 'Mahmud Pasha’s troops, who cross with Has Murad, suspect a trick and come back across the river'),
      unit('ottomans', 'cavalry', [40.164, 39.8445], 1200, 550, 90, 'has-murad', 'Has Murad Pasha, the young beylerbey of Rumelia, with his troops, surrounded on the east bank. Turahanoğlu Ömer Bey is taken prisoner here'),
      unit('aq-qoyunlu', 'cavalry', [40.188, 39.846], 2000, 700, 270, 'ughurlu', 'Uğurlu Mehmed, a son of Uzun Hasan, with 10,000 horsemen. They ride away as if in flight, then turn on Has Murad'),
      unit('aq-qoyunlu', 'cavalry', [40.18, 39.8665], 1200, 500, 210, 'ambush-north', 'Horsemen hidden in ambush north of the plain'),
      unit('aq-qoyunlu', 'cavalry', [40.182, 39.8255], 1200, 500, 330, 'ambush-south', 'Horsemen hidden in ambush south of the plain'),
      unit('aq-qoyunlu', 'cavalry', [40.228, 39.872], 2200, 800, 270, 'uzun-hasan', 'Uzun Hasan’s army, encamped on the far side of the river'),
    ],
    arrows: [
      arrow('ottomans', [[40.12, 39.851], [40.138, 39.8525], [40.16, 39.852], [40.181, 39.849]], 280, 'cross', 'Has Murad and Mahmud Pasha cross the river and chase the retreating horsemen'),
      arrow('aq-qoyunlu', [[40.18, 39.863], [40.172, 39.856], [40.1655, 39.8495]], 220, 'ambush-ride', 'The men in ambush ride out behind Has Murad'),
      arrow('aq-qoyunlu', [[40.182, 39.829], [40.174, 39.835], [40.1665, 39.8405]], 220, 'ambush-ride', 'The men in ambush ride out behind Has Murad'),
      arrow('ottomans', [[40.1575, 39.8435], [40.151, 39.8425], [40.1445, 39.8425]], 220, 'flight', 'Has Murad’s men are driven back into the river. He drowns with about 4,000 of them', 'dashed'),
      arrow('ottomans', [[40.147, 39.8585], [40.138, 39.859], [40.129, 39.8592]], 200, 'mahmud-back', 'Mahmud Pasha pulls back across the river', 'dashed'),
    ],
    clashes: [{ at: [40.174, 39.8455], size: 600 }, { at: [40.1505, 39.8425], size: 300 }],
  },
  markers: {
    'otlukbeli-euphrates-mahmud': mk([40.12, 39.889], 'Mahmud Pasha', 'Comes back across the river', 'ottomans'),
    'otlukbeli-euphrates-murad': mk([40.15, 39.8345], 'Has Murad Pasha', 'Drowns in the river', 'ottomans', 'skull'),
    'otlukbeli-euphrates-ughurlu': mk([40.205, 39.858], 'Uğurlu Mehmed', 'Leads the ambush', 'aq-qoyunlu'),
    'otlukbeli-euphrates-uzun': mk([40.232, 39.889], 'Uzun Hasan', 'Holds back his army', 'aq-qoyunlu'),
  },
});

// --- 030 the battle of 11 August ---
// The Ottomans come up the stream valley from their camp at the junction of three valleys. The Aq Qoyunlu hold the
// slope of the ridge north of the hollow. The Ottoman left under Davud Pasha and Şehzade Mustafa breaks Zeynel's wing,
// Bayezid on the right drives back Uğurlu Mehmed behind the stream and fights Mehmed Bakır's men, and Mehmed sends in
// the janissaries.
const ZEYNEL = [-2000, -1250], CENTRE = [450, -1500], LEFT = [3300, -1250];
writePlan(`${G}/030-otlukbeli-battle`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('ottomans', 'camp', [40.06, 39.934], 1500, 1100, 0, 'camp', 'The Ottoman camp at Üç Ağız, the junction of three valleys near Tercan, a narrow place where the army halts on 11 August'),
      unit('ottomans', 'cavalry', P(-2750, -500), 1300, 600, OTT, 'davud', 'Davud Pasha, the beylerbey of Anatolia, with the Anatolian troops. He throws back Gavur İshak and takes his post on the plain'),
      unit('ottomans', 'cavalry', P(-1300, -500), 1500, 600, OTT, 'mustafa', 'Şehzade Mustafa, the governor of Karaman, with his troops and the azebs, the foot soldiers among whom Zeynel is killed'),
      unit('ottomans', 'artillery', P(450, 350), 1000, 150, OTT, 'guns', 'The janissaries’ guns and the light mortars that Mehmed has cast for this campaign', { count: 10 }),
      unit('ottomans', 'infantry', P(450, 700), 1400, 500, OTT, 'janissaries', 'The janissaries, about 25,000, whom Mehmed sends in when the Aq Qoyunlu right has broken', { bow: 60 }),
      unit('ottomans', 'cavalry', P(450, 1350), 800, 450, OTT, 'mehmed', 'Mehmed with the horsemen of his household'),
      unit('ottomans', 'cavalry', P(LEFT[0], -500), 2400, 600, OTT, 'bayezid', 'Şehzade Bayezid, the governor of Amasya, with the right wing'),
      unit('aq-qoyunlu', 'cavalry', P(...ZEYNEL), 2800, 800, AQ, 'zeynel', 'The right wing under Zeynel, a son of Uzun Hasan, with Sufi Khalil Mawsillu and Sulayman Bijan'),
      unit('aq-qoyunlu', 'cavalry', P(...CENTRE), 1900, 800, AQ, 'centre', 'Uzun Hasan’s centre on the slope of the ridge, with Pir Ahmed of Karaman. Most of his army are horsemen, with foot soldiers armed with lances'),
      unit('aq-qoyunlu', 'cavalry', P(...LEFT), 2400, 800, AQ, 'left', 'The left wing under Uzun Hasan’s nephews Murad and Alikhan, with Mehmed Bakır'),
      unit('aq-qoyunlu', 'cavalry', [40.128, 39.981], 1400, 700, 270, 'ughurlu', 'Uğurlu Mehmed with a swift force on a hill behind the stream, to back up the left wing'),
    ],
    arrows: [
      arrow('aq-qoyunlu', [P(-400, 300), P(-400, -400), P(-350, -1150)], 220, 'ishak', 'At noon Gavur İshak’s men come down from the hill of Otlukbeli. Davud Pasha’s Anatolian troops throw them back to the main army', 'dashed'),
      arrow('ottomans', [P(-1300, 100), P(-1400, -700), P(-1800, -1350)], 300, 'mustafa-charge', 'Mustafa falls on Zeynel’s wing. Zeynel is killed and the Aq Qoyunlu right breaks'),
      arrow('ottomans', [P(3800, 0), P(5000, -600), P(6700, -700)], 260, 'bayezid-attack', 'Bayezid attacks Uğurlu Mehmed, who holds the stream between them, and then turns on Mehmed Bakır’s men'),
      arrow('ottomans', [P(450, 400), P(450, -300), P(450, -1050)], 320, 'janissaries-advance', 'Mehmed sends the janissaries forward'),
      arrow('aq-qoyunlu', [P(450, -2000), P(1500, -2900), P(2800, -3400)], 240, 'flight', 'Uzun Hasan leaves the field. Pir Mehmed Bey, who looks like him, stays behind in his place and is taken', 'dashed'),
    ],
    clashes: [{ at: P(-2000, -825), size: 600 }, { at: P(LEFT[0], -825), size: 450 }, { at: [40.117, 39.9785], size: 300 }],
  },
  markers: {
    'otlukbeli-battle-mehmed': mk(P(0, 2500), 'Mehmed II', 'Watches with his household', 'ottomans'),
    'otlukbeli-battle-mustafa': mk(P(-3200, 900), 'Şehzade Mustafa', 'Breaks the Aq Qoyunlu right', 'ottomans'),
    'otlukbeli-battle-bayezid': mk(P(3800, 500), 'Şehzade Bayezid', 'Leads the right wing', 'ottomans'),
    'otlukbeli-battle-zeynel': mk(P(-3300, -3000), 'Zeynel', 'Killed by an azeb', 'aq-qoyunlu', 'skull'),
    'otlukbeli-battle-uzun': mk(P(450, -3700), 'Uzun Hasan', 'Flees the field', 'aq-qoyunlu'),
    'otlukbeli-battle-ughurlu': mk([40.137, 39.966], 'Uğurlu Mehmed', 'Holds the stream, then withdraws', 'aq-qoyunlu'),
  },
});

console.log('otlukbeli: phase bbox', JSON.stringify(bbox), 'ottoman line', JSON.stringify(P(-3300, 800)), 'to', JSON.stringify(P(4500, 800)),
  'aq line', JSON.stringify(P(-3300, -1100)), 'to', JSON.stringify(P(4500, -1100)));
