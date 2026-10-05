// Auerstedt, 14 October 1806. Davout's III Corps climbs from the Saale at Kösen onto the plateau and meets the
// Prussian main army at Hassenhausen. Friant comes up on Gudin's right (north), Morand on his left (south) towards
// the Ilm. Positions after the Jena–Auerstedt article; the Saale, the Ilm and the Lissbach from the elevation tiles.
// Frame: origin at Hassenhausen, u north, w east, so the French face 270 and the Prussians 90.
import { frame, writePlan } from './lib.mjs';

const f = frame([11.664, 51.118], 0), P = f.p, FR = f.face(270), PR = f.face(90);
const G = 'pages/060-fourth-coalition/020-jena';
const water = [
  { path: [[11.693, 51.085], [11.696, 51.095], [11.703, 51.105], [11.709, 51.115], [11.718, 51.125], [11.721, 51.135], [11.724, 51.142], [11.74, 51.148], [11.76, 51.151]], width: 70, id: 'saale', name: 'The Saale' },
  { path: [[11.56, 51.1], [11.585, 51.098], [11.605, 51.093], [11.62, 51.093], [11.635, 51.0996], [11.65, 51.103], [11.665, 51.1045], [11.68, 51.107], [11.698, 51.11]], width: 40, id: 'ilm', name: 'The Ilm' },
  { path: [[11.638, 51.14], [11.63, 51.135], [11.632, 51.13], [11.63, 51.125], [11.632, 51.12], [11.637, 51.113], [11.638, 51.105], [11.636, 51.0998]], width: 25, id: 'lissbach', name: 'The Lissbach' },
];
const bbox = f.box([[-3000, -5900], [3400, 4100]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : PR, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, ...(note ? { note } : {}) });

// --- overview: the Prussian main army from Weimar, Davout from Naumburg by Kösen, Bernadotte by Dornburg ---
writePlan(`${G}/050-auerstedt`, {
  bbox: [11.25, 50.93, 11.88, 51.2],
  routes: {
    'brunswick-1806': { name: 'The Prussian main army marches from Weimar by Auerstedt towards Kösen, 13 – 14 October 1806',
      path: [[11.33, 50.98], [11.4, 51.02], [11.48, 51.05], [11.55, 51.08], [11.585, 51.1], [11.62, 51.11], [11.645, 51.118]] },
    'davout-kosen-1806': { name: 'Davout marches from Naumburg over the Saale at Kösen, morning of 14 October 1806',
      path: [[11.81, 51.155], [11.76, 51.15], [11.722, 51.137], [11.69, 51.124], [11.67, 51.119]] },
    'bernadotte-dornburg-1806': { name: 'Bernadotte marches by Dornburg to Apolda, 14 October 1806', offset: 6,
      path: [[11.81, 51.155], [11.76, 51.15], [11.722, 51.137], [11.708, 51.11], [11.7, 51.08], [11.71, 51.05], [11.66, 51.008], [11.6, 51.02], [11.515, 51.027]] },
  },
  markers: {
    'auerstedt-naumburg': { lnglat: [11.81, 51.155], icon: 'flag', color: 'france', label: 'Naumburg', note: 'Davout and Bernadotte, night of 13 October' },
    'auerstedt-kosen': { lnglat: [11.722, 51.137], icon: 'flag', color: 'france', label: 'Kösen', note: 'Davout crosses the Saale' },
    'auerstedt-weimar': { lnglat: [11.33, 50.98], icon: 'flag', color: 'prussia', label: 'Weimar', note: 'The main army leaves, 13 October' },
    'auerstedt-apolda': { lnglat: [11.515, 51.027], icon: 'flag', color: 'france', label: 'Apolda', note: 'Bernadotte arrives late in the day' },
  },
});

