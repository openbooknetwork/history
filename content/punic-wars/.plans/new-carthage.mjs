// New Carthage, early 209 BC. The city stands on a hilly promontory between the harbour bay to the south and a
// shallow lagoon to the north, joined to the mainland by an isthmus to the east. Walls of about 3.7 km.
// Frame: origin at the east gate, u north, w east along the isthmus towards the Roman camp.
import { frame, writePlan } from './lib.mjs';

const f = frame([-0.9756, 37.6012], 0), P = f.p, EAST = f.face(90), WEST = f.face(270);
const G = 'pages/040-second-war/020-attrition/040-new-carthage';
const r5 = x => Math.round(x * 1e5) / 1e5;
// the walled city as an oval, about 1.4 km by 0.75 km
const kx = 111320 * Math.cos(37.6 * Math.PI / 180), ky = 110540, C = [-0.9835, 37.601];
const oval = (a, b, n = 48) => [...Array(n + 1)].map((_, i) => { const t = 2 * Math.PI * i / n; return [r5(C[0] + a * Math.cos(t) / kx), r5(C[1] + b * Math.sin(t) / ky)]; });
const wall = { side: 'carthage', path: oval(700, 380), width: 45, id: 'city-wall', name: 'The city wall, about 3.7 km' };
const lagoon = { area: [[-0.9965, 37.6058], [-0.9930, 37.6052], [-0.9900, 37.6049], [-0.9868, 37.6048], [-0.9835, 37.6047], [-0.9800, 37.6045], [-0.9770, 37.6042], [-0.9735, 37.6048], [-0.9700, 37.6062], [-0.9678, 37.6085], [-0.9672, 37.6112], [-0.9688, 37.6142], [-0.9725, 37.6168], [-0.9780, 37.6182], [-0.9840, 37.6186], [-0.9895, 37.6178], [-0.9940, 37.6160], [-0.9975, 37.6132], [-0.9995, 37.6100], [-0.9990, 37.6075]], id: 'lagoon', name: 'The lagoon north of the city' };
const bay = { area: [[-1.0020, 37.5985], [-0.9990, 37.5982], [-0.9960, 37.5978], [-0.9930, 37.5973], [-0.9900, 37.5970], [-0.9868, 37.5967], [-0.9835, 37.5966], [-0.9800, 37.5967], [-0.9770, 37.5971], [-0.9745, 37.5978], [-0.9720, 37.5983], [-0.9695, 37.5987], [-0.9672, 37.5980], [-0.9662, 37.5960], [-0.9672, 37.5938], [-0.9700, 37.5922], [-0.9750, 37.5908], [-0.9800, 37.5900], [-0.9860, 37.5896], [-0.9920, 37.5895], [-0.9980, 37.5902], [-1.0030, 37.5920]], id: 'harbour', name: 'The harbour bay' };
const channel = { path: [[-0.9952, 37.6052], [-0.9958, 37.6020], [-0.9960, 37.5982]], width: 70, id: 'channel', name: 'The channel between the lagoon and the bay' };
const water = [lagoon, bay, channel];
const bbox = [-1.0045, 37.5885, -0.9645, 37.6195];
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: Scipio's march from Tarraco and Laelius's fleet, the three Carthaginian armies far away ---
writePlan(`${G}/010-new-carthage`, {
  bbox: [-9.8, 36.0, 3.0, 42.2],
  routes: {
    'scipio-209': { name: 'Scipio marches from Tarraco to New Carthage, early 209 BC', path: [[1.25, 41.12], [0.52, 40.68], [-0.1, 39.95], [-0.27, 39.68], [-0.55, 39.1], [-0.6, 38.6], [-0.86, 38.2], [-0.97, 37.61]] },
    'laelius-209': { name: 'Laelius’s fleet of 35 galleys along the coast', offset: 6, path: [[1.3, 41.08], [0.9, 40.55], [0.3, 39.95], [0.05, 39.3], [0.25, 38.75], [-0.25, 38.15], [-0.75, 37.62], [-0.98, 37.595]] },
  },
  markers: {
    'new-carthage-hasdrubal': { lnglat: [-3.8, 39.9], icon: 'flag', color: 'carthage', label: 'Hasdrubal Barca', note: 'Army in central Iberia' },
    'new-carthage-mago': { lnglat: [-5.95, 36.6], icon: 'flag', color: 'carthage', label: 'Mago', note: 'Army near Gades' },
    'new-carthage-gisco': { lnglat: [-8.6, 39.2], icon: 'flag', color: 'carthage', label: 'Hasdrubal Gisco', note: 'Army in Lusitania' },
  },
  show: ['tarraco-210'],
});

