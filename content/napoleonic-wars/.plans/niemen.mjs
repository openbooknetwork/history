// The invasion of Russia from the crossing of the Niemen on 24 June 1812 to Napoleon's halt at Vitebsk: the main
// army on Vilnius and Vitebsk, the flanking columns, and the two Russian armies falling back to unite.
import { writePlan } from './lib.mjs';

writePlan('pages/090-russia/010-niemen', {
  routes: {
    'napoleon-vitebsk-1812': { name: 'Napoleon’s main army from Kaunas by Vilnius to Vitebsk, 24 June – 28 July 1812',
      path: [[23.9, 54.9], [24.6, 54.8], [25.28, 54.69], [26.2, 54.9], [27.0, 55.1], [27.69, 55.14], [28.8, 55.2], [30.2, 55.19]] },
    'macdonald-riga-1812': { name: 'Macdonald’s X Corps advances from Tilsit towards Riga, June – July 1812',
      path: [[21.88, 55.08], [22.6, 55.6], [23.3, 55.93], [23.72, 56.4], [24.0, 56.75]] },
    'jerome-1812': { name: 'Jérôme crosses at Grodno and follows Bagration, July 1812',
      path: [[23.83, 53.68], [24.6, 53.5], [25.4, 53.35], [26.2, 53.42]] },
    'davout-minsk-1812': { name: 'Davout from Vilnius by Minsk to Mogilev, 1 – 23 July 1812',
      path: [[25.28, 54.69], [25.95, 54.42], [26.8, 54.15], [27.56, 53.9], [28.5, 53.95], [29.4, 53.9], [30.33, 53.9]] },
    'barclay-1812': { name: 'Barclay’s 1st Western Army falls back by Drissa and Vitebsk to Smolensk, June – August 1812', style: 'dashed',
      path: [[25.28, 54.75], [26.5, 55.2], [27.5, 55.55], [28.0, 55.78], [28.8, 55.5], [29.7, 55.3], [30.25, 55.2], [31.0, 55.0], [32.05, 54.8]] },
    'bagration-1812': { name: 'Bagration’s 2nd Western Army escapes by Mir, Bobruisk and Mogilev to Smolensk, June – August 1812', style: 'dashed',
      path: [[24.47, 53.16], [25.32, 53.09], [26.47, 53.45], [27.6, 53.2], [29.22, 53.14], [30.0, 53.5], [30.4, 53.95], [31.2, 54.4], [32.05, 54.75]] },
  },
  markers: {
    'niemen-kaunas': { lnglat: [23.9, 54.9], icon: 'bridge', color: 'france', label: 'Kaunas', note: '24 June' },
    'niemen-vilnius': { lnglat: [25.28, 54.69], icon: 'flag', color: 'france', label: 'Vilnius', note: '28 June' },
    'niemen-mir': { lnglat: [26.47, 53.45], icon: 'swords', color: 'russia', label: 'Mir', note: '9 – 10 July' },
    'niemen-mogilev': { lnglat: [30.33, 53.9], icon: 'swords', color: 'france', label: 'Mogilev', note: '23 July' },
    'niemen-ostrovno': { lnglat: [29.86, 55.14], icon: 'swords', color: 'france', label: 'Ostrovno', note: '25 July' },
    'niemen-drissa': { lnglat: [28.0, 55.78], icon: 'flag', color: 'russia', label: 'Drissa', note: 'Fortified camp' },
  },
});
