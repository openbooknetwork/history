// PreToolUse on Agent. A dispatch of one of the pipeline's roles opens with the block of "The dispatch" in
// agents/report.md, and one that breaks the form does not start. For a dispatch that passes, the section's slices
// are made afresh and the hashes of what the agent builds from are recorded. Other agent types pass untouched.
import { input, roles, role, script, refuse } from './lib.mjs';
import { checkDispatch } from '../scripts/transcripts.mjs';

const { tool_input: t = {} } = input();
const who = role(t.subagent_type);
if (!roles().includes(who) || typeof t.prompt !== 'string') process.exit(0);
const { block, problems } = checkDispatch(t.prompt, who, t.description ?? '');
if (problems.length) refuse(`This dispatch of ${who} breaks the dispatch form of agents/report.md: ${problems.join('; ')}. Send the block alone, with the description "<step> <section> <role> <task>".`);
const section = String(block.section);
if (/^\d{3}$/.test(section)) script('slice.mjs', [String(block.story), section]);
script('inputs.mjs', ['record', String(block.story), who, section, ...(block.battle ? ['--battle', String(block.battle)] : [])]);
