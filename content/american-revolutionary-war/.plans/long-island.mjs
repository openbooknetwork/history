// Long Island, 26 to 30 August 1776, in real coordinates over Brooklyn. The Guan Heights run from Gowanus to the
// Jamaica Pass; the American lines on Brooklyn Heights run from Gowanus Creek to Wallabout Bay. Positions follow
// the battle article's street references; the Hessians are drawn in their own colour.
import { writePlan } from './lib.mjs';

const G = 'pages/020-war/020-1776';
const HESSIAN = '#3d8b62';
const toward = ([x1, y1], [x2, y2]) => (Math.atan2((x2 - x1) * Math.cos(y1 * Math.PI / 180), y2 - y1) * 180 / Math.PI + 360) % 360;
const mk = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });
const unit = (side, type, at, width, depth, facing, id, name) => ({ side, type, at, width, depth, facing, id, name });
const lines = { side: 'usa', path: [[-73.9905, 40.6800], [-73.9840, 40.6855], [-73.9785, 40.6905], [-73.9735, 40.6965], [-73.9705, 40.7010]], width: 110, id: 'brooklyn-lines', name: 'The American lines on Brooklyn Heights, from Gowanus Creek to Wallabout Bay' };
const creek = { path: [[-74.0060, 40.6650], [-73.9990, 40.6705], [-73.9935, 40.6745], [-73.9885, 40.6770]], width: 140, id: 'gowanus-creek', name: 'Gowanus Creek and Brouwer’s millpond, about 80 yards wide' };
const regional = [-74.045, 40.600, -73.875, 40.708];

// --- the night march ---
writePlan(`${G}/031-new-york-night-march`, {
  bbox: regional,
  emblem: {
    water: [creek], works: [lines],
    units: [
      unit('usa', 'infantry', [-73.9810, 40.6925], 1400, 400, 150, 'putnam', 'About 6,000 men in the Brooklyn lines under Israel Putnam'),
      unit('usa', 'infantry', [-73.9965, 40.6605], 900, 250, 200, 'stirling', 'Stirling’s men on the Gowanus Road, about 1,600 by dawn'),
      unit('usa', 'infantry', [-73.9680, 40.6650], 700, 250, 165, 'sullivan', 'Sullivan with about 1,000 men at the Flatbush Pass'),
      unit('usa', 'infantry', [-73.9470, 40.6745], 600, 230, 170, 'bedford-pass', 'About 800 men at the Bedford Pass'),
      unit('usa', 'light', [-73.8960, 40.6845], 450, 90, 180, 'jamaica-patrol', 'Five militia officers on horseback, the only guard of the Jamaica Pass'),
      unit('held', 'infantry', [-74.0115, 40.6410], 900, 300, 25, 'grant', 'James Grant’s two brigades, about 4,000 British troops'),
      unit(HESSIAN, 'infantry', [-73.9580, 40.6500], 1100, 320, 345, 'de-heister', 'Hessians under Leopold von Heister at Flatbush'),
      unit('held', 'infantry', [-73.8930, 40.6640], 400, 2400, 5, 'main-column', 'The main army, about 10,000 under Clinton, Cornwallis, Howe and Percy, two miles long'),
    ],
    arrows: [
      { side: 'held', path: [[-73.9300, 40.6230], [-73.9080, 40.6430], [-73.8930, 40.6520]], width: 260, id: 'night-march', name: 'The night march by New Lots to the Jamaica Pass, from 9 p.m.' },
      { side: 'held', path: [[-73.8930, 40.6800], [-73.8950, 40.6860], [-73.9150, 40.6870], [-73.9420, 40.6830]], width: 240, style: 'dashed', id: 'next-morning', name: 'Through the pass at dawn, then west towards Bedford' },
      { side: 'held', path: [[-74.0130, 40.6450], [-74.0060, 40.6510], [-74.0010, 40.6560]], width: 220, id: 'grant-attack', name: 'Grant’s attack up the Gowanus Road from about 1 a.m.' },
    ],
    clashes: [{ at: [-74.0040, 40.6510], size: 260 }, { at: [-73.8955, 40.6830], size: 220 }],
  },
  markers: {
    'new-york-night-march-howard': mk([-73.9020, 40.6960], 'Howard’s Tavern', 'The tavern keeper is made to guide', 'held', 'house'),
    'new-york-night-march-clinton': mk([-73.9050, 40.6600], 'Clinton', 'Leads the light infantry in front', 'held'),
    'new-york-night-march-putnam': mk([-73.9700, 40.6990], 'Putnam', 'Commands on Long Island', 'usa'),
    'new-york-night-march-red-lion': mk([-74.0200, 40.6530], 'Red Lion Inn', 'First shots, about 11 p.m.', 'usa', 'crosshair'),
    'new-york-night-march-flatbush': mk([-73.9450, 40.6430], 'Flatbush', 'Hessian camp', 'held', 'landmark'),
  },
});

