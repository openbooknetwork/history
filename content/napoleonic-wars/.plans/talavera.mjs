// Talavera, 27 and 28 July 1809 (Battle of Talavera article). The allies hold a line north-north-east from the town
// along the Portiña: Cuesta's Spaniards to the redoubt, the British to the Medellín, Bassecourt on the Segurilla
// beyond the northern valley. Victor holds the Cascajal across the stream, Sébastiani's IV Corps the centre.
// Frame: origin at the north-east edge of Talavera, u along the allied line, w from the allies towards the French.
import { frame, writePlan } from './lib.mjs';

const f = frame([-4.822, 39.962], 20), P = f.p, AL = f.face(90), FR = f.face(270);
const G = 'pages/070-peninsula/050-talavera';
const tagus = { path: [[-4.74, 39.945], [-4.78, 39.948], [-4.81, 39.953], [-4.835, 39.956], [-4.87, 39.952], [-4.9, 39.947]], width: 140, id: 'tagus', name: 'The Tagus' };
const portina = { path: f.path([[-900, 250], [0, 320], [1500, 400], [3000, 480], [4000, 650], [4900, 800], [5900, 900], [7200, 1100]]), width: 35, id: 'portina', name: 'The Portiña stream' };
const redoubt = { side: 'britain', path: f.path([[2450, 30], [2700, 30]]), width: 90, id: 'redoubt', name: 'The redoubt in the centre, with four light guns' };
const ravine = { side: 'neutral', path: f.path([[5350, 250], [5900, 150], [6450, 200]]), width: 60, id: 'ravine', name: 'A hidden ravine across the valley' };
const bbox = f.box([[-1200, -1900], [7700, 4100]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : AL, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, ...(note ? { note } : {}) });
const water = [tagus, portina];
const town = id => ({ [`${id}-town`]: mark(-500, -450, 'Talavera', null, null, 'house') });
const places = id => ({
  ...town(id),
  [`${id}-medellin`]: mark(5300, -1000, 'Medellín', null, null, 'mountain'),
  [`${id}-cascajal`]: mark(5700, 2300, 'Cascajal', null, null, 'mountain'),
});

// the lines that stay put through the battle
const cuesta = unit('spain', 'infantry', 1200, -120, 2400, 300, 'cuesta', 'Cuesta’s Spanish army, 28,000 infantry, behind walls and olive groves');
const campbell = unit('britain', 'infantry', 2900, -80, 550, 200, 'campbell', 'Alexander Campbell’s 4th Division, 3,000');
const sherbrooke = unit('britain', 'infantry', 3700, -60, 1300, 220, 'sherbrooke', 'Sherbrooke’s 1st Division, 6,000: the Guards, Cameron and the King’s German Legion');
const hill = unit('britain', 'infantry', 4900, -150, 800, 220, 'hill', 'Hill’s 2nd Division on the Medellín, 3,900');
const bassecourt = unit('spain', 'infantry', 6950, -350, 700, 200, 'bassecourt', 'Bassecourt’s Spanish division on the Sierra de Segurilla');
const anson = unit('britain', 'cavalry', 5900, -650, 450, 140, 'anson', 'Anson’s light cavalry brigade, 900');
const guns = unit('france', 'artillery', 4850, 1450, 550, 110, 'cascajal-guns', 'Thirty French guns on the Cascajal', { count: 8 });
const villatte = unit('france', 'infantry', 5250, 2350, 900, 220, 'villatte', 'Villatte’s division of Victor’s I Corps, 6,100');
const lapisse = unit('france', 'infantry', 3850, 1900, 1000, 220, 'lapisse', 'Lapisse’s division of Victor’s I Corps, 6,900');
const sebastiani = unit('france', 'infantry', 2950, 2200, 1000, 240, 'sebastiani', 'Sébastiani’s division of the IV Corps, 8,100');
const leval = unit('france', 'infantry', 2150, 2000, 700, 220, 'leval', 'Leval’s German and Dutch division, 4,500');
const milhaud = unit('france', 'cavalry', 900, 1500, 900, 200, 'milhaud', 'Milhaud’s dragoons, 2,350, facing the Spanish army');

