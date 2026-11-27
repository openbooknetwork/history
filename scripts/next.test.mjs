// Tests of the gate of a section, scripts/next.mjs, on a small made-up story in a temporary folder.
// Run from the repo root: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = 'zz-story', TEXT = `content/${A}/pages/020-one/010-first/text/en.md`, PAGE = `content/${A}/pages/020-one/010-first/page.yaml`;
function story() {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'next-test-')));
  for (const [f, t] of [[`content/${A}/story.yaml`, 'title: Test\n'], [TEXT, 'Alpha.\n'], [PAGE, 'title: First\n']]) { fs.mkdirSync(path.dirname(path.join(cwd, f)), { recursive: true }); fs.writeFileSync(path.join(cwd, f), t); }
  fs.mkdirSync(path.join(cwd, 'content', A, '.plan', 'log'), { recursive: true });
  return cwd;
}
const run = (cwd, script, args, stdin) => { const r = spawnSync('node', [path.join(root, script), ...args], { cwd, encoding: 'utf8', input: stdin }); return { status: r.status, out: `${r.stdout}${r.stderr}`.trim() }; };
const fault = (cwd, ...args) => run(cwd, 'scripts/fault.mjs', args);
const next = cwd => run(cwd, 'scripts/next.mjs', [A, '020']);
const edit = (cwd, role, file, old, now) => run(cwd, 'hooks/capture.mjs', [], JSON.stringify({ tool_name: 'Edit', agent_id: 'a1', agent_type: role, tool_input: { file_path: path.join(cwd, file), old_string: old, new_string: now } }));

test('a section with nothing in its log is done', () => {
  const r = next(story());
  assert.equal(r.status, 0); assert.match(r.out, /^nothing: 020 is done/);
});

test('an open ask lists its owner, an answered one its checker, and an agreed one nothing', () => {
  const cwd = story();
  const id = fault(cwd, 'ask', A, '020', '--by', 'fact-checker', '--for', 'cartographer', '--what', 'Lagny has no marker').out.split(':')[0];
  let r = next(cwd);
  assert.equal(r.status, 1); assert.match(r.out, new RegExp(`020  fix      cartographer: 1 open, ${id}`));
  fault(cwd, 'reply', A, id, '--by', 'cartographer', 'done');
  r = next(cwd);
  assert.match(r.out, /020  recheck  fact-checker: 0 changes by others in its files, 1 of its asks answered/); assert.doesNotMatch(r.out, /fix/);
  fault(cwd, 'reply', A, id, '--by', 'fact-checker', 'agreed');
  assert.equal(next(cwd).status, 0);
});

test('an ask of a role with no recheck is the manager\'s to agree to, and one for the user waits for a ruling', () => {
  const cwd = story();
  const id = fault(cwd, 'ask', A, '020', '--by', 'section-writer', '--for', 'cartographer', '--what', 'a marker is missing').out.split(':')[0];
  fault(cwd, 'reply', A, id, '--by', 'cartographer', 'done');
  fault(cwd, 'ask', A, '020', '--by', 'fact-checker', '--for', 'user', '--what', 'Cagny or Monstrelet?');
  const r = next(cwd);
  assert.match(r.out, new RegExp(`020  agree    ${id}, from section-writer, done by cartographer`));
  assert.match(r.out, /020  rule     user: \w+, from fact-checker: Cagny or Monstrelet\?/);
});

test('another agent\'s edit lists the one checker of that kind of file, and an edit without its reason is listed', () => {
  const cwd = story();
  edit(cwd, 'section-reviewer', TEXT, 'Alpha', 'Alfa');
  edit(cwd, 'fact-checker', PAGE, 'First', 'The first');
  const r = next(cwd);
  assert.match(r.out, /020  recheck  fact-checker: 1 changes by others in its files/);
  assert.match(r.out, /020  recheck  map-auditor: 1 changes by others in its files/);
  assert.match(r.out, /020  why      section-reviewer: 1 edits owe a reason/);
  assert.match(r.out, /020  why      fact-checker: 1 edits owe a reason/);
});
