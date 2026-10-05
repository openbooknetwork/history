// Salamanca, 22 July 1812 (Battle of Salamanca article). Marmont holds the Greater Arapile and marches his divisions
// west along the long side of an L-shaped ridge; Wellington's army lies behind the inner L north of the valley.
// Frame: origin on the Greater Arapile, u west along the French march, w north from the French towards the allies.
import { frame, writePlan } from './lib.mjs';

const f = frame([-5.6195, 40.8815], 270), P = f.p, FR = f.face(90), AL = f.face(270), WEST = f.face(0), EAST = f.face(180);
const G = 'pages/070-peninsula/070-salamanca';
const bbox = f.box([[-3200, -3200], [6600, 3600]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : AL, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, ...(color ? { color } : {}), label, ...(note ? { note } : {}) });
const greater = id => ({ [`${id}-greater`]: mark(-900, -150, 'Greater Arapile', null, null, 'mountain') });
const hills = greater;

// the pieces that stay put for a while
const bonet = unit('france', 'infantry', 400, -350, 700, 200, 'bonet', 'Bonet’s division by the Greater Arapile, 6,400');
const guns = unit('france', 'artillery', 0, 0, 450, 100, 'arapile-guns', 'A battery of 40 guns on the Greater Arapile', { count: 8 });
const foyFerey = unit('france', 'infantry', -500, 1700, 1600, 220, 'foy-ferey', 'Foy’s and Ferey’s divisions on the short side of the French L, 10,300', { facing: WEST });
const reserve = unit('france', 'infantry', 1300, -1300, 1000, 220, 'sarrut-boyer', 'Sarrut’s division and Boyer’s dragoons in reserve');
const shortSide = unit('britain', 'infantry', 900, 2500, 1400, 220, 'campbell-alten', 'The 1st and Light Divisions on the short side of the allied L', { facing: EAST });
const pack = unit('britain', 'infantry', 650, 1000, 400, 150, 'pack', 'Pack’s Portuguese brigade, 2,600');

// --- overview: Ciudad Rodrigo, Badajoz, Almaraz, the manoeuvres along the Douro and the Tormes ---
writePlan(`${G}/010-salamanca`, {
  routes: {
    'wellington-badajoz-1812': { name: 'Wellington moves south to Badajoz, March 1812',
      path: [[-6.53, 40.6], [-7.08, 40.35], [-7.49, 39.82], [-7.43, 39.29], [-7.16, 38.88], [-6.97, 38.88]] },
    'wellington-salamanca-1812': { name: 'Wellington advances on Salamanca, April to June 1812', offset: 6,
      path: [[-6.97, 38.88], [-7.16, 38.88], [-7.43, 39.29], [-7.49, 39.82], [-7.08, 40.35], [-6.53, 40.6], [-6.05, 40.75], [-5.66, 40.96]] },
    'hill-almaraz-1812': { name: 'Hill destroys the bridge at Almaraz, May 1812',
      path: [[-6.34, 38.92], [-6.0, 39.25], [-5.67, 39.81]] },
    'marmont-1812': { name: 'Marmont crosses the Tormes at Huerta, July 1812',
      path: [[-5.0, 41.5], [-5.2, 41.25], [-5.38, 40.98], [-5.5, 40.87], [-5.6, 40.875]] },
    'wellington-tormes-1812': { name: 'Wellington marches to the Arapiles, July 1812', style: 'dashed',
      path: [[-5.2, 41.4], [-5.45, 41.12], [-5.63, 40.97], [-5.645, 40.9]] },
  },
  markers: {
    'salamanca-ciudad-rodrigo': { lnglat: [-6.53, 40.6], icon: 'flag', color: 'britain', label: 'Ciudad Rodrigo', note: 'Stormed, 19 January 1812' },
    'salamanca-badajoz': { lnglat: [-6.97, 38.88], icon: 'flag', color: 'britain', label: 'Badajoz', note: 'Stormed, 6 April 1812' },
    'salamanca-almaraz': { lnglat: [-5.67, 39.81], icon: 'bridge', color: 'britain', label: 'Almaraz', note: 'Bridge destroyed, May 1812' },
    'salamanca-forts': { lnglat: [-5.664, 40.962], icon: 'flag', color: 'britain', label: 'Salamanca', note: 'The forts surrender, 27 June 1812' },
  },
});

