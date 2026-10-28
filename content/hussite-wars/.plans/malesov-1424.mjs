// Malešov, 7 June 1424, on the slope south of the fortress where the memorial stone stands. The site is not known
// exactly. Frame: origin at the centre of Žižka's line, u along it (south-south-west), w from Žižka towards the valley.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/080-year-1424/020-malesov';
const f = frame([15.233, 49.9035], 190), P = f.p, ZIZKA = f.face(90), PRAGUE = f.face(270);
const bbox = [15.217, 49.8957, 15.2395, 49.9145];

// compass bearings: the march down the valley from the fortress to the ford, and the flight back north
const MARCH = 167, NORTH = 345;
const brook = {
  path: [[15.23398, 49.8957], [15.23184, 49.89622], [15.23003, 49.89708], [15.2284, 49.89813], [15.2275, 49.8986], [15.22639, 49.89987],
    [15.22583, 49.90236], [15.22634, 49.90302], [15.22634, 49.90446], [15.2263, 49.90518], [15.22548, 49.90571], [15.22467, 49.90623],
    [15.22463, 49.90767], [15.22407, 49.9083], [15.22403, 49.90902], [15.22317, 49.90949], [15.22235, 49.91002], [15.22154, 49.91054],
    [15.22042, 49.91068], [15.219, 49.9115], [15.2165, 49.9112], [15.2143, 49.911]],
  width: 18, id: 'brook',
  name: 'The brook in the narrow valley south of Malešov, the Bohynka of Hugo Toman’s map of 1898. Traced from the elevation of today',
};
const ground = { water: [brook] };
const fortress = { side: 'neutral', type: 'fort', at: [15.224, 49.9114], width: 90, facing: 0, id: 'fortress', name: 'The fortress of Malešov, 6 km south-west of Kutná Hora' };

const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const idea = (u, w, label, note, color = 'orebites') => mark(u, w, label, note, color, 'lightbulb');
const clash = (u, w) => ({ at: P(u, w), size: 56 });

const FOOT = 'Orebite and Taborite foot with flails, halberds, spears and handguns, 7,000 in May by Bartošek of Drahonice';
const WAGONS = 'Battle wagons in a line, 300 in May by Bartošek of Drahonice. They stand ready to roll forward with the foot, and handguns fire from them';
const GUNS = 'Žižka’s field guns and howitzers between the wagons';
const HORSE = 'Žižka’s horse, 500 by Bartošek, held back on the wings';
const STONES = 'Hay wagons loaded with stones in the centre of the line, hidden from the enemy, by the younger Old Czech Annals';
const PRAGUE_ARMY = 'The army of Prague and the lords: Prague militia, Utraquist lords and Catholic men of the Landfried of Plzeň under Diviš Bořek of Miletínek. Larger than Žižka’s army by every account, numbers unknown';

// Žižka's line on the slope, the same on the first two phases
const line = (stones = true) => [
  unit('orebites', 'wagons', -330, 0, 300, 36, ZIZKA, 'wagons', WAGONS, { count: 14 }),
  unit('orebites', 'artillery', -125, 0, 95, 38, ZIZKA, 'guns', GUNS, { count: 3 }),
  ...(stones ? [unit('orebites', 'wagons', 0, 10, 120, 34, ZIZKA, 'stone-wagons', STONES, { count: 5 })] : []),
  unit('orebites', 'artillery', 125, 0, 95, 38, ZIZKA, 'guns', GUNS, { count: 3 }),
  unit('orebites', 'wagons', 330, 0, 300, 36, ZIZKA, 'wagons', WAGONS, { count: 14 }),
  unit('orebites', 'infantry', 0, -110, 820, 80, ZIZKA, 'foot', FOOT),
  unit('orebites', 'cavalry', -600, -70, 110, 60, ZIZKA, 'horse', HORSE),
  unit('orebites', 'cavalry', 600, -70, 110, 60, ZIZKA, 'horse', HORSE),
];

