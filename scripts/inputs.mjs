// Records what each agent built from and what each checker checked, and says which work still stands, so a
// dispatch whose work stands need not start. Run from the repo root:
//   node scripts/inputs.mjs stands <story> [section number|all]                          what stands, and what does not and why
//   node scripts/inputs.mjs fresh  <story> <role> <section number|all> --task <task> --step <step> [--battle <id>] [--note <text>]
//   node scripts/inputs.mjs open   <story> <role> <section number|all> --task <task> --step <step> [--battle <id>] [--note <text>]
//   node scripts/inputs.mjs seal   <story> <role> <section number|all> --task <task> [--battle <id>]
//   node scripts/inputs.mjs agree  <story> <role> <section number|all> [--battle <id>]   a checker's last pass, settled again for the others
//   node scripts/inputs.mjs check  <story> <role> <section number|all> [--battle <id>]   what changed under an agent as it worked
//   node scripts/inputs.mjs stale  <story>                                               every record with what changed since
// Try: node scripts/inputs.mjs stands alexander-the-great 020
// `skip-spec.md` is the design. A manager runs `stands` as it starts and dispatches what does not stand. The
// dispatch hook runs `fresh` and `open` before an agent starts, and the hook after it runs `seal`.
//
// The record is content/<story>/.plan/reports/<section>-<role>[-<battle>].inputs.yaml: a list, one entry a
// dispatch, the newest last. `open` adds an entry with the hash of each thing the role builds from. `seal` closes
// it as the agent ends: the status of its report, the inputs it changed itself, the files it made, and for a
// checker what it checks, as it left it, with the hash of its means. An entry never closed is a run that broke.
//
// Two rules say what stands, each for a role at a step:
//   a maker    stands when what it builds from is as it was when its last run ended, and what it made is there.
//              What others changed in what it made does not reopen it.
//   a checker  stands when its last run ended pass, whatever its task, and what it checks, the open faults of its
//              section and its means are as that run left them.
// A checker's pass settles two things for the others of its section: an input of a maker that the checker changed
// is taken as the checker left it, and a checker of the same step that ended faults is taken as passed.
// `fresh` answers for one dispatch, with status 0 where the role stands. A fix, a recheck, an add, a rewrite and
// a replace never stand, and no manager does: each is sent because something is open.
//
// A hash is computed from content and written into no file but the record. A plan is hashed by page, so a changed
// route flags that page's map. Of names.md a role's record holds the rows its own inputs mention, so a name added
// for another page leaves it standing. A hash proves that nothing changed. It does not prove the work was right.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';
import { INPUTS } from './role-inputs.mjs';
import { sliceNames, sliceBrief } from './slice.mjs';
import { scriptsOf } from './cards.mjs';

const stop = message => { console.error(message); process.exit(2); };
const args = process.argv.slice(2);
const value = name => { const i = args.indexOf(`--${name}`); if (i < 0) return null; const v = args.splice(i, 2)[1]; if (v === undefined) stop(`--${name} takes a value`); return v; };
const battle = value('battle'), task = value('task'), step = value('step'), note = value('note');
const [verb, story, role, section] = args;
const usage = 'usage: node scripts/inputs.mjs stands <story> [section] | fresh|open <story> <role> <section|all> --task <task> --step <step> [--battle <id>] [--note <text>] | seal <story> <role> <section|all> --task <task> [--battle <id>] | check <story> <role> <section|all> [--battle <id>] | stale <story>, from the repo root';
if (!['stands', 'fresh', 'open', 'seal', 'agree', 'check', 'stale'].includes(verb) || !story) stop(usage);
if (['fresh', 'open', 'seal', 'agree', 'check'].includes(verb) && (!role || !section)) stop(usage);
if (['fresh', 'open'].includes(verb) && (!task || !step)) stop(usage);
if (verb === 'seal' && !task) stop(usage);
const dir = storyDir(story);
if (!dir) stop(`no story folder is named ${story}`);
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.join(here, '..');
const plan = path.join(dir, '.plan'), reports = path.join(plan, 'reports');

// the roles that check, the tasks that are sent because something is open, and the roles that manage
const CHECKERS = ['map-auditor', 'fact-checker', 'section-reviewer', 'battle-auditor', 'editor', 'story-auditor', 'research-reviewer'];
const OPEN_TASKS = ['fix', 'recheck', 'add', 'rewrite', 'replace'];
const manages = (r, t) => ['section-lead', 'research-coordinator', 'overseer'].includes(r) || (r === 'battle-coordinator' && t === 'build');

