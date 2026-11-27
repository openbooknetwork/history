// Tests of the one program that saves (scripts/save.mjs) and of the hook that keeps agents from git
// (hooks/commit.mjs), on a made-up story in a temporary git repository. Run from the repo root: node --test scripts/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
const A = 'zz-story', SAVE = path.join(here, 'save.mjs');
// git as the tests see it: no variable of a git that may be running these tests reaches the temporary repository
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
// a repository with one story of one page and a file outside it, all in a first commit
function repo(branch = 'work') {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'save-test-')));
  const git = (...a) => { const r = spawnSync('git', a, { cwd, encoding: 'utf8', env }); assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
  const put = (file, text) => { fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true }); fs.writeFileSync(path.join(cwd, file), text); };
  git('init', '-q', '-b', branch);
  git('config', 'user.name', 'Save Test'); git('config', 'user.email', 'save-test@example.invalid'); git('config', 'commit.gpgsign', 'false');
  put(`content/${A}/story.yaml`, 'title: Test\n');
  put(`content/${A}/pages/010-one/010-first/text/en.md`, 'The text of first.\n');
  put('other.txt', 'outside the story\n');
  git('add', '-A'); git('commit', '-q', '-m', 'first');
  return { cwd, git, put, commits: () => Number(git('rev-list', '--count', 'HEAD')), lock: path.join(cwd, '.git', 'save.lock') };
}
const save = (t, ...a) => { const r = spawnSync('node', [SAVE, ...a], { cwd: t.cwd, encoding: 'utf8', env }); return { status: r.status, out: `${r.stdout}${r.stderr}` }; };
const saveLater = (t, ...a) => new Promise(done => { let out = ''; const c = spawn('node', [SAVE, ...a], { cwd: t.cwd, env }); c.stdout.on('data', d => out += d); c.stderr.on('data', d => out += d); c.on('close', status => done({ status, out })); });

test('a changed file of the story is committed, and a staged file outside it is not', () => {
  const t = repo();
  t.put(`content/${A}/pages/010-one/010-first/text/en.md`, 'The text of first, changed.\n');
  t.put(`content/${A}/pages/010-one/020-second/text/en.md`, 'A new page.\n');
  t.put('other.txt', 'changed by somebody else\n'); t.git('add', 'other.txt');
  const r = save(t, A, '--message', 'zz-story: the texts');
  assert.equal(r.status, 0, r.out); assert.match(r.out, /^saved /);
  assert.equal(t.commits(), 2);
  assert.equal(t.git('log', '-1', '--format=%B'), 'zz-story: the texts', 'the message given and no other line');
  assert.deepEqual(t.git('show', '--name-only', '--format=', 'HEAD').split('\n').sort(), [`content/${A}/pages/010-one/010-first/text/en.md`, `content/${A}/pages/010-one/020-second/text/en.md`]);
  assert.equal(t.git('status', '--porcelain'), 'M  other.txt', 'the other file is staged as it was');
  assert.ok(!fs.existsSync(t.lock));
});

test('with no message it is "<story>: saved", and --also takes a path outside the story', () => {
  const t = repo();
  t.put(`content/${A}/story.yaml`, 'title: Changed\n'); t.put('other.txt', 'changed\n'); t.put('third.txt', 'not named\n');
  const r = save(t, A, '--also', 'other.txt', 'no-such-file.txt');
  assert.equal(r.status, 0, r.out);
  assert.equal(t.git('log', '-1', '--format=%B'), `${A}: saved`);
  assert.deepEqual(t.git('show', '--name-only', '--format=', 'HEAD').split('\n').sort(), [`content/${A}/story.yaml`, 'other.txt']);
  assert.equal(t.git('status', '--porcelain'), '?? third.txt');
});

test('nothing to save', () => {
  const t = repo();
  t.put('other.txt', 'changed, and no part of the story\n');
  const r = save(t, A);
  assert.equal(r.status, 0, r.out); assert.match(r.out, /^nothing to save$/m);
  assert.equal(t.commits(), 1); assert.ok(!fs.existsSync(t.lock));
});

