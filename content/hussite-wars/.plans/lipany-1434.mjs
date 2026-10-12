// Lipany, 30 May 1434. The field armies stand in a wagon fort at the foot of the north slope of Lipská hora, the
// lords' league in a larger wagon fort on the plain north-east of Hřiby, about a kilometre apart (Čornej, after the
// Czech Wikipedia article). The slope, the plain and the valley of the Bylanka west of Hřiby (cs Wikipedia, Hřiby) come
// from the elevation tiles, and the summit and memorial of Lipská hora from cs Wikipedia, Lipská hora. No account at hand
// places the Jordán pond, so the fort's hover text names it and the plan leaves it out. Frame: u along the line of the forts, w from the lords towards the field armies.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/110-basel-lipany/040-lipany';
const B = 40, f = frame([14.9315, 50.037], B), P = f.p, PP = f.path, FIELD = f.face(270), LORDS = f.face(90);
const bbox = [14.906, 50.0265, 14.95, 50.045];

const brook = {
  path: [[14.9118, 50.0265], [14.911, 50.029], [14.9092, 50.0305], [14.908, 50.0325], [14.9076, 50.035], [14.9072, 50.0368], [14.9085, 50.0385],
    [14.9092, 50.04], [14.9084, 50.042], [14.9078, 50.0445], [14.9058, 50.0465]],
  width: 16, id: 'bylanka', name: 'The Bylanka brook in the valley west of Hřiby',
};
const ground = { water: [brook] };

// local [u, w] arithmetic: the compass bearing of a local direction, a point moved along a bearing, a unit's front and back
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const toward = ([u0, w0], [u1, w1]) => ((B + deg(Math.atan2(w1 - w0, u1 - u0))) % 360 + 360) % 360;
const go = ([u, w], bearing, d) => [u + Math.cos(rad(bearing - B)) * d, w + Math.sin(rad(bearing - B)) * d];
const front = (x, d = 0) => go(x.uw, x.facing, x.depth / 2 + d);
const back = (x, d = 0) => go(x.uw, x.facing + 180, x.depth / 2 + d);

const unit = (side, type, uw, width, depth, facing, id, name, extra = {}) => ({ side, type, uw, width, depth, facing, id, name, ...extra });
const draw = ({ uw, ...x }) => ({ ...x, at: P(...uw) });
const arrow = (side, pts, id, name, style) => ({ side, path: PP(pts), width: 45, id, name, ...(style ? { style } : {}) });
// markers sit by [lon, lat], so their labels can be kept clear of the blocks on screen
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
const place = (lnglat, label, note, icon) => ({ lnglat, icon, label, ...(note ? { note } : {}) });
const tactic = (lnglat, label, note, color) => mark(lnglat, label, note, color, 'lightbulb');
const clash = uw => ({ at: P(...uw), size: 70 });

const FIELD_ARMY = 'about 10,000 foot and 700 horse by Čornej, 9,000 foot and 700 horse by Bartošek of Drahonice, 6,000 to 8,000 men by Šmahel';
const LEAGUE = '12,000 to 13,000 foot and about 1,200 horse by Čornej, 10,000 foot and 1,000 horse by Bartošek of Drahonice';
const R = [0, 515], L = [0, -515], H = [-790, -1090];

const fieldFort = (name, extra = {}) => unit('taborites', 'wagon-fort', R, 480, 300, FIELD, 'field-fort', name, { count: 30, ...extra });
// gaps by compass bearing from the fort's centre: the side facing the lords opens for the pursuit (Bartošek), and the
// horse finds a gate open behind the fort (Piccolomini), here on the south-west where its ride ends
const PURSUIT_GAP = { bearing: 272, wagons: 3 }, BREACH = 200;
const lordsFort = name => unit('prague', 'wagon-fort', L, 600, 380, LORDS, 'lords-fort', name, { count: 30 });
const capek = unit('taborites', 'cavalry', [0, 730], 240, 80, FIELD, 'capek', 'Horse of the field armies under Jan Čapek of Sány, about 700 by Bartošek of Drahonice');
const hidden = unit('prague', 'knights', H, 200, 85, toward(H, R), 'hidden-horse',
  'Horse of the league held below the slope to the brook, out of sight of the field armies: lords who had once fought beside Tábor, '
  + 'among them Jan Malovec of Pacov, Mikuláš of Landštejn and Arnošt of Leskov. Only a few commanders know it is there.');

