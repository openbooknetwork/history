// Prints, for one section, each claim its pages rest on with the passage of each quote as its source file has it,
// so a text is checked or written against the sources in one read and not by a search for each quote.
// Run from the repo root:
//   node scripts/passages.mjs <story> <section number> [page id ...] [--around <characters>]
//   node scripts/passages.mjs <story> <section number> --part <part file>     every line of a researcher's part file
// Try: node scripts/passages.mjs alexander-the-great 020
// It writes content/<story>/.plan/passages-<section>.md, which git ignores, and prints its path and its counts.
// It writes the same a file a page too, passages-<section>-<page id>.md, each small enough for one Read and with
// the line of each passage in its source: those are what a writer and a fact checker are listed.
// For each page of the section's pages.yaml, in order, it gives the claims of its rests_on and of its disputes in
// text.yaml: the digest's line whole, then for each quote of the line the file and the passage around the quote,
// so the file stands in for the section's slice of the digest: it holds the rest of the section's part too,
// about 270 characters before it and 600 after by default. A claim two pages rest on is printed at the first.
//
// It finds a quote by its first words, with any run of spaces, line breaks and markup between them, as a scan of a
// book breaks its lines anywhere. A quote it cannot place is listed as not placed, with the file to open. It
// proves nothing: scripts/quotes-check.mjs says whether a quote stands in its file, and whether a passage
// carries its claim is the reader's to judge.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const args = process.argv.slice(2);
const at = args.indexOf('--around');
const around = at < 0 ? 600 : +args.splice(at, 2)[1] || 600;
const partAt = args.indexOf('--part'), part = partAt < 0 ? null : args.splice(partAt, 2)[1];
const [story, section, ...only] = args;
const stop = message => { console.error(message); process.exit(2); };
if (!story || !/^\d{3}$/.test(section ?? '')) stop('usage: node scripts/passages.mjs <story> <section number> [page id ...] [--around <characters>], from the repo root');
const dir = storyDir(story);
if (!dir) stop(`no story folder is named ${story}`);
const plan = path.join(dir, '.plan');
const folder = fs.readdirSync(plan).find(n => n.startsWith(`${section}-`) && fs.statSync(path.join(plan, n)).isDirectory());
if (!folder && !part) stop(`${plan} holds no plan folder numbered ${section}`);
const read = name => { try { return yaml.load(fs.readFileSync(path.join(plan, folder ?? '.', name), 'utf8'), { schema: yaml.JSON_SCHEMA }); } catch { return null; } };
const pages = (read('pages.yaml') ?? []).filter(p => p?.id && (!only.length || only.includes(p.id)));
const disputes = read('text.yaml')?.pages ?? {};

// the digest's lines by claim id
const lines = new Map();
for (const line of fs.readFileSync(part ?? path.join(plan, 'research.md'), 'utf8').split('\n')) { const id = line.match(/^- (\d+\.\d+) /)?.[1]; if (id) lines.set(id, line); }

const raw = {};
const body = file => raw[file] ??= fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// where a quote starts in its file: its first words, then fewer of them, with anything but letters between
function place(text, quote) {
  const words = quote.split(/…|\.\.\./)[0].normalize('NFC').replace(/[‘’]/g, "'").match(/[\p{L}\p{N}]+/gu) ?? [];
  for (const n of [8, 5, 3]) {
    if (words.length < Math.min(n, 3)) break;
    const m = new RegExp(words.slice(0, n).map(esc).join('[^\\p{L}\\p{N}]+'), 'iu').exec(text);
    if (m) return m.index;
  }
  return -1;
}
const tidy = s => s.replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();

