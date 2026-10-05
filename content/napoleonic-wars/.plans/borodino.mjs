// Borodino, 7 September 1812. The Russian line runs about 8 km from the Moskva along the Kolocha past Borodino and
// the great redoubt to the flèches and Semyonovskaya, and on to Utitsa on the old Smolensk road; the French attack
// from the west. Places are real villages and earthworks plus metres east and north.
import { writePlan } from './lib.mjs';

const G = 'pages/090-russia/030-borodino';
const r5 = x => Math.round(x * 1e5) / 1e5, kx = 111320 * Math.cos(55.51 * Math.PI / 180), ky = 110540;
// a point moved by metres east and north
const off = ([lon, lat], e = 0, n = 0) => [r5(lon + e / kx), r5(lat + n / ky)];
const V = {
  borodino: [35.821, 55.524], redoubt: [35.84, 55.52], semyonovskaya: [35.846, 55.508], fleches: [35.833, 55.505],
  utitsa: [35.81, 55.49], shevardino: [35.797, 55.507], gorki: [35.85, 55.533],
};
const water = [
  { path: [[35.72, 55.518], [35.76, 55.517], [35.79, 55.519], [35.808, 55.522], [35.821, 55.526], [35.833, 55.533], [35.845, 55.541], [35.858, 55.549], [35.868, 55.556]],
    width: 40, id: 'kolocha', name: 'The Kolocha' },
  { path: [[35.85, 55.506], [35.843, 55.511], [35.834, 55.516], [35.826, 55.522]], width: 25, id: 'semyonovka', name: 'The Semyonovka brook' },
  { path: [[35.79, 55.567], [35.83, 55.562], [35.868, 55.556], [35.9, 55.553]], width: 90, id: 'moskva', name: 'The Moskva' },
];
// the three flèches, open arrowheads pointing west, and the open-backed great redoubt
const vee = (c, s = 130) => [off(c, s * 0.6, s), off(c, -s * 0.6, 0), off(c, s * 0.6, -s)];
const fleches = [off(V.fleches, -120, 300), off(V.fleches, 0, 0), off(V.fleches, 100, -300)].map(c => ({ side: 'russia', path: vee(c), width: 30, id: 'fleches', name: 'The Bagration flèches, three open earthworks' }));
const redoubt = { side: 'russia', path: [off(V.redoubt, 100, 160), off(V.redoubt, -110, 100), off(V.redoubt, -120, -100), off(V.redoubt, 100, -160)], width: 40, id: 'redoubt', name: 'The great redoubt, later named after Raevsky, with 19 heavy guns' };
const works = [...fleches, redoubt];
const bbox = [35.765, 55.478, 35.885, 55.553];
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: from Smolensk to Borodino ---
writePlan(`${G}/010-borodino`, {
  routes: {
    'napoleon-borodino-1812': { name: 'The Grande Armée marches from Smolensk to Borodino, 24 August – 5 September 1812',
      path: [[32.06, 54.78], [32.6, 54.83], [33.29, 54.91], [33.8, 55.05], [34.3, 55.21], [34.75, 55.4], [35.0, 55.55], [35.45, 55.53], [35.79, 55.51]] },
    'kutuzov-borodino-1812': { name: 'The Russian armies fall back from Smolensk to Borodino, August – September 1812', style: 'dashed', offset: 6,
      path: [[32.1, 54.8], [32.6, 54.85], [33.29, 54.93], [34.3, 55.23], [34.75, 55.42], [35.0, 55.57], [35.45, 55.55], [35.83, 55.53]] },
  },
  markers: {
    'borodino-tsaryovo': mark([34.75, 55.4], 'Tsaryovo-Zaymishche', 'Kutuzov takes command, 29 August', 'russia'),
  },
});

