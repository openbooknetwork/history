// Constantinople, 6 April to 29 May 1453: the land walls from the Marmara to the Golden Horn, the city, the Horn,
// Galata and the Bosporus shore to the Double Columns. The walls, gates and shores are placed from general maps of the
// city, the posts and the batteries from the accounts (README.md).
// Positions are [lon, lat]. A unit at the land walls stands on a point of the wall line, moved across it by metres.
import { writePlan as write } from './lib.mjs';

// shared points would come out as YAML anchors, so each page gets its own copy of the emblem
const writePlan = (dir, plan) => write(dir, { ...plan, emblem: JSON.parse(JSON.stringify(plan.emblem)) });

const G = 'pages/020-constantinople-1453/010-constantinople';
// one bbox for all eight pages: the Golden Gate to the head of the Horn at Eyüp, the Ottoman camp to the Double Columns
const bbox = [28.897, 40.985, 29.013, 41.054];

const R = Math.PI / 180, KX = 111320 * Math.cos(41.02 * R), KY = 110540;
const r5 = x => Math.round(x * 1e5) / 1e5;
const shift = ([lon, lat], bearing, d) => [r5(lon + d * Math.sin(bearing * R) / KX), r5(lat + d * Math.cos(bearing * R) / KY)];
const bearingOf = (a, b) => ((Math.atan2((b[0] - a[0]) * KX, (b[1] - a[1]) * KY) / R) + 360) % 360;
const dist = (a, b) => Math.hypot((b[0] - a[0]) * KX, (b[1] - a[1]) * KY);
// the bearing of a line at its point nearest p
const bearingAt = (line, p) => {
  let best = 0, bd = Infinity;
  for (let i = 0; i < line.length - 1; i++) { const m = [(line[i][0] + line[i + 1][0]) / 2, (line[i][1] + line[i + 1][1]) / 2], d = dist(m, p); if (d < bd) { bd = d; best = i; } }
  return bearingOf(line[best], line[best + 1]);
};
// a line moved sideways by d metres, to the left of its direction for d < 0 and to the right for d > 0
const offset = (line, d) => line.map((p, i) => shift(p, bearingOf(line[Math.max(0, i - 1)], line[Math.min(line.length - 1, i + 1)]) + 90, d));
const face = b => Math.round(((b % 360) + 360) % 360);

// --- the ground ---
// The Theodosian land walls from the Marble Tower on the Marmara to the Palace of the Porphyrogenitus, then the single
// wall of Blachernae to the Horn at Ayvansaray. The gates are points of this line.
const GATE = {
  marble: [28.9192, 40.9929], golden: [28.9216, 40.9941], xylokerkos: [28.919, 41.0003], pege: [28.916, 41.0073],
  rhegion: [28.9166, 41.014], romanos: [28.9206, 41.0204], lycus: [28.9233, 41.0236], fifth: [28.9256, 41.0259],
  charisian: [28.9298, 41.0293], porphyrogenitus: [28.9338, 41.0339], kaligaria: [28.9333, 41.0371],
  blachernae: [28.9385, 41.0405], horn: [28.9428, 41.0428],
};
const THEODOSIAN = [GATE.marble, GATE.golden, [28.9206, 40.9972], GATE.xylokerkos, [28.9172, 41.004], GATE.pege, [28.9158, 41.0106], GATE.rhegion,
  [28.9183, 41.0172], GATE.romanos, GATE.lycus, GATE.fifth, GATE.charisian, [28.9322, 41.032], GATE.porphyrogenitus];
const BLACHERNAE = [GATE.porphyrogenitus, [28.9327, 41.0356], GATE.kaligaria, [28.9355, 41.0392], GATE.blachernae, [28.941, 41.0418], GATE.horn];
const LAND = [...THEODOSIAN, ...BLACHERNAE.slice(1)];
// the sea walls from the Marble Tower along the Marmara to the Acropolis point, then along the Horn to Ayvansaray
const MARMARA_WALL = [GATE.marble, [28.925, 40.9948], [28.93, 40.9962], [28.936, 40.9983], [28.942, 41.0005], [28.948, 41.0028], [28.953, 41.0038],
  [28.96, 41.0036], [28.966, 41.0035], [28.972, 41.0036], [28.9775, 41.004], [28.982, 41.0055], [28.9855, 41.009], [28.987, 41.013], [28.9868, 41.0158]];
const HORN_WALL = [[28.9868, 41.0158], [28.9835, 41.0168], [28.98, 41.0173], [28.975, 41.0176], [28.97, 41.0183], [28.9655, 41.0199], [28.961, 41.0223],
  [28.9565, 41.0251], [28.953, 41.0276], [28.95, 41.0303], [28.9475, 41.0336], [28.9455, 41.0371], [28.944, 41.0405], GATE.horn];
