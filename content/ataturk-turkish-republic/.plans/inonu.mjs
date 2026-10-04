// The two battles of İnönü, January and March 1921, on the railway from Bozüyük to Eskişehir.
// Divisions are drawn at about their frontage. Metristepe stands west of İnönü station. The downloaded articles give
// no coordinates for the positions, so the lines are placed from the railway and the towns.
import { writePlan } from './lib.mjs';
import { U, A, M } from './ata.mjs';

const P = 'pages/030-independence/030-1921';
const R = 'republic', GR = 'greek';
const box = [29.99, 39.75, 30.33, 39.95];
const railway = { side: 'neutral', path: [[30.04, 39.905], [30.085, 39.865], [30.147, 39.817], [30.25, 39.802], [30.40, 39.792]], width: 120, id: 'railway', name: 'The railway from Bozüyük through İnönü to Eskişehir' };
const metristepe = [30.108, 39.812];

writePlan(`${P}/011-inonu-first`, {
  bbox: box,
  emblem: {
    works: [railway],
    units: [
      U(GR, 'infantry', [30.085, 39.872], 4500, 900, 130, 'islands-division', 'Greek Islands Division, advancing by Kovalca and Akpınar'),
      U(GR, 'infantry', [30.150, 39.900], 4500, 900, 170, 'smyrna-division', 'Greek Smyrna Division, advancing from the north'),
      U(R, 'infantry', [30.135, 39.822], 5000, 900, 320, 'eleventh-division', 'Turkish 11th Division astride the railway'),
      U(R, 'infantry', [30.265, 39.825], 5000, 900, 290, 'sixty-first-division', 'Turkish 61st Division, coming up to reinforce the line'),
    ],
    arrows: [
      A(GR, [[30.095, 39.860], [30.105, 39.835], [30.110, 39.818]], 500, 'metristepe-taken', 'In the fog the Greeks take Metristepe, 10 January'),
      A(R, [[30.150, 39.815], [30.185, 39.818], [30.215, 39.822]], 450, 'line-pulled-back', 'Fevzi Pasha pulls the line back east', 'dashed'),
      A(GR, [[30.090, 39.880], [30.060, 39.900], [30.040, 39.915]], 450, 'greek-withdrawal', 'The Greeks withdraw towards Bozüyük, 11 January', 'dashed'),
    ],
    clashes: [{ at: metristepe, size: 600 }],
  },
  markers: {
    'inonu-first-metristepe': M([metristepe[0] - 0.035, metristepe[1] - 0.018], 'Metristepe', 'The dominant hill', R, 'mountain'),
    'inonu-first-ismet': M([30.255, 39.785], 'İsmet', 'Commander of the Western Front', R),
    'inonu-first-bozuyuk': M([30.040, 39.905], 'Bozüyük', 'On the road from Bursa', GR, 'landmark'),
  },
  show: ['inonu'],
});

writePlan(`${P}/012-inonu-second`, {
  bbox: box,
  emblem: {
    works: [railway],
    units: [
      U(GR, 'infantry', [30.110, 39.835], 7000, 1000, 130, 'third-corps', 'Greek III Corps, holding İnönü and Metristepe'),
      U(R, 'infantry', [30.200, 39.825], 7000, 1000, 300, 'western-front', 'İsmet Pasha’s Western Front, reinforced'),
    ],
    arrows: [
      A(GR, [[30.035, 39.915], [30.070, 39.880], [30.100, 39.850]], 500, 'greek-advance', 'The III Corps advances from Bursa, 23 to 27 March'),
      A(R, [[30.175, 39.815], [30.140, 39.812], [30.115, 39.812]], 500, 'retake-metristepe', 'İsmet retakes Metristepe, 31 March'),
      A(GR, [[30.100, 39.860], [30.065, 39.895], [30.035, 39.925]], 500, 'greek-retreat', 'The III Corps falls back towards Bursa in good order', 'dashed'),
    ],
    clashes: [{ at: metristepe, size: 600 }],
  },
  markers: {
    'inonu-second-metristepe': M([metristepe[0] - 0.035, metristepe[1] - 0.018], 'Metristepe', 'Telegram to Mustafa Kemal, 1 April', R, 'mountain'),
    'inonu-second-ismet': M([30.255, 39.785], 'İsmet Pasha', 'Counterattacks on 31 March', R),
  },
  show: ['inonu'],
});
console.log('inonu: 2 phase pages');
