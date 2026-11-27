// Prints the order of a section's build, worked out from what each task needs. Run from the repo root:
//   node scripts/order.mjs <story> <section number> [--battles <id,id>] [--json]
//   node scripts/order.mjs --all
// Try: node scripts/order.mjs joan-of-arc 040
// The table of scripts/pipeline.mjs says for each first run which tasks it is made from: `NEEDS`. This prints
// the waves that follow from it: each wave is what can start once the waves before it have ended, and what
// stands in one wave runs side by side. Needs that go round in a circle are an error, with the circle named,
// and the script ends with status 2. The battles are the section's battles with phases, read from its
// battles.yaml where --battles does not name them. A task the table marks `per: 'page'` stands once for each
// page of the section's pages.yaml.
// --json prints what workflows/section.js is handed as its `plan`: the nodes, and for each role of these steps
// its step, whether it is a checker, whether its work is a battle's, and whether it takes captures.
// --all prints the waves of the whole pipeline, each task once, to see the order of a story from its survey on.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';
import { PIPELINE, NEEDS, SERVES, BUILD, graph, waves } from './pipeline.mjs';

const stop = message => { console.error(message); process.exit(2); };
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(`--${name}`); if (i < 0) return false; args.splice(i, 1); return true; };
const value = name => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args.splice(i, 2)[1]; };
const json = flag('json'), all = flag('all'), named = value('battles');
const print = (nodes) => { let w; try { w = waves(nodes); } catch (e) { stop(e.message); } return w; };

if (all) {
  const steps = [...new Set(Object.values(PIPELINE).flatMap(t => Object.values(t).map(e => e.step)))];
  const nodes = graph({ steps, scopes: ['all', 'section', 'battle'], battles: ['<battle>'] });
  print(nodes).forEach((w, i) => console.log(`${String(i + 1).padStart(2)}  ${w.join('   ')}`));
  process.exit(0);
}
const [story, section] = args;
if (!story || !/^\d{3}$/.test(section ?? '')) stop('usage: node scripts/order.mjs <story> <section number> [--battles <id,id>] [--json], or --all');
const dir = storyDir(story);
if (!dir) stop(`no story folder is named ${story}`);
let battles = named != null ? named.split(',').filter(Boolean) : [];
if (named == null) {
  const folder = fs.readdirSync(path.join(dir, '.plan')).find(n => n.startsWith(`${section}-`));
  const file = folder && path.join(dir, '.plan', folder, 'battles.yaml');
  if (file && fs.existsSync(file)) battles = (yaml.load(fs.readFileSync(file, 'utf8')) ?? []).filter(b => b?.phases === true).map(b => String(b.id));
}
// the section's pages, for a task that runs once for each: the ids of its pages.yaml, less a battle's phase pages
let pages = [];
{
  const folder = fs.readdirSync(path.join(dir, '.plan')).find(n => n.startsWith(`${section}-`));
  const file = folder && path.join(dir, '.plan', folder, 'pages.yaml');
  if (file && fs.existsSync(file)) { const y = yaml.load(fs.readFileSync(file, 'utf8')); pages = (Array.isArray(y) ? y : y?.pages ?? []).filter(p => p?.id && !p.phase_of).map(p => String(p.id)); }
}
const nodes = graph({ steps: BUILD, battles, pages });
const order = print(nodes);
if (!json) { order.forEach((w, i) => console.log(`${i + 1}  ${w.join('   ')}`)); process.exit(0); }
const roles = {};
for (const [role, tasks] of Object.entries(PIPELINE)) {
  const e = Object.values(tasks).find(t => BUILD.includes(t.step) && t.scope !== 'all' && t.kind !== 'manager');
  if (e) roles[role] = { step: e.step, checker: e.kind === 'checker' && Boolean(tasks.recheck), battle: e.scope === 'battle', serve: SERVES.includes(role), fix: Boolean(tasks.fix) };
}
console.log(JSON.stringify({ story, section, battles, pages, nodes, roles }));
