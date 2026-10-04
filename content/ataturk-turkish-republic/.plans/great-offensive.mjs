// The Great Offensive and the Battle of Dumlupınar, 26 August to 2 September 1922. Erkmentepe, Olucak, Başkimse,
// Çalköy and Alıören are at the coordinates the Battle of Dumlupınar article gives. The Greek line round Afyon, the
// Kırka gorge and the surrender places are drawn from the article's description, not from coordinates.
import { writePlan } from './lib.mjs';
import { U, A, M } from './ata.mjs';

const P = 'pages/030-independence/040-1922/010-great-offensive';
const R = 'republic', GR = 'greek';
const afyonBox = [30.08, 38.55, 30.88, 39.0];
const westBox = [29.82, 38.66, 30.62, 39.06];
const erkmentepe = [30.4756, 38.7434], olucak = [30.2274, 38.9326], baskimse = [30.2030, 38.8636], calkoy = [30.0685, 38.9299], alioren = [29.9992, 38.9464];
const railway = { side: 'neutral', path: [[30.54, 38.76], [30.42, 38.79], [30.28, 38.82], [30.12, 38.845], [29.98, 38.85], [29.82, 38.82]], width: 500, id: 'railway', name: 'The railway from Afyon to Dumlupınar and İzmir, the Greek supply line' };

writePlan(`${P}/021-afyon-barrage`, {
  bbox: afyonBox,
  emblem: {
    works: [railway],
    units: [
      U(GR, 'infantry', [30.40, 38.712], 9000, 1600, 200, 'greek-first', 'Greek 1st Division, south west of Afyon'),
      U(GR, 'infantry', [30.56, 38.705], 8000, 1600, 180, 'greek-fourth', 'Greek 4th Division, south of Afyon'),
      U(GR, 'infantry', [30.68, 38.86], 9000, 1600, 90, 'greek-fifth', 'Greek 5th Division, north east of Afyon'),
      U(GR, 'infantry', [30.48, 38.94], 10000, 2500, 160, 'greek-second-corps', 'Greek II Corps in reserve, by Gazlıgöl'),
      U(R, 'infantry', [30.37, 38.668], 9000, 2000, 20, 'turkish-first-corps', 'Turkish I Corps, four divisions'),
      U(R, 'infantry', [30.51, 38.664], 9000, 2000, 0, 'turkish-fourth-corps', 'Turkish IV Corps, four divisions'),
      U(R, 'infantry', [30.44, 38.60], 8000, 1800, 0, 'turkish-second-corps', 'Turkish II Corps in reserve'),
      U(R, 'infantry', [30.79, 38.88], 10000, 2000, 270, 'second-army', 'Second Army under Yakup Şevki Pasha'),
      U(R, 'cavalry', [30.19, 38.74], 6000, 1800, 0, 'fifth-cavalry', 'V Cavalry Corps under Fahrettin Pasha, behind the Greek line'),
    ],
    arrows: [
      A(R, [[30.25, 38.60], [30.19, 38.66], [30.18, 38.71]], 1500, 'kirka-gorge', 'Through the Kırka gorge in the night of 25 to 26 August'),
      A(R, [[30.19, 38.77], [30.20, 38.80], [30.22, 38.83]], 1300, 'cut-railway', 'The cavalry cuts the railway and the telegraph by 18.00'),
      A(R, [[30.40, 38.680], [30.42, 38.700], [30.44, 38.718]], 1500, 'first-corps-attack', 'Seven divisions attack the seam of the Greek 1st and 4th Divisions'),
      A(R, [[30.50, 38.676], [30.49, 38.695], [30.48, 38.715]], 1500, 'fourth-corps-attack', 'The IV Corps attacks towards Erkmentepe'),
      A(R, [[30.75, 38.88], [30.72, 38.87], [30.70, 38.865]], 1500, 'second-army-attack', 'The Second Army attacks north of Afyon'),
    ],
    clashes: [{ at: [30.42, 38.70], size: 1800 }, { at: [30.70, 38.86], size: 1500 }],
  },
  markers: {
    'afyon-barrage-kemal': M([30.32, 38.63], 'Mustafa Kemal', 'Watches from Kocatepe at dawn', R),
    'afyon-barrage-nurettin': M([30.53, 38.625], 'Nurettin Pasha', 'First Army', R),
    'afyon-barrage-afyon': M([30.54, 38.76], 'Afyon', 'Greek I Corps', GR, 'landmark'),
  },
});

