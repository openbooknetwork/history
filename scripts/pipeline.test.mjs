// Tests of the table of the pipeline's work, scripts/pipeline.mjs: that it agrees with the definitions, that each
// kind of file has one checker with the last word, and that no start-up list passes its budget.
// Run from the repo root: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { PIPELINE, VIEWS, KINDS, NEEDS, viewName, graph, waves } from './pipeline.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
const units = Object.entries(PIPELINE).flatMap(([role, tasks]) => Object.entries(tasks).map(([task, e]) => [role, task, e]));
// A token is counted as 3.2 characters, the ratio of the story's plan files. It is an estimate.
const TOKEN = 3.2;

test('a role of the table has the tasks its definition lists, and no other', () => {
  for (const [role, tasks] of Object.entries(PIPELINE)) {
    const text = fs.readFileSync(path.join(root, '.claude', 'agents', `${role}.md`), 'utf8');
    const listed = [...(text.match(/[Yy]our task is\s+([^.:]*)/)?.[1] ?? '').matchAll(/`([\w-]+)`/g)].map(m => m[1]).sort();
    assert.deepEqual(Object.keys(tasks).sort(), listed, `${role}: the table and .claude/agents/${role}.md name different tasks`);
  }
});

test('an entry names only views and kinds the table knows', () => {
  for (const [role, task, e] of units) {
    assert.ok(['maker', 'checker', 'manager'].includes(e.kind), `${role}.${task}: kind ${e.kind}`);
    assert.ok(['section', 'all', 'battle'].includes(e.scope), `${role}.${task}: scope ${e.scope}`);
    for (const v of e.reads) assert.ok(VIEWS[viewName(v)], `${role}.${task} reads ${v}, which is no view`);
    for (const k of [...(e.makes ?? []), ...(e.settles ?? [])]) assert.ok(KINDS[k], `${role}.${task} names the kind ${k}, which the table does not know`);
    assert.ok(Number.isFinite(e.budget) && e.budget > 0, `${role}.${task} has no budget`);
  }
});

test('each kind of file has one checker with the last word', () => {
  const by = {};
  for (const [role, , e] of units) for (const k of e.settles ?? []) (by[k] ??= new Set()).add(role);
  for (const [k, roles] of Object.entries(by)) assert.equal(roles.size, 1, `${k} is settled by ${[...roles].join(' and ')}`);
});

// The Read tool gives 25,000 tokens a call, and the digest's long lines run near two characters a token. The
// two views below are over that today and are to be cut by page (improvements-spec.md, 3): no other file may be.
const READ_CAP = 50000, SPLIT_LATER = /^((passages|research)-\d{3}(-part)?\.md|research\.md|names\.md|sources\.md|map-keeper-borders\.md)$/;

// The lists are measured on a section of a built story. Where the story is not in the tree, the test is skipped.
// A role of one section is measured on 050, a role of a battle on Patay in 040, and a role of the whole story on all.
const STORY = 'joan-of-arc', SECTION = '050', BATTLE = ['040', 'patay-1429'];
const built = fs.existsSync(path.join(root, 'content', STORY, '.plan', `${SECTION}-paris-and-compiegne`));
export function measure(role, task) {
  const scope = PIPELINE[role][task].scope;
  const where = scope === 'all' ? ['all'] : scope === 'battle' ? [BATTLE[0], '--battle', BATTLE[1]] : [SECTION];
  const r = spawnSync('node', [path.join(here, 'brief.mjs'), STORY, role, ...where, '--task', task], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`brief.mjs ${role} ${task}: ${r.stderr}`);
  const files = [...r.stdout.matchAll(/^ {2}(\S.*?) {2}\(\d+ lines\)$/gm)].map(m => m[1]);
  const size = f => fs.statSync(path.join(root, f)).size;
  const total = files.reduce((n, f) => n + size(f), 0) + size(path.join('.claude', 'agents', `${role}.md`));
  return { files, tokens: Math.round(total / TOKEN), largest: files.map(f => [size(f), f]).sort((a, b) => b[0] - a[0])[0] };
}

