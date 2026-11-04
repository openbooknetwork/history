// Varna, 10 November 1444: the crusaders west of the town between Lake Varna and the Franga plateau, facing west,
// the Ottomans come in from the west. The ground comes from elevation data, the order of the lines from the accounts
// and the modern reconstructions (README.md).
// Frame: origin at Murad's burial mound, u north along the lines, w east from the Ottomans to the crusaders.
import { frame, writePlan } from './lib.mjs';

const f = frame([27.865, 43.2245], 0), P = f.p, OTT = f.face(90), CHR = f.face(270);
const G = 'pages/060-varna-1444/030-varna';
// from the lake shore to the edge of the plateau and from Murad's household to the wagon fort, about 5 km by 5.6 km
const bbox = f.box([[-2550, -1500], [3050, 3500]], 0);
// Lake Varna: the 0 m line of the elevation data, the modern port at its east end left out
const LAKE = [[27.7, 43.197], [27.72, 43.1955], [27.74, 43.1965], [27.75, 43.194], [27.76, 43.1905], [27.77, 43.1955], [27.78, 43.199],
  [27.79, 43.2025], [27.795, 43.205], [27.8, 43.1995], [27.81, 43.199], [27.82, 43.196], [27.83, 43.195], [27.84, 43.2015], [27.85, 43.207],
  [27.86, 43.2095], [27.87, 43.2085], [27.88, 43.2085], [27.89, 43.204], [27.9, 43.1985], [27.906, 43.193], [27.905, 43.187], [27.895, 43.1875],
  [27.885, 43.1905], [27.875, 43.195], [27.865, 43.1925], [27.86, 43.1895], [27.85, 43.188], [27.84, 43.185], [27.83, 43.1855], [27.82, 43.183],
  [27.81, 43.1815], [27.8, 43.1855], [27.79, 43.185], [27.78, 43.1845], [27.77, 43.186], [27.76, 43.1885], [27.75, 43.19], [27.74, 43.1915],
  [27.72, 43.1925], [27.7, 43.1945]];
const water = outflow => [
  { area: LAKE, id: 'lake', name: 'Lake Varna' },
  { path: [[27.904, 43.19], [27.911, 43.1888], [27.918, 43.188]], width: outflow, id: 'outflow', name: 'The outflow of the lake into Varna Bay, with marshes along it' },
];

// the two lines are arcs with the wings forward; a unit on an arc faces along its normal, towards the enemy
const crW = u => Math.round(1500 - 350 * ((u + 100) / 1800) ** 2);
const crFace = u => f.face(Math.round(Math.atan2(-1, -700 * (u + 100) / 1800 ** 2) * 180 / Math.PI));
const otW = u => Math.round(300 + 350 * (u / 1900) ** 2);
const otFace = u => f.face(Math.round(Math.atan2(1, -700 * u / 1900 ** 2) * 180 / Math.PI));
const toward = ([u0, w0], [u1, w1]) => f.face(Math.round(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI));
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const cr = (side, type, u, width, id, name, depth = 220) => unit(side, type, u, crW(u), width, depth, crFace(u), id, name, { bow: -30 });
const ot = (type, u, width, id, name, depth = 280) => unit('ottomans', type, u, otW(u), width, depth, otFace(u), id, name, { bow: -40 });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
// a marker at (u, w), moved dN metres north and dE east, so its label below the icon clears the blocks
const mark = (u, w, dN, dE, label, note, color, icon = 'user') => ({ lnglat: P(u + dN, w + dE), icon, color, label, note });

