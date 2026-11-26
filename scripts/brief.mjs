// Lists, by path, every file an agent reads before it starts, so it reads them together in one turn and not one
// a turn. Run from the repo root, as an agent's first command:
//   node scripts/brief.mjs <story> <role> <section number|all> [--battle <id>]
// An agent's whole context is sent again on every turn, so ten files read in ten turns cost ten times what the
// same files cost read in one. The list is: the notes the role's definition names, what scripts/role-inputs.mjs
// says the role builds from (the names and the digest as the section's slices, made afresh here), its handoff, the
// passages a section's claims quote for a writer and a fact checker (scripts/passages.mjs), the section's built
// pages where the role works on them, and the section's fault list, fix log, image list and
// decisions. A file that does not exist yet is left out. It prints each path with its line count. It writes the
// slices and the passages into the story's .plan, and what it cuts and makes for the role, the parts of a long
// note and the role's cards, into .cache/brief/<story>/. It changes no file of the story.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';
import { INPUTS } from './role-inputs.mjs';
import { toolsCard, zonesCard, apiCardText } from './cards.mjs';

const stop = message => { console.error(message); process.exit(2); };
const args = process.argv.slice(2);
const at = args.indexOf('--battle');
const battle = at < 0 ? null : args.splice(at, 2)[1];
const [story, role, section] = args;
if (!story || !role || !section) stop('usage: node scripts/brief.mjs <story> <role> <section number|all> [--battle <id>], from the repo root');
const dir = storyDir(story);
if (!dir) stop(`no story folder is named ${story}`);
if (!INPUTS[role]) stop(`${role} is no role this script knows: ${Object.keys(INPUTS).join(', ')}`);
if (section !== 'all' && !/^\d{3}$/.test(section)) stop(`${section} is no section: give its three digits, such as 020, or all`);
if (battle === undefined || (battle !== null && battle.startsWith('--'))) stop('--battle takes a battle id');
const here = path.dirname(fileURLToPath(import.meta.url));
// what this script cuts and makes for a role goes here, a folder a story, so two stories keep their own
const CUTS = path.join('.cache', 'brief', story);
fs.mkdirSync(CUTS, { recursive: true });
const plan = path.join(dir, '.plan'), one = /^\d{3}$/.test(section);
const numbered = folder => fs.existsSync(folder) ? fs.readdirSync(folder).filter(n => !one || n.startsWith(`${section}-`)).filter(n => /^\d{3}-/.test(n) && fs.statSync(path.join(folder, n)).isDirectory()).sort() : [];
const plans = numbered(plan);

// the role's pages, built: which of a page's files the role reads before it starts
const BUILT = {
  cartographer: ['page.yaml'], 'map-auditor': ['page.yaml'], 'section-writer': ['page.yaml'], 'image-finder': ['page.yaml', 'text/en.md'],
  'fact-checker': ['page.yaml', 'text/en.md'], 'section-reviewer': ['page.yaml', 'text/en.md'], 'battle-implementor': ['page.yaml'], 'battle-auditor': ['page.yaml', 'text/en.md'],
};

const groups = [];
const group = (title, files) => { const have = [...new Set(files)].filter(f => fs.existsSync(f) && fs.statSync(f).isFile()); if (have.length) groups.push([title, have]); };

