// Wagram, 5 – 6 July 1809. The French cross from the east side of the Lobau and face north across the Marchfeld;
// the Austrians hold an arc from the Danube at Aspern through Süssenbrunn and the Wagram plateau behind the
// Russbach to Markgrafneusiedl. The front bends, so places are given as real villages plus metres east and north.
import { writePlan } from './lib.mjs';

const O = [16.55, 48.255];
const kx = 111320 * Math.cos(O[1] * Math.PI / 180), ky = 110540, r5 = x => Math.round(x * 1e5) / 1e5;
// a point moved by metres east and north
const off = ([lon, lat], e = 0, n = 0) => [r5(lon + e / kx), r5(lat + n / ky)];
const G = 'pages/080-fifth-coalition/030-wagram';
const V = {
  aspern: [16.4797, 48.2196], essling: [16.522, 48.2133], enzersdorf: [16.551, 48.2005], sachsengang: [16.588, 48.196],
  raasdorf: [16.564, 48.245], breitenlee: [16.497, 48.243], sussenbrunn: [16.492, 48.2745], aderklaa: [16.534, 48.2855],
  wagram: [16.564, 48.299], baumersdorf: [16.601, 48.283], neusiedl: [16.637, 48.271], grosshofen: [16.622, 48.252],
  glinzendorf: [16.637, 48.245], leopoldau: [16.447, 48.266], gerasdorf: [16.469, 48.295], lobau: [16.53, 48.185],
};
const water = [
  { path: [[16.43, 48.226], [16.452, 48.219], [16.468, 48.215], [16.481, 48.211], [16.493, 48.205], [16.507, 48.199], [16.526, 48.1955], [16.548, 48.1915], [16.57, 48.184], [16.59, 48.172]],
    width: 110, id: 'danube-arm', name: 'An arm of the Danube between the Lobau and the left bank' },
  { path: [[16.548, 48.33], [16.556, 48.312], [16.567, 48.297], [16.585, 48.288], [16.602, 48.281], [16.62, 48.2745], [16.637, 48.267], [16.647, 48.257], [16.652, 48.245], [16.66, 48.232], [16.672, 48.22]],
    width: 50, id: 'russbach', name: 'The Russbach stream, below the Wagram plateau' },
];
const bbox = [16.43, 48.18, 16.7, 48.335];
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const C = (side, at, width, depth, facing, id, name, extra = {}) => unit(side, 'infantry', at, width, depth, facing, id, name, extra);
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: the crossing from the east side of the Lobau and the advance onto the Marchfeld, 4 – 5 July ---
writePlan(`${G}/010-wagram`, {
  routes: {
    'oudinot-wagram-1809': { name: 'Oudinot’s II Corps crosses first and advances on Baumersdorf, 4 – 5 July 1809',
      path: [[16.565, 48.178], [16.58, 48.19], [16.592, 48.205], [16.6, 48.235], [16.6, 48.262]] },
    'massena-wagram-1809': { name: 'Masséna’s IV Corps takes Gross-Enzersdorf and moves on Aderklaa, 5 July 1809',
      path: [[16.555, 48.18], [16.551, 48.198], [16.53, 48.22], [16.51, 48.245], [16.515, 48.265]] },
    'davout-wagram-1809': { name: 'Davout’s III Corps crosses and advances on Glinzendorf, 5 July 1809',
      path: [[16.575, 48.175], [16.6, 48.19], [16.62, 48.215], [16.633, 48.24]] },
    'nordmann-wagram-1809': { name: 'Nordmann’s advance guard falls back to Markgrafneusiedl, 5 July 1809', style: 'dashed',
      path: [[16.58, 48.215], [16.61, 48.24], [16.625, 48.255], [16.637, 48.268]] },
    'klenau-wagram-1809': { name: 'Klenau’s VI Corps falls back to the west, 5 July 1809', style: 'dashed',
      path: [[16.53, 48.225], [16.5, 48.238], [16.47, 48.25], [16.45, 48.262]] },
  },
  markers: {
    'wagram-lobau': mark(V.lobau, 'Lobau', 'French base, 124 guns', 'france', 'flag'),
    'wagram-enzersdorf': mark(off(V.enzersdorf, 0, 150), 'Gross-Enzersdorf', 'Burned and stormed, 5 July', 'france', 'flame'),
    'wagram-sachsengang': mark(V.sachsengang, 'Sachsengang', 'Castle surrenders, 8 am', 'france', 'castle'),
    'wagram-plateau': mark(off(V.wagram, 3500, 1500), 'Wagram plateau', 'Austrian main position', 'austria', 'flag'),
  },
});

