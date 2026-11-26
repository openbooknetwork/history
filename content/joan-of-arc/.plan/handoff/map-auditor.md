# Handoff for the next map-auditor

- The pack's captures show no base map in this sandbox: no river, no streets, only zones. The Loire at Orléans shows
  only as the english-siege-1428 edge. Judge a river route by the generator's head comment (the banks it reads)
  and not by the capture.
- The legend covers the bottom-left of a laptop capture, about 220 by 280 pixels. Look at every place near a
  frame's south-west corner (030's Blois was under it until the bbox went 0.25 degrees further south).
- A note of more than about 150 characters loses its label at the opening view. Keep a note you change no longer
  than it was, and recapture.
- The overseer commits while the audit runs. Name the commit that holds the files as the drawer left them in the
  fix log (`git log -- <file>`), not the HEAD you started on, or a recheck's diff covers your own change.
- A card in `shared/battles/` does not follow a fix to the plan's `battles.yaml`. Compare the two when a fault
  of the section changed `battles.yaml`.
- The Wikipedia API answers 429 from this sandbox. The articles' coordinates are already in
  `content/<story>/.wikipedia/<title>.wiki` (`{{coord|...}}`): read a marker's place there.
- A long note on a marker near a frame's edge pushes its label block far from the icon, and the label then seems
  to name the next marker. Shorten the note in the generator and recapture.
- A label block also keeps clear of the legend. A marker just right of the legend, or above it, gets its block pushed
  away from the icon: the note then starts beside the icon and the name sits far along it. Only a note short enough
  to fit the room (about 60 to 80 characters) brings the name back (050's Sully, Crépy and Coudun).
- On a page with a battle the card opens at the start and the map fits its bbox into the frame left of the card, so the
  legend reaches further into the frame's south-west than on other pages (070's Bayonne sat on it until the bbox went
  0.6 degrees further south).
- A marker's note starts just right of its icon and the name is centred over the note, so a long note puts the name
  far east of the icon, worst at a frame's west edge (070's Dieppe and Cherbourg). Keep such notes under about 60
  characters. The map's attribution box covers notes at the frame's south-east foot, as the legend does at the south-west.
