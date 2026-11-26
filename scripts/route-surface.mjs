// Tests that a route stays on its surface: a sea route on water, a land route on land. Run from the repo root:
//   node scripts/route-surface.mjs <sea|land> <route.geojson>...
//   node scripts/route-surface.mjs <story> <section number> [--sea <route id>,...] [--land <route id>,...]
// Try: node scripts/route-surface.mjs alexander-the-great 020
// The second form tests every route of a section. The routes are those of the section's plan,
// content/<story>/.plan/<number>-<section id>/map.yaml, and without that folder those each page.yaml under
// content/<story>/pages/<number>-<section id>/ lists. A route's line is the file <route id>.geojson in a routes
// folder of the story. A route of the plan with no file yet is listed as not drawn.
//
// A route file has no field for its surface, so the second form reads it from the route's words: its id, the name
// in its file and the stations of its plan. A word of ships makes it a sea route: fleet, ship, warship, trireme,
// galley, sail, voyage, ferry, naval, squadron, "by sea". Every other route is a land route. Each line prints the
// word that decided, or "land, no word of the sea". A crossing of a strait says "crosses" and reads as land: name
// it with --sea. --sea and --land take route ids and overrule the words.
//
// Samples the line every 200 m against Natural Earth land at 1:10m and prints each stretch on the wrong surface with
// its length and how far it runs from the coast. That land has no rivers and closes fjords and lagoon inlets, and it
// puts a port a kilometre or two from its water: judge those stretches on a capture. A fleet on a river prints as on
// land for its whole length. It cannot judge a route that is half march and half voyage: split it, a route keeps to
// one surface.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';
const require = createRequire(import.meta.url);
const turf = require('@turf/turf');
const topo = require('topojson-client');
const atlas = require('world-atlas/land-10m.json');
const land = topo.feature(atlas, atlas.objects.land);
const polys = turf.flatten(land).features;

// Prints one route's stretches on the wrong surface. r is a GeoJSON LineString feature, mode sea or land.
function test(r, mode, label, said = mode) {
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
  console.log(`${label} (${said}, ${len.toFixed(0)} km): ${bad.length ? '' : 'clean'}`);
  for (const b of bad) console.log(`  km ${b.from.toFixed(1)}-${b.to.toFixed(1)} (${(b.to - b.from + 0.2).toFixed(1)} km) from ${b.at.map(x => x.toFixed(3))}, max ${b.max.toFixed(2)} km at ${b.maxAt.map(x => x.toFixed(3))}`);
  return bad.length;
}

const SEA = /\b(fleets?|ships?|warships?|triremes?|galleys?|sail(?:s|ed|ing)?|voyages?|ferr(?:y|ies|ied)|naval|squadrons?|by sea)\b/i;
// The surface of a route from its words: { mode, said }.
function surface(id, words, forced = {}) {
  if (forced.sea?.includes(id)) return { mode: 'sea', said: 'sea, by --sea' };
  if (forced.land?.includes(id)) return { mode: 'land', said: 'land, by --land' };
  const hit = [id.replace(/-/g, ' '), ...words].join('. ').match(SEA);
  return hit ? { mode: 'sea', said: `sea, by "${hit[0].toLowerCase()}"` } : { mode: 'land', said: 'land, no word of the sea' };
}

function stop(message) { console.error(message); process.exit(2); }
const usage = 'usage: node scripts/route-surface.mjs <sea|land> <route.geojson>..., or <story> <section number> [--sea <route id>,...] [--land <route id>,...], from the repo root';

function files(mode, list) {
  for (const file of list) {
    const r = file.startsWith('[') ? turf.lineString(JSON.parse(file)) : JSON.parse(fs.readFileSync(file));
    test(r, mode, file.startsWith('[') ? 'inline' : file.split('/').pop());
  }
}

function section(argv) {
  const forced = { sea: [], land: [] }, names = [];
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i].startsWith('--') ? argv[i].slice(2) : null;
    if (flag === null) names.push(argv[i]);
    else if (flag in forced && argv[i + 1] !== undefined) forced[flag].push(...argv[++i].split(',').filter(Boolean));
    else stop(`unknown option ${argv[i]}\n${usage}`);
  }
  if (names.length !== 2) stop(usage);
  const [storyName, number] = names, story = storyDir(storyName);
  if (!story) stop(`${storyName}: no story folder has that name`);
  const read = file => yaml.load(fs.readFileSync(file, 'utf8')) ?? {};
  const walk = (dir, test, found = []) => {
    if (!fs.existsSync(dir)) return found;
    for (const d of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) walk(full, test, found); else if (test(d.name, full)) found.push(full);
    }
    return found;
  };
  const numbered = dir => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(`${number}-`))?.name : null;

  // the routes of the section in page order: { id, page, words }
  const routes = [], planName = numbered(path.join(story, '.plan'));
  let from = planName && path.join(story, '.plan', planName, 'map.yaml');
  if (from && fs.existsSync(from)) {
    for (const [page, entry] of Object.entries(read(from))) for (const r of entry?.routes ?? []) if (r?.id) routes.push({ id: r.id, page, words: r.stations ?? [] });
  } else {
    const name = numbered(path.join(story, 'pages'));
    if (!name) stop(`${story} has no section numbered ${number}, in .plan/ or in pages/`);
    from = path.join(story, 'pages', name);
    for (const file of walk(from, n => n === 'page.yaml')) for (const id of [read(file).routes ?? []].flat(Infinity)) routes.push({ id, page: path.basename(path.dirname(file)).replace(/^\d+-/, ''), words: [] });
  }
  const drawn = {};
  for (const file of walk(story, (n, full) => n.endsWith('.geojson') && full.split(path.sep).includes('routes'))) drawn[path.basename(file, '.geojson')] ??= file;
  for (const id of [...forced.sea, ...forced.land]) if (!routes.some(r => r.id === id)) stop(`${id} is no route of ${from}`);

  let off = 0, missing = 0;
  const seen = new Set();
  for (const r of routes) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    if (!drawn[r.id]) { console.log(`${r.page}/${r.id}: not drawn, no ${r.id}.geojson in a routes folder of ${story}`); missing++; continue; }
    const doc = JSON.parse(fs.readFileSync(drawn[r.id], 'utf8')), feature = doc.type === 'FeatureCollection' ? doc.features[0] : doc;
    if (feature?.geometry?.type !== 'LineString') { console.log(`${r.page}/${r.id}: ${drawn[r.id]} is no LineString`); missing++; continue; }
    const { mode, said } = surface(r.id, [feature.properties?.name ?? '', ...r.words], forced);
    if (test(feature, mode, `${r.page}/${r.id}`, said)) off++;
  }
  console.log(`\n${seen.size} routes of ${from}: ${off} with a stretch to judge${missing ? `, ${missing} not tested` : ''}.`);
}

const [first, ...rest] = process.argv.slice(2);
if (first === 'sea' || first === 'land') files(first, rest);
else if (first) section([first, ...rest]);
else stop(usage);
