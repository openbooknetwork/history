# Story rules

The rules every agent of this story follows, beyond `agents/`. Each one was ruled during the build; `decisions.md`
keeps the reason. Read this file before you change a page, a zone, a card or a text.

## Maps

- **Generators are in the repo.** `.plans/zones.cjs` writes every zone into `shared/zones/`. `.plans/router.cjs`
  keeps routes on their surface. `.plans/pages0X0.cjs` writes each section's page files and routes. Run them from
  the repo root, edit them there, and add `pages060.cjs` onward beside them. Never keep a generator only in a
  scratchpad.
- **A zone is cut once for the whole story** by every zone of a lower priority number that shares any page with
  it. So a zone cut back in stages takes one `zones.yaml` entry per stage on its base outline:
  `persia-334a` … `persia-330`, and `league-335`, `league-331`. Each stage entry repeats the base zone's `clip`,
  because an entry does not inherit it.
- **No zone name ends before its page's date** (rule A). A zone shown on later pages takes a `zones.yaml` entry
  named for that year (`macedon-335`, `macedon-334s`).
- **A marker's note tells the event of the page that shows it** (rule B). A page that needs a place from another
  page takes its own id (`aegae-336b`, `sochi-333b`, `ecbatana-330b`). One id has one note in
  `shared/markers.yaml`.
- **A page shows every zone its neighbours show for its frame** (rule C), unless its text tells a change.
- **A battle card stands on the battle's sourced site**: a siege on its town, a field battle where its battle plan
  draws the field. A card's `lnglat` never moves for layout. A town marker at the same point stays on the
  page: the card's swords lead, the marker waits under them and comes forward when the reader points at the
  town's name in the text. So the text links the town (`agents/pages.md`, Battle cards).
- **Battle ids take the year:** `granicus-334`, `issus-333`, `gaugamela-331`, `persian-gate-330`,
  `megalopolis-330`, and so on; where the plan gives a year, the plan's year.
- **The careful side:** land that no source says was taken stays out of the conqueror's zone (Pisidia, Lycaonia,
  Sillyum; Myndus and Caunus until summer 333; Cassopaea; Maronea and Abdera). A town that fell only at the end
  of a page's span stays out of that page's zone (the island city of Tyre).
- Pisidia and Lycaonia stay Persian. The Aegean islands stay blank (persia's clip leaves Greece out).

## Texts

- **Disputed claims go into notes.** The body tells the account the map follows, or a wording true for every
  account, with an escaped marker `\*`, `\*\*`, `\*\*\*`. After the body comes `### Notes`, one paragraph per
  note starting with its marker, giving each account with its author and figures. A page with no dispute has no
  Notes heading. `open` claims stay in the body. The body is never under 150 words and never over 350, both hard limits, and 300 is the soft limit to aim under (`agents/text.md`). Notes do not count.
- Names follow `names.md`. The Persian Gate is the gorge above Mullah Susan, the Tang-i Mohammad Reza (Bosworth,
  C&E n. 191); "Tang-i Khas" is Stein's mistake. Arrian's Persian cavalry at Gaugamela is 40,000.
- A figure that one author gives is told with his name; where Arrian and another author count differently, each
  is given (Issus dead: Arrian counts the horse inside 100,000, Diodorus and Curtius on top).
- Image captions give only what the Commons file page or a digest line says.

## Working

- There is no shared dev server. Start your own with its own `--out` and port, and stop it when you finish. If
  `harita dev` fails with ENOSPC (file watchers), build once into your `--out` folder and serve it statically.
- `scripts/screenshot.mjs` only knows macOS Chrome. A Linux copy is at
  `/tmp/claude-0/-home-user-repo/57858a46-e8d4-5d34-b6d2-eed308b84ea8/scratchpad/battle-implementor/screenshot.mjs`.
- Headless Chrome may capture an old frame of a route or a phase. Retake before calling a line missing, and
  judge zones and routes from a capture of a page loaded directly.
- Keep your report short: the YAML block of `agents/report.md` and a few lines. Put detail in a file in your
  scratchpad.
