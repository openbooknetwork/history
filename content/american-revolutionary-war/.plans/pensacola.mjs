// Pensacola, March to May 1781. The landing page works in longitude and latitude around the bay entrance,
// placed against the map's coast: Santa Rosa Island, the channel and the Barrancas Coloradas.
// The siege pages use a frame on Fort George, u east, w south. The Queen's Redoubt (the Crescent) lies
// north-west of Fort George and the Prince of Wales Redoubt north of it, as in the article; the distances are
// a reconstruction from the Spanish plan of 1781.
import { frame, writePlan } from './lib.mjs';

const G = 'pages/020-war/040-1778-1779';
const FR = '#17a2a2', NATIVE = '#8d6e63';

// --- the landing and the channel, 9 to 28 March ---
{
  const unit = (side, type, at, width, depth, facing, id, name, extra = {}) => ({ side, type, at, width, depth, facing, id, name, ...extra });
  writePlan(`${G}/031-pensacola-landing`, {
    bbox: [-87.37, 30.27, -87.18, 30.45],
    emblem: {
      units: [
        unit('spanish', 'ships', [-87.335, 30.296], 2600, 700, 30, 'havana-fleet', 'The expedition from Havana under Calvo, outside the bar', { count: 10, rows: 2 }),
        unit('spanish', 'ships', [-87.305, 30.331], 220, 380, 30, 'san-ramon', 'San Ramón, 64 guns, aground in the channel', { count: 1 }),
        unit('spanish', 'infantry', [-87.268, 30.332], 1600, 140, 0, 'santa-rosa', 'Spanish troops landed on Santa Rosa Island'),
        unit('spanish', 'ships', [-87.235, 30.372], 2000, 500, 60, 'louisiana-ships', 'Gálveztown and the Louisiana ships inside the bay, then the fleet on 19 March', { count: 8, rows: 2 }),
        unit('held', 'camp', [-87.304, 30.353], 260, 260, 0, 'barrancas', 'The British battery at the Barrancas Coloradas'),
        unit('spanish', 'infantry', [-87.285, 30.392], 1400, 200, 60, 'spanish-army', 'The Spanish army on the mainland from 24 March, with the troops from Mobile'),
      ],
      works: [{ side: 'spanish', path: [[-87.295, 30.3335], [-87.288, 30.3365]], width: 90, id: 'oneill-battery', name: 'O’Neill’s guns at the island’s undefended battery' }],
      arrows: [
        { side: 'spanish', path: [[-87.325, 30.312], [-87.301, 30.339], [-87.272, 30.356], [-87.245, 30.368]], width: 160, id: 'galveztown', name: 'Gálvez takes the Gálveztown through the channel under fire, 18 March' },
        { side: 'spanish', path: [[-87.255, 30.336], [-87.258, 30.358], [-87.272, 30.38]], width: 120, id: 'to-mainland', name: 'The army crosses to the mainland, 24 March' },
        { side: 'spanish', path: [[-87.42, 30.43], [-87.36, 30.415], [-87.31, 30.4]], width: 120, id: 'from-mobile', name: 'Troops from Mobile join the army' },
        { side: NATIVE, path: [[-87.25, 30.448], [-87.268, 30.425], [-87.276, 30.406]], width: 110, id: 'choctaw', name: 'About 400 Choctaw allies of the British attack, 28 March' },
      ],
      clashes: [{ at: [-87.278, 30.401], size: 230 }],
    },
    markers: {
      'pensacola-landing-galvez': { lnglat: [-87.225, 30.388], icon: 'user', color: 'spanish', label: 'Gálvez', note: 'Runs the channel, 18 March' },
      'pensacola-landing-oneill': { lnglat: [-87.29, 30.318], icon: 'user', color: 'spanish', label: 'O’Neill', note: 'Hibernia Regiment on the island' },
      'pensacola-landing-calvo': { lnglat: [-87.345, 30.282], icon: 'ship', color: 'spanish', label: 'Calvo', note: 'Refuses to enter, sails home' },
      'pensacola-landing-town': { lnglat: [-87.2165, 30.425], icon: 'landmark', color: 'held', label: 'Pensacola', note: 'Capital of West Florida' },
    },
  });
}