// --- the afternoon: two wagon forts a kilometre apart, the field armies' guns open fire and fall short ---
const fort1 = fieldFort('Wagon fort of the Taborite and Orphan field armies at the foot of Lipská hora: 360 to 480 wagons, drawn as 30, chained in '
  + `six rows, with the slope behind it and its right flank on the small Jordán pond by most accounts. Prokop the Great and Prokop the Lesser command ${FIELD_ARMY}.`);
const guns1 = unit('taborites', 'artillery', [0, 315], 260, 70, FIELD, 'field-guns', 'Guns of the field armies: more than 40 howitzers by Bartošek of Drahonice, 32 by the Zittau chronicler', { count: 6 });
const lords1 = lordsFort(`Wagon fort of the lords’ league on the plain north-east of Hřiby: 660 to 720 wagons by Čornej, drawn as 30, in 11 or 12 rows under `
  + `Jan Černín of Vysoká. Four guns stand at the front, the rest on the flanks. Diviš Bořek of Miletínek commands ${LEAGUE}.`);
const van1 = unit('prague', 'infantry', [-60, -260], 340, 85, LORDS, 'vanguard',
  'Vanguard of the league under Mikuláš Krchlebec of Krchleby, burgrave of Zvíkov, on foot: Rožmberk men, men of Prácheň and Karlštejn and of Menhart of Hradec');
const rear1 = unit('prague', 'infantry', [480, -470], 220, 85, LORDS, 'rear-guard', 'Rear guard of the league, its striking force the Plzeň landfrýd and the Rožmberk men under the Rožmberk banner');
writePlan(`${G}/020-lipany-forts`, {
  bbox,
  emblem: {
    ...ground,
    units: [fort1, guns1, capek, lords1, van1, rear1, hidden].map(draw),
    arrows: [
      arrow('taborites', [front(guns1), [-20, 60], [-40, -110]], 'gunfire', 'The field armies fire first. The lords’ fort stands out of range, and the shots do little harm.', 'fire'),
    ],
  },
  markers: {
    'lipany-forts-borek': mark([14.9172, 50.0428], 'Diviš Bořek of Miletínek', 'Commands the lords’ league', 'prague'),
    'lipany-forts-prokop': mark([14.9445, 50.0372], 'Prokop the Great', 'Commands the field armies', 'taborites'),
    'lipany-forts-hriby': place([14.92, 50.0352], 'Hřiby', null, 'house'),
    'lipany-forts-hill': place([14.9378, 50.0269], 'Lipská hora', 'Memorial mound of 1881', 'mountain'),
    'lipany-forts-slope': tactic([14.9455, 50.0312], 'Wagon fort on the slope', 'Lipská hora covers the rear', 'taborites'),
    'lipany-forts-range': tactic([14.9378, 50.0412], 'Out of range', 'Beyond reach of the howitzers', 'prague'),
    'lipany-forts-reserve': tactic([14.9118, 50.0345], 'Hidden reserve', 'Horse kept out of sight', 'prague'),
  },
});

