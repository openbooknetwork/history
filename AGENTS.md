# Agents

Working notes for coding agents in this repository. `README.md` covers the project for people.

## Story size

The length follows the subject, and every page earns its place. Count the pages in an outline before any page is
written:

1. List the events. A page earns its place when the map changes on it: a border moves, an army or a fleet
   travels, a battle is fought, a new region enters the story. Events in one region within a few years share a
   page.
2. Give each battle a card on the page of its campaign. Phase pages go only to battles whose sources give
   positions and movements, two or three phases each, and only to the battles that decided the war.
3. Group the pages into chapters of three to eight pages.
4. Weigh the count against the stories already built: Atatürk 54 pages, Maya 70, American Revolution 86, Punic
   Wars 117, Napoleonic Wars 150. About 70 to 80 is the usual size. A story runs longer when the subject has
   that many map changes and documented battles, as 23 years of war across Europe did. Above that, merge
   neighbouring pages first, then cut phase pages.

A story about a people or a civilization, such as the Maya or the Vikings, has a chapter of about five to eight
pages on how they lived: society, law and rule, religion and burial, trade, writing, warfare. Each page shows its
subject on the map as places, routes or finds: temples, assemblies, hoards, inscriptions. Place the chapter after
the reader has seen the extent of their world and before the events that change it, such as a conversion or a
conquest. A story about one war or campaign, such as the Punic Wars, has no such chapter. A war against a people
the reader knows little about, such as the Aztecs, gives their world a page or two of context.

The outline is done when it lists every page with its id, title, one line of content and its battle card, and the
user has agreed the count. Keep it in `.cache/<story>-outline.md`. Agents build exactly the pages in their part of
it.

## Battle plans

Every battle in the stories is drawn as phase pages by the `battle-plan` emblem that harita ships, laid out by
one generator per battle in `content/<story>/.plans/`. Read
`content/punic-wars/.plans/README.md` before drawing a battle or changing one, and rerun the battle's generator
after every edit to it.

## Page ids

A page's id is its folder name without the number, and it is part of the page's URL, `/<story>/<lang>/<id>/`. A
released page keeps its id, so links and search results to it keep working. Renumber the folder to move it.

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

## Translations

`./node_modules/.bin/harita i18n tr --story <story>` adds an empty key for every new English string to the story's
`i18n/tr.yaml`, with the English as a comment above it. Fill each one. With `--story` the command builds only that
story. A battle's strings sit in its folder's `i18n/tr.yaml`, and an image folder's caption in that folder's
`i18n/tr.yaml`. The same command writes those catalogues.

## Battles and images

A battle's card is its own folder, `content/<story>/shared/battles/<battle id>/battle.yaml`, and the story's pages
show it with `battle: <battle id>`. Every photo lives in an image folder, `content/<story>/shared/images/<name>-<six
hex digits>/`, or in `content/shared/images/` once two stories show it. Add a chosen candidate with
`./node_modules/.bin/harita image <file> <name> --caption <text> --credit <text> --source <its Commons page> --story
<story>`, which prints the id to use: `@image <id>` in a text, `image: <id>` on a marker, the card's `images` list or
the story's `cover`. The command uses again an image the atlas holds by the same Commons page or the same bytes,
and moves one from another story to `content/shared/images/`. After an image file changes,
`./node_modules/.bin/harita rehash` writes its new sha256, which `npm run build -- --strict` checks.

## Shared zones

A state's lands in a year that several stories show, such as the Ottoman lands of 1402 in the stories of Bayezid I
and of Timur, are one zone in `content/shared/zones/<id>/`. Before drawing such a zone, run
`./node_modules/.bin/harita zones --like <file>`: it lists the zones of every story that cover the same land, and
`.cache/harita/zones.html` shows them. `./node_modules/.bin/harita zones --share <story>/<zone id> --replace
<story>/<zone id>` makes one shared zone of two: the replaced zone keeps its id, name and family in a `zones.yaml`
beside it and takes the shared outline, so its pages stay as they are. A story that shows an outline under its own
name or family, the same land in another year or held by another state, writes a `zones.yaml` entry too, such as
`sicily-1806: { zone: sicily-1799, name: ... }`, in place of a copy of the coordinates. Two zones that cover the same
land and stay apart go into `content/shared/zones/apart.yaml` with `./node_modules/.bin/harita zones --apart <zone>
<zone> --why <text>`. Battle, image and zone folders can sit in group folders that only order them.

## Agents working in parallel

Give each agent its own page folders and the battle folders of its pages. A story's `i18n/<lang>.yaml` takes one
writer at a time, because two agents saving the same file lose one agent's lines. So each agent writes its
translations beside it, to `content/<story>/.i18n-parts/<agent>.<lang>.yaml`, with flat keys such as
`pages.<id>.title`. A battle's strings go straight into the battle folder's `i18n/tr.yaml`.

Once every agent is done, `node scripts/merge-parts.mjs <story> i18n` merges these files and deletes them.
`./node_modules/.bin/harita i18n tr --story <story>` then lays the catalogue out again.