// --- the siege of the town ---
const f = frame([-87.2165, 30.4197], 90), P = f.p;
const unit = (side, type, u, w, width, depth, facing, id, name, extra = {}) => ({ side, type, at: P(u, w), width, depth, facing, id, name, ...extra });
const arrow = (side, pts, width, id, name, style) => ({ side, path: f.path(pts), width, id, name, ...(style ? { style } : {}) });
const work = (side, pts, width, id, name) => ({ side, path: f.path(pts), width, id, name });
const mark = (u, w, label, note, color, icon = 'user') => ({ lnglat: P(u, w), icon, color, label, note });
const bbox = f.box([[-3300, -3300], [900, 700]], 0);
const fortGeorge = unit('held', 'camp', 0, 0, 260, 220, 0, 'fort-george', 'Fort George, an earthwork with a palisade');
const princeOfWales = unit('held', 'camp', -60, -420, 150, 150, 0, 'prince-of-wales', 'The Prince of Wales Redoubt');
const crescent = (side, name) => unit(side, 'camp', -700, -950, 190, 190, 0, 'crescent', name);
const trenches = [
  work('spanish', [[-2500, -2250], [-2100, -1900], [-1850, -1750], [-1600, -1500], [-1350, -1350]], 50, 'approach', 'The Spanish approach trenches and covered road'),
  work('spanish', [[-1550, -1150], [-1300, -1450]], 70, 'batteries', 'Spanish batteries facing the Crescent'),
];
const camp = unit('spanish', 'camp', -2800, -1350, 600, 420, 0, 'spanish-camp', 'The Spanish camp');
const garrison = unit('held', 'infantry', 200, -180, 320, 110, 315, 'garrison', 'Campbell’s garrison: regulars, Waldeck troops and Loyalists');

writePlan(`${G}/032-pensacola-siege`, {
  bbox,
  emblem: {
    works: trenches,
    units: [fortGeorge, princeOfWales, crescent('held', 'The Queen’s Redoubt, which the Spanish call the Crescent'), garrison, camp,
      unit('spanish', 'infantry', -2050, -1250, 600, 120, 135, 'spanish-army', 'Spanish army under Ezpeleta, about 8,000 after 19 April'),
      unit(FR, 'infantry', -2650, -2200, 400, 100, 135, 'french-troops', 'French troops landed from the Havana squadron')],
    arrows: [
      arrow(NATIVE, [[-1300, -3300], [-1700, -2600], [-1950, -2150]], 70, 'choctaw-attacks', 'Choctaw warriors attack the siege works, 19 and 24 April'),
      arrow('held', [[-750, -1060], [-1150, -1300]], 60, 'sortie', 'A sortie from the Crescent is driven back, 26 April'),
      arrow('spanish', [[-1400, -1300], [-850, -1020]], 60, 'bombardment', 'The Spanish batteries open fire, 30 April'),
    ],
    clashes: [{ at: P(-1180, -1320), size: 90 }, { at: P(-1980, -2100), size: 90 }],
  },
  markers: {
    'pensacola-siege-ezpeleta': mark(-2150, -900, 'Ezpeleta', 'Commands after Gálvez is wounded', 'spanish'),
    'pensacola-siege-campbell': mark(450, 120, 'Campbell', 'Holds Fort George', 'held'),
    'pensacola-siege-town': mark(-200, 450, 'Pensacola', 'The town below Fort George', 'held', 'landmark'),
  },
});

writePlan(`${G}/033-pensacola-crescent`, {
  bbox,
  emblem: {
    works: [...trenches, work('spanish', [[-800, -880], [-600, -860]], 60, 'guns-in-crescent', 'Spanish guns and howitzers hauled into the Crescent')],
    units: [fortGeorge, princeOfWales, crescent('spanish', 'The wrecked Crescent, in Spanish hands from 8 May'), garrison, camp,
      unit('spanish', 'light', -1150, -1230, 400, 60, 135, 'light-infantry', 'Ezpeleta’s light infantry')],
    arrows: [
      arrow('spanish', [[-1200, -1250], [-800, -1010]], 70, 'storm-crescent', 'Ezpeleta leads the light infantry into the wrecked Crescent'),
      arrow('spanish', [[-620, -880], [-160, -470]], 60, 'fire-on-forts', 'The guns in the Crescent fire on the Prince of Wales Redoubt and Fort George'),
      arrow('spanish', [[-600, -840], [-120, -110]], 60, 'fire-on-forts', 'The guns in the Crescent fire on the Prince of Wales Redoubt and Fort George'),
      arrow('held', [[-30, -60], [-450, -720]], 50, 'fort-george-replies', 'Fort George’s guns reply and are overwhelmed'),
    ],
    clashes: [{ at: P(-700, -950), size: 260 }],
  },
  markers: {
    'pensacola-crescent-magazine': mark(-900, -1250, 'The Crescent', 'Magazine explodes, 57 killed, 8 May', 'held', 'flame'),
    'pensacola-crescent-campbell': mark(450, 120, 'Campbell', 'Surrenders, 10 May', 'held', 'flag'),
    'pensacola-crescent-ezpeleta': mark(-1600, -1000, 'Ezpeleta', 'Light infantry', 'spanish'),
  },
});
console.log('pensacola: fort george at', JSON.stringify(P(0, 0)));
