// Reads the transcripts of an agent run for token-ledger.mjs and fault-ledger.mjs. Run from the repo root.
//
// A run is one or more of:
//   <project>/<session>.jsonl   a session's own transcript, read with the agents of <project>/<session>/ beside it
//   a folder                    every .jsonl and .output file under it
//   <file>.json                 a run saved earlier with --json
//
// Each agent is tagged without a hand-kept list:
//   parent   the manager that dispatched it: the overseer, or the role and section or battle of the agent whose
//            transcript holds its dispatch
//   role     the agent type in agent-<id>.meta.json beside its transcript, else the type the overseer's own
//            transcript dispatched its first prompt with, else the --roles file ("<role> <agent id>" pairs on any
//            line), else "overseer" for a session's own transcript
//   section  the first of the story's section numbers in the dispatch's description, else in its prompt; "-" for
//            the agents that work on the whole story
//   step     the step's name. The dispatch form names it, on a "step:" line of the block its prompt opens with,
//            and a "section:" line there names the section. Where a dispatch has no block, the step is the one
//            STEPS gives the role
// A report's block names its faults by id. The faults themselves are read from the story's fault lists,
// .plan/faults/*.yaml, and its fix log from .plan/fixes/*.yaml, as agents/report.md sets them out. Every dispatch
// and every message that resumes an agent is checked against the dispatch form of the same file.
// An agent that is resumed with another section's work is counted under each section in turn: every prompt it is
// sent starts a part, and each message's tokens go to the part it was written in.
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

// The steps of a story build by name, in their order. A step is known by its name everywhere: in a dispatch, in a
// saved run and in the notes. Only this list says which comes first.
export const ORDER = ['brief', 'survey', 'final-brief', 'pre-plans', 'pre-plan-check', 'research', 'names', 'map-design', 'plans',
  'plan-check', 'maps', 'texts', 'phases', 'images', 'facts', 'edit', 'story', 'name-forms', 'translation'];
export const stepIndex = step => { const i = ORDER.indexOf(step); return i < 0 ? ORDER.length : i; };
// the step a role works at, where its dispatch names none
export const STEPS = {
  'research-coordinator': 'survey', researcher: 'research', 'research-reviewer': 'research', names: 'names',
  'section-lead': 'plans', 'map-keeper': 'maps',
  'map-architect': 'map-design', 'section-coordinator': 'plans', 'battle-coordinator': 'plans', editor: 'pre-plan-check',
  cartographer: 'maps', 'map-auditor': 'maps', 'section-writer': 'texts', 'battle-implementor': 'phases',
  'battle-auditor': 'phases', 'image-finder': 'images', 'fact-checker': 'facts', 'section-reviewer': 'facts',
  'story-auditor': 'story', 'name-finder': 'name-forms', translator: 'translation', 'translation-reviewer': 'translation',
};
// The step whose check should catch a fault, by the work that introduced it: the "introduced" line of
// agents/report.md. A wrong fault caught at a later step is a leak. A fault made by a fix or a ruling has no first
// check.
export const FIRST_CHECK = {
  source: 'research', research: 'research', names: 'names', brief: 'final-brief', 'map-design': 'map-design',
  'pre-plan': 'pre-plan-check', plan: 'plan-check', 'battle-plan': 'plan-check', maps: 'maps', battles: 'phases',
  texts: 'facts', images: 'facts', review: 'edit',
};
// the fields of the dispatch form, in agents/report.md
export const DISPATCH_FIELDS = ['story', 'section', 'battle', 'pages', 'lang', 'names', 'step', 'task', 'faults', 'scratchpad', 'serve', 'note'];
const NOTE_LENGTH = 200;
// the roles that manage, whose own changes to a file are steps the roles should have made
const MANAGERS = ['overseer', 'section-lead', 'section-coordinator', 'battle-coordinator'];
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
  const t = { file, agentId: null, prompts: [], messages: new Map(), texts: [], dispatches: [], resumes: [], start: null, end: null, model: null };
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
      if (b?.type === 'tool_use' && b.name === 'SendMessage' && typeof b.input?.message === 'string') t.resumes.push(b.input);
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

// the task words a role's definition lists: "Your task is `draw` or `fix`"
const words = new Map();
function taskWords(role) {
  if (!words.has(role)) {
    let text = '';
    try { text = fs.readFileSync(path.join('.claude', 'agents', `${role}.md`), 'utf8'); } catch { /* no definition */ }
    const list = text.match(/[Yy]our task is ([^.:]*)/)?.[1] ?? '';
    words.set(role, [...list.matchAll(/`([\w-]+)`/g)].map(m => m[1]));
  }
  return words.get(role);
}

