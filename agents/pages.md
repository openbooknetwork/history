# Building pages

For whoever builds or changes pages: their maps, battles and zones. `agents/text.md` covers their English texts.

## Page ids

A page's id is its folder name without the number, and it is part of the page's URL, `/<story>/<lang>/<id>/`. A
released page keeps its id, so links and search results to it keep working. Renumber the folder to move it.

A story can sit in a group folder, such as the Ottoman series in `content/ottoman/<story>/`. Paths written here as
`content/<story>/` then run through the group. Commands and scripts name the story by its folder name alone.

## Battle cards

A battle's card is its own folder, `content/<story>/shared/battles/<battle id>/battle.yaml`, and the story's pages
show it with `battle: <battle id>`.

A card stands on its battle's site: a siege on its town, a field battle on its field. The card's `lnglat` says
where the battle was fought, so it never moves for layout. A town marker under a card stays on the page: the
card's crossed swords lead, the town's marker waits under them, and it comes forward when the reader points at
the town's name in the text. So the text links the town.

## Battle plans

Every battle in the stories is drawn as phase pages by the `battle-plan` emblem that harita ships, laid out by
one generator per battle in `content/<story>/.plans/`. Read
`content/punic-wars/.plans/README.md` before drawing a battle or changing one, and rerun the battle's generator
after every edit to it.

## Generators

The scripts that draw a story's zones, routes and battle phases are committed in `content/<story>/.plans/`, so
the maps can be rebuilt from the repo. A script kept only in a scratchpad is lost with it. Nobody edits those
shapes by hand: change the script and run it again. The script records why a border runs where it does.

A script that writes page files is not required. Where a cartographer keeps one, its first line says so, each
page file it writes opens with a comment that names the script, and a page is then changed in the script and written again, never by hand: a rerun undoes every hand edit, such as a
`sources` list a reviewer filled or a marker an auditor had removed.

## Zone families

A family is one state, and its colour and pattern show who holds the land. A page shows each family in one zone,
since two states in one family read as one state divided. Give each state on a page a family of its own, the Serbian
lords after 1371 and the Anatolian beyliks too, or draw states whose borders the page does not need, such as the
states that ratified a treaty, as one zone. Two zones of one state on a page are one zone. A marker's `color` names
the family of the state that holds the place, and a route's `color` the family of the army, fleet or people that
travel it. A battle plan's routes name the battle's families. A page lists the routes of one family in the order
they were travelled: each gets its number, the last takes the full colour and the earlier ones shades of it. `./node_modules/.bin/harita check <story>` reports a family with two
zones on a page, and `./node_modules/.bin/harita patterns` lists the families that look alike on a page.

## Zones and markers from page to page

These hold for a story whose pages each list their zones.

- A zone's legend name carries no date, since the page's own date tells the reader the year. A dated name is kept
  only where the zone shows a border of another year than its page's.
- A page shows every zone its neighbours show for its frame, unless its text tells a change, so no land shows
  bare between two pages that show it held. A page has a frame for each screen, a laptop, a desktop and a phone,
  and a phone held upright shows far more to the north and south of a page's bbox than a capture does.
  `scripts/view.mjs` holds the three, as measured, and every check reads them there. A zone stays on a page
  where any of the three shows its land, though a capture shows only its row in the legend: that row is no
  fault, and taking the zone off leaves the land bare on a phone. A page has one list of zones and one legend,
  the same on every screen. `node scripts/plan-check.mjs` names the
  screen that shows the land.
- A zone is cut once for the whole story, by the zones that share any page with it, and not page by page. So a
  zone cut back in stages takes one `zones.yaml` entry per stage.
- Two icons that would stand on each other at a page's opening view show one at a time. The marker of the higher
  `rank` leads, with a count such as `+1` on its icon, and of equal rank the one the page lists first. The other
  waits under it and comes forward when the reader points at its name in the text, taps the count or zooms in.
  A page can so mark two places a few kilometres apart in a wide frame, and neither comes off for layout. A
  marker that waits is linked in the text, or a reader finds it only by the count: `scripts/rules-lint.mjs`
  reports one that is not. A plan gives the rank in `map.yaml`, and `markers.yaml` takes it as `rank`.
- A capture of the opening view shows the leading icon alone, which is no missing marker. Capture a marker that
  waits with `SHOT_POINT=<marker id>` before `node scripts/screenshot.mjs`.