// --- 7 to 10 a.m.: Gudin holds Hassenhausen, Friant's squares on his right, Brunswick falls ---
writePlan(`${G}/060-auerstedt-hassenhausen`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('france', 'infantry', 0, 300, 1300, 300, 'gudin', 'Gudin’s division holding Hassenhausen'),
      unit('france', 'square', 1250, -100, 260, 260, 'friant', 'Friant’s division in squares'),
      unit('france', 'square', 1700, -100, 260, 260, 'friant', 'Friant’s division in squares'),
      unit('france', 'square', 2150, -100, 260, 260, 'friant', 'Friant’s division in squares'),
      unit('france', 'artillery', 850, 350, 450, 300, 'french-guns', 'The 12-pounder guns', { count: 5 }),
      unit('france', 'cavalry', -1100, 350, 700, 250, 'french-cavalry', 'French cavalry on Gudin’s left'),
      unit('france', 'cavalry', 2800, 700, 500, 220, 'chasseurs', 'French chasseurs held behind a hill'),
      unit('prussia', 'infantry', 0, -100, 1400, 200, 'schmettau', 'Schmettau’s division attacking Hassenhausen'),
      unit('prussia', 'infantry', 1600, -450, 1200, 200, 'wartensleben', 'Wartensleben’s division'),
      unit('prussia', 'cavalry', 2900, -1700, 1100, 250, 'blucher', 'Blücher’s cavalry, put to flight', { facing: 110 }),
      unit('prussia', 'cavalry', -1300, -600, 900, 250, 'prussian-cavalry', 'Wartensleben’s cavalry on the Prussian right'),
    ],
    arrows: [
      arrow('france', [[1900, 3900], [900, 2400], [200, 600]], 130, 'gudin-march', 'Gudin’s division climbs from Kösen'),
      arrow('france', [[2100, 3700], [1900, 1600], [1700, 250]], 130, 'friant-march', 'Friant comes up on Gudin’s right'),
      arrow('prussia', [[2700, -1300], [2300, -650], [2100, -280]], 120, 'blucher-charge', 'Blücher charges Friant’s squares'),
      arrow('france', [[2800, 450], [2950, -500], [2950, -1450]], 110, 'chasseurs-charge', 'The chasseurs put Blücher’s cavalry to flight'),
      arrow('prussia', [[700, -1100], [400, -500], [250, 50]], 110, 'wartensleben-attack', 'Two of Wartensleben’s regiments attack Hassenhausen'),
    ],
    clashes: [P(0, 75), P(1550, -290), P(2050, -200)],
  },
  markers: {
    'auerstedt-hassenhausen-davout': mark(-600, 1500, 'Davout', 'Gudin holds Hassenhausen', 'france'),
    'auerstedt-hassenhausen-friant': mark(1700, 900, 'Friant', 'Squares on the right', 'france'),
    'auerstedt-hassenhausen-brunswick': mark(-700, -1100, 'Brunswick', 'Mortally wounded about 10 a.m.', 'prussia', 'skull'),
    'auerstedt-hassenhausen-blucher': mark(2700, -2600, 'Blücher', 'Cavalry broken', 'prussia'),
  },
});

// --- 10.30 a.m. to 1 p.m.: Morand on the left, the counterattack, the Prussians driven over the Lissbach ---
writePlan(`${G}/070-auerstedt-counterattack`, {
  bbox,
  emblem: {
    water,
    units: [
      unit('france', 'infantry', 0, -1500, 1300, 300, 'gudin', 'Gudin’s division advancing'),
      unit('france', 'infantry', 1600, -2300, 1200, 300, 'friant', 'Friant’s division pushing towards Eckartsberga', { facing: 280 }),
      unit('france', 'infantry', -1100, -2300, 1300, 300, 'morand', 'Morand’s division taking the Sonnenberg', { facing: 260 }),
      unit('france', 'artillery', -1900, -3000, 500, 300, 'morand-guns', 'French guns on the Sonnenberg', { facing: 320, count: 5 }),
      unit('france', 'artillery', 2750, -3000, 500, 300, 'friant-guns', 'French guns on the heights to the north', { facing: 230, count: 5 }),
      unit('prussia', 'infantry', 2200, -2750, 900, 200, 'orange', 'Half of the Prince of Orange’s division on each flank'),
      unit('prussia', 'infantry', -1300, -2650, 900, 200, 'orange', 'Half of the Prince of Orange’s division on each flank', { facing: 80 }),
      unit('prussia', 'infantry', 0, -3400, 1200, 250, 'schmettau', 'Schmettau’s division, broken and driven over the Lissbach'),
      unit('prussia', 'cavalry', 2900, -4300, 900, 250, 'blucher', 'Blücher’s cavalry, spent'),
      unit('prussia', 'infantry', 200, -5000, 1800, 300, 'kalckreuth', 'The reserve under Kalckreuth'),
    ],
    arrows: [
      arrow('france', [[0, -100], [0, -1250]], 130, 'gudin-advance', 'Gudin counterattacks'),
      arrow('france', [[1400, -600], [1550, -2050]], 130, 'friant-advance', 'Friant counterattacks'),
      arrow('france', [[-1300, 400], [-1200, -900], [-1100, -2050]], 130, 'morand-advance', 'Morand comes up on the left and advances'),
      arrow('prussia', [[0, -3700], [-300, -4700], [-1300, -6000]], 120, 'prussian-retreat', 'The Prussians withdraw towards Auerstedt', 'dashed'),
    ],
    clashes: [P(1950, -2550), P(-1250, -2500)],
  },
  markers: {
    'auerstedt-counterattack-davout': mark(-300, 400, 'Davout', 'Counterattacks at 11 a.m.', 'france'),
    'auerstedt-counterattack-morand': mark(-1000, -1500, 'Morand', 'Takes the Sonnenberg', 'france'),
    'auerstedt-counterattack-friant': mark(2600, -1700, 'Friant', 'Towards Eckartsberga', 'france'),
    'auerstedt-counterattack-king': mark(1800, -5300, 'Frederick William III', 'Orders the withdrawal', 'prussia'),
    'auerstedt-counterattack-village': mark(-1300, -5550, 'Auerstedt', null, 'prussia', 'house'),
  },
});

console.log('auerstedt: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, -300)));
