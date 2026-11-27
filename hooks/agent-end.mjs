// SubagentStop. On a story that is on the log (agents/log.md, scripts/fault.mjs) an agent ends with the line of
// its return, its end is written to the log, and its report is made from the log: see below.
// On any other story an agent of the pipeline ends with the block of "The report" in agents/report.md, and it keeps
// working until it has one. Each fault its block names is in a fault list, each entry of a fix log names a fault
// that exists, and what it built from is compared with the hashes recorded at its dispatch: a file that changed
// under it is named, so its report can say that its work is stale.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { input, roles, role, script, refuse } from './lib.mjs';
import { storyDir } from '../scripts/story-dir.mjs';
import { checkDispatch } from '../scripts/transcripts.mjs';
import { append, events, onLog, line, unexplained, asks, edits } from '../scripts/fault.mjs';

const hook = input();
const who = role(hook.agent_type);
if (!roles().includes(who)) process.exit(0);
const last = String(hook.last_assistant_message ?? '');

// the dispatch: the block the agent's transcript opens with
let dispatch = {};
try {
  const first = fs.readFileSync(hook.agent_transcript_path, 'utf8').split('\n').find(l => l.includes('"type":"user"'));
  const content = JSON.parse(first).message.content;
  const text = typeof content === 'string' ? content : content.find(b => b.type === 'text')?.text ?? '';
  dispatch = checkDispatch(text, null, null).block ?? {};
} catch { /* no transcript to read */ }
const dir = dispatch.story && storyDir(String(dispatch.story));

// A story on the log (agents/log.md): the agent ends with the line of its return and owes a why for its edits.
// It is refused once. Then, whatever it answers, its end is written to the log, and its report to reports/ in
// the form the report had, so what reads that file still does: scripts/inputs.mjs to close the run's record.
if (dir && onLog(dir)) {
  const sec = /^\d{3}$/.test(String(dispatch.section ?? '')) ? String(dispatch.section) : 'story';
  const all = events(dir), want = line(all, who, sec), owed = unexplained(all, who, sec, hook.agent_id ?? null);
  const told = last.trim().split('\n').pop().trim() === want;
  if (!hook.stop_hook_active && (owed.length || !told)) refuse([
    owed.length ? `${owed.length} of your edits owe a why. List them with: node scripts/fault.mjs why ${dispatch.story} ${sec} --by ${who}. Then give their reasons, as agents/log.md says.` : '',
    `End with this line alone, and nothing after it: ${owed.length ? 'the one that node scripts/fault.mjs line prints then' : want}`].filter(Boolean).join('\n'));
  append(dir, sec === 'story' ? null : sec, { type: 'end', agent: hook.agent_id ?? null, role: who, task: dispatch.task ?? null, step: dispatch.step ?? null, ...(dispatch.pages ? { pages: String(dispatch.pages) } : {}), ...(dispatch.battle ? { battle: dispatch.battle } : {}), ...(owed.length ? { unexplained: owed.length } : {}) });
  const [result, open] = want.split(' ');
  const mine = asks(all).filter(a => a.by === who && a.state !== 'closed' && (sec === 'story' || a.section === sec));
  const rulers = ['overseer', 'user', 'section-lead', 'research-coordinator', 'battle-coordinator'];
  const stale = script('inputs.mjs', ['check', String(dispatch.story), who, String(dispatch.section ?? ''), ...(dispatch.battle ? ['--battle', String(dispatch.battle)] : [])]);
  const entry = { step: dispatch.step ?? null, task: dispatch.task ?? null, status: result === 'blocked' ? 'blocked' : Number(open) > 0 ? 'faults' : 'pass',
    changed_files: [...new Set(edits(all).filter(e => e.agent === hook.agent_id).map(e => e.file))],
    faults: mine.filter(a => !rulers.includes(a.for)).map(a => a.id), unresolved: mine.filter(a => rulers.includes(a.for)).map(a => `${a.id}: ${a.what}`),
    stale: !stale.ok && stale.out && !/is missing|no role/.test(stale.out) ? stale.out.split('\n').map(l => l.split(' ')[0]) : [], made_by: 'hooks/agent-end.mjs, from the log' };
  const file = path.join(dir, '.plan', 'reports', `${dispatch.section ?? 'all'}-${who}${dispatch.battle ? `-${dispatch.battle}` : dispatch.lang ? `-${dispatch.lang}` : ''}.yaml`);
  // the entry is added at the end of the file as text, so the entries before it stay as they were written
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let before = ''; try { before = fs.readFileSync(file, 'utf8'); } catch { /* no report yet */ }
  if (/^\s*\[\s*\]\s*$/.test(before)) before = '';
  fs.writeFileSync(file, `${before}${before && !before.endsWith('\n') ? '\n' : ''}${yaml.dump([entry], { lineWidth: 110 })}`);
  // in a cloud session the story's folder is saved and pushed as each run ends, so a container that is taken away
  // loses only work that had not ended (scripts/save.mjs holds a lock, so two runs that end together both save)
  if (process.env.CLAUDE_CODE_REMOTE === 'true') script('save.mjs', [String(dispatch.story), '--message', `${dispatch.story}: ${dispatch.step ?? ''} ${dispatch.section ?? ''} ${who} ${dispatch.task ?? ''}, saved as it ended`.replace(/\s+/g, ' '), '--push'], 110000);
  process.exit(0);
}

