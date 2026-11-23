# Reporting

For every agent of `.claude/agents/`: the channels it speaks through, and the report it ends with.

## Channels

Agents pass work to each other through eight channels and through nothing else. Each has one kind of writer, a
known reader and one place. The places below are in `content/<story>/.plan/`.

| Channel | Writer | Reader | Place |
|---|---|---|---|
| Work products | the agent of each step | the later steps | `brief.md`, `research.md`, `names.md`, the section plans and the battle plans |
| Rules | the overseer alone | every agent | `agents/*.md` for every story, `rules.md` for this one |
| Dispatch | a manager | one agent of its team | the block of "The dispatch", in the message that starts or resumes the agent |
| Report | an agent | the manager that dispatched it | the block of "The report", saved to `reports/` |
| Fault list | a checker | the fixer | `faults/<section number>.yaml`, and `faults/story.yaml` for a fault of no one section |
| Fix log | whoever changes a file to fix it | the section's reviewer, the user and whoever reviews the run | `fixes/<section number>.yaml`, and `fixes/story.yaml` for a fault of `faults/story.yaml`, one entry a change |
| Handoff | an agent | the next agent of its role | `handoff/<role>.md`, one page |
| Decision log | a manager | the user and whoever reviews the run | `decisions.md` by the overseer for the story, `<number>-<section id>/decisions.md` by a section lead for its section |

- What the next agent needs is in a channel. Nothing that matters stays only in a scratchpad or a message.
- Agents do not write to each other. A checker writes a fault, the fixer sets its state, and the checker reads the
  list again. The manager of the two rules on a fault and does not relay it.
- A manager dispatches, rules and merges: the overseer, a section lead, and a battle coordinator for its battle.
  Every other agent is a worker, which makes a thing, or a checker, which tests what a worker made. Your report
  goes to the manager that dispatched you, and no further as it is.
- **No fix without its fault.** Every change that fixes something closes a fault that was written to the fault
  list first, however small the change and whoever makes it. There is one fault list and one fix log, and no fix
  of another kind.

## The dispatch

Every dispatch, and every message that resumes an agent, opens with this block:

```yaml
story: alexander-the-great
section: "020"            # all, for an agent that works on the whole story
battle: issus-333         # only for an agent that works on one battle
pages: [the-danube]       # only where the work is named pages of the section and no others
lang: tr                  # only for an agent that works in one language
names: [Constantinople]   # only for a name finder that looks up named names
step: maps                # the step's name, as `ORDER` of `scripts/transcripts.mjs` lists them
task: draw                # one word from the list in the role's definition
faults: .plan/faults/020.yaml    # only where the task is a fix or a recheck
scratchpad: <the agent's own folder>
serve: static             # a static build of its own, or the port of a shared server
note: Thessaly's border is row 12 of the brief's Map part.    # optional
```

The block points and does not paste. It holds no rule, which is in `rules.md`, no fault, which is in the fault
list, and no list of files to read, which your definition gives for a story and a section. `note` states a fact
about this one dispatch that no channel holds, such as where something is or what changed since the plan. It
tells you nothing to do.

## The fault list

A fault is one edit, and one entry of its section's list. It names its file and its field, says whether it
replaces the field's whole value or one clause of it, and quotes the old text word for word:

```yaml
- id: 020-fact-checker-3
  severity: wrong     # wrong, weak or taste
  file: content/<story>/pages/<section>/<page>/text/en.md
  field: <the field of the file that changes>
  replaces: clause    # value where `new` is the field's whole value, clause where it stands in place of `old` inside it
  old: <the text as it stands>
  new: <the text that takes its place>
  source: <the line of the source the fault rests on, with its file>
  kind: fact          # fact, attribution, wording, sources, map, battle, image, order, plan or check
  claim: "30.4"       # the digest id, where the fault is about a claim
  introduced: plan    # the work that made the fault, where you can tell
  owner: section-reviewer   # the agent whose file changes
  state: open         # open, fixed or declined
  ruling: <what the manager ruled, where it ruled on the fault>
```

`id` is the list's name, the role that wrote the fault and that role's next number in the list:
`020-fact-checker-3`, `story-editor-1`. A fault keeps its id for good, and the number of a fault that goes is
left unused, so a report, a fix log and a commit message can name a fault by its id alone.