// A dispatch against the form of agents/report.md: the block it opens with, and each way it breaks the form.
// role and description are null for a message that resumes an agent.
export function checkDispatch(prompt, role, description) {
  const problems = [];
  const text = prompt.trim();
  const end = text.search(/\n[ \t]*\n/);
  const head = end < 0 ? text : text.slice(0, end);
  let block = null;
  try { block = yaml.load(head); } catch { /* no block */ }
  if (!block || typeof block !== 'object' || Array.isArray(block) || !('story' in block)) return { block: null, problems: ['no block'] };
  if (end >= 0 && text.slice(end).trim()) problems.push('text after the block');
  for (const k of Object.keys(block)) if (!DISPATCH_FIELDS.includes(k)) problems.push(`unknown field ${k}`);
  for (const k of ['story', 'section', 'step', 'task']) if (block[k] == null) problems.push(`no ${k}`);
  if (block.step != null && !ORDER.includes(block.step)) problems.push(`unknown step ${block.step}`);
  if (role && block.task != null) {
    const list = taskWords(role);
    if (!list.includes(String(block.task))) problems.push(`task ${block.task} is not one of ${role}'s: ${list.join(', ') || 'it lists none'}`);
  }
  if (block.note != null) {
    const note = String(block.note);
    if (note.length > NOTE_LENGTH) problems.push(`note of ${note.length} characters`);
    if (/\n/.test(note.trim())) problems.push('note of more than one line');
  }
  if (role && description != null && ['step', 'section', 'task'].every(k => block[k] != null)) {
    const form = `${block.step} ${block.section} ${role} ${block.task}`;
    if (description.trim() !== form) problems.push(`description is not "${form}"`);
  }
  return { block, problems };
}

// every entry of the YAML lists in one folder of a story's plan, each with the name of its list
function planLists(storyDir, folder) {
  const dir = storyDir && path.join(storyDir, '.plan', folder);
  if (!dir || !fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => n.endsWith('.yaml')).sort().flatMap(n => {
    let doc;
    try { doc = yaml.load(fs.readFileSync(path.join(dir, n), 'utf8')); } catch { stop(`${path.join(dir, n)} is not valid YAML`); }
    return (Array.isArray(doc) ? doc : []).filter(e => e && typeof e === 'object').map(e => ({ ...e, list: n.replace(/\.yaml$/, '') }));
  });
}

