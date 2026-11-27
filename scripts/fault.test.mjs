// Tests of the log of a story's build: the hooks that write to it and the views made from it (scripts/fault.mjs,
// hooks/capture.mjs, hooks/agent-end.mjs), on a small made-up story in a temporary folder.
// Run from the repo root: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
const A = 'zz-story', TEXT = `content/${A}/pages/020-one/010-first/text/en.md`, PAGE = `content/${A}/pages/020-one/010-first/page.yaml`;
function story({ log = true } = {}) {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'fault-test-')));   // a hook is given real paths
  const put = (file, text) => { fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true }); fs.writeFileSync(path.join(cwd, file), text); };
  put(`content/${A}/story.yaml`, 'title: Test\n');
  put(TEXT, 'Alpha meets Beta on 8 May.\n');
  put(PAGE, 'title: First\n');
  put(`content/${A}/.plans/pages020.mjs`, '// writes page.yaml\n');
  if (log) fs.mkdirSync(path.join(cwd, 'content', A, '.plan', 'log'), { recursive: true });
  return { cwd, put };
}
const run = (cwd, script, args = [], stdin = undefined) => { const r = spawnSync('node', [path.join(root, script), ...args], { cwd, encoding: 'utf8', input: stdin }); return { status: r.status, out: `${r.stdout}${r.stderr}`.trim() }; };
const fault = (cwd, ...args) => run(cwd, 'scripts/fault.mjs', args);
const hook = (cwd, name, input) => run(cwd, `hooks/${name}.mjs`, [], JSON.stringify(input));
const lines = cwd => { const d = path.join(cwd, 'content', A, '.plan', 'log'); return fs.existsSync(d) ? fs.readdirSync(d).flatMap(n => fs.readFileSync(path.join(d, n), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))) : []; };
const edit = (cwd, role, file, old, now, id = 'a1') => hook(cwd, 'capture', { hook_event_name: 'PostToolUse', tool_name: 'Edit', agent_id: id, agent_type: role, tool_input: { file_path: path.join(cwd, file), old_string: old, new_string: now } });
const bash = (cwd, role, id = 'a1') => hook(cwd, 'capture', { hook_event_name: 'PostToolUse', tool_name: 'Bash', agent_id: id, agent_type: role, tool_input: { command: 'x' } });
const pause = () => spawnSync('node', ['-e', 'setTimeout(()=>{},15)']);

test('an Edit is written to the log with its old and new text, and only for a story that has a log', () => {
  const { cwd } = story();
  edit(cwd, 'fact-checker', TEXT, '8 May', '8 September');
  const [e] = lines(cwd);
  assert.equal(e.type, 'edit'); assert.equal(e.role, 'fact-checker'); assert.equal(e.agent, 'a1'); assert.equal(e.section, '020');
  assert.equal(e.file, TEXT); assert.equal(e.old, '8 May'); assert.equal(e.new, '8 September');
  const none = story({ log: false });
  edit(none.cwd, 'fact-checker', TEXT, '8 May', '8 September');
  assert.equal(lines(none.cwd).length, 0);
});

test('a file a command changed is found by comparing the folder, and a generated file is marked', () => {
  const { cwd, put } = story();
  bash(cwd, 'cartographer');                       // the first capture only takes note of the folder
  assert.equal(lines(cwd).length, 0);
  pause(); put(PAGE, 'title: First page\n'); put(TEXT, 'Alpha meets Beta on 8 September.\n');
  bash(cwd, 'cartographer');
  const got = lines(cwd);
  assert.deepEqual(got.map(e => e.file).sort(), [PAGE, TEXT].sort());
  assert.ok(got.every(e => e.whole && e.by === 'command' && e.role === 'cartographer'));
  assert.equal(got.find(e => e.file === PAGE).generated, true);
  assert.equal(got.find(e => e.file === TEXT).generated, undefined);
  bash(cwd, 'cartographer');                       // nothing changed since
  assert.equal(lines(cwd).length, 2);
  pause(); put(PAGE, 'title: First page\n');       // a generator writes its file again, with what it held
  bash(cwd, 'cartographer');
  assert.equal(lines(cwd).length, 2);
  assert.match(fault(cwd, 'why', A, '020', '--by', 'cartographer').out, /^1 edits/);   // the text, and not the generated page
});

test('a change an Edit hook wrote is not written again by the next command', () => {
  const { cwd, put } = story();
  bash(cwd, 'fact-checker');
  pause(); put(TEXT, 'Alpha meets Beta on 8 September.\n');
  edit(cwd, 'fact-checker', TEXT, '8 May', '8 September');
  bash(cwd, 'fact-checker');
  assert.equal(lines(cwd).length, 1);
});

