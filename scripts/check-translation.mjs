// Checks one story's translation into one language against the English, as far as code can. Run from the repo root:
//   node scripts/check-translation.mjs <story id> <lang>
// Per page: the text exists, its @image lines and the @ids of its links match the English, it has as many paragraphs
// and headings, and every four digit number of the English, such as a year, appears in it in the language's digits.
// Per catalogue under the story folder: no empty value. Prints each problem and ok when there are none.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const [storyId, lang] = process.argv.slice(2), story = storyId && storyDir(storyId);
if (!story || !lang || lang === 'en') { console.error('usage: node scripts/check-translation.mjs <story id> <lang>, from the repo root'); process.exit(2); }

const problems = [];
const walk = (dir, hit, out = []) => {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory() && !d.name.startsWith('.')) walk(full, hit, out); else if (d.isFile() && hit(full)) out.push(full);
  }
  return out;
};

// the digits of every script the rules use, read as 0-9: Arabic-Indic, Persian, Devanagari, Bengali, Thai, full width
const ZEROS = [0x660, 0x6f0, 0x966, 0x9e6, 0xe50, 0xff10];
const asciiDigits = s => s.replace(/\p{Nd}/gu, c => { const cp = c.codePointAt(0), z = ZEROS.find(z => cp >= z && cp <= z + 9); return z == null ? c : String(cp - z); });
const blocks = md => md.split(/\n\s*\n/).map(b => b.trim()).filter(b => b && !/^@image\s/.test(b));
const page = md => ({
  images: [...md.matchAll(/^@image\s+(\S+)/gm)].map(m => m[1]),
  links: [...md.matchAll(/\]\(@([^)\s]+)\)/g)].map(m => m[1]).sort(),
  paragraphs: blocks(md).length,
  headings: (md.match(/^#{1,6}\s/gm) ?? []).length,
});
// a four digit number standing alone, so 250,000 and 1.5 are not read as years
const years = md => [...new Set([...asciiDigits(md).matchAll(/(?<![\d.,])\d{4}(?![\d]|[.,]\d)/g)].map(m => m[0]))];

for (const en of walk(path.join(story, 'pages'), f => f.endsWith(path.join('text', 'en.md'))).sort()) {
  const where = path.relative(story, path.dirname(path.dirname(en))), file = path.join(path.dirname(en), lang + '.md');
  if (!fs.existsSync(file)) { problems.push(`${where}: no text/${lang}.md`); continue; }
  const src = fs.readFileSync(en, 'utf8'), out = fs.readFileSync(file, 'utf8'), a = page(src), b = page(out);
  if (a.images.join() !== b.images.join()) problems.push(`${where}: @image lines ${b.images.join(', ') || 'none'}, the English has ${a.images.join(', ') || 'none'}`);
  if (a.links.join() !== b.links.join()) problems.push(`${where}: link ids ${b.links.join(', ') || 'none'}, the English has ${a.links.join(', ') || 'none'}`);
  if (a.paragraphs !== b.paragraphs) problems.push(`${where}: ${b.paragraphs} paragraphs, the English has ${a.paragraphs}`);
  if (a.headings !== b.headings) problems.push(`${where}: ${b.headings} headings, the English has ${a.headings}`);
  const got = new Set(years(out)), lost = years(src).filter(y => !got.has(y));
  if (lost.length) problems.push(`${where}: ${lost.join(', ')} from the English do not appear`);
}

const flat = (o, p = '', out = {}) => { for (const [k, v] of Object.entries(o ?? {})) v && typeof v === 'object' ? flat(v, p + k + '.', out) : (out[p + k] = v); return out; };
for (const file of walk(story, f => f.endsWith(path.join('i18n', lang + '.yaml'))).sort()) {
  const empty = Object.entries(flat(yaml.load(fs.readFileSync(file, 'utf8')))).filter(([, v]) => v == null || v === '').map(([k]) => k);
  if (empty.length) problems.push(`${path.relative(story, file)}: ${empty.length} empty, ${empty.slice(0, 5).join(', ')}${empty.length > 5 ? ', ...' : ''}`);
}

for (const p of problems) console.log(p);
console.log(problems.length ? `${problems.length} problem${problems.length === 1 ? '' : 's'}` : 'ok');
process.exitCode = problems.length ? 1 : 0;