test('no start-up list passes its budget', { skip: !built && `${STORY} is not in this tree` }, () => {
  for (const [role, task, e] of units) {
    const m = measure(role, task);
    assert.ok(m.tokens <= e.budget * 1000, `${role}.${task} reads about ${m.tokens} tokens, over its budget of ${e.budget}k. Its largest file is ${m.largest[1]} (${m.largest[0]} characters).`);
    for (const f of m.files) assert.ok(fs.statSync(path.join(root, f)).size <= READ_CAP || SPLIT_LATER.test(path.basename(f)), `${role}.${task} lists ${f}, which the Read tool cannot give in one call`);
  }
});

test('each need names a first run of the table, and the needs of the whole pipeline go round in no circle', () => {
  for (const [id, needs] of Object.entries(NEEDS)) for (const x of [id, ...needs]) {
    const [role, task] = x.split('.');
    assert.ok(PIPELINE[role]?.[task], `${id} names ${x}, which is no task of the table`);
    assert.ok(!['fix', 'recheck'].includes(task), `${x}: a fix and a recheck are the gate's, and have no needs`);
  }
  const steps = [...new Set(units.map(([, , e]) => e.step))];
  const order = waves(graph({ steps, scopes: ['all', 'section', 'battle'], battles: ['b'] })).flat();
  assert.equal(order.length, Object.keys(NEEDS).length);
  for (const [id, needs] of Object.entries(NEEDS)) for (const n of needs)
    assert.ok(order.findIndex(x => x.startsWith(n)) < order.findIndex(x => x.startsWith(id)), `${id} comes before ${n}`);
});

test('a section\'s build starts with the drawing, and its fact check waits for the texts, the images and each battle', () => {
  const nodes = graph({ battles: ['a', 'b'] }), by = Object.fromEntries(nodes.map(n => [n.id, n]));
  assert.deepEqual(waves(nodes)[0], ['cartographer.draw']);
  assert.deepEqual(by['fact-checker.check'].needs, ['section-writer.write', 'image-finder.find', 'battle-auditor.audit:a', 'battle-auditor.audit:b']);
  assert.deepEqual(by['battle-auditor.audit:b'].needs, ['battle-implementor.build:b']);
  assert.deepEqual(graph().find(n => n.id === 'fact-checker.check').needs, ['section-writer.write', 'image-finder.find']);
});

test('needs that go round in a circle are an error that names the circle', () => {
  const nodes = [{ id: 'a', needs: ['c'] }, { id: 'b', needs: ['a'] }, { id: 'c', needs: ['b'] }, { id: 'd', needs: [] }];
  assert.throws(() => waves(nodes), /circle.*a -> c -> b -> a/);
});

test('a task that runs a page each is a node for each page, and what needs it waits for them all', () => {
  const nodes = graph({ pages: ['a', 'b'] }), by = Object.fromEntries(nodes.map(n => [n.id, n]));
  assert.deepEqual(by['fact-checker.check:a'].needs, ['section-writer.write', 'image-finder.find']);
  assert.equal(by['fact-checker.check:b'].page, 'b');
  assert.deepEqual(by['section-reviewer.review'].needs, ['fact-checker.check:a', 'fact-checker.check:b']);
  assert.ok(!by['fact-checker.check']);
});

test('a start-up list cut to a page holds that page\'s passages, files, card and captions, and no other page\'s', () => {
  const r = spawnSync('node', [path.join(here, 'brief.mjs'), 'joan-of-arc', 'fact-checker', '050', '--task', 'check', '--pages', 'paris'], { cwd: root, encoding: 'utf8' });
  const files = r.stdout.split('\n').map(l => l.trim().split('  ')[0]).filter(l => /^(content|\.cache)\//.test(l));
  assert.ok(files.some(f => f.endsWith('020-paris/text/en.md')) && files.some(f => f.endsWith('paris-1429/battle.yaml')));
  assert.ok(files.some(f => /passages-050-paris(-\d+)?\.md$/.test(f)) && files.some(f => f.endsWith('050-text-paris.yaml')));
  assert.ok(files.some(f => /images\/paris-.*\/image\.yaml$/.test(f)));
  for (const f of files) assert.ok(!/montepilloy|compiegne-|melun|saint-pierre|back-to-the-loire/.test(f.replace('050-paris-and-compiegne', '')), `${f} is of another page`);
});
