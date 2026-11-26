// The library a story's zone generator draws with. It gives the helpers every generator wrote for itself, and it
// makes each border line say what it rests on: a line is `src`, taken from a claim of the digest, or `est`, the
// drawer's own estimate with its reason. A shape is made from such lines and from nothing else, so a guessed
// line and a sourced one never look the same, and the library writes the list of both.
//
// A generator is content/<story>/.plans/zones.mjs, run from the repo root as `node content/<story>/.plans/zones.mjs`:
//
//   import { draw } from '../../../scripts/zones-lib.mjs';
//   const z = draw('alexander-the-great');
//   const danube = z.src('020.4', z.feature('danube'), [22.67, 44.2], [25.9, 43.7]);   // along a fetched river
//   const east   = z.est('no source gives an east end: drawn at the Yantra', [[25.9, 43.7], [25.6, 42.75]]);
//   const haemus = z.est('the crest of the Haemus, which 020.3 names and no file draws', [[25.6, 42.75], [22.4, 43.2]]);
//   const west   = z.est('no source gives a west end: drawn at the Timok', [[22.4, 43.2], [22.67, 44.2]]);
//   const TRIBALLI = z.region(danube, east, haemus, west);        // the lines in order, closed into one shape
//   z.zone('triballi-335', { family: 'triballi', name: 'The Triballi' }, TRIBALLI, { inside: { lyginus: [24.6, 43.4] } });
//   z.write();
//
// Lines
//   z.src(claim, feature, from, to)   along a fetched line, or the outline of a fetched area, between two points
//   z.src(claim, points)              through places a source gives, such as the towns of a treaty
//   z.est(why, points)                the drawer's own line, with what it is inferred from
//   z.feature(name)                   a file of content/<story>/.plan/ground/, fetched by scripts/ground.mjs
// A line along a feature begins and ends on the feature, at the points nearest the two given, which may lie up
// to 25 km off. line.points holds what was drawn: begin the next line at line.points.at(-1) to meet it exactly.
// Shapes
//   z.region(...lines)                the lines end to end, closed. It takes lines alone: a bare list of points throws
//   z.area(claim, feature)            a fetched area whole, such as a modern region a source names
//   z.town(why, [lng, lat], km)       a circle round a place, for a city left out of a zone or held alone
//   z.mask(points)                    a helper shape that is no border: a box to cut with, a half of the map
//   z.country(name), z.landAt(point)  a country of Natural Earth, and the piece of land that holds a point
//   z.standing(id)                    a zone file this generator does not write, to cut by or to meet. A zone the
//                                     generator writes is never read back: a file that feeds itself grows each run
//   z.union(a, b, ...), z.diff(a, b, ...), z.inter(a, b, ...), z.grow(a, km)   union refuses a mask: a mask cuts only
//   z.noIslands(shape, points)        the shape without the island that holds each point
// Zones
//   z.zone(id, { family, name, clip }, shape, { inside, outside })   inside and outside: { name: [lng, lat] }
//   z.write()                         writes shared/zones/<id>.geojson and content/<story>/.plan/ground.yaml
//   z.back(line)                      a line run the other way
// draw(story, { out, manifest }) writes the zones and the manifest elsewhere, for a trial that leaves the story as it is.
//
// A zone may overrun the coast: the build clips it to the land. Two zones that meet share a line: make the line
// once and give it to both regions, the second time with z.back(line) where it runs the other way.
// ground.yaml is the manifest: each line with its kind, its claim or its reason and its length, and for each zone
// the lines that lie on its edge, the lines that only cut it, how many km of its edge are sourced, estimated and
// other (coast, a standing zone's edge, a country's outline, a mask's cut), and its inside and outside tests.
// A zone with no line on its edge fails the run, as a failing test does. A claim id is held against research.md. It is
// written by the run and never by hand. A second run with nothing changed writes the same files.
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const require = createRequire(path.resolve('package.json'));
const turf = require('@turf/turf'), topo = require('topojson-client');

