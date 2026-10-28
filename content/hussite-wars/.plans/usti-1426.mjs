// Ústí nad Labem, 16 June 1426. The Hussite unions lift the siege of Ústí on 15 June and stand in a wagon fort on the
// low hill Na Běhání between Hrbovice and Předlice, 5 km west of the town, at the coordinates of the Czech article.
// The Saxon relief army comes from Chabařovice and attacks up the gentle slope from the north and north-east, out of
// the valley of the Ždírnický brook (Prokeš). The hill was dug away by a brown coal mine in 1977–1997, so the relief
// tiles show the mine's levelled ground. The brook follows its present course from OpenStreetMap.
// Frame: u east along the front of the fort, w south, from the crusaders towards the Hussites.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/090-prokop/020-usti';
const f = frame([13.9648, 50.6598], 90), P = f.p, PP = f.path;
const bbox = f.box([[-1000, -1250], [1050, 500]], 0);

const brook = {
  path: [[13.9392, 50.6793], [13.9421, 50.6773], [13.9488, 50.6771], [13.9562, 50.676], [13.9611, 50.6738], [13.9685, 50.6728], [13.97, 50.6725],
    [13.9718, 50.6714], [13.9719, 50.6687], [13.9729, 50.6663], [13.9759, 50.6641], [13.9795, 50.6631], [13.9814, 50.6611], [13.9854, 50.6599],
    [13.9885, 50.6585], [13.9911, 50.658], [13.9962, 50.6551], [14.001, 50.6539]],
  width: 12, id: 'zdirnice-brook', name: 'The Ždírnický brook, on its present course. The relief army forms up in its valley between Český Újezd and Hrbovice.',
};
const ground = { water: [brook] };

// the compass bearing from one local point to another (u east, w south)
const toward = ([u0, w0], [u1, w1]) => ((Math.atan2(u1 - u0, -(w1 - w0)) * 180 / Math.PI) % 360 + 360) % 360;
const unit = (side, type, uw, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(...uw), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, id, name, style) => ({ side, path: PP(pts), width: 45, id, name, ...(style ? { style } : {}) });
const mark = (uw, label, note, color, icon = 'user') => ({ lnglat: P(...uw), icon, color, label, note });
const place = (uw, label, note, icon = 'house') => ({ lnglat: P(...uw), icon, label, ...(note ? { note } : {}) });
const tactic = (uw, label, note, color = 'taborites') => mark(uw, label, note, color, 'lightbulb');
const clash = uw => ({ at: P(...uw), size: 75 });

const NORTH = 0, SOUTH = 180;
const HUSSITES = 'about 11,000 by Čornej and Bělina, 24,000 to 25,000 by the chronicles';
const RELIEF = 'about 13,000 by Čornej and Bělina, 10,000 horse and 20,000 foot by Bartošek of Drahonice, 70,000 by the Old Czech Annals';
const HRBOVICE = [564, -178], PREDLICE = [1700, 120];

// --- the Hussites: one fort on every phase, its second line, guns and handguns inside ---
// gaps: compass bearings from the fort's centre where wagons are left out, for the breach and the sally
const fort = (name, gaps) => unit('taborites', 'wagon-fort', [0, 0], 900, 540, NORTH, 'wagon-fort', name, { count: 40, ...(gaps ? { gaps } : {}) });
const second = unit('taborites', 'wagons', [0, -80], 420, 70, NORTH, 'second-line',
  'Second line of wagons behind the north side. With some 500 wagons the Hussites can set two lines one behind the other (Čornej and Bělina).', { count: 9 });
const guns = name => [-300, 300].map(u => unit('taborites', 'artillery', [u, -90], 120, 70, NORTH, 'guns', name, { count: 3 }));
const handguns = name => unit('taborites', 'handguns', [0, 40], 380, 50, NORTH, 'handguns', name, { count: 8 });
// Lützow: behind the guns stand men covered by large shields whose pointed ends are driven into the ground
const pavises = name => unit('taborites', 'pavises', [0, -12], 380, 40, NORTH, 'pavises', name, { count: 12 });
const foot = name => unit('taborites', 'infantry', [0, 120], 380, 80, NORTH, 'hussite-foot', name);
const horse = name => unit('taborites', 'cavalry', [0, 210], 220, 50, NORTH, 'hussite-horse', name);

