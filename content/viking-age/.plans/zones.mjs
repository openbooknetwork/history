// The political map: one set of zones per period, written to shared/zones/, with the page map in .plans/zones.yaml
// and the Turkish names in .i18n-parts/zones.tr.yaml. Run: node content/viking-age/.plans/zones.mjs
// Land comes from the Natural Earth countries, simplified once on the shared arcs and cut to the map. Borders of the
// time are hand drawn lines. Each period lists its states in order and the first state to claim a piece of land keeps
// it, so a later state is drawn rough over its neighbours. Every zone then grows into the sea and joins its islands
// with corridors, so the build clips the coast.
// Env: ONLY=<period ids> settles some periods, DEBUG=1 prints areas, GAPS=<km2> lists unclaimed land,
// SVG=<dir> draws each settled period to <dir>/<period>.svg, CACHE=<file> keeps the settled periods in a file and reads them back on the
// next run, so the page lists can be tried without settling again.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import os from 'os';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as turf from '@turf/turf';
import * as tc from 'topojson-client';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const T0 = Date.now();
const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storyYaml = yaml.load(fs.readFileSync(path.join(story, 'story.yaml'), 'utf8'));

// --- countries: decode the arcs, simplify each shared arc once, cut to the map ---
// the extent of story.yaml plus the 5 degree margin the build keeps; Natural Earth's Russia crosses the antimeridian,
// so every country is cut to this box
const BOX = [-83, 27, 63, 76.5];
const TOL = 0.02;   // about 2 km; the build's corner rounding multiplies every point sixteenfold
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
// the story's land without the Americas, where no zone goes
const LAND_NAMES = storyYaml.land.filter(n => n !== 'Canada');
// a ring that crosses the antimeridian jumps from 180 to -180; shifting the far side by 360 keeps the ring whole, where
// a plain cut would draw a band of land across the map between the two jumps
const unwrap = ring => { let shift = 0; const r = ring.map((p, i) => { if (i && Math.abs(p[0] - ring[i - 1][0]) > 180) shift -= Math.sign(p[0] - ring[i - 1][0]) * 360; return [p[0] + shift, p[1]]; }); const k = Math.min(...r.map(p => p[0])) < -180 ? 360 : 0; return k ? r.map(p => [p[0] + k, p[1]]) : r; };
const COUNTRY = {};
for (const f of tc.feature(world, world.objects.countries).features) {
  if (!LAND_NAMES.includes(f.properties.name)) continue;
  const g0 = f.geometry, whole = (g0.type === 'Polygon' ? [g0.coordinates] : g0.coordinates).map(p => p.map(unwrap));
  const g = turf.bboxClip(turf.multiPolygon(whole), BOX).geometry;
  const polys = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map(p => p.filter(r => r.length >= 4)).filter(p => p.length && turf.area(turf.polygon(p)) > 1e5);
  if (polys.length) COUNTRY[f.properties.name] = polys.length === 1 ? turf.polygon(polys[0]) : turf.multiPolygon(polys);
}
for (const n of LAND_NAMES) if (!COUNTRY[n] && !['Monaco', 'Vatican', 'San Marino', 'Liechtenstein', 'Gibraltar', 'Andorra', 'Malta'].includes(n)) throw new Error(`no land for ${n}`);

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
const C = (...names) => U(names.map(n => COUNTRY[n] ?? null));
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
// a rounded area around a point, rx and ry degrees across
const blob = ([x, y], rx, ry = rx) => poly(...[...Array(24)].map((_, i) => [x + rx * Math.cos(i * Math.PI / 12), y + ry * Math.sin(i * Math.PI / 12)]));
// a corridor through open sea that joins islands to their state
const sea = (pts, km = 4) => turf.buffer(turf.lineString(pts), km, { units: 'kilometers' });
const rev = line => line.slice().reverse();
const km2 = f => f ? turf.area(f) / 1e6 : 0;
const pieces = g => !g ? [] : g.geometry.type === 'Polygon' ? [g] : g.geometry.coordinates.map(c => turf.polygon(c));
const meets = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
for (const c of Object.values(COUNTRY)) c.bbox = turf.bbox(c);

// land and sea cut into tiles of two degrees, made when first asked for, so an operation near a shape only handles
// the pieces around it; the land is every country of the story, so a zone grows only into open sea
const TILE = 2, TILES = new Map();
const tileAt = (x, y) => {
  const k = `${x},${y}`;
  if (TILES.has(k)) return TILES.get(k);
  const t = turf.bboxPolygon([x, y, x + TILE, y + TILE]);
  const near = c => {
    const g = turf.bboxClip(c, [x - 0.01, y - 0.01, x + TILE + 0.01, y + TILE + 0.01]).geometry;
    const polys = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map(q => q.filter(r => r.length >= 4)).filter(q => q.length);
    return polys.length ? turf.multiPolygon(polys) : null;
  };
  const land = Object.values(COUNTRY).filter(c => meets(c.bbox, t.bbox)).flatMap(c => pieces(I(near(c), t)));
  const water = pieces(land.length ? turf.difference(fc([t, ...land])) : t);
  for (const q of [...land, ...water]) q.bbox = turf.bbox(q);
  const v = { land, sea: water };
  TILES.set(k, v);
  return v;
};
const tilesIn = ([w, s, e, n]) => {
  const out = [];
  for (let x = BOX[0] + Math.floor((Math.max(w, BOX[0]) - BOX[0]) / TILE) * TILE; x < Math.min(e, BOX[2]); x += TILE)
    for (let y = BOX[1] + Math.floor((Math.max(s, BOX[1]) - BOX[1]) / TILE) * TILE; y < Math.min(n, BOX[3]); y += TILE) out.push(tileAt(x, y));
  return out;
};
const box = (g, pad = 0.05) => { const [w, s, e, n] = turf.bbox(g); return [w - pad, s - pad, e + pad, n + pad]; };
const landNear = g => { const b = box(g); return tilesIn(b).flatMap(t => t.land).filter(q => meets(q.bbox, b)); };
const seaNear = g => { const b = box(g); return tilesIn(b).flatMap(t => t.sea).filter(q => meets(q.bbox, b)); };
const BOXPOLY = turf.bboxPolygon(BOX);
const landOf = g => D(I(g, BOXPOLY), seaNear(g));
const isLand = pt => tilesIn([pt[0], pt[1], pt[0] + 1e-6, pt[1] + 1e-6]).some(t => t.land.some(q => turf.booleanPointInPolygon(pt, q)));
// the piece of a country's land that holds a point, such as an island
const island = (name, pt) => pieces(COUNTRY[name]).find(q => turf.booleanPointInPolygon(pt, q));
const at = g => turf.centroid(g).geometry.coordinates.map(c => c.toFixed(2)).join(', ');
if (process.env.DEBUG) console.log(`setup ${((Date.now() - T0) / 1000).toFixed(1)} s`);

// --- Britain ---
const UK = C('United Kingdom');
const GB = pieces(UK).sort((a, b) => km2(b) - km2(a))[0];
const UK_ISLES = D(UK, GB);
// Northumbria's southern border: the Humber, across the Pennines to the Mersey
const HUMBER = [[0.6, 53.55], [0.0, 53.6], [-0.15, 53.65], [-0.3, 53.72], [-0.45, 53.71], [-0.6, 53.71], [-0.7, 53.7]];
const MERSEY = [[-2.05, 53.38], [-2.35, 53.4], [-2.6, 53.39], [-2.8, 53.35], [-2.95, 53.38], [-3.02, 53.44], [-3.15, 53.5], [-3.4, 53.55]];
const HUMBER_MERSEY = [...HUMBER, [-0.9, 53.55], [-1.2, 53.48], [-1.5, 53.42], [-1.8, 53.42], ...MERSEY];
// Offa's Dyke, from the Dee to the Severn
const OFFA = [[-3.4, 53.42], [-3.2, 53.33], [-3.05, 53.22], [-2.95, 53.12], [-3.05, 53.0], [-3.08, 52.8], [-3.1, 52.6], [-3.1, 52.4], [-3.05, 52.2], [-2.95, 52.05],
  [-2.85, 51.9], [-2.7, 51.75], [-2.65, 51.6], [-2.75, 51.5]];
const TAMAR = [[-4.15, 50.25], [-4.18, 50.4], [-4.25, 50.55], [-4.33, 50.7], [-4.45, 50.85], [-4.55, 50.95], [-4.75, 51.1]];
// Wessex against Mercia in Offa's time: the Bristol Avon, the Kennet to Reading, the west of Surrey and Sussex
const WESSEX_790_N = [[-3.2, 51.4], [-2.75, 51.5], [-2.55, 51.45], [-2.36, 51.38], [-2.15, 51.45], [-2.0, 51.55], [-1.75, 51.55], [-1.45, 51.42], [-1.2, 51.42], [-0.97, 51.45],
  [-0.85, 51.3], [-0.82, 51.1], [-0.9, 50.95], [-0.93, 50.82], [-0.95, 50.6]];
// the Thames, Wessex's border from 825
const THAMES = [[-3.2, 51.4], [-2.75, 51.5], [-2.55, 51.45], [-2.36, 51.38], [-2.15, 51.45], [-2.0, 51.6], [-1.8, 51.68], [-1.5, 51.7], [-1.25, 51.73], [-1.1, 51.6], [-0.97, 51.48],
  [-0.7, 51.5], [-0.5, 51.45], [-0.3, 51.47], [-0.1, 51.5], [0.0, 51.5], [0.1, 51.5], [0.4, 51.47], [0.7, 51.49], [1.0, 51.53]];
// Essex: the Lea and the Stort, then the Stour against East Anglia
const ESSEX_W = [[0.0, 51.5], [-0.02, 51.62], [-0.03, 51.72], [0.05, 51.8], [0.16, 51.87], [0.3, 51.98], [0.4, 52.05]];
const STOUR = [[0.4, 52.05], [0.7, 52.03], [0.95, 51.97], [1.15, 51.95], [1.4, 51.93]];
// East Anglia against Mercia, through the Wash and the Fens
const EANGLIA_W = [[0.2, 52.95], [0.2, 52.7], [0.15, 52.45], [0.2, 52.3], [0.3, 52.15], [0.4, 52.05]];
// the treaty of Alfred and Guthrum: up the Lea, to Bedford, up the Ouse to Watling Street; then the Danelaw's edge north to the Mersey
const DANELAW_LINE = [[0.0, 51.5], [-0.02, 51.65], [-0.04, 51.75], [-0.15, 51.82], [-0.3, 51.86], [-0.42, 51.9], [-0.47, 52.13], [-0.6, 52.12], [-0.75, 52.08], [-0.85, 52.06],
  [-1.0, 52.18], [-1.15, 52.3], [-1.3, 52.42], [-1.45, 52.53], [-1.6, 52.6], [-1.7, 52.65], [-1.75, 52.8], [-1.8, 52.95], [-1.85, 53.1], [-1.95, 53.25], [-2.05, 53.38]];
// the Five Boroughs against the southern Danelaw
const FIVE_S = [[0.2, 52.95], [0.0, 52.75], [-0.3, 52.58], [-0.6, 52.52], [-1.0, 52.45], [-1.3, 52.42]];
// the Tees, York against Bernicia, across the Pennines to Morecambe Bay
const TEES = [[-0.9, 54.7], [-1.15, 54.62], [-1.35, 54.55], [-1.6, 54.52], [-1.85, 54.55], [-2.1, 54.6], [-2.35, 54.62], [-2.6, 54.45], [-2.85, 54.25], [-3.0, 54.05]];
// Cumbria's southern edge from the 10th century: the Duddon, the Eamont, the Rere Cross on Stainmore
const EAMONT = [[-3.5, 54.2], [-3.25, 54.28], [-3.0, 54.42], [-2.75, 54.6], [-2.45, 54.52], [-2.17, 54.5]];
// Bernicia against Strathclyde: the Pennines, the Cheviots, the Southern Uplands to the Forth
const BERN_STRATH = [[-2.17, 54.5], [-2.3, 54.75], [-2.45, 55.0], [-2.65, 55.15], [-2.95, 55.35], [-3.25, 55.55], [-3.45, 55.75], [-3.6, 55.9], [-3.68, 56.05]];
// the Tweed and the Cheviots, England's border from 1018
const TWEED = [[-1.9, 55.8], [-2.05, 55.77], [-2.25, 55.64], [-2.3, 55.55], [-2.2, 55.4], [-2.4, 55.3], [-2.55, 55.15], [-2.45, 55.0], [-2.3, 54.75], [-2.17, 54.5]];
// Strathclyde in the 8th and 9th centuries: the Clyde valley against Northumbrian Kyle and Lothian
const STRATH_790_S = [[-5.0, 55.72], [-4.6, 55.68], [-4.2, 55.62], [-3.85, 55.6], [-3.65, 55.75], [-3.62, 55.95], [-3.68, 56.05]];
const CLYDE_N = [[-4.9, 55.95], [-4.85, 56.1], [-4.75, 56.22], [-4.55, 56.25], [-4.3, 56.15], [-4.0, 56.1], [-3.75, 56.07]];
const FORTH = [[-3.75, 56.07], [-3.68, 56.05], [-3.6, 56.04], [-3.4, 56.015], [-3.2, 56.025], [-3.0, 56.06], [-2.8, 56.12], [-2.5, 56.15], [-2.0, 56.2]];
// Caithness and Sutherland, the earls of Orkney's lands on the mainland
const CAITHNESS = [[-3.9, 58.8], [-3.85, 58.57], [-3.78, 58.35], [-3.65, 58.13], [-3.4, 58.0]];
const SUTHERLAND = [[-3.6, 57.8], [-4.0, 57.87], [-4.4, 57.92], [-4.8, 57.97], [-5.15, 57.92], [-5.8, 57.9]];

const WALES = poly(...OFFA, [-4.0, 51.3], [-6.0, 51.5], [-5.5, 52.5], [-5.0, 53.5]);
const CORNWALL = poly(...TAMAR, [-6.8, 51.1], [-6.8, 49.7], [-4.15, 49.9]);
const WESSEX_790 = poly(...WESSEX_790_N, [-1.5, 50.3], [-4.15, 50.1], ...TAMAR, [-4.0, 51.3]);
// the English side of the Channel and the Strait of Dover
const CHANNEL = [[2.2, 52.5], [1.9, 51.45], [1.45, 51.0], [1.0, 50.6], [-1.0, 50.25], [-4.15, 50.0]];
const WESSEX_SOUTH = poly(...THAMES, ...CHANNEL.slice(1), ...TAMAR, [-4.0, 51.3]);
const ESSEX = poly(...ESSEX_W, ...STOUR.slice(1), [1.6, 51.7], ...rev(THAMES).slice(0, 4));
const EANGLIA = poly(...EANGLIA_W, ...STOUR.slice(1), [2.5, 52.0], [2.5, 53.2], [0.2, 53.2]);
// Mercia drawn rough: Wales, Wessex and East Anglia stand before it
const MERCIA_ROUGH = poly(...rev(HUMBER_MERSEY), ...CHANNEL.slice(0, 4), [-1.0, 50.5], [-3.0, 51.3]);
// England south of the Humber and the Mersey, rough in the same way
const SOUTH_ROUGH = poly(...rev(HUMBER_MERSEY), ...CHANNEL, [-6.8, 49.7], [-6.8, 51.1], [-4.0, 51.3], [-3.0, 51.3]);
const DANELAW_E = poly(...DANELAW_LINE, ...rev(HUMBER_MERSEY.slice(0, HUMBER_MERSEY.length - MERSEY.length)), [0.6, 53.55], [2.5, 53.2], [2.5, 51.7], [1.6, 51.7],
  ...rev(THAMES).slice(0, 4));
const FIVE_BOROUGHS = poly(...FIVE_S, ...DANELAW_LINE.slice(DANELAW_LINE.findIndex(p => p[0] === -1.3)), ...rev(HUMBER_MERSEY.slice(0, HUMBER_MERSEY.length - MERSEY.length)),
  [0.6, 53.55], [0.6, 53.0]);
// Deira: York's kingdom between the Humber and the Tees
const DEIRA = poly(...HUMBER_MERSEY, [-3.6, 53.9], ...rev(TEES), [0.5, 54.7], [0.6, 53.55]);
const NORTH_SEA_E = [[-2.0, 56.2], [-1.0, 56.0], [1.0, 55.5], [1.0, 54.7]];
// the sea west of Galloway, between Man, Ireland, Kintyre and Arran
const WEST_SEA = [[-4.3, 54.55], [-5.0, 54.5], [-5.35, 54.6], [-5.35, 54.9], [-5.2, 55.15], [-5.05, 55.45]];
const BERNICIA_ROUGH = poly(...TEES, [-3.7, 54.1], ...WEST_SEA, ...STRATH_790_S, ...FORTH.slice(2), ...NORTH_SEA_E);
// Northumbria before the Danes: Deira and Bernicia with Cumbria, Galloway and Kyle
const NORTHUMBRIA = poly(...HUMBER_MERSEY, [-3.7, 54.1], ...WEST_SEA, ...STRATH_790_S, ...FORTH.slice(2), ...NORTH_SEA_E, [1.0, 53.55]);
const STRATHCLYDE_790 = poly(...STRATH_790_S, ...rev(CLYDE_N));
// Strathclyde from the late 9th century: Cumbria to the Eamont, Galloway, Kyle and the Clyde
const STRATHCLYDE_910 = poly(...EAMONT, ...BERN_STRATH.slice(1), ...rev(CLYDE_N), [-5.0, 55.72], ...rev(WEST_SEA), [-3.9, 54.3]);
// Bernicia without Cumbria, from the Tees to the Forth
const BERNICIA_910 = poly(...TEES.slice(0, 6), ...BERN_STRATH, ...FORTH.slice(2), ...NORTH_SEA_E);
// York from the late 9th century, north to the Eamont in the west
const YORK_910 = poly(...HUMBER_MERSEY, [-3.6, 53.9], ...EAMONT, ...rev(TEES.slice(0, 6)), [0.5, 54.7], [0.6, 53.55]);
const DALRIATA = poly([-7.5, 55.6], [-6.4, 55.48], [-5.95, 55.35], [-5.6, 55.15], [-5.3, 55.35], [-5.05, 55.55], [-5.0, 55.72], [-4.9, 55.95], [-4.85, 56.1], [-4.75, 56.22], [-4.7, 56.4], [-4.75, 56.6],
  [-4.95, 56.8], [-5.3, 56.9], [-5.8, 56.85], [-6.3, 56.8], [-7.3, 56.75]);
// Scotland north of the Forth and the Clyde, with Kintyre and Arran, drawn rough
const IRISH_SEA_N = [[-10, 55.48], [-6.4, 55.48], [-5.95, 55.35], [-5.6, 55.15]];
const SCOT_N = poly(...IRISH_SEA_N, [-5.2, 55.15], [-5.05, 55.45], [-5.0, 55.72], ...CLYDE_N, ...FORTH.slice(1), [-1.0, 56.0], [0.5, 57.0], [0.5, 61.5], [-10, 61.5]);
// Scotland from the Tweed and the Eamont, with Lothian, Cumbria and Galloway, drawn rough
const SCOT_TWEED = poly(...IRISH_SEA_N, ...WEST_SEA.slice(0, 4).reverse(), [-3.9, 54.3], ...EAMONT, ...rev(TWEED).slice(1), [-1.0, 56.0], [0.5, 57.0], [0.5, 61.5], [-10, 61.5]);
// the Hebrides, the Norse Isles; Kintyre, Arran and Bute stay with the mainland
const HEBRIDES = I(UK_ISLES, poly([-9.5, 55.5], [-6.3, 55.45], [-5.55, 55.55], [-5.55, 56.1], [-5.3, 56.5], [-5.5, 57.2], [-5.6, 57.7], [-6.0, 58.2], [-6.2, 58.7], [-7.5, 58.9],
  [-9.5, 58.5]));