// --- the morning: the grand battery, the flèches, Borodino and Utitsa ---
writePlan(`${G}/020-borodino-fleches`, {
  bbox,
  emblem: {
    water,
    works,
    units: [
      unit('france', 'artillery', [35.814, 55.51], 1500, 200, 95, 'grand-battery', 'French grand battery, 102 guns', { count: 16 }),
      unit('france', 'infantry', [35.824, 55.5015], 1000, 400, 85, 'davout', 'I Corps under Davout, the divisions of Compans, Dessaix and Friant'),
      unit('france', 'infantry', [35.822, 55.5115], 1000, 400, 100, 'ney', 'III Corps under Ney, which retakes the flèches'),
      unit('client', 'infantry', [35.812, 55.524], 1100, 400, 95, 'eugene', 'IV Corps under Eugène, with Italian and French divisions'),
      unit('rhine', 'infantry', [35.796, 55.49], 1000, 400, 85, 'poniatowski', 'V Corps of Poles under Poniatowski, about 10,000'),
      unit('france', 'infantry', [35.781, 55.505], 1400, 500, 90, 'guard', 'The Imperial Guard, 18,500, in reserve'),
      unit('russia', 'infantry', [35.841, 55.503], 1000, 400, 265, 'bagration', 'Bagration’s 2nd Army, the divisions of Vorontsov and Neverovsky'),
      unit('russia', 'infantry', [35.856, 55.508], 1100, 450, 265, 'reserves', 'Guard regiments, grenadiers and guns sent by Barclay'),
      unit('russia', 'infantry', [35.849, 55.52], 1100, 400, 265, 'raevsky', 'VII Corps under Raevsky, behind the great redoubt'),
      unit('russia', 'infantry', [35.865, 55.536], 2000, 500, 255, 'barclay', 'Barclay’s 1st Army on the right, along the Kolocha'),
      unit('russia', 'infantry', [35.821, 55.49], 1000, 400, 270, 'tuchkov', 'III Corps under Tuchkov, half of it militia'),
    ],
    arrows: [
      arrow('france', [[35.8275, 55.501], [35.8315, 55.5025]], 170, 'davout-attack', 'Davout storms the flèches, 6 to 7:30 am'),
      arrow('france', [[35.8255, 55.5105], [35.8305, 55.508]], 170, 'ney-attack', 'Ney’s corps retakes the flèches'),
      arrow('russia', [[35.8385, 55.5035], [35.835, 55.504]], 140, 'bagration-counterattack', 'Bagration’s counterattacks'),
      arrow('client', [[35.8155, 55.524], [35.8205, 55.5245]], 150, 'borodino-attack', 'Eugène takes Borodino from the Russian Guard jägers'),
      arrow('rhine', [[35.7995, 55.49], [35.8165, 55.49]], 150, 'utitsa-attack', 'Poniatowski attacks Utitsa'),
    ],
    clashes: [{ at: [35.8325, 55.503], size: 200 }, { at: [35.831, 55.508], size: 200 }, { at: [35.8215, 55.5245], size: 180 }, { at: [35.818, 55.49], size: 180 }],
  },
  markers: {
    'borodino-morn-davout': mark([35.7995, 55.5065], 'Davout', 'Flèches taken by 7:30', 'france'),
    'borodino-morn-bagration': mark([35.858, 55.4995], 'Bagration', 'Wounded about 11 am', 'russia'),
    'borodino-morn-eugene': mark([35.81, 55.537], 'Eugène', 'Takes Borodino', 'client'),
    'borodino-morn-tuchkov': mark([35.836, 55.4875], 'Tuchkov', 'Mortally wounded', 'russia', 'skull'),
  },
});

// --- late morning to early afternoon: the first attacks on the great redoubt and the Cossack raid ---
writePlan(`${G}/030-borodino-uvarov`, {
  bbox,
  emblem: {
    water,
    works,
    units: [
      unit('client', 'infantry', [35.829, 55.5215], 1000, 400, 90, 'eugene', 'Broussier’s and Morand’s divisions of Eugène’s corps'),
      unit('client', 'infantry', [35.808, 55.531], 1000, 350, 320, 'eugene-rear', 'Part of Eugène’s corps, turned back to face the raid'),
      unit('france', 'infantry', [35.829, 55.503], 1000, 400, 85, 'davout', 'Davout’s and Ney’s corps on the flèches'),
      unit('france', 'cavalry', [35.826, 55.5125], 700, 300, 85, 'montbrun', 'Montbrun’s cavalry corps, filling the gap under fire'),
      unit('france', 'infantry', [35.778, 55.503], 1400, 500, 90, 'guard', 'The Imperial Guard, in reserve'),
      unit('rhine', 'infantry', [35.806, 55.49], 1000, 400, 80, 'poniatowski', 'Poniatowski’s Poles and Junot’s Westphalians'),
      unit('russia', 'infantry', [35.849, 55.52], 1100, 400, 265, 'raevsky', 'Raevsky’s corps and Yermolov’s reinforcements'),
      unit('russia', 'infantry', [35.856, 55.505], 1300, 450, 265, 'second-army', 'The 2nd Army behind Semyonovskaya, under Dokhturov'),
      unit('russia', 'infantry', [35.864, 55.521], 1000, 400, 250, 'ostermann', 'Ostermann-Tolstoy’s corps, moving to the centre'),
      unit('russia', 'cavalry', [35.788, 55.533], 1500, 350, 200, 'uvarov', 'Uvarov’s cavalry and Platov’s Cossacks, about 8,000 with 12 guns'),
      unit('russia', 'infantry', [35.823, 55.489], 1000, 400, 275, 'baggovut', 'Baggovut’s corps on the left, in place of Tuchkov'),
      unit('russia', 'infantry', [35.866, 55.537], 1800, 500, 255, 'barclay', 'Barclay’s 1st Army on the right'),
    ],
    arrows: [
      arrow('client', [[35.8325, 55.5215], [35.8385, 55.5205]], 170, 'bonnamy-attack', 'Bonnamy’s brigade breaks into the redoubt'),
      arrow('russia', [[35.8455, 55.5175], [35.8415, 55.5192]], 160, 'yermolov-counterattack', 'Yermolov retakes the redoubt with the bayonet'),
      arrow('russia', [[35.846, 55.545], [35.83, 55.5475], [35.81, 55.5445], [35.796, 55.5365]], 220, 'uvarov-raid', 'Uvarov and Platov cross the Kolocha and ride round the French left'),
      arrow('russia', [[35.8645, 55.5155], [35.8575, 55.519]], 150, 'ostermann-march', 'Ostermann-Tolstoy reinforces the centre'),
    ],
    clashes: [{ at: [35.8395, 55.52], size: 220 }, { at: [35.8005, 55.5335], size: 200 }],
  },
  markers: {
    'borodino-noon-yermolov': mark([35.871, 55.5125], 'Yermolov', 'Retakes the redoubt', 'russia'),
    'borodino-noon-uvarov': mark([35.789, 55.549], 'Uvarov and Platov', '8,000 cavalry, 12 guns', 'russia'),
    'borodino-noon-eugene': mark([35.802, 55.5155], 'Eugène', 'Two hours lost', 'client'),
  },
});

