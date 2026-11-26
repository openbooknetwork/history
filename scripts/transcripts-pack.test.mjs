// Tests of the pack that carries a run's transcripts through a pull request. Run from the repo root: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'transcripts-pack.mjs');
const run = (cwd, ...a) => { const r = spawnSync('node', [script, ...a], { cwd, encoding: 'utf8' }); return { status: r.status, out: `${r.stdout}${r.stderr}` }; };

test('a pack holds what is new, a second pack what changed, and an unpack gives each file as it was last packed', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tpack-')), from = path.join(cwd, 'src');
  fs.mkdirSync(path.join(from, 'sess-1', 'subagents'), { recursive: true });
  fs.writeFileSync(path.join(from, 'sess-1.jsonl'), '{"a":1}\n');
  fs.writeFileSync(path.join(from, 'sess-1', 'subagents', 'agent-x.jsonl'), '{"b":1}\n');
  assert.match(run(cwd, 'pack', '--from', from).out, /pack-001\.tar\.gz: 2 transcripts/);
  assert.match(run(cwd, 'pack', '--from', from).out, /nothing new among 2/);
  // the main session grows and a new agent ends: the second archive holds those two alone
  fs.appendFileSync(path.join(from, 'sess-1.jsonl'), '{"a":2}\n');
  fs.writeFileSync(path.join(from, 'sess-1', 'subagents', 'agent-y.jsonl'), '{"c":1}\n');
  assert.match(run(cwd, 'pack', '--from', from).out, /pack-002\.tar\.gz: 2 transcripts/);
  const out = run(cwd, 'unpack', '--to', path.join(cwd, 'back'));
  assert.equal(out.status, 0, out.out); assert.match(out.out, /3 transcripts written/);
  for (const f of ['sess-1.jsonl', 'sess-1/subagents/agent-x.jsonl', 'sess-1/subagents/agent-y.jsonl']) assert.equal(fs.readFileSync(path.join(cwd, 'back', f), 'utf8'), fs.readFileSync(path.join(from, f), 'utf8'), f);
  // an archive that is gone is said, and nothing is called whole
  fs.rmSync(path.join(cwd, 'transcripts-pack', 'pack-002.tar.gz'));
  assert.equal(run(cwd, 'unpack', '--to', path.join(cwd, 'again')).status, 1);
});

test('a folder with no transcripts packs nothing and is no error', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tpack-'));
  const r = run(cwd, 'pack', '--from', path.join(cwd, 'none'));
  assert.equal(r.status, 0); assert.match(r.out, /nothing to pack/); assert.ok(!fs.existsSync(path.join(cwd, 'transcripts-pack')));
});
