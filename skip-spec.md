# Skipping work that still stands

A design for the story pipeline, second draft, 26 Nov 2026. The first draft was reviewed by a fresh agent that
replayed it on two real section builds and probed the hooks; its findings are at the end, and this draft is
what they left. `scripts/inputs.mjs` and the two hooks named here are the build of it.

## The problem

Every dispatch runs an agent, whether or not anything it builds from has changed. A run that breaks starts
again and does finished work a second time. A small change costs a section. Three benchmark runs died or were
restarted, and a whole story takes hours.

## What does not work, and why

The first draft said: a dispatch is still good when its last run ended `pass` and neither its inputs nor its
outputs have changed. Replayed on a clean build of seven dispatches, that rule skips one. Two reasons, both the
pipeline's own design:

- **Everybody edits.** By "Who finds it fixes it" a cartographer changes the plan it draws from, a fact checker
  changes the texts it checks and adds rows to `names.md`, and an auditor moves a marker another role made. So
  inputs and outputs change in every run, by the hands of the roles themselves.
- **A first check rarely ends `pass`.** It ends `faults`, a fix follows, and the `pass` lands on a `recheck`.

So the unit to seal is not a dispatch with its verdict. It is the state the work is in.

## The two rules

**A maker still stands** when what it builds from is as it was when its run ended, and what it made is there.
What others changed in its outputs afterwards does not reopen it: a fact checker's fix to a text is no reason to
write the text again.

**A checker still stands** when what it checks is as it was the last time it ended `pass`, whatever the task of
that run, `check` or `recheck`, and the means it checks with are as they were.

A dispatch whose role still stands does not start. One that does not starts as today.

Never skipped: `fix`, `recheck`, `add`, `rewrite`, `replace`, which are sent because something is open; any
manager; and a dispatch with `again: true`.

## What is hashed

### A maker's inputs

What `scripts/role-inputs.mjs` lists, the plan by page as now, with three changes:

- **The names a role's own inputs mention**, and not `names.md` whole: its rows whose name stands in the role's
  plan files, by `sliceNames` of `scripts/slice.mjs`. A row a writer adds for a name the texts need does not
  touch a cartographer, whose plan does not hold that name.
- **The section's part of the brief and of the digest**, not the whole files, for a section.
- **The dispatch's `note`**, which states what changed since the plan.

They are hashed twice: as the agent starts and as it ends. Where a key differs and the run's own report names
that file under `changed_files`, the end hash is kept: a cartographer that corrected `map.yaml` built from the
corrected one. Where a key differs and the run did not change the file, another agent did while it worked, and
the start hash is kept, so the maker is not standing.

### What a checker checks

Hashed as it ends, after its own fixes, by page:

| Checker | What it checks |
|---|---|
| `map-auditor`, a section | each page's `page.yaml`, its `markers.yaml` and routes, and each shared marker, zone, zone entry and card the page names |
| `map-auditor`, `all` | every zone file, `zones.yaml`, the zone generator, `ground.yaml` |
| `fact-checker`, `plan-check` | the section's plan files |
| `fact-checker`, `check` | each page's `text/en.md`, `page.yaml` and `markers.yaml`, the shared markers and the cards it names |
| `section-reviewer` | each page's `text/en.md` and `page.yaml` |
| `battle-auditor` | the battle's card, its plan, its generator and its phase pages whole |
| `editor` | every section's `pages.yaml`, or every text |

With each: the open entries of the section's fault list. A fault somebody opened since is a reason to look.

### A checker's means

One hash of: the role's definition; each note the definition names, as `scripts/brief.mjs` cuts it for the
role; each script the definition names, followed through what it imports and runs; and the versions of the two
engines with the patches. A linter made stricter is in it, because the audit pack runs the linter. Means are
held for a checker and not for a maker: a maker's work is judged by its checker.

## The record

`reports/<section>-<role>[-<battle>].inputs.yaml`, a list with one entry a dispatch, the newest last. An older
record of the one-entry form counts as never ended.

