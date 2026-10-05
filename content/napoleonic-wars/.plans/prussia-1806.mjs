// Prussia, August to 10 October 1806: the three French columns through the Franconian Forest, Tauentzien's retreat
// from Hof by Schleiz, and the places where the Prussian armies gather (Battle of Schleiz and Battle of Saalfeld articles).
import { writePlan } from './lib.mjs';

writePlan('pages/060-fourth-coalition/010-prussia-1806', {
  bbox: [9.9, 49.75, 13.3, 51.45],
  routes: {
    'soult-hof-1806': { name: 'The right column, Soult and Ney: Bayreuth to Hof and Plauen, 8 – 10 October 1806',
      path: [[11.58, 49.95], [11.79, 50.19], [11.92, 50.31], [12.14, 50.5]] },
    'bernadotte-schleiz-1806': { name: 'The centre column, Bernadotte, Davout, Murat and the Guard: Kronach to Schleiz, 8 – 9 October 1806',
      path: [[11.33, 50.24], [11.5, 50.36], [11.64, 50.45], [11.73, 50.51], [11.81, 50.58]] },
    'lannes-saalfeld-1806': { name: 'The left column, Lannes and Augereau: Coburg to Saalfeld, 8 – 10 October 1806',
      path: [[10.96, 50.26], [11.12, 50.4], [11.31, 50.53], [11.36, 50.645]] },
    'tauentzien-schleiz-1806': { name: 'Tauentzien falls back from Hof by Schleiz to Auma, 8 – 9 October 1806', style: 'dashed', offset: 6,
      path: [[11.92, 50.31], [11.85, 50.43], [11.81, 50.58], [11.89, 50.69]] },
  },
  markers: {
    'prussia-1806-schleiz': { lnglat: [11.81, 50.58], icon: 'swords', color: 'france', label: 'Schleiz', note: '9 October' },
    'prussia-1806-erfurt': { lnglat: [11.03, 50.98], icon: 'flag', color: 'prussia', label: 'Erfurt', note: 'Brunswick’s main army' },
    'prussia-1806-gotha': { lnglat: [10.7, 50.95], icon: 'flag', color: 'prussia', label: 'Gotha', note: 'Rüchel' },
  },
});
console.log('prussia-1806: routes and markers');
