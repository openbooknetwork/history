// Brumaire, October to December 1799: Bonaparte's voyage from Egypt and his journey to Paris.
import { writePlan } from './lib.mjs';

writePlan('pages/040-second-coalition/020-brumaire', {
  routes: {
    'bonaparte-muiron-1799': { name: 'Bonaparte sails from Alexandria to Fréjus in the Muiron, 23 August to 9 October 1799',
      path: [[29.9, 31.25], [24.0, 33.6], [18.0, 35.6], [11.5, 37.6], [8.4, 40.0], [7.4, 42.4], [6.74, 43.41]] },
    'bonaparte-paris-1799': { name: 'From Fréjus to Paris, 9 to 16 October 1799',
      path: [[6.74, 43.43], [5.4, 44.6], [4.85, 45.75], [3.6, 47.0], [2.35, 48.85]] },
  },
  markers: {
    'brumaire-frejus': { lnglat: [6.74, 43.43], icon: 'anchor', color: 'france', label: 'Fréjus', note: 'Bonaparte lands, 9 October 1799' },
    'brumaire-paris': { lnglat: [2.3, 48.86], icon: 'landmark', color: 'france', label: 'Paris and Saint-Cloud', note: 'Coup of 18 Brumaire, 9 and 10 November' },
  },
});
