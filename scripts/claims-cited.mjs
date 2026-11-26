// Lists each claim id that a file of a story cites and its digest does not hold. Run from the repo root:
//   node scripts/claims-cited.mjs <story> [section number ...]
// Try: node scripts/claims-cited.mjs alexander-the-great 020
// A claim's id, such as 020.4, is cited by the brief's "Map" part, by names.md, by the plans of every section,
// by a battle's plan and by the zone generator. A section researched again that numbers its lines anew leaves
// each of those pointing at a line that is gone, or at another fact. So a researcher keeps the id of a line that
// stands, and this says where one was lost: the file, its line and the id. With section numbers it looks at ids
// of those sections alone, wherever they are cited. It reads research.md and each part file under research/, so
// a line not yet merged counts as held.
// It ends with status 1 where an id is cited and not held, and 0 otherwise.
import fs from 'fs';
import path from 'path';
import { storyDir } from './story-dir.mjs';

const [story, ...only] = process.argv.slice(2);
if (!story || only.some(x => !/^\d{3}$/.test(x))) { console.error('usage: node scripts/claims-cited.mjs <story> [section number ...], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }
const plan = path.join(dir, '.plan'), digest = path.join(plan, 'research.md');
if (!fs.existsSync(digest)) { console.log(`${digest} is not written yet: nothing to hold the ids against`); process.exit(0); }
const held = new Set(), sections = new Set();
const take = text => { for (const m of text.matchAll(/^- (\d{3})\.(\d+) /gm)) { held.add(`${m[1]}.${m[2]}`); sections.add(m[1]); } };
take(fs.readFileSync(digest, 'utf8'));
for (const m of fs.readFileSync(digest, 'utf8').matchAll(/^## (\d{3}) /gm)) sections.add(m[1]);
const parts = path.join(plan, 'research');
for (const n of fs.existsSync(parts) ? fs.readdirSync(parts).filter(n => n.endsWith('.md')) : []) take(fs.readFileSync(path.join(parts, n), 'utf8'));

// the files that cite: the brief, the names, every plan file, and the generators
const files = [];
(function walk(d, depth) { for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) { const full = path.join(d, e.name); if (e.isDirectory()) { if (depth < 3 && !['run', 'reports', 'research', 'faults', 'fixes', 'ground', 'handoff'].includes(e.name)) walk(full, depth + 1); } else if (/\.(md|yaml)$/.test(e.name) && !/^(research|passages|sources-index|names-\d|research-\d|brief-\d)/.test(e.name) && e.name !== 'ground.yaml') files.push(full); } })(plan, 0);
for (const n of fs.existsSync(path.join(dir, '.plans')) ? fs.readdirSync(path.join(dir, '.plans')).filter(n => /\.[cm]?js$/.test(n)) : []) files.push(path.join(dir, '.plans', n));

let lost = 0;
for (const file of files.sort()) fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
  // an id is three digits, a dot and a number that opens with no nought, standing alone: not a part of a longer
  // number or of a coordinate, and not a page of a section, which is written 080.040
  for (const m of line.matchAll(/(?<![\d.,])(\d{3})\.([1-9]\d{0,2})(?![\d.]|\s*(?:km|m|°|%|BC|AD)\b)/g)) {
    const id = `${m[1]}.${m[2]}`;
    if (!sections.has(m[1]) || held.has(id) || (only.length && !only.includes(m[1]))) continue;
    lost++; console.log(`${file}:${i + 1}: cites ${id}, which the digest does not hold`);
  }
});
console.log(lost ? `\n${lost} citations of a claim the digest does not hold. Give the line its old id back, or change the citing file.` : 'ok');
process.exit(lost ? 1 : 0);
