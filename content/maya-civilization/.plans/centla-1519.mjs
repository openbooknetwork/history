// Centla, 13 and 14 March 1519. Cortés takes Potonchán from the river while Ávila comes in by the road, then
// fights the Chontal army on the plain towards Cintla, where the horsemen come up behind it (Bernal Díaz).
// Potonchán stands at the coordinates of the English article, on the bank of the Grijalva as the map draws it.
// The site of the plain is not recorded: the plan puts it about 4.5 km south-east of the town.
// Units and gaps are drawn larger than real, as the README's "Drawn size" asks.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/070-first-contact/060-centla';
const unitIn = f => (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: f.p(u, w), width, depth, facing, id, name, ...extra });
const arrowIn = f => (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const markIn = f => (u, w, label, note, color, icon = 'user') => ({ lnglat: f.p(u, w), icon, color, label, note });
const clashIn = f => (u, w) => ({ at: f.p(u, w), size: 42 });

// --- the town: u north along the bank, w east from the river; origin in the middle of Potonchán ---
const t = frame([-92.661, 18.521], 0), unitT = unitIn(t), arrowT = arrowIn(t), markT = markIn(t), clashT = clashIn(t);
const town = t.p(0, 0);

// --- the plain: u east-north-east, w from the Spanish foot towards the Chontal army ---
const p = frame([-92.638, 18.484], 60), unitP = unitIn(p), arrowP = arrowIn(p), markP = markIn(p), clashP = clashIn(p);
const SPAIN = p.face(90), CHONTAL = p.face(270);
// north-up and square, so the rotated frame does not widen the view
const plainBox = frame(p.p(-110, 190), 0).box([[-750, -750], [750, 750]], 0);
const marsh = { area: p.path([[-590, -336], [-411, -384], [-330, -160], [-349, 200], [-435, 384], [-578, 336], [-628, 40]]), id: 'marsh', name: 'Swamp on the plain' };

// --- overview: from Cozumel round Yucatán to the Grijalva River ---
writePlan(`${G}/010-centla`, {
  routes: {
    'cortes-tabasco-1519': {
      name: 'Cortés’s fleet from Cozumel to the Grijalva River, March 1519',
      path: [[-86.99, 20.55], [-86.86, 20.66], [-86.72, 20.88], [-86.62, 21.2], [-86.72, 21.5], [-86.98, 21.74], [-87.6, 21.71], [-88.2, 21.74], [-88.8, 21.66],
        [-89.4, 21.52], [-89.95, 21.4], [-90.35, 21.23], [-90.56, 21.0], [-90.64, 20.7], [-90.66, 20.4], [-90.68, 20.1], [-90.66, 19.9], [-90.8, 19.7], [-90.84, 19.5],
        [-90.81, 19.37], [-90.93, 19.24], [-91.13, 19.09], [-91.43, 18.94], [-91.73, 18.79], [-92.08, 18.74], [-92.43, 18.69], [-92.69, 18.645]],
    },
  },
  markers: {
    'potonchan-1519': { lnglat: town, icon: 'crown', color: 'chontal', label: 'Potonchán', note: 'Capital of Tabscoob' },
    'xicalango-1519': { lnglat: [-92.0, 18.63], icon: 'landmark', color: 'nahua', label: 'Xicalango', note: 'Nahua port, rival of Potonchán' },
  },
  show: ['cozumel-1519', 'campeche-1517'],
});

// --- 13 March: Cortés lands from the boats, Ávila comes in at the rear ---
// the east bank of the river as the map draws it, and the river out to the west edge of the plan
const river = { area: t.path([[-1500, -1160], [-700, -800], [0, -475], [900, -340], [1658, -211], [2500, -360], [3300, -560], [3300, -1800], [-1500, -1800]]), id: 'river', name: 'The Tabasco River, named the Grijalva by the Spanish' };
writePlan(`${G}/020-centla-potonchan`, {
  bbox: t.box([[-650, -850], [850, 650]], 0),
  emblem: {
    water: [
      river,
      { area: t.path([[450, -150], [900, -260], [1350, -150], [1450, 250], [1200, 600], [700, 650], [450, 350]]), id: 'swamps', name: 'Swamps beside the town' },
      { area: t.path([[-500, -350], [-950, -520], [-1000, 100], [-900, 700], [-550, 750], [-450, 250]]), id: 'swamps', name: 'Swamps beside the town' },
    ],
    works: [
      { side: 'chontal', path: t.path([[-380, 200], [-330, -220], [0, -300], [330, -230], [400, 120], [330, 380], [0, 450], [-300, 380], [-380, 200]]), width: 12, id: 'palisade', name: 'Wall of thick timbers round the town' },
    ],
    units: [
      unitT('spain', 'ships', 60, -650, 220, 40, 90, 'boats', 'The ships’ boats, with crossbowmen and musketeers', { count: 6 }),
      unitT('spain', 'infantry', 60, -540, 140, 32, 90, 'cortes', 'Cortés and the main body, in water up to the waist'),
      unitT('chontal', 'infantry', 60, -400, 320, 60, 270, 'bank-warriors', 'Chontal warriors on the bank'),
      unitT('chontal', 'ships', -350, -760, 260, 40, 60, 'canoes', 'Chontal war canoes', { count: 5 }),
      unitT('chontal', 'infantry', 0, 40, 380, 120, 270, 'garrison', 'Warriors of Potonchán inside the wall'),
      unitT('spain', 'infantry', 300, 560, 80, 32, 240, 'avila', 'Alonso de Ávila with 100 soldiers'),
    ],
    arrows: [
      arrowT('spain', [[2500, -650], [1500, -650], [500, -680], [180, -660]], 34, 'upriver', 'Cortés takes the boats upriver'),
      arrowT('spain', [[2600, -250], [2300, 500], [1600, 900], [900, 700], [560, 620], [350, 580]], 34, 'avila-road', 'Ávila marches by the road to the rear of the town'),
      arrowT('chontal', [[-310, -730], [-70, -645]], 30, 'canoe-attack', 'The canoes close in, shooting arrows'),
    ],
    clashes: [clashT(60, -477), clashT(276, 470)],
  },
  markers: {
    'centla-potonchan-cortes': markT(330, -480, 'Cortés', 'Loses a shoe in the mud', 'spain'),
    'centla-potonchan-avila': markT(500, 380, 'Alonso de Ávila', '100 soldiers by the road', 'spain'),
    'centla-potonchan-palmares': markT(2650, -150, 'Punta de los Palmares', 'Spanish camp, 12 March', 'spain', 'flag'),
    'centla-potonchan-town': markT(-150, 250, 'Potonchán', 'Main square with three temples', 'chontal', 'landmark'),
  },
});

// --- 14 March, the first hour: the foot surrounded on the plain, the horse riding round ---
writePlan(`${G}/030-centla-plain`, {
  bbox: plainBox,
  emblem: {
    water: [marsh],
    units: [
      unitP('spain', 'infantry', 0, 0, 90, 40, SPAIN, 'foot', 'The Spanish foot with crossbows and muskets'),
      unitP('spain', 'artillery', 0, 42, 80, 30, SPAIN, 'guns', 'Spanish guns', { count: 3 }),
      unitP('chontal', 'infantry', 0, 265, 560, 120, CHONTAL, 'army', 'The Chontal army, 40,000 by Cortés and Bernal Díaz'),
      unitP('chontal', 'infantry', -255, 0, 200, 80, p.face(0), 'flanks', 'Chontal squadrons on the flank'),
      unitP('chontal', 'infantry', 255, 0, 200, 80, p.face(180), 'flanks', 'Chontal squadrons on the flank'),
      unitP('chontal', 'irregular', 0, -160, 320, 70, SPAIN, 'rear', 'Chontal squadrons closing behind'),
      unitP('spain', 'cavalry', -560, 470, 80, 32, p.face(60), 'horse', 'Cortés and the horsemen'),
    ],
    arrows: [
      arrowP('chontal', [[0, 205], [0, 60]], 24, 'attack', 'The Chontal attack from every side'),
      arrowP('chontal', [[-215, 0], [-48, 0]], 24, 'attack', 'The Chontal attack from every side'),
      arrowP('chontal', [[215, 0], [48, 0]], 24, 'attack', 'The Chontal attack from every side'),
      arrowP('spain', [[-420, -650], [-600, -380], [-690, 0], [-660, 330], [-605, 440]], 30, 'ride', 'The horsemen ride round to come up behind the Chontal'),
    ],
    clashes: [clashP(0, 160), clashP(-162, 0), clashP(162, 0), clashP(0, -72)],
  },
  markers: {
    'centla-plain-tabscoob': markP(0, 400, 'Tabscoob', 'Chontal army from eight provinces', 'chontal'),
    'centla-plain-foot': markP(330, -300, 'Spanish foot', 'Over seventy wounded at first', 'spain', 'swords'),
    'centla-plain-cortes': markP(-560, 590, 'Cortés', 'With the horsemen', 'spain'),
  },
});

// --- after about an hour: the horse falls on the Chontal rear and the army breaks ---
writePlan(`${G}/040-centla-horse`, {
  bbox: plainBox,
  emblem: {
    water: [marsh],
    units: [
      unitP('spain', 'infantry', 0, 95, 90, 40, SPAIN, 'foot', 'The Spanish foot pressing forward'),
      unitP('spain', 'cavalry', -20, 470, 80, 32, CHONTAL, 'horse', 'Cortés and the horsemen charge the Chontal rear'),
      unitP('chontal', 'irregular', 150, 300, 440, 120, SPAIN, 'army', 'The Chontal army breaking'),
      unitP('chontal', 'irregular', 380, 60, 200, 80, SPAIN, 'flanks', 'Chontal squadrons in flight'),
    ],
    arrows: [
      arrowP('spain', [[-560, 470], [-300, 485], [-65, 470]], 30, 'charge', 'The horsemen come up behind the Chontal'),
      arrowP('spain', [[0, 117], [0, 245]], 24, 'advance', 'The foot press forward'),
      arrowP('chontal', [[200, 370], [330, 520], [430, 640]], 40, 'flight', 'The Chontal flee', 'dashed'),
      arrowP('chontal', [[490, 70], [600, 140], [700, 200]], 36, 'flight', 'The Chontal flee', 'dashed'),
    ],
    clashes: [clashP(-20, 402), clashP(0, 158)],
  },
  markers: {
    'centla-horse-cortes': markP(-200, 600, 'Cortés', 'The horsemen take the Chontal in the rear', 'spain'),
    'centla-horse-dead': markP(120, 560, 'Chontal dead', 'More than 800, by Bernal Díaz', 'chontal', 'skull'),
    'centla-horse-foot': markP(-100, -150, 'Spanish foot', 'Two killed, about seventy wounded', 'spain', 'swords'),
  },
});

console.log('centla-1519: plain bbox', JSON.stringify(plainBox), 'battle at', JSON.stringify(p.p(0, 100)));