// --- morning: the fort on the hill, the relief army comes up from the brook valley and from Chabařovice ---
const NE = [350, -880], NW = [-780, -600], FOOT = [250, -1130];
writePlan(`${G}/020-usti-fort`, {
  bbox,
  emblem: {
    ...ground,
    units: [
      fort(`Wagon fort of the Hussite unions on Běhání hill: about 500 wagons by the chronicles, drawn as 40, chained wheel to wheel. Sigismund Korybut, Prokop the Great and Jan Roháč of Dubá command ${HUSSITES}. The hill was dug away by a coal mine in 1977–1997.`),
      second,
      ...guns('Howitzers (houfnice) and light field guns (tarasnice) aimed through gaps in the wagon line'),
      pavises('Pavise bearers: large shields with pointed ends driven into the ground, a cover behind the second line (Lützow)'),
      handguns('Handgunners with píšťaly, ready to fire through the gaps between the wagons'),
      foot('Hussite foot with flails, halberds and hooks, held inside the ring'),
      horse('Hussite horse, a few hundred, held inside the ring for a sally'),
      unit('empire', 'knights', NE, 650, 150, toward(NE, [0, 0]), 'relief-horse', `Knights and men at arms of Meissen, Saxony, Thuringia and Hesse under Boso of Vitzthum. The relief army: ${RELIEF}.`),
      unit('empire', 'knights', NW, 380, 130, toward(NW, [0, 0]), 'relief-horse-nw', 'Horse of the relief army coming on from Chabařovice in the north-west'),
      unit('empire', 'infantry', FOOT, 700, 130, toward(FOOT, [0, 0]), 'relief-foot', 'Foot of the relief army: townsmen and peasant levies, short of food after the march over the mountains'),
    ],
  },
  markers: {
    'usti-fort-korybut': mark([-800, 120], 'Sigismund Korybut', 'Commands the Praguers', 'taborites'),
    'usti-fort-prokop': mark([800, 120], 'Prokop the Great', 'Priest of the Taborite field army', 'taborites'),
    'usti-fort-boso': mark([-420, -1130], 'Boso of Vitzthum', 'Commands the relief army', 'empire'),
    'usti-fort-ring': tactic([0, 430], 'Wagon fort', 'Chained wheel to wheel'),
    'usti-fort-lines': tactic([-780, -280], 'Two lines of wagons', 'A second line behind the first'),
    'usti-fort-guns': tactic([780, -280], 'Guns at the gaps', 'Houfnice and tarasnice in the line'),
  },
});

