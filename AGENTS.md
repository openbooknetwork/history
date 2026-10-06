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
story.

## Agents working in parallel

Give each agent its own page folders. A story's shared files, `i18n/<lang>.yaml` and `shared/battles.yaml`,
take one writer at a time, because two agents saving the same file lose one agent's lines. So each agent writes
its share beside them:

- translations to `content/<story>/.i18n-parts/<agent>.<lang>.yaml`, flat keys such as `pages.<id>.title`
- battle card changes to `content/<story>/.plans/battle-updates/<battle id>.yaml`, the changed fields only

Once every agent is done, `node scripts/merge-parts.mjs <story> i18n` and `node scripts/merge-parts.mjs <story>
battles` merge these files and delete them. `./node_modules/.bin/harita i18n tr --story <story>` then lays the catalogue out
again.
