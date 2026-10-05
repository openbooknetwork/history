// Abukir and the end in Egypt, July 1799 to September 1801.
import { writePlan } from './lib.mjs';

writePlan('pages/030-egypt/050-egypt-end', {
  routes: {
    'bonaparte-abukir-1799': { name: 'Bonaparte marches from Giza by Damanhur to Abukir, July 1799',
      path: [[31.2, 30.0], [30.95, 30.35], [30.7, 30.75], [30.47, 31.04], [30.25, 31.2], [30.09, 31.29]] },
    'abercromby-1801': { name: 'Abercromby lands at Abukir and advances on Alexandria, March 1801',
      path: [[30.13, 31.37], [30.07, 31.31], [30.0, 31.27], [29.95, 31.23]] },
    'hutchinson-1801': { name: 'British and Ottoman troops take Rosetta and advance up the Nile to Cairo, April to June 1801', offset: 6,
      path: [[30.1, 31.3], [30.25, 31.33], [30.42, 31.4], [30.47, 31.3], [30.64, 31.11], [30.71, 31.03], [30.8, 30.85], [30.94, 30.5], [31.11, 30.22], [31.22, 30.07]] },
    'vizier-1801': { name: 'The grand vizier’s army from El Arish to Cairo, spring 1801',
      path: [[33.8, 31.13], [32.6, 30.95], [31.93, 30.78], [31.56, 30.42], [31.3, 30.1]] },
  },
  markers: {
    'egypt-end-el-arish': { lnglat: [33.8, 31.13], icon: 'scroll', color: 'ottoman', label: 'El Arish', note: 'Convention, 24 January 1800' },
    'egypt-end-heliopolis': { lnglat: [31.31, 30.13], icon: 'swords', color: 'france', label: 'Heliopolis', note: 'Kléber wins, 20 March 1800' },
  },
});