const ORDER_R = 'Some accounts put the Rumelian sipahis on this wing', ORDER_L = 'Some accounts put the Anatolian sipahis on this wing';
const DITCH = { side: 'ottomans', path: f.path([[-600, 410], [500, 410]]), width: 40, style: 'trench', id: 'ditch', name: 'The ditch in front of the janissaries' };
const PALISADE = { side: 'ottomans', path: f.path([[-600, 350], [500, 350]]), width: 30, id: 'palisades', name: 'Two palisades behind the ditch' };
const works = [DITCH, PALISADE];
const JANISSARIES = unit('ottomans', 'infantry', -50, 240, 1000, 150, OTT, 'janissaries', 'The janissaries behind their ditch and palisades, round two Thracian burial mounds', { bow: -30 });
const MURAD = unit('ottomans', 'cavalry', 0, -250, 500, 150, OTT, 'murad', 'Murad with the horsemen of his household, by the burial mound from which he watches the battle');
const KING = cr('poland', 'knights', -350, 420, 'king', 'Władysław with his Polish guard: one of the two banners of the centre, 3,500 men with the Hungarian royal banner');
const ROYAL = cr('hungary', 'knights', 130, 420, 'royal', 'The Hungarian royal banner: the king’s Hungarian guard, royal mercenaries and the banners of Hungarian nobles');
const WALLACHIANS = unit('wallachia', 'cavalry', -100, 2650, 900, 250, CHR, 'wallachians', 'Mircea’s Wallachian horsemen in reserve behind the centre, 4,000 by Setton');
const WAGONS = unit('hungary', 'wagon-fort', -1100, 3050, 600, 380, CHR, 'wagons', 'The wagon fort, held by 300 or 600 Czech and Ruthenian mercenaries with Poles, Lithuanians and Wallachians, 7 to 10 men to a wagon, with bombards', { count: 60 });

// --- overview: the town, the lake, the plateau and the two camps on the evening of 9 November ---
writePlan(`${G}/010-varna`, {
  bbox: [27.74, 43.17, 27.97, 43.29],
  emblem: { water: water(200) },
  markers: {
    'varna-camp': { lnglat: P(-1100, 3050), icon: 'flag', color: 'hungary', label: 'Crusader camp', note: 'With the wagon fort' },
    'varna-ottoman-camp': { lnglat: P(300, -1500), icon: 'flag', color: 'ottomans', label: 'Ottoman camp', note: 'From the evening of 9 November' },
    'varna-franga': { lnglat: [27.87, 43.264], icon: 'mountain', label: 'Franga plateau', note: 'About 350 m' },
  },
  routes: {
    'murad-approach-1444': { name: 'The Ottoman army comes in from the west along the lake, evening of 9 November 1444', color: 'ottomans',
      path: [[27.742, 43.226], [27.77, 43.227], [27.8, 43.2275], [27.825, 43.228], [27.846, 43.227]] },
  },
  show: ['varna-1444'],
});

