// The political map: zones for the strategic pages, written to shared/zones/, with the page map in .plans/zones.yaml
// and the Turkish names in .i18n-parts/zones.tr.yaml. Run from the story folder: node .plans/zones.mjs
// Classic kingdoms had no fixed borders: each is a rounded area around its capital, with open land between kingdoms.
// From the Postclassic on, the land is cut into pieces, each the Voronoi cells of a few seed points (towns of one
// province or people), so neighbouring pieces share one exact border. A zone joins pieces and reaches into the sea,
// where the build clips it to the coast. Env: PIECES=<file> writes the pieces as GeoJSON to look at.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import * as turf from '@turf/turf';
import * as ts from 'topojson-server';
import * as tc from 'topojson-client';

const require = createRequire(import.meta.url);
const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fc = parts => turf.featureCollection(parts.flat());
const U = (...parts) => parts.flat().length === 1 ? parts.flat()[0] : turf.union(fc(parts));
const D = (a, ...bs) => turf.difference(fc([a, ...bs]));
const I = (a, b) => turf.intersect(fc([a, b]));
const poly = (...pts) => turf.polygon([[...pts, pts[0]]]);

// a rounded area around a point, w and h km across, turned deg anticlockwise, its edge waved a little
const blob = ([lon, lat], w, h, deg = 0) => {
  const a = deg * Math.PI / 180, kx = 111.32 * Math.cos(lat * Math.PI / 180), ky = 110.57;
  const p1 = (lon * 7 + lat * 13) % (2 * Math.PI), p2 = (lon * 11 - lat * 5) % (2 * Math.PI);
  const pts = [...Array(72)].map((_, i) => {
    const t = i / 72 * 2 * Math.PI, r = 1 + 0.05 * (0.6 * Math.sin(2 * t + p1) + 0.4 * Math.sin(3 * t + p2));
    const x = w / 2 * r * Math.cos(t), y = h / 2 * r * Math.sin(t);
    return [lon + (x * Math.cos(a) - y * Math.sin(a)) / kx, lat + (x * Math.sin(a) + y * Math.cos(a)) / ky];
  });
  return poly(...pts);
};

// --- capitals of the Classic kingdoms, from the site articles ---
const C = {
  mirador: [-89.88, 17.72], tikal: [-89.6236, 17.2220], uaxactun: [-89.6345, 17.3936], teotihuacan: [-98.8439, 19.6925],
  elPeru: [-90.3806, 17.2783], laCorona: [-90.3722, 17.5197], calakmul: [-89.8108, 18.1054], dzibanche: [-88.7592, 18.6386],
  naranjo: [-89.2622, 17.1336], caracol: [-89.1175, 16.7639], dosPilas: [-90.2958, 16.4458], aguateca: [-90.2043, 16.3950],
  cancuen: [-90.0403, 16.0131], seibal: [-90.0611, 16.5117], palenque: [-92.0464, 17.4842], tonina: [-92.0097, 16.9012],
  piedrasNegras: [-91.2617, 17.1667], yaxchilan: [-90.9667, 16.9000], bonampak: [-91.0650, 16.7040], copan: [-89.1425, 14.8375],
  quirigua: [-89.0403, 15.2694], uxmal: [-89.7714, 20.3594], chichen: [-88.5686, 20.6831], ekBalam: [-88.1364, 20.8911],
  coba: [-87.7319, 20.4900],
};
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const K = {
  mirador: blob(C.mirador, 56, 44, 20),
  tikal300: blob([-89.615, 17.15], 50, 32, 0),
  uaxactun: blob([-89.635, 17.445], 22, 18, 0),
  tikal: blob([-89.625, 17.29], 44, 58, 0),
  teotihuacan: blob(C.teotihuacan, 44, 34, 15),
  elPeru: blob(C.elPeru, 24, 20, 0),
  laCorona: blob(C.laCorona, 20, 17, 0),
  kaanulDzibanche: blob(C.dzibanche, 70, 60, 30),
  kaanulBoth: blob(mid(C.calakmul, C.dzibanche), 186, 64, 28),
  kaanulCalakmul: blob(C.calakmul, 72, 64, 0),
  naranjo: blob(C.naranjo, 22, 26, 0),
  caracol: blob(C.caracol, 32, 30, 0),
  dosPilas: blob([-90.26, 16.43], 34, 28, -20),
  cancuen: blob(C.cancuen, 24, 22, 0),
  aguateca: blob([-90.215, 16.41], 18, 16, 0),
  seibal: blob(C.seibal, 20, 18, 0),
  palenque: blob(C.palenque, 42, 34, 0),
  tonina: blob(C.tonina, 30, 26, 0),
  piedrasNegras: blob(C.piedrasNegras, 30, 30, 0),
  yaxchilan: blob([-90.95, 16.93], 28, 24, 0),
  bonampak: blob([-91.07, 16.69], 16, 16, 0),
  copan: blob(C.copan, 44, 34, 20),
  quirigua: blob(C.quirigua, 28, 20, 30),
  uxmal: blob([-89.69, 20.27], 48, 36, -35),
  chichen: blob(C.chichen, 56, 50, 0),
  ekBalam: blob(C.ekBalam, 26, 26, 0),
  coba: blob(C.coba, 60, 56, 0),
  coba1000: blob(C.coba, 42, 42, 0),
};
// Chichen Itza around 1000, from central Yucatán to the north coast and its port at Isla Cerritos
K.chichenDomain = poly([-89.45, 21.0], [-89.45, 21.45], [-89.2, 21.75], [-88.5, 21.85], [-87.75, 21.8], [-87.55, 21.35], [-87.75, 21.05],
  [-88.0, 20.75], [-88.12, 20.4], [-88.5, 20.22], [-88.95, 20.3], [-89.3, 20.55]);

