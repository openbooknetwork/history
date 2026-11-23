# Feedback from the Alexander the Great cloud run

Notes on the agents' process, gathered during the unattended build of `alexander-the-great`, for review with the
pull request. Each note says what happened, why, and a proposed change. None of the changes is made yet.

## 1. A page that names a missing battle card fails every build of the story

**What happens.** The cartographer draws a section's pages from its plan, and the plan puts `battle: <id>` on the
page. The battle-implementor writes the card only once that section's page files exist (`agents/overseer.md`,
step 10). Between the two, the dev server refuses to build the whole story:

```
error: .../030-granicus/010-granicus/page.yaml: unknown battle "granicus"
build failed, fix the error above and save again
```

This happened at Chaeronea (010), Thebes (020) and the Granicus (030), and will happen once for each section
with a battle.

**What it costs.** Every agent that captures from the shared port sees a failed build. The cartographer works
around it by commenting out the `battle:` line for its captures and putting it back, so `harita check` can print
ok while the dev server's log shows failures. Other agents' captures come out blank or half-drawn and have to be
retaken.

**Proposed change**, any one of:
- The battle-implementor writes every card at the start of step 10, from the section plans and battle plans,
  before the cartographer reaches those sections. The phase pages still follow the maps one battle at a time.
- The cartographer leaves the `battle:` line out of a page until its card exists, and the implementor adds it.
- `harita dev` warns about an unknown battle and builds the rest of the story, where `harita check` and
  `npm run build -- --strict` keep it an error.

## 2. `scripts/screenshot.mjs` fails on Linux, and it cannot capture the Text view

**The Chrome path.** Line 15 launches Chrome from a fixed macOS path:

```js
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', ...
```

