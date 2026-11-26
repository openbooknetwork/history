// Lists the sentences of a section's texts that follow a source's wording closely. Run from the repo root, once a
// section has its texts:
//   node scripts/close-wording.mjs <story> <section number> [page id ...] [--min <share>]
// Try: node scripts/close-wording.mjs alexander-the-great 020
// agents/text.md asks for the book's own words: a sentence that is a source's with a few words changed is the
// source's sentence. A fact checker found these by reading, about four a section. This finds the candidates.
//
// It takes each sentence of a text's body and notes, outside quotation marks, and the passages its page's claims
// quote, as scripts/passages.mjs writes them. It drops the small words of both (the, of, and, was) and measures
// the longest run of the sentence's words that the passage has in the same order, with gaps allowed. A sentence
// of eight such words or more whose share in a passage is at least 0.55 is printed with the passage's words, the
// highest first.
//
// It is a list to read and no verdict. Names and dates have to be shared, so a short sentence full of names scores
// high for no fault, and a close paraphrase in other words scores low. It prints nothing as a fault and always
// ends with status 0.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const args = process.argv.slice(2);
const at = args.indexOf('--min');
const min = at < 0 ? 0.55 : +args.splice(at, 2)[1] || 0.55;
const [story, section, ...only] = args;
if (!story || !/^\d{3}$/.test(section ?? '')) { console.error('usage: node scripts/close-wording.mjs <story> <section number> [page id ...] [--min <share>], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname), plan = path.join(dir, '.plan');
spawnSync('node', [path.join(here, 'passages.mjs'), story, section], { encoding: 'utf8' });
const file = path.join(plan, `passages-${section}.md`);
if (!fs.existsSync(file)) { console.error(`${file} is missing: node scripts/passages.mjs ${story} ${section} writes it`); process.exit(2); }

const SMALL = new Set(`a an the of and or but nor for to in on at by with from into onto over under as is are was were be been being has have had do does did
  he she it they his her its their him them this that these those who whom which what when where while then than so not no if there here also still only very
  will would shall should may might can could must one two more most some any all each both such own same other after before`.split(/\s+/));
const words = s => (s.toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+/gu) ?? []).filter(w => !SMALL.has(w));

// the passages by claim id, and the claims by page
const passages = new Map(), claims = new Map();
{
  let page = null, claim = null, inBlock = false, src = '';
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const p = line.match(/^## ([^:]+):/), c = line.match(/^### (\S+)/), from = line.match(/^Passage, (\S+?),/);
    if (p) { page = p[1]; claims.set(page, []); } else if (c) { claim = c[1]; claims.get(page)?.push(claim); } else if (from) src = path.basename(from[1]);
    else if (line.startsWith('```')) inBlock = !inBlock;
    else if (inBlock && claim) { if (!passages.has(claim)) passages.set(claim, []); const list = passages.get(claim); if (list.at(-1)?.src === src) list.at(-1).text += ' ' + line; else list.push({ src, text: line }); }
  }
}
// the longest run of a's words that b has in order, with gaps, and which of b's words they are
function common(a, b) {
  const t = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) t[i][j] = a[i - 1] === b[j - 1] ? t[i - 1][j - 1] + 1 : Math.max(t[i - 1][j], t[i][j - 1]);
  return t[a.length][b.length];
}
function sentences(md) {
  const kept = [];
  for (const line of md.split('\n')) { if (/^\s*(#|@|>)/.test(line)) { if (/^#+\s*(sources|references)/i.test(line)) break; continue; } kept.push(line); }
  return kept.join('\n').split(/\n\s*\n/).flatMap(para => para.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/“[^”]*”|"[^"]*"/g, ' ').replace(/\\\*/g, ' ').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()
    .split(/(?<=[.!?][)’']*) (?=[^\p{Ll}])/u).filter(Boolean));
}

const pages = (yaml.load(fs.readFileSync(path.join(plan, fs.readdirSync(plan).find(n => n.startsWith(`${section}-`) && fs.statSync(path.join(plan, n)).isDirectory()), 'pages.yaml'), 'utf8')) ?? []).filter(p => p?.id && (!only.length || only.includes(p.id)));
const sectionDir = path.join(dir, 'pages', fs.readdirSync(path.join(dir, 'pages')).find(n => n.startsWith(`${section}-`)) ?? '');
const textOf = id => { const d = fs.existsSync(sectionDir) ? fs.readdirSync(sectionDir).find(n => n.replace(/^\d+-/, '') === id) : null; const f = d && path.join(sectionDir, d, 'text', 'en.md'); return f && fs.existsSync(f) ? f : null; };

const found = [];
for (const p of pages) {
  const text = textOf(p.id);
  if (!text) continue;
  const sources = (claims.get(p.id) ?? []).flatMap(c => (passages.get(c) ?? []).map(x => ({ ...x, claim: c, w: words(x.text) })));
  for (const sentence of sentences(fs.readFileSync(text, 'utf8'))) {
    const a = words(sentence);
    if (a.length < 8) continue;
    let best = null;
    for (const s of sources) for (let from = 0; from < Math.max(1, s.w.length - a.length); from += Math.max(1, a.length >> 1)) {
      const window = s.w.slice(from, from + a.length * 2), share = common(a, window) / a.length;
      if (!best || share > best.share) best = { share, s, from };
    }
    if (best && best.share >= min) found.push({ text, sentence, share: best.share, claim: best.s.claim, src: best.s.src });
  }
}
found.sort((x, y) => y.share - x.share);
for (const f of found) console.log(`${f.text}\n  ${Math.round(f.share * 100)}% of its words stand in order in a passage of claim ${f.claim}, ${f.src}\n  "${f.sentence}"\n`);
console.log(found.length ? `${found.length} ${found.length === 1 ? 'sentence follows' : 'sentences follow'} a passage closely. Read each beside its passage: reword what is the source's sentence, and leave what only shares its names and dates.` : 'No sentence follows a passage closely.');
