# Cloud integration: what has to change

What a Claude Code cloud session needs before it can build a story unattended with the pipeline of `spec.md`.
Written on 23 Nov 2026 from one long cloud session on the `pipeline` branch, in the environment `openbooknetwork`:
4 cores, 16 GB of memory, unrestricted network, Playwright's Chromium under `/opt/pw-browsers`.

Each item says what was seen, what to change and where. The order is the order to do them in.

## Summary

| # | Problem | Fix | Where | Size |
|---|---|---|---|---|
| 1 | The setup script installs nothing | Enter the repo by its folder name, run `npm ci` | the environment | minutes |
| 2 | A cold build takes more than 30 minutes | Save the zone cache as it goes, or scope it to `--story`. Until then, warm it once per session | harita, then the setup script | a day in harita |
| 3 | The sources are not in the container | Fetch them in the setup script, or as the run's first step | the setup script, `agents/cloud.md` | minutes |
| 4 | The plugin's hooks do not load in a cloud session | Name the hooks in `.claude/settings.json` | history | an hour |
| 5 | The run cannot open its own pull request | Say so in the prompt that starts the run | the run's prompt, `agents/cloud.md` | minutes |
| 6 | Permission prompts stop an unattended run | Allow the pipeline's commands in project settings | history | an hour |
| 7 | harita and kitap are out of reach | Add both repositories to the environment | the environment | minutes |
| 8 | Image originals and the store | Keep the pack on the branch. Later, a GitHub workflow uploads | history, GitHub | later |
| 9 | Three layers of agents, twenty at once | Try it once on the benchmark before a full run | a test run | an hour |
| 10 | Phone captures, and profilers | Find the crash once builds work. Signals do not reach a busy process | history, harita | open |

Items 1 to 3 block everything else. With them done, the benchmark of `scripts/benchmark.mjs` can run in a cloud
session.

## 1. The setup script installs nothing

**Seen.** The environment's setup script is:

```bash
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || true
npm install || true
```

The session started with no `node_modules`. Every script that imports `js-yaml` failed, and `harita` did not
exist, until `npm ci` was run by hand. A setup script starts in the folder that holds the checkouts, not inside
one, and `CLAUDE_PROJECT_DIR` is not set for it. So the `cd` fails, `|| true` hides that, and `npm install` runs
in a folder with no `package.json`. Its failure is hidden too.

**Change.** Enter the repository by its name, and let a failure show:

```bash
if [ -d history ]; then (cd history && npm ci --ignore-scripts); fi
```

`npm ci` took about a minute here and `node_modules` is 402 MB.

## 2. A cold build takes more than 30 minutes

**Seen.** `harita build --story alexander-the-great` printed nothing and wrote nothing for 30 minutes, then was
stopped. It was not waiting on the network: it used one full core and about 840 MB.

