// Finds what a script wrote and a later edit left wrong: an image placeholder that still stands anywhere in a
// story, and a generated file that is not what its generator writes. Run from the repo root:
//   node scripts/generated-check.mjs <story> [--no-run]
// Try: node scripts/generated-check.mjs alexander-the-great --no-run
// It reports, and ends with status 1 where it reports anything:
// - a placeholder of content/<story>/.plan/images/*.yaml that took an image and still stands as a word of its
//   own in a page's text, a marker, a card, a page file or a generator of .plans/. scripts/images-place.mjs
//   switches them, and one left behind comes back into the pages when its generator runs again.
// - a file that differs after its generator has run: a generated file somebody changed by hand, or a generator
//   somebody changed and did not run. Each page generator of .plans/, pages<section>.*, is run, the files under
//   pages/ and shared/ are compared with what they held, and every file is put back as it was. --no-run leaves
//   this part out: run it only while no agent is writing the story's pages.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const args = process.argv.slice(2), run = !args.includes('--no-run');
const story = args.find(a => !a.startsWith('--'));
if (!story) { console.error('usage: node scripts/generated-check.mjs <story> [--no-run], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }

const problems = [];
// ---- placeholders that took an image and still stand
const lists = path.join(dir, '.plan', 'images'), taken = new Map();
for (const n of fs.existsSync(lists) ? fs.readdirSync(lists).filter(n => n.endsWith('.yaml')) : [])
  for (const e of yaml.load(fs.readFileSync(path.join(lists, n), 'utf8')) ?? []) if (e?.placeholder && e.image && e.image !== 'none') taken.set(String(e.placeholder), String(e.image));
const TEXT = /\.(md|ya?ml|[cm]?js)$/;
function walk(d, out = []) {
  for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'images') walk(full, out); } else if (TEXT.test(e.name)) out.push(full);
  }
  return out;
}
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const file of ['pages', 'shared', '.plans'].flatMap(f => walk(path.join(dir, f)))) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (const [placeholder, id] of taken) {
    // the placeholder as a word of its own: not the start of its image's id, and not a part of a longer name
    const word = new RegExp(`(^|[^\\w-])${esc(placeholder)}(?![\\w-])`);
    lines.forEach((l, i) => { if (word.test(l)) problems.push(`${file}:${i + 1}: the placeholder ${placeholder} still stands, and its image is ${id}`); });
  }
}

// ---- generated files that are not what their generator writes
if (run) {
  const gens = path.join(dir, '.plans');
  const all = d => { const out = []; (function w(x) { for (const e of fs.existsSync(x) ? fs.readdirSync(x, { withFileTypes: true }) : []) { const full = path.join(x, e.name); if (e.isDirectory()) { if (e.name !== 'images') w(full); } else if (/\.(ya?ml|geojson)$/.test(e.name)) out.push(full); } })(d); return out; };
  const snapshot = () => new Map(['pages', 'shared'].flatMap(f => all(path.join(dir, f))).map(f => [f, fs.readFileSync(f)]));
  for (const name of fs.existsSync(gens) ? fs.readdirSync(gens).filter(n => /^pages\d{3}\.[cm]?js$/.test(n)).sort() : []) {
    const before = snapshot();
    const r = spawnSync('node', [path.join(gens, name)], { encoding: 'utf8' });
    const after = snapshot();
    if (r.status !== 0) problems.push(`${path.join(gens, name)}: the generator fails: ${String(r.stderr).trim().split('\n')[0]}`);
    for (const [f, b] of after) if (!before.has(f)) { problems.push(`${f}: ${name} writes this file, and it was not there`); fs.rmSync(f); }
    for (const [f, b] of before) {
      const now = after.get(f);
      if (now && now.equals(b)) continue;
      problems.push(`${f}: differs from what ${name} writes${now ? '' : ', which removes it'}`);
      fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, b);          // put back as it was
    }
  }
}
if (!problems.length) { console.log(`ok: no placeholder is left in ${story}${run ? ', and every page generator writes what is on disk' : ''}`); process.exit(0); }
console.log(problems.join('\n'));
process.exit(1);
