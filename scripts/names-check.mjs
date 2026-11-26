// Checks a story's English texts against its names file, content/<story>/.plan/names.md. Run from the repo root,
// after a section's texts and again when the story is whole:
//   node scripts/names-check.mjs <story> [section number ...]
// Try: node scripts/names-check.mjs alexander-the-great 020
// With section numbers it reports only on the pages of those sections, as `030` or `30`.
//
// It checks three things:
// - A name with no row. A capitalised word of a text that names.md does not write, in a row or in its Rules, and
//   that is no plural or adjective of one it writes. It is printed once, at the first page that has it.
// - "First named in". The first page that names a row, in the story's page order, is in the section its row gives.
//   A row with no section number in that cell is not compared, and a row no text names is not a fault.
// - A shared name. People whose rows open with the same word, such as two Memnons or four Nicanors, when none of
//   them has the bare name for its own row. The first sentence of a page that uses the bare name must hold one
//   row's name in full or a word of its "Who", unless the page has named one of them in full before. A person
//   alone in the table whose row has a description, such as Medius of Larissa, is checked the same way: a text
//   that uses the bare name without a word of the row may mean somebody else.
//
// It reads the words on each page's map too, a marker's label and note, a route's name and a zone's name, for the
// third of these alone: each stands by itself under an icon or in the legend, so it tells who it means there.
//
// It reads the body and the notes of each text. It leaves out quotations, block quotes, a sources list, headings,
// @image lines and link targets. When it looks for names with no row it skips the words of NOT_NAMES below, and
// the word that opens a sentence unless no text of the story writes that word in lower case.
//
// It prints one line per problem, `file: what is wrong`, or `ok`, and ends with status 1 when it found a problem.
//
// It cannot tell which Memnon a text means, only that the description is missing: a text that puts one Memnon's
// words beside the other Memnon passes. It does not check the form of a name that has a row. It does not know
// a capitalised word that is no name unless NOT_NAMES has it, so it prints some terms and titles. It takes a word
// that names.md writes anywhere, in a "Who" cell too, as known. It compares "First named in" by section, not by
// page, and by the row's own forms: "Illyrians" on a page does not name the row "Illyria". The rest stays with the
// section-reviewer and the editor.
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

// Capitalised words that are no names. Add a word here when the check prints it and it is not a name.
const NOT_NAMES = new Set(`
  January February March April May June July August September October November December
  Monday Tuesday Wednesday Thursday Friday Saturday Sunday
  BC AD BCE CE
  North South East West Northern Southern Eastern Western
  King Queen Great Lake Mount River Sea Gulf Cape Pass Gate Gates Battle War League Empire Temple
  The A An In On At By Of And But Or For He She It They His Her Their This That These Those
  God Gods Earth Sun Moon Meanwhile
`.split(/\s+/).filter(Boolean));

// Words of a "Who" cell that tell nobody apart.
const SMALL = new Set(`with from when whom that this after before into over also then until about among their where
  which whose named always never there than them were been have made later first other some time`.split(/\s+/));

const [storyId, ...only] = process.argv.slice(2), story = storyId && storyDir(storyId);
if (!story) { console.error('usage: node scripts/names-check.mjs <story> [section number ...], from the repo root'); process.exit(2); }
const namesFile = path.join(story, '.plan/names.md');
if (!fs.existsSync(namesFile)) { console.error(`${namesFile}: no such file`); process.exit(2); }
const sections = new Set(only.map(Number));