```yaml
- task: draw
  step: maps
  at: 2026-11-26T09:12:43Z
  note: null
  before: 3f1c9a...            # the hash of the newest entry of this task in the report file, as the run starts
  inputs: { rules.md: 48b0..., "names#020": 6a06..., "020-greece-secured/map.yaml#the-danube": ae99... }
  # written as the agent ends:
  ended: 2026-11-26T09:31:02Z
  status: pass
  inputs_end: { "020-greece-secured/map.yaml#the-danube": 7d20... }    # the keys kept at their end hash
  outputs: [pages/020-greece-secured/020-the-danube/page.yaml]          # must still be there
  checked: { ... }             # a checker's: what it checks, as it left it
  means: 7c1e...               # a checker's
```

## Where it is decided

**The manager asks first.** `node scripts/inputs.mjs stands <story> <section>` prints, for each role of the
section, whether it still stands and, where not, why. A lead runs it as it starts and dispatches only what does
not stand. This is the first signal, and for a resume it is enough: a lead sent again after a crash reads the
list and goes on from what is left.

**The hook is the backstop.** `PreToolUse` on `Agent` (`hooks/dispatch.mjs`), after the form is checked:

- The role still stands: the call is denied, by the hook's JSON answer, and the reason is the answer the manager
  reads. It opens with `STILL STANDS, NO AGENT WAS STARTED AND NONE IS NEEDED`, says what was compared, and
  carries the block of the role's last report, so the manager has what a run would have told it. A denied call
  reaches a manager marked as a hook error, so the wording says at once that nothing failed.
- It does not: the entry is opened and the agent starts.

**After the agent** (`PostToolUse` on `Agent`, `hooks/dispatch-end.mjs`, new). Only where the tool's answer says
the run completed: a call sent to the background answers at once, and is not sealed. It reads the report file
and takes the newest entry of the dispatch's task whose hash differs from `before`. No such entry: the record
stays open, and an open entry never stands.

A hook that fails lets the dispatch through.

## What is left out, for now

- **Narrowing to pages.** Three roles take page ids and scope by them: cartographer, fact-checker, image-finder.
  The rest do not, and a zone or a fact two pages share is not per page. To be built for those three after this
  has run, with the hook rewriting the dispatch's `pages` and saying so.
- **An agent resumed by a message** passes no hook. A resumed fix opens no entry. A fix never stands anyway,
  and what it changes reopens the checker by the second rule.
- **Commits.** Nobody commits during a section, so the records of a run that broke are in its folder alone. A
  resume is in that folder.

## What it does not do

It does not prove old work is right. It saves nothing on the first build of a story. It skips no fix.

## How it is tested

1. Tests on a small made-up story: a maker that edits its own input still stands; one whose input another
   changed does not; a maker whose output another fixed still stands; a checker stands after a `recheck` that
   passed and not after a `faults`; a checker falls when what it checks changes, when a fault is opened, when its
   means change; an entry never ended does not stand; `again` and a `fix` always run.
2. One benchmark, in one folder: build section 020, run the same prompt again, and count. The target is every
   maker and checker skipped. Then change one route and run a third time.

## The review of the first draft

A fresh agent, 26 Nov 2026, with probes on Claude Code 2.1.332:

- Replayed on a clean build, the first rule skipped 1 of 7 dispatches. After a run where all ended `pass`,
  `inputs.mjs stale` listed the cartographer and the writer as stale through their own and each other's edits.
- In every run with a fix round the first check ended `faults`.
- A hook after a background dispatch fires 145 ms after launch, with the status `async_launched`.
- A denial, by exit code or by JSON, reaches the manager as a hook error. Refused managers in real runs fixed and
  sent again, and three first read the hook's code.
- The hook after an `Agent` call fires at every depth, with the dispatch's type and prompt.
- The first draft's "what a checker checks" left out shared markers, zones and cards, and its means left out the
  scripts a script runs.
- An agent wrote its report file with `cat >`, so a count of entries is no test of a new one.
- Hashing 303 built files takes 0.13 s, and slicing with recording 1.1 s.
