// The end of the war of 1809 and the years of peace after it: the retreat to Znaim, the Walcheren landing, the
// treaty at Schönbrunn and Marie Louise's journey to France.
import { writePlan } from './lib.mjs';

writePlan('pages/080-fifth-coalition/040-schonbrunn', {
  routes: {
    'charles-znaim-1809': { name: 'Charles retreats from Wagram to Znaim, 6 – 11 July 1809', style: 'dashed',
      path: [[16.56, 48.3], [16.33, 48.35], [16.08, 48.56], [16.05, 48.85]] },
    'chatham-walcheren-1809': { name: 'The British expedition to Walcheren, July 1809',
      path: [[1.45, 51.23], [2.4, 51.4], [3.3, 51.5], [3.6, 51.5]] },
    'marie-louise-1810': { name: 'Marie Louise travels from Vienna to Compiègne, March 1810',
      path: [[16.37, 48.21], [14.29, 48.31], [11.58, 48.14], [9.18, 48.78], [7.75, 48.58], [6.18, 48.69], [4.03, 49.25], [2.83, 49.42]] },
  },
  markers: {
    'schonbrunn-palace': { lnglat: [16.31, 48.18], icon: 'scroll-text', color: 'france', label: 'Schönbrunn', note: 'Treaty, 14 October 1809' },
    'schonbrunn-tyrol': { lnglat: [11.39, 47.27], icon: 'flame', color: 'other', label: 'Tyrol', note: 'Hofer’s rising put down' },
    'schonbrunn-paris': { lnglat: [2.35, 48.86], icon: 'crown', color: 'france', label: 'Paris', note: 'Wedding, 1 – 2 April 1810' },
    'schonbrunn-amsterdam': { lnglat: [4.9, 52.37], icon: 'flag', color: 'france', label: 'Amsterdam', note: 'Holland annexed, July 1810' },
  },
});