// --- the first assault: the militia sortie on the isthmus, the galleys against the south wall ---
writePlan(`${G}/020-new-carthage-first-assault`, {
  bbox,
  emblem: {
    water, works: [wall],
    units: [
      { side: 'rome', type: 'camp', at: P(30, 780), width: 380, depth: 300, facing: WEST, id: 'roman-camp', name: 'Scipio’s camp on the isthmus' },
      { side: 'rome', type: 'infantry', at: P(20, 480), width: 300, depth: 90, facing: WEST, id: 'roman-line', name: 'Roman infantry on the isthmus' },
      { side: 'carthage', type: 'infantry', at: P(20, 340), width: 260, depth: 60, facing: EAST, id: 'militia', name: 'Carthaginian militia, 2,000, sallying from the east gate' },
      { side: 'carthage', type: 'infantry', at: P(-20, -1060), width: 160, depth: 120, facing: EAST, id: 'citadel', name: 'Mago with 1,000 regulars on the citadel' },
      { side: 'rome', type: 'ships', at: P(-640, -700), width: 1000, depth: 160, facing: 0, count: 10, id: 'laelius', name: 'Laelius’s fleet of 35 galleys' },
    ],
    arrows: [
      { side: 'carthage', path: [P(20, 40), P(20, 290)], width: 60, id: 'sortie', name: 'The militia sortie from the east gate' },
      { side: 'rome', path: [P(-580, -560), P(-420, -560)], width: 55, id: 'galley-attack', name: 'The galleys attack the south wall' },
    ],
    clashes: [{ at: P(20, 405), size: 90 }, { at: P(-400, -620), size: 90 }],
  },
  markers: {
    'new-carthage-1-scipio': mark(P(220, 780), 'Scipio', 'Camp on the isthmus', 'rome'),
    'new-carthage-1-militia': mark(P(-170, 340), 'Carthaginian militia', '2,000 sally from the east gate', 'carthage', 'swords'),
    'new-carthage-1-mago': mark(P(170, -1060), 'Mago', '1,000 regulars, citadel', 'carthage'),
    'new-carthage-1-laelius': mark(P(-900, -400), 'Laelius', '35 galleys attack the south wall', 'rome', 'ship'),
  },
});

// --- the afternoon: the gate, the south wall, the feint in the west, and 500 men across the lagoon ---
writePlan(`${G}/030-new-carthage-lagoon`, {
  bbox,
  emblem: {
    water, works: [wall],
    units: [
      { side: 'rome', type: 'camp', at: P(30, 780), width: 380, depth: 300, facing: WEST, id: 'roman-camp', name: 'Scipio’s camp on the isthmus' },
      { side: 'rome', type: 'infantry', at: P(10, 110), width: 220, depth: 110, facing: WEST, id: 'testudo', name: 'Legionaries under shields at the east gate' },
      { side: 'rome', type: 'ships', at: P(-600, -700), width: 1000, depth: 160, facing: 0, count: 10, id: 'laelius', name: 'Laelius’s fleet of 35 galleys' },
      { side: 'rome', type: 'infantry', at: P(150, -2060), width: 220, depth: 80, facing: EAST, id: 'feint', name: 'Roman troops at the western channel' },
      { side: 'carthage', type: 'infantry', at: P(-10, -90), width: 300, depth: 60, facing: EAST, id: 'gate-defenders', name: 'Defenders at the east gate' },
      { side: 'carthage', type: 'infantry', at: P(-330, -700), width: 600, depth: 50, facing: 180, id: 'south-defenders', name: 'Defenders on the south wall' },
    ],
    arrows: [
      { side: 'rome', path: [P(1830, -620), P(1300, -650), P(620, -640), P(400, -560)], width: 70, id: 'lagoon-crossing', name: 'Five hundred picked men wade across the lagoon' },
      { side: 'rome', path: [P(330, -470), P(310, -260), P(150, -60)], width: 60, id: 'north-wall', name: 'Over the empty north wall to the gate' },
      { side: 'rome', path: [P(-600, -620), P(-400, -620)], width: 60, id: 'galley-attack', name: 'The galleys attack the south wall again' },
      { side: 'rome', path: [P(150, -1980), P(150, -1830)], width: 50, id: 'feint-attack', name: 'The feint at the western channel' },
    ],
    clashes: [{ at: P(10, 20), size: 90 }, { at: P(-400, -620), size: 90 }],
  },
  markers: {
    'new-carthage-2-five-hundred': mark(P(1600, -350), '500 picked men', 'Wade across the lagoon', 'rome', 'swords'),
    'new-carthage-2-gate': mark(P(-160, 230), 'Testudo', 'Axes against the east gate', 'rome', 'swords'),
    'new-carthage-2-feint': mark(P(380, -2250), 'Feint', 'Troops at the western channel', 'rome', 'swords'),
    'new-carthage-2-defenders': mark(P(-480, -1150), 'Defenders', 'Drawn to the south and east', 'carthage', 'swords'),
  },
});

