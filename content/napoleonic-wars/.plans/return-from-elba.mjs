// The return from Elba, 26 February – 20 March 1815: the crossing to Golfe-Juan, the Route Napoléon through the
// Alps to Grenoble, the road by Lyon to Paris, and Louis XVIII's departure for Belgium.
import { writePlan } from './lib.mjs';

writePlan('pages/110-hundred-days/010-return-from-elba', {
  routes: {
    'napoleon-golfe-juan-1815': { name: 'Napoleon sails from Portoferraio and lands at Golfe-Juan, 26 February – 1 March 1815',
      path: [[10.33, 42.82], [9.9, 43.1], [9.2, 43.3], [8.2, 43.45], [7.08, 43.56]] },
    'route-napoleon-1815': { name: 'The Route Napoléon through the Alps to Grenoble, 1 – 7 March 1815',
      path: [[7.08, 43.56], [6.92, 43.66], [6.51, 43.85], [6.23, 44.09], [5.94, 44.2], [6.08, 44.56], [5.95, 44.82], [5.77, 45.02], [5.72, 45.19]] },
    'napoleon-paris-1815': { name: 'From Grenoble by Lyon to Paris, 8 – 20 March 1815',
      path: [[5.72, 45.19], [5.27, 45.59], [4.83, 45.76], [4.83, 46.31], [4.85, 46.78], [4.3, 46.95], [3.91, 47.49], [3.57, 47.8], [3.28, 48.2], [2.7, 48.4], [2.35, 48.86]] },
    'louis-xviii-1815': { name: 'Louis XVIII leaves Paris for Belgium, 20 March 1815', style: 'dashed',
      path: [[2.35, 48.86], [2.5, 49.4], [2.9, 50.1], [3.06, 50.63], [3.3, 50.85]] },
  },
  markers: {
    'return-from-elba-portoferraio': { lnglat: [10.33, 42.81], icon: 'castle', color: 'france', label: 'Portoferraio', note: 'Napoleon’s capital on Elba' },
    'return-from-elba-golfe-juan': { lnglat: [7.08, 43.56], icon: 'anchor', color: 'france', label: 'Golfe-Juan', note: 'Landing, 1 March' },
    'return-from-elba-laffrey': { lnglat: [5.77, 45.02], icon: 'flag', color: 'france', label: 'Laffrey', note: 'The 5th Regiment goes over' },
    'return-from-elba-lyon': { lnglat: [4.83, 45.76], icon: 'scroll-text', color: 'france', label: 'Lyon', note: 'Decrees of 13 March' },
    'return-from-elba-lons': { lnglat: [5.55, 46.67], icon: 'user', color: 'france', label: 'Lons-le-Saunier', note: 'Ney goes over, 14 March' },
    'return-from-elba-paris': { lnglat: [2.35, 48.86], icon: 'crown', color: 'france', label: 'Paris', note: 'Napoleon enters, 20 March' },
  },
});
