// Pelekanon, 10–11 June 1329. Andronikos III and Kantakouzenos, marching east along the Marmara coast toward
// Nicomedia, find Orhan's army on the hills across the road (Kantakouzenos, Histories 2, and Nicol, The Reluctant Emperor).
// The site follows the identification of Pelekanon between Darıca and Eskihisar and of Philokrene between Darıca and
// Tuzla (Uzunçarşılı). Other historians put Pelekanon at Maltepe. The coast is the base map's, from harita coast.
// Frame: origin on the Byzantine line, u inland along it to the north-west, w from the Byzantines toward the hills.
import { frame, writePlan } from './lib.mjs';

const f = frame([29.396, 40.768], 315), P = f.p, BYZ = f.face(90), OTT = f.face(270);
const G = 'pages/030-bithynia/010-pelekanon';
// from the bay west of Philokrene to the hills above Eskihisar, the same on both phase pages
const bbox = [29.345, 40.748, 29.432, 40.802];
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'byzantium' ? BYZ : OTT, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
// the bearing of a move from one local point to another, for units on the march
const toward = ([u0, w0], [u1, w1]) => f.face(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI);

const ARMY = 'The army has about 4,000 men, 2,000 from Constantinople and fewer from Thrace';
const HILLS = 'Drawn on the hills above Darıca and Eskihisar, after the identification of Pelekanon used here';

// --- overview: the march from Constantinople, Orhan comes to the hills ---
writePlan(`${G}/010-pelekanon`, {
  routes: {
    'andronikos-1329': { color: 'byzantium', name: 'Andronikos III and John Kantakouzenos cross to Asia and march along the coast toward Nicomedia, June 1329',
      path: [[28.975, 41.012], [29.0, 41.02], [29.022, 41.02], [29.045, 40.99], [29.09, 40.963], [29.13, 40.937], [29.2, 40.906], [29.25, 40.89],
        [29.28, 40.866], [29.31, 40.845], [29.345, 40.815], [29.355, 40.795], [29.357, 40.775], [29.385, 40.768]] },
    'orhan-1329': { color: 'ottomans', name: 'Orhan’s army takes position on the hills above Pelekanon',
      path: [[29.72, 40.43], [29.8, 40.52], [29.88, 40.62], [29.95, 40.71], [29.95, 40.78], [29.85, 40.795], [29.7, 40.8], [29.55, 40.805], [29.46, 40.8], [29.415, 40.788]] },
  },
  markers: {},
  show: ['constantinople', 'nicaea', 'nicomedia'],
});

// --- 10 June: the archers, and the fight at the foot of the hills ---
writePlan(`${G}/020-pelekanon-hills`, {
  bbox,
  emblem: {
    units: [
      unit('byzantium', 'infantry', 100, 200, 800, 200, 'byz-foot', `Byzantine foot soldiers, the right resting on the sea. ${ARMY}`),
      unit('byzantium', 'cavalry', 1050, 250, 900, 220, 'byz-horse', 'Byzantine horsemen under Andronikos III and the megas domestikos John Kantakouzenos'),
      unit('ottomans', 'cavalry', 700, 2800, 2000, 300, 'orhan-army', `Orhan’s army, about 8,000, on the hills across the road to Nicomedia. ${HILLS}`),
      unit('ottomans', 'camp', 500, 3400, 500, 350, 'orhan-camp', 'Orhan’s camp on the hills'),
      unit('ottomans', 'cavalry', 800, 1500, 450, 140, 'archers', '300 mounted archers, sent down to draw the Byzantines up the slopes'),
    ],
    arrows: [
      arrow('ottomans', [[450, 2600], [420, 1900], [350, 450]], 130, 'archers-ride', 'The 300 archers ride down and shoot at the Byzantine line'),
      arrow('ottomans', [[700, 500], [780, 1000], [800, 1420]], 110, 'archers-back', 'Driven off, the archers fall back toward the hills', 'dashed'),
      arrow('byzantium', [[1100, 420], [1050, 900], [950, 1320]], 140, 'byz-follow', 'The Byzantines follow to the foot of the hills and stop there'),
      arrow('ottomans', [[-150, 2600], [-220, 1500], [-100, 450]], 140, 'turks-attack', 'Turkish horsemen come down from the hills again and again until nightfall'),
    ],
    clashes: [{ at: P(-60, 370), size: 160 }, { at: P(380, 370), size: 160 }, { at: P(930, 1400), size: 160 }],
  },
  markers: {
    pelekanon: mark(-250, -350, 'Pelekanon', 'Placed between Darıca and Eskihisar', 'byzantium', 'map-pin'),
    philokrene: { lnglat: [29.355, 40.7685], icon: 'anchor', color: 'byzantium', label: 'Philokrene', note: 'Placed between Darıca and Tuzla' },
    'pelekanon-hills-andronikos': mark(1500, -500, 'Andronikos III and Kantakouzenos', 'About 4,000 men', 'byzantium'),
    'pelekanon-hills-orhan': mark(-500, 3100, 'Orhan', 'About 8,000 on the hills', 'ottomans'),
    'pelekanon-hills-archers': mark(2100, 1700, '300 mounted archers', 'Sent to draw them uphill', 'ottomans', 'swords'),
  },
});