const MAN = C('Isle of Man');
const SEA_MAN = sea([[-4.4, 54.42], [-4.9, 54.6], [-5.3, 54.85], [-5.6, 55.05], [-5.98, 55.27], [-6.1, 55.55]]);
const ORKNEY_870 = poly(...CAITHNESS, [-3.0, 58.0], [0.5, 59.0], [0.5, 61.2], [-3.0, 61.2], [-4.2, 59.4]);
const ORKNEY_990 = poly(...rev(SUTHERLAND), [-3.0, 58.0], [0.5, 59.0], [0.5, 61.2], [-3.0, 61.2], [-5.5, 59.2], [-5.4, 58.4]);
const NORTHERN_ISLES = I(UK_ISLES, poly([-4.2, 58.7], [0.5, 58.7], [0.5, 61.2], [-3.0, 61.2], [-4.2, 59.4]));

// --- Ireland ---
const NI = I(UK, poly([-8.5, 54.0], [-5.3, 54.0], [-5.3, 55.0], [-6.0, 55.25], [-6.0, 55.45], [-8.5, 55.45]));
const IRELAND = U(C('Ireland'), NI);
const BANN = [[-6.75, 55.35], [-6.77, 55.17], [-6.6, 55.0], [-6.5, 54.82], [-6.45, 54.65], [-6.45, 54.48], [-6.38, 54.33], [-6.3, 54.15], [-6.15, 54.03], [-5.95, 53.98]];
const CONN_E = [[-8.6, 54.62], [-8.25, 54.47], [-8.0, 54.33], [-7.75, 54.15], [-7.55, 53.98], [-7.6, 53.85], [-7.85, 53.75], [-7.97, 53.6], [-7.95, 53.42], [-8.0, 53.25],
  [-8.22, 53.08]];
const CONN_S = [[-8.22, 53.08], [-8.5, 53.04], [-8.75, 53.08], [-8.95, 53.14], [-9.15, 53.2], [-9.5, 53.22]];
const MIDE_N = [[-5.9, 53.82], [-6.3, 53.84], [-6.7, 53.9], [-7.1, 53.92], [-7.4, 53.88], [-7.6, 53.85]];
const LEIN_N = [[-5.95, 53.3], [-6.4, 53.3], [-6.75, 53.35], [-7.05, 53.3], [-7.35, 53.25], [-7.65, 53.2], [-8.0, 53.25]];
const LEIN_W = [[-8.0, 53.25], [-7.8, 53.1], [-7.5, 53.0], [-7.2, 52.9], [-7.0, 52.7], [-6.95, 52.45], [-6.95, 52.25], [-6.98, 52.1], [-6.95, 51.95]];
const ULAID = I(IRELAND, poly(...BANN, [-5.0, 54.0], [-5.0, 55.4]));
const CONNACHT = I(IRELAND, poly(...CONN_E, ...CONN_S.slice(1), [-11.5, 53.0], [-11.5, 54.6]));
const MIDE = I(IRELAND, poly(...MIDE_N, ...CONN_E.slice(5, 10), ...rev(LEIN_N), [-5.5, 53.3], [-5.5, 53.82]));
const LEINSTER = I(IRELAND, poly(...LEIN_N, ...LEIN_W.slice(1), [-5.5, 51.9], [-5.5, 53.3]));
const MUNSTER = I(IRELAND, poly(...rev(LEIN_W), ...CONN_S, [-11.5, 53.0], [-11.5, 51.0], [-6.95, 51.0]));
// the Northern Uí Néill and the Airgialla, the north beyond the other provinces
const AILECH = I(IRELAND, poly(...rev(BANN), ...MIDE_N.slice(1), ...rev(CONN_E.slice(0, 6)), [-9.0, 55.6], [-6.75, 55.6]));
const DUBLIN = poly([-5.95, 53.2], [-6.2, 53.2], [-6.45, 53.3], [-6.5, 53.42], [-6.35, 53.55], [-6.15, 53.62], [-5.95, 53.6]);
const WATERFORD = blob([-7.08, 52.24], 0.2, 0.11);
const WEXFORD = blob([-6.45, 52.33], 0.18, 0.11);
const LIMERICK = blob([-8.65, 52.66], 0.2, 0.1);

// --- the North Atlantic ---
const FAROES = C('Faeroe Is.');
const ICELAND = C('Iceland');
const GREENLAND_E = I(C('Greenland'), poly([-48.6, 60.6], [-47.2, 61.5], [-45.2, 61.5], [-44.2, 60.6], [-44.4, 59.7], [-46.8, 60.0]));
const GREENLAND_W = I(C('Greenland'), poly([-52.6, 63.7], [-52.6, 64.95], [-49.9, 64.95], [-49.5, 64.2], [-50.2, 63.6]));
const ENGLAND_TWEED = poly(...TWEED, ...rev(EAMONT).slice(1), [-3.7, 53.8], ...OFFA.slice(1), [-4.0, 51.3], [-6.8, 51.1], [-6.8, 49.7], ...rev(CHANNEL), [1.0, 55.0]);
const ENGLAND_FORTH = U(SOUTH_ROUGH, YORK_910, BERNICIA_910);
// the border after Cumbria went to England in 1092: the Tweed, the Cheviots, the Liddel and the Solway
const BORDER_1092 = [[-1.9, 55.8], [-2.05, 55.77], [-2.25, 55.64], [-2.3, 55.55], [-2.2, 55.4], [-2.4, 55.3], [-2.65, 55.17], [-2.85, 55.05], [-3.05, 54.98], [-3.4, 54.88],
  [-3.6, 54.82], [-4.3, 54.55]];
const ENGLAND_1092 = poly(...BORDER_1092, [-3.9, 54.3], [-3.7, 53.8], ...OFFA.slice(1), [-4.0, 51.3], [-6.8, 51.1], [-6.8, 49.7], ...rev(CHANNEL), [1.0, 55.0]);
const SCOT_1092 = poly(...IRISH_SEA_N, ...WEST_SEA.slice(0, 4).reverse(), ...rev(BORDER_1092).slice(1), [-1.0, 56.0], [0.5, 57.0], [0.5, 61.5], [-10, 61.5]);

// --- Scandinavia ---
// the Eider, the Danish border with the Saxons, out past Fehmarn
const EIDER = [[8.3, 54.25], [8.85, 54.27], [9.1, 54.25], [9.4, 54.27], [9.67, 54.3], [9.9, 54.33], [10.12, 54.36], [10.25, 54.48], [11.5, 54.65]];
// Halland, Scania and Blekinge against the Götar and Småland
const DK_SE = [[11.7, 57.55], [12.1, 57.5], [12.55, 57.35], [13.05, 57.1], [13.4, 56.85], [13.5, 56.55], [13.9, 56.45], [14.4, 56.42], [14.9, 56.48], [15.45, 56.45],
  [15.85, 56.35], [16.15, 56.18], [16.3, 55.9]];
const DENMARK = U(C('Denmark'), I(C('Germany'), poly(...EIDER, [11.5, 55.5], [7.5, 55.5], [7.5, 54.25])), I(C('Sweden'), poly(...DK_SE, [16.3, 54.8], [11.0, 54.8], [11.0, 57.55])));
// the Norse in the north lived on the coast, the Sámi inland and beyond Tromsø
const NORSE_N = [[15.0, 64.0], [13.6, 64.2], [13.4, 64.8], [13.8, 65.4], [14.6, 66.3], [15.6, 66.9], [16.2, 67.4], [16.8, 67.9], [17.9, 68.4], [18.6, 68.9], [19.6, 69.3],
  [20.4, 69.6], [20.8, 70.4]];
const BOHUSLAN = I(C('Sweden'), poly([10.8, 57.6], [11.85, 57.68], [12.0, 57.9], [12.0, 58.3], [11.85, 58.7], [11.7, 59.15], [10.8, 59.15]));
const NORWAY = U(I(C('Norway'), poly(...NORSE_N, [21.5, 71.5], [3, 71.5], [3, 57.5], [15.0, 57.5])), BOHUSLAN);
// the Svear against the Götar: Lake Vänern, Tiveden, the north of Lake Vättern and Kolmården
const SVEAR_GOTAR = [[11.6, 59.3], [12.4, 59.15], [13.2, 59.1], [13.9, 58.95], [14.6, 58.85], [15.1, 58.75], [15.6, 58.75], [16.2, 58.7], [16.7, 58.6], [17.2, 58.5]];
const SVEAR_N = [[12.0, 64.5], [13.5, 64.5], [14.5, 64.3], [15.5, 64.1], [16.5, 63.8], [17.5, 63.5], [18.5, 63.2], [19.3, 63.2]];
const SVEAR = I(C('Sweden', 'Åland'), poly(...SVEAR_GOTAR, [17.5, 58.0], [17.6, 57.0], [19.5, 56.7], [22.0, 57.5], [22.0, 63.2], ...rev(SVEAR_N), [11.0, 64.5], [11.0, 59.3]));
const GOTAR = I(C('Sweden'), poly([11.0, 59.3], ...SVEAR_GOTAR, [17.5, 58.0], [17.5, 56.0], [11.0, 56.0]));
const SWEDEN = I(C('Sweden', 'Åland'), poly([11.0, 55.0], [22.0, 55.0], [22.0, 63.2], ...rev(SVEAR_N), [11.0, 64.5]));
// the Finns against the Sámi, from the Gulf of Bothnia to the White Sea, then the White Sea itself
const FINN_N = [[23.0, 65.0], [25.5, 65.05], [27.0, 64.6], [28.5, 64.1], [30.0, 63.8], [31.5, 63.7], [33.0, 63.8], [34.5, 64.2], [35.2, 64.6]];
const WHITE_SEA = [[35.2, 64.6], [36.0, 65.2], [37.5, 65.6], [39.3, 65.8], [40.4, 66.2], [41.5, 66.8], [42.3, 67.6], [42.8, 68.4], [43.5, 69.5], [44.0, 72.0]];
const SEA_GOTLAND = sea([[18.4, 57.85], [18.1, 58.7]]);
const SAMI = poly([4.0, 62.0], [21.0, 62.0], ...FINN_N, ...WHITE_SEA, [4.0, 72.0]);

// --- Francia ---
// the treaty of Verdun, 843: the Scheldt, the Meuse uplands, the Saône and the Rhône between West and Middle Francia
const VERDUN_W = [[3.3, 51.65], [3.6, 51.42], [3.75, 51.2], [3.72, 51.05], [3.6, 50.85], [3.45, 50.7], [3.38, 50.55], [3.3, 50.35], [3.25, 50.18], [3.5, 50.0], [3.9, 49.85],
  [4.3, 49.7], [4.7, 49.5], [4.85, 49.2], [4.9, 48.9], [4.95, 48.6], [5.1, 48.3], [5.2, 48.0], [5.45, 47.7], [5.6, 47.45], [5.4, 47.2], [5.1, 46.95], [4.88, 46.78],
  [4.85, 46.4], [4.83, 46.0], [4.83, 45.75], [4.82, 45.5], [4.85, 45.2], [4.83, 44.9], [4.75, 44.55], [4.68, 44.2], [4.7, 43.95], [4.62, 43.7], [4.6, 43.5], [4.65, 43.2]];
const VW = pt => VERDUN_W.findIndex(q => q[0] === pt[0] && q[1] === pt[1]);
// the Ems, the Rhine with Mainz, Worms and Speyer to the east, and the Aare between Middle and East Francia
const VERDUN_E = [[7.0, 53.8], [7.15, 53.35], [7.25, 53.05], [7.15, 52.65], [7.0, 52.3], [6.8, 52.0], [6.62, 51.75], [6.7, 51.5], [6.77, 51.25], [6.95, 50.95], [7.1, 50.73],
  [7.35, 50.5], [7.6, 50.36], [7.7, 50.15], [7.9, 49.97], [7.7, 49.75], [7.6, 49.5], [7.7, 49.2], [8.0, 49.05], [8.2, 48.97], [7.95, 48.7], [7.8, 48.55], [7.65, 48.25],
  [7.58, 48.0], [7.55, 47.75], [7.59, 47.56], [7.5, 47.35], [7.45, 47.1], [7.55, 46.85], [7.75, 46.65], [8.1, 46.55], [8.45, 46.45]];
// Italy's northern border on the Alps, from Mont Blanc to the Kvarner
const ALPS_N = [[6.86, 45.83], [7.17, 45.87], [7.66, 45.98], [7.87, 45.94], [8.1, 46.25], [8.45, 46.45], [8.7, 46.45], [9.2, 46.45], [9.5, 46.35], [10.0, 46.4], [10.45, 46.55],
  [11.0, 46.4], [11.3, 46.35], [11.7, 46.45], [12.2, 46.6], [12.7, 46.65], [13.4, 46.55], [13.7, 46.5], [13.8, 46.2], [14.0, 45.9], [14.2, 45.6], [14.45, 45.33], [14.5, 45.2]];
const ALPS_N_E = ALPS_N.slice(5);   // from the Gotthard east
const ALPS_W = [[6.86, 45.83], [7.0, 45.6], [7.1, 45.3], [6.9, 45.0], [7.0, 44.7], [7.0, 44.3], [7.5, 44.1], [7.55, 43.78], [7.6, 43.6]];
// Burgundy beyond the Jura against Provence and Lyon
const BURG_S = [[4.85, 46.4], [5.3, 46.3], [5.75, 46.15], [6.1, 46.1], [6.5, 46.0], [6.86, 45.83]];
// the County of Burgundy against Lorraine and Alsace
const BURG_N = [[5.45, 47.7], [5.9, 47.85], [6.5, 47.9], [7.0, 47.65], [7.59, 47.56]];
// Italy against Benevento: the Liri and the Pescara
const ITALY_S = [[13.0, 41.25], [13.4, 41.6], [13.7, 41.85], [14.0, 42.1], [14.2, 42.4], [14.3, 42.55]];
// East Francia's eastern border: the Limes Saxoniae, the Elbe and the Saale, the Bohemian Forest, the Danube to Pannonia, the Drava
const LIMES = [[10.25, 54.48], [10.2, 54.3], [10.25, 54.1], [10.35, 53.9], [10.5, 53.7], [10.6, 53.5], [10.6, 53.37], [10.9, 53.2], [11.2, 53.1], [11.55, 53.0], [11.85, 52.85],
  [12.0, 52.65], [11.95, 52.4], [11.8, 52.2], [11.7, 52.05], [11.8, 51.85], [11.9, 51.6], [11.95, 51.35], [11.95, 51.1], [11.8, 50.85], [11.7, 50.6], [11.8, 50.4], [12.1, 50.3]];
const BOHEMIA_W = [[12.1, 50.3], [12.4, 50.1], [12.5, 49.8], [12.75, 49.45], [13.1, 49.2], [13.5, 48.95], [13.85, 48.75]];
const EAST_MARCH = [[13.85, 48.75], [14.4, 48.6], [15.0, 48.55], [15.6, 48.6], [16.2, 48.65], [16.95, 48.6], [16.98, 48.17]];
const PANNONIA = [[16.98, 48.17], [17.6, 47.9], [18.2, 47.75], [18.9, 47.8], [19.0, 47.5], [18.95, 47.0], [18.9, 46.5], [18.85, 46.0], [18.9, 45.55], [18.4, 45.75], [17.8, 45.9],
  [17.2, 46.15], [16.6, 46.35], [16.2, 46.4], [15.6, 45.85], [15.3, 45.6], [14.8, 45.45], [14.45, 45.33]];
// the Bavarian border with the Avars on the Enns, Carantania and Istria, before 796
const ENNS = [[13.85, 48.75], [14.4, 48.4], [14.5, 48.2], [14.6, 47.8], [14.9, 47.4], [15.3, 47.0], [15.5, 46.5], [15.3, 46.0], [14.9, 45.6], [14.45, 45.33]];
const EAST_843 = [...LIMES, ...BOHEMIA_W.slice(1), ...EAST_MARCH.slice(1), ...PANNONIA.slice(1)];
const EAST_790 = [...LIMES, ...BOHEMIA_W.slice(1), ...ENNS.slice(1)];
// Brittany: the Breton lands west of the march of Rennes and Nantes, then with them from 851, with the Cotentin from 867
const BRET_W = [[-1.95, 48.75], [-2.0, 48.45], [-2.05, 48.15], [-2.05, 47.8], [-2.1, 47.62], [-2.35, 47.5], [-2.55, 47.35]];
const BRET_E = [[-1.55, 48.75], [-1.52, 48.6], [-1.25, 48.5], [-1.05, 48.35], [-1.05, 48.05], [-1.2, 47.8], [-1.05, 47.6], [-1.0, 47.4], [-1.25, 47.2], [-1.6, 47.05],
  [-2.0, 46.95], [-2.4, 46.8]];
const COTENTIN_E = [[-1.25, 48.5], [-1.0, 48.6], [-0.95, 48.8], [-1.05, 49.05], [-1.1, 49.25], [-1.1, 49.45]];
// Normandy: the Bresle and the Epte, the Avre; the Risle in 911, the Couesnon from 933
const NORM_E = [[1.3, 50.2], [1.38, 50.06], [1.6, 49.9], [1.75, 49.7], [1.72, 49.45], [1.62, 49.2], [1.5, 49.05], [1.3, 48.9], [1.0, 48.75]];
const NORM_911_W = [[1.0, 48.75], [0.8, 48.85], [0.6, 49.0], [0.5, 49.2], [0.42, 49.38], [0.25, 49.44], [0.0, 49.45]];
const NORM_S = [[1.0, 48.75], [0.75, 48.65], [0.4, 48.55], [0.1, 48.45], [-0.3, 48.5], [-0.65, 48.5], [-1.0, 48.5], [-1.25, 48.5]];
// the Pyrenees and the Spanish March to the Llobregat
const PYRENEES = [[-1.8, 43.45], [-1.6, 43.25], [-1.35, 43.1], [-1.0, 43.0], [-0.7, 42.9], [-0.3, 42.8], [0.1, 42.7]];
const MARCH_S = [[0.1, 42.7], [0.35, 42.45], [0.6, 42.25], [0.9, 42.1], [1.2, 42.0], [1.5, 41.95], [1.8, 41.75], [1.95, 41.5], [2.12, 41.3], [2.15, 41.0]];
const LION = [[2.15, 41.0], [2.6, 41.3], [3.5, 41.8], [3.6, 42.6], [4.65, 43.2]];

const WEST_FRANCIA = poly(...VERDUN_W, ...rev(LION).slice(1), ...rev(MARCH_S).slice(1), ...rev(PYRENEES).slice(1), [-2.5, 44.5], [-5.5, 47.0], [-5.5, 49.0], [-1.5, 50.0],
  [1.0, 50.8], [2.5, 51.3]);
