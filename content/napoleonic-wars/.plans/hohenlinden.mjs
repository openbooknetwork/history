// Hohenlinden, 3 December 1800, 33 km east of Munich. Moreau holds the open plain around Hohenlinden. The Austrian
// columns come west through the forest, Kollowrat on the main road from Haag by Maitenbeth. Richepanse marches from
// Ebersberg in the south across Riesch's front and comes out on the road behind Kollowrat.
// Frame: origin on Hohenlinden, u north, w east, from the French towards the Austrians.
import { frame, writePlan } from './lib.mjs';

const f = frame([11.998, 48.16], 0), P = f.p, FR = f.face(90), AUS = f.face(270);
const G = 'pages/040-second-coalition/040-hohenlinden';
const bbox = f.box([[-9400, -2500], [6500, 10200]], 0);
const unit = (side, type, u, w, width, depth, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing: side === 'france' ? FR : AUS, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });

// --- overview: from the Rhine to the Inn ---
writePlan(`${G}/010-hohenlinden`, {
  routes: {
    'moreau-1800': { name: 'Moreau’s advance from the Rhine to the Isar, April to July 1800',
      path: [[7.59, 47.56], [8.3, 47.75], [8.77, 47.86], [9.01, 47.85], [9.11, 48.0], [9.79, 48.1], [9.95, 48.3], [10.57, 48.61], [11.2, 48.4], [11.79, 48.15]] },
    'john-1800': { name: 'Archduke John’s advance from the Inn by Ampfing to Haag, 1 and 2 December 1800',
      path: [[12.55, 48.24], [12.41, 48.255], [12.18, 48.162], [12.08, 48.155]] },
    'grenier-1800': { name: 'Grenier falls back from Ampfing to Hohenlinden, 1 and 2 December 1800', style: 'dashed', offset: 6,
      path: [[12.41, 48.255], [12.18, 48.162], [12.0, 48.16]] },
  },
  markers: {
    'hohenlinden-stockach': { lnglat: [9.01, 47.85], icon: 'swords', color: 'france', label: 'Engen and Stockach', note: '3 May 1800' },
    'hohenlinden-messkirch': { lnglat: [9.11, 48.0], icon: 'swords', color: 'france', label: 'Messkirch', note: '4 and 5 May' },
    'hohenlinden-hochstadt': { lnglat: [10.57, 48.61], icon: 'swords', color: 'france', label: 'Höchstädt', note: 'Moreau beats Kray, 19 June' },
    'hohenlinden-parsdorf': { lnglat: [11.79, 48.15], icon: 'scroll', color: 'france', label: 'Parsdorf', note: 'Armistice, 15 July 1800' },
    'hohenlinden-ampfing': { lnglat: [12.41, 48.255], icon: 'swords', color: 'austria', label: 'Ampfing', note: 'Austrians push back Grenier, 1 December' },
  },
});

// --- morning: the columns come out of the forest ---
writePlan(`${G}/020-hohenlinden-forest`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', 3200, 300, 1000, 250, 'bastoul', 'Bastoul’s division of Grenier’s corps, 6,300'),
      unit('france', 'infantry', 1400, 400, 1300, 250, 'ney', 'Ney’s division of Grenier’s corps, 9,600'),
      unit('france', 'infantry', -150, 1200, 1300, 250, 'grouchy', 'Grouchy’s division, 8,600, astride the road'),
      unit('france', 'cavalry', 700, -900, 600, 200, 'hautpoul', 'D’Hautpoul’s heavy cavalry in reserve, 1,700'),
      unit('france', 'infantry', -5200, 2700, 300, 1500, 'richepanse', 'Richepanse’s division, 10,700, marching north-east', { facing: 45 }),
      unit('france', 'infantry', -7400, 0, 300, 1300, 'decaen', 'Decaen’s division, 10,100, following from Ebersberg', { facing: 45 }),
      unit('austria', 'infantry', -250, 4100, 400, 3600, 'kollowrat', 'Kollowrat’s column, 20,000, with Archduke John, on the road from Haag'),
      unit('austria', 'infantry', 1700, 5300, 900, 300, 'latour', 'Latour’s column, 10,800, held up on the forest tracks'),
      unit('austria', 'infantry', 2600, 1900, 1200, 300, 'schwarzenberg', 'Schwarzenberg’s division of Kienmayer’s column'),
      unit('austria', 'infantry', -6700, 8800, 1200, 300, 'riesch', 'Riesch’s column, 13,300, at Albaching'),
      unit('austria', 'infantry', -4300, 3700, 250, 120, 'grenadiers', 'Two grenadier battalions sent by Kollowrat to find Riesch'),
    ],
    arrows: [
      arrow('france', [[-150, 500], [-200, 1200], [-250, 2000]], 160, 'grouchy-attack', 'Grouchy counterattacks as the Austrians leave the trees'),
      arrow('austria', [[5800, 4450], [4300, 3200], [3000, 2300]], 150, 'kienmayer', 'Kienmayer comes down from Isen'),
      arrow('austria', [[2600, 1250], [2500, 900], [2400, 680]], 130, 'schwarzenberg-attack', 'Schwarzenberg attacks Bastoul and Ney'),
      arrow('france', [[-9000, -1500], [-7300, 400], [-6000, 1900]], 150, 'richepanse-march', 'Richepanse marches north-east from Ebersberg'),
      arrow('austria', [[-1600, 4100], [-2900, 3900], [-4100, 3750]], 110, 'grenadiers-march', 'The grenadiers run into Richepanse and cut his column in two'),
    ],
    clashes: [P(-200, 2200), P(2400, 600), { at: P(-4450, 3500), size: 160 }],
  },
  markers: {
    'hohenlinden-forest-moreau': mark(-1500, -1500, 'Moreau', 'Holds the plain', 'france'),
    'hohenlinden-forest-grouchy': mark(-900, 1300, 'Grouchy', 'Throws back the Austrian vanguard', 'france'),
    'hohenlinden-forest-john': mark(1200, 4300, 'Archduke John', 'With Kollowrat on the road', 'austria'),
    'hohenlinden-forest-richepanse': mark(-5500, 1500, 'Richepanse', 'Marches across Riesch’s front', 'france'),
    'hohenlinden-forest-riesch': mark(-6000, 9500, 'Riesch', 'At Albaching only at 9:30', 'austria'),
  },
});

