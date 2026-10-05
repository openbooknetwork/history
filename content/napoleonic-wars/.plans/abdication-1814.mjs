// The allied march on Paris in March 1814, Napoleon at Fontainebleau and his journey to Elba, which leaves the
// page to the south.
import { writePlan } from './lib.mjs';

writePlan('pages/100-sixth-coalition/050-abdication-1814', {
  routes: {
    'allies-paris-1814': { name: 'The allied armies march on Paris, 25 – 30 March 1814',
      path: [[4.1, 48.75], [3.6, 48.85], [3.1, 48.95], [2.88, 48.96], [2.6, 48.9], [2.45, 48.88]] },
    'marmont-mortier-1814': { name: 'Marmont and Mortier fall back to Paris by Provins, 25 – 29 March 1814', style: 'dashed',
      path: [[4.0, 48.72], [3.6, 48.62], [3.3, 48.56], [2.9, 48.68], [2.6, 48.78], [2.42, 48.82]] },
    'napoleon-fontainebleau-1814': { name: 'Napoleon hurries back by Troyes to Fontainebleau, 27 – 31 March 1814',
      path: [[4.07, 48.3], [3.6, 48.28], [3.2, 48.3], [2.95, 48.36], [2.7, 48.4]] },
    'marmont-versailles-1814': { name: 'Marmont’s corps marches away to Versailles, 4 April 1814',
      path: [[2.46, 48.6], [2.3, 48.7], [2.13, 48.8]] },
    'napoleon-elba-1814': { name: 'Napoleon leaves Fontainebleau for Elba, 20 April – 4 May 1814', style: 'dashed',
      path: [[2.7, 48.4], [2.95, 48.05], [3.2, 47.4], [4.83, 45.76], [5.7, 44.2], [6.74, 43.43], [8.5, 43.0], [10.33, 42.81]] },
  },
  markers: {
    'abdication-1814-fere-champenoise': { lnglat: [4.1, 48.75], icon: 'swords', color: 'russia', label: 'Fère-Champenoise', note: '25 March, Marmont and Mortier defeated' },
    'abdication-1814-fontainebleau': { lnglat: [2.7, 48.4], icon: 'crown', color: 'france', label: 'Fontainebleau', note: 'Abdication, 6 April' },
  },
});
