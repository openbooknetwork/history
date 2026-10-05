// The Berezina, 26 – 29 November 1812. The river runs south past Studienka, where Eblé builds two bridges, to
// Borisov; Chichagov's army comes up the west bank from the south, Wittgenstein's down the east bank from Staroi-
// Borisov. Places are real villages plus metres east and north.
import { writePlan } from './lib.mjs';

const G = 'pages/090-russia/050-berezina';
const r5 = x => Math.round(x * 1e5) / 1e5, kx = 111320 * Math.cos(54.31 * Math.PI / 180), ky = 110540;
// a point moved by metres east and north
const off = ([lon, lat], e = 0, n = 0) => [r5(lon + e / kx), r5(lat + n / ky)];
const V = { studienka: [28.365, 54.327], brili: [28.338, 54.318], stakhovo: [28.332, 54.293], staroi: [28.418, 54.287], crossing: [28.355, 54.326] };
const river = { path: [[28.335, 54.4], [28.345, 54.37], [28.352, 54.345], [28.355, 54.326], [28.36, 54.305], [28.375, 54.285], [28.4, 54.265], [28.44, 54.248], [28.48, 54.235], [28.505, 54.225]],
  width: 70, id: 'berezina', name: 'The Berezina, 20 to 30 metres wide and full of drifting ice' };
const swamp = { area: [[28.288, 54.336], [28.298, 54.333], [28.309, 54.335], [28.316, 54.339], [28.313, 54.345], [28.303, 54.348], [28.292, 54.346], [28.285, 54.341]], id: 'gaina', name: 'The Gaina swamp on the road to Zembin' };
const water = [river];
const bridges = (name) => [
  { side: 'france', path: [off(V.crossing, -140, 140), off(V.crossing, 140, 150)], width: 50, id: 'bridges', name },
  { side: 'france', path: [off(V.crossing, -140, -140), off(V.crossing, 140, -130)], width: 50, id: 'bridges', name },
];
const bbox = [28.27, 54.272, 28.455, 54.358];
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: from Smolensk to the Berezina, Krasnoi, and the Russian armies closing in ---
writePlan(`${G}/010-berezina`, {
  routes: {
    'napoleon-berezina-1812': { name: 'The Grande Armée retreats from Smolensk to the Berezina, 14 – 25 November 1812',
      path: [[32.05, 54.78], [31.7, 54.66], [31.43, 54.56], [31.0, 54.55], [30.43, 54.51], [29.69, 54.41], [29.27, 54.33], [28.8, 54.27], [28.52, 54.24], [28.38, 54.32]] },
    'kutuzov-krasnoi-1812': { name: 'Kutuzov’s army marches parallel to the road and attacks around Krasnoi, 15 – 18 November 1812',
      path: [[32.4, 54.45], [32.0, 54.43], [31.7, 54.45], [31.48, 54.52]] },
    'ney-dnieper-1812': { name: 'Ney crosses the frozen Dnieper and rejoins the army near Orsha, 18 – 20 November 1812', style: 'dashed',
      path: [[31.38, 54.6], [31.3, 54.68], [31.0, 54.68], [30.7, 54.62], [30.45, 54.54]] },
    'wittgenstein-1812': { name: 'Wittgenstein marches south from the Dvina towards Borisov, November 1812',
      path: [[28.8, 55.0], [29.0, 54.85], [28.8, 54.6], [28.6, 54.4], [28.45, 54.3]] },
    'chichagov-1812': { name: 'Chichagov advances from Minsk and takes Borisov, 21 November 1812',
      path: [[27.56, 53.9], [27.9, 54.0], [28.25, 54.12], [28.48, 54.22]] },
  },
  markers: {
    'berezina-krasnoi': mark([31.43, 54.56], 'Krasnoi', '15 – 18 November', 'russia', 'swords'),
    'berezina-orsha': mark([30.43, 54.51], 'Orsha', 'Ney rejoins, 20 November', 'france', 'flag'),
    'berezina-bobr': mark([29.27, 54.33], 'Bobr', 'Victor and Oudinot join', 'france', 'flag'),
    'berezina-borisov': mark([28.505, 54.228], 'Borisov', 'Bridge destroyed, 23 November', 'russia', 'bridge'),
  },
});

