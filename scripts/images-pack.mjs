#!/usr/bin/env node
// Moves image originals through a pull request, so nobody re-downloads them from Wikimedia Commons.
//
//   node scripts/images-pack.mjs pack      collect every original on disk into images-pack/pack-N.tar.gz
//   node scripts/images-pack.mjs unpack    extract the archives and check each original against its image.yaml sha256
//
// A cloud run packs before it reports, and commits images-pack/. The reviewer unpacks after pulling the
// branch, and removes images-pack/ before the merge: git rm -r images-pack

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Each archive stays under 80 MB: GitHub refuses any file over 100 MB.
const LIMIT = 80 * 1024 * 1024;
const PACK_DIR = 'images-pack';

const mode = process.argv[2];
if (mode !== 'pack' && mode !== 'unpack') {
  console.error('usage: node scripts/images-pack.mjs pack|unpack');
  process.exit(2);
}

function* imageYamls(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* imageYamls(p);
    else if (entry.name === 'image.yaml' && path.basename(path.dirname(path.dirname(p))) === 'images') yield p;
  }
}

function readMeta(yamlPath) {
  const text = fs.readFileSync(yamlPath, 'utf8');
  const file = text.match(/^file:\s*(\S+)/m)?.[1];
  const sha256 = text.match(/^sha256:\s*([0-9a-f]{64})/m)?.[1];
  return { file, sha256 };
}

function sha256Of(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

const originals = [];
for (const yamlPath of imageYamls('content')) {
  const { file, sha256 } = readMeta(yamlPath);
  if (!file) continue;
  originals.push({ path: path.join(path.dirname(yamlPath), file), sha256, yamlPath });
}

if (mode === 'pack') {
  const present = originals.filter((o) => fs.existsSync(o.path));
  if (present.length === 0) {
    console.log('No originals on disk, nothing to pack.');
    process.exit(0);
  }
  fs.rmSync(PACK_DIR, { recursive: true, force: true });
  fs.mkdirSync(PACK_DIR);
  const groups = [[]];
  let size = 0;
  for (const o of present) {
    const s = fs.statSync(o.path).size;
    if (size + s > LIMIT && groups.at(-1).length > 0) {
      groups.push([]);
      size = 0;
    }
    groups.at(-1).push(o.path);
    size += s;
  }
  groups.forEach((files, i) => {
    const archive = path.join(PACK_DIR, `pack-${i + 1}.tar.gz`);
    execFileSync('tar', ['-czf', archive, ...files]);
    const mb = (fs.statSync(archive).size / 1024 / 1024).toFixed(1);
    console.log(`${archive}: ${files.length} originals, ${mb} MB`);
  });
  console.log(`Packed ${present.length} originals. Commit ${PACK_DIR}/ on the branch.`);
} else {
  if (!fs.existsSync(PACK_DIR)) {
    console.error(`No ${PACK_DIR}/ directory here. Pull the branch that carries it, and run from the repo root.`);
    process.exit(1);
  }
  const archives = fs.readdirSync(PACK_DIR).filter((f) => f.endsWith('.tar.gz'));
  for (const f of archives) {
    execFileSync('tar', ['-xzf', path.join(PACK_DIR, f)]);
    console.log(`extracted ${f}`);
  }
  let checked = 0;
  let bad = 0;
  for (const o of originals) {
    if (!fs.existsSync(o.path)) continue;
    checked += 1;
    if (!o.sha256) {
      console.warn(`no sha256 in ${o.yamlPath}, cannot verify ${o.path}`);
    } else if (sha256Of(o.path) !== o.sha256) {
      console.error(`MISMATCH: ${o.path} does not match the sha256 in ${o.yamlPath}`);
      bad += 1;
    }
  }
  console.log(`Verified ${checked} originals, ${bad} mismatch${bad === 1 ? '' : 'es'}.`);
  console.log(`Before the merge: git rm -r ${PACK_DIR}`);
  process.exit(bad ? 1 : 0);
}
