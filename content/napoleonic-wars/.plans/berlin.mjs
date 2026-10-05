// The pursuit after Jena and Auerstedt, 15 October to 7 November 1806, and the entry into Berlin (Battle of Halle,
// Battle of Prenzlau and Battle of Lübeck articles).
import { writePlan } from './lib.mjs';

writePlan('pages/060-fourth-coalition/030-berlin', {
  bbox: [9.2, 50.3, 15.0, 54.2],
  routes: {
    'davout-berlin-1806': { name: 'Davout’s III Corps marches by Leipzig and Wittenberg to Berlin, 15 – 25 October 1806',
      path: [[11.81, 51.155], [12.37, 51.34], [12.65, 51.87], [13.1, 52.25], [13.4, 52.52]] },
    'hohenlohe-1806': { name: 'Hohenlohe retreats by the Harz and Magdeburg towards the Oder, 15 – 28 October 1806', style: 'dashed',
      path: [[11.33, 50.98], [10.79, 51.5], [11.15, 51.79], [11.63, 52.13], [12.34, 52.6], [12.8, 52.93], [13.61, 53.27], [13.86, 53.32]] },
    'murat-prenzlau-1806': { name: 'Murat heads Hohenlohe off at Prenzlau, 26 – 28 October 1806',
      path: [[13.4, 52.52], [13.24, 52.75], [13.4, 53.05], [13.6, 53.2], [13.86, 53.32]] },
    'blucher-lubeck-1806': { name: 'Blücher turns west and is driven into Lübeck, October to 7 November 1806', style: 'dashed',
      path: [[13.14, 53.18], [12.68, 53.52], [11.95, 53.6], [11.41, 53.63], [10.69, 53.87], [10.75, 53.97]] },
    'bernadotte-lubeck-1806': { name: 'Bernadotte, Soult and Murat pursue Blücher to Lübeck, November 1806', offset: 6,
      path: [[12.8, 52.93], [13.14, 53.18], [12.68, 53.52], [11.95, 53.6], [11.41, 53.63], [10.69, 53.87]] },
  },
  markers: {
    'berlin-erfurt': { lnglat: [11.03, 50.98], icon: 'flag', color: 'prussia', label: 'Erfurt', note: 'Over 10,000 surrender, 16 October' },
    'berlin-halle': { lnglat: [11.97, 51.48], icon: 'swords', color: 'france', label: 'Halle', note: 'Bernadotte, 17 October' },
    'berlin-magdeburg': { lnglat: [11.63, 52.13], icon: 'castle', color: 'prussia', label: 'Magdeburg', note: 'Falls to Ney in November' },
    'berlin-berlin': { lnglat: [13.4, 52.52], icon: 'crown', color: 'france', label: 'Berlin', note: 'Napoleon enters, 27 October' },
    'berlin-prenzlau': { lnglat: [13.86, 53.32], icon: 'flag', color: 'prussia', label: 'Prenzlau', note: 'Hohenlohe surrenders, 28 October' },
    'berlin-lubeck': { lnglat: [10.69, 53.87], icon: 'swords', color: 'france', label: 'Lübeck', note: '6 November' },
  },
});
console.log('berlin: routes and markers');
