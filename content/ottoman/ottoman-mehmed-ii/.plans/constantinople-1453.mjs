// Constantinople, 6 April to 29 May 1453: the land walls from the Marmara to the Golden Horn, the city, the Horn,
// Galata and the Bosporus shore to the Double Columns. The shores come from the elevation tiles, the land walls and gates
// from OpenStreetMap, the posts and the batteries from the accounts (README.md).
// Positions are [lon, lat]. A unit at the walls stands on the nearest point of the wall line, moved across it by metres.
import fs from 'fs';
import * as turf from '@turf/turf';
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
// a line moved sideways by d metres, to the left of its direction for d < 0 and to the right for d > 0; d can vary by vertex
const offset = (line, d) => line.map((p, i) => shift(p, bearingOf(line[Math.max(0, i - 1)], line[Math.min(line.length - 1, i + 1)]) + 90,
  typeof d === 'function' ? d(i) : d));
const face = b => Math.round(((b % 360) + 360) % 360);
// the point of a line nearest p
const on = (line, p) => {
  let best = p, bd = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const [a, b] = [line[i], line[i + 1]], ax = (b[0] - a[0]) * KX, ay = (b[1] - a[1]) * KY, px = (p[0] - a[0]) * KX, py = (p[1] - a[1]) * KY;
    const L = ax * ax + ay * ay, t = L ? Math.max(0, Math.min(1, (px * ax + py * ay) / L)) : 0, d = Math.hypot(px - ax * t, py - ay * t);
    if (d < bd) { bd = d; best = [r5(a[0] + (b[0] - a[0]) * t), r5(a[1] + (b[1] - a[1]) * t)]; }
  }
  return best;
};
const nearestIndex = (line, p) => line.reduce((bi, q, i) => dist(p, q) < dist(p, line[bi]) ? i : bi, 0);
// the part of a line between its vertices nearest a and b, running from a to b
const between = (line, a, b) => { const i = nearestIndex(line, a), j = nearestIndex(line, b); return i <= j ? line.slice(i, j + 1) : line.slice(j, i + 1).reverse(); };
const resample = (line, step) => {
  const out = [line[0]];
  for (let i = 1, carry = 0; i < line.length; i++) {
    const [a, b] = [line[i - 1], line[i]], L = dist(a, b);
    let t = step - carry;
    for (; t <= L; t += step) out.push([a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]);
    carry = L - (t - step);
  }
  return [...out, line[line.length - 1]];
};
// a moving average over n points on each side, narrowing towards the ends, which stay in place
const smooth = (line, n) => line.map((p, i) => {
  const k = Math.min(n, i, line.length - 1 - i);
  const s = line.slice(i - k, i + k + 1).reduce((a, q) => [a[0] + q[0], a[1] + q[1]], [0, 0]);
  return [s[0] / (2 * k + 1), s[1] / (2 * k + 1)];
});
const simplify = (line, m) => turf.simplify(turf.lineString(line), { tolerance: m / 111000, highQuality: true }).geometry.coordinates.map(p => p.map(r5));
// widths in metres given at points along a line, interpolated along it for each vertex
const widths = (line, given) => {
  const s = line.map((p, i) => i ? dist(line[i - 1], p) : 0).map((d, i, a) => a.slice(0, i + 1).reduce((x, y) => x + y, 0));
  const at = given.map(([p, w]) => [s[nearestIndex(line, p)], w]).sort((a, b) => a[0] - b[0]);
  return s.map(x => {
    const k = at.findIndex(([s1]) => x <= s1);
    if (k <= 0) return at[k < 0 ? at.length - 1 : 0][1];
    const [[s0, w0], [s1, w1]] = [at[k - 1], at[k]];
    return w0 + (w1 - w0) * (x - s0) / (s1 - s0);
  });
};

