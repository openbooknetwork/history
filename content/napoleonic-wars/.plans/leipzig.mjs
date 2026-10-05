// Leipzig, 16 – 19 October 1813. Napoleon holds a ring of villages round the town, the allies close in from
// the south (Army of Bohemia), the north-west (Silesia), and on the 18th the north-east (North) and east (Poland).
// Frame: origin at the old town, u north and w east, so E(x, y) places a point x metres east and y metres north.
// Village positions are approximate, to a few hundred metres.
import { frame, writePlan } from './lib.mjs';

const f = frame([12.375, 51.34], 0), E = (x, y) => f.p(y, x);
const G = 'pages/100-sixth-coalition/030-leipzig';
const bbox = f.box([[-11500, -8000], [6500, 9500]], 0);
const water = [
  { path: [[12.315, 51.215], [12.322, 51.25], [12.33, 51.28], [12.338, 51.305], [12.348, 51.325], [12.357, 51.34], [12.348, 51.35], [12.328, 51.36], [12.305, 51.37], [12.27, 51.38], [12.235, 51.39]], width: 60, id: 'elster', name: 'The White Elster' },
  { path: [[12.395, 51.225], [12.392, 51.25], [12.387, 51.275], [12.389, 51.29], [12.38, 51.302], [12.372, 51.315], [12.367, 51.33], [12.366, 51.345], [12.352, 51.351]], width: 45, id: 'pleisse', name: 'The Pleisse' },
  { path: [[12.505, 51.392], [12.49, 51.383], [12.465, 51.376], [12.44, 51.372], [12.42, 51.366], [12.4, 51.358], [12.383, 51.354], [12.366, 51.349]], width: 40, id: 'parthe', name: 'The Parthe' },
];
const town = { side: 'neutral', path: [[12.368, 51.344], [12.377, 51.3455], [12.383, 51.343], [12.384, 51.338], [12.379, 51.3355], [12.37, 51.336], [12.367, 51.34], [12.368, 51.344]], width: 70, id: 'leipzig', name: 'Leipzig, the walled old town' };
// id and name: what the reader sees on pointing at a block; blocks that share an id highlight together
const unit = (side, type, x, y, width, depth, facing, id, name, extra = {}) => ({ side, type, at: E(x, y), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: pts.map(([x, y]) => E(x, y)), width, id, name, ...(style ? { style } : {}) });
const mark = (x, y, label, note, color, icon = 'user') => ({ lnglat: E(x, y), icon, color, label, note });
const clash = (x, y, size) => size ? { at: E(x, y), size } : E(x, y);

// --- overview: the armies converge, 3 – 15 October ---
writePlan(`${G}/010-leipzig`, {
  routes: {
    'napoleon-leipzig-1813': { name: 'Napoleon leaves Dresden, waits at Düben and turns back to Leipzig, 7 – 15 October 1813',
      path: [[13.74, 51.05], [13.47, 51.16], [13.11, 51.3], [12.74, 51.37], [12.63, 51.46], [12.58, 51.58], [12.47, 51.47], [12.4, 51.36]] },
    'blucher-leipzig-1813': { name: 'Blücher crosses the Elbe at Wartenburg and comes on Leipzig from the north-west, October 1813',
      path: [[12.79, 51.83], [12.6, 51.68], [12.3, 51.58], [12.0, 51.5], [12.15, 51.42], [12.3, 51.38]] },
    'charles-john-leipzig-1813': { name: 'The Army of the North crosses the Elbe and comes south by Halle, reaching the field on 18 October',
      path: [[12.24, 51.86], [12.1, 51.72], [12.0, 51.58], [12.25, 51.45], [12.43, 51.41], [12.49, 51.38]] },
    'schwarzenberg-leipzig-1813': { name: 'The Army of Bohemia marches out of Bohemia to the south of Leipzig, October 1813',
      path: [[13.25, 50.5], [13.16, 50.65], [12.92, 50.83], [12.71, 50.93], [12.5, 51.12], [12.44, 51.24]] },
    'bennigsen-leipzig-1813': { name: 'Bennigsen’s Army of Poland comes up from the Elbe, reaching the field on 18 October',
      path: [[13.6, 51.1], [13.15, 51.18], [12.73, 51.24], [12.59, 51.28], [12.48, 51.3]] },
  },
  markers: {
    'leipzig-duben': { lnglat: [12.58, 51.59], icon: 'flag', color: 'france', label: 'Düben', note: 'Napoleon’s headquarters, 10 – 13 October' },
    'leipzig-dresden': { lnglat: [13.74, 51.05], icon: 'castle', color: 'france', label: 'Dresden', note: 'Saint-Cyr and Lobau left behind' },
    'leipzig-wartenburg': { lnglat: [12.79, 51.83], icon: 'waves', color: 'prussia', label: 'Wartenburg', note: 'Blücher crosses the Elbe' },
  },
});

