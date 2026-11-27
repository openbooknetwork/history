// The table of the pipeline's work: for each role and task, what kind of work it is, what it reads as it starts,
// which kinds of file it makes or has the last word on, and the most its start-up list may hold.
// `improvements-spec.md` is the design. scripts/brief.mjs makes a start-up list from `reads`, and
// scripts/pipeline.test.mjs holds each list to its `budget`.
//
// An entry is a role and a task, since what a role is varies by task:
//   kind     maker, checker or manager
//   step     the step of scripts/transcripts.mjs the task belongs to
//   scope    section, all or battle
//   makes    the kinds of file a maker owns: a change it makes to one needs no reason
//   settles  the kinds of file a checker has the last word on. Each kind has one checker, and a change to a file
//            of that kind by anybody else is that checker's to look at again.
//   needs    the tasks whose work this one is made from, each as "role.task": it starts once they have ended.
//            Only the first run of a piece of work has needs. A fix, a recheck and a manager's run have none:
//            scripts/next.mjs lists a fix and a recheck from the log, and a manager's run is its team's tasks.
//            `NEEDS` below holds them in one place, and `graph` and `waves` make the order from them.
//   per      `page` where the first run is one agent for each page of the section, side by side, each with the
//            passages, the built files and the captions of its page alone: a start-up list a fifth of the
//            section's, sent again on every turn
//   reads    the views the agent gets as it starts, by name, and nothing else
//   budget   the most those views may hold with the role's definition, in thousands of tokens
//            The budgets are set with the story's sources fetched: where they are not on the machine, the passages hold
//            no text and a list that reads them is far smaller.
// A role's model, effort and turn limit stay in its definition, where the platform reads them.
//
// The six roles of a section have lists cut to each task. The other roles read, for every task, what they read
// before there was a table, less the fault list and the fix log: `WIDE` below. Each is to be cut to its tasks as
// a run shows what a task needs. A role the table does not hold gets the list scripts/brief.mjs made before.

// The views a start-up list is made of. Each is a file, or a few, that scripts/brief.mjs lists by path.
export const VIEWS = {
  card: 'the commands the role runs, one short entry each',
  notes: 'the notes the role\'s definition names, cut to the parts it names',
  howto: 'how this story\'s pages or battles are made: the parts of the engine\'s manual',
  generator: 'the generator of the section\'s pages, or of the battle',
  rules: 'the story\'s rules',
  brief: 'the section\'s part of the brief',
  names: 'the rows of names.md the section uses',
  digest: 'the section\'s part of the digest',
  passages: 'each claim of the section with the passage of each of its quotes, a file a page. `passages:300` gives a narrower window than the usual 600 characters',
  sources: 'the source map and the index of the section\'s sources',
  ground: 'what the zones as drawn rest on',
  'plan:pages': 'the section\'s pages.yaml',
  'plan:map': 'the section\'s map.yaml',
  'plan:text': 'the section\'s text.yaml',
  'plan:battles': 'the section\'s battles.yaml',
  'plan:battle': 'a battle\'s own plan files',
  handoff: 'what the last agent of the role left for the next',
  built: 'the section\'s pages as they are built: the files of each that the role works on',
  images: 'which placeholder took which image',
  captions: 'the caption, credit and source of each image the section took',
  decisions: 'what the section\'s lead decided',
  report: 'the role\'s own earlier reports',
  asks: 'the open faults that are the role\'s to fix',
  since: 'what others changed, since the role\'s last change, in the files it has the last word on',
};

// The kinds of file that `makes` and `settles` name, each by a test of a path from the repo root.
export const KINDS = {
  texts: /\/pages\/.*\/text\/[\w-]+\.md$/,
  captions: /\/images\/[^/]+\/image\.yaml$/,
  cards: /\/battles\/[^/]+\/battle\.yaml$/,
  pages: /\/pages\/.*\/page\.yaml$/,
  markers: /markers\.yaml$/,
  routes: /\/routes\//,
  zones: /\/shared\/zones(\.yaml$|\/)/,
  generator: /\/\.plans\//,
  plan: /\/\.plan\/\d{3}-[^/]+\/[\w-]+\.(yaml|geojson)$/,
  'image-list': /\/\.plan\/images\/\d{3}\.yaml$/,
  digest: /\/\.plan\/research(\/\d{3})?\.md$/,
  battle: /\/shared\/battles\/[^/]+\/(?!battle\.yaml$)[^/]+$/,
};
// a view's name without its window: `passages:300` is the view `passages`, with 300 characters after each quote
export const viewName = v => String(v).replace(/^(passages):\d+$/, '$1');
export const kindOf = file => Object.keys(KINDS).find(k => KINDS[k].test(`/${file}`)) ?? null;

