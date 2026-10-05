// Ligny, 16 June 1815. The Prussians hold the villages along the Ligny stream from Wagnelée through Saint-Amand
// and Ligny to Sombreffe, the French attack from Fleurus to the south. Overview: the French crossing at Charleroi
// on 15 June and the armies converging on Ligny and Quatre Bras.
// Frame: origin at Ligny church, u north and w east, so E(x, y) places a point x metres east and y metres north.
// Village positions are approximate, to a hundred metres or two.
import { frame, writePlan } from './lib.mjs';

const f = frame([4.5814, 50.5203], 0), E = (x, y) => f.p(y, x);
const G = 'pages/110-hundred-days/020-ligny';
const bbox = f.box([[-4400, -4500], [3000, 3500]], 0);
const water = [{ path: [[4.515, 50.502], [4.53, 50.51], [4.545, 50.517], [4.556, 50.5215], [4.568, 50.521], [4.5814, 50.5195], [4.593, 50.522], [4.603, 50.527], [4.612, 50.533]], width: 25, id: 'ligny-stream', name: 'The Ligny stream' }];
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const unit = (side, type, x, y, width, depth, facing, id, name, extra = {}) => ({ side, type, at: E(x, y), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts.map(([x, y]) => E(x, y)), width, id, name, ...(style ? { style } : {}) });
const mark = (x, y, label, note, color, icon = 'user') => ({ lnglat: E(x, y), icon, color, label, note });

// --- overview: 15 June, the crossing at Charleroi ---
writePlan(`${G}/010-ligny`, {
  routes: {
    'napoleon-charleroi-1815': { name: 'The Army of the North crosses the frontier at Thuin and the Sambre at Charleroi, 15 June 1815',
      path: [[4.2, 50.25], [4.29, 50.34], [4.44, 50.41], [4.5, 50.45], [4.55, 50.48]] },
    'zieten-ligny-1815': { name: 'Zieten’s I Corps falls back from the Sambre to Fleurus and Ligny, 15 June 1815', style: 'dashed', offset: 6,
      path: [[4.46, 50.41], [4.5, 50.45], [4.55, 50.48], [4.57, 50.51]] },
    'prussians-sombreffe-1815': { name: 'Pirch’s and Thielmann’s corps march from Namur to Sombreffe, 15 – 16 June 1815',
      path: [[4.87, 50.47], [4.78, 50.5], [4.69, 50.52], [4.61, 50.53]] },
    'ney-frasnes-1815': { name: 'Ney with the left wing advances up the Brussels road towards Quatre Bras, 15 June 1815',
      path: [[4.44, 50.41], [4.43, 50.47], [4.44, 50.54], [4.45, 50.56]] },
    'wellington-quatre-bras-1815': { name: 'Wellington’s army marches from Brussels and Nivelles to Quatre Bras, 16 June 1815',
      path: [[4.35, 50.84], [4.4, 50.72], [4.45, 50.61], [4.453, 50.58]] },
  },
  markers: {
    'ligny-charleroi': { lnglat: [4.44, 50.41], icon: 'flag', color: 'france', label: 'Charleroi', note: 'Taken on 15 June' },
    'ligny-brussels': { lnglat: [4.35, 50.85], icon: 'flag', color: 'britain', label: 'Brussels', note: 'Wellington’s headquarters' },
    'ligny-namur': { lnglat: [4.87, 50.47], icon: 'flag', color: 'prussia', label: 'Namur', note: 'Blücher’s headquarters' },
    'ligny-quatre-bras': { lnglat: [4.4533, 50.5714], icon: 'flag', color: 'britain', label: 'Quatre Bras', note: 'Held by Saxe-Weimar’s Nassauers' },
  },
});