test('two saves started at the same moment both end well, and leave no lock', async () => {
  const t = repo();
  t.put(`content/${A}/story.yaml`, 'title: Changed\n'); t.put(`content/${A}/notes.md`, 'new\n');
  const [a, b] = await Promise.all([saveLater(t, A, '--message', 'one'), saveLater(t, A, '--message', 'two')]);
  assert.equal(a.status, 0, a.out); assert.equal(b.status, 0, b.out);
  assert.ok([2, 3].includes(t.commits()), `${t.commits()} commits`);
  assert.equal(t.git('status', '--porcelain'), ''); assert.ok(!fs.existsSync(t.lock));
});

test('a dead lock is taken', () => {
  const t = repo(), then = new Date(Date.now() - 200000);
  fs.mkdirSync(t.lock); fs.utimesSync(t.lock, then, then);
  t.put(`content/${A}/story.yaml`, 'title: Changed\n');
  const start = Date.now(), r = save(t, A);
  assert.equal(r.status, 0, r.out); assert.ok(Date.now() - start < 30000, 'it did not wait for the lock');
  assert.equal(t.commits(), 2); assert.ok(!fs.existsSync(t.lock));
});

test('--push on main is refused with status 2, and the commit is still made', () => {
  const t = repo('main');
  t.put(`content/${A}/story.yaml`, 'title: Changed\n');
  const r = save(t, A, '--push');
  assert.equal(r.status, 2, r.out); assert.match(r.out, /never pushes main/);
  assert.equal(t.commits(), 2); assert.ok(!fs.existsSync(t.lock));
});

test('a push that fails says so in one line and ends with status 0', () => {
  const t = repo();                                                                 // it has no origin
  t.put(`content/${A}/story.yaml`, 'title: Changed\n');
  const r = save(t, A, '--push');
  assert.equal(r.status, 0, r.out); assert.equal(r.out.trim().split('\n').filter(l => /not pushed/.test(l)).length, 1, r.out);
  assert.equal(r.out.trim().split('\n').length, 2, r.out); assert.equal(t.commits(), 2);
});

test('--dry-run changes nothing', () => {
  const t = repo();
  t.put(`content/${A}/story.yaml`, 'title: Changed\n'); t.put(`content/${A}/notes.md`, 'new\n');
  const before = t.git('status', '--porcelain', '--untracked-files=all');
  const r = save(t, A, '--dry-run', '--message', 'a try');
  assert.equal(r.status, 0, r.out); assert.match(r.out, /would stage: content\/zz-story/); assert.match(r.out, /would commit, as "a try"/); assert.match(r.out, /notes\.md/);
  assert.equal(t.commits(), 1); assert.equal(t.git('status', '--porcelain', '--untracked-files=all'), before); assert.ok(!fs.existsSync(t.lock));
});

test('a story that is not there is an error', () => {
  const r = save(repo(), 'no-such-story');
  assert.equal(r.status, 1); assert.match(r.out, /no story "no-such-story"/);
});

// the hook: status 2 refuses the command, status 0 lets it pass
const hook = (command, agent) => spawnSync('node', [path.join(root, 'hooks', 'commit.mjs')], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command }, ...(agent ? { agent_id: 'a1', agent_type: 'cartographer' } : {}) }), encoding: 'utf8' });

test('inside an agent the hook refuses a git command that writes', () => {
  for (const c of ['git stash -q && node x.mjs', 'git commit -m x -- a', 'node x.mjs; git add a', 'git -C content push origin work', 'git branch -D old', 'ls\ngit checkout -- a', 'git reset --hard']) {
    const r = hook(c, true);
    assert.equal(r.status, 2, c); assert.match(r.stderr, /No agent runs a git command that writes/); assert.match(r.stderr, /scripts\/fault\.mjs since/);
  }
});

test('inside an agent the hook passes a git command that reads, and a command with no git', () => {
  for (const c of ['git diff HEAD -- file', 'git status --short && git log -3', 'git --no-pager show HEAD:a', 'git branch', 'git branch --show-current', 'git rev-parse --git-dir', 'git ls-files content | head', 'node scripts/save.mjs zz-story', 'ls content']) assert.equal(hook(c, true).status, 0, c);
});

test('the main session passes the hook', () => {
  for (const c of ['git commit -m x -- a', 'git stash -q && node x.mjs', 'git add -A']) assert.equal(hook(c, false).status, 0, c);
});
