// The French Revolution, 1789 to 1791: the places of the road to war and the royal family's flight to Varennes.
import { writePlan } from './lib.mjs';

writePlan('pages/010-revolution/010-revolution', {
  routes: {
    'royal-family-1791': { name: 'The royal family flees from Paris and is stopped at Varennes, 20 to 21 June 1791',
      path: [[2.33, 48.86], [2.9, 48.95], [3.4, 48.95], [4.0, 48.95], [4.37, 48.96], [4.9, 49.09], [5.03, 49.23]] },
  },
  markers: {
    'revolution-paris': { lnglat: [2.37, 48.853], icon: 'castle', label: 'Paris', note: 'The Bastille stormed, 14 July 1789' },
    'revolution-varennes': { lnglat: [5.03, 49.23], icon: 'flag', label: 'Varennes', note: 'The king stopped, 21 June 1791' },
    'revolution-pillnitz': { lnglat: [13.87, 51.01], icon: 'scroll', color: 'austria', label: 'Pillnitz', note: 'Declaration, 27 August 1791' },
  },
});
