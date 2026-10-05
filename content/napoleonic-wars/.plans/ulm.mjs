// Ulm, October 1805. The overview carries the march of the Grande Armée from the Channel to the Danube. The phases
// share one field north-east of Ulm: the Danube runs east-north-east from the city past Thalfingen and below the
// heights of Elchingen, and the plateau to the north holds Jungingen, Haslach and Albeck. The river follows the
// northern edge of the valley floor on the elevation tiles; the battle sites are the articles' coordinates.
import { writePlan } from './lib.mjs';

const G = 'pages/050-third-coalition/020-ulm';
const at = ([lon, lat], dx = 0, dy = 0) => { const kx = 111320 * Math.cos(lat * Math.PI / 180); return [+(lon + dx / kx).toFixed(5), +(lat + dy / 110540).toFixed(5)]; };
const PL = {
  ulm: [9.992, 48.398], michelsberg: [9.995, 48.413], jungingen: [9.99, 48.453], haslach: [10.03, 48.455], albeck: [10.075, 48.488],
  thalfingen: [10.034, 48.437], abbey: [10.0906, 48.4542], bridge: [10.093, 48.4335],
};
const danube = { path: [[9.94, 48.386], [9.97, 48.391], [9.99, 48.395], [10.005, 48.398], [10.02, 48.405], [10.032, 48.418], [10.048, 48.428],
  [10.068, 48.434], [10.09, 48.437], [10.115, 48.438], [10.135, 48.44]], width: 110, id: 'danube', name: 'The Danube' };
const bbox = [9.94, 48.375, 10.13, 48.5];