// --- the city taken: the marketplace, the citadel, Mago's surrender ---
writePlan(`${G}/040-new-carthage-sack`, {
  bbox,
  emblem: {
    water, works: [wall],
    units: [
      { side: 'rome', type: 'infantry', at: P(-20, -620), width: 260, depth: 160, facing: WEST, id: 'marketplace', name: 'Scipio’s main force in the marketplace' },
      { side: 'rome', type: 'infantry', at: P(-20, -1030), width: 200, depth: 100, facing: WEST, id: 'citadel-attack', name: 'Scipio with 1,000 men at the citadel' },
      { side: 'carthage', type: 'infantry', at: P(0, -1260), width: 160, depth: 110, facing: EAST, id: 'citadel', name: 'Mago on the citadel' },
      { side: 'carthage', type: 'infantry', at: P(270, -380), width: 120, depth: 70, facing: 180, id: 'hill', name: 'The last defenders on a hill' },
    ],
    arrows: [
      { side: 'rome', path: [P(0, 120), P(-10, -200), P(-20, -530)], width: 60, id: 'into-city', name: 'The Romans pour in through the gate' },
      { side: 'rome', path: [P(-60, -720), P(-70, -850), P(-40, -960)], width: 55, id: 'to-citadel', name: 'Scipio takes 1,000 men to the citadel' },
      { side: 'rome', path: [P(110, -620), P(200, -480)], width: 50, id: 'to-hill', name: 'Troops sent against the hill' },
    ],
    clashes: [{ at: P(0, -1150), size: 80 }, { at: P(240, -440), size: 80 }],
  },
  markers: {
    'new-carthage-3-scipio': mark(P(-270, -620), 'Scipio', 'Holds the marketplace', 'rome'),
    'new-carthage-3-citadel': mark(P(220, -1300), 'Mago', 'Surrenders the citadel', 'carthage', 'flag'),
    'new-carthage-3-hill': mark(P(450, -330), 'Last resistance', 'Fighting on one hill', 'carthage', 'swords'),
  },
});

// --- after the city: Baecula in 208 BC, Hasdrubal's march to the Pyrenees ---
writePlan(`${G}/050-new-carthage-baecula`, {
  bbox: [-5.8, 36.8, 3.2, 43.9],
  routes: {
    'scipio-208': { name: 'Scipio marches against Hasdrubal, spring 208 BC', path: [[1.25, 41.12], [0.45, 40.55], [-0.2, 39.85], [-0.8, 39.0], [-1.9, 38.45], [-2.7, 38.1], [-3.08, 38.02]] },
    'hasdrubal-208': { name: 'Hasdrubal leaves for Gaul over the western Pyrenees, 208 BC', path: [[-3.15, 38.04], [-3.5, 38.9], [-3.4, 40.1], [-2.6, 41.2], [-1.9, 42.2], [-1.35, 42.95], [-0.9, 43.45]] },
  },

  show: ['baecula-208', 'tarraco-210'],
});

console.log('new-carthage written, battle at', JSON.stringify(P(20, 255)));
