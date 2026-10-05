// Arcole, 15 to 17 November 1796. Bonaparte crosses the Adige at Ronco behind Alvinczi's left; beyond the river the
// marsh can be crossed only on the dikes: north-east along the Alpone to the bridge of Arcole, north-west to Belfiore.
// The plain is flat and the map shows no rivers here, so the Adige, the Alpone and the dikes are drawn from the towns'
// positions (Ronco on the right bank, Albaredo below the mouth of the Alpone, Arcole east of the bridge).
import { frame, writePlan } from './lib.mjs';

const ARCOLE = [11.2775, 45.357];
const f = frame(ARCOLE, 0);
const G = 'pages/020-first-coalition/080-arcole';
const bbox = f.box([[-5300, -6600], [3900, 2200]], 0);
const adige = { path: [[11.17, 45.366], [11.2, 45.359], [11.225, 45.35], [11.243, 45.342], [11.256, 45.335], [11.264, 45.327], [11.27, 45.318], [11.276, 45.31], [11.287, 45.302], [11.305, 45.297]], width: 130, id: 'adige', name: 'The river Adige' };
const alpone = { path: [[11.271, 45.4], [11.273, 45.385], [11.275, 45.37], [11.2745, 45.357], [11.272, 45.347], [11.269, 45.337], [11.2655, 45.3265]], width: 35, id: 'alpone', name: 'The Alpone, about 20 yards wide' };
const dike = (path, id, name) => ({ side: 'neutral', path, width: 30, id, name });
const dikes = [
  dike([[11.2495, 45.3405], [11.258, 45.3462], [11.266, 45.3512], [11.2728, 45.3562]], 'dike-arcole', 'The dike road from Ronco to the bridge of Arcole'),
  dike([[11.2478, 45.3412], [11.236, 45.352], [11.226, 45.364], [11.214, 45.378]], 'dike-belfiore', 'The dike road to Belfiore'),
  dike([[11.2685, 45.3275], [11.2715, 45.337], [11.2745, 45.347], [11.2765, 45.355]], 'dike-east', 'The dike on the east bank of the Alpone'),
];
const pontoons = { side: 'france', path: [[11.2477, 45.3383], [11.2493, 45.3397]], width: 40, id: 'pontoons', name: 'Andréossy’s pontoon bridge at Ronco' };
const water = [adige, alpone];
const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const arrow = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: the relief armies of 1796 and the march to Ronco ---
writePlan(`${G}/010-arcole`, {
  routes: {
    'wurmser-1796': { name: 'Wurmser’s first relief down the Adige to Mantua, late July 1796',
      path: [[11.12, 46.07], [11.04, 45.89], [10.92, 45.72], [10.82, 45.58], [10.83, 45.42], [10.81, 45.25], [10.8, 45.17]] },
    'wurmser-bassano-1796': { name: 'Wurmser through the Brenta valley and Bassano into Mantua, September 1796', offset: 6,
      path: [[11.12, 46.07], [11.3, 46.01], [11.6, 45.98], [11.73, 45.78], [11.55, 45.55], [11.35, 45.3], [11.21, 45.19], [11.0, 45.17], [10.81, 45.16]] },
    'alvinczi-1796': { name: 'Alvinczi advances from the Piave to Caldiero, November 1796',
      path: [[12.2, 45.8], [11.95, 45.78], [11.73, 45.77], [11.55, 45.55], [11.38, 45.46], [11.26, 45.43], [11.18, 45.415]] },
    'davidovich-1796': { name: 'Davidovich comes down the Adige from Tyrol to Rivoli, November 1796',
      path: [[11.12, 46.07], [11.09, 45.93], [11.0, 45.8], [10.88, 45.65], [10.82, 45.58]] },
    'bonaparte-ronco-1796': { name: 'Bonaparte marches from Verona down the Adige to Ronco, 14 to 15 November 1796',
      path: [[10.99, 45.44], [11.04, 45.39], [11.1, 45.36], [11.18, 45.35], [11.245, 45.336]] },
  },
  markers: {
    'arcole-mantua': { lnglat: [10.79, 45.16], icon: 'castle', color: 'austria', label: 'Mantua', note: 'Besieged by the French from June' },
    'arcole-castiglione': { lnglat: [10.49, 45.39], icon: 'swords', color: 'france', label: 'Castiglione', note: 'Wurmser defeated, 5 August' },
    'arcole-bassano': { lnglat: [11.73, 45.77], icon: 'swords', label: 'Bassano', note: '8 September and 6 November' },
    'arcole-calliano': { lnglat: [11.09, 45.93], icon: 'swords', color: 'austria', label: 'Calliano', note: 'Vaubois routed, 7 November' },
    'arcole-caldiero': { lnglat: [11.18, 45.415], icon: 'swords', color: 'austria', label: 'Caldiero', note: 'Bonaparte repulsed, 12 November' },
    'arcole-verona': { lnglat: [10.99, 45.44], icon: 'flag', color: 'france', label: 'Verona', note: 'Held by 3,000 French' },
  },
});

