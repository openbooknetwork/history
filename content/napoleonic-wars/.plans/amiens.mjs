// Lunéville, Copenhagen and Amiens, 1801 to 1802: the British fleet against the League of Armed Neutrality.
import { writePlan } from './lib.mjs';

writePlan('pages/040-second-coalition/050-amiens', {
  routes: {
    'parker-1801': { name: 'Parker and Nelson sail from Yarmouth to Copenhagen, 12 March to 2 April 1801',
      path: [[1.75, 52.6], [3.5, 54.0], [7.0, 56.6], [10.0, 57.9], [11.0, 57.4], [12.0, 56.6], [12.62, 56.05], [12.65, 55.72]] },
  },
  markers: {
    'amiens-luneville': { lnglat: [6.49, 48.59], icon: 'scroll', color: 'france', label: 'Lunéville', note: 'Peace with Austria, 9 February 1801' },
    'amiens-amiens': { lnglat: [2.3, 49.89], icon: 'scroll', color: 'france', label: 'Amiens', note: 'Peace with Britain, 25 March 1802' },
    'amiens-yarmouth': { lnglat: [1.73, 52.61], icon: 'anchor', color: 'britain', label: 'Yarmouth', note: 'The fleet sails, 12 March 1801' },
    'amiens-st-petersburg': { lnglat: [30.32, 59.94], icon: 'skull', color: 'russia', label: 'Saint Petersburg', note: 'Paul I murdered, 23 March 1801' },
    'amiens-malta': { lnglat: [14.51, 35.9], icon: 'flag', color: 'britain', label: 'Malta', note: 'To be returned to the Knights' },
  },
});
