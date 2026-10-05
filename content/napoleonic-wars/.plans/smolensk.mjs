// The Smolensk manoeuvre and battle, August 1812: the crossing of the Dnieper at Rosasna, Krasnoi, the march on
// Smolensk along the south bank, the Russian armies hurrying back and their retreat on the Moscow road.
import { writePlan } from './lib.mjs';

writePlan('pages/090-russia/020-smolensk', {
  routes: {
    'napoleon-smolensk-1812': { name: 'The Grande Armée crosses the Dnieper at Rosasna and marches on Smolensk, 14 – 16 August 1812',
      path: [[30.75, 54.72], [31.0, 54.6], [31.2, 54.58], [31.43, 54.57], [31.7, 54.66], [31.95, 54.75], [32.03, 54.765]] },
    'neverovsky-1812': { name: 'Neverovsky’s division falls back from Krasnoi into Smolensk, 14 August 1812', style: 'dashed', offset: 6,
      path: [[31.43, 54.57], [31.7, 54.67], [31.95, 54.76], [32.03, 54.775]] },
    'barclay-smolensk-1812': { name: 'Barclay and Bagration hurry back to Smolensk, 15 – 16 August 1812',
      path: [[31.15, 54.95], [31.5, 54.9], [31.8, 54.85], [32.05, 54.8]] },
    'russians-moscow-road-1812': { name: 'The Russian armies leave Smolensk on the Moscow road, 18 – 19 August 1812', style: 'dashed',
      path: [[32.06, 54.79], [32.24, 54.82], [32.5, 54.85], [32.8, 54.88], [33.1, 54.9]] },
  },
  markers: {
    'smolensk-rosasna': { lnglat: [31.0, 54.6], icon: 'bridge', color: 'france', label: 'Rosasna', note: 'Four bridges, 14 August' },
    'smolensk-krasnoi': { lnglat: [31.43, 54.56], icon: 'swords', color: 'france', label: 'Krasnoi', note: '14 August' },
  },
});