// --- 15 November: the attack on the bridge ---
writePlan(`${G}/020-arcole-bridge`, {
  bbox,
  emblem: {
    water,
    works: [...dikes, pontoons],
    units: [
      unit('france', 'infantry', [11.2665, 45.3512], 150, 650, 45, 'augereau', 'Augereau’s division on the dike before the bridge, about 6,000'),
      unit('france', 'infantry', [11.231, 45.358], 180, 750, 330, 'massena', 'Masséna’s division on the dike to Belfiore, about 7,900'),
      unit('france', 'infantry', [11.2415, 45.3315], 450, 180, 30, 'reserve', 'French reserve at Ronco, 2,600 infantry with cavalry'),
      unit('austria', 'infantry', [11.2795, 45.3575], 320, 200, 225, 'brigido', 'Brigido’s two battalions in Arcole'),
      unit('austria', 'artillery', [11.2762, 45.3555], 90, 45, 225, 'arcole-guns', 'Two Austrian guns at the bridge', { count: 2 }),
      unit('austria', 'infantry', [11.2795, 45.3655], 500, 220, 195, 'mittrowsky', 'Mittrowsky’s reinforcements, arriving at midday'),
      unit('austria', 'infantry', [11.2085, 45.3845], 600, 220, 140, 'brabeck', 'Brabeck’s and Gavasini’s brigades, driven back beyond Belfiore'),
    ],
    arrows: [
      arrow('france', [[11.268, 45.3528], [11.2712, 45.3549]], 130, 'bridge-attack', 'Augereau’s attacks on the bridge stall'),
      arrow('austria', [[11.212, 45.3805], [11.2195, 45.3725], [11.2255, 45.3655]], 120, 'brabeck-attack', 'Brabeck and Gavasini advance against the pontoon bridge'),
      arrow('austria', [[11.2235, 45.3685], [11.217, 45.3765], [11.2105, 45.3825]], 110, 'brabeck-flight', 'The Austrians fire on each other and fall back', 'dashed'),
      arrow('france', [[11.2665, 45.3105], [11.2765, 45.3185], [11.2805, 45.333], [11.2805, 45.354]], 110, 'guieu', 'Guieu crosses at Albaredo in the evening and takes Arcole'),
      arrow('austria', [[11.2805, 45.385], [11.2805, 45.3705]], 110, 'mittrowsky-arrives', 'Mittrowsky marches down to Arcole'),
    ],
    clashes: [{ at: [11.2732, 45.3556], size: 140 }, { at: [11.2272, 45.3635], size: 150 }],
  },
  markers: {
    'arcole-bridge-bonaparte': mark([11.2525, 45.3575], 'Bonaparte', 'With a flag, 55 paces from the bridge', 'france'),
    'arcole-bridge-ronco': mark([11.2405, 45.3285], 'Ronco', 'Pontoon bridge over the Adige', 'france', 'flag'),
    'arcole-bridge-arcole': mark([11.2885, 45.3565], 'Arcole', 'Held by Brigido', 'austria', 'flag'),
    'arcole-bridge-albaredo': mark([11.2805, 45.3165], 'Albaredo', 'Guieu crosses in the evening', 'france', 'flag'),
    'arcole-bridge-belfiore': mark([11.2005, 45.3875], 'Belfiore', 'Austrian brigades driven back', 'austria', 'flag'),
  },
});