- A marker's note tells the event of its own page. Markers live in one `shared/markers.yaml`, so one id has one
  note, and a page that needs a place another page marks for another event takes a marker id of its own.
- A page shows seven icons at most, its battle card counted as one, and `scripts/rules-lint.mjs` reports an
  eighth. A reader cannot follow more at once. Mark the places the page's event turns on, and leave a place the
  text only passes through as a name in the text, with no link and no marker. A page that needs more is two
  pages.
- A marker's label has 30 characters at most and its note 60, and `scripts/rules-lint.mjs` reports a longer one.
  The label is the name alone: "Saint-Jean-le-Blanc", and what kind of place it is goes into the note. The note
  tells one event in a few words, with its date: "Joan rides in by torchlight, evening of 29 April 1429". It
  names no source, gives no second account and says nothing of how sure the place is: the text tells the rest,
  and "Only the story" in `agents/text.md` holds for a note as for a text. A fact that matters and has no room
  in the note belongs in the page's text, and never makes the note longer.

## Shared zones

A state's lands in a year that several stories show, such as the Ottoman lands of 1402 in the stories of Bayezid I
and of Timur, are one zone in `content/shared/zones/<id>/`. Before drawing such a zone, run
`./node_modules/.bin/harita zones --like <file>`: it lists the zones of every story that cover the same land, and
`.cache/kitap/zones.html` shows them. `./node_modules/.bin/harita zones --share <story>/<zone id> --replace
<story>/<zone id>` makes one shared zone of two: the replaced zone keeps its id, name and family in a `zones.yaml`
beside it and takes the shared outline, so its pages stay as they are. A story that shows an outline under its own
name or family, the same land in another year or held by another state, writes a `zones.yaml` entry too, such as
`sicily-1806: { zone: sicily-1799, name: ... }`, in place of a copy of the coordinates. Two zones that cover the same
land and stay apart go into `content/shared/zones/apart.yaml` with `./node_modules/.bin/harita zones --apart <zone>
<zone> --why <text>`. Battle, image and zone folders can sit in group folders that only order them.

## Checking a story

A marker or a card can hold an image placeholder, which the check reports as unknown: "Image placeholders" in
`agents/report.md` says what it is and how to run the check past it.

1. `./node_modules/.bin/harita check <story> [page ids]` reads the pages, texts, images, markers, battles, routes and battle plans,
   and prints every problem it finds.
2. `./node_modules/.bin/harita dev --story <story> --out .cache/<story>-site --port <port>` builds that story alone into the folder,
   serves it on the port and rebuilds it on every save. A story that an overseer builds has one such server,
   which the overseer starts, and each agent captures from the port its dispatch names. An agent whose dispatch
   names no port starts a server with an `--out` and a port of its own, in the background, and stops it by its
   process id when it finishes. An agent that changes no file, and any agent whose dispatch says `serve: static`,
   builds once with `./node_modules/.bin/harita build --story <story> --out <dir>` into a folder of its own and
   serves it with `python3 -m http.server <port> --directory <dir>`, so no other agent's rebuild reaches its
   captures.
3. `node scripts/screenshot.mjs http://localhost:<port>/<story>/ <out dir> <page ids>` captures pages in
   headless Chrome. `SHOT_HOVER=<lon>,<lat>` shows a battle unit's hover label, `SHOT_TEXT=1` opens each page's Text view before
   its capture, `SHOT_SCHEME=light` the light
   theme, `SHOT_LANG=tr` the Turkish pages, and `SHOT_W=390 SHOT_H=780` a phone. Open the capture of every page
   you changed. `SHOT_WAIT=12000` gives a map that came out blank the time to draw. Give the captures a folder of your own, and take again a capture that caught a page while another
   agent's save was rebuilding it.

A story is done when the check prints ok and `./node_modules/.bin/harita build --strict --story <story>` builds
it. `npm run build -- --strict` builds every story of the book and takes far longer.

## Agents working in parallel

Give each agent its own page folders and the battle folders of its pages. A story's `i18n/<lang>.yaml` takes one
writer at a time, because two agents saving the same file lose one agent's lines. So each agent writes its
translations beside it, to `content/<story>/.i18n-parts/<agent>.<lang>.yaml`, with flat keys such as
`pages.<id>.title`. A battle's strings go straight into the battle folder's `i18n/tr.yaml`.

Once every agent is done, `node scripts/merge-parts.mjs <story> i18n` merges these files and deletes them.
`./node_modules/.bin/harita i18n tr --story <story>` then lays the catalogue out again.
