// Runs every scripted check of one section and takes its captures, in one command, and prints one summary. Run
// from the repo root:
//   node scripts/audit-pack.mjs <story> <section number> [--out <dir>] [--no-shots] [--phone] [--battle <id>]
//   node scripts/audit-pack.mjs <story> all --pages <page id,page id,...> [--out <dir>]     a map keeper's pack
//   node scripts/audit-pack.mjs <story> all --zones <zone id,zone id,...> [--out <dir>]     the same, by zone
// Try (slow): node scripts/audit-pack.mjs alexander-the-great 020 --no-shots
// An agent's whole context is sent again on every turn, so eight checks and four captures run one a turn cost
// twelve turns, and run here they cost one. It runs, in this order:
//   placeholders   harita check on the section's pages, with waiting image placeholders set apart
//   plan-check     the section's plan against its schemas, and land a page would leave bare on any screen
//   rules-lint     the rules of agents/pages.md and agents/text.md a script can test
//   names-check    names in the texts and in the words on the map
//   card-guard     a card's figures against its plan's authors
//   points         which zone holds each marked place, and how near its edge
//   route-surface  each route on its own surface, land or sea
//   units          with --battle: blocks that stand on each other, a marker on a block, a block too small on a phone
//   build          one build of the story into <out>/site, which the captures and zone-gaps read
//   zone-gaps      land bare on a page and coloured on the pages around it, from the shapes the build drew
//   shots          one capture of each page of the section at a laptop's size, into <out>/shots, and with
//                  --phone one at a phone's size into <out>/shots-phone
// Each check's whole output goes to <out>/<check>.txt. The summary gives each check as ok, as failing with its
// first lines, or as a list to read, and ends with the captures' paths, to read together in one turn. --no-shots leaves the
// captures out, for a maker that only wants its checks. <out> is .cache/audit/<story>-<section> unless given.
// --battle <id> is the pack of a battle's builder and auditor: the pages are the battle's phase pages alone, as
// `phase_of` in the section's pages.yaml names them, the captures are taken at a laptop's and a phone's size, one
// more is taken of each phase with the mouse over the first unit of each side, into <out>/hover-<side>, and a check
// named generator runs the battle's generator again and says whether any file changed. <out> is then
// .cache/audit/<story>-<section>-<battle>.
// `all` in place of a section number, with --pages <id,id,...>, is the pack of a map keeper, whose zones lie under
// pages of many sections: the story's check, one build, zone-gaps and a capture of each page named. The checks
// that read one section's plan are left out. <out> is then .cache/audit/<story>-all. With --zones it picks the
// pages itself: the fewest that between them show every zone named, each zone once. A zone that many pages show
// is looked at on one of them, and the summary says which page stands for which zones.
// It judges nothing: what a check prints is for the agent that reads it. It ends with status 0.
import fs from 'fs';
import path from 'path';
import net from 'net';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(`--${name}`); if (i < 0) return false; args.splice(i, 1); return true; };
const value = name => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args.splice(i, 2)[1]; };
const noShots = flag('no-shots'), battle = value('battle'), only = value('pages')?.split(',').filter(Boolean), zonesWanted = value('zones')?.split(',').filter(Boolean), phone = flag('phone') || !!battle, outArg = value('out');
const [story, section] = args;
const whole = section === 'all';
const usage = 'usage: node scripts/audit-pack.mjs <story> <section number> [--out <dir>] [--no-shots] [--phone] [--battle <id>], or <story> all --pages <id,id,...>, or <story> all --zones <id,id,...>, from the repo root';
// a flag that takes a value and got none, or one that belongs to the other form, is refused and not passed over
for (const [name, v] of [['battle', battle], ['out', outArg]]) if (v === undefined || (typeof v === 'string' && v.startsWith('--'))) { console.error(`--${name} takes a value\n${usage}`); process.exit(2); }
if (process.argv.includes('--pages') && !only?.length) { console.error(`--pages takes page ids\n${usage}`); process.exit(2); }
if (process.argv.includes('--zones') && !zonesWanted?.length) { console.error(`--zones takes zone ids\n${usage}`); process.exit(2); }
if (zonesWanted && (!whole || only)) { console.error(`--zones goes with \`all\`, and without --pages\n${usage}`); process.exit(2); }
if (only && !whole) { console.error(`--pages goes with \`all\` in place of a section number\n${usage}`); process.exit(2); }
const stray = args.slice(2).concat(args.filter(a => a.startsWith('--')));
if (stray.length) { console.error(`not understood: ${[...new Set(stray)].join(' ')}\n${usage}`); process.exit(2); }
if (!story || !(whole ? (only?.length || zonesWanted?.length) && !battle : /^\d{3}$/.test(section ?? ''))) { console.error('usage: node scripts/audit-pack.mjs <story> <section number> [--out <dir>] [--no-shots] [--phone] [--battle <id>], or <story> all --pages <id,id,...>, from the repo root'); process.exit(2); }
const dir = storyDir(story);
if (!dir) { console.error(`no story folder is named ${story}`); process.exit(2); }
const out = outArg ?? path.join('.cache', 'audit', `${story}-${section}${battle ? `-${battle}` : ''}`);
fs.mkdirSync(out, { recursive: true });
const here = path.dirname(new URL(import.meta.url).pathname);