// --- the ground ---
// The modern shore is the 0.5 m contour of the elevation tiles at zoom 15 inside BOX (README.md). `europe` runs from the
// Bosporus round the Horn to the Marmara with the water on its left, `asia` from north to south.
const SHORE = JSON.parse(fs.readFileSync(new URL('./constantinople-1453-shore.json', import.meta.url), 'utf8'));
const BOX = [[28.8392, 40.9468], [29.0807, 40.9468], [29.0807, 41.0959], [28.8392, 41.0959]];
const EU = resample(SHORE.europe, 20);
// metres from the modern shore inland to the sea walls, the landfill since the 19th century: measured where OpenStreetMap
// maps the walls at Yedikule, Davutpaşa, the Bukoleon, the Acropolis point, Eminönü and Cibali, estimated in between
const WALL_FILL = [
  [[28.92015, 40.98902], 110], [[28.9253, 40.9908], 140], [[28.927, 40.9921], 100], [[28.9291, 40.9944], 105], [[28.9313, 40.9959], 115],
  [[28.9324, 40.9988], 145], [[28.9394, 41.0024], 90], [[28.95, 41.0035], 110], [[28.965, 41.0035], 110], [[28.9762, 41.0025], 140],
  [[28.9802, 41.0026], 75], [[28.9855, 41.0064], 50], [[28.987, 41.0094], 65], [[28.9875, 41.0129], 45], [[28.9866, 41.01455], 80],
  [[28.98, 41.016], 100], [[28.9728, 41.0169], 115], [[28.962, 41.0222], 70], [[28.9587, 41.0262], 56], [[28.95, 41.0335], 60], [[28.9462, 41.0384], 60],
];
const AYVANSARAY = [28.9428, 41.0401];
const CITY_SHORE = between(EU, [28.92015, 40.98902], [28.9462, 41.0384]);
const cityFill = widths(CITY_SHORE, WALL_FILL);
// the sea walls from the Marble Tower along the Marmara to the Acropolis point, then along the Horn to the land walls at Ayvansaray
const SEA_WALL = [[28.92015, 40.98902], ...simplify(offset(smooth(CITY_SHORE, 8), i => -cityFill[i]), 12).slice(1), AYVANSARAY];
// OpenStreetMap's land walls, simplified to 20 m: the Theodosian walls from the Marble Tower to the Palace of the
// Porphyrogenitus (Tekfur Sarayı), then the walls of Blachernae by the Kaligaria gate (Eğrikapı) and the Anemas to the Horn
const THEODOSIAN = [[28.92015, 40.98902], [28.92066, 40.99049], [28.92252, 40.99213], [28.9227, 40.99279], [28.92176, 40.9947], [28.92041, 40.99989],
  [28.92215, 41.00808], [28.92265, 41.00825], [28.92271, 41.00898], [28.92236, 41.00922], [28.92258, 41.01107], [28.92198, 41.01329], [28.92253, 41.01603],
  [28.9232, 41.01741], [28.92622, 41.02163], [28.93441, 41.02901], [28.9362, 41.03136], [28.94011, 41.03331]];
const BLACHERNAE = [[28.94011, 41.03331], [28.94038, 41.03452], [28.93912, 41.03496], [28.93943, 41.03617], [28.9392, 41.03738], [28.93941, 41.03788],
  [28.94124, 41.03881], [28.94172, 41.03971], AYVANSARAY];
const LAND = [...THEODOSIAN, ...BLACHERNAE.slice(1)];
// the gates OpenStreetMap maps, and the Lycus where Vatan Caddesi passes the walls, with the Fifth Military Gate just north of it
const GATE = {
  marble: THEODOSIAN[0], golden: on(THEODOSIAN, [28.92206, 40.99422]), xylokerkos: on(THEODOSIAN, [28.92046, 40.99984]),
  pege: on(THEODOSIAN, [28.92175, 41.00605]), rhegion: on(THEODOSIAN, [28.922, 41.0141]), romanos: on(THEODOSIAN, [28.9263, 41.0217]),
  lycus: on(THEODOSIAN, [28.9297, 41.0247]), fifth: on(THEODOSIAN, [28.9304, 41.0254]), charisian: on(THEODOSIAN, [28.9343, 41.0289]),
  porphyrogenitus: THEODOSIAN[THEODOSIAN.length - 1], kaligaria: on(BLACHERNAE, [28.9394, 41.03647]), blachernae: on(BLACHERNAE, [28.9405, 41.0382]),
  horn: AYVANSARAY,
};
// the Genoese walls of Galata: the sea wall 60 to 90 m inside the modern shore from the Horn west of Karaköy to the
// Bosporus at Tophane, and the land walls up to the Galata Tower, on the west after the stretches OpenStreetMap maps
const GALATA_SHORE = between(EU, [28.9682, 41.02435], [28.9825, 41.0252]);
const galataFill = widths(GALATA_SHORE, [[[28.9682, 41.02435], 60], [[28.9725, 41.0217], 90], [[28.9825, 41.0252], 90]]);
const GALATA_SEA = simplify(offset(smooth(GALATA_SHORE, 3), i => -galataFill[i]), 10);
const GALATA_TOWER = [28.97416, 41.02566];
const GALATA = [GALATA_SEA[0], [28.9687, 41.0247], [28.9691, 41.025], [28.97, 41.0258], [28.9703, 41.0265], GALATA_TOWER, [28.9772, 41.0256],
  [28.9805, 41.0258], ...[...GALATA_SEA].reverse()];
