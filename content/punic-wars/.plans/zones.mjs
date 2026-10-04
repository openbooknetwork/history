// The political map: one set of zones per period, written to shared/zones/, with the page map in .plans/zones.yaml.
// Zone names are English here; their Turkish lives in i18n/tr.yaml. Run from the story folder: node .plans/zones.mjs
// Pieces are rough polygons over land and sea; the build clips them to the coast. A zone with land in several places
// joins its pieces with thin corridors through open sea, so it stays one Polygon. A higher priority zone is drawn
// exactly along the border; the lower priority neighbour overlaps it and is cut there by the build.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';

const story = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const poly = pts => turf.polygon([[...pts, pts[0]]]);
const sea = (pts, km = 4) => turf.buffer(turf.lineString(pts), km, { units: 'kilometers' });
const join = (...parts) => {
  parts = parts.flat();
  const u = turf.union(turf.featureCollection(parts));
  if (u.geometry.type === 'Polygon') return u;
  const main = turf.polygon(u.geometry.coordinates.sort((x, y) => turf.area(turf.polygon(y)) - turf.area(turf.polygon(x)))[0]);
  const loose = parts.map((q, i) => turf.booleanIntersects(q, main) ? null : `${i} at ${turf.centroid(q).geometry.coordinates.map(c => c.toFixed(2))}`).filter(Boolean);
  throw new Error(`pieces do not connect: ${loose.join('; ')}`);
};
const cut = (a, b) => turf.intersect(turf.featureCollection([a, b]));
const minus = (a, b) => turf.difference(turf.featureCollection([a, b]));

// --- Italy and the islands ---
const ARNO = [[10.27, 43.68], [10.6, 43.75], [10.9, 43.85], [11.25, 44.0], [11.6, 44.07], [12.0, 44.07], [12.42, 44.17]];
const STRAIT = [[15.70, 38.32], [15.685, 38.27], [15.60, 38.20], [15.58, 38.10]];   // the middle of the Strait of Messina, north to south
const italy = poly([[9.95, 43.68], ...ARNO, [12.75, 44.25], [13.6, 43.75], [14.4, 43.0], [15.2, 42.35], [16.1, 42.25], [16.6, 41.75], [17.5, 41.3],
  [18.3, 40.75], [18.75, 40.15], [18.55, 39.65], [17.6, 38.95], [16.7, 37.75], [16.0, 37.75], [15.62, 37.88], ...STRAIT.slice().reverse(),
  [15.75, 38.45], [15.75, 38.75], [15.85, 39.1], [15.6, 39.6], [15.4, 39.9], [15.0, 40.05], [14.6, 40.2], [13.7, 40.55], [13.5, 40.75], [12.8, 40.75],
  [12.7, 40.95], [11.7, 41.8], [10.8, 42.25], [10.0, 42.6], [9.95, 42.85]]);
// Italy to the Alps, for the years after the conquest of Cisalpine Gaul; the zone clips to the Italian border
const italyAll = poly([[9.95, 43.68], [7.6, 43.6], [7.55, 43.8], [7.6, 44.12], [6.95, 44.42], [7.1, 44.67], [6.8, 44.95], [6.95, 45.25], [6.95, 45.68], [6.9, 45.82],
  [7.0, 46.6], [10.5, 47.2], [12.5, 47.2], [13.9, 46.6], [13.9, 45.6], [13.5, 45.4], [13.0, 44.6], [13.6, 43.75], [14.4, 43.0], [15.2, 42.35], [16.1, 42.25],
  [16.6, 41.75], [17.5, 41.3], [18.3, 40.75], [18.75, 40.15], [18.55, 39.65], [17.6, 38.95], [16.7, 37.75], [16.0, 37.75], [15.62, 37.88], ...STRAIT.slice().reverse(),
  [15.75, 38.45], [15.75, 38.75], [15.85, 39.1], [15.6, 39.6], [15.4, 39.9], [15.0, 40.05], [14.6, 40.2], [13.7, 40.55], [13.5, 40.75], [12.8, 40.75],
  [12.7, 40.95], [11.7, 41.8], [10.8, 42.25], [10.0, 42.6], [9.95, 42.85]]);
const sicily = poly([[11.85, 37.9], [11.95, 38.25], [12.7, 38.3], [13.5, 38.3], [14.2, 38.25], [14.95, 38.3], [15.15, 38.32], ...STRAIT,
  [15.62, 37.88], [15.7, 37.4], [15.5, 36.55], [14.5, 36.55], [12.6, 37.25], [12.1, 37.4]]);
