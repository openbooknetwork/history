// Marengo, 14 June 1800, on the plain east of Alessandria. The Austrians cross the Bormida by two bridges in a bend
// of the river and attack east across the Fontanone stream at Marengo. The French fall back towards San Giuliano,
// 7 km east, where Desaix arrives in the evening.
// Frame: origin on Marengo village, u north, w east, from the Austrians towards the French.
import { frame, writePlan } from './lib.mjs';

const f = frame([8.6775, 44.8856], 0), P = f.p, AUS = f.face(90), FR = f.face(270);
const G = 'pages/040-second-coalition/030-marengo';
const water = [
  { path: [[8.585, 44.845], [8.605, 44.865], [8.622, 44.885], [8.633, 44.896], [8.645, 44.902], [8.641, 44.911], [8.643, 44.92], [8.652, 44.932], [8.665, 44.945]], width: 80, id: 'bormida', name: 'The river Bormida' },
  { path: [[8.668, 44.862], [8.671, 44.875], [8.6725, 44.886], [8.673, 44.898], [8.676, 44.91]], width: 25, id: 'fontanone', name: 'The Fontanone stream' },
];
const bbox = f.box([[-3200, -3200], [4500, 7500]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : AUS, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: over the Alps and down to the plain of Alessandria ---
writePlan(`${G}/010-marengo`, {
  routes: {
    'reserve-army-1800': { name: 'The Reserve Army crosses the Great St Bernard and marches to Milan, May to 2 June 1800',
      path: [[7.07, 46.1], [7.17, 45.87], [7.32, 45.74], [7.75, 45.61], [7.87, 45.47], [8.4, 45.33], [8.8, 45.45], [9.19, 45.46]] },
    'lannes-1800': { name: 'The French cross the Po and march by Stradella towards Alessandria, 3 to 13 June 1800',
      path: [[9.19, 45.46], [9.16, 45.19], [9.35, 45.08], [9.18, 45.03], [9.0, 44.99], [8.8, 44.9], [8.72, 44.885]] },
    'ott-1800': { name: 'Ott’s corps marches north from Genoa to Montebello, 7 to 9 June 1800',
      path: [[8.93, 44.41], [8.88, 44.55], [8.79, 44.76], [8.95, 44.92], [9.08, 44.99]] },
    'melas-1800': { name: 'Melas gathers his army at Alessandria, June 1800',
      path: [[7.68, 45.07], [8.21, 44.9], [8.6, 44.91]] },
  },
  markers: {
    'marengo-st-bernard': { lnglat: [7.17, 45.87], icon: 'flag', color: 'france', label: 'Great St Bernard', note: 'Crossed from 15 May 1800' },
    'marengo-bard': { lnglat: [7.75, 45.61], icon: 'castle', color: 'austria', label: 'Fort Bard', note: 'Holds out for two weeks' },
    'marengo-milan': { lnglat: [9.19, 45.46], icon: 'flag', color: 'france', label: 'Milan', note: 'Taken 2 June' },
    'marengo-genoa': { lnglat: [8.93, 44.41], icon: 'flag', color: 'austria', label: 'Genoa', note: 'Masséna surrenders, 4 June' },
    'marengo-montebello': { lnglat: [9.1, 45.0], icon: 'swords', color: 'france', label: 'Montebello', note: 'Lannes beats Ott, 9 June' },
  },
});

// --- morning: the attack across the Fontanone ---
writePlan(`${G}/020-marengo-fontanone`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('france', 'infantry', 350, -60, 900, 200, 'gardanne', 'Gardanne’s division of Victor’s corps, fallen back behind the stream'),
      unit('france', 'infantry', -750, -40, 900, 200, 'chambarlhac', 'Chambarlhac’s division of Victor’s corps'),
      unit('france', 'cavalry', -1900, 250, 400, 150, 'kellermann', 'Kellermann’s heavy cavalry brigade'),
      unit('france', 'infantry', 1500, 650, 900, 200, 'lannes', 'Lannes’s corps, Watrin’s division'),
      unit('austria', 'infantry', 0, -950, 1500, 300, 'centre', 'Hadik’s and Kaim’s divisions under Melas, attacking across the Fontanone'),
      unit('austria', 'infantry', 250, -1750, 800, 250, 'morzin', 'Morzin’s grenadier division'),
      unit('austria', 'artillery', 450, -620, 300, 50, 'battery', 'Frimont’s battery along the stream', { count: 6 }),
      unit('austria', 'infantry', -1950, -1250, 800, 200, 'oreilly', 'O’Reilly’s division and Frimont’s advance guard, about 4,500', { facing: 150 }),
      unit('austria', 'infantry', 3150, 1500, 150, 800, 'ott', 'Ott’s column, 7,500, marching on Castel Ceriolo', { facing: 60 }),
    ],
    arrows: [
      arrow('austria', [[0, -750], [0, -420], [0, -200]], 140, 'hadik-attack', 'Hadik and then Kaim attack across the Fontanone and are thrown back'),
      arrow('austria', [[-1750, -1350], [-2100, -950], [-2300, -650]], 120, 'oreilly-advance', 'O’Reilly pushes south towards La Stortiglione'),
      arrow('austria', [[1900, -2300], [2500, -900], [3100, 700], [3700, 2300]], 120, 'ott-march', 'Ott marches north-east and takes Castel Ceriolo, 11:30'),
      arrow('austria', [[-1450, -1050], [-1650, -450], [-1800, 0]], 100, 'pilatti', 'Pilatti’s dragoons try to cross at the southern end and are thrown back by Kellermann'),
      arrow('france', [[1900, 3300], [1700, 2000], [1550, 950]], 120, 'lannes-arrives', 'Lannes arrives on Victor’s right'),
    ],
    clashes: [P(0, -180), P(400, -200), { at: P(-1820, 100), size: 130 }, { at: P(3780, 2565), size: 130 }],
  },
  markers: {
    'marengo-fontanone-melas': mark(-500, -2000, 'Melas', 'About 18,000 against Marengo', 'austria'),
    'marengo-fontanone-hadik': mark(650, -1250, 'Hadik', 'Mortally wounded', 'austria', 'skull'),
    'marengo-fontanone-victor': mark(-250, 650, 'Victor', 'Holds the Fontanone until noon', 'france'),
    'marengo-fontanone-lannes': mark(1850, 1350, 'Lannes', 'Deploys north of Marengo', 'france'),
    'marengo-fontanone-ott': mark(2700, -350, 'Ott', '7,500 men', 'austria'),
    'marengo-fontanone-castel-ceriolo': mark(4000, 2565, 'Castel Ceriolo', 'Taken by Ott, 11:30', 'austria', 'flag'),
  },
});

