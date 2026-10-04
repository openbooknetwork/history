// Trenton and Princeton, 26 December 1776 to 3 January 1777. Positions from the Battle of Trenton and Battle of
// Princeton articles: the Battle Monument stands where King and Queen streets meet at the head of the town.
import { writePlan } from './lib.mjs';

const HESS = '#9c6b30';   // the Hessian brigade, in British service
const G = 'pages/020-war/020-1776';
const U = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const A = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const M = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, ...(color ? { color } : {}), label, note });
const road = (path, id, name) => ({ path, width: 14, id, name });

const delaware = { path: [[-74.912, 40.338], [-74.886, 40.313], [-74.868, 40.2965], [-74.838, 40.264], [-74.818, 40.25], [-74.797, 40.236], [-74.783, 40.226], [-74.778, 40.2195], [-74.7765, 40.207], [-74.771, 40.195], [-74.764, 40.183]], width: 220, id: 'delaware', name: 'The Delaware River' };
const assunpink = { path: [[-74.73, 40.226], [-74.741, 40.2232], [-74.749, 40.2207], [-74.756, 40.2178], [-74.7605, 40.2158], [-74.766, 40.2125], [-74.771, 40.21], [-74.7752, 40.2088]], width: 35, id: 'assunpink', name: 'Assunpink Creek' };
const streets = [
  road([[-74.7637, 40.2264], [-74.7663, 40.2207], [-74.769, 40.215]], 'king-street', 'King Street'),
  road([[-74.7637, 40.2264], [-74.7621, 40.2212], [-74.7605, 40.2158], [-74.7598, 40.2135]], 'queen-street', 'Queen Street, over the Assunpink bridge'),
  road([[-74.7637, 40.2264], [-74.77, 40.233], [-74.776, 40.24]], 'pennington-road', 'The Pennington road'),
  road([[-74.788, 40.236], [-74.78, 40.229], [-74.774, 40.2215]], 'river-road', 'The River road'),
  road([[-74.7637, 40.2264], [-74.756, 40.233], [-74.748, 40.24]], 'princeton-road', 'The road to Princeton'),
];
const town = [-74.788, 40.205, -74.74, 40.241];

writePlan(`${G}/041-trenton-crossing`, {
  bbox: [-74.905, 40.195, -74.735, 40.315],
  emblem: {
    water: [delaware, { ...assunpink, width: 60 }],
    units: [
      U('usa', 'ships', [-74.866, 40.2958], 500, 260, 120, 'durham-boats', 'Durham boats rowed across by Glover’s Marblehead men', { count: 6, rows: 2 }),
      U('usa', 'infantry', [-74.8575, 40.2925], 700, 250, 150, 'main-force', 'Washington’s main force, 2,400 men, landed by 3 am'),
      U(HESS, 'infantry', [-74.764, 40.221], 700, 400, 0, 'rall-brigade', 'Rall’s Hessian brigade, 1,500, in winter quarters'),
      U('usa', 'infantry', [-74.7845, 40.2055], 400, 120, 90, 'ewing', 'Ewing’s 700 militia, kept back by the ice'),
    ],
    arrows: [
      A('usa', [[-74.852, 40.29], [-74.836, 40.286], [-74.826, 40.275], [-74.814, 40.2645], [-74.798, 40.2615], [-74.785, 40.2505], [-74.772, 40.2365], [-74.767, 40.2305]], 170, 'greene-column', 'Greene’s division, with Washington, by the Bear Tavern road and then the Scotch and Pennington roads'),
      A('usa', [[-74.816, 40.2628], [-74.81, 40.2505], [-74.7895, 40.2365], [-74.7775, 40.2262], [-74.7735, 40.2222]], 170, 'sullivan-column', 'Sullivan’s division by the River road'),
    ],
  },
  markers: {
    'trenton-crossing-washington': M([-74.8445, 40.2985], 'Washington', 'Crosses at McConkey’s Ferry', 'usa'),
    'trenton-crossing-birmingham': M([-74.8095, 40.2715], 'Birmingham', 'The columns part here', 'usa', 'flag'),
    'trenton-crossing-rall': M([-74.749, 40.2275], 'Rall', 'Hessian garrison of Trenton', 'held'),
    'trenton-crossing-ewing': M([-74.7965, 40.2005], 'Ewing', 'Kept back by the ice', 'usa'),
  },
});

