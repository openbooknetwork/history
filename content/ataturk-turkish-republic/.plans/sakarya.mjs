// The Battle of the Sakarya, 23 August to 13 September 1921. The Sakarya and the Gök follow the valley floors traced
// in the cached elevation tiles (zoom 9, about 240 m a pixel): the Sakarya runs north at about 32° E past the Polatlı
// plain, the Gök comes in from the east at about 39.33° N. Çal Dağı is placed south west of Polatlı above the river.
import { writePlan } from './lib.mjs';
import { U, A, W, M } from './ata.mjs';

const P = 'pages/030-independence/030-1921/020-sakarya';
const R = 'republic', GR = 'greek';
const box = [31.45, 39.08, 32.75, 39.92];
const water = [
  W([[32.00, 39.12], [32.00, 39.20], [32.03, 39.27], [32.02, 39.32], [31.98, 39.40], [31.99, 39.48], [31.96, 39.56], [31.97, 39.64], [31.98, 39.70], [31.95, 39.76], [31.92, 39.81], [31.86, 39.86], [31.84, 39.92]], 700, 'sakarya-river', 'The Sakarya, steep banked, with two bridges on this front'),
  W([[32.45, 39.25], [32.35, 39.24], [32.27, 39.27], [32.19, 39.29], [32.10, 39.32], [32.02, 39.33]], 450, 'gok-river', 'The Gök, shallow, joining the Sakarya from the east'),
];
const calDagi = [32.06, 39.44];
const turkishLine = [
  U(R, 'infantry', [32.06, 39.725], 17000, 3500, 265, 'north-sector', 'Turkish infantry on the hills east of the Sakarya, northern sector'),
  U(R, 'infantry', [32.06, 39.555], 14000, 3500, 255, 'centre-sector', 'Turkish infantry in the centre, before Polatlı'),
];

writePlan(`${P}/021-sakarya-approach`, {
  bbox: box,
  emblem: {
    water,
    units: [
      ...turkishLine,
      U(R, 'infantry', [32.24, 39.35], 32000, 3500, 180, 'gok-line', 'Turkish line along the Gök, facing south'),
      U(R, 'light', [32.20, 39.22], 24000, 1500, 200, 'advanced-posts', 'Turkish advanced positions south of the Gök'),
    ],
    arrows: [
      A(GR, [[31.50, 39.62], [31.65, 39.60], [31.82, 39.58]], 3500, 'greek-east', 'Greek divisions march east to the river'),
      A(GR, [[31.55, 39.45], [31.68, 39.26], [31.95, 39.15], [32.22, 39.14]], 4500, 'flank-march', 'The march round the south to turn the Turkish left'),
    ],
    clashes: [{ at: [32.25, 39.19], size: 4000 }],
  },
  markers: {
    'sakarya-approach-polatli': M([32.147, 39.584], 'Polatlı', 'General staff headquarters', R, 'landmark'),
    'sakarya-approach-constantine': M([31.55, 39.37], 'King Constantine', 'Orders the attack, 10 August', GR),
  },
  show: ['alagoz'],
});

writePlan(`${P}/022-sakarya-heights`, {
  bbox: box,
  emblem: {
    water,
    units: [
      ...turkishLine,
      U(R, 'infantry', [32.26, 39.50], 20000, 3000, 200, 'second-line', 'Turkish second line, between Polatlı and Haymana'),
      U(GR, 'infantry', [32.08, 39.38], 12000, 3500, 10, 'greek-left', 'Greek divisions across the Gök, the western wing'),
      U(GR, 'infantry', [32.25, 39.36], 14000, 3500, 0, 'greek-centre', 'The Greek main effort in the centre'),
      U(GR, 'infantry', [32.45, 39.30], 12000, 3500, 20, 'greek-right', 'Greek divisions on the eastern wing'),
      U(GR, 'infantry', [31.87, 39.60], 14000, 3000, 85, 'greek-river', 'Greek divisions facing the river front'),
    ],
    arrows: [
      A(GR, [[32.08, 39.36], [32.07, 39.40], [32.06, 39.43]], 3500, 'cal-dagi', 'The Greeks storm Çal Dağı, taken on 2 September'),
      A(GR, [[32.25, 39.38], [32.24, 39.42], [32.22, 39.45]], 4000, 'centre-push', 'The centre pushes 16 km through the second line'),
      A(R, [[32.55, 39.34], [32.53, 39.20], [32.35, 39.12], [32.10, 39.12]], 1400, 'cavalry-raids', 'Turkish cavalry raids the Greek supply lines'),
    ],
    clashes: [{ at: calDagi, size: 3500 }, { at: [32.22, 39.46], size: 3500 }],
  },
  markers: {
    'sakarya-heights-cal-dagi': M([calDagi[0] - 0.07, calDagi[1] + 0.02], 'Çal Dağı', 'Commanding heights, 2 September', GR, 'mountain'),
    'sakarya-heights-haymana': M([32.495, 39.432], 'Haymana', 'The Greek advance comes near', R, 'landmark'),
  },
  show: ['alagoz'],
});

writePlan(`${P}/023-sakarya-counterattack`, {
  bbox: box,
  emblem: {
    water,
    units: [
      ...turkishLine,
      U(R, 'infantry', [32.26, 39.50], 20000, 3000, 200, 'second-line', 'Turkish line between Polatlı and Haymana, reinforced by new recruits'),
      U(GR, 'infantry', [32.10, 39.40], 14000, 3500, 10, 'greek-left', 'The Greek left round Çal Dağı'),
      U(GR, 'infantry', [32.30, 39.40], 18000, 3500, 0, 'greek-centre', 'The exhausted Greek centre'),
    ],
    arrows: [
      A(R, [[32.17, 39.52], [32.13, 39.48], [32.09, 39.44]], 3500, 'kemal-counterattack', 'Mustafa Kemal’s counterattack on the Greek left, 8 September'),
      A(GR, [[32.12, 39.36], [31.98, 39.31], [31.80, 39.33], [31.62, 39.40]], 3500, 'greek-retreat-west', 'The Greek army withdraws across the Sakarya, night of 12 to 13 September', 'dashed'),
      A(GR, [[32.32, 39.34], [32.10, 39.24], [31.85, 39.22], [31.65, 39.28]], 3500, 'greek-retreat-south', 'The eastern wing pulls back by the south', 'dashed'),
    ],
    clashes: [{ at: calDagi, size: 3500 }],
  },
  markers: {
    'sakarya-counterattack-kemal': M([32.21, 39.56], 'Mustafa Kemal', 'Leads the counterattack, 8 September', R),
    'sakarya-counterattack-sivrihisar': M([31.54, 39.45], 'Sivrihisar', 'Retaken, 20 September', R, 'landmark'),
  },
});
console.log('sakarya: 3 phase pages');
