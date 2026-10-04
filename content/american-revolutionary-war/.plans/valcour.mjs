// Valcour Island, 11 to 13 October 1776. The map's land data has no Lake Champlain, so the plan draws the lake:
// around Valcour Island as two pieces that leave the island as land, and along its length as ribbons for the
// escape south. Shorelines are approximate.
import { writePlan } from './lib.mjs';

const G = 'pages/020-war/020-1776';
const toward = ([x1, y1], [x2, y2]) => (Math.atan2((x2 - x1) * Math.cos(y1 * Math.PI / 180), y2 - y1) * 180 / Math.PI + 360) % 360;
const mk = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
const NATIVE = '#8d6e3f';
const LAKE = { id: 'lake-champlain', name: 'Lake Champlain' };

// --- the line in the strait ---
const shore = [[-73.455, 44.700], [-73.455, 44.680], [-73.446, 44.660], [-73.441, 44.645], [-73.434, 44.632], [-73.436, 44.620], [-73.441, 44.605], [-73.446, 44.590], [-73.452, 44.575], [-73.460, 44.560]];
const island = { n: [-73.398, 44.640], nw: [-73.411, 44.629], w: [-73.415, 44.613], sw: [-73.411, 44.600], s: [-73.399, 44.595], se: [-73.386, 44.602], e: [-73.380, 44.617], ne: [-73.386, 44.632] };
const strait = [
  { area: [...shore, [-73.398, 44.560], island.s, island.sw, island.w, island.nw, island.n, [-73.398, 44.700]], ...LAKE },
  { area: [[-73.398, 44.700], island.n, island.ne, island.e, island.se, island.s, [-73.398, 44.560], [-73.300, 44.560], [-73.300, 44.700]], ...LAKE },
];
const LINE = [-73.4255, 44.6105], BRIT = [-73.4245, 44.6020];
writePlan(`${G}/016-canada-retreat-valcour`, {
  bbox: [-73.462, 44.580, -73.372, 44.640],
  emblem: {
    water: strait,
    units: [
      { side: 'usa', type: 'ships', at: LINE, width: 1500, depth: 220, facing: 180, count: 13, bow: -220, id: 'american-line', name: 'Arnold’s 15 vessels in a crescent across the strait, about 74 guns' },
      { side: 'held', type: 'ships', at: BRIT, width: 1300, depth: 330, facing: 0, count: 16, rows: 2, id: 'gunboats', name: 'British gunboats, 28 in all, each with one cannon' },
      { side: 'held', type: 'ships', at: [-73.4170, 44.6045], width: 200, depth: 200, facing: 330, count: 1, id: 'carleton', name: 'The schooner Carleton, 12 guns, badly damaged' },
      { side: 'held', type: 'ships', at: [-73.4200, 44.5935], width: 260, depth: 260, facing: 350, count: 1, id: 'inflexible', name: 'The ship sloop Inflexible, 18 guns, which comes up at sunset' },
      { side: 'held', type: 'ships', at: [-73.3930, 44.5860], width: 500, depth: 260, facing: 330, count: 2, id: 'thunderer-maria', name: 'Thunderer and Maria, held back by the headwind' },
      { side: 'usa', type: 'ships', at: [-73.4040, 44.5975], width: 200, depth: 200, facing: 200, count: 1, id: 'royal-savage', name: 'Royal Savage, aground on the island and burned' },
      { side: NATIVE, type: 'light', at: [-73.4120, 44.6170], width: 500, depth: 80, facing: 270, id: 'native-island', name: 'Native allies of the British landed on the island' },
      { side: NATIVE, type: 'light', at: [-73.4420, 44.6010], width: 500, depth: 80, facing: 90, id: 'native-shore', name: 'Native allies of the British on the western shore' },
    ],
    arrows: [
      { side: 'held', path: [[-73.360, 44.665], [-73.366, 44.625], [-73.378, 44.597], [-73.400, 44.586], [-73.418, 44.590]], width: 160, id: 'british-approach', name: 'Carleton’s fleet sails south past the island, then turns up into the strait' },
    ],
    clashes: [{ at: [-73.4250, 44.6065], size: 200 }, { at: [-73.4180, 44.6075], size: 160 }, { at: [-73.4320, 44.6060], size: 160 }],
  },
  markers: {
    'canada-retreat-valcour-arnold': mk([-73.4230, 44.6200], 'Arnold', 'On the galley Congress, west of Valcour Island', 'usa'),
    'canada-retreat-valcour-pringle': mk([-73.4100, 44.5950], 'Pringle and Carleton', 'Command the British fleet', 'held'),
    'canada-retreat-valcour-philadelphia': mk([-73.4380, 44.6080], 'Philadelphia', 'Sinks at about 6:30 p.m.', 'usa', 'skull'),
  },
});