const START = ['card', 'notes', 'rules', 'handoff'];   // what every task of a section reads
const section = (kind, step, rest) => ({ kind, step, scope: 'section', ...rest });

export const PIPELINE = {
  cartographer: {
    draw: section('maker', 'maps', { makes: ['pages', 'markers', 'routes', 'generator'],
      reads: [...START, 'howto', 'generator', 'brief', 'names', 'plan:pages', 'plan:map', 'built', 'images', 'decisions', 'asks'], budget: 60 }),
    fix: section('maker', 'maps', { makes: ['pages', 'markers', 'routes', 'generator'],
      reads: [...START, 'generator', 'plan:map', 'built', 'asks'], budget: 40 }),
  },
  'map-auditor': {
    audit: section('checker', 'maps', { settles: ['pages', 'markers', 'routes'],
      reads: [...START, 'brief', 'digest', 'ground', 'plan:pages', 'plan:map', 'built', 'images', 'decisions', 'asks'], budget: 75 }),
    recheck: section('checker', 'maps', { settles: ['pages', 'markers', 'routes'],
      reads: [...START, 'plan:map', 'built', 'asks', 'since'], budget: 30 }),
  },
  'section-writer': {
    write: section('maker', 'texts', { makes: ['texts'],
      reads: [...START, 'names', 'passages:300', 'plan:pages', 'plan:text', 'built', 'images', 'decisions', 'asks'], budget: 125 }),
    rewrite: section('maker', 'texts', { makes: ['texts'],
      reads: [...START, 'names', 'passages:300', 'plan:pages', 'plan:text', 'built', 'images', 'decisions', 'asks'], budget: 125 }),
    fix: section('maker', 'texts', { makes: ['texts'],
      reads: [...START, 'names', 'built', 'asks'], budget: 35 }),
  },
  'image-finder': {
    find: section('maker', 'images', { makes: ['captions', 'image-list'],
      reads: [...START, 'plan:pages', 'plan:text', 'built', 'images', 'asks'], budget: 40 }),
    replace: section('maker', 'images', { makes: ['captions', 'image-list'],
      reads: [...START, 'plan:pages', 'plan:text', 'built', 'images', 'asks'], budget: 40 }),
    fix: section('maker', 'images', { makes: ['captions', 'image-list'],
      reads: [...START, 'built', 'images', 'asks'], budget: 25 }),
  },
  'fact-checker': {
    'plan-check': section('checker', 'plan-check', { settles: ['plan'],
      reads: [...START, 'names', 'passages', 'plan:pages', 'plan:map', 'plan:text', 'plan:battles', 'decisions', 'asks'], budget: 160 }),
    check: section('checker', 'facts', { per: 'page', settles: ['texts', 'captions', 'cards'],
      reads: [...START, 'names', 'passages', 'plan:pages', 'plan:text', 'plan:battles', 'built', 'images', 'captions', 'decisions', 'asks'], budget: 170 }),
    recheck: section('checker', 'facts', { settles: ['texts', 'captions', 'cards'],
      reads: [...START, 'built', 'images', 'captions', 'asks', 'since'], budget: 35 }),
  },
  'section-reviewer': {
    review: section('checker', 'facts', { settles: [],
      reads: [...START, 'names', 'plan:pages', 'plan:text', 'built', 'images', 'decisions', 'asks'], budget: 50 }),
    fix: section('checker', 'facts', { settles: [],
      reads: [...START, 'built', 'asks'], budget: 25 }),
  },
};

// every view but the two that hold what is open: what a role read before there was a table, less the fault list
// and the fix log
const WIDE = [...START, 'howto', 'generator', 'brief', 'names', 'digest', 'passages', 'sources', 'ground', 'plan:pages', 'plan:map', 'plan:text',
  'plan:battles', 'plan:battle', 'built', 'images', 'decisions', 'report', 'asks'];
