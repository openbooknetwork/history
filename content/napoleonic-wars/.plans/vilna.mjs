// The end of the retreat, December 1812: from the Berezina to the Niemen, Napoleon's departure, Macdonald's retreat
// from Riga and Yorck's convention at Tauroggen, and Schwarzenberg's withdrawal.
import { writePlan } from './lib.mjs';

writePlan('pages/090-russia/060-vilna', {
  routes: {
    'grande-armee-niemen-1812': { name: 'The remnants of the Grande Armée retreat from the Berezina to the Niemen, 30 November – 14 December 1812', style: 'dashed',
      path: [[28.36, 54.33], [28.21, 54.37], [27.4, 54.35], [26.85, 54.31], [26.4, 54.48], [25.94, 54.42], [25.28, 54.69], [24.6, 54.8], [23.9, 54.9], [23.5, 54.95]] },
    'napoleon-paris-1812': { name: 'Napoleon leaves the army at Smorgon and travels to Paris by sledge, December 1812', offset: 6,
      path: [[26.4, 54.48], [25.28, 54.69], [23.9, 54.9], [22.5, 54.0], [21.01, 52.23], [19.0, 52.0]] },
    'macdonald-1812': { name: 'Macdonald withdraws from Riga, 18 – 30 December 1812', style: 'dashed',
      path: [[24.0, 56.8], [23.4, 56.3], [22.8, 55.7], [22.29, 55.25], [21.88, 55.08], [20.51, 54.71]] },
    'schwarzenberg-1812': { name: 'Schwarzenberg’s Austrians withdraw into the Duchy of Warsaw, December 1812', style: 'dashed',
      path: [[25.32, 53.09], [24.4, 53.1], [23.16, 53.13], [22.1, 52.9], [21.08, 52.7]] },
  },
  markers: {
    'vilna-smorgon': { lnglat: [26.4, 54.48], icon: 'user', color: 'france', label: 'Smorgon', note: 'Napoleon leaves, 5 December' },
    'vilna-kaunas': { lnglat: [23.9, 54.9], icon: 'flag', color: 'france', label: 'Kaunas', note: '14 December' },
    'vilna-tauroggen': { lnglat: [22.29, 55.25], icon: 'scroll', color: 'prussia', label: 'Tauroggen', note: 'Convention, 30 December' },
  },
});
