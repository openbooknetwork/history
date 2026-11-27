// Writes the three phase pages of the battle of Patay, 18 June 1429: page.yaml, markers.yaml. Change them here
// and run it again: `node content/joan-of-arc/.plans/patay-1429.mjs` from the repo root.
//
// The plan is .plan/040-the-loire-and-reims/battles/patay-1429.yaml. Where on the plain of the Beauce the fight
// was is disputed (040.39), and rules.md has the plan take one place and mark it a reconstruction: the road
// running due north into Patay, the line of the English march from Meung, the vanguard's hedges at the south edge
// of the village about [1.700, 48.044], and Talbot's narrow way between two hedges about 2.5 km south of them on
// the same road, about [1.700, 48.022]. No river, stream or lake bounds the field, so it has no water. The woods
// the stag breaks from (040.28) stand beside the road; their place and size are a reconstruction, west of the road
// between the narrow way and the main body's place in the stag's phase. The widths of the hedges and of the narrow
// way are unknown and chosen to read on the map; no text gives them.
//
// Frame: origin at the vanguard's hedges, u due north up the road (the English march), w east. The English face
// south (face 180), back down the road the French come up; the French face north (face 0).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { frame, planWriter } from '@openbooknetwork/harita/plans';

const STORY = fileURLToPath(new URL('..', import.meta.url));
const writePlan = planWriter(STORY);
const SECTION = 'pages/040-the-loire-and-reims';

const f = frame([1.700, 48.044], 0), P = f.p, ENG = f.face(180), FR = f.face(0);
const bbox = f.box([[-6600, -2300], [1500, 2300]], 0);

const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- the ground, the same on every phase ---
const works = [
  { side: 'neutral', path: f.path([[-30, -650], [0, -200], [10, 250], [-20, 650]]), width: 40, id: 'patay-hedges', name: 'The hedges near Patay' },
  { side: 'neutral', path: f.path([[-2750, -240], [-2150, -240]]), width: 40, id: 'narrow-way', name: 'The two strong hedges of the narrow way' },
  { side: 'neutral', path: f.path([[-2750, 240], [-2150, 240]]), width: 40, id: 'narrow-way', name: 'The two strong hedges of the narrow way' },
];
const woods = unit('neutral', 'irregular', -2300, -1050, 2000, 600, f.face(90), 'woods', 'Woods beside the road; their place is approximate');

// The English units that stand still from phase to phase.
const vanguard = unit('english', 'infantry', 170, 0, 900, 200, ENG, 'english-vanguard', 'English vanguard under a knight with a white standard, behind the hedges');
const train = unit('english', 'wagons', 480, 0, 700, 200, ENG, 'english-train', 'The English train: artillery, victuals and merchants', { rows: 2 });
const archers = unit('english', 'archers', -2450, 0, 380, 200, ENG, 'talbot-archers', 'Talbot on foot with 500 picked archers (Wavrin), holding the narrow way');

const village = (page, note, color = 'english') => ({ [`${page}-patay`]: mark(720, -480, 'Patay', note, color, 'map-pin') });

// The page keys the generator owns besides the plan: title, date, when, no zones (a close battle view shows
// none), and the sources of the phase.
const SOURCES = {
  wavrin: "Jean de Wavrin, Recueil des croniques; Perceval de Cagny, Chroniques; the Journal du siège d'Orléans; Guillaume Gruel, Chronique d'Arthur de Richemont; in J. Quicherat (ed.), Procès de condamnation et de réhabilitation de Jeanne d'Arc, vol. 4 (1847).",
  murray: "T. Douglas Murray (ed. and tr.), Jeanne d'Arc, Maid of Orleans (1902), the deposition of Louis de Coutes.",
  murrayDunois: "T. Douglas Murray (ed. and tr.), Jeanne d'Arc, Maid of Orleans (1902), the deposition of Dunois.",
  monstrelet: 'E. de Monstrelet, Chronicles, tr. T. Johnes (1849), book 2, ch. 61.',
  ramsay: 'J. H. Ramsay, Lancaster and York, vol. 1 (1892), ch. 27.',
  oman: 'C. Oman, A History of the Art of War in the Middle Ages, vol. 2 (1924), book 14, ch. 2.',
  lowell: 'F. C. Lowell, Joan of Arc (1896), ch. 10.',
  france: 'A. France, The Life of Joan of Arc, vol. 1 (1909), ch. 16.',
};
const q = s => JSON.stringify(s);
function page(dir, title, sources) {
  const file = path.join(STORY, SECTION, dir, 'page.yaml');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [
    '# Written by content/joan-of-arc/.plans/patay-1429.mjs. Change it there and run it again.',
    `title: ${q(title)}`, 'date: "18 June 1429"', 'when: 1429-06-18', 'zones: []', 'routes: []', 'sources:',
    ...sources.map(s => `  - ${q(SOURCES[s])}`), '',
  ].join('\n'));
  return `${SECTION}/${dir}`;
}