const FR = 'france', AU = 'austria';
const unit = (side, type, pos, width, depth, facing, id, name, extra = {}) => ({ side, type, at: pos, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (pos, label, note, color, icon = 'user') => ({ lnglat: pos, icon, color, label, note });

// --- overview: from the Channel and Hanover to the Danube; Mack from the Inn to Ulm ---
writePlan(`${G}/010-ulm`, {
  routes: {
    'grande-armee-1805': { name: 'From the Channel to the Rhine, 27 August to 24 September 1805',
      path: [[1.61, 50.73], [2.78, 50.29], [4.03, 49.26], [6.18, 48.69], [7.75, 48.58]] },
    'grande-armee-danube-1805': { name: 'Across the Rhine to the Danube at Donauwörth, 25 September to 7 October',
      path: [[8.47, 49.49], [9.22, 49.14], [10.13, 48.96], [10.49, 48.85], [10.78, 48.72]] },
    'murat-1805': { name: 'Murat’s cavalry in the Black Forest, late September',
      path: [[7.75, 48.58], [8.41, 48.46], [9.18, 48.78], [9.95, 48.8]] },
    'bernadotte-1805': { name: 'Bernadotte from Hanover through Ansbach to Munich',
      path: [[9.73, 52.37], [9.93, 51.53], [9.93, 49.79], [10.57, 49.3], [11.42, 48.76], [11.58, 48.14]] },
    'marmont-1805': { name: 'Marmont from Utrecht by Mainz to Würzburg', offset: 6,
      path: [[5.12, 52.09], [6.95, 50.94], [8.27, 50.0], [9.93, 49.79]] },
    'mack-1805': { name: 'Mack from the Inn to Ulm, September 1805',
      path: [[12.95, 48.2], [11.58, 48.14], [10.9, 48.37], [9.99, 48.4]] },
  },
  markers: {
    'ulm-boulogne': { lnglat: [1.61, 50.73], icon: 'flag', color: FR, label: 'Boulogne', note: 'The camps break up, 27 August' },
    'ulm-ansbach': { lnglat: [10.57, 49.3], icon: 'flag', color: 'prussia', label: 'Ansbach' },
  },
});

// --- 11 October: Dupont alone on the north bank stops Mack's breakout at Haslach and Jungingen ---
writePlan(`${G}/020-ulm-haslach`, {
  bbox,
  emblem: {
    water: [danube],
    units: [
      unit(FR, 'infantry', at(PL.jungingen, 250, 0), 500, 250, 200, '9th-light', 'The 9th Light in Jungingen, holding the church'),
      unit(FR, 'infantry', at(PL.haslach, -300, -200), 1200, 250, 210, 'dupont', 'Dupont’s division, the 32nd and 96th Line, 4,000 to 6,000 in all'),
      unit(FR, 'cavalry', at(PL.haslach, 1300, 200), 700, 250, 210, 'tilly', 'Tilly’s cavalry, about 900'),
      unit(AU, 'infantry', at(PL.michelsberg, -900, 2600), 1500, 400, 20, 'austrian-left', 'Austrian columns under Mack and Schwarzenberg, about 25,000 in all'),
      unit(AU, 'infantry', at(PL.michelsberg, 1700, 2000), 1300, 400, 30, 'austrian-left', 'Austrian columns under Mack and Schwarzenberg, about 25,000 in all'),
      unit(AU, 'cavalry', [9.963, 48.449], 1400, 350, 60, 'austrian-cavalry', 'Austrian cavalry, held back by the woods north of Dupont'),
      unit(FR, 'infantry', [10.075, 48.418], 1500, 350, 0, 'ney-south', 'Loison’s and Malher’s divisions of Ney’s corps, ordered to the south bank'),
    ],
    arrows: [
      arrow(AU, [at(PL.michelsberg, -900, 2900), at(PL.jungingen, 100, -700), at(PL.jungingen, 200, -150)], 160, 'austrian-attack', 'The Austrians attack Jungingen and Haslach'),
      arrow(AU, [at(PL.michelsberg, 1700, 2300), at(PL.haslach, -900, -1200), at(PL.haslach, -500, -500)], 160, 'austrian-attack', 'The Austrians attack Jungingen and Haslach'),
      arrow(FR, [at(PL.haslach, -500, -350), at(PL.haslach, -1200, -1300), at(PL.haslach, -1500, -1900)], 150, 'dupont-attack', 'Dupont attacks rather than retreat'),
      arrow(FR, [at(PL.haslach, 500, 400), at(PL.albeck, -1900, -1900), at(PL.albeck, -1000, -900)], 140, 'dupont-withdraws', 'Dupont withdraws to Albeck at nightfall', 'dashed'),
    ],
    clashes: [at(PL.jungingen, 250, -300), at(PL.haslach, -900, -700)],
  },
  markers: {
    'ulm-haslach-dupont': mark(at(PL.haslach, 2400, -600), 'Dupont', 'Takes about 4,000 prisoners', FR),
    'ulm-haslach-mack': mark(at(PL.michelsberg, -2500, 1500), 'Mack', 'Lightly wounded, returns to Ulm', AU),
    'ulm-haslach-albeck': mark(PL.albeck, 'Albeck', undefined, FR, 'flag'),
    'ulm-haslach-ulm': mark(at(PL.ulm, 0, -600), 'Ulm', undefined, AU, 'castle'),
    'ulm-haslach-ney': mark([10.1, 48.405], 'Ney', 'Protests the order to cross', FR),
  },
});

// --- 14 October: Ney crosses at Elchingen and drives Riesch off the heights ---
const bridge = { side: 'neutral', path: [[10.0932, 48.4315], [10.0928, 48.4395]], width: 40, id: 'elchingen-bridge', name: 'The Elchingen bridge, partly dismantled' };
writePlan(`${G}/030-ulm-elchingen`, {
  bbox,
  emblem: {
    water: [danube],
    works: [bridge],
    units: [
      unit(AU, 'infantry', at(PL.abbey, -800, -300), 1600, 400, 160, 'riesch', 'Riesch’s corps on the heights of Elchingen, 8,000 to 15,000'),
      unit(AU, 'cavalry', at(PL.abbey, -2200, -700), 900, 300, 150, 'riesch-cavalry', 'Riesch’s cavalry, which drives back the 39th Line'),
      unit(FR, 'infantry', at(PL.abbey, 300, -1000), 1100, 300, 340, 'loison', 'Loison’s division: Villatte’s and Roguet’s brigades, with the 6th Light'),
      unit(FR, 'cavalry', [10.102, 48.4485], 800, 250, 300, 'colbert', 'Colbert’s cavalry'),
      unit(FR, 'infantry', [10.105, 48.421], 1200, 300, 0, 'malher', 'Malher’s division, crossing further east'),
      unit(FR, 'infantry', at(PL.albeck, -400, -1500), 1000, 250, 200, 'dupont', 'Dupont’s division, coming from the north-east'),
    ],
    arrows: [
      arrow(FR, [at(PL.bridge, 0, -1100), at(PL.bridge, 0, 600), at(PL.abbey, 200, -1300)], 170, 'loison-crossing', 'Villatte’s elite companies cross the bridge'),
      arrow(FR, [at(PL.abbey, 300, -800), at(PL.abbey, 0, -300), at(PL.abbey, -500, 100)], 150, 'abbey-attack', 'The 6th Light, led by Ney, takes the abbey and Ober-Elchingen'),
      arrow(FR, [[10.125, 48.428], [10.125, 48.439], [10.113, 48.4435]], 150, 'malher-sweep', 'Malher sweeps west along the north bank'),
      arrow(AU, [at(PL.abbey, -1700, 0), at(PL.haslach, 700, -300), at(PL.thalfingen, -1400, -1000), at(PL.michelsberg, 900, 600)], 150, 'riesch-retreat', 'Riesch retreats into the woods and back to Ulm', 'dashed'),
      arrow(FR, [at(PL.albeck, -400, -1800), [10.074, 48.4635], [10.077, 48.4575]], 140, 'dupont-advance', 'Dupont closes from the north-east'),
    ],
    clashes: [at(PL.abbey, -300, -500), at(PL.abbey, -1400, -1000)],
  },
  markers: {
    'ulm-elchingen-abbey': mark(at(PL.abbey, 1700, 1300), 'Elchingen Abbey', 'Taken by the 6th Light', FR, 'church'),
    'ulm-elchingen-ney': mark(at(PL.bridge, -1600, -1300), 'Ney', 'Crosses at 8 a.m.', FR),
    'ulm-elchingen-riesch': mark(at(PL.abbey, -3000, 1700), 'Riesch', '4,000 prisoners lost', AU),
    'ulm-elchingen-ulm': mark(at(PL.ulm, 0, -600), 'Ulm', undefined, AU, 'castle'),
  },
});

// --- 15 to 20 October: Ulm invested, the Michelsberg stormed, Werneck pursued, Mack surrenders ---
writePlan(`${G}/040-ulm-surrender`, {
  bbox,
  emblem: {
    water: [danube],
    units: [
      unit(AU, 'camp', [9.99, 48.4025], 1300, 800, 180, 'mack', 'Mack’s army shut up in Ulm, 23,000 to 25,000 men'),
      unit(FR, 'infantry', at(PL.michelsberg, 300, 1100), 1500, 300, 190, 'ney', 'Ney’s VI Corps on the Michelsberg'),
      unit(FR, 'artillery', at(PL.michelsberg, 0, 500), 700, 160, 180, 'french-guns', 'French batteries bombard Ulm', { count: 6 }),
      unit(FR, 'infantry', [9.958, 48.415], 1300, 300, 130, 'lannes', 'Lannes’s V Corps north-west of the city'),
      unit(FR, 'infantry', [10.012, 48.386], 1500, 300, 315, 'marmont', 'Marmont’s II Corps and the Imperial Guard south of the Danube'),
      unit(FR, 'cavalry', at(PL.albeck, 500, 800), 1000, 250, 30, 'murat', 'Murat’s cavalry and Dupont pursue Werneck'),
    ],
    arrows: [
      arrow(FR, [at(PL.michelsberg, 1500, 2300), at(PL.michelsberg, 800, 1600)], 160, 'ney-storms', 'Ney’s troops storm the camps on the Michelsberg, 15 October'),
      arrow(FR, [at(PL.albeck, 1000, 1300), [10.11, 48.505]], 150, 'murat-pursuit', 'Murat’s pursuit towards Heidenheim and Trochtelfingen'),
      arrow(AU, [at(PL.ulm, 900, 500), at(PL.thalfingen, 600, 1800), at(PL.albeck, -300, 1000)], 130, 'ferdinand-escapes', 'Archduke Ferdinand leaves Ulm with the cavalry, 14 October', 'dashed'),
      arrow(FR, [[9.975, 48.375], [9.985, 48.383]], 140, 'soult-approach', 'Soult closes the road to the Tyrol from Memmingen'),
    ],
    clashes: [at(PL.michelsberg, 400, 800)],
  },
  markers: {
    'ulm-surrender-mack': mark([9.965, 48.394], 'Mack', 'Capitulates on 20 October', AU),
    'ulm-surrender-napoleon': mark([9.962, 48.437], 'Napoleon', 'Receives Mack’s surrender', FR),
    'ulm-surrender-werneck': mark([10.1, 48.48], 'Werneck', 'Surrenders on 18 October', AU),
  },
});

console.log('ulm: bbox', JSON.stringify(bbox));
