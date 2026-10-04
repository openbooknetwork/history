// Charleston, February to May 1780. The approach page shows the campaign as routes. The siege pages use a
// frame on the hornwork at the centre of the American lines, u east, w south. The map's coastline puts the tip
// of the peninsula about 1.4 km north of the real one and shows only the mouth of the Ashley, so the lines,
// the parallels and the garrison are drawn 1.4 km north of their real places and the Ashley is drawn as a
// river beside them. Fort Moultrie, Fort Johnson and the fleet stay at their real places on the map's coast.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/020-war/050-1780-1781';

writePlan(`${G}/011-charleston-approach`, {
  bbox: [-80.3, 32.5, -79.7, 33.26],
  routes: {
    'clinton-1780': { name: 'Clinton’s army through the sea islands and over the Ashley, February to March 1780',
      path: [[-80.165, 32.58], [-80.1, 32.645], [-80.03, 32.7], [-80.035, 32.765], [-80.075, 32.855], [-80.04, 32.885], [-79.98, 32.86], [-79.95, 32.82]] },
    'arbuthnot-1780': { name: 'Arbuthnot’s squadron runs past Fort Moultrie into the harbour, 8 April', path: [[-79.8, 32.66], [-79.84, 32.73], [-79.863, 32.754], [-79.9, 32.766]] },
    'tarleton-1780': { name: 'Tarleton and Ferguson ride to Monck’s Corner, 14 April', path: [[-79.965, 32.865], [-79.995, 32.98], [-80.013, 33.19]] },
    'cornwallis-1780': { name: 'Cornwallis crosses the Cooper and holds the east bank, 23 April', offset: 6, path: [[-79.995, 32.98], [-79.93, 32.97], [-79.87, 32.9], [-79.875, 32.8]] },
  },
  markers: {
    'charleston-approach-simmons': { lnglat: [-80.165, 32.58], icon: 'anchor', color: 'held', label: 'Simmons Island', note: 'The army ashore by 12 February' },
    'charleston-approach-moncks-corner': { lnglat: [-80.013, 33.196], icon: 'swords', color: 'held', label: 'Monck’s Corner', note: 'American cavalry routed, 14 April' },
    'charleston-approach-moultrie': { lnglat: [-79.857, 32.759], icon: 'castle', color: 'usa', label: 'Fort Moultrie', note: 'Passed by the fleet, 8 April' },
    'charleston-approach-city': { lnglat: [-79.935, 32.79], icon: 'landmark', color: 'usa', label: 'Charleston', note: 'Lincoln’s army behind its lines' },
  },
});

