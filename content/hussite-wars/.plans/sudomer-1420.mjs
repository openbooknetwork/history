// Sudoměř, 25 March 1420. The Hussites from Plzeň hold the dike between the full Markovec pond and the drained
// Škaredý pond, south-east of Sudoměř (Czech Wikipedia after Laurence of Březová and the Old Czech Annals). The
// pond names and the lines of attack follow the board at the memorial: Markovec to the north-west, Škaredý south-east
// of it, the Prostřední marsh south-west. The shores of Markovec and Prostřední are traced from the flat water
// surfaces of the EU-DEM elevation tiles; Škaredý is drawn round the low ground east of the memorial.
// Frame: origin on the dike, u along it to the north-east, w from Markovec towards Škaredý.
import { frame, writePlan } from './lib.mjs';

const f = frame([14.0676, 49.2432], 69), P = f.p;
const G = 'pages/030-plzen-tabor/030-sudomer';
const bbox = [14.0612, 49.2386, 14.0772, 49.248];
// face(0) runs along the dike to the north-east, face(90) towards Škaredý
const NE = f.face(0), SSE = f.face(90), SW = f.face(180), NNW = f.face(-90);
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const tactic = (u, w, label, note) => mark(u, w, label, note, 'taborites', 'lightbulb');
// an oval in the frame, for the drained pond
const oval = (cu, cw, a, b, n = 28) => [...Array(n + 1)].map((_, k) => P(cu + a * Math.cos(2 * Math.PI * k / n), cw + b * Math.sin(2 * Math.PI * k / n)));

// Markovec: the west and north shores from the elevation model, the south-east shore along the dike
const markovec = {
  area: [[14.061, 49.2436], [14.0606, 49.2447], [14.0607, 49.2458], [14.0613, 49.2468], [14.0622, 49.2478], [14.0634, 49.2486], [14.0648, 49.2491],
    [14.0663, 49.2493], [14.0676, 49.249], [14.0686, 49.2482], [14.0692, 49.2472], [14.0694, 49.2462], [14.0693, 49.2452], ...f.path([[140, -70], [60, -55], [-40, -55], [-150, -50]])],
  id: 'markovec', name: 'Markovec pond, full of water, drawn after its shore today',
};
const skaredy = { path: oval(45, 145, 165, 72), width: 10, id: 'skaredy', name: 'Škaredý pond, drained at the time of the battle: a bed of soft mud. Drawn after the battle board at the memorial, round the low ground east of it' };
const prostredni = {
  area: [[14.0602, 49.2398], [14.0611, 49.2394], [14.063, 49.2394], [14.0645, 49.2396], [14.0655, 49.2403], [14.0661, 49.2411], [14.066, 49.2418],
    [14.065, 49.2416], [14.0635, 49.2416], [14.0622, 49.2415], [14.0614, 49.241], [14.0605, 49.2406]],
  id: 'prostredni', name: 'Marsh behind the Hussites, today the Prostřední pond',
};
const water = [markovec, skaredy, prostredni];
const works = [{ side: 'neutral', path: f.path([[-160, 0], [140, 0]]), width: 14, id: 'dike', name: 'The dike between Markovec and Škaredý, a few metres wide' }];

// the Hussite position, the same in every phase
const hussites = [
  unit('taborites', 'wagons', 110, 0, 100, 32, NE, 'wagons-end', 'Four war wagons chained wheel to wheel across the end of the dike. Horses cannot pass them, and handguns and crossbows fire through the gaps', { count: 4 }),
  unit('taborites', 'wagons', -15, 57, 190, 32, SSE, 'wagons-side', 'Eight war wagons chained along the dike, facing the drained pond on the open side. The Hussites have 12 wagons by the Old Czech Annals', { count: 8 }),
  unit('taborites', 'handguns', 10, 20, 120, 30, SSE, 'handguns', 'Handgunners and crossbowmen behind the wagons'),
  unit('taborites', 'infantry', 10, -30, 100, 40, SSE, 'hussites', 'The Hussites from Plzeň under Břeněk Švihovský of Dolany and Jan Žižka: about 400 on foot with women and children, flails, spears and halberds, and 9 horsemen, by the Old Czech Annals'),
];
const ROYAL = 'The royalists have more than 2,000 horse by the chronicle of the old Prague collegiate, about 700 by Čornej and Bělina';

