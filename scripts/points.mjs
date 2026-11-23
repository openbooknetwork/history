// Prints which zone holds each place a section marks, page by page, and how far the place is from the zone's edge.
// Run from the repo root:
//   node scripts/points.mjs <story> <section number> [--near <km>] [--cache <dir>]
//
// The places are the markers of the section's plan, content/<story>/.plan/<number>-<section id>/pages.yaml, and the
// zones and the frame of each page are those of map.yaml beside it. A section with no such folder is read from its
// built pages: the markers, zones and bbox of each page.yaml under content/<story>/pages/<number>-<section id>/.
// A place's point is its lnglat in the story's markers.yaml files.
//
// A zone's shape is the one the build drew, .cache/kitap/stories/<story>/zones.json, where each zone is already cut
// by the zones that outrank it and by the coast. So a place is in the zone the reader sees it in. A zone the build
// has not drawn yet, or every zone when the story has no build, takes its drawing as the story's zones folders hold
// it, and the line says "uncut". Where two drawings hold a place, the zone whose family has the lower priority number
// in story.yaml holds it, as in the build, and the line names the zone it is drawn over. An uncut drawing runs out
// to sea and past its clip countries, so its edge is no coast, and the other zone its line names is the nearest
// that outranks it or shares its family.
//
// One line per place and page, the places nearest a border first:
//   <km>  <place>  <page>: in <zone>, <km> from its edge[, the coast], <km> from <the nearest other zone>
// The first figure is the distance to the zone's edge. Where that edge is the coast, by Natural Earth land at 1:10m,
// the line says so and the first figure is the distance to the nearest other zone of the page instead, so a port
// deep inside a state does not come first. An uncut drawing can have a zone that outranks it nearer than its own
// edge, and the first figure is then the nearer of the two. A place in no zone prints as bare with the nearest zone and its distance,
// and a place outside the page's bbox says so. --near prints only the lines within that many km. A battle's phase
// pages are left out, since they draw a battlefield with no zones.
//
// It cannot judge which zone a place belongs in, or whether the point is the right one: it measures, and the
// map-auditor looks at the first lines. A coast the build drew more than a kilometre or two from Natural Earth's
// reads as a border, and a place on a river mouth or a lagoon can read as on the coast or off it. It always ends
// with status 0, and with 2 when it cannot read the section.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const require = createRequire(import.meta.url);
const turf = require('@turf/turf');

function stop(message) { console.error(message); process.exit(2); }
const usage = 'usage: node scripts/points.mjs <story> <section number> [--near <km>] [--cache <dir>], from the repo root';

const opts = { near: Infinity, cache: '.cache/kitap' }, names = [];
for (let argv = process.argv.slice(2), i = 0; i < argv.length; i++) {
  const flag = argv[i].startsWith('--') ? argv[i].slice(2) : null;
  if (flag === null) names.push(argv[i]);
  else if (flag in opts && argv[i + 1] !== undefined) opts[flag] = flag === 'cache' ? argv[++i] : +argv[++i];
  else stop(`unknown option ${argv[i]}\n${usage}`);
}
if (names.length !== 2 || Number.isNaN(opts.near)) stop(usage);
const [storyName, number] = names;
const story = storyDir(storyName);
if (!story) stop(`${storyName}: no story folder has that name`);

const read = file => yaml.load(fs.readFileSync(file, 'utf8')) ?? {};
const bare = name => name.replace(/^\d+-/, '');
// every file under dir that test accepts, folders in name order
function walk(dir, test, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const d of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) walk(full, test, found); else if (test(d.name, full)) found.push(full);
  }
  return found;
}
const numbered = dir => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).find(d => d.isDirectory() && d.name.startsWith(`${number}-`))?.name : null;

