// The political map: one set of zones per period, written to shared/zones/, with the page map in .plans/zones.yaml
// and the Turkish names in .i18n-parts/zones.tr.yaml. Run from the story folder: node .plans/zones.mjs
// Land comes from the Natural Earth countries, simplified once on the shared arcs so neighbours keep one border,
// and cut by hand drawn lines where a border of the time differs from today's. Each period lists its states in
// order and the first state to claim a piece of land keeps it, so a later state is drawn rough over its neighbours.
// Every zone then grows into the sea and joins its islands with corridors, so the build clips the coast.
// Env: ONLY=<period ids> settles some periods, DEBUG=1 prints areas and corridors, GAPS=<km2> lists unclaimed land.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import os from 'os';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as turf from '@turf/turf';
import * as tc from 'topojson-client';

const require = createRequire(import.meta.url);
const T0 = Date.now();
const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- countries: decode the arcs, simplify each shared arc once, cut to the map ---
const BOX = [-16, 22, 47, 65.5];   // the extent of story.yaml plus the margin the build keeps
const TOL = 0.015;   // about 1.5 km; the build's corner rounding multiplies every point sixteenfold
const dp = (pts, tol) => {
  if (pts.length < 3) return pts;
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
  return pts.filter((_, i) => keep[i]);
};
const world = JSON.parse(fs.readFileSync(require.resolve('world-atlas/countries-10m.json')));
{
  const { scale: [sx, sy], translate: [tx, ty] } = world.transform;
  world.arcs = world.arcs.map(arc => { let x = 0, y = 0; return dp(arc.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }), TOL); });
  delete world.transform;
}
const COUNTRY = {}, NAMES = new Set();
for (const f of tc.feature(world, world.objects.countries).features) {
  NAMES.add(f.properties.name);
  const b = turf.bbox(f);
  if (b[0] > BOX[2] || b[2] < BOX[0] || b[1] > BOX[3] || b[3] < BOX[1]) continue;
  const g = turf.intersect(turf.featureCollection([f, turf.bboxPolygon(BOX)]))?.geometry;
  const polys = !g ? [] : (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).filter(p => turf.area(turf.polygon(p)) > 1e5);
  if (polys.length) COUNTRY[f.properties.name] = polys.length === 1 ? turf.polygon(polys[0]) : turf.multiPolygon(polys);
}

// --- geometry helpers; every one takes and returns Features and passes null through ---
const fc = parts => turf.featureCollection(parts.flat().filter(Boolean));
// polygon clipping now and then trips over nearly coincident edges; snapping the inputs to a fine grid gets it through
const safe = (f, parts) => {
  for (const precision of [null, 7, 6, 5]) {
    try { return f(fc(precision ? parts.map(q => turf.truncate(q, { precision })) : parts)); } catch (e) { if (precision === 5) throw e; }
  }
};
const U = (...parts) => { const p = parts.flat().filter(Boolean); return p.length === 0 ? null : p.length === 1 ? p[0] : safe(turf.union, p); };
const I = (a, b) => a && b ? safe(turf.intersect, [a, b]) : null;
const D = (a, ...bs) => { bs = bs.flat().filter(Boolean); return a && bs.length ? safe(turf.difference, [a, ...bs]) : a; };
// a country too small to survive the simplification, such as the Vatican, is left out
const C = (...names) => U(names.map(n => NAMES.has(n) ? COUNTRY[n] : (() => { throw new Error(`no country ${n}`); })()));
const densify = (pts, step = 0.25) => pts.flatMap((p, i) => {
  if (i === pts.length - 1) return [p];
  const q = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step));
  return [...Array(n)].map((_, k) => [p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]);
});
// a hand drawn polygon; lines inside it are spread out so a drawn border survives the build's corner rounding
const poly = (...pts) => {
  pts = pts.filter((q, i) => i === 0 || q[0] !== pts[i - 1][0] || q[1] !== pts[i - 1][1]);
  if (pts.at(-1)[0] === pts[0][0] && pts.at(-1)[1] === pts[0][1]) pts.pop();
  return turf.polygon([densify([...pts, pts[0]])]);
};
// a corridor through open sea that joins islands to their state
const sea = (pts, km = 4) => turf.buffer(turf.lineString(pts), km, { units: 'kilometers' });
const rev = line => line.slice().reverse();
const km2 = f => f ? turf.area(f) / 1e6 : 0;
const pieces = g => !g ? [] : g.geometry.type === 'Polygon' ? [g] : g.geometry.coordinates.map(c => turf.polygon(c));
const meets = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
// land and sea cut into tiles of two degrees, so an operation near a shape only handles the pieces around it;
// the land is every country on the map, so a zone grows only into open sea
const LAND = [], SEA = [];
for (let x = BOX[0]; x < BOX[2]; x += 2) for (let y = BOX[1]; y < BOX[3]; y += 2) {
  const t = turf.bboxPolygon([x, y, x + 2, y + 2]);
  const near = c => {
    const g = turf.bboxClip(c, [x - 0.01, y - 0.01, x + 2.01, y + 2.01]).geometry;
    const polys = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map(q => q.filter(r => r.length >= 4)).filter(q => q.length);
    return polys.length ? turf.multiPolygon(polys) : null;
  };
  const land = Object.values(COUNTRY).filter(c => meets(c.bbox ??= turf.bbox(c), t.bbox)).flatMap(c => pieces(I(near(c), t)));
  LAND.push(...land);
  SEA.push(...pieces(land.length ? turf.difference(fc([t, ...land])) : t));
}
const BOXPOLY = turf.bboxPolygon(BOX);
if (process.env.DEBUG) console.log(`setup ${((Date.now() - T0) / 1000).toFixed(1)} s`);
const at = g => turf.centroid(g).geometry.coordinates.map(c => c.toFixed(2)).join(', ');

// --- France and its neighbours to the north and east ---
const SAVOY = I(C('France'), poly([5.97, 46.13], [5.95, 46.05], [5.83, 45.95], [5.79, 45.85], [5.73, 45.72], [5.64, 45.62], [5.70, 45.52], [5.75, 45.44],
  [5.88, 45.42], [5.98, 45.47], [6.08, 45.40], [6.15, 45.28], [6.20, 45.17], [6.35, 45.10], [6.42, 45.06], [6.58, 45.10], [7.3, 45.1], [7.3, 46.6], [6.8, 46.6],
  [6.2, 46.42], [6.17, 46.3], [6.15, 46.17]));
// Chambéry and Annecy, which France kept in 1814
const SAVOY_WEST = I(SAVOY, poly([5.6, 46.13], [6.12, 46.16], [6.25, 46.08], [6.38, 45.95], [6.45, 45.75], [6.35, 45.6], [6.22, 45.45], [6.12, 45.35], [5.6, 45.35]));
const NICE = I(C('France'), poly([6.92, 44.36], [6.78, 44.28], [6.72, 44.2], [6.75, 44.05], [6.84, 43.96], [6.95, 43.9], [7.1, 43.86], [7.18, 43.8], [7.2, 43.66],
  [7.2, 43.3], [7.8, 43.3], [7.8, 44.5], [7.0, 44.5]));
// Philippeville and Mariembourg with Couvin, kept by France in 1814
const PHILIPPEVILLE_BOX = poly([4.35, 49.9], [4.35, 50.22], [4.62, 50.22], [4.62, 49.9]);
const PHILIPPEVILLE = I(C('Belgium'), PHILIPPEVILLE_BOX);
const SAARLOUIS = I(C('Germany'), poly([6.55, 49.22], [6.55, 49.42], [6.85, 49.42], [6.85, 49.22]));
// the Saar and the strip to the Queich with Landau, French by the peace of 1814
const SAAR_1814 = I(C('Germany'), poly([6.4, 49.0], [6.4, 49.45], [6.9, 49.45], [7.15, 49.3], [7.6, 49.22], [8.4, 49.25], [8.4, 48.9]));
// the northern Jura of the Bishopric of Basel, French from 1793, and its southern valleys with Biel, French from 1797
const JURA_N = I(C('Switzerland'), poly([6.8, 47.55], [6.85, 47.17], [7.0, 47.18], [7.15, 47.27], [7.3, 47.32], [7.45, 47.33], [7.55, 47.4], [7.6, 47.55]));
const JURA = I(C('Switzerland'), poly([6.8, 47.55], [6.85, 47.17], [6.93, 47.12], [7.05, 47.06], [7.2, 47.1], [7.3, 47.15], [7.45, 47.25], [7.55, 47.38], [7.6, 47.55]));
const GENEVA = I(C('Switzerland'), poly([5.9, 46.1], [5.9, 46.35], [6.12, 46.37], [6.18, 46.3], [6.3, 46.28], [6.32, 46.15], [6.15, 46.1]));
const VALAIS = I(C('Switzerland'), poly([6.86, 46.42], [6.95, 46.3], [7.02, 46.22], [7.1, 46.27], [7.2, 46.33], [7.36, 46.37], [7.53, 46.41], [7.69, 46.43],
  [7.95, 46.49], [8.13, 46.55], [8.33, 46.57], [8.42, 46.58], [8.43, 46.48], [8.45, 46.4], [8.45, 45.8], [6.7, 45.8], [6.7, 46.42]));
const SWISS = C('Switzerland', 'Liechtenstein');
const ZEELAND_FLANDERS = I(C('Netherlands'), poly([3.3, 51.39], [3.55, 51.42], [3.75, 51.38], [3.95, 51.4], [4.1, 51.38], [4.25, 51.37], [4.32, 51.33], [4.32, 51.15], [3.3, 51.15]));
// Maastricht, Venlo and Roermond, French from 1795
const DUTCH_MEUSE = I(C('Netherlands'), poly([5.6, 51.2], [5.8, 51.33], [5.95, 51.45], [6.3, 51.45], [6.3, 50.6], [5.6, 50.6]));
const EAST_FRISIA = I(C('Germany'), poly([6.6, 53.1], [6.9, 53.1], [7.3, 53.1], [7.6, 53.15], [7.75, 53.3], [7.8, 53.8], [6.6, 53.8]));
const JEVER = I(C('Germany'), poly([7.8, 53.45], [8.12, 53.45], [8.12, 53.85], [7.8, 53.85]));
// the Prince-Bishopric of Liège, cutting the Austrian Netherlands in two
const LIEGE = I(C('Belgium', 'Netherlands'), poly([5.05, 51.25], [5.45, 51.28], [5.85, 51.2], [5.85, 51.0], [5.7, 50.85], [5.8, 50.7], [6.0, 50.55], [5.95, 50.4],
  [5.6, 50.38], [5.3, 50.3], [5.05, 50.3], [4.95, 50.2], [4.9, 50.12], [4.6, 49.98], [4.4, 49.98], [4.3, 50.15], [4.25, 50.35], [4.6, 50.36], [4.82, 50.36], [5.0, 50.42],
  [5.05, 50.6], [4.95, 50.8], [5.0, 51.0]));
// the Austrian Netherlands east and south of Liège: the duchies of Luxembourg and Limburg
const LUXEMBOURG_DUCHY = I(C('Belgium'), poly([4.6, 49.98], [4.9, 50.12], [4.95, 50.2], [5.05, 50.3], [5.3, 50.3], [5.6, 50.38], [5.95, 50.4], [6.0, 50.55], [5.8, 50.7], [5.75, 50.8],
  [6.4, 50.8], [6.5, 49.3], [4.5, 49.3]));
// the German lands of the Duchy of Luxembourg, around Bitburg
const EIFEL_LUX = I(C('Germany'), poly([6.05, 50.25], [6.42, 50.2], [6.62, 50.02], [6.55, 49.85], [6.38, 49.7], [6.05, 49.7]));
const EUPEN_MALMEDY = I(C('Belgium'), poly([5.95, 50.78], [6.4, 50.78], [6.4, 50.15], [6.05, 50.22], [5.92, 50.42]));
// the Rhine from Lauterbourg to the Dutch border
const RHINE = [[8.23, 48.95], [8.30, 49.05], [8.37, 49.17], [8.40, 49.25], [8.45, 49.32], [8.46, 49.40], [8.46, 49.49], [8.42, 49.56], [8.37, 49.63],
  [8.42, 49.70], [8.47, 49.76], [8.40, 49.84], [8.35, 49.90], [8.33, 49.97], [8.28, 50.01], [8.18, 50.03], [8.05, 50.0], [7.9, 49.97], [7.80, 50.03],
  [7.73, 50.12], [7.65, 50.20], [7.60, 50.27], [7.60, 50.36], [7.50, 50.42], [7.40, 50.45], [7.30, 50.53], [7.22, 50.60], [7.15, 50.68], [7.10, 50.74],
  [7.03, 50.83], [6.97, 50.93], [6.98, 51.02], [6.90, 51.10], [6.78, 51.20], [6.73, 51.30], [6.70, 51.38], [6.74, 51.45], [6.70, 51.52], [6.62, 51.60],
  [6.60, 51.66], [6.48, 51.73], [6.35, 51.80], [6.22, 51.85], [6.12, 51.88]];
const LEFT_BANK = I(C('Germany'), poly(...RHINE, [5.5, 51.95], [5.5, 48.9]));
// the border of 1811 from the Rhine below Wesel to the Baltic at Lübeck; France held the North Sea coast beyond it
const NW_LINE = [[6.6, 51.66], [6.9, 51.72], [7.2, 51.78], [7.45, 51.82], [7.75, 51.85], [8.0, 51.95], [8.25, 52.08], [8.45, 52.15], [8.7, 52.27], [8.92, 52.29],
  [9.2, 52.45], [9.5, 52.62], [9.8, 52.85], [10.1, 53.05], [10.4, 53.2], [10.56, 53.37], [10.65, 53.6], [10.75, 53.85], [10.9, 54.05]];

// Holstein and Schleswig, Danish; the line runs north of Hamburg and Lauenburg to Lübeck
const HOLSTEIN_LINE = [[8.6, 53.88], [9.15, 53.88], [9.5, 53.7], [9.8, 53.56], [9.95, 53.62], [10.1, 53.63], [10.2, 53.52], [10.35, 53.6], [10.5, 53.72],
  [10.62, 53.82], [10.7, 53.88], [10.88, 53.96], [11.3, 54.3]];
const HOLSTEIN = I(C('Germany'), poly(...HOLSTEIN_LINE, [11.3, 55.2], [8.0, 55.2], [8.0, 53.88]));
const NW_GERMANY = D(I(C('Germany'), poly(...NW_LINE, [10.9, 55.0], [6.0, 55.0], [6.0, 51.66])), HOLSTEIN);

// --- Switzerland and Italy's northern edge ---
const VALTELLINA = I(C('Italy'), poly([9.0, 46.62], [9.25, 46.25], [9.38, 46.14], [9.6, 46.05], [9.9, 46.03], [10.15, 46.1], [10.15, 46.15], [10.58, 46.26], [10.5, 46.34],
  [10.45, 46.53], [10.4, 46.65], [9.0, 46.65]));

// --- Iberia ---
const OLIVENZA = I(C('Spain'), poly([-7.27, 38.85], [-7.0, 38.85], [-6.95, 38.6], [-7.15, 38.45], [-7.32, 38.5]));
const BALEARICS = I(C('Spain'), poly([1.0, 38.5], [4.6, 38.5], [4.6, 40.3], [1.0, 40.3]));
const MENORCA = I(C('Spain'), poly([3.75, 39.75], [4.45, 39.75], [4.45, 40.15], [3.75, 40.15]));
const CATALONIA = I(C('Spain'), poly([0.65, 42.9], [0.75, 42.55], [0.7, 42.2], [0.6, 41.95], [0.42, 41.6], [0.35, 41.3], [0.25, 41.05], [0.3, 40.75], [0.52, 40.52],
  [1.5, 40.3], [3.5, 41.5], [3.5, 42.9]));
const BALEARIC_SEA = [sea([[0.15, 38.75], [1.25, 38.95]]), sea([[1.55, 39.05], [2.4, 39.45]]), sea([[3.45, 39.9], [3.85, 39.95]])];

