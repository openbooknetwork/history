// Puts each image's id in place of its placeholder, once every section of a story is reviewed. Run from the repo
// root:
//   node scripts/images-place.mjs <story> [--dry-run]
// Try: node scripts/images-place.mjs alexander-the-great --dry-run
// A plan names the images a page wants, each with a name of its own in the story, such as hydaspes-coin. The writer
// puts "@image hydaspes-coin" in the text, the cartographer "image: hydaspes-coin" on a marker, and a card lists it
// under "images". The image finder writes which placeholder took which image to
// content/<story>/.plan/images/<section number>.yaml:
//   - placeholder: hydaspes-coin
//     image: hydaspes-coin-3f9a1c        # the image folder's id, or none
// This script writes the id where the placeholder stands, in every text/<lang>.md of the story's pages, in its
// markers.yaml files, in its battle.yaml files and in the page generators of its .plans folder. A placeholder whose image is none goes with its line. It changes
// no sentence, so no text is checked again for it. A placeholder that no images file names is left as it is and
// listed, and the exit code is then 1: a strict build fails on one.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const story = args.find(a => !a.startsWith('--'));
if (!story) { console.error('usage: node scripts/images-place.mjs <story> [--dry-run], from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }

const lists = path.join(dir, '.plan', 'images');
const placed = new Map();
for (const name of fs.existsSync(lists) ? fs.readdirSync(lists).filter(n => n.endsWith('.yaml')).sort() : []) {
  const doc = yaml.load(fs.readFileSync(path.join(lists, name), 'utf8'));
  for (const e of Array.isArray(doc) ? doc : []) {
    if (!e?.placeholder) continue;
    if (placed.has(e.placeholder)) { console.error(`${path.join(lists, name)}: the placeholder ${e.placeholder} stands twice`); process.exit(2); }
    placed.set(String(e.placeholder), e.image == null || e.image === 'none' ? null : String(e.image));
  }
}
// an image folder's id ends with six hex digits, and a placeholder does not
const isId = v => /-[0-9a-f]{6}$/.test(v);

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'images') continue;
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full, out);
    else if ((/^[a-z-]+\.md$/.test(e.name) && path.basename(d) === 'text') || e.name === 'markers.yaml' || e.name === 'battle.yaml') out.push(full);
  }
  return out;
}

let switched = 0, removed = 0;
const waiting = [];
for (const file of walk(dir)) {
  const before = fs.readFileSync(file, 'utf8');
  const lines = before.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // "@image <name>" in a text, "image: <name>" on a marker, "- <name>" under a card's "images:"
    const m = file.endsWith('.md') ? line.match(/^(\s*@image\s+)([\w-]+)(.*)$/)
      : file.endsWith('markers.yaml') ? line.match(/^(\s*image:\s*)([\w-]+)(\s*)$/)
      : inImages(lines, i) ? line.match(/^(\s*-\s*)([\w-]+)(\s*)$/) : null;
    if (!m || isId(m[2])) { out.push(line); continue; }
    if (!placed.has(m[2])) { waiting.push(`${file}: ${m[2]}`); out.push(line); continue; }
    const id = placed.get(m[2]);
    if (id === null) {
      removed++;
      // a text's image line goes with the blank line after it
      if (file.endsWith('.md') && lines[i + 1] === '' && out.at(-1) === '') i++;
      continue;
    }
    switched++;
    out.push(m[1] + id + m[3]);
  }
  const after = out.join('\n');
  if (after !== before && !dry) fs.writeFileSync(file, after);
}
// whether line i of a battle.yaml is an entry of its "images:" list
function inImages(lines, i) {
  for (let j = i - 1; j >= 0; j--) {
    if (/^\s*-\s/.test(lines[j])) continue;
    return /^\s*images:\s*$/.test(lines[j]);
  }
  return false;
}

// The page generators of .plans/ name images too, and a generator that still names a placeholder writes it back
// into a marker the next time it runs. So each placeholder that stands in a generator as a quoted word is
// switched for its image there as well. One whose image is none cannot be taken out of code by a script: it is
// listed, to take out by hand.
let inGenerators = 0;
const byHand = [];
const gens = path.join(dir, '.plans');
for (const name of fs.existsSync(gens) ? fs.readdirSync(gens).filter(n => /\.[cm]?js$/.test(n)).sort() : []) {
  const file = path.join(gens, name), before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [placeholder, id] of placed) {
    const quoted = new RegExp(`(['"\`])${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`, 'g');
    if (!quoted.test(after)) continue;
    if (id === null) { byHand.push(`${file}: ${placeholder}`); continue; }
    after = after.replace(quoted, (m, q) => { inGenerators++; return q + id + q; });
  }
  if (after !== before && !dry) fs.writeFileSync(file, after);
}
console.log(`${switched} placeholders ${dry ? 'to switch' : 'switched'} for their images, ${removed} with no image ${dry ? 'to take out' : 'taken out'}, ${inGenerators} ${dry ? 'to switch' : 'switched'} in the generators of .plans/.`);
if (byHand.length) { console.log(`${byHand.length} placeholders with no image that a generator still names, to take out by hand:\n${byHand.join('\n')}`); process.exitCode = 1; }
if (waiting.length) { console.log(`${waiting.length} placeholders that no file of ${lists} names:\n${waiting.join('\n')}`); process.exitCode = 1; }
