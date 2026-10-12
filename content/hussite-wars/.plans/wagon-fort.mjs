// The wagon fort page: markers at the battles of the story where the wagon fort fought, and a plan of a wagon fort
// drawn far larger than life in an empty corner of the map, over the Bavarian Forest, so its parts can be pointed at.
// The plan follows the description in Žižka's ordinance and the modern accounts: wagons chained in a ring, a ditch
// in front, handguns and crossbows at the wagons, light guns at the corners, pavises in the gaps, the foot and the
// few horsemen inside for the counterattack.
// Frame: origin at the centre of the plan, x east and y north in metres.
import { frame, writePlan } from './lib.mjs';

// K scales the whole plan
const K = 1.6, f = frame([13.35, 48.98], 90), P = (x, y) => f.p(K * x, -K * y);
const G = 'pages/030-plzen-tabor/040-wagon-fort';
const mark = (lnglat, label, note, color = 'taborites', icon = 'shield') => ({ lnglat, icon, color, label, note });
const ring = (a, b, n = 64) => [...Array(n + 1)].map((_, k) => P(a * Math.cos(2 * Math.PI * k / n), b * Math.sin(2 * Math.PI * k / n)));
const unit = (side, type, x, y, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(x, y), width: K * width, depth: K * depth, facing, id, name, ...extra });

writePlan(G, {
  bbox: [12.55, 48.5, 15.75, 50.85],
  emblem: {
    works: [{ side: 'taborites', path: ring(21500, 13300), width: 800, style: 'trench', id: 'ditch', name: 'Plan: the ditch that the camp followers dig in front of the wagons' }],
    units: [
      unit('taborites', 'wagon-fort', 0, 0, 38000, 23000, 0, 'fort', 'Plan of a wagon fort, drawn far larger than life: war wagons chained wheel to wheel in a ring, their boards outwards. The field armies close forts of up to some 180 wagons, about 1.1 km round', { count: 24, gaps: [{ bearing: 90, wagons: 2 }] }),
      unit('taborites', 'handguns', 0, 8200, 15000, 2200, 0, 'handguns', 'Plan: handgunners and crossbowmen at the wagons, shooting through the gaps and aiming first at the horses'),
      unit('taborites', 'artillery', -15500, 0, 2600, 5000, 270, 'guns', 'Plan: light guns, the houfnice, placed where the attack is expected'),
      unit('taborites', 'pavises', 18200, 0, 2800, 1600, 90, 'pavises', 'Plan: pavise bearers hold a gap that opens for the sally'),
      unit('taborites', 'infantry', 12500, 0, 2800, 3200, 90, 'flails', 'Plan: men with flails, halberds and spears, ready to go out through the gap'),
      unit('taborites', 'cavalry', 0, -3000, 7000, 2600, 0, 'horse', 'Plan: the few Hussite horsemen wait inside the ring for the pursuit'),
      unit('empire', 'knights', 0, 24000, 16000, 4000, 180, 'knights', 'Plan: knights charge the ring and are stopped at the wagons and the ditch'),
    ],
    arrows: [
      { side: 'empire', path: [P(0, 21500), P(0, 15000)], width: 2600, id: 'charge', name: 'Plan: the charge breaks on the chained wagons' },
      { side: 'taborites', path: [P(0, 9500), P(0, 19000)], width: 2100, style: 'fire', id: 'fire', name: 'Plan: handguns, crossbows and guns fire into the horses at close range' },
      { side: 'taborites', path: [P(19500, 1500), P(22000, 12000), P(12000, 22500)], width: 2600, id: 'sally', name: 'Plan: when the attack is spent, the foot and the horsemen go out through the gaps against the enemy’s flank' },
    ],
    clashes: [{ at: P(0, 13500), size: 4000 }],
  },
  markers: {
    'wagons-plan-1423': mark(P(-24000, -17500), 'A wagon fort in plan', 'Drawn far larger than life', 'taborites', 'lightbulb'),
    'wagons-nekmir-1419': mark([13.2633, 49.8581], 'Nekmíř, 1419', 'Seven wagons hold off 2,000'),
    'wagons-sudomer-1420': mark([14.0676, 49.2432], 'Sudoměř, 1420', 'Twelve wagons on a dike'),
    'wagons-kutna-hora-1421': mark([15.2683, 49.9481], 'Kutná Hora, 1421', 'The fort fires on the move'),
    'wagons-usti-1426': mark([13.9648, 50.6598], 'Ústí nad Labem, 1426', 'The knights break in and fall'),
  },
});
console.log('wagon fort: plan at', JSON.stringify(P(0, 0)));