const SEA_WALL = [...MARMARA_WALL, ...HORN_WALL.slice(1)];
// the tower markers stand a little inland of the chain's ends, so that their icons leave the links clear
const EUGENIUS = [28.9795, 41.0174], KASTELLION = [28.9768, 41.0222];
// the Genoese walls of Galata: from the Horn at Azapkapı up to the Galata Tower and down to the Bosporus at Tophane
const GALATA_SEA = [[28.9668, 41.0258], [28.9695, 41.0242], [28.973, 41.0228], KASTELLION, [28.9788, 41.0226], [28.9812, 41.0231]];
const GALATA = [[28.9668, 41.0258], [28.9705, 41.0262], [28.9741, 41.0257], [28.9772, 41.0251], [28.9805, 41.0242], ...[...GALATA_SEA].reverse()];
// shores beyond the walls
const HORN_UPPER_S = [GATE.horn, [28.9405, 41.0455], [28.937, 41.0478], [28.935, 41.051], [28.9365, 41.0545], [28.9395, 41.0575]];
const HORN_N = [[28.9425, 41.0575], [28.945, 41.052], [28.9478, 41.0475], [28.951, 41.0425], [28.9545, 41.0375], [28.957, 41.0342], [28.96, 41.0312],
  [28.962, 41.0287], ...offset(GALATA_SEA, 30), [28.9835, 41.0242]];
// beyond the city the shores follow the coast the base map draws (harita coast Turkey 28.80 40.93 29.15 41.12), so the
// water of the plan, which covers the whole sea round the city, meets the base map's coast where the view ends
const BOSPORUS_W = [[28.9835, 41.0242], [28.9855, 41.0262], [28.988, 41.029], [28.9925, 41.0335], [28.999, 41.0385], [29.005, 41.0413], [29.011, 41.0445],
  [29.022, 41.048], [29.032, 41.053], [29.043, 41.067], [29.05, 41.082], [29.058, 41.099], [29.061, 41.12]];
const ASIA = [[29.074, 41.12], [29.061, 41.077], [29.047, 41.055], [29.025, 41.038], [29.007, 41.031], [29.014, 41.018], [29.018, 41.004], [29.022, 40.994],
  [29.036, 40.989], [29.032, 40.986], [29.032, 40.984], [29.029, 40.982], [29.083, 40.96], [29.104, 40.947], [29.13, 40.93]];
const MARMARA_W = [[28.8, 40.93], [28.8, 40.959], [28.824, 40.962], [28.834, 40.964], [28.842, 40.967], [28.845, 40.972], [28.849, 40.976], [28.86, 40.977],
  [28.899, 40.984], [28.912, 40.9905]];
const sea = [...MARMARA_W, ...offset(SEA_WALL, 45), ...HORN_UPPER_S.slice(1), ...HORN_N, ...BOSPORUS_W.slice(1), ...ASIA];
// the Lycus comes down from Bayrampaşa, passes the walls in the Mesoteichion and runs through the city to the harbour of Eleutherios
const LYCUS = [[28.9, 41.0415], [28.906, 41.0365], [28.912, 41.0325], [28.9175, 41.0285], [28.921, 41.0255], GATE.lycus, [28.9285, 41.021], [28.934, 41.017],
  [28.9395, 41.0125], [28.944, 41.0085], [28.948, 41.0055]];
const ground = {
  land: [{ area: [[28.8, 40.93], [29.15, 40.93], [29.15, 41.12], [28.8, 41.12]] }],
  water: [
    { area: sea, id: 'sea', name: 'The Golden Horn, the Bosporus and the Sea of Marmara' },
    { path: offset(THEODOSIAN, -40), width: 18, id: 'moat', name: 'The moat in front of the Theodosian walls, about 18 m wide' },
    { path: LYCUS, width: 25, id: 'lycus', name: 'The Lycus stream, which passes under the land walls in the Mesoteichion' },
  ],
};

// --- the works ---
const W = {
  land: { side: 'byzantium', path: THEODOSIAN, width: 45, id: 'land-walls', name: 'The land walls of Theodosius II: an inner and an outer wall with towers every 45 to 55 m, and the moat in front' },
  blachernae: { side: 'byzantium', path: BLACHERNAE, width: 30, id: 'blachernae-wall', name: 'The single wall of Blachernae round the imperial palace, with no moat' },
  sea: { side: 'byzantium', path: SEA_WALL, width: 22, id: 'sea-walls', name: 'The sea walls along the Sea of Marmara and the Golden Horn' },
  galata: { side: 'genoa', path: GALATA, width: 22, id: 'galata-walls', name: 'The walls of Galata, the Genoese colony, which stays neutral' },
  // drawn 100 m wide, about three times the boom, so that its links show at the scale of the city
  chain: { side: 'byzantium', path: [EUGENIUS, KASTELLION], width: 100, style: 'chain', id: 'chain', name: 'The chain across the Golden Horn, on wooden floats, from the tower of Eugenius to the Kastellion of Galata' },
  ditch: { side: 'ottomans', path: offset(LAND, -260), width: 30, style: 'trench', id: 'ottoman-ditch', name: 'The Ottoman ditch along the whole land front, with an earth rampart and a palisade' },
  stockade: { side: 'byzantium', path: [shift(GATE.romanos, 300, 15), shift(GATE.lycus, 308, 15), shift(GATE.fifth, 308, 15)], width: 18, id: 'stockade',
    name: 'The stockade of timber, earth and barrels that the defenders build each night in the breaches of the outer wall' },
};
const walls = [W.land, W.blachernae, W.sea, W.galata];

