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
- **The two trials are primary sources with a side.** What a witness of the retrial said of 1429 or 1431 is told
  as that witness's account, a quarter of a century on. A text or a note says "at the retrial" and gives a deposition no
  year: Murray heads the depositions 1455, 1455-6 and 1456 by place, and no file dates each one. What the record of 1431 says she said is the court's record.
- **The texts from archive.org are OCR.** A quote is copied as the file has it, and a name is searched by more
  than one spelling.
- **The Thin part of the digest is not told.** No text and no card gives a claim that `research.md` lists under
  "Thin": the strengths at Cravant, the modern counts of Agincourt, Saint-Laurent as the fort passed on 4 May 1429,
  "Normandy and a strip of Gascony" as the English lands of 1444, and the name of the play of 8 May 1435. The map
  of 1444 to 1453 shows as English the towns and lands the sources of the reconquest name.
- **A disputed day.** A text tells the day that the primary sources give, or most of the sources, and names the
  author who differs where the page turns on the day. Where the digest marks a day `disputed` and no account
  leads, the text gives the month.
- **Left out, as one source alone or a distrusted one gives it:** the road from Le Crotoy to Rouen (the map draws
  no route between them and marks the two places), the gate she entered Orléans by, the crossing of the Loire at
  Gien, the stopping and restoring of the feast of Orléans in 1793 and 1803, and the terms of the truce of 28
  August 1429.
- **Told with its author:** the stakes at Patay (Monstrelet), the visit to Vaucouleurs of May 1428 (Poulengy, with
  Lowell's doubt), the sale (John of Luxembourg and ten thousand livres tournois; Ramsay's Duke of Burgundy and
  francs), the capture on 23 May 1430 (the Duke of Burgundy's letter; Monstrelet's 24 May).
- **Charles VII** is so named from 30 October 1422. "The Dauphin" stands only in quotes and in Joan's own words, and a text says once that she called him so until he was anointed at Reims.
- **An image stands once in the story.** No two pages plan or place the same image, by name or by subject. Where
  two sections want one, the page on which the place matters most keeps it.

## Maps

- **A section's markers live in its page folders**, a `markers.yaml` beside each `page.yaml`, written by the
  section's generator in `.plans/`, as 020 has them. Section 010 keeps its block of `shared/markers.yaml`. A marker
  id is the story's: a new id is checked against every `markers.yaml`.
- **A generator rewrites only its own section's files.** `handoff/cartographer.md` is added to and never written
  whole.

## Working

- There is no shared dev server. Each agent that takes captures builds the story once into an `--out` folder of
  its own and serves that static build.
- A strict build is run with `--no-store`.