const wide = (kind, step, scope, rest = {}) => ({ kind, step, scope, reads: WIDE, ...rest });
Object.assign(PIPELINE, {
  'research-coordinator': { survey: wide('manager', 'survey', 'all', { budget: 50 }), claims: wide('manager', 'research', 'all', { budget: 50 }) },
  researcher: {
    claims: wide('maker', 'research', 'section', { makes: ['digest'], budget: 30 }),
    add: wide('maker', 'research', 'section', { makes: ['digest'], budget: 30 }),
    fix: wide('maker', 'research', 'section', { makes: ['digest'], budget: 30 }),
  },
  'research-reviewer': {
    review: wide('checker', 'research', 'section', { settles: ['digest'], budget: 30 }),
    recheck: wide('checker', 'research', 'section', { settles: ['digest'], reads: [...WIDE, 'since'], budget: 30 }),
  },
  names: { decide: wide('maker', 'names', 'all', { budget: 190 }), add: wide('maker', 'names', 'all', { budget: 190 }), fix: wide('maker', 'names', 'all', { budget: 190 }) },
  'map-architect': { design: wide('maker', 'map-design', 'all', { budget: 215 }), fix: wide('maker', 'map-design', 'all', { budget: 215 }) },
  'map-keeper': { draw: wide('maker', 'maps', 'all', { makes: ['zones'], budget: 135 }), fix: wide('maker', 'maps', 'all', { makes: ['zones'], budget: 135 }) },
  'section-coordinator': {
    'pre-plan': wide('maker', 'pre-plans', 'section', { makes: ['plan'], budget: 115 }),
    plan: wide('maker', 'plans', 'section', { makes: ['plan'], budget: 115 }),
    fix: wide('maker', 'plans', 'section', { makes: ['plan'], budget: 115 }),
  },
  'battle-coordinator': {
    plan: wide('maker', 'plans', 'battle', { makes: ['plan'], budget: 125 }),
    build: wide('manager', 'phases', 'battle', { budget: 125 }),
    fix: wide('maker', 'plans', 'battle', { makes: ['plan'], budget: 125 }),
  },
  'battle-implementor': {
    build: wide('maker', 'phases', 'battle', { makes: ['battle', 'pages', 'generator'], budget: 170 }),
    fix: wide('maker', 'phases', 'battle', { makes: ['battle', 'pages', 'generator'], budget: 170 }),
  },
  'battle-auditor': {
    audit: wide('checker', 'phases', 'battle', { settles: ['battle'], budget: 160 }),
    recheck: wide('checker', 'phases', 'battle', { settles: ['battle'], reads: [...WIDE, 'since'], budget: 160 }),
  },
  editor: { 'pre-plans': wide('checker', 'pre-plan-check', 'all', { settles: [], budget: 145 }), texts: wide('checker', 'edit', 'all', { settles: [], budget: 145 }) },
  'story-auditor': {
    audit: wide('checker', 'story', 'all', { settles: [], budget: 210 }),
    recheck: wide('checker', 'story', 'all', { settles: [], reads: [...WIDE, 'since'], budget: 210 }),
  },
});

// The order of the work, as what each first run is made from. Nothing else says what runs before what:
// workflows/section.js and `node scripts/order.mjs` both follow this. A need of a battle's task, by a section's
// task, is a need of each battle of the section that has phases, and of none where it has no such battle.
export const NEEDS = {
  'research-coordinator.survey': [],
  'section-coordinator.pre-plan': ['research-coordinator.survey'],
  'editor.pre-plans': ['section-coordinator.pre-plan'],
  'researcher.claims': ['editor.pre-plans'],
  'research-reviewer.review': ['researcher.claims'],
  'names.decide': ['research-reviewer.review'],
  'map-architect.design': ['names.decide'],
  'section-coordinator.plan': ['map-architect.design'],
  'battle-coordinator.plan': ['section-coordinator.plan'],
  'fact-checker.plan-check': ['section-coordinator.plan', 'battle-coordinator.plan'],
  'map-keeper.draw': ['fact-checker.plan-check'],
  'cartographer.draw': ['map-keeper.draw'],
  'map-auditor.audit': ['cartographer.draw'],
  // the writer needs the marker ids and not the final borders, so it does not wait for the map audit
  'section-writer.write': ['cartographer.draw'],
  'battle-implementor.build': ['map-auditor.audit', 'section-writer.write'],
  'battle-auditor.audit': ['battle-implementor.build'],
  'image-finder.find': ['section-writer.write'],
  // a caption and a marker's image are text the fact check reads, so the images are its input as the texts are
  'fact-checker.check': ['section-writer.write', 'image-finder.find', 'battle-auditor.audit'],
  'section-reviewer.review': ['fact-checker.check'],
  'editor.texts': ['section-reviewer.review'],
  'story-auditor.audit': ['editor.texts'],
};
for (const [id, needs] of Object.entries(NEEDS)) { const [role, task] = id.split('.'); if (PIPELINE[role]?.[task]) PIPELINE[role][task].needs = needs; }