writePlan(`${G}/042-trenton-attack`, {
  bbox: town,
  emblem: {
    water: [delaware, assunpink],
    works: streets,
    units: [
      U('usa', 'infantry', [-74.766, 40.2305], 600, 150, 160, 'greene', 'Greene’s division: Stephen’s, Mercer’s and Stirling’s brigades'),
      U('usa', 'light', [-74.764, 40.2278], 260, 45, 190, 'guns', 'American guns firing down King and Queen streets'),
      U('usa', 'light', [-74.7686, 40.2222], 240, 45, 100, 'mercer', 'Mercer’s men firing from the houses along King Street'),
      U('usa', 'light', [-74.756, 40.232], 420, 55, 200, 'hand', 'Hand’s riflemen and the German Battalion block the Princeton road'),
      U('usa', 'infantry', [-74.772, 40.2228], 400, 120, 140, 'sullivan', 'Sullivan’s division, with Stark, from the River road'),
      U('usa', 'infantry', [-74.76, 40.2146], 200, 80, 0, 'bridge-guard', 'Sullivan’s men holding the Assunpink bridge'),
      U(HESS, 'infantry', [-74.7671, 40.2192], 220, 80, 15, 'rall', 'Rall regiment and part of the Lossberg regiment in King Street'),
      U(HESS, 'infantry', [-74.7612, 40.2186], 180, 80, 0, 'knyphausen', 'Knyphausen regiment at the lower end of Queen Street'),
    ],
    arrows: [
      A('usa', [[-74.7705, 40.2372], [-74.7668, 40.2322]], 70, 'greene-advance', 'Greene overruns the outpost on the Pennington road'),
      A('usa', [[-74.7805, 40.2298], [-74.7738, 40.2242]], 70, 'sullivan-advance', 'Sullivan enters by the River road'),
      A(HESS, [[-74.7668, 40.2204], [-74.7651, 40.2244]], 50, 'rall-attack', 'Rall’s attack up King Street, broken by the guns'),
      A(HESS, [[-74.7742, 40.2252], [-74.7695, 40.2155], [-74.7663, 40.2104]], 45, 'jagers', 'The jägers run, some swimming the Assunpink', 'dashed'),
    ],
    clashes: [[-74.7652, 40.2252]],
  },
  markers: {
    'trenton-attack-washington': M([-74.7712, 40.2338], 'Washington', 'Directs the attack from the high ground', 'usa'),
    'trenton-attack-knox': M([-74.7592, 40.2292], 'Knox', 'Guns at the head of the streets', 'usa'),
    'trenton-attack-rall': M([-74.7722, 40.2178], 'Rall', 'Forms in King Street', 'held'),
  },
});

writePlan(`${G}/043-trenton-surrender`, {
  bbox: town,
  emblem: {
    water: [delaware, assunpink],
    works: streets,
    units: [
      U('usa', 'infantry', [-74.757, 40.2302], 500, 120, 180, 'greene', 'Greene’s division on the high ground north of the field'),
      U('usa', 'light', [-74.752, 40.2275], 300, 45, 250, 'hand', 'Hand’s riflemen closing from the east'),
      U('usa', 'light', [-74.764, 40.2278], 260, 45, 120, 'guns', 'The guns, retaken and turned on the Hessians'),
      U('usa', 'infantry', [-74.7618, 40.2207], 300, 100, 110, 'stark', 'Sullivan’s men with Stark'),
      U('usa', 'infantry', [-74.76, 40.2146], 200, 80, 0, 'bridge-guard', 'The Assunpink bridge, held by Sullivan’s men'),
      U(HESS, 'infantry', [-74.757, 40.2244], 300, 120, 290, 'rall', 'Rall and Lossberg regiments, surrounded in the field'),
      U(HESS, 'infantry', [-74.757, 40.2182], 200, 80, 170, 'knyphausen', 'Knyphausen regiment, cut off at the Assunpink'),
    ],
    arrows: [
      A(HESS, [[-74.7575, 40.2252], [-74.7612, 40.2274]], 50, 'counterattack', 'The Hessians try to retake the town and stall under fire from three sides'),
      A('usa', [[-74.7605, 40.2202], [-74.7584, 40.2187]], 60, 'stark-charge', 'Stark’s bayonet charge'),
      A(HESS, [[-74.7582, 40.2172], [-74.7598, 40.2156]], 45, 'knyphausen-turn', 'The Knyphausen regiment marches for the bridge and finds it held', 'dashed'),
    ],
    clashes: [[-74.7592, 40.2262], [-74.7579, 40.2193]],
  },
  markers: {
    'trenton-surrender-rall': M([-74.7528, 40.2262], 'Rall', 'Mortally wounded', 'held', 'skull'),
    'trenton-surrender-stark': M([-74.7655, 40.2196], 'Stark', 'Bayonets against wet muskets', 'usa'),
    'trenton-surrender-prisoners': M([-74.7492, 40.2182], '896 prisoners', 'With about 1,000 muskets', 'held', 'users'),
  },
});

