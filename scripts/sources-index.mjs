// Lists a story's source files with what is in each, so a researcher goes to the chapter and not to the start of
// the book. Run from the repo root:
//   node scripts/sources-index.mjs <story> [--section <number>]
// It writes content/<story>/.plan/sources-index.md, which git ignores: for each file of .wikipedia/ and
// .references/ its size in words, the note its address carries in wikipedia.urls or references.urls, and its
// headings with their line numbers. A heading is a wiki heading, "== Death ==", or in a book's text a line that
// opens a chapter, a book or a part, such as "CHAPTER VII." or "BOOK I". A file with none is listed by its size
// alone. It reads no file for its sense: scripts/find-in-sources.mjs searches them.
import fs from 'fs';
import path from 'path';
import { storyDir } from './story-dir.mjs';

const argv = process.argv.slice(2), secAt = argv.indexOf('--section'), section = secAt < 0 ? null : argv.splice(secAt, 2)[1];
const [story] = argv;
const dir = story && storyDir(story);
if (!dir) { console.error('usage: node scripts/sources-index.mjs <story>, from the repo root'); process.exit(2); }
// what each address's line says of it, by the file name the fetch gives it
const said = [];
for (const list of ['wikipedia.urls', 'references.urls']) for (const line of fs.existsSync(path.join(dir, list)) ? fs.readFileSync(path.join(dir, list), 'utf8').split('\n') : []) {
  const m = line.match(/^(\S+)\s+#\s*(.+)$/);
  if (m) said.push([m[1].replace(/^https?:\/\//, '').replace(/[^A-Za-z0-9]+/g, '-').toLowerCase(), m[2].trim()]);
}
const noteOf = file => { const key = file.replace(/\.(txt|wiki|html|pdf)$/g, '').replace(/[^A-Za-z0-9]+/g, '-').toLowerCase(); return said.find(([k]) => k.includes(key.slice(0, 40)) || key.includes(k.slice(0, 40)))?.[1] ?? ''; };
// with --section, only the files the source map, .plan/sources.md, names under that section's heading
let only = null;
if (section) {
  const map = path.join(dir, '.plan', 'sources.md');
  const part = fs.existsSync(map) ? fs.readFileSync(map, 'utf8').split(/^(?=## )/m).find(p => p.startsWith(`## ${section} `)) ?? '' : '';
  only = new Set([...part.matchAll(/^- +(\S+)/gm)].map(m => m[1]));
  // a story with no source map for the section: the files its part of the digest names
  if (!only.size) {
    const digest = path.join(dir, '.plan', 'research.md');
    const own = fs.existsSync(digest) ? fs.readFileSync(digest, 'utf8').split(/^(?=## )/m).find(p => p.startsWith(`## ${section} `)) ?? '' : '';
    const known = new Set(['.references', '.wikipedia'].flatMap(d => fs.existsSync(path.join(dir, d)) ? fs.readdirSync(path.join(dir, d)) : []));
    only = new Set([...own.matchAll(/[^\s()`"',;]+\.(?:txt|wiki|md)/g)].map(m => path.basename(m[0])).filter(n => known.has(n)));
  }
  if (!only.size) { console.error(`${map} and the digest name no file for section ${section}: no index for the section`); process.exit(1); }
}
const out = [`Index of the sources of ${story}${section ? ` that the source map gives section ${section}` : ''}, made by scripts/sources-index.mjs. It is not edited.`, ''];
let files = 0;
for (const folder of ['.references', '.wikipedia']) {
  const at = path.join(dir, folder);
  if (!fs.existsSync(at)) continue;
  out.push(`## ${folder}`, '');
  for (const name of fs.readdirSync(at).filter(n => /\.(txt|wiki|md|html)$/.test(n) && (!only || only.has(n))).sort()) {
    const lines = fs.readFileSync(path.join(at, name), 'utf8').split('\n'), words = lines.join(' ').split(/\s+/).length;
    files++;
    const heads = [];
    lines.forEach((l, i) => {
      const t = l.trim();
      const wiki = t.match(/^(={2,3})\s*([^=].*?)\s*\1$/);
      if (wiki) heads.push([i + 1, `${wiki[1].length === 3 ? '  ' : ''}${wiki[2]}`]);
      else if (/^(CHAPTER|BOOK|PART|Chapter|Book)\s+[IVXLC\d]+\b.{0,60}$/.test(t)) heads.push([i + 1, t.slice(0, 70)]);
    });
    const note = noteOf(name);
    out.push(`### ${name}`, `${words.toLocaleString('en')} words, ${lines.length.toLocaleString('en')} lines.${note ? ` ${note}` : ''}`);
    // a long book repeats its running heads: keep each heading once, and at most 60 of them
    const seen = new Set(), kept = heads.filter(([, h]) => !seen.has(h) && seen.add(h)).slice(0, 60);
    if (kept.length) out.push(kept.map(([n, h]) => `  ${String(n).padStart(6)}  ${h}`).join('\n'));
    out.push('');
  }
}
const file = path.join(dir, '.plan', section ? `sources-index-${section}.md` : 'sources-index.md');
fs.writeFileSync(file, out.join('\n'));
console.log(`${file}: ${files} files, ${out.join('\n').split('\n').length} lines`);
