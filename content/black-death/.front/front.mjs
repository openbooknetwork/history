// The plague front and the death tally of every page of the Black Death, from regions.yaml. See README.md.
//   node content/black-death/.front/front.mjs           prints the table
//   node content/black-death/.front/front.mjs --apply   writes the zones, zones.yaml and the zones: and tally: lines
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as turf from '@turf/turf';
import * as yaml from 'js-yaml';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STORY = path.resolve(HERE, '..');
const ZONES = path.join(STORY, 'shared', 'zones', 'front');
const USES = path.join(STORY, 'shared', 'zones.yaml');
const LAST = month('1353-12');
const RAMP = 6;
const FRONT_NAME = 'Reached by the plague';
const NEW_NAME = 'Reached since the page before';
// the Voronoi box, wider than the story's extent so that no cell ends inside it
const BOX = [-40, 0, 95, 78];

// a month as a count, year * 12 + month - 1; a year alone is its first month, or its last at the end of a span
function month(v, end = false) {
  if (v instanceof Date) return v.getUTCFullYear() * 12 + v.getUTCMonth();
  const m = String(v).match(/^(\d{4})(?:-(\d{2}))?/);
  if (!m) throw new Error(`"${v}" is not a date: write a year, YYYY-MM or YYYY-MM-DD`);
  return Number(m[1]) * 12 + (m[2] ? Number(m[2]) - 1 : end ? 11 : 0);
}
const ym = n => `${Math.floor(n / 12)}-${String(n % 12 + 1).padStart(2, '0')}`;

function span(when) {
  if (when == null) return null;
  if (typeof when === 'object' && !(when instanceof Date)) return { from: month(when.from), to: month(when.to ?? when.from, true) };
  return { from: month(when), to: month(when, true) };
}

