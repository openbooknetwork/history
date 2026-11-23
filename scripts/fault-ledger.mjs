// Counts the faults of an agent run from the report blocks its agents returned. Run from the repo root:
//   node scripts/fault-ledger.mjs <run> [--story <id>] [--roles <file>] [--json]
// <run> is a session's transcript, a folder of transcripts, or a run saved with --json: transcripts.mjs says how
// each is read. A report block is the fenced yaml block of agents/report.md, and where an agent prints several
// before it ends its work, the last one counts. An agent that is resumed reports once per resume.
//
// A fault is caught at the step of the agent that reports it. Its "introduced" line names the work that made it,
// and FIRST_CHECK of transcripts.mjs gives the step whose check should have caught it. A leak is a wrong fault caught at a later
// step than that. A fault made by a fix or a ruling has no first check and is counted on its own.
import { parseArgs, loadRun, table, stop, FIRST_CHECK, stepIndex } from './transcripts.mjs';

const REWORK = ['fix', 'ruling'];
const SEVERITIES = ['wrong', 'weak', 'taste'];

const opts = parseArgs(process.argv.slice(2));
const run = loadRun(opts);
if (!run) stop('usage: node scripts/fault-ledger.mjs <session .jsonl, folder or saved .json> [--json], from the repo root');
if (opts.json) { console.log(JSON.stringify(run, null, 1)); process.exit(0); }

const count = (list, test) => list.filter(test).length;
const short = (s, n = 90) => { s = String(s ?? '').replace(/\s+/g, ' ').replace(/\|/g, '/'); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const byStep = (a, b) => stepIndex(a.step) - stepIndex(b.step);
const faults = run.reports.flatMap(r => r.faults.map(f => ({ ...f, step: r.step, role: r.role, section: r.section })));

if (run.variant || run.story) console.log([run.story && `Story: ${run.story}`, run.variant && `Variant: ${run.variant}`].filter(Boolean).join(' · ') + '\n');

console.log('## Reports and faults, by the step that caught them\n');
const caught = new Map();
for (const r of run.reports) {
  const key = `${r.step} ${r.role}`;
  if (!caught.has(key)) caught.set(key, { step: r.step, role: r.role, reports: [] });
  caught.get(key).reports.push(r);
}
const caughtRows = [...caught.values()].sort((a, b) => byStep(a, b) || a.role.localeCompare(b.role)).map(g => {
  const fs = g.reports.flatMap(r => r.faults);
  return [g.step, g.role, g.reports.length, ...['pass', 'faults', 'blocked'].map(s => count(g.reports, r => r.status === s)),
    ...SEVERITIES.map(s => count(fs, f => f.severity === s))];
});
console.log(table(['Step', 'Role', 'Reports', 'pass', 'faults', 'blocked', ...SEVERITIES], [...caughtRows,
  ['', '**total**', run.reports.length, ...['pass', 'faults', 'blocked'].map(s => count(run.reports, r => r.status === s)),
    ...SEVERITIES.map(s => count(faults, f => f.severity === s))]]));

console.log('\n## Faults by kind\n');
const kinds = [...new Set(faults.map(f => f.kind))].sort((a, b) => count(faults, f => f.kind === b) - count(faults, f => f.kind === a));
console.log(table(['Kind', ...SEVERITIES], kinds.map(k => [k, ...SEVERITIES.map(s => count(faults, f => f.kind === k && f.severity === s))])));

console.log('\n## Rework: a role that reported on one section more than once\n');
const rounds = new Map();
for (const r of run.reports) {
  const key = `${r.role} ${r.section}`;
  if (!rounds.has(key)) rounds.set(key, { step: r.step, role: r.role, section: r.section, statuses: [] });
  rounds.get(key).statuses.push(r.status);
}
const again = [...rounds.values()].filter(g => g.statuses.length > 1).sort((a, b) => byStep(a, b) || a.section.localeCompare(b.section));
console.log(again.length ? table(['Role', 'Section', 'Reports', 'In order'], again.map(g => [g.role, g.section, g.statuses.length, g.statuses.join(', ')])) : 'None.');

const wrong = faults.filter(f => f.severity === 'wrong');
const leaked = f => f.leak;
console.log('\n## Wrong faults by the work that introduced them\n');
const made = [...new Set(wrong.map(f => f.introduced ?? 'not said'))].sort((a, b) => stepIndex(FIRST_CHECK[a]) - stepIndex(FIRST_CHECK[b]) || a.localeCompare(b));
console.log(wrong.length ? table(['Introduced by', 'First check at', 'Wrong faults', 'Leaked'],
  made.map(m => [m, FIRST_CHECK[m] ?? '-', count(wrong, f => (f.introduced ?? 'not said') === m), count(wrong, f => f.introduced === m && leaked(f))])) : 'None.');

console.log('\n## Leaks\n');
const leaks = wrong.filter(leaked).sort((a, b) => stepIndex(a.firstCheck) - stepIndex(b.firstCheck) || byStep(a, b));
console.log(leaks.length ? table(['Introduced by', 'Should be caught at', 'Caught at', 'Caught by', 'File', 'What should change'],
  leaks.map(f => [f.introduced, f.firstCheck, f.step, `${f.role} ${f.section}`.trim(),
    short(f.file, 70) + (f.claim ? ` (${f.claim})` : ''), short(f.action)])) : 'None.');

const rework = wrong.filter(f => REWORK.includes(f.introduced));
if (rework.length) {
  console.log('\n## Wrong faults made by a fix or a ruling\n');
  console.log(table(['Made by', 'Caught by', 'File', 'What should change'],
    rework.map(f => [f.introduced, `${f.role} ${f.section}`.trim(), short(f.file, 70), short(f.action)])));
}

const notes = [];
const unsaid = count(faults, f => !f.introduced);
if (unsaid) notes.push(`${unsaid} of ${faults.length} faults carry no "introduced" line, so the leak count is a lower bound.`);
const odd = [...new Set(faults.map(f => f.introduced).filter(i => i && !(i in FIRST_CHECK) && !REWORK.includes(i)))];
if (odd.length) notes.push(`"introduced" values this script does not know: ${odd.join(', ')}.`);
const reporting = new Set(run.reports.map(r => r.agent));
const silent = run.agents.filter(a => a.role !== 'overseer' && !reporting.has(a.agent));
if (silent.length) notes.push(`${silent.length} of ${count(run.agents, a => a.role !== 'overseer')} agents returned no report block: ${[...new Set(silent.map(a => a.role))].join(', ')}.`);
if (notes.length) console.log('\n' + notes.join('\n'));