// the roles that take captures of the built pages, and so are dispatched with `serve: static`
export const SERVES = ['cartographer', 'map-auditor', 'map-keeper', 'battle-implementor', 'battle-auditor'];
// The steps a section's build is made of, after its plan is checked and the shared map is audited.
export const BUILD = ['maps', 'texts', 'phases', 'images', 'facts'];

// The tasks of the given steps and scopes as the nodes of a graph, each with the nodes it needs. A need whose
// task is of another step or scope was met before these steps began, and is left out. A battle's task is a node
// for each battle, and a task that runs `per: 'page'` a node for each page.
export function graph({ steps = BUILD, scopes = ['section', 'battle'], battles = [], pages = [] } = {}) {
  const inside = id => { const [role, task] = id.split('.'), e = PIPELINE[role]?.[task]; return e?.needs && steps.includes(e.step) && scopes.includes(e.scope) ? e : null; };
  // the nodes of one task: one for each battle or page it runs for. A battle's task needs the same battle's.
  const ids = (id, battle) => { const e = inside(id); return e.scope === 'battle' ? (battle ? [battle] : battles).map(b => `${id}:${b}`) : e.per === 'page' && pages.length ? pages.map(p => `${id}:${p}`) : [id]; };
  const nodes = [];
  for (const id of Object.keys(NEEDS)) {
    const e = inside(id);
    if (!e) continue;
    const [role, task] = id.split('.');
    const each = e.scope === 'battle' ? battles.map(b => [b, null]) : e.per === 'page' && pages.length ? pages.map(p => [null, p]) : [[null, null]];
    for (const [battle, page] of each)
      nodes.push({ id: battle || page ? `${id}:${battle ?? page}` : id, role, task, step: e.step, kind: e.kind, battle, page,
        needs: e.needs.filter(inside).flatMap(n => ids(n, battle)) });
  }
  return nodes;
}
// The nodes in waves: each wave is what can start once the waves before it have ended. Where the needs go round
// in a circle nothing in it can ever start, and the circle is the error's message.
export function waves(nodes) {
  const done = new Set(), out = [];
  let left = [...nodes];
  while (left.length) {
    const wave = left.filter(n => n.needs.every(x => done.has(x)));
    if (!wave.length) {
      const by = Object.fromEntries(left.map(n => [n.id, n])), path = [left[0].id];
      for (;;) {
        const next = by[path.at(-1)].needs.find(x => by[x]);
        if (!next) throw new Error(`${path.at(-1)} needs ${by[path.at(-1)].needs.filter(x => !done.has(x)).join(', ')}, which is no task of these steps`);
        if (path.includes(next)) throw new Error(`the needs go round in a circle, so none of these can start: ${[...path.slice(path.indexOf(next)), next].join(' -> ')}`);
        path.push(next);
      }
    }
    out.push(wave.map(n => n.id));
    for (const n of wave) done.add(n.id);
    left = left.filter(n => !done.has(n.id));
  }
  return out;
}

// the entry of a role and a task, or null where the table does not hold it
export const entry = (role, task) => PIPELINE[role]?.[task] ?? null;
// the one checker that has the last word on a kind of file, as "role.task" of its first task
export function settlerOf(kind) {
  for (const [role, tasks] of Object.entries(PIPELINE)) for (const [task, e] of Object.entries(tasks)) if (e.settles?.includes(kind)) return role;
  return null;
}
