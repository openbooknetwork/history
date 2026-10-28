// Kosovo, 15 June 1389, after Noel Malcolm's reconstruction (Kosovo: A Short History, 64): Serbs north-west with the Lab
// behind them, Ottomans south-east on the side of Priština. The rivers are drawn from general maps.
// Frame: origin at the article's coordinate, u along the lines to the east-north-east, w from the Serbs to the Ottomans.
import { frame, writePlan } from './lib.mjs';

const BEARING = 60, f = frame([21.085, 42.7175], BEARING), P = f.p, CHR = f.face(90), OTT = f.face(270);
const G = 'pages/090-kosovo-1389/020-kosovo';
// from the Sitnica and the mouth of the Lab to Murad's tomb, the same on every phase page
const bbox = [21.04, 42.6885, 21.118, 42.743];
const SITNICA = [[21.115, 42.53], [21.095, 42.565], [21.082, 42.6], [21.072, 42.625], [21.066, 42.65], [21.06, 42.672], [21.052, 42.692],
  [21.045, 42.712], [21.04, 42.732], [21.03, 42.752], [21.016, 42.772], [21.0, 42.79], [20.985, 42.808], [20.965, 42.825], [20.94, 42.848],
  [20.91, 42.868], [20.885, 42.885]];
const LAB = [[21.19, 42.93], [21.19, 42.9], [21.185, 42.87], [21.175, 42.845], [21.16, 42.82], [21.14, 42.792], [21.118, 42.768],
  [21.095, 42.752], [21.072, 42.742], [21.055, 42.737], [21.041, 42.731]];
const rivers = width => [
  { path: SITNICA, width, id: 'sitnica', name: 'The river Sitnica' },
  { path: LAB, width: width * 0.8, id: 'lab', name: 'The river Lab, which flows into the Sitnica' },
];
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'ottomans' ? OTT : CHR, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
// a marker beside the block at (u, w), moved dE metres east and dN north, so its label below the icon clears the blocks
const t = BEARING * Math.PI / 180;
const mark = (u, w, dE, dN, label, note, color, icon = 'user') => ({ lnglat: P(u + dE * Math.sin(t) + dN * Math.cos(t), w + dE * Math.cos(t) - dN * Math.sin(t)), icon, color, label, note });
// the bearing of a move from one local point to another, for units that turn
const toward = ([u0, w0], [u1, w1]) => f.face(Math.round(Math.atan2(w1 - w0, u1 - u0) * 180 / Math.PI));

const MALCOLM = 'Positions after Noel Malcolm’s reconstruction from later accounts';
const LIGHT = 'Light horsemen with bows on the flanks of Lazar’s army';

// --- overview: Kosovo field between the rivers, the marches end here ---
writePlan(`${G}/010-kosovo`, {
  bbox: [20.88, 42.6, 21.32, 42.94],
  emblem: { water: rivers(160) },
  markers: { vucitrn: { lnglat: [20.968, 42.823], icon: 'castle', color: 'brankovic', label: 'Vučitrn', note: 'Vuk Branković’s town' } },
  show: ['pristina'],
});