// the section's page ids, as its built pages give them
const pagesDir = path.join(dir, 'pages'), folder = whole ? '' : fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).find(n => n.startsWith(`${section}-`)) : null;
let pages = [];
const files = {};
(function walk(d) { for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)) : []) if (e.isDirectory()) { const full = path.join(d, e.name); if (fs.existsSync(path.join(full, 'page.yaml'))) { const id = e.name.replace(/^\d+-/, ''); pages.push(id); files[id] = path.join(full, 'page.yaml'); } else walk(full); } })(folder !== null && folder !== undefined && fs.existsSync(pagesDir) ? path.join(pagesDir, folder) : '');
// --zones: the fewest pages that show every zone named. A page shows a zone it lists, and the zone whose outline
// an entry of zones.yaml it lists is drawn on
const stands = [];
if (whole && zonesWanted) {
  const entries = (() => { try { return yaml.load(fs.readFileSync(path.join(dir, 'shared', 'zones.yaml'), 'utf8')) ?? {}; } catch { return {}; } })();
  // how much of a page's frame a zone fills, by the boxes of the two: a small land on a page of an empire is a
  // speck there, and that page shows nothing of its edge. A page stands for a zone that fills a fiftieth of it
  const box = g => { let w = 180, s_ = 90, e = -180, n = -90; (function each(c) { if (typeof c[0] === 'number') { w = Math.min(w, c[0]); e = Math.max(e, c[0]); s_ = Math.min(s_, c[1]); n = Math.max(n, c[1]); } else c.forEach(each); })(g.coordinates); return [w, s_, e, n]; };
  const zoneBox = new Map(), boxOf = z => { const id = entries[z]?.zone ?? z; if (!zoneBox.has(id)) { try { zoneBox.set(id, box(JSON.parse(fs.readFileSync(path.join(dir, 'shared', 'zones', `${id}.geojson`), 'utf8')).geometry)); } catch { zoneBox.set(id, null); } } return zoneBox.get(id); };
  const fills = (pageBox, z) => { const b = boxOf(z); if (!b || !Array.isArray(pageBox)) return 0; const w = Math.max(0, Math.min(b[2], pageBox[2]) - Math.max(b[0], pageBox[0])), h = Math.max(0, Math.min(b[3], pageBox[3]) - Math.max(b[1], pageBox[1])); return (w * h) / ((pageBox[2] - pageBox[0]) * (pageBox[3] - pageBox[1])); };
  const shows = new Map(pages.map(p => { const y = (() => { try { return yaml.load(fs.readFileSync(files[p], 'utf8')) ?? {}; } catch { return {}; } })(); return [p, new Map((y.zones ?? []).flatMap(z => [z, entries[z]?.zone].filter(Boolean)).map(z => [z, fills(y.bbox, z)]))]; }));
  const left = new Set(zonesWanted), picked = [];
  for (const least of [0.02, 0]) while (left.size) {
    // the page that shows the most of what is left, and among those the one they fill best
    const best = pages.map(p => { const own = [...left].filter(z => (shows.get(p).get(z) ?? -1) >= least && shows.get(p).has(z)); return [p, own, own.reduce((t, z) => t + shows.get(p).get(z), 0)]; }).sort((a, b) => b[1].length - a[1].length || b[2] - a[2])[0];
    if (!best || !best[1].length) break;
    if (!picked.includes(best[0])) picked.push(best[0]);
    stands.push(`${best[0]} stands for ${best[1].join(', ')}${least ? '' : ', small on it: no page shows it larger'}`); best[1].forEach(z => left.delete(z));
  }
  if (left.size) stands.push(`no page shows ${[...left].join(', ')}`);
  if (!picked.length) { console.error(`no page of ${story} shows any of ${zonesWanted.join(', ')}`); process.exit(2); }
  pages = pages.filter(p => picked.includes(p));
}
if (whole && only) { const missing = only.filter(p => !pages.includes(p)); if (missing.length) { console.error(`no page of ${story} is named ${missing.join(', ')}`); process.exit(2); } pages = pages.filter(p => only.includes(p)); }