// --- 1. the hedges: the English halt within a league of Patay and post themselves; the French ride after them ---
writePlan(page('031-patay-the-hedges', 'Patay: the hedges', ['wavrin', 'murray', 'monstrelet', 'ramsay', 'lowell', 'france']), {
  bbox,
  emblem: {
    works,
    units: [woods, vanguard, train, archers,
      unit('english', 'infantry', -1300, 0, 350, 500, FR, 'english-main-body', 'English main body under Fastolf, Talbot and Sir Thomas Rempston, marching on to join the vanguard'),
      unit('english', 'infantry', -1950, 0, 300, 250, FR, 'english-rearguard', 'English rearguard, closing up behind the main body; its place is approximate'),
      unit('france', 'cavalry', -4700, 0, 260, 200, FR, 'french-scouts', 'French scouts, 60 or 80 of the best mounted (Wavrin)'),
      unit('france', 'knights', -5400, 0, 600, 200, FR, 'french-vanguard', 'French vanguard under La Hire and Poton de Xaintrailles, 1,400 to 1,500 (the Journal of the Siege)'),
      unit('france', 'cavalry', -6200, 0, 1100, 300, FR, 'french-main-body', 'French main body under Alençon and the Bastard of Orléans, with Joan; 8,000 to 9,000 (Monstrelet)'),
    ],
    arrows: [
      arrow('english', [[-3000, 300], [-2500, 1250], [-900, 1300], [-80, 450]], 90, 'english-vanguard-march', 'The English vanguard and train go ahead to the hedges near Patay'),
      arrow('english', [[-3700, -150], [-2900, -340], [-2000, -340], [-1580, -120]], 90, 'english-main-body-march', 'The English main body passes the narrow way and leaves Talbot there'),
      arrow('france', [[-6050, -700], [-5200, -760], [-4300, -620]], 100, 'french-pursuit', 'The French ride north after the English'),
    ],
  },
  markers: {
    ...village('patay-the-hedges', 'The English vanguard posts at its hedges'),
    'patay-the-hedges-talbot': mark(-2450, 700, 'Talbot', '500 archers hold the narrow way', 'english'),
    'patay-the-hedges-fastolf': mark(-1100, 950, 'Fastolf', 'Mounted, with the main body', 'english'),
    'patay-the-hedges-la-hire': mark(-5400, 680, 'La Hire, Xaintrailles', 'The French vanguard', 'france'),
    'patay-the-hedges-alencon': mark(-6200, 900, 'Alençon, the Bastard', 'The main body; Joan with it', 'france'),
  },
});

