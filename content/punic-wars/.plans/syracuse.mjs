// Siege of Syracuse, 213 to 212 BC. The Dionysian walls enclose the plateau of Epipolae from the Euryalus fort in
// the west to the sea; Achradina and the island of Ortygia have walls of their own. Wall lines follow the plateau
// edges and stay inside the map's coast, which is coarser than the real one.
import { writePlan } from './lib.mjs';

const G = 'pages/040-second-war/020-attrition/030-syracuse';
const bbox = [15.2, 37.04, 15.33, 37.12];

const walls = [
  // the north wall of Epipolae, from Euryalus to the sea near Trogilus
  { side: 'neutral', width: 30, path: [[15.2186, 37.0832], [15.2265, 37.087], [15.238, 37.0915], [15.251, 37.096], [15.262, 37.1], [15.272, 37.1035], [15.281, 37.1072]], id: 'north-wall', name: 'The north wall of Epipolae' },
  // the sea wall of Tyche and Achradina
  { side: 'neutral', width: 30, path: [[15.281, 37.1072], [15.295, 37.1035], [15.301, 37.098], [15.305, 37.087], [15.303, 37.076], [15.2995, 37.068]], id: 'sea-wall', name: 'The sea wall of Tyche and Achradina' },
  // the south wall of Epipolae, down to the Great Harbour
  { side: 'neutral', width: 30, path: [[15.2186, 37.0832], [15.228, 37.08], [15.24, 37.0775], [15.252, 37.0755], [15.262, 37.0735], [15.271, 37.0705], [15.284, 37.0655]], id: 'south-wall', name: 'The south wall of Epipolae' },
  // the inner wall of Achradina
  { side: 'neutral', width: 30, path: [[15.2855, 37.0675], [15.287, 37.0745], [15.29, 37.0815], [15.296, 37.0855], [15.3045, 37.086]], id: 'achradina-wall', name: 'The wall of Achradina' },
  // Ortygia
  { side: 'neutral', width: 30, path: [[15.2895, 37.0668], [15.2945, 37.0665], [15.2975, 37.0625], [15.2965, 37.0575], [15.293, 37.0545], [15.2895, 37.0565], [15.288, 37.061], [15.2895, 37.0668]], id: 'ortygia-wall', name: 'The walls of Ortygia' },
];
const anapus = { path: [[15.2, 37.044], [15.22, 37.048], [15.24, 37.052], [15.26, 37.0545], [15.274, 37.0565], [15.281, 37.058]], width: 45, id: 'anapus', name: 'The river Anapus' };
const euryalus = { side: 'syracuse', type: 'camp', at: [15.2195, 37.0828], width: 260, depth: 200, facing: 270, id: 'euryalus', name: 'The Euryalus fort, held by the Syracusans' };
const mark = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, color, label, note });

// --- overview: Hippocrates and Epicydes seize Syracuse, Himilco lands in the west ---
writePlan(`${G}/010-syracuse`, {
  routes: {
    'hippocrates-214': { name: 'Hippocrates and Epicydes lead the troops from Leontini to Syracuse, 214 BC', path: [[15.0, 37.29], [15.08, 37.22], [15.17, 37.15], [15.24, 37.1], [15.28, 37.08]] },
    'himilco-213': { name: 'Himilco lands at Heraclea Minoa and retakes Agrigentum, 213 BC', path: [[12.4, 36.95], [12.8, 37.15], [13.28, 37.39], [13.45, 37.34], [13.58, 37.31]] },
  },
  show: ['leontini-214', 'agrigentum-212'],
});

