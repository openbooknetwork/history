// Finds land that blinks off between pages: coloured by a zone on the pages before and after, bare on this one.
// Run from the repo root, after a build of the story:
//   node scripts/zone-gaps.mjs <story> [--min <percent>] [--reach <pages>] [--cache <dir>]
// Try: node scripts/zone-gaps.mjs alexander-the-great
//
// It reads the shapes the build drew, .cache/kitap/stories/<story>/zones.json, where each zone is already cut by
// the zones that outrank it. So it tests what the reader sees, not which ids a page lists: land that another
// state's zone colours is not bare, and a zone a page lists but the build cut away there is.
//
// For each page it lays a grid over the page's frame and takes the points no zone of the page colours. The frame
// is wider than the page's bbox: a screen shows the bbox whole and whatever else its shape leaves room for, so the
// frame is what any screen of scripts/view.mjs shows of the page, a laptop, a desktop and a phone, inside the story's extent. A point
// counts when a zone colours it on one of the --reach pages before (2) and on one of the --reach pages after,
// across section borders. A page is printed when such points make up --min percent of its frame or more (1).
// Battle phase pages are left out, since they draw a battlefield with no zones.
//
// It prints a list to confirm, and always ends with status 0: a land lost on this page and retaken on the next
// is bare by right, and only the page's text says so. It does not find a zone missing on a story's first or last
// pages, a zone dropped for good too early, or a zone of the wrong year. Those are the map-auditor's.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';
import { reach } from './view.mjs';

const turf = createRequire(import.meta.url)('@turf/turf');
const COLS = 48, ROWS = 32;

// The story's pages in reading order: { id, dir, bbox, zones }, the battle phase pages left out.
export function readPages(story) {
  const root = path.join(story, 'pages'), pages = [];
  (function walk(dir) {
    const file = path.join(dir, 'page.yaml');
    if (fs.existsSync(file)) {
      const page = yaml.load(fs.readFileSync(file, 'utf8')) ?? {};
      if (page.emblem?.kind !== 'battle-plan' && Array.isArray(page.bbox)) {
        pages.push({ id: path.relative(root, dir), file, bbox: page.bbox, zones: page.zones ?? [] });
      }
      return;
    }
    for (const d of fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) walk(path.join(dir, d.name));
  })(root);
  return pages;
}

// What any screen can show of a page: the box that holds each of its frames, of scripts/view.mjs, inside the extent.
export function frame(bbox, extent) {
  const box = reach(bbox);
  return extent ? [Math.max(box[0], extent[0]), Math.max(box[1], extent[1]), Math.min(box[2], extent[2]), Math.min(box[3], extent[3])] : box;
}