// a fault's id is <list>-<role>-<n>
const idRole = f => String(f.id ?? '').replace(new RegExp(`^${f.list}-`), '').replace(/-\d+$/, '') || '?';

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
  // the manager that dispatched each agent: the transcript its dispatch stands in
  const dispatcher = new Map(transcripts.flatMap(t => t.dispatches.map(d => [d.prompt.trim(), t])));
  const label = t => {
    if (!t.agentId) return 'overseer';
    const d = dispatched.get((t.prompts[0] ?? '').trim());
    const role = t.meta.agentType ?? d?.subagent_type ?? '?';
    const section = (t.prompts[0] ?? '').match(/^section:[ \t]*"?(\d{3})"?/m)?.[1];
    const battle = (t.prompts[0] ?? '').match(/^battle:[ \t]*"?([\w-]+)"?/m)?.[1];
    return [role, battle ?? section].filter(Boolean).join(' ');
  };
  const usage = [], reports = [], agents = [];
  const dispatches = [
    ...transcripts.flatMap(t => t.dispatches).map(d => ({ role: d.subagent_type, description: d.description ?? '', ...checkDispatch(d.prompt, d.subagent_type, d.description ?? '') })),
    ...transcripts.flatMap(t => t.resumes).map(d => ({ role: null, description: `resume ${d.to ?? ''}`.trim(), ...checkDispatch(d.message, null, null) })),
  ];
  const listed = planLists(storyDir, 'faults');
  const byId = new Map(listed.map(f => [String(f.id), f]));
  const named = new Set();
  const fault = (f, step) => {
    const firstCheck = FIRST_CHECK[f.introduced] ?? null;
    return {
      id: f.id == null ? null : String(f.id), severity: f.severity ?? '?', kind: f.kind ?? '?', introduced: f.introduced ?? null, firstCheck,
      leak: f.severity === 'wrong' && firstCheck !== null && step !== '-' && stepIndex(step) > stepIndex(firstCheck),
      owner: f.owner ?? null, file: f.file ?? null, claim: f.claim == null ? null : String(f.claim),
      evidence: f.source ?? null, action: f.new ?? null, state: f.state ?? 'open',
    };
  };
  for (const t of transcripts) {
    const given = roles[t.agentId] ?? '';
    const dispatch = t.agentId ? dispatched.get((t.prompts[0] ?? '').trim()) : null;
    const role = t.meta.agentType ?? dispatch?.subagent_type ?? (given.replace(/-?\d{3}$/, '') || (t.agentId ? '?' : 'overseer'));
    const description = t.meta.description ?? dispatch?.description ?? '';
    // the dispatch form: a block of "key: value" lines the prompt opens with
    const form = prompt => Object.fromEntries([...prompt.split('\n').slice(0, 14).join('\n').matchAll(/^(story|section|step|task):[ \t]*"?([\w-]+)"?/gm)].map(([, k, v]) => [k, v]));
    const whole = WHOLE_STORY.has(role);
    let section = whole ? '-' : sectionIn(description) ?? given.match(/(\d{3})$/)?.[1] ?? '-';
    let step = STEPS[role] ?? '-';
    const tags = t.prompts.map((prompt, i) => {
      const given = form(prompt);
      if (given.section) section = given.section === 'all' ? '-' : given.section;
      else if (!whole && !(i === 0 && sectionIn(description))) section = sectionIn(prompt) ?? section;
      if (given.step) step = given.step;
      return { section, step };
    });
    if (!tags.length) tags.push({ section, step });
    const agent = t.agentId ?? path.basename(t.file).replace(/\.(jsonl|output)$/, '');
    const boss = t.agentId ? dispatcher.get((t.prompts[0] ?? '').trim()) : null;
    const parent = boss ? label(boss) : '-';
    const model = t.meta.model ?? t.model ?? '?';
    agents.push({ agent, role, parent, model, start: t.start, end: t.end, description });

    const rows = new Map();
    for (const { part, usage: u } of t.messages.values()) {
      const tag = tags[part] ?? tags[0];
      const key = `${tag.step} ${tag.section}`;
      if (!rows.has(key)) rows.set(key, { agent, role, parent, model, step: tag.step, section: tag.section, turns: 0, peak: 0, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 });
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
        // the block names each fault by its id, and a fault counts once, for the first report that names it
        faults: (Array.isArray(doc.faults) ? doc.faults : []).map(String).filter(id => byId.has(id) && !named.has(id)).map(id => {
          named.add(id);
          return fault(byId.get(id), tag.step);
        }),
      });
    }
  }
  // a fault no report names, such as one the overseer wrote, counts for the role its id names
  const loose = new Map();
  for (const f of listed.filter(f => !named.has(String(f.id)))) {
    const role = idRole(f), section = /^\d+$/.test(f.list) ? f.list : '-';
    const key = `${role} ${section}`;
    if (!loose.has(key)) loose.set(key, { agent: '-', role, step: STEPS[role] ?? '-', section, status: 'faults', changed: 0, unresolved: 0, faults: [] });
    loose.get(key).faults.push(fault(f, loose.get(key).step));
  }
  reports.push(...loose.values());
  // the fix log, and in it each change a manager made itself: the overseer's, and a coordinator's to a file of another role
  const fixes = planLists(storyDir, 'fixes').map(x => {
    const f = byId.get(String(x.fault));
    const by = x.by ?? '?';
    return {
      fault: x.fault == null ? null : String(x.fault), by, file: x.file ?? null, field: x.field ?? null, commit: x.commit == null ? null : String(x.commit),
      kind: f?.kind ?? null, severity: f?.severity ?? null, owner: f?.owner ?? null,
      steppedIn: by === 'overseer' || (MANAGERS.includes(by) && f?.owner !== by),
    };
  });
  const used = new Set(usage.map(r => r.section).filter(s => s !== '-'));
  const counted = sections.filter(s => !used.size || used.has(s.slice(0, 3)));
  const pages = counted.reduce((n, s) => n + countPages(path.join(pagesDir, s)), 0) || null;
  return { variant: opts.variant ?? null, story, pages, order: ORDER, agents, usage, reports, dispatches, fixes };
}

// The run the arguments name: { variant, story, pages, agents, usage, reports, dispatches, fixes }.
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
