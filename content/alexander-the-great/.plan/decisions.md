# Decisions

- Brief drafted with the user locally on 22 Nov 2026, before the cloud run; the run starts at step 2, research.
- Scope runs past Alexander's death to Ipsus (301 BC), one legacy chapter, because the user asked for the
  legacy; the Diadochi wars are told in six pages, not as campaigns of their own.
- No chapter on how a people lived: the story tells one king's campaigns. The Achaemenid Empire gets one
  context page in 030.
- Phase pages are certain for Granicus, Issus, Gaugamela, the Persian Gate and the Hydaspes — the user asked
  for the Persian Gate's phases; Chaeronea and Tyre get them only where the sources give positions. A battle
  whose sources turn out not to give positions loses its phase pages at step 9, as agents/overseer.md says.

## Step 2: research (done)

- Researcher reported pass: 169 claims, 357 quotes; `node scripts/quotes-check.mjs alexander-the-great` prints
  `ok, 357 quotes` (run by the overseer). No section rests on `wikipedia` alone.
- cloud ruling: 090.17 (Ai-Khanoum as a Seleucid foundation) is dropped from the story — it rests on Wikipedia alone
  and the excavation reports and the Met could not be read.
- cloud ruling: 090.19 (Gandhara art and its line from Alexander to the Kushans) is dropped from the story — it
  rests on Wikipedia alone; the legacy page tells the Alexandrias and koine from Bosworth and CAH VII only, and names
  Gandhara at most as a place, not an art-historical claim.
- cloud ruling: the unread address https://escholarship.org/content/qt5zz738r1/qt5zz738r1.pdf (403; Chaeronea
  topography) stays unread — 010 goes on with what was read, and Chaeronea stays a card (010.14).
- Unresolved from the researcher, settled at step 4: 030.8 Granicus versions; 010.14 Chaeronea; 040.13 Tyre phases;
  040.5, 050.19, 070.9 battlefields as reconstructions; 090.13 the Ipsus victors; 040.11, 050.15, 060.13, 070.17
  order of events.

## Step 3: names (done)

- `names` reported pass and wrote names.md. Its open questions are taken as proposed:
- cloud ruling: places take their ancient scholarly English name (Maracanda, Ecbatana, Halicarnassus), today's
  name in brackets once per page; natural features and regions keep today's name — follows Bosworth and the Punic
  Wars pages, and many sites have no living town. The brief's "Samarkand" becomes Maracanda.
- cloud ruling: Macedon for the kingdom and its land, never Macedonia outside quotes — one name per place, as the
  brief and the Punic Wars pages.
- cloud ruling: the state is the Persian Empire, the dynasty the Achaemenids — readers know "Persian Empire".
- cloud ruling: the death is written "between the evenings of 10 and 11 June 323 BC" in texts, "June 323 BC" in
  labels — 080.12; the brief's "11 June" rests on Depuydt, unread.
- cloud ruling: Bucephalus/Bucephala, Aornos, Saka (apart from the Scythians), Roxana, Persian Gate — the brief's
  forms, the others listed as other forms.
- cloud ruling: "the Successors", with "(Diadochi)" once per page — an English word for readers and translators.
- cloud ruling: kingdoms of 306–301 BC: kingdom of Antigonus, Ptolemaic Egypt, Seleucid Empire, kingdom of
  Lysimachus, Macedon for Cassander — 090.12–13.
- cloud ruling: Diodorus's Arsamenes and Arrian's Arsames at the Granicus are one man, Arsames — the commander
  lists match; no source says otherwise.

## Step 4: final brief (done)

Each point of the digest's "Against the brief" is settled; the brief now carries them.
- cloud ruling: Chaeronea stays a card with no phase pages — 010.14, Ellis "virtually impossible to recover".
- cloud ruling: Granicus phase pages follow Arrian (030.9) and the text tells Diodorus's dawn crossing as the other
  account — the two cannot both stand (030.8), so it is told as disputed.
- cloud ruling: Tyre stays a card although Arrian gives its sequence (040.13) — outline.md gives phase pages only to
  the battles that decided the war, and the count is kept down.
- cloud ruling: Issus, the Persian Gate and the Hydaspes keep their phase pages, drawn as reconstructions with the
  site named as unlocated or disputed (040.5, 050.19, 070.9) — the sources give the positions of both sides
  relative to the ground; only the site is uncertain, so this is a reconstruction, not a guess. If a
  battle-coordinator finds no position given, the phase pages come out at step 9.
- Darius's greatest offer moves to 050 (040.11); 040 keeps the first letter after Issus.
- Alexandria/Siwa keeps Arrian's order and the text says the order is disputed (040.19).
- Megalopolis moves after the Persian Gate, probably early 330 (050.15).
- Bessus's execution is at Ecbatana, not in Bactria (060.5).
- cloud ruling: "the hardest war of the campaign" is dropped — no source says it (060.15); "nearly two years".
- The Polytimetus gets a card in 060 (060.9).
- cloud ruling: the Sogdian Rock keeps Arrian's order after Cleitus, and the text says Bosworth dates it to 328
  (060.13).
- Craterus's column leaves before the Ocean is reached (070.17).
- cloud ruling: Gedrosia's "worst losses of the campaign" becomes "heavy losses whose scale the sources dispute"
  (080.2).
- Ipsus: four victors, Ptolemy, Seleucus, Lysimachus and Cassander; "Antigonids" is dropped from 090 (090.13, 090.15).
- Crannon and Gabiene get cards in 090 (090.4, 090.8); Gaza 312 is told without a card — no page added.
- cloud ruling: the Crocus Field (010.7), Pelium (020.7) and Massaga (070.2) are told without cards — the sites are
  uncertain and the brief did not list them.
- cloud ruling: "every conqueror since" is dropped from the legend page — no source read covers it.
- cloud ruling: the count is agreed at 56 section pages and 12–15 phase pages, about 68–71 in all.

## Step 5: map design (done)

- `map-architect` wrote the brief's "Map" part and story.yaml: extent [18, 23.5, 77, 46], 25 families, 52 zones,
  all reconstructions; no shared zone taken.
