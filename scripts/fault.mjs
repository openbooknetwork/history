// The log of a story's build, and the only door to it: what an agent adds, and the views made from it.
// Run from the repo root:
//   node scripts/fault.mjs why   <story> <section|story> --by <role> [<edit id> ... --severity <wrong|weak|taste> --kind <kind> --source <line> [--claim <id>] [--introduced <work>]]
//   node scripts/fault.mjs why   <story> <section|story> --by <role> --from <file>     every reason of a run, in one call
//   node scripts/fault.mjs ask   <story> <section|story> --by <role> --for <role|overseer|user> --what <text> [--file <path>] [--source <line>] [--severity <s>]
//   node scripts/fault.mjs reply <story> <ask id> --by <role> <done|declined|agreed|again> [--why <text>]
//   node scripts/fault.mjs asks  <story> <section|story> --for <role>
//   node scripts/fault.mjs since <story> <section|story> --for <role>
//   node scripts/fault.mjs line  <story> <section|story> --by <role>
// Try: node scripts/fault.mjs asks alexander-the-great 020 --for cartographer
// `improvements-spec.md` is the design. The log is content/<story>/.plan/log/<section>.jsonl, and story.jsonl for
// what belongs to no one section: one event a line, added at the end and never changed. A hook writes each change
// of a file as an `edit` event (hooks/capture.mjs) and each agent's end as an `end` event (hooks/agent-end.mjs). An
// agent adds only what no program can see:
//   why    the reason of edits it made: a fault is an edit and its why. With no edit id it prints the role's edits
//          that still owe one, each with its id. One call may explain several edits.
//   ask    work for somebody else: what an open fault was. One for `overseer` or `user` waits for a ruling.
//   reply  the owner's `done` or `declined` to an ask, and then the asker's `agreed` or `again`.
// Nothing here is a state somebody keeps: what is open is read from the events in their order.
//   asks   the open asks for a role          since  what others changed in the kinds of file a checker has the
//   line   a run's return: "ok 2 0" is the          last word on (scripts/pipeline.mjs), after its last run ended
//          result, the open asks of and for the role in the section, and the asks that wait for a ruling.
// A story is on the log once its .plan/log folder exists. For a story without one the views print nothing open.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { storyDir } from './story-dir.mjs';
import { PIPELINE, kindOf } from './pipeline.mjs';

export const logDir = dir => path.join(dir, '.plan', 'log');
export const onLog = dir => fs.existsSync(logDir(dir));
const RULERS = ['overseer', 'user', 'section-lead', 'research-coordinator', 'battle-coordinator'];

