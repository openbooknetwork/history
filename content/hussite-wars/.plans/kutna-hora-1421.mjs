// Kutná Hora and Německý Brod, 21 December 1421 to 10 January 1422. Laurence of Březová has the Hussites march out
// of the Kouřim gate on the west side of the town and close their wagons about two furlongs, some 400 m, from the
// walls. The royal army comes from the west, and Kutná Hora exiles let royal troops in through the Kolín gate on
// the north side. The king camps barely a bowshot away, and in the night the wagons break through his camp to
// below Kaňk, north of the town (the Kronika velmi pěkná and the Old Czech Annals). The town outline and the
// Vrchlice valley follow the elevation tiles. The two Kutná Hora phases share one bbox. Nebovidy, 6 to 7 km
// north west, has a bbox of its own, and the pursuit to Německý Brod a regional one from Habry to the Sázava,
// whose course follows the elevation tiles.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/060-zatec-kutna-hora/020-kutna-hora';

// local [u, w] helpers: u north, w east in every frame here
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const toward = ([u0, w0], [u1, w1]) => ((deg(Math.atan2(w1 - w0, u1 - u0))) % 360 + 360) % 360;
const go = ([u, w], bearing, d) => [u + Math.cos(rad(bearing)) * d, w + Math.sin(rad(bearing)) * d];
const front = (x, d = 0) => go(x.uw, x.facing, x.depth / 2 + d);
const back = (x, d = 0) => go(x.uw, x.facing + 180, x.depth / 2 + d);
const bind = f => ({
  draw: ({ uw, ...x }) => ({ ...x, at: f.p(...uw) }),
  arrow: (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) }),
  mark: (uw, label, note, color, icon = 'user') => ({ lnglat: f.p(...uw), icon, color, label, note }),
  clash: (uw, size) => ({ at: f.p(...uw), size }),
});
const unit = (side, type, uw, width, depth, facing, id, name, extra = {}) => ({ side, type, uw, width, depth, facing, id, name, ...extra });

const ROYAL = 'Sigismund’s army: about 50,000 by the Old Czech Annals, 80,000 Hungarians and 12,000 Austrians by Eberhard Windecke';
const HUSSITES = 'the Hussites of Tábor, Prague and the towns, a third of the royal army by Thomas Ebendorfer';

// --- overview: the marches of December 1421 ---
writePlan(`${G}/010-kutna-hora`, {
  bbox: [14.3, 49.3, 16.55, 50.2],
  routes: {
    'zizka-1421-december': { name: 'Žižka marches from Prague to Kutná Hora, 8 to 9 December 1421',
      path: [[14.42, 50.087], [14.6, 50.08], [14.861, 50.074], [14.977, 50.003], [15.1, 49.975], [15.2, 49.958], [15.258, 49.95]] },
    'sigismund-1421': { name: 'Sigismund’s main column from Jihlava by Německý Brod and Ledeč to Kutná Hora, December 1421',
      path: [[15.591, 49.396], [15.588, 49.5], [15.58, 49.607], [15.5, 49.64], [15.4, 49.67], [15.278, 49.695], [15.25, 49.76], [15.22, 49.84], [15.215, 49.9], [15.238, 49.945]] },
    'sigismund-1421-litomysl': { name: 'A second royal column by Litomyšl, December 1421',
      path: [[16.47, 49.756], [16.312, 49.869], [16.1, 49.92], [15.85, 49.94], [15.6, 49.95], [15.42, 49.955], [15.3, 49.958]] },
  },
  markers: {
    'jihlava-1421': { lnglat: [15.591, 49.396], icon: 'flag', color: 'hungary', label: 'Jihlava', note: 'Royal army gathers, late November 1421' },
    'litomysl-1421': { lnglat: [16.312, 49.869], icon: 'flag', color: 'hungary', label: 'Litomyšl', note: 'A second royal column passes' },
    'ledec-1421': { lnglat: [15.278, 49.695], icon: 'flag', color: 'hungary', label: 'Ledeč nad Sázavou', note: 'Royal army crosses the Sázava' },
  },
  show: ['prague-1421'],
});

