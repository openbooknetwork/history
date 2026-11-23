export const meta = {
  name: 'section',
  description: 'Build one section of a story from its plans to its reviewed pages, in the fixed order',
  whenToUse: 'Once a section has its plan, its plan check and the audited shared map. Pass { story, section, battles, scratchpad }.',
  phases: [
    { title: 'Maps', detail: 'draw, audit, fix until the audit passes' },
    { title: 'Texts', detail: 'write once the page files exist' },
    { title: 'Phases', detail: 'each battle with phases: build, audit, fix' },
    { title: 'Images', detail: 'an image for each placeholder' },
    { title: 'Facts', detail: 'fact check with its edits, review, recheck' },
  ],
}

// The fixed order of one section, which a section lead would otherwise dispatch by hand. It is handed the
// section as its arguments, since a workflow reads no file:
//   { story: 'alexander-the-great', section: '020', battles: ['granicus-334'], scratchpad: '/tmp/x', agents: '' }
// battles are the section's battles with phases. agents is a prefix for the agent types, such as
// 'story-pipeline:' where the definitions come from the plugin alone. Each agent is sent the dispatch block of
// agents/report.md and nothing else, and reads the channels itself. Run `node scripts/slice.mjs <story> <section>`
// before it. What needs a ruling is not settled here: the workflow returns each agent's status with what it
// left unresolved or stale, and the section lead rules on that.

const { story, section, battles = [], scratchpad = '.cache/scratch', agents = '' } = args ?? {}
if (!story || !section) throw new Error('pass { story, section } as args')

const REPORT = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['pass', 'faults', 'blocked'] },
    faults: { type: 'array', items: { type: 'string' } },
    unresolved: { type: 'array', items: { type: 'string' } },
    stale: { type: 'array', items: { type: 'string' } },
  },
  required: ['status'],
}
const ROUNDS = 3
const reports = []

function dispatch(role, step, task, phase, extra = {}) {
  const lines = [`story: ${story}`, `section: "${section}"`]
  if (extra.battle) lines.push(`battle: ${extra.battle}`)
  lines.push(`step: ${step}`, `task: ${task}`)
  if (extra.faults) lines.push(`faults: .plan/faults/${section}.yaml`)
  lines.push(`scratchpad: ${scratchpad}/${section}-${role}${extra.battle ? `-${extra.battle}` : ''}`)
  if (extra.serve) lines.push('serve: static')
  const label = `${step} ${section} ${role} ${task}${extra.battle ? ` ${extra.battle}` : ''}`
  return agent(lines.join('\n'), { agentType: agents + role, label, phase, schema: REPORT }).then(r => {
    const report = { role, step, task, battle: extra.battle ?? null, ...(r ?? { status: 'blocked', unresolved: ['the agent returned no report'] }) }
    reports.push(report)
    return report
  })
}

// a maker's work, checked and fixed until its checker passes or the rounds run out
async function checked(phase, step, check, fix, extra = {}) {
  let report = await dispatch(check.role, step, check.task, phase, { ...extra, serve: true })
  for (let round = 1; report.status === 'faults' && round <= ROUNDS; round++) {
    await dispatch(fix.role, step, 'fix', phase, { ...extra, faults: true, serve: true })
    report = await dispatch(check.role, step, 'recheck', phase, { ...extra, faults: true, serve: true })
  }
  if (report.status === 'faults') log(`${section}: ${check.role} still reports faults after ${ROUNDS} rounds, left for the section lead`)
  return report
}

const drawn = await dispatch('cartographer', 'maps', 'draw', 'Maps', { serve: true })
if (drawn.status === 'blocked') return { story, section, status: 'blocked', reports }

// the writer needs the marker ids and not the final borders, so it runs beside the map audit
const [audit, written] = await parallel([
  () => checked('Maps', 'maps', { role: 'map-auditor', task: 'audit' }, { role: 'cartographer' }),
  () => dispatch('section-writer', 'texts', 'write', 'Texts'),
])
if (!written || written.status === 'blocked') return { story, section, status: 'blocked', reports }

// the image finder shares no file with the fact check and the review, so it runs beside them
await parallel([
  () => dispatch('image-finder', 'images', 'find', 'Images'),
  async () => {
    await parallel(battles.map(battle => async () => {
      await dispatch('battle-implementor', 'phases', 'build', 'Phases', { battle, serve: true })
      return checked('Phases', 'phases', { role: 'battle-auditor', task: 'audit' }, { role: 'battle-implementor' }, { battle })
    }))
    let facts = await dispatch('fact-checker', 'facts', 'check', 'Facts')
    await dispatch('section-reviewer', 'facts', 'review', 'Facts', { faults: true })
    for (let round = 1; round <= ROUNDS; round++) {
      facts = await dispatch('fact-checker', 'facts', 'recheck', 'Facts', { faults: true })
      if (facts.status !== 'faults') break
      await dispatch('section-reviewer', 'facts', 'fix', 'Facts', { faults: true })
    }
    return facts
  },
])

const last = role => reports.filter(r => r.role === role).at(-1)?.status ?? 'blocked'
const settled = ['map-auditor', 'fact-checker'].every(role => last(role) === 'pass') && reports.filter(r => r.role === 'battle-auditor').every((r, i, all) => all.findLast(x => x.battle === r.battle).status === 'pass')
return {
  story, section,
  status: settled ? 'pass' : 'faults',
  unresolved: reports.flatMap(r => (r.unresolved ?? []).map(u => `${r.role}: ${u}`)),
  stale: [...new Set(reports.flatMap(r => r.stale ?? []))],
  reports: reports.map(r => ({ role: r.role, task: r.task, battle: r.battle, status: r.status, faults: (r.faults ?? []).length })),
}
