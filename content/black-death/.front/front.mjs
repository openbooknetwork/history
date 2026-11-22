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
// pages that begin after 1353 tell of later plagues: they show the final front under this name, and no tally
const AFTER = 'black-death-1346-1353';
const AFTER_NAME = 'Reached by the Black Death, 1346–1353';
// the Voronoi box, wider than the story's extent so that no cell ends inside it
const BOX = [-40, 0, 95, 78];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// a month as a count, year * 12 + month - 1; a year alone is its first month, or its last at the end of a span
function month(v, end = false) {
  if (v instanceof Date) return v.getUTCFullYear() * 12 + v.getUTCMonth();
  const m = String(v).match(/^(\d{4})(?:-(\d{2}))?/);
  if (!m) throw new Error(`"${v}" is not a date: write a year, YYYY-MM or YYYY-MM-DD`);
  return Number(m[1]) * 12 + (m[2] ? Number(m[2]) - 1 : end ? 11 : 0);
}
const ym = n => `${Math.floor(n / 12)}-${String(n % 12 + 1).padStart(2, '0')}`;
const monthName = n => `${MONTHS[n % 12]} ${Math.floor(n / 12)}`;
const zoneId = n => `reached-${ym(n)}`;
const darkName = n => `Reached by ${monthName(n)}`;
const newName = (a, b) => a === b ? `Reached ${monthName(a)}` : `Reached ${monthName(a)} to ${monthName(b)}`;

function span(when) {
  if (when == null) return null;
  if (typeof when === 'object' && !(when instanceof Date)) return { from: month(when.from), to: month(when.to ?? when.from, true) };
  return { from: month(when), to: month(when, true) };
}