// --- 16 November: Provera beaten at Belfiore, Mittrowsky holds the dikes at Arcole ---
writePlan(`${G}/030-arcole-dikes`, {
  bbox,
  emblem: {
    water,
    works: [...dikes, pontoons],
    units: [
      unit('france', 'infantry', [11.2205, 45.3705], 180, 700, 320, 'massena', 'Masséna’s division, chasing Provera back to Belfiore'),
      unit('france', 'infantry', [11.2635, 45.3495], 150, 650, 38, 'augereau', 'Augereau’s division on the dike'),
      unit('austria', 'infantry', [11.2085, 45.3845], 500, 220, 140, 'provera', 'Provera’s six battalions, thrown back to Belfiore'),
      unit('austria', 'infantry', [11.2712, 45.3635], 140, 600, 190, 'sticker', 'Sticker’s four battalions on the western dike of the Alpone'),
      unit('austria', 'infantry', [11.2772, 45.3485], 130, 650, 200, 'brigido', 'Brigido’s four battalions on the eastern dike'),
      unit('austria', 'infantry', [11.2805, 45.3585], 350, 250, 225, 'mittrowsky', 'Mittrowsky’s main body in Arcole'),
      unit('austria', 'infantry', [11.2795, 45.3215], 300, 150, 230, 'albaredo-guard', 'Two Austrian battalions guarding Albaredo'),
    ],
    arrows: [
      arrow('austria', [[11.2125, 45.381], [11.218, 45.3755]], 120, 'provera-attack', 'Provera attacks from Belfiore'),
      arrow('france', [[11.2665, 45.3515], [11.2705, 45.3545]], 130, 'arcole-attacks', 'Repeated French attacks on Arcole fail'),
      arrow('france', [[11.2645, 45.3105], [11.2715, 45.3165]], 100, 'albaredo-attempt', 'The attempt to cross at Albaredo fails'),
    ],
    clashes: [{ at: [11.2195, 45.3745], size: 150 }, { at: [11.273, 45.3558], size: 140 }, { at: [11.2745, 45.3195], size: 120 }],
  },
  markers: {
    'arcole-dikes-brabeck': mark([11.205, 45.376], 'Brabeck', 'Killed, five guns lost', 'austria', 'skull'),
    'arcole-dikes-sticker': mark([11.2655, 45.3655], 'Sticker', 'Western dike', 'austria'),
    'arcole-dikes-brigido': mark([11.2835, 45.3445], 'Brigido', 'Eastern dike', 'austria'),
    'arcole-dikes-mittrowsky': mark([11.2895, 45.3615], 'Mittrowsky', 'Holds Arcole with 14 battalions', 'austria'),
    'arcole-dikes-albaredo': mark([11.2845, 45.3175], 'Albaredo', 'Guarded by two battalions', 'austria', 'flag'),
  },
});

// --- 17 November: the Alpone bridged near its mouth, Masséna's ambush, Arcole taken ---
const alponeBridge = { side: 'france', path: [[11.2652, 45.3296], [11.2687, 45.3288]], width: 35, id: 'alpone-bridge', name: 'Pontoon bridge over the Alpone near its mouth' };
writePlan(`${G}/040-arcole-alpone`, {
  bbox,
  emblem: {
    water,
    works: [...dikes, pontoons, alponeBridge],
    units: [
      unit('france', 'infantry', [11.2782, 45.3555], 300, 200, 20, 'augereau', 'Augereau’s division, entering Arcole from the south'),
      unit('france', 'infantry', [11.2712, 45.3545], 140, 500, 40, 'massena', 'Masséna’s reinforcements and Robert’s demi-brigades on the western dike'),
      unit('france', 'infantry', [11.2185, 45.3745], 160, 600, 320, 'massena-belfiore', 'Masséna’s troops at Belfiore, beating Provera again'),
      unit('austria', 'infantry', [11.2795, 45.3655], 400, 220, 190, 'mittrowsky', 'Mittrowsky’s troops, driven out of Arcole'),
      unit('austria', 'infantry', [11.2775, 45.3795], 600, 220, 190, 'schubirz', 'Schübirz’s brigade, covering the retreat'),
    ],
    arrows: [
      arrow('france', [[11.2695, 45.331], [11.2735, 45.342], [11.2768, 45.352]], 130, 'augereau-advance', 'Augereau crosses the Alpone and fights north along the eastern dike'),
      arrow('france', [[11.229, 45.3605], [11.236, 45.352], [11.2465, 45.3435], [11.258, 45.3462], [11.2665, 45.3515]], 120, 'massena-ambush', 'Masséna comes back from the west and ambushes the Austrians on the dike'),
      arrow('france', [[11.296, 45.3155], [11.2885, 45.325], [11.2795, 45.334]], 90, 'legnago', 'A battalion and cavalry from Legnago join Augereau'),
      arrow('austria', [[11.2135, 45.385], [11.235, 45.39], [11.262, 45.394], [11.29, 45.395]], 110, 'provera-escape', 'Provera’s division escapes east', 'dashed'),
    ],
    clashes: [{ at: [11.2785, 45.3605], size: 160 }, { at: [11.2165, 45.379], size: 140 }],
  },
  markers: {
    'arcole-alp-guides': mark([11.2915, 45.3665], '25 Guides', 'Bugles in the Austrian rear', 'france', 'swords'),
    'arcole-alp-robert': mark([11.259, 45.3555], 'Robert', 'Mortally wounded', 'france', 'skull'),
    'arcole-alp-pontoons': mark([11.2555, 45.3245], 'Pontoons', 'Bridge over the Alpone near its mouth', 'france', 'flag'),
    'arcole-alp-arcole': mark([11.2895, 45.355], 'Arcole', 'Taken at about 5 pm', 'france', 'flag'),
    'arcole-alp-schubirz': mark([11.2895, 45.3835], 'Schübirz', 'Holds off the French', 'austria'),
  },
});

console.log('arcole: bbox', JSON.stringify(bbox));
