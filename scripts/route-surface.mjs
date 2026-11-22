// Tests that a route stays on its surface: a sea route on water, a land route on land. Run from the repo root:
//   node scripts/route-surface.mjs <sea|land> <route.geojson>...
// Samples the line every 200 m against Natural Earth land at 1:10m and prints each stretch on the wrong surface with
// its length and how far it runs from the coast. That land has no rivers and closes fjords and lagoon inlets, and it
// puts a port a kilometre or two from its water: judge those stretches on a capture.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const turf = require('@turf/turf');
const topo = require('topojson-client');
const atlas = require('world-atlas/land-10m.json');
const land = topo.feature(atlas, atlas.objects.land);
const polys = turf.flatten(land).features;
const [mode, ...files] = process.argv.slice(2);
for (const file of files) {
  const r = file.startsWith('[') ? turf.lineString(JSON.parse(file)) : JSON.parse(fs.readFileSync(file));
  const bb = turf.bbox(r); const pad = 0.5;
  const box = [bb[0]-pad, bb[1]-pad, bb[2]+pad, bb[3]+pad];
  const near = polys.filter(f => { const b = turf.bbox(f); return b[2] > box[0] && b[0] < box[2] && b[3] > box[1] && b[1] < box[3]; })
    .map(f => turf.bboxClip(f, box)).filter(f => f.geometry.coordinates.length);
  const coast = near.flatMap(f => turf.flatten(turf.polygonToLine(f)).features);
  const onLand = p => near.some(f => turf.booleanPointInPolygon(turf.point(p), f));
  const dist = p => Math.min(...coast.map(l => turf.pointToLineDistance(turf.point(p), l, { units: 'kilometers' })));
  const len = turf.length(r); const bad = [];
  let cur = null;
  for (let k = 0; k <= len; k += 0.2) {
    const p = turf.along(r, k).geometry.coordinates;
    const wrong = mode === 'sea' ? onLand(p) : !onLand(p);
    if (wrong) { if (!cur) cur = { from: k, at: p, max: 0, maxAt: p }; cur.to = k; const d = dist(p); if (d > cur.max) { cur.max = d; cur.maxAt = p; } }
    else if (cur) { bad.push(cur); cur = null; }
  }
  if (cur) bad.push(cur);
  console.log(`${file.startsWith('[') ? 'inline' : file.split('/').pop()} (${mode}, ${len.toFixed(0)} km): ${bad.length ? '' : 'clean'}`);
  for (const b of bad) console.log(`  km ${b.from.toFixed(1)}-${b.to.toFixed(1)} (${(b.to - b.from + 0.2).toFixed(1)} km) from ${b.at.map(x => x.toFixed(3))}, max ${b.max.toFixed(2)} km at ${b.maxAt.map(x => x.toFixed(3))}`);
}