writePlan(`${G}/044-trenton-assunpink`, {
  bbox: [-74.79, 40.2, -74.723, 40.245],
  emblem: {
    water: [delaware, assunpink],
    works: streets,
    units: [
      U('usa', 'infantry', [-74.749, 40.2183], 1800, 200, 335, 'american-line', 'Washington’s army, about 6,000, behind the Assunpink'),
      U('usa', 'light', [-74.7603, 40.214], 160, 40, 0, 'bridge-guns', 'Guns covering the bridge'),
      U('held', 'infantry', [-74.762, 40.2238], 900, 300, 160, 'cornwallis', 'Cornwallis’s army, about 8,000, in Trenton'),
    ],
    arrows: [
      A('usa', [[-74.742, 40.2405], [-74.756, 40.2292], [-74.7598, 40.2192]], 70, 'delaying', 'Washington’s detachments fall back after a day of skirmishing', 'dashed'),
      A('held', [[-74.7628, 40.2203], [-74.7607, 40.2166]], 70, 'bridge-attacks', 'Three attempts to force the bridge'),
      A('usa', [[-74.741, 40.2158], [-74.7345, 40.2108], [-74.7265, 40.2118]], 90, 'night-march', 'The night march to Princeton by the Quaker Bridge road'),
    ],
    clashes: [[-74.7609, 40.2171]],
  },
  markers: {
    'trenton-assunpink-cornwallis': M([-74.7685, 40.2292], 'Cornwallis', 'Waits for the morning', 'held'),
    'trenton-assunpink-washington': M([-74.7462, 40.2128], 'Washington', 'Leaves 500 men at the fires', 'usa'),
  },
});

writePlan(`${G}/045-trenton-princeton`, {
  bbox: [-74.7, 40.312, -74.652, 40.352],
  emblem: {
    water: [{ path: [[-74.712, 40.338], [-74.7, 40.3315], [-74.691, 40.326], [-74.683, 40.3205], [-74.673, 40.3165], [-74.66, 40.3145]], width: 30, id: 'stony-brook', name: 'Stony Brook' }],
    works: [road([[-74.695, 40.3185], [-74.6885, 40.3245], [-74.681, 40.33], [-74.672, 40.3365], [-74.664, 40.343], [-74.6593, 40.347]], 'post-road', 'The Post Road from Trenton')],
    units: [
      U('usa', 'infantry', [-74.6815, 40.3268], 300, 70, 315, 'mercer', 'Mercer’s brigade, about 350, in Clarke’s orchard'),
      U('held', 'infantry', [-74.685, 40.33], 400, 90, 135, 'mawhood', 'Mawhood with the 17th and 55th Foot and two guns'),
      U('usa', 'infantry', [-74.6775, 40.3235], 500, 100, 315, 'cadwalader', 'Cadwalader’s 1,100 militia, rallied by Washington'),
      U('usa', 'infantry', [-74.6745, 40.3265], 300, 70, 300, 'virginians', 'Virginia Continentals and Hand’s riflemen'),
      U('usa', 'infantry', [-74.6728, 40.329], 250, 70, 270, 'hitchcock', 'Hitchcock’s New Englanders turn the British flank'),
      U('usa', 'infantry', [-74.6665, 40.333], 400, 90, 20, 'sullivan', 'Sullivan’s division: St. Clair’s and Sherman’s brigades'),
      U('held', 'infantry', [-74.662, 40.341], 300, 70, 200, '40th', 'The 40th Foot and part of the 55th at the ravine'),
      U('held', 'camp', [-74.6593, 40.3487], 140, 60, 0, 'nassau-hall', 'Nassau Hall, where 194 British soldiers surrender'),
    ],
    arrows: [
      A('held', [[-74.6842, 40.3291], [-74.682, 40.3276]], 40, 'mawhood-charge', 'Mawhood’s bayonet charge'),
      A('usa', [[-74.6806, 40.3261], [-74.6782, 40.3244]], 40, 'mercer-rout', 'Mercer’s men break', 'dashed'),
      A('usa', [[-74.6764, 40.3251], [-74.6815, 40.3283]], 50, 'washington-advance', 'Washington leads the line to within thirty yards'),
      A('held', [[-74.6856, 40.3289], [-74.6882, 40.3255], [-74.6935, 40.321]], 40, 'mawhood-escape', 'Mawhood breaks out over the Stony Brook bridge', 'dashed'),
      A('usa', [[-74.666, 40.335], [-74.6612, 40.344]], 50, 'sullivan-advance', 'Sullivan drives into the town'),
    ],
    clashes: [[-74.683, 40.3285], [-74.66, 40.3475]],
  },
  markers: {
    'trenton-princeton-mercer': M([-74.6795, 40.3232], 'Mercer', 'Mortally wounded', 'usa', 'skull'),
    'trenton-princeton-washington': M([-74.6728, 40.3238], 'Washington', 'Rallies the militia', 'usa'),
    'trenton-princeton-mawhood': M([-74.6905, 40.3292], 'Mawhood', 'Escapes across Stony Brook', 'held'),
    'trenton-princeton-hamilton': M([-74.6558, 40.3462], 'Hamilton', 'Three guns fire on Nassau Hall', 'usa'),
  },
});
console.log('trenton: 5 pages');