// dividing lines across Sicily, north to south, each starting and ending at sea
const L264 = [[13.85, 38.5], [13.85, 38.0], [13.95, 37.7], [13.85, 37.45], [13.73, 37.15], [13.73, 36.8]];   // the Himera and Halycus line, the Carthaginian west
const L262 = [[14.3, 38.5], [14.3, 38.02], [14.4, 37.6], [14.3, 37.3], [14.25, 37.05], [14.25, 36.8]];        // the Roman side after the first campaigns
const L256 = [[13.85, 38.5], [13.85, 38.0], [13.6, 37.6], [13.4, 37.38], [13.4, 36.9]];                      // Agrigentum Roman, Heraclea Minoa Carthaginian
const L250 = [[12.85, 38.5], [12.85, 38.06], [12.8, 37.85], [12.72, 37.6], [12.72, 37.3]];                   // Panormus and Selinus Roman, Lilybaeum and Drepana Carthaginian
const west = L => cut(sicily, poly([...L, [11.0, 36.6], [11.0, 38.6]]));
const east = L => cut(sicily, poly([...L, [16.5, 36.6], [16.5, 38.6]]));
const aeolian = poly([[14.2, 38.4], [14.2, 38.9], [15.35, 38.9], [15.35, 38.34], [14.9, 38.34]]);
const malta = poly([[14.05, 35.7], [14.05, 36.15], [14.7, 36.15], [14.7, 35.7]]);
const pantelleria = poly([[11.8, 36.65], [11.8, 36.92], [12.1, 36.92], [12.1, 36.65]]);
const sardCorsica = poly([[7.9, 38.7], [9.95, 38.7], [9.95, 41.25], [9.75, 41.4], [9.75, 43.15], [9.2, 43.15], [8.4, 42.4], [8.3, 41.3], [7.9, 40.9]]);
const syracuseCore = join(poly([[15.09, 37.40], [14.95, 37.35], [14.8, 37.2], [14.78, 37.0], [14.85, 36.85], [14.88, 36.72], [14.88, 36.55], [15.5, 36.55], [15.6, 37.4]]),
  poly([[15.18, 37.80], [15.18, 37.90], [15.30, 37.93], [15.5, 37.92], [15.5, 37.78]]), sea([[15.52, 37.38], [15.52, 37.82]]));   // with Tauromenium
const messana = poly([[15.05, 38.17], [15.15, 38.05], [15.3, 37.97], [15.42, 37.98], [15.5, 37.98], ...STRAIT.slice().reverse(), [15.4, 38.33], [15.05, 38.32]]);
const agrigentum = poly([[13.0, 37.15], [13.12, 37.47], [13.3, 37.6], [13.6, 37.52], [13.85, 37.3], [13.88, 37.12], [13.88, 36.9]]);
// Southern Italy on Hannibal's side after Cannae: Bruttium, Lucania, the Hirpini and Tarentum, the Capuan plain and Arpi with Salapia,
// joined through the sea. Rhegium, Naples, Nola, Venusia, Luceria, Beneventum, Canusium and Brundisium stay outside.
const hannibalSouth = poly([[14.85, 40.25], [14.9, 40.38], [14.98, 40.38], [15.25, 40.6], [15.0, 40.85], [15.0, 41.05], [15.3, 41.12], [15.55, 41.0], [15.68, 40.85],
  [15.75, 40.75], [16.2, 40.7], [16.6, 40.7], [16.95, 40.62], [17.4, 40.62], [17.6, 40.3], [17.5, 39.9], [17.4, 39.2], [17.0, 38.6], [16.5, 38.0], [16.1, 37.8],
  [15.88, 37.84], [15.88, 37.9], [15.92, 38.42], [15.75, 38.5], [15.75, 38.75], [15.85, 39.1], [15.6, 39.6], [15.4, 39.9], [15.15, 40.0]]);
