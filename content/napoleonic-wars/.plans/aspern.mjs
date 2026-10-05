// Aspern-Essling, 21 – 22 May 1809. The French bridgehead on the Marchfeld faces north between Aspern and
// Essling, with the bridge to the Lobau behind it; the Austrian columns close in from the north-west to the east.
// Frame: u from Essling towards Aspern (west-north-west), w from the French line towards the Austrians (north).
// In it Aspern is at [1590, 348], Essling at [-1621, 207], the bridge at [-305, -1518] and Breitenlee at [776, 3118].
import { frame, writePlan } from './lib.mjs';

const f = frame([16.5, 48.214], 280), P = f.p, FR = f.face(90), AU = f.face(270);
const G = 'pages/080-fifth-coalition/020-aspern';
const A = [1590, 348], E = [-1621, 207], B = [-305, -1518];
const at = ([u, w], du = 0, dw = 0) => P(u + du, w + dw);
// a point moved by metres east and north on the map, for marker labels that hang below their icon
const geo = ([lon, lat], e = 0, n = 0) => [+(lon + e / (111320 * Math.cos(lat * Math.PI / 180))).toFixed(5), +(lat + n / 110540).toFixed(5)];

const water = [
  { path: [[16.43, 48.226], [16.452, 48.219], [16.468, 48.215], [16.481, 48.211], [16.493, 48.205], [16.507, 48.199], [16.526, 48.1955], [16.548, 48.1915], [16.57, 48.184], [16.59, 48.172]],
    width: 110, id: 'danube-arm', name: 'An arm of the Danube between the Lobau and the left bank' },
];
const bridge = { side: 'france', path: [at(B, 0, -300), at(B, 0, 60)], width: 45, id: 'bridge', name: 'The French bridge from the Lobau to the left bank' };
const bbox = f.box([[A[0] + 2500, -1900], [E[0] - 2600, 3350]], 0);
const unit = (side, type, where, width, depth, id, name, extra = {}) => ({ side, type, at: where, width, depth, facing: side === 'austria' ? AU : FR, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: the crossing by the Lobau and the Austrian approach ---
writePlan(`${G}/010-aspern`, {
  routes: {
    'napoleon-lobau-1809': { name: 'The French cross by Kaiserebersdorf and the Lobau, 19 – 21 May 1809',
      path: [[16.37, 48.19], [16.42, 48.17], [16.47, 48.157], [16.49, 48.175], [16.5, 48.19], [16.5, 48.207]] },
    'hiller-aspern-1809': { name: 'Hiller, Bellegarde and Hohenzollern advance on Aspern, 21 May 1809',
      path: [[16.4, 48.3], [16.43, 48.27], [16.46, 48.245], [16.478, 48.226]] },
    'rosenberg-essling-1809': { name: 'Rosenberg advances on Essling, 21 May 1809',
      path: [[16.6, 48.285], [16.585, 48.255], [16.56, 48.232], [16.528, 48.217]] },
  },
  markers: {
    'aspern-vienna': mark([16.373, 48.208], 'Vienna', 'Surrenders on 12 May', 'france', 'castle'),
    'aspern-lackenau': mark([16.385, 48.256], 'Schwarze Lackenau', 'First French crossing repulsed', 'austria', 'swords'),
    'aspern-bisamberg': mark([16.36, 48.327], 'Bisamberg', 'Austrian observers', 'austria', 'user'),
    'aspern-kaiserebersdorf': mark([16.472, 48.152], 'Kaiserebersdorf', 'Bridges to the Lobau', 'france', 'bridge'),
  },
});

// --- the first day: Aspern changes hands, Essling holds ---
writePlan(`${G}/020-aspern-first-day`, {
  bbox,
  emblem: {
    water,
    works: [bridge],
    units: [
      unit('france', 'infantry', at(A), 700, 380, 'molitor', 'Molitor’s division in Aspern, four regiments'),
      unit('france', 'infantry', P(1000, -200), 900, 200, 'legrand', 'The divisions of Legrand and Carra Saint-Cyr, coming up to Aspern'),
      unit('france', 'cavalry', P(0, 450), 1800, 260, 'bessieres', 'Bessières’s cavalry, about 7,000'),
      unit('france', 'infantry', at(E), 800, 380, 'boudet', 'Boudet’s division in Essling, under Lannes'),
      unit('austria', 'infantry', at(A, 1300, 300), 1100, 300, 'hiller', 'First column, VI Corps under Hiller', { facing: f.face(195) }),
      unit('austria', 'infantry', at(A, 100, 1050), 1500, 300, 'bellegarde', 'Second column, I Corps under Bellegarde'),
      unit('austria', 'infantry', P(300, 1500), 1100, 300, 'hohenzollern', 'Third column, II Corps under Hohenzollern', { facing: f.face(300) }),
      unit('austria', 'cavalry', P(-1150, 1800), 1500, 280, 'liechtenstein', 'Reserve cavalry under Liechtenstein'),
      unit('austria', 'infantry', P(-1150, 2750), 1400, 300, 'grenadiers', 'Grenadier divisions of the reserve'),
      unit('austria', 'infantry', at(E, 150, 1000), 1100, 300, 'dedovich', 'Fourth column, part of IV Corps under Dedovich'),
      unit('austria', 'infantry', at(E, -1350, 250), 1000, 300, 'rosenberg', 'Fifth column, IV Corps under Rosenberg', { facing: f.face(-10) }),
    ],
    arrows: [
      arrow('austria', [at(A, 100, 880), at(A, 30, 300)], 130, 'aspern-assault', 'The Austrians storm Aspern, which changes hands six times'),
      arrow('austria', [at(A, 1130, 250), at(A, 450, 60)], 130, 'aspern-assault', 'The Austrians storm Aspern, which changes hands six times'),
      arrow('austria', [at(E, 150, 830), at(E, 50, 280)], 120, 'essling-attacks', 'Rosenberg attacks Essling three times from 6 pm'),
      arrow('austria', [at(E, -1180, 240), at(E, -480, 90)], 120, 'essling-attacks', 'Rosenberg attacks Essling three times from 6 pm'),
      arrow('france', [P(-250, 620), P(-450, 1580)], 140, 'bessieres-charge', 'Bessières’s cavalry charges the Austrian centre'),
    ],
    clashes: [at(A, 0, 260), at(A, 380, 40), at(E, 0, 240), P(-460, 1640)],
  },
  markers: {
    'aspern-day1-molitor': mark(geo(at(A), -1300, -300), 'Molitor', 'Aspern changes hands six times', 'france'),
    'aspern-day1-lannes': mark(geo(at(E), 300, -950), 'Lannes', 'Boudet holds Essling', 'france'),
    'aspern-day1-bessieres': mark(geo(P(0, 450), 300, -380), 'Bessières', '7,000 cavalry', 'france'),
    'aspern-day1-hiller': mark(P(3250, 2050), 'Hiller and Bellegarde', 'Attack Aspern from the afternoon', 'austria'),
    'aspern-day1-rosenberg': mark(geo(at(E, -1350, 250), 400, 1450), 'Rosenberg', 'Reaches Essling about 6 pm', 'austria'),
    'aspern-day1-charles': mark(P(776, 3118), 'Archduke Charles', 'Headquarters at Breitenlee', 'austria'),
  },
});

// --- the second morning: Masséna retakes Aspern, Lannes attacks the centre, the bridge breaks ---
writePlan(`${G}/030-aspern-lannes`, {
  bbox,
  emblem: {
    water,
    works: [bridge],
    units: [
      unit('france', 'infantry', at(A), 800, 400, 'massena', 'Masséna’s divisions of Legrand and Carra Saint-Cyr in Aspern'),
      unit('france', 'infantry', P(-700, 1100), 1100, 260, 'saint-hilaire', 'Saint-Hilaire’s division, leading on the right'),
      unit('france', 'infantry', P(650, 820), 1500, 280, 'oudinot', 'Oudinot’s grenadiers, the divisions of Tharreau and Claparède'),
      unit('france', 'cavalry', P(100, -380), 1700, 240, 'bessieres', 'Bessières’s cavalry, whose charges are driven back'),
      unit('france', 'infantry', at(E), 800, 380, 'boudet', 'Boudet’s division in Essling'),
      unit('france', 'infantry', at(B, 0, 400), 900, 260, 'guard', 'Two divisions of the Imperial Guard, guarding the bridgehead'),
      unit('austria', 'infantry', at(A, 900, 950), 1400, 300, 'hiller', 'Hiller’s and Bellegarde’s columns, driven out of Aspern', { facing: f.face(230) }),
      unit('austria', 'infantry', P(650, 1980), 1500, 300, 'hohenzollern', 'II Corps under Hohenzollern, with the Zach regiment'),
      unit('austria', 'infantry', P(-750, 1930), 1300, 300, 'grenadiers', 'The reserve grenadiers, brought forward by Charles'),
      unit('austria', 'cavalry', P(-1650, 2550), 1300, 260, 'liechtenstein', 'Reserve cavalry under Liechtenstein'),
      unit('austria', 'infantry', at(E, -950, 800), 1300, 300, 'rosenberg', 'IV Corps under Rosenberg', { facing: f.face(300) }),
    ],
    arrows: [
      arrow('france', [P(-700, 1250), P(-730, 1700)], 150, 'lannes-attack', 'Lannes attacks the centre in echelon, shortly after 7 am'),
      arrow('france', [P(650, 980), P(650, 1750)], 150, 'lannes-attack', 'Lannes attacks the centre in echelon, shortly after 7 am'),
      arrow('austria', [at(A, 750, 750), at(A, 380, 330)], 120, 'aspern-attack', 'The Austrians attack Aspern again'),
    ],
    clashes: [P(-730, 1730), P(650, 1790), at(A, 330, 300), at(E, -400, 330)],
  },
  markers: {
    'aspern-day2-lannes': mark(P(-150, 600), 'Lannes', 'Attacks about 7 am', 'france'),
    'aspern-day2-charles': mark(P(650, 2950), 'Archduke Charles', 'Rallies the Zach regiment', 'austria'),
    'aspern-day2-massena': mark(geo(at(A), -700, -450), 'Masséna', 'Retakes Aspern', 'france'),
    'aspern-day2-bridge': mark(at(B, 0, -150), 'Bridge to the Lobau', 'Breaks again between 8 and 9 am', 'france', 'bridge'),
  },
});

// --- the second afternoon: Aspern lost, the guns on the centre, Essling retaken, the retreat to the Lobau ---
writePlan(`${G}/040-aspern-essling`, {
  bbox,
  emblem: {
    water,
    works: [bridge],
    units: [
      unit('france', 'infantry', P(1050, -330), 900, 240, 'massena', 'Masséna’s corps, driven out of Aspern'),
      unit('france', 'infantry', P(0, 300), 1700, 280, 'lannes-corps', 'Lannes’s corps, holding the centre under the Austrian guns'),
      unit('france', 'square', at(E, 50, -60), 180, 160, 'granary', 'Boudet with a few hundred men in the granary of Essling'),
      unit('france', 'infantry', at(E, 350, -330), 600, 220, 'young-guard', 'Young Guard battalions under Mouton, and Rapp’s two battalions'),
      unit('austria', 'infantry', at(A, 100, 100), 1000, 420, 'hiller', 'Hiller’s and Bellegarde’s troops in Aspern', { facing: f.face(240) }),
      unit('austria', 'artillery', P(-100, 1500), 2400, 160, 'great-battery', 'About 150 Austrian guns massed against the French centre', { count: 22 }),
      unit('austria', 'infantry', P(900, 2300), 1500, 300, 'hohenzollern', 'II Corps under Hohenzollern'),
      unit('austria', 'infantry', at(E, -1800, 350), 1100, 300, 'rosenberg', 'Rosenberg’s corps and grenadiers, falling back from Essling', { facing: f.face(-10) }),
    ],
    arrows: [
      arrow('austria', [at(A, 700, 800), at(A, 300, 330)], 130, 'aspern-attack', 'Hiller and Bellegarde take Aspern for good, after 1 pm'),
      arrow('france', [at(E, 500, -400), at(E, 150, -120)], 110, 'guard-charge', 'Mouton and Rapp retake Essling with the bayonet'),
      arrow('austria', [at(E, -400, 200), at(E, -1600, 330)], 140, 'rosenberg-retreat', 'Rosenberg falls back towards Gross-Enzersdorf', 'dashed'),
      arrow('france', [P(900, -480), at(B, 200, 350), at(B, 30, -250)], 160, 'french-retreat', 'The French withdraw to the Lobau during the night', 'dashed'),
    ],
    clashes: [at(A, -380, -250), at(E, 0, -60)],
  },
  markers: {
    'aspern-day2-lannes-wounded': mark(P(-250, 1170), 'Lannes', 'Mortally wounded', 'france', 'skull'),
    'aspern-day2-granary': mark(geo(at(E), 0, -650), 'Granary of Essling', 'Boudet holds out', 'france', 'house'),
    'aspern-day2-rapp': mark(geo(at(E), 750, 1150), 'Mouton and Rapp', 'Retake Essling', 'france'),
    'aspern-day2-battery': mark(geo(P(-100, 1500), 700, 800), 'Austrian guns', 'About 150, from 2 pm', 'austria', 'target'),
  },
});

console.log('aspern: bbox', JSON.stringify(bbox), 'field', JSON.stringify(P(0, 900)));
