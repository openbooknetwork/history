// Quebec, the night attack of 31 December 1775. The map's St Lawrence shore runs about 1.5 km west of the real
// Lower Town, so the city is laid out from real coordinates relative to the tip of the Lower Town and the real
// shoreline below Cape Diamond (bearing 211), then placed along the map's shore (bearing 204), 320 m inland of it so
// the narrow Lower Town lies on the map's land. The St Charles estuary, missing from the map, is drawn as water.
import { frame, writePlan } from './lib.mjs';

const TIP = [-71.2020, 46.8155], REAL = 211, MAP = 204;
const f = frame([-71.22484, 46.81618], MAP), P = f.p;
// a real [lon, lat] to the local frame of the real shoreline, then onto the map's shore
const kx = 111320 * Math.cos(TIP[1] * Math.PI / 180), ky = 110540, t = REAL * Math.PI / 180;
const local = ([lon, lat]) => { const x = (lon - TIP[0]) * kx, y = (lat - TIP[1]) * ky; return [x * Math.sin(t) + y * Math.cos(t), x * Math.cos(t) - y * Math.sin(t)]; };
const Q = ll => P(...local(ll)), QP = lls => lls.map(Q);
const turn = REAL - MAP; // a real compass bearing on the plan
const bearing = b => ((b - turn) % 360 + 360) % 360;
const mk = (ll, label, note, color, icon = 'user') => ({ lnglat: Q(ll), icon, color, label, note });
const G = 'pages/020-war/010-1775';

// the walls of the Upper Town, from Cape Diamond to the cliff above the St Charles, and along that cliff
const walls = [[-71.2072, 46.8062], [-71.2105, 46.8085], [-71.2130, 46.8108], [-71.2128, 46.8130], [-71.2112, 46.8160], [-71.2080, 46.8166], [-71.2040, 46.8162]];
const stCharles = { area: QP([[-71.2015, 46.8160], [-71.2060, 46.8172], [-71.2120, 46.8180], [-71.2200, 46.8185], [-71.2300, 46.8190], [-71.2300, 46.8320], [-71.1950, 46.8320], [-71.1950, 46.8170]]), id: 'st-charles', name: 'The St Charles estuary' };
const works = [
  { side: 'held', path: QP(walls), width: 60, id: 'walls', name: 'The walls of the Upper Town' },
  { side: 'held', path: QP([[-71.2036, 46.8162], [-71.2032, 46.8150]]), width: 44, id: 'first-barricade', name: 'The first barricade at the Sault-au-Matelot' },
  { side: 'held', path: QP([[-71.2048, 46.8136], [-71.2040, 46.8128]]), width: 44, id: 'second-barricade', name: 'The second barricade, held by Caldwell' },
  { side: 'held', path: QP([[-71.2118, 46.8046], [-71.2110, 46.8040]]), width: 52, id: 'pres-de-ville', name: 'The blockhouse and palisades at Près-de-Ville' },
];
const frameOf = lls => { const q = lls.map(Q), pad = 0.0025; return [Math.min(...q.map(p => p[0])) - pad, Math.min(...q.map(p => p[1])) - pad, Math.max(...q.map(p => p[0])) + pad, Math.max(...q.map(p => p[1])) + pad]; };
const bbox = frameOf([[-71.2290, 46.7935], [-71.2210, 46.8195], [-71.2005, 46.8165], [-71.2075, 46.8040]]);

