// Drepana, 249 BC. The Roman fleet comes up the coast from Lilybaeum at dawn; Adherbal leaves the harbour south of
// the Drepana peninsula, passes the Roman van and forms to seaward; the Romans fight with the shore at their backs.
// Frame: origin on the coast south of Drepana, u along the coast (south-south-west), w out to sea (west-north-west).
import { frame, writePlan } from './lib.mjs';

const f = frame([12.498, 37.98], 196), P = f.p, ROME = f.face(90), CARTH = f.face(270), NORTH = f.face(180), SOUTH = f.face(0);
const G = 'pages/020-first-war/070-lilybaeum';
const bbox = f.box([[-4800, -900], [5200, 3000]], 0);
const ships = (side, u, w, width, depth, count, facing, rows = 1, extra = {}) => ({ side, type: 'ships', at: P(u, w), width, depth, count, rows, facing, ...extra });
const arrow = (side, pts, width = 80, style, extra = {}) => ({ side, path: f.path(pts), width, ...(style ? { style } : {}), ...extra });
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const nm = (id, name) => ({ id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const city = { 'lilybaeum-approach-drepana': mark(-4240, -340, 'Drepana', 'Carthaginian naval base', 'carthage', 'castle') };

// --- overview: the relief fleet of 250 BC and Pulcher's night voyage ---
writePlan(`${G}/010-lilybaeum`, {
  routes: {
    'relief-250': { name: 'Fifty Carthaginian ships run into Lilybaeum on a west wind, 250 BC', path: [[12.24, 37.94], [12.3, 37.86], [12.38, 37.81], [12.425, 37.8]] },
    'pulcher-249': { name: 'Pulcher sails north by night towards Drepana, 249 BC', path: [[12.42, 37.81], [12.45, 37.86], [12.46, 37.92], [12.48, 37.96], [12.49, 37.995]] },
  },
  show: ['lilybaeum-249', 'aegusa-250'],
});

// --- dawn: the Roman column strung out along the coast, Adherbal leads his fleet out past the van ---
writePlan(`${G}/020-lilybaeum-approach`, {
  bbox,
  emblem: {
    units: [
      ships('rome', -2600, 650, 220, 1200, 7, NORTH, 7, nm('roman-van', 'The Roman vanguard, ordered back to form a line')),
      ships('rome', -900, 800, 260, 1500, 8, NORTH, 8, nm('roman-column', 'The Roman fleet, strung out along the coast')),
      ships('rome', 900, 600, 260, 1500, 8, NORTH, 8, nm('roman-column', 'The Roman fleet, strung out along the coast')),
      ships('rome', 2700, 820, 260, 1500, 8, NORTH, 8, nm('roman-column', 'The Roman fleet, strung out along the coast')),
      ships('rome', 3800, 700, 120, 160, 1, NORTH, 1, nm('flagship', 'Pulcher’s flagship, near the rear')),
      ships('carthage', -3150, 1250, 700, 500, 10, ROME + 0, 2, nm('carthaginian-fleet', 'Adherbal’s fleet leaving the harbour, 100 to 130 ships')),
    ],
    arrows: [
      arrow('carthage', [[-3300, 650], [-3350, 1500], [-2700, 2250], [-1300, 2450], [400, 2200], [1800, 1950]], 120, undefined, nm('adherbal-out', 'Adherbal passes the Roman van and turns south in open water')),
      arrow('rome', [[-2900, 1000], [-2550, 1350], [-2000, 1250]], 60, undefined, nm('van-turns', 'The leading Roman ships turn back and foul those behind')),
    ],
    clashes: [{ at: P(-2150, 900), size: 110 }],
  },
  markers: {
    ...city,
    'lilybaeum-approach-adherbal': mark(-2600, 2650, 'Adherbal', 'Leads the fleet out to sea', 'carthage'),
    'lilybaeum-approach-van': mark(-1900, 300, 'Roman van', 'Turns back and fouls the line', 'rome', 'ship'),
    'lilybaeum-approach-pulcher': mark(3800, 250, 'Pulcher', 'Flagship near the rear', 'rome'),
  },
});

// --- the two lines: the Romans with the shore behind them, five Carthaginian ships cut the way south ---
writePlan(`${G}/030-lilybaeum-line`, {
  bbox,
  emblem: {
    units: [
      ships('rome', -1800, 650, 1300, 220, 9, ROME, 1, nm('roman-line', 'The Roman line, with the shore close behind it')),
      ships('rome', -300, 650, 1300, 220, 9, ROME, 1, nm('roman-line', 'The Roman line, with the shore close behind it')),
      ships('rome', 1200, 650, 1300, 220, 9, ROME, 1, nm('roman-line', 'The Roman line, with the shore close behind it')),
      ships('rome', 2200, 650, 120, 160, 1, ROME, 1, nm('flagship', 'Pulcher’s flagship')),
      ships('carthage', -1800, 1650, 1400, 220, 9, CARTH, 1, nm('carthaginian-line', 'Adherbal’s line, to seaward of the Romans')),
      ships('carthage', -300, 1650, 1400, 220, 9, CARTH, 1, nm('carthaginian-line', 'Adherbal’s line, to seaward of the Romans')),
      ships('carthage', 1200, 1650, 1400, 220, 9, CARTH, 1, nm('carthaginian-line', 'Adherbal’s line, to seaward of the Romans')),
      ships('carthage', 2950, 1150, 500, 260, 5, CARTH, 1, nm('five-ships', 'Five Carthaginian ships cutting off the way to Lilybaeum')),
    ],
    arrows: [arrow('carthage', [[-1200, 1520], [-1200, 820]], 90, undefined, nm('rams', 'Carthaginian ships ram and back water')),
      arrow('carthage', [[600, 1520], [600, 820]], 90, undefined, nm('rams', 'Carthaginian ships ram and back water')),
      arrow('carthage', [[3400, 1700], [3050, 1300]], 70, undefined, nm('five-ships-move', 'Five ships get south of the Roman flagship'))],
    clashes: [P(-1500, 780), P(300, 780), P(1700, 780)],
  },
  markers: {
    'lilybaeum-line-adherbal': mark(-300, 2150, 'Adherbal', 'Line to seaward', 'carthage'),
    'lilybaeum-line-pulcher': mark(2200, 250, 'Pulcher', 'Shore behind the Roman line', 'rome'),
    'lilybaeum-line-five': mark(3500, 1550, 'Five ships', 'Cut the way to Lilybaeum', 'carthage', 'ship'),
  },
  show: ['lilybaeum-approach-drepana'],
});

// --- the end: crews beach their ships, Pulcher escapes south with 30 ---
writePlan(`${G}/040-lilybaeum-breakout`, {
  bbox,
  emblem: {
    units: [
      ships('rome', -1500, 520, 700, 220, 4, ROME, 1, nm('roman-line', 'What is left of the Roman line')),
      ships('rome', 200, 470, 600, 220, 4, ROME, 1, nm('roman-line', 'What is left of the Roman line')),
      ships('rome', -700, 140, 500, 150, 3, CARTH, 1, nm('aground', 'Roman ships run aground by their crews')),
      ships('rome', 4300, 1150, 380, 420, 6, SOUTH, 2, nm('pulcher', 'Pulcher with the 30 ships that survive')),
      ships('carthage', -1500, 1000, 1200, 240, 7, CARTH, 1, nm('carthaginian-line', 'Adherbal’s fleet, closing in')),
      ships('carthage', 0, 950, 1200, 240, 7, CARTH, 1, nm('carthaginian-line', 'Adherbal’s fleet, closing in')),
      ships('carthage', 1400, 1000, 1000, 240, 6, CARTH, 1, nm('carthaginian-line', 'Adherbal’s fleet, closing in')),
      ships('carthage', 2950, 1150, 500, 260, 5, CARTH, 1, nm('five-ships', 'Five Carthaginian ships to the south')),
    ],
    arrows: [
      arrow('carthage', [[-1000, 900], [-1000, 520]], 80, undefined, nm('closing', 'The Carthaginians pick off and ram the exposed ships')),
      arrow('carthage', [[600, 860], [600, 450]], 80, undefined, nm('closing', 'The Carthaginians pick off and ram the exposed ships')),
      arrow('rome', [[2200, 650], [3000, 1450], [3800, 1300], [5000, 800]], 90, 'dashed', nm('pulcher-breaks-out', 'Pulcher breaks out to the south')),
    ],
    clashes: [P(-1250, 680), P(400, 660)],
  },
  markers: {
    'lilybaeum-breakout-aground': mark(-700, -350, 'Roman crews', 'Beach their ships and flee', 'rome', 'skull'),
    'lilybaeum-breakout-captured': mark(0, 1500, 'Adherbal', '93 Roman ships captured', 'carthage'),
    'lilybaeum-breakout-pulcher': mark(4500, 1700, 'Pulcher', 'Escapes with 30 ships', 'rome'),
  },
  show: ['lilybaeum-approach-drepana'],
});

// --- Carthalo at Lilybaeum and off Phintias, the convoy wrecked ---
writePlan(`${G}/050-lilybaeum-aftermath`, {
  routes: {
    'carthalo-249': { name: 'Carthalo raids the Roman ships off Lilybaeum', path: [[12.47, 37.99], [12.42, 37.9], [12.4, 37.82]] },
    'convoy-249': { name: 'A Roman convoy of 800 transports sails west along the south coast', path: [[15.27, 37.05], [15.25, 36.75], [15.05, 36.6], [14.6, 36.72], [14.15, 36.92], [13.98, 37.03]] },
    'carthalo-249b': { name: 'Carthalo meets the convoy off Phintias', path: [[12.38, 37.77], [12.6, 37.5], [13.1, 37.33], [13.6, 37.12], [13.88, 37.06]] },
  },
  show: ['lilybaeum-249', 'phintias-249'],
});

console.log('drepana: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 1150)));