// --- Britain ---
const BRITISH_ISLES = C('United Kingdom', 'Ireland', 'Isle of Man', 'Jersey', 'Guernsey');
const BRITISH_SEA = [sea([[-2.1, 49.25], [-2.5, 49.45], [-2.45, 50.6]]), sea([[-2.95, 59.1], [-1.6, 59.75]]), sea([[-5.7, 54.0], [-4.6, 54.15]])];

// --- North Africa ---
const MOROCCO = C('Morocco');
const BARBARY = C('Algeria', 'Tunisia', 'Libya');

// --- Italy: borders of 1792, then the lines that redrew them ---
const IT = C('Italy', 'San Marino', 'Vatican');
// Lake Maggiore and the Ticino, Piedmont to the west, Milan to the east, down to the Po
const TICINO = [[8.68, 46.1], [8.62, 45.98], [8.56, 45.9], [8.58, 45.8], [8.62, 45.72], [8.7, 45.58], [8.78, 45.45], [8.88, 45.35], [9.05, 45.24], [9.16, 45.18], [9.27, 45.13]];
// the Sesia, the border of the Cisalpine and Italian republics with Piedmont from 1800
const SESIA = [[7.86, 45.93], [7.95, 45.88], [8.08, 45.86], [8.2, 45.82], [8.27, 45.77], [8.3, 45.68], [8.37, 45.6], [8.4, 45.5], [8.42, 45.38], [8.45, 45.27], [8.5, 45.18], [8.55, 45.1]];
// the Po from the Ticino to the Enza, Lombardy to the north, Piacenza and Parma to the south
const PO_W = [[9.27, 45.13], [9.35, 45.1], [9.45, 45.1], [9.69, 45.06], [9.85, 45.1], [10.02, 45.12], [10.2, 45.0], [10.42, 44.98], [10.5, 44.95]];
const PO_E = [[11.3, 44.98], [11.45, 44.95], [11.6, 44.93], [11.85, 44.95], [12.05, 44.95], [12.3, 44.95], [12.6, 44.95]];
// Venice and Milan: the Adda below Lecco, across to the Oglio, the Oglio, then north of Mantua to the Po at Sermide
const VL = [[9.4, 45.86], [9.45, 45.74], [9.5, 45.62], [9.52, 45.53], [9.62, 45.5], [9.75, 45.47], [9.95, 45.48], [10.02, 45.35], [10.1, 45.26], [10.25, 45.2],
  [10.4, 45.13], [10.5, 45.25], [10.6, 45.33], [10.68, 45.35], [10.75, 45.3], [10.9, 45.22], [11.05, 45.15], [11.2, 45.08], [11.3, 44.98]];
// Mantua's lands south of the Po, against Modena; then Modena against Bologna and Ferrara along the Panaro to the Tuscan crest
const MANTUA_S = [[10.5, 44.95], [10.65, 44.9], [10.8, 44.88], [11.0, 44.88], [11.2, 44.92]];
const MODENA_E = [[11.2, 44.92], [11.3, 44.82], [11.2, 44.7], [11.05, 44.55], [11.05, 44.35], [11.0, 44.15]];
// Tuscany against the Papal States, from the coast at Chiarone to the crest above Bologna
const TP = [[11.45, 42.37], [11.62, 42.55], [11.8, 42.72], [11.78, 42.88], [11.93, 43.0], [12.0, 43.12], [11.97, 43.25], [12.1, 43.38], [12.15, 43.55], [12.18, 43.68],
  [12.05, 43.82], [11.85, 43.97], [11.65, 44.1], [11.45, 44.15], [11.2, 44.18], [11.0, 44.15]];
// the Papal States against Naples, from Terracina to the Tronto
const PN = [[13.25, 41.25], [13.36, 41.42], [13.52, 41.55], [13.55, 41.7], [13.42, 41.82], [13.3, 41.95], [13.18, 42.05], [13.05, 42.15], [12.95, 42.3], [13.05, 42.48],
  [13.2, 42.62], [13.38, 42.75], [13.6, 42.83], [13.92, 42.89]];
const STRAIT = [[15.70, 38.32], [15.685, 38.27], [15.60, 38.20], [15.58, 38.10]];
// Campo Formio: from the Tyrol down Lake Garda to Lazise, to Verona and along the Adige to the sea
const ADIGE = [[10.85, 45.9], [10.7, 45.68], [10.73, 45.5], [10.98, 45.44], [11.13, 45.37], [11.27, 45.32], [11.31, 45.19], [11.5, 45.1], [11.78, 45.1], [12.08, 45.14],
  [12.33, 45.16], [12.6, 45.16]];
// the Isonzo, the border of the Kingdom of Italy with Austria from 1807
const ISONZO = [[13.55, 46.45], [13.6, 46.25], [13.65, 46.1], [13.62, 45.94], [13.5, 45.88], [13.53, 45.73], [13.45, 45.6]];
// the Venetian mainland against the Tyrol, the Grisons, Austrian Gorizia and the sea
const VENETIA_N = [[13.25, 45.7], [13.25, 45.85], [13.4, 46.0], [13.5, 46.1], [13.6, 46.2], [13.5, 46.35], [13.45, 46.5], [13.3, 46.55], [12.9, 46.65], [12.4, 46.7],
  [12.25, 46.45], [12.0, 46.45], [11.85, 46.3], [11.7, 46.05], [11.6, 45.95], [11.35, 45.9], [11.15, 45.8], [11.0, 45.75], [10.9, 45.7], [10.85, 45.85], [10.65, 45.82],
  [10.5, 45.85], [10.5, 46.0], [10.58, 46.26], [10.15, 46.15], [9.9, 46.05], [9.6, 46.05], [9.4, 46.05], [9.38, 45.95], [9.4, 45.86]];

const LIGURIA = I(IT, poly([7.5, 43.6], [7.53, 43.8], [7.6, 44.0], [7.8, 44.1], [8.0, 44.2], [8.25, 44.4], [8.5, 44.55], [8.6, 44.65], [8.8, 44.78], [9.0, 44.7], [9.2, 44.6],
  [9.3, 44.6], [9.45, 44.47], [9.7, 44.4], [9.75, 44.35], [9.85, 44.25], [10.02, 44.1], [10.02, 43.9], [9.0, 43.6]));
const LOMBARDY = I(IT, poly(...TICINO, ...PO_W, ...MANTUA_S, [11.3, 44.98], ...rev(VL), [9.38, 45.95], [9.4, 46.05], [9.6, 46.05], [9.38, 46.14], [9.25, 46.25], [9.0, 46.62],
  [8.7, 46.6]));
const PARMA = I(IT, poly(...PO_W.slice(1), [10.45, 44.75], [10.4, 44.55], [10.25, 44.4], [10.05, 44.38], [9.85, 44.45], [9.7, 44.4], [9.45, 44.47],
  [9.3, 44.6], [9.35, 44.75]));
// Modena and Reggio with Massa and Carrara; the Lunigiana goes with them here, though Pontremoli was Tuscan
const MODENA = I(IT, poly(...MANTUA_S, ...MODENA_E.slice(1), [10.9, 44.18], [10.67, 44.14], [10.55, 44.15], [10.45, 44.07], [10.32, 44.0], [10.22, 43.97], [10.1, 43.95],
  [9.98, 44.04], [10.02, 44.1], [9.85, 44.25], [9.75, 44.35], [9.7, 44.4], [9.85, 44.45], [10.05, 44.38], [10.25, 44.4], [10.4, 44.55], [10.45, 44.75]));
const LUCCA = I(IT, poly([10.15, 43.93], [10.23, 43.93], [10.3, 43.95], [10.4, 44.02], [10.5, 44.12], [10.58, 44.1], [10.65, 43.95], [10.65, 43.82], [10.55, 43.75],
  [10.4, 43.76], [10.28, 43.8], [10.18, 43.83]));
const TUSCANY = I(IT, poly([9.95, 43.9], [10.1, 43.95], [10.22, 43.97], [10.32, 44.0], [10.45, 44.07], [10.55, 44.15], [10.67, 44.14], [10.9, 44.18], ...rev(TP),
  [11.3, 42.2], [9.8, 42.6]));
const PAPAL = I(IT, poly(...TP, ...MODENA_E.slice(0, -1).reverse(), ...PO_E, [13.5, 44.0], [14.2, 42.95], ...rev(PN), [12.8, 41.0], [11.3, 42.2]));
// Bologna, Ferrara and the Romagna, the Legations ceded at Tolentino in 1797
const LEGATIONS = I(PAPAL, poly(...TP.slice(-6), [11.05, 44.35], [11.05, 44.55], [11.2, 44.7], [11.3, 44.82], [11.2, 44.92], ...PO_E, [13.2, 44.2], [12.74, 43.97],
  [12.5, 43.95], [12.3, 43.9], [12.05, 43.82]));
// the Marche, joined to the Kingdom of Italy in 1808; Rome and Umbria went to France in 1809
const MARCHE = I(PAPAL, poly([12.05, 43.82], [12.3, 43.9], [12.5, 43.95], [12.74, 43.97], [13.5, 43.8], [14.2, 42.95], [13.92, 42.89], [13.6, 42.83], [13.38, 42.75],
  [13.2, 42.75], [13.05, 42.85], [12.9, 43.05], [12.75, 43.3], [12.55, 43.5], [12.3, 43.62], [12.18, 43.68]));
const ROME = D(PAPAL, LEGATIONS, MARCHE);
const NAPLES = I(IT, poly(...PN, [14.5, 42.9], [19.2, 40.4], [19.0, 39.4], [16.6, 37.7], [15.62, 37.88], ...rev(STRAIT), [15.55, 38.45], [15.5, 38.8], [15.3, 39.5],
  [14.5, 40.2], [13.7, 40.55], [13.0, 40.75], [12.8, 41.0]));
const SICILY = I(IT, poly([11.7, 36.6], [11.8, 38.05], [12.3, 38.35], [13.0, 38.85], [14.2, 38.9], [15.0, 39.0], [15.35, 38.9], [15.48, 38.5], ...STRAIT, [15.62, 37.88],
  [15.5, 36.5], [14.9, 36.45], [14.2, 36.65], [12.2, 36.6]));
const SARDINIA = I(IT, poly([7.9, 38.7], [9.95, 38.7], [9.95, 41.2], [9.75, 41.3], [9.2, 41.3], [8.0, 41.1]));
const CORSICA = I(C('France'), poly([8.4, 41.3], [9.7, 41.3], [9.7, 43.1], [8.4, 43.1]));
const ELBA = I(IT, poly([10.0, 42.68], [10.5, 42.68], [10.5, 42.92], [10.0, 42.92]));
const MALTA = C('Malta');
// Piedmont drawn rough: it comes after Liguria, Lombardy and Parma in every period
const PIEDMONT = I(IT, poly([6.5, 46.6], [8.7, 46.6], ...TICINO, [9.35, 45.1], [9.4, 44.75], [9.3, 44.55], [8.0, 43.6], [6.5, 43.6]));
const PIEDMONT_W = I(PIEDMONT, poly([6.5, 46.6], [7.86, 46.6], ...SESIA, ...PO_W.slice(0, 3), [9.4, 44.75], [9.3, 44.55], [8.0, 43.6], [6.5, 43.6]));
const NOVARA = D(PIEDMONT, PIEDMONT_W);
const VENETIA = I(IT, poly(...VL, ...PO_E.slice(1), [13.3, 45.6], ...VENETIA_N));
// Venetia west and south of the Campo Formio line, joined to the Cisalpine Republic in 1797
const VENETIA_W = I(VENETIA, poly([9.0, 46.6], [10.8, 46.6], ...ADIGE, [12.6, 44.5], [9.0, 44.5]));
const VENETIA_E = D(VENETIA, VENETIA_W);
const TRENTINO = I(IT, poly([10.45, 46.53], [10.2, 46.65], [10.2, 47.1], [12.5, 47.1], [12.5, 46.72], ...VENETIA_N.slice(9, 24), [10.5, 46.34]));
const GORIZIA = I(IT, poly(...ISONZO, [14.0, 45.5], [14.0, 46.6], [13.4, 46.6]));
const CISALPINE = U(LOMBARDY, VALTELLINA, MODENA, LEGATIONS, VENETIA_W);

// --- the eastern Adriatic: Venetian Istria and Dalmatia, Ragusa, the Bay of Kotor, the Ionian Islands ---
const ISTRIA = I(C('Slovenia', 'Croatia'), poly([13.5, 45.55], [13.75, 45.58], [13.85, 45.55], [13.95, 45.45], [14.05, 45.3], [14.2, 45.25], [14.15, 45.1], [14.1, 44.9],
  [13.9, 44.7], [13.4, 44.9]));
const RAGUSA = I(C('Croatia'), poly([16.6, 42.85], [17.25, 42.87], [17.22, 42.97], [17.0, 43.0], [17.0, 43.05], [17.4, 43.05], [17.6, 42.97], [17.67, 42.88], [17.85, 42.82],
  [18.1, 42.72], [18.35, 42.6], [18.52, 42.45], [18.5, 42.3], [17.3, 42.5], [16.6, 42.6]));
const DALMATIA = D(I(C('Croatia'), poly([14.0, 44.9], [14.15, 45.12], [14.45, 45.25], [14.62, 45.22], [14.75, 45.1], [14.85, 44.97], [14.86, 44.72], [15.04, 44.55],
  [15.18, 44.42], [15.35, 44.28], [15.5, 44.2], [15.65, 44.18], [15.95, 44.2], [16.15, 44.2], [16.5, 43.9], [17.5, 43.4], [17.75, 43.05], [17.5, 42.8], [16.0, 42.4],
  [14.3, 43.9], [13.9, 44.6])), ISTRIA, RAGUSA);
const KOTOR = I(C('Montenegro'), poly([18.45, 42.35], [18.5, 42.6], [18.65, 42.55], [18.75, 42.48], [18.85, 42.38], [18.95, 42.27], [18.9, 42.15], [18.5, 42.25]));
const IONIAN = I(C('Greece'), U(
  poly([19.5, 39.95], [19.92, 39.85], [20.0, 39.68], [20.05, 39.5], [20.15, 39.3], [20.3, 39.1], [20.1, 39.05], [19.5, 39.3]),
  poly([20.5, 38.92], [20.7, 38.87], [20.72, 38.78], [20.72, 38.62], [20.85, 38.45], [20.9, 38.2], [21.05, 37.95], [21.05, 37.6], [20.5, 37.5], [20.2, 38.3]),
  poly([22.85, 36.15], [22.85, 36.38], [23.15, 36.36], [23.15, 36.1])));
const IONIAN_N = I(IONIAN, poly([19.4, 39.0], [19.4, 40.0], [20.4, 40.0], [20.4, 39.0]));   // Corfu and Paxos, French to 1814
const IONIAN_SEA = [sea([[20.17, 39.2], [20.45, 38.9], [20.66, 38.75]]), sea([[20.85, 37.68], [21.5, 36.65], [22.4, 36.25], [22.97, 36.25]])];
// sea corridors: Venetia to Istria, Dalmatia to Kotor past Ragusa, Kotor down the Albanian coast to Corfu
const SEA_TRIESTE = sea([[13.3, 45.68], [13.55, 45.52]]);
const SEA_KORCULA = sea([[16.75, 43.14], [16.8, 42.94]]);   // Hvar to Korčula, past Ragusa's waters
const SEA_KOTOR = sea([[16.68, 42.93], [16.6, 42.8], [16.7, 42.62], [17.8, 42.4], [18.56, 42.42]]);
const SEA_CORFU = sea([[18.56, 42.4], [18.9, 41.9], [19.25, 41.3], [19.1, 40.6], [19.2, 40.2], [19.75, 39.82]]);
const SEA_SARDINIA = sea([[9.75, 41.2], [9.75, 42.9], [9.6, 43.2], [7.3, 43.68]]);
const SEA_SARDINIA_GENOA = sea([[9.75, 41.2], [9.75, 42.9], [9.6, 43.2], [8.95, 44.38]]);
const SEA_CORSICA = sea([[8.72, 42.57], [6.7, 43.15]]);
const SEA_ELBA = sea([[9.5, 42.8], [10.12, 42.78]]);
const SEA_LUCCA = sea([[9.85, 44.0], [10.0, 43.75], [10.27, 43.5]]);   // Liguria past Massa and Lucca to Livorno

