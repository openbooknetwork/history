// PreToolUse on Agent. A dispatch of one of the pipeline's roles opens with the block of "The dispatch" in
// agents/report.md, and one that breaks the form does not start. For a dispatch that passes, the section's slices
// are made afresh. Then scripts/inputs.mjs says whether the role's work still stands (skip-spec.md): where it
// does, no agent starts, and the manager is told so with the role's last report. Where it does not, the record of
// what the agent builds from is opened, and hooks/dispatch-end.mjs closes it as the agent ends. Other agent types
// pass untouched. A check that fails here lets the dispatch through.
import { input, roles, role, script, refuse } from './lib.mjs';
import { checkDispatch } from '../scripts/transcripts.mjs';

const { tool_input: t = {} } = input();
const who = role(t.subagent_type);
if (!roles().includes(who) || typeof t.prompt !== 'string') process.exit(0);
const { block, problems } = checkDispatch(t.prompt, who, t.description ?? '');
if (problems.length) refuse(`This dispatch of ${who} breaks the dispatch form of agents/report.md: ${problems.join('; ')}. Send the block alone, with the description "<step> <section> <role> <task>".`);
const section = String(block.section);
if (/^\d{3}$/.test(section)) script('slice.mjs', [String(block.story), section]);
const words = [String(block.story), who, section, '--task', String(block.task), '--step', String(block.step), ...(block.battle ? ['--battle', String(block.battle)] : []), ...(block.note ? ['--note', String(block.note)] : [])];
// `pages` narrows a dispatch to named pages, and `again: true` asks for the work whatever the record says
if (block.again !== true && block.pages == null) {
  const fresh = script('inputs.mjs', ['fresh', ...words], 100000);
  if (fresh.ok && /^stands: /.test(fresh.out)) {
    const reason = `STILL STANDS, NO AGENT WAS STARTED AND NONE IS NEEDED. This is no error and nothing failed: do not send this dispatch again. ${fresh.out.replace(/^stands: /, '')}\n\nTake that report as the answer to this dispatch and go on to your next step. To have the work done again all the same, which is right only where you know what no file shows, send the dispatch with \`again: true\`.`;
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
    process.exit(0);
  }
}
script('inputs.mjs', ['open', ...words]);
