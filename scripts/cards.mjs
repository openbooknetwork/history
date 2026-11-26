// Makes the cards an agent reads in place of code: what a command or a function takes, what it gives and one call
// that works. Run from the repo root:
//   node scripts/cards.mjs tools <role>          the commands the role's definition names, one short entry each
//   node scripts/cards.mjs api <module file>     the functions a module exports, each with the comment above it
//   node scripts/cards.mjs zones                 the card of scripts/zones-lib.mjs: its manual and a sample that runs
//   node scripts/cards.mjs check                 every card's faults, one a line; status 1 where there is one
// Try: node scripts/cards.mjs tools map-auditor
// An example is a line of the comment that begins "Try:", and the tests run it. One that begins "Try (slow):" or
// "Try (network):" is shown on the card and not run.
// A card is made from the code and never written by hand, so it cannot say what the code does not:
//   a command's entry is taken from the comment that opens its script: what it is for, its usage lines, which are
//   the lines of that comment that begin "node scripts/", and its example, the line that begins "Try:".
//   a function's entry is its export line and the comment above it.
// scripts/brief.mjs writes a role's cards to .cache/brief/ and lists them first. scripts/cards.test.mjs runs every
// "Try:" line and every sample, so an example that stopped working fails the tests.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
// the comment that opens a file, without its slashes
export const opening = file => { const out = []; for (const l of fs.readFileSync(file, 'utf8').split('\n')) { if (!l.startsWith('//')) break; out.push(l.replace(/^\/\/ ?/, '')); } return out; };
// the scripts a role's definition names, but for the one that makes its start-up list
export function scriptsOf(role) {
  const file = path.join(root, '.claude', 'agents', `${role}.md`);
  if (!fs.existsSync(file)) return null;
  return [...new Set(fs.readFileSync(file, 'utf8').match(/scripts\/[a-z-]+\.mjs/g) ?? [])].filter(s => !['scripts/brief.mjs', 'scripts/zones-lib.mjs', 'scripts/view.mjs'].includes(s)).sort();
}
// one command's entry: what it is for, how it is run, one call that works
export function entry(script) {
  const file = path.join(root, script);
  if (!fs.existsSync(file)) return { script, missing: true };
  const mine = new RegExp(`^\\s+node ${script.replace(/[.\/]/g, '\\$&')}\\b`);
  const lines = opening(file), usageAt = lines.findIndex(l => mine.test(l));
  const purpose = lines.slice(0, usageAt < 0 ? 3 : usageAt).join(' ').replace(/\s*Run( it)? from the repo root.*$/, '').replace(/\s+/g, ' ').trim();
  // a usage line, with the lines under it that carry on its flags
  const usage = []; let open_ = false; lines.forEach(l => { if (mine.test(l)) { usage.push(l.trim()); open_ = true; } else if (open_ && /^\s{8,}\[/.test(l)) usage[usage.length - 1] += ` ${l.trim()}`; else open_ = false; });
  // "Try:" is a call the tests run. "Try (slow):" and "Try (network):" are shown and not run
  const tries = lines.filter(l => /^Try( \((slow|network)\))?: /.test(l)).map(l => l.replace(/^Try[^:]*: /, '').trim());
  const tested = lines.filter(l => /^Try: /.test(l)).map(l => l.replace(/^Try: /, '').trim());
  return { script, purpose, usage, tries, tested, comment: lines.length };
}
export function toolsCard(role) {
  const scripts = scriptsOf(role);
  if (!scripts?.length) return null;
  const out = [`# The commands of a ${role}`, '', `Made by scripts/cards.mjs from the comment that opens each script. Run each from the repo root. This card is`,
    `all you need to call them: open no script. The whole of a script's comment, where you need a flag's meaning, is`, `its first lines: \`sed -n 1,<lines>p <script>\`.`, ''];
  for (const e of scripts.map(entry)) {
    if (e.missing) { out.push(`## ${e.script}`, '', 'No such file.', ''); continue; }
    out.push(`## ${e.script}`, '', e.purpose, '', ...e.usage.map(u => `    ${u}`), ...(e.tries.length ? ['', ...e.tries.map(t => `Example: \`${t}\``)] : []), '', `Its comment is ${e.comment} lines.`, '');
  }
  return out.join('\n');
}
// the functions a module exports, each with the comment above it and the comment that opens the module
export function apiCard(file) {
  const text = fs.readFileSync(file, 'utf8'), lines = text.split('\n'), out = [];
  const comment = i => { const above = []; for (let k = i - 1; k >= 0 && lines[k].startsWith('//'); k--) above.unshift(lines[k].replace(/^\/\/ ?/, '')); return above.join(' ').trim(); };
  // an export's line as its signature: without its body, and with a mark where its value runs on to more lines
  const signature = l => { let t = l.replace(/^export (?:default )?(?:async )?(?:function\*?|const|let|class)\s*/, '').replace(/\s*\{\s*$/, '').replace(/;\s*$/, '').trim(); const depth = [...t].reduce((d, c) => d + ('([{'.includes(c) ? 1 : ')]}'.includes(c) ? -1 : 0), 0); return depth > 0 ? `${t} …` : t; };
  lines.forEach((l, i) => {
    if (!l.startsWith('export ')) return;
    // a comment above two exports in a row is the comment of both, as of a function and the one that binds it
    let own = comment(i); for (let k = i - 1; !own && k >= 0 && lines[k].startsWith('export '); k--) own = comment(k);
    const listed = l.match(/^export \{([^}]*)\}(?:\s+from\s+['"]([^'"]+)['"])?/), all = l.match(/^export \* from ['"]([^'"]+)['"]/);
    if (all) { out.push({ name: '*', signature: `everything of ${all[1]}`, comment: own }); return; }
    if (listed) { for (const part of listed[1].split(',').map(x => x.trim()).filter(Boolean)) { const name = part.split(/\s+as\s+/).pop(); out.push({ name, signature: `${name}${listed[2] ? `, from ${listed[2]}` : ''}`, comment: own }); } return; }
    if (/^export default\b/.test(l)) { out.push({ name: 'default', signature: `default: ${signature(l) || 'the module\'s value'}`, comment: own }); return; }
    const fn = l.match(/^export (?:async )?(?:function\*?|class)\s+(\w+)/);
    if (fn) { out.push({ name: fn[1], signature: signature(l), comment: own }); return; }
    if (/^export (?:const|let)\s/.test(l)) {
      // one line may bind several names: each comma outside a bracket begins the next
      const body = l.replace(/^export (?:const|let)\s+/, ''); let depth = 0, start = 0; const parts = [];
      [...body].forEach((c, k) => { if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) depth--; else if (c === ',' && depth === 0) { parts.push(body.slice(start, k)); start = k + 1; } });
      parts.push(body.slice(start));
      for (const part of parts) { const name = part.trim().match(/^(\w+)\s*=/)?.[1]; if (name) out.push({ name, signature: signature(`export const ${part.trim()}`), comment: own }); }
    }
  });
  return { opening: opening(file), exports: out };
}
export function apiCardText(file, importAs) {
  const { opening: top, exports: list } = apiCard(file);
  return [`# ${importAs ?? file}`, '', `Made by scripts/cards.mjs from ${path.relative(root, file)}. This card is all you need to call it: do not open the file.`, '', '```js', ...top, '```', '',
    ...list.flatMap(e => [`## ${e.signature}`, '', e.comment || 'No comment in the code.', ''])].join('\n');
}
// the zone library: its manual is the comment that opens it, and its methods are held against the manual
export const ZONES = path.join(here, 'zones-lib.mjs'), ZONES_SAMPLE = path.join(here, 'samples', 'zones-lib.sample.mjs');
export function zonesMethods() {
  const text = fs.readFileSync(ZONES, 'utf8'), body = text.slice(text.indexOf('const z = {'));
  const code = [...body.matchAll(/^    (\w+)\(/gm)].map(m => m[1]), manual = [...new Set([...opening(ZONES).join('\n').matchAll(/\bz\.(\w+)\(/g)].map(m => m[1]))];
  return { code: [...new Set(code)], manual };
}
export function zonesCard() {
  return [`# scripts/zones-lib.mjs`, '', 'Made by scripts/cards.mjs: the library\'s manual, and a sample that the tests run. This card is all you need to draw', 'with it: do not open the library.', '', '```', ...opening(ZONES), '```', '',
    '## A sample that runs', '', '```js', fs.readFileSync(ZONES_SAMPLE, 'utf8').trim(), '```', ''].join('\n');
}
// every fault of every card, for the tests and for `check`
export function faults() {
  const out = [], dir = path.join(root, '.claude', 'agents');
  for (const role of fs.readdirSync(dir).filter(n => n.endsWith('.md')).map(n => n.replace(/\.md$/, ''))) for (const e of (scriptsOf(role) ?? []).map(entry)) {
    if (e.missing) out.push(`${role}: its definition names ${e.script}, which is no file`);
    else if (!e.usage.length) out.push(`${e.script}: no usage line in its opening comment, a line that begins "node scripts/"`);
    else if (!e.purpose) out.push(`${e.script}: no sentence before its usage line`);
  }
  const { code, manual } = zonesMethods();
  for (const m of code.filter(m => !manual.includes(m))) out.push(`scripts/zones-lib.mjs: the method ${m} is not in its manual`);
  for (const m of manual.filter(m => !code.includes(m))) out.push(`scripts/zones-lib.mjs: its manual gives z.${m}, which the code lacks`);
  const sample = fs.existsSync(ZONES_SAMPLE) ? fs.readFileSync(ZONES_SAMPLE, 'utf8') : '';
  for (const m of new Set([...sample.matchAll(/\bz\.(\w+)\(/g)].map(x => x[1]))) if (!code.includes(m)) out.push(`scripts/samples/zones-lib.sample.mjs calls z.${m}, which the library lacks`);
  return [...new Set(out)];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [what, arg] = process.argv.slice(2);
  if (what === 'tools' && arg) { const card = toolsCard(arg); if (card === null) { console.error(`no commands for ${arg}: no such role, or its definition names no script`); process.exit(2); } console.log(card); }
  else if (what === 'api' && arg) console.log(apiCardText(arg));
  else if (what === 'zones') console.log(zonesCard());
  else if (what === 'check') { const f = faults(); for (const l of f) console.log(l); console.log(f.length ? `${f.length} faults` : 'ok'); process.exit(f.length ? 1 : 0); }
  else { console.error('usage: node scripts/cards.mjs tools <role> | api <module file> | zones | check, from the repo root'); process.exit(2); }
}