// --- the units ---
// a defenders' post on the land walls: d metres inside the wall line, facing out
const post = (side, p, width, id, name, { type = 'infantry', d = 90, depth = 90, line = LAND } = {}) => {
  const b = bearingAt(line, p);
  return { side, type, at: shift(p, b + 90, d), width, depth, facing: face(b - 90), id, name };
};
// a defenders' post on the sea walls: d metres inside, facing the water
const seaPost = (side, p, width, id, name, d = 90) => {
  const b = bearingAt(SEA_WALL, p);
  return { side, type: 'infantry', at: shift(p, b - 90, d), width, depth: 90, facing: face(b + 90), id, name };
};
// an Ottoman body before the land walls: d metres out from the wall line, facing it
const before = (type, p, d, width, depth, id, name, extra = {}) => {
  const b = bearingAt(LAND, p);
  return { side: 'ottomans', type, at: shift(p, b - 90, d), width, depth, facing: face(b + 90), id, name, ...extra };
};
// a fleet as rows of hulls L metres long, about five times a galley's length, so that a hull reads at the scale of the city
const ships = (side, at, facing, _w, _d, rows, count, id, name, L = 200) => {
  const cols = Math.ceil(count / rows);
  return { side, type: 'ships', at, width: Math.round(L * cols / 1.6), depth: Math.round(L * rows / 0.85), facing, rows, count, id, name };
};
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const toward = (a, b) => face(bearingOf(a, b));
const outAt = (p, d) => shift(p, bearingAt(LAND, p) - 90, d);
const inAt = (p, d) => shift(p, bearingAt(LAND, p) + 90, d);
const mid = (a, b) => [r5((a[0] + b[0]) / 2), r5((a[1] + b[1]) / 2)];

const POSTS = {
  kantakouzenos: post('byzantium', [28.9203, 40.9934], 160, 'kantakouzenos', 'Demetrios Kantakouzenos at the south end of the land walls'),
  manuel: post('genoa', GATE.golden, 200, 'manuel', 'Manuel the Genoese with 200 archers at the Golden Gate'),
  filippo: post('venice', [28.9178, 41.0035], 650, 'filippo-contarini', 'Filippo Contarini’s Venetians and Greeks, from the Golden Gate to the Pege gate'),
  cataneo: post('genoa', GATE.pege, 350, 'cataneo', 'Maurizio Cataneo’s Genoese at the Pege gate'),
  constantine: post('byzantium', mid(GATE.romanos, GATE.lycus), 480, 'constantine', 'Constantine XI with his Greek troops at the Mesoteichion, from the gate of St Romanos to the Lycus'),
  giustinianiStart: post('genoa', GATE.charisian, 420, 'giustiniani', 'Giovanni Giustiniani Longo with his 700 Genoese at the Charisian gate, at first'),
  bocchiardi: post('genoa', [28.9318, 41.0316], 380, 'bocchiardi', 'The brothers Paolo, Antonio and Troilo Bocchiardi at the Myriandrion, by the Charisian gate'),
  theophilos: post('byzantium', GATE.kaligaria, 260, 'theophilos', 'Theophilos Palaiologos and the engineer Johannes Grant at the Kaligaria gate'),
  minotto: post('venice', GATE.blachernae, 380, 'minotto', 'The Venetian bailo Girolamo Minotto with his Venetians at the palace of Blachernae'),
  jacopo: seaPost('venice', [28.93, 40.9962], 380, 'jacopo-contarini', 'Jacopo Contarini at Studios, on the Marmara walls'),
  orhan: seaPost('byzantium', [28.9505, 41.0034], 420, 'orhan', 'Prince Orhan, a claimant to the Ottoman throne, with his Turks at the harbour of Eleutherios'),
  catalans: seaPost('byzantium', [28.9745, 41.0037], 380, 'catalans', 'Catalan and Genoese troops at the old Great Palace'),
  isidore: seaPost('byzantium', [28.9869, 41.0125], 380, 'isidore', 'Cardinal Isidore with his 200 archers at the Acropolis point, by the end of the chain'),
  trevisano: seaPost('venice', [28.9565, 41.0251], 650, 'trevisano', 'Gabriele Trevisano with Venetian and Genoese sailors on the walls along the Horn'),
  notaras: seaPost('byzantium', [28.9475, 41.0336], 380, 'notaras', 'Loukas Notaras on the Horn walls at the Petrion. Other accounts put him with a reserve of horsemen in the Petra quarter'),
  nikephoros: { side: 'byzantium', type: 'cavalry', at: [28.9497, 41.0195], width: 300, depth: 100, facing: 300, id: 'nikephoros', name: 'Nikephoros Palaiologos with the reserve at the church of the Holy Apostles' },
};
const DIEDO = ships('venice', [28.9735, 41.0205], 65, 480, 340, 2, 8, 'diedo', 'The 26 ships in the Horn behind the chain under the Venetian Alviso Diedo: Venetian, Genoese, Cretan, Byzantine and others');
const JANISSARIES = before('infantry', GATE.romanos, 520, 650, 130, 'janissaries', 'Mehmed’s janissaries, 5,000 to 10,000, before the gate of St Romanos and the Mesoteichion', { bow: 60 });
const RUMELIANS = before('infantry', [28.932, 41.0333], 560, 1500, 220, 'rumelians', 'The Rumelian troops under Karaca Pasha, the beylerbey of Rumelia, from the Charisian gate to the Horn', { bow: 40 });
const ANATOLIANS = before('infantry', [28.9168, 41.006], 560, 2300, 220, 'anatolians', 'The Anatolian troops under İshak Pasha, the beylerbey of Anatolia, from the Lycus to the Sea of Marmara', { bow: 40 });
const ZAGANOS = { side: 'ottomans', type: 'infantry', at: [28.9655, 41.0372], width: 700, depth: 180, facing: 215, id: 'zaganos', name: 'Zaganos Pasha’s troops on the hills north of the Horn, behind Galata' };
const TENT = [28.9095, 41.0218];
const HOUSEHOLD = { side: 'ottomans', type: 'cavalry', at: shift(TENT, 300, 120), width: 350, depth: 110, facing: 120, id: 'household', name: 'Mehmed’s household troops round his red and gold tent on the hill of Maltepe' };
const FLEET_DC = ships('ottomans', [29.0068, 41.0372], 225, 800, 460, 2, 10, 'fleet', 'Baltaoğlu Süleyman Bey’s fleet at the Double Columns: 110 to 430 ships by the eyewitnesses, about 110 by a modern estimate');

