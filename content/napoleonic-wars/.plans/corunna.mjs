// Napoleon in Spain and the Corunna campaign, November 1808 to January 1809 (Battle of Corunna, Peninsular War,
// Battle of Somosierra and Battle of Tudela articles).
import { writePlan } from './lib.mjs';

const astorgaToCorunna = [[-6.06, 42.46], [-6.42, 42.62], [-6.6, 42.55], [-6.81, 42.61], [-7.56, 43.01], [-8.21, 43.28], [-8.4, 43.36]];
writePlan('pages/070-peninsula/040-corunna', {
  routes: {
    'napoleon-1808': { name: 'Napoleon’s advance from Bayonne to Madrid, November 1808',
      path: [[-1.47, 43.49], [-1.79, 43.34], [-2.67, 42.85], [-3.7, 42.34], [-3.69, 41.67], [-3.58, 41.13], [-3.7, 40.43]] },
    'moore-1808': { name: 'Moore’s advance to Sahagún, October to December 1808',
      path: [[-9.14, 38.72], [-8.2, 39.46], [-7.27, 40.54], [-6.91, 40.73], [-6.53, 40.6], [-5.66, 40.96], [-5.4, 41.52], [-5.35, 42.17], [-5.03, 42.37]] },
    'napoleon-astorga-1808': { name: 'Napoleon marches to Astorga, December 1808',
      path: [[-3.7, 40.43], [-4.07, 40.71], [-4.41, 40.78], [-5.0, 41.5], [-5.04, 41.88], [-5.68, 42.0], [-6.06, 42.46]] },
    'moore-1809': { name: 'Moore’s retreat to Corunna, December 1808 to January 1809', style: 'dashed',
      path: [[-5.03, 42.37], [-5.35, 42.17], [-5.68, 42.0], ...astorgaToCorunna] },
    'soult-1809': { name: 'Soult’s pursuit to Corunna, December 1808 to January 1809', offset: 6,
      path: [[-4.6, 42.34], [-5.03, 42.37], [-5.42, 42.5], [-5.57, 42.6], ...astorgaToCorunna.map(([x, y], i, a) => i === a.length - 1 ? [x + 0.02, y - 0.05] : [x, y])] },
  },
  markers: {
    'corunna-tudela': { lnglat: [-1.6, 42.06], icon: 'swords', color: 'france', label: 'Tudela', note: 'Lannes defeats Castaños, 23 November' },
    'corunna-somosierra': { lnglat: [-3.58, 41.13], icon: 'swords', color: 'france', label: 'Somosierra', note: 'The pass taken, 30 November' },
    'corunna-astorga': { lnglat: [-6.06, 42.46], icon: 'user', color: 'france', label: 'Astorga', note: 'Napoleon arrives, 1 January 1809' },
  },
});
console.log('corunna: routes and markers');
