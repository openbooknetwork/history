// Vimeiro and Cintra, August 1808: Wellesley's landing at Mondego Bay and march on Lisbon, Roliça, Junot's march
// from Lisbon, and the evacuation by sea (Battle of Roliça, Battle of Vimeiro, Convention of Sintra articles).
import { writePlan } from './lib.mjs';

writePlan('pages/070-peninsula/030-vimeiro', {
  routes: {
    'wellesley-1808': { name: 'Wellesley’s march from Mondego Bay, August 1808',
      path: [[-8.86, 40.13], [-8.81, 39.74], [-8.98, 39.55], [-9.16, 39.36], [-9.18, 39.31], [-9.25, 39.24], [-9.316, 39.18]] },
    'delaborde-1808': { name: 'Delaborde withdraws from Roliça, 17 August 1808', style: 'dashed',
      path: [[-9.18, 39.3], [-9.23, 39.2], [-9.26, 39.09], [-9.19, 38.93]] },
    'junot-vimeiro-1808': { name: 'Junot marches from Lisbon to Vimeiro, August 1808', offset: 6,
      path: [[-9.14, 38.72], [-9.19, 38.93], [-9.26, 39.09], [-9.3, 39.16]] },
    'junot-rochefort-1808': { name: 'Junot’s army shipped to Rochefort, autumn 1808', style: 'dashed',
      path: [[-9.14, 38.7], [-9.4, 38.67], [-9.65, 38.9], [-9.75, 39.6], [-9.7, 40.4]] },
  },
  markers: {
    'vimeiro-mondego': { lnglat: [-8.86, 40.13], icon: 'anchor', color: 'britain', label: 'Mondego Bay', note: 'Wellesley lands, 1 to 8 August' },
    'vimeiro-rolica': { lnglat: [-9.18, 39.31], icon: 'swords', color: 'britain', label: 'Roliça', note: 'Delaborde driven off, 17 August' },
    'vimeiro-cintra': { lnglat: [-9.258, 38.75], icon: 'scroll-text', color: 'britain', label: 'Convention of Cintra', note: 'Signed at Queluz, 30 August' },
  },
});
console.log('vimeiro: routes and markers');