// --- the places: story markers defined on the overview, shown again on the phases ---
const PLACES = {
  'golden-gate': { lnglat: GATE.golden, icon: 'door-open', color: 'byzantium', label: 'Golden Gate', note: 'Yedikule' },
  'pege-gate': { lnglat: GATE.pege, icon: 'door-open', color: 'byzantium', label: 'Gate of Pege', note: 'Silivrikapı' },
  'st-romanos-gate': { lnglat: GATE.romanos, icon: 'door-open', color: 'byzantium', label: 'Gate of St Romanos', note: 'Topkapı' },
  'charisian-gate': { lnglat: GATE.charisian, icon: 'door-open', color: 'byzantium', label: 'Charisian gate', note: 'Edirnekapı, the gate of Adrianople' },
  'kaligaria-gate': { lnglat: GATE.kaligaria, icon: 'door-open', color: 'byzantium', label: 'Kaligaria gate', note: 'Eğrikapı' },
  'blachernae-1453': { lnglat: [28.9395, 41.0395], icon: 'landmark', color: 'byzantium', label: 'Blachernae', note: 'The imperial palace' },
  'holy-apostles': { lnglat: [28.9497, 41.0195], icon: 'church', color: 'byzantium', label: 'Holy Apostles', note: 'The reserve' },
  'galata-1453': { lnglat: [28.9741, 41.0257], icon: 'castle', color: 'genoa', label: 'Galata', note: 'Genoese colony' },
  'maltepe-1453': { lnglat: TENT, icon: 'tent', color: 'ottomans', label: 'Maltepe', note: 'Mehmed’s tent' },
  'double-columns': { lnglat: [29.0045, 41.0418], icon: 'anchor', color: 'ottomans', label: 'Double Columns', note: 'Beşiktaş' },
};
const mk = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- 010 overview: the posts on the walls and the Ottoman lines, 6 April ---
writePlan(`${G}/010-constantinople`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, W.chain, W.ditch],
    units: [...Object.values(POSTS), DIEDO, JANISSARIES, RUMELIANS, ANATOLIANS, ZAGANOS, HOUSEHOLD],
  },
  markers: {
    ...PLACES,
    'constantinople-constantine': mk(inAt(GATE.lycus, 900), 'Constantine XI', 'At the Mesoteichion', 'byzantium'),
    'constantinople-giustiniani': mk(inAt(GATE.charisian, 900), 'Giustiniani', 'At the Charisian gate', 'genoa'),
  },
  routes: {},
  show: ['constantinople'],
});