// --- morning to afternoon: Marmont strings out his divisions westward, the 3rd Division comes down from Aldeatejada ---
writePlan(`${G}/020-salamanca-manoeuvre`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', 4700, -150, 250, 900, 'thomieres', 'Thomières’s division leading the march west, 4,300', { facing: WEST }),
      unit('france', 'cavalry', 5600, -650, 200, 500, 'curto', 'Curto’s light cavalry, 1,900', { facing: WEST }),
      unit('france', 'infantry', 3200, -150, 250, 900, 'maucune', 'Maucune’s division on the march, 5,000', { facing: WEST }),
      unit('france', 'infantry', 1900, -500, 300, 1000, 'brenier-clauzel', 'Brenier’s and Clauzel’s divisions following, 10,600', { facing: WEST }),
      bonet, guns, reserve, foyFerey,
      unit('britain', 'infantry', 5900, 2300, 300, 1000, 'pakenham', 'Pakenham’s 3rd Division and D’Urban’s Portuguese cavalry, coming up from Salamanca', { facing: 180 }),
      unit('britain', 'infantry', 3300, 1300, 1100, 220, 'leith', 'Leith’s 5th Division, hidden behind the ridge, 6,700'),
      unit('britain', 'infantry', 1700, 1250, 900, 220, 'cole', 'Cole’s 4th Division near Los Arapiles, 5,200'),
      unit('britain', 'cavalry', 4200, 1900, 600, 160, 'le-marchant', 'Le Marchant’s heavy cavalry brigade, 1,000'),
      unit('britain', 'infantry', 2500, 2400, 1600, 220, 'clinton-hope', 'The 6th and 7th Divisions in second line, 10,600'),
      shortSide,
    ],
    arrows: [
      arrow('france', [[300, -800], [1900, -1000], [3600, -850], [5200, -800]], 140, 'french-march', 'Marmont sends his divisions west along the ridge'),
      arrow('britain', [[5900, 3500], [5900, 2900]], 140, 'pakenham-march', 'The 3rd Division marches to the western end of the valley'),
    ],
  },
  markers: {
    'salamanca-manoeuvre-marmont': mark(-400, -900, 'Marmont', 'Takes the dust for a retreat', 'france'),
    'salamanca-manoeuvre-village': mark(2350, 1900, 'Los Arapiles', null, null, 'house'),
    ...hills('salamanca-manoeuvre'),
  },
});

// --- late afternoon: the 3rd Division breaks Thomières, Leith beats Maucune's squares, Le Marchant's charge ---
writePlan(`${G}/030-salamanca-attack`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', 5000, -700, 700, 220, 'thomieres', 'Thomières’s division, routed'),
      unit('france', 'square', 3500, -200, 180, 180, 'maucune', 'Maucune’s division in squares'),
      unit('france', 'square', 3050, -250, 180, 180, 'maucune', 'Maucune’s division in squares'),
      unit('france', 'infantry', 2100, -600, 800, 220, 'brenier-clauzel', 'Brenier’s and Clauzel’s divisions'),
      bonet, guns, reserve,
      unit('britain', 'infantry', 4900, 0, 900, 200, 'pakenham', 'Pakenham’s 3rd Division in line, two deep'),
      unit('britain', 'infantry', 3300, 300, 1100, 200, 'leith', 'Leith’s 5th Division in line'),
      unit('britain', 'cavalry', 2350, -1300, 500, 160, 'le-marchant', 'Le Marchant’s brigade among the broken French battalions', { facing: f.face(135) }),
      unit('britain', 'infantry', 1100, 700, 900, 220, 'cole', 'Cole’s 4th Division, driven back'),
      pack,
    ],
    arrows: [
      arrow('britain', [[5700, 1200], [5300, 500], [5050, -350]], 130, 'pakenham-attack', 'The 3rd Division attacks the head of the French column'),
      arrow('britain', [[3300, 1200], [3300, 700], [3280, -50]], 130, 'leith-attack', 'The 5th Division beats Maucune in a musketry duel'),
      arrow('britain', [[3900, 1600], [3500, 400], [3050, -450], [2700, -850]], 120, 'le-marchant-charge', 'Le Marchant’s charge breaks eight battalions'),
      arrow('britain', [[1200, 1000], [700, 450], [450, -100]], 110, 'cole-attack', 'Cole attacks Bonet and is driven back'),
      arrow('britain', [[600, 900], [300, 350], [80, 120]], 90, 'pack-attack', 'Pack’s Portuguese climb the Greater Arapile and are repulsed'),
    ],
    clashes: [P(5000, -250), P(3300, -50), P(450, -150), { at: P(100, 150), size: 110 }],
  },
  markers: {
    'salamanca-attack-thomieres': mark(5500, -1300, 'Thomières', 'Killed', 'france', 'skull'),
    'salamanca-attack-le-marchant': mark(2200, -1700, 'Le Marchant', 'Killed leading a squadron', 'britain', 'skull'),
    'salamanca-attack-marmont': mark(-500, -900, 'Marmont', 'Wounded by a shell', 'france', 'skull'),
    ...hills('salamanca-attack'),
  },
});

