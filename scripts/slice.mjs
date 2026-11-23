// Cuts the digest and names.md down to what one section's agents need. Run from the repo root:
//   node scripts/slice.mjs <story> <section number> [section number ...]
// It writes content/<story>/.plan/research-<section>.md and content/<story>/.plan/names-<section>.md, and prints
// each with its line count beside the full file's.
//
// The digest slice holds the digest's title, the section's own part in full, and every line of another section
// that the section's plan cites by its claim id, under a heading that names that section. A plan cites a claim in
// rests_on of pages.yaml and in disputes[].claim of text.yaml, in content/<story>/.plan/<number>-<section id>/.
// A story that still has a Markdown plan, <number>-<section id>.md, cites it in a "Rests on:" paragraph. The
// paragraphs of the digest's closing parts, such as "Thin" and "Against the brief", are kept where they name a
// claim of the slice.
//
// The names slice holds the top of names.md, the head rows of each table, the "Rules" part in full, and only the
// rows whose name, or one of its other forms or its adjective, stands in the digest slice, the section's plan or
// the section's English texts. A table that keeps no row is left out with its heading.
//
// The slices are not committed and nobody edits them: a change goes into research.md or names.md, and the script
// is run again, since a stale slice gives an agent old lines. It warns of a cited id the digest lacks. It cannot
// tell a name from the same word used otherwise, so a row with a short other form such as "Philip" is kept
// wherever the word stands, and it does not find a person a text names by a form names.md does not list.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const ID = /\b\d{3}\.\d+\b/g;
const CLAIM = /^- (\d{3}\.\d+)\b/;

// The digest in parts: { title, sections: [{ number, id, heading, lines }], closing: [{ heading, lines }] }.
export function readDigest(text) {
  const digest = { title: '', sections: [], closing: [] };
  let part = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^## +(.*\S)\s*$/);
    if (h) {
      const m = h[1].match(/^(\d{3})\s+(\S+)/);
      part = { heading: line, lines: [] };
      if (m) digest.sections.push(Object.assign(part, { number: m[1], id: m[2] }));
      else digest.closing.push(part);
    } else if (part) part.lines.push(line);
    else if (!digest.title && /^# /.test(line)) digest.title = line;
  }
  return digest;
}