// --- pieces of the land from the Postclassic on: seed points of each province or people ---
const SEEDS = {
  // the provinces (kuchkabal) of northern Yucatán
  ahcanul: [[-90.05, 20.37], [-90.13, 20.18], [-90.0, 20.62], [-90.25, 20.95], [-90.25, 20.45], [-90.12, 21.08]],
  chakan: [[-89.62, 20.97], [-89.86, 21.02], [-89.74, 20.84], [-89.52, 20.78], [-89.85, 21.20], [-89.46, 20.64]],
  cehpech: [[-89.28, 21.10], [-89.50, 21.12], [-89.64, 21.27], [-89.38, 21.00], [-89.27, 21.32]],
  ahkinchel: [[-89.02, 20.93], [-88.96, 21.15], [-88.90, 21.36], [-89.12, 21.04], [-88.78, 21.05]],
  hocaba: [[-89.25, 20.81], [-89.29, 20.72], [-89.16, 20.74]],
  mani: [[-89.40, 20.38], [-89.55, 20.40], [-89.42, 20.25], [-89.27, 20.20], [-89.71, 20.47], [-89.62, 20.15], [-89.33, 20.52], [-89.80, 20.30], [-89.45, 20.02]],
  sotuta: [[-89.01, 20.60], [-88.83, 20.55], [-89.08, 20.45], [-88.88, 20.38], [-88.95, 20.72]],
  cupul: [[-88.20, 20.69], [-88.57, 20.68], [-88.14, 20.89], [-88.40, 20.80], [-88.32, 21.02], [-87.96, 20.62], [-88.62, 20.92], [-88.55, 21.22], [-88.60, 21.40], [-88.42, 20.52]],
  tazes: [[-87.80, 20.99], [-87.70, 20.80]],
  chikinchel: [[-88.15, 21.45], [-87.88, 21.33], [-87.65, 21.47], [-88.05, 21.20], [-88.28, 21.48]],
  ecab: [[-87.07, 21.45], [-87.48, 21.15], [-86.95, 21.10], [-87.06, 20.75], [-87.12, 20.60], [-87.25, 20.45], [-87.36, 20.32], [-87.45, 20.15],
    [-87.74, 20.45], [-87.30, 20.85], [-87.35, 21.50]],
  cozumel: [[-86.95, 20.35], [-86.88, 20.48], [-86.80, 20.57]],
  cochuah: [[-88.37, 20.19], [-88.58, 20.05], [-88.20, 19.88], [-88.42, 19.70], [-88.05, 20.18]],
  uaymil: [[-87.62, 19.72], [-87.75, 19.35], [-87.95, 19.00], [-88.05, 19.45], [-87.85, 19.85]],
  chetumal: [[-88.40, 18.40], [-88.43, 18.09], [-88.40, 18.68], [-88.62, 17.85], [-88.10, 18.25], [-87.95, 18.55], [-88.70, 18.25]],
  canpech: [[-90.53, 19.85], [-90.30, 19.98], [-90.26, 19.72], [-90.45, 20.05]],
  champoton: [[-90.72, 19.35], [-90.55, 19.50], [-90.92, 19.05], [-90.40, 19.20], [-91.20, 18.85]],
  acalan: [[-91.15, 18.07], [-91.42, 18.30], [-90.85, 18.20], [-91.65, 18.50], [-91.05, 18.50], [-92.05, 18.30]],
  potonchan: [[-92.64, 18.52], [-92.92, 18.28], [-92.45, 18.30], [-93.20, 18.25], [-92.80, 17.98], [-93.50, 18.20]],
  // the south of the peninsula
  kejache: [[-90.27, 18.62], [-90.12, 18.25], [-89.95, 17.92], [-89.80, 17.60], [-90.25, 17.95]],
  itza: [[-89.99, 16.99], [-89.80, 17.00], [-90.12, 16.92], [-90.05, 16.75], [-89.78, 16.80], [-89.90, 17.15], [-90.25, 17.05]],
  presidio: [[-89.89, 16.91], [-89.92, 16.83]],
  kowoj: [[-89.64, 16.99], [-89.45, 17.06], [-89.55, 16.88], [-89.38, 16.95]],
  lakandon: [[-91.28, 16.42], [-91.00, 16.30], [-90.72, 16.22], [-91.52, 16.58], [-90.92, 16.58]],
  manche: [[-89.07, 15.91], [-89.35, 15.85], [-89.65, 15.95], [-88.90, 15.62], [-88.80, 15.95], [-88.62, 16.25], [-88.42, 16.62], [-89.95, 16.05]],
  // the highlands
  kiche: [[-91.17, 15.02], [-91.11, 14.94], [-91.36, 14.91], [-91.41, 15.04], [-90.95, 15.00], [-90.81, 14.99], [-91.28, 14.82]],
  xelaju: [[-91.52, 14.84], [-91.48, 14.76], [-91.50, 14.92]],
  kicheCoast: [[-91.65, 14.60], [-91.52, 14.58], [-91.68, 14.45], [-91.85, 14.45]],
  mamSouth: [[-91.80, 14.96], [-91.92, 15.08], [-91.62, 14.87], [-92.06, 14.91], [-91.86, 14.70], [-92.00, 14.55]],
  mam: [[-91.49, 15.33], [-91.46, 15.40], [-91.95, 15.41], [-91.62, 15.50], [-91.30, 15.33], [-91.70, 15.25]],
  sacapulas: [[-91.09, 15.29], [-90.95, 15.30]],
  cuchumatanes: [[-91.50, 15.75], [-91.15, 15.50], [-90.87, 15.45], [-91.90, 15.85], [-91.25, 15.75]],
  kaqchikel: [[-91.00, 14.74], [-91.18, 14.77], [-91.02, 14.66], [-90.82, 14.66], [-90.89, 14.76], [-90.94, 14.55], [-90.73, 14.56], [-90.81, 14.47], [-91.09, 14.54]],
  tzutujil: [[-91.23, 14.64], [-91.27, 14.69], [-91.14, 14.63], [-91.33, 14.54], [-91.42, 14.52], [-91.20, 14.45], [-91.35, 14.30], [-91.15, 14.25]],
  chajoma: [[-90.79, 14.78], [-90.66, 14.87], [-90.64, 14.72]],
  poqomam: [[-90.50, 14.71], [-90.61, 14.63], [-90.55, 14.50], [-90.62, 14.47], [-89.99, 14.63], [-89.73, 14.64], [-90.41, 14.55], [-90.20, 14.75]],
  achi: [[-90.49, 15.09], [-90.32, 15.10]],
  verapaz: [[-90.37, 15.47], [-90.20, 15.35], [-90.30, 15.75], [-89.95, 15.50]],
  pipilIzc: [[-90.78, 14.30], [-90.95, 14.10], [-90.60, 14.15], [-90.85, 13.95]],
  xinca: [[-90.30, 14.10], [-90.00, 14.00], [-89.80, 14.25], [-90.15, 14.35]],
  pipilCuz: [[-89.20, 13.72], [-89.67, 13.74], [-89.83, 13.59], [-89.85, 13.92], [-89.00, 13.85], [-89.45, 13.95], [-88.90, 13.55]],
  // Chiapas and Mexico
  xoconochco: [[-93.04, 15.44], [-92.69, 15.28], [-92.47, 15.14], [-92.38, 15.02], [-92.26, 14.90], [-92.45, 14.86], [-92.17, 14.67]],
  chiapasCoast: [[-93.75, 16.09], [-93.90, 16.25], [-93.40, 15.85], [-93.21, 15.69]],
  chiapas: [[-92.85, 15.75], [-92.50, 15.55], [-92.64, 16.74], [-92.10, 16.90], [-92.13, 16.25], [-92.45, 16.45], [-93.10, 16.75], [-93.40, 16.95], [-92.95, 17.15], [-92.40, 17.05]],
  central: [[-99.13, 19.43], [-98.84, 19.69], [-98.20, 19.04], [-97.50, 19.30], [-96.92, 19.53], [-96.13, 19.19], [-97.40, 20.50], [-98.40, 21.20],
    [-99.20, 20.50], [-99.40, 18.50], [-98.00, 18.20], [-97.20, 17.50], [-96.72, 17.06], [-96.50, 16.20], [-95.80, 17.90], [-95.20, 18.45],
    [-94.45, 18.12], [-94.60, 17.40], [-95.02, 16.32], [-94.36, 16.48]],
  // land left out of every zone, so the zones around it keep their size
  zoque: [[-93.40, 17.55], [-93.00, 17.40], [-92.60, 17.55]],
  chiapasNorth: [[-91.85, 17.35], [-92.30, 17.50], [-91.50, 17.60], [-91.20, 17.20]],
  westPeten: [[-90.55, 17.40], [-90.75, 16.95], [-90.35, 16.55], [-90.60, 17.80]],
  southPeten: [[-89.90, 16.55], [-90.05, 16.30], [-89.55, 16.55], [-89.20, 16.65], [-89.40, 16.30]],
  northPeten: [[-89.35, 17.65], [-89.65, 17.30], [-89.10, 17.20]],
  interior: [[-89.30, 18.80], [-89.70, 19.30], [-89.05, 19.40], [-88.95, 18.20], [-89.50, 18.20], [-89.90, 19.75], [-90.70, 18.50]],
  belize: [[-88.75, 17.25], [-88.45, 17.45], [-88.90, 16.90]],
  oriente: [[-89.75, 14.95], [-89.54, 14.80], [-89.30, 15.20], [-88.75, 15.35], [-89.15, 14.84]],
  honduras: [[-88.60, 14.75], [-88.00, 15.10], [-87.60, 14.40], [-88.30, 14.10], [-87.80, 15.60], [-86.90, 15.00], [-88.60, 13.60], [-88.10, 13.40]],
};
const BOX = [-99.6, 12.9, -86.3, 22.6];
const cells = turf.voronoi(fc(Object.entries(SEEDS).flatMap(([piece, list]) => list.map(c => turf.point(c, { piece })))), { bbox: BOX });
const PIECE = {};
for (const piece of Object.keys(SEEDS)) PIECE[piece] = U(cells.features.filter(f => f.properties.piece === piece));
// the pieces as one coverage: the borders, split every 4 km, are eased several times over, each point towards its
// neighbours along the border and each corner where pieces meet towards the points around it; a shared point moves once,
// so neighbours keep one border. The outer frame stays put. Last, the borders are thinned to points about 500 m off a line.
const thin = (pts, tol = 0.005) => {
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let max = 0, idx = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) {
      const d = len ? Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len : Math.hypot(pts[i][0] - ax, pts[i][1] - ay);
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  const out = pts.filter((_, i) => keep[i]);
  return out.length < 4 && out[0].join() === out.at(-1).join() ? pts : out;
};
const split = (pts, step) => pts.flatMap((p, i) => {
  if (i === pts.length - 1) return [p];
  const q = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step));
  return [...Array(n)].map((_, k) => [p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]);
});
{
  const topo = ts.topology({ pieces: fc(Object.entries(PIECE).map(([piece, g]) => turf.feature(g.geometry, { piece }))) });
  const key = c => c.join(), frame = c => c[0] <= BOX[0] || c[0] >= BOX[2] || c[1] <= BOX[1] || c[1] >= BOX[3];
  let arcs = topo.arcs.map(arc => split(arc, 0.04));
  for (let round = 0; round < 40; round++) {
    const around = new Map();
    for (const arc of arcs) for (const [end, next] of [[arc[0], arc[1]], [arc.at(-1), arc.at(-2)]]) {
      const a = around.get(key(end)) ?? around.set(key(end), { p: end, x: 0, y: 0, n: 0 }).get(key(end));
      a.x += next[0]; a.y += next[1]; a.n++;
    }
    const moved = new Map([...around].map(([k, a]) => [k, frame(a.p) ? a.p : [(a.p[0] + a.x / a.n) / 2, (a.p[1] + a.y / a.n) / 2]]));
    arcs = arcs.map(arc => arc.map((p, i) => i === 0 || i === arc.length - 1 ? moved.get(key(p)) : frame(p) ? p
      : [(2 * p[0] + arc[i - 1][0] + arc[i + 1][0]) / 4, (2 * p[1] + arc[i - 1][1] + arc[i + 1][1]) / 4]));
  }
  topo.arcs = arcs.map(arc => thin(arc));
  for (const f of tc.feature(topo, topo.objects.pieces).features) PIECE[f.properties.piece] = turf.feature(f.geometry);
}
const P = (...names) => {
  const g = U(names.map(n => PIECE[n] ?? (() => { throw new Error(`no piece ${n}`); })()));
  if (g.geometry.type !== 'Polygon') throw new Error(`pieces ${names.join(', ')} do not join`);
  return g;
};
if (process.env.PIECES) fs.writeFileSync(process.env.PIECES, JSON.stringify(fc(Object.entries(PIECE).map(([piece, g]) => turf.feature(g.geometry, { piece, seeds: SEEDS[piece] })))));

