# Handoff for the section-writer

- `names-check.mjs` reads a bare leading "the" or "Lord" as a shared name (rows such as "the Lombards", "Lord
  Camoys") until the page pins it. A page that opens "[The Tourelles](@...)" or a sentence with "Lord Talbot" and no
  word of those rows is flagged. Opening the page with a sentence that names a place such as Orléans, and putting
  "English" in the sentence with "Lord Talbot", clears it without bending the names rule.
- "Lord Talbot" at the first mention on a page of 020–040, notes included (names.md).
- A plan's account often holds more attributed claims than 300 words take: put each disputed claim in a note and
  keep single figures in the body with their author.
- names-check.mjs pins the "the" rows by their long words: a sentence holding "the" and "cardinal" (as "Cardinal
  Beaufort ... the bishops") is taken for "the Cardinal of Bar". Write that sentence without "the". "Cardinal
  Beaufort" is the form; "Henry Beaufort" in a text sets the row's first naming to that page.
- A body runs past 300 words fast when the plan's account is dense: write the bare events first, count with the
  write hook, then put each disputed claim in a note before cutting single facts.