const capuanPlain = poly([[13.85, 40.95], [14.05, 40.98], [14.45, 41.0], [14.45, 41.22], [14.1, 41.25], [13.95, 41.15], [13.8, 41.1]]);
const arpi = poly([[15.45, 41.42], [15.5, 41.62], [15.85, 41.66], [16.05, 41.66], [16.3, 41.42], [16.1, 41.32], [15.85, 41.28], [15.55, 41.28]]);
const hannibal212 = join(hannibalSouth, capuanPlain, arpi, sea([[13.82, 41.0], [13.6, 40.7], [13.8, 40.3], [14.6, 40.1], [14.88, 40.25]]),
  sea([[16.25, 41.5], [17.2, 41.35], [18.2, 40.75], [18.75, 40.1], [18.5, 39.65], [17.9, 39.85], [17.55, 40.1]]));
const bruttium = poly([[15.4, 39.9], [15.8, 39.9], [16.15, 39.85], [16.5, 39.72], [16.9, 39.8], [17.4, 39.2], [17.0, 38.6], [16.5, 38.0], [16.1, 37.8],
  [15.88, 37.84], [15.88, 37.9], [15.92, 38.42], [15.75, 38.5], [15.75, 38.75], [15.85, 39.1], [15.6, 39.6]]);
// Cisalpine Gaul from the Alps to the Apennines and the Adige; Rome cuts it along the Arno and Rubicon line
const cisalpine = poly([[6.5, 44.4], [6.5, 45.9], [8.0, 46.5], [9.5, 46.6], [10.5, 46.6], [11.3, 46.3], [11.8, 45.8], [12.1, 45.3], [12.45, 45.0], [12.8, 44.9],
  [12.8, 44.0], [12.3, 43.7], [11.0, 43.82], [10.75, 43.95], [10.3, 44.2], [9.6, 44.5], [8.8, 44.55], [8.0, 44.45], [7.6, 44.3]]);
const massalia = poly([[4.5, 43.2], [4.55, 43.5], [5.0, 43.58], [5.5, 43.5], [6.0, 43.3], [6.5, 43.35], [7.0, 43.68], [7.35, 43.8], [7.45, 43.55], [6.8, 43.0], [5.4, 42.85]]);

// --- Africa ---
const EMPORIA = [[10.25, 33.55], [11.0, 33.15], [11.6, 32.75], [12.5, 32.45], [13.5, 32.4], [14.3, 32.2], [15.0, 31.95], [15.7, 31.35], [16.6, 30.85], [17.5, 30.55],
  [18.55, 30.15], [18.95, 30.0], [19.0, 31.0], [17.0, 31.6], [15.6, 32.7], [13.5, 33.1], [11.5, 33.7]];
const TUNIS_SEA = [[11.4, 34.5], [11.6, 35.3], [11.5, 36.3], [11.4, 37.15], [10.6, 37.45], [9.8, 37.5], [9.0, 37.45], [8.75, 37.25]];
// before 201: to Sicca and Theveste, the Byzacium and the Emporia on the Libyan coast
const africaOld = poly([[8.75, 36.96], [8.85, 36.65], [8.6, 36.25], [8.35, 35.75], [8.1, 35.35], [8.5, 34.85], [9.2, 34.35], [9.9, 33.95], ...EMPORIA, ...TUNIS_SEA]);
// after the peace of 201: Thugga and the west go to Masinissa, the Emporia stay Carthaginian until 161
const africa201 = poly([[8.75, 36.96], [9.05, 36.6], [9.35, 36.35], [9.45, 35.9], [9.6, 35.35], [9.5, 34.8], [9.3, 34.35], [9.9, 33.95], ...EMPORIA, ...TUNIS_SEA]);
// 150 and the province of 146: inside the line later marked by the Fossa Regia, from Thabraca to Thenae
const africa150 = poly([[8.75, 36.96], [9.05, 36.6], [9.35, 36.35], [9.5, 35.95], [9.8, 35.45], [10.25, 35.0], [10.6, 34.62], [11.0, 34.5], [11.6, 35.3], ...TUNIS_SEA.slice(2)]);
// the trading towns along the coast of Numidia and Mauretania, to Tingis
const africaCoast = poly([[9.1, 37.35], [9.1, 36.8], [8.6, 36.75], [7.8, 36.65], [6.9, 36.65], [5.8, 36.6], [5.1, 36.55], [3.9, 36.7], [3.0, 36.55], [2.2, 36.4], [1.3, 36.3],
  [0.1, 35.7], [-0.6, 35.5], [-1.85, 34.9], [-2.9, 35.0], [-3.9, 35.05], [-5.3, 35.4], [-5.85, 35.55], [-6.0, 35.7], [-6.0, 35.95], [-5.5, 35.98], [-3.0, 35.5],
  [-0.6, 36.0], [1.3, 36.85], [3.0, 37.1], [5.1, 37.05], [6.9, 37.2], [8.0, 37.15]]);
