// Prints the Natural Earth 10m coastline points of a country inside a box, the coast the map draws, so a battle
// plan can fit its water and walls to it: node scripts/coast.mjs Italy 12.3 37.8 12.6 38.1
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const w = require('world-atlas/countries-10m.json'), tc = require('topojson-client');
const [name, x0, y0, x1, y1] = process.argv.slice(2); const [a, b, c, d] = [x0, y0, x1, y1].map(Number);
const f = tc.feature(w, w.objects.countries).features.find(f => f.properties.name === name);
const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
for (const p of polys) { const pts = p[0].filter(([x, y]) => x >= a && x <= c && y >= b && y <= d); if (pts.length) console.log(pts.map(([x, y]) => `[${x.toFixed(3)},${y.toFixed(3)}]`).join(' ')); }
