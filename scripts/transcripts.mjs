// Reads the transcripts of an agent run for token-ledger.mjs and fault-ledger.mjs. Run from the repo root.
//
// A run is one or more of:
//   <project>/<session>.jsonl   a session's own transcript, read with the agents of <project>/<session>/ beside it
//   a folder                    every .jsonl and .output file under it
//   <file>.json                 a run saved earlier with --json
//
// Each agent is tagged without a hand-kept list:
//   role     the agent type in agent-<id>.meta.json beside its transcript, else the type the overseer's own
//            transcript dispatched its first prompt with, else the --roles file ("<role> <agent id>" pairs on any
//            line), else "overseer" for a session's own transcript
//   section  the first of the story's section numbers in the dispatch's description, else in its prompt; "-" for
//            the agents that work on the whole story
//   step     the overseer's step of that role, as STEPS lists them. "step <n>" in the dispatch's description
//            overrides it, and the editor is step 7 or 13 by the word plans or texts in its prompt
// An agent that is resumed with another section's work is counted under each section in turn: every prompt it is
// sent starts a part, and each message's tokens go to the part it was written in.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

export const STEPS = {
  researcher: 2, names: 3, 'map-architect': 5, 'section-coordinator': 6, editor: 7, cartographer: 8,
  'map-auditor': 8, 'section-writer': 8, 'battle-coordinator': 9, 'battle-implementor': 10, 'battle-auditor': 10,
  'image-finder': 11, 'fact-checker': 12, 'section-reviewer': 12, 'story-auditor': 14, 'name-finder': 16,
  translator: 17, 'translation-reviewer': 17,
};
// The step whose check should catch a fault, by the work that introduced it: the "introduced" line of
// agents/report.md. A wrong fault caught at a later step is a leak. A fault made by a fix or a ruling has no first
// check.
export const FIRST_CHECK = {
  source: 2, research: 2, names: 3, brief: 4, 'map-design': 5, plan: 7, maps: 8, 'battle-plan': 9, battles: 10,
  texts: 12, images: 12, review: 13,
};
const WHOLE_STORY = new Set(['overseer', 'researcher', 'names', 'map-architect', 'editor', 'story-auditor', 'name-finder', 'translator', 'translation-reviewer']);
const AGENT_ID = /a[0-9a-f]{16}/;
const VALUE_FLAGS = ['story', 'roles', 'variant', 'weights', 'pages', 'by'];
const SWITCHES = ['json'];

export function parseArgs(argv) {
  const opts = { paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i].startsWith('--') ? argv[i].slice(2) : null;
    if (flag === null) opts.paths.push(argv[i]);
    else if (VALUE_FLAGS.includes(flag)) {
      if (argv[i + 1] === undefined) stop(`--${flag} takes a value`);
      opts[flag] = argv[++i];
    } else if (SWITCHES.includes(flag)) opts[flag] = true;
    else stop(`unknown option --${flag}`);
  }
  return opts;
}

export function stop(message) { console.error(message); process.exit(2); }

function walk(dir, out) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) walk(full, out);
    else if (/\.(jsonl|output)$/.test(d.name)) out.add(full);
  }
}

function transcriptFiles(paths) {
  const out = new Set();
  for (const p of paths) {
    if (!fs.existsSync(p)) stop(`${p} is missing`);
    if (fs.statSync(p).isDirectory()) {
      walk(p, out);
      if (fs.existsSync(p.replace(/\/+$/, '') + '.jsonl')) out.add(p.replace(/\/+$/, '') + '.jsonl');
    } else {
      out.add(p);
      const beside = p.replace(/\.jsonl$/, '');
      if (beside !== p && fs.existsSync(beside) && fs.statSync(beside).isDirectory()) walk(beside, out);
    }
  }
  return [...out].sort();
}

// a prompt is a user message that carries no tool result
function promptText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content) || content.some(b => b?.type === 'tool_result')) return null;
  return content.filter(b => b?.type === 'text').map(b => b.text).join('\n') || null;
}