// --- 26 and 27 November: the bridges, Oudinot across, Partouneaux lost at Staroi-Borisov ---
writePlan(`${G}/020-berezina-bridges`, {
  bbox,
  emblem: {
    water,
    works: bridges('Eblé’s two bridges at Studienka, for infantry and for guns'),
    units: [
      unit('france', 'infantry', off(V.brili, -100, -900), 1500, 400, 190, 'oudinot', 'II Corps under Oudinot, about 7,000, facing south'),
      unit('france', 'infantry', off(V.brili, -700, 600), 1000, 350, 250, 'guard', 'Napoleon and the Imperial Guard, across by midday on 27 November'),
      unit('france', 'infantry', off(V.studienka, 1700, 300), 1400, 400, 270, 'davout', 'The corps of Davout and Eugène, waiting to cross'),
      unit('france', 'infantry', off(V.studienka, 1800, -1400), 1600, 400, 140, 'victor', 'IX Corps under Victor, covering the crossing'),
      unit('france', 'square', off(V.staroi, -300, -250), 450, 350, 30, 'partouneaux', 'Partouneaux’s division, cut off at Staroi-Borisov'),
      unit('other', 'light', off(V.studienka, 300, -350), 1400, 400, 270, 'stragglers', 'Stragglers and civilians, some 40,000', { count: 7 }),
      unit('russia', 'infantry', off(V.staroi, 900, 800), 1800, 500, 220, 'wittgenstein', 'Wittgenstein’s army, about 30,000'),
      unit('russia', 'infantry', off(V.stakhovo, 0, -1300), 1300, 350, 10, 'chaplits', 'Chaplits’s division of Chichagov’s army, returning north'),
    ],
    arrows: [
      arrow('france', [off(V.studienka, 100, 150), off(V.crossing, -500, 100), off(V.brili, -100, -650)], 150, 'oudinot-crossing', 'Oudinot crosses at 1 pm on 26 November'),
      arrow('russia', [off(V.staroi, 2300, 2200), off(V.staroi, 1450, 1350)], 170, 'wittgenstein-advance', 'Wittgenstein closes in from the north-east'),
      arrow('russia', [off(V.stakhovo, 0, -1900), off(V.stakhovo, 0, -1500)], 140, 'chaplits-return', 'Chaplits marches back towards Brili'),
    ],
    clashes: [{ at: off(V.staroi, 50, 50), size: 200 }],
  },
  markers: {
    'berezina-bridges-eble': mark(off(V.crossing, 300, 2000), 'Eblé', 'Two bridges, 26 November', 'france', 'bridge'),
    'berezina-bridges-oudinot': mark(off(V.brili, -1500, -1700), 'Oudinot', 'Across at 1 pm', 'france'),
    'berezina-bridges-partouneaux': mark(off(V.staroi, 700, -900), 'Partouneaux', 'Surrenders with 8,000 men', 'france', 'skull'),
  },
});

