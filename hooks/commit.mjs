// PreToolUse on Bash. Inside an agent, a commit names its paths: "git commit -a", "git add -A", "git add ." and
// "git add -u" take another agent's half-written files along, and are refused. The main session passes.
import { input, refuse } from './lib.mjs';

const hook = input();
if (!hook.agent_id) process.exit(0);
const command = String(hook.tool_input?.command ?? '');
for (const part of command.split(/&&|\|\||;|\n/)) {
  const words = part.trim().split(/\s+/);
  const git = words.indexOf('git');
  if (git < 0) continue;
  const verb = words[git + 1], rest = words.slice(git + 2);
  const all = verb === 'add' && rest.some(w => ['-A', '--all', '.', '-u', '--update'].includes(w));
  const dashA = verb === 'commit' && rest.some(w => w === '--all' || /^-[a-zA-Z]*a[a-zA-Z]*$/.test(w) && w !== '--amend');
  if (all || dashA) refuse('Name the paths: "git add <paths>" and "git commit <paths>". Other agents are writing files beside you, and this command would take theirs into your commit.');
}