// --- the escape south ---
const lakeNorth = [[-73.395, 44.700], [-73.375, 44.620], [-73.350, 44.520], [-73.335, 44.420], [-73.330, 44.330], [-73.325, 44.270]];
const lakeSouth = [[-73.325, 44.270], [-73.345, 44.200], [-73.370, 44.140], [-73.400, 44.085], [-73.425, 44.035]];
writePlan(`${G}/017-canada-retreat-escape`, {
  bbox: [-73.62, 44.00, -73.12, 44.66],
  emblem: {
    water: [{ path: lakeNorth, width: 8000, ...LAKE }, { path: lakeSouth, width: 2200, ...LAKE }],
    units: [
      { side: 'held', type: 'ships', at: [-73.3360, 44.3150], width: 2600, depth: 2600, facing: 175, count: 6, rows: 2, id: 'british-fleet', name: 'The British fleet, catching up as the wind changes' },
      { side: 'usa', type: 'ships', at: [-73.3200, 44.2620], width: 900, depth: 900, facing: 180, count: 1, id: 'washington', name: 'The galley Washington, which strikes her colours with 110 men' },
      { side: 'usa', type: 'ships', at: [-73.3450, 44.1600], width: 2400, depth: 1200, facing: 90, count: 5, id: 'burned-at-arnolds-bay', name: 'Congress and the smaller craft, run aground and burned in Arnold’s Bay' },
      { side: 'usa', type: 'ships', at: [-73.4150, 44.0550], width: 2400, depth: 1200, facing: 200, count: 4, id: 'escaped', name: 'Trumbull, New York, Enterprise and Revenge, safe at Crown Point' },
    ],
    arrows: [
      { side: 'usa', path: [[-73.425, 44.610], [-73.430, 44.585], [-73.385, 44.545], [-73.350, 44.505], [-73.335, 44.400], [-73.330, 44.300], [-73.345, 44.200], [-73.350, 44.172]], width: 900, style: 'dashed', id: 'american-escape', name: 'Arnold’s fleet slips past the British at night and makes for Crown Point' },
      { side: 'held', path: [[-73.385, 44.590], [-73.340, 44.470], [-73.318, 44.350]], width: 900, id: 'british-pursuit', name: 'The British fleet pursues on 12 and 13 October' },
      { side: 'usa', path: [[-73.360, 44.150], [-73.395, 44.100], [-73.420, 44.050]], width: 600, style: 'dashed', id: 'overland', name: 'About 200 men reach Crown Point overland' },
    ],
    clashes: [{ at: [-73.3250, 44.2750], size: 1400 }],
  },
  markers: {
    'canada-retreat-escape-valcour': mk([-73.4500, 44.6150], 'Valcour Island', 'The fleet slips away, night of 11 October', 'usa', 'moon'),
    'canada-retreat-escape-schuyler': mk([-73.3900, 44.5050], 'Schuyler Island', 'Providence and Jersey sunk', 'usa', 'anchor'),
    'canada-retreat-escape-split-rock': mk([-73.2700, 44.2650], 'Split Rock', 'Washington strikes her colours', 'usa', 'skull'),
    'canada-retreat-escape-arnolds-bay': mk([-73.2950, 44.1550], 'Arnold’s Bay', 'Arnold burns Congress', 'usa', 'flame'),
  },
  show: ['crown-point-1776'],
});
console.log('valcour plans written', toward(LINE, BRIT).toFixed(0));