// --- Kutná Hora: origin at the wagon fort, u north, w east ---
const kh = frame([15.2545, 49.9497], 0), K = bind(kh);
const khBox = [15.237, 49.9395, 15.2835, 49.9665];
const vrchlice = {
  path: [[15.2585, 49.93], [15.2595, 49.9345], [15.2625, 49.9375], [15.2628, 49.9405], [15.2642, 49.9435], [15.2668, 49.9462], [15.27, 49.9467], [15.2735, 49.9464],
    [15.2765, 49.9483], [15.279, 49.951], [15.283, 49.9513], [15.288, 49.9518], [15.293, 49.9516]],
  width: 25, id: 'vrchlice', name: 'The Vrchlice brook in its valley below the town',
};
const walls = {
  side: 'neutral', width: 22, id: 'walls', name: 'Kutná Hora, the silver town, drawn after the outline of the medieval town',
  path: [[15.2612, 49.944], [15.26, 49.947], [15.26, 49.95], [15.2612, 49.9522], [15.264, 49.954], [15.268, 49.9548], [15.272, 49.9542], [15.2752, 49.952], [15.2768, 49.9495],
    [15.274, 49.9474], [15.27, 49.9474], [15.2668, 49.9468], [15.2645, 49.945], [15.263, 49.9437], [15.2612, 49.944]],
};
const khGround = { water: [vrchlice], works: [walls] };
const kourimGate = [-22, 380], kolinGate = [497, 752];

// 21 December: the wagon fort in the open, the royal bodies round it, royal troops let into the town
const fort = unit('taborites', 'wagon-fort', [0, 0], 560, 340, 270, 'fort',
  `Wagon fort of ${HUSSITES}. The wagons stand chained wheel to wheel, guns and handguns fire through the gaps, flails and halberds hold them. `
  + 'The number of wagons is not recorded, 36 are drawn.', { count: 36 });
const guns = unit('taborites', 'artillery', [0, -95], 240, 55, 270, 'guns', 'Guns and handguns on the western side of the fort, facing the royal army');
const foot = unit('taborites', 'infantry', [0, 60], 320, 70, 270, 'foot', 'Hussite foot with flails, halberds and pikes, the men of Kutná Hora who marched out with them among them');
const main = unit('hungary', 'knights', [0, -850], 650, 200, 90, 'main-body',
  `The largest royal body, Hungarian horse and foot with many hundreds of oxen and cows driven among them as cover against the guns, by Laurence of Březová. ${ROYAL}`);
const nw = unit('hungary', 'cavalry', [700, -560], 380, 130, 135, 'hungarians', 'Hungarian horse under Pippo Spano');
const sw = unit('austria', 'knights', [-850, -650], 380, 130, 45, 'austrians', 'Austrian men at arms sent by Duke Albert V');
const south = unit('royalists', 'cavalry', [-820, 80], 380, 130, 0, 'lords', 'Moravian lords and the Catholic lords of Bohemia');
const inTown = unit('hungary', 'infantry', [200, 950], 320, 110, 180, 'in-town', 'Royal troops in Kutná Hora, many hundreds let in through the Kolín gate by exiles from the town, by Laurence of Březová');
// the point on the ring at u, d metres outside it
const edge = (u, d = 0) => [u, -170 * Math.sqrt(Math.max(0, 1 - (u / 280) ** 2)) - d];
const ATTACK = 'The royal bodies charge the wagons and are driven back by the guns, until night';
writePlan(`${G}/020-kutna-hora-ring`, {
  bbox: khBox,
  emblem: {
    ...khGround,
    units: [fort, guns, foot, main, nw, sw, south, inTown].map(K.draw),
    arrows: [
      K.arrow('taborites', [kourimGate, [-10, 280], [0, 190]], 45, 'march-out', 'After a short breakfast the Hussites march out of the Kouřim gate and close their wagons about 400 m from the walls'),
      K.arrow('hungary', [[130, -745], edge(130, 30)], 55, 'attacks', ATTACK),
      K.arrow('hungary', [front(nw), [420, -260], [310, -150]], 55, 'attacks', ATTACK),
      K.arrow('austria', [front(sw), [-460, -300], [-310, -150]], 55, 'attacks', ATTACK),
      K.arrow('taborites', [[-120, -175], [-120, -720]], 45, 'gunfire', 'Guns and handguns fire from the wagons and keep the horse at a distance', 'fire'),
      K.arrow('hungary', [[900, 640], kolinGate, [260, 900]], 50, 'kolin-gate', 'Exiles from Kutná Hora open the Kolín gate to royal troops, who kill the Hussites in the town'),
    ],
    clashes: [edge(130, 45), [295, -140], [-295, -140]].map(uw => K.clash(uw, 90)),
  },
  markers: {
    'kutna-hora-ring-zizka': K.mark([-420, 260], 'Jan Žižka', 'Commands from the wagon fort', 'taborites'),
    'kutna-hora-ring-sigismund': K.mark([640, -1000], 'Sigismund', 'With Pippo Spano', 'hungary'),
    'kutna-hora-ring-town': K.mark([-250, 1050], 'Kutná Hora', 'Hussites in the town killed', 'taborites', 'skull'),
    'kutna-hora-ring-fort': K.mark([560, 380], 'Wagon fort', 'Chained ring in the open field', 'taborites', 'lightbulb'),
    'kutna-hora-ring-guns': K.mark([-170, -560], 'Guns at range', 'Charges broken at range', 'taborites', 'lightbulb'),
  },
});

