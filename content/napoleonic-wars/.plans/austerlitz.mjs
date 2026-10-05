// Austerlitz, 2 December 1805. The field lies east of Brünn: the Goldbach runs south past Kobelnitz, Sokolnitz and
// Telnitz, the Bosenitz joins it from the north past Girzikowitz and Puntowitz, and the Pratzen Heights rise between
// the Goldbach and Austerlitz. Streams, heights and ponds are placed on the relief of the elevation tiles; the summit
// of the Pratzen is the article's coordinate. Units are placed in metres east and north of named places.
import { writePlan } from './lib.mjs';

const G = 'pages/050-third-coalition/040-austerlitz';
const PRATZEN = [16.7625, 49.128];
// a point dx metres east and dy metres north of a place
const at = ([lon, lat], dx = 0, dy = 0) => { const kx = 111320 * Math.cos(lat * Math.PI / 180); return [+(lon + dx / kx).toFixed(5), +(lat + dy / 110540).toFixed(5)]; };
const PL = {
  telnitz: [16.718, 49.1017], sokolnitz: [16.722, 49.114], castle: [16.7205, 49.1185], kobelnitz: [16.731, 49.139],
  puntowitz: [16.7375, 49.1575], girzikowitz: [16.7525, 49.165], pratzen: [16.764, 49.142], augezd: [16.757, 49.1056],
  vinohrady: [16.789, 49.145], zuran: [16.737, 49.183], santon: [16.759, 49.1935], blasowitz: [16.786, 49.169],
  holubice: [16.81, 49.176], satschan: [16.745, 49.0955],
};

const water = [
  { path: [[16.727, 49.178], [16.727, 49.168], [16.731, 49.16], [16.733, 49.15], [16.729, 49.142], [16.727, 49.132], [16.728, 49.122], [16.724, 49.113],
    [16.719, 49.105], [16.715, 49.099], [16.709, 49.092], [16.699, 49.085]], width: 40, id: 'goldbach', name: 'The Goldbach stream' },
  { path: [[16.761, 49.2], [16.755, 49.19], [16.755, 49.178], [16.753, 49.166], [16.748, 49.158], [16.741, 49.153], [16.735, 49.149], [16.731, 49.147]],
    width: 30, id: 'bosenitz', name: 'The Bosenitz stream' },
  { area: [[16.727, 49.0975], [16.74, 49.0995], [16.757, 49.099], [16.772, 49.0965], [16.771, 49.0925], [16.752, 49.0912], [16.735, 49.0922], [16.726, 49.0945]],
    id: 'satschan-pond', name: 'The Satschan pond, frozen' },
];
const bbox = [16.69, 49.084, 16.835, 49.2];