// --- the morning: the battle lines ---
writePlan(`${G}/020-kosovo-lines`, {
  bbox,
  emblem: {
    water: rivers(60),
    units: [
      unit('serbia', 'cavalry', -2500, -650, 450, 200, 'serb-light', LIGHT),
      unit('serbia', 'cavalry', -1650, -750, 1000, 350, 'brankovic', 'Vuk Branković with the troops from his lands, on the right wing'),
      unit('serbia', 'knights', 0, -550, 1500, 220, 'knights', 'The Serbian heavy horse at the front of the army'),
      unit('serbia', 'infantry', 0, -950, 1400, 350, 'lazar', `Lazar with the troops of Moravian Serbia in the centre. ${MALCOLM}`),
      unit('bosnia', 'cavalry', 1650, -750, 1000, 350, 'vukovic', 'Vlatko Vuković with the Bosnian troops sent by King Tvrtko I and the foreign contingents, on the left wing'),
      unit('serbia', 'cavalry', 2500, -650, 450, 200, 'serb-light', LIGHT),
      unit('ottomans', 'archers', -1750, 420, 1100, 110, 'ott-archers', 'About 1,000 archers in front of each wing'),
      unit('ottomans', 'cavalry', -1750, 750, 1400, 350, 'yakub', 'The left wing under Murad’s son Yakub Çelebi: the troops from Anatolia'),
      unit('ottomans', 'infantry', 0, 580, 900, 250, 'janissaries', 'Janissaries in the centre, no more than 2,000. Ottoman sources put camels in front of them'),
      unit('ottomans', 'cavalry', 0, 980, 700, 220, 'murad', 'Murad I with his cavalry guard behind the janissaries'),
      unit('ottomans', 'archers', 1750, 420, 1100, 110, 'ott-archers', 'About 1,000 archers in front of each wing'),
      unit('ottomans', 'cavalry', 1750, 750, 1400, 350, 'bayezid', 'The right wing under Murad’s son Bayezid and Evrenos Bey: the troops from the European provinces. Some accounts give Bayezid the left wing'),
    ],
  },
  markers: {
    'kosovo-lines-lazar': mark(0, -950, -300, 1180, 'Lazar', 'Centre, heavy horse in front', 'serbia'),
    'kosovo-lines-brankovic': mark(-1650, -750, -200, 950, 'Vuk Branković', 'Right wing', 'serbia'),
    'kosovo-lines-vukovic': mark(1650, -750, -300, 950, 'Vlatko Vuković', 'Left wing, with the foreigners', 'bosnia'),
    'kosovo-lines-murad': mark(0, 980, 0, -450, 'Murad I', 'Centre, behind the janissaries', 'ottomans'),
    'kosovo-lines-yakub': mark(-1750, 750, 0, -580, 'Yakub Çelebi', 'Left wing, Anatolian troops', 'ottomans'),
    'kosovo-lines-bayezid': mark(1750, 750, 0, -580, 'Bayezid and Evrenos', 'Right wing, European troops', 'ottomans'),
  },
});

// --- the archers open, the Serbian heavy horse breaks Yakub's wing, Bayezid holds, Murad is killed ---
writePlan(`${G}/030-kosovo-charge`, {
  bbox,
  emblem: {
    water: rivers(60),
    units: [
      unit('serbia', 'cavalry', -2550, -350, 450, 200, 'serb-light', LIGHT),
      unit('serbia', 'cavalry', -1650, -650, 1000, 350, 'brankovic', 'Vuk Branković’s troops on the right wing'),
      unit('serbia', 'knights', -1650, 700, 800, 350, 'knights', 'The Serbian heavy horse, charging in a wedge, breaks through Yakub’s wing', { bow: 150 }),
      unit('serbia', 'infantry', 0, 350, 1400, 350, 'lazar', 'Lazar’s centre presses the Ottoman centre back'),
      unit('bosnia', 'cavalry', 1750, 380, 1000, 350, 'vukovic', 'Vlatko Vuković’s Bosnians attack Bayezid’s wing and inflict heavy losses on it'),
      unit('serbia', 'cavalry', 2700, 250, 450, 200, 'serb-light', LIGHT),
      unit('ottomans', 'cavalry', -2050, 1600, 1000, 400, 'yakub', 'Yakub’s wing, broken by the charge, gives way'),
      unit('ottomans', 'infantry', 0, 700, 900, 250, 'janissaries', 'The janissaries are pushed back'),
      unit('ottomans', 'cavalry', 0, 1100, 700, 220, 'murad', 'Murad I with his cavalry guard'),
      unit('ottomans', 'cavalry', 1750, 800, 1400, 350, 'bayezid', 'Bayezid’s wing barely holds against the Bosnians'),
    ],
    arrows: [
      arrow('ottomans', [[-1900, 380], [-1500, 50], [-1000, -150]], 80, 'archers-fire', 'The archers of the Ottoman left open the battle, shooting at the Serbian heavy horse', 'fire'),
      arrow('serbia', [[-250, -450], [-900, -150], [-1500, 380]], 150, 'knights-charge', 'The Serbian heavy horse forms a wedge and charges into the Ottoman left'),
      arrow('ottomans', [[-1900, 1050], [-1980, 1330]], 120, 'yakub-back', 'Yakub’s wing gives way', 'dashed'),
      arrow('serbia', [[-1250, 880], [-750, 1080], [-380, 1110]], 70, 'twelve-lords', 'A Florentine letter of October 1389 has twelve lords cut through the lines and the chained camels to Murad’s tent. Ottoman accounts put his death after the battle'),
    ],
    clashes: [{ at: P(0, 550), size: 200 }, { at: P(1750, 590), size: 200 }, { at: P(-1650, 950), size: 200 }],
  },
  markers: {
    'kosovo-charge-knights': mark(-1650, 700, -1171, 81, 'Serbian heavy horse', 'Breaks Yakub’s wing', 'serbia', 'swords'),
    'kosovo-charge-yakub': mark(-2050, 1600, -1275, 61, 'Yakub Çelebi', 'His wing gives way', 'ottomans'),
    'kosovo-charge-lazar': mark(0, 350, -475, 1103, 'Lazar', 'Presses the centre back', 'serbia'),
    'kosovo-charge-vukovic': mark(1750, 380, -206, 1054, 'Vlatko Vuković', 'Attacks Bayezid’s wing', 'bosnia'),
    'kosovo-charge-bayezid': mark(1750, 800, -16, -882, 'Bayezid', 'Barely holds the right', 'ottomans'),
    'kosovo-charge-murad': mark(0, 1100, 0, -547, 'Murad I', 'Killed, by tradition by Miloš Obilić', 'ottomans', 'skull'),
  },
});