const NORTH = ['ahcanul', 'chakan', 'cehpech', 'ahkinchel', 'hocaba', 'mani', 'sotuta', 'cupul', 'tazes', 'chikinchel', 'ecab', 'cozumel', 'cochuah', 'canpech'];
const YUCATAN = [...NORTH, 'uaymil', 'chetumal', 'champoton'];
const HIGHLANDS = ['kiche', 'xelaju', 'kicheCoast', 'mamSouth', 'mam', 'sacapulas', 'cuchumatanes', 'kaqchikel', 'tzutujil', 'chajoma', 'poqomam',
  'achi', 'verapaz', 'pipilIzc', 'xinca', 'pipilCuz', 'oriente', 'xoconochco', 'chiapasCoast', 'chiapas'];

// --- Cuba, and the Caste War borders ---
const cuba = poly([-85.4, 21.6], [-84.9, 22.4], [-83.5, 23.3], [-82.0, 23.5], [-80.0, 23.5], [-80.0, 21.2], [-82.0, 21.15], [-83.2, 21.2], [-84.3, 21.4]);
// the border of Mexico and Belize along the Río Hondo, from the Natural Earth data the build draws, then across Chetumal Bay
const world = JSON.parse(fs.readFileSync(require.resolve('world-atlas/countries-10m.json')));
const byName = n => g => g.properties.name === n;
const hondo = tc.mesh(world, world.objects.countries, (a, b) => [a, b].some(byName('Mexico')) && [a, b].some(byName('Belize'))).coordinates
  .sort((a, b) => b.length - a.length)[0];