// --- 11 June: the withdrawal along the coast turns into a rout, the ships at Philokrene ---
writePlan(`${G}/030-pelekanon-philokrene`, {
  bbox,
  emblem: {
    units: [
      unit('byzantium', 'infantry', 700, -1100, 350, 750, 'byz-foot', 'Byzantine foot soldiers withdrawing along the coast road', { facing: toward([650, -1000], [900, -1650]) }),
      unit('byzantium', 'cavalry', 1700, -2050, 350, 650, 'byz-horse', 'Byzantine horsemen riding for Philokrene', { facing: toward([1500, -2050], [2250, -2250]) }),
      unit('byzantium', 'ships', 2100, -3400, 1300, 300, 'ships', 'Byzantine ships off Philokrene. They carry Kantakouzenos and the survivors back to Constantinople', { facing: f.face(0), count: 6 }),
      unit('ottomans', 'cavalry', 500, -250, 700, 220, 'turks-rear', 'Orhan’s horsemen, come down from the hills, on the rear of the column'),
      unit('ottomans', 'cavalry', 1300, -1200, 600, 200, 'turks-flank', 'Turkish horsemen from the hills above Darıca on the flank of the column', { facing: toward([1300, -1200], [800, -1300]) }),
    ],
    arrows: [
      arrow('ottomans', [[500, 2600], [480, 1400], [500, -100]], 150, 'turks-rear-attack', 'Orhan’s horsemen ride down from the hills after the withdrawing army'),
      arrow('ottomans', [[1500, 2500], [1600, 800], [1420, -1100]], 140, 'turks-flank-attack', 'Other horsemen ride along the hills and fall on the column from the side'),
      arrow('byzantium', [[350, -150], [650, -1000], [900, -1650], [1500, -2050], [2250, -2250]], 160, 'byz-rout', 'A rumour that the emperor is dead spreads, and the withdrawal turns into a rout to Philokrene', 'dashed'),
    ],
    clashes: [{ at: P(560, -560), size: 160 }, { at: P(1030, -1200), size: 160 }],
  },
  markers: {
    'pelekanon-philokrene-rout': mark(300, -1500, 'Rout', 'Rumour: the emperor is dead', 'byzantium', 'skull'),
    'pelekanon-philokrene-kantakouzenos': mark(2700, -1400, 'Kantakouzenos', 'Takes the survivors to the ships', 'byzantium'),
    'pelekanon-philokrene-turks': mark(1700, 1900, 'Orhan’s horsemen', 'Attack the withdrawing army', 'ottomans', 'swords'),
  },
  show: ['philokrene', 'pelekanon'],
});

console.log('pelekanon: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(500, 1200)));