// --- the evening attacks on the Russbach line, 5 July ---
writePlan(`${G}/020-wagram-evening`, {
  bbox,
  emblem: {
    water,
    units: [
      C('austria', [16.45, 48.255], 2200, 500, 150, 'klenau', 'VI Corps under Klenau'),
      C('austria', [16.47, 48.295], 2500, 600, 150, 'kollowrat', 'III Corps under Kollowrat'),
      unit('austria', 'cavalry', [16.53, 48.306], 2500, 600, 175, 'liechtenstein', 'Liechtenstein’s reserve, grenadiers and cavalry'),
      C('austria', [16.566, 48.306], 2400, 600, 165, 'bellegarde', 'I Corps under Bellegarde, about 22,000'),
      C('austria', [16.605, 48.293], 2600, 600, 160, 'hohenzollern', 'II Corps under Hohenzollern, with 68 guns'),
      C('austria', [16.645, 48.278], 2600, 600, 170, 'rosenberg', 'IV Corps under Rosenberg, with Nordmann’s advance guard'),
      C('france', [16.5, 48.246], 3000, 600, 340, 'massena', 'IV Corps under Masséna'),
      C('rhine', [16.535, 48.272], 2000, 500, 10, 'bernadotte', 'IX Corps of Saxons under Bernadotte'),
      C('client', [16.567, 48.27], 2400, 600, 0, 'eugene', 'Army of Italy under Eugène, with MacDonald’s and Grenier’s corps'),
      C('france', [16.603, 48.266], 2400, 600, 0, 'oudinot', 'II Corps under Oudinot'),
      C('france', [16.632, 48.246], 2400, 600, 340, 'davout', 'III Corps under Davout'),
      C('france', [16.565, 48.237], 2400, 700, 0, 'guard', 'Imperial Guard and the cavalry reserve, around Raasdorf'),
    ],
    arrows: [
      arrow('france', [[16.6, 48.27], [16.601, 48.286]], 220, 'oudinot-attack', 'Oudinot attacks Baumersdorf and is thrown back'),
      arrow('client', [[16.572, 48.274], [16.575, 48.287], [16.578, 48.299]], 240, 'macdonald-attack', 'MacDonald climbs the plateau east of Deutsch-Wagram'),
      arrow('rhine', [[16.537, 48.276], [16.55, 48.29], [16.56, 48.298]], 220, 'bernadotte-attack', 'The Saxons attack Deutsch-Wagram at about 9 pm'),
      arrow('france', [[16.635, 48.25], [16.639, 48.27]], 220, 'davout-attack', 'Davout attacks Markgrafneusiedl and stops at 10 pm'),
    ],
    clashes: [{ at: [16.601, 48.288], size: 300 }, { at: [16.578, 48.301], size: 300 }, { at: [16.56, 48.3], size: 300 }, { at: [16.641, 48.273], size: 300 }],
  },
  markers: {
    'wagram-eve-charles': mark([16.56, 48.327], 'Archduke Charles', 'Lightly wounded', 'austria'),
    'wagram-eve-macdonald': mark([16.56, 48.259], 'MacDonald', 'Driven back', 'client'),
    'wagram-eve-oudinot': mark([16.598, 48.255], 'Oudinot', 'Thrown back', 'france'),
    'wagram-eve-bernadotte': mark([16.505, 48.284], 'Bernadotte', 'Saxons break', 'rhine'),
    'wagram-eve-davout': mark([16.628, 48.233], 'Davout', 'Stops at 10 pm', 'france'),
  },
});

