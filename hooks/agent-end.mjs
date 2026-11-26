// SubagentStop. An agent of the pipeline ends with the block of "The report" in agents/report.md, and it keeps
// working until it has one. Each fault its block names is in a fault list, each entry of a fix log names a fault
// that exists, and what it built from is compared with the hashes recorded at its dispatch: a file that changed
// under it is named, so its report can say that its work is stale.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { input, roles, role, script, refuse } from './lib.mjs';
import { storyDir } from '../scripts/story-dir.mjs';
import { checkDispatch } from '../scripts/transcripts.mjs';

const hook = input();
const who = role(hook.agent_type);
if (!roles().includes(who) || hook.stop_hook_active) process.exit(0);
const last = String(hook.last_assistant_message ?? '');
let block = null;
for (const [, body] of last.matchAll(/```ya?ml[^\n]*\n([\s\S]*?)```/g)) {
  try { const doc = yaml.load(body); if (doc && ['pass', 'faults', 'blocked'].includes(doc.status)) block = doc; } catch { /* not the block */ }
}
if (!block) refuse('End with the report of "The report" in agents/report.md: its block in a fenced yaml block, with a status of pass, faults or blocked, and at most ten lines after it.');

// the dispatch: the block the agent's transcript opens with
let dispatch = {};
try {
  const first = fs.readFileSync(hook.agent_transcript_path, 'utf8').split('\n').find(l => l.includes('"type":"user"'));
  const content = JSON.parse(first).message.content;
  const text = typeof content === 'string' ? content : content.find(b => b.type === 'text')?.text ?? '';
  dispatch = checkDispatch(text, null, null).block ?? {};
} catch { /* no transcript to read */ }
const dir = dispatch.story && storyDir(String(dispatch.story));
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
