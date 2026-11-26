// Sets up a benchmark run of a step that scripts/benchmark.mjs has no variant for. Run from the repo root:
//   node scripts/benchmark-more.mjs pre-plans  <folder> [--sections 010,020,030]
//   node scripts/benchmark-more.mjs names      <folder>
//   node scripts/benchmark-more.mjs map-design <folder>
//   node scripts/benchmark-more.mjs shared-map <folder> [--section 020]
//   node scripts/benchmark-more.mjs battle     <folder> [--section 030] [--battle granicus-334]
// Each makes a plain clone of this repo's last commit in <folder>, which must not exist yet, takes out of it what the step makes, makes the folder ready to
// run in as benchmark.mjs does, writes the overseer's prompt to <folder>/.cache/benchmark-prompt.txt and prints
// the command that starts the run. The story is alexander-the-great, or --story.
//   pre-plans   the sections' plans, pages and parts of the digest go, and a source map is written. A section coordinator
//               has each section's page list written, and an editor checks the lists together.
//   names       names.md goes, and the names agent decides every name again from the digest.
//   map-design  the brief's "Map" part, the story's map fields and its zones go, and the map architect designs it.
//   shared-map  the zones the section's pages list go, with the story's zone generator, and the map keeper draws
//               them again and a map auditor audits them.
//   battle      the battle's plan, card, generator and phase pages go, with its section's plan. A section lead
//               has the section planned, the battle with it, and a battle coordinator has the battle built.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const stop = m => { console.error(m); process.exit(2); };
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args.splice(i, 2)[1]; };
const story = flag('story') ?? 'alexander-the-great';
const sections = (flag('sections') ?? '010,020,030').split(','), section = flag('section'), battle = flag('battle') ?? 'granicus-334';
const [kind, folder] = args;
if (!['pre-plans', 'names', 'map-design', 'shared-map', 'battle'].includes(kind) || !folder) stop('usage: node scripts/benchmark-more.mjs <pre-plans|names|map-design|shared-map|battle> <folder> [--story <id>] [--sections a,b] [--section n] [--battle id]');
const dir = storyDir(story);
if (!dir) stop(`no story folder is named ${story}`);
// a plain clone of this repo at its last commit, and never a git worktree: the run's folder is a repo of its own,
// so nothing it commits reaches this one and no branch here is held by it. Delete the folder when the run is read.
if (fs.existsSync(folder)) stop(`${folder} is there already: give a folder that does not exist yet`);
execFileSync('git', ['clone', '--quiet', '--no-tags', process.cwd(), folder], { stdio: 'inherit' });
const root = path.join(folder, dir), plan = path.join(root, '.plan');
const gone = [];
const remove = p => { if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true }); gone.push(path.relative(folder, p)); } };
const named = (parent, test) => fs.existsSync(parent) ? fs.readdirSync(parent).filter(test).map(n => path.join(parent, n)) : [];
const load = f => yaml.load(fs.readFileSync(f, 'utf8'));
const walk = (d, test, out = []) => { for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []) { const full = path.join(d, e.name); if (e.isDirectory()) walk(full, test, out); else if (test(e.name, full)) out.push(full); } return out; };