// --- the morning of 6 July: Rosenberg repulsed, Aderklaa lost and retaken, Klenau on the French rear ---
writePlan(`${G}/030-wagram-aderklaa`, {
  bbox,
  emblem: {
    water,
    units: [
      C('austria', [16.5, 48.222], 2400, 500, 150, 'klenau', 'VI Corps under Klenau, about 14,000, in Aspern and Essling'),
      C('austria', [16.488, 48.259], 2500, 600, 120, 'kollowrat', 'III Corps under Kollowrat, between Süssenbrunn and Breitenlee'),
      unit('austria', 'cavalry', [16.512, 48.287], 2400, 600, 150, 'liechtenstein', 'Liechtenstein’s grenadiers and cavalry'),
      C('austria', [16.547, 48.294], 2400, 600, 185, 'bellegarde', 'I Corps under Bellegarde, holding Aderklaa'),
      C('austria', [16.605, 48.293], 2600, 600, 160, 'hohenzollern', 'II Corps under Hohenzollern'),
      C('austria', [16.645, 48.278], 2600, 600, 170, 'rosenberg', 'IV Corps under Rosenberg, back on its position'),
      C('france', [16.527, 48.273], 2300, 600, 15, 'massena', 'Masséna’s divisions of Carra Saint-Cyr, Molitor and Legrand'),
      C('france', [16.536, 48.206], 1200, 350, 330, 'boudet', 'Boudet’s division, about 4,600, falling back to the bridges'),
      C('client', [16.567, 48.27], 2400, 600, 0, 'eugene', 'Army of Italy under Eugène'),
      C('france', [16.603, 48.266], 2400, 600, 0, 'oudinot', 'II Corps under Oudinot'),
      C('france', [16.632, 48.247], 2400, 600, 345, 'davout', 'III Corps under Davout'),
      C('france', [16.567, 48.236], 2400, 700, 330, 'guard', 'Imperial Guard and the cavalry reserve'),
    ],
    arrows: [
      arrow('austria', [[16.632, 48.254], [16.64, 48.273]], 220, 'rosenberg-repulsed', 'Rosenberg’s attack at 5 am is thrown back', 'dashed'),
      arrow('austria', [[16.452, 48.262], [16.47, 48.24], [16.485, 48.227]], 240, 'klenau-march', 'Klenau takes Aspern and enters Essling at about 10 am'),
      arrow('austria', [[16.532, 48.29], [16.531, 48.278]], 200, 'aderklaa-counterattack', 'Charles drives the French out of Aderklaa'),
      arrow('rhine', [[16.538, 48.268], [16.548, 48.256], [16.556, 48.244]], 200, 'saxon-flight', 'The Saxons flee towards Raasdorf', 'dashed'),
    ],
    clashes: [{ at: [16.531, 48.282], size: 300 }, { at: [16.516, 48.216], size: 300 }],
  },
  markers: {
    'wagram-morn-massena': mark([16.515, 48.262], 'Masséna', 'From a carriage', 'france'),
    'wagram-morn-bernadotte': mark([16.59, 48.226], 'Bernadotte', 'Dismissed', 'rhine'),
    'wagram-morn-klenau': mark([16.478, 48.212], 'Klenau', 'Takes Aspern, Essling', 'austria'),
    'wagram-morn-rosenberg': mark([16.678, 48.267], 'Rosenberg', 'Repulsed by 6 am', 'austria'),
    'wagram-morn-lobau': mark([16.548, 48.19], 'Lobau batteries', 'Halt Klenau', 'france', 'target'),
  },
});