const hash = v => crypto.createHash('sha256').update(typeof v === 'string' || Buffer.isBuffer(v) ? v : JSON.stringify(v)).digest('hex').slice(0, 16);
const text = name => { try { return fs.readFileSync(path.join(plan, name), 'utf8'); } catch { return null; } };
const data = name => { const t = text(name); if (t === null) return null; try { return yaml.load(t, { schema: yaml.JSON_SCHEMA }); } catch { return null; } };
const load = file => { try { return yaml.load(fs.readFileSync(file, 'utf8'), { schema: yaml.JSON_SCHEMA }); } catch { return null; } };
const folders = () => fs.existsSync(plan) ? fs.readdirSync(plan).filter(n => /^\d{3}-/.test(n) && fs.statSync(path.join(plan, n)).isDirectory()).sort() : [];
const mine = sec => folders().filter(n => sec === 'all' || n.startsWith(`${sec}-`));

// ---- what a role builds from: the hash of each thing, by a key that names it
function inputs(r, sec, bat, noteText = null) {
  if (!INPUTS[r]) stop(`${r} is no role this script knows: ${Object.keys(INPUTS).join(', ')}`);
  const out = {}, seen = [];
  const put = (key, v) => { if (v != null) { out[key] = hash(v); seen.push(typeof v === 'string' ? v : JSON.stringify(v)); } };
  const own = mine(sec);
  if (sec !== 'all' && !own.length && INPUTS[r].some(k => ['pages', 'map', 'text', 'battles', 'battle'].includes(k)))
    stop(`${plan} holds no plan folder numbered ${sec}`);
  for (const kind of INPUTS[r]) {
    if (kind === 'rules') put('rules.md', text('rules.md'));
    if (kind === 'sources') put('sources.md', text('sources.md'));
    if (kind === 'ground') put('ground.yaml', text('ground.yaml'));
    if (kind === 'brief') { const b = text('brief.md'); if (b !== null) sec === 'all' ? put('brief.md', b) : put(`brief.md#${sec}`, sliceBrief(b, sec)); }
    if (kind === 'digest') {
      const digest = text('research.md');
      if (digest === null) continue;
      if (sec === 'all') { put('research.md', digest); continue; }
      put(`research.md#${sec}`, digest.split(/^(?=## )/m).find(p => p.startsWith(`## ${sec} `)) ?? '');
    }
    for (const f of own) {
      const by = (file, entries) => { for (const [id, v] of entries) put(`${f}/${file}#${id}`, v); };
      if (kind === 'pages') by('pages.yaml', (data(`${f}/pages.yaml`) ?? []).filter(p => p?.id).map(p => [p.id, p]));
      if (kind === 'map') by('map.yaml', Object.entries(data(`${f}/map.yaml`) ?? {}));
      if (kind === 'text') { const t = data(`${f}/text.yaml`) ?? {}; by('text.yaml', [['section', t.section ?? null], ...Object.entries(t.pages ?? {})]); }
      if (kind === 'battles') by('battles.yaml', (data(`${f}/battles.yaml`) ?? []).filter(b => b?.id && (!bat || b.id === bat)).map(b => [b.id, b]));
      if (kind === 'battle') {
        const folder = path.join(plan, f, 'battles');
        for (const n of fs.existsSync(folder) ? fs.readdirSync(folder).filter(n => /\.(yaml|geojson)$/.test(n) && (!bat || n.startsWith(bat))).sort() : []) put(`${f}/battles/${n}`, text(`${f}/battles/${n}`));
      }
    }
  }
  // of names.md, the rows whose name stands in what else the role builds from: a row added for another page's
  // name leaves this role as it was. For the whole story, and for a role that builds from nothing else, the file
  if (INPUTS[r].includes('names')) {
    const names = text('names.md');
    if (names !== null) { const hay = seen.join('\n'); sec === 'all' || !hay ? put('names.md', names) : (out[`names.md#${sec}`] = hash(sliceNames(names, sec, hay))); }
  }
  if (noteText) out.note = hash(noteText);
  return out;
}
// the file a key of inputs stands for, from the repo root
const fileOf = key => path.join(plan, key.split('#')[0]);

// ---- what a checker checks, as it stands now, by a key that names it
function pagesOf(sec) {
  const out = [], top = path.join(dir, 'pages');
  (function walk(d) { for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)) : []) if (e.isDirectory()) { const full = path.join(d, e.name); if (fs.existsSync(path.join(full, 'page.yaml'))) out.push(full); else walk(full); } })(sec === 'all' ? top : (fs.existsSync(top) ? fs.readdirSync(top).filter(n => n.startsWith(`${sec}-`)).map(n => path.join(top, n))[0] ?? '' : ''));
  return out;
}
const fileHash = f => { try { return hash(fs.readFileSync(f)); } catch { return null; } };
function folderHashes(folder, out, only = () => true) {
  (function walk(d) { for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)) : []) { const full = path.join(d, e.name); if (e.isDirectory()) walk(full); else if (only(full)) out[path.relative(dir, full)] = fileHash(full); } })(folder);
}
function checked(r, sec, bat, st) {
  const out = {}, shared = path.join(dir, 'shared');
  const markers = load(path.join(shared, 'markers.yaml')) ?? {}, entries = load(path.join(shared, 'zones.yaml')) ?? {};
  const named = (page, what) => {      // the shared things a page names, each by its own content
    const y = load(path.join(page, 'page.yaml')) ?? {};
    if (what.includes('markers')) for (const id of y.markers ?? []) if (markers[id] !== undefined) out[`shared/markers.yaml#${id}`] = hash(markers[id]);
    if (what.includes('zones')) for (const id of y.zones ?? []) { if (entries[id] !== undefined) out[`shared/zones.yaml#${id}`] = hash(entries[id]); const file = path.join(shared, 'zones', `${entries[id]?.zone ?? id}.geojson`); out[path.relative(dir, file)] = fileHash(file); }
    if (what.includes('cards') && y.battle) { const file = path.join(shared, 'battles', String(y.battle), 'battle.yaml'); out[path.relative(dir, file)] = fileHash(file); }
  };
  const planFiles = () => { for (const f of mine(sec)) folderHashes(path.join(plan, f), out, full => /\.(yaml|geojson)$/.test(full)); };
  if (r === 'fact-checker' && st === 'plan-check') planFiles();
  else if (r === 'research-reviewer') { const d = text('research.md'); out[`research.md#${sec}`] = d === null ? null : hash(sec === 'all' ? d : d.split(/^(?=## )/m).find(p => p.startsWith(`## ${sec} `)) ?? ''); folderHashes(path.join(plan, 'research'), out, full => sec === 'all' || path.basename(full).startsWith(sec) || (bat && path.basename(full).startsWith(bat))); }
  else if (r === 'editor' && st === 'pre-plan-check') { for (const f of folders()) out[`.plan/${f}/pages.yaml`] = fileHash(path.join(plan, f, 'pages.yaml')); }
  else if (r === 'map-auditor' && sec === 'all') { folderHashes(path.join(shared, 'zones'), out); for (const f of ['zones.yaml']) out[`shared/${f}`] = fileHash(path.join(shared, f)); out['.plan/ground.yaml'] = fileHash(path.join(plan, 'ground.yaml')); for (const n of ['zones.mjs', 'zones.cjs']) if (fs.existsSync(path.join(dir, '.plans', n))) out[`.plans/${n}`] = fileHash(path.join(dir, '.plans', n)); }
  else if (r === 'battle-auditor') {
    for (const page of pagesOf(sec).filter(p => !bat || (load(path.join(p, 'page.yaml')) ?? {}).battle === bat || fs.readFileSync(path.join(p, 'page.yaml'), 'utf8').includes(bat) || pagesOf(sec).some(q => q !== p && path.dirname(q) === path.dirname(p) && (load(path.join(q, 'page.yaml')) ?? {}).battle === bat))) { folderHashes(page, out); named(page, ['cards']); }
    for (const f of mine(sec)) folderHashes(path.join(plan, f, 'battles'), out, full => !bat || path.basename(full).startsWith(bat));
    const gens = path.join(dir, '.plans'); for (const n of fs.existsSync(gens) ? fs.readdirSync(gens).filter(n => /\.mjs$/.test(n) && bat && n.startsWith(bat.split('-')[0])) : []) out[`.plans/${n}`] = fileHash(path.join(gens, n));
  } else {
    // the roles that check a section's pages, or the story's: each page by the files that role reads of it
    const whole = ['editor', 'story-auditor'].includes(r);
    const want = r === 'map-auditor' ? [/page\.yaml$/, /markers\.yaml$/, /routes\//] : r === 'section-reviewer' ? [/page\.yaml$/, /text\/en\.md$/] : [/page\.yaml$/, /markers\.yaml$/, /text\/en\.md$/];
    for (const page of pagesOf(whole ? 'all' : sec)) { folderHashes(page, out, full => want.some(w => w.test(full))); named(page, r === 'map-auditor' ? ['markers', 'zones', 'cards'] : r === 'section-reviewer' ? [] : ['markers', 'cards']); }
  }
  // the open faults of the section: one somebody opened since is a reason to look again
  const list = load(path.join(plan, 'faults', `${sec === 'all' ? 'story' : sec}.yaml`));
  out['faults#open'] = hash((Array.isArray(list) ? list : []).filter(f => f?.state === 'open').map(f => f.id).sort());
  return out;
}

// ---- a checker's means: its definition, its notes as its start-up list cuts them, its scripts with what they
// import and run, and the engines with their patches
function means(r, sec) {
  const h = crypto.createHash('sha256'), add = (label, v) => { h.update(label); h.update(v ?? ''); };
  const read = f => { try { return fs.readFileSync(f); } catch { return null; } };
  const definition = path.join(root, '.claude', 'agents', `${r}.md`);
  add('definition', read(definition));
  // the start-up list makes the role's cuts and cards afresh: the notes it names, cut to its parts
  spawnSync('node', [path.join(here, 'brief.mjs'), story, r, sec], { encoding: 'utf8', timeout: 60000 });
  const cuts = path.join('.cache', 'brief', story);
  for (const n of fs.existsSync(cuts) ? fs.readdirSync(cuts).filter(n => n.startsWith(`${r}-`) && !/-(map|borders|states)\.md$/.test(n)).sort() : []) add(n, read(path.join(cuts, n)));
  for (const n of [...new Set((String(read(definition) ?? '').match(/agents\/[a-z-]+\.md/g) ?? []))].sort()) if (!fs.existsSync(path.join(cuts, `${r}-${path.basename(n)}`))) add(n, read(path.join(root, n)));
  // each script the definition names, and each script one of them imports or runs, to any depth
  const todo = (scriptsOf(r) ?? []).map(s => path.join(root, s)), done = new Set();
  while (todo.length) {
    const f = todo.pop(); if (done.has(f) || !fs.existsSync(f)) continue; done.add(f);
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/['"`](?:\.\/|scripts\/)?([a-z][a-z-]*\.mjs)['"`]/g)) todo.push(path.join(here, m[1]));
  }
  for (const f of [...done].sort()) add(path.relative(root, f), read(f));
  for (const e of ['harita', 'kitap']) add(e, read(path.join(root, 'node_modules', '@openbooknetwork', e, 'package.json')));
  const patches = path.join(root, 'patches'); for (const n of fs.existsSync(patches) ? fs.readdirSync(patches).sort() : []) add(n, read(path.join(patches, n)));
  return h.digest('hex').slice(0, 16);
}

// ---- the record, and an agent's report file
const recordFile = (r, sec, bat) => path.join(reports, `${sec}-${r}${bat ? `-${bat}` : ''}.inputs.yaml`);
const reportFile = (r, sec, bat) => path.join(reports, `${sec}-${r}${bat ? `-${bat}` : ''}.yaml`);
// a record of the first form, one entry and no list, is a run that never ended
const readRecord = f => { const y = load(f); return Array.isArray(y) ? y : y?.inputs ? [{ task: '-', step: '-', inputs: y.inputs }] : []; };
const writeRecord = (f, list) => { fs.mkdirSync(path.dirname(f), { recursive: true }); const tmp = `${f}.${process.pid}.tmp`; fs.writeFileSync(tmp, yaml.dump(list, { lineWidth: 200 })); fs.renameSync(tmp, f); };
// the newest entry of a task in a report file, with its hash: agents add their entry, and one has written the file anew
function lastReport(r, sec, bat, t) {
  const y = load(reportFile(r, sec, bat)), list = Array.isArray(y) ? y : y && typeof y === 'object' ? [y] : [];
  const own = list.filter(e => e && (!t || String(e.task) === String(t)));
  return own.length ? { entry: own[own.length - 1], hash: hash(own[own.length - 1]), count: own.length } : null;
}
// the files a report names as changed: a folder stands for each file in it, and the reports are left out
function made(changedFiles) {
  const out = [];
  for (const c of changedFiles) {
    const at = fs.existsSync(c) ? c : path.join(dir, c); if (!fs.existsSync(at)) continue;
    if (fs.statSync(at).isFile()) out.push(at);
    else (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) { const full = path.join(d, e.name); if (e.isDirectory()) walk(full); else out.push(full); } })(at);
  }
  return [...new Set(out)].filter(f => !f.split(path.sep).includes('reports')).slice(0, 2000);
}
const differs = (then, now) => [...new Set([...Object.keys(then), ...Object.keys(now)])].sort().filter(k => then[k] !== now[k]).map(k => `${k}${!(k in now) ? ' is gone' : !(k in then) ? ' is new' : ' changed'}`);

// A maker's fix is dispatched with the step its fault was found at, and an agreement has no step of its own: each
// belongs with the first task before it, the draw it mends. A checker's entries keep their own step.
function family(r, list) {
  if (CHECKERS.includes(r)) return list.map(e => ({ ...e, fam: e.step }));
  let fam = null;
  return list.map(e => { if (!OPEN_TASKS.includes(e.task) && e.task !== 'agreed') fam = e.step; return { ...e, fam: fam ?? e.step }; });
}
// ---- what a checker's pass settles for the others of its section. By "Who finds it fixes it" a checker changes
// the plan as it checks, and its pass says the section agrees with the plan as it left it. So:
//   an input of a maker that the checker changed is taken as the checker left it: the maker is not sent again to
//   build from a plan that was put right to match what it built;
//   another checker of the same step whose last run ended faults is taken as passed: its faults were fixed and
//   this run rechecked them. What it checks is recorded as it stands now.
function agree(checker, sec, entry, touched) {
  const out = [], now = new Date().toISOString();
  const files = fs.existsSync(reports) ? fs.readdirSync(reports).filter(n => n.endsWith('.inputs.yaml') && n.startsWith(`${sec}-`)) : [];
  for (const name of files) {
    const rest = name.replace(/\.inputs\.yaml$/, '').slice(sec.length + 1);
    const r = Object.keys(INPUTS).sort((a, b) => b.length - a.length).find(x => rest === x || rest.startsWith(`${x}-`)); if (!r || r === checker) continue;
    const bat = rest === r ? null : rest.slice(r.length + 1), f = path.join(reports, name), list = readRecord(f), last = list.filter(e => e.ended).pop(); if (!last) continue;
    if (CHECKERS.includes(r)) {
      if (last.step !== entry.step || last.status !== 'faults') continue;
      list.push({ task: 'agreed', step: last.step, at: now, ended: now, status: 'pass', by: `${checker} ${entry.task}`, checked: checked(r, sec, bat, last.step), means: means(r, sec) });
      writeRecord(f, list); out.push(`${f}: its faults were rechecked by this pass, so it stands on what it checks as it is now`);
    } else if (!manages(r, last.task)) {
      const then = { ...last.inputs, ...(last.inputs_end ?? {}) }, current = inputs(r, sec, bat, last.note ?? null);
      const moved = Object.keys(current).filter(k => current[k] !== then[k] && touched(fileOf(k.replace(/^names\.md#.*/, 'names.md'))));
      if (!moved.length) continue;
      list.push({ task: 'agreed', step: last.step, at: now, ended: now, status: last.status, by: `${checker} ${entry.task}`, inputs: { ...then, ...Object.fromEntries(moved.map(k => [k, current[k]])) }, outputs: last.outputs ?? [] });
      writeRecord(f, list); out.push(`${f}: ${moved.length} of its inputs, changed by this pass, are taken as it left them`);
    }
  }
  return out;
}
// ---- does a role stand at a step, and if not why
function standing(r, sec, bat, st, noteText) {
  const list = family(r, readRecord(recordFile(r, sec, bat))).filter(e => !st || e.fam === st);
  if (!list.length) return { stands: false, why: ['it has no record at this step'] };
  const last = list[list.length - 1];
  if (!last.ended) return { stands: false, why: [`its last run, ${last.task} of ${last.at ?? 'an unknown time'}, never ended`] };
  if (CHECKERS.includes(r)) {
    if (last.status !== 'pass') return { stands: false, why: [`its last run, ${last.task}, ended ${last.status}`] };
    const why = differs(last.checked ?? {}, checked(r, sec, bat, last.step)).map(l => `what it checks: ${l}`);
    if (last.means !== means(r, sec)) why.push('its means changed: its definition, its notes, a script it runs or an engine');
    return { stands: !why.length, why, last };
  }
  if (last.status === 'blocked') return { stands: false, why: [`its last run, ${last.task}, ended blocked`] };
  const then = { ...last.inputs, ...(last.inputs_end ?? {}) }, now = inputs(r, sec, bat, noteText);
  if (noteText === undefined) { delete then.note; delete now.note; }
  const why = differs(then, now).map(l => `what it builds from: ${l}`);
  for (const f of last.outputs ?? []) if (!fs.existsSync(f)) why.push(`what it made is gone: ${f}`);
  return { stands: !why.length, why, last };
}

if (verb === 'open') {
  const f = recordFile(role, section, battle), list = readRecord(f).filter(e => e.task !== '-');
  list.push({ task, step, at: new Date().toISOString(), ...(note ? { note } : {}), before: lastReport(role, section, battle, task)?.hash ?? null, inputs: inputs(role, section, battle, note) });
  writeRecord(f, list);
  console.log(`${f}: entry ${list.length} opened, ${Object.keys(list[list.length - 1].inputs).length} inputs`);
} else if (verb === 'seal') {
  const f = recordFile(role, section, battle), list = readRecord(f);
  const at = list.map((e, i) => [e, i]).filter(([e]) => String(e.task) === String(task) && !e.ended).pop()?.[1];
  if (at === undefined) { console.log(`${f}: no open entry of ${task} to close`); process.exit(1); }
  const entry = list[at], report = lastReport(role, section, battle, task);
  if (!report || report.hash === entry.before) { console.log(`${reportFile(role, section, battle)} holds no new entry of ${task}: the record stays open, and an open entry never stands`); process.exit(1); }
  const changedFiles = (Array.isArray(report.entry.changed_files) ? report.entry.changed_files : []).map(String);
  const touched = file => changedFiles.some(c => path.resolve(c) === path.resolve(file) || path.resolve(dir, c) === path.resolve(file));
  // an input the run changed itself is kept as the run left it. One that another changed keeps its first hash
  const now = inputs(role, section, battle, entry.note ?? null), end = {};
  for (const k of Object.keys(now)) if (now[k] !== entry.inputs[k] && touched(fileOf(k.replace(/^names\.md#.*/, 'names.md')))) end[k] = now[k];
  Object.assign(entry, { ended: new Date().toISOString(), status: String(report.entry.status ?? 'unknown'), ...(Object.keys(end).length ? { inputs_end: end } : {}),
    outputs: made(changedFiles) });
  if (CHECKERS.includes(role)) Object.assign(entry, { checked: checked(role, section, battle, entry.step), means: means(role, section) });
  writeRecord(f, list);
  console.log(`${f}: ${task} closed, ${entry.status}`);
  if (CHECKERS.includes(role) && entry.status === 'pass') for (const line of agree(role, section, entry, touched)) console.log(line);
} else if (verb === 'agree') {
  // the same settling a seal does, run again by hand: for a record made before a checker's pass settled anything
  const last = readRecord(recordFile(role, section, battle)).filter(e => e.ended).pop();
  if (!CHECKERS.includes(role) || last?.status !== 'pass') { console.log(`${role} is no checker whose last run ended pass: nothing to settle`); process.exit(1); }
  const y = load(reportFile(role, section, battle)), changed = (Array.isArray(y) ? y : []).filter(e => e && e.status === 'pass').flatMap(e => Array.isArray(e.changed_files) ? e.changed_files.map(String) : []);
  const lines = agree(role, section, last, file => changed.some(c => path.resolve(c) === path.resolve(file) || path.resolve(dir, c) === path.resolve(file)));
  console.log(lines.length ? lines.join('\n') : 'nothing to settle');
} else if (verb === 'fresh') {
  const never = manages(role, task) ? `a ${role} manages, and a manager always runs` : OPEN_TASKS.includes(task) ? `a ${task} is sent because something is open` : null;
  if (never) { console.log(`runs: ${never}`); process.exit(1); }
  const s = standing(role, section, battle, step, note ?? null);
  if (!s.stands) { console.log(`runs: ${s.why.slice(0, 8).join('; ')}${s.why.length > 8 ? `; and ${s.why.length - 8} more` : ''}`); process.exit(1); }
  const report = lastReport(role, section, battle, s.last.task);
  console.log(`stands: ${section} ${role}${battle ? ` ${battle}` : ''} at ${step}. Its last run, ${s.last.task}, ended ${s.last.status} on ${s.last.ended}, and ${CHECKERS.includes(role) ? 'what it checks, the open faults and its means are as it left them' : 'what it builds from is as it was and what it made is there'}.`);
  if (report) console.log(`\nIts last report, from ${reportFile(role, section, battle)}:\n\n${yaml.dump(report.entry, { lineWidth: 160 }).trim()}`);
} else if (verb === 'stands') {
  const want = role ?? null;       // the section, where one is given
  const files = fs.existsSync(reports) ? fs.readdirSync(reports).filter(n => n.endsWith('.inputs.yaml') && (!want || n.startsWith(`${want}-`))).sort() : [];
  let n = 0;
  for (const name of files) {
    const m = name.replace(/\.inputs\.yaml$/, '').match(/^(all|\d{3})-(.+)$/); if (!m) continue;
    const known = Object.keys(INPUTS).concat(CHECKERS).sort((a, b) => b.length - a.length).find(r => m[2] === r || m[2].startsWith(`${r}-`)); if (!known) continue;
    const bat = m[2] === known ? null : m[2].slice(known.length + 1), steps = [...new Set(family(known, readRecord(path.join(reports, name))).map(e => e.fam).filter(x => x && x !== '-'))];
    for (const st of steps) {
      if (manages(known, st === 'phases' ? 'build' : null)) continue;
      const s = standing(known, m[1], bat, st, undefined); n++;
      console.log(`${s.stands ? 'stands' : 'RUNS  '}  ${m[1]} ${known}${bat ? ` ${bat}` : ''} at ${st}${s.stands ? `: ${s.last.task} ended ${s.last.status}` : `: ${s.why.slice(0, 3).join('; ')}${s.why.length > 3 ? `; and ${s.why.length - 3} more` : ''}`}`);
    }
  }
  if (!n) console.log(`${reports} holds no record${want ? ` of ${want}` : ''} with a step: every dispatch runs`);
} else if (verb === 'check') {
  const list = readRecord(recordFile(role, section, battle));
  if (!list.length) stop(`${recordFile(role, section, battle)} is missing: the dispatch hook opens it`);
  const last = list[list.length - 1], lines = differs({ ...last.inputs, ...(last.inputs_end ?? {}) }, inputs(role, section, battle, last.note ?? null));
  console.log(lines.length ? lines.join('\n') : 'ok');
  process.exitCode = lines.length ? 1 : 0;
} else {
  const files = fs.existsSync(reports) ? fs.readdirSync(reports).filter(n => n.endsWith('.inputs.yaml')).sort() : [];
  let n = 0;
  for (const name of files) {
    const m = name.replace(/\.inputs\.yaml$/, '').match(/^(all|\d{3})-(.+)$/); if (!m) continue;
    const known = Object.keys(INPUTS).sort((a, b) => b.length - a.length).find(r => m[2] === r || m[2].startsWith(`${r}-`)); if (!known) continue;
    const bat = m[2] === known ? null : m[2].slice(known.length + 1), list = readRecord(path.join(reports, name)); if (!list.length) continue;
    const last = list[list.length - 1];
    for (const line of differs({ ...last.inputs, ...(last.inputs_end ?? {}) }, inputs(known, m[1], bat, last.note ?? null))) { n++; console.log(`${m[1]} ${known}${bat ? ` ${bat}` : ''}: ${line}`); }
  }
  if (!n) console.log(files.length ? 'ok' : `${reports} holds no record`);
  process.exitCode = n ? 1 : 0;
}