const MIDDLE_N = [[4.0, 52.5], [6.5, 53.8]];
const MIDDLE_FRANCIA = poly(...VERDUN_E, ...ALPS_N_E.slice(1), [14.2, 45.0], [13.8, 44.6], [14.6, 42.6], ...rev(ITALY_S), [12.5, 41.0], [9.5, 43.8], [6.0, 42.8], [4.65, 43.2],
  ...rev(VERDUN_W).slice(1), ...MIDDLE_N);
const EAST_FRANCIA = poly(...VERDUN_E, ...ALPS_N_E.slice(1, -1), ...rev(EAST_843), [9.5, 55.0], [8.0, 54.6]);
const EAST_FRANCIA_790 = poly(...VERDUN_E, ...ALPS_N_E.slice(1, -1), ...rev(EAST_790), [9.5, 55.0], [8.0, 54.6]);
const LOTHARINGIA = poly(...VERDUN_E, ...rev(ALPS_N.slice(0, 6)).slice(1), ...rev(BURG_S).slice(1), ...rev(VERDUN_W.slice(0, VW([4.85, 46.4]))), ...MIDDLE_N);
const LOTHARINGIA_N = poly(...VERDUN_E.slice(0, -6), ...rev(BURG_N).slice(1), ...rev(VERDUN_W.slice(0, VW([5.45, 47.7]))), ...MIDDLE_N);
const UPPER_BURGUNDY = poly(...BURG_N, ...VERDUN_E.slice(-6), ...rev(ALPS_N.slice(0, 6)).slice(1), ...rev(BURG_S).slice(1), ...VERDUN_W.slice(VW([4.88, 46.78]), VW([5.45, 47.7])));
const PROVENCE = poly(...BURG_S, ...ALPS_W.slice(1), [6.0, 42.8], ...rev(VERDUN_W.slice(VW([4.85, 46.4]))).slice(0, -1));
const ITALY = poly(...ALPS_N, [14.2, 45.0], [13.8, 44.6], [14.6, 42.6], ...rev(ITALY_S), [12.5, 41.0], [9.5, 43.8], ...rev(ALPS_W));
const BRITTANY_W = poly(...BRET_W, [-3.0, 46.8], [-5.5, 47.0], [-5.5, 49.0], [-2.0, 49.0]);
const BRITTANY = poly(...BRET_E, [-2.6, 46.6], [-5.5, 46.8], [-5.5, 49.0], [-1.6, 49.0]);
const COTENTIN = poly(...COTENTIN_E, [-1.0, 49.9], [-2.8, 49.9], [-2.8, 48.75], [-1.55, 48.75], [-1.52, 48.6]);
const NORMANDY_911 = poly(...NORM_E, ...NORM_911_W.slice(1), [0.0, 49.8]);
const NORMANDY = poly(...NORM_E, ...NORM_S.slice(1), [-1.52, 48.6], [-1.55, 48.75], [-2.8, 48.75], [-2.8, 49.9], [-1.0, 49.9], [0.0, 49.8]);

// --- Iberia and the Maghreb ---
const AST_790 = [[-9.1, 41.87], [-8.5, 42.05], [-8.0, 42.2], [-7.4, 42.35], [-6.8, 42.45], [-6.2, 42.55], [-5.6, 42.7], [-5.0, 42.8], [-4.4, 42.85], [-3.8, 42.85], [-3.3, 42.9],
  [-2.85, 42.95], [-2.6, 43.1], [-2.45, 43.5]];
const AST_843 = [[-9.1, 41.87], [-8.5, 42.0], [-8.0, 42.1], [-7.4, 42.25], [-6.8, 42.35], [-6.2, 42.4], [-5.6, 42.5], [-5.0, 42.6], [-4.4, 42.7], [-3.8, 42.75], [-3.3, 42.8],
  [-2.85, 42.85], [-2.45, 42.75]];
// Asturias after Ordoño I resettled León, Astorga and Tui
const AST_860 = [[-9.1, 41.87], [-8.5, 41.95], [-7.9, 41.95], [-7.3, 42.0], [-6.7, 42.1], [-6.1, 42.25], [-5.6, 42.35], [-5.0, 42.45], [-4.4, 42.5], [-3.8, 42.6], [-3.3, 42.7],
  [-2.85, 42.8], [-2.45, 42.75]];
// León and Castile against the caliphate about 1000, the Duero and its southern hills
const LEON_S = [[-9.0, 41.0], [-8.5, 41.0], [-8.0, 41.05], [-7.3, 41.1], [-6.7, 41.3], [-6.0, 41.4], [-5.5, 41.4], [-4.9, 41.5], [-4.3, 41.6], [-3.7, 41.6], [-3.2, 41.65],
  [-2.8, 41.8], [-2.6, 41.95]];
const NAVARRE_W = [[-2.6, 43.5], [-2.7, 43.0], [-2.9, 42.6], [-3.0, 42.3], [-2.6, 41.95]];
const PAMPLONA_W = [[-2.4, 43.5], [-2.45, 43.05], [-2.45, 42.75]];
const IBERIA_N = [[-2.0, 44.0], [-10.0, 44.0]];
const ASTURIAS_790 = poly(...AST_790, ...IBERIA_N);
const ASTURIAS_843 = poly(...AST_843, ...rev(PAMPLONA_W).slice(1), ...IBERIA_N);
const ASTURIAS_860 = poly(...AST_860, ...rev(PAMPLONA_W).slice(1), ...IBERIA_N);
const PAMPLONA = poly(...PAMPLONA_W, [-2.0, 42.6], [-1.5, 42.45], [-0.9, 42.4], [-0.3, 42.45], ...rev(PYRENEES.slice(0, 6)));
const LEON = poly(...LEON_S, ...rev(NAVARRE_W).slice(1), ...IBERIA_N);
const NAVARRE = poly(...NAVARRE_W, [-1.8, 42.15], [-1.2, 42.25], [-0.6, 42.3], [0.0, 42.4], ...MARCH_S.slice(1, 2).reverse(), ...rev(PYRENEES));
const IBERIA = poly([-10.0, 44.0], [3.5, 44.0], [5.0, 39.5], [-2.0, 36.6], [-5.4, 35.95], [-10.0, 36.0]);
const BALEARIC_SEA = [sea([[0.2, 38.8], [1.3, 38.95]]), sea([[1.6, 39.05], [2.4, 39.45]])];
// the Rif coast of the emirate of Nekor, and the lines between the Idrisids, the Rustamids and Ifriqiya
const NEKOR = poly([-5.2, 35.5], [-2.2, 35.4], [-2.2, 34.95], [-3.3, 34.8], [-4.4, 34.85], [-5.2, 35.05]);
const MAGHREB_W = [[-0.7, 36.0], [-0.85, 35.2], [-1.0, 34.3], [-1.3, 33.0], [-1.6, 31.5], [-2.0, 30.0]];
const MAGHREB_E = [[5.3, 37.0], [5.2, 36.0], [4.8, 35.0], [4.5, 34.0], [4.5, 32.0], [5.0, 30.0]];
const MOROCCO = poly([-11.0, 36.0], [-5.4, 35.95], [-2.0, 36.0], ...MAGHREB_W, [-11.0, 30.0]);
const ALGERIA_W = poly(...MAGHREB_W, ...rev(MAGHREB_E), [2.0, 37.3]);
const IFRIQIYA = poly(...MAGHREB_E, [19.0, 29.0], [19.5, 31.5], [16.0, 34.0], [12.0, 37.6], [9.0, 37.6]);
const CYRENAICA = poly([19.5, 31.5], [19.0, 29.0], [26.0, 29.0], [26.0, 33.5], [21.0, 33.5]);

// --- Italy and the Mediterranean ---
const BENEVENTO = poly(...ITALY_S, [16.5, 42.2], [19.0, 40.5], [16.5, 38.0], [15.0, 40.0], [13.0, 41.0]);
const SICILY = island('Italy', [14.0, 37.5]);
const CALABRIA = D(poly([15.8, 39.5], [16.3, 39.25], [16.8, 39.25], [17.2, 39.35], [17.5, 38.5], [16.0, 37.6], [15.5, 37.8], [15.4, 38.6]), SICILY);
const OTRANTO = poly([17.85, 40.3], [18.6, 40.4], [18.7, 39.7], [17.85, 39.9]);
const SICILY_E = poly([15.0, 38.0], [15.4, 38.0], [15.4, 36.6], [14.6, 36.6], [14.7, 37.1], [14.9, 37.5]);
const BARI = poly([16.2, 41.45], [17.3, 41.3], [18.3, 40.75], [18.65, 40.35], [17.85, 40.3], [17.85, 40.0], [17.2, 40.2], [16.9, 40.5], [16.3, 40.8], [15.9, 41.1]);
const SARDINIA = island('Italy', [9.0, 40.0]);
const CORSICA = island('France', [9.1, 42.2]);
const CRETE = island('Greece', [24.9, 35.2]);
const CYPRUS = C('Cyprus', 'N. Cyprus');
const SEA_SALENTO = sea([[17.2, 39.4], [18.0, 39.9]]);
const SEA_CORFU = sea([[18.6, 40.0], [19.6, 39.75]]);
const SEA_IONIAN = sea([[20.1, 39.38], [20.35, 39.0], [20.6, 38.85]]);
const SEA_CRETE = sea([[23.2, 36.4], [23.6, 35.6]]);

// --- the Baltic, the Slavs and the Finnic peoples ---
const BALT_FINN = [[21.5, 57.7], [22.3, 57.83], [23.5, 57.75], [24.3, 57.88], [25.0, 57.9], [25.8, 57.85], [26.5, 57.6], [27.2, 57.55], [27.5, 57.55]];
// the Prussians, Yotvingians and Lithuanians against the Pomeranians, Masovians and the Krivichs and Dregovichs
const BALT_SLAV = [[18.9, 54.45], [19.0, 54.3], [19.3, 53.95], [19.8, 53.65], [20.5, 53.45], [21.5, 53.35], [22.5, 53.25], [23.8, 53.1], [25.0, 53.3], [26.2, 53.7], [27.0, 54.4],
  [27.5, 55.3], [28.0, 56.0], [28.0, 56.8], [27.5, 57.55]];
// the East Slavs against the Ests, Votes, Vepsians, Merya and Muroma in the 8th and 9th centuries
const SLAV_FINN = [[27.5, 57.55], [27.6, 57.9], [27.5, 58.3], [27.6, 58.9], [28.1, 59.2], [28.5, 59.1], [29.5, 59.0], [30.5, 59.3], [31.4, 59.6], [31.9, 60.0], [32.4, 60.3],
  [32.8, 60.3], [33.5, 59.9], [34.5, 59.4], [35.5, 58.8], [36.5, 58.0], [37.0, 57.2], [37.5, 56.5], [38.5, 55.8], [39.5, 55.0], [40.2, 54.2], [40.5, 53.2], [40.5, 52.2]];
const BALTS = poly(...BALT_SLAV, ...rev(BALT_FINN).slice(1), [20.5, 56.5], [19.5, 55.0]);
// the Finnic peoples from the Gulf of Finland to the Urals, Finland north to the Sámi
const FINNIC_S = [[63.0, 56.5], [57.5, 55.5], [54.0, 54.5], [52.0, 52.5], [48.0, 51.0], [44.0, 50.5], [40.5, 50.5]];
const FINNIC = poly(...rev(BALT_FINN), [21.0, 59.0], [20.3, 60.0], [21.0, 61.5], [21.5, 63.0], ...FINN_N, ...WHITE_SEA, [63.0, 72.0], ...FINNIC_S, ...rev(SLAV_FINN));
// the Slavs from the Elbe to the Oka and down to the Adriatic and the Aegean, cut by every state that stands before them
const SLAVS = poly([10.0, 54.6], [10.0, 50.0], [13.0, 47.5], [14.0, 45.3], [13.0, 44.0], [19.0, 40.0], [20.5, 38.5], [24.0, 37.0], [27.0, 40.5], [29.0, 41.5], [30.0, 45.5],
  [33.0, 46.0], [40.5, 50.5], ...rev(SLAV_FINN), ...rev(BALT_SLAV).slice(1), [18.5, 55.0], [14.0, 55.0], [11.5, 54.7]);
// the Obotrites, the Franks' allies on the Baltic, between the Limes and the Warnow
const OBOTRITES = poly([10.25, 54.48], ...LIMES.slice(1, 8), [11.6, 53.2], [12.2, 53.5], [12.3, 54.0], [12.2, 54.4], [11.0, 54.6]);

// --- the steppe and the Rus' ---
const KHAZAR_N = [[31.3, 46.55], [32.2, 46.8], [33.2, 47.4], [34.2, 48.0], [35.2, 48.7], [36.2, 49.4], [37.2, 50.1], [38.3, 50.6], [39.6, 50.9], [41.0, 51.1], [43.0, 51.3],
  [45.0, 51.4], [46.8, 51.6], [48.5, 52.0], [50.5, 51.8], [51.4, 51.3]];
const KHAZAR_E = [[51.4, 51.3], [51.5, 50.0], [51.8, 48.5], [52.0, 47.0], [52.0, 45.8]];
// the main ridge of the Caucasus, from the Caspian north of Derbent to the Black Sea at the Psou
const CAUCASUS = [[48.8, 42.15], [48.2, 42.05], [47.8, 41.5], [47.3, 41.3], [46.7, 41.7], [46.2, 41.95], [45.7, 42.2], [45.2, 42.6], [44.6, 42.75], [43.9, 42.75], [43.2, 42.95],
  [42.5, 43.2], [41.6, 43.3], [40.8, 43.45], [40.0, 43.4], [39.9, 43.3]];
const BLACK_SEA_N = [[38.5, 44.0], [36.8, 44.3], [35.5, 44.2], [33.0, 44.0], [32.3, 45.3], [31.0, 46.0]];
const KHAZARIA = poly(...KHAZAR_N, ...KHAZAR_E.slice(1), [50.0, 44.5], [49.5, 42.8], ...CAUCASUS, ...BLACK_SEA_N);
// the lower Don, the Khazars' western border once the Pechenegs held the steppe
const DON = [[38.0, 46.4], [39.2, 47.1], [39.8, 47.3], [40.5, 47.6], [41.5, 48.0], [42.5, 48.6], [43.0, 49.5], [42.5, 50.5], [42.0, 51.2]];
const KHAZARIA_900 = poly(...DON, [43.0, 51.3], ...KHAZAR_N.slice(12), ...KHAZAR_E.slice(1), [50.0, 44.5], [49.5, 42.8], ...CAUCASUS, [38.5, 44.0], [35.0, 44.3], [35.5, 45.3],
  [36.8, 46.0]);
const CHERSON = poly([33.3, 44.35], [33.9, 44.35], [33.9, 44.75], [33.4, 44.75]);
const SEA_CHERSON = sea([[33.6, 44.35], [34.9, 42.2]]);
const VOLGA_BULGARIA = poly([46.8, 55.0], [47.6, 56.2], [49.5, 56.6], [51.5, 56.5], [53.2, 55.8], [53.4, 54.5], [52.5, 53.4], [50.5, 52.9], [48.5, 53.1], [47.3, 53.8]);
// the Pannonian basin of the Avars before 796
const AVARS = poly([14.5, 48.25], [15.4, 48.55], [16.9, 48.6], [17.9, 48.25], [19.2, 48.15], [20.6, 48.25], [21.8, 48.1], [22.5, 47.5], [22.4, 46.7], [21.8, 46.0], [21.2, 45.35],
  [20.5, 44.85], [19.5, 44.9], [18.5, 45.1], [17.4, 45.45], [16.4, 45.85], [15.6, 46.2], ...ENNS.slice(1, -3).reverse());
// the Magyars in Etelköz, between the Siret and the Dnieper
const ETELKOZ = poly([27.1, 45.6], [26.6, 46.2], [26.2, 47.0], [26.0, 47.7], [26.3, 48.2], [27.5, 48.0], [29.0, 48.2], [30.5, 48.7], [31.5, 49.2], [33.0, 49.3], [34.2, 48.0],
  [33.2, 47.4], [32.2, 46.8], [31.3, 46.55], [30.8, 46.0], [29.7, 45.2], [28.8, 45.25], [28.2, 45.3], [27.8, 45.4]);
// the Pechenegs from the Siret to the Don after 895
const PECHENEGS = poly([27.1, 45.6], [26.6, 46.2], [26.2, 47.0], [26.0, 47.7], [26.3, 48.2], [27.5, 48.0], [29.0, 48.2], [30.5, 48.7], [31.5, 49.2], [33.0, 49.3], [34.5, 49.5],
  [36.0, 49.9], [37.5, 50.3], [39.0, 50.6], [40.5, 50.9], [42.0, 51.2], ...rev(DON), [36.8, 46.0], [35.5, 45.3], [35.0, 44.3], [33.0, 44.0], [32.3, 45.3], [31.0, 46.0],
  [29.7, 45.2], [28.8, 45.25], [28.2, 45.3], [27.8, 45.4]);
// the Pechenegs about 1000, from the Danube to the Volga, and the Oghuz beyond
const PECHENEGS_1000 = poly([22.6, 44.55], [23.0, 45.2], [24.0, 45.4], [25.3, 45.5], [26.0, 45.8], [26.0, 46.5], [25.5, 47.2], [24.8, 47.7], [26.0, 48.3], [27.5, 48.1], [29.0, 48.6], [30.5, 49.2], [32.0, 49.6], [33.5, 49.8], [34.8, 50.3],
  [36.5, 51.5], [38.5, 52.6], [40.5, 52.6], [44.0, 52.0], [47.0, 51.5], [47.5, 49.0], [48.5, 45.0], [47.8, 43.6], [46.5, 43.6], [45.6, 43.3], [45.0, 44.0], [43.5, 44.5], [41.5, 44.6], [39.8, 44.4], [38.5, 44.0], [35.0, 44.3],
  [33.0, 44.0], [32.3, 45.3], [31.0, 46.0], [29.7, 45.2], [28.8, 45.25], [28.2, 45.3], [27.0, 44.2], [25.5, 43.7], [24.45, 43.75], [23.6, 43.8], [22.6, 44.2]);
// the Oghuz, and the Bashkirs between Volga Bulgaria and the Urals
const OGHUZ = poly([47.5, 46.0], [47.5, 49.0], [47.0, 51.5], [50.5, 51.8], [52.0, 52.5], [54.0, 54.5], [57.5, 55.5], [63.0, 56.5], [63.0, 40.0], [58.0, 39.0], [55.5, 38.5], [53.4, 38.5], [52.5, 41.5],
  [50.0, 45.0], [49.0, 46.0]);
// the Kipchaks or Cumans held the whole steppe by the 1060s
const CUMANS = poly([22.6, 44.55], [23.0, 45.2], [24.0, 45.4], [25.3, 45.5], [26.0, 45.8], [26.0, 46.5], [25.5, 47.2], [24.8, 47.7], [26.0, 48.3], [27.5, 48.1], [29.0, 48.6], [30.5, 49.2], [32.0, 49.6], [33.5, 49.8], [34.8, 50.3],
  [36.5, 51.5], [38.5, 52.6], [40.5, 52.6], [44.0, 52.0], [47.0, 51.5], [50.5, 51.8], [52.0, 52.5], [54.0, 54.5], [57.5, 55.5], [63.0, 56.5], [63.0, 40.0], [58.0, 39.0],
  [55.5, 38.5], [53.4, 38.5], [52.5, 41.5], [50.0, 45.0], [48.5, 45.0], [47.8, 43.6], [46.5, 43.6], [45.6, 43.3], [45.0, 44.0], [43.5, 44.5], [41.5, 44.6], [39.8, 44.4], [38.5, 44.0], [35.0, 44.3], [33.0, 44.0], [32.3, 45.3], [31.0, 46.0], [29.7, 45.2],
  [28.8, 45.25], [28.2, 45.3], [27.0, 44.2], [25.5, 43.7], [24.45, 43.75], [23.6, 43.8], [22.6, 44.2]);
