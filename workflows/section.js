export const meta = {
  name: 'section',
  description: 'Build one section of a story on the log from its plans to its reviewed pages, in the order its tasks need',
  whenToUse: 'Once a section has its plan, its plan check and the audited shared map, for a story that has the folder .plan/log. Pass { story, section, scratchpad }.',
  phases: [
    { title: 'Maps', detail: 'draw, then audit' },
    { title: 'Texts', detail: 'write once the page files exist, beside the map audit' },
    { title: 'Phases', detail: 'each battle with phases: build, audit' },
    { title: 'Images', detail: 'an image for each placeholder, before the fact check' },
    { title: 'Facts', detail: 'fact check of texts and captions with its edits, review' },
    { title: 'Settle', detail: 'what the gate lists: fix, recheck, until it lists nothing' },
  ],
}

// One section built from its plans to its reviewed pages. The workflow holds no order of its own: the table of
// scripts/pipeline.mjs says what each task needs, `node scripts/order.mjs <story> <section> --json` makes the
// graph from it, and each task here starts the moment the tasks it needs have ended. It is handed the section
// as its arguments, since a workflow reads no file:
//   { story: 'joan-of-arc', section: '040', scratchpad: '/tmp/x', agents: '', plan: <what order.mjs printed> }
// Without `plan` a small agent runs order.mjs and hands back what it printed. agents is a prefix for the agent
// types, such as 'story-pipeline:' where the definitions come from the plugin alone. Run `node scripts/slice.mjs
// <story> <section>` before it.
//
// It is for a story on the log (agents/log.md, `improvements-spec.md`). Each agent is sent the dispatch block of
// agents/report.md and nothing else, and ends with the line of `node scripts/fault.mjs line`: "ok 2 0" is the
// result, the asks still open and the asks that wait for a ruling. What comes after a first run is the gate's:
// `node scripts/next.mjs <story> <section>` lists each fix and each recheck that is due, and the workflow
// dispatches what it lists until it lists nothing. It asks the gate as each checker's first run ends, so what
// that checker found is fixed before the tasks that need it start, and once more at the end.
// What needs a ruling is not settled here: the workflow returns the gate's last list, and the section lead
// rules on the lines `rule`, `agree` and `why` that are left in it.

const { story, section, scratchpad = '.cache/scratch', agents = '' } = args ?? {}
if (!story || !/^\d{3}$/.test(String(section ?? ''))) throw new Error('pass { story, section } as args, the section as its three digits')

const ROUNDS = 6   // the most times the gate is asked in one settling
const runs = []
const title = step => step[0].toUpperCase() + step.slice(1)

// a command the workflow cannot run itself: a small agent runs it and hands back what it printed
const command = (line, label) => agent(`Run this one command from the repo root, with the Bash tool:\n\n${line}\n\n` +
  'Your answer is what it printed, every line as it is, and nothing else: no word of your own, no code fence. It may end with status 1: that is no error.',
  { label, phase: 'Settle', model: 'haiku', effort: 'low' }).then(out => String(out ?? ''))

let plan = args.plan
if (typeof plan === 'string') plan = JSON.parse(plan)
if (!plan) {
  const out = await command(`node scripts/order.mjs ${story} ${section} --json`, `order ${section}`)
  try { plan = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1)) } catch { throw new Error(`scripts/order.mjs gave no plan: ${out.slice(0, 300)}`) }
}
const { nodes, roles, battles = [] } = plan