// --- 020 the chain: Diedo's ships behind the boom, Baltaoğlu's attack fails, mid April ---
writePlan(`${G}/020-constantinople-chain`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, W.chain],
    units: [DIEDO, FLEET_DC, JANISSARIES, RUMELIANS, ANATOLIANS, ZAGANOS,
      ships('ottomans', [28.9895, 41.0212], 250, 450, 380, 2, 6, 'attack', 'Baltaoğlu’s galleys attack the ships behind the chain in mid April'),
      seaPost('byzantium', [28.9869, 41.0125], 380, 'isidore', 'Cardinal Isidore with his 200 archers at the Acropolis point, by the end of the chain')],
    arrows: [
      arrow('ottomans', [[29.0035, 41.0365], [28.997, 41.03], [28.991, 41.0235]], 110, 'attack-move', 'The galleys row from the Double Columns to the chain'),
      arrow('ottomans', [[29.008, 41.034], [29.009, 41.02], [29.006, 41.0], [29.01, 40.986]], 100, 'islands', 'Part of the fleet sails to the Princes’ Islands and takes them'),
      arrow('venice', [[28.9752, 41.0206], [28.9764, 41.0203], [28.9774, 41.02]], 70, 'diedo-out', 'The tall ships of Diedo’s fleet come up to the chain and beat off the galleys'),
    ],
    clashes: [{ at: [28.9835, 41.0205], size: 180 }],
  },
  markers: {
    'tower-of-eugenius': { lnglat: shift(EUGENIUS, 160, 200), icon: 'castle', color: 'byzantium', label: 'Tower of Eugenius', note: 'South end of the chain' },
    'galata-kastellion': { lnglat: shift(KASTELLION, 60, 330), icon: 'castle', color: 'genoa', label: 'Kastellion', note: 'North end of the chain' },
    'constantinople-chain-diedo': mk([28.9705, 41.0158], 'Alviso Diedo', '26 ships behind the chain', 'venice'),
    'constantinople-chain-baltaoglu': mk([29.0005, 41.035], 'Baltaoğlu', 'Admiral of the fleet', 'ottomans'),
  },
  show: ['double-columns', 'galata-1453'],
});

// --- 030 the guns: the batteries of 11 April, Orban's gun moved to St Romanos, the night assault of 18 April ---
const gun = (p, d, count, id, name) => before('artillery', p, d, 40 * count + 40, 50, id, name, { count });
writePlan(`${G}/030-constantinople-guns`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, W.chain, W.ditch, W.stockade],
    units: [
      gun(GATE.blachernae, 300, 3, 'guns-blachernae', 'Three guns against the palace of Blachernae'),
      gun(GATE.charisian, 300, 2, 'guns-charisian', 'Two guns against the Charisian gate, the gate of Adrianople'),
      gun(GATE.romanos, 300, 4, 'guns-romanos', 'Four guns against the gate of St Romanos'),
      before('artillery', GATE.lycus, 330, 90, 60, 'orban', 'Orban’s great gun, moved here from the Kaligaria gate', { count: 1 }),
      gun(GATE.pege, 300, 3, 'guns-pege', 'Three guns against the gate of Pege'),
      before('infantry', GATE.lycus, 160, 520, 110, 'janissaries', 'Janissaries and other troops attack the stockade at the Mesoteichion in the night of 18 April and are thrown back after four hours'),
      RUMELIANS, ANATOLIANS,
      post('byzantium', GATE.romanos, 300, 'constantine', 'Constantine XI with his Greek troops at the Mesoteichion'),
      post('genoa', mid(GATE.lycus, GATE.fifth), 300, 'giustiniani', 'Giustiniani’s Genoese, who now hold the Mesoteichion with the emperor'),
      POSTS.bocchiardi,
    ],
    arrows: [
      arrow('ottomans', [outAt(GATE.kaligaria, 380), outAt([28.9285, 41.032], 480), outAt(GATE.fifth, 460), outAt(GATE.lycus, 390)], 70, 'orban-move', 'Orban’s gun is moved from the Kaligaria gate to the Mesoteichion'),
      arrow('ottomans', [outAt(GATE.lycus, 110), outAt(GATE.lycus, 10)], 220, 'assault-18', 'The night assault of 18 April on the stockade, repulsed after four hours'),
      arrow('ottomans', [outAt(GATE.romanos, 230), outAt(GATE.romanos, 20)], 160, 'fire-romanos', 'The guns fire on the walls from 12 April', 'fire'),
    ],
    clashes: [{ at: outAt(GATE.lycus, -5), size: 170 }],
  },
  markers: {
    'constantinople-guns-giustiniani': mk(inAt(GATE.fifth, 900), 'Giustiniani', 'Repairs the walls each night', 'genoa'),
  },
  show: ['kaligaria-gate', 'charisian-gate', 'st-romanos-gate', 'pege-gate'],
});