// the Rus' about Lake Ladoga and Lake Ilmen in the 9th century
const RUS_860 = poly([27.9, 59.6], [28.6, 60.0], [29.6, 60.15], [30.0, 60.1], [31.5, 60.9], [32.8, 61.0], [33.6, 60.4], [34.0, 59.5], [33.8, 58.6], [33.0, 57.8], [31.5, 57.5], [30.0, 57.8], [29.2, 58.4],
  [28.6, 59.0]);
// Oleg's Rus' from Ladoga to Kiev, with the tribes that paid him tribute
const RUS_NORTH = [[37.0, 60.5], [38.5, 60.0], [39.5, 59.0], [40.2, 58.0], [41.5, 56.8], [42.5, 55.8]];
const RUS_WEST = [...BALT_SLAV.slice(9), ...SLAV_FINN.slice(1, 5), [27.9, 59.6], [30.0, 60.2], [31.5, 61.0], [33.5, 61.0], [35.5, 60.8]];
const RUS_907 = poly(...RUS_NORTH, [41.5, 55.3], [39.5, 55.9], [37.5, 55.9], [35.5, 55.5], [34.2, 54.5], [33.8, 53.5], [34.5, 52.6], [35.3, 51.6], [34.6, 50.6], [33.0, 49.9],
  [31.5, 49.6], [30.2, 49.5], [29.0, 49.9], [27.6, 50.2], [26.5, 51.0], [25.5, 51.9], [25.4, 52.9], [26.2, 53.7], ...RUS_WEST);
const DREVLIANS = poly([27.6, 50.2], [29.0, 49.9], [29.8, 50.3], [30.2, 50.8], [30.0, 51.5], [28.5, 51.7], [27.3, 51.6], [26.6, 51.0]);
const VYATICHI = poly([35.5, 55.5], [37.5, 55.9], [39.5, 55.9], [41.5, 55.3], [40.5, 54.0], [38.5, 53.2], [36.5, 53.0], [35.0, 53.5], [34.2, 54.5]);
// Vladimir's Rus', with Volhynia, the Cherven towns and the Vyatichi, south to the forts on the Stugna and the Sula
const RUS_1000 = poly(...RUS_NORTH, [41.5, 55.3], [40.5, 54.0], [40.5, 52.6], [38.5, 52.6], [36.5, 51.5], [34.8, 50.3], [33.5, 49.8], [32.0, 49.6], [30.5, 49.2], [29.0, 48.6],
  [27.5, 48.1], [26.0, 48.3], [24.8, 47.7], [23.5, 48.0], [22.5, 49.0], [22.6, 49.5], [22.8, 50.0], [23.2, 50.5], [23.6, 51.0], [23.6, 51.6], [23.2, 52.2], [22.8, 52.7], [22.5, 53.25], ...BALT_SLAV.slice(7, 9),
  ...RUS_WEST);
const TMUTARAKAN = poly([36.5, 45.0], [37.6, 45.0], [37.8, 45.4], [37.2, 45.5], [36.5, 45.4]);

// --- Byzantium, Bulgaria and the Balkans ---
// the Taurus and Anti-Taurus, the frontier with the caliphate until the 930s
const BYZ_ARAB = [[34.25, 36.4], [34.2, 36.7], [34.5, 37.1], [35.0, 37.5], [35.6, 38.0], [36.3, 38.3], [37.2, 38.6], [37.9, 38.9], [38.8, 39.4], [39.7, 39.8], [40.6, 40.2],
  [41.3, 40.7], [41.6, 41.2], [41.55, 41.5]];
// the frontier after Melitene fell to the Byzantines in 934
const BYZ_ARAB_934 = [[34.25, 36.4], [34.2, 36.7], [34.5, 37.1], [35.0, 37.5], [35.8, 37.8], [36.5, 37.9], [37.5, 38.2], [38.5, 38.3], [39.3, 38.6], [40.0, 39.2], [40.8, 39.7],
  [41.3, 40.7], [41.6, 41.2], [41.55, 41.5]];
// after the conquests of Nikephoros Phokas and John Tzimiskes: Cilicia, Antioch, the upper Euphrates, Theodosiopolis
const BYZ_ARAB_970 = [[35.75, 35.3], [36.2, 35.4], [36.6, 35.9], [36.9, 36.4], [37.4, 36.9], [38.2, 37.3], [38.8, 37.6], [39.5, 38.1], [40.5, 38.5], [41.2, 39.2], [41.8, 40.0],
  [41.6, 40.7], [41.6, 41.2], [41.55, 41.5]];
// in 1066: Edessa, Vaspurakan, Ani and Kars
const BYZ_EAST_1066 = [[35.75, 35.3], [36.2, 35.4], [36.6, 35.9], [37.3, 36.2], [38.0, 36.6], [38.8, 37.0], [39.5, 37.4], [40.5, 37.9], [41.5, 38.4], [42.5, 38.4], [43.5, 38.2],
  [44.3, 38.6], [44.2, 39.4], [43.8, 40.2], [43.5, 40.9], [42.8, 41.4], [41.8, 41.5]];
const LEVANT = [[34.25, 36.4], [34.5, 36.2], [35.4, 35.8], [35.6, 35.0], [34.8, 33.0], [34.2, 31.3]];
// the Bulgar border with Byzantium in Thrace: Emine, the Erkesia dyke, Makrolivada
const BYZ_BULG = [[28.3, 42.75], [27.85, 42.75], [27.3, 42.55], [26.7, 42.4], [26.1, 42.2], [25.6, 42.0]];
const BULG_W_790 = [[25.6, 42.0], [25.0, 42.4], [24.4, 42.75], [23.8, 43.0], [23.3, 43.4], [22.9, 43.85], [22.65, 44.2], [22.6, 44.55]];
const BULG_N_790 = [[22.6, 44.55], [23.0, 45.2], [24.0, 45.4], [25.3, 45.5], [26.3, 45.65], [26.9, 46.05], [27.9, 46.45], [29.0, 46.5], [30.0, 46.35], [30.8, 46.0]];
// Wallachia, Bulgarian north of the Danube once the Magyars and Pechenegs held Moldavia
const BULG_N_860 = [[22.6, 44.55], [23.0, 45.2], [24.0, 45.4], [25.3, 45.5], [26.3, 45.65], [27.1, 45.6], [27.8, 45.4], [28.2, 45.3], [28.8, 45.25], [29.7, 45.2]];
// Byzantine Thrace, Thessalonica, Greece and the Albanian coast against the Slavs and Bulgaria
const BYZ_BALKAN_790 = [[25.6, 42.0], [25.0, 41.7], [24.3, 41.5], [23.6, 41.35], [23.0, 41.1], [22.6, 40.8], [22.3, 40.4], [22.0, 40.0], [21.6, 39.6], [21.3, 39.2], [20.9, 39.0],
  [20.3, 39.0]];
const BYZ_BALKAN_860 = [[25.6, 42.0], [25.0, 41.65], [24.3, 41.45], [23.6, 41.3], [23.0, 41.15], [22.6, 40.95], [22.2, 40.6], [21.8, 40.3], [21.3, 40.15], [20.8, 40.45],
  [20.3, 40.9], [20.2, 41.4], [20.0, 41.8], [19.6, 42.0], [19.2, 41.9]];
const BULG_W_860 = [[20.2, 41.4], [20.5, 42.0], [20.9, 42.6], [21.2, 43.2], [21.4, 43.8], [20.9, 44.4], [20.5, 44.8], [21.4, 44.75], [22.0, 44.6], [22.6, 44.55]];
const AEGEAN = [[19.2, 41.9], [19.0, 40.0], [20.0, 37.5], [22.0, 36.0], [26.0, 34.5], [29.0, 35.8], [32.0, 35.8], [34.25, 36.4]];
const BLACK_SEA_S = [[41.55, 41.5], [40.0, 42.0], [34.9, 42.4], [30.0, 42.5], [28.3, 42.75]];
const BYZANTIUM_790 = poly(...BYZ_ARAB, ...BLACK_SEA_S.slice(1), ...BYZ_BULG.slice(1), ...BYZ_BALKAN_790.slice(1), [19.5, 39.0], ...AEGEAN.slice(2));
const BYZANTIUM_860 = poly(...BYZ_ARAB, ...BLACK_SEA_S.slice(1), ...BYZ_BULG.slice(1), ...BYZ_BALKAN_860.slice(1), ...AEGEAN.slice(1));
const BULGARIA_790 = poly(...BYZ_BULG, ...BULG_W_790.slice(1), ...BULG_N_790.slice(1), [30.5, 44.0], [29.0, 42.8]);
const BULGARIA_860 = poly(...BYZ_BULG, ...BYZ_BALKAN_860.slice(1, 12), ...BULG_W_860.slice(1), ...BULG_N_860.slice(1), [30.5, 44.0], [29.0, 42.8]);
// Bulgaria's western border after Simeon, with Serbia and the inland of Albania
const BULG_W_945 = [[19.6, 42.0], [19.9, 42.5], [20.3, 43.0], [19.8, 43.6], [19.4, 44.3], [19.2, 44.9], [19.3, 45.2], [20.5, 44.8], [21.4, 44.75], [22.0, 44.6], [22.6, 44.55]];
const BULGARIA_945 = poly(...BYZ_BULG, ...BYZ_BALKAN_860.slice(1, 13), ...BULG_W_945, ...BULG_N_860.slice(1), [30.5, 44.0], [29.0, 42.8]);
// Bulgaria east of the Iskar, held by Sviatoslav's Rus' in 969 to 971 and by Byzantium after
const ISKAR = [[24.45, 43.75], [24.4, 43.3], [24.3, 42.9], [24.6, 42.6], [25.0, 42.4], [25.6, 42.0]];
const BULGARIA_EAST = poly([24.45, 43.75], [25.5, 43.7], [27.0, 44.2], [28.2, 45.3], [28.8, 45.25], [29.7, 45.2], [30.5, 44.0], [29.0, 42.8], ...BYZ_BULG, ...rev(ISKAR).slice(1));
// Samuel's Bulgaria about 1000: Macedonia, the Albanian inland and Dyrrachium, Thessaly's north, Sofia and Vidin
const BULGARIA_1000 = poly([19.2, 41.9], [19.0, 40.6], [19.5, 40.2], [20.3, 39.8], [21.0, 39.6], [21.5, 39.5], [22.0, 40.0], [22.5, 40.6], [23.0, 41.0], [23.6, 41.4], [24.2, 41.8],
  [24.4, 42.4], [24.3, 42.9], [24.4, 43.3], [24.45, 43.75], [23.6, 43.8], [22.6, 44.2], [22.0, 44.6], [21.4, 44.75], [20.5, 44.8], [19.8, 44.3], [20.2, 43.5], [20.4, 42.9],
  [19.9, 42.4], [19.6, 42.0]);
const SERBS = poly([17.0, 42.8], [17.6, 43.0], [17.8, 43.7], [18.4, 44.3], [19.0, 45.2], [19.5, 45.0], [20.5, 44.8], [21.3, 44.0], [20.9, 42.6], [20.0, 42.1], [19.6, 41.95],
  [19.2, 41.85], [18.0, 42.3]);
// Croatia drawn rough: the empire, Hungary and Bulgaria stand before it
const CROATIA = poly([14.45, 45.33], [15.0, 45.8], [15.5, 46.5], [16.4, 46.45], [16.6, 46.35], [17.2, 46.15], [17.8, 45.9], [18.4, 45.75], [18.9, 45.55], [19.3, 45.2], [19.0, 44.9],
  [18.4, 44.3], [17.8, 43.7], [17.6, 43.0], [17.0, 42.8], [16.0, 42.5], [13.0, 44.0], [14.0, 45.0]);
const BYZANTIUM_970 = poly(...BYZ_ARAB_970, ...BLACK_SEA_S.slice(1), ...BYZ_BULG.slice(1), ...BYZ_BALKAN_860.slice(1), [19.0, 40.0], [20.0, 37.5], [22.0, 36.0], [26.0, 34.5],
  [32.0, 34.0], [35.0, 35.0]);
const BYZANTIUM_1066 = poly(...BYZ_EAST_1066, [40.0, 42.0], [34.9, 42.4], [30.0, 42.5], [30.5, 44.0], [29.7, 45.2], [28.8, 45.25], [28.2, 45.3], [27.0, 44.2], [25.5, 43.7],
  [24.45, 43.75], [23.6, 43.8], [22.6, 44.2], [22.6, 44.55], [22.0, 44.6], [21.4, 44.75], [20.5, 44.8], [19.5, 45.0], [19.3, 44.3], [19.6, 43.3], [20.2, 43.5], [20.4, 42.9],
  [19.9, 42.4], [19.6, 42.0], [19.2, 41.9], [19.0, 40.0], [20.0, 37.5], [22.0, 36.0], [26.0, 34.5], [32.0, 34.0], [35.0, 35.0]);

// --- the Caucasus, Iran and the Near East ---
const ABKHAZIA = poly([43.9, 42.75], [43.6, 42.3], [43.4, 41.9], [43.0, 41.5], [42.5, 41.4], [41.6, 41.2], [41.55, 41.5], [40.5, 42.5], [39.9, 43.3], ...rev(CAUCASUS.slice(9)).slice(1));
// the Georgian lands north of Armenia, Abkhazia and Kartli to Kakheti
const GEORGIA_S = [[41.3, 40.7], [42.5, 41.0], [43.5, 41.1], [44.8, 41.1], [45.5, 41.0], [46.5, 41.2], [46.7, 41.7]];
const GEORGIA = poly(...GEORGIA_S, ...CAUCASUS.slice(4), [40.5, 42.5], [41.55, 41.5], [41.6, 41.2]);
const ARMENIA = poly(...GEORGIA_S.slice(0, 5), [46.0, 40.2], [45.8, 39.5], [44.8, 39.0], [44.0, 38.3], [43.0, 38.0], [42.0, 38.2], [41.0, 38.6], [40.6, 39.5], [40.6, 40.2]);
// Shirvan and Derbent, north of the Kura
// with Daghestan north of the ridge, which the Khazars held while they lasted
const SHIRVAN = U(poly([46.7, 41.7], [46.5, 41.2], [46.9, 40.8], [47.8, 40.4], [48.5, 40.0], [49.6, 39.2], [50.5, 40.5], [49.0, 42.0], ...CAUCASUS.slice(0, 5)),
  poly([45.2, 42.6], [45.6, 43.3], [46.5, 43.6], [47.8, 43.6], ...CAUCASUS.slice(0, 7)));
// Azerbaijan and Arran south of the Kura
const AZERBAIJAN = poly([45.5, 41.0], [46.5, 41.2], [46.9, 40.8], [47.8, 40.4], [48.5, 40.0], [49.6, 39.2], [48.9, 38.4], [48.6, 37.8], [48.5, 36.7], [47.0, 36.2], [46.0, 36.0],
  [45.2, 36.4], [44.5, 37.2], [44.0, 38.3], [44.8, 39.0], [45.8, 39.5], [46.0, 40.2]);
// Gilan, Daylam and Tabaristan between the Alborz and the Caspian
const CASPIAN_S = poly([48.9, 38.4], [48.6, 37.8], [49.5, 36.6], [50.5, 36.4], [51.5, 36.2], [52.5, 36.1], [53.5, 36.3], [54.5, 36.6], [55.5, 37.2], [55.5, 38.5], [53.4, 38.5],
  [52.0, 38.0], [50.0, 38.5]);
const SAMANID_W = [[55.5, 37.2], [54.5, 36.6], [54.3, 35.5], [55.0, 34.0], [56.5, 31.0], [57.5, 28.0], [57.5, 27.0]];
const KHORASAN = poly(...SAMANID_W, [63.0, 27.0], [63.0, 40.0], [58.0, 39.0], [55.5, 38.5]);
// the caliphate's heartland, Iraq, Syria, the Jazira and western Iran, drawn rough
const NEAR_EAST = poly(...BYZ_ARAB, [41.0, 42.5], ...rev(CAUCASUS), [50.5, 40.5], [52.0, 38.0], [53.4, 38.5], [55.5, 38.5], [58.0, 39.0], [63.0, 40.0], [63.0, 27.0],
  [34.5, 27.0], ...rev(LEVANT));
const SEA_LEVANT = sea([[22.5, 33.0], [25.5, 32.5], [34.0, 31.6], [34.45, 31.65]]);
// Syria south of Aleppo and Palestine, Fatimid from 969; the Jazira and Aleppo of the Hamdanids
const SYRIA_S_N = [[35.6, 35.0], [36.4, 34.9], [37.2, 34.8], [38.5, 34.6], [39.5, 34.0], [40.0, 33.0], [39.0, 31.0], [38.0, 29.5], [36.5, 29.0], [34.9, 29.4]];
const FATIMID_SYRIA = poly(...SYRIA_S_N, [34.5, 28.0], [34.2, 31.3], [34.8, 33.0]);
const JAZIRA = poly([35.75, 35.3], [38.0, 38.5], [40.5, 38.9], [41.3, 38.9], [42.0, 38.5], [44.5, 37.0], [44.5, 35.5], [43.0, 35.0], [41.5, 34.5], ...rev(SYRIA_S_N.slice(0, 6)));
const ALANIA = poly([39.9, 43.3], [40.0, 43.4], [40.8, 43.45], [41.6, 43.3], [42.5, 43.2], [43.2, 42.95], [43.9, 42.75], [44.6, 42.75], [45.2, 42.6], [45.6, 43.3], [45.0, 44.0],
  [43.5, 44.5], [41.5, 44.6], [39.8, 44.4], [38.5, 44.0]);

// --- central Europe ---
const MORAVIA = poly([15.4, 49.0], [15.6, 48.6], [16.2, 48.65], [16.95, 48.6], [16.98, 48.17], [17.6, 47.9], [18.2, 47.75], [18.9, 47.8], [19.0, 48.3], [18.9, 48.9], [18.5, 49.4],
  [17.8, 49.9], [16.8, 50.3], [15.7, 50.0]);
// the Hungarians in the Carpathian basin, west to the Enns until 955 and to the Leitha after
const CARPATHIANS = [[22.6, 44.55], [23.0, 45.2], [24.0, 45.4], [25.3, 45.5], [26.0, 45.8], [26.0, 46.5], [25.5, 47.2], [24.8, 47.7], [23.5, 48.0], [22.5, 49.0], [21.0, 49.4],
  [19.5, 49.4], [18.5, 49.3], [17.5, 48.9], [16.95, 48.6]];