// --- the lines on the morning of 10 November ---
writePlan(`${G}/020-varna-lines`, {
  bbox,
  emblem: {
    water: water(120),
    works,
    units: [
      JANISSARIES, MURAD,
      ot('cavalry', -1150, 1050, 'anatolians', `The Anatolian sipahis under their beylerbey Karaca Bey, the right wing towards the lake. ${ORDER_R}`),
      ot('cavalry', 1150, 1050, 'rumelians', `The Rumelian sipahis under Şehabeddin Pasha, the left wing below the plateau. ${ORDER_L}`),
      unit('ottomans', 'light', 2650, 700, 800, 150, toward([2650, 700], [1645, 1173]), 'akinci', 'Akıncı light horsemen and janissary archers on the edge of the Franga plateau'),
      cr('hungary', 'cavalry', -1160, 1080, 'left', 'The left wing under Michael Szilágyi, 5,000 men in five banners: Hunyadi’s Transylvanians, Bulgarians, German mercenaries and the banners of Hungarian magnates', 250),
      KING, ROYAL,
      cr('hungary', 'cavalry', 625, 450, 'dominis', 'The banners of John de Dominis, bishop of Várad, who leads the right wing, and of Simon Rozgonyi, bishop of Eger'),
      cr('crusaders', 'cavalry', 1135, 450, 'cesarini', 'Cardinal Cesarini’s German mercenaries and a Bosnian banner'),
      cr('hungary', 'cavalry', 1645, 450, 'talovac', 'The Croatian banner of Franko Talovac, ban of Slavonia, at the end of the right wing on the slope. The right wing has 6,500 men in five banners'),
      WALLACHIANS, WAGONS,
    ],
  },
  markers: {
    'varna-lines-murad': mark(0, -250, 0, -650, 'Murad', 'Watches from a burial mound', 'ottomans'),
    'varna-lines-karaca': mark(-1150, otW(-1150), 0, -900, 'Karaca Bey', 'Anatolian sipahis, right wing', 'ottomans'),
    'varna-lines-sehabeddin': mark(1150, otW(1150), 0, -900, 'Şehabeddin Pasha', 'Rumelian sipahis, left wing', 'ottomans'),
    'varna-lines-king': mark(-200, 2050, 0, 0, 'Władysław III', 'Holds the centre', 'poland'),
    'varna-lines-hunyadi': mark(650, 2050, 0, 0, 'John Hunyadi', 'In command of the army', 'hungary'),
    'varna-lines-szilagyi': mark(-1150, 2050, 0, 0, 'Michael Szilágyi', 'The left wing', 'hungary'),
    'varna-lines-cesarini': mark(1450, 2050, 0, 0, 'Julian Cesarini', 'On the right wing', 'crusaders'),
  },
});

// --- the Ottoman wings attack: the crusader right breaks, Hunyadi routs the Anatolians ---
writePlan(`${G}/030-varna-wings`, {
  bbox,
  emblem: {
    water: water(120),
    works,
    units: [
      JANISSARIES, MURAD,
      unit('ottomans', 'cavalry', -1000, -1700, 900, 250, f.face(270), 'anatolians', `The Anatolian sipahis flee after Karaca Bey is killed. ${ORDER_R}`),
      unit('ottomans', 'cavalry', 1100, 1050, 1000, 280, f.face(120), 'rumelians', `The Rumelian sipahis ride over the ground of the crusader right. ${ORDER_L}`),
      unit('ottomans', 'light', 2050, 1750, 700, 150, toward([2050, 1750], [1300, 1500]), 'akinci', 'Akıncıs come down from the plateau onto the flank of the crusader right'),
      cr('hungary', 'cavalry', -1350, 900, 'left', 'The left wing, which throws back the Anatolian sipahis twice', 250),
      unit('hungary', 'knights', -850, 650, 500, 150, CHR, 'hunyadi', 'Hunyadi with two companies of horsemen, who rout the Anatolian sipahis'),
      KING, ROYAL, WALLACHIANS, WAGONS,
      unit('hungary', 'cavalry', -450, 3150, 450, 200, CHR, 'talovac', 'Franko Talovac’s Croats, the only banner of the right wing that gets back behind the wagon fort'),
    ],
    arrows: [
      arrow('ottomans', [[1150, 300], [1150, 650], [1120, 880]], 140, 'rumelians-attack', 'The Rumelian sipahis attack the banners of the crusader right'),
      arrow('ottomans', [[2650, 700], [2450, 1150], [2150, 1600]], 100, 'akinci-down', 'The akıncıs come down from the plateau'),
      arrow('hungary', [[900, 1650], [400, 2150], [-400, 2300], [-1100, 2450], [-1800, 2550], [-2500, 2750]], 140, 'right-flight', 'The crusader right breaks and flees behind the army towards the marshes south of the town and the fortress of Galata across the bay. Most of its men are killed in the marshes', 'dashed'),
      arrow('hungary', [[-300, 1800], [-600, 1300], [-820, 760]], 140, 'hunyadi-charge', 'Hunyadi rides to the left wing with two companies of horsemen'),
      arrow('ottomans', [[-1150, 300], [-1150, -500], [-1050, -1500]], 120, 'anatolians-flee', 'The Anatolian sipahis break and flee', 'dashed'),
    ],
    clashes: [{ at: P(1350, 1350), size: 200 }, { at: P(-1000, 470), size: 160 }],
  },
  markers: {
    'varna-wings-talovac': mark(350, 3150, 0, 0, 'Franko Talovac', 'Withdraws behind the wagons', 'hungary'),
    'varna-wings-cesarini': mark(1350, 2150, 0, 0, 'Julian Cesarini', 'Flees with the right wing', 'crusaders'),
    'varna-wings-hunyadi': mark(-700, 1950, 0, 0, 'John Hunyadi', 'Routs the Anatolians', 'hungary'),
    'varna-wings-karaca': mark(-1550, 300, 0, 0, 'Karaca Bey', 'Killed when his wing breaks', 'ottomans', 'skull'),
    'varna-wings-murad': mark(0, -250, 0, -650, 'Murad', 'Held back by the janissaries', 'ottomans'),
  },
});

