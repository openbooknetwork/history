# Building pages

For whoever builds or changes pages: their maps, battles, zones and English texts.

## Page ids

A page's id is its folder name without the number, and it is part of the page's URL, `/<story>/<lang>/<id>/`. A
released page keeps its id, so links and search results to it keep working. Renumber the folder to move it.

A story can sit in a group folder, such as the Ottoman series in `content/ottoman/<story>/`. Paths written here as
`content/<story>/` then run through the group. Commands and scripts name the story by its folder name alone.

## Writing

The English and every translation follow `node_modules/@openbooknetwork/kitap/writing/README.md`, and a
translation also follows that folder's file for its language, such as `tr.md`.

The English tells history in the present tense: "In January 1348 the plague reaches Pisa." A quote and what a
historian later writes keep their own tense: "Benedictow puts the dead at 60 percent."

## Places in the text

A page's text links each place its markers show the first time it names it, in every language:
`[Gelibolu’ya](@gallipoli)`. The link text is the word as the text writes it, with its Turkish suffix, and the id is
one of the page's `markers`. On a battle plan page the commanders the text names link to their units' markers.
`./node_modules/.bin/harita check <story> --places` lists, per text file, the markers whose label the text names
without a link.

## Battle cards

A battle's card is its own folder, `content/<story>/shared/battles/<battle id>/battle.yaml`, and the story's pages
show it with `battle: <battle id>`.

## Battle plans

Every battle in the stories is drawn as phase pages by the `battle-plan` emblem that harita ships, laid out by
one generator per battle in `content/<story>/.plans/`. Read
`content/punic-wars/.plans/README.md` before drawing a battle or changing one, and rerun the battle's generator
after every edit to it.

## Zone families

A family is one state, and its colour and pattern show who holds the land. A page shows each family in one zone,
since two states in one family read as one state divided. Give each state on a page a family of its own, the Serbian
lords after 1371 and the Anatolian beyliks too, or draw states whose borders the page does not need, such as the
states that ratified a treaty, as one zone. Two zones of one state on a page are one zone. A marker's `color` names
the family of the state that holds the place, and a route's `color` the family of the army, fleet or people that
travel it. A battle plan's routes name the battle's families. A page lists the routes of one family in the order
they were travelled: each gets its number, the last takes the full colour and the earlier ones shades of it. `./node_modules/.bin/harita check <story>` reports a family with two
zones on a page, and `./node_modules/.bin/harita patterns` lists the families that look alike on a page.

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

1. `./node_modules/.bin/harita check <story> [page ids]` reads the pages, texts, images, markers, battles, routes and battle plans,
   and prints every problem it finds.
2. `./node_modules/.bin/harita dev --story <story> --out .cache/<story>-site --port <port>` builds that story alone into the folder,
   serves it on the port and rebuilds it on every save. Agents building at the same time each pass an `--out` of
   their own.
3. `node scripts/screenshot.mjs http://localhost:<port>/<story>/ <out dir> <page ids>` captures pages in
   headless Chrome. `SHOT_HOVER=<lon>,<lat>` shows a battle unit's hover label, `SHOT_SCHEME=light` the light
   theme, `SHOT_LANG=tr` the Turkish pages. Open the capture of every page you changed.

A story is done when the check prints ok and `npm run build -- --strict` builds every story.

## Agents working in parallel

Give each agent its own page folders and the battle folders of its pages. A story's `i18n/<lang>.yaml` takes one
writer at a time, because two agents saving the same file lose one agent's lines. So each agent writes its
translations beside it, to `content/<story>/.i18n-parts/<agent>.<lang>.yaml`, with flat keys such as
`pages.<id>.title`. A battle's strings go straight into the battle folder's `i18n/tr.yaml`.

Once every agent is done, `node scripts/merge-parts.mjs <story> i18n` merges these files and deletes them.
`./node_modules/.bin/harita i18n tr --story <story>` then lays the catalogue out again.