// Each page with bare land its neighbours colour: { page, share, before, after, at }, largest share first.
// shapes maps a zone id to its GeoJSON feature as the build drew it, and extent is the story's.
export function gaps(pages, shapes, { min = 1, reach = 2, extent = null } = {}) {
  const light = new Map();
  const zone = id => {
    if (!light.has(id)) {
      const f = shapes[id];
      light.set(id, f?.geometry ? { feature: turf.simplify(f, { tolerance: 0.01, highQuality: false, mutate: false }), box: turf.bbox(f) } : null);
    }
    return light.get(id);
  };
  const colours = (id, p) => {
    const z = zone(id);
    return !!z && p[0] >= z.box[0] && p[0] <= z.box[2] && p[1] >= z.box[1] && p[1] <= z.box[3] && turf.booleanPointInPolygon(p, z.feature);
  };
  const colouring = (page, p) => page.zones.find(id => colours(id, p)) ?? null;
  const found = [];
  pages.forEach((page, i) => {
    const before = pages.slice(Math.max(0, i - reach), i).reverse(), after = pages.slice(i + 1, i + 1 + reach);
    if (!before.length || !after.length) return;
    const [w, s, e, n] = frame(page.bbox, extent), hits = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const p = [w + (e - w) * (c + 0.5) / COLS, s + (n - s) * (r + 0.5) / ROWS];
      if (colouring(page, p)) continue;
      let b = null, a = null;
      for (const pg of before) { const id = colouring(pg, p); if (id) { b = { id, page: pg.id }; break; } }
      if (!b) continue;
      for (const pg of after) { const id = colouring(pg, p); if (id) { a = { id, page: pg.id }; break; } }
      if (a) hits.push({ p, b, a });
    }
    const share = hits.length / (COLS * ROWS) * 100;
    if (!hits.length || share < min) return;
    const tally = side => {
      const counts = new Map();
      for (const h of hits) { const key = `${h[side].id} on ${h[side].page}`; counts.set(key, (counts.get(key) ?? 0) + 1); }
      return [...counts].sort((x, y) => y[1] - x[1]).map(([key, k]) => ({ key, share: k / (COLS * ROWS) * 100 }));
    };
    // the bare point nearest the middle of the bare points, to look at on a capture
    const mid = [hits.reduce((t, h) => t + h.p[0], 0) / hits.length, hits.reduce((t, h) => t + h.p[1], 0) / hits.length];
    const at = hits.reduce((best, h) => Math.hypot(h.p[0] - mid[0], h.p[1] - mid[1]) < Math.hypot(best.p[0] - mid[0], best.p[1] - mid[1]) ? h : best).p;
    found.push({ page: page.id, share, before: tally('b'), after: tally('a'), at });
  });
  return found.sort((x, y) => y.share - x.share);
}

function main(argv) {
  const opts = { min: 1, reach: 2, cache: '.cache/kitap' };
  const names = [];
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i].startsWith('--') ? argv[i].slice(2) : null;
    if (flag === null) names.push(argv[i]);
    else if (flag in opts && argv[i + 1] !== undefined) opts[flag] = flag === 'cache' ? argv[++i] : +argv[++i];
    else stop(`unknown option ${argv[i]}`);
  }
  if (names.length !== 1 || Number.isNaN(opts.min) || !(opts.reach >= 1)) stop('usage: node scripts/zone-gaps.mjs <story> [--min <percent>] [--reach <pages>] [--cache <dir>], from the repo root');
  const story = storyDir(names[0]);
  if (!story) stop(`${names[0]}: no story folder has that name`);
  const file = path.join(opts.cache, 'stories', path.basename(story), 'zones.json');
  if (!fs.existsSync(file)) stop(`${file} is missing: build the story first, the build writes its zones there`);
  const { shapes } = JSON.parse(fs.readFileSync(file, 'utf8'));
  const pages = readPages(story);
  const unknown = [...new Set(pages.flatMap(p => p.zones))].filter(id => !shapes[id]);
  if (unknown.length) stop(`${file} has no shape for ${unknown.join(', ')}: build the story again, its zones changed since`);
  const built = fs.statSync(file).mtimeMs, newer = pages.find(p => fs.statSync(p.file).mtimeMs > built);
  if (newer) console.log(`note: ${newer.file} changed after the build that drew the zones. Build the story again if its zones changed.\n`);

  const map = yaml.load(fs.readFileSync(path.join(story, 'story.yaml'), 'utf8')) ?? {};
  const found = gaps(pages, shapes, { ...opts, extent: map.harita?.extent ?? map.extent ?? null });
  const pct = v => `${v.toFixed(1)}%`;
  for (const g of found) {
    console.log(`${g.page}: ${pct(g.share)} of the frame is bare here and coloured on the pages around it, near [${g.at.map(v => v.toFixed(2)).join(', ')}]`);
    console.log(`  before: ${g.before.map(t => `${t.key} (${pct(t.share)})`).join(', ')}`);
    console.log(`  after:  ${g.after.map(t => `${t.key} (${pct(t.share)})`).join(', ')}`);
  }
  console.log(found.length
    ? `\n${found.length} of ${pages.length} pages to confirm: add the zone, or leave the page where its text tells the land changing hands.`
    : `ok: no page of ${pages.length} leaves bare what the pages around it colour`);
}

function stop(message) { console.error(message); process.exit(2); }

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main(process.argv.slice(2));