// --- overview: the march from Plzeň, the royalists gather ---
writePlan(`${G}/010-sudomer`, {
  routes: {
    'zizka-1420-sudomer': { name: 'The Hussites leave Plzeň for Tábor by Kasejovice, Řepice and Štěkeň, 23–25 March 1420', color: 'taborites',
      path: [[13.3776, 49.7477], [13.47, 49.66], [13.6, 49.55], [13.7406, 49.4627], [13.82, 49.39], [13.9, 49.32], [13.9549, 49.287], [14.0083, 49.2656], [14.0486, 49.2503], [14.0676, 49.2445]] },
    'svamberk-1420': { name: 'Bohuslav of Švamberk and the Landfrieden of Plzeň follow them', color: 'royalists', group: 'royalists', offset: 6,
      path: [[13.3776, 49.7477], [13.47, 49.66], [13.6, 49.55], [13.7406, 49.4627], [13.82, 49.39], [13.9, 49.32], [13.9549, 49.287], [14.0083, 49.2656], [14.05, 49.2525], [14.072, 49.247]] },
    'hospitallers-1420': { name: 'The Hospitallers ride out from Strakonice, 25 March 1420', color: 'royalists', group: 'royalists', path: [[13.9024, 49.2614], [13.96, 49.262], [14.02, 49.256], [14.06, 49.2502]] },
    'iron-lords-1420': { name: 'The Iron Lords come from Písek, which they have just taken', color: 'royalists', group: 'royalists', path: [[14.1475, 49.3088], [14.12, 49.285], [14.095, 49.262], [14.075, 49.2455]] },
    'zizka-1420-tabor': { name: 'After the battle the Hussites march by Újezd castle to Tábor, 26–29 March 1420', color: 'taborites',
      path: [[14.0676, 49.2445], [14.12, 49.25], [14.2, 49.256], [14.31, 49.26], [14.4, 49.3], [14.4681, 49.3], [14.55, 49.35], [14.6578, 49.4144]] },
  },
  markers: {
    'ujezd-1420': { lnglat: [14.31, 49.262], icon: 'flag', color: 'taborites', label: 'Újezd castle', note: 'The Hussites rest two days' },
  },
  show: ['plzen-1419', 'tabor-1420'],
});

// --- the position on the dike ---
writePlan(`${G}/020-sudomer-dike`, {
  bbox,
  emblem: {
    water, works,
    units: [
      ...hussites,
      unit('royalists', 'knights', 330, -60, 110, 50, f.face(165), 'hospitallers', 'Hospitallers of the commandery of Strakonice under Jindřich of Hradec, about 300 horse'),
      unit('royalists', 'knights', 470, 110, 140, 50, f.face(175), 'iron-lords', 'The Iron Lords under Petr Konopišťský of Šternberk and Mikeš Divůček of Jemniště, mintmaster of Kutná Hora, about 400 horse'),
      unit('royalists', 'knights', 560, -150, 200, 60, f.face(160), 'landfrieden', `The Landfrieden of Plzeň under Bohuslav of Švamberk. ${ROYAL}`),
    ],
    arrows: [
      { side: 'royalists', path: [[14.0736, 49.2483], [14.0727, 49.2468], ...f.path([[345, -90]])], width: 18, id: 'hospitallers-ride', name: 'The Hospitallers follow the same way round the pond' },
      arrow('royalists', [[780, 260], [620, 180], [520, 120]], 18, 'iron-lords-ride', 'The Iron Lords come up from Písek'),
    ],
  },
  markers: {
    'sudomer-dike-zizka': mark(-200, -200, 'Břeněk Švihovský and Žižka', 'About 400 on foot, 12 wagons', 'taborites'),
    'sudomer-dike-hradec': mark(250, -250, 'Jindřich of Hradec', 'Hospitallers of Strakonice', 'royalists'),
    'sudomer-dike-sternberk': mark(520, 230, 'Petr of Šternberk', 'With Mikeš Divůček, the Iron Lords', 'royalists'),
    'sudomer-dike-svamberk': mark(640, -300, 'Bohuslav of Švamberk', 'Landfrieden of Plzeň', 'royalists'),
    'sudomer-dike-front': tactic(200, 60, 'Narrow front', 'A dike a few metres wide'),
    'sudomer-dike-wagons': tactic(-40, 235, 'Wagon line', 'Twelve wagons close the open sides'),
    'sudomer-dike-ponds': tactic(-250, -420, 'Water and mud', 'Full pond, drained pond'),
  },
});