const NUMIDIA_NORTH = [[-2.35, 35.12], [-2.35, 35.6], [0.0, 36.1], [2.0, 36.95], [5.0, 37.15], [7.0, 37.2], [8.9, 37.3], [9.6, 37.4], [10.3, 36.5], [10.7, 35.5], [10.6, 34.9]];
const numidia = poly([...NUMIDIA_NORTH, [10.2, 34.2], [10.2, 33.4], [8.5, 33.6], [6.0, 34.2], [3.0, 34.0], [0.0, 34.0], [-2.4, 34.1]]);
// from 161 the kingdom also holds the Emporia and the coast of the Gulf of Sirte
const numidiaWide = poly([...NUMIDIA_NORTH, [11.0, 34.0], [11.6, 33.8], [13.0, 33.2], [15.5, 32.8], [19.0, 31.0], [18.9, 29.9], [16.5, 30.6], [15.0, 31.3], [13.0, 31.9],
  [11.5, 32.3], [10.2, 33.2], [8.5, 33.6], [6.0, 34.2], [3.0, 34.0], [0.0, 34.0], [-2.4, 34.1]]);
// Masinissa's kingdom in 202: the Massylian east from the Ampsaga, with Cirta
const massylia = poly([[6.2, 37.2], [6.25, 36.85], [6.05, 36.4], [5.85, 35.5], [5.6, 34.2], [8.5, 33.6], [10.2, 33.4], [10.2, 34.2], [9.8, 35.0], [9.6, 36.0], [9.6, 37.4], [7.0, 37.25]]);

// --- Iberia ---
const IBERIA_SOUTH_SEA = [[-7.42, 36.9], [-6.6, 36.3], [-6.0, 35.98], [-5.5, 35.98], [-4.4, 36.45], [-3.0, 36.55], [-1.9, 36.6], [-1.4, 37.15], [-1.0, 37.45],
  [-0.8, 37.66], [-0.79, 37.8], [-0.7, 37.9], [-0.5, 38.0], [-0.2, 38.3],
  [0.5, 38.5], [0.5, 38.9]];
const GUADIANA = [[-7.0, 39.4], [-7.2, 38.9], [-7.45, 38.4], [-7.45, 37.6], [-7.42, 37.18]];
// Hasdrubal's domain at his death in 221, to the Tagus
// ends at Dénia, the Greek Hemeroskopeion, so the domain keeps no sliver east of 0°
const barcid221 = poly([[-0.02, 39.25], [-0.23, 39.25], [-0.9, 39.35], [-1.8, 39.6], [-2.8, 39.95], [-3.7, 40.0], [-4.3, 39.88], [-5.1, 39.85], [-5.9, 39.75], [-6.6, 39.55],
  ...GUADIANA, ...IBERIA_SOUTH_SEA.slice(0, -2), [-0.02, 38.45]]);
// 218: to the Ebro on the coast and Salmantica inland, after Hannibal's campaigns of 221 and 220
const barcid218 = poly([[1.2, 40.72], [0.86, 40.72], [0.35, 40.85], [-0.4, 40.75], [-1.2, 40.6], [-2.2, 40.65], [-3.2, 40.85], [-4.2, 41.0], [-5.0, 41.15], [-5.7, 41.15],
  [-6.3, 40.85], [-6.8, 40.3], ...GUADIANA, ...IBERIA_SOUTH_SEA, [0.5, 39.9], [1.0, 40.4]]);
// 206: the lower Baetis, Gades and the coast to Malaca, before Ilipa
const baetica206 = poly([[-1.3, 37.5], [-1.5, 38.0], [-3.0, 38.3], [-4.0, 38.4], [-5.0, 38.55], [-6.5, 38.65], [-7.45, 38.4], [-7.45, 37.6], [-7.42, 37.18], ...IBERIA_SOUTH_SEA,
  [0.5, 39.9], [0.2, 39.25], [-0.23, 39.25]]);