// night of 21 to 22 December: the wagons drive through the royal camp in a column and close again below Kaňk
const dawn = [1415, 466], dir = toward([0, 0], dawn);
const camp = unit('hungary', 'camp', [650, 150], 700, 460, 180, 'camp', 'The royal camp, pitched barely a bowshot from the wagon fort to draw food from the town');
const colAt = go([0, 0], dir, 690);
const column = unit('taborites', 'wagons', colAt, 560, 240, (dir + 90) % 360, 'column',
  `The wagons of ${HUSSITES}, in a column. They drive through the royal camp in the dark, and the guns on the wagons fire as they roll. Fewer wagons are drawn than there were.`,
  { rows: 4, count: 10 });
const scattered = unit('hungary', 'cavalry', [1000, -950], 380, 130, 290, 'scattered', 'Royal horse scattered by the gunfire in the dark');
const head = go(colAt, dir, 280), tail = go(colAt, dir + 180, 280);
const side = s => go(colAt, dir + 90 * s, 120);
writePlan(`${G}/030-kutna-hora-breakout`, {
  bbox: khBox,
  emblem: {
    ...khGround,
    units: [camp, column, scattered, { ...inTown, name: 'Royal troops hold Kutná Hora' }].map(K.draw),
    arrows: [
      K.arrow('taborites', [[0, 0], go(tail, dir + 180, 30)], 50, 'set-out', 'In the night the Hussites leave their position before the town'),
      K.arrow('taborites', [go(head, dir, 20), [1180, 400], dawn], 50, 'to-kank', 'At daybreak, less than a quarter of a mile on, the wagons close into a fort again below Kaňk'),
      K.arrow('taborites', [side(1), [560, 470]], 40, 'gunfire', 'The guns on the wagons fire into the camp as the column rolls', 'fire'),
      K.arrow('taborites', [side(-1), [790, -150]], 40, 'gunfire', 'The guns on the wagons fire into the camp as the column rolls', 'fire'),
      K.arrow('hungary', [[760, -200], [870, -600], back(scattered, -10)], 45, 'flight', 'The royal troops scatter out of the camp', 'dashed'),
      K.arrow('hungary', [[420, -40], [300, -380], [250, -720]], 45, 'flight', 'The royal troops scatter out of the camp', 'dashed'),
    ],
    clashes: [K.clash(go(colAt, dir + 90, 175), 90), K.clash(go(colAt, dir - 90, 175), 90)],
  },
  markers: {
    'kutna-hora-breakout-zizka': K.mark([1300, -250], 'Jan Žižka', 'Breaks out by night', 'taborites'),
    'kutna-hora-breakout-kank': K.mark([1560, 600], 'Below Kaňk', 'Wagon fort again at daybreak', 'taborites', 'flag'),
    'kutna-hora-breakout-sigismund': K.mark([700, -1000], 'Sigismund', 'Driven from his camp', 'hungary'),
    'kutna-hora-breakout-guns': K.mark([1000, 820], 'Guns on the move', 'Wagons fire as they roll', 'taborites', 'lightbulb'),
    'kutna-hora-breakout-night': K.mark([120, -420], 'Night attack', 'Gunfire out of the dark', 'taborites', 'lightbulb'),
  },
});

