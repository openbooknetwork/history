# Writing a text

For whoever writes, reviews or edits a page's English text.

The reader steps through the story on a map, often on a phone, and may open any page first. They know no more of
the subject than a school leaver does. Each page changes the map once, and its text tells what happened there and
why.

## What matters, in order

Where two of these pull apart, the earlier one wins.

1. **True to the sources.** Each date, name, place and figure is in a source file of the story. Where the sources
   differ on a figure or on who did what, the text names who says it: "Benedictow puts the dead at 60 percent."
   Where they leave a question open, the text says that it is open. `agents/evidence.md` gives the standing of a
   claim and how a text tells each.
2. **The text and the map agree.** The text tells the change the page's map shows, and each place it names is on
   the map.
3. **The reader can follow.** Each event has its who, where and when, and the cause that led to it. A person gets
   a few words on who they are where the page first names them, since a reader may start at this page.
4. **Even handed.** The text uses the words a historian of neither side would use. A massacre, an atrocity or a
   claim one side disputes is told with the source that reports it.
5. **Concrete.** A number, a date or a consequence stands where "many", "soon" or "significant" would. A sentence
   that could sit in any story about any war goes.
6. **In the book's own words.** Wikipedia is CC BY-SA, and the book takes facts from it and no sentences. A quote
   from a chronicle or a letter is short and names its author.
7. **Short.** Most texts run 150 to 300 words. A page that names both sides of a disputed figure may run to 350.
   The limit is the body's: the notes of "Notes" below do not count.

## Language

The English and every translation follow `node_modules/@openbooknetwork/kitap/writing/README.md`, and a
translation also follows that folder's file for its language, such as `tr.md`.

The English tells history in the present tense: "In January 1348 the plague reaches Pisa." A quote and what a
historian later writes keep their own tense: "Benedictow puts the dead at 60 percent."

A person or a place takes the form `content/<story>/.plan/names.md` gives it for the year of the page.

## Notes

A disputed claim goes into a note, and not into the body. The body tells the account the map follows, or a
wording that is true for every account, and marks it with an escaped marker: `\*`, then `\*\*`, then `\*\*\*`.
Without the backslash Markdown reads the marker as italics. After the body comes the heading `### Notes`, with
one paragraph per note that starts with its marker and gives each account with its author and figures. A page
with no disputed claim has no Notes heading. An `open` claim stays in the body.

## Places in the text

A page's text links each place its markers show the first time it names it, in every language:
`[Gelibolu’ya](@gallipoli)`. The link text is the word as the text writes it, with its Turkish suffix, and the id is
one of the page's `markers`. On a battle plan page the commanders the text names link to their units' markers.
`./node_modules/.bin/harita check <story> --places` lists, per text file, the markers whose label the text names
without a link.

## Across pages

A page tells its own event. An event another page tells gets one clause and the reader moves on. The last page of
a chapter may say what the next chapter follows.
