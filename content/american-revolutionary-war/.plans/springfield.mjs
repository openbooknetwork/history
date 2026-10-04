// Shays' Rebellion at Springfield, 25 January 1787, and Lincoln's march to Petersham, 3 to 4 February.
// Frame on the federal armory on its hill, u east, w south. The rebels' three bodies come from the east (Shays,
// along the road from Palmer), the north (Parsons, from Chicopee) and across the Connecticut (Day, in West
// Springfield); their exact paths are not recorded.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/030-constitution';
const REBELS = '#8d6e63';
const f = frame([-72.58, 42.1084], 90), P = f.p;
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

writePlan(`${G}/011-springfield-arsenal`, {
  bbox: f.box([[-3800, -3800], [3300, 1300]], 0),
  emblem: {
    water: [{ path: f.path([[-1350, -4200], [-1450, -2000], [-1550, 0], [-1620, 1600]]), width: 350, id: 'connecticut', name: 'The Connecticut River' }],
    works: [{ side: 'usa', path: f.path([[330, -90], [330, 130]]), width: 60, id: 'guns', name: 'Shepard’s two cannon, loaded with grapeshot' }],
    units: [
      unit('usa', 'camp', 0, 0, 240, 200, 0, 'armory', 'The federal armory and its arsenal'),
      unit('usa', 'infantry', 230, 20, 520, 90, 90, 'shepard', 'Shepard’s militia, 1,200, armed from the arsenal'),
      unit(REBELS, 'infantry', 950, 60, 160, 520, 270, 'shays', 'Daniel Shays’s men, from the east by the road from Palmer'),
      unit(REBELS, 'infantry', -200, -1500, 160, 420, 180, 'parsons', 'Eli Parsons’s men, from Chicopee in the north'),
      unit(REBELS, 'infantry', -3000, 300, 320, 160, 90, 'day', 'Luke Day’s men in West Springfield, not ready until the 26th'),
    ],
    arrows: [
      arrow(REBELS, [[3100, 450], [1350, 100]], 90, 'shays-advance', 'Shays advances on the armory, expecting Day’s support'),
      arrow(REBELS, [[-300, -3600], [-230, -1800]], 80, 'parsons-advance', 'Parsons comes down from the north'),
      arrow('usa', [[380, 20], [760, 50]], 70, 'grapeshot', 'Warning shots over their heads, then grapeshot'),
      arrow(REBELS, [[1000, -250], [800, -1600], [550, -3200]], 90, 'flight', 'The rebels flee north', 'dashed'),
    ],
    clashes: [{ at: P(680, 60), size: 120 }],
  },
  markers: {
    'springfield-arsenal-shepard': mark(-80, 380, 'Shepard', 'Holds the armory', 'usa'),
    'springfield-arsenal-shays': mark(1250, 500, 'Shays', 'Attacks from the east', 'pending'),
    'springfield-arsenal-day': mark(-3000, 650, 'Luke Day', 'Waits for the 26th', 'pending'),
    'springfield-arsenal-message': mark(-2200, -500, 'Day’s message', 'Intercepted by Shepard’s men', 'usa', 'scroll-text'),
  },
});

writePlan(`${G}/012-springfield-petersham`, {
  bbox: [-72.75, 42.0, -71.65, 42.6],
  routes: {
    'lincoln-1787-west': { name: 'Lincoln marches west from Worcester to Springfield with 3,000 militia, late January 1787', path: [[-71.802, 42.262], [-72.05, 42.2], [-72.33, 42.15], [-72.57, 42.115]] },
    'lincoln-1787-petersham': { name: 'Lincoln follows by Hadley and Pelham and marches through the snow to Petersham, 3 to 4 February', path: [[-72.57, 42.125], [-72.588, 42.341], [-72.403, 42.393], [-72.3, 42.45], [-72.189, 42.489]] },
    'rebels-1787': { name: 'The rebels fall back by Amherst to Petersham', style: 'dashed', offset: 6, path: [[-72.585, 42.13], [-72.52, 42.375], [-72.33, 42.5], [-72.195, 42.49]] },
  },
  markers: {
    'springfield-petersham-worcester': { lnglat: [-71.802, 42.262], icon: 'flag', color: 'usa', label: 'Worcester', note: 'Lincoln’s army gathers, 19 January' },
    'springfield-petersham-amherst': { lnglat: [-72.52, 42.375], icon: 'tent', color: 'pending', label: 'Amherst', note: 'The rebels regroup' },
    'springfield-petersham-pelham': { lnglat: [-72.403, 42.393], icon: 'tent', color: 'usa', label: 'Pelham', note: 'Lincoln arrives, 2 February' },
    'springfield-petersham-petersham': { lnglat: [-72.189, 42.489], icon: 'flag', color: 'usa', label: 'Petersham', note: 'Rebels surprised at dawn, 4 February' },
  },
  show: ['springfield'],
});
console.log('springfield: armory at', JSON.stringify(P(0, 0)));
