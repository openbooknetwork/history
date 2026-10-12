// Vítkov, 14 July 1420. Žižka's two timber blockhouses stand on the western end of the long ridge east of Prague,
// behind a wall of earth and stones and three shallow ditches across the narrow neck (Laurence of Březová, Czech
// Wikipedia). The crusaders gather on the Spital field, today Karlín, ride up the gentle east end of the hill and
// attack westward along the ridge. A sally from the New Town by the Mountain Gate climbs the vineyards on the south
// slope into their flank and drives them over the steep north edge. The ridge, the Spital field and the Vltava
// follow the EU-DEM elevation tiles; the New Town wall runs where Wilsonova street runs today.
// Frame: origin on the western knob of the ridge, u along the ridge to the east-north-east, w down the south slope.
import { frame, writePlan } from './lib.mjs';

const f = frame([14.4505, 50.0887], 80), P = f.p;
const G = 'pages/040-crusade-1420/020-vitkov';
const bbox = [14.4445, 50.0845, 14.4695, 50.0995];
// face(0) runs east along the ridge, face(90) down the south slope
const EAST = f.face(0), SOUTH = f.face(90), WEST = f.face(180), NORTH = f.face(-90);
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const at = (side, type, lnglat, width, depth, facing, id, name, extra = {}) => ({ side, type, at: lnglat, width, depth, facing, id, name, ...extra });
// arrow points are [lon, lat] near Prague or [u, w] in the frame
const isLngLat = ([a, b]) => a > 14 && a < 15 && b > 50 && b < 51;
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts.map(q => isLngLat(q) ? q : P(...q)), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const markAt = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
const tactic = (u, w, label, note, color = 'taborites') => mark(u, w, label, note, color, 'lightbulb');

const water = [{ path: [[14.424, 50.0947], [14.432, 50.0952], [14.437, 50.096], [14.442, 50.0968], [14.447, 50.0973], [14.451, 50.098], [14.4545, 50.0993], [14.457, 50.1008], [14.4585, 50.103], [14.459, 50.106]],
  width: 170, id: 'vltava', name: 'The Vltava. The crusader camps lie on the far bank' }];
const works = [
  { side: 'prague', path: [[14.4383, 50.0948], [14.4366, 50.0906], [14.4345, 50.0866], [14.4322, 50.0826], [14.4307, 50.0796], [14.4292, 50.0772]], width: 18, id: 'town-wall',
    name: 'The wall of the New Town of Prague, with the Poříčí Gate at its north end and the Mountain Gate at its south end' },
  { side: 'taborites', path: f.path([[100, -80], [100, 80]]), width: 16, id: 'wall', name: 'A wall of earth and stones across the ridge' },
  ...[150, 200, 250].map(u => ({ side: 'taborites', path: f.path([[u, -75], [u, 75]]), width: 9, style: 'trench', id: 'ditches', name: 'Three shallow ditches across the neck of the ridge, where only a few horsemen fit side by side' })),
];
const blockhouses = [
  unit('taborites', 'fort', -95, 0, 80, 80, EAST, 'blockhouses', 'Two timber blockhouses that Žižka has built on the western end of the ridge, next to the gallows'),
  unit('taborites', 'fort', -10, 0, 70, 70, EAST, 'blockhouses', 'Two timber blockhouses that Žižka has built on the western end of the ridge, next to the gallows'),
];
const DEFENDERS = 'Žižka’s men in the works: 26 men, two women and a girl by Laurence of Březová, with stones, spears and flails';
const defenders = unit('taborites', 'infantry', 55, 0, 130, 45, EAST, 'defenders', DEFENDERS);
const MEISSEN = 'The men of Meissen and the Austrians under Heinrich of Isenburg: 7,000 to 8,000 horse by Laurence of Březová';

// --- overview: Prague under siege ---
writePlan(`${G}/010-vitkov`, {
  markers: {
    'crusader-camps-1420': markAt([14.4255, 50.1035], 'Crusader camps', 'From Prague Castle to Bubny', 'empire', 'flag'),
    'vysehrad-castle-1420': markAt([14.418, 50.0645], 'Vyšehrad', 'Royal garrison', 'royalists', 'flag'),
    'prague-towns-1420': markAt([14.4215, 50.0855], 'Old and New Town', 'Held by the Hussites', 'prague', 'flag'),
  },
  show: ['prague-castle-1420'],
});

// --- the works on the ridge, before the assault ---
writePlan(`${G}/020-vitkov-works`, {
  bbox,
  emblem: {
    water, works,
    units: [
      ...blockhouses, defenders,
      unit('neutral', 'fort', 300, 110, 50, 50, EAST, 'tower', 'A watchtower in the vineyards on the south slope'),
      unit('empire', 'knights', 1000, 10, 230, 170, WEST, 'meissen', MEISSEN),
      at('empire', 'knights', [14.4545, 50.0938], 320, 180, 240, 'spital-field', 'Crusader horse on the Spital field, many thousands, ready to attack the city'),
    ],
    arrows: [
      arrow('empire', [[14.4445, 50.1], [14.4462, 50.0978], [14.4485, 50.0958]], 35, 'crossing', 'The crusader horse cross the Vltava to the Spital field'),
      arrow('empire', [[14.4585, 50.0946], [14.466, 50.0952], [14.4705, 50.094], [1300, 10], [1110, 10]], 35, 'meissen-ride', 'The men of Meissen ride up onto the hill from the east and along the ridge towards the works'),
    ],
  },
  markers: {
    'vitkov-works-defenders': mark(-30, 200, 'Defenders', '26 men, two women, a girl', 'taborites', 'swords'),
    'vitkov-works-isenburg': mark(1000, 200, 'Heinrich of Isenburg', 'Men of Meissen and Austria', 'empire'),
    'vitkov-works-spital': markAt([14.4612, 50.0948], 'Spital field', 'Thousands of horse below the hill', 'empire', 'swords'),
    'vitkov-works-neck': tactic(300, -230, 'Narrow front', 'A neck a few riders wide'),
    'vitkov-works-ditches': tactic(420, 260, 'Works', 'Wall and three ditches'),
    'vitkov-works-slope': tactic(-250, -420, 'Steep slope', 'North side falls to the plain'),
  },
});