// --- evening: Clauzel's counterattack on Cole and the 6th Division, Spry's Portuguese, the 1st and 7th come over ---
writePlan(`${G}/040-salamanca-clauzel`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', 1300, 900, 900, 220, 'clauzel', 'Clauzel’s division, counterattacking'),
      unit('france', 'infantry', 500, 800, 700, 220, 'bonet', 'Bonet’s division, counterattacking'),
      unit('france', 'cavalry', 2200, 700, 500, 150, 'boyer', 'Boyer’s dragoons, 1,500'),
      unit('france', 'infantry', 3000, -700, 800, 220, 'sarrut', 'Sarrut’s division, shoring up the broken left'),
      guns, foyFerey,
      unit('britain', 'infantry', 1400, 1700, 800, 200, 'cole', 'The survivors of Cole’s 4th Division'),
      unit('britain', 'infantry', 1600, 2200, 1200, 220, 'clinton', 'Clinton’s 6th Division in second line, 5,500'),
      unit('britain', 'infantry', 2650, 1100, 350, 150, 'spry', 'Spry’s Portuguese brigade of the 5th Division', { facing: EAST }),
      unit('britain', 'infantry', 3800, 300, 1300, 220, 'leith-pakenham', 'The 3rd and 5th Divisions after breaking the French left'),
      unit('britain', 'infantry', 1100, 3100, 900, 200, 'first', 'The 1st Division, moving to the centre', { facing: f.face(225) }),
      unit('britain', 'infantry', 2900, 2700, 900, 200, 'seventh', 'The 7th Division, moving to the centre', { facing: f.face(135) }),
      pack,
    ],
    arrows: [
      arrow('france', [[1300, 0], [1350, 900], [1450, 1650]], 140, 'clauzel-attack', 'Clauzel and Bonet strike Cole and the 6th Division'),
      arrow('britain', [[2900, 1300], [2300, 1050], [1800, 950]], 110, 'spry-attack', 'Spry’s brigade attacks the French flank'),
      arrow('britain', [[500, 3500], [1000, 3200]], 100, 'first-move', 'Wellington brings over the 1st Division'),
      arrow('britain', [[3700, 3300], [3100, 2800]], 100, 'seventh-move', 'Wellington brings over the 7th Division'),
    ],
    clashes: [P(1400, 1550), P(1950, 1000)],
  },
  markers: {
    'salamanca-clauzel-clauzel': mark(900, -300, 'Clauzel', 'Takes command and counterattacks', 'france'),
    'salamanca-clauzel-beresford': mark(3300, 1900, 'Beresford', 'Sends Spry’s brigade', 'britain'),
    ...greater('salamanca-clauzel'),
  },
});

// --- dusk: Ferey's line on the wooded hillside covers the retreat, the 6th Division attacks it ---
writePlan(`${G}/050-salamanca-ferey`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', -900, -1500, 1300, 120, 'ferey', 'Ferey’s seven battalions in a line three deep, along the hillside', { facing: 330, bow: 150 }),
      unit('france', 'square', -100, -1850, 160, 160, 'ferey-squares', 'Battalions in square covering Ferey’s flanks'),
      unit('france', 'square', -1700, -1050, 160, 160, 'ferey-squares', 'Battalions in square covering Ferey’s flanks'),
      unit('france', 'artillery', -900, -1700, 250, 80, 'ferey-guns', 'Ferey’s divisional battery', { count: 4, facing: 330 }),
      unit('france', 'infantry', -2300, -2300, 800, 200, 'foy', 'Foy’s division, covering the retreat', { facing: WEST }),
      unit('britain', 'infantry', -500, -650, 1300, 220, 'clinton', 'Clinton’s 6th Division: Hulse’s and Hinde’s brigades, then Rezende’s Portuguese', { facing: 150 }),
      unit('britain', 'infantry', 700, -1700, 900, 220, 'leith', 'Leith’s 5th Division, pressing the French left', { facing: EAST }),
      unit('britain', 'infantry', 1000, 500, 1200, 220, 'reserve-divisions', 'The 1st, 4th and 7th Divisions after the counterattack'),
    ],
    arrows: [
      arrow('britain', [[-450, -250], [-550, -800], [-750, -1250]], 140, 'clinton-attack', 'The 6th Division attacks Ferey’s line in the dusk'),
      arrow('britain', [[1000, -1800], [400, -1700], [-150, -1600]], 120, 'leith-flank', 'The 5th Division presses Ferey’s left'),
      arrow('france', [[-1500, -1900], [-2400, -2700], [-3150, -3100]], 160, 'french-retreat', 'The French retreat through the woods towards Alba de Tormes', 'dashed'),
    ],
    clashes: [P(-800, -1300), P(-200, -1650)],
  },
  markers: {
    'salamanca-ferey-ferey': mark(-1500, -2500, 'Ferey', 'Killed by a round shot', 'france', 'skull'),
    'salamanca-ferey-hulse': mark(-700, 350, 'Hulse’s brigade', '11th and 61st Foot lose 706 men', 'britain', 'swords'),
    'salamanca-ferey-foy': mark(-2700, -1700, 'Foy', 'Covers the retreat', 'france'),
    ...greater('salamanca-ferey'),
  },
});

console.log('salamanca: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(2500, 0)));
