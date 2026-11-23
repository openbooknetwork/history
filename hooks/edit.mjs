// PostToolUse on Write and Edit. Runs the check that fits the file that changed, and hands its problems back:
//   a plan file           plan-check on its section
//   research.md           quotes-check, where the story's sources are fetched
//   a text                rules-lint and names-check on its section, each kept to the lines that name the file
//   a page.yaml           rules-lint on its section, kept to the lines that name the file
//   a fault list, fix log the file parses as a YAML list
// A file outside content/ passes.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { input, script, refuse, place } from './lib.mjs';

const file = input().tool_input?.file_path;
const at = file && place(file);
if (!at) process.exit(0);
const { story, dir, rest, tail, section } = at;
const problems = [];
const about = out => out.split('\n').filter(l => l.includes(tail));
const lint = () => {
  // a fault of the linter is a YAML entry: keep the entries whose file is this one
  const r = script('rules-lint.mjs', [story, section]);
  if (r.ok) return;
  try { for (const f of yaml.load(r.out) ?? []) if (String(f.file).endsWith(tail)) problems.push(`${f.field ?? 'the file'}: ${f.new}`); } catch { /* not a fault list */ }
};

if (rest[0] === '.plan' && section && /\.yaml$/.test(tail)) {
  const r = script('plan-check.mjs', [story, section]);
  if (!r.ok) problems.push(...r.out.split('\n'));
} else if (tail === '.plan/research.md' && fs.existsSync(path.join(dir, '.references'))) {
  const r = script('quotes-check.mjs', [story], 110000);
  if (!r.ok) problems.push(...r.out.split('\n').slice(0, 30));
} else if (rest[0] === '.plan' && ['faults', 'fixes', 'images', 'reports'].includes(rest[1]) && /\.yaml$/.test(tail)) {
  try {
    const doc = yaml.load(fs.readFileSync(file, 'utf8'));
    if (!tail.endsWith('.inputs.yaml') && !Array.isArray(doc)) problems.push('the file is a YAML list, one entry a fault, a fix, an image or a report');
  } catch (e) { problems.push(`not valid YAML: ${e.reason ?? e.message}`); }
} else if (rest[0] === 'pages' && section && /text\/en\.md$/.test(tail)) {
  lint();
  problems.push(...about(script('names-check.mjs', [story, section]).out));
} else if (rest[0] === 'pages' && section && tail.endsWith('page.yaml')) lint();

if (problems.length) refuse(`${path.relative(process.cwd(), file)}:\n${problems.join('\n')}`);
