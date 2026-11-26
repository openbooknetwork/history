// Tests of what stands and what runs again (skip-spec.md), on a small made-up story in a temporary folder.
// Run from the repo root: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
const A = 'zz-story';
// a story of one section and two pages, as a build leaves it
function story() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'inputs-test-')), s = path.join(cwd, 'content', A), plan = path.join(s, '.plan');
  const put = (file, text) => { fs.mkdirSync(path.dirname(path.join(s, file)), { recursive: true }); fs.writeFileSync(path.join(s, file), text); };
  put('story.yaml', 'title: Test\n');
  put('.plan/rules.md', '# Rules\n');
  put('.plan/brief.md', '# Brief\n\n## Sections\n\n### 020 one\n\nTells: a thing.\n');
  put('.plan/research.md', '# Research\n\n## 020 one\n\n- 020.1 Event: Alpha meets Beta. "a quote" (x.txt)\n');
  put('.plan/names.md', '# Names\n\n## People\n\n| Name | Who |\n|---|---|\n| Alpha | a person the plan names |\n| Gamma | a person no plan names |\n');
  put('.plan/020-one/pages.yaml', '- id: first\n  tells: Alpha comes\n- id: second\n  tells: Beta goes\n');
  put('.plan/020-one/map.yaml', 'first:\n  frame: [1, 2, 3, 4]\nsecond:\n  frame: [5, 6, 7, 8]\n');
  put('.plan/020-one/text.yaml', 'section: {opens: here}\npages:\n  first: {account: one}\n  second: {account: two}\n');
  put('.plan/faults/020.yaml', '[]\n');
  for (const [n, id] of [['010', 'first'], ['020', 'second']]) { put(`pages/020-one/${n}-${id}/page.yaml`, `title: ${id}\nmarkers: [m-${id}]\n`); put(`pages/020-one/${n}-${id}/text/en.md`, `The text of ${id}.\n`); }
  put('shared/markers.yaml', 'm-first: {lnglat: [1, 2]}\nm-second: {lnglat: [3, 4]}\n');
  return { cwd, s, plan, put, read: f => fs.readFileSync(path.join(s, f), 'utf8') };
}
const run = (t, ...a) => { const r = spawnSync('node', [path.join(here, 'inputs.mjs'), ...a], { cwd: t.cwd, encoding: 'utf8' }); return { status: r.status, out: `${r.stdout}${r.stderr}` }; };
// one dispatch from its start to its end: the record opened, the agent's work, its report entry, the record closed
function dispatch(t, role, task, step, { status = 'pass', changed = [], work = () => {} } = {}) {
  assert.match(run(t, 'open', A, role, '020', '--task', task, '--step', step).out, /opened/);
  work();
  const file = path.join(t.plan, 'reports', `020-${role}.yaml`), had = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  fs.writeFileSync(file, `${had}- step: ${step}\n  task: ${task}\n  status: ${status}\n  n: ${had.split('- step:').length}\n  changed_files: [${changed.map(c => `content/${A}/${c}`).join(', ')}]\n`);
  return run(t, 'seal', A, role, '020', '--task', task);
}
const stands = (t, role, task, step) => run(t, 'fresh', A, role, '020', '--task', task, '--step', step);

