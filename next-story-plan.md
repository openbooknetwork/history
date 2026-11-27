# The next story: Joan of Arc, built in a cloud session

A plan, written on 26 Nov 2026. Not started. `agents/overseer.md` has the steps of a story, `agents/cloud.md` what
changes when nobody sits at the terminal, and `cloud-integration.md` what a cloud session needs.

## The short answer

Yes: one prompt starts it and the run ends with a pull request. But six things have to be true before that
prompt can work, and three of them are not true yet. A story is also the first test of five steps that no agent
has ever run. So the plan is three small steps and then the prompt.

## What is not ready

| # | What | State | Who |
|---|---|---|---|
| 1 | The branch is on GitHub | **No.** `pipeline` is 40 commits ahead of what is pushed. A cloud session sees none of this session's work | you say "push" |
| 2 | The setup script installs the packages | `npm ci` in the repo's folder. No patch is left to apply: harita 0.12.3 and kitap 0.9.2 hold all three | check once |
| 3 | No agent stops on a permission prompt | Done: the project allows every shell command, edit, write and web fetch. See "Permissions" below | done, 26 Nov |
| 4 | The hooks load | Yes, from `.claude/settings.json` | done |
| 5 | The map data is in reach | Yes, if the environment can reach `assets.openhistorybook.org` | check once |
| 6 | The run can open its own pull request | To say in the prompt (`cloud-integration.md` 5) | in the prompt below |

### Permissions, as the documentation has them (checked 26 Nov 2026)

- **One switch for everything exists, and a repo cannot set it.** "Bypass permissions" skips every check. It
  takes effect from a start-up flag or from a person's own settings. Written into a project's checked-in
  settings it is ignored, and the session starts in the manual mode.
- **A cloud session's mode is chosen when it is started,** from a list: accept edits, plan, or auto. The
  documentation does not say which is the default, nor what happens to a question nobody answers.
- **A project's allow rules do apply in a cloud session.** `"allow": ["Bash", "Edit", "Write"]` in
  `.claude/settings.json` allows every shell command and every edit, with no question. This is the "do
  whatever" that a repo can carry.
- **Agents inherit.** An agent, and an agent it starts, runs in the session's mode with its rules.
- **Our hooks still apply in every mode,** bypass too. So the dispatch form is still checked and work that
  stands is still skipped.
- **The network is limited by default** to package sources. The environment needs the full level, or a list
  that holds `assets.openhistorybook.org`, Wikipedia, Wikimedia Commons and the sites the sources come from.

So for the cloud run: commit broad allow rules, start the session in auto mode, and give the environment the
network it needs. The smoke test shows whether anything still stops.

Also unknown in a cloud container:

- **A cold build.** The first build of the book took over 30 minutes there. A patch cuts the long part to about
  three minutes. The step after it was never timed.
- **Three layers of agents, many at once.** Proven on a laptop. Never run in the cloud.
- **A session that ends early.** Work that stands is now skipped on a second start, and `agents/cloud.md` has the
  overseer commit at the end of each step. Together they should make a restart cheap. Not yet seen to work.

## Steps no agent has run

`brief`, `survey`, `final-brief`, `edit` and `story`. A new story is their first run. Expect to find faults in
them, as every other step had on its first run.

## The plan

### 1. Make the branch ready (a day, no run)

- Allow the pipeline's own commands in project settings.
- Push `pipeline`.

### 2. A smoke test in the cloud (about $10)

Run the benchmark build of section 020 in a cloud session, with the prompt `scripts/benchmark.mjs` prints. It is
30 minutes of known work with a known cost. It answers: do the packages install, do the hooks fire, does a cold
build finish, do three layers of agents run, does anything stop on a prompt. Fix what it shows. Do not start a
story before this passes.

### 3. Write the brief here, with you (twenty minutes, no cost)

`brief` is the one step that needs you: the subject, its years, what the reader knows at the end, and the
sections. In a cloud run the overseer would decide all of that alone. It is better decided by you, once, in a
local session, and committed. The cloud run then starts at `survey`.