const f = frame([-79.9355, 32.7995], 90), P = f.p;
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const work = (side, pts, width, id, name) => ({ side, path: f.path(pts), width, id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const NORTH = 0, SOUTH = 180;

const ashley = { path: f.path([[-3500, 1100], [-3000, 400], [-2400, -250], [-2250, -1300], [-2450, -2800], [-2900, -3600]]), width: 700, id: 'ashley', name: 'The Ashley River' };
const canal = { path: f.path([[-1850, -80], [-900, -90], [0, -100], [430, -90]]), width: 30, id: 'canal', name: 'The canal in front of the American lines' };
const lines = work('usa', [[-1900, 0], [-1300, -20], [-600, -30], [-150, -40], [150, -30], [450, -10]], 50, 'american-lines', 'The American lines across the neck, where Marion Square is today');
const hornwork = unit('usa', 'camp', -100, 70, 220, 160, 0, 'hornwork', 'The hornwork at the centre of the lines');
const parallels = [
  work('held', [[-1950, -760], [-1100, -750], [-300, -740], [350, -720]], 40, 'first-parallel', 'First British parallel, opened on 1 April, 800 yards from the lines'),
  work('held', [[-1800, -480], [-900, -470], [0, -460], [330, -450]], 40, 'second-parallel', 'Second British parallel'),
  work('held', [[-1600, -230], [-800, -220], [0, -210], [300, -200]], 40, 'third-parallel', 'Third British parallel, at the canal by 6 May'),
];
const garrison = unit('usa', 'infantry', -700, 260, 1600, 130, NORTH, 'garrison', 'Lincoln’s garrison, Continentals and militia, about 5,500');
const besiegers = unit('held', 'infantry', -800, -1150, 1800, 160, SOUTH, 'besiegers', 'Clinton’s army in the siege lines, British and Hessian');

writePlan(`${G}/012-charleston-harbour`, {
  bbox: f.box([[-3800, -3000], [8200, 6000]], 0),
  emblem: {
    water: [ashley, canal],
    works: [lines, ...parallels],
    units: [hornwork, garrison, besiegers,
      unit('usa', 'camp', 7346, 4477, 280, 280, 0, 'fort-moultrie', 'Fort Moultrie on Sullivan’s Island, surrenders on 7 May'),
      unit('held', 'camp', 3322, 5251, 240, 240, 0, 'fort-johnson', 'Fort Johnson, a British battery on James Island'),
      unit('held', 'ships', 3900, 3550, 1600, 450, 300, 'arbuthnot', 'Arbuthnot’s squadron in the harbour', { count: 10, rows: 2 }),
      unit('usa', 'ships', 1650, 1000, 1800, 160, 0, 'whipple', 'Whipple’s ships, sunk across the mouth of the Cooper', { count: 8 }),
      unit('held', 'infantry', 5600, 950, 700, 140, 220, 'cornwallis', 'Cornwallis east of the Cooper from 23 April')],
    arrows: [
      arrow('held', [[9600, 8300], [7400, 5700], [5300, 4450], [4300, 3800]], 140, 'arbuthnot-run', 'Arbuthnot runs 14 ships past Fort Moultrie, 8 April'),
      arrow('held', [[2400, -6000], [4300, -2600], [5400, 450]], 140, 'cornwallis-cross', 'Cornwallis crosses the Cooper and comes down the east bank'),
    ],
  },
  markers: {
    'charleston-harbour-lincoln': mark(-700, 600, 'Lincoln', 'About 5,500 men in the lines', 'usa'),
    'charleston-harbour-clinton': mark(-900, -1550, 'Clinton', 'Opens the siege, 1 April', 'held'),
    'charleston-harbour-arbuthnot': mark(5300, 3000, 'Arbuthnot', 'Into the harbour, 8 April', 'held', 'ship'),
    'charleston-harbour-whipple': mark(1650, 1450, 'Whipple', 'Sinks his ships in the Cooper', 'usa', 'ship'),
  },
});

writePlan(`${G}/013-charleston-surrender`, {
  bbox: f.box([[-2700, -1700], [1300, 1700]], 0),
  emblem: {
    water: [ashley, canal],
    works: [lines, ...parallels],
    units: [hornwork, garrison, besiegers],
    arrows: [
      arrow('held', [[-500, -260], [-350, 950]], 60, 'heated-shot', 'Heated shot fired into the city, 11 May'),
      arrow('held', [[200, -250], [250, 1050]], 60, 'heated-shot', 'Heated shot fired into the city, 11 May'),
      arrow('usa', [[-100, 160], [-100, -380]], 70, 'march-out', 'The garrison marches out of the hornwork and lays down its arms, 12 May'),
    ],
  },
  markers: {
    'charleston-surrender-lincoln': mark(-600, 600, 'Lincoln', 'Surrenders 3,371 men', 'usa', 'flag'),
    'charleston-surrender-fires': mark(350, 1200, 'Charleston', 'Houses burn, 11 May', 'usa', 'flame'),
    'charleston-surrender-clinton': mark(-900, -1450, 'Clinton', 'Refuses the honours of war', 'held'),
  },
});
console.log('charleston: done, lines at', JSON.stringify(P(-700, 0)));
