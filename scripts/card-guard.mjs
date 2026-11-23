// Flags a battle card whose strength or casualties no longer names an author its plan names. Run from the repo root:
//   node scripts/card-guard.mjs <story> [section number ...]
// A section's plan gives each battle's card: the sides of a battle in content/<story>/.plan/<number>-<section id>/
// battles.yaml, or card.sides in battles/<battle id>.yaml beside it for a battle with phases. The card is
// content/<story>/shared/battles/<battle id>/battle.yaml, or the battle's folder in content/shared/battles/.
//
// An author is the words before a colon in a figure, such as Diodorus in "Diodorus: more than 30,000 foot", and each
// of several named there, as in "Aristobulus, in Plutarch: 34 killed". It is also any capitalised name the plan's
// figure opens a sentence or a clause with, as in "Arrian gives 30,000 foot, Diodorus 32,000". A side of the card is
// the plan's side of the same family, else of the same name, else in the same place. The card keeps an author when
// its figure has the name anywhere, in any case.
//
// Prints one line for each author a card lost, or ok:
//   <battle.yaml>: <side>, <strength|casualties>, <author>
// Ends with status 1 when it printed a line, and 2 when it cannot read the story. A story with no section folder
// that holds a battles.yaml has no YAML plan: it says so and ends with 0. A battle with no card yet is counted
// and not flagged.
//
// It cannot judge the figures: a card that names Diodorus beside another number passes. A capitalised word that
// opens a clause and is no author, such as a people's name, is taken for one, and where the card rightly drops it
// the line is a false alarm. An author the plan names only inside a clause, "34 killed in Plutarch", is not seen.
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const [storyName, ...only] = process.argv.slice(2);
if (!storyName) { console.error('usage: node scripts/card-guard.mjs <story> [section number ...], from the repo root'); process.exit(2); }
const story = storyDir(storyName);
if (!story) { console.error(`no story folder is named ${storyName}`); process.exit(2); }

// words that open a figure and are no author
const PLAIN = new Set(('a an the about around roughly some more most many much few fewer less over under not no none unknown uncertain at up nearly almost perhaps '
  + 'probably possibly between both each all only also and or but with without in on of by from for to its his her their this that these those it they he she one two '
  + 'three four five six seven eight nine ten heavy light total killed wounded captured dead lost losses foot horse infantry cavalry ships modern ancient later other '
  + 'another as if when while where though although against after before during including plus then there see').split(' '));
const NAME = /\p{Lu}[\p{L}'’-]*(?:\s+\p{Lu}[\p{L}'’-]*)*/gu;

// The authors a figure names: before a colon, and at the head of a sentence or a clause.
function authors(figure) {
  const found = new Set(), text = String(figure ?? '');
  for (const sentence of text.split(/(?<=[.;!?])\s+|\s+[(–—]\s*|\(/)) {
    const colon = sentence.indexOf(':');
    if (colon > 0) {
      const head = sentence.slice(0, colon).trim(), names = (head.match(NAME) ?? []).filter(n => !PLAIN.has(n.toLowerCase()));
      // "Modern estimates:" has one capital, the sentence's own: the words as they stand are the author
      if (names.length === 1 && head.startsWith(names[0]) && head.includes(' ') && !/[,]/.test(head) && names[0] !== head) found.add(head);
      else for (const n of names) found.add(n);
    }
    for (const clause of (colon > 0 ? sentence.slice(colon + 1) : sentence).split(/,\s+/)) {
      const m = clause.trim().match(/^\p{Lu}[\p{L}'’-]*(?:\s+\p{Lu}[\p{L}'’-]*)*/u);
      if (m && !PLAIN.has(m[0].split(/\s+/)[0].toLowerCase())) found.add(m[0]);
    }
  }
  return [...found];
}
const names = (figure, author) => new RegExp(`(?<![\\p{L}])${author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}(?![\\p{L}])`, 'iu').test(String(figure ?? ''));

const read = file => yaml.load(fs.readFileSync(file, 'utf8'));
const plan = path.join(story, '.plan');
const sections = fs.existsSync(plan)
  ? fs.readdirSync(plan).filter(n => /^\d{3}-/.test(n) && fs.existsSync(path.join(plan, n, 'battles.yaml'))).sort() : [];
if (!sections.length) { console.log(`${story} has no YAML plan: no section folder of ${plan} holds a battles.yaml. Nothing to check.`); process.exit(0); }
const checked = sections.filter(n => !only.length || only.includes(n.slice(0, 3)));
if (!checked.length) { console.error(`${plan} holds no section folder with a battles.yaml numbered ${only.join(', ')}`); process.exit(2); }

// the card of a battle: the story's own, else the one any story can include
function cardFile(id) {
  const own = path.join(story, 'shared', 'battles', id, 'battle.yaml');
  if (fs.existsSync(own)) return own;
  return (function find(dir) {
    if (!fs.existsSync(dir)) return null;
    for (const d of fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory())) {
      const full = path.join(dir, d.name), file = path.join(full, 'battle.yaml');
      if (fs.existsSync(file)) { if (d.name === id) return file; continue; }
      const hit = find(full);
      if (hit) return hit;
    }
    return null;
  })(path.join('content', 'shared', 'battles'));
}

const lost = [], notes = [];
let cards = 0, unbuilt = 0;
for (const name of checked) {
  const folder = path.join(plan, name);
  let battles;
  try { battles = read(path.join(folder, 'battles.yaml')); } catch (e) { console.error(`${path.join(folder, 'battles.yaml')}: is not valid YAML, ${e.reason ?? e.message}`); process.exit(2); }
  for (const b of Array.isArray(battles) ? battles.filter(b => b?.id) : []) {
    const own = path.join(folder, 'battles', `${b.id}.yaml`);
    let sides = b.sides;
    if (b.phases === true || !sides) {
      if (fs.existsSync(own)) { try { sides = read(own)?.card?.sides; } catch (e) { console.error(`${own}: is not valid YAML, ${e.reason ?? e.message}`); process.exit(2); } }
    }
    if (!Array.isArray(sides)) { notes.push(`${path.join(folder, 'battles.yaml')}: the plan gives ${b.id} no card sides, ${b.phases === true ? `in battles/${b.id}.yaml` : 'in battles.yaml'}`); continue; }
    const file = cardFile(b.id);
    if (!file) { unbuilt++; continue; }
    cards++;
    const card = read(file) ?? {}, cardSides = Array.isArray(card.sides) ? card.sides : [];
    sides.forEach((side, i) => {
      const match = cardSides.filter(s => s?.color === side.family).length === 1 ? cardSides.find(s => s?.color === side.family)
        : cardSides.find(s => s?.name === side.name) ?? cardSides[i];
      for (const field of ['strength', 'casualties']) for (const author of authors(side[field])) {
        if (!match) lost.push(`${file}: ${side.name}, ${field}, ${author} (the card has no such side)`);
        else if (!names(match[field], author)) lost.push(`${file}: ${side.name}, ${field}, ${author}`);
      }
    });
  }
}

if (notes.length) console.log(notes.join('\n'));
if (lost.length) { console.log(lost.join('\n')); process.exit(1); }
console.log(`ok: ${cards} card${cards === 1 ? '' : 's'} of ${checked.length} section${checked.length === 1 ? '' : 's'} name every author of their plan${unbuilt ? `, ${unbuilt} battle${unbuilt === 1 ? ' has' : 's have'} no card yet` : ''}`);