if (hondo[0][1] > hondo.at(-1)[1]) hondo.reverse();   // from the Guatemalan corner to the bay
const belizeSide = poly(...hondo, [-87.86, 18.18], [-87.4, 18.18], [-87.4, 15.6], [-89.4, 15.6], [-89.4, hondo[0][1]]);
// the land of the Cruzob in the 1860s: southern and central Quintana Roo, from Tulum to the Hondo
const cruzob = D(poly([-87.1, 20.42], [-87.6, 20.45], [-88.1, 20.4], [-88.45, 20.25], [-88.7, 20.05], [-88.85, 19.75], [-88.95, 19.4], [-89.0, 19.0],
  [-88.97, 18.6], [-88.97, 17.5], [-87.4, 17.5], [-87.4, 20.42]), belizeSide);
const britain = I(belizeSide, poly([-89.4, 15.6], [-89.4, 18.6], [-87.4, 18.6], [-87.4, 15.6]));

// --- the zones: id -> family, English name, Turkish name, shape, clip ---
const Z = {};
const zone = (id, family, en, tr, geometry, clip) => {
  if (Z[id]) throw new Error(`zone ${id} twice`);
  Z[id] = { family, en, tr, geometry, clip };
};

zone('mirador-300bc', 'kingdom', 'El Mirador and the cities of the Mirador Basin', 'El Mirador ve Mirador Havzası kentleri', K.mirador);
zone('tikal-300', 'tikal', 'Kingdom of Tikal (Mutul)', 'Tikal Krallığı (Mutul)', K.tikal300);
zone('uaxactun-300', 'kingdom', 'Uaxactun', 'Uaxactun', K.uaxactun);
zone('teotihuacan-378', 'nahua', 'Teotihuacan and its valley', 'Teotihuacan ve vadisi', K.teotihuacan);
zone('tikal-378', 'tikal', 'Tikal and Uaxactun, taken by Siyaj K\'ak\' in 378', 'Tikal ve Uaxactun, 378’de Siyaj K\'ak’ın eline geçti', K.tikal);
zone('el-peru-378', 'tikal', 'El Perú (Waka\'), allied with Tikal', 'El Perú (Waka\'), Tikal’in müttefiki', K.elPeru);
zone('tikal-426', 'tikal', 'Kingdom of Tikal (Mutul)', 'Tikal Krallığı (Mutul)', K.tikal);
zone('copan-426', 'tikal', 'Copán, refounded from Tikal in 426', 'Copán, 426’da Tikal’den yeniden kuruldu', K.copan);
zone('quirigua-426', 'tikal', 'Quiriguá, vassal of Copán', 'Quiriguá, Copán’a bağlı', K.quirigua);
zone('kaanul-550', 'kaanul', 'Kaanul kingdom of Dzibanche', 'Dzibanche merkezli Kaanul Krallığı', K.kaanulDzibanche);
zone('naranjo-546', 'kaanul', 'Naranjo, subject to the Kaanul from 546', 'Naranjo, 546’dan itibaren Kaanul’a bağlı', K.naranjo);
zone('caracol-553', 'tikal', 'Caracol, allied with Tikal in 553', 'Caracol, 553’te Tikal’in müttefiki', K.caracol);
zone('el-peru-550', 'kingdom', 'El Perú (Waka\')', 'El Perú (Waka\')', K.elPeru);
zone('la-corona-550', 'kingdom', 'La Corona (Sak Nikte\')', 'La Corona (Sak Nikte\')', K.laCorona);
zone('caracol-562', 'kaanul', 'Caracol, allied with the Kaanul', 'Caracol, Kaanul’un müttefiki', K.caracol);
zone('kaanul-599', 'kaanul', 'Kaanul kingdom of Dzibanche and Calakmul', 'Dzibanche ve Calakmul’deki Kaanul Krallığı', K.kaanulBoth);
zone('palenque-599', 'kingdom', 'Palenque (B\'aakal)', 'Palenque (B\'aakal)', K.palenque);
zone('naranjo-626', 'kingdom', 'Naranjo, at war with Caracol', 'Naranjo, Caracol ile savaşta', K.naranjo);
zone('kaanul-636', 'kaanul', 'Kaanul kingdom of Calakmul', 'Calakmul merkezli Kaanul Krallığı', K.kaanulCalakmul);
zone('palenque-650', 'tikal', 'Palenque under Pakal, allied with Tikal', 'Pakal yönetiminde Palenque, Tikal’in müttefiki', K.palenque);
zone('tonina-650', 'kingdom', 'Toniná', 'Toniná', K.tonina);
zone('piedras-negras-650', 'kingdom', 'Piedras Negras (Yokib)', 'Piedras Negras (Yokib)', K.piedrasNegras);
zone('dos-pilas-648', 'kaanul', 'Dos Pilas, subject to the Kaanul from 648', 'Dos Pilas, 648’den itibaren Kaanul’a bağlı', K.dosPilas);
zone('el-peru-650', 'kaanul', 'El Perú (Waka\'), allied with the Kaanul', 'El Perú (Waka\'), Kaanul’un müttefiki', K.elPeru);
zone('la-corona-650', 'kaanul', 'La Corona (Sak Nikte\'), allied with the Kaanul', 'La Corona (Sak Nikte\'), Kaanul’un müttefiki', K.laCorona);
zone('naranjo-650', 'kaanul', 'Naranjo, subject to the Kaanul', 'Naranjo, Kaanul’a bağlı', K.naranjo);
zone('cancuen-656', 'kaanul', 'Cancuén, subject to the Kaanul', 'Cancuén, Kaanul’a bağlı', K.cancuen);
zone('naranjo-682', 'kaanul', 'Naranjo under Lady Six Sky, allied with the Kaanul', 'Lady Six Sky yönetiminde Naranjo, Kaanul’un müttefiki', K.naranjo);
zone('yaxchilan-700', 'kingdom', 'Yaxchilan (Pa\' Chan)', 'Yaxchilan (Pa\' Chan)', K.yaxchilan);
zone('copan-738', 'tikal', 'Copán, an old ally of Tikal', 'Copán, Tikal’in eski müttefiki', K.copan);
zone('quirigua-738', 'kaanul', 'Quiriguá, backed by Calakmul', 'Quiriguá, Calakmul’un desteğiyle', K.quirigua);
zone('el-peru-743', 'kaanul', 'El Perú, Kaanul ally, defeated in 743', 'El Perú, Kaanul’un müttefiki, 743’te yenildi', K.elPeru);
zone('naranjo-744', 'kaanul', 'Naranjo, Kaanul ally, defeated in 744', 'Naranjo, Kaanul’un müttefiki, 744’te yenildi', K.naranjo);
zone('aguateca-761', 'kingdom', 'Aguateca, seat of the Dos Pilas kings after 761', 'Aguateca, 761’den sonra Dos Pilas krallarının merkezi', K.aguateca);
zone('seibal-770', 'kingdom', 'Seibal', 'Seibal', K.seibal);
zone('cancuen-770', 'kingdom', 'Cancuén', 'Cancuén', K.cancuen);
zone('bonampak-790', 'kingdom', 'Bonampak, under Yaxchilan', 'Bonampak, Yaxchilan’a bağlı', K.bonampak);
zone('uxmal-900', 'kingdom', 'Uxmal and the Puuc cities', 'Uxmal ve Puuc kentleri', K.uxmal);
zone('chichen-900', 'mayapan', 'Chichen Itza', 'Chichen Itza', K.chichen);
zone('ek-balam-900', 'kingdom', 'Ek\' Balam', 'Ek\' Balam', K.ekBalam);
zone('coba-900', 'kingdom', 'Coba', 'Coba', K.coba);
zone('chichen-1000', 'mayapan', 'Chichen Itza and its domain', 'Chichen Itza ve egemenlik alanı', K.chichenDomain);
zone('coba-1000', 'kingdom', 'Coba, in decline', 'Coba, gerilemekte', K.coba1000);

