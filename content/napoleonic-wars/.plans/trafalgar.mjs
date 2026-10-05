// Trafalgar, 21 October 1805, at the article's coordinate about 11 km off the coast north-west of Cape Trafalgar.
// The combined fleet sails north for Cádiz in an uneven crescent about 8 km long, bulging to leeward towards the
// shore; the British come down from the west-north-west in two columns. Positions are metres east and north of the
// coordinate. Ships keep their spacing of about 250 m in line but are drawn about 200 m long, three times their
// real length, so they show at this scale.
import { writePlan } from './lib.mjs';

const G = 'pages/050-third-coalition/030-trafalgar';
const O = [-6.2, 36.25];
const at = (dx = 0, dy = 0, [lon, lat] = O) => { const kx = 111320 * Math.cos(lat * Math.PI / 180); return [+(lon + dx / kx).toFixed(5), +(lat + dy / 110540).toFixed(5)]; };
const bbox = [at(-6200, 0)[0], at(0, -5000)[1], at(5200, 0)[0], at(0, 5000)[1]];
const BR = 'britain', FR = 'france';
const SPACING = 250, BEAM = 130;

// the allied crescent: x east of the coordinate as a function of y north, bulging east in the middle
const lineX = y => 700 - 1200 * (y / 4000) ** 2, deg = r => (r * 180 / Math.PI + 360) % 360;
// a stretch of ships in line ahead from y0 to y1 along the crescent, sailing north (or south when reversed)
const stretch = (y0, y1, count, id, name, { side = FR, dx = 0, south = false } = {}) => {
  const ym = (y0 + y1) / 2, len = Math.hypot(lineX(y1) - lineX(y0), y1 - y0), h = deg(Math.atan2(lineX(y1) - lineX(y0), y1 - y0));
  return { side, type: 'ships', at: at(lineX(ym) + dx, ym), width: BEAM, depth: len, facing: south ? (h + 180) % 360 : h, count, rows: count, id, name };
};
// a British column in line ahead whose leading ship is at (hx, hy), sailing on bearing `course`
const column = (hx, hy, course, count, id, name) => {
  const len = count * SPACING, t = course * Math.PI / 180;
  return { side: BR, type: 'ships', at: at(hx - Math.sin(t) * len / 2, hy - Math.cos(t) * len / 2), width: BEAM, depth: len, facing: course, count, rows: count, id, name };
};
// a knot of ships fighting at close quarters
const knot = (side, dx, dy, width, depth, facing, count, rows, id, name) => ({ side, type: 'ships', at: at(dx, dy), width, depth, facing, count, rows, id, name });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts.map(([x, y]) => at(x, y)), width, id, name, ...(style ? { style } : {}) });
const mark = (dx, dy, label, note, color, icon = 'ship') => ({ lnglat: at(dx, dy), icon, color, label, note });

// --- overview: Villeneuve's voyage and return, Nelson's pursuit, the combined fleet leaves Cádiz ---
writePlan(`${G}/010-trafalgar`, {
  routes: {
    'villeneuve-1805': { name: 'Villeneuve from Toulon by Cartagena and Cádiz towards the West Indies, 30 March to April 1805',
      path: [[5.93, 43.08], [4.6, 41.4], [2.1, 39.0], [-0.9, 37.5], [-3.4, 36.5], [-5.6, 35.95], [-6.35, 36.5], [-8.5, 35.6], [-13, 33.8]] },
    'nelson-1805': { name: 'Nelson follows through the Strait and across the Atlantic, May 1805', offset: 6,
      path: [[2.1, 38.6], [-0.9, 37.2], [-3.4, 36.3], [-5.6, 35.9], [-8.5, 35.3], [-13, 33.5]] },
    'villeneuve-return-1805': { name: 'Villeneuve returns by Cape Finisterre to Vigo and Ferrol, then sails south to Cádiz, July to August 1805',
      path: [[-13, 43.6], [-10.2, 43.1], [-8.9, 42.25], [-8.4, 43.4], [-9.6, 42.6], [-10.2, 40.0], [-9.4, 37.0], [-6.5, 36.55]] },
    'combined-fleet-1805': { name: 'The combined fleet leaves Cádiz, 19 to 20 October 1805',
      path: [[-6.3, 36.53], [-6.38, 36.4], [-6.3, 36.3]] },
  },
  markers: {
    'trafalgar-toulon': { lnglat: [5.93, 43.12], icon: 'ship', color: FR, label: 'Toulon', note: 'Villeneuve sails, 30 March' },
    'trafalgar-brest': { lnglat: [-4.49, 48.39], icon: 'anchor', color: FR, label: 'Brest', note: 'Ganteaume blockaded' },
    'trafalgar-finisterre': { lnglat: [-9.27, 42.89], icon: 'swords', color: BR, label: 'Cape Finisterre', note: 'Calder’s action, 22 July' },
  },
});