// --- late afternoon: the vanguard attacks, wavers and falls back, and the field armies open their wagons and pursue ---
const fort2 = fieldFort('The field armies’ wagon fort, unchained and opened on the side facing the lords for the pursuit', { gaps: [PURSUIT_GAP] });
const guns2 = { ...guns1, uw: [60, 315], width: 220, name: 'Guns of the field armies, fired at the vanguard as it turns away' };
const lords2 = lordsFort('The lords’ wagon fort. Behind the wagons the gunners and crossbowmen wait with their weapons lowered.');
const van2 = unit('prague', 'infantry', [-60, -280], 340, 85, FIELD, 'vanguard', 'Krchlebec’s vanguard, falling back towards the lords’ wagons as if beaten');
const rear2 = { ...rear1, name: 'The rear guard, the Plzeň landfrýd and the Rožmberk men, waits on the flank' };
const chase2 = unit('taborites', 'infantry', [-40, -130], 360, 90, FIELD, 'pursuit', 'Foot of the field armies, out of their wagons and chasing the vanguard onto the plain');
const carts2 = unit('taborites', 'wagons', [-350, -90], 220, 40, FIELD, 'pursuit-wagons', 'Wagons from the head of the field armies’ column go with the pursuit and cover its flank', { count: 5 });
writePlan(`${G}/030-lipany-feint`, {
  bbox,
  emblem: {
    ...ground,
    units: [fort2, guns2, capek, carts2, chase2, lords2, van2, rear2, hidden].map(draw),
    arrows: [
      arrow('taborites', [front(guns2), [140, 200], [200, 130]], 'gunfire', 'The field armies fire all their guns at the vanguard, which has come up close and fired its four guns at them', 'fire'),
      arrow('prague', [[230, 120], [270, -100], [150, -250]], 'feint', 'Feigned retreat: the vanguard halts as if in confusion, turns and falls back towards the wagons', 'dashed'),
      arrow('taborites', [[-105, 390], [-150, 150], back(chase2, -5)], 'pursuit-move', 'The field armies open their wagons and pursue, horse and foot, shouting “Up, after them, they are running!”'),
    ],
  },
  markers: {
    'lipany-feint-krchlebec': mark([14.9215, 50.0335], 'Mikuláš Krchlebec', 'Leads the vanguard', 'prague'),
    'lipany-feint-prokop': mark([14.9445, 50.0372], 'Prokop the Great', 'Opens the fort to pursue', 'taborites'),
    'lipany-feint-rear': mark([14.9405, 50.0449], 'Rear guard', 'Plzeň and Rožmberk men wait', 'prague', 'swords'),
    'lipany-feint-retreat': tactic([14.9418, 50.0412], 'Feigned retreat', 'The vanguard turns as if beaten', 'prague'),
    'lipany-feint-opened': tactic([14.9305, 50.0318], 'Fort opened', 'Wagons unchained for the pursuit', 'taborites'),
  },
});

