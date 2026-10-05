// France and Britain, May 1803 to August 1805: the invasion camps on the Channel, the coronation, the crown of Italy.
import { writePlan } from './lib.mjs';

writePlan('pages/050-third-coalition/010-empire', {
  markers: {
    'empire-boulogne': { lnglat: [1.61, 50.73], icon: 'flag', color: 'france', label: 'Boulogne', note: 'Camps of the Army of England' },
    'empire-paris': { lnglat: [2.35, 48.85], icon: 'crown', color: 'france', label: 'Paris', note: 'Coronation, 2 December 1804' },
    'empire-milan': { lnglat: [9.19, 45.46], icon: 'crown', color: 'client', label: 'Milan', note: 'Crowned King of Italy, 1805' },
  },
});
console.log('empire: markers');