// --- overview: Porto, Soult's escape, the march up the Tagus, Cuesta's pursuit and retreat ---
writePlan(`${G}/010-talavera`, {
  routes: {
    'wellesley-porto-1809': { name: 'Wellesley marches from Lisbon by Coimbra to Porto, May 1809',
      path: [[-9.14, 38.72], [-8.68, 39.24], [-8.81, 39.74], [-8.42, 40.2], [-8.58, 41.03], [-8.6, 41.13]] },
    'soult-porto-1809': { name: 'Soult escapes from Porto to Ourense, May 1809', style: 'dashed',
      path: [[-8.61, 41.15], [-8.5, 41.19], [-8.29, 41.44], [-8.0, 41.6], [-7.79, 41.82], [-7.86, 42.34]] },
    'wellesley-tagus-1809': { name: 'Wellesley marches up the Tagus, June to July 1809',
      path: [[-8.42, 40.2], [-8.2, 39.46], [-7.49, 39.82], [-6.7, 40.0], [-6.09, 40.03], [-5.67, 39.85], [-5.18, 39.92], [-4.83, 39.97]] },
    'cuesta-1809': { name: 'Cuesta follows Victor towards Madrid, July 1809',
      path: [[-4.83, 39.97], [-4.6, 40.0], [-4.43, 40.02], [-4.28, 39.98]] },
    'cuesta-back-1809': { name: 'Cuesta falls back on Talavera, 26 July 1809', style: 'dashed', offset: 6,
      path: [[-4.28, 39.98], [-4.43, 40.02], [-4.6, 40.0], [-4.8, 39.975]] },
  },
  markers: {
    'talavera-porto': { lnglat: [-8.61, 41.15], icon: 'swords', color: 'britain', label: 'Porto', note: 'Wellesley crosses the Douro, 12 May' },
    'talavera-ourense': { lnglat: [-7.86, 42.34], icon: 'flag', color: 'france', label: 'Ourense', note: 'Soult arrives without guns or baggage' },
    'talavera-madrid': { lnglat: [-3.7, 40.42], icon: 'crown', color: 'france', label: 'Madrid', note: 'King Joseph’s capital' },
  },
});

// --- 27 July, night: the 9th Light takes the Medellín, Stewart's brigade retakes it, the Spanish panic ---
writePlan(`${G}/020-talavera-night`, {
  bbox,
  emblem: {
    water, works: [redoubt],
    units: [
      cuesta, campbell,
      unit('britain', 'infantry', 3550, -60, 1000, 220, 'sherbrooke', 'Sherbrooke’s Guards and Cameron’s brigade'),
      unit('britain', 'infantry', 4300, -450, 450, 160, 'low', 'Löw’s brigade of the King’s German Legion, routed and rallying'),
      unit('britain', 'infantry', 4900, -100, 700, 200, 'hill', 'Hill’s 2nd Division, Stewart’s brigade on the summit'),
      unit('britain', 'infantry', 3600, -1000, 900, 200, 'mackenzie', 'Mackenzie’s 3rd Division, back from the outposts'),
      unit('france', 'infantry', 5050, 1750, 900, 220, 'ruffin', 'Ruffin’s division of Victor’s I Corps, 5,300'),
      { ...villatte, at: P(5300, 2600) },
      lapisse,
      { ...sebastiani, at: P(2950, 2700), name: 'Sébastiani’s IV Corps, coming up from the Alberche' },
      milhaud,
    ],
    arrows: [
      arrow('france', [[5000, 1550], [4950, 900], [4850, 150]], 120, 'ninth-light', 'The 9th Light climbs the Medellín in the dark'),
      arrow('france', [[5250, 1550], [5800, 1100], [6400, 800]], 100, 'ruffin-astray', 'Ruffin’s other two regiments lose their way'),
      arrow('britain', [[5050, -650], [4950, -350], [4880, 0]], 110, 'stewart-counter', 'Stewart’s brigade retakes the summit'),
      arrow('britain', [[4250, 0], [4280, -250]], 90, 'low-rout', 'Löw’s brigade is routed', 'dashed'),
      arrow('spain', [[1500, -300], [1300, -900], [1000, -1600]], 120, 'spanish-panic', 'Four Spanish battalions flee, nearly 2,000 men', 'dashed'),
    ],
    clashes: [P(4870, 80), { at: P(4280, 60), size: 120 }],
  },
  markers: {
    'talavera-night-hill': mark(4000, -1700, 'Hill', 'Sends Stewart’s brigade up the hill', 'britain'),
    'talavera-night-ninth': mark(4400, 1050, '9th Light', 'Reaches the summit, then driven off', 'france', 'swords'),
    'talavera-night-panic': mark(800, -1300, 'Spanish battalions', 'Flee after firing out of range', 'spain', 'skull'),
    ...places('talavera-night'),
  },
});

