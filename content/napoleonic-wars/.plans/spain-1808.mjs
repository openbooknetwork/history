// Portugal and Spain, October 1807 to June 1808: Junot's march to Lisbon, the flight of the Portuguese court, Murat's
// march on Madrid, and the places of the Spanish crisis (Invasion of Portugal (1807), Peninsular War articles).
import { writePlan } from './lib.mjs';

writePlan('pages/070-peninsula/010-spain-1808', {
  routes: {
    'junot-1807': { name: 'Junot’s march to Lisbon, October to November 1807',
      path: [[-1.79, 43.34], [-2.67, 42.85], [-3.7, 42.34], [-4.72, 41.65], [-5.66, 40.96], [-6.53, 40.6], [-6.69, 40.25], [-6.88, 39.72], [-7.49, 39.82], [-8.2, 39.46], [-8.68, 39.24], [-9.14, 38.72]] },
    'braganza-1807': { name: 'The Portuguese court sails for Brazil, 29 November 1807', style: 'dashed',
      path: [[-9.14, 38.7], [-9.32, 38.66], [-9.75, 38.35], [-10.4, 37.5]] },
    'murat-1808': { name: 'Murat marches on Madrid, March 1808', offset: 6,
      path: [[-1.47, 43.49], [-1.79, 43.34], [-2.67, 42.85], [-3.7, 42.34], [-3.69, 41.67], [-3.58, 41.13], [-3.7, 40.43]] },
  },
  markers: {
    'spain-1808-lisbon': { lnglat: [-9.14, 38.71], icon: 'flag', color: 'france', label: 'Lisbon', note: 'Junot enters, 30 November 1807' },
    'spain-1808-madrid': { lnglat: [-3.7, 40.42], icon: 'swords', color: 'spain', label: 'Madrid', note: 'Rising of 2 May 1808' },
    'spain-1808-bayonne': { lnglat: [-1.47, 43.49], icon: 'crown', color: 'france', label: 'Bayonne', note: 'Both kings renounce the crown, May 1808' },
  },
});
console.log('spain-1808: routes and markers');
