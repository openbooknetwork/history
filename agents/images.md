# Images

For whoever finds, adds or changes the images of a story.

## Image folders

Every photo lives in an image folder, `content/<story>/shared/images/<name>-<six hex digits>/`, or in
`content/shared/images/` once two stories show it. Git holds the folder's `image.yaml` and catalogues, and the asset
store at `assets.openhistorybook.org` holds the original and its sizes. Add a chosen candidate by its `url` from
`index.yaml` with `./node_modules/.bin/harita image <url> <name> --caption <text> --credit <text> --source <its Commons
page> --story <story>`, which downloads the original into the folder and prints the id to use: `@image <id>` in a text,
`image: <id>` on a marker, the card's `images` list or the story's `cover`. The command uses again an image the book
holds by the same Commons page or the same bytes, and moves one from another story to `content/shared/images/`. After an
image file changes, `./node_modules/.bin/harita rehash` writes its new sha256.

Look for two images for a battle card. When no picture of the battle exists, look for one for each side: its
commander, its army or its arms. Look first for images made at the time, such as a portrait, a coin, a relief or a
manuscript. A later painting serves when nothing from the time shows that side, and its caption says when it was
painted. An image the story already holds can serve, when its page is not the card's page. A card keeps one image when
Commons has nothing more that fits.

Images on nearby pages differ in kind: two portraits from one manuscript or one series go in different chapters.
`node scripts/contact-sheet.mjs <story>` draws every image the story shows in page order to
`.cache/<story>-images-<n>.png`. Open the sheets before an image agent finishes.

Before a story is released, a maintainer runs `./node_modules/.bin/harita upload --story <story>`, which puts
its new images and elevation tiles in the store. `npm run build -- --strict` then checks that the store holds
every object the story links to. `harita dev` shows new images before any upload.
