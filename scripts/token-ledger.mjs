// Sums the token usage of an agent run from its transcripts. Run from the repo root:
//   node scripts/token-ledger.mjs <run> [--by role|step|section|parent|agent|model] [--story <id>] [--variant <name>]
//                                 [--weights <input>,<cache write>,<cache read>,<output>] [--pages <n>]
//                                 [--roles <file>] [--json]
// <run> is a session's transcript, a folder of transcripts, or a run saved with --json: transcripts.mjs says how
// each is read and how an agent gets its role, step and section. --by takes one key or several with commas, such
// as step,role. --by parent shows the tree: the cost of each manager's team.
//
// Usage is counted once per message. "Peak context" is the largest context an agent read in one turn: its input,
// cache writes and cache reads together. "Weighted" puts the four kinds on one scale, by default at the API's
// price ratios: input 1, cache write 1.25, cache read 0.1, output 5. Set --weights to the ratios of the limit the
// run counts against. The pages are the page.yaml files of the sections the run worked on.
//
// The last lines count the dispatches of the run and list each that breaks the dispatch form of agents/report.md.
//
// --json prints the whole run, its usage, its dispatches and its agents' reports, to save beside a story's plan:
//   node scripts/token-ledger.mjs <run> --variant baseline --json > content/<story>/.plan/run.json
// scripts/run-viewer.html shows a saved run in a browser: open it and choose the file, or several to compare.
import { parseArgs, loadRun, table, stop } from './transcripts.mjs';

const opts = parseArgs(process.argv.slice(2));
const run = loadRun(opts);
if (!run) stop('usage: node scripts/token-ledger.mjs <session .jsonl, folder or saved .json> [--by role] [--json], from the repo root');
if (opts.json) { console.log(JSON.stringify(run, null, 1)); process.exit(0); }

const weights = (opts.weights ?? '1,1.25,0.1,5').split(',').map(Number);
if (weights.length !== 4 || weights.some(Number.isNaN)) stop('--weights takes four numbers: input, cache write, cache read, output');
const weigh = r => Math.round(r.input * weights[0] + r.cacheWrite * weights[1] + r.cacheRead * weights[2] + r.output * weights[3]);

const keys = (opts.by ?? 'role').split(',');
const known = ['role', 'step', 'section', 'parent', 'agent', 'model'];
for (const k of keys) if (!known.includes(k)) stop(`--by ${k}: the keys are ${known.join(', ')}`);

const groups = new Map();
for (const r of run.usage) {
  const key = keys.map(k => r[k]).join(' · ');
  if (!groups.has(key)) groups.set(key, { key, agents: new Set(), turns: 0, peak: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 });
  const g = groups.get(key);
  g.agents.add(r.agent);
  g.peak = Math.max(g.peak, r.peak);
  for (const k of ['turns', 'input', 'cacheWrite', 'cacheRead', 'output']) g[k] += r[k];
}
const row = (name, g, agents) => [name, agents, g.turns, g.peak, g.input, g.cacheWrite, g.cacheRead, g.output, weigh(g)];
const sorted = [...groups.values()].sort((a, b) => weigh(b) - weigh(a));
const total = { turns: 0, peak: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 };
for (const g of sorted) {
  total.peak = Math.max(total.peak, g.peak);
  for (const k of ['turns', 'input', 'cacheWrite', 'cacheRead', 'output']) total[k] += g[k];
}

if (run.variant || run.story) console.log([run.story && `Story: ${run.story}`, run.variant && `Variant: ${run.variant}`].filter(Boolean).join(' · ') + '\n');
console.log(table(
  [keys.join(' · '), 'Agents', 'Turns', 'Peak context', 'Input', 'Cache write', 'Cache read', 'Output', 'Weighted'],
  [...sorted.map(g => row(g.key, g, g.agents.size)), row('**total**', total, new Set(run.usage.map(r => r.agent)).size)],
));
console.log(`\nWeighted: input x${weights[0]}, cache write x${weights[1]}, cache read x${weights[2]}, output x${weights[3]}.`);
if (run.pages) console.log(`Pages: ${run.pages}, at ${Math.round(weigh(total) / run.pages).toLocaleString('en-US')} weighted tokens a page.`);

const dispatches = run.dispatches ?? [];
const broken = dispatches.filter(d => d.problems.length);
console.log(`\nDispatches: ${dispatches.length}, of which ${broken.length} break the dispatch form.`);
if (broken.length) console.log('\n' + table(['Role', 'Description', 'Breaks the form by'], broken.map(d => [d.role ?? '-', d.description || '-', d.problems.join('; ')])));