zone('mayapan-1300', 'mayapan', 'League of Mayapan', 'Mayapan Birliği', P(...NORTH));
zone('mani-1500', 'xiu', 'Maní, under the Tutul Xiu', 'Maní, Tutul Xiu yönetiminde', P('mani'));
zone('canul-1500', 'xiu', 'Ah Canul and Chakan', 'Ah Canul ve Chakan', P('ahcanul', 'chakan'));
zone('pech-1500', 'xiu', 'Ceh Pech, Ah Kin Chel and Hocaba', 'Ceh Pech, Ah Kin Chel ve Hocaba', P('cehpech', 'ahkinchel', 'hocaba'));
zone('sotuta-1500', 'cocom', 'Sotuta, under the Cocom', 'Sotuta, Cocom yönetiminde', P('sotuta'));
zone('cupul-1500', 'eastern', 'Cupul', 'Cupul', P('cupul'));
zone('chikinchel-1500', 'eastern', 'Chikinchel and Tazes', 'Chikinchel ve Tazes', P('chikinchel', 'tazes'));
zone('ecab-1500', 'eastern', 'Ecab and Cozumel', 'Ecab ve Cozumel', P('ecab', 'cozumel'));
zone('cochuah-1500', 'eastern', 'Cochuah and Uaymil', 'Cochuah ve Uaymil', P('cochuah', 'uaymil'));
zone('chetumal-1500', 'eastern', 'Chetumal', 'Chetumal', P('chetumal'));
zone('campeche-1500', 'chontal', 'Can Pech and Champotón', 'Can Pech ve Champotón', P('canpech', 'champoton'));
zone('acalan-1500', 'chontal', 'Acalan', 'Acalan', P('acalan'));
zone('itza-1500', 'itza', 'Itza kingdom of Nojpetén', 'Nojpetén merkezli Itza Krallığı', P('itza', 'presidio'));

