# Open History Book

Stories for step-through history maps, published at https://openhistorybook.org. A free educational
project. The maps are built with [harita](https://github.com/openbooknetwork/harita), whose README
documents the content formats. Each folder under `content/` is one story and builds to its own page.

## Work on it

```
npm install                 # installs @openbooknetwork/harita from npm, and kitap with it
npm run dev                 # watch, rebuild, serve at http://localhost:8080/
npm run build -- --strict   # the build the release runs: fails on a missing translation or a missing object in the store
```

## Release

The site goes live from a release tag. GitHub Actions builds `dist/`, uploads it to the site bucket on
Cloudflare R2 with `harita deploy` and deploys the Worker in `worker/` that serves it at the custom domain.
There is no deploy from `main` and nothing to click. Images and elevation tiles come from a second bucket,
the asset store at https://assets.openhistorybook.org/, which a maintainer fills with `harita upload` before
the release. Both are set up as harita's README describes under Asset store and Deploy.

```
npm version minor && git push --follow-tags
```

## Layout

- `site.yaml` names the main page and orders the stories on it.
- `content/<story>/` holds one story: pages, texts per language, zones, routes, markers, and a folder per battle
  and per image under `shared/battles/` and `shared/images/`. `content/shared/images/` holds the images several
  stories show.
  Stories: `ataturk-turkish-republic` and `american-revolutionary-war`.
- `content/<story>/i18n/<lang>.yaml` and `i18n/<lang>.yaml` hold the translations; English is inline.
  Refresh a language with `./node_modules/.bin/harita i18n <lang>`.
- `plugins/emblems/` holds story specific map drawings, such as the crescent and star on the 1923 pages.
  Harita loads them by the `kind` named in a page's `emblem` field.
- `scripts/` holds the photo search helper below.
- `dist/` is build output, `.cache/kitap/` holds the elevation tiles `harita upload` cuts, and
  `content/<story>/.candidates/` is photo review material. All three are ignored.

## Photographs

`scripts/fetch-candidates.mjs` searches Wikimedia Commons with the terms in a queries file and downloads
candidate photos with their author and licence into `content/<story>/.candidates/<page>/`, plus an `index.yaml`
describing each file. A candidate the book already holds is not downloaded again, and `index.yaml` lists it with
`held: <image id>`. Review the candidates, and add each chosen one by its `url` from `index.yaml` with
`./node_modules/.bin/harita image <url> <name> --caption <text> --credit <text> --source <page from index.yaml>
--story <story>`, with a credit that names the author, the licence and the Commons file. The command downloads the
original into the image folder, which git ignores, and prints the id that a text shows with `@image <id>`.

The queries file holds one entry per page id under the story id. An entry is a list of Commons search terms, or
a map with the terms under `queries:`, Wikipedia articles under `articles:` and exact Commons file names under
`files:`. Every Commons image an article uses joins the candidates. An article is an English Wikipedia title or
a Wikipedia URL in any language.

```yaml
maya-civilization:
  maya-area: ["Petén rainforest aerial", "Usumacinta River", "Yucatán cenote"]
  first-villages:
    queries: ["Aguada Fénix lidar", "Ceibal E Group"]
    articles: ["Aguada Fénix", "Seibal", "Olmecs"]
```

Keep the file in `.cache/`, which git ignores, and pass it with `--queries`. `--out <name>` writes into
`.candidates/<name>/` so that two fetches at once keep separate index files.

```
node scripts/fetch-candidates.mjs maya-civilization --queries .cache/image-queries.yaml --limit 6
```
