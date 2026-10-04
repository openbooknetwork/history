// Monmouth, 28 June 1778. From the Battle of Monmouth article: Lee's vanguard east of the Spotswood Middle Brook,
// Clinton's counter-attack, Washington's line on Perrine's Hill above the bridge, Greene's guns on Combs Hill.
// The exact lie of the hedgerow, the Point of Woods and the parsonage is approximate.
import { writePlan } from './lib.mjs';

const G = 'pages/020-war/040-1778-1779';
const U = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const A = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const M = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, ...(color ? { color } : {}), label, note });

const water = [
  { path: [[-74.338, 40.2555], [-74.328, 40.2588], [-74.3165, 40.2625], [-74.309, 40.2598], [-74.3, 40.2572], [-74.29, 40.2555]], width: 30, id: 'middle-brook', name: 'Spotswood Middle Brook' },
  { path: [[-74.333, 40.2845], [-74.318, 40.2795], [-74.303, 40.2755], [-74.29, 40.2722]], width: 25, id: 'north-brook', name: 'Spotswood North Brook' },
];
const roads = [
  { path: [[-74.3582, 40.2973], [-74.345, 40.288], [-74.333, 40.278], [-74.3225, 40.2672], [-74.3165, 40.2625], [-74.305, 40.2612], [-74.29, 40.2608], [-74.2738, 40.2601]], width: 16, id: 'englishtown-road', name: 'The road from Englishtown to Monmouth Court House' },
  { path: [[-74.2738, 40.2601], [-74.262, 40.268], [-74.25, 40.276]], width: 16, id: 'middletown-road', name: 'The road to Middletown' },
];
const close = [-74.335, 40.248, -74.29, 40.282];

writePlan(`${G}/011-monmouth-lee`, {
  bbox: [-74.362, 40.243, -74.255, 40.3],
  emblem: {
    water, works: roads,
    units: [
      U('held', 'infantry', [-74.2652, 40.2668], 600, 150, 245, 'rearguard', 'British rearguard: light infantry, dragoons and the Queen’s Rangers'),
      U('held', 'infantry', [-74.2782, 40.2682], 450, 160, 255, 'guards', 'Clinton’s first division turns back: the Guards'),
      U('held', 'infantry', [-74.2792, 40.2618], 450, 160, 265, 'grenadiers', 'Clinton’s first division turns back: the Grenadiers'),
      U('usa', 'infantry', [-74.2862, 40.264], 500, 120, 70, 'wayne', 'Wayne’s lead element, about 550 men and four guns'),
      U('usa', 'infantry', [-74.2948, 40.2665], 700, 140, 90, 'scott-maxwell', 'Scott’s and Maxwell’s detachments, out of touch with Lee'),
      U('usa', 'infantry', [-74.2888, 40.2565], 500, 120, 70, 'lafayette', 'Lafayette on the right'),
      U('usa', 'infantry', [-74.2925, 40.2728], 300, 100, 90, 'jackson', 'Jackson’s regiment by the North Brook'),
    ],
    arrows: [
      A('held', [[-74.2762, 40.2688], [-74.2882, 40.2688]], 120, 'guards-advance', 'The Guards march west'),
      A('held', [[-74.2772, 40.2614], [-74.2912, 40.2592]], 120, 'grenadier-advance', 'The Grenadiers strike at the American right'),
      A('usa', [[-74.2965, 40.2635], [-74.3065, 40.2622], [-74.316, 40.2627]], 140, 'retreat', 'Lee’s vanguard falls back across the Spotswood Middle Brook', 'dashed'),
      A('usa', [[-74.352, 40.293], [-74.337, 40.2805], [-74.3265, 40.2705]], 160, 'main-body', 'Washington’s main body from Englishtown'),
      A('usa', [[-74.3315, 40.2765], [-74.3305, 40.2625], [-74.3185, 40.2535]], 110, 'greene-woodford', 'Greene takes Woodford’s brigade south to cover the right'),
    ],
  },
  markers: {
    'monmouth-lee-lee': M([-74.2975, 40.2598], 'Lee', 'Plans to envelop the rearguard', 'usa'),
    'monmouth-lee-courthouse': M([-74.2738, 40.2601], 'Monmouth Court House', 'Clinton’s camp the night before', null, 'landmark'),
    'monmouth-lee-clinton': M([-74.2702, 40.2742], 'Clinton', 'Turns his first division back', 'held'),
    'monmouth-lee-washington': M([-74.3428, 40.2858], 'Washington', 'Main body from Englishtown', 'usa'),
  },
});

