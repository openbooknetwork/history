// After Waterloo, June to October 1815: Napoleon's return to Paris, the allied advance, Grouchy's retreat, and
// Napoleon's road to Rochefort, the passage to England in HMS Bellerophon and the voyage to Saint Helena, which
// leaves the map to the south.
import { writePlan } from './lib.mjs';

writePlan('pages/110-hundred-days/040-second-abdication', {
  routes: {
    'napoleon-return-paris-1815': { name: 'Napoleon returns to Paris, 18 – 21 June 1815',
      path: [[4.41, 50.66], [4.44, 50.41], [4.3, 49.95], [3.62, 49.56], [2.9, 49.15], [2.35, 48.86]] },
    'allies-paris-1815': { name: 'The Prussian and Anglo-allied armies advance on Paris, 19 June – 7 July 1815', offset: 6,
      path: [[4.4, 50.68], [4.0, 50.25], [3.3, 49.7], [2.58, 49.21], [2.36, 48.93]] },
    'grouchy-paris-1815': { name: 'Grouchy retreats from Wavre to Paris, 19 June – 1 July 1815', style: 'dashed',
      path: [[4.6, 50.72], [4.87, 50.47], [4.72, 50.1], [4.37, 49.51], [3.33, 49.38], [2.42, 48.9]] },
    'napoleon-rochefort-1815': { name: 'Napoleon leaves Malmaison for Rochefort, 29 June – 3 July 1815',
      path: [[2.17, 48.87], [1.83, 48.64], [0.69, 47.39], [-0.46, 46.32], [-0.96, 45.94]] },
    'bellerophon-1815': { name: 'HMS Bellerophon takes Napoleon to England, July 1815',
      path: [[-1.17, 46.01], [-2.4, 46.4], [-4.6, 47.6], [-5.4, 48.9], [-4.15, 50.3]] },
    'northumberland-1815': { name: 'HMS Northumberland carries Napoleon to Saint Helena, arriving in October 1815',
      path: [[-4.15, 50.3], [-5.6, 49.2], [-7.2, 46.8], [-8.6, 44.0], [-10.0, 41.5], [-11.5, 37.0], [-14.0, 30.0]] },
  },
  markers: {
    'second-abdication-paris': { lnglat: [2.35, 48.86], icon: 'crown', color: 'france', label: 'Paris', note: 'Abdication, 22 June' },
    'second-abdication-rochefort': { lnglat: [-0.96, 45.94], icon: 'anchor', color: 'britain', label: 'Rochefort', note: 'Surrender to Maitland, 15 July' },
    'second-abdication-waterloo': { lnglat: [4.41, 50.68], icon: 'swords', color: 'britain', label: 'Waterloo', note: '18 June' },
    'second-abdication-st-helena': { lnglat: [-7.2, 46.8], icon: 'ship', color: 'britain', label: 'To Saint Helena', note: 'Jamestown, October 1815' },
  },
});
