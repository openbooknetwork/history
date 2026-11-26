// Runs the scripted checks of one section's research in one command, and prints one summary. Run from the repo
// root:
//   node scripts/research-pack.mjs <story> <section number> [--part <part file>]
// Try: node scripts/research-pack.mjs alexander-the-great 020
// With --part it checks a part file a researcher wrote, content/<story>/.plan/research/<section>.md, before it is
// merged. Without, it checks the section's part of the digest. It runs:
//   quotes-check    each quote stands in the file its line names
//   research-gates  the count of sources of each agreed line and of the section, where the lines are in the digest
//   claims-cited    each id of the section that the brief, the names, a plan or a generator cites and the digest
//                   no longer holds, as after a section is researched again with its lines numbered anew
//   passages        each line with the passage around each of its quotes, written to one file to read whole
// Each check's whole output is in .cache/research/<story>-<section>/. It judges nothing: whether a quote carries
// its claim is the reader's. It ends with status 0.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { storyDir } from './story-dir.mjs';

const args = process.argv.slice(2);
const at = args.indexOf('--part'), part = at < 0 ? null : args.splice(at, 2)[1];
const [story, section] = args;
const dir = story && storyDir(story);
if (!dir || !/^\d{3}$/.test(section ?? '')) { console.error('usage: node scripts/research-pack.mjs <story> <section number> [--part <part file>], from the repo root'); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname), out = path.join('.cache', 'research', `${story}-${section}`);
fs.mkdirSync(out, { recursive: true });
const lines = [];
function run(name, script, a, keep = null) {
  const r = spawnSync('node', [path.join(here, script), ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const text = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim(), file = path.join(out, `${name}.txt`);
  let body = text.split('\n').filter(l => l.trim()), failed = r.status !== 0;
  if (keep && failed) { body = body.filter(keep); failed = body.length > 0; }
  fs.writeFileSync(file, (keep ? body.join('\n') : text) + '\n');
  lines.push(`${name.padEnd(15)} ${!failed ? (name === 'research-gates' ? `${body.length} lines to read` : keep ? 'ok for this section' : body.at(-1) ?? 'ok') : `FAILS, ${body.length} lines`}  ${file}`);
  if (failed) for (const l of body.slice(0, 4)) lines.push(`${''.padEnd(17)}${l.slice(0, 200)}`);
}
// the digest holds every section: of its problems only those on this section's lines are this section's
let keep = null;
if (!part) {
  const all = fs.readFileSync(path.join(dir, '.plan', 'research.md'), 'utf8').split('\n'), from = all.findIndex(l => l.startsWith(`## ${section} `));
  const to = from < 0 ? -1 : all.findIndex((l, i) => i > from && l.startsWith('## '));
  keep = l => { const n = +(l.match(/research\.md:(\d+):/)?.[1] ?? 0); return n > from && (to < 0 || n <= to); };
}
run('quotes-check', 'quotes-check.mjs', part ? [story, '--digest', part] : [story], keep);
if (!part) run('research-gates', 'research-gates.mjs', [story, section]);
run('claims-cited', 'claims-cited.mjs', [story, section]);
run('passages', 'passages.mjs', part ? [story, section, '--part', part] : [story, section]);
console.log(`${story} ${section}${part ? `, the part file ${part}` : ''}\n\n${lines.join('\n')}\n\nRead the passages file whole, in one turn, and the file of a check that fails.`);