// --- 040 the four ships, 20 April ---
const FOUR = [28.9935, 41.0165];
writePlan(`${G}/040-constantinople-four-ships`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, W.chain],
    units: [
      ships('genoa', shift(FOUR, 30, 110), 315, 0, 0, 1, 3, 'genoese', 'The three Genoese ships sent with arms and grain by the pope', 250),
      ships('byzantium', shift(FOUR, 210, 200), 315, 0, 0, 1, 1, 'grain-ship', 'The imperial transport with grain from Sicily under Phlatanelas', 250),
      ships('ottomans', shift(FOUR, 25, 700), 200, 0, 0, 2, 10, 'boats-n', 'Baltaoğlu’s galleys and boats close round the four ships, about 150 in all'),
      ships('ottomans', shift(FOUR, 200, 750), 20, 0, 0, 2, 10, 'boats-s', 'Ottoman boats attack from the south'),
      DIEDO,
      { side: 'ottomans', type: 'cavalry', at: [28.9862, 41.0272], width: 420, depth: 160, facing: 135, id: 'mehmed', name: 'Mehmed with his horsemen on the shore below Pera. He rides his horse into the sea and shouts orders to his captains' },
    ],
    arrows: [
      arrow('genoa', [[28.975, 40.988], [28.985, 40.996], [28.992, 41.006], [28.9935, 41.013]], 90, 'approach', 'The four ships come up the Sea of Marmara under sail'),
      arrow('ottomans', [[29.0045, 41.0375], [29.0005, 41.03], [28.996, 41.022]], 110, 'boats-out', 'The Ottoman fleet rows out from the Double Columns'),
      arrow('genoa', [[28.9915, 41.0175], [28.986, 41.0192], [28.9815, 41.0198], [28.9775, 41.0205]], 80, 'into-horn', 'In the evening the wind rises. After dark the chain is opened, and the four ships enter the Horn'),
    ],
    clashes: [{ at: shift(FOUR, 25, 380), size: 170 }, { at: shift(FOUR, 200, 420), size: 150 }],
  },
  markers: {
    'constantinople-four-ships-mehmed': mk([28.9835, 41.0305], 'Mehmed', 'Rides into the sea', 'ottomans'),
    'constantinople-four-ships-baltaoglu': mk(shift(FOUR, 75, 1150), 'Baltaoğlu', 'Wounded in the eye', 'ottomans'),
  },
  show: ['tower-of-eugenius', 'galata-kastellion', 'double-columns'],
});

// --- 050 the ships cross the hill, 22 April, and the fire ships of 28 April ---
// the track from the Bosporus shore at Dolmabahçe up the valley to the ridge at Taksim and down to Kasımpaşa
const TRACK = [[28.9985, 41.0388], [28.995, 41.0398], [28.9905, 41.0392], [28.986, 41.038], [28.9815, 41.0375], [28.977, 41.0372], [28.972, 41.0362],
  [28.9675, 41.0345], [28.9635, 41.0328], [28.9595, 41.0322]];
writePlan(`${G}/050-constantinople-overland`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, W.chain, { side: 'ottomans', path: TRACK.slice(0, -1), width: 30, id: 'slipway', name: 'The track of greased timber over the hill behind Galata, cleared through the woods' }],
    units: [
      ships('ottomans', [29.0068, 41.0372], 225, 600, 420, 2, 8, 'fleet', 'The ships that stay at the Double Columns'),
      ships('ottomans', [28.983, 41.0378], 270, 420, 360, 2, 6, 'on-the-hill', 'The ships on the ridge, each drawn on rollers by oxen and men with its sails set'),
      ships('ottomans', [28.9545, 41.0345], 140, 560, 400, 2, 10, 'in-horn', '72 ships, or 80 in one account, launched into the Horn below Kasımpaşa, in the valley called the Springs'),
      { side: 'ottomans', type: 'artillery', at: [28.9738, 41.0298], width: 160, depth: 50, facing: 190, count: 3, id: 'galata-guns', name: 'Guns on the hill behind Galata, which fire over the colony on the ships in the Horn' },
      DIEDO,
      ZAGANOS,
    ],
    arrows: [
      arrow('ottomans', TRACK, 110, 'haul', 'On the night of 21 to 22 April the ships are drawn from the Bosporus over the hill to the Horn, 2 to 4 km'),
      arrow('ottomans', [[28.9738, 41.0285], [28.9745, 41.0225]], 120, 'galata-fire', 'The guns fire on the ships behind the chain', 'fire'),
      arrow('venice', [[28.973, 41.0212], [28.967, 41.0232], [28.962, 41.0262], [28.958, 41.0302]], 90, 'fireships', 'In the night of 28 April Giacomo Coco leads ships and fire ships against the Ottoman ships at Kasımpaşa. The guns sink his galley and the attack fails'),
    ],
    clashes: [{ at: [28.958, 41.0312], size: 160 }],
  },
  markers: {
    'constantinople-overland-dolmabahce': mk([28.999, 41.0398], 'Dolmabahçe', 'The ships leave the Bosporus', 'ottomans', 'ship'),
    'constantinople-overland-kasimpasa': mk([28.9605, 41.0335], 'Kasımpaşa', 'The ships reach the Horn', 'ottomans', 'anchor'),
    'constantinople-overland-coco': mk([28.9635, 41.0255], 'Giacomo Coco', 'His galley sunk, 28 April', 'venice', 'skull'),
  },
  show: ['galata-1453', 'double-columns'],
});

