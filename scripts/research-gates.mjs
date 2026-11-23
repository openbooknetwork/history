// Counts what the research gates ask of a digest, content/<story>/.plan/research.md. Run from the repo root:
//   node scripts/research-gates.mjs <story> [section number ...]
// It prints four tables in Markdown and ends with the counts. It writes nothing and always ends with status 0:
// each table is a list for the research-reviewer, or until there is one the researcher, to rule on.
//
// 1. Each `agreed` line with fewer than two sources. A source is a file a quote of the line names, so a line's
//    count is its distinct files. A line whose files all come down to one author is listed too, as "one author":
//    two books of Diodorus are one account. A line is `agreed` when that is the first standing its claim gives,
//    and "agreed for the date; single for the route" is listed as agreed in part.
// 2. Each section's `scholarly` and `primary` sources, as distinct files, side by side, so that a thin section
//    shows. The lowest scholarly count is marked.
// 3. Each author used with two works or more. The digest does not name the author of a source in one place, so
//    the author is taken as best it allows: from the names of names.md's tables of writers and scholars, or, in a
//    story without them, from each "<Name>'s <Title>" of the Coverage lines. A source is given to the author
//    whose name stands in its file name, else to the one whose title a Coverage line gives and that file name
//    alone holds, else to the first one its heading or page names. A work is a file without its volume or part number.
//    The files no author was found for are counted at the end and listed, since an author hidden there is not
//    compared.
// 4. Each Coverage sentence that says no source gives, covers or fixes something.
//
// What it cannot judge stays with the research-reviewer: whether two sources are independent, since two files
// may take a point from each other or from one third work; whether the later of an author's two works withdraws
// the earlier, which is a comparison of the two; whether a section's sources are enough for its pages; and
// whether the read files were searched before a Coverage line says no source gives a thing.
import fs from 'fs';
import path from 'path';
import { storyDir } from './story-dir.mjs';

const KINDS = ['scholarly', 'primary', 'institution', 'wikipedia'];
const STANDINGS = ['agreed', 'single', 'disputed', 'open'];

export function table(header, rows) {
  const lines = [`| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`];
  for (const r of rows) lines.push(`| ${r.map(v => typeof v === 'number' ? v.toLocaleString('en-US') : String(v).replace(/\|/g, '\\|')).join(' | ')} |`);
  return lines.join('\n');
}