// --- the afternoon: the fall of the great redoubt and the Russian Guard under fire ---
writePlan(`${G}/040-borodino-redoubt`, {
  bbox,
  emblem: {
    water,
    works,
    units: [
      unit('client', 'infantry', [35.83, 55.5205], 1100, 400, 90, 'eugene', 'The divisions of Broussier, Morand and Gérard'),
      unit('france', 'cavalry', [35.8395, 55.5085], 800, 300, 20, 'caulaincourt', 'Watier’s cuirassiers under Caulaincourt'),
      unit('rhine', 'cavalry', [35.8265, 55.5135], 600, 250, 60, 'thielmann', 'Saxon and Polish cavalry under Thielmann'),
      unit('france', 'infantry', [35.846, 55.5015], 1000, 400, 90, 'davout', 'Davout’s and Ney’s corps on the Semyonovskaya heights'),
      unit('france', 'infantry', [35.778, 55.503], 1400, 500, 90, 'guard', 'The Imperial Guard, kept back by Napoleon'),
      unit('rhine', 'infantry', [35.81, 55.49], 1000, 400, 80, 'poniatowski', 'Poniatowski’s Poles at Utitsa'),
      unit('russia', 'infantry', [35.8405, 55.52], 260, 180, 260, 'likhachyov', 'The 24th Division under Likhachyov, overrun in the redoubt'),
      unit('russia', 'square', [35.866, 55.508], 1300, 450, 265, 'russian-guard', 'The Russian Guard in squares, under fire from 4 to 6 pm'),
      unit('russia', 'cavalry', [35.855, 55.5165], 800, 300, 260, 'guard-cavalry', 'The Russian Guard cavalry, which stops the French beyond the redoubt'),
      unit('russia', 'infantry', [35.865, 55.526], 1000, 400, 250, 'ostermann', 'Ostermann-Tolstoy’s corps'),
      unit('russia', 'infantry', [35.83, 55.488], 1000, 400, 275, 'baggovut', 'Baggovut’s corps'),
    ],
    arrows: [
      arrow('client', [[35.8335, 55.5205], [35.8385, 55.5202]], 190, 'eugene-assault', 'Eugène’s divisions storm the redoubt from the front at 2 pm'),
      arrow('france', [[35.8405, 55.511], [35.8435, 55.516], [35.8425, 55.5188]], 170, 'caulaincourt-charge', 'Caulaincourt charges the open back of the redoubt and is killed'),
      arrow('rhine', [[35.829, 55.5145], [35.8385, 55.5185]], 150, 'thielmann-charge', 'Thielmann’s horsemen break into the redoubt from behind'),
      arrow('russia', [[35.852, 55.517], [35.845, 55.518]], 160, 'guard-cavalry-charge', 'The Russian Guard cavalry stops the French advance'),
    ],
    clashes: [{ at: [35.8405, 55.5202], size: 240 }, { at: [35.8465, 55.5178], size: 200 }],
  },
  markers: {
    'borodino-aft-caulaincourt': mark([35.822, 55.505], 'Caulaincourt', 'Killed at the redoubt', 'france', 'skull'),
    'borodino-aft-redoubt': mark([35.842, 55.531], 'Great redoubt', 'Falls at 3:30 pm', 'france', 'swords'),
    'borodino-aft-guard': mark([35.866, 55.4985], 'Russian Guard', 'Squares under fire', 'russia'),
    'borodino-aft-napoleon': mark([35.778, 55.4925], 'Napoleon', 'Keeps the Guard back', 'france'),
  },
});

console.log('borodino: bbox', JSON.stringify(bbox));
