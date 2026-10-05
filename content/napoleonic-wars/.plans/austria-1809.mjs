// The Danube campaign of April and May 1809: the Austrian invasion of Bavaria, the battles from Teugen-Hausen to
// Regensburg around the Eckmühl card, Charles's retreat into Bohemia and the French march on Vienna.
import { writePlan } from './lib.mjs';

writePlan('pages/080-fifth-coalition/010-austria-1809', {
  routes: {
    'charles-bavaria-1809': { name: 'Archduke Charles crosses the Inn and advances on Landshut and Regensburg, 10 – 19 April 1809',
      path: [[13.43, 48.46], [13.0, 48.5], [12.6, 48.53], [12.18, 48.56], [12.12, 48.7], [12.05, 48.86]] },
    'davout-1809': { name: 'Davout marches from Regensburg towards the rest of the army, 19 April 1809',
      path: [[12.1, 49.01], [12.04, 48.95], [12.0, 48.88], [11.9, 48.82]] },
    'napoleon-landshut-1809': { name: 'Napoleon from Donauwörth to Abensberg and Landshut, then north to Eckmühl, 17 – 22 April 1809',
      path: [[10.78, 48.72], [11.42, 48.76], [11.86, 48.8], [12.0, 48.68], [12.15, 48.55], [12.2, 48.68], [12.18, 48.82]] },
    'hiller-1809': { name: 'Hiller’s wing escapes over the Isar and falls back to Ebelsberg, 21 April – 3 May 1809', style: 'dashed',
      path: [[12.15, 48.53], [12.5, 48.36], [13.05, 48.25], [13.6, 48.2], [14.03, 48.16], [14.34, 48.25]] },
    'charles-bohemia-1809': { name: 'Charles crosses the Danube at Regensburg and withdraws into Bohemia, 22 – 24 April 1809', style: 'dashed',
      path: [[12.18, 48.84], [12.1, 48.98], [12.25, 49.1], [12.66, 49.22], [13.1, 49.3]] },
    'napoleon-vienna-1809': { name: 'The French march down the Danube to Vienna, 24 April – 13 May 1809',
      path: [[12.6, 48.6], [13.45, 48.55], [14.0, 48.28], [14.34, 48.25], [14.48, 48.21], [15.33, 48.23], [15.62, 48.2], [16.0, 48.22], [16.37, 48.21]] },
  },
  markers: {
    'austria-1809-landshut': { lnglat: [12.15, 48.54], icon: 'swords', color: 'france', label: 'Landshut', note: '21 April' },
    'austria-1809-regensburg': { lnglat: [12.1, 49.02], icon: 'castle', color: 'france', label: 'Regensburg', note: 'Stormed, 23 April' },
    'austria-1809-ebelsberg': { lnglat: [14.34, 48.25], icon: 'swords', color: 'france', label: 'Ebelsberg', note: '3 May' },
    'austria-1809-vienna': { lnglat: [16.37, 48.21], icon: 'flag', color: 'france', label: 'Vienna', note: 'Surrenders on 12 May' },
  },
});
