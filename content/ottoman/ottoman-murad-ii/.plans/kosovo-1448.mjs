// Kosovo, 17–20 October 1448: the crusaders north-west with their wagon fort on the hill above the Lab near Plemetina,
// the Ottomans south-east on the plain towards Priština, on the field of 1389. The ground comes from elevation data and
// story 1's rivers, the order of the lines from the accounts (README.md).
// Frame: origin on the Lab below the hill, u along the lines to the east-north-east, w from the crusaders to the Ottomans.
import { frame, writePlan } from './lib.mjs';

const BEARING = 60, f = frame([21.078, 42.744], BEARING), P = f.p, CHR = f.face(90), OTT = f.face(270);
const G = 'pages/080-kosovo-1448/020-kosovo';
// a bbox round the pieces of the three phases, padded by pad metres: the lines run at an angle to the bbox, so the
// corners of the frame's rectangle would add empty ground
const boxOf = (pts, pad) => {
  const ll = pts.map(([u, w]) => P(u, w)), dx = pad / 81744, dy = pad / 110540;
  const r = x => Math.round(x * 1e4) / 1e4;
  return [r(Math.min(...ll.map(q => q[0])) - dx), r(Math.min(...ll.map(q => q[1])) - dy), r(Math.max(...ll.map(q => q[0])) + dx), r(Math.max(...ll.map(q => q[1])) + dy)];
};
// from the hills behind the wagon fort to the Ottoman camp and from the light horse on the left to the Thessalians'
// ride round the crusader left, the same on every phase
const bbox = boxOf([[-600, -2300], [700, -1750], [-1500, -1050], [3650, 900], [2600, 2650], [3225, 2550], [-150, 3750], [750, 3750],
  [-2850, 2510], [-3175, 2550], [-3175, 1750]], 400);
// the Sitnica and the Lab as story 1 draws them from general maps, good to about a kilometre
const SITNICA = [[21.115, 42.53], [21.095, 42.565], [21.082, 42.6], [21.072, 42.625], [21.066, 42.65], [21.06, 42.672], [21.052, 42.692],
  [21.045, 42.712], [21.04, 42.732], [21.03, 42.752], [21.016, 42.772], [21.0, 42.79], [20.985, 42.808], [20.965, 42.825], [20.94, 42.848],
  [20.91, 42.868], [20.885, 42.885]];
const LAB = [[21.19, 42.93], [21.19, 42.9], [21.185, 42.87], [21.175, 42.845], [21.16, 42.82], [21.14, 42.792], [21.118, 42.768],
  [21.095, 42.752], [21.072, 42.742], [21.055, 42.737], [21.041, 42.731]];
const rivers = width => [
  { path: SITNICA, width, id: 'sitnica', name: 'The river Sitnica' },
  { path: LAB, width: width * 0.8, id: 'lab', name: 'The river Lab, which flows into the Sitnica near Plemetina' },
];

const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const toward = ([u0, w0], [u1, w1]) => f.face(Math.round(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI));
// a marker beside the block at (u, w), moved dE metres east and dN north, so its label below the icon clears the blocks
const t = BEARING * Math.PI / 180;
const mark = (u, w, dE, dN, label, note, color, icon = 'user') => ({ lnglat: P(u + dE * Math.sin(t) + dN * Math.cos(t), w + dE * Math.cos(t) - dN * Math.sin(t)), icon, color, label, note });