const spainCoast = poly([[-6.45, 36.9], [-5.95, 36.75], [-5.6, 36.35], [-5.2, 36.6], [-4.6, 36.95], [-4.0, 36.95], [-3.4, 36.95], [-2.8, 37.0], [-2.3, 37.05], [-1.85, 37.4],
  [-1.75, 37.4], [-1.5, 37.3], [-1.9, 36.6], [-3.0, 36.55], [-4.4, 36.45], [-5.2, 36.15], [-5.5, 35.98], [-6.0, 36.0], [-6.5, 36.3], [-6.6, 36.6]]);
const balearics = poly([[1.0, 38.55], [1.0, 39.15], [2.0, 39.75], [3.0, 40.05], [4.45, 40.15], [4.45, 39.7], [3.4, 39.2], [2.6, 39.1], [1.6, 38.55]]);
const saguntum = poly([[-0.45, 39.58], [-0.48, 39.75], [-0.3, 39.82], [-0.1, 39.78], [0.0, 39.6], [-0.25, 39.55]]);
const NE_STRIP = [[3.5, 42.45], [3.15, 42.43], [2.6, 42.4], [1.9, 42.15], [1.2, 41.75], [0.6, 41.3]];
const romeIberia215 = poly([...NE_STRIP, [0.4, 40.9], [0.86, 40.72], [1.3, 40.65], [2.5, 41.2], [3.5, 41.8]]);
const romeIberia209 = poly([...NE_STRIP, [0.3, 40.9], [-0.2, 40.5], [-0.75, 39.9], [-1.0, 39.4], [-1.15, 38.8], [-1.35, 38.3], [-1.45, 37.85], [-1.3, 37.5], [-1.3, 37.3],
  [-0.5, 37.45], [-0.2, 38.3], [0.5, 38.5], [0.5, 38.9], [0.5, 39.9], [1.0, 40.4], [2.5, 41.2], [3.5, 41.8]]);
const romeIberia206 = poly([...NE_STRIP, [0.3, 40.9], [-0.2, 40.5], [-0.75, 39.9], [-1.6, 39.5], [-2.6, 39.0], [-3.4, 38.6], [-3.9, 38.2], [-3.6, 37.75], [-2.6, 37.4],
  [-2.0, 36.95], [-1.8, 36.65], [-0.5, 37.45], [-0.2, 38.3], [0.5, 38.5], [0.5, 38.9], [0.5, 39.9], [1.0, 40.4], [2.5, 41.2], [3.5, 41.8]]);

// --- the east, for Hannibal's exile ---
const macedon = poly([[20.5, 40.45], [20.6, 41.2], [21.0, 41.95], [22.5, 42.15], [23.2, 42.0], [24.0, 41.7], [24.8, 41.35], [24.8, 40.75], [24.9, 40.6], [24.2, 39.9],
  [23.5, 39.85], [22.9, 39.95], [22.4, 39.9], [21.5, 40.0], [21.0, 40.1]]);
const seleucid = poly([[26.0, 38.8], [26.75, 38.8], [27.5, 38.75], [28.0, 39.0], [29.0, 39.2], [30.0, 39.2], [31.0, 38.95], [32.6, 38.7], [32.6, 35.9], [29.0, 35.8],
  [27.5, 36.3], [26.5, 36.9], [25.9, 37.8]]);
const bithynia = poly([[29.1, 41.25], [31.3, 41.4], [31.3, 40.4], [30.6, 39.85], [29.4, 39.8], [28.6, 40.1], [28.5, 40.45], [29.0, 40.85], [29.08, 40.95]]);

// --- corridors through open sea ---
const C = {
  sicilyTunis: sea([[11.0, 37.15], [11.95, 36.8], [12.4, 37.4]]), pantelleria: sea([[11.0, 37.1], [11.95, 36.8]]), sardinia: sea([[9.6, 37.45], [9.2, 38.8]]),
  malta: sea([[11.4, 36.6], [14.1, 35.9]]), strait: sea([[-5.7, 35.8], [-5.7, 36.2]]), balearicsAfrica: sea([[3.0, 37.0], [3.0, 39.3]]),
  aeolianWest: sea([[14.2, 38.6], [13.5, 38.45], [13.2, 38.22]]), balearicsTunis: sea([[9.5, 37.45], [4.5, 38.2], [4.0, 39.7]]), balearicsIberia: sea([[1.2, 38.9], [0.45, 38.9]]),
  italySardinia: sea([[11.6, 41.95], [9.6, 41.9]]), sicilyMalta: sea([[14.6, 36.6], [14.5, 36.1]]), sicilyPantelleria: sea([[12.4, 37.4], [11.95, 36.8]]), aeolianSicily: sea([[14.95, 38.45], [14.95, 38.22]]),
};
const carthageSea = [africaOld, africaCoast, balearics, spainCoast, malta, pantelleria, C.pantelleria, C.malta, C.strait, C.balearicsAfrica];
const romeIslands = [italy, sicily, aeolian, sardCorsica, C.italySardinia, C.aeolianSicily];