let definition = '';
try { definition = fs.readFileSync(path.join(here, '..', '.claude', 'agents', `${role}.md`), 'utf8'); } catch { /* a role with no definition here */ }
// A note the definition asks for in part, as "Managers" and "Dispatches" in `agents/overseer.md`, is cut to those
// parts: the headings the definition's own sentence quotes. A note it asks for in full, or names with no heading,
// is read whole. The cut is written to .cache/brief/, which git ignores.
function note(file) {
  // only the items of the definition's reading list count: a sentence elsewhere that points at one part of a
  // note, as "Turns" in `agents/report.md`, does not make that part the whole of what the agent reads
  const items = definition.split(/\n(?=- )|\n\n/).filter(b => b.startsWith('- ') && b.includes(`\`${file}\``));
  const whole = !items.length || items.some(b => /in full/.test(b) || ![...b.split(`\`${file}\``)[0].matchAll(/"([^"]+)"/g)].length);
  const heads = whole ? [] : [...new Set(items.flatMap(b => [...b.split(`\`${file}\``)[0].matchAll(/"([^"]+)"/g)].map(m => m[1])))];
  if (!heads.length || !fs.existsSync(file)) return file;
  const parts = fs.readFileSync(file, 'utf8').split(/^(?=## )/m), kept = parts.filter(p => heads.some(h => p.startsWith(`## ${h}\n`)));
  if (kept.length !== heads.length) return file;   // a heading the note does not have: read the note whole
  const out = path.join(CUTS, `${role}-${path.basename(file)}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `The parts of ${file} that ${role}'s definition names: ${heads.join(', ')}. Made by scripts/brief.mjs.\n\n${kept.join('')}`);
  return out;
}
group('The notes your definition names', [...new Set([...definition.matchAll(/`(agents\/[\w-]+\.md)`/g)].map(m => m[1]))].map(note));

if (one) spawnSync('node', [path.join(here, 'slice.mjs'), story, section], { encoding: 'utf8' });
// a writer and a fact checker read the passages file, which holds the section's whole part of the digest
const passages = one && plans.length && ['fact-checker', 'section-writer', 'battle-implementor', 'battle-auditor'].includes(role);
const slice = (full, cut) => one && fs.existsSync(path.join(plan, cut)) ? path.join(plan, cut) : path.join(plan, full);
const story_ = [], planned = [];
for (const kind of INPUTS[role]) {
  if (kind === 'rules') story_.push(path.join(plan, 'rules.md'));
  if (kind === 'brief') story_.push(slice('brief.md', `brief-${section}.md`));
  if (kind === 'sources') {
    story_.push(path.join(plan, 'sources.md'));
    // the section's own files, with the headings of each and their line numbers
    if (one && spawnSync('node', [path.join(here, 'sources-index.mjs'), story, '--section', section], { encoding: 'utf8' }).status === 0) story_.push(path.join(plan, `sources-index-${section}.md`));
  }
  if (kind === 'names') story_.push(slice('names.md', `names-${section}.md`));
  if (kind === 'digest' && !passages) story_.push(slice('research.md', `research-${section}.md`));
  for (const f of plans) {
    if (['pages', 'map', 'text', 'battles'].includes(kind)) planned.push(path.join(plan, f, `${kind}.yaml`));
    if (kind === 'battle') {
      const own = path.join(plan, f, 'battles');
      for (const n of fs.existsSync(own) ? fs.readdirSync(own).filter(n => /\.(yaml|geojson)$/.test(n) && (!battle || n === `${battle}.yaml` || n === `${battle}-ground.geojson`)).sort() : []) planned.push(path.join(own, n));
    }
  }
}
// the map keeper and its auditor work on the whole story, and of its three largest files they use a part each:
// the brief's "Map" part, the digest's Border lines with the lines the Map part cites, and the states and peoples
// of names.md. Whole, the three come to some 40,000 words, read again by each fix and each recheck.
if (!one && ['map-keeper', 'map-auditor'].includes(role)) {
  const cutTo = (file, name, pick, what) => {
    const at = story_.indexOf(path.join(plan, file)); if (at < 0 || !fs.existsSync(story_[at])) return;
    const part = pick(fs.readFileSync(story_[at], 'utf8')); if (!part.trim()) return;
    const out = path.join(CUTS, `${role}-${name}.md`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, `${what} of ${story_[at]}, cut by scripts/brief.mjs. The whole file has the rest: open it for what this lacks.\n\n${part}`);
    story_[at] = out;
  };
  const heading = (text, test) => text.split(/^(?=## )/m).filter(p => test(p.split('\n')[0])).join('');
  let cited = new Set();
  cutTo('brief.md', 'map', text => { const part = heading(text, h => /^## Map\b/.test(h)); cited = new Set(part.match(/\b\d{3}\.\d+\b/g) ?? []); return part; }, 'The "Map" part');
  cutTo('research.md', 'borders', text => text.split('\n').filter(l => /^## /.test(l) || /^- \d{3}\.\d+ Border:/.test(l) || cited.has(l.match(/^- (\d{3}\.\d+) /)?.[1])).join('\n\n'), 'The Border lines, and the lines the brief\'s Map part cites,');
  cutTo('names.md', 'states', text => heading(text, h => /states|peoples/i.test(h)), 'The states and peoples');
}
// what a zone file holds and how a story draws its zones, for the role that draws them: the engine's two parts on
// zones and one zone generator as the model, this story's own or else another story's.
if (role === 'map-keeper') {
  const made = [];
  const readme = path.join('node_modules', '@openbooknetwork', 'harita', 'README.md');
  if (fs.existsSync(readme)) {
    const parts = fs.readFileSync(readme, 'utf8').split(/^(?=#{2,3} )/m).filter(p => ['Zones', 'Shared zones'].some(h => p.startsWith(`### ${h}\n`)));
    if (parts.length) { const out = path.join(CUTS, 'map-keeper-harita.md'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, `The parts of ${readme} on zones. Made by scripts/brief.mjs.\n\n${parts.join('')}`); made.push(out); }
  }
  // the library every zone generator draws with: its manual and a sample that the tests run
  { const out = path.join(CUTS, 'map-keeper-zones-lib.md'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, zonesCard()); made.push(out); }
  const own = ['zones.mjs', 'zones.cjs'].map(n => path.join(dir, '.plans', n)).find(f => fs.existsSync(f));
  if (own) made.push(own);
  group('How zones are drawn', made);
}
// A planner reads each passage to place a page and not to weigh a wording, so its passages are cut short: some
// 120 characters before a quote and 260 after, where a writer's and a fact checker's run to 270 and 600.
// a planner works from the digest too: every line of the section's part with the passage of each quote, the index
// of the files those lines name, and the schemas its plan files are held to. Without them it finds each passage
// with a search of its own and reads a neighbour's plan to learn the layout.
if (one && ['section-coordinator', 'battle-coordinator'].includes(role)) {
  const cut = path.join(plan, `research-${section}.md`);
  if (fs.existsSync(cut) && spawnSync('node', [path.join(here, 'passages.mjs'), story, section, '--part', cut, '--around', '260'], { encoding: 'utf8' }).status === 0) {
    const i = story_.indexOf(cut); if (i >= 0) story_.splice(i, 1);
    story_.push(path.join(plan, `passages-${section}-part.md`));
  }
  if (spawnSync('node', [path.join(here, 'sources-index.mjs'), story, '--section', section], { encoding: 'utf8' }).status === 0) story_.push(path.join(plan, `sources-index-${section}.md`));
  const schemas = path.join(here, 'plan-schemas');
  group('The layout of the plan files you write', (role === 'battle-coordinator' ? ['battle'] : ['pages', 'map', 'text', 'battles']).map(n => path.relative('.', path.join(schemas, `${n}.schema.json`))));
}
// the passages its claims quote, for the roles that hold a text against its sources
if (passages) {
  spawnSync('node', [path.join(here, 'passages.mjs'), story, section], { encoding: 'utf8' });
  story_.push(path.join(plan, `passages-${section}.md`));
}
// how this story's pages are made, for the role that writes them: the parts of the engine's README on the files a
// cartographer writes, cut out of its 17,000 tokens, and the page generator of the section nearest its own, as
// the model to write its own from. Without them it reads the README whole and looks for a generator itself.
if (role === 'cartographer') {
  const made = [];
  const readme = path.join('node_modules', '@openbooknetwork', 'harita', 'README.md');
  if (fs.existsSync(readme)) {
    const want = ['page.yaml', 'Zones', 'Routes', 'Markers', 'Tally'];
    const parts = fs.readFileSync(readme, 'utf8').split(/^(?=#{2,3} )/m).filter(p => want.some(h => p.startsWith(`### ${h}\n`)));
    if (parts.length) {
      const out = path.join(CUTS, 'cartographer-harita.md');
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, `The parts of ${readme} on the files a cartographer writes: ${want.join(', ')}. Made by scripts/brief.mjs. The whole file has the rest, such as battles and images.\n\n${parts.join('')}`);
      made.push(out);
    }
  }
  const gens = fs.existsSync(path.join(dir, '.plans')) ? fs.readdirSync(path.join(dir, '.plans')).filter(n => /^pages\d{3}\.[cm]?js$/.test(n)).sort() : [];
  const own = gens.find(n => n.includes(section));
  const near = own ?? gens.filter(n => n < `pages${section}`).at(-1) ?? gens[0];
  if (near) made.push(path.join(dir, '.plans', near));
  group('How this story\'s pages are made', made);
}
// what the zones as drawn rest on, line by line, written by the zone generator's last run
if (['map-keeper', 'map-auditor'].includes(role)) story_.push(path.join(plan, 'ground.yaml'));
// how this story's battles are made, for the roles that build and audit them: the engine's two parts on battles,
// cut out of its whole manual, the book's notes on a generator, the story's helper and its builders' notes, and
// one battle generator of the story as the model, not the battle's own. Without them a builder reads the manual
// whole and looks for each of these itself.
if (['battle-implementor', 'battle-auditor'].includes(role)) {
  const made = [];
  const readme = path.join('node_modules', '@openbooknetwork', 'harita', 'README.md');
  if (fs.existsSync(readme)) {
    const parts = fs.readFileSync(readme, 'utf8').split(/^(?=#{2,3} )/m).filter(p => ['Battles', 'Battle plans'].some(h => p.startsWith(`### ${h}\n`)));
    if (parts.length) { const out = path.join(CUTS, `${role}-harita.md`); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, `The parts of ${readme} on battles. Made by scripts/brief.mjs. The whole file has the rest.\n\n${parts.join('')}`); made.push(out); }
  }
  made.push(path.join('content', 'punic-wars', '.plans', 'README.md'));
  const gens = path.join(dir, '.plans');
  if (role === 'battle-implementor' && fs.existsSync(gens)) {
    // the engine's helpers for a battle plan, as a card: each function with the comment above it
    const plansFile = path.join('node_modules', '@openbooknetwork', 'harita', 'src', 'plans.mjs');
    if (fs.existsSync(plansFile)) { const out = path.join(CUTS, 'battle-implementor-plans-api.md'); fs.writeFileSync(out, apiCardText(plansFile, '@openbooknetwork/harita/plans')); made.push(out); }
    made.push(path.join(gens, 'lib.mjs'), path.join(gens, 'IMPLEMENTOR-NOTES.md'));
    const battles = fs.readdirSync(gens).filter(n => /\.mjs$/.test(n) && n !== 'lib.mjs' && !/^(pages\d+|zones)\./.test(n)).map(n => path.join(gens, n)).filter(f => /writePlan/.test(fs.readFileSync(f, 'utf8')) && !(battle && (fs.readFileSync(f, 'utf8').includes(battle) || path.basename(f).startsWith(battle.split('-')[0]))));
    const model = battles.sort((x, y) => fs.statSync(x).size - fs.statSync(y).size)[0];
    if (model) made.push(model);
  }
  group('How battles are made', made);
}
group('The story', story_);
group('The plan', planned);
group('Your handoff', [`${role}.md`, `${role}-${section}.md`, ...(battle ? [`${role}-${battle}.md`] : [])].map(n => path.join(plan, 'handoff', n)));

// the section's pages as they are built, at any depth: a battle's pages lie a folder down. With --battle, a role
// of the battle gets the battle's own pages alone, its card page and its phase pages
const built = [];
if (BUILT[role] && one) {
  const found = [];
  (function walk(d) { for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name)) : []) if (e.isDirectory()) { const full = path.join(d, e.name); if (fs.existsSync(path.join(full, 'page.yaml'))) found.push([e.name.replace(/^\d+-/, ''), full]); else walk(full); } })(numbered(path.join(dir, 'pages')).map(f => path.join(dir, 'pages', f))[0] ?? '');
  let keep = found;
  if (battle && ['battle-implementor', 'battle-auditor'].includes(role)) {
    const listed = plans.flatMap(f => { try { const y = yaml.load(fs.readFileSync(path.join(plan, f, 'pages.yaml'), 'utf8')); return Array.isArray(y) ? y : y?.pages ?? []; } catch { return []; } });
    const own = new Set(listed.filter(p => p?.phase_of === battle || p?.battle === battle || (Array.isArray(p?.battles) && p.battles.includes(battle))).map(p => p.id));
    const mine = found.filter(([id, full]) => own.has(id) || fs.readFileSync(path.join(full, 'page.yaml'), 'utf8').includes(battle));
    if (mine.length) keep = mine;
  }
  for (const [, full] of keep) for (const name of BUILT[role]) built.push(path.join(full, name));
}
group('The section as it is built', built);
group('The section\'s channels', one ? [path.join(plan, 'faults', `${section}.yaml`), path.join(plan, 'fixes', `${section}.yaml`), path.join(plan, 'images', `${section}.yaml`),
  ...plans.map(f => path.join(plan, f, 'decisions.md')), path.join(plan, 'reports', `${section}-${role}${battle ? `-${battle}` : ''}.yaml`)] : []);

// the commands the role's definition names, as one card: what each is for, how it is run, one call that works
{ const card = toolsCard(role); if (card) { const out = path.join(CUTS, `${role}-tools.md`); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, card); groups.unshift(['Your commands', [out]]); } }

let total = 0;
for (const [title, files] of groups) {
  console.log(`${title}:`);
  for (const f of files) { const n = fs.readFileSync(f, 'utf8').split('\n').length; total += n; console.log(`  ${f}  (${n} lines)`); }
}
console.log(`
${groups.reduce((n, g) => n + g[1].length, 0)} files, ${total} lines. Read them all now, in one turn: one Read call for each, sent together.
Where your definition asks for a part of a note, the note is short enough to read whole.
Then keep your turns few, as "Turns" in agents/report.md says: calls that do not wait on each other go in one turn.`);