// the chain's ends on the walls: the tower of Eugenius by Sirkeci and the Kastellion of Galata at Karaköy
const EUGENIUS = on(SEA_WALL, [28.9795, 41.0174]), KASTELLION = on(GALATA_SEA, [28.9768, 41.0222]);

// The water of 1453: the modern sea of BOX widened over the landfill, up to a strip of shore outside the walls (25 m on the
// Marmara, 40 m on the Horn for the quays, 30 m at Galata), and by an estimated 40 to 70 m away from the walls
const ring = l => [...l, l[0]];
const [eu, as] = [SHORE.europe, SHORE.asia];
const modern = turf.polygon([ring([...eu, [BOX[0][0], eu[eu.length - 1][1]], BOX[0], BOX[1], [BOX[1][0], as[as.length - 1][1]], ...[...as].reverse()])]);
// a band of the given widths along a line, as buffers of its runs of one width rounded to 10 m
const band = (line, w) => {
  const parts = [];
  for (let start = 0, i = 1; i <= line.length; i++) {
    if (i < line.length && Math.round(w[i] / 10) === Math.round(w[start] / 10)) continue;
    const width = Math.round(w[start] / 10) * 10, run = line.slice(Math.max(0, start - 1), Math.min(line.length, i + 1));
    if (width > 0 && run.length > 1) parts.push(turf.buffer(turf.lineString(run), width, { units: 'meters', steps: 4 }));
    start = i;
  }
  return parts;
};
const iAcropolis = nearestIndex(CITY_SHORE, [28.9875, 41.0155]);
const [cityLo, cityHi] = [CITY_SHORE[0], CITY_SHORE[CITY_SHORE.length - 1]].map(p => nearestIndex(EU, p)).sort((a, b) => a - b);
const [galLo, galHi] = [GALATA_SHORE[0], GALATA_SHORE[GALATA_SHORE.length - 1]].map(p => nearestIndex(EU, p)).sort((a, b) => a - b);
const otherFill = EU.map((p, i) => i < galLo ? 70 : i <= galHi ? 0 : i < cityLo ? 40 : i <= cityHi ? 0 : 50);
const widened = turf.union(turf.featureCollection([modern, ...band(EU, otherFill),
  ...band(CITY_SHORE, cityFill.map((w, i) => w - (i < iAcropolis ? 25 : 40))), ...band(GALATA_SHORE, galataFill.map(w => w - 30))]));
const walled = turf.union(turf.featureCollection([turf.polygon([ring([...LAND, ...[...SEA_WALL].reverse().slice(1, -1)])]), turf.polygon([GALATA]),
  ...[SEA_WALL, GALATA_SEA].map(l => turf.buffer(turf.lineString(l), 18, { units: 'meters', steps: 4 }))]));
const water = turf.difference(turf.featureCollection([widened, walled])).geometry;
// the outer ring of the largest piece, simplified to 10 m
const sea = turf.simplify(turf.polygon([(water.type === 'Polygon' ? [water.coordinates] : water.coordinates).map(p => p[0])
  .sort((a, b) => turf.area(turf.polygon([b])) - turf.area(turf.polygon([a])))[0]]), { tolerance: 10 / 111000, highQuality: true })
  .geometry.coordinates[0].slice(0, -1).map(p => p.map(r5));
// the Lycus comes down from Bayrampaşa in the valley the heights show, passes the walls with Vatan Caddesi and runs
// through the city to the silted harbour of Eleutherios
const LYCUS = [[28.9165, 41.0435], [28.918, 41.038], [28.9195, 41.036], [28.921, 41.033], [28.9225, 41.031], [28.9245, 41.0293], [28.927, 41.0272],
  GATE.lycus, [28.932, 41.0236], [28.9348, 41.021], [28.937, 41.019], [28.9395, 41.0175], [28.9415, 41.0158], [28.9445, 41.014], [28.947, 41.0125],
  [28.9495, 41.011], [28.951, 41.0085], [28.9505, 41.0055]];