test('a why is owed by a checker, and by a maker only outside its own files', () => {
  const { cwd } = story();
  edit(cwd, 'fact-checker', TEXT, '8 May', '8 September');
  edit(cwd, 'section-writer', TEXT, 'Alpha', 'Alfa', 'a2');
  edit(cwd, 'section-writer', PAGE, 'First', 'The first', 'a2');
  assert.match(fault(cwd, 'why', A, '020', '--by', 'fact-checker').out, /^1 edits of fact-checker in 020 owe a why/);
  const writer = fault(cwd, 'why', A, '020', '--by', 'section-writer').out;
  assert.match(writer, /^1 edits/); assert.match(writer, /page\.yaml/); assert.doesNotMatch(writer, /text\/en\.md/);
  const id = lines(cwd).find(e => e.role === 'fact-checker').id;
  assert.equal(fault(cwd, 'why', A, '020', '--by', 'fact-checker', id, '--severity', 'wrong', '--kind', 'fact').status, 2);
  const told = fault(cwd, 'why', A, '020', '--by', 'fact-checker', id, '--severity', 'wrong', '--kind', 'fact', '--source', 'Cagny l. 412');
  assert.equal(told.status, 0); assert.match(told.out, /0 still owe a why/);
  assert.match(fault(cwd, 'why', A, '020', '--by', 'fact-checker').out, /^no edit/);
  assert.equal(fault(cwd, 'why', A, '020', '--by', 'fact-checker', 'nosuch', '--severity', 'weak', '--kind', 'fact', '--source', 'x').status, 2);
});

test('an ask is open until its owner replies, and closed when the asker agrees', () => {
  const { cwd } = story();
  const id = fault(cwd, 'ask', A, '020', '--by', 'fact-checker', '--for', 'cartographer', '--what', 'Lagny has no marker').out.split(':')[0];
  fault(cwd, 'ask', A, '020', '--by', 'fact-checker', '--for', 'user', '--what', 'Cagny or Monstrelet for the date?');
  assert.match(fault(cwd, 'asks', A, '020', '--for', 'cartographer').out, /Lagny has no marker/);
  assert.equal(fault(cwd, 'line', A, '020', '--by', 'fact-checker').out, 'ok 1 1');
  assert.equal(fault(cwd, 'line', A, '020', '--by', 'cartographer').out, 'ok 1 0');
  assert.equal(fault(cwd, 'reply', A, id, '--by', 'cartographer', 'declined').status, 2);
  fault(cwd, 'reply', A, id, '--by', 'cartographer', 'done');
  assert.match(fault(cwd, 'asks', A, '020', '--for', 'cartographer').out, /^nothing is open/);
  assert.equal(fault(cwd, 'line', A, '020', '--by', 'fact-checker').out, 'ok 1 1');          // answered, not yet agreed to
  fault(cwd, 'reply', A, id, '--by', 'fact-checker', 'again', '--why', 'the marker is on the wrong bank');
  assert.match(fault(cwd, 'asks', A, '020', '--for', 'cartographer').out, /Lagny/);
  fault(cwd, 'reply', A, id, '--by', 'cartographer', 'done');
  fault(cwd, 'reply', A, id, '--by', 'fact-checker', 'agreed');
  assert.equal(fault(cwd, 'line', A, '020', '--by', 'fact-checker').out, 'ok 0 1');
  assert.equal(fault(cwd, 'line', A, '020', '--by', 'cartographer').out, 'ok 0 0');
});

