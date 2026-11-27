# Evidence

For whoever gathers the sources of a story, plans or draws from them, or checks a page against them.

## Which sources count

A source counts when it names its author and cites its own sources. The digest marks each quote with its kind:

- `scholarly`: a journal article, a book of a university press, an encyclopedia with signed entries.
- `primary`: a chronicle, a letter or a treaty in a published edition, with its editor named.
- `institution`: a museum, a national archive, a university's project site.
- `wikipedia`: an article, for the order of events and for finding the three kinds above.

Blogs, forums, sites with no author and popular history sites that cite nothing stay out. So does a sentence of
a Wikipedia article that has no footnote: it leads to a source and is none itself.

## Independent sources

Two sources are independent when neither takes the point from the other, and both do not take it from one third
work. An article and the book its footnote cites are one source. Two modern books that both follow the same
chronicle are one source for what the chronicle says, and two for how historians read it.

## The standing of a claim

Each line of the digest is one claim with an id, `<section number>.<n>`, and one of these:

| Standing | When | In a text |
|---|---|---|
| `agreed` | two independent sources say it | told plainly |
| `single` | one source says it, or several that go back to one | told, and a figure is given as about or as a range |
| `disputed` | sources that count differ | a wording true for each account, or a clause that it is disputed |
| `open` | the sources say it is not known | the text says it is not known |

A line keeps its id for good. A new line takes the next number, and the number of a line that goes is left unused.
Plans and faults name a claim by its id, so `grep -rn "<id>" content/<story>/.plan` lists what rests on it.

## Claims a story turns on

The cause of the event a page tells, who began a war and who won it, a death toll, a border a treaty set, and each
"first", "largest" and "last". Such a claim takes a `scholarly` or `primary` source. One that rests on `wikipedia`
alone is `thin`: the digest lists it, and the user decides whether the story tells it.

## The basis of a drawing

A zone has an edge and a unit a place, whatever the sources know, so a sharp drawing says nothing about how sure
the line is. Each border, route, marker, unit position and measurement has a basis in its plan:

| Basis | When | What follows |
|---|---|---|
| `sourced` | a source gives the line or the place: a river, a treaty line, a list of towns, coordinates | drawn as given |
| `reconstruction` | inferred from what a source does give, and the plan says from what | drawn, and no text speaks of it: the basis stays in the plan |
| `unknown` | no source gives it and nothing sourced leads to it | left out: no figure on the card, no measure in the text |

A strength, a casualty figure or a width of a front that no source gives stays `unknown`. An agent that needs a
size to draw with picks one for legibility, and the size appears in no text.