// --- the attack: the knights overturn wagons and break the chain in one place, the second line stops them ---
const BREACH = [-60, -175], NE2 = [400, -440], NW2 = [-640, -330], FOOT2 = [250, -950];
writePlan(`${G}/030-usti-assault`, {
  bbox,
  emblem: {
    ...ground,
    units: [
      fort('The Hussite wagon fort, opened on the north side where the knights overturn a row of wagons and cut the chains', [{ bearing: 345, wagons: 3 }]),
      second,
      ...guns('Howitzers and field guns fire into the knights between the two lines of wagons'),
      pavises('Pavises behind the second line, the last cover before the foot'),
      handguns('Handgunners fire through the gaps of the second line at a few paces'),
      foot('Hussite foot with flails, halberds and long hooks that pull riders from the saddle'),
      horse('Hussite horse, waiting inside the ring'),
      unit('empire', 'knights', BREACH, 230, 80, SOUTH, 'breach', 'Knights who break through the first line of wagons and are held at the second, shot at from three sides'),
      unit('empire', 'knights', NE2, 320, 120, toward(NE2, [0, 0]), 'relief-horse', 'Knights attacking along the north-east side of the ring, under fire from the wagons'),
      unit('empire', 'knights', NW2, 300, 120, toward(NW2, [0, 0]), 'relief-horse-nw', 'Horse from Chabařovice attacking the west end of the ring'),
      unit('empire', 'infantry', FOOT2, 650, 130, toward(FOOT2, [0, 0]), 'relief-foot', 'Foot of the relief army following the horse up the slope in heat and dust'),
    ],
    arrows: [
      arrow('empire', [[-60, -980], [-65, -600], [-70, -300], [-65, -235]], 'main-attack', 'The main attack climbs the gentle slope from the brook valley and breaks the chain of the first line'),
      arrow('taborites', [[-300, -125], [-178, -168]], 'gunfire', 'Guns fire into the knights caught between the lines', 'fire'),
      arrow('taborites', [[300, -125], [58, -168]], 'gunfire', 'Guns fire into the knights caught between the lines', 'fire'),
      arrow('taborites', [[0, 15], [-30, -132]], 'handgun-fire', 'Handguns fire through the gaps of the second line', 'fire'),
    ],
    clashes: [clash([300, -290]), clash([-460, -235])],
  },
  markers: {
    'usti-assault-boso': mark([-420, -1130], 'Boso of Vitzthum', 'Sends his knights against the wagons', 'empire'),
    'usti-assault-knights': mark([-330, -640], 'Knights inside the ring', 'Shot down between the two lines', 'empire', 'skull'),
    'usti-assault-lines': tactic([-800, -60], 'Second line of wagons', 'Holds the knights who break in'),
    'usti-assault-crossfire': tactic([800, -60], 'Crossfire', 'Guns and handguns from three sides'),
    'usti-assault-hooks': tactic([0, 430], 'Hooks', 'Riders dragged from the saddle'),
  },
});

// --- the sally: the Hussites open the wagons, the relief army flees to the north-west, the horse is caught by the villages ---
const SALLY = [-300, -560], CHASE = [-800, -950], VILLAGES = [730, -300], REAR = [-260, -880], CAUGHT = [950, -190];
writePlan(`${G}/040-usti-rout`, {
  bbox,
  emblem: {
    ...ground,
    units: [
      fort('The Hussite wagon fort, opened for the sally', [{ bearing: 330, wagons: 2 }, { bearing: 295, wagons: 2 }, { bearing: 75, wagons: 2 }]),
      unit('taborites', 'infantry', SALLY, 420, 120, toward([0, 0], SALLY), 'hussite-foot', 'Hussite foot out of the wagons, charging with flails and halberds'),
      unit('taborites', 'cavalry', CHASE, 300, 90, toward([0, 0], CHASE), 'hussite-horse', 'Hussite horse riding down the fugitives for a mile and a half (Bartošek of Drahonice)'),
      unit('taborites', 'infantry', VILLAGES, 300, 100, toward(VILLAGES, CAUGHT), 'village-foot', 'Hussite foot surrounding the fugitives in Hrbovice and Předlice'),
      unit('empire', 'knights', REAR, 300, 100, toward(REAR, SALLY), 'rear-guard', 'The nobles of the relief army fight as the rear guard while the foot runs'),
      unit('empire', 'knights', CAUGHT, 280, 100, toward(CAUGHT, VILLAGES), 'caught-horse', 'Part of the relief horse, cut off in Hrbovice and Předlice. The Hussites set fire to the villages.'),
    ],
    arrows: [
      arrow('taborites', [[-120, -180], [-160, -290], [-265, -500]], 'sally', 'The Hussites open the wagons and come out, horse and foot'),
      arrow('empire', [[150, -930], [-350, -1080], [-960, -1200]], 'flight', 'The townsmen and peasant levies flee first, towards Chabařovice and the border. Many die of heat and exhaustion on the way.', 'dashed'),
      arrow('empire', [[380, -520], [700, -540], [930, -265]], 'flight-east', 'Part of the horse flees north-east to Hrbovice and Předlice', 'dashed'),
      arrow('taborites', [[-300, -130], [-420, -230], [-620, -600], [-760, -895]], 'pursuit', 'The Hussite horse pursues towards the Ore Mountains'),
      arrow('taborites', [[360, -90], [520, -170], [672, -290]], 'to-villages', 'Hussite foot follow the fugitives to the villages'),
    ],
    clashes: [clash([-280, -735]), clash([845, -240])],
  },
  markers: {
    'usti-rout-hrbovice': place(HRBOVICE, 'Hrbovice', 'Burned with the fugitives inside', 'flame'),
    'usti-rout-predlice': place(PREDLICE, 'Předlice', 'Burned with the fugitives inside', 'flame'),
    'usti-rout-lords': mark([230, -800], 'Counts and lords', '24 kneel to surrender and are killed', 'empire', 'skull'),
    'usti-rout-sally': tactic([-800, -120], 'Sally', 'Wagons opened, horse and foot charge'),
    'usti-rout-pursuit': tactic([-860, -420], 'Horse kept for the pursuit', 'Chased for a mile and a half'),
  },
});

