// The siege of Savannah, 16 September to 18 October 1779, and the assault of 9 October. From the Siege of Savannah
// article: Moncrief's entrenched line with redoubts round the town, the Spring Hill redoubt on its right (west),
// the swamps the assault columns lost their way in. The lie of the siege trenches is approximate.
import { writePlan } from './lib.mjs';

const G = 'pages/020-war/040-1778-1779';
const FR = '#2a9d8f';   // d'Estaing's French troops
const U = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
const A = (side, path, width, id, name, style) => ({ side, path, width, id, name, ...(style ? { style } : {}) });
const M = (lnglat, label, note, color, icon = 'user') => ({ lnglat, icon, ...(color ? { color } : {}), label, note });

const water = [
  { path: [[-81.125, 32.0905], [-81.112, 32.0872], [-81.1, 32.0845], [-81.09, 32.0833], [-81.078, 32.0826], [-81.065, 32.0815]], width: 260, id: 'river', name: 'The Savannah River' },
  { area: [[-81.112, 32.0818], [-81.1045, 32.0812], [-81.1028, 32.0782], [-81.1052, 32.0742], [-81.1125, 32.0748]], id: 'swamp', name: 'Swamp west of the town' },
];
const lines = { side: 'held', path: [[-81.1005, 32.0812], [-81.0995, 32.0758], [-81.0975, 32.0722], [-81.092, 32.0705], [-81.086, 32.0708], [-81.0815, 32.0728], [-81.079, 32.0765], [-81.0785, 32.0812]], width: 40, id: 'british-lines', name: 'The British lines and redoubts, built by Moncrief' };
const siege = { side: FR, path: [[-81.0955, 32.0672], [-81.089, 32.0662], [-81.0828, 32.0676]], width: 35, id: 'siege-works', name: 'The French siege trenches and batteries' };
const springHill = U('held', 'camp', [-81.0995, 32.0758], 110, 90, 0, 'spring-hill', 'The Spring Hill redoubt');
const bbox = [-81.116, 32.056, -81.064, 32.092];

writePlan(`${G}/021-savannah-siege`, {
  bbox,
  emblem: {
    water, works: [lines, siege],
    units: [
      springHill,
      U('held', 'infantry', [-81.0905, 32.0745], 1100, 180, 180, 'garrison', 'Prevost’s garrison of regulars, Loyalists and militia'),
      U('held', 'ships', [-81.08, 32.0829], 160, 60, 90, 'rose', 'The Rose, scuttled to block the channel', { count: 1 }),
      U(FR, 'infantry', [-81.09, 32.06], 1200, 250, 0, 'french', 'D’Estaing’s French troops'),
      U('usa', 'infantry', [-81.078, 32.0645], 700, 200, 330, 'americans', 'Lincoln’s Continentals and militia'),
    ],
    arrows: [
      A('held', [[-81.066, 32.0885], [-81.0745, 32.0838], [-81.08, 32.0808]], 90, 'maitland', 'Maitland’s men from Beaufort reach the town by the unguarded creeks'),
    ],
  },
  markers: {
    'savannah-siege-prevost': M([-81.087, 32.0792], 'Prevost', 'Asks for 24 hours, then refuses', 'held'),
    'savannah-siege-destaing': M([-81.095, 32.0598], 'd’Estaing', 'Lands guns from the fleet', null),
    'savannah-siege-lincoln': M([-81.073, 32.0632], 'Lincoln', 'Joins the French', 'usa'),
  },
});

writePlan(`${G}/022-savannah-assault`, {
  bbox,
  emblem: {
    water, works: [lines, siege],
    units: [
      springHill,
      U('held', 'infantry', [-81.0985, 32.0768], 120, 50, 220, 'defenders', 'Maitland’s 71st Foot and militia riflemen'),
      U('held', 'infantry', [-81.0905, 32.0745], 1100, 180, 180, 'garrison', 'The rest of Prevost’s garrison'),
      U(FR, 'infantry', [-81.1045, 32.0723], 300, 120, 40, 'destaing-column', 'D’Estaing’s first column'),
      U(FR, 'infantry', [-81.1068, 32.0752], 260, 110, 70, 'stedingk-column', 'Stedingk’s column'),
      U('usa', 'infantry', [-81.1028, 32.0698], 260, 100, 20, 'american-column', 'American Continentals with the assault'),
      U('usa', 'cavalry', [-81.0985, 32.069], 200, 80, 340, 'pulaski', 'Pulaski’s cavalry'),
    ],
    arrows: [
      A(FR, [[-81.1038, 32.0731], [-81.1003, 32.0752]], 70, 'assault', 'The assault on the Spring Hill redoubt'),
      A(FR, [[-81.106, 32.0757], [-81.1008, 32.0764]], 60, 'stedingk-assault', 'Stedingk reaches the last trench'),
      A('usa', [[-81.0986, 32.0698], [-81.0984, 32.074]], 60, 'pulaski-charge', 'Pulaski’s charge'),
      A('usa', [[-81.0765, 32.0698], [-81.0798, 32.0733]], 60, 'feint', 'A feint against the eastern works'),
    ],
    clashes: [{ at: [-81.1002, 32.0753], size: 170 }, [-81.0984, 32.0744], [-81.0795, 32.0738]],
  },
  markers: {
    'savannah-assault-destaing': M([-81.1085, 32.0712], 'd’Estaing', 'Wounded twice', null),
    'savannah-assault-pulaski': M([-81.0955, 32.0692], 'Pulaski', 'Mortally wounded', 'usa', 'skull'),
    'savannah-assault-stedingk': M([-81.1095, 32.0768], 'Stedingk', 'Plants a flag on the trench', null),
  },
});

writePlan(`${G}/023-savannah-repulse`, {
  bbox,
  emblem: {
    water, works: [lines, siege],
    units: [
      springHill,
      U('held', 'infantry', [-81.0985, 32.0768], 120, 50, 220, 'defenders', 'Maitland’s 71st Foot and militia riflemen'),
      U('held', 'infantry', [-81.0905, 32.0745], 1100, 180, 180, 'garrison', 'Prevost’s garrison'),
      U(FR, 'infantry', [-81.09, 32.06], 1200, 250, 0, 'french', 'The French back in their camp'),
      U('usa', 'infantry', [-81.078, 32.0645], 700, 200, 330, 'americans', 'Lincoln’s army'),
    ],
    arrows: [
      A('held', [[-81.0968, 32.0768], [-81.1012, 32.0748]], 60, 'counterattack', 'The defenders drive the assault back'),
      A(FR, [[-81.1018, 32.0738], [-81.1058, 32.0702], [-81.1012, 32.0628]], 80, 'french-retreat', 'The French columns fall back after an hour', 'dashed'),
      A('usa', [[-81.0998, 32.0722], [-81.0975, 32.0665]], 70, 'american-retreat', 'The Americans fall back', 'dashed'),
    ],
    clashes: [[-81.1006, 32.0752]],
  },
  markers: {
    'savannah-repulse-ditch': M([-81.1032, 32.0782], 'The Spring Hill ditch', 'Filled with the dead', null, 'skull'),
    'savannah-repulse-losses': M([-81.1078, 32.0662], 'Allied losses', '244 killed, 584 wounded, 120 captured', null, 'users'),
  },
});
console.log('savannah: 3 pages');