// --- 213 BC: the sea assault on Achradina and the land assault at the Hexapylon ---
writePlan(`${G}/020-syracuse-assault`, {
  bbox,
  emblem: {
    water: [anapus],
    works: walls,
    units: [
      euryalus,
      { side: 'rome', type: 'ships', at: [15.3205, 37.0825], width: 2000, depth: 950, facing: 270, count: 12, rows: 2, id: 'roman-fleet', name: 'Marcellus’s fleet of 60 quinqueremes' },
      { side: 'rome', type: 'ships', at: [15.3108, 37.0835], width: 800, depth: 330, facing: 270, count: 4, id: 'sambucae', name: 'Eight quinqueremes lashed in pairs to carry the sambucae' },
      { side: 'rome', type: 'infantry', at: [15.2675, 37.1078], width: 1000, depth: 300, facing: 160, id: 'appius', name: 'Roman infantry under Appius Claudius' },
      { side: 'rome', type: 'camp', at: [15.252, 37.1065], width: 420, depth: 300, facing: 160, id: 'appius-camp', name: 'Camp of Appius Claudius' },
      { side: 'syracuse', type: 'infantry', at: [15.2975, 37.0805], width: 1000, depth: 260, facing: 90, id: 'achradina-defenders', name: 'Syracusans on the sea wall, with Archimedes’s engines' },
      { side: 'syracuse', type: 'infantry', at: [15.271, 37.099], width: 700, depth: 240, facing: 340, id: 'hexapylon-defenders', name: 'Syracusans at the Hexapylon' },
    ],
    arrows: [
      { side: 'rome', path: [[15.3125, 37.0905], [15.3085, 37.0895]], width: 70, id: 'sea-assault', name: 'The ships attack the sea wall' },
      { side: 'rome', path: [[15.3125, 37.0765], [15.3085, 37.0775]], width: 70, id: 'sea-assault', name: 'The ships attack the sea wall' },
      { side: 'rome', path: [[15.2665, 37.1058], [15.2685, 37.1042]], width: 70, id: 'land-assault', name: 'Appius Claudius attacks the Hexapylon' },
    ],
    clashes: [[15.3072, 37.0898], [15.3075, 37.0835], [15.3068, 37.0772], { at: [15.2695, 37.1038], size: 120 }],
  },
  markers: {
    'syracuse-assault-marcellus': mark([15.3165, 37.0705], 'Marcellus', '60 quinqueremes and sambucae', 'rome', 'ship'),
    'syracuse-assault-archimedes': mark([15.2905, 37.0985], 'Archimedes’s engines', 'Catapults, cranes and the claw', 'syracuse', 'crosshair'),
    'syracuse-assault-appius': mark([15.2465, 37.1112], 'Appius Claudius', 'Attacks the Hexapylon', 'rome'),
    'syracuse-assault-achradina': mark([15.2935, 37.0745], 'Achradina', '', 'syracuse', 'landmark'),
    'syracuse-assault-ortygia': mark([15.2985, 37.0585], 'Ortygia', '', 'syracuse', 'landmark'),
  },
});

// --- spring 212 BC: the night escalade near Trogilus, Epipolae, Tyche and Neapolis taken ---
writePlan(`${G}/030-syracuse-epipolae`, {
  bbox,
  emblem: {
    water: [anapus],
    works: walls,
    units: [
      euryalus,
      { side: 'rome', type: 'infantry', at: [15.2885, 37.0935], width: 950, depth: 320, facing: 170, id: 'tyche', name: 'Roman troops in Tyche' },
      { side: 'rome', type: 'infantry', at: [15.2725, 37.0815], width: 850, depth: 320, facing: 120, id: 'neapolis', name: 'Roman troops in Neapolis under Marcellus' },
      { side: 'rome', type: 'camp', at: [15.2805, 37.0868], width: 380, depth: 300, facing: 120, id: 'roman-camp', name: 'Roman camp on Epipolae' },
      { side: 'syracuse', type: 'infantry', at: [15.2965, 37.0775], width: 800, depth: 260, facing: 320, id: 'epicydes', name: 'Syracusans under Epicydes in Achradina' },
      { side: 'syracuse', type: 'infantry', at: [15.2928, 37.0605], width: 320, depth: 140, facing: 0, id: 'ortygia-garrison', name: 'The garrison of Ortygia' },
    ],
    arrows: [
      { side: 'rome', path: [[15.2795, 37.1102], [15.2795, 37.1078], [15.281, 37.1052]], width: 60, id: 'escalade', name: 'The storming party climbs the wall near Trogilus' },
      { side: 'rome', path: [[15.258, 37.1068], [15.267, 37.1052], [15.2715, 37.1022], [15.278, 37.0975], [15.2855, 37.0955]], width: 90, id: 'army-enters', name: 'The army follows over the wall into Tyche' },
      { side: 'rome', path: [[15.2715, 37.0995], [15.2705, 37.092], [15.2715, 37.0855]], width: 80, id: 'into-neapolis', name: 'The Romans move into Neapolis' },
    ],
    clashes: [{ at: [15.2808, 37.1062], size: 110 }],
  },
  markers: {
    'syracuse-epipolae-escalade': mark([15.2905, 37.1112], 'Storming party', 'Climbs the wall near Trogilus', 'rome', 'swords'),
    'syracuse-epipolae-marcellus': mark([15.268, 37.0895], 'Marcellus', 'Takes Tyche and Neapolis', 'rome'),
    'syracuse-epipolae-epicydes': mark([15.3025, 37.0715], 'Epicydes', 'Holds Achradina and Ortygia', 'syracuse'),
    'syracuse-epipolae-euryalus': mark([15.2195, 37.0875], 'Euryalus', 'Surrenders later on terms', 'syracuse', 'castle'),
  },
});