const DRAVA_DANUBE = [[16.4, 46.45], [16.6, 46.35], [17.2, 46.15], [17.8, 45.9], [18.4, 45.75], [18.9, 45.55], [19.3, 45.2], [20.5, 44.8], [21.4, 44.75], [22.0, 44.6], [22.6, 44.55]];
const HUNGARY_907 = poly(...ENNS.slice(2, 7), ...DRAVA_DANUBE, ...CARPATHIANS.slice(1), [16.2, 48.75], [15.6, 48.85], [15.0, 48.95], [14.4, 48.6], [13.85, 48.75], [14.4, 48.4]);
const LEITHA = [[16.95, 48.6], [16.98, 48.17], [16.8, 47.9], [16.5, 47.5], [16.2, 47.0], [16.1, 46.65], [16.4, 46.45]];
const HUNGARY_1000 = poly(...LEITHA, ...DRAVA_DANUBE.slice(1), ...CARPATHIANS.slice(1, -1));
// Poland: the Oder in the west, Masovia in the east; Silesia and Little Poland from 990
const PL_W = [[14.3, 53.9], [14.4, 53.3], [14.6, 52.6], [14.7, 52.1], [15.0, 51.7], [15.0, 51.2], [15.05, 50.95], [16.0, 50.6], [16.8, 50.2], [17.6, 50.1], [18.3, 49.9],
  [18.5, 49.3], [19.5, 49.4], [21.0, 49.4], [22.5, 49.0], [22.6, 49.5]];
const PL_E = [[22.6, 49.5], [22.8, 50.0], [23.2, 50.5], [23.6, 51.0], [23.6, 51.6], [23.2, 52.2], [22.8, 52.7], [22.5, 53.25]];
const PL_970_S = [[15.0, 51.7], [16.0, 51.55], [17.0, 51.35], [18.0, 51.2], [19.0, 51.0], [20.0, 50.9], [21.0, 50.95], [22.0, 51.15], [23.0, 51.3], [23.6, 51.6]];
const POMERANIA_S = [[14.6, 52.6], [15.5, 53.0], [16.5, 53.2], [17.5, 53.2], [18.5, 53.3], [19.3, 53.95]];
const POLAND_970 = poly(...PL_W.slice(0, 5), ...PL_970_S.slice(1), ...PL_E.slice(5), ...rev(BALT_SLAV.slice(0, 7)).slice(1), [19.1, 54.75], [18.8, 55.0], [17.0, 55.3], [14.6, 54.3]);
const POLAND_1000 = poly(...PL_W, ...PL_E.slice(1), ...rev(BALT_SLAV.slice(0, 7)).slice(1), [19.1, 54.75], [18.8, 55.0], [17.0, 55.3], [14.6, 54.3]);
const POLAND_1066 = poly(...PL_W.slice(2), ...PL_E.slice(1), ...rev(BALT_SLAV.slice(2, 7)).slice(1), ...rev(POMERANIA_S).slice(1));
const BOHEMIA_970 = poly(...BOHEMIA_W, [14.4, 48.6], [15.0, 48.95], [15.6, 48.85], [16.2, 48.75], [16.95, 48.6], [17.5, 48.9], [18.5, 49.3], [19.5, 49.4], [21.0, 49.4], [22.5, 49.0],
  [22.6, 49.5], [22.8, 50.4], ...rev(PL_970_S).slice(1, -1), [15.0, 51.7], [15.0, 51.2], [14.6, 50.9], [13.9, 50.75], [13.3, 50.6], [12.9, 50.4]);
// Bohemia and Moravia, drawn rough: the empire, Poland and Hungary stand before it
const BOHEMIA_ROUGH = poly([12.0, 50.3], [12.5, 49.5], [13.85, 48.7], [15.0, 48.5], [17.0, 48.5], [17.6, 48.9], [18.9, 49.6], [18.5, 50.2], [17.0, 50.5], [15.0, 51.2], [14.0, 51.1],
  [12.5, 50.6]);
// the empire's eastern edge: to the Oder before the Slav rising of 983, to the Elbe and Lusatia after
const HRE_EAST_970 = [[10.25, 54.48], [11.0, 54.6], [13.6, 54.9], [14.6, 54.2], ...PL_W.slice(0, 7), [14.6, 50.9], [13.9, 50.75], [13.3, 50.6], [12.9, 50.4], ...BOHEMIA_W, ...ENNS.slice(1)];
const HRE_EAST_1000 = [...LIMES.slice(0, 15), [12.5, 51.95], [13.5, 51.95], [14.6, 52.0], [14.75, 51.6], [15.0, 51.2], [15.05, 50.95], [14.6, 50.9], [13.9, 50.75], [13.3, 50.6],
  [12.9, 50.4], ...BOHEMIA_W, [14.4, 48.6], [15.0, 48.95], [15.6, 48.85], [16.2, 48.75], ...LEITHA, [15.9, 46.2], [15.6, 45.85], [15.3, 45.6], [14.8, 45.45], [14.45, 45.33]];
const germany = east => poly(...VERDUN_W.slice(0, VW([5.45, 47.7]) + 1), ...BURG_N.slice(1), ...VERDUN_E.slice(-6), ...ALPS_N_E.slice(1, -1), ...rev(east), [9.5, 55.0], [8.0, 54.6],
  [6.5, 53.8], [4.0, 52.5]);
const GERMANY_970 = germany(HRE_EAST_970);
const GERMANY_1000 = germany(HRE_EAST_1000);
const POLABIANS = poly(...LIMES.slice(0, 15), [12.5, 51.95], [13.5, 51.95], [14.6, 52.0], [14.7, 52.1], ...PL_W.slice(0, 3).reverse(), [14.6, 54.3], [12.5, 54.6], [11.0, 54.6]);
const POLABIANS_POMERANIA = poly(...LIMES.slice(0, 15), [12.5, 51.95], [13.5, 51.95], [14.6, 52.0], [14.7, 52.1], [14.6, 52.6], ...POMERANIA_S.slice(1), ...BALT_SLAV.slice(1, 3).reverse(),
  [18.9, 54.45], [19.1, 54.75], [18.8, 55.0], [17.0, 55.3], [14.6, 54.3], [12.5, 54.6], [11.0, 54.6]);
// Byzantine Apulia, Basilicata and Calabria, the catepanate of Italy, Norman by the 1060s
const BYZ_ITALY = D(poly([15.2, 42.1], [15.1, 41.6], [15.3, 41.2], [15.6, 40.9], [15.8, 40.5], [15.6, 40.05], [15.4, 39.9], [15.4, 38.6], [15.5, 37.8], [16.0, 37.6], [17.5, 38.5],
  [19.0, 40.0], [18.7, 40.6], [16.0, 42.2]), SICILY);
// Harald Fairhair's west coast after Hafrsfjord, and the jarls of Lade in Trøndelag and the north
const HARALD_E = [[7.3, 57.9], [7.2, 58.6], [7.4, 59.3], [7.8, 60.0], [8.2, 60.6], [8.0, 61.3], [8.3, 61.9], [9.3, 62.6]];
const LADE_S = [[8.3, 63.45], [8.8, 63.2], [9.3, 62.6], [10.5, 62.5], [11.5, 62.6], [12.3, 62.6]];
const HARALD_872 = I(NORWAY, poly([4.0, 57.5], [7.3, 57.6], ...HARALD_E, ...LADE_S.slice(0, 2).reverse(), [7.0, 64.0], [3.0, 63.0]));
const LADE_872 = I(NORWAY, poly(...LADE_S, [15.0, 64.0], [22.0, 71.0], [8.0, 71.0], [7.0, 64.0]));
// the Lordship of Ireland in the 1260s: the east, Meath, Munster and much of Connacht; the Gaelic kings kept the north-west and the far south-west
const LORDSHIP = I(IRELAND, poly([-5.0, 55.3], [-6.3, 55.3], [-6.7, 55.0], [-6.9, 54.6], [-7.3, 54.2], [-7.8, 53.9], [-8.4, 53.9], [-8.9, 53.5], [-9.1, 53.25], [-8.95, 53.14],
  [-8.6, 52.9], [-8.65, 52.66], [-9.1, 52.6], [-9.3, 52.3], [-9.0, 52.0], [-9.2, 51.6], [-9.5, 51.3], [-5.0, 51.3]));
const CORFU = island('Greece', [19.85, 39.6]);
const SEA_SICILY = sea([[11.0, 37.1], [12.4, 37.8]]);

// --- names, English and Turkish ---
const N = {
  danes: ['Danes', 'Danlar'], danesK: ['Kingdom of the Danes', 'Danlar Krallığı'], denmark: ['Kingdom of Denmark', 'Danimarka Krallığı'],
  norwayPetty: ['Norwegian petty kingdoms', 'Norveç küçük krallıkları'], harald: ['Kingdom of Harald Fairhair', 'Güzel Saçlı Harald’ın krallığı'],
  lade: ['Jarls of Lade', 'Lade jarlları'], norway: ['Kingdom of Norway', 'Norveç Krallığı'], norwayHaakon: ['Norway under Haakon Jarl', 'Jarl Håkon’un Norveç’i'],
  norwayOlafT: ['Norway under Olaf Tryggvason', 'Olaf Tryggvason’un Norveç’i'], norwayLade: ['Norway under the jarls of Lade', 'Lade jarllarının Norveç’i'],
  norwayOlafH: ['Norway under Olaf Haraldsson', 'Olaf Haraldsson’un Norveç’i'], norwayCnut: ['Norway under Cnut', 'Knut’a bağlı Norveç'],
  svear: ['Svear', 'Svealar'], gotar: ['Götar', 'Götalar'], swedes: ['Kingdom of the Swedes', 'İsveçliler Krallığı'], sweden: ['Kingdom of Sweden', 'İsveç Krallığı'],
  sami: ['Sámi', 'Samiler'], finnic: ['Finnic peoples', 'Fin halkları'], balts: ['Baltic peoples', 'Baltık halkları'], slavs: ['Slavic peoples', 'Slav halkları'],
  obotrites: ['Obotrites', 'Obotritler'], polabians: ['Polabian Slavs', 'Polab Slavları'], polabiansPom: ['Polabian Slavs and Pomeranians', 'Polab Slavları ve Pomeranyalılar'],
  drevlians: ['Drevlians', 'Drevlyanlar'],
  franks: ['Kingdom of the Franks', 'Frank Krallığı'], carolingian: ['Carolingian Empire', 'Karolenj İmparatorluğu'], wfrancia: ['West Francia', 'Batı Frankya'],
  mfrancia: ['Middle Francia', 'Orta Frankya'], efrancia: ['East Francia', 'Doğu Frankya'], lotharingia: ['Lotharingia', 'Lotaringiya'],
  provence: ['Kingdom of Provence', 'Provence Krallığı'], italy: ['Kingdom of Italy', 'İtalya Krallığı'], upperBurgundy: ['Kingdom of Upper Burgundy', 'Yukarı Burgonya Krallığı'],
  burgundy: ['Kingdom of Burgundy', 'Burgonya Krallığı'], charlesFat: ['Empire of Charles the Fat', 'Şişman Karl’ın imparatorluğu'], france: ['Kingdom of France', 'Fransa Krallığı'],
  hre: ['Holy Roman Empire', 'Kutsal Roma İmparatorluğu'],
  bretons: ['Breton lands', 'Breton toprakları'], brittany: ['Brittany', 'Bretonya'], normandy911: ['Normandy, the grant of 911', 'Normandiya, 911 bağışı'],
  normandy: ['Duchy of Normandy', 'Normandiya Dükalığı'], normansItaly: ['Norman lands in southern Italy', 'Güney İtalya’daki Norman toprakları'],
  northumbria: ['Kingdom of Northumbria', 'Northumbria Krallığı'], northumbriaArmy: ['Northumbria under the Great Army', 'Büyük Ordu’nun egemenliğindeki Northumbria'],
  mercia: ['Kingdom of Mercia', 'Mercia Krallığı'], eanglia: ['Kingdom of East Anglia', 'Doğu Anglia Krallığı'],
  eangliaArmy: ['East Anglia under the Great Army', 'Büyük Ordu’nun elindeki Doğu Anglia'], wessex: ['Kingdom of Wessex', 'Wessex Krallığı'], cornwall: ['Cornwall', 'Cornwall'],
  wales: ['Welsh kingdoms', 'Gal krallıkları'], emercia: ['English Mercia', 'İngiliz Mercia’sı'],
  armyLands: ['East Mercia and East Anglia under the Danes', 'Danimarkalıların elindeki Doğu Mercia ve Doğu Anglia'], danelaw: ['Danelaw', 'Danelaw'],
  fiveBoroughs: ['Five Boroughs', 'Beş Kasaba'], southDanelaw: ['East Anglia and the southern Danelaw', 'Doğu Anglia ve güney Danelaw'], york: ['Kingdom of York', 'York Krallığı'],
  bernicia: ['Bernicia, the lords of Bamburgh', 'Bernicia, Bamburgh beyleri'], anglosaxons: ['Kingdom of the Anglo-Saxons', 'Anglosaksonlar Krallığı'],
  england: ['Kingdom of England', 'İngiltere Krallığı'], englandSweyn: ['England under Sweyn Forkbeard', 'Çatal Sakal Sven’in İngiltere’si'],
  wessexEdmund: ['Wessex under Edmund Ironside', 'Edmund Ironside’ın Wessex’i'], cnutNorth: ['Mercia and Northumbria under Cnut', 'Knut’un Mercia ve Northumbria’sı'],
  englandCnut: ['England under Cnut', 'Knut’un İngiltere’si'],
  picts: ['Kingdom of the Picts', 'Pikt Krallığı'], dalriata: ['Dál Riata', 'Dál Riata'], strathclyde: ['Kingdom of Strathclyde', 'Strathclyde Krallığı'],
  alba: ['Kingdom of Alba', 'Alba Krallığı'], scotland: ['Kingdom of Scotland', 'İskoçya Krallığı'],
  hebrides: ['Norse Hebrides', 'İskandinavların Hebrid Adaları'], isles: ['Kingdom of the Isles', 'Adalar Krallığı'],
  mann: ['Kingdom of Mann and the Isles, under Norway', 'Norveç’e bağlı Man ve Adalar Krallığı'], northernIsles: ['Norse Orkney and Shetland', 'İskandinavların Orkney ve Shetland’ı'],
  orkney: ['Earldom of Orkney', 'Orkney Jarllığı'], orkneyNorway: ['Orkney and Shetland, under Norway', 'Norveç’e bağlı Orkney ve Shetland'],
  ireland: ['Irish kingdoms', 'İrlanda krallıkları'], dublin: ['Kingdom of Dublin', 'Dublin Krallığı'], waterford: ['Waterford, Norse town', 'Waterford, İskandinav kenti'],
  wexford: ['Wexford, Norse town', 'Wexford, İskandinav kenti'], limerick: ['Limerick, Norse town', 'Limerick, İskandinav kenti'],
  munster: ['Munster', 'Munster'], leinster: ['Leinster', 'Leinster'], mide: ['Mide', 'Mide'], connacht: ['Connacht', 'Connacht'], ulaid: ['Ulaid', 'Ulaid'],
  ailech: ['Northern Uí Néill and Airgialla', 'Kuzey Uí Néill ve Airgialla'], lordship: ['Lordship of Ireland', 'İrlanda Lordluğu'],
  gaelic: ['Gaelic kingdoms of Ireland', 'İrlanda’nın Gal krallıkları'], principalityWales: ['Principality of Wales', 'Galler Prensliği'],
  faroes: ['Faroe Islands, Norse settlers', 'Faroe Adaları, İskandinav yerleşimciler'], faroesNorway: ['Faroe Islands, under Norway', 'Norveç’e bağlı Faroe Adaları'],
  iceland: ['Icelandic Commonwealth', 'İzlanda Serbest Devleti'], icelandNorway: ['Iceland, under Norway', 'Norveç’e bağlı İzlanda'],
  greenlandE: ['Eastern Settlement', 'Doğu Yerleşimi'], greenlandW: ['Western Settlement', 'Batı Yerleşimi'],
  greenlandENorway: ['Eastern Settlement, under Norway', 'Norveç’e bağlı Doğu Yerleşimi'], greenlandWNorway: ['Western Settlement, under Norway', 'Norveç’e bağlı Batı Yerleşimi'],
  asturias: ['Kingdom of Asturias', 'Asturias Krallığı'], leon: ['Kingdom of León', 'León Krallığı'], castile: ['Kingdoms of Castile and León', 'Kastilya ve León krallıkları'],
  pamplona: ['Kingdom of Pamplona', 'Pamplona Krallığı'], navarre: ['Kingdoms of Navarre and Aragon', 'Navarra ve Aragon krallıkları'],
  cordobaE: ['Emirate of Córdoba', 'Kurtuba Emirliği'], cordobaC: ['Caliphate of Córdoba', 'Kurtuba Halifeliği'], taifas: ['Taifa kingdoms', 'Tavaif krallıkları'],
  nekor: ['Emirate of Nekor', 'Nekor Emirliği'], idrisids: ['Idrisid emirate', 'İdrisiler'], rustamids: ['Rustamid imamate', 'Rüstemiler'], aghlabids: ['Aghlabid emirate', 'Ağlebiler'],
  zenata: ['Zenata emirates', 'Zenata emirlikleri'], zirids: ['Zirid emirate', 'Ziriler'], abbasids: ['Abbasid Caliphate', 'Abbasi Halifeliği'],
  fatimids: ['Fatimid Caliphate', 'Fatımi Halifeliği'], buyids: ['Buyid emirates', 'Büveyhiler'], hamdanids: ['Hamdanid emirates', 'Hamdaniler'],
  jazira: ['Emirates of the Jazira and Aleppo', 'Cezire ve Halep emirlikleri'], seljuks: ['Seljuk Empire', 'Büyük Selçuklu Devleti'], samanids: ['Samanid emirate', 'Samaniler'],
  ghaznavids: ['Ghaznavid emirate', 'Gazneliler'], azerbaijan: ['Azerbaijan and Arran', 'Azerbaycan ve Arran'], caspian: ['Gilan, Daylam and Tabaristan', 'Gilan, Deylem ve Taberistan'],
  shirvan: ['Shirvan and Derbent', 'Şirvan ve Derbent'], armenia: ['Armenian kingdoms', 'Ermeni krallıkları'], georgia: ['Georgian kingdoms', 'Gürcü krallıkları'],
  abkhazia: ['Kingdom of Abkhazia', 'Abhazya Krallığı'], alania: ['Alania', 'Alanya'],
  byzantium: ['Byzantine Empire', 'Bizans İmparatorluğu'], bulgaria: ['First Bulgarian Empire', 'Birinci Bulgar İmparatorluğu'],
  rusBulgaria: ['Bulgaria, held by Sviatoslav’s Rus’', 'Svyatoslav’ın Ruslarının elindeki Bulgaristan'], benevento: ['Duchy of Benevento', 'Benevento Dükalığı'],
  lombards: ['Lombard principalities', 'Lombard prenslikleri'], bari: ['Emirate of Bari', 'Bari Emirliği'], crete: ['Emirate of Crete', 'Girit Emirliği'],
  sicily: ['Emirate of Sicily', 'Sicilya Emirliği'], croatia: ['Kingdom of Croatia', 'Hırvatistan Krallığı'], serbs: ['Serbian principalities', 'Sırp beylikleri'],
  avars: ['Avar Khaganate', 'Avar Kağanlığı'], khazars: ['Khazar Khaganate', 'Hazar Kağanlığı'], vbulgars: ['Volga Bulgaria', 'İdil Bulgarları'], magyars: ['Magyars', 'Macarlar'],
  hungaryP: ['Principality of Hungary', 'Macar Beyliği'], hungary: ['Kingdom of Hungary', 'Macaristan Krallığı'], pechenegs: ['Pechenegs', 'Peçenekler'],
  oghuz: ['Oghuz', 'Oğuzlar'], cumans: ['Cumans', 'Kumanlar'], rus860: ['Rus’ of Ladoga and Novgorod', 'Ladoga ve Novgorod Rusları'], rus: ['Kievan Rus’', 'Kiev Rus’u'],
  tmutarakan: ['Principality of Tmutarakan', 'Tmutarakan Prensliği'], moravia: ['Great Moravia', 'Büyük Moravya'], poland: ['Duchy of Poland', 'Polonya Dükalığı'],
  bohemia: ['Duchy of Bohemia', 'Bohemya Dükalığı'],
};

