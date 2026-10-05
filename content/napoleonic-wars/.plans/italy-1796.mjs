// The Army of Italy, March to May 1796: the Montenotte campaign, the armistice of Cherasco, Lodi and Milan.
import { writePlan } from './lib.mjs';

writePlan('pages/020-first-coalition/070-italy-1796', {
  routes: {
    'bonaparte-piedmont-1796': { name: 'Bonaparte strikes between the allies at Montenotte and drives the Sardinians back to Cherasco, April 1796',
      path: [[7.27, 43.7], [7.9, 43.9], [8.48, 44.31], [8.39, 44.4], [8.25, 44.36], [8.03, 44.39], [7.82, 44.39], [7.86, 44.7]] },
    'bonaparte-lodi-1796': { name: 'Bonaparte marches across the Po at Piacenza to Lodi and Milan, May 1796', offset: 6,
      path: [[7.86, 44.7], [8.5, 44.9], [9.0, 45.0], [9.69, 45.05], [9.6, 45.2], [9.5, 45.31], [9.19, 45.46]] },
    'beaulieu-1796': { name: 'Beaulieu’s Austrians retreat from Acqui behind the Po and the Adda, April to May 1796', style: 'dashed',
      path: [[8.47, 44.68], [8.9, 45.1], [9.3, 45.25], [9.5, 45.31], [9.68, 45.36], [10.2, 45.4]] },
  },
  markers: {
    'italy-1796-montenotte': { lnglat: [8.38, 44.41], icon: 'swords', color: 'france', label: 'Montenotte', note: 'Argenteau beaten, 12 April' },
    'italy-1796-mondovi': { lnglat: [7.82, 44.39], icon: 'swords', color: 'france', label: 'Mondovì', note: 'Colli beaten, 21 April' },
    'italy-1796-cherasco': { lnglat: [7.86, 44.65], icon: 'scroll', label: 'Cherasco', note: 'Armistice with Sardinia, 28 April' },
    'italy-1796-milan': { lnglat: [9.19, 45.46], icon: 'flag', color: 'france', label: 'Milan', note: 'Entered by the French, 15 May' },
  },
});