// --- the assault on the works ---
writePlan(`${G}/030-vitkov-assault`, {
  bbox,
  emblem: {
    water, works,
    units: [
      ...blockhouses, defenders,
      unit('empire', 'fort', 300, 110, 50, 50, EAST, 'tower', 'The vineyard tower, taken by the crusaders'),
      unit('empire', 'infantry', 270, 0, 130, 220, WEST, 'meissen-foot', 'Men of Meissen on foot: with trumpets they take the ditches and the vineyard tower and climb at the wall, a few men wide'),
      unit('empire', 'cavalry', 560, 0, 140, 90, WEST, 'meissen-horses', 'Their horses, held behind on the ridge'),
      unit('empire', 'knights', 900, 0, 230, 160, WEST, 'meissen', `The rest of the Meissen horse, waiting on the ridge. ${MEISSEN}`),
      at('empire', 'knights', [14.4545, 50.0938], 320, 180, 240, 'spital-field', 'Crusader horse on the Spital field, many thousands'),
    ],
    arrows: [
      arrow('taborites', [[70, 0], [175, 0]], 35, 'stones', 'Stones and spears: the defenders have no arrows and no powder for their guns', 'fire'),
    ],
    clashes: [{ at: P(122, 0), size: 75 }],
  },
  markers: {
    'vitkov-assault-zizka': mark(0, -330, 'Žižka', 'Thrown into a ditch, nearly killed', 'taborites'),
    'vitkov-assault-isenburg': mark(700, 200, 'Heinrich of Isenburg', 'Leads the assault', 'empire'),
    'vitkov-assault-flails': tactic(-150, 150, 'Flails', 'His men tear him free'),
    'vitkov-assault-wall': tactic(300, 230, 'Wall and ditches', 'The attack stops at the wall'),
  },
});

// --- the sally from the city onto their flank ---
writePlan(`${G}/040-vitkov-flank`, {
  bbox,
  emblem: {
    water, works,
    units: [
      ...blockhouses, defenders,
      unit('empire', 'fort', 300, 110, 50, 50, EAST, 'tower', 'The vineyard tower'),
      unit('prague', 'infantry', 420, 120, 170, 50, NORTH, 'peasants', 'Peasants without armour, with flails, led out of the city by a priest carrying the sacrament. Several hundred by the Old Czech Annals'),
      unit('prague', 'archers', 170, 150, 130, 40, NORTH, 'shooters', 'About 50 shooters from the city, by Laurence of Březová'),
      unit('empire', 'infantry', 500, -420, 220, 80, NORTH, 'meissen-fled', 'Men of Meissen who got down the slope alive'),
      at('empire', 'knights', [14.45, 50.0986], 350, 90, 160, 'spital-field', 'The crusader horse, fleeing back across the river'),
    ],
    arrows: [
      arrow('prague', [[14.4307, 50.0796], [14.438, 50.0815], [14.446, 50.0838], [14.4525, 50.0857], [420, 330], [420, 165]], 40, 'sally', 'The priest, the shooters and the peasants come out by the Mountain Gate and climb the vineyards into the crusaders’ flank'),
      arrow('empire', [[300, -20], [330, -200], [420, -360]], 35, 'over-edge', 'Pressed against the northern edge, many fall down the rocks', 'dashed'),
      arrow('empire', [[650, 0], [850, -150], [1000, -380]], 35, 'flight', 'The rest of the crusaders flee down the hill to the Spital field', 'dashed'),
      arrow('empire', [[14.4535, 50.0944], [14.4495, 50.0962], [14.4455, 50.0982]], 35, 'river-flight', 'The horse on the Spital field flee back across the Vltava, and many drown at the ford', 'dashed'),
      arrow('taborites', [[90, 0], [300, 0], [520, -30]], 35, 'pursuit', 'Žižka’s men come out of the works and pursue'),
    ],
  },
  markers: {
    'vitkov-flank-priest': mark(560, 280, 'Priest with the sacrament', 'Leads the sally from the city', 'prague'),
    'vitkov-flank-isenburg': mark(250, -300, 'Heinrich of Isenburg', 'Mortally wounded', 'empire', 'skull'),
    'vitkov-flank-dead': mark(800, -330, 'Crusaders', 'About 300 dead, by Laurence', 'empire', 'skull'),
    'vitkov-flank-flank': tactic(-100, 320, 'Flank attack', 'Up the vineyards into their flank', 'prague'),
    'vitkov-flank-edge': tactic(-200, -300, 'Steep slope', 'Pushed over the northern edge', 'prague'),
  },
});

console.log('vitkov: bbox', JSON.stringify(bbox), 'works at', JSON.stringify(P(0, 0)));
