// Writes rivers.json beside it: the modern courses of the Indus and the Punjab rivers, from Natural Earth's 10m
// river centrelines (public domain), joined in downstream order and simplified. zones.cjs and the page scripts
// draw the 070 borders and river routes along them. Run once from the repo root with the downloaded file:
//   node content/alexander-the-great/.plans/rivers.cjs <ne_10m_rivers_lake_centerlines.geojson>
// Bosworth warns that the Punjab rivers have moved (ch. 2.XVI): these are the modern courses.
const fs = require('fs');
const path = require('path');
const turf = require(path.resolve('node_modules/@turf/turf'));
const g = JSON.parse(fs.readFileSync(process.argv[2]));
const lines = name => g.features.filter(f => (f.properties.name || '') === name)
  .flatMap(f => f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates);
// joins the pieces that chain end to start, beginning at the piece that starts nearest `from`
function chain(names, from) {
  const pieces = names.flatMap(lines).filter(l => l.length > 2);
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  let cur = pieces.sort((a, b) => d(a[0], from) - d(b[0], from))[0];
  const out = cur.slice();
  for (;;) {
    const end = out[out.length - 1];
    const next = pieces.find(l => l !== cur && d(l[0], end) < 0.02 && !out.includes(l[1]));
    if (!next) break;
    out.push(...next.slice(1)); cur = next;
  }
  const s = turf.simplify(turf.lineString(out), { tolerance: 0.004, highQuality: true }).geometry.coordinates;
  return s.map(p => p.map(x => Math.round(x * 10000) / 10000));
}
const R = {
  indus: chain(['Indus'], [79.44, 32.74]).filter(p => p[0] < 73.6 && p[1] < 35.6),
  jhelum: chain(['Jhelum'], [75.37, 33.44]),
  chenab: chain(['Chenab'], [77.44, 32.29]),
  ravi: chain(['Ravi'], [76.83, 32.33]),
  beas: chain(['Beas'], [77.2, 32.26]),
  sutlej: chain(['Sutlej'], [81.2, 30.85]).filter(p => p[0] < 77),
};
fs.writeFileSync(path.join(__dirname, 'rivers.json'), JSON.stringify(R) + '\n');
for (const [k, v] of Object.entries(R)) console.log(k, v.length, v[0], v[v.length - 1]);
