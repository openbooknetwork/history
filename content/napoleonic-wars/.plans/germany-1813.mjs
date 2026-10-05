// The spring campaign of 1813: Napoleon's advance over the Saale to Lützen, the allied retreat over the Elbe to
// Bautzen, and their withdrawal into Silesia before the armistice.
import { writePlan } from './lib.mjs';

writePlan('pages/100-sixth-coalition/010-germany-1813', {
  routes: {
    'napoleon-lutzen-1813': { name: 'Napoleon’s advance from Erfurt over the Saale to Lützen, 25 April – 2 May 1813',
      path: [[11.03, 50.98], [11.33, 50.98], [11.62, 51.07], [11.81, 51.15], [11.97, 51.2], [12.1, 51.24]] },
    'allies-lutzen-1813': { name: 'Wittgenstein and Blücher march against the French right flank, late April 1813',
      path: [[13.74, 51.05], [13.2, 51.04], [12.8, 51.03], [12.44, 50.99], [12.25, 51.15], [12.2, 51.2]] },
    'allies-bautzen-1813': { name: 'The allies retreat over the Elbe to Bautzen, May 1813', style: 'dashed',
      path: [[12.2, 51.2], [12.5, 51.12], [12.95, 51.12], [13.4, 51.1], [13.74, 51.06], [14.18, 51.13], [14.45, 51.19]] },
    'napoleon-bautzen-1813': { name: 'Napoleon follows through Dresden, 8 – 20 May 1813', offset: 6,
      path: [[12.14, 51.26], [12.5, 51.15], [12.95, 51.15], [13.4, 51.13], [13.74, 51.08], [14.18, 51.15], [14.38, 51.18]] },
    'ney-bautzen-1813': { name: 'Ney crosses the Elbe at Torgau and comes in on the allied right at Bautzen, May 1813',
      path: [[12.37, 51.34], [12.7, 51.45], [13.0, 51.56], [13.6, 51.5], [14.24, 51.44], [14.5, 51.26]] },
    'allies-silesia-1813': { name: 'The allies withdraw into Silesia, 22 May – 4 June 1813', style: 'dashed',
      path: [[14.5, 51.19], [14.99, 51.15], [15.5, 51.2], [15.94, 51.27], [16.19, 51.05], [16.49, 50.84]] },
  },
  markers: {
    'germany-1813-magdeburg': { lnglat: [11.63, 52.13], icon: 'castle', color: 'france', label: 'Magdeburg', note: 'Eugène holds the lower Elbe' },
    'germany-1813-erfurt': { lnglat: [11.03, 50.98], icon: 'flag', color: 'france', label: 'Erfurt', note: 'Napoleon takes command, 25 April' },
    'germany-1813-dresden': { lnglat: [13.74, 51.05], icon: 'castle', label: 'Dresden', note: 'Elbe bridge blown, May 1813' },
    'germany-1813-bautzen': { lnglat: [14.43, 51.18], icon: 'swords', color: 'france', label: 'Bautzen', note: '20 – 21 May, French victory' },
  },
});