// --- the section's pages: { id, markers, zones, bbox } ---
let pages, from;
const planName = numbered(path.join(story, '.plan'));
if (planName && fs.existsSync(path.join(story, '.plan', planName, 'pages.yaml'))) {
  const folder = path.join(story, '.plan', planName), mapFile = path.join(folder, 'map.yaml');
  const map = fs.existsSync(mapFile) ? read(mapFile) : {};
  if (!fs.existsSync(mapFile)) console.log(`note: ${folder} has no map.yaml yet, so no page has zones or a frame.\n`);
  pages = [read(path.join(folder, 'pages.yaml'))].flat().filter(p => p?.id && !p.phase_of)
    .map(p => ({ id: p.id, markers: p.markers ?? [], zones: map[p.id]?.zones ?? [], bbox: map[p.id]?.bbox ?? null }));
  from = path.join(folder, 'pages.yaml');
} else {
  const name = numbered(path.join(story, 'pages'));
  if (!name) stop(`${story} has no section numbered ${number}, in .plan/ or in pages/`);
  from = path.join(story, 'pages', name);
  pages = walk(from, n => n === 'page.yaml').map(file => ({ file, page: read(file) })).filter(({ page }) => page.emblem?.kind !== 'battle-plan')
    .map(({ file, page }) => ({ id: bare(path.basename(path.dirname(file))), markers: page.markers ?? [], zones: page.zones ?? [], bbox: Array.isArray(page.bbox) ? page.bbox : null }));
}

// --- the points: every markers.yaml of the story, ids are the story's ---
const points = {};
for (const file of walk(story, n => n === 'markers.yaml')) for (const [id, m] of Object.entries(read(file))) if (Array.isArray(m?.lnglat)) points[id] ??= m.lnglat;

// --- the shapes: the build's, else the drawing ---
const cacheFile = path.join(opts.cache, 'stories', path.basename(story), 'zones.json');
const built = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')).shapes ?? {} : null;
if (!built) console.log(`note: ${cacheFile} is missing, so every zone is its drawing, uncut. Build the story to test what the reader sees.\n`);
let drawings = null, aliases = null;
function drawing(id, seen = new Set()) {
  if (!drawings) {
    drawings = {}; aliases = {};
    for (const file of walk(story, (n, full) => n.endsWith('.geojson') && full.split(path.sep).includes('zones'))) drawings[path.basename(file, '.geojson')] ??= file;
    for (const file of walk(path.join('content', 'shared', 'zones'), n => n === 'zone.geojson')) drawings[path.basename(path.dirname(file))] ??= file;
    for (const file of walk(story, n => n === 'zones.yaml')) for (const [k, v] of Object.entries(read(file))) if (v?.zone) aliases[k] ??= v;
  }
  if (drawings[id]) {
    const doc = JSON.parse(fs.readFileSync(drawings[id], 'utf8')), f = doc.type === 'FeatureCollection' ? doc.features[0] : doc;
    return { feature: f, family: f?.properties?.family ?? null };
  }
  if (!aliases[id] || seen.has(id)) return null;
  const of = drawing(aliases[id].zone, seen.add(id));
  return of && { feature: of.feature, family: aliases[id].family ?? of.family };
}
const storyFile = read(path.join(story, 'story.yaml')), families = storyFile.harita?.families ?? storyFile.families ?? {};
const rank = z => families[z.family]?.priority ?? Infinity;
// a zone ready to measure: its rings as lines with their boxes, or null for a zone with no shape anywhere
const zones = new Map();
function zone(id) {
  if (!zones.has(id)) {
    const cut = built?.[id]?.geometry ? built[id] : null, drawn = cut ? null : drawing(id), feature = cut ?? drawn?.feature;
    zones.set(id, feature?.geometry ? { id, uncut: !cut, family: drawn?.family, feature, box: turf.bbox(feature), rings: rings(feature) } : null);
  }
  return zones.get(id);
}
function rings(feature) {
  return turf.flatten(feature).features.flatMap(f => f.geometry.coordinates.map(c => ({ line: turf.lineString(c), box: turf.bbox(turf.lineString(c)) })));
}
// km from a point to the nearest of some rings; a ring whose box lies farther than the best so far is skipped
function toRings(p, list) {
  const kx = 111.32 * Math.cos(p[1] * Math.PI / 180), ky = 110.57;
  const floor = b => Math.hypot(Math.max(b[0] - p[0], 0, p[0] - b[2]) * kx, Math.max(b[1] - p[1], 0, p[1] - b[3]) * ky) * 0.98;
  let best = Infinity;
  for (const r of list.map(r => ({ r, low: floor(r.box) })).sort((a, b) => a.low - b.low)) {
    if (r.low >= best) break;
    best = Math.min(best, turf.pointToLineDistance(p, r.r.line, { units: 'kilometers' }));
  }
  return best;
}
const inside = (p, z) => p[0] >= z.box[0] && p[0] <= z.box[2] && p[1] >= z.box[1] && p[1] <= z.box[3] && turf.booleanPointInPolygon(p, z.feature);