writePlan(`${G}/012-monmouth-perrine`, {
  bbox: close,
  emblem: {
    water, works: roads,
    units: [
      U('usa', 'infantry', [-74.3272, 40.2732], 600, 120, 120, 'stirling', 'Stirling’s wing on the American left'),
      U('usa', 'infantry', [-74.3248, 40.2688], 600, 130, 115, 'main-body', 'Washington’s main body on Perrine’s Hill'),
      U('usa', 'infantry', [-74.3202, 40.2664], 250, 80, 125, 'wayne', 'Wayne’s men, driven from the Point of Woods, re-forming above the bridge'),
      U('usa', 'light', [-74.313, 40.2557], 220, 50, 80, 'lee', 'Lee’s four guns and two battalions, pushed back to a hedgerow'),
      U('held', 'infantry', [-74.303, 40.2592], 420, 110, 255, 'guards', 'The Guards and the dragoons'),
      U('held', 'infantry', [-74.304, 40.2546], 420, 110, 270, 'grenadiers', 'The Grenadiers'),
      U('held', 'infantry', [-74.3048, 40.273], 320, 90, 265, '42nd', 'The 42nd Highlanders and the 3rd Brigade, north of the brook'),
      U('held', 'infantry', [-74.3172, 40.2632], 220, 80, 300, 'monckton', 'Monckton’s grenadier battalion, over the bridge and stopped'),
    ],
    arrows: [
      A('held', [[-74.3052, 40.2594], [-74.3122, 40.2608]], 70, 'guards-attack', 'The Guards and dragoons drive Wayne from the Point of Woods within ten minutes'),
      A('held', [[-74.3058, 40.2549], [-74.3113, 40.2556]], 70, 'grenadier-advance', 'The Grenadiers push Lee’s guns back'),
      A('held', [[-74.3025, 40.2742], [-74.3082, 40.2735]], 60, '42nd-advance', 'The Highlanders chase Scott’s men'),
      A('usa', [[-74.309, 40.2722], [-74.3205, 40.2728]], 55, 'scott-retreat', 'Part of Scott’s detachment falls back into Stirling’s line', 'dashed'),
      A('usa', [[-74.3098, 40.2588], [-74.3148, 40.2614], [-74.3188, 40.2652]], 60, 'wayne-back', 'Wayne and Lee fall back across the bridge', 'dashed'),
    ],
    clashes: [[-74.3185, 40.2648], [-74.312, 40.2557]],
  },
  markers: {
    'monmouth-perrine-washington': M([-74.3298, 40.2652], 'Washington', 'Meets Lee, takes command', 'usa'),
    'monmouth-perrine-monckton': M([-74.3142, 40.2665], 'Monckton', 'Killed at the bridge', 'held', 'skull'),
    'monmouth-perrine-lee': M([-74.3158, 40.2528], 'Lee', 'Holds the hedgerow', 'usa'),
  },
});

writePlan(`${G}/013-monmouth-parsonage`, {
  bbox: close,
  emblem: {
    water, works: roads,
    units: [
      U('usa', 'infantry', [-74.3272, 40.2732], 600, 120, 120, 'stirling', 'Stirling’s wing on the American left'),
      U('usa', 'infantry', [-74.3248, 40.2688], 600, 130, 115, 'main-body', 'Washington’s main body on Perrine’s Hill'),
      U('usa', 'infantry', [-74.3165, 40.251], 420, 110, 40, 'combs-hill', 'Greene with Woodford’s brigade and guns on Combs Hill'),
      U('usa', 'infantry', [-74.3178, 40.2745], 220, 70, 95, 'cilley', 'Cilley’s battalion of 350 picked men'),
      U('usa', 'infantry', [-74.3085, 40.2577], 300, 80, 100, 'wayne', 'Wayne’s 400 Pennsylvanians'),
      U('held', 'infantry', [-74.3078, 40.2738], 260, 80, 270, '42nd', 'The 42nd Highlanders in the orchard'),
      U('held', 'infantry', [-74.3038, 40.2574], 300, 90, 280, 'grenadiers', 'The 1st Grenadier Battalion, left exposed'),
      U('held', 'infantry', [-74.3003, 40.2552], 220, 80, 285, '33rd', 'The 33rd Foot comes up in support'),
    ],
    arrows: [
      A('usa', [[-74.3166, 40.2743], [-74.3102, 40.2739]], 60, 'cilley-attack', 'Cilley drives the Highlanders from the orchard'),
      A('held', [[-74.3068, 40.2734], [-74.2985, 40.2702]], 55, '42nd-retreat', 'The Highlanders’ fighting retreat', 'dashed'),
      A('usa', [[-74.3172, 40.2636], [-74.3155, 40.2612], [-74.3098, 40.2584]], 65, 'wayne-attack', 'Wayne crosses the bridge at 16:45'),
      A('usa', [[-74.3082, 40.2567], [-74.3065, 40.2536]], 55, 'wayne-back', 'The Pennsylvanians fall back to the parsonage', 'dashed'),
    ],
    clashes: [[-74.3093, 40.2738], [-74.3062, 40.2576]],
  },
  markers: {
    'monmouth-parsonage-greene': M([-74.3215, 40.2488], 'Greene', 'Guns on Combs Hill', 'usa'),
    'monmouth-parsonage-cilley': M([-74.3205, 40.2772], 'Cilley', 'Drives the Highlanders', 'usa'),
    'monmouth-parsonage-parsonage': M([-74.3052, 40.2522], 'Parsonage', 'Wayne’s men fall back here', null, 'house'),
  },
});
console.log('monmouth: 3 pages');
