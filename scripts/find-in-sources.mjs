// Searches a story's source files for many things at once and prints each hit with the lines around it. Run from
// the repo root:
//   node scripts/find-in-sources.mjs <story> [--in <part of a file's name>,...] [--around <lines>] [--hits <n>] [--out <file>] <term or range> ...
// Try: node scripts/find-in-sources.mjs alexander-the-great --in anabasis Pelium
// A researcher looks up dozens of things, and a search a turn is a turn each: give every term of a question in
// one call. A term is a word or a phrase in quotation marks, such as "night crossing", read without regard to
// case, with any spaces, line breaks and hyphens between its words, as a scanned book breaks its lines. --in
// keeps the search to the files whose names hold one of the parts given, such as arrian,bosworth.
// For each term it prints the count of hits by file and, for the first five hits of each file, the line with two
// lines before and after it and its line number: --hits gives another count than five.
// A range reads a part of one file with no search: <part of the file's name>:<first line>-<last line>, such as
// monstrelet:14130-14180. The part must fit one file. Give every range and every term of a page in one call.
// The whole result goes to a file too, where a long one can be read in parts: the file --out names, which is one
// in the caller's own scratchpad, or else .cache/find/<story>-<the call's number>.txt. No two calls share a file.
import fs from 'fs';
import path from 'path';
import { storyDir } from './story-dir.mjs';

const args = process.argv.slice(2);
const value = name => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args.splice(i, 2)[1]; };
const only = (value('in') ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean), around = +(value('around') ?? 2), most = +(value('hits') ?? 5), outFile = value('out');
const [story, ...terms] = args;
const dir = story && storyDir(story);
if (!dir || !terms.length) { console.error('usage: node scripts/find-in-sources.mjs <story> [--in <part of a file name>,...] [--around <lines>] [--hits <n>] [--out <file>] <term or name:first-last> ..., from the repo root'); process.exit(2); }
const files = ['.references', '.wikipedia'].flatMap(f => fs.existsSync(path.join(dir, f)) ? fs.readdirSync(path.join(dir, f)).filter(n => /\.(txt|wiki|md|html)$/.test(n)).map(n => path.join(dir, f, n)) : [])
  .filter(f => !only.length || only.some(o => path.basename(f).toLowerCase().includes(o)));
const texts = files.map(f => { const text = fs.readFileSync(f, 'utf8'); const starts = [0]; for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1); return { f, text, starts, lines: text.split('\n') }; });
const lineOf = (starts, at) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= at) lo = mid; else hi = mid - 1; } return lo; };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const out = [];
const every = ['.references', '.wikipedia'].flatMap(f => fs.existsSync(path.join(dir, f)) ? fs.readdirSync(path.join(dir, f)).map(n => path.join(dir, f, n)) : []);
for (const term of terms) {
  // a range of lines of one file, read as it is
  const range = term.match(/^([^:\s]+):(\d+)-(\d+)$/);
  if (range) {
    const fits = every.filter(f => path.basename(f).toLowerCase().includes(range[1].toLowerCase()));
    if (fits.length !== 1) { out.push(`=== ${term}: ${fits.length ? `${fits.length} files have "${range[1]}" in their name: ${fits.map(f => path.basename(f)).join(', ')}` : `no file has "${range[1]}" in its name`}`); continue; }
    const lines = fs.readFileSync(fits[0], 'utf8').split('\n'), from = Math.max(1, +range[2]), to = Math.min(lines.length, +range[3]);
    out.push(`=== ${fits[0]}, lines ${from} to ${to}`);
    for (let i = from; i <= to; i++) out.push(`${String(i).padStart(7)}  ${lines[i - 1].slice(0, 400)}`);
    out.push('');
    continue;
  }
  const re = new RegExp(term.trim().split(/\s+/).map(esc).join('[\\s-]+'), 'gi');
  const byFile = [];
  for (const t of texts) {
    const hits = [...t.text.matchAll(re)].map(m => lineOf(t.starts, m.index));
    if (hits.length) byFile.push([t, [...new Set(hits)]]);
  }
  const total = byFile.reduce((n, [, h]) => n + h.length, 0);
  out.push(`=== "${term}": ${total} ${total === 1 ? 'hit' : 'hits'} in ${byFile.length} ${byFile.length === 1 ? 'file' : 'files'}${total ? '' : `, of ${texts.length} searched`}`);
  for (const [t, hits] of byFile.sort((a, b) => b[1].length - a[1].length).slice(0, 8)) {
    out.push(`--- ${t.f}: ${hits.length}${hits.length > most ? `, the first ${most} shown` : ''}`);
    for (const n of hits.slice(0, most)) {
      for (let i = Math.max(0, n - around); i <= Math.min(t.lines.length - 1, n + around); i++) out.push(`${String(i + 1).padStart(7)}${i === n ? '>' : ' '} ${t.lines[i].slice(0, 400)}`);
      out.push('');
    }
  }
}
const file = outFile ?? path.join('.cache', 'find', `${story}-${process.pid}.txt`);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out.join('\n') + '\n');
const shown = out.slice(0, 400);
console.log(shown.join('\n'));
if (out.length > shown.length) console.log(`\n... ${out.length - shown.length} more lines in ${file}: read the part you need.`);