// the same, a file a page: what a writer and a fact checker read, each file small enough for one Read
const byPage = [];
const lineAt = (text, i) => { let n = 1; for (let k = 0; k < i; k++) if (text.charCodeAt(k) === 10) n++; return n; };
const out = [`Passages for ${folder ?? `section ${section}`}, made by scripts/passages.mjs. It is not edited: a quote is changed in research.md.`, ''];
const printed = new Set();
let quotes = 0, placed = 0;
// with --part every line of the part file is printed, in its order, whether a page rests on it yet or not: the
// file a research reviewer reads
for (const p of part ? [{ id: path.basename(part), title: 'every line of the part file', all: true }] : pages) {
  out.push(`## ${p.id}: ${p.title ?? ''}`, '');
  const own = [];
  byPage.push([p.id, p.title ?? '', own]);
  const ids = p.all ? [...lines.keys()] : [...new Set([...(p.rests_on ?? []), ...(disputes[p.id]?.disputes ?? []).map(d => d?.claim)].filter(Boolean).map(String))];
  for (const id of ids) {
    // a page's own file holds every claim the page rests on, whether an earlier page printed it or not
    const again = printed.has(id), claim = [];
    const put = (...l) => { claim.push(...l); if (!again) out.push(...l); };
    own.push(claim);
    if (again) out.push(`### ${id}`, '', 'Printed above, at the first page that rests on it.', '');
    printed.add(id);
    const line = lines.get(id);
    if (!line) { put(`### ${id}`, '', 'No line of the digest has this id.', ''); continue; }
    put(`### ${id}`, '', line, '');
    for (const [, quote, name] of line.matchAll(/"([^"]+)"\s*\(([^,)]+)[^)]*\)/g)) {
      if (!again) quotes++;
      const file = ['.wikipedia', '.references'].map(d => path.join(dir, d, name.trim())).find(f => fs.existsSync(f));
      const text = file && body(file);
      const i = text ? place(text, quote) : -1;
      if (i < 0) { put(`Not placed: "${quote.slice(0, 80)}" in ${file ?? name.trim()}${file ? '' : ', which is not fetched'}.`, ''); continue; }
      if (!again) placed++;
      const from = Math.max(0, i - Math.round(around * 0.45)), to = Math.min(text.length, i + quote.length + around);
      put(`Passage, ${file}, from line ${lineAt(text, from)}, character ${from}:`, '', '```', tidy(text.slice(from, to)), '```', '');
    }
  }
}
// what else the section's part of the digest holds, so this file stands in for the digest's slice: its lines that
// are no claim, such as its Coverage, and the claims no page rests on
if (!only.length && !part) {
  const own = [], rest = [];
  let inside = false;
  for (const line of fs.readFileSync(path.join(plan, 'research.md'), 'utf8').split('\n')) {
    if (/^## /.test(line)) { inside = line.startsWith(`## ${section} `); continue; }
    if (!inside || !line.trim()) continue;
    const id = line.match(/^- (\d+\.\d+) /)?.[1];
    if (!id) own.push(line); else if (!printed.has(id)) rest.push(line);
  }
  if (own.length) out.splice(2, 0, "## The section's part of the digest, its lines that are no claim", '', ...own, '');
  if (rest.length) out.push('## Claims of the section that no page rests on', '', ...rest, '');
  if (own.length || rest.length) byPage.push(['0-rest', 'what else the section\'s part of the digest holds', [[...(own.length ? ['## Its lines that are no claim', '', ...own, ''] : []), ...(rest.length ? ['## Claims that no page rests on', '', ...rest, ''] : [])]]]);
}
// A file a page, cut at a claim where it would pass what one Read gives: passages-<section>-<page id>.md, with
// -2, -3 after it for the parts of a long page, and the window in the name where it is not the usual one. The
// files of an earlier run are removed first.
const made = [];
if (!part) {
  const tag = around === 600 ? '' : `-w${around}`, LIMIT = 40000;
  const mine = n => new RegExp(`^passages-${section}-.+${tag ? `${tag}(-\\d+)?` : '(?<!-w\\d+)(?<!-w\\d+-\\d+)'}\\.md$`).test(n) && n !== `passages-${section}-part.md`;
  if (!only.length) for (const n of fs.readdirSync(plan).filter(mine)) fs.rmSync(path.join(plan, n));
  for (const [id, title, claims] of byPage) {
    const parts = [[]];
    for (const c of claims) { if (parts.at(-1).length && parts.at(-1).join('\n').length + c.join('\n').length > LIMIT) parts.push([]); parts.at(-1).push(...c); }
    parts.forEach((lines, i) => {
      const f = path.join(plan, `passages-${section}-${id}${tag}${i ? `-${i + 1}` : ''}.md`);
      fs.writeFileSync(f, [`Passages for the page ${id} of ${folder}${parts.length > 1 ? `, part ${i + 1} of ${parts.length}` : ''}: ${title}. Made by scripts/passages.mjs. It is not edited: a quote is changed in research.md.`, '', ...lines].join('\n'));
      made.push(f);
    });
  }
}
const file = path.join(plan, part ? `passages-${section}-part.md` : `passages-${section}.md`);
fs.writeFileSync(file, out.join('\n'));
console.log(`${file}: ${out.join('\n').split('\n').length} lines, ${pages.length} pages, ${printed.size} claims, ${placed} of ${quotes} quotes placed.${made.length ? `\nA file a page, each one Read: ${made.join(' ')}` : ' Read it once, whole.'}`);
