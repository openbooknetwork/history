// Land that a plan would leave bare on a page and that the page before or after it colours. A page shows every
// zone its neighbours show for its frame, unless its text tells a change (agents/pages.md), and a plan lists each
// page's zones before anything is drawn. So this is checked from the plan: scripts/plan-check.mjs calls it.
//
// For each page of the section's map.yaml it lays a grid of points over the page's frame, once for each screen of
// scripts/view.mjs: a laptop, a desktop and a phone. Land that any of them shows counts. A point is coloured on
// a page where one of the zones the page lists holds it, by the zone's drawing: its geojson under a zones folder
// of the story, or the outline a zones.yaml entry names. A point a neighbour colours and this page leaves bare
// counts against the neighbour's zone that holds it, and a zone with at least 1% of the frame's points is
// reported. The neighbours are the page before and the page after, in the story's order: of the plan where it has
// them, else the built page of the section beside it. A page says it leaves a zone out on purpose with
// `bare: { <zone id>: <why> }` in its entry of map.yaml.
//
// A zone's shape is the one the last build cut, .cache/kitap/stories/<story>/zones.json, where a build has drawn
// it: the build cuts a zone by the zones that outrank it, so land a generous drawing covers can still be bare.
// A zone no build has cut is its drawing, whole, which errs towards calling land coloured. A zone with no shape
// yet, as before the shared map is drawn, is left out, so the check says nothing until the shapes exist.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { frames } from './view.mjs';

const read = file => { try { return yaml.load(fs.readFileSync(file, 'utf8'), { schema: yaml.JSON_SCHEMA }); } catch { return null; } };
const GRID = [48, 30], SHARE = 0.002;

function walk(dir, test, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) { if (!d.name.startsWith('.')) walk(full, test, found); } else if (test(d.name, full)) found.push(full);
  }
  return found;
}
// the rings of a geojson, each a list of [lng, lat], with holes as rings too: a point is inside by even-odd
const ringsOf = g => !g ? [] : g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : g.type === 'GeometryCollection' ? g.geometries.flatMap(ringsOf) : [];
function inside([x, y], shape) {
  if (x < shape.box[0] || x > shape.box[2] || y < shape.box[1] || y > shape.box[3]) return false;
  let hit = false;
  for (const ring of shape.rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// story: the story's folder. pages: the section's pages in order, each { id, bbox, zones, bare }.
// before, after: the neighbour of the first and of the last page, { id, zones }, or null.
export function bareLand(story, pages, before, after, cache = path.join('.cache', 'kitap')) {
  const files = {}, alias = {};
  for (const f of walk(story, (n, full) => n.endsWith('.geojson') && full.split(path.sep).includes('zones'))) files[path.basename(f, '.geojson')] ??= f;
  for (const f of walk(story, n => n === 'zones.yaml')) for (const [k, v] of Object.entries(read(f) ?? {})) if (v?.zone) alias[k] ??= v.zone;
  let built = {};
  try { built = JSON.parse(fs.readFileSync(path.join(cache, 'stories', path.basename(story), 'zones.json'), 'utf8')).shapes ?? {}; } catch { /* no build yet */ }
  const boxed = rings => { const xs = rings.flat().map(p => p[0]), ys = rings.flat().map(p => p[1]); return rings.length ? { rings, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] } : null; };
  const shapes = new Map();
  const shape = (id, seen = new Set()) => {
    if (shapes.has(id)) return shapes.get(id);
    let s = null;
    if (built[id]?.geometry) s = boxed(ringsOf(built[id].geometry));
    else if (files[id]) {
      try {
        const doc = JSON.parse(fs.readFileSync(files[id], 'utf8'));
        const rings = (doc.type === 'FeatureCollection' ? doc.features : [doc]).flatMap(f => ringsOf(f.geometry ?? f));
        const xs = rings.flat().map(p => p[0]), ys = rings.flat().map(p => p[1]);
        if (rings.length) s = { rings, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
      } catch { /* a drawing that does not parse is no shape */ }
    } else if (alias[id] && !seen.has(id)) s = shape(alias[id], seen.add(id));
    shapes.set(id, s);
    return s;
  };
  // a state at another stage is the same state: a page that shows one stage of it has not left it out. A zone's
  // state is its id without the year it ends with
  const state = id => String(id).replace(/-\d+[a-z]?$/, '');
  const out = [];
  pages.forEach((p, i) => {
    if (!Array.isArray(p.bbox) || p.bbox.length !== 4) return;
    const own = (p.zones ?? []).map(shape).filter(Boolean);
    const neighbours = [i ? pages[i - 1] : before, i < pages.length - 1 ? pages[i + 1] : after].filter(Boolean);
    // a zone is reported once, for the screen that shows most of the land the page would leave bare
    const worst = new Map();
    for (const { name: screen, box: [w, s, e, n] } of frames(p.bbox)) {
      const counts = new Map();
      for (let a = 0; a < GRID[0]; a++) for (let b = 0; b < GRID[1]; b++) {
        const pt = [w + (e - w) * (a + 0.5) / GRID[0], s + (n - s) * (b + 0.5) / GRID[1]];
        if (own.some(z => inside(pt, z))) continue;
        for (const nb of neighbours) for (const id of nb.zones ?? []) {
          if ((p.zones ?? []).includes(id) || p.bare?.[id] !== undefined || (p.zones ?? []).some(z => state(z) === state(id))) continue;
          const z = shape(id);
          if (z && inside(pt, z)) { const k = `${id} ${nb.id}`; counts.set(k, (counts.get(k) ?? 0) + 1); break; }
        }
      }
      for (const [k, c] of counts) { const [id, nb] = k.split(' '), share = c / (GRID[0] * GRID[1]); if (share >= SHARE && share > (worst.get(id)?.share ?? 0)) worst.set(id, { share, nb, screen }); }
    }
    for (const [id, { share, nb, screen }] of worst) out.push({ page: p.id, zone: id, neighbour: nb, screen, share: Math.round(share * 1000) / 10 });
  });
  return out;
}

// the page beside a section, from the story's built pages: the last of the section before, the first of the one after
export function builtNeighbour(story, sectionFolder, side) {
  const dir = path.join(story, 'pages');
  const sections = fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => /^\d{3}-/.test(n)).sort() : [];
  const at = sections.findIndex(n => n.slice(0, 3) === sectionFolder.slice(0, 3));
  const beside = sections[side < 0 ? (at < 0 ? -1 : at - 1) : (at < 0 ? -1 : at + 1)];
  if (!beside) return null;
  const files = walk(path.join(dir, beside), n => n === 'page.yaml').sort();
  const file = side < 0 ? files.at(-1) : files[0], page = file && read(file);
  return page ? { id: `${beside}/${path.basename(path.dirname(file))}`, zones: Array.isArray(page.zones) ? page.zones : [] } : null;
}