// --- periods: each lists its states in order, and the first state to claim a piece of land keeps it ---
const PERIODS = [];
const period = (id, from, to, zones) => PERIODS.push({ id, from, to, zones: zones.flat(Infinity).filter(Boolean) });
const z = (key, family, name, land, opts = {}) => {
  if (!land) throw new Error(`zone ${key} has no land`);
  if (!N[name]) throw new Error(`zone ${key}: no name ${name}`);
  const [en, tr] = N[name];
  return { key, family, en, tr, land, ...opts };
};

// states that recur, so each period lists only what changed
const S = {
  dalriata: () => z('dalriata', 'celts', 'dalriata', DALRIATA),
  strathclyde: () => z('strathclyde', 'celts', 'strathclyde', STRATHCLYDE_790),
  strathclyde910: () => z('strathclyde', 'celts', 'strathclyde', STRATHCLYDE_910),
  picts: () => z('picts', 'celts', 'picts', SCOT_N),
  alba: (land = SCOT_N) => z('alba', 'celts', 'alba', land),
  wales: () => z('wales', 'celts', 'wales', WALES),
  cornwall: () => z('cornwall', 'celts', 'cornwall', CORNWALL),
  ireland: () => z('ireland', 'celts', 'ireland', IRELAND),
  irish: () => [z('ulaid', 'celts', 'ulaid', ULAID), z('connacht', 'celts', 'connacht', CONNACHT), z('mide', 'celts', 'mide', MIDE), z('leinster', 'celts', 'leinster', LEINSTER),
    z('munster', 'celts', 'munster', MUNSTER), z('ailech', 'celts', 'ailech', AILECH)],
  dublin: () => z('dublin', 'norse', 'dublin', DUBLIN),
  waterford: () => z('waterford', 'norse', 'waterford', WATERFORD),
  wexford: () => z('wexford', 'norse', 'wexford', WEXFORD),
  limerick: () => z('limerick', 'norse', 'limerick', LIMERICK),
  hebrides: () => z('isles', 'norse', 'hebrides', HEBRIDES),
  isles: () => z('isles', 'norse', 'isles', U(HEBRIDES, MAN), { sea: [SEA_MAN] }),
  northernIsles: () => z('orkney', 'norse', 'northernIsles', NORTHERN_ISLES),
  orkney: (land = ORKNEY_870) => z('orkney', 'norse', 'orkney', land),
  faroes: () => z('faroes', 'norse', 'faroes', FAROES),
  danes: (name = 'danesK') => z('danes', 'danes', name, DENMARK),
  norway: (name = 'norway') => z('norway', 'norway', name, NORWAY),
  svear: () => [z('svear', 'swedes', 'svear', SVEAR, { sea: [SEA_GOTLAND] }), z('gotar', 'swedes', 'gotar', GOTAR)],
  north: () => [z('finns', 'other', 'finnic', FINNIC), z('sami', 'other', 'sami', SAMI)],
  balts: () => z('balts', 'other', 'balts', BALTS),
  slavs: () => z('slavs', 'other', 'slavs', SLAVS),
  byzantium790: () => z('byzantium', 'byzantium', 'byzantium', U(BYZANTIUM_790, CHERSON, CALABRIA, OTRANTO, SICILY, CRETE, CORFU),
    { sea: [SEA_CHERSON, SEA_SALENTO, SEA_CORFU, SEA_IONIAN, SEA_CRETE] }),
  east790: () => [z('bulgaria', 'bulgaria', 'bulgaria', BULGARIA_790), z('khazars', 'steppe', 'khazars', KHAZARIA), z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA),
    z('abkhazia', 'other', 'abkhazia', ABKHAZIA)],
  caucasus: () => [z('alania', 'other', 'alania', ALANIA), z('georgia', 'other', 'georgia', GEORGIA), z('armenia', 'other', 'armenia', ARMENIA),
    z('shirvan', 'islam', 'shirvan', SHIRVAN), z('azerbaijan', 'islam', 'azerbaijan', AZERBAIJAN), z('caspian', 'islam', 'caspian', CASPIAN_S)],
  iberia790: () => [z('asturias', 'other', 'asturias', ASTURIAS_790), z('cordoba', 'islam', 'cordobaE', IBERIA, { sea: BALEARIC_SEA })],
  maghreb790: () => [z('idrisids', 'islam', 'idrisids', MOROCCO), z('rustamids', 'islam', 'rustamids', ALGERIA_W)],
};

// 790: the North before the raids
period('790', 789, 803, [
  S.dalriata(), S.strathclyde(), z('northumbria', 'anglo', 'northumbria', NORTHUMBRIA), S.picts(), S.wales(), S.cornwall(), z('wessex', 'english', 'wessex', WESSEX_790),
  z('eanglia', 'anglo', 'eanglia', EANGLIA), z('mercia', 'anglo', 'mercia', MERCIA_ROUGH), S.ireland(),
  S.danes('danes'), S.norway('norwayPetty'), S.svear(),
  z('bretons', 'celts', 'bretons', BRITTANY_W), z('franks', 'franks', 'franks', U(WEST_FRANCIA, MIDDLE_FRANCIA, EAST_FRANCIA_790)), S.iberia790(), S.maghreb790(),
  S.byzantium790(), z('benevento', 'other', 'benevento', BENEVENTO), S.east790(), z('avars', 'steppe', 'avars', AVARS),
  z('abbasids', 'islam', 'abbasids', U(NEAR_EAST, IFRIQIYA, CYRENAICA), { sea: [SEA_LEVANT] }), z('oghuz', 'steppe', 'oghuz', OGHUZ),
  S.balts(), S.north(), S.slavs(),
]);
// 804 – 824: Godfred and Charlemagne; Mercia holds East Anglia, the Avars are gone
const CAROLINGIAN = () => z('franks', 'franks', 'carolingian', U(WEST_FRANCIA, MIDDLE_FRANCIA, EAST_FRANCIA));
const EAST_810 = () => [S.byzantium790(), z('benevento', 'other', 'benevento', BENEVENTO), S.east790(),
  z('abbasids', 'islam', 'abbasids', U(NEAR_EAST, IFRIQIYA, CYRENAICA), { sea: [SEA_LEVANT] })];
period('810', 804, 824, [
  S.dalriata(), S.strathclyde(), z('northumbria', 'anglo', 'northumbria', NORTHUMBRIA), S.picts(), S.wales(), S.cornwall(), z('wessex', 'english', 'wessex', WESSEX_790),
  z('mercia', 'anglo', 'mercia', MERCIA_ROUGH), S.ireland(),
  S.danes(), S.norway('norwayPetty'), S.svear(), z('obotrites', 'other', 'obotrites', OBOTRITES),
  z('bretons', 'celts', 'bretons', BRITTANY_W), CAROLINGIAN(), S.iberia790(), S.maghreb790(), EAST_810(),
  S.balts(), S.north(), S.slavs(),
]);
// 825 – 842: Wessex takes Kent, Sussex, Surrey and Essex, East Anglia free again; Louis the Pious
const WESSEX_825 = U(WESSEX_SOUTH, ESSEX);
period('834', 825, 842, [
  S.dalriata(), S.strathclyde(), z('northumbria', 'anglo', 'northumbria', NORTHUMBRIA), S.picts(), S.wales(), S.cornwall(), z('wessex', 'english', 'wessex', WESSEX_825),
  z('eanglia', 'anglo', 'eanglia', EANGLIA), z('mercia', 'anglo', 'mercia', MERCIA_ROUGH), S.ireland(),
  S.danes(), S.norway('norwayPetty'), S.svear(), z('obotrites', 'other', 'obotrites', OBOTRITES),
  z('bretons', 'celts', 'bretons', BRITTANY_W), CAROLINGIAN(), S.iberia790(), S.maghreb790(), EAST_810(),
  S.balts(), S.north(), S.slavs(),
]);
// 843 – 854: Verdun; Dublin founded; Alba of the Picts and Scots
const WESSEX_843 = U(WESSEX_SOUTH, ESSEX, CORNWALL);
const BRITAIN_843 = () => [S.strathclyde(), z('northumbria', 'anglo', 'northumbria', NORTHUMBRIA), S.picts(), S.wales(), z('wessex', 'english', 'wessex', WESSEX_843),
  z('eanglia', 'anglo', 'eanglia', EANGLIA), z('mercia', 'anglo', 'mercia', MERCIA_ROUGH), S.dublin(), S.ireland()];
period('843', 843, 854, [
  BRITAIN_843(), S.danes(), S.norway('norwayPetty'), S.svear(), z('obotrites', 'other', 'obotrites', OBOTRITES),
  z('brittany', 'celts', 'brittany', BRITTANY_W), z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA), z('mfrancia', 'franks', 'mfrancia', MIDDLE_FRANCIA),
  z('efrancia', 'franks', 'efrancia', EAST_FRANCIA), z('asturias', 'other', 'asturias', ASTURIAS_843), z('pamplona', 'other', 'pamplona', PAMPLONA),
  z('cordoba', 'islam', 'cordobaE', IBERIA, { sea: BALEARIC_SEA }), z('nekor', 'islam', 'nekor', NEKOR), S.maghreb790(), z('aghlabids', 'islam', 'aghlabids', IFRIQIYA), EAST_810().slice(0, -1),
  z('abbasids', 'islam', 'abbasids', U(NEAR_EAST, CYRENAICA), { sea: [SEA_LEVANT] }),
  S.balts(), S.north(), S.slavs(),
]);

// 855 – 864: Lotharingia, Provence and Italy after Prüm; Norse in the Isles and the Faroes; the Rus' at Ladoga; the Mediterranean raid
const BYZANTIUM_860_LAND = U(BYZANTIUM_860, CHERSON, CALABRIA, OTRANTO, SICILY_E);
const SEA_860 = [SEA_CHERSON, SEA_SALENTO, SEA_CORFU, sea([[15.5, 37.6], [15.65, 38.0]])];
const WEST_860 = () => [z('brittany', 'celts', 'brittany', BRITTANY), z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA),
  z('lotharingia', 'franks', 'lotharingia', LOTHARINGIA), z('provence', 'franks', 'provence', PROVENCE), z('italy', 'franks', 'italy', ITALY),
  z('efrancia', 'franks', 'efrancia', EAST_FRANCIA)];
const EAST_860 = () => [z('moravia', 'other', 'moravia', MORAVIA), z('byzantium', 'byzantium', 'byzantium', BYZANTIUM_860_LAND, { sea: SEA_860 }),
  z('bari', 'islam', 'bari', BARI), z('crete', 'islam', 'crete', CRETE), z('lombards', 'other', 'lombards', BENEVENTO),
  z('aghlabids', 'islam', 'aghlabids', U(IFRIQIYA, SICILY), { sea: [SEA_SICILY] }), z('bulgaria', 'bulgaria', 'bulgaria', BULGARIA_860),
  z('magyars', 'steppe', 'magyars', ETELKOZ), z('rus', 'rus', 'rus860', RUS_860), z('khazars', 'steppe', 'khazars', KHAZARIA),
  z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA), z('abkhazia', 'other', 'abkhazia', ABKHAZIA),
  z('abbasids', 'islam', 'abbasids', U(NEAR_EAST, CYRENAICA), { sea: [SEA_LEVANT] }), z('oghuz', 'steppe', 'oghuz', OGHUZ)];
const BRITAIN_860 = () => [S.hebrides(), S.northernIsles(), S.faroes(), ...BRITAIN_843()];
period('860', 855, 864, [
  BRITAIN_860(), S.danes(), S.norway('norwayPetty'), S.svear(), z('obotrites', 'other', 'obotrites', OBOTRITES), WEST_860(),
  z('asturias', 'other', 'asturias', ASTURIAS_860), z('pamplona', 'other', 'pamplona', PAMPLONA), z('cordoba', 'islam', 'cordobaE', IBERIA, { sea: BALEARIC_SEA }),
  z('nekor', 'islam', 'nekor', NEKOR), S.maghreb790(), EAST_860(), S.balts(), S.north(), S.slavs(),
]);
// 865 – 866: the Great Army lands in East Anglia
period('865', 865, 866, [BRITAIN_860(), S.danes(), S.norway('norwayPetty'), S.svear(), z('obotrites', 'other', 'obotrites', OBOTRITES), WEST_860(), S.balts(), S.slavs()]);
// 867 – 873: York and East Anglia in the hands of the Great Army; Brittany with the Cotentin
const BRITTANY_867 = U(BRITTANY, COTENTIN);
period('871', 867, 873, [
  S.hebrides(), S.northernIsles(), S.faroes(), S.strathclyde(), z('northumbria', 'anglo', 'northumbriaArmy', NORTHUMBRIA), S.picts(), S.wales(),
  z('wessex', 'english', 'wessex', WESSEX_843), z('eanglia', 'danes', 'eangliaArmy', EANGLIA), z('mercia', 'anglo', 'mercia', MERCIA_ROUGH), S.dublin(), S.ireland(),
  S.danes(), S.norway('norwayPetty'), z('brittany', 'celts', 'brittany', BRITTANY_867), z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA),
  z('efrancia', 'franks', 'efrancia', U(EAST_FRANCIA, LOTHARINGIA)),
]);
// 874 – 878: Halfdan's York, Bernicia, Mercia divided, Guthrum in Wessex
period('877', 874, 878, [
  S.hebrides(), S.northernIsles(), S.faroes(), S.strathclyde(), S.picts(), S.wales(), z('wessex', 'english', 'wessex', WESSEX_843),
  z('danelaw', 'danes', 'armyLands', D(DANELAW_E, ESSEX)), z('york', 'norse', 'york', DEIRA), z('bernicia', 'anglo', 'bernicia', BERNICIA_ROUGH),
  z('emercia', 'anglo', 'emercia', MERCIA_ROUGH), S.dublin(), S.ireland(),
  S.danes(), z('brittany', 'celts', 'brittany', BRITTANY_867), z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA),
  z('efrancia', 'franks', 'efrancia', U(EAST_FRANCIA, LOTHARINGIA)),
]);
// 879 – 901: the Danelaw by the treaty of Alfred and Guthrum, London to English Mercia, the earls of Orkney
const BRITAIN_886 = () => [S.hebrides(), S.orkney(), S.faroes(), S.strathclyde(), S.picts(), S.wales(), z('wessex', 'english', 'wessex', U(WESSEX_SOUTH, CORNWALL)),
  z('danelaw', 'danes', 'danelaw', DANELAW_E), z('york', 'norse', 'york', DEIRA), z('bernicia', 'anglo', 'bernicia', BERNICIA_ROUGH),
  z('emercia', 'anglo', 'emercia', MERCIA_ROUGH), S.dublin(), S.ireland()];
period('886', 879, 901, [BRITAIN_886(), S.danes(), z('brittany', 'celts', 'brittany', BRITTANY_867), z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA),
  z('efrancia', 'franks', 'efrancia', U(EAST_FRANCIA, LOTHARINGIA))]);
// c. 872: Harald Fairhair after Hafrsfjord
period('872', 872, 899, [
  S.northernIsles(), S.faroes(), S.danes(), z('harald', 'norway', 'harald', HARALD_872), z('lade', 'norway', 'lade', LADE_872), S.norway('norwayPetty'), S.svear(),
  S.balts(), S.north(), S.slavs(),
]);
// 879 – 884: the Great Army in Francia; Lotharingia East Frankish after Ribemont, Boso's Provence
period('881', 879, 884, [
  BRITAIN_886(), S.danes(), z('brittany', 'celts', 'brittany', BRITTANY_867), z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA),
  z('efrancia', 'franks', 'efrancia', U(EAST_FRANCIA, LOTHARINGIA)), z('provence', 'franks', 'provence', PROVENCE), z('italy', 'franks', 'italy', ITALY),
]);
// 885 – 887: the empire reunited under Charles the Fat
period('885', 885, 887, [
  BRITAIN_886(), S.danes(), z('brittany', 'celts', 'brittany', BRITTANY_867),
  z('franks', 'franks', 'charlesFat', U(WEST_FRANCIA, EAST_FRANCIA, LOTHARINGIA, PROVENCE, ITALY)),
]);
// 882 – 912: Oleg's Rus' from Ladoga to Kiev, the Pechenegs on the steppe, the Magyars in Pannonia
const BYZANTIUM_900 = () => z('byzantium', 'byzantium', 'byzantium', U(BYZANTIUM_860, CHERSON), { sea: [SEA_CHERSON] });
period('907', 882, 912, [
  S.danes(), S.svear(), z('rus', 'rus', 'rus', RUS_907), BYZANTIUM_900(), z('bulgaria', 'bulgaria', 'bulgaria', BULGARIA_860),
  z('hungary', 'steppe', 'hungaryP', HUNGARY_907), z('alania', 'other', 'alania', ALANIA), z('khazars', 'steppe', 'khazars', KHAZARIA_900),
  z('pechenegs', 'steppe', 'pechenegs', PECHENEGS), z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA), z('oghuz', 'steppe', 'oghuz', OGHUZ),
  S.caucasus().slice(1), z('samanids', 'islam', 'samanids', KHORASAN), z('abbasids', 'islam', 'abbasids', NEAR_EAST),
  S.balts(), S.north(), S.slavs(),
]);
// 902 – 916: Edward the Elder and Æthelflæd against York, the Five Boroughs and the southern Danelaw
const BRITAIN_910 = () => [S.hebrides(), S.orkney(), S.faroes(), S.strathclyde910(), S.alba(), S.wales(), z('wessex', 'english', 'wessex', U(WESSEX_SOUTH, CORNWALL)),
  z('fiveboroughs', 'danes', 'fiveBoroughs', FIVE_BOROUGHS), z('danelaw', 'danes', 'southDanelaw', D(DANELAW_E, FIVE_BOROUGHS)),
  z('york', 'norse', 'york', YORK_910), z('bernicia', 'anglo', 'bernicia', BERNICIA_910), z('emercia', 'anglo', 'emercia', MERCIA_ROUGH), S.ireland()];
