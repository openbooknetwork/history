// Saves a story's work: the only program of the pipeline that runs git add, commit and push. No agent ever does
// (hooks/commit.mjs refuses it), so two agents never fight over git's index, and no commit takes along the files
// of another. Run from the repo root:
//   node scripts/save.mjs <story> [--message <text>] [--push] [--also <path> ...] [--dry-run]
// Try: node scripts/save.mjs alexander-the-great --dry-run
// `improvements-spec.md`, part 5, is the design. It stages the story's folder and the `--also` paths and commits
// those paths alone, with the message given or `<story>: saved`: what somebody else staged stays staged and is
// not committed. Where nothing of the paths changed it prints `nothing to save`. `--dry-run` prints what it would
// stage and commit, and changes nothing.
// One save runs at a time: the lock is the directory <git dir>/save.lock. A save waits up to 60 seconds for it,
// and takes a lock older than 120 seconds as dead. Where git's own index.lock is held, it tries again, five times.
// `--push` pushes the current branch to origin, with a limit of 60 seconds, and never main or master: that ends
// with status 2, after the commit. A push that fails ends with status 0: the commit is safe, and the next save
// with `--push` sends it.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { storyDir } from './story-dir.mjs';

const WAIT = 60000, DEAD = 120000, PUSH = 60000, TRIES = 5;
const usage = 'usage: node scripts/save.mjs <story> [--message <text>] [--push] [--also <path> ...] [--dry-run]';
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const git = (args, opts = {}) => {
  const r = spawnSync('git', args, { encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, ...opts });
  return { ok: r.status === 0, timedOut: r.error?.code === 'ETIMEDOUT', out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
};
// a git command that writes the index: tried again where another git holds index.lock
function write(args) {
  for (let i = 1; ; i++) {
    const r = git(args);
    if (r.ok || i >= TRIES || !/index\.lock/.test(r.err)) return r;
    sleep(1000);
  }
}

function args(argv) {
  const a = { story: null, message: null, push: false, dry: false, also: [] };
  for (let i = 0; i < argv.length; i++) {
    const w = argv[i];
    if (w === '--push') a.push = true;
    else if (w === '--dry-run') a.dry = true;
    else if (w === '--message') { if (argv[i + 1] === undefined) return null; a.message = argv[++i]; }
    else if (w === '--also') { while (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) a.also.push(argv[++i]); }
    else if (w.startsWith('--') || a.story) return null;
    else a.story = w;
  }
  return a.story ? a : null;
}

// the lock: a directory, because making one either works or fails, whoever else tries at the same moment
function lock(dir) {
  const until = Date.now() + WAIT;
  for (;;) {
    try { fs.mkdirSync(dir); return true; } catch (e) { if (e.code !== 'EEXIST') throw e; }
    let age = 0;
    try { age = Date.now() - fs.statSync(dir).mtimeMs; } catch { continue; }       // it went away: try again
    if (age > DEAD) {
      // a dead lock is moved away under a name of our own first, so of two saves that find it only one takes it
      const gone = `${dir}.dead-${process.pid}`;
      try { fs.renameSync(dir, gone); fs.rmSync(gone, { recursive: true, force: true }); } catch { /* another took it */ }
      continue;
    }
    if (Date.now() >= until) return false;
    sleep(200);
  }
}

function save(a, paths, message) {
  const changed = git(['status', '--porcelain', '--untracked-files=all', '--', ...paths]);
  if (!changed.ok) { console.error(`save: git status failed: ${changed.err}`); return 1; }
  if (!changed.out) { console.log('nothing to save'); return 0; }
  if (a.dry) {
    console.log(`would stage: ${paths.join(' ')}`);
    console.log(`would commit, as "${message}":`);
    console.log(changed.out);
    return 0;
  }
  const add = write(['add', '--', ...paths]);
  if (!add.ok) { console.error(`save: git add failed: ${add.err}`); return 1; }
  const commit = write(['commit', '-q', '-m', message, '--', ...paths]);
  if (!commit.ok) {
    if (/nothing (added )?to commit|no changes added/.test(`${commit.out}\n${commit.err}`)) { console.log('nothing to save'); return 0; }
    console.error(`save: git commit failed: ${commit.err || commit.out}`); return 1;
  }
  console.log(`saved ${git(['rev-parse', '--short', 'HEAD']).out}: ${message.split('\n')[0]}`);
  return 0;
}

function push(dry) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).out;
  if (branch === 'main' || branch === 'master') { console.error(`save: not pushed: this is ${branch}, and a save never pushes ${branch}. The commit is made.`); return 2; }
  if (!branch || branch === 'HEAD') { console.log('not pushed: no branch is checked out. The commit is safe.'); return 0; }
  if (dry) { console.log(`would push ${branch} to origin`); return 0; }
  const r = git(['push', '-q', 'origin', branch], { timeout: PUSH });
  if (r.ok) console.log(`pushed ${branch} to origin`);
  else console.log(`not pushed: ${r.timedOut ? 'the push ran out of time' : `the push failed (${(r.err.split('\n').find(l => l.trim()) ?? 'no reason given').trim()})`}. The commit is safe, and the next save tries again.`);
  return 0;
}

function main() {
  const a = args(process.argv.slice(2));
  if (!a) { console.error(usage); return 1; }
  const dir = storyDir(a.story);
  if (!dir) { console.error(`save: no story "${a.story}" under content/`); return 1; }
  const gitDir = git(['rev-parse', '--git-dir']);
  if (!gitDir.ok) { console.error('save: this is no git repository'); return 1; }
  // a path that is not there and that git does not know is left out: git add would refuse them all for it
  const known = p => fs.existsSync(p) || git(['ls-files', '--', p]).out !== '';
  const paths = [dir, ...a.also.filter(p => known(p) || (console.error(`save: left out, no such path: ${p}`), false))];
  const message = a.message ?? `${a.story}: saved`;
  if (a.dry) return save(a, paths, message) || (a.push ? push(true) : 0);
  const held = path.join(path.resolve(gitDir.out), 'save.lock');
  if (!lock(held)) { console.error(`save: another save holds ${held} for more than ${WAIT / 1000} seconds. Nothing is saved.`); return 1; }
  const free = () => { try { fs.rmdirSync(held); } catch { /* gone already */ } };
  for (const s of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(s, () => { free(); process.exit(1); });
  let status;
  try { status = save(a, paths, message); } finally { free(); }
  // the push runs outside the lock: it does not touch the index, and a slow one must not hold up the next save
  return status || (a.push ? push(false) : 0);
}

process.exitCode = main();