// --- 28 July, dawn: the guns on the Cascajal, Ruffin's second attack on the Medellín ---
writePlan(`${G}/030-talavera-medellin`, {
  bbox,
  emblem: {
    water, works: [redoubt],
    units: [
      cuesta, campbell, sherbrooke, hill, bassecourt, anson,
      unit('france', 'infantry', 4880, 650, 650, 160, 'ruffin', 'Ruffin’s three regiments in column, breaking'),
      guns, villatte, lapisse, sebastiani, milhaud,
    ],
    arrows: [
      arrow('france', [[5000, 1650], [4950, 1150], [4900, 400]], 150, 'ruffin-attack', 'Ruffin’s columns climb the Medellín'),
      arrow('britain', [[4880, -50], [4880, 300], [4870, 520]], 130, 'bayonet-charge', 'The 29th and 48th Foot fire and charge with the bayonet'),
      arrow('france', [[4800, 800], [4700, 1200], [4600, 1600]], 120, 'ruffin-flight', 'Ruffin’s columns break and run', 'dashed'),
    ],
    clashes: [P(4880, 450)],
  },
  markers: {
    'talavera-medellin-hill': mark(4000, -1700, 'Hill', '29th and 48th Foot behind the crest', 'britain'),
    'talavera-medellin-ruffin': mark(5650, 1000, 'Ruffin', 'Columns 160 files wide, nine deep', 'france'),
    'talavera-medellin-guns': mark(4250, 1250, '30 guns', 'Bombard the British from dawn', 'france', 'swords'),
    ...places('talavera-medellin'),
  },
});

// --- 28 July, afternoon: Leval, Sébastiani and Lapisse attack the centre, the Guards' charge, the 48th ---
writePlan(`${G}/040-talavera-centre`, {
  bbox,
  emblem: {
    water, works: [redoubt],
    units: [
      cuesta,
      unit('spain', 'cavalry', 2350, -500, 350, 120, 'el-rey', 'The Spanish cavalry regiment El Rey'),
      campbell,
      unit('britain', 'infantry', 3750, -700, 1200, 200, 'sherbrooke', 'The Guards, the Germans and Cameron’s brigade, rallying'),
      unit('britain', 'infantry', 3650, -80, 700, 180, 'forty-eighth', 'The 48th Foot and Mackenzie’s brigade, filling the gap'),
      hill,
      unit('france', 'infantry', 2300, 900, 700, 220, 'leval', 'Leval’s German and Dutch division, beaten off'),
      unit('france', 'infantry', 3050, 650, 900, 220, 'sebastiani', 'Sébastiani’s division, second line'),
      unit('france', 'infantry', 3950, 600, 900, 220, 'lapisse', 'Lapisse’s division, second line'),
      unit('france', 'infantry', 5900, 1600, 800, 220, 'ruffin', 'Ruffin’s survivors and one of Villatte’s brigades, moving north'),
      guns,
    ],
    arrows: [
      arrow('france', [[2300, 750], [2420, 150]], 110, 'leval-attack', 'Leval attacks the 4th Division and the Spaniards'),
      arrow('france', [[3050, 500], [3250, 130]], 110, 'centre-attack', 'Lapisse and Sébastiani attack the 1st Division'),
      arrow('france', [[3950, 450], [3880, 130]], 110, 'centre-attack', 'Lapisse and Sébastiani attack the 1st Division'),
      arrow('britain', [[3550, 750], [3600, 300], [3700, -550]], 110, 'guards-rout', 'The Guards pursue too far and are routed, losing 500 men', 'dashed'),
      arrow('britain', [[3600, -900], [3630, -200]], 120, 'forty-eighth-advance', 'Wellesley brings up the 48th Foot'),
    ],
    clashes: [P(2450, 300), P(3250, 380), P(3870, 380)],
  },
  markers: {
    'talavera-centre-wellesley': mark(3000, -1700, 'Wellesley', 'Brings up the 48th Foot', 'britain'),
    'talavera-centre-lapisse': mark(4500, 1300, 'Lapisse', 'Mortally wounded', 'france', 'skull'),
    'talavera-centre-guards': mark(4600, -1600, 'Guards brigade', 'Routed after the pursuit, 500 lost', 'britain', 'swords'),
    ...town('talavera-centre'),
  },
});

