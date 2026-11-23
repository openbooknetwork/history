// Keeps a route on its surface: between waypoints whose straight line leaves the surface, it finds a path on a
// 0.01° grid (A*) and pulls it straight again. Usage from a script: fix(mode, coords) -> coords.
// CLI: node router.cjs <sea|land> <route.geojson>...  rewrites the files in place.
const fs = require('fs'), path = require('path');
const R = p => require(path.resolve('node_modules', p));
const turf = R('@turf/turf'), topo = R('topojson-client');
const atlas = R('world-atlas/land-10m.json');
const land = turf.flatten(topo.feature(atlas, atlas.objects.land)).features.map(f => ({ f, b: turf.bbox(f) }));
const onLand = p => land.some(({ f, b }) => p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3] &&
  turf.booleanPointInPolygon(p, f));
const ok = (mode, p) => mode === 'sea' ? !onLand(p) : onLand(p);
const km = (a, b) => { const k = Math.cos((a[1] + b[1]) / 2 * Math.PI / 180); return 111 * Math.hypot((a[0] - b[0]) * k, a[1] - b[1]); };
function clear(mode, a, b, skipEnds) {
  const n = Math.max(2, Math.ceil(km(a, b) / 0.05));
  for (let i = 0; i <= n; i++) {
    if (skipEnds && (i < 3 && skipEnds.a || i > n - 3 && skipEnds.b)) continue;
    const t = i / n; if (!ok(mode, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])) return false;
  }
  return true;
}
function astar(mode, a, b) {
  const st = 0.01, pad = 0.4;
  const w = Math.min(a[0], b[0]) - pad, s = Math.min(a[1], b[1]) - pad;
  const W = Math.ceil((Math.abs(a[0] - b[0]) + 2 * pad) / st), H = Math.ceil((Math.abs(a[1] - b[1]) + 2 * pad) / st);
  const P = (i, j) => [w + i * st, s + j * st];
  const cache = new Map();
  const good = (i, j) => { const k = i * 100000 + j; if (!cache.has(k)) { const q = P(i, j), e = 0.005; cache.set(k, ok(mode, q) && ok(mode, [q[0] + e, q[1]]) && ok(mode, [q[0] - e, q[1]]) && ok(mode, [q[0], q[1] + e]) && ok(mode, [q[0], q[1] - e])); }; return cache.get(k); };
  const si = Math.round((a[0] - w) / st), sj = Math.round((a[1] - s) / st);
  const ti = Math.round((b[0] - w) / st), tj = Math.round((b[1] - s) / st);
  const key = (i, j) => i * 100000 + j;
  const g = new Map([[key(si, sj), 0]]), from = new Map(), open = [[0, si, sj]];
  const h = (i, j) => km(P(i, j), P(ti, tj));
  while (open.length) {
    let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
    const [, i, j] = open.splice(bi, 1)[0];
    if (i === ti && j === tj) break;
    const gc = g.get(key(i, j));
    for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni > W || nj > H) continue;
      const near = Math.abs(ni - ti) + Math.abs(nj - tj) <= 3 || Math.abs(ni - si) + Math.abs(nj - sj) <= 3;
      if (!near && !good(ni, nj)) continue;
      const ng = gc + km(P(i, j), P(ni, nj));
      if (ng < (g.get(key(ni, nj)) ?? Infinity)) { g.set(key(ni, nj), ng); from.set(key(ni, nj), [i, j]); open.push([ng + h(ni, nj), ni, nj]); }
    }
  }
  if (!from.has(key(ti, tj))) throw new Error(`no ${mode} path ${a} -> ${b}`);
  const out = []; let c = [ti, tj];
  while (c) { out.push(P(c[0], c[1])); c = from.get(key(c[0], c[1])); }
  out.reverse(); out[0] = a; out[out.length - 1] = b;
  // pull straight
  const res = [out[0]]; let k = 0;
  while (k < out.length - 1) {
    let far = k + 1;
    for (let m = out.length - 1; m > k + 1; m--) if (clear(mode, out[k], out[m], { a: k === 0, b: m === out.length - 1 })) { far = m; break; }
    res.push(out[far]); k = far;
  }
  return res;
}
function fix(mode, coords) {
  coords = coords.filter((p, i) => i === 0 || i === coords.length - 1 || ok(mode, p));
  const out = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1], b = coords[i];
    const ends = { a: i === 1, b: i === coords.length - 1 };
    if (clear(mode, a, b, ends)) out.push(b);
    else out.push(...astar(mode, a, b).slice(1));
  }
  return out.map(p => p.map(x => Math.round(x * 10000) / 10000));
}
module.exports = { fix };
if (require.main === module) {
  const [mode, ...files] = process.argv.slice(2);
  for (const f of files) {
    const r = JSON.parse(fs.readFileSync(f));
    r.geometry.coordinates = fix(mode, r.geometry.coordinates);
    fs.writeFileSync(f, JSON.stringify(r) + '\n');
    console.log(path.basename(f), r.geometry.coordinates.length, 'points');
  }
}
