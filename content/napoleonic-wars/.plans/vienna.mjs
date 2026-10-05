// The epilogue: the Congress of Vienna and the Second Treaty of Paris, as two markers over the map of Europe.
import { writePlan } from './lib.mjs';

writePlan('pages/120-epilogue/010-vienna', {
  markers: {
    'vienna-congress': { lnglat: [16.37, 48.21], icon: 'landmark', label: 'Vienna', note: 'Congress, September 1814 – June 1815' },
    'vienna-paris': { lnglat: [2.35, 48.86], icon: 'scroll-text', label: 'Paris', note: 'Second Treaty of Paris, 20 November 1815' },
  },
});