export function draw(story, { out, manifest: manifestFile } = {}) {
  const dir = storyDir(story);
  if (!dir) throw new Error(`no story folder is named ${story}`);
  const zonesDir = out ?? path.join(dir, 'shared', 'zones'), groundDir = path.join(dir, '.plan', 'ground');
  const landAtlas = require('world-atlas/land-10m.json'), countryAtlas = require('world-atlas/countries-10m.json');
  const land = turf.flatten(topo.feature(landAtlas, landAtlas.objects.land)).features;
  const countries = topo.feature(countryAtlas, countryAtlas.objects.countries).features;

  const lines = [], zones = new Map(), features = new Set(), read = new Set(), used = new WeakMap();
  const km = pts => pts.length > 1 ? Math.round(turf.length(turf.lineString(pts)) * 10) / 10 : 0;
  const isPoint = p => Array.isArray(p) && p.length === 2 && p.every(x => typeof x === 'number');
  const isLine = l => l && l.line === true && Array.isArray(l.points);
  const note = (shape, ...from) => { const s = new Set(); for (const f of from) for (const n of (isLine(f) ? [f.n] : used.get(f) ?? [])) s.add(n); used.set(shape, s); return shape; };
  // a shape is one the library made: a caller's own polygon carries no line and is refused
  const known = (shape, where) => { if (!shape?.geometry || !used.has(shape)) throw new Error(`${where}: takes a shape this library made, with region, area, town, mask, standing, country, landAt or an operation on them`); return shape; };
  const masks = new WeakSet();
  const why_ = (why, where) => { if (typeof why !== 'string' || why.trim().length < 12) throw new Error(`${where}: the first argument says what it is inferred from, in a sentence`); return why.trim(); };
  // the claim ids of the digest, where the story has one: a line cannot rest on a claim that is not there
  const digest = path.join(dir, '.plan', 'research.md');
  const claims = fs.existsSync(digest) ? new Set([...fs.readFileSync(digest, 'utf8').matchAll(/^- (\d{3}\.\d+) /gm)].map(m => m[1])) : null;
  const claim_ = (claim, where) => {
    if (typeof claim !== 'string' || !/^\d{3}\.\d+$/.test(claim)) throw new Error(`${where}: the first argument is a claim id of the digest, such as "020.4", not ${JSON.stringify(claim)}`);
    if (claims && !claims.has(claim)) throw new Error(`${where}: ${digest} has no claim ${claim}`);
    return claim;
  };
  const fc = (...fs_) => turf.featureCollection(fs_);
  function line(kind, fields, points) {
    if (!Array.isArray(points) || points.length < 2 || !points.every(isPoint)) throw new Error(`${kind}: a line takes two points or more, each [lng, lat]`);
    const l = { line: true, n: lines.length + 1, kind, ...fields, points };
    lines.push(l);
    return l;
  }
  // the pieces of a fetched line put end to end, by the nearest ends, from the longest piece out. A river comes
  // from the map in pieces, with a gap at an island or a dam, and with side arms. A piece joins only where it
  // carries the line on: one that begins more than some 30 km off is another water, and one whose far end comes
  // back to the line already made is a side arm, and is left out.
  function chain(pieces) {
    const len = p => turf.length(turf.lineString(p));
    const left = pieces.filter(p => p.length > 1).map(p => p.slice()).sort((a, b) => len(b) - len(a)); let out_ = left.shift();
    if (!out_) return null;
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const off = pt => turf.pointToLineDistance(turf.point(pt), turf.lineString(out_), { units: 'kilometers' });
    while (left.length) {
      let best = null;
      left.forEach((p, i) => { for (const [head, rev] of [[false, false], [false, true], [true, false], [true, true]]) { const q = rev ? p.slice().reverse() : p; const gap = head ? d(q[q.length - 1], out_[0]) : d(out_[out_.length - 1], q[0]); if (!best || gap < best.gap) best = { i, q, head, gap }; } });
      if (best.gap > 0.3) break;
      left.splice(best.i, 1);
      const far = best.head ? best.q[0] : best.q[best.q.length - 1];
      if (off(far) < Math.min(1, len(best.q) / 2)) continue;        // it comes back to the line: a side arm
      out_ = best.head ? best.q.concat(out_) : out_.concat(best.q);
    }
    return out_;
  }
  const outline = f => { const g = f.geometry ?? f; return g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : g.type === 'Polygon' ? [g.coordinates[0]] : g.type === 'MultiPolygon' ? g.coordinates.map(p => p[0]) : []; };

  const z = {
    turf,
    feature(name) {
      const file = path.join(groundDir, `${name}.geojson`);
      if (!fs.existsSync(file)) throw new Error(`no ${file}: fetch it with node scripts/ground.mjs <west,south,east,north> --name <name> --out ${file}`);
      features.add(name);
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      return { ground: name, list: data.type === 'FeatureCollection' ? data.features : [data] };
    },
    src(claim, what, from, to) {
      claim_(claim, 'src');
      if (what?.ground) {
        if (!isPoint(from) || !isPoint(to)) throw new Error('src: along a feature takes the two points it runs between');
        const lineal = what.list.filter(f => /LineString/.test(f.geometry.type)), areal = what.list.filter(f => /Polygon/.test(f.geometry.type));
        // of an area, the outline that lies nearest the first point
        const rings = areal.flatMap(outline), nearest = rings.length ? rings.map(r => [turf.pointToLineDistance(turf.point(from), turf.lineString(r), { units: 'kilometers' }), r]).sort((x, y) => x[0] - y[0])[0][1] : null;
        const path_ = lineal.length ? chain(lineal.flatMap(outline)) : nearest;
        if (!path_ || path_.length < 2) throw new Error(`src: the feature ${what.ground} holds no line`);
        const whole = turf.lineString(path_), a = turf.nearestPointOnLine(whole, from), b = turf.nearestPointOnLine(whole, to);
        for (const [p, q, label] of [[from, a, 'from'], [to, b, 'to']]) { const off = turf.distance(p, q); if (off > 25) throw new Error(`src: ${label} ${JSON.stringify(p)} lies ${off.toFixed(0)} km off the feature ${what.ground}`); }
        let pts = turf.lineSlice(a, b, whole).geometry.coordinates;
        if (a.properties.location > b.properties.location) pts = pts.slice().reverse();
        // an outline is a ring, so two ways lead from one point to the other: the shorter is taken
        const first = path_[0], last = path_[path_.length - 1];
        if (!lineal.length && Math.abs(first[0] - last[0]) < 1e-9 && Math.abs(first[1] - last[1]) < 1e-9) {
          const [lo, hi] = a.properties.location <= b.properties.location ? [a, b] : [b, a];
          // the other way round: from the later point on to the ring's end, then from its start to the earlier one
          let round = [hi.geometry.coordinates, ...path_.slice(hi.properties.index + 1), ...path_.slice(1, lo.properties.index + 1), lo.geometry.coordinates];
          if (lo === a) round = round.reverse();                                           // run from `from` to `to`
          if (km(round) < km(pts)) pts = round;
        }
        if (pts.length > 2) pts = turf.simplify(turf.lineString(pts), { tolerance: 0.002, highQuality: true }).geometry.coordinates;
        return line('sourced', { claim, feature: what.ground }, pts);
      }
      if (!Array.isArray(what)) throw new Error('src: the second argument is a feature, from z.feature(name), or a list of points');
      return line('sourced', { claim }, what);
    },
    est(why, points) {
      return line('estimate', { why: why_(why, 'est') }, points);
    },
    // the same line run the other way, for the second of two regions that share it
    back(l) { if (!isLine(l)) throw new Error('back: takes a line'); return { ...l, points: l.points.slice().reverse() }; },
    region(...ls) {
      const bad = ls.findIndex(l => !isLine(l));
      if (bad >= 0) throw new Error(`region: argument ${bad + 1} is no line. Make each side with src(claim, ...) or est(why, ...), so the manifest says what it rests on`);
      const ring = [];
      ls.forEach((l, i) => {
        if (i) { const gap = turf.distance(ring[ring.length - 1], l.points[0]); if (gap > 15) throw new Error(`region: line ${i + 1} begins ${gap.toFixed(0)} km from where line ${i} ends. Give the lines in order round the shape`); }
        ring.push(...l.points);
      });
      const gap = turf.distance(ring[ring.length - 1], ring[0]);
      if (gap > 15) throw new Error(`region: the last line ends ${gap.toFixed(0)} km from where the first begins`);
      // lines that meet share a point, and a ring holds each point once
      const seen = new Set(), once = ring.filter(p => { const k = `${p[0].toFixed(6)},${p[1].toFixed(6)}`; if (seen.has(k)) return false; seen.add(k); return true; });
      if (once.length < 3) throw new Error('region: the lines give fewer than three points');
      once.push(once[0]);
      const shape = turf.polygon([once]);
      // lines that cross make a ring that cuts itself: the pieces are joined into one shape
      const whole = turf.kinks(shape).features.length ? turf.unkinkPolygon(shape).features.reduce((a, b) => a ? turf.union(fc(a, b)) : b, null) : shape;
      return note(whole, ...ls);
    },
    area(claim, what) {
      claim_(claim, 'area');
      if (!what?.ground) throw new Error('area: takes a claim id and a feature');
      const polys = what.list.filter(f => /Polygon/.test(f.geometry.type));
      if (!polys.length) throw new Error(`area: the feature ${what.ground} holds no area`);
      const shape = polys.reduce((a, b) => a ? turf.union(fc(a, b)) : b, null);
      // each part's outline is a line of its own
      return note(shape, ...outline(shape).map(ring => line('sourced', { claim, feature: what.ground, whole: true }, ring)));
    },
    town(why, at, radius) {
      why_(why, 'town');
      if (!isPoint(at) || !(radius > 0)) throw new Error('town: takes a reason, a place [lng, lat] and a radius in km');
      const shape = turf.circle(at, radius, { units: 'kilometers', steps: 24 });
      return note(shape, line('estimate', { why: `${why.trim()} (a circle of ${radius} km)` }, shape.geometry.coordinates[0]));
    },
    // a mask cuts and never adds: union refuses it, so no land reaches a zone but through a line or a named shape
    mask(points) {
      if (!Array.isArray(points) || points.length < 3 || !points.every(isPoint)) throw new Error('mask: takes three points or more, each [lng, lat]');
      const shape = turf.polygon([[...points, points[0]]]); used.set(shape, new Set()); masks.add(shape); return shape;
    },
    standing(id) {
      const file = path.join(dir, 'shared', 'zones', `${id}.geojson`);
      if (!fs.existsSync(file)) throw new Error(`standing: no ${file}`);
      read.add(id);
      const f = JSON.parse(fs.readFileSync(file, 'utf8'));
      const shape = turf.feature(f.geometry); used.set(shape, new Set());
      return shape;
    },
    country(name) { const f = countries.find(c => c.properties.name === name); if (!f) throw new Error(`no country of Natural Earth is named ${name}`); const shape = turf.feature(f.geometry); used.set(shape, new Set()); return shape; },
    landAt(point) { const f = land.find(l => turf.booleanPointInPolygon(point, l)); if (!f) throw new Error(`no land at ${JSON.stringify(point)}`); const shape = turf.feature(f.geometry); used.set(shape, new Set()); return shape; },
    union(...fs_) {
      const have = fs_.filter(Boolean).map(f => known(f, 'union'));
      if (!have.length) throw new Error('union: takes one shape or more');
      if (have.some(f => masks.has(f))) throw new Error('union: a mask cuts and adds no land. Make the land with region(...) from lines, so the manifest says what its edge rests on');
      return note(have.reduce((a, b) => turf.union(fc(a, b))), ...have);
    },
    diff(a, ...bs) {
      const have = bs.filter(Boolean).map(f => known(f, 'diff'));
      const left = have.reduce((x, b) => { const r = turf.difference(fc(x, b)); if (!r) throw new Error('diff: nothing is left of the first shape. It lies whole inside what is taken away'); return r; }, known(a, 'diff'));
      return note(left, a, ...have);
    },
    inter(a, ...bs) {
      if (!bs.length) throw new Error('inter: takes two shapes or more');
      const all = [a, ...bs].map(f => known(f, 'inter'));
      return note(all.reduce((x, b) => { const r = turf.intersect(fc(x, b)); if (!r) throw new Error('inter: the shapes do not meet'); return r; }), ...all);
    },
    grow(a, by) { const r = turf.buffer(known(a, 'grow'), by, { units: 'kilometers' }); if (!r?.geometry?.coordinates?.length) throw new Error(`grow: nothing is left of the shape at ${by} km`); return note(r, a); },
    noIslands(shape, points) {
      let f = known(shape, 'noIslands');
      for (const p of points) { const isle = land.find(l => turf.booleanPointInPolygon(p, l)); if (!isle) throw new Error(`no land at ${JSON.stringify(p)}`); f = turf.difference(fc(f, turf.buffer(turf.simplify(isle, { tolerance: 0.003, highQuality: true }), 1.5, { units: 'kilometers' }))); if (!f) throw new Error(`noIslands: nothing is left of the shape without the land at ${JSON.stringify(p)}`); }
      return note(f, shape);
    },
    zone(id, props, shape, tests = {}) {
      if (zones.has(id)) throw new Error(`zone ${id} is given twice`);
      if (!props?.family || !props?.name) throw new Error(`zone ${id}: give its family and its name`);
      known(shape, `zone ${id}`);
      if (masks.has(shape)) throw new Error(`zone ${id}: a mask is no zone`);
      zones.set(id, { props, shape, tests, lines: [...(used.get(shape) ?? [])].sort((a, b) => a - b) });
    },
    write() {
      const both = [...read].filter(id => zones.has(id));
      if (both.length) throw new Error(`${both.join(', ')}: read with standing() and written with zone(). A zone is one or the other`);
      fs.mkdirSync(zonesDir, { recursive: true });
      const round = c => typeof c[0] === 'number' ? [Math.round(c[0] * 1e4) / 1e4, Math.round(c[1] * 1e4) / 1e4] : c.map(round);
      const manifest = { story, made_by: 'scripts/zones-lib.mjs, from the story\'s zone generator. Not edited by hand.', features: [...features].sort(), standing: [...read].sort(), lines: [], zones: {} };
      for (const l of lines) manifest.lines.push({ n: l.n, kind: l.kind, ...(l.claim ? { claim: l.claim } : {}), ...(l.feature ? { feature: l.feature } : {}), ...(l.why ? { why: l.why } : {}), from: round(l.points[0]), to: round(l.points[l.points.length - 1]), points: l.points.length, km: km(l.points) });
      let failed = 0;
      // how much of a line lies on a zone's edge: it is walked in steps of some 2 km, and a step counts where it is
      // within 600 m of the edge. A line that only cut the zone, or made a shape taken away, counts for nothing
      const onEdge = (l, borders) => {
        const total = turf.length(turf.lineString(l.points)); if (!total) return 0;
        const whole = turf.lineString(l.points), n = Math.min(400, Math.max(8, Math.ceil(total / 2))); let hit = 0;
        for (let i = 0; i < n; i++) { const p = turf.along(whole, total * (i + 0.5) / n), [x, y] = p.geometry.coordinates; if (borders.some(({ box, f }) => x >= box[0] - 0.02 && x <= box[2] + 0.02 && y >= box[1] - 0.02 && y <= box[3] + 0.02 && turf.pointToLineDistance(p, f, { units: 'kilometers' }) < 0.6)) hit++; }
        return total * hit / n;
      };
      const onSome = new Set();
      for (const [id, { props, shape, tests, lines: own }] of zones) {
        const g = turf.truncate(shape, { precision: 4 }).geometry;
        const { family, name, clip } = props;
        fs.writeFileSync(path.join(zonesDir, `${id}.geojson`), JSON.stringify({ type: 'Feature', properties: { family, name, ...(clip ? { clip } : {}) }, geometry: { type: g.type, coordinates: g.coordinates } }) + '\n');
        const borders = turf.flatten(turf.polygonToLine(shape)).features.map(f => ({ f, box: turf.bbox(f) })), edge = Math.round(borders.reduce((t, b) => t + turf.length(b.f), 0));
        const share = new Map(lines.filter(l => own.includes(l.n)).map(l => [l.n, onEdge(l, borders)]));
        const edging = [...share].filter(([, v]) => v >= 1).map(([n]) => n), sum = kind => Math.round(lines.filter(l => edging.includes(l.n) && l.kind === kind).reduce((t, l) => t + share.get(l.n), 0));
        edging.forEach(n => onSome.add(n));
        // lines: those that lie on the zone's edge. cut_by: those that shaped it and do not. other_km: the edge that
        // no line gives, which is coast, the edge of a zone that stands, a country's outline or a mask's cut
        const entry = { lines: edging, ...(own.length > edging.length ? { cut_by: own.filter(n => !edging.includes(n)) } : {}), edge_km: edge, sourced_km: sum('sourced'), estimated_km: sum('estimate') };
        entry.other_km = Math.max(0, edge - entry.sourced_km - entry.estimated_km);
        for (const [side, want] of [['inside', true], ['outside', false]]) for (const [place, at] of Object.entries(tests[side] ?? {})) {
          const ok = turf.booleanPointInPolygon(at, shape) === want;
          (entry[side] ??= {})[place] = ok ? 'ok' : 'FAILS';
          if (!ok) { failed++; console.error(`${id}: ${place} ${JSON.stringify(at)} should lie ${side} the zone and does not`); }
        }
        if (!edging.length) { failed++; console.error(`${id}: no line lies on its edge, so nothing says what the edge rests on. Make its land with region(...) from src and est lines`); }
        manifest.zones[id] = entry;
      }
      const idle = lines.filter(l => ![...zones.values()].some(zn => zn.lines.includes(l.n)));
      const est = lines.filter(l => l.kind === 'estimate'), src = lines.filter(l => l.kind === 'sourced');
      // the totals count a line once, at its whole length, where it lies on the edge of any zone
      const drawn = kind => Math.round(lines.filter(l => l.kind === kind && onSome.has(l.n)).reduce((t, l) => t + km(l.points), 0));
      manifest.totals = { zones: zones.size, sourced_lines: src.length, estimated_lines: est.length, sourced_km: drawn('sourced'), estimated_km: drawn('estimate') };
      fs.writeFileSync(manifestFile ?? path.join(dir, '.plan', 'ground.yaml'), yaml.dump(manifest, { lineWidth: 160, flowLevel: 3 }));
      console.log(`${zones.size} zones written to ${zonesDir}: ${src.length} sourced lines, ${est.length} estimated, ${idle.length} in no zone. The manifest is ${manifestFile ?? path.join(dir, '.plan', 'ground.yaml')}.`);
      if (failed) { console.error(`${failed} tests fail: a place on the wrong side of a zone, or a zone with no line on its edge`); process.exitCode = 1; }
      return manifest;
    },
  };
  return z;
}