period('910', 902, 916, [BRITAIN_910(), S.danes(), z('brittany', 'celts', 'brittany', BRITTANY_867), z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA)]);
// 911 – 916: Rollo's Normandy; Lotharingia with West Francia, the two Burgundies
period('911', 911, 916, [
  BRITAIN_910(), S.danes(), z('normandy', 'normans', 'normandy911', NORMANDY_911, { span: '911 – 923' }), z('brittany', 'celts', 'brittany', BRITTANY_867),
  z('wfrancia', 'franks', 'wfrancia', U(WEST_FRANCIA, LOTHARINGIA_N)), z('upperburgundy', 'franks', 'upperBurgundy', UPPER_BURGUNDY),
  z('provence', 'franks', 'provence', PROVENCE), z('italy', 'franks', 'italy', ITALY), z('efrancia', 'franks', 'efrancia', EAST_FRANCIA_790),
]);
// 917 – 926: Edward's kingdom to the Humber, Ragnall's York, Dublin retaken, Waterford
period('919', 917, 926, [
  S.hebrides(), S.orkney(), S.faroes(), S.strathclyde910(), S.alba(), S.wales(), z('york', 'norse', 'york', YORK_910, { span: '919 – 927' }),
  z('bernicia', 'anglo', 'bernicia', BERNICIA_910), z('england', 'english', 'anglosaxons', SOUTH_ROUGH),
  S.dublin(), S.waterford(), S.irish(),
]);
// 913 – 943: the Volga route: the Khazars, Volga Bulgaria, the Caspian and the caliphate
period('921', 913, 943, [
  S.danes(), S.svear(), z('rus', 'rus', 'rus', RUS_907), BYZANTIUM_900(), z('bulgaria', 'bulgaria', 'bulgaria', BULGARIA_945),
  z('hungary', 'steppe', 'hungaryP', HUNGARY_907), z('alania', 'other', 'alania', ALANIA), z('khazars', 'steppe', 'khazars', KHAZARIA_900),
  z('pechenegs', 'steppe', 'pechenegs', PECHENEGS), z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA), z('oghuz', 'steppe', 'oghuz', OGHUZ),
  S.caucasus().slice(1), z('samanids', 'islam', 'samanids', KHORASAN), z('abbasids', 'islam', 'abbasids', NEAR_EAST), S.balts(), S.north(), S.slavs(),
]);
// 927 – 938: Æthelstan's England, Brunanburh; the Icelandic Commonwealth; Normandy at its full extent
const IRELAND_937 = () => [S.dublin(), S.waterford(), S.wexford(), S.limerick(), S.ireland()];
period('937', 927, 938, [
  S.isles(), S.orkney(), S.faroes(), z('iceland', 'norse', 'iceland', ICELAND), S.strathclyde910(), S.alba(), S.wales(), z('england', 'english', 'england', ENGLAND_FORTH),
  IRELAND_937(), S.danes(), S.norway(), S.svear(), z('normandy', 'normans', 'normandy', NORMANDY, { span: '933 – 1066' }), z('brittany', 'celts', 'brittany', BRITTANY),
  z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA), z('efrancia', 'franks', 'efrancia', U(LOTHARINGIA_N, EAST_FRANCIA_790)),
  z('burgundy', 'franks', 'burgundy', U(UPPER_BURGUNDY, PROVENCE)), z('italy', 'franks', 'italy', ITALY),
]);
// 941 – 957: Igor's Rus' and the Drevlian revolt
period('945', 941, 957, [
  S.danes(), S.svear(), z('drevlians', 'other', 'drevlians', DREVLIANS), z('rus', 'rus', 'rus', D(RUS_907, DREVLIANS)),
  z('byzantium', 'byzantium', 'byzantium', U(poly(...BYZ_ARAB_934, ...BLACK_SEA_S.slice(1), ...BYZ_BULG.slice(1), ...BYZ_BALKAN_860.slice(1), ...AEGEAN.slice(1)), CHERSON),
    { sea: [SEA_CHERSON] }),
  z('bulgaria', 'bulgaria', 'bulgaria', BULGARIA_945), z('hungary', 'steppe', 'hungaryP', HUNGARY_907), z('alania', 'other', 'alania', ALANIA),
  z('khazars', 'steppe', 'khazars', KHAZARIA_900), z('pechenegs', 'steppe', 'pechenegs', PECHENEGS), z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA),
  z('oghuz', 'steppe', 'oghuz', OGHUZ), S.caucasus().slice(1), z('samanids', 'islam', 'samanids', KHORASAN), z('abbasids', 'islam', 'abbasids', NEAR_EAST),
  S.balts(), S.north(), S.slavs(),
]);
// 939 – 954: Eric Bloodaxe's York
period('947', 939, 954, [
  S.isles(), S.orkney(), S.strathclyde910(), S.alba(), S.wales(), z('york', 'norse', 'york', YORK_910, { span: '939 – 954' }),
  z('bernicia', 'anglo', 'bernicia', BERNICIA_910), z('england', 'english', 'england', SOUTH_ROUGH), IRELAND_937(),
]);

// 965 – 971: Harald Bluetooth's Denmark, the empire of Otto the Great to the Oder, Sviatoslav on the Danube
const BRITAIN_970 = () => [S.isles(), S.orkney(), S.faroes(), z('iceland', 'norse', 'iceland', ICELAND), S.strathclyde910(), S.alba(), S.wales(),
  z('england', 'english', 'england', ENGLAND_FORTH), IRELAND_937()];
const WEST_970 = () => [z('normandy', 'normans', 'normandy', NORMANDY, { span: '933 – 1066' }), z('brittany', 'celts', 'brittany', BRITTANY),
  z('wfrancia', 'franks', 'wfrancia', WEST_FRANCIA), z('burgundy', 'franks', 'burgundy', U(UPPER_BURGUNDY, PROVENCE))];
const SCANDINAVIA_970 = () => [z('denmark', 'danes', 'denmark', DENMARK), z('norway', 'norway', 'norwayHaakon', NORWAY),
  z('sweden', 'swedes', 'swedes', SWEDEN, { sea: [SEA_GOTLAND] })];
const NEAR_EAST_970 = () => [S.caucasus().slice(1), z('samanids', 'islam', 'samanids', KHORASAN), z('jazira', 'islam', 'hamdanids', JAZIRA),
  z('fatimids', 'islam', 'fatimids', U(FATIMID_SYRIA, CYRENAICA), { sea: [SEA_LEVANT] }), z('buyids', 'islam', 'buyids', NEAR_EAST)];
const BYZANTIUM_970_LAND = U(BYZANTIUM_970, CHERSON, CRETE, CYPRUS, BYZ_ITALY, CORFU);
const SEA_970 = [SEA_CHERSON, SEA_CRETE, SEA_CORFU, SEA_IONIAN, sea([[33.3, 35.35], [32.9, 36.08]])];
const EAST_970 = byz => [z('bulgaria', 'bulgaria', 'bulgaria', D(BULGARIA_945, BULGARIA_EAST)), byz, z('lombards', 'other', 'lombards', BENEVENTO),
  z('croatia', 'other', 'croatia', CROATIA), z('serbs', 'other', 'serbs', SERBS),
  z('hungary', 'steppe', 'hungaryP', HUNGARY_907), z('alania', 'other', 'alania', ALANIA), z('pechenegs', 'steppe', 'pechenegs', PECHENEGS_1000),
  z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA), z('oghuz', 'steppe', 'oghuz', OGHUZ), NEAR_EAST_970()];
const CENTRAL_970 = () => [z('hre', 'franks', 'hre', U(GERMANY_970, ITALY)), z('poland', 'other', 'poland', POLAND_970), z('bohemia', 'other', 'bohemia', BOHEMIA_970),
  z('sicily', 'islam', 'sicily', SICILY)];
period('970', 965, 970, [
  BRITAIN_970(), SCANDINAVIA_970(), WEST_970(), z('rusbulgaria', 'rus', 'rusBulgaria', BULGARIA_EAST, { span: '969 – 971' }),
  z('rus', 'rus', 'rus', U(RUS_907, VYATICHI)), CENTRAL_970(), EAST_970(z('byzantium', 'byzantium', 'byzantium', BYZANTIUM_970_LAND, { sea: SEA_970 })),
  S.balts(), S.north(), S.slavs(),
]);
// 971: John Tzimiskes takes Preslav and besieges the Rus' in Dorostolon
period('971', 971, 971, [
  SCANDINAVIA_970(), z('rus', 'rus', 'rus', U(RUS_907, VYATICHI)), CENTRAL_970(),
  EAST_970(z('byzantium', 'byzantium', 'byzantium', U(BYZANTIUM_970_LAND, BULGARIA_EAST), { sea: SEA_970 })), S.balts(), S.north(), S.slavs(),
]);
// 985 – 1014: the Norse world about 1000, from Greenland to Vladimir's Rus'
const BRITAIN_1000 = () => [S.isles(), S.orkney(ORKNEY_990), S.strathclyde910(), S.alba(SCOT_TWEED), S.wales(), S.dublin(), S.waterford(), S.wexford(), S.irish()];
const NORTH_ATLANTIC = () => [S.faroes(), z('iceland', 'norse', 'iceland', ICELAND), z('greenland-e', 'norse', 'greenlandE', GREENLAND_E),
  z('greenland-w', 'norse', 'greenlandW', GREENLAND_W)];
const RHODOPES = poly([23.6, 41.3], [24.3, 41.45], [25.0, 41.65], [25.6, 42.0], [25.0, 42.4], [24.6, 42.6], [24.3, 42.9], [24.4, 42.4], [24.2, 41.8], [23.6, 41.4]);
const BYZANTIUM_1000_LAND = U(BYZANTIUM_970, BULGARIA_EAST, RHODOPES, CHERSON, CRETE, CYPRUS, BYZ_ITALY, CORFU);
const CENTRAL_1000 = () => [z('hre', 'franks', 'hre', U(GERMANY_1000, ITALY)), z('polabians', 'other', 'polabians', POLABIANS), z('poland', 'other', 'poland', POLAND_1000),
  z('hungary', 'other', 'hungary', HUNGARY_1000), z('bohemia', 'other', 'bohemia', BOHEMIA_ROUGH), z('croatia', 'other', 'croatia', CROATIA)];
const SOUTH_1000 = () => [z('leon', 'other', 'leon', LEON), z('navarre', 'other', 'pamplona', NAVARRE), z('cordoba', 'islam', 'cordobaC', IBERIA, { sea: BALEARIC_SEA }),
  z('zenata', 'islam', 'zenata', U(MOROCCO, ALGERIA_W)), z('zirids', 'islam', 'zirids', IFRIQIYA), z('sicily', 'islam', 'sicily', SICILY)];
const EAST_1000 = () => [z('rus', 'rus', 'rus', RUS_1000), z('tmutarakan', 'rus', 'tmutarakan', TMUTARAKAN), z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA),
  z('alania', 'other', 'alania', ALANIA), z('oghuz', 'steppe', 'oghuz', OGHUZ), S.caucasus().slice(1), z('ghaznavids', 'islam', 'ghaznavids', KHORASAN),
  z('jazira', 'islam', 'jazira', JAZIRA), z('fatimids', 'islam', 'fatimids', U(FATIMID_SYRIA, CYRENAICA), { sea: [SEA_LEVANT] }), z('buyids', 'islam', 'buyids', NEAR_EAST)];
period('1000', 985, 1014, [
  BRITAIN_1000(), z('england', 'english', 'england', ENGLAND_TWEED), NORTH_ATLANTIC(),
  z('denmark', 'danes', 'denmark', DENMARK), z('norway', 'norway', 'norwayOlafT', NORWAY, { span: '995 – 1000' }), z('sweden', 'swedes', 'swedes', SWEDEN, { sea: [SEA_GOTLAND] }),
  z('normandy', 'normans', 'normandy', NORMANDY, { span: '933 – 1066' }), z('brittany', 'celts', 'brittany', BRITTANY), z('france', 'franks', 'france', WEST_FRANCIA),
  z('burgundy', 'franks', 'burgundy', U(UPPER_BURGUNDY, PROVENCE)), CENTRAL_1000(), SOUTH_1000(),
  z('bulgaria', 'bulgaria', 'bulgaria', BULGARIA_1000), z('serbs', 'other', 'serbs', SERBS),
  z('byzantium', 'byzantium', 'byzantium', BYZANTIUM_1000_LAND, { sea: SEA_970 }), z('lombards', 'other', 'lombards', BENEVENTO), EAST_1000(),
  z('pechenegs', 'steppe', 'pechenegs', PECHENEGS_1000),
  S.balts(), S.north(),
]);
// 1013 – 1014: Sweyn Forkbeard takes England
const SCOT_1000 = () => [S.isles(), S.orkney(ORKNEY_990), S.strathclyde910(), S.alba(SCOT_TWEED), S.wales()];
period('1013', 1013, 1014, [
  SCOT_1000(), z('england', 'danes', 'englandSweyn', ENGLAND_TWEED), S.dublin(), S.waterford(), S.wexford(), S.irish(), S.faroes(),
  z('denmark', 'danes', 'denmark', DENMARK), z('norway', 'norway', 'norwayLade', NORWAY, { span: '1000 – 1015' }), z('sweden', 'swedes', 'swedes', SWEDEN, { sea: [SEA_GOTLAND] }),
  z('normandy', 'normans', 'normandy', NORMANDY, { span: '933 – 1066' }), z('brittany', 'celts', 'brittany', BRITTANY), z('france', 'franks', 'france', WEST_FRANCIA),
  z('hre', 'franks', 'hre', U(GERMANY_1000, ITALY)), z('polabians', 'other', 'polabians', POLABIANS),
]);
// 1015 – 1027: Edmund Ironside's Wessex and Cnut's north after Assandun; Olaf Haraldsson's Norway
const WESSEX_1016 = U(WESSEX_SOUTH, CORNWALL);
period('1016', 1015, 1027, [
  SCOT_1000(), z('wessex', 'english', 'wessexEdmund', WESSEX_1016, { span: '1016' }), z('england', 'danes', 'cnutNorth', D(ENGLAND_TWEED, WESSEX_1016), { span: '1016' }),
  S.dublin(), S.waterford(), S.wexford(), S.irish(), NORTH_ATLANTIC(),
  z('denmark', 'danes', 'denmark', DENMARK), z('norway', 'norway', 'norwayOlafH', NORWAY, { span: '1015 – 1028' }), z('sweden', 'swedes', 'swedes', SWEDEN, { sea: [SEA_GOTLAND] }),
  z('normandy', 'normans', 'normandy', NORMANDY, { span: '933 – 1066' }), z('brittany', 'celts', 'brittany', BRITTANY), z('france', 'franks', 'france', WEST_FRANCIA),
  z('hre', 'franks', 'hre', U(GERMANY_1000, ITALY)), z('polabians', 'other', 'polabians', POLABIANS), z('poland', 'other', 'poland', POLAND_1000),
  z('rus', 'rus', 'rus', RUS_1000), S.balts(), S.north(),
]);
// 1028 – 1035: Cnut's North Sea empire; Scotland with Lothian and Strathclyde
const BRITAIN_1030 = () => [S.isles(), S.orkney(ORKNEY_990), z('scotland', 'celts', 'scotland', SCOT_TWEED), S.wales(), S.dublin(), S.ireland()];
period('1030', 1028, 1035, [
  BRITAIN_1030(), z('england', 'danes', 'englandCnut', ENGLAND_TWEED), NORTH_ATLANTIC(),
  z('denmark', 'danes', 'denmark', DENMARK), z('norway', 'danes', 'norwayCnut', NORWAY, { span: '1028 – 1035' }), z('sweden', 'swedes', 'swedes', SWEDEN, { sea: [SEA_GOTLAND] }),
  z('normandy', 'normans', 'normandy', NORMANDY, { span: '933 – 1066' }), z('brittany', 'celts', 'brittany', BRITTANY), z('france', 'franks', 'france', WEST_FRANCIA),
  z('hre', 'franks', 'hre', U(GERMANY_1000, ITALY)), z('burgundy', 'franks', 'burgundy', U(UPPER_BURGUNDY, PROVENCE)),
  z('polabians', 'other', 'polabians', POLABIANS), z('poland', 'other', 'poland', POLAND_1000), z('hungary', 'other', 'hungary', HUNGARY_1000),
  z('bohemia', 'other', 'bohemia', BOHEMIA_ROUGH), z('croatia', 'other', 'croatia', CROATIA), z('leon', 'other', 'leon', LEON), z('navarre', 'other', 'pamplona', NAVARRE),
  z('cordoba', 'islam', 'taifas', IBERIA, { sea: BALEARIC_SEA }), z('sicily', 'islam', 'sicily', SICILY),
  z('byzantium', 'byzantium', 'byzantium', U(BYZANTIUM_1066, CHERSON, CRETE, CYPRUS, BYZ_ITALY), { sea: [SEA_CHERSON, SEA_CRETE, SEA_CORFU, sea([[33.3, 35.35], [32.9, 36.08]])] }),
  z('serbs', 'other', 'serbs', SERBS), z('lombards', 'other', 'lombards', BENEVENTO), z('rus', 'rus', 'rus', RUS_1000), S.balts(), S.north(),
]);
// 1047 – 1066: Harald Hardrada's Norway, Harold's England, William's Normandy; Byzantium before Manzikert
period('1066', 1047, 1066, [
  BRITAIN_1030(), z('england', 'english', 'england', ENGLAND_TWEED), z('faroes', 'norway', 'faroesNorway', FAROES), z('iceland', 'norse', 'iceland', ICELAND),
  z('greenland-e', 'norse', 'greenlandE', GREENLAND_E), z('greenland-w', 'norse', 'greenlandW', GREENLAND_W),
  z('denmark', 'danes', 'denmark', DENMARK), S.norway(), z('sweden', 'swedes', 'sweden', SWEDEN, { sea: [SEA_GOTLAND] }),
  z('normandy', 'normans', 'normandy', NORMANDY, { span: '933 – 1066' }), z('brittany', 'celts', 'brittany', BRITTANY), z('france', 'franks', 'france', WEST_FRANCIA),
  z('hre', 'franks', 'hre', U(GERMANY_1000, ITALY, UPPER_BURGUNDY, PROVENCE)), z('polabians', 'other', 'polabiansPom', POLABIANS_POMERANIA),
  z('poland', 'other', 'poland', POLAND_1066), z('hungary', 'other', 'hungary', HUNGARY_1000), z('bohemia', 'other', 'bohemia', BOHEMIA_ROUGH),
  z('croatia', 'other', 'croatia', CROATIA), z('normans-italy', 'normans', 'normansItaly', BYZ_ITALY),
  z('byzantium', 'byzantium', 'byzantium', U(BYZANTIUM_1066, CHERSON, CRETE, CYPRUS), { sea: [SEA_CHERSON, SEA_CRETE, sea([[33.3, 35.35], [32.9, 36.08]])] }),
  z('serbs', 'other', 'serbs', SERBS), z('leon', 'other', 'castile', LEON), z('navarre', 'other', 'navarre', NAVARRE), z('cordoba', 'islam', 'taifas', IBERIA, { sea: BALEARIC_SEA }),
  z('zenata', 'islam', 'zenata', U(MOROCCO, ALGERIA_W)), z('zirids', 'islam', 'zirids', IFRIQIYA), z('sicily', 'islam', 'sicily', SICILY),
  z('lombards', 'other', 'lombards', BENEVENTO), z('rus', 'rus', 'rus', RUS_1000), z('tmutarakan', 'rus', 'tmutarakan', TMUTARAKAN),
  z('vbulgars', 'steppe', 'vbulgars', VOLGA_BULGARIA), z('alania', 'other', 'alania', ALANIA), z('cumans', 'steppe', 'cumans', CUMANS),
  z('georgia', 'other', 'georgia', GEORGIA), z('shirvan', 'islam', 'shirvan', SHIRVAN), z('jazira', 'islam', 'jazira', JAZIRA),
  z('fatimids', 'islam', 'fatimids', U(FATIMID_SYRIA, CYRENAICA), { sea: [SEA_LEVANT] }), z('seljuks', 'islam', 'seljuks', U(NEAR_EAST, ARMENIA, AZERBAIJAN, CASPIAN_S, KHORASAN)),
  S.balts(), S.north(),
]);
// 1261 – 1265: Largs; Iceland and Greenland under the Norwegian crown, the Isles still Norway's
const NORWAY_1263 = () => [S.norway(), z('faroes', 'norway', 'faroesNorway', FAROES), z('iceland', 'norway', 'icelandNorway', ICELAND),
  z('greenland-e', 'norway', 'greenlandENorway', GREENLAND_E), z('greenland-w', 'norway', 'greenlandWNorway', GREENLAND_W),
  z('orkney', 'norway', 'orkneyNorway', NORTHERN_ISLES)];
