// Routes and places for the pages between Zama and the Third Punic War: Hannibal's exile and Masinissa's advance.
import { writePlan } from './lib.mjs';

const E = 'pages/050-after-zama';

writePlan(`${E}/010-hannibal-exile`, {
  routes: {
    'hannibal-195': { name: 'Hannibal’s flight from Carthage by way of Tyre and Antioch to Ephesus, 195 BC',
      path: [[10.32, 36.85], [11.4, 36.1], [15.0, 34.6], [21.0, 33.8], [27.0, 33.5], [32.0, 33.4], [35.2, 33.27], [35.6, 34.6], [36.16, 36.2], [34.6, 36.45], [32.0, 36.2], [29.4, 36.35], [28.0, 36.8], [27.34, 37.94]] },
    'hannibal-189': { name: 'Hannibal’s flight to Crete and on to Bithynia, after 189 BC',
      path: [[27.34, 37.94], [26.5, 37.2], [25.6, 36.2], [25.1, 35.45], [24.95, 35.08], [25.4, 35.5], [25.9, 36.9], [26.0, 38.6], [26.2, 39.9], [26.6, 40.35], [27.6, 40.62], [28.7, 40.72], [29.43, 40.8]] },
  },
  markers: { 'hannibal-exile-gortyn': { lnglat: [24.95, 35.06], icon: 'flag', label: 'Gortyn', note: 'Hannibal’s refuge on Crete' } },
  show: ['carthage-196', 'ephesus-195', 'side-190', 'magnesia-190', 'libyssa-183'],
});

writePlan(`${E}/020-masinissa`, {
  routes: {
    'masinissa-158': { name: 'Masinissa takes the coast of the Emporia as far as Lepcis Magna, by 158 BC',
      path: [[6.61, 36.37], [7.6, 35.6], [8.6, 34.7], [9.6, 34.0], [10.1, 33.88], [11.1, 33.45], [12.4, 32.95], [13.6, 32.75], [14.29, 32.64]] },
    'masinissa-152': { name: 'Masinissa takes the Great Plains, 152 BC', path: [[6.61, 36.37], [7.5, 36.4], [8.4, 36.42], [9.2, 36.6]] },
  },
  markers: { 'masinissa-lepcis': { lnglat: [14.29, 32.64], icon: 'landmark', color: 'numidia', label: 'Lepcis Magna', note: 'Taken by Masinissa by 158 BC' } },
  show: ['cirta-201', 'thugga-150', 'carthage-151', 'rome-153'],
});
console.log('after-zama written');