// --- overview: the chase from Žatec and Kostelec nad Labem to Malešov ---
writePlan(`${G}/010-malesov`, {
  routes: {
    'zizka-1424-kostelec': { name: 'Žižka withdraws from Žatec to Kostelec nad Labem, late May 1424', color: 'orebites', path: [[13.546, 50.327], [13.797, 50.357], [14.087, 50.23], [14.33, 50.24], [14.578, 50.222]] },
    'zizka-1424-malesov': { name: 'Žižka crosses the Elbe by night, retreats along the right bank and turns south to Malešov, June 1424', color: 'orebites', path: [[14.578, 50.222], [14.64, 50.215], [14.675, 50.197], [14.833, 50.205], [14.98, 50.2], [15.05, 50.165], [15.13, 50.1], [15.2, 50.035], [15.215, 49.96], [15.233, 49.9035]] },
    'prague-1424-malesov': { name: 'The army of Prague and the lords follows along the left bank of the Elbe, June 1424', color: 'prague', offset: 6, path: [[14.585, 50.215], [14.663, 50.183], [14.75, 50.16], [14.95, 50.155], [15.119, 50.138], [15.19, 50.03], [15.205, 49.96], [15.224, 49.912]] },
  },
  markers: {
    'plzen-1424': { lnglat: [13.378, 49.747], icon: 'castle', color: 'royalists', label: 'Plzeň', note: 'The Landfried marches out, 17 May' },
    'zatec-1424': { lnglat: [13.546, 50.327], icon: 'flag', color: 'orebites', label: 'Žatec', note: 'Žižka withdraws here in May' },
    'kostelec-1424': { lnglat: [14.578, 50.222], icon: 'flag', color: 'orebites', label: 'Kostelec nad Labem', note: 'Surrounded, Žižka crosses the Elbe by night' },
  },
});

// --- the ground: Žižka on the slope, the Prague column comes down the valley past the fortress ---
writePlan(`${G}/020-malesov-ground`, {
  bbox,
  emblem: {
    ...ground,
    units: [
      ...line(),
      unit('prague', 'knights', 48, 487, 150, 50, 120, 'prague-head', 'The head of the column: Prague men at arms and the lords’ horse, crossing the brook'),
      unit('prague', 'infantry', -196, 579, 95, 300, MARCH, 'prague-column', PRAGUE_ARMY),
      unit('prague', 'infantry', -439, 671, 95, 180, MARCH, 'prague-rear', 'The rear of the column, still coming down past the fortress'),
      unit('prague', 'wagons', -608, 734, 150, 40, MARCH - 90, 'prague-wagons', 'The wagons and guns of Prague at the rear of the column', { count: 8, rows: 2 }),
      fortress,
    ],
    arrows: [
      arrow('prague', [[-1000, 1010], [-640, 900], [-330, 790], [-120, 690]], 45, 'prague-march', 'The army of Prague and the lords follows Žižka’s track past the fortress and down into the valley. By the Old Czech Annals they do not wait for all their men to come up'),
    ],
  },
  markers: {
    'malesov-ground-zizka': mark(0, -240, 'Jan Žižka', 'Blind, with Jan Hvězda of Vícemilice', 'orebites'),
    'malesov-ground-borek': mark(150, 800, 'Diviš Bořek of Miletínek', 'Leads Prague and the lords', 'prague'),
    'malesov-ground-slope': idea(330, 260, 'Chosen ground', 'Enemy must cross, then climb'),
    'malesov-ground-valley': idea(-420, 420, 'Narrow valley', 'No room to deploy'),
    'malesov-ground-stones': idea(0, 150, 'Hidden stone wagons', 'In the centre of the line'),
  },
});

