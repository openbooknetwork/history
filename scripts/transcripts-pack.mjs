// Carries a run's transcripts through a pull request, so a run in a cloud session can be read afterwards: its
// container, and the transcripts in it, are gone when the session ends. Run from the repo root:
//   node scripts/transcripts-pack.mjs pack [--from <folder>]     add what is new or changed to transcripts-pack/
//   node scripts/transcripts-pack.mjs unpack [--to <folder>]     write every packed transcript out again
// Try: node scripts/transcripts-pack.mjs pack --from .cache/no-such-folder
// `pack` reads this project's transcripts, ~/.claude/projects/<this folder's path, each sign a dash>/ unless
// --from, the session files and each session's subagents. It adds one archive, transcripts-pack/pack-<n>.tar.gz,
// with the files that are new or have changed since the last pack, and more than one where they pass 80 MB: GitHub
// refuses a file over 100 MB. transcripts-pack/manifest.json says what each file's content was when it was packed.
// A run packs as each step ends and commits the folder, so a session that ends early has lost one step at the most.
// `unpack` writes them out in the order they were packed, the newest copy of a file last, into .cache/transcripts
// unless --to, and checks each against the manifest. scripts/token-ledger.mjs and scripts/run-watch.mjs then read
// that folder. Remove transcripts-pack/ before the merge, `git rm -r transcripts-pack`, and merge by squash, which
// keeps the archives out of the history of main.
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

const LIMIT = 80 * 1024 * 1024, DIR = 'transcripts-pack', MANIFEST = path.join(DIR, 'manifest.json');
const args = process.argv.slice(2);
const value = name => { const i = args.indexOf(`--${name}`); if (i < 0) return null; const v = args.splice(i, 2)[1]; if (!v) { console.error(`--${name} takes a folder`); process.exit(2); } return v; };
const from = value('from'), to = value('to'), [mode] = args;
if (!['pack', 'unpack'].includes(mode) || args.length !== 1) { console.error('usage: node scripts/transcripts-pack.mjs pack [--from <folder>] | unpack [--to <folder>], from the repo root'); process.exit(2); }
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = () => { try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch { return { packs: [], files: {} }; } };

if (mode === 'pack') {
  const base = from ?? path.join(os.homedir(), '.claude', 'projects', process.cwd().replace(/[^A-Za-z0-9]/g, '-'));
  if (!fs.existsSync(base)) { console.log(`${base} holds no transcripts: nothing to pack`); process.exit(0); }
  const all = [];
  (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const full = path.join(d, e.name); if (e.isDirectory()) walk(full); else if (/\.(jsonl|json)$/.test(e.name)) all.push(path.relative(base, full)); } })(base);
  const m = manifest(), fresh = all.map(f => [f, sha(path.join(base, f))]).filter(([f, h]) => m.files[f]?.sha !== h);
  if (!fresh.length) { console.log(`nothing new among ${all.length} transcripts since the last pack`); process.exit(0); }
  fs.mkdirSync(DIR, { recursive: true });
  // archives of 80 MB at the most, by the files' sizes before they are compressed, which is the careful side
  const groups = [[]]; let size = 0;
  for (const [f] of fresh) { const s = fs.statSync(path.join(base, f)).size; if (size + s > LIMIT && groups.at(-1).length) { groups.push([]); size = 0; } groups.at(-1).push(f); size += s; }
  for (const files of groups) {
    const n = m.packs.length + 1, archive = path.join(DIR, `pack-${String(n).padStart(3, '0')}.tar.gz`);
    execFileSync('tar', ['-czf', archive, '-C', base, ...files]);
    m.packs.push({ archive: path.basename(archive), files: files.length, at: new Date().toISOString() });
    for (const f of files) m.files[f] = { sha: fresh.find(x => x[0] === f)[1], pack: path.basename(archive) };
    console.log(`${archive}: ${files.length} transcripts, ${(fs.statSync(archive).size / 1024 / 1024).toFixed(1)} MB`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 1) + '\n');
  console.log(`${Object.keys(m.files).length} transcripts are packed in ${m.packs.length} archives. Commit ${DIR}/.`);
} else {
  const m = manifest(), out = to ?? path.join('.cache', 'transcripts');
  if (!m.packs.length) { console.error(`${MANIFEST} names no archive`); process.exit(1); }
  fs.mkdirSync(out, { recursive: true });
  for (const p of m.packs) { const archive = path.join(DIR, p.archive); if (!fs.existsSync(archive)) { console.error(`${archive} is missing`); process.exit(1); } execFileSync('tar', ['-xzf', archive, '-C', out]); }
  const bad = Object.entries(m.files).filter(([f, v]) => !fs.existsSync(path.join(out, f)) || sha(path.join(out, f)) !== v.sha).map(([f]) => f);
  if (bad.length) { console.error(`${bad.length} transcripts do not match the manifest: ${bad.slice(0, 5).join(', ')}`); process.exit(1); }
  console.log(`${Object.keys(m.files).length} transcripts written to ${out}, each as it was packed. Read them with: node scripts/token-ledger.mjs ${out} --story <story>`);
}