const ORDER = 'The accounts give the order of the wings but not their ground';
const DITCH = { side: 'ottomans', path: f.path([[-800, 2010], [800, 2010]]), width: 40, style: 'trench', id: 'ditch', name: 'The ditch in front of the Ottoman centre' };
const STOCKADE = { side: 'ottomans', path: f.path([[-800, 2070], [800, 2070]]), width: 30, id: 'stockade', name: 'The Ottoman stockade behind the ditch' };
const works = [DITCH, STOCKADE];
const JANISSARIES = unit('ottomans', 'infantry', 0, 2300, 1500, 200, OTT, 'janissaries', 'The janissaries and the azaps in the centre. Turkish accounts put shield bearers and spearmen round the ditch, with camels and guns along it');
const GUNS = unit('ottomans', 'artillery', 0, 2140, 900, 60, OTT, 'ott-guns', 'Ottoman guns along the ditch', { count: 6 });
const MURAD = unit('ottomans', 'cavalry', 0, 2750, 600, 160, OTT, 'murad', 'Murad with the horsemen of his household behind the centre');
const RUMELIANS = unit('ottomans', 'cavalry', -2100, 2350, 1500, 320, OTT, 'rumelians', `The Rumelian sipahis on the left wing. ${ORDER}`);
const ANATOLIANS = unit('ottomans', 'cavalry', 2150, 2350, 1500, 320, OTT, 'anatolians', 'The Anatolian troops on the right wing under Murad’s son Mehmed, sixteen, in his first battle');
const CAMP = unit('ottomans', 'camp', 300, 3500, 900, 500, OTT, 'ott-camp', 'The Ottoman camp');
const KNIGHTS = unit('hungary', 'knights', 0, 300, 1200, 220, CHR, 'knights', 'Hunyadi with the heavy horse in the centre, before the wagon fort');
const WAGON_FORT = 'The wagon fort on the hill north of the Lab, with the guns and the German and Bohemian foot. The sources give 800 to 2,000 war wagons, each with a gun';
const WAGONS = unit('hungary', 'wagon-fort', 300, -550, 900, 500, CHR, 'wagon-fort', WAGON_FORT, { count: 40 });
const WATER = rivers(60);

// --- overview: Kosovo field, the two camps and the roads by which the armies came ---
writePlan(`${G}/010-kosovo`, {
  bbox: [21.0, 42.65, 21.2, 42.8],
  emblem: { water: rivers(160) },
  markers: {
    'kosovo-camp': { lnglat: P(300, -550), icon: 'flag', color: 'hungary', label: 'Crusader camp', note: 'Wagon fort on the hill north of the Lab' },
    'kosovo-ottoman-camp': { lnglat: P(300, 3500), icon: 'flag', color: 'ottomans', label: 'Ottoman camp', note: 'With a stockade of its own' },
    'murad-i-tomb': { lnglat: [21.1042, 42.7019], icon: 'landmark', label: 'Tomb of Murad I', note: 'Killed on this field in 1389' },
    'pristina-1448': { lnglat: [21.163, 42.663], icon: 'castle', color: 'serbia', label: 'Priština' },
  },
  routes: {
    'hunyadi-lab-1448': { name: 'Hunyadi comes down the Lab valley to Kosovo field, October 1448', color: 'hungary',
      path: [[21.2, 42.95], [21.197, 42.9], [21.192, 42.87], [21.183, 42.845], [21.168, 42.818], [21.148, 42.79], [21.125, 42.766], [21.1, 42.757], [P(300, -550)[0], P(300, -550)[1]]] },
    'murad-approach-1448': { name: 'The Ottoman army comes up from the south-east by Priština, 17 October 1448', color: 'ottomans',
      path: [[21.35, 42.55], [21.3, 42.58], [21.24, 42.62], [21.19, 42.65], [21.15, 42.68], [21.12, 42.705], P(300, 3500)] },
  },
});

