// Rome and Italy, c. 270 BC: the routes of Pyrrhus's war in Italy and Sicily, 280 to 275 BC.
import { writePlan } from './lib.mjs';

writePlan('pages/010-before/020-italy', {
  // Heraclea and Asculum without notes, so their labels clear Tarentum and Beneventum at this scale
  markers: {
    'italy-heraclea': { lnglat: [16.68, 40.21], icon: 'swords', color: 'macedon', label: 'Heraclea' },
    'italy-asculum': { lnglat: [15.56, 41.21], icon: 'swords', color: 'macedon', label: 'Asculum' },
  },
  show: ['rome-270', 'ariminum-268', 'beneventum-275', 'tarentum-272'],
  routes: {
    'pyrrhus-280': { name: 'Pyrrhus in Italy: Tarentum, Heraclea and Asculum, 280 – 279 BC',
      path: [[17.24, 40.47], [16.65, 40.21], [16.0, 40.65], [15.56, 41.2]] },
    'pyrrhus-278': { name: 'Pyrrhus in Sicily, 278 – 276 BC', offset: 6,
      path: [[16.9, 40.3], [16.3, 38.5], [15.4, 37.6], [15.29, 37.07], [14.0, 37.25], [12.44, 37.8]] },
    'pyrrhus-275': { name: 'Pyrrhus returns to Italy, fights at Beneventum and sails home, 275 BC', style: 'dashed',
      path: [[15.29, 37.07], [15.9, 38.0], [16.25, 38.24], [16.5, 39.5], [15.6, 40.6], [14.78, 41.13], [16.3, 40.8], [17.24, 40.47], [19.0, 40.1]] },
  },
});
