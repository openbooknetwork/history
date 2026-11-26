// Gives the shape of each river, lake, region and mountain range inside a box, in one command. Run from the repo
// root:
//   node scripts/ground.mjs <west,south,east,north> [--name <name>,<name>,...] [--kind river|lake|region|range]
//                           [--out <file>] [--out-dir <folder>] [--osm] [--rows <n>] [--tolerance <degrees>]
// Try: node scripts/ground.mjs 22.3,43.4,26.2,44.4 --name danube
// Try (network): node scripts/ground.mjs 27.15,40.25,27.40,40.42 --name biga --osm
// A border or a battle's ground often rests on something the story's own files lack: a river, a lake, a range, or
// a land a source names that is a region of today. Two sources give them:
//   Natural Earth   the data the map's coasts come from: rivers and lakes, with finer files for Europe and North
//                   America, first-level regions (a state, a province) and named ranges, plateaus, plains and
//                   peninsulas. Its nine files, some 70 MB, are downloaded once into .cache/natural-earth from
//                   the project's asset store and read from disk: no server after that, and an answer in a second.
//   OpenStreetMap   by the public Overpass servers, only with --osm: for what Natural Earth lacks, a small river,
//                   a stream, a pond, a district. They are slow and fail often, and they give no ranges.
// With no --name it lists what Natural Earth holds in the box, and with --osm what OpenStreetMap holds too. With
// --name it keeps what has that text in a name of any language: several names go in one call, with commas. Each
// row is one piece: its source, its kind, its size inside the box, its points and its names. A river is a line
// and its size is km. A lake, a region and a range are areas and their size is km2. Each shape is cut to the box
// and simplified (0.0003 degrees, about 30 m, unless --tolerance). It prints 40 rows at the most, the largest
// first, unless --rows, and says how many it left out: the files of the data are never read by an agent.
// --kind keeps one kind. A name is looked for in every kind. A box with no name lists no region: give --kind region.
// With --osm every name is asked of the servers in one question, so five names wait as long as one.
// --out writes every piece found to one GeoJSON file. --out-dir writes one file a name, <folder>/<name>.geojson:
//   content/<story>/.plan/ground/                                            for a zone's border, read by scripts/zones-lib.mjs
//   content/<story>/.plan/<section>/battles/<battle id>-ground.geojson       for a battle's field, with --out
// A file written there is committed, so no later run asks anything for it.
// Where a name is found nowhere, or no server answers, it says so and ends with status 1: draw that line as an
// estimate and say so in your report. It does not wait long: two tries of 45 seconds for all the names together.
// The shapes are today's. A river or a shore may have moved since: the plan says so where a source does. A range
// is an area drawn round the mountains and no crest line.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import * as yaml from 'js-yaml';
const turf = createRequire(path.resolve('package.json'))('@turf/turf');

const KINDS = ['river', 'lake', 'region', 'range'];
const usage = 'usage: node scripts/ground.mjs <west,south,east,north> [--name <name>,<name>,...] [--kind river|lake|region|range] [--out <file>] [--out-dir <folder>] [--osm] [--rows <n>] [--tolerance <degrees>], from the repo root';
const stop = message => { console.error(`${message}\n${usage}`); process.exit(2); };
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(`--${name}`); if (i < 0) return false; args.splice(i, 1); return true; };
const value = name => { const i = args.indexOf(`--${name}`); if (i < 0) return null; const v = args.splice(i, 2)[1]; if (v === undefined || v.startsWith('--')) stop(`--${name} takes a value`); return v; };
const wants = (value('name') ?? '').split(',').map(x => x.trim()).filter(Boolean), kindWanted = value('kind'), outFile = value('out'), outDir = value('out-dir'), osm = flag('osm'), tolerance = +(value('tolerance') ?? 0.0003), rows = +(value('rows') ?? 40);
// a box may begin with a minus sign: it is the one argument that is left
const box = (args[0] ?? '').split(',').map(Number);
if (args.length !== 1 || box.length !== 4 || box.some(Number.isNaN)) stop('give one box, as west,south,east,north');
if (kindWanted && !KINDS.includes(kindWanted)) stop(`--kind is one of ${KINDS.join(', ')}`);
if (outDir && !wants.length) stop('--out-dir writes one file a name: give --name');
const [w, s, e, n] = box;
if (!(w < e && s < n)) stop('the box is west,south,east,north, with west under east and south under north');