// --- Nebovidy, 6 January 1422: origin at the village, u north, w east. The chronicles say only that Žižka falls on the
// scattered royal army and that its vanguard tries to stand on the height south of the village, so the plan shows the
// Hussite army with its wagons coming from Kolín and the foot attacking, without the guns or an order of the wagons.
const nb = frame([15.2195, 49.9915], 0), N = bind(nb);
const nbBox = [15.2, 49.9685, 15.245, 49.9975];
const advance = 170, wagonsAt = [-620, 150];
const wagons = unit('taborites', 'wagons', wagonsAt, 560, 220, (advance + 90) % 360, 'wagons',
  'The Hussite army of Taborites, Praguers and Orebites with its wagons, and the men raised round Jičín and Turnov. The chronicles do not record how the wagons stood at Nebovidy. Fewer wagons are drawn than there were.',
  { rows: 4, count: 8 });
const nbFoot = unit('taborites', 'infantry', [-1150, -60], 380, 90, advance, 'foot', 'Hussite foot attacking the height');
const prague = unit('prague', 'infantry', [-1150, 560], 320, 90, advance, 'praguers', 'Prague foot');
const vanguard = unit('hungary', 'knights', [-1660, 320], 820, 220, 350, 'vanguard',
  'The royal vanguard, mostly Hungarians, on the rising ground south of the village. It cannot form a line before the Hussites are on it. The royal troops stood on the hills “so thick that it looked like a forest”, by the Old Czech Annals');
const NB_ATTACK = 'The Hussites attack before the vanguard can form a line';
writePlan(`${G}/040-nebovidy`, {
  bbox: nbBox,
  emblem: {
    units: [wagons, nbFoot, prague, vanguard].map(N.draw),
    arrows: [
      N.arrow('taborites', [[1000, -500], [400, -150], back(wagons, -80)], 50, 'from-kolin', 'Žižka’s army comes from Kolín, about 4 km to the north'),
      N.arrow('taborites', [go(wagonsAt, advance, 300), [-1060, 60], back(nbFoot, -10)], 45, 'advance', 'The Hussite foot go forward from the wagons'),
      N.arrow('taborites', [front(nbFoot), [-1480, 20]], 55, 'attack', NB_ATTACK),
      N.arrow('prague', [front(prague), [-1490, 610]], 55, 'attack', NB_ATTACK),
      N.arrow('hungary', [[-1780, 450], [-2000, 900], [-2150, 1350]], 50, 'flight', 'The vanguard breaks and flees towards Kutná Hora', 'dashed'),
    ],
    clashes: [[-1510, 20], [-1520, 610]].map(uw => N.clash(uw, 95)),
  },
  markers: {
    'nebovidy-village': N.mark([120, 380], 'Nebovidy', 'Village between Kolín and Kutná Hora', undefined, 'house'),
    'nebovidy-zizka': N.mark([-420, -420], 'Jan Žižka', 'Falls on the royal army', 'taborites'),
    'nebovidy-vanguard': N.mark([-2000, 120], 'Royal vanguard', 'Broken, many Hungarians killed', 'hungary', 'skull'),
    'nebovidy-surprise': N.mark([-560, 700], 'Surprise attack', 'Royal army scattered in villages', 'taborites', 'lightbulb'),
    'nebovidy-noline': N.mark([-1150, -760], 'Before they form', 'No time to form a line', 'taborites', 'lightbulb'),
  },
});