zone('cuba-1511', 'spain', 'Spanish Cuba, from 1511', 'İspanyol Küba’sı, 1511’den itibaren', cuba);
zone('xiu-1517', 'xiu', 'Ah Canul, Chakan, Ceh Pech, Ah Kin Chel and Hocaba', 'Ah Canul, Chakan, Ceh Pech, Ah Kin Chel ve Hocaba',
  P('ahcanul', 'chakan', 'cehpech', 'ahkinchel', 'hocaba'));
zone('ecab-1517', 'eastern', 'Ecab', 'Ecab', P('ecab'));
zone('cozumel-1517', 'eastern', 'Cozumel', 'Cozumel', P('cozumel'));
zone('canpech-1517', 'chontal', 'Can Pech (Campeche)', 'Can Pech (Campeche)', P('canpech'));
zone('champoton-1517', 'chontal', 'Champotón (Chakan Putum)', 'Champotón (Chakan Putum)', P('champoton'));
zone('potonchan-1517', 'chontal', 'Potonchán and the Chontal of Tabasco', 'Potonchán ve Tabasco Chontalları', P('potonchan'));

zone('spain-1531', 'spain', 'Campeche and Champotón, Montejo’s base, 1531 – 1535', 'Campeche ve Champotón, Montejo’nun üssü, 1531 – 1535', P('canpech', 'champoton'));
zone('spain-1542', 'spain', 'Spanish Yucatán, 1542', 'İspanyol Yucatán’ı, 1542', P('canpech', 'champoton', 'ahcanul', 'chakan'));
zone('mani-1542', 'xiu', 'Maní, allied with Spain from 1542', 'Maní, 1542’den itibaren İspanya’nın müttefiki', P('mani'));
zone('spain-1546', 'spain', 'Spanish Yucatán, 1546', 'İspanyol Yucatán’ı, 1546', P('canpech', 'champoton', 'ahcanul', 'chakan', 'cehpech', 'ahkinchel', 'hocaba'));
zone('ecab-1546', 'spain', 'Ecab and Cozumel, under Spanish rule', 'Ecab ve Cozumel, İspanyol yönetiminde', P('ecab', 'cozumel'));
zone('sotuta-1546', 'cocom', 'Sotuta, in revolt from November 1546', 'Sotuta, Kasım 1546’dan itibaren ayaklanmada', P('sotuta'));
zone('revolt-1546', 'eastern', 'Cupul, Cochuah, Tazes, Chikinchel, Uaymil and Chetumal, in revolt', 'Ayaklanan Cupul, Cochuah, Tazes, Chikinchel, Uaymil ve Chetumal',
  P('cupul', 'cochuah', 'tazes', 'chikinchel', 'uaymil', 'chetumal'));
zone('spain-1562', 'spain', 'Spanish Yucatán', 'İspanyol Yucatán’ı', P(...YUCATAN.filter(p => p !== 'mani')));
zone('mani-1562', 'xiu', 'Maní, the Xiu province under Spanish rule', 'Maní, İspanyol yönetiminde Xiu eyaleti', P('mani'));

zone('new-spain-1524', 'spain', 'New Spain, to Soconusco', 'Soconusco’ya kadar Yeni İspanya', P('central', 'chiapasCoast', 'xoconochco'));
zone('kejache-1525', 'lowland', 'Kejache', 'Kejache', P('kejache'));
zone('kowoj-1525', 'itza', 'Kowoj', 'Kowoj', P('kowoj'));
zone('lakandon-1525', 'lowland', 'Lakandon Ch\'ol', 'Lakandon Ch\'olleri', P('lakandon'));
zone('manche-1525', 'lowland', 'Manche Ch\'ol', 'Manche Ch\'olleri', P('manche'));
zone('yucatan-1618', 'spain', 'Spanish Yucatán and Tabasco', 'İspanyol Yucatán’ı ve Tabasco', P(...YUCATAN, 'acalan', 'potonchan'));
zone('guatemala-1618', 'spain', 'Spanish Guatemala, Chiapas and Verapaz', 'İspanyol Guatemala’sı, Chiapas ve Verapaz', P(...HIGHLANDS));
zone('peten-1697', 'spain', 'Spanish garrison at Nojpetén, from 1697', 'Nojpetén’deki İspanyol garnizonu, 1697’den itibaren', P('presidio'));
zone('itza-1697', 'itza', 'Itza, still unconquered', 'Henüz boyun eğmemiş Itzalar', P('itza'));

zone('kiche-1450', 'kiche', 'K\'iche\' kingdom under K\'iq\'ab', 'K\'iq\'ab yönetiminde K\'iche\' Krallığı',
  P('kiche', 'xelaju', 'kicheCoast', 'mamSouth', 'kaqchikel', 'sacapulas', 'achi', 'verapaz'));
zone('tzutujil-1450', 'highland', 'Tz\'utujil kingdom of Atitlan', 'Atitlan merkezli Tz\'utujil Krallığı', P('tzutujil'));
zone('mam-1450', 'highland', 'Mam kingdom of Zaculeu', 'Zaculeu merkezli Mam Krallığı', P('mam'));
zone('poqomam-1450', 'highland', 'Poqomam', 'Poqomamlar', P('poqomam'));
zone('kiche-1500', 'kiche', 'K\'iche\' kingdom of Q\'umarkaj', 'Q\'umarkaj merkezli K\'iche\' Krallığı', P('kiche', 'xelaju', 'kicheCoast', 'mamSouth', 'sacapulas'));
zone('kaqchikel-1500', 'kaqchikel', 'Kaqchikel kingdom of Iximche', 'Iximche merkezli Kaqchikel Krallığı', P('kaqchikel'));
zone('xoconochco-1500', 'nahua', 'Xoconochco, Aztec province from 1486', 'Xoconochco, 1486’dan itibaren Aztek eyaleti', P('xoconochco'));
zone('pipil-1500', 'nahua', 'Pipil of Izcuintepeque (Panatacat)', 'Izcuintepeque (Panatacat) Pipilleri', P('pipilIzc'));
zone('cuzcatlan-1500', 'nahua', 'Pipil of Cuzcatlan', 'Cuzcatlan Pipilleri', P('pipilCuz'));
zone('spain-1524', 'spain', 'New Spain, with the K\'iche\' lands taken in 1524', 'Yeni İspanya ve 1524’te alınan K\'iche\' toprakları',
  P('central', 'chiapasCoast', 'xoconochco', 'kiche', 'xelaju', 'kicheCoast', 'mamSouth', 'sacapulas'));