// a battle's pack keeps the battle's phase pages alone
const planDir = fs.existsSync(path.join(dir, '.plan')) ? fs.readdirSync(path.join(dir, '.plan')).find(n => n.startsWith(`${section}-`) && fs.existsSync(path.join(dir, '.plan', n, 'pages.yaml'))) : null;
if (battle) {
  const planned = planDir ? yaml.load(fs.readFileSync(path.join(dir, '.plan', planDir, 'pages.yaml'), 'utf8')) : null;
  const list = Array.isArray(planned) ? planned : planned?.pages ?? [];
  const phases = list.filter(p => p?.phase_of === battle).map(p => p.id ?? p.page);
  if (!phases.length) { console.error(`no page of section ${section}'s pages.yaml has phase_of: ${battle}`); process.exit(2); }
  pages = pages.filter(p => phases.includes(p));
  if (!pages.length) { console.error(`the phase pages of ${battle} are planned and none is built yet: ${phases.join(', ')}`); process.exit(2); }
}
// the first unit of each side on a page, for the hover captures
function firstUnits(file) {
  const found = {};
  (function look(v) { if (Array.isArray(v)) v.forEach(look); else if (v && typeof v === 'object') { if (v.side && Array.isArray(v.at) && v.width && !found[v.side]) found[v.side] = v.at; Object.values(v).forEach(look); } })(yaml.load(fs.readFileSync(file, 'utf8')));
  return found;
}

