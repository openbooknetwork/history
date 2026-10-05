// Jemappes and the conquest of the Austrian Netherlands, October to December 1792, with Custine on the Rhine.
import { writePlan } from './lib.mjs';

writePlan('pages/020-first-coalition/020-jemappes', {
  routes: {
    'dumouriez-belgium-1792': { name: 'Dumouriez invades the Austrian Netherlands, from Valenciennes by Jemappes to Brussels, 27 October to 14 November 1792',
      path: [[3.52, 50.36], [3.68, 50.41], [3.86, 50.44], [3.95, 50.46], [4.07, 50.58], [4.24, 50.73], [4.35, 50.85]] },
    'valence-namur-1792': { name: 'French troops march on Namur, which falls on 2 December 1792', offset: 6,
      path: [[3.95, 50.46], [4.25, 50.43], [4.55, 50.45], [4.86, 50.47]] },
    'custine-1792': { name: 'Custine’s advance along the Rhine to Speyer, Worms, Mainz and Frankfurt, autumn 1792',
      path: [[7.95, 49.05], [8.43, 49.32], [8.36, 49.63], [8.27, 50.0], [8.68, 50.11]] },
  },
  markers: {
    'jemappes-brussels': { lnglat: [4.35, 50.85], icon: 'flag', color: 'france', label: 'Brussels', note: 'Dumouriez enters, 14 November' },
    'jemappes-namur': { lnglat: [4.86, 50.47], icon: 'castle', color: 'france', label: 'Namur', note: 'Taken after 11 days, 2 December' },
    'jemappes-mainz': { lnglat: [8.27, 50.0], icon: 'castle', color: 'france', label: 'Mainz', note: 'Taken by Custine, October' },
  },
});