// --- late morning: Masséna marches south, the grand battery, Nansouty's charge, Davout takes Markgrafneusiedl ---
writePlan(`${G}/040-wagram-grand-battery`, {
  bbox,
  emblem: {
    water,
    units: [
      C('austria', [16.497, 48.222], 2400, 500, 150, 'klenau', 'VI Corps under Klenau, near Essling'),
      C('austria', [16.478, 48.266], 2500, 600, 110, 'kollowrat', 'III Corps under Kollowrat, driven back by the guns'),
      C('austria', [16.505, 48.288], 2200, 600, 140, 'grenadiers', 'Grenadiers of the reserve in squares, with Liechtenstein’s cavalry'),
      C('austria', [16.547, 48.297], 2400, 600, 185, 'bellegarde', 'I Corps under Bellegarde'),
      C('austria', [16.605, 48.293], 2600, 600, 160, 'hohenzollern', 'II Corps under Hohenzollern'),
      C('austria', [16.652, 48.292], 2400, 600, 125, 'rosenberg', 'IV Corps under Rosenberg, forming a new line on the plateau'),
      unit('france', 'artillery', [16.512, 48.269], 2200, 220, 300, 'grand-battery', 'Grand battery under Lauriston, 84 guns by Masséna’s count', { count: 18 }),
      C('france', [16.528, 48.236], 700, 1500, 195, 'massena', 'Masséna’s corps marching south in columns'),
      C('client', [16.545, 48.272], 2000, 600, 300, 'eugene', 'Army of Italy, with MacDonald forming up'),
      C('france', [16.603, 48.266], 2400, 600, 0, 'oudinot', 'II Corps under Oudinot, waiting for orders'),
      C('france', [16.632, 48.261], 1800, 500, 0, 'gudin', 'Gudin’s and Puthod’s divisions of III Corps'),
      C('france', [16.672, 48.276], 1800, 500, 290, 'friant', 'Friant’s and Morand’s divisions with the cavalry of Montbrun and Grouchy'),
    ],
    arrows: [
      arrow('france', [[16.535, 48.27], [16.533, 48.258], [16.531, 48.244]], 260, 'massena-march', 'Masséna’s corps marches 8 km south to Essling'),
      arrow('france', [[16.524, 48.276], [16.513, 48.283]], 220, 'nansouty-charge', 'Nansouty’s cuirassiers and carabiniers charge near Süssenbrunn'),
      arrow('france', [[16.632, 48.265], [16.636, 48.273]], 220, 'davout-front', 'Gudin and Puthod storm Markgrafneusiedl'),
      arrow('france', [[16.664, 48.279], [16.652, 48.283]], 220, 'davout-flank', 'Friant and Morand climb the plateau from the east'),
      arrow('austria', [[16.648, 48.297], [16.635, 48.318]], 220, 'rosenberg-retreat', 'Rosenberg falls back towards Bockfliess, about 1 pm', 'dashed'),
    ],
    clashes: [{ at: [16.513, 48.285], size: 300 }, { at: [16.637, 48.274], size: 300 }, { at: [16.656, 48.284], size: 300 }],
  },
  markers: {
    'wagram-noon-lauriston': mark([16.505, 48.252], 'Lauriston', '84 to 100 guns', 'france', 'target'),
    'wagram-noon-bessieres': mark([16.558, 48.258], 'Bessières', 'Unhorsed', 'france'),
    'wagram-noon-massena': mark([16.552, 48.234], 'Masséna', 'Near Essling at noon', 'france'),
    'wagram-noon-nordmann': mark([16.684, 48.263], 'Nordmann', 'Mortally wounded', 'austria', 'skull'),
    'wagram-noon-tower': mark([16.635, 48.252], 'Markgrafneusiedl', 'Tower taken', 'france', 'church'),
  },
});

