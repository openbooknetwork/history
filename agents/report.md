# Reporting

For every agent of `.claude/agents/`: the channels it speaks through, and the report it ends with.

## Channels

Agents pass work to each other through eight channels and through nothing else. Each has one kind of writer, a
known reader and one place. The places below are in `content/<story>/.plan/`.

| Channel | Writer | Reader | Place |
|---|---|---|---|
| Work products | the agent of each step | the later steps | `brief.md`, `research.md`, `names.md`, the section plans and the battle plans |
| Rules | the overseer alone | every agent | `agents/*.md` for every story, `rules.md` for this one |
| Dispatch | the overseer | one agent | the block of "The dispatch", in the message that starts or resumes the agent |
| Report | an agent | the overseer | the block of "The report", saved to `reports/` |
| Fault list | a checker | the fixer | `faults/<section number>.yaml`, and `faults/story.yaml` for a fault of no one section |
| Fix log | whoever changes a file to fix it | the reviewer and the user | `fixes/<section number>.yaml`, one entry a change |
| Handoff | an agent | the next agent of its role | `handoff/<role>.md`, one page |
| Decision log | the overseer | the user and the reviewer | `decisions.md` |

- What the next agent needs is in a channel. Nothing that matters stays only in a scratchpad or a message.
- Agents do not write to each other. A checker writes a fault, the fixer sets its state, and the checker reads the
  list again. The overseer rules on a fault and does not relay it.
- **No fix without its fault.** Every change that fixes something closes a fault that was written to the fault
  list first, however small the change and whoever makes it. There is one fault list and one fix log, and no fix
  of another kind.

## The dispatch

Every dispatch, and every message that resumes an agent, opens with this block:

```yaml
story: alexander-the-great
section: "020"            # all, for an agent that works on the whole story
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
- id: <the fault's own id>
  severity: wrong     # wrong, weak or taste
  file: content/<story>/pages/<section>/<page>/text/en.md
  field: <the field of the file that changes>
  replaces: clause    # value where `new` is the field's whole value, clause where it stands in place of `old` inside it
  old: <the text as it stands>
  new: <the text that takes its place>
  source: <the line of the source the fault rests on, with its file>
  introduced: plan    # the work that made the fault, where you can tell
  state: open         # open, fixed or declined
```

The checker writes the fault with the state `open`. The fixer sets it to `fixed` or `declined`, and changes no
other line of the entry.

## Fixing a fault

The fixer applies each fault of its own as it is written.

- A clause edit puts `new` in place of `old` and leaves the rest of the field as it stands. Every author's figure
  stays unless the fault says to remove it.
- Set the fault's state, then add the change to the fix log with the `old` and `new` text of each field you
  changed. That entry is the diff of the fix: "done" says nothing of what else the field lost.
- A checker rechecks a fix against the previous commit, with `git diff <commit>^ <commit> -- <file>`, and not
  against the fault alone.

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
  commit: <the commit that holds the change>
```

A fix with no entry, or an entry that names no fault, is a fault of the run.

## The report

A report opens with this block, and the prose the agent's definition asks for follows it.

```yaml
status: pass            # pass, faults or blocked
changed_files: []       # each file of the book this run wrote or changed, its own report and captures left out
faults:
  - severity: wrong     # wrong, weak or taste
    kind: fact          # fact, attribution, wording, sources, map, battle, image, order, plan or check
    file: content/<story>/pages/<section>/<page>/text/en.md
    claim: "30.4"       # the digest id, where the fault is about a claim
    evidence: the sentence, field or capture, and the line of the source it goes against
    introduced: plan    # the work that made the fault, where you can tell
    action: what should change
    owner: section-reviewer   # the agent whose file changes
unresolved: []          # each question the sources leave open, and each choice that waits for the user
stale: []               # each file built from something this report changes or finds wrong
```

`status` is `pass` when the work is done and nobody else has to act, `faults` when another agent's file has to
change, and `blocked` when the work could not be done: a file is missing, a source is unread, a plan contradicts
its sources.

`severity` is `wrong` where the reader would be told something false, a drawing has no basis, or a check fails. It
is `weak` where the evidence is thinner than `agents/evidence.md` asks. It is `taste` where a careful person could
leave the file as it is.  `owner` is the name of an agent of `.claude/agents/`, as the second table of `AGENTS.md`
lists them. The overseer sends every `wrong` fault back, decides each `weak` one with the user, and may let a
`taste` fault stand.

`introduced` names the work that made the fault, which is often an earlier step than the file's own: a route drawn
as its plan says is a fault of the `plan`, not of the `maps`. It is one of `source`, `research`, `names`, `brief`,
`map-design`, `pre-plan`, `plan`, `maps`, `battle-plan`, `battles`, `texts`, `images` and `review`, or `fix` or `ruling` where a
fix or a ruling made it. Leave the line out where the evidence does not show it. `node scripts/fault-ledger.mjs`
counts from it the faults that passed the step meant to catch them.

An answer an agent gave to a question the sources leave open goes under `unresolved`, with the answer and what it
rests on.