// --- summer and autumn 212 BC: the relief army at the Anapus, the sortie, the plague ---
writePlan(`${G}/040-syracuse-relief`, {
  bbox,
  emblem: {
    water: [anapus],
    works: walls,
    units: [
      { side: 'rome', type: 'infantry', at: [15.2885, 37.0935], width: 950, depth: 320, facing: 170, id: 'tyche', name: 'Roman troops in Tyche' },
      { side: 'rome', type: 'infantry', at: [15.2715, 37.077], width: 1000, depth: 320, facing: 160, id: 'neapolis', name: 'Roman troops in Neapolis, facing the relief army' },
      { side: 'rome', type: 'camp', at: [15.2805, 37.0868], width: 380, depth: 300, facing: 120, id: 'roman-camp', name: 'Roman camp on Epipolae' },
      { side: 'syracuse', type: 'infantry', at: [15.2965, 37.0775], width: 800, depth: 260, facing: 320, id: 'epicydes', name: 'Syracusans under Epicydes in Achradina' },
      { side: 'carthage', type: 'camp', at: [15.2555, 37.0505], width: 700, depth: 450, facing: 20, id: 'himilco-camp', name: 'Camp of Himilco and Hippocrates by the Anapus' },
      { side: 'carthage', type: 'ships', at: [15.2915, 37.0478], width: 1150, depth: 620, facing: 0, count: 8, rows: 2, id: 'bomilcar', name: 'Bomilcar’s fleet in the Great Harbour' },
    ],
    arrows: [
      { side: 'carthage', path: [[15.2575, 37.0555], [15.262, 37.0645], [15.2685, 37.0735]], width: 90, id: 'relief-attack', name: 'The relief army attacks the Roman lines' },
      { side: 'syracuse', path: [[15.2905, 37.0805], [15.2855, 37.0855], [15.2835, 37.0885]], width: 80, id: 'sortie', name: 'Epicydes makes a sortie from Achradina' },
    ],
    clashes: [[15.2685, 37.0738], [15.2842, 37.0878]],
  },
  markers: {
    'syracuse-relief-himilco': mark([15.2425, 37.0455], 'Himilco and Hippocrates', 'Camp by the Anapus, die of plague', 'carthage', 'skull'),
    'syracuse-relief-bomilcar': mark([15.3055, 37.0455], 'Bomilcar', 'Brings supplies into the Great Harbour', 'carthage', 'ship'),
    'syracuse-relief-epicydes': mark([15.3025, 37.0715], 'Epicydes', 'Sortie from Achradina', 'syracuse'),
    'syracuse-relief-marcellus': mark([15.2655, 37.0905], 'Marcellus', 'Holds the lines', 'rome'),
  },
});

// --- autumn 212 BC: Moeriscus opens the gate on Ortygia, Achradina surrenders ---
writePlan(`${G}/050-syracuse-fall`, {
  bbox,
  emblem: {
    water: [anapus],
    works: walls,
    units: [
      { side: 'rome', type: 'infantry', at: [15.2885, 37.0935], width: 950, depth: 320, facing: 170, id: 'tyche', name: 'Roman troops in Tyche' },
      { side: 'rome', type: 'infantry', at: [15.2785, 37.0755], width: 800, depth: 320, facing: 110, id: 'diversion', name: 'Marcellus’s diversion against Achradina' },
      { side: 'rome', type: 'ships', at: [15.2838, 37.0548], width: 520, depth: 330, facing: 70, count: 3, id: 'ortygia-landing', name: 'Roman troops carried by ship to Ortygia' },
      { side: 'syracuse', type: 'infantry', at: [15.2975, 37.0775], width: 700, depth: 240, facing: 320, id: 'last-defenders', name: 'The last defenders of Achradina' },
    ],
    arrows: [
      { side: 'rome', path: [[15.288, 37.0905], [15.2915, 37.0845], [15.295, 37.0805]], width: 90, id: 'into-achradina', name: 'The Romans break into Achradina' },
      { side: 'rome', path: [[15.2835, 37.0565], [15.2865, 37.0585], [15.2895, 37.0593]], width: 80, id: 'moeriscus-gate', name: 'Landing at the gate Moeriscus opens' },
      { side: 'rome', path: [[15.2905, 37.0625], [15.2945, 37.0675], [15.2965, 37.0725]], width: 80, id: 'from-ortygia', name: 'From Ortygia into Achradina' },
    ],
    clashes: [[15.2945, 37.0815], { at: [15.2898, 37.0595], size: 110 }],
  },
  markers: {
    'syracuse-fall-moeriscus': mark([15.2795, 37.0605], 'Moeriscus', 'Opens the gate by the Arethusa', 'syracuse', 'user'),
    'syracuse-fall-archimedes': mark([15.3035, 37.0745], 'Archimedes', 'Killed in the sack', 'syracuse', 'skull'),
    'syracuse-fall-marcellus': mark([15.2705, 37.0815], 'Marcellus', 'Diversion against Achradina', 'rome'),
  },
});
console.log('syracuse written');