// --- the periods: zone id -> [family, English name, Turkish name, geometry, clip] ---
const Z = {};
const zone = (id, family, en, geometry, clip) => { Z[id] = { family, en, geometry, clip }; };
const SYR = 'Syracuse under Hiero II, allied to Rome from 263 BC';
const CARTH = y => `Carthage and its territory, ${y} BC`;

zone('rome-264', 'rome', 'Rome and its Italian allies, 264 BC', italy);
zone('carthage-264', 'carthage', CARTH(264), join(...carthageSea, sardCorsica, west(L264), aeolian, C.sicilyTunis, C.sardinia, C.aeolianWest));
zone('syracuse-264', 'syracuse', 'Syracuse under Hiero II', syracuseCore);
zone('messana-264', 'other', 'Messana, held by the Mamertines', messana);

zone('rome-262', 'rome', 'Rome and the Sicilian towns on its side, 262 BC', join(italy, east(L262)));
zone('carthage-262', 'carthage', CARTH(262), join(...carthageSea, sardCorsica, west(L264), aeolian, C.sicilyTunis, C.sardinia, C.aeolianWest));
zone('syracuse-262', 'syracuse', SYR, syracuseCore);

zone('rome-256', 'rome', 'Rome and Roman Sicily, 256 BC', join(italy, east(L256)));
zone('carthage-256', 'carthage', CARTH(256), join(...carthageSea, sardCorsica, west([[14.0, 38.5], [14.0, 36.8]]), aeolian, C.sicilyTunis, C.sardinia, C.aeolianWest));
zone('syracuse-256', 'syracuse', SYR, syracuseCore);

zone('rome-250', 'rome', 'Rome and Roman Sicily, 250 BC', join(italy, east(L250), aeolian, C.aeolianSicily));
zone('carthage-250', 'carthage', CARTH(250), join(...carthageSea, sardCorsica, west([[13.3, 38.5], [13.3, 36.8]]), C.sicilyTunis, C.sardinia));
zone('syracuse-250', 'syracuse', SYR, syracuseCore);

zone('rome-238', 'rome', 'Rome with Sicily, Sardinia and Corsica, 238 BC', join(...romeIslands));
zone('carthage-238', 'carthage', CARTH(238), join(...carthageSea));
zone('syracuse-238', 'syracuse', 'Syracuse under Hiero II, allied to Rome', syracuseCore);

zone('carthage-221', 'carthage', 'Carthage and the Barcid domain in Iberia, 221 BC',
  join(africaOld, africaCoast, balearics, barcid221, malta, pantelleria, C.pantelleria, C.malta, C.strait, C.balearicsAfrica, sea([[1.2, 39.0], [0.3, 39.15], [-0.05, 39.15]])));

zone('rome-225', 'rome', 'Rome and its allies, 225 BC', join(...romeIslands));
zone('gauls-225', 'gauls', 'Cisalpine Gaul: the Boii, the Insubres and their neighbours', cisalpine, ['Italy', 'Switzerland']);

zone('carthage-219', 'carthage', 'Carthage and the Barcid domain in Iberia, 219 BC',
  join(africaOld, africaCoast, balearics, barcid218, malta, pantelleria, C.pantelleria, C.malta, C.strait, C.balearicsAfrica, C.balearicsIberia));
zone('rome-saguntum-219', 'rome', 'Saguntum, allied to Rome', saguntum);

zone('rome-218', 'rome', 'Rome and its allies, 218 BC', join(...romeIslands, malta, C.sicilyMalta));
zone('gauls-218', 'gauls', 'Cisalpine Gaul, the Boii and Insubres in revolt, 218 BC', cisalpine, ['Italy', 'Switzerland']);
zone('carthage-218', 'carthage', 'Carthage and the Barcid domain in Iberia, 218 BC',
  join(africaOld, africaCoast, balearics, barcid218, pantelleria, C.pantelleria, C.strait, C.balearicsAfrica, C.balearicsIberia));