A fault that is no change of text, such as a border that runs wrong, a missing page or a claim the user has to
decide, leaves out `replaces` and `old`, and its `new` says what should change.

`severity` is `wrong` where the reader would be told something false, a drawing has no basis, or a check fails. It
is `weak` where the evidence is thinner than `agents/evidence.md` asks. It is `taste` where a careful person could
leave the file as it is. A manager has every `wrong` fault fixed and may let a `taste` fault stand. A `weak` fault
goes up to the overseer, who decides it with the user.

`owner` is the name of an agent of `.claude/agents/`, as the second table of `AGENTS.md` lists them. It is `brief`
where the story's brief has to change, and `overseer` where a file of the overseer's has.

`introduced` names the work that made the fault, which is often an earlier step than the file's own: a route drawn
as its plan says is a fault of the `plan`, not of the `maps`. It is one of `source`, `research`, `names`, `brief`,
`map-design`, `pre-plan`, `plan`, `maps`, `battle-plan`, `battles`, `texts`, `images` and `review`, or `fix` or `ruling` where a
fix or a ruling made it. Leave the line out where the evidence does not show it. `node scripts/fault-ledger.mjs`
counts from it the faults that passed the step meant to catch them.

The fact-checker, the map-auditor, the battle-auditor, the editor and the story-auditor write their faults
there, each with its source line, and so does any other agent that finds one. A fault that belongs to no one
section goes to `faults/story.yaml`. The checker writes the fault with the state `open`. The fixer sets it to
`fixed` or `declined`, and changes no other line of the entry.

## Fixing a fault

The fixer applies each fault of its own as it is written, without doing the checker's research again.

- A clause edit puts `new` in place of `old` and leaves the rest of the field as it stands. Every author's figure
  stays unless the fault says to remove it.
- Set the fault's state, then add the change to the fix log with the `old` and `new` text of each field you
  changed. That entry is the diff of the fix: "done" says nothing of what else the field lost.
- A checker rechecks a fix against the commit its fix log entry names, with `git diff <commit> -- <file>`, and
  not against the fault alone.

## The fix log

The fix log is the audit of every fix. Whoever changes a file to fix a fault adds one entry for the change to the
fix log of the fault's section:

```yaml
- fault: <the id of the fault it closes>
  by: cartographer    # who made the change
  file: content/<story>/shared/markers.yaml
  field: <the field that changed>
  old: <the text before>
  new: <the text after>
  commit: <the commit the change was made on, as `git rev-parse --short HEAD` gives it before the change>
```

A fix with no entry, or an entry that names no fault, is a fault of the run.

## The handoff

Where another agent of your role works after you, on the next section or the next battle, and you learned
something it needs and no other channel holds, write it to `handoff/<role>.md` before you end: one page, with
what the next one must know and nothing else. Where the file exists as you start, read it first.

## The report

A report is this block and at most ten lines after it. Before you end, add the block to your file in
`content/<story>/.plan/reports/`.

```yaml
step: maps              # the step and the task of your dispatch
task: draw
status: pass            # pass, faults or blocked
changed_files: []       # each file of the book this run wrote or changed, its own report and captures left out
faults: []              # the id of each fault this run wrote to a fault list
unresolved: []          # each question the sources leave open, and each choice that waits for the user
stale: []               # each file built from something this report changes or finds wrong
```

Your file in `reports/` is `<section>-<role>.yaml`, with the battle or the language of your dispatch after the
role where it has one: `020-cartographer.yaml`, `040-battle-auditor-issus-333.yaml`, `all-translator-tr.yaml`.
The file is a YAML list with one entry per run, the newest last. A run adds its entry and changes none of the
earlier ones, so the file shows each round of a draw, an audit and a fix in order. An entry may carry more keys
where a definition asks for them.

Your faults are in the fault list, so the block names their ids and does not repeat them. The ten lines hold
what your definition asks for and no channel holds. What a file holds is named by its path and not copied.

`status` is `pass` when the work is done and nobody else has to act, `faults` when another agent's file has to
change, and `blocked` when the work could not be done: a file is missing, a source is unread, a plan contradicts
its sources.

An answer an agent gave to a question the sources leave open goes under `unresolved`, with the answer and what it
rests on.