test('a maker stands after its run, and falls when what it builds from changes', () => {
  const t = story();
  assert.equal(stands(t, 'cartographer', 'draw', 'maps').status, 1, 'no record yet');
  assert.match(dispatch(t, 'cartographer', 'draw', 'maps', { changed: ['pages/020-one/'] }).out, /closed, pass/);
  const s = stands(t, 'cartographer', 'draw', 'maps');
  assert.equal(s.status, 0, s.out); assert.match(s.out, /^stands: /); assert.match(s.out, /status: pass/);
  t.put('.plan/020-one/map.yaml', t.read('.plan/020-one/map.yaml').replace('[5, 6, 7, 8]', '[5, 6, 7, 9]'));
  const after = stands(t, 'cartographer', 'draw', 'maps');
  assert.equal(after.status, 1); assert.match(after.out, /map\.yaml#second changed/); assert.doesNotMatch(after.out, /#first/);
});

test('a maker that changes its own input stands, and one whose input another changed does not', () => {
  const t = story(), edit = () => t.put('.plan/020-one/map.yaml', t.read('.plan/020-one/map.yaml').replace('[1, 2, 3, 4]', '[1, 2, 3, 5]'));
  dispatch(t, 'cartographer', 'draw', 'maps', { changed: ['pages/020-one/', '.plan/020-one/map.yaml'], work: edit });
  assert.equal(stands(t, 'cartographer', 'draw', 'maps').status, 0, 'it built from the plan as it left it');
  const u = story();
  dispatch(u, 'cartographer', 'draw', 'maps', { changed: ['pages/020-one/'], work: () => u.put('.plan/020-one/map.yaml', u.read('.plan/020-one/map.yaml').replace('[1, 2, 3, 4]', '[1, 2, 3, 5]')) });
  assert.equal(stands(u, 'cartographer', 'draw', 'maps').status, 1, 'another changed the plan while it drew');
});

test('a maker stands when another fixes what it made, and falls when what it made is gone', () => {
  const t = story();
  dispatch(t, 'section-writer', 'write', 'texts', { changed: ['pages/020-one/010-first/text/en.md', 'pages/020-one/020-second/text/en.md'] });
  t.put('pages/020-one/010-first/text/en.md', 'The text of first, as a fact checker put it right.\n');
  assert.equal(stands(t, 'section-writer', 'write', 'texts').status, 0);
  fs.rmSync(path.join(t.s, 'pages/020-one/020-second/text/en.md'));
  assert.match(stands(t, 'section-writer', 'write', 'texts').out, /what it made is gone/);
});

test('of names.md a role holds the rows its own inputs mention', () => {
  const t = story();
  dispatch(t, 'section-writer', 'write', 'texts', { changed: ['pages/020-one/010-first/text/en.md'] });
  t.put('.plan/names.md', t.read('.plan/names.md').replace('| Gamma | a person no plan names |', '| Gamma | a person no plan names |\n| Delta | another the plans do not name |'));
  assert.equal(stands(t, 'section-writer', 'write', 'texts').status, 0, 'a row for a name no plan holds');
  t.put('.plan/names.md', t.read('.plan/names.md').replace('a person the plan names', 'a person the plan names, in another form'));
  assert.match(stands(t, 'section-writer', 'write', 'texts').out, /names\.md#020 changed/);
});

test('a checker stands on its last pass, a recheck too, and falls on faults, on a change and on an open fault', () => {
  const t = story();
  assert.match(dispatch(t, 'fact-checker', 'check', 'facts', { status: 'faults' }).out, /closed, faults/);
  assert.match(stands(t, 'fact-checker', 'check', 'facts').out, /ended faults/);
  dispatch(t, 'fact-checker', 'recheck', 'facts', { changed: ['pages/020-one/010-first/text/en.md'], work: () => t.put('pages/020-one/010-first/text/en.md', 'The text of first, put right.\n') });
  const s = stands(t, 'fact-checker', 'check', 'facts');
  assert.equal(s.status, 0, s.out); assert.match(s.out, /recheck, ended pass/);
  t.put('shared/markers.yaml', t.read('shared/markers.yaml').replace('[3, 4]', '[3, 5]'));
  assert.match(stands(t, 'fact-checker', 'check', 'facts').out, /markers\.yaml#m-second changed/);
  t.put('shared/markers.yaml', t.read('shared/markers.yaml').replace('[3, 5]', '[3, 4]'));
  assert.equal(stands(t, 'fact-checker', 'check', 'facts').status, 0, 'put back, it stands again');
  t.put('.plan/faults/020.yaml', '- id: 020-x-1\n  state: open\n');
  assert.match(stands(t, 'fact-checker', 'check', 'facts').out, /faults#open changed/);
});

test('a checker that changes the plan as it passes leaves the makers standing, and its pass settles a faults before it', () => {
  const t = story();
  dispatch(t, 'cartographer', 'draw', 'maps', { changed: ['pages/020-one/'] });
  dispatch(t, 'section-writer', 'write', 'texts', { changed: ['pages/020-one/010-first/text/en.md'] });
  assert.match(dispatch(t, 'section-reviewer', 'review', 'facts', { status: 'faults' }).out, /closed, faults/);
  // a fix by the cartographer, sent with the step of the fault, then the fact checker's pass, which puts the page list right
  dispatch(t, 'cartographer', 'fix', 'facts', { changed: ['.plan/020-one/map.yaml'], work: () => t.put('.plan/020-one/map.yaml', t.read('.plan/020-one/map.yaml').replace('[1, 2, 3, 4]', '[1, 2, 3, 6]')) });
  const edit = () => t.put('.plan/020-one/pages.yaml', t.read('.plan/020-one/pages.yaml').replace('Alpha comes', 'Alpha comes, with a marker added'));
  const sealed = dispatch(t, 'fact-checker', 'check', 'facts', { changed: ['.plan/020-one/pages.yaml'], work: edit });
  assert.match(sealed.out, /section-reviewer.*rechecked by this pass/); assert.match(sealed.out, /section-writer.*taken as it left them/);
  for (const [role, task, step] of [['cartographer', 'draw', 'maps'], ['section-writer', 'write', 'texts'], ['section-reviewer', 'review', 'facts'], ['fact-checker', 'check', 'facts']]) { const s = stands(t, role, task, step); assert.equal(s.status, 0, `${role}: ${s.out}`); }
  assert.doesNotMatch(run(t, 'stands', A, '020').out, /RUNS/);
  // the same edit by no checker's pass is a change upstream
  t.put('.plan/020-one/pages.yaml', t.read('.plan/020-one/pages.yaml').replace('Beta goes', 'Beta goes elsewhere'));
  assert.match(stands(t, 'section-writer', 'write', 'texts').out, /pages\.yaml#second changed/);
});

test('a run that never ended does not stand, nor does a fix, a recheck or a manager', () => {
  const t = story();
  run(t, 'open', A, 'cartographer', '020', '--task', 'draw', '--step', 'maps');
  assert.match(stands(t, 'cartographer', 'draw', 'maps').out, /never ended/);
  assert.match(run(t, 'seal', A, 'cartographer', '020', '--task', 'draw').out, /no new entry/);
  assert.match(stands(t, 'cartographer', 'fix', 'maps').out, /sent because something is open/);
  assert.match(stands(t, 'fact-checker', 'recheck', 'facts').out, /sent because something is open/);
  assert.match(stands(t, 'section-lead', 'build', 'maps').out, /a manager always runs/);
});

test('the list of what stands names each role at its step', () => {
  const t = story();
  dispatch(t, 'cartographer', 'draw', 'maps', { changed: ['pages/020-one/'] });
  dispatch(t, 'fact-checker', 'check', 'facts', { status: 'faults' });
  const out = run(t, 'stands', A, '020').out;
  assert.match(out, /stands {2}020 cartographer at maps/); assert.match(out, /RUNS {4}020 fact-checker at facts: its last run, check, ended faults/);
});

// the hooks, fed what Claude Code hands them
const hook = (t, name, payload) => { const r = spawnSync('node', [path.join(root, 'hooks', name)], { cwd: t.cwd, input: JSON.stringify(payload), encoding: 'utf8' }); return { status: r.status, out: r.stdout, err: r.stderr }; };
const call = (extra = '') => ({ tool_name: 'Agent', tool_input: { subagent_type: 'cartographer', description: 'maps 020 cartographer draw', prompt: `story: ${A}\nsection: "020"\nstep: maps\ntask: draw\nscratchpad: .cache/scratch/x\nserve: static\n${extra}` } });

test('the hooks open a record, close it, and then stop the same dispatch with the last report', () => {
  const t = story();
  const first = hook(t, 'dispatch.mjs', call());
  assert.equal(first.status, 0, first.err); assert.equal(first.out, '', 'the first dispatch starts');
  fs.mkdirSync(path.join(t.plan, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(t.plan, 'reports', '020-cartographer.yaml'), `- step: maps\n  task: draw\n  status: pass\n  changed_files: [content/${A}/pages/020-one/]\n`);
  assert.equal(hook(t, 'dispatch-end.mjs', { ...call(), tool_response: { status: 'async_launched' } }).status, 0);
  assert.match(stands(t, 'cartographer', 'draw', 'maps').out, /never ended/, 'a dispatch in the background is not closed');
  hook(t, 'dispatch-end.mjs', { ...call(), tool_response: { status: 'completed' } });
  const second = hook(t, 'dispatch.mjs', call());
  const answer = JSON.parse(second.out).hookSpecificOutput;
  assert.equal(answer.permissionDecision, 'deny'); assert.match(answer.permissionDecisionReason, /^STILL STANDS, NO AGENT WAS STARTED/); assert.match(answer.permissionDecisionReason, /status: pass/);
  assert.equal(hook(t, 'dispatch.mjs', call('again: true\n')).out, '', 'again: true starts it');
  const fix = { tool_name: 'Agent', tool_input: { subagent_type: 'cartographer', description: 'maps 020 cartographer fix', prompt: `story: ${A}\nsection: "020"\nstep: maps\ntask: fix\nfaults: .plan/faults/020.yaml\nscratchpad: .cache/scratch/x\nserve: static\n` } };
  assert.equal(hook(t, 'dispatch.mjs', fix).out, '', 'a fix starts');
});
