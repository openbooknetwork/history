// The war of 1792: the first defeat at Lille, Brunswick's army at Koblenz, the storming of the Tuileries.
import { writePlan } from './lib.mjs';

writePlan('pages/010-revolution/020-war-of-1792', {
  markers: {
    'war-1792-paris': { lnglat: [2.333, 48.862], icon: 'castle', label: 'Paris', note: 'Tuileries stormed, 10 August 1792' },
    'war-1792-lille': { lnglat: [3.06, 50.63], icon: 'skull', color: 'france', label: 'Lille', note: 'Dillon killed by his men, 28 April' },
    'war-1792-koblenz': { lnglat: [7.59, 50.36], icon: 'flag', color: 'prussia', label: 'Koblenz', note: 'Brunswick’s army gathers, July' },
    'war-1792-marseille': { lnglat: [5.37, 43.3], icon: 'flag', color: 'france', label: 'Marseille', note: 'Fédérés march to Paris' },
  },
});
