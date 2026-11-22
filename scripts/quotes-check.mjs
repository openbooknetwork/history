// Proves that each quote stands in the file it names. Run from the repo root:
//   node scripts/quotes-check.mjs <story>          the digest, content/<story>/.plan/research.md
//   node scripts/quotes-check.mjs --names <lang>   the names of a language, i18n/names/<lang>.yaml
// A digest line opens with its claim id and ends with "<quote>" (<file>, heading or page, <kind>), and the file is
// looked up in the story's .wikipedia/ and .references/. An id stands once in the digest, and each id a section plan
// names after "Rests on:" is a line of the digest. A names entry lists sources as { file: <path from the repo
// root>, quote } and its name stands in one of its quotes. Wiki markup, case and spacing are left out of the
// comparison, and a quote with … in it is found part by part, in order.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const squash = s => s.normalize('NFC')
  .replace(/<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>|<!--[\s\S]*?-->/gi, '')
  .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/\{\{(?:[^{}|]*\|)*([^{}|]*)\}\}/g, '$1')
  .replace(/'{2,}/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
const texts = {};
const text = file => texts[file] ??= fs.existsSync(file) ? squash(fs.readFileSync(file, 'utf8')) : null;
// the quote's parts in order, each after the one before
const holds = (body, quote) => { let at = 0; return squash(quote).split(/…|\.\.\./).map(p => p.trim()).filter(Boolean)
  .every(p => { const i = body.indexOf(p, at); at = i + p.length; return i >= 0; }); };

const problems = [];
let quotes = 0;
const prove = (where, file, quote) => {
  quotes++;
  const body = file && text(file);
  if (body == null) problems.push(`${where}: no file ${file ?? 'named'}, fetch it with ./node_modules/.bin/harita sources <story>`);
  else if (!holds(body, quote)) problems.push(`${where}: "${quote.slice(0, 60)}" is not in ${file}, copy the quote again from the file`);
};

const [first, second] = process.argv.slice(2);
if (first === '--names' && second) {
  const file = path.join('i18n', 'names', `${second}.yaml`);
  if (!fs.existsSync(file)) { console.error(`${file} is missing: the name-finder writes it`); process.exit(2); }
  for (const [key, entry] of Object.entries(yaml.load(fs.readFileSync(file, 'utf8')) ?? {})) {
    const sources = entry.sources ?? [], need = { sourced: 2, single: 1 }[entry.status] ?? 0;
    if (sources.length < need) problems.push(`${key}: status ${entry.status} takes ${need} sources, it has ${sources.length}`);
    for (const s of sources) prove(key, s.file, s.quote);
    const forms = [entry.name, ...(entry.forms ?? [])].filter(Boolean).map(squash);
    if (sources.length && !sources.some(s => forms.some(f => squash(s.quote).includes(f))))
      problems.push(`${key}: "${entry.name}" is in none of its quotes, write the form a quote has under forms`);
  }
} else if (first && storyDir(first)) {
  const story = storyDir(first), digest = path.join(story, '.plan', 'research.md'), ids = new Set();
  if (!fs.existsSync(digest)) { console.error(`${digest} is missing: the researcher writes it`); process.exit(2); }
  for (const [n, line] of fs.readFileSync(digest, 'utf8').split('\n').entries()) {
    const where = `${digest}:${n + 1}`, cites = [...line.matchAll(/"([^"]+)"\s*\(([^,)]+)[^)]*\)/g)];
    if (/^- /.test(line) && !cites.length) problems.push(`${where}: the line has no quote, end it with "<quote>" (<file>, heading, <kind>)`);
    const id = line.match(/^- (\d+\.\d+) /)?.[1];
    if (/^- /.test(line) && !id) problems.push(`${where}: the line has no claim id, open it with <section number>.<n>`);
    else if (id && ids.has(id)) problems.push(`${where}: claim ${id} stands twice, give the later line the next free number`);
    else if (id) ids.add(id);
    for (const [, quote, name] of cites)
      prove(where, ['.wikipedia', '.references'].map(d => path.join(story, d, name.trim())).find(f => fs.existsSync(f)) ?? name.trim(), quote);
  }
  for (const plan of fs.readdirSync(path.dirname(digest)).filter(f => /^\d+-.*\.md$/.test(f)))
    for (const [n, line] of fs.readFileSync(path.join(path.dirname(digest), plan), 'utf8').split('\n').entries())
      for (const id of line.match(/Rests on:(.*)/)?.[1].match(/\d+\.\d+/g) ?? [])
        if (!ids.has(id)) problems.push(`${path.join(path.dirname(digest), plan)}:${n + 1}: claim ${id} is not in the digest, name a line it has`);
} else { console.error('usage: node scripts/quotes-check.mjs <story> | --names <lang>, from the repo root'); process.exit(2); }

for (const p of problems) console.log(p);
console.log(problems.length ? `${problems.length} problems in ${quotes} quotes` : `ok, ${quotes} quotes`);
process.exitCode = problems.length ? 1 : 0;