if (hook.stop_hook_active) process.exit(0);
let block = null;
for (const [, body] of last.matchAll(/```ya?ml[^\n]*\n([\s\S]*?)```/g)) {
  try { const doc = yaml.load(body); if (doc && ['pass', 'faults', 'blocked'].includes(doc.status)) block = doc; } catch { /* not the block */ }
}
if (!block) refuse('End with the report of "The report" in agents/report.md: its block in a fenced yaml block, with a status of pass, faults or blocked, and at most ten lines after it.');
if (!dir) process.exit(0);

const problems = [];
const lists = folder => {
  const d = path.join(dir, '.plan', folder);
  return fs.existsSync(d) ? fs.readdirSync(d).filter(n => n.endsWith('.yaml') && !n.endsWith('.inputs.yaml')).flatMap(n => { try { return yaml.load(fs.readFileSync(path.join(d, n), 'utf8')) ?? []; } catch { return []; } }) : [];
};
const faults = new Set(lists('faults').map(f => String(f?.id)));
for (const id of Array.isArray(block.faults) ? block.faults : []) if (!faults.has(String(id))) problems.push(`the block names the fault ${id}, which is in no fault list: write it there first`);
for (const x of lists('fixes')) if (x?.by === who && !faults.has(String(x.fault))) problems.push(`a fix log entry of yours names the fault ${x.fault ?? '(none)'}, which is in no fault list: no fix without its fault`);
const section = String(dispatch.section ?? '');
const saved = path.join(dir, '.plan', 'reports', `${section}-${who}${dispatch.battle ? `-${dispatch.battle}` : dispatch.lang ? `-${dispatch.lang}` : ''}.yaml`);
if (!fs.existsSync(saved)) problems.push(`save the block to ${saved}, as one entry of its list`);
const stale = script('inputs.mjs', ['check', String(dispatch.story), who, section, ...(dispatch.battle ? ['--battle', String(dispatch.battle)] : [])]);
if (!stale.ok && stale.out && !/is missing|no role/.test(stale.out)) {
  const named = JSON.stringify(block.stale ?? []);
  const unsaid = stale.out.split('\n').filter(l => !named.includes(l.split(' ')[0].split('#')[0]));
  if (unsaid.length) problems.push(`these changed under you, so say under "stale" what you built from them:\n${unsaid.join('\n')}`);
}
if (problems.length) refuse(problems.join('\n'));
