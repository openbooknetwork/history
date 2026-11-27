// Says what is still to do in a story, or in one section of it, from the story's log. Run from the repo root:
//   node scripts/next.mjs <story> [section number|story]
// Try: node scripts/next.mjs alexander-the-great 020
// `improvements-spec.md` is the design. It is the gate of a section and of a story: a manager may not report its
// work as done while this lists anything, and it ends with status 1 then. It lists, a line each:
//   fix      an owner with open asks: dispatch it with the task fix
//   recheck  a checker in whose files others changed something since its last run (scripts/pipeline.mjs says
//            which kinds of file each checker has the last word on): dispatch it with the task recheck
//   agree    an ask its owner answered, whose asker has no recheck: the manager reads the answer and replies
//   rule     an ask that waits for a manager's or the user's ruling
//   why      edits that still owe their reason
// It reads the log alone (scripts/fault.mjs). What a maker must build again because its inputs changed is the
// answer of `node scripts/inputs.mjs stands <story>`, and a story with no log has nothing listed here.
import fs from 'fs';
import path from 'path';
import { storyDir } from './story-dir.mjs';
import { PIPELINE } from './pipeline.mjs';
import { events, asks, since, unexplained, logDir, onLog } from './fault.mjs';

const stop = message => { console.error(message); process.exit(2); };
const [story, only] = process.argv.slice(2);
if (!story) stop('usage: node scripts/next.mjs <story> [section number|story], from the repo root');
const dir = storyDir(story);
if (!dir) stop(`no story folder is named ${story}`);
if (only && !/^(\d{3}|story)$/.test(only)) stop(`${only} is no section: give its three digits, or story`);

const RULERS = ['overseer', 'user', 'section-lead', 'research-coordinator', 'battle-coordinator'];
const all = events(dir);
const sections = only ? [only] : onLog(dir) ? fs.readdirSync(logDir(dir)).filter(n => n.endsWith('.jsonl')).map(n => n.slice(0, -6)).sort() : [];
const checkers = Object.keys(PIPELINE).filter(r => Object.values(PIPELINE[r]).some(t => t.settles?.length));
const rechecks = role => Boolean(PIPELINE[role]?.recheck);
const out = [];
for (const sec of sections) {
  const here = asks(all).filter(a => a.section === sec);
  const open = here.filter(a => a.state === 'open');
  const owners = [...new Set(open.filter(a => !RULERS.includes(a.for)).map(a => a.for))];
  for (const role of owners) out.push(`${sec}  fix      ${role}: ${open.filter(a => a.for === role).length} open, ${open.filter(a => a.for === role).map(a => a.id).join(' ')}`);
  for (const a of open.filter(a => RULERS.includes(a.for))) out.push(`${sec}  rule     ${a.for}: ${a.id}, from ${a.by}: ${String(a.what).slice(0, 90)}`);
  const answered = here.filter(a => a.state === 'answered');
  for (const a of answered.filter(a => !rechecks(a.by))) out.push(`${sec}  agree    ${a.id}, from ${a.by}, ${a.replies.at(-1).state} by ${a.replies.at(-1).role}: reply agreed or again`);
  for (const role of checkers) {
    const changed = sec === 'story' ? [] : since(all, role, sec).filter(e => e.section === sec || e.section === 'story');
    const mine = answered.filter(a => a.by === role);
    if (changed.length || mine.length) out.push(`${sec}  recheck  ${role}: ${changed.length} changes by others in its files, ${mine.length} of its asks answered`);
  }
  for (const role of [...new Set(all.filter(e => e.type === 'edit' && e.section === sec).map(e => e.role))]) {
    const owed = unexplained(all, role, sec).filter(e => e.section === sec);
    if (owed.length) out.push(`${sec}  why      ${role}: ${owed.length} edits owe a reason`);
  }
}
if (!out.length) { console.log(`nothing: ${only ?? story} is done, as far as the log says`); process.exit(0); }
console.log(out.join('\n'));
process.exit(1);