const FR = 'france', AL = 'russia';
const unit = (side, type, pos, width, depth, facing, id, name, extra = {}) => ({ side, type, at: pos, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (pos, label, note, color, icon = 'user') => ({ lnglat: pos, icon, color, label, note });

// --- overview: the march down the Danube, the retreat into Moravia, Davout's forced march ---
writePlan(`${G}/010-austerlitz`, {
  routes: {
    'grande-armee-vienna-1805': { name: 'The Grande Armée follows the Danube from Ulm to Vienna, late October to 13 November 1805',
      path: [[13.6, 48.24], [14.29, 48.3], [14.87, 48.12], [15.62, 48.2], [16.1, 48.21], [16.37, 48.22]] },
    'kutuzov-1805': { name: 'Kutuzov’s retreat by Krems and Hollabrunn into Moravia, November 1805', style: 'dashed', offset: 6,
      path: [[13.6, 48.26], [14.29, 48.32], [14.87, 48.14], [15.6, 48.25], [15.62, 48.41], [15.95, 48.52], [16.03, 48.62], [16.05, 48.86], [16.42, 49.0], [16.61, 49.19], [16.99, 49.28], [17.25, 49.59]] },
    'napoleon-brunn-1805': { name: 'Murat, Lannes and Soult follow from Vienna by Hollabrunn to Brünn, 14 to 20 November 1805',
      path: [[16.37, 48.24], [16.25, 48.4], [16.08, 48.56], [16.05, 48.84], [16.4, 49.0], [16.6, 49.18]] },
    'allies-1805': { name: 'The allied army advances from Olmütz to Austerlitz, 27 November to 1 December 1805',
      path: [[17.25, 49.59], [17.11, 49.47], [16.99, 49.28], [16.88, 49.16], [16.78, 49.13]] },
    'davout-1805': { name: 'Davout’s III Corps marches 110 km from Vienna in 48 hours, 29 November to 2 December 1805',
      path: [[16.37, 48.2], [16.45, 48.42], [16.64, 48.8], [16.62, 49.0], [16.64, 49.08], [16.71, 49.1]] },
  },
  markers: {
    'austerlitz-amstetten': { lnglat: [14.87, 48.12], icon: 'swords', color: AL, label: 'Amstetten', note: 'Russian rearguard action, 5 November' },
    'austerlitz-durenstein': { lnglat: [15.52, 48.39], icon: 'swords', color: AL, label: 'Dürenstein' },
    'austerlitz-vienna': { lnglat: [16.37, 48.21], icon: 'flag', color: FR, label: 'Vienna', note: 'Taken by the French, 13 November' },
    'austerlitz-schongrabern': { lnglat: [16.02, 48.61], icon: 'swords', color: AL, label: 'Schöngrabern', note: 'Bagration, 16 November' },
    'austerlitz-olmutz': { lnglat: [17.25, 49.59], icon: 'flag', color: AL, label: 'Olmütz', note: 'The allies gather' },
  },
});

// Soult's two divisions wait on the south-east bank of the Bosenitz, between Puntowitz and Girzikowitz
const SH0 = [16.7485, 49.152], V0 = [16.76, 49.1625];

// --- dawn: the allied columns leave the Pratzen for the Goldbach, Soult waits in the low ground ---
writePlan(`${G}/020-austerlitz-deployment`, {
  bbox,
  emblem: {
    water,
    units: [
      unit(FR, 'infantry', [16.712, 49.116], 1500, 250, 90, 'legrand', 'Legrand’s division of Soult’s IV Corps on the Goldbach, about 5,000, with the 3rd Line in Telnitz'),
      unit(FR, 'infantry', SH0, 1200, 300, 120, 'saint-hilaire', 'Saint-Hilaire’s division of Soult’s IV Corps, in the mist below the Pratzen'),
      unit(FR, 'infantry', V0, 1200, 300, 110, 'vandamme', 'Vandamme’s division of Soult’s IV Corps'),
      unit(FR, 'infantry', [16.712, 49.171], 1300, 500, 100, 'reserve', 'Bernadotte’s I Corps, the grenadiers and the Imperial Guard in reserve'),
      unit(FR, 'infantry', [16.764, 49.179], 1500, 300, 90, 'lannes', 'Lannes’s V Corps, Suchet’s and Caffarelli’s divisions, across the road to Olmütz'),
      unit(FR, 'cavalry', [16.745, 49.1675], 1000, 300, 90, 'murat', 'Murat’s reserve cavalry: Kellermann, Nansouty and d’Hautpoul'),
      unit(AL, 'infantry', at(PL.augezd, -200, 300), 450, 1300, 280, 'dokhturov', 'Kienmayer’s advance guard and Dokhturov’s first column, marching on Telnitz'),
      unit(AL, 'infantry', at(PL.sokolnitz, 2400, 500), 450, 1300, 265, 'langeron', 'Langeron’s second column, marching on Sokolnitz'),
      unit(AL, 'infantry', at(PL.pratzen, -700, -900), 450, 1100, 255, 'przybyszewski', 'Przybyszewski’s third column, marching on Sokolnitz castle'),
      unit(AL, 'infantry', at(PL.pratzen, 800, 0), 500, 1500, 250, 'fourth-column', 'Fourth column under Kolowrat and Miloradovich, with Kutuzov, on the Pratzen'),
      unit(AL, 'cavalry', at(PL.pratzen, 1800, -1300), 800, 300, 270, 'liechtenstein', 'Liechtenstein’s fifth column of cavalry, behind the left'),
      unit(AL, 'infantry', [16.792, 49.181], 1600, 400, 260, 'bagration', 'Bagration’s advance guard on the road to Olmütz'),
    ],
    arrows: [
      arrow(AL, [at(PL.augezd, -300, -350), at(PL.telnitz, 1600, -150), at(PL.telnitz, 500, 0)], 160, 'allied-march', 'The allied columns march down from the Pratzen to the Goldbach'),
      arrow(AL, [at(PL.sokolnitz, 2300, -200), at(PL.sokolnitz, 1300, 100), at(PL.sokolnitz, 500, 200)], 160, 'allied-march', 'The allied columns march down from the Pratzen to the Goldbach'),
      arrow(FR, [[16.665, 49.077], [16.688, 49.09], [16.703, 49.1]], 150, 'davout-march', 'Davout’s III Corps arrives from Vienna after 110 km in 48 hours'),
    ],
  },
  markers: {
    'austerlitz-deployment-napoleon': mark(PL.zuran, 'Napoleon', 'On the Žuráň hill', FR),
    'austerlitz-deployment-santon': mark([16.759, 49.196], 'Santon', '17th Light and 18 guns', FR, 'flag'),
    'austerlitz-deployment-pratzen': mark([16.785, 49.12], 'Pratzen Heights', 'Left by the allied columns', AL, 'mountain'),
    'austerlitz-deployment-kutuzov': mark([16.81, 49.146], 'Kutuzov and Alexander', 'With the fourth column', AL),
    'austerlitz-deployment-guard': mark([16.81, 49.16], 'Russian Guard', 'In reserve under Constantine', AL, 'flag'),
    'austerlitz-deployment-buxhoeveden': mark([16.785, 49.106], 'Buxhoeveden', 'Allied left, about 43,000', AL),
  },
});

// --- 8 to 9 a.m.: Telnitz and Sokolnitz; Liechtenstein crosses behind the columns; the fourth column leaves the heights ---
writePlan(`${G}/030-austerlitz-goldbach`, {
  bbox,
  emblem: {
    water,
    units: [
      unit(FR, 'infantry', at(PL.telnitz, -900, -100), 500, 220, 80, 'third-line', 'The French 3rd Line, driven out of Telnitz'),
      unit(FR, 'infantry', at(PL.sokolnitz, -800, 300), 900, 250, 90, 'legrand', 'Legrand’s division and the 26th Light about Sokolnitz'),
      unit(FR, 'infantry', at(PL.telnitz, -1500, 1300), 900, 300, 60, 'friant', 'Friant’s division of Davout’s III Corps, coming up'),
      unit(FR, 'infantry', SH0, 1200, 300, 120, 'saint-hilaire', 'Saint-Hilaire’s division, still hidden in the mist'),
      unit(FR, 'infantry', V0, 1200, 300, 110, 'vandamme', 'Vandamme’s division, still hidden in the mist'),
      unit(AL, 'infantry', at(PL.telnitz, 1000, 50), 500, 1100, 275, 'dokhturov', 'Kienmayer and Dokhturov in Telnitz'),
      unit(AL, 'infantry', at(PL.sokolnitz, 900, -100), 500, 1000, 270, 'langeron', 'Langeron’s column attacking Sokolnitz'),
      unit(AL, 'infantry', at(PL.castle, 1000, 700), 450, 1000, 265, 'przybyszewski', 'Przybyszewski’s column attacking Sokolnitz castle'),
      unit(AL, 'infantry', at(PL.pratzen, 0, -400), 500, 1100, 240, 'fourth-column', 'The fourth column leaves the Pratzen under the Tsar’s order'),
      unit(AL, 'cavalry', [16.791, 49.159], 800, 300, 10, 'liechtenstein', 'Liechtenstein’s cavalry, crossing to the right wing'),
    ],
    arrows: [
      arrow(AL, [at(PL.telnitz, 600, 0), at(PL.telnitz, -200, 0), at(PL.telnitz, -650, -60)], 150, 'telnitz-attack', 'Allied charges drive the French over the Goldbach'),
      arrow(FR, [[16.7, 49.111], [16.709, 49.1105], [16.7185, 49.1135]], 140, 'friant-attack', 'Friant retakes Sokolnitz'),
      arrow(AL, [[16.796, 49.121], [16.793, 49.138], [16.791, 49.154]], 140, 'liechtenstein-cross', 'Liechtenstein’s cavalry crosses behind the columns and holds up Langeron'),
      arrow(AL, [at(PL.pratzen, -500, -600), at(PL.pratzen, -1500, -1000)], 150, 'fourth-column-advance', 'The fourth column starts down the slope'),
    ],
    clashes: [at(PL.telnitz, -350, 0), at(PL.sokolnitz, 200, 0), at(PL.castle, 300, 200)],
  },
  markers: {
    'austerlitz-goldbach-davout': mark([16.697, 49.132], 'Davout', 'Friant’s division arrives', FR),
    'austerlitz-goldbach-langeron': mark([16.757, 49.117], 'Langeron', 'Bombards Sokolnitz', AL),
    'austerlitz-goldbach-telnitz': mark([16.716, 49.097], 'Telnitz', undefined, FR, 'swords'),
    'austerlitz-goldbach-kutuzov': mark([16.772, 49.154], 'Kutuzov', 'Ordered off the heights', AL),
    'austerlitz-goldbach-napoleon': mark(PL.zuran, 'Napoleon', 'Watches the centre thin out', FR),
  },
});

// --- 9 to 11 a.m.: Soult takes the Pratzen and the Staré Vinohrady ---
writePlan(`${G}/040-austerlitz-pratzen`, {
  bbox,
  emblem: {
    water,
    units: [
      unit(FR, 'infantry', [16.7584, 49.1343], 1300, 300, 110, 'saint-hilaire', 'Saint-Hilaire’s division on the Pratzen'),
      unit(FR, 'infantry', [16.776, 49.1513], 1300, 300, 100, 'vandamme', 'Vandamme’s division at the Staré Vinohrady'),
      unit(FR, 'infantry', at(PL.girzikowitz, 900, 700), 1300, 350, 100, 'bernadotte', 'Bernadotte’s I Corps crosses the Bosenitz to support Vandamme'),
      unit(AL, 'infantry', [16.7762, 49.1343], 600, 1100, 290, 'fourth-column', 'The fourth column and Austrian battalions fight for the heights'),
      unit(AL, 'infantry', [16.793, 49.1477], 500, 900, 280, 'vinohrady-battalions', 'Allied battalions broken at the Staré Vinohrady'),
      unit(FR, 'infantry', at(PL.sokolnitz, -800, 300), 900, 250, 90, 'davout', 'Davout’s III Corps and Legrand’s division hold the Goldbach'),
      unit(AL, 'infantry', at(PL.sokolnitz, 700, 0), 600, 1100, 270, 'langeron', 'Langeron and Przybyszewski in Sokolnitz'),
      unit(AL, 'infantry', at(PL.telnitz, 900, 0), 500, 1000, 275, 'dokhturov', 'Kienmayer and Dokhturov about Telnitz'),
    ],
    arrows: [
      arrow(FR, [[16.744, 49.1545], [16.75, 49.145], [16.7555, 49.137]], 180, 'saint-hilaire-attack', 'Saint-Hilaire climbs the Pratzen from Puntowitz'),
      arrow(FR, [[16.756, 49.1595], [16.765, 49.1555], [16.7725, 49.1515]], 180, 'vandamme-attack', 'Vandamme advances on the Staré Vinohrady'),
      arrow(FR, [at(PL.girzikowitz, -1300, 900), at(PL.girzikowitz, -300, 900), at(PL.girzikowitz, 200, 750)], 150, 'bernadotte-advance', 'Bernadotte comes up on Vandamme’s left'),
    ],
    clashes: [[16.7672, 49.1343], [16.7845, 49.1495], at(PL.sokolnitz, 150, 0)],
  },
  markers: {
    'austerlitz-pratzen-heights': mark([16.7625, 49.115], 'Pratzen Heights', 'Cleared with the bayonet', FR, 'mountain'),
    'austerlitz-pratzen-vandamme': mark([16.8, 49.166], 'Vandamme', 'Breaks several battalions', FR, 'swords'),
    'austerlitz-pratzen-kutuzov': mark([16.7927, 49.1307], 'Kutuzov', 'Throws in the fourth column', AL),
    'austerlitz-pratzen-napoleon': mark([16.747, 49.129], 'Napoleon', 'Moves his post to the Pratzen', FR),
  },
});

// --- late morning: the Russian Guard at the Staré Vinohrady; Liechtenstein and Bagration beaten in the north ---
writePlan(`${G}/050-austerlitz-guard`, {
  bbox,
  emblem: {
    water,
    units: [
      unit(FR, 'infantry', [16.786, 49.146], 1200, 300, 45, 'vandamme', 'Vandamme’s division, a battalion of the 4th Line broken'),
      unit(AL, 'infantry', [16.799, 49.157], 1100, 350, 225, 'russian-guard', 'The Russian Imperial Guard under Grand Duke Constantine'),
      unit(FR, 'cavalry', [16.768, 49.152], 900, 250, 70, 'guard-cavalry', 'The heavy cavalry of the Imperial Guard'),
      unit(FR, 'infantry', [16.775, 49.162], 1100, 300, 110, 'drouet', 'Drouet’s division of Bernadotte’s corps on the flank'),
      unit(FR, 'infantry', [16.76, 49.128], 1300, 300, 110, 'saint-hilaire', 'Saint-Hilaire’s division holds the Pratzen'),
      unit(FR, 'infantry', [16.777, 49.175], 1000, 300, 80, 'caffarelli', 'Caffarelli’s division halts Liechtenstein’s charges'),
      unit(AL, 'cavalry', [16.793, 49.178], 1000, 300, 260, 'liechtenstein', 'Liechtenstein’s heavy cavalry'),
      unit(FR, 'cavalry', [16.77, 49.168], 900, 250, 60, 'cuirassiers', 'The cuirassier divisions of Nansouty and d’Hautpoul'),
      unit(FR, 'infantry', [16.785, 49.19], 1300, 300, 90, 'suchet', 'Lannes’s V Corps advances along the road to Olmütz'),
      unit(AL, 'infantry', [16.805, 49.188], 1300, 350, 275, 'bagration', 'Bagration’s advance guard, driven off the field'),
    ],
    arrows: [
      arrow(AL, [[16.7965, 49.1545], [16.7935, 49.1522], [16.7905, 49.1502]], 170, 'guard-attack', 'Constantine counterattacks Vandamme'),
      arrow(FR, [[16.7705, 49.1525], [16.781, 49.1565], [16.7935, 49.1585]], 160, 'guard-cavalry-charge', 'The Guard cavalry charges the Russian Guard'),
      arrow(FR, [[16.7725, 49.169], [16.781, 49.1725], [16.789, 49.176]], 150, 'cuirassier-charge', 'Murat sends in the cuirassiers'),
      arrow(FR, [[16.787, 49.19], [16.797, 49.189]], 160, 'lannes-advance', 'Lannes drives Bagration back along the road'),
      arrow(AL, [[16.807, 49.189], [16.825, 49.193]], 140, 'bagration-retreat', 'Bagration withdraws', 'dashed'),
    ],
    clashes: [[16.792, 49.151], [16.787, 49.177], [16.796, 49.189]],
  },
  markers: {
    'austerlitz-guard-constantine': mark([16.818, 49.149], 'Constantine', 'Broken and pursued', AL),
    'austerlitz-guard-4th-line': mark([16.795, 49.137], '4th Line', 'Loses its eagle', FR, 'skull'),
    'austerlitz-guard-kutuzov': mark([16.775, 49.12], 'Kutuzov', 'Badly wounded', AL, 'skull'),
    'austerlitz-guard-murat': mark([16.745, 49.181], 'Murat', 'Cuirassiers win the mêlée', FR),
    'austerlitz-guard-lannes': mark([16.768, 49.197], 'Lannes', 'Drives off Bagration', FR),
  },
});

// --- afternoon: the allied left breaks; the flight over the Satschan pond ---
writePlan(`${G}/060-austerlitz-ponds`, {
  bbox,
  emblem: {
    water,
    units: [
      unit(FR, 'infantry', at(PL.sokolnitz, 1500, 900), 1100, 300, 235, 'saint-hilaire', 'Saint-Hilaire’s division comes down from the Pratzen'),
      unit(FR, 'infantry', at(PL.sokolnitz, -700, 300), 900, 300, 90, 'davout', 'Davout’s III Corps attacks from the Goldbach'),
      unit(FR, 'infantry', at(PL.augezd, 1500, 1200), 1100, 300, 200, 'vandamme', 'Vandamme’s division on the heights of Augezd'),
      unit(FR, 'artillery', at(PL.augezd, 1200, 500), 600, 150, 200, 'augezd-guns', 'French guns firing on the pond', { count: 6 }),
      unit(AL, 'infantry', at(PL.sokolnitz, 400, 100), 500, 600, 270, 'langeron', 'The allied columns at Sokolnitz, broken'),
      unit(AL, 'cavalry', at(PL.telnitz, -300, -1000), 700, 250, 20, 'oreilly', 'Kienmayer’s O’Reilly light cavalry covers the retreat'),
    ],
    arrows: [
      arrow(FR, [[16.76, 49.131], [16.752, 49.127], [16.7465, 49.1245]], 170, 'saint-hilaire-descent', 'Saint-Hilaire attacks Sokolnitz from the heights'),
      arrow(FR, [[16.776, 49.131], [16.7772, 49.125], [16.7776, 49.1195]], 160, 'vandamme-south', 'Vandamme turns south to the heights of Augezd'),
      arrow(AL, [at(PL.telnitz, 1200, 0), at(PL.satschan, -300, 800), at(PL.satschan, 300, -100), at(PL.satschan, 600, -1000)], 160, 'flight-ponds', 'Dokhturov’s men escape over the frozen pond', 'dashed'),
      arrow(AL, [at(PL.telnitz, 200, -100), at(PL.telnitz, -400, -900), at(PL.telnitz, -1100, -1600)], 140, 'flight-telnitz', 'Kienmayer and Langeron flee south', 'dashed'),
      arrow(AL, [at(PL.sokolnitz, 700, -300), at(PL.augezd, -900, 900), at(PL.augezd, 0, -200), at(PL.augezd, 1700, -1300)], 140, 'flight-augezd', 'Przybyszewski’s men fall back past Augezd', 'dashed'),
    ],
    clashes: [at(PL.sokolnitz, 750, 450), at(PL.sokolnitz, -100, 150)],
  },
  markers: {
    'austerlitz-ponds-pond': mark([16.785, 49.096], 'Satschan pond', 'Ice broken by gunfire', AL, 'skull'),
    'austerlitz-ponds-buxhoeveden': mark([16.7, 49.106], 'Buxhoeveden', 'Leaves the field', AL),
    'austerlitz-ponds-napoleon': mark([16.803, 49.125], 'Napoleon', 'Has guns brought to Augezd', FR),
    'austerlitz-ponds-davout': mark([16.694, 49.124], 'Davout', 'Attacks from the Goldbach', FR),
  },
});

console.log('austerlitz: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(PRATZEN));
