// Runs `harita check` on a story and sets apart what is only an image placeholder that waits for its image.
// Run from the repo root, where you would run the check:
//   node scripts/placeholders.mjs <story> [page id ...]
// Try: node scripts/placeholders.mjs alexander-the-great league-renewed
// A plan names the images a page wants, in the `images` of its entry in text.yaml, each with a name such as
// hydaspes-coin. Until scripts/images-place.mjs puts the images' ids in their place, once every section is
// reviewed, that name stands in a text as "@image hydaspes-coin", on a marker as "image: hydaspes-coin" and in a
// card's "images". The check lists each as "waiting", and the page shows a hatched box with the name in it. A
// kitap before placeholders reports the name as an unknown image, and a marker that holds one as an unknown
// marker. Those lines are no fault and nobody fixes them, least of all by taking the placeholder out. The check
// cannot tell a placeholder from a mistyped id, and this can: a name that waits and that no plan gives is a
// problem. It prints the problems, then each placeholder with the image the image finder gave it, and ends with
// status 1 only where a problem is left.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const [story, ...pages] = process.argv.slice(2);
if (!story) { console.error('usage: node scripts/placeholders.mjs <story> [page id ...], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }
const read = file => { try { return yaml.load(fs.readFileSync(file, 'utf8')); } catch { return null; } };
const plan = path.join(dir, '.plan');

// each placeholder a plan names, and the image it took
const names = new Map();
for (const f of fs.existsSync(plan) ? fs.readdirSync(plan).filter(n => /^\d{3}-/.test(n)).sort() : []) {
  const text = read(path.join(plan, f, 'text.yaml'));
  for (const [page, entry] of Object.entries(text?.pages ?? {})) for (const image of Array.isArray(entry?.images) ? entry.images : [])
    if (image?.name) names.set(String(image.name), { section: f.slice(0, 3), page, on: image.on ?? 'the text', took: 'not searched for yet' });
  for (const row of read(path.join(plan, 'images', `${f.slice(0, 3)}.yaml`)) ?? [])
    if (row?.placeholder && names.has(String(row.placeholder))) names.get(String(row.placeholder)).took = String(row.image ?? 'none');
}
// the markers that hold a placeholder
const holding = new Map();
const walk = d => { for (const n of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, n.name); if (n.isDirectory()) { if (!n.name.startsWith('.')) walk(p); } else if (n.name === 'markers.yaml') for (const [id, m] of Object.entries(read(p) ?? {})) if (names.has(String(m?.image))) holding.set(id, String(m.image)); } };
walk(dir);

const run = spawnSync(path.join('node_modules', '.bin', 'harita'), ['check', story, ...pages], { encoding: 'utf8' });
const lines = `${run.stdout ?? ''}${run.stderr ?? ''}`.split('\n').filter(l => l.trim());
const waiting = new Set(), real = [], texts = new Set();
for (const l of lines) {
  // a kitap that knows placeholders says "waiting: image ...", and an older one "unknown image ..."
  // a page whose text is not written yet waits for it too: said as "waiting: text of ...", and by a kitap before
  // that as "text/en.md is missing"
  const text = l.match(/^waiting: text of (\S+?),/)?.[1] ?? l.match(/^(\S+): text\/[a-z-]+\.md is missing/)?.[1];
  if (text) { texts.add(text); continue; }
  const image = l.match(/(?:unknown|^waiting:) image "([^"]+)"/)?.[1], marker = l.match(/unknown marker "([^"]+)"/)?.[1];
  if (image && names.has(image)) waiting.add(image);
  else if (image && l.startsWith('waiting:')) real.push(`${l.match(/ in (\S+?),/)?.[1] ?? dir}: image "${image}" has no folder, and no plan names it as an image a page wants`);
  else if (marker && holding.has(marker)) waiting.add(holding.get(marker));
  else if (!/^\d+ problems?$/.test(l.trim()) && l.trim() !== 'ok') real.push(l);
}
console.log(real.length ? `${real.join('\n')}\n${real.length} ${real.length === 1 ? 'problem' : 'problems'}` : 'ok');
if (waiting.size) {
  console.log(`\n${waiting.size} image ${waiting.size === 1 ? 'placeholder waits' : 'placeholders wait'} for scripts/images-place.mjs. They are no fault: leave each where it stands.`);
  for (const name of [...waiting].sort()) { const p = names.get(name); console.log(`  ${name}: section ${p.section}, ${p.page}, on ${p.on}. Image: ${p.took}`); }
}
if (texts.size) console.log(`\n${texts.size} ${texts.size === 1 ? 'page waits' : 'pages wait'} for a text. That is no fault before the section's texts are written: write no text to get past it.\n${[...texts].sort().map(t => `  ${t}`).join('\n')}`);
process.exitCode = real.length ? 1 : 0;