// --- the king charges the janissaries and is killed, the rout, the wagon fort stormed on 11 November ---
writePlan(`${G}/040-varna-king`, {
  bbox,
  emblem: {
    water: water(120),
    works,
    units: [
      JANISSARIES, MURAD,
      unit('poland', 'knights', -150, 480, 400, 140, CHR, 'king', 'Władysław with 500 Polish knights among the janissaries, in front of Murad’s tent'),
      unit('ottomans', 'cavalry', 800, 1750, 900, 250, f.face(180), 'rumelians', 'The Rumelian sipahis close round the crusader centre from the north'),
      unit('ottomans', 'cavalry', -1250, 750, 900, 250, f.face(60), 'anatolians', 'The Anatolian sipahis come back to the field'),
      unit('hungary', 'knights', 100, 1450, 420, 200, CHR, 'royal', 'The Hungarian banners of the centre, which break when the king falls'),
      unit('hungary', 'knights', -550, 1350, 450, 150, CHR, 'hunyadi', 'Hunyadi, back from the left wing, tries to recover the king’s body and to rally the army'),
      WAGONS,
    ],
    arrows: [
      arrow('poland', [[-350, 1400], [-300, 900], [-170, 540]], 160, 'king-charge', 'Władysław charges the Ottoman centre with 500 Polish knights to take Murad'),
      arrow('ottomans', [[1300, 1100], [1150, 1500], [950, 1650]], 120, 'rumelians-close', 'The Rumelian sipahis come back from the pursuit'),
      arrow('hungary', [[150, 1600], [-300, 2250], [-750, 2750]], 130, 'rout', 'The crusader army breaks. Many flee to the wagon fort', 'dashed'),
      arrow('hungary', [[-400, 1500], [300, 2250], [1300, 2750], [2700, 3100]], 120, 'hunyadi-escape', 'Hunyadi escapes from the field with part of his men. The accounts do not say by which road', 'dashed'),
      arrow('ottomans', [[-1350, 1250], [-1350, 2050], [-1200, 2750]], 120, 'storm', 'On 11 November the Ottomans storm the wagon fort'),
    ],
    clashes: [{ at: P(-150, 350), size: 140 }, { at: P(450, 1600), size: 200 }],
  },
  markers: {
    'varna-king-wladyslaw': mark(700, 800, 0, 0, 'Władysław III', 'Killed before Murad’s tent', 'poland', 'skull'),
    'varna-king-murad': mark(0, -250, 0, -650, 'Murad', 'His janissaries hold the centre', 'ottomans'),
    'varna-king-hunyadi': mark(-550, 2050, 0, 0, 'John Hunyadi', 'Escapes from the field', 'hungary'),
    'varna-king-wagons': mark(-300, 3050, 0, 0, 'Wagon fort', 'Stormed on 11 November', 'hungary', 'swords'),
  },
});

console.log('varna: phase bbox', JSON.stringify(bbox), 'card at', JSON.stringify(P(-100, 800)), 'mound at', JSON.stringify(P(0, 0)));
