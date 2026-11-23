# Reporting

For every agent of `.claude/agents/` that reports to the overseer. A report opens with this block, and the prose
the agent's definition asks for follows it.

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
`map-design`, `plan`, `maps`, `battle-plan`, `battles`, `texts`, `images` and `review`, or `fix` or `ruling` where a
fix or a ruling made it. Leave the line out where the evidence does not show it. `node scripts/fault-ledger.mjs`
counts from it the faults that passed the step meant to catch them.

An answer an agent gave to a question the sources leave open goes under `unresolved`, with the answer and what it
rests on.