// a name as it is compared: without case and without the marks on its letters, so "iznik" finds "İznik"
const fold = t => String(t).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ı/g, 'i');
const round = p => p.map(x => Math.round(x * 1e5) / 1e5);
const simple = f => turf.simplify(f, { tolerance, highQuality: true });
const same = (a, c) => Math.abs(a[0] - c[0]) < 1e-6 && Math.abs(a[1] - c[1]) < 1e-6;
// joins pieces that meet at their ends into the longest chains, turning a piece round where it meets backwards
function join(pieces) {
  const left = pieces.map(p => p.slice()), chains = [];
  while (left.length) {
    let line = left.shift(), grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < left.length; i++) {
        const p = left[i], end = line[line.length - 1], start = line[0];
        if (same(p[0], end)) line = line.concat(p.slice(1));
        else if (same(p[p.length - 1], end)) line = line.concat(p.slice().reverse().slice(1));
        else if (same(p[p.length - 1], start)) line = p.concat(line.slice(1));
        else if (same(p[0], start)) line = p.slice().reverse().concat(line.slice(1));
        else continue;
        left.splice(i, 1); grew = true; break;
      }
    }
    chains.push(line);
  }
  return chains;
}
// a line or an area cut to the box, as the features of the result
function pieces(source, kind, names, geometry) {
  const out = [], name = names[0];
  if (/LineString/.test(geometry.type)) {
    for (const line of join(geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates)) {
      if (line.length < 2) continue;
      const cut = turf.bboxClip(turf.lineString(line), box), parts = cut.geometry.type === 'LineString' ? [cut.geometry.coordinates] : cut.geometry.coordinates;
      for (const part of parts.filter(p => p.length > 1)) { const f = turf.lineString(part); out.push({ type: 'Feature', properties: { name, names, kind, source, km: Math.round(turf.length(f) * 10) / 10 }, geometry: { type: 'LineString', coordinates: simple(f).geometry.coordinates.map(round) } }); }
    }
  } else if (/Polygon/.test(geometry.type)) {
    for (const rings of geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates) {
      const whole = turf.polygon(rings), cut = turf.bboxClip(whole, box), polys = cut.geometry.type === 'Polygon' ? [cut.geometry.coordinates] : cut.geometry.coordinates;
      for (const part of polys.filter(r => r.length && r[0].length > 3)) { const f = turf.polygon(part), km2 = Math.round(turf.area(f) / 1e4) / 100; if (km2 > 0) out.push({ type: 'Feature', properties: { name, names, kind, source, km2, whole: turf.area(whole) - turf.area(f) < 1 }, geometry: { type: 'Polygon', coordinates: simple(f).geometry.coordinates.map(r => r.map(round)) } }); }
    }
  }
  return out;
}

