// Into France, July 1813 to April 1814: Soult's offensive in the Pyrenees, the crossing of the Bidassoa and the
// Nivelle, the advance by Orthez to Toulouse, and Beresford at Bordeaux (Peninsular War, Battle of Toulouse articles).
import { writePlan } from './lib.mjs';

const adourToToulouse = [[-0.77, 43.49], [-0.57, 43.76], [-0.26, 43.7], [0.05, 43.38], [0.08, 43.23], [0.72, 43.11], [1.1, 43.4], [1.44, 43.6]];
writePlan('pages/070-peninsula/090-toulouse', {
  routes: {
    'soult-pyrenees-1813': { name: 'Soult’s offensive at Roncesvalles, July 1813',
      path: [[-1.24, 43.16], [-1.32, 43.01], [-1.47, 42.93], [-1.6, 42.88]] },
    'wellington-bidassoa-1813': { name: 'Wellington crosses into France, autumn 1813',
      path: [[-1.79, 43.33], [-1.72, 43.37], [-1.66, 43.39], [-1.55, 43.45], [-1.49, 43.47]] },
    'wellington-1814': { name: 'Wellington’s advance to Toulouse, 1814',
      path: [[-1.42, 43.46], [-1.1, 43.5], ...adourToToulouse] },
    'soult-1814': { name: 'Soult falls back to Toulouse, 1814', style: 'dashed', offset: 6,
      path: [[-1.4, 43.5], [-1.1, 43.52], ...adourToToulouse.slice(0, -1), [1.42, 43.58]] },
    'beresford-1814': { name: 'Beresford marches to Bordeaux, March 1814',
      path: [[-0.57, 43.76], [-0.5, 43.89], [-0.6, 44.3], [-0.58, 44.82]] },
  },
  markers: {
    'toulouse-sorauren': { lnglat: [-1.62, 42.87], icon: 'swords', color: 'britain', label: 'Sorauren', note: 'Soult repulsed, 28 and 30 July 1813' },
    'toulouse-san-sebastian': { lnglat: [-1.98, 43.32], icon: 'flag', color: 'britain', label: 'San Sebastián', note: 'Stormed, 31 August 1813' },
    'toulouse-orthez': { lnglat: [-0.77, 43.49], icon: 'swords', color: 'britain', label: 'Orthez', note: '27 February 1814' },
    'toulouse-bordeaux': { lnglat: [-0.58, 44.84], icon: 'flag', color: 'britain', label: 'Bordeaux', note: 'Opens its gates, 12 March 1814' },
  },
});
console.log('toulouse: routes and markers');
