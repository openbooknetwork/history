// Bailén, 16 to 19 July 1808 (Battle of Bailén article; positions after the period map "Battle of Baylen July 19,
// 1808" on Commons). Dupont comes over the Rumblar along the highway and finds Reding's line in the olive groves
// north-west of Bailén, Coupigny on its southern end; Vedel arrives at noon down the road from La Carolina.
// Frame: origin on Bailén, u north, w east; the Spanish line faces west-north-west.
import { frame, writePlan } from './lib.mjs';

const f = frame([-3.776, 38.094], 0), P = f.p, FR = 115, SP = 295;
const G = 'pages/070-peninsula/020-bailen';
const rumblar = { path: f.path([[6500, -5500], [4200, -5900], [2250, -5800], [500, -6500], [-1800, -7700]]), width: 50, id: 'rumblar', name: 'The Rumblar, a tributary of the Guadalquivir' };
const road = { path: f.path([[1200, -8600], [2250, -5800], [1750, -3600], [1300, -1800], [0, 0], [1300, 1700], [2400, 3800], [3300, 6200]]), width: 20, id: 'highway', name: 'The highway from Andújar through Bailén to the Sierra Morena' };
const bbox = f.box([[-2300, -7400], [5600, 5100]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'spain' ? SP : FR, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, ...(note ? { note } : {}) });
const town = id => ({ [id]: mark(150, 350, 'Bailén', null, null, 'house') });

// --- overview: Dupont's march to Córdoba and back, Vedel over the Sierra Morena, Reding over the Guadalquivir ---
writePlan(`${G}/010-bailen`, {
  routes: {
    'dupont-1808': { name: 'Dupont’s march to Córdoba, early June 1808',
      path: [[-3.53, 38.4], [-3.615, 38.276], [-3.776, 38.094], [-4.05, 38.04], [-4.38, 38.02], [-4.67, 37.94], [-4.78, 37.885]] },
    'dupont-andujar-1808': { name: 'Dupont falls back to Andújar, June 1808', offset: 6,
      path: [[-4.78, 37.885], [-4.67, 37.94], [-4.38, 38.02], [-4.05, 38.04]] },
    'vedel-1808': { name: 'Vedel crosses the Sierra Morena, 26 June 1808', offset: -6,
      path: [[-3.5, 38.5], [-3.53, 38.4], [-3.615, 38.276], [-3.776, 38.094]] },
    'reding-1808': { name: 'Reding crosses at Mengíbar, 16 to 17 July 1808',
      path: [[-3.79, 37.77], [-3.82, 37.9], [-3.81, 37.97], [-3.79, 38.05], [-3.776, 38.09]] },
    'vedel-carolina-1808': { name: 'Dufour and Vedel march to La Carolina, 17 July 1808', style: 'dashed', offset: 6,
      path: [[-3.776, 38.094], [-3.687, 38.18], [-3.615, 38.276]] },
  },
  markers: {
    'bailen-cordoba': { lnglat: [-4.78, 37.885], icon: 'flag', color: 'france', label: 'Córdoba', note: 'Plundered for four days, June 1808' },
    'bailen-andujar': { lnglat: [-4.05, 38.04], icon: 'user', color: 'france', label: 'Dupont at Andújar', note: 'From 16 June' },
    'bailen-mengibar': { lnglat: [-3.81, 37.97], icon: 'swords', color: 'spain', label: 'Mengíbar', note: 'Reding crosses, 16 July' },
    'bailen-puerta-del-rey': { lnglat: [-3.53, 38.4], icon: 'mountain', label: 'Puerta del Rey', note: 'Pass over the Sierra Morena' },
  },
});