// --- 060 the mines at the Kaligaria gate, the siege tower, the bridge of barrels, May ---
const MINE = (from, to) => [outAt(from, 330), outAt(mid(from, to), 120), outAt(to, -10)];
const BRIDGE = [[28.9432, 41.0446], [28.9468, 41.0462], [28.9496, 41.0474]];
writePlan(`${G}/060-constantinople-mines`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, W.chain, W.ditch, W.stockade,
      { side: 'ottomans', path: MINE([28.9316, 41.0345], GATE.kaligaria), width: 25, style: 'trench', id: 'mines', name: 'The mines dug towards the Kaligaria gate from mid May by miners from Novo Brdo under Zaganos Pasha' },
      { side: 'ottomans', path: MINE([28.9338, 41.0388], [28.9342, 41.0382]), width: 25, style: 'trench', id: 'mines', name: 'The mines dug towards the Kaligaria gate from mid May by miners from Novo Brdo under Zaganos Pasha' },
      { side: 'byzantium', path: [inAt(GATE.kaligaria, 60), outAt(GATE.kaligaria, 60)], width: 25, style: 'trench', id: 'countermines', name: 'Johannes Grant’s countermines, which break into the Ottoman mines on 16, 21, 23 and 25 May' },
      { side: 'ottomans', path: BRIDGE, width: 30, id: 'bridge', name: 'The bridge of barrels across the upper Horn, finished on 19 May, which joins Zaganos’s troops to the army before the walls' }],
    units: [
      post('byzantium', GATE.kaligaria, 260, 'theophilos', 'Theophilos Palaiologos and Johannes Grant at the Kaligaria gate'),
      POSTS.minotto,
      before('siege', mid(GATE.romanos, GATE.lycus), 120, 120, 90, 'tower', 'The wooden siege tower brought up to the walls on 18 May and burned by the defenders that night. Some accounts put it at the Charisian gate'),
      before('infantry', [28.9325, 41.0362], 420, 380, 110, 'miners', 'Zaganos Pasha’s miners, many of them Serbs from Novo Brdo'),
      JANISSARIES, RUMELIANS,
      ships('ottomans', [28.9545, 41.0345], 140, 560, 400, 2, 10, 'in-horn', 'The Ottoman ships in the Horn below Kasımpaşa'),
      { side: 'ottomans', type: 'infantry', at: [28.9535, 41.0455], width: 380, depth: 120, facing: 225, id: 'zaganos', name: 'Zaganos Pasha’s troops at the north end of the bridge' },
      POSTS.constantine,
    ],
    arrows: [arrow('ottomans', [[28.9525, 41.0445], [28.9485, 41.0462], [28.944, 41.0448]], 90, 'crossing', 'Zaganos’s troops can now cross the Horn to the walls')],
    clashes: [{ at: outAt(GATE.kaligaria, 30), size: 110 }],
  },
  markers: {
    'constantinople-mines-grant': mk(inAt(GATE.kaligaria, 700), 'Johannes Grant', 'Digs the countermines', 'byzantium'),
    'constantinople-mines-mehmed': mk(TENT, 'Mehmed', 'Offers terms, then holds his council', 'ottomans', 'tent'),
    'constantinople-mines-tower': mk(outAt(mid(GATE.romanos, GATE.lycus), 600), 'Siege tower', 'Burned, 18 to 19 May', 'ottomans', 'flame'),
  },
  show: ['kaligaria-gate', 'st-romanos-gate'],
});