zone('kaqchikel-1524', 'kaqchikel', 'Kaqchikel of Iximche, allied with Alvarado', 'Iximche Kaqchikelleri, Alvarado’nun müttefiki', P('kaqchikel'));
zone('guatemala-1524', 'spain', 'New Spain and Spanish Guatemala, from July 1524', 'Yeni İspanya ve İspanyol Guatemala’sı, Temmuz 1524’ten itibaren',
  P('central', 'chiapasCoast', 'xoconochco', 'kiche', 'xelaju', 'kicheCoast', 'mamSouth', 'sacapulas', 'tzutujil', 'pipilIzc'));
zone('kaqchikel-revolt', 'kaqchikel', 'Kaqchikel in revolt, 1524 – 1530', 'Ayaklanan Kaqchikeller, 1524 – 1530', P('kaqchikel'));

zone('mexico-1860', 'mexico', 'Mexico, with the states of Yucatán and Campeche', 'Meksika, Yucatán ve Campeche eyaletleriyle',
  D(poly([-94.5, 14.4], [-94.5, 22.6], [-86.3, 22.6], [-86.3, 14.4]), cruzob, belizeSide), ['Mexico']);
zone('cruzob-1860', 'cruzob', 'Chan Santa Cruz, the Maya state of the Talking Cross', 'Chan Santa Cruz, Konuşan Haç’ın Maya devleti', cruzob);
zone('britain-1860', 'britain', 'British Honduras', 'İngiliz Hondurası', britain, ['Belize']);

// --- which strategic page shows which zones, in legend order; close battle views and phase pages show none ---
const SET_1500 = ['mani-1500', 'canul-1500', 'pech-1500', 'sotuta-1500', 'cupul-1500', 'chikinchel-1500', 'ecab-1500', 'cochuah-1500', 'chetumal-1500',
  'campeche-1500', 'acalan-1500', 'itza-1500'];
const SET_1517 = ['mani-1500', 'xiu-1517', 'sotuta-1500', 'cupul-1500', 'chikinchel-1500', 'ecab-1517', 'cozumel-1517', 'cochuah-1500', 'chetumal-1500',
  'canpech-1517', 'champoton-1517'];
const SET_1618 = ['yucatan-1618', 'guatemala-1618', 'itza-1500', 'kowoj-1525', 'kejache-1525', 'lakandon-1525', 'manche-1525'];
const PAGES = {
  mirador: ['mirador-300bc'],
  tikal: ['tikal-300', 'uaxactun-300'],
  entrada: ['teotihuacan-378', 'tikal-378', 'el-peru-378'],
  copan: ['tikal-426', 'copan-426', 'quirigua-426'],
  kaanul: ['kaanul-550', 'naranjo-546', 'tikal-426', 'caracol-553', 'el-peru-550', 'la-corona-550'],
  caracol: ['kaanul-550', 'caracol-562', 'naranjo-546', 'tikal-426'],
  'palenque-599': ['kaanul-599', 'palenque-599'],
  pakal: ['palenque-650', 'tonina-650', 'piedras-negras-650'],
  'naranjo-631': ['kaanul-599', 'caracol-562', 'tikal-426', 'naranjo-626'],
  'yuknoom-cheen': ['kaanul-636', 'dos-pilas-648', 'el-peru-650', 'la-corona-650', 'naranjo-650', 'caracol-562', 'cancuen-656', 'tikal-426', 'palenque-650'],
  'dos-pilas': ['kaanul-636', 'dos-pilas-648', 'tikal-426'],
  'lady-six-sky': ['kaanul-636', 'naranjo-682', 'dos-pilas-648', 'tikal-426'],
  'tikal-695': ['tikal-426', 'kaanul-636', 'naranjo-682', 'dos-pilas-648', 'el-peru-650', 'la-corona-650'],
  yaxchilan: ['yaxchilan-700', 'piedras-negras-650'],
  'copan-738': ['copan-738', 'quirigua-738'],
  'tikal-743': ['tikal-426', 'kaanul-636', 'el-peru-743', 'naranjo-744'],
  petexbatun: ['aguateca-761', 'seibal-770', 'cancuen-770'],
  bonampak: ['yaxchilan-700', 'bonampak-790'],
  puuc: ['uxmal-900', 'chichen-900', 'ek-balam-900', 'coba-900'],
  'chichen-itza': ['chichen-1000', 'coba-1000'],
  mayapan: ['mayapan-1300'],
  kiche: ['kiche-1450', 'tzutujil-1450', 'mam-1450', 'poqomam-1450'],
  'fall-of-mayapan': SET_1500,
  iximche: ['kiche-1500', 'kaqchikel-1500', 'tzutujil-1450', 'mam-1450', 'poqomam-1450', 'xoconochco-1500', 'pipil-1500', 'cuzcatlan-1500'],
  'sea-trade': SET_1500,
  shipwreck: [...SET_1517, 'cuba-1511'],
  'cordoba-1517': [...SET_1517, 'potonchan-1517', 'cuba-1511'],
  grijalva: [...SET_1517, 'potonchan-1517', 'cuba-1511'],
  'cozumel-1519': [...SET_1517, 'potonchan-1517', 'cuba-1511'],
  'alvarado-1524': ['new-spain-1524', 'kiche-1500', 'kaqchikel-1500', 'tzutujil-1450', 'mam-1450', 'poqomam-1450', 'pipil-1500', 'cuzcatlan-1500'],
  qumarkaj: ['new-spain-1524', 'kiche-1500', 'kaqchikel-1500', 'tzutujil-1450', 'mam-1450', 'poqomam-1450', 'pipil-1500', 'cuzcatlan-1500'],
  atitlan: ['spain-1524', 'kaqchikel-1524', 'tzutujil-1450', 'mam-1450', 'poqomam-1450', 'pipil-1500', 'cuzcatlan-1500'],
  'iximche-revolt': ['guatemala-1524', 'kaqchikel-revolt', 'mam-1450', 'poqomam-1450', 'cuzcatlan-1500'],
  'montejo-1527': SET_1517,
  'montejo-1531': ['spain-1531', 'mani-1500', 'xiu-1517', 'sotuta-1500', 'cupul-1500', 'chikinchel-1500', 'ecab-1517', 'cozumel-1517', 'cochuah-1500',
    'chetumal-1500', 'acalan-1500'],
  tho: ['spain-1542', 'mani-1542', 'pech-1500', 'sotuta-1500', 'cupul-1500', 'chikinchel-1500', 'ecab-1517', 'cozumel-1517', 'cochuah-1500', 'chetumal-1500'],
  'revolt-1546': ['spain-1546', 'ecab-1546', 'mani-1542', 'sotuta-1546', 'revolt-1546'],
  landa: ['spain-1562', 'mani-1562'],
  'itza-kingdom': ['new-spain-1524', 'acalan-1500', 'kejache-1525', 'itza-1500', 'kowoj-1525', 'lakandon-1525', 'manche-1525'],
  missions: SET_1618,
  'ursua-road': SET_1618,
  'after-nojpeten': ['yucatan-1618', 'guatemala-1618', 'peten-1697', 'itza-1697', 'kowoj-1525'],
  'caste-war': ['mexico-1860', 'cruzob-1860', 'britain-1860'],
};

