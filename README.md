# Open History Atlas

Stories for step-through history maps, published at https://openhistoryatlas.org. A free educational
project. The maps are built with [harita](https://github.com/openhistoryatlas/harita), whose README
documents the content formats. Each folder under `content/` is one story and builds to its own page.

## Work on it

```
npm install                 # installs @openhistoryatlas/harita from npm
npm run dev                 # watch, rebuild, serve at http://localhost:8080/
npm run build -- --strict   # the build the release runs: fails on a missing translation
```

## Release

The site goes live from a release tag. GitHub Actions builds `dist/` and publishes it to GitHub Pages at
the custom domain; there is no deploy from `main` and nothing to click.

```
npm version minor && git push --follow-tags
```

## Layout

- `site.yaml` names the main page and orders the stories on it.
- `content/<story>/` holds one story: pages, texts per language, zones, routes, markers, battles, images.
  Stories: `ataturk-turkish-republic` and `american-revolutionary-war`.
- `content/<story>/i18n/<lang>.yaml` and `i18n/<lang>.yaml` hold the translations; English is inline.
  Refresh a language with `npx harita i18n <lang>`.
- `plugins/emblems/` holds story specific map drawings, such as the crescent and star on the 1923 pages.
  Harita loads them by the `kind` named in a page's `emblem` field.
- `scripts/` holds the photo search helper below.
- `dist/` is build output, `.cache/harita/` holds the elevation tiles the build downloads, and
  `content/<story>/.candidates/` is photo review material. All three are ignored.

## Photographs

`scripts/fetch-candidates.mjs` searches Wikimedia Commons with the terms in `scripts/image-queries.yaml`,
one entry per page id, and downloads candidate photos with their author and licence into
`content/<story>/.candidates/<page>/`, plus an `index.yaml` describing each file. Review the candidates,
move the chosen files into the page's `images/` folder, and add them to `page.yaml` with a caption and a
credit that names the author, the licence and the Commons page.

A page entry can also list Wikipedia articles under `articles:`, and every Commons image those articles
use joins the candidates. `--queries <file>` reads the entries from another file, and `--out <name>` writes into
`.candidates/<name>/` so that two fetches at once keep separate index files.

```
node scripts/fetch-candidates.mjs ataturk-turkish-republic --limit 6
```