// the pages in folder order, each with the month whose front and tally it shows
function readPages() {
  const dirs = [];
  for (const group of fs.readdirSync(path.join(STORY, 'pages')).sort()) {
    const g = path.join(STORY, 'pages', group);
    if (!fs.statSync(g).isDirectory()) continue;
    for (const p of fs.readdirSync(g).sort()) if (fs.existsSync(path.join(g, p, 'page.yaml'))) dirs.push(path.join(g, p));
  }
  const pages = dirs.map(dir => ({ dir, id: path.basename(dir).replace(/^\d+-/, ''), span: span(yaml.load(fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8'))?.when) }));
  // the end of a page's span, cut back to the month before the next dated page begins, so that pages whose spans
  // overlap each show their own months; never before its own start or the page before
  let prev = null;
  pages.forEach((pg, i) => {
    if (!pg.span) { pg.date = prev; return; }
    const next = pages.slice(i + 1).find(x => x.span);
    let d = next ? Math.min(pg.span.to, next.span.from - 1) : pg.span.to;
    d = Math.max(d, pg.span.from, prev ?? -Infinity);
    pg.date = prev = Math.min(d, LAST);
  });
  return pages;
}

// every region's land: the Voronoi cells of its seed towns, in Web Mercator so that cells keep their shape in the north
function readRegions() {
  const data = yaml.load(fs.readFileSync(path.join(HERE, 'regions.yaml'), 'utf8'));
  const regions = data.regions.map(r => ({ ...r, arrival: month(r.arrival), months: r.months ?? RAMP }));
  const ids = new Set();
  for (const r of regions) {
    if (ids.has(r.id)) throw new Error(`regions.yaml names the region "${r.id}" twice`);
    ids.add(r.id);
    if (r.population != null && !(Array.isArray(r.rate) && r.rate[0] <= r.rate[1])) throw new Error(`region "${r.id}" needs rate: [low, high]`);
  }
  const points = [], owner = [];
  for (const o of [...regions, ...data.blank]) for (const s of o.seeds) { points.push(turf.toMercator(turf.point(s))); owner.push(o); }
  const [w, s] = turf.toMercator(turf.point(BOX.slice(0, 2))).geometry.coordinates;
  const [e, n] = turf.toMercator(turf.point(BOX.slice(2))).geometry.coordinates;
  const cells = turf.voronoi(turf.featureCollection(points), { bbox: [w, s, e, n] }).features;
  cells.forEach((c, i) => {
    if (!c) throw new Error(`two seeds stand on one point: ${JSON.stringify(turf.toWgs84(points[i]).geometry.coordinates)}`);
    (owner[i].cells ??= []).push(turf.toWgs84(c));
  });
  for (const r of regions) r.land = r.cells.length === 1 ? r.cells[0] : turf.union(turf.featureCollection(r.cells));
  return regions;
}

const round = g => JSON.parse(JSON.stringify(g, (k, v) => typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v));
const twoDigits = x => x === 0 ? 0 : (p => Math.round(x / p) * p)(10 ** (Math.floor(Math.log10(x)) - 1));

// the dead by a month: each reached region's people times its rate, times the share of its epidemic past by then
function tally(regions, date) {
  let low = 0, high = 0;
  for (const r of regions) {
    if (date == null || r.arrival > date || r.population == null) continue;
    const share = Math.min(1, (date - r.arrival + 1) / r.months);
    low += r.population * r.rate[0] * share;
    high += r.population * r.rate[1] * share;
  }
  return [twoDigits(low), twoDigits(high)];
}

function plan() {
  const regions = readRegions(), pages = readPages();
  // a region joins the front on the first page dated at or after its arrival, or on its page: when that comes later
  for (const r of regions) {
    const byDate = pages.findIndex(p => p.date != null && p.date >= r.arrival);
    const hinted = r.page ? pages.findIndex(p => p.id === r.page) : -1;
    if (r.page && hinted < 0) console.warn(`region ${r.id}: no page "${r.page}" yet, it joins by its date`);
    r.join = byDate < 0 ? Infinity : Math.max(byDate, hinted);
  }
  let prev = null; // the last page with a front of its own
  pages.forEach((pg, i) => {
    pg.tally = tally(regions, pg.date);
    pg.added = regions.filter(r => r.join === i);
    const reached = regions.filter(r => r.join <= i);
    if (!reached.length) pg.zones = [];
    else if (!pg.added.length) pg.zones = [`front-${prev.id}`];
    else {
      pg.front = reached.length === 1 ? reached[0].land : turf.union(turf.featureCollection(reached.map(r => r.land)));
      pg.zones = [...(prev ? [`front-${prev.id}`] : []), `new-${pg.id}`];
      prev = pg;
    }
  });
  return { regions, pages };
}

// a file is written only when its text changes, so the dev servers of the other agents rebuild only for a real change
function write(file, text) {
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) fs.writeFileSync(file, text);
}

function apply(pages) {
  fs.mkdirSync(ZONES, { recursive: true });
  const wanted = new Set();
  for (const pg of pages.filter(p => p.front)) {
    const file = `front-${pg.id}.geojson`;
    wanted.add(file);
    const feat = { type: 'Feature', properties: { family: 'plague', name: FRONT_NAME }, geometry: round(pg.front.geometry) };
    write(path.join(ZONES, file), JSON.stringify(feat) + '\n');
  }
  for (const f of fs.readdirSync(ZONES)) if (f.endsWith('.geojson') && !wanted.has(f)) fs.rmSync(path.join(ZONES, f));
  const uses = pages.filter(p => p.front).map(p => `new-${p.id}: { zone: front-${p.id}, family: plague-new, name: "${NEW_NAME}" }`);
  write(USES, `# Written by .front/front.mjs: the land each page adds to the plague front.\n${uses.join('\n')}\n`);
  for (const pg of pages) {
    const file = path.join(pg.dir, 'page.yaml');
    let text = fs.readFileSync(file, 'utf8');
    const lines = { zones: `[${pg.zones.join(', ')}]`, tally: pg.tally[1] === 0 ? '0' : `[${pg.tally.join(', ')}]` };
    for (const [key, value] of Object.entries(lines)) {
      // the line, and the items of a block list under it
      const re = new RegExp(`^${key}:.*\\n(?:[ \\t]+-.*\\n)*`, 'm');
      text = re.test(text) ? text.replace(re, `${key}: ${value}\n`) : `${text.replace(/\n*$/, '\n')}${key}: ${value}\n`;
    }
    write(file, text);
  }
}

const { regions, pages } = plan();
const figure = t => t[1] ? `${t[0].toLocaleString('en')} - ${t[1].toLocaleString('en')}` : '0';
const rows = pages.map(p => [path.relative(path.join(STORY, 'pages'), p.dir), p.date == null ? '' : ym(p.date), p.zones.join(', ') || '[]', figure(p.tally)]);
const width = [0, 1, 2].map(i => Math.max(...rows.map(r => r[i].length), 5));
console.log(['page', 'date', 'zones', 'tally'].map((h, i) => h.padEnd(width[i] ?? 0)).join('  '));
rows.forEach((r, i) => {
  console.log(r.map((c, j) => c.padEnd(width[j] ?? 0)).join('  '));
  if (pages[i].added.length) console.log(`    + ${pages[i].added.map(x => x.id).join(' ')}`);
});
const counted = regions.filter(r => r.population != null), never = regions.filter(r => r.join === Infinity);
console.log(`\n${regions.length} regions, ${counted.length} in the tally, ${(counted.reduce((a, r) => a + r.population, 0) / 1e6).toFixed(1)} million people about 1346`);
if (never.length) console.log(`not yet on a page: ${never.map(r => r.id).join(' ')}`);
if (process.argv.includes('--apply')) {
  apply(pages);
  console.log(`wrote ${pages.filter(p => p.front).length} fronts, ${path.relative(STORY, USES)} and the zones and tally of ${pages.length} pages`);
}
