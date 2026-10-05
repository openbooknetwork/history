// Europe after Austerlitz, December 1805 to August 1806: the Peace of Pressburg, the conquest of Naples, the new
// kingdoms and the Confederation of the Rhine.
import { writePlan } from './lib.mjs';

writePlan('pages/050-third-coalition/050-pressburg', {
  routes: {
    'massena-naples-1806': { name: 'Masséna invades the Kingdom of Naples, February 1806',
      path: [[12.5, 41.9], [13.25, 41.45], [14.21, 41.11], [14.25, 40.87]] },
    'ferdinand-1806': { name: 'King Ferdinand IV flees to Sicily, February 1806', style: 'dashed',
      path: [[14.25, 40.83], [14.0, 40.0], [13.6, 38.9], [13.36, 38.13]] },
    'reynier-1806': { name: 'Reynier’s corps marches into Calabria, March 1806',
      path: [[14.3, 40.85], [15.2, 40.45], [15.8, 40.05], [16.06, 39.87], [16.25, 39.3], [16.1, 38.7], [15.65, 38.11]] },
    'russians-1805': { name: 'The Russian army marches home after Austerlitz, December 1805', style: 'dashed',
      path: [[16.88, 49.15], [17.25, 49.59], [18.6, 49.75], [19.95, 50.06]] },
  },
  markers: {
    'pressburg-pressburg': { lnglat: [17.11, 48.14], icon: 'landmark', color: 'austria', label: 'Pressburg', note: 'Peace signed, 26 December 1805' },
    'pressburg-paris': { lnglat: [2.35, 48.85], icon: 'landmark', color: 'france', label: 'Paris', note: 'Confederation of the Rhine, 12 July 1806' },
    'pressburg-the-hague': { lnglat: [4.3, 52.08], icon: 'crown', color: 'client', label: 'The Hague', note: 'Louis King of Holland, 5 June 1806' },
    'pressburg-naples': { lnglat: [14.25, 40.85], icon: 'crown', color: 'client', label: 'Naples', note: 'Joseph made king, March 1806' },
  },
});
console.log('pressburg: routes and markers');