// --- 17 and 18 October: Hunyadi's horse attacks both Ottoman wings, the Ottoman light horse restores them ---
writePlan(`${G}/020-kosovo-flanks`, {
  bbox,
  emblem: {
    water: WATER,
    works,
    units: [
      JANISSARIES, GUNS, MURAD, CAMP,
      unit('ottomans', 'cavalry', -2100, 2350, 1500, 320, OTT, 'rumelians', `The Rumelian sipahis on the left wing, who give ground until the light horse comes up. ${ORDER}`),
      unit('ottomans', 'cavalry', 2150, 2350, 1500, 320, OTT, 'anatolians', 'The Anatolian troops on the right wing under Murad’s son Mehmed, sixteen, in his first battle. Turkish accounts say that Murad kept them out of the first day’s fighting'),
      unit('ottomans', 'light', -3100, 2150, 800, 150, toward([-3100, 2150], [-1900, 1950]), 'light-left', 'Ottoman light horse on the flank of the left wing'),
      unit('ottomans', 'light', 3150, 2150, 800, 150, toward([3150, 2150], [1950, 1950]), 'light-right', 'Ottoman light horse on the flank of the right wing'),
      unit('hungary', 'cavalry', -1900, 1950, 1100, 260, CHR, 'right', 'The crusader right wing: Hungarian horse, light and heavy, against the Ottoman left'),
      KNIGHTS,
      unit('wallachia', 'cavalry', 1950, 1950, 1200, 280, CHR, 'left', 'The crusader left wing: the Wallachian horsemen, about 8,000 by Cartledge, with Moldavian and Hungarian horse, against the Ottoman right'),
      WAGONS,
    ],
    arrows: [
      arrow('hungary', [[-1700, 450], [-1800, 1150], [-1900, 1780]], 160, 'right-attack', 'The horse of the crusader right attacks the Ottoman left wing, 17 October'),
      arrow('wallachia', [[1750, 450], [1850, 1150], [1950, 1770]], 160, 'left-attack', 'The horse of the crusader left attacks the Ottoman right wing'),
      arrow('ottomans', [[-2300, 2950], [-2850, 2700], [-3100, 2280]], 110, 'light-left-up', 'The Ottoman light horse comes up to support the left wing'),
      arrow('ottomans', [[2400, 2950], [2950, 2700], [3150, 2280]], 110, 'light-right-up', 'The Ottoman light horse comes up to support the right wing'),
    ],
    clashes: [{ at: P(-1900, 2130), size: 220 }, { at: P(1950, 2135), size: 220 }],
  },
  markers: {
    'kosovo-flanks-murad': mark(0, 2750, -1100, -300, 'Murad', 'Commands the centre', 'ottomans'),
    'kosovo-flanks-mehmed': mark(2150, 2350, 600, -900, 'Mehmed', 'The Anatolian troops, right wing', 'ottomans'),
    'kosovo-flanks-hunyadi': mark(0, 300, -1000, 0, 'John Hunyadi', 'Commands the centre', 'hungary'),
    'kosovo-flanks-wallachians': mark(1950, 1950, 0, 1000, 'Wallachians', 'The crusader left wing', 'wallachia', 'swords'),
    'kosovo-flanks-wagons': mark(300, -550, -900, 500, 'Wagon fort', 'On the hill above the Lab', 'hungary', 'flag'),
  },
});

// --- the night of 18 to 19 October and 19 October: the wagons and guns against the centre, the Thessalians turn
// the crusader left, Hunyadi's knights reach the Ottoman camp and are driven back ---
writePlan(`${G}/030-kosovo-night`, {
  bbox,
  emblem: {
    water: WATER,
    works,
    units: [
      JANISSARIES, GUNS, MURAD, CAMP, ANATOLIANS,
      unit('ottomans', 'cavalry', -1800, 1100, 1400, 320, OTT, 'rumelians', `The Rumelian sipahis attack along the line to hold Hunyadi’s attention. ${ORDER}`),
      unit('ottomans', 'cavalry', 2700, 250, 1000, 300, toward([2700, 250], [1750, 300]), 'thessalians', 'The sipahis of Thessaly, who ride round the crusader left on 19 October and cut down its horse, taking no prisoners'),
      unit('hungary', 'cavalry', -1750, 700, 1100, 260, CHR, 'right', 'The crusader right wing holds against the Rumelian sipahis'),
      unit('hungary', 'wagons', -200, 1750, 900, 80, CHR, 'night-wagons', 'Wagons with guns, brought up against the Ottoman centre on the night of 18 to 19 October', { count: 12 }),
      KNIGHTS,
      unit('wallachia', 'cavalry', 1150, -100, 500, 200, CHR, 'left', 'What is left of the crusader left falls back on Hunyadi’s main body'),
      WAGONS,
    ],
    arrows: [
      arrow('hungary', [[-200, 1800], [-150, 1990], [-100, 2190]], 90, 'night-guns', 'The crusader guns fire on the sultan’s position through the night', 'fire'),
      arrow('ottomans', [[2600, 2650], [3500, 1800], [3650, 900], [3050, 280]], 140, 'thessalians-round', 'The Thessalian sipahis ride round the crusader left'),
      arrow('wallachia', [[1750, 250], [1450, 50], [1250, 0]], 120, 'left-flees', 'The survivors of the crusader left flee to the main body', 'dashed'),
      arrow('hungary', [[300, 450], [350, 1300], [400, 2250], [400, 3180]], 160, 'knights-charge', 'Hunyadi’s knights and light foot break through the janissaries and ride as far as the Ottoman camp'),
      arrow('hungary', [[750, 3100], [800, 2250], [750, 1200], [550, 460]], 140, 'knights-back', 'The Ottoman foot rallies and drives the knights back', 'dashed'),
    ],
    clashes: [{ at: P(400, 3225), size: 220 }, { at: P(2350, 290), size: 220 }, { at: P(-1750, 900), size: 200 }],
  },
  markers: {
    'kosovo-night-hunyadi': mark(0, 300, -1000, 0, 'John Hunyadi', 'His knights reach the Ottoman camp', 'hungary'),
    'kosovo-night-thessalians': mark(2700, 250, 400, 900, 'Thessalian sipahis', 'Turn the crusader left', 'ottomans', 'swords'),
    'kosovo-night-wagons': mark(-200, 1750, -900, 0, 'Wagons and guns', 'Night attack on the centre', 'hungary', 'swords'),
    'kosovo-night-murad': mark(0, 2750, -1100, -300, 'Murad', 'Holds the centre', 'ottomans'),
    'kosovo-night-camp': mark(300, 3500, 1000, 200, 'Ottoman camp', 'The knights are stopped here', 'ottomans', 'flag'),
  },
});

