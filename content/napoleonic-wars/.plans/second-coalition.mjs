// The War of the Second Coalition in 1798 and 1799: Naples, Suvorov in Italy and over the Alps, North Holland.
import { writePlan } from './lib.mjs';

writePlan('pages/040-second-coalition/010-second-coalition', {
  routes: {
    'mack-1798': { name: 'Mack’s Neapolitan army marches on Rome, November 1798',
      path: [[14.25, 40.85], [13.8, 41.3], [13.2, 41.6], [12.5, 41.9]] },
    'championnet-1799': { name: 'Championnet drives the Neapolitans back and takes Naples, December 1798 to January 1799', offset: 6,
      path: [[12.5, 41.9], [13.2, 41.6], [13.8, 41.3], [14.25, 40.85]] },
    'suvorov-1799': { name: 'Suvorov’s advance from Verona by the Adda and Milan to Turin, April and May 1799',
      path: [[10.99, 45.44], [10.22, 45.54], [9.52, 45.53], [9.19, 45.46], [8.62, 45.32], [7.69, 45.07]] },
    'suvorov-alps-1799': { name: 'Suvorov crosses the St Gotthard and the mountains to Chur, September and October 1799',
      path: [[8.62, 44.91], [8.85, 45.6], [9.02, 46.19], [8.57, 46.56], [8.64, 46.88], [8.76, 46.98], [9.07, 47.04], [9.15, 46.85], [9.53, 46.85]] },
    'york-1799': { name: 'The Anglo-Russian landing in North Holland, August to November 1799',
      path: [[3.4, 53.0], [4.3, 52.9], [4.7, 52.84], [4.75, 52.63]] },
  },
  markers: {
    'second-coalition-trebbia': { lnglat: [9.6, 45.05], icon: 'swords', color: 'russia', label: 'Trebbia', note: 'Suvorov beats Macdonald, June' },
    'second-coalition-novi': { lnglat: [8.79, 44.76], icon: 'skull', color: 'france', label: 'Novi', note: 'Joubert killed, 15 August' },
    'second-coalition-castricum': { lnglat: [4.62, 52.55], icon: 'swords', color: 'france', label: 'Castricum', note: 'Anglo-Russian defeat, 6 October' },
    'second-coalition-naples': { lnglat: [14.25, 40.85], icon: 'flag', color: 'france', label: 'Naples', note: 'Taken by the French, January 1799' },
  },
});
