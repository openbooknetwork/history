// Records what an agent built from, and lists what has changed under it since. Run from the repo root:
//   node scripts/inputs.mjs record <story> <role> <section number|all> [--battle <id>]   as the agent is dispatched
//   node scripts/inputs.mjs check  <story> <role> <section number|all> [--battle <id>]   as it ends
//   node scripts/inputs.mjs stale  <story>                                               at any moment
// An agent works from files another wrote: the story's rules, its names, the brief, its section's part of the
// digest and its role's files of the plan. "record" saves a hash of each to
// content/<story>/.plan/reports/<section>-<role>[-<battle>].inputs.yaml, beside the agent's reports. "check" prints
// each of them that changed while the agent worked, which makes its work stale. "stale" prints, for every record,
// what has changed since: the pages, texts and battles to build again.
//
// A hash is computed from a file's content and is written into no file but the record. A plan is hashed by page:
// one page's entry in one role's file, so a changed route flags that page's map and not its text, nor the other
// pages of its section. INPUTS says what each role builds from. A hash proves that what an agent built from did
// not change. It does not prove that a plan still matches the pages made from it.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as yaml from 'js-yaml';
import { storyDir } from './story-dir.mjs';

const INPUTS = {
  'research-coordinator': ['rules', 'brief', 'sources'],
  researcher: ['rules', 'sources', 'pages'],
  'research-reviewer': ['rules', 'sources', 'pages'],
  names: ['rules', 'brief', 'digest'],
  'map-architect': ['rules', 'brief', 'names', 'digest'],
  'map-keeper': ['rules', 'brief', 'names', 'digest', 'map'],
  'section-lead': ['rules', 'brief'],
  'section-coordinator': ['rules', 'brief', 'names', 'digest'],
  'battle-coordinator': ['rules', 'names', 'digest', 'pages', 'battles'],
  cartographer: ['rules', 'brief', 'names', 'pages', 'map'],
  'map-auditor': ['rules', 'brief', 'digest', 'pages', 'map'],
  'section-writer': ['rules', 'names', 'digest', 'pages', 'text'],
  'battle-implementor': ['rules', 'names', 'pages', 'battles', 'battle'],
  'battle-auditor': ['rules', 'pages', 'battles', 'battle'],
  'image-finder': ['rules', 'pages', 'text'],
  'fact-checker': ['rules', 'names', 'digest', 'pages', 'text', 'battles'],
  'section-reviewer': ['rules', 'names', 'pages', 'text'],
  editor: ['rules', 'brief', 'names', 'pages', 'text'],
  'story-auditor': ['rules', 'names', 'digest'],
};

const stop = message => { console.error(message); process.exit(2); };
const args = process.argv.slice(2);
const at = args.indexOf('--battle');
const battle = at < 0 ? null : args.splice(at, 2)[1];
const [verb, story, role, section] = args;
const usage = 'usage: node scripts/inputs.mjs record|check <story> <role> <section number|all> [--battle <id>] | stale <story>, from the repo root';
if (!['record', 'check', 'stale'].includes(verb) || !story || (verb !== 'stale' && (!role || !section))) stop(usage);
const dir = storyDir(story);
if (!dir) stop(`no story folder is named ${story}`);
const plan = path.join(dir, '.plan'), reports = path.join(plan, 'reports');

const hash = v => crypto.createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex').slice(0, 16);
const text = name => { try { return fs.readFileSync(path.join(plan, name), 'utf8'); } catch { return null; } };
const data = name => { const t = text(name); if (t === null) return null; try { return yaml.load(t, { schema: yaml.JSON_SCHEMA }); } catch { return null; } };
const folders = () => fs.readdirSync(plan).filter(n => /^\d{3}-/.test(n) && fs.statSync(path.join(plan, n)).isDirectory()).sort();

