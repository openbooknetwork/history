// PreToolUse on Bash. Inside an agent, every git command that writes is refused: commit, add, stash, reset,
// checkout, push and the like. Agents write files beside each other, and one program alone saves them,
// scripts/save.mjs, which the manager runs (improvements-spec.md, part 5). A command that only reads passes:
// status, diff, log, show. So does a command with no git in it, and so does the main session.
import { input, refuse } from './lib.mjs';

const WRITES = new Set(['commit', 'add', 'stash', 'reset', 'checkout', 'restore', 'switch', 'clean', 'rebase', 'merge', 'cherry-pick', 'revert', 'push', 'pull', 'rm', 'mv', 'apply', 'am', 'tag']);
// options of git itself that stand before the verb and take a value of their own
const VALUED = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--config-env']);

const hook = input();
if (!hook.agent_id) process.exit(0);
const command = String(hook.tool_input?.command ?? '');
for (const part of command.split(/&&|\|\||;|\||\n/)) {
  const words = part.trim().split(/\s+/).map(w => w.replace(/^[('"`${]+/, '').replace(/[)'"`}]+$/, ''));
  for (let git = 0; git < words.length; git++) {
    if (words[git] !== 'git' && !words[git].endsWith('/git')) continue;
    let at = git + 1;
    while (words[at]?.startsWith('-')) at += VALUED.has(words[at]) ? 2 : 1;
    const verb = words[at], rest = words.slice(at + 1);
    const branch = verb === 'branch' && rest.some(w => ['--delete', '--move'].includes(w) || /^-[a-zA-Z]*[dDmM]/.test(w));
    if (WRITES.has(verb) || branch) refuse('No agent runs a git command that writes: the manager saves the work with scripts/save.mjs. To see what changed, run node scripts/fault.mjs since <story> <section> --for <your role>.');
  }
}