// --- afternoon: Marengo falls, the French fall back towards San Giuliano ---
writePlan(`${G}/030-marengo-retreat`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('france', 'infantry', -700, 1900, 1400, 250, 'victor', 'Victor’s corps, falling back through the vines'),
      unit('france', 'infantry', 650, 2400, 1000, 200, 'lannes', 'Lannes’s corps, falling back with Victor'),
      unit('france', 'infantry', 2900, 4300, 800, 200, 'monnier', 'Monnier’s division, driven back to the north-east', { facing: 300 }),
      unit('france', 'infantry', 2050, 2650, 220, 80, 'guard', 'Infantry of the Consular Guard, against Schellenberg’s column', { facing: 330 }),
      unit('france', 'cavalry', -1700, 1900, 400, 150, 'kellermann', 'Kellermann’s cavalry, covering the left'),
      unit('austria', 'infantry', 150, 250, 900, 250, 'centre', 'Kaim’s division and Lattermann’s grenadiers in Marengo'),
      unit('austria', 'infantry', -500, 1000, 300, 900, 'zach', 'Zach’s pursuit column forming around Spinetta', { facing: 100 }),
      unit('austria', 'infantry', -2500, -200, 700, 200, 'oreilly', 'O’Reilly’s division, past La Stortiglione', { facing: 150 }),
      unit('austria', 'infantry', 2750, 2300, 150, 700, 'ott', 'Schellenberg’s column of Ott’s corps, moving south', { facing: 180 }),
      unit('austria', 'cavalry', 1700, 1900, 400, 150, 'frimont', 'Frimont’s cavalry'),
    ],
    arrows: [
      arrow('france', [[200, 500], [-200, 1200], [-550, 1650]], 130, 'victor-withdraws', 'Victor and Lannes fall back south-east to the vines', 'dashed'),
      arrow('france', [[-700, 2150], [-850, 3000], [-950, 3900]], 130, 'retreat', 'The French fall back about 3 km towards San Giuliano', 'dashed'),
      arrow('austria', [[1750, 2000], [1900, 2300], [2000, 2550]], 110, 'frimont-charge', 'Frimont’s cavalry falls on the Consular Guard, about 16:00'),
      arrow('austria', [[3500, 2350], [3250, 2330], [3150, 2310]], 110, 'ott-south', 'Schellenberg’s column advances south from Castel Ceriolo'),
    ],
    clashes: [P(2080, 2560), { at: P(2550, 3900), size: 130 }],
  },
  markers: {
    'marengo-retreat-marengo': mark(-150, -900, 'Marengo', 'Taken about 14:30', 'austria', 'flag'),
    'marengo-retreat-melas': mark(1000, -900, 'Melas', 'Hands over command, wounded', 'austria'),
    'marengo-retreat-zach': mark(-1500, 1100, 'Zach', 'Forms the pursuit column', 'austria'),
    'marengo-retreat-guard': mark(2350, 3100, 'Consular Guard', 'Cut to pieces, about 16:00', 'france', 'skull'),
    'marengo-retreat-bonaparte': mark(-300, 3500, 'Bonaparte', 'Falls back towards San Giuliano', 'france'),
  },
});