// the hash of each thing a role builds from, by a key that names it: "names.md", "research.md#020", "020-x/map.yaml#the-danube"
function inputs(role, section, battle) {
  if (!INPUTS[role]) stop(`${role} is no role this script knows: ${Object.keys(INPUTS).join(', ')}`);
  const out = {};
  const put = (key, value) => { if (value != null) out[key] = hash(value); };
  const mine = folders().filter(n => section === 'all' || n.startsWith(`${section}-`));
  if (section !== 'all' && !mine.length && INPUTS[role].some(k => ['pages', 'map', 'text', 'battles', 'battle'].includes(k)))
    stop(`${plan} holds no plan folder numbered ${section}`);
  for (const kind of INPUTS[role]) {
    if (kind === 'rules') put('rules.md', text('rules.md'));
    if (kind === 'names') put('names.md', text('names.md'));
    if (kind === 'brief') put('brief.md', text('brief.md'));
    if (kind === 'sources') put('sources.md', text('sources.md'));
    if (kind === 'digest') {
      const digest = text('research.md');
      if (digest === null) continue;
      if (section === 'all') { put('research.md', digest); continue; }
      const part = digest.split(/^(?=## )/m).find(p => p.startsWith(`## ${section} `));
      put(`research.md#${section}`, part ?? '');
    }
    for (const f of mine) {
      const by = (file, entries) => { for (const [id, v] of entries) put(`${f}/${file}#${id}`, v); };
      if (kind === 'pages') by('pages.yaml', (data(`${f}/pages.yaml`) ?? []).filter(p => p?.id).map(p => [p.id, p]));
      if (kind === 'map') by('map.yaml', Object.entries(data(`${f}/map.yaml`) ?? {}));
      if (kind === 'text') {
        const t = data(`${f}/text.yaml`) ?? {};
        by('text.yaml', [['section', t.section ?? null], ...Object.entries(t.pages ?? {})]);
      }
      if (kind === 'battles') by('battles.yaml', (data(`${f}/battles.yaml`) ?? []).filter(b => b?.id && (!battle || b.id === battle)).map(b => [b.id, b]));
      if (kind === 'battle') {
        const own = path.join(plan, f, 'battles');
        for (const n of fs.existsSync(own) ? fs.readdirSync(own).filter(n => n.endsWith('.yaml') && (!battle || n === `${battle}.yaml`)).sort() : [])
          put(`${f}/battles/${n}`, text(`${f}/battles/${n}`));
      }
    }
  }
  return out;
}

const file = (role, section, battle) => path.join(reports, `${section}-${role}${battle ? `-${battle}` : ''}.inputs.yaml`);
// what differs between a record and the files as they stand
function changed(record) {
  const now = inputs(record.role, String(record.section), record.battle ?? null);
  return [...new Set([...Object.keys(record.inputs), ...Object.keys(now)])].sort()
    .filter(k => record.inputs[k] !== now[k])
    .map(k => `${k}${!(k in now) ? ' is gone' : !(k in record.inputs) ? ' is new' : ' changed'}`);
}

if (verb === 'record') {
  fs.mkdirSync(reports, { recursive: true });
  const record = { role, section, ...(battle ? { battle } : {}), inputs: inputs(role, section, battle) };
  fs.writeFileSync(file(role, section, battle), yaml.dump(record, { lineWidth: 200 }));
  console.log(`${file(role, section, battle)}: ${Object.keys(record.inputs).length} inputs recorded`);
} else if (verb === 'check') {
  const f = file(role, section, battle);
  if (!fs.existsSync(f)) stop(`${f} is missing: run record as the agent is dispatched`);
  const list = changed(yaml.load(fs.readFileSync(f, 'utf8'), { schema: yaml.JSON_SCHEMA }));
  console.log(list.length ? list.join('\n') : 'ok');
  process.exitCode = list.length ? 1 : 0;
} else {
  const records = fs.existsSync(reports) ? fs.readdirSync(reports).filter(n => n.endsWith('.inputs.yaml')).sort() : [];
  let n = 0;
  for (const name of records) {
    const record = yaml.load(fs.readFileSync(path.join(reports, name), 'utf8'), { schema: yaml.JSON_SCHEMA });
    for (const line of changed(record)) { n++; console.log(`${record.section} ${record.role}${record.battle ? ` ${record.battle}` : ''}: ${line}`); }
  }
  if (!n) console.log(records.length ? 'ok' : `${reports} holds no record`);
  process.exitCode = n ? 1 : 0;
}
