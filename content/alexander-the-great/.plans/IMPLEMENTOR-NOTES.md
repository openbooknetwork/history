# Notes for the next battle-implementor

Generators here: `granicus.mjs`, `issus.mjs`, `gaugamela.mjs`, `persian-gate.mjs`. Run each from the story folder
(`node .plans/<id>.mjs`) after every edit. `lib.mjs` is the Punic Wars binding (`frame`, `writePlan`); nothing else in it.

## Conventions the coordinator ruled

- Battle ids take the year (`hydaspes-326`). Every card is written in the story's family colours, copied from
  `story.yaml`, with each disputed figure given by author ("Arrian: … Diodorus: …"), and each figure the plan marks
  `unknown` left off. Theban, Tyrian and similar unknown commanders stay off.
- A card stands on the battle's sourced site. A town marker at the same point comes off that page's `markers`
  list, and its `[Name](@id)` link in `text/en.md` becomes plain `Name`. Touch nothing else in another agent's page.
- Phase texts follow the notes rule (decisions.md, "Text format"): the body tells the drawn account or a wording true
  for every account, with `\*`, `\*\*` … after the sentence; `### Notes` at the end gives each account with its
  author. The body runs 150–300 words. Positions the plan marks `reconstruction` get one sentence: "The sources do
  not give …". Widths the plan marks `unknown` appear in no text.
- Names: only names.md forms, and only the minor commanders the section plan allows (050 allowed just Simmias,
  Aretes, Polyperchon, Attalus (the Agrianians) and Philip, son of Menelaus). Check names.md for each name in unit
  names and markers too, not just the text.
- Neighbouring blocks of one side 80–150 m apart; opposing lines 50–125 m apart with a clash. Arrows end on their
  block. Use about 6 markers a page.

## Traps

- `f.box` boxes the corners of the local rectangle. In a frame turned near 45° that doubles the area and shrinks the
  units (Gaugamela). Box the drawn points instead: see `pointBox` in `gaugamela.mjs`.
- On a phone the width of the bbox sets the scale. Check every phase at `SHOT_W=390 SHOT_H=780`. If one phase needs
  a wide frame (the Persian Gate night march), give the others tighter frames on the fighting.
- Unit depths read too thin at 200 m on fields over 5 km; 300–450 m works.
- A `camp` unit is a block too, so other units of the same side must not sit inside it. Draw a camp with troops in
  it as a `trench` work (Persian Gate).
- `scripts/screenshot.mjs` has the macOS Chrome path. Copy it to your scratchpad with
  `/usr/bin/google-chrome --no-sandbox`, and `pkill -f cdp-profile` between runs, or a hung Chrome blocks the next one.
  Capture each phase in its own run: stepping between phases with the same bbox can catch a stale emblem.
- `SHOT_HOVER` never shows a label in headless Chrome here. The pointer does land on the unit
  (`queryRenderedFeatures`), so say so in the report rather than retry.
- The dev server rebuilds the whole story, and any page that names a missing card fails the build. Wait until the
  new bbox string appears in `.cache/<out>/alexander-the-great/story.js` before capturing.