writePlan(`${P}/022-afyon-erkmentepe`, {
  bbox: afyonBox,
  emblem: {
    works: [railway],
    units: [
      U(GR, 'infantry', [30.38, 38.73], 7000, 1500, 200, 'greek-first', 'Greek 1st Division, cut off from its corps, collapsing at 13.30'),
      U(GR, 'infantry', [30.60, 38.72], 6000, 1500, 180, 'greek-fourth', 'Greek 4th Division, falling back'),
      U(R, 'infantry', [30.40, 38.69], 8000, 2000, 20, 'turkish-first-corps', 'Turkish I Corps'),
      U(R, 'infantry', [30.49, 38.715], 7000, 2000, 340, 'turkish-fourth-corps', 'Turkish IV Corps under Kemalettin Sami, on Erkmentepe'),
      U(R, 'cavalry', [30.20, 38.80], 6000, 1800, 60, 'fifth-cavalry', 'V Cavalry Corps astride the railway'),
    ],
    arrows: [
      A(R, [[30.49, 38.700], [30.483, 38.722], [30.477, 38.740]], 1500, 'erkmentepe', 'The IV Corps takes Erkmentepe at 9.00'),
      A(GR, [[30.55, 38.74], [30.52, 38.80], [30.48, 38.88]], 1500, 'greek-withdrawal', 'The Greek I Corps withdraws 20 km north and gives up Afyon', 'dashed'),
      A(GR, [[30.36, 38.75], [30.30, 38.79], [30.24, 38.82]], 1300, 'first-division-west', 'The 1st Division falls back west', 'dashed'),
    ],
    clashes: [{ at: erkmentepe, size: 1800 }],
  },
  markers: {
    'afyon-erkmentepe-peak': M([erkmentepe[0] - 0.05, erkmentepe[1] + 0.02], 'Erkmentepe', 'The line breaks at 9.00', R, 'mountain'),
    'afyon-erkmentepe-afyon': M([30.54, 38.76], 'Afyon', 'Turkish by the evening', R, 'landmark'),
  },
  show: ['kocatepe'],
});

writePlan(`${P}/023-afyon-gap`, {
  bbox: westBox,
  emblem: {
    works: [railway],
    units: [
      U(GR, 'infantry', [30.21, 38.93], 9000, 3500, 270, 'trikoupis-group', 'Trikoupis group: most of the Greek I and II Corps, the night at Olucak'),
      U(GR, 'infantry', [29.99, 38.85], 9000, 2500, 90, 'frangou-group', 'Frangou group: the Greek 1st and 7th Divisions at Dumlupınar'),
      U(R, 'infantry', [30.30, 38.80], 9000, 2500, 300, 'first-army', 'Turkish First Army, following'),
      U(R, 'cavalry', [30.30, 38.94], 4000, 1500, 250, 'second-cavalry', 'Turkish 2nd Cavalry Division, mauled by the Greek 9th Division'),
    ],
    arrows: [
      A(GR, [[30.40, 38.80], [30.24, 38.84], [30.06, 38.85]], 1500, 'frangou-march', 'Frangou takes his group west in the night of 27 to 28 August', 'dashed'),
      A(GR, [[30.45, 38.88], [30.35, 38.92], [30.26, 38.93]], 1500, 'trikoupis-march', 'Trikoupis starts west at 5.00 on 28 August', 'dashed'),
      A(R, [[30.36, 38.78], [30.30, 38.84], [30.26, 38.87]], 1500, 'into-the-gap', 'Turkish units follow into the gap between the two groups'),
    ],
    clashes: [{ at: [30.36, 38.90], size: 1800 }, { at: [30.30, 38.93], size: 1500 }],
  },
  markers: {
    'afyon-gap-olucak': M(olucak, 'Olucak', 'Trikoupis’s night, 28 to 29 August', GR, 'flag'),
    'afyon-gap-fourth-division': M([30.38, 38.87], 'Greek 4th Division', 'Column broken at 7.00', GR, 'skull'),
    'afyon-gap-baskimse': M(baskimse, 'Başkimse', 'Frangou’s line on 28 August', GR, 'flag'),
  },
});

writePlan(`${P}/024-afyon-ring`, {
  bbox: [29.9, 38.76, 30.4, 39.04],
  emblem: {
    works: [railway],
    units: [
      U(GR, 'infantry', [30.18, 38.92], 9000, 4000, 270, 'trikoupis-group', 'Trikoupis group, surrounded'),
      U(GR, 'infantry', [29.99, 38.85], 9000, 2500, 90, 'frangou-group', 'Frangou group at Dumlupınar'),
      U(R, 'infantry', [30.20, 39.00], 9000, 2000, 180, 'sixth-corps', 'Turkish VI Corps of the Second Army, to the north'),
      U(R, 'infantry', [30.17, 38.86], 9000, 2000, 0, 'fourth-corps', 'Turkish IV Corps, to the south'),
      U(R, 'cavalry', [30.07, 38.88], 5000, 1500, 60, 'fifth-cavalry', 'V Cavalry Corps, between the two Greek groups'),
      U(R, 'infantry', [30.10, 38.81], 7000, 2000, 270, 'first-corps', 'Turkish I Corps, before Dumlupınar'),
    ],
    arrows: [
      A(GR, [[30.15, 38.91], [30.14, 38.88], [30.14, 38.87]], 1300, 'ninth-division', 'The Greek 9th Division tries to open the road to Dumlupınar'),
      A(R, [[30.28, 38.90], [30.24, 38.91], [30.22, 38.915]], 1300, 'east-attack', 'The Turks attack the Greek 12th Division on the eastern flank'),
      A(GR, [[30.15, 38.94], [30.11, 38.94], [30.075, 38.932]], 1300, 'night-march', 'At 23.00 the group breaks away towards Çalköy', 'dashed'),
    ],
    clashes: [{ at: [30.14, 38.875], size: 1500 }, { at: [30.22, 38.915], size: 1500 }],
  },
  markers: {
    'afyon-ring-hamurkoy': M([30.25, 38.96], 'Hamurköy and İlbulak Dağ', 'All day, heavy losses', GR, 'swords'),
    'afyon-ring-calkoy': M(calkoy, 'Çalköy', 'The Greeks march here at night', GR, 'landmark'),
  },
});

