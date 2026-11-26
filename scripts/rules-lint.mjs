// Tests that a story's built pages follow the rules of agents/pages.md and agents/text.md. Run from the repo root,
// beside `harita check`, which tests that the files are valid:
//   node scripts/rules-lint.mjs <story> [section number ...]
// Try: node scripts/rules-lint.mjs alexander-the-great 020
//
// It reads content/<story>/pages/, the story's markers, zones and battle cards, and where the story has them the
// YAML plans of content/<story>/.plan/<number>-<section id>/. It reports:
// - a marker that waits under another icon at the page's opening view and that the text does not link: one within
//   about 20 pixels of the page's battle card, whose crossed swords lead every marker, or one of two markers that
//   stand on each other, where the higher rank leads and of equal rank the one listed first. The view is an estimate: a map of 1280 by 800 pixels in web mercator, the card docked at its end
//   edge (28.5rem and a margin, 467 pixels), and the page's bbox fitted into the room beside it. The shell's own
//   padding and the text panel are left out, so a real map shows the two a little closer than the estimate.
// - a zone whose legend name carries a year, where the name ends before the page's date or starts after it. Only
//   years are compared: a name of July on a page of autumn of the same year passes.
// - a marker id on pages of different events, where the marker has a note. Pages of different dates or sections
//   count as different events. A marker with a label and no note tells no event and is left alone.
// - a battle id without its year, the form <name>-<year>
// - a page without a `when`
// - a text body under 150 words or over 350, the two hard limits. 300 is the soft limit, which it does not report. The body is the text of the story's default language up to the
//   `### Notes` heading or the first footnote definition, without `@image` lines, headings and a sources list.
// - a disputed claim of the digest that a page's plan rests on, where the page's text has no `### Notes` heading.
//   The plan is pages.yaml of the section's plan folder with a `rests_on` list per page, and the digest is
//   .plan/research.md, one claim a line: `- <id> <Kind>: <claim>. <standing>. "quote" (file, ...)`. A story with no
//   YAML plan folder skips this check.
// - a card page whose opening frame hides the battle behind the docked card. It tests one thing: that the card's
//   lnglat lies inside the page's bbox. The viewer fits the bbox into the room beside the card, so a site inside
//   the bbox shows, and one outside it may stand under the card or off the map.
//
// It prints each fault as an entry of the fault list of agents/report.md, with the id <list>-rules-lint-<n>, where
// the list is the section's number, so a fixer applies it as it stands. With no fault it prints ok. It ends with
// status 1 where there are faults, and writes no file.
//
// What it cannot judge:
// - whether a body is fair to both sides of a dispute. It sees that a text cites a claim the digest marks disputed
//   and has no Notes heading, and no more. The fact-checker judges the wording.
// - whether two pages tell different events. It takes pages of different dates or sections as different.
// - the careful side, land that no source says was taken. That needs the sources and stays with the map-auditor.
// It does not test bare land between pages (scripts/zone-gaps.mjs), a card moved off its site, or the pages a
// story takes from a battle's folder with an include.yaml.
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { merc, scale, crowded, MAP, DOCK } from './view.mjs';
import { storyDir } from './story-dir.mjs';

