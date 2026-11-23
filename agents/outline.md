# Planning a story

For whoever plans a story: its pages and their count.

## Story size

The length follows the subject, and every page earns its place. Count the pages in an outline before any page is
written:

1. List the events. A page earns its place when the map changes on it: a border moves, an army or a fleet
   travels, a battle is fought, a new region enters the story. Events in one region within a few years share a
   page.
2. Give each battle a card on the page of its campaign. Phase pages go only to battles whose sources give
   positions and movements, two or three phases each, and only to the battles that decided the war.
3. Group the pages into chapters of three to eight pages.
4. Weigh the count against the stories already built: Atatürk 54 pages, Maya 70, American Revolution 86, Punic
   Wars 117, Napoleonic Wars 150. About 70 to 80 is the usual size. A story runs longer when the subject has
   that many map changes and documented battles, as 23 years of war across Europe did. Above that, merge
   neighbouring pages first, then cut phase pages.

A story about a people or a civilization, such as the Maya or the Vikings, has a chapter of about five to eight
pages on how they lived: society, law and rule, religion and burial, trade, writing, warfare. Each page shows its
subject on the map as places, routes or finds: temples, assemblies, hoards, inscriptions. Place the chapter after
the reader has seen the extent of their world and before the events that change it, such as a conversion or a
conquest. A story about one war or campaign, such as the Punic Wars, has no such chapter. A war against a people
the reader knows little about, such as the Aztecs, gives their world a page or two of context.

The outline is the story's brief and its chapter plans in `content/<story>/.plan/`, which `agents/overseer.md`
describes. It is done when the plans list every page with its id, title, one line of content and its battle card,
and the user has agreed the count. Agents build exactly the pages of their chapter's plan.

## Order

Pages run in time order. A story has no flashback: no page starts before the page ahead of it, within a chapter
or from one chapter to the next. Where a later chapter needs an earlier state of the map, such as an empire
before a campaign into it, that page goes where its date puts it, or the later page shows the state at its own
date. Every page sets `when`, and the build's order check then holds the rule.