// add one event to a section's log, and return it with its id and its time
export function append(dir, section, event) {
  fs.mkdirSync(logDir(dir), { recursive: true });
  const e = { id: crypto.randomBytes(3).toString('hex'), at: new Date().toISOString(), section: section ?? 'story', ...event };
  fs.appendFileSync(path.join(logDir(dir), `${e.section}.jsonl`), JSON.stringify(e) + '\n');
  return e;
}
// every event of a story, in the order of their time. A line that does not parse is left out.
export function events(dir) {
  if (!onLog(dir)) return [];
  const all = [];
  for (const n of fs.readdirSync(logDir(dir)).filter(n => n.endsWith('.jsonl')).sort())
    for (const l of fs.readFileSync(path.join(logDir(dir), n), 'utf8').split('\n')) { if (!l.trim()) continue; try { all.push(JSON.parse(l)); } catch { /* a line cut short */ } }
  return all.map((e, i) => [e, i]).sort((a, b) => String(a[0].at).localeCompare(String(b[0].at)) || a[1] - b[1]).map(x => x[0]);
}
// the edits of a story, one for each change of a file: where two hooks saw the same change, the one that holds
// its old and new text is kept
export function edits(all) {
  const list = all.filter(e => e.type === 'edit'), key = e => `${e.file}@${e.mtime}`;
  const told = new Set(list.filter(e => !e.whole && e.mtime).map(key)), seen = new Set();
  return list.filter(e => {
    if (!e.whole || !e.mtime) return true;          // an Edit, with its text: each is a change of its own
    if (told.has(key(e)) || seen.has(key(e))) return false;
    seen.add(key(e)); return true;
  });
}
// each ask with where it stands: open, answered (done or declined, and not yet agreed to) or closed
export function asks(all) {
  const out = new Map();
  for (const e of all) {
    if (e.type === 'ask') out.set(e.id, { ...e, state: 'open', replies: [] });
    if (e.type === 'reply' && out.has(e.ask)) { const a = out.get(e.ask); a.replies.push(e); a.state = e.state === 'agreed' ? 'closed' : e.state === 'again' ? 'open' : 'answered'; }
  }
  return [...out.values()];
}
const inSection = (e, section) => section === 'story' || e.section === section || e.section === 'story';
const kinds = (role, key) => new Set(Object.values(PIPELINE[role] ?? {}).flatMap(t => t[key] ?? []));
// a why is owed for an edit by a checker or a manager, and for a maker's edit to a file it does not make
export function owes(role, file) {
  // the main session is the user's or the overseer's own hand: its changes are recorded and owe nobody a reason
  if (role === 'main') return false;
  if (!PIPELINE[role]) return true;
  if (Object.values(PIPELINE[role]).some(t => t.kind !== 'maker')) return true;
  return !kinds(role, 'makes').has(kindOf(file));
}
// with an agent's id, the edits of that one run: two agents of one role work side by side, a page each
export function unexplained(all, role, section, agent = null) {
  const told = new Set(all.filter(e => e.type === 'why').flatMap(e => e.edits ?? []));
  // a file its generator wrote owes none: the edit of the generator is the change, and carries the reason
  return edits(all).filter(e => e.role === role && (!agent || e.agent === agent) && inSection(e, section) && !told.has(e.id) && !e.generated && owes(role, e.file));
}
export const openAsks = (all, role, section) => asks(all).filter(a => a.for === role && a.state === 'open' && inSection(a, section));
// what others changed in the kinds of file the role has the last word on, after the end of the role's last run
export function since(all, role, section) {
  const settles = kinds(role, 'settles');
  // a run that ended has looked at its files: an edit the role made in passing has not
  const last = all.filter(e => e.type === 'end' && e.role === role && inSection(e, section)).at(-1)?.at ?? '';
  const whys = new Map(all.filter(e => e.type === 'why').flatMap(w => (w.edits ?? []).map(id => [id, w])));
  const news = edits(all).filter(e => e.role !== role && String(e.at) > last && inSection(e, section) && settles.has(kindOf(e.file)));
  // a file that commands changed and changed back holds what it held: its first `was` is its last `hash`
  const back = new Set();
  for (const f of new Set(news.map(e => e.file))) { const of = news.filter(e => e.file === f); if (of.every(e => e.whole && e.hash) && of[0].was && of[0].was === of.at(-1).hash) back.add(f); }
  return news.filter(e => !back.has(e.file))
    .map(e => ({ ...e, why: whys.get(e.id) ? { severity: whys.get(e.id).severity, kind: whys.get(e.id).kind, source: whys.get(e.id).source } : null }));
}
// a run's return: the result, the open asks of and for the role in the section, and the asks that wait for a ruling
export function line(all, role, section) {
  const mine = asks(all).filter(a => inSection(a, section) && a.state !== 'closed' && (a.by === role || a.for === role));
  const waiting = mine.filter(a => RULERS.includes(a.for));
  const blocked = mine.some(a => a.by === role && a.kind === 'block' && a.state === 'open');
  return `${blocked ? 'blocked' : 'ok'} ${mine.length - waiting.length} ${waiting.length}`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const stop = message => { console.error(message); process.exit(2); };
  const args = process.argv.slice(2);
  const value = name => { const i = args.indexOf(`--${name}`); if (i < 0) return null; const v = args.splice(i, 2)[1]; if (v === undefined) stop(`--${name} takes a value`); return v; };
  const o = Object.fromEntries(['by', 'for', 'what', 'file', 'source', 'severity', 'kind', 'claim', 'introduced', 'why', 'from'].map(k => [k, value(k)]));
  const [verb, story, ...rest] = args;
  const usage = 'usage: node scripts/fault.mjs why|ask|asks|since|line <story> <section|story> ..., or reply <story> <ask id> --by <role> <done|declined|agreed|again>: see the comment that opens the script';
  if (!['why', 'ask', 'reply', 'asks', 'since', 'line'].includes(verb) || !story) stop(usage);
  const dir = storyDir(story);
  if (!dir) stop(`no story folder is named ${story}`);
  const all = events(dir);
  const show = e => `${e.id}  ${e.file}${e.whole ? '  (the whole file)' : `\n      - ${String(e.old).replace(/\s+/g, ' ').slice(0, 100)}\n      + ${String(e.new).replace(/\s+/g, ' ').slice(0, 100)}`}`;
  const section = verb === 'reply' ? null : rest.shift();
  if (verb !== 'reply' && !/^(\d{3}|story)$/.test(section ?? '')) stop(`give the section's three digits, or story: ${usage}`);

  if (verb === 'why') {
    if (!o.by) stop('--by <role> says whose edits these are');
    const owed = unexplained(all, o.by, section);
    // every reason of a run in one call: a YAML file, a list of { edits: [ids], severity, kind, source, claim, introduced }
    if (o.from) {
      let rows; try { rows = yaml.load(fs.readFileSync(o.from, 'utf8')); } catch (e) { stop(`${o.from} does not read as YAML: ${e.message.split('\n')[0]}`); }
      if (!Array.isArray(rows) || !rows.length) stop(`${o.from} holds no list: give a list of { edits: [ids], severity, kind, source }`);
      const known = new Set(edits(all).map(e => e.id)), problems = [];
      rows.forEach((r, i) => {
        const ids = [].concat(r?.edits ?? []).map(String), n = `entry ${i + 1}`;
        if (!ids.length) problems.push(`${n}: no edits`);
        for (const id of ids) if (!known.has(id)) problems.push(`${n}: no edit has the id ${id}`);
        if (!['wrong', 'weak', 'taste'].includes(r?.severity)) problems.push(`${n}: severity is wrong, weak or taste`);
        if (!r?.kind || !r?.source) problems.push(`${n}: kind and source are both needed`);
      });
      // nothing is written unless every entry is right, so a file is fixed and sent again as a whole
      if (problems.length) stop(`nothing was written:\n${problems.join('\n')}\nyour edits that owe a why:\n${owed.map(show).join('\n') || '(none)'}`);
      const given = new Set();
      for (const r of rows) { const ids = [].concat(r.edits).map(String); ids.forEach(id => given.add(id)); append(dir, section, { type: 'why', role: o.by, edits: ids, severity: r.severity, kind: String(r.kind), source: String(r.source), ...(r.claim ? { claim: String(r.claim) } : {}), ...(r.introduced ? { introduced: String(r.introduced) } : {}) }); }
      console.log(`${rows.length} reasons written for ${given.size} edits. ${owed.filter(x => !given.has(x.id)).length} of ${o.by}'s edits in ${section} still owe a why.`);
      process.exit(0);
    }
    if (!rest.length) { console.log(owed.length ? `${owed.length} edits of ${o.by} in ${section} owe a why:\n${owed.map(show).join('\n')}` : `no edit of ${o.by} in ${section} owes a why`); process.exit(0); }
    if (!['wrong', 'weak', 'taste'].includes(o.severity)) stop('--severity is wrong, weak or taste');
    if (!o.kind || !o.source) stop('--kind and --source say what kind of fault it was and the line of the source it rests on');
    const known = new Set(edits(all).map(e => e.id)), bad = rest.filter(id => !known.has(id));
    if (bad.length) stop(`no edit has the id ${bad.join(', ')}: run the command with no id to list yours`);
    const e = append(dir, section, { type: 'why', role: o.by, edits: rest, severity: o.severity, kind: o.kind, source: o.source, ...(o.claim ? { claim: o.claim } : {}), ...(o.introduced ? { introduced: o.introduced } : {}) });
    console.log(`${e.id}: ${rest.length} edit${rest.length > 1 ? 's' : ''} explained. ${owed.filter(x => !rest.includes(x.id)).length} still owe a why.`);
  }
  if (verb === 'ask') {
    if (!o.by || !o.for || !o.what) stop('--by, --for and --what say who asks, whose work it is and what must change');
    const e = append(dir, section, { type: 'ask', by: o.by, role: o.by, for: o.for, what: o.what, ...(o.file ? { file: o.file } : {}), ...(o.source ? { source: o.source } : {}), ...(o.severity ? { severity: o.severity } : {}), ...(o.kind ? { kind: o.kind } : {}) });
    console.log(`${e.id}: asked of ${o.for}`);
  }
  if (verb === 'reply') {
    const [id, state] = rest;
    const ask = asks(all).find(a => a.id === id);
    if (!ask) stop(`no ask has the id ${id}`);
    if (!o.by || !['done', 'declined', 'agreed', 'again'].includes(state)) stop('--by <role> and one of done, declined, agreed, again');
    if (state === 'declined' && !o.why) stop('a declined ask says why: --why <text>');
    const e = append(dir, ask.section, { type: 'reply', ask: id, role: o.by, state, ...(o.why ? { why: o.why } : {}) });
    console.log(`${e.id}: ${id} is ${state}`);
  }
  if (verb === 'asks') {
    if (!o.for) stop('--for <role> says whose asks to print');
    const open = openAsks(all, o.for, section);
    console.log(open.length ? open.map(a => `${a.id}  from ${a.by}${a.file ? `  ${a.file}` : ''}\n      ${a.what}${a.source ? `\n      source: ${a.source}` : ''}`).join('\n') : `nothing is open for ${o.for} in ${section}`);
  }
  if (verb === 'since') {
    if (!o.for) stop('--for <role> says whose files to look at');
    const list = since(all, o.for, section);
    console.log(list.length ? list.map(e => `${show(e)}\n      by ${e.role}${e.why ? `: ${e.why.severity}, ${e.why.kind}, ${e.why.source}` : ', with no why yet'}`).join('\n') : `nothing changed for ${o.for} in ${section} since its last run`);
  }
  if (verb === 'line') {
    if (!o.by) stop('--by <role> says whose return to print');
    console.log(line(all, o.by, section));
  }
}