const IRELAND_1263 = () => [z('lordship', 'english', 'lordship', LORDSHIP), z('gaelic', 'celts', 'gaelic', IRELAND)];
period('1263', 1261, 1265, [
  NORWAY_1263(), z('isles', 'norse', 'mann', U(HEBRIDES, MAN), { sea: [SEA_MAN] }), z('scotland', 'celts', 'scotland', SCOT_1092),
  z('wales', 'celts', 'principalityWales', WALES), z('england', 'english', 'england', ENGLAND_1092), IRELAND_1263(),
]);
// 1266 – 1349: the Isles and Man to Scotland by the treaty of Perth; Greenland's Western Settlement empty by about 1350
period('1266', 1266, 1349, [
  NORWAY_1263(), z('scotland', 'celts', 'scotland', U(SCOT_1092, MAN), { sea: [SEA_MAN] }), z('wales', 'celts', 'principalityWales', WALES),
  z('england', 'english', 'england', ENGLAND_1092), IRELAND_1263(),
]);


// --- which page shows which period; close views and phase pages show none ---
const PAGES = {
  scandinavia: '790', longships: '790', lindisfarne: '790', iona: '790', ladoga: '790',
  godfred: '810', dorestad: '834', seville: '843', 'paris-845': '843', dublin: '843',
  mediterranean: '860', 'constantinople-860': '860', 'faroes-iceland': '860', 'great-army': '865',
  ashdown: '871', dumbarton: '871', repton: '877', chippenham: '877', edington: '877', hafrsfjord: '872', danelaw: '886', hastein: '886',
  'francia-879': '881', 'paris-885': '885', 'rurik-oleg': '907', tettenhall: '910', rollo: '911', islandbridge: '919', volga: '921',
  brunanburh: '937', landnam: '937', 'igor-olga': '945', 'eric-bloodaxe': '947', jelling: '970', sviatoslav: '970', dorostolon: '971',
  orkney: '1000', 'brian-boru': '1000', clontarf: '1000', maldon: '1000', 'st-brice': '1000', 'olaf-tryggvason': '1000', greenland: '1000', vinland: '1000',
  normandy: '1000', 'vladimir-yaroslav': '1000', society: '1000', thing: '1000', gods: '1000', silver: '1000', runes: '1000', warfare: '1000',
  sweyn: '1013', assandun: '1016', 'olaf-haraldsson': '1016', stiklestad: '1030', cnut: '1030',
  hardrada: '1066', fulford: '1066', 'stamford-bridge': '1066', hastings: '1066', largs: '1263', 'greenland-end': '1266',
};
const CLOSE_KM = 150;   // a page whose bbox is smaller than this both ways is a close view
// pages that show their subject across the whole Viking age take the Norse realms of about 1000 alone
const NORSE = ['danes', 'norway', 'swedes', 'rus', 'norse', 'normans'];
for (const page of ['society', 'thing', 'gods', 'silver', 'runes', 'warfare']) PAGES[page] = ['1000', NORSE];


// --- settle each period: land first, then corridors, then the sea; one Polygon per zone ---
const STORYLAND = LAND_NAMES.map(n => COUNTRY[n]).filter(Boolean);
const meeting = (list, g) => { const b = box(g); return list.filter(q => meets(q.bbox ??= turf.bbox(q), b)); };
// the outline a zone grows from: its pieces over half a square kilometre, without holes, a little simplified
const outline = (g, tol) => turf.multiPolygon(pieces(g).filter(q => km2(q) > 0.5).map(q => { const r = q.geometry.coordinates[0], s = dp(r, tol); return [s.length >= 4 ? s : r]; }));
function settle(p) {
  const out = [], placed = [];
  for (const s of p.zones) {
    let g = landOf(s.land);
    if (g) g = D(g, meeting(placed, g));
    if (!g || km2(g) < 1) throw new Error(`${p.id} ${s.key}: no land left`);
    if (process.env.DEBUG) console.log(`  ${p.id} ${s.key}: ${Math.round(km2(g))} km2`);
    out.push({ ...s, g, landPart: g });
    placed.push(...pieces(g));
  }
  if (process.env.GAPS) {
    const claimed = U(placed);
    for (const c of STORYLAND) for (const q of pieces(D(I(c, U(out.map(o => turf.bboxPolygon(box(o.landPart, 1))))), claimed)))
      if (km2(q) > (+process.env.GAPS || 20)) console.log(`  ${p.id}: unclaimed land, ${km2(q).toFixed(0)} km2 at ${at(q)}, box ${turf.bbox(q).map(c => c.toFixed(1))}`);
  }
  const water = [];
  const claim = (o, add) => { if (!add) return; o.g = U(o.g, add); water.push(...pieces(add)); };
  const step = (o, what, f) => { try { f(); } catch (e) { throw new Error(`${p.id} ${o.key}, ${what}: ${e.message}`); } };
  for (const o of out) for (const c of o.sea ?? []) step(o, 'corridor', () => claim(o, D(c, landNear(c), meeting(water, c))));
  for (const km of [3, 30]) for (const o of out) step(o, `${km} km of sea`, () => {
    const b = turf.buffer(outline(o.landPart, km / 1000), km, { units: 'kilometers' });
    claim(o, D(b, landNear(b), meeting(water, b)));
  });
  // loose bits of land are dropped: slivers cut off by a neighbour's line, islets under 150 km2, islands north of 62°.
  // A zone with `parts` splits into one zone per named piece, the piece holding that point; the largest keeps the key.
  const final = [], errors = [];
  for (const o of out) {
    const sized = pieces(o.g).map(q => [q, km2(landOf(q))]).sort((a, b) => b[1] - a[1]);
    const kept = sized.filter(([q, a], i) => i === 0 || (a > 150 && turf.centroid(q).geometry.coordinates[1] < 62)).map(([q]) => q);
    if (process.env.DEBUG) for (const [q, a] of sized.slice(1)) if (a > 1 && !kept.includes(q)) console.log(`  ${p.id} ${o.key}: dropped ${a.toFixed(0)} km2 at ${at(q)}`);
    const named = kept.map((q, i) => [i === 0 ? o.key : Object.entries(o.parts ?? {}).find(([, [pt]]) => turf.booleanPointInPolygon(pt, q))?.[0], q]);
    const loose = named.filter(([k]) => !k);
    if (loose.length) { errors.push(`${p.id} ${o.key}: ${kept.length} pieces with land, loose: ${loose.map(([, q]) => `${km2(landOf(q)).toFixed(0)} km2 at ${at(q)}, box ${turf.bbox(q).map(c => c.toFixed(2))}`).join('; ')}`); continue; }
    for (const [k, q] of named) {
      const [en, tr] = k === o.key ? [o.en, o.tr] : o.parts[k][1];
      final.push({ ...o, key: k === o.key ? k : `${o.key}-${k}`, en, tr, g: q, landPart: I(o.landPart, q) });
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return final;
}

// the periods settle in parallel worker threads, each of which evaluates this file up to here
const RUN = PERIODS.filter(p => !process.env.ONLY || process.env.ONLY.split(',').includes(p.id));
if (!isMainThread) {
  const out = {};
  for (const id of workerData.ids) {
    const t = Date.now();
    try {
      out[id] = settle(PERIODS.find(p => p.id === id)).map(({ key, family, en, tr, span, g, landPart }) => ({ key, family, en, tr, span, g, landPart }));
    } catch (e) { out[id] = { error: e.message }; }
    console.log(`${id}: ${out[id].error ? 'failed' : `${out[id].length} zones`}, ${((Date.now() - t) / 1000).toFixed(1)} s`);
  }
  parentPort.postMessage(out);
} else await main();

async function main() {
  const lanes = Math.max(1, Math.min(os.cpus().length - 2, 8, RUN.length));
  const cached = process.env.CACHE && fs.existsSync(process.env.CACHE) ? JSON.parse(fs.readFileSync(process.env.CACHE, 'utf8')) : null;
  const SETTLED = cached ?? Object.assign({}, ...await Promise.all([...Array(lanes)].map((_, i) => new Promise((resolve, reject) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { ids: RUN.filter((_, j) => j % lanes === i).map(p => p.id) }, resourceLimits: { maxOldGenerationSizeMb: 6144 } });
    w.on('message', m => { resolve(m); w.terminate(); }); w.on('error', reject);
  }))));
  if (process.env.CACHE && !cached) fs.writeFileSync(process.env.CACHE, JSON.stringify(SETTLED));
  const failed = Object.entries(SETTLED).filter(([, v]) => v.error);
  for (const [id, v] of failed) console.log(`period ${id}: ${v.error}`);
  if (failed.length) process.exit(1);

  // a picture of each settled period, to look at while drawing
  if (process.env.SVG) {
    const COLORS = Object.fromEntries(Object.entries(storyYaml.families).map(([f, c]) => [f, c.color]));
    fs.mkdirSync(process.env.SVG, { recursive: true });
    for (const p of RUN) {
      const [w, s, e, n] = (process.env.SVG_BOX ?? '-12,34,60,71').split(',').map(Number);
      const k = Math.cos((s + n) / 2 * Math.PI / 180), W = 2400, sc = W / ((e - w) * k), H = Math.round((n - s) * sc);
      const pt = q => `${((q[0] - w) * k * sc).toFixed(1)},${((n - q[1]) * sc).toFixed(1)}`;
      const d = g => pieces(g).flatMap(q => q.geometry.coordinates.map(r => 'M' + r.map(pt).join('L') + 'Z')).join('');
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#cfe3f5"/>`;
      for (const c of STORYLAND) svg += `<path d="${d(c)}" fill="#eeeeee" stroke="#999" stroke-width="0.4"/>`;
      for (const o of SETTLED[p.id]) {
        svg += `<path d="${d(o.landPart)}" fill="${COLORS[o.family]}" fill-opacity="0.55" stroke="#000" stroke-width="0.7"/>`;
        const [x, y] = turf.pointOnFeature(pieces(o.landPart).sort((a, b) => km2(b) - km2(a))[0]).geometry.coordinates;
        svg += `<text x="${pt([x, y]).split(',')[0]}" y="${pt([x, y]).split(',')[1]}" font-size="13" text-anchor="middle">${o.key}</text>`;
      }
      fs.writeFileSync(path.join(process.env.SVG, `${p.id}.svg`), svg + '</svg>');
    }
  }

  // --- one zone per shape: a state whose land stays the same keeps its zone into the next period ---
  const ZONES = {}, last = {};
  // land that differs only by float noise or by islets under 50 km2, kept or dropped as the sea around them fell, is the same
  const same = (a, b) => { const d = [...pieces(D(a, b)), ...pieces(D(b, a))].map(km2); return d.every(x => x < 50) && d.reduce((x, y) => x + y, 0) < 150; };
  // periods in the order of time; a state takes the zone of the last period before that had it, when its name and land stayed and no
  // more than 30 years lie between, so a zone's years run unbroken
  for (const p of RUN.slice().sort((a, b) => a.from - b.from || a.to - b.to)) {
    p.ids = {};
    for (const o of SETTLED[p.id]) {
      const e = last[o.key];
      let zn = e && e.zn.family === o.family && e.zn.en === o.en && e.zn.tr === o.tr && e.zn.span === o.span && e.to + 30 >= p.from && same(e.zn.landPart, o.landPart) ? e.zn : null;
      if (!zn) {
        const id = ZONES[`${o.key}-${p.id}`] ? `${o.key}-${p.id}b` : `${o.key}-${p.id}`;
        zn = ZONES[id] = { id, key: o.key, family: o.family, en: o.en, tr: o.tr, span: o.span, g: o.g, landPart: o.landPart, periods: [] };
      }
      zn.periods.push(p);
      p.ids[o.key] = zn.id;
      last[o.key] = { zn, to: Math.max(p.to, e?.zn === zn ? e.to : 0) };
    }
  }
  const years = (a, b) => a === b ? `${a}` : `${a} – ${b}`;
  for (const zn of Object.values(ZONES)) {
    const span = zn.span ?? years(Math.min(...zn.periods.map(p => p.from)), Math.max(...zn.periods.map(p => p.to)));
    zn.name = { en: `${zn.en}, ${span}`, tr: `${zn.tr}, ${span}` };
  }

  // --- shared borders carry the same points: a vertex of one zone that lies on another's edge is added to it ---
  const rings = g => g.geometry.coordinates;
  const all = Object.values(ZONES).map(zn => ({ zn, bbox: turf.bbox(zn.g), points: rings(zn.g).flat() }));
  for (const target of all) {
    const [w, s, e, n] = target.bbox;
    const cand = all.filter(o => o !== target && o.bbox[0] <= e && o.bbox[2] >= w && o.bbox[1] <= n && o.bbox[3] >= s).flatMap(o => o.points);
    for (const ring of rings(target.zn.g)) for (let i = ring.length - 2; i >= 0; i--) {
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

  // --- write the zones, the page map and the Turkish names ---
  // the legend lists the Norse first, then the powers around them, then the peoples
  const FAMILY_ORDER = ['danes', 'norway', 'swedes', 'rus', 'norse', 'normans', 'english', 'anglo', 'celts', 'franks', 'byzantium', 'islam', 'bulgaria', 'steppe', 'other'];
  // a page lists the zones of its period that reach into its view: the bbox widened to a square map and a margin
  const PAGE_BBOX = {};
  const walk = dir => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) {
    const sub = path.join(dir, e.name), file = path.join(sub, 'page.yaml');
    if (fs.existsSync(file)) PAGE_BBOX[e.name.replace(/^\d+-/, '')] = yaml.load(fs.readFileSync(file, 'utf8'))?.bbox;
    walk(sub);
  } };
  walk(path.join(story, 'pages'));
  // the map fits a page's bbox in a frame about 1.2 times as wide as high, with a margin
  const view = ([w, s, e, n]) => {
    const k = Math.cos((s + n) / 2 * Math.PI / 180), dx = (e - w) * k, dy = n - s;
    const hx = Math.max(dx, dy * 1.2) * 0.53, hy = Math.max(dy, dx / 1.2) * 0.53, cx = (w + e) / 2, cy = (s + n) / 2;
    return turf.bboxPolygon([cx - hx / k, cy - hy, cx + hx / k, cy + hy]);
  };
  // pages whose view spans half of Europe list only the realms their events touch, so the legend stays short
  const PAGE_ONLY = {
    hardrada: ['denmark-970', 'norway-1066', 'sweden-1066', 'rus-1000', 'normans-italy-1066', 'hre-1066', 'byzantium-1066', 'sicily-970',
      'cumans-1066', 'hungary-1000', 'poland-1066'],
    cnut: ['norway-1030', 'england-1030', 'denmark-970', 'sweden-970', 'orkney-1000', 'normandy-937', 'scotland-1030', 'wales-790', 'hre-1000',
      'france-1000', 'burgundy-937', 'poland-1000'],
    sviatoslav: ['rus-970', 'rusbulgaria-970', 'byzantium-970', 'bulgaria-970', 'pechenegs-970', 'oghuz-970', 'vbulgars-790', 'hungary-907',
      'alania-907', 'slavs-970'],
  };
  const sizeKm = ([w, s, e, n]) => [(e - w) * 111.32 * Math.cos((s + n) / 2 * Math.PI / 180), (n - s) * 110.57];
  const PAGE_ZONES = {}, missing = [];
  for (const [page, entry] of Object.entries(PAGES)) {
    const [pid, families] = Array.isArray(entry) ? entry : [entry, null];
    const p = PERIODS.find(q => q.id === pid);
    if (!p) throw new Error(`${page}: unknown period ${pid}`);
    if (!p.ids) continue;
    const bbox = PAGE_BBOX[page];
    if (!bbox) { missing.push(page); continue; }
    if (sizeKm(bbox).every(x => x < CLOSE_KM)) { PAGE_ZONES[page] = []; continue; }
    // a zone is listed when its land in view is at least half a percent of all land in view, or when it is a small Norse
    // realm seen whole; a sliver at the edge of a wide view is left out to keep the legend short
    const v = view(bbox);
    const order = id => [FAMILY_ORDER.indexOf(ZONES[id].family), -km2(ZONES[id].landPart)];
    const inView = Object.fromEntries(Object.values(p.ids).filter(id => !families || families.includes(ZONES[id].family)).map(id => [id, km2(I(ZONES[id].landPart, v))]));
    const total = Object.values(inView).reduce((a, b) => a + b, 0);
    const whole = id => inView[id] >= km2(ZONES[id].landPart) * 0.98;
    const ids = Object.keys(inView).filter(id => inView[id] > 0 && (whole(id) || inView[id] >= total * 0.005 || (NORSE.includes(ZONES[id].family) && inView[id] >= km2(ZONES[id].landPart) / 2)));
    // a legend over 20 rows loses its smallest zones cut by the edge of the view; Norse realms and zones seen whole stay
    const edge = ids.filter(id => !NORSE.includes(ZONES[id].family) && !whole(id) && inView[id] < total * 0.02).sort((a, b) => inView[a] - inView[b]);
    while (ids.length > 20 && edge.length) ids.splice(ids.indexOf(edge.shift()), 1);
    PAGE_ZONES[page] = ids.sort((a, b) => { const [fa, sa] = order(a), [fb, sb] = order(b); return fa - fb || sa - sb; })
      .filter(id => !PAGE_ONLY[page] || PAGE_ONLY[page].includes(id));
  }
  if (missing.length) console.log(`no page.yaml with a bbox yet: ${missing.join(', ')}`);
  for (const [page, ids] of Object.entries(PAGE_ZONES)) if (ids.length > 20) console.log(`  ${page}: ${ids.length} zones`);
  if (process.env.ONLY) return;
  const r7 = x => Math.round(x * 1e7) / 1e7;
  const dir = path.join(story, 'shared', 'zones');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  // only zones some page shows go to disk
  const USED = Object.values(ZONES).filter(zn => Object.values(PAGE_ZONES).some(ids => ids.includes(zn.id)));
  for (const zn of USED) {
    const coordinates = rings(zn.g).map(r => r.map(q => q.map(r7)));
    fs.writeFileSync(path.join(dir, zn.id + '.geojson'), JSON.stringify({ type: 'Feature', properties: { family: zn.family, name: zn.name.en }, geometry: { type: 'Polygon', coordinates } }) + '\n');
  }
  fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per page, written by .plans/zones.mjs. Close views and phase pages show none.\n'
    + Object.entries(PAGE_ZONES).map(([page, ids]) => `${page}: [${ids.join(', ')}]`).join('\n') + '\n');
  fs.mkdirSync(path.join(story, '.i18n-parts'), { recursive: true });
  fs.writeFileSync(path.join(story, '.i18n-parts', 'zones.tr.yaml'), USED.map(zn => `zones.${zn.id}.name: ${JSON.stringify(zn.name.tr)}`).join('\n') + '\n');
  console.log(`${USED.length} zones, ${Object.keys(PAGE_ZONES).length} pages`);
}
