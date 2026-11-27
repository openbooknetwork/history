# Writing a text

For whoever writes, reviews or edits a page's English text.

The reader steps through the story on a map, often on a phone, and may open any page first. They know no more of
the subject than a school leaver does. Each page changes the map once, and its text tells what happened there and
why.

## What matters, in order

Where two of these pull apart, the earlier one wins.

1. **True to the sources.** Each date, name, place and figure is in a source file of the story. Where the sources
   differ on a figure or on who did what, the body gives a wording true for each: "three or four thousand men".
   Where they leave a question open, the text says that it is open. `agents/evidence.md` gives the standing of a
   claim and how a text tells each.
2. **The text and the map agree.** The text tells the change the page's map shows, and each place it names is on
   the map.
3. **The reader can follow.** Each event has its who, where and when, and the cause that led to it. A person gets
   a few words on who they are where the page first names them, since a reader may start at this page.
4. **Even handed.** The text uses the words a historian of neither side would use. A massacre, an atrocity or a
   claim one side disputes is told as what it is: "the Burgundians blame her for his death".
5. **Concrete.** A number, a date or a consequence stands where "many", "soon" or "significant" would. A sentence
   that could sit in any story about any war goes.
6. **In the book's own words.** Wikipedia is CC BY-SA, and the book takes facts from it and no sentences. A quote
   from a chronicle or a letter is short and names its author.
7. **Short.** A body has three limits. It is never under 150 words and never over 350: both are hard, and a
   check fails on either. 300 is the soft limit: aim to stay under it, and a body between 300 and 350 passes
   where its writer says in its report why it runs long. The limits are the body's: the notes of "Notes" below
   do not count.

## Only the story

The text tells the story and nothing else. The reader is inside it, and a sentence about the book takes them out.
No sentence of a body or a note names the map, a page, a chapter, the book or the story itself.
`scripts/rules-lint.mjs` fails a text that does.

- **No map.** Not "the map shows", "on the map", "the line drawn along the river", "is not marked" or "the box
  at the top". A change of the map is told as the event: "Normandy is now English".
- **No pages and no chapters.** Not "this page follows Arrian", "a later chapter tells it", "the next pages" or
  "in this chapter". What another page tells gets its clause as part of the story, or nothing.
- **No book.** Not "the account here follows him", "this book counts" or "from here this story calls him
  Charles VII". The account the text follows is simply told, and a note gives each author's view: "Bosworth
  thinks it most likely the Trojan pass. Hammond takes it to be the Shipka."
- **No excuse for the drawing.** A border or a route that is a reconstruction gets no sentence: not "the routes
  are approximate" and not "the sources do not give the exact roads". Its basis stays in the plan. Something
  unknown is told only where it is part of the history, as a historian would tell it: "Where Sochi stood is not
  known."
- A sentence that only lists what the map shows goes.

## Who says it

The body tells what happens, in the present tense, and names no one who reports it. A body that reports a report
falls into the past and into two tenses at once: "Joan told her judges that she was about thirteen when she
first heard a voice." The body tells the event: "Joan is about thirteen when she first hears a voice she takes
to be from God."

- **No witness in the body.** Not "she told her judges", "Poulengy remembered it at the retrial", "he later
  said" or "by her own account".
- **No historian in the body.** Not "Lang puts it at twelve miles", "by Lowell's count", "Ramsay has it in
  September", "historians think" or a name in brackets after a claim. The body tells the account it follows, or
  a wording true for every account: "on 23 February or 6 March", "twelve or thirteen miles", "by one account".
  The sources list names the books.
- **No more than the witness knew.** What only one person could know is told as theirs: "a voice she takes to
  be from God", and not that God speaks to her.
- **A person of the time who acts is part of the story.** A letter written, a sermon preached or a chronicle
  begun at the time of the page is an event, and its author stands in the body: "On 22 March Joan dictates a
  letter to the English." So does a hearing: on the pages of a trial, "Joan answers that she will not tell
  them" is the event itself.
- **A quote keeps its speaker and its own tense**, and is introduced in the present: "'Bishop, I die through
  you,' she says."

`scripts/rules-lint.mjs` reports a body sentence that names a count or an account as someone's ("by Lang's
count"), reports speech in the past ("she said", "he recalled", "told her judges"), speaks of historians or
says "according to".

A map or a book of the time is a thing of the story and keeps its name: "the map of Cresques", "his last chapter
breaks off in the middle of a sentence".

## Language

The English and every translation follow `node_modules/@openbooknetwork/kitap/writing/README.md`, and a
translation also follows that folder's file for its language, such as `tr.md`.

The English tells history in the present tense: "In January 1348 the plague reaches Pisa." No body mixes the
present with the past: what came before the page's event is told in the present perfect or with its date, "Paris
has been English since 1420", and "Who says it" above keeps the reports that pull a body into the past out of
it. A quote keeps its own tense.

A person or a place takes the form `content/<story>/.plan/names.md` gives it for the year of the page.

## Notes

A page has a note if and only if its text would confuse a reader without it: a quote whose moment the body
cannot give, or a word of the time the sentence has no room to explain. A note has 25 words at most, and a page
has two notes at most. Most pages have none. `scripts/rules-lint.mjs` reports a longer note and a third one.

The body marks the sentence with an escaped marker, `\*` and then `\*\*`: without the backslash Markdown reads
the marker as italics. After the body comes the heading `### Notes`, with one paragraph per note that starts
with its marker:

```
Her mother teaches her to sew and spin so well that she "feared no woman in Rouen".\*

### Notes

\* Her own words to her judges at Rouen in 1431.
```

A note is not the place for who says a thing, for a second account or for the figures of each author. A
disputed claim gets no note: the body tells a wording true for every account, or says in a clause that it is
disputed. A sentence that only promises a note, "it is told two ways", goes. An `open` claim stays in the body.

## Places in the text

A page's text links each place its markers show the first time it names it, in every language:
`[Gelibolu’ya](@gallipoli)`. The link text is the word as the text writes it, with its Turkish suffix, and the id is
one of the page's `markers`. On a battle plan page the commanders the text names link to their units' markers.
`./node_modules/.bin/harita check <story> --places` lists, per text file, the markers whose label the text names
without a link.

## Across pages

A page tells its own event. An event another page tells gets one clause and the reader moves on. No text points at
another page or chapter: "Only the story" above.
