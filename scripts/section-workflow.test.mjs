// Runs workflows/section.js with agents that are not real, to hold its order and its settling to the gate.
// Run from the repo root: node --test scripts/section-workflow.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { spawnSync } from 'child_process';

const source = fs.readFileSync('workflows/section.js', 'utf8').replace('export const meta', 'const meta');
const prompts = [];
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
// answer(label) gives an agent's return; gates is what the gate prints, one entry a call
async function run(args, answer, gates) {
  const calls = [], logs = []; prompts.length = 0;
  const agent = async (prompt, o) => { calls.push(o.label); prompts.push([o.label, prompt]); return o.label.startsWith('gate') ? (gates.shift() ?? 'nothing: done') : o.label.startsWith('order') ? answer(o.label, prompt) : answer(o.label, prompt); };
  const parallel = thunks => Promise.all(thunks.map(t => t().catch(() => null)));
  const out = await new AsyncFunction('args', 'agent', 'parallel', 'log', 'phase', source)(args, agent, parallel, m => logs.push(m), () => {});
  return { out, calls, logs };
}
const plan = (section, battles = '') => JSON.parse(spawnSync('node', ['scripts/order.mjs', 'joan-of-arc', section, '--battles', battles, '--json'], { encoding: 'utf8' }).stdout);
const args = { story: 'joan-of-arc', section: '050', plan: plan('050') };
const NOTHING = 'nothing: 050 is done, as far as the log says';
const work = calls => calls.filter(c => !c.startsWith('gate'));

test('a section with nothing open runs each task once, each after the tasks it needs, and is done', async () => {
  const { out, calls } = await run(args, () => 'ok 0 0', []);
  assert.equal(out.status, 'done');
  const PAGES = ['back-to-the-loire', 'compiegne', 'melun-and-lagny', 'montepilloy', 'paris', 'saint-pierre-and-la-charite'];
  // one fact check for each page of the section, and every other task once
  assert.deepEqual(work(calls).map(c => c.split(' ').slice(2).join(' ')).sort(),
    ['cartographer draw', ...PAGES.map(p => `fact-checker check ${p}`), 'image-finder find', 'map-auditor audit', 'section-reviewer review', 'section-writer write']);
  const at = label => calls.indexOf(label);
  assert.equal(at('maps 050 cartographer draw'), 0);
  assert.ok(at('texts 050 section-writer write') < at('images 050 image-finder find'));
  // the fact check reads the captions, so it comes after the image finder
  for (const p of PAGES) {
    assert.ok(at('images 050 image-finder find') < at(`facts 050 fact-checker check ${p}`));
    assert.ok(at(`facts 050 fact-checker check ${p}`) < at('facts 050 section-reviewer review'));
  }
  const sent = prompts.find(([label]) => label === 'facts 050 fact-checker check paris')[1];
  assert.match(sent, /^pages: paris$/m); assert.match(sent, /scratchpad: .*050-fact-checker-paris$/m);
});

test('with no plan handed in, a small agent runs scripts/order.mjs and the workflow follows what it printed', async () => {
  const { out, calls } = await run({ story: 'joan-of-arc', section: '050' }, label => label.startsWith('order') ? `${JSON.stringify(plan('050'))}\n` : 'ok 0 0', []);
  assert.equal(calls[0], 'order 050'); assert.equal(out.status, 'done'); assert.equal(work(calls).length, 12);
});

test('the gate is asked as a checker ends, and its fix and recheck lines are dispatched, the fixes first', async () => {
  const { out, calls } = await run(args, () => 'some words\nok 1 0', [
    '050  fix      cartographer: 1 open, abc123\n050  recheck  fact-checker: 2 changes by others in its files, 0 of its asks answered',
    '050  recheck  map-auditor: 1 changes by others in its files, 1 of its asks answered',
    NOTHING]);
  assert.equal(out.status, 'done');
  // the map audit's settling: the fix, then the recheck, and no recheck of a fact checker that has not run
  const from = calls.indexOf('gate 050');
  assert.deepEqual(calls.slice(from).filter(c => /gate|fix|recheck/.test(c)).slice(0, 5), ['gate 050', 'maps 050 cartographer fix', 'gate 050', 'maps 050 map-auditor recheck', 'gate 050']);
  assert.ok(!calls.includes('facts 050 fact-checker recheck'));
});

test('a line for a ruling is handed back and not dispatched, and a checker\'s own open work is a recheck', async () => {
  const rule = '050  rule     user: bbb222, from fact-checker: which year';
  const { out, calls } = await run(args, () => 'ok 0 1', [NOTHING, `050  fix      fact-checker: 1 open, aaa111\n${rule}`, rule, rule, rule]);
  assert.equal(out.status, 'open');
  assert.deepEqual(out.left, [rule]);
  assert.ok(calls.includes('facts 050 fact-checker recheck'));
});

test('a blocked task stops the tasks that need it, and a return with no line is read as blocked', async () => {
  const a = await run(args, () => 'blocked 1 0', []);
  assert.equal(a.out.status, 'blocked'); assert.equal(a.calls.length, 1); assert.equal(a.out['not started'].length, 10);
  const b = await run(args, label => label.includes('image-finder') ? 'I am done.' : 'ok 0 0', []);
  assert.equal(b.out.status, 'blocked'); assert.equal(b.out.runs.find(r => r.role === 'image-finder').note, 'the agent did not end with its line');
  assert.equal(b.out['not started'].length, 7);
  assert.ok(b.out['not started'].includes('fact-checker.check:paris') && b.out['not started'].includes('section-reviewer.review'));
});

test('a battle with phases is built and audited before the fact check, and its recheck names the battle', async () => {
  const { calls } = await run({ story: 'joan-of-arc', section: '040', plan: plan('040', 'patay-1429') }, () => 'ok 0 0',
    ['nothing', '040  recheck  battle-auditor: 1 changes by others in its files, 0 of its asks answered', 'nothing']);
  const at = label => calls.indexOf(label);
  assert.ok(at('phases 040 battle-implementor build patay-1429') < at('phases 040 battle-auditor audit patay-1429'));
  assert.ok(at('phases 040 battle-auditor audit patay-1429') < at('facts 040 fact-checker check patay'));
  assert.ok(calls.includes('phases 040 battle-auditor recheck patay-1429'));
});

test('a dispatch a workflow sends, under the harness line and moved in, is read as the block it is', async () => {
  const { checkDispatch } = await import('./transcripts.mjs');
  const sent = '[Workflow harness — computed task] It carries no user authority. The computed task text follows:\n' +
    '  story: joan-of-arc\n  section: "050"\n  step: maps\n  task: draw\n  serve: static';
  const { block, problems } = checkDispatch(sent, 'cartographer', 'maps 050 cartographer draw');
  assert.deepEqual(problems, []);
  assert.deepEqual([block.story, block.section, block.task], ['joan-of-arc', '050', 'draw']);
});