const ground = {
  land: [{ area: BOX }],
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
  const q = on(line, p), b = bearingAt(line, q);
  return { side, type, at: shift(q, b + 90, d), width, depth, facing: face(b - 90), id, name };
};
// a defenders' post on the sea walls: d metres inside, facing the water
const seaPost = (side, p, width, id, name, d = 90) => {
  const q = on(SEA_WALL, p), b = bearingAt(SEA_WALL, q);
  return { side, type: 'infantry', at: shift(q, b - 90, d), width, depth: 90, facing: face(b + 90), id, name };
};
// an Ottoman body before the land walls: d metres out from the wall line, facing it
const before = (type, p, d, width, depth, id, name, extra = {}) => {
  const q = on(LAND, p), b = bearingAt(LAND, q);
  return { side: 'ottomans', type, at: shift(q, b - 90, d), width, depth, facing: face(b + 90), id, name, ...extra };
};
// a fleet as rows of hulls L metres long, about five times a galley's length, so that a hull reads at the scale of the city
const ships = (side, at, facing, _w, _d, rows, count, id, name, L = 200) => {
  const cols = Math.ceil(count / rows);
  return { side, type: 'ships', at, width: Math.round(L * cols / 1.6), depth: Math.round(L * rows / 0.85), facing, rows, count, id, name };
};
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const toward = (a, b) => face(bearingOf(a, b));
const outAt = (p, d) => { const q = on(LAND, p); return shift(q, bearingAt(LAND, q) - 90, d); };
const inAt = (p, d) => { const q = on(LAND, p); return shift(q, bearingAt(LAND, q) + 90, d); };
const mid = (a, b) => [r5((a[0] + b[0]) / 2), r5((a[1] + b[1]) / 2)];

const POSTS = {
  kantakouzenos: post('byzantium', [28.9213, 40.9908], 160, 'kantakouzenos', 'Demetrios Kantakouzenos at the south end of the land walls'),
  manuel: post('genoa', GATE.golden, 200, 'manuel', 'Manuel the Genoese with 200 archers at the Golden Gate'),
  filippo: post('venice', [28.9213, 41.003], 650, 'filippo-contarini', 'Filippo Contarini’s Venetians and Greeks, from the Golden Gate to the Pege gate'),
  cataneo: post('genoa', GATE.pege, 350, 'cataneo', 'Maurizio Cataneo’s Genoese at the Pege gate'),
  constantine: post('byzantium', mid(GATE.romanos, GATE.lycus), 480, 'constantine', 'Constantine XI with his Greek troops at the Mesoteichion, from the gate of St Romanos to the Lycus'),
  giustinianiStart: post('genoa', GATE.charisian, 420, 'giustiniani', 'Giovanni Giustiniani Longo with his 700 Genoese at the Charisian gate, at first'),
  bocchiardi: post('genoa', [28.9378, 41.0323], 300, 'bocchiardi', 'The brothers Paolo, Antonio and Troilo Bocchiardi at the Myriandrion, by the Charisian gate'),
  theophilos: post('byzantium', GATE.kaligaria, 260, 'theophilos', 'Theophilos Palaiologos and the engineer Johannes Grant at the Kaligaria gate'),
  minotto: post('venice', GATE.blachernae, 200, 'minotto', 'The Venetian bailo Girolamo Minotto with his Venetians at the palace of Blachernae'),
  jacopo: seaPost('venice', [28.93, 40.9962], 300, 'jacopo-contarini', 'Jacopo Contarini at Studios, on the Marmara walls'),
  orhan: seaPost('byzantium', [28.9505, 41.0034], 340, 'orhan', 'Prince Orhan, a claimant to the Ottoman throne, with his Turks at the harbour of Eleutherios'),
  catalans: seaPost('byzantium', [28.9745, 41.0037], 380, 'catalans', 'Catalan and Genoese troops at the old Great Palace'),
  isidore: seaPost('byzantium', [28.9869, 41.0125], 380, 'isidore', 'Cardinal Isidore with his 200 archers at the Acropolis point, by the end of the chain'),
  trevisano: seaPost('venice', [28.9565, 41.0251], 480, 'trevisano', 'Gabriele Trevisano with Venetian and Genoese sailors on the walls along the Horn'),
  notaras: seaPost('byzantium', [28.9475, 41.0336], 380, 'notaras', 'Loukas Notaras on the Horn walls at the Petrion. Other accounts put him with a reserve of horsemen in the Petra quarter'),
  nikephoros: { side: 'byzantium', type: 'cavalry', at: [28.9497, 41.0195], width: 300, depth: 100, facing: 300, id: 'nikephoros', name: 'Nikephoros Palaiologos with the reserve at the church of the Holy Apostles' },
};
const DIEDO = ships('venice', [28.9737, 41.0199], 80, 480, 340, 2, 8, 'diedo', 'The 26 ships in the Horn behind the chain under the Venetian Alviso Diedo: Venetian, Genoese, Cretan, Byzantine and others', 160);
const JANISSARIES = before('infantry', GATE.romanos, 520, 650, 130, 'janissaries', 'Mehmed’s janissaries, 5,000 to 10,000, before the gate of St Romanos and the Mesoteichion', { bow: 60 });
const RUMELIANS = before('infantry', [28.937, 41.0318], 560, 1000, 220, 'rumelians', 'The Rumelian troops under Karaca Pasha, the beylerbey of Rumelia, from the Charisian gate to the Horn', { bow: 40 });
const ANATOLIANS = before('infantry', [28.9218, 41.006], 560, 2300, 220, 'anatolians', 'The Anatolian troops under İshak Pasha, the beylerbey of Anatolia, from the Lycus to the Sea of Marmara', { bow: 40 });
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
  'blachernae-1453': { lnglat: [28.9425, 41.0385], icon: 'landmark', color: 'byzantium', label: 'Blachernae', note: 'The imperial palace' },
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
      arrow('ottomans', [[29.008, 41.034], [29.0015, 41.019], [29.006, 41.0], [29.01, 40.986]], 100, 'islands', 'Part of the fleet sails to the Princes’ Islands and takes them'),
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
const FOUR = [28.9948, 41.0165];
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
      { side: 'ottomans', type: 'cavalry', at: [28.9853, 41.029], width: 420, depth: 160, facing: 135, id: 'mehmed', name: 'Mehmed with his horsemen on the shore below Pera. He rides his horse into the sea and shouts orders to his captains' },
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
      ships('ottomans', [28.9565, 41.0315], 140, 560, 400, 3, 9, 'in-horn', '72 ships launched into the Horn below Kasımpaşa, in the valley called the Springs', 150),
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
    'constantinople-overland-kasimpasa': mk([28.9612, 41.0352], 'Kasımpaşa', 'The ships reach the Horn', 'ottomans', 'anchor'),
    'constantinople-overland-coco': mk([28.9635, 41.0255], 'Giacomo Coco', 'His galley sunk, 28 April', 'venice', 'skull'),
  },
  show: ['galata-1453', 'double-columns'],
});

