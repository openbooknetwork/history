// Acre, 20 March to 20 May 1799. The old city stands on a peninsula, closed by land walls on the north and east.
// The French camp on Tell al-Fukhar, 1.1 km east of the north-east corner, and attack that corner. The walls follow
// the coast the map draws (npx harita coast Israel), which runs a little east of the real one.
// Frame: origin on the north-east corner of the walls, u north, w east.
import { frame, writePlan } from './lib.mjs';

const f = frame([35.0735, 32.9262], 0), P = f.p;
const G = 'pages/030-egypt/040-acre';
const bbox = f.box([[-1500, -900], [600, 1500]], 0);
const walls = { side: 'ottoman', path: f.path([[0, -617], [0, 0], [-818, 140]]), width: 25, id: 'walls', name: 'The land walls of Acre, strengthened by Jezzar Pasha' };
const trenches = { side: 'france', path: f.path([[-270, 1060], [-150, 820], [-60, 660], [-110, 470], [30, 330]]), width: 18, id: 'trenches', name: 'French trenches' };
const parallel = { side: 'france', path: f.path([[260, 160], [70, 260], [-150, 330], [-420, 380]]), width: 18, id: 'trenches', name: 'French trenches' };
const camp = { side: 'france', type: 'camp', at: P(-287, 1149), width: 350, depth: 260, facing: 270, id: 'camp', name: 'French camp on Tell al-Fukhar, later called Napoleon’s Hill' };
const smith = { side: 'britain', type: 'ships', at: P(-1250, -100), width: 40, depth: 250, count: 2, rows: 2, facing: 315, id: 'smith', name: 'Tigre and Theseus under Sidney Smith' };
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: from Cairo into Syria ---
writePlan(`${G}/010-acre`, {
  routes: {
    'bonaparte-syria-1799': { name: 'Bonaparte’s march from Cairo into Syria, 10 February to 18 March 1799',
      path: [[31.25, 30.05], [31.56, 30.42], [31.93, 30.78], [32.6, 30.95], [33.8, 31.13], [34.46, 31.5], [34.75, 32.05], [34.88, 32.45], [34.99, 32.8], [35.08, 32.92]] },
  },
  markers: {
    'acre-cairo': { lnglat: [31.26, 30.05], icon: 'flame', color: 'ottoman', label: 'Cairo', note: 'Revolt, 21 and 22 October 1798' },
    'acre-el-arish': { lnglat: [33.8, 31.13], icon: 'flag', color: 'france', label: 'El Arish', note: 'Surrenders, 19 February 1799' },
    'acre-gaza': { lnglat: [34.46, 31.5], icon: 'flag', color: 'france', label: 'Gaza', note: 'Taken, 25 February' },
    'acre-jaffa': { lnglat: [34.75, 32.05], icon: 'skull', color: 'ottoman', label: 'Jaffa', note: 'Stormed 7 March, prisoners shot' },
  },
});

// --- March and April: the siege lines and the first assaults ---
writePlan(`${G}/020-acre-siege`, {
  bbox,
  emblem: {
    works: [walls, trenches, parallel],
    units: [
      camp,
      unit('france', 'infantry', -80, 560, 300, 110, 255, 'assault', 'French assault troops in the trenches'),
      unit('france', 'artillery', 70, 360, 140, 40, 250, 'field-guns', 'French field guns, no siege artillery', { count: 4 }),
      unit('ottoman', 'infantry', -200, -230, 380, 200, 45, 'garrison', 'Garrison under Jezzar Pasha, about 5,000'),
      unit('ottoman', 'artillery', -40, -120, 240, 40, 45, 'wall-guns', 'Guns placed by Phélippeaux, among them the captured French siege guns', { count: 5 }),
      smith,
    ],
    arrows: [
      arrow('france', [[-60, 470], [-20, 260], [-10, 70]], 110, 'assaults', 'French assaults on the north-east corner, March and April'),
    ],
    clashes: [{ at: P(0, 40), size: 120 }],
  },
  markers: {
    'acre-siege-bonaparte': mark(-520, 1149, 'Bonaparte', 'Camp on Tell al-Fukhar', 'france'),
    'acre-siege-jezzar': mark(-560, -170, 'Jezzar Pasha', 'About 5,000 men', 'ottoman'),
    'acre-siege-phelippeaux': mark(-90, -560, 'Phélippeaux', 'Mounts the captured guns', 'ottoman'),
    'acre-siege-smith': mark(-1430, -100, 'Sidney Smith', 'Tigre and Theseus', 'britain'),
  },
});