// --- 28 July, evening: Ruffin in the northern valley, the charge of the 23rd Light Dragoons ---
writePlan(`${G}/050-talavera-valley`, {
  bbox,
  emblem: {
    water, works: [redoubt, ravine],
    units: [
      sherbrooke, hill, bassecourt,
      unit('spain', 'cavalry', 6300, -1250, 600, 160, 'alburquerque', 'Alburquerque’s Spanish cavalry'),
      unit('britain', 'cavalry', 5750, -250, 300, 120, 'hussars', 'The 1st Hussars of the King’s German Legion'),
      unit('britain', 'cavalry', 6550, 1700, 250, 100, 'twenty-third', 'The 23rd Light Dragoons among Beaumont’s horsemen', { facing: f.face(110) }),
      unit('france', 'square', 5800, 750, 220, 220, 'ruffin', 'Ruffin’s infantry in squares'),
      unit('france', 'square', 6250, 950, 220, 220, 'ruffin', 'Ruffin’s infantry in squares'),
      unit('france', 'infantry', 5500, 1500, 600, 200, 'villatte', 'One of Villatte’s brigades'),
      unit('france', 'cavalry', 6700, 1950, 500, 150, 'beaumont', 'Beaumont’s light cavalry, 1,000'),
      guns,
      unit('france', 'infantry', 3200, 3500, 1300, 300, 'reserve', 'King Joseph’s reserve: Latour-Maubourg’s dragoons and the Madrid garrison, never committed'),
    ],
    arrows: [
      arrow('france', [[5400, 1700], [5650, 1250], [5900, 900]], 110, 'ruffin-advance', 'Victor pushes Ruffin into the valley'),
      arrow('britain', [[6000, -500], [6050, 150], [6150, 1100], [6450, 1600]], 120, 'twenty-third-charge', 'The 23rd Light Dragoons gallop through the ravine and past the squares'),
      arrow('britain', [[6800, 1500], [6900, 700], [6700, -200]], 100, 'twenty-third-escape', 'The 23rd cut their way out', 'dashed'),
      arrow('britain', [[5750, -500], [5760, -330]], 90, 'hussars-advance', 'The German hussars advance at a steady pace'),
    ],
    clashes: [P(6600, 1830)],
  },
  markers: {
    'talavera-valley-twenty-third': mark(7500, 1100, '23rd Light Dragoons', '102 killed and wounded, 105 captured', 'britain', 'skull'),
    'talavera-valley-anson': mark(5200, -1500, 'Anson', 'Ordered to clear the valley', 'britain'),
    'talavera-valley-joseph': mark(2300, 3600, 'Joseph and Jourdan', 'Keep the reserve back', 'france'),
    ...town('talavera-valley'),
  },
});

console.log('talavera: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(4000, 300)));
