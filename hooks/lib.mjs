// What the hooks share. A hook reads one JSON object on its standard input and runs in the project's folder.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

export const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const input = () => { try { return JSON.parse(fs.readFileSync(0, 'utf8')); } catch { return {}; } };
// the roles of the pipeline: the definitions the plugin ships
export const roles = () => fs.readdirSync(path.join(root, '.claude', 'agents')).filter(n => n.endsWith('.md')).map(n => n.slice(0, -3));
export const role = type => String(type ?? '').split(':').pop();
// run one of the repo's scripts, and return what it printed and whether it passed
export function script(name, args, timeout = 60000) {
  const r = spawnSync('node', [path.join(root, 'scripts', name), ...args], { encoding: 'utf8', timeout });
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}
// hand a reason back to the model: the tool call is refused, or the agent keeps working
export function refuse(reason) { process.stderr.write(reason + '\n'); process.exit(2); }
// the story and the section a file of the book belongs to: content/[group/]<story>/...
export function place(file) {
  const rel = path.relative(process.cwd(), path.resolve(file)).split(path.sep);
  if (rel[0] !== 'content') return null;
  for (let i = 1; i < rel.length; i++) {
    if (!fs.existsSync(path.join(...rel.slice(0, i + 1), 'story.yaml'))) continue;
    const rest = rel.slice(i + 1), tail = rest.join('/');
    const section = (rest[0] === 'pages' || rest[0] === '.plan' ? rest[1] : '')?.match(/^(\d{3})-/)?.[1] ?? null;
    return { story: rel[i], dir: rel.slice(0, i + 1).join('/'), rest, tail, section };
  }
  return null;
}