// --- the wagons of stones: half the column is across the brook, the wagons run down into its head ---
writePlan(`${G}/030-malesov-wagons`, {
  bbox,
  emblem: {
    ...ground,
    units: [
      ...line(false),
      unit('prague', 'infantry', 70, 300, 300, 70, PRAGUE, 'prague-head', 'Half of the Prague army, across the brook and climbing towards the wagons'),
      unit('prague', 'infantry', -224, 589, 95, 300, MARCH, 'prague-column', 'The other half of the column, still in the valley and on the road from the fortress'),
      unit('prague', 'wagons', -608, 734, 150, 40, MARCH - 90, 'prague-wagons', 'The wagons and guns of Prague at the rear of the column', { count: 8, rows: 2 }),
      fortress,
    ],
    arrows: [
      ...[-40, 0, 40].map(du => arrow('orebites', [[du, 30], [du + 15, 150], [du + 30, 255]], 30, 'stone-wagons', 'Hay wagons loaded with stones run down the slope into the head of the column and break its ranks, by the younger Old Czech Annals. Men on foot cannot stand against them, and the narrow valley leaves no room to step aside')),
      arrow('orebites', [[-125, 30], [-60, 250]], 70, 'gunfire', 'The guns fire into the confusion', 'fire'),
      arrow('orebites', [[125, 30], [150, 250]], 70, 'gunfire', 'The guns fire into the confusion', 'fire'),
    ],
    clashes: [clash(0, 262), clash(120, 262)],
  },
  markers: {
    'malesov-wagons-zizka': mark(0, -240, 'Jan Žižka', 'Orders the wagons let go', 'orebites'),
    'malesov-wagons-head': mark(60, 580, 'Head of the column', 'Ranks broken by the wagons', 'prague', 'swords'),
    'malesov-wagons-stones': idea(-300, 230, 'Wagons of stones', 'Rolled into the column'),
    'malesov-wagons-guns': idea(330, 160, 'Guns', 'Fire into the confusion'),
  },
});

// --- the charge and the pursuit: the foot go down the slope, the horse ride after the fleeing army ---
writePlan(`${G}/040-malesov-rout`, {
  bbox,
  emblem: {
    ...ground,
    units: [
      unit('orebites', 'wagons', -330, 160, 300, 36, ZIZKA, 'wagons', 'The battle wagons roll forward with the foot', { count: 14 }),
      unit('orebites', 'wagons', 330, 160, 300, 36, ZIZKA, 'wagons', 'The battle wagons roll forward with the foot', { count: 14 }),
      unit('orebites', 'infantry', 0, 300, 360, 80, ZIZKA, 'foot', 'Žižka’s foot at the bottom of the slope after the charge'),
      unit('orebites', 'cavalry', -700, 580, 110, 60, NORTH, 'horse', 'Žižka’s horse, released from the wings, ride after the fleeing army'),
      unit('orebites', 'cavalry', -380, 500, 110, 60, NORTH, 'horse', 'Žižka’s horse, released from the wings, ride after the fleeing army'),
      unit('prague', 'wagons', -608, 734, 150, 40, MARCH - 90, 'prague-wagons', 'The wagons and guns of Prague, left on the field and taken by Žižka', { count: 8, rows: 2 }),
      fortress,
    ],
    arrows: [
      arrow('orebites', [[0, -60], [0, 120], [0, 255]], 60, 'charge', 'Žižka’s foot charge down the slope behind the wagons'),
      arrow('prague', [[60, 430], [-200, 600], [-470, 760], [-720, 900], [-1000, 960]], 50, 'flight', 'The head of the column flees back across the brook and up the valley past the fortress, and the rear flees with it', 'dashed'),
      arrow('orebites', [[-600, -40], [-580, 250], [-640, 480], [-673, 560]], 40, 'pursuit', 'The horse ride down from the wings after the fugitives'),
      arrow('orebites', [[600, -40], [460, 170], [260, 330], [60, 420], [-353, 490]], 40, 'pursuit', 'The horse ride down from the wings after the fugitives'),
    ],
    clashes: [clash(0, 390)],
  },
  markers: {
    'malesov-rout-zizka': mark(0, -60, 'Jan Žižka', 'Victory on ground he chose', 'orebites'),
    'malesov-rout-turkovec': mark(150, 680, 'Petr Turkovec', 'Prague banner bearer, killed', 'prague', 'skull'),
    'malesov-rout-charge': idea(330, 20, 'Charge downhill', 'Foot and wagons go forward'),
    'malesov-rout-horse': idea(-330, 300, 'Horse held back', 'Released for the pursuit'),
  },
});

console.log('malesov-1424: bbox', JSON.stringify(bbox), 'Žižka at', JSON.stringify(P(0, 0)), 'ford at', JSON.stringify(P(84, 473)));
