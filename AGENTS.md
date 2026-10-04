# Agents

Working notes for coding agents in this repository. `README.md` covers the project for people.

## Battle plans

Every battle in the stories is drawn as phase pages by the `battle-plan` emblem
(`plugins/emblems/battle-plan.mjs`), laid out by one generator per battle in `content/<story>/.plans/`. Read
`content/punic-wars/.plans/README.md` before drawing a battle or changing one, and rerun the battle's generator
after every edit to it.

## Checking a story

1. `node scripts/check-story.mjs <story> [page ids]` checks pages, markers, battles, routes and battle plans.
2. `scripts/story-root.sh <story> <port>` builds that story alone in `.cache/<story>-root` and serves it on the
   port. Rerun it to rebuild.
3. `node scripts/screenshot.mjs http://localhost:<port>/<story>/ <out dir> <page ids>` captures pages in
   headless Chrome. `SHOT_HOVER=<lon>,<lat>` shows a battle unit's hover label, `SHOT_SCHEME=light` the light
   theme. Open the capture of every page you changed.

A story is done when the check prints ok and `npm run build -- --strict` builds every story.

## Translations

`npx harita i18n tr --story <story>` adds an empty key for every new English string to the story's
`i18n/tr.yaml`, with the English as a comment above it. Fill each one. The command builds every story it can
see, so while another story is half edited, run it inside `.cache/<story>-root`.

## Agents working in parallel

Give each agent its own page folders. A story's shared files, `i18n/<lang>.yaml` and `shared/battles.yaml`,
take one writer at a time, because two agents saving the same file lose one agent's lines. So each agent writes
its share beside them:

- translations to `content/<story>/.i18n-parts/<agent>.<lang>.yaml`, flat keys such as `pages.<id>.title`
- battle card changes to `content/<story>/.plans/battle-updates/<battle id>.yaml`, the changed fields only

Once every agent is done, `node scripts/merge-parts.mjs <story> i18n` and `node scripts/merge-parts.mjs <story>
battles` merge these files and delete them. `npx harita i18n tr --story <story>` then lays the catalogue out
again.