// --- evening: Desaix and Kellermann ---
writePlan(`${G}/040-marengo-desaix`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('france', 'infantry', -750, 4300, 1200, 250, 'boudet', 'Boudet’s division under Desaix, 6,000'),
      unit('france', 'light', -700, 3900, 600, 60, 'ninth-light', 'The 9th Light Infantry'),
      unit('france', 'artillery', -200, 4100, 500, 50, 'marmont', 'Marmont’s massed guns', { count: 8 }),
      unit('france', 'cavalry', 350, 3750, 350, 150, 'kellermann', 'Kellermann’s heavy cavalry, about 400', { facing: 210 }),
      unit('france', 'infantry', 1100, 4600, 1500, 200, 'lannes', 'Lannes, Monnier and the rallied troops'),
      unit('austria', 'infantry', -680, 3520, 400, 150, 'saint-julien', 'Saint-Julien’s leading brigade'),
      unit('austria', 'infantry', -560, 3080, 500, 250, 'lattermann', 'Lattermann’s grenadiers under Zach'),
      unit('austria', 'artillery', 80, 3050, 400, 50, 'batteries', 'Three Austrian batteries north of the road', { count: 6 }),
      unit('austria', 'cavalry', -150, 2550, 350, 150, 'liechtenstein', 'The Liechtenstein dragoons'),
      unit('austria', 'infantry', 2500, 2400, 700, 200, 'ott', 'Ott’s corps, hesitating in the north'),
      unit('austria', 'infantry', -2500, 1500, 700, 200, 'oreilly', 'O’Reilly’s division, too far south', { facing: 120 }),
    ],
    arrows: [
      arrow('france', [[350, 3600], [50, 3350], [-400, 3200]], 130, 'kellermann-charge', 'Kellermann charges the grenadiers in the flank'),
      arrow('france', [[-750, 4150], [-720, 3900], [-700, 3680]], 120, 'boudet-attack', 'Boudet’s division throws back Saint-Julien'),
      arrow('austria', [[-500, 2800], [-250, 1200], [300, -1300], [1300, -2300]], 110, 'austrian-flight', 'The Austrian centre flees back to the Bormida', 'dashed'),
      arrow('austria', [[2400, 2150], [2300, 200], [1900, -2100]], 100, 'ott-back', 'Ott fights his way back to the bridgehead', 'dashed'),
    ],
    clashes: [P(-700, 3700), P(-380, 3250)],
  },
  markers: {
    'marengo-desaix-desaix': mark(-1500, 4400, 'Desaix', 'Killed in the attack', 'france', 'skull'),
    'marengo-desaix-kellermann': mark(1100, 3300, 'Kellermann', 'About 400 heavy cavalry', 'france'),
    'marengo-desaix-marmont': mark(400, 5300, 'Marmont', 'Masses the guns', 'france'),
    'marengo-desaix-zach': mark(-1300, 2500, 'Zach', 'Taken with 2,000 men', 'austria'),
    'marengo-desaix-san-giuliano': mark(-1180, 6906, 'San Giuliano', 'French rallying point', 'france', 'flag'),
  },
});

console.log('marengo: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 0)));
