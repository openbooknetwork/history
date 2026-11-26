// PostToolUse on Agent. As a dispatched agent of one of the pipeline's roles ends, the record that
// hooks/dispatch.mjs opened is closed by scripts/inputs.mjs seal: how its report says it ended, the inputs it
// changed itself, what it made, and for a checker what it checks as it left it (skip-spec.md). A dispatch sent to
// the background answers at once, long before its agent ends, and is not closed: its record stays open, and an
// open record never stands. Nothing here stops anything: a seal that fails leaves the record open.
import { input, roles, role, script } from './lib.mjs';
import { checkDispatch } from '../scripts/transcripts.mjs';

const { tool_input: t = {}, tool_response: answer = {} } = input();
const who = role(t.subagent_type);
if (!roles().includes(who) || typeof t.prompt !== 'string') process.exit(0);
if (t.run_in_background === true || /async/i.test(String(answer?.status ?? ''))) process.exit(0);
const { block, problems } = checkDispatch(t.prompt, who, t.description ?? '');
if (!block || problems.length) process.exit(0);
script('inputs.mjs', ['seal', String(block.story), who, String(block.section), '--task', String(block.task), ...(block.battle ? ['--battle', String(block.battle)] : [])], 100000);
process.exit(0);