zone('massalia-218', 'other', 'Massalia, a Greek city allied to Rome', massalia, ['France']);

zone('carthage-215', 'carthage', 'Carthage and Carthaginian Iberia, 215 BC',
  join(africaOld, africaCoast, balearics, barcid218, C.strait, C.balearicsAfrica, C.balearicsIberia));
zone('rome-iberia-215', 'rome', 'Roman-held coast north of the Ebro, 218 – 211 BC', romeIberia215);

const rome212 = join(...romeIslands, malta, pantelleria, C.sicilyMalta, C.sicilyPantelleria);
zone('rome-212', 'rome', 'Rome and its loyal allies, 212 BC', rome212);
zone('hannibal-212', 'hannibal', 'Italian cities on Hannibal’s side, 216 – 211 BC', hannibal212, ['Italy']);

zone('rome-214', 'rome', 'Roman Sicily, 213 BC', minus(rome212, agrigentum));
zone('syracuse-214', 'syracuse', 'Syracuse, allied to Carthage from 214 BC', syracuseCore);
zone('carthage-213', 'carthage', 'Agrigentum and the south coast, held by Carthage from 213 BC', agrigentum);

zone('carthage-209', 'carthage', 'Carthaginian Iberia, 209 BC', join(africaOld, balearics, barcid218, C.balearicsTunis, C.balearicsIberia));
zone('rome-iberia-209', 'rome', 'Roman Iberia after the fall of New Carthage, 209 BC', romeIberia209);

zone('carthage-206', 'carthage', 'Carthaginian Iberia, 206 BC', join(africaOld, balearics, baetica206, C.balearicsTunis, C.balearicsIberia));
zone('rome-iberia-206', 'rome', 'Roman Iberia, 206 BC', romeIberia206);

zone('rome-207', 'rome', 'Rome and its allies, 207 BC', rome212);
zone('gauls-207', 'gauls', 'Cisalpine Gaul, 207 BC', cisalpine, ['Italy', 'Switzerland']);
zone('hannibal-207', 'hannibal', 'Bruttium, held by Hannibal, 207 BC', bruttium, ['Italy']);

zone('rome-203', 'rome', 'Rome and its allies, 204 BC', rome212);
zone('carthage-203', 'carthage', 'Carthage and its African territory, 204 BC', africaOld);
zone('numidia-203', 'numidia', 'Numidia under Syphax, 204 BC', numidia);
zone('rome-202', 'rome', 'Rome and its allies, 202 BC', rome212);
zone('carthage-202', 'carthage', 'Carthage and its African territory, 202 BC', africaOld);
zone('numidia-202', 'numidia', 'Masinissa’s kingdom, 202 BC', massylia);

const romeAll = join(italyAll, sicily, aeolian, sardCorsica, malta, pantelleria, C.aeolianSicily, C.italySardinia, C.sicilyMalta, C.sicilyPantelleria);
const ROME_CLIP = ['Italy', 'San Marino', 'Vatican', 'Malta', 'France'];
zone('rome-192', 'rome', 'Rome and its provinces, 192 BC', romeAll, ROME_CLIP);
zone('carthage-192', 'carthage', 'Carthage after the peace of 201 BC', africa201);
zone('numidia-192', 'numidia', 'Numidia under Masinissa', numidia);
zone('macedon-192', 'macedon', 'Macedon under Philip V after 196 BC', macedon, ['Greece', 'Macedonia', 'Bulgaria', 'Albania']);
zone('seleucid-192', 'seleucid', 'Seleucid lands of Antiochus III in Asia Minor, 192 BC', seleucid, ['Turkey']);
zone('bithynia-192', 'other', 'Bithynia under Prusias I', bithynia, ['Turkey']);

zone('rome-150', 'rome', 'Rome and its provinces, 150 BC', romeAll, ROME_CLIP);
zone('carthage-150', 'carthage', 'Carthage, 150 BC', africa150);
zone('numidia-150', 'numidia', 'Numidia under Masinissa, 150 BC', numidiaWide);

zone('rome-149', 'rome', 'Rome and its provinces, 149 BC', romeAll, ROME_CLIP);
zone('carthage-149', 'carthage', 'Carthage, 149 BC', africa150);
zone('numidia-149', 'numidia', 'Numidia, 149 BC', numidiaWide);