// a section's pages, cards, plan and page generator
function takeSection(s, { digest = false } = {}) {
  for (const p of named(path.join(root, 'pages'), n => n.startsWith(`${s}-`))) {
    for (const file of walk(p, n => n === 'page.yaml')) { const b = load(file)?.battle; if (b) remove(path.join(root, 'shared', 'battles', b)); }
    remove(p);
  }
  named(path.join(root, '.plans'), n => new RegExp(`^pages${s}\\.[cm]?js$`).test(n)).forEach(remove);
  named(plan, n => n.startsWith(`${s}-`)).forEach(remove);
  if (digest) {
    const file = path.join(plan, 'research.md'), parts = fs.readFileSync(file, 'utf8').split(/^(?=## )/m), own = parts.find(p => p.startsWith(`## ${s} `)) ?? '';
    fs.writeFileSync(file, parts.filter(p => !p.startsWith(`## ${s} `)).join(''));
    gone.push(`${path.relative(folder, file)}, the part of ${s}`);
    return own;
  }
  return '';
}
// the source map a survey would have written: for each section the files its old lines cited, and its coverage
function sourceMap(parts) {
  const map = path.join(plan, 'sources.md');
  const text = Object.values(parts).filter(Boolean).map(own => {
    const files = [...new Set([...own.matchAll(/"\s*\(([^,)]+)[^)]*\)/g)].map(m => m[1].trim()))].sort();
    return `${own.split('\n')[0]}\n\n${own.split('\n').find(l => /^Coverage:/.test(l)) ?? ''}\n\nFiles, under .references/ and .wikipedia/:\n\n${files.map(f => `- ${f}`).join('\n')}\n`;
  }).join('\n');
  fs.writeFileSync(map, `# Sources of ${story}\n\nMade by scripts/benchmark-more.mjs from what the story's digest cited. A survey writes this file for a new story.\n\n${text}`);
  gone.push(`${path.relative(folder, map)} is written`);
}

let steps = '', what = '';
if (kind === 'pre-plans') {
  sourceMap(Object.fromEntries(sections.map(s => [s, takeSection(s, { digest: true })])));
  what = `Sections ${sections.join(', ')} of the story have no page list, no plan, no pages and no part of the digest: the step pre-plans is run for them, and then the step pre-plan-check.`;
  steps = `1. Dispatch one section-coordinator for each of the sections ${sections.join(', ')}, all in one turn and in the foreground, each with the step pre-plans and the task pre-plan, by the dispatch form. Each one's scratchpad is .cache/scratch/<section>-section-coordinator.
2. When all of them have reported, dispatch one editor with the section all, the step pre-plan-check and the task pre-plans. Its scratchpad is .cache/scratch/all-editor. Its note says that only the sections ${sections.join(', ')} have a page list.`;
} else if (kind === 'names') {
  remove(path.join(plan, 'names.md'));
  what = 'The story has no names file: the step names is run for the whole story, from its digest.';
  steps = '1. Dispatch exactly one names agent with the section all, the step names and the task decide, by the dispatch form. Its scratchpad is .cache/scratch/all-names.';
} else if (kind === 'map-design') {
  const brief = path.join(plan, 'brief.md'), parts = fs.readFileSync(brief, 'utf8').split(/^(?=## )/m);
  fs.writeFileSync(brief, parts.filter(p => !p.startsWith('## Map')).join(''));
  gone.push(`${path.relative(folder, brief)}, its "Map" part`);
  const file = path.join(root, 'story.yaml'), doc = load(file);
  for (const k of ['extent', 'land', 'countries', 'families']) { delete doc[k]; if (doc.harita) delete doc.harita[k]; }
  fs.writeFileSync(file, yaml.dump(doc, { lineWidth: 200, noRefs: true }));
  gone.push(`${path.relative(folder, file)}: its extent, land, countries and families`);
  remove(path.join(root, 'shared', 'zones')); remove(path.join(root, 'shared', 'zones.yaml')); remove(path.join(root, '.plans', 'zones.cjs'));
  what = 'The story has no map design: no "Map" part in its brief, no extent, land, countries or families in story.yaml, and no zone drawn. The step map-design is run.';
  steps = '1. Dispatch exactly one map-architect with the section all, the step map-design and the task design, by the dispatch form. Its scratchpad is .cache/scratch/all-map-architect. Its note says that the pages are an earlier build\'s and name zones not drawn yet, so harita check fails on them, which is no fault of the design.';
} else if (kind === 'shared-map') {
  const s = section ?? '020', own = named(plan, n => n.startsWith(`${s}-`) && fs.statSync(path.join(plan, n)).isDirectory())[0];
  const ids = [...new Set(Object.values(load(path.join(own, 'map.yaml')) ?? {}).flatMap(p => p?.zones ?? []))];
  const file = path.join(root, 'shared', 'zones.yaml'), text = fs.readFileSync(file, 'utf8'), entries = load(file) ?? {};
  const outlines = new Set(ids.map(id => entries[id]?.zone ?? id));
  // the section's own entries go. A later section's entry on one of these outlines stays: it names the outline
  // by its id, and stands again once the outline is drawn
  const drop = new Set(ids);
  fs.writeFileSync(file, text.split('\n').filter(l => !drop.has(l.match(/^([a-z0-9-]+):/)?.[1])).join('\n'));
  gone.push(`${path.relative(folder, file)}: ${[...drop].length} entries`);
  for (const id of outlines) remove(path.join(root, 'shared', 'zones', `${id}.geojson`));
  remove(path.join(root, '.plans', 'zones.cjs'));
  what = `The zones the pages of section ${s} list are not drawn, and the story's zone generator is gone: ${[...outlines].join(', ')}. The shared map is drawn again for them, at the start of the step maps, and audited.`;
  steps = `1. Dispatch exactly one map-keeper with the section all, the step maps and the task draw, by the dispatch form. Its scratchpad is .cache/scratch/all-map-keeper. Its note says that only the zones of map.yaml in .plan/${path.basename(own)} are missing, and the other sections' zones stand.
2. When it has reported, dispatch one map-auditor with the section all, the step maps and the task audit. Its scratchpad is .cache/scratch/all-map-auditor. Where it leaves a fault open for the map keeper, dispatch the map-keeper with the task fix and then the map-auditor with recheck, once, as maps under "Steps" in agents/overseer.md says: a taste fault the recheck finds anew holds nothing up.`;
} else if (kind === 'battle') {
  const s = section ?? '030', name = battle.replace(/-\d+$/, '');
  remove(path.join(root, 'shared', 'battles', battle));
  remove(path.join(plan, 'battles', `${name}.md`));
  named(path.join(root, '.plans'), n => n.startsWith(`${name}.`)).forEach(remove);
  // its phase pages: the pages of the section that draw a battle plan
  for (const file of named(path.join(root, 'pages'), n => n.startsWith(`${s}-`)).flatMap(d => walk(d, n => n === 'page.yaml'))) { const p = load(file); if (p?.emblem?.kind === 'battle-plan' || p?.harita?.emblem?.kind === 'battle-plan') remove(path.dirname(file)); }
  named(plan, n => n.startsWith(`${s}-`)).forEach(remove);
  what = `Section ${s} of the story has no plan, and its battle ${battle} has no plan, no card, no generator and no phase pages. The section's other pages stand, from an earlier build. The step plans is run for the section, which plans the battle, and then the battle is built.`;
  steps = `1. Dispatch exactly one section-lead for section ${s}, with the step plans and the task plan, by the dispatch form. Its scratchpad is .cache/scratch/${s}-section-lead. Its note says that the section's pages stand from an earlier build and only its plan and the battle ${battle} are missing.
2. When it has reported, dispatch one battle-coordinator with the section ${s}, the battle ${battle}, the step phases and the task build. Its scratchpad is .cache/scratch/${s}-battle-coordinator-${battle}.`;
}
console.log(`${folder}: a ${kind} run of ${story} starts here. Taken out:\n${gone.map(g => `  ${g}`).join('\n')}`);

// ready to run in: what git ignores comes from this checkout
const link = (from, to) => { if (fs.existsSync(from) && !fs.existsSync(to)) fs.symlinkSync(fs.realpathSync(from), to); };
link('node_modules', path.join(folder, 'node_modules'));
for (const sources of ['.references', '.wikipedia']) link(path.join(dir, sources), path.join(root, sources));
if (fs.existsSync('.cache') && !fs.existsSync(path.join(folder, '.cache'))) fs.cpSync(fs.realpathSync('.cache'), path.join(folder, '.cache'), { recursive: true });
const git = (...a) => execFileSync('git', ['-C', folder, ...a], { encoding: 'utf8' }).trim();
const exclude = path.resolve(folder, git('rev-parse', '--git-path', 'info/exclude'));
const hidden = fs.existsSync(exclude) ? fs.readFileSync(exclude, 'utf8') : '';
for (const name of ['.references', '.wikipedia', 'node_modules']) if (!hidden.split('\n').includes(name)) fs.appendFileSync(exclude, `${name}\n`);
git('add', '-A', dir);
git('commit', '-q', '-m', `benchmark: ${story}, a ${kind} run starts here`);
const last = steps.split('\n').length + 1;
fs.writeFileSync(path.join(folder, '.cache', 'benchmark-prompt.txt'), `You are the overseer of a benchmark run of this repo's story pipeline (spec.md item 0.2), on the story ${story}. ${what} What the run makes was taken out of this folder, and the rest stands as frozen input.

Read "Whose work it is", "Dispatches" and "Managers" in agents/overseer.md, and "The dispatch" and "The report" in agents/report.md. Then:

${steps}
${last}. Do no part of the work yourself, and dispatch no other agent. Where an agent ends with a handoff before its work is done, dispatch one fresh agent of its role the same way, at most twice.
${last + 1}. When the last has reported, commit the story's changed files by naming their paths, print each report block and the lines after it as they are, then one line for each thing of the process itself that broke or had to be worked around, and stop.

Do not push, and change no file outside this folder.
`);
console.log(`\nReady: the start is committed as ${git('rev-parse', '--short', 'HEAD')}. Start the run there:\n  cd ${folder} && CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 claude -p --permission-mode auto --output-format stream-json --verbose < .cache/benchmark-prompt.txt > .cache/benchmark-stream.jsonl`);
