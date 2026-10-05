// The autumn campaign of 1813 to Dennewitz: Schwarzenberg's attack on Dresden from Bohemia, Napoleon's march
// back from Silesia, the allied retreat and Vandamme's advance to Kulm, with the marshals' defeats as markers.
import { writePlan } from './lib.mjs';

writePlan('pages/100-sixth-coalition/020-dresden', {
  routes: {
    'schwarzenberg-dresden-1813': { name: 'The Army of Bohemia crosses the Ore Mountains to Dresden, 22 – 26 August 1813',
      path: [[13.98, 50.42], [13.83, 50.6], [13.77, 50.76], [13.74, 50.9], [13.73, 51.01]] },
    'napoleon-dresden-1813': { name: 'Napoleon hurries back from Silesia to Dresden, 23 – 26 August 1813',
      path: [[15.59, 51.11], [14.99, 51.15], [14.43, 51.18], [14.05, 51.1], [13.76, 51.07]] },
    'schwarzenberg-bohemia-1813': { name: 'The allies retreat into Bohemia, 28 – 30 August 1813', style: 'dashed', offset: 6,
      path: [[13.73, 51.01], [13.74, 50.9], [13.77, 50.76], [13.83, 50.64]] },
    'vandamme-1813': { name: 'Vandamme crosses the mountains from Pirna and is surrounded at Kulm, 26 – 30 August 1813',
      path: [[13.94, 50.96], [13.98, 50.86], [13.96, 50.77], [13.94, 50.71]] },
    'oudinot-1813': { name: 'Oudinot marches on Berlin and is turned back at Grossbeeren, August 1813',
      path: [[13.76, 51.84], [13.5, 52.0], [13.3, 52.18], [13.31, 52.32]] },
  },
  markers: {
    'dresden-grossbeeren': { lnglat: [13.31, 52.34], icon: 'swords', color: 'prussia', label: 'Grossbeeren', note: '23 August, Oudinot defeated' },
    'dresden-dennewitz': { lnglat: [13.0, 51.97], icon: 'swords', color: 'prussia', label: 'Dennewitz', note: '6 September, Ney defeated' },
    'dresden-katzbach': { lnglat: [16.1, 51.1], icon: 'swords', color: 'prussia', label: 'Katzbach', note: '26 August, Macdonald defeated' },
    'dresden-kulm': { lnglat: [13.94, 50.7], icon: 'swords', color: 'russia', label: 'Kulm', note: '29 – 30 August, Vandamme surrenders' },
  },
});