const lines = [];
function check(name, cmd, cmdArgs, timeout = 240000) {
  const t = Date.now(), r = spawnSync(cmd, cmdArgs, { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  const text = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim(), file = path.join(out, `${name}.txt`);
  fs.writeFileSync(file, text + '\n');
  const body = text.split('\n').filter(l => l.trim());
  // a list is always read: points, route-surface and zone-gaps end with status 0 and say what to look at
  const list = ['points', 'route-surface', 'zone-gaps'].includes(name), clean = r.status === 0;
  const verdict = list ? `${body.length} lines to read` : clean ? (body.length > 1 && name !== 'build' ? `ok, with ${body.length - 1} lines of notes` : 'ok') : `FAILS, ${body.length} lines`;
  lines.push(`${name.padEnd(14)} ${verdict}  (${((Date.now() - t) / 1000).toFixed(0)}s)  ${file}`);
  if (!clean) for (const l of body.slice(0, 3)) lines.push(`${''.padEnd(16)}${l.slice(0, 200)}`);
  return r.status === 0;
}
const node = (name, script, ...a) => check(name, 'node', [path.join(here, script), ...a]);

node('placeholders', 'placeholders.mjs', story, ...pages);
if (planDir) node('plan-check', 'plan-check.mjs', story, section);
if (battle) {
  const gens = path.join(dir, '.plans'), gen = (fs.existsSync(gens) ? fs.readdirSync(gens) : []).filter(n => /\.(mjs|cjs)$/.test(n) && !/^(pages\d+|zones|lib|rivers|router)\./.test(n) && fs.readFileSync(path.join(gens, n), 'utf8').includes(battle)).map(n => path.join(gens, n));
  // every file of the story, tracked or not, by its content: a page written a moment ago is in no commit yet
  const state = () => { const h = crypto.createHash('sha1'); (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) { if (e.name === '.references' || e.name === '.wikipedia' || e.name === '.candidates' || e.isSymbolicLink()) continue; const full = path.join(d, e.name); if (e.isDirectory()) walk(full); else { h.update(full); h.update(fs.readFileSync(full)); } } })(dir); return h.digest('hex'); };
  if (gen.length !== 1) lines.push(`generator      ${gen.length ? `${gen.length} files of ${gens} name ${battle}: ${gen.join(', ')}` : `no file of ${gens} names ${battle}`}`);
  else { const before = state(); const ok = check('generator', 'node', [gen[0]]); if (ok) lines.push(`${''.padEnd(16)}${state() === before ? 'run again, it changes no file' : 'run again, it CHANGES a file of the story: a generator gives the same files on every run. What it wrote is left on disk'}`); }
}
if (battle) node('units', 'units-check.mjs', story, section, ...pages);
if (!whole) {
  node('rules-lint', 'rules-lint.mjs', story, section);
  node('names-check', 'names-check.mjs', story, section);
  node('card-guard', 'card-guard.mjs', story, section);
  node('points', 'points.mjs', story, section);
  node('route-surface', 'route-surface.mjs', story, section);
}
const site = path.join(out, 'site');
const built = check('build', path.join('node_modules', '.bin', 'harita'), ['build', '--story', story, '--out', site], 900000);
node('zone-gaps', 'zone-gaps.mjs', story);

const shots = [];
if (!noShots && built && pages.length) {
  const port = await new Promise(resolve => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => resolve(p)); }); });
  const server = spawn('python3', ['-m', 'http.server', String(port)], { cwd: site, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1500));
  try {
    for (const [name, env, sub] of [['shots', {}, 'shots'], ...(phone ? [['shots-phone', { SHOT_W: '390', SHOT_H: '780' }, 'shots-phone']] : [])]) {
      const to = path.join(out, sub);
      const r = spawnSync('node', [path.join(here, 'screenshot.mjs'), `http://localhost:${port}/${story}/`, to, ...pages], { encoding: 'utf8', timeout: 600000, env: { ...process.env, ...env } });
      const errors = `${r.stdout ?? ''}${r.stderr ?? ''}`.split('\n').filter(l => l.trim() && !/^shot /.test(l));
      fs.writeFileSync(path.join(out, `${name}.txt`), `${r.stdout ?? ''}${r.stderr ?? ''}`);
      const taken = pages.map(p => path.join(to, `${p}.png`)).filter(f => fs.existsSync(f));
      shots.push(...taken);
      lines.push(`${name.padEnd(14)} ${taken.length} of ${pages.length} pages${errors.length ? `, ${errors.length} lines of the pages' errors in ${path.join(out, `${name}.txt`)}` : ''}`);
    }
    if (battle) for (const p of pages) for (const [side, at] of Object.entries(firstUnits(files[p]))) {
      const to = path.join(out, `hover-${side}`);
      spawnSync('node', [path.join(here, 'screenshot.mjs'), `http://localhost:${port}/${story}/`, to, p], { encoding: 'utf8', timeout: 300000, env: { ...process.env, SHOT_W: '390', SHOT_H: '780', SHOT_HOVER: at.join(',') } });
      if (fs.existsSync(path.join(to, `${p}.png`))) shots.push(path.join(to, `${p}.png`));
    }
  } finally { server.kill(); }
}

console.log(`${story} ${section}: ${pages.length} pages (${pages.join(', ')})\n`);
console.log(lines.join('\n'));
if (stands.length) console.log(`\n${stands.join('\n')}`);
if (shots.length) console.log(`\nRead the captures together, in one turn:\n${shots.map(s => `  ${s}`).join('\n')}`);
console.log(`\nA check that is not ok has its whole output in its file. Read the files you need together, in one turn.`);