// --- 070 the assault of 29 May ---
const KERKOPORTA = shift(GATE.porphyrogenitus, 0, 25);
writePlan(`${G}/070-constantinople-assault`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, W.chain, W.ditch, W.stockade, { side: 'ottomans', path: BRIDGE, width: 30, id: 'bridge', name: 'The bridge of barrels across the upper Horn' }],
    units: [
      before('infantry', GATE.lycus, 160, 600, 160, 'janissaries', 'The janissaries, the third wave, who climb the stockade before dawn', { bow: 80 }),
      before('infantry', GATE.romanos, 520, 600, 140, 'anatolians', 'İshak Pasha’s Anatolians, the second wave, fall back after their attack'),
      before('irregular', GATE.fifth, 560, 600, 140, 'irregulars', 'The irregulars, the first wave, fall back after two hours'),
      before('infantry', GATE.blachernae, 180, 600, 140, 'rumelians', 'Karaca Pasha’s Rumelians attack the walls of Blachernae'),
      post('byzantium', GATE.lycus, 360, 'constantine', 'Constantine XI with his Greeks at the stockade'),
      POSTS.bocchiardi,
      POSTS.minotto,
      ships('ottomans', [28.9545, 41.0318], 150, 620, 380, 2, 10, 'horn-fleet', 'The ships in the Horn bring ladders against the Horn walls'),
      ships('ottomans', [28.958, 40.9975], 0, 1000, 380, 2, 12, 'marmara-fleet', 'Hamza Bey’s fleet attacks the Marmara walls'),
      { side: 'ottomans', type: 'infantry', at: [28.946, 41.044], width: 300, depth: 100, facing: 200, id: 'zaganos', name: 'Zaganos Pasha’s troops cross the bridge of barrels to the walls' },
    ],
    arrows: [
      arrow('ottomans', [outAt(GATE.lycus, 60), outAt(mid(GATE.lycus, GATE.fifth), -140), inAt(GATE.fifth, 400)], 200, 'breach', 'The janissaries break through at the Fifth Military Gate, north of the Lycus'),
      arrow('ottomans', [outAt(KERKOPORTA, 200), outAt(KERKOPORTA, 20), inAt(KERKOPORTA, 120)], 80, 'kerkoporta', 'In Doukas’s account about 50 Ottomans enter by the Kerkoporta, a postern left open, and raise their flags on the wall'),
      arrow('genoa', [inAt(GATE.lycus, 120), [28.934, 41.0255], [28.945, 41.0265], [28.9545, 41.0268]], 90, 'giustiniani', 'Giustiniani, wounded, is carried through the city to his ship in the harbour', 'dashed'),
      arrow('ottomans', [outAt(GATE.blachernae, 300), outAt(GATE.blachernae, 40)], 160, 'blachernae', 'Karaca Pasha’s Rumelians attack the walls of Blachernae'),
    ],
    clashes: [{ at: GATE.lycus, size: 200 }, { at: KERKOPORTA, size: 110 }, { at: outAt(GATE.blachernae, 20), size: 130 }],
  },
  markers: {
    'constantinople-assault-constantine': mk(inAt(GATE.lycus, 1000), 'Constantine XI', 'Fate unknown', 'byzantium', 'skull'),
    'constantinople-assault-giustiniani': mk([28.9465, 41.0262], 'Giustiniani', 'Wounded, carried to his ship', 'genoa'),
    kerkoporta: { lnglat: KERKOPORTA, icon: 'door-open', color: 'byzantium', label: 'Kerkoporta', note: 'A postern, in Doukas' },
  },
});

// --- 080 the fall: the sack, the escape from the Horn, Mehmed rides to Hagia Sophia ---
const SOPHIA = [28.9802, 41.0086];
const MESE_N = [GATE.charisian, [28.9365, 41.026], [28.943, 41.0225], [28.9497, 41.0185], [28.9565, 41.0145], [28.9625, 41.0115], [28.9713, 41.0088], [28.978, 41.0085]];
const MESE_S = [GATE.romanos, [28.928, 41.0172], [28.9365, 41.0138], [28.945, 41.0115], [28.954, 41.0102], [28.9625, 41.0105], [28.9713, 41.0086], [28.9775, 41.008]];
writePlan(`${G}/080-constantinople-fall`, {
  bbox,
  emblem: {
    ...ground,
    works: [...walls, { ...W.chain, name: 'The chain across the Golden Horn, cut open by the Venetian ships' }],
    units: [
      { side: 'ottomans', type: 'irregular', at: [28.9395, 41.0205], width: 600, depth: 200, facing: 110, id: 'sack', name: 'The army spreads through the city and plunders it' },
      { side: 'ottomans', type: 'infantry', at: [28.9625, 41.0125], width: 450, depth: 160, facing: 95, id: 'forums', name: 'Ottoman troops at the forums on the Mese, on the way to Hagia Sophia' },
      ships('ottomans', [28.957, 41.0285], 140, 620, 380, 2, 10, 'horn-fleet', 'The sailors of the fleet leave their ships to plunder the quarters along the Horn. The Horn is in Ottoman hands by midday'),
      ships('venice', [28.9985, 41.0105], 160, 520, 380, 2, 7, 'escape', 'The Venetian ships, and a few Genoese and imperial ships, crowded with refugees, sail out to the Marmara and the Aegean'),
    ],
    arrows: [
      arrow('ottomans', MESE_N, 120, 'mese-n', 'The troops who break in follow the Mese past the Holy Apostles to the forums'),
      arrow('venice', [[28.9705, 41.0208], [28.9775, 41.0202], [28.986, 41.0185], [28.9935, 41.0155], [28.997, 41.0115]], 110, 'breakout', 'In the afternoon the ships in the Horn break the chain and sail out', 'dashed'),
      arrow('ottomans', MESE_S, 90, 'mehmed-ride', 'Mehmed rides in by the gate of St Romanos in the afternoon to Hagia Sophia. Other accounts have him enter the next day by the Charisian gate'),
    ],
  },
  markers: {
    'constantinople-fall-sophia': mk(SOPHIA, 'Hagia Sophia', 'Mehmed comes, 29 or 30 May', 'ottomans', 'church'),
  },
  show: ['st-romanos-gate', 'charisian-gate', 'holy-apostles', 'galata-1453'],
});

console.log('constantinople: bbox', JSON.stringify(bbox));
