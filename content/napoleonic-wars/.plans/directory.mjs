// 1795: the peace of Basel, Quiberon, the Rhine campaign and 13 Vendémiaire.
import { writePlan } from './lib.mjs';

writePlan('pages/020-first-coalition/060-directory', {
  markers: {
    'directory-basel': { lnglat: [7.59, 47.56], icon: 'scroll', label: 'Basel', note: 'Peace with Prussia and Spain' },
    'directory-quiberon': { lnglat: [-3.12, 47.48], icon: 'swords', color: 'france', label: 'Quiberon', note: 'Émigré landing defeated, July' },
    'directory-dusseldorf': { lnglat: [6.78, 51.23], icon: 'flag', color: 'france', label: 'Düsseldorf', note: 'Jourdan crosses the Rhine, August' },
    'directory-mannheim': { lnglat: [8.47, 49.49], icon: 'castle', color: 'austria', label: 'Mannheim', note: 'Taken by Pichegru, retaken in November' },
    'directory-paris': { lnglat: [2.33, 48.865], icon: 'flame', color: 'france', label: 'Paris', note: '13 Vendémiaire, 5 October' },
  },
});