On the Linux cloud container that file does not exist, so every capture fails. `agents/pages.md` ("Checking a
story", step 3) tells every agent to capture with this script, so no map, battle or image step could check its
work. The battle-implementor made a copy with one changed line:

```js
const chrome = spawn('/usr/bin/google-chrome', ['--headless=new', '--no-sandbox', ...
```

Every later dispatch pointed agents to that copy in the session scratchpad. Each new agent found the failure for
itself until the overseer added the copy's path to its dispatch. `--no-sandbox` is needed because the container
runs as root.

**The Text view.** On a phone, a battle card is read in the page's Text view. The script has no way to switch to
it, so the battle-auditor made a second copy. With `SHOT_TEXT=1` set, that copy clicks the Text button after
each page loads:

```js
if (process.env.SHOT_TEXT) { await evaluate(`[...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Text")?.click()`); await sleep(2500); }
```

**Proposed change.**
- Pick the browser in this order: `CHROME_PATH` if it is set, then the macOS path, then `/usr/bin/google-chrome`,
  `chromium` or Playwright's Chromium at `/opt/pw-browsers/chromium` (pre-installed in cloud sessions).
- Add `--no-sandbox` when the process runs as root.
- Add `SHOT_TEXT=1` next to `SHOT_HOVER`, `SHOT_SCHEME` and `SHOT_LANG`, and document it in `agents/pages.md`.

The two copies are in the session scratchpad (`battle-implementor/screenshot.mjs` and `battle-auditor/shot.mjs`).
That folder is not in the repo and is lost when the session ends, so the changes are written out above.

## 3. `quotes-check` reads passage numbers on a "Rests on" line as claim ids

Coordinators wrote passage references such as "Diodorus 16.8.2" or "Arrian 3.23–25" on `Rests on:` lines, and
`node scripts/quotes-check.mjs` reported "claim 16.8 is not in the digest". The coordinators fixed it by moving
passages to a separate "How:" line. Either `agents/` should say that `Rests on:` holds digest ids only, or the
check should match only `<section number>.<n>` ids of the story's sections.

## 4. Rules the map audits kept finding, not yet in `agents/pages.md`

The map-auditors raised the same faults section after section. The overseer sent them to the cartographer as
story-wide rules. They belong in `agents/pages.md`:
- **A card stands on the battle's site, and a town marker on the same point comes off that page.** The card's
  crossed swords hide a marker beneath them, and the text's link then points at a marker the reader cannot see.
  The overseer's first rule, "no marker on a card's point", went wrong: to keep the town icons visible, the
  battle-implementor moved every card 11 to 27 km off its town, which put the siege of Tyre 27 km inland. The rule
  now is that the card keeps the site, the town marker comes off that page, and the text names the town without a
  link. A card's `lnglat` says where the battle was fought, so it must never move for layout.
- **A zone's legend name must not end before the page's date.** A zone that stands on later pages takes a
  `zones.yaml` entry named for that year (for example `macedon-335` on `macedon-340`'s outline).
- **A marker's note tells the event of the page that shows it.** A page that needs a place from another page
  takes its own marker id. Markers live in one `shared/markers.yaml`, so one id has one note. The step 7 editor
  found six ids planned in two sections.
- **A page shows every zone its neighbours show for its frame,** unless its text tells a change, so no land
  shows bare between two pages that show it held.

## 5. The cartographer is the slow step

One cartographer draws every section in turn, so that each zone and family exists once. Each section took
45–55 minutes, so nine sections take seven to eight hours, and every audit, battle and image step waits on it.
One option is a second cartographer for the sections after the shared zones exist. Another is to split zone
drawing from page files.

## 6. Other tool failures met during the run

- **A marker link can break the build halfway through an edit.** The 020 map fixes changed the 040 text's
  link to `@pelium-335b` before the marker was in `page.yaml`. Six builds failed until the marker landed. It
  cleared on its own, but it is the same pattern as item 1: an edit spread over two files breaks the shared
  build between saves.
- **Captures come out blank while another agent saves.** Every agent captures from one dev server, which
  rebuilds on every save. The auditors retook several captures that caught a rebuild. Item 1's failed builds
  make this worse.
- **A page drew without its zone and routes.** When `thrace-and-the-young-alexander` was the first page
  loaded at 1400 px wide, the Haemus band and the route lines did not draw. Stepping to the page from the one
  before at 1200 px, they did. This may be a bug in the viewer, not in the story.
- **The writers could not check their texts.** At step 8 the writers ran beside the first cartographer
  section, as `agents/overseer.md` says, so every `harita check` stopped at "no pages". No link in any text was
  checked until the page files existed. The links are checked later, page by page, as the maps land.
- **`harita patterns` cannot run at step 5.** It stops with "no pages", so the map-architect ran its colour
  test by hand. It has to run again once pages exist.
- **`contact-sheet.mjs` does not count marker images.** A marker shown on two pages shows its image twice, and
  the sheet did not flag it (020, `pelium-335`).
- **`harita image` refuses files that carry location data.** This is intended: it keeps photographers' GPS positions out of the book. The 010 image-finder removed the EXIF block from one Commons original (`convert -strip`, `philip-ii-gold-stater-c166c2`) and added the file by hand. The picture is unchanged, and the image is fully credited (Eric Polk, CC BY-SA 4.0, with its Commons page in `source:`). Its `sha256` matches the file on disk, so `images-pack` carries it and `unpack` verifies it. Two small gaps: the hand-made `image.yaml` has no `url:` line, and a fresh download from Commons would carry the GPS block again and fail the hash. Proposed change: `harita image --strip-location`, which strips the data and records both hashes.
- **Sites that refused or throttled automated fetches:**
  - escholarship.org answered 403 to the Chaeronea dissertation, which stayed unread.
  - The Metropolitan Museum answered 429, so the two Hellenistic art claims rested on Wikipedia alone and were
    dropped (090.17, 090.19).
  - Encyclopaedia Iranica refused a plain fetch; the `harita sources` client got through.
  - The Wikipedia API throttled the battle-auditor, so it could not check one battle's coordinates.
  - Commons throttled the 020 image-finder before it could read one file page in full.
- **Sources the digest needed and never read.** Polyaenus (the basis of the modern Chaeronea reconstructions),
  Hammond and Griffith's *History of Macedonia* II (no text file on archive.org), Arrian's *Indica* (Nearchus's
  voyage), the Babylonian Diadochi Chronicle, Strabo, and Depuydt on the date of Alexander's death. Each is in
  `decisions.md` with the ruling it led to.

- **Headless captures do not draw unit hover labels.** The battle-implementor could confirm in code that the
  pointer was over a unit (`persian-centre`, `thessalians`), but the label never drew in headless Chrome, so
  `SHOT_HOVER` gave no picture. No hover label in this story has been seen yet. Someone should check them in a
  real browser.
- **A phase page once drew the previous phase's armies** when the three Granicus phases were captured one after
  another. Captured on its own it drew correctly, so it was probably a transition, but it may be a viewer issue.

- **Headless captures can show an old frame of a route.** The 030 map-auditor found that the Halicarnassus
  routes drew when the page was loaded directly, but in only 2 of 8 tries when stepping there from Miletus. One
  capture still showed a Miletus route. The engine draws each route in by updating its data on every animation
  frame (`harita src/map.js`, `mapApply`, lines 497–506), and software-rendered headless Chrome falls behind.
  The map also never reports itself loaded in the sandbox. Auditors in a cloud run can mistake this for a missing
  route, so a capture script could wait for the route animation to end, or the engine could skip the animation
  when a test flag is set. Someone should check it once in a real browser.
- **Orphaned headless Chrome processes pile up.** Capture runs left Chrome processes with no parent (ports 9334,
  9666, 9740 at one point). With several agents capturing at once, no agent can tell which are its own.
  `screenshot.mjs` could kill its Chrome on every exit path, including errors and timeouts.
- **A static build works around the file-watcher limit.** When `harita dev` failed with ENOSPC, the 030
  map-auditor built the story once into its own `--out` folder and served it without watching. Auditors, who
  change no files, could always capture that way.

- **Phone-size captures crash headless Chrome.** Late in the run, captures at 390x780 crashed headless Chrome on
  Linux, and the 070 Ocean page crashed it at any size. The 080 cartographer and auditor captured at desktop size
  only. Phone layout, the reader's main view, went unchecked for those pages.

## 7. The build cuts a zone once for the whole story, not page by page

**What the map design assumed.** At step 5 the map-architect wrote into the brief's "Map" part that two
families are "drawn once and cut back page by page". `persia-336` is the Persian Empire at its height, and each
later `macedon-*` zone (priority 8) would sit over it (priority 9), so each page's Persian Empire would be "what
Macedon has not yet taken". `indians-327` was planned the same way, cut back by the Macedon zones of 326–325 BC.

**What the build does.** `cleanZones` in `node_modules/@openbooknetwork/harita/src/engine.mjs` (around lines
415–435) gives each zone one cleaned shape for the whole story. It trims that shape by every zone of a lower
priority number that shares any page with it:

```js
// zones only trim and overlap check against zones that share a page with them, so a 1915 beachhead
// never cuts a hole in a 1919 occupation zone
const pairs = new Set(pageZones.flatMap(zs => zs.flatMap(a => zs.map(b => a + ' ' + b))));
```

The rule exists so that zones of unrelated years do not cut each other. But a zone that shares pages with many
outranking zones loses all of their land on every page it appears on. When the 030 pages showed `persia-336`
with `macedon-334a`, `macedon-334` and `macedon-333`, `persia-336` lost the land of all three on every page.
On the hellespont page, dated before the Granicus, Asia Minor showed bare where it should be Persian.

**The workaround.** The cartographer gave each stage of the conquest its own `zones.yaml` entry on
`persia-336`'s outline, each shown only on the pages of its matching Macedon zone:

```yaml
persia-334a: {zone: persia-336, name: 'Persian Empire', clip: [Turkey, Cyprus, ..., Pakistan]}
persia-334:  {zone: persia-336, name: 'Persian Empire', clip: [Turkey, Cyprus, ..., Pakistan]}
persia-333:  {zone: persia-336, name: 'Persian Empire', clip: [Turkey, Cyprus, ..., Pakistan]}
league-335:  {zone: league-337, name: 'League of Corinth'}
```

`league-335` is the same problem from the other side. `thebes-335` (priority 1) shares the fall-of-thebes page
with `league-337` (priority 16), so it would have cut a hole for Thebes in the League on every page from 337 BC
on, not just in 335.

**What it costs.**
- One entry per stage. The brief has eight more Macedon stages that cut into Persia, from `macedon-333b` to
  `macedon-330`, so Persia needs about eight more entries. `indians-327` needs one for each of `macedon-326`,
  `macedon-325a` and `macedon-325`. Any later zone that outranks another and shares pages with it at several
  stages needs the same.
- Each entry repeats `persia-336`'s list of 22 clip countries. An entry takes its own `clip`, or failing that the
  story's whole land, never its base zone's clip (`engine.mjs`, around line 142: "the clip the story chose for
  it, else the story's land"). An entry that forgets the list would spill the Persian Empire over Greece and the
  islands.
- The failure is silent. The build reports nothing, and the land just shows bare. Only a capture or a map audit
  shows it, so a "Map" part that plans on cutting a zone back looks fine until pages exist.
- The brief's "Map" part was written on the wrong assumption. The overseer has added a paragraph saying so, but
  the "drawn once and cut back" sentence came from the map-architect and was not caught at step 5, because no
  page existed yet to show it.

**Proposed change**, one or more of:
- Say in `agents/pages.md` and the map-architect's definition that a zone is cut once for the story by every
  outranking zone it shares any page with, and that a zone cut back in stages needs one `zones.yaml` entry per
  stage.
- Let a `zones.yaml` entry inherit its base zone's `clip`, so stage entries are one short line each.
- In harita, cut a zone by the outranking zones of each page separately, caching one shape per distinct set of
  outranking zones. Stage entries would then not be needed.
- Have `harita check` warn when a zone loses more than a set share of its area to a zone it shares only some of
  its pages with.

## 8. The shared dev server cannot outlive a two-hour background limit

`agents/overseer.md` step 8 has the overseer start one dev server for the story, name its port in every
dispatch through step 14, and stop it after step 14. In a cloud session a background command stops after at
most two hours, and the server was stopped there, in the middle of step 8. A story build runs for many hours.
The cloud agents each started a server of their own instead, which `agents/pages.md` allows. That means several
builds of the story at once, which the single server was meant to avoid. `agents/cloud.md` should say this:
either agents start their own servers, or the overseer restarts the shared one every two hours under a new port.

Since each agent began running its own server, the container ran out of file watchers. A further `harita dev`
stopped at once with `ENOSPC: System limit for number of file watchers reached, watch '/home/user/repo'`. Each
server watches the whole repository. Several servers at once, with `.wikipedia/`, `.references/`, `.cache/` and
`node_modules/` under the root, use up the Linux inotify limit. `harita dev` could watch only the story's own
folders (`content/<story>/`, `i18n/`, `site.yaml`) and skip the dot folders, or a run could raise
`fs.inotify.max_user_watches` in its setup.

## 9. Gaps in the sources and the plans that later steps had to catch

- **The research digest marked disputed claims `agreed`.** Later agents found the sources disagree on nine of
  them: 020.7, 030.18, 050.23, 060.5, 060.9, 070.3, 070.6, 070.13 and 080.7. The fact-checker would have caught
  some of these, but each one had already shaped a plan or a text. The researcher's definition could ask for a
  search for a second account before a line is marked `agreed`, especially for dates, places and figures.
- **The digest's Coverage lines said "no source read gives X" when a read file did.** This happened for Darius's
  route to Issus (040), the sites of Aornos and Massaga (070), Engels's Gedrosian route (080) and Pelium (020).
  Coordinators found the passages and drew from them, but without a digest line, until a researcher batch
  added one.
- **A scholar's later correction was missed.** The digest and the plans called the Persian Gate the "Tang-i
  Khas" after Bosworth's Commentary (1980). His later *Conquest and Empire* (note 191) says that name was Stein's
  mistake and the gorge is the Tang-i Mohammad Reza. The battle-coordinator caught it, after the 050 text had used
  the old name. In the same way, *Conquest and Empire* prints Arrian's Persian cavalry at Gaugamela as 400,000,
  against 40,000 in Arrian and in Bosworth's own Commentary. The researcher could be asked to check, for each
  author used twice, whether the later work withdraws the earlier one.
- **The plans' routes were not checked against the sources until the map audit.** The 020 plan sent Alexander
  "west of Philippi" (Arrian has Philippi on his left) and "through the vale of Tempe" (Bosworth says he went
  round it). The 010 plan put Pydna inside Macedon in 358. The map-auditors found these after the cartographer had
  drawn them. A route line in a plan could be required to cite the passage that gives its stations, so the
  editor or a checker can test it at step 7.
- **The names step runs before the plans, so it misses most minor names.** The names agent was sent back eight
  times as plans, battle plans and the editor found names it lacked, and "first named in" sections that were
  wrong. Running a second names pass after step 7 would gather them in one batch.
- **Battle ids had no fixed form.** The section plans gave some ids with the year (`chaeronea-338`) and some
  without (`granicus`, `miletus`), where harita's README asks for the year. The cartographer followed the plans,
  and the ids were changed after the pages existed. The section-coordinator's definition should give the form.
- **Image captions add facts the Commons page does not give.** The 010 and 020 image-finders gave dates and
  claims from general knowledge (that the Lion of Chaeronea stands over the Theban dead, "4th century BC" for
  objects whose pages give no date, and an artist named from a signature). These go to the fact-checker at step 12.
  `agents/images.md` could require each caption fact to come from the file page or a digest line.
- **Texts run long.** Nearly every page text came in over 300 words (310–420), most because a disputed claim is
  told with each author named, as `agents/evidence.md` asks. The reviewers trim them at step 12. If 300 is the
  limit, `agents/text.md` could say how a disputed claim is told briefly.

## 10. Disputed claims go into notes, at the user's request

The user ruled during the run that disputed claims leave the body of a text and go into notes at its end, marked
`*`, `**`, `***`, like the sources. kitap renders text with `marked` and appends the Sources list as an `h3`
heading, so a `### Notes` heading at the end of `text/en.md` renders just above Sources with no change to the
renderer. The markers must be escaped (`\*`) or Markdown makes them italics. `harita check` and `--places`
pass. The full rule is in `content/alexander-the-great/.plan/decisions.md` ("Text format"). If it is kept for
other stories, it belongs in `agents/text.md` item 7, which now lets a text run to 350 words to name both sides
of a disputed figure. A kitap feature for notes (a `notes:` field or footnote syntax) would let the "Notes" label
come from the UI catalogue, as "Sources" does, instead of being written into each text.

## 11. Agent design: where the flow loses time

Most shortcomings come from who owns which files and the order of steps, more than from missing agents. Adding
agents also adds relaying, which is already much of the overseer's work.

- **Split the cartographer.** One cartographer draws every section so that each zone exists once, and with
  audit fixes each section took it 1.5 to 2.5 hours. Every audit, battle and image step waits on it. The
  constraint matters only for the shared files: `shared/zones/`, `zones.yaml` and `shared/markers.yaml`.
  Proposal: a **zone keeper** owns the zones and the stage entries and drafts them all up front from the "Map"
  part, and **page cartographers**, one per section, write page files, routes and markers in parallel. Markers
  could live in each page's own `markers.yaml`, as phase pages already do, so no shared file is contended. This
  is the one place where more agents would help.
- **The battle-coordinator should write the card.** It already has every figure the card needs. Cards blocked
  the build three times because the implementor writes them after the pages exist (item 1). With cards written
  at step 9, the implementor does only phase pages.
- **Check each plan's map claims before drawing.** The map audits kept finding plan lines that contradict the
  sources, and each one cost a draw, an audit and a redraw (item 9). A fact-checker pass on each plan's routes and
  zone edges at step 7 would catch them first. This is the existing fact-checker pointed at plans, not a new agent.
- **Keep story rules in one file.** The card rule, the zone and marker rules A–C, the notes format and the
  battle-id form lived in `decisions.md` and in the overseer's dispatches. Each new agent rediscovered them,
  and auditors raised the same faults section after section. A short `rules.md` in the plan folder, read by
  every agent, would carry them. The lasting ones belong in `agents/pages.md` and `agents/text.md`.
- **Plan the gap batches.** The researcher was resumed about eight times and the names agent more than ten.
  A planned batch after step 6 and again after step 9 would replace the trickle.
- **Fix the tools rather than add an infra agent.** The two-hour server limit, file watchers, the Linux
  screenshot path, stale headless frames and orphaned Chrome processes (items 2, 6 and 8) need fixes in the
  tools. An agent would only work around them.
- **Commit the generators.** The cartographer's zone, page and route scripts were in the session scratchpad,
  which is not committed and is lost when the session ends. The overseer copied them into
  `content/alexander-the-great/.plans/` (`zones.cjs`, `router.cjs`, `pages010.cjs` to `pages050.cjs`). Most
  other stories keep a generator, `.plans/zones.mjs` with a `zones.yaml` listing which page shows which zone:
  Punic Wars, Napoleonic Wars, American Revolution, Hussite Wars, Maya, the Viking Age and the four Ottoman
  stories. Two do not: Atatürk (14 zones) and the Black Death (36 zones). Neither do the 40 shared zones in
  `content/shared/zones/`. Their `.geojson` files are still the source the build reads, and they can be edited by
  hand or with `harita zones --share/--apart`, so nothing is lost. But no script can redraw them from their
  reasoning (which river, which treaty line), so a change of method or a bulk correction means editing each
  outline by hand. `agents/pages.md` should require a committed generator, so a story's zones and routes can be
  rebuilt from files in the repo.
- **No report owner for the brief.** `agents/report.md` has no owner value for the brief or the overseer, so
  agents filed brief faults under `section-coordinator` or `map-architect`.

## 12. Cost: making the flow cheaper in tokens and time

Beyond parallel cartographers (item 11), most savings come from avoiding rework and from moving mechanical checks
out of agents into scripts. The four with the most gain for the least change are a rules linter, shorter reports,
fixing formats early, and writing texts after the maps (points 1, 5, 7 and 8).

**Checks that scripts could do instead of agents**
1. **A rules linter.** Many audit faults were mechanical, and each cost an agent run plus a round trip through
   the overseer: a zone name that ends before its page's date, a marker under a card, one marker id with two
   notes, a battle id without its year, disputed figures in a text's body instead of its notes, word counts,
   passage numbers on "Rests on" lines. A `harita check`-style lint would catch these for free. Auditors would
   then judge only what needs judgement.
2. **Shared audit scripts.** Each map-auditor wrote its own `points.cjs` (which zone holds each place, and how far
   from the edge) and its own `route-surface` loops, section after section. One committed script, fed the plan's
   list of places, would replace them.
3. **Fewer screenshots.** Images are expensive in context, and auditors took dozens per section, many of them
   retakes caused by stale headless frames or captures taken mid-rebuild (items 6 and 8). Run the geometric checks
   first and take captures only for layout. Fixing the headless issues would remove most retakes.

**Less to read**
4. **Section slices of the big files.** Every agent reads the whole digest (over 560 quotes), the whole of
   `names.md` and a growing `decisions.md`, though it needs one section. A script could write `research-050.md`
   and `names-050.md` slices. `decisions.md` could split into a short `rules.md` of current rules and the history
   log, which only the overseer and the reviewer need.
5. **Shorter reports.** Reports often run to a hundred lines or more of prose after the YAML block. The overseer
   needs the block and a few lines. The detail could go to a file in the agent's scratchpad. This matters most for
   the overseer, which carries every report for the whole run.
6. **Fresh agents with handoff notes.** The long-lived agents (the researcher at about 650k tokens, the
   cartographer, the battle-implementor at about 500k) reprocess their whole history on every resume. Past a
   point, a fresh agent with a one-page handoff note is cheaper than another resume.

**Doing things once**
7. **Settle formats before writing.** The notes format for disputed claims (item 10) came after all 56 texts were
   written, so every text gets reworked at step 12. A short style decision at step 4 or 7 avoids that.
8. **Write texts after the page files exist.** The writers ran before the maps, could not check their links, and
   the texts were edited later for renamed or removed markers. Writing each section's texts after its maps, still
   in parallel across sections, avoids that churn.
9. **Let auditors fix trivial things.** A one-word figure, a marker icon or a date line now goes from auditor to
   overseer to owner and back. If auditors could fix mechanical taste-level faults themselves and report what
   they changed, many round trips would go.
10. **Smaller models for mechanical agents.** Name lookups, image searches, card figure checks and plan-sync edits
    do not need the strongest model. The agent definitions can set a model per agent, keeping the strongest for
    research, writing and map design.

**Orchestration**
11. **A workflow script for the fixed pipeline.** Draw a section, audit it, fix it, write its battles, audit them,
    find its images: the sequence is fixed. As a script it would pipeline on its own, and the overseer would handle
    rulings rather than relay every message.

## 13. An ambiguous fix instruction erased a card's sourced figures

**What happened.** After the 040 fact-check, the overseer queued a fix for the Issus card in this form:

> issus-333: Macedon strength "Diodorus: about 32,000 foot and 4,500 horse, though his totals and his list of
> contingents do not quite agree"; Persian strength "Diodorus: more than 400,000 foot and at least 100,000 horse";
> casualties "Ptolemy, son of Seleucus, and about 120 other Macedonians of note".

Each quoted phrase was meant to replace one clause inside a field that held several authors' figures. The fresh
battle-implementor read each as the whole new value of the field and wrote it in. The card lost every other
author's count: Callisthenes's strength at Issus (40,000 foot and 4,500 horse, plus 5,000 and 800 before
Cilicia), Arrian's, Plutarch's, Callisthenes's and Curtius's Persian figures, and Diodorus's and Curtius's
Macedonian losses. It also showed Diodorus's count of the army that crossed in 334 as the Macedonian strength
at Issus, which the plan rules out. `harita check` passed, since the card was still valid YAML.

**How it was caught.** The battle-auditor rechecked the queued fixes and compared the card against the plan and
the previous commit (`git show aacd98d8^:…/issus-333/battle.yaml`). The overseer restored the previous card and
made only the three intended clause edits.

**Why it matters.** A fix that drops sourced material looks like a success: the check passes and the fixer
reports "done as ruled". Only a diff against the previous version shows the loss. A fresh agent, without the
history of why the field held several authors, is the most likely to read an instruction this way.

**Proposed change.**
- A fix instruction for a field says whether it replaces the whole value or one clause in it, and for a clause
  edit it quotes the old text being replaced: "in `strength`, replace `and Diodorus's, 32,000 foot and 4,500
  horse` with `…`".
- A fixer reports the diff of each changed field, not only "done", and keeps every author's figure unless told
  to remove it.
- Auditors recheck fixes against the previous commit, as this auditor did, and not only against the instruction.
- A check could flag a battle card whose `strength` or `casualties` fields lose an author named in the plan's
  card section.

## 14. Order of the steps in this run

To keep the unattended run moving, the overseer ran some steps alongside others instead of in strict order. The
outcome may be worth writing into `agents/cloud.md`:
- Step 9 (battle plans) ran beside step 8. Battle-coordinators write only `.plan/battles/`, so nothing clashed.
- Step 10 (battles) ran one section behind the maps, not after all of them. Each card has to exist before its
  page builds (item 1).
- Step 11 (images) began for each section as soon as its texts and cards existed.
- The map-auditor for a section ran while the cartographer drew the next section, and the fixes went back to
  the cartographer together with the section after.

## 15. Smaller notes

- **The session started with a dirty `package-lock.json`.** The setup's install left 48 lines changed. The
  overseer restored it before branching, so it is not in the pull request.

- **Section plans cite read files with no digest line.** Every coordinator did this at step 6. One researcher
  batch of 60 new lines fixed it. A step between 6 and 7 for that batch would make the plans clean the first time.
- **The source files are not in git, but the work depends on them.** `.references/` and `.wikipedia/` are
  ignored. The digest is checked against them, so a reviewer must run `harita sources alexander-the-great` before
  `quotes-check` will pass.

## 16. `names.md` fell behind the texts, and no step checks it

**What happened.** The editor's pass over all texts (step 13) found seven names that the texts use but `names.md`
lacks: Memnon, Alexander's governor in Thrace (beside Memnon of Rhodes); a fourth Nicanor, the satrap west of the
Indus; Tiridates; Oxathres; Eurydice; Pydna; Bagistane. Three "First named in" entries also pointed at the wrong
section: Philotas, Meleager and Aristobulus. The overseer fixed them by hand.

**Why no earlier step caught it.**
- `names.md` is written once, at step 3, from the digest, before any text exists. The names agent owns it and is
  never run again after that.
- Writers and reviewers follow the rule "names follow `names.md`". That checks the form of a listed name. A name
  that is not listed passes, since no rule says it must be added, and they do not own the file.
- Fact-checkers check a name against the sources ("is this the right Memnon?"), not against the list.
- `harita check` and `quotes-check` do not read `names.md`.
- The "First named in" entries drifted during review: reviewers cut sentences to keep bodies under 300 words and
  moved disputes into notes, so some first mentions moved to other pages. Nothing checks them after those edits.
- In lean mode, the 070 reviewer flagged the missing Nicanor as a taste fault, which was logged and not fixed.
  The editor was the first step to read the names across the whole story.

**Proposed change.** A small `names-check` script, run beside `harita check` after each section's texts and again
at step 14. It would:
- list capitalised names in the texts, outside quotations and notes' author names, that have no row in `names.md`
- compare the first page that names each person or place with its "First named in" entry
- flag a name that `names.md` shows for two or more people (Memnon, Nicanor, Philotas) when a text uses it without
  the description `names.md` requires

It is a few dozen lines and costs no tokens. It would have caught all ten faults at section time. The other
option is to let the section-reviewer add rows to `names.md`, but a script does not forget.

## 17. More optimisation seen in the last part of the run

These come from the lean-mode stretch (sections 070–090, steps 12–14), in addition to items 11 and 12.

**What lean mode showed**
- **Reviews got much cheaper once the fault list was exact.** With the fact-checker writing each fix as a clause
  edit with its source line, the 070, 080 and 090 reviewers took about 85,000–127,000 tokens each and applied
  every point as given (080: 24 of 24). Earlier reviews that had to rediscover faults cost far more.
- **The overseer's one-line fixes saved whole agent runs.** A marker note, a card date, a caption word, a brief
  row or a digest line took the overseer one command. Sent to the owner, each would have been a resume.
- **A card without phase pages does not need its own battle audit.** The 090 fact-checker checked the three
  cards line by line in the same pass and found the one real fault, the Crannon date.

**Merge or reorder agents**
1. **Let the fact-checker apply its own clause edits.** The fact-checker is the largest cost per section after
   the cartographer (about 240,000–260,000 tokens), and the reviewer then reads the same sources again to apply
   a list it accepts in full. Giving the fact-checker edit rights for wrong and weak clause edits, and keeping
   the reviewer for readability, Notes moves and length, would drop one full read of each section's sources.
2. **Find images before the texts are reviewed, or keep image placements out of the text files.** The
   image-finder and the reviewer both edit `text/en.md`, so each section's review waited for its image search
   (070 waited about 25 minutes). If `@image` placements lived in `page.yaml`, or images were found right after
   the maps, the two could run at the same time.
3. **Keep marker ids stable once texts exist.** The rule-B fix renamed seven 080 marker ids, so the cartographer
   edited six texts while a reviewer was editing them too. A page-local alias, or settling ids before the
   writers start, would avoid two agents editing the same file.

**Settle the limits before writing**
4. **The 300-word limit came after the texts.** Writers wrote bodies of 310–355 words, and the reviewers then
   cut content to fit. In 090 that dropped the battle strengths, including Plutarch's 400 elephants, which the
   plan asked for. A word counter in the writer's checks, and the limit in the plan template, would avoid both
   the cuts and a ruling.
5. **Plans go stale after review.** The 090 plan still told disputes "in the body" and dated an event wrongly
   after the review fixed the texts. Either treat plans as finished at step 7 and stop syncing them, or have the
   reviewer update its plan's entry in the same commit.

**Research depth**
6. **The last section was researched most thinly.** The 090 fact-check and map audit found claims the digest
   lacked or had wrong: Bosworth's own date for the invasion of Egypt (321, not 320), the three dates of Crannon,
   Ptolemy's annexation of Cyrenaica, Tyre and Sidon after Ipsus, Diodorus's full list of the Greek allies. The
   researcher's budget seems to run down by the last section. A coverage check per section at step 2, with the
   same minimum of scholarly sources for each, would show it early.

**Mechanical checks still done by agents**
7. **The card-frame check.** On the 090 card pages the camera opened far to the east, beside the docked card,
   and most of the map was off-screen. `cartography-notes.md` already lists this trap, and it still recurred. A
   lint that checks the bbox against the docked card's width would catch it without a capture.
8. **A pre-commit guard for parallel agents.** With up to five agents committing to one branch, every commit
   must name its own paths. The overseer nearly committed another agent's work with `git commit -a`. A hook that
   rejects a commit touching files another running agent has open, or simply a rule of explicit paths for
   everyone, would remove the risk.

**Tools**
9. **Build one story at a time.** `npm run build -- --strict` builds every story on the site and took more than
   ten minutes. Most of its output is other stories' zone areas, such as `hungary-1390`. A `--story` filter for
   the strict build would make the step 14 check take a minute and keep its log readable.

## 18. The strict build cannot pass in a cloud run for a new story

`npm run build -- --strict` fails on a new story with one error: "the store holds no upload of this story,
https://assets.openhistorybook.org/meta/alexander-the-great/latest.json answered HTTP 404, kitap upload --story
alexander-the-great puts its objects there". The upload needs store credentials and publishes outside the repo, so a
cloud run cannot and should not do it. Step 14 asks for a passing strict build, which a new story can only have
after the maintainer unpacks `images-pack/` and uploads. `agents/overseer.md` or `agents/cloud.md` should say that
for a new story the strict build passes in the cloud apart from this one error, and that the upload is the
maintainer's step before merge. A `--no-store` flag, or a check that reports the missing upload as a warning when
`images-pack/` holds the story's originals, would let the cloud run see a clean result.

The build also writes every story on the site and takes about fifteen minutes (item 17, point 9). A first run
wrapped in a 15-minute `timeout` was cut off, and the overseer at first misread the wrapper's exit status as the
build's.

## 19. The run should open its own pull request

`agents/cloud.md` and this run's prompt both told the overseer to stop after step 14 and wait for the user's
confirmation before opening the pull request. In an unattended run that wait only adds a round trip: the branch is
pushed, the report is written, and the pull request is the place where the user reviews it anyway. The user
asked for the pull request to be opened as soon as the run finishes. `agents/cloud.md` ("The pull request") and the
cloud prompt should say: when the story passes step 14, pack the images, push, and open the pull request with the
rulings, what was left out and the unpack command; then report its link.

## 20. Image originals: getting them to the store without bloating history

**What happened.** The run packed the 163 originals into `images-pack/pack-1.tar.gz` (64 MB) and committed it, as
`agents/cloud.md` says. The user asked whether the images could reach the store without being committed. Three
ways out of the cloud session were tried or ruled out:
- **Upload to the asset store.** `harita upload --story alexander-the-great --dry-run` works, since it reads the store
  publicly, and listed 163 images and 654 elevation tiles to send. The real upload failed: the session's
  `AWS_ACCESS_KEY_ID` is a 14-character placeholder ("Credential access key has length 14, should be 32"). R2
  requests are signed with the secret key on the client, so the proxy's header injection (`request_credential`)
  cannot stand in for it. Putting the key in the environment's variables would store it in plain text.
- **A release asset.** Releases are the usual home for large binaries outside git history. The API answered "Creating,
  editing, or deleting releases is not permitted for this session type."
- **A PR comment attachment.** GitHub uploads these only from the browser. There is no API.

**What works now.** Commit the pack on the branch, and keep it out of `main`:
1. The maintainer pulls the branch, runs `node scripts/images-pack.mjs unpack` and `harita upload --story <id>`,
   checks `npm run build -- --strict`, then runs `git rm -r images-pack` as one more commit.
2. The PR is merged with **Squash and merge**. "Rebase and merge" and a merge commit both copy the pack's commit
   into `main`'s history.
3. The branch is deleted. No ref then points at the blob, and new clones do not download it.

`agents/cloud.md` says the pack is removed before the merge, but not that the merge must be a squash. It should, and
the PR text a cloud run writes should repeat it.

**Better, later.** Any of these would keep the pack out of git entirely:
- A workflow that holds the R2 token as a secret, and on a PR unpacks and uploads the images, then removes the pack.
  No one would handle images by hand, and cloud runs would never need the key.
- A maintainer, or a workflow run, attaching the pack to a draft release. A cloud session cannot do this.
- Git LFS for `images-pack/`. Only worth it if many stories come this way, since it changes the whole repository
  and counts against LFS quotas.