// --- May: the breach and the second wall ---
writePlan(`${G}/030-acre-breach`, {
  bbox,
  emblem: {
    works: [walls, trenches, parallel,
      { side: 'ottoman', path: f.path([[-20, -330], [-110, -180], [-230, -60], [-290, 10]]), width: 22, id: 'inner-wall', name: 'Second wall built behind the breach by Farhi and Phélippeaux' }],
    units: [
      camp,
      unit('france', 'artillery', 160, 300, 160, 45, 235, 'siege-guns', 'Siege guns landed by Perrée at Jaffa, seven pieces', { count: 7 }),
      unit('france', 'infantry', 70, 170, 60, 140, 225, 'columns', 'French assault columns'),
      unit('france', 'infantry', -60, 230, 60, 140, 250, 'columns', 'French assault columns'),
      unit('ottoman', 'infantry', -330, -380, 260, 130, 45, 'garrison', 'Garrison, with British sailors and marines, behind the second wall'),
      unit('ottoman', 'infantry', -480, -180, 200, 100, 45, 'rhodes', 'Ottoman reinforcements from Rhodes'),
      smith,
    ],
    arrows: [
      arrow('france', [[140, 260], [60, 120], [5, 20]], 100, 'storm', 'The French storm the breach, 8 May'),
      arrow('ottoman', [[-1150, -650], [-850, -400], [-560, -220]], 80, 'landing', 'Ottoman reinforcements from Rhodes land in the harbour'),
    ],
    clashes: [{ at: P(0, 0), size: 130 }, { at: P(-60, -120), size: 90 }],
  },
  markers: {
    'acre-breach-breach': mark(300, -250, 'The breach', 'Stormed 8 May', 'france', 'swords'),
    'acre-breach-wall': mark(-120, -620, 'Second wall', 'Built by Farhi and Phélippeaux', 'ottoman', 'flag'),
    'acre-breach-rhodes': mark(-1150, -800, 'Reinforcements', 'From Rhodes', 'ottoman', 'ship'),
    'acre-breach-camp': mark(-520, 1149, 'French camp', 'Plague, about 2,000 dead', 'france', 'skull'),
  },
});

// --- the retreat to Cairo ---
writePlan(`${G}/040-acre-retreat`, {
  routes: {
    'bonaparte-retreat-1799': { name: 'The retreat from Acre to Cairo, 20 May to 14 June 1799',
      path: [[35.08, 32.92], [34.99, 32.82], [34.92, 32.61], [34.75, 32.05], [34.46, 31.5], [33.8, 31.13], [32.6, 30.95], [31.93, 30.78], [31.56, 30.42], [31.25, 30.05]] },
    'jaffa-damietta-1799': { name: 'Plague patients shipped from Jaffa to Damietta', style: 'dashed',
      path: [[34.74, 32.06], [33.8, 31.9], [32.6, 31.65], [31.82, 31.45]] },
  },
  markers: {
    'acre-retreat-tabor': { lnglat: [35.39, 32.687], icon: 'swords', color: 'france', label: 'Mount Tabor', note: 'Ottoman relief army routed, 16 April' },
    'acre-retreat-jaffa': { lnglat: [34.75, 32.05], icon: 'skull', color: 'france', label: 'Jaffa', note: 'Plague hospital, sick sent on' },
    'acre-retreat-gaza': { lnglat: [34.46, 31.5], icon: 'flag', color: 'france', label: 'Gaza', note: 'Spared on the retreat' },
    'acre-retreat-cairo': { lnglat: [31.26, 30.05], icon: 'flag', color: 'france', label: 'Cairo', note: 'The army returns, 14 June' },
  },
});

console.log('acre: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(-100, -50)));
