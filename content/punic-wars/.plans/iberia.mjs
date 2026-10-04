// The Barcids in Iberia, 237 to 220 BC: Hamilcar's crossing to Gades, his conquests up the Baetis to the east
// coast, and Hannibal's campaigns on the Meseta. Only routes and markers; the page has no battle.
import { writePlan } from './lib.mjs';

writePlan('pages/030-interwar/030-iberia', {
  routes: {
    'hamilcar-237': { name: 'Hamilcar marches west along the African coast and crosses to Gades, 237 BC',
      path: [[10.32, 36.85], [8.6, 36.88], [6.0, 36.85], [3.0, 36.6], [0.0, 35.8], [-3.0, 35.2], [-5.3, 35.8], [-5.65, 36.12], [-6.29, 36.53]] },
    'hamilcar-236': { name: 'Hamilcar’s conquests up the Baetis to the east coast, 237 – 228 BC',
      path: [[-6.29, 36.53], [-5.95, 37.38], [-4.78, 37.88], [-3.79, 38.09], [-2.6, 38.25], [-1.4, 38.3], [-0.48, 38.35]] },
    'hannibal-221': { name: 'Hannibal’s campaigns against the Olcades and the Vaccaei, 221 – 220 BC', style: 'dashed',
      path: [[-0.98, 37.6], [-1.8, 38.6], [-2.2, 39.6], [-3.2, 40.25], [-4.6, 40.7], [-5.66, 40.96], [-5.4, 41.5], [-4.6, 40.75], [-3.9, 39.95], [-2.8, 39.1], [-1.4, 38.0], [-0.98, 37.62]] },
  },
  markers: {
    'iberia-helmantice': { lnglat: [-5.66, 40.96], icon: 'castle', color: 'carthage', label: 'Helmantice', note: 'Stormed by Hannibal, 220 BC' },
    'iberia-tagus': { lnglat: [-3.9, 39.95], icon: 'swords', color: 'carthage', label: 'Tagus', note: 'Hannibal defeats the Carpetani, 220 BC' },
  },
  show: ['gades-237', 'sierra-morena-237', 'akra-leuke-235', 'new-carthage-227', 'ebro-226'],
});
console.log('iberia written');
