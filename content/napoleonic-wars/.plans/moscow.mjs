// Moscow and the start of the retreat, September to November 1812: Kutuzov's march round Moscow to Tarutino,
// Napoleon's move towards Kaluga and Maloyaroslavets, and the retreat on the old road to Smolensk.
import { writePlan } from './lib.mjs';

writePlan('pages/090-russia/040-moscow', {
  routes: {
    'napoleon-moscow-1812': { name: 'The Grande Armée from Borodino to Moscow, 8 – 14 September 1812',
      path: [[35.82, 55.52], [36.03, 55.5], [36.5, 55.6], [37.0, 55.67], [37.6, 55.75]] },
    'kutuzov-tarutino-1812': { name: 'Kutuzov leaves Moscow by the Ryazan road and turns west to Tarutino, 14 September – 3 October 1812',
      path: [[37.62, 55.74], [37.9, 55.65], [38.0, 55.5], [37.6, 55.42], [37.3, 55.3], [37.0, 55.18]] },
    'napoleon-kaluga-1812': { name: 'Napoleon leaves Moscow towards Kaluga, 19 – 24 October 1812',
      path: [[37.6, 55.74], [37.3, 55.55], [36.9, 55.38], [36.49, 55.21], [36.47, 55.02]] },
    'napoleon-retreat-1812': { name: 'The Grande Armée retreats by Mozhaysk and Vyazma to Smolensk, 26 October – 9 November 1812', style: 'dashed',
      path: [[36.47, 55.02], [36.49, 55.21], [36.18, 55.34], [36.03, 55.5], [35.0, 55.55], [34.3, 55.21], [33.29, 54.91], [32.6, 54.83], [32.05, 54.78]] },
    'kutuzov-pursuit-1812': { name: 'Kutuzov follows on the roads to the south, November 1812', style: 'dashed',
      path: [[36.45, 54.95], [35.86, 54.97], [35.0, 54.85], [34.0, 54.7], [33.18, 54.58], [32.2, 54.5], [31.6, 54.5]] },
  },
  markers: {
    'moscow-moscow': { lnglat: [37.62, 55.75], icon: 'flame', color: 'france', label: 'Moscow', note: 'Burns, 14 – 18 September' },
    'moscow-vyazma': { lnglat: [34.3, 55.21], icon: 'swords', color: 'russia', label: 'Vyazma', note: '3 November' },
    'moscow-smolensk': { lnglat: [32.05, 54.78], icon: 'snowflake', color: 'france', label: 'Smolensk', note: '40,000 to 50,000 arrive, 9 November' },
  },
});