// km from a point to the coast, by Natural Earth land within a degree and a half of it
let landPolys = null;
const coastOf = new Map();
function toCoast(p) {
  const key = p.join(' ');
  if (!coastOf.has(key)) {
    landPolys ??= turf.flatten(require('topojson-client').feature(require('world-atlas/land-10m.json'), 'land')).features.map(f => ({ f, box: turf.bbox(f) }));
    const box = [p[0] - 1.5, p[1] - 1.5, p[0] + 1.5, p[1] + 1.5];
    const near = landPolys.filter(({ box: b }) => b[2] > box[0] && b[0] < box[2] && b[3] > box[1] && b[1] < box[3])
      .map(({ f }) => turf.bboxClip(f, box)).filter(f => f.geometry.coordinates.length);
    // the clip closes the land along the box, 1.5 degrees off: no nearer than any coast inside it that matters here
    coastOf.set(key, near.length ? toRings(p, near.flatMap(rings)) : Infinity);
  }
  return coastOf.get(key);
}

// --- one line per place and page ---
const lines = [], missing = new Set(), shapeless = new Set();
for (const page of pages) {
  const shown = page.zones.map(id => zone(id) ?? (shapeless.add(id), null)).filter(Boolean);
  for (const id of page.markers) {
    const p = points[id];
    if (!p) { missing.add(id); continue; }
    // of two uncut drawings that hold the place, the one that outranks the other holds it, and the other lies under it
    const all = shown.filter(z => inside(p, z)), top = Math.min(...all.map(rank));
    const holders = all.some(z => !z.uncut) ? all : all.filter(z => rank(z) === top), under = all.filter(z => !holders.includes(z));
    const others = shown.filter(z => !all.includes(z));
    // an uncut drawing is cut only by a zone that outranks it, so a zone it outranks marks no border of it
    const cut = holders.every(z => !z.uncut), rivals = cut ? others : others.filter(z => rank(z) <= top);
    const next = rivals.map(z => ({ id: z.id, km: toRings(p, z.rings) })).sort((a, b) => a.km - b.km)[0] ?? null;
    const off = page.bbox && (p[0] < page.bbox[0] || p[0] > page.bbox[2] || p[1] < page.bbox[1] || p[1] > page.bbox[3]) ? ', outside the page\'s bbox' : '';
    const km = v => v < 10 ? v.toFixed(1) : v.toFixed(0);
    let key, text;
    if (!holders.length) {
      key = next?.km ?? Infinity;
      text = !page.zones.length ? 'bare, the page has no zones' : next ? `bare, ${km(next.km)} km from ${next.id}` : 'bare, no zone of the page has a shape';
    } else {
      const edge = Math.min(...holders.map(z => toRings(p, z.rings)));
      const atCoast = cut && edge < 25 && Math.abs(toCoast(p) - edge) <= Math.max(1.5, edge * 0.2);
      key = atCoast ? next?.km ?? Infinity : Math.min(edge, next?.km ?? Infinity);
      text = `in ${holders.map(z => z.id).join(' and ')}${cut ? '' : ' (uncut)'}${under.length ? `, drawn over ${under.map(z => z.id).join(' and ')}` : ''}, ${km(edge)} km from its edge${atCoast ? ', the coast' : ''}`
        + (next ? `, ${km(next.km)} km from ${next.id}` : '');
    }
    lines.push({ key, text: `${(key === Infinity ? '-' : km(key)).padStart(6)} km  ${id}  ${page.id}: ${text}${off}` });
  }
}
lines.sort((a, b) => a.key - b.key);
const kept = lines.filter(l => l.key <= opts.near);
if (kept.length) console.log(kept.map(l => l.text).join('\n'));
if (missing.size) console.log(`\nno lnglat in any markers.yaml of ${story}: ${[...missing].join(', ')}`);
if (shapeless.size) console.log(`\nno shape, in the build or in a zones folder: ${[...shapeless].join(', ')}`);
console.log(`\n${kept.length} of ${lines.length} lines, from ${from}: ${pages.length} pages, ${new Set(pages.flatMap(p => p.markers)).size} places.`);
