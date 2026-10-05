// Fleurus and the conquest of the Low Countries, June 1794 to January 1795.
import { writePlan } from './lib.mjs';

writePlan('pages/020-first-coalition/050-fleurus', {
  routes: {
    'jourdan-1794': { name: 'Jourdan crosses the Sambre, wins at Fleurus and takes Namur and Liège, June to July 1794',
      path: [[4.38, 50.36], [4.44, 50.41], [4.53, 50.47], [4.86, 50.47], [5.2, 50.53], [5.57, 50.63]] },
    'pichegru-1794': { name: 'Pichegru takes Brussels and Antwerp and in the winter overruns the Dutch Republic, July 1794 to January 1795',
      path: [[3.27, 50.83], [3.72, 50.94], [4.35, 50.85], [4.42, 51.21], [4.78, 51.59], [5.12, 52.09], [4.9, 52.37]] },
    'coburg-1794': { name: 'Coburg retreats to the Meuse and crosses at Maastricht, July 1794', style: 'dashed',
      path: [[4.5, 50.52], [4.4, 50.68], [4.7, 50.88], [5.2, 50.85], [5.69, 50.85], [6.0, 50.85]] },
  },
  markers: {
    'fleurus-brussels': { lnglat: [4.35, 50.85], icon: 'flag', color: 'france', label: 'Brussels', note: 'Pichegru enters, 11 July' },
    'fleurus-antwerp': { lnglat: [4.42, 51.21], icon: 'flag', color: 'france', label: 'Antwerp', note: 'Taken, 27 July' },
    'fleurus-maastricht': { lnglat: [5.69, 50.85], icon: 'flag', color: 'austria', label: 'Maastricht', note: 'Coburg crosses the Meuse, 24 July' },
    'fleurus-amsterdam': { lnglat: [4.9, 52.37], icon: 'flag', color: 'client', label: 'Amsterdam', note: 'Batavian Revolution, 18 January 1795' },
  },
});