// --- Prussia ---
// the border with Poland after the first partition, from Upper Silesia round Greater Poland, the Netze district,
// West and East Prussia to the Baltic at Memel
const PR_1772 = [[19.2, 50.04], [19.15, 50.2], [19.1, 50.35], [18.95, 50.5], [18.8, 50.65], [18.6, 50.8], [18.35, 50.95], [18.1, 51.15], [17.85, 51.25], [17.6, 51.4],
  [17.25, 51.55], [16.9, 51.68], [16.5, 51.75], [16.2, 51.8], [15.95, 51.9], [15.75, 52.05], [15.6, 52.3], [15.75, 52.6], [15.9, 52.82], [16.3, 52.82], [16.7, 52.85],
  [17.1, 52.82], [17.6, 52.78], [18.0, 52.75], [18.35, 52.72], [18.7, 52.85], [18.8, 53.0], [19.0, 53.1], [19.35, 53.2], [19.7, 53.28], [20.2, 53.2], [20.6, 53.2],
  [21.0, 53.25], [21.5, 53.33], [21.9, 53.45], [22.35, 53.6], [22.65, 53.75], [22.75, 54.0], [22.65, 54.3], [22.75, 54.6], [22.85, 54.85], [22.85, 55.07], [22.5, 55.12],
  [22.1, 55.3], [21.7, 55.5], [21.3, 55.7], [21.05, 55.95]];
// the west and south of the Prussian heartland: Swedish Pomerania, Mecklenburg, the Altmark against Hanover, Halberstadt
// against Brunswick, the Harz, round Anhalt, Saxony and Lusatia to Bohemia
const PR_WEST = [[13.8, 54.2], [13.85, 53.9], [13.7, 53.86], [13.4, 53.88], [13.05, 53.92], [13.3, 53.75], [13.6, 53.6], [13.7, 53.4], [13.4, 53.25], [13.2, 53.15],
  [12.8, 53.15], [12.3, 53.3], [11.9, 53.2], [11.6, 53.1], [11.3, 53.1], [11.15, 52.98], [11.0, 52.85], [10.85, 52.7], [10.85, 52.5], [10.95, 52.35], [10.75, 52.1],
  [10.6, 51.95], [10.6, 51.8], [10.75, 51.75], [11.0, 51.7], [11.2, 51.62], [11.45, 51.6], [11.6, 51.45], [11.85, 51.42], [12.05, 51.4], [12.15, 51.5], [12.05, 51.6],
  [11.85, 51.6], [11.7, 51.72], [11.8, 51.85], [11.95, 51.98], [12.1, 52.05], [12.25, 52.1], [12.4, 52.2], [12.6, 52.2], [12.9, 52.12], [13.1, 52.05], [13.3, 52.1],
  [13.6, 52.15], [13.9, 52.15], [14.3, 52.15], [14.6, 52.1], [14.75, 52.0], [15.1, 51.95], [15.25, 51.7], [15.3, 51.45], [15.25, 51.15], [15.25, 50.85], [16.0, 50.0],
  [18.0, 49.7], [18.3, 49.92], [18.6, 49.92], [19.0, 49.95]];
const PR_SEA = [[21.0, 56.1], [18.5, 55.0], [14.5, 54.6]];
const PR_CORE = I(C('Germany', 'Poland', 'Russia', 'Lithuania'), poly(...PR_WEST, ...PR_1772, ...PR_SEA));
// the second partition, 1793: Greater Poland, Kuyavia and Płock; Danzig and Thorn
const P1793 = [[19.2, 50.4], [19.4, 50.6], [19.55, 50.95], [19.75, 51.3], [19.95, 51.48], [20.25, 51.75], [20.35, 51.95], [20.35, 52.25], [20.3, 52.5], [20.25, 52.8], [20.2, 53.2]];
const SOUTH_PRUSSIA = I(C('Poland'), poly(...PR_1772.slice(2, 30), ...rev(P1793), [19.1, 50.35]));
// the third partition, 1795: Warsaw and the land north of the Pilica and the Bug, west of the Niemen
const PILICA = [[19.2, 50.04], [19.3, 50.3], [19.5, 50.45], [19.82, 50.63], [19.88, 51.09], [19.88, 51.35], [20.0, 51.53], [20.22, 51.53], [20.58, 51.62], [21.19, 51.78],
  [21.3, 51.87], [21.15, 52.05], [21.05, 52.25], [21.0, 52.45], [21.05, 52.52], [21.45, 52.6], [21.85, 52.7], [22.32, 52.67], [22.66, 52.4], [23.15, 52.35], [23.2, 52.4]];
const NIEMEN = [[23.2, 52.4], [23.4, 52.75], [23.55, 53.1], [23.7, 53.4], [23.83, 53.68], [23.97, 54.02], [24.05, 54.4], [23.95, 54.63], [23.9, 54.9], [23.3, 55.05], [22.85, 55.07]];
const NEW_EAST_PRUSSIA = I(C('Poland', 'Lithuania', 'Belarus', 'Russia'), poly(...P1793, ...PR_1772.slice(30, 41), ...rev(NIEMEN), ...rev(PILICA), [19.15, 50.2], [19.1, 50.35]));
// Tilsit, 1807: the Netze district and Kulm go to the Duchy of Warsaw, Prussia keeps Graudenz
const PR_1807_S = [[15.9, 52.82], [16.1, 53.05], [16.5, 53.12], [16.9, 53.2], [17.4, 53.25], [17.8, 53.25], [18.2, 53.35], [18.45, 53.42], [18.7, 53.45], [19.0, 53.45],
  [19.35, 53.4], [19.6, 53.3], [19.7, 53.28]];
const NETZE_KULM = I(C('Poland'), poly(...PR_1772.slice(18, 30), ...rev(PR_1807_S)));
// the Elbe from Anhalt to Mecklenburg, Prussia's western border after Tilsit
const ELBE = [[12.1, 51.9], [11.9, 51.97], [11.75, 52.05], [11.65, 52.13], [11.7, 52.3], [11.85, 52.45], [11.97, 52.54], [12.05, 52.7], [12.07, 52.83], [11.9, 52.95],
  [11.75, 53.0], [11.5, 53.07], [11.3, 53.12]];
const WEST_OF_ELBE = I(C('Germany'), poly(...ELBE, [10.0, 53.2], [10.0, 51.5], [12.3, 51.5]));
const COTTBUS = I(C('Germany'), poly([14.0, 51.6], [14.0, 51.95], [14.6, 51.95], [14.6, 51.6]));
const DANZIG = I(C('Poland'), poly([18.45, 54.2], [18.4, 54.5], [18.9, 54.45], [19.05, 54.25], [18.75, 54.15]));
// the western lands: Cleves and Mark, Minden and Ravensberg, Tecklenburg and Lingen, East Frisia, Ansbach and Bayreuth
const CLEVES_MARK = I(C('Germany'), poly([5.95, 51.85], [6.4, 51.88], [6.75, 51.75], [6.95, 51.65], [7.3, 51.62], [7.7, 51.68], [8.0, 51.7], [8.3, 51.65], [8.2, 51.5],
  [7.95, 51.4], [7.8, 51.2], [7.55, 51.12], [7.35, 51.25], [7.1, 51.38], [6.85, 51.38], [6.6, 51.4], [6.35, 51.45], [6.15, 51.55], [6.0, 51.7]));
const MINDEN = I(C('Germany'), poly([8.3, 51.95], [8.35, 52.15], [8.45, 52.4], [8.7, 52.5], [9.1, 52.45], [9.15, 52.25], [8.95, 52.1], [8.7, 51.95], [8.5, 51.92]));
const LINGEN = I(C('Germany'), poly([7.2, 52.6], [7.5, 52.6], [7.9, 52.3], [7.9, 52.15], [7.6, 52.2], [7.25, 52.4]));
const ANSBACH = I(C('Germany'), poly([9.95, 49.15], [10.0, 49.4], [10.35, 49.55], [10.55, 49.68], [10.85, 49.68], [11.15, 49.75], [11.35, 49.95], [11.25, 50.1], [11.45, 50.2],
  [11.65, 50.4], [11.95, 50.42], [12.15, 50.3], [12.25, 50.1], [12.05, 49.9], [11.8, 49.75], [11.55, 49.7], [11.3, 49.55], [11.15, 49.4], [11.0, 49.3], [10.95, 49.1],
  [10.75, 48.95], [10.45, 48.95], [10.15, 49.0]));
const BAYREUTH = I(ANSBACH, poly([11.0, 49.65], [11.3, 49.5], [12.5, 49.5], [12.5, 50.6], [11.0, 50.6]));
// 1803: Münster, Paderborn and the lands between join the western lands into one block; Hildesheim, Goslar,
// the Eichsfeld, Erfurt and Mühlhausen join the heartland
const PR_WEST_1803 = I(C('Germany'), U(CLEVES_MARK, MINDEN, LINGEN, poly([7.3, 51.62], [7.45, 51.95], [7.3, 52.2], [7.6, 52.3], [7.9, 52.15], [8.3, 52.0], [8.5, 51.92],
  [8.7, 51.95], [9.2, 51.75], [9.15, 51.5], [8.8, 51.45], [8.5, 51.5], [8.3, 51.65], [8.0, 51.7], [7.7, 51.68])));
const PR_EAST_1803 = I(C('Germany'), poly([9.75, 52.1], [9.85, 52.25], [10.15, 52.35], [10.45, 52.1], [10.6, 51.95], [10.6, 51.8], [10.75, 51.75], [11.0, 51.7], [10.95, 51.4],
  [10.75, 51.2], [11.2, 51.05], [11.15, 50.9], [10.9, 50.88], [10.6, 51.05], [10.35, 51.15], [10.0, 51.3], [9.95, 51.55], [10.1, 51.75], [9.95, 51.95]));
// 1815: Posen to the Congress line, the Saxon province, the Rhine province and Westphalia
const PR_1815_S = [[18.0, 51.28], [17.95, 51.55], [17.95, 51.8], [17.85, 52.05], [17.8, 52.3], [18.0, 52.5], [18.3, 52.6], [18.6, 52.75], [18.75, 52.95], [19.0, 53.1],
  [19.35, 53.2], [19.7, 53.28]];
const POSEN = I(C('Poland'), poly(...PR_1772.slice(7, 30), ...rev(PR_1815_S)));
const SAXON_LINE = [[14.85, 50.88], [14.75, 51.15], [14.5, 51.3], [14.2, 51.35], [13.9, 51.38], [13.5, 51.4], [13.2, 51.45], [12.9, 51.4], [12.6, 51.42], [12.42, 51.45],
  [12.28, 51.32], [12.2, 51.15], [12.25, 50.95]];
const SAXON_PROVINCE = I(C('Germany'), poly(...SAXON_LINE, [11.8, 51.05], [11.0, 51.1], [10.7, 51.1], [10.3, 51.15], [10.05, 51.3], [10.0, 51.45], [10.55, 51.65],
  [10.6, 51.95], [10.75, 52.1], [10.95, 52.35], [11.8, 52.5], [13.5, 52.4], [15.0, 52.0], [15.1, 51.2]));
const PR_RHINE_1815 = I(C('Germany'), poly([6.0, 51.95], [6.8, 52.12], [7.05, 52.25], [7.35, 52.35], [7.6, 52.4], [7.85, 52.35], [8.1, 52.12], [8.4, 52.15], [8.6, 52.45],
  [8.95, 52.5], [9.1, 52.4], [9.05, 52.15], [9.2, 51.95], [9.4, 51.75], [9.45, 51.55], [9.1, 51.45], [8.9, 51.35], [8.6, 51.1], [8.4, 50.95], [8.35, 50.75], [8.0, 50.65],
  [7.7, 50.6], [7.6, 50.35], [7.6, 50.27], [7.65, 50.2], [7.73, 50.12], [7.8, 50.03], [7.9, 49.97], [7.85, 49.85],
  [7.6, 49.75], [7.35, 49.65], [7.15, 49.55], [7.1, 49.35], [7.08, 49.15], [6.6, 49.15], [6.0, 49.5], [5.8, 51.9]));

// --- the Hanoverian electorate, Westphalia and the Confederation's northern edge ---
const HANOVER = I(C('Germany'), poly([8.2, 52.45], [8.25, 52.75], [8.55, 52.95], [8.75, 53.05], [8.8, 53.2], [8.55, 53.5], [8.45, 53.75], [8.7, 53.95], [9.2, 53.9],
  [9.5, 53.72], [9.8, 53.55], [10.2, 53.48], ...HOLSTEIN_LINE.slice(7, 11), [10.95, 53.72], [10.95, 53.45], [10.72, 53.38], [10.9, 53.3], [11.1, 53.15], [11.57, 53.04],
  [11.55, 52.95], [11.2, 52.9], [11.0, 52.8], [10.85, 52.7], [10.8, 52.5], [10.6, 52.45], [10.4, 52.4], [10.2, 52.35], [10.0, 52.3], [9.85, 52.2], [9.75, 52.05],
  [9.95, 51.9], [10.3, 51.75], [10.55, 51.65], [10.45, 51.5], [10.1, 51.55], [10.0, 51.4], [9.7, 51.35], [9.55, 51.55], [9.45, 51.7], [9.35, 51.95], [9.15, 52.05],
  [9.0, 52.2], [9.1, 52.35], [9.0, 52.5], [8.7, 52.5], [8.45, 52.45]));
const OSNABRUECK = I(C('Germany'), poly([7.75, 52.5], [7.8, 52.75], [8.25, 52.75], [8.3, 52.45], [8.5, 52.2], [8.35, 52.0], [8.05, 52.05], [7.9, 52.15], [7.85, 52.35]));
const WESTPHALIA_1807 = I(C('Germany'), poly([7.75, 52.5], [7.8, 52.75], [8.3, 52.75], [8.4, 52.45], [9.1, 52.5], [9.2, 52.3], [9.5, 52.15], [9.75, 52.1], [9.85, 52.25],
  [10.1, 52.35], [10.4, 52.45], [10.7, 52.55], [10.85, 52.7], [11.0, 52.85], [11.15, 52.98], ...rev(ELBE), [12.15, 51.6], [12.15, 51.45], [11.9, 51.3], [11.6, 51.35],
  [11.3, 51.4], [11.0, 51.35], [10.8, 51.3], [10.4, 51.15], [10.2, 51.0], [10.0, 50.85], [9.9, 50.65], [9.5, 50.6], [9.2, 50.65], [8.8, 50.75], [8.6, 50.75], [8.45, 50.9],
  [8.6, 51.1], [8.55, 51.3], [8.6, 51.5], [8.4, 51.65], [8.3, 51.85], [8.3, 52.0], [8.05, 52.1], [7.85, 52.2]));
// the Confederation of the Rhine as founded in July 1806, up to the Sauerland, the Vogelsberg and the Main valley
const CR_1806_N = [[6.75, 52.15], [7.0, 52.15], [7.3, 52.05], [7.6, 51.8], [8.0, 51.65], [8.5, 51.55], [8.65, 51.25], [8.55, 51.1], [8.5, 50.95], [8.8, 50.85],
  [9.0, 50.7], [9.3, 50.6], [9.55, 50.4], [9.9, 50.45], [10.3, 50.45], [10.6, 50.35], [10.9, 50.15], [11.3, 50.25], [11.6, 50.45], [12.1, 50.35], [12.4, 50.25]];
const CR_1806 = I(C('Germany'), poly(...CR_1806_N, [14.5, 50.0], [14.5, 47.0], [6.0, 47.0], [6.0, 52.15]));
// Upper Lusatia east of the Neisse, Saxon, today in Poland
const LUSATIA_PL = I(C('Poland'), poly([14.5, 50.8], [15.25, 50.85], [15.25, 51.15], [15.3, 51.45], [15.25, 51.7], [15.1, 51.95], [14.6, 52.1], [14.5, 52.1]));
const SWEDISH_POMERANIA = I(C('Germany'), poly([12.4, 54.35], [12.45, 54.25], [12.6, 54.1], [12.85, 54.0], [13.05, 53.92], [13.4, 53.88], [13.7, 53.86], [13.85, 53.9],
  [14.0, 54.0], [14.0, 54.8], [12.4, 54.8]));