// --- 28 November: battle on both banks, the bridges under fire ---
writePlan(`${G}/030-berezina-banks`, {
  bbox,
  emblem: {
    water,
    works: bridges('Eblé’s two bridges at Studienka, one of them breaking under the crowd'),
    units: [
      unit('france', 'infantry', off(V.brili, -300, -1300), 1600, 400, 190, 'ney', 'Oudinot’s and Ney’s corps with the Poles, under Ney after Oudinot is wounded'),
      unit('france', 'cavalry', off(V.brili, -1500, -1700), 700, 300, 170, 'doumerc', 'Doumerc’s cuirassiers'),
      unit('france', 'infantry', off(V.brili, -700, 600), 1000, 350, 250, 'guard', 'The Imperial Guard'),
      unit('russia', 'infantry', off(V.stakhovo, -200, -800), 1800, 450, 10, 'chaplits', 'Chaplits, reinforced with infantry from Chichagov'),
      unit('france', 'infantry', off(V.studienka, 1200, -800), 1600, 400, 110, 'victor', 'IX Corps under Victor, holding the east bank'),
      unit('russia', 'infantry', off(V.studienka, 2700, -1200), 2000, 500, 290, 'wittgenstein', 'Wittgenstein’s army, attacking from 5 am'),
      unit('russia', 'artillery', off(V.studienka, 1300, 1300), 700, 160, 220, 'russian-guns', 'Russian guns firing on the bridges from 1 pm', { count: 6 }),
      unit('other', 'light', off(V.studienka, 300, -150), 1400, 400, 270, 'stragglers', 'Stragglers and civilians crowding to the bridges', { count: 7 }),
    ],
    arrows: [
      arrow('russia', [off(V.stakhovo, -200, -500), off(V.stakhovo, -250, 0)], 170, 'chaplits-attack', 'Chaplits pushes the French back towards Brili'),
      arrow('france', [off(V.brili, -1500, -1550), off(V.stakhovo, -1100, -300)], 150, 'doumerc-charge', 'Doumerc’s cuirassiers charge and drive the Russians back'),
      arrow('russia', [off(V.studienka, 2200, -1100), off(V.studienka, 1500, -850)], 170, 'wittgenstein-attack', 'Wittgenstein pushes Victor back in eight hours of fighting'),
    ],
    clashes: [{ at: off(V.stakhovo, -250, 100), size: 220 }, { at: off(V.stakhovo, -1150, -150), size: 180 }, { at: off(V.studienka, 1450, -830), size: 220 }],
  },
  markers: {
    'berezina-banks-ney': mark(off(V.brili, -2200, 100), 'Ney', 'Takes over from Oudinot', 'france'),
    'berezina-banks-wittgenstein': mark(off(V.studienka, 3200, -2400), 'Wittgenstein', 'Attacks at 5 am', 'russia'),
    'berezina-banks-guns': mark(off(V.studienka, 2500, 2600), 'Russian guns', 'Fire on the bridges, 1 pm', 'russia', 'target'),
  },
});

// --- 29 November: Victor across, the bridges burnt, the army west to Zembin ---
writePlan(`${G}/040-berezina-burning`, {
  bbox,
  emblem: {
    water: [river, swamp],
    works: [
      ...bridges('The bridges, set on fire at 8:30 am on 29 November'),
      { side: 'france', path: [[28.297, 54.346], [28.303, 54.334]], width: 40, id: 'gaina-bridges', name: 'Three bridges over the Gaina swamp, destroyed behind the army' },
    ],
    units: [
      unit('france', 'infantry', off(V.brili, -1700, 1200), 1500, 400, 290, 'army', 'The Grande Armée marching west to Zembin and Vilnius'),
      unit('france', 'infantry', off(V.brili, -300, 300), 1000, 350, 120, 'victor', 'Victor’s corps, across at 10 pm on 28 November'),
      unit('other', 'light', off(V.studienka, 300, -150), 1400, 400, 270, 'stragglers', 'Tens of thousands of stragglers and civilians left on the east bank', { count: 7 }),
      unit('russia', 'cavalry', off(V.studienka, 1300, 900), 1000, 300, 250, 'cossacks', 'Cossacks taking prisoners'),
      unit('russia', 'infantry', off(V.studienka, 1800, -700), 1800, 450, 290, 'wittgenstein', 'Wittgenstein’s army, without means to cross'),
      unit('russia', 'infantry', off(V.stakhovo, -200, -800), 1800, 450, 10, 'chaplits', 'Chaplits, held off on the west bank'),
    ],
    arrows: [
      arrow('france', [off(V.brili, -300, 600), off(V.brili, -1000, 1000), off(V.brili, -2600, 1500)], 180, 'retreat', 'The army marches west on the road to Zembin', 'dashed'),
      arrow('russia', [off(V.studienka, 1000, 700), off(V.studienka, 500, 100)], 150, 'cossack-attack', 'Cossacks and Wittgenstein’s troops round up those left behind'),
    ],
    clashes: [],
  },
  markers: {
    'berezina-burning-eble': mark(off(V.crossing, 300, 2000), 'Eblé', 'Burns the bridges, 8:30 am', 'france', 'flame'),
    'berezina-burning-stragglers': mark(off(V.studienka, 1600, -2300), 'East bank', 'Tens of thousands left behind', 'other', 'skull'),
    'berezina-burning-gaina': mark([28.3, 54.353], 'Gaina swamp', 'Three bridges destroyed', 'france', 'bridge'),
  },
});

console.log('berezina: bbox', JSON.stringify(bbox), 'crossing', JSON.stringify(V.crossing));