// --- 16 October: the attack on the southern villages, Möckern and Lindenau ---
writePlan(`${G}/020-leipzig-wachau`, {
  bbox,
  emblem: {
    water, works: [town],
    units: [
      unit('france', 'infantry', 1800, -6700, 1600, 300, 180, 'poniatowski', 'Poniatowski’s Poles and Augereau’s conscripts at Markkleeberg'),
      unit('france', 'infantry', 4700, -6950, 1300, 350, 190, 'wachau', 'French infantry and the Young Guard at Wachau'),
      unit('france', 'infantry', 7800, -6850, 1500, 400, 160, 'liebertwolkwitz', 'Macdonald and Lauriston at Liebertwolkwitz, about 18,000'),
      unit('france', 'artillery', 6250, -7600, 2000, 120, 190, 'drouot', 'Drouot’s battery of 150 guns on the Galgenberg', { count: 14 }),
      unit('france', 'cavalry', 6200, -8300, 1300, 350, 200, 'murat', 'Murat’s cavalry, 10,000 French, Italian and Saxon horse'),
      unit('france', 'infantry', -2500, 3100, 1800, 400, 315, 'marmont', 'Marmont’s VI Corps at Möckern'),
      unit('france', 'infantry', -3600, -200, 1200, 350, 260, 'bertrand', 'Bertrand’s IV Corps at Lindenau'),
      unit('prussia', 'infantry', 1700, -7350, 1600, 400, 0, 'kleist', 'Kleist’s Prussians and the Russian 14th Division'),
      unit('russia', 'infantry', 3400, -8800, 1500, 400, 20, 'eugen', 'Russian II Corps under Eugen of Württemberg, with the Prussian 9th Brigade'),
      unit('austria', 'infantry', 8600, -8400, 1800, 450, 330, 'klenau', 'Klenau’s Austrian IV Corps, 24,500, with two Prussian brigades'),
      unit('prussia', 'infantry', -4300, 4700, 1800, 450, 135, 'yorck', 'Yorck’s Prussians, with Langeron’s Russians beyond'),
      unit('austria', 'infantry', -5600, -1000, 1500, 400, 75, 'gyulay', 'Gyulay’s Austrian III Corps'),
    ],
    arrows: [
      arrow('france', [[5900, -8550], [5400, -9100], [4900, -9550]], 200, 'murat-charge', 'Murat charges towards Güldengossa'),
      arrow('russia', [[4300, -10900], [4700, -10300], [5000, -9800]], 200, 'allied-reserve', 'The Russian Guard and Austrian grenadiers counter-attack'),
      arrow('austria', [[8300, -8100], [8050, -7550], [7900, -7150]], 180, 'klenau-attack', 'Klenau attacks Liebertwolkwitz'),
      arrow('prussia', [[-3900, 4350], [-3400, 3850], [-2950, 3400]], 180, 'yorck-attack', 'Yorck attacks Möckern'),
      arrow('austria', [[-5150, -850], [-4650, -600], [-4300, -400]], 160, 'gyulay-attack', 'Gyulay attacks Lindenau'),
    ],
    clashes: [clash(1750, -7020), clash(4950, -9750, 220), clash(7900, -7080), clash(-2850, 3330)],
  },
  markers: {
    'leipzig-16-napoleon': mark(5800, -4600, 'Napoleon', 'Directs the attack in the south', 'france'),
    'leipzig-16-merveldt': mark(-1500, -5000, 'Merveldt', 'Wounded and captured at Dölitz', 'austria'),
    'leipzig-16-blucher': mark(-6300, 6200, 'Blücher', 'Attacks Marmont at Möckern', 'prussia'),
  },
});

