// Tilsit, June and July 1807: the Russian retreat to the Niemen and the places the treaties dispose of
// (Treaties of Tilsit article).
import { writePlan } from './lib.mjs';

writePlan('pages/060-fourth-coalition/060-tilsit', {
  bbox: [8.5, 50.0, 24.5, 56.0],
  routes: {
    'bennigsen-tilsit-1807': { name: 'The Russian army falls back over the Niemen at Tilsit, June 1807', style: 'dashed',
      path: [[21.015, 54.445], [21.24, 54.61], [21.6, 54.85], [21.88, 55.08], [22.0, 55.13]] },
  },
  markers: {
    'tilsit-tilsit': { lnglat: [21.88, 55.08], icon: 'scroll', color: 'france', label: 'Tilsit', note: 'Treaties of 7 and 9 July' },
    'tilsit-kassel': { lnglat: [9.5, 51.32], icon: 'crown', color: 'client', label: 'Kingdom of Westphalia', note: 'Jérôme Bonaparte' },
    'tilsit-warsaw': { lnglat: [21.01, 52.23], icon: 'crown', color: 'rhine', label: 'Duchy of Warsaw', note: 'Under the King of Saxony' },
    'tilsit-danzig': { lnglat: [18.65, 54.35], icon: 'flag', color: 'other', label: 'Danzig', note: 'A free city' },
    'tilsit-bialystok': { lnglat: [23.16, 53.13], icon: 'flag', color: 'russia', label: 'Białystok', note: 'To Russia' },
  },
});
console.log('tilsit: routes and markers');