// --- the flank turned ---
writePlan(`${G}/032-new-york-flank`, {
  bbox: regional,
  emblem: {
    water: [creek], works: [lines],
    units: [
      unit('usa', 'infantry', [-73.9810, 40.6925], 1400, 400, 150, 'putnam', 'The Brooklyn lines, where Sullivan’s men take refuge'),
      unit('usa', 'infantry', [-73.9965, 40.6605], 900, 250, 200, 'stirling', 'Stirling holds Grant for four hours'),
      unit('usa', 'infantry', [-73.9905, 40.6560], 300, 140, 220, 'parsons', 'About 300 men under Parsons on Battle Hill'),
      unit('usa', 'infantry', [-73.9690, 40.6680], 700, 250, 160, 'sullivan', 'Sullivan’s men, caught between the Hessians and the British'),
      unit('held', 'infantry', [-74.0080, 40.6505], 900, 300, 25, 'grant', 'Grant’s brigades on the Gowanus Road'),
      unit(HESSIAN, 'infantry', [-73.9620, 40.6575], 1100, 320, 340, 'de-heister', 'The Hessians attack up the Flatbush Pass at 9 a.m.'),
      unit('held', 'infantry', [-73.9500, 40.6800], 2000, 380, 240, 'main-column', 'Howe’s main army, through the Jamaica Pass, comes down behind the heights'),
    ],
    arrows: [
      { side: HESSIAN, path: [[-73.9600, 40.6610], [-73.9650, 40.6650]], width: 230, id: 'hessian-attack', name: 'The Hessians attack up the Flatbush Pass' },
      { side: 'held', path: [[-73.9550, 40.6770], [-73.9640, 40.6730], [-73.9680, 40.6720]], width: 230, id: 'rear-attack', name: 'The British come down on Sullivan from behind' },
      { side: 'held', path: [[-73.9480, 40.6830], [-73.9700, 40.6810], [-73.9840, 40.6745]], width: 230, id: 'cornwallis', name: 'Cornwallis marches west behind Stirling' },
      { side: 'usa', path: [[-73.9720, 40.6705], [-73.9760, 40.6790], [-73.9790, 40.6870]], width: 200, style: 'dashed', id: 'sullivan-retreat', name: 'Most of Sullivan’s men reach the Brooklyn lines' },
    ],
    clashes: [{ at: [-73.9665, 40.6640], size: 250 }, { at: [-73.9700, 40.6715], size: 250 }, { at: [-73.9985, 40.6560], size: 220 }, { at: [-73.9920, 40.6545], size: 180 }],
  },
  markers: {
    'new-york-flank-sullivan': mk([-73.9545, 40.6655], 'Sullivan', 'Captured', 'usa', 'skull'),
    'new-york-flank-parsons': mk([-74.0045, 40.6595], 'Parsons', 'Battle Hill, most of his men taken', 'usa'),
    'new-york-flank-howe': mk([-73.9400, 40.6900], 'Howe', 'Two signal guns at 9 a.m.', 'held'),
    'new-york-flank-de-heister': mk([-73.9480, 40.6520], 'von Heister', 'Hessians', 'held'),
  },
});

