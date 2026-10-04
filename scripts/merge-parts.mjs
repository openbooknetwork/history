// Merges the files that agents working on one story at the same time write in place of the shared ones, then
// deletes them, so a later run cannot overwrite newer edits. Run from the repo root:
//   node scripts/merge-parts.mjs <story id> battles   .plans/battle-updates/<battle id>.yaml -> shared/battles.yaml
//   node scripts/merge-parts.mjs <story id> i18n      .i18n-parts/<name>.<lang>.yaml -> i18n/<lang>.yaml
//   node scripts/merge-parts.mjs <story id> zones     .plans/zones.yaml -> each page's zones line (the file stays)
// After i18n, `harita i18n <lang> --story <story id>` puts the catalogue back in harita's layout.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

const [storyId, what] = process.argv.slice(2), story = path.join('content', storyId ?? '');
if (!fs.existsSync(path.join(story, 'story.yaml')) || !['battles', 'i18n', 'zones'].includes(what)) {
  console.error('usage: node scripts/merge-parts.mjs <story id> battles|i18n|zones, from the repo root'); process.exit(2);
}
const pageDirs = {};
const walk = dir => { for (const d of fs.readdirSync(dir, { withFileTypes: true })) if (d.isDirectory()) {
  const full = path.join(dir, d.name);
  if (fs.existsSync(path.join(full, 'page.yaml'))) pageDirs[d.name.replace(/^\d+-/, '')] = full; else walk(full);
} };
walk(path.join(story, 'pages'));
const flow = v => JSON.stringify(v).replace(/,/g, ', ').replace(/"([a-z0-9-]+)"/g, '$1');

if (what === 'zones') {
  const map = yaml.load(fs.readFileSync(path.join(story, '.plans/zones.yaml'), 'utf8'));
  for (const [id, zones] of Object.entries(map)) {
    const dir = pageDirs[id]; if (!dir) { console.log(`no page ${id}`); continue; }
    const file = path.join(dir, 'page.yaml');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^zones:.*$/m, `zones: ${flow(zones)}`));
    console.log(`${id}: ${zones.length} zones`);
  }
}

if (what === 'battles') {
  const file = path.join(story, 'shared/battles.yaml'), dir = path.join(story, '.plans/battle-updates');
  const parts = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.yaml')) : [];
  let text = fs.readFileSync(file, 'utf8');
  for (const f of parts) {
    const id = f.replace(/\.yaml$/, ''), upd = yaml.load(fs.readFileSync(path.join(dir, f), 'utf8')) ?? {};
    const start = text.search(new RegExp(`^${id}:\\n`, 'm'));
    if (start < 0) { console.error(`${f}: no battle ${id} in shared/battles.yaml, nothing merged`); process.exit(1); }
    const rest = text.slice(start + id.length + 2), end = start + id.length + 2 + (rest.search(/^\S/m) < 0 ? rest.length : rest.search(/^\S/m));
    let entry = text.slice(start, end);
    for (const [k, v] of Object.entries(upd)) {
      if (['lnglat', 'images', 'front'].includes(k)) {
        const line = `  ${k}: ${flow(v)}`;
        entry = new RegExp(`^  ${k}:.*$`, 'm').test(entry) ? entry.replace(new RegExp(`^  ${k}:.*$`, 'm'), line) : entry.replace(/^  sides:/m, `${line}\n  sides:`);
      } else if (['name', 'date', 'result', 'source'].includes(k)) {
        entry = entry.replace(new RegExp(`^  ${k}:.*$`, 'm'), `  ${k}: ${k === 'source' ? v : JSON.stringify(v)}`);
      } else if (k === 'sides') {
        const head = entry.slice(0, entry.search(/^  sides:/m));
        entry = head + '  sides:\n' + v.map(s => '    - ' + Object.entries(s).map(([sk, sv]) => `${sk}: ${Array.isArray(sv) ? JSON.stringify(sv).replace(/","/g, '", "') : JSON.stringify(sv)}`).join('\n      ')).join('\n') + '\n';
      } else { console.error(`${f}: key "${k}" is merged by hand into shared/battles.yaml; nothing merged`); process.exit(1); }
    }
    text = text.slice(0, start) + entry + text.slice(end);
    console.log(`${id}: ${Object.keys(upd).join(', ')}`);
  }
  yaml.load(text); // stops before writing a file that does not parse
  fs.writeFileSync(file, text);
  fs.rmSync(dir, { recursive: true, force: true });
}

if (what === 'i18n') {
  const dir = path.join(story, '.i18n-parts'), byLang = {};
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
    const m = f.match(/\.([a-z]{2}(?:-[A-Za-z]+)?)\.yaml$/); if (m) (byLang[m[1]] ??= []).push(f);
  }
  for (const [lang, files] of Object.entries(byLang)) {
    const file = path.join(story, 'i18n', lang + '.yaml'), cat = fs.existsSync(file) ? yaml.load(fs.readFileSync(file, 'utf8')) ?? {} : {};
    let n = 0;
    for (const f of files) for (const [k, v] of Object.entries(yaml.load(fs.readFileSync(path.join(dir, f), 'utf8')) ?? {})) { cat[k] = v; n++; }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Object.entries(cat).map(([k, v]) => `${k}: ${JSON.stringify(String(v))}`).join('\n') + '\n');
    console.log(`merged ${n} strings into ${file}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
}