// --- the attacks: the Hospitallers along the dike, the Iron Lords on foot across the drained pond ---
writePlan(`${G}/030-sudomer-dismount`, {
  bbox,
  emblem: {
    water, works,
    units: [
      ...hussites,
      unit('royalists', 'knights', 215, 0, 80, 70, SW, 'hospitallers', 'The Hospitallers charge along the dike, a few horses wide, and are shot down before the wagons'),
      unit('royalists', 'infantry', 20, 150, 150, 45, NNW, 'iron-lords-foot', 'The Iron Lords on foot in full armour, wading through the mud to the wagons'),
      unit('royalists', 'cavalry', 170, 190, 90, 40, NNW, 'iron-lords-horses', 'Their horses, sunk in the mud of the drained pond'),
      unit('royalists', 'knights', 560, -150, 200, 60, f.face(160), 'landfrieden', `The Landfrieden of Plzeň under Bohuslav of Švamberk. ${ROYAL}`),
    ],
    arrows: [
      arrow('royalists', [[330, -40], [270, -10], [190, 0]], 18, 'hospitallers-charge', 'The Hospitallers ride at the end of the dike'),
      arrow('taborites', [[100, 0], [180, 0]], 18, 'handgun-fire', 'Handguns and crossbows fire into the horsemen on the dike', 'fire'),
      arrow('royalists', [[470, 110], [340, 175], [225, 195]], 18, 'iron-lords-ride', 'The Iron Lords ride into the drained pond, and the horses sink in the mud'),
      arrow('taborites', [[-60, 25], [-50, 125]], 18, 'flails', 'Flailmen come out between the wagons and strike the knights on foot'),
    ],
    clashes: [{ at: P(150, 0), size: 45 }, { at: P(20, 100), size: 45 }],
  },
  markers: {
    'sudomer-dismount-brenek': mark(60, -200, 'Břeněk Švihovský', 'Killed at the head of the line', 'taborites', 'skull'),
    'sudomer-dismount-hradec': mark(330, -230, 'Jindřich of Hradec', 'Shot in the foot, dies of it later', 'royalists'),
    'sudomer-dismount-foot': mark(-60, 260, 'Iron Lords on foot', 'Heavy armour in soft mud', 'royalists', 'swords'),
    'sudomer-dismount-mud': tactic(330, 300, 'Drained pond', 'Horses sink in the mud'),
    'sudomer-dismount-guns': tactic(-250, -200, 'Guns at the wagons', 'Shooting through the gaps'),
    'sudomer-dismount-flails': tactic(-220, 90, 'Flails', 'Against armoured men on foot'),
  },
});

// --- dusk: the royalists draw off, the Hussites hold the field ---
writePlan(`${G}/040-sudomer-dusk`, {
  bbox,
  emblem: {
    water, works,
    units: [
      ...hussites,
      unit('royalists', 'knights', 470, -40, 110, 50, f.face(-15), 'hospitallers', 'The Hospitallers fall back, carrying Jindřich of Hradec wounded'),
      unit('royalists', 'cavalry', 600, 110, 140, 50, f.face(-5), 'iron-lords', 'The Iron Lords, back on their horses, draw off with 30 prisoners'),
      unit('royalists', 'knights', 600, -150, 200, 60, f.face(-27), 'landfrieden', 'The Landfrieden of Plzeň draws off at sunset'),
    ],
    arrows: [
      arrow('royalists', [[215, 0], [330, -20], [430, -40]], 18, 'hospitallers-retreat', 'The Hospitallers draw off in the dark and fog', 'dashed'),
      arrow('royalists', [[20, 150], [250, 200], [450, 160], [560, 120]], 18, 'iron-lords-retreat', 'The Iron Lords get back to their horses and draw off', 'dashed'),
      arrow('taborites', [[150, 30], [400, 30], [640, 55], [790, 80]], 18, 'march-on', '26 March: the Hussites bury their dead and march east to Újezd castle, then to Tábor'),
    ],
  },
  markers: {
    'sudomer-dusk-zizka': mark(-200, -200, 'Žižka', 'Takes command, camps on the field', 'taborites'),
    'sudomer-dusk-divucek': mark(520, 250, 'Mikeš Divůček', 'Takes 30 prisoners to Kutná Hora', 'royalists'),
    'sudomer-dusk-royal': mark(420, -330, 'The royalists', 'Withdraw at sunset in fog', 'royalists', 'flag'),
    'sudomer-dusk-hold': tactic(-150, 115, 'Holding the field', 'Wagons stay chained overnight'),
  },
});

console.log('sudomer: bbox', JSON.stringify(bbox), 'dike at', JSON.stringify(P(0, 0)));
