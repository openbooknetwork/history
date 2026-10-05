// Bussaco and the Lines of Torres Vedras, 1810 to 1811: Masséna's invasion and retreat, Wellington's withdrawal to
// the Lines, and the first and second Lines themselves (Battle of Bussaco, Lines of Torres Vedras, Peninsular War).
import { writePlan } from './lib.mjs';

writePlan('pages/070-peninsula/060-torres-vedras', {
  routes: {
    'lines-first-1810': { name: 'The first Line of Torres Vedras', arrows: false,
      path: [[-9.008, 38.928], [-9.078, 38.984], [-9.15, 39.02], [-9.21, 39.06], [-9.26, 39.09], [-9.33, 39.11], [-9.405, 39.125]] },
    'lines-second-1810': { name: 'The second Line of Torres Vedras', arrows: false,
      path: [[-9.07, 38.86], [-9.12, 38.9], [-9.19, 38.93], [-9.25, 38.93], [-9.33, 38.94], [-9.42, 38.96]] },
    'massena-1810': { name: 'Masséna’s invasion, July to September 1810',
      path: [[-6.53, 40.6], [-6.91, 40.73], [-7.39, 40.64], [-7.91, 40.66], [-8.23, 40.4], [-8.32, 40.36]] },
    'massena-lines-1810': { name: 'Masséna follows to the Lines, October 1810',
      path: [[-8.32, 40.38], [-8.43, 40.47], [-8.45, 40.38], [-8.42, 40.21], [-8.63, 39.92], [-8.81, 39.74], [-8.94, 39.34], [-9.01, 39.07], [-9.13, 39.035]] },
    'wellington-1810': { name: 'Wellington falls back to the Lines, October 1810', style: 'dashed', offset: 6,
      path: [[-8.37, 40.37], [-8.42, 40.21], [-8.63, 39.92], [-8.81, 39.74], [-8.98, 39.55], [-9.12, 39.36], [-9.26, 39.11]] },
    'massena-1811': { name: 'Masséna’s retreat, November 1810 to April 1811', style: 'dashed',
      path: [[-9.13, 39.05], [-9.01, 39.09], [-8.68, 39.24], [-8.63, 39.92], [-8.25, 40.15], [-7.8, 40.45], [-7.39, 40.64], [-7.27, 40.54], [-7.08, 40.35], [-6.53, 40.58]] },
  },
  markers: {
    'torres-vedras-sobral': { lnglat: [-9.15, 39.03], icon: 'swords', color: 'france', label: 'Sobral', note: 'The French halted, 14 October 1810' },
    'torres-vedras-santarem': { lnglat: [-8.68, 39.24], icon: 'flag', color: 'france', label: 'Santarém', note: 'Masséna’s winter quarters' },
    'torres-vedras-fuentes': { lnglat: [-6.82, 40.58], icon: 'swords', color: 'britain', label: 'Fuentes de Oñoro', note: '3 to 5 May 1811' },
  },
});
console.log('torres-vedras: routes and markers');
