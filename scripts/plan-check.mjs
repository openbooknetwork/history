// Checks the plans of a story against their schemas and against each other. Run from the repo root:
//   node scripts/plan-check.mjs <story> [section number ...]
// Try: node scripts/plan-check.mjs alexander-the-great 020
// A section's plan is four files in content/<story>/.plan/<number>-<section id>/: pages.yaml, map.yaml, text.yaml
// and battles.yaml, with battles/<battle id>.yaml beside them for a battle with phases. scripts/plan-schemas/ holds
// a schema for each. A section with pages.yaml alone is a pre-plan, and its pages have no rests_on yet.
//
// Beyond the schemas it checks that one fact stands in one file: map.yaml and text.yaml name each page by its id
// and name no other, each battle of a page is in battles.yaml on that page with the same phases, a battle with
// phases has its own file and no other field in battles.yaml, a battle with a card alone has its sides, and the
// pages run in time order within the section and from one section to the next. Prints ok, or each problem.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { bareLand, builtNeighbour } from './plan-zones.mjs';
import { crowded } from './view.mjs';
import { storyDir } from './story-dir.mjs';

const [story, ...only] = process.argv.slice(2);
if (!story) { console.error('usage: node scripts/plan-check.mjs <story> [section number ...], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }

const here = path.dirname(new URL(import.meta.url).pathname);
const schema = name => JSON.parse(fs.readFileSync(path.join(here, 'plan-schemas', `${name}.schema.json`), 'utf8'));
const problems = [];
const kind = v => Array.isArray(v) ? 'array' : v === null ? 'null' : Number.isInteger(v) ? 'integer' : typeof v;

// the part of JSON Schema the plan schemas use
function validate(v, s, at, file) {
  const say = text => problems.push(`${file}: ${at || 'the file'} ${text}`);
  if (s.enum && !s.enum.includes(v)) return say(`is ${JSON.stringify(v)}, not one of ${s.enum.join(', ')}`);
  if (s.type) {
    const types = [s.type].flat(), k = kind(v);
    if (!types.includes(k) && !(k === 'integer' && types.includes('number'))) return say(`is ${k === 'object' || k === 'array' ? `a ${k === 'array' ? 'list' : 'mapping'}` : JSON.stringify(v)}, not ${types.join(' or ')}`);
  }
  if (typeof v === 'string' && s.pattern && !new RegExp(s.pattern).test(v)) say(`is "${v}", which is not of the form ${s.pattern}`);
  if (Array.isArray(v)) {
    if (s.minItems && v.length < s.minItems) say(`has ${v.length} entries, fewer than ${s.minItems}`);
    if (s.maxItems && v.length > s.maxItems) say(`has ${v.length} entries, more than ${s.maxItems}`);
    if (s.items) v.forEach((x, i) => validate(x, s.items, `${at}[${x?.id ?? i}]`, file));
  } else if (v && typeof v === 'object') {
    for (const k of s.required ?? []) if (v[k] === undefined) say(`has no ${k}`);
    for (const [k, x] of Object.entries(v)) {
      const sub = s.properties?.[k] ?? (typeof s.additionalProperties === 'object' ? s.additionalProperties : null);
      if (sub) validate(x, sub, at ? `${at}.${k}` : k, file);
      else if (s.additionalProperties === false) say(`has an unknown field ${k}`);
    }
  }
}

function load(file, name) {
  if (!fs.existsSync(file)) return undefined;
  let doc;
  try { doc = yaml.load(fs.readFileSync(file, 'utf8'), { schema: yaml.JSON_SCHEMA }); } catch (e) { problems.push(`${file}: is not valid YAML, ${e.reason ?? e.message}`); return null; }
  validate(doc, schema(name), '', file);
  return doc;
}

// a when as a number that sorts: a year BC counts backwards and its months forwards
const order = when => {
  const m = String(when).match(/^(-?)(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  return m ? (m[1] ? -1 : 1) * +m[2] * 10000 + +(m[3] ?? 0) * 100 + +(m[4] ?? 0) : null;
};

const plan = path.join(dir, '.plan');
const sections = fs.existsSync(plan) ? fs.readdirSync(plan).filter(n => /^\d{3}-/.test(n) && fs.statSync(path.join(plan, n)).isDirectory()).sort() : [];
const checked = sections.filter(n => !only.length || only.includes(n.slice(0, 3)));
if (!checked.length) { console.error(`${plan} holds no section folder${only.length ? ` numbered ${only.join(', ')}` : ''}`); process.exit(2); }

const notes = [];
// the places of names.md: the first cell of each row of the tables under its "Places" heading
const places = new Set();
{
  const file = path.join(plan, 'names.md');
  let inPlaces = false;
  for (const line of fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n') : []) {
    if (/^## /.test(line)) { inPlaces = /^## Places\b/.test(line); continue; }
    const cell = inPlaces && line.match(/^\| *([^|]+?) *\|/)?.[1];
    if (cell && cell !== 'Name' && !/^-+$/.test(cell)) places.add(cell.replace(/^"|"$/g, ''));
  }
}
// a zone's legend name: its zones.yaml entry's, else its drawing's
const zoneNames = new Map();
function zoneName(id) {
  if (!zoneNames.size) {
    const all = (d, out = []) => { for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) { const full = path.join(d, e.name); if (e.isDirectory()) { if (!e.name.startsWith('.')) all(full, out); } else out.push(full); } return out; };
    const files = all(dir);
    for (const f of files.filter(f => f.endsWith('.geojson') && f.split(path.sep).includes('zones'))) { try { const doc = JSON.parse(fs.readFileSync(f, 'utf8')), n = (doc.features?.[0] ?? doc).properties?.name; if (n) zoneNames.set(path.basename(f, '.geojson'), String(typeof n === 'object' ? n.en ?? Object.values(n)[0] : n)); } catch { /* no drawing */ } }
    for (const f of files.filter(f => path.basename(f) === 'zones.yaml')) { try { for (const [k, v] of Object.entries(yaml.load(fs.readFileSync(f, 'utf8')) ?? {})) if (v?.name) zoneNames.set(k, String(v.name)); } catch { /* not a list of zones */ } }
    zoneNames.set('', '');
  }
  return zoneNames.get(id) ?? '';
}
let last = null;   // the page ahead, across sections
const marked = new Map(), battleHome = new Map();
for (const name of sections) {
  const folder = path.join(plan, name), check = checked.includes(name), before = problems.length;
  const pages = load(path.join(folder, 'pages.yaml'), 'pages');
  if (pages === undefined) { if (check) problems.push(`${folder}: has no pages.yaml`); continue; }
  const list = Array.isArray(pages) ? pages.filter(p => p && typeof p === 'object') : [];
  const ids = new Set(list.map(p => p.id));
  const f = n => path.join(folder, n);
  for (const p of list) {
    const o = order(p.when);
    if (o !== null && last && o < last.o) problems.push(`${f('pages.yaml')}: ${p.id} starts at ${p.when}, before ${last.id} ahead of it at ${last.when}`);
    if (o !== null) last = { o, id: p.id, when: p.when };
    if (count(list, q => q.id === p.id) > 1) problems.push(`${f('pages.yaml')}: the id ${p.id} stands twice`);
    for (const m of p.markers ?? []) {
      if (marked.has(m) && marked.get(m) !== name) problems.push(`${f('pages.yaml')}: ${p.id} marks ${m}, which ${marked.get(m)} marks too`);
      else marked.set(m, name);
    }
  }
  const map = load(f('map.yaml'), 'map'), text = load(f('text.yaml'), 'text'), battles = load(f('battles.yaml'), 'battles');
  const full = map !== undefined || text !== undefined || battles !== undefined;
  if (!full) {
    for (const p of list) if (p.rests_on) problems.push(`${f('pages.yaml')}: ${p.id} has rests_on, and the section has no map.yaml, text.yaml and battles.yaml yet`);
  } else {
    for (const [n, doc] of [['map.yaml', map], ['text.yaml', text], ['battles.yaml', battles]]) if (doc === undefined) problems.push(`${folder}: has no ${n}`);
    for (const p of list) if (!p.rests_on?.length && !p.phase_of) problems.push(`${f('pages.yaml')}: ${p.id} has no rests_on`);
    const refs = [['map.yaml', map && typeof map === 'object' ? map : {}], ['text.yaml', text?.pages && typeof text.pages === 'object' ? text.pages : {}]];
    for (const [n, doc] of refs) {
      for (const id of Object.keys(doc)) if (!ids.has(id)) problems.push(`${f(n)}: ${id} is no page of pages.yaml`);
      for (const p of list) if (!(p.id in doc) && !p.phase_of && (n === 'map.yaml' ? map : text)) problems.push(`${f(n)}: has no entry for the page ${p.id}`);
    }
    const bl = Array.isArray(battles) ? battles.filter(b => b && typeof b === 'object') : [];
    // land a page would leave bare that the page before or after it colours
    if (check && map && typeof map === 'object') {
      const planned = list.filter(p => !p.phase_of && map[p.id]).map(p => ({ id: p.id, bbox: map[p.id].bbox, zones: map[p.id].zones ?? [], bare: map[p.id].bare }));
      for (const b of bareLand(dir, planned, builtNeighbour(dir, name, -1), builtNeighbour(dir, name, 1)))
        problems.push(`${f('map.yaml')}: ${b.page} leaves bare ${b.share}% of what a ${b.screen} shows of it, land that ${b.zone} colours on ${b.neighbour}. List ${b.zone} in its zones, or another stage of that state, or say why under bare: { ${b.zone}: <why> }`);
    }
    // a place a page's account names and its map does not mark. A text checker that finds one after the maps have
    // passed their audit costs a round of drawing and a recheck, so the plan says it here: mark the place, or
    // name it under `unmarked` with the reason, such as a region its zone shows.
    if (check && places.size) for (const p of list) {
      const told = `${p.tells ?? ''} ${text?.pages?.[p.id]?.account ?? ''}`, m = map?.[p.id];
      if (!told.trim() || !m) continue;
      const marked = Object.values(m.markers ?? {}).map(x => String(x?.name ?? '')).join(' | '), left = m.unmarked ?? {};
      // a region a zone of the page shows by name needs no marker: Macedon under "Macedon and Thrace", Illyria
      // under "Illyrians"
      const shown = (m.zones ?? []).map(zoneName).join(' | ').toLowerCase();
      const missing = [...places].filter(name => !shown.includes(name.toLowerCase().slice(0, Math.max(5, name.length - 2))) && new RegExp(`(?<![\\p{L}-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'u').test(told) && !marked.includes(name) && left[name] === undefined);
      if (missing.length) notes.push(`note: ${f('map.yaml')}: the account of ${p.id} names ${missing.join(', ')}, and the page ${missing.length === 1 ? 'does not mark it' : 'marks none of them'}. Mark what a reader has to find on the map, and name the rest under unmarked: { <place>: <why> }`);
    }
    // two markers of a page that would stand on each other at its opening view. The viewer shows one at a time, so
    // this is a note and no problem: the plan says which leads, by a rank, and the writer links the other. A
    // marker's point is the "about 43.70 N 24.48 E" of its `what`.
    const imaged = new Set(Object.values(text?.pages ?? {}).flatMap(e => Array.isArray(e?.images) ? e.images : []).map(i => String(i?.on ?? '').match(/^marker (\S+)$/)?.[1]).filter(Boolean));
    for (const p of list) {
      const m = map?.[p.id];
      if (!Array.isArray(m?.bbox) || m.bbox.length !== 4 || !m.markers || typeof m.markers !== 'object') continue;
      const places = Object.entries(m.markers).filter(([id]) => (p.markers ?? []).includes(id)).map(([id, x]) => {
        const at = String(x?.what ?? '').match(/(\d+(?:\.\d+)?) ([NS]),? (\d+(?:\.\d+)?) ([EW])/);
        return at && [id, [(at[4] === 'W' ? -1 : 1) * +at[3], (at[2] === 'S' ? -1 : 1) * +at[1]], imaged.has(id)];
      }).filter(Boolean);
      for (const [a, b, px] of crowded(m.bbox, places, bl.some(x => x.page === p.id))) {
        const rank = id => m.markers[id]?.rank ?? 0, [lead, wait] = rank(b) > rank(a) ? [b, a] : [a, b];
        if (check) notes.push(`note: ${f('map.yaml')}: on ${p.id}, ${wait} waits under ${lead} at the opening view, about ${px} pixels away. ${lead} leads by ${rank(lead) > rank(wait) ? 'its rank' : 'the page\'s order'}. See that the text links ${wait}, or give it the higher rank`);
      }
    }
    for (const b of bl) {
      if (battleHome.has(b.id)) problems.push(`${f('battles.yaml')}: ${b.id} is a battle of ${battleHome.get(b.id)} too`);
      battleHome.set(b.id, name);
      if (!ids.has(b.page)) problems.push(`${f('battles.yaml')}: ${b.id} is on ${b.page}, which is no page of pages.yaml`);
      const own = f(path.join('battles', `${b.id}.yaml`));
      if (b.phases === true) {
        const extra = Object.keys(b).filter(k => !['id', 'page', 'phases'].includes(k));
        if (extra.length) problems.push(`${f('battles.yaml')}: ${b.id} has phases, so ${extra.join(', ')} belong in battles/${b.id}.yaml alone`);
        const doc = load(own, 'battle');
        if (doc === undefined) problems.push(`${own}: is missing, and ${b.id} has phases`);
        else if (doc && doc.id !== b.id) problems.push(`${own}: its id is ${doc.id}`);
        for (const ph of doc?.phases ?? []) if (ph?.page && !ids.has(ph.page)) problems.push(`${own}: the phase page ${ph.page} is no page of pages.yaml`);
      } else if (b.phases === false) {
        for (const k of ['name', 'date', 'site', 'sides', 'outcome']) if (b[k] === undefined) problems.push(`${f('battles.yaml')}: ${b.id} has a card alone and no ${k}`);
        if (fs.existsSync(own)) problems.push(`${own}: stands, and battles.yaml gives ${b.id} no phases`);
      }
    }
    for (const p of list) for (const b of p.battles ?? []) {
      const hit = bl.find(x => x.id === b.id);
      if (!hit) problems.push(`${f('pages.yaml')}: ${p.id} names the battle ${b.id}, which battles.yaml lacks`);
      else if (hit.page !== p.id) problems.push(`${f('pages.yaml')}: ${p.id} names the battle ${b.id}, which battles.yaml puts on ${hit.page}`);
      else if (hit.phases !== b.phases) problems.push(`${f('pages.yaml')}: ${p.id} gives ${b.id} phases: ${b.phases}, and battles.yaml ${hit.phases}`);
    }
    for (const b of bl) if (!list.some(p => (p.battles ?? []).some(x => x.id === b.id))) problems.push(`${f('battles.yaml')}: no page of pages.yaml names the battle ${b.id}`);
    for (const p of list) if (p.phase_of && !bl.some(b => b.id === p.phase_of && b.phases === true)) problems.push(`${f('pages.yaml')}: ${p.id} is a phase of ${p.phase_of}, which is no battle with phases of battles.yaml`);
  }
  if (!check) problems.length = before;
}
function count(list, test) { return list.filter(test).length; }

for (const n of new Set(notes)) console.log(n);
if (problems.length) { console.log([...new Set(problems)].join('\n')); process.exit(1); }
console.log('ok');