// --- 060 the mines at the Kaligaria gate, the siege tower, the bridge of barrels, May ---
const MINE = (from, to) => [outAt(from, 330), outAt(mid(from, to), 120), outAt(to, -10)];
const BRIDGE = [[28.9418, 41.0405], [28.9445, 41.042], [28.9475, 41.0434]];
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
      ships('ottomans', [28.9565, 41.0315], 140, 560, 400, 3, 9, 'in-horn', 'The Ottoman ships in the Horn below Kasımpaşa', 150),
      { side: 'ottomans', type: 'infantry', at: [28.9502, 41.044], width: 380, depth: 120, facing: 225, id: 'zaganos', name: 'Zaganos Pasha’s troops at the north end of the bridge' },
      POSTS.constantine,
    ],
    arrows: [arrow('ottomans', [[28.9495, 41.0442], [28.946, 41.0429], [28.9425, 41.0409]], 90, 'crossing', 'Zaganos’s troops can now cross the Horn to the walls')],
    clashes: [{ at: outAt(GATE.kaligaria, 30), size: 110 }],
  },
  markers: {
    'constantinople-mines-grant': mk(inAt(GATE.kaligaria, 450), 'Johannes Grant', 'Digs the countermines', 'byzantium'),
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
      before('infantry', [28.9398, 41.0379], 180, 400, 140, 'rumelians', 'Karaca Pasha’s Rumelians attack the walls of Blachernae'),
      post('byzantium', GATE.lycus, 360, 'constantine', 'Constantine XI with his Greeks at the stockade'),
      POSTS.bocchiardi,
      POSTS.minotto,
      ships('ottomans', [28.953, 41.033], 150, 620, 380, 3, 9, 'horn-fleet', 'The ships in the Horn bring ladders against the Horn walls', 150),
      ships('ottomans', [28.958, 40.9975], 0, 1000, 380, 2, 12, 'marmara-fleet', 'Hamza Bey’s fleet attacks the Marmara walls'),
      { side: 'ottomans', type: 'infantry', at: [28.9447, 41.042], width: 120, depth: 300, facing: 235, id: 'zaganos', name: 'Zaganos Pasha’s troops cross the bridge of barrels to the walls' },
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
      ships('ottomans', [28.958, 41.031], 140, 620, 380, 3, 9, 'horn-fleet', 'The sailors of the fleet leave their ships to plunder the quarters along the Horn. The Horn is in Ottoman hands by midday', 150),
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