Things to decide in it:

| Question | A first answer, for you to change |
|---|---|
| The story's id | `joan-of-arc` |
| What it tells | a war, seen through one life: France in 1429, her year of campaigns, her capture and trial, and what followed |
| Its years | 1412 to 1456: her birth to the verdict that cleared her, with the war before her in one opening section |
| Its size | 35 to 45 pages in six or seven sections. Her campaigns cover one year and one region, so it is a short story beside Alexander's 71 |
| Battles with step pages | the relief of Orléans, and perhaps Patay. Only where the sources give positions |
| The map | northern France, zoomed in: the lands of the English king, of Burgundy and of the Dauphin, town by town |
| Languages | English alone. Translation is on hold |

Two things make this story different from Alexander, and both suit the pipeline:

- **The sources are far better.** The records of her trial and of the later retrial survive, with sworn
  statements, and are in translation online. More lines will be sourced and fewer estimated.
- **The map is small and well documented.** Rivers such as the Loire and the Seine are in the Europe file of
  Natural Earth. Borders moved town by town, which the sources list.

### 4. The run (one prompt)

Start a cloud session on the `pipeline` branch and type the command `/build-story joan-of-arc cloud`. With no
`cloud` the command runs the local way, and stops for the user at each point the notes name. It is
`.claude/commands/build-story.md`, and it holds this prompt, with the story's id in place:

```
Build the story joan-of-arc with this repo's pipeline, unattended.

You are the overseer. Read agents/overseer.md, then agents/cloud.md, and follow both. The brief is written and
agreed: content/joan-of-arc/.plan/brief.md. Start at the step survey and go on to the step story. Do not run
name-forms or translation.

Nobody is at the terminal. Rule on every point where agents/overseer.md waits for the user, as agents/cloud.md
says, and write each ruling into decisions.md as a cloud ruling. Take the careful side.

Dispatch in the foreground. Before each step, run node scripts/inputs.mjs stands joan-of-arc, and dispatch only
what does not stand: this session may be a restart of one that ended early.

Commit at the end of each step, on this session's branch, with the step's name in the message. Never commit on
main and never push to it.

When the story passes the step story: save the run's ledger as agents/overseer.md says, pack the images, push the
branch and open the pull request yourself, with every cloud ruling in its text. Then report the story's page
count, its cost from the ledger, the pull request's link, and one line for each thing of the process itself that
broke or had to be worked around.
```

### 5. After the run

You pull the branch and read the story on a phone. I read the ledger and the transcripts, as after every
benchmark run, and fix what the five new steps showed.

## What it should cost

From what each step cost on Alexander. A guess, to be off by a third either way.

| Step | For a story of 40 pages in 7 sections | From |
|---|---|---|
| Survey of the sources | $8 | never run: a guess |
| Page lists and their check | $12 | $6 for three sections |
| Research, a section each, and two battles | $65 | $8 a section |
| Names, map design | $10 | $6 and $4 |
| Plans with their check | $55 | $8 a section |
| The shared map | $20 | $10 for 12 zones |
| Building the sections | $100 | $2.50 a page |
| Two battles' step pages | $15 | $7 a battle |
| The editor's check and the story's audit | $20 | never run: a guess |
| **In all** | **about $300** | |

And six to ten hours, with the sections run side by side in waves.

## What could go wrong, most likely first

1. A step that has never run breaks, and the overseer rules its way past it badly. The careful-side rule limits
   the harm, and every ruling is in `decisions.md` for you to read.
2. The session ends before the story does. A second session with the same prompt goes on from the last commit.
3. A source cannot be fetched. The section goes on with what was read, and the address is listed.
4. The cost runs over. There is no limit in the pipeline. The ledger is only read at the end.

## What I would not do

Start the story before the smoke test. A $10 run that fails teaches the same lesson as a $300 run that fails.