// ---- Natural Earth, kept on disk
const NE = path.join('.cache', 'natural-earth'), GITHUB = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson';
// where the files are downloaded from, in this order: GROUND_DATA_URL, then the project's own copy in its asset
// store, the folder dev/natural-earth/ under `assets.url` of site.yaml, then the project that publishes Natural
// Earth. Each holds the four files by their own names. site.yaml takes no key of ours: the engine refuses one.
const own = (() => { try { const u = yaml.load(fs.readFileSync('site.yaml', 'utf8'))?.assets?.url; return u ? `${u.replace(/\/$/, '')}/dev/natural-earth` : null; } catch { return null; } })();
const FROMS = [process.env.GROUND_DATA_URL, own, GITHUB].filter(Boolean).map(u => u.replace(/\/$/, ''));
// the world's file of each kind, and Natural Earth's finer files for Europe and North America, which hold the
// smaller rivers and lakes of the two: the Timok, the Yantra, the Schuylkill
const FILES = { river: ['ne_10m_rivers_lake_centerlines', 'ne_10m_rivers_europe', 'ne_10m_rivers_north_america'], lake: ['ne_10m_lakes', 'ne_10m_lakes_europe', 'ne_10m_lakes_north_america', 'ne_10m_lakes_historic'], region: ['ne_10m_admin_1_states_provinces'], range: ['ne_10m_geography_regions_polys'] };
const notes = [];
const natural = async kind => (await Promise.all(FILES[kind].map(name => naturalFile(kind, name)))).flat();
async function naturalFile(kind, name) {
  const file = path.join(NE, `${name}.geojson`);
  if (!fs.existsSync(file)) {
    let text = null; const tried = [];
    for (const from of FROMS) {
      try {
        const r = await fetch(`${from}/${name}.geojson`, { signal: AbortSignal.timeout(240000) });
        if (!r.ok) throw new Error(String(r.status));
        const body = await r.text(); JSON.parse(body); text = body; break;
      } catch (err) { tried.push(`${from}: ${err.message}`); }
    }
    if (text === null) { notes.push(`Natural Earth's ${kind} file, ${name}.geojson, could not be downloaded into ${NE}/ (${tried.join('; ')})`); return []; }
    fs.mkdirSync(NE, { recursive: true }); fs.writeFileSync(file, text);
  }
  const p = f => f.properties ?? {};
  const names = f => [...new Set([p(f).name, p(f).name_en, p(f).NAME, p(f).name_alt, p(f).gn_name, p(f).woe_name, p(f).name_local, p(f).region].filter(x => typeof x === 'string' && x.trim()).flatMap(x => x.split(/[|;]/).map(y => y.trim())).filter(Boolean))];
  return JSON.parse(fs.readFileSync(file, 'utf8')).features.filter(f => f.geometry).map(f => ({ names: names(f), kind: kind === 'range' ? fold(p(f).featurecla ?? p(f).FEATURECLA ?? 'range').replace('range/mtn', 'range') : kind === 'river' && /lake/i.test(p(f).featurecla ?? '') ? 'lake line' : kind, geometry: f.geometry }))
    .filter(f => f.names.length).filter(f => { const b = turf.bbox(f.geometry); return b[0] <= e && b[2] >= w && b[1] <= n && b[3] >= s; });
}
// ---- OpenStreetMap, by Overpass: one name, or everything named in the box
const servers = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
async function overpass(wantList) {
  const want = wantList?.length ? wantList : null;
  const b = `(${s},${w},${n},${e})`;
  // the name is text and no pattern: each character a pattern reads is escaped, and the servers match it against every name key
  const literal = want?.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/"/g, '')).join('|');
  const named = want ? `[~"^(name|name:.*|alt_name|old_name|int_name)$"~"${literal}",i]` : '["name"]';
  const water = `way["waterway"~"^(river|stream|canal)$"]${named}${b};way["natural"="water"]${named}${b};relation["natural"="water"]${named}${b};`;
  const regions = `relation["boundary"="administrative"]["admin_level"~"^[3-8]$"]${named}${b};`;
  const query = `[out:json][timeout:40];(${kindWanted === 'region' ? regions : water});out geom;`;
  const kept = path.join('.cache', 'ground', `${box.join('_')}${kindWanted === 'region' ? '_region' : ''}${want ? `_${crypto.createHash('sha1').update(want.map(fold).sort().join('|')).digest('hex').slice(0, 12)}` : ''}.json`);
  let data = fs.existsSync(kept) ? JSON.parse(fs.readFileSync(kept, 'utf8')) : null, refused = null;
  if (data?.remark) data = null;
  const ask = async url => {
    const r = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'ground-lookup' }, signal: AbortSignal.timeout(45000) });
    if (r.status === 400) { refused = `${url}: ${(await r.text()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)}`; throw new Error(refused); }
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    const answer = await r.json();
    // a server that ran out of time or of memory answers with what it had and a remark: that is no answer
    if (answer.remark) throw new Error(`${url}: ${String(answer.remark).slice(0, 120)}`);
    return answer;
  };
  // every server is asked at once and the first answer is taken, twice at the most
  const fetched = !data;
  for (let turn = 0; turn < 2 && !data && !refused; turn++) data = await (turn ? new Promise(r => setTimeout(r, 4000)) : Promise.resolve()).then(() => Promise.any(servers.map(ask)).catch(err => { notes.push(`OpenStreetMap, try ${turn + 1}${want ? ` for ${want.join(', ')}` : ''}: ${(err.errors ?? [err]).map(x => x.message).join('; ').slice(0, 300)}`); return null; }));
  if (!data) { notes.push(refused ? `the query${want ? ` for ${want.join(', ')}` : ''} was refused, and no later try would differ` : `no Overpass server answered${want ? ` for ${want.join(', ')}` : ''}`); return null; }
  if (fetched) { fs.mkdirSync(path.dirname(kept), { recursive: true }); fs.writeFileSync(kept, JSON.stringify(data)); }
  const namesOf = tags => [...new Set(Object.entries(tags).filter(([k]) => k === 'name' || /^(name:|alt_name|old_name|int_name)/.test(k)).flatMap(([, v]) => v.split(';').map(x => x.trim())))];
  const coords = g => g.map(p => [p.lon, p.lat]);
  const rivers = new Map(), out = [];
  for (const el of data.elements ?? []) {
    const names = namesOf(el.tags);
    if (want && !names.some(x => want.some(y => fold(x).includes(fold(y))))) continue;
    if (el.tags.waterway) {
      const key = el.tags.name ?? names[0];
      if (!rivers.has(key)) rivers.set(key, { names: new Set(), lines: [], kind: el.tags.waterway });
      const g = rivers.get(key); names.forEach(x => g.names.add(x)); g.lines.push(coords(el.geometry));
    } else {
      const kind = el.tags.boundary ? 'region' : el.tags.water ?? 'water';
      if (['river', 'stream', 'canal'].includes(kind)) continue;       // a river's own surface: its line is enough
      const outer = el.type === 'way' ? [coords(el.geometry)] : join(el.members.filter(m => m.type === 'way' && m.role !== 'inner' && m.geometry).map(m => coords(m.geometry)));
      const inner = el.type === 'way' ? [] : join(el.members.filter(m => m.type === 'way' && m.role === 'inner' && m.geometry).map(m => coords(m.geometry)));
      const closed = r => r.length > 3 && same(r[0], r[r.length - 1]);
      for (const ring of outer.filter(closed)) { const shell = turf.polygon([ring]), holes = inner.filter(closed).filter(h => turf.booleanPointInPolygon(turf.point(h[0]), shell)); out.push(...pieces('OpenStreetMap', kind, names, { type: 'Polygon', coordinates: [ring, ...holes] })); }
    }
  }
  for (const [, g] of rivers) out.push(...pieces('OpenStreetMap', g.kind, [...g.names], { type: 'MultiLineString', coordinates: g.lines }));
  return out;
}