test('since holds what others changed in a checker\'s files after its last run, and not its own edits', () => {
  const { cwd } = story();
  const transcript = path.join(cwd, 't.jsonl');
  fs.writeFileSync(transcript, JSON.stringify({ type: 'user', message: { content: `story: ${A}\nsection: "020"\nstep: facts\ntask: check\nscratchpad: /tmp/x` } }) + '\n');
  edit(cwd, 'section-writer', TEXT, 'Alpha', 'Alfa', 'a0');                 // before the check: not news to it
  pause(); edit(cwd, 'fact-checker', TEXT, '8 May', '8 September');
  const stop = extra => hook(cwd, 'agent-end', { hook_event_name: 'SubagentStop', agent_id: 'a1', agent_type: 'fact-checker', agent_transcript_path: transcript, ...extra });
  const refused = stop({ last_assistant_message: 'all done' });                 // an edit with no why, and no line
  assert.equal(refused.status, 2); assert.match(refused.out, /1 of your edits owe a why/); assert.match(refused.out, /End with this line/);
  assert.ok(!lines(cwd).some(e => e.type === 'end'));
  const id = lines(cwd).find(e => e.role === 'fact-checker').id;
  fault(cwd, 'why', A, '020', '--by', 'fact-checker', id, '--severity', 'wrong', '--kind', 'fact', '--source', 'Cagny l. 412');
  assert.equal(stop({ last_assistant_message: 'ok 1 0' }).status, 2);            // the wrong line
  pause(); assert.equal(stop({ last_assistant_message: 'ok 0 0' }).status, 0);
  const end = lines(cwd).find(e => e.type === 'end');
  assert.equal(end.role, 'fact-checker'); assert.equal(end.task, 'check'); assert.equal(end.step, 'facts'); assert.equal(end.section, '020');
  const report = fs.readFileSync(path.join(cwd, 'content', A, '.plan', 'reports', '020-fact-checker.yaml'), 'utf8');
  assert.match(report, /status: pass/); assert.match(report, /text\/en\.md/);
  assert.match(fault(cwd, 'since', A, '020', '--for', 'fact-checker').out, /^nothing changed/);
  pause(); edit(cwd, 'section-reviewer', TEXT, 'Beta', 'Beta, his brother,', 'a3');
  pause(); edit(cwd, 'cartographer', PAGE, 'First', 'The first', 'a4');
  const news = fault(cwd, 'since', A, '020', '--for', 'fact-checker').out;
  assert.match(news, /his brother/); assert.match(news, /by section-reviewer, with no why yet/);
  assert.doesNotMatch(news, /page\.yaml/); assert.doesNotMatch(news, /September/);
  assert.match(fault(cwd, 'since', A, '020', '--for', 'map-auditor').out, /page\.yaml/);
});

test('a story with no log has nothing open, and the views say so', () => {
  const { cwd } = story({ log: false });
  assert.match(fault(cwd, 'asks', A, '020', '--for', 'cartographer').out, /^nothing is open/);
  assert.equal(fault(cwd, 'line', A, '020', '--by', 'fact-checker').out, 'ok 0 0');
});

test('every reason of a run goes in with one call from a file, and nothing is written where an entry is wrong', async () => {
  const { cwd, put } = story();
  edit(cwd, 'fact-checker', TEXT, '8 May', '7 May'); edit(cwd, 'fact-checker', TEXT, 'Alpha', 'Alfa'); edit(cwd, 'fact-checker', TEXT, 'Beta', 'Bета');
  const ids = lines(cwd).filter(e => e.type === 'edit').map(e => e.id);
  put('why.yaml', `- edits: [${ids[0]}, nope12]\n  severity: wrong\n  kind: date\n  source: "a.txt: 7 May"\n- edits: [${ids[1]}]\n  severity: big\n  kind: name\n`);
  const bad = fault(cwd, 'why', A, '020', '--by', 'fact-checker', '--from', 'why.yaml');
  assert.equal(bad.status, 2);
  assert.match(bad.out, /nothing was written/); assert.match(bad.out, /entry 1: no edit has the id nope12/);
  assert.match(bad.out, /entry 2: severity is wrong, weak or taste/); assert.match(bad.out, /entry 2: kind and source are both needed/);
  assert.equal(lines(cwd).filter(e => e.type === 'why').length, 0);
  put('why.yaml', `- edits: [${ids[0]}, ${ids[1]}]\n  severity: wrong\n  kind: date\n  source: "a.txt: 7 May"\n- edits: [${ids[2]}]\n  severity: taste\n  kind: name\n  source: "b.txt: Beta"\n`);
  const good = fault(cwd, 'why', A, '020', '--by', 'fact-checker', '--from', 'why.yaml');
  assert.equal(good.status, 0); assert.match(good.out, /2 reasons written for 3 edits. 0 of fact-checker's edits in 020 still owe a why/);
});

test('two agents of one role work side by side: each owes the reasons of its own edits alone', async () => {
  const { cwd } = story();
  edit(cwd, 'fact-checker', TEXT, '8 May', '7 May', 'one'); edit(cwd, 'fact-checker', TEXT, 'Alpha', 'Alfa', 'two');
  const { events, unexplained } = await import('./fault.mjs');
  const all = events(path.join(cwd, 'content', A));
  assert.equal(unexplained(all, 'fact-checker', '020').length, 2);
  assert.deepEqual(unexplained(all, 'fact-checker', '020', 'one').map(e => e.new), ['7 May']);
  assert.deepEqual(unexplained(all, 'fact-checker', '020', 'two').map(e => e.new), ['Alfa']);
});