// --- 18 October: the allies attack from all sides ---
writePlan(`${G}/030-leipzig-encirclement`, {
  bbox,
  emblem: {
    water, works: [town],
    units: [
      unit('france', 'infantry', 1300, -4900, 1500, 300, 160, 'poniatowski', 'Poniatowski and Augereau between Connewitz and Dölitz'),
      unit('france', 'infantry', 3100, -3300, 1500, 400, 165, 'probstheida', 'French infantry and the Imperial Guard at Probstheida'),
      unit('france', 'infantry', 4700, -1500, 1500, 350, 100, 'macdonald', 'Macdonald’s XI Corps between Stötteritz and Mölkau'),
      unit('rhine', 'infantry', 5500, 550, 1000, 300, 90, 'saxons', 'Saxons of Reynier’s VII Corps at Paunsdorf, 5,400'),
      unit('france', 'infantry', 3300, 1500, 2000, 350, 60, 'ney', 'Ney’s troops at Sellerhausen and Schönefeld'),
      unit('france', 'infantry', -5200, -1500, 1200, 350, 250, 'bertrand', 'Bertrand’s IV Corps opens the road to Weissenfels'),
      unit('austria', 'infantry', 2300, -6300, 1500, 400, 340, 'hessen-homburg', 'Hessen-Homburg’s Austrians before Dölitz and Lössnig'),
      unit('russia', 'infantry', 3900, -4700, 1800, 500, 345, 'barclay', 'Barclay de Tolly’s Russians and Prussians, about 60,000'),
      unit('russia', 'infantry', 6800, -3300, 1800, 400, 290, 'bennigsen', 'Bennigsen’s Army of Poland at Holzhausen and Zuckelhausen'),
      unit('sweden', 'infantry', 7600, 1200, 1800, 450, 270, 'charles-john', 'Charles John’s Army of the North, with the British rocket troop'),
      unit('russia', 'infantry', 3400, 3800, 1500, 400, 210, 'langeron', 'Langeron’s Russians'),
    ],
    arrows: [
      arrow('russia', [[3700, -4400], [3450, -3950], [3200, -3600]], 220, 'barclay-assault', 'Barclay’s assaults on Probstheida'),
      arrow('sweden', [[6700, 1000], [6400, 800], [6100, 650]], 180, 'paunsdorf-attack', 'The Army of the North attacks Paunsdorf'),
      arrow('russia', [[3250, 3550], [3050, 3100], [2900, 2700]], 180, 'langeron-attack', 'Langeron storms Schönefeld'),
      arrow('rhine', [[5800, 900], [6300, 1300], [6750, 1450]], 150, 'saxons-defect', 'The Saxons go over to the allies'),
      arrow('france', [[-3500, -300], [-4800, -1000], [-6500, -2100], [-7800, -2900]], 200, 'bertrand-west', 'Bertrand clears the road west'),
    ],
    clashes: [clash(3150, -3600), clash(1750, -5600), clash(2900, 2600), clash(6050, 600)],
  },
  markers: {
    'leipzig-18-napoleon': mark(600, -1700, 'Napoleon', 'Command post at Stötteritz', 'france'),
    'leipzig-18-raevsky': mark(5200, -5500, 'Raevsky', 'Leads the third assault', 'russia'),
    'leipzig-18-bogue': mark(7000, -400, 'Captain Bogue', 'Rocket troop, killed at Paunsdorf', 'britain', 'skull'),
    'leipzig-18-charles-john': mark(7600, 3700, 'Charles John', 'Army of the North', 'sweden'),
  },
});

// --- 19 October: the retreat over the Elster ---
writePlan(`${G}/040-leipzig-retreat`, {
  bbox,
  emblem: {
    water, works: [town],
    units: [
      unit('france', 'infantry', 1300, 300, 1100, 250, 90, 'rearguard', 'The rearguard: VII, VIII and XI Corps in the suburbs'),
      unit('france', 'infantry', 300, 1250, 1100, 250, 15, 'rearguard', 'The rearguard: VII, VIII and XI Corps in the suburbs'),
      unit('france', 'infantry', 900, -1000, 1100, 250, 180, 'rearguard', 'The rearguard: VII, VIII and XI Corps in the suburbs'),
      unit('france', 'infantry', -6000, -2300, 450, 2500, 245, 'retreat', 'The army retreats on the road to Weissenfels, over 100,000'),
      unit('prussia', 'infantry', 300, 3300, 1800, 450, 180, 'silesia', 'Blücher’s Army of Silesia'),
      unit('sweden', 'infantry', 3900, 700, 1600, 450, 265, 'north', 'Charles John’s Army of the North, with the Swedish jägers'),
      unit('russia', 'infantry', 3300, -2500, 1600, 450, 305, 'bennigsen', 'Bennigsen’s Russians'),
      unit('austria', 'infantry', 900, -3700, 1600, 450, 0, 'austrians', 'Austrians of the Army of Bohemia'),
    ],
    arrows: [
      arrow('france', [[-300, 150], [-1200, 50], [-2600, -150], [-3800, -700], [-4700, -1500]], 260, 'retreat-west', 'The retreat over the Elster bridge to Lindenau', 'dashed'),
      arrow('prussia', [[300, 3000], [300, 2200], [300, 1550]], 200, 'silesia-attack', 'Blücher’s troops break in at the Halle gate'),
      arrow('sweden', [[3550, 650], [2700, 500], [1950, 350]], 200, 'north-attack', 'Russians and Swedes attack at the Grimma gate'),
      arrow('russia', [[3000, -2250], [2200, -1700], [1500, -1100]], 180, 'bennigsen-attack', 'Bennigsen attacks from the south-east'),
      arrow('austria', [[900, -3400], [900, -2300], [900, -1250]], 180, 'austrian-attack', 'The Austrians attack from the south'),
    ],
    clashes: [clash(300, 1480), clash(1950, 300), clash(900, -1180)],
  },
  markers: {
    'leipzig-19-bridge': { lnglat: [12.358, 51.3415], icon: 'skull', color: 'france', label: 'Elster bridge', note: 'Blown at 13:00, 30,000 cut off' },
    'leipzig-19-poniatowski': { lnglat: [12.343, 51.322], icon: 'skull', color: 'france', label: 'Poniatowski', note: 'Drowns in the Elster' },
    'leipzig-19-swedes': mark(2800, 3300, 'Swedish jägers', '647 prisoners for 35 dead', 'sweden', 'swords'),
  },
});

console.log('leipzig: bbox', JSON.stringify(bbox));