zone('rome-146', 'rome', 'Rome and the new province of Africa, 146 BC', join(romeAll, africa150, C.sicilyTunis), [...ROME_CLIP, 'Tunisia']);
zone('numidia-146', 'numidia', 'Numidia, divided among Masinissa’s sons', numidiaWide);

// --- which strategic page shows which period; close battle views and phase pages show none ---
const PAGES = {
  carthage: ['rome-264', 'carthage-264', 'syracuse-264'], italy: ['rome-264', 'carthage-264', 'syracuse-264'],
  messana: ['rome-264', 'carthage-264', 'syracuse-264', 'messana-264'],
  agrigentum: ['rome-262', 'carthage-262', 'syracuse-262'], mylae: ['rome-262', 'carthage-262', 'syracuse-262'],
  ecnomus: ['rome-256', 'carthage-256', 'syracuse-256'],
  panormus: ['rome-250', 'carthage-250', 'syracuse-250'],
  sardinia: ['rome-238', 'carthage-238', 'syracuse-238'],
  iberia: ['carthage-221'],
  telamon: ['rome-225', 'gauls-225'],
  saguntum: ['carthage-219', 'rome-saguntum-219'],
  alps: ['rome-218', 'gauls-218', 'massalia-218', 'carthage-218'],
  ebro: ['carthage-215', 'rome-iberia-215'],
  capua: ['rome-212', 'hannibal-212'],
  syracuse: ['rome-214', 'syracuse-214', 'carthage-213'],
  'new-carthage': ['carthage-209', 'rome-iberia-209'],
  metaurus: ['rome-207', 'gauls-207', 'hannibal-207'],
  ilipa: ['carthage-206', 'rome-iberia-206'],
  'great-plains': ['rome-203', 'carthage-203', 'numidia-203'],
  zama: ['rome-202', 'carthage-202', 'numidia-202'],
  'hannibal-exile': ['rome-192', 'carthage-192', 'numidia-192', 'macedon-192', 'seleucid-192', 'bithynia-192'],
  masinissa: ['rome-150', 'carthage-150', 'numidia-150'],
  'siege-of-carthage': ['rome-149', 'carthage-149', 'numidia-149'],
  'africa-province': ['rome-146', 'numidia-146'],
  // regional phase and aftermath pages, with the set of their year
  'regulus-aftermath': ['rome-256', 'carthage-256', 'syracuse-256'],
  'lilybaeum-aftermath': ['rome-250', 'carthage-250', 'syracuse-250'],
  'ebro-upper-baetis': ['carthage-215', 'rome-iberia-215'],
  'capua-rome': ['rome-212', 'hannibal-212'],
  'new-carthage-baecula': ['carthage-209', 'rome-iberia-209'],
  'metaurus-aftermath': ['rome-207', 'gauls-207', 'hannibal-207'],
  'ilipa-pursuit': ['carthage-206', 'rome-iberia-206'],
  'great-plains-cirta': ['rome-203', 'carthage-203', 'numidia-203'],
  'zama-peace': ['rome-192', 'carthage-192', 'numidia-192'],
};

// --- write ---
const densify = (ring, step = 0.2) => ring.flatMap((p, i) => {
  if (i === ring.length - 1) return [p];
  const q = ring[i + 1], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step));
  return [...Array(n)].map((_, k) => [p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]);
});
const r4 = x => Math.round(x * 1e4) / 1e4;
const dir = path.join(story, 'shared', 'zones');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (const [id, z] of Object.entries(Z)) {
  const g = z.geometry.geometry ?? z.geometry;
  if (g.type !== 'Polygon') throw new Error(`${id}: ${g.type}`);
  const coordinates = g.coordinates.map(r => densify(r).map(p => p.map(r4)));
  const properties = { family: z.family, name: z.en, ...(z.clip ? { clip: z.clip } : {}) };
  fs.writeFileSync(path.join(dir, id + '.geojson'), JSON.stringify({ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates } }) + '\n');
}
for (const ids of Object.values(PAGES)) for (const id of ids) if (!Z[id]) throw new Error(`page map names unknown zone ${id}`);
fs.writeFileSync(path.join(story, '.plans', 'zones.yaml'), '# Zones per strategic page, written by .plans/zones.mjs. Close battle views and phase pages show none.\n'
  + Object.entries(PAGES).map(([p, ids]) => `${p}: [${ids.join(', ')}]`).join('\n') + '\n');
console.log(`${Object.keys(Z).length} zones, ${Object.keys(PAGES).length} pages`);