// --- overview: the Hussite columns to Ústí in May, the three columns of the relief army from Freiberg in June ---
writePlan(`${G}/010-usti`, {
  routes: {
    'orphans-1426': { name: 'The Orphans and the East Bohemian lords from Mladá Boleslav by Česká Lípa, Třebenice and Teplice to Ústí, May 1426', color: 'orebites',
      path: [[14.906, 50.411], [14.804, 50.501], [14.725, 50.659], [14.538, 50.686], [14.344, 50.585], [14.131, 50.534], [14.003, 50.48], [13.9, 50.56], [13.824, 50.641], [13.858, 50.685], [13.943, 50.673], [14.02, 50.662]] },
    'praguers-1426': { name: 'The Praguers under Hynek Boček of Poděbrady by Litoměřice to Ústí, May 1426', color: 'prague',
      path: [[14.421, 50.087], [14.37, 50.2], [14.32, 50.33], [14.261, 50.425], [14.131, 50.534], [14.1, 50.6], [14.045, 50.645]], offset: 6 },
    'relief-1426-most': { name: 'Relief army column by the Janov road past Most, 14–15 June 1426', color: 'empire', group: 'relief',
      path: [[13.339, 50.912], [13.424, 50.711], [13.387, 50.632], [13.6, 50.58], [13.72, 50.59], [13.85, 50.64], [13.943, 50.673]] },
    'relief-1426-osek': { name: 'Relief army column by Osek, 14–15 June 1426', color: 'empire', group: 'relief',
      path: [[13.339, 50.912], [13.537, 50.802], [13.662, 50.721], [13.693, 50.622], [13.8, 50.63], [13.943, 50.673]], offset: 6 },
    'relief-1426-krupka': { name: 'Relief army column, probably the Upper Lusatians, by Krupka and Teplice, 14–15 June 1426', color: 'empire', group: 'relief',
      path: [[13.339, 50.912], [13.537, 50.802], [13.758, 50.765], [13.791, 50.734], [13.858, 50.685], [13.824, 50.641], [13.88, 50.655], [13.943, 50.673]], offset: -6 },
    'hussites-1426-behani': { name: 'The Hussites lift the siege and march out to Běhání hill, 15 June 1426', color: 'taborites',
      path: [[14.028, 50.662], [14.0, 50.659], [13.975, 50.66]] },
  },
  markers: {
    'usti-town-1426': { lnglat: [14.038, 50.66], icon: 'castle', color: 'empire', label: 'Ústí nad Labem', note: 'Meissen garrison, besieged from late May' },
    'freiberg-1426': { lnglat: [13.339, 50.912], icon: 'flag', color: 'empire', label: 'Freiberg', note: 'The relief army gathers, June 1426' },
    'ceska-lipa-1426': { lnglat: [14.538, 50.686], icon: 'flag', color: 'orebites', label: 'Česká Lípa', note: 'Surrenders to the Orphans, 19 May' },
    'mlada-boleslav-1426': { lnglat: [14.906, 50.411], icon: 'users', color: 'taborites', label: 'Mladá Boleslav', note: 'Council of the captains, 5 May' },
  },
});

console.log('usti: bbox', JSON.stringify(bbox), 'fort at', JSON.stringify(P(0, 0)));
