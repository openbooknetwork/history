// Checks one story's pages before a build: page, marker, battle and route files against harita's schemas, battle
// plans through their plugin, image files, @image lines, marker icons and family names.
//   node scripts/check-story.mjs <story id> [page id ...]
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { check, Page, Markers, Battles, Route } from '@openhistoryatlas/harita/schema';
import battlePlan from '../plugins/emblems/battle-plan.mjs';

const [storyId, ...only] = process.argv.slice(2);
const root = path.join('content', storyId ?? '');
if (!storyId || !fs.existsSync(path.join(root, 'story.yaml'))) { console.error('usage: node scripts/check-story.mjs <story id> [page id ...], from the repo root'); process.exit(2); }
const story = yaml.load(fs.readFileSync(path.join(root, 'story.yaml'), 'utf8')), families = Object.keys(story.families);
const icons = 'node_modules/lucide-static/icons';
const pageDirs = [];
const walk = dir => { for (const d of fs.readdirSync(dir, { withFileTypes: true })) if (d.isDirectory()) {
  const full = path.join(dir, d.name);
  if (fs.existsSync(path.join(full, 'page.yaml'))) pageDirs.push(full); else walk(full);
} };
walk(path.join(root, 'pages'));

let problems = 0;
const report = (file, msg) => { problems++; console.log(`${file}: ${msg}`); };
for (const dir of pageDirs) {
  if (only.length && !only.includes(path.basename(dir).replace(/^\d+-/, ''))) continue;
  try {
    const page = check(Page, yaml.load(fs.readFileSync(path.join(dir, 'page.yaml'), 'utf8')), path.join(dir, 'page.yaml'));
    for (const im of Object.values(page.images)) if (!fs.existsSync(path.join(dir, 'images', im.file))) report(path.join(dir, 'images', im.file), 'missing');
    for (const lang of story.languages) {
      const t = path.join(dir, 'text', `${lang}.md`);
      if (!fs.existsSync(t)) { report(t, 'missing'); continue; }
      for (const m of fs.readFileSync(t, 'utf8').matchAll(/^@image (\S+)/gm)) if (!page.images[m[1]]) report(t, `@image ${m[1]} is not in page.yaml`);
    }
    if (page.emblem?.kind === 'battle-plan') try { battlePlan(page.emblem, { families: story.families }); } catch (e) { report(path.join(dir, 'page.yaml'), e.message); }
    for (const r of fs.existsSync(path.join(dir, 'routes')) ? fs.readdirSync(path.join(dir, 'routes')) : []) check(Route, JSON.parse(fs.readFileSync(path.join(dir, 'routes', r), 'utf8')), path.join(dir, 'routes', r));
    const mf = path.join(dir, 'markers.yaml');
    if (fs.existsSync(mf)) for (const [mid, m] of Object.entries(check(Markers, yaml.load(fs.readFileSync(mf, 'utf8')), mf))) {
      if (!fs.existsSync(path.join(icons, m.icon + '.svg'))) report(mf, `marker ${mid}: unknown icon ${m.icon}`);
      if (m.color && !families.includes(m.color)) report(mf, `marker ${mid}: unknown family ${m.color}`);
    }
    const bf = path.join(dir, 'battles.yaml');
    if (fs.existsSync(bf)) for (const [bid, b] of Object.entries(check(Battles, yaml.load(fs.readFileSync(bf, 'utf8')), bf))) {
      for (const s of b.sides) if (s.color && !s.color.startsWith('#') && !families.includes(s.color)) report(bf, `battle ${bid}: unknown family ${s.color}`);
    }
  } catch (e) { report(dir, e.message); }
}
console.log(problems ? `${problems} problems` : 'ok');
process.exitCode = problems ? 1 : 0;
