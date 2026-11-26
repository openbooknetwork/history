# Story rules

The rules every agent of this story follows, beyond `agents/`. Each one was ruled during the build; `decisions.md`
keeps the reason. Read this file before you change a page, a zone, a card or a text.

## Shape

- **41 pages in seven sections**, as the brief counts them for each section. A section's plan holds exactly its
  count.
- **No battle has phase pages.** Every battle the brief names gets a card and no more. No battle plan is written.
- **The closing page**, the last of section 070, tells what is recorded of how she was remembered, to the
  canonisation of 1920, and claims nothing of what she means.

## Evidence

- **The voices are testimony.** A text tells what she and the witnesses said, in the trial's own words where they
  survive, with who said it and when. No text says what the voices were, and none says they were not.
- **The older scholars.** The scholarly works read are of 1881 to 1929 (Ramsay, Wylie, Oman, Lowell, Lang,
  Beaucourt, Thurston), with Renoux (2022). A judgement, a motive or a number that only one of them gives is told
  with his name or left out. Anatole France's Life is read for where to look in the chronicles: no claim rests on
  it alone.
- **The careful side.** A claim that no primary or scholarly source carries is left out. A number of men, a date
  or a place that the sources give differently names its author.
- **The two trials are primary sources with a side.** What a witness of 1456 said of 1429 or 1431 is told as that
  witness's account, twenty-five years on. What the record of 1431 says she said is the court's record.
- **The texts from archive.org are OCR.** A quote is copied as the file has it, and a name is searched by more
  than one spelling.

## Working

- There is no shared dev server. Each agent that takes captures builds the story once into an `--out` folder of
  its own and serves that static build.
- A strict build is run with `--no-store`.