// --- the Maryland 400 ---
const HOUSE = [-73.9842, 40.6728];
writePlan(`${G}/033-new-york-maryland`, {
  bbox: [-74.0065, 40.6560, -73.9715, 40.6880],
  emblem: {
    water: [{ ...creek, width: 90 }], works: [{ ...lines, width: 60 }],
    units: [
      unit('held', 'infantry', HOUSE, 380, 160, 225, 'british-at-house', 'Over 2,000 British with two guns at the Vechte–Cortelyou House'),
      unit('usa', 'infantry', [-73.9878, 40.6690], 300, 70, 45, 'maryland', 'About 260 Marylanders under Stirling and Mordecai Gist'),
      unit('held', 'infantry', [-73.9970, 40.6610], 700, 160, 20, 'grant', 'Grant, reinforced by 2,000 marines'),
      unit(HESSIAN, 'infantry', [-73.9770, 40.6650], 500, 160, 265, 'hessians', 'Hessians closing in from the east'),
      unit('usa', 'infantry', [-73.9850, 40.6820], 700, 160, 150, 'lines-garrison', 'Defenders in the Brooklyn lines'),
    ],
    arrows: [
      { side: 'usa', path: [[-73.9875, 40.6700], [-73.9860, 40.6715]], width: 60, id: 'maryland-attack', name: 'The Marylanders attack the house twice' },
      { side: 'usa', path: [[-73.9965, 40.6640], [-73.9965, 40.6700], [-73.9925, 40.6765], [-73.9890, 40.6795]], width: 70, style: 'dashed', id: 'crossing', name: 'Stirling’s men cross the creek and the marsh to the lines' },
      { side: 'usa', path: [[-74.0010, 40.6645], [-74.0005, 40.6705], [-73.9960, 40.6775], [-73.9915, 40.6805]], width: 70, style: 'dashed', id: 'crossing', name: 'Stirling’s men cross the creek and the marsh to the lines' },
    ],
    clashes: [{ at: [-73.9855, 40.6718], size: 110 }, { at: [-73.9935, 40.6625], size: 90 }],
  },
  markers: {
    'new-york-maryland-house': mk([-73.9812, 40.6745], 'Old Stone House', 'The Vechte–Cortelyou House', 'held', 'house'),
    'new-york-maryland-stirling': mk([-73.9905, 40.6660], 'Stirling and Gist', 'Stirling surrenders to the Hessians', 'usa'),
    'new-york-maryland-washington': mk([-73.9930, 40.6865], 'Washington', 'Watches from Cobble Hill', 'usa'),
  },
});

// --- the crossing to Manhattan ---
const FERRY = [-73.9945, 40.7030], LANDING = [-74.0030, 40.7080];
writePlan(`${G}/034-new-york-evacuation`, {
  bbox: [-74.0150, 40.6730, -73.9600, 40.7140],
  emblem: {
    works: [{ ...lines, width: 70 }, { side: 'held', path: [[-73.9845, 40.6775], [-73.9785, 40.6825], [-73.9725, 40.6875], [-73.9680, 40.6930]], width: 60, id: 'british-trenches', name: 'British siege trenches, dug closer each day' }],
    units: [
      unit('held', 'infantry', [-73.9690, 40.6830], 1600, 300, 315, 'howe', 'Howe’s army before the lines'),
      unit('usa', 'light', [-73.9790, 40.6875], 1200, 80, 135, 'mifflin', 'Mifflin’s rearguard, keeping the campfires burning'),
      { side: 'usa', type: 'ships', at: [-73.9990, 40.7060], width: 450, depth: 550, facing: 300, count: 8, rows: 2, id: 'glover-boats', name: 'John Glover’s Marblehead men row the army across' },
    ],
    arrows: [
      { side: 'usa', path: [[-73.9820, 40.6900], [-73.9890, 40.6960], [-73.9935, 40.7015]], width: 140, style: 'dashed', id: 'to-the-ferry', name: 'The army leaves the lines for the Brooklyn ferry' },
      { side: 'usa', path: [FERRY, [-73.9985, 40.7065], LANDING], width: 160, id: 'crossing', name: '9,000 men cross the East River, night of 29 to 30 August' },
    ],
  },
  markers: {
    'new-york-evacuation-washington': mk([-73.9895, 40.7055], 'Washington', 'Leaves on the last boat', 'usa'),
    'new-york-evacuation-mifflin': mk([-73.9720, 40.6935], 'Mifflin', 'Called in too early, sent back', 'usa'),
    'new-york-evacuation-manhattan': mk([-74.0085, 40.7110], 'Manhattan', 'All ashore by 7 a.m.', 'usa', 'landmark'),
  },
});
console.log('long island plans written');