// --- dawn to 10 am: Chabert runs into Reding, the attacks on both Spanish wings ---
const right = (name = 'The Spanish right under Reding, Swiss regulars and militia') => unit('spain', 'infantry', 1900, -1200, 2000, 220, 'spanish-right', name, { facing: 297 });
const left = (name = 'The Spanish left under Coupigny, held by the Walloon Guards') => unit('spain', 'infantry', -750, -2550, 2300, 220, 'spanish-left', name, { facing: 297 });
const guns = name => unit('spain', 'artillery', 450, -1950, 700, 90, 'spanish-guns', name, { count: 7, facing: 297 });
const barbou = name => unit('france', 'infantry', 2350, -5300, 900, 220, 'barbou', name, { facing: 290 });
writePlan(`${G}/020-bailen-attacks`, {
  bbox,
  emblem: {
    water: [rumblar],
    works: [road],
    units: [
      right(), left(), guns('Spanish artillery, 20 guns'),
      unit('spain', 'infantry', 1300, 250, 450, 150, 'bailen-garrison', 'A few battalions left to hold Bailén', { facing: 45 }),
      unit('france', 'infantry', 1700, -2350, 650, 180, 'chabert', 'Chabert’s vanguard, 3,000 men'),
      unit('france', 'cavalry', -450, -3450, 450, 140, 'dupres', 'Duprès with the chasseurs à cheval'),
      unit('france', 'cavalry', 2900, -2400, 450, 140, 'cuirassiers', 'Dupont’s cuirassiers'),
      unit('france', 'artillery', 950, -2850, 300, 80, 'french-guns', 'French batteries, knocked out by the Spanish guns', { count: 4 }),
      unit('france', 'camp', 1800, -4300, 700, 300, 'convoy', 'Dupont’s wagons, laden with the loot of Córdoba'),
      barbou('Barbou’s division covering the rear at the Rumblar'),
    ],
    arrows: [
      arrow('france', [[1650, -3000], [1720, -2100], [1820, -1400]], 130, 'chabert-attack', 'Chabert’s first attack, thrown back'),
      arrow('france', [[-450, -3250], [-550, -2950], [-650, -2700]], 110, 'dupres-attack', 'Chabert and Duprès attack the Walloon Guards'),
      arrow('france', [[2800, -2250], [1600, -2000], [650, -1880]], 110, 'cuirassier-charge', 'The cuirassiers break into the Spanish guns and are driven out'),
    ],
    clashes: [P(1830, -1420), P(-650, -2720), P(550, -1880)],
  },
  markers: {
    'bailen-attacks-reding': mark(3600, -700, 'Reding', 'Line in the olive groves', 'spain'),
    'bailen-attacks-dupont': mark(800, -4700, 'Dupont', 'Sends in his troops as they arrive', 'france'),
    'bailen-attacks-dupres': mark(-1300, -3900, 'Duprès', 'Mortally wounded', 'france', 'skull'),
    ...town('bailen-attacks-town'),
  },
});

// --- 10 am to noon: the third attack with the Sailors of the Guard, the Swiss change sides, Castaños arrives ---
writePlan(`${G}/030-bailen-surrounded`, {
  bbox,
  emblem: {
    water: [rumblar],
    works: [road],
    units: [
      right(), left('The Spanish left under Coupigny, the Walloon Guards'), guns('Spanish artillery, raking the French columns'),
      unit('spain', 'infantry', 600, -900, 600, 160, 'swiss', 'Swiss regiments of Dupont’s corps, gone over to the Spaniards'),
      unit('spain', 'light', 4300, -4300, 1100, 150, 'cruz', 'Cruz Mourgeón’s 2,000 sharpshooters among the rocks', { facing: 180 }),
      unit('spain', 'infantry', 1900, -6900, 1200, 250, 'lapena', 'Lapeña’s division of Castaños’s army', { facing: 100 }),
      unit('france', 'infantry', 2200, -2500, 800, 220, 'guard-attack', 'Pannetier’s brigade and the 300 Sailors of the Guard'),
      unit('france', 'infantry', 600, -2900, 900, 180, 'chabert', 'Chabert’s and Duprès’s troops, spent'),
      unit('france', 'cavalry', 3300, -2900, 450, 140, 'cuirassiers', 'Dupont’s cuirassiers'),
      barbou('Barbou’s division at the Rumblar, facing Castaños'),
    ],
    arrows: [
      arrow('france', [[2150, -3100], [2100, -2050], [2050, -1000]], 150, 'third-attack', 'The third attack breaks the first Spanish line and is driven back'),
      arrow('spain', [[1300, -2900], [1000, -1900], [700, -1050]], 100, 'swiss-defect', 'The Swiss regiments change sides'),
      arrow('spain', [[6600, -5300], [5500, -4900], [4550, -4400]], 110, 'cruz-descent', 'Cruz Mourgeón comes down from the hills along the Rumblar'),
      arrow('spain', [[1500, -8300], [1800, -7100]], 120, 'lapena-arrival', 'Lapeña arrives behind Barbou'),
    ],
    clashes: [P(2050, -1250), P(2200, -6100)],
  },
  markers: {
    'bailen-surrounded-dupont': mark(800, -4700, 'Dupont', 'Wounded, asks for a truce', 'france'),
    'bailen-surrounded-sailors': mark(3800, -1600, 'Sailors of the Guard', 'Captain Daugier, 300 men', 'france', 'swords'),
    'bailen-surrounded-lapena': mark(900, -7200, 'Lapeña', 'Castaños’s vanguard', 'spain'),
    'bailen-surrounded-cruz': mark(5000, -3600, 'Cruz Mourgeón', '2,000 sharpshooters', 'spain'),
    ...town('bailen-surrounded-town'),
  },
});

