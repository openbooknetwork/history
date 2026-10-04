// Sullivan's Island, 28 June 1776, in real coordinates. The fort sits on the map's shore of Sullivan's Island,
// about 300 m north-east of its real site, so it stands on land; the ships keep their distances from it. The map
// joins Sullivan's Island, Long Island (the Isle of Palms) and the mainland, so Breach Inlet is drawn as water.
import { writePlan } from './lib.mjs';

const G = 'pages/020-war/020-1776';
const mk = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
const FORT = [-79.8525, 32.7628];
// a square of side s metres around a point, as a closed path
const square = ([lon, lat], s) => { const dx = s / 2 / (111320 * Math.cos(lat * Math.PI / 180)), dy = s / 2 / 110540;
  return [[lon - dx, lat - dy], [lon + dx, lat - dy], [lon + dx, lat + dy], [lon - dx, lat + dy], [lon - dx, lat - dy]]; };
const breach = { path: [[-79.8160, 32.7650], [-79.8115, 32.7710], [-79.8065, 32.7790]], width: 260, id: 'breach-inlet', name: 'Breach Inlet, deeper than the British expected' };
const works = [
  { side: 'usa', path: square(FORT, 150), width: 20, id: 'fort-sullivan', name: 'Fort Sullivan, palmetto logs filled with sand, 31 guns' },
  { side: 'usa', path: [[-79.8185, 32.7680], [-79.8165, 32.7735]], width: 60, id: 'thomson-works', name: 'Thomson’s entrenchment at the north end of the island' },
];
// a line ahead: one ship per row along the facing, each hull about len metres long, drawn broadside to the fort
const ships = (at, len, count, id, name, facing = 90) => ({ side: 'held', type: 'ships', at, width: len, depth: count * len * 1.25, rows: count, count, facing, id, name });
const bbox = [-79.900, 32.734, -79.795, 32.790];

writePlan(`${G}/021-declaration-fort-sullivan`, {
  bbox,
  emblem: {
    water: [breach], works,
    units: [
      { side: 'usa', type: 'infantry', at: FORT, width: 190, depth: 150, facing: 180, id: 'moultrie', name: 'Moultrie’s 435 men of the 2nd South Carolina and the 4th South Carolina Artillery' },
      ships([-79.8530, 32.7578], 280, 4, 'parker-line', 'Bristol, Experiment, Active and Solebay, anchored about 400 yards off the fort'),
      ships([-79.8460, 32.7420], 240, 2, 'thunder', 'The bomb vessel Thunder and Friendship, about a mile and a half off'),
      { side: 'usa', type: 'infantry', at: [-79.8205, 32.7712], width: 500, depth: 160, facing: 45, id: 'thomson', name: 'Colonel William Thomson’s riflemen and guns, more than 750 men' },
      { side: 'held', type: 'infantry', at: [-79.8010, 32.7800], width: 700, depth: 200, facing: 225, id: 'clinton', name: 'Clinton’s 2,200 troops on Long Island' },
    ],
    arrows: [
      { side: 'held', path: [[-79.8050, 32.7760], [-79.8100, 32.7735], [-79.8140, 32.7718]], width: 110, id: 'clinton-boats', name: 'Clinton’s boats try to cross the inlet' },
      { side: 'held', path: [[-79.8150, 32.7690], [-79.8095, 32.7700], [-79.8045, 32.7735]], width: 90, style: 'dashed', id: 'clinton-back', name: 'Driven back by grapeshot and rifle fire' },
    ],
    clashes: [{ at: [-79.8530, 32.7605], size: 160 }, { at: [-79.8160, 32.7712], size: 140 }],
  },
  markers: {
    'declaration-fort-sullivan-moultrie': mk([-79.8640, 32.7665], 'Moultrie', 'Holds the fort', 'usa'),
    'declaration-fort-sullivan-parker': mk([-79.8390, 32.7540], 'Parker', 'Opens broadsides at about 10 a.m.', 'held'),
    'declaration-fort-sullivan-clinton': mk([-79.7990, 32.7845], 'Clinton', 'Cannot cross the inlet', 'held'),
    'declaration-fort-sullivan-lee': mk([-79.8790, 32.7850], 'Lee', 'At Haddrell’s Point', 'usa'),
    'declaration-fort-sullivan-charleston': mk([-79.8950, 32.7870], 'Charleston', 'Across the harbour', 'usa', 'landmark'),
  },
});

writePlan(`${G}/022-declaration-frigates`, {
  bbox,
  emblem: {
    water: [breach], works,
    units: [
      { side: 'usa', type: 'infantry', at: FORT, width: 190, depth: 150, facing: 180, id: 'moultrie', name: 'Moultrie’s garrison, firing slowly to save powder' },
      ships([-79.8530, 32.7578], 280, 4, 'parker-line', 'Bristol and Experiment, battered by the fort’s guns'),
      ships([-79.8460, 32.7420], 240, 2, 'thunder', 'Thunder, her mortars broken from their mounts'),
      ships([-79.8745, 32.7585], 240, 3, 'frigates', 'Sphinx, Syren and Actaeon, aground on the Middle Ground', 300),
    ],
    arrows: [
      { side: 'held', path: [[-79.8500, 32.7440], [-79.8640, 32.7500], [-79.8710, 32.7560]], width: 120, id: 'frigates-route', name: 'The frigates sent round the shoals to rake the fort' },
      { side: 'usa', path: [[-79.8760, 32.7820], [-79.8650, 32.7740], [-79.8560, 32.7660]], width: 90, id: 'powder', name: 'Lee sends powder from the mainland' },
      { side: 'held', path: [[-79.8530, 32.7550], [-79.8520, 32.7480], [-79.8480, 32.7420]], width: 110, style: 'dashed', id: 'withdrawal', name: 'The fleet withdraws out of range at about 9 p.m.' },
    ],
    clashes: [{ at: [-79.8530, 32.7605], size: 180 }],
  },
  markers: {
    'declaration-frigates-jasper': mk([-79.8635, 32.7665], 'Jasper', 'Raises the fallen flag', 'usa', 'flag'),
    'declaration-frigates-actaeon': mk([-79.8860, 32.7560], 'Actaeon', 'Burned by her crew next morning', 'held', 'flame'),
    'declaration-frigates-bristol': mk([-79.8380, 32.7540], 'Bristol', '40 killed, 71 wounded, Parker hurt', 'held', 'skull'),
  },
});
console.log('sullivans island plans written');
