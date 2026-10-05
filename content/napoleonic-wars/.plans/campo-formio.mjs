// 1797: Mantua falls, Bonaparte marches on Vienna, the peace of Leoben, the end of Venice and the Treaty of Campo Formio.
import { writePlan } from './lib.mjs';

writePlan('pages/020-first-coalition/100-campo-formio', {
  routes: {
    'bonaparte-vienna-1797': { name: 'Bonaparte drives the Archduke Charles back by Tarvis and Klagenfurt to Leoben, March to April 1797',
      path: [[11.73, 45.77], [12.2, 45.85], [12.87, 46.0], [13.14, 46.28], [13.3, 46.5], [13.58, 46.51], [13.85, 46.61], [14.31, 46.62], [14.66, 47.17], [15.09, 47.38]] },
    'joubert-1797': { name: 'Joubert’s wing advances through Tyrol, March to April 1797',
      path: [[11.12, 46.07], [11.35, 46.5], [11.66, 46.71], [12.0, 46.78], [12.77, 46.83], [13.4, 46.7], [13.85, 46.61]] },
    'bonaparte-papal-1797': { name: 'Bonaparte marches against the Papal States, February 1797',
      path: [[10.79, 45.16], [11.34, 44.49], [11.88, 44.29], [12.57, 43.94], [13.28, 43.21]] },
  },
  markers: {
    'campo-formio-mantua': { lnglat: [10.79, 45.16], icon: 'castle', color: 'france', label: 'Mantua', note: 'Surrenders, 2 February' },
    'campo-formio-tolentino': { lnglat: [13.28, 43.21], icon: 'scroll', label: 'Tolentino', note: 'Terms with the Pope, February' },
    'campo-formio-tarvis': { lnglat: [13.58, 46.51], icon: 'swords', color: 'france', label: 'Tarvis', note: '3,500 Austrians taken, 21 to 23 March' },
    'campo-formio-leoben': { lnglat: [15.09, 47.38], icon: 'scroll', label: 'Leoben', note: 'Preliminary peace, 18 April' },
    'campo-formio-venice': { lnglat: [12.34, 45.44], icon: 'landmark', color: 'austria', label: 'Venice', note: 'The Republic ends, 12 May' },
    'campo-formio-campo-formio': { lnglat: [13.16, 46.02], icon: 'scroll', label: 'Campo Formio', note: 'Treaty, 17 October' },
  },
});