// --- the approach in the snowstorm ---
writePlan(`${G}/031-canada-assault`, {
  bbox,
  emblem: {
    water: [stCharles], works,
    units: [
      { side: 'usa', type: 'infantry', at: Q([-71.2195, 46.7990]), width: 40, depth: 420, facing: bearing(45), id: 'montgomery', name: 'Montgomery’s column, about 300 New York troops, along the shore from Wolfe’s Cove' },
      { side: 'usa', type: 'infantry', at: Q([-71.2160, 46.8178]), width: 40, depth: 520, facing: bearing(95), id: 'arnold', name: 'Arnold’s column, about 600 men with Morgan’s riflemen in front, from Saint-Roch' },
      { side: 'usa', type: 'light', at: Q([-71.2095, 46.8050]), width: 220, depth: 50, facing: bearing(60), id: 'brown', name: 'Jacob Brown’s feint at the Cape Diamond redoubt' },
      { side: 'usa', type: 'light', at: Q([-71.2150, 46.8125]), width: 220, depth: 50, facing: bearing(80), id: 'livingston', name: 'James Livingston’s Canadiens, a feint at the Saint-Jean gate' },
      { side: 'held', type: 'infantry', at: Q([-71.2090, 46.8120]), width: 260, depth: 120, facing: bearing(260), id: 'garrison', name: 'Carleton’s garrison in the Upper Town, about 1,800 regulars, militia and sailors' },
    ],
    arrows: [
      { side: 'usa', path: QP([[-71.2290, 46.7935], [-71.2230, 46.7965], [-71.2165, 46.8005], [-71.2128, 46.8034]]), width: 72, id: 'montgomery-route', name: 'Montgomery leads his column from Wolfe’s Cove towards Près-de-Ville' },
      { side: 'usa', path: QP([[-71.2120, 46.8176], [-71.2075, 46.8170], [-71.2045, 46.8166]]), width: 72, id: 'arnold-route', name: 'Arnold passes under the walls by the Palace Gate towards the Sault-au-Matelot' },
    ],
  },
  markers: {
    'canada-assault-montgomery': mk([-71.2235, 46.8005], 'Montgomery', 'From Wolfe’s Cove, about 300 men', 'usa'),
    'canada-assault-arnold': mk([-71.2190, 46.8200], 'Arnold', 'From Saint-Roch, about 600 men', 'usa'),
    'canada-assault-carleton': mk([-71.2080, 46.8100], 'Carleton', 'Bells ring the alarm', 'held'),
    'canada-assault-brown': mk([-71.2125, 46.8040], 'Brown', 'Rockets give the signal', 'usa', 'flame'),
  },
});

// --- the blockhouse and the barricades ---
writePlan(`${G}/032-canada-lower-town`, {
  bbox,
  emblem: {
    water: [stCharles], works,
    units: [
      { side: 'usa', type: 'infantry', at: Q([-71.2165, 46.8008]), width: 50, depth: 260, facing: bearing(225), id: 'montgomery', name: 'Montgomery’s column, falling back to the Plains of Abraham under Campbell' },
      { side: 'usa', type: 'infantry', at: Q([-71.2042, 46.8146]), width: 70, depth: 150, facing: bearing(190), id: 'morgan', name: 'Morgan’s men, past the first barricade and held at the second' },
      { side: 'held', type: 'infantry', at: Q([-71.2046, 46.8126]), width: 120, depth: 50, facing: bearing(20), id: 'caldwell', name: 'Caldwell’s militia, Royal Highland Emigrants and the 7th Foot at the second barricade' },
      { side: 'held', type: 'infantry', at: Q([-71.2085, 46.8172]), width: 60, depth: 220, facing: bearing(90), id: 'laws', name: 'Captain Laws with 500 men out of the Palace Gate' },
      { side: 'usa', type: 'infantry', at: Q([-71.2120, 46.8178]), width: 50, depth: 120, facing: bearing(95), id: 'dearborn', name: 'Dearborn’s company, cut off and captured' },
    ],
    arrows: [
      { side: 'usa', path: QP([[-71.2140, 46.8020], [-71.2200, 46.7985], [-71.2260, 46.7950]]), width: 64, style: 'dashed', id: 'montgomery-retreat', name: 'Campbell leads the column back after Montgomery is killed' },
      { side: 'held', path: QP([[-71.2100, 46.8170], [-71.2065, 46.8168], [-71.2045, 46.8162]]), width: 64, id: 'laws-sortie', name: 'Laws retakes the first barricade behind Morgan' },
    ],
    clashes: [{ at: Q([-71.2116, 46.8043]), size: 96 }, { at: Q([-71.2044, 46.8132]), size: 96 }, { at: Q([-71.2034, 46.8156]), size: 72 }],
  },
  markers: {
    'canada-lower-town-montgomery': mk([-71.2150, 46.8045], 'Montgomery', 'Killed by grapeshot at the blockhouse', 'usa', 'skull'),
    'canada-lower-town-arnold': mk([-71.2030, 46.8175], 'Arnold', 'Wounded, hands over to Morgan', 'usa'),
    'canada-lower-town-morgan': mk([-71.2010, 46.8140], 'Morgan', 'Surrenders by 10 a.m.', 'usa', 'skull'),
    'canada-lower-town-caldwell': mk([-71.2070, 46.8118], 'Caldwell', 'Holds the second barricade', 'held'),
  },
});
console.log('quebec plans written', JSON.stringify(bbox));