const [story, ...only] = process.argv.slice(2);
if (!story) { console.error('usage: node scripts/rules-lint.mjs <story> [section number ...], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }

const NEAR = 20, WORDS = [150, 350];
const read = file => { try { return yaml.load(fs.readFileSync(file, 'utf8')) ?? {}; } catch (e) { console.error(`${file}: ${e.message.split('\n')[0]}`); return {}; } };
const bare = name => name.replace(/^\d+-/, '');
const number = name => name.match(/^\d+/)?.[0] ?? name;

// every file under a folder, hidden folders left out
function walk(folder, out = []) {
  if (!fs.existsSync(folder)) return out;
  for (const d of fs.readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (d.name.startsWith('.') || d.name === 'node_modules') continue;
    const full = path.join(folder, d.name);
    if (d.isDirectory()) walk(full, out); else out.push(full);
  }
  return out;
}

// The years a text names, BC as negative numbers: "Winter 327-326 BC" gives [-327, -326], "6 July 1809" [1809].
// A number counts as a year where BC follows it or its range, or where it has three digits or more, and a text
// that says BC and never AD is BC throughout: "December 331 – January 330 BC" gives [-331, -330].
function years(text) {
  const out = [], allBC = /\bBCE?\b/.test(text ?? '') && !/\b(AD|CE)\b/.test(text ?? '');
  for (const m of String(text ?? '').matchAll(/(\d{1,4})(\s*BCE?\b)?(?=(\s*(?:[–—-]|to)\s*\d{1,4}\s*BCE?\b)?)/g)) {
    const bc = m[2] || m[3] || (allBC && m[1].length >= 3);
    if (bc || m[1].length >= 3) out.push(bc ? -Number(m[1]) : Number(m[1]));
  }
  return out;
}
const whenYear = v => v instanceof Date ? v.getUTCFullYear() : (m => m ? Number(m[1] + m[2]) : null)(String(v ?? '').match(/^(-?)(\d{1,4})/));
// the first and last year of a page, from its `when` or else from its date line
function span(page) {
  const w = page.when, from = w && typeof w === 'object' && !(w instanceof Date) ? w.from : w;
  const ys = from != null ? [whenYear(from), whenYear(w?.to ?? from)].filter(y => y !== null) : years(page.date);
  return ys.length ? [Math.min(...ys), Math.max(...ys)] : null;
}
const yearText = y => y < 0 ? `${-y} BC` : String(y);

// the story's files and the shared folders above it
const files = walk(dir);
const above = [];
for (let up = path.dirname(dir); ; up = path.dirname(up)) { above.push(...walk(path.join(up, 'shared'))); if (up === 'content' || up === '.' || up === path.dirname(up)) break; }

const markers = {};
for (const f of [...above, ...files].filter(f => path.basename(f) === 'markers.yaml')) Object.assign(markers, read(f));

// a zone's legend name: its zones.yaml entry's, or else its outline's
const outlines = {}, entries = {};
for (const f of [...above, ...files]) {
  if (f.endsWith('.geojson') && /(^|\/)zones\//.test(f)) outlines[path.basename(f) === 'zone.geojson' ? path.basename(path.dirname(f)) : path.basename(f, '.geojson')] = f;
  if (path.basename(f) === 'zones.yaml') for (const [id, e] of Object.entries(read(f))) if (e && typeof e === 'object') entries[id] = e;
}
const outlineName = {};
function zoneName(id, seen = new Set()) {
  if (seen.has(id)) return null;
  seen.add(id);
  const e = entries[id];
  if (e?.name) return typeof e.name === 'string' ? e.name : Object.values(e.name)[0];
  if (e?.zone) return zoneName(e.zone, seen);
  if (!outlines[id]) return null;
  if (!(id in outlineName)) {
    let name = null;
    try { const g = JSON.parse(fs.readFileSync(outlines[id], 'utf8')); name = g.properties?.name ?? g.features?.[0]?.properties?.name ?? null; } catch { /* harita check reports a file that does not parse */ }
    outlineName[id] = name;
  }
  return outlineName[id];
}

const cards = {};
for (const f of [...above, ...files].filter(f => path.basename(f) === 'battle.yaml')) cards[path.basename(path.dirname(f))] = read(f);

// the pages in reading order
const lang = read(path.join(dir, 'story.yaml')).default_language ?? 'en';
const root = path.join(dir, 'pages');
const pages = files.filter(f => path.basename(f) === 'page.yaml' && f.startsWith(root + path.sep)).map(file => {
  const folder = path.dirname(file), section = path.relative(root, folder).split(path.sep)[0];
  return { file, folder, section, list: number(section), id: bare(path.basename(folder)), text: path.join(folder, 'text', `${lang}.md`), ...read(file) };
});
const picked = p => !only.length || only.includes(p.list);
const eventOf = p => `${p.section}|${p.when != null ? JSON.stringify(p.when) : p.date ?? ''}`;

const faults = [], counts = {};
function fault(page, f) {
  counts[page.list] = (counts[page.list] ?? 0) + 1;
  faults.push({ id: `${page.list}-rules-lint-${counts[page.list]}`, severity: 'wrong', file: f.file ?? page.file, field: f.field, ...(f.old !== undefined && { old: f.old }),
    new: f.new, source: f.source, kind: f.kind, ...(f.claim && { claim: f.claim }), introduced: f.introduced, owner: f.owner, state: 'open' });
}

const isPoint = v => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite);

// the digest's disputed claims, and each page's rests_on from the YAML plans
const planDir = path.join(dir, '.plan'), rests = {};
let plans = false;
for (const d of fs.existsSync(planDir) ? fs.readdirSync(planDir, { withFileTypes: true }) : []) {
  const file = path.join(planDir, d.name, 'pages.yaml');
  if (!d.isDirectory() || !fs.existsSync(file)) continue;
  plans = true;
  const plan = read(file);
  for (const p of Array.isArray(plan) ? plan : []) if (p?.id) rests[`${number(d.name)}|${p.id}`] = { file, claims: (p.rests_on ?? []).map(String) };
}
const disputed = new Map();
const digest = path.join(planDir, 'research.md');
if (plans && fs.existsSync(digest)) {
  for (const line of fs.readFileSync(digest, 'utf8').split('\n')) {
    const m = line.match(/^- (\d{3}\.\d+) \w[\w ]*?: (.*)$/);
    if (!m) continue;
    const head = m[2].split('"')[0];   // the claim and its standing, before the first quote
    if (/[.;]\s+disputed\b/.test(head)) disputed.set(m[1], head.trim());
  }
}

const firstUse = {};   // marker id -> the first page that shows it
for (const page of pages) {
  const shown = Array.isArray(page.markers) ? page.markers : [];
  const mine = picked(page);

  // a marker on pages of different events
  for (const id of shown) {
    const first = firstUse[id] ??= page;
    if (mine && markers[id]?.note && eventOf(first) !== eventOf(page)) fault(page, { field: 'markers', old: id,
      new: `a marker id of this page's own, with a note that tells this page's event. ${id} is first shown on ${path.relative(root, first.folder)} (${first.date ?? 'no date'}), and its note reads "${markers[id].note}"`,
      source: 'agents/pages.md, Zones and markers from page to page: a marker\'s note tells the event of its own page', kind: 'map', introduced: 'plan', owner: 'cartographer' });
  }
  if (!mine) continue;

  // a page without a when
  if (page.when == null) {
    const y = years(page.date)[0];
    fault(page, { field: 'when', new: `a \`when\` for the page's date${page.date ? ` (${page.date})` : ''}${y !== undefined ? `, such as ${y < 0 ? '-' : ''}${String(Math.abs(y)).padStart(4, '0')}` : ''}`,
      source: 'spec.md 3.1: every page has a `when`; node_modules/@openbooknetwork/harita/README.md, page.yaml, gives its form', kind: 'order', introduced: 'maps', owner: 'cartographer' });
  }

  // a dated zone name that is not of the page's years
  const at = span(page);
  for (const id of Array.isArray(page.zones) ? page.zones : []) {
    const name = zoneName(id), ys = years(name);
    if (!at || !ys.length) continue;
    const [from, to] = [Math.min(...ys), Math.max(...ys)];
    if (to >= at[0] && from <= at[1]) continue;
    fault(page, { field: 'zones', old: id,
      new: `a zones.yaml entry on the same outline whose name carries no date, or the page's. The name "${name}" ${to < at[0] ? 'ends before' : 'starts after'} the page's date, ${page.date ?? yearText(at[0])}`,
      source: 'agents/pages.md, Zones and markers from page to page: a zone\'s legend name carries no date', kind: 'map', introduced: 'maps', owner: 'cartographer' });
  }

  // Two icons that stand on each other at the opening view show one at a time: the higher rank leads, of equal
  // rank the one listed first, and a card's swords lead every marker. The other waits under it until the reader
  // points at its name in the text. So the fault is a marker that waits and that the text does not link: a reader
  // finds it only by the count on the icon over it. A page with no text yet is not judged.
  const written = fs.existsSync(page.text) ? fs.readFileSync(page.text, 'utf8') : null;
  const linked = id => written === null || written.includes(`(@${id})`);
  const waits = (id, under, px) => fault(page, { field: 'markers', old: id,
    new: `a link to ${id} in the page's text, a higher rank for it in markers.yaml, or the list without it. At the opening view it waits under ${under}, about ${px} pixels away, and the text does not link it`,
    source: 'agents/pages.md, Zones and markers from page to page: a marker that waits under another is linked in the text', kind: 'map', introduced: 'plan', owner: 'cartographer' });
  if (Array.isArray(page.bbox) && page.bbox.length === 4) {
    const places = shown.filter(id => isPoint(markers[id]?.lnglat)).map(id => [id, markers[id].lnglat, !!markers[id].image]);
    const rank = id => markers[id]?.rank ?? 0, said = new Set();
    for (const [a, b, px] of crowded(page.bbox, places, typeof page.battle === 'string')) {
      const [lead, wait] = rank(b) > rank(a) ? [b, a] : [a, b];
      if (!linked(wait) && !said.has(wait)) { said.add(wait); waits(wait, lead, px); }
    }
  }

  // the battle card: its id, the markers under it, and its site in the frame
  if (typeof page.battle === 'string') {
    const card = cards[page.battle];
    if (!/-\d+$/.test(page.battle)) {
      const y = years(card?.date)[0] ?? at?.[0];
      fault(page, { field: 'battle', old: page.battle, new: `${page.battle}-${y !== undefined ? Math.abs(y) : '<year>'}, with the battle's folder renamed to it`,
        source: 'agents/pages.md, Battle cards, and spec.md 2.3: a battle id has the form <name>-<year>', kind: 'battle', introduced: 'plan', owner: 'section-coordinator' });
    }
    if (isPoint(card?.lnglat) && Array.isArray(page.bbox) && page.bbox.length === 4) {
      const k = scale(page.bbox), site = merc(card.lnglat);
      for (const id of shown) {
        if (!isPoint(markers[id]?.lnglat)) continue;
        const [x, y] = merc(markers[id].lnglat), px = Math.hypot(x - site[0], y - site[1]) * k;
        if (px <= NEAR && !linked(id)) waits(id, `the card of ${page.battle}`, Math.round(px));
      }
      const [w, s, e, n] = page.bbox, [lng, lat] = card.lnglat;
      if (lng < w || lng > e || lat < s || lat > n) fault(page, { field: 'bbox', old: JSON.stringify(page.bbox),
        new: `a bbox that holds the site of ${page.battle}, [${lng}, ${lat}], so that the battle shows beside the docked card`,
        source: 'spec.md 3.1: a card page\'s opening frame shows the battle beside the docked card; agents/pages.md, Battle cards: the card never moves for layout', kind: 'map', introduced: 'maps', owner: 'cartographer' });
    }
  }

  // the body's words, and the disputed claims it rests on
  if (!fs.existsSync(page.text)) continue;
  const text = fs.readFileSync(page.text, 'utf8'), lines = text.split('\n');
  const notes = lines.some(l => /^###\s+Notes\s*$/.test(l));
  let end = lines.findIndex(l => /^###\s+Notes\s*$/.test(l) || /^\[\^[^\]]+\]:/.test(l));
  if (end < 0) end = lines.length;
  const body = [];
  for (const l of lines.slice(0, end)) {
    if (/^\s*(#+\s+)?Sources:?\s*$/i.test(l)) break;   // a sources list ends the body
    if (!/^\s*(@image\b|#)/.test(l)) body.push(l);
  }
  const words = body.join(' ').replace(/\[\^[^\]]+\]/g, ' ').replace(/\]\([^)]*\)/g, ' ').split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
  if (words < WORDS[0] || words > WORDS[1]) fault(page, { file: page.text, field: 'body',
    new: `a body of at least 150 words and at most 350, with 300 the limit to aim under. It runs ${words} words, ${words < WORDS[0] ? `${WORDS[0] - words} under the hard lower limit` : `${words - WORDS[1]} over the hard upper limit`}`,
    source: 'agents/text.md, What matters, in order, 7: a body is never under 150 words and never over 350', kind: 'wording', introduced: 'texts', owner: 'section-reviewer' });

  const plan = rests[`${page.list}|${page.id}`];
  if (plan && !notes) for (const claim of plan.claims.filter(c => disputed.has(c))) fault(page, { file: page.text, field: 'body',
    new: `a \`### Notes\` heading after the body, with a note that gives each account of claim ${claim}, and its escaped marker in the body. The digest reads: ${disputed.get(claim)}`,
    source: `agents/text.md, Notes: a disputed claim goes into a note; ${digest} marks ${claim} disputed, and ${plan.file} has the page rest on it`, kind: 'attribution', claim, introduced: 'texts', owner: 'section-reviewer' });
}

if (!faults.length) console.log('ok');
else process.stdout.write(yaml.dump(faults, { lineWidth: -1, quotingType: '"' }));
process.exit(faults.length ? 1 : 0);