const WORD = /[\p{L}\p{M}]+(?:-[\p{L}\p{M}]+)*/gu;
const words = s => s.match(WORD) ?? [];
const capital = w => /^\p{Lu}/u.test(w);
const numeral = w => /^[IVXLC]+$/.test(w);
const plain = s => s.replace(/’/g, "'").replace(/[,"“”]/g, ' ').replace(/\s+/g, ' ').trim();
// "Gedrosian" and "Plataeans" are known when "Gedrosia" and "Plataea" are.
const stem = w => w.replace(/(?:ians?|ia|ans?|ites?|es|s|a|e|y|us)$/, '');

// names.md: the rows of its tables, and every capitalised word its Rules write.
const rows = [], known = new Set(), stems = new Set();
{
  let table = null, cols = null;
  for (const line of fs.readFileSync(namesFile, 'utf8').split('\n')) {
    for (const w of words(line)) if (capital(w)) { known.add(w); if (stem(w).length > 3) stems.add(stem(w)); }
    const h = line.match(/^## (.+)/);
    if (h) { table = h[1].trim(); cols = null; continue; }
    if (!table || table === 'Rules' || !line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells[0] === 'Name') { cols = cells; continue; }
    if (!cols || cells.every(c => /^:?-+:?$/.test(c))) continue;
    const cell = name => cells[cols.findIndex(c => c.startsWith(name))] ?? '';
    const name = cell('Name').replace(/\([^)]*\)/g, '').trim();
    const parts = name.split(', ');
    // "Andromachus, Menedemus, Caranus" is three people, "Nicanor, the fleet commander" is one
    const several = parts.length > 1 && parts.every(p => /^\p{Lu}[\p{L}\p{M}-]*$/u.test(p));
    const forms = (several ? parts : name.split(';')).map(plain).filter(Boolean);
    rows.push({ table, name: plain(name), forms, who: cell('Who'), first: cell('First named in'), several });
  }
}
if (!rows.length) { console.error(`${namesFile}: no table rows found`); process.exit(2); }

// People by the word their name opens with. A group has an owner when one row is the bare name.
const groups = new Map();
for (const row of rows) if (row.table === 'People' && !row.several && !/ and /.test(row.name)) {
  const [key, ...rest] = words(row.name);
  // "the Bastard of Orléans" and "the Gesta" share no name: a word in lower case is no name to share.
  if (!capital(key)) continue;
  row.key = key;
  row.rest = rest.filter(w => w.length > 3 && !numeral(w)).map(w => w.toLowerCase());
  const who = row.who.split(/always with|to keep (?:him|her|them) apart|a different (?:man|woman)/)[0];
  row.telling = words(who).filter(w => w.length > 3 && !SMALL.has(w.toLowerCase()));
  (groups.get(key) ?? groups.set(key, []).get(key)).push(row);
}
// A person's name in a "Who" tells nobody apart: "commander of Alexander's fleet" would pass any page of the story.
for (const list of groups.values()) for (const row of list) row.telling = new Set([...row.rest, ...row.telling.filter(w => !groups.has(w)).map(w => w.toLowerCase())]);
const shared = new Map();   // key -> rows, where the bare name is nobody's own
for (const [key, list] of groups) {
  if (list.some(r => r.name === key)) continue;
  const owner = list.find(r => r.who.includes(`"${key}" alone`));
  if (owner) { owner.forms.push(key); continue; }
  if (list.length > 1 || list[0].rest.length) shared.set(key, list);
}

// Every form of every row, the longest first, so "Perdiccas III" is taken before "Perdiccas".
const forms = new Map();
for (const row of rows) for (const f of row.forms) (forms.get(f) ?? forms.set(f, []).get(f)).push(row);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const finder = s => new RegExp(`(?<![\\p{L}\\p{M}-])${esc(s)}(?![\\p{L}\\p{M}]|-\\p{L})`, 'gu');
const ordered = [...forms.keys()].sort((a, b) => b.length - a.length).map(f => ({ rows: forms.get(f), re: finder(f) }));

// The story's texts in page order.
const pages = [];
(function walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, d.name), text = path.join(full, 'text/en.md');
    if (fs.existsSync(path.join(full, 'page.yaml'))) { if (fs.existsSync(text)) pages.push(text); } else walk(full);
  }
})(path.join(story, 'pages'));
const sectionOf = file => path.relative(path.join(story, 'pages'), file).split(path.sep)[0];
const number = s => { const m = String(s).match(/^\d+/); return m ? Number(m[0]) : null; };
const wanted = file => !sections.size || sections.has(number(sectionOf(file)));

