# Open History Atlas

Stories for step-through history maps, built with [harita](https://github.com/openhistoryatlas/harita). The framework README documents
the content formats. Each folder under content/ is one story and builds to its own page. The site is published at
https://openhistoryatlas.org from the main branch by GitHub Actions.

```
npm install            # installs @openhistoryatlas/harita from npm
npm run dev            # watch, rebuild, serve at http://localhost:8080/
npm run build          # one build into dist/
open dist/index.html
```

- `site.yaml` names the main page and orders the stories on it.
- `content/<story>/` holds one story: pages, texts per language, zones, routes, markers, images.
  Current stories: `ataturk-turkish-republic`, `usa`.
- `geo/` holds one hillshade raster per map region and its bounding box: `hillshade.png` for Türkiye,
  `hillshade-us.png` for eastern North America. `harita hillshade --bbox w,s,e,n` makes a new one.
- `dist/` is build output.

## Photographs

`scripts/fetch-candidates.mjs` searches Wikimedia Commons with the terms in `scripts/image-queries.yaml`,
one entry per page id, and downloads candidate photos with their author and licence into
`content/<story>/.candidates/<page>/`, plus an `index.yaml` describing each file. Review the candidates,
move the chosen files into the page's `images/` folder, and add them to `page.yaml` with a caption and a
credit that names the author, the licence and the Commons page.

```
node scripts/fetch-candidates.mjs ataturk-turkish-republic --limit 6
```

The `.candidates/` folder is ignored by git.
