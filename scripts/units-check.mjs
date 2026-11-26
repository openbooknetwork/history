// Says where the units of a battle's phase pages stand on each other, before anyone builds or captures. Run from
// the repo root:
//   node scripts/units-check.mjs <story> <section number> [page id ...]
// Try: node scripts/units-check.mjs alexander-the-great 030
// A unit is a block: its place, its width along the front, its depth and the way it faces. A builder places it by
// numbers and cannot see it, so two blocks that share ground are found only on a capture, a build later. For each
// page with a battle plan this prints, from page.yaml and the page's markers alone:
//   overlap   two blocks that share more than a tenth of the smaller one, with the share
//   marker    a marker that stands on a block, where it hides the block's hover label
//   small     a block whose short side is under 6 pixels on a phone at the page's opening view
//   outside   a block whose centre lies outside the page's bbox
// A unit with no facing faces north, and one with no depth is a fifth of its width deep and 60 m at the least, as
// the engine draws them. A unit with no id is called by its name.
// It ends with status 1 where it prints an overlap or an outside, and 0 otherwise. A marker and a small block are
// notes: a commander's marker beside its block is the rule, and on it is sometimes wanted.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';
import { SCREENS, merc } from './view.mjs';
const turf = createRequire(path.resolve('package.json'))('@turf/turf');

const [story, section, ...only] = process.argv.slice(2);
if (!story || !/^\d{3}$/.test(section ?? '')) { console.error('usage: node scripts/units-check.mjs <story> <section number> [page id ...], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }
const pagesDir = path.join(dir, 'pages'), folder = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).find(n => n.startsWith(`${section}-`)) : null;
const pages = [];
(function walk(d) { for (const e of d && fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)) : []) if (e.isDirectory()) { const full = path.join(d, e.name); if (fs.existsSync(path.join(full, 'page.yaml'))) pages.push([e.name.replace(/^\d+-/, ''), full]); else walk(full); } })(folder ? path.join(pagesDir, folder) : null);
const load = f => { try { return yaml.load(fs.readFileSync(f, 'utf8')) ?? {}; } catch { return {}; } };
const shared = load(path.join(dir, 'shared', 'markers.yaml'));

// a block as a shape: width across the way it faces, depth along it
function block(u_) {
  const u = { ...u_, facing: Number.isFinite(u_.facing) ? u_.facing : 0, depth: u_.depth > 0 ? u_.depth : Math.max(60, u_.width / 5) };
  const ahead = (d, bearing) => turf.destination(turf.point(u.at), d / 1000, bearing, { units: 'kilometers' }).geometry.coordinates;
  const corner = (along, across) => turf.destination(turf.point(ahead(along, u.facing)), across / 1000, u.facing + 90, { units: 'kilometers' }).geometry.coordinates;
  const d = u.depth / 2, w = u.width / 2, c = [corner(d, -w), corner(d, w), corner(-d, w), corner(-d, -w)];
  return turf.polygon([[...c, c[0]]]);
}
let faults = 0, notes = 0, seen = 0;
for (const [id, full] of pages) {
  if (only.length && !only.includes(id)) continue;
  const page = load(path.join(full, 'page.yaml')), units = (page.emblem?.units ?? []).filter(u => Array.isArray(u.at) && u.width > 0).map(u => ({ ...u, depth: u.depth > 0 ? u.depth : Math.max(60, u.width / 5) }));
  if (!units.length) continue;
  seen++;
  const out = [], shapes = units.map(block), label = u => `${u.id ?? u.name ?? 'a unit with no id'} (${u.side ?? 'no side'})`;
  for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) {
    const both = turf.intersect(turf.featureCollection([shapes[i], shapes[j]]));
    if (!both) continue;
    const share = turf.area(both) / Math.min(turf.area(shapes[i]), turf.area(shapes[j]));
    if (share > 0.1) { faults++; out.push(`overlap  ${label(units[i])} and ${label(units[j])} share ${Math.round(share * 100)}% of the smaller block${units[i].side === units[j].side ? '' : ', the two sides in one place: draw a clash there, or part them'}`); }
  }
  const own = load(path.join(full, 'markers.yaml'));
  for (const m of page.markers ?? []) {
    const at = (own[m] ?? shared[m])?.lnglat; if (!at) continue;
    const on = units.find((u, i) => turf.booleanPointInPolygon(at, shapes[i]));
    if (on) { notes++; out.push(`marker   ${m} stands on ${label(on)}: beside the block it leaves the hover label free`); }
  }
  if (Array.isArray(page.bbox)) {
    const [w, s, e, n] = page.bbox, phone = SCREENS.find(x => x.name === 'phone'), [x0, y0] = merc([w, n]), [x1, y1] = merc([e, s]);
    const k = Math.min((phone.pane[0] - 2 * phone.pad[0]) / (x1 - x0), (phone.pane[1] - 2 * phone.pad[1]) / (y1 - y0));
    const metre = k / (40075016.686 * Math.cos((s + n) / 2 * Math.PI / 180));      // pixels to a metre on a phone
    for (const u of units) {
      if (u.at[0] < w || u.at[0] > e || u.at[1] < s || u.at[1] > n) { faults++; out.push(`outside  ${label(u)} has its centre outside the page's bbox`); }
      const px = Math.min(u.width, u.depth) * metre;
      if (px < 6) { notes++; out.push(`small    ${label(u)} is ${px.toFixed(1)} pixels on its short side on a phone (${Math.min(u.width, u.depth)} m): under 6 it reads as a line`); }
    }
  }
  console.log(`${id}: ${units.length} units${out.length ? '' : ', ok'}`);
  for (const l of out) console.log(`  ${l}`);
}
if (!seen) console.log(`no page of section ${section}${only.length ? ` among ${only.join(', ')}` : ''} has a battle plan`);
else console.log(`\n${faults} overlaps or blocks outside, ${notes} notes.`);
process.exit(faults ? 1 : 0);