// A text as sentences, without what the check leaves out.
function sentences(md) {
  const kept = [];
  let sources = false;
  for (const line of md.split('\n')) {
    const heading = line.match(/^(?:#+\s*|\*\*)([^*]*)/);
    if (heading) { sources = /^(sources|references|further reading)\b/i.test(heading[1].trim()); if (line.startsWith('#') || sources) continue; }
    if (sources || /^\s*(@|>)/.test(line)) continue;
    kept.push(line);
  }
  return kept.join('\n').split(/\n\s*\n/).flatMap(para => para
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/“[^”]*”|"[^"]*"/g, ' … ')
    .replace(/\\\*/g, ' ').replace(/[*_`]/g, '').replace(/^\s*(?:[-+]|\d+\.)\s+/gm, '')
    .replace(/\s+/g, ' ').trim()
    .split(/(?<=[.!?][)’']*) (?=[^\p{Ll}])/u).filter(Boolean));
}

const isKnown = w => known.has(w) || known.has(w.replace(/n?s?$/, '')) || (stem(w).length > 3 && stems.has(stem(w)));
// The word that opens a sentence is taken for a name only when no text of the story writes it in lower case.
const texts = pages.map(file => ({ file, sentences: sentences(fs.readFileSync(file, 'utf8')) }));
const common = new Set(texts.flatMap(t => t.sentences.flatMap(s => words(s).filter(w => !capital(w)))));
const opener = w => common.has(w.toLowerCase()) || common.has(w.toLowerCase().replace(/-.*/, '')) || /(?:ing|ed|ly)$/.test(w);

const problems = [], firstPage = new Map(), unknown = new Map();
for (const { file, sentences } of texts) {
  const told = new Set();   // shared names this page has pinned to a row
  const flagged = new Set();
  for (const sentence of sentences) {
    // names with no row
    const tokens = [...sentence.matchAll(WORD)];
    for (let i = 0; i < tokens.length; i++) {
      if (!capital(tokens[i][0]) || (i === 0 && opener(tokens[0][0]))) continue;
      let j = i;
      while (j + 1 < tokens.length && capital(tokens[j + 1][0]) && /^(?:[’']s)? $/.test(sentence.slice(tokens[j].index + tokens[j][0].length, tokens[j + 1].index))) j++;
      const run = tokens.slice(i, j + 1).map(t => t[0]);
      const news = run.filter(w => w.length > 1 && !numeral(w) && !NOT_NAMES.has(w) && !isKnown(w));
      if (news.length) {
        const name = news.join(' ');
        if (!unknown.has(name)) unknown.set(name, []);
        if (!unknown.get(name).includes(file)) unknown.get(name).push(file);
      }
      i = j;
    }

    // the rows this sentence names
    let rest = plain(sentence);
    const lower = new Set(words(sentence).map(w => w.toLowerCase()));
    const hit = row => { if (!firstPage.has(row)) firstPage.set(row, file); if (shared.has(row.key)) told.add(row.key); };
    const take = ({ rows, re }) => { if (re.test(rest)) { re.lastIndex = 0; rest = rest.replace(re, ' · '); rows.forEach(hit); } };
    for (const f of ordered) take(f);
    for (const [key, list] of shared) {
      if (!finder(key).test(rest)) continue;
      const fits = list.filter(r => r.rest.length && r.rest.every(w => lower.has(w)));
      fits.forEach(hit);
      if (fits.length || told.has(key) || flagged.has(key)) continue;
      if (list.some(r => [...r.telling].some(w => lower.has(w)))) { told.add(key); continue; }
      flagged.add(key);
      if (wanted(file)) problems.push(`${file}: "${key}" stands without the words that tell who it is; names.md has ${list.map(r => `"${r.name}"`).join(', ')}`);
    }
  }
}

// The words on each page's map: a marker's label and note, a route's name and a zone's name. Each stands alone in
// a legend or under an icon, so each tells who it means by itself: a shared name needs its telling words there
// too, though the page's text has them. Only that is checked of them, not names with no row.
{
  const load = file => { try { return yaml.load(fs.readFileSync(file, 'utf8')) ?? {}; } catch { return {}; } };
  const all = (dir, test, found = []) => { for (const d of fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []) { const full = path.join(dir, d.name); if (d.isDirectory()) { if (!d.name.startsWith('.')) all(full, test, found); } else if (test(d.name, full)) found.push(full); } return found; };
  const said = v => typeof v === 'string' ? v : v && typeof v === 'object' ? String(v.en ?? Object.values(v)[0] ?? '') : '';
  const words_ = new Map();   // "marker <id>", "route <id>", "zone <id>" to { file, text }
  for (const f of all(story, n => n === 'markers.yaml')) for (const [id, m] of Object.entries(load(f))) if (!words_.has(`marker ${id}`)) words_.set(`marker ${id}`, { file: f, text: `${said(m?.label)}. ${said(m?.note)}` });
  for (const f of all(story, n => n === 'zones.yaml')) for (const [id, z] of Object.entries(load(f))) if (z?.name && !words_.has(`zone ${id}`)) words_.set(`zone ${id}`, { file: f, text: said(z.name) });
  for (const f of all(story, (n, full) => n.endsWith('.geojson') && /[\\/](routes|zones)[\\/]/.test(full))) {
    const kind = /[\\/]routes[\\/]/.test(f) ? 'route' : 'zone', id = path.basename(f, '.geojson');
    if (words_.has(`${kind} ${id}`)) continue;
    try { const doc = JSON.parse(fs.readFileSync(f, 'utf8')), name = (doc.features?.[0] ?? doc).properties?.name; if (name) words_.set(`${kind} ${id}`, { file: f, text: said(name) }); } catch { /* not a drawing */ }
  }
  const untold = str => {
    let rest = plain(str);
    const lower = new Set(words(str).map(w => w.toLowerCase())), out = [];
    for (const f of ordered) if (f.re.test(rest)) { f.re.lastIndex = 0; rest = rest.replace(f.re, ' · '); }
    for (const [key, list] of shared) {
      if (!finder(key).test(rest)) continue;
      if (list.some(r => r.rest.length && r.rest.every(w => lower.has(w))) || list.some(r => [...r.telling].some(w => lower.has(w)))) continue;
      out.push([key, list]);
    }
    return out;
  };
  const seen = new Set();
  for (const file of all(path.join(story, 'pages'), n => n === 'page.yaml').sort()) {
    if (!wanted(file)) continue;
    const page = load(file);
    const items = [...(page.markers ?? []).map(id => `marker ${id}`), ...(page.routes ?? []).map(id => `route ${id}`), ...(page.zones ?? []).map(id => `zone ${id}`)];
    for (const item of items) {
      const w = words_.get(item);
      if (!w || seen.has(item)) continue;
      seen.add(item);
      for (const [key, list] of untold(w.text)) problems.push(`${w.file}: the ${item} reads "${w.text.replace(/\. $/, '').trim()}", where "${key}" stands without the words that tell who it is; names.md has ${list.map(r => `"${r.name}"`).join(', ')}`);
    }
  }
}

for (const [name, files] of unknown) {
  const at = files.filter(wanted);
  if (at.length) problems.push(`${at[0]}: "${name}" has no row in names.md${at.length > 1 ? ` (and on ${at.length - 1} more page${at.length > 2 ? 's' : ''})` : ''}`);
}
for (const row of rows) {
  const said = number(row.first), file = firstPage.get(row);
  if (said === null || !file || !wanted(file)) continue;
  const section = sectionOf(file);
  if (number(section) !== said) problems.push(`${namesFile}: "${row.name}" is first named in ${section}, in ${file}, and its row says ${row.first}`);
}

problems.sort();
console.log(problems.length ? problems.join('\n') : 'ok');
process.exit(problems.length ? 1 : 0);