// --- 20 October: the Wallachians go over, the janissaries storm the stockade, Hunyadi escapes ---
writePlan(`${G}/040-kosovo-camp`, {
  bbox,
  emblem: {
    water: WATER,
    works,
    units: [
      GUNS, MURAD, CAMP,
      unit('ottomans', 'infantry', -50, -150, 900, 200, OTT, 'janissaries', 'The janissaries storm the crusader stockade, with Murad watching'),
      unit('ottomans', 'cavalry', -1350, -550, 1000, 300, toward([-1350, -550], [300, -550]), 'rumelians', 'The Rumelian sipahis close round the wagon fort from the west'),
      unit('ottomans', 'cavalry', 1950, -500, 1000, 300, toward([1950, -500], [300, -550]), 'anatolians', 'The Anatolian troops under Mehmed close round the wagon fort from the east'),
      unit('ottomans', 'cavalry', 1200, -1500, 1000, 300, toward([1200, -1500], [300, -550]), 'thessalians', 'The Thessalian sipahis behind the wagon fort'),
      unit('wallachia', 'cavalry', 2700, 1250, 700, 220, OTT, 'wallachians', 'The Wallachians, who go over to Murad on 20 October on terms he offers. Emanuel Antoche thinks the desertion an exaggeration'),
      unit('hungary', 'wagon-fort', 300, -550, 900, 500, CHR, 'wagon-fort', 'The wagon fort with the foot and the guns that are left. A last assault on the next day destroys the troops still inside', { count: 40 }),
    ],
    arrows: [
      arrow('wallachia', [[1150, -100], [1850, 350], [2400, 850], [2650, 1100]], 130, 'wallachians-over', 'The Wallachians go over to the Ottomans'),
      arrow('ottomans', [[0, 2150], [350, 1100], [550, 100], [550, -380]], 130, 'storm', 'The janissaries attack the stockade'),
      arrow('ottomans', [[-350, -60], [-300, -230], [-250, -400]], 80, 'night-fire', 'Through the night the Ottoman foot shoots into the wagon fort, and the Hungarians answer with their guns', 'fire'),
      arrow('hungary', [[-100, -800], [-350, -1500], [-600, -2300]], 120, 'hunyadi-escape', 'Hunyadi escapes from the field with a few men. Turkish accounts have him leave under cover of the wagons', 'dashed'),
    ],
    clashes: [{ at: P(150, -280), size: 180 }],
  },
  markers: {
    'kosovo-camp-hunyadi': mark(-600, -2300, -500, 0, 'John Hunyadi', 'Escapes from the field', 'hungary'),
    'kosovo-camp-wallachians': mark(2700, 1250, 900, 300, 'Wallachians', 'Go over to Murad', 'wallachia', 'swords'),
    'kosovo-camp-murad': mark(0, 2750, -1100, -300, 'Murad', 'Watches the assault', 'ottomans'),
    'kosovo-camp-wagons': mark(300, -550, 600, 865, 'Wagon fort', 'Stormed by the janissaries', 'hungary', 'swords'),
  },
});

console.log('kosovo: phase bbox', JSON.stringify(bbox), 'origin', JSON.stringify(P(0, 0)));