// which file a piece came from says what it is, for --kind: `set` is river, lake, region or range
const held = { river: await natural('river'), lake: await natural('lake'), region: kindWanted === 'region' || (wants.length && !kindWanted) ? await natural('region') : [], range: [] };
if (kindWanted === 'range' || !kindWanted) held.range = await natural('range');
// a name is looked for in every kind, a region too. A box with no name lists no region unless --kind region
const local = want => KINDS.filter(k => !kindWanted || k === kindWanted).flatMap(k => held[k].filter(f => !want || f.names.some(x => fold(x).includes(fold(want)))).flatMap(f => pieces('Natural Earth', f.kind, f.names, f.geometry).map(x => ({ ...x, set: k }))));
const remote = async list => ((await overpass(list)) ?? []).map(x => ({ ...x, set: x.geometry.type === 'LineString' ? 'river' : x.properties.kind === 'region' ? 'region' : 'lake' })).filter(x => !kindWanted || x.set === kindWanted);

const byName = new Map(), missing = [];
if (!wants.length) {
  const all = local(null);
  if (osm && kindWanted !== 'range') all.push(...await remote(null));
  byName.set('', all);
} else {
  for (const want of wants) byName.set(want, osm ? [] : local(want));
  // with --osm the servers are asked, once for all the names together. Without it no server is asked at all
  const lacking = wants.filter(x => !byName.get(x).length);
  if (osm && lacking.length && kindWanted !== 'range') { const got = await remote(lacking); for (const want of lacking) byName.set(want, got.filter(f => f.properties.names.some(x => fold(x).includes(fold(want))))); }
  for (const want of wants) { if (osm && !byName.get(want).length) byName.set(want, local(want)); if (!byName.get(want).length) missing.push(want); }
}
const size = f => f.properties.km ?? f.properties.km2;
const sorted = list => list.map(({ set, ...f }) => f).sort((a, c) => (a.geometry.type === c.geometry.type ? size(c) - size(a) : a.geometry.type === 'LineString' ? -1 : 1));
const features = [...byName.values()].flatMap(sorted);
// a wide box holds hundreds of pieces: the list stops at 40 rows, or at --rows, and says how many it left out.
// What is written with --out and --out-dir is never cut
const shown = features.slice(0, rows);
for (const f of shown) {
  const p = f.properties, line = f.geometry.type === 'LineString', points = line ? f.geometry.coordinates.length : f.geometry.coordinates.reduce((t, r) => t + r.length, 0);
  console.log(`${p.source === 'Natural Earth' ? 'NE ' : 'OSM'}  ${(p.kind ?? '').padEnd(10)} ${String(size(f)).padStart(9)} ${line ? 'km ' : 'km2'}  ${String(points).padStart(4)} points  ${p.names.slice(0, 8).join(' / ')}${!line && !p.whole ? '  (cut at the box)' : ''}`);
}
if (features.length > shown.length) console.log(`... and ${features.length - shown.length} more, smaller ones. Give --name or --kind, or a smaller box, to see fewer, or --rows <n> to see more.`);
const collection = list => JSON.stringify({ type: 'FeatureCollection', source: 'Natural Earth and OpenStreetMap, by scripts/ground.mjs', box, features: list }) + '\n';
if (outFile && features.length) { fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.writeFileSync(outFile, collection(features)); console.log(`\nwritten to ${outFile}`); }
if (outDir) for (const [want, list] of byName) { const own = sorted(list); if (!own.length) continue; const file = path.join(outDir, `${fold(want).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || crypto.createHash('sha1').update(want).digest('hex').slice(0, 8)}.geojson`); fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(file, collection(own)); console.log(`written to ${file}`); }
for (const l of notes) console.error(l);
if (!features.length) console.log(`nothing named in ${box.join(',')}${wants.length ? ` holds ${wants.map(x => `"${x}"`).join(' or ')}` : ''}${kindWanted ? ` as a ${kindWanted}` : ''}`);
if (missing.length) console.error(osm ? `not found: ${missing.join(', ')}. Draw such a line as an estimate, and say so in your report.` : `not in Natural Earth: ${missing.join(', ')}. For a small river or a pond, run it again for those names with --osm, which asks the OpenStreetMap servers and may wait a minute and a half. Or draw the line as an estimate, and say so in your report.`);
else if (!outFile && !outDir && features.length) console.log('\nGive --out <file> or --out-dir <folder> to keep the shapes, and --name or --kind to keep some of them.');
process.exit(missing.length || (!features.length && wants.length) ? 1 : 0);