// --- 14:30 to 19:00: the fight for the villages ---
writePlan(`${G}/020-ligny-villages`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('france', 'infantry', -2250, -350, 1500, 350, 330, 'vandamme', 'Vandamme’s III Corps with Girard’s division, attacking Saint-Amand'),
      unit('france', 'infantry', -100, -450, 1300, 350, 5, 'gerard', 'Gérard’s IV Corps, attacking Ligny'),
      unit('france', 'infantry', -3400, -1300, 900, 300, 340, 'young-guard', 'Duhesme’s Young Guard, sent to the left'),
      unit('france', 'infantry', -900, -2500, 1200, 400, 15, 'guard', 'The Old Guard and the Guard cavalry in reserve before Fleurus'),
      unit('france', 'cavalry', 2600, -1700, 1600, 350, 59, 'grouchy', 'Grouchy’s cavalry facing Sombreffe and Tongrinne'),
      unit('france', 'infantry', -3900, -2300, 400, 1300, 60, 'derlon', 'd’Erlon’s I Corps, seen at 17:00, turns back towards Quatre Bras'),
      unit('prussia', 'infantry', -1850, 500, 1300, 300, 150, 'zieten', 'Zieten’s I Corps in Saint-Amand and Ligny'),
      unit('prussia', 'infantry', 100, 450, 1100, 300, 185, 'zieten', 'Zieten’s I Corps in Saint-Amand and Ligny'),
      unit('prussia', 'infantry', -1900, 2050, 1600, 400, 172, 'pirch', 'Pirch’s II Corps behind the villages, by Brye'),
      unit('prussia', 'infantry', 2200, 0, 1800, 400, 239, 'thielmann', 'Thielmann’s III Corps, from Sombreffe to Tongrinne'),
    ],
    arrows: [
      arrow('france', [[-2250, -180], [-2150, 50], [-2080, 250]], 160, 'vandamme-attack', 'Vandamme’s attacks on Saint-Amand'),
      arrow('france', [[-100, -250], [-50, 50], [50, 280]], 160, 'gerard-attack', 'Gérard’s attacks on Ligny'),
      arrow('prussia', [[-2200, 1800], [-2700, 1400], [-3100, 900]], 160, 'blucher-attack', 'Blücher’s counter-attack on the French left'),
      arrow('france', [[-3300, -1100], [-3200, -400], [-3150, 600]], 150, 'young-guard-attack', 'The Young Guard throws the Prussians back'),
      arrow('france', [[-4000, -2950], [-4300, -3600], [-4500, -4200]], 150, 'derlon-return', 'd’Erlon’s corps marches back towards Quatre Bras', 'dashed'),
    ],
    clashes: [E(-2080, 40), E(0, 30), E(-3150, 800)],
  },
  markers: {
    'ligny-16-napoleon': mark(-2010, -3350, 'Napoleon', 'At the windmill of Naveau, Fleurus', 'france'),
    'ligny-16-blucher': mark(-450, 1600, 'Blücher', 'At the windmill of Bussy', 'prussia'),
    'ligny-16-girard': mark(-1500, -1100, 'Girard', 'Mortally wounded at Saint-Amand', 'france', 'skull'),
  },
});

// --- 19:00 to 22:00: the Guard breaks the Prussian centre ---
writePlan(`${G}/030-ligny-guard`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('france', 'infantry', 150, 750, 1200, 400, 10, 'guard', 'The Old Guard and Gérard’s IV Corps, through Ligny'),
      unit('france', 'cavalry', 1100, 600, 800, 300, 10, 'milhaud', 'Milhaud’s cuirassiers on the right of the Guard'),
      unit('france', 'artillery', -200, -900, 1000, 120, 5, 'guard-artillery', 'The Guard artillery above Ligny, 60 guns', { count: 12 }),
      unit('france', 'infantry', -2250, 300, 1500, 350, 330, 'vandamme', 'Vandamme’s corps and the Young Guard at Saint-Amand'),
      unit('france', 'infantry', -500, -3000, 1200, 350, 20, 'lobau', 'Lobau’s VI Corps arrives east of Fleurus'),
      unit('france', 'cavalry', 2600, -1700, 1600, 350, 59, 'grouchy', 'Grouchy’s cavalry facing Thielmann'),
      unit('prussia', 'infantry', 255, 1600, 2300, 300, 202, 'prussian-line', 'Zieten’s and Pirch’s corps form a new line between Brye and Sombreffe'),
      unit('prussia', 'cavalry', -900, 1200, 700, 250, 150, 'roder', 'Röder’s reserve cavalry of the I Corps'),
      unit('prussia', 'infantry', 2200, 0, 1800, 400, 239, 'thielmann', 'Thielmann’s III Corps holds Sombreffe'),
    ],
    arrows: [
      arrow('france', [[0, -600], [80, 0], [150, 500]], 220, 'guard-assault', 'The Guard storms Ligny'),
      arrow('france', [[950, -500], [1000, 0], [1080, 400]], 180, 'milhaud-charge', 'Milhaud’s cuirassiers charge'),
      arrow('prussia', [[-700, 1100], [-450, 1000], [-200, 950]], 160, 'roder-charge', 'Röder’s counter-charge, led by Blücher'),
      arrow('prussia', [[-400, 2200], [-650, 2600], [-900, 3400]], 200, 'prussian-retreat', 'The Prussians fall back on Tilly', 'dashed'),
    ],
    clashes: [E(-280, 950), E(1100, 820)],
  },
  markers: {
    'ligny-16-blucher-fall': mark(-2100, 1500, 'Blücher', 'His horse is shot and falls on him', 'prussia'),
    'ligny-16-gneisenau': mark(-1900, 2700, 'Gneisenau', 'Takes command, retreat on Tilly', 'prussia'),
  },
});

console.log('ligny: bbox', JSON.stringify(bbox));
