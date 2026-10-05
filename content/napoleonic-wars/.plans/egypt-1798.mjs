// The expedition to Egypt, May to July 1798: the fleet from Toulon by Malta to Alexandria.
import { writePlan } from './lib.mjs';

writePlan('pages/030-egypt/010-egypt-1798', {
  routes: {
    'bonaparte-1798': { name: 'Bonaparte’s fleet from Toulon by Malta to Alexandria, 19 May to 1 July 1798',
      path: [[5.93, 43.08], [7.4, 43.45], [8.7, 43.95], [9.75, 42.6], [9.3, 41.32], [8.1, 40.7], [8.15, 38.8], [11.6, 37.4], [14.5, 35.95], [19.0, 35.3], [24.2, 34.65], [27.5, 32.6], [29.9, 31.23]] },
  },
  markers: {
    'egypt-1798-toulon': { lnglat: [5.93, 43.12], icon: 'anchor', color: 'france', label: 'Toulon', note: 'The fleet sails, 19 May 1798' },
    'egypt-1798-genoa': { lnglat: [8.93, 44.41], icon: 'anchor', color: 'france', label: 'Genoa', note: 'Convoy port' },
    'egypt-1798-ajaccio': { lnglat: [8.74, 41.92], icon: 'anchor', color: 'france', label: 'Ajaccio', note: 'Convoy port' },
    'egypt-1798-civitavecchia': { lnglat: [11.8, 42.09], icon: 'anchor', color: 'france', label: 'Civitavecchia', note: 'Convoy joins at Malta' },
    'egypt-1798-malta': { lnglat: [14.51, 35.9], icon: 'flag', color: 'france', label: 'Valletta', note: 'The Knights surrender, 12 June' },
    'egypt-1798-alexandria': { lnglat: [29.92, 31.2], icon: 'flag', color: 'france', label: 'Alexandria', note: 'Stormed, 2 July 1798' },
  },
});
