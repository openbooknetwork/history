// The campaign of France, January to March 1814: the allied invasion, Napoleon's Six Days against Blücher on the
// Marne, his turn against Schwarzenberg on the Seine, and the March battles at Laon, Reims and Arcis.
import { writePlan } from './lib.mjs';

writePlan('pages/100-sixth-coalition/040-france-1814', {
  routes: {
    'schwarzenberg-1814': { name: 'The Army of Bohemia advances from the upper Rhine to the Aube, January 1814',
      path: [[6.25, 47.62], [5.33, 47.86], [4.7, 48.23], [4.5, 48.33]] },
    'blucher-1814': { name: 'Blücher’s Army of Silesia from the Rhine by Nancy to Brienne, January 1814',
      path: [[6.25, 49.05], [6.18, 48.69], [5.6, 48.65], [4.95, 48.64], [4.6, 48.45]] },
    'blucher-marne-1814': { name: 'Blücher advances along the Marne towards Paris, early February 1814',
      path: [[4.6, 48.4], [4.59, 48.73], [4.05, 48.9], [3.86, 48.88], [3.54, 48.87], [3.13, 48.95]] },
    'napoleon-six-days-1814': { name: 'Napoleon’s Six Days: Champaubert, Montmirail and Château-Thierry, 9 – 12 February 1814',
      path: [[3.5, 48.49], [3.72, 48.72], [3.78, 48.86], [3.56, 48.89], [3.4, 49.03]] },
    'napoleon-vauchamps-1814': { name: 'Napoleon turns back on Blücher at Vauchamps, 13 – 14 February 1814', offset: 6,
      path: [[3.4, 49.03], [3.56, 48.89], [3.62, 48.88], [3.8, 48.9]] },
    'napoleon-seine-1814': { name: 'Napoleon turns south against Schwarzenberg: Mormant and Montereau, 15 – 18 February 1814',
      path: [[3.6, 48.86], [3.3, 48.8], [3.0, 48.7], [2.89, 48.61], [2.96, 48.39]] },
    'napoleon-laon-1814': { name: 'Napoleon follows Blücher north to Craonne and Laon, then retakes Reims, March 1814',
      path: [[3.72, 48.72], [3.4, 49.03], [3.75, 49.3], [3.9, 49.4], [3.79, 49.44], [3.65, 49.53], [3.4, 49.4], [4.03, 49.26]] },
    'napoleon-arcis-1814': { name: 'Napoleon marches south to Arcis-sur-Aube and then east to Saint-Dizier, 17 – 26 March 1814',
      path: [[4.03, 49.26], [3.95, 49.04], [4.1, 48.75], [4.14, 48.54], [4.6, 48.6], [4.95, 48.64]] },
  },
  markers: {
    'france-1814-brienne': { lnglat: [4.52, 48.39], icon: 'swords', color: 'russia', label: 'Brienne and La Rothière', note: '29 January and 1 February' },
    'france-1814-champaubert': { lnglat: [3.78, 48.88], icon: 'swords', color: 'france', label: 'Champaubert', note: '10 February' },
    'france-1814-montereau': { lnglat: [2.96, 48.39], icon: 'swords', color: 'france', label: 'Montereau', note: '18 February' },
    'france-1814-laon': { lnglat: [3.62, 49.56], icon: 'swords', color: 'prussia', label: 'Laon', note: '9 – 10 March, Napoleon defeated' },
    'france-1814-reims': { lnglat: [4.03, 49.26], icon: 'swords', color: 'france', label: 'Reims', note: 'Retaken, 13 March' },
    'france-1814-arcis': { lnglat: [4.14, 48.54], icon: 'swords', color: 'austria', label: 'Arcis-sur-Aube', note: '20 – 21 March' },
  },
});