// --- Bayezid's counterattack, the rout, Branković and the Bosnians leave the field ---
writePlan(`${G}/040-kosovo-bayezid`, {
  bbox,
  emblem: {
    water: rivers(60),
    units: [
      unit('serbia', 'cavalry', -1900, -1300, 900, 350, 'brankovic', 'Vuk Branković’s troops leave the field'),
      unit('serbia', 'knights', -1650, 700, 800, 350, 'knights', 'The Serbian heavy horse, its charge spent, hemmed in by Ottoman light troops'),
      unit('serbia', 'infantry', -300, -850, 1200, 400, 'lazar', 'The Serbian foot soldiers of Lazar’s centre, routed'),
      unit('bosnia', 'cavalry', 1300, -1100, 900, 350, 'vukovic', 'Vuković’s Bosnians, moved toward the centre to make up for the Serbian losses'),
      unit('ottomans', 'cavalry', -2250, 650, 600, 200, 'ott-light', 'Light horsemen and foot soldiers of the Ottoman left counterattack the Serbian heavy horse', { facing: f.face(0) }),
      unit('ottomans', 'cavalry', -1650, 1080, 700, 200, 'ott-light', 'Light horsemen and foot soldiers of the Ottoman left counterattack the Serbian heavy horse'),
      unit('ottomans', 'infantry', -500, 400, 900, 250, 'janissaries', 'The janissaries and the Ottoman centre advance again'),
      unit('ottomans', 'cavalry', 300, -350, 1200, 350, 'bayezid', 'Bayezid’s wing, turned against the Serbian centre', { facing: toward([1750, 800], [0, -900]) }),
    ],
    arrows: [
      arrow('ottomans', [[1750, 800], [1400, 250], [800, -150], [250, -450]], 160, 'bayezid-counter', 'Bayezid’s counterattack from the right drives the Serbian forces back'),
      arrow('ottomans', [[-2900, 1500], [-2550, 1050], [-2200, 800]], 110, 'light-counter', 'Ottoman light troops close on the Serbian heavy horse'),
      arrow('serbia', [[-700, -1100], [-900, -1700], [-1100, -2300]], 150, 'serb-rout', 'The Serbian foot soldiers are routed', 'dashed'),
      arrow('serbia', [[-1900, -1500], [-1850, -2100], [-1700, -2650]], 130, 'brankovic-leaves', 'Vuk Branković leaves the field with his troops after Lazar is captured. Tradition from 1601 on calls it a betrayal, which most historians reject', 'dashed'),
      arrow('bosnia', [[1300, -1300], [1350, -1750], [1450, -2150]], 130, 'bosnians-leave', 'The Bosnians and the last Serbian troops yield the field', 'dashed'),
    ],
    clashes: [{ at: P(200, -580), size: 200 }, { at: P(-2110, 700), size: 200 }, { at: P(-1650, 925), size: 200 }],
  },
  markers: {
    'kosovo-bayezid-bayezid': mark(300, -350, 915, -703, 'Bayezid', 'Leads the counterattack', 'ottomans'),
    'kosovo-bayezid-lazar': mark(-300, -850, 35, 1064, 'Lazar', 'Captured and beheaded', 'serbia', 'skull'),
    'kosovo-bayezid-brankovic': mark(-1900, -1300, -100, -700, 'Vuk Branković', 'Leaves the field with his troops', 'serbia'),
    'kosovo-bayezid-vukovic': mark(1300, -1100, 1224, -103, 'Vlatko Vuković', 'The Bosnians yield the field', 'bosnia'),
    'kosovo-bayezid-knights': mark(-1650, 700, 1329, -69, 'Serbian heavy horse', 'Hemmed in by light troops', 'serbia', 'swords'),
  },
});

console.log('kosovo: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 0)), 'tomb at', JSON.stringify([21.1042, 42.7019]));
