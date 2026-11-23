// The fixed benchmark: one section built again from frozen inputs, so a change to the process has a number.
// Run from the repo root:
//   node scripts/benchmark.mjs setup <build|plans|research> <folder> [--story <id>] [--section <number>]
//   node scripts/benchmark.mjs compare <run.json> <run.json> ...
// The benchmark is section 020 of alexander-the-great, four pages and one card, unless --story and --section name
// another. What is frozen depends on what a variant changes, since a variant cannot be measured on an input it
// would itself make:
//   build     a variant of the maps, texts, images or checks starts from the digest, the plan and the rules
//   plans     a variant of the plans starts from the digest and the brief
//   research  a variant of the research starts from the brief and the source files
// "setup" makes a git worktree of HEAD in <folder> and takes out of it what the variant makes: the section's pages
// and battle cards, its reports, faults and fixes, and for plans its plan too, and for research its part of the
// digest as well. Run the variant there, two or three times in folders of their own, and save each run with
//   node scripts/token-ledger.mjs <transcripts> --story <id> --variant <name> --json > <name>.json
// "compare" puts the saved runs side by side: weighted tokens per accepted page, wrong faults, leaks, rework rounds
// and wall time. A page is accepted when the section's last report of its fact check and of its map audit is pass.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';
import { table } from './transcripts.mjs';

const stop = message => { console.error(message); process.exit(2); };
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args.splice(i, 2)[1]; };
const story = flag('story') ?? 'alexander-the-great', section = flag('section') ?? '020';
const [verb, ...rest] = args;

if (verb === 'setup') {
  const [kind, folder] = rest;
  if (!['build', 'plans', 'research'].includes(kind) || !folder) stop('usage: node scripts/benchmark.mjs setup <build|plans|research> <folder> [--story <id>] [--section <number>]');
  const dir = storyDir(story);
  if (!dir) stop(`no story folder is named ${story}`);
  execFileSync('git', ['worktree', 'add', '--detach', folder, 'HEAD'], { stdio: 'inherit' });
  const root = path.join(folder, dir), plan = path.join(root, '.plan');
  const gone = [];
  const remove = p => { if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true }); gone.push(path.relative(folder, p)); } };
  const named = (parent, test) => fs.existsSync(parent) ? fs.readdirSync(parent).filter(test).map(n => path.join(parent, n)) : [];
  const pages = named(path.join(root, 'pages'), n => n.startsWith(`${section}-`));
  // the cards of the section's pages
  for (const p of pages) for (const page of named(p, n => fs.existsSync(path.join(p, n, 'page.yaml')))) {
    const battle = yaml.load(fs.readFileSync(path.join(page, 'page.yaml'), 'utf8'))?.battle;
    if (battle) remove(path.join(root, 'shared', 'battles', battle));
  }
  pages.forEach(remove);
  for (const channel of ['reports', 'faults', 'fixes', 'images']) named(path.join(plan, channel), n => n.startsWith(`${section}`)).forEach(remove);
  if (kind !== 'build') named(plan, n => n.startsWith(`${section}-`)).forEach(remove);
  if (kind === 'research') {
    const digest = path.join(plan, 'research.md');
    if (fs.existsSync(digest)) {
      const parts = fs.readFileSync(digest, 'utf8').split(/^(?=## )/m);
      fs.writeFileSync(digest, parts.filter(p => !p.startsWith(`## ${section} `)).join(''));
      gone.push(`${path.relative(folder, digest)}, the part of ${section}`);
    }
  }
  console.log(`${folder}: a ${kind} variant of ${story} ${section} starts here. Taken out:\n${gone.map(g => `  ${g}`).join('\n')}`);
  console.log('The section\'s zones, markers and routes in shared files stay: a variant that draws them writes over them.');
} else if (verb === 'compare') {
  if (!rest.length) stop('usage: node scripts/benchmark.mjs compare <run.json> <run.json> ...');
  const weigh = r => r.input + r.cacheWrite * 1.25 + r.cacheRead * 0.1 + r.output * 5;
  const rows = rest.map(file => {
    const run = JSON.parse(fs.readFileSync(file, 'utf8'));
    const tokens = Math.round(run.usage.reduce((n, r) => n + weigh(r), 0));
    const faults = run.reports.flatMap(r => r.faults);
    const last = role => run.reports.filter(r => r.role === role).at(-1)?.status;
    const accepted = last('fact-checker') === 'pass' && last('map-auditor') === 'pass' ? run.pages ?? 0 : 0;
    const rounds = new Map();
    for (const r of run.reports) rounds.set(`${r.role} ${r.section}`, (rounds.get(`${r.role} ${r.section}`) ?? 0) + 1);
    const rework = [...rounds.values()].reduce((n, c) => n + c - 1, 0);
    const times = run.agents.flatMap(a => [a.start, a.end]).filter(Boolean).map(t => Date.parse(t)).filter(t => !Number.isNaN(t));
    const minutes = times.length ? Math.round((Math.max(...times) - Math.min(...times)) / 60000) : '-';
    return [run.variant ?? path.basename(file, '.json'), run.usage.reduce((s, r) => s.add(r.agent), new Set()).size, tokens, run.pages ?? '-', accepted,
      accepted ? Math.round(tokens / accepted) : '-', faults.filter(f => f.severity === 'wrong').length, faults.filter(f => f.leak).length, rework,
      (run.dispatches ?? []).filter(d => d.problems.length).length, minutes];
  });
  console.log(table(['Variant', 'Agents', 'Weighted tokens', 'Pages', 'Accepted', 'Tokens per accepted page', 'Wrong faults', 'Leaks', 'Rework rounds', 'Broken dispatches', 'Minutes'], rows));
} else stop('usage: node scripts/benchmark.mjs setup <build|plans|research> <folder> | compare <run.json> ..., from the repo root');