// --- noon: Vedel comes down the La Carolina road, the knoll and San Cristóbal ---
writePlan(`${G}/040-bailen-vedel`, {
  bbox,
  emblem: {
    water: [rumblar],
    works: [road],
    units: [
      right('Reding’s line, facing Dupont'),
      unit('spain', 'infantry', 400, 1300, 1100, 200, 'coupigny', 'Coupigny’s division, turned to face Vedel', { facing: 45 }),
      unit('spain', 'infantry', 1250, 1650, 350, 120, 'ordenes', 'The Órdenes Militares regiment under Soler at San Cristóbal', { facing: 45 }),
      unit('spain', 'infantry', 1900, -6900, 1200, 250, 'lapena', 'Lapeña’s division of Castaños’s army', { facing: 100 }),
      unit('france', 'infantry', 1600, -2900, 1700, 250, 'dupont-corps', 'Dupont’s corps under the truce'),
      barbou('Barbou’s division at the Rumblar'),
      unit('france', 'infantry', 3000, 2750, 450, 160, 'cassagne', 'Cassagne’s legion on the captured knoll', { facing: 225 }),
      unit('france', 'cavalry', 2350, 2050, 400, 130, 'boussart', 'Boussart’s dragoons, round the knoll', { facing: 45 }),
      unit('france', 'infantry', 1650, 2700, 400, 180, 'roche', 'Roche’s column, held at San Cristóbal', { facing: 235 }),
      unit('france', 'infantry', 3500, 4600, 700, 220, 'vedel-reserve', 'Dufour’s brigade and Lagrange’s cuirassiers', { facing: 225 }),
    ],
    arrows: [
      arrow('france', [[4600, 6700], [4100, 5800], [3700, 5100]], 160, 'vedel-march', 'Vedel’s division comes down the road from La Carolina'),
      arrow('france', [[3600, 4000], [3300, 3400], [3080, 2900]], 120, 'cassagne-attack', 'Cassagne’s legion storms the knoll'),
      arrow('france', [[3500, 3600], [2900, 3300], [2500, 2700], [2400, 2250]], 100, 'boussart-ride', 'Boussart’s dragoons ride round the knoll'),
      arrow('france', [[1900, 3200], [1650, 2700], [1350, 1850]], 110, 'roche-attack', 'Roche’s attack on San Cristóbal fails'),
    ],
    clashes: [P(2950, 2650), P(1350, 1800)],
  },
  markers: {
    'bailen-vedel-vedel': mark(5100, 3900, 'Vedel', 'Attacks despite the truce', 'france'),
    'bailen-vedel-knoll': mark(3600, 1400, 'Irish battalion', 'Surrenders, 1,500 prisoners', 'spain', 'skull'),
    'bailen-vedel-soler': mark(600, 2600, 'Soler', 'Holds San Cristóbal', 'spain'),
    'bailen-vedel-dupont': mark(800, -4700, 'Dupont', 'Negotiates the surrender', 'france'),
    ...town('bailen-vedel-town'),
  },
});

console.log('bailen: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(800, -2000)));
