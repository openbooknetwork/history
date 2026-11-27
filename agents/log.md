# Working on the log

For every worker and checker, on a story that has the folder `content/<story>/.plan/log/`. On such a story this
note takes the place of "The fault list", "Fixing a fault", "The fix log" and "The report" in `agents/report.md`,
and it wins over your definition wherever that tells you to write a fault list, a fix log or a report.
`improvements-spec.md` is the design.

## What you do not do

- You write no fault list, no fix log and no report. You do not open `faults/` or `fixes/`.
- You run no `git` command that writes. To see what changed, read the views below.
- You keep no state. What is open is worked out from the log.

## Start

Run `node scripts/brief.mjs <story> <your role> <section> --task <the task of your dispatch>`, with
`--pages <the pages of your dispatch>` where it names pages. It lists what you read for this task, and nothing
else. Read every file of the list in one turn, one `Read` call for each, sent
together. Two of them are made for you:

- **asks:** the work that is open for you to do, each with its id.
- **since:** for a checker's `recheck`, what others changed in the files you have the last word on, since your
  last run, each change with its old and new text and its reason.

## Change a file

Change it with `Edit`, or through its generator where a script writes it. The change is written to the log for
you, with its old and new text. You type no record of it.

**Others work beside you.** Where your dispatch names `pages`, an agent of your role has each other page of
the section, at the same time. A file of your page is yours alone. A file the pages share, the section's
generator, `names.md`, the digest, a plan file, you change with `Edit` and never with a command: `Edit` refuses
a file that changed since you read it, so you read it again and no change is lost, and a command writes over
what another agent wrote a moment ago.

**Who finds it fixes it.** Fix what you find, in whatever file it is, where you have in front of you what the
fix rests on. Nothing waits for a ruling.

## Say why

A fault is an edit and its reason. You owe a reason for each edit you make as a checker, and as a maker for each
edit to a file that is not your own work.

```
node scripts/fault.mjs why <story> <section> --by <your role>
node scripts/fault.mjs why <story> <section> --by <your role> <edit id> ... --severity <wrong|weak|taste>
                           --kind <kind> --source "<the line of the source it rests on, with its file>"
```

Where you have more than two reasons to give, write them all to one file and give them in one call:

```
node scripts/fault.mjs why <story> <section> --by <your role> --from <a file in your scratchpad>
```

The file is a YAML list, an entry a reason: `edits` with the ids, `severity`, `kind`, `source`, and `claim` and
`introduced` where you can tell. Nothing is written unless every entry is right, and the answer names each
problem, so you fix the file and send it again.

The first form lists your edits that still owe a reason, each with its id. Where your dispatch names `pages`,
another agent of your role works on the other pages at the same time, and the list holds its edits too: you
explain your own. One call may explain several edits:
give the reasons of a page together. `--claim <id>` names the digest's claim, and `--introduced <work>` the work
that made the fault, where you can tell.

## Ask

Work you cannot do from where you stand goes to its owner. A decision that is the user's goes to `user`.

```
node scripts/fault.mjs ask <story> <section> --by <your role> --for <role|user> --what "<what must change>"
                           [--file <path>] [--source "<line>"] [--severity <s>]
```

Say what you found, so the owner does not search again. Only a question that waits for a ruling is an ask: where
a rule or the sources let you answer it, answer it and go on.

## Answer an ask

- An ask of your list that you did: `node scripts/fault.mjs reply <story> <ask id> --by <your role> done`.
- One you will not do: `... declined --why "<the reason>"`.
- As a checker, an ask of yours that its owner answered: `... agreed`, or `... again --why "<what is still wrong>"`.

## End

Run `node scripts/fault.mjs line <story> <section> --by <your role>` and end with the line it prints, alone:

```
ok 1 0
```

It is the result, the asks still open of yours and for you, and the asks that wait for a ruling. Your manager
reads the log for the rest. Write nothing after the line.

## Turns

Your whole context is sent again on every turn. Calls that do not wait on each other go in one turn: several
files to read, several passages to find, several checks to run, several edits. To look into the sources, list
every lookup of a page first and send them in one call of `node scripts/find-in-sources.mjs <story> --out <a
file in your scratchpad> <term or range> ...`.