// --- the Habsburg lands to the east ---
const SAVA_DANUBE = [[19.25, 44.95], [19.45, 44.88], [19.7, 44.77], [20.0, 44.68], [20.25, 44.68], [20.46, 44.83], [20.7, 44.85], [20.95, 44.7], [21.3, 44.8], [21.6, 44.7],
  [21.9, 44.55], [22.2, 44.5], [22.45, 44.7]];
// Transylvania and the Banat against Wallachia and Moldavia, then Bukovina, up to the Dniester
const CARPATHIANS = [[22.45, 44.72], [22.6, 45.1], [22.9, 45.3], [23.4, 45.4], [23.85, 45.4], [24.27, 45.45], [24.5, 45.55], [25.0, 45.55], [25.35, 45.48], [25.75, 45.5],
  [26.0, 45.55], [26.3, 45.72], [26.4, 45.95], [26.3, 46.2], [26.05, 46.57], [25.85, 46.8], [25.65, 47.1], [25.35, 47.32], [25.75, 47.38], [26.2, 47.5], [26.45, 47.65],
  [26.35, 47.9], [26.25, 48.05], [26.3, 48.25], [26.2, 48.5], [26.35, 48.55]];
const HAB_SE = poly(...SAVA_DANUBE, ...CARPATHIANS.slice(1), [25.5, 48.4], [24.5, 48.5], [22.5, 49.2], [17.0, 48.8], [17.0, 46.0], [19.0, 45.5]);
// Galicia as taken in 1772, from Austrian Silesia along the Vistula, past Zamość to the Bug, Brody and the Zbruch
const GALICIA_N = [[18.55, 49.92], [19.0, 49.95], [19.2, 50.04], [19.4, 50.0], [19.7, 50.02], [19.94, 50.04], [20.3, 50.1], [20.7, 50.2], [21.0, 50.35], [21.4, 50.45],
  [21.75, 50.66], [21.85, 50.7], [22.2, 50.75], [22.6, 50.85], [23.0, 50.9], [23.4, 50.95], [23.8, 50.9], [24.1, 50.88], [24.15, 50.7], [24.27, 50.48], [24.6, 50.25],
  [25.15, 50.12], [25.6, 49.9], [26.0, 49.7], [26.15, 49.53], [26.25, 49.2], [26.2, 48.85], [26.35, 48.55]];
const GALICIA = poly(...GALICIA_N, [26.2, 48.5], [25.5, 48.4], [24.5, 48.5], [22.5, 49.0], [19.0, 49.1], [18.5, 49.6], [18.3, 49.92]);
const WEST_GALICIA = poly(...PILICA, [23.6, 52.15], [23.68, 51.9], [23.6, 51.55], [23.8, 51.17], ...GALICIA_N.slice(2, 18).reverse());
const ZAMOSC = poly([21.85, 50.7], [22.05, 50.55], [22.35, 50.4], [23.0, 50.38], [23.6, 50.38], [24.27, 50.48], ...GALICIA_N.slice(10, 20).reverse());
const KRAKOW = I(C('Poland'), poly([19.25, 50.05], [19.3, 50.25], [19.6, 50.28], [19.9, 50.2], [20.15, 50.12], [20.05, 50.03], [19.6, 50.0]));
const TARNOPOL = I(C('Ukraine'), poly(...GALICIA_N.slice(21), [25.9, 48.62], [25.55, 48.68], [25.45, 48.9], [25.35, 49.25], [25.4, 49.6], [25.35, 50.0]));
const HAB_LANDS = C('Austria', 'Czechia', 'Slovakia', 'Hungary', 'Slovenia', 'Croatia');
const HAB_EAST = I(C('Poland', 'Ukraine', 'Romania', 'Serbia', 'Moldova'), U(HAB_SE, GALICIA));
// the Alpine lands that changed hands: Tyrol with Vorarlberg, Salzburg, the Innviertel, and the Illyrian cessions of 1809
const TYROL_SALZBURG = [[12.1, 47.1], [12.3, 47.25], [12.5, 47.35], [12.65, 47.6], [12.8, 47.75]];
const TYROL = U(I(C('Austria'), poly([9.4, 47.7], ...rev(TYROL_SALZBURG), [12.4, 47.12], [12.7, 47.1], [12.95, 47.05], [13.0, 46.85], [12.95, 46.6], [9.4, 46.6])), TRENTINO);
const VORARLBERG = I(C('Austria'), poly([9.4, 47.7], [10.2, 47.6], [10.25, 47.3], [10.2, 47.1], [10.1, 46.8], [9.4, 46.8]));
const EAST_TYROL = I(C('Austria'), poly([12.05, 46.6], [12.05, 47.1], [12.4, 47.12], [12.7, 47.1], [12.95, 47.05], [13.0, 46.85], [12.95, 46.6]));
const NORTH_TYROL = D(TYROL, TRENTINO, EAST_TYROL);
const SALZBURG = I(C('Austria'), poly(...rev(TYROL_SALZBURG), [12.4, 47.12], [12.7, 47.1], [13.0, 47.07], [13.3, 47.05], [13.6, 47.05], [13.8, 47.25], [13.75, 47.45],
  [13.6, 47.6], [13.45, 47.75], [13.3, 47.95], [13.05, 48.1], [12.9, 48.1]));
const INNVIERTEL = I(C('Austria'), poly([12.75, 48.1], [13.3, 47.95], [13.6, 47.95], [13.9, 48.1], [13.85, 48.35], [13.7, 48.55], [13.4, 48.6]));
const CARNIOLA_LINE = [[14.55, 46.42], [14.75, 46.3], [14.95, 46.17], [15.1, 46.1], [15.4, 46.0], [15.65, 45.85]];
const SAVA_LINE = [[15.65, 45.85], [15.8, 45.82], [15.98, 45.78], [16.15, 45.65], [16.37, 45.48], [16.6, 45.35], [16.9, 45.25]];
const ILLYRIA = U(EAST_TYROL, GORIZIA, I(C('Austria'), poly([12.9, 46.6], [12.95, 47.05], [13.3, 47.05], [13.6, 46.95], [13.85, 46.85], [14.0, 46.7], [14.1, 46.55],
  [14.2, 46.4])), I(C('Slovenia', 'Croatia'), poly([13.4, 46.6], [14.2, 46.5], ...CARNIOLA_LINE, ...SAVA_LINE, [16.9, 45.0], [19.5, 42.0], [13.0, 42.0], [13.0, 46.0])), KOTOR);

// --- Russia: the western border at each partition and peace ---
const DVINA = [[24.0, 57.1], [24.1, 56.95], [24.6, 56.82], [25.25, 56.6], [25.85, 56.5], [26.17, 56.35], [26.52, 55.88], [27.17, 55.9], [27.45, 55.82]];
const DNIESTER_UP = [[26.35, 48.55], [26.8, 48.5], [27.2, 48.45], [27.8, 48.45], [28.3, 48.2], [28.65, 47.95], [29.0, 47.77], [29.15, 47.45], [29.17, 47.27]];
const DNIESTER_LOW = [[29.17, 47.27], [29.45, 47.05], [29.6, 46.85], [29.95, 46.6], [30.2, 46.35], [30.45, 46.1], [30.6, 45.9]];
const RU_1772 = [...DVINA, [27.94, 55.78], [28.6, 55.5], [28.9, 55.2], [29.0, 54.8], [29.3, 54.5], [29.6, 54.2], [29.8, 53.9], [29.95, 53.5], [30.05, 53.1], [30.03, 52.9],
  [30.4, 52.36], [30.8, 51.94], [30.6, 51.3], [30.5, 50.8], [30.3, 50.45], [30.75, 50.15], [31.15, 49.95], [31.45, 49.75], [31.8, 49.6], [32.06, 49.44], [32.4, 49.25],
  [32.85, 49.12], [32.5, 48.9], [32.0, 48.72], [31.5, 48.5], [31.0, 48.15], [30.85, 48.05], [30.3, 47.95], [29.8, 47.7], [29.4, 47.45], ...DNIESTER_LOW];
const RU_1793 = [...DVINA, [27.2, 55.5], [26.9, 55.1], [26.6, 54.7], [26.1, 54.2], [25.9, 53.8], [26.1, 53.3], [26.2, 52.7], [26.1, 52.1], [25.95, 51.6], [26.0, 51.1],
  [25.9, 50.6], [25.85, 50.2], ...GALICIA_N.slice(23), ...DNIESTER_UP.slice(1), ...DNIESTER_LOW.slice(1)];
const COURLAND_LINE = [[20.5, 56.1], [21.05, 55.95], [21.3, 55.7], [21.7, 55.5], [22.1, 55.3], [22.5, 55.12], ...rev(NIEMEN)];
const RU_1795 = [...COURLAND_LINE, [23.6, 52.15], [23.68, 51.9], [23.6, 51.55], [23.8, 51.17], ...GALICIA_N.slice(17), ...DNIESTER_UP.slice(1), ...DNIESTER_LOW.slice(1)];
const BIALYSTOK = [[23.83, 53.68], [23.4, 53.72], [23.05, 53.6], [22.7, 53.35], [22.42, 53.2], [22.35, 52.95], [22.45, 52.65], [22.6, 52.42], [22.9, 52.38], [23.2, 52.4]];
const RU_1807 = [...COURLAND_LINE.slice(0, 12), ...BIALYSTOK, ...RU_1795.slice(17)];
const TARNOPOL_W = [[25.15, 50.12], [25.35, 50.0], [25.4, 49.6], [25.35, 49.25], [25.45, 48.9], [25.55, 48.68], [25.9, 48.62], [26.35, 48.55]];
const PRUT = [[26.2, 48.55], [26.3, 48.4], [26.62, 48.26], [27.0, 48.0], [27.25, 47.75], [27.6, 47.4], [27.9, 47.05], [28.1, 46.7], [28.15, 46.3], [28.1, 45.9], [28.2, 45.47],
  [28.6, 45.35], [29.0, 45.4], [29.4, 45.35], [29.7, 45.25], [30.0, 45.0]];
const ruUpTo = (line, end) => line.slice(0, line.findIndex(q => q[0] === end[0] && q[1] === end[1]));
const RU_1809 = [...ruUpTo(RU_1807, [25.15, 50.12]), ...TARNOPOL_W, ...DNIESTER_UP.slice(1), ...DNIESTER_LOW.slice(1)];
const RU_1812 = [...ruUpTo(RU_1807, [25.15, 50.12]), ...TARNOPOL_W.slice(0, 6), ...PRUT];
const RU_1815 = [...ruUpTo(RU_1807, [25.15, 50.12]), ...GALICIA_N.slice(21), ...PRUT.slice(1)];
// Russia east of a western border; the north Caucasus below the Kuban and the Terek is left out
const KUBAN = [[36.6, 45.1], [37.3, 45.25], [38.0, 45.15], [38.98, 45.04], [39.7, 45.15], [40.8, 45.0], [41.5, 44.9], [42.5, 44.6], [43.5, 44.0], [44.6, 43.75], [45.5, 43.7],
  [46.7, 43.8], [47.5, 43.8]];