// one run of one role: its dispatch block, and its return read as { result, open, waiting }
function dispatch(role, task, phase, battle = null, page = null) {
  const { step, serve } = roles[role]
  const part = battle ?? page
  const lines = [`story: ${story}`, `section: "${section}"`]
  if (battle) lines.push(`battle: ${battle}`)
  if (page) lines.push(`pages: ${page}`)
  lines.push(`step: ${step}`, `task: ${task}`, `scratchpad: ${scratchpad}/${section}-${role}${part ? `-${part}` : ''}`)
  if (serve) lines.push('serve: static')
  const label = `${step} ${section} ${role} ${task}${part ? ` ${part}` : ''}`
  return agent(lines.join('\n'), { agentType: agents + role, label, phase }).then(text => {
    const m = String(text ?? '').trim().split('\n').pop().trim().match(/^(ok|blocked) (\d+) (\d+)$/)
    const run = { role, task, battle, ...(page ? { page } : {}), result: m ? m[1] : 'blocked', open: m ? Number(m[2]) : 0, waiting: m ? Number(m[3]) : 0 }
    if (!m) { run.note = 'the agent did not end with its line'; log(`${label}: ended with no line, read as blocked`) }
    runs.push(run)
    return run
  })
}

// the gate: what scripts/next.mjs lists for the section, a line each as { verb, role, text }
async function gate() {
  const out = await command(`node scripts/next.mjs ${story} ${section}`, `gate ${section}`)
  return out.split('\n').map(l => l.trim().match(/^(\d{3})\s+(fix|recheck|agree|rule|why)\s+(.*)$/)).filter(Boolean)
    .map(m => ({ verb: m[2], role: (m[3].match(/^([a-z-]+):/) ?? [])[1] ?? null, text: m[0] }))
}

// dispatch what the gate lists for the roles whose first run has ended, until it lists nothing a run can settle
const ended = new Set()
async function settle() {
  // a fix or a recheck of a role that has not run yet is the graph's to dispatch, not the gate's
  const mine = l => !['fix', 'recheck'].includes(l.verb) || ended.has(l.role)
  let list = []
  for (let round = 1; round <= ROUNDS; round++) {
    list = (await gate()).filter(mine)
    const todo = ['fix', 'recheck'].map(verb => [...new Set(list.filter(l => l.verb === verb && roles[l.role]).map(l => l.role))])
    // the fixes first, since a fix is a change its checker then looks at
    const [verb, names] = todo[0].length ? ['fix', todo[0]] : ['recheck', todo[1]]
    if (!names.length) return list
    await parallel(names.flatMap(role => (roles[role].battle ? battles : [null]).map(battle => () =>
      dispatch(role, verb === 'fix' && roles[role].fix ? 'fix' : 'recheck', 'Settle', battle))))
  }
  list = (await gate()).filter(mine)
  if (list.some(l => l.verb === 'fix' || l.verb === 'recheck')) log(`${section}: the gate still lists work after ${ROUNDS} rounds, left for the section lead`)
  return list
}
// one settling at a time, so that two checkers that end together do not both dispatch the same fix
let settling = Promise.resolve([])
const settled = () => (settling = settling.then(settle, settle))

// Each node starts once the nodes it needs have ended. A blocked node stops the nodes that need it, and they
// are returned as not started.
const started = {}
function start(node) {
  return started[node.id] ??= (async () => {
    const needs = await Promise.all(node.needs.map(id => start(nodes.find(n => n.id === id))))
    if (needs.some(r => r.result !== 'ok')) return { role: node.role, task: node.task, battle: node.battle ?? node.page, result: 'not started' }
    const run = await dispatch(node.role, node.task, title(node.step), node.battle, node.page)
    ended.add(node.role)
    // a checker that runs a page each is settled once, at the end, with its pages together
    if (run.result === 'ok' && node.kind === 'checker' && !node.page) await settled()
    return run
  })()
}
const first = await Promise.all(nodes.map(start))
const waiting = first.filter(r => r.result === 'not started').map(r => `${r.role}.${r.task}${r.battle ? `:${r.battle}` : ''}`)
if (waiting.length) return { story, section, status: 'blocked', left: [], 'not started': waiting, runs }

const left = await settled()
return { story, section, status: runs.some(r => r.result === 'blocked') ? 'blocked' : left.length ? 'open' : 'done', left: left.map(l => l.text), runs }