// --- evening: the pursuers are struck from front and behind, the hidden horse breaks into the open fort ---
const fort3 = fieldFort('The field armies’ wagon fort, still open where the pursuit went out. The lords’ horse rides round it, breaks in where the wagons stand open behind it and overturns eight of them, and both Prokops fall fighting on the wagons.', { gaps: [PURSUIT_GAP, { bearing: BREACH, wagons: 3 }] });
const lords3 = lordsFort('The lords’ wagon fort');
const van3 = unit('prague', 'infantry', [-40, -265], 400, 85, LORDS, 'vanguard', 'Krchlebec’s vanguard and the lords’ men from the wagons turn about and attack');
const chase3 = unit('taborites', 'infantry', [-40, -130], 360, 90, FIELD, 'pursuit', 'Foot of the field armies, caught between the two attacks on the plain and cut down');
const carts3 = { ...carts2, name: 'The wagons that went out with the pursuit, left on the plain' };
const rear3 = unit('prague', 'infantry', [-20, 15], 320, 80, FIELD, 'rear-guard', 'The rear guard, the Plzeň landfrýd and the Rožmberk men, strikes from behind and bars the way back to the fort');
const horse3At = go(R, BREACH, 320);
const horse3 = unit('prague', 'knights', horse3At, 200, 85, toward(horse3At, R), 'hidden-horse', 'The league’s hidden horse, come round in an arc, breaks into the fort and overturns eight wagons');
const capekEnd = [420, 1060];
const capek3 = unit('taborites', 'cavalry', capekEnd, 220, 80, toward([60, 730], capekEnd), 'capek', 'Jan Čapek of Sány and Ondřej Keřský ride off to Kolín with the horse and a few foot');
writePlan(`${G}/040-lipany-rout`, {
  bbox,
  emblem: {
    ...ground,
    units: [fort3, carts3, chase3, lords3, van3, rear3, horse3, capek3].map(draw),
    arrows: [
      arrow('prague', [front(van3, -5), front(van3, 35)], 'front-attack', 'The vanguard and the lords’ men turn about and attack the pursuers'),
      arrow('prague', [[480, -430], [530, -220], [340, 60], back(rear3, -5)], 'rear-attack', 'The rear guard swings round behind the pursuers and cuts them off from their fort'),
      arrow('prague', [[H[0] - 30, H[1] + 60], [-900, -640], [-860, -100], [-620, 330], [-480, 540], back(horse3, -5)], 'horse-ride', 'The hidden horse rides out of the valley in an arc round the fighting to the open fort'),
      arrow('taborites', [[60, 730], [240, 900], back(capek3, -5)], 'capek-flight', 'Čapek’s horse leaves the field for Kolín', 'dashed'),
      arrow('taborites', [[40, 680], [-60, 860], [-180, 1060]], 'flight', 'Survivors flee over the hill towards Kouřim, and few get away', 'dashed'),
    ],
    clashes: [clash([-40, -200]), clash([-30, -55]), clash(go(R, BREACH, 228))],
  },
  markers: {
    'lipany-rout-prokops': mark([14.9418, 50.0392], 'Both Prokops', 'Killed on the wagons', 'taborites', 'skull'),
    'lipany-rout-plain': mark([14.9228, 50.0345], 'Field army foot', 'Cut down on the plain', 'taborites', 'skull'),
    'lipany-rout-capek': mark([14.9468, 50.0318], 'Jan Čapek of Sány', 'Rides off to Kolín', 'taborites'),
    'lipany-rout-cutoff': tactic([14.9375, 50.0432], 'Cut off from the fort', 'Struck from front and behind', 'prague'),
    'lipany-rout-breach': tactic([14.9285, 50.0288], 'Horse into the fort', 'Eight wagons overturned', 'prague'),
  },
});

// --- overview: the league from Prague to Český Brod, the field armies from Kolín by Kouřim to Lipany ---
writePlan(`${G}/010-lipany`, {
  routes: {
    'league-1434-brod': { name: 'The lords’ league marches from Prague to Český Brod and lays siege to it, 27 May 1434', path: [[14.43, 50.085], [14.52, 50.09], [14.62, 50.095], [14.72, 50.09], [14.8, 50.08], [14.855, 50.074]] },
    'league-1434-lipany': { name: 'The league leaves Český Brod to meet the field armies, 28 May 1434', path: [[14.862, 50.07], [14.885, 50.06], [14.905, 50.05], [14.92, 50.042]] },
    'field-armies-1434-kolin': { name: 'The field armies withdraw from Prague into the country round Kolín, 22 to 24 May 1434', path: [[14.47, 50.04], [14.58, 50.03], [14.7, 50.02], [14.82, 50.01], [14.92, 50.005], [14.975, 50.003], [15.05, 50.01], [15.13, 50.02], [15.2, 50.028]] },
    'field-armies-1434-lipany': { name: 'The field armies march by Kouřim to relieve Český Brod, 28 May 1434', offset: 6, path: [[15.2, 50.028], [15.13, 50.02], [15.05, 50.01], [14.975, 50.003], [14.955, 50.02], [14.94, 50.031]] },
  },
  markers: {
    'ceskybrod-1434': { lnglat: [14.861, 50.074], icon: 'flag', color: 'taborites', label: 'Český Brod' },
    'kolin-1434': { lnglat: [15.2, 50.028], icon: 'flag', color: 'taborites', label: 'Kolín', note: 'Orphan town, Čapek escapes here' },
  },
});

console.log('lipany-1434: bbox', JSON.stringify(bbox), 'field fort at', JSON.stringify(P(...R)), 'lords’ fort at', JSON.stringify(P(...L)), 'hidden horse at', JSON.stringify(P(...H)));