// The claim ids a section's plan cites, and the plan's whole text for the search of names.
export function readPlan(dir, number) {
  const plan = path.join(dir, '.plan'), cited = new Set(), texts = [];
  const entry = fs.readdirSync(plan, { withFileTypes: true }).filter(d => d.name.startsWith(`${number}-`));
  const folder = entry.find(d => d.isDirectory()), md = entry.find(d => d.isFile() && d.name.endsWith('.md'));
  const add = v => { for (const id of String(v ?? '').match(ID) ?? []) cited.add(id); };
  if (folder) {
    const walk = at => {
      for (const d of fs.readdirSync(at, { withFileTypes: true })) {
        const file = path.join(at, d.name);
        if (d.isDirectory()) walk(file);
        else if (/\.(ya?ml|md)$/.test(d.name)) texts.push(fs.readFileSync(file, 'utf8'));
      }
    };
    walk(path.join(plan, folder.name));
    // rests_on and claim wherever the two files hold them, so a plan with a small fault of shape still slices
    const collect = (v, key) => {
      if (Array.isArray(v)) v.forEach(x => collect(x, key));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) {
        if (k === key) [x].flat().forEach(add); else collect(x, key);
      }
    };
    for (const [name, key] of [['pages.yaml', 'rests_on'], ['text.yaml', 'claim']]) {
      const file = path.join(plan, folder.name, name);
      if (!fs.existsSync(file)) continue;
      try { collect(yaml.load(fs.readFileSync(file, 'utf8'), { schema: yaml.JSON_SCHEMA }), key); }
      catch (e) { console.error(`${file}: is not valid YAML, ${e.reason ?? e.message}`); }
    }
  }
  if (md) {
    const text = fs.readFileSync(path.join(plan, md.name), 'utf8');
    texts.push(text);
    // a "Rests on:" paragraph runs to the blank line, the next item of a numbered list or the next heading
    let open = false;
    for (const line of text.split('\n')) {
      if (!line.trim() || /^\s*(\d+\.\s|#)/.test(line)) open = false;
      const at = line.search(/Rests on\b/i);
      if (at >= 0) { open = true; add(line.slice(at)); } else if (open) add(line);
    }
  }
  return { found: !!(folder || md), cited, text: texts.join('\n') };
}

// The digest slice of one section, as text, and the cited ids the digest lacks.
export function sliceDigest(digest, number, cited) {
  const own = digest.sections.find(s => s.number === number);
  const out = [digest.title, '', `Slice of research.md for ${number}, made by scripts/slice.mjs. It is not edited: a change goes into research.md.`, ''];
  out.push(own.heading, ...own.lines);
  const ids = new Set(own.lines.map(l => l.match(CLAIM)?.[1]).filter(Boolean)), missing = new Set(cited);
  for (const id of ids) missing.delete(id);
  for (const s of digest.sections) {
    if (s === own) continue;
    const lines = s.lines.filter(l => cited.has(l.match(CLAIM)?.[1]));
    if (!lines.length) continue;
    for (const l of lines) { const id = l.match(CLAIM)[1]; ids.add(id); missing.delete(id); }
    out.push(`## Cited from ${s.number} ${s.id}`, '', ...lines, '');
  }
  for (const part of digest.closing) {
    // a closing part is paragraphs or list items, each kept whole where it names a claim of the slice
    const paras = part.lines.join('\n').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const kept = paras.filter(p => (p.match(ID) ?? []).some(id => ids.has(id)));
    if (kept.length) out.push(part.heading, ...kept.flatMap(p => ['', p]), '');
  }
  return { text: out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', missing: [...missing].sort() };
}

const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
const isRow = line => /^\s*\|.*\|\s*$/.test(line);
const isRule = line => /^\s*\|[\s:|-]+\|\s*$/.test(line);
// a text for the search of names: no commas, no line breaks, one space between words
const flat = text => text.replace(/[,*_`]/g, '').replace(/\s+/g, ' ');

// The forms a row answers to: its name, its other forms and its adjective, each without its bracketed note.
function forms(row, head) {
  const c = cells(row), out = [];
  head.forEach((h, i) => {
    if (i !== 0 && !/other forms|adjective/i.test(h)) return;
    const cell = (c[i] ?? '').replace(/\([^()]*\)/g, ' ');
    for (const part of i === 0 ? [cell] : cell.split(/[;/]/)) {
      const form = flat(part).replace(/["“”]/g, '').trim();
      if (form.length > 1 && /\p{L}/u.test(form)) out.push(form);
    }
  });
  return out;
}

const stands = (form, hay) => new RegExp(`(?<![\\p{L}\\p{N}])${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u').test(hay);

// The names slice: names.md with each table cut to the rows a form of whose name stands in hay.
export function sliceNames(text, number, hay) {
  hay = flat(hay);
  const out = [];
  let rules = false, head = null, table = null, block = [];   // block: a heading and prose waiting for its table's first row
  let first = true;
  const flush = () => { if (table) { if (table.rows.length) out.push(...table.before, ...table.head, ...table.rows); else dropped = true; table = null; } };
  let dropped = false;
  for (const line of text.split('\n')) {
    if (/^## /.test(line)) rules = /^## +Rules\b/i.test(line);
    if (rules) { flush(); out.push(...block, line); block = []; continue; }
    if (!isRow(line)) {
      if (table) { flush(); head = null; }
      // a heading opens a new block; what waited under a heading whose table kept no row goes with it
      if (/^#{1,6} /.test(line)) {
        const waiting = block.findIndex(l => /^#{3,6} /.test(l));
        if (dropped && waiting >= 0) block = block.slice(0, waiting);
        if (/^#{1,2} /.test(line) || !dropped) { out.push(...block); block = []; }
        dropped = false;
      }
      block.push(line);
      if (first && /^# /.test(line)) { block.push('', `Slice of names.md for ${number}, made by scripts/slice.mjs. It is not edited: a change goes into names.md.`); first = false; }
      continue;
    }
    if (!table) { table = { before: block, head: [], rows: [] }; block = []; head = null; dropped = false; }
    if (!head) { head = cells(line); table.head.push(line); }
    else if (isRule(line)) table.head.push(line);
    else if (forms(line, head).some(f => stands(f, hay))) table.rows.push(line);
  }
  flush();
  if (dropped) { const waiting = block.findIndex(l => /^#{3,6} /.test(l)); if (waiting >= 0) block = block.slice(0, waiting); }
  out.push(...block);
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

// The English texts of a section's pages, joined.
function sectionTexts(dir, number) {
  const root = path.join(dir, 'pages'), out = [];
  if (!fs.existsSync(root)) return '';
  const walk = at => {
    for (const d of fs.readdirSync(at, { withFileTypes: true })) {
      const file = path.join(at, d.name);
      if (d.isDirectory()) walk(file);
      else if (d.name === 'en.md' && path.basename(at) === 'text') out.push(fs.readFileSync(file, 'utf8'));
    }
  };
  for (const d of fs.readdirSync(root, { withFileTypes: true })) if (d.isDirectory() && d.name.startsWith(`${number}-`)) walk(path.join(root, d.name));
  return out.join('\n');
}

const count = text => text.split('\n').length - (text.endsWith('\n') ? 1 : 0);

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [story, ...numbers] = process.argv.slice(2);
  if (!story || !numbers.length) { console.error('usage: node scripts/slice.mjs <story> <section number> [section number ...], from the repo root'); process.exit(2); }
  const dir = storyDir(story);
  if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }
  const plan = path.join(dir, '.plan'), researchFile = path.join(plan, 'research.md'), namesFile = path.join(plan, 'names.md');
  if (!fs.existsSync(researchFile)) { console.error(`${researchFile} is missing`); process.exit(2); }
  const research = fs.readFileSync(researchFile, 'utf8'), digest = readDigest(research);
  const names = fs.existsSync(namesFile) ? fs.readFileSync(namesFile, 'utf8') : null;
  let failed = false;
  for (const number of numbers) {
    if (!digest.sections.some(s => s.number === number)) { console.error(`${researchFile} has no part "## ${number} <section id>"`); failed = true; continue; }
    const { found, cited, text: planText } = readPlan(dir, number);
    if (!found) console.error(`${plan} has no plan of ${number}: the digest slice holds the section's own part alone`);
    const slice = sliceDigest(digest, number, cited);
    if (slice.missing.length) console.error(`the plan of ${number} cites ${slice.missing.join(', ')}, which ${researchFile} lacks`);
    const out = path.join(plan, `research-${number}.md`);
    fs.writeFileSync(out, slice.text);
    console.log(`${out}: ${count(slice.text)} lines, ${researchFile} has ${count(research)}`);
    if (names === null) { console.error(`${namesFile} is missing: no names slice for ${number}`); continue; }
    const cut = sliceNames(names, number, [slice.text, planText, sectionTexts(dir, number)].join('\n'));
    const namesOut = path.join(plan, `names-${number}.md`);
    fs.writeFileSync(namesOut, cut);
    console.log(`${namesOut}: ${count(cut)} lines, ${namesFile} has ${count(names)}`);
  }
  process.exit(failed ? 1 : 0);
}
