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
// "setup" makes a git worktree of HEAD in <folder> and takes out of it what the variant makes: the section's
// pages, its reports, faults and fixes, and for plans its plan and its battle cards too, and for research its part
// of the digest as well. A build variant keeps the cards, since a card is written at the step plans. It then makes
// the folder ready to run in: node_modules and the story's fetched sources are linked from this checkout, the build
// cache is copied, and the start is committed there, so a fix log's commit and a recheck's diff have a base.
// It writes the overseer's prompt to <folder>/.cache/benchmark-prompt.txt and prints the command that starts the
// run. Run the variant two or three times in folders of their own, and save each run with
//   node scripts/token-ledger.mjs <transcripts> --story <id> --variant <name> --json > <name>.json
// The run is a session of its own, started in <folder> and not with --plugin-dir: the hooks load from the
// project's .claude/settings.json. Claude Code holds every file of a folder loaded as a plugin for sensitive and
// refuses an agent's writes to it, so a repo is never loaded as its own plugin.
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
    if (battle && kind !== 'build') remove(path.join(root, 'shared', 'battles', battle));
  }
  pages.forEach(remove);
  // a page generator of the section's earlier build: run again, it would write that build's pages over this one's
  named(path.join(root, '.plans'), n => new RegExp(`^pages${section}\\.[cm]?js$`).test(n)).forEach(remove);
  for (const channel of ['reports', 'faults', 'fixes', 'images']) named(path.join(plan, channel), n => n.startsWith(`${section}`)).forEach(remove);
  // a researcher works from its section's page list. So a research variant keeps pages.yaml as a pre-plan,
  // without the claims each page rests on, and takes out the rest of the plan
  let prePlan = null;
  if (kind === 'research') {
    const own = named(plan, n => n.startsWith(`${section}-`) && fs.statSync(path.join(plan, n)).isDirectory())[0];
    const pagesFile = own && path.join(own, 'pages.yaml');
    if (pagesFile && fs.existsSync(pagesFile)) prePlan = [pagesFile, yaml.dump((yaml.load(fs.readFileSync(pagesFile, 'utf8')) ?? []).map(({ rests_on, ...page }) => page), { lineWidth: 200, noRefs: true })];
  }
  if (kind !== 'build') named(plan, n => n.startsWith(`${section}-`)).forEach(remove);
  if (prePlan) { fs.mkdirSync(path.dirname(prePlan[0]), { recursive: true }); fs.writeFileSync(prePlan[0], prePlan[1]); gone.push(`${path.relative(folder, prePlan[0])} is kept as a pre-plan, without rests_on`); }
  if (kind === 'research') {
    const digest = path.join(plan, 'research.md');
    if (fs.existsSync(digest)) {
      const parts = fs.readFileSync(digest, 'utf8').split(/^(?=## )/m), own = parts.find(p => p.startsWith(`## ${section} `)) ?? '';
      fs.writeFileSync(digest, parts.filter(p => !p.startsWith(`## ${section} `)).join(''));
      gone.push(`${path.relative(folder, digest)}, the part of ${section}`);
      // The source map a survey would have written, for a story that was built before there was one: which
      // files cover the section, and the coverage the old digest gave it. It names files and no passage.
      const map = path.join(plan, 'sources.md');
      if (!fs.existsSync(map)) {
        const files = [...new Set([...own.matchAll(/"\s*\(([^,)]+)[^)]*\)/g)].map(m => m[1].trim()))].sort();
        const coverage = own.split('\n').find(l => /^Coverage:/.test(l)) ?? '';
        fs.writeFileSync(map, `# Sources of ${story}\n\nMade by scripts/benchmark.mjs for a research variant, from what the story's digest cited. A survey writes this file for a new story.\n\n${own.split('\n')[0]}\n\n${coverage}\n\nFiles, under .references/ and .wikipedia/:\n\n${files.map(f => `- ${f}`).join('\n')}\n`);
        gone.push(`${path.relative(folder, map)} is written: the ${files.length} files the section's lines cited`);
      }
    }
  }
  console.log(`${folder}: a ${kind} variant of ${story} ${section} starts here. Taken out:\n${gone.map(g => `  ${g}`).join('\n')}`);
  console.log('The section\'s zones, markers and routes in shared files stay: a variant that draws them writes over them.');

  // ready to run in: what git ignores comes from this checkout
  const link = (from, to) => { if (fs.existsSync(from) && !fs.existsSync(to)) fs.symlinkSync(fs.realpathSync(from), to); };
  link('node_modules', path.join(folder, 'node_modules'));
  for (const sources of ['.references', '.wikipedia']) link(path.join(dir, sources), path.join(root, sources));
  if (fs.existsSync('.cache') && !fs.existsSync(path.join(folder, '.cache'))) fs.cpSync(fs.realpathSync('.cache'), path.join(folder, '.cache'), { recursive: true });
  const git = (...a) => execFileSync('git', ['-C', folder, ...a], { encoding: 'utf8' }).trim();
  // a link to a folder is not a folder, so .gitignore's ".references/" does not hide it
  const exclude = path.resolve(folder, git('rev-parse', '--git-path', 'info/exclude'));
  const hidden = fs.existsSync(exclude) ? fs.readFileSync(exclude, 'utf8') : '';
  fs.mkdirSync(path.dirname(exclude), { recursive: true });
  for (const name of ['.references', '.wikipedia', 'node_modules']) if (!hidden.split('\n').includes(name)) fs.appendFileSync(exclude, `${name}\n`);
  git('add', '-A', dir);
  git('commit', '-q', '-m', `benchmark: ${story} ${section} taken out, a ${kind} variant starts here`);
  const step = { build: 'maps', plans: 'plans', research: 'research' }[kind];
  const who = kind === 'research' ? 'research-coordinator' : 'section-lead';
  const task = { build: 'build', plans: 'plan', research: 'claims' }[kind];
  const scope = kind === 'research' ? ` Only section ${section} lacks its part of the digest: one researcher and one reviewer, for that section, and the merge of its part.` : '';
  const prompt = `You are the overseer of a benchmark run of this repo's story pipeline (spec.md item 0.2). Section ${section} of the story ${story} is built again from frozen inputs: a ${kind} variant, as scripts/benchmark.mjs describes it. What the variant makes was taken out, and the rest stands.

Read "Whose work it is", "Dispatches" and "Managers" in agents/overseer.md, and "The dispatch" and "The report" in agents/report.md. Then:

1. Dispatch exactly one ${who} for section ${section}, with the step ${step} and the task its definition gives for this work (${task}, where its definition lists that word), by the dispatch form. Its scratchpad is .cache/scratch/${section}-${who}. The step names where it starts, and its task is the whole of the variant: a build runs from the maps to the review.${scope}
2. Do no part of the section's work yourself, and dispatch no other agent. Where the agent ends with a handoff before its work is done, dispatch one fresh ${who} the same way, at most twice.
3. When it reports, commit the story's changed files by naming their paths, print its report block and the lines after it as they are, then one line for each thing of the process itself that broke or had to be worked around, and stop.

Do not push, and change no file outside this folder.
`;
  fs.mkdirSync(path.join(folder, '.cache'), { recursive: true });
  fs.writeFileSync(path.join(folder, '.cache', 'benchmark-prompt.txt'), prompt);
  console.log(`
Ready: packages and sources linked, the cache copied, the start committed as ${git('rev-parse', '--short', 'HEAD')}.
Start the run there, as a session of its own. On a Mac, "caffeinate -i -s" in front keeps it awake, on power:
  cd ${folder} && CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 claude -p --permission-mode auto \\
    --output-format stream-json --verbose < .cache/benchmark-prompt.txt > .cache/benchmark-stream.jsonl
Without CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 a session started with -p stops its agents ten minutes after its own
last turn. Its transcripts are under ~/.claude/projects/, in the folder named after ${path.resolve(folder)}.`);
} else if (verb === 'compare') {
  if (!rest.length) stop('usage: node scripts/benchmark.mjs compare <run.json> <run.json> ...');
  const weigh = r => r.input + r.cacheWrite * 1.25 + r.cacheRead * 0.1 + r.output * 5;
  const rows = rest.map(file => {
    const run = JSON.parse(fs.readFileSync(file, 'utf8'));
    const tokens = Math.round(run.usage.reduce((n, r) => n + weigh(r), 0));
    const faults = run.reports.flatMap(r => r.faults);
    // a run saves its reports agent by agent: the last report of a role is that of its agent that ended last
    const ended = new Map((run.agents ?? []).map(a => [a.agent, Date.parse(a.end) || 0]));
    const inTime = run.reports.map((r, i) => [r, i]).sort((a, b) => (ended.get(a[0].agent) ?? 0) - (ended.get(b[0].agent) ?? 0) || a[1] - b[1]).map(([r]) => r);
    const last = role => inTime.filter(r => r.role === role).at(-1)?.status;
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
