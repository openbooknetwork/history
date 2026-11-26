// Draws the image candidates of a fetch as sheets of numbered thumbnails, one or more a page, so an image finder
// looks over every candidate of a page in one read and opens at full size only the few it would choose.
// Run from the repo root, after scripts/fetch-candidates.mjs, which runs it itself:
//   node scripts/candidates-sheet.mjs <story> <the fetch's name>
// The candidates are content/<story>/.candidates/<name>/<page id>/<nn>-<file>, with what their Commons pages give
// in index.yaml beside them. A sheet holds 24 thumbnails, each labelled with its number and its licence, and is
// written to .candidates/<name>/<page id>-sheet-<n>.png. A file that is no picture is a label alone.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import sharp from 'sharp';
import { storyDir } from './story-dir.mjs';

const [story, name] = process.argv.slice(2);
const dir = story && storyDir(story);
if (!dir || !name) { console.error('usage: node scripts/candidates-sheet.mjs <story> <the fetch\'s name>, from the repo root'); process.exit(2); }
const root = path.join(dir, '.candidates', name);
if (!fs.existsSync(root)) { console.error(`${root} is missing: node scripts/fetch-candidates.mjs writes it`); process.exit(2); }
let index = {};
try { index = yaml.load(fs.readFileSync(path.join(root, 'index.yaml'), 'utf8')) ?? {}; } catch { /* no index */ }

const W = 210, H = 170, LABEL = 22, COLS = 6, PER = 24;
const esc = s => String(s).replace(/[<&>]/g, c => ({ '<': '&lt;', '&': '&amp;', '>': '&gt;' }[c]));
const label = text => Buffer.from(`<svg width="${W}" height="${LABEL}"><rect width="${W}" height="${LABEL}" fill="#fff"/><text x="4" y="15" font-family="sans-serif" font-size="12" fill="#111">${esc(text)}</text></svg>`);
const sheets = [];
for (const page of fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()) {
  const files = fs.readdirSync(path.join(root, page)).filter(f => /^\d+-/.test(f)).sort();
  const meta = new Map((Array.isArray(index[page]) ? index[page] : []).map(c => [c.file, c]));
  for (let s = 0; s * PER < files.length; s++) {
    const part = files.slice(s * PER, (s + 1) * PER), rows = Math.ceil(part.length / COLS), layers = [];
    for (const [i, f] of part.entries()) {
      const left = (i % COLS) * W, top = Math.floor(i / COLS) * (H + LABEL), m = meta.get(f);
      let thumb = null;
      try { thumb = await sharp(path.join(root, page, f)).resize(W - 8, H - 8, { fit: 'inside' }).png().toBuffer(); } catch { /* no picture: an svg sharp cannot read, a pdf */ }
      if (thumb) layers.push({ input: thumb, left: left + 4, top: top + 4 });
      layers.push({ input: label(`${f.slice(0, 2)}  ${m?.license ?? ''}${thumb ? '' : '  (no picture)'}`.slice(0, 32)), left, top: top + H });
    }
    const out = path.join(root, `${page}-sheet-${s + 1}.png`);
    await sharp({ create: { width: COLS * W, height: rows * (H + LABEL), channels: 3, background: '#f4f2ec' } }).composite(layers).png().toFile(out);
    sheets.push(`  ${out}  (${part.length} candidates, ${part[0].slice(0, 2)} to ${part.at(-1).slice(0, 2)})`);
  }
}
console.log(`${sheets.length} sheets. Read them together, in one turn, then open at full size only a candidate you would choose:\n${sheets.join('\n')}\nEach candidate's author, date, licence and description are in ${path.join(root, 'index.yaml')}.`);