// --- the approach, about 11 a.m.: the allied line has worn and heads north; the British close in two columns ---
const alliedLine = (o = 0) => [
  stretch(2600 + o, 4300 + o, 9, 'allied-van', 'The allied van under Dumanoir, at the head of the line after the turn'),
  stretch(1350 + o, 2450 + o, 6, 'allied-centre', 'The allied centre with Villeneuve in Bucentaure and the Santísima Trinidad'),
  stretch(-500 + o, 1200 + o, 8, 'allied-rear-centre', 'Redoutable, Neptune and the ships astern of the flagship down to Álava’s Santa Ana'),
  stretch(-3700 + o, -650 + o, 10, 'allied-rear', 'The allied rear and Gravina’s squadron, French and Spanish ships'),
];
writePlan(`${G}/020-trafalgar-approach`, {
  bbox,
  emblem: {
    units: [
      ...alliedLine(0),
      column(-3300, 1650, 95, 12, 'weather-column', 'Nelson’s weather column, led by HMS Victory'),
      column(-2900, -1000, 100, 15, 'lee-column', 'Collingwood’s lee column, led by HMS Royal Sovereign'),
    ],
    arrows: [
      arrow(BR, [[-3000, 1650], [-1900, 1900], [-900, 2150]], 150, 'weather-course', 'Nelson steers for the allied van'),
      arrow(BR, [[-2600, -1050], [-1300, -1000], [-200, -700]], 150, 'lee-course', 'Collingwood steers for the allied rear'),
      arrow(FR, [[3300, -3200], [3400, 0], [3100, 3500]], 160, 'allied-wear', 'The combined fleet wears together at 8 a.m. and heads north for Cádiz'),
    ],
  },
  markers: {
    'trafalgar-approach-nelson': mark(-4600, 3000, 'Nelson', 'In HMS Victory', BR, 'user'),
    'trafalgar-approach-collingwood': mark(-4300, -2100, 'Collingwood', 'In HMS Royal Sovereign', BR, 'user'),
    'trafalgar-approach-villeneuve': mark(2000, 1900, 'Villeneuve', 'In Bucentaure', FR, 'user'),
    'trafalgar-approach-dumanoir': mark(1300, 4500, 'Dumanoir', 'Now leading the line', FR, 'user'),
    'trafalgar-approach-gravina': mark(2000, -3300, 'Gravina', 'At the rear of the line', FR, 'user'),
  },
});