- cloud ruling: its answers are taken as proposed — one family `macedon` from 359 to 301 BC (Cassander's kingdom
  stays Macedon, per names.md); macedon takes the Punic Wars green without its hatch; the Successors' families start
  at the Babylon settlement of 323; persia-336's eastern edge leaves out the Cophen and the Indus (reconstruction);
  010's annexation zones are reconstructions and the cartographer reads Ellis CAH VI ch. 14 before drawing Thrace;
  no tally.
- `weak` faults 090.12 and 090.15 (no line for the lands of Antigonus and Seleucus in 306, nor for the partition of
  301): cloud ruling — sent back to the researcher for Border lines rather than drawn on nothing. 090's plan waits
  for them; if no source gives them, the 090 zones are drawn as reconstructions from lists of lands only and the text
  says so.
- To check once pages exist: `./node_modules/.bin/harita patterns` (it stopped with "no pages" at this step).
- Researcher added 090.21–090.26 (Border lines for 311, 306–301 and 301 BC); quotes-check `ok, 375 quotes`.
- cloud ruling: the Antigonus–Seleucus line of 306–301 (090.22) is drawn as a reconstruction; the text names no
  border there.
- cloud ruling: the Mauryan cession (090.23) is told in Bosworth's general words ("the eastern satrapies"), and the
  named lands are told only as Hammond and Walbank's, with no date and no drawn line — single source.
- cloud ruling: Ptolemy's northern limit in Coele-Syria (090.25) is disputed: the zone stops at the line both
  accounts share (south of the Lebanon), and the text gives both.
- cloud ruling: Pleistarchus's share (090.26) is left off the map and out of the text, or named as disputed — the
  sources place it in two different lands.

## Step 6: section plans

- All nine coordinators wrote their plans. Count: 010 6, 020 4, 030 7 (+3 Granicus phases), 040 7 (+3 Issus),
  050 6 (+3 Gaugamela, +3 Persian Gate), 060 6, 070 7 (+3 Hydaspes), 080 6, 090 7 — 56 section pages and 15 phase
  pages, 71 in all.
- cloud ruling: 050 has 6 pages, not 7 — the fall of Persepolis and the burning share a page (same place, four
  months, the burning moves no border); the burning is told before Megalopolis.
- cloud ruling: 090 has 7 pages, not 6 — the Successors' wars hold three map changes (320, 316, 306 BC); the legend
  shares the Alexandrias page.
- cloud ruling: the Persian Gate is drawn at Bosworth's site after Stein (Mullah Susan gorge, Bolsoru path); Speck's
  Tang-e Meyran and Hemati's Kopan–Yasuj are named in the text (050.19).
- cloud ruling: the Hydaspes is drawn on Stein's ground (camp at Haranpur, crossing at Jalalpur); Smith, Breloer and
  Bosworth's Gujrat are named in the text (070.9).
- cloud ruling: the Pinarus is drawn at the Kuru Çay (Bosworth), and the text says it is not located (040.5).
- cloud ruling: Pelium is marked at Hammond's Goricë and labelled "site uncertain"; Bosworth's Florina is named.
- cloud ruling: proskynesis and the pages' conspiracy go on the Sogdian Rock page, by date (Arrian 4.22.2, Bosworth).
- cloud ruling: Pisidia is taken out of macedon-333 — Bosworth says it was never conquered.
- cloud ruling: the persia family runs on to summer 329 as Bessus's kingdom (persia-330) — he claimed the throne.
- cloud ruling: Pleistarchus is named once as disputed on 090's Ipsus page and left off the map.
- cloud ruling: Pontus and Bithynia stay inside lysimachus-301, and the text says they were independent — no
  source gives their borders.
- New zones accepted into the Map part, sent to the map-architect: macedon-356, macedon-334a, macedon-333c,
  macedon-330a, macedon-330b, persia-330, macedon-325a, macedon-324, macedon-322, ptolemaic-319; fixes to
  macedon-333 (no Pisidia), macedon-333b (summer 333), macedon-359, macedon-316, ptolemaic-323.
- `weak` source faults from every coordinator (facts used from read files with no digest line, and standings to
  correct): cloud ruling — sent to the researcher in one batch rather than let plans cite files with no line.
  Names missing from names.md: sent to the names agent in one batch.
- Stale until those land: each plan cites some files "with no digest line"; once the researcher lists the new ids,
  each coordinator swaps them into its Rests on lines.
- Map-architect folded the ten new zones into the Map part (61 zones, all reconstructions); persia-330 colour check
  passes against sogdians, scythians, macedon, thessaly.
- Names agent added the step 6 names. cloud ruling: its forms are taken as proposed — Lake Lychnitis (Lake Ohrid
  today), Antilibanus, Byblus, Canopus, Medius of Larissa, Chares of Mytilene, three fixed Nicanors, Paraetacae
  (Sogdian) apart from Paraetacene (Iranian). Stale: plans 030, 040, 060, 090 use older forms; sent to their
  coordinators.
- Researcher added the step 6 lines (010.23–31, 020.15–21, 030.22–24, 040.21–27, 050.25–28, 060.18–26,
  070.18–20, 080.15–20, 090.27–32) and changed the standing of 020.7, 030.18, 050.23, 060.5, 060.9, 070.3, 080.7
  and 080.10. quotes-check passes all 517 quotes; three plans carried passage numbers on Rests on lines (fixed by
  their coordinators).
- cloud ruling: 010.27 — no source gives the Haemus as Philip's border; the line is drawn as a reconstruction.
- cloud ruling: 090.27 (Ptolemy in Syria) is told as Diodorus's, single; 090.29 (Pydna) rests on H&W for its end.
- cloud ruling: the causes of the Cophen, Taxila and Malli campaigns have no line; told in a clause with Bosworth's
  name, or left out.
- Stale, sent back to each coordinator with its new ids, changed standings and name forms: all nine plans.
- Lyginus stays without a card (020.15) — the brief lists only Thebes for 020; told on 020-the-danube. macedon-316 renamed "Macedon under Cassander" now that 090.29 exists.
- Step 6 done: all nine plans updated; quotes-check `ok, 517 quotes`. Zadracarta marker is a reconstruction (names.md "perhaps").

## Step 7: order