// --- 2. the stag: the English give themselves away, and the French vanguard rides down Talbot ---
writePlan(page('032-patay-the-stag', 'Patay: the stag', ['wavrin', 'monstrelet', 'ramsay', 'oman', 'lowell', 'france']), {
  bbox,
  emblem: {
    works,
    units: [woods, vanguard, train, archers,
      unit('english', 'infantry', -1000, 0, 350, 500, FR, 'english-main-body', 'English main body under Fastolf and Rempston, hurrying north to the hedges'),
      unit('english', 'infantry', -1450, 0, 300, 250, FR, 'english-rearguard', 'English rearguard at the tail of the main body; its place is approximate'),
      unit('france', 'cavalry', -3300, -350, 260, 200, FR, 'french-scouts', 'French scouts, 60 or 80 (Wavrin): they hear the shout and send word back'),
      unit('france', 'knights', -2690, 0, 400, 200, FR, 'french-vanguard', 'French vanguard under La Hire and Xaintrailles, 1,400 to 1,500 (the Journal of the Siege), in the narrow way'),
      unit('france', 'cavalry', -4400, 0, 1100, 300, FR, 'french-main-body', 'French main body under Alençon and the Bastard of Orléans, 8,000 to 9,000 (Monstrelet), galloping up'),
    ],
    arrows: [
      arrow('neutral', [[-1500, -720], [-1380, -420], [-1150, -200]], 60, 'stag', 'A stag breaks from the woods into the English ranks'),
      arrow('france', [[-4150, 200], [-3500, 180], [-2760, 60]], 110, 'french-vanguard-charge', 'The French vanguard gallops into Talbot’s narrow way'),
      arrow('france', [[-6100, 650], [-5300, 750], [-4600, 600]], 100, 'french-main-body-up', 'The French main body gallops up behind its vanguard'),
      arrow('english', [[-1450, 400], [-1000, 430], [-500, 300]], 80, 'english-main-body-hurry', 'The English main body hurries north to join the vanguard'),
    ],
    clashes: [{ at: P(-2570, 0), size: 220 }],
  },
  markers: {
    ...village('patay-the-stag', 'The English vanguard at its hedges'),
    'patay-the-stag-talbot': mark(-2300, 560, 'Talbot', 'Taken; his archers killed', 'english'),
    'patay-the-stag-fastolf': mark(-1100, 950, 'Fastolf', 'Hurries on with the main body', 'english'),
    'patay-the-stag-la-hire': mark(-3150, 600, 'La Hire, Xaintrailles', 'Ride down Talbot', 'france'),
    'patay-the-stag-alencon': mark(-4400, 900, 'Alençon, the Bastard', 'The main body gallops up', 'france'),
  },
});

// --- 3. the rout: the English vanguard flees the hedges, the main body breaks, Fastolf rides off ---
writePlan(page('033-patay-the-rout', 'Patay: the rout', ['wavrin', 'murrayDunois', 'monstrelet', 'ramsay', 'oman', 'france']), {
  bbox,
  emblem: {
    works,
    units: [woods, train,
      unit('english', 'infantry', -1000, 0, 400, 450, ENG, 'english-main-body', 'English main body, broken: the French take or kill whom they will (Wavrin)'),
      unit('english', 'cavalry', 780, 1480, 220, 200, f.face(45), 'fastolf-company', 'Fastolf with a small company, riding for Étampes'),
      unit('france', 'knights', -1430, 0, 500, 250, FR, 'french-vanguard', 'French vanguard under La Hire and Xaintrailles, 1,400 to 1,500 (the Journal of the Siege), in among the English main body'),
      unit('france', 'cavalry', -1950, 0, 1000, 300, FR, 'french-main-body', 'French main body under Alençon and the Bastard of Orléans, 8,000 to 9,000 (Monstrelet), joining the rout'),
    ],
    arrows: [
      arrow('english', [[250, -250], [800, -50], [1250, 400]], 90, 'english-vanguard-flight', 'The English vanguard leaves the hedges under its white standard', 'dashed'),
      arrow('english', [[-700, 120], [-250, 200], [150, 700], [650, 1350]], 70, 'fastolf-ride', 'Fastolf rides for the vanguard, then turns away for Étampes', 'dashed'),
      arrow('english', [[-950, 280], [-650, 1000], [-50, 1700], [500, 2100]], 90, 'english-fugitives', 'Fugitives run north-east for Janville, which shuts its gates on them', 'dashed'),
      arrow('france', [[-2500, -380], [-1950, -620], [-1360, -300]], 100, 'french-vanguard-press', 'The French vanguard presses into the English main body'),
      arrow('france', [[-3800, 250], [-2800, 450], [-2150, 250]], 100, 'french-main-body-up', 'The French main body comes up and joins the rout'),
    ],
    clashes: [{ at: P(-1265, 0), size: 240 }],
  },
  markers: {
    ...village('patay-the-rout', 'The French lie here that night', 'france'),
    'patay-the-rout-fastolf': mark(1150, 950, 'Fastolf', 'Rides off for Étampes', 'english'),
    'patay-the-rout-la-hire': mark(-1450, 1100, 'La Hire, Xaintrailles', 'Press into the main body', 'france'),
    'patay-the-rout-alencon': mark(-2050, 950, 'Alençon, the Bastard', 'Join the rout', 'france'),
  },
});

console.log('patay-1429: bbox', JSON.stringify(bbox), 'hedges at', JSON.stringify(P(0, 0)), 'narrow way at', JSON.stringify(P(-2450, 0)));