const RU_LANDS = C('Russia', 'Belarus', 'Ukraine', 'Moldova', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Åland', 'Poland', 'Kazakhstan');
const russiaEast = line => I(RU_LANDS, poly(...line, [31.0, 44.2], [36.5, 44.2], ...KUBAN, [47.5, 67], [20.5, 67],
  ...(line[0][0] === 24.0 ? [[20.5, 58.0], [21.5, 57.7], [22.3, 57.85], [22.9, 57.8], [23.5, 57.5]] : [])));
// a rough cover of the Polish-Lithuanian lands, cut by whichever neighbours stand before it
const POLAND_ROUGH = poly([15.4, 51.8], [15.4, 53.4], [19.0, 53.6], [21.0, 56.1], [20.8, 57.0], [22.3, 57.9], [22.9, 57.85], [23.5, 57.5], [24.0, 57.1], [24.5, 57.3],
  [33.0, 56.0], [33.0, 47.5], ...rev(DNIESTER_UP), [25.5, 48.4], [22.0, 49.0], [19.0, 49.4]);

// --- the Ottoman Empire, split at the straits so the unchanging Asian half keeps one zone ---
const TURKEY_EUROPE = I(C('Turkey'), poly([25.5, 40.0], [26.2, 40.05], [26.4, 40.2], [26.7, 40.4], [27.5, 40.6], [28.6, 40.95], [29.0, 41.05], [29.15, 41.25], [29.5, 42.0],
  [26.0, 42.5]));
const EAST_AEGEAN = poly([26.15, 40.05], [25.45, 39.5], [25.4, 38.7], [25.9, 37.85], [26.0, 37.4], [26.2, 36.9], [26.1, 36.5], [26.6, 35.2], [26.6, 34.5], [30.0, 34.5], [30.0, 40.05]);
const OTT_ASIA = U(D(C('Turkey'), TURKEY_EUROPE), I(C('Greece'), EAST_AEGEAN), C('Cyprus', 'N. Cyprus', 'Cyprus U.N. Buffer Zone', 'Dhekelia', 'Akrotiri', 'Syria',
  'Lebanon', 'Israel', 'Palestine', 'Jordan'));
const BUDJAK = I(C('Ukraine'), poly(...DNIESTER_UP, ...DNIESTER_LOW.slice(1), [29.8, 45.2], [28.2, 45.2], [26.0, 48.0], [26.0, 48.6]));
const OTT_EUROPE = U(D(C('Greece'), EAST_AEGEAN), TURKEY_EUROPE, BUDJAK, C('Bulgaria', 'Macedonia', 'Albania', 'Kosovo', 'Montenegro', 'Bosnia and Herz.', 'Romania', 'Moldova', 'Serbia'));
const EGYPT = C('Egypt');
const SERBIA_REVOLT = I(C('Serbia'), poly(...SAVA_DANUBE.slice(0, -1), [22.45, 44.7], [22.65, 44.45], [22.55, 44.05], [22.3, 43.85], [21.8, 43.75], [21.4, 43.45], [20.9, 43.4],
  [20.5, 43.55], [20.0, 43.75], [19.55, 44.05], [19.3, 44.4], [19.15, 44.7]));
const SEA_CRETE = sea([[24.5, 35.55], [24.42, 36.2], [24.42, 36.65]]);
const SEA_CYPRUS = sea([[33.3, 35.35], [32.9, 36.08]]);

// --- Scandinavia ---
// the border of 1743 along the Kymi, east of which Russia held Old Finland
const FINLAND_SWEDISH = U(I(C('Finland'), poly([26.95, 60.3], [26.9, 60.5], [26.75, 60.85], [26.6, 61.2], [27.2, 61.6], [28.5, 62.2], [29.5, 62.8], [30.5, 63.5], [30.5, 67],
  [19.0, 67], [19.0, 59.5], [26.95, 59.9])), C('Åland'));
const SEA_SKAGERRAK = sea([[10.6, 57.75], [10.5, 59.0]]);
const SEA_BORNHOLM = sea([[12.6, 55.35], [13.4, 55.2], [14.7, 55.15]]);

// --- smaller pieces the periods need ---
const BREISGAU = I(C('Germany', 'Switzerland'), poly([7.55, 48.25], [7.95, 48.25], [8.2, 48.05], [8.15, 47.8], [8.35, 47.65], [8.2, 47.45], [7.85, 47.45], [7.6, 47.55], [7.55, 47.8]));
// the right-bank half of Cleves with Duisburg, given to Berg in 1806
const CLEVES = I(C('Germany'), poly([5.9, 51.9], [6.5, 51.9], [6.85, 51.7], [6.95, 51.5], [7.0, 51.35], [6.85, 51.3], [6.0, 51.45]));
const MASSA = I(MODENA, poly([9.7, 43.9], [9.7, 44.5], [10.3, 44.35], [10.35, 44.0], [10.2, 43.9]));
const HAMBURG = I(C('Germany'), poly([9.75, 53.5], [9.75, 53.62], [10.2, 53.65], [10.25, 53.48]));
const AUSTRIA_IT = I(IT, poly([10.3, 47.2], [14.0, 47.2], [14.0, 45.45], [13.2, 45.6], [10.3, 45.6]));
const GIBRALTAR = COUNTRY.Gibraltar ?? null;
// Spain in Europe, without the Canaries, Ceuta, Melilla and the enclave of Llívia
const SPAIN_ALL = D(I(C('Spain'), poly([-10, 35.95], [5, 35.95], [5, 44.5], [-10, 44.5])), poly([1.9, 42.42], [2.06, 42.42], [2.06, 42.5], [1.9, 42.5]));
const SPAIN = D(SPAIN_ALL, OLIVENZA);
const CATALONIA_1812 = I(SPAIN_ALL, CATALONIA);

// --- names, English and Turkish ---
const N = {
  franceK: ['Kingdom of France', 'Fransa Krallığı'],
  franceR: ['French Republic', 'Fransa Cumhuriyeti'],
  franceE: ['French Empire', 'Fransız İmparatorluğu'],
  britain: ['Kingdoms of Great Britain and Ireland', 'Büyük Britanya ve İrlanda krallıkları'],
  uk: ['United Kingdom of Great Britain and Ireland', 'Büyük Britanya ve İrlanda Birleşik Krallığı'],
  gibraltar: ['Gibraltar, British', 'İngiliz Cebelitarık'],
  portugal: ['Kingdom of Portugal', 'Portekiz Krallığı'],
  spain: ['Kingdom of Spain', 'İspanya Krallığı'],
  denmark: ['Denmark–Norway', 'Danimarka-Norveç'],
  denmarkK: ['Kingdom of Denmark', 'Danimarka Krallığı'],
  norway: ['Kingdom of Norway, in union with Sweden', 'İsveç ile birlik içindeki Norveç Krallığı'],
  sweden: ['Kingdom of Sweden', 'İsveç Krallığı'],
  pomerania: ['Swedish Pomerania', 'İsveç Pomeranyası'],
  prussia: ['Kingdom of Prussia', 'Prusya Krallığı'],
  habsburg: ['Habsburg Monarchy', 'Habsburg Monarşisi'],
  austria: ['Austrian Empire', 'Avusturya İmparatorluğu'],
  russia: ['Russian Empire', 'Rus İmparatorluğu'],
  ottoman: ['Ottoman Empire in Europe', 'Osmanlı İmparatorluğu’nun Avrupa toprakları'],
  ottomanAsia: ['Ottoman Empire in Asia', 'Osmanlı İmparatorluğu’nun Asya toprakları'],
  prussiaCleves: ['Prussian Cleves and Mark', 'Prusya’ya bağlı Kleve ve Mark'],
  prussiaMinden: ['Prussian Minden and Ravensberg', 'Prusya’ya bağlı Minden ve Ravensberg'],
  prussiaLingen: ['Prussian Lingen and Tecklenburg', 'Prusya’ya bağlı Lingen ve Tecklenburg'],
  prussiaFrisia: ['Prussian East Frisia', 'Prusya’ya bağlı Doğu Frizya'],
  prussiaAnsbach: ['Prussian Ansbach and Bayreuth', 'Prusya’ya bağlı Ansbach ve Bayreuth'],
  prussiaBayreuth: ['Prussian Bayreuth', 'Prusya’ya bağlı Bayreuth'],
  prussiaWest: ['Prussian Westphalia, Cleves and Mark', 'Prusya’ya bağlı Vestfalya, Kleve ve Mark'],
  prussiaRhine: ['Prussian Rhine Province and Westphalia', 'Prusya’nın Ren eyaleti ve Vestfalya'],
  austriaBreisgau: ['Austrian Breisgau', 'Avusturya’ya bağlı Breisgau'],
  austriaMilan: ['Austrian Lombardy', 'Avusturya Lombardiyası'],
  austriaLuxembourg: ['Austrian Luxembourg and Limburg', 'Avusturya’ya bağlı Lüksemburg ve Limburg'],
  sardiniaIslandOnly: ['Kingdom of Sardinia, the island', 'Sardinya Krallığı, ada'],
  hre: ['States of the Holy Roman Empire', 'Kutsal Roma İmparatorluğu devletleri'],
  hanover: ['Electorate of Hanover, under the British king', 'İngiliz kralına bağlı Hannover Prens-Seçmenliği'],
  dutch: ['Dutch Republic', 'Hollanda Cumhuriyeti'],
  liege: ['Prince-Bishopric of Liège', 'Liège Prens-Piskoposluğu'],
  austrianNetherlands: ['Austrian Netherlands', 'Avusturya Hollandası'],
  swiss: ['Swiss Confederation and its allies', 'İsviçre Konfederasyonu ve müttefikleri'],
  poland: ['Polish–Lithuanian Commonwealth', 'Lehistan-Litvanya Birliği'],
  venice: ['Republic of Venice', 'Venedik Cumhuriyeti'],
  genoa: ['Republic of Genoa', 'Cenova Cumhuriyeti'],
  sardinia: ['Kingdom of Sardinia', 'Sardinya Krallığı'],
  parma: ['Duchy of Parma', 'Parma Dükalığı'],
  modena: ['Duchy of Modena', 'Modena Dükalığı'],
  lucca: ['Republic of Lucca', 'Lucca Cumhuriyeti'],
  tuscany: ['Grand Duchy of Tuscany', 'Toskana Büyük Dükalığı'],
  papal: ['Papal States', 'Papalık Devleti'],
  naples: ['Kingdom of Naples and Sicily', 'Napoli ve Sicilya Krallığı'],
  sicily: ['Kingdom of Sicily, under the Bourbons', 'Bourbonların yönetimindeki Sicilya Krallığı'],
  ragusa: ['Republic of Ragusa', 'Ragusa Cumhuriyeti'],
  maltaOrder: ['Malta, held by the Knights of St John', 'Saint Jean Şövalyeleri’nin elindeki Malta'],
  egyptMamluk: ['Ottoman Egypt, ruled by the Mamluk beys', 'Memlük beylerinin yönettiği Osmanlı Mısırı'],
  egypt: ['Ottoman Egypt', 'Osmanlı Mısırı'],
  egyptAli: ['Ottoman Egypt under Muhammad Ali', 'Kavalalı Mehmed Ali Paşa yönetiminde Osmanlı Mısırı'],
  barbary: ['Regencies of Algiers, Tunis and Tripoli, under Ottoman suzerainty', 'Osmanlı egemenliğindeki Cezayir, Tunus ve Trablusgarp ocakları'],
  morocco: ['Sultanate of Morocco', 'Fas Sultanlığı'],
  corsicaBritish: ['Anglo-Corsican Kingdom', 'İngiliz-Korsika Krallığı'],
  batavian: ['Batavian Republic', 'Batavya Cumhuriyeti'],
  holland: ['Kingdom of Holland', 'Hollanda Krallığı'],
  cisalpine: ['Cisalpine Republic', 'Cisalpin Cumhuriyeti'],
  italianRepublic: ['Italian Republic', 'İtalyan Cumhuriyeti'],
  italy: ['Kingdom of Italy', 'İtalya Krallığı'],
  ligurian: ['Ligurian Republic', 'Ligurya Cumhuriyeti'],
  ionianFrench: ['Ionian Islands, held by France', 'Fransa’nın elindeki İyon Adaları'],
  corfuFrench: ['Corfu and Paxos, held by France', 'Fransa’nın elindeki Korfu ve Paksos'],
  ionianProtected: ['Ionian Islands, under Russian and Ottoman protection', 'Rus ve Osmanlı himayesindeki İyon Adaları'],
  ionianBritish: ['Ionian Islands, held by Britain', 'İngiltere’nin elindeki İyon Adaları'],
  helvetic: ['Helvetic Republic', 'Helvetik Cumhuriyet'],
  roman: ['Roman Republic', 'Roma Cumhuriyeti'],
  parthenopean: ['Parthenopean Republic', 'Partenope Cumhuriyeti'],
  maltaFrench: ['Malta, held by France', 'Fransa’nın elindeki Malta'],
  maltaBritish: ['Malta, held by Britain', 'İngiltere’nin elindeki Malta'],
  egyptFrench: ['Egypt, occupied by France', 'Fransız işgalindeki Mısır'],
  menorca: ['Menorca, held by Britain', 'İngiltere’nin elindeki Menorka'],
  piedmontFrench: ['Piedmont, occupied by France', 'Fransız işgalindeki Piyemonte'],
  piedmontContested: ['Piedmont, held in turn by Austria and France', 'Sırayla Avusturya ve Fransa’nın elindeki Piyemonte'],
  sardiniaIsland: ['Kingdom of Sardinia, reduced to the island', 'Adaya çekilmiş Sardinya Krallığı'],
  mediation: ['Swiss Confederation under the Act of Mediation', 'Arabuluculuk Senedi altındaki İsviçre Konfederasyonu'],
  valais: ['Rhodanic Republic (Valais)', 'Rhône Cumhuriyeti (Valais)'],
  etruria: ['Kingdom of Etruria', 'Etrurya Krallığı'],
  luccaFrench: ['Republic of Lucca, under French protection', 'Fransız himayesindeki Lucca Cumhuriyeti'],
  luccaElisa: ['Principality of Lucca and Piombino, under Elisa Bonaparte', 'Elisa Bonaparte yönetiminde Lucca ve Piombino Prensliği'],
  parmaFrench: ['Duchy of Parma, under French administration', 'Fransız yönetimindeki Parma Dükalığı'],
  hanoverOccupied: ['Electorate of Hanover, occupied by France', 'Fransız işgalindeki Hannover Prens-Seçmenliği'],
  breisgau: ['Breisgau, held by the Habsburg duke of Modena', 'Habsburg soyundan Modena dükünün elindeki Breisgau'],
  serbia: ['Serbia, in revolt against the Ottomans', 'Osmanlılara karşı ayaklanan Sırbistan'],
  holyRomanSalzburg: ['States of the Holy Roman Empire', 'Kutsal Roma İmparatorluğu devletleri'],
  rhine: ['Confederation of the Rhine', 'Ren Konfederasyonu'],
  germanNorth: ['German states outside the Confederation of the Rhine', 'Ren Konfederasyonu dışındaki Alman devletleri'],
  naplesJoseph: ['Kingdom of Naples under Joseph Bonaparte', 'Joseph Bonaparte yönetiminde Napoli Krallığı'],
  naplesMurat: ['Kingdom of Naples under Joachim Murat', 'Joachim Murat yönetiminde Napoli Krallığı'],
  westphalia: ['Kingdom of Westphalia', 'Vestfalya Krallığı'],
  danzig: ['Free City of Danzig, under French protection', 'Fransız himayesindeki Danzig Serbest Şehri'],
  warsaw: ['Duchy of Warsaw', 'Varşova Dükalığı'],
  warsawOccupied: ['Duchy of Warsaw, under Russian occupation', 'Rus işgalindeki Varşova Dükalığı'],
  hanoverFrench: ['Hanover and Hamburg, under French occupation', 'Fransız işgalindeki Hannover ve Hamburg'],
  spainJoseph: ['Spain under Joseph Bonaparte, contested by the juntas', 'Joseph Bonaparte yönetiminde, cuntaların direndiği İspanya'],
  balearics: ['Balearic Islands, held by the Spanish patriots', 'İspanyol yurtseverlerin elindeki Balear Adaları'],
  spainCortes: ['Kingdom of Spain, under the Cortes of Cádiz', 'Cádiz Kortesi yönetimindeki İspanya Krallığı'],
  illyria: ['Illyrian Provinces of the French Empire', 'Fransız İmparatorluğu’nun İlirya eyaletleri'],
  finland: ['Grand Duchy of Finland, under the Russian tsar', 'Rus çarına bağlı Finlandiya Büyük Dükalığı'],
  elba: ['Principality of Elba, under Napoleon', 'Napolyon’un yönetimindeki Elba Prensliği'],
  netherlandsUnited: ['United Netherlands, with Belgium', 'Belçika ile Birleşik Hollanda'],
  netherlandsKingdom: ['United Kingdom of the Netherlands', 'Birleşik Hollanda Krallığı'],
  swissRestored: ['Swiss Confederation', 'İsviçre Konfederasyonu'],
  germanStates: ['German states', 'Alman devletleri'],
  germanConfederation: ['States of the German Confederation', 'Alman Konfederasyonu devletleri'],
  krakow: ['Free City of Kraków', 'Krakov Serbest Şehri'],
  congressPoland: ['Kingdom of Poland, under the Russian tsar', 'Rus çarına bağlı Polonya Krallığı'],
  lucca1815: ['Duchy of Lucca', 'Lucca Dükalığı'],
  ionianUnited: ['United States of the Ionian Islands, a British protectorate', 'İngiliz himayesindeki Birleşik İyon Adaları Devleti'],
};

// the pieces a German filler zone falls into, each named by a point inside it
const GERMAN_PARTS = {
  hre: { mecklenburg: [[11.8, 53.7], ['Duchies of Mecklenburg', 'Mecklenburg dükalıkları']], hamburg: [[10.0, 53.57], ['Free City of Hamburg', 'Hamburg Serbest Şehri']],
    oldenburg: [[8.2, 53.15], ['Duchy of Oldenburg', 'Oldenburg Dükalığı']], brunswick: [[10.5, 52.25], ['Duchy of Brunswick', 'Braunschweig Dükalığı']] },
  rhine: { mecklenburg: [[11.8, 53.7], ['Mecklenburg, in the Confederation of the Rhine', 'Ren Konfederasyonu’ndaki Mecklenburg']],
    oldenburg: [[8.2, 53.15], ['Oldenburg, in the Confederation of the Rhine', 'Ren Konfederasyonu’ndaki Oldenburg']] },
  german: { mecklenburg: [[11.8, 53.7], ['Grand Duchies of Mecklenburg', 'Mecklenburg büyük dükalıkları']], hamburg: [[10.0, 53.57], ['Free City of Hamburg', 'Hamburg Serbest Şehri']],
    oldenburg: [[8.2, 53.15], ['Grand Duchy of Oldenburg', 'Oldenburg Büyük Dükalığı']], brunswick: [[10.5, 52.25], ['Duchy of Brunswick', 'Braunschweig Dükalığı']] },
};

// --- states that recur, so each period lists only what changed ---
const S = {
  britain: (name = N.britain) => z('britain', 'britain', name, BRITISH_ISLES, { sea: BRITISH_SEA }),
  gibraltar: () => GIBRALTAR && z('gibraltar', 'britain', N.gibraltar, GIBRALTAR),
  portugal: (land = C('Portugal')) => z('portugal', 'portugal', N.portugal, land),
  spain: (land = SPAIN, name = N.spain) => z('spain', 'spain', name, land, { sea: BALEARIC_SEA }),
  denmark: () => z('denmark', 'other', N.denmark, U(C('Denmark', 'Norway'), HOLSTEIN), { sea: [SEA_SKAGERRAK, SEA_BORNHOLM] }),
  sweden: (land = C('Sweden')) => z('sweden', 'sweden', N.sweden, land),
  pomerania: () => z('sweden-pomerania', 'sweden', N.pomerania, SWEDISH_POMERANIA),
  ottoman: (land = OTT_EUROPE) => [z('ottoman', 'ottoman', N.ottoman, land, { sea: [SEA_CRETE] }), z('ottoman-asia', 'ottoman', N.ottomanAsia, OTT_ASIA, { sea: [SEA_CYPRUS] })],
  africa: () => [z('barbary', 'other', N.barbary, BARBARY), z('morocco', 'other', N.morocco, MOROCCO)],
  russia: line => z('russia', 'russia', N.russia, russiaEast(line)),
};


// --- periods: each lists its states in order, and the first state to claim a piece of land keeps it ---
const PERIODS = [];
// a side period serves a few pages off the main sequence and takes its zones over from the period named in `side`
const period = (id, year, from, to, ...rest) => {
  const [opts, zones] = rest.length === 2 ? rest : [{}, rest[0]];
  PERIODS.push({ id, year, from, to, ...opts, zones: zones.flat(Infinity).filter(Boolean) });
};
const z = (key, family, [en, tr], land, opts = {}) => {
  if (!land) throw new Error(`zone ${key} has no land`);
  return { key, family, en, tr, land, ...opts };
};

// 1792: the old order, Poland after the first partition
period('1792', 1792, 1789, 1792, [
  z('malta', 'other', N.maltaOrder, MALTA),
  z('ragusa', 'other', N.ragusa, RAGUSA),
  z('france', 'france', N.franceK, U(D(C('France'), SAVOY, NICE), SAARLOUIS), { sea: [SEA_CORSICA] }),
  z('liege', 'other', N.liege, LIEGE),
  z('dutch', 'other', N.dutch, C('Netherlands')),
  z('austria-netherlands', 'austria', N.austrianNetherlands, D(C('Belgium'), LUXEMBOURG_DUCHY)),
  z('austria-luxembourg', 'austria', N.austriaLuxembourg, U(C('Luxembourg'), EIFEL_LUX, LUXEMBOURG_DUCHY)),
  z('austria-breisgau', 'austria', N.austriaBreisgau, BREISGAU),
  S.britain(), S.gibraltar(), S.portugal(U(C('Portugal'), OLIVENZA)), S.spain(), S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  z('swiss', 'other', N.swiss, U(SWISS, VALTELLINA)),
  z('venice', 'other', N.venice, U(VENETIA, ISTRIA, DALMATIA, KOTOR, IONIAN), { sea: [SEA_TRIESTE, SEA_KORCULA, SEA_KOTOR, SEA_CORFU, ...IONIAN_SEA] }),
  z('genoa', 'other', N.genoa, LIGURIA),
  z('austria-milan', 'austria', N.austriaMilan, LOMBARDY),
  z('parma', 'other', N.parma, PARMA),
  z('modena', 'other', N.modena, MODENA),
  z('lucca', 'other', N.lucca, LUCCA),
  z('papal', 'other', N.papal, PAPAL),
  z('tuscany', 'other', N.tuscany, TUSCANY),
  z('naples', 'other', N.naples, U(NAPLES, SICILY)),
  z('sardinia', 'other', N.sardinia, U(PIEDMONT, SAVOY, NICE, SARDINIA), { sea: [SEA_SARDINIA] }),
  z('prussia', 'prussia', N.prussia, PR_CORE),
  z('prussia-cleves', 'prussia', N.prussiaCleves, CLEVES_MARK),
  z('prussia-minden', 'prussia', N.prussiaMinden, MINDEN),
  z('prussia-lingen', 'prussia', N.prussiaLingen, LINGEN),
  z('prussia-frisia', 'prussia', N.prussiaFrisia, EAST_FRISIA),
  z('prussia-ansbach', 'prussia', N.prussiaAnsbach, ANSBACH),
  z('hanover', 'other', N.hanover, HANOVER),
  z('austria', 'austria', N.habsburg, D(U(HAB_LANDS, HAB_EAST, AUSTRIA_IT), SALZBURG)),
  S.russia(RU_1772),
  z('poland', 'other', N.poland, POLAND_ROUGH),
  S.ottoman(), z('egypt', 'ottoman', N.egyptMamluk, EGYPT), S.africa(),
  z('hre', 'other', N.hre, U(C('Germany', 'Liechtenstein'), SALZBURG, LUSATIA_PL), { parts: GERMAN_PARTS.hre }),
]);
// Elisa's principality from 1806: Lucca with Massa and Carrara, and the coast between them
const LUCCA_MASSA = U(LUCCA, MASSA, I(IT, poly([10.1, 43.9], [10.2, 44.05], [10.45, 44.1], [10.4, 43.9])));
const TUSCANY_PROPER = D(TUSCANY, LUCCA_MASSA, MODENA);
const WARSAW_ROUGH = poly([15.4, 51.8], [15.4, 53.4], [19.0, 53.6], [22.9, 55.2], [24.6, 55.0], [24.6, 50.2], [19.0, 49.8]);
const WG = I(C('Poland', 'Ukraine', 'Belarus'), WEST_GALICIA);
// one list per stretch of years that recurs across periods
const ITALY_1792 = () => [z('genoa', 'other', N.genoa, LIGURIA), z('austria-milan', 'austria', N.austriaMilan, LOMBARDY), z('parma', 'other', N.parma, PARMA),
  z('modena', 'other', N.modena, MODENA), z('lucca', 'other', N.lucca, LUCCA), z('papal', 'other', N.papal, PAPAL), z('tuscany', 'other', N.tuscany, TUSCANY),
  z('naples', 'other', N.naples, U(NAPLES, SICILY))];
const PRUSSIA_WEST_1792 = () => [z('prussia-cleves', 'prussia', N.prussiaCleves, CLEVES_MARK), z('prussia-minden', 'prussia', N.prussiaMinden, MINDEN),
  z('prussia-lingen', 'prussia', N.prussiaLingen, LINGEN), z('prussia-frisia', 'prussia', N.prussiaFrisia, EAST_FRISIA), z('prussia-ansbach', 'prussia', N.prussiaAnsbach, ANSBACH)];
const AUSTRIA_1797 = name => z('austria', 'austria', name, D(U(HAB_LANDS, HAB_EAST, AUSTRIA_IT, WG, VENETIA_E, ISTRIA, DALMATIA, KOTOR), SALZBURG),
  { sea: [SEA_KORCULA, SEA_KOTOR] });
const FRANCE_1798 = U(C('France', 'Belgium', 'Luxembourg'), JURA, GENEVA, SAARLOUIS, EIFEL_LUX, ZEELAND_FLANDERS, DUTCH_MEUSE, LEFT_BANK);
const FRANCE_1801 = U(FRANCE_1798, PIEDMONT_W, ELBA);
const FRANCE_1808 = U(FRANCE_1801, LIGURIA, PARMA, TUSCANY_PROPER);
const FRANCE_1810 = U(FRANCE_1808, C('Netherlands'), NW_GERMANY, VALAIS, ROME);
const ITALY_1806 = D(U(CISALPINE, NOVARA, VENETIA_E, ISTRIA, DALMATIA, KOTOR), MASSA);
// Austrian Friuli west of the Isonzo went to Italy, the Canal valley with Tarvisio to Illyria
const FRIULI_W = D(I(IT, poly([13.15, 45.6], [13.15, 46.4], [13.75, 46.4], [13.75, 45.6])), VENETIA, GORIZIA);
const TARVISIO = D(I(IT, poly([13.15, 46.4], [13.15, 46.7], [13.8, 46.7], [13.8, 46.4])), VENETIA, GORIZIA);
const ITALY_1810 = D(U(CISALPINE, NOVARA, VENETIA_E, MARCHE, TRENTINO, FRIULI_W), MASSA);
const PRUSSIA_1795 = U(PR_CORE, SOUTH_PRUSSIA, NEW_EAST_PRUSSIA);
const PRUSSIA_1807 = D(PR_CORE, WEST_OF_ELBE, NETZE_KULM, DANZIG, COTTBUS);
const AUSTRIA_1806 = D(U(HAB_LANDS, HAB_EAST, AUSTRIA_IT, WG), TYROL, VORARLBERG);
const AUSTRIA_1810 = D(U(HAB_LANDS, HAB_EAST), TYROL, VORARLBERG, SALZBURG, INNVIERTEL, ILLYRIA, ZAMOSC, TARNOPOL);
const AUSTRIA_1815 = D(U(HAB_LANDS, HAB_EAST, AUSTRIA_IT, TYROL, VORARLBERG, LOMBARDY, VENETIA, VALTELLINA, ISTRIA, DALMATIA, RAGUSA, KOTOR, ILLYRIA), SALZBURG, INNVIERTEL,
  ZAMOSC, KRAKOW);
const PRUSSIA_1815 = U(PR_CORE, POSEN, SAXON_PROVINCE, SWEDISH_POMERANIA, LUSATIA_PL);
const ionianFrench = () => z('ionian', 'france', N.ionianFrench, IONIAN, { sea: IONIAN_SEA });
const ionianProtected = () => z('ionian', 'other', N.ionianProtected, IONIAN, { sea: IONIAN_SEA, span: '1799 – 1807' });
const serbia = () => z('serbia', 'other', N.serbia, SERBIA_REVOLT, { span: '1804 – 1813' });
const germanFiller = (key, family, name, land) => z(key, family, name, land, { parts: GERMAN_PARTS[key === 'rhine' ? 'rhine' : key === 'german' ? 'german' : 'hre'] });

// 1793 – 1794: Savoy, Nice and the northern Jura French; the second partition of Poland; Corsica under Britain
period('1793', 1793, 1793, 1794, [
  z('malta', 'other', N.maltaOrder, MALTA), z('ragusa', 'other', N.ragusa, RAGUSA),
  z('corsica', 'britain', N.corsicaBritish, CORSICA),
  z('france', 'france', N.franceR, U(C('France'), JURA_N, SAARLOUIS)),
  z('liege', 'other', N.liege, LIEGE), z('dutch', 'other', N.dutch, C('Netherlands')),
  z('austria-netherlands', 'austria', N.austrianNetherlands, D(C('Belgium'), LUXEMBOURG_DUCHY)),
  z('austria-luxembourg', 'austria', N.austriaLuxembourg, U(C('Luxembourg'), EIFEL_LUX, LUXEMBOURG_DUCHY)),
  z('austria-breisgau', 'austria', N.austriaBreisgau, BREISGAU),
  S.britain(), S.gibraltar(), S.portugal(U(C('Portugal'), OLIVENZA)), S.spain(), S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  z('swiss', 'other', N.swiss, U(SWISS, VALTELLINA)),
  z('venice', 'other', N.venice, U(VENETIA, ISTRIA, DALMATIA, KOTOR, IONIAN), { sea: [SEA_TRIESTE, SEA_KORCULA, SEA_KOTOR, SEA_CORFU, ...IONIAN_SEA] }),
  ITALY_1792(),
  z('sardinia', 'other', N.sardinia, PIEDMONT), z('sardinia-island', 'other', N.sardiniaIslandOnly, SARDINIA),
  z('prussia', 'prussia', N.prussia, U(PR_CORE, SOUTH_PRUSSIA)), PRUSSIA_WEST_1792(),
  z('hanover', 'other', N.hanover, HANOVER),
  z('austria', 'austria', N.habsburg, D(U(HAB_LANDS, HAB_EAST, AUSTRIA_IT), SALZBURG)),
  S.russia(RU_1793), z('poland', 'other', N.poland, POLAND_ROUGH),
  S.ottoman(), z('egypt', 'ottoman', N.egyptMamluk, EGYPT), S.africa(),
  germanFiller('hre', 'other', N.hre, U(C('Germany', 'Liechtenstein'), SALZBURG, LUSATIA_PL)),
]);

// 1795 – 1796: Belgium and Liège French, the Batavian Republic, Poland partitioned away
const PERIOD_1795 = () => [
  z('malta', 'other', N.maltaOrder, MALTA), z('ragusa', 'other', N.ragusa, RAGUSA),
  z('corsica', 'britain', N.corsicaBritish, CORSICA),
  z('france', 'france', N.franceR, U(C('France', 'Belgium', 'Luxembourg'), JURA_N, SAARLOUIS, EIFEL_LUX, ZEELAND_FLANDERS, DUTCH_MEUSE)),
  z('batavian', 'client', N.batavian, C('Netherlands')),
  z('austria-breisgau', 'austria', N.austriaBreisgau, BREISGAU),
  S.britain(), S.gibraltar(), S.portugal(U(C('Portugal'), OLIVENZA)), S.spain(), S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  z('swiss', 'other', N.swiss, U(SWISS, VALTELLINA)),
  z('venice', 'other', N.venice, U(VENETIA, ISTRIA, DALMATIA, KOTOR, IONIAN), { sea: [SEA_TRIESTE, SEA_KORCULA, SEA_KOTOR, SEA_CORFU, ...IONIAN_SEA] }),
  ITALY_1792(),
  z('sardinia', 'other', N.sardinia, PIEDMONT), z('sardinia-island', 'other', N.sardiniaIslandOnly, SARDINIA),
  z('prussia', 'prussia', N.prussia, PRUSSIA_1795), PRUSSIA_WEST_1792(),
  z('hanover', 'other', N.hanover, HANOVER),
  z('austria', 'austria', N.habsburg, D(U(HAB_LANDS, HAB_EAST, AUSTRIA_IT, WG), SALZBURG)),
  S.russia(RU_1795),
  S.ottoman(), z('egypt', 'ottoman', N.egyptMamluk, EGYPT), S.africa(),
  germanFiller('hre', 'other', N.hre, U(C('Germany', 'Liechtenstein'), SALZBURG, LUSATIA_PL)),
];
period('1795', 1795, 1795, 1796, PERIOD_1795());

// 1797: Campo Formio. Venice divided, the Cisalpine and Ligurian republics, the left bank and the Ionian Islands French
const PERIOD_1797 = ({ france, swiss, papal, malta = N.maltaOrder, extra = [] }) => [
  z('malta', malta === N.maltaOrder ? 'other' : 'france', malta, MALTA, malta === N.maltaFrench ? { span: '1798 – 1800' } : {}),
  z('ragusa', 'other', N.ragusa, RAGUSA),
  ...extra,
  z('france', 'france', N.franceR, france, { sea: [SEA_CORSICA] }),
  z('batavian', 'client', N.batavian, C('Netherlands')),
  z('cisalpine', 'client', N.cisalpine, CISALPINE),
  z('ligurian', 'client', N.ligurian, LIGURIA),
  z('austria-breisgau', 'austria', N.austriaBreisgau, BREISGAU),
  S.britain(), S.gibraltar(), S.portugal(U(C('Portugal'), OLIVENZA)), S.spain(), S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  swiss, papal,
  z('parma', 'other', N.parma, PARMA), z('lucca', 'other', N.lucca, LUCCA), z('tuscany', 'other', N.tuscany, TUSCANY),
  z('sardinia-island', 'other', N.sardiniaIslandOnly, SARDINIA),
  z('prussia', 'prussia', N.prussia, PRUSSIA_1795), PRUSSIA_WEST_1792(),
  z('hanover', 'other', N.hanover, HANOVER),
  AUSTRIA_1797(N.habsburg),
  S.russia(RU_1795),
  S.ottoman(), S.africa(),
  germanFiller('hre', 'other', N.hre, U(C('Germany', 'Liechtenstein'), SALZBURG, LUSATIA_PL)),
];
period('1797', 1797, 1797, 1797, [PERIOD_1797({ france: U(C('France', 'Belgium', 'Luxembourg'), JURA_N, SAARLOUIS, EIFEL_LUX, ZEELAND_FLANDERS, DUTCH_MEUSE, LEFT_BANK),
  swiss: z('swiss', 'other', N.swiss, D(SWISS, JURA_N)), papal: z('papal', 'other', N.papal, PAPAL),
  extra: [ionianFrench()] }), z('naples', 'other', N.naples, U(NAPLES, SICILY)), z('sardinia', 'other', N.sardinia, PIEDMONT), z('egypt', 'ottoman', N.egyptMamluk, EGYPT)]);
// 1798, before the expedition reaches Egypt: Geneva and the Jura French, the Helvetic and Roman republics
period('1798', 1798, 1798, 1798, [PERIOD_1797({ france: FRANCE_1798, swiss: z('swiss', 'client', N.helvetic, SWISS), papal: z('papal', 'client', N.roman, PAPAL),
  extra: [ionianFrench()] }), z('naples', 'other', N.naples, U(NAPLES, SICILY)), z('sardinia', 'other', N.sardinia, PIEDMONT), z('egypt', 'ottoman', N.egyptMamluk, EGYPT)]);
// early 1799: Malta and Egypt French, Piedmont occupied, the Parthenopean Republic, the Ionian Islands lost to Russia and the Ottomans
period('1799', 1799, 1799, 1799, [PERIOD_1797({ france: FRANCE_1798, swiss: z('swiss', 'client', N.helvetic, SWISS), papal: z('papal', 'client', N.roman, PAPAL),
  malta: N.maltaFrench, extra: [ionianProtected(), z('menorca', 'britain', N.menorca, MENORCA)] }),
  z('naples', 'client', N.parthenopean, NAPLES), z('sicily', 'other', N.sicily, SICILY),
  z('sardinia', 'france', N.piedmontFrench, PIEDMONT), z('egypt', 'france', N.egyptFrench, EGYPT, { span: '1798 – 1801' })]);
// late 1799 and 1800: Brumaire, Marengo and Hohenlinden; Piedmont fought over, the Papal States and Naples restored
period('1800', 1800, 1799, 1800, [PERIOD_1797({ france: FRANCE_1798, swiss: z('swiss', 'client', N.helvetic, SWISS), papal: z('papal', 'other', N.papal, D(PAPAL, LEGATIONS)),
  malta: N.maltaFrench, extra: [ionianProtected(), z('menorca', 'britain', N.menorca, MENORCA)] }),
  z('naples', 'other', N.naples, U(NAPLES, SICILY)),
  z('sardinia', 'other', N.piedmontContested, PIEDMONT, { span: '1799 – 1800' }), z('egypt', 'france', N.egyptFrench, EGYPT, { span: '1798 – 1801' })]);

// 1801 – 1802: Lunéville and Amiens. Piedmont and Elba French, the Italian Republic, Etruria; Malta British, Egypt Ottoman again
const PERIOD_1801 = ({ france, swiss, parma, hanover, prussia, breisgau, extra = [] }) => [
  z('malta', 'britain', N.maltaBritish, MALTA), z('ragusa', 'other', N.ragusa, RAGUSA), ionianProtected(),
  ...extra,
  z('france', 'france', france[0], france[1], { sea: [SEA_CORSICA, SEA_ELBA] }),
  z('batavian', 'client', N.batavian, C('Netherlands')),
  ...swiss,
  z('cisalpine', 'client', N.italianRepublic, U(CISALPINE, NOVARA), { span: '1802 – 1805' }),
  z('ligurian', 'client', N.ligurian, LIGURIA),
  z('parma', 'other', parma, PARMA),
  z('lucca', 'other', N.luccaFrench, LUCCA),
  z('tuscany', 'client', N.etruria, TUSCANY),
  z('papal', 'other', N.papal, D(PAPAL, LEGATIONS)),
  z('naples', 'other', N.naples, U(NAPLES, SICILY)),
  z('sardinia-island', 'other', N.sardiniaIsland, SARDINIA),
  z('austria-breisgau', 'austria', breisgau, BREISGAU),
  S.britain(N.uk), S.gibraltar(), S.portugal(), S.spain(SPAIN_ALL), S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  ...prussia,
  z('hanover', 'other', hanover[0], hanover[1]),
  AUSTRIA_1797(N.habsburg),
  S.russia(RU_1795),
  S.ottoman(), z('egypt', 'ottoman', N.egypt, EGYPT), S.africa(),
  germanFiller('hre', 'other', N.hre, U(C('Germany', 'Liechtenstein'), SALZBURG, LUSATIA_PL)),
];
period('1801', 1801, 1801, 1802, PERIOD_1801({ france: [N.franceR, FRANCE_1801], swiss: [z('swiss', 'client', N.helvetic, SWISS)], parma: N.parma,
  hanover: [N.hanover, HANOVER], prussia: [z('prussia', 'prussia', N.prussia, PRUSSIA_1795), PRUSSIA_WEST_1792()], breisgau: N.austriaBreisgau }));
// 1803 – 1804: the Imperial Recess redraws Germany, Hanover occupied by France, the Act of Mediation in Switzerland
const PRUSSIA_1803 = () => [z('prussia', 'prussia', N.prussia, U(PRUSSIA_1795, PR_EAST_1803)), z('prussia-west', 'prussia', N.prussiaWest, PR_WEST_1803),
  z('prussia-frisia', 'prussia', N.prussiaFrisia, EAST_FRISIA), z('prussia-ansbach', 'prussia', N.prussiaAnsbach, ANSBACH)];
const SWISS_1803 = () => [z('valais', 'client', N.valais, VALAIS), z('swiss', 'client', N.mediation, D(SWISS, JURA, GENEVA, VALAIS), { span: '1803 – 1813' })];
period('1803', 1803, 1803, 1804, PERIOD_1801({ france: [N.franceR, FRANCE_1801], swiss: SWISS_1803(), parma: N.parmaFrench,
  hanover: [N.hanoverOccupied, U(HANOVER, OSNABRUECK)], prussia: PRUSSIA_1803(), breisgau: N.breisgau }));

// 1805: the Empire with Liguria, the Kingdom of Italy, Lucca and Piombino for Elisa
period('1805', 1805, 1805, 1805, [
  z('malta', 'britain', N.maltaBritish, MALTA), z('ragusa', 'other', N.ragusa, RAGUSA), ionianProtected(),
  z('france', 'france', N.franceE, U(FRANCE_1801, LIGURIA), { sea: [SEA_CORSICA, SEA_ELBA] }),
  z('batavian', 'client', N.batavian, C('Netherlands')),
  SWISS_1803(),
  z('cisalpine', 'client', N.italy, U(CISALPINE, NOVARA)),
  z('parma', 'other', N.parmaFrench, PARMA),
  z('lucca', 'client', N.luccaElisa, LUCCA),
  z('tuscany', 'client', N.etruria, TUSCANY),
  z('papal', 'other', N.papal, D(PAPAL, LEGATIONS)),
  z('naples', 'other', N.naples, U(NAPLES, SICILY)),
  z('sardinia-island', 'other', N.sardiniaIsland, SARDINIA),
  z('austria-breisgau', 'austria', N.breisgau, BREISGAU),
  S.britain(N.uk), S.gibraltar(), S.portugal(), S.spain(SPAIN_ALL), S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  PRUSSIA_1803(),
  z('hanover', 'other', N.hanoverOccupied, U(HANOVER, OSNABRUECK)),
  AUSTRIA_1797(N.austria),
  S.russia(RU_1795),
  serbia(), S.ottoman(), z('egypt', 'ottoman', N.egyptAli, EGYPT), S.africa(),
  germanFiller('hre', 'other', N.hre, U(C('Germany', 'Liechtenstein'), SALZBURG, LUSATIA_PL)),
]);

// 1806 to the summer of 1807: Pressburg, Holland and Naples for the Bonapartes, the Confederation of the Rhine,
// Prussia with Hanover until Jena
period('1806', 1806, 1806, 1807, [
  z('malta', 'britain', N.maltaBritish, MALTA), z('ragusa', 'other', N.ragusa, RAGUSA), ionianProtected(),
  z('france', 'france', N.franceE, U(FRANCE_1801, LIGURIA), { sea: [SEA_CORSICA, SEA_ELBA] }),
  z('holland', 'client', N.holland, C('Netherlands')),
  SWISS_1803(),
  z('cisalpine', 'client', N.italy, ITALY_1806, { sea: [SEA_TRIESTE, SEA_KORCULA, SEA_KOTOR] }),
  z('parma', 'other', N.parmaFrench, PARMA),
  z('lucca', 'client', N.luccaElisa, LUCCA_MASSA),
  z('tuscany', 'client', N.etruria, TUSCANY),
  z('papal', 'other', N.papal, D(PAPAL, LEGATIONS)),
  z('naples', 'client', N.naplesJoseph, NAPLES), z('sicily', 'other', N.sicily, SICILY),
  z('sardinia-island', 'other', N.sardiniaIsland, SARDINIA),
  S.britain(N.uk), S.gibraltar(), S.portugal(), S.spain(SPAIN_ALL), S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  z('prussia', 'prussia', N.prussia, U(PRUSSIA_1795, PR_EAST_1803, HANOVER, OSNABRUECK, D(PR_WEST_1803, CLEVES))),
  z('prussia-frisia', 'prussia', N.prussiaFrisia, EAST_FRISIA), z('prussia-bayreuth', 'prussia', N.prussiaBayreuth, BAYREUTH),
  z('austria', 'austria', N.austria, AUSTRIA_1806),
  z('rhine', 'rhine', N.rhine, U(CR_1806, TYROL, VORARLBERG)),
  S.russia(RU_1795),
  serbia(), S.ottoman(), z('egypt', 'ottoman', N.egyptAli, EGYPT), S.africa(),
  germanFiller('hre', 'other', N.germanNorth, U(C('Germany', 'Liechtenstein'), LUSATIA_PL)),
]);

// 1807 – 1808: Tilsit. Westphalia, the Duchy of Warsaw and Danzig; Prussia cut back to the Elbe; the Ionian Islands French
const PERIOD_1807 = ({ late }) => [
  z('malta', 'britain', N.maltaBritish, MALTA),
  late ? null : z('ragusa', 'other', N.ragusa, RAGUSA),
  ionianFrench(),
  z('france', 'france', N.franceE, late ? FRANCE_1808 : U(FRANCE_1801, LIGURIA), { sea: [SEA_CORSICA, SEA_ELBA, ...(late ? [SEA_LUCCA] : [])] }),
  z('holland', 'client', N.holland, U(C('Netherlands'), EAST_FRISIA, JEVER)),
  z('westphalia', 'client', N.westphalia, WESTPHALIA_1807),
  z('danzig', 'client', N.danzig, DANZIG),
  SWISS_1803(),
  z('cisalpine', 'client', N.italy, late ? U(ITALY_1806, RAGUSA, MARCHE) : ITALY_1806, { sea: [SEA_TRIESTE, SEA_KORCULA, SEA_KOTOR] }),
  late ? null : z('parma', 'other', N.parmaFrench, PARMA),
  z('lucca', 'client', N.luccaElisa, LUCCA_MASSA),
  late ? null : z('tuscany', 'client', N.etruria, TUSCANY),
  z('papal', 'other', N.papal, late ? ROME : D(PAPAL, LEGATIONS)),
  z('naples', 'client', late ? N.naplesMurat : N.naplesJoseph, NAPLES), z('sicily', 'other', N.sicily, SICILY),
  z('sardinia-island', 'other', N.sardiniaIsland, SARDINIA),
  S.britain(N.uk), S.gibraltar(), S.portugal(),
  ...(late ? [z('balearics', 'spain', N.balearics, BALEARICS, { sea: BALEARIC_SEA.slice(1) }), z('joseph-spain', 'client', N.spainJoseph, SPAIN_ALL)] : [S.spain(SPAIN_ALL)]),
  S.denmark(), S.pomerania(), S.sweden(U(C('Sweden'), FINLAND_SWEDISH)),
  z('prussia', 'prussia', N.prussia, PRUSSIA_1807),
  z('hanover', 'other', N.hanoverFrench, U(HANOVER, HAMBURG)),
  z('austria', 'austria', N.austria, AUSTRIA_1806),
  S.russia(RU_1807),
  z('warsaw', 'rhine', N.warsaw, WARSAW_ROUGH),
  serbia(), S.ottoman(), z('egypt', 'ottoman', N.egyptAli, EGYPT), S.africa(),
  germanFiller('rhine', 'rhine', N.rhine, U(C('Germany', 'Liechtenstein'), TYROL, VORARLBERG, LUSATIA_PL)),
];
period('1807', 1807, 1807, 1808, PERIOD_1807({ late: false }));
// 1808 – 1809: Joseph in Spain, Murat in Naples, Tuscany and Parma French, the Marche and Ragusa in the Kingdom of Italy
period('1808', 1808, 1808, 1809, PERIOD_1807({ late: true }));

// 1809 – 1812: Schönbrunn. Illyria, Holland and the North Sea coast French, Finland Russian; the Empire at its height
const PERIOD_1810 = ({ france, russia, warsaw }) => [
  z('malta', 'britain', N.maltaBritish, MALTA),
  z('corfu', 'france', N.corfuFrench, IONIAN_N),
  z('ionian', 'britain', N.ionianBritish, D(IONIAN, IONIAN_N), { sea: [IONIAN_SEA[1]] }),
  z('france', 'france', N.franceE, france, { sea: [SEA_CORSICA, SEA_ELBA, SEA_LUCCA] }),
  z('illyria', 'france', N.illyria, U(ILLYRIA, TARVISIO)),
  z('westphalia', 'client', N.westphalia, U(WESTPHALIA_1807, HANOVER)),
  z('danzig', 'client', N.danzig, DANZIG),
  z('swiss', 'client', N.mediation, D(SWISS, JURA, GENEVA, VALAIS), { span: '1803 – 1813' }),
  z('cisalpine', 'client', N.italy, ITALY_1810),
  z('lucca', 'client', N.luccaElisa, LUCCA_MASSA),
  z('naples', 'client', N.naplesMurat, NAPLES), z('sicily', 'other', N.sicily, SICILY),
  z('sardinia-island', 'other', N.sardiniaIsland, SARDINIA),
  S.britain(N.uk), S.gibraltar(), S.portugal(),
  z('balearics', 'spain', N.balearics, BALEARICS, { sea: BALEARIC_SEA.slice(1) }), z('joseph-spain', 'client', N.spainJoseph, SPAIN_ALL),
  S.denmark(), S.pomerania(), S.sweden(), z('finland', 'russia', N.finland, C('Finland', 'Åland')),
  z('prussia', 'prussia', N.prussia, PRUSSIA_1807),
  z('austria', 'austria', N.austria, AUSTRIA_1810),
  S.russia(russia),
  z('warsaw', 'rhine', warsaw, WARSAW_ROUGH),
  serbia(), S.ottoman(), z('egypt', 'ottoman', N.egyptAli, EGYPT), S.africa(),
  germanFiller('rhine', 'rhine', N.rhine, U(C('Germany', 'Liechtenstein'), NORTH_TYROL, VORARLBERG, SALZBURG, INNVIERTEL, LUSATIA_PL)),
];
period('1809', 1809, 1809, 1812, PERIOD_1810({ france: FRANCE_1810, russia: RU_1809, warsaw: N.warsaw }));
// 1813: Catalonia French since 1812, Bessarabia Russian, the Duchy of Warsaw under Russian occupation
period('1813', 1813, 1813, 1813, PERIOD_1810({ france: U(FRANCE_1810, CATALONIA_1812), russia: RU_1812, warsaw: N.warsawOccupied }));
// the Pyrenees in late 1813: Joseph gone, Spain under the Cortes, Catalonia still French
period('1813-spain', 1813, 1813, 1814, { side: '1813' }, [
  z('france', 'france', N.franceE, U(FRANCE_1810, CATALONIA_1812), { sea: [SEA_CORSICA, SEA_ELBA, SEA_LUCCA] }),
  S.britain(N.uk), S.gibraltar(), S.portugal(), S.spain(SPAIN_ALL, N.spainCortes), S.africa(),
]);

// 1814 to the spring of 1815: France in the borders of the first Peace of Paris, Napoleon on Elba, Murat in Naples
const PERIOD_1815 = ({ late }) => [
  z('malta', 'britain', N.maltaBritish, MALTA),
  z('ionian', 'britain', late ? N.ionianUnited : N.ionianBritish, IONIAN, { sea: IONIAN_SEA }),
  late ? null : z('elba', 'other', N.elba, ELBA, { span: '1814 – 1815' }),
  z('france', 'france', N.franceK, late ? D(C('France'), SAVOY, NICE) : D(U(C('France', 'Belgium'), SAAR_1814), D(C('Belgium'), PHILIPPEVILLE_BOX), NICE, D(SAVOY, SAVOY_WEST)), { sea: [SEA_CORSICA] }),
  z('netherlands', 'other', late ? N.netherlandsKingdom : N.netherlandsUnited, D(C('Netherlands', 'Belgium', 'Luxembourg'), EUPEN_MALMEDY)),
  z('swiss', 'other', N.swissRestored, SWISS),
  z('sardinia', 'other', N.sardinia, U(PIEDMONT, NICE, SAVOY, LIGURIA, SARDINIA), { sea: [SEA_SARDINIA_GENOA] }),
  z('krakow', 'other', N.krakow, KRAKOW),
  z('austria', 'austria', N.austria, AUSTRIA_1815, { sea: [SEA_KORCULA] }),
  z('parma', 'other', N.parma, PARMA), z('modena', 'other', N.modena, MODENA), z('lucca', 'other', N.lucca1815, LUCCA),
  z('tuscany', 'other', N.tuscany, U(D(TUSCANY, LUCCA, MODENA), ELBA)), z('papal', 'other', N.papal, PAPAL),
  ...(late ? [z('naples', 'other', N.naples, U(NAPLES, SICILY))] : [z('naples', 'client', N.naplesMurat, NAPLES), z('sicily', 'other', N.sicily, SICILY)]),
  S.britain(N.uk), S.gibraltar(), S.portugal(), S.spain(SPAIN_ALL),
  z('denmark', 'other', N.denmarkK, U(C('Denmark'), HOLSTEIN), { sea: [SEA_BORNHOLM] }),
  z('norway', 'sweden', N.norway, C('Norway')),
  late ? null : S.pomerania(), S.sweden(), z('finland', 'russia', N.finland, C('Finland', 'Åland')),
  z('prussia', 'prussia', N.prussia, PRUSSIA_1815), z('prussia-west', 'prussia', N.prussiaRhine, U(PR_RHINE_1815, EUPEN_MALMEDY)),
  S.russia(RU_1815),
  z('poland', 'russia', N.congressPoland, WARSAW_ROUGH),
  S.ottoman(), z('egypt', 'ottoman', N.egyptAli, EGYPT), S.africa(),
  germanFiller('german', 'other', late ? N.germanConfederation : N.germanStates, U(C('Germany', 'Liechtenstein'), SALZBURG, INNVIERTEL)),
];
period('1814', 1814, 1814, 1815, PERIOD_1815({ late: false }));
// 1815: the Vienna settlement and the second Peace of Paris
period('1815', 1815, 1815, 1815, PERIOD_1815({ late: true }));


// --- which strategic page shows which period; close battle views and phase pages show none ---
const PAGES = {
  revolution: '1792', 'war-of-1792': '1792', valmy: '1792', jemappes: '1792',
  'coalition-1793': '1793', fleurus: '1793',
  directory: '1795', 'italy-1796': '1795', arcole: '1795',
  'campo-formio': '1797',
  'egypt-1798': '1798', pyramids: '1798', nile: '1798',
  'second-coalition': '1799', acre: '1799', 'acre-retreat': '1799',
  brumaire: '1800', marengo: '1800', hohenlinden: '1800', 'egypt-end': '1800',
  amiens: '1801', empire: '1803',
  ulm: '1805', trafalgar: '1805', austerlitz: '1805',
  pressburg: '1806', 'prussia-1806': '1806', berlin: '1806', eylau: '1806', friedland: '1806',
  tilsit: '1807', 'spain-1808': '1807',
  corunna: '1808', talavera: '1808', 'austria-1809': '1808',
  schonbrunn: '1809', 'torres-vedras': '1809', salamanca: '1809', niemen: '1809', smolensk: '1809', borodino: '1809', moscow: '1809', berezina: '1809', vilna: '1809',
  vitoria: '1813', 'germany-1813': '1813', dresden: '1813', leipzig: '1813', toulouse: '1813-spain',
  'france-1814': '1814', 'abdication-1814': '1814', 'return-from-elba': '1814',
  'second-abdication': '1815', vienna: '1815',
};


// --- settle each period: land first, then corridors, then the sea; one Polygon per zone ---
const yaml = require('js-yaml');
const storyYaml = yaml.load(fs.readFileSync(path.join(story, 'story.yaml'), 'utf8'));
const STORYLAND = C(...storyYaml.land.filter(n => COUNTRY[n]));
const box = (g, pad = 0.05) => { const [w, s, e, n] = turf.bbox(g); return [w - pad, s - pad, e + pad, n + pad]; };
const meeting = (list, g) => { const b = box(g); return list.filter(q => meets(q.bbox ??= turf.bbox(q), b)); };
const landOf = g => D(I(g, BOXPOLY), meeting(SEA, g));
// the outline a zone grows from: its pieces over half a square kilometre, without holes, a little simplified
const outline = (g, tol) => turf.multiPolygon(pieces(g).filter(q => km2(q) > 0.5).map(q => { const r = q.geometry.coordinates[0], s = dp(r, tol); return [s.length >= 4 ? s : r]; }));
function settle(p) {
  const out = [], placed = [];
  for (const s of p.zones) {
    let g = landOf(s.land);
    if (g) g = D(g, meeting(placed, g));
    if (!g || km2(g) < 1) throw new Error(`${p.id} ${s.key}: no land left`);
    if (process.env.DEBUG) console.log(`  ${s.key}: ${Math.round(km2(g))} km2`);
    out.push({ ...s, g, landPart: g });
    placed.push(...pieces(g));
  }
  if (process.env.GAPS) for (const q of pieces(D(STORYLAND, placed))) if (km2(q) > (+process.env.GAPS || 20)) console.log(`  ${p.id}: unclaimed land, ${km2(q).toFixed(0)} km2 at ${at(q)}, box ${turf.bbox(q).map(c => c.toFixed(1))}`);
  if (process.env.DEBUG) console.log(`  land ${((Date.now() - T0) / 1000).toFixed(1)} s`);
  const water = [];
  const claim = (o, add) => { if (!add) return; o.g = U(o.g, add); water.push(...pieces(add)); };
  const step = (o, what, f) => { try { f(); } catch (e) { throw new Error(`${p.id} ${o.key}, ${what}: ${e.message}`); } };
  for (const o of out) for (const c of o.sea ?? []) step(o, 'corridor', () => {
    const add = D(c, meeting(LAND, c), meeting(water, c));
    if (process.env.DEBUG) console.log(`  ${o.key}: corridor at ${at(c)} in ${pieces(add).length} pieces, touching ${pieces(add).map(q => pieces(o.landPart).filter(l => turf.booleanIntersects(turf.buffer(q, 0.05), l)).length).join('/')} pieces of land`);
    claim(o, add);
  });
  for (const km of [3, 30]) for (const o of out) step(o, `${km} km of sea`, () => {
    const b = turf.buffer(outline(o.landPart, km / 1000), km, { units: 'kilometers' });
    claim(o, D(b, meeting(LAND, b), meeting(water, b)));
  });
  if (process.env.DEBUG) console.log(`  sea ${((Date.now() - T0) / 1000).toFixed(1)} s`);
  // loose bits of land are dropped: slivers cut off by a neighbour's line, islets under 150 km2, islands north of 62°.
  // A zone with `parts` splits into one zone per named piece, the piece holding that point; the largest keeps the key.
  const final = [];
  for (const o of out) {
    const sized = pieces(o.g).map(q => [q, km2(landOf(q))]).sort((a, b) => b[1] - a[1]);
    const kept = sized.filter(([q, a], i) => i === 0 || (a > 150 && turf.centroid(q).geometry.coordinates[1] < 62)).map(([q]) => q);
    if (process.env.DEBUG) for (const [q, a] of sized.slice(1)) if (a > 1 && !kept.includes(q)) console.log(`  ${o.key}: dropped ${a.toFixed(0)} km2 at ${at(q)}`);
    const named = kept.map((q, i) => [i === 0 ? o.key : Object.entries(o.parts ?? {}).find(([, [pt]]) => turf.booleanPointInPolygon(pt, q))?.[0], q]);
    const loose = named.filter(([k]) => !k);
    if (loose.length) {
      if (process.env.DEBUG) for (const l of pieces(o.landPart)) if (km2(l) > 20) console.log(`    land ${km2(l).toFixed(0)} km2 at ${at(l)} in piece ${kept.findIndex(q => turf.booleanIntersects(q, turf.pointOnFeature(l)))}`);
      throw new Error(`${p.id} ${o.key}: ${kept.length} pieces with land, loose: ${loose.map(([, q]) => `${km2(landOf(q)).toFixed(0)} km2 at ${at(q)}, box ${turf.bbox(q).map(c => c.toFixed(2))}`).join('; ')}`);
    }
    for (const [k, q] of named) {
      const [en, tr] = k === o.key ? [o.en, o.tr] : o.parts[k][1];
      final.push({ ...o, key: k === o.key ? k : `${o.key}-${k}`, en, tr, g: q, landPart: I(o.landPart, q) });
    }
  }
  return final;
}

// --- one zone per shape: a state whose land stays the same keeps its zone into the next period ---
// the periods settle in parallel worker threads, each of which evaluates this file up to here
const RUN = PERIODS.filter(p => !process.env.ONLY || process.env.ONLY.split(',').includes(p.id));
if (!isMainThread) {
  const out = {};
  for (const id of workerData.ids) {
    const t = Date.now();
    out[id] = settle(PERIODS.find(p => p.id === id)).map(({ key, family, en, tr, span, g, landPart }) => ({ key, family, en, tr, span, g, landPart }));
    console.log(`${id}: ${out[id].length} zones, ${((Date.now() - t) / 1000).toFixed(1)} s`);
  }
  parentPort.postMessage(out);
  await new Promise(() => {});   // the main thread ends this worker once it has the results
}
const lanes = Math.max(1, Math.min(os.cpus().length - 1, 6, RUN.length));
const SETTLED = Object.assign({}, ...await Promise.all([...Array(lanes)].map((_, i) => new Promise((resolve, reject) => {
  const w = new Worker(new URL(import.meta.url), { workerData: { ids: RUN.filter((_, j) => j % lanes === i).map(p => p.id) }, resourceLimits: { maxOldGenerationSizeMb: 4096 } });
  w.on('message', m => { resolve(m); w.terminate(); }); w.on('error', reject);
}))));

// --- one zone per shape: a state whose land stays the same keeps its zone into the next period ---
const ZONES = {};
// land that differs only by float noise or by islets under 50 km2, kept or dropped as the sea around them fell, is the same
const same = (a, b) => { const d = [...pieces(D(a, b)), ...pieces(D(b, a))].map(km2); return d.every(x => x < 50) && d.reduce((x, y) => x + y, 0) < 150; };
for (const p of RUN) {
  p.ids = {};
  for (const o of SETTLED[p.id]) {
    const last = p.side ? PERIODS.find(q => q.id === p.side) : PERIODS.slice(0, PERIODS.indexOf(p)).reverse().find(q => !q.side && q.ids);
    const e = last && ZONES[last.ids[o.key]];
    let z = e && e.family === o.family && e.en === o.en && e.tr === o.tr && e.span === o.span && same(e.landPart, o.landPart) ? e : null;
    if (!z && e && e.en === o.en && process.env.DEBUG) for (const q of [...pieces(D(e.landPart, o.landPart)), ...pieces(D(o.landPart, e.landPart))]) if (km2(q) > 1) console.log(`  ${p.id} ${o.key}: same name, land differs by ${km2(q).toFixed(1)} km2 at ${at(q)}`);
    if (!z) {
      const id = ZONES[`${o.key}-${p.year}`] ? `${o.key}-${p.id}` : `${o.key}-${p.year}`;
      z = ZONES[id] = { id, key: o.key, family: o.family, en: o.en, tr: o.tr, span: o.span, g: o.g, landPart: o.landPart, periods: [] };
    }
    z.periods.push(p);
    p.ids[o.key] = z.id;
  }
}
const years = (a, b) => a === b ? `${a}` : `${a} – ${b}`;
for (const z of Object.values(ZONES)) {
  const span = z.span ?? years(Math.min(...z.periods.map(p => p.from)), Math.max(...z.periods.map(p => p.to)));
  z.name = { en: `${z.en}, ${span}`, tr: `${z.tr}, ${span}` };
}

// --- shared borders carry the same points: a vertex of one zone that lies on another's edge is added to it ---
const rings = g => g.geometry.coordinates;
const nodeZones = list => {
  const all = list.map(z => ({ z, bbox: turf.bbox(z.g), points: rings(z.g).flat() }));
  for (const target of all) {
    const [w, s, e, n] = target.bbox;
    const cand = all.filter(o => o !== target && o.bbox[0] <= e && o.bbox[2] >= w && o.bbox[1] <= n && o.bbox[3] >= s).flatMap(o => o.points);
    for (const ring of rings(target.z.g)) for (let i = ring.length - 2; i >= 0; i--) {
      const a = ring[i], b = ring[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy;
      if (!len2) continue;
      const inside = [];
      for (const q of cand) {
        if (q[0] < Math.min(a[0], b[0]) - 1e-9 || q[0] > Math.max(a[0], b[0]) + 1e-9 || q[1] < Math.min(a[1], b[1]) - 1e-9 || q[1] > Math.max(a[1], b[1]) + 1e-9) continue;
        const t = ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / len2;
        if (t <= 1e-9 || t >= 1 - 1e-9) continue;
        if (Math.abs((q[0] - a[0]) * dy - (q[1] - a[1]) * dx) / Math.sqrt(len2) < 1e-9) inside.push([t, q]);
      }
      if (!inside.length) continue;
      inside.sort((x, y) => x[0] - y[0]);
      const seen = new Set(), add = [];
      for (const [, q] of inside) { const k = q.join(); if (!seen.has(k)) { seen.add(k); add.push(q); } }
      ring.splice(i + 1, 0, ...add);
    }
  }
};
nodeZones(Object.values(ZONES));

// --- write the zones, the page map and the Turkish names ---
// the legend lists France and its satellites first, then the powers, then the smaller states
const FAMILY_ORDER = ['france', 'client', 'rhine', 'britain', 'spain', 'portugal', 'sweden', 'prussia', 'austria', 'ottoman', 'russia', 'other'];
// a page lists the zones of its period that reach into its view: the bbox widened to a square map and a margin
const PAGE_BBOX = {};
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) {
  const dir = path.join(d, e.name), file = path.join(dir, 'page.yaml');
  if (fs.existsSync(file)) PAGE_BBOX[e.name.replace(/^\d+-/, '')] = yaml.load(fs.readFileSync(file, 'utf8')).bbox;
  walk(dir);
} };
walk(path.join(story, 'pages'));
const view = ([w, s, e, n]) => {
  const k = Math.cos((s + n) / 2 * Math.PI / 180), dx = (e - w) * k, dy = n - s, half = Math.max(dx, dy) * 0.6;
  const cx = (w + e) / 2, cy = (s + n) / 2;
  return turf.bboxPolygon([cx - half / k, cy - half, cx + half / k, cy + half]);
};
const PAGE_ZONES = Object.fromEntries(Object.entries(PAGES).flatMap(([page, pid]) => {
  const p = PERIODS.find(q => q.id === pid);
  if (!p) throw new Error(`${page}: unknown period ${pid}`);
  if (!p.ids) return [];
  if (!PAGE_BBOX[page]) { console.log(`  no page ${page}`); return []; }
  const v = view(PAGE_BBOX[page]);
  const order = id => [FAMILY_ORDER.indexOf(ZONES[id].family), -km2(ZONES[id].landPart)];
  const ids = Object.values(p.ids).filter(id => turf.booleanIntersects(ZONES[id].landPart, v));
  return [[page, ids.sort((a, b) => { const [fa, sa] = order(a), [fb, sb] = order(b); return fa - fb || sa - sb; })]];
}));
const r7 = x => Math.round(x * 1e7) / 1e7;
const dir = path.join(story, 'shared', 'zones');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
// only zones some page shows go to disk
const USED = Object.values(ZONES).filter(z => Object.values(PAGE_ZONES).some(ids => ids.includes(z.id)));
for (const z of USED) {
  const coordinates = rings(z.g).map(r => r.map(q => q.map(r7)));
  fs.writeFileSync(path.join(dir, z.id + '.geojson'), JSON.stringify({ type: 'Feature', properties: { family: z.family, name: z.name.en }, geometry: { type: 'Polygon', coordinates } }) + '\n');
}
fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per strategic page, written by .plans/zones.mjs. Close battle views and phase pages show none.\n'
  + Object.entries(PAGE_ZONES).map(([page, ids]) => `${page}: [${ids.join(', ')}]`).join('\n') + '\n');
fs.mkdirSync(path.join(story, '.i18n-parts'), { recursive: true });
fs.writeFileSync(path.join(story, '.i18n-parts', 'zones.tr.yaml'), USED.map(z => `zones.${z.id}.name: ${JSON.stringify(z.name.tr)}`).join('\n') + '\n');
console.log(`${USED.length} zones, ${Object.keys(PAGE_ZONES).length} pages`);
