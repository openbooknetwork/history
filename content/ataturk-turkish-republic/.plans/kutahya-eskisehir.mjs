// The Greek summer offensive of July 1921 and the Turkish withdrawal behind the Sakarya, at the scale of the
// campaign. Corps and groups are drawn tens of kilometres wide. The Sakarya follows the valley floor in the cached
// elevation tiles (see sakarya.mjs). The downloaded articles name no Greek corps here, so units stay general.
import { writePlan } from './lib.mjs';
import { U, A, W, M } from './ata.mjs';

const P = 'pages/030-independence/030-1921/020-sakarya';
const R = 'republic', GR = 'greek';
const box = [29.25, 38.55, 32.3, 40.15];
const sakarya = W([[32.00, 39.20], [32.02, 39.30], [31.98, 39.40], [31.99, 39.48], [31.96, 39.56], [31.97, 39.64], [31.98, 39.70], [31.95, 39.76], [31.92, 39.81], [31.86, 39.86], [31.84, 39.92]], 1200, 'sakarya-river', 'The Sakarya river');

writePlan(`${P}/011-kutahya-eskisehir-offensive`, {
  bbox: box,
  emblem: {
    water: [sakarya],
    units: [
      U(R, 'infantry', [30.30, 39.78], 30000, 6000, 290, 'turkish-north', 'Western Front, main body before Eskişehir'),
      U(R, 'infantry', [30.10, 39.38], 25000, 6000, 250, 'turkish-kutahya', 'Western Front units at Kütahya'),
      U(R, 'infantry', [30.55, 38.85], 22000, 5000, 240, 'turkish-afyon', 'Western Front units at Afyon'),
      U(GR, 'infantry', [29.55, 38.80], 35000, 7000, 70, 'greek-south', 'Greek southern group from Uşak'),
      U(GR, 'infantry', [30.02, 39.95], 30000, 6000, 135, 'greek-north', 'Greek northern group by Bozüyük'),
    ],
    arrows: [
      A(GR, [[29.80, 38.78], [30.15, 38.76], [30.45, 38.78]], 5000, 'to-afyon', 'The southern group takes Afyon'),
      A(GR, [[29.75, 38.95], [29.88, 39.18], [30.00, 39.36]], 5000, 'to-kutahya', 'And then Kütahya'),
      A(GR, [[30.12, 39.42], [30.30, 39.58], [30.45, 39.70]], 4000, 'turn-north', 'The Greeks prepare to turn north along the railway'),
    ],
    clashes: [{ at: [30.40, 38.80], size: 6000 }, { at: [29.98, 39.40], size: 6000 }],
  },
  markers: {
    'kutahya-eskisehir-offensive-constantine': M([29.40, 38.68], 'King Constantine', 'Leads the offensive', GR),
    'kutahya-eskisehir-offensive-ismet': M([30.62, 39.62], 'İsmet Pasha', 'Western Front', R),
    'kutahya-eskisehir-offensive-kutahya': M([29.90, 39.30], 'Kütahya', 'Falls to the Greeks', GR, 'landmark'),
    'kutahya-eskisehir-offensive-eskisehir': M([30.52, 39.78], 'Eskişehir', 'Junction of the railways', R, 'landmark'),
  },
});

writePlan(`${P}/012-kutahya-eskisehir-retreat`, {
  bbox: box,
  emblem: {
    water: [sakarya],
    units: [
      U(GR, 'infantry', [30.35, 39.62], 35000, 7000, 30, 'greek-main', 'The Greek main body, wheeling north on Eskişehir'),
      U(GR, 'infantry', [30.10, 39.88], 25000, 6000, 120, 'greek-feint', 'The Greek feint towards the Turkish right'),
      U(R, 'infantry', [31.92, 39.62], 55000, 6000, 270, 'sakarya-line', 'The Western Front behind the Sakarya, about 80 km from Ankara'),
    ],
    arrows: [
      A(GR, [[30.15, 39.82], [30.30, 39.80], [30.42, 39.79]], 4000, 'feint', 'The feint towards Eskişehir, 16 July'),
      A(GR, [[30.40, 39.66], [30.48, 39.72], [30.52, 39.76]], 4500, 'eskisehir-falls', 'Eskişehir falls'),
      A(R, [[30.70, 39.76], [31.15, 39.72], [31.62, 39.66]], 6000, 'withdrawal-north', 'İsmet breaks contact and withdraws east', 'dashed'),
      A(R, [[30.80, 39.35], [31.25, 39.42], [31.65, 39.50]], 6000, 'withdrawal-south', 'The southern units fall back to the Sakarya', 'dashed'),
    ],
    clashes: [{ at: [30.52, 39.76], size: 6000 }],
  },
  markers: {
    'kutahya-eskisehir-retreat-kemal': M([31.75, 39.95], 'Mustafa Kemal', 'The army before the ground', R),
    'kutahya-eskisehir-retreat-kutahya': M([29.98, 39.42], 'Kütahya', 'The Greek leaders meet here', GR, 'users'),
  },
  show: ['eskisehir'],
});
console.log('kutahya-eskisehir: 2 phase pages');