function readTranscript(file) {
  const t = { file, agentId: null, prompts: [], messages: new Map(), texts: [], dispatches: [], start: null, end: null, model: null };
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (!o || typeof o !== 'object') continue;
    t.agentId ??= o.agentId ?? null;
    if (o.timestamp) { t.start ??= o.timestamp; t.end = o.timestamp; }
    const m = o.message;
    if (!m || typeof m !== 'object') continue;
    if (o.type === 'user' && !o.isMeta) {
      const text = promptText(m.content);
      if (text !== null) t.prompts.push(text);
      continue;
    }
    if (o.type !== 'assistant') continue;
    const part = Math.max(0, t.prompts.length - 1);
    // a message is written to the transcript once per content block, each time with the same usage
    if (m.usage) t.messages.set(m.id ?? `#${t.messages.size}`, { part, usage: m.usage });
    if (m.model && !m.model.startsWith('<')) t.model = m.model;
    for (const b of Array.isArray(m.content) ? m.content : []) {
      if (b?.type === 'text' && b.text) t.texts.push({ part, text: b.text });
      if (b?.type === 'tool_use' && typeof b.input?.prompt === 'string' && b.input.subagent_type) t.dispatches.push(b.input);
      // an agent's final report can be the input of its hand-back tool call
      if (b?.type === 'tool_use' && /handback/i.test(b.name ?? '')) {
        for (const v of Object.values(b.input ?? {})) if (typeof v === 'string') t.texts.push({ part, text: v });
      }
    }
  }
  t.agentId ??= path.basename(file).match(AGENT_ID)?.[0] ?? null;
  const meta = file.replace(/\.(jsonl|output)$/, '.meta.json');
  try { t.meta = JSON.parse(fs.readFileSync(meta, 'utf8')); } catch { t.meta = {}; }
  return t;
}

function stories(dir = 'content', out = {}) {
  if (!fs.existsSync(dir)) return out;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('.') || (dir === 'content' && d.name === 'shared')) continue;
    const full = path.join(dir, d.name);
    if (fs.existsSync(path.join(full, 'story.yaml'))) out[d.name] = full;
    else stories(full, out);
  }
  return out;
}

function countPages(dir) {
  let n = 0;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory()) n += countPages(path.join(dir, d.name));
    else if (d.name === 'page.yaml') n++;
  }
  return n;
}

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mentions = (text, word) => new RegExp(`(?<![\\w-])${escape(word)}(?![\\w-])`).test(text);

function pickStory(opts, transcripts) {
  const all = stories();
  if (opts.story) {
    if (!all[opts.story]) stop(`--story ${opts.story}: no story folder has that name`);
    return opts.story;
  }
  const first = transcripts.map(t => t.prompts[0] ?? '');
  const counted = Object.keys(all).map(name => [name, first.filter(p => mentions(p, name)).length]).filter(([, n]) => n);
  counted.sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
  return counted[0]?.[0] ?? null;
}

// the report block of agents/report.md, in a fenced yaml block
function reportBlocks(text) {
  const out = [];
  for (const [, body] of text.matchAll(/```ya?ml[^\n]*\n([\s\S]*?)```/g)) {
    let doc;
    try { doc = yaml.load(body); } catch { continue; }
    if (doc && typeof doc === 'object' && ['pass', 'faults', 'blocked'].includes(doc.status)) out.push(doc);
  }
  return out;
}