// --- the pursuit, 8 to 10 January 1422: origin at Německý Brod, u north, w east. The road from Habry comes in
// from the north, the Sázava runs just south of the town.
const br = frame([15.5807, 49.6075], 0), B = bind(br);
const brBox = [15.525, 49.583, 15.636, 49.663];
const sazava = {
  path: [[15.665, 49.6025], [15.65, 49.6025], [15.64, 49.607], [15.625, 49.6075], [15.612, 49.606], [15.603, 49.6005], [15.595, 49.6], [15.588, 49.6026], [15.58, 49.6036],
    [15.57, 49.6043], [15.56, 49.6054], [15.552, 49.608], [15.545, 49.6105], [15.53, 49.616], [15.515, 49.619], [15.5, 49.627]],
  width: 110, id: 'sazava', name: 'The Sázava, frozen over in January 1422, drawn wider than it is',
};
const town = unit('hungary', 'fort', [60, 0], 560, 560, 0, 'town', 'Německý Brod, held by part of the royal commanders and their men to cover the flight');
const fleeing = unit('hungary', 'irregular', [900, -1750], 1100, 350, 200, 'fleeing', 'The royal army in flight from Habry, 8 January 1422');
const pursuers = unit('taborites', 'cavalry', [2000, -1250], 700, 220, 200, 'horse', 'Hussite horse in pursuit');
const column2At = [4300, -1700];
const column2 = unit('taborites', 'wagons', column2At, 1500, 420, (153 + 90) % 360, 'wagons',
  `The wagons of ${HUSSITES}, following the same day. Fewer wagons are drawn than there were`, { rows: 4, count: 10 });
writePlan(`${G}/050-nemecky-brod`, {
  bbox: brBox,
  emblem: {
    water: [sazava],
    units: [town, fleeing, pursuers, column2].map(B.draw),
    arrows: [
      B.arrow('hungary', [[700, -1350], [-200, -1300], [-1000, -1450]], 140, 'ice', 'The fugitives cross the frozen Sázava, and the ice breaks under the armoured men', 'dashed'),
      B.arrow('hungary', [[700, -2150], [-100, -2300], [-900, -2350]], 140, 'ice', 'The fugitives cross the frozen Sázava, and the ice breaks under the armoured men', 'dashed'),
      B.arrow('hungary', [[-1100, -1700], [-1700, -1300], [-2300, -900]], 140, 'south', 'The rest of the royal army flees south into Moravia', 'dashed'),
      B.arrow('taborites', [front(pursuers), [1250, -1600]], 130, 'pursuit', 'The Hussite horse ride down the fugitives'),
      B.arrow('taborites', [go(column2At, 153, 800), [2500, -500], [550, -60]], 130, 'assault', '10 January: Hussite troops break into the town without Žižka’s order while the garrison is negotiating, and kill most of it'),
    ],
    clashes: [B.clash([1200, -1620], 230), B.clash([420, -40], 230)],
  },
  routes: {
    'sigismund-1422': { name: 'The royal army flees from Kutná Hora by Habry and Německý Brod into Moravia, 6 to 10 January 1422', style: 'dashed',
      path: [[15.268, 49.948], [15.3, 49.92], [15.36, 49.88], [15.42, 49.845], [15.477, 49.816], [15.4878, 49.7553], [15.5, 49.71], [15.528, 49.67], [15.548, 49.63], [15.56, 49.606],
        [15.555, 49.59], [15.57, 49.55], [15.585, 49.5], [15.591, 49.4]] },
    'zizka-1422': { name: 'Žižka pursues from Kutná Hora by Habry to Německý Brod, 7 to 8 January 1422', offset: 6,
      path: [[15.268, 49.948], [15.3, 49.92], [15.36, 49.88], [15.42, 49.845], [15.477, 49.816], [15.4878, 49.7553], [15.5, 49.71], [15.528, 49.67], [15.552, 49.648], [15.565, 49.635]] },
  },
  markers: {
    'nemecky-brod-habry': B.mark([5900, -3000], 'Road from Habry', 'Royal stand broken there, 8 January', 'hungary', 'flag'),
    'nemecky-brod-ice': B.mark([560, -3100], 'Ice on the Sázava', '548 drown, by the Old Czech Annals', 'hungary', 'skull'),
    'nemecky-brod-town': B.mark([300, 1000], 'Německý Brod', 'Stormed 10 January', 'hungary', 'skull'),
    'nemecky-brod-zizka': B.mark([4600, -300], 'Jan Žižka', 'Puts out the fire, then pursues', 'taborites'),
    'nemecky-brod-sigismund': B.mark([-1900, 400], 'Sigismund', 'Escapes into Moravia', 'hungary'),
    'nemecky-brod-pursuit': B.mark([2400, -2700], 'Pursuit', 'Horse ride down the flight', 'taborites', 'lightbulb'),
  },
});

console.log('kutna-hora-1421: fort at', JSON.stringify(kh.p(0, 0)), 'dawn fort at', JSON.stringify(kh.p(...dawn)));