// the pages in folder order
function readPages() {
  const dirs = [];
  for (const group of fs.readdirSync(path.join(STORY, 'pages')).sort()) {
    const g = path.join(STORY, 'pages', group);
    if (!fs.statSync(g).isDirectory()) continue;
    for (const p of fs.readdirSync(g).sort()) if (fs.existsSync(path.join(g, p, 'page.yaml'))) dirs.push(path.join(g, p));
  }
  // a page.yaml line "# front: final" shows the final front and keeps the tally of the page before; the page schema
  // takes no field of the story's own, so the mark is a comment
  return dirs.map(dir => {
    const text = fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8');
    return { dir, id: path.basename(dir).replace(/^\d+-/, ''), span: span(yaml.load(text)?.when), final: /^# front: final\b/m.test(text) };
  });
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

// A page with when: a dark zone of the regions reached before its first month, a hatched zone of those reached from
// its first month to its last, and the tally by its last month, never below the page before. A page without when repeats the state at the last
// month of the page before, as one dark zone.
function plan() {
  const regions = readRegions(), pages = readPages();
  const reached = m => regions.filter(r => r.arrival <= m);
  const used = new Set(), aliases = [];
  let last = null, after = false; // the last month shown, and whether a page after 1353 came before
  // the dead do not come back: a page's tally is at least the tally of the page before, low and high each
  let kept = [0, 0];
  const atLeast = t => (kept = [Math.max(t[0], kept[0]), Math.max(t[1], kept[1])]);
  for (const pg of pages) {
    pg.zones = []; pg.tally = [0, 0]; pg.added = [];
    if (pg.span && pg.span.from > LAST) after = true;
    if (after) {
      if (pg.span ? pg.span.from <= LAST : false) throw new Error(`page ${pg.id} follows a page after 1353 but begins before it`);
      pg.after = true;
      if (last != null) { pg.zones = [AFTER]; used.add(LAST); }
      continue;
    }
    if (pg.final) {
      if (pg.span) throw new Error(`page ${pg.id}: "# front: final" is for a page without when`);
      pg.shown = LAST; pg.tally = kept; pg.zones = [AFTER]; used.add(LAST); pg.finalFront = true;
      continue;
    }
    if (!pg.span) {
      if (last == null) continue;
      pg.from = pg.to = null;
      pg.shown = last;
      pg.tally = kept;
      if (reached(last).length) { pg.zones = [zoneId(last)]; used.add(last); }
      continue;
    }
    const from = pg.span.from, to = Math.min(pg.span.to, LAST);
    pg.from = from; pg.to = to;
    pg.tally = atLeast(tally(regions, to));
    if (reached(from - 1).length) { pg.zones.push(zoneId(from - 1)); used.add(from - 1); }
    pg.added = regions.filter(r => r.arrival >= from && r.arrival <= to);
    if (pg.added.length) {
      pg.zones.push(`new-${pg.id}`);
      used.add(to);
      aliases.push(`new-${pg.id}: { zone: ${zoneId(to)}, family: plague-new, name: "${newName(from, to)}" }`);
    }
    last = to;
  }
  if (pages.some(p => p.after || p.finalFront)) aliases.push(`${AFTER}: { zone: ${zoneId(LAST)}, family: plague, name: "${AFTER_NAME}" }`);
  const fronts = [...used].sort((a, b) => a - b).map(m => {
    const rs = reached(m);
    return { m, land: rs.length === 1 ? rs[0].land : turf.union(turf.featureCollection(rs.map(r => r.land))) };
  });
  return { regions, pages, fronts, aliases };
}

// a file is written only when its text changes, so the dev servers of the other agents rebuild only for a real change
function write(file, text) {
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) fs.writeFileSync(file, text);
}

function apply({ pages, fronts, aliases }) {
  fs.mkdirSync(ZONES, { recursive: true });
  const wanted = new Set();
  for (const f of fronts) {
    const file = `${zoneId(f.m)}.geojson`;
    wanted.add(file);
    const feat = { type: 'Feature', properties: { family: 'plague', name: darkName(f.m) }, geometry: round(f.land.geometry) };
    write(path.join(ZONES, file), JSON.stringify(feat) + '\n');
  }
  for (const f of fs.readdirSync(ZONES)) if (f.endsWith('.geojson') && !wanted.has(f)) fs.rmSync(path.join(ZONES, f));
  write(USES, `# Written by .front/front.mjs: the land each page hatches, and the final front for the pages after 1353.\n${aliases.join('\n')}\n`);
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

const result = plan();
const { regions, pages } = result;
const figure = t => t[1] ? `${t[0].toLocaleString('en')} - ${t[1].toLocaleString('en')}` : '0';
const months = p => p.from != null ? (p.from === p.to ? ym(p.from) : `${ym(p.from)}..${ym(p.to)}`) : p.shown != null ? `=${ym(p.shown)}` : '';
const rows = pages.map(p => [path.relative(path.join(STORY, 'pages'), p.dir), months(p), p.zones.join(', ') || '[]', figure(p.tally)]);
const width = [0, 1, 2].map(i => Math.max(...rows.map(r => r[i].length), 6));
console.log(['page', 'months', 'zones', 'tally'].map((h, i) => h.padEnd(width[i] ?? 0)).join('  '));
rows.forEach((r, i) => {
  console.log(r.map((c, j) => c.padEnd(width[j] ?? 0)).join('  '));
  if (pages[i].added.length) console.log(`    + ${pages[i].added.map(x => x.id).join(' ')}`);
});
const counted = regions.filter(r => r.population != null), never = regions.filter(r => r.arrival > LAST);
console.log(`\n${regions.length} regions, ${counted.length} in the tally, ${(counted.reduce((a, r) => a + r.population, 0) / 1e6).toFixed(1)} million people about 1346`);
if (never.length) console.log(`after 1353, on no page: ${never.map(r => r.id).join(' ')}`);
if (process.argv.includes('--apply')) {
  apply(result);
  console.log(`wrote ${result.fronts.length} fronts, ${path.relative(STORY, USES)} and the zones and tally of ${pages.length} pages`);
}