// --- noon to 12:45: Royal Sovereign breaks the line astern of Santa Ana, Victory astern of Bucentaure ---
const VICTORY = [lineX(1300) - 60, 1300], SOVEREIGN = [lineX(-580) - 60, -580];
writePlan(`${G}/030-trafalgar-breaking`, {
  bbox,
  emblem: {
    units: [
      ...alliedLine(300),
      column(VICTORY[0] + 200, VICTORY[1] + 300, 95, 12, 'weather-column', 'Nelson’s column follows Victory into the gap'),
      column(SOVEREIGN[0] + 200, SOVEREIGN[1] + 300, 100, 15, 'lee-column', 'Collingwood’s column follows Royal Sovereign, Belleisle second'),
    ],
    arrows: [
      arrow(BR, [[-2300, 1900], [-1300, 2300], [-200, 2200], [VICTORY[0] + 150, VICTORY[1] + 300]], 150, 'nelson-feint', 'Victory feints towards the van, then turns for the centre'),
      arrow(BR, [[-1800, -600], [-700, -400], [SOVEREIGN[0] + 150, SOVEREIGN[1] + 300]], 150, 'collingwood-attack', 'Royal Sovereign breaks the line astern of Santa Ana'),
    ],
    clashes: [{ at: at(VICTORY[0] + 300, VICTORY[1] + 300), size: 220 }, { at: at(SOVEREIGN[0] + 300, SOVEREIGN[1] + 300), size: 220 }],
  },
  markers: {
    'trafalgar-breaking-victory': mark(-1800, 3300, 'Victory', 'Cuts the line at 12:45', BR),
    'trafalgar-breaking-bucentaure': mark(VICTORY[0] + 2000, VICTORY[1] + 1200, 'Bucentaure', 'Raked from astern, dismasted', FR),
    'trafalgar-breaking-sovereign': mark(SOVEREIGN[0] - 1900, SOVEREIGN[1] - 900, 'Royal Sovereign', 'Breaks the line at noon', BR),
    'trafalgar-breaking-santa-ana': mark(SOVEREIGN[0] + 2100, SOVEREIGN[1] - 300, 'Santa Ana', 'Álava’s flagship, raked', FR),
  },
});

// --- the afternoon: two mêlées in the centre and the rear; Dumanoir's van sails away ---
writePlan(`${G}/040-trafalgar-melee`, {
  bbox,
  emblem: {
    units: [
      knot(BR, 300, 1650, 900, 1300, 95, 9, 3, 'weather-column', 'Victory, Temeraire, Neptune, Conqueror, Leviathan and the rest of Nelson’s column'),
      knot(FR, 1250, 1750, 600, 1100, 0, 6, 3, 'allied-centre', 'Bucentaure, Redoutable and the Santísima Trinidad, isolated and taken'),
      knot(BR, 200, -950, 1100, 1700, 100, 12, 4, 'lee-column', 'Collingwood’s column among the allied rear'),
      knot(FR, 1250, -1050, 700, 1600, 10, 9, 3, 'allied-rear', 'Santa Ana, Fougueux, Algésiras and the rest of the allied rear, overwhelmed'),
      knot(FR, -500, 4100, 400, 900, 200, 4, 2, 'dumanoir', 'Dumanoir’s four ships, which sail away to the south-west'),
      knot(FR, 2300, 3700, 400, 900, 20, 6, 3, 'allied-van', 'The rest of the allied van, making for Cádiz'),
      knot(FR, 2600, -2900, 500, 1100, 30, 8, 3, 'gravina', 'Gravina’s ships escaping towards Cádiz'),
    ],
    arrows: [
      arrow(FR, [[-900, 3700], [-2600, 1500], [-3600, -1500], [-4400, -4400]], 140, 'dumanoir-escape', 'Dumanoir breaks off with four ships', 'dashed'),
      arrow(FR, [[2900, -2300], [3800, 0], [4300, 3200], [4600, 4800]], 140, 'gravina-retreat', 'Eleven allied ships get away to Cádiz', 'dashed'),
    ],
    clashes: [at(800, 1650), at(750, 2250), at(700, -950), at(750, -300), at(800, -1700)],
  },
  markers: {
    'trafalgar-melee-nelson': mark(-200, 3400, 'Nelson', 'Mortally wounded, dies at 16:30', BR, 'skull'),
    'trafalgar-melee-villeneuve': mark(2800, 1500, 'Villeneuve', 'Taken in Bucentaure', FR, 'user'),
    'trafalgar-melee-redoutable': mark(2600, 3000, 'Redoutable', 'Surrenders at 13:55', FR, 'skull'),
    'trafalgar-melee-achille': mark(1100, -3600, 'Achille', 'Blows up', FR, 'skull'),
    'trafalgar-melee-dumanoir': mark(-3300, 3900, 'Dumanoir', 'Sails away with four ships', FR, 'user'),
  },
});

console.log('trafalgar: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(at(lineX(0), 0)));