// The digest's sections: { number, id, coverage, lines: [{ id, kind, claim, standing, part, sources }] }.
// A source is { file, at, kind }, read from each bracket that opens with a file name and ends with a kind.
export function readDigest(text) {
  const sections = [];
  let section = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^## +(.*\S)\s*$/);
    if (h) {
      const m = h[1].match(/^(\d{3})\s+(\S+)/);
      section = m ? { number: m[1], id: m[2], coverage: '', lines: [] } : null;
      if (section) sections.push(section);
      continue;
    }
    if (!section) continue;
    if (/^Coverage:/i.test(line)) { section.coverage = line.replace(/^Coverage:\s*/i, ''); continue; }
    const m = line.match(/^- (\d{3}\.\d+)\s+(?:(\p{L}+):\s*)?(.*)$/u);
    if (!m) continue;
    // the claim runs to the first quote, and its standing is the first standing word after a full stop of it
    const quote = m[3].search(/["“]/), head = quote < 0 ? m[3] : m[3].slice(0, quote);
    const first = head.match(new RegExp(`\\.\\s+(${STANDINGS.join('|')})\\b(\\s+for\\b)?`, 'i'));
    const standing = (first?.[1] ?? head.match(new RegExp(`\\b(${STANDINGS.join('|')})\\b`, 'i'))?.[1] ?? '').toLowerCase();
    const sources = [];
    for (const b of m[3].matchAll(/\(([^\s(),"“”]+\.[A-Za-z0-9]{2,5}),\s*((?:[^()]|\([^()]*\))*?),\s*([a-z]+)\)/g)) sources.push({ file: b[1], at: b[2], kind: b[3] });
    section.lines.push({
      id: m[1], kind: m[2] ?? '', claim: (first ? head.slice(0, first.index + 1) : head).trim(), standing,
      part: !!first?.[2] && standing === 'agreed', sources,
    });
  }
  return sections;
}

const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

// The authors names.md lists: the names of its tables of writers and scholars, each with its other forms.
export function authorsOfNames(text) {
  const authors = [];
  let on = false, head = null;
  for (const line of text.split('\n')) {
    if (/^#{1,6} /.test(line)) { on = /writer|scholar|author|historian/i.test(line); head = null; continue; }
    if (!on || !/^\s*\|.*\|\s*$/.test(line)) continue;
    if (!head) { head = cells(line); continue; }
    if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) continue;
    const c = cells(line), name = c[0].replace(/\([^()]*\)/g, '').trim();
    const other = head.findIndex(h => /other forms/i.test(h));
    const forms = [name, ...(other > 0 ? (c[other] ?? '').split(';').map(f => f.replace(/\([^()]*\)/g, '').replace(/["“”]/g, '').trim()) : [])];
    // "Hammond and Walbank" is found by either name
    if (/ and /.test(name)) forms.push(...name.split(/ and /));
    if (name) authors.push({ name, forms: forms.filter(f => f.length > 2) });
  }
  return authors;
}

// A file name as words: archive.org's "-20" and its like are the escapes of a space, a comma and a bracket.
const words = file => file.replace(/-(20|2C|28|29|3B|27)(?=[^0-9]|$)/g, ' ').replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
const has = (hay, form) => new RegExp(`(?<![\\p{L}])${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'iu').exec(hay);

// The longest run of letters two strings share, for a title a file name holds cut short.
function shared(a, b) {
  let best = 0;
  const row = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) for (let j = b.length; j >= 1; j--) {
    row[j] = a[i - 1] === b[j - 1] ? row[j - 1] + 1 : 0;
    if (row[j] > best) best = row[j];
  }
  return best;
}

// Gives each source its author, or null, by the three steps the header names.
export function authorFinder(authors, coverages, allFiles) {
  const titles = [];   // { author, title } of each "<Name>'s <Title>" a Coverage line gives
  const known = authors.length > 0;
  for (const text of coverages) for (const m of text.matchAll(/(\p{Lu}[\p{L}.-]+(?: \p{Lu}[\p{L}.-]+)*)['’]s ((?:\p{Lu}[\p{L}-]*)(?:(?: (?:and|of|the|in|on|to|a))* \p{Lu}[\p{L}-]*)*)/gu)) {
    let author = authors.find(a => a.forms.some(f => f.toLowerCase() === m[1].toLowerCase()));
    if (!author && !known) { author = { name: m[1], forms: [m[1]] }; authors.push(author); }
    if (author && m[2].length >= 10) titles.push({ author, title: m[2].toLowerCase() });
  }
  // a title counts for a file that holds seven tenths of it, and only when no second work holds it too:
  // "Alexander the Great" stands in the names of many
  const holds = (title, name) => { const n = shared(title, name); return n >= 10 && n >= 0.7 * title.length; };
  const allWorks = [...new Set(allFiles.map(work))].map(words);
  const byFile = new Map();
  return source => {
    if (!byFile.has(source.file)) {
      const name = words(source.file);
      let author = authors.find(a => a.forms.some(f => has(name, f.toLowerCase()))) ?? null;
      if (!author) {
        const hits = titles.filter(t => holds(t.title, name) && allWorks.filter(w => holds(t.title, w)).length === 1);
        author = hits.length && hits.every(t => t.author === hits[0].author) ? hits[0].author : null;
      }
      byFile.set(source.file, author);
    }
    if (byFile.get(source.file)) return byFile.get(source.file);
    let first = null;
    for (const a of authors) for (const f of a.forms) { const hit = has(source.at, f); if (hit && (!first || hit.index < first.index)) first = { index: hit.index, author: a }; }
    return first?.author ?? null;
  };
}

// A file without its endings and its volume or part number: Diodorus-Siculus-17A and -17B are one work.
export const work = file => {
  let stem = file.replace(/(\.[A-Za-z0-9]{2,5})+$/, '').replace(/-djvu$/i, '');
  for (let last; last !== stem;) { last = stem; stem = stem.replace(/-(\d+[A-Za-z]?|books?\d+to\d+)$/i, ''); }
  return stem;
};

// The sentences of a Coverage line that say no source gives a thing.
export function noSource(coverage) {
  return coverage.split(/(?<=[.?!])(?<!\b(?:ch|chs|vol|pp?|ed|tr|cf|bk|no)\.)\s+(?=[\p{Lu}"“])/u)
    .map(c => c.trim()).filter(c => /\bno (?:\p{L}+ ){0,2}sources?\b/iu.test(c));
}

const short = (text, n = 110) => text.length > n ? `${text.slice(0, n - 1).trimEnd()}…` : text;

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const [story, ...only] = process.argv.slice(2);
  if (!story) { console.error('usage: node scripts/research-gates.mjs <story> [section number ...], from the repo root'); process.exit(2); }
  const dir = storyDir(story);
  if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }
  const file = path.join(dir, '.plan', 'research.md'), namesFile = path.join(dir, '.plan', 'names.md');
  if (!fs.existsSync(file)) { console.error(`${file} is missing`); process.exit(2); }
  const all = readDigest(fs.readFileSync(file, 'utf8'));
  for (const n of only) if (!all.some(s => s.number === n)) console.error(`${file} has no part "## ${n} <section id>"`);
  const sections = only.length ? all.filter(s => only.includes(s.number)) : all;
  if (!sections.length) { console.error('no section to count'); process.exit(2); }
  const authors = fs.existsSync(namesFile) ? authorsOfNames(fs.readFileSync(namesFile, 'utf8')) : [];
  const fromNames = authors.length > 0;
  const authorOf = authorFinder(authors, all.map(s => s.coverage), [...new Set(all.flatMap(s => s.lines.flatMap(l => l.sources.map(x => x.file))))]);
  const files = l => [...new Set(l.sources.map(s => s.file))];

  // 1. agreed lines with fewer than two sources
  const thin = [], counts = { agreed: 0, lines: 0, oddKinds: new Set(), noStanding: [] };
  for (const s of sections) for (const l of s.lines) {
    counts.lines++;
    if (!l.standing) counts.noStanding.push(l.id);
    for (const src of l.sources) if (!KINDS.includes(src.kind)) counts.oddKinds.add(`${l.id} ${src.kind}`);
    if (l.standing !== 'agreed') continue;
    counts.agreed++;
    const f = files(l), who = l.sources.map(authorOf);
    const one = f.length >= 2 && who.every(a => a && a === who[0]);
    if (f.length < 2 || one) thin.push([l.id, l.part ? 'agreed in part' : 'agreed', f.length, one ? `one author, ${who[0].name}` : f.length ? [...new Set(l.sources.map(x => x.kind))].join(', ') : 'no source read', short(l.claim)]);
  }
  console.log(`## Agreed lines with fewer than two sources\n`);
  console.log(thin.length ? table(['Claim', 'Standing', 'Files', 'Why', 'Line'], thin) : 'None.');

  // 2. the scholarly and primary sources of each section
  const perSection = sections.map(s => {
    const of = kind => new Set(s.lines.flatMap(l => l.sources.filter(x => x.kind === kind).map(x => x.file)));
    return { s, scholarly: of('scholarly'), primary: of('primary'), agreed: s.lines.filter(l => l.standing === 'agreed').length };
  });
  const least = Math.min(...perSection.map(p => p.scholarly.size));
  console.log(`\n## Sources of each section\n`);
  console.log(table(['Section', 'Lines', 'Agreed', 'Scholarly files', 'Primary files', 'Scholarly works'], perSection.map(p => [
    `${p.s.number} ${p.s.id}`, p.s.lines.length, p.agreed, `${p.scholarly.size}${perSection.length > 1 && p.scholarly.size === least ? ' (fewest)' : ''}`, p.primary.size,
    [...new Set([...p.scholarly].map(f => short(work(f), 48)))].join('<br>') || 'none',
  ])));

  // 3. authors used with two works or more
  const works = new Map(), orphan = new Map();   // author name → work → { sections, quotes }
  for (const s of sections) for (const l of s.lines) for (const src of l.sources) {
    const a = authorOf(src);
    if (!a) { orphan.set(src.file, (orphan.get(src.file) ?? 0) + 1); continue; }
    if (!works.has(a.name)) works.set(a.name, new Map());
    const w = works.get(a.name), key = work(src.file);
    if (!w.has(key)) w.set(key, { sections: new Set(), quotes: 0, kinds: new Set() });
    const e = w.get(key); e.sections.add(s.number); e.quotes++; e.kinds.add(src.kind);
  }
  const twice = [...works].filter(([, w]) => w.size >= 2).sort((a, b) => a[0].localeCompare(b[0]));
  console.log(`\n## Authors used with two works or more\n`);
  console.log(`The authors are ${fromNames ? `the writers and scholars of ${namesFile}` : `each "<Name>'s <Title>" of the Coverage lines, since no table of names.md lists writers or scholars`}. Each is found in a source's file name, else by a title a Coverage line gives, else in the source's heading or page.\n`);
  console.log(twice.length ? table(['Author', 'Work, by its file', 'Kind', 'Quotes', 'Sections'], twice.flatMap(([name, w]) =>
    [...w].sort((a, b) => b[1].quotes - a[1].quotes).map(([key, e]) => [name, short(key, 70), [...e.kinds].join(', '), e.quotes, [...e.sections].join(' ')]))) : 'None.');
  if (orphan.size) {
    console.log(`\nNo author was found for these files:\n`);
    console.log(table(['File', 'Quotes'], [...orphan].sort((a, b) => b[1] - a[1]).map(([f, n]) => [short(f, 90), n])));
  }

  // 4. Coverage sentences that say no source gives a thing
  const none = sections.flatMap(s => noSource(s.coverage).map(c => [s.number, c]));
  console.log(`\n## Coverage: no source gives\n`);
  console.log(none.length ? table(['Section', 'Sentence'], none) : 'None.');

  console.log(`\n## Counts\n`);
  console.log(`${counts.lines} lines in ${sections.length} sections, ${counts.agreed} of them agreed.`);
  console.log(`Agreed lines with fewer than two files: ${thin.filter(r => r[2] < 2).length}. Agreed lines with two files or more of one author: ${thin.filter(r => r[2] >= 2).length}.`);
  console.log(`Scholarly files per section run from ${least} to ${Math.max(...perSection.map(p => p.scholarly.size))}.`);
  console.log(`Authors used with two works or more: ${twice.length}. Files with no author found: ${orphan.size}.`);
  console.log(`Coverage sentences that say no source gives a thing: ${none.length}.`);
  if (counts.noStanding.length) console.log(`No standing was read on ${counts.noStanding.join(', ')}.`);
  if (counts.oddKinds.size) console.log(`A kind that is none of ${KINDS.join(', ')}: ${[...counts.oddKinds].join('; ')}.`);
}