Every build first compares the zones of every story in the book, to warn about copies (`site` calls `zonePairs`
in harita's `engine.mjs`). For that it cuts each of the book's 1,234 zone files against the land outline, with
exact big-number arithmetic. The cuts are cached in `.cache/harita/zone-compare.json`, which git ignores. The
cache is written once, after every cut is made, so a run that is stopped saves nothing. `--story` does not
narrow the comparison.

A cloud container always starts cold. The "14 seconds" of spec item 1.8 is a warm figure from a laptop.

**Why it matters more with the new process.** The notes now tell each agent to build once into a folder of its
own and serve it (1.7, 2.12). The cache is shared through `.cache/`, so that works, but only after one build has
finished. Twenty agents that start cold at once would each spend the cold time.

**Change, in harita.** One of these, in order of value:

1. Save the cache as it goes, every few dozen cuts and on exit. A stopped build then keeps its work.
2. With `--story`, cut and compare only the zones that story shows. The whole-book comparison stays for a build
   of every story and for `harita zones`.
3. Print a line of progress, so a long first build does not look like a hang.

**Change, until harita has it.** Warm the cache once, before any agent is dispatched: the overseer's first act in
a cloud run is one build of the story, in the background, and `agents/cloud.md` should say so with the time it
takes. Putting the build in the setup script is the other way, and it delays every session by the cold time,
whether the session builds or not. Committing the cache file is the third: its size is not known yet.

A full cold build is running in this session with a two-hour limit. Its time and the cache's size go here when
it ends.

## 3. The sources are not in the container

**Seen.** `content/alexander-the-great/.references/` and `.wikipedia/` are empty, since git ignores them.
`node scripts/quotes-check.mjs alexander-the-great` reports 575 problems in 575 quotes, all of them "no file".
A fact checker, a research reviewer and an auditor cannot work without these files, and the edit hook's
`quotes-check` is skipped while they are missing.

**Change.** `./node_modules/.bin/harita sources <story>` fetches them from `wikipedia.urls` and
`references.urls`. The network here is unrestricted, so it can run. For a story that exists, run it as the first
step of a cloud run, and say so in `agents/cloud.md`. For a new story the research coordinator fetches them
anyway. The spec's "Not in this spec" lists the sites that refused fetches in the Alexander run: those files
have to reach the container another way, and today there is none but committing them.

## 4. The plugin's hooks do not load in a cloud session

**Seen.** The repo is now a plugin, `story-pipeline`, and `claude plugin validate .` passes. A plugin's hooks
run only where the plugin is loaded: with `claude --plugin-dir .`, or installed from a marketplace. A cloud
session starts neither way. The agent definitions do load, because they are also project agents in
`.claude/agents/`: `section-lead`, `map-keeper`, `research-coordinator` and `research-reviewer` each became
available in this session as soon as its file was written. The hooks did not.

So in a cloud run today nothing refuses a broken dispatch, checks an edit or holds an agent to its report. The
notes ask for all of it and nothing enforces it.

**Change.** Name the same four hooks in the project's `.claude/settings.json`, with `$CLAUDE_PROJECT_DIR` in
place of `${CLAUDE_PLUGIN_ROOT}`. Project settings load in a cloud session. The hook scripts in `hooks/` need no
change. Not yet verified: that a cloud session runs project hooks inside nested agents, as the docs say a
plugin's are.

The workflow `workflows/section.js` has the same limit. A cloud session can run it by its path with the Workflow
tool, where the user has asked for a workflow.

## 5. The run cannot open its own pull request

**Seen.** `agents/cloud.md` now says the run packs the images, pushes and opens the pull request itself (2.12).
A cloud session's own instructions say the opposite: no pull request unless the user asks for one. The session's
rule wins, so an unattended run would stop at the push.

**Change.** The prompt that starts a cloud run has to ask for the pull request in the user's own words, such as
"open the pull request when the story passes `story`". `agents/cloud.md` should give that sentence as part of
the prompt to use. The same holds for the branch: a session pushes only to the branch it was given.

Commit messages are already right. The harness asks for a session line at the end of each message, AGENTS.md
forbids it, and the user's rule wins: none of this session's commits carries one.

## 6. Permission prompts stop an unattended run

**Seen.** One edit in this session was refused by the automatic permission check, because it went beyond what
the user had asked for at that moment. That was correct. In an unattended run the same check, or a plain
permission prompt, stops an agent with nobody to answer.

**Change.** Allow the pipeline's own commands in `.claude/settings.json`, so no agent waits on them:
`node scripts/*`, `./node_modules/.bin/harita *`, `python3 -m http.server *`, and `git add`, `git commit` and
`git push` on the session's branch. Keep everything else asking. Then start the run in a permission mode that
does not prompt for edits inside `content/`.

## 7. harita and kitap are out of reach

**Seen.** The session's GitHub access is `openbooknetwork/history` alone. Eleven items of the spec live in
harita or kitap (1.4, 1.5, 1.6, 1.10, 1.12, 3.8, 6.2, 6.4, 6.8, 6.9, 6.11), and so does the fix of item 2 here.
None could be touched.

**Change.** Add `openbooknetwork/harita` and `openbooknetwork/kitap` to the environment's repositories. A
session can then work on the engine and on the book in one run, and test a change of harita against this repo
before it is released.

Two of those items show as noise in every cloud run until they land: the linter reports all 71 pages of
Alexander for a missing `when` (kitap's dates before our era, 1.12), and `harita check` reports an image
placeholder as an error (the build half of 6.3).

## 8. Image originals and the store

**Seen.** The container holds each image's `image.yaml` and no original, so `scripts/contact-sheet.mjs` stops at
its thumbnails. An upload to the asset store needs a key that is signed on the client, which a cloud session
cannot be given safely (feedback item 20).

**Change.** Nothing new now: the pack stays on the branch, the maintainer unpacks and uploads, and the merge is a
squash, as `agents/cloud.md` says. `contact-sheet.mjs` should list placements without thumbnails where the
originals are missing, so the check of an image shown twice still runs in the cloud. Later, a GitHub workflow
that holds the store key can unpack, upload and remove the pack on a pull request (spec 6.6).

## 9. Three layers of agents, twenty at once

**Seen.** The hierarchy of 2.17 rests on two things the docs say and this session did not test: an agent with
the `Agent` tool can start agents of its own three layers down, and twenty agents run at once. A cloud container
has 4 cores and 16 GB. One build alone uses a core and 840 MB, and one headless Chrome more.

**Change.** Before a full run, try the tree on the benchmark: one section lead, with its battle coordinator
below it, building section 020. That shows whether nested dispatch works in a cloud session, whether the
dispatch hook runs at each level, and how many agents the container carries. Size the waves of sections from
that, and write the number into "Managers" in `agents/overseer.md`.

## 10. Smaller things

- **Phone-size captures.** Spec 1.11 is still open: 390x780 crashed headless Chrome in the Alexander run. It
  could not be looked at here, since no build finished. It is the first thing to try once item 2 is solved.
- **`screenshot.mjs` on Linux.** It finds Playwright's Chromium under `/opt/pw-browsers`, which this container
  has. It has still not taken a capture in a cloud session.
- **Profiling.** Signals do not reach a busy Node process in this container: `--cpu-prof`, `--prof` and
  `--report-on-signal` all came back empty. The debugger protocol works: start with `--inspect`, then
  `Debugger.pause` over the websocket gives the stack. That is how item 2 was found.
- **The two-hour limit.** A background command is stopped after two hours. The notes already tell agents to
  serve a static build of their own. A cold build must fit inside that limit too.
- **The container is temporary.** Anything not pushed is lost when the session ends. The notes already have the
  overseer commit at the end of each step and save `run.json` at `story`. The transcripts the ledger reads live
  under `~/.claude/projects/` and go with the container, so the ledger must be saved before the last push.

## What to do first

1. Fix the setup script (item 1). Nothing runs without it.
2. Add harita and kitap to the environment (item 7), and fix the cache in harita (item 2).
3. Wire the hooks into `.claude/settings.json` and allow the pipeline's commands (items 4 and 6).
4. Run the benchmark with one section lead (item 9), with the sources fetched first (item 3).
5. Write what that run shows into `agents/cloud.md`: the cold build time, the prompt to start a run with, and
   the number of agents a container carries.
