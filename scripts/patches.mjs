// Applies the patches of patches/ to the packages they name, after an install. Run from the repo root:
//   node scripts/patches.mjs
// A patch file is named <package>-<version>-<what>.patch, for a package of @openbooknetwork, and holds a unified
// diff of the package's own files. It is applied only to the version it names, and only once: a patch that is in
// place already is left alone, and one that no longer applies is reported. Each patch is a fix that waits for a
// release of its package. Remove the file once package.json asks for a version that holds it.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const dir = 'patches';
let failed = false;
for (const name of fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n.endsWith('.patch')).sort() : []) {
  const [, pkg, version] = name.match(/^([a-z]+)-(\d+\.\d+\.\d+)-/) ?? [];
  const at = pkg && path.join('node_modules', '@openbooknetwork', pkg);
  if (!at || !fs.existsSync(at)) { console.log(`${name}: no package to patch`); continue; }
  const has = JSON.parse(fs.readFileSync(path.join(at, 'package.json'), 'utf8')).version;
  if (has !== version) { console.log(`${name}: ${pkg} is ${has}, and the patch is for ${version}. Left out`); continue; }
  const file = path.resolve(dir, name);
  const run = (...args) => spawnSync('patch', ['-p1', '--batch', '--silent', ...args, '-i', file], { cwd: at, encoding: 'utf8' });
  // in place already where it would come out again cleanly
  if (run('--reverse', '--dry-run').status === 0) { console.log(`${name}: in place`); continue; }
  if (run('--dry-run').status !== 0) { console.log(`${name}: does not apply to ${pkg} ${has}`); failed = true; continue; }
  run();
  console.log(`${name}: applied to ${pkg} ${has}`);
}
process.exitCode = failed ? 1 : 0;
