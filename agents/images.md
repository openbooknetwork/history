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

A text, a marker and a card first hold a placeholder, the name its plan gives an image, such as
`@image hydaspes-coin`. The image finder lists which image each placeholder took in
`content/<story>/.plan/images/<section number>.yaml`, and `node scripts/images-place.mjs <story>` writes the ids
in their place once every section is reviewed. A placeholder with no image goes with its line.

Choose an image whose licence in `index.yaml` is public domain, CC0, CC BY or CC BY-SA, the licences that allow
the book to show it with a credit.

Each fact of a caption is on the image's Commons file page or in a line of the digest: what the image shows, who
made it and when. A fact that stands in neither stays out of the caption. The image finder's candidates file,
`content/<story>/.candidates/<section id>/index.yaml`, keeps what each Commons page gives, and the section's
fact checker holds each caption against it.

Look for two images for a battle card. When no picture of the battle exists, look for one for each side: its
commander, its army or its arms. Look first for images made at the time, such as a portrait, a coin, a relief or a
manuscript. A later painting serves when nothing from the time shows that side, and its caption says when it was
painted. A card keeps one image when Commons has nothing more that fits.

An image shows in one place of a story: on one page, in its text or on its markers, or on one battle's card. A card
can take an image a page of another chapter shows, when Commons has nothing else for that side.
`node scripts/contact-sheet.mjs <story>` prints each image that shows in more than one place.

Images on nearby pages differ in kind: two portraits from one manuscript or one series go in different chapters.
The same command draws every image the story shows in page order to `.cache/<story>-images-<n>.png`. Open the
sheets before an image agent finishes.

Before a story is released, a maintainer runs `./node_modules/.bin/harita upload --story <story>`, which puts
its new images and elevation tiles in the store. `npm run build -- --strict` then checks that the store holds
every object the story links to. `harita dev` shows new images before any upload.
