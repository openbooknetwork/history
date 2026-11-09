# The plague front and the death tally

Every page of the Black Death shows two zones and a figure. The dark zone, family `plague`, is the land the plague
had reached by the page before. The hatched grey zone, family `plague-new`, is the land it reached by this page.
The box at the top of the map gives the estimated dead by this page's date.

`front.mjs` makes all three from `regions.yaml`. Rerun it from the repository root after a change to the regions or
to the `when` of any page:

```
node content/black-death/.front/front.mjs           # prints each page's date, the regions it adds, its zones and its tally
node content/black-death/.front/front.mjs --apply   # writes them
```

`--apply` writes one zone per distinct front to `shared/zones/front/front-<page id>.geojson`, named after the first
page that shows it, and an entry `new-<page id>` in `shared/zones.yaml` for each page that adds land. It rewrites the
`zones:` and `tally:` lines of every page.yaml and leaves the other lines as they are.

## Regions

`regions.yaml` lists 125 regions, from the Chüy valley to Bergen and Moscow. Each has the towns that stand for it,
the month its epidemic broke out, its population about 1346 and the share of its people who died, low and high. A
region's land is the land nearer one of its towns than any other town of the list, so the regions fit together like
tiles. Land that no source dates by the end of 1353, such as Iceland, Medina, Anatolia beyond the Marmara and the
Balkan interior, has towns of its own under `blank`, which keep the regions off it.

Where the sources give a season, the region takes its first month. Where they give only a year, the region takes
June, and the comment beside the arrival says so.

The arrivals, rates and country populations were checked against the Wikipedia articles in `../.wikipedia/` and the
works they cite, marked "via Wikipedia" in a region's `source`. A region's `unconfirmed` list names the fields those
articles neither confirm nor date, for a later check against the books.

## The date of a page

A page shows the land reached by the end of its `when`, cut back to the month before the next dated page begins,
and never earlier than the page's own start or the date of the page before.
Pages whose spans overlap, such as Marseille (November 1347 to January 1348) and Genoa (December 1347 to February
1348), each show their own months that way. A year alone counts as January at the start of a span and December at its
end. A page without `when`, such as the pages on the doctors, shows the land and the figure of the page before it.

A region whose epidemic began in the month of an earlier page names in `page` the page that tells of it, and first
shows there. Melcombe, reached in June 1348, shows on the Melcombe page, after the pages on northern Italy and
Damascus, which end in the same month.

## The tally

For each region the plague has reached by a page's date, the script multiplies its population by its death rate and
by the share of its epidemic that has passed. An epidemic runs six months, nine in the Delta, Upper Egypt and
Greece, twelve in Constantinople. A region counts a sixth of its dead in its first month and all of them from its
sixth. The low and high sums, rounded to two figures, make the page's range. Central Asia, the Golden Horde, Iraq,
Mecca and Yemen have no population figure and stay out of the sum, so the count starts at Caffa.

| regions | low | high |
|---|---|---|
| most of Europe, Byzantium, Cyprus and the Crimea | a third | 60 percent |
| England | a third | 62 percent |
| Norway | a third | 65 percent |
| Pskov | a third | 67 percent |
| Tuscany | 45 percent | 60 percent |
| Castile, Andalusia, Galicia and Granada | 20 percent | 60 percent |
| Swabia, Bavaria and Franconia | 10 percent | 60 percent |
| Lombardy | 15 percent | 60 percent |
| Portugal | 20 percent | half |
| Poland and Lithuania | 10 percent | half |
| Bohemia, Moravia and Silesia | 10 percent | a third |
| Gaelic Ireland | 20 percent | half |
| Egypt | a third | half |
| Cairo | a third | 40 percent |
| Syria and Palestine | a quarter | 38 percent |
| the Maghreb | a quarter | a third |
| Bursa and the Marmara coast | 20 percent | 40 percent |

By the end of 1353 the figure reaches 24 to 46 million, from 117 regions with about 81 million people. Historians
give 25 to 50 million dead for Europe alone, a third to 60 percent of its people.

## Sources

- Ole J. Benedictow, *The Complete History of the Black Death* (2021): the chronology of Europe, and the high rates,
  60 percent for Europe and 62.5 percent for England.
- Michael W. Dols, *The Black Death in the Middle East* (1977): the chronology of Egypt, Syria, the Maghreb and
  Arabia, about half dead in Egypt and a third in the Middle East.
- Stuart J. Borsch, *The Black Death in Egypt and England* (2005): Egypt.
- Dick Harrison, *Stora döden* (2000), and Joseph P. Byrne, *Encyclopedia of the Black Death* (2012), as the
  Wikipedia articles cite them: many of the months, among them Carcassonne, Toulouse, Paris, Cairo and Gaza.
- Philip Ziegler, *The Black Death* (1969): the low rate, a third.
- David Herlihy and Christiane Klapisch-Zuber, *Les Toscans et leurs familles* (1978): the Tuscan towns.
- Maria Kelly, *A History of the Black Death in Ireland* (2001): Ireland.
- Adam Izdebski and others, "Palaeoecological data indicates land-use changes across Europe linked to spatial
  heterogeneity in mortality during the Black Death pandemic", *Nature Ecology & Evolution* (2022): the low rates of
  Bohemia and Poland, where pollen shows farming carrying on.
- Uli Schamiloglu, on the plague among the Turkmen herders of Anatolia: the rate of Bursa and the Marmara coast.
- András Vadas, "The Black Death in the Kingdom of Hungary" (2024): Hungary in 1349.
- Cesana, Benedictow and Bianucci, "The origin and early spread of the Black Death in Italy", *Anthropological
  Science* (2017): the first infection of Genoa and Venice, months before the outbreaks the regions take.
- Maria A. Spyrou and others, "The source of the Black Death in fourteenth-century central Eurasia", *Nature* (2022):
  the Chüy valley in 1338.
- Colin McEvedy and Richard Jones, *Atlas of World Population History* (1978): the populations where Benedictow and
  Dols give none, shared out by region.

`regions.yaml` names the source of each region's arrival and rate.