// --- afternoon: MacDonald's column, the general attack and the Austrian retreat ---
writePlan(`${G}/050-wagram-macdonald`, {
  bbox,
  emblem: {
    water,
    units: [
      C('austria', [16.455, 48.257], 2000, 500, 140, 'klenau', 'VI Corps under Klenau, falling back on Leopoldau'),
      C('austria', [16.483, 48.27], 2200, 600, 80, 'kollowrat', 'III Corps under Kollowrat, firing into the column’s left'),
      C('austria', [16.513, 48.288], 2000, 600, 200, 'grenadiers', 'Grenadiers of the reserve, firing into the column’s right'),
      C('austria', [16.545, 48.312], 2200, 600, 170, 'bellegarde', 'I Corps under Bellegarde, retreating'),
      C('austria', [16.595, 48.312], 2200, 600, 160, 'hohenzollern', 'II Corps under Hohenzollern, retreating'),
      C('austria', [16.642, 48.312], 2200, 600, 150, 'rosenberg', 'IV Corps under Rosenberg, retreating towards Bockfliess'),
      unit('client', 'square', [16.503, 48.273], 800, 550, 290, 'macdonald', 'MacDonald’s column, 23 battalions, about 8,000 men'),
      C('rhine', [16.522, 48.264], 1500, 400, 290, 'wrede', 'Wrede’s Bavarian division, about 5,500, with the Young Guard'),
      C('france', [16.478, 48.236], 2500, 600, 330, 'massena', 'Masséna’s corps, retaking Essling and Aspern'),
      C('client', [16.565, 48.29], 1800, 500, 0, 'pacthod', 'Pacthod’s division and the Italian Royal Guard'),
      C('france', [16.603, 48.293], 2400, 600, 350, 'oudinot', 'II Corps under Oudinot, on the plateau'),
      C('france', [16.65, 48.292], 2400, 600, 320, 'davout', 'III Corps under Davout, on the plateau'),
    ],
    arrows: [
      arrow('client', [[16.535, 48.262], [16.52, 48.268], [16.509, 48.272]], 400, 'macdonald-advance', 'MacDonald’s column marches on Süssenbrunn and stops towards 2 pm'),
      arrow('france', [[16.6, 48.268], [16.6, 48.287]], 220, 'oudinot-attack', 'Oudinot storms Baumersdorf without orders, about 1 pm'),
      arrow('client', [[16.572, 48.272], [16.567, 48.285]], 200, 'pacthod-attack', 'Pacthod takes Deutsch-Wagram'),
      arrow('france', [[16.47, 48.242], [16.461, 48.251]], 220, 'massena-pursuit', 'Masséna drives Klenau back to Leopoldau'),
      arrow('austria', [[16.55, 48.317], [16.535, 48.326]], 220, 'austrian-retreat', 'The Austrian army withdraws north-west in good order from 2:30 pm', 'dashed'),
    ],
    clashes: [{ at: [16.5, 48.274], size: 300 }, { at: [16.601, 48.289], size: 300 }, { at: [16.459, 48.253], size: 300 }],
  },
  markers: {
    'wagram-aft-macdonald': mark([16.494, 48.261], 'MacDonald', 'Halts towards 2 pm', 'client'),
    'wagram-aft-walther': mark([16.548, 48.283], 'Guard cavalry', 'Does not charge', 'france'),
    'wagram-aft-lasalle': mark([16.44, 48.244], 'Lasalle', 'Killed', 'france', 'skull'),
    'wagram-aft-charles': mark([16.5, 48.327], 'Archduke Charles', 'Retreat at 2:30 pm', 'austria'),
    'wagram-aft-john': mark([16.672, 48.246], 'Archduke John', 'Patrol, about 5 pm', 'austria'),
  },
});

console.log('wagram: bbox', JSON.stringify(bbox), 'field', JSON.stringify(off(V.raasdorf, 0, 1500)));