- Editor (plans) reported 3 wrong, 6 weak, 6 taste faults. cloud ruling: every fix it proposes is taken, the
  careful side and cheap:
  - wrong: Antigonus's taking of Syria and Phoenicia (315–314) is told on 090 — the researcher is adding the line.
  - wrong: six marker ids planned in two sections take a new id in the later section (aegae-336b, memphis-331b,
    ecbatana-330b, bactra-327b, patala-325b, babylon-323b) — one id, one note in shared/markers.yaml.
  - wrong: 060 Opens no longer places the allies' discharge at Ecbatana (050.23 disputed); the Oxus discharge is of
    the Thessalians who stayed on as volunteers.
  - weak: Persian court dress is told for certain in 060 (080's Opis cause rests on it) and the advance force's fate
    in 030 — the researcher is adding both lines.
  - weak: names introduced twice come out of the later section's Introduces; names.md's "first named in" corrected.
  - weak: 040 gives Callisthenes's crossing figure as his and higher than 030's.
  - taste: Megalopolis says it steps back to 331; the shield from Troy, the Cadmeia garrison and the arms told in
    text; illyrians-359 kept until Pelium; 080 opens on macedon-325a; Halicarnassus citadels thread dropped.
- The brief's page lines for 050 (6) and 090 (7) are corrected by the overseer.
- cloud ruling: the plans' Headers and the count, 56 section pages and 15 phase pages (71), are agreed — in the
  user's place, as cloud.md says.
- Researcher added 010.32 (Cadmeia garrison), 030.25 (advance force), 060.27 (Persian dress), 090.33 (Antigonus
  takes Syria); the overseer wrote the ids into the plans. quotes-check `ok, 532 quotes`. Step 7 done.

## Step 8: maps and texts

- Dev server started: `harita dev --story alexander-the-great --out .cache/alexander-the-great-site --port 4321`,
  process 9768 (and 9769). Every dispatch through step 14 names port 4321.
- Writer 020 done (4 texts). cloud ruling: the timing of the killings of Amyntas and Attalus, and Attalus's tie to
  Cleopatra (020.1), are left out of the text — Bosworth, Hammond and Diodorus differ. Philip's death is given by
  year only where a text does not need the month (Ellis "probable" October; Hammond July). Marker links in 020
  (corinth-336, thermopylae-336, byzantium-335) follow the plan's ids; harita check waits for the page files.

## Step 9: battle plans (running beside step 8)

- Started at once after step 7: battle-coordinators write only .plan/battles/, so they run beside the maps and texts.
- Granicus: 3 phases in Arrian's order, each about a third reconstruction; kept. cloud ruling: the Persian line
  order from Diodorus is drawn as a reconstruction; Craterus's battalion towards the centre (Bosworth); the
  oblique crossing downstream (Arrian, Bosworth); six minor commanders left unnamed.
- Persian Gate: 3 phases at Bosworth's site; kept. Fault (wrong): the gorge is the Tang-i Mohammad Reza (Bosworth
  C&E n. 191), not Stein's mistaken Tang-i Khas — sent to the 050 coordinator, the 050 writer, names and the
  researcher. cloud ruling: the night march phase (about half reconstruction) keeps its page — the user asked for
  the Persian Gate's three phases and the brief names them; it is drawn as a reconstruction from the sourced dawn
  positions and the text says the path is approximate. Engels's ~17,000 stays off the card. Phase 1 draws the
  column halted in the narrows.
