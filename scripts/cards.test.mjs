// Tests of the cards agents read in place of code. Run from the repo root: node --test scripts/
// A card is made from the code, and these hold its examples to the code too: every "Try:" line of a script is run,
// the zone library's sample is run, and its manual is held against its methods.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { faults, scriptsOf, entry, toolsCard, apiCard, zonesCard, ZONES_SAMPLE } from './cards.mjs';

const roles = fs.readdirSync(path.join('.claude', 'agents')).filter(n => n.endsWith('.md')).map(n => n.replace(/\.md$/, ''));
const scripts = [...new Set(roles.flatMap(r => scriptsOf(r) ?? []))].sort();

test('every script a definition names has a card entry with a purpose and a usage line', () => assert.deepEqual(faults(), []));

test('every role that names a script gets a card that names each of them', () => {
  for (const role of roles) { const own = scriptsOf(role); if (!own.length) continue; const card = toolsCard(role); for (const s of own) assert.ok(card.includes(`## ${s}`), `${role}: ${s}`); }
});

for (const script of [...scripts, 'scripts/cards.mjs']) for (const call of entry(script).tested ?? []) test(`the example runs: ${call}`, () => {
  const r = spawnSync('sh', ['-c', call], { encoding: 'utf8', timeout: 120000 }), text = `${r.stdout}${r.stderr}`;
  assert.ok([0, 1].includes(r.status), `status ${r.status}: ${text.slice(0, 400)}`);      // 1 is a check that found faults
  assert.ok(!/^usage:/im.test(text), `it printed its usage: ${text.slice(0, 300)}`);
  // a crash ends with status 1 too: a stack trace, node's own last line or a module that is not there
  assert.ok(!/^\s+at .+:\d+:\d+\)?$/m.test(text) && !/^Node\.js v\d/m.test(text) && !/\b(TypeError|ReferenceError|SyntaxError|ENOENT|ERR_MODULE_NOT_FOUND|Cannot find module)\b/.test(text), `it crashed: ${text.slice(0, 400)}`);
});

test('the zone library\'s sample runs, twice to the same files', () => {
  const run = () => { const r = spawnSync('node', [ZONES_SAMPLE], { encoding: 'utf8', timeout: 120000 }); assert.equal(r.status, 0, `${r.stdout}${r.stderr}`); return fs.readdirSync('.cache/zones-sample').sort().map(n => fs.readFileSync(path.join('.cache/zones-sample', n), 'utf8')).join('\n'); };
  assert.equal(run(), run());
});

test('the zone library refuses a shape made of bare points', () => {
  const r = spawnSync('node', ['--input-type=module', '-e', `import { draw } from './scripts/zones-lib.mjs'; const z = draw('alexander-the-great', { out: '.cache/zones-sample', manifest: '.cache/zones-sample/ground.yaml' }); z.region([[1, 2], [3, 4], [5, 6]]);`], { encoding: 'utf8' });
  assert.notEqual(r.status, 0); assert.match(r.stderr, /is no line/);
});

test('a card of a module holds every kind of export', () => {
  const file = path.join('.cache', 'cards-test-module.mjs');
  fs.mkdirSync('.cache', { recursive: true });
  fs.writeFileSync(file, ['// Both of them.', 'export const two = x => one(x, {});', 'export function one(a, { b }) {', '}', 'export const A = 1, B = [1, 2], C = 3;', 'export { one as uno, two };', 'export default one;', 'export const Big = make({', '  a: 1,', '});', ''].join('\n'));
  const got = apiCard(file).exports;
  assert.deepEqual(got.map(e => e.name), ['two', 'one', 'A', 'B', 'C', 'uno', 'two', 'default', 'Big']);
  assert.equal(got[1].comment, 'Both of them.');
  assert.match(got.at(-1).signature, /…$/);
});

test('a unit with no facing, no depth and no id is drawn as the engine draws it', () => {
  const dir = path.join('content', 'alexander-the-great', 'pages');
  assert.ok(fs.existsSync(dir));
  const r = spawnSync('node', ['--input-type=module', '-e', `
    import fs from 'fs'; import path from 'path'; import { spawnSync } from 'child_process';
    const page = path.join('content', 'alexander-the-great', 'pages', '999-cards-test', '010-units');
    fs.mkdirSync(page, { recursive: true });
    fs.writeFileSync(path.join(page, 'page.yaml'), 'bbox: [22, 39, 22.2, 39.2]\\nemblem:\\n  units:\\n    - {side: a, at: [22.1, 39.1], width: 500}\\n    - {side: b, at: [22.1, 39.1], width: 400, name: Second}\\n');
    const r = spawnSync('node', ['scripts/units-check.mjs', 'alexander-the-great', '999'], { encoding: 'utf8' });
    fs.rmSync(path.join('content', 'alexander-the-great', 'pages', '999-cards-test'), { recursive: true });
    process.stdout.write(r.stdout + r.stderr);
  `], { encoding: 'utf8' });
  assert.match(r.stdout, /2 units/); assert.match(r.stdout, /overlap/); assert.match(r.stdout, /Second \(b\)/); assert.doesNotMatch(r.stdout, /Error|undefined \(/);
});

test('the cards of the libraries hold their functions', () => {
  assert.match(zonesCard(), /z\.region\(/); assert.match(zonesCard(), /A sample that runs/);
  const plans = path.join('node_modules', '@openbooknetwork', 'harita', 'src', 'plans.mjs');
  const names = apiCard(plans).exports.map(e => e.name);
  for (const n of ['frame', 'planWriter', 'writePlan']) assert.ok(names.includes(n), `${plans} exports ${n}`);
});