// --- midday and afternoon: Richepanse in the rear, Kollowrat's column destroyed ---
writePlan(`${G}/030-hohenlinden-richepanse`, {
  bbox,
  emblem: {
    units: [
      unit('france', 'infantry', -900, 7100, 500, 120, 'richepanse', 'Richepanse’s 48th Line, attacking west along the road', { facing: 270 }),
      unit('france', 'infantry', -1300, 8300, 450, 150, 'eighth-line', 'The 8th Line and 1st Chasseurs, holding off Liechtenstein’s cavalry'),
      unit('france', 'infantry', -2600, 7000, 400, 150, 'drouet', 'Drouet’s brigade, coming north to the road', { facing: 0 }),
      unit('france', 'infantry', -5900, 7400, 1200, 250, 'decaen', 'Decaen’s division, attacking Riesch'),
      unit('france', 'infantry', 700, 2600, 1300, 250, 'ney', 'Ney’s division, swinging south against Kollowrat', { facing: 150 }),
      unit('france', 'infantry', -500, 2000, 1300, 250, 'grouchy', 'Grouchy’s division, attacking from the front'),
      unit('austria', 'infantry', -350, 4400, 400, 3000, 'kollowrat', 'Kollowrat’s column, hemmed in on three sides'),
      unit('austria', 'infantry', -900, 6400, 250, 120, 'wrede', 'Wrede’s two Bavarian battalions, overrun'),
      unit('austria', 'cavalry', -800, 9100, 450, 150, 'liechtenstein', 'Liechtenstein’s cavalry division'),
      unit('austria', 'infantry', -6800, 9300, 1200, 300, 'riesch', 'Riesch’s column, driven back to the heights of Albaching'),
      unit('austria', 'infantry', 2600, 5600, 900, 300, 'latour', 'Latour’s column, falling back to Isen'),
    ],
    arrows: [
      arrow('france', [[-900, 6950], [-900, 6750], [-900, 6550]], 140, 'richepanse-attack', 'Richepanse turns west into the Austrian rear'),
      arrow('france', [[1500, 1700], [900, 2400], [250, 3300]], 150, 'ney-attack', 'Ney attacks Kollowrat from the north'),
      arrow('france', [[-5600, 6600], [-6000, 7500], [-6300, 8500]], 140, 'decaen-attack', 'Decaen drives Riesch back'),
      arrow('austria', [[100, 5200], [1500, 5600], [3000, 5900]], 140, 'kollowrat-flight', 'Kollowrat’s column breaks up in flight', 'dashed'),
      arrow('austria', [[3000, 5400], [4300, 5000], [5700, 4500]], 120, 'latour-retreat', 'Latour retreats to Isen', 'dashed'),
    ],
    clashes: [P(-900, 6550), P(0, 3400), { at: P(-6450, 8700), size: 160 }, P(-1100, 8750)],
  },
  markers: {
    'hohenlinden-richepanse-richepanse': mark(-1800, 7600, 'Richepanse', 'In the Austrian rear', 'france'),
    'hohenlinden-richepanse-john': mark(1300, 4700, 'Archduke John', 'Escapes on a fast horse', 'austria'),
    'hohenlinden-richepanse-ney': mark(2000, 1600, 'Ney', '1,000 prisoners, ten guns', 'france'),
    'hohenlinden-richepanse-decaen': mark(-5000, 6500, 'Decaen', 'Drives Riesch back', 'france'),
    'hohenlinden-richepanse-kollowrat': mark(-1500, 4400, 'Kollowrat', 'Column destroyed, 60 guns lost', 'austria', 'skull'),
  },
});

console.log('hohenlinden: bbox', JSON.stringify(bbox), 'battle at', JSON.stringify(P(0, 0)));
