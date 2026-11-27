// Tests of scripts/generated-check.mjs, on a small made-up story in a temporary folder.
// Run from the repo root: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = 'zz-story', MARKERS = `content/${A}/pages/020-one/010-first/markers.yaml`, GEN = `content/${A}/.plans/pages020.mjs`;
function story(image = 'coin-3f9a1c') {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'generated-test-')));
  const put = (f, t) => { fs.mkdirSync(path.dirname(path.join(cwd, f)), { recursive: true }); fs.writeFileSync(path.join(cwd, f), t); };
  put(`content/${A}/story.yaml`, 'title: Test\n');
  put(`content/${A}/.plan/images/020.yaml`, '- placeholder: coin\n  image: coin-3f9a1c\n');
  put(MARKERS, `here:\n  image: ${image}\n`);
  put(GEN, `import fs from 'fs';\nfs.writeFileSync('${MARKERS}', "here:\\n  image: ${image}\\n");\n`);
  return { cwd, put };
}
const check = (cwd, ...args) => { const r = spawnSync('node', [path.join(root, 'scripts/generated-check.mjs'), A, ...args], { cwd, encoding: 'utf8' }); return { status: r.status, out: `${r.stdout}${r.stderr}`.trim() }; };

test('a story with its images in place, and generators that write what is on disk, is ok', () => {
  const r = check(story().cwd);
  assert.equal(r.status, 0); assert.match(r.out, /^ok: no placeholder is left/);
});

test('a placeholder left in a marker and in its generator is found in both', () => {
  const r = check(story('coin').cwd);
  assert.equal(r.status, 1);
  assert.match(r.out, /markers\.yaml:2: the placeholder coin still stands, and its image is coin-3f9a1c/);
  assert.match(r.out, /pages020\.mjs:2: the placeholder coin still stands/);
});

test('a generated file changed by hand is found, and is left as it was', () => {
  const { cwd, put } = story();
  put(MARKERS, 'here:\n  image: coin-3f9a1c\n  note: by hand\n');
  const r = check(cwd);
  assert.equal(r.status, 1); assert.match(r.out, /markers\.yaml: differs from what pages020\.mjs writes/);
  assert.match(fs.readFileSync(path.join(cwd, MARKERS), 'utf8'), /by hand/);
  assert.equal(check(cwd, '--no-run').status, 0);
});