writePlan(`${P}/031-dumlupinar-alioren`, {
  bbox: [29.88, 38.86, 30.20, 39.01],
  emblem: {
    units: [
      U(GR, 'infantry', [30.035, 38.938], 4500, 1800, 270, 'trikoupis-group', 'Trikoupis group: 7,000 infantry fit to fight, crowded together'),
      U(GR, 'light', [30.06, 38.925], 3500, 400, 270, 'stragglers', '10,000 to 15,000 disorganised men, largely unarmed'),
      U(R, 'cavalry', [29.982, 38.960], 2500, 900, 110, 'fourteenth-cavalry', 'Turkish 14th Cavalry Division, blocking the road at 13.30'),
      U(R, 'infantry', [30.085, 38.903], 5000, 1300, 320, 'fourth-corps', 'Turkish IV Corps, pressing from the east and south'),
      U(R, 'infantry', [30.04, 38.985], 5000, 1300, 180, 'sixth-corps', 'Turkish VI Corps, attacking from the north'),
    ],
    arrows: [
      A(R, [[30.09, 38.91], [30.07, 38.92], [30.055, 38.928]], 700, 'fourth-corps-attack', 'The IV Corps attacks'),
      A(R, [[30.04, 38.975], [30.038, 38.962], [30.036, 38.950]], 700, 'sixth-corps-attack', 'The VI Corps attacks'),
      A(GR, [[30.015, 38.94], [29.97, 38.935], [29.92, 38.925]], 700, 'night-march-west', 'At 20.30 the survivors march west, leaving guns and wounded', 'dashed'),
    ],
    clashes: [{ at: [30.008, 38.944], size: 700 }, { at: [30.06, 38.93], size: 700 }],
  },
  markers: {
    'dumlupinar-alioren-kemal': M([30.145, 38.928], 'Mustafa Kemal', 'Directs the battle from Zafertepe', R),
    'dumlupinar-alioren-alioren': M([alioren[0] - 0.012, alioren[1] - 0.012], 'Alıören', 'The road west is blocked', R, 'landmark'),
    'dumlupinar-alioren-calkoy': M(calkoy, 'Çalköy', 'Under artillery fire from 7.00', GR, 'landmark'),
  },
});

writePlan(`${P}/032-dumlupinar-surrender`, {
  bbox: [29.55, 38.62, 30.25, 39.08],
  emblem: {
    units: [
      U(R, 'cavalry', [29.80, 38.99], 6000, 1500, 90, 'turkish-cavalry', 'Turkish cavalry in pursuit'),
      U(R, 'infantry', [30.05, 38.90], 8000, 2000, 270, 'turkish-army', 'Turkish First and Second Armies'),
    ],
    arrows: [
      A(GR, [[29.95, 38.94], [29.88, 38.97], [29.83, 38.99]], 900, 'column-twelfth', 'A column of 2,000, mostly 12th Division: surrenders on 1 September', 'dashed'),
      A(GR, [[29.95, 38.93], [29.86, 38.92], [29.78, 38.90]], 900, 'column-trikoupis', 'Trikoupis with 5,000 to 6,000 men: surrenders on 2 September', 'dashed'),
      A(GR, [[29.95, 38.92], [29.82, 38.86], [29.65, 38.80]], 900, 'column-escape', 'A column of 5,000 escapes the ring', 'dashed'),
      A(GR, [[29.97, 38.84], [29.86, 38.78], [29.75, 38.74]], 900, 'frangou-retreat', 'Frangou’s group retreats towards Banaz', 'dashed'),
    ],
  },
  markers: {
    'dumlupinar-surrender-trikoupis': M([29.77, 38.905], 'Trikoupis', 'Surrenders, 17.00, 2 September', GR, 'flag'),
    'dumlupinar-surrender-banaz': M([29.75, 38.74], 'Banaz', 'Frangou’s line of retreat', GR, 'landmark'),
  },
  show: ['dumlupinar'],
});
console.log('great-offensive: 6 phase pages');
