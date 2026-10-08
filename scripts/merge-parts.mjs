// Merges the files that agents working on one story at the same time write in place of the shared ones, then
// deletes them, so a later run cannot overwrite newer edits. Run from the repo root:
//   node scripts/merge-parts.mjs <story id> i18n      .i18n-parts/<name>.<lang>.yaml -> i18n/<lang>.yaml
//   node scripts/merge-parts.mjs <story id> zones     .plans/zones.yaml -> each page's zones line (the file stays)
// After i18n, `harita i18n <lang> --story <story id>` puts the catalogue back in harita's layout.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

const [storyId, what] = process.argv.slice(2), story = path.join('content', storyId ?? '');
if (!fs.existsSync(path.join(story, 'story.yaml')) || !['i18n', 'zones'].includes(what)) {
  console.error('usage: node scripts/merge-parts.mjs <story id> i18n|zones, from the repo root'); process.exit(2);
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

if (what === 'i18n') {
  const dir = path.join(story, '.i18n-parts'), byLang = {};
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
    const m = f.match(/\.([a-z]{2}(?:-[A-Za-z]+)?)\.yaml$/); if (m) (byLang[m[1]] ??= []).push(f);
  }
  for (const [lang, files] of Object.entries(byLang)) {
    const file = path.join(story, 'i18n', lang + '.yaml'), cat = fs.existsSync(file) ? yaml.load(fs.readFileSync(file, 'utf8')) ?? {} : {};
    let n = 0;
    for (const f of files) for (const [k, v] of Object.entries(yaml.load(fs.readFileSync(path.join(dir, f), 'utf8')) ?? {})) {
      // a battle's strings live in its folder's catalogue
      if (k.startsWith('battles.')) { console.error(`${f}: ${k} goes into shared/battles/<id>/i18n/${lang}.yaml as battle.<field>, nothing merged`); process.exit(1); }
      cat[k] = v; n++;
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Object.entries(cat).map(([k, v]) => `${k}: ${JSON.stringify(String(v))}`).join('\n') + '\n');
    console.log(`merged ${n} strings into ${file}`);
  }
  fs.rmSync(dir, { recursive: true, force: true });
}
