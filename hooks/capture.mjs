// PostToolUse on Edit, Write and Bash. Writes each change of a story's file to the story's log as an `edit` event
// (scripts/fault.mjs, improvements-spec.md), so no agent types the record of a change. A story is on the log once
// its .plan/log folder exists: for any other story this does nothing.
//   Edit   the file, with the old and the new text as the tool was given them
//   Write  the file, as written whole
//   Bash   a command tells a hook nothing of what it changed, so the story's text files are compared with what
//          they were at the last capture, by what they hold, and each that differs is written as changed whole. A
//          file its section's generator writes is marked `generated`: the edit of the generator explains it, and
//          a file a generator wrote again with nothing new in it is no change.
// Every event holds the agent and its role, and the file's time, by which two hooks that saw one change are told
// apart. Two agents that run commands in the same second can have a change put down to the wrong one of them.
// Nothing here refuses anything.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { input, role, place } from './lib.mjs';
import { append, onLog } from '../scripts/fault.mjs';
import { kindOf } from '../scripts/pipeline.mjs';

const hook = input(), t = hook.tool_input ?? {};
const who = hook.agent_id ? role(hook.agent_type) : 'main', agent = hook.agent_id ?? 'main';
const CUT = 4000;
const cut = s => { s = String(s ?? ''); return s.length > CUT ? `${s.slice(0, CUT)}… (${s.length} characters)` : s; };
const TEXT = /\.(md|ya?ml|json|geojson|[cm]?js|urls|txt)$/;
const SKIP = new Set(['.references', '.wikipedia', '.candidates', 'node_modules', 'log']);
// what a script makes afresh and git ignores: the slices of the plan, and the records of what stands
// and the reports, which the hook that ends a run writes from the log
const MADE = /\/\.plan\/((research|names|passages|brief|sources-index)-[^/]*\.md|reports\/[^/]*\.yaml)$/;

const manifestOf = story => path.join('.cache', 'capture', `${story}.json`);
const load = story => { try { return JSON.parse(fs.readFileSync(manifestOf(story), 'utf8')); } catch { return null; } };
const save = (story, m) => { const f = manifestOf(story); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(`${f}.${process.pid}`, JSON.stringify(m)); fs.renameSync(`${f}.${process.pid}`, f); };
// a file's time, its size and the hash of what it holds. A generator writes every file of its section again, so a
// new time alone says nothing: the hash of a file whose time and size are as they were is taken from the last capture
const digest = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16);
const stamp = (f, was) => { try { const s = fs.statSync(f), t = Math.round(s.mtimeMs); return [t, s.size, was && was[0] === t && was[1] === s.size && was[2] ? was[2] : digest(f)]; } catch { return null; } };
function walk(dir, was, out = {}) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(full, was, out); } else if (TEXT.test(e.name) && !MADE.test(`/${full}`)) out[full] = stamp(full, was?.[full]);
  }
  return out;
}
// a file of a kind its section's generator writes, where the story has that generator
function generated(p, rel) {
  const gens = path.join(p.dir, '.plans');
  if (!fs.existsSync(gens)) return false;
  const kind = kindOf(rel), names = fs.readdirSync(gens);
  if (['pages', 'markers', 'routes'].includes(kind) || /\/pages\/.*group\.yaml$/.test(`/${rel}`)) return names.some(n => p.section ? n.startsWith(`pages${p.section}.`) : /^pages\d{3}\./.test(n));
  return kind === 'zones' && names.some(n => /^zones\./.test(n));
}

if (hook.tool_name === 'Edit' || hook.tool_name === 'Write') {
  const p = place(String(t.file_path ?? ''));
  if (!p || !onLog(p.dir)) process.exit(0);
  const rel = path.relative(process.cwd(), path.resolve(t.file_path)), at = stamp(rel);
  append(p.dir, p.section, { type: 'edit', agent, role: who, file: rel, mtime: at?.[0] ?? null,
    ...(hook.tool_name === 'Edit' ? { old: cut(t.old_string), new: cut(t.new_string), ...(t.replace_all ? { all: true } : {}) } : { whole: true, ...(hook.tool_response?.type === 'create' ? { created: true } : {}) }) });
  const m = load(p.story); if (m) { m[rel] = at; save(p.story, m); }
  process.exit(0);
}

if (hook.tool_name === 'Bash') {
  const stories = [];
  (function find(dir, depth) { for (const e of fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []) { if (!e.isDirectory() || e.name.startsWith('.')) continue; const full = path.join(dir, e.name); if (fs.existsSync(path.join(full, 'story.yaml'))) { if (onLog(full)) stories.push([e.name, full]); } else if (depth < 2) find(full, depth + 1); } })('content', 0);
  for (const [story, dir] of stories) {
    const was = load(story), now = walk(dir, was);
    if (was) for (const [rel, at] of Object.entries(now)) {
      if (was[rel] && was[rel][2] === at[2]) continue;          // written again with what it held: no change
      const p = place(rel);
      append(dir, p?.section ?? null, { type: 'edit', agent, role: who, file: rel, mtime: at[0], whole: true, by: 'command', hash: at[2], ...(was[rel] ? { was: was[rel][2] ?? null } : { created: true }), ...(p && generated(p, rel) ? { generated: true } : {}) });
    }
    save(story, now);
  }
}
process.exit(0);