function fromTranscripts(opts) {
  const transcripts = transcriptFiles(opts.paths).map(readTranscript).filter(t => t.messages.size);
  if (!transcripts.length) stop('no transcript with token usage under the paths given');
  const roles = {};
  if (opts.roles) {
    for (const [, role, id] of fs.readFileSync(opts.roles, 'utf8').matchAll(/([\w-]+) (a[0-9a-f]{16})/g)) roles[id] = role;
  }
  const story = pickStory(opts, transcripts);
  const storyDir = story && stories()[story];
  const pagesDir = storyDir && path.join(storyDir, 'pages');
  const sections = pagesDir && fs.existsSync(pagesDir)
    ? fs.readdirSync(pagesDir).filter(n => /^\d{3}-/.test(n) && fs.statSync(path.join(pagesDir, n)).isDirectory())
    : [];
  const numbers = sections.map(s => s.slice(0, 3));
  const sectionIn = text => {
    if (!numbers.length) return null;
    return text.match(new RegExp(`(?<!\\d)(${numbers.join('|')})(?!\\d)`))?.[1] ?? null;
  };

  const dispatched = new Map(transcripts.flatMap(t => t.dispatches).map(d => [d.prompt.trim(), d]));
  const usage = [], reports = [], agents = [];
  for (const t of transcripts) {
    const named = roles[t.agentId] ?? '';
    const dispatch = t.agentId ? dispatched.get((t.prompts[0] ?? '').trim()) : null;
    const role = t.meta.agentType ?? dispatch?.subagent_type ?? (named.replace(/-?\d{3}$/, '') || (t.agentId ? '?' : 'overseer'));
    const description = t.meta.description ?? dispatch?.description ?? '';
    const stepTag = description.match(/\bstep (\d{1,2})\b/i)?.[1];
    const whole = WHOLE_STORY.has(role);
    let section = whole ? '-' : sectionIn(description) ?? named.match(/(\d{3})$/)?.[1] ?? '-';
    let step = stepTag ? +stepTag : STEPS[role] ?? '-';
    const tags = t.prompts.map((prompt, i) => {
      if (!whole && !(i === 0 && sectionIn(description))) section = sectionIn(prompt) ?? section;
      if (role === 'editor' && !stepTag) {
        const plans = prompt.search(/\bplans\b/), texts = prompt.search(/\btexts\b/);
        if (plans >= 0 || texts >= 0) step = texts >= 0 && (plans < 0 || texts < plans) ? 13 : 7;
      }
      return { section, step };
    });
    if (!tags.length) tags.push({ section, step });
    const agent = t.agentId ?? path.basename(t.file).replace(/\.(jsonl|output)$/, '');
    const model = t.meta.model ?? t.model ?? '?';
    agents.push({ agent, role, model, start: t.start, end: t.end, description });

    const rows = new Map();
    for (const { part, usage: u } of t.messages.values()) {
      const tag = tags[part] ?? tags[0];
      const key = `${tag.step} ${tag.section}`;
      if (!rows.has(key)) rows.set(key, { agent, role, model, step: tag.step, section: tag.section, turns: 0, peak: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 });
      const r = rows.get(key);
      const input = u.input_tokens ?? 0, write = u.cache_creation_input_tokens ?? 0, read = u.cache_read_input_tokens ?? 0;
      r.turns++;
      r.peak = Math.max(r.peak, input + write + read);
      r.input += input; r.cacheWrite += write; r.cacheRead += read; r.output += u.output_tokens ?? 0;
    }
    usage.push(...rows.values());

    if (role === 'overseer') continue;
    // an agent can print its block more than once before it ends a part: the last one is its report
    const last = new Map();
    for (const { part, text } of t.texts) for (const doc of reportBlocks(text)) last.set(part, doc);
    for (const [part, doc] of last) {
      const tag = tags[part] ?? tags[0];
      reports.push({
        agent, role, step: tag.step, section: tag.section, status: doc.status,
        changed: Array.isArray(doc.changed_files) ? doc.changed_files.length : 0,
        unresolved: Array.isArray(doc.unresolved) ? doc.unresolved.length : 0,
        faults: (Array.isArray(doc.faults) ? doc.faults : []).filter(f => f && typeof f === 'object').map(f => {
          const firstCheck = FIRST_CHECK[f.introduced] ?? null;
          return {
            severity: f.severity ?? '?', kind: f.kind ?? '?', introduced: f.introduced ?? null, firstCheck,
            leak: f.severity === 'wrong' && firstCheck !== null && tag.step !== '-' && tag.step > firstCheck,
            owner: f.owner ?? null, file: f.file ?? null, claim: f.claim == null ? null : String(f.claim),
            evidence: f.evidence ?? null, action: f.action ?? null,
          };
        }),
      });
    }
  }
  const used = new Set(usage.map(r => r.section).filter(s => s !== '-'));
  const counted = sections.filter(s => !used.size || used.has(s.slice(0, 3)));
  const pages = counted.reduce((n, s) => n + countPages(path.join(pagesDir, s)), 0) || null;
  return { variant: opts.variant ?? null, story, pages, agents, usage, reports };
}

// The run the arguments name: { variant, story, pages, agents, usage, reports }.
export function loadRun(opts) {
  if (!opts.paths.length) return null;
  const saved = opts.paths.filter(p => p.endsWith('.json'));
  if (saved.length && (saved.length > 1 || opts.paths.length > 1)) stop('a saved run is read alone: give one .json file');
  const run = saved.length ? JSON.parse(fs.readFileSync(saved[0], 'utf8')) : fromTranscripts(opts);
  if (opts.variant) run.variant = opts.variant;
  if (opts.pages) run.pages = +opts.pages;
  return run;
}

export function table(header, rows) {
  const lines = [`| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`];
  for (const r of rows) lines.push(`| ${r.map(v => typeof v === 'number' ? v.toLocaleString('en-US') : v).join(' | ')} |`);
  return lines.join('\n');
}