// --- checks: zones on one page never overlap; a gap under 3 km between Classic kingdoms reads as a shared border ---
const km2 = g => g ? turf.area(g) / 1e6 : 0;
for (const [page, ids] of Object.entries(PAGES)) for (const [i, a] of ids.entries()) {
  if (!Z[a]) throw new Error(`${page}: unknown zone ${a}`);
  for (const b of ids.slice(i + 1)) {
    const o = km2(I(Z[a].geometry, Z[b].geometry));
    if (o > 0.01) throw new Error(`${page}: ${a} and ${b} overlap by ${o.toFixed(2)} km2`);
    if (Object.values(K).includes(Z[a].geometry) && turf.booleanIntersects(turf.buffer(Z[a].geometry, 3, { units: 'kilometers' }), Z[b].geometry))
      console.log(`  ${page}: ${a} and ${b} lie under 3 km apart`);
  }
}

// --- shared borders carry the same points, every 0.1 degrees, so the build's rounding keeps them together ---
const rings = g => g.geometry.coordinates;
function nodeZones(list) {
  const all = list.map(g => ({ g, bbox: turf.bbox(g), points: rings(g).flat() }));
  for (const t of all) {
    const [w, s, e, n] = t.bbox;
    const cand = all.filter(o => o !== t && o.bbox[0] <= e && o.bbox[2] >= w && o.bbox[1] <= n && o.bbox[3] >= s).flatMap(o => o.points);
    for (const ring of rings(t.g)) for (let i = ring.length - 2; i >= 0; i--) {
      const a = ring[i], b = ring[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy;
      if (!len2) continue;
      const inside = [];
      for (const q of cand) {
        if (q[0] < Math.min(a[0], b[0]) - 1e-9 || q[0] > Math.max(a[0], b[0]) + 1e-9 || q[1] < Math.min(a[1], b[1]) - 1e-9 || q[1] > Math.max(a[1], b[1]) + 1e-9) continue;
        const u = ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / len2;
        if (u <= 1e-9 || u >= 1 - 1e-9) continue;
        if (Math.abs((q[0] - a[0]) * dy - (q[1] - a[1]) * dx) / Math.sqrt(len2) < 1e-9) inside.push([u, q]);
      }
      if (!inside.length) continue;
      inside.sort((x, y) => x[0] - y[0]);
      const seen = new Set();
      ring.splice(i + 1, 0, ...inside.map(([, q]) => q).filter(q => !seen.has(q.join()) && seen.add(q.join())));
    }
  }
}
// both sides of a shared edge are split from the same end, so they get the same points
const densify = (ring, step = 0.1) => ring.flatMap((p, i) => {
  if (i === ring.length - 1) return [p];
  const q = ring[i + 1], n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step);
  if (n <= 1) return [p];
  const [a, b, rev] = p[0] < q[0] || (p[0] === q[0] && p[1] < q[1]) ? [p, q, false] : [q, p, true];
  const mid = [...Array(n - 1)].map((_, k) => [a[0] + (b[0] - a[0]) * (k + 1) / n, a[1] + (b[1] - a[1]) * (k + 1) / n]);
  return [p, ...(rev ? mid.reverse() : mid)];
});
const used = [...new Set(Object.values(PAGES).flat())];
for (const id of Object.keys(Z)) if (!used.includes(id)) throw new Error(`zone ${id} is on no page`);
const shapes = used.map(id => Z[id].geometry);
nodeZones(shapes);
for (const g of shapes) g.geometry.coordinates = rings(g).map(r => densify(r));

// --- write the zones, the page map and the Turkish names ---
const r9 = x => Math.round(x * 1e9) / 1e9;
const dir = path.join(story, 'shared', 'zones');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (const id of used) {
  const z = Z[id], properties = { id, family: z.family, name: z.en, ...(z.clip ? { clip: z.clip } : {}) };
  const coordinates = rings(z.geometry).map(r => r.map(p => p.map(r9)));
  fs.writeFileSync(path.join(dir, id + '.geojson'), JSON.stringify({ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates } }) + '\n');
}
fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per strategic page, written by .plans/zones.mjs. Close battle views and phase pages show none.\n'
  + Object.entries(PAGES).map(([p, ids]) => `${p}: [${ids.join(', ')}]`).join('\n') + '\n');
fs.mkdirSync(path.join(story, '.i18n-parts'), { recursive: true });
fs.writeFileSync(path.join(story, '.i18n-parts', 'zones.tr.yaml'), used.map(id => `zones.${id}.name: ${JSON.stringify(Z[id].tr)}`).join('\n') + '\n');
console.log(`${used.length} zones, ${Object.keys(PAGES).length} pages`);