- Issus: 3 phases on the Kuru Çay; kept. cloud ruling: Darius left of centre (Bosworth after Curtius), drawn as a
  reconstruction, the text gives Arrian's centre; the drawing shows only what both accounts of Darius's flight
  share; the Persian bank is north of the river (Arrian, CAH; C&E's "south" taken as a slip); the field drawn 4 km
  wide (Bosworth), Callisthenes's 14 stades named. Nabarzanes added to the card (Curtius, Bosworth).
- All nine section-writers done (56 texts). harita check waits for the cartographer's page files. Many texts run
  over 300 words (most 310–380, 060-sogdian-rock ~420); the reviewers trim at step 12.
- cloud ruling: 090's Triparadisus page is dated 321–320 BC — H&W and Geer give 321, Bosworth 320; the text gives both.
- cloud ruling: Antigonus's age at Ipsus is dropped — no file gives it for 301.
- cloud ruling: 090 texts give Crannon as "late summer 322", both dates for the murder of Alexander IV (311 Diodorus,
  309 H&W), and no Gaza 312 figures (Diodorus and Plutarch differ).
- cloud ruling: 070 texts give Bucephalus's age with its authors (Arrian, Onesicritus); 070.13 goes disputed.
- cloud ruling: 040 page 030 gets markers for Aradus and Byblus (040.23) when the cartographer reaches 040.
- Hydaspes: 3 phases on Stein's ground; kept. cloud ruling: no fourth deployment page — the count stays agreed and
  the cavalry page starts its arrows from the deployment; the Indian front drawn ~1,000 m (Bosworth), a legibility
  size in no text; facing and field place are reconstructions. Date (070.6) and Bucephala's site (070.13) go disputed.
- Gaugamela: 3 phases on Bosworth's site north of the Jabal Maqlub; kept. cloud ruling: Arrian's Persian cavalry is
  40,000 (Chinnock; Bosworth's Commentary) — C&E's 400,000 is taken as a misprint; facing and front width are
  reconstruction/unknown and appear in no text; both accounts of the camp raid are drawn on phase 3; Parmenion's
  message is not drawn as a movement; Alexander's side is drawn all as `macedon` (thessaly shares its colour).
- Step 9 done: five battle plans (Granicus, Issus, Gaugamela, Persian Gate, Hydaspes), 15 phase pages kept.
  Chaeronea and Tyre stay cards (step 4).
- Researcher batch: new 050.29 (Philotas's column at the Persian Gate, disputed); 020.1, 050.19, 070.6, 070.13
  now disputed or corrected; 090.13 age dropped; 090.18 relocated to the CAH VII preface. quotes-check `ok, 555
  quotes`. The overseer wrote 050.29 into the 050 plan. Stale: texts 020-league-renewed (020.1), 050 persian-gate
  (050.19, fixed), 070 hydaspes (070.6, 070.13) — to the reviewers at step 12.
- Cartographer drew 010 (6 pages, 20 markers, 16 zones). cloud rulings: pella-359 keeps one note (the regency is told
  in the text); Perinthus and Byzantium coloured `greeks`; the Maedi route starts on the Axius east of Pella;
  Euboea, the Chersonese and the islands stay out of the zones ("mainland").
- A missing battle card breaks every build of the story. cloud ruling: step 10 runs one section behind the maps —
  the battle-implementor writes each battle as its section's page files land, starting with chaeronea-338, rather
  than waiting for every section. Order kept: one battle at a time, the same implementor, the auditor after each.
- Chaeronea card built; harita check prints ok and the dev server serves the story (200). Map-auditor on 010 and battle-auditor on Chaeronea dispatched. scripts/screenshot.mjs knows only the macOS Chrome path; agents use a Linux copy in the implementor's scratchpad.
- Battle-auditor on Chaeronea: card correct against the sources. cloud ruling: Theagenes goes on the card as the
  Theban commander (single, Plutarch 12.5) — a primary source read names him; the plan's "no source names him" was
  wrong. The doubled swords marker and the cramped frame go to the cartographer. Overseer changed the text's
  "2,000 are taken" to "at least 2,000" (Diodorus 16.86.5).
- Cartographer drew 020 (4 pages, 16 markers, 4 zones). cloud rulings: byzantium-335 coloured greeks; corinth-336 and thermopylae-336 keep the plan's ids; the Illyrian routes keep the family colour over illyrians-335. Implementor on thebes-335; cartographer on 030.
- Battle-auditor on Thebes: card correct. Its city marker sat under the card's point, as at Chaeronea. cloud ruling: no marker sits on a battle card's point, story-wide; sent to the cartographer as a rule.
- Image-finder 010: 22 images placed (texts, 2 markers, the Chaeronea card). The stater was stripped of its location data, so its bytes differ from Commons. Captions to check at step 12.
- Image-finder 020: 15 images. cloud ruling: pelium-335's image showing on two pages stands (taste).
- Map-auditor on 010: 4 wrong, 7 weak, 3 taste. cloud rulings, sent to the cartographer for after 030:
  - wrong: corinth-337 note 337 BC; first page dated 360–358 BC and the chapter 360–336 BC (Ellis: late 360;
    Diodorus 360/359); epirus-350 north of Ambracia; macedon-359 takes in Anthemus.
  - weak, careful side: Pydna and Methone out of the early Macedon zones; thracians-359 cut back from Amphipolis
    and Philippi; Cassopaea left out of epirus-350 on every page (annexed 342; under-drawn rather than a second
    outline); Maronea and Abdera out of macedon-340; a philippi-348 marker; Thrace page dated 342–339 BC.
  - Perinthus and Byzantium keep the `greeks` colour — with no colour they read as Persian red beside persia-336.
  - taste: Aegae page 338–336 BC; the Maedi route from Pella; the Byzantium route by Selymbria.
  - Left as drawn: Elatea in greeks-338, Abydus in persia-336, Euboea blank.
- The overseer set story.yaml span to "360 – 301 BC" and the brief's years and its macedon-359, macedon-356,
  epirus-350 and macedon-340 rows to match. Stale: research 010.1 ("359") and 010.18 ("338/337") — to the
  researcher; the 010 plan's Header and Contract dates — to the 010 coordinator.
- cloud ruling: macedon-356 leaves Anthemus out and olynthus-356 holds it (Ellis ch. 14 §V: ceded to the League about 357/356) — the brief's chain rule bends here as it does for Pisidia.
- Map-auditor on 020: 8 wrong, 3 weak, 1 taste; all taken (cloud rulings). The Amphipolis–Philippopolis leg
  redrawn by Bosworth's Commentary (Xanthi, Philippi on the left — Arrian 1.1.5); the Getic town on the north bank;
  Pelium on the Illyrian side (Hammond), moving the Macedon zones' western edge near Little Prespa; 040 gets its own
  Thermopylae and Pelium markers; new zones.yaml entry macedon-335; Thessaly, Epirus and the League shown on the
  Danube page; Samos cut out of persia-336 and left bare (Athenian cleruchy from 365); Thespiae out of thebes-335;
  the route round Tempe by the coast. The 020 plan's two route lines corrected.
- cloud ruling, story-wide for the cartographer: (A) no zone name ends before its page's date; (B) a marker's note
  tells its page's event; (C) a page shows every zone its neighbours show for its frame unless the text tells a change.
- The user asked why builds fail (a page names a battle card before the implementor writes it). The process notes are in feedback.md at the repo root, to go with the pull request for review. The step 10 order is unchanged, since the user has not ruled on the fix.
- Cartographer drew 030 (7 pages) and applied every 010 and 020 map fix. cloud rulings: battle ids take the year
  (granicus-334, miletus-334, halicarnassus-334, and the same from 040 on), as harita's README and the first two
  cards do; persia-336 and league-337 get a zones.yaml entry per stage (persia-334a, persia-334, persia-333,
  league-335) because the build cuts a zone on every page where an outranking zone appears; macedon-334s accepted
  (rule A); the coastal notches for Pydna, Methone, Abdera and Maronea stand. Samos needed no change (persia's clip
  leaves Greece out). The brief's Map part now says so. Implementor on the three 030 cards, then the Granicus phases;
  cartographer on 040.
- The shared dev server (port 4321, process 9768) was stopped at the session's two-hour limit for background
  commands. It already had the longest timeout allowed, so it is not restarted. cloud ruling: from here each agent
  starts its own server with its own --out and port, as agents/pages.md allows when a dispatch names no port, and
  stops it when it finishes. Ports in use: cartographer 4331, battle-implementor 4332; later dispatches name their
  own (4333 and up).
- Implementor wrote granicus-334, miletus-334, halicarnassus-334 and, ahead of time, issus-333, tyre-332 and
  gaza-332, since the 040 pages already named them; harita check ok. It moved each card 11–27 km off its town to
  keep the town markers visible. cloud ruling, replacing the earlier marker rule: a card stands on the battle's
  sourced site (a siege at its town, a field battle where its battle plan draws the field), and a town marker on
  the same point comes off that page, its text link becoming plain text — a battle drawn in the wrong place
  misleads more than a missing town icon.
- Cards back on their sites (sieges on their towns, Granicus and Issus at their battle plans' frame origins); markers under them taken off those pages and their links made plain text. harita check ok. Map-auditor on 030 and battle-auditor on Miletus and Halicarnassus dispatched; implementor on the Granicus phases.

## Text format: disputed claims as notes (the user's ruling, 22 Nov 2026)

The user asked that disputed claims leave the main text and go into notes at the bottom, like the sources. The
rule for every English text of this story, overriding agents/text.md item 7's allowance for disputed figures:
- The body tells the story plainly. Where a claim is `disputed` (or `single` with a competing account), the body
  gives the account the map follows, or a neutral wording that holds for every account, and puts a marker
  straight after the sentence's full stop or the clause: `\*` for the first note, `\*\*` for the second, `\*\*\*`
  for the third. Write them escaped (`\*`), or Markdown makes them italics.
- After the body comes a heading `### Notes`, then one paragraph per note, starting with its marker (`\* ...`).
  Each note gives the competing accounts with their authors, and the figures, as the body used to.
- A page with no disputed claim has no Notes heading. `open` claims ("not known") stay in the body.
- Notes count toward no word limit; the body keeps to 150–300 words.
- The Notes heading renders as an h3 just above the Sources list (checked with marked; harita check and --places
  pass). Translators translate "Notes" with the text.
- First example: pages/040-issus-and-the-coast/020-issus/010-issus/text/en.md.
- Who applies it: the battle-implementor for phase texts from now on; the section reviewers convert every text of
  their section at step 12; the fact-checker checks the notes like the body.
- Battle-auditor: miletus-334 and halicarnassus-334 pass. A possible fault, the Halicarnassus routes not drawing, goes to the 030 map-auditor to confirm.
- Implementor built the Granicus phase pages and generator (.plans/granicus.mjs, lib.mjs from Punic Wars); check ok; texts in the notes format. Battle-auditor on Granicus; implementor on the Issus phases.
- Battle-auditor on Granicus: card right, phases in Arrian's order. Faults: the Spithridates marker note states Plutarch's account as fact (wrong); units crowd at phone size; p4 name — back to the implementor with Issus. The overview text's body disputes go to the 030 reviewer (notes format, step 12). The plan's stale names note stands (taste).
- Cartographer drew 040 (7 pages); harita check ok for the story. cloud rulings: persia-333b, -333c, -332, -331 and
  macedon-332a accepted; sochi-333b and sidon-332 (rule B) stand; Lycaonia out of macedon-333b — no source says it
  was taken, so it stays Persian as Pisidia does; the Miletus frame moved east so Lade clears card and legend.
- Agents' private dev servers have run the container to its file-watcher limit (ENOSPC). Dispatches now say to
  retry later or skip optional captures.
- Implementor built the Issus phase pages (.plans/issus.mjs) and fixed the Granicus faults (Spithridates note and phase-2 text now true to all accounts; spacing; p4 name). check ok. Battle-auditor takes Issus and the Granicus recheck after Tyre and Gaza. Implementor waits for the 050 pages (Gaugamela).
- Battle-auditor: tyre-332 and gaza-332 pass. Issus: the card and the rout text gave Arrian's 100,000-with-10,000-
  horse as all three authors' (wrong; Diodorus and Curtius add the horse on top) — from digest line 040.9; the
  implementor fixes card and text, the researcher fixes 040.9. Issus bbox tightened and the phase-3 clash moved
  onto the mercenaries. cloud rulings: Old Tyre as a label beside the card stands; the Thessalians in Macedon's
  colour stand (allies). The Tyre text's disputed losses go to the notes pass at step 12. Granicus recheck: two
  fixes hold; the Amyntas marker moves further west.
- Map-auditor on 030: 3 wrong, 4 weak, 4 taste; all taken (cloud rulings). Myndus, Caunus and the Cnidian
  peninsula out of macedon-334/333 (held for Persia until summer 333, Arrian 2.5.7); the triangle gap in macedon-
  333/333b/333c closed; hellespont shows the Greek and Thracian zones (rule C); the Halicarnassus frame widened;
  Zeleia 15 km up the Aesepus; lycia-pamphylia dated winter 334 – spring 333 BC; Sillyum out of Alexander's lands
  (careful side, Arrian 1.26). The Halicarnassus routes not drawing is a headless-capture artefact (old frame), not
  a content fault — in feedback.md for a real-browser check. Brief Sections widened to 030 for the zones on the
  context page.
- Image-finder 040: 16 images. cloud ruling: the Gaza page stays without an image and its card with one (Carline) — no Gaza image with an allowed licence was found after two searches.
- Implementor fixed the Issus faults (card and rout text give the Persian dead by author; bbox tightened; phase-3 wheel ends on the mercenaries; Granicus Amyntas marker moved). Build now fails on the 050 cards; implementor writes gaugamela-331, persian-gate-330 and megalopolis-330 first, then the Gaugamela phases. Issus battle plan brought into line by its coordinator.
- Implementor wrote gaugamela-331 (on the field), persian-gate-330 (at Bosworth's gorge, a reconstruction) and megalopolis-330 (on the town; date 'probably spring 330 BC; some put it in late 331'); markers under them taken off and unlinked. Story check ok.
- Map-auditor on 040: 3 wrong, 2 weak, 4 taste. cloud rulings: macedon-332a gets its own outline with the coast to
  opposite Tyre (Old Tyre in) and Cyprus (Arrian 2.18, 2.20.3), the island city out (it fell only at the end of the
  page's span), and the page gets its own Persian stage persia-332a; the Gaza page then adds only Tyre and the
  coast; the fleet goes up the Nile to Memphis (Arrian 3.1.3); the Cappadocian route by Lake Tatta (Bosworth);
  aradus-333 off the Damascus page; the Mareotis bend and valley roads taken; the Issus marker beside the card
  stands; the Aegean islands stay blank (persia's clip leaves out Greece). names.md: the Amanian Gates are the pass
  of Toprakkale (Bosworth).
- The cartographer's generators (zones, page and route scripts) were only in the session scratchpad. The overseer copied them into .plans/ (zones.cjs, router.cjs, pages010–050.cjs) and committed them; the cartographer works from those copies from now on. Other stories keep their zone generator in .plans/zones.mjs.
- Battle-auditor: megalopolis-330 card passes; Issus fixes hold; Granicus Amyntas resolved at taste level. The Megalopolis text's disputes and its 'more than 5,300 in both' (Curtius gives 5,300) go to the 050 reviewer at step 12. cloud ruling: the Sparta marker half under the card stands, as Old Tyre.
- Implementor built the Gaugamela phase pages (.plans/gaugamela.mjs; bbox now boxes the drawn points, Darius's flight shortened to fit; minor commanders limited as ruled) and narrowed the Issus frame. Story check ok. Battle-auditor on Gaugamela; implementor on the Persian Gate phases.
- Battle-auditor: gaugamela-331 card and phases pass. The overview text's disputes go to the 050 reviewer (notes pass, step 12); phone framing and an Ariston/Aretes note go to the implementor with the Persian Gate.
- Implementor built the Persian Gate phase pages (.plans/persian-gate.mjs; the camp as its trench; dawn guard posts folded into Alexander's arrow) and the Gaugamela Ariston/Aretes note; the Gaugamela phone framing stays as it is (trimming barely helped). Story check ok. Battle-auditor on the Persian Gate.
- Cartographer drew 050 and applied every 030 and 040 map fix; story check ok; it works from the committed
  scripts. cloud rulings: league-331 (Agis's alliance would cut league-337 on every page) and persia-331b, -330a,
  -330 accepted; fleet-332b is a river route up the Nile to Memphis.
- Story rules gathered into .plan/rules.md, so fresh agents start from them (feedback item 11). From 060 on a fresh
  cartographer takes the sections from the committed scripts and rules.md; the first cartographer (about 470k
  tokens) stops after 050.
- Battle-auditor: persian-gate-330 card and phases pass the rulings. The dawn text reversed Arrian's proportions (wrong) — implementor fixes; phone framing tightened to wall and camp; skull marker added. The overview's disputes go to the step-12 notes pass. A fresh battle-implementor takes the 060–090 battles.
- First cartographer stopped after 050 and left .plan/cartography-notes.md. A fresh cartographer takes 060–090 from rules.md, the notes and the committed generators.
- First implementor fixed the Persian Gate (dawn text true to Arrian 3.18.7–9; tighter frames on the assault and dawn; skull marker), left .plans/IMPLEMENTOR-NOTES.md, and stops. Battle-auditor rechecks.
- Battle-auditor recheck: the Persian Gate fixes pass. The dawn page's commander markers covering their blocks on a phone (taste) go to the fresh implementor; the assault frame leaving out the camp at Mullah Susan stands.

## Step 12: facts and review (section by section)

- Started for 010–040 as soon as each had its maps, battles and images, rather than after the whole story; the
  fact-checkers report disputed claims argued in the body for the reviewers' notes pass.
- Image-finder 050: 17 images; Commons throttled most file-page reads, so several captions rest on the candidate index — to the 050 fact-checker (the unfinished tomb's attribution to Darius III especially).
- Map-auditor on 050: 4 wrong, 4 weak, 1 taste. cloud rulings: macedon-330's Media meets Persis through
  Paraetacene and ends short of Hecatompylus (careful side: Darius died short of the city); tigris-crossing-331 and
  arbela-331 off the Gaugamela overview (under the card); persian-gate-330 and megalopolis-330 out of pages050.cjs;
  Megalopolis drops epirus-350 and illyrians-335; babylon-and-susa widened west to the Euphrates; the mountain
  Uxians stay blank until macedon-330a (Arrian 3.17.1: never subject to Persia); markers take the colour of the
  holder (pages.md). Bessus's kingdom is renamed persia-330b in the brief and the 060 plan, because persia-330 is
  the Persian stage entry on the death-of-darius page.
- Fact-checker 020: one wrong (Pindar spared by Alexander, not the allies' vote), notes-format and close-wording faults, and seven captions beyond their Commons pages. Section-reviewer 020 dispatched with the text faults; image-finder 020 fixes the captions (the Davis drawing replaced or removed: no author or date shown, so no public-domain basis).
- Fact-checker 030: two wrong (the twenty days to Sestos count from home, Arrian 1.11; Sillyum held out), notes-format, hedging and close-wording faults. cloud ruling: 030.1 goes disputed — Briant counts as a scholarly source that disputes Bagoas's role (careful side). Reviewer 030 dispatched; researcher fixes 030.1 and 030.4; marker notes queued for the cartographer and card fixes for the next implementor.
- Image-finder 020 fixed its captions; the Davis drawing (no author or date, no public-domain basis) was replaced by a CC0 Attic krater of Thracians charging.
- Fact-checker 040: no wrong faults; notes-format, sources and close wording to reviewer 040. cloud rulings: Diodorus's crossing army is given as 30,000 foot by his total, with his list adding to 32,000 (textual crux, Bosworth's Commentary); the Gaza card gets Curtius's 10,000 Persian and Arab dead, named (a source gives it, so the card's silence is not the careful side); Curtius's Issus strength gets a digest line.
- Fact-checker 010: one wrong, in a marker note (Perinthus besieged to spring 339) — queued for the cartographer with two other notes; text faults to reviewer 010; seven captions beyond their Commons pages to image-finder 010 (Mieza and the larnax hedge pass).
- Researcher added Curtius's Issus contingents (040.8) and Diodorus's 30,000/32,000 crux (030.3); quotes-check ok, 570 quotes.
- Overseer trimmed 'whose leading city was Olynthus' from the Chalcidian League coin caption: no source line or Commons page gives it.
- Reviewer 020 fixed every fact-check fault and moved the disputes into Notes (bodies 298–300 words). cloud ruling: two look-alike image pairs in different chapters stand. Fact-checker rechecks the 020 pages; two date labels queued for the cartographer.
- Fact-checker 020 recheck: earlier faults all resolved; two new weak faults (a note too close to Hammond and Bosworth; Pindar's century unsourced) fixed by the overseer. Section 020 passes step 12.
- Reviewer 030 revised all ten texts (notes, Hellespont count from home, Sillyum, Bosworth's 1988 view limited to the hour, island citadel in a note). Its map faults were already queued for the cartographer. cloud ruling: look-alike image pairs stand. Fact-checker rechecks 030.
- Correction to the cloud ruling on Diodorus's crossing army (030.3): the manuscripts' total reads 30,000 foot
  (Chinnock, Bosworth), Welles prints 32,000, the foot contingents add to 32,000 and the cavalry contingents to
  5,100 against a total of 4,500. Texts now say "about 32,000 foot and 4,500 horse, though his totals and his list
  of contingents do not quite agree" — true for every reading. The earlier "30,000 by his total, list 32,000" was
  half right and is withdrawn.
- Fact-checker 030 recheck: the Diodorus ruling (above) and four small hedges (Darius "a cousin"; Bosworth's view
  of the island citadel; Sillyum "never taken"; Welles's wording on Mytilene) fixed by the overseer as proposed.
  Section 030 passes step 12. The halicarnassus-334 card's "Arconnesus" goes to the next implementor.
- Reviewer 010 fixed all 16 faults (disputes in Notes; bodies 270–300). Pangaeum note already queued; a Thermopylae marker for Chaeronea queued; look-alike images stand. Fact-checker rechecks 010.
- Reviewer 040 fixed all 22 faults (disputes in Notes; bodies ≤300). Its map points (Issus crowding at phone size,
  missing place markers) queued for the cartographer; the Issus card's Diodorus figures for the implementor;
  look-alike images stand. Fact-checker rechecks 040.
- Fact-checker 010 recheck: one unquoted Justin phrase, recast by the overseer. Section 010 passes step 12.
- The page scripts write page.yaml `sources`, so a rerun would wipe the reviewers' additions; the cartographer is
  told to keep them and note it in cartography-notes.md.
- Fact-checker 040 recheck: one sentence (most survivors sold — Arrian's account only) reworded by the overseer to 'many', with Diodorus's 13,000 captives and Curtius's 15,000 saved added to the note. Section 040 passes step 12. Sections 010–040 have all passed step 12.
- Fresh cartographer drew 060 (6 pages) and applied the 050 fixes; page scripts now keep reviewers' sources.
  cloud rulings: macedon-327 and persia-329 (zones.yaml entries) and the split Maracanda routes accepted; the
  mountain Uxians come out of persia-336's base outline (careful side, Arrian 3.17.1) so every stage leaves them
  out. A fresh battle-implementor writes the 060 cards and the queued card fixes; the cartographer takes 070 and
  the queued marker notes; map-auditor on 060.
- Fresh implementor wrote jaxartes-329, polytimetus-329 and sogdian-rock-327 (markers off the pages and out of pages060.cjs) and applied the six queued card and generator fixes; story check ok. Battle-auditor on the 060 cards and the fixes; image-finder 060 and fact-checker 050 dispatched.
- Battle-auditor: the 060 cards pass; five queued fixes hold. The Issus card fix went wrong because the overseer's
  instruction read as replacing whole fields — the other authors' figures were dropped. The overseer restored the
  previous card and made only the three intended edits (Diodorus's crossing figure with its caveat; Diodorus's
  Persian "more than 400,000 foot and at least 100,000 horse", which the source file confirms; Ptolemy, son of
  Seleucus, named under Arrian). The Sogdian Rock card's date now gives Bosworth's summer 328 beside Arrian's
  spring 327. The 060 texts' disputes and lengths go to the 060 reviewer at step 12.
- Map-auditor on 060: 2 wrong, 5 weak, 1 taste; all taken (cloud rulings): a rebel stage on the Maracanda page
  without Maracanda, Nautaca and the column-held land (Arrian 4.16–17; Bosworth XIII); Alexandria Eschate off the
  Jaxartes page (under the card); the three battle-site markers under their cards dropped; rule B ids for Eschate on
  040 and Nautaca on 060; Maracanda out of the rebel zone after its relief; the 328 route east up the Oxus by
  Ai-Khanum and down the Zeravshan (Bosworth, careful side). Queued for the cartographer after 070. Brief row
  macedon-327 added by the overseer.
- Fact-checker 050: four wrong in the texts (Megalopolis dead in Curtius 5,300; the Gaugamela halt the day before; the Persian Gate split near Persis, not at Susa; Hecatompylus is Curtius's), and weaker attribution, wording, notes and sources faults. cloud ruling: Darius's death date (050.24) goes disputed — Bosworth argues August against Arrian's July. Reviewer 050 dispatched; digest, cards, captions, plan and marker notes sent to their owners.
- Image-finder 050 fixed the tomb and Persian Gate captions; image-finder 060 placed 18 images (two per page and card).
- Reviewer 050 converted the six overviews to Notes and fixed the four wrong faults. Lean mode from here (user's
  token concern): taste faults are logged, not fixed — Megalopolis's Crete marker and look-alike coins stand.
  Marker notes (Rhagae, Ecbatana) queued for the cartographer; digest 050.15 corrected for Curtius's 5,300.
  Fact-checker rechecks 050.

## Lean mode (from the 050 review on)

- The user noted the run had used about 20% of the weekly tokens. cloud ruling: finish in lean mode — fresh agents
  per section from rules.md instead of long resumes; minimal captures; only wrong and weak faults acted on, taste
  logged; one-line rechecks done by the overseer; short reports. Every pass of the process still runs.
- Fact-checker 050 recheck: pass. The overseer made its one taste fix (Bosworth "inclines to" August). Section 050
  passes step 12. To report to the user: San José Campos says most modern historians follow Borza's autumn 331 for
  Megalopolis; the page keeps Bosworth and Badian's early 330 (the brief's order, 050.15) and the note gives the
  other view openly.
- Cartographer 2 drew 070 (7 pages; rivers from Natural Earth via .plans/rivers.cjs; indians-327 cut back by stage
  entries indians-326, -326b, -325) and cleared its whole queue: the 060 fixes (sogdians-329b, sogdians-328 with
  macedon-329c and macedon-328; markers; the 328 route by Ai-Khanum), the Uxian hills cut from persia-336 itself,
  and the 010–040 marker notes and new markers. cloud rulings: alexander-327b, uncoloured carmania-325 and the
  Pillar of Jonah left off accepted; Maracanda's marker on 040 should take the macedon colour (new id, queued).
  Lean mode: a fresh cartographer takes 080 and 090.
- Fact-checker 060: three wrong (Alexander pursued the Saka before the sickness stopped him; Curtius has Bessus handed to Darius's brother; the coenus-328 note's 'last battle'), and notes, hedge and wording faults. Fresh reviewer 060 dispatched; marker and date fixes to the cartographer and the card; the overseer dropped 'an engraving' from the Castaigne caption.
- Map-auditor 070: 2 wrong (rule B on the Taxila, Nicaea and Bucephala markers), 2 weak (the Indus bridge id; the fleet's end short of the Ocean). cloud ruling: the Indus valley above the confluence goes into macedon-325a as Philip's satrapy (Arrian 6.15; Bosworth) — the sources point that way. Queued for the fresh cartographer after 080; the 070 plan updated by its coordinator.
- Token ledger: .../scratchpad/overseer/bin/tokens.py sums every subagent's usage from its transcript; the overseer's own comes from the session transcript. To be reported at the end with the pull request.
- Reviewer 060 fixed all 13 faults (disputes in Notes; bodies 256–300). cloud ruling: the Sogdian Rock page keeps four notes (four separate disputes). Three marker notes to the cartographer; the plan's Bessus line made Arrian's alone by the overseer. Fact-checker rechecks 060.
- Fact-checker 060 recheck: every text fault fixed. The Polytimetus card date set to '329 BC' by the overseer; the 010-phrada page date 'Summer–autumn 330 BC' goes to the cartographer (generated file). Section 060 passes step 12.
- Cartographer 3 drew 080 (6 pages; macedon-325 adds Gedrosia and Ora) and cleared the queue (050 and 060 notes
  and dates, maracanda-329b, the five 070 items with macedon-325a taking the upper Indus). cloud ruling: Carmania
  goes into macedon-325 (Arrian 6.27–28: satraps appointed there), so the 080 pages set in Carmania show it held.
  Map-auditor and image-finder on 080; cartographer on 090. Phone-size captures crash headless Chrome now; captures
  are at desktop size (feedback.md).
- Implementor wrote aornos-327, hydaspes-326 and malli-325 (markers under them off the pages and out of pages070.cjs) and the Hydaspes phase pages (.plans/hydaspes.mjs; frame turned to 165° to fit the drawn Jhelum; legibility sizes in no text); the Gaugamela deployment date set. cloud rulings: those changes accepted; the two 010-hydaspes route ends 5–9 km short of the card logged (taste, lean mode). Fresh battle-auditor on the 070 battles; image-finder 070.
- cloud ruling: the Castaigne drawing on 080.040 is captioned "Alexander quelling a mutiny", without "at Opis" — its printed caption names no place and it may show the Hyphasis mutiny; only the Commons title says Opis.
- cloud ruling: 080.1 Engels's reading of the Gedrosian march stays in the body, named as his — the digest marks it single, not disputed, and the Notes rule covers disputed claims only.
- cloud ruling (lean mode): the three 090 cards (no phase pages) are checked by fact-checker 090 instead of a separate battle-auditor pass — they hold only figures and sites, which the fact-check covers; the map audit covers their sites.
- cloud ruling: Crannon card dated "Summer 322 BC" — Bosworth (July), Hammond and Walbank (late August) and Geer (5 September) differ; the text's note gives each. Digest 090.6 corrected to 321 BC for the invasion of Egypt, per Bosworth's own appendix.
- cloud ruling: battle strengths already on the 090 cards (Crannon, Gabiene, Ipsus, including Plutarch's 400 elephants against 75) are cut from the 020, 040 and 060 texts to keep the bodies within 300 words — the card tells them beside the page; the plan's ask for the elephants in 060's text lapses. Disputed claims the 090 plan says the body tells now sit in Notes, per the Notes rule.
- cloud ruling: Ptolemy's zones take Cyrenaica from late 322 BC (new digest line 090.34: Diodorus 18.21.9, Hammond and Walbank ch. V.4); ptolemaic-323 stays Egypt alone for 010 and 020, a new stage ptolemaic-322 carries it from 030. Brief rows added or changed: ptolemaic-322, ptolemaic-319, ptolemaic-301, greeks-323 (Diodorus's full list, his three exceptions left out), seleucid-301 (Tyre and Sidon left out), macedon-320 — the 090 map audit found them against the sources.
- Story-auditor (step 14): 5 weak, 0 wrong. The overseer fixed all five: Hydaspes 'April or May by Arrian's dating' (texts and card, Munychion per Chinnock); Granicus card Diodorus caveat; Ipsus result names the four-king coalition; 'Diodorus says' on Cappadocia never conquered; Cyrene added on 090.030 for the ptolemaic-322 change (Diodorus 18.21 added to sources). Auditor rechecks.
- cloud ruling: step 14 passes — harita check ok, quotes-check ok (575), story-auditor pass. npm run build -- --strict fails on one error only: the asset store holds no upload of alexander-the-great (latest.json 404). The upload (kitap upload --story alexander-the-great) needs store credentials and publishes outside the repo, so it is left to the maintainer after images-pack unpack; the story itself writes dist/alexander-the-great with 71 pages.

## Page order: no flashback (the user's ruling, 23 Nov 2026)

- A page never starts before the page ahead of it. "The Persian Empire of Darius III", dated 336 BC, stood as
  the first page of section 030, after the fall of Thebes in September 335 BC. It moves to the end of section
  010, as `010-macedon-rising/070-achaemenid-empire`, after Philip's murder in 336 BC and before Alexander's
  first year. Its id, text, zones and markers are unchanged, and no name it uses is introduced in section 020.
  Its claims keep their ids, 030.1 and on, and its plan stays in `030-asia-minor.md`: the plans are not written
  again for a move. `names.md` gives section 010 for the eight names it is the first to use, and
  `.plans/pages030.cjs` writes it to its new folder.
- "Agis III and the war for Megalopolis" (`050-gaugamela-and-persia/050-megalopolis`) was dated summer 331 to
  spring 330 BC and opened "This page goes back to Greece in summer 331 BC", after "Persepolis", which starts in
  January 330 BC. It keeps its place and is dated "Early 330 BC", the date of the battle by the account it
  follows (Bosworth, Badian; its note gives the others). Its map already showed the state of 330 BC
  (`macedon-330a`), so moving it after "Gaugamela" would have shown that state a year early. The text now stands
  in early 330 BC and tells the war's beginning in summer 331 BC as what came before, in the past tense: the
  first sentence is new, and six verbs of the second paragraph changed tense. No date, name, figure or
  attribution changed. No fact-checker has read the page since: the source files were not on the machine.
- Three pages keep a year alone that follows a page of a season in the same year: `polytimetus` ("329"),
  `cophen` ("327") and `lamian-war` ("323–322"). They are in order as told, and each takes a month when the pages
  get a `when`.
